# Auditoría por Stack

Checks específicos según el stack del proyecto.

## Angular

### Vulnerabilidades comunes

#### 1. XSS por `innerHTML` o `bypassSecurityTrust*`

```typescript
// ❌ MAL
@Component({ template: '<div [innerHTML]="content"></div>' })
class CommentComponent {
  content = this.userInput; // peligroso si userInput viene del usuario
}

// ❌ PEOR — desactiva el sanitizador
this.content = this.sanitizer.bypassSecurityTrustHtml(userInput);

// ✅ BIEN — interpolación (Angular escapa automáticamente)
@Component({ template: '<div>{{ content }}</div>' })

// ✅ Si necesitas HTML, sanitiza explícitamente
import { DomSanitizer, SecurityContext } from '@angular/platform-browser';
const safe = this.sanitizer.sanitize(SecurityContext.HTML, html);
```

#### 2. Secrets/API keys en código cliente

```typescript
// ❌ MAL — el código del frontend es 100% público
export const environment = {
  apiKey: 'sk_live_abc123...',  // visible para cualquier usuario
  jwtSecret: 'mi-secret',       // jamás en el cliente
};

// ✅ BIEN — el frontend solo guarda configuración pública
export const environment = {
  apiUrl: 'https://api.example.com',
  publishableKey: 'pk_live_abc123...',  // claves "publishable" sí están OK (Stripe, etc.)
};
// Secrets reales se quedan en el backend, nunca van al cliente
```

#### 3. JWT en localStorage (vulnerable a XSS)

```typescript
// ❌ MAL — XSS roba el token
localStorage.setItem('jwt', token);

// ✅ BIEN — cookies HttpOnly seteadas por el backend
// El backend devuelve Set-Cookie: jwt=...; HttpOnly; Secure; SameSite=Strict
// El frontend no ve el token, pero las requests lo envían automáticamente
```

#### 4. Falta de CSP

Servir Angular con CSP estricta:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'
```

Angular >= 16 soporta `Trusted Types` para defensa adicional contra DOM XSS.

#### 5. Open redirect

```typescript
// ❌ MAL — atacante puede redirigir a sitio malicioso
this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl']);

// ✅ BIEN — valida que sea ruta interna
const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
if (returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
  this.router.navigateByUrl(returnUrl);
} else {
  this.router.navigateByUrl('/');
}
```

#### 6. Click-jacking

Header `X-Frame-Options: DENY` o CSP `frame-ancestors 'none'` en el servidor.

### Checklist Angular

- [ ] No hay `bypassSecurityTrust*` con datos del usuario
- [ ] No hay `[innerHTML]` con datos del usuario sin sanitización
- [ ] No hay secrets en `environment.ts`
- [ ] JWT en cookies HttpOnly, no localStorage
- [ ] CSP configurada en el servidor de origen
- [ ] HTTP interceptor agrega `Authorization` solo a dominios propios
- [ ] Guards en rutas protegidas + verificación también en el backend
- [ ] Validación de inputs en el formulario (pero re-validar en backend)
- [ ] `enableProdMode()` en producción
- [ ] No usar `eval()` ni `Function()` constructor
- [ ] CORS estricto en el backend (no `*` con credentials)

## Astro

### Vulnerabilidades comunes

#### 1. Secrets en client-side islands

```astro
---
// ❌ MAL — esto va al cliente si la island es client:load
const apiKey = import.meta.env.STRIPE_SECRET_KEY;
---
<MyIsland apiKey={apiKey} client:load />
```

Astro debería marcar errores en variables que no empiezan con `PUBLIC_`, pero verificar manualmente.

```typescript
// ✅ BIEN: solo PUBLIC_ va al cliente
const publishable = import.meta.env.PUBLIC_STRIPE_KEY; // OK

// Secretos solo en SSR
const secret = import.meta.env.STRIPE_SECRET_KEY; // solo se usa en .astro o API routes
```

#### 2. SSRF en SSR / API routes

```typescript
// ❌ MAL — en src/pages/api/preview.ts
export const POST: APIRoute = async ({ request }) => {
  const { url } = await request.json();
  const response = await fetch(url); // SSRF
  return new Response(await response.text());
};

