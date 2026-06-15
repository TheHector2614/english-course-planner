# CI/CD

GitHub Actions, GitLab CI, Jenkins, Azure DevOps. Pipelines, etapas, gates.

**Nota**: para CI/CD con OIDC a AWS ver `aws-cloud`. Para CI desde perspectiva Git (branching, releases) ver `git-workflows`. Para supply chain security en CI ver `cybersecurity-defense`. Aquí: pipelines operacionales multi-plataforma.

## Anatomía de un pipeline

```
┌─────────┐  ┌──────┐  ┌───────┐  ┌──────┐  ┌──────┐  ┌────────┐
│  Lint   │→ │ Test │→ │ Build │→ │ Scan │→ │ Push │→ │ Deploy │
└─────────┘  └──────┘  └───────┘  └──────┘  └──────┘  └────────┘
   rápido    unitarios  imagen   security  registry  con gate
```

### CI vs CD

- **CI (Continuous Integration)**: integrar cambios frecuentemente, validar automáticamente (lint, test, build)
- **CD (Continuous Delivery)**: el código está siempre listo para deploy (con aprobación manual)
- **CD (Continuous Deployment)**: deploy automático a producción (sin intervención)

## Etapas típicas

| Etapa | Qué | Falla si |
|---|---|---|
| **Lint** | Formato, estilo, estática | Código no cumple estándares |
| **Test** | Unit, integration | Tests rojos |
| **Build** | Compilar, imagen Docker | No compila |
| **Scan** | Vulnerabilidades, secrets | CVE crítico, secret detectado |
| **Push** | Subir imagen a registry | - |
| **Deploy** | Desplegar a entorno | Deploy falla / health check |

Principio shift-left: lo rápido y barato primero (lint), lo costoso después (deploy).

## GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Permisos mínimos
permissions:
  contents: read

jobs:
  # --- CI: lint + test ---
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  # --- Build + push imagen (solo en main) ---
  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write          # para push a ghcr
      id-token: write          # para OIDC
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # --- Deploy (con OIDC a cloud, ver aws-cloud) ---
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production    # gate de aprobación
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      # OIDC en lugar de keys estáticas (ver cybersecurity-defense)
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
          aws-region: us-east-1
      - name: Deploy
        run: |
          aws eks update-kubeconfig --name my-cluster
          kubectl set image deployment/myapp myapp=ghcr.io/${{ github.repository }}:${{ github.sha }}
          kubectl rollout status deployment/myapp
```

### Conceptos GitHub Actions

- **Reusable workflows**: DRY entre repos
- **Composite actions**: encapsular pasos
- **Matrix**: correr en múltiples versiones/OS
- **Environments**: gates de aprobación, secrets por entorno
- **Concurrency**: cancelar runs obsoletos

```yaml
# Matrix
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
runs-on: ${{ matrix.os }}

# Concurrency (cancelar runs viejos del mismo PR)
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Reusable workflow
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable.yml
    with:
      environment: prod
    secrets: inherit
```

⚠️ Pin actions a SHA (no tags movibles) para supply chain security. Ver `cybersecurity-defense`.

## GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

# Cache de dependencias
.node-cache: &node-cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/

test:
  stage: test
  image: node:20
  <<: *node-cache
  script:
    - npm ci
    - npm run lint
    - npm test -- --coverage
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp myapp=$IMAGE_TAG
    - kubectl rollout status deployment/myapp
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual          # gate de aprobación manual
```

### Conceptos GitLab CI

- **Stages**: orden de ejecución
- **Rules**: cuándo correr un job
- **Artifacts**: pasar datos entre jobs
- **Cache**: acelerar (deps)
- **Environments**: deploy targets con tracking
- **`needs`**: DAG (jobs paralelos sin esperar stage completo)
- **Templates** (`extends`, `include`): reutilización

```yaml
# DAG con needs (paralelización)
deploy-staging:
  needs: [build]      # corre apenas build termina, sin esperar otros

# Include de templates
include:
  - template: Security/SAST.gitlab-ci.yml
  - local: '.gitlab/ci/deploy.yml'
```

## Jenkins

```groovy
// Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any

    environment {
        IMAGE = "myregistry/myapp:${env.GIT_COMMIT}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Test') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                }
            }
        }

        stage('Build') {
            when { branch 'main' }
            steps {
                sh "docker build -t ${IMAGE} ."
                withCredentials([usernamePassword(
                    credentialsId: 'registry-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin myregistry'
                    sh "docker push ${IMAGE}"
                }
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            input {
                message "Deploy to production?"
                ok "Deploy"
            }
            steps {
                sh "kubectl set image deployment/myapp myapp=${IMAGE}"
                sh "kubectl rollout status deployment/myapp"
            }
        }
    }

    post {
        failure {
            slackSend channel: '#alerts',
                color: 'danger',
                message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
```

### Conceptos Jenkins

- **Declarative vs Scripted**: preferir Declarative (más estructurado)
- **Agents**: dónde corre (nodes, contenedores, K8s pods)
- **Shared Libraries**: reutilizar código entre pipelines
- **Credentials**: gestión de secrets
- **Plugins**: ecosystem extenso (pero mantener mínimo)

Jenkins es potente pero requiere mantenimiento (servidor, plugins, seguridad). Para proyectos nuevos, considerar SaaS (GitHub Actions, GitLab CI) salvo necesidad específica.

## Azure DevOps Pipelines

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include: [main]

pr:
  branches:
    include: [main]

variables:
  imageTag: '$(Build.SourceVersion)'

