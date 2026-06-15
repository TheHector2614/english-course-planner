# Performance Tuning

Cómo encontrar y resolver problemas de performance en DBs.

## Proceso de diagnóstico

```
1. ¿Qué query está lento?
   → Encontrar las queries top (slow query log, pg_stat_statements)

2. ¿Por qué está lento?
   → EXPLAIN ANALYZE, query plan

3. ¿Qué falta?
   → Index, mejor plan, refactor, denormalización

4. ¿Cuánto mejoró?
   → Medir antes/después
```

## Encontrar queries lentas

### PostgreSQL: pg_stat_statements

```sql
-- Habilitar
CREATE EXTENSION pg_stat_statements;
-- En postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
-- Restart

-- Top queries por tiempo total
SELECT
  substring(query, 1, 100) AS query,
  calls,
  total_exec_time AS total_ms,
  mean_exec_time AS avg_ms,
  rows / calls AS avg_rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Resetear estadísticas
SELECT pg_stat_statements_reset();
```

### PostgreSQL: slow query log

```ini
# postgresql.conf
log_min_duration_statement = 1000  # log queries > 1s
log_statement = 'mod'              # log DDL y DML
log_duration = on
```

### MySQL: slow query log

```sql
-- Habilitar
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- Analizar
mysqldumpslow -s t /var/log/mysql/slow.log
```

### MongoDB

```javascript
// Habilitar profiler
db.setProfilingLevel(1, { slowms: 100 });

// Ver slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(20);
```

### DynamoDB

CloudWatch Contributor Insights. No hay "slow query log" tradicional pero sí:
- Items consumed por operation
- Throttled requests
- Hot keys detection

## EXPLAIN: leer el query plan

### PostgreSQL

```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.country = 'CO'
GROUP BY u.id, u.name;
```

Lee de adentro hacia afuera:

```
HashAggregate  (cost=15234.56..15800.12 rows=1000 width=44) (actual time=120.5..125.3 rows=850 loops=1)
  ->  Hash Right Join  (cost=2345.67..14800.12 rows=86890 width=40) (actual time=15.2..110.1 rows=85000 loops=1)
        Hash Cond: (o.user_id = u.id)
        ->  Seq Scan on orders o  (cost=0.00..10234.56 rows=500000 width=16) (actual time=0.1..80.5 rows=500000 loops=1)
        ->  Hash  (cost=2200.00..2200.00 rows=10000 width=24) (actual time=15.0..15.0 rows=10000 loops=1)
              Buckets: 16384  Batches: 1  Memory Usage: 600kB
              ->  Index Scan using idx_users_country on users u  (cost=0.42..2200.00 rows=10000 width=24) (actual time=0.5..14.0 rows=10000 loops=1)
                    Index Cond: (country = 'CO')
Planning Time: 0.3 ms
Execution Time: 126.5 ms
```

Interpretación:
- **Seq Scan on orders**: full table scan de 500k rows → posible problema
- **Index Scan on users**: usa el index `idx_users_country` → bien
- **Hash Right Join**: join correcto
- **Total**: 126ms

**Fix sugerido**: agregar índice en `orders.user_id`.

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- Re-ejecutar EXPLAIN
```

### Nodos importantes en plan

| Nodo | Significado | Cuándo |
|---|---|---|
| **Seq Scan** | Lee toda la tabla | Tabla chica o filtros muy poco selectivos |
| **Index Scan** | Lee usando índice | Filtros con buena selectividad |
| **Index Only Scan** | Datos están en el índice | Covering index, óptimo |
| **Bitmap Heap Scan** | Lee tabla usando bitmap del índice | Filtros que retornan miles de rows |
| **Nested Loop** | Loop con lookups | Una tabla chica, otra con índice |
| **Hash Join** | Build hash en memoria | Tablas grandes sin orden |
| **Merge Join** | Tablas ya ordenadas | Pre-sorted o con índices |
| **Sort** | Ordenar en memoria/disco | ORDER BY sin índice |
| **Aggregate** | GROUP BY, SUM, etc. | Agregaciones |
| **Gather** | Paralelización | Múltiples workers |

### Banderas rojas

- **Seq Scan en tabla grande**: falta índice
- **Sort con `Disk:`**: spillover a disco, `work_mem` insuficiente
- **rows estimadas vs actuales muy diferentes**: estadísticas desactualizadas → `ANALYZE`
- **`loops=N` alto**: nested loop ineficiente
- **`Index Scan` pero retorna muchas filas**: índice poco selectivo
- **Mismo nodo en `actual time` mucho mayor que `cost` esperado**: re-evaluar estadísticas o el plan

### MySQL EXPLAIN

```sql
EXPLAIN FORMAT=JSON SELECT ...;
```

Mirar:
- `type`: ALL (bad, full scan), index (full index), range, ref, eq_ref, const, system (best)
- `key`: índice usado
- `rows`: estimación
- `Extra`: "Using filesort", "Using temporary" (red flags)

## Indexes: el 80% de los problemas

### Verificar si hay índices

```sql
-- PostgreSQL
SELECT
  schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- MySQL
