# MongoDB

Document database más popular. Complementa `modeling-nosql.md` con detalle operacional.

## Conceptos

- **Database**: contenedor
- **Collection**: similar a tabla
- **Document**: JSON-like (BSON binario internamente)
- **Field**: campo
- **`_id`**: PK automático (ObjectId por default)
- **Index**: igual concepto que SQL

## CRUD básico

```javascript
// Insert
db.users.insertOne({ name: "Alice", email: "alice@example.com" });
db.users.insertMany([{ ... }, { ... }]);

// Find
db.users.findOne({ email: "alice@example.com" });
db.users.find({ status: "active" });
db.users.find({ age: { $gte: 18 } }).sort({ name: 1 }).limit(10);

// Update
db.users.updateOne({ _id: ObjectId("...") }, { $set: { name: "Alice K" } });
db.users.updateMany({ status: "inactive" }, { $set: { archived: true } });

// Atomic operators
db.users.updateOne({ _id }, { $inc: { score: 10 } });        // increment
db.users.updateOne({ _id }, { $push: { tags: "premium" } }); // append array
db.users.updateOne({ _id }, { $addToSet: { tags: "VIP" } }); // append si no existe
db.users.updateOne({ _id }, { $unset: { temporaryField: "" } });

// Delete
db.users.deleteOne({ _id });
db.users.deleteMany({ status: "deleted" });
```

## Operadores comunes

```javascript
// Comparación
{ age: { $eq: 18 } }
{ age: { $gt: 18, $lte: 65 } }
{ status: { $in: ["active", "trial"] } }
{ status: { $nin: ["deleted", "banned"] } }
{ email: { $ne: null } }
{ email: { $exists: true } }

// Lógicos
{ $and: [{ age: { $gte: 18 } }, { status: "active" }] }
{ $or: [{ status: "active" }, { vip: true }] }
{ $not: { age: { $gte: 18 } } }

// Arrays
{ tags: "premium" }                  // contiene
{ tags: { $all: ["premium", "VIP"] } }
{ tags: { $size: 3 } }
{ "addresses.city": "Bogotá" }      // dentro de array de objects

// Regex
{ name: /^Ali/i }
{ name: { $regex: "^Ali", $options: "i" } }
```

## Indexes

```javascript
// Single field
db.users.createIndex({ email: 1 });  // 1 asc, -1 desc

// Compound (orden importa)
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Unique
db.users.createIndex({ email: 1 }, { unique: true });

// Sparse: solo docs con campo
db.users.createIndex({ phone: 1 }, { sparse: true });

// Partial: con condición
db.orders.createIndex(
  { userId: 1 },
  { partialFilterExpression: { status: "pending" } }
);

// TTL: auto-expira
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Text (full-text)
db.articles.createIndex({ title: "text", body: "text" });

// Geo
db.locations.createIndex({ location: "2dsphere" });

// Wildcard (cualquier subfield)
db.events.createIndex({ "metadata.$**": 1 });

// Verificar uso
db.orders.find({ userId: 1 }).explain("executionStats");
db.collection.aggregate([{ $indexStats: {} }]);

// Listar
db.users.getIndexes();

// Eliminar
db.users.dropIndex("email_1");
```

## Aggregation Pipeline

Pipeline de stages que transforman documents.

```javascript
db.orders.aggregate([
  // 1. Filtrar
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-01-01") } } },

  // 2. JOIN con users
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
  }},

  // 3. Desempacar array de user (siempre 1 elemento por el lookup)
  { $unwind: "$user" },

  // 4. Group by país
  { $group: {
      _id: "$user.country",
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 },
      avgOrder: { $avg: "$total" },
      maxOrder: { $max: "$total" }
  }},

  // 5. Sort y limit
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },

  // 6. Project (reshape)
  { $project: {
      country: "$_id",
      revenue: "$totalRevenue",
      orders: "$orderCount",
      avg: { $round: ["$avgOrder", 2] },
      _id: 0
  }}
]);
```

