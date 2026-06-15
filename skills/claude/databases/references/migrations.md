# Migraciones de Schema

Cómo gestionar cambios de schema de forma segura: Flyway, Liquibase, Prisma, ORM nativos, y patrones zero-downtime.

## Principios universales

### 1. Forward-only

NO confiar en rollback automático. Si una migración necesita "deshacerse", crear **otra migración** que lo revierta.

Por qué:
- Rollback automático puede fallar (data loss)
- Si en prod ya hay datos nuevos, el "rollback" rompe estado
- Mejor: forward-only + planear cada migración como definitiva

### 2. Inmutabilidad

**Una migración aplicada NO se modifica nunca**. Si necesitas cambiar algo, crear nueva migración.

Por qué:
- Equipos diferentes ya la aplicaron; cambiarla rompe sus DBs
- Las herramientas (Flyway, Liquibase) calculan checksums; cambios fallan
- Trazabilidad: cada cambio queda en la historia

### 3. Versionado lineal

Cada migración tiene un identificador único e ordenable:
- Sequential: `V1__init.sql`, `V2__add_users.sql`
- Timestamp: `V20260519120000__add_users.sql`

**Recomendación**: timestamps. Evitan conflictos cuando varias personas crean migraciones en branches paralelas.

### 4. Atomicidad por migración

Cada migración debe ser una unidad atómica: o se aplica entera o no se aplica.

Postgres y SQL Server soportan DDL transaccional. MySQL **no** (cada DDL hace commit implícito).

### 5. Idempotencia (cuando sea viable)

```sql
-- ✅ Idempotente (PostgreSQL)
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ❌ Falla si se ejecuta dos veces
CREATE TABLE users (...);
```

Útil para entornos donde una migración pudo aplicarse parcialmente.

## Flyway

Más simple, más popular. SQL puro (con opción Java).

### Estructura

```
src/main/resources/db/migration/
├── V1__init.sql
├── V2__create_users.sql
├── V3__add_orders.sql
└── V20260519120000__add_phone_to_users.sql
```

### Naming

- **Versioned**: `V<version>__<description>.sql` — se aplican una vez en orden
- **Repeatable**: `R__<description>.sql` — se aplican cuando cambian (views, procedures)
- **Undo** (paid): `U<version>__<description>.sql` — solo Flyway Teams

### Configuración Spring Boot

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true  # si la DB ya existe sin tabla flyway_schema_history
    validate-on-migrate: true
    out-of-order: false  # default: false. true permite versiones fuera de orden (peligroso)
    table: flyway_schema_history
```

### Ejemplo de migración

```sql
-- V1__init.sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

```sql
-- V2__add_orders.sql
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

### Comandos

```bash
mvn flyway:info       # ver estado
mvn flyway:migrate    # aplicar pendientes
mvn flyway:validate   # verificar checksums
mvn flyway:repair     # arreglar checksums/failed migrations
mvn flyway:baseline   # marcar baseline en DB existente
```

### Tabla de control

Flyway crea `flyway_schema_history`:

| installed_rank | version | description | type | script | checksum | success |
|---|---|---|---|---|---|---|
| 1 | 1 | init | SQL | V1__init.sql | -1234567 | true |
| 2 | 2 | add_orders | SQL | V2__add_orders.sql | 987654 | true |

## Liquibase

Más features, más complejo. Soporta XML, YAML, JSON, SQL.

### Estructura

```
src/main/resources/db/changelog/
├── db.changelog-master.yaml
├── changesets/
│   ├── 001-init.yaml
│   ├── 002-add-orders.yaml
│   └── 003-add-phone.yaml
```

### Master changelog

```yaml
# db.changelog-master.yaml
databaseChangeLog:
  - include:
      file: changesets/001-init.yaml
      relativeToChangelogFile: true
  - include:
      file: changesets/002-add-orders.yaml
      relativeToChangelogFile: true
```

### Changeset

```yaml
# changesets/001-init.yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-users
      author: alice
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: email
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
                    unique: true
              - column:
                  name: name
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
              - column:
                  name: created_at
                  type: TIMESTAMPTZ
                  defaultValueComputed: NOW()
                  constraints:
                    nullable: false

  - changeSet:
      id: 001-create-users-index
      author: alice
      changes:
        - createIndex:
            indexName: idx_users_email
            tableName: users
            columns:
              - column:
                  name: email
