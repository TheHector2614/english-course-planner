# Observabilidad en AWS

CloudWatch (logs, métricas, alarmas), X-Ray (tracing), dashboards.

## Las 3 pilares de observabilidad

1. **Logs**: qué pasó (CloudWatch Logs)
2. **Métricas**: cuánto y cuándo (CloudWatch Metrics)
3. **Traces**: dónde se gastó el tiempo (X-Ray / OpenTelemetry)

Más reciente: **Events / Audit** (CloudTrail) y **Profiling** (CloudWatch Application Signals, AWS Profiler).

## CloudWatch Logs

### Conceptos

- **Log Group**: contenedor (típicamente uno por aplicación/servicio)
- **Log Stream**: stream individual (típicamente uno por instancia/task)
- **Log Event**: línea individual

### Costos

- **Ingestion**: $0.50/GB
- **Storage**: $0.03/GB-mes
- **Insights queries**: $0.005/GB scanned

⚠️ Logs sin retention crecen para siempre. Configurar siempre retention.

### Retention recomendada

```hcl
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/lambda/mi-app"
  retention_in_days = 14  # típico para apps. Audit: más largo
}
```

| Tipo de log | Retention |
|---|---|
| App logs DEBUG/INFO | 7-14 días |
| Access logs | 30 días |
| Security audit | 365+ días |
| HIPAA audit | 2190 días (6 años) |

Archivar a S3 (más barato) si necesitas retención larga.

### Log formato estructurado

JSON estructurado permite queries más potentes:

```java
// Spring Boot con logback JSON
import net.logstash.logback.encoder.LogstashEncoder;

// logback-spring.xml ya configurado en la skill `web-backend-security`
```

```typescript
// Node.js
import pino from 'pino';
const log = pino({ formatters: { level: (l) => ({ level: l }) } });
log.info({ user: 'alice', action: 'login' }, 'User logged in');
```

Output:
```json
{"@timestamp":"2026-05-19T14:23:45Z","level":"INFO","msg":"User logged in","user":"alice","action":"login","trace_id":"abc123"}
```

### CloudWatch Logs Insights

Query language para buscar en logs:

```
fields @timestamp, @message, user, action
| filter level = "ERROR"
| stats count() by bin(5m)
| sort @timestamp desc
| limit 100
```

```
fields @timestamp, duration, path
| filter @logStream like /api/
| filter duration > 1000
| stats avg(duration), max(duration), count() by path
| sort avg(duration) desc
```

```
parse @message /user=(?<user>[^ ]+) action=(?<action>[^ ]+)/
| stats count() by user, action
| sort count desc
```

## CloudWatch Metrics

### Tipos

- **AWS metrics** (automáticas): CPU EC2, latencia ALB, requests CloudFront, etc.
- **Custom metrics**: las que pones tú vía SDK

### Namespaces y dimensiones

- **Namespace**: agrupa métricas (ej: `AWS/ECS`, `MyApp/Orders`)
- **Dimensiones**: filtros (ej: `ServiceName=mi-app`, `Environment=prod`)

### Métricas más útiles por servicio

**ECS Fargate**:
- `CPUUtilization`, `MemoryUtilization`
- `RunningTaskCount`, `PendingTaskCount`
- `ServiceTaskFailures`

**ALB**:
- `RequestCount`, `TargetResponseTime`
- `HTTPCode_Target_2XX_Count`, `HTTPCode_Target_5XX_Count`
- `UnHealthyHostCount`

**RDS**:
- `CPUUtilization`, `DatabaseConnections`
- `FreeableMemory`, `FreeStorageSpace`
- `ReadLatency`, `WriteLatency`
- `Deadlocks`

**Lambda**:
- `Invocations`, `Duration`, `Errors`
- `Throttles`, `ConcurrentExecutions`
- `ColdStarts` (custom; medirlo manualmente o con extension)

**CloudFront**:
- `Requests`, `BytesDownloaded`
- `4xxErrorRate`, `5xxErrorRate`
- `CacheHitRate`

