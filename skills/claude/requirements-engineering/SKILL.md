---
name: requirements-engineering
description: Skill integral de ingeniería de requisitos - elicitación (técnicas, stakeholders), redacción (user stories con INVEST, criterios de aceptación, Gherkin/BDD, casos de uso, SRS formal IEEE 830/29148, PRD), requisitos no funcionales (NFRs cuantificables, ISO 25010), auditoría de calidad (ambigüedad, testeabilidad, atomicidad), gestión (trazabilidad/RTM, priorización MoSCoW/Kano/WSJF/RICE, versionado, change management), y conversión a trabajo ejecutable (épica→historia→tarea, vertical slicing, definition of ready/done, tickets en Jira/GitHub/Linear). Activa esta skill cuando el usuario mencione requisitos, requirements, user story, historia de usuario, criterios de aceptación, Gherkin, BDD, PRD, SRS, caso de uso, requisito funcional o no funcional, NFR, especificación, épica, backlog, MoSCoW, priorización, trazabilidad, elicitación, stakeholders, definition of done/ready, o pida escribir/revisar/auditar/gestionar/priorizar requisitos o convertirlos en historias o tickets.
---

# Requirements Engineering Skill

Skill para descubrir, especificar, auditar, gestionar y operacionalizar requisitos de software. Cubre el espectro ágil ↔ formal y se adapta a la audiencia.

## Relación con otras skills

| Skill | Cubre | Esta skill complementa |
|---|---|---|
| `entrevistador-procesos` | Entrevista interactiva en vivo para definir algo antes de construir | Aquí: técnicas/teoría de elicitación y los artefactos resultantes |
| `technical-docs` | Formato y publicación de docs (MkDocs, Confluence, Diátaxis) | Aquí: el **contenido** de los requisitos (qué hace bueno a un requisito) |
| `optimizador-prompts` | Estructurar ideas para IA | Aquí: estructurar necesidades en requisitos de software |
| `databases`, `java-backend`, etc. | Implementación | Aquí: qué construir, antes de construirlo |

**Regla**: si el usuario necesita una **entrevista guiada en vivo** para definir un proyecto desde cero → `entrevistador-procesos`. Si necesita **redactar, auditar o gestionar requisitos** como artefactos → esta skill. Si necesita **publicar/formatear** la documentación → `technical-docs`.

## Principios fundamentales

### 1. Un requisito describe el QUÉ y el POR QUÉ, no el CÓMO

El requisito captura la necesidad y su justificación, no la solución técnica. "El usuario debe poder recuperar su contraseña" (qué), no "agregar un endpoint POST /reset con un token JWT" (cómo). El cómo es diseño, viene después.

### 2. Todo requisito debe ser testeable

Si no podés escribir una prueba que verifique si se cumple, no es un requisito, es un deseo. "Rápido" no es testeable; "responde en <200ms en el p95" sí. Esto aplica también a NFRs.

### 3. Sin ambigüedad

Las palabras vagas ("fácil", "intuitivo", "robusto", "etc.", "según corresponda") son el enemigo. Cada requisito debe tener una sola interpretación posible.

### 4. Atomicidad

Un requisito = una necesidad verificable. "El sistema debe validar el email y enviar confirmación" son dos requisitos. Los compuestos esconden alcance y complican la trazabilidad.

### 5. Trazabilidad

Cada requisito debe poder rastrearse: de dónde viene (origen/stakeholder), por qué existe (objetivo de negocio), y hacia dónde va (diseño, código, pruebas). Sin trazabilidad no sabés el impacto de un cambio.

### 6. Priorización explícita

No todo es igual de importante. Sin priorización, el equipo decide por defecto (mal). MoSCoW, Kano, WSJF: que la importancia sea una decisión consciente.

### 7. Los requisitos cambian: gestionarlos, no congelarlos

El cambio es inevitable. El objetivo no es evitarlo sino gestionarlo: versionado, baselines, análisis de impacto, change control.

### 8. Adaptar el formalismo al contexto

Una startup ágil no necesita un SRS de 80 páginas; un sistema médico regulado sí. El nivel de formalismo se ajusta al riesgo, al tamaño del equipo y a la regulación.

## Decisión rápida: ¿qué artefacto/enfoque?