// ✅ BIEN: validar URL
// ... mismas validaciones que en Spring SSRF (allow-list, bloquear privados)
```

#### 3. Inyección en endpoints API

```typescript
// ❌ MAL
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ BIEN: parámetros
const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

#### 4. Headers de seguridad

Configurar en `astro.config.mjs` o en el host (Vercel/Netlify/Cloudflare):

```typescript
// astro.config.mjs con adaptador Node
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    server: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    },
  },
});
```

En producción, configurar en el reverse proxy / CDN.

### Checklist Astro

- [ ] No hay `import.meta.env.X` sin prefijo `PUBLIC_` en islands `client:*`
- [ ] API routes validan inputs y autenticación
- [ ] CSP configurada (en headers del host o `<meta>`)
- [ ] HTTPS forzado (HSTS)
- [ ] No `fetch()` con URLs del usuario sin validación
- [ ] Queries parametrizadas en endpoints
- [ ] Errores no exponen stack traces en producción
- [ ] Si hay formularios con POST: validar `Origin`/`Referer` o CSRF token
- [ ] Imágenes con `astro:assets` (evita SSRF en transformaciones)

## Java / Spring Boot

### Vulnerabilidades comunes

#### 1. SQL Injection con string concat / JPQL

```java
// ❌ MAL
@Query("SELECT u FROM User u WHERE u.email = '" + email + "'")
// ✅ BIEN
@Query("SELECT u FROM User u WHERE u.email = :email")
List<User> find(@Param("email") String email);
```

#### 2. `permitAll()` accidental

```java
// ❌ MAL — anyRequest sin auth queda público
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/**").permitAll()
    // falta .anyRequest().authenticated()
);

// ✅ BIEN
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/**").permitAll()
    .anyRequest().authenticated()  // OBLIGATORIO al final
);
```

#### 3. CORS abierto con credentials

```java
// ❌ MAL — combinación inválida y peligrosa
config.setAllowedOrigins(List.of("*"));
config.setAllowCredentials(true);  // navegadores rechazan, pero pegando 'null' o reflejando origin = vulnerable

// ✅ BIEN
config.setAllowedOrigins(List.of("https://app.example.com"));
config.setAllowCredentials(true);
```

#### 4. Spring Actuator expuesto

```yaml
# ❌ MAL
management:
  endpoints:
    web:
      exposure:
        include: "*"  # NUNCA en prod

# ✅ BIEN
management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      show-details: when-authorized
```

#### 5. Deserialización insegura

```java
// ❌ MAL — RCE potencial
ObjectInputStream ois = new ObjectInputStream(input);
Object obj = ois.readObject();

// ✅ BIEN — JSON con tipos específicos
MyDto dto = objectMapper.readValue(json, MyDto.class);
```

#### 6. JWT mal configurado

```java
// ❌ MAL — aceptar alg: none
Jws<Claims> jws = Jwts.parser()
    .build()  // sin verificación de signing key
    .parseSignedClaims(token);

// ✅ BIEN — fijar algoritmo y verificar
SecretKey key = Keys.hmacShaKeyFor(secretBytes);
Jws<Claims> jws = Jwts.parser()
    .verifyWith(key)
    .build()
    .parseSignedClaims(token);

// ✅ MEJOR — validar también aud/iss/exp
```

#### 7. Mass assignment con entidad como `@RequestBody`

```java
// ❌ MAL — usuario puede enviar { "role": "ADMIN", "active": true }
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepo.save(user);
}

// ✅ BIEN — DTO específico sin campos sensibles
public record CreateUserRequest(@NotBlank @Email String email,
                                @NotBlank String name,
                                @NotBlank @Size(min=12) String password) {}

@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
    return userService.create(req);  // service decide role, active, etc.
}
```

#### 8. CSRF deshabilitado en apps con sesión

