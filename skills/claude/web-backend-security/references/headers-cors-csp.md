# Headers de Seguridad, CORS y CSP

## Headers HTTP defensivos

### Strict-Transport-Security (HSTS)

Fuerza HTTPS en navegadores que ya visitaron el sitio.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- `max-age=63072000`: 2 años
- `includeSubDomains`: aplica a `*.example.com`
- `preload`: para incluir en la HSTS preload list (https://hstspreload.org/)

⚠️ Antes de `preload`, verificar que todos los subdominios funcionan con HTTPS.

### X-Content-Type-Options

Evita MIME sniffing.

```
X-Content-Type-Options: nosniff
```

### X-Frame-Options

Previene click-jacking. Redundante con CSP `frame-ancestors` pero recomendado por compatibilidad.

```
X-Frame-Options: DENY
```

(o `SAMEORIGIN` si necesitas iframes de tu propio dominio).

### Referrer-Policy

Controla qué referrer se envía a otros sitios.

```
Referrer-Policy: strict-origin-when-cross-origin
```

Recomendaciones por sensibilidad:
- App pública: `strict-origin-when-cross-origin`
- App con datos sensibles: `no-referrer`

### Permissions-Policy (antes Feature-Policy)

Desactiva APIs del navegador no necesarias.

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()
```

Si necesitas una feature, allowlist específica:
```
Permissions-Policy: camera=(self), geolocation=(self "https://maps.example.com")
```

### Cross-Origin-Opener-Policy (COOP)

Aísla la ventana de orígenes cross-domain (defensa contra Spectre).

```
Cross-Origin-Opener-Policy: same-origin
```

### Cross-Origin-Embedder-Policy (COEP)

Requiere CORP/CORS en recursos cargados. Necesario para `SharedArrayBuffer` y mediciones precisas.

```
Cross-Origin-Embedder-Policy: require-corp
```

⚠️ Puede romper recursos third-party sin CORS adecuado. Usar `credentialless` como alternativa más laxa.

### Cross-Origin-Resource-Policy (CORP)

Indica quién puede embeber el recurso.

```
Cross-Origin-Resource-Policy: same-origin
```

### Cache-Control para datos sensibles

```
Cache-Control: no-store, max-age=0
Pragma: no-cache
```

En endpoints que devuelven info sensible (cuentas, pagos, médico).

## Implementación por stack

### Spring Boot

Spring Security añade muchos por defecto. Para CSP y completar:

```java
@Bean
public SecurityFilterChain filter(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp.policyDirectives(
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' https://api.example.com; " +
                "frame-ancestors 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self'"
            ))
            .httpStrictTransportSecurity(hsts -> hsts
                .includeSubDomains(true)
                .maxAgeInSeconds(63072000)
                .preload(true)
            )
            .referrerPolicy(referrer -> referrer.policy(
                ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            .permissionsPolicy(permissions -> permissions.policy(
                "camera=(), microphone=(), geolocation=(), payment=()"))
            .crossOriginOpenerPolicy(coop -> coop.policy(
                CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy.SAME_ORIGIN))
            .crossOriginEmbedderPolicy(coep -> coep.policy(
                CrossOriginEmbedderPolicyHeaderWriter.CrossOriginEmbedderPolicy.REQUIRE_CORP))
            .frameOptions(frame -> frame.deny())
            .contentTypeOptions(Customizer.withDefaults())
        );
    return http.build();
}
```

### Nginx (reverse proxy delante de la app)

```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    # TLS
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;

    location / {
        proxy_pass http://backend;
    }
}
```

### Express (Node)

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
}));
```

## Content Security Policy (CSP) en detalle

CSP es la **defensa principal contra XSS**. Define qué fuentes son permitidas para cada tipo de recurso.

### Directivas más usadas

```
default-src 'self'              ← fallback para todo
script-src 'self'               ← JS permitido solo del mismo origen
style-src 'self' 'unsafe-inline' ← CSS (inline-style común con Tailwind, frameworks UI)
img-src 'self' data: https:     ← imágenes propias, data URIs, cualquier HTTPS
font-src 'self' data:           ← fuentes propias o data URIs
connect-src 'self' https://api.example.com  ← fetch/XHR/WebSocket
media-src 'self'                ← audio/video
object-src 'none'               ← <object>, <embed>, <applet> (deprecados, mejor bloquearlos)
frame-src 'none'                ← iframes
frame-ancestors 'none'          ← quién puede embeber este sitio (reemplaza X-Frame-Options)
form-action 'self'              ← destino de los <form>
base-uri 'self'                 ← <base> tag, prevenir hijacking de URLs relativas
upgrade-insecure-requests       ← reescribir http:// a https://
```

