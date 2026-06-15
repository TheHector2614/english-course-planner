# ADRs y RFCs

Documentar **decisiones técnicas** y **propuestas de cambio**.

## ADR vs RFC: cuándo usar cada uno

| | ADR | RFC |
|---|---|---|
| **Propósito** | Registrar decisión TOMADA | Proponer cambio + discutir |
| **Timing** | Después de decidir | Antes de decidir |
| **Tamaño** | 1-3 páginas | 2-10+ páginas |
| **Iteración** | Pocas (status updates) | Múltiples revisiones |
| **Audiencia** | Lectores futuros | Comité actual |
| **Quién decide** | Tech lead + arquitecto | Discusión amplia |

**Regla práctica**:
- **RFC**: propuesta grande con incertidumbre, necesita debate
- **ADR**: decisión ya tomada que queremos registrar

A veces RFC → se acepta → se convierte en ADR.

## Architecture Decision Records (ADRs)

### Por qué existen

Decisiones técnicas se olvidan. Sin registro:
- Equipo nuevo no entiende por qué se hizo X
- Se debate de nuevo lo mismo cada 6 meses
- Imposible saber qué se evaluó vs lo que se ignoró
- Cambios futuros sin entender constraints originales

ADRs preservan el **contexto** y **razonamiento**, no solo el resultado.

### Formato Michael Nygard (clásico, recomendado)

```markdown
# ADR-NNN: <Título corto, decisión imperativa>

## Status

Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context

¿Qué fuerzas están en juego? ¿Qué problema enfrentamos?
Hechos, no opiniones. Por qué necesitamos decidir algo ahora.

## Decision

Lo que decidimos hacer. Imperativo: "Vamos a hacer X".

## Consequences

Resultados positivos, negativos y neutrales esperados.
Tanto inmediatos como a futuro.
```

### Formato MADR (Markdown ADR, moderno)

Más estructurado:

```markdown
---
status: accepted
date: 2026-05-19
deciders: [@user1, @user2]
consulted: [@user3]
informed: [@team-backend]
---

# Adoptar PostgreSQL como base de datos principal

## Contexto y problema

Necesitamos elegir DB para nuevo servicio que manejará órdenes.
Requisitos: ACID, queries complejas, ~10k orders/día,
multi-tenancy con isolation moderado.

## Drivers de decisión

* Soporta ACID y joins complejos
* Comunidad y operación maduras
* Costo razonable
* El equipo lo conoce
* Soporte managed en AWS (RDS)

## Opciones consideradas

* PostgreSQL
* MySQL
* DynamoDB
* MongoDB

## Resultado

Elegimos **PostgreSQL** porque:
- ACID completo + JSON cuando necesitamos flexibilidad
- El equipo tiene experiencia
- RDS PostgreSQL es maduro
- Extensiones (PostGIS, pgvector) abren puertas futuras

### Consecuencias

**Bueno**:
- Tooling maduro
- Queries SQL estándar
- Fácil onboard de nuevos devs (saben SQL)
- Backups, replicación, etc. cubiertos por RDS

**Malo**:
- Requiere modelado relacional (más diseño upfront)
- No escala horizontalmente como NoSQL (suficiente para nuestro volumen)
- Conexiones limitadas (necesitaremos connection pooling)

**Neutral**:
- Tendremos que mantener migrations explícitas (Flyway)
- Habrá que tunear RDS con buen escalado vertical

## Pros y cons de las opciones

### PostgreSQL
* ✅ ACID, joins, JSON, extensiones
* ✅ Equipo lo conoce
* ❌ Escalado horizontal manual

### MySQL
* ✅ Maduro, equipo lo conoce
* ❌ JSON menos potente que PG
* ❌ Menos extensiones interesantes

### DynamoDB
* ✅ Escalado automático
* ❌ Sin joins, modelado complejo
* ❌ Vendor lock-in AWS

### MongoDB
* ✅ Documents flexibles
* ❌ No queremos NoSQL para esto
* ❌ Equipo no lo conoce bien

## Links

* Supersedes ADR-003
* Related to ADR-007 (data migration strategy)
* [PostgreSQL on AWS RDS docs](https://...)
```

