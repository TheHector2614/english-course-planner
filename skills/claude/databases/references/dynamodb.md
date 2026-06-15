# DynamoDB

Detalle operacional de DynamoDB. Complementa `modeling-nosql.md` (que cubre single-table design y patrones).

## Conceptos esenciales

- **Table**: contenedor
- **Item**: registro (hasta 400 KB)
- **Attribute**: campo
- **Primary Key**:
  - **Partition Key** (HASH): hash → partición física
  - **Sort Key** (RANGE, opcional): ordena items en la partición
- **Local Secondary Index (LSI)**: misma PK, diferente SK. 5 max/tabla
- **Global Secondary Index (GSI)**: PK y SK diferentes. 20 max/tabla
- **Streams**: change data capture
- **TTL**: auto-elimina items

## Capacity Modes

### On-Demand

- Paga por request
- Sin capacity planning
- Escala automáticamente
- $1.25/M writes, $0.25/M reads (us-east-1)

**Cuándo**:
- Tráfico impredecible
- Apps nuevas sin baseline
- Picos masivos
- Default para empezar

### Provisioned

- Pre-pagas RCUs (Read Capacity Units) y WCUs
- Auto-scaling configurable
- Más barato si tráfico estable

**RCU**: 1 strongly consistent read/sec de items hasta 4 KB. Eventually consistent = 2 reads/sec.
**WCU**: 1 write/sec de items hasta 1 KB.

Cálculo:
- 100 reads/sec de items 4 KB con eventual consistency = 50 RCU
- 100 writes/sec de items 1 KB = 100 WCU

**Reserved Capacity**: descuento por compromiso 1-3 años.

### Migración

Se puede cambiar de modo (con limit de 1 cambio/24h).

## Operaciones básicas

### AWS SDK v3 (Node)

```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// GetItem
const result = await ddb.send(new GetCommand({
  TableName: 'app',
  Key: { PK: 'USER#u1', SK: 'USER#u1' }
}));

// PutItem
await ddb.send(new PutCommand({
  TableName: 'app',
  Item: { PK: 'USER#u1', SK: 'USER#u1', name: 'Alice', email: 'alice@example.com' },
  ConditionExpression: 'attribute_not_exists(PK)'  // no sobrescribir
}));

// Query (siempre por PK)
const orders = await ddb.send(new QueryCommand({
  TableName: 'app',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
  ExpressionAttributeValues: {
    ':pk': 'USER#u1',
    ':prefix': 'ORDER#'
  }
}));

// UpdateItem (atomic)
await ddb.send(new UpdateCommand({
  TableName: 'app',
  Key: { PK: 'USER#u1', SK: 'USER#u1' },
  UpdateExpression: 'SET #n = :name, lastUpdated = :now ADD orderCount :inc',
  ExpressionAttributeNames: { '#n': 'name' },  // name es reservado
  ExpressionAttributeValues: {
    ':name': 'Alice Updated',
    ':now': new Date().toISOString(),
    ':inc': 1
  },
  ReturnValues: 'ALL_NEW'
}));

// Delete con condición
await ddb.send(new DeleteCommand({
  TableName: 'app',
  Key: { PK: 'USER#u1', SK: 'USER#u1' },
  ConditionExpression: 'version = :v',  // optimistic locking
  ExpressionAttributeValues: { ':v': 5 }
}));
```

### Java (AWS SDK v2)

```java
DynamoDbClient client = DynamoDbClient.create();
DynamoDbEnhancedClient enhanced = DynamoDbEnhancedClient.builder()
    .dynamoDbClient(client)
    .build();

DynamoDbTable<User> userTable = enhanced.table("users",
    TableSchema.fromBean(User.class));

// Get
User user = userTable.getItem(Key.builder().partitionValue("USER#u1").sortValue("USER#u1").build());

// Put
userTable.putItem(new User("USER#u1", "USER#u1", "Alice"));

// Query
QueryConditional cond = QueryConditional.sortBeginsWith(
    Key.builder().partitionValue("USER#u1").sortValue("ORDER#").build()
);
List<User> orders = userTable.query(cond).items().stream().toList();
```

## Query vs Scan

### Query (preferido)

```javascript
// Por PK (con opcional SK condition)
KeyConditionExpression: 'PK = :pk AND SK BETWEEN :start AND :end'

// Operadores en SK: =, <, <=, >, >=, BETWEEN, begins_with
```

**Características**:
- ✅ Rápido (acceso directo a partición)
- ✅ Devuelve hasta 1 MB por request (paginar para más)
- ✅ Costo predecible
- ❌ Solo por PK (y opcionalmente SK)

### Scan (evitar)

```javascript
new ScanCommand({
  TableName: 'app',
  FilterExpression: 'status = :s',
  ExpressionAttributeValues: { ':s': 'pending' }
})
```

**Características**:
- ❌ Lee toda la tabla (caro y lento)
- ❌ Filter expression se aplica DESPUÉS de leer (pagas por todo)
- ❌ No predecible
- ✅ A veces necesario para reportes ocasionales

