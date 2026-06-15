# Quarkus

Framework cloud-native con compilación AOT y soporte para GraalVM native images. Footprint bajo y startup rápido.

## Cuándo elegir Quarkus

- Microservicios con bajo uso de memoria
- Cold start crítico (serverless: AWS Lambda, Google Cloud Run)
- Native images con GraalVM
- Apps reactivas con Mutiny
- Equipo dispuesto a usar Jakarta EE annotations (no Spring)

## Estructura típica

```
src/main/java/com/empresa/proyecto/
├── resource/        (endpoints REST, equivalente a controllers)
├── service/
├── repository/
├── model/
│   ├── entity/
│   └── dto/
└── exception/

src/main/resources/
├── application.properties
└── db/migration/    (Flyway)
```

## pom.xml básico

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-resteasy-reactive-jackson</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-postgresql</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-security-jpa</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-openapi</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-flyway</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-validator</artifactId>
</dependency>
```

## Resource (controller)

```java
@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class UserResource {

    @Inject
    UserService userService;

    @GET
    @Path("/{id}")
    public UserResponse getById(@PathParam("id") Long id) {
        return userService.findById(id);
    }

    @POST
    @Transactional
    @PermitAll
    public Response create(@Valid CreateUserRequest request) {
        UserResponse created = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @GET
    public List<UserResponse> list(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size
    ) {
        return userService.list(page, size);
    }
}
```

## Entidades con Panache

Panache es la abstracción ORM de Quarkus, más expresiva que JPA puro:

```java
@Entity
@Table(name = "users")
public class User extends PanacheEntity {  // o PanacheEntityBase para custom id

    @Column(nullable = false, unique = true)
    public String email;

    @Column(nullable = false)
    public String password;

    @Column(nullable = false)
    public String name;

    public boolean active = true;

    @CreationTimestamp
    public Instant createdAt;

    // Métodos estáticos (Active Record pattern)
    public static Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }

    public static List<User> findActive() {
        return list("active", true);
    }
}
```

**Active Record vs Repository Pattern**: Panache soporta ambos. Para proyectos grandes, preferir Repository pattern:

```java
@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
}
```

## Configuración: application.properties

```properties
# Datasource
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=${DB_USER:postgres}
quarkus.datasource.password=${DB_PASSWORD:postgres}
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/mydb

# Hibernate
quarkus.hibernate-orm.database.generation=validate
quarkus.hibernate-orm.log.sql=false

# Flyway
quarkus.flyway.migrate-at-start=true

# HTTP
quarkus.http.port=8080
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:4200

# JWT
mp.jwt.verify.publickey.location=publicKey.pem
mp.jwt.verify.issuer=https://example.com/issuer

# Logging
quarkus.log.level=INFO
quarkus.log.category."com.empresa".level=DEBUG

# OpenAPI
quarkus.swagger-ui.always-include=true
quarkus.swagger-ui.path=/swagger-ui
```

## Security con JWT (SmallRye JWT)

```java
@Path("/api/v1/admin")
public class AdminResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    @RolesAllowed("admin")
    public Map<String, Object> me() {
        return Map.of(
            "name", jwt.getName(),
            "groups", jwt.getGroups(),
            "claims", jwt.getClaimNames()
        );
    }
}
```

Generación de tokens:
```java
@ApplicationScoped
public class JwtService {

    public String generate(String email, Set<String> roles) {
        return Jwt.issuer("https://example.com/issuer")
            .subject(email)
            .groups(roles)
            .expiresIn(Duration.ofHours(1))
            .sign();
    }
}
```

## Reactive con Mutiny

```java
@Path("/api/v1/products")
public class ProductResource {

    @Inject
    ProductService productService;

    @GET
    public Uni<List<ProductResponse>> list() {
        return productService.listAsync();
    }

    @GET
    @Path("/{id}")
    public Uni<ProductResponse> getById(@PathParam("id") Long id) {
        return productService.findByIdAsync(id);
    }
}

@ApplicationScoped
public class ProductService {

    @Inject
    ReactivePanacheRepository<Product> repository;

    public Uni<ProductResponse> findByIdAsync(Long id) {
        return repository.findById(id)
            .onItem().ifNull().failWith(() -> new NotFoundException("Product not found"))
            .map(this::toResponse);
    }
}
```

## Dev mode

`./mvnw quarkus:dev` lanza con hot reload automático. Endpoint de Dev UI: `http://localhost:8080/q/dev-ui`.

## Build native image

```bash
./mvnw package -Pnative
```

Requiere GraalVM o usar el builder Docker:
```bash
./mvnw package -Pnative -Dquarkus.native.container-build=true
```

Resultado: binario nativo de ~50MB, startup en ~20ms, memoria ~30MB.

## Tests

```java
@QuarkusTest
class UserResourceTest {

    @Test
    void should_return200_when_userExists() {
        given()
            .when().get("/api/v1/users/1")
            .then()
            .statusCode(200)
            .body("email", equalTo("alice@example.com"));
    }

    @Test
    void should_return404_when_userDoesNotExist() {
        given()
            .when().get("/api/v1/users/99999")
            .then()
            .statusCode(404);
    }
}
```

Testcontainers se integra con DevServices automáticamente — Quarkus levanta una DB de prueba sin configuración adicional.

## Diferencias clave vs Spring Boot

| Concepto | Spring Boot | Quarkus |
|---|---|---|
| Inyección | `@Autowired` / constructor | `@Inject` |
| Singleton bean | `@Service`, `@Component` | `@ApplicationScoped` |
| Request scope | `@RequestScope` | `@RequestScoped` |
| REST endpoint | `@RestController` + `@GetMapping` | `@Path` + `@GET` |
| Path variable | `@PathVariable` | `@PathParam` |
| Query param | `@RequestParam` | `@QueryParam` |
| Body | `@RequestBody` | (implícito) |
| Property | `@Value("${...}")` | `@ConfigProperty(name="...")` |
| Transaction | `@Transactional` | `@Transactional` (igual) |
| ORM | Spring Data JPA | Panache + Hibernate |
| Reactive | WebFlux | Mutiny |
| Config file | `application.yml` | `application.properties` (default) |
