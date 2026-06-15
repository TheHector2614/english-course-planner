# AWS Well-Architected Framework

Framework de AWS para evaluar arquitecturas. 6 pilares. Aplicar como checklist en auditorías.

## Los 6 pilares

1. **Operational Excellence** — ejecutar y monitorear sistemas, mejora continua
2. **Security** — proteger datos, sistemas, usuarios
3. **Reliability** — recovery, escalado, manejo de fallas
4. **Performance Efficiency** — usar recursos eficientemente
5. **Cost Optimization** — costo más bajo posible
6. **Sustainability** — minimizar impacto ambiental

## Pilar 1: Operational Excellence

### Principios
- Operations as code (IaC, configs versionadas)
- Iteraciones frecuentes y reversibles
- Refinar procedimientos con frecuencia
- Anticipar fallos
- Aprender de fallos

### Checks

**Infraestructura**
- [ ] Toda la infra está en IaC (Terraform/CDK/CloudFormation)
- [ ] Code en repo Git con branch protection
- [ ] Cambios pasan por PR + code review
- [ ] CI/CD para deploys (no deploy manual a prod)
- [ ] Diferencias entre IaC y realidad (drift) detectadas

**Observabilidad**
- [ ] CloudWatch Logs habilitado en todos los servicios
- [ ] Retention configurada (no infinita)
- [ ] Métricas custom para KPIs de negocio
- [ ] Dashboards de operación
- [ ] Alarmas en métricas críticas
- [ ] Distributed tracing (X-Ray) si hay microservicios
- [ ] Correlation IDs en logs

**Procesos**
- [ ] Runbooks documentados para incidentes comunes
- [ ] Plan de incident response (ver `web-backend-security`)
- [ ] Postmortems después de incidentes
- [ ] Game days / chaos engineering

**Tagging**
- [ ] Tags consistentes en todos los recursos (`Environment`, `Project`, `Owner`)
- [ ] Tag policy enforced (con AWS Organizations)

## Pilar 2: Security

(Solapamiento con la skill `web-backend-security`. Aquí los puntos AWS-específicos.)

### Identity & Access Management

- [ ] **MFA en root account** (hardware key idealmente)
- [ ] **No usar root** para operaciones diarias
- [ ] **IAM Identity Center** (no IAM users individuales) para acceso humano
- [ ] **Roles, no users**, para servicios y aplicaciones
- [ ] **Least privilege**: políticas mínimas. NO `*` en Action ni Resource
- [ ] **Access Analyzer** habilitado (detecta accesos cross-account no intencionados)
- [ ] **Password policy** robusto (longitud, complejidad, rotación)
- [ ] **Reviews periódicas** de IAM (cuentas inactivas, permisos)
- [ ] **CloudTrail** en todas las regiones, immutable (Object Lock en bucket)

### Encriptación

- [ ] **At-rest**: S3, EBS, RDS, DynamoDB, EFS con encriptación habilitada
- [ ] **In-transit**: TLS 1.2+ en todo, HTTPS en endpoints públicos
- [ ] **KMS Customer-Managed Keys** (CMK) para datos sensibles (no solo AWS-managed)
- [ ] **Rotación de keys** habilitada
- [ ] **No claves de larga vida**: usar IAM roles y temporary credentials

### Network Security

- [ ] **VPC con subnets públicas y privadas** correctamente
- [ ] **Security Groups con least privilege**: solo puertos necesarios
- [ ] **NO Security Groups con `0.0.0.0/0`** en puertos no-HTTP/HTTPS
- [ ] **Network ACLs** para defense in depth (opcional)
- [ ] **VPC Flow Logs** habilitados
- [ ] **AWS WAF** delante de apps web públicas
- [ ] **AWS Shield** (Standard gratis, Advanced opcional)
- [ ] **VPC Endpoints** para servicios AWS (no salir a internet)
- [ ] **PrivateLink** para comunicación con otros VPCs

### Data Protection

- [ ] **Secrets Manager** o **Parameter Store** para secrets (NO en env vars hardcoded)
- [ ] **Rotación automática** de DB credentials
- [ ] **S3 Block Public Access** a nivel cuenta
- [ ] **S3 Bucket versioning** para datos críticos
- [ ] **S3 MFA Delete** para buckets sensibles
- [ ] **Backups encriptados**

### Detection & Response

- [ ] **CloudTrail** habilitado
- [ ] **GuardDuty** habilitado (anomaly detection)
- [ ] **Security Hub** para consolidar findings
- [ ] **AWS Config** para tracking de cambios y compliance
- [ ] **Macie** si manejas mucha PII en S3
- [ ] **Inspector** para vulnerabilities en EC2/Lambda/ECR
- [ ] **Alertas configuradas** para findings críticos