**Si necesitas algo distinto a Query**: agregar GSI, no usar Scan.

## Índices Secundarios

### LSI (Local Secondary Index)

- Misma PK, diferente SK
- Hasta 5 por tabla
- **Solo se crean al crear la tabla** (inmutable)
- Strong consistency disponible
- Comparte capacity con tabla

### GSI (Global Secondary Index)

- PK y SK independientes
- Hasta 20 por tabla
- Se crean/eliminan en cualquier momento
- **Solo eventual consistency**
- Capacity independiente
- Storage extra

### Patterns útiles

**Sparse GSI**: GSI sobre atributo que solo algunos items tienen.

```javascript
// Solo orders pending tienen 'pendingTime'
{
  PK: 'ORDER#o1',
  SK: 'ORDER#o1',
  status: 'pending',
  pendingTime: '2026-05-19T14:23:45Z'  // solo en pending
}

// GSI: pendingTime como PK
// Query: "lista pending orders ordenadas por antigüedad"
```

**Overloaded GSI**: misma columna usada para distintos propósitos.

```javascript
// GSI1PK puede ser email, categoría, etc. según tipo
{ PK: 'USER#u1', SK: 'USER#u1', GSI1PK: 'EMAIL#alice@example.com', GSI1SK: 'USER#u1' }
{ PK: 'PRODUCT#p1', SK: 'PRODUCT#p1', GSI1PK: 'CATEGORY#laptops', GSI1SK: 'PRODUCT#p1' }
```

### Projections

Qué atributos copiar al índice:
- `ALL`: todo (más storage, queries más flexibles)
- `KEYS_ONLY`: solo claves
- `INCLUDE`: lista específica

Trade-off: storage vs flexibilidad.

## Transactions

Multi-item ACID:

```javascript
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

await ddb.send(new TransactWriteCommand({
  TransactItems: [
    {
      Update: {
        TableName: 'accounts',
        Key: { id: 'A' },
        UpdateExpression: 'ADD balance :amt',
        ConditionExpression: 'balance >= :amt',
        ExpressionAttributeValues: { ':amt': -100 }
      }
    },
    {
      Update: {
        TableName: 'accounts',
        Key: { id: 'B' },
        UpdateExpression: 'ADD balance :amt',
        ExpressionAttributeValues: { ':amt': 100 }
      }
    },
    {
      Put: {
        TableName: 'transactions',
        Item: { id: 'tx-123', from: 'A', to: 'B', amount: 100 }
      }
    }
  ]
}));
```

**Costo**: cada operación cuesta el doble en WCU. Usar solo cuando atomicity matters.

## Streams (CDC)

Habilitar para capturar cambios:

```javascript
{
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES'  // o NEW_IMAGE, OLD_IMAGE, KEYS_ONLY
  }
}
```

Consumir con Lambda:

```hcl
resource "aws_lambda_event_source_mapping" "stream" {
  event_source_arn  = aws_dynamodb_table.app.stream_arn
  function_name     = aws_lambda_function.stream_processor.arn
  starting_position = "LATEST"
  batch_size        = 100
}
```

Use cases:
- Replicar a OpenSearch (búsqueda)
- Sync a otra DB
- Trigger workflows
- Audit logs
- Cache invalidation

## TTL

Auto-eliminar items viejos:

```javascript
// Habilitar
{
  TimeToLiveSpecification: {
    AttributeName: 'expiresAt',  // Unix timestamp (seconds)
    Enabled: true
  }
}

// Al insertar item con TTL
{
  PK: 'SESSION#s1',
  expiresAt: Math.floor(Date.now() / 1000) + 3600  // 1 hora
}
```

DynamoDB borra dentro de 48h después del expiresAt (no inmediato pero gratis).

## Conditional Writes (optimistic locking)

```javascript
new UpdateCommand({
  Key: { id: 'A' },
  UpdateExpression: 'SET name = :n, version = version + :inc',
  ConditionExpression: 'version = :currentV',
  ExpressionAttributeValues: {
    ':n': 'New Name',
    ':inc': 1,
    ':currentV': 5
  }
})
// Si version no es 5, falla con ConditionalCheckFailedException
```

## Batch operations

### BatchGetItem (hasta 100 items)

```javascript
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';

await ddb.send(new BatchGetCommand({
  RequestItems: {
    'app': {
      Keys: [
        { PK: 'USER#u1', SK: 'USER#u1' },
        { PK: 'USER#u2', SK: 'USER#u2' },
        { PK: 'USER#u3', SK: 'USER#u3' }
      ]
    }
  }
}));
```

### BatchWriteItem (hasta 25 items)

```javascript
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

await ddb.send(new BatchWriteCommand({
  RequestItems: {
    'app': [
      { PutRequest: { Item: { ... } } },
      { PutRequest: { Item: { ... } } },
      { DeleteRequest: { Key: { ... } } }
    ]
  }
}));
```

