# GitOps

ArgoCD, Flux, estructura de repos, promoción de entornos. Git como fuente de verdad para el estado del cluster.

## Principio: Git como fuente de verdad

El estado deseado de la infraestructura/apps vive en Git. Un agente sincroniza el cluster con Git automáticamente. Cambios = commits, no `kubectl apply` manual.

```
┌─────────┐         ┌──────────────┐        ┌──────────┐
│   Git   │ ◄────── │  Developer   │        │          │
│ (estado │         │  (PR/commit) │        │  Cluster │
│ deseado)│                                 │          │
└────┬────┘                                 └────▲─────┘
     │                                           │
     │         ┌──────────────────┐              │
     └────────►│ Agente GitOps     │─────────────┘
               │ (ArgoCD / Flux)   │  sincroniza
               │ observa Git,      │  (apply automático)
               │ aplica al cluster │
               └──────────────────┘
```

## Por qué GitOps

- **Git como fuente de verdad**: el repo refleja el estado real del cluster
- **Auditabilidad**: todo cambio es un commit (quién, qué, cuándo, por qué)
- **Rollback fácil**: `git revert`
- **Sin acceso directo al cluster**: devs hacen PRs, no `kubectl` en prod
- **Drift detection**: el agente detecta y corrige cambios manuales (config drift)
- **Reproducibilidad**: recrear el cluster desde Git
- **Declarativo**: describir el estado, no los pasos

## Push vs Pull

| | Push (CI hace deploy) | Pull (GitOps) |
|---|---|---|
| Quién aplica | El pipeline CI (`kubectl apply`) | Agente en el cluster |
| Credenciales | CI tiene acceso al cluster | Cluster lee Git (no expone credenciales) |
| Drift | No detecta | Detecta y corrige |
| Fuente de verdad | El pipeline | Git |

GitOps usa **pull**: el cluster jala los cambios. Más seguro (no expone kubeconfig al CI).

## ArgoCD

Controlador GitOps con UI. Observa repos Git y sincroniza con el cluster.

### Application (unidad básica)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/myapp-config.git
    targetRevision: main
    path: k8s/production       # carpeta con manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true              # borra recursos eliminados de Git
      selfHeal: true           # corrige drift (cambios manuales)
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        maxDuration: 3m
```

### Con Helm

```yaml
spec:
  source:
    repoURL: https://github.com/org/myapp-config.git
    targetRevision: main
    path: chart
    helm:
      valueFiles:
        - values-prod.yaml
      parameters:
        - name: image.tag
          value: "1.2.3"
```

### Con Kustomize

```yaml
spec:
  source:
    repoURL: https://github.com/org/myapp-config.git
    path: overlays/production
    # ArgoCD detecta kustomization.yaml automáticamente
```

### ApplicationSet (múltiples apps/entornos)

Generar Applications desde un template (DRY para muchos entornos/clusters):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-environments
spec:
  generators:
    - list:
        elements:
          - env: dev
            cluster: https://dev-cluster
          - env: staging
            cluster: https://staging-cluster
          - env: prod
            cluster: https://prod-cluster
  template:
    metadata:
      name: 'myapp-{{env}}'
    spec:
      source:
        repoURL: https://github.com/org/myapp-config.git
        path: 'overlays/{{env}}'
      destination:
        server: '{{cluster}}'
        namespace: myapp
```

### Comandos ArgoCD

```bash
# CLI
argocd app list
argocd app get myapp
argocd app sync myapp              # sincronizar manualmente
argocd app history myapp
argocd app rollback myapp 2        # rollback a revisión
argocd app diff myapp              # diferencia Git vs cluster

# Sync waves (orden de aplicación)
# annotation: argocd.argoproj.io/sync-wave: "1"
```

