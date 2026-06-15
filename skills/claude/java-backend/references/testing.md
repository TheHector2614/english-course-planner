# Testing

Guía completa: JUnit 5 + Mockito + Spring Boot Test + Testcontainers.

## Estructura

```
src/test/java/com/empresa/proyecto/
├── controller/          (slice tests con @WebMvcTest)
├── service/             (unit tests con Mockito)
├── repository/          (slice tests con @DataJpaTest o integration con Testcontainers)
└── integration/         (E2E con @SpringBootTest + Testcontainers)
```

## Convenciones

- Nombre del test: `should_ExpectedResult_when_Scenario` o `MethodName_Scenario_ExpectedResult`
- Estructura **GIVEN / WHEN / THEN** dentro de cada test
- Un assert principal por test (cuando sea posible)
- Tests independientes (no orden de ejecución obligatorio)
- Datos de test en fixtures (objetos helper) cuando se repitan

## Unit tests con Mockito

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
        User user = UserFixture.aUser().withId(1L).build();
        UserResponse expected = new UserResponse(1L, "a@a.com", "Alice", Instant.now());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(expected);

        // when
        UserResponse result = userService.findById(1L);

        // then
        assertThat(result).isEqualTo(expected);
    }

    @Test
    void should_throwNotFound_when_userDoesNotExist() {
        // given
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> userService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("99");
    }

    @Test
    void should_encodePassword_when_creatingUser() {
        // given
        CreateUserRequest req = new CreateUserRequest("a@a.com", "plainPassword", "Alice");
        User entity = new User();
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userMapper.toEntity(req)).thenReturn(entity);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userMapper.toResponse(any())).thenReturn(mock(UserResponse.class));

        // when
        userService.create(req);

        // then
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("encodedPassword");
    }

    @Test
    void should_rejectDuplicateEmail_when_creatingUser() {
        // given
        CreateUserRequest req = new CreateUserRequest("dup@a.com", "pwd123456", "Bob");
        when(userRepository.existsByEmail("dup@a.com")).thenReturn(true);

        // when / then
        assertThatThrownBy(() -> userService.create(req))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }
}
```

## Test fixtures

```java
public class UserFixture {

    public static UserBuilder aUser() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id = 1L;
        private String email = "test@example.com";
        private String name = "Test User";
        private String password = "encoded";
        private boolean active = true;

        public UserBuilder withId(Long id) { this.id = id; return this; }
        public UserBuilder withEmail(String email) { this.email = email; return this; }
        public UserBuilder withName(String name) { this.name = name; return this; }
        public UserBuilder inactive() { this.active = false; return this; }

        public User build() {
            User u = new User();
            u.setId(id);
            u.setEmail(email);
            u.setName(name);
            u.setPassword(password);
            u.setActive(active);
            return u;
        }
    }
}

// Uso: UserFixture.aUser().withEmail("custom@x.com").inactive().build()
```

## Controller slice tests con @WebMvcTest

```java
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private UserService userService;
    @MockBean private JwtService jwtService;
    @MockBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    void should_return200_when_userExists() throws Exception {
        when(userService.findById(1L))
            .thenReturn(new UserResponse(1L, "a@a.com", "Alice", Instant.now()));

        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("a@a.com"));
    }

    @Test
    @WithMockUser
    void should_return404_when_userDoesNotExist() throws Exception {
        when(userService.findById(99L))
            .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/v1/users/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void should_return401_when_notAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void should_return400_when_invalidRequest() throws Exception {
        CreateUserRequest invalid = new CreateUserRequest("not-email", "short", "");

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid))
                .with(csrf()))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors.email").exists())
            .andExpect(jsonPath("$.errors.password").exists())
            .andExpect(jsonPath("$.errors.name").exists());
    }
}
```

## Repository tests con @DataJpaTest

Para tests rápidos sin Spring Boot completo (usa H2 por defecto):

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired private UserRepository userRepository;
    @Autowired private TestEntityManager entityManager;

    @Test
    void should_findUserByEmail() {
        User user = UserFixture.aUser().withEmail("alice@example.com").build();
        user.setId(null);
        entityManager.persistAndFlush(user);

        Optional<User> found = userRepository.findByEmail("alice@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }
}
```

**Limitación**: H2 no comporta exactamente igual que PostgreSQL/MySQL. Para tests realistas, usar Testcontainers.

## Integration tests con Testcontainers

### Setup

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
abstract class AbstractIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true);

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

Habilitar reutilización en `~/.testcontainers.properties`:
```
testcontainers.reuse.enable=true
```

### Test E2E completo

