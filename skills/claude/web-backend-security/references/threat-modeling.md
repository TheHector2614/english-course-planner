# Threat Modeling

Identificar amenazas sistemáticamente antes de construir. Usar STRIDE como framework principal.

## Cuándo hacer threat modeling

- **Nuevo proyecto**: durante el diseño inicial
- **Nueva feature crítica**: auth, pagos, manejo de datos sensibles
- **Cambio de arquitectura**: migración de monolito a microservicios, etc.
- **Periódicamente**: cada 6-12 meses como revisión

## El proceso en 4 pasos

### Paso 1: Decompose — qué construimos

Crear un **Data Flow Diagram (DFD)** simple:

- **Entities externas** (cuadrados): usuarios, otros sistemas, atacantes
- **Procesos** (círculos): tus servicios, controllers, jobs
- **Data stores** (líneas paralelas): DB, S3, cache, file system
- **Data flows** (flechas): cada flujo de datos entre los anteriores
- **Trust boundaries** (líneas punteadas): donde cambia el nivel de confianza (internet → DMZ → red interna → DB)

Para diagramas, usar `Figma:generate_diagram` o cualquier herramienta.

Ejemplo (DFD simple de un e-commerce):

```
[Cliente] --HTTPS--> {CDN} --> {API Gateway} ==trust boundary==> {Auth Service} --> [(Users DB)]
                                  |
                                  v
                              {Order Service} --> [(Orders DB)]
                                  |
                                  v ==trust boundary==> [Payment Provider (Stripe)]
```

### Paso 2: Identificar amenazas con STRIDE

STRIDE: 6 categorías de amenazas. Aplicar cada una a cada elemento del DFD.

| Letra | Amenaza | Propiedad afectada | Ejemplos |
|---|---|---|---|
| **S** | Spoofing | Authentication | Suplantación de identidad: phishing, password stuffing, session hijack, JWT robado |
| **T** | Tampering | Integrity | Modificación: alterar request en tránsito, SQL Injection que modifica DB, manipular precio en checkout |
| **R** | Repudiation | Non-repudiation | Negar haber hecho algo: usuario niega haber comprado, sin logs para probarlo |
| **I** | Information Disclosure | Confidentiality | Exposición: SQLi que extrae datos, logs con secrets, IDOR, error verbose, S3 público |
| **D** | Denial of Service | Availability | DoS: rate limit ausente, queries pesadas sin protección, recursos no limitados |
| **E** | Elevation of Privilege | Authorization | Escalación: user pasa a admin, bypass de RBAC, deserialización RCE |

### Paso 3: Por cada amenaza, identificar mitigación

Para cada amenaza, decidir:
- **Mitigar** (implementar control)
- **Eliminar** (rediseñar para que no aplique)
- **Transferir** (Stripe maneja PCI por nosotros)
- **Aceptar** (riesgo bajo, costo de mitigación alto)

### Paso 4: Verificar y priorizar

Para cada amenaza calcular **riesgo = probabilidad × impacto**, usar matriz simple:

| | Impacto bajo | Impacto medio | Impacto alto | Impacto crítico |
|---|---|---|---|---|
| **Probabilidad alta** | Medio | Alto | Crítico | Crítico |
| **Probabilidad media** | Bajo | Medio | Alto | Crítico |
| **Probabilidad baja** | Bajo | Bajo | Medio | Alto |

Atender en orden: Crítico → Alto → Medio → Bajo.

## Ejemplo aplicado: endpoint de login

### DFD parcial

```
[Cliente] --POST /login (email, password)--> {AuthController}
                                                  |
                                                  v
                                              {AuthService} --> [(Users DB)]
                                                  |
                                                  v
                                              JWT en response
```

### STRIDE aplicado

**S (Spoofing)**
- ❗ Atacante con credenciales válidas (credential stuffing) → MFA + breach check + rate limiting
- ❗ Atacante intercepta el password en tránsito → HTTPS obligatorio + HSTS
- ❗ Phishing site con login falso → educación + WebAuthn (resistente)

**T (Tampering)**
- Manipular request en tránsito → TLS
- Alterar JWT manualmente → firma verificada en backend

**R (Repudiation)**
- Usuario niega haber hecho login → audit log con IP, UA, timestamp
- Atacante borra logs → logs en sistema central (no local), retención

**I (Information Disclosure)**
- Mensaje de error revela si el email existe → mismo mensaje para "user not found" y "wrong password"
- Logs filtran passwords → sanitizar antes de loguear
- JWT en localStorage robado por XSS → cookies HttpOnly

**D (Denial of Service)**
- Brute force agota recursos → rate limiting por IP y por email
- Lockout abusivo (atacante hace fail intencional para bloquear cuenta) → lockout temporal + CAPTCHA en alto volumen, no permanent

**E (Elevation of Privilege)**
- Bypass de MFA → enforce MFA server-side
- Reuse de tokens viejos → token rotation
- JWT con `alg: none` aceptado → fijar algoritmo

### Mitigaciones priorizadas

| Amenaza | Severidad | Mitigación |
|---|---|---|
| Credential stuffing | Crítico | MFA + HIBP check + rate limiting + lockout |
| MITM | Crítico | HTTPS + HSTS preload |
| Account enumeration | Medio | Mensajes genéricos |
| Brute force | Alto | Rate limiting + lockout + CAPTCHA |
| Token theft via XSS | Alto | CSP + HttpOnly cookies |
| Audit gap | Medio | Logs estructurados centralizados |

