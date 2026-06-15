# Spring Boot 3.x — Patrones avanzados

Patrones y configuraciones específicas de Spring Boot 3.x.

## Auto-configuración y customización

### Crear auto-configuration custom

```java
@AutoConfiguration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyProperties.class)
public class MyAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public MyService myService(MyProperties props) {
        return new MyService(props.getEndpoint(), props.getApiKey());
    }
}
```

`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:
```
com.empresa.config.MyAutoConfiguration
```

### Configuration properties tipadas

```java
@ConfigurationProperties(prefix = "app.payments")
@Validated
public record PaymentsProperties(
    @NotBlank String apiUrl,
    @NotBlank String apiKey,
    @DefaultValue("30") Duration timeout,
    @DefaultValue("3") @Min(1) Integer maxRetries
) {}
```

Habilitarlo en `application.yml`:
```yaml
app:
  payments:
    api-url: https://payments.example.com
    api-key: ${PAYMENTS_API_KEY}
    timeout: 30s
    max-retries: 3
```

Y registrar:
```java
@EnableConfigurationProperties(PaymentsProperties.class)
@SpringBootApplication
public class Application { }
```

## Caching

```java
@EnableCaching
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("users", "products");
        manager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(1000));
        return manager;
    }
}
```

```java
@Service
public class UserService {

    @Cacheable(value = "users", key = "#id")
    public UserResponse findById(Long id) { /* ... */ }

    @CacheEvict(value = "users", key = "#user.id")
    public void update(User user) { /* ... */ }

    @CacheEvict(value = "users", allEntries = true)
    public void clearCache() { /* ... */ }
}
```

Para Redis: usar `spring-boot-starter-data-redis` y `RedisCacheManager`.

## Async + Scheduled

```java
@EnableAsync
@EnableScheduling
@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}
```

```java
@Service
public class EmailService {

    @Async("taskExecutor")
    public CompletableFuture<Void> sendEmail(String to, String subject, String body) {
        // ...
        return CompletableFuture.completedFuture(null);
    }

    @Scheduled(cron = "0 0 2 * * *") // cada día a las 2 AM
    public void cleanupOldData() { /* ... */ }
}
```

## Eventos de aplicación

```java
public record OrderCreatedEvent(Long orderId, String userEmail, BigDecimal total) {}

@Service
public class OrderService {
    private final ApplicationEventPublisher events;

    public Order create(CreateOrderRequest req) {
        Order order = /* ... */;
        events.publishEvent(new OrderCreatedEvent(order.getId(), order.getUserEmail(), order.getTotal()));
        return order;
    }
}

@Component
public class OrderEventListener {

    @EventListener
    @Async
    public void onOrderCreated(OrderCreatedEvent event) {
        // enviar email, notificar a otros sistemas, etc.
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreatedAfterCommit(OrderCreatedEvent event) {
        // ejecutar solo después de commit exitoso
    }
}
```

## RestTemplate vs WebClient vs RestClient

| Cliente | Cuándo usar |
|---|---|
| **RestTemplate** | Legacy, mantenimiento. NO recomendado para código nuevo |
| **WebClient** | Reactivo, no-bloqueante. Para WebFlux o cuando necesitas concurrencia alta |
| **RestClient** (Spring 6.1+) | **Recomendado para código nuevo**. API similar a WebClient pero síncrono |

```java
@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
            .baseUrl("https://api.example.com")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(
                ClientHttpRequestFactorySettings.defaults()
                    .withConnectTimeout(Duration.ofSeconds(5))
                    .withReadTimeout(Duration.ofSeconds(30))
            ))
            .build();
    }
}
```

Uso:
```java
public UserResponse fetchUser(Long id) {
    return restClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .body(UserResponse.class);
}
```

## CORS

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com", "http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "X-Total-Count")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

O en SecurityConfig si usas Spring Security:
```java
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

## Rate limiting (con Bucket4j)

```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.10.1</version>
</dependency>
```

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String key = req.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(key, k -> Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
            .build());

        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            res.getWriter().write("Rate limit exceeded");
        }
    }
}
```

## Profiles

```java
@Profile("dev")
@Service
public class DevEmailService implements EmailService {
    public void send(...) { System.out.println("Email simulado"); }
}

@Profile("!dev")  // todos menos dev
@Service
public class ProdEmailService implements EmailService { /* real SMTP */ }
```

Activar con: `--spring.profiles.active=prod` o `SPRING_PROFILES_ACTIVE=prod`.

## Pagination + Sorting

Ya viene en Spring Data:

```java
@GetMapping
public Page<UserResponse> list(
    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
    Pageable pageable
) {
    return userService.list(pageable);
}
```

Request: `GET /api/v1/users?page=0&size=10&sort=name,asc&sort=createdAt,desc`

Response:
```json
{
  "content": [...],
  "totalElements": 152,
  "totalPages": 16,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

## Virtual threads (Java 21, pero útil notar)

Spring Boot 3.2+ soporta virtual threads:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

Útil para apps con mucho I/O. En Java 17 puro no aplica.
