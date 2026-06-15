# Multi-tenancy Patterns

3 patrones para manejar datos de múltiples clientes en una DB.

## Decisión inicial

| Patrón | Aislamiento | Costo/tenant | Complejidad | Cuándo |
|---|---|---|---|---|
| **Database per tenant** | Máximo | Alto | Baja | Pocos tenants enterprise, compliance estricto |
| **Schema per tenant** | Alto | Medio | Media | 10-1000 tenants, compliance moderado |
| **Shared schema** (tenant_id) | Bajo | Bajo | Alta | Muchos tenants (1000+), SaaS típico |

## Patrón 1: Database per tenant

Cada cliente tiene su propia DB completa.

### Ventajas
- ✅ Aislamiento total (físico, no solo lógico)
- ✅ Backup/restore por cliente individual
- ✅ Custom schema por cliente posible
- ✅ Performance no afecta a otros tenants
- ✅ Compliance fácil (datos físicamente separados)
- ✅ Migraciones rollout gradual por tenant
- ✅ Borrar cliente = borrar DB (right to be forgotten simple)

### Desventajas
- ❌ Costo alto: cada DB tiene baseline (compute + storage)
- ❌ Migraciones se aplican a N DBs (más lento, más errores posibles)
- ❌ Provisioning más complejo (crear DB nueva por cada cliente)
- ❌ Operaciones cross-tenant difíciles (analytics, reporting)
- ❌ No práctico para >100 tenants

### Implementación

**Aproximación con app multi-DB**:
```java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        AbstractRoutingDataSource routing = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return TenantContext.getCurrentTenant();
            }
        };

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("tenant1", createDataSource("jdbc:postgresql://host/tenant1_db"));
        targetDataSources.put("tenant2", createDataSource("jdbc:postgresql://host/tenant2_db"));
        // ... cargar de configuración o discovery

        routing.setTargetDataSources(targetDataSources);
        routing.setDefaultTargetDataSource(targetDataSources.get("default"));
        return routing;
    }
}

// TenantContext es ThreadLocal seteado en interceptor
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCurrentTenant(String tenant) {
        CURRENT_TENANT.set(tenant);
    }

    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}

// Interceptor / Filter
@Component
public class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String tenant = extractTenantFromRequest(req);  // header, subdomain, JWT claim
        TenantContext.setCurrentTenant(tenant);
        try {
            chain.doFilter(req, res);
        } finally {
            TenantContext.clear();
        }
    }
}
```

**Provisioning** (cuando se crea nuevo tenant):
```sql
-- 1. Crear DB
CREATE DATABASE tenant_acme;

-- 2. Aplicar migraciones (Flyway)
-- flyway -url=jdbc:postgresql://host/tenant_acme migrate

-- 3. Actualizar config/discovery con nuevo tenant
```

### Variante: shared cluster, separate databases

Una instancia de DB, múltiples databases dentro. Reduce baseline cost pero menos aislamiento que servers separados.

## Patrón 2: Schema per tenant

Una DB, un schema (namespace) por tenant.

PostgreSQL y SQL Server soportan esto nativamente. MySQL llama "database" a lo que PG llama "schema".

### Ventajas
- ✅ Buen aislamiento (queries con `schema.table`)
- ✅ Backup/restore por schema
- ✅ Custom schema posible por tenant
- ✅ Menos costo que DB-per-tenant (compute compartido)
- ✅ Menos overhead operativo

### Desventajas
- ❌ Migraciones aplican a N schemas
- ❌ Conexiones DB compartidas (un tenant que load mucho afecta a otros)
- ❌ Reporting cross-tenant requiere UNION ALL de N schemas
- ❌ No práctico para >500 schemas (PostgreSQL maneja pero el catalog crece)

### Implementación PostgreSQL

```sql
-- Schema por tenant
CREATE SCHEMA tenant_acme;
CREATE SCHEMA tenant_globex;

-- Crear tablas en cada schema
CREATE TABLE tenant_acme.users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ...
);

CREATE TABLE tenant_globex.users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ...
);
```

**Configurar search_path por sesión**:
```sql
SET search_path TO tenant_acme;
SELECT * FROM users;  -- ahora apunta a tenant_acme.users
```

**Spring Boot con Hibernate**:
```java
public class TenantInterceptor extends EmptyInterceptor {
    @Override
    public String onPrepareStatement(String sql) {
        String tenant = TenantContext.getCurrentTenant();
        // Ejecutar SET search_path TO <tenant>
        return sql;
    }
}

// O usar MultiTenantConnectionProvider de Hibernate
@Component
public class SchemaPerTenantConnectionProvider implements MultiTenantConnectionProvider {
    @Autowired
    private DataSource dataSource;

    @Override
    public Connection getConnection(Object tenantIdentifier) throws SQLException {
        Connection conn = dataSource.getConnection();
        conn.createStatement().execute("SET search_path TO " + tenantIdentifier);
        return conn;
    }
    // ...
}
```

