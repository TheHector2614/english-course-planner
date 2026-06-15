# Networking en AWS

VPC, subnets, ALB/NLB/CloudFront, Route 53, conectividad.

## VPC: el "datacenter virtual"

Cada cuenta AWS tiene **VPCs**. Cada VPC es una red privada con tu propio rango de IPs.

### Estructura básica recomendada

```
VPC 10.0.0.0/16  (65k IPs)
├── Subnet pública 10.0.1.0/24  (AZ-a)  ─┐
├── Subnet pública 10.0.2.0/24  (AZ-b)  ├─► Internet Gateway
├── Subnet pública 10.0.3.0/24  (AZ-c)  ─┘
│
├── Subnet privada 10.0.11.0/24 (AZ-a)  ─┐
├── Subnet privada 10.0.12.0/24 (AZ-b)  ├─► NAT Gateway → IGW
├── Subnet privada 10.0.13.0/24 (AZ-c)  ─┘
│
└── Subnet DB 10.0.21.0/24 (AZ-a)  (sin route a NAT, aislada)
```

### Por qué subnets públicas vs privadas

| | Pública | Privada |
|---|---|---|
| Route default | Internet Gateway | NAT Gateway o nada |
| Public IPs | Sí | No |
| Recibe tráfico internet | Sí (con SG abierto) | No |
| Usa para | ALB, NAT GW, bastion | Apps, DB, batch jobs |

**Regla de oro**: lo único en public subnets debería ser ALB, NAT Gateway, y opcionalmente bastion. Todo lo demás en private.

### CIDR planning

- VPC: `/16` (65k IPs) es suficiente para la mayoría
- Subnet: `/24` (256 IPs, 251 usables) es suficiente para apps típicas
- Subnets más grandes solo si esperas miles de tasks/pods

**Importante**: planificar CIDRs si vas a hacer peering entre VPCs o conexión a on-prem. NO usar CIDRs solapados.

### Internet Gateway (IGW)

Componente sin costo que conecta VPC con internet. Una por VPC.

### NAT Gateway

Permite que recursos en private subnets accedan a internet (sin recibir tráfico entrante).

**Costos**:
- $0.045/hora ≈ $32/mes solo por estar
- $0.045/GB procesado

**Para HA real**: una NAT por AZ. Para empezar (no-prod): una sola NAT en una AZ (más barato pero si esa AZ cae, perdiste internet en subnets privadas).

### NAT Instance (alternativa más barata)

EC2 chica configurada como NAT. ~$3-10/mes vs $32+ del NAT Gateway managed.

**Trade-offs**:
- ✅ Mucho más barato
- ❌ Manual (parches, monitoreo, HA)
- ❌ Bandwidth limitado por tipo de instancia

Usar solo en dev/staging o casos justificados.

### VPC Endpoints

Comunicación privada con servicios AWS sin pasar por internet.

**Tipos**:
- **Gateway endpoints** (S3, DynamoDB): **GRATIS**. Solo configurar.
- **Interface endpoints** (resto): ~$7.30/mes por endpoint × AZ + data transfer.

**Importante para apps en private subnets**:

Sin VPC endpoints, ECS Fargate pulling imagen de ECR sale a internet vía NAT Gateway. Cada pull = data transfer cobrado.

Con VPC endpoints para ECR + S3 + Logs + Secrets Manager:
- Tráfico no sale a NAT
- Más rápido
- Más seguro (no sale a internet)
- Si tienes 4 endpoints × 2 AZs = $58/mes... pero ahorra más en NAT si hay tráfico alto.

### VPC Peering

Conexión 1-a-1 entre dos VPCs. CIDRs no pueden solaparse.

Casos:
- Microservicios en VPCs separadas
- Multi-cuenta con redes compartidas

**Limitaciones**:
- No transitivo (A-B y B-C no implica A-C)
- Mismo o cross-region/account

### Transit Gateway

Hub central para conectar muchas VPCs (y on-prem).

