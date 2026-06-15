# OWASP Top 10 (2021) — Checklist y patrones

Lista priorizada de vulnerabilidades más críticas. Aplicar este checklist al auditar cualquier app web.

## A01:2021 — Broken Access Control

**Qué es**: usuarios pueden actuar fuera de sus permisos (acceder/modificar datos de otros, escalar privilegios, IDOR).

### Patrones de ataque comunes
- IDOR (Insecure Direct Object Reference): cambiar `id` en URL para acceder a recursos ajenos
- Bypass de filtros frontend mediante request directo a la API
- Mass assignment: enviar `{ "role": "admin" }` en update de usuario
- Forced browsing: acceder a URLs admin sin estar autenticado

### Cómo defenderse

```java
// ❌ MAL: confía solo en el ID que viene
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    return orderRepo.findById(id).orElseThrow();
}

// ✅ BIEN: verifica ownership
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
    Order order = orderRepo.findById(id).orElseThrow(NotFoundException::new);
    if (!order.getOwnerEmail().equals(user.getUsername())) {
        throw new AccessDeniedException("Not your order");
    }
    return order;
}

// ✅ MEJOR: filtra por ownership en el query
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
    return orderRepo.findByIdAndOwnerEmail(id, user.getUsername())
        .orElseThrow(NotFoundException::new);
}
```

**Checks a realizar**:
- [ ] Cada endpoint que recibe un ID verifica ownership
- [ ] No hay endpoints sin `@PreAuthorize` o equivalente
- [ ] `permitAll()` solo en rutas explícitamente públicas
- [ ] DTOs separados para input (no aceptar `id`, `role`, `active` desde el cliente)
- [ ] Tests específicos de IDOR (user A no puede leer recurso de user B)
- [ ] CORS no permite cualquier origen (`*` solo si la API es pública y sin credenciales)

## A02:2021 — Cryptographic Failures

**Qué es**: datos sensibles en plain text, crypto débil, gestión incorrecta de keys.

### Problemas comunes
- Passwords con MD5/SHA1/SHA256 sin salt
- HTTPS solo en login pero no en resto del sitio
- Datos sensibles (PII, PAN) en plain text en DB
- Secrets en código o variables de entorno commiteadas
- Uso de algoritmos deprecados (DES, RC4, MD5)

### Cómo defenderse

```java
// ❌ MAL
String hash = DigestUtils.sha256Hex(password);

// ✅ BIEN — BCrypt
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode(password);

// ✅ MEJOR — Argon2id
PasswordEncoder encoder = new Argon2PasswordEncoder(16, 32, 1, 65536, 3);
String hash = encoder.encode(password);
```

**Checks**:
- [ ] Passwords con argon2id o bcrypt cost ≥ 12
- [ ] HTTPS forzado en toda la app (HSTS preload)
- [ ] Datos sensibles encriptados en reposo (AES-256-GCM)
- [ ] TLS 1.2+ (preferir 1.3); ciphers fuertes
- [ ] Secrets en gestor (no en `.env` commiteado)
- [ ] Keys rotadas periódicamente
- [ ] Tokens JWT firmados con algoritmo seguro (HS256+, no `none`)

Ver detalles en `crypto.md`.

## A03:2021 — Injection

**Qué es**: input no sanitizado interpretado como código/comando/query.

### Tipos comunes
- SQL Injection
- NoSQL Injection (MongoDB, etc.)
- OS Command Injection
- LDAP Injection
- XSS (cross-site scripting) — antes era categoría propia
- Server-Side Template Injection (SSTI)
- ORM Injection (JPQL/HQL mal construido)

### Cómo defenderse

```java
// ❌ MAL: concatenación
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
jdbcTemplate.queryForList(sql);

// ✅ BIEN: parámetros
String sql = "SELECT * FROM users WHERE email = ?";
jdbcTemplate.queryForList(sql, email);

// ✅ BIEN: JPA
userRepo.findByEmail(email); // Spring Data JPA usa parámetros

// ❌ MAL: JPQL con concatenación
em.createQuery("SELECT u FROM User u WHERE u.email = '" + email + "'");

// ✅ BIEN: JPQL parametrizado
em.createQuery("SELECT u FROM User u WHERE u.email = :email")
  .setParameter("email", email);
```

```typescript
// ❌ MAL (Angular): innerHTML con input del usuario
<div [innerHTML]="userComment"></div>

// ✅ BIEN: interpolación (Angular escapa por defecto)
<div>{{ userComment }}</div>

// Si DEBE ser HTML, sanitizar:
import { DomSanitizer } from '@angular/platform-browser';
constructor(private sanitizer: DomSanitizer) {}
safe = this.sanitizer.sanitize(SecurityContext.HTML, untrustedHtml);
```

