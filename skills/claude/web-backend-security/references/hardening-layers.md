# Hardening por Capas (Defense in Depth)

Aplicar seguridad en múltiples capas para que la falla de una no exponga el sistema. Cada capa asume que las otras pueden fallar.

```
┌─────────────────────────────────────┐
│  Capa 6: Procesos y personas        │
├─────────────────────────────────────┤
│  Capa 5: Datos                      │
├─────────────────────────────────────┤
│  Capa 4: Aplicación (backend)       │
├─────────────────────────────────────┤
│  Capa 3: API / Servicios            │
├─────────────────────────────────────┤
│  Capa 2: Frontend / Cliente         │
├─────────────────────────────────────┤
│  Capa 1: Red e infraestructura      │
└─────────────────────────────────────┘
```

## Capa 1: Red e infraestructura

### TLS / HTTPS

- TLS 1.3 preferido, 1.2 mínimo
- HSTS con preload
- Certificados renovados automáticamente (Let's Encrypt + certbot)
- Test con SSL Labs, meta A+

### Firewalls / Network policies

- **WAF** delante de apps web públicas (Cloudflare, AWS WAF, ModSecurity)
- Reglas OWASP CRS habilitadas
- Rate limiting a nivel de WAF + a nivel de app
- **Bloquear** geografías no relevantes para tu negocio (si aplica)
- **DDoS protection** (Cloudflare, AWS Shield)

### Segmentación

- App pública en DMZ, DB en red privada
- Microservicios con network policies (Kubernetes NetworkPolicy, security groups)
- Solo los puertos necesarios abiertos
- **Zero trust**: no confiar en "red interna" — autenticar siempre

### Cloud hardening

- Security groups / firewall rules restrictivas (default deny)
- IAM least privilege (no usar root, MFA en accounts admin)
- Bloquear acceso público a buckets S3 / Cloud Storage por default
- VPC endpoints para servicios cloud (no salir a internet)
- Logging de cloud audit (CloudTrail, GCP Audit Logs)

### Contenedores

```dockerfile
# ✅ BIEN
FROM eclipse-temurin:17-jre-alpine AS runtime
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --chown=app:app target/app.jar /app/app.jar
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- Imágenes mínimas (alpine, distroless)
- Usuario no-root
- No secretos en imagen (build args, layers)
- Multi-stage build (no incluir tooling de build)
- Imágenes firmadas (cosign)
- Scan de vulnerabilidades (Trivy, Grype) en CI
- Read-only filesystem cuando sea posible
- Resource limits (CPU, memory) en orchestrator

### Kubernetes hardening

- PodSecurityPolicy / Pod Security Standards (restricted)
- NetworkPolicies entre namespaces
- ServiceAccounts mínimos
- Secrets en gestor (Vault, Sealed Secrets) — no en YAML plain
- RBAC para developers/devops
- Audit logs habilitados
- Imágenes desde registry privado, con firma verificada

### Secrets management

- KMS / Vault / Secrets Manager para producción
- Rotación periódica (90 días para API keys)
- Detección en CI (gitleaks, trufflehog)
- Pre-commit hooks
- `.gitignore` para `.env*`

## Capa 2: Frontend / Cliente

### Headers de seguridad

Ver `headers-cors-csp.md` para detalles. Lo crítico:
- HSTS preload
- CSP estricta (idealmente con nonces)
- X-Content-Type-Options nosniff
- X-Frame-Options DENY
- Referrer-Policy strict-origin-when-cross-origin
- Permissions-Policy

### CSP

Defensa principal contra XSS:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-{random}' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests
```

### XSS prevention

- Frameworks modernos (Angular, React) escapan por defecto — usar interpolación, no `innerHTML`
- Si necesitas HTML del usuario: sanitizar con DOMPurify u OWASP Java HTML Sanitizer
- No `eval()`, `Function()`, `setTimeout(string)`, `setInterval(string)`
- Output encoding según contexto (HTML, JS, URL, CSS)

### Cookies seguras

```
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`: previene acceso desde JS (defensa contra XSS roba-cookies)
- `Secure`: solo se envía por HTTPS
- `SameSite=Strict` (o `Lax` si necesitas que se envíe en navegación cross-site)
- `Path` restringido si aplica
- `Max-Age` corto

### SRI para CDNs

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### Subresource isolation (COOP/COEP/CORP)

Necesarios para SharedArrayBuffer y medidas precisas, también dan defensa contra Spectre. Ver headers.

### Click-jacking

X-Frame-Options DENY + CSP frame-ancestors 'none'.

### CSRF

- Apps con cookies de sesión: SameSite=Strict + CSRF token (double-submit cookie pattern)
- Apps con JWT en Authorization header: no aplica CSRF (atacante no puede setear headers cross-origin)

### Open redirects

Validar siempre que redirects sean a rutas internas, no a URLs arbitrarias del cliente.

### Web Storage

- ❌ JWT, secretos o datos sensibles en `localStorage` o `sessionStorage` (vulnerable a XSS)
- ✅ Solo datos no sensibles (preferencias UI, theme)
- ✅ Tokens en cookies HttpOnly seteadas por backend

## Capa 3: API / Servicios

### Autenticación obligatoria

Default deny:
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/public/**").permitAll()
    .requestMatchers("/api/v1/auth/**").permitAll()
    .anyRequest().authenticated()
)
```

Cada endpoint público debe estar **explícitamente** marcado. Si no está, requiere auth.

### Autorización en cada endpoint

```java
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasAuthority('orders:read')")
@PreAuthorize("@authService.canEditDoc(#docId, authentication)")
```

Ver `authorization.md`.

### Rate limiting

A nivel de:
1. **WAF / CDN** (Cloudflare, AWS WAF) — bloquea ataques masivos
2. **API Gateway** (Kong, Tyk, AWS API Gateway) — rate limits por route
3. **App** (Bucket4j, Resilience4j) — rate limits por user/key

Múltiples capas. Por user **y** por IP. Más estricto en endpoints sensibles (auth, password reset).

### Validación de inputs

Toda entrada externa:
1. Validada por allow-list
2. Tipo-correcta
3. Longitud máxima
4. Caracteres permitidos
5. Sanitización/escape según contexto de salida

```java
public record CreateProductRequest(
    @NotBlank @Size(min = 3, max = 100) @Pattern(regexp = "^[a-zA-Z0-9 \\-]+$") String name,
    @NotNull @DecimalMin("0.01") @DecimalMax("99999.99") BigDecimal price,
    @NotBlank @Size(max = 500) String description,
    @NotNull @Min(0) @Max(10000) Integer stock
) {}
```

### Errores genéricos

- ❌ `{"error":"java.sql.SQLException: column 'foo' not found"}`
- ❌ Stack traces en respuesta
- ❌ `User not found with email john@example.com` (info leak)
- ✅ `{"code":"INVALID_CREDENTIALS","message":"Invalid credentials"}` (mismo mensaje para "usuario no existe" y "password incorrecto")

```yaml
server:
  error:
    include-message: never
    include-binding-errors: never
    include-stacktrace: never
    include-exception: false
```

### Idempotencia para operaciones críticas

```java
@PostMapping("/api/v1/payments")
public PaymentResponse pay(
    @RequestHeader("Idempotency-Key") String key,
    @RequestBody PaymentRequest req
) {
    return paymentService.process(key, req);  // si la key ya se usó, devolver el resultado anterior
}
```

Previene cargos duplicados por retries del cliente.

### Optimistic locking en operaciones concurrentes

```java
@Entity
public class Account {
    @Version
    private Long version;
    private BigDecimal balance;
}
```

Hibernate lanza `OptimisticLockException` si dos transacciones intentan actualizar al mismo tiempo.

### Pagination con límites

```java
@GetMapping
public Page<UserResponse> list(@PageableDefault(size = 20) Pageable pageable) {
    if (pageable.getPageSize() > 100) {
        throw new BadRequestException("Max page size is 100");
    }
    return userService.list(pageable);
}
```

Previene DoS por queries que retornen millones de registros.

### Timeouts

- Timeouts en clientes HTTP externos (5-30s típico)
- Timeouts en queries DB (depende del caso)
- Circuit breakers para servicios externos no confiables

### API versioning

```
/api/v1/users    ← versión actual
/api/v2/users    ← nueva versión
```

Permite deprecar versiones antiguas con problemas de seguridad.

## Capa 4: Aplicación (Backend)

### Inyección de dependencias correcta

- Constructor injection (no field injection)
- Beans inmutables donde sea posible
- No exponer estado mutable

### Manejo de excepciones global

Un solo `@RestControllerAdvice` con handlers consistentes. Logging detallado interno, respuesta genérica al cliente.

### Logging de eventos de seguridad

Ver `logging-monitoring.md`. Todo evento relevante con formato JSON estructurado.

### Secrets en runtime

- Cargar de env vars que vienen de gestor (no de `.env` commiteado)
- Para Spring Boot: `application.yml` con `${VAR}` placeholders
- Validar al startup: si falta un secret crítico, fallar fast (no defaults)

```java
@Component
public class SecretValidator {

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    @PostConstruct
    public void validate() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 chars");
        }
    }
}
```

### Dependencias actualizadas

- Dependabot / Renovate en CI
- SCA (OWASP Dependency Check, Snyk, GitHub Advanced Security)
- Política: críticos en < 7 días, altos en < 30 días
- Lockfiles commiteados

### Static analysis (SAST)

- **SonarQube** con security rules
- **Semgrep** con reglas OWASP
- **CodeQL** (GitHub Advanced Security)
- **SpotBugs** + FindSecBugs (Java)

Ejecutar en CI, bloquear merge si hay critical findings.

### Software supply chain

- Imágenes/binarios firmados (cosign, sigstore)
- SBOM (Software Bill of Materials) generado en cada build
- Verificación de checksums en dependencias
- No instalar paquetes desde fuentes no confiables
- Mirror interno de dependencias para casos críticos

## Capa 5: Datos

### En tránsito

- TLS en TODA comunicación (incluso interna)
- mTLS entre microservicios sensibles

### At-rest

- Encriptación de discos (LUKS, AWS EBS encryption)
- Encriptación de DB (TDE)
- Encriptación a nivel app para campos especialmente sensibles (AES-GCM)
- Encriptación de backups
- Keys en KMS

### Validación de datos en escritura

Constraints en la DB (no solo en la app):
```sql
ALTER TABLE users ADD CONSTRAINT email_check CHECK (email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');
ALTER TABLE orders ADD CONSTRAINT amount_check CHECK (amount > 0);
```

Defensa en capas: si una validación de app falla, la DB rechaza.

### Backups

- Automatizados, regulares (RPO definido)
- Encriptados
- Tested (restores periódicos)
- Off-site y/o cross-region
- Inmutables (WORM, Object Lock) para defensa contra ransomware

### Retention y disposal

- Política clara por tipo de dato
- Jobs scheduled para eliminar/anonimizar datos vencidos
- Secure delete de medios físicos (DBAN, físico)

### Acceso restringido

- DB no expuesta a internet
- Usuarios DB con privilegios mínimos (read-only para reportes, no DROP TABLE para app user)
- Network ACL: solo app servers pueden conectar
- Audit logs en DB (quién consultó qué)

### Separación de datos por sensibilidad

- Datos públicos en su propia DB/schema
- Datos PII en otra
- Datos altamente sensibles (PHI, financial) en otra con controles extras

## Capa 6: Procesos y personas

### Security training

- Onboarding incluye OWASP Top 10
- Phishing simulations periódicas
- Updates ante nuevas amenazas relevantes

### Access management

- SSO + MFA obligatorio para todos los empleados
- JIT (Just-In-Time) access para producción
- Reviews trimestrales de accesos
- Offboarding inmediato (revocar tokens, accesos, llaves)

### Code review

- PRs requieren revisión
- Security review específico para cambios sensibles
- Templates de PR que pregunten "¿hay impacto de seguridad?"

### Incident response

- Plan documentado
- Roles claros (IC, comms, técnico, legal)
- Runbooks para escenarios comunes
- Drills periódicos
- Post-mortems blameless

Ver `incident-response.md`.

### Vendor security

- Due diligence en SaaS providers
- DPA / BAA firmados según compliance
- Acceso de vendors auditado y limitado
- Plan de exit (qué hacer si el vendor cierra)

## Checklist consolidado

### Red e infra
- [ ] HTTPS forzado + HSTS preload
- [ ] WAF con reglas OWASP
- [ ] DDoS protection
- [ ] DMZ + private network para DB
- [ ] Secrets en gestor
- [ ] Imágenes mínimas, no-root, scanned
- [ ] IAM least privilege
- [ ] Cloud audit logs habilitados

### Frontend
- [ ] Headers de seguridad completos (HSTS, CSP, etc.)
- [ ] CSP estricta sin `'unsafe-inline'` en scripts
- [ ] Tokens en cookies HttpOnly, no localStorage
- [ ] CSRF protection (SameSite o token)
- [ ] No `innerHTML` con input no sanitizado
- [ ] Open redirects validados
- [ ] SRI en scripts de CDN

### API
- [ ] Default deny (`.anyRequest().authenticated()`)
- [ ] Cada endpoint con `@PreAuthorize`
- [ ] Rate limiting (múltiples capas)
- [ ] Validación de inputs por allow-list
- [ ] DTOs separados de entidades
- [ ] Errores genéricos al cliente
- [ ] Idempotencia en operaciones críticas
- [ ] Optimistic locking en concurrencia
- [ ] Pagination con límites
- [ ] Timeouts en clientes HTTP
- [ ] API versioning

### Backend
- [ ] Constructor injection
- [ ] Exception handler global
- [ ] Logs estructurados
- [ ] Validación de secrets al startup
- [ ] SCA en CI
- [ ] SAST en CI
- [ ] Dependencias actualizadas

### Datos
- [ ] TLS en tránsito (incluyendo interno)
- [ ] Encriptación at-rest (DB y backups)
- [ ] App-level encryption para campos sensibles
- [ ] Keys en KMS
- [ ] Constraints en DB
- [ ] Backups testeados
- [ ] Política de retención
- [ ] DB no expuesta a internet
- [ ] Audit logs en DB

### Procesos
- [ ] Security training
- [ ] SSO + MFA para empleados
- [ ] JIT access para prod
- [ ] Access reviews trimestrales
- [ ] Code review obligatorio
- [ ] Plan de IR documentado
- [ ] Drills periódicos
- [ ] DPA/BAA con vendors