### Inline scripts y nonces

Lo más seguro es **no usar inline scripts**. Si es inevitable (algunos frameworks, analytics inline), usar nonce o hash:

```html
<script nonce="random-per-request-XYZ123">
  // este script se ejecuta
</script>
```

```
Content-Security-Policy: script-src 'self' 'nonce-XYZ123'
```

⚠️ El nonce debe ser **único por request** (no global, no cacheable).

Spring Boot:
```java
.contentSecurityPolicy(csp -> csp.policyDirectives(
    "script-src 'self' 'nonce-{nonce}'"))
```

Y generar el nonce en el filtro de request, exponerlo al template.

### Reporting

Recibir reportes de violaciones (útil para detectar XSS intentado):

```
Content-Security-Policy: default-src 'self'; report-to csp-endpoint
Reporting-Endpoints: csp-endpoint="https://example.com/csp-report"
```

Endpoint que recibe JSON:
```java
@PostMapping(value = "/csp-report", consumes = "application/csp-report")
public ResponseEntity<Void> report(@RequestBody CspReport report) {
    securityLogger.warn("CSP violation: {}", report);
    return ResponseEntity.noContent().build();
}
```

### CSP en modo report-only (testing)

```
Content-Security-Policy-Report-Only: default-src 'self'; report-to csp-endpoint
```

No bloquea nada, solo reporta. Útil para probar una política antes de activarla.

### CSP estricta (recomendada)

Para apps nuevas, OWASP recomienda CSP basada en nonces sin `'unsafe-inline'`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-RANDOM' 'strict-dynamic';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
```

`'strict-dynamic'`: permite que scripts cargados con nonce carguen otros scripts. Más flexible que enumerar dominios.

## CORS

CORS no es un mecanismo de seguridad **para tu servidor** — es un mecanismo de protección **del navegador**. Configurarlo correctamente igual:

### Configuración segura

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    // ✅ Origens específicos (nunca *)
    config.setAllowedOrigins(List.of(
        "https://app.example.com",
        "https://admin.example.com"
    ));

    // ✅ Métodos específicos
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

    // ✅ Headers permitidos
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

    // ✅ Headers expuestos al cliente
    config.setExposedHeaders(List.of("X-Total-Count", "X-Page-Number"));

    // ⚠️ Credentials: solo si necesario, NUNCA con allowedOrigins("*")
    config.setAllowCredentials(true);

    // Cache de preflight
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

### Errores comunes

```java
// ❌ MAL — refleja cualquier origin
String origin = request.getHeader("Origin");
response.setHeader("Access-Control-Allow-Origin", origin);

// ❌ MAL — wildcard con credentials
config.setAllowedOrigins(List.of("*"));
config.setAllowCredentials(true);

// ❌ MAL — null origin permitido (sandboxed iframes pueden mandar null)
config.setAllowedOrigins(List.of("https://example.com", "null"));

// ❌ MAL — subdomain wildcard sin pensar
config.setAllowedOriginPatterns(List.of("https://*.example.com"));
// si alguien controla un subdomain (e.g., user-content.example.com), puede atacar la API

// ✅ BIEN — solo lo necesario
config.setAllowedOrigins(List.of("https://app.example.com"));
```

### CORS para APIs públicas (sin credentials)

```java
config.setAllowedOrigins(List.of("*"));
config.setAllowCredentials(false);  // OBLIGATORIO con origins=*
```

Solo si la API es genuinamente pública (read-only) y no usa cookies/auth headers cross-origin.

## Testing de headers

### Herramientas

```bash
# Verificar headers
curl -I https://app.example.com

# Análisis completo
# https://securityheaders.com
# https://observatory.mozilla.org

# CSP evaluator
# https://csp-evaluator.withgoogle.com
```

### Test programático

```java
@WebMvcTest
class SecurityHeadersTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void shouldHaveSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/v1/public/health"))
            .andExpect(header().exists("Strict-Transport-Security"))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().exists("Content-Security-Policy"))
            .andExpect(header().exists("Referrer-Policy"));
    }
}
```
