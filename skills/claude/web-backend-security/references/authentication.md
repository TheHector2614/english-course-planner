# Autenticación Segura

Patrones para passwords, MFA, JWT, sessions y OAuth/OIDC.

## Passwords

### Hashing

**Algoritmos recomendados** (en orden de preferencia):

1. **Argon2id** — ganador del Password Hashing Competition. Resistente a ataques GPU y ASIC.
2. **bcrypt** — maduro, ampliamente soportado, cost ≥ 12
3. **scrypt** — alternativa válida

**NO usar**: MD5, SHA1, SHA256/512 sin key-stretching, PBKDF2 con pocas iteraciones.

```java
// Argon2id (preferido)
PasswordEncoder encoder = new Argon2PasswordEncoder(
    16,    // salt length (bytes)
    32,    // hash length (bytes)
    1,     // parallelism
    65536, // memory in KiB (64 MB)
    3      // iterations
);

// bcrypt
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
```

### Política de passwords

OWASP / NIST 800-63B recomienda:
- **Mínimo 12 caracteres** (NIST permite 8, pero 12 es mejor)
- **Sin requisitos de complejidad arbitrarios** (mayúsculas, números, símbolos no aumentan tanto la entropía)
- **Sí verificar contra listas de breaches** (Have I Been Pwned API, k-anonymity)
- **Sin expiración forzada** (NIST cambió esta recomendación)
- **Permitir hasta 64+ caracteres**, todos los caracteres (incluyendo espacios)
- **Bloquear passwords comunes**: "password123", "qwerty", etc.

Implementación:
```java
@Service
public class PasswordPolicy {

    public void validate(String password) {
        if (password.length() < 12) {
            throw new BusinessException("Password must be at least 12 characters");
        }
        if (password.length() > 128) {
            throw new BusinessException("Password too long");
        }
        if (commonPasswords.contains(password.toLowerCase())) {
            throw new BusinessException("Password is too common");
        }
        if (isInBreachDatabase(password)) {  // HIBP k-anonymity API
            throw new BusinessException("Password found in data breach");
        }
    }

    private boolean isInBreachDatabase(String password) {
        // SHA-1 del password, enviar primeros 5 chars del hash a HIBP
        // Respuesta: lista de sufijos. Si el sufijo del nuestro está, es breached.
        // Detalles: https://haveibeenpwned.com/API/v3#PwnedPasswords
        String sha1 = DigestUtils.sha1Hex(password).toUpperCase();
        String prefix = sha1.substring(0, 5);
        String suffix = sha1.substring(5);
        String response = restClient.get()
            .uri("https://api.pwnedpasswords.com/range/{prefix}", prefix)
            .retrieve()
            .body(String.class);
        return response.lines().anyMatch(line -> line.startsWith(suffix + ":"));
    }
}
```

### Reset de password

```
1. Usuario solicita reset enviando su email
2. Sistema responde SIEMPRE 200 OK (no revelar si el email existe)
3. Si el email existe: generar token aleatorio (32 bytes, base64url)
4. Guardar en DB: { user_id, token_hash (SHA-256), expires_at (15 min), used: false }
5. Enviar email con link: https://app.example.com/reset?token=<token>
6. Usuario abre link y pone nuevo password
7. Sistema verifica token (hash, no expirado, no usado)
8. Si OK: actualizar password, marcar token como used, invalidar otras sesiones
9. Notificar por email al usuario que cambió su password
```

Reglas:
- Token de un solo uso
- Expiración corta (15 min)
- Token guardado hasheado en DB (no en plain)
- Invalidar otras sesiones después del cambio
- Notificar al email original (no al nuevo si lo cambiaron también)
- Rate limiting en el endpoint de solicitud

### Endpoints sensibles: protección

| Endpoint | Rate limit | Otros controles |
|---|---|---|
| `/login` | 5-10 / minuto / IP | Lockout tras 5-10 fallos |
| `/register` | 3-5 / hora / IP | CAPTCHA en alto volumen |
| `/password-reset` | 3 / hora / email | Token de un solo uso, expira en 15 min |
| `/mfa/verify` | 5 / minuto / user | Lockout tras fallos |
| `/2fa/setup` | autenticado obligatorio | Re-authenticate antes de cambiar |

## MFA (Multi-Factor Authentication)

### Orden de preferencia

1. **WebAuthn / Passkeys** (FIDO2) — el más seguro, resistente a phishing
2. **TOTP** (Google Authenticator, Authy, RFC 6238) — bueno, simple
3. **Push notifications** (con biometría en el dispositivo) — bueno
4. ~~SMS~~ — vulnerable a SIM swapping, NO recomendado salvo último recurso
5. ~~Security questions~~ — terrible (información pública o adivinable)

### TOTP (más común)

```xml
<dependency>
    <groupId>dev.samstevens.totp</groupId>
    <artifactId>totp</artifactId>
    <version>1.7.1</version>
</dependency>
```

