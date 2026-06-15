# Kubernetes (Operacional)

Deployments, Services, Ingress, Helm, autoscaling, operadores, debugging. Orquestación de contenedores.

**Nota**: para seguridad de K8s (Pod Security, RBAC, Network Policies, Falco) ver `cybersecurity-defense` (`container-k8s-security.md`). Aquí: operación.

## Conceptos clave

```
Cluster
├── Nodes (máquinas que corren workloads)
├── Namespaces (aislamiento lógico)
└── Workloads
    ├── Pod (unidad mínima, 1+ contenedores)
    ├── Deployment (gestiona ReplicaSets de Pods)
    ├── StatefulSet (para apps con estado)
    ├── DaemonSet (un Pod por nodo)
    ├── Job/CronJob (tareas batch)
    ├── Service (red estable para Pods)
    ├── Ingress (HTTP routing externo)
    ├── ConfigMap/Secret (configuración)
    └── PersistentVolume (almacenamiento)
```

## Deployment (el workload más común)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # cuántos pods extra durante update
      maxUnavailable: 0    # 0 = sin downtime
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: ghcr.io/org/myapp:1.2.3   # tag específico, no latest
          ports:
            - containerPort: 8080
          # Resource requests/limits (esencial)
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          # Health probes (esencial)
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          # Config desde ConfigMap/Secret
          envFrom:
            - configMapRef:
                name: myapp-config
            - secretRef:
                name: myapp-secrets
```

### Resource requests/limits (crítico)

- **requests**: lo que el pod necesita garantizado (para scheduling)
- **limits**: máximo que puede usar (evita noisy neighbors)

```yaml
resources:
  requests:
    cpu: 100m       # 0.1 core garantizado
    memory: 128Mi   # 128MB garantizado
  limits:
    cpu: 500m       # máx 0.5 core
    memory: 256Mi   # máx 256MB (OOMKilled si excede)
```

⚠️ Sin requests/limits: pods pueden consumir todo el nodo (noisy neighbor) o ser desalojados impredeciblemente. **Siempre definir.**

### Health probes (crítico)

| Probe | Qué hace | Si falla |
|---|---|---|
| **liveness** | ¿El pod está vivo? | Reinicia el pod |
| **readiness** | ¿Listo para tráfico? | Saca del Service (no recibe tráfico) |
| **startup** | ¿Terminó de arrancar? | Espera antes de liveness (apps lentas) |

```yaml
# Liveness: si falla, reinicia
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
  failureThreshold: 3

# Readiness: si falla, no recibe tráfico (pero no reinicia)
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5

# Startup: para apps de arranque lento
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30
  periodSeconds: 10   # da hasta 300s para arrancar
```

Diferencia clave: `/healthz` (¿vivo?) vs `/ready` (¿puede servir? — ej: DB conectada).

## Service (red estable)

Los Pods son efímeros (IPs cambian). Service da un endpoint estable.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: production
spec:
  selector:
    app: myapp           # selecciona pods con este label
  ports:
    - port: 80           # puerto del service
      targetPort: 8080   # puerto del contenedor
  type: ClusterIP        # default (interno)
```

### Tipos de Service

| Tipo | Uso |
|---|---|
| **ClusterIP** | Interno (default). Solo dentro del cluster |
| **NodePort** | Expone en puerto del nodo (dev/testing) |
| **LoadBalancer** | LB del cloud provider (externo) |
| **ExternalName** | Alias DNS a servicio externo |

Para HTTP externo, preferir **Ingress** sobre LoadBalancer (uno por servicio sale caro).

## Ingress (HTTP routing)

Enruta tráfico HTTP/HTTPS externo a servicios internos. Un punto de entrada para muchos servicios.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: myapp-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: myapi
                port:
                  number: 80
```

Ingress controllers: **nginx-ingress**, **Traefik**, **HAProxy**, o cloud-native (AWS Load Balancer Controller, GKE Ingress).

### Gateway API (sucesor de Ingress)

Más moderno y expresivo. Reemplazando gradualmente a Ingress:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: myapp-route
spec:
  parentRefs:
    - name: my-gateway
  hostnames:
    - app.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: myapi
          port: 80
```

