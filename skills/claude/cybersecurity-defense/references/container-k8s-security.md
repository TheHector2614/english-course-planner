# Container & Kubernetes Security

Hardening de Docker y Kubernetes. Imágenes, runtime, RBAC, network policies, Pod Security.

**MITRE ATT&CK Containers matrix**: Initial Access, Execution, Persistence, Privilege Escalation en entornos containerizados.

## Principio: contenedores no son barreras de seguridad por sí solos

Un contenedor comparte el kernel del host. Sin hardening, un contenedor comprometido puede escapar al host. Defensa en capas: imagen + runtime + orquestador + red.

## Seguridad de imágenes

### Imágenes mínimas

```dockerfile
# ❌ Imagen grande, mucha superficie
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 ...

# ✅ Distroless: sin shell, sin package manager, mínima superficie
FROM gcr.io/distroless/python3-debian12

# ✅ O alpine (chica, pero tiene shell)
FROM python:3.12-alpine
```

Distroless = sin shell ni utilidades. Un atacante que comprometa el proceso no tiene `sh`, `curl`, etc. para pivotar.

### Pin por digest (no tag)

```dockerfile
# ❌ Tag movible (puede cambiar bajo tus pies)
FROM node:20

# ✅ Digest inmutable
FROM node:20-slim@sha256:abc123def456...
```

### Non-root user

```dockerfile
# Crear usuario no privilegiado
FROM node:20-slim
RUN groupadd -r app && useradd -r -g app app
USER app
# El proceso corre como 'app', no root
```

### Multi-stage builds (no incluir build tools en runtime)

```dockerfile
# Stage de build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage de runtime (mínimo, sin build tools)
FROM gcr.io/distroless/nodejs20-debian12
COPY --from=builder /app/dist /app
COPY --from=builder /app/node_modules /app/node_modules
USER nonroot
CMD ["/app/server.js"]
```

### Escanear imágenes

```bash
# Trivy (ver supply-chain-security.md)
trivy image myapp:1.0 --severity CRITICAL,HIGH

# Grype
grype myapp:1.0

# En CI: fallar si hay vulnerabilidades críticas
```

### No secrets en imágenes

Secrets en layers quedan en la imagen aunque los borres después.

```dockerfile
# ❌ MAL: el secret queda en el layer
RUN echo "API_KEY=secret123" > /app/.env

# ✅ Inyectar en runtime (ver secrets-protection.md)
# Usar secret manager, env de runtime, o mounts
```

```bash
# Buildkit secrets (no quedan en la imagen)
docker build --secret id=npmrc,src=$HOME/.npmrc .
```

### Firma de imágenes

Ver `supply-chain-security.md` para Cosign/Sigstore.

## Docker runtime hardening

### Configuración segura del daemon

```json
// /etc/docker/daemon.json
{
  "icc": false,
  "userns-remap": "default",
  "no-new-privileges": true,
  "live-restore": true,
  "userland-proxy": false,
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

### Ejecutar contenedores seguros

```bash
docker run \
  --read-only \                          # filesystem read-only
  --tmpfs /tmp:noexec,nosuid \           # tmp escribible no ejecutable
  --cap-drop=ALL \                       # drop todas las capabilities
  --cap-add=NET_BIND_SERVICE \           # solo las necesarias
  --security-opt=no-new-privileges \     # no escalar privilegios
  --user 1000:1000 \                     # non-root
  --memory=512m --cpus=1 \               # límites de recursos
  --network=mynetwork \                  # red específica, no default bridge
  myapp:1.0
```

### Docker Bench (auditoría CIS)

```bash
docker run --rm -it \
  --net host --pid host --userns host --cap-add audit_control \
  -v /etc:/etc:ro -v /var/lib:/var/lib:ro \
  docker/docker-bench-security
