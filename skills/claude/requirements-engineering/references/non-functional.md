# Requisitos No Funcionales (NFRs)

Performance, seguridad, escalabilidad, disponibilidad, usabilidad, mantenibilidad. Cómo cuantificarlos y verificarlos. Modelo ISO/IEC 25010.

## Funcional vs no funcional

- **Funcional**: qué **hace** el sistema ("el usuario puede pagar")
- **No funcional**: **cómo de bien** lo hace ("el pago responde en <2s en el p95")

Los NFRs (también "atributos de calidad" o "-ilities") suelen ser los más olvidados y los que más dolor causan en producción. Una feature que funciona pero es lenta, insegura o se cae no sirve.

## El principio clave: cuantificar

Un NFR sin número no es verificable. Es el error #1.

```
❌ "El sistema debe ser rápido"
✅ "El 95% de las búsquedas debe responder en menos de 300ms
    bajo una carga de 1000 usuarios concurrentes"

❌ "El sistema debe ser altamente disponible"
✅ "El sistema debe tener una disponibilidad del 99.9% mensual
    (máximo ~43 min de downtime/mes)"

❌ "El sistema debe ser seguro"
✅ "Todas las contraseñas deben almacenarse con hash bcrypt (cost ≥12);
    todo el tráfico debe usar TLS 1.2+"

❌ "La interfaz debe ser fácil de usar"
✅ "Un usuario nuevo debe completar el registro en <3 minutos
    sin ayuda, con tasa de éxito ≥90% en pruebas de usabilidad"
```

Plantilla: **[métrica] [condición/carga] [umbral] [cómo se mide]**.

## Modelo ISO/IEC 25010 (características de calidad)

Marco estándar para clasificar NFRs. Ocho características:

### 1. Adecuación funcional
Completitud, corrección, pertinencia de las funciones. (Frontera con lo funcional.)

### 2. Eficiencia de desempeño (Performance)
- **Tiempo de respuesta**: latencia (especificar percentil: p50, p95, p99)
- **Throughput**: transacciones/segundo, requests/segundo
- **Utilización de recursos**: CPU, memoria, red, disco
- **Capacidad**: límites máximos (usuarios, datos, conexiones)

```
- El 95% de las peticiones a la API responde en <200ms
- El sistema procesa ≥500 transacciones/segundo
- El uso de memoria por instancia no supera 512MB en operación normal
```

Para optimización real → `databases` (queries), `devops` (escalado), backend skills.

### 3. Compatibilidad
- **Coexistencia**: con otros sistemas
- **Interoperabilidad**: integración (APIs, formatos, protocolos)

```
- El sistema expone una API REST que cumple OpenAPI 3.1
- Debe integrarse con el SSO corporativo vía SAML 2.0
```

### 4. Usabilidad
- **Aprendizaje**: qué tan rápido se aprende
- **Operabilidad**: facilidad de uso
- **Accesibilidad**: WCAG (ver más abajo)
- **Protección ante errores del usuario**

```
- La interfaz cumple WCAG 2.1 nivel AA
- Un usuario nuevo completa la tarea principal en <5 min sin ayuda
- Toda acción destructiva pide confirmación
```

### 5. Fiabilidad (Reliability)
- **Disponibilidad**: % uptime (ver tabla de nueves abajo)
- **Tolerancia a fallos**: comportamiento ante fallas
- **Recuperabilidad**: RTO/RPO

```
- Disponibilidad 99.95% mensual
- RTO (Recovery Time Objective): <1 hora
- RPO (Recovery Point Objective): <5 minutos de pérdida de datos
- Ante caída de un nodo, el sistema sigue operando (sin SPOF)
```

Tabla de disponibilidad ("nueves"):

| Disponibilidad | Downtime/año | Downtime/mes |
|---|---|---|
| 99% | 3.65 días | 7.2 horas |
| 99.9% | 8.76 horas | 43.2 min |
| 99.95% | 4.38 horas | 21.6 min |
| 99.99% | 52.6 min | 4.32 min |

Para SLOs/SLAs → `devops` (`sre-culture.md`).

### 6. Seguridad (Security)
- **Confidencialidad, integridad, disponibilidad** (CIA)
- **Autenticación, autorización**
- **No repudio, trazabilidad (audit)**
- **Cifrado** (en tránsito y en reposo)

```
- Todo el tráfico usa TLS 1.2+
- Contraseñas con hash bcrypt (cost ≥12) o Argon2
- Datos sensibles cifrados en reposo (AES-256)
- Logs de auditoría para acciones críticas, retención 1 año
- Cumple OWASP ASVS nivel 2
```

⚠️ Para el detalle de seguridad → `web-backend-security` (apps) y `cybersecurity-defense` (sistemas/infra). Aquí solo se **especifica** el requisito.

