---
name: databases
description: Skill mixta completa para bases de datos - modelado (SQL/NoSQL), performance, migraciones, backups, replicación, multi-tenancy y elección de DB. Cubre PostgreSQL, MySQL/MariaDB, MongoDB, Redis, DynamoDB, SQL Server, Oracle, SQLite. Incluye búsqueda full-text, vector, geo y time-series. Integra con web-backend-security. Activar cuando el usuario mencione "base de datos", "DB", "schema", "tabla", "query", "SQL", "NoSQL", "modelo de datos", "índice", "index", "migración", "Flyway", "Liquibase", "Prisma", "PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Redis", "Oracle", "performance DB", "query lenta", "N+1", "JOIN", "normalización", "particionamiento", "sharding", "replicación", "backup", "restore", "vector search", "embedding", "full-text", "time-series", "ER diagram", "EXPLAIN", "deadlock", o pida modelar/diseñar/optimizar/migrar/auditar bases de datos o elegir qué DB usar.
---

# Databases — Mixed Complete Skill

Skill para modelado, performance, operaciones y elección de bases de datos.

## Relación con otras skills (no duplicar)

Esta skill se enfoca en **el dato en sí**. Otras skills cubren temas adyacentes:

| Skill | Cubre | Esta skill complementa con |
|---|---|---|
| `aws-cloud` | Infra AWS (RDS, Aurora, DynamoDB, ElastiCache) | Modelado, queries, performance |
| `java-backend` | JPA/Hibernate, JDBC Template desde Java | Schema design independiente del lenguaje |
| `web-backend-security` | Queries seguras, encriptación, secrets | Diseño con seguridad en mente |

Cuando se solapen, **delegar a la skill especializada** o mencionarla. Esta skill no re-explica IaC ni código Java en detalle.

## Principios

### 1. Elegir DB según el caso, no por moda

Hay DBs que son "buenas para todo" y DBs especializadas. Por defecto:
- **PostgreSQL** es la respuesta correcta el 80% del tiempo
- Solo elegir especializada si hay razón concreta

Ver árbol de decisión en `references/choosing-database.md`.

### 2. Modelo de acceso antes que modelo de datos

Antes de modelar tablas/collections, listar **qué queries necesitas hacer**. El modelo se diseña para servir esos accesos.

Especialmente crítico en NoSQL (DynamoDB, MongoDB): añadir queries no planeadas a posteriori puede requerir rediseño completo.

### 3. Empezar normalizado, denormalizar después con datos

En SQL: empezar en 3NF. Si el profile demuestra problemas de performance, denormalizar selectivamente. Premature denormalization causa bugs de consistencia.

### 4. Indexes con propósito

Cada index acelera lecturas pero penaliza escrituras y storage. Solo crear indexes que respondan a queries reales del workload.

### 5. Migraciones forward-only, idempotentes

Cada migración:
- Tiene número/timestamp único e inmutable
- No se modifica después de aplicarse
- Es atómica (todo o nada)
- Se puede ejecutar múltiples veces sin romper (idempotente cuando es viable)

### 6. Seguridad por defecto

Aplicar siempre las prácticas de `web-backend-security`:
- Queries parametrizadas (no string concat)
- Encriptación at-rest
- Encriptación in-transit (TLS)
- Secrets en gestor (Secrets Manager, Vault)
- Principio de mínimo privilegio en usuarios DB
- Audit logging

## Flujos de trabajo

### Flujo A — "Diseña el schema para X"

1. **Entender el dominio**: entidades, relaciones, reglas de negocio
2. **Listar accesos**: queries, volumen, frecuencia, latencia esperada
3. **Elegir tipo de DB** (consultar `choosing-database.md`)
4. **Modelar**:
   - SQL: tablas normalizadas, FKs, indexes, constraints
   - NoSQL: documentos/items según patrón de acceso
5. **Generar DDL** o equivalente (CreateCollection, CreateTable)
6. **Generar primera migración** (Flyway/Liquibase/Prisma según preferencia)
7. **Diagrama ER** (con `Figma:generate_diagram` o `visualize:show_widget`)

