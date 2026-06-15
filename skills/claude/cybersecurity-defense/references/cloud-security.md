# Cloud Security

AWS/GCP/Azure defensivo. CSPM, IAM, detección, configuración segura. Complementa `aws-cloud` con foco en defensa.

**Nota**: la skill `aws-cloud` cubre infra AWS general y security-defaults. Este doc se enfoca en defensa multi-cloud, detección y respuesta. Cuando trabajes solo en AWS, combinar ambos.

## Principio: el modelo de responsabilidad compartida

El proveedor asegura la nube (hardware, hipervisor). **Vos asegurás lo que ponés en la nube** (configuración, datos, accesos, código). La mayoría de breaches cloud son por misconfiguración del cliente, no del proveedor.

## Misconfiguraciones: el riesgo #1

Causas comunes de breaches cloud:
- Buckets/storage públicos por error
- Credenciales/keys expuestas
- Security groups demasiado abiertos (0.0.0.0/0)
- IAM con permisos excesivos
- Logging deshabilitado
- Sin MFA en cuentas privilegiadas
- Snapshots/backups públicos

## CSPM (Cloud Security Posture Management)

Detectar misconfiguraciones automáticamente.

### Tools

```bash
# Prowler (AWS, Azure, GCP — open source)
prowler aws --compliance cis_2.0_aws
prowler aws  # todos los checks
prowler azure
prowler gcp

# Scout Suite (multi-cloud, open source)
scout aws
scout gcp
scout azure

# Steampipe (consultar cloud con SQL)
steampipe query "select name, acl from aws_s3_bucket where acl = 'public-read'"
```

### Comerciales

Wiz, Orca, Prisma Cloud, Lacework, AWS Security Hub, Microsoft Defender for Cloud.

### Qué detectan

- Recursos públicos
- IAM excesivo
- Encryption faltante
- Logging deshabilitado
- Configuraciones contra CIS Benchmarks
- Drift de configuración

## IAM (la base del control cloud)

### Least privilege

Ver `identity-access.md` para principios. Específico de cloud:

```json
// AWS: política específica, no wildcards
// ❌ MAL
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// ✅ BIEN
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::mi-bucket/data/*",
  "Condition": {
    "StringEquals": { "aws:PrincipalTag/team": "data" }
  }
}
```

### Roles, no usuarios con keys

```
❌ Usuario IAM con access keys de larga vida
✅ Roles asumidos temporalmente (STS)
✅ Workload identity (IRSA en EKS, Workload Identity en GKE)
✅ OIDC para CI/CD (ver secrets-protection.md)
```

### Detección de IAM riesgoso

```bash
# AWS IAM Access Analyzer: detecta acceso externo no intencionado
aws accessanalyzer list-findings

# Detectar políticas con privilegios excesivos
# Tools: PMapper, Cloudsplaining
cloudsplaining scan --file account-authorization-details.json
```

### Permisos peligrosos a vigilar

- `iam:PassRole` + `iam:CreateRole` (escalada de privilegios)
- `iam:*` (admin de IAM)
- `*:*` (admin total)
- `sts:AssumeRole` amplio
- Permisos de modificar logging/CloudTrail (anti-forense)

## Configuración segura por servicio

### Storage (S3/GCS/Blob)

```bash
# AWS S3: bloquear acceso público (cuenta-wide)
aws s3control put-public-access-block \
  --account-id 123456789012 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Encryption por default
aws s3api put-bucket-encryption --bucket mi-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}}]
  }'

# Versioning (anti-ransomware, ver backups-ransomware.md)
aws s3api put-bucket-versioning --bucket mi-bucket \
  --versioning-configuration Status=Enabled
```

- Bloquear acceso público (salvo necesidad explícita)
- Encryption at rest (SSE-KMS)
- Versioning + Object Lock (inmutabilidad)
- Access logging
- TLS only (bucket policy con `aws:SecureTransport`)

### Compute (EC2/VMs)

- IMDSv2 obligatorio (AWS — previene SSRF a metadata)
- Sin IPs públicas salvo necesidad
- Security groups restrictivos (ver `network-defense.md`)
- Disk encryption
- Patch management (ver `endpoint-hardening.md`)

```bash
# AWS: forzar IMDSv2 (previene robo de credenciales vía SSRF)
aws ec2 modify-instance-metadata-options \
  --instance-id i-xxx \
  --http-tokens required \
  --http-endpoint enabled
```

### Bases de datos (RDS/Cloud SQL)

Ver `databases` skill. Cloud-specific:
- No acceso público
- Encryption at rest + in transit
- Backups automáticos cifrados
- En subnet privada
- IAM authentication donde sea posible

### Networking

Ver `network-defense.md`:
- VPC con subnets privadas/públicas
- Security groups default-deny
- VPC endpoints (no salir a internet para servicios cloud)
- Flow logs habilitados
- WAF en apps públicas

## Logging y auditoría cloud

**Crítico**: sin logs no hay detección ni forense.

### AWS

```bash
# CloudTrail: TODOS los API calls (habilitar en todas las regiones)
aws cloudtrail create-trail --name org-trail \
  --s3-bucket-name audit-logs \
  --is-multi-region-trail \
  --enable-log-file-validation   # detección de tampering

aws cloudtrail start-logging --name org-trail
```

- **CloudTrail**: API calls (multi-region, log validation)
- **VPC Flow Logs**: tráfico de red
- **S3 access logs**, **ELB logs**, **CloudFront logs**
- **Config**: cambios de configuración + compliance rules

### GCP