### Sync waves (orden)

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"   # se aplica antes que wave 2
```

Útil para dependencias: namespace (wave 0) → DB (wave 1) → app (wave 2).

## Flux

Alternativa a ArgoCD. Más liviano, CLI-first, sin UI propia (usa otras).

### GitRepository + Kustomization

```yaml
# Fuente Git
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: myapp-config
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/org/myapp-config.git
  ref:
    branch: main
---
# Qué aplicar
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 5m
  path: ./k8s/production
  prune: true              # borra lo eliminado de Git
  sourceRef:
    kind: GitRepository
    name: myapp-config
  targetNamespace: production
  wait: true
  timeout: 5m
```

### HelmRelease (Flux + Helm)

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: myapp
spec:
  interval: 5m
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: myapp-config
  values:
    image:
      tag: "1.2.3"
```

### Image automation (Flux)

Flux puede actualizar la imagen automáticamente cuando hay una nueva:

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: myapp
spec:
  imageRepositoryRef:
    name: myapp
  policy:
    semver:
      range: '>=1.0.0'      # actualiza a la última que cumpla
```

### Comandos Flux

```bash
flux bootstrap github --owner=org --repository=fleet --path=clusters/prod
flux get kustomizations
flux get helmreleases
flux reconcile kustomization myapp     # forzar sync
flux suspend kustomization myapp       # pausar
flux resume kustomization myapp
```

## ArgoCD vs Flux

| | ArgoCD | Flux |
|---|---|---|
| UI | Sí (web UI rica) | No (usa Weave GitOps u otras) |
| Modelo | Application CRD | GitRepository + Kustomization |
| Multi-tenancy | Projects | Namespaces + RBAC |
| Image automation | Vía Image Updater | Built-in |
| Curva | Más visual, fácil de empezar | CLI-first, más liviano |
| Mejor para | Equipos que quieren UI | GitOps puro, automatización |

Ambos son CNCF graduated. Elegir según preferencia de UI vs CLI y necesidades.

## Estructura de repos

### Patrón: repo de app + repo de config

```
# Repo de aplicación (código)
myapp/
├── src/
├── Dockerfile
└── .github/workflows/ci.yml   # build + push imagen, actualiza repo de config

# Repo de config (GitOps source) — separado
myapp-config/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── values.yaml
    ├── staging/
    └── production/
```

Separar código de config:
- El CI del repo de app construye la imagen y actualiza el tag en el repo de config
- ArgoCD/Flux observa el repo de config y despliega

### Monorepo de config (alternativa)

```
fleet/
├── apps/
│   ├── myapp/
│   ├── otherapp/
└── clusters/
    ├── dev/
    ├── staging/
    └── production/
```

### App-of-apps (ArgoCD)

Una Application que define otras Applications. Gestiona todo el fleet desde un punto.

```yaml
# Root app que apunta a un directorio de Applications
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
spec:
  source:
    repoURL: https://github.com/org/fleet.git
    path: apps          # carpeta con más Applications
  # ...
```

## Promoción entre entornos

Flujo típico: dev → staging → prod.

### Por carpetas (Kustomize overlays)

```
overlays/
├── dev/        → ArgoCD app "myapp-dev"
├── staging/    → ArgoCD app "myapp-staging"
└── production/ → ArgoCD app "myapp-prod"
```

Promoción = actualizar el tag de imagen en cada overlay:

```bash
# Promover de staging a prod
yq e '.images[0].newTag = "1.2.3"' -i overlays/production/kustomization.yaml
git commit -am "promote 1.2.3 to production"
git push
# ArgoCD/Flux sincroniza prod
```

### Por branches (menos común)

```
dev branch     → cluster dev
staging branch → cluster staging
main branch    → cluster prod
```

Promoción = merge entre branches. Menos recomendado (drift entre branches).

### Pipeline de promoción

```
1. CI construye imagen, push con tag :sha
2. CI actualiza overlays/dev → ArgoCD despliega a dev
3. Tests en dev OK → PR actualiza overlays/staging
4. Tests en staging OK → PR actualiza overlays/production
5. Aprobación → merge → ArgoCD despliega a prod
```

## Integración con CI/CD

GitOps cambia el rol del CI: el CI **no despliega**, solo construye y actualiza el repo de config.

```yaml
# CI: build + push + actualizar repo de config (NO kubectl apply)
build-and-update-config:
  steps:
    - run: docker build -t myapp:$SHA . && docker push myapp:$SHA
    # Actualizar el repo de config (ArgoCD/Flux despliega)
    - run: |
        git clone https://github.com/org/myapp-config
        cd myapp-config
        yq e ".images[0].newTag = \"$SHA\"" -i overlays/dev/kustomization.yaml
        git commit -am "deploy $SHA to dev"
        git push
