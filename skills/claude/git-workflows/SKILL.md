---
name: git-workflows
description: Skill mixta completa para Git y colaboración - branching strategies (GitHub Flow, GitFlow, Trunk-based, Release branches), Conventional Commits estricto, Pull/Merge Requests, code review, rebase vs merge vs squash, resolución de conflictos, pre-commit hooks (lint, format, secret scanning), signed commits (GPG/SSH/Sigstore), monorepos, releases automáticas con semantic-release y changelogs. Soporta GitHub, GitLab, Bitbucket, Azure DevOps, Gitea. Activa esta skill SIEMPRE que el usuario mencione "Git", "branch", "branching", "GitFlow", "GitHub Flow", "Trunk-based", "commit", "Conventional Commits", "PR", "MR", "pull request", "merge request", "code review", "rebase", "merge", "squash", "cherry-pick", "conflict", "reflog", "tag", "release", "changelog", "semantic-release", "GitHub Actions", "GitLab CI", "pre-commit", "husky", "signed commits", "GPG", "Sigstore", "monorepo", "submodule", "Git LFS", o pida configurar/mejorar/auditar workflows Git, branching strategy, o procesos de colaboración en equipo.
---

# Git Workflows Skill

Skill para Git, colaboración en equipo, calidad de historial y automatización.

## Relación con otras skills

| Skill | Tocan Git | Esta skill complementa |
|---|---|---|
| `technical-docs` | CONTRIBUTING, code review | El cómo del workflow Git en sí |
| `aws-cloud` | GitHub Actions con OIDC | Branching strategy, releases |
| `web-backend-security` | Secrets, signed commits | Workflow seguro completo |
| `java-backend`, `databases` | Migraciones versionadas | Historia limpia, semantic versioning |

Cuando se solapen, **delegar a la skill especializada** o mencionarla.

## Principios fundamentales

### 1. Historia limpia es comunicación

El log de Git **cuenta la historia** del proyecto. Si está sucio, perdés:
- Capacidad de hacer `git bisect` para encontrar bugs
- Code review legible
- Rollback granular
- Onboarding rápido de nuevos devs

### 2. Commits atómicos

Un commit = un cambio lógico. Si necesitás `Y` en el mensaje, son dos commits.

### 3. Branches efímeros

Excepto las branches "permanentes" (main, develop si usás GitFlow), todas las branches deben durar **días, no semanas**. Branches largos = merge hell.

### 4. PR/MR como unidad de cambio

Una PR resuelve una cosa. PRs gigantes son imposibles de revisar bien — los reviewers escanean en lugar de revisar.

### 5. Automatización obligatoria

Lo que se puede automatizar **se automatiza**:
- Linting / formatting
- Tests
- Secret scanning
- Build verification
- Convention enforcement (commit messages)
- Release automation

Si depende de disciplina humana, eventualmente falla.

### 6. Signed commits para auditabilidad

Sin signed commits, no podés verificar quién hizo qué realmente. Para projects serios: obligatorio.

### 7. Branching estrategia según contexto

No hay "mejor" branching strategy. Depende de:
- Tamaño del equipo
- Frecuencia de deploys
- Necesidad de release versions paralelas
- Madurez del proyecto

## Decisión rápida: ¿qué branching strategy?

```
¿Deploys frecuentes (varios al día)?
├── Sí → Trunk-based o GitHub Flow
└── No
    │
    ¿Necesitás mantener varias versiones en paralelo?
    ├── Sí → GitFlow o Release branches
    └── No → GitHub Flow

¿Equipo grande (>15) trabajando en paralelo?
├── Sí → Considerar Trunk-based con feature flags
└── No → GitHub Flow simple
```

Detalles en `references/branching-strategies.md`.

## Flujos de trabajo

### Flujo A — "Configura Git workflow para mi proyecto nuevo"

1. **Detectar contexto**: tipo de proyecto, equipo, tamaño, frecuencia de releases
2. **Recomendar branching strategy** con justificación
3. **Setup inicial**:
   - `.gitignore` apropiado al stack
   - `.gitattributes` (LFS si necesario, line endings)
   - Branch protection rules
   - Pre-commit hooks
