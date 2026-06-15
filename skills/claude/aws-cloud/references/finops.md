# FinOps y Optimización de Costos AWS

Cómo entender, estimar y optimizar costos en AWS.

## Cómo estimar costos antes de desplegar

Para cada propuesta de arquitectura, calcular costo mensual estimado.

### Pasos

1. **Listar recursos** que se van a crear
2. **Buscar precios actuales** con `web_search` (precios cambian)
3. **Hacer supuestos explícitos**: tráfico, almacenamiento, requests
4. **Sumar**: compute + storage + transferencia + servicios
5. **Aplicar free tier** si la cuenta es nueva
6. **Buffer 20-30%** para sorpresas (logs, data transfer inter-AZ, snapshots)

### Calculadora oficial

https://calculator.aws — útil para casos complejos.

### Ejemplo: estimación de "Angular SPA en S3 + CloudFront"

Supuestos:
- Sitio: 5MB de assets
- Usuarios: 10,000 visitas/mes
- Asume cache HIT del 80% en CloudFront

| Servicio | Cálculo | Costo |
|---|---|---|
| S3 storage | 5 MB | ~$0 (free tier) |
| S3 requests (PUT durante deploys) | 100/mes | ~$0 |
| S3 requests (GET cache miss) | 20% × 50,000 = 10,000 | ~$0.004 |
| CloudFront data transfer | 5MB × 50,000 × 0.2 = 50 GB | ~$4.25 (NA/Europe) |
| CloudFront requests | 500,000 HTTPS | ~$0.50 |
| Route 53 hosted zone | 1 | $0.50 |
| Route 53 queries | < 1M | < $1 |
| ACM cert | 1 | $0 (gratis) |
| **TOTAL** | | **~$6-7/mes** |

Con free tier los primeros 12 meses: probablemente $1-2/mes.

### Ejemplo: estimación de "Java Spring Boot en ECS Fargate"

Supuestos:
- 2 containers, 0.5 vCPU + 1 GB RAM cada uno (HA)
- RDS PostgreSQL db.t3.micro
- Application Load Balancer
- 100 GB transfer out / mes

| Servicio | Cálculo | Costo |
|---|---|---|
| Fargate 0.5 vCPU × 2 × 730h | $0.04048/vCPU-h × 0.5 × 2 × 730 | ~$29.55 |
| Fargate 1 GB × 2 × 730h | $0.004445/GB-h × 1 × 2 × 730 | ~$6.49 |
| RDS db.t3.micro Multi-AZ | ~$0.034/h × 730 × 2 (multi-AZ) | ~$49.64 |
| RDS storage 20GB gp3 | $0.115/GB-mo × 20 | $2.30 |
| ALB | $0.0225/h × 730 + LCU | ~$22 |
| Data transfer out | 100GB × $0.09 | $9 |
| CloudWatch Logs (10GB) | $0.50/GB ingestion + storage | ~$8 |
| Secrets Manager (2 secrets) | $0.40 × 2 | $0.80 |
| **TOTAL** | | **~$127/mes** |

Sin Multi-AZ RDS: -$25. Sin ALB (con CloudFront directo): -$22. Single Fargate task: -$18.

**Versión optimizada para empezar**: ~$60/mes con RDS single-AZ, 1 Fargate task, sin ALB (App Runner).

### ⚠️ Costos "sorpresa" que olvidamos

| Costo | Razón |
|---|---|
| **NAT Gateway** | $0.045/h + $0.045/GB. ~$35/mes solo por horas. **Trampa #1 de AWS**. |
| **CloudWatch Logs sin retention** | Crece para siempre. Cuesta $0.03/GB storage por mes |
| **CloudWatch custom metrics** | $0.30 cada una (con custom dimensions) |
| **Inter-AZ data transfer** | $0.01/GB cada dirección. Con multi-AZ DB puede sumar |
| **VPC Endpoints** | $0.01/h cada uno × 24h × 30d = ~$7/mes/endpoint |
| **EBS snapshots no eliminados** | Pueden acumular cientos de GB |
| **EIPs sin asociar** | $3.65/mes cada una |
| **AWS Backup** | Snapshots de RDS/EBS, costo proporcional a tamaño |
| **GuardDuty** | $4-5/GB de logs analizados |
| **Config rules** | $0.001/evaluation; con muchos recursos suma |

## Las 7 fuentes principales de waste

### 1. Right-sizing incorrecto

Recursos sobre-aprovisionados. AWS Compute Optimizer da recomendaciones automáticas.

```bash
# Habilitar Compute Optimizer
aws compute-optimizer enroll --include-member-accounts
```

Revisar recomendaciones para EC2, EBS, Lambda, RDS.

### 2. Recursos no usados

