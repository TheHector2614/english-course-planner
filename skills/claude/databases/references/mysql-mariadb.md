# MySQL / MariaDB

Notas específicas y diferencias con PostgreSQL.

## MySQL vs MariaDB

MariaDB es fork de MySQL (2009). Diferencias:

| | MySQL | MariaDB |
|---|---|---|
| Owner | Oracle | MariaDB Foundation |
| Licencia | GPL + commercial | GPL |
| Features nuevos | Más lento | Más rápido (a veces) |
| Storage engines | InnoDB, MyISAM | + Aria, ColumnStore, otros |
| JSON | JSON type | JSON type + funciones extras |
| Compatibilidad | - | Mayormente con MySQL, pero diverge |
| Cloud managed | RDS, GCP, Aurora MySQL | RDS MariaDB, SkySQL |

**Para nuevos proyectos**: ambos son válidos. MySQL si quieres ecosistema más amplio (RDS, Aurora MySQL, etc.); MariaDB si valoras open source puro.

## Storage engines

**InnoDB** (default desde MySQL 5.5):
- ACID transactional
- Foreign keys
- Row-level locking
- Crash recovery
- **Usar siempre InnoDB**

MyISAM:
- Sin transactions, sin FKs
- Table-level locking
- Más rápido para lecturas, pero no vale por las limitaciones
- **Solo legacy**, no usar en nuevos proyectos

## Tipos importantes

```sql
-- Numéricos
TINYINT      -- 1 byte (boolean efectivo: 0/1)
SMALLINT     -- 2 bytes
INT          -- 4 bytes
BIGINT       -- 8 bytes
DECIMAL(M,D) -- precisión exacta (dinero)
FLOAT, DOUBLE -- aproximados (NO usar para dinero)

-- String
VARCHAR(n)   -- variable hasta n
CHAR(n)      -- fijo
TEXT         -- texto largo (no permite default value, mejor VARCHAR si cabe)
LONGTEXT     -- hasta 4GB

-- Fecha/Tiempo
DATE
TIME
DATETIME     -- sin timezone (8 bytes)
TIMESTAMP    -- con timezone implícita UTC (4 bytes, hasta 2038!)
YEAR

-- JSON
JSON         -- nativo desde MySQL 5.7
```

**TIMESTAMP vs DATETIME**:
- TIMESTAMP: 4 bytes, conversión auto a UTC, limitado a 1970-2038
- DATETIME: 8 bytes, sin timezone (guardar UTC manualmente), sin límite

**Recomendación**: DATETIME para futuro-proof.

## Character set y collation

Históricamente MySQL tenía utf8 (3 bytes, no soporta emojis). Usar siempre **utf8mb4**:

```sql
-- Default DB
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

**Collations comunes**:
- `utf8mb4_unicode_ci`: standard, case-insensitive
- `utf8mb4_unicode_520_ci`: más moderno
- `utf8mb4_0900_ai_ci`: MySQL 8 default, mejor
- `utf8mb4_bin`: binary, case-sensitive

## AUTO_INCREMENT

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ...
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email)
);
```

**Recomendación**: `BIGINT UNSIGNED AUTO_INCREMENT` para PKs.

## Indexes en MySQL

```sql
-- Crear
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Unique
CREATE UNIQUE INDEX uk_users_email ON users(email);

-- Compuesto
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Full-text
CREATE FULLTEXT INDEX ft_articles ON articles(title, body);

-- Hash (solo Memory engine, no para uso general)

-- Prefix (para columnas TEXT/largas)
CREATE INDEX idx_articles_title_prefix ON articles(title(50));
```

### `EXPLAIN`

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 5;
EXPLAIN FORMAT=JSON SELECT ...;
EXPLAIN ANALYZE SELECT ...;  -- MySQL 8.0.18+
```

Tipos importantes en `type`:
- `system`, `const`, `eq_ref`: ideal
- `ref`, `range`: bueno
- `index`: full index scan
- `ALL`: full table scan (red flag)

## Foreign Keys

```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    ...
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

**Importante**: requiere InnoDB. FKs deshabilitadas en MyISAM.

⚠️ MySQL automáticamente **crea índice** en columna FK (a diferencia de PostgreSQL).

## Transactions

```sql
START TRANSACTION;
-- o BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- o ROLLBACK;
```

**Isolation levels**:
- `READ UNCOMMITTED`: dirty reads (no usar)
- `READ COMMITTED`: como PostgreSQL default
- `REPEATABLE READ`: **MySQL default**, snapshot consistency
- `SERIALIZABLE`: lockeo total

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## Replication

### Standard async replication

Master → Replica. Configuración con `server_id`, binary log.

```ini
# my.cnf master
server_id = 1
log_bin = mysql-bin
binlog_format = ROW

# my.cnf replica
server_id = 2
relay_log = relay-bin
read_only = ON
```

### GTID (Global Transaction Identifier)

Tracking de transacciones distribuido. Más robusto que basado en posición de log.

```ini
gtid_mode = ON
enforce_gtid_consistency = ON
```

### Group Replication / InnoDB Cluster

Multi-master con consenso (Paxos-like). MySQL Group Replication o MariaDB Galera.

