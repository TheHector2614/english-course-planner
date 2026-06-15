# English Teacher Designer — Subagente OpenCode con Skills de ui-skills.com

> Subagente para profesores de inglés que crean materiales didácticos HTML  
> con diseño UI profesional gracias a 10 skills especializadas.  
> **Scope**: solo dentro de la carpeta del proyecto.  
> **Replicable**: copia `.opencode/` + `opencode.json` a cualquier proyecto.

---

## ¿Para qué sirve?

Crea actividades interactivas de inglés en HTML con calidad visual profesional:

| Necesidad | Sin skills | Con skills |
|-----------|-----------|------------|
| Quiz interactivo | HTML plano, feo, sin feedback | Diseñado con principios UI, feedback inmediato, accesible |
| Flashcards | Sin animaciones, bordes duros | Volteo animado, border radius concéntrico, sombras suaves |
| Reading comprehension | Texto sin formato, nada interactivo | Tipografía cuidada, preguntas con validación, diseño responsive |
| Writing prompt | Textarea genérica | Interfaz con checklist, contador, feedback visual |

---

## Las 10 skills y su utilidad pedagógica

| Skill | Para qué usarla en enseñanza |
|-------|------------------------------|
| `frontend-design` | Planear la estructura visual de una lección: paleta, tipografía, layout |
| `emil-design-eng` | Filosofía de detalles invisibles: ejercicios que se sienten profesionales |
| `make-interfaces-feel-better` | Pulir actividades: border radius, sombras, alineación óptica, fuentes |
| `baseline-ui` | Anti-slop: animaciones solo cuando aporten, contraste legible, Tailwind |
| `design-taste-frontend` | Anti-slop con diales: evitar que las actividades parezcan genéricas |
| `web-quality-audit` | Auditar rendimiento y accesibilidad de los materiales creados |
| `wcag-audit-patterns` | Garantizar accesibilidad WCAG 2.2 AA para todos los estudiantes |
| `12-principles-of-animation` | Animar con propósito: timing en transiciones, easing, feedback visual |
| `oklch-skill` | Paletas de color consistentes, contraste APCA, modo claro/oscuro |
| `interaction-design` | Micro-interacciones: hover en tarjetas, drag & drop, loading states |

---

## Estructura de archivos

```
proyecto-ensenanza/
├── .opencode/
│   ├── agents/
│   │   ├── english-teacher.md          ← Agente primario (ya existente)
│   │   └── english-teacher-designer.md ← Subagente con skills de diseño
│   └── skills/                         ← (opcional) skills proyecto-local
├── opencode.json                       ← Config del proyecto
└── ENGLISH-TEACHER-SETUP.md            ← Esta guía
```

Las skills del proyecto están disponibles localmente en `skills/ui-design/` (10 diseño UI) y `skills/claude/` (18 de Skill Claude). También se pueden instalar globalmente con `npx skills add` (quedan en `~/.agents/skills/`).

---

## Instalación en otro proyecto

### 1. Copiar configuración del agente

```bash
cp -r <origen>/.opencode/agents/ <destino>/.opencode/agents/
cp    <origen>/opencode.json           <destino>/opencode.json
```

### 2. Instalar las 10 skills

```bash
npx skills add anthropics/frontend-design-skill --skill frontend-design -y
npx skills add emilkowalski/emil-design-eng --skill emil-design-eng -y
npx skills add raphaelsalaja/make-interfaces-feel-better --skill make-interfaces-feel-better -y
npx skills add ibelick/baseline-ui --skill baseline-ui -y
npx skills add leonxlnx/design-taste-frontend --skill design-taste-frontend -y
npx skills add addyosmani/web-quality-audit --skill web-quality-audit -y
npx skills add wshobson/wcag-audit-patterns --skill wcag-audit-patterns -y
npx skills add raphaelsalaja/12-principles-of-animation --skill 12-principles-of-animation -y
npx skills add jakubkrehel/oklch-skill --skill oklch-skill -y
npx skills add wshobson/interaction-design --skill interaction-design -y
```

Verificar: `ls ~/.agents/skills/` debe mostrar 10 carpetas.

### 3. Usar en OpenCode

```bash
cd proyecto-ensenanza
opencode
```

Invocar con `@english-teacher-designer` desde cualquier agente primario.

---

## opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "english-teacher",
  "agent": {
    "english-teacher-designer": {
      "description": "Profesor de inglés que diseña materiales didácticos HTML con diseño UI profesional.",
      "mode": "subagent",
      "temperature": 0.7,
      "permission": {
        "edit": "allow",
        "skill": { "*": "allow" },
        "glob": "allow",
        "grep": "allow",
        "read": "allow",
        "webfetch": "allow",
        "bash": "deny"
      }
    }
  }
}
```

---

## Cómo usarlo (ejemplos)

```
@english-teacher-designer Crea un quiz de 10 preguntas sobre present perfect vs past simple para nivel B1. Incluye feedback inmediato.
```

```
@english-teacher-designer Diseña 8 flashcards interactivas con phrasal verbs comunes. Cada una con ejemplo, traducción y animación de volteo.
```

```
@english-teacher-designer Haz una actividad de reading comprehension sobre cambio climático para B2. 300 palabras + 5 preguntas de inferencia + 5 de vocabulario.
```

```
@english-teacher-designer Crea un drag & drop para ordenar oraciones en present continuous. Nivel A2.
```

---

## Verificación de seguridad

Skills verificadas con [SkillSpector](https://github.com/NVIDIA/skillspector) v2.1.2:

```bash
skillspector scan ~/.agents/skills/ --no-llm
```

**Resultado**: 0 vulnerabilidades reales. Score 100/100 artificial por falsos positivos en licencias Apache, comentarios HTML en ejemplos, y guías de diseño. Las 10 skills son seguras.

---

## Replicación

Para compartir en otro equipo:

1. **Copia** `.opencode/agents/english-teacher-designer.md` y fusiona `opencode.json`
2. **Instala** las 10 skills con los comandos de la sección 3.2
3. **Verifica**: `opencode agent list` debe mostrar `english-teacher-designer (subagent)`
