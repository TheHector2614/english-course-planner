# Conventional Commits

Estándar para mensajes de commit que permite automatización (changelog, semver, releases).

## Formato

```
<tipo>(<scope>)<!>: <descripción>

[cuerpo opcional]

[footer opcional]
```

### Componentes

**Tipo** (obligatorio, lowercase):
- `feat`: nueva funcionalidad
- `fix`: bug fix
- `docs`: solo documentación
- `style`: formato, sin cambio de lógica (whitespace, semicolons, etc.)
- `refactor`: cambio de código que no es feat ni fix
- `perf`: mejora de performance
- `test`: agregar/corregir tests
- `build`: cambios en build system, dependencias
- `ci`: cambios en CI/CD
- `chore`: tareas de mantenimiento
- `revert`: revertir commit previo

**Scope** (opcional): área del cambio
```
feat(auth): ...
fix(api): ...
docs(readme): ...
```

**Breaking change** (`!`): marca breaking change
```
feat(api)!: change endpoint URL from /users to /v2/users
```

**Descripción**: imperativo, lowercase, sin punto final, < 72 chars idealmente

**Body** (opcional): explicación más larga, por qué del cambio

**Footer** (opcional):
- `Closes #123` / `Fixes #456`
- `BREAKING CHANGE: <descripción>`
- `Co-authored-by: Nombre <email>`

## Ejemplos completos

### Feature simple

```
feat(auth): add OAuth2 login flow

Implements the authorization code grant with PKCE.
Adds /login/oauth/callback endpoint.

Closes #123
```

### Bug fix

```
fix(api): handle null user in profile endpoint

Returns 404 instead of 500 when user does not exist.
Adds test case for missing user scenario.

Fixes #456
```

### Breaking change

```
feat(api)!: change user ID format from int to UUID

User IDs now return as UUIDs (string).
Clients must update parsers.

BREAKING CHANGE: User IDs are now strings (UUIDs) instead of integers.
Migration guide: docs/migrations/v2-user-id-uuid.md
```

### Refactor

```
refactor(orders): extract OrderValidator from OrderService

Improves testability and separates validation logic.
No functional changes.
```

### Performance

```
perf(query): add index on orders.user_id

Reduces query time for "list user orders" from 800ms to 12ms.
Verified with production-like data (1M rows).
```

### Multiple changes (en general evitar, una cosa por commit)

A veces inevitable. Usar body:

```
fix(api): handle edge cases in payment processing

- Reject negative amounts (was crashing)
- Handle Stripe timeout gracefully (was retrying infinitely)
- Update error messages to be user-friendly

Closes #789, #790, #791
```

## Reglas estrictas

- ✅ Tipo en lowercase
- ✅ Imperativo: "add", "fix", "remove" (no "added", "fixed")
- ✅ Sin punto al final de descripción
- ✅ Descripción < 72 chars
- ✅ Línea en blanco antes del body
- ✅ Línea en blanco antes del footer
- ✅ Body con líneas < 100 chars
- ❌ Mensajes vagos: "fix stuff", "update", "wip", "changes"
- ❌ Inglés y español mezclados
- ❌ ALL CAPS
- ❌ Múltiples cosas no relacionadas en un commit

## Enforcement con commitlint

`commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100]
  }
};
```

Instalación:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Hook con husky

`.husky/commit-msg`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

### Hook con pre-commit framework

`.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/alessandrojcm/commitlint-pre-commit-hook
    rev: v9.16.0
    hooks:
      - id: commitlint
        stages: [commit-msg]
        additional_dependencies: ['@commitlint/config-conventional']
```

## Asistencia interactiva con commitizen

Para que devs no tengan que recordar el formato:

```bash
npm install --save-dev commitizen cz-conventional-changelog
```

`package.json`:
```json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

Uso:
```bash
npm run commit
# Pregunta interactivamente: tipo, scope, descripción, etc.
```

Versión Python:
```bash
pip install commitizen
cz commit
```

## En GitHub: validación de PR titles

Si usás squash merge, el PR title se convierte en el commit. Validar:

`.github/workflows/lint-pr.yml`:
```yaml
name: Lint PR

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Generar changelog automático