### Flujo B — "Mi query está lenta"

1. Obtener el query exacto + EXPLAIN ANALYZE / explain plan
2. Identificar el problema:
   - Falta de index
   - Index incorrecto (low selectivity, mal orden)
   - Bad join order
   - N+1 (problema de ORM)
   - Sequential scan en tabla grande
   - Spillage de memoria (sort en disco)
   - Estadísticas desactualizadas
3. Proponer fix con beneficio esperado y costo (storage, escritura)
4. Si es N+1: arreglar en el código, no en SQL
5. Verificar con EXPLAIN después del fix

Consultar `references/performance-tuning.md`.

### Flujo C — "Necesito migrar el schema"

1. Identificar la herramienta (Flyway, Liquibase, Prisma, ORM nativo)
2. Generar la migración:
   - Operaciones aditivas primero (add column, add table, add index CONCURRENTLY)
   - Después: backfill de datos si requiere
   - Por último: dropear lo viejo (en una migración posterior)
3. Considerar **expand-contract** pattern para zero-downtime
4. Ver impact en producción: locks, tiempo estimado, rollback plan

Consultar `references/migrations.md`.

### Flujo D — "¿Qué DB uso para X?"

1. Recopilar requisitos: volumen, latencia, consistencia, queries
2. Aplicar árbol de decisión
3. Proponer **2-3 opciones** con trade-offs
4. Recomendar con justificación
5. Mencionar consideraciones de costo y operación

### Flujo E — "Auditoría/health check de DB existente"

1. Obtener info: motor, versión, tamaño, queries más frecuentes
2. Aplicar checklist (ver `references/health-check.md`):
   - Schema design
   - Indexes (faltantes, duplicados, unused)
   - Query performance (top slow queries)
   - Configuración (memory, connections)
   - Backups
   - Seguridad
   - Monitoring
3. Reportar findings con severidad y plan

### Flujo F — "Modelar búsqueda especial" (full-text, vector, geo, time-series)

Ver `references/specialized-search.md`. Decidir:
- En la misma DB (PostgreSQL es muy capaz)
- En DB especializada (OpenSearch, Pinecone, TimescaleDB, etc.)

## Elección rápida de DB

Detalles completos en `references/choosing-database.md`. Resumen:

| Caso | DB recomendada |
|---|---|
| App típica con esquema relacional | **PostgreSQL** |
| MySQL legacy / requisito | MySQL 8 / MariaDB |
| Key-value de bajo costo y latencia | DynamoDB (cloud) o Redis (in-memory) |
| Documents con queries flexibles | MongoDB o PostgreSQL JSONB |
| Cache, sesiones, rate limiting | Redis |
| Full-text search heavy | OpenSearch / Elasticsearch (o PostgreSQL FTS para empezar) |
| Vector / semantic search | pgvector (PG) o Pinecone/Qdrant/Weaviate dedicados |
| Time-series (métricas, IoT) | TimescaleDB (PG) o Timestream/InfluxDB |
| Geo/spatial | PostGIS (PG) o MongoDB con índices geo |
| Graph / relaciones complejas | Neo4j o PostgreSQL con CTEs recursivas |
| Embebida / local | SQLite (server-less, archivo único) |
| OLAP / analytics | Redshift, BigQuery, Snowflake, ClickHouse, DuckDB |
| Apps mobile-first con sync | Firestore, Realm, Supabase |

**Default seguro**: PostgreSQL. Soporta JSON, full-text, geo, time-series (con extension), y vector (con pgvector). Para muchos proyectos, no necesitas más.

## Convenciones universales de naming

### Tablas
- `snake_case`
- **Plural**: `users`, `orders`, `order_items` (convención más común; algunos prefieren singular)
- Sin prefijos innecesarios (`tbl_users` no)

### Columnas
- `snake_case`
- ID primario: `id` (no `user_id` en tabla `users`)
- FK: `<entidad>_id`: `user_id`, `order_id`
- Booleanos: prefijo `is_`, `has_`: `is_active`, `has_paid`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)
- Conteo: sufijo `_count`: `views_count`
- Si hay versionado optimista: `version`

