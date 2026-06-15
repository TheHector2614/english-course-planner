# Spring Framework clásico y Jakarta EE puro

Para proyectos legacy o cuando se requiere control sin auto-configuración de Spring Boot.

## Spring Framework clásico (sin Boot)

### Cuándo usarlo

- Apps existentes que no se pueden migrar a Spring Boot
- Necesidad de control total sobre la configuración
- Entornos con servidores de aplicación tradicionales (WildFly, Tomcat externo)
- Restricciones corporativas que prohíben Boot

### Estructura de proyecto

```
src/main/java/com/empresa/proyecto/
├── config/
│   ├── AppConfig.java
│   ├── WebConfig.java
│   ├── PersistenceConfig.java
│   └── SecurityConfig.java
├── controller/
├── service/
├── repository/
└── model/

src/main/webapp/
└── WEB-INF/
    ├── web.xml
    └── views/         (si usa JSP)
```

### Configuración Java-based

```java
@Configuration
@ComponentScan(basePackages = "com.empresa.proyecto")
@EnableTransactionManagement
@PropertySource("classpath:application.properties")
public class AppConfig {

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
        config.setUsername("user");
        config.setPassword("password");
        return new HikariDataSource(config);
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.empresa.proyecto.model");

        HibernateJpaVendorAdapter vendor = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendor);

        Properties props = new Properties();
        props.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        props.put("hibernate.hbm2ddl.auto", "validate");
        em.setJpaProperties(props);

        return em;
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
```

### Web config

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(new MappingJackson2HttpMessageConverter());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

### Bootstrap con `WebApplicationInitializer`

```java
public class WebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(AppConfig.class, WebConfig.class);

        container.addListener(new ContextLoaderListener(ctx));

        ServletRegistration.Dynamic dispatcher = container.addServlet(
            "dispatcher",
            new DispatcherServlet(ctx)
        );
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```

Sin XML, sin `web.xml`. Spring 3+ permite configuración 100% Java.

### Controllers, services, repositories

Idénticos a Spring Boot. Las annotations `@RestController`, `@Service`, `@Repository` funcionan igual.

## Jakarta EE puro (sin Spring)

### Cuándo usarlo

- Apps que corren en servidores de aplicación (WildFly, Payara, Open Liberty, Tomcat EE)
- Estándares Jakarta EE / MicroProfile sin frameworks externos
- Entornos altamente regulados (banca, gobierno)

### Estructura típica

```
src/main/java/com/empresa/proyecto/
├── resource/        (JAX-RS endpoints)
├── service/         (EJB o CDI beans)
├── repository/      (DAOs con EntityManager)
├── entity/
└── dto/

src/main/resources/
├── META-INF/
│   └── persistence.xml
└── application.properties

src/main/webapp/
└── WEB-INF/
    ├── beans.xml    (CDI activation)
    └── web.xml      (si aplica)
```

### JAX-RS application

```java
@ApplicationPath("/api")
public class JaxRsApplication extends Application {
    // marcador, JAX-RS escanea recursos automáticamente
}
```

### Resource (controller)

```java
@Path("/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @GET
    @Path("/{id}")
    public UserResponse getById(@PathParam("id") Long id) {
        return userService.findById(id);
    }

    @POST
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

### Service con EJB o CDI

#### EJB Stateless

```java
@Stateless
public class UserService {

    @PersistenceContext
    EntityManager em;

    public UserResponse findById(Long id) {
        User user = em.find(User.class, id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        return toResponse(user);
    }

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public UserResponse create(CreateUserRequest req) {
        User user = new User();
        user.setEmail(req.email());
        user.setName(req.name());
        em.persist(user);
        return toResponse(user);
    }
}
```

#### CDI bean (alternativa moderna a EJB)

```java
@ApplicationScoped
@Transactional
public class UserService {

    @Inject
    UserRepository repository;

