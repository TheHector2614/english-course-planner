# Plataformas Git

Particularidades de GitHub, GitLab, Bitbucket, Azure DevOps, Gitea.

## GitHub

### Features clave

- **GitHub Actions**: CI/CD
- **Branch Protection Rules**
- **Required Status Checks**
- **CODEOWNERS**
- **Dependabot / Security Advisories**
- **GitHub Packages** (npm, Docker, Maven, etc.)
- **GitHub Releases**
- **Discussions**, Issues, Wikis
- **Codespaces** (dev environments cloud)
- **Copilot** (AI assistant)

### Branch protection setup

Settings → Branches → Add rule:

**Para `main`**:
- ✅ Require a pull request before merging
  - Required approvals: 1 (chico) o 2 (grande)
  - Dismiss stale reviews when new commits pushed
  - Require review from Code Owners
- ✅ Require status checks to pass
  - Require branches to be up to date
  - Status checks: CI/build/test
- ✅ Require conversation resolution
- ✅ Require signed commits
- ✅ Require linear history (si rebase merge)
- ✅ Do not allow bypassing the above
- ✅ Restrict deletions
- ✅ Block force pushes (Allow specific actors: nadie)

### CODEOWNERS

`.github/CODEOWNERS`:
```
*                   @org/everyone
/apps/web/          @org/frontend-team
/apps/api/          @org/backend-team
**/auth/**          @org/security-team
*.md                @org/docs-team
```

GitHub auto-asigna reviewers según paths.

### GitHub Actions

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Templates

`.github/ISSUE_TEMPLATE/bug.yml`:
```yaml
name: Bug report
description: File a bug report
labels: ['bug']
body:
  - type: textarea
    attributes:
      label: What happened?
    validations:
      required: true
```

`.github/pull_request_template.md`: ver `pull-requests.md`.

### GitHub CLI

```bash
# Auth
gh auth login

# PRs
gh pr create
gh pr list
gh pr view 123
gh pr checkout 123
gh pr merge 123 --squash

# Issues
gh issue create
gh issue list

# Repos
gh repo clone org/repo
gh repo create

# Releases
gh release create v1.0.0 --generate-notes
```

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

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

### Security

- Settings → Security & analysis
- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Secret scanning
- ✅ Code scanning (CodeQL)

## GitLab

### Features clave

- **GitLab CI/CD**: built-in
- **Merge Requests** (vs Pull Requests)
- **Push Rules**
- **Protected Branches**
- **Container Registry, Package Registry**
- **Issues, Boards, Milestones**
- **Wiki**
- **Snippets**
- **Self-hosted option**

### Branch protection (Protected branches)

Settings → Repository → Protected branches:

**Para `main`**:
- Allowed to push: Maintainers (o "No one" si querés MR-only)
- Allowed to merge: Maintainers
- Code owner approval required: ✅
- Reject unsigned commits: ✅

### MR approvals

Settings → Merge requests:
- Required approvals
- Eligible approvers
- Reset approvals on new push

### `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run lint
    - npm test
  only:
    - merge_requests
    - main

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy_staging:
  stage: deploy
  script:
    - echo "Deploy to staging"
  environment:
    name: staging
  only:
    - main
```

### Push rules (Enterprise)

Configurables:
- Commit message regex
- Sign commits required
- Reject changes to specific files
- Reject unsigned commits
- File path restrictions

### CODEOWNERS

`CODEOWNERS` o `.gitlab/CODEOWNERS`:
```
* @everyone

/apps/web/ @frontend-team
^[Documentation]
*.md @docs-team
```

`^[Documentation]` define sección opcional vs required.

### glab CLI

```bash
glab auth login
glab mr create
glab mr list
glab issue create
glab release create v1.0.0
```

## Bitbucket

### Features clave

- **Bitbucket Pipelines**: CI/CD
- **Pull Requests**
- **Branch permissions**
- **Code review**
- **Integración con Jira nativa**
- **Workspaces** (organización)

### Branch permissions

Repository settings → Branch permissions:
- Write access: solo después de approved PR
- Merge checks: builds passed, approvals
- Reject force push

### `bitbucket-pipelines.yml`

```yaml
image: node:20