### 7. Mantenibilidad (Maintainability)
- **Modularidad, reusabilidad**
- **Analizabilidad, modificabilidad**
- **Testeabilidad** (cobertura, facilidad de probar)

```
- Cobertura de tests ≥80% en lógica de negocio
- El código cumple el linter del proyecto sin errores
- Tiempo de build <10 min
```

### 8. Portabilidad
- **Adaptabilidad** (entornos)
- **Instalabilidad**
- **Reemplazabilidad**

```
- El sistema corre en contenedores OCI (cualquier orquestador K8s)
- Configuración vía variables de entorno (12-factor)
```

## Otros NFRs frecuentes

### Compliance / regulatorios
```
- Cumple GDPR (derecho al olvido, portabilidad, consentimiento)
- Cumple PCI-DSS para datos de tarjetas
- Retención de datos según normativa local (X años)
```
Para compliance técnico → `web-backend-security`.

### Escalabilidad
```
- Escala horizontalmente hasta 50 instancias sin cambios de código
- Soporta crecimiento a 1M de usuarios sin rediseño de arquitectura
- Latencia estable (±10%) al duplicar la carga
```
Para escalado real → `devops`, `aws-cloud`, `databases`.

### Observabilidad
```
- Toda petición tiene un correlation ID trazable
- Métricas de golden signals expuestas (latencia, tráfico, errores, saturación)
- Logs estructurados (JSON)
```
Para implementación → `devops` (`observability.md`).

### Localización / i18n
```
- Soporta español, inglés y portugués
- Fechas, números y monedas según el locale del usuario
```

### Accesibilidad (detalle WCAG)
```
- Cumple WCAG 2.1 nivel AA
- Navegable 100% por teclado
- Contraste de color ≥4.5:1 para texto normal
- Compatible con lectores de pantalla (ARIA)
```

## Cómo verificar cada NFR

Cada NFR debe declarar **cómo se prueba**. Si no se puede verificar, está mal escrito.

| Tipo NFR | Cómo se verifica |
|---|---|
| Performance | Pruebas de carga (k6, JMeter, Gatling), monitoreo en prod |
| Disponibilidad | Monitoreo de uptime, medición de SLO |
| Seguridad | Pentesting, escaneo (SAST/DAST), auditoría (ver cybersecurity-defense) |
| Usabilidad | Pruebas de usabilidad con usuarios, métricas de tarea |
| Accesibilidad | Auditoría WCAG (axe, Lighthouse), pruebas con lectores |
| Mantenibilidad | Métricas de código, cobertura, tiempo de build |
| Escalabilidad | Pruebas de carga incremental |

## Dónde documentar los NFRs

- **Ágil**: como criterios de aceptación de historias relevantes, o un documento de NFRs transversal, o en la Definition of Done (NFRs que aplican siempre)
- **Formal**: sección dedicada del SRS (ver `use-cases-srs.md`)

Algunos NFRs son **transversales** (aplican a todo el sistema, ej: "todo el tráfico usa TLS") y conviene definirlos una vez globalmente, no repetirlos en cada historia.

## Trade-offs entre NFRs

Los NFRs compiten entre sí. Decisiones explícitas:
- Seguridad ↔ usabilidad (2FA es más seguro pero menos cómodo)
- Performance ↔ mantenibilidad (optimización agresiva complica el código)
- Disponibilidad ↔ costo (más nueves = exponencialmente más caro)
- Consistencia ↔ disponibilidad (teorema CAP, ver `databases`)

Documentar los trade-offs y quién los decidió (puede ir como ADR → `technical-docs`).

## Anti-patterns

- ❌ NFRs sin cuantificar ("rápido", "seguro", "escalable")
- ❌ Performance sin percentil (un promedio esconde la cola)
- ❌ NFR sin método de verificación
- ❌ Ignorar NFRs hasta producción (caro de arreglar)
- ❌ Repetir NFRs transversales en cada historia (definir una vez)
- ❌ Sobre-especificar (99.999% cuando el negocio necesita 99.9%)
- ❌ NFRs copiados de plantilla sin pensar el contexto real
- ❌ No declarar trade-offs (decisiones implícitas)

## Checklist NFRs

- [ ] Categorías relevantes de ISO 25010 revisadas
- [ ] Cada NFR cuantificado (métrica + umbral + condición)
- [ ] Performance con percentil (p95/p99, no promedio)
- [ ] Disponibilidad con objetivo medible
- [ ] Seguridad especificada (detalle → security skills)
- [ ] Cada NFR con método de verificación
- [ ] NFRs transversales definidos globalmente
- [ ] Trade-offs documentados
- [ ] Objetivos realistas (ajustados al negocio, no inflados)
