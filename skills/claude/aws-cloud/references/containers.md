# Contenedores en AWS

ECR, ECS Fargate, EKS, App Runner. Cuándo usar cada uno.

## Comparación rápida

| Opción | Setup | Costo idle | Control | Cuándo |
|---|---|---|---|---|
| **App Runner** | 30 min | ~$25 | Bajo | Primer container, simplicidad |
| **ECS Fargate** | 4-8h | ~$15 (1 task) | Alto | Default para apps containerizadas |
| **ECS on EC2** | 4-8h | ~$15+ | Más | Workloads que justifican gestionar EC2 |
| **EKS** | 1-2 días | ~$73+/cluster + nodos | Total | K8s real, equipos K8s, multi-cloud |
| **Lambda con container** | 2-4h | $0 | Medio | Workloads serverless con dependencies grandes |

## ECR (Elastic Container Registry)

Registry privado para imágenes Docker.

### Setup

```hcl
resource "aws_ecr_repository" "app" {
  name                 = "mi-app"
  image_tag_mutability = "IMMUTABLE"  # tags no se pueden sobrescribir

  image_scanning_configuration {
    scan_on_push = true  # scan de vulnerabilidades
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

# Lifecycle: mantener solo las últimas N imágenes
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["*"]
          countType      = "imageCountMoreThan"
          countNumber    = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Delete untagged after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}
```

### Push de imagen

```bash
# Login
aws ecr get-login-password --region us-east-2 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-2.amazonaws.com

# Build, tag, push
docker build -t mi-app .
docker tag mi-app:latest 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-app:latest
docker tag mi-app:latest 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-app:$(git rev-parse --short HEAD)
docker push 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-app:latest
docker push 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-app:$(git rev-parse --short HEAD)
```

### Costos

- **Storage**: $0.10/GB/mes
- **Data transfer**: gratis dentro de la misma región
- **Scanning**: gratis con Basic scanning

### Buenas prácticas

- ✅ Tags inmutables
- ✅ Scan on push
- ✅ Lifecycle policies
- ✅ Tags semánticas: `1.2.3`, commit SHA, NO solo `latest`
- ✅ VPC endpoint para ECR si tu cluster está en private subnet
- ✅ Imágenes mínimas (alpine, distroless)
- ✅ Multi-stage builds
- ✅ Non-root user

## ECS Fargate (recomendado por default)

Containers managed sin servidores que gestionar.

### Conceptos

- **Cluster**: agrupación lógica (puede tener varios servicios)
- **Task definition**: blueprint (qué imagen, recursos, env, etc.)
- **Task**: instancia corriendo de un task definition
- **Service**: gestiona N tasks corriendo + auto-restart si fallan + integración con LB

### Setup completo

Ver `deploy-java-spring.md` para HCL completo. Componentes:

1. ECR repository
2. CloudWatch Log Group
3. ECS Cluster
4. Task Definition con container definition
5. ECS Service en private subnet
6. Application Load Balancer + Target Group
7. Auto-scaling target + policy

### Sizing de tasks Fargate

Combinaciones válidas de vCPU + memoria:

| vCPU | Memoria mínima | Memoria máxima |
|---|---|---|
| 0.25 | 0.5 GB | 2 GB |
| 0.5 | 1 GB | 4 GB |
| 1 | 2 GB | 8 GB |
| 2 | 4 GB | 16 GB |
| 4 | 8 GB | 30 GB |
| 8 | 16 GB | 60 GB |
| 16 | 32 GB | 120 GB |

### Pricing Fargate (us-east-2, x86)

- **vCPU**: $0.04048/hora
- **Memoria**: $0.004445/GB/hora

Ejemplos:
- **Mínima** (0.25 vCPU + 0.5 GB): $0.0101/hora = **$7.40/mes**
- **Típica web app** (0.5 vCPU + 1 GB): $0.0247/hora = **$18/mes**
- **API mediana** (1 vCPU + 2 GB): $0.0494/hora = **$36/mes**

### Fargate Spot (50-70% más barato)

```hcl
resource "aws_ecs_service" "app" {
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1  # al menos 1 on-demand
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 4  # 4 spot por cada 1 on-demand
  }
}
```

**Cuándo Spot**: stateless apps, batch jobs, dev/staging. AWS puede terminar tasks con 2 min de aviso.

### Auto-scaling

```hcl
resource "aws_appautoscaling_target" "app" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 2
  max_capacity       = 20
}

# Target tracking: mantener CPU al 70%
resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-scaling"
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70
    scale_in_cooldown  = 300  # 5 min antes de escalar down
    scale_out_cooldown = 60   # 1 min antes de escalar up
  }
}

# Scaling por requests (con ALB)
resource "aws_appautoscaling_policy" "requests" {
  name               = "request-scaling"
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.main.arn_suffix}/${aws_lb_target_group.app.arn_suffix}"
    }
    target_value = 1000  # 1000 requests por target
  }
}
```