4. **Configurar Conventional Commits**
5. **Setup signed commits**
6. **Templates**: PR/MR, issues, CONTRIBUTING.md (delegar a `technical-docs`)
7. **CI básico**: lint + test en PRs
8. **Setup de releases** si aplica

### Flujo B — "Refactor del historial Git"

1. Identificar problemas: commits sucios, merges innecesarios, mensajes vagos
2. Para branch local sin push: interactive rebase
3. Para branch ya pusheada: cuidado con re-escribir historia compartida
4. Generar mensajes Conventional Commits
5. Squash si commits son progresivos del mismo cambio

### Flujo C — "Resolver conflicto"

1. Entender el conflicto (qué dos branches/commits chocan)
2. Estrategia: aceptar uno, aceptar otro, o mezclar
3. Comandos: resolver, agregar, continuar rebase/merge
4. Verificar funcional (no solo "sin marcadores")
5. Si es muy complejo: abort y replantear

### Flujo D — "Recuperar trabajo perdido"

Casos comunes y cómo resolverlos:
- Commit perdido por reset
- Branch borrada
- Cambios stashed perdidos
- Commit en branch equivocada
- Force push que borró cambios

Usar `git reflog` como primer recurso. Ver `references/recovery.md`.

### Flujo E — "Implementa Conventional Commits"

1. Configurar commitlint
2. Hook pre-commit con husky o pre-commit framework
3. Documentar tipos aceptados en CONTRIBUTING.md
4. Setup semantic-release si aplica
5. Configurar release-please o equivalente

Ver `references/conventional-commits.md`.

### Flujo F — "Code review de esta PR"

1. Verificar tamaño (¿es revisable?)
2. Estructura del review:
   - ¿Funciona el cambio?
   - ¿Hace lo que dice el título?
   - ¿Tests apropiados?
   - ¿Estilo consistente?
   - ¿Edge cases cubiertos?
   - ¿Seguridad?
   - ¿Performance?
3. Feedback constructivo (formal/profesional)
4. Aprobar / pedir cambios / solicitar discusión

Ver `references/code-review.md`.

### Flujo G — "Configura monorepo"

1. Elegir herramienta (Nx, Turborepo, pnpm workspaces, Bazel)
2. Estructura de directorios
3. Versionado independiente vs sincronizado
4. CI optimizado (solo paquetes afectados)
5. Estrategia de releases (changesets, etc.)

Ver `references/monorepos.md`.

### Flujo H — "Audita el repo / workflow Git"

1. Aplicar checklist (ver `references/health-check.md`):
   - Branch protection configurada
   - Pre-commit hooks activos
   - Signed commits enforced
   - Secret scanning activo
   - CI corriendo en PRs
   - Conventional commits o convención clara
   - PR template
   - CONTRIBUTING.md presente
   - No commits directos a main
2. Reportar gaps con severidad
3. Plan de fix

## Configuración inicial recomendada

### Git global (`~/.gitconfig`)

```bash
# Usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Default branch
git config --global init.defaultBranch main

# Push behavior
git config --global push.default current
git config --global push.autoSetupRemote true

# Pull con rebase por default (historia más limpia)
git config --global pull.rebase true

# Auto-stash en rebase
git config --global rebase.autoStash true

# Colores
git config --global color.ui auto

# Editor
git config --global core.editor "code --wait"  # o vim, nano, etc.

# Signed commits (ver references/signed-commits.md)
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# Alias útiles
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"
git config --global alias.amend "commit --amend --no-edit"
```

### `.gitignore` por stack

Usar templates de https://github.com/github/gitignore como punto de partida. Detalles en `references/gitignore-patterns.md`.

### `.gitattributes`