- EC2 instances corriendo pero sin uso
- RDS instances con conexiones 0
- Load Balancers sin targets
- EIPs no asociadas
- EBS volumes detached
- Snapshots de discos eliminados
- AMIs viejas
- Buckets S3 olvidados

Usar **AWS Cost Anomaly Detection** + revisar tag `LastUsed`.

### 3. Patrones de almacenamiento sub-óptimos

| Pattern | Optimización |
|---|---|
| S3 Standard para archivos pocos accedidos | Mover a IA o Glacier con Lifecycle |
| EBS gp2 | Migrar a gp3 (más barato y mejor) |
| Logs sin retention | Configurar retention 7-30 días |
| Backups eternos | Lifecycle de backups |
| RDS gp2 | Migrar a gp3 |

### 4. NAT Gateway abusado

NAT Gateway: $32-35/mes por horas + por GB procesado.

**Alternativas**:
- **NAT Instance**: EC2 chica funcionando como NAT. Más barato pero manual.
- **VPC Endpoints**: para S3, DynamoDB y otros servicios AWS — gratis (Gateway endpoints) o más barato (Interface endpoints).
- **No usar subnets privadas**: para apps simples sin requisitos de seguridad estrictos.
- **Compartir NAT entre VPCs**: Transit Gateway o Shared VPC.

**Caso típico**: ECS Fargate en subnet privada necesita pull de imagen de ECR. Sin VPC endpoint, pasa por NAT y paga por GB.

### 5. Data transfer no optimizado

**Out a internet**: $0.09/GB en us-east-1. Para 1TB/mes = $90.

Optimizaciones:
- **CloudFront** delante: cachear assets, baja egress del origin
- **VPC Endpoints** para S3, DynamoDB (gratis cuando es Gateway endpoint, evita NAT)
- **Mismas AZ**: cross-AZ cuesta $0.01/GB cada dirección
- **Comprimir** responses (gzip, brotli)
- **Cache** agresivo en clientes y CDN

### 6. Sin Reserved Instances / Savings Plans

Para cargas predecibles 24/7:

| Tipo | Compromiso | Descuento |
|---|---|---|
| Compute Savings Plans | 1 o 3 años | 27% (1yr no upfront) - 66% (3yr all upfront) |
| EC2 Instance Savings Plans | 1 o 3 años | 28% - 72% |
| RDS Reserved Instances | 1 o 3 años | 28% - 65% |
| ElastiCache RI | 1 o 3 años | similar |
| OpenSearch RI | 1 o 3 años | similar |
| DynamoDB Reserved Capacity | 1 o 3 años | 50%+ |

**Reglas**:
- Solo si la carga es predecible
- Empezar con 1-year, no-upfront (menos riesgo)
- Compute Savings Plans son más flexibles que RIs específicos
- No comprar Savings Plans antes de tener al menos 3 meses de baseline

### 7. Logs costosos

**CloudWatch Logs**:
- Ingestion: $0.50/GB
- Storage: $0.03/GB-mes
- Insights queries: $0.005/GB scanned

Optimizaciones:
- **Retention** corta (7-14 días para apps, más para audit)
- **No loguear payloads** completos (DEBUG)
- **Sampling** en logs verbosos
- **Mover audit logs a S3** (mucho más barato, $0.023/GB-mes)
- **Comprimir** logs

## Estrategias de optimización por escala

### Pequeño (<$100/mes)

Prioridades:
1. **Tagging y visibility**: saber dónde se va el gasto
2. **Apagar dev/staging fuera de horario** (Lambda + EventBridge para auto-stop)
3. **Free tier**: usarlo el primer año
4. **Cleanup mensual**: borrar recursos huérfanos
5. **Lifecycle policies** en S3

### Mediano ($100-$1000/mes)

Suma de las anteriores +:
1. **Compute Optimizer** revisado mensualmente
2. **Compute Savings Plans** (1-year no-upfront para baseline conocido)
3. **gp2 → gp3** en EBS
4. **Cost Anomaly Detection** habilitado
5. **CloudFront** para reducir egress
6. **VPC Endpoints** si usas servicios AWS desde subnets privadas

### Grande ($1000+/mes)

Todo lo anterior +:
1. **FinOps team** o persona dedicada
2. **3-year Savings Plans** para baseline muy estable (mayor descuento)
3. **Spot** para batch y stateless workloads
4. **Graviton** (ARM) migration: -20-40% sin perder performance
5. **Auto-scaling** agresivo en horarios bajos
6. **Tagging policies** enforced
7. **Showback/chargeback** por equipo/proyecto
8. **AWS Enterprise Support** + TAM
9. **Cost allocation tags** activados

## Monitoring de costos

### Setup inicial

