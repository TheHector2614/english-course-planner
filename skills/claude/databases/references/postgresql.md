# PostgreSQL — Features Avanzadas

Features que hacen a PG la opción correcta para tantos casos.

## JSONB

Almacenar JSON con queries eficientes e indexes.

```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar
INSERT INTO events (type, payload) VALUES
    ('order_created', '{"order_id": 123, "user_id": 5, "total": 99.99, "items": [...]}'),
    ('user_signup', '{"user_id": 7, "source": "google", "metadata": {"campaign": "spring"}}');
```

### Operadores

```sql
-- ->: get field (JSONB)
SELECT payload->'order_id' FROM events;

-- ->>: get field (TEXT)
SELECT payload->>'order_id' FROM events;

-- #>: get path (JSONB)
SELECT payload#>'{metadata,campaign}' FROM events;

-- #>>: get path (TEXT)
SELECT payload#>>'{metadata,campaign}' FROM events;

-- @>: contains
SELECT * FROM events WHERE payload @> '{"user_id": 5}';

-- ?: has key
SELECT * FROM events WHERE payload ? 'campaign';

-- ?| / ?&: any/all of keys
SELECT * FROM events WHERE payload ?| ARRAY['campaign', 'source'];
```

### Indexes

```sql
-- GIN para queries containment (@>, ?, ?|, ?&)
CREATE INDEX idx_events_payload_gin ON events USING GIN (payload);

-- Específico (más rápido, menos espacio)
CREATE INDEX idx_events_user_id ON events ((payload->>'user_id'));

-- Path específico
CREATE INDEX idx_events_campaign ON events ((payload#>>'{metadata,campaign}'));
```

### Cuándo JSONB

- ✅ Schemas variables/opcionales (settings, properties)
- ✅ Documentos semi-estructurados
- ✅ Audit/event logs con payload variable
- ✅ Cuando no quieres tabla EAV

### Cuándo NO

- ❌ Datos que vas a filtrar/joinear constantemente
- ❌ Datos críticos para integridad (mejor con CHECK en columnas)
- ❌ Si terminas con > 70% de queries usando JSONB → mejor normalizar

## CTEs (Common Table Expressions)

`WITH` para queries más legibles y reutilizables dentro de la misma query.

```sql
WITH recent_orders AS (
    SELECT user_id, COUNT(*) AS count
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
),
ranked_users AS (
    SELECT u.id, u.name, ro.count,
           RANK() OVER (ORDER BY ro.count DESC) AS rank
    FROM users u
    JOIN recent_orders ro ON ro.user_id = u.id
)
SELECT * FROM ranked_users WHERE rank <= 10;
```

### Recursive CTEs

Para jerarquías, grafos:

```sql
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_id, 1 AS depth, name::TEXT AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case
    SELECT c.id, c.name, c.parent_id, ct.depth + 1, ct.path || ' > ' || c.name
    FROM categories c
    INNER JOIN category_tree ct ON ct.id = c.parent_id
)
SELECT * FROM category_tree
ORDER BY path;
```

```sql
-- Buscar todos los descendientes de una categoría
WITH RECURSIVE descendants AS (
    SELECT id FROM categories WHERE id = $1
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN descendants d ON c.parent_id = d.id
)
SELECT * FROM products WHERE category_id IN (SELECT id FROM descendants);
```

## Window Functions

Agregaciones por "ventana" sin colapsar rows.

```sql
SELECT
    user_id,
    order_id,
    total,
    -- Ranking
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) AS rank_in_user,
    -- Acumulado
    SUM(total) OVER (PARTITION BY user_id ORDER BY created_at) AS cumulative_total,
    -- Comparar con anterior
    total - LAG(total) OVER (PARTITION BY user_id ORDER BY created_at) AS diff_from_prev,
    -- Moving average
    AVG(total) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7,
    -- Percentile
    PERCENT_RANK() OVER (ORDER BY total) AS percentile
FROM orders
WHERE created_at > NOW() - INTERVAL '30 days';
```

**Funciones útiles**:
- `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`: ranking
- `LAG()`, `LEAD()`: valor anterior/siguiente
- `FIRST_VALUE()`, `LAST_VALUE()`, `NTH_VALUE()`
- `SUM()`, `AVG()`, `COUNT()`: agregaciones acumulativas
- `NTILE(n)`: dividir en n buckets

### Top N por grupo

```sql
-- Top 3 orders más grandes por usuario
SELECT user_id, order_id, total
FROM (
    SELECT user_id, id AS order_id, total,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) AS rn
    FROM orders
) ranked
WHERE rn <= 3;
```

## Partitioning

Para tablas masivas (> 100M rows o > 100GB).

### Range partitioning (por fechas)

```sql
CREATE TABLE logs (
    id BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    level TEXT,
    message TEXT
) PARTITION BY RANGE (created_at);

CREATE TABLE logs_2026_01 PARTITION OF logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE logs_2026_02 PARTITION OF logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ...
```

**Automatizar creación**: pg_partman extension o cron job.

### List partitioning (por categoría)