```java
// ✅ APIs stateless con JWT en Authorization header — CSRF disabled está OK
.csrf(AbstractHttpConfigurer::disable)

// ❌ MAL — Apps con sesión cookie deben tener CSRF habilitado
.csrf(AbstractHttpConfigurer::disable)  // si usas sesiones, esto es vulnerable

// ✅ Apps con sesión
.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
```

#### 9. Path traversal en file uploads/downloads

```java
// ❌ MAL
@GetMapping("/files/{name}")
public Resource download(@PathVariable String name) {
    return new FileSystemResource("/uploads/" + name);
    // atacante: GET /files/..%2F..%2Fetc%2Fpasswd
}

// ✅ BIEN
@GetMapping("/files/{name}")
public Resource download(@PathVariable String name) {
    Path base = Paths.get("/uploads").toAbsolutePath().normalize();
    Path requested = base.resolve(name).normalize();
    if (!requested.startsWith(base)) {
        throw new BadRequestException("Invalid path");
    }
    return new FileSystemResource(requested);
}
```

#### 10. XXE en parsers XML

```java
// ❌ MAL
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

// ✅ BIEN
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
factory.setXIncludeAware(false);
factory.setExpandEntityReferences(false);
```

### Checklist Spring Boot

- [ ] Todas las queries parametrizadas
- [ ] `.anyRequest().authenticated()` en SecurityConfig
- [ ] CORS con origins específicos
- [ ] Actuator restringido (`health, info` máximo público)
- [ ] No deserialización Java de fuentes externas
- [ ] JWT con `algorithm` fijo, verificación de `aud`/`iss`/`exp`
- [ ] DTOs separados de entities (no `@RequestBody Entity`)
- [ ] CSRF habilitado si hay sesiones; deshabilitado si stateless con JWT en header
- [ ] Path traversal mitigado en endpoints de archivos
- [ ] XML parsers configurados contra XXE
- [ ] `ddl-auto: validate` en producción
- [ ] No `show-sql: true` ni stack traces en producción
- [ ] BCrypt cost ≥ 12 o Argon2id
- [ ] Rate limiting en auth endpoints
- [ ] Locks de cuenta tras intentos fallidos
- [ ] Headers de seguridad (Spring Security añade algunos por defecto, completar con CSP)

## Node.js / Express (referencia, aunque no es tu stack principal)

### Checks comunes

- [ ] `helmet()` middleware para headers
- [ ] No `eval()`, `Function()`, ni `vm.runIn*` con input del usuario
- [ ] No `child_process.exec()` con input — usar `execFile()` con array de args
- [ ] No usar `dangerouslySetInnerHTML` en React sin sanitizar
- [ ] Validar con `zod`/`joi`/`express-validator`
- [ ] Queries con `pg`/`mysql2` parametrizadas (`$1`, `?`)
- [ ] Prototype pollution: no merge profundo de objetos del usuario
- [ ] Rate limiting (`express-rate-limit`)
- [ ] CORS configurado (`cors` middleware)
- [ ] JWT con `algorithms: ['HS256']` explícito (no `verify(token, secret)` sin opciones)
- [ ] `app.disable('x-powered-by')`
- [ ] No exponer stack traces en producción
- [ ] HTTPS en producción
- [ ] Cookies con `httpOnly`, `secure`, `sameSite`
- [ ] CSRF tokens si hay sesiones cookie

## Frameworks y stacks generales

Para cualquier stack, verificar:

- [ ] Dependencias auditadas (SCA tool en CI)
- [ ] Secrets en gestor, no en código
- [ ] HTTPS forzado
- [ ] Headers de seguridad
- [ ] Logging de eventos de seguridad
- [ ] Tests de seguridad (negativos: 401, 403, 400 esperados)
- [ ] Errores genéricos al usuario, detallados solo en logs internos
- [ ] Rate limiting en endpoints sensibles
- [ ] Backup y plan de recovery
- [ ] Política de retención de datos (compliance)
