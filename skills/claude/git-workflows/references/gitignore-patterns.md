# .gitignore Patterns y .gitattributes

Patrones para diferentes stacks. Git LFS para archivos grandes.

## Principio: nunca commitear

- ❌ Secrets, credentials, `.env`
- ❌ Archivos generados (build/, dist/, node_modules/)
- ❌ IDE settings personales (.idea/, .vscode/ — ver excepción)
- ❌ OS files (.DS_Store, Thumbs.db)
- ❌ Logs y cachés
- ❌ Archivos binarios grandes (usar Git LFS)
- ❌ Test results, coverage reports

## Sintaxis `.gitignore`

```gitignore
# Comentario

# Archivo específico
secrets.env

# Patrón
*.log

# Directorio
node_modules/

# Subdirectorio en cualquier nivel
**/dist/

# Negación (mantener este archivo aunque coincida con patrón anterior)
*.log
!important.log

# Solo en raíz
/build

# Solo archivos (no directorios)
*.bak
!docs/*.bak/   # mantener directorios .bak/

# Glob avanzado
src/**/*.test.js     # tests en cualquier nivel bajo src/
```

## Templates por stack

GitHub mantiene: https://github.com/github/gitignore

### Node.js / JavaScript / TypeScript

```gitignore
# Dependencies
node_modules/
.pnp.*
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz

# Build outputs
dist/
build/
out/
.next/
.nuxt/
.svelte-kit/
.astro/
.turbo/
.cache/

# TypeScript
*.tsbuildinfo

# Testing
coverage/
.nyc_output/
*.lcov

# IDE
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
logs/
*.log

# Runtime
.npm
.eslintcache
.stylelintcache
.parcel-cache

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Optional
.node_repl_history
```

### Python

```gitignore
# Byte-compiled / cache
__pycache__/
*.py[cod]
*$py.class
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
.venv/
env/
ENV/

# PyInstaller
*.manifest
*.spec

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/
.nox/
.hypothesis/
nosetests.xml
coverage.xml
*.cover
.cache

# Linters / formatters
.ruff_cache/
.mypy_cache/
.dmypy.json
dmypy.json
.pyre/

# Jupyter
.ipynb_checkpoints/

# IDE
.idea/
.vscode/
*.swp

# Environment
.env
.env.*

# OS
.DS_Store
Thumbs.db
```

### Java / Kotlin / Gradle / Maven

```gitignore
# Build outputs
target/
build/
out/

# IntelliJ
.idea/
*.iml
*.iws
*.ipr

# Eclipse
.classpath
.project
.settings/
.metadata/
bin/

# Maven
.mvn/
mvnw
mvnw.cmd

# Gradle
.gradle/
gradle-app.setting
!gradle-wrapper.jar
!gradle-wrapper.properties

# Logs
*.log
hs_err_pid*

# Spring
.springBeans
.sts4-cache

# OS
.DS_Store
Thumbs.db
```

### Go

```gitignore
# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage
*.out
coverage.txt

# Go workspace
go.work
go.work.sum

# Vendor (si no usás vendoring)
vendor/

# Dependency directories
*.tar.gz

# IDE
.idea/
.vscode/
```

### Rust

```gitignore
# Build output
target/

# Cargo lock (libraries: incluir; aplicaciones: incluir generally)
# Cargo.lock (descomentar para libraries que NO se publican)

# Backup files
**/*.rs.bk

# IDE
.idea/
.vscode/
```

### .NET / C#

```gitignore
# Build outputs
bin/
obj/

# User-specific files
*.suo
*.user
*.userosscache
*.sln.docstates

# Build results
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/

# IIS
.vs/

# NuGet
packages/
*.nupkg

# Visual Studio Code
.vscode/
```

### Docker

```gitignore
# Docker
docker-compose.override.yml
.docker/
```

### Terraform

```gitignore
# Local state
*.tfstate
*.tfstate.*
*.tfstate.backup

# Crash logs
crash.log
crash.*.log

# Variable files con secrets
*.tfvars
*.tfvars.json

# Module directory
.terraform/
.terraform.lock.hcl

# Ignore CLI configuration
.terraformrc
terraform.rc
```

⚠️ `terraform.tfvars` puede tener secrets. Si tenés `terraform.tfvars.example`, OK commitear.

### Mobile (iOS / Android)

iOS:
```gitignore
# Xcode
build/
DerivedData/
*.xcworkspace/xcuserdata/
*.xcodeproj/project.xcworkspace/xcuserdata/
*.xcodeproj/xcuserdata/

# CocoaPods
Pods/

# Swift Package Manager
.swiftpm/
.build/

# fastlane
fastlane/report.xml
fastlane/screenshots/
fastlane/test_output/
```

Android:
```gitignore
# Built application files
*.apk
*.aar
*.ap_
*.aab

# Files for the ART/Dalvik VM
*.dex

# Java class files
*.class

# Generated files
bin/
gen/
out/
build/

# Gradle files
.gradle/
local.properties

# IDE
.idea/
*.iml
.kotlin/
```

## Patrones globales (cross-projects)

`~/.gitignore_global`:
```gitignore
# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Editor swap files
*.swp
*.swo
*~
.#*
\#*#

# IDE configs personales
.idea/workspace.xml
.vscode/settings.json   # si es preferencias personales
```

Configurar:
```bash
git config --global core.excludesfile ~/.gitignore_global
```

## Sobre `.vscode/` y `.idea/`