```sql
CREATE TABLE events (
    id BIGINT,
    region TEXT NOT NULL,
    payload JSONB
) PARTITION BY LIST (region);

CREATE TABLE events_us PARTITION OF events FOR VALUES IN ('us-east', 'us-west');
CREATE TABLE events_latam PARTITION OF events FOR VALUES IN ('mx', 'co', 'ar', 'br');
CREATE TABLE events_eu PARTITION OF events FOR VALUES IN ('eu-west', 'eu-central');
```

### Hash partitioning (distribuir uniformemente)

```sql
CREATE TABLE orders (
    id BIGINT,
    user_id BIGINT NOT NULL,
    ...
) PARTITION BY HASH (user_id);

CREATE TABLE orders_p0 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE orders_p1 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE orders_p2 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE orders_p3 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 3);
```

### Partition pruning

PostgreSQL solo escanea partitions relevantes:
```sql
EXPLAIN SELECT * FROM logs WHERE created_at > '2026-05-01';
-- Solo escanea logs_2026_05 y posteriores
```

### Beneficios

- Queries por partition key son rápidas
- DROP partition rápido (rotación)
- VACUUM por partition (no toda la tabla)
- Indexes por partition más chicos

## Row-Level Security (RLS)

Filtros automáticos a nivel de fila. Útil para multi-tenancy o aislamiento.

```sql
-- Habilitar
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo ven sus orders
CREATE POLICY user_orders ON orders
    USING (user_id = current_setting('app.current_user_id')::BIGINT);

-- En la sesión, setear el user_id
SET app.current_user_id = '123';
SELECT * FROM orders;  -- solo orders de user 123
```

Multi-tenant:
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_insert ON orders
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::UUID);
```

Ver `multi-tenancy.md`.

**Bypass para admins**:
```sql
ALTER TABLE orders FORCE ROW LEVEL SECURITY;  -- aplica incluso a OWNER

-- O policy de admin
CREATE POLICY admin_all ON orders
    USING (current_user = 'admin_user');
```

## Generated columns

Columnas calculadas automáticamente.

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    price NUMERIC(10,2) NOT NULL,
    tax_rate NUMERIC(4,2) NOT NULL DEFAULT 0.19,
    price_with_tax NUMERIC(10,2) GENERATED ALWAYS AS (price * (1 + tax_rate)) STORED
);

-- Para FTS
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    body TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(body, ''))
    ) STORED
);
```

## Arrays

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    tags TEXT[] DEFAULT '{}',
    sizes INTEGER[] DEFAULT '{}'
);

INSERT INTO products (name, tags) VALUES
    ('Shirt', ARRAY['clothing', 'cotton', 'unisex']);

-- Queries
SELECT * FROM products WHERE 'cotton' = ANY(tags);
SELECT * FROM products WHERE tags @> ARRAY['cotton'];
SELECT * FROM products WHERE tags && ARRAY['cotton', 'wool'];  -- overlap

-- Index
CREATE INDEX idx_products_tags ON products USING GIN(tags);
```

**Cuándo arrays**:
- ✅ Cantidad chica de elementos (< 100)
- ✅ Datos que se leen como unidad
- ✅ No requieren queries individuales sobre cada elemento

**Cuándo NO**:
- ❌ Si vas a hacer FK a estos elementos
- ❌ Cientos/miles de elementos
- ❌ Si necesitas agregaciones sobre elementos → mejor tabla N:M

## Extensiones útiles

```sql
-- Listar disponibles
SELECT * FROM pg_available_extensions ORDER BY name;

-- Instaladas
SELECT * FROM pg_extension;
```

### Top extensiones

| Extensión | Para qué |
|---|---|
| `uuid-ossp` | Generar UUIDs |
| `pgcrypto` | Hashing, encryption, gen_random_uuid |
| `hstore` | Key-value en columna (predecesor de JSONB) |
| `pg_trgm` | Fuzzy text matching, similarity |
| `unaccent` | Quitar acentos para búsqueda |
| `citext` | Case-insensitive text |
| `postgis` | Geo/spatial |
| `pgvector` | Vector embeddings |
| `timescaledb` | Time-series |
| `pg_stat_statements` | Query stats |
| `pgaudit` | Audit logging |
| `pg_partman` | Auto-manage partitions |
| `pg_cron` | Cron jobs in DB |
| `postgres_fdw` | Foreign Data Wrapper (query other PG DBs) |

### pgcrypto

```sql
CREATE EXTENSION pgcrypto;

-- UUIDs random
SELECT gen_random_uuid();

-- Hash
SELECT digest('password', 'sha256');

-- Encriptar (symmetric)
SELECT pgp_sym_encrypt('secret data', 'password');
SELECT pgp_sym_decrypt('...'::bytea, 'password');

-- bcrypt (mejor para passwords)
SELECT crypt('user_password', gen_salt('bf', 12));
```

### pg_trgm (fuzzy search)

```sql
CREATE EXTENSION pg_trgm;

-- Similitud
SELECT similarity('hola mundo', 'olla mundo');  -- 0.4

-- Buscar similares
SELECT name FROM users
WHERE name % 'aliceee'  -- match aproximado
ORDER BY similarity(name, 'aliceee') DESC;