```java
@Service
public class TotpService {

    private final SecretGenerator secretGen = new DefaultSecretGenerator();
    private final QrGenerator qrGen = new ZxingPngQrGenerator();
    private final CodeVerifier verifier = new DefaultCodeVerifier(
        new DefaultCodeGenerator(),
        new SystemTimeProvider()
    );

    public String generateSecret() {
        return secretGen.generate(); // base32
    }

    public String generateQrUri(String secret, String userEmail) throws QrGenerationException {
        QrData data = new QrData.Builder()
            .label(userEmail)
            .secret(secret)
            .issuer("MyApp")
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();
        byte[] image = qrGen.generate(data);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(image);
    }

    public boolean verify(String secret, String code) {
        return verifier.isValidCode(secret, code);
    }
}
```

**Flujo de activación**:
1. Usuario solicita habilitar MFA
2. Backend genera secret, devuelve QR code
3. Usuario escanea con su app y envía un primer código
4. Backend verifica → si OK, guarda secret cifrado en DB
5. Generar 10 códigos de respaldo (one-time, hash en DB)
6. Notificar por email

**Flujo de verificación**:
1. Usuario hace login (email + password)
2. Si MFA habilitado: backend responde con `mfa_required: true` + token temporal de 5 min
3. Usuario envía código TOTP + token temporal
4. Backend verifica → emite tokens de sesión

### WebAuthn / Passkeys

Para mayor seguridad (resistente a phishing). Spring Security 6.4+ soporta WebAuthn nativamente.

```java
http.webAuthn(webAuthn -> webAuthn
    .rpName("My App")
    .rpId("example.com")
    .allowedOrigins("https://app.example.com")
);
```

## JWT seguro

### Estructura recomendada

**Access token** (corto, en memoria/cookie):
```json
{
  "iss": "https://api.example.com",
  "sub": "user-uuid-aqui",
  "aud": ["https://api.example.com"],
  "exp": 1234567890,
  "iat": 1234567000,
  "jti": "uuid-del-token",
  "scope": "read write",
  "roles": ["user"]
}
```

**Refresh token** (largo, en DB con revocación).

### Generación

```java
@Service
public class JwtService {

    private final SecretKey accessKey;
    private final long accessExpMs = TimeUnit.MINUTES.toMillis(15);
    private final long refreshExpMs = TimeUnit.DAYS.toMillis(30);

    public JwtService(@Value("${jwt.secret}") String secret) {
        // Secret de 256 bits mínimo
        this.accessKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateAccessToken(UserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .issuer("https://api.example.com")
            .subject(user.getUsername())
            .audience().add("https://api.example.com").and()
            .id(UUID.randomUUID().toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(accessExpMs)))
            .claim("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList())
            .signWith(accessKey, Jwts.SIG.HS256)
            .compact();
    }
}
```

### Verificación

```java
public Optional<Claims> validate(String token) {
    try {
        Claims claims = Jwts.parser()
            .verifyWith(accessKey)
            .requireIssuer("https://api.example.com")
            .requireAudience("https://api.example.com")
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return Optional.of(claims);
    } catch (JwtException e) {
        // Logging: token inválido, no levantar excepción aquí
        return Optional.empty();
    }
}
```

### Algoritmos

| Algoritmo | Cuándo usar |
|---|---|
| **HS256** | Apps monolíticas o pocos servicios. Secret simétrico compartido. |
| **RS256** / **ES256** | Microservicios. Provider firma con private key; consumers verifican con public key. |
| **EdDSA** (Ed25519) | Moderno, rápido, seguro. Soportado en jjwt 0.12+. |
| ~~none~~ | NUNCA. Vulnerabilidad clásica si el parser lo acepta. |

### Errores a evitar

```java
// ❌ MAL — no validar algoritmo (acepta "none")
Claims c = Jwts.parser().build().parseSignedClaims(token).getPayload();

// ❌ MAL — almacenar JWT en localStorage (vulnerable a XSS)
localStorage.setItem('token', accessToken);

// ❌ MAL — refresh token sin revocación en DB
// Si lo robaron, no se puede invalidar hasta que expire

// ❌ MAL — sin claim de aud, mismo token vale para múltiples APIs
// si una API es comprometida, el atacante puede usarlo en otras

// ❌ MAL — exp largo (días/meses) en access token

// ✅ BIEN — refresh token rotation: cada uso emite uno nuevo y revoca el anterior
```

### Refresh token rotation

```java
@Entity
public class RefreshToken {
    @Id @GeneratedValue
    private Long id;
    private String tokenHash;       // SHA-256 del token, no en plain
    private String userEmail;
    private Instant expiresAt;
    private Instant revokedAt;
    private String replacedByTokenHash;  // si fue rotado
    private String ipAddress;
    private String userAgent;
}

@Transactional
public AuthResponse refresh(String refreshToken) {
    String hash = sha256(refreshToken);
    RefreshToken stored = refreshRepo.findByTokenHash(hash)
        .orElseThrow(() -> new UnauthorizedException("Invalid token"));

    if (stored.getRevokedAt() != null) {
        // ⚠️ token revocado pero alguien lo está intentando usar
        // Posible robo: revocar TODA la familia de tokens
        revokeAllTokensForUser(stored.getUserEmail());
        securityLog.warn("Refresh token reuse detected for {}", stored.getUserEmail());
        throw new UnauthorizedException("Token compromised");
    }

    if (stored.getExpiresAt().isBefore(Instant.now())) {
        throw new UnauthorizedException("Token expired");
    }

    // Rotar
    stored.setRevokedAt(Instant.now());
    String newRefresh = generateRefreshToken();
    RefreshToken newStored = saveNew(newRefresh, stored.getUserEmail());
    stored.setReplacedByTokenHash(newStored.getTokenHash());

    String accessToken = jwtService.generateAccessToken(...);
    return new AuthResponse(accessToken, newRefresh, ...);
}
```