### Stages comunes

| Stage | Hace |
|---|---|
| `$match` | WHERE |
| `$project` | SELECT (reshape) |
| `$group` | GROUP BY |
| `$sort` | ORDER BY |
| `$limit` / `$skip` | paginación |
| `$lookup` | JOIN |
| `$unwind` | array → multiple docs |
| `$addFields` / `$set` | añadir/modificar campos |
| `$unset` | quitar campos |
| `$count` | contar |
| `$facet` | múltiples pipelines paralelos |
| `$bucket` | rangos (como CASE WHEN) |
| `$out` / `$merge` | escribir resultado a collection |

### Tips

- Poner `$match` y `$project` lo antes posible (reduce documents)
- Usar índices: `$match` con campos indexados primero
- `$lookup` es costoso; preferir embebido cuando posible
- `explain('executionStats')` también funciona en aggregations

## Transactions

Disponibles desde 4.0 (replica sets) y 4.2 (sharded clusters).

```javascript
const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await db.collection('accounts').updateOne(
      { _id: fromAccount },
      { $inc: { balance: -100 } },
      { session }
    );
    await db.collection('accounts').updateOne(
      { _id: toAccount },
      { $inc: { balance: 100 } },
      { session }
    );
    await db.collection('transactions').insertOne(
      { from: fromAccount, to: toAccount, amount: 100 },
      { session }
    );
  });
} finally {
  await session.endSession();
}
```

**Costo**: transactions tienen overhead (locks, oplog entries). Usar cuando necesitas atomicity multi-document. Para casos simples (single document atomic), las operaciones `$inc`, `$push`, etc. ya son atómicas sin transaction.

## Schema validation

Aunque MongoDB es schemaless, puedes forzar reglas:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt"],
      properties: {
        email: { bsonType: "string", pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" },
        name:  { bsonType: "string", minLength: 1, maxLength: 100 },
        age:   { bsonType: "int", minimum: 0, maximum: 150 },
        createdAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",   // o "moderate" (solo nuevos docs y updates)
  validationAction: "error"    // o "warn"
});
```

Recomendado para data crítica. Documenta el schema y previene bugs.

## Change Streams

CDC (Change Data Capture):

```javascript
const stream = db.orders.watch([
  { $match: { 'fullDocument.status': 'paid' } }
]);

stream.on('change', (change) => {
  console.log('Order paid:', change.fullDocument);
  // Trigger downstream: send email, update analytics, etc.
});
```

Útil para:
- Sincronizar con OpenSearch/Algolia
- Notificaciones
- Auditoría
- Caché invalidation

## Replication (Replica Set)

Mínimo recomendado: **3 nodes** (Primary + 2 Secondaries) para HA.

```
Primary ─── replication ───▶ Secondary 1
   │
   └─────── replication ───▶ Secondary 2
```

- Writes van al Primary
- Reads pueden ir a Secondaries (con `readPreference`)
- Failover automático si Primary cae
- Oplog (operation log): historia de cambios

```javascript
// Connection string con replica set
mongodb://server1:27017,server2:27017,server3:27017/mydb?replicaSet=rs0

// Read preference
db.users.find().readPref("secondary");           // siempre secondary
db.users.find().readPref("secondaryPreferred"); // primary si no hay secondary disponible
```

## Sharding (horizontal scaling)

Cuando una collection no cabe en una sola máquina:

```javascript
// Habilitar sharding en DB
sh.enableSharding("mydb");

// Sharded collection con shard key
sh.shardCollection("mydb.orders", { userId: "hashed" });
```

### Elegir shard key

- **Alta cardinalidad** (muchos valores únicos)
- **Distribución uniforme** (no hot shards)
- **Match con queries** (queries con shard key son rápidas; sin shard key hacen scatter-gather)

| Shard key | Pros | Cons |
|---|---|---|
| **Hashed** (`{ userId: "hashed" }`) | Distribución uniforme | Range queries hacen scatter |
| **Range** (`{ createdAt: 1 }`) | Range queries eficientes | Hot shards en tiempo presente |
| **Compound** (`{ userId: 1, createdAt: 1 }`) | Balance | Más complejo |

**Importante**: shard key es **inmutable** después de definir. Pensar bien.

## Performance

### Profiler

```javascript
// Habilitar (slowms = ms threshold)
db.setProfilingLevel(1, { slowms: 100 });

