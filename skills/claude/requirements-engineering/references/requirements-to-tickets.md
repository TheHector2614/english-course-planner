# De Requisitos a Trabajo Ejecutable

Descomposición épica→historia→tarea, vertical slicing, Definition of Ready/Done, estimación, mapeo a herramientas (Jira, GitHub, Linear).

## El objetivo

Convertir requisitos (PRD, SRS, historias) en unidades de trabajo que el equipo pueda tomar, estimar y completar en un sprint. El puente entre "qué queremos" y "qué hace el equipo esta semana".

## Jerarquía de descomposición

```
Iniciativa / Tema       (objetivo estratégico, meses/trimestres)
   └── Épica            (bloque grande de una feature, varios sprints)
         └── Historia   (unidad de valor, cabe en un sprint)
               └── Tarea (paso técnico, horas/días)
```

Ejemplo:
```
Iniciativa: Reducir abandono en onboarding
└── Épica: Gestión de cuenta
      ├── Historia: Registro con email
      │     ├── Tarea: Endpoint de registro
      │     ├── Tarea: Validación de email
      │     ├── Tarea: UI del formulario
      │     └── Tarea: Tests
      ├── Historia: Login social con Google
      └── Historia: Recuperación de contraseña
```

## Del PRD/SRS a épicas e historias

1. **Identificar épicas**: los grandes bloques del PRD (cada sección funcional grande)
2. **Derivar historias**: descomponer cada épica en unidades de valor (ver `user-stories.md`)
3. **Vertical slicing**: cada historia entrega valor end-to-end (no por capas)
4. **Criterios de aceptación**: por historia (ver `user-stories.md`)
5. **Tareas**: pasos técnicos dentro de cada historia (las define el equipo)

## Vertical slicing (clave)

Cada historia debe atravesar todas las capas y entregar valor observable, no ser una capa horizontal.

```
❌ Horizontal (por capa — no entrega valor por separado):
   Historia 1: Crear todas las tablas de la DB
   Historia 2: Crear todos los endpoints
   Historia 3: Crear toda la UI
   (hasta terminar las 3, el usuario no tiene nada usable)

✅ Vertical (por funcionalidad — cada una entrega valor):
   Historia 1: Ver lista de productos (DB + API + UI mínimos para esto)
   Historia 2: Buscar productos
   Historia 3: Filtrar por categoría
   (cada historia, al terminar, da algo usable y demostrable)
```

Beneficios del slice vertical: feedback temprano, valor incremental, se puede priorizar y soltar parte sin romper.

## Estimación

### Story points (relativo)

Estimar tamaño relativo, no tiempo absoluto. Escala común: Fibonacci (1, 2, 3, 5, 8, 13, 21).
- Compara complejidad/esfuerzo/incertidumbre entre historias
- 13+ suele indicar que hay que dividir
- Velocity (puntos por sprint) ayuda a planificar

### Tallas de camiseta (T-shirt sizing)

XS, S, M, L, XL. Más cualitativo, útil para épicas o estimación temprana.

### Planning poker

El equipo estima en conjunto (cartas simultáneas) para evitar anclaje y aprovechar distintas perspectivas.

⚠️ La estimación es para planificar, no un compromiso contractual ni una medida de productividad individual. No comparar velocity entre equipos.

## Definition of Ready (DoR)

Una historia está **lista para tomarse** cuando cumple criterios acordados. Evita empezar trabajo mal definido.

```
Definition of Ready (ejemplo):
- [ ] Historia con formato claro (rol/acción/valor)
- [ ] Criterios de aceptación definidos y testeables
- [ ] Dependencias identificadas y resueltas (o desbloqueadas)
- [ ] Diseño/mockups disponibles (si aplica)
- [ ] Estimada por el equipo
- [ ] Cabe en un sprint (si no, dividir)
- [ ] Sin preguntas abiertas bloqueantes
```

## Definition of Done (DoD)

Una historia está **terminada** cuando cumple criterios acordados. Evita el "casi terminado" eterno y la deuda oculta.

```
Definition of Done (ejemplo):
- [ ] Código implementado según criterios de aceptación
- [ ] Code review aprobado y mergeado (ver git-workflows)
- [ ] Tests escritos y pasando (unit + los de criterios de aceptación)
- [ ] Cobertura cumple el umbral del equipo
- [ ] NFRs aplicables cumplidos (ver non-functional.md)
- [ ] Documentación actualizada (ver technical-docs)
- [ ] Sin regresiones
- [ ] Desplegado en staging/prod (según el equipo)
- [ ] Criterios de aceptación verificados (demo/QA)
```

La DoR y la DoD son **acuerdos del equipo**, se adaptan a su contexto y madurez. Hacerlas visibles.