## Threat modeling para cada tipo de proyecto

### Web app pública (B2C)

| Amenaza | Mitigación |
|---|---|
| Account takeover (S) | MFA, password breach check, rate limiting, account activity emails |
| XSS (T/I) | CSP, output encoding, sanitización, HttpOnly cookies |
| CSRF (T) | SameSite cookies, CSRF tokens si hay sesión |
| Bot scraping (I) | Rate limiting, CAPTCHA en endpoints públicos, WAF |
| Abuse/spam (D) | Rate limiting, account verification, mod tools |
| DoS (D) | Rate limiting, autoscaling, CDN, WAF |
| Data leak en error (I) | Errores genéricos al usuario, detalles solo en logs internos |

### API privada (B2B / entre servicios)

| Amenaza | Mitigación |
|---|---|
| API key leak (S/I) | mTLS, rotación regular, secret manager, monitoring de uso |
| Replay attacks (T) | Timestamps + nonces en signed requests, expiración corta |
| IDOR (E) | Verificación de ownership en cada endpoint |
| Mass assignment (E) | DTOs explícitos, nunca entidad como body |
| Excessive data exposure (I) | Proyecciones DTO, no exponer campos sensibles |
| Rate limit bypass (D) | Limits por API key y por IP |

### E-commerce

| Amenaza | Mitigación |
|---|---|
| Price tampering (T) | Recalcular total en backend, ignorar precios del cliente |
| Inventory race (T) | Locking optimista (`@Version`) o pesimista en checkout |
| Card data leak (I) | NUNCA tocar PAN/CVV, tokenización vía Stripe/etc. |
| Fraud (S) | Verificación 3DS, scoring de fraude (Sift, Stripe Radar) |
| Refund abuse (E) | Workflow de autorización, audit log |
| Cart manipulation (T) | Server-side cart, validar todo en backend |
| Coupon abuse (T) | One-use enforcement server-side, limits por user |

### App interna / corporativa

| Amenaza | Mitigación |
|---|---|
| Insider threat (E/I) | Least privilege, audit logs detallados, separation of duties |
| Lateral movement (E) | Network segmentation, mTLS, zero-trust |
| Phishing → token theft (S) | MFA, WebAuthn, conditional access (IP, dispositivo) |
| Data exfil (I) | DLP, audit, alerting de descargas masivas |

### SaaS multi-tenant

| Amenaza | Mitigación |
|---|---|
| Cross-tenant data leak (I) | Tenant filter en cada query, tests de aislamiento |
| Tenant impersonation (S) | Tenant context bound a session, verificado en cada request |
| Resource exhaustion por tenant (D) | Quotas por tenant, rate limiting |
| Shared secret leak afecta múltiples tenants (I) | Keys por tenant (envelope encryption) |

## Attack Trees

Alternativa visual a STRIDE para amenazas específicas. Empezar con el goal del atacante y descomponer.

```
Goal: Acceso no autorizado a cuenta de usuario
├── 1. Obtener credenciales
│   ├── 1.1 Credential stuffing (DB breach pública)
│   │   └── Mitigación: HIBP check, MFA
│   ├── 1.2 Phishing
│   │   └── Mitigación: WebAuthn, educación, DMARC
│   ├── 1.3 Keylogger
│   │   └── Mitigación: out of scope (endpoint del usuario)
│   └── 1.4 MITM
│       └── Mitigación: HTTPS + HSTS preload
├── 2. Robar sesión activa
│   ├── 2.1 XSS roba token de localStorage
│   │   └── Mitigación: CSP, HttpOnly cookies
│   ├── 2.2 Session fixation
│   │   └── Mitigación: regenerar session ID al login
│   └── 2.3 Sniffing en wifi pública
│       └── Mitigación: HTTPS
└── 3. Bypass de auth en el backend
    ├── 3.1 JWT con alg: none
    │   └── Mitigación: fijar algoritmo
    ├── 3.2 SQL Injection en login
    │   └── Mitigación: parametrized queries
    └── 3.3 IDOR en endpoint que no requiere auth
        └── Mitigación: default deny, tests
```

Generar attack trees con `Figma:generate_diagram` (mermaid flowchart).

## Output esperado de un threat model

Documento (markdown) con:

1. **Resumen** del sistema y scope
2. **DFD** con trust boundaries
3. **Lista de assets** (qué protegemos, prioridad)
4. **Lista de actores** (legítimos y maliciosos)
5. **Amenazas identificadas** con STRIDE, agrupadas por componente
6. **Mitigaciones** existentes y propuestas
7. **Riesgos aceptados** con justificación
8. **Action items** con responsable y deadline

## Cuándo invocar threat modeling en este flujo

- Al iniciar un proyecto nuevo (Flujo C — Hardening de proyecto completo)
- Cuando el usuario pide "asegurar X feature" — hacer threat model rápido antes
- Cuando el usuario pregunta "¿qué amenazas tiene este diseño?" — siempre
- Cuando el usuario describe arquitectura compleja — proactivamente sugerirlo
