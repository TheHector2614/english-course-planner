# Releases y Semantic Versioning

semantic-release, release-please, changesets, changelogs automáticos.

## Semantic Versioning (SemVer)

`MAJOR.MINOR.PATCH`:

- **MAJOR**: cambios incompatibles (breaking)
- **MINOR**: funcionalidad nueva compatible
- **PATCH**: bug fixes compatibles

Ejemplo: `1.4.2` → `1.4.3` (patch), → `1.5.0` (minor), → `2.0.0` (major).

### Pre-releases

`1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`.

Orden:
```
1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

### Versión 0.x.y

Pre-1.0: cualquier cambio puede ser breaking. Convención común en `0.x.y`:
- `0.MINOR.PATCH` donde MINOR puede ser breaking

### Cuándo bumpear major a 1.0

Cuando la API es **estable** y querés comprometerte a SemVer estricto.

## Mapping Conventional Commits → SemVer

| Commit | Bump |
|---|---|
| `feat:` | MINOR |
| `fix:`, `perf:` | PATCH |
| `feat!:`, `fix!:` (con `!`) | MAJOR |
| `BREAKING CHANGE:` en footer | MAJOR |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:`, etc. | Sin bump por default |

Esto permite **calcular versión automáticamente** desde commits.

## Tags y releases

### Crear tag

```bash
# Annotated tag (recomendado)
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3

# Push all tags
git push --tags

# Listar tags
git tag -l
git tag -l "v1.*"

# Ver detalles
git show v1.2.3
```

### Tag firmado

```bash
git tag -s v1.2.3 -m "Release 1.2.3"
```

Verificar:
```bash
git tag -v v1.2.3
```

Branch protection puede requerir signed tags.

### Borrar tag (raro)

```bash
git tag -d v1.2.3              # local
git push origin :refs/tags/v1.2.3  # remote
```

**Regla**: tags son inmutables. Si necesitás "corregir" un tag, crear `v1.2.4` en su lugar.

### Lightweight vs annotated

```bash
git tag v1.2.3                 # lightweight (solo puntero)
git tag -a v1.2.3 -m "msg"     # annotated (con metadata)
```

**Usar annotated**. Es el estándar para releases.

## Estrategias de release

### Manual con changelog

Más simple, control total:

1. Decidir versión (siguiendo SemVer)
2. Actualizar CHANGELOG.md
3. Bump version en `package.json` / `pom.xml` / `Cargo.toml` / etc.
4. Commit: `chore(release): v1.2.3`
5. Tag: `git tag -a v1.2.3 -m "Release 1.2.3"`
6. Push: `git push && git push --tags`
7. Crear release en GitHub/GitLab (con notas)

### standard-version

```bash
npm install --save-dev standard-version
```

```bash
npx standard-version                  # bump basado en commits
npx standard-version --release-as 2.0.0  # forzar versión
npx standard-version --first-release   # no bump, solo tag
```

Automáticamente:
- Calcula nueva versión desde commits
- Bumpea `package.json`
- Genera/actualiza `CHANGELOG.md`
- Crea commit + tag

Después: `git push --follow-tags origin main`.

⚠️ standard-version está en modo mantenimiento. Considerar alternativas.

### semantic-release (full automation)

El más automatizado. Para releases continuas (cada PR a main genera release si corresponde).

```bash
npm install --save-dev semantic-release \
  @semantic-release/changelog \
  @semantic-release/commit-analyzer \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  @semantic-release/release-notes-generator
```

`.releaserc.json`:
```json
{
  "branches": ["main", { "name": "beta", "prerelease": true }],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    ["@semantic-release/npm", { "npmPublish": true }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

GitHub Action:
```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  issues: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - run: npm ci
      - run: npm audit signatures
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Flow:
1. PR mergea a main
2. CI corre semantic-release
3. semantic-release lee commits desde último tag
4. Calcula versión nueva (o no hace nada si solo `docs:`, `chore:`)
5. Actualiza CHANGELOG.md
6. Crea tag
7. Publica a npm
8. Crea GitHub release con notas

**Pros**:
- Cero intervención manual
- Cero risk de olvidar release
- Changelog siempre sincronizado

**Cons**:
- Mucha magia (curva inicial)
- Si commits no siguen Conventional → releases incorrectas
- Difícil rollback de un release publicado

### release-please (Google)

Alternativa a semantic-release. **PR-based**: en lugar de release automática, crea PR de release que mergeás cuando quieras.