**Checks**:
- [ ] No hay concatenación de strings en queries SQL
- [ ] Toda query usa parámetros (`?` o `:named`)
- [ ] Validación de inputs por allow-list
- [ ] Escape correcto según contexto de salida (HTML, JS, URL, CSS)
- [ ] No usar `eval()`, `exec()`, `Runtime.exec()` con input del usuario
- [ ] Sanitización con librerías estándar (DOMPurify, OWASP Java HTML Sanitizer)

## A04:2021 — Insecure Design

**Qué es**: fallas de diseño imposibles de arreglar con implementación. Falta de threat modeling, ausencia de capas defensivas, asunciones inseguras.

### Ejemplos
- "Olvidé contraseña" que revela si el email existe
- Endpoint que devuelve credenciales o tokens en el body
- Workflow que permite crear orden sin verificar precio (price tampering)
- Operación crítica sin confirmación o auditoría
- Race condition en transferencias bancarias
- Token de recuperación con expiración larga (días)

### Cómo defenderse
- Threat modeling al iniciar el proyecto (STRIDE)
- Patrones secure-by-default (deny-by-default, least privilege)
- Defense in depth (varias capas para una sola amenaza)
- Reviews de diseño antes de implementar features sensibles

Ver `threat-modeling.md`.

## A05:2021 — Security Misconfiguration

**Qué es**: configuración insegura por defecto, servicios expuestos, mensajes de error verbosos.

### Problemas comunes
- Spring Actuator `/env`, `/heapdump` expuestos públicamente
- Stack traces en respuestas HTTP en producción
- CORS con `Access-Control-Allow-Origin: *` y credenciales
- Headers de seguridad faltantes
- Versiones antiguas con CVEs conocidos
- Cuentas/passwords por defecto
- S3 buckets públicos por accidente

### Cómo defenderse

```yaml
# application-prod.yml — Spring Boot
server:
  error:
    include-message: never        # no exponer mensajes de error
    include-binding-errors: never
    include-stacktrace: never
    include-exception: false

management:
  endpoints:
    web:
      exposure:
        include: health, info    # NUNCA env, heapdump, beans en prod
  endpoint:
    health:
      show-details: when-authorized
```

**Checks**:
- [ ] Stack traces ocultos en producción
- [ ] Actuator/admin endpoints restringidos o detrás de auth
- [ ] CORS configurado con origins específicos
- [ ] Headers de seguridad presentes (HSTS, CSP, X-Frame-Options, etc.)
- [ ] No hay cuentas con passwords por defecto
- [ ] Servicios internos no expuestos a internet
- [ ] `ddl-auto: validate` en prod (no `update`)

Ver `hardening-layers.md`.

## A06:2021 — Vulnerable and Outdated Components

**Qué es**: dependencias con vulnerabilidades conocidas (CVE).

### Cómo defenderse

```bash
# Maven
mvn dependency-check:check
# o
mvn org.owasp:dependency-check-maven:check

# npm
npm audit
npm audit fix

# Yarn
yarn audit

# Renovate / Dependabot
# Configurar en GitHub para auto-PRs
```

**Checks**:
- [ ] SCA tool en CI (Dependabot, Renovate, Snyk, OWASP Dependency Check)
- [ ] Política de actualización: críticos en < 7 días, altos en < 30 días
- [ ] SBOM (Software Bill of Materials) generado en cada build
- [ ] No usar dependencias sin mantenimiento (último commit > 2 años)
- [ ] Lockfiles commiteados (`package-lock.json`, `pom.xml` con versiones pinned)

## A07:2021 — Identification and Authentication Failures

**Qué es**: auth débil, brute force, credential stuffing, session fixation.

### Problemas
- Sin rate limiting en `/login`
- Sin lockout de cuenta tras N intentos
- Passwords débiles permitidos (sin política)
- Sin MFA disponible
- JWTs con `alg: none` aceptados
- Session IDs predecibles o no regenerados tras login

### Cómo defenderse

```java
// Rate limiting con Bucket4j
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (req.getRequestURI().equals("/api/v1/auth/login")) {
            String key = req.getRemoteAddr();
            Bucket bucket = buckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build());
            if (!bucket.tryConsume(1)) {
                res.setStatus(429);
                return;
            }
        }
        chain.doFilter(req, res);
    }
}
```

**Checks**:
- [ ] Rate limiting en endpoints de auth
- [ ] Lockout tras 5-10 intentos fallidos (con captcha o backoff)
- [ ] Política de passwords (mínimo 12 chars, no en breaches conocidos)
- [ ] MFA disponible (TOTP o WebAuthn, no SMS)
- [ ] Logout invalida tokens del lado servidor (no solo cliente)
- [ ] Session/tokens con expiración corta
- [ ] Refresh tokens rotados en cada uso
- [ ] Verificar `alg` en JWT (no aceptar `none`)
- [ ] Verificar `aud`, `iss`, `exp` en JWT

