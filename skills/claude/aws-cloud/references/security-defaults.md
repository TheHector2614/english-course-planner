# Seguridad AWS — Defaults Seguros

Complemento de la skill `web-backend-security`, aquí específicamente para AWS.

## Setup inicial de una cuenta nueva

Hacer en este orden:

### 1. Proteger root account
- [ ] **MFA hardware key** en root (YubiKey ideal) o app TOTP
- [ ] Email del root con MFA propio + recovery alternativo
- [ ] **Guardar credenciales root offline** (gestor de passwords)
- [ ] **Nunca usar root** para operaciones diarias

### 2. Configurar billing
- [ ] **AWS Budgets** con alertas a 50%, 80%, 100% del budget
- [ ] **Cost Anomaly Detection** habilitado
- [ ] Habilitar acceso a billing para usuarios IAM

### 3. Crear estructura de IAM
- [ ] **Usuario IAM admin** con MFA (para uso diario)
- [ ] **Password policy** robusta (min 14 chars, complejidad, no reuse)
- [ ] Si vas a Organizations: setup IAM Identity Center

### 4. Habilitar audit y security
- [ ] **CloudTrail** en TODAS las regiones, multi-region trail
- [ ] CloudTrail logs en bucket S3 con:
  - Encryption habilitada
  - Object Lock (immutable)
  - Bucket en cuenta separada idealmente
  - MFA Delete
- [ ] **AWS Config** habilitado
- [ ] **GuardDuty** habilitado (primeros 30 días gratis)
- [ ] **IAM Access Analyzer** habilitado
- [ ] **Trusted Advisor** revisado (algunos checks gratis)

### 5. Configurar región y defaults
- [ ] Decidir región principal
- [ ] **S3 Block Public Access** a nivel cuenta
- [ ] **EBS encryption by default** habilitado por región
- [ ] **VPC Default** evaluar: usarla o eliminarla intencionalmente

## IAM: Least Privilege

### Principios

1. **Roles, no users**, para servicios y aplicaciones
2. **Permisos mínimos** necesarios
3. **Permisos temporales** (AssumeRole con duración corta)
4. **MFA obligatorio** para acceso humano
5. **Reviews periódicas** de permisos

### ❌ Patrones inseguros

```json
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}
```

```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```

