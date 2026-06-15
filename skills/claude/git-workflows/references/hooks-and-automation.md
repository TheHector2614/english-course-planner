# Hooks y Automatización

Pre-commit, pre-push, husky, lint-staged, secret scanning.

## Por qué hooks

CI es la **red de seguridad**, no el chequeo primario. Si lint falla en CI, perdiste 5+ minutos (push → CI → fail → fix → push de nuevo). Si falla local, lo arreglás en segundos.

**Reglas**:
- ✅ Pre-commit obligatorio para checks rápidos (< 5 segundos)
- ✅ Pre-push para checks más pesados (< 30 segundos)
- ❌ NUNCA bloquear con tests lentos en pre-commit (devs harán `--no-verify`)
- ❌ NUNCA hooks que requieran red obligatoria (offline = no commit)

## Frameworks

### pre-commit (Python, multi-lenguaje)

**El más universal**. Funciona para cualquier proyecto.

Instalación:
```bash
# pip
pip install pre-commit

# brew
brew install pre-commit

# Otros: https://pre-commit.com/#installation
```

Setup en el repo:
```bash
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push
```

`.pre-commit-config.yaml`:
```yaml
default_language_version:
  python: python3.12

repos:
  # Basic hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: detect-private-key
      - id: mixed-line-ending
        args: ['--fix=lf']

  # Secret scanning
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks

  # Conventional Commits
  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.13.0
    hooks:
      - id: commitizen
        stages: [commit-msg]

  # Python
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.3
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # YAML
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.35.1
    hooks:
      - id: yamllint
        args: [-c=.yamllint.yml]

  # Markdown
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.39.0
    hooks:
      - id: markdownlint
        args: [--fix]
```

Correr manualmente:
```bash
pre-commit run --all-files       # todos los hooks en todos los archivos
pre-commit run gitleaks          # un hook específico
pre-commit autoupdate            # actualizar versiones de hooks
```

### husky (JavaScript/TypeScript)

Para proyectos JS/TS. Más conveniente que pre-commit framework para este ecosystem.

Instalación:
```bash
npm install --save-dev husky lint-staged
npx husky init
```

`package.json`:
```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ],
    "*.css": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

`.husky/commit-msg`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

`.husky/pre-push`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

### lefthook (alternativa moderna, multi-lenguaje)

Más rápido que husky/pre-commit. Configuración YAML simple.

```bash
npm install --save-dev lefthook
# o brew install lefthook
```

`lefthook.yml`:
```yaml
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{ts,tsx,js,jsx}"
      run: npx eslint --fix {staged_files}
      stage_fixed: true

    prettier:
      glob: "*.{ts,tsx,js,jsx,json,md,yaml,yml,css}"
      run: npx prettier --write {staged_files}
      stage_fixed: true

    gitleaks:
      run: gitleaks protect --staged --verbose

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

## Lint y formato

### JavaScript/TypeScript

```bash
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

`eslint.config.js` (Flat config):
```javascript
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];
```

`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Python

```bash
pip install ruff
```

`pyproject.toml`:
```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "B", "UP"]

[tool.ruff.format]
quote-style = "double"
```

Más rápido que black + flake8 + isort combinados.

### Go

```bash
go install golang.org/x/tools/cmd/goimports@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

`.golangci.yml`:
```yaml
linters:
  enable:
    - govet
    - errcheck
    - staticcheck
    - gosimple
    - ineffassign
    - unused
    - misspell
```

### Java

```xml
<!-- Spotless Maven plugin -->
<plugin>
  <groupId>com.diffplug.spotless</groupId>
  <artifactId>spotless-maven-plugin</artifactId>
  <version>2.43.0</version>
  <configuration>
    <java>
      <googleJavaFormat/>
    </java>
  </configuration>
</plugin>
```

```bash
mvn spotless:apply
```

## Secret scanning

**Crítico**. Un secret committeado es un secret comprometido — rotación obligatoria aunque borres del historial.

### gitleaks (recomendado)

```bash
# Instalación
brew install gitleaks   # macOS
# o desde releases en GitHub

# Scan local
gitleaks detect --source . --verbose

# En pre-commit
gitleaks protect --staged --verbose
```

`.gitleaks.toml` (custom rules):
```toml
[allowlist]
description = "Allowlist"
paths = [
  '''README\.md''',
  '''examples/.*'''
]

[[rules]]
id = "company-api-key"
description = "Company API key"
regex = '''cmpny_[a-zA-Z0-9]{32}'''
keywords = ["cmpny_"]
```

### trufflehog (alternativa)

Más exhaustivo, también detecta secrets en commits viejos.

```bash
trufflehog git file://.
```

### detect-secrets (Yelp)

Buena opción Python-based.

### En CI (siempre, además de pre-commit)

GitHub Actions:
```yaml
- uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Si comiteás un secret

