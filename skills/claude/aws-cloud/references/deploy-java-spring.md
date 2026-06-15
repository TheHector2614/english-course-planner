# Deploy Java/Spring Boot a AWS

Patrón recomendado: **ECS Fargate** con RDS PostgreSQL.

## Arquitectura

```
Internet
  ↓
Route 53 + ACM
  ↓
CloudFront (opcional, recomendado)
  ↓
Application Load Balancer (ALB) — public subnet
  ↓
ECS Service (Fargate tasks) — private subnet
  ↓
RDS PostgreSQL (Multi-AZ) — private subnet
```

Otros componentes:
- **ECR** para imágenes Docker
- **Secrets Manager** para DB credentials y JWT
- **CloudWatch Logs** para logging
- **CodePipeline/GitHub Actions** para deploys

## Componentes y costos (mensual estimado)

| Componente | Configuración | Costo |
|---|---|---|
| ECR | 1 GB de imágenes | ~$0.10 |
| ECS Fargate | 2 tasks × 0.5 vCPU × 1 GB | ~$36 |
| ALB | 1 | ~$22 |
| RDS db.t3.micro Multi-AZ | 20 GB storage | ~$50 |
| Secrets Manager | 2 secrets | $0.80 |
| CloudWatch Logs | 10 GB | ~$8 |
| Data Transfer | 100 GB out | $9 |
| Route 53 + ACM | 1 zona, 1 cert | $0.50 |
| **TOTAL** | | **~$127/mes** |

### Versión "barata" (~$60/mes)

- 1 Fargate task en lugar de 2 (sin HA): -$18
- RDS Single-AZ: -$25
- Sin ALB, usar App Runner directo: -$22 (pero menos control)

### Versión "robusta" (~$200/mes)

- Aurora Serverless v2 (mejor performance): +$30
- 3 tasks con auto-scaling: +$18
- WAF: +$5
- ECR scanning: +$0.10 per image

## Dockerfile para Spring Boot

```dockerfile
# Build stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Cache dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

# Build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Layer caching con Spring Boot layered jars
COPY --from=builder --chown=app:app /build/target/*.jar app.jar

# JVM tuning para containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Optimizaciones de imagen

**Imagen base más chica**:
- `eclipse-temurin:17-jre-alpine` (~180 MB)
- `gcr.io/distroless/java17-debian12` (~140 MB, sin shell)

**Spring Boot layered jars** (más cache-friendly):

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <layers>
      <enabled>true</enabled>
    </layers>
  </configuration>
</plugin>
```

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder --chown=app:app /build/target/app.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract && rm app.jar

# Cada layer se cachea por separado
COPY --from=builder --chown=app:app /build/dependencies/ ./
COPY --from=builder --chown=app:app /build/spring-boot-loader/ ./
COPY --from=builder --chown=app:app /build/snapshot-dependencies/ ./
COPY --from=builder --chown=app:app /build/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

## Infraestructura con Terraform

### Estructura

```
infra/
├── providers.tf
├── variables.tf
├── outputs.tf
├── network.tf       (VPC, subnets, NAT, IGW)
├── ecr.tf
├── alb.tf
├── ecs.tf
├── rds.tf
├── secrets.tf
├── route53.tf
├── iam.tf
└── cloudwatch.tf
```

### VPC y networking

```hcl
# network.tf
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.app_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.app_name}-igw" }
}

# Subnets públicas (2 AZs para HA del ALB)
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = { Name = "${var.app_name}-public-${count.index + 1}" }
}

# Subnets privadas
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = { Name = "${var.app_name}-private-${count.index + 1}" }
}

# NAT Gateway (1 sola para ahorrar; en HA estricto usar 2)
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${var.app_name}-nat-eip" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = { Name = "${var.app_name}-nat" }
  depends_on    = [aws_internet_gateway.main]
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.app_name}-public-rt" }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = { Name = "${var.app_name}-private-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# VPC Endpoints para ECR (ahorra NAT cost en pull de imágenes)
resource "aws_security_group" "endpoints" {
  name        = "${var.app_name}-vpce-sg"
  vpc_id      = aws_vpc.main.id
  description = "VPC endpoints SG"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}
```

### ECR

```hcl
# ecr.tf
resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = { type = "expire" }
      }
    ]
  })
}
```

### ALB

```hcl
# alb.tf
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-alb-sg"
  vpc_id      = aws_vpc.main.id
  description = "ALB Security Group"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false  # true en prod
  enable_http2               = true
}

resource "aws_lb_target_group" "app" {
  name        = "${var.app_name}-tg"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"  # Fargate usa awsvpc → IPs
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/actuator/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  deregistration_delay = 30
}

resource "aws_lb_listener" "http" {
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

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

### RDS

```hcl
# rds.tf
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "db" {
  name        = "${var.app_name}-db-sg"
  vpc_id      = aws_vpc.main.id
  description = "RDS Security Group"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}

resource "random_password" "db" {
  length  = 24
  special = false  # algunos chars rompen URLs
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.app_name}/prod/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = "appuser"
    password = random_password.db.result
    host     = aws_db_instance.main.address
    port     = 5432
    dbname   = "appdb"
  })
}