pipelines:
  default:
    - step:
        name: Test
        script:
          - npm ci
          - npm test
        caches:
          - node

  pull-requests:
    '**':
      - step:
          name: Build & test
          script:
            - npm ci
            - npm run lint
            - npm test
            - npm run build

  branches:
    main:
      - step:
          name: Deploy
          deployment: production
          script:
            - npm run deploy
```

### CLI: BB no tiene CLI oficial robusto

Usar API REST o tools como `bb-cli` de terceros.

## Azure DevOps

### Features clave

- **Azure Pipelines**: CI/CD multi-cloud
- **Pull Requests**
- **Branch Policies**
- **Boards** (PM)
- **Artifacts** (package management)
- **Test Plans**

### Branch policies

Repos → Branches → 3-dot menu en branch → Branch policies:
- Require minimum number of reviewers
- Check for linked work items
- Check for comment resolution
- Limit merge types (squash, no-ff, rebase)
- Build validation (pipeline must pass)

### `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include: [main]

pr:
  branches:
    include: [main]

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: npm ci
    displayName: 'Install'

  - script: npm test
    displayName: 'Test'

  - script: npm run build
    displayName: 'Build'
```

### CLI: `az devops`

```bash
az devops configure --defaults organization=https://dev.azure.com/org project=Project

az repos pr create --source-branch feat/x --target-branch main
az repos pr list
```

## Gitea / Forgejo

Self-hosted Git, similar a GitHub.

### Cuándo

- Sovereignty / compliance (datos on-prem)
- Sin presupuesto para GitHub Enterprise / GitLab Premium
- Equipos pequeños / proyectos personales auto-hosteados
- Restricciones de país / industria

### Features

- Pull Requests
- Issues, Wikis
- Branch protection
- **Gitea Actions** (compatible con GitHub Actions, en evolución)
- Self-hosted package registry

### Setup mínimo

```bash
# Docker
docker run -d --name=gitea \
  -p 3000:3000 -p 222:22 \
  -v gitea:/data \
  gitea/gitea:latest
```

### Limitaciones

- Comunidad más chica que GitHub/GitLab
- Menos integrations
- Self-hosting overhead

Forgejo es un fork de Gitea con governance comunitaria. Funcionalmente similar.

## Migración entre plataformas

### GitHub ↔ GitLab

Ambos soportan **importer** built-in:
- GitLab: Settings → Repositories → Import → GitHub
- GitHub: Settings → Imports

Lo que migra:
- ✅ Commits e historia Git completa
- ✅ Branches y tags
- ✅ Issues (con limitaciones)
- ✅ PRs (como issues normalmente)
- ❌ Comentarios in-line en código (varía)
- ❌ CI configs (manual)
- ❌ Webhooks, secrets (manual)
- ❌ Branch protection rules (manual)

### A self-hosted

```bash
# Clone con todo
git clone --mirror https://github.com/org/repo.git
cd repo.git
git remote set-url --push origin https://gitea.example.com/org/repo.git
git push --mirror
```

`--mirror` incluye todas las refs (branches, tags, notes).

## Multi-platform: estrategias

### Mirroring

Mantener mismo repo en múltiples plataformas:

GitLab → GitHub mirror:
- GitLab Settings → Repository → Mirroring repositories

GitHub → otros: con GitHub Actions:
```yaml
- name: Mirror to GitLab
  uses: yesolutions/mirror-action@master
  with:
    REMOTE: 'https://gitlab.com/org/repo.git'
    GIT_USERNAME: '...'
    GIT_PASSWORD: '${{ secrets.GITLAB_TOKEN }}'