## ConfigMap y Secret

```yaml
# ConfigMap (config no sensible)
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  LOG_LEVEL: "info"
  FEATURE_X: "enabled"
  config.yaml: |
    server:
      port: 8080
---
# Secret (sensible — ver cybersecurity-defense para gestión segura)
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
stringData:
  DATABASE_PASSWORD: "..."   # mejor: External Secrets Operator
```

⚠️ Secrets de K8s son solo base64 (no cifrados por default). Para producción: encryption at rest + External Secrets Operator con Vault/cloud. Ver `cybersecurity-defense` (`secrets-protection.md`).

### Usar config en pods

```yaml
# Como env vars
envFrom:
  - configMapRef:
      name: myapp-config
  - secretRef:
      name: myapp-secrets

# Como archivos montados
volumeMounts:
  - name: config
    mountPath: /etc/config
volumes:
  - name: config
    configMap:
      name: myapp-config
```

## Autoscaling

### HPA (Horizontal Pod Autoscaler)

Escala número de pods según métricas.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70    # escala si CPU > 70%
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # espera antes de reducir
```

Requiere metrics-server instalado. Para métricas custom (requests/seg, queue depth): Prometheus Adapter o KEDA.

### KEDA (event-driven autoscaling)

Escala según eventos externos (queue length, Kafka lag, etc.):

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: myapp-scaler
spec:
  scaleTargetRef:
    name: myapp
  minReplicaCount: 0      # puede escalar a 0
  maxReplicaCount: 50
  triggers:
    - type: kafka
      metadata:
        bootstrapServers: kafka:9092
        consumerGroup: my-group
        topic: my-topic
        lagThreshold: "100"
```

### VPA (Vertical Pod Autoscaler)

Ajusta requests/limits automáticamente. Útil para right-sizing, pero no usar junto con HPA en la misma métrica.

### Cluster Autoscaler

Escala los nodos del cluster (no pods). Cuando no hay espacio para pods, agrega nodos. Karpenter (AWS) es alternativa moderna más rápida.

## Helm (package manager de K8s)

Empaqueta apps de K8s en "charts" parametrizables y reusables.

### Estructura de un chart

```
mychart/
├── Chart.yaml          # metadata
├── values.yaml         # valores por default
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml
│   ├── _helpers.tpl    # templates reutilizables
│   └── NOTES.txt       # mensaje post-install
└── charts/             # dependencias (subcharts)
```

### Template con valores

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mychart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

```yaml
# values.yaml
replicaCount: 3
image:
  repository: ghcr.io/org/myapp
  tag: "1.2.3"
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

### Comandos Helm

```bash
# Instalar
helm install myapp ./mychart -n production

# Con valores custom
helm install myapp ./mychart -f values.prod.yaml --set image.tag=1.2.4

# Upgrade
helm upgrade myapp ./mychart -n production

# Upgrade o install (idempotente)
helm upgrade --install myapp ./mychart -n production

# Rollback
helm rollback myapp 1 -n production

# Listar releases
helm list -n production

# Ver historial
helm history myapp -n production

# Dry-run (ver qué generaría)
helm install myapp ./mychart --dry-run --debug

# Repos públicos
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql
```

### Kustomize (alternativa a Helm)

Sin templates, usa overlays. Built-in en kubectl.

```
base/
├── deployment.yaml
├── service.yaml
└── kustomization.yaml
overlays/
├── dev/
│   └── kustomization.yaml
└── prod/
    └── kustomization.yaml      # patches sobre base
```

```bash
kubectl apply -k overlays/prod
```

Helm vs Kustomize: Helm para packaging/distribución parametrizable; Kustomize para variaciones de entorno sin templating.

## kubectl: comandos esenciales

```bash
# Contexto y namespace
kubectl config get-contexts
kubectl config use-context my-cluster
kubectl config set-context --current --namespace=production

