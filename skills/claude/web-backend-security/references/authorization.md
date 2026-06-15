# Autorización

Patrones para control de acceso después de autenticar.

## Principios

1. **Default deny**: si no hay regla explícita que permita, denegar
2. **Least privilege**: dar el mínimo permiso necesario
3. **Separation of duties**: operaciones críticas requieren múltiples actores/roles
4. **Verificar en cada request**: nunca confiar en estado del cliente
5. **Verificar ownership y autorización siempre**: no asumir que tener el ID es suficiente

## RBAC (Role-Based Access Control)

Usuarios tienen roles, roles tienen permisos.

### Modelo

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String email;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
}

@Entity
public class Role {
    @Id @GeneratedValue
    private Long id;
    private String name;  // "ADMIN", "USER", "MANAGER"

    @ManyToMany
    @JoinTable(name = "role_permissions", ...)
    private Set<Permission> permissions;
}

@Entity
public class Permission {
    private String name;  // "users:read", "orders:write", "billing:manage"
}
```

### Implementación con Spring Security

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { /* ... */ }

@PreAuthorize("hasAuthority('users:read')")
public List<UserResponse> listUsers() { /* ... */ }

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public Report generateReport() { /* ... */ }
```

Habilitar method-level security:
```java
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig { }
```

## ABAC (Attribute-Based Access Control)

Decisión basada en atributos del usuario, recurso, acción y contexto. Más expresivo que RBAC para casos como "el editor puede modificar artículos de su propio departamento publicados en los últimos 30 días".

```java
@PreAuthorize("@authService.canEditDocument(#docId, authentication.principal)")
public Document updateDocument(@PathVariable Long docId, @RequestBody UpdateRequest req) { }

@Service
public class AuthorizationService {

    public boolean canEditDocument(Long docId, UserDetails user) {
        Document doc = documentRepo.findById(docId).orElseThrow();
        UserPrincipal principal = (UserPrincipal) user;

        // Ownership
        if (doc.getOwnerId().equals(principal.getId())) return true;

        // Departamento + rol
        if (principal.hasRole("EDITOR") && doc.getDepartmentId().equals(principal.getDepartmentId())) {
            return doc.getCreatedAt().isAfter(Instant.now().minus(30, ChronoUnit.DAYS));
        }

        // Admin siempre
        if (principal.hasRole("ADMIN")) return true;

        return false;
    }
}
```

## IDOR (Insecure Direct Object Reference)

La vulnerabilidad de autorización más común. Usuario A accede a recursos de usuario B cambiando un ID.

### Patrón inseguro

```java
// ❌ MAL
@GetMapping("/api/v1/orders/{id}")
public Order get(@PathVariable Long id) {
    return orderRepo.findById(id).orElseThrow();
    // Cualquier usuario autenticado puede leer cualquier orden
}
```

### Patrones seguros

#### 1. Filtrar en el query

```java
@GetMapping("/api/v1/orders/{id}")
public OrderResponse get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
    return orderRepo.findByIdAndOwnerId(id, user.getId())
        .map(orderMapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
}
```

#### 2. Verificar después de cargar

```java
@GetMapping("/api/v1/orders/{id}")
public OrderResponse get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
    Order order = orderRepo.findById(id).orElseThrow(NotFoundException::new);
    if (!order.getOwnerId().equals(user.getId()) && !user.hasRole("ADMIN")) {
        throw new AccessDeniedException("Not authorized");
    }
    return orderMapper.toResponse(order);
}
```

#### 3. UUIDs no adivinables

Si el ID es público (URLs), usar UUIDs en lugar de IDs incrementales. NO elimina la necesidad de verificar ownership, pero reduce el riesgo de enumeración.

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

### Tests obligatorios contra IDOR

```java
@Test
void should_return404_when_userAccessesOthersResource() throws Exception {
    // user A crea orden 1
    String tokenA = login("alice@example.com");
    Long orderAId = createOrder(tokenA);

    // user B intenta leer orden de A
    String tokenB = login("bob@example.com");
    mockMvc.perform(get("/api/v1/orders/" + orderAId)
            .header("Authorization", "Bearer " + tokenB))
        .andExpect(status().isNotFound());  // NO 200 con datos de A
}
```

**Importante**: responder 404 (no 403). Decir "no autorizado" revela que el recurso existe (info leak).

## Mass Assignment

Vulnerabilidad cuando el body se mapea directo a entidad y el atacante envía campos no esperados (ej: `role`, `active`, `verified`).

### Inseguro

```java
// ❌ MAL
@PostMapping("/api/v1/users")
public User create(@RequestBody User user) {
    return userRepo.save(user);
    // atacante envía { "email": "x@x.com", "role": "ADMIN", "verified": true }
}

@PatchMapping("/api/v1/users/{id}")
public User update(@PathVariable Long id, @RequestBody User update) {
    User existing = userRepo.findById(id).orElseThrow();
    BeanUtils.copyProperties(update, existing);  // copia TODO
    return userRepo.save(existing);
}
```

### Seguro

```java
// ✅ BIEN: DTOs explícitos con SOLO los campos permitidos
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min=12) String password,
    @NotBlank String name
) {}

public record UpdateUserRequest(
    @NotBlank String name,
    String avatarUrl
) {}

@PostMapping("/api/v1/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
    return userService.create(req);  // service decide role, active, etc.
}

@PatchMapping("/api/v1/users/{id}")
public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
    return userService.update(id, req);
}
```