### Numeración y ubicación

```
docs/
└── adr/
    ├── 001-record-architecture-decisions.md
    ├── 002-use-react-for-frontend.md
    ├── 003-use-postgresql.md
    ├── 004-deprecate-redis-as-primary-store.md
    └── README.md       (índice de todas las ADRs)
```

- **Numeradas secuencialmente** (001, 002, ...)
- **Nunca se borran**, solo cambian de status
- **No se modifican** después de Accepted (excepto status)
- Si la decisión cambia: nueva ADR que "supersedes" la anterior

### Status lifecycle

```
Proposed → Accepted → Deprecated
           Accepted → Superseded by ADR-XXX
Proposed → Rejected
```

### ADR-001: meta-ADR

La primera ADR registra que usarán ADRs:

```markdown
# ADR-001: Record architecture decisions

## Status

Accepted

## Context

Necesitamos registrar las decisiones arquitecturales tomadas en este proyecto.

## Decision

Usaremos ADRs para documentar decisiones siguiendo el formato propuesto por Michael Nygard.

## Consequences

- Decisiones quedan documentadas con contexto
- Equipo nuevo entiende razones históricas
- Cada nueva ADR vivirá en `/docs/adr/`
- Formato: `NNN-titulo-corto.md`
```

### Cuándo crear ADR

✅ Sí:
- Elección de tecnología clave (DB, lenguaje, framework)
- Patrón arquitectural (microservicios vs monolito, event-driven, etc.)
- Cambio de dirección
- Decisión irreversible o costosa de revertir
- Decisión que sorprenderá al equipo en 6 meses

❌ No:
- "Vamos a usar 4 espacios para indent"
- "Renombramos esta variable"
- Decisiones tácticas que cambian semana a semana
- Implementación específica de algo ya decidido

### Anti-patterns ADR

- ❌ ADR con título vago: "Database stuff"
- ❌ ADR sin contexto: solo dice qué se hizo, no por qué
- ❌ Listar todas las opciones sin evaluarlas
- ❌ ADRs sin status (Proposed/Accepted/etc.)
- ❌ Modificar ADRs aceptadas (deberían ser inmutables)
- ❌ ADRs largos que son realmente RFCs
- ❌ Sin "Consequences" o solo positivas (siempre hay trade-offs)

## RFCs (Request for Comments)

### Propósito

Proponer un cambio significativo y abrir discusión antes de decidir.

Origen: IETF RFCs, popular en Rust, Python, React, etc.

### Cuándo usar RFC

- Cambio que afecta a múltiples equipos
- Decisión grande con varias opciones viables
- Necesitas input antes de comprometerte
- Hay opiniones encontradas

### Formato RFC

```markdown
# RFC: <Título>

* **RFC Number**: RFC-2026-005
* **Author**: @nombre
* **Status**: Draft | Discussion | Final Comment Period | Accepted | Rejected
* **Created**: 2026-05-19
* **Discussion**: [link a thread, issue, etc.]

## Summary

1-2 párrafos: qué propones y por qué.

## Motivation

¿Por qué hacer esto? ¿Qué problema resolvemos?
¿Qué casos de uso habilita?
¿Qué pasa si NO lo hacemos?

## Detailed design

Cómo funcionaría exactamente. Incluir:
- Cambios en API/interfaces
- Cambios en datos
- Cambios en operación
- Ejemplos de código si aplica
- Diagramas si ayudan

## Drawbacks

¿Por qué NO hacer esto?
- Costo
- Complejidad agregada
- Mantenimiento
- Riesgos

## Alternatives

Otras formas de resolver el problema. ¿Por qué la propuesta es mejor?

## Adoption strategy

¿Cómo se implementa sin romper todo?
- Migración gradual
- Compatibilidad con versiones viejas
- Plan de deprecation

## How we teach this

¿Cómo aprende el equipo lo nuevo?
- Documentación necesaria
- Training
- Cambios en onboarding

## Unresolved questions

Cosas que aún no sabemos cómo resolver. Pedir input.

## Open questions

Preguntas específicas para los reviewers.

## References

- Links relevantes
- ADRs relacionados
- Issues o discussions
```