**Configuración**:
```yaml
spring:
  jpa:
    properties:
      hibernate:
        multiTenancy: SCHEMA
        tenant_identifier_resolver: com.example.TenantIdentifierResolver
        multi_tenant_connection_provider: com.example.SchemaPerTenantConnectionProvider
```

### Migraciones schema-per-tenant

Flyway puede aplicar a múltiples schemas:

```yaml
flyway:
  schemas: tenant_acme  # cambiar dinámicamente por tenant
```

O en código (loop sobre tenants):
```java
for (String tenant : tenantService.findAll()) {
    Flyway.configure()
        .dataSource(dataSource)
        .schemas(tenant)
        .table("flyway_schema_history")
        .load()
        .migrate();
}
```

## Patrón 3: Shared schema (tenant_id)

Una sola DB, un solo schema. Todas las tablas tienen columna `tenant_id`.

### Ventajas
- ✅ Costo más bajo (un solo schema, una DB)
- ✅ Migraciones únicas
- ✅ Operativamente simple
- ✅ Escala bien a millones de tenants
- ✅ Reporting cross-tenant trivial
- ✅ Provisioning instantáneo (solo crear filas)

### Desventajas
- ❌ **Riesgo de data leak** si falta un WHERE en algún query
- ❌ Performance: tablas crecen con todos los tenants, indexes más grandes
- ❌ Un tenant problemático (queries pesadas) afecta a otros
- ❌ Backup/restore por tenant difícil
- ❌ Compliance más complejo (mismo storage, aislamiento solo lógico)

### Implementación

```sql
CREATE TABLE users (
    tenant_id UUID NOT NULL,
    id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, email)
);

CREATE TABLE orders (
    tenant_id UUID NOT NULL,
    id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    total NUMERIC(10,2),
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)
);

-- Indexes que incluyen tenant_id primero
CREATE INDEX idx_orders_tenant_user ON orders(tenant_id, user_id);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
```

**Notas clave**:
- `tenant_id` es **parte de la PK** (no surrogate ID solo)
- FKs deben incluir `tenant_id` (no se puede joinear datos cross-tenant accidentalmente)
- Todos los indexes empiezan con `tenant_id` (queries siempre filtran por él)

### Enforcement: que NUNCA falte el WHERE

El mayor riesgo. Soluciones:

#### A. Row-Level Security (RLS) en PostgreSQL

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Crear policy
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

App seta el tenant antes de cada query:
```java
@Component
public class TenantAwareDataSource {

    @Autowired
    private DataSource dataSource;

    public Connection getConnection() throws SQLException {
        Connection conn = dataSource.getConnection();
        String tenant = TenantContext.getCurrentTenant();
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET app.current_tenant = '" + tenant + "'");
        }
        return conn;
    }
}
```

**Ahora todos los queries automáticamente filtran por tenant**:
```sql
SELECT * FROM users;  -- solo retorna users del tenant actual
SELECT * FROM users WHERE id = 5;  -- aunque exista en otro tenant, no aparece
```

**Beneficio principal**: defense in depth. Aunque un dev olvide el WHERE, la DB no expone datos cross-tenant.

#### B. Filtros automáticos del ORM

**Hibernate Filter**:
```java
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = "string"))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class User {
    // ...
}

// Activar filter por sesión
Session session = entityManager.unwrap(Session.class);
session.enableFilter("tenantFilter").setParameter("tenantId", TenantContext.getCurrentTenant());
```

**Prisma middleware**:
```typescript
prisma.$use(async (params, next) => {
  const tenantId = TenantContext.get();

  if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
    params.args.where = { ...params.args.where, tenantId };
  }

  if (['create', 'update', 'updateMany'].includes(params.action)) {
    if (params.args.data) {
      params.args.data.tenantId = params.args.data.tenantId || tenantId;
    }
  }

  return next(params);
});
```

#### C. Repository pattern enforcement

```java
public abstract class TenantAwareRepository<T, ID> {

    public T findById(ID id) {
        String tenantId = TenantContext.getCurrentTenant();
        return em.createQuery(
            "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.tenantId = :tid AND e.id = :id",
            entityClass)
            .setParameter("tid", tenantId)
            .setParameter("id", id)
            .getSingleResult();
    }
    // ...
}
```

Todos los repos extienden TenantAwareRepository, tenant_id se inyecta automático.

### Particionamiento por tenant

Para tenants grandes, particionar tablas por `tenant_id`:

```sql
CREATE TABLE orders (
    tenant_id UUID NOT NULL,
    id BIGINT NOT NULL,
    ...
) PARTITION BY HASH (tenant_id);

CREATE TABLE orders_p0 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE orders_p1 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE orders_p2 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE orders_p3 PARTITION OF orders FOR VALUES WITH (modulus 4, remainder 3);
```

