# Monorepos

Cuándo usar, herramientas (Nx, Turborepo, pnpm workspaces, Lerna), workflows.

## Monorepo vs polyrepo: decisión

### Monorepo

**Un repo** con múltiples paquetes/apps.

```
my-monorepo/
├── apps/
│   ├── web/        (Next.js)
│   ├── mobile/     (React Native)
│   └── api/        (NestJS)
├── packages/
│   ├── shared/     (Tipos y utils compartidos)
│   ├── ui/         (Componentes UI)
│   └── config/     (Configs compartidos)
└── tools/
```

### Polyrepo

Cada paquete/app en **repo separado**:
- repo-web
- repo-mobile
- repo-api
- repo-shared
- repo-ui

## Pros y cons

| Aspecto | Monorepo | Polyrepo |
|---|---|---|
| **Code sharing** | Trivial (refs directos) | Vía publish + npm install |
| **Refactors cross-package** | Un commit, todo | Múltiples PRs coordinados |
| **CI/CD** | Smart caching, solo afectados | Por repo, simple |
| **Versionado** | Sincronizado o por-paquete | Independiente natural |
| **Access control** | Todo o nada en el repo | Granular por repo |
| **Onboarding** | Clone uno, todo ahí | Saber qué clonar |
| **Scale (commits/día)** | Necesita tooling | Naturalmente distribuido |
| **Build performance** | Requiere tooling (cache) | Naturalmente aislado |
| **Conflict de tooling** | Compartido (puede ser bueno o malo) | Cada uno el suyo |

## Cuándo monorepo

✅ **Sí**:
- Múltiples paquetes con dependencias entre sí
- Equipos comparten código frecuentemente
- Cambios cross-package son comunes
- Querés estandarizar tooling (lint, format, CI)
- Tenés tooling para manejar (Nx, Turborepo, Bazel)

❌ **No**:
- Repos completamente independientes con ciclos diferentes
- Equipos diferentes que no comparten código
- Sin tooling para monorepos (será caótico)
- Open source con distintas licencias por paquete

## Herramientas (JS/TS)

### pnpm workspaces (más simple)

Mínimo viable. pnpm tiene workspaces nativos.

`package.json` raíz:
```json
{
  "name": "monorepo-root",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

O en `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Comandos:
```bash
pnpm install                          # instala todo
pnpm --filter web add lodash          # solo en app web
pnpm --filter web build               # solo build de web
pnpm -r build                         # build de todos (recursive)
pnpm -r --filter "...@my/ui" build    # ui y todo lo que depende de ui
```

Referenciar paquete local:
```json
// apps/web/package.json
{
  "dependencies": {
    "@my/ui": "workspace:*"
  }
}
```

**Pros**:
- Simple, sin tooling extra
- Rápido (pnpm es eficiente)
- Compatible con npm/yarn workspaces

**Cons**:
- Sin task orchestration inteligente
- Sin caching cross-task
- Build de todos puede ser lento

### Turborepo (build orchestration)

Sobre pnpm/npm/yarn workspaces. Agrega caching y paralelización.

```bash
pnpm install -D turbo
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```

Comandos:
```bash
turbo build              # build inteligente (cache hits)
turbo build --filter=web # solo web
turbo dev                # todos los dev servers en paralelo
turbo run test --since=main  # tests de paquetes afectados desde main
```

Remote caching (gratis con Vercel):
```bash
turbo login
turbo link
```

CI más rápido por compartir cache entre runs.

**Pros**:
- Smart caching local + remote
- Paralelización
- Detecta paquetes afectados
- Simple de adoptar sobre workspaces existentes

**Cons**:
- No tiene generadores ni "smart" tooling
- Sin migration tools

### Nx (más completo, opinionated)

Tool más completo. Genera estructura, código, tiene plugins para Next, Angular, React, NestJS, etc.

```bash
npx create-nx-workspace@latest
```

Estructura:
```
my-workspace/
├── apps/
├── libs/
├── tools/
├── nx.json
├── workspace.json
└── package.json
```

Comandos:
```bash
nx build my-app
nx test my-lib
nx affected:build           # solo afectados
nx affected:test --base=main
nx graph                    # ver dependencias visualmente
nx g @nx/react:app my-app   # generar nuevo proyecto
nx g @nx/react:lib my-lib
nx migrate latest           # auto-migrar deps
```

**Pros**:
- Generadores para crear apps/libs
- Migration tools entre versiones
- Plugins para frameworks
- Caching local + Nx Cloud (remote)
- Affected graph para CI eficiente
- Dev experience pulido