```

ArgoCD/Flux detecta el cambio y sincroniza. El CI nunca toca el cluster directamente.

## Rollback con GitOps

```bash
# Revert del commit (la forma GitOps)
git revert <commit>
git push
# ArgoCD/Flux sincroniza al estado anterior

# O ArgoCD CLI
argocd app rollback myapp <revision>

# O Flux
flux reconcile kustomization myapp --with-source
```

Todo rollback queda registrado en Git (auditable).

## Drift detection y self-healing

GitOps detecta cuando alguien cambió algo manualmente en el cluster (drift):

```yaml
# ArgoCD: selfHeal corrige automáticamente
syncPolicy:
  automated:
    selfHeal: true    # revierte cambios manuales al estado de Git
```

Si alguien hace `kubectl edit` en prod, ArgoCD lo detecta y revierte al estado de Git. Esto fuerza que todos los cambios pasen por Git (auditabilidad).

## Secrets en GitOps

⚠️ No commitear secrets en claro al repo de config. Opciones:

- **Sealed Secrets**: cifra secrets para que sean seguros en Git
- **SOPS** (+ age/KMS): cifra valores en archivos YAML
- **External Secrets Operator**: referencia secrets de Vault/cloud (no en Git)

```yaml
# Sealed Secret (cifrado, seguro en Git)
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: myapp-secret
spec:
  encryptedData:
    password: AgBy3i4OJSWK...   # cifrado, solo el controller lo descifra
```

Ver `cybersecurity-defense` (`secrets-protection.md`).

## Buenas prácticas

- **Separar código de config** (dos repos)
- **Un repo de config por equipo/dominio** o monorepo bien organizado
- **Overlays por entorno** (Kustomize) o values (Helm)
- **PRs para cambios de prod** (review + aprobación)
- **selfHeal + prune** activados (consistencia)
- **Secrets cifrados** (Sealed Secrets/SOPS) o externos (ESO)
- **Sync waves** para dependencias
- **Notificaciones** de sync (Slack)
- **No `kubectl apply` manual** (rompe el modelo)

## Anti-patterns

- ❌ Secrets en claro en el repo de config
- ❌ `kubectl apply` manual (drift, rompe GitOps)
- ❌ Código y config en el mismo repo sin separación (loops de CI)
- ❌ Sin selfHeal (drift no se corrige)
- ❌ Sin prune (recursos huérfanos quedan)
- ❌ Branches por entorno (drift entre branches)
- ❌ Editar recursos en el cluster en lugar de Git
- ❌ Sin aprobación para cambios de prod
- ❌ Un solo repo gigante sin estructura

## Checklist GitOps

- [ ] ArgoCD o Flux desplegado
- [ ] Git como única fuente de verdad
- [ ] Código separado de config (repos distintos)
- [ ] Overlays/values por entorno
- [ ] selfHeal activado (corrige drift)
- [ ] prune activado (borra huérfanos)
- [ ] Secrets cifrados (Sealed Secrets/SOPS) o externos (ESO)
- [ ] CI actualiza config (no hace kubectl apply)
- [ ] PRs + aprobación para prod
- [ ] Sync waves para dependencias
- [ ] Notificaciones de sync configuradas
- [ ] Rollback vía git revert documentado