### Deployment strategies

**Rolling update (default)**:
- ECS reemplaza tasks viejos por nuevos gradualmente
- Configurable: `minimumHealthyPercent`, `maximumPercent`
- Sin downtime si hay >1 task

**Blue/Green con CodeDeploy**:
- Despliega versión nueva en target group separado
- Switch de traffic gradual (canary 10%/30%/etc.)
- Rollback automático si fallan health checks
- Configuración más compleja

### Execute Command (debugging)

Conectarte a un task corriendo:

```bash
aws ecs execute-command \
  --cluster mi-cluster \
  --task arn:aws:ecs:us-east-2:...:task/... \
  --container app \
  --interactive \
  --command "/bin/sh"
```

Requisitos:
- Task definition con `enable_execute_command = true`
- IAM role con permisos `ssmmessages:*`
- SSM Agent en la imagen (Fargate lo incluye)

## ECS on EC2

Igual que Fargate pero tú gestionas las EC2.

**Cuándo elegir**:
- Workloads largos (>15 GB RAM o >4 vCPU por task)
- GPUs (Fargate no soporta GPU aún)
- Tasks que necesitan Docker access (DinD)
- Reserved Instances ya compradas
- Necesidades específicas del kernel

**Cuándo NO**:
- Si Fargate funciona, usa Fargate (sin servidores que mantener)

## App Runner (más simple que ECS)

Container managed con auto-scaling, HTTPS, deploys desde Git/ECR.

### Setup desde ECR

```hcl
resource "aws_apprunner_service" "app" {
  service_name = "mi-app"

  source_configuration {
    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "8080"
        runtime_environment_variables = {
          ENV = "production"
        }
        runtime_environment_secrets = {
          DATABASE_URL = aws_secretsmanager_secret.db.arn
        }
      }
    }

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }

    auto_deployments_enabled = true  # auto-deploy en push de imagen
  }

  instance_configuration {
    cpu               = "1024"  # 1 vCPU
    memory            = "2048"  # 2 GB
    instance_role_arn = aws_iam_role.apprunner_task.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  health_check_configuration {
    protocol          = "HTTP"
    path              = "/actuator/health"
    interval          = 10
    timeout           = 5
    healthy_threshold = 1
    unhealthy_threshold = 5
  }
}
```

### Costos App Runner

- **Provisioned container**: $0.009/h (idle, mantiene capacidad caliente)
- **Active**: $0.064/vCPU-h + $0.007/GB-h

Ejemplo 1 vCPU + 2 GB siempre activo:
- Provisioned: $6.50/mes
- Active 24/7: ~$55/mes
- **Total**: ~$60/mes (vs ~$25 de Fargate equivalente)

**Trade-off**: más caro, mucho más simple. Sin VPC, sin task definitions, sin ALB.

### Cuándo App Runner

- Tu primer container en AWS
- Quieres deploy fácil desde GitHub
- No te importa pagar premium por simplicidad
- HTTPS automático sin gestionar ACM/ALB

## EKS (Kubernetes en AWS)

Cluster managed de Kubernetes.

### Cuándo elegir EKS

✅ **Sí**:
- Equipo con experiencia K8s
- Multi-cloud (mismo K8s en AWS, GCP, on-prem)
- Workloads complejas: stateful, batch, ML
- Necesitas el ecosistema K8s (Helm, operators, Argo, etc.)
- Múltiples lenguajes/equipos compartiendo infra

❌ **NO**:
- Equipo nuevo en K8s (curva de aprendizaje enorme)
- App simple monolítica
- Solo necesitas correr un container
- No quieres gestionar control plane Y nodos

### Costos EKS

- **Control plane**: $0.10/hora = **$73/mes** por cluster (caro!)
- **Nodos**:
  - EC2 normales o Spot
  - Fargate (sin gestión de nodos): pricing Fargate normal
  - Karpenter para auto-scaling inteligente

**EKS Auto Mode** (lanzado finales 2024): AWS gestiona nodos también, simplificando mucho. Verificar pricing actualizado con `web_search`.

### Anti-pattern: EKS para apps simples

Si tu app cabe en 1-2 containers, **NO uses EKS**. Costo y complejidad enormes vs Fargate o App Runner.

## Lambda con container images

Lambda acepta containers (hasta 10 GB) en lugar de zips.

### Cuándo

- Dependencies grandes (>250 MB del zip límite Lambda)
- Mismo Dockerfile para Lambda y otros runtimes
- ML inference con modelos grandes
- Apps que ya usan containers y quieren serverless

### Setup