```

### O en SQL puro

```yaml
- changeSet:
    id: 001-create-users-sql
    author: alice
    changes:
      - sqlFile:
          path: sql/001-create-users.sql
          relativeToChangelogFile: true
```

### Configuración Spring Boot

```yaml
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.yaml
```

### Liquibase vs Flyway

| | Flyway | Liquibase |
|---|---|---|
| Sintaxis | SQL puro | YAML/XML/JSON/SQL |
| Curva | Baja | Media |
| Database-agnostic | Manual | Automático (con cambios estándar) |
| Rollback | Manual (Teams: automatic) | Built-in (a veces no funciona perfecto) |
| Contexts/labels | No | Sí (diferentes envs) |
| Preconditions | No | Sí (skip if X) |

**Recomendación**:
- **Flyway** si vas SQL-first y no necesitas portabilidad
- **Liquibase** si necesitas multi-database o features avanzadas

## Prisma Migrate

Para apps Node.js con Prisma ORM.

### Workflow

```bash
# 1. Modificar schema.prisma
# 2. Generar migración
npx prisma migrate dev --name add_orders

# Genera prisma/migrations/20260519120000_add_orders/migration.sql
# Aplica automáticamente en dev

# 3. En producción
npx prisma migrate deploy
```

### Schema

```prisma
// prisma/schema.prisma
model User {
  id        BigInt   @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  orders    Order[]

  @@map("users")
}

model Order {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  total     Decimal  @db.Decimal(10, 2)
  status    String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("orders")
  @@index([userId])
  @@index([status, createdAt])
}
```

Cuando cambias el schema, Prisma genera el SQL de migración. **Revisar siempre el SQL generado antes de aplicar**.

### Limitaciones de Prisma

- Algunos cambios complejos requieren SQL manual
- Migrations pueden ser destructivas; Prisma avisa pero hay que estar atento
- No tan flexible como Flyway/Liquibase para SQL avanzado

## ORM-native migrations

### Hibernate (DDL auto)

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # produccion
```

**Opciones**:
- `none`: no hace nada (recomendado en prod, usar Flyway/Liquibase)
- `validate`: verifica que schema match (recomendado en prod)
- `update`: crea tablas y columnas faltantes (peligroso, no para prod)
- `create`: drop y create (solo tests)
- `create-drop`: create al startup, drop al shutdown (solo tests)

**Regla**: `ddl-auto: update` en prod **NUNCA**. Usar tool de migración (Flyway/Liquibase).

### Sequelize (Node)

```javascript
// migrations/20260519120000-create-users.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('users', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
```

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
```

### Django

```python
# Por modelo en models.py
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
```

```bash
python manage.py makemigrations
python manage.py migrate
```

### Rails / ActiveRecord

```ruby
class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.decimal :total, precision: 10, scale: 2, null: false
      t.string :status, null: false
      t.timestamps
    end
    add_index :orders, [:status, :created_at]
  end
