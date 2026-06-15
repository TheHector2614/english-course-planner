# Micronaut

Framework JVM con compilación AOT, similar a Quarkus pero con su propio sistema de DI basado en procesamiento de annotations en tiempo de compilación.

## Cuándo elegir Micronaut

- Microservicios cloud-native
- Native images con GraalVM
- Bajo startup time y memory footprint
- Equipo que viene de Spring y quiere algo familiar pero más rápido
- Apps reactivas con Reactor o RxJava

## Estructura típica

```
src/main/java/com/empresa/proyecto/
├── controller/
├── service/
├── repository/
├── domain/
└── exception/

src/main/resources/
├── application.yml
└── db/migration/
```

## Build con Maven

```xml
<parent>
    <groupId>io.micronaut.platform</groupId>
    <artifactId>micronaut-parent</artifactId>
    <version>4.4.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>io.micronaut</groupId>
        <artifactId>micronaut-http-server-netty</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micronaut.data</groupId>
        <artifactId>micronaut-data-hibernate-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micronaut.sql</groupId>
        <artifactId>micronaut-jdbc-hikari</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micronaut.security</groupId>
        <artifactId>micronaut-security-jwt</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micronaut.openapi</groupId>
        <artifactId>micronaut-openapi</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micronaut.flyway</groupId>
        <artifactId>micronaut-flyway</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

## Controller

```java
@Controller("/api/v1/users")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Get("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    @Status(HttpStatus.CREATED)
    public UserResponse create(@Body @Valid CreateUserRequest request) {
        return userService.create(request);
    }

    @Get
    public Page<UserResponse> list(Pageable pageable) {
        return userService.list(pageable);
    }
}
```

## Repository con Micronaut Data

Micronaut Data genera implementaciones en tiempo de compilación (sin proxies dinámicos):

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.active = true")
    Page<User> findActive(Pageable pageable);
}
```

También soporta repositorios JDBC sin JPA:
```java
@JdbcRepository(dialect = Dialect.POSTGRES)
public interface UserJdbcRepository extends CrudRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

## Configuración: application.yml

```yaml
micronaut:
  application:
    name: my-app
  server:
    port: 8080
    cors:
      enabled: true
      configurations:
        web:
          allowed-origins:
            - https://app.example.com
            - http://localhost:4200

datasources:
  default:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

jpa:
  default:
    properties:
      hibernate:
        hbm2ddl:
          auto: validate

flyway:
  datasources:
    default:
      enabled: true

micronaut:
  security:
    authentication: bearer
    token:
      jwt:
        signatures:
          secret:
            generator:
              secret: ${JWT_SECRET}
              jws-algorithm: HS256
```

## Inyección de dependencias

Micronaut usa `jakarta.inject.*` (anteriormente `javax.inject.*`):

```java
@Singleton
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {  // constructor injection
        this.repository = repository;
    }
}
```

Equivalencias de scope:
- `@Singleton` ≈ `@Service` de Spring
- `@Prototype` ≈ `@Scope("prototype")` de Spring
- `@RequestScope` ≈ `@RequestScope` de Spring

## Eventos

```java
public record OrderCreated(Long orderId, String userEmail) {}

@Singleton
public class OrderService {

    private final ApplicationEventPublisher<OrderCreated> publisher;

    public OrderService(ApplicationEventPublisher<OrderCreated> publisher) {
        this.publisher = publisher;
    }

    public void createOrder(/* ... */) {
        // ...
        publisher.publishEvent(new OrderCreated(orderId, email));
    }
}

@Singleton
public class OrderEventListener {

    @EventListener
    @Async
    public void onOrderCreated(OrderCreated event) {
        // ...
    }
}
```

## HTTP Client declarativo

```java
@Client("https://api.example.com")
public interface ExternalApiClient {

    @Get("/users/{id}")
    UserDto getUser(@PathVariable Long id);

    @Post("/users")
    UserDto createUser(@Body CreateUserRequest request);
}
```

Inyectable directamente en services. Implementación generada en compile-time.

## Security con JWT

```java
@Singleton
public class AuthenticationProviderUserPassword implements AuthenticationProvider<HttpRequest<?>, String, String> {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationProviderUserPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthenticationResponse authenticate(HttpRequest<?> request, AuthenticationRequest<String, String> req) {
        User user = userRepository.findByEmail(req.getIdentity()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getSecret(), user.getPassword())) {
            return AuthenticationResponse.failure();
        }
        return AuthenticationResponse.success(user.getEmail(), List.of(user.getRole().name()));
    }
}
```

Endpoint de login generado automáticamente en `/login` si se configura.

Protección por rol:
```java
@Get("/admin")
@Secured("ADMIN")
public String adminOnly() { return "secret"; }
```

## Tests

```java
@MicronautTest
class UserControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    @Test
    void should_return200_when_userExists() {
        UserResponse response = client.toBlocking().retrieve(
            HttpRequest.GET("/api/v1/users/1").bearerAuth("token"),
            UserResponse.class
        );
        assertThat(response.email()).isEqualTo("alice@example.com");
    }
}
```

Soporte automático para Testcontainers:
```yaml
# application-test.yml
test-resources:
  containers:
    postgres:
      image-name: postgres:16-alpine
```

## Build native image

```bash
./mvnw package -Dpackaging=native-image
```

Resultado: binario nativo similar a Quarkus.

## Diferencias clave vs Spring Boot

| Concepto | Spring Boot | Micronaut |
|---|---|---|
| Inyección | `@Autowired` / constructor | constructor (`jakarta.inject`) |
| Singleton | `@Service`, `@Component` | `@Singleton` |
| Controller | `@RestController` + `@GetMapping` | `@Controller` + `@Get` |
| Body | `@RequestBody` | `@Body` |
| Path | `@PathVariable` | `@PathVariable` (igual) |
| Query | `@RequestParam` | `@QueryValue` |
| Config | `@Value("${...}")` | `@Value("${...}")` (igual) o `@Property` |
| HTTP Client | `RestTemplate`, `WebClient` | `@Client` declarativo |
| Compile-time DI | No (runtime reflection) | Sí (AOT) |
| Native image | Spring Native (Spring AOT) | Nativo |
| Reactive | WebFlux | Reactor / RxJava |
