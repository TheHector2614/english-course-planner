# SQLite

DB embebida, sin servidor, en un solo archivo. Pequeña pero más capaz de lo que piensas.

## Cuándo usar

✅ **Sí**:
- Apps mobile (Android, iOS)
- Apps desktop (Electron, native)
- CLI tools, scripts
- Tests unitarios/integración (in-memory)
- Cache local
- Sitios web con poco tráfico (sí, en serio — Litestream + SQLite)
- IoT / edge computing
- Prototipos
- Single-user apps

❌ **No**:
- Apps web multi-usuario con concurrencia alta
- Writes concurrentes intensos desde múltiples procesos
- Datos > 281 TB (límite teórico, antes hay problemas operativos)

## Características clave

- **Cero configuración**: archivo en disco, listo
- **Cross-platform**: misma DB en macOS/Linux/Windows
- **ACID**: con WAL mode
- **Tipos dinámicos**: type affinity (no estricto como otras DBs)
- **Single file**: backup = copiar archivo
- **In-memory**: `:memory:` para tests
- **Full-text search** built-in (FTS5)
- **JSON support** desde 3.38+
- **Common Table Expressions, window functions**: sí

## Tipos de datos (type affinity)

SQLite tiene 5 "classes":
- `NULL`
- `INTEGER`
- `REAL`
- `TEXT`
- `BLOB`

Pero los tipos declarados son "afinidades":
- `INT`, `INTEGER`, `BIGINT`, `TINYINT`, etc. → INTEGER affinity
- `TEXT`, `VARCHAR(n)`, `CHAR(n)` → TEXT affinity
- `REAL`, `FLOAT`, `DOUBLE` → REAL affinity
- `NUMERIC`, `DECIMAL` → NUMERIC affinity
- `BLOB`, sin tipo → BLOB affinity

**Importante**: SQLite NO valida estrictamente. Puedes insertar un string en una columna INTEGER (lo convierte si puede). Para validación estricta usar `STRICT` tables:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  age INTEGER
) STRICT;  -- valida tipos
```

## Crear DB y conectar

```bash
sqlite3 mydb.db          # CLI interactiva
.tables                  # listar tablas
.schema users            # ver schema
.headers on              # mostrar headers
.mode column             # formato bonito
.exit
```

```python
# Python
import sqlite3
conn = sqlite3.connect('mydb.db')
cur = conn.cursor()
cur.execute('SELECT * FROM users')
```

```javascript
// Node.js con better-sqlite3 (recomendado, sync API más rápida)
import Database from 'better-sqlite3';
const db = new Database('mydb.db');
const users = db.prepare('SELECT * FROM users').all();
```

```java
// Java JDBC
String url = "jdbc:sqlite:mydb.db";
Connection conn = DriverManager.getConnection(url);
```

## Modos importantes

### WAL (Write-Ahead Logging)

**Habilitar siempre para apps multi-conexión**:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;  -- bueno con WAL
```

Beneficios:
- **Lectores no bloquean writers** ni viceversa
- Mucho mejor concurrencia
- Crash recovery más rápido

### Foreign keys

**No están activadas por default** (legacy compatibility). Activar **en cada conexión**:

```sql
PRAGMA foreign_keys = ON;
```

```python
conn.execute('PRAGMA foreign_keys = ON')
```

### Otros pragmas útiles

```sql
PRAGMA cache_size = -64000;       -- 64 MB de cache (negativo = KB, positivo = páginas)
PRAGMA temp_store = MEMORY;       -- temp tables en RAM
PRAGMA mmap_size = 30000000000;   -- memory-mapped I/O (30 GB)
PRAGMA busy_timeout = 5000;       -- esperar 5s si DB está locked
```

## Concurrencia

- **Múltiples readers**: ✅ siempre
- **Un solo writer a la vez**: sí (write transactions serializadas)
- **WAL mode**: readers no bloquean writers, mejor throughput

Si tienes muchos writers concurrentes, considerar otra DB. Pero para tráfico moderado SQLite es sorprendentemente competente.

## Schema design

Mismas reglas que en otras SQL DBs (ver `modeling-relational.md`). Particularidades SQLite:

```sql
-- Boolean: usar INTEGER 0/1
is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))

-- Fechas: SQLite no tiene tipo dedicado. Convenciones:
-- A. ISO 8601 string: "2026-05-19T14:23:45Z" (recomendado, legible, ordenable)
-- B. Unix timestamp: INTEGER seconds
-- C. Julian day: REAL

-- Usar functions de fecha:
SELECT date('now'), datetime('now'), strftime('%Y-%m-%d', 'now');
```

## Full-text search (FTS5)

