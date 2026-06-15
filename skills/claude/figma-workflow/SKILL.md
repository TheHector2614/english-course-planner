---
name: figma-workflow
description: Workflow completo Figma-to-Production - lee diseños de Figma, audita inconsistencias, extrae design tokens (Tailwind, CSS vars, JSON/TS, SCSS, Style Dictionary), convierte diseños a código (Angular, Astro, Next.js, HTML+Tailwind) y genera documentación de componentes. Activa esta skill SIEMPRE que el usuario comparta un link de Figma (figma.com/file, figma.com/design, figma.com/board), mencione "Figma", "diseño en Figma", "convertir diseño a código", "design tokens", "extraer del diseño", "auditar diseño", "design-to-code", "implementar el mockup", "design system de Figma", "variables de Figma", o cualquier tarea que involucre usar Figma como fuente de verdad para código. También cuando pida crear diagramas o flujos en FigJam, o modificar/anotar archivos de Figma.
---

# Figma Workflow

Skill para el flujo completo de trabajo con Figma: leer diseños, auditar consistencia, extraer tokens, convertir a código y documentar.

## Herramientas disponibles (Figma MCP)

Esta skill se apoya en las herramientas MCP de Figma ya conectadas. Las principales:

- **`Figma:whoami`** — verificar conexión y usuario actual
- **`Figma:get_design_context`** — obtener contexto completo de un nodo (estructura, estilos, texto). **PREFERIDA** para extraer info de un diseño
- **`Figma:get_metadata`** — metadata básica (usar solo si `get_design_context` es excesivo)
- **`Figma:get_screenshot`** — captura visual de un nodo o de la selección actual
- **`Figma:get_variable_defs`** — definiciones de variables (colores, espaciados, tipografía)
- **`Figma:search_design_system`** — buscar componentes/variables/styles en el design system
- **`Figma:get_libraries`** — librerías asociadas al archivo
- **`Figma:get_context_for_code_connect`** — metadata estructurada de componentes (props, variantes)
- **`Figma:get_code_connect_map`** / **`add_code_connect_map`** — mapear nodos Figma ↔ componentes de código
- **`Figma:use_figma`** — crear/editar diseños en Figma (USAR CON CONFIRMACIÓN)
- **`Figma:create_new_file`** — crear archivo nuevo
- **`Figma:generate_diagram`** — diagramas FigJam (Mermaid → FigJam)
- **`Figma:upload_assets`** — subir imágenes/assets al archivo
- **`Figma:get_figjam`** — generar código UI a partir de un nodo FigJam

### Cómo identificar un link de Figma

```
figma.com/design/{fileKey}/{name}?node-id={nodeId}     ← archivo de diseño
figma.com/board/{fileKey}/{name}?node-id={nodeId}      ← archivo FigJam
figma.com/file/{fileKey}/{name}?node-id={nodeId}       ← URL legacy de diseño
```

Extraer **`fileKey`** y **`node-id`** del URL para pasarlos a las herramientas.

## Regla crítica: modificar Figma requiere confirmación

**Cualquier acción que cree, modifique o reorganice algo en Figma (use_figma, create_new_file, upload_assets, generate_diagram, add_code_connect_map) requiere confirmación explícita del usuario antes de ejecutarse.**

Patrón a seguir:
1. Describir qué se va a hacer en Figma (qué archivo, qué nodos, qué cambios)
2. Esperar confirmación del usuario ("sí", "adelante", "procede")
3. Ejecutar la acción
4. Mostrar resultado y siguiente paso propuesto

Para acciones de **solo lectura** (get_design_context, get_variable_defs, search_design_system, get_screenshot, etc.) NO se requiere confirmación.

## Flujo de trabajo estándar (Figma-to-Production)

Cuando el usuario comparta un link de Figma o pida convertir un diseño, seguir estos pasos:

### Paso 1: Reconocimiento

1. Extraer `fileKey` y `node-id` del URL
2. Llamar `Figma:get_design_context` con esos parámetros
3. Llamar `Figma:get_screenshot` para tener referencia visual
4. Resumir al usuario qué se encontró: tipo de pantalla/componente, dimensiones, estructura general