    public UserResponse findById(Long id) {
        return repository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
```

### Repository con EntityManager

```java
@ApplicationScoped
public class UserRepository {

    @PersistenceContext
    EntityManager em;

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(em.find(User.class, id));
    }

    public Optional<User> findByEmail(String email) {
        try {
            User user = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                .setParameter("email", email)
                .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public User save(User user) {
        if (user.getId() == null) {
            em.persist(user);
            return user;
        } else {
            return em.merge(user);
        }
    }
}
```

### persistence.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="https://jakarta.ee/xml/ns/persistence"
             version="3.0">
    <persistence-unit name="default" transaction-type="JTA">
        <jta-data-source>java:/jdbc/mydb</jta-data-source>
        <properties>
            <property name="hibernate.dialect" value="org.hibernate.dialect.PostgreSQLDialect"/>
            <property name="hibernate.hbm2ddl.auto" value="validate"/>
        </properties>
    </persistence-unit>
</persistence>
```

### Excepciones con JAX-RS

```java
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable ex) {
        if (ex instanceof NotFoundException) {
            return Response.status(404)
                .entity(new ErrorResponse("NOT_FOUND", ex.getMessage()))
                .build();
        }
        if (ex instanceof ConstraintViolationException cve) {
            Map<String, String> errors = cve.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                    v -> v.getPropertyPath().toString(),
                    v -> v.getMessage()
                ));
            return Response.status(400)
                .entity(new ValidationErrorResponse("VALIDATION_ERROR", errors))
                .build();
        }
        return Response.status(500)
            .entity(new ErrorResponse("INTERNAL_ERROR", "Internal server error"))
            .build();
    }
}
```

### Security con JEE

```java
@Path("/admin")
@RolesAllowed("admin")
public class AdminResource {

    @Context
    SecurityContext securityContext;

    @GET
    @Path("/me")
    public String me() {
        return securityContext.getUserPrincipal().getName();
    }
}
```

Autenticación con `@LoginConfig` en `web.xml` o vía Soteria (JEE 8+).

## MicroProfile (alternativa moderna en JEE)

MicroProfile añade APIs modernas sobre Jakarta EE:

```java
@Path("/users")
public class UserResource {

    @Inject
    @ConfigProperty(name = "app.api.key")
    String apiKey;

    @GET
    @Path("/{id}")
    @Timeout(2000)
    @Retry(maxRetries = 3)
    @CircuitBreaker(requestVolumeThreshold = 4)
    @Counted(name = "userGetCount")
    @Timed(name = "userGetTimer")
    public UserResponse getById(@PathParam("id") Long id) {
        return userService.findById(id);
    }
}
```

Funcionalidades MicroProfile:
- `@ConfigProperty` para inyectar config
- `@Timeout`, `@Retry`, `@CircuitBreaker` (fault tolerance)
- `@Counted`, `@Timed` (metrics)
- `@Health` para healthchecks
- JWT auth integrado

Servidores compatibles: Open Liberty, WildFly (con extensión), Payara, Quarkus, Helidon.

## Diferencias clave

| Concepto | Spring Boot | Spring clásico | JEE puro |
|---|---|---|---|
| Bootstrap | `main()` con Boot | `WebApplicationInitializer` o `web.xml` | Servidor app (deploy `.war`/`.ear`) |
| Config | `application.yml` automático | `@Configuration` manual | `persistence.xml`, `beans.xml` |
| DI | `@Autowired` / constructor | Igual a Boot | `@Inject` (CDI) |
| REST | `@RestController` | Igual a Boot | `@Path` (JAX-RS) |
| Transacciones | `@Transactional` (auto-configurada) | `@Transactional` + `@EnableTransactionManagement` | `@Transactional` (CDI) o JTA con `@TransactionAttribute` (EJB) |
| ORM | Spring Data JPA | Hibernate/JPA manual | `EntityManager` (JPA) |
| Server | Embedded Tomcat/Jetty | Tomcat externo o embedded | Servidor app full |
| Hot reload | Spring DevTools | Manual o JRebel | Variable según servidor |

## Cuándo migrar a Spring Boot

Si trabajas con Spring clásico o JEE puro y puedes migrar:

- **Spring clásico → Spring Boot**: relativamente sencillo, las annotations son compatibles. Reemplazar `@Configuration` manual por starters.
- **JEE puro → Spring Boot**: requiere refactor más profundo (CDI → Spring beans, JAX-RS → Spring MVC, EntityManager → Spring Data).
- **JEE puro → Quarkus**: migración más natural (mismas annotations Jakarta).
