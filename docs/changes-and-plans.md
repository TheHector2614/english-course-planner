# English Course Planner — Cambios y Plan

## 🛠 Cambios realizados

### 1. Sistema de Unidades de Aprendizaje (NUEVO)

**Archivos creados:**

| Archivo | Propósito |
|---------|-----------|
| `src/data/units/a1-unit-01.ts` | Contenido completo de la Unidad 1: teoría, 5 ejercicios, evaluación de 10 preguntas, 25 palabras de vocabulario |
| `src/components/learn/ClickableText.tsx` | Renderiza texto con palabras clickeables → tooltip con traducción + botón "Save to vocabulary" |
| `src/components/learn/ExerciseRenderer.tsx` | Motor de ejercicios: fill-blank, multiple choice, error-spot (con corrección + explicación) |
| `src/components/learn/LearningUnit.tsx` | Orquestador: navegación entre secciones, progreso, sidebar de palabras guardadas |
| `src/pages/learn/[level]/[unit].astro` | Página dinámica para cualquier unidad (fallback "coming soon" si no existe) |
| `src/styles/learn.css` | Estilos compartidos para todo el sistema de unidades |

**Flujo del usuario:**
1. Home → Learning Path → click en **A1**
2. Página del nivel → tarjetas de unidades clickeables
3. Click en **"Verb 'to be'"** → unidad interactiva
4. Teoría con palabras en azul → click → traducción + definición + guardar
5. Ejercicios por subtema (5 en total)
6. Evaluación final de 10 preguntas (se necesita 7/10 para aprobar)
7. Botón flotante 📖 muestra palabras guardadas

### 2. Modo del badge en header (NUEVO)

- El badge del header que muestra "A1 · General" ahora es un **botón**
- **Click**: cicla entre General → Business → Technology → General
- **Shift+Click**: cicla entre niveles A1 → A2 → B1 → ... → B2+ → A1
- Archivo modificado: `src/components/layout/Header.astro`
- Archivo modificado: `src/scripts/header-mode.ts`

### 3. Fixes a CSS y componentes

| Fix | Archivo | Problema |
|-----|---------|----------|
| Deadzone 5px en drag | `ModeCarousel.tsx` | Clics en desktop no funcionaban por micro-movimientos del mouse |
| Removido `setPointerCapture` | `ModeCarousel.tsx` | Secuestraba clicks en desktop |
| Clases CSS explícitas `bg-text`, `text-surface` | `global.css` | Tailwind v4 + Cascade Layers anulaban las utilidades |
| SVG attributes `strokeWidth` / `strokeLinecap` | `Dictation.tsx` y otros 14 archivos | React warnings por `stroke-width` (kebab-case) |
| `loadMode()` removido de `base-layout.ts` | `base-layout.ts` | Ya no es necesario porque los átomos se inicializan desde localStorage |
| Dexie schema v4 (`savedAt` index) | `db.ts` | Error `KeyPath savedAt on object store vocabulary is not indexed` |

### 4. Integración con Learning Path

- `src/data/curriculum/a1.ts`: agregada unidad "Verb 'to be'" al inicio del array
- `src/pages/level/[level].astro`: tarjetas de unidades convertidas de `<div>` a `<a href>` clickeables

---

## 📋 Plan a futuro

Para ver el mapa curricular detallado con la distribución y los temas específicos de las 59 unidades desde A1 hasta B2+, consulta el documento **[general-english-curriculum.md](file:///d:/IA_ENGLISH/project/docs/general-english-curriculum.md)**.

### Fase 1 — Completar unidades A1 (General English)

| Unidad | Tema | Estado |
|--------|------|--------|
| 1 | Verb "to be" | ✅ Lista |
| 2 | Present Simple (otros verbos) | ⏳ Por crear |
| 3 | Artículos: a/an / the / ✕ | ⏳ |
| 4 | Plurales regulares e irregulares | ⏳ |
| 5 | Possessives ('s / my, your, his...) | ⏳ |
| 6 | This / That / These / Those | ⏳ |
| 7 | There is / There are | ⏳ |
| 8 | Preposiciones de lugar | ⏳ |
| 9 | Can / Can't | ⏳ |
| 10 | Present Continuous | ⏳ |
| 11 | Orden de palabras (SVO) | ⏳ |

Cada unidad seguirá la misma estructura:
- Teoría con palabras clickeables + traducción
- 5 ejercicios (uno por subtema)
- Final exam (10 preguntas, 7 para aprobar)
- Vocabulario integrado (guardar palabras → IndexedDB)

### Fase 2 — A2 a B2+ (General English)

Completar las 59 unidades detalladas en [general-english-curriculum.md](file:///d:/IA_ENGLISH/project/docs/general-english-curriculum.md), siguiendo la progresión:
- **A2**: 11 unidades (Past Simple, Comparativos, etc.)
- **B1**: 12 unidades (Present Perfect, Condicionales, Pasiva básica, etc.)
- **B1+**: 9 unidades (Reported speech, Causativos, etc.)
- **B2**: 8 unidades (Inversiones, Mixed conditionals, etc.)
- **B2+**: 8 unidades (Subjuntivo, Cláusulas de participio, etc.)

### Fase 3 — Focus Específicos (Business / Technology)

Para cada unidad de General English, crear variante:
- **Business English**: vocabulario de negocios, emails, meetings, negociaciones
- **Technology English**: tech docs, code reviews, standups, conferences

### Fase 4 — Mejoras planeadas

- [ ] **Progreso persistente**: guardar ejercicios completados y score de evaluación en IndexedDB
- [ ] **Repaso espaciado**: palabras guardadas aparecen en flashcards con SM-2 algorithm
- [ ] **Logros**: desbloquear achievements al completar unidades (ej: "First Unit Done")
- [ ] **Buscar traducción online**: para palabras no cubiertas en el diccionario de la unidad
- [ ] **Audio**: pronunciación de palabras clickeables
- [ ] **Ejemplos generados por IA**: ejemplos personalizados según el nivel del estudiante

---

## 🧱 Arquitectura (para desarrolladores)

```
src/
├── data/
│   ├── units/          ← Contenido de cada unidad (teoría + ejercicios + vocabulario)
│   │   └── a1-unit-01.ts
│   └── curriculum/     ← Datos de navegación (qué unidades pertenecen a cada nivel)
│       └── a1.ts
├── components/
│   └── learn/          ← Componentes reutilizables del sistema de aprendizaje
│       ├── LearningUnit.tsx
│       ├── ClickableText.tsx
│       └── ExerciseRenderer.tsx
├── pages/
│   └── learn/[level]/[unit].astro  ← Página dinámica
└── styles/
    └── learn.css       ← Estilos compartidos
```

**Para agregar una nueva unidad:**

1. Crear `src/data/units/a2-unit-12.ts` con la estructura `UnitData`
2. Agregar la entrada en `getStaticPaths()` de `src/pages/learn/[level]/[unit].astro`
3. (Opcional) Agregar la unidad al array `units` en el archivo de curriculum correspondiente