**Importante**: batch puede fallar parcialmente. Reintentar `UnprocessedItems`.

## PartiQL (SQL-like, opcional)

Sintaxis SQL para DynamoDB. Útil para queries ad-hoc.

```sql
SELECT * FROM "app" WHERE PK = 'USER#u1';

INSERT INTO "app" VALUE { 'PK': 'USER#u2', 'SK': 'USER#u2', 'name': 'Bob' };
```

**Cuándo**: scripts ad-hoc, exploración. Para apps, SDK normal es mejor.

## Monitoring

### CloudWatch Metrics

- `ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`
- `ThrottledRequests`, `UserErrors`, `SystemErrors`
- `SuccessfulRequestLatency`
- `ItemCount`, `TableSizeBytes`

### Contributor Insights

Identifica top items, top partition keys (hot keys).

```bash
aws dynamodb update-contributor-insights \
  --table-name app \
  --contributor-insights-action ENABLE
```

### Métricas a vigilar

- **Throttling**: capacity insuficiente o hot partition
- **Latency p99 > 100ms**: probable hot key
- **ConsumedCapacity vs ProvisionedCapacity**: si > 80% sostenido, escalar

## Hot Partitions

Cuando todas las requests van a una sola partition key → throttling.

Síntomas: throttled requests altos, latencia alta.

Soluciones:
- **Write sharding**: agregar sufijo random a la PK (`USER#u1#0`, `USER#u1#1`, ...). Más complejo de leer.
- **Cache reads** en Redis/DAX
- **Rediseñar PK**: distribuir mejor

## Backups

### Continuous backups (PITR)

```javascript
{
  PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true }
}
```

Restaurar a cualquier punto en los últimos 35 días. Costo: $0.20/GB-mes (sobre el storage).

### On-demand backups

```bash
aws dynamodb create-backup --table-name app --backup-name app-backup-2026-05-19
```

Snapshot manual, retención hasta que borres. Cost: storage del backup.

### Export to S3

```bash
aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:... \
  --s3-bucket mi-bucket \
  --export-format DYNAMODB_JSON
```

Para analytics con Athena, Glue, etc.

## DAX (DynamoDB Accelerator)

Cache in-memory específico para DynamoDB.

**Cuándo**:
- Reads de baja latencia (<1ms)
- Read-heavy workload
- Items que se leen mucho

**Cons**:
- Costo (cluster managed)
- Eventually consistent
- Solo cache reads (writes van directo)

Alternativa: cache en Redis/ElastiCache controlado por la app.

## Global Tables (multi-region)

Replicación multi-master cross-region:

```javascript
{
  Replicas: [
    { RegionName: 'us-east-2' },
    { RegionName: 'us-west-2' },
    { RegionName: 'sa-east-1' }
  ]
}
```

**Costo**: 2x+ por region adicional. Eventual consistency cross-region (~1 segundo).

## Costos: cuidados

- **Writes son 5x más caras que reads**
- **GSIs cuestan más** (otra escritura por cada índice)
- **Transactions cuestan el doble en operaciones**
- **Scan es muy caro** (todas las RCUs)
- **Strong consistent reads cuestan el doble** de eventual
- **Storage**: $0.25/GB/mes (igual on-demand y provisioned)

## Local development

```bash
# DynamoDB Local (Docker)
docker run -d -p 8000:8000 amazon/dynamodb-local

# Configurar SDK
const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'localhost',
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' }
});
```

NoSQL Workbench (GUI gratis de AWS) ayuda a visualizar y diseñar.

## Anti-patterns

- ❌ **Scan en producción**
- ❌ **Hot partition** (todos los writes a una PK)
- ❌ **Items > 400 KB**
- ❌ **Modelar como SQL** (tabla por entidad, JOINs en código)
- ❌ **No definir patrones de acceso antes**
- ❌ **GSI con projection ALL cuando no necesitas todo**
- ❌ **No usar conditional writes** cuando race conditions importan
- ❌ **Atributos con nombres muy largos** (suman al costo)
- ❌ **Strong consistent reads** cuando eventual es suficiente
- ❌ **No usar batch operations** cuando aplicable

## Checklist DynamoDB

- [ ] Patrones de acceso definidos antes de modelar
- [ ] PK distribuye uniformemente (no hot partition)
- [ ] Capacity mode apropiado (On-Demand inicialmente)
- [ ] GSIs justificados por queries específicas
- [ ] Streams habilitado si necesitas CDC
- [ ] PITR habilitado en producción
- [ ] TTL para datos efímeros (sessions, cache, logs)
- [ ] Encryption at-rest habilitada (default)
- [ ] IAM con least privilege (no `dynamodb:*`)
- [ ] CloudWatch alarms en throttling y errors
- [ ] Backups testeados
- [ ] Conditional writes en operaciones críticas (optimistic lock)
- [ ] Local development con DynamoDB Local