SHOW INDEX FROM orders;
```

### Indexes faltantes (los más comunes)

1. **FKs sin índice** (PostgreSQL no crea automático)
2. **Cols en `WHERE` frecuentes**
3. **Cols en `ORDER BY` cuando combinadas con WHERE**
4. **Cols en `JOIN ON`**

### Indexes inútiles (eliminar)

```sql
-- PostgreSQL: indexes nunca usados
SELECT
  indexrelname AS index,
  schemaname || '.' || relname AS table,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Indexes redundantes

Si tienes `idx_a_b_c` (cols a, b, c), el índice `idx_a` es redundante (a usa el primero).

```sql
-- pg_index_health (extension) o consulta manual
SELECT ...  -- buscar índices con misma prefix
```

### Index compuesto: orden correcto

Regla del **leftmost prefix**: si tienes `INDEX(a, b, c)`, sirve para:
- `WHERE a = ?`
- `WHERE a = ? AND b = ?`
- `WHERE a = ? AND b = ? AND c = ?`

**NO sirve** (eficientemente) para:
- `WHERE b = ?` (skip de `a`)
- `WHERE c = ?`

Orden óptimo: cols con **igualdad** primero, luego **rangos**.

```sql
-- BIEN: filtros igualdad primero
WHERE user_id = ? AND created_at > ?
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- MAL para esa query
CREATE INDEX idx_orders_created_user ON orders(created_at, user_id);
```

### Cardinalidad

Index sirve si la columna tiene alta **selectividad** (muchos valores únicos):

| Cardinalidad | Selectividad | Index útil |
|---|---|---|
| 2 (boolean) | 50% | Rara vez |
| 10 | 10% | A veces |
| 100 | 1% | Sí |
| 1000+ | <0.1% | Definitivamente |

**Excepciones útiles**:
- Boolean con distribución desigual + partial index: `WHERE is_active = TRUE` cuando 99% son active
- Boolean con queries específicas: `WHERE deleted_at IS NULL` con partial

### Covering indexes (INCLUDE)

Index satisface query sin tocar tabla:

```sql
-- Query
SELECT name, email FROM users WHERE id = ?;

-- Index covering
CREATE INDEX idx_users_id_cover ON users(id) INCLUDE (name, email);

-- Query plan: "Index Only Scan" (sin acceso a tabla)
```

## N+1 queries

El problema clásico de ORMs.

### Síntoma

```
Time: 5000ms
Queries: 101
- 1 SELECT * FROM users LIMIT 100
- 100 SELECT * FROM orders WHERE user_id = ? (uno por user)
```

### Causa

```java
// JPA con lazy loading default
List<User> users = userRepo.findAll(PageRequest.of(0, 100));
for (User user : users) {
    System.out.println(user.getOrders().size());  // ← query por cada user
}
```

### Solución

**JPA**:
```java
@EntityGraph(attributePaths = {"orders"})
List<User> findAll(Pageable pageable);

// o JPQL con JOIN FETCH
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

**Sequelize (Node)**:
```javascript
User.findAll({ include: [Order] });
```

**Prisma**:
```typescript
prisma.user.findMany({ include: { orders: true } });
```

**Mongoose**:
```javascript
User.find().populate('orders');
```

**SQL directo**:
```sql
SELECT u.*, o.* FROM users u LEFT JOIN orders o ON o.user_id = u.id;
-- O en dos queries con IN()
SELECT * FROM users LIMIT 100;
SELECT * FROM orders WHERE user_id IN (1, 2, 3, ..., 100);
```

### Detección

- **Spring Boot**: Hibernate statistics (`spring.jpa.properties.hibernate.generate_statistics=true`)
- **Rails**: bullet gem
- **Django**: django-debug-toolbar
- **Logs**: contar queries por request, si > 5-10 hay algo raro

## Connection pooling

DB connections son caras de abrir. Reusar via pool.

### Tamaño del pool

Regla general:
```
connections = ((core_count * 2) + effective_spindle_count)
```

Para apps típicas: **10-20 conexiones por instancia de app**.

### Configuración Spring Boot (HikariCP)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000        # 5 min
      max-lifetime: 1800000       # 30 min (menor que wait_timeout de MySQL)
      connection-timeout: 30000   # 30s
      leak-detection-threshold: 60000  # avisar si conexión no se libera en 60s
```

