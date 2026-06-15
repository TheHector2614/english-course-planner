# Health Check: Auditoría de Git Workflow

Checklist para evaluar y reportar el estado del workflow Git de un proyecto.

## Cómo usar

Cuando el usuario pida "audita mi repo", "qué falta en mi workflow Git", aplicar este checklist por categorías. Reportar con severidad:

- 🔴 **Crítico**: riesgo de pérdida de datos, secrets expuestos, sin proceso de review
- 🟠 **Alto**: falta automatización clave, branches frágiles, mal proceso
- 🟡 **Medio**: mejoras importantes pero no urgentes
- 🟢 **Bajo**: nice-to-have

## 1. Branch protection

### Critical
- [ ] Main branch protegida (no force push, no deletion)
- [ ] Require PR before merging (no commits directos)
- [ ] Require approvals (al menos 1 en equipo)
- [ ] Require status checks (CI verde)
- [ ] Require signed commits (proyectos serios)

### Alto
- [ ] CODEOWNERS configurado
- [ ] Conversation resolution required
- [ ] Linear history si rebase strategy
- [ ] Restrict who can push (Maintainers only)
- [ ] Required reviewers from Code Owners

### Verificación

**GitHub**: `gh api repos/:owner/:repo/branches/main/protection`
**GitLab**: Settings → Repository → Protected branches

## 2. Commits

### Crítico
- [ ] No hay secrets en historia (scan con gitleaks)
- [ ] Sin archivos enormes que deberían estar en LFS

```bash
# Detectar archivos grandes en historia
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 --reverse | head -20

# Scan de secrets
gitleaks detect --source . --verbose
```

### Alto
- [ ] Conventional Commits aplicado (o convención clara)
- [ ] Pre-commit hook que valida formato
- [ ] Commits firmados (signed)
- [ ] CI verifica signed commits

### Medio
- [ ] Mensajes claros, sin "fix stuff" / "wip"
- [ ] Commits atómicos (un cambio lógico cada uno)
- [ ] Sin merges innecesarios (rebase para actualizar features)

### Verificación

```bash
# Commits no firmados en main
git log --pretty='format:%H %G? %s' main | grep -v ' G '

# Commits sin Conventional
git log --pretty=format:'%s' main | grep -vE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: '

# Mensajes vagos
git log --pretty=format:'%s' | grep -iE '(wip|fix stuff|updates?|changes|asdf|misc)'
```

## 3. Hooks y automatización

### Crítico
- [ ] Pre-commit hook con secret scanning
- [ ] CI corre en cada PR
- [ ] CI bloquea merge si rojo

### Alto
- [ ] Pre-commit con lint/format
- [ ] Pre-commit con commitlint (Conventional)
- [ ] Pre-push con tests rápidos (opcional pero útil)
- [ ] CODEOWNERS auto-asignación

### Medio
- [ ] Dependabot / Renovate activo
- [ ] PR templates configurados
- [ ] Issue templates configurados

### Verificación

```bash
# ¿Hay hooks instalados?
ls -la .git/hooks/

# ¿pre-commit framework?
cat .pre-commit-config.yaml

# ¿husky?
ls -la .husky/

# ¿GitHub Actions / GitLab CI / etc.?
ls .github/workflows/ .gitlab-ci.yml bitbucket-pipelines.yml 2>/dev/null
```

## 4. Branching strategy

### Crítico
- [ ] Estrategia clara y documentada
- [ ] Branches no eternas (>2 semanas = problema)

### Alto
- [ ] Naming convention seguida
- [ ] Branches mergeadas se borran
- [ ] No branches huérfanas/stale

### Medio
- [ ] CONTRIBUTING.md describe el flow
- [ ] Onboarding incluye explicación de branching

### Verificación

```bash
# Branches stale (más de N días sin actividad)
git for-each-ref --sort=-committerdate refs/remotes/origin/ \
  --format='%(committerdate:short) %(refname:short) %(authorname)' | \
  awk '$1 < "'"$(date -d '30 days ago' +%Y-%m-%d)"'"'

# Branches mergeadas pero no borradas
git branch -r --merged origin/main | grep -v 'main\|HEAD'
```

## 5. Pull Requests / Merge Requests

### Crítico
- [ ] PRs requeridas (no commits directos a main)
- [ ] Reviews antes de merge
- [ ] CI verde antes de merge

