# IA_ENGLISH — English teacher + UI design skills

## Agents

- **`english-teacher`** (primary/default) — CLT/TBLT/gamification. Crea HTML activities, lesson plans, writing evaluation.
- **`@english-teacher-designer`** (subagent) — Mismo enfoque pedagógico + carga skills de diseño UI via `skill()` tool para materiales HTML más pulidos.

## Skills del proyecto

### Diseño UI (10 skills, `skills/ui-design/`)

```
frontend-design          emil-design-eng          make-interfaces-feel-better
baseline-ui              design-taste-frontend    web-quality-audit
wcag-audit-patterns      12-principles-of-animation oklch-skill
interaction-design
```

### Claude Skills (18 skills, `skills/claude/`)

```
angular-dev              aws-cloud                cybersecurity-defense
databases                devops                   entrevistador-procesos
figma-workflow           git-workflows            humanizador
java-backend             landing-pages-astro      optimizador-prompts
presentaciones-visuales  requirements-engineering  superpowers
technical-docs           verificador-datos         web-backend-security
```

Cargar con `skill({ name: "..." })`. Ver `ENGLISH-TEACHER-SETUP.md` para tabla de cuándo usar cada una.

## Output rules (toda actividad HTML)

- Self-contained, offline, mobile-friendly
- CEFR level (A1-C2) + learning objective visible
- WCAG AA contrast (4.5:1 normal, 3:1 large)
- Immediate feedback en quizzes
- Instrucciones en inglés + opción español
- Teacher guide al final del HTML

## Commands

```bash
# Instalar una skill
npx skills add <repo> --skill <name> -y

# Escanear seguridad (requiere Python venv en skillspector/)
cd skillspector
.venv\Scripts\python -c "import sys; from skillspector.cli import app; sys.argv = ['skillspector', 'scan', r'$env:USERPROFILE\.agents\skills', '--no-llm']; app()"
```

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `opencode.json` | Config del proyecto, registra `english-teacher-designer` subagent |
| `.opencode/agents/english-teacher-designer.md` | Definición del subagente con skills |
| `.opencode/agents/english-teacher.md` | Agente primario (sin skills de diseño) |
| `ENGLISH-TEACHER-SETUP.md` | Guía detallada de skills y uso |
| `INSTALACION-DESDE-CERO.md` | Setup desde cero para no-programadores |
| `plan-B1-interactivo.html` | Ejemplo de output esperado (actividad B1 interactiva) |
| `skills/ui-design/` | 10 skills de diseño UI |
| `skills/claude/` | 18 skills extraídas de Skill Claude |