### Conexiones a la DB

**PostgreSQL**:
```
max_connections = 100  # default
```

**Calcular total**:
```
total_connections = app_instances * pool_size
```

Si tienes 10 instancias × pool 10 = 100 connections. Justo el límite. Margen para failover y otras herramientas.

### PgBouncer / RDS Proxy

Connection pooler externo. Beneficios:
- Multiplexa muchos clientes en pocas conexiones DB
- Recuperación de conexiones más rápida
- Críticos para Lambda + RDS (Lambda agota conexiones)

```ini
# pgbouncer.ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction        # transaction (recomendado) o session
max_client_conn = 1000
default_pool_size = 25
```

## Optimización de queries

### SELECT solo lo necesario

```sql
-- MAL
SELECT * FROM orders WHERE user_id = ?;

-- BIEN
SELECT id, status, total FROM orders WHERE user_id = ?;
```

### Paginación correcta

**OFFSET grande es lento**:
```sql
-- LENTO en página 1000
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 20000;
```

**Keyset pagination** (más rápido):
```sql
-- Mucho más rápido
SELECT * FROM orders
WHERE created_at < $1  -- último timestamp de la página anterior
ORDER BY created_at DESC
LIMIT 20;
```

### Evitar funciones en WHERE sobre cols indexadas

```sql
-- MAL: no usa index en email
WHERE LOWER(email) = LOWER('alice@example.com')

-- BIEN: índice funcional + query
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
WHERE LOWER(email) = LOWER('alice@example.com')

-- O directamente: CITEXT type en PostgreSQL
```

```sql
-- MAL
WHERE DATE(created_at) = '2026-05-19'

-- BIEN
WHERE created_at >= '2026-05-19' AND created_at < '2026-05-20'
```

### EXISTS vs IN vs JOIN

```sql
-- EXISTS: detiene en el primer match
WHERE EXISTS (SELECT 1 FROM orders WHERE user_id = u.id AND status = 'paid')

-- IN: puede ser más lento en grandes subqueries
WHERE u.id IN (SELECT user_id FROM orders WHERE status = 'paid')

-- JOIN: si necesitas datos de ambas
INNER JOIN orders o ON o.user_id = u.id WHERE o.status = 'paid'
```

Verificar con EXPLAIN cuál es mejor en tu caso.

### COUNT(*) en tablas grandes

`SELECT COUNT(*) FROM big_table` es lento.

**Soluciones**:
- **PostgreSQL**: `SELECT reltuples FROM pg_class WHERE relname = 'big_table'` (estimación, gratis)
- **Mantener contador**: tabla con contador actualizado vía trigger o app
- **Estimación es OK**: en muchos casos (UI, paginación con "página X de muchas")

### Particionamiento

Para tablas muy grandes (>100M rows o >100GB):

```sql
-- PostgreSQL: partition by range (fechas)
CREATE TABLE logs (
  id BIGINT,
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE logs_2026_01 PARTITION OF logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE logs_2026_02 PARTITION OF logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ...
```

**Beneficios**:
- Queries con WHERE created_at = X solo escanean partition relevante
- DROP partition rápido (rotación)
- Indexes y vacuum más rápidos por partition

**Cuándo**:
- Tabla > 100GB
- Datos con orden natural (tiempo, geo)
- Hot/cold data (recientes consultadas, viejas archivadas)

### Materialized views

Para queries complejas que se repiten:

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT u.id, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

CREATE UNIQUE INDEX ON user_stats(id);