1. **Habilitar Cost Explorer** (gratis, hay que activarlo)
2. **Habilitar Cost Anomaly Detection** (gratis)
3. **Crear AWS Budget** con alertas:
   ```
   - Budget mensual: $X
   - Alerta a 50%, 80%, 100%, 120% del budget
   - Email + SNS topic para Slack/PagerDuty
   ```
4. **Cost Allocation Tags** activados (`Environment`, `Project`, `CostCenter`)

### Dashboards útiles

- Top 10 servicios por costo
- Costo por environment (dev vs prod)
- Costo por proyecto (vía tags)
- Trending (mes vs mes anterior)
- Forecast del mes

### Revisión periódica recomendada

**Mensual**:
- [ ] Revisar Cost Explorer top servicios
- [ ] Identificar incrementos > 10% vs mes anterior
- [ ] Revisar Compute Optimizer recommendations
- [ ] Revisar AWS Trusted Advisor (cost section)

**Trimestral**:
- [ ] Right-sizing review completo
- [ ] Revisar Reservas/Savings Plans (renewals, gaps)
- [ ] Cleanup de recursos huérfanos
- [ ] Revisar Storage Classes en S3
- [ ] Revisar Logs retention

## Herramientas de FinOps

### Nativas AWS

- **Cost Explorer**: análisis básico (gratis)
- **AWS Budgets**: alertas y forecasts
- **Cost Anomaly Detection**: ML detecta gastos atípicos
- **AWS Trusted Advisor**: recomendaciones (cost section gratis)
- **Compute Optimizer**: right-sizing
- **Savings Plans / RI recommendations**

### Third-party (cuando creces)

- **CloudHealth (VMware)**
- **Cloudability (Apptio)**
- **Vantage**: moderna, simple
- **CloudZero**: enfocada en unit economics
- **Spot.io**: optimización automática (Spot, RIs, auto-scaling)
- **Kubecost**: si usas Kubernetes

## Decisiones de arquitectura con impacto en costo

| Decisión | Impacto |
|---|---|
| **Lambda vs ECS Fargate vs EC2** | Lambda mejor para bajos volúmenes; Fargate para constante; EC2 con RI/Spot para predecible |
| **Aurora vs RDS** | Aurora 20% más caro pero mejor performance/disponibilidad |
| **Aurora Serverless v2** | Bueno para carga variable; caro si carga constante |
| **DynamoDB On-Demand vs Provisioned** | On-Demand: 7x más caro pero sin gestión. Provisioned con auto-scaling más barato |
| **CloudFront para todo** | Reduce egress significativamente |
| **Multi-AZ vs Single-AZ** | Multi-AZ 2x el costo de DB; necesario para prod, opcional para dev |
| **Encryption KMS vs S3-managed** | KMS cobra por uso ($0.03/10k requests). S3-managed gratis |
| **Logs en CloudWatch vs S3** | S3 mucho más barato; usar CloudWatch para queries recientes y archivar a S3 |

## Anti-patterns de FinOps

- ❌ Olvidar destruir recursos de tutorial/aprendizaje
- ❌ Crear EC2 t2.xlarge "por si acaso"
- ❌ Logs forever sin retention
- ❌ Snapshots backups eternos
- ❌ Múltiples NAT Gateways (uno por AZ es lo usual; revisar si es necesario)
- ❌ EBS gp2 (gp3 es 20% más barato + mejor perf)
- ❌ Comprar RI/SP sin baseline conocido
- ❌ Auto-scaling sin máximo (puede generar facturas enormes en ataques o bugs)
- ❌ Lambda con `Memory: 10240MB` "porque sí" (paga por GB-second)
- ❌ Multi-region prematuro (2-3x el costo)
- ❌ Kubernetes para apps simples (overhead operativo + de costos)
- ❌ No usar free tier los primeros 12 meses

## Cómo presentar costos al usuario

Cuando propongas arquitectura o IaC, incluir siempre:

```markdown
## Costo estimado mensual

| Recurso | Cantidad | Costo unitario | Total |
|---|---|---|---|
| Fargate task (0.5 vCPU, 1GB) | 1 × 730h | $0.025/h | $18.25 |
| RDS db.t3.micro | 1 × 730h | $0.018/h | $13.14 |
| S3 storage | 10 GB | $0.023/GB | $0.23 |
| CloudFront transfer | 50 GB | ~$0.085/GB | $4.25 |
| Data transfer out | 20 GB | $0.09/GB | $1.80 |
| **TOTAL** | | | **~$38/mes** |

⚠️ Supuestos: tráfico moderado, una región (us-east-2). Costos pueden variar.
✅ Con free tier nuevo: primer año ~$15/mes.

💡 Para reducir aún más: usar S3+CloudFront sin ALB ahorra ~$20/mes pero pierdes load balancing.
```

Siempre transparente sobre supuestos y trade-offs.
