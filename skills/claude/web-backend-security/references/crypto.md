# Criptografía

Patrones para encriptación at-rest, in-transit, hashing y gestión de keys.

## Regla de oro

**NO implementar crypto propia.** Usar librerías estándar (BouncyCastle, JCE, Tink) y algoritmos probados.

## Algoritmos recomendados (2025)

| Uso | Algoritmo recomendado | Evitar |
|---|---|---|
| Hashing passwords | argon2id, bcrypt (cost ≥ 12) | MD5, SHA1, SHA256/512 sin KDF |
| HMAC | HMAC-SHA256, HMAC-SHA3-256 | MD5, SHA1 |
| Encriptación simétrica | AES-256-GCM, ChaCha20-Poly1305 | DES, 3DES, AES-ECB, AES-CBC sin MAC |
| Encriptación asimétrica | RSA-OAEP 4096, ECDSA P-256+, Ed25519 | RSA-PKCS1v1.5, claves < 2048 bits |
| Firma | EdDSA (Ed25519), ECDSA P-256+ | DSA, RSA con SHA1 |
| Key exchange | ECDH (X25519, P-256+) | DH con claves chicas |
| TLS | TLS 1.3 (mínimo 1.2) | TLS 1.0, 1.1, SSLv3 |
| Random | `SecureRandom` (Java), `crypto.getRandomValues` (browser) | `Math.random()`, `Random` |

## Hashing (one-way)

### Para passwords

Ver `authentication.md`. Usar argon2id o bcrypt.

### Para integridad / comparación / lookup

Usar **SHA-256** o **SHA-3**. NO usar para passwords.

```java
String hash = DigestUtils.sha256Hex(input);

// Comparación de tokens (constant time, no leak por timing)
import java.security.MessageDigest;
boolean matches = MessageDigest.isEqual(hash1.getBytes(), hash2.getBytes());
```

### HMAC (con secret)

Para firmar payloads (webhooks, tokens):

```java
public String hmacSha256(String message, String secret) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    byte[] result = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(result);
}

// Verificación constant-time
public boolean verifyHmac(String message, String secret, String expectedHmac) throws Exception {
    String computed = hmacSha256(message, secret);
    return MessageDigest.isEqual(
        computed.getBytes(StandardCharsets.UTF_8),
        expectedHmac.getBytes(StandardCharsets.UTF_8)
    );
}
```

## Encriptación simétrica (AES-GCM)

Para encriptar datos sensibles antes de guardar en DB.

```java
@Service
public class CryptoService {

    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;  // 96 bits para GCM

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public CryptoService(@Value("${app.encryption.key}") String base64Key) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        if (keyBytes.length != 32) {
            throw new IllegalStateException("Key must be 256 bits");
        }
        this.key = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plaintext) throws Exception {
        byte[] iv = new byte[IV_LENGTH];
        random.nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        // [iv (12 bytes)][ciphertext + tag]
        byte[] result = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(ciphertext, 0, result, iv.length, ciphertext.length);

        return Base64.getEncoder().encodeToString(result);
    }

    public String decrypt(String encrypted) throws Exception {
        byte[] data = Base64.getDecoder().decode(encrypted);
        byte[] iv = Arrays.copyOfRange(data, 0, IV_LENGTH);
        byte[] ciphertext = Arrays.copyOfRange(data, IV_LENGTH, data.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] plaintext = cipher.doFinal(ciphertext);
        return new String(plaintext, StandardCharsets.UTF_8);
    }
}
```

**Reglas críticas**:
- ✅ **IV único por encriptación** (nunca reutilizar con misma key)
- ✅ Tag de autenticación incluido (GCM lo hace automáticamente)
- ✅ Key de 256 bits desde fuente segura (Secret Manager, no en código)
- ❌ NO usar AES-ECB
- ❌ NO usar AES-CBC sin MAC

### Field-level encryption con JPA Converter