```

### Lo que NUNCA hacer con Docker

- ❌ `--privileged` (acceso casi total al host)
- ❌ Montar el Docker socket (`/var/run/docker.sock`) en un contenedor (= root en host)
- ❌ Correr como root sin razón
- ❌ `--cap-add=ALL`
- ❌ `--network=host` sin necesidad
- ❌ Montar directorios sensibles del host (`/`, `/etc`)

## Kubernetes Security

### Pod Security Standards

Reemplazan a PodSecurityPolicy (deprecado). 3 niveles:

- **Privileged**: sin restricciones
- **Baseline**: previene escalaciones conocidas
- **Restricted**: hardening fuerte (recomendado)

```yaml
# Aplicar a nivel namespace
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### securityContext (hardening de pods)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:1.0@sha256:...
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        capabilities:
          drop:
            - ALL
      resources:
        limits:
          memory: "512Mi"
          cpu: "1"
        requests:
          memory: "256Mi"
          cpu: "500m"
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

Checklist de securityContext:
- `runAsNonRoot: true`
- `allowPrivilegeEscalation: false`
- `readOnlyRootFilesystem: true`
- `capabilities.drop: [ALL]`
- `seccompProfile.type: RuntimeDefault`
- Resource limits (previene DoS)

### RBAC (least privilege)

```yaml
# Role: permisos mínimos
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-reader
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]   # solo lectura, solo configmaps
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-reader-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: production
roleRef:
  kind: Role
  name: app-reader
  apiGroup: rbac.authorization.k8s.io
```

RBAC anti-patterns:
- ❌ `cluster-admin` a service accounts
- ❌ Wildcards en verbs/resources (`verbs: ["*"]`)
- ❌ `default` service account con permisos
- ❌ Permisos a nivel cluster cuando namespace alcanza

```bash
# Auditar RBAC
kubectl auth can-i --list --as=system:serviceaccount:production:app-sa

# Tools: rbac-tool, kubectl-who-can
kubectl who-can delete pods
```

### Network Policies (default deny)

```yaml
# Default deny all (ingress y egress) — ver data-exfiltration-prevention.md y network-defense.md
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
# Allow explícito: frontend → api
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

⚠️ Network Policies requieren un CNI que las soporte (Calico, Cilium, etc.). El default de algunos clusters no las aplica.

### Service Accounts

```yaml
# No auto-montar el token si no se necesita
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
automountServiceAccountToken: false   # no montar token de API en el pod
---
# O a nivel pod
apiVersion: v1
kind: Pod
spec:
  automountServiceAccountToken: false
```

El token del service account da acceso a la API de k8s. Si el pod no lo necesita, no montarlo (reduce blast radius si se compromete).

### Secrets en Kubernetes

Ver `secrets-protection.md`:
- Kubernetes Secrets son base64, NO cifrados por default
- Habilitar encryption at rest en etcd
- Mejor: External Secrets Operator con Vault/cloud secret manager

### Admission Control

Validar/mutar recursos antes de crearlos:

- **Pod Security Admission** (built-in)
- **Kyverno**: policies declarativas (validar, mutar, generar)
- **OPA Gatekeeper**: policies con Rego

```yaml
# Kyverno: requerir non-root, bloquear privileged, requerir límites, etc.
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-non-root
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-runAsNonRoot
      match:
        resources:
          kinds: [Pod]
      validate:
        message: "Pods must run as non-root"
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true
```

Otros usos de admission control:
- Solo imágenes firmadas (ver `supply-chain-security.md`)
- Solo imágenes de registries aprobados
- Requerir resource limits
- Bloquear `latest` tag
- Requerir labels

### Runtime security (Falco)

Detectar comportamiento anómalo en runtime:

```yaml
# Falco: reglas de detección en runtime
# Detecta: shell en contenedor, escritura en directorios sensibles,
# conexiones inesperadas, escalada de privilegios, etc.