### Paso 2: Detección del design system

1. Llamar `Figma:get_libraries` para ver si el archivo está conectado a librerías
2. Llamar `Figma:get_variable_defs` para extraer tokens (colores, espaciados, tipografía)
3. Si hay componentes referenciados, llamar `Figma:search_design_system` para entender qué hay disponible
4. Si hay `code_connect_map`, llamar `Figma:get_code_connect_map` para ver mapeos existentes

### Paso 3: Auditoría/QA del diseño (ANTES de codear)

Revisar el diseño en busca de inconsistencias. Consultar `references/audit-checklist.md` para el checklist completo. Reportar al usuario:

- **Colores fuera del sistema**: valores hex que no corresponden a una variable
- **Tipografías mezcladas**: fuentes o tamaños que no están en el sistema
- **Espaciados no estándar**: paddings/margins que no usan los tokens de espaciado
- **Auto Layout faltante** en frames donde debería haberlo
- **Componentes desvinculados** (instances detached que deberían usar el componente)
- **Accesibilidad**: contraste de texto (calcular ratio WCAG AA mínimo 4.5:1 para texto normal, 3:1 para grande)
- **Texto hardcoded** que debería ser variable de contenido
- **Imágenes sin nombre descriptivo** (afecta el `alt` en código)

Presentar la auditoría al usuario y **preguntar si quiere corregir los issues en Figma** antes de codear, codear "as is", o decidir caso por caso.

### Paso 4: Extracción de tokens

Detectar qué formato necesita el usuario (preguntar si no es claro). Generar tokens en uno o varios formatos. Consultar `references/token-formats.md` para plantillas completas:

- **Tailwind**: `tailwind.config.mjs` con `theme.extend`
- **CSS Variables**: archivo `.css` con `:root { --token: value; }`
- **JSON/TS**: archivo de tokens tipado
- **SCSS**: archivo `_tokens.scss` con variables y mixins
- **Style Dictionary**: estructura `tokens/` con builds multi-plataforma

Si el archivo tiene **modes de variables** (light/dark, brand A/B), generar los tokens respetando esos modes.

### Paso 5: Decidir framework de salida

Si el usuario no especificó framework, **preguntar**:
- Angular (usa skill `angular-dev`)
- Astro (usa skill `landing-pages-astro` si es landing/marketing)
- Next.js / React
- HTML + Tailwind puro

Si ya hay un proyecto activo o contexto claro (ej: usuario está trabajando en un repo Angular), asumir ese y confirmar.

### Paso 6: Generación de código

Convertir el diseño aplicando las convenciones del framework objetivo. Consultar `references/design-to-code.md` para reglas detalladas de mapeo. Reglas básicas:

- **Cada frame con Auto Layout** → componente o sección con flexbox/grid
- **Cada componente Figma con variantes** → componente con props/inputs tipados (`variant`, `size`, `state`)
- **Texto** → respetar jerarquía semántica (h1/h2/p) según el rol del nodo (heading, body, caption)
- **Imágenes** → optimización del framework (`<Image>` de astro:assets, `NgOptimizedImage`, `next/image`)
- **Iconos vectoriales** → SVG inline o librería de iconos (lucide, heroicons)
- **Espaciados** → usar tokens, nunca valores hardcoded
- **Colores** → usar variables/tokens, nunca hex inline
- **Responsive**: si el diseño tiene múltiples frames por breakpoint, generar mobile-first con `sm/md/lg/xl`. Si solo hay desktop, aplicar mobile-first inferido (consultar al usuario en casos ambiguos)

### Paso 7: Code Connect (opcional)

Si el usuario quiere vincular el componente generado al nodo de Figma (para que aparezca el código en Dev Mode):

1. Llamar `Figma:get_code_connect_suggestions` para ver estrategia recomendada
2. **Pedir confirmación** ("¿Mapeo este componente Figma a `Button.tsx`?")
3. Llamar `Figma:add_code_connect_map` con el path del componente y el nodeId

