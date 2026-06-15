# Infrastructure as Code (IaC)

Terraform, Pulumi, Ansible. State, módulos, multi-cloud.

**Nota**: para IaC específico de AWS (módulos, account strategy, deploy de apps) ver `aws-cloud`. Para policy-as-code de seguridad (Checkov, tfsec) ver `cybersecurity-defense`. Aquí: IaC multi-cloud y agnóstico.

## Principio: infraestructura declarativa y versionada

Describir la infraestructura como código: versionable, revisable, reproducible. No más clicks manuales en consolas (no reproducible, no auditable, propenso a error).

## Provisioning vs Configuration

| | Provisioning | Configuration management |
|---|---|---|
| Qué | Crear infra (VMs, redes, DBs) | Configurar lo creado (instalar, ajustar) |
| Herramientas | Terraform, Pulumi, CloudFormation | Ansible, Chef, Puppet |
| Modelo | Declarativo | Declarativo/procedimental |
| Estado | Maneja state | Idempotente (sin state típicamente) |

A menudo se combinan: Terraform crea las VMs, Ansible las configura.

## Terraform

El estándar de IaC multi-cloud. Declarativo, con state.

### Estructura básica

```hcl
# main.tf
terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # State remoto (esencial en equipo)
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"   # state locking
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}

# Recurso
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  tags = {
    Name        = "${var.project}-web"
    Environment = var.environment
  }
}
```

### Variables y outputs

```hcl
# variables.tf
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# outputs.tf
output "instance_ip" {
  value = aws_instance.web.public_ip
}

output "db_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true     # no mostrar en logs
}
```

### Comandos Terraform

```bash
terraform init          # inicializar (descargar providers, configurar backend)
terraform fmt           # formatear
terraform validate      # validar sintaxis
terraform plan          # ver qué cambiaría (SIEMPRE antes de apply)
terraform plan -out=tfplan
terraform apply tfplan  # aplicar (el plan guardado)
terraform apply         # plan + apply interactivo
terraform destroy       # destruir todo (cuidado)

# Estado
terraform state list
terraform state show aws_instance.web
terraform import aws_instance.web i-1234567890  # importar recurso existente

# Workspaces (múltiples entornos con mismo código)
terraform workspace new staging
terraform workspace select prod
```

### State (crítico)

El state mapea recursos reales con la config. **En equipo, debe ser remoto y con lock.**

```hcl
# Backend S3 con locking (DynamoDB)
backend "s3" {
  bucket         = "my-terraform-state"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-locks"
  encrypt        = true
}
```

Backends comunes: S3+DynamoDB (AWS), GCS (GCP), Azure Storage, Terraform Cloud, Consul.

⚠️ **Nunca**:
- State local en equipo (conflictos)
- State sin lock (dos applies simultáneos corrompen)
- State sin cifrar (contiene secrets)
- Commitear `terraform.tfstate` a Git (contiene secrets, y es estado, no código)
- Editar el state a mano (usar `terraform state` commands)

### Módulos (reutilización)

```hcl
# Módulo reutilizable
# modules/vpc/main.tf
variable "cidr" { type = string }
variable "name" { type = string }

resource "aws_vpc" "this" {
  cidr_block = var.cidr
  tags       = { Name = var.name }
}

output "vpc_id" {
  value = aws_vpc.this.id
}

# Usar el módulo
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
  name   = "prod-vpc"
}

# Módulo de registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  # ...
}
```

### Estructura de proyecto

```
infra/
├── modules/
│   ├── vpc/
│   ├── eks/
│   └── rds/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── prod/
└── global/
    └── iam/
```

Cada entorno con su state separado (blast radius).

### Multi-cloud con Terraform

```hcl
# Múltiples providers
provider "aws" {
  region = "us-east-1"
}
provider "google" {
  project = "my-project"
  region  = "us-central1"
}
provider "azurerm" {
  features {}
}

# Recursos de distintos clouds en la misma config
resource "aws_s3_bucket" "data" { bucket = "my-data" }
resource "google_storage_bucket" "backup" { name = "my-backup" }
```