### conventional-changelog (manual)

```bash
npm install --save-dev conventional-changelog-cli
```

```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

Genera CHANGELOG.md basado en commits desde el último tag.

### standard-version (versionado + tag + changelog)

```bash
npm install --save-dev standard-version
```

```bash
npx standard-version
# - bump version en package.json
# - actualiza CHANGELOG.md
# - crea commit + tag
```

Mejor para libraries chicas. Para casos serios, semantic-release.

### semantic-release (full automation)

Ver `references/releases.md` para setup completo.

## Mapping commits → SemVer

Conventional Commits permite calcular versión automáticamente:

| Tipo de commit | Bump |
|---|---|
| `feat:` | MINOR (1.0.0 → 1.1.0) |
| `fix:`, `perf:` | PATCH (1.0.0 → 1.0.1) |
| `feat!:`, `fix!:`, etc. (con `!`) | MAJOR (1.0.0 → 2.0.0) |
| `BREAKING CHANGE:` en footer | MAJOR |
| `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:`, `chore:` | Sin bump (a menos que aplique) |

## Scopes recomendados

Algunos ejemplos:

### Webapp
- `auth`, `api`, `ui`, `db`, `deps`, `ci`, `docs`

### Monorepo
- `app-web`, `app-mobile`, `lib-shared`, `lib-ui`

### Backend
- `users`, `orders`, `payments`, `auth`, `webhooks`, `migrations`

### Frontend
- `pages`, `components`, `hooks`, `stores`, `styles`

**Mantener lista corta** (8-15 scopes). Demasiados = nadie los recuerda.

Documentar scopes en CONTRIBUTING.md.

## Trampas comunes

- ❌ Inventar tipos: usar solo los estándar (o documentar custom)
- ❌ Scope inconsistente: `(auth)` vs `(login)` vs `(authentication)`
- ❌ Descripción en pasado: ❌ "added X" → ✅ "add X"
- ❌ Mayúscula inicial: ❌ "Add feature" → ✅ "add feature"
- ❌ Punto final: ❌ "add feature." → ✅ "add feature"
- ❌ Subject demasiado largo: dividir en subject + body
- ❌ Mezclar varios cambios: usar varios commits
- ❌ `revert:` sin contexto: indicar QUÉ se revierte y por qué
- ❌ `chore:` para todo: usar el tipo apropiado

## Squash merge: hace el job más fácil

Si usás squash merge en GitHub/GitLab, el PR title se vuelve el commit message. Si validás PR titles con Conventional Commits, **no necesitás que cada commit individual cumpla**. Devs commitean WIP libre, el squash limpia.

Esto reduce fricción manteniendo historia limpia.

## Migración a Conventional Commits

Para proyectos existentes:

1. **Adoptar a partir de fecha X**, no reescribir historia
2. Setup commitlint para que enforce desde ahora
3. Documentar tipos y scopes en CONTRIBUTING.md
4. Setup conventional-changelog desde el último tag
5. Eventualmente: semantic-release o release-please

## Decisión: ¿Conventional Commits o no?

✅ **Sí**:
- Querés automatizar releases
- Equipo > 2 personas
- Proyecto serio (no scratch)
- Querés mejor `git log`
- Vas a tener CHANGELOG

⚠️ **Quizá**:
- Proyecto personal pequeño (overhead innecesario)
- Equipo no acepta convenciones (problema cultural)

❌ **Rara vez no aplicable**.

## Plantilla completa

`.gitmessage.txt`:
```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert
# Subject: imperativo, lowercase, sin punto, max 72 chars
# Body: por qué del cambio
# Footer: BREAKING CHANGE / Closes #N / Co-authored-by
```

Configurar como template:
```bash
git config --global commit.template ~/.gitmessage.txt
```

Cuando hagas `git commit` sin `-m`, abrirá el editor con esta plantilla.