## Pilar 3: Reliability

### Principios
- Recovery automático (no manual)
- Test de procedimientos de recovery
- Escalar horizontalmente
- Capacidad no es asunción

### Checks

**Disponibilidad**
- [ ] **Multi-AZ** para recursos críticos (RDS, ElastiCache)
- [ ] **Auto Scaling** configurado (ECS, Lambda, EC2)
- [ ] **Load Balancer health checks** correctos
- [ ] **No single points of failure** identificados
- [ ] **Connection pooling** en aplicaciones (no agotar conexiones DB)

**Recovery**
- [ ] **Backups automáticos** habilitados (RDS, EBS snapshots)
- [ ] **Retention** apropiado para backups
- [ ] **Cross-region backups** para DR si crítico
- [ ] **RTO/RPO** definidos y testeados
- [ ] **Restore testing** periódico (un backup no probado = no es backup)
- [ ] **Point-in-time recovery** para RDS

**Resilience**
- [ ] **Retry logic** con exponential backoff en clientes
- [ ] **Circuit breakers** para llamadas a servicios externos
- [ ] **Timeouts** apropiados (no infinitos)
- [ ] **Dead letter queues** en SQS/SNS/Lambda
- [ ] **Idempotency** en operaciones que pueden re-ejecutarse

**Limits & Quotas**
- [ ] **Service quotas** conocidas y monitoreadas
- [ ] **Aumentos** solicitados antes de necesitar (Lambda concurrency, EBS volumes, etc.)
- [ ] **Throttling** manejado en código cliente

## Pilar 4: Performance Efficiency

### Principios
- Democratizar tech avanzada (usar managed services)
- Ir global en minutos
- Arquitecturas serverless
- Experimentar más a menudo
- Mechanical sympathy (entender los recursos)

### Checks

**Compute**
- [ ] **Right-sizing**: instancias del tamaño correcto (ni sobrado ni ajustado)
- [ ] **Compute Optimizer** consultado regularmente
- [ ] **Lambda memory** ajustado (más memory = más CPU, a veces más barato)
- [ ] **Graviton (ARM)** considerado (20-40% mejor precio/performance que x86)
- [ ] **Spot instances** para cargas no críticas (50-90% más barato)

**Storage**
- [ ] **S3 Storage Classes** correctas (Standard, IA, Glacier según patrón de acceso)
- [ ] **EBS type apropiado** (gp3 default, io1/io2 solo si necesario)
- [ ] **EBS gp3 vs gp2**: gp3 más barato y mejor performance
- [ ] **S3 Intelligent-Tiering** para datos con patrones desconocidos

**Database**
- [ ] **Read replicas** para lecturas pesadas
- [ ] **Connection pooling** (RDS Proxy para Lambda)
- [ ] **Índices** correctos (queries lentas optimizadas)
- [ ] **Aurora Serverless v2** si carga variable
- [ ] **DynamoDB on-demand vs provisioned** según patrón
- [ ] **ElastiCache** para caching de queries pesadas

**Networking**
- [ ] **CloudFront** para contenido estático y dinámico
- [ ] **Compresión** habilitada (gzip, brotli)
- [ ] **HTTP/2 y HTTP/3** habilitados
- [ ] **Edge locations** aprovechados

## Pilar 5: Cost Optimization

Ver `finops.md` para detalles. Resumen:

- [ ] **Right-sizing** de instancias y storage
- [ ] **Apagar recursos en horarios no productivos** (dev/staging)
- [ ] **Reserved Instances / Savings Plans** para cargas predecibles (>30% ahorro)
- [ ] **Spot** para batch jobs (hasta 90% ahorro)
- [ ] **Lifecycle policies** en S3 (mover a IA/Glacier)
- [ ] **Snapshot lifecycle**: eliminar viejos
- [ ] **Logs retention** apropiada
- [ ] **Unused resources**: EIPs sin uso, volúmenes detached, snapshots huérfanos
- [ ] **Data transfer** monitoreado y optimizado
- [ ] **NAT Gateway** revisado (puede ser muy caro)
- [ ] **Cost Explorer** revisado mensualmente
- [ ] **Budgets** y **anomaly detection** configurados

## Pilar 6: Sustainability

### Principios
- Reducir consumo de recursos
- Compartir recursos
- Anticipar y soportar mejoras upstream

### Checks

