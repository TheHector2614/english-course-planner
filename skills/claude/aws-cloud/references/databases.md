# Bases de Datos en AWS

RDS, Aurora, DynamoDB, ElastiCache. Cuándo usar cada una.

## Árbol de decisión

```
¿Necesitas DB relacional (SQL)?
├── Sí
│   │
│   ¿Workload masivo o alta disponibilidad crítica?
│   ├── Sí → Aurora (PostgreSQL/MySQL compatible)
│   └── No → RDS PostgreSQL (recomendado) o RDS MySQL
│
└── No (NoSQL)
    │
    ¿Acceso clave-valor con baja latencia?
    ├── Sí → DynamoDB
    └── No
        │
        ¿Necesitas búsqueda full-text?
        ├── Sí → OpenSearch
        └── No
            │
            ¿Documentos JSON con queries complejas?
            ├── Sí → DocumentDB (compatible MongoDB) o DynamoDB
            └── No
                │
                ¿Time-series, IoT?
                └── Sí → Timestream
```

## RDS (Relational Database Service)

PostgreSQL, MySQL, MariaDB, Oracle, SQL Server managed.

### Cuándo usar

- App tradicional con esquema SQL
- Joins complejos
- ACID transactions
- Familiaridad del equipo con SQL

### Engine: PostgreSQL vs MySQL

**Por defecto recomiendo PostgreSQL**:
- Más features (JSON, full-text search, materialized views, etc.)
- Mejor para datos complejos
- Comunidad y herramientas excelentes

MySQL si:
- Ya usas MySQL en otros lados
- App legacy requiere
- Performance específica en algunos patrones

### Pricing (us-east-2)

| Tipo | vCPU | RAM | Single-AZ | Multi-AZ |
|---|---|---|---|---|
| db.t3.micro | 2 | 1 GB | $0.018/h = $13 | $26 |
| db.t3.small | 2 | 2 GB | $0.036/h = $26 | $52 |
| db.t3.medium | 2 | 4 GB | $0.072/h = $52 | $104 |
| db.m5.large | 2 | 8 GB | $0.171/h = $125 | $250 |

Storage: $0.115/GB/mes (gp3). IOPS adicionales si necesitas.

**Free tier (12 meses)**: db.t3.micro 750h/mes + 20 GB storage gratis.

### Multi-AZ

Standby replica en otra AZ. Failover automático en ~60 segundos.

**Costo**: 2x (sí, el doble).

**Cuándo activar**:
- ✅ Producción
- ❌ Dev/staging

### Read replicas

Réplicas read-only para escalar lecturas.

- Hasta 15 read replicas por master
- Replicación asíncrona (lag de segundos)
- Cross-region possible
- Pueden promoverse a master

**Cuándo**: lecturas pesadas (reportes, búsquedas, cache layer).

### Setup completo

Ver `deploy-java-spring.md` para HCL. Esencial:

```hcl
resource "aws_db_instance" "main" {
  identifier = "mi-app-db"

  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100  # auto-scaling de storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn  # CMK opcional

  db_name  = "appdb"
  username = "appuser"
  password = random_password.db.result  # mejor usar Secrets Manager

  multi_az               = true   # prod
  publicly_accessible    = false  # SIEMPRE false
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 30   # días (max 35)
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  deletion_protection      = true   # prod
  skip_final_snapshot      = false  # prod
  final_snapshot_identifier = "mi-app-db-final-${formatdate("YYYYMMDD-hhmm", timestamp())}"

  parameter_group_name = aws_db_parameter_group.main.name

  apply_immediately = false  # para changes que requieren restart
}
```

### Parameter Groups

Para customizar configuración Postgres:

```hcl
resource "aws_db_parameter_group" "main" {
  name   = "mi-app-postgres16"
  family = "postgres16"

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # log queries > 1 segundo
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "rds.force_ssl"
    value = "1"  # forzar SSL
  }
}
```

### Backups

**Backups automáticos**:
- Retention 0 = deshabilitado. **NUNCA en prod**
- Default 7 días, max 35
- Backup window configurable
- Snapshot continuo (PITR) — restore a cualquier punto