resource "aws_db_instance" "main" {
  identifier = "${var.app_name}-db"

  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "appdb"
  username = "appuser"
  password = random_password.db.result

  multi_az               = false  # true para prod
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  performance_insights_enabled = true

  deletion_protection = false  # true en prod
  skip_final_snapshot = true   # false en prod
}
```

### ECS

```hcl
# ecs.tf
resource "aws_security_group" "app" {
  name        = "${var.app_name}-app-sg"
  vpc_id      = aws_vpc.main.id
  description = "App Security Group"

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "app" {
  family                   = var.app_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512  # 0.5 vCPU
  memory                   = 1024 # 1 GB
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SERVER_PORT", value = "8080" }
      ]

      secrets = [
        {
          name      = "SPRING_DATASOURCE_URL"
          valueFrom = "${aws_secretsmanager_secret.db.arn}:url::"
        },
        {
          name      = "SPRING_DATASOURCE_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.db.arn}:username::"
        },
        {
          name      = "SPRING_DATASOURCE_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.db.arn}:password::"
        },
        {
          name      = "APP_JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt.arn
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = var.app_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 8080
  }

  deployment_controller {
    type = "ECS"  # rolling. CODE_DEPLOY para blue/green
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  enable_execute_command = true  # útil para debug: aws ecs execute-command

  depends_on = [aws_lb_listener.https]

  lifecycle {
    ignore_changes = [desired_count]  # auto-scaling lo gestionará
  }
}

# Auto-scaling
resource "aws_appautoscaling_target" "app" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 2
  max_capacity       = 10
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.app_name}-cpu-scaling"
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
```

### IAM Roles

```hcl
# iam.tf
# Execution role: para pull imagen, escribir logs
resource "aws_iam_role" "ecs_execution" {
  name = "${var.app_name}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Permisos extra para Secrets Manager
resource "aws_iam_role_policy" "ecs_execution_secrets" {
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      ]
      Resource = [
        aws_secretsmanager_secret.db.arn,
        aws_secretsmanager_secret.jwt.arn
      ]
    }]
  })
}

# Task role: permisos que NECESITA la app (no para pull imagen)
resource "aws_iam_role" "ecs_task" {
  name = "${var.app_name}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

# Permisos de la app: S3, SQS, etc.
resource "aws_iam_role_policy" "ecs_task" {
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.uploads.arn}/*"
      }
    ]
  })
}
```

## GitHub Actions deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-east-2
  ECR_REPOSITORY: mi-app
  ECS_SERVICE: mi-app
  ECS_CLUSTER: mi-app-cluster
  CONTAINER_NAME: app

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
          cache: maven

      - name: Run tests
        run: ./mvnw test

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Render task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: ${{ env.CONTAINER_NAME }}
          image: ${{ steps.build-image.outputs.image }}

      - name: Deploy ECS service
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

## Application configuration

`application-prod.yml`:
```yaml
spring:
  datasource:
    # Vienen de Secrets Manager via env vars en task definition
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate

management:
  endpoints:
    web:
      exposure:
        include: health, info, prometheus  # solo lo necesario
  endpoint:
    health:
      show-details: when-authorized

logging:
  level:
    root: INFO
  pattern:
    console: '%d{ISO8601} %-5level [%X{traceId:-}] %logger{36} - %msg%n'
```

## Trampas comunes

- ❌ Olvidar VPC endpoints para ECR → costos altos de NAT
- ❌ NAT Gateway en 2 AZs cuando 1 basta para empezar (-$32/mes)
- ❌ RDS Multi-AZ en dev (innecesario, cuesta el doble)
- ❌ No habilitar `assign_public_ip = false` en Fargate privado
- ❌ Health check timeout muy corto (start_period < 60s rompe Spring Boot)
- ❌ JVM sin tuning para containers (`-XX:+UseContainerSupport`)
- ❌ Image scanning deshabilitado en ECR
- ❌ Logs sin retention (acumulan costo)
- ❌ Connection pool de DB demasiado grande (HikariCP default 10 puede agotar RDS chiquitas)
- ❌ Secrets en environment variables del task definition (usar `secrets` con Secrets Manager)
- ❌ Sin auto-scaling (peak traffic = downtime)
- ❌ Sin deployment circuit breaker (deploys fallidos quedan medio aplicados)

## Versión simplificada para empezar: App Runner

Si todo esto es demasiado para empezar, **App Runner** es más simple:

```bash
# Subir imagen a ECR
docker build -t mi-app .
docker tag mi-app:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/mi-app:latest
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/mi-app:latest

# Crear servicio en consola
# - App Runner → Create service
# - Source: ECR (la imagen)
# - Deploy automático en push
# - Auto-scaling incluido
# - HTTPS automático
```

**Costo**: ~$25-50/mes (más caro que ECS, mucho más simple).

**Cuándo**: tu primer Spring Boot en AWS. Después migra a ECS cuando entiendas más.