**Beneficios**:
- Queries de un tenant solo escanean su partition
- Vacuum y maintenance per-partition

## Patrón híbrido: pool of databases

Para SaaS con tenants de distinto tamaño:
- **Tenants grandes / enterprise**: DB dedicada (pattern 1)
- **Tenants medianos**: schema dedicado (pattern 2)
- **Tenants pequeños**: shared schema (pattern 3)

App routea según tipo de tenant.

## Comparación de costo

Ejemplo: 1000 tenants en PostgreSQL.

**Database per tenant**:
- 1000 DBs × $50/mes baseline = $50,000/mes
- Solo viable con tenants enterprise muy grandes que pagan en consecuencia

**Schema per tenant**:
- 1-3 PG instances grandes (~$500-1500/mes) + storage
- Manejable hasta ~500 tenants

**Shared schema**:
- 1 PG instance grande ($500-2000/mes) + storage
- Escala a millones de tenants

## Compliance y seguridad

| Aspecto | DB per tenant | Schema per tenant | Shared schema |
|---|---|---|---|
| Data isolation | Físico | Lógico fuerte | Lógico (con RLS) |
| Backup per tenant | Trivial | Posible | Difícil |
| GDPR delete | DROP DATABASE | DROP SCHEMA | DELETE WHERE tenant_id = X |
| Audit per tenant | Trivial | Posible | Difícil sin row-level audit |
| Different SLAs | Posible | Difícil | Imposible |
| Custom encryption keys | Posible | Limitado | Tabla-level |

## Cambio entre patrones

### De shared a schema/database per tenant

Cuando un tenant crece mucho o pide compliance estricto:

1. **Crear nuevo schema/DB** para ese tenant
2. **Export** datos del tenant del shared schema
3. **Import** al nuevo location
4. **Actualizar routing** en app
5. **Dual-write** temporal hasta verificar
6. **Cleanup** datos del shared

Es complejo pero factible.

### De DB/schema a shared

Más raro pero posible. Más complejo aún (mergear PKs).

## Anti-patterns

- ❌ **Tenant ID como string libre** (`'acme'`, `'globex'`): mejor UUID o BIGINT
- ❌ **Forget WHERE tenant_id**: catastrófico, leak entre clientes
- ❌ **Tenant ID solo en JOIN tables**: cada tabla debe tener el suyo
- ❌ **Sin RLS o enforcement**: cuestión de tiempo hasta el primer leak
- ❌ **Reporting con datos de otros tenants**: aún más fácil leak en consultas custom
- ❌ **DB per tenant para SaaS con 10000 clientes**: costo y operación explotan
- ❌ **Shared schema sin particionamiento en tablas masivas**: performance se degrada
- ❌ **Tenant ID no incluido en indexes**: queries no aprovechan tenant filter

## Tests de aislamiento (obligatorios)

```java
@Test
void user_a_cannot_see_user_b_data() {
    // Setup
    User userA = createUser(TenantA);
    User userB = createUser(TenantB);

    // Act
    TenantContext.setCurrentTenant(TenantA.id);
    List<User> visible = userRepo.findAll();

    // Assert
    assertThat(visible).containsExactly(userA);
    assertThat(visible).doesNotContain(userB);
}

@Test
void user_a_cannot_modify_user_b() {
    User userB = createUser(TenantB);

    TenantContext.setCurrentTenant(TenantA.id);

    assertThatThrownBy(() ->
        userService.update(userB.getId(), "new name")
    ).isInstanceOf(ResourceNotFoundException.class);
}
```

Tests **OBLIGATORIOS** en cualquier sistema multi-tenant.

## Recomendaciones

### Para SaaS B2B típico (cientos a miles de tenants)
→ **Shared schema con RLS** y particionamiento si crece mucho.

### Para SaaS enterprise (pocos clientes grandes pagando alto)
→ **DB per tenant** o **schema per tenant**.

### Para mix
→ **Híbrido**: shared para básicos, dedicado para enterprise.

### Para apps internas multi-departamento
→ **Schema per tenant** suele ser sweet spot.

## Checklist multi-tenancy

- [ ] Patrón elegido con justificación
- [ ] `tenant_id` en todas las tablas (si shared schema)
- [ ] FKs incluyen `tenant_id` (si shared schema)
- [ ] Indexes empiezan con `tenant_id` (si shared schema)
- [ ] RLS o filtros automáticos del ORM (si shared schema)
- [ ] Tests de aislamiento entre tenants
- [ ] Tests automáticos en CI
- [ ] Process de provisioning documentado
- [ ] Process de off-boarding (right to delete)
- [ ] Backups consideran el patrón
- [ ] Monitoring detecta queries sin tenant filter
- [ ] Audit logs incluyen tenant_id
