---
name: technical-docs
description: Skill mixta completa para documentación técnica - READMEs, API docs (OpenAPI/Swagger), ADRs (Architecture Decision Records), RFCs, runbooks operativos, postmortems, onboarding docs, tutoriales y guías. Aplica framework Diátaxis (tutorial/how-to/reference/explanation) para organizar contenido. Soporta Markdown, MkDocs, Docusaurus, Sphinx, Read the Docs, Confluence, Notion. Genera documentación bilingüe (español/inglés). Estilo conciso y formal. Incluye diagramas Mermaid/PlantUML cuando aplica. Activa esta skill SIEMPRE que el usuario mencione "documentación", "docs", "README", "API docs", "OpenAPI", "Swagger", "ADR", "RFC", "runbook", "postmortem", "changelog", "onboarding", "guía", "tutorial", "Diátaxis", "JSDoc", "Javadoc", "docstring", "MkDocs", "Docusaurus", "Sphinx", "Confluence", "Notion", "documentar", o pida escribir/mejorar/revisar/auditar cualquier documentación técnica. También cuando hable de comentarios en código, diagramas de arquitectura, decisiones técnicas o documentación para usuarios.
---

# Technical Documentation Skill

Skill para escribir documentación técnica clara, concisa y mantenible.

## Principios fundamentales

### 1. Diátaxis como framework

Todo contenido de documentación cae en una de 4 categorías. Identificar la categoría ANTES de escribir.

```
                    Práctico (acción)            Teórico (conocimiento)
                  ┌───────────────────────────┬───────────────────────────┐
                  │                           │                           │
   Aprendizaje    │       TUTORIAL            │      EXPLANATION          │
   (orientado)    │   "Aprende haciendo"      │   "Comprende esto"        │
                  │                           │                           │
                  ├───────────────────────────┼───────────────────────────┤
                  │                           │                           │
   Trabajo        │       HOW-TO              │      REFERENCE            │
   (orientado)    │   "Logra esta meta"       │   "Consulta esto"         │
                  │                           │                           │
                  └───────────────────────────┴───────────────────────────┘
```

Cada cuadrante tiene reglas distintas — confundirlos genera docs malos. Detalles en `references/diataxis-framework.md`.

### 2. Less is more

Documentación concisa > exhaustiva. Cada palabra debe ganarse su lugar.

- ❌ "En este documento vamos a explicar cómo configurar..."
- ✅ "Para configurar X:"

- ❌ "Es importante notar que también puede ser útil considerar..."
- ✅ "También: ..."

Las personas escanean docs, no las leen. Estructurar con headers, bullets cortos, code blocks.

### 3. Audiencia primero

Identificar audiencia ANTES de escribir:
- **Devs nuevos** → onboarding, tutoriales
- **Devs experimentados** → reference, how-to
- **Operations/SRE** → runbooks
- **Tech leads** → ADRs, RFCs
- **Usuarios finales** → user guides, FAQs
- **Auditores** → security docs, compliance

Cada audiencia tiene contexto, lenguaje y profundidad diferente.

### 4. Bilingüe pragmático

- Detectar el idioma del proyecto/repo y mantenerlo consistente
- Si el equipo es bilingüe: docs en inglés por default (más universal)
- Documentación pública/marketing: idioma del usuario final
- Comentarios en código: idioma del equipo (consistencia)
- Si el usuario pide explícitamente uno u otro, respetar

### 5. Documentación viva

Documentación desactualizada es **peor** que no documentación (genera confianza falsa). Estrategias:

- **Tests verificables** (executable docs, doctests)
- **Generación desde código** cuando aplica (OpenAPI desde anotaciones, JSDoc → web)
- **Ownership claro** (quién mantiene este doc)
- **Revisión periódica** (linkear a calendar de review)
- **Cerca del código** (docs en mismo repo > docs en sistema separado)

### 6. Diagramas con propósito

Un diagrama vale mil palabras solo si **clarifica**. Si lo agregás "porque sí", agrega ruido.

- **Mermaid** para flowcharts, sequence, ER, state, gantt (rendered en GitHub/GitLab/Docusaurus/etc.)
- **PlantUML** para diagramas UML completos
- **Excalidraw** para sketches conceptuales
- **Figma** para diagramas pulidos (integrar con skill `figma-workflow`)

Ver `references/diagrams.md`.

## Decisión rápida: ¿qué documento crear?

