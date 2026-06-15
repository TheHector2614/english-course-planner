---
name: java-backend
description: Desarrolla backends en Java 17 con Spring Boot (default), Spring Framework clásico, Quarkus, Micronaut o Jakarta EE puro. Cubre arquitectura por capas (controller/service/repository/model), persistencia (JPA/Hibernate, JDBC Template, Spring Data JDBC), seguridad (Spring Security + JWT, OAuth2/OIDC, Auth0/Okta), tests obligatorios (JUnit 5 + Mockito + Testcontainers), documentación automática con OpenAPI/springdoc, y Maven como build tool. Activa esta skill SIEMPRE que el usuario mencione "Java", "Spring", "Spring Boot", "Quarkus", "Micronaut", "JEE/Jakarta EE", "API REST en Java", "microservicio Java", "endpoint Java", "JPA", "Hibernate", "repository", "controller Spring", "Maven", "pom.xml", "JWT en Java", "Spring Security", o pida cualquier tarea de backend Java (crear endpoints, entidades, servicios, repositorios, autenticación, validación, tests con JUnit). También para migrar entre frameworks, refactorizar a estructura por capas, o aplicar mejores prácticas de Java backend moderno.
---

# Java Backend Development

Skill para desarrollar backends Java profesionales con énfasis en Spring Boot (default) y conocimiento secundario de Spring clásico, Quarkus, Micronaut y JEE puro.

## Decisión inicial: framework a usar

**Si el usuario no especifica framework**, asume **Spring Boot 3.x** (es lo más común y moderno). Si menciona explícitamente otro framework o trabaja sobre un proyecto existente, **inspecciona `pom.xml`** primero para detectar qué se usa.

Frameworks soportados:

| Framework | Cuándo usarlo |
|---|---|
| **Spring Boot 3.x** | Default. APIs REST, microservicios, apps empresariales modernas |
| **Spring Framework clásico** | Apps legacy o cuando se requiere control total sin auto-configuración |
| **Quarkus** | Cloud-native, GraalVM native images, microservicios con bajo footprint |
| **Micronaut** | Microservicios con compilación AOT, similar a Quarkus pero diferente DI |
| **Jakarta EE puro** | Apps empresariales con servidores de aplicación (WildFly, Payara) |

Para detalles específicos de cada uno, consultar:
- `references/spring-boot.md` — todo lo relacionado a Spring Boot (default)
- `references/quarkus.md` — patrones Quarkus
- `references/micronaut.md` — patrones Micronaut
- `references/spring-classic-jee.md` — Spring clásico y JEE puro

## Stack default (Spring Boot)

- **Java 17** (LTS estable). Verificar con `java --version` si hay duda
- **Spring Boot 3.x** (última estable)
- **Maven** como build tool
- **Spring Data JPA / Hibernate** para persistencia
- **Spring Security + JWT** para autenticación
- **springdoc-openapi** para documentación automática
- **JUnit 5 + Mockito + Testcontainers** para tests
- **MapStruct** para mapeo DTO ↔ Entity
- **Lombok** opcional (preguntar al usuario si lo prefiere)

## Estructura por capas obligatoria