```
# Auto-detect text files y normalizar line endings
* text=auto

# Force LF para shell scripts (importante para .sh corriendo en Linux)
*.sh text eol=lf

# Force CRLF para archivos Windows
*.bat text eol=crlf
*.cmd text eol=crlf

# Binarios explícitos
*.png binary
*.jpg binary
*.pdf binary

# Git LFS (si usas)
*.psd filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
```

## Conventional Commits (obligatorio)

Formato:
```
<tipo>(<scope opcional>)<!>: <descripción>

[cuerpo opcional]

[footer opcional]
```

Tipos estándar:
- `feat`: nueva funcionalidad
- `fix`: bug fix
- `docs`: solo documentación
- `style`: formato, sin cambio de lógica
- `refactor`: cambio de código que no es feat ni fix
- `perf`: mejora de performance
- `test`: agregar/corregir tests
- `build`: cambios en build system o deps
- `ci`: cambios en CI/CD
- `chore`: tareas de mantenimiento
- `revert`: revertir commit previo

`!` antes de `:` indica **breaking change** (MAJOR version).

Ejemplos:
```
feat(auth): add OAuth2 login flow

Implements the authorization code grant with PKCE.
Adds /login/oauth/callback endpoint.

Closes #123
```

```
fix(api): handle null user in profile endpoint

Returns 404 instead of 500 when user does not exist.
```

```
feat(api)!: change user ID format from int to UUID

BREAKING CHANGE: User IDs now return as UUIDs (string).
Clients must update parsers.
```

Detalles y herramientas en `references/conventional-commits.md`.

## Pre-commit hooks (obligatorio)

**Por qué obligatorio**: lo que llega a CI debería estar pre-validado localmente. CI es la red de seguridad, no el chequeo primario.

### pre-commit framework (Python, multi-lenguaje)

`.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks

  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.13.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

Instalar:
```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
```

### husky (JavaScript/TypeScript)

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml}": ["prettier --write"]
  }
}
```

`.husky/pre-commit`:
```bash
npx lint-staged
```

`.husky/commit-msg`:
```bash
npx --no-install commitlint --edit "$1"
```

Detalles completos en `references/hooks-and-automation.md`.

## Signed commits (obligatorio)

**3 opciones**:

1. **GPG** (tradicional): clave OpenPGP
2. **SSH** (Git 2.34+): clave SSH (más simple)
3. **Sigstore / gitsign** (moderno): OIDC-based, sin gestionar keys

Setup SSH (recomendado por simplicidad):
```bash
ssh-keygen -t ed25519 -C "tu@email.com" -f ~/.ssh/git_signing_key
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/git_signing_key.pub
git config --global commit.gpgsign true
```

Después subir la pubkey en GitHub/GitLab/etc. como "Signing key".

Branch protection: requerir signed commits en main.

Detalles en `references/signed-commits.md`.

## Pull / Merge Requests

### Tamaño ideal

| Tamaño | Calidad de review |
|---|---|
| < 100 líneas | Excelente |
| 100-500 líneas | Bueno |
| 500-1000 líneas | Marginal |
| > 1000 líneas | Mala. Casi nadie revisa bien |

**Regla**: si una PR pasa de 500 líneas, considerar dividir. Excepción: cambios mecánicos (renames, formatting), que son fáciles de revisar.

### Template PR

```markdown
## Descripción

<qué cambia y por qué>

## Tipo de cambio

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactor

## Cómo probar

1. <pasos>
2. <pasos>

## Checklist

- [ ] Tests agregados/actualizados
- [ ] Docs actualizadas (si aplica)
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Sin secrets ni credentials
- [ ] CI pasando

## Tickets relacionados

Closes #N
```

Más detalles en `references/pull-requests.md`.

## Code review

### Qué revisar (en orden)

1. **¿Hace lo que dice?** (correctness)
2. **¿Es la forma correcta de hacerlo?** (design)
3. **¿Edge cases cubiertos?** (testing)
4. **¿Seguridad?** (si aplica)
5. **¿Performance?** (si aplica)
6. **¿Estilo consistente?** (al final, idealmente automatizado)

### Cómo dar feedback