```

### Source of truth

Una plataforma es la principal (donde se hace dev), otras son réplicas read-only.

## CI/CD comparativa

| | GitHub Actions | GitLab CI | Bitbucket Pipelines | Azure Pipelines | Gitea Actions |
|---|---|---|---|---|---|
| Plataforma | YAML in `.github/` | YAML in `.gitlab-ci.yml` | YAML in `bitbucket-pipelines.yml` | YAML in `azure-pipelines.yml` | YAML similar a GH |
| Free tier | Generoso (público gratis) | Pricing por mes | Limitado (50 min/mes) | Limitado (1800 min/mes) | Self-hosted, ilimitado |
| Self-hosted runners | Sí | Sí | Sí | Sí | Sí (siempre) |
| Marketplace | Excelente | Bueno | Limitado | Bueno | Compatible con GH |
| Matrix builds | Sí | Sí | Sí | Sí | Sí |
| Secrets management | Sí | Sí | Sí | Sí (Key Vault integration) | Sí |

## OIDC y cloud authentication

En lugar de long-lived secrets, usar OIDC (delegado a `aws-cloud`).

### GitHub Actions → AWS

```yaml
permissions:
  id-token: write

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/github-actions
      aws-region: us-east-1
```

### GitLab CI → AWS

```yaml
deploy:
  id_tokens:
    AWS_TOKEN:
      aud: https://gitlab.com
  script:
    - aws sts assume-role-with-web-identity ...
```

Más seguro que `AWS_ACCESS_KEY_ID` en secrets.

## Webhooks

Eventos del repo → notificar a otros sistemas.

### GitHub

Settings → Webhooks:
- Payload URL
- Content type
- Secret
- Events (push, PR, etc.)

### GitLab

Settings → Webhooks: similar.

### Casos comunes

- Notificar a Slack/Teams cuando se mergea PR
- Trigger build en CI externo
- Sync con sistemas internos (Jira, ServiceNow)
- Notificar a Sentry de releases

## Permisos y roles

### GitHub

Roles a nivel repo:
- **Read**: ver, clonar, fork
- **Triage**: + manage issues/PRs
- **Write**: + push, manage branches
- **Maintain**: + manage repo settings (sin admin)
- **Admin**: todo

A nivel org:
- Owner, Member, Outside Collaborator

### GitLab

- **Guest**
- **Reporter**
- **Developer**
- **Maintainer**
- **Owner**

Más granular que GitHub.

### Best practices

- ✅ Principio de mínimo privilegio
- ✅ Outside Collaborators para contractors
- ✅ Personal Access Tokens con scope mínimo
- ✅ 2FA obligatorio
- ✅ Review periódico de access

## Recomendación por contexto

| Contexto | Plataforma |
|---|---|
| **Open source público** | GitHub (network effect) |
| **Empresa con foco en DevOps integrado** | GitLab |
| **Empresa con stack Atlassian** | Bitbucket |
| **Empresa con Microsoft stack** | Azure DevOps |
| **Sovereignty / compliance** | Gitea/Forgejo self-hosted |
| **Equipo grande con cumplimiento** | GitHub Enterprise o GitLab Premium |
| **Proyecto personal** | GitHub (gratis, ecosystem) |

## Migración: cuándo cambiar

❌ NO migrar por:
- "Es lo nuevo"
- "GitLab tiene feature X"
- Migration cost > benefit

✅ Sí migrar por:
- Compliance change (sovereignty)
- Costo (Enterprise plans varían mucho)
- Ecosystem específico que necesitás
- Performance issues serios

Migración bien planeada toma semanas, no días. Considerar dual-running durante transición.

## Checklist setup de plataforma

### GitHub/GitLab/etc.

- [ ] Branch protection en main
- [ ] Required reviewers
- [ ] Required status checks
- [ ] Required signed commits
- [ ] CODEOWNERS configurado
- [ ] Templates (issue, PR)
- [ ] CI/CD configurado
- [ ] Dependabot / similar habilitado
- [ ] Secret scanning habilitado
- [ ] 2FA obligatorio en org
- [ ] Permisos auditados
- [ ] OIDC para cloud authentication (no long-lived secrets)
- [ ] Webhooks configurados si necesarios