**Cons**:
- Opinionated (estructura específica)
- Curva de aprendizaje
- Más overhead que Turborepo

### Lerna (legacy, considerar reemplazar)

Histórico. Ahora mantenido por Nx team.

```bash
npx lerna init
```

Para nuevos proyectos: **usar Turborepo o Nx**, no Lerna.

### Bazel (Google-scale)

Para monorepos masivos multi-lenguaje. Steeper learning curve, pero escala a millones de archivos.

Cuándo: monorepos enormes, multi-lenguaje (Go + JS + Python + Rust), build correctness crítica.

### Otros lenguajes

- **Python**: Poetry workspaces, uv workspaces, Pants, Bazel
- **Rust**: Cargo workspaces (built-in)
- **Java**: Maven multi-module, Gradle composite builds, Bazel
- **Go**: Go workspaces (1.18+) o monorepo simple con `go.mod` por módulo
- **.NET**: Solutions con múltiples projects

## Estructura recomendada

### Layout estándar

```
my-monorepo/
├── apps/                    # Aplicaciones (deployables)
│   ├── web/
│   ├── mobile/
│   └── api/
├── packages/                # Librerías compartidas
│   ├── ui/
│   ├── shared/
│   ├── config/
│   └── eslint-config/
├── tools/                   # Scripts internos
├── docs/                    # Documentación
├── .changeset/              # Si usás changesets
├── .github/
├── package.json
├── pnpm-workspace.yaml      # o equivalente
└── turbo.json               # o nx.json
```

### Convenciones

- `apps/` para deployables
- `packages/` para libraries
- Prefijo de namespace: `@my/ui`, `@my/api`
- Versionado: `workspace:*` para deps internas

## CI optimizado: solo lo afectado

Sin optimización: cada push corre todo. En monorepos grandes esto es lento e innecesario.

### Con Nx

```yaml
- run: pnpm install
- run: pnpm exec nx affected:build --base=origin/main
- run: pnpm exec nx affected:test --base=origin/main
- run: pnpm exec nx affected:lint --base=origin/main
```

### Con Turborepo

```yaml
- run: pnpm install
- run: pnpm turbo run build test lint --filter=...[origin/main]
```

`...[origin/main]` filter: paquetes que cambiaron + sus dependientes.

### Manual (para tools sin affected)

```yaml
- name: Detect changes
  id: changes
  uses: dorny/paths-filter@v3
  with:
    filters: |
      web: 'apps/web/**'
      api: 'apps/api/**'
      ui: 'packages/ui/**'

- name: Build web
  if: steps.changes.outputs.web == 'true' || steps.changes.outputs.ui == 'true'
  run: pnpm --filter web build
```

## Caching de CI

### Caché de dependencias

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- uses: actions/cache@v4
  with:
    path: |
      .next/cache
      .turbo
    key: ${{ runner.os }}-build-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### Remote caching (Nx Cloud / Vercel Turbo)

```bash
# Nx Cloud
nx connect-to-nx-cloud

# Turborepo
turbo login
turbo link
```

Beneficio: cache hits entre CI runs, máquinas locales, y devs.

## Versionado en monorepos

### Opción A: versionado sincronizado

Todos los paquetes mismo número. Cada release bumpea todos.

**Pros**: simple, claro.
**Cons**: noise (releases sin cambios reales).

### Opción B: versionado independiente

Cada paquete su versión.

**Pros**: granular, semver real por paquete.
**Cons**: más complejo.

Con **changesets** (recomendado para JS/TS):

```bash
pnpm install -D @changesets/cli
pnpm exec changeset init
```

Al hacer cambios:
```bash
pnpm exec changeset
# Pregunta:
# - Qué paquetes afectaste
# - Bump type (major/minor/patch)
# - Resumen del cambio
# Crea archivo en .changeset/
```

En CI:
```bash
pnpm exec changeset version    # bumpea + actualiza changelog
pnpm exec changeset publish    # publica
```

Ver `references/releases.md` para detalle.

## Workflows comunes

### Agregar nuevo paquete

```bash
# Manual
mkdir packages/new-lib
cd packages/new-lib
pnpm init
# Editar package.json con name: @my/new-lib

# Con Nx
nx g @nx/js:lib new-lib
```

### Mover código entre paquetes

```bash
git mv packages/old/src/utils.ts packages/shared/src/utils.ts
# Actualizar imports
# Commit
```

Si tu tooling sabe del grafo de deps, valida que no rompiste nada.

### Importar de otro paquete

