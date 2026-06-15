# IaC: Terraform vs CDK vs CloudFormation/SAM

Comparación práctica y cuándo elegir cada una.

## Tabla resumen

| Aspecto | Terraform | CDK (TS/Py) | CloudFormation/SAM |
|---|---|---|---|
| Lenguaje | HCL (DSL declarativo) | TypeScript / Python | YAML / JSON |
| Multi-cloud | ✅ Sí (AWS, GCP, Azure, etc.) | ❌ Solo AWS (CDK clásico) | ❌ Solo AWS |
| Curva aprendizaje | Media | Media-alta (si conoces TS/Py es fácil) | Baja (YAML simple) |
| Ecosistema módulos | Enorme (Terraform Registry) | Construct Hub | Limitado |
| Programación real (if/for) | Limitada (HCL) | ✅ Sí | Macros (complejo) |
| State management | Necesita backend (S3 + DynamoDB) | Lo maneja CloudFormation | Lo maneja CloudFormation |
| Velocidad de deploy | Rápido | CFN debajo (medio) | Medio |
| Drift detection | `terraform plan` | `cdk diff` | Drift detection nativo |
| Soporte features nuevos AWS | A veces tarda semanas | Inmediato (L1 constructs) | Inmediato |
| Ideal para... | Multi-cloud, equipos grandes, infraestructura compartida | Devs con experiencia en TS/Py, AWS-only | Apps serverless simples, equipos sin DevOps |

## Cuándo elegir cada una

### Elige **Terraform** si:
- Trabajas con multi-cloud (AWS + GCP, etc.)
- Tu equipo ya lo conoce
- Quieres el ecosistema más maduro de módulos
- Necesitas separar infra "shared" (redes, IAM, DNS) que varios equipos usan
- Tienes infraestructura compleja con muchas dependencias
- Quieres state explícito (más control, pero más responsabilidad)

### Elige **CDK (TypeScript)** si:
- Tu equipo programa en TS/JS
- Solo usas AWS
- Quieres usar abstracciones de alto nivel (L2/L3 constructs)
- Quieres usar lógica programática (loops, condicionales, funciones)
- Quieres testing de infra con Jest/Vitest
- Te gusta tener tipos para autocompletado

### Elige **CDK (Python)** si:
- Tu equipo programa en Python
- Mismas razones que CDK TS

### Elige **CloudFormation/SAM** si:
- App 100% serverless simple (Lambda + API Gateway + DynamoDB)
- Equipo sin experiencia en TS/Py/HCL
- Quieres cero dependencias adicionales (CFN está nativo)
- Es proyecto chico/personal

### Elige **Pulumi** si: (no marcado pero válido)
- Te gusta CDK pero quieres multi-cloud

## Recomendación para principiante

Si estás empezando con AWS:

1. **Primer proyecto**: empieza con la **consola web** para entender qué recursos existen y cómo se relacionan
2. **Segundo proyecto**: usa **SAM** o **CDK TypeScript** según comodidad. SAM es más simple si es serverless.
3. **Cuando tengas equipo**: evalúa Terraform si vais a multi-cloud o varios devs

**NO empieces con Terraform** si no conoces AWS. La sintaxis es nueva Y el cloud es nuevo = doble carga cognitiva.

## Setup inicial para cada herramienta

### Terraform

```bash
# Instalar
brew install terraform           # macOS
# O descargar de hashicorp.com

# Verificar
terraform version

# Estructura mínima de proyecto
proyecto/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
└── backend.tf  (configurar state remoto)

# Backend remoto (importante para equipos)
# backend.tf
terraform {
  backend "s3" {
    bucket         = "mi-tfstate-bucket"
    key            = "proyecto/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"  # para state locking
  }
}
```

Ejemplo `main.tf` mínimo (bucket S3):
```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "website" {
  bucket = "mi-sitio-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_caller_identity" "current" {}
```

Comandos:
```bash
terraform init     # descarga providers
terraform plan     # ve qué se va a crear/modificar
terraform apply    # crea/modifica
terraform destroy  # ⚠️ destruye TODO
```

### CDK (TypeScript)

```bash
# Instalar
npm install -g aws-cdk
cdk --version

# Nuevo proyecto
mkdir mi-proyecto && cd mi-proyecto
cdk init app --language typescript

# Estructura generada
proyecto/
├── bin/
│   └── proyecto.ts          # entry point
├── lib/
│   └── proyecto-stack.ts    # tu stack
├── test/
├── cdk.json
└── tsconfig.json
```