-- Refresh periódico
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
```

Trade-off: data un poco "vieja" pero query muy rápida.

## Tuning de configuración

### PostgreSQL key settings

```ini
# Memoria
shared_buffers = 25% RAM       # cache de páginas
effective_cache_size = 50-75% RAM  # estimación para planner
work_mem = 16MB                # memoria por sort/hash. ¡cuidado!
maintenance_work_mem = 256MB   # para VACUUM, CREATE INDEX

# Connections
max_connections = 100          # cuidado, cada uno usa work_mem

# Checkpoint
checkpoint_timeout = 15min
max_wal_size = 4GB             # WAL antes de checkpoint

# Random page cost (SSD)
random_page_cost = 1.1         # default 4 (HDD), bajar para SSD

# Parallel
max_parallel_workers_per_gather = 4

# Logging
log_min_duration_statement = 1000  # log queries > 1s
```

**Tool recomendado**: PGTune (https://pgtune.leopard.in.ua/) para starting point.

### MySQL InnoDB key settings

```ini
[mysqld]
innodb_buffer_pool_size = 50-70% RAM
innodb_log_file_size = 1G
innodb_flush_method = O_DIRECT
innodb_flush_log_at_trx_commit = 1  # 1 = ACID, 2 = más rápido pero perder 1s en crash

slow_query_log = ON
long_query_time = 1
```

## Estadísticas

El optimizer usa stats para elegir plan. Si están desactualizadas, plan es malo.

```sql
-- PostgreSQL
ANALYZE users;           -- una tabla
ANALYZE;                 -- todas
VACUUM ANALYZE users;    -- vacuum + analyze

-- Auto en background
-- autovacuum/autoanalyze on por default. Verificar:
SHOW autovacuum;

-- MySQL
ANALYZE TABLE users;
```

Cuando carga masiva: hacer `ANALYZE` después.

## Profiling de tablas

### Espacio en disco

```sql
-- PostgreSQL: top tablas por tamaño
SELECT
  schemaname || '.' || tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 20;
```

### Bloat (PostgreSQL)

VACUUM no devuelve espacio al SO, lo reusa. Si la tabla tuvo muchos deletes/updates, puede estar "bloated".

```sql
-- Verificar bloat con pgstattuple extension o consultas custom
-- VACUUM FULL libera espacio pero requiere lock fuerte
```

## Caché

Cachear queries que se repiten mucho:

**Redis** delante de la DB:
```
1. Buscar en Redis
2. Si miss → query DB → set en Redis con TTL
3. Si hit → return
```

**Cuidados**:
- Cache invalidation es difícil. TTL razonable.
- Inconsistencias si la app modifica DB sin invalidar cache.
- Cache stampede: múltiples requests al miss → query thundering herd. Resolver con locks o singleflight.

## Monitoring continuo

Metrics esenciales:

- **Queries/sec**: throughput
- **Slow queries count**: tendencia
- **CPU %**: alto sostenido → escalar o tunear
- **IOPS**: si saturado, mejorar storage
- **Connections**: cercano al límite es problema
- **Cache hit ratio**: en PG `pg_statio_user_tables`
- **Replication lag**: si hay replicas
- **Locks**: deadlocks count

## Anti-patterns de performance

- ❌ `SELECT *` en producción
- ❌ Índices "por si acaso"
- ❌ No medir antes ni después
- ❌ Optimizar sin EXPLAIN
- ❌ Cambiar índices en hot tables sin `CREATE INDEX CONCURRENTLY`
- ❌ Aumentar work_mem global "porque sí" (memoria total = work_mem × queries)
- ❌ Confundir cardinality con selectividad
- ❌ Resolver problema de diseño con índices
- ❌ Ignorar N+1
- ❌ Connection pool muy chico o muy grande
- ❌ ORDER BY sin LIMIT en grandes tables
- ❌ Comprar hardware más grande sin tunear primero

## Checklist de performance review

- [ ] Slow query log habilitado y revisado
- [ ] Top queries identificadas (pg_stat_statements)
- [ ] EXPLAIN ANALYZE en queries lentas
- [ ] Indexes faltantes agregados
- [ ] Indexes innecesarios eliminados
- [ ] N+1 queries fixed
- [ ] Connection pool tuneado
- [ ] Estadísticas actualizadas (ANALYZE)
- [ ] Configuración tuneada al hardware
- [ ] Cache implementado donde tiene sentido
- [ ] Particionamiento si tablas masivas
- [ ] Materialized views para queries complejas repetidas
- [ ] Métricas monitoreadas con alertas