```typescript
// apps/web/src/page.tsx
import { Button } from '@my/ui';
import { formatDate } from '@my/shared';
```

Funciona porque pnpm/yarn/npm crean symlinks en `node_modules` apuntando al paquete local.

### Build pipeline

```
@my/shared  →  @my/ui  →  apps/web
              ↘
             apps/mobile
```

Turborepo/Nx entienden el grafo: build `shared` primero, luego `ui`, luego apps en paralelo.

## Anti-patterns monorepo

- ❌ Monorepo sin tooling (Nx/Turborepo) en proyecto grande
- ❌ Circular dependencies entre paquetes
- ❌ Paquete con TODO el código (sin granularidad)
- ❌ Apps importando de otras apps (deberían usar packages compartidos)
- ❌ Versionado independiente sin changesets
- ❌ CI que corre todo siempre
- ❌ Sin caché
- ❌ Diferentes lock files (mezclar npm + pnpm + yarn)
- ❌ Falta de boundaries (cualquier paquete importa de cualquier otro)

## Module boundaries (Nx-style)

Definir qué puede importar qué:

`nx.json`:
```json
{
  "namedInputs": {...},
  "targetDefaults": {...},
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "depConstraints": [
          {
            "sourceTag": "type:app",
            "onlyDependOnLibsWithTags": ["type:lib", "type:shared"]
          },
          {
            "sourceTag": "type:shared",
            "onlyDependOnLibsWithTags": ["type:shared"]
          }
        ]
      }
    ]
  }
}
```

Apps no pueden importar de otras apps. Shared no puede importar de feature libs. Etc.

## Monorepo y Git

### Tamaño del repo

Monorepos pueden crecer. Mitigaciones:

- **Shallow clone** en CI: `git clone --depth=1`
- **Partial clone**: `git clone --filter=blob:none`
- **Sparse checkout** si trabajás solo en una parte
- **Git LFS** para binarios grandes
- **Limpieza periódica** de branches mergeadas

### Sparse checkout

Trabajar solo con parte del monorepo:

```bash
git clone --no-checkout <url>
cd <repo>
git sparse-checkout init --cone
git sparse-checkout set apps/web packages/shared
git checkout main
```

Solo `apps/web` y `packages/shared` checkout. Útil en monorepos enormes.

### CODEOWNERS

Crítico para review:

```
# Cualquier cambio: ambos equipos pueden revisar
*  @platform-team

# Apps específicas
/apps/web/    @frontend-team
/apps/api/    @backend-team
/apps/mobile/ @mobile-team

# Packages compartidos
/packages/ui/      @design-system-team @frontend-team
/packages/shared/  @platform-team

# Security-sensitive
/apps/api/src/auth/    @security-team
```

## Migración: polyrepo → monorepo

1. **Elegir tooling** (Nx, Turborepo, etc.)
2. **Crear monorepo nuevo**
3. **Migrar uno a uno** usando `git filter-repo` para preservar historia:

```bash
# En repo-web
git filter-repo --to-subdirectory-filter apps/web

# En el monorepo
git remote add repo-web /path/to/repo-web
git fetch repo-web
git merge --allow-unrelated-histories repo-web/main
```

4. Actualizar imports
5. Configurar build orchestration
6. Eventualmente, deprecate repos viejos

## Migración: monorepo → polyrepo

Casos donde tiene sentido:
- Crecimiento excesivo del repo
- Equipos completamente independientes
- Diferentes licencias / contribuidores

```bash
# Extraer paquete a repo nuevo
git filter-repo --path packages/my-lib --path-rename packages/my-lib:/
# Hace de packages/my-lib la raíz de un nuevo repo
```

## Checklist monorepo

- [ ] Decisión clara: ¿por qué monorepo?
- [ ] Tooling instalado (Nx/Turborepo/pnpm workspaces mínimo)
- [ ] Estructura clara (apps/ + packages/)
- [ ] Convenciones de naming
- [ ] CI con detección de afectados
- [ ] Caché habilitado (local + remote si aplica)
- [ ] CODEOWNERS configurado
- [ ] Module boundaries definidos
- [ ] Versionado strategy (changesets si independiente)
- [ ] Lockfile único (no mezclar npm/yarn/pnpm)
- [ ] Build pipeline rápido (< 5 min para incremental)
- [ ] Documentación de cómo agregar paquete nuevo
- [ ] Documentación de cómo importar entre paquetes

## Recursos

- Nx: https://nx.dev
- Turborepo: https://turbo.build
- Monorepo.tools: https://monorepo.tools (comparativa)
- "Monorepo Explained" (Nx ebook)