**Snapshots manuales**:
- Antes de cambios riesgosos
- Cross-region copy para DR
- Retención permanente hasta que borres

### IAM Database Authentication

Conectarse usando IAM tokens en lugar de password:

```hcl
resource "aws_db_instance" "main" {
  iam_database_authentication_enabled = true
}
```

Beneficio: tokens temporales, sin password rotation.

### Connection pooling con RDS Proxy

RDS Proxy: connection pool managed entre app y DB.

**Cuándo usar**:
- Lambda + RDS (Lambda agota conexiones DB)
- Apps con muchas tasks que escalan a/desde 0
- Cuando RDS DB tiene pocas conexiones max

```hcl
resource "aws_db_proxy" "main" {
  name                   = "mi-app-proxy"
  engine_family          = "POSTGRESQL"
  role_arn               = aws_iam_role.rds_proxy.arn
  vpc_subnet_ids         = aws_subnet.private[*].id
  vpc_security_group_ids = [aws_security_group.proxy.id]
  require_tls            = true

  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_secretsmanager_secret.db.arn
    iam_auth    = "DISABLED"
  }
}

resource "aws_db_proxy_default_target_group" "main" {
  db_proxy_name = aws_db_proxy.main.name

  connection_pool_config {
    max_connections_percent      = 90
    max_idle_connections_percent = 50
    connection_borrow_timeout    = 120
  }
}

resource "aws_db_proxy_target" "main" {
  db_proxy_name          = aws_db_proxy.main.name
  target_group_name      = aws_db_proxy_default_target_group.main.name
  db_instance_identifier = aws_db_instance.main.id
}
```

App conecta a `aws_db_proxy.main.endpoint` en lugar del RDS directo.

**Costo**: $0.015/h por vCPU del DB instance = ~$22/mes para db.t3.medium.

## Aurora

Compatible con PostgreSQL/MySQL pero arquitectura diferente:
- Storage distribuido (6 copias en 3 AZs)
- Hasta 15 read replicas con lag < 100ms
- Failover en < 30s (vs 60s+ en RDS Multi-AZ)
- Auto-scaling de storage hasta 128 TB

### Aurora vs RDS

| | RDS | Aurora |
|---|---|---|
| Costo base | Más barato | 20-30% más caro |
| Performance | Bueno | 3-5x mejor en muchos casos |
| Replicas | 15 max, replicación asíncrona | 15 max, replicación más rápida |
| Failover | 60s+ | <30s |
| Storage | Asignado | Auto-scale, paga por uso |
| Backups | Snapshots | Continuous, PITR <1s |
| Versiones | PostgreSQL, MySQL, Oracle, etc. | Solo PostgreSQL y MySQL |

**Recomendación**: Aurora para producción seria, RDS para empezar o casos simples.

### Aurora Serverless v2

Aurora que escala automáticamente entre 0.5 y 128 ACUs (Aurora Capacity Units).

**Cuándo**:
- Carga variable o impredecible
- Dev/staging que no necesitan estar 24/7
- Apps nuevas sin baseline conocido

**Pricing**: $0.12/ACU-hora (us-east-2). 1 ACU ≈ 2 GB RAM + CPU proporcional.

- **Mínimo 0.5 ACU**: $43/mes idle
- Carga media (2 ACU promedio): ~$175/mes
- Comparado con db.t3.medium: similar costo pero auto-scaling

⚠️ Antes de Serverless v2, había v1 (deprecated). Verificar usar v2.

### Aurora Global Database

Cluster multi-región. Lag típico <1s entre regiones.

**Cuándo**:
- Disaster recovery con RPO/RTO bajos
- Apps multi-región con lecturas locales

**Costo**: 2x+ (clusters en cada región).

## DynamoDB

Key-value y document store. Performance predecible, escalable.

### Cuándo elegir

✅ **Sí**:
- Acceso key-value (busqueda por ID)
- Patrón de acceso conocido a priori
- Latencia <10ms requerida
- Tráfico variable masivo
- Workloads serverless (Lambda + DynamoDB)

❌ **NO**:
- Queries ad-hoc no planeadas
- Joins complejos
- Reportes con aggregations
- Esquema flexible que cambia mucho