end
```

```bash
rails db:migrate
```

## Scripts SQL manuales

A veces lo más simple. Archivos numerados ejecutados en orden:

```
db/
├── 001-init.sql
├── 002-add-users.sql
└── 003-add-orders.sql
```

```bash
# Aplicar
for f in db/*.sql; do
  psql -d mydb -f "$f"
  echo "$f applied at $(date)" >> applied.log
done
```

**Cuándo está bien**:
- Proyectos chicos sin herramienta
- Migraciones uniques cross-env (rara)

**Cuándo NO**:
- Apps en producción con equipo
- Múltiples ambientes (dev, staging, prod)

Mejor usar Flyway o Liquibase desde el día 1.

## Patterns de migraciones complejas

### Expand-Contract (zero-downtime)

Para cambios incompatibles backward, hacer en **3 deploys**:

#### Caso: renombrar columna `email` → `email_address`

**❌ No hacer en una migración**:
```sql
ALTER TABLE users RENAME COLUMN email TO email_address;
-- App vieja se rompe instantáneamente
```

**✅ Expand-Contract**:

**Deploy 1 — Expand**: agregar columna nueva, copiar datos, app lee/escribe AMBAS

```sql
-- Migration V10
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email;  -- backfill
-- (En tabla grande: hacer en batches, no en migración)
```

App code:
```java
// Leer de ambos campos, escribir a ambos
String email = user.getEmailAddress() != null
    ? user.getEmailAddress()
    : user.getEmail();
user.setEmail(newValue);
user.setEmailAddress(newValue);
```

**Deploy 2 — Migrate**: backfill total, app usa solo la nueva

```sql
-- Migration V11
-- Verificar que todos los datos copiados
UPDATE users SET email_address = email WHERE email_address IS NULL;
ALTER TABLE users ALTER COLUMN email_address SET NOT NULL;

-- Opcional: trigger para sincronizar email viejo
CREATE TRIGGER sync_email BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_email_columns();
```

App code:
```java
// Usar solo el nuevo
user.setEmailAddress(newValue);
```

**Deploy 3 — Contract**: eliminar lo viejo

```sql
-- Migration V12
ALTER TABLE users DROP COLUMN email;
```

### Backfill grande

Para tablas grandes, no hacer UPDATE masivo en migración:

```sql
-- ❌ MAL: lock + transaction enorme
UPDATE users SET status = 'active' WHERE status IS NULL;
```

**Mejor**: migración solo cambia schema; backfill en script aparte por batches:

```sql
-- Migration: solo agrega columna
ALTER TABLE users ADD COLUMN status VARCHAR(20);
```

```python
# Script aparte (Python)
batch_size = 1000
while True:
    rows = db.execute(
        "UPDATE users SET status = 'active' "
        "WHERE id IN (SELECT id FROM users WHERE status IS NULL LIMIT %s) "
        "RETURNING id", (batch_size,)
    )
    if len(rows) == 0:
        break
    time.sleep(0.1)  # respiro

# Después, migración para set NOT NULL
```

### Add column NOT NULL con default

**❌ MAL en tabla grande (PG < 11, MySQL siempre)**:
```sql
ALTER TABLE big_table ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
-- Rewrite de toda la tabla, lock largo
```

**✅ En PostgreSQL 11+** es instantáneo gracias a optimización del default:
```sql
ALTER TABLE big_table ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
-- ✅ Rápido en PG 11+
```

**En MySQL o PG viejo**:
```sql
-- 1. Add nullable
ALTER TABLE big_table ADD COLUMN status VARCHAR(20);
-- 2. Backfill por batches (script)
-- 3. Set default
ALTER TABLE big_table ALTER COLUMN status SET DEFAULT 'pending';
-- 4. Set NOT NULL (rápido si todos tienen valor)
ALTER TABLE big_table ALTER COLUMN status SET NOT NULL;
```

### Create index sin lock

PostgreSQL: `CREATE INDEX` bloquea writes. Usar `CONCURRENTLY`:

```sql
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
```

⚠️ `CONCURRENTLY` no funciona dentro de transacción. Si tu tool de migración envuelve cada migración en transacción, deshabilitarlo para ese cambio.

Flyway:
```sql
-- V10__add_index.sql
-- Flyway: --transactional=false
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
```

```yaml
# o en config
flyway:
  mixed: true  # permite tx y no-tx
```

MySQL 8 + InnoDB: por default es online, no requiere `CONCURRENTLY`.

### Drop column safely

```sql
-- ✅ Postgres: rápido, no rewrite
ALTER TABLE users DROP COLUMN deprecated_field;
```

Pero antes:
1. Asegurar que NINGÚN código la usa (search en codebase)
2. Esperar 1-2 deploys después de eliminar uso en código
3. Tener backup reciente

### Cambiar tipo de columna

Casos:
- `VARCHAR(50)` → `VARCHAR(100)`: rápido, no rewrite (PG)
- `INT` → `BIGINT`: rewrite (largo en tabla grande)
- Cambios incompatibles: usar expand-contract

```sql
-- Para cambios compatibles (PG)
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(500);

-- Para cambios complejos: nueva columna, copiar, swap
ALTER TABLE users ADD COLUMN id_new BIGINT;
UPDATE users SET id_new = id;  -- en batches
-- ... swap con triggers y app dual write
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN id_new TO id;
```

## NoSQL: migraciones

### MongoDB

**Schema-on-read**: la app maneja diferentes versiones de documentos.

```javascript
// Schema versioning pattern
{
  _id: ObjectId(),
  _schemaVersion: 2,
  name: "Alice",
  email: "alice@example.com",
  // v2: email separado de profile
}

// App code
function getUser(doc) {
  if (doc._schemaVersion === 1) {
    return { name: doc.name, email: doc.profile.email };  // migrar al vuelo
  }
  return { name: doc.name, email: doc.email };
}
```

Backfill batch para "actualizar" docs viejos:
```javascript
db.users.updateMany(
  { _schemaVersion: { $ne: 2 } },
  [
    { $set: {
        email: "$profile.email",
        _schemaVersion: 2
    }},
    { $unset: "profile.email" }
  ]
);
```

**Tools**: migrate-mongo, mongoose-migrate.

### DynamoDB

DynamoDB es schema-less. Migraciones típicas:

- **Add attribute**: nada que hacer, items pueden tener o no
- **Rename attribute**: dual write durante transición, backfill batch, switch
- **Cambiar tipo**: parecido a SQL expand-contract
- **Cambiar PK / agregar GSI**: requiere backfill de items en el nuevo índice

DynamoDB Streams + Lambda para backfills graduales.

### Redis

Migration patterns:
- **Versioning de keys**: `user:v2:123` vs `user:v1:123`
- **Lazy migration**: al leer key vieja, migrar a nueva
- **Flush + repopulate** si dataset chico

## Migraciones de datos vs schema

Separar conceptualmente:

- **Schema migration**: cambio en estructura (DDL)
- **Data migration**: cambio en contenido (DML)

Para data migrations grandes, **NO ponerlas en archivos Flyway/Liquibase**:
- Lock tabla por horas
- Si falla, deja DB en estado inconsistente
- Mejor: jobs ETL aparte con resumability

## CI/CD de migraciones

```yaml
# GitHub Actions
- name: Apply DB migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    mvn flyway:migrate
    # o: npx prisma migrate deploy
    # o: liquibase update
```

**Reglas**:
- Migraciones ANTES del deploy de app (la app nueva asume schema nuevo)
- Si rollback de app, migraciones deben ser backward-compatible (expand-contract)
- En prod: migraciones requieren approval o canary

## Verificar y testear migraciones

### Pre-prod testing

1. **Apply en dev**: testear que migración corre
2. **Apply en staging**: con datos similares a prod
3. **Medir tiempo y locks**: extrapolar a prod
4. **Backup antes de prod**: siempre

### Rollback plan

Para cada migración, documentar cómo revertir:

```markdown
# V10__add_orders.sql

## Forward
CREATE TABLE orders (...);

## Rollback (si necesario)
-- Crear migración V11__drop_orders.sql:
DROP TABLE orders;

## Riesgos
- Si V10 falla a la mitad, queda tabla parcial. Manual cleanup.

## Tiempo estimado
< 1 segundo (tabla vacía).
```

### Dry run

PostgreSQL:
```sql
BEGIN;
-- migraciones acá
-- inspeccionar estado
ROLLBACK;  -- no aplicar
```

## Multi-environment

### Misma migración, diferente data

```yaml
# Liquibase contexts
- changeSet:
    id: insert-test-data
    author: alice
    context: dev,test  # solo en dev y test
    changes:
      - sqlFile:
          path: seed.sql
```

### Flyway placeholders

```sql
-- V1__init.sql
CREATE SCHEMA ${schema_name};
```

```yaml
flyway:
  placeholders:
    schema_name: app_prod
```

## Anti-patterns

- ❌ Modificar migración aplicada en otra DB (rompe checksums)
- ❌ Migraciones con `IF EXISTS` para "lo que sea" sin pensar (esconde bugs)
- ❌ Hibernate `ddl-auto: update` en producción
- ❌ Backfill masivo dentro de migración (lock largo, transaction enorme)
- ❌ `CREATE INDEX` sin `CONCURRENTLY` en tabla grande (lock writes)
- ❌ Drop column sin verificar uso en código
- ❌ Renombrar columnas en un solo deploy (downtime garantizado)
- ❌ Migraciones manuales en consola (no quedan en git)
- ❌ Mismo tool para schema + data migrations grandes
- ❌ Sin testing en staging antes de prod
- ❌ Sin backup antes de migración riesgosa
- ❌ Migrations que dependen de horario (cleanups que solo corren en dev)

## Checklist de migraciones

- [ ] Tool elegido (Flyway/Liquibase/Prisma/etc.)
- [ ] Estructura de carpetas establecida
- [ ] Naming convention definido
- [ ] CI/CD aplica migraciones automáticamente
- [ ] Backups automáticos antes de aplicar en prod
- [ ] Code review obligatorio en migraciones de prod
- [ ] Test en staging antes de prod
- [ ] Expand-contract para cambios breaking
- [ ] Backfills grandes fuera de migraciones (jobs aparte)
- [ ] `CONCURRENTLY` para indexes en PG
- [ ] Migraciones documentan tiempo y locks esperados
- [ ] Rollback plan documentado
- [ ] Equipo conoce el proceso