```
src/main/java/com/empresa/proyecto/
├── ProyectoApplication.java          (clase main con @SpringBootApplication)
├── config/                           (configuraciones: Security, Web, OpenAPI, etc.)
│   ├── SecurityConfig.java
│   ├── OpenApiConfig.java
│   └── WebConfig.java
├── controller/                       (REST controllers)
│   ├── UserController.java
│   └── ProductController.java
├── service/                          (lógica de negocio)
│   ├── UserService.java
│   └── ProductService.java
├── repository/                       (acceso a datos)
│   ├── UserRepository.java
│   └── ProductRepository.java
├── model/                            (entidades JPA + DTOs)
│   ├── entity/
│   │   ├── User.java
│   │   └── Product.java
│   ├── dto/
│   │   ├── request/
│   │   │   └── CreateUserRequest.java
│   │   └── response/
│   │       └── UserResponse.java
│   └── mapper/
│       └── UserMapper.java           (MapStruct)
├── exception/                        (excepciones custom + handler global)
│   ├── ResourceNotFoundException.java
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── security/                         (JWT, filters, providers)
│   ├── JwtService.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
└── util/                             (utilidades varias)

src/main/resources/
├── application.yml                   (config principal; preferir YAML sobre properties)
├── application-dev.yml
├── application-prod.yml
└── db/migration/                     (Flyway)
    ├── V1__init_schema.sql
    └── V2__add_users_table.sql

src/test/java/com/empresa/proyecto/
├── controller/
├── service/
├── repository/
└── integration/                      (tests de integración con Testcontainers)
```

## Convenciones de código (Java 17)

### Aprovechar features de Java 17

- **Records** para DTOs inmutables:
  ```java
  public record UserResponse(Long id, String email, String name, Instant createdAt) {}
  ```
- **Pattern matching** para `instanceof` y `switch`
- **Sealed classes** para jerarquías cerradas
- **Text blocks** para SQL/JSON multilínea
- **`var`** solo para tipos obvios del contexto (no abusar)

### Nombrado

- Clases: `PascalCase` (`UserService`, `CreateUserRequest`)
- Métodos y variables: `camelCase` (`findByEmail`, `userRepository`)
- Constantes: `UPPER_SNAKE_CASE` (`MAX_RETRY_ATTEMPTS`)
- Paquetes: `lowercase.sin.guiones`
- Tests: `MethodName_Scenario_ExpectedResult` o `should_ExpectedResult_when_Scenario`

### Inyección de dependencias

**SIEMPRE constructor injection** (no field injection con `@Autowired`):

```java
@Service
@RequiredArgsConstructor  // si se usa Lombok
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    // ...
}
```

Sin Lombok:
```java
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### Controllers

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create new user")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping
    public Page<UserResponse> list(
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
        @RequestParam(required = false) String email
    ) {
        return userService.list(pageable, email);
    }
}
```

**Reglas controllers**:
- Versionar API: `/api/v1/...`
- Validar inputs con `@Valid`
- Retornar `ResponseEntity<>` solo cuando se necesite controlar status; en otros casos retornar el objeto directo + `@ResponseStatus`
- Paginación con `Pageable` de Spring (no implementar manualmente)
- Annotations OpenAPI (`@Tag`, `@Operation`) para documentación rica

### Services

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already in use");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
}
```

**Reglas services**:
- `@Transactional(readOnly = true)` a nivel de clase, sobrescribir con `@Transactional` en métodos de escritura
- Throw excepciones custom específicas (no `RuntimeException` genéricas)
- Mapear Entity ↔ DTO en el service (no exponer entidades a controllers)
- Lógica de negocio aquí, no en controllers ni repositories

### Repositories

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.active = true AND u.email LIKE %:filter%")
    Page<User> findActiveUsers(@Param("filter") String filter, Pageable pageable);
}
```

**Reglas repositories**:
- Extender `JpaRepository<Entity, ID>` (no `CrudRepository`, da menos)
- Preferir Query Methods (`findByEmail`) sobre `@Query` cuando sea posible
- `@Query` con JPQL para queries complejas; usar SQL nativo solo cuando sea estrictamente necesario
- Para queries dinámicas, usar `Specification<T>` o Querydsl
- Paginación con `Pageable` siempre que retornes listas