### Modelo

- **Tabla**: colección de items
- **Item**: registro (JSON-like)
- **Primary Key**:
  - Partition Key (hash): único, distribuye items
  - Sort Key (opcional): ordena dentro de la partition
- **Secondary Indexes**: queries por otros atributos
- **Streams**: change data capture

### Pricing

**On-Demand**:
- Read: $0.25/M requests
- Write: $1.25/M requests
- Storage: $0.25/GB/mes

**Provisioned** (con auto-scaling):
- RCU (Read Capacity Unit): $0.00013/hora cada uno
- WCU (Write Capacity Unit): $0.00065/hora cada uno

**On-Demand** es 5-7x más caro pero sin gestión. Provisioned con auto-scaling es más barato si tienes baseline conocido.

### Setup

```hcl
resource "aws_dynamodb_table" "orders" {
  name           = "orders"
  billing_mode   = "PAY_PER_REQUEST"  # on-demand
  hash_key       = "order_id"
  range_key      = "created_at"

  attribute {
    name = "order_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  # GSI para buscar por usuario
  global_secondary_index {
    name            = "by-user"
    hash_key        = "user_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # Streams (CDC)
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # TTL
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name = "orders"
  }
}
```

### Patterns de acceso

Antes de modelar, listar todos los queries que necesitas:

```
- Get order by ID
- Get all orders for a user
- Get orders by status (pending/completed)
- Get orders in date range
- ...
```

Después diseñar tabla + indexes para soportarlos. **DynamoDB no es flexible**: añadir queries no planeadas requiere migrar.

### Single-table design

Patrón avanzado: una sola tabla con tipos de items diferentes. Más eficiente y barato pero más complejo.

```
PK              SK                          Type      ...
USER#123        USER#123                    User      name=Alice
USER#123        ORDER#456                   Order     amount=100
USER#123        ORDER#789                   Order     amount=200
ORDER#456       ORDER#456                   Order     items=[...]
```

Recomendado el libro "The DynamoDB Book" de Alex DeBrie.

### DynamoDB con Lambda

Match natural — ambos serverless, escalan juntos.

```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { userId } = event.pathParameters;

  const result = await ddb.send(new QueryCommand({
    TableName: 'orders',
    IndexName: 'by-user',
    KeyConditionExpression: 'user_id = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,  // newest first
    Limit: 20,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
};
```

### DynamoDB Streams

Capturar cambios en tabla y procesar con Lambda:

```hcl
resource "aws_lambda_event_source_mapping" "orders_stream" {
  event_source_arn  = aws_dynamodb_table.orders.stream_arn
  function_name     = aws_lambda_function.order_processor.arn
  starting_position = "LATEST"
  batch_size        = 100
}
```

Useful para:
- Replicar a OpenSearch para búsqueda
- Trigger workflows en cambios
- Audit logs
- Notificaciones

## ElastiCache

Cache managed: Redis o Memcached.

### Cuándo usar

- Cache de queries DB pesadas
- Session storage
- Rate limiting (counters)
- Leaderboards (Redis sorted sets)
- Pub/sub light (Redis)
- Distributed locks

### Redis vs Memcached

| Aspecto | Redis | Memcached |
|---|---|---|
| Tipos de datos | Muchos (strings, lists, sets, hashes, sorted sets) | Solo strings |
| Persistencia | Sí | No |
| Replicación | Sí | No |
| Cluster mode | Sí | Sí |
| Pub/sub | Sí | No |
| Transactions | Sí | No |

**Para casi todo: Redis**.

### Setup Redis

```hcl
resource "aws_elasticache_subnet_group" "main" {
  name       = "mi-app-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name        = "mi-app-redis-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "mi-app-redis"
  description                = "Redis para mi-app"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t3.micro"

  num_cache_clusters   = 2  # 1 primary + 1 replica (HA)
  multi_az_enabled     = true
  automatic_failover_enabled = true

  port = 6379
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis.result

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "mon:05:00-mon:07:00"
}
```

### Pricing

