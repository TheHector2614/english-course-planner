# Modelado NoSQL

DynamoDB, MongoDB, y patrones generales.

## Principio fundamental: access patterns first

En NoSQL **modelas para los queries que vas a hacer, NO para las entidades**.

Antes de modelar:
1. Listar TODOS los queries (search by ID, list user's orders, get pending orders, etc.)
2. Estimar frecuencia y latencia esperada
3. Diseñar el modelo para servir esos queries eficientemente

Cambiar el modelo después es caro. **Tiempo invertido en modelado al inicio = tiempo ahorrado después.**

## DynamoDB

### Conceptos

- **Table**: contenedor de items
- **Item**: registro (similar a row pero con schema flexible)
- **Attribute**: campo del item
- **Primary Key**:
  - **Partition Key** (HASH): determina partición física. Distribuye items
  - **Sort Key** (RANGE, opcional): ordena items dentro de una partición
- **Local Secondary Index (LSI)**: misma PK, distinto SK. Hasta 5/tabla, creados al crear tabla
- **Global Secondary Index (GSI)**: PK distinta. Hasta 20/tabla
- **Streams**: change data capture (CDC)

### Capacity modes

| | On-Demand | Provisioned |
|---|---|---|
| Cuándo | Tráfico impredecible o bajo | Tráfico predecible |
| Costo | $1.25/M writes, $0.25/M reads | Por RCU/WCU/hora |
| Escala | Instantánea | Auto-scaling configurable |
| Free tier | No aplica | 25 RCU + 25 WCU siempre |

**Recomendación inicial**: On-Demand. Migrar a Provisioned si los costos lo justifican.

### Single-Table Design

Patrón canónico en DynamoDB: **una tabla con múltiples tipos de items**.

#### Ejemplo: e-commerce

Tipos de items: User, Order, OrderItem, Product, Category.

Access patterns:
1. Get user by ID
2. Get all orders for user
3. Get order with items
4. Get product by ID
5. List products by category

Diseño:

| PK | SK | Type | Data |
|---|---|---|---|
| `USER#u1` | `USER#u1` | User | name=Alice, email=... |
| `USER#u1` | `ORDER#o1` | Order | total=100, status=paid |
| `USER#u1` | `ORDER#o2` | Order | total=200, status=pending |
| `ORDER#o1` | `ITEM#i1` | OrderItem | product=p5, qty=2 |
| `ORDER#o1` | `ITEM#i2` | OrderItem | product=p7, qty=1 |
| `PRODUCT#p1` | `PRODUCT#p1` | Product | name=..., price=... |

Queries:
1. **Get user**: `PK=USER#u1 AND SK=USER#u1`
2. **List user orders**: `PK=USER#u1 AND begins_with(SK, ORDER#)`
3. **Get order items**: `PK=ORDER#o1 AND begins_with(SK, ITEM#)`
4. **Get product**: `PK=PRODUCT#p1 AND SK=PRODUCT#p1`

Para "list products by category" → GSI con `category` como PK.

### GSI vs LSI

| | LSI | GSI |
|---|---|---|
| PK | Misma que tabla | Diferente |
| SK | Diferente | Diferente |
| Consistency | Strong o eventual | Eventual only |
| Capacity | Compartida con tabla | Independiente |
| Creación | Solo al crear tabla | En cualquier momento |
| Storage extra | Sí | Sí |
| Límite | 5 por tabla | 20 por tabla |

**Default**: usar GSIs. LSIs solo si necesitas strong consistency en el query.

### GSI sparse / overloaded

**Sparse**: GSI donde solo algunos items tienen el atributo. Resto no aparece en el índice.

```
Solo orders pending tienen el atributo `pendingSinceTime`:
GSI: pendingSinceTime (PK) + orderId (SK)
```

Permite query "lista pending orders ordenadas por antigüedad" sin scan.

**Overloaded**: misma columna usada para diferentes propósitos según tipo de item. Maximiza uso de GSIs limitados.

### Anti-patterns DynamoDB

- ❌ **Scan en producción**: full table scan, lento y caro
- ❌ **Hot partition**: todas las writes a una sola PK
- ❌ **No considerar patrón de acceso**: termina con full scan
- ❌ **Items > 400 KB**: límite duro
- ❌ **Atributos con nombres muy largos**: contan en tamaño y costo
- ❌ **No usar projections en GSIs**: copiar TODO siempre, más costo
- ❌ **Pensar en SQL**: si necesitas JOINs ad-hoc, DynamoDB no es la herramienta

### Buenas prácticas

✅ Naming: prefijos con `#` (`USER#u1`, `ORDER#o1`)
✅ ULIDs/KSUIDs en SK para orden temporal
✅ TTL para auto-eliminar items viejos
✅ Streams para CDC (sync a OpenSearch, etc.)
✅ Atomic counters cuando aplique (`UpdateItem` con `ADD`)
✅ Conditional writes para optimistic locking
✅ Transactions cuando atomicity matters (más caro)

### Single-Table vs Multi-Table

Aunque AWS evangeliza single-table, multi-table es válido:

**Single-table**:
- ✅ Menos costo (menos tables = menos baseline)
- ✅ Queries con varios "joins" (relations) en una operación
- ❌ Complejo de mantener
- ❌ Cambios de schema más difíciles

**Multi-table**:
- ✅ Más simple, fácil de razonar
- ✅ Permisos IAM granulares
- ❌ Más operaciones para "joins"

**Recomendación**: para apps complejas con muchas relaciones, single-table vale. Para casos simples, multi-table es OK.

Recurso: "The DynamoDB Book" (Alex DeBrie).

## MongoDB

### Conceptos

- **Database**: contenedor
- **Collection**: similar a tabla
- **Document**: similar a row, JSON-like (BSON internamente)
- **Field**: similar a columna
- **Index**: igual concepto que SQL
- **Aggregation Pipeline**: pipeline de transformaciones tipo SQL GROUP BY

### Modelado: embebido vs referencia

Pregunta clave: **¿se acceden juntos siempre?**

#### Embebido

```javascript
// User con sus addresses embebidas
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  addresses: [
    { street: "...", city: "Bogotá", country: "CO" },
    { street: "...", city: "Cali",  country: "CO" }
  ]
}
```

**Cuándo embeber**:
- Datos accedidos juntos siempre
- Relación 1:1 o 1:pocos
- Datos relativamente estables
- Suma de tamaños < 16 MB (límite de doc)

#### Referencia

```javascript
// Order con referencias a User y Products
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),    // referencia
  items: [
    { productId: ObjectId("..."), qty: 2 },
    { productId: ObjectId("..."), qty: 1 }
  ],
  total: 350,
  status: "paid"
}
```

**Cuándo referenciar**:
- Datos accedidos por separado
- Relación 1:muchos donde "muchos" es grande
- Datos compartidos por muchos parents
- Datos cambian frecuentemente y necesitan sincronización

#### Híbrido (denormalización selectiva)

Embeber lo que necesitas mostrar + referenciar para detalle completo:

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  userSnapshot: {              // copia de campos críticos al momento de la orden
    name: "Alice",
    email: "alice@example.com"
  },
  items: [
    {
      productId: ObjectId("..."),
      productSnapshot: { name: "Widget", price: 100 },  // por si cambia el price después
      qty: 2
    }
  ],
  total: 200
}
```

Patrón útil para órdenes históricas, facturas (snapshot inmutable).

### Patterns de modelado

**Bucket pattern**: agrupar series temporales en buckets.

```javascript
// Sensor reading cada minuto → bucket por hora
{
  _id: { sensorId: 1, hour: ISODate("2026-05-19T14:00:00Z") },
  measurements: [
    { time: "14:00", temp: 22.5 },
    { time: "14:01", temp: 22.6 },
    ...
  ]
}
```

**Outlier pattern**: usuarios "normales" embebidos, casos extremos referenciados.

```javascript
// Mayoría de posts tienen pocos likes
{ _id, content, likes: [user1, user2, ...] }