# Ver recursos
kubectl get pods                          # pods en namespace actual
kubectl get pods -A                       # todos los namespaces
kubectl get pods -o wide                  # más info (nodo, IP)
kubectl get deploy,svc,ingress            # múltiples tipos
kubectl get pods -l app=myapp             # por label
kubectl get pods --watch                  # en vivo

# Detalle
kubectl describe pod <pod>                # eventos, estado
kubectl get pod <pod> -o yaml             # manifest completo

# Logs
kubectl logs <pod>                        # logs
kubectl logs <pod> -f                     # follow
kubectl logs <pod> --previous             # del contenedor anterior (tras crash)
kubectl logs -l app=myapp --all-containers # de todos los pods con label

# Ejecutar/debuggear
kubectl exec -it <pod> -- sh              # shell
kubectl port-forward <pod> 8080:8080      # acceso local
kubectl cp <pod>:/path/file ./file        # copiar archivos

# Aplicar/borrar
kubectl apply -f manifest.yaml
kubectl apply -k overlays/prod            # kustomize
kubectl delete -f manifest.yaml
kubectl delete pod <pod>                  # recrea (si es de Deployment)

# Escalar
kubectl scale deploy/myapp --replicas=5

# Rollout
kubectl rollout status deploy/myapp       # estado del deploy
kubectl rollout history deploy/myapp      # historial
kubectl rollout undo deploy/myapp         # rollback a versión anterior
kubectl rollout undo deploy/myapp --to-revision=2
kubectl rollout restart deploy/myapp      # reiniciar pods (sin cambiar imagen)
```

## Debugging de problemas comunes

### Pod no arranca

```bash
kubectl describe pod <pod>      # ver Events al final
kubectl logs <pod>              # logs de la app
kubectl logs <pod> --previous   # si crasheó
```

Estados comunes:
- `ImagePullBackOff` → imagen no existe / sin acceso al registry
- `CrashLoopBackOff` → la app crashea al arrancar (ver logs)
- `Pending` → no hay recursos / nodo / PVC sin bind
- `OOMKilled` → excedió memory limit (subir limit o arreglar leak)
- `Error` → contenedor terminó con error

### CrashLoopBackOff

```bash
# Ver por qué crashea
kubectl logs <pod> --previous
kubectl describe pod <pod>

# Causas comunes:
# - App tiene un bug al arrancar
# - Falta config/secret (env var ausente)
# - Liveness probe mal configurada (mata pod sano)
# - Dependencia no disponible (DB no conecta)
```

### Pending

```bash
kubectl describe pod <pod>
# Eventos dirán:
# - "Insufficient cpu/memory" → no hay recursos (agregar nodos o bajar requests)
# - "node(s) had taint" → taints/tolerations
# - "pod has unbound PersistentVolumeClaims" → PVC no se puede satisfacer
```

### Debug con ephemeral container (imágenes distroless sin shell)

```bash
# Inyectar contenedor de debug en un pod corriendo
kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>
```

### Ver recursos del cluster

```bash
kubectl top nodes               # uso de CPU/memoria por nodo
kubectl top pods                # por pod
kubectl get events --sort-by='.lastTimestamp'   # eventos recientes
kubectl describe node <node>    # capacidad, pods, condiciones
```

## StatefulSet (apps con estado)

Para apps que necesitan identidad estable y almacenamiento persistente (DBs, Kafka, etc.):

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:        # PVC por pod
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

Pods estables: `postgres-0`, `postgres-1`, etc. Cada uno su PVC.

Para DBs en producción, considerar operadores (ver abajo) o servicios gestionados (RDS, Cloud SQL — ver `databases`, `aws-cloud`).

## Jobs y CronJobs

```yaml
# Job: tarea que corre hasta completar
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: myapp:1.2.3
          command: ["npm", "run", "migrate"]
---
# CronJob: tarea programada
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
spec:
  schedule: "0 2 * * *"      # 2 AM diario
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: backup-tool:1.0
              command: ["/backup.sh"]