- **Específico**: línea concreta, no "esta sección"
- **Constructivo**: "considerá X" en lugar de "esto está mal"
- **Distinguir bloqueante vs sugerencia**: usar etiquetas (`blocking:`, `nit:`, `question:`)
- **Praise también**: ✓ algo bien hecho aprende y motiva
- **Sin ataques personales**: criticá código, no personas

### Cómo recibir feedback

- No defensivo
- Pedí clarificación si no entendés
- Negociá: a veces el reviewer está mal informado del contexto
- Agradecé buena revisión
- Si discrepás fuerte: discutí, no ignorés

Detalles en `references/code-review.md`.

## Estrategias de merge

| Estrategia | Cuándo |
|---|---|
| **Merge commit** | Preserva historia exacta de la feature branch |
| **Squash and merge** | Una PR = un commit en main. Limpio para historia |
| **Rebase and merge** | Lineal, sin merge commits. Para equipos disciplinados |
| **Fast-forward only** | No permite merge sin replay (Trunk-based estricto) |

**Default recomendado**: `Squash and merge` para PRs pequeñas, `Rebase and merge` si los commits ya están limpios y son útiles individualmente.

Ver `references/merge-strategies.md`.

## Releases y semantic versioning

### SemVer (Semantic Versioning)

`MAJOR.MINOR.PATCH`:
- **MAJOR**: breaking changes (`feat!:` o `fix!:`)
- **MINOR**: nueva funcionalidad compatible (`feat:`)
- **PATCH**: bug fixes (`fix:`)

### Automatización

| Tool | Cuándo |
|---|---|
| **semantic-release** | JS/TS, full automation, publica a npm |
| **release-please** | Multi-lenguaje, Google's tool, PR-based |
| **changesets** | Monorepos JS/TS, manual control granular |
| **conventional-changelog** | Solo genera CHANGELOG, sin publish |
| **goreleaser** | Go projects |
| **cargo-release** | Rust |

Detalles en `references/releases.md`.

## Monorepos

Cuándo monorepo:
- Múltiples paquetes con dependencias entre sí
- Equipos comparten código
- Cambios cross-package frecuentes
- Standardización de tooling

Cuándo NO monorepo:
- Repos independientes con ciclos diferentes
- Equipos sin necesidad de cross-pollination
- Sin tooling de monorepo (será caótico)

Herramientas (JS/TS):
- **Nx** (más features)
- **Turborepo** (más simple)
- **pnpm workspaces** (más liviano)
- **Lerna** (legacy, considerar reemplazar)

Ver `references/monorepos.md`.

## Operaciones avanzadas

### Recuperación

`git reflog` es tu mejor amigo. Casi nada se pierde "para siempre" durante 90 días.

```bash
git reflog                          # historia de HEAD
git reflog show <branch>            # historia de una branch
git checkout HEAD@{5}               # ir a un punto previo
git branch recovered HEAD@{5}       # crear branch desde ahí
```

Ver `references/recovery.md`.

### Resolución de conflictos

```bash
git status                          # ver archivos en conflicto
# Editar archivos resolviendo <<<<<<< ======= >>>>>>>
git add <archivo>
git rebase --continue               # o git merge --continue

# Si fallaste fuerte
git rebase --abort
git merge --abort
```

Herramientas: `git mergetool`, VSCode merge editor, IntelliJ.

Ver `references/conflicts.md`.

### Operaciones útiles avanzadas

- `git cherry-pick <commit>`: copiar commit a otra branch
- `git revert <commit>`: revertir cambios (commit nuevo, no destructivo)
- `git stash`: guardar cambios temporalmente
- `git bisect`: encontrar commit que introdujo un bug
- `git worktree`: múltiples branches checkeadas a la vez
- `git rebase -i`: edit history interactivo

Ver `references/advanced-operations.md`.

## Platform-specific

### GitHub
- Branch protection rules
- Required status checks
- CODEOWNERS file
- GitHub Actions
- Dependabot, security advisories