- **Cloud Audit Logs** (Admin Activity, Data Access)
- **VPC Flow Logs**
- **Cloud Logging**

### Azure

- **Activity Log**
- **Azure Monitor / Log Analytics**
- **NSG Flow Logs**

### Protección de logs

- Logs a cuenta/proyecto separado (atacante no los borra)
- Inmutabilidad (Object Lock en el bucket de logs)
- Log file validation (detectar tampering)
- Alertas si se deshabilita logging (señal de ataque)

## Detección en cloud

Ver `detection-monitoring.md`. Cloud-native:

### AWS

```
- GuardDuty: detección gestionada (anomalías, malware, C2, exfiltración,
  credenciales comprometidas, cryptomining)
- Security Hub: agregación de findings + compliance
- Detective: investigación de findings
- Macie: descubrimiento de datos sensibles
- IAM Access Analyzer: acceso externo no intencionado
```

```bash
# Habilitar GuardDuty
aws guardduty create-detector --enable
```

### GCP

- Security Command Center
- Event Threat Detection
- Chronicle (SIEM)

### Azure

- Microsoft Defender for Cloud
- Microsoft Sentinel (SIEM)

### Findings críticos a alertar

- Acceso desde IPs/ubicaciones anómalas
- Uso de credenciales root/admin
- Deshabilitación de logging/seguridad
- Creación de recursos anómalos (cryptomining)
- Exfiltración (S3 reads masivos, snapshots compartidos)
- IAM changes sospechosos
- Cuentas/keys nuevas

## Protección de la cuenta raíz / management

### AWS

- **Root account**: MFA hardware, sin access keys, usar solo para emergencias
- **AWS Organizations**: SCPs (Service Control Policies) para guardrails
- **Cuentas separadas**: prod, dev, security, logging (blast radius)

```json
// SCP: prevenir deshabilitar CloudTrail/GuardDuty en toda la org
{
  "Effect": "Deny",
  "Action": [
    "cloudtrail:StopLogging",
    "cloudtrail:DeleteTrail",
    "guardduty:DeleteDetector"
  ],
  "Resource": "*"
}
```

### Multi-account / multi-project

Separar por blast radius:
- Cuenta de seguridad (logs centralizados, read-only)
- Cuenta de producción
- Cuenta de desarrollo
- Cuenta de management

Ver `aws-cloud` skill para account strategy.

## Guardrails preventivos

### AWS SCPs

Límites que ni los admins de cuenta pueden cruzar:
- Denegar regiones no usadas
- Prevenir deshabilitar seguridad
- Forzar encryption
- Prevenir recursos públicos

### Policy as Code

```bash
# OPA / Conftest para validar IaC antes de desplegar
conftest test main.tf

# Checkov (escanea Terraform/CloudFormation/k8s)
checkov -d .

# tfsec
tfsec .

# Detecta misconfiguraciones ANTES de desplegar
```

Integrar en CI: bloquear deploy si IaC tiene misconfiguraciones.

## Cloud-specific exfiltration

Ver `data-exfiltration-prevention.md`. Cloud:
- Snapshots/AMIs compartidos cross-account
- S3 buckets públicos o cross-account
- RDS snapshots públicos
- Data egress a destinos no aprobados

```
# Detectar (GuardDuty + CloudTrail)
- Exfiltration:S3/ObjectRead.Unusual
- Snapshot compartido con cuenta externa
- ModifyImageAttribute / ModifySnapshotAttribute (hacer público)
```

## Inmutabilidad y backups

Ver `backups-ransomware.md`:
- S3 Object Lock (WORM)
- Cross-region/cross-account backups
- Versioning
- Backups inmutables

## Container/serverless en cloud

- Contenedores: ver `container-k8s-security.md`
- Lambda/Functions: least privilege, no secrets en código, dependency scanning
- Managed k8s (EKS/GKE/AKS): workload identity, ver container doc

## Checklist cloud security

### IAM
- [ ] Root account: MFA hardware, sin keys, solo emergencias
- [ ] Least privilege (sin wildcards amplios)
- [ ] Roles/STS en vez de keys de larga vida
- [ ] Workload identity / OIDC (no keys estáticas)
- [ ] MFA en todas las cuentas privilegiadas
- [ ] IAM Access Analyzer activo
- [ ] Detección de permisos excesivos (Cloudsplaining/PMapper)

### Configuración
- [ ] CSPM activo (Prowler/Scout/comercial)
- [ ] CIS Benchmark cloud aplicado
- [ ] Storage público bloqueado (account-wide)
- [ ] Encryption at rest por default
- [ ] IMDSv2 obligatorio (AWS)
- [ ] Security groups default-deny
- [ ] VPC endpoints (no salir a internet)
- [ ] Policy as Code en CI (Checkov/tfsec)

### Logging
- [ ] CloudTrail/Audit Logs multi-region
- [ ] Log file validation (anti-tampering)
- [ ] VPC Flow Logs
- [ ] Logs en cuenta separada
- [ ] Logs inmutables (Object Lock)
- [ ] Alertas si se deshabilita logging

### Detección
- [ ] GuardDuty/Defender/SCC activo
- [ ] Security Hub/equivalente
- [ ] Macie/data discovery (datos sensibles)
- [ ] Alertas de findings críticos
- [ ] Detección de exfiltración

### Gobierno
- [ ] Multi-account/project (blast radius)
- [ ] SCPs/guardrails preventivos
- [ ] Cuenta de seguridad separada
- [ ] Backups inmutables (ver backups-ransomware.md)
