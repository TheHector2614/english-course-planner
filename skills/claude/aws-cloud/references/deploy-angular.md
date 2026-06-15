# Deploy Angular SPA a AWS

Patrón completo para desplegar Angular como sitio estático en S3 + CloudFront.

## Arquitectura

```
Usuario ─▶ Route 53 ─▶ CloudFront ─▶ S3 (bucket privado, OAC)
                            │
                            ├─▶ ACM (cert HTTPS, gratis)
                            └─▶ WAF (opcional)
```

## Componentes

| Componente | Función | Costo aprox |
|---|---|---|
| S3 bucket | Storage del build | ~$0.023/GB/mes |
| CloudFront | CDN global + HTTPS | $0.085/GB transfer + requests |
| Route 53 | DNS custom | $0.50/zona + queries |
| ACM | Cert HTTPS | $0 (gratis) |
| WAF | Protección capa 7 | $5/mes web ACL + reglas |

**Total típico**: $2-15/mes según tráfico.

## Setup paso a paso

### 1. Build de Angular para producción

```json
// angular.json — verificar
"build": {
  "configurations": {
    "production": {
      "optimization": true,
      "outputHashing": "all",
      "sourceMap": false,
      "namedChunks": false,
      "extractLicenses": true,
      "vendorChunk": false,
      "buildOptimizer": true,
      "budgets": [...]
    }
  }
}
```

```bash
ng build --configuration production
# Output en dist/<proyecto>/browser/
```

### 2. Infraestructura con Terraform

```hcl
# providers.tf
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # configurar después de crear el bucket de state
  }
}

provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Project     = "mi-app"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

# Provider us-east-1 OBLIGATORIO para ACM cert de CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
```

```hcl
# variables.tf
variable "domain_name" {
  type        = string
  description = "Dominio principal (ej: app.example.com)"
}

variable "hosted_zone_id" {
  type        = string
  description = "Zone ID de Route 53 (la zona debe existir previamente)"
}

variable "app_name" {
  type    = string
  default = "mi-app"
}
```

```hcl
# s3.tf
resource "aws_s3_bucket" "website" {
  bucket = "${var.app_name}-website-${data.aws_caller_identity.current.account_id}"
}

data "aws_caller_identity" "current" {}

# Bloquear acceso público (CloudFront accede vía OAC, no público)
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket policy: solo CloudFront vía OAC
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}
```

```hcl
# acm.tf
# ACM cert MUST be in us-east-1 for CloudFront
resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
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
  zone_id         = var.hosted_zone_id
}

resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
```

```hcl
# cloudfront.tf
# Origin Access Control para acceder al bucket privado
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.app_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Security Headers Policy
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.app_name}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      override                = true
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]
  price_class         = "PriceClass_100"  # US, Europe (más barato). _All para mundial
  http_version        = "http2and3"
  is_ipv6_enabled     = true

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.website.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${aws_s3_bucket.website.id}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    # Cache: assets con hash en nombre (filename.abc123.js) → cacheable for ever
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # Managed-CachingOptimized
  }

  # SPA: 404 → index.html (para client-side routing)
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.website.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Logging opcional
  # logging_config {
  #   bucket = aws_s3_bucket.logs.bucket_domain_name
  #   prefix = "cloudfront/"
  # }
}
```

```hcl
# route53.tf
resource "aws_route53_record" "website" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_www" {
  zone_id = var.hosted_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
```

```hcl
# outputs.tf
output "bucket_name" {
  value = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  value = "https://${var.domain_name}"
}
```

### 3. Deploy del build con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Angular to AWS

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

env:
  NODE_VERSION: 20
  AWS_REGION: us-east-2

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test -- --watch=false --browsers=ChromeHeadless

      - name: Build production
        run: npm run build -- --configuration production

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          # Assets con hash: caché eterno
          aws s3 sync dist/mi-app/browser/ s3://${{ secrets.S3_BUCKET }}/ \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html" \
            --exclude "*.map"

          # index.html: NO cachear (siempre la última)
          aws s3 cp dist/mi-app/browser/index.html s3://${{ secrets.S3_BUCKET }}/index.html \
            --cache-control "public, max-age=0, must-revalidate"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/index.html"