### Proceso típico

```
1. Draft           → Author escribe
2. Discussion      → PR abierto, equipo comenta
3. Iteration       → Author actualiza basado en feedback
4. FCP (Final Comment Period) → 1-2 semanas para últimos comentarios
5. Accepted/Rejected → Decisión final
6. Implementation  → Plan de roll-out
```

### Tooling

Algunas comunidades tienen procesos formales:
- **Rust**: rust-lang/rfcs en GitHub
- **React**: reactjs/rfcs
- **Ember**: emberjs/rfcs

Para equipo: PRs a `/docs/rfcs/` funciona bien.

### RFC vs ADR — ejemplo del flujo

1. Alguien propone: "Migrar a microservicios"
   → **RFC** (decisión grande, necesita debate)
2. Equipo discute durante 2 semanas
3. Decisión: aceptar pero gradual
4. Se crea **ADR** que registra: "Decidimos migrar a microservicios gradualmente, empezando por X"
5. La RFC queda como histórico de la discusión
6. La ADR es la referencia futura

## ADR/RFC para diferentes contextos

### Open source

ADRs/RFCs públicos. Casos famosos:
- React Hooks RFC
- Rust async/await RFC

Permite comunidad externa contribuir.

### Empresa interna

ADRs en Confluence o repo de docs. RFCs en GitHub PRs o herramientas como Linear/Notion.

### Equipo chico

Quizás solo ADRs cortos. RFCs ad-hoc en Slack threads largos.

## Diagramas en ADRs/RFCs

Mermaid para diagramas inline:

```markdown
## Decision

Migrar a arquitectura event-driven:

\`\`\`mermaid
graph LR
    OrderService -->|publishes| EventBus[(Event Bus)]
    EventBus -->|subscribes| EmailService
    EventBus -->|subscribes| AnalyticsService
    EventBus -->|subscribes| InventoryService
\`\`\`
```

## ADR Tooling

- **adr-tools** (CLI): https://github.com/npryce/adr-tools
- **log4brains**: web UI para ADRs
- **MADR templates**: https://adr.github.io/madr/

```bash
# adr-tools
brew install adr-tools
adr init docs/adr
adr new "Use PostgreSQL as primary DB"
adr new -s 3 "Use Redis for caching"   # supersedes ADR-3
```

## Plantillas listas

### ADR (Nygard)

```markdown
# ADR-NNN: <Title>

## Status

Proposed

## Context

<problema, fuerzas en juego, constraints>

## Decision

<lo que decidimos>

## Consequences

<positivas, negativas, neutrales>
```

### ADR (MADR)

```markdown
---
status: proposed
date: YYYY-MM-DD
deciders: [@user1, @user2]
---

# <Title>

## Context and Problem Statement

## Decision Drivers

* <driver 1>
* <driver 2>

## Considered Options

* <option 1>
* <option 2>

## Decision Outcome

Chosen option: "<option>", because <razón>.

### Consequences

* Good, because <X>
* Bad, because <Y>

## Pros and Cons of the Options

### <Option 1>

* Good: <X>
* Bad: <Y>
```

### RFC mínimo

```markdown
# RFC: <Title>

* Status: Draft
* Author: @user
* Date: YYYY-MM-DD

## Summary

## Motivation

## Detailed design

## Drawbacks

## Alternatives

## Open questions
```

## Checklist

### Antes de publicar un ADR

- [ ] Título descriptivo e imperativo
- [ ] Status correcto (Proposed/Accepted)
- [ ] Context: problema claro
- [ ] Decision: imperativo, no condicional
- [ ] Consequences: positivas Y negativas
- [ ] Numeración correcta y secuencial
- [ ] Links a ADRs relacionados
- [ ] Conciso (1-3 páginas)

### Antes de publicar un RFC

- [ ] Summary claro
- [ ] Motivation justifica el cambio
- [ ] Detailed design suficiente para que se entienda
- [ ] Drawbacks honestos
- [ ] Alternatives consideradas
- [ ] Adoption strategy realista
- [ ] Open questions explícitas
- [ ] Diagrama si ayuda