| Situación | Artefacto | Referencia |
|---|---|---|
| Feature en equipo ágil | User story + criterios de aceptación | `user-stories.md` |
| Comportamiento esperado verificable | Gherkin (Given/When/Then) | `user-stories.md` |
| Visión de producto / feature grande | PRD | `prd.md` |
| Sistema complejo / regulado | SRS + casos de uso | `use-cases-srs.md` |
| Interacción usuario-sistema detallada | Caso de uso | `use-cases-srs.md` |
| Performance, seguridad, escalabilidad | NFRs cuantificados | `non-functional.md` |
| Sacar requisitos de stakeholders | Técnicas de elicitación | `elicitation.md` |
| Revisar si un requisito está bien escrito | Checklist de calidad | `quality-review.md` |
| Decidir qué entra primero | Priorización (MoSCoW/Kano/WSJF) | `management.md` |
| Rastrear requisito → código → test | Matriz de trazabilidad (RTM) | `management.md` |
| Pasar de requisito a sprint | Épica→historia→tarea | `requirements-to-tickets.md` |

## Flujos de trabajo

### Flujo A — "Convertí esta idea en requisitos"

1. Elicitar: entender necesidad real, stakeholders, contexto (ver `elicitation.md`; para entrevista en vivo → `entrevistador-procesos`)
2. Separar problema de solución (capturar el qué/por qué)
3. Identificar requisitos funcionales y no funcionales
4. Elegir formato según audiencia (user stories para ágil, SRS para formal)
5. Redactar con criterios de aceptación testeables
6. Auditar calidad (ver `quality-review.md`)
7. Priorizar (ver `management.md`)

### Flujo B — "Escribí user stories para esto"

1. Identificar roles/personas
2. Formato: Como [rol], quiero [acción], para [beneficio]
3. Verificar INVEST (independiente, negociable, valiosa, estimable, pequeña, testeable)
4. Criterios de aceptación (Gherkin o lista)
5. Dividir si es demasiado grande (story splitting)
6. Agrupar en épicas si aplica

Ver `user-stories.md`.

### Flujo C — "Especificá esto formalmente (SRS/casos de uso)"

1. Estructura SRS (IEEE 830/29148): propósito, alcance, requisitos funcionales/no funcionales
2. Requisitos funcionales numerados y atómicos (REQ-001...)
3. Casos de uso: actor, precondición, flujo principal, flujos alternativos, excepciones, postcondición
4. NFRs (ver `non-functional.md`)
5. Auditar (ver `quality-review.md`)

Ver `use-cases-srs.md`.

### Flujo D — "Escribí un PRD"

1. Problema (qué problema resuelve, para quién, por qué ahora)
2. Objetivos y métricas de éxito (cómo sabremos que funcionó)
3. Usuarios y casos de uso
4. Requisitos (funcionales + no funcionales), priorizados
5. Alcance: qué entra y qué NO (out of scope)
6. Dependencias, riesgos, supuestos

Ver `prd.md`.

### Flujo E — "Definí los requisitos no funcionales"

1. Identificar categorías relevantes (ISO 25010): performance, seguridad, escalabilidad, disponibilidad, usabilidad, mantenibilidad
2. Cuantificar cada uno (umbrales medibles, no adjetivos)
3. Definir cómo se verifica cada NFR
4. Para seguridad → delegar detalle a `web-backend-security`/`cybersecurity-defense`

Ver `non-functional.md`.

### Flujo F — "Revisá/auditá estos requisitos"

1. Pasar cada requisito por el checklist de calidad
2. Detectar: ambigüedad, no-testeabilidad, requisitos compuestos, vacíos, contradicciones, "requirement smells"
3. Verificar completitud del conjunto (¿faltan casos borde, errores, NFRs?)
4. Reescribir los problemáticos
5. Reportar hallazgos priorizados

Ver `quality-review.md`.

### Flujo G — "Gestioná/priorizá los requisitos"

1. Priorización (MoSCoW para alcance, Kano para satisfacción, WSJF/RICE para secuenciar)
2. Trazabilidad (matriz origen → requisito → diseño → código → test)
3. Versionado y baselines
4. Change management (análisis de impacto ante cambios)

Ver `management.md`.

### Flujo H — "Convertí estos requisitos en tickets/historias"

1. Descomponer: épica → historias → tareas
2. Vertical slicing (cada historia entrega valor end-to-end)
3. Criterios de aceptación + Definition of Ready/Done
4. Estimación (story points / tallas)
5. Mapear a la herramienta (Jira, GitHub Issues, Linear)

Ver `requirements-to-tickets.md`.

## El espectro: ágil ↔ formal