Terraform es agnóstico: el mismo workflow para cualquier cloud (con providers distintos).

### Provisioners (evitar si es posible)

```hcl
# Last resort: ejecutar comandos (preferir herramientas dedicadas)
resource "aws_instance" "web" {
  # ...
  provisioner "remote-exec" {
    inline = ["sudo apt-get update"]
  }
}
```

⚠️ Provisioners son frágiles. Para configurar VMs, preferir Ansible o cloud-init. Para imágenes, Packer.

## Pulumi

IaC con lenguajes de programación reales (TypeScript, Python, Go, C#).

```typescript
// index.ts
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const instanceType = config.get("instanceType") || "t3.micro";

const bucket = new aws.s3.Bucket("my-bucket", {
  acl: "private",
  tags: { Environment: "prod" },
});

const server = new aws.ec2.Instance("web", {
  ami: "ami-12345",
  instanceType: instanceType,
  tags: { Name: "web-server" },
});

export const bucketName = bucket.id;
export const serverIp = server.publicIp;
```

```bash
pulumi up           # plan + apply
pulumi preview      # plan
pulumi destroy
pulumi stack        # gestionar stacks (entornos)
```

### Terraform vs Pulumi

| | Terraform | Pulumi |
|---|---|---|
| Lenguaje | HCL (DSL) | TS/Python/Go/C# |
| Curva | HCL simple | Conoces el lenguaje |
| Lógica | Limitada (HCL) | Completa (loops, condicionales, funciones) |
| Ecosystem | Más maduro/grande | Creciendo |
| Testing | Limitado | Unit tests reales |
| Mejor para | Estándar, equipos mixtos | Devs que prefieren código real |

Ambos son sólidos. Terraform es más común; Pulumi atrae a quienes quieren lógica compleja y testing.

## Ansible (configuration management)

Configurar servidores/sistemas. Agentless (SSH), idempotente.

### Playbook

```yaml
# playbook.yml
---
- name: Configure web servers
  hosts: webservers
  become: true
  vars:
    app_port: 8080
  tasks:
    - name: Install packages
      apt:
        name:
          - nginx
          - curl
        state: present
        update_cache: true

    - name: Copy nginx config
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: Restart nginx

    - name: Ensure nginx running
      service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted
```

### Inventory

```ini
# inventory.ini
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com

[production:children]
webservers
dbservers
```

```yaml
# inventory dinámico (cloud)
# Ansible puede descubrir hosts de AWS/GCP/Azure automáticamente
```

### Comandos Ansible

```bash
ansible-playbook -i inventory.ini playbook.yml
ansible-playbook playbook.yml --check          # dry-run
ansible-playbook playbook.yml --limit web1     # solo un host
ansible all -i inventory.ini -m ping           # ad-hoc command
ansible-vault encrypt secrets.yml              # cifrar secrets
```

### Roles (reutilización)

```
roles/
├── nginx/
│   ├── tasks/main.yml
│   ├── templates/
│   ├── handlers/main.yml
│   ├── defaults/main.yml
│   └── vars/main.yml
```

```yaml
# Usar roles
- hosts: webservers
  roles:
    - nginx
    - app
```

### Idempotencia

Ansible es idempotente: correr el playbook múltiples veces da el mismo resultado. Los módulos verifican estado antes de actuar (no reinstala si ya está).

## Packer (imágenes inmutables)

Construir imágenes de máquina (AMIs, etc.) pre-configuradas. Inmutabilidad: en lugar de configurar al arrancar, la imagen ya viene lista.

```hcl
# image.pkr.hcl
source "amazon-ebs" "web" {
  ami_name      = "web-{{timestamp}}"
  instance_type = "t3.micro"
  region        = "us-east-1"
  source_ami    = "ami-12345"
  ssh_username  = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.web"]
  provisioner "ansible" {
    playbook_file = "playbook.yml"
  }
}
```

```bash
packer build image.pkr.hcl
```

Patrón: Packer construye la imagen (con Ansible adentro) → Terraform la despliega. Inmutable: nueva versión = nueva imagen, no parchear en vivo.

## IaC en CI/CD

```yaml
# GitHub Actions: plan en PR, apply en merge
name: Terraform

on:
  pull_request:
  push:
    branches: [main]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      # OIDC para cloud (ver cybersecurity-defense)
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123:role/tf-role
          aws-region: us-east-1
      - run: terraform init
      - run: terraform fmt -check
      - run: terraform validate
      - run: terraform plan -out=tfplan
      # Policy as code (ver cybersecurity-defense)
      - run: checkov -d . --quiet
      # Comentar el plan en el PR
      - if: github.event_name == 'pull_request'
        run: terraform show -no-color tfplan > plan.txt

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main'
    environment: production    # gate de aprobación
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123:role/tf-role
          aws-region: us-east-1
      - run: terraform init
      - run: terraform apply -auto-approve
```

## Drift detection

La infra puede cambiar fuera de IaC (cambios manuales). Detectar:

```bash
# Terraform: plan muestra drift
terraform plan       # si hay cambios no en código, aparecen

# Continuo: driftctl, Terraform Cloud drift detection
driftctl scan
```

Mejor: prohibir cambios manuales (solo vía IaC), como GitOps para infra.

## Testing de IaC

```bash
# Terraform
terraform validate                    # sintaxis
tflint                                 # linter
terraform test                        # tests nativos (1.6+)
terratest                             # tests en Go

# Policy as code (ver cybersecurity-defense)
checkov -d .
tfsec .
conftest test main.tf

# Pulumi: unit tests en el lenguaje
```

## Buenas prácticas IaC

- **State remoto + lock** (Terraform)
- **Módulos** para reutilización
- **Entornos separados** (state por entorno)
- **Plan antes de apply** (revisar cambios)
- **Variables, no hardcode**
- **Secrets fuera del código** (ver `cybersecurity-defense`)
- **Versionar providers/módulos** (pin)
- **Policy as code** en CI (Checkov/tfsec)
- **IaC en Git** (PRs, review)
- **No editar infra a mano** (drift)
- **Inmutabilidad** (Packer + reemplazar, no parchear)

## Anti-patterns

- ❌ Clicks manuales en consola (no reproducible)
- ❌ State local en equipo
- ❌ State sin lock (corrupción)
- ❌ State sin cifrar (secrets expuestos)
- ❌ Commitear tfstate a Git
- ❌ Editar state a mano
- ❌ Secrets hardcodeados en .tf
- ❌ Sin plan antes de apply
- ❌ Providers/módulos sin versionar
- ❌ Un solo state gigante (blast radius enorme)
- ❌ Cambios manuales a infra gestionada por IaC (drift)
- ❌ Provisioners cuando hay herramienta dedicada (Ansible/Packer)

## Checklist IaC

### Terraform/Pulumi
- [ ] State remoto con locking
- [ ] State cifrado
- [ ] tfstate NO en Git
- [ ] Módulos para reutilización
- [ ] Entornos separados (state por entorno)
- [ ] Variables (no hardcode)
- [ ] Providers/módulos versionados (pin)
- [ ] plan antes de apply
- [ ] Policy as code en CI (ver cybersecurity-defense)
- [ ] Secrets fuera del código
- [ ] OIDC para cloud (no keys estáticas)

### Ansible
- [ ] Playbooks idempotentes
- [ ] Roles para reutilización
- [ ] Secrets con ansible-vault
- [ ] Inventory (estático o dinámico)
- [ ] --check (dry-run) antes de aplicar

### General
- [ ] IaC en Git (PRs, review)
- [ ] CI valida (fmt, validate, lint, policy)
- [ ] Gate de aprobación para prod
- [ ] Drift detection
- [ ] Documentación de la infra