```sql
-- Crear tabla FTS
CREATE VIRTUAL TABLE articles_fts USING fts5(title, body, content='articles');

-- Sincronizar con triggers
CREATE TRIGGER articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;
-- Triggers análogos para UPDATE y DELETE

-- Buscar
SELECT * FROM articles_fts WHERE articles_fts MATCH 'database AND tutorial' ORDER BY rank;

-- Highlighting
SELECT highlight(articles_fts, 1, '<b>', '</b>') FROM articles_fts WHERE articles_fts MATCH 'sqlite';
```

## JSON

```sql
-- Almacenar JSON
INSERT INTO products (data) VALUES (json('{"name":"Widget","price":99.99}'));

-- Extraer
SELECT json_extract(data, '$.name'), json_extract(data, '$.price') FROM products;

-- Shortcut con ->
SELECT data->'name', data->>'price' FROM products;

-- Index sobre JSON
CREATE INDEX idx_products_name ON products(json_extract(data, '$.name'));
```

## Backups

### Backup en caliente

```bash
# CLI
sqlite3 mydb.db ".backup mydb.backup.db"

# Más controlado (con progress)
sqlite3 mydb.db ".backup --batch mydb.backup.db"
```

```python
# Python: backup mientras la DB está en uso
src = sqlite3.connect('mydb.db')
dst = sqlite3.connect('backup.db')
src.backup(dst)
```

### Copia del archivo

Funciona si NO hay writes concurrentes:
```bash
cp mydb.db backup.db
```

Si hay writes, usar `.backup` API.

### Litestream (replicación continua a S3/etc.)

Para producción en servidor:

```bash
# Replicar a S3
litestream replicate mydb.db s3://mybucket/mydb.db
```

Hace WAL streaming continuo. Restaurar:
```bash
litestream restore -o restored.db s3://mybucket/mydb.db
```

**Estrategia para webapps con SQLite**: SQLite + Litestream + servidor único. Increíblemente simple y barato.

## Performance

### Mejores prácticas

1. **Habilitar WAL**: PRAGMA journal_mode = WAL
2. **Habilitar foreign_keys**: PRAGMA foreign_keys = ON
3. **Aumentar cache_size**: PRAGMA cache_size = -64000 (64 MB)
4. **Usar transactions explícitas para batch**: 100x más rápido
5. **Prepared statements**: reusar plans
6. **Indexes**: como en cualquier SQL DB

### Transactions

```python
# ❌ MAL: cada insert es su propia transaction
for row in rows:
    cur.execute('INSERT INTO users VALUES (?, ?)', row)
conn.commit()  # tarde

# ✅ BIEN: una transaction grande
with conn:
    cur.executemany('INSERT INTO users VALUES (?, ?)', rows)
```

`with conn:` auto-commit al final, rollback en exception.

### EXPLAIN QUERY PLAN

```sql
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;

-- Output:
-- 0|0|0|SEARCH TABLE orders USING INDEX idx_orders_user_id (user_id=?)
```

Si dice `SCAN TABLE`, falta índice.

## Limits

- **DB size**: 281 TB (teórico). En la práctica, GB-TB OK.
- **Row size**: 1 GB (BLOB grande)
- **Cols por tabla**: 2000
- **Tables**: ~limitado por archivo
- **Page size**: 4096 bytes default, max 65536
- **Connections concurrentes**: sin límite teórico, pero solo 1 writer activo

## Casos de uso reales sorprendentes

- **WhatsApp**: chat history local
- **Firefox/Chrome**: history, bookmarks, settings
- **Adobe Lightroom**: catálogo
- **iOS/Android**: SQLite es la DB del sistema
- **Apps Electron**: persistencia local
- **Sites web** (sí, con Litestream): cuando lo justifica

## Migración SQLite ↔ otras DBs

### Exportar a SQL

```bash
sqlite3 mydb.db .dump > mydb.sql
```

Editar para compatibilidad (tipos, defaults).

### Importar de CSV

```bash
sqlite3 mydb.db
.mode csv
.import users.csv users
```

### A PostgreSQL

```bash
# pgloader (mejor opción)
pgloader sqlite://mydb.db postgresql:///mydb
```

## Trampas comunes

- ❌ Olvidar `PRAGMA foreign_keys = ON`
- ❌ No usar WAL mode en apps con múltiples conexiones
- ❌ Cada operación en su propia transaction (lentísimo en batch)
- ❌ Asumir que types son estrictos (sin STRICT no lo son)
- ❌ Backup con `cp` mientras hay writes activos
- ❌ Múltiples procesos escribiendo en el mismo archivo (use cliente/servidor o WAL bien configurado)
- ❌ Datos relacionales complejos cuando una DB cliente/servidor sería mejor

## Checklist SQLite

- [ ] WAL mode habilitado
- [ ] Foreign keys activadas en cada conexión
- [ ] cache_size aumentado para apps con queries pesadas
- [ ] Transactions explícitas para batches
- [ ] Indexes en columnas frecuentemente queried
- [ ] STRICT tables si necesitas validación de tipos
- [ ] Backup strategy (Litestream para servidor, copy regular para apps)
- [ ] Tests usando `:memory:` para velocidad
