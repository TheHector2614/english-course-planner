# Logging y Monitoreo de Seguridad

Audit logs, SIEM, alerting y métricas de seguridad.

## Principios

1. **Loguear todo evento de seguridad** relevante (auth, autorización, cambios de configuración, acceso a datos sensibles)
2. **NUNCA loguear** passwords, tokens completos, PAN, CVV, datos médicos en plain
3. **Formato estructurado** (JSON) para análisis automatizado
4. **Centralizado**: logs en sistema separado del que los genera (resiliencia + análisis)
5. **Retención según compliance** (típicamente 1+ año para auditoría, 90 días+ para forense)
6. **Alerting** sobre patrones sospechosos en tiempo (cuasi)real

## Qué loguear como `SECURITY_AUDIT`

### Eventos de autenticación
- `AUTH_LOGIN_SUCCESS`
- `AUTH_LOGIN_FAILURE` (con razón: bad_credentials, locked, mfa_required)
- `AUTH_LOGOUT`
- `AUTH_PASSWORD_CHANGED`
- `AUTH_PASSWORD_RESET_REQUESTED`
- `AUTH_PASSWORD_RESET_COMPLETED`
- `AUTH_MFA_ENABLED` / `AUTH_MFA_DISABLED`
- `AUTH_MFA_VERIFY_SUCCESS` / `AUTH_MFA_VERIFY_FAILURE`
- `AUTH_ACCOUNT_LOCKED` / `AUTH_ACCOUNT_UNLOCKED`
- `AUTH_TOKEN_REFRESHED`
- `AUTH_TOKEN_REUSE_DETECTED` (señal de robo)
- `AUTH_NEW_DEVICE_LOGIN` (IP/device fingerprint nuevo)

### Eventos de autorización
- `AUTHZ_ACCESS_DENIED` (cualquier 403)
- `AUTHZ_ROLE_CHANGED`
- `AUTHZ_PERMISSION_GRANTED` / `AUTHZ_PERMISSION_REVOKED`
- `AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT` (user intenta operación de admin)

### Eventos de datos sensibles
- `DATA_PHI_ACCESSED` (HIPAA)
- `DATA_PII_EXPORTED` (GDPR export request)
- `DATA_PII_DELETED` (GDPR right to be forgotten)
- `DATA_FINANCIAL_ACCESSED`
- `DATA_BULK_EXPORT` (descarga masiva — alerta posible exfiltración)

### Eventos de configuración
- `CONFIG_SECURITY_SETTING_CHANGED`
- `CONFIG_USER_CREATED`
- `CONFIG_USER_DELETED`
- `CONFIG_API_KEY_CREATED` / `CONFIG_API_KEY_REVOKED`

### Eventos operacionales
- `RATE_LIMIT_EXCEEDED`
- `CSP_VIOLATION` (report endpoint)
- `INPUT_VALIDATION_FAILED` (patrón SQLi/XSS detectado)
- `SUSPICIOUS_USER_AGENT` (curl, scanners conocidos)
- `MULTIPLE_FAILED_ATTEMPTS` (umbral excedido)

## Formato JSON estructurado

Campos estándar (basados en ECS - Elastic Common Schema):

```json
{
  "@timestamp": "2026-05-19T14:23:45.123Z",
  "event": {
    "category": "authentication",
    "type": "info",
    "action": "AUTH_LOGIN_SUCCESS",
    "outcome": "success"
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "source": {
    "ip": "203.0.113.42",
    "geo": { "country_iso_code": "CO" }
  },
  "user_agent": {
    "original": "Mozilla/5.0 ..."
  },
  "http": {
    "request": {
      "method": "POST",
      "path": "/api/v1/auth/login"
    },
    "response": {
      "status_code": 200
    }
  },
  "trace": {
    "id": "abc123def456"
  },
  "service": {
    "name": "api-gateway",
    "version": "1.2.3",
    "environment": "production"
  },
  "tenant": {
    "id": "tenant-acme"
  },
  "metadata": {
    "session_id_hash": "sha256...",
    "mfa_used": true
  }
}
```

## Implementación con Spring Boot

### Logback con JSON

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

`logback-spring.xml`:
```xml
<configuration>
    <springProfile name="prod">
        <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>/var/log/app/app.json</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>/var/log/app/app-%d{yyyy-MM-dd}.json.gz</fileNamePattern>
                <maxHistory>90</maxHistory>
            </rollingPolicy>
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <fieldNames>
                    <timestamp>@timestamp</timestamp>
                </fieldNames>
                <customFields>{"service.name":"api-gateway","service.environment":"production"}</customFields>
                <includeMdcKeyName>trace_id</includeMdcKeyName>
                <includeMdcKeyName>user_id</includeMdcKeyName>
                <includeMdcKeyName>tenant_id</includeMdcKeyName>
            </encoder>
        </appender>

        <appender name="SECURITY_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>/var/log/app/security-audit.json</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>/var/log/app/security-audit-%d{yyyy-MM-dd}.json.gz</fileNamePattern>
                <maxHistory>365</maxHistory>  <!-- 1 año -->
            </rollingPolicy>
            <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
        </appender>

        <logger name="SECURITY_AUDIT" level="INFO" additivity="false">
            <appender-ref ref="SECURITY_FILE"/>
        </logger>

        <root level="INFO">
            <appender-ref ref="JSON_FILE"/>
        </root>
    </springProfile>
</configuration>
```

