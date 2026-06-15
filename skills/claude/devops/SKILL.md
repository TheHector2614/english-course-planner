---
name: devops
description: Skill de DevOps integral y operacional - Docker en profundidad (Dockerfiles óptimos, multi-stage, registries, Compose), Kubernetes operacional (Deployments, Services, Ingress, Helm, autoscaling HPA/VPA, operadores), CI/CD multi-plataforma (GitHub Actions, GitLab CI, Jenkins, Azure DevOps), estrategias de deploy (rolling, blue-green, canary), GitOps (ArgoCD, Flux), IaC multi-cloud (Terraform, Pulumi, Ansible), y cultura DevOps/SRE (DORA metrics, SLOs/SLIs, error budgets, on-call, postmortems). Enfoque operacional y agnóstico de herramientas. Activa esta skill cuando el usuario mencione DevOps, Docker, Dockerfile, contenedor, imagen, registry, Kubernetes, kubectl, Helm, ingress, autoscaling, HPA, CI/CD, pipeline, GitHub Actions, GitLab CI, Jenkins, blue-green, canary, rolling update, GitOps, ArgoCD, Flux, Terraform, Pulumi, Ansible, IaC, SRE, DORA, SLO, error budget, on-call, o pida crear/optimizar/desplegar/orquestar pipelines, contenedores, clusters, o automatizar entrega y operación de software.
---

# DevOps Skill (Operacional)

Skill para entrega continua y operación de software: contenedores, orquestación, CI/CD, GitOps, IaC y cultura SRE.

## Relación con otras skills

Esta skill es **operacional y agnóstica**. Delega a skills especializadas cuando aplica:

| Skill | Cubre | Esta skill complementa |
|---|---|---|
| `aws-cloud` | IaC/deploy específico de AWS, security-defaults | DevOps multi-cloud, operación agnóstica |
| `git-workflows` | Git, branching, releases | CI/CD pipelines en profundidad |
| `cybersecurity-defense` | Container/K8s **security**, secrets, supply chain | Operación de containers/K8s (no security) |
| `technical-docs` | Runbooks, docs | Operación y procesos |
| `databases` | Operación de DBs | Deploy de apps que las usan |

**Regla**: para seguridad de contenedores/K8s/cloud → `cybersecurity-defense`. Para infra AWS específica → `aws-cloud`. Esta skill cubre la operación y orquestación general.

## Principios fundamentales

### 1. Automatizar todo lo repetible

Si se hace más de una vez, automatizar. Builds, tests, deploys, rollbacks, provisioning. El trabajo manual no escala y es propenso a error.

### 2. Inmutabilidad

Infraestructura y artefactos inmutables: no modificar en producción, reemplazar. Un contenedor/servidor se reemplaza, no se parchea en vivo. Reproducibilidad garantizada.

### 3. Declarativo > imperativo

Describir el estado deseado, no los pasos. Kubernetes, Terraform, GitOps operan así. El sistema converge al estado declarado.

### 4. Todo como código

- Infraestructura como código (IaC)
- Configuración como código
- Pipelines como código
- Políticas como código
- Documentación cerca del código

Versionado, revisable, reproducible.

### 5. Fail fast, recover faster

Detectar problemas temprano (CI), pero priorizar también la recuperación rápida (MTTR). Rollbacks fáciles, deploys reversibles.

### 6. Shift left

Mover validación temprano: tests, linting, security scanning, en el desarrollo, no al final. Más barato arreglar temprano.

### 7. Observabilidad de primera clase

No podés operar lo que no ves. Logs, métricas, traces desde el diseño, no como afterthought.

### 8. Reducir el trabajo manual (toil)

SRE: el trabajo repetitivo manual (toil) es enemigo. Automatizarlo libera tiempo para mejoras.

## Decisión rápida: ¿qué herramienta/enfoque?