### Paso 8: Documentación

Si el usuario lo pide o si es un componente del design system, generar documentación. Consultar `references/component-docs.md` para plantilla. Incluir:

- Nombre del componente
- Descripción
- Props/inputs (tipos, defaults, opcionales)
- Variantes disponibles
- Ejemplos de uso (snippet de código)
- Link al frame de Figma

Formato preferido: **MDX** para Storybook, o **README.md** dentro de la carpeta del componente.

## Comandos típicos y cómo responder

### "Convierte este diseño a código: [link]"
→ Ejecutar el flujo completo (pasos 1-6). Antes del paso 6 confirmar framework.

### "Extrae los tokens de este archivo: [link]"
→ Pasos 1-2 + Paso 4. Preguntar formato si no es claro.

### "Audita este diseño: [link]"
→ Pasos 1-3. Reportar issues sin generar código.

### "Implementa este botón en Angular: [link]"
→ Pasos 1-2 + Paso 6 directo (framework ya especificado). Auditoría rápida solo si hay issues evidentes.

### "Crea un diagrama de flujo de [proceso] en FigJam"
→ Confirmar contenido del diagrama. Usar `Figma:generate_diagram` con Mermaid syntax. Confirmar antes de ejecutar.

### "¿Qué hay en mi design system?"
→ `Figma:get_libraries` + `Figma:search_design_system`. Resumir componentes, variables y estilos disponibles.

### "Mapea este componente a [archivo].tsx"
→ Confirmar mapeo. `Figma:add_code_connect_map`.

### "Modifica el botón en Figma para que use el color primario"
→ **Confirmar primero** qué archivo, qué nodo, qué cambio exacto. Después `Figma:use_figma`.

## Cuándo consultar las referencias

- `references/audit-checklist.md` — checklist completo de QA de diseño (consistencia, accesibilidad, naming)
- `references/token-formats.md` — plantillas de tokens en cada formato (Tailwind, CSS, JSON/TS, SCSS, Style Dictionary) con ejemplos completos
- `references/design-to-code.md` — reglas detalladas de mapeo Figma→código (Auto Layout, variantes, responsive, iconos, imágenes)
- `references/component-docs.md` — plantillas de documentación (MDX para Storybook, README.md)
- `references/figjam-diagrams.md` — sintaxis Mermaid soportada y patrones para flujos, arquitecturas, user journeys

## Integración con otras Skills

Esta Skill complementa:

- **`landing-pages-astro`**: si el diseño es una landing/marketing, pasar tokens extraídos a esa Skill que generará el proyecto Astro completo
- **`angular-dev`**: si se está implementando en Angular, pasar el output a esa Skill para que aplique las convenciones (standalone, signals, OnPush)

Cuando detectes que el siguiente paso lógico es generar un proyecto completo en uno de esos stacks, **mencionar al usuario que esa otra Skill se va a aplicar** ("ahora generaré el proyecto Astro siguiendo las convenciones de la skill `landing-pages-astro`").

## Lo que NUNCA hay que hacer

- Ejecutar `use_figma`, `create_new_file`, `upload_assets`, `generate_diagram` o `add_code_connect_map` sin confirmación del usuario
- Codear sin haber auditado primero (al menos un escaneo rápido)
- Hardcodear valores cuando hay tokens disponibles
- Inventar nombres de componentes que no existen en el design system (si hay design system, usar sus nombres)
- Ignorar modes de variables (si hay light/dark, generar ambos)
- Generar código sin respetar la jerarquía semántica del diseño (heading levels, landmarks)
- Asumir un framework sin confirmar (a menos que el contexto sea muy claro)
- Saltarse `get_design_context` y trabajar solo con screenshots (el contexto estructurado es más confiable)
- Modificar `code_connect_map` sin confirmación
- Crear diagramas FigJam con muchos detalles innecesarios; mantenerlos simples
- Olvidar reportar contraste insuficiente cuando se detecte