**S3**:
- `BucketSizeBytes`, `NumberOfObjects` (daily)
- `AllRequests`, `4xxErrors`, `5xxErrors`

### Custom metrics desde código

```java
// Spring Boot con Micrometer + CloudWatch
@Service
public class OrderService {
    private final MeterRegistry registry;
    private final Counter ordersCreated;
    private final Timer orderProcessTime;

    public OrderService(MeterRegistry registry) {
        this.registry = registry;
        this.ordersCreated = Counter.builder("orders.created")
            .description("Total orders created")
            .tag("environment", "prod")
            .register(registry);
        this.orderProcessTime = Timer.builder("orders.process.time")
            .register(registry);
    }

    public Order createOrder(OrderRequest req) {
        return orderProcessTime.record(() -> {
            Order order = process(req);
            ordersCreated.increment();
            return order;
        });
    }
}
```

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-cloudwatch2</artifactId>
</dependency>
```

```yaml
management:
  metrics:
    export:
      cloudwatch:
        namespace: MyApp
        step: 1m  # interval de envío
        batch-size: 20
```

⚠️ Costo: $0.30 / custom metric / mes (con custom dimensions). Suma rápido.

**Alternativa**: usar **EMF (Embedded Metric Format)** — métricas en logs sin costo extra.

```java
// Lambda con Embedded Metric Format
import software.amazon.cloudwatchlogs.emf.logger.MetricsLogger;
import software.amazon.cloudwatchlogs.emf.model.DimensionSet;
import software.amazon.cloudwatchlogs.emf.model.Unit;

MetricsLogger metrics = new MetricsLogger();
metrics.setNamespace("MyApp")
    .setDimensions(DimensionSet.of("Service", "OrderApi"))
    .putMetric("OrderProcessTime", 234, Unit.MILLISECONDS)
    .putMetric("OrdersCreated", 1, Unit.COUNT);
metrics.flush();
```

## Alarms

### Estructura básica

```hcl
resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "alb-high-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2     # períodos consecutivos
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300   # 5 min
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Más de 10 errores 5xx en 5 min"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}
```

### Alarms críticos para apps típicas

#### Web app pública

```hcl
# 1. 5xx rate alto
# 2. Latencia alta (p99 > X ms)
# 3. Pocos targets sanos
# 4. CPU/Memoria alto en tasks
# 5. RDS connections altas
# 6. DB CPU alto
# 7. DB free storage bajo
# 8. Costos: alertar > $X
```

### Composite alarms

Combinar varias alarms con AND/OR:

```hcl
resource "aws_cloudwatch_composite_alarm" "service_unhealthy" {
  alarm_name = "service-unhealthy"
  alarm_rule = "ALARM(${aws_cloudwatch_metric_alarm.high_5xx.alarm_name}) OR ALARM(${aws_cloudwatch_metric_alarm.high_latency.alarm_name})"
  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

Útil para reducir alert fatigue (un solo aviso "service unhealthy" en lugar de múltiples).

### Anomaly detection

Detecta desviaciones del baseline aprendido:

```hcl
resource "aws_cloudwatch_metric_alarm" "anomalous_requests" {
  alarm_name                = "anomalous-request-pattern"
  comparison_operator       = "GreaterThanUpperThreshold"
  evaluation_periods        = 2
  threshold_metric_id       = "e1"
  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"  # 2 desviaciones estándar
    label       = "RequestCount (expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 300
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.main.arn_suffix
      }
    }
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

## SNS para notificaciones

```hcl
resource "aws_sns_topic" "alerts" {
  name = "alerts"
}

# Email
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "alerts@example.com"
}

# Slack via webhook (Lambda intermediario o AWS Chatbot)
resource "aws_chatbot_slack_channel_configuration" "alerts" {
  configuration_name = "alerts"
  slack_team_id      = "T123ABC"
  slack_channel_id   = "C123ABC"
  iam_role_arn       = aws_iam_role.chatbot.arn
  sns_topic_arns     = [aws_sns_topic.alerts.arn]
}