**Cuándo**:
- 3+ VPCs que necesitan comunicarse
- Hybrid cloud (VPN/Direct Connect a datacenter)
- Multi-cuenta con red compartida

**Costo**: ~$36/mes/VPC attachment + data transfer. No barato.

### PrivateLink

Exponer servicio interno (NLB) a otras VPCs/cuentas sin peering.

Mejor que peering para SaaS B2B: cada cliente accede vía PrivateLink sin compartir CIDRs.

## Security Groups vs NACLs

| | Security Groups | NACLs |
|---|---|---|
| Nivel | Recurso (ENI) | Subnet |
| Stateful | ✅ Sí | ❌ No |
| Default | Deny all | Allow all |
| Reglas | Solo allow | Allow y deny |
| Evaluación | Todas las reglas | En orden |

**Usar SGs principalmente.** NACLs solo para:
- Bloquear IPs específicas a nivel subnet
- Compliance que exige doble capa

### Security Groups: patterns

```hcl
# ALB → recibe internet
resource "aws_security_group" "alb" {
  ingress { from_port = 443; to_port = 443; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# App → solo desde ALB
resource "aws_security_group" "app" {
  ingress { from_port = 8080; to_port = 8080; protocol = "tcp"; security_groups = [aws_security_group.alb.id] }
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# DB → solo desde apps
resource "aws_security_group" "db" {
  ingress { from_port = 5432; to_port = 5432; protocol = "tcp"; security_groups = [aws_security_group.app.id] }
}

# Bastion → solo desde IP de oficina
resource "aws_security_group" "bastion" {
  ingress { from_port = 22; to_port = 22; protocol = "tcp"; cidr_blocks = ["203.0.113.0/24"] }
}
```

**Regla**: referenciar **Security Groups, no IPs**. Si la app escala/cambia IP, los SGs siguen funcionando.

## Load Balancers

### ALB (Application Load Balancer)

Layer 7. Para HTTP/HTTPS.

**Funciones**:
- Routing por host header, path, header
- WebSocket support
- HTTP/2, HTTP/3
- Integración con Cognito, OIDC
- WAF integrable

**Costos**:
- $0.0225/hora ≈ $16/mes
- $0.008/LCU-hour (variable según tráfico)

Típico ~$22-30/mes.

### NLB (Network Load Balancer)

Layer 4. Para TCP/UDP.

**Cuándo**:
- Latencia ultra-baja
- Tráfico no-HTTP
- IP estática requerida
- TLS passthrough

**Costos**: $0.0225/hora + LCU.

### CLB (Classic Load Balancer)

Legacy. **NO usar para nuevos proyectos**.

### Application Load Balancer: setup completo

Ver `deploy-java-spring.md`. Esquema:

```hcl
resource "aws_lb" "main" {
  name               = "mi-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true  # prod
  enable_http2               = true
  drop_invalid_header_fields = true  # security
}

# HTTPS listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # TLS 1.3
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# HTTP → HTTPS redirect
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

### Routing por path o host

```hcl
# /api/* → backend API
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern { values = ["/api/*"] }
  }
}

