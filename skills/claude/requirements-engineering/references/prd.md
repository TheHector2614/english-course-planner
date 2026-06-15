# PRD (Product Requirements Document)

Documento de requisitos de producto: estructura, plantilla, cuándo usarlo. El artefacto central en software de producto.

## Qué es un PRD

Un PRD define **qué** se va a construir y **por qué**, desde la perspectiva del producto. Es el puente entre la estrategia (por qué importa) y la ejecución (qué hace el equipo). Más ligero que un SRS, más completo que una historia suelta.

Audiencia: equipo de producto, ingeniería, diseño, stakeholders. Debe ser entendible por técnicos y no técnicos.

## PRD vs otros documentos

| Documento | Foco | Audiencia |
|---|---|---|
| **PRD** | Qué construir y por qué (producto) | Producto, ingeniería, diseño |
| **BRD** | Objetivos de negocio (por qué) | Ejecutivos, sponsors |
| **MRD** | Mercado y oportunidad | Marketing, producto |
| **SRS** | Especificación de sistema (qué, detallado) | Ingeniería (formal) |
| **Epic/Story** | Unidad de trabajo ágil | Equipo de desarrollo |

En muchas empresas de producto, el PRD reemplaza a BRD+SRS. Suele descomponerse luego en épicas e historias (ver `requirements-to-tickets.md`).

## Estructura de un PRD

No hay un formato único, pero un buen PRD cubre:

```
# PRD: [Nombre de la feature/producto]

Estado: [Draft | En revisión | Aprobado]
Autor: [nombre]    Fecha: [fecha]    Versión: [x.y]
Stakeholders: [PM, tech lead, diseño, ...]

## 1. Resumen (TL;DR)
Un párrafo: qué es, para quién, por qué. Lo que leería alguien con prisa.

## 2. Problema
- ¿Qué problema resolvemos?
- ¿Para quién? (usuarios/segmento)
- ¿Por qué importa? (impacto, evidencia: datos, research, tickets)
- ¿Por qué ahora?

## 3. Objetivos y métricas de éxito
- Objetivos (qué queremos lograr)
- Métricas/KPIs: cómo sabremos que funcionó
  - Métrica primaria: [ej: -30% tickets de soporte sobre login]
  - Métricas secundarias / guardrails
- No-objetivos (qué explícitamente NO buscamos)

## 4. Usuarios y casos de uso
- Personas/segmentos afectados
- Escenarios de uso principales (user journeys)

## 5. Requisitos
### Funcionales (priorizados)
- [Must] El usuario puede...
- [Should] El usuario puede...
- [Could] ...
(Ver criterios de aceptación en las historias derivadas)

### No funcionales
- Performance, seguridad, etc. (ver non-functional.md)

## 6. Alcance
### Dentro de alcance (esta versión)
- ...
### Fuera de alcance (out of scope) — explícito
- ... (qué NO se hace y por qué)
### Futuro (later)
- Ideas para próximas iteraciones

## 7. Diseño / UX
- Wireframes, mockups, flujos (link a Figma → figma-workflow)
- Estados (vacío, carga, error, éxito)

## 8. Dependencias, riesgos y supuestos
- Dependencias (otros equipos, sistemas, terceros)
- Riesgos (y mitigación)
- Supuestos (a validar)

## 9. Lanzamiento
- Plan de rollout (fases, feature flags → devops)
- Métricas a monitorear post-launch
- Plan de comunicación

## 10. Preguntas abiertas
- [ ] Pendiente de decidir...
```

## Secciones críticas (las que más se descuidan)

### Problema antes que solución

El error más común: saltar a la solución. Un buen PRD dedica tiempo a **articular el problema** con evidencia antes de proponer qué construir. Si el problema no está claro, la solución será arbitraria.

```
❌ "Vamos a agregar login con Google"
✅ "El 40% de los usuarios abandona en el registro (dato de analytics).
    Las entrevistas muestran fricción al crear otra contraseña.
    → Hipótesis: login social reduce el abandono."
```

### Métricas de éxito

Sin métricas, no sabés si funcionó. Definir **antes** de construir:
- **Primaria**: la que mide el objetivo principal
- **Guardrails**: métricas que NO deben empeorar (ej: no aumentar fraude)

```
Objetivo: reducir abandono en registro
Métrica primaria: tasa de completitud de registro (de 60% a ≥75%)
Guardrail: tasa de cuentas fraudulentas no aumenta
```

### Out of scope explícito

Decir qué **NO** se hace evita malentendidos y scope creep. Tan importante como decir qué sí.

### No-objetivos

Diferente de out of scope: son metas que explícitamente NO se persiguen ("no buscamos mejorar la retención con esto, solo la activación").

## Niveles de detalle según contexto

- **Lightweight PRD** (1-2 páginas): startups, features chicas, equipos ágiles. Problema + objetivos + requisitos clave + alcance.
- **PRD completo**: features grandes, múltiples equipos, mayor riesgo.
- **One-pager / pitch**: para validar antes de invertir en el PRD completo.

Empezar ligero y profundizar si la feature lo amerita. Un PRD de 40 páginas que nadie lee es peor que uno de 2 que todos entienden.

## El PRD es vivo

Un PRD no es un documento que se escribe una vez y se congela:
- Se versiona (cambios registrados)
- Las preguntas abiertas se van cerrando
- Se actualiza si el contexto cambia
- Post-launch: se compara lo prometido con lo medido

## Del PRD al backlog

El PRD se descompone:
```
PRD
 └── Épicas (grandes bloques de la feature)
       └── Historias (ver user-stories.md)
             └── Tareas
```

Ver `requirements-to-tickets.md` para la descomposición.

## Buenas prácticas

- **Problema primero**, con evidencia (datos, research)
- **Métricas de éxito** medibles, definidas antes
- **Out of scope** y **no-objetivos** explícitos
- **Priorización** de requisitos (MoSCoW → `management.md`)
- **Colaborativo**: revisado por ingeniería y diseño antes de aprobar
- **Conciso**: tan largo como necesario, tan corto como posible
- **Links, no copias**: enlazar a Figma, research, métricas (no duplicar)
- **Preguntas abiertas** visibles (no esconder la incertidumbre)

## Anti-patterns

- ❌ Solución sin problema claro
- ❌ Sin métricas de éxito (no sabrás si funcionó)
- ❌ Sin out of scope (scope creep asegurado)
- ❌ Requisitos sin priorizar (todo crítico)
- ❌ PRD gigante que nadie lee
- ❌ Especificar el cómo (implementación) en lugar del qué
- ❌ Escribirlo en aislamiento (sin input de ingeniería/diseño)
- ❌ Congelarlo (no actualizarlo cuando cambia el contexto)
- ❌ Copiar contenido de otras fuentes en vez de enlazar
- ❌ Confundir PRD (producto) con SRS (sistema, formal)

## Checklist PRD

- [ ] TL;DR claro (un párrafo)
- [ ] Problema articulado con evidencia
- [ ] Para quién (usuarios/segmento)
- [ ] Objetivos + métricas de éxito medibles
- [ ] No-objetivos explícitos
- [ ] Requisitos funcionales priorizados (MoSCoW)
- [ ] Requisitos no funcionales (ver non-functional.md)
- [ ] Dentro de alcance / fuera de alcance
- [ ] Diseño/UX enlazado (Figma)
- [ ] Dependencias, riesgos, supuestos
- [ ] Plan de lanzamiento y métricas a monitorear
- [ ] Preguntas abiertas listadas
- [ ] Revisado por ingeniería y diseño
- [ ] Versionado