```yaml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v4
        with:
          release-type: node   # o: python, go, rust, java, etc.
          package-name: my-package
```

Flow:
1. Push a main
2. release-please abre/actualiza un PR titulado "chore: release X.Y.Z"
3. Este PR acumula cambios hasta que mergeás
4. Al mergear: crea tag, GitHub release, opcionalmente publica

**Pros**:
- Multi-lenguaje
- Control: vos decidís cuándo releasear
- PR de release visible y revisable

**Cons**:
- Un poco más de fricción que full-automation
- Setup más simple que semantic-release

### Changesets (monorepos)

Especializado en monorepos JS/TS con versionado independiente.

```bash
npm install --save-dev @changesets/cli
npx changeset init
```

Workflow:
```bash
# Al hacer cambio
npx changeset
# Pregunta: qué paquetes, tipo de bump, descripción
# Crea archivo .changeset/<random>.md

# En CI o manualmente
npx changeset version    # bumpea versiones + changelog
npx changeset publish    # publica a npm
```

GitHub Action:
```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - uses: changesets/action@v1
        with:
          publish: npm run release
          version: npm run version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Crea PR "Version Packages" agregando todos los changesets pendientes. Al mergear: publica.

**Pros**:
- Monorepo-aware (cada paquete su versión)
- Control granular
- Reviewable workflow

**Cons**:
- Más esfuerzo manual que semantic-release

### Goreleaser (Go)

```yaml
# .goreleaser.yml
builds:
  - id: my-cli
    binary: my-cli
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]

archives:
  - format: tar.gz
    name_template: '{{ .ProjectName }}_{{ .Version }}_{{ .Os }}_{{ .Arch }}'

release:
  github:
    owner: org
    name: repo

changelog:
  use: github
  sort: asc