| Necesidad | Recomendación | Referencia |
|---|---|---|
| Empaquetar app | Docker multi-stage | `docker.md` |
| Correr varios contenedores local | Docker Compose | `docker.md` |
| Orquestar a escala | Kubernetes | `kubernetes.md` |
| Empaquetar apps de K8s | Helm | `kubernetes.md` |
| Pipeline CI/CD | GitHub Actions / GitLab CI / etc. | `cicd.md` |
| Deploy sin downtime | Rolling / Blue-green / Canary | `deployment-strategies.md` |
| Sincronizar Git → cluster | ArgoCD / Flux (GitOps) | `gitops.md` |
| Provisionar infra | Terraform / Pulumi | `iac.md` |
| Configurar servidores | Ansible | `iac.md` |
| Medir performance del equipo | DORA metrics | `sre-culture.md` |
| Definir confiabilidad | SLOs/SLIs | `sre-culture.md` |

## Flujos de trabajo

### Flujo A — "Containerizá esta aplicación"

1. Identificar stack (lenguaje, runtime, dependencias)
2. Escribir Dockerfile **multi-stage** optimizado
3. Imagen mínima (distroless/alpine), non-root, layers eficientes
4. `.dockerignore` apropiado
5. Docker Compose si hay múltiples servicios (DB, cache)
6. Build, tag, push a registry
7. Para seguridad de la imagen → delegar a `cybersecurity-defense`

Ver `docker.md`.

### Flujo B — "Desplegá esto en Kubernetes"

1. Manifests base: Deployment, Service, Ingress, ConfigMap
2. Resource requests/limits, health probes (liveness/readiness)
3. Autoscaling (HPA) si aplica
4. Helm chart si es reusable/parametrizable
5. Estrategia de deploy (rolling default)
6. Para hardening de seguridad → `cybersecurity-defense`

Ver `kubernetes.md`.

### Flujo C — "Creá un pipeline CI/CD"

1. Identificar plataforma (GitHub Actions, GitLab CI, etc.)
2. Etapas: lint → test → build → scan → deploy
3. Build de imagen + push a registry
4. Deploy con estrategia apropiada
5. OIDC para cloud (no secrets estáticos) → ver `cybersecurity-defense`/`aws-cloud`
6. Gates: tests verdes, aprobaciones para prod

Ver `cicd.md`.

### Flujo D — "Implementá GitOps"

1. Elegir ArgoCD o Flux
2. Estructura de repo (app config declarativa)
3. Sync automático Git → cluster
4. Estrategia de promoción (dev → staging → prod)
5. Rollback vía Git revert

Ver `gitops.md`.

### Flujo E — "Provisioná infraestructura con IaC"

1. Elegir herramienta (Terraform multi-cloud, Pulumi, etc.)
2. Estructura modular, state remoto
3. Variables y entornos (dev/staging/prod)
4. Plan → review → apply
5. Para AWS específico → delegar a `aws-cloud`

Ver `iac.md`.

### Flujo F — "Elegí una estrategia de deploy"

1. Entender requisitos (downtime aceptable? rollback rápido?)
2. Rolling (default), Blue-green (switch instantáneo), Canary (gradual)
3. Feature flags para desacoplar deploy de release
4. Plan de rollback

Ver `deployment-strategies.md`.

### Flujo G — "Establecé prácticas SRE / mejorá el proceso"

1. Medir baseline con DORA metrics
2. Definir SLOs/SLIs para servicios clave
3. Error budgets
4. On-call sostenible
5. Postmortems blameless (delegar formato a `technical-docs`)
6. Reducir toil

Ver `sre-culture.md`.

### Flujo H — "Auditá la madurez DevOps"

1. Evaluar con checklist (ver `maturity-assessment.md`)
2. DORA metrics actuales
3. Gaps en automatización, observabilidad, cultura
4. Plan de mejora priorizado

## Stack DevOps por capa

```
┌─────────────────────────────────────────────┐
│ Cultura/Procesos: DORA, SLOs, on-call, IR    │
├─────────────────────────────────────────────┤
│ GitOps: ArgoCD / Flux                         │
├─────────────────────────────────────────────┤
│ CI/CD: GH Actions / GitLab CI / Jenkins       │
├─────────────────────────────────────────────┤
│ Orquestación: Kubernetes / Compose / Serverless│
├─────────────────────────────────────────────┤
│ Contenedores: Docker / OCI images             │
├─────────────────────────────────────────────┤
│ IaC: Terraform / Pulumi / Ansible             │
├─────────────────────────────────────────────┤
│ Observabilidad: métricas, logs, traces        │
└─────────────────────────────────────────────┘
```