### GitLab
- Merge request approvals
- Push rules
- CI/CD pipelines
- Container registry, package registry

### Bitbucket
- Pipelines
- Branch permissions
- Pull requests

### Azure DevOps
- Pipelines
- Branch policies
- Pull requests

### Gitea / Forgejo (self-hosted)
- Similar a GitHub pero self-hosted
- Actions support

Detalles en `references/platforms.md`.

## Branch protection (obligatorio)

Para `main` (y branches críticas):

- ✅ Require pull request before merging
- ✅ Require approvals (1-2 según equipo)
- ✅ Require status checks to pass (CI verde)
- ✅ Require signed commits
- ✅ Require linear history (si rebase strategy)
- ✅ Require conversation resolution
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

## Output esperado

Según el flujo:

### Setup inicial de proyecto
- `.gitignore` apropiado
- `.gitattributes`
- Configuración Git recomendada
- `.pre-commit-config.yaml` o equivalente
- Branch protection sugerida
- PR/Issue templates
- Conventional Commits config (commitlint, commitizen)

### Refactor de historial
- Comandos exactos a ejecutar
- Plan paso a paso
- Advertencias si la branch está pusheada

### Recovery
- Comando exacto que necesita
- Por qué funciona
- Cómo verificar antes de aplicar

### Code review
- Comentarios estructurados
- Marcados como blocking/nit/question
- Sugerencias concretas con código

## Referencias

- `references/branching-strategies.md` — GitHub Flow, GitFlow, Trunk-based, Release branches con código
- `references/conventional-commits.md` — formato, herramientas (commitlint, commitizen), enforcement
- `references/signed-commits.md` — GPG, SSH, Sigstore setup completo
- `references/hooks-and-automation.md` — pre-commit, husky, lint-staged, secret scanning
- `references/pull-requests.md` — templates, tamaño, descripción, draft PRs
- `references/code-review.md` — qué revisar, cómo dar/recibir feedback, herramientas
- `references/merge-strategies.md` — merge vs squash vs rebase, cuándo cada uno
- `references/releases.md` — semantic-release, release-please, changesets, semver
- `references/recovery.md` — reflog, recuperación, rescate de trabajo perdido
- `references/conflicts.md` — resolución de conflictos, herramientas, casos comunes
- `references/advanced-operations.md` — bisect, cherry-pick, rebase interactivo, worktree
- `references/monorepos.md` — Nx, Turborepo, pnpm workspaces, releases con changesets
- `references/platforms.md` — GitHub, GitLab, Bitbucket, Azure DevOps, Gitea específico
- `references/gitignore-patterns.md` — patrones por stack, .gitattributes, Git LFS
- `references/health-check.md` — checklist de auditoría de workflow Git

## Lo que NUNCA hay que hacer

- ❌ Force push a `main` o branches compartidas
- ❌ Commitear secrets, credentials, API keys, .env
- ❌ Commitear archivos generados (build/, dist/, node_modules/)
- ❌ Commits gigantes con cambios no relacionados
- ❌ Mensajes vagos: "fix stuff", "update", "wip"
- ❌ Branches eternas (semanas/meses sin mergear)
- ❌ Merge sin tests pasando
- ❌ Re-escribir historia ya pusheada y compartida sin avisar al equipo
- ❌ Borrar branch sin verificar que está mergeada
- ❌ Skip pre-commit hooks con `--no-verify` por costumbre
- ❌ Subir archivos grandes (>50 MB) sin Git LFS
- ❌ Commits no firmados en proyectos serios
- ❌ Branch protection deshabilitada en producción
- ❌ Sin code review (excepto solo dev en proyecto personal)
- ❌ Aceptar PR sin entenderla
- ❌ Aprobar PR rápido sin leer
- ❌ Mezclar refactor + feature + fix en una PR
- ❌ Commit con `[skip ci]` para evitar tests por flojera
- ❌ Tags de release sobreescritos (deberían ser inmutables)
- ❌ Cambiar git author/email para "impersonar" otro contribuidor