```

```bash
goreleaser release --clean
```

Genera binarios cross-platform, los sube como release, actualiza Homebrew tap, etc.

### Cargo-release (Rust)

```bash
cargo install cargo-release
cargo release --execute patch  # bumpea, commitea, taggea, publica
```

### Maven Release Plugin (Java)

```bash
mvn release:prepare release:perform
```

Más manual que las opciones JS/TS.

## CHANGELOG.md

### Formato Keep a Changelog

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Cosas no releaseadas todavía

## [1.2.0] - 2026-05-21

### Added
- New endpoint `/api/v1/orders/bulk` for batch creation
- Support for `customer_id` filter on `GET /api/v1/orders`

### Changed
- `GET /api/v1/users` now returns `email_verified` field

### Deprecated
- `GET /api/v1/user/{id}` (use `/api/v1/users/{id}`)

### Removed
- Removed legacy `/v0/*` endpoints (deprecated since v1.0)

### Fixed
- Fix null pointer when user has no orders ([#456](issues/456))

### Security
- Update `lodash` to patch CVE-2026-12345

## [1.1.0] - 2026-04-15

...

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/releases/tag/v1.1.0
```

### Tipos estándar

- **Added**: nuevas features
- **Changed**: cambios en funcionalidad existente
- **Deprecated**: features que se quitarán pronto
- **Removed**: features quitadas
- **Fixed**: bug fixes
- **Security**: fixes de seguridad

### Auto-generación

Tools generan CHANGELOG desde commits Conventional. Aún así, **revisar antes de release**:
- Reordenar items por importancia
- Agregar contexto al usuario
- Marcar breaking changes claramente
- Linkear PRs/issues/migrations

## Release notes

Distinto del CHANGELOG (más para developers). Release notes son para **usuarios**:

```markdown
# Release v1.2.0 — "Better Orders"

## Highlights

🎉 **New: Bulk order creation**

Create up to 100 orders in a single request with the new `/api/v1/orders/bulk` endpoint. Saves API calls and reduces latency for batch workflows.

🐛 **Fixed: Null pointer in user profile**

We fixed an issue where the profile endpoint crashed for users with no orders. Thanks @contributor for the report!

## Breaking changes

None.

## Migration guide

No migrations needed for this release.

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list.

## Acknowledgments

Thanks to all contributors: @user1, @user2, @user3.
```

GitHub auto-genera con "Generate release notes" en la UI de tags.

## Releases en cada plataforma

### GitHub Releases

- Tag + release page
- Attached binaries
- Auto-generated notes (desde PRs mergeadas)
- Discussion link
- Marcar como pre-release
- Latest release tag

```bash
gh release create v1.2.3 --generate-notes
gh release create v1.2.3 --notes-file CHANGELOG.md
gh release create v1.2.3 dist/* --notes "Release notes here"
```

### GitLab Releases

Similar a GitHub. Comando:
```bash
glab release create v1.2.3 --notes "..."
```

### Bitbucket / Azure DevOps

Releases más limitados. Foco en tags.

## Versioned releases vs continuous deployment

### Versioned releases (libraries, SDKs, CLIs)

- Tags claros: `v1.0.0`, `v1.1.0`
- Users eligen cuándo actualizar
- CHANGELOG es importante

### Continuous deployment (webapps, SaaS)

- Cada merge a main → deploy
- "Versión" puede ser SHA del commit
- Cambios visibles a usuarios inmediatamente
- No hay "release notes" tradicional (in-app changelog opcional)

Híbrido común:
- Webapp: continuous deployment + monthly "release blog"
- API: versioned (`/v1/`, `/v2/`)
- Internal libs: versioned

## Rollbacks de releases

### Continuous deployment

Revert + redeploy (delegar a `aws-cloud` para infra rollback).

### Versioned releases (libraries)

NO se puede "deshacer" una versión publicada.

**Opciones**:
1. **Deprecate + new version**:
   ```bash
   npm deprecate my-pkg@1.2.3 "Critical bug, use 1.2.4 instead"
   # Release 1.2.4 con fix
   ```

2. **Unpublish** (npm, dentro de 72h):
   ```bash
   npm unpublish my-pkg@1.2.3
   ```
   ⚠️ Polémico. Rompe consumidores. Solo en emergencia (secrets leaked, malware).

3. **Yank** (crates.io):
   ```bash
   cargo yank --version 1.2.3
   ```
   La versión sigue accesible pero no se usa en `cargo install` nuevos.

## Pre-releases y canary

Para probar antes de release estable:

### npm

```bash
npm publish --tag beta
# Users: npm install my-pkg@beta
```

semantic-release:
```json
{
  "branches": [
    "main",
    { "name": "beta", "prerelease": true },
    { "name": "alpha", "prerelease": true }
  ]
}
```

Push a `beta` → releases como `1.3.0-beta.1`, `1.3.0-beta.2`, etc.

### Canary releases

Versión con SHA:
```bash
npm publish --tag canary
# my-pkg@0.0.0-canary-abc1234
```

Para testing super temprano.

## Anti-patterns en releases

- ❌ Releases sin tag (no podés referenciar)
- ❌ Tags movibles (rompen consumidores)
- ❌ Versionado caprichoso (no SemVer)
- ❌ CHANGELOG inexistente o desactualizado
- ❌ Breaking changes sin major bump
- ❌ Major bump para cambios menores ("paradox of major version 4.0")
- ❌ Releases manuales en producción sin checklist
- ❌ Sin signed tags en proyectos críticos
- ❌ Release sin testing pre-release
- ❌ Sin plan de rollback
- ❌ Liberar viernes a las 17h

## Release checklist

### Pre-release

- [ ] Branch protection: solo PRs mergeadas
- [ ] Todos los tests pasan
- [ ] CHANGELOG actualizado
- [ ] Documentación actualizada
- [ ] Breaking changes documentados con migration guide
- [ ] Pre-release probada en staging
- [ ] Stakeholders notificados si breaking

### Release

- [ ] Version bump correcto (SemVer)
- [ ] Tag firmado y annotated
- [ ] CHANGELOG entry definitivo
- [ ] Release notes user-facing
- [ ] Package publicado al registry
- [ ] Tag pusheado: `git push --follow-tags`
- [ ] GitHub release creado
- [ ] Comunicación (blog, Twitter, mailing list si aplica)

### Post-release

- [ ] Verificar install del package fresh
- [ ] Smoke test del software publicado
- [ ] Monitor de issues recientes
- [ ] Plan de rollback ready si necesario

## Recomendación por contexto

| Contexto | Tool |
|---|---|
| **Library JS/TS chica** | standard-version o release-please |
| **Library JS/TS importante** | semantic-release |
| **Monorepo JS/TS** | changesets |
| **Library Python** | release-please o manual |
| **Library Rust** | cargo-release |
| **Library Go / CLI** | goreleaser |
| **Library Java** | release-please o Maven Release Plugin |
| **Multi-lenguaje** | release-please |
| **Webapp / SaaS** | Continuous deployment, sin versioned releases |
| **Mobile** | Manual (linkeado a versiones de stores) |