### Alto
- [ ] PR template existe
- [ ] PRs pequeñas (no merges de 5000 líneas)
- [ ] Tiempo razonable de first review (< 24h)
- [ ] Auto-delete de branches después de merge

### Medio
- [ ] Squash merge configurado (consistencia)
- [ ] Draft PRs cuando WIP
- [ ] Descripciones útiles (no solo título)

### Verificación

```bash
# Estadísticas con gh (GitHub)
gh pr list --state merged --limit 50 --json additions,deletions,number,title

# Manualmente
gh api repos/:owner/:repo/pulls?state=closed --paginate | jq '.[] | .additions + .deletions'
```

## 6. Tags y releases

### Crítico
- [ ] Tags inmutables (nunca movidos)
- [ ] Releases versionadas con SemVer

### Alto
- [ ] Tags firmados (proyectos serios)
- [ ] CHANGELOG actualizado
- [ ] Release notes user-facing

### Medio
- [ ] Releases automatizadas (semantic-release / release-please)
- [ ] Tag annotation correcto (`git tag -a`, no lightweight)

### Verificación

```bash
# Listar tags
git tag -l

# Tags lightweight vs annotated
git for-each-ref refs/tags --format='%(refname:short) %(objecttype)'

# Verificar tag firmado
git tag -v v1.0.0

# Versionado SemVer
git tag -l | grep -vE '^v?\d+\.\d+\.\d+'
```

## 7. Seguridad

(Delegar profundo a `web-backend-security`)

### Crítico
- [ ] **No hay secrets en historia** (verified con scan)
- [ ] 2FA habilitado en org
- [ ] Tokens con scope mínimo
- [ ] Secret scanning del provider activo
- [ ] Signed commits enforced en main

### Alto
- [ ] Dependabot alerts revisadas
- [ ] Security advisories monitoreadas
- [ ] OIDC para CI → cloud (no long-lived secrets)
- [ ] Permissions granulares en GitHub Actions

### Medio
- [ ] Auditoría periódica de access
- [ ] Outside Collaborators apropiados
- [ ] Personal Access Tokens auditados

### Verificación

```bash
# GitHub security features
gh api repos/:owner/:repo --jq '.security_and_analysis'

# Listar collaborators
gh api repos/:owner/:repo/collaborators

# Scan completo
gitleaks detect --source . --verbose --redact
trufflehog git file://. --json
```

## 8. Documentación

(Delegar a `technical-docs`)

### Crítico
- [ ] README presente y funcional
- [ ] LICENSE explícito

### Alto
- [ ] CONTRIBUTING.md describe el workflow
- [ ] CODEOWNERS o equivalente
- [ ] PR/Issue templates

### Medio
- [ ] CHANGELOG mantenido
- [ ] Convenciones de naming documentadas
- [ ] Onboarding doc para nuevos contributors

## 9. CI/CD

### Crítico
- [ ] CI corre en cada PR
- [ ] CI tests pasando para mergear

### Alto
- [ ] CI corre tests + lint + build + security scan
- [ ] CI usa OIDC (no long-lived cloud secrets)
- [ ] Status checks requeridos en branch protection
- [ ] CI corre con dependencias caché (rapidez)

### Medio
- [ ] CI corre solo lo afectado (monorepo)
- [ ] CI usa matrix para multiple targets/versions
- [ ] PR previews automáticos (docs, frontends)

### Verificación

```bash
# Ver workflows
ls .github/workflows/

# Estado CI de últimas runs
gh run list --limit 10

# Estado de PR actual
gh pr checks
```

## 10. Git LFS y archivos grandes

### Crítico
- [ ] No hay archivos > 100MB en historia (que no estén en LFS)
- [ ] Si hay LFS, configurado correctamente

### Alto
- [ ] Binarios grandes en LFS
- [ ] `.gitattributes` lista los patrones LFS
- [ ] No commiteo accidental de binarios grandes

### Verificación

```bash
# Archivos LFS
git lfs ls-files

# Archivos grandes en historia (no-LFS)
git rev-list --all --objects | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort -nrk2 | \
  head -20
```

## 11. Configuración del repo

### Crítico
- [ ] Default branch correcto (`main` típicamente)
- [ ] Branch protection rules definidas

### Alto
- [ ] Issue templates configurados
- [ ] Auto-delete branches después de merge
- [ ] Squash/rebase configurado (no permitir todas)
- [ ] Comment on PR with run history

### Medio
- [ ] Topics/tags del repo
- [ ] Description y website fields
- [ ] Visibility apropiada (public/private/internal)