```
Informal/ágil ──────────────────────────────► Formal/tradicional
User stories      PRD          Casos de uso        SRS (IEEE 830)
+ Gherkin                                            + trazabilidad
                                                     formal

Startup,          Producto,    Sistemas con        Regulado (médico,
equipo chico      varios        flujos complejos    aeroespacial,
                  equipos                            financiero)
```

El nivel de formalismo se elige por: riesgo, regulación, tamaño/distribución del equipo, y costo de un error. No es "ágil bueno, formal malo": es ajustar la herramienta al problema.

## Anatomía de un buen requisito

Características (IEEE 29148):

| Característica | Significa |
|---|---|
| **Correcto** | Refleja una necesidad real |
| **No ambiguo** | Una sola interpretación |
| **Completo** | No le falta info para implementarlo |
| **Consistente** | No contradice otros requisitos |
| **Testeable/verificable** | Se puede probar si se cumple |
| **Atómico** | Una sola necesidad |
| **Trazable** | Se puede rastrear origen y destino |
| **Factible** | Implementable con recursos/tecnología reales |
| **Priorizado** | Tiene importancia asignada |

Ver `quality-review.md` para el checklist completo y ejemplos de malo→bueno.

## Quick wins

1. **Criterios de aceptación en cada historia** (sin ellos, "hecho" es ambiguo)
2. **Cuantificar NFRs** (no "rápido" → "<200ms p95")
3. **Out of scope explícito** (qué NO se hace evita malentendidos)
4. **Priorización MoSCoW** (Must/Should/Could/Won't)
5. **Plantilla de user story** consistente
6. **Definition of Ready/Done** acordada por el equipo
7. **Detectar palabras vagas** (fácil, intuitivo, robusto, rápido, etc.)
8. **Un requisito por línea** (atomicidad)
9. **Trazabilidad mínima** (cada requisito → su objetivo de negocio)

## Output esperado

### Redacción
- User stories con criterios de aceptación / Gherkin
- PRD estructurado
- SRS + casos de uso (si formal)
- NFRs cuantificados

### Auditoría
- Hallazgos por requisito (ambigüedad, testeabilidad, etc.)
- Reescrituras propuestas
- Gaps de completitud del conjunto

### Gestión
- Matriz de priorización (MoSCoW/Kano/WSJF)
- Matriz de trazabilidad (RTM)
- Plan de versionado / change management

### Operacionalización
- Descomposición épica→historia→tarea
- Tickets listos (con AC, DoR/DoD, estimación)

## Referencias

- `references/elicitation.md` — Técnicas de elicitación, stakeholders, requisitos implícitos/tácitos
- `references/user-stories.md` — User stories, INVEST, criterios de aceptación, Gherkin/BDD, épicas, splitting
- `references/use-cases-srs.md` — Casos de uso, SRS, IEEE 830/29148, requisitos funcionales formales
- `references/non-functional.md` — NFRs, ISO 25010, cómo cuantificar y verificar
- `references/prd.md` — Product Requirements Document, estructura, plantilla, PRD vs BRD vs SRS
- `references/quality-review.md` — Características de calidad, auditoría, ambigüedad, requirement smells, checklist
- `references/management.md` — Priorización (MoSCoW/Kano/WSJF/RICE), trazabilidad/RTM, versionado, change management
- `references/requirements-to-tickets.md` — Épica→historia→tarea, vertical slicing, DoR/DoD, mapeo a herramientas

## Lo que NUNCA hay que hacer

- ❌ Mezclar el QUÉ con el CÓMO (requisito con solución técnica)
- ❌ Requisitos no testeables ("debe ser fácil de usar")
- ❌ Palabras ambiguas (fácil, rápido, robusto, intuitivo, etc., según corresponda)
- ❌ Requisitos compuestos (varios "y"/"o" en uno)
- ❌ User stories sin criterios de aceptación
- ❌ NFRs sin cuantificar
- ❌ Omitir el "out of scope" (qué NO se hace)
- ❌ Sin priorización (todo "crítico" = nada priorizado)
- ❌ Sin trazabilidad (no saber el impacto de un cambio)
- ❌ Congelar requisitos en lugar de gestionar el cambio
- ❌ Sobre-especificar en contexto ágil (SRS de 80 páginas para una startup)
- ❌ Sub-especificar en contexto regulado (user stories sueltas para un sistema médico)
- ❌ Asumir requisitos implícitos sin validarlos con stakeholders
- ❌ Confundir requisitos de negocio, de usuario y de sistema (son niveles distintos)
- ❌ "Gold plating": agregar requisitos que nadie pidió