# Ejemplo de regla Falco
- rule: Shell in Container
  desc: Detecta shell ejecutado en un contenedor
  condition: >
    spawned_process and container
    and shell_procs and proc.tty != 0
  output: >
    Shell ejecutado en contenedor
    (user=%user.name container=%container.name
     proc=%proc.cmdline)
  priority: WARNING
  tags: [container, shell, mitre_execution]
```

Falco detecta en tiempo real:
- Shell ejecutado en contenedor (los distroless no deberían tener actividad de shell)
- Escritura en directorios del sistema
- Conexiones de red inesperadas
- Lectura de archivos sensibles
- Escalada de privilegios

### CIS Kubernetes Benchmark

```bash
# kube-bench
kube-bench run --targets master,node,etcd,policies

# Verifica configuración del cluster contra CIS
```

### etcd security

etcd guarda todo el estado del cluster (incluyendo secrets):
- Encryption at rest
- TLS para comunicación
- Acceso restringido (solo API server)
- Backups cifrados

## Control plane hardening

- **API server**: TLS, autenticación fuerte, audit logging, RBAC
- **Audit logging**: registrar todas las llamadas a la API
- **Anonymous auth deshabilitado**
- **Kubelet**: autenticación/autorización, no anonymous
- **Network**: control plane no expuesto a internet

```yaml
# API server audit policy (registrar actividad)
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: RequestResponse
    resources:
      - group: ""
        resources: ["secrets", "configmaps"]
  - level: Metadata
    omitStages:
      - RequestReceived
```

## Managed Kubernetes (EKS/GKE/AKS)

Para clusters gestionados:
- **AWS EKS**: IRSA (IAM Roles for Service Accounts), security groups for pods, GuardDuty EKS protection
- **GCP GKE**: Workload Identity, Binary Authorization, Shielded GKE nodes
- **Azure AKS**: Managed identities, Azure Policy, Defender for Containers

Usar workload identity (no credenciales estáticas) para acceso a recursos cloud. Ver `cloud-security.md`.

## Scanning continuo

```bash
# Trivy puede escanear el cluster completo
trivy k8s --report summary cluster

# Detecta: imágenes vulnerables, misconfiguraciones, secrets expuestos, RBAC issues
```

## Checklist container & Kubernetes security

### Imágenes
- [ ] Imágenes mínimas (distroless/alpine)
- [ ] Pin por digest
- [ ] Non-root user
- [ ] Multi-stage builds (sin build tools en runtime)
- [ ] Escaneadas (Trivy/Grype) sin críticas
- [ ] Sin secrets en layers
- [ ] Firmadas (Cosign)

### Docker runtime
- [ ] read-only filesystem
- [ ] cap-drop ALL + solo necesarias
- [ ] no-new-privileges
- [ ] non-root user
- [ ] Resource limits
- [ ] Sin --privileged
- [ ] Sin Docker socket montado
- [ ] Docker Bench passing

### Kubernetes pods
- [ ] Pod Security Standards: restricted
- [ ] runAsNonRoot
- [ ] allowPrivilegeEscalation: false
- [ ] readOnlyRootFilesystem
- [ ] capabilities drop ALL
- [ ] seccompProfile RuntimeDefault
- [ ] Resource limits
- [ ] automountServiceAccountToken: false (si no se usa)

### Kubernetes cluster
- [ ] RBAC least privilege (sin cluster-admin a SAs)
- [ ] Network Policies default-deny
- [ ] CNI que soporta Network Policies
- [ ] Secrets con encryption at rest (o External Secrets)
- [ ] Admission control (Kyverno/Gatekeeper)
- [ ] Solo imágenes firmadas/aprobadas
- [ ] Runtime security (Falco)
- [ ] kube-bench (CIS) passing
- [ ] Audit logging habilitado
- [ ] etcd cifrado y restringido
- [ ] Control plane no expuesto a internet
- [ ] Workload identity (no keys estáticas)
- [ ] Scanning continuo del cluster