```java
class UserIntegrationTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDb() {
        userRepository.deleteAll();
    }

    @Test
    void should_registerLoginAndAccessProtectedEndpoint() throws Exception {
        // 1. Register
        RegisterRequest register = new RegisterRequest("alice@example.com", "password123", "Alice");
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isOk())
            .andReturn();

        AuthResponse auth = objectMapper.readValue(
            registerResult.getResponse().getContentAsString(),
            AuthResponse.class
        );

        // 2. Verify user persisted
        assertThat(userRepository.findByEmail("alice@example.com")).isPresent();

        // 3. Access protected endpoint with token
        mockMvc.perform(get("/api/v1/users/me")
                .header("Authorization", "Bearer " + auth.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("alice@example.com"));

        // 4. Access without token returns 401
        mockMvc.perform(get("/api/v1/users/me"))
            .andExpect(status().isUnauthorized());
    }
}
```

## WireMock para mockear APIs externas

```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-jre8</artifactId>
    <version>2.35.2</version>
    <scope>test</scope>
</dependency>
```

```java
@SpringBootTest
@AutoConfigureWireMock(port = 0)
class PaymentServiceIntegrationTest {

    @Value("${wiremock.server.port}")
    private int wiremockPort;

    @Autowired private PaymentService paymentService;

    @DynamicPropertySource
    static void configureWiremock(DynamicPropertyRegistry registry) {
        registry.add("app.payments.api-url", () -> "http://localhost:" + wiremockPort);
    }

    @Test
    void should_processPayment_when_externalApiReturnsSuccess() {
        stubFor(post(urlEqualTo("/charges"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {"id": "ch_123", "status": "succeeded", "amount": 5000}
                """)));

        PaymentResult result = paymentService.charge(BigDecimal.valueOf(50));

        assertThat(result.status()).isEqualTo("succeeded");
        verify(postRequestedFor(urlEqualTo("/charges"))
            .withRequestBody(matchingJsonPath("$.amount", equalTo("5000"))));
    }
}
```

## Parametrized tests

```java
@ParameterizedTest
@CsvSource({
    "valid@email.com, true",
    "invalid-email, false",
    "@nodomain.com, false",
    "no-at-symbol, false"
})
void should_validateEmailFormat(String email, boolean expected) {
    assertThat(emailValidator.isValid(email)).isEqualTo(expected);
}

@ParameterizedTest
@ValueSource(strings = {"", "  ", "ab"})
void should_rejectShortNames(String name) {
    assertThatThrownBy(() -> userService.validateName(name))
        .isInstanceOf(IllegalArgumentException.class);
}

@ParameterizedTest
@MethodSource("invalidUsers")
void should_rejectInvalidUsers(CreateUserRequest req) {
    assertThatThrownBy(() -> userService.create(req))
        .isInstanceOf(Exception.class);
}

static Stream<CreateUserRequest> invalidUsers() {
    return Stream.of(
        new CreateUserRequest("invalid-email", "password123", "Name"),
        new CreateUserRequest("a@a.com", "short", "Name"),
        new CreateUserRequest("a@a.com", "password123", "")
    );
}
```

## Configuración de test

`application-test.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false  # opcional, depende si quieres testear migraciones
  sql:
    init:
      mode: never

app:
  jwt:
    secret: dGVzdC1zZWNyZXQtZm9yLXVuaXQtdGVzdHMtb25seS1kby1ub3QtdXNlLWluLXByb2Q=
    expiration-ms: 3600000
    refresh-expiration-ms: 86400000

logging:
  level:
    root: WARN
    com.empresa.proyecto: DEBUG
```

## Coverage con JaCoCo

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>jacoco-check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>INSTRUCTION</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.70</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Reporte en `target/site/jacoco/index.html`.

## Pirámide de testing recomendada

- **70-80% unit tests**: rápidos, aislados, con mocks
- **15-25% integration/slice tests**: `@WebMvcTest`, `@DataJpaTest`, Testcontainers
- **5-10% E2E tests**: flujos completos con `@SpringBootTest` + Testcontainers

## Anti-patterns

- ❌ Tests que dependen del orden de ejecución
- ❌ Tests que comparten estado mutable
- ❌ Mockear lo que se está probando (mock obsession)
- ❌ Asserts genéricos (`assertTrue(result != null)` → `assertThat(result).isNotNull()`)
- ❌ Mensajes de error sin contexto en asserts
- ❌ Tests sin GIVEN/WHEN/THEN claros
- ❌ Lógica condicional dentro de tests (`if` → parametrized test)
- ❌ Tests que solo verifican mocks sin behavior real
- ❌ Compartir DB entre tests sin limpieza
- ❌ `Thread.sleep()` en tests → usar `Awaitility`
- ❌ `@SpringBootTest` cuando un slice test (`@WebMvcTest`) bastaría (lento)
