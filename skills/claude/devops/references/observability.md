# Observabilidad

Prometheus, Grafana, logs, tracing, alerting, golden signals. Ver el estado de los sistemas.

**Nota**: para detección de seguridad (SIEM, threat hunting) ver `cybersecurity-defense` (`detection-monitoring.md`). Aquí: observabilidad operacional (performance, salud, debugging).

## Principio: no podés operar lo que no ves

Observabilidad = capacidad de entender el estado interno de un sistema desde sus salidas. Sin ella, operás a ciegas.

## Los 3 pilares

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Métricas   │  │    Logs     │  │   Traces    │
│ (qué pasa)  │  │(qué pasó    │  │ (dónde, en  │
│  agregado   │  │ en detalle) │  │ qué request)│
└─────────────┘  └─────────────┘  └─────────────┘
```

| Pilar | Qué | Cuándo |
|---|---|---|
| **Métricas** | Números agregados en el tiempo (CPU, requests/seg, latencia) | "¿Está sano? ¿Cuánta carga?" |
| **Logs** | Eventos discretos con detalle | "¿Qué pasó exactamente?" |
| **Traces** | Camino de un request a través de servicios | "¿Dónde está la latencia?" |

Monitoring vs Observability: monitoring es saber si algo conocido falla (dashboards predefinidos). Observability es poder investigar problemas desconocidos (explorar libremente).

## Golden Signals (qué medir)

Las 4 señales de oro (Google SRE) para cualquier servicio:

1. **Latency**: cuánto tarda en responder (separar exitosos de errores)
2. **Traffic**: cuánta demanda (requests/seg)
3. **Errors**: tasa de errores (5xx, fallos)
4. **Saturation**: cuán lleno está el sistema (CPU, memoria, disco, conexiones)

Método RED (para servicios):
- **R**ate (requests/seg)
- **E**rrors (errores/seg)
- **D**uration (latencia)

Método USE (para recursos):
- **U**tilization
- **S**aturation
- **E**rrors

## Métricas: Prometheus

Estándar para métricas en cloud-native. Pull-based (scrape de endpoints).

### Tipos de métricas

```
Counter   → solo sube (requests totales, errores totales)
Gauge     → sube y baja (memoria en uso, conexiones activas)
Histogram → distribución (latencia en buckets)
Summary   → similar, percentiles calculados en el cliente
```

### Instrumentar una app

```javascript
// Node.js con prom-client
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Counter
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogram para latencia
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Middleware
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const labels = { method: req.method, route: req.route?.path || 'unknown', status: res.statusCode };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Configuración de Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'myapp'
    static_configs:
      - targets: ['myapp:3000']
    metrics_path: /metrics

  # Service discovery en Kubernetes
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

En Kubernetes, usar **Prometheus Operator** (gestiona Prometheus declarativamente con ServiceMonitor/PodMonitor).

```yaml
# ServiceMonitor (Prometheus Operator)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
    - port: metrics
      interval: 15s
```

### PromQL (queries)

```promql
# Rate de requests por segundo
rate(http_requests_total[5m])

# Tasa de errores
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))

# Latencia p99
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Por servicio
sum by (route) (rate(http_requests_total[5m]))

# Uso de memoria
container_memory_usage_bytes{pod=~"myapp.*"}
```

## Visualización: Grafana

Dashboards sobre Prometheus (y otras fuentes).

```
- Conectar datasource (Prometheus)
- Dashboards con paneles (gráficos de PromQL)
- Dashboards pre-hechos (grafana.com/dashboards)
- Variables para filtrar (por servicio, entorno)
- Alertas visuales
```

Dashboards típicos:
- Golden signals por servicio
- Recursos del cluster (nodos, pods)
- Uso de DB, cache, queue
- Negocio (requests, usuarios, conversiones)

Dashboards as code: provisioning con JSON/Terraform, o Grafana Operator en K8s.