```

### 4. Setup de pre-requisitos

Antes del primer deploy:

1. **Cuenta AWS con MFA en root**
2. **Hosted Zone en Route 53** para tu dominio (registrar dominio si es nuevo, ~$12/año)
3. **OIDC provider de GitHub** configurado (ver `cicd-patterns.md`)
4. **Role `github-deploy`** con permisos:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::mi-app-website-*",
           "arn:aws:s3:::mi-app-website-*/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": "cloudfront:CreateInvalidation",
         "Resource": "arn:aws:cloudfront::*:distribution/E1ABCDEF"
       }
     ]
   }
   ```
5. **Secrets de GitHub Actions**:
   - `AWS_DEPLOY_ROLE_ARN`
   - `S3_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`

### 5. Comandos de deploy

```bash
# Primera vez
terraform init
terraform plan -var="domain_name=app.example.com" -var="hosted_zone_id=Z123ABC"
terraform apply

# Build + deploy manual (sin CI)
ng build --configuration production
aws s3 sync dist/mi-app/browser/ s3://mi-app-website-123456789012/ --delete
aws cloudfront create-invalidation --distribution-id E1ABCDEF --paths "/*"
```

## Optimizaciones

### Performance

- **Compresión brotli/gzip**: CloudFront comprime automáticamente
- **HTTP/3**: habilitado con `http_version = "http2and3"`
- **PriceClass_100**: solo US/Europe (más barato). Si hay usuarios en LATAM real, considera _200
- **Cache larguísimo** en assets con hash en nombre

### Security

- **WAF**: AWS WAF Managed Rules para protección OWASP
- **CSP estricta**: ver `web-backend-security` skill
- **Geo restriction** si solo sirves ciertos países
- **Signed URLs/Cookies** si necesitas contenido privado

### Costo

- **CloudFront cache hit rate**: >90% es bueno. Monitor con métricas
- **Reserved capacity** de CloudFront para alto volumen
- **Logging a S3** si necesitas análisis (compress con Athena)

## SPA + Rutas (importante)

Angular usa client-side routing. Si visitas `app.example.com/users/123` directo, S3 no tiene `users/123.html`. CloudFront devuelve 404.

**Fix**: configurar CloudFront para devolver `index.html` en 404 (ya está en el HCL arriba).

Para Angular:
```typescript
// app.routes.ts — wildcard route
{ path: '**', redirectTo: '/not-found' }
// o componente custom
```

## Monitoring

```hcl
# CloudWatch dashboard (resumen)
resource "aws_cloudwatch_dashboard" "website" {
  dashboard_name = "${var.app_name}-website"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.website.id]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "Requests"
        }
      }
    ]
  })
}

# Alarma: 5xx rate alto
resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "${var.app_name}-cloudfront-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
    Region         = "Global"
  }

  provider = aws.us_east_1
}
```

## Trampas comunes

- ❌ Olvidar que ACM para CloudFront va en `us-east-1`
- ❌ No configurar SPA fallback (404 → index.html)
- ❌ Cache demasiado largo en `index.html` (los usuarios no ven updates)
- ❌ Olvidar invalidación de CloudFront después del deploy
- ❌ Cache demasiado corto en assets con hash (sin beneficio del CDN)
- ❌ Servir desde S3 directamente sin CloudFront (sin HTTPS y caro en egress)
- ❌ Bucket público (debería ser privado, accedido por CloudFront)
- ❌ No tener `index.html` como default root object

## Estimación de costos final

Para un sitio típico con 50k usuarios/mes:

| Recurso | Costo mensual |
|---|---|
| S3 storage (5 MB) | $0 |
| S3 requests (deploys) | $0 |
| CloudFront (50 GB transfer) | ~$4 |
| CloudFront requests (1M) | ~$1 |
| Route 53 (1 zona) | $0.50 |
| ACM | $0 |
| **TOTAL** | **~$6/mes** |

Con free tier (primer año): probablemente $1-2.
