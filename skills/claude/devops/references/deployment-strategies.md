# Deployment Strategies

Rolling, blue-green, canary, feature flags, rollback. Desplegar sin (o con mínimo) downtime.

## Comparación rápida

| Estrategia | Downtime | Rollback | Costo | Riesgo | Complejidad |
|---|---|---|---|---|---|
| **Recreate** | Sí | Lento | Bajo | Alto | Baja |
| **Rolling** | No | Medio | Bajo | Medio | Baja |
| **Blue-Green** | No | Instantáneo | Alto (2x) | Bajo | Media |
| **Canary** | No | Rápido | Medio | Muy bajo | Alta |

## Recreate

Mata todo lo viejo, levanta lo nuevo. Hay downtime.

```yaml
# Kubernetes
spec:
  strategy:
    type: Recreate
```

**Cuándo**: dev, apps que no toleran 2 versiones simultáneas (ej: migración de schema incompatible), downtime aceptable.

## Rolling Update (default)

Reemplaza pods gradualmente. Sin downtime si está bien configurado.

```yaml
# Kubernetes
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1            # 1 pod extra durante el update
      maxUnavailable: 0      # 0 = nunca menos del total (sin downtime)
  replicas: 4
```

```
Estado:  v1 v1 v1 v1
Paso 1:  v1 v1 v1 v1 v2     (surge +1)
Paso 2:  v1 v1 v1 v2        (mata 1 v1)
Paso 3:  v1 v1 v1 v2 v2
...
Final:   v2 v2 v2 v2
```

### Parámetros

- **maxSurge**: pods extra permitidos durante update (más = más rápido, más recursos)
- **maxUnavailable**: pods que pueden faltar (0 = sin downtime, requiere surge)

```bash
# Ejecutar rolling update
kubectl set image deployment/myapp myapp=myapp:1.2.4
kubectl rollout status deployment/myapp

# Pausar/resumir
kubectl rollout pause deployment/myapp
kubectl rollout resume deployment/myapp

# Rollback
kubectl rollout undo deployment/myapp
```

**Requiere**: readiness probes correctas (no enviar tráfico a pods no listos). **Cuándo**: default para la mayoría de apps stateless.

⚠️ Durante rolling, v1 y v2 coexisten. La app debe ser compatible (backward/forward). Importante para cambios de API/DB.

## Blue-Green

Dos entornos idénticos. "Blue" (actual) sirve tráfico, "Green" (nuevo) se prepara. Switch instantáneo.

```
         ┌──────────┐
Tráfico →│  Router  │
         └────┬─────┘
              │ (apunta a Blue)
      ┌───────┴────────┐
      ▼                ▼
   ┌──────┐        ┌───────┐
   │ Blue │        │ Green │  ← se despliega y testea
   │ (v1) │        │ (v2)  │
   └──────┘        └───────┘

Switch: Router → Green (instantáneo)
Rollback: Router → Blue (instantáneo)
```

### En Kubernetes (con Services)

```yaml
# Deployment Blue (v1)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
---
# Deployment Green (v2) — desplegado en paralelo
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  selector:
    matchLabels:
      app: myapp
      version: green
---
# Service apunta a uno (cambiar selector para switch)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue        # cambiar a "green" para el switch
  ports:
    - port: 80
      targetPort: 8080
```

```bash
# Switch: cambiar el selector del Service
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

# Rollback instantáneo
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Pros / Cons

**Pros**:
- Switch instantáneo
- Rollback instantáneo
- Testeo completo de green antes del switch
- Sin coexistencia de versiones en el tráfico

**Cons**:
- 2x recursos (dos entornos completos)
- Cambios de DB/estado son complicados (ambos comparten DB)
- Switch all-or-nothing (todo el tráfico de golpe)

**Cuándo**: cuando necesitás rollback instantáneo y podés pagar 2x recursos temporalmente.

## Canary

Lanzar la nueva versión a un **subconjunto** de usuarios/tráfico, monitorear, e ir aumentando gradualmente.

```
Fase 1:  95% → v1,  5% → v2    (observar métricas)
Fase 2:  75% → v1, 25% → v2    (si todo OK)
Fase 3:  50% → v1, 50% → v2
Fase 4:   0% → v1, 100% → v2   (promoción completa)

Si métricas malas en cualquier fase → rollback a v1
```

### Canary básico en Kubernetes (por réplicas)

```yaml
# v1: 9 réplicas (90%)
# v2 canary: 1 réplica (10%)
# Mismo Service selecciona ambos por label común
```

Crudo: el % depende de la proporción de réplicas. Para control fino, usar service mesh o ingress con traffic splitting.

### Canary con Argo Rollouts

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10      # 10% a canary
        - pause: {duration: 5m}
        - setWeight: 25
        - pause: {duration: 5m}
        - setWeight: 50
        - pause: {duration: 10m}
        - setWeight: 100
      # Análisis automático de métricas
      analysis:
        templates:
          - templateName: success-rate
        startingStep: 1
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
        - name: myapp
          image: myapp:1.2.4
```

```yaml
# AnalysisTemplate: rollback automático si métricas malas
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
    - name: success-rate
      interval: 1m
      successCondition: result >= 0.99
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{status!~"5..",app="myapp"}[2m]))
            / sum(rate(http_requests_total{app="myapp"}[2m]))
```

Si el success rate baja del 99%, Argo Rollouts hace rollback automático.