Debate común. Opciones:

**Opción A: ignorar completamente**
```gitignore
.vscode/
.idea/
```

Cada dev configura su IDE.

**Opción B: commitear ajustes compartidos**
```gitignore
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
```

`settings.json` con linter, format, etc. del proyecto. Personal stuff fuera.

**Recomendación**: Opción B con configs útiles compartidas (linter, recommended extensions, debug configs).

## Sobre `lockfiles`

**Lockfiles SÍ se commitean**:
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `Cargo.lock` (apps; libraries: discusión)
- `composer.lock`
- `Pipfile.lock`, `poetry.lock`
- `Gemfile.lock`

Razón: reproducibilidad. Sin lockfile, `npm install` puede traer versiones distintas en cada máquina.

**Excepción**: librerías que se publican (no apps). Cargo y npm tienen filosofías distintas — verificar la del ecosystem.

## `.gitattributes`

Configurar comportamiento de Git por archivo.

### Line endings (crítico cross-platform)

```
* text=auto

# Force LF
*.sh text eol=lf
*.bash text eol=lf
*.yaml text eol=lf
*.yml text eol=lf

# Force CRLF (Windows)
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Binarios
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
*.tar.gz binary
*.exe binary
*.dll binary
*.so binary
```

### Diff customization

```
# Diff de package-lock.json con menos ruido
package-lock.json -diff

# Markdown como text (no binary)
*.md text

# YAML como text
*.yaml text
*.yml text
```

### Linguist (GitHub language detection)

```
# Marcar como generated (no cuenta para stats)
generated/*.js linguist-generated

# Forzar lenguaje
*.tpl linguist-language=Smarty

# Excluir de stats
docs/* linguist-documentation
```

### Export ignore (cuando alguien hace archive download)

```
# No incluir en tarballs
docs/        export-ignore
tests/       export-ignore
.github/     export-ignore
```

## Git LFS (Large File Storage)

Para archivos grandes (>100 MB). GitHub bloquea push de archivos > 100 MB.

### Instalación

```bash
# macOS
brew install git-lfs

# Linux
sudo apt install git-lfs

# Windows: include en Git for Windows installer

# Activar en repo
git lfs install
```

### Track archivos

```bash
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.mp4"
git lfs track "models/*.bin"

# Genera entrada en .gitattributes:
# *.psd filter=lfs diff=lfs merge=lfs -text
```

Commitear `.gitattributes` al repo.

### Workflow

```bash
git add file.psd
git commit -m "feat: add design"
git push
# LFS sube el blob a storage, pointer al repo Git
```

### Verificar archivos LFS

```bash
git lfs ls-files
git lfs status
git lfs pull       # download de LFS storage
```

### Limitaciones

- LFS storage cuesta (GitHub: $5/mes por 50GB)
- Bandwidth limit en planes free
- Clones más lentos (descargan blobs)
- `git lfs migrate` para mover archivos ya commiteados sin LFS

### Cuándo Git LFS

✅ Sí:
- Diseños (PSD, AI, Sketch)
- Videos
- Modelos ML
- Datasets binarios
- Mockups grandes

❌ No:
- Archivos pequeños (overhead innecesario)
- Código compilado (no commitear)
- Documentos Word (considerar PDF + source)

## Auditar `.gitignore`

Verificar qué se está ignorando:

```bash
# ¿Por qué este archivo está ignored?
git check-ignore -v <archivo>

# Listar todos los ignored
git status --ignored

# Listar tracked files que matchean .gitignore patterns
git ls-files --ignored --exclude-standard --others --directory
```

## Eliminar archivos ya commiteados

Si commitastes algo que debió estar ignored:

```bash
# Quitar de tracking pero mantener localmente
git rm --cached <archivo>

# Para directorios
git rm -r --cached <directorio>

# Agregar al .gitignore
echo "<archivo>" >> .gitignore

# Commit
git commit -m "chore: stop tracking <archivo>"
```

**Cuidado**: el archivo sigue en historia. Si era un secret, ya está comprometido.

Para borrar de toda la historia (si fue secret):
```bash
git filter-repo --invert-paths --path <archivo>
# o BFG Repo-Cleaner
```

## Tools y servicios

### Generadores de `.gitignore`

- https://www.toptal.com/developers/gitignore
- VSCode extension: "gitignore" by CodeZombie
- CLI: `gibo` (formerly gitignore-cli)

```bash
gibo dump Node Python Java > .gitignore
```

### Verificar secrets accidentalmente commiteados

- **gitleaks**: scan en pre-commit y CI (ver `hooks-and-automation.md`)
- **trufflehog**: análisis profundo
- **git-secrets** (AWS): pre-commit hook

## Checklist `.gitignore` / `.gitattributes`

- [ ] `.gitignore` apropiado al stack
- [ ] No incluye archivos generados (build, dist, node_modules)
- [ ] No incluye IDE personal (excepto configs compartidos)
- [ ] No incluye OS files (.DS_Store, Thumbs.db)
- [ ] No incluye logs, cachés, temp
- [ ] **No incluye secrets** (`.env`, keys)
- [ ] Lockfiles SÍ están commiteados (excepto libs específicas)
- [ ] `.gitattributes` con line endings configurados
- [ ] `.gitattributes` con `text/binary` para archivos no-source
- [ ] Git LFS configurado si hay archivos grandes
- [ ] Secret scanning activo (no confiar solo en .gitignore)