| Necesidad | Documento | Ubicación típica |
|---|---|---|
| Nuevo dev entiende el proyecto en 15 min | README + ARCHITECTURE | Raíz del repo |
| Setup local del proyecto | README "Getting Started" o CONTRIBUTING | Raíz del repo |
| Documentar API REST | OpenAPI + ejemplos | `/docs/api/` o auto-generado |
| Documentar librería/SDK | API reference + tutoriales | Sitio dedicado (Docusaurus, MkDocs) |
| Justificar decisión técnica | ADR | `/docs/adr/` |
| Proponer cambio grande | RFC | `/docs/rfc/` o GitHub discussion |
| Resolver incidente en producción | Runbook | Confluence, repo, o herramienta IR |
| Análisis post-incidente | Postmortem | Confluence o `/docs/postmortems/` |
| Onboarding de nuevos miembros | Onboarding guide | Confluence/Notion |
| Tutorial para usuarios externos | Tutorial (Diátaxis) | Sitio público de docs |
| Resolver problema específico | How-to | Sitio público de docs |
| Lista de cambios entre versiones | CHANGELOG | Raíz del repo |
| Cómo contribuir | CONTRIBUTING.md | Raíz del repo |
| Términos del proyecto/dominio | Glossary | `/docs/glossary.md` |

## Flujos de trabajo

### Flujo A — "Documenta este proyecto / repo"

1. **Inventory**: explorar repo (estructura, lenguajes, frameworks)
2. **Identificar audiencia(s)** y qué necesitan saber
3. **Priorizar documentos** según valor:
   - README (siempre, prioridad 1)
   - CONTRIBUTING (si es open source o equipo > 3)
   - ARCHITECTURE (si arquitectura no trivial)
   - API docs (si expone API)
   - Runbook (si tiene componente operativo)
4. **Crear borrador** de cada uno con plantillas (ver `references/templates/`)
5. **Iterar** con feedback del usuario

### Flujo B — "Escribe README"

1. Identificar tipo de proyecto (app, librería, CLI, servicio)
2. Aplicar plantilla apropiada (ver `references/readme-templates.md`)
3. Asegurar elementos clave:
   - **One-liner**: qué hace en 1 frase
   - **Why**: por qué existe
   - **Quick start**: cómo correrlo en < 5 min
   - **Docs**: dónde encontrar más
4. NO incluir: historia del proyecto, decisiones detalladas, troubleshooting completo (linkear a docs)

### Flujo C — "Documenta esta API"

1. Identificar paradigma (REST, GraphQL, RPC, eventos)
2. Generar/escribir spec OpenAPI (REST) o Schema (GraphQL)
3. Asegurar elementos clave:
   - Autenticación clara
   - Ejemplos de request/response REALES (no `{ "key": "value" }`)
   - Errores documentados con códigos
   - Rate limits y paginación
   - Versionado claro
   - Changelog de la API
4. Generar render legible (Swagger UI, Redoc, Stoplight)

Ver `references/api-documentation.md`.

### Flujo D — "Necesito un ADR"

1. Identificar decisión que se está tomando
2. Aplicar plantilla ADR (Michael Nygard format o MADR)
3. Documentar: contexto, opciones, decisión, consecuencias
4. **Status** claro: proposed → accepted → superseded
5. Numerar secuencialmente
6. Vincular ADRs relacionados

Ver `references/adrs-rfcs.md`.

### Flujo E — "Necesito un runbook / postmortem"

1. Para runbook: identificar escenario y pasos repetibles
2. Para postmortem: blameless, timeline, root cause, action items
3. Plantillas en `references/operational-docs.md`
4. Integrar con `web-backend-security` para incident response

### Flujo F — "Audita la documentación existente"

1. Aplicar checklist (ver `references/doc-audit.md`):
   - ¿README funcional?
   - ¿Setup local reproducible?
   - ¿API docs sincronizadas con el código?
   - ¿Diagramas presentes y actualizados?
   - ¿ADRs para decisiones importantes?
   - ¿Runbooks para incidentes comunes?
   - ¿Onboarding claro?
2. Reportar gaps con prioridad
3. Plan de acción

### Flujo G — "Diseña la estructura de docs para mi proyecto"

1. Identificar audiencias y casos de uso
2. Aplicar Diátaxis para organizar
3. Elegir herramienta apropiada (`references/tooling.md`)
4. Generar scaffold inicial

## Decisión rápida: herramienta de docs