### Canary con service mesh (Istio)

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
    - myapp
  http:
    - route:
        - destination:
            host: myapp
            subset: v1
          weight: 90
        - destination:
            host: myapp
            subset: v2
          weight: 10        # 10% a v2
```

### Pros / Cons

**Pros**:
- Riesgo mínimo (pocos usuarios afectados si falla)
- Métricas reales antes de promoción completa
- Rollback afecta a pocos
- Detección temprana de problemas

**Cons**:
- Más complejo (requiere traffic splitting, análisis)
- Coexistencia de versiones (compatibilidad)
- Necesita buenas métricas para decidir

**Cuándo**: cambios riesgosos, alto tráfico, cuando podés medir éxito objetivamente.

## Herramientas de progressive delivery

- **Argo Rollouts**: canary/blue-green con análisis automático
- **Flagger**: progressive delivery con service mesh (Istio, Linkerd, etc.)
- **Service mesh** (Istio, Linkerd): traffic splitting fino

## Feature Flags (desacoplar deploy de release)

Separar **desplegar código** de **activar funcionalidad**. El código se despliega (apagado), se activa con un flag cuando se quiere.

```javascript
// El código está desplegado pero detrás de un flag
if (featureFlags.isEnabled('new-checkout', user)) {
  return newCheckout();
}
return oldCheckout();
```

### Beneficios

- Deploy ≠ release (desplegás sin activar)
- Activar/desactivar sin redeploy
- Canary a nivel de usuario (activar para 5% de users)
- Kill switch instantáneo si algo falla
- A/B testing
- Trunk-based development (mergear código incompleto detrás de flag)

### Herramientas

- **LaunchDarkly**, **Flagsmith**, **Unleash** (open source), **Split**
- Cloud: AWS AppConfig, GrowthBook

### Buenas prácticas

- Flags temporales: eliminar después de release completa (deuda técnica si se acumulan)
- Nombrar claramente
- Documentar dueño y fecha de eliminación
- No anidar demasiados flags (complejidad combinatoria)

## Rollback

La capacidad de revertir rápido es tan importante como desplegar.

### Estrategias de rollback

```bash
# Kubernetes rolling
kubectl rollout undo deployment/myapp
kubectl rollout undo deployment/myapp --to-revision=3

# Helm
helm rollback myapp 2

# Blue-green: switch de vuelta (instantáneo)
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'

# GitOps: revert del commit (ArgoCD/Flux sincronizan)
git revert <commit> && git push

# Feature flag: desactivar (instantáneo, sin deploy)
# toggle off en la plataforma de flags
```

### Rollback automático

CI/CD o progressive delivery detecta fallo y revierte:

```yaml
# Argo Rollouts: rollback automático si análisis falla (ver arriba)

# CI/CD manual: verificar health post-deploy
- run: |
    kubectl rollout status deployment/myapp --timeout=300s || \
    kubectl rollout undo deployment/myapp
```

### Plan de rollback

Siempre tener:
- Cómo revertir (comando exacto)
- Cuánto tarda
- Quién decide
- Cómo verificar que el rollback funcionó

## Compatibilidad durante deploys

Durante rolling/canary, v1 y v2 coexisten. La app debe ser compatible:

### Backward compatible

v2 debe funcionar con datos/requests de v1.

### Cambios de base de datos (cuidado)

Schema changes incompatibles rompen rolling/canary. Patrón **expand-contract**:

```
1. Expand: agregar columna nueva (compatible con v1 y v2)
2. Deploy v2 que usa la columna nueva
3. Migrar datos
4. Contract: eliminar columna vieja (cuando v1 ya no corre)
```

Nunca: borrar/renombrar columna y desplegar app que la necesita en el mismo paso (rompe la versión vieja durante el rolling). Ver `databases` para migraciones.

### Cambios de API

- Agregar campos: OK (backward compatible)
- Eliminar/renombrar campos: romper (usar versionado de API o deprecation)

## Decisión: qué estrategia usar

```
¿Downtime aceptable?
├── Sí → Recreate (simple)
└── No
    │
    ¿Necesitás rollback instantáneo?
    ├── Sí, y podés pagar 2x recursos → Blue-Green
    └── No
        │
        ¿Cambio riesgoso / alto tráfico / podés medir éxito?
        ├── Sí → Canary (con análisis automático)
        └── No → Rolling (default)

+ Feature flags para desacoplar deploy de release (siempre útil)
```

## Anti-patterns

- ❌ Deploy sin plan de rollback
- ❌ Recreate en producción con usuarios (downtime)
- ❌ Rolling sin readiness probes (tráfico a pods no listos)
- ❌ Cambios de DB incompatibles durante rolling/canary
- ❌ Canary sin métricas para decidir (canary ciego)
- ❌ Blue-green ignorando estado compartido (DB)
- ❌ Feature flags que nunca se eliminan (deuda técnica)
- ❌ Deploy de viernes sin nadie de guardia
- ❌ Big bang deploy (todo de golpe sin canary en cambios riesgosos)
- ❌ Sin verificar health post-deploy

## Checklist deployment

- [ ] Estrategia elegida según riesgo/requisitos
- [ ] Readiness probes (para rolling/canary)
- [ ] Plan de rollback documentado y probado
- [ ] Rollback automático en fallo de health
- [ ] Compatibilidad de versiones verificada (backward)
- [ ] Cambios de DB con expand-contract
- [ ] Feature flags para cambios riesgosos
- [ ] Métricas para decidir promoción (canary)
- [ ] Monitoreo durante y post-deploy
- [ ] No desplegar sin cobertura de guardia