```

## Operadores

Extienden K8s con lógica custom para gestionar apps complejas (DBs, sistemas distribuidos). Encapsulan conocimiento operacional.

Ejemplos: Prometheus Operator, PostgreSQL operators (CloudNativePG, Zalando), Strimzi (Kafka), cert-manager.

```yaml
# Ejemplo: CloudNativePG operator gestiona un cluster PostgreSQL
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: my-postgres
spec:
  instances: 3
  storage:
    size: 10Gi
  backup:
    barmanObjectStore:
      destinationPath: s3://backups/postgres
```

El operador maneja failover, backups, upgrades automáticamente.

## PersistentVolumes

```yaml
# PVC: solicitud de almacenamiento
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce       # un nodo (RWO), o ReadWriteMany (RWX) si el storage lo soporta
  storageClassName: gp3   # clase de storage (depende del cluster)
  resources:
    requests:
      storage: 10Gi
```

StorageClasses comunes: `gp3`/`gp2` (AWS EBS), `standard`/`premium` (GKE/AKS). El provisioner crea el volumen dinámicamente.

## Namespaces y organización

```bash
# Crear namespace
kubectl create namespace production

# Resource quotas (limitar consumo por namespace)
```

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: prod-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
```

LimitRange para defaults por pod:
```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
    - default:
        cpu: 500m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container
```

## Managed Kubernetes (EKS/GKE/AKS)

Para clusters gestionados, el control plane lo maneja el cloud. Vos manejás workloads.

- **EKS** (AWS): ver `aws-cloud` para setup. IRSA para identity.
- **GKE** (Google): Autopilot (fully managed) o Standard.
- **AKS** (Azure).

Para todos: usar workload identity (no keys estáticas), node autoscaling (Karpenter/Cluster Autoscaler), y separar workloads por node pools si necesario.

## PodDisruptionBudget (alta disponibilidad)

Garantiza mínimo de pods durante mantenimiento/drains:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2        # siempre al menos 2 pods
  selector:
    matchLabels:
      app: myapp
```

## Anti-patterns

- ❌ Sin resource requests/limits
- ❌ Sin health probes
- ❌ `latest` tag en imágenes
- ❌ `kubectl apply` manual en prod (usar GitOps — ver `gitops.md`)
- ❌ Secrets en ConfigMaps o sin encryption (ver `cybersecurity-defense`)
- ❌ Una réplica para servicios críticos (sin HA)
- ❌ Sin PodDisruptionBudget para apps importantes
- ❌ Liveness probe demasiado agresiva (mata pods sanos)
- ❌ Liveness y readiness apuntando al mismo endpoint sin distinción
- ❌ StatefulSet cuando un Deployment alcanza (complejidad innecesaria)
- ❌ Correr DBs en K8s sin operador ni expertise (considerar managed)
- ❌ Namespaces sin resource quotas (un equipo consume todo)

## Checklist Kubernetes

### Workloads
- [ ] Resource requests Y limits definidos
- [ ] Liveness probe (¿vivo?)
- [ ] Readiness probe (¿listo para tráfico?)
- [ ] Startup probe si arranque lento
- [ ] Tag de imagen específico (no latest)
- [ ] Múltiples réplicas para HA
- [ ] PodDisruptionBudget para apps críticas
- [ ] Estrategia de rollout (maxSurge/maxUnavailable)

### Red y config
- [ ] Service para exposición estable
- [ ] Ingress para HTTP externo (no LB por servicio)
- [ ] TLS configurado (cert-manager)
- [ ] ConfigMap para config
- [ ] Secrets con encryption at rest (ver cybersecurity-defense)

### Escalado y recursos
- [ ] HPA si carga variable
- [ ] Cluster/node autoscaling
- [ ] ResourceQuota por namespace
- [ ] LimitRange con defaults

### Operación
- [ ] GitOps para deploys (no kubectl manual)
- [ ] Observabilidad (ver observability.md)
- [ ] Seguridad (ver cybersecurity-defense)
- [ ] Helm/Kustomize para gestión
- [ ] Backups de datos persistentes