| Caso | Herramienta recomendada |
|---|---|
| **README en repo** | Markdown plano (GitHub/GitLab renderiza) |
| **Docs de proyecto interno** | Markdown en `/docs/` del repo |
| **API REST pública** | OpenAPI + Swagger UI / Redoc |
| **API REST interna** | OpenAPI + Swagger UI |
| **Librería open source** | Docusaurus (React) o MkDocs Material (Python) |
| **Sitio de docs estilo Read the Docs** | Sphinx + RTD theme |
| **Wiki corporativo** | Confluence o Notion |
| **Docs personales o equipo chico** | Notion u Obsidian |
| **API docs auto-generadas** | OpenAPI/swagger-ui desde código |

Detalles en `references/tooling.md`.

## Anatomía de un buen documento

### Estructura universal

```
1. Título claro (qué es)
2. One-liner (qué hace / por qué importa)
3. TL;DR o resumen (si es largo)
4. Tabla de contenidos (si > 3 secciones)
5. Contenido organizado en secciones cortas
6. Ejemplos concretos (no abstractos)
7. Próximos pasos / links a docs relacionados
```

### Headings: jerarquía clara

- **H1**: solo uno por documento (el título)
- **H2**: secciones principales
- **H3**: subsecciones
- **H4+**: usar muy poco, idealmente nunca

Si necesitas H5+, considerá dividir el doc.

### Code blocks: contexto y comentarios

```
❌ MAL:
\`\`\`bash
npm install foo
\`\`\`

✅ BIEN:
Instalación con npm (desde la raíz del proyecto):

\`\`\`bash
npm install --save-dev @company/foo
\`\`\`
```

Incluir:
- Lenguaje en el code block (sintaxis highlighting)
- Comando completo (no truncado)
- Output esperado cuando relevante
- Comentarios cortos si el código no es obvio

### Listas vs prosa

- **Pasos secuenciales** → lista numerada
- **Items sin orden inherente** → lista con bullets
- **Pocos items o flujo continuo** → prosa
- **No abusar**: 3+ niveles de bullets anidados es señal de mal modelo mental

### Links

- Link text descriptivo: ❌ "click [here](...)" → ✅ "ver [API reference](...)"
- Links rotos = pérdida de confianza. Verificar periódicamente con linkchecker
- Links internos relativos (no absolutos al dominio) — facilita renombrar

### Negativos a evitar

- ❌ "It's easy", "simply", "just" (condescendiente o mentira)
- ❌ "Obviously", "of course" (asume conocimiento)
- ❌ "Recently", "soon", "new" (envejece mal)
- ❌ Pasiva sin agente ("es recomendado") → activa ("recomendamos")
- ❌ "TODO", "TBD" en docs publicados
- ❌ Screenshots sin texto alternativo
- ❌ Diagramas como imágenes binarias (preferir Mermaid/PlantUML que es texto versionable)

## Standards y convenciones

### README

Estructura mínima:
```markdown
# Project Name

> One-liner: qué hace.

## Why

Por qué existe (1-2 párrafos).

## Quick Start

\`\`\`bash
# 3-5 comandos para correrlo
\`\`\`

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](https://...)
- [Contributing](CONTRIBUTING.md)

## License

MIT (or whatever)
```

Plantillas completas en `references/readme-templates.md`.

### CHANGELOG