## Criterios de aceptación → tests

Los criterios de aceptación (especialmente en Gherkin) se mapean a tests:

```gherkin
Scenario: Reset con email válido
  Given un usuario registrado
  When solicita reset de contraseña
  Then recibe un email con link válido por 1h
```
→ test automatizado (Cucumber/pytest-bdd) que verifica exactamente eso. El criterio **es** la especificación del test (BDD). Para testing en profundidad, ver skills de testing/backend.

## Mapeo a herramientas

### Jira
```
Epic → Story → Sub-task
- Story points en el campo de estimación
- Criterios de aceptación en la descripción o campo dedicado
- Linkear a la épica; épica al objetivo/iniciativa
- Estados: To Do → In Progress → In Review → Done
- Etiquetas para NFRs, deuda técnica, etc.
```

### GitHub Issues / Projects
```
- Issue por historia; checklist de tareas (- [ ]) dentro
- Labels: epic, story, bug, tech-debt, priority
- Milestones para releases
- Projects (tablero) para el flujo
- PRs referencian el issue (Closes #123) → trazabilidad automática
```

### Linear
```
- Project → Issue → Sub-issue
- Cycles (sprints)
- Estimación integrada
- Relaciona con iniciativas/roadmap
```

### Azure DevOps Boards
```
Epic → Feature → User Story → Task
- Trazabilidad nativa con el código (commits/PRs)
```

### Buenas prácticas transversales
- **Linkear** siempre a la épica/objetivo (trazabilidad → `management.md`)
- **Referenciar el ticket** en commits/PRs (`#123`) → traza código↔requisito
- **Criterios de aceptación** visibles en el ticket
- **Un ticket = una historia/tarea** (no acumular)
- **Estados claros** y consistentes

## Granularidad: ¿qué tan chico?

```
Épica:    no cabe en un sprint → dividir en historias
Historia: cabe en un sprint (idealmente unos días) → si es 13+ puntos, dividir
Tarea:    horas a 1-2 días → si más, dividir
```

Señales de que algo es demasiado grande:
- No se puede estimar
- No cabe en un sprint
- Tiene muchos "y" en los criterios
- Toca muchas áreas no relacionadas

→ Dividir (story splitting, ver `user-stories.md`).

## Trabajo que no es una historia

No forzar todo a "Como usuario...":
- **Bugs**: pasos para reproducir + comportamiento esperado vs actual
- **Tareas técnicas / enablers**: refactor, upgrade, infra (linkear a la historia que habilitan, o ítem técnico)
- **Spikes**: investigación time-boxed para reducir incertidumbre antes de estimar
- **Deuda técnica**: visible en el backlog, no escondida

Reservar capacidad por sprint para esto (algunos equipos: ~20%).

## Flujo completo: de PRD a sprint

```
PRD (qué y por qué)
  │
  ├─► Identificar épicas (bloques grandes)
  │
  ├─► Descomponer en historias (vertical slices con valor)
  │
  ├─► Criterios de aceptación por historia (Gherkin/lista)
  │
  ├─► Priorizar (MoSCoW/WSJF → management.md)
  │
  ├─► Verificar Definition of Ready
  │
  ├─► Estimar (planning poker)
  │
  ├─► Al sprint → tareas técnicas (las define el equipo)
  │
  └─► Definition of Done para cerrar
```

## Anti-patterns

- ❌ Slices horizontales (por capa, sin valor independiente)
- ❌ Historias sin criterios de aceptación
- ❌ Empezar historias que no cumplen Definition of Ready
- ❌ Sin Definition of Done (deuda oculta, "casi listo")
- ❌ Historias demasiado grandes (no caben en sprint)
- ❌ Estimación como compromiso/medida de productividad
- ❌ Comparar velocity entre equipos
- ❌ Forzar todo a user story (bugs, tareas técnicas)
- ❌ Tickets sin linkear a épica/objetivo (sin trazabilidad)
- ❌ Esconder deuda técnica (no entra al backlog)
- ❌ Acumular varias historias en un ticket

## Checklist: requisito → ejecutable

- [ ] Épicas identificadas desde el PRD/SRS
- [ ] Historias derivadas (vertical slices con valor)
- [ ] Criterios de aceptación por historia (testeables)
- [ ] Historias priorizadas (ver management.md)
- [ ] Cada historia cumple Definition of Ready
- [ ] Estimadas (story points/tallas)
- [ ] Definition of Done acordada
- [ ] Mapeadas a la herramienta (Jira/GitHub/Linear)
- [ ] Linkeadas a épica/objetivo (trazabilidad)
- [ ] Bugs/tareas técnicas/spikes contemplados
- [ ] Criterios → tests (BDD donde aplique)