### Índices
- `idx_<tabla>_<columnas>`: `idx_orders_user_id`
- Únicos: `uq_<tabla>_<columnas>`
- FK constraints: `fk_<tabla>_<referencia>`

### Migraciones
- Numéricas o timestamp: `V1__init.sql`, `V20260519_120000__add_users.sql`
- Descriptivas: `V5__add_email_index_to_users.sql`

## Patrones universales SQL

### Soft delete

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Queries siempre filtran
SELECT * FROM users WHERE deleted_at IS NULL;

-- Soft delete
UPDATE users SET deleted_at = NOW() WHERE id = 123;
```

Trade-off: queries deben filtrar siempre; tabla crece para siempre; FKs siguen apuntando. Considerar **partition** o **archive** si crece mucho.

### Audit trail (created_at, updated_at)

```sql
-- PostgreSQL trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

### Optimistic locking

```sql
ALTER TABLE accounts ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Update con check de version
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;
-- Si retorna 0 filas, alguien lo modificó antes
```

### Surrogate vs natural keys

- **Surrogate** (`id` autoincremental o UUID): default. Estable, simple.
- **Natural** (email, CUIT, SKU): solo si el campo es genuinamente único e inmutable. Difícil de garantizar.

**Recomendación**: surrogate + unique constraint en natural key cuando aplique.

### UUID vs bigserial/identity

| | UUID | bigserial/identity |
|---|---|---|
| Único globalmente | Sí (sin coordinación) | No (necesita coord cross-DB) |
| Tamaño | 16 bytes | 8 bytes |
| Index performance | Peor (random) | Mejor (sequential) |
| Adivinable | No | Sí |
| Generable en cliente | Sí | No |

**Recomendación**:
- bigserial/identity para tablas internas
- UUID (preferir v7, ordenable por tiempo) para IDs públicos en URLs/APIs
- O ambos: `id BIGSERIAL` interno + `public_id UUID UNIQUE`

### Multi-tenancy patterns

Ver `references/multi-tenancy.md` para detalles. Tres patrones:

| Patrón | Aislamiento | Costo | Complejidad |
|---|---|---|---|
| **Database per tenant** | Máximo | Alto | Baja |
| **Schema per tenant** | Alto | Medio | Media |
| **Shared schema** (tenant_id en cada tabla) | Bajo | Bajo | Alta |

Para shared schema: **CADA query debe filtrar por `tenant_id`**. Usar Row-Level Security (RLS) en Postgres o filtros automáticos del ORM.

### JSONB en PostgreSQL

Almacenar JSON con queries:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  data JSONB NOT NULL
);

-- Query con extracción
SELECT data->>'name', data->'specs'->>'cpu'
FROM products
WHERE data->>'category' = 'laptop';

-- GIN index para queries en JSONB
CREATE INDEX idx_products_data_gin ON products USING GIN (data);

-- Index específico
CREATE INDEX idx_products_category ON products ((data->>'category'));
```

**Cuándo JSONB**: campos variables (specs, settings) o documentos sin schema estricto.
**Cuándo NO**: cosas que vas a filtrar/joinear mucho. Columnas separadas son más eficientes.

## Patrones universales NoSQL

### Single-table design (DynamoDB)

Una tabla con tipos de items mezclados, claves compuestas:

```
PK              SK                          Type      Data
USER#u1         USER#u1                     User      name=Alice
USER#u1         ORDER#o1                    Order     amount=100
USER#u1         ORDER#o2                    Order     amount=200
ORDER#o1        PRODUCT#p1                  LineItem  qty=2
```

Beneficios: pocas operaciones, queries eficientes con `BeginsWith`. Más complejo pero idiomático en DynamoDB.

### Embebido vs referencias (MongoDB)

```javascript
// Embebido — bueno si siempre se leen juntos
{
  _id: ObjectId(),
  name: "Alice",
  addresses: [
    { street: "...", city: "..." },
    { street: "...", city: "..." }
  ]
}