1. **Rotar inmediatamente** el secret (revocar, regenerar)
2. **NO confiar en borrar del historial**: ya está expuesto
3. `git filter-repo` o BFG para limpiar historial si es muy crítico
4. Notificar al equipo
5. Audit logs del proveedor por uso no autorizado

## Otros checks útiles

### Tests rápidos en pre-commit

```yaml
# lint-staged
"*.test.ts": ["jest --bail --findRelatedTests"]
```

Solo tests relacionados a los archivos cambiados.

### Type checking (TypeScript)

```yaml
# pre-push (tsc es lento)
npx tsc --noEmit
```

### Builds incremental

Si tu build es < 30s, en pre-push está bien. Si es más, mejor confiar en CI.

### Vulnerability scan en deps

```bash
# npm
npm audit

# Better: snyk, dependabot, renovate
```

Mejor en CI o automatizado (dependabot), no en pre-commit (lento).

## Bypass de hooks (cuándo es OK)

```bash
git commit --no-verify              # skip hooks pre-commit y commit-msg
git push --no-verify                # skip pre-push
```

**Cuándo OK**:
- Hotfix urgente con CI roto (raro)
- WIP en branch local que vas a squashear

**NUNCA OK**:
- "Es tedioso", "ya sé que va a fallar"
- Para commitear código con lint errors a propósito
- Por costumbre

Si devs usan `--no-verify` regularmente, los hooks están mal configurados (demasiado lentos o demasiado estrictos).

## CI: verifica hooks como red de seguridad

```yaml
# .github/workflows/quality.yml
name: Quality

on: [pull_request]

jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - uses: pre-commit/action@v3.0.1

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

Si pre-commit pasa local pero falla en CI: hay diferencia de entorno. Investigar.

## Performance: hooks rápidos

| Check | Tiempo aceptable pre-commit |
|---|---|
| Format (prettier, ruff format) | < 1s |
| Lint (eslint, ruff) | < 3s |
| Type check | < 5s |
| Secret scan (gitleaks) | < 2s |
| Tests unitarios filtrados | < 5s |

Si pre-commit total > 10s, los devs lo evitarán.

Estrategias:
- **lint-staged**: solo archivos staged
- **Caché** entre runs
- **Paralelización** (lefthook lo hace por defecto)
- **Mover lento a pre-push**

## CODEOWNERS

Auto-asignar reviewers según directorio.

`.github/CODEOWNERS` (o `CODEOWNERS` en raíz):
```
# Global default
* @team-name

# Frontend
/apps/web/    @frontend-team
/packages/ui/ @frontend-team

# Backend
/apps/api/    @backend-team

# Infra
/terraform/   @platform-team
/.github/     @platform-team

# Docs
*.md          @docs-team

# Database migrations need extra eyes
/migrations/  @backend-team @data-team

# Security-sensitive
**/auth/**    @security-team
**/payments/* @security-team @payments-team
```

GitHub respeta automáticamente. GitLab tiene equivalente.

## Dependabot / Renovate

Auto-actualización de dependencias.

### Dependabot

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    groups:
      dev-dependencies:
        dependency-type: development
        update-types: [minor, patch]

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly

  - package-ecosystem: pip
    directory: /
    schedule:
      interval: weekly
```

### Renovate (más configurable)

`renovate.json`:
```json
{
  "extends": ["config:base"],
  "schedule": ["before 4am on Monday"],
  "automerge": true,
  "automergeType": "pr",
  "packageRules": [
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}
```

## Templates en repo

### Issue templates

`.github/ISSUE_TEMPLATE/bug_report.yml`:
```yaml
name: Bug report
description: File a bug report
labels: [bug]
body:
  - type: markdown
    attributes:
      value: Thanks for taking the time to fill out this bug report!

  - type: input
    attributes:
      label: Version
      description: What version are you using?
      placeholder: "1.2.3"
    validations:
      required: true

  - type: textarea
    attributes:
      label: What happened?
      description: Description of the bug
    validations:
      required: true

  - type: textarea
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. ...
        2. ...
        3. ...
    validations:
      required: true

  - type: textarea
    attributes:
      label: Expected behavior

  - type: textarea
    attributes:
      label: Logs/Screenshots
      render: shell
```

### PR template

`.github/pull_request_template.md` (ver ejemplo en `pull-requests.md`).

## Checklist hooks & automation

- [ ] pre-commit framework o husky instalado
- [ ] Lint y format en pre-commit
- [ ] Secret scanning (gitleaks) en pre-commit
- [ ] Conventional Commits enforced en commit-msg
- [ ] Tests rápidos en pre-push (opcional)
- [ ] CI corre los mismos checks como safety net
- [ ] Pre-commit total < 10s (devs no evitan)
- [ ] CODEOWNERS configurado
- [ ] Dependabot o Renovate activo
- [ ] PR/Issue templates en repo
- [ ] Documentación en CONTRIBUTING.md
- [ ] Onboarding incluye `pre-commit install`