stages:
  - stage: Test
    jobs:
      - job: test
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          - script: npm ci
          - script: npm run lint
          - script: npm test
          - task: PublishTestResults@2
            inputs:
              testResultsFiles: '**/test-results.xml'

  - stage: Build
    dependsOn: Test
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - job: build
        steps:
          - task: Docker@2
            inputs:
              command: buildAndPush
              repository: myapp
              tags: $(imageTag)
              containerRegistry: myRegistry

  - stage: Deploy
    dependsOn: Build
    jobs:
      - deployment: deploy
        environment: production    # gate de aprobación
        strategy:
          runOnce:
            deploy:
              steps:
                - script: |
                    kubectl set image deployment/myapp myapp=myapp:$(imageTag)
                    kubectl rollout status deployment/myapp
```

## Estrategias de cache

Acelerar pipelines cacheando dependencias y layers.

```yaml
# GitHub Actions: cache de npm
- uses: actions/setup-node@v4
  with:
    cache: npm

# Cache de Docker layers (BuildKit + GHA cache)
cache-from: type=gha
cache-to: type=gha,mode=max
```

```yaml
# GitLab: cache por lockfile
cache:
  key:
    files: [package-lock.json]
  paths: [node_modules/]
```

## Gates y aprobaciones

Para producción, requerir aprobación humana:

- **GitHub**: Environments con required reviewers
- **GitLab**: `when: manual` o approval rules
- **Jenkins**: `input` step
- **Azure**: Environment approvals

```yaml
# GitHub: environment con aprobación
deploy:
  environment: production   # configurar required reviewers en settings
```

## Pipeline patterns

### Pipeline por entorno

```
main → deploy a staging (automático)
tag v* → deploy a producción (con aprobación)
```

### Trunk-based con preview environments

```
PR abierto → deploy a preview environment efímero
PR mergeado → preview destruido, deploy a staging
```

### Monorepo: solo lo afectado

```yaml
# GitHub Actions con paths filter
on:
  push:
    paths:
      - 'apps/web/**'
      - 'packages/shared/**'

# O detectar cambios con dorny/paths-filter
- uses: dorny/paths-filter@v3
  id: changes
  with:
    filters: |
      web: 'apps/web/**'
      api: 'apps/api/**'
```

Para monorepos con Nx/Turborepo, usar affected (ver `git-workflows`).

## Optimización de pipelines

1. **Paralelizar** jobs independientes
2. **Cache** de dependencias y layers
3. **Fail fast**: lo rápido primero, abortar al primer fallo
4. **Solo lo necesario**: paths filters, condiciones
5. **Self-hosted runners** si los hosted son lentos/caros
6. **Artifacts** entre jobs (no rebuildear)
7. **Matrix** para paralelizar variaciones

## Integración con deploy strategies

El pipeline ejecuta la estrategia de deploy (ver `deployment-strategies.md`):

```yaml
# Rolling (default K8s)
- run: kubectl set image deployment/myapp myapp=$IMAGE && kubectl rollout status deployment/myapp

# Con Helm
- run: helm upgrade --install myapp ./chart --set image.tag=$SHA --wait

# Con ArgoCD (GitOps — preferido, ver gitops.md)
# El pipeline solo actualiza el repo de config, ArgoCD sincroniza
- run: |
    yq e ".image.tag = \"$SHA\"" -i config/prod/values.yaml
    git commit -am "deploy: $SHA" && git push
```

## Notificaciones

```yaml
# GitHub Actions: notificar a Slack en fallo
- if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      { "text": "Pipeline failed: ${{ github.workflow }}" }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Comparación de plataformas

| | GitHub Actions | GitLab CI | Jenkins | Azure DevOps |
|---|---|---|---|---|
| Hosting | SaaS + self-hosted runners | SaaS + self-hosted | Self-hosted | SaaS + self-hosted |
| Config | YAML `.github/workflows/` | YAML `.gitlab-ci.yml` | Groovy `Jenkinsfile` | YAML `azure-pipelines.yml` |
| Marketplace | Excelente | Bueno | Plugins (muchos) | Bueno |
| Mantenimiento | Mínimo | Mínimo (SaaS) | Alto (servidor) | Mínimo |
| Mejor para | OSS, GitHub repos | GitLab repos, DevOps integrado | Control total, legacy | Microsoft stack |

## Anti-patterns

- ❌ Deploy a prod sin gate de aprobación
- ❌ Sin tests en el pipeline
- ❌ Secrets hardcodeados (usar secrets del CI + OIDC)
- ❌ Sin cache (pipelines lentos)
- ❌ Actions/dependencies sin pin (supply chain risk)
- ❌ Pipeline monolítico sin paralelización
- ❌ Build de imagen en cada etapa (rebuildear)
- ❌ Sin notificación de fallos
- ❌ `latest` tag desde el pipeline
- ❌ Correr todo en cada cambio (monorepo sin affected)
- ❌ Credenciales cloud estáticas (usar OIDC)
- ❌ Sin timeout (jobs colgados consumen recursos)

## Checklist CI/CD

### CI
- [ ] Corre en cada PR
- [ ] Lint + test + build
- [ ] Security scan (ver cybersecurity-defense)
- [ ] Cache de dependencias
- [ ] Fail fast (rápido primero)
- [ ] Paralelización de jobs independientes
- [ ] Timeout configurado

### CD
- [ ] Build de imagen con tag específico (SHA/versión)
- [ ] Push a registry
- [ ] Deploy con estrategia (rolling/blue-green/canary)
- [ ] Gate de aprobación para producción
- [ ] Rollback automático si health check falla
- [ ] Notificación de resultado

### Seguridad
- [ ] OIDC para cloud (no keys estáticas)
- [ ] Secrets del CI (no hardcoded)
- [ ] Actions/deps pinned a SHA
- [ ] Permisos mínimos del pipeline
- [ ] Supply chain security (ver cybersecurity-defense)