### Replicación lógica

MySQL: binlog con `binlog_format = ROW`.
MariaDB: 10.0+ tiene logical replication más maduro.

## Particionamiento

```sql
CREATE TABLE logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    message TEXT,
    PRIMARY KEY (id, created_at)  -- partition key debe estar en PK/UK
)
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p_2026_01 VALUES LESS THAN (TO_DAYS('2026-02-01')),
    PARTITION p_2026_02 VALUES LESS THAN (TO_DAYS('2026-03-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Tipos: RANGE, LIST, HASH, KEY
```

**Limitaciones**:
- Partition key debe estar en TODAS las PKs/UKs de la tabla
- No FKs cruzando partitions
- Menos flexible que PostgreSQL

## JSON en MySQL

```sql
CREATE TABLE events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payload JSON NOT NULL
);

INSERT INTO events (payload) VALUES
    ('{"user_id": 5, "action": "login"}');

-- Acceso
SELECT JSON_EXTRACT(payload, '$.user_id') FROM events;
SELECT payload->'$.user_id' FROM events;     -- shorthand
SELECT payload->>'$.user_id' FROM events;    -- unquoted

-- Filtrar
SELECT * FROM events WHERE JSON_EXTRACT(payload, '$.action') = 'login';
SELECT * FROM events WHERE payload->>'$.user_id' = '5';

-- Functions útiles
JSON_OBJECT('key', value)
JSON_ARRAY(1, 2, 3)
JSON_CONTAINS(payload, '"login"', '$.action')
JSON_SET(payload, '$.flag', TRUE)
JSON_REMOVE(payload, '$.temp')
JSON_MERGE_PATCH(...)
```

**Indexes en JSON**: usar generated columns + index normal.

```sql
ALTER TABLE events
    ADD COLUMN user_id BIGINT GENERATED ALWAYS AS (payload->>'$.user_id') VIRTUAL,
    ADD INDEX idx_events_user_id (user_id);
```

JSON en MySQL es funcional pero menos potente que PostgreSQL JSONB.

## Configuración importante

```ini
[mysqld]
# Buffer pool: 50-70% de RAM
innodb_buffer_pool_size = 8G

# Log files
innodb_log_file_size = 1G

# Flush: 1=ACID, 2=más rápido (puede perder 1s de tx en crash)
innodb_flush_log_at_trx_commit = 1
sync_binlog = 1

# Connections
max_connections = 200

# Slow query log
slow_query_log = ON
long_query_time = 1
slow_query_log_file = /var/log/mysql/slow.log

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Tiempo de wait_timeout (importante para connection pools)
wait_timeout = 28800       # default 8 horas
interactive_timeout = 28800
```

## Connection pool considerations

`max_lifetime` del pool < `wait_timeout` del server. Default Hikari es 30 min, MySQL `wait_timeout` 8h: OK.

Si conexiones mueren, errores `MySQLNonTransientConnectionException`. Verificar timeouts.

## Common pitfalls

- ❌ utf8 (3 bytes) en lugar de utf8mb4 (legacy default, no soporta emojis)
- ❌ MyISAM en nuevos proyectos
- ❌ DATETIME vs TIMESTAMP confusión (TIMESTAMP solo hasta 2038)
- ❌ FLOAT para dinero
- ❌ Sin AUTO_INCREMENT UNSIGNED (waste de la mitad del rango)
- ❌ Sin index en cols de WHERE/JOIN
- ❌ `SELECT *` en producción
- ❌ Implicit commits con DDL en transactions (MySQL no soporta DDL transaccional)
- ❌ `REPEATABLE READ` causando issues raros (cambiar a `READ COMMITTED` en muchos casos)
- ❌ `wait_timeout` < pool max_lifetime → conexiones "muertas"
- ❌ `BLOB`/`TEXT` en lugar de archivos externos

## Performance tools

- **Percona Toolkit**: `pt-query-digest`, `pt-online-schema-change`
- **mysqltuner**: análisis básico
- **EverSQL**: web tool para optimizar queries
- **PMM (Percona Monitoring)**: dashboards
- **MySQL Workbench**: GUI oficial con visual EXPLAIN

## Cuándo MySQL vs PostgreSQL

| Razón | DB |
|---|---|
| Aplicación tradicional (WordPress, Magento) | MySQL/MariaDB |
| Replicación bien establecida | MySQL |
| Soporte amplio en hosting barato | MySQL |
| JSON, geo, FTS avanzado | PostgreSQL |
| Extensiones (vector, time-series, geo) | PostgreSQL |
| Mayor consistencia ACID | PostgreSQL |
| Decision desde cero | PostgreSQL (default) |

## Checklist MySQL/MariaDB

- [ ] InnoDB para todas las tablas
- [ ] utf8mb4 charset
- [ ] FKs declaradas con índices
- [ ] AUTO_INCREMENT UNSIGNED
- [ ] DATETIME para timestamps con UTC
- [ ] Slow query log habilitado
- [ ] innodb_buffer_pool_size tuneado
- [ ] Backups con mysqldump + binary logs
- [ ] Replicación si HA crítica
- [ ] Connection pool wait_timeout alineado
- [ ] SSL/TLS forzado en producción