// Ver slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(20);

// Deshabilitar
db.setProfilingLevel(0);
```

### explain()

```javascript
db.orders.find({ userId: 1 }).explain("executionStats");

// Buscar:
// - "totalDocsExamined": 1000  ← debería ser igual a "nReturned" idealmente
// - "executionTimeMillis"
// - "winningPlan": qué index se usó (o COLLSCAN = bad)
```

### Estadísticas

```javascript
db.orders.stats();                  // tamaño, índices, docs
db.serverStatus();                  // métricas servidor
db.currentOp();                     // operaciones en curso
db.killOp(opid);                    // matar operación
```

## Configuración

### Connection pooling

```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 100,
  minPoolSize: 10,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000
});
```

### Write Concern

Garantías de escritura:

```javascript
db.orders.insertOne(doc, { writeConcern: { w: "majority", j: true } });
```

- `w: 1`: confirmado por primary (default)
- `w: "majority"`: confirmado por majority de réplicas (más seguro)
- `j: true`: durabilidad en journal

### Read Concern

```javascript
db.orders.find().readConcern("majority");
```

- `local`: lee lo último que tiene este nodo (default)
- `majority`: lee solo lo confirmado por majority
- `linearizable`: máxima consistencia (más lento)

## Backups

### mongodump / mongorestore

```bash
# Backup completo
mongodump --uri="mongodb://..." --out=/backups/$(date +%F)

# Backup selectivo
mongodump --uri="..." --db=mydb --collection=users --out=...

# Restore
mongorestore --uri="..." /backups/2026-05-19
```

Para DBs grandes, mongodump es lento. Mejor:
- **Atlas backups**: snapshots managed (recomendado en Atlas)
- **Filesystem snapshots**: LVM, EBS snapshots
- **Replica set member dedicated to backup**

### Backups continuous

Atlas Continuous Backup u Ops Manager para PITR.

## Hosting

| Opción | Cuándo |
|---|---|
| **MongoDB Atlas** | Default. Managed, multi-cloud. Free tier para empezar |
| **AWS DocumentDB** | API-compatible (con limitaciones). Si todo es AWS |
| **Self-hosted** | Control total, on-prem, costos. Operación compleja |

## Anti-patterns

- ❌ Modelar como SQL (collections para cada "tabla", todo referenciado)
- ❌ Documents enormes (>16 MB)
- ❌ Embebido sin límite (arrays que crecen para siempre)
- ❌ `$lookup` en queries críticas de alto throughput
- ❌ No usar indexes
- ❌ Shard key mal elegida
- ❌ Cambiar shard key (no se puede sin migrar todo)
- ❌ No usar transactions cuando atomicity matters
- ❌ Cliente conectándose a secondary sin entender consistency
- ❌ Write concern `w: 0` en datos importantes
- ❌ Sin schema validation en datos críticos
- ❌ Mongoose: confiar 100% en validación (¡también en DB!)
- ❌ Backups sin restore testing

## Checklist MongoDB

- [ ] Replica set (mínimo 3 nodes) en producción
- [ ] Authentication habilitada
- [ ] TLS para conexiones
- [ ] Schema validation en collections críticas
- [ ] Indexes para patterns de acceso conocidos
- [ ] Profiler habilitado o slow queries monitoreadas
- [ ] Write concern apropiado al caso (majority para data crítica)
- [ ] Backups automatizados + restore testing
- [ ] Monitoring (Atlas, Ops Manager, Datadog)
- [ ] Connection pool tuneado
- [ ] Strategy clara de sharding si crece