## Reporte de health check

### Template de reporte

```markdown
# Git Workflow Audit: <repo>

## Resumen ejecutivo

- Plataforma: GitHub
- Hallazgos: 2 críticos, 5 altos, 8 medios
- Severity overall: 🟠 Alto (acciones requeridas pronto)

## Findings

### 🔴 Crítico

#### 1. Sin branch protection en `main`
**Riesgo**: cualquiera puede force-push y borrar historia
**Recomendación**: Settings → Branches → Add rule para `main`:
- Require PR + 1 approval
- Require status checks
- Restrict deletions
- Block force pushes
**Esfuerzo**: 10 min

#### 2. Secrets en historia del repo
**Detalle**: `gitleaks` detectó:
- `config/aws-key.txt` en commit `abc1234` (hace 6 meses)
- API token en `.env.example` en commit `def5678`
**Riesgo**: secrets ya expuestos, asumir comprometidos
**Recomendación**:
1. ROTAR los secrets inmediatamente
2. (Opcional) Limpiar historia con `git filter-repo`
3. Verificar logs del proveedor por uso no autorizado
4. Agregar gitleaks a pre-commit + CI
**Esfuerzo**: 1-2h

### 🟠 Alto

#### 3. Sin Conventional Commits
**Detalle**: 70% de commits no siguen formato
**Recomendación**:
- Setup commitlint
- Pre-commit hook para validar
- Documentar en CONTRIBUTING.md
**Esfuerzo**: 30 min

[...]

### 🟡 Medio

[...]

## Plan de acción priorizado

### Sprint 1 (esta semana): críticos
1. Habilitar branch protection (P0)
2. Rotar secrets expuestos (P0)
3. Setup gitleaks (P0)

### Sprint 2: altos
1. Setup Conventional Commits + commitlint
2. PR template
3. CODEOWNERS

### Sprint 3: medios
1. Documentar workflow en CONTRIBUTING
2. Configurar Dependabot
3. Migrar a OIDC para CI

## Métricas a monitorear

- % de PRs aprobadas en primera ronda
- Tiempo promedio a merge
- Commits firmados / total
- Vulnerabilidades de Dependabot abiertas
```

## Quick wins

Los fixes que más impacto tienen en la mayoría de repos:

1. **Habilitar branch protection en main** (10 min, evita catástrofes)
2. **Setup pre-commit con gitleaks** (30 min, evita secret leaks)
3. **Conventional Commits + commitlint** (1h, base para automation)
4. **CODEOWNERS** (30 min, mejor distribución de reviews)
5. **PR template** (15 min, mejor calidad de PRs)
6. **Auto-delete branches** (5 min, repo más limpio)
7. **Required status checks** (15 min, no merges con CI roja)
8. **Dependabot habilitado** (10 min, security updates auto)
9. **2FA obligatorio en org** (varía, pero crítico)
10. **Signed commits required** (1h, audit trail confiable)

## Anti-patterns a buscar

Durante audit, banderas rojas:

- Commits directos a main (debería ser imposible con branch protection)
- Force push a main aparece en reflog del remote
- Branches con nombres genéricos (`temp`, `wip`, `fix`)
- PRs con cientos de archivos cambiados
- Sin tests en CI
- Sin status checks requeridos
- Tokens largos sin scope claro
- Mismo dev creando y aprobando PRs (self-approval)
- Workflows que disablean checks (`if: false`)
- Commits con `[skip ci]` rutinarios
- Tags reescritos (tags movibles)
- Branches eternas (>30 días sin merge)
- Sin signed commits en proyectos serios
- Hooks bypaseados rutinariamente (`--no-verify` en logs)

## Checklist resumido (post-audit)

- [ ] Branch protection en main funcional
- [ ] No secrets en repo (scanned)
- [ ] Pre-commit hooks activos
- [ ] CI funcional con required status checks
- [ ] Conventional Commits enforced
- [ ] Signed commits enforced (si aplica)
- [ ] CODEOWNERS configurado
- [ ] PR template + issue templates
- [ ] Dependabot/Renovate activo
- [ ] 2FA obligatorio
- [ ] Auto-delete branches después de merge
- [ ] CONTRIBUTING.md documenta el flow
- [ ] Releases versionadas con SemVer
- [ ] Tags inmutables y firmados (si aplica)
- [ ] CI usa OIDC para cloud (si aplica)
- [ ] LFS para archivos grandes (si aplica)