// Referencia — bueno si la entidad relacionada es grande o reutilizada
{
  _id: ObjectId(),
  name: "Alice",
  addressIds: [ObjectId("..."), ObjectId("...")]
}
```

Regla: si embebido > 16 MB o cambia mucho, usar referencia.

### Redis: data structures por caso

| Estructura | Cuándo |
|---|---|
| **String** | Cache de objetos (JSON serializado), counters |
| **Hash** | Objetos con campos accedidos individualmente |
| **List** | Queues, recent items |
| **Set** | Tags, miembros únicos |
| **Sorted Set** | Leaderboards, time-ordered queues |
| **Stream** | Event streaming (Kafka-lite) |
| **Pub/Sub** | Mensajería ligera |
| **HyperLogLog** | Contadores aproximados (cardinality) |
| **Geo** | Búsquedas por proximidad |

## Búsquedas especiales

### Full-text search

**PostgreSQL** (gratis, para empezar):
```sql
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || body)) STORED;

CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

SELECT * FROM articles
WHERE search_vector @@ to_tsquery('spanish', 'inteligencia & artificial');
```

**OpenSearch / Elasticsearch**: si tienes >10M docs o búsqueda compleja (fuzzy, faceting, etc.).

### Vector / semantic search

**pgvector** (extension de PostgreSQL):
```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536)  -- OpenAI ada-002 dimension
);

CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Búsqueda por similitud
SELECT content
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

Alternativas dedicadas: **Pinecone**, **Qdrant**, **Weaviate**, **Milvus**.

### Geo / spatial

**PostGIS** (PostgreSQL):
```sql
CREATE EXTENSION postgis;

CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  geom GEOGRAPHY(POINT, 4326)
);

CREATE INDEX idx_locations_geom ON locations USING GIST(geom);

-- Buscar dentro de 5km
SELECT name
FROM locations
WHERE ST_DWithin(
  geom,
  ST_MakePoint(-74.0721, 4.7110)::geography,
  5000  -- meters
);
```

### Time-series

**TimescaleDB** (extension PostgreSQL):
```sql
CREATE EXTENSION timescaledb;

CREATE TABLE metrics (
  time TIMESTAMPTZ NOT NULL,
  device_id INT NOT NULL,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION
);

SELECT create_hypertable('metrics', 'time');

-- Continuous aggregate (rollup)
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS hour,
  device_id,
  AVG(temperature) AS avg_temp
FROM metrics
GROUP BY hour, device_id;
```

Alternativas: **InfluxDB**, **AWS Timestream**, **ClickHouse**.

Ver `references/specialized-search.md` para detalles completos.

## Performance: top 5 cosas a revisar siempre

1. **Indexes**: faltantes (queries lentas en cols sin index) y unused (waste de storage/writes)
2. **EXPLAIN ANALYZE** de queries lentas: identificar sequential scans, joins ineficientes
3. **N+1**: ORM ejecutando una query por iteración en lugar de JOIN
4. **Connection pool**: agotado, conexiones huérfanas, configuración incorrecta
5. **Stats actualizadas**: PostgreSQL/MySQL hacen autovacuum/autoanalyze, pero verificar

Ver `references/performance-tuning.md`.

## Migraciones: principios

1. **Forward-only** (no rollback automático; nueva migración para revertir)
2. **Idempotentes** cuando sea viable (`CREATE TABLE IF NOT EXISTS`)
3. **Atomicas** (DDL en transacción cuando el motor lo soporta)
4. **Expand-contract** para zero-downtime
5. **Versionadas e inmutables** (no modificar migración aplicada)

Ver `references/migrations.md` para Flyway, Liquibase, Prisma y patterns.

## Seguridad (delegación a `web-backend-security`)

Aplica todas las prácticas de esa skill. Esta skill añade lo específico de DB:

- **Encriptación at-rest**: habilitar en motor (TDE) y/o app-level para columnas sensibles
- **Encriptación in-transit**: TLS 1.2+ forzado (`require_ssl=on`)
- **Usuarios DB**: uno por aplicación, con least privilege (no usar `root`/`postgres`)
- **Password rotation**: vía Secrets Manager u otra solución
- **Audit logs**: pgaudit (PostgreSQL), unified audit (Oracle), audit log plugin (MySQL)
- **Row-Level Security (RLS)**: en PostgreSQL para multi-tenancy o data isolation
- **Backups encriptados** y testeados regularmente
- **Queries parametrizadas siempre** (responsabilidad del código pero verificar)
- **SQL injection prevention**: nunca string concat, parameterized queries

## Output esperado

Cuando completes un flujo, según el caso:

### Si es schema design
- DDL completo (`CREATE TABLE ...`)
- Migraciones (Flyway/Liquibase/Prisma según preferencia)
- ER diagram (`Figma:generate_diagram` con erDiagram)
- Indexes propuestos con justificación
- Estimación inicial de tamaño/crecimiento

### Si es performance
- EXPLAIN antes/después
- Indexes propuestos con costo/beneficio
- Refactor de queries con comparación
- Plan de aplicación (con/sin downtime)

### Si es migración
- Archivos de migración listos
- Comandos para aplicar
- Plan de rollback (migración inversa)
- Estimación de tiempo y locks

### Si es elección de DB
- Tabla comparativa de opciones
- Recomendación con razones
- Costo estimado
- Plan de prueba (proof of concept)

## Referencias

- `references/choosing-database.md` — árbol de decisión completo, comparativa por caso de uso
- `references/postgresql.md` — features avanzadas PG (JSONB, CTEs, window functions, partitioning, RLS, extensiones)
- `references/mysql-mariadb.md` — MySQL/MariaDB específico: engines (InnoDB), replication, particiones
- `references/sql-server-oracle.md` — SQL Server y Oracle: features enterprise, T-SQL/PLSQL
- `references/sqlite.md` — embedded use cases, WAL, limits
- `references/mongodb.md` — modeling, indexes, aggregation, sharding
- `references/dynamodb.md` — single-table design, GSI/LSI, capacity modes
- `references/redis.md` — data structures, persistence, replication, sentinel/cluster
- `references/modeling-relational.md` — normalización, claves, relaciones, anti-patterns
- `references/modeling-nosql.md` — patrones NoSQL (DynamoDB y MongoDB), access pattern-first design
- `references/performance-tuning.md` — EXPLAIN, indexes, query optimization, N+1, connection pooling
- `references/migrations.md` — Flyway, Liquibase, Prisma, expand-contract, zero-downtime
- `references/multi-tenancy.md` — 3 patterns con trade-offs y código
- `references/specialized-search.md` — full-text, vector, geo, time-series con cada motor
- `references/backups-replication.md` — backups, restore testing, replicación, read replicas
- `references/health-check.md` — checklist de auditoría de DB existente

## Lo que NUNCA hay que hacer

- ❌ Diseñar NoSQL sin tener claros los patrones de acceso
- ❌ Crear indexes "por si acaso"
- ❌ String concatenation en queries (SQL injection)
- ❌ Cambiar migraciones ya aplicadas
- ❌ `SELECT *` en producción
- ❌ Hacer COUNT(*) en tablas grandes sin necesidad
- ❌ N+1 queries (loops con queries dentro)
- ❌ Borrar tablas en migración sin plan de recuperación
- ❌ Cambiar tipo de columna sin considerar locks
- ❌ Soft delete sin filtrar en todas las queries
- ❌ Multi-tenancy shared schema sin enforcement de tenant_id
- ❌ Backups sin probar restores
- ❌ DBs públicamente accesibles
- ❌ Una sola DB user para todo (root para la app)
- ❌ Usar UUID v4 como PK en tablas que crecen mucho (random = peor índice)
- ❌ Encriptar columnas que necesitas indexar/buscar (rompe búsqueda)
- ❌ Confiar en validación solo de la app (constraints en DB también)
- ❌ Deshabilitar foreign keys "para performance" (sin medir)
- ❌ Migrar de SQL a NoSQL "porque escala mejor" sin entender los trade-offs