## Sessions (cookies)

Si usas sesiones con cookies en lugar de JWT (común en apps server-rendered):

```java
http.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    .maximumSessions(3)
    .maxSessionsPreventsLogin(false)  // o true según preferencia
    .sessionRegistry(sessionRegistry())
);
```

```yaml
server:
  servlet:
    session:
      timeout: 30m
      cookie:
        http-only: true
        secure: true        # solo HTTPS
        same-site: strict   # CSRF protection
        name: SESSION
```

**Regenerar session ID** después de login (prevenir session fixation). Spring Security lo hace por defecto.

## OAuth2 / OIDC con proveedores externos

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
```

**Validaciones que el server hace por defecto** (con `spring-boot-starter-oauth2-resource-server`):
- ✅ Firma JWT
- ✅ `exp` (no expirado)
- ✅ `iss` (issuer correcto)
- ⚠️ `aud` — validar manualmente si el provider no lo hace

### State y PKCE

Spring Security 6 usa PKCE automáticamente en clientes públicos. Para apps confidenciales, también recomendado.

### Validar el token de Auth0 / Okta

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://your-tenant.auth0.com/
          audiences:
            - https://api.example.com
```

## Account lockout y rate limiting

```java
@Entity
public class LoginAttempt {
    @Id @GeneratedValue
    private Long id;
    private String email;
    private String ipAddress;
    private Instant attemptedAt;
    private boolean successful;
}

@Service
public class LoginThrottleService {

    private static final int MAX_FAILURES = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);

    public void recordAttempt(String email, String ip, boolean success) {
        loginAttemptRepo.save(new LoginAttempt(email, ip, Instant.now(), success));
    }

    public boolean isLockedOut(String email) {
        Instant cutoff = Instant.now().minus(LOCKOUT_DURATION);
        long failures = loginAttemptRepo.countByEmailAndAttemptedAtAfterAndSuccessfulFalse(email, cutoff);
        return failures >= MAX_FAILURES;
    }
}
```

Alternativa: contador en cache (Redis) con TTL automático.

## Logging de eventos de autenticación

Logueá siempre estos eventos como `SECURITY_AUDIT`:

```java
securityLogger.info("AUTH_LOGIN_SUCCESS user={} ip={} ua={}",
    email, ipAddress, userAgent);
securityLogger.warn("AUTH_LOGIN_FAILURE email={} ip={} reason={}",
    email, ipAddress, reason);
securityLogger.warn("AUTH_LOCKOUT email={} ip={}", email, ip);
securityLogger.info("AUTH_LOGOUT user={}", email);
securityLogger.info("AUTH_PASSWORD_CHANGED user={}", email);
securityLogger.info("AUTH_PASSWORD_RESET_REQUESTED email={}", email);
securityLogger.info("AUTH_MFA_ENABLED user={}", email);
securityLogger.info("AUTH_MFA_VERIFY_SUCCESS user={}", email);
securityLogger.warn("AUTH_MFA_VERIFY_FAILURE user={}", email);
securityLogger.info("AUTH_REFRESH_TOKEN_USED user={} jti={}", email, jti);
securityLogger.warn("AUTH_REFRESH_TOKEN_REUSE_DETECTED user={}", email);
```

Ver `logging-monitoring.md` para formato JSON estructurado.

## Checklist final de autenticación

- [ ] Passwords hasheadas con argon2id o bcrypt cost ≥ 12
- [ ] Política de password (longitud, breach check)
- [ ] Rate limiting en login, register, reset
- [ ] Account lockout tras N intentos fallidos
- [ ] MFA disponible (TOTP/WebAuthn, no SMS)
- [ ] JWT access token corto (5-15 min)
- [ ] JWT con `iss`, `aud`, `exp` validados
- [ ] Refresh tokens en DB, hasheados, con rotación y revocación
- [ ] Cookies HttpOnly + Secure + SameSite=Strict si se usan
- [ ] Session ID regenerado tras login
- [ ] Reset password: token único, hasheado, expira en 15 min
- [ ] Notificación por email en eventos sensibles (cambio de password, MFA setup, nuevo dispositivo)
- [ ] Logout invalida tokens del lado servidor
- [ ] Logging de eventos de auth
- [ ] Test de account enumeration (mismas respuestas para email existente / no existente)
- [ ] Tests negativos: 401, 403, 429 cuando corresponde