# PagerDuty: usar integration en su lado, suscribir endpoint HTTPS
resource "aws_sns_topic_subscription" "pagerduty" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "https"
  endpoint  = "https://events.pagerduty.com/integration/..."
}
```

## CloudWatch Dashboards

```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "mi-app"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        x = 0; y = 0; width = 12; height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.region
          title  = "ALB Requests"
        }
      },
      {
        type = "metric"
        x = 12; y = 0; width = 12; height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average" }],
            ["...", { stat = "p99" }],
            ["...", { stat = "p95" }]
          ]
          period = 300
          region = var.region
          title  = "Response Time"
        }
      },
      {
        type = "log"
        x = 0; y = 6; width = 24; height = 6
        properties = {
          query   = "SOURCE '/ecs/mi-app' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
          region  = var.region
          title   = "Recent errors"
        }
      }
    ]
  })
}
```

## X-Ray (distributed tracing)

Para microservicios o apps complejas, X-Ray muestra el flujo de un request a través de servicios.

### Setup Spring Boot

```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-xray-recorder-sdk-spring</artifactId>
</dependency>
```

```java
@Configuration
public class XRayConfig {
    @Bean
    public Filter tracingFilter() {
        return new AWSXRayServletFilter("MyApp");
    }
}
```

Tasks ECS necesitan sidecar X-Ray daemon o el AWS Distro for OpenTelemetry (ADOT).

### Setup Lambda

Auto-instrumentation via `Tracing: Active` en CloudFormation/SAM, o env var `_X_AMZN_TRACE_ID`.

### OpenTelemetry (mejor opción a futuro)

Open-source, multi-vendor. AWS soporta vía **AWS Distro for OpenTelemetry (ADOT)**:

```java
// Spring Boot con OTel
implementation 'io.opentelemetry:opentelemetry-api'
implementation 'io.opentelemetry:opentelemetry-sdk'
implementation 'io.opentelemetry.javaagent:opentelemetry-javaagent'
```

Java agent inyectado al startup hace tracing sin código manual.

## CloudWatch Application Signals

Servicio nuevo de AWS (preview/GA reciente). Auto-instrumentation para apps Java/Python/.NET en ECS, EKS, EC2.

Te da:
- **SLO/SLI tracking** automático
- **Latency, errors, requests** por endpoint
- **Service map** sin configurar X-Ray

Para apps nuevas, considerar **Application Signals** primero — es mucho más simple.

Verificar disponibilidad regional y precios actuales con `web_search`.

## Trampas comunes en observabilidad

- ❌ Logs sin retention (factura crece para siempre)
- ❌ Custom metrics excesivas ($0.30 cada una)
- ❌ Alertas en métricas que ruidean (flapping)
- ❌ Dashboards sin owner ni revisión periódica
- ❌ Sin SLO definido → "qué es lento?" sin baseline
- ❌ Tracing sin sampling agresivo (X-Ray cobra por trace)
- ❌ Alarms sin SNS o sin notificación real
- ❌ Loguear pasos completos en INFO ("ruidoso")
- ❌ Loguear secrets, passwords, tokens
- ❌ Sin correlation IDs entre servicios

## Checklist de observabilidad

- [ ] Logs estructurados (JSON)
- [ ] Retention configurada en todos los Log Groups
- [ ] Correlation IDs propagados entre servicios
- [ ] Dashboards de los KPIs principales
- [ ] Alarms en 4 golden signals: latency, traffic, errors, saturation
- [ ] Notificaciones funcionando (Slack/PagerDuty)
- [ ] X-Ray o OTel para distributed tracing
- [ ] Container Insights / Application Signals habilitado
- [ ] Métricas custom de negocio (orders/min, registrations, etc.)
- [ ] Logs sensibles enmascarados (passwords, PII)
- [ ] Budgets/Cost alarms configurados