// Posts virales (>1000 likes) usan referencia
{ _id, content, likesRef: true, hasOverflow: true }
// Likes en otra collection: post_likes_overflow
```

**Computed pattern**: pre-calcular agregados.

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  ordersCount: 12,        // computado
  ordersTotal: 1500,      // computado
  // ...
}
```

Actualizar en cada nueva orden o vía Change Streams.

**Schema versioning**: campo `_schema_version` para evolución.

```javascript
{ _schema_version: 2, ... }
```

App lee versión y aplica lógica según schema.

### Indexes en MongoDB

```javascript
// Single field
db.users.createIndex({ email: 1 });  // 1 = asc, -1 = desc

// Compound
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Unique
db.users.createIndex({ email: 1 }, { unique: true });

// Sparse: solo docs con ese campo
db.users.createIndex({ phone: 1 }, { sparse: true });

// Partial: con condición
db.orders.createIndex(
  { userId: 1 },
  { partialFilterExpression: { status: "pending" } }
);

// TTL: auto-expirar
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Text (full-text)
db.articles.createIndex({ title: "text", body: "text" });

// Geo
db.locations.createIndex({ position: "2dsphere" });

// Wildcard (en cualquier subfield)
db.events.createIndex({ "metadata.$**": 1 });
```

**Verificar uso**:
```javascript
db.orders.find({ userId: ObjectId("...") }).explain("executionStats");
db.collection.aggregate([{ $indexStats: {} }]);  // estadísticas
```

