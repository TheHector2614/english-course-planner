# Persistencia

Guía para elegir y usar JPA/Hibernate, JDBC Template y Spring Data JDBC.

## Árbol de decisión

```
¿Tienes relaciones complejas entre entidades (OneToMany, ManyToMany)?
├── Sí → Spring Data JPA / Hibernate
└── No
    │
    ¿Es un CRUD simple con entidades planas?
    ├── Sí → Spring Data JDBC (más simple, sin lazy loading)
    └── No
        │
        ¿Es una query muy compleja, reporte o procedure?
        └── Sí → JDBC Template (control total sobre SQL)
```

## Spring Data JPA / Hibernate

### Relaciones bien manejadas

```java
@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
```

**Reglas**:
- `FetchType.LAZY` siempre que sea posible
- Métodos helper para mantener la relación bidireccional consistente
- `orphanRemoval = true` para colecciones que dependen del padre
- `cascade = CascadeType.ALL` solo cuando el padre realmente "posee" a los hijos

### Evitar N+1 con `@EntityGraph`

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"user", "items", "items.product"})
    Optional<Order> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findAll(Pageable pageable);
}
```

O con JPQL:
```java
@Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.user.id = :userId")
List<Order> findByUserIdWithItems(@Param("userId") Long userId);
```

### Specifications (queries dinámicas)

```java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {}

public class UserSpecifications {

    public static Specification<User> hasEmail(String email) {
        return (root, query, cb) -> email == null ? null : cb.equal(root.get("email"), email);
    }

    public static Specification<User> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<User> createdAfter(Instant date) {
        return (root, query, cb) -> date == null ? null : cb.greaterThan(root.get("createdAt"), date);
    }
}

// Uso
Page<User> users = userRepository.findAll(
    Specification.where(isActive()).and(createdAfter(lastMonth)).and(hasEmail(emailFilter)),
    pageable
);
```

### Auditoría automática

```java
@SpringBootApplication
@EnableJpaAuditing
public class Application { }

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
public abstract class BaseAuditableEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}

@Configuration
public class AuditConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getName);
    }
}
```

### Soft delete

```java
@Entity
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")  // antes era @Where (deprecated en Hibernate 6)
public class User {
    // ...
    @Column(name = "deleted_at")
    private Instant deletedAt;
}
```

### Locking

```java
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdForUpdate(@Param("id") Long id);
}
```

Para optimistic locking: agregar `@Version` a la entidad.

## Spring Data JDBC

Más simple que JPA, sin lazy loading, sin proxies, sin sesión. Ideal para CRUD plano.

```java
@Table("users")
public record User(
    @Id Long id,
    String email,
    String name,
    boolean active,
    Instant createdAt
) {}

public interface UserRepository extends CrudRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("SELECT * FROM users WHERE active = true AND email LIKE :pattern")
    List<User> findActiveByEmailPattern(String pattern);

    @Modifying
    @Query("UPDATE users SET active = false WHERE last_login_at < :threshold")
    int deactivateInactive(Instant threshold);
}
```

**Ventajas**:
- Sin lazy loading (todo es explícito)
- Records inmutables como entidades
- Sin proxies ni first-level cache
- Más rápido para casos simples

**Desventajas**:
- No soporta `@OneToMany` con lazy loading
- Joins manuales más explícitos
- Menos abstracción para queries complejas

## JDBC Template

Para queries muy complejas, procedures, o cuando se necesita control total sobre el SQL.

```java
@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public List<SalesReport> findSalesByPeriod(LocalDate from, LocalDate to) {
        String sql = """
            SELECT
              date_trunc('month', o.created_at) AS month,
              SUM(o.total) AS total_sales,
              COUNT(*) AS order_count,
              AVG(o.total) AS avg_order_value
            FROM orders o
            WHERE o.created_at BETWEEN :from AND :to
              AND o.status = 'COMPLETED'
            GROUP BY date_trunc('month', o.created_at)
            ORDER BY month DESC
            """;

        Map<String, Object> params = Map.of("from", from, "to", to);

        return namedJdbcTemplate.query(sql, params, (rs, rowNum) -> new SalesReport(
            rs.getObject("month", LocalDate.class),
            rs.getBigDecimal("total_sales"),
            rs.getLong("order_count"),
            rs.getBigDecimal("avg_order_value")
        ));
    }

    public int bulkInsertOrders(List<Order> orders) {
        String sql = "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)";
        int[][] result = jdbcTemplate.batchUpdate(sql, orders, 100,
            (ps, order) -> {
                ps.setLong(1, order.getUserId());
                ps.setBigDecimal(2, order.getTotal());
                ps.setString(3, order.getStatus());
            });
        return Arrays.stream(result).mapToInt(arr -> arr.length).sum();
    }
}

public record SalesReport(LocalDate month, BigDecimal totalSales, Long orderCount, BigDecimal avgOrderValue) {}
```

**Cuándo usar**:
- Reportes con aggregations complejas
- Batch operations masivas
- Procedures almacenadas
- SQL específico de un motor (window functions, CTEs complejos)

## Migraciones con Flyway

Estructura:
```
src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__add_users_table.sql
├── V3__add_orders_table.sql
└── V4__add_indexes.sql
```

Ejemplo `V1__init_schema.sql`:
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active) WHERE deleted_at IS NULL;
```

**Reglas Flyway**:
- Versiones secuenciales: `V1__`, `V2__`, etc. (nunca renombrar después de aplicada)
- Nombres descriptivos: `V5__add_orders_index.sql`
- Una migración = un cambio lógico
- Migraciones inmutables (si una migración aplicada cambia, falla checksum)
- Para datos: usar `R__` (repeatable) con cuidado, o crear nuevas versiones
- Rollback: crear migración `V6__rollback_xyz.sql` (Flyway no hace rollback automático)

## Connection pool (HikariCP, default en Spring Boot)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000        # 5 min
      max-lifetime: 1800000       # 30 min
      connection-timeout: 30000   # 30 s
      leak-detection-threshold: 60000  # log si una conexión no se libera en 60s
      pool-name: HikariPool-Main
```

**Tuning**:
- `maximum-pool-size`: ~CPU cores * 2 + disk count (no inflar)
- Verificar pool stats en `/actuator/metrics/hikaricp.connections`

## Anti-patterns

- ❌ `EAGER` fetching por defecto → causa N+1 y queries pesadas
- ❌ Llamar `repository.save()` dentro de un `for` con muchas iteraciones → usar `saveAll()` o batch insert con JDBC
- ❌ Exponer entidades JPA en endpoints REST → mapear a DTO siempre
- ❌ Acceder a colecciones lazy fuera de la transacción → `LazyInitializationException`
- ❌ Cascade `ALL` sin justificación → genera deletes/updates inesperados
- ❌ `findAll()` sin paginación en tablas grandes → load completo en memoria
- ❌ `@OneToMany` bidireccional sin `mappedBy` → genera tabla de join innecesaria
- ❌ Trabajar con strings de fecha en lugar de tipos `java.time.*`
- ❌ Pasar primitivas como IDs (`long`) cuando pueden ser null → usar `Long` (boxed)
- ❌ Lógica de negocio en `@PrePersist` / `@PreUpdate` → debe estar en services