- **cache.t3.micro**: $0.017/h = $12/mes (mínimo)
- **cache.t3.small**: $0.034/h = $25/mes
- **cache.r6g.large**: $0.207/h = $151/mes
- **Multi-AZ**: 2x (1 primary + 1 replica)

### ElastiCache Serverless (más reciente)

Auto-scaling sin gestionar nodos. Verificar disponibilidad y pricing actual con `web_search`.

## OpenSearch (búsqueda)

Managed Elasticsearch (después fork). Para:
- Full-text search
- Logs analytics
- Real-time observability

**Costo**: alto. Cluster pequeño ~$50+/mes. Para empezar con búsqueda simple, considerar:
- PostgreSQL full-text search (gratis si ya tienes RDS)
- DynamoDB con servicio externo (Algolia, Typesense)

## DocumentDB

Compatible con MongoDB API. Más caro que MongoDB Atlas.

**Cuándo**: app legacy ya usa MongoDB y quieres managed en AWS. Para nuevos proyectos, evaluar:
- DynamoDB (NoSQL native AWS)
- MongoDB Atlas (mejor compatibilidad)
- PostgreSQL con JSONB (a menudo suficiente)

## Migración a AWS

### DMS (Database Migration Service)

Para migrar de on-prem o cross-cloud a AWS:
- Migration with minimal downtime
- Supports many sources (MySQL, Oracle, SQL Server, Mongo, etc.) y targets
- One-time o continuous replication

### Strategies

1. **Big bang**: pause writes, snapshot, restore, switch
2. **DMS continuous**: full load + CDC, switch cuando lag = 0
3. **Dual write**: app escribe a ambos, después switch reads

## Backups y DR

### Strategies

| Strategy | RPO | RTO | Costo |
|---|---|---|---|
| Snapshots automáticos | < 1 día | minutos | bajo |
| Continuous backup (PITR) | < 5 min | minutos | medio |
| Cross-region snapshots | 1+ días | horas | medio |
| Read replica cross-region | < 1s lag | minutos | alto |
| Aurora Global Database | < 1s | < 1 min | muy alto |

### Mínimo para producción

- Backups automáticos retention 7-30 días
- PITR habilitado
- Restore testing trimestral
- Cross-region snapshots para DR si el riesgo justifica

## Trampas comunes

- ❌ **RDS publicly_accessible = true**: NUNCA en prod
- ❌ **DB sin encryption at-rest** (no se puede agregar después en RDS)
- ❌ **Sin backups** o retention 0
- ❌ **Master password en código**: usar Secrets Manager + rotación
- ❌ **No probar restores**: backup sin restore probado = no es backup
- ❌ **db.t3.micro en prod** real (sin burst credits acaba el día 2)
- ❌ **Single-AZ en prod**
- ❌ **Sin Multi-AZ y sin read replica**: un AZ down = downtime
- ❌ **Sin monitoring**: no sabes que tienes deadlocks/queries lentas
- ❌ **Sin index** en columnas usadas en queries frecuentes
- ❌ **Lambda + RDS sin Proxy**: agota conexiones rápido
- ❌ **DynamoDB sin patrón de acceso definido**
- ❌ **DynamoDB con Scan** en producción (full table scan, caro)
- ❌ **ElastiCache exposed**: dejar sin auth_token, sin TLS
- ❌ **OpenSearch para todo**: caro, considerar alternativas

## Checklist de bases de datos

- [ ] Engine apropiado al caso
- [ ] Encryption at-rest habilitada
- [ ] Encryption in-transit (SSL/TLS forzado)
- [ ] Multi-AZ en producción
- [ ] Backups automáticos con retention apropiada
- [ ] PITR habilitado
- [ ] Restore testing periódico
- [ ] Master password en Secrets Manager con rotación
- [ ] Security Group: solo desde app SGs
- [ ] No publicly accessible
- [ ] Performance Insights habilitado
- [ ] Slow query logging habilitado
- [ ] Monitoring + alarmas (CPU, connections, storage)
- [ ] Deletion protection en prod
- [ ] Final snapshot al destruir
- [ ] Connection pooling apropiado (RDS Proxy si Lambda + RDS)
- [ ] Cross-region backup si DR lo justifica
- [ ] Storage auto-scaling habilitado