## Logs

### Logging estructurado

```javascript
// ❌ MAL: texto plano (difícil de parsear/buscar)
console.log(`User ${userId} logged in from ${ip}`);

// ✅ BIEN: JSON estructurado
logger.info({
  event: 'user_login',
  userId: userId,
  ip: ip,
  timestamp: new Date().toISOString(),
});
```

Logs estructurados (JSON) son buscables, filtrables, agregables. Usar librerías: pino/winston (Node), structlog (Python), zap/zerolog (Go), Logback (Java).

### Niveles de log

```
ERROR → algo falló, requiere atención
WARN  → algo inusual, no crítico
INFO  → eventos importantes (startup, requests)
DEBUG → detalle para debugging (off en prod normalmente)
```

### Buenas prácticas

- **Estructurados** (JSON)
- **Correlation ID**: trazar un request a través de servicios
- **Contexto**: incluir datos relevantes (userId, requestId)
- **Sin secrets/PII** en logs (ver `cybersecurity-defense`)
- **Niveles apropiados** (no todo INFO)
- **Centralizados** (no solo en el host)

### Stack de logs

```
Apps → Agente (Fluentd/Fluent Bit/Vector) → Storage + Index → Visualización
```

Opciones:
- **ELK/EFK**: Elasticsearch + Logstash/Fluentd + Kibana
- **Loki** (Grafana): logs indexados por labels (más liviano, integra con Grafana)
- **OpenSearch**: fork de Elasticsearch
- **Cloud**: CloudWatch Logs, Cloud Logging, Azure Monitor

### Loki (liviano, popular)

```yaml
# Loki indexa por labels (no full-text), más eficiente
# Promtail/Fluent Bit envían logs a Loki
# Grafana visualiza (mismo lugar que métricas)
```

```logql
# LogQL (queries de Loki)
{app="myapp"} |= "error"
{app="myapp"} | json | status >= 500
rate({app="myapp"} |= "error" [5m])
```

## Tracing distribuido

Seguir un request a través de múltiples servicios. Esencial en microservicios.

```
Request → [API Gateway] → [Auth Service] → [Order Service] → [DB]
            span 1          span 2           span 3          span 4
          └──────────────── trace completo ─────────────────┘
```

### OpenTelemetry (estándar)

OpenTelemetry (OTel) es el estándar para instrumentación (métricas, logs, traces). Vendor-neutral.