- [ ] **Regiones con energía renovable**: us-west-2, eu-west-1, eu-north-1 (Suecia)
- [ ] **Serverless** preferido (mejor utilización vs EC2 idle)
- [ ] **Right-sizing** (no over-provision = menos energía)
- [ ] **Spot** instances (usar capacity sino se desperdicia)
- [ ] **Graviton (ARM)** consume menos energía
- [ ] **Auto-shutdown** de dev/staging fuera de horarios
- [ ] **Storage Classes**: Glacier consume menos que Standard
- [ ] **CloudFront** para evitar trips repetidos al origin

## Proceso de auditoría completa

Cuando el usuario pide auditar su infra:

### Paso 1: Inventory
- AWS Organizations: cuentas presentes
- Regiones en uso: `aws ec2 describe-regions`
- Recursos: AWS Resource Explorer o Tag Editor
- Costos: Cost Explorer top servicios

### Paso 2: Aplicar checks por pillar
Recorrer las listas anteriores. Documentar findings con:
- **Severidad**: Critical / High / Medium / Low / Info
- **Pilar afectado**
- **Recurso afectado**: ARN o ID
- **Recomendación** concreta
- **Esfuerzo estimado** para arreglar

### Paso 3: Priorización

Matriz: severidad x esfuerzo
- **Quick wins**: alta severidad + bajo esfuerzo → primero
- **Estratégicos**: alta severidad + alto esfuerzo → planificar
- **Cosmético**: baja severidad + bajo esfuerzo → cuando haya tiempo
- **Ignorables**: baja severidad + alto esfuerzo → tal vez no

### Paso 4: Plan de acción

Documento con:
- Resumen ejecutivo (qué tan saludable está la infra)
- Findings críticos
- Plan de remediación por sprints
- Ahorro estimado de costos
- Mejoras de seguridad

## Herramientas de AWS para Well-Architected

- **AWS Well-Architected Tool** (gratis): cuestionario guiado, reportes
- **AWS Trusted Advisor**: checks automáticos (algunos gratis, otros con Business support)
- **AWS Compute Optimizer**: right-sizing recommendations
- **AWS Cost Explorer**: análisis de gastos
- **AWS Config**: tracking de configuración y compliance rules
- **AWS Security Hub**: agregador de findings de seguridad
- **AWS GuardDuty**: threat detection
- **AWS Inspector**: vulnerability scanning
- **AWS Trusted Advisor**: best practices automáticas

## Lenses específicos

AWS publica "lenses" para casos de uso específicos:
- **Serverless Lens**
- **SaaS Lens**
- **Machine Learning Lens**
- **Data Analytics Lens**
- **IoT Lens**
- **Streaming Media Lens**
- **Financial Services Lens**
- **HPC Lens**
- **Hybrid Networking Lens**

Aplicar el lens correspondiente a tu workload trae checks adicionales.

## Cuándo no obsesionarte con WAF (Well-Architected Framework)

WAF es una guía, no una religión. Para proyectos pequeños:
- Aplicar **seguridad** completa siempre
- Aplicar **operational excellence** básico (IaC, monitoreo)
- Las otras pillars **gradualmente** según necesidad

Sobre-arquitectar un MVP "porque dice WAF" es anti-WAF también (cost optimization, performance efficiency violan al pagar por cosas que no necesitas).

## Output esperado de una auditoría

```markdown
# Auditoría Well-Architected: <Proyecto>

## Resumen
- Cuentas evaluadas: N
- Regiones: N
- Costo mensual actual: $X
- Hallazgos: N críticos, N altos, N medios

## Findings por pilar

### Security (3 críticos, 5 altos)
- 🔴 [CRITICAL] CloudTrail no habilitado en cuenta `123456789012`
  - Recurso: Cuenta `123456789012`
  - Recomendación: Habilitar CloudTrail multi-region con S3 destination encriptado
  - Esfuerzo: Bajo (1h)
  - Fix: ver `aws-cli` o IaC abajo

### Reliability (2 altos, 3 medios)
- 🟠 [HIGH] RDS sin Multi-AZ en producción
  - Recurso: db-prod-app
  - Recomendación: habilitar Multi-AZ. Costo: +50%
  - Esfuerzo: Bajo (modify-db-instance, downtime mínimo)

...

## Plan recomendado

### Sprint 1 (Quick wins críticos)
- [ ] Habilitar CloudTrail (2h)
- [ ] Habilitar GuardDuty (1h)
- [ ] Bloquear S3 público a nivel cuenta (30min)

### Sprint 2 (Mejoras de Reliability)
- [ ] Multi-AZ en RDS (4h, requiere ventana)
- [ ] Backups cross-region (3h)

### Sprint 3 (Cost Optimization)
- [ ] Right-sizing EC2 según Compute Optimizer ($X ahorro/mes)
- [ ] Lifecycle policies S3 ($Y ahorro/mes)

## Ahorro proyectado: $Z/mes
```