### Aggregation Pipeline

Equivalente a SQL GROUP BY pero más flexible:

```javascript
db.orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-01-01") } } },
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
  }},
  { $unwind: "$user" },
  { $group: {
      _id: "$user.country",
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 },
      avgOrder: { $avg: "$total" }
  }},
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);
```

### Transactions

Disponibles desde MongoDB 4.0 (replica sets) y 4.2 (sharded).

```javascript
const session = client.startSession();
await session.withTransaction(async () => {
  await accounts.updateOne({ _id: from }, { $inc: { balance: -100 } }, { session });
  await accounts.updateOne({ _id: to },   { $inc: { balance:  100 } }, { session });
});
```

**Costo**: lock overhead. Usar solo cuando atomicity matters.

### Sharding

Distribuir collection en múltiples shards por **shard key**.

Elegir bien el shard key:
- **Alta cardinalidad** (muchos valores únicos)
- **Distribución uniforme** (no hot shards)
- **Match con queries** (queries con shard key son rápidas)

```javascript
sh.shardCollection("mydb.orders", { userId: "hashed" });
```

**Hashed shard key**: distribución uniforme pero queries por rango no funcionan.
**Ranged shard key**: queries por rango eficientes pero pueden generar hot shards.

### Anti-patterns MongoDB

- ❌ **Modelar pensando en SQL**: collections para cada "tabla", todo referenciado
- ❌ **Documents enormes** (acercándose a 16 MB)
- ❌ **Embeber arrays sin límite**: crecen para siempre
- ❌ **$lookup en queries críticas frecuentes**: similar a JOINs pero más caro
- ❌ **No usar indexes**: scans en collections grandes
- ❌ **No probar `.explain()`**: queries lentas sin diagnosticar
- ❌ **Cambiar el shard key después**: imposible sin migración compleja
- ❌ **No usar transactions cuando atomic matters**

## Comparación rápida DynamoDB vs MongoDB

| | DynamoDB | MongoDB |
|---|---|---|
| Esquema | Items con cualquier atributo | Documents BSON |
| Queries | Por PK o GSI | Más flexibles (filter, $lookup, agg) |
| Patterns de acceso | Definidos a priori | Más libres |
| Transactions | Limitadas | Completas (con costo) |
| Hosting | AWS managed | Atlas (multi-cloud), self-hosted |
| Pricing | Por uso | Por instancia |
| Use case típico | Apps serverless, high throughput predecible | Apps con documents flexibles, queries variadas |
| Learning curve | Más empinada (single-table design) | Más baja inicialmente |

## Modelado para queries: principios

1. **Listar todos los queries antes de modelar**
2. **Diseñar para el query más frecuente**
3. **Aceptar duplicación de datos para evitar joins/scans**
4. **Pre-computar agregaciones cuando se leen mucho más que se escriben**
5. **Time-series → patterns específicos (bucket, time-bucket)**
6. **Aprovechar prefixes/sorts para queries por rango**
7. **Tener un plan para queries no anticipadas** (secondary index, sync a search engine)

## Migración SQL → NoSQL: cuándo y cómo

**No migrar solo por "performance" o "escala"**. Razones reales:

- Patrón de acceso predecible y simple → DynamoDB
- Documents flexibles con schema variable → MongoDB
- Datos sin relaciones complejas → cualquier NoSQL
- Workload masivo donde RDBMS no aguanta vertical scaling → NoSQL distribuida

**No migrar si**:
- Tienes muchos queries ad-hoc
- Necesitas joins complejos frecuentes
- Tu equipo no conoce NoSQL
- El bottleneck es de diseño (no de tecnología)

**Estrategia de migración**:

1. **Identificar bounded contexts** que pueden ir a NoSQL primero
2. **Dual write** durante transición
3. **Cutover gradual** por feature
4. **No big bang**

## Checklist de modelado NoSQL

- [ ] Patrones de acceso listados antes de modelar
- [ ] Frecuencia y latencia de cada query estimadas
- [ ] Schema sirve los queries más frecuentes eficientemente
- [ ] Indexes/GSIs justificados por queries reales
- [ ] Cardinalidad y distribución del PK/shard key adecuada
- [ ] Pattern para queries no anticipadas (CDC a search, etc.)
- [ ] Estrategia de versionado de schema
- [ ] TTLs configurados para datos efímeros
- [ ] Backups/exports configurados
- [ ] Monitoring de costos y throttling