### Logger dedicado

```java
@Component
public class SecurityAuditLogger {

    private static final Logger logger = LoggerFactory.getLogger("SECURITY_AUDIT");

    public void log(SecurityEvent event) {
        MDC.put("event.action", event.action());
        MDC.put("event.outcome", event.outcome());
        MDC.put("user.id", event.userId());
        MDC.put("user.email", event.userEmail());
        MDC.put("source.ip", event.ip());
        MDC.put("trace.id", event.traceId());
        // ...
        try {
            logger.info("Security event: {}", event.action());
        } finally {
            MDC.clear();
        }
    }
}
```

Uso:
```java
@PostMapping("/login")
public AuthResponse login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
    try {
        AuthResponse response = authService.login(req);
        auditLogger.log(SecurityEvent.builder()
            .action("AUTH_LOGIN_SUCCESS")
            .outcome("success")
            .userEmail(req.email())
            .ip(getClientIp(httpReq))
            .build());
        return response;
    } catch (BadCredentialsException e) {
        auditLogger.log(SecurityEvent.builder()
            .action("AUTH_LOGIN_FAILURE")
            .outcome("failure")
            .userEmail(req.email())
            .ip(getClientIp(httpReq))
            .reason("bad_credentials")
            .build());
        throw e;
    }
}
```

### Correlation IDs

Cada request debe tener un trace ID propagado por toda la pipeline para correlacionar logs:

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String traceId = req.getHeader("X-Trace-Id");
        if (traceId == null) {
            traceId = UUID.randomUUID().toString();
        }
        MDC.put("trace_id", traceId);
        res.setHeader("X-Trace-Id", traceId);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove("trace_id");
        }
    }
}
```

Mejor aún: usar **Micrometer Tracing** (OpenTelemetry) que ya hace esto + propaga a downstream services.

## Sanitización antes de loguear

```java
public class LogSanitizer {

    // Patrones para detectar PII/secrets
    private static final Pattern EMAIL = Pattern.compile("[\\w.-]+@[\\w.-]+");
    private static final Pattern CREDIT_CARD = Pattern.compile("\\b(?:\\d[ -]*?){13,19}\\b");
    private static final Pattern JWT = Pattern.compile("eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+");
    private static final Pattern PASSWORD_FIELD = Pattern.compile("\"password\"\\s*:\\s*\"[^\"]*\"");

    public static String sanitize(String input) {
        if (input == null) return null;
        String result = input;
        result = JWT.matcher(result).replaceAll("[JWT_REDACTED]");
        result = CREDIT_CARD.matcher(result).replaceAll("[CARD_REDACTED]");
        result = PASSWORD_FIELD.matcher(result).replaceAll("\"password\":\"[REDACTED]\"");
        // Mantener emails en logs de auth, pero hashear si es para logs generales
        return result;
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String masked = name.length() > 2
            ? name.charAt(0) + "***" + name.charAt(name.length() - 1)
            : "***";
        return masked + "@" + parts[1];
    }
}
```

**Reglas**:
- ❌ NUNCA loguear passwords, tokens completos, PAN, CVV, datos médicos en plain
- ✅ Hash de tokens si necesitas referirlos en logs
- ✅ Email completo en `security-audit.log` (necesario para forense), masked en logs generales
- ✅ Truncar payloads largos (10 KB max)
- ✅ Sanitizar inputs antes de loguear (logs poisoning)

## SIEM y centralización

### Stack común

| Componente | Opciones |
|---|---|
| **Recolección** | Fluent Bit, Vector, Filebeat, Promtail |
| **Storage + Query** | Elasticsearch, Loki, ClickHouse, Splunk, Datadog Logs |
| **Alerting** | ElastAlert, Alertmanager, PagerDuty, Opsgenie |
| **SIEM all-in-one** | Splunk, Datadog Cloud SIEM, Microsoft Sentinel, Wazuh (OSS) |
| **Dashboard** | Kibana, Grafana, Splunk |

### Stack open source típico

```
App → JSON file → Fluent Bit → Loki → Grafana (queries + dashboards)
                              ↓
                          Alertmanager → Slack/PagerDuty