Ejemplo stack mínimo (`lib/proyecto-stack.ts`):
```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class ProyectoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'WebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,  // no borrar al destroy
    });
  }
}
```

Comandos:
```bash
cdk bootstrap      # primera vez en la cuenta/región
cdk synth          # genera CloudFormation template
cdk diff           # qué cambios se van a aplicar
cdk deploy         # despliega
cdk destroy        # ⚠️ destruye
```

### SAM (CloudFormation simplificado para serverless)

```bash
# Instalar
brew install aws-sam-cli  # macOS
# Otros: https://docs.aws.amazon.com/serverless-application-model/

# Nuevo proyecto
sam init
# Elegir: AWS Quick Start Templates → Hello World → runtime (Node.js, Python, Java...)

# Estructura
proyecto/
├── template.yaml         # CloudFormation/SAM template
├── src/
│   └── handler.ts        # código de la Lambda
├── tests/
└── samconfig.toml
```

Ejemplo `template.yaml`:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: nodejs20.x

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: handler.handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /hello
            Method: get
```

Comandos:
```bash
sam build           # empaqueta
sam local invoke    # test local
sam local start-api # API local
sam deploy --guided # primera vez
sam deploy          # siguientes
sam delete          # ⚠️ borra
```

## Buenas prácticas universales (cualquier IaC)

### 1. Versionar el código
- Repo Git con IaC desde día 1
- Branch protection en `main`
- Code review obligatorio antes de merge

### 2. Separar environments
```
proyecto/
├── envs/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── modules/  (terraform) o constructs/ (cdk)
```

### 3. Tagging consistente

Todo recurso debe tener tags. Mínimo:
- `Environment`: dev/staging/prod
- `Project`: nombre-proyecto
- `Owner`: email o equipo
- `ManagedBy`: terraform / cdk / sam
- `CostCenter`: si aplica para FinOps

En Terraform (default tags):
```hcl
provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "prod"
      Project     = "mi-app"
      ManagedBy   = "terraform"
    }
  }
}
```

En CDK:
```typescript
cdk.Tags.of(app).add('Environment', 'prod');
cdk.Tags.of(app).add('Project', 'mi-app');
```

### 4. State / Templates en cuenta separada (multi-cuenta)

Tener el state de Terraform en una cuenta `shared-services` separada de las cuentas de workload. Reduce riesgo de borrar accidentalmente.

### 5. NO hacer cambios desde la consola

Una vez con IaC, todos los cambios pasan por código. Cambios manuales generan **drift** (diferencia entre IaC y realidad). Detectarlos:
- Terraform: `terraform plan` muestra drift
- CDK/CFN: drift detection en la consola CloudFormation

### 6. Tests de IaC

- **Terraform**: `terraform validate`, `tflint`, `checkov`, `tfsec` (security scanning)
- **CDK**: tests con Jest (`@aws-cdk/assertions`), `cdk-nag` (security/best practices)
- **CFN/SAM**: `cfn-lint`, `cfn-nag`

### 7. Pre-commit hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.88.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
      - id: terraform_checkov
```

## Comparación de un mismo recurso

**Objetivo**: bucket S3 con encriptación y bloqueo de acceso público.

### Terraform
```hcl
resource "aws_s3_bucket" "main" {
  bucket = "my-bucket-${random_id.suffix.hex}"
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

### CDK TypeScript
```typescript
new s3.Bucket(this, 'MyBucket', {
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
});
```

### CloudFormation (YAML)
```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
```

**Observación**: CDK es más conciso porque las L2 constructs aplican defaults razonables. Terraform y CloudFormation son más explícitos.

## Migración entre herramientas

| De → A | Dificultad | Herramientas |
|---|---|---|
| Consola → cualquiera | Media | `aws2tf`, `cdk import`, `Former2` |
| CloudFormation → CDK | Baja | `cdk migrate` |
| CloudFormation → Terraform | Media | Reescribir, o `cf2tf` (limitado) |
| CDK → Terraform | Alta | Reescribir |
| Terraform → CDK | Alta | Reescribir |

Si vas a migrar: hacerlo gradualmente por stack/módulo, no big-bang.