# admin.example.com → backend admin
resource "aws_lb_listener_rule" "admin" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 50

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    host_header { values = ["admin.example.com"] }
  }
}
```

## CloudFront (CDN)

CDN global con edge locations en cientos de ciudades. Cachea contenido cerca del usuario.

### Cuándo usar

- **Siempre** para sitios estáticos (S3 + CF)
- **Recomendado** delante de ALBs públicos:
  - Cache de respuestas estáticas
  - HTTPS unificado
  - WAF integrable
  - Protección DDoS (Shield Standard incluido)
  - Compresión
  - HTTP/3
- Streaming media
- API geo-distribuida

### Ver `deploy-angular.md` para setup completo de CloudFront + S3.

### CloudFront para API (delante de ALB)

```hcl
resource "aws_cloudfront_distribution" "api" {
  enabled = true
  aliases = ["api.example.com"]

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "alb-api"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]

    # No cachear APIs por default
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # Managed-CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"  # Managed-AllViewer
  }

  # GET /static/* sí cachear
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    target_origin_id       = "alb-api"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # CachingOptimized
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cf.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }
}
```

### Price Classes

| Class | Edges incluidos | Costo |
|---|---|---|
| `PriceClass_100` | US, Canadá, Europa | Más barato |
| `PriceClass_200` | + Asia, Sudamérica | Medio |
| `PriceClass_All` | Todos (incluye Australia, etc.) | Más caro |

Para LATAM, considerar `PriceClass_200` si tienes muchos usuarios fuera de NA/Europa.

## Route 53 (DNS)

DNS managed de AWS. 100% uptime SLA.

### Hosted Zones

- **Public**: visible en internet (dominios públicos)
- **Private**: solo visible dentro de VPCs (DNS interno)

### Tipos de records

| Tipo | Uso |
|---|---|
| **A** | IPv4 |
| **AAAA** | IPv6 |
| **CNAME** | Alias a otro hostname |
| **Alias** (AWS) | Como CNAME pero a recursos AWS (gratis, mejor) |
| **MX** | Mail |
| **TXT** | SPF, DMARC, verificaciones |
| **NS** | Name servers |

### Alias vs CNAME

**Siempre usar Alias** para AWS resources:
- CNAME no permite en root (no puedes `CNAME example.com → ...`)
- Alias sí permite en root
- Alias gratis (no cobran por queries)
- Alias resuelve automáticamente cambios de IP en el target

```hcl
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "example.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
```

### Routing policies

| Policy | Cuándo |
|---|---|
| **Simple** | Default. Un solo target |
| **Weighted** | A/B testing, traffic splitting |
| **Latency-based** | Multi-region, dirigir al endpoint más cercano |
| **Geolocation** | Diferenciar por país |
| **Geoproximity** | Granular por coords (con Traffic Flow) |
| **Failover** | Active-passive (primary + secondary) |
| **Multivalue** | Hasta 8 respuestas (simple round-robin) |

### Health checks

Route 53 puede verificar endpoints y solo retornar los healthy:

```hcl
resource "aws_route53_health_check" "primary" {
  fqdn              = "api.example.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
}
```

### Costos Route 53

- **Hosted zone**: $0.50/mes
- **Queries**: $0.40/M (primer 1B), después menos
- **Health checks**: $0.50-2.00/mes cada uno
- **Domain registration**: $12-25/año (varía por TLD)

Para un sitio típico: <$2/mes.

## ACM (AWS Certificate Manager)

Certificados SSL/TLS **gratis**. Renovación automática.

### Tipos

- **Public**: para sitios públicos. Validación por DNS o email.
- **Private**: para mTLS interno. Con AWS Private CA.

### Reglas importantes

- **Cert para CloudFront**: SIEMPRE en `us-east-1`, no importa dónde estén tus otros recursos
- **Cert para ALB**: en la región del ALB
- **Validación por DNS** preferida (auto-renueva sin intervención)

### Setup con Terraform

```hcl
# Cert en us-east-1 para CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "cf" {
  provider = aws.us_east_1

  domain_name               = "example.com"
  subject_alternative_names = ["*.example.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Records de validación
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cf.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "cf" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cf.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
```

## VPN y conectividad híbrida

### Site-to-Site VPN

VPN IPsec entre AWS y on-prem. ~$36/mes/conexión.

### Direct Connect

Fibra dedicada a AWS. Costoso ($50-300+/mes) pero baja latencia y bandwidth alto.

### Client VPN

VPN para usuarios remotos. ~$72/conexión activa + $0.10/h por subnet asociada.

### Pangolin / Tailscale / WireGuard

Alternativas open-source más baratas para conectar redes (no oficiales AWS pero funcionan bien).

## WAF (Web Application Firewall)

Bloquea ataques en capa 7 antes de llegar a tu app.

### Asociable a

- CloudFront
- ALB
- API Gateway
- AppSync (GraphQL)

### Reglas

- **Managed Rules** (AWS y partners): OWASP Top 10, bots, anonymous IPs, etc.
- **Custom rules**: por IP, geo, headers, body, rate limits

### Setup básico

```hcl
resource "aws_wafv2_web_acl" "main" {
  name  = "main-waf"
  scope = "CLOUDFRONT"  # o "REGIONAL" para ALB/API GW

  default_action { allow {} }

  # Managed: OWASP Top 10
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action { none {} }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "commonRuleSet"
    }
  }

  # Rate limiting
  rule {
    name     = "rate-limit"
    priority = 100

    action { block {} }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "rateLimit"
    }
  }

  visibility_config {
    sampled_requests_enabled   = true
    cloudwatch_metrics_enabled = true
    metric_name                = "main-waf"
  }
}
```

**Costo**: $5/web ACL + $1 por regla + $0.60/M requests. Típico $10-30/mes.

## Shield

- **Shield Standard**: gratis automático para CloudFront y Route 53. Defensa básica DDoS.
- **Shield Advanced**: $3000/mes (sí, tres mil). Para sitios críticos. Incluye DRT (DDoS Response Team).

## Costos comparados de patterns

### Pattern A: "Solo CloudFront + S3" (sitio estático)

| Componente | Costo |
|---|---|
| S3 storage | <$1 |
| CloudFront | $5-10 (50GB) |
| Route 53 | $0.50 |
| ACM | $0 |
| **TOTAL** | **~$6-12/mes** |

### Pattern B: "ALB + ECS (app dinámica)"

| Componente | Costo |
|---|---|
| ALB | $22 |
| ECS Fargate (2 tasks) | $36 |
| RDS Multi-AZ | $50 |
| NAT Gateway | $32 |
| CloudWatch + secrets | $10 |
| Route 53 | $0.50 |
| Data Transfer | $9 |
| **TOTAL** | **~$160/mes** |

### Pattern C: "CloudFront + ALB + ECS" (recomendado prod)

Pattern B + CloudFront delante = +$5-15/mes pero:
- Cache hit reduce egress del ALB
- HTTPS unificado
- WAF integrable
- DDoS protection

## Trampas comunes

- ❌ **VPC default sin pensar**: si la borras, rompes algunos servicios. Si la dejas, asegúrate de no usarla para prod.
- ❌ **NAT Gateway en cada AZ siempre**: solo en HA estricto. Una sola NAT cubre el 90% de los casos.
- ❌ **CIDRs solapados** entre VPCs (rompe peering futuro)
- ❌ **Security Groups con IPs** en lugar de SG refs (frágiles)
- ❌ **0.0.0.0/0 en SSH/DB ports** (NUNCA)
- ❌ **ACM en región incorrecta** para CloudFront (debe ser us-east-1)
- ❌ **CNAME en root del dominio** (no permitido; usar Alias)
- ❌ **Sin Route 53 health checks** para failover
- ❌ **Sin WAF** en sitios públicos
- ❌ **VPC endpoints olvidados**: pagas NAT cuando podrías evitarlo
- ❌ **Public IPs en cada task ECS** privada (`assign_public_ip = true` por error)

## Checklist de networking

- [ ] VPC con subnets públicas y privadas en mínimo 2 AZs
- [ ] CIDRs planificados (sin solapamiento con futuras VPCs)
- [ ] NAT Gateway en AZ con tráfico (HA si justifica costo)
- [ ] VPC Endpoints para S3, DynamoDB (gratis)
- [ ] VPC Endpoints Interface para ECR/SecretsManager si pulls son frecuentes
- [ ] Security Groups con least privilege (referencias a SGs, no IPs)
- [ ] No 0.0.0.0/0 en puertos sensibles
- [ ] VPC Flow Logs habilitados
- [ ] ALB con HTTPS y HTTP → HTTPS redirect
- [ ] TLS 1.2+ mínimo
- [ ] Route 53 con Alias records (no CNAMEs cuando se puede Alias)
- [ ] ACM certs renovándose automáticamente
- [ ] WAF en endpoints públicos
- [ ] CloudFront delante de orígenes si aplica