```

O ELK clásico:
```
App → JSON file → Filebeat → Logstash → Elasticsearch → Kibana
                                              ↓
                                          Watcher → alerts
```

## Alerting: qué monitorear

### Alertas de seguridad esenciales

| Alerta | Threshold típico | Acción |
|---|---|---|
| Failed logins por user | > 10 en 5 min | Investigar |
| Failed logins por IP | > 50 en 5 min | Bloquear IP, investigar |
| Successful logins desde país inusual | Cualquiera | Notificar usuario, posible compromise |
| Successful logins desde IPs en blocklists | Cualquiera | Investigar |
| Refresh token reuse | Cualquiera | Compromise activo, revocar sesión, notificar |
| Privilege escalation attempts | Cualquiera | Investigar |
| Bulk data export | > 1000 records / hora por user | Investigar |
| 403 spike | > 100x baseline | Posible enumeración |
| 5xx spike | > 5x baseline | Posible ataque o bug en producción |
| CSP violations | spike o patrón sospechoso | Posible XSS intentado |
| WAF blocks | spike | Posible ataque activo |
| New admin user created | Cualquiera | Verificar legitimidad |
| Cert expiration | < 30 días | Renovar |
| Anomaly en uso de API key | desvío estadístico | Posible leak |

### Ejemplo Loki + Alertmanager rule

```yaml
groups:
  - name: security_alerts
    rules:
      - alert: HighFailedLoginRate
        expr: |
          sum(rate({log_type="security"} | json | event_action="AUTH_LOGIN_FAILURE" [5m])) by (source_ip) > 0.5
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "High failed login rate from {{ $labels.source_ip }}"

      - alert: RefreshTokenReuse
        expr: |
          sum(count_over_time({log_type="security"} | json | event_action="AUTH_TOKEN_REUSE_DETECTED" [1m])) > 0
        labels:
          severity: critical
        annotations:
          summary: "Token reuse detected for user {{ $labels.user_email }}"
```

## Retención de logs

| Tipo de log | Online (hot) | Cold storage | Razón |
|---|---|---|---|
| Audit security | 6 meses | 1+ año | Forense, compliance |
| Application | 30 días | 90 días | Debug |
| Access logs (web) | 30 días | 6 meses | Análisis, compliance |
| Logs de pago (PCI) | 3 meses | 1 año | PCI-DSS |
| Logs HIPAA | - | 6 años | HIPAA |
| Logs SOX | - | 7 años | SOX |

Mover a cold storage (S3 Glacier, etc.) para reducir costos.

## Métricas de seguridad (métricas, no logs)

Exportar a Prometheus:

```java
@Component
public class SecurityMetrics {

    private final Counter loginSuccesses;
    private final Counter loginFailures;
    private final Counter authzDenials;
    private final Counter rateLimitHits;
    private final Timer authLatency;

    public SecurityMetrics(MeterRegistry registry) {
        this.loginSuccesses = Counter.builder("auth.logins.success").register(registry);
        this.loginFailures = Counter.builder("auth.logins.failure").register(registry);
        this.authzDenials = Counter.builder("authz.denials").register(registry);
        this.rateLimitHits = Counter.builder("ratelimit.hits").register(registry);
        this.authLatency = Timer.builder("auth.login.latency").register(registry);
    }
}
```

Dashboards en Grafana:
- Failed logins (rate)
- Active sessions
- API errors by status code
- Auth latency (p50, p95, p99)
- Top usernames (para detectar enumeración)
- Geo distribution of requests
- Top blocked IPs

## Anti-patterns en logging

- ❌ Loguear passwords, secrets, tokens completos
- ❌ Loguear payloads completos de PII sin sanitizar
- ❌ Solo loguear a stdout sin captura central
- ❌ Logs sin timestamps con zona horaria
- ❌ Sin correlation ID
- ❌ Niveles incorrectos (ERROR para cosas normales, INFO para fallas críticas)
- ❌ Mensajes sin contexto ("Failed" sin decir qué/quién)
- ❌ Sin alerting sobre eventos críticos
- ❌ Sin retención clara (logs eternos en disco hasta llenar)
- ❌ Logs en mismo storage que la app (un compromise borra los logs)
- ❌ Sin protección de logs (atacante puede inyectar líneas via input)

## Log injection / Log forging

Si loguear input del usuario sin escapar, atacante puede inyectar líneas falsas:

```java
// ❌ MAL
logger.info("User logged in: " + username);
// atacante manda username = "alice\n2026-05-19 SECURITY_AUDIT user=admin AUTH_LOGIN_SUCCESS"

// ✅ BIEN: usar placeholders ({}) y/o sanitizar
logger.info("User logged in: {}", sanitize(username));
```

Usar formato JSON estructurado (no concat) elimina la mayoría de estos riesgos.