**Regla**: nunca aceptar entidades JPA como `@RequestBody`. Siempre DTOs.

## Privilege Escalation

Casos comunes:
- Endpoint admin sin verificar rol
- Endpoint que cambia su propio rol/permisos
- Endpoint que cambia rol de otro usuario sin ser admin

### Tests

```java
@Test
void should_return403_when_userTriesToAccessAdminEndpoint() throws Exception {
    String userToken = login("user@example.com");
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isForbidden());
}

@Test
void should_notAllow_userToChangeOwnRole() throws Exception {
    String userToken = login("user@example.com");
    mockMvc.perform(patch("/api/v1/users/me")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"role\":\"ADMIN\"}"))
        .andExpect(status().isOk())  // 200 pero el rol NO cambia
        .andExpect(jsonPath("$.role").value("USER"));
}
```

## Vertical vs Horizontal escalation

- **Vertical**: user → admin (escalar privilegios). Mitigar con RBAC + verificar role en cada operación admin.
- **Horizontal**: user A → user B (mismo rol, otros datos). Mitigar con ownership checks (IDOR).

## Multi-tenancy

En SaaS multi-tenant, **aislar datos entre tenants** es crítico. Tipos:

### 1. Database per tenant
Cada tenant tiene su propia DB. Mayor aislamiento, mayor costo operacional.

### 2. Schema per tenant
Una DB, schema por tenant.

### 3. Shared schema con `tenant_id`
Todas las tablas tienen columna `tenant_id`. El más común, pero **el más arriesgado** si falta un WHERE.

### Implementación de "shared schema" segura

```java
// Filtro a nivel de Hibernate
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@MappedSuperclass
public abstract class TenantAwareEntity {
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;
}

@Component
public class TenantFilterAspect {

    @Autowired private EntityManager em;

    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object enableTenantFilter(ProceedingJoinPoint pjp) throws Throwable {
        Long tenantId = SecurityContextHolder.getContext().getAuthentication()
            .getDetails() // o como manejes tenant context
            ;
        Session session = em.unwrap(Session.class);
        session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        try {
            return pjp.proceed();
        } finally {
            session.disableFilter("tenantFilter");
        }
    }
}
```

### Tests de aislamiento

```java
@Test
void should_notExpose_dataAcrossTenants() throws Exception {
    Long order_tenant_A = createOrderAsTenantA();

    String tokenTenantB = loginAsTenantB();
    mockMvc.perform(get("/api/v1/orders/" + order_tenant_A)
            .header("Authorization", "Bearer " + tokenTenantB))
        .andExpect(status().isNotFound());

    // También verificar que listados no incluyen otros tenants
    mockMvc.perform(get("/api/v1/orders")
            .header("Authorization", "Bearer " + tokenTenantB))
        .andExpect(jsonPath("$.content[?(@.id == " + order_tenant_A + ")]").doesNotExist());
}
```

## Patrones específicos

### "Me" pattern para evitar IDOR

En lugar de `GET /api/v1/users/{id}` (donde el usuario pone su propio ID), usar `GET /api/v1/users/me`:

```java
@GetMapping("/api/v1/users/me")
public UserResponse me(@AuthenticationPrincipal UserPrincipal user) {
    return userService.findById(user.getId());
}
```

Más claro, menos propenso a errores.

### Endpoints administrativos en namespace separado

```
/api/v1/users/me        ← user
/api/v1/users/{id}      ← admin (con @PreAuthorize)
/api/v1/admin/users     ← admin (separación clara)
```

Más fácil de auditar y de aplicar filtros (`/api/v1/admin/**` requiere ROLE_ADMIN).

### Operaciones críticas: step-up authentication

Para operaciones muy sensibles (delete account, cambio de email, transferencia grande), requerir re-autenticación reciente:

```java
@PreAuthorize("@stepUpAuth.requireRecentAuth(authentication, 5)")
public void deleteAccount(@AuthenticationPrincipal UserPrincipal user) { }

@Service
public class StepUpAuthService {

    public boolean requireRecentAuth(Authentication auth, int minutesAgo) {
        Instant authTime = extractAuthTime(auth);
        return authTime.isAfter(Instant.now().minus(minutesAgo, ChronoUnit.MINUTES));
    }
}
```

Si la sesión es vieja, solicitar password de nuevo antes de proceder.

## Checklist de autorización

- [ ] Default deny en SecurityConfig (`.anyRequest().authenticated()`)
- [ ] Cada endpoint verifica autorización (RBAC + ownership)
- [ ] No hay endpoint sin protección excepto los explícitamente públicos
- [ ] DTOs separados para input (no entidades como `@RequestBody`)
- [ ] Endpoints admin en namespace separado o con `@PreAuthorize`
- [ ] Tests específicos contra IDOR (user A vs user B)
- [ ] Tests de privilege escalation
- [ ] En multi-tenant: filtro de tenant en cada query
- [ ] Operaciones críticas con step-up authentication
- [ ] Logging de intentos de acceso denegado (`403`)
- [ ] Errores genéricos: `404` para recursos no autorizados (no `403`, evitar info leak)