```java
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Autowired
    private CryptoService cryptoService;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            return cryptoService.encrypt(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return cryptoService.decrypt(dbData);
        } catch (Exception e) {
            throw new IllegalStateException("Decryption failed", e);
        }
    }
}

@Entity
public class Patient {
    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")  // ciphertext es más largo
    private String medicalRecord;

    @Convert(converter = EncryptedStringConverter.class)
    private String ssn;
}
```

⚠️ Trade-off: si encriptas un campo, no puedes hacer `WHERE` ni `LIKE` sobre él. Para búsquedas: usar hash determinístico separado para lookup (más débil pero permite búsqueda exacta).

## Encriptación de columnas en DB nativo

Algunas DBs soportan encriptación transparente:
- **PostgreSQL**: `pgcrypto` extension, o TDE en versiones enterprise
- **MySQL/MariaDB**: `AES_ENCRYPT`/`AES_DECRYPT`, TDE
- **AWS RDS**: encryption at rest a nivel de storage (KMS)

Para datos especialmente sensibles, **doble encriptación**: app-level + DB at-rest.

## Key Management

### Donde guardar las keys

| Entorno | Solución |
|---|---|
| **Producción cloud** | AWS KMS, Google Cloud KMS, Azure Key Vault, HashiCorp Vault |
| **Producción on-prem** | HashiCorp Vault, HSM |
| **Desarrollo** | `.env` local (no commiteado) |
| **CI** | Secrets del CI provider (GitHub Actions secrets, GitLab CI variables) |

**NUNCA**:
- Keys en código fuente
- Keys en `application.yml` commiteado
- Keys en logs
- Keys en variables de entorno de imágenes Docker públicas
- Reutilizar keys entre entornos (dev/staging/prod)

### Rotación de keys

```java
// Soporte para múltiples keys (rotación sin downtime)
@Service
public class RotatingCryptoService {

    private final Map<String, SecretKey> keys;  // versionId -> key
    private final String currentVersion;

    public String encrypt(String plaintext) {
        // ... usa current version
        // Output: "v3:base64encoded"
    }

    public String decrypt(String encrypted) {
        String[] parts = encrypted.split(":", 2);
        String version = parts[0];
        SecretKey key = keys.get(version);
        if (key == null) {
            throw new IllegalStateException("Unknown key version: " + version);
        }
        // ... decrypt con esa key
    }
}
```

Proceso de rotación:
1. Generar nueva key (versión N+1)
2. Configurar service con keys N y N+1
3. Nueva encriptación usa N+1, decryption busca por versión
4. Job en background re-encripta datos existentes (lazy o batch)
5. Cuando no quedan datos con key N, retirarla

### Envelope encryption

Patrón estándar en cloud:
1. **DEK** (Data Encryption Key) — encripta los datos. Una por usuario/recurso/tenant.
2. **KEK** (Key Encryption Key) — encripta las DEK. Guardada en KMS.

Ventajas:
- Rotar KEK = re-encriptar solo DEKs (rápido), no todos los datos
- DEK por tenant: aislamiento criptográfico

```
KMS (KEK)
  └─ encripta DEK
      └─ encripta data
```

## TLS / HTTPS

### Configuración recomendada

- **TLS 1.3 preferido**, 1.2 mínimo
- **Cipher suites fuertes** (con forward secrecy):
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_CHACHA20_POLY1305_SHA256`
  - `TLS_AES_128_GCM_SHA256`
- **Deshabilitar**: TLS 1.0, 1.1, SSLv2/3, ciphers con RC4, DES, NULL, EXPORT, anonymous

### Nginx

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
ssl_dhparam /etc/nginx/dhparam.pem;  # 2048+ bits
```

### Spring Boot embedded

```yaml
server:
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    enabled-protocols: TLSv1.3,TLSv1.2
    ciphers:
      - TLS_AES_256_GCM_SHA384
      - TLS_CHACHA20_POLY1305_SHA256
      - TLS_AES_128_GCM_SHA256
      - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
      # ...
```