```dockerfile
FROM public.ecr.aws/lambda/python:3.12

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py ${LAMBDA_TASK_ROOT}

CMD ["app.handler"]
```

```bash
docker build -t mi-lambda .
docker tag mi-lambda:latest 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-lambda:latest
docker push 123456789012.dkr.ecr.us-east-2.amazonaws.com/mi-lambda:latest
```

```hcl
resource "aws_lambda_function" "container" {
  function_name = "mi-lambda"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda.repository_url}:latest"
  memory_size   = 2048
  timeout       = 60
  role          = aws_iam_role.lambda.arn
}
```

## Container image best practices

### Multi-stage builds

```dockerfile
# Builder stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage (más pequeño)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER node
CMD ["node", "dist/index.js"]
```

### Distroless images (más seguro)

```dockerfile
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /build
COPY . .
RUN ./mvnw clean package

FROM gcr.io/distroless/java17-debian12
COPY --from=builder /build/target/app.jar /app.jar
EXPOSE 8080
CMD ["/app.jar"]
```

Sin shell, sin package manager. Solo lo necesario para correr Java.

### Image scanning

- **ECR scan on push**: vulnerabilidades CVE
- **ECR Enhanced Scanning** (con Inspector): scan continuo + más profundo
- **Trivy** (Aqua, open source): scan local en CI antes de push

### Tags semánticas

```bash
# ✅ BIEN
docker tag mi-app:1.2.3 ECR/mi-app:1.2.3
docker tag mi-app:1.2.3 ECR/mi-app:1.2
docker tag mi-app:$(git rev-parse --short HEAD) ECR/mi-app:abc1234

# ❌ Solo `latest` en prod: pierdes versionado claro
```

## Networking de contenedores en AWS

### awsvpc network mode (Fargate default)

Cada task obtiene su propia ENI con IP en el VPC. Performance y seguridad.

### Service Connect (más reciente, fácil)

ECS Service Connect: service-to-service comunicación con DNS, métricas y traces automáticas.

```hcl
resource "aws_ecs_service" "app" {
  # ...
  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn

    service {
      port_name      = "http"
      discovery_name = "api"
      client_alias {
        port     = 8080
        dns_name = "api"
      }
    }
  }
}
```

Otros servicios pueden llamar `http://api:8080/` directamente.

## Migración entre opciones

### App Runner → ECS Fargate

Cuando creces:
1. Crear ECS cluster, task definition, service, ALB
2. Misma imagen Docker funciona
3. Switch DNS de App Runner a ALB
4. Eliminar App Runner

### Fargate → EKS

Cuando necesitas K8s real:
1. Setup EKS cluster
2. Deployment K8s con misma imagen
3. Ingress en lugar de ALB target group
4. Switch DNS
5. Eliminar ECS

## Trampas comunes

- ❌ Imágenes gigantes (>1 GB) → builds y deploys lentos
- ❌ Sin `.dockerignore` → bloat (node_modules, .git, etc.)
- ❌ Root user en container → security finding
- ❌ Hardcoded secrets en Dockerfile → leaked en imagen
- ❌ Sin health check → ECS no sabe si la app está viva
- ❌ Sin resource limits → un container puede consumir todo
- ❌ `latest` tag en producción → no sabes qué versión está corriendo
- ❌ Sin lifecycle en ECR → factura crece
- ❌ EKS para apps simples → 50x más complejidad sin beneficio
- ❌ NAT Gateway sin VPC endpoints para ECR → cost sorpresa pulling imágenes
- ❌ Servicios sin auto-scaling

## Recomendación por nivel

**Principiante con primer container**:
- **App Runner**. 30 min, listo. ~$25-50/mes.

**Comodidad con AWS, app moderada**:
- **ECS Fargate** con ALB. ~$60-150/mes.

**App compleja con varios servicios**:
- **ECS Fargate** + Service Connect. Considerar Step Functions para workflows.

**Equipo K8s o multi-cloud**:
- **EKS** con Fargate o Karpenter para nodos.

**Workload muy variable, event-driven**:
- **Lambda** con container image si dependencies grandes.

## Checklist contenedores

- [ ] Multi-stage build (imagen runtime pequeña)
- [ ] Non-root user
- [ ] Healthcheck definido
- [ ] Resource limits configurados
- [ ] Tags inmutables y semánticas
- [ ] ECR scan on push habilitado
- [ ] ECR lifecycle policy
- [ ] Imagen base actualizada (no obsoleta)
- [ ] Secrets desde Secrets Manager (no env vars hardcoded)
- [ ] VPC endpoint para ECR si en private subnet
- [ ] CloudWatch Logs configurado
- [ ] Auto-scaling configurado (si aplica)
- [ ] Deployment circuit breaker