### Entidades JPA

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;  // optimistic locking
}
```

**Reglas entidades**:
- `@Table` con índices explícitos para columnas frecuentes en queries
- Timestamps auditables (`@CreatedDate`, `@LastModifiedDate`) — habilitar con `@EnableJpaAuditing`
- `@Version` para optimistic locking en entidades que se modifican concurrentemente
- Evitar bidireccional `@OneToMany` sin necesidad (genera complejidad y problemas N+1)
- Lazy loading por defecto (`FetchType.LAZY`); usar `JOIN FETCH` o `@EntityGraph` cuando se necesite eager
- No exponer entidades en controllers (usar DTOs)

### DTOs con Records

```java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotBlank @Size(min = 2, max = 100) String name
) {}

public record UserResponse(
    Long id,
    String email,
    String name,
    Instant createdAt
) {}
```

**Reglas DTOs**:
- Records siempre (inmutables, sin boilerplate)
- Validación con annotations (`@NotBlank`, `@Email`, `@Size`, `@Min`, etc.)
- DTOs separados por operación: `CreateUserRequest`, `UpdateUserRequest`, `UserResponse`

### MapStruct

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "password", ignore = true)  // se setea en service después de hash
    User toEntity(CreateUserRequest request);

    List<UserResponse> toResponseList(List<User> users);
}
```

## Manejo de errores global

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage(), Instant.now()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("BUSINESS_ERROR", ex.getMessage(), Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                err -> err.getDefaultMessage() != null ? err.getDefaultMessage() : "invalid"
            ));
        return ResponseEntity.badRequest()
            .body(new ValidationErrorResponse("VALIDATION_ERROR", "Validation failed", errors, Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "Internal server error", Instant.now()));
    }
}

public record ErrorResponse(String code, String message, Instant timestamp) {}
public record ValidationErrorResponse(String code, String message, Map<String, String> errors, Instant timestamp) {}
```

## Persistencia: cuándo usar cada opción

| Caso de uso | Opción |
|---|---|
| CRUD estándar con entidades relacionadas | **Spring Data JPA / Hibernate** |
| Queries muy complejas o procedures | **JDBC Template** |
| App moderna sin relaciones complejas | **Spring Data JDBC** (más simple que JPA, sin lazy loading) |
| Reportes y aggregations pesadas | **JDBC Template** con SQL nativo |
| Multi-tenant o sharding | JPA con `RoutingDataSource` |

Para detalles consultar `references/persistence.md`.

## Seguridad

Default: **Spring Security + JWT** para APIs REST stateless. Para detalles completos consultar `references/security.md`.

Esqueleto mínimo:

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Otras opciones** (consultar `references/security.md`):
- OAuth2/OIDC con Spring Security
- Auth0 / Okta como proveedor externo
- Keycloak self-hosted

## Tests obligatorios

**Generar tests SIEMPRE por defecto** (a diferencia de la skill de Angular). Stack:
- **JUnit 5** (`@Test`, `@BeforeEach`, etc.)
- **Mockito** para unit tests
- **Spring Boot Test** para integration tests
- **Testcontainers** para tests con DB real (PostgreSQL/MySQL en contenedor)
- **AssertJ** para assertions fluent
- **WireMock** para mockear APIs externas

Para plantillas completas y patrones, consultar `references/testing.md`.

Ejemplo unit test:
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserService userService;

    @Test
    void should_returnUser_when_findByIdAndExists() {
        // given
        User user = User.builder().id(1L).email("a@a.com").build();
        UserResponse expected = new UserResponse(1L, "a@a.com", "A", Instant.now());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(expected);

        // when
        UserResponse result = userService.findById(1L);

        // then
        assertThat(result).isEqualTo(expected);
    }

    @Test
    void should_throwNotFound_when_findByIdAndDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("99");
    }
}
```

## Documentación API: springdoc-openapi

Dependencia en `pom.xml`:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

Configuración:
```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("API Title")
                .version("1.0")
                .description("API description"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
```

Accesible en: `http://localhost:8080/swagger-ui.html` y `/v3/api-docs`.

Annotations en controllers: `@Tag`, `@Operation`, `@ApiResponse`, `@Parameter`, `@Schema`.

## Configuración: application.yml

Preferir YAML sobre `.properties`:

```yaml
spring:
  application:
    name: my-app
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate  # nunca update/create-drop en prod
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false  # true solo en dev
  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8080
  error:
    include-message: always
    include-binding-errors: always

logging:
  level:
    root: INFO
    com.empresa.proyecto: DEBUG

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: 3600000  # 1 hora
    refresh-expiration-ms: 604800000  # 7 días

springdoc:
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
```

**Reglas**:
- **NUNCA** hardcodear secrets (usar variables de entorno con `${}`)
- `ddl-auto: validate` en prod (nunca `update`)
- Profiles: `application-dev.yml`, `application-prod.yml`
- Usar **Flyway** para migraciones de DB (no `ddl-auto: create`)
- Configurar logging por paquete

## Observabilidad

Para producción, incluir siempre:
- **Spring Boot Actuator** (`/actuator/health`, `/actuator/metrics`, `/actuator/info`)
- **Micrometer** + Prometheus (métricas)
- **Logback** con formato JSON estructurado en prod
- **Correlation IDs** en logs (MDC) y headers HTTP
- **Distributed tracing** con Micrometer Tracing (OpenTelemetry, Zipkin)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

## Pom.xml base (Spring Boot 3.x)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
    </parent>

    <groupId>com.empresa</groupId>
    <artifactId>proyecto</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>17</java.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <testcontainers.version>1.19.7</testcontainers.version>
        <springdoc.version>2.5.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Web + Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Persistencia -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <!-- Security + JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>

        <!-- Lombok (opcional) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>${springdoc.version}</version>
        </dependency>

        <!-- Actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## Proceso para tareas comunes

### Si piden crear un endpoint
1. Crear Entity (si no existe)
2. Crear DTOs (Request/Response como records)
3. Crear Mapper (MapStruct)
4. Crear Repository
5. Crear Service con `@Transactional`
6. Crear Controller con annotations OpenAPI
7. Crear migración Flyway si hay schema nuevo
8. Generar tests (unit del service + integration del controller con Testcontainers)

### Si piden un proyecto completo
1. Preguntar: nombre, DB (PostgreSQL default), si requiere auth
2. Generar `pom.xml` con dependencias necesarias
3. Estructura completa de carpetas
4. `application.yml` con perfiles dev/prod
5. `SecurityConfig` si requiere auth
6. `GlobalExceptionHandler` siempre
7. `OpenApiConfig` siempre
8. Al menos un endpoint funcional como ejemplo
9. Tests del ejemplo
10. README con instrucciones (`mvn spring-boot:run`, swagger URL)

### Entregable
Crear archivos en `/mnt/user-data/outputs/<nombre-proyecto>/` con la estructura completa.
Incluir `README.md` con instrucciones de build/run/test.
Llamar a `present_files` al final.

## Lo que NUNCA hay que hacer

- Field injection (`@Autowired` en campos privados) → usar constructor injection
- Exponer entidades JPA en endpoints REST → siempre DTOs
- Hardcodear secrets, URLs de DB, JWT keys → usar `${ENV_VAR}` en yml
- `ddl-auto: update` o `create-drop` en producción → usar Flyway/Liquibase
- Lógica de negocio en controllers → debe estar en services
- Llamadas a repositorios desde controllers → siempre vía services
- Excepciones genéricas (`RuntimeException`) → crear excepciones específicas + handler global
- N+1 queries por relaciones lazy mal manejadas → usar `@EntityGraph` o `JOIN FETCH`
- `@Transactional` en repositorios o controllers → solo en services
- Pasar entidades JPA fuera del scope transaccional → mapear a DTO antes
- Omitir tests cuando se pide código nuevo
- `System.out.println` para logging → usar SLF4J (`@Slf4j` o Logger)
- DTOs como clases mutables → usar records
- Hashing de passwords en plano o con MD5/SHA1 → usar BCrypt vía `PasswordEncoder`