```javascript
// Node.js con OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Auto-instrumentation captura HTTP, DB, etc. automáticamente.

### Backends de tracing

- **Jaeger**: open source, popular
- **Tempo** (Grafana): integra con Grafana
- **Zipkin**: clásico
- **Cloud**: AWS X-Ray, Google Cloud Trace, Datadog APM

### OTel Collector

Recibe telemetría, la procesa, la envía a backends. Desacopla apps de backends.

```yaml
# Apps → OTel Collector → (Prometheus para métricas, Tempo/Jaeger para traces, Loki para logs)
```

## Alerting

Alertas cuando algo requiere atención.

### Prometheus Alertmanager

```yaml
# Reglas de alerta (PrometheusRule)
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: myapp-alerts
spec:
  groups:
    - name: myapp
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{status=~"5..",app="myapp"}[5m]))
            / sum(rate(http_requests_total{app="myapp"}[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on myapp"
            description: "Error rate is {{ $value | humanizePercentage }}"

        - alert: HighLatency
          expr: |
            histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{app="myapp"}[5m])) > 1
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "High p99 latency on myapp"
```

### Alertmanager routing

```yaml
# alertmanager.yml
route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '...'
  - name: 'slack'
    slack_configs:
      - api_url: '...'
        channel: '#alerts'
```

### Buenas prácticas de alerting

- **Alertar sobre síntomas, no causas** (alertar "usuarios ven errores", no "CPU alta")
- **Basadas en SLOs** (ver `sre-culture.md`)
- **Accionables** (cada alerta requiere acción)
- **Evitar fatiga** (demasiadas alertas → se ignoran)
- **Severidades** (critical = página de inmediato, warning = revisar)
- **Runbooks** linkeados (qué hacer ante la alerta)
- **for** clause (esperar antes de alertar, evitar flapping)

⚠️ Alert fatigue es real: si alertás de todo, nadie presta atención. Alertar solo lo accionable.

## Stack de observabilidad recomendado

### Cloud-native open source

```
Métricas: Prometheus + Grafana
Logs:     Loki + Grafana
Traces:   Tempo/Jaeger + Grafana
Alerting: Alertmanager
Instrumentación: OpenTelemetry
```

Todo visualizable en Grafana (LGTM stack: Loki, Grafana, Tempo, Mimir/Prometheus).

### Comerciales (all-in-one)

Datadog, New Relic, Grafana Cloud, Honeycomb, Dynatrace. Menos setup, costo por volumen.

## SLI/SLO (ligado a observabilidad)

Las métricas alimentan los SLIs (Service Level Indicators). Ver `sre-culture.md` para SLOs.

```promql
# SLI: % de requests exitosos (availability)
sum(rate(http_requests_total{status!~"5.."}[30d]))
/ sum(rate(http_requests_total[30d]))

# SLI: % de requests bajo 300ms (latency)
sum(rate(http_request_duration_seconds_bucket{le="0.3"}[30d]))
/ sum(rate(http_request_duration_seconds_count[30d]))
```

## Observabilidad en Kubernetes

```
- kube-state-metrics: métricas del estado de K8s (deployments, pods)
- node-exporter: métricas de nodos
- cAdvisor: métricas de contenedores
- Prometheus Operator: gestión declarativa
- Todo + Grafana para dashboards
```

Stack común: **kube-prometheus-stack** (Helm chart con Prometheus + Grafana + Alertmanager + exporters preconfigurados).

```bash
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring
```

## Anti-patterns

- ❌ Operar sin observabilidad (a ciegas)
- ❌ Logs sin estructura (texto plano difícil de buscar)
- ❌ Secrets/PII en logs (ver cybersecurity-defense)
- ❌ Solo logs locales (no centralizados)
- ❌ Alertas no accionables (fatiga)
- ❌ Alertar sobre causas en vez de síntomas
- ❌ Sin tracing en microservicios (no podés debuggear latencia)
- ❌ Dashboards sin mantener (datos obsoletos)
- ❌ Métricas sin labels útiles (no se puede filtrar)
- ❌ Cardinalidad explosiva (labels con valores infinitos: userId)
- ❌ Sin golden signals (no sabés si el servicio está sano)
- ❌ Sin runbooks linkeados a alertas

## Checklist observabilidad

### Métricas
- [ ] Apps instrumentadas (Prometheus/OTel)
- [ ] Golden signals por servicio (latency, traffic, errors, saturation)
- [ ] Prometheus + Grafana (o equivalente)
- [ ] Dashboards por servicio
- [ ] Métricas de infra (nodos, pods, recursos)
- [ ] Sin cardinalidad explosiva (labels controlados)

### Logs
- [ ] Logs estructurados (JSON)
- [ ] Centralizados (Loki/ELK/cloud)
- [ ] Correlation ID
- [ ] Niveles apropiados
- [ ] Sin secrets/PII

### Traces
- [ ] OpenTelemetry instrumentado
- [ ] Tracing distribuido (microservicios)
- [ ] Backend (Jaeger/Tempo)
- [ ] Correlación con logs/métricas

### Alerting
- [ ] Alertas basadas en síntomas/SLOs
- [ ] Accionables (sin fatiga)
- [ ] Severidades definidas
- [ ] Routing (PagerDuty/Slack)
- [ ] Runbooks linkeados
- [ ] for clause (anti-flapping)