Ver `authentication.md`.

## A08:2021 — Software and Data Integrity Failures

**Qué es**: deserialización insegura, auto-updates sin verificación, CI/CD comprometido.

### Problemas
- Deserializar objetos Java de fuentes no confiables (RCE)
- npm/Maven sin verificación de integridad (typosquatting, supply chain)
- Webhooks sin verificar firma
- CDN comprometido sin SRI (Subresource Integrity)

### Cómo defenderse

```html
<!-- ✅ SRI para CDNs -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

```java
// ❌ MAL: deserialización Java de fuente externa
ObjectInputStream ois = new ObjectInputStream(input);
Object obj = ois.readObject();

// ✅ BIEN: usar JSON con tipos específicos
ObjectMapper mapper = new ObjectMapper();
mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
MyDto dto = mapper.readValue(input, MyDto.class);
```

**Checks**:
- [ ] No deserializar Java objects de fuentes externas
- [ ] SRI en scripts/styles desde CDN
- [ ] Verificar firmas de webhooks (HMAC-SHA256)
- [ ] Lockfiles + verificación de checksums en build
- [ ] CI/CD con secrets en vault, no en código
- [ ] Reviews obligatorios en PRs a main

## A09:2021 — Security Logging and Monitoring Failures

**Qué es**: falta de logs, alertas, o capacidad de detectar incidentes.

### Problemas
- No se loguean eventos de auth
- Logs sin información para forense (IP, user agent, timestamp)
- Logs con PII/secrets
- Sin alerting en patrones anómalos
- Retención insuficiente

### Cómo defenderse

Ver `logging-monitoring.md` para implementación completa.

**Checks**:
- [ ] Logs de eventos de seguridad (auth, autorización, cambios de rol)
- [ ] Formato estructurado (JSON con campos estándar)
- [ ] No se loguean passwords, tokens, datos sensibles
- [ ] Logs centralizados (no solo local)
- [ ] Alerting configurado (failed logins, 5xx spikes, unusual patterns)
- [ ] Retención según compliance (GDPR: hasta 6 meses; SOX: 7 años; HIPAA: 6 años)

## A10:2021 — Server-Side Request Forgery (SSRF)

**Qué es**: el servidor hace requests a URLs controladas por el atacante (puede acceder a metadata de cloud, redes internas, etc.).

### Problema típico

```java
// ❌ MAL: el usuario controla la URL completa
@PostMapping("/preview")
public String preview(@RequestParam String url) {
    return restClient.get().uri(url).retrieve().body(String.class);
}

// Atacante puede usar: http://169.254.169.254/latest/meta-data/ (AWS metadata)
```

### Cómo defenderse

```java
@PostMapping("/preview")
public String preview(@RequestParam String url) throws URISyntaxException {
    URI uri = new URI(url);

    // 1. Solo http/https
    if (!List.of("http", "https").contains(uri.getScheme())) {
        throw new BadRequestException("Invalid scheme");
    }

    // 2. Bloquear hosts internos
    InetAddress addr = InetAddress.getByName(uri.getHost());
    if (addr.isAnyLocalAddress() || addr.isLoopbackAddress() ||
        addr.isLinkLocalAddress() || addr.isSiteLocalAddress()) {
        throw new BadRequestException("Internal address not allowed");
    }

    // 3. Bloquear rangos privados (incluye AWS metadata 169.254.169.254)
    if (isPrivateRange(addr)) {
        throw new BadRequestException("Private network not allowed");
    }

    // 4. Allow-list de dominios si es posible
    if (!allowedDomains.contains(uri.getHost())) {
        throw new BadRequestException("Domain not allowed");
    }

    return restClient.get().uri(uri).retrieve().body(String.class);
}
```

**Checks**:
- [ ] No permitir URLs arbitrarias del usuario sin validación
- [ ] Allow-list de dominios si es viable
- [ ] Bloquear rangos privados/loopback/link-local
- [ ] Validar después de DNS resolution (DNS rebinding)
- [ ] Timeouts cortos en requests outbound
- [ ] No seguir redirects automáticamente (o validar el target del redirect)
- [ ] En cloud: bloquear acceso a metadata endpoints

## Quick check al revisar código

Por cada endpoint/controller:
1. ¿Está autenticado? (a menos que sea explícitamente público)
2. ¿Está autorizado? (RBAC + ownership check)
3. ¿Los inputs están validados? (tipo, longitud, formato, allow-list)
4. ¿Las queries son parametrizadas?
5. ¿Los outputs están escapados según contexto?
6. ¿Los errores no filtran información sensible?
7. ¿Se loguean eventos de seguridad relevantes?
8. ¿Hay rate limiting si es endpoint sensible?