-- Index trigram (para búsqueda LIKE %x% rápida)
CREATE INDEX idx_users_name_trgm ON users USING GIN (name gin_trgm_ops);
SELECT * FROM users WHERE name ILIKE '%alic%';  -- usa el index
```

## Foreign Data Wrappers (FDW)

Query DB externa como si fuera local.

```sql
CREATE EXTENSION postgres_fdw;

CREATE SERVER remote_db
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'remote.example.com', dbname 'mydb');

CREATE USER MAPPING FOR CURRENT_USER
    SERVER remote_db
    OPTIONS (user 'myuser', password 'mypass');

CREATE FOREIGN TABLE remote_users (
    id BIGINT,
    email TEXT
) SERVER remote_db OPTIONS (schema_name 'public', table_name 'users');

-- Ahora consultable como tabla local
SELECT * FROM remote_users LIMIT 10;
```

Disponibles para: PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, Redis, files (CSV), HTTP.

## Replication

### Streaming replication (estándar)

Master → replicas síncronas o asíncronas. Read scaling, HA.

```ini
# postgresql.conf en master
wal_level = replica
max_wal_senders = 10
wal_keep_size = 64
```

```ini
# postgresql.conf en replica
hot_standby = on
```

### Logical replication

Replicar tablas específicas, cross-version, cross-platform.

```sql
-- Publisher
CREATE PUBLICATION my_pub FOR TABLE users, orders;

-- Subscriber
CREATE SUBSCRIPTION my_sub
    CONNECTION 'host=publisher dbname=mydb user=replication'
    PUBLICATION my_pub;
```

Usos:
- Migrar entre versiones de PG
- Sync a otra región
- ETL a data warehouse

### Replication tools

- **patroni**: HA con failover automático
- **repmgr**: management de réplicas
- **pgBackRest**: backups + restore PITR

## Performance specific to PG

### VACUUM

PostgreSQL usa MVCC: updates/deletes dejan filas muertas. VACUUM las limpia.

```sql
-- Manual (no en horarios pico)
VACUUM (VERBOSE, ANALYZE) users;

-- Full (libera espacio al SO, requiere lock fuerte)
VACUUM FULL users;
```

**Autovacuum**: corre automático. Verificar configuración:
```sql
SHOW autovacuum;
SELECT * FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;
```

### Configuración para SSD

```ini
random_page_cost = 1.1     # default 4 (HDD), bajar para SSD
effective_io_concurrency = 200  # default 1
```

### Parallel queries

```ini
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

PG decide cuándo paralelizar (queries grandes con `SELECT count(*) FROM big_table`, etc.).

## Type custom

```sql
CREATE TYPE address AS (
    street TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    home_address address,
    work_address address
);

INSERT INTO users (name, home_address) VALUES
    ('Alice', ROW('Calle 123', 'Bogotá', 'CO', '110111'));

SELECT name, (home_address).city FROM users;
```

Composite types son útiles para evitar repetir columnas. Pero JSONB suele ser más práctico hoy.

## ENUM types

```sql
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    status order_status NOT NULL DEFAULT 'pending'
);

-- Agregar valor (PG 12+)
ALTER TYPE order_status ADD VALUE 'refunded' AFTER 'cancelled';
```

⚠️ No se pueden eliminar valores fácilmente.

## Triggers y functions

```sql
-- Function PL/pgSQL
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

Triggers útiles pero usar con moderación:
- Lógica oculta (no obvia al leer la app)
- Difícil de debuggear
- Performance impact

**Cuándo SÍ**: campos calculados, audit trail, validaciones complejas que la app no puede garantizar.

## NOTIFY / LISTEN (pub/sub built-in)

```sql
-- Notificar
NOTIFY my_channel, 'payload';

-- Escuchar (en otra conexión)
LISTEN my_channel;
-- Recibe notificaciones
```

Usado por:
- LiveView (Phoenix), Hotwire, Supabase Realtime
- Sync local cache cuando DB cambia
- Eventos ligeros sin agregar message broker

## Backups específicos PG

```bash
# Logical backup
pg_dump -Fc -d mydb -f mydb.dump

# Restore
pg_restore -d mydb_new mydb.dump

# Físico (faster, requiere mismo PG version)
pg_basebackup -D /backups/$(date +%F) -Ft -z

# Continuous (WAL archiving) + PITR
# Configurar archive_mode, archive_command
```

## Checklist PostgreSQL-specific

- [ ] Versión actualizada (cada major support 5 años)
- [ ] Configuración tuneada al hardware (pgtune como starting point)
- [ ] Autovacuum funcionando (revisar dead_tup)
- [ ] pg_stat_statements habilitado para diagnóstico
- [ ] Extensiones útiles instaladas (pgcrypto, pg_trgm, etc.)
- [ ] SSL forzado en conexiones
- [ ] Backups con pg_dump y/o WAL archiving
- [ ] Replicación si HA es requisito
- [ ] Indexes apropiados (B-tree, GIN, GiST según caso)
- [ ] VACUUM manual periódico si autovacuum no es suficiente
- [ ] Monitoring con pg_stat_*  views
- [ ] EXPLAIN ANALYZE para queries lentas