### ✅ Patrones seguros

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::mi-app-prod-uploads/*"
}
```

Con condiciones:
```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::mi-app/*",
  "Condition": {
    "StringEquals": {
      "aws:PrincipalTag/Department": "Engineering"
    },
    "IpAddress": {
      "aws:SourceIp": ["203.0.113.0/24"]
    }
  }
}
```

### Service Roles (para aplicaciones)

App Spring Boot en ECS Fargate accediendo a S3:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::mi-app-uploads/*"
    },
    {
      "Sid": "WriteUploads",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::mi-app-uploads/uploads/*"
    },
    {
      "Sid": "GetSecrets",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:us-east-2:*:secret:prod/mi-app/*"
    }
  ]
}
```

### Trust Policy (quién puede asumir el rol)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "123456789012"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:ecs:us-east-2:123456789012:*"
        }
      }
    }
  ]
}
```

Las conditions previenen "confused deputy" attacks.

## Encriptación

### En reposo (at-rest)

**S3**:
```bash
aws s3api put-bucket-encryption \
  --bucket mi-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'
```

Para datos sensibles, usar KMS Customer-Managed Key:
```bash
"SSEAlgorithm": "aws:kms",
"KMSMasterKeyID": "arn:aws:kms:..."
```

**EBS**: habilitar encriptación por default en cada región
```bash
aws ec2 enable-ebs-encryption-by-default --region us-east-2
```

**RDS**: encriptación al crear el cluster/instance (no se puede agregar después)
```bash
aws rds create-db-instance \
  ...
  --storage-encrypted \
  --kms-key-id alias/aws/rds
```

**DynamoDB**: encriptación por default (no se puede deshabilitar). Opcionalmente CMK.

### En tránsito (in-transit)

- **API Gateway**: TLS 1.2 mínimo, forzar HTTPS
- **ALB/NLB**: listeners en 443 con cert ACM
- **CloudFront**: viewer protocol policy `redirect-to-https`
- **VPC interno**: TLS aunque sea entre servicios privados
- **RDS**: forzar SSL con parameter group
- **mTLS** entre microservicios sensibles

## Secrets Management

### Reglas

- ❌ **NUNCA** en código, variables de entorno hardcoded, archivos commiteados
- ✅ **Secrets Manager** para credenciales (rotación automática)
- ✅ **Parameter Store** para configuración no-secreta o secrets menos sensibles
- ✅ **KMS** para encriptar manualmente datos sensibles
- ✅ **Roles IAM** para servicios (sin keys explícitas)

### Secrets Manager

```bash
# Crear secret
aws secretsmanager create-secret \
  --name prod/mi-app/db-credentials \
  --description "DB credentials para mi-app prod" \
  --secret-string '{"username":"admin","password":"..."}'

# Leer en app (vía SDK)
# Java: SecretsManagerClient.getSecretValue()
```

Rotación automática para RDS:
```bash
aws secretsmanager rotate-secret \
  --secret-id prod/mi-app/db-credentials \
  --rotation-lambda-arn arn:aws:lambda:... \
  --rotation-rules AutomaticallyAfterDays=30
```

**Costo**: $0.40/secret/mes + $0.05 por 10k API calls. Caro si tienes muchos.

### Parameter Store

Más barato (gratis para Standard, $0.05/parameter/mes para Advanced).

```bash
# Crear parameter (no-secreto)
aws ssm put-parameter \
  --name /prod/mi-app/api-url \
  --value "https://api.example.com" \
  --type String

# Crear parameter (secreto, encriptado con KMS)
aws ssm put-parameter \
  --name /prod/mi-app/jwt-secret \
  --value "..." \
  --type SecureString
```

**Cuándo cada uno**:
- **Parameter Store**: configs simples, secrets menos críticos, presupuesto chico
- **Secrets Manager**: DB credentials con rotación automática, secrets críticos

## VPC: Networking seguro

### Estructura recomendada

```
VPC (10.0.0.0/16)
├── Public subnets (1 por AZ)
│   ├── 10.0.1.0/24 (us-east-2a)
│   ├── 10.0.2.0/24 (us-east-2b)
│   └── 10.0.3.0/24 (us-east-2c)
│       ↓ Internet Gateway
└── Private subnets (1 por AZ)
    ├── 10.0.11.0/24 (us-east-2a)
    ├── 10.0.12.0/24 (us-east-2b)
    └── 10.0.13.0/24 (us-east-2c)
        ↓ NAT Gateway (en public subnet)
```

**En public subnets**: ALB, NAT Gateway, bastion hosts
**En private subnets**: ECS tasks, RDS, Lambda con VPC, EC2 backends

### Security Groups

Default deny (deny implícito por defecto).

```hcl
# Terraform — Security Group para ALB
resource "aws_security_group" "alb" {
  name        = "alb-sg"
  description = "ALB security group"
  vpc_id      = aws_vpc.main.id

  # Inbound: HTTPS desde internet
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound: HTTP redirect a HTTPS
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound: cualquier puerto (default)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group para apps (Fargate tasks)
resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  # Solo desde el ALB
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound: necesario para llamar a otros servicios
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group para RDS
resource "aws_security_group" "db" {
  name   = "db-sg"
  vpc_id = aws_vpc.main.id

  # Solo desde apps
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}
```

### ⚠️ Reglas críticas Security Groups

- ❌ **NUNCA** `0.0.0.0/0` en puertos SSH (22), RDP (3389), DB (3306, 5432, etc.)
- ❌ **NUNCA** `0.0.0.0/0` en puertos de admin
- ✅ SSH solo desde bastion o VPN
- ✅ DB solo desde app SGs (no IPs)
- ✅ Outbound restringido si compliance lo exige (default permite todo)

### Network ACLs (NACL)

Stateless, a nivel de subnet. Defense in depth opcional.

Usar para:
- Bloquear IPs maliciosas a nivel de subnet
- Compliance que exige doble capa de filtrado

No es reemplazo de Security Groups; complemento.

### VPC Endpoints

Acceso privado a servicios AWS sin pasar por internet ni NAT:

```hcl
# S3 - Gateway endpoint (GRATIS)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-2.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id
}

# DynamoDB - Gateway endpoint (GRATIS)
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-2.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id
}

# ECR - Interface endpoint (~$7/mes por endpoint × AZ)
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-2.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}
```

**Beneficio**: evita data transfer cross-region/internet a través de NAT Gateway. Para apps en private subnets es importante.

### VPC Flow Logs

```hcl
resource "aws_flow_log" "vpc" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}
```

Útil para auditoría y debug de problemas de conectividad.

## Servicios AWS específicos: hardening

### S3

```hcl
resource "aws_s3_bucket" "uploads" {
  bucket = "mi-app-uploads-${data.aws_caller_identity.current.account_id}"
}

# Bloquear acceso público
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning
resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle: borrar versiones viejas
resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Bucket policy: solo HTTPS
resource "aws_s3_bucket_policy" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureConnections"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource  = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}
```

### RDS

- [ ] **Encryption at-rest** habilitada (no se puede después)
- [ ] **Subnets privadas** (no public_accessible)
- [ ] **Multi-AZ** para producción
- [ ] **Backups automáticos** (al menos 7 días)
- [ ] **Force SSL** (parameter group)
- [ ] **Slow query logging** habilitado
- [ ] **Performance Insights** habilitado
- [ ] **Master password** en Secrets Manager con rotación
- [ ] **Deletion protection** en producción
- [ ] **IAM database authentication** si aplicable

### Lambda

- [ ] **Execution role** con least privilege
- [ ] **Environment variables** sin secrets (usar Secrets Manager)
- [ ] **VPC config** solo si necesario (cold starts más lentos)
- [ ] **Timeout** apropiado (no infinito)
- [ ] **Memory** ajustado (no over-provision)
- [ ] **Dead Letter Queue** o destinations para fallos
- [ ] **Logs retention** configurada
- [ ] **Tracing X-Ray** habilitado
- [ ] **Code signing** para compliance (opcional)

### CloudFront

- [ ] **Origin Access Control (OAC)** para S3 origins (no acceso directo a bucket)
- [ ] **Viewer protocol policy**: redirect-to-https
- [ ] **TLS 1.2+** mínimo
- [ ] **AWS WAF** asociado en endpoints expuestos
- [ ] **Response headers policy** con security headers (HSTS, CSP, etc.)
- [ ] **Geo restriction** si aplica
- [ ] **Logging** habilitado a S3

## Detección y respuesta

### Habilitar siempre

```bash
# CloudTrail (audit logs)
aws cloudtrail create-trail \
  --name organization-trail \
  --s3-bucket-name mi-cloudtrail-logs \
  --is-multi-region-trail \
  --enable-log-file-validation

# GuardDuty (threat detection)
aws guardduty create-detector --enable

# Config (compliance)
aws configservice put-configuration-recorder \
  --configuration-recorder name=default,roleARN=...

# Security Hub (agregador)
aws securityhub enable-security-hub \
  --enable-default-standards
```

### Alarms críticos en CloudWatch

```hcl
# Root account login
resource "aws_cloudwatch_metric_alarm" "root_login" {
  alarm_name          = "RootAccountLogin"
  metric_name         = "RootAccountUsage"
  namespace           = "Security"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1
  evaluation_periods  = 1
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# Unauthorized API calls
# IAM policy changes
# Security Group changes
# CloudTrail config changes
```

Hay templates de CloudWatch alarms para CIS Benchmark — usarlos.

## Checklist consolidado de seguridad AWS

### Account-level
- [ ] MFA en root
- [ ] CloudTrail multi-region
- [ ] GuardDuty habilitado
- [ ] Security Hub habilitado
- [ ] Config habilitado
- [ ] IAM Access Analyzer habilitado
- [ ] Password policy robusto
- [ ] S3 Block Public Access a nivel cuenta
- [ ] EBS encryption by default
- [ ] Billing alerts configurados

### IAM
- [ ] Roles para servicios, no users
- [ ] Least privilege en políticas
- [ ] No `*` en Action/Resource sin justificación
- [ ] MFA obligatorio para usuarios humanos
- [ ] Reviews periódicas de permisos
- [ ] Access keys rotadas o eliminadas si no se usan
- [ ] IAM Identity Center si hay equipo

### Networking
- [ ] VPC con subnets públicas/privadas
- [ ] Security Groups con least privilege
- [ ] No 0.0.0.0/0 en SSH/DB/admin ports
- [ ] VPC Flow Logs habilitados
- [ ] VPC Endpoints para servicios AWS

### Data
- [ ] Encryption at-rest en S3, EBS, RDS, DynamoDB
- [ ] TLS en endpoints
- [ ] Secrets en Secrets Manager o Parameter Store
- [ ] S3 buckets con block public access
- [ ] Backup automatizado
- [ ] Lifecycle policies

### Monitoring
- [ ] CloudWatch Logs en todos los servicios
- [ ] Alarms en eventos críticos (root login, IAM changes, etc.)
- [ ] Notificaciones a SNS/Slack/PagerDuty
- [ ] CloudTrail logs immutable (Object Lock)