## DORA metrics (medir lo que importa)

Las 4 métricas que predicen performance de entrega de software (DevOps Research & Assessment):

1. **Deployment Frequency**: cuán seguido desplegás
2. **Lead Time for Changes**: de commit a producción
3. **Change Failure Rate**: % de deploys que causan fallos
4. **Time to Restore Service** (MTTR): cuánto tardás en recuperar

Más una quinta moderna:
5. **Reliability**: cumplimiento de SLOs

| Nivel | Deploy freq | Lead time | CFR | MTTR |
|---|---|---|---|---|
| Elite | On-demand (varios/día) | < 1 hora | 0-15% | < 1 hora |
| High | Diario-semanal | 1 día-1 semana | 16-30% | < 1 día |
| Medium | Semanal-mensual | 1 semana-1 mes | 16-30% | 1 día-1 semana |
| Low | < 1/mes | 1-6 meses | 16-30% | 1 semana-1 mes |

Ver `sre-culture.md`.

## Quick wins DevOps

1. **CI en cada PR** (lint + test + build)
2. **Dockerfile multi-stage** (imágenes chicas)
3. **Health probes** en K8s (liveness/readiness)
4. **Resource limits** (evita noisy neighbors)
5. **Rollback fácil** (deploys reversibles)
6. **IaC para infra** (no clicks manuales)
7. **Observabilidad básica** (métricas + logs centralizados)
8. **Secrets fuera del código** (ver `cybersecurity-defense`)
9. **DORA metrics** (medir para mejorar)
10. **Postmortems blameless** (aprender de fallos)

## Output esperado

### Containerización
- Dockerfile multi-stage optimizado
- `.dockerignore`
- Docker Compose si aplica
- Comandos de build/push

### Kubernetes
- Manifests (Deployment, Service, Ingress, etc.)
- Helm chart si reusable
- Health probes, resources, autoscaling

### CI/CD
- Pipeline completo (lint→test→build→scan→deploy)
- Específico a la plataforma del usuario
- Con gates y estrategia de deploy

### GitOps
- Estructura de repo
- Config de ArgoCD/Flux
- Estrategia de promoción

### IaC
- Código modular
- State remoto configurado
- Por entorno

### Auditoría
- DORA metrics actuales
- Gaps priorizados
- Plan de mejora

## Referencias

- `references/docker.md` — Dockerfiles, multi-stage, layers, registries, Compose, optimización
- `references/kubernetes.md` — Deployments, Services, Ingress, Helm, autoscaling, operadores, debugging
- `references/cicd.md` — GitHub Actions, GitLab CI, Jenkins, Azure DevOps, pipelines, gates
- `references/deployment-strategies.md` — rolling, blue-green, canary, feature flags, rollback
- `references/gitops.md` — ArgoCD, Flux, estructura de repos, promoción de entornos
- `references/iac.md` — Terraform, Pulumi, Ansible, state, módulos, multi-cloud
- `references/observability.md` — Prometheus, Grafana, logs, tracing, alerting, golden signals
- `references/sre-culture.md` — DORA, SLOs/SLIs, error budgets, on-call, toil, postmortems
- `references/maturity-assessment.md` — checklist de madurez DevOps con niveles

## Lo que NUNCA hay que hacer

- ❌ Deploys manuales a producción (sin pipeline)
- ❌ Imágenes de contenedor gigantes (sin multi-stage)
- ❌ Contenedores como root sin razón (ver `cybersecurity-defense`)
- ❌ Sin health probes en K8s
- ❌ Sin resource limits/requests
- ❌ Secrets en código/imágenes (ver `cybersecurity-defense`)
- ❌ `latest` tag en producción (no determinístico)
- ❌ Infra creada a mano (clicks en consola)
- ❌ State de Terraform local/sin lock (en equipo)
- ❌ Deploys sin plan de rollback
- ❌ Sin observabilidad (volar a ciegas)
- ❌ `kubectl apply` manual en prod (usar GitOps)
- ❌ Pipelines sin tests
- ❌ On-call sin runbooks
- ❌ Postmortems con culpa (deben ser blameless)
- ❌ Ignorar DORA/métricas (no medir = no mejorar)
- ❌ Modificar recursos en vivo en lugar de via IaC/GitOps (config drift)