Seguir [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ...

### Changed
- ...

### Fixed
- ...

## [1.2.0] - 2026-05-19

### Added
- New endpoint `/api/v1/orders/bulk`
```

Tipos: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

### CONTRIBUTING.md

Cómo contribuir. Incluir:
- Setup local
- Cómo correr tests
- Style guide o linter
- Cómo proponer cambios (PR template, issue template)
- Code of conduct (link)

### Semantic Versioning

`MAJOR.MINOR.PATCH`:
- **MAJOR**: breaking changes
- **MINOR**: nuevas features compatibles
- **PATCH**: bug fixes compatibles

Documentar breaking changes en CHANGELOG explícitamente.

## Plantillas (en references/)

- `templates/readme-app.md` — README para aplicación
- `templates/readme-library.md` — README para librería/SDK
- `templates/readme-cli.md` — README para CLI tool
- `templates/adr.md` — Architecture Decision Record
- `templates/rfc.md` — Request For Comments
- `templates/runbook.md` — Runbook operativo
- `templates/postmortem.md` — Postmortem blameless
- `templates/onboarding.md` — Onboarding guide
- `templates/api-endpoint.md` — Documentar un endpoint
- `templates/changelog.md` — CHANGELOG.md inicial
- `templates/contributing.md` — CONTRIBUTING.md

## Bilingüe: estrategias

### ¿Cuándo en español, cuándo en inglés?

- **Open source público / SDK público**: inglés siempre
- **APIs públicas**: inglés (cliente puede ser cualquier país)
- **Proyectos internos LATAM**: español
- **Equipos bilingües**: inglés por default (consistencia, retención de conocimiento)
- **Comentarios en código**: idioma del equipo (consistencia importa más que idioma)
- **CHANGELOG**: mismo idioma que el resto

### Si necesitas ambos

Opciones:
1. **Sitio bilingüe**: Docusaurus o MkDocs con i18n
2. **Carpetas separadas**: `/docs/en/` y `/docs/es/`
3. **Sufijos**: `README.md` (inglés) + `README.es.md` (español)

⚠️ **Trampa**: mantener dos versiones es 2x el trabajo. Si no tienes recursos para mantener ambas, una sola es mejor que dos desactualizadas.

## Anti-patterns

- ❌ **README de 5000 líneas**: dividir en docs múltiples
- ❌ **Docs sin ejemplos**: code > prosa para devs
- ❌ **API docs sin ejemplos reales** (`{ "field": "value" }` no enseña nada)
- ❌ **Diagramas como PNGs sin source**: imposible actualizar
- ❌ **Diagramas que muestran TODO**: si tiene 50 cajas, no comunica
- ❌ **Lorem ipsum o placeholders en docs publicados**
- ❌ **TODO/FIXME sin asignar dueño y fecha**
- ❌ **Docs en sistema cerrado** (Word docs en Drive) cuando el equipo trabaja en código
- ❌ **Versionado de docs separado del código** (deriva inevitable)
- ❌ **"Self-documenting code"**: el código muestra el cómo, no el por qué
- ❌ **Cada feature con doc nuevo sin estrategia**: docs incoherentes
- ❌ **Comentarios que repiten el código** (`// increment i` antes de `i++`)
- ❌ **Mezclar tipos Diátaxis en un solo doc**: tutorial + reference + how-to → confuso

## Lo que NUNCA hay que hacer

- ❌ Publicar docs con TODO/TBD/FIXME visibles
- ❌ Documentar features que no existen ("aspirational docs")
- ❌ Copiar docs de otros proyectos sin adaptación
- ❌ Incluir secrets, IPs internas, datos de prod en ejemplos
- ❌ Hacer docs internos visibles públicamente sin revisar
- ❌ Decir "será fácil" o "obviamente" (condescendiente)
- ❌ Asumir conocimiento sin declararlo (audiencia clara)
- ❌ Documentación que requiere docs para entender la docs (meta-confusión)
- ❌ Mezclar idiomas en un mismo documento

## Output esperado

Según el flujo:

### Si es nuevo README
- Archivo `README.md` listo para commit
- Con plantilla apropiada según tipo de proyecto
- Quick start verificable
- Links a otros docs

### Si es ADR/RFC
- Archivo numerado en `/docs/adr/` o `/docs/rfc/`
- Status claro (proposed/accepted)
- Plantilla completa con contexto, opciones, decisión

### Si es API docs
- OpenAPI spec o equivalente
- Ejemplos reales (no placeholders)
- Errores documentados
- Render preview (Swagger UI / Redoc)

### Si es runbook
- Pasos atómicos y verificables
- Pre-requisitos claros
- Comandos copy-pasteables
- Verificación post-acción
- Cuándo escalar

### Si es estructura de docs completa
- Tree de directorios sugerido
- Plantillas de cada tipo
- Recomendación de herramienta
- Plan de migración si hay docs viejas

## Referencias

- `references/diataxis-framework.md` — Tutorial/How-to/Reference/Explanation en detalle
- `references/readme-templates.md` — Plantillas README por tipo de proyecto
- `references/api-documentation.md` — OpenAPI, ejemplos, Swagger UI, Postman, GraphQL
- `references/adrs-rfcs.md` — Architecture Decision Records y RFCs
- `references/operational-docs.md` — Runbooks, postmortems, on-call docs
- `references/diagrams.md` — Mermaid, PlantUML, cuándo y cómo
- `references/code-comments.md` — Cuándo sí comentar, cuándo no, JSDoc/Javadoc/docstrings
- `references/tooling.md` — MkDocs, Docusaurus, Sphinx, Confluence, Notion
- `references/style-guide.md` — Voz, tono, convenciones gramaticales bilingües
- `references/doc-audit.md` — Checklist para auditar documentación existente
- `references/templates/` — Plantillas listas para copiar