### Verificar configuración TLS

```bash
# SSL Labs (público)
https://www.ssllabs.com/ssltest/

# testssl.sh (local)
testssl.sh app.example.com
```

Meta: **A+ rating** en SSL Labs.

### Certificados

- **Let's Encrypt** (gratis, auto-renovable) para sitios públicos
- **Certificados internos**: CA propia para servicios internos (mTLS)
- **Renovación automática**: cron con certbot o ACME client
- **Monitoring**: alertar si certificado expira en < 30 días

## mTLS (Mutual TLS)

Para autenticación servicio-a-servicio. Cliente también presenta certificado.

```yaml
server:
  ssl:
    client-auth: need  # o want
    trust-store: classpath:truststore.p12
    trust-store-password: ${TRUSTSTORE_PASSWORD}
```

Validar el subject DN del certificado del cliente:
```java
@GetMapping("/api/internal/something")
public String secret(HttpServletRequest request) {
    X509Certificate[] certs = (X509Certificate[]) request.getAttribute("javax.servlet.request.X509Certificate");
    if (certs == null || certs.length == 0) {
        throw new UnauthorizedException();
    }
    String dn = certs[0].getSubjectX500Principal().getName();
    if (!allowedDns.contains(dn)) {
        throw new ForbiddenException();
    }
    return "ok";
}
```

## Random / Tokens seguros

```java
// ✅ Generación de tokens
SecureRandom random = new SecureRandom();
byte[] token = new byte[32];  // 256 bits
random.nextBytes(token);
String tokenString = Base64.getUrlEncoder().withoutPadding().encodeToString(token);

// ❌ MAL
new Random().nextLong();  // predecible
UUID.randomUUID();  // no es criptográficamente seguro para tokens, solo para IDs únicos
Math.random();  // pésimo
```

UUID v4 está bien para identificadores únicos pero **NO** para tokens de seguridad (auth tokens, password reset tokens). Para esos, usar `SecureRandom` con 256 bits.

## Comparación constant-time

Para evitar timing attacks al comparar tokens/secrets:

```java
// ❌ MAL — comparación corta circuita
if (token.equals(expected)) { ... }

// ✅ BIEN
MessageDigest.isEqual(
    token.getBytes(StandardCharsets.UTF_8),
    expected.getBytes(StandardCharsets.UTF_8)
);
```

## Anti-patterns

- ❌ "Encryption" custom con XOR, base64, o algoritmos propios
- ❌ AES-ECB (mismo plaintext → mismo ciphertext)
- ❌ AES-CBC sin HMAC (manipulación sin detección)
- ❌ IV/nonce predecibles o reusados
- ❌ Keys derivadas de passwords sin KDF (PBKDF2 / scrypt / argon2)
- ❌ Keys en código, en `application.yml`, en imágenes Docker
- ❌ TLS 1.0/1.1 habilitados
- ❌ Self-signed certs en producción
- ❌ Pinning de certificados públicos (rompe ante renovación legítima)
- ❌ Tokens generados con `Math.random()` o `Random`
- ❌ Comparación de tokens con `==` o `.equals()`
- ❌ Loggear o exponer secrets en errores

## Checklist crypto

- [ ] Passwords con argon2id o bcrypt cost ≥ 12
- [ ] Datos sensibles en DB encriptados (AES-256-GCM)
- [ ] Keys en KMS / Vault, no en código
- [ ] Rotación de keys planificada (90 días o según política)
- [ ] TLS 1.2+ (preferir 1.3) en toda comunicación
- [ ] Certificados con renovación automática
- [ ] Cipher suites fuertes (con forward secrecy)
- [ ] HSTS habilitado
- [ ] mTLS para comunicación interna entre servicios sensibles
- [ ] Tokens generados con `SecureRandom` (256 bits)
- [ ] Comparaciones de secrets constant-time
- [ ] No hay crypto custom
- [ ] SSL Labs rating A+ en endpoints públicos
