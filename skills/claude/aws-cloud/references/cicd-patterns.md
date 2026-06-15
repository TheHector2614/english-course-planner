# CI/CD para AWS

Patrones de CI/CD con GitHub Actions, GitLab CI, AWS CodePipeline y Jenkins.

## Principio número 1: OIDC, no access keys

**NO usar IAM users con access keys** para CI/CD. Usar **OIDC** (OpenID Connect) — federación que permite que el CI asuma roles temporales sin keys de larga vida.

Beneficios:
- Sin keys que rotar o que se filtren
- Credenciales temporales (1h por default)
- Auditoría clara en CloudTrail
- Permisos por workflow/pipeline

## GitHub Actions con OIDC

### 1. Crear OIDC provider en AWS (una vez por cuenta)

```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}
```

### 2. Crear rol que el workflow va a asumir

```hcl
resource "aws_iam_role" "github_deploy" {
  name = "github-deploy-mi-app"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Solo desde este repo y branch main
            "token.actions.githubusercontent.com:sub" = "repo:mi-org/mi-repo:ref:refs/heads/main"
          }
        }
      }
    ]
  })
}

# Permisos del rol
resource "aws_iam_role_policy" "github_deploy" {
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::mi-app-prod",
          "arn:aws:s3:::mi-app-prod/*"
        ]
      },
      {
        Effect = "Allow"
        Action = "cloudfront:CreateInvalidation"
        Resource = "arn:aws:cloudfront::*:distribution/E1ABCDEF"
      }
    ]
  })
}
```

### 3. Workflow de GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

permissions:
  id-token: write    # CRÍTICO para OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy-mi-app
          aws-region: us-east-2

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://mi-app-prod/ \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html"

          # index.html con caché corto
          aws s3 cp dist/index.html s3://mi-app-prod/index.html \
            --cache-control "public, max-age=0, must-revalidate"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id E1ABCDEF \
            --paths "/index.html" "/"
```

## GitLab CI con OIDC

### 1. OIDC provider para GitLab

```hcl
resource "aws_iam_openid_connect_provider" "gitlab" {
  url             = "https://gitlab.com"
  client_id_list  = ["https://gitlab.com"]
  thumbprint_list = ["..."] # obtener de gitlab.com cert
}
```

### 2. Rol con trust

```hcl
resource "aws_iam_role" "gitlab_deploy" {
  name = "gitlab-deploy-mi-app"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.gitlab.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "gitlab.com:aud" = "https://gitlab.com"
          }
          StringLike = {
            "gitlab.com:sub" = "project_path:mi-org/mi-repo:ref_type:branch:ref:main"
          }
        }
      }
    ]
  })
}
```

### 3. `.gitlab-ci.yml`

```yaml
stages:
  - build
  - deploy

variables:
  AWS_DEFAULT_REGION: us-east-2
  AWS_ROLE_ARN: arn:aws:iam::123456789012:role/gitlab-deploy-mi-app

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: amazon/aws-cli:latest
  id_tokens:
    GITLAB_OIDC_TOKEN:
      aud: https://gitlab.com
  before_script:
    - >
      export $(printf "AWS_ACCESS_KEY_ID=%s AWS_SECRET_ACCESS_KEY=%s AWS_SESSION_TOKEN=%s"
      $(aws sts assume-role-with-web-identity
      --role-arn ${AWS_ROLE_ARN}
      --role-session-name "gitlab-${CI_PIPELINE_ID}"
      --web-identity-token ${GITLAB_OIDC_TOKEN}
      --duration-seconds 3600
      --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]'
      --output text))
  script:
    - aws s3 sync dist/ s3://mi-app-prod/ --delete
    - aws cloudfront create-invalidation --distribution-id E1ABCDEF --paths "/*"
  only:
    - main
```

## AWS CodePipeline + CodeBuild

Nativo de AWS. Útil si quieres todo en AWS o si trabajas con CodeCommit/CodeArtifact.

### Pipeline básico

```hcl
# CodeBuild project
resource "aws_codebuild_project" "build" {
  name         = "mi-app-build"
  service_role = aws_iam_role.codebuild.arn

  source {
    type = "CODEPIPELINE"
    buildspec = file("buildspec.yml")
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    type         = "LINUX_CONTAINER"
    image        = "aws/codebuild/standard:7.0"
    compute_type = "BUILD_GENERAL1_SMALL"
  }
}

# Pipeline
resource "aws_codepipeline" "main" {
  name     = "mi-app-pipeline"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"
    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source"]
      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = "mi-org/mi-repo"
        BranchName       = "main"
      }
    }
  }

  stage {
    name = "Build"
    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source"]
      output_artifacts = ["build"]
      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }

  stage {
    name = "Deploy"
    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ECS"
      version         = "1"
      input_artifacts = ["build"]
      configuration = {
        ClusterName = "mi-cluster"
        ServiceName = "mi-service"
        FileName    = "imagedefinitions.json"
      }
    }
  }
}
```

### `buildspec.yml`

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      java: corretto17
  pre_build:
    commands:
      - echo Login to ECR...
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
      - IMAGE_TAG=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
  build:
    commands:
      - echo Build Maven...
      - mvn clean package -DskipTests
      - echo Build Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Push to ECR...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - echo Write imagedefinitions.json
      - printf '[{"name":"app","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

## Jenkins

Si ya tienes Jenkins corriendo, usar el plugin AWS:

```groovy
pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-2'
        AWS_ACCOUNT_ID = '123456789012'
    }

    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Build Docker') {
            steps {
                script {
                    docker.build("mi-app:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Deploy') {
            steps {
                withAWS(role: 'arn:aws:iam::123456789012:role/jenkins-deploy', region: 'us-east-2') {
                    sh '''
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                        docker tag mi-app:$BUILD_NUMBER $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mi-app:$BUILD_NUMBER
                        docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mi-app:$BUILD_NUMBER
                        aws ecs update-service --cluster mi-cluster --service mi-service --force-new-deployment
                    '''
                }
            }
        }
    }
}
```

Si Jenkins corre en EC2/EKS dentro de AWS: asignar instance role en lugar de credenciales.

## Patrones avanzados

### Multi-environment deploy

```yaml
# GitHub Actions con environments
jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::DEV_ACCOUNT:role/github-deploy
      - run: ./deploy.sh

  deploy-prod:
    needs: deploy-dev
    runs-on: ubuntu-latest
    environment: prod   # requires manual approval (configurable en GitHub)
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::PROD_ACCOUNT:role/github-deploy
      - run: ./deploy.sh
```

### Deploy con aprobación manual

GitHub Environments con required reviewers — requiere aprobación humana antes de deploy a prod.

### Blue/green deployment

Con ECS y CodeDeploy: traffic shifting gradual entre versión vieja y nueva.

```hcl
resource "aws_codedeploy_app" "main" {
  compute_platform = "ECS"
  name             = "mi-app"
}

resource "aws_codedeploy_deployment_group" "main" {
  app_name              = aws_codedeploy_app.main.name
  deployment_group_name = "mi-app-deployment"
  service_role_arn      = aws_iam_role.codedeploy.arn

  deployment_config_name = "CodeDeployDefault.ECSLinear10PercentEvery1Minutes"

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  # ...
}
```

### Canary releases

Lambda alias con weighted routing (10% nueva versión, 90% vieja), incrementar gradualmente.

```bash
aws lambda update-alias \
  --function-name mi-funcion \
  --name PROD \
  --function-version 2 \
  --routing-config 'AdditionalVersionWeights={"1"=0.9}'
```

### Rollback automático

CloudWatch Alarm asociada al deployment. Si la alarma se dispara durante deployment → rollback automático.

```hcl
resource "aws_codedeploy_deployment_group" "main" {
  # ...
  alarm_configuration {
    alarms  = [aws_cloudwatch_metric_alarm.errors.alarm_name]
    enabled = true
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }
}
```

## Comparación

| Aspecto | GitHub Actions | GitLab CI | CodePipeline | Jenkins |
|---|---|---|---|---|
| **Setup** | Fácil | Fácil | Medio | Complejo |
| **Mantenimiento** | Cero (managed) | Cero (managed) | Cero (managed) | Tú lo mantienes |
| **Free tier** | 2000 min/mes priv | 400 min/mes priv | $1/pipeline-mes | Self-hosted |
| **OIDC** | ✅ | ✅ | N/A | Manual |
| **Integración AWS** | Via SDK | Via SDK | Nativa | Plugin |
| **UI** | Buena | Excelente | Funcional | Funcional |
| **Multi-cloud** | ✅ | ✅ | ❌ Solo AWS | ✅ |

### Recomendaciones

- **Default para projects nuevos**: GitHub Actions con OIDC
- **Si ya usas GitLab**: GitLab CI con OIDC
- **Si quieres todo en AWS**: CodePipeline (más para enterprises serias)
- **Si ya tienes Jenkins**: mantener Jenkins (no migrar solo porque)

## Buenas prácticas universales

### 1. Pipeline as code

- `.github/workflows/*.yml`
- `.gitlab-ci.yml`
- `Jenkinsfile`
- En el repo, versionado

### 2. Stages claras

```
Source → Build → Test → Security Scan → Deploy Dev → Deploy Staging → Approve → Deploy Prod
```

### 3. Security gates

- **SAST**: Semgrep, SonarQube
- **Dependency scanning**: Dependabot, Snyk
- **Container scanning**: Trivy, Grype, ECR scan on push
- **IaC scanning**: Checkov, tfsec
- **Secret scanning**: gitleaks, trufflehog

Bloquear merge si hay findings críticos.

### 4. Build caching

- npm/Maven/Gradle cache en CI
- Docker layer caching
- ahorra minutos y dinero en cada build

### 5. Artifacts inmutables

- Build una vez, deploy múltiples veces
- Tag de Docker image = commit SHA (no `latest`)
- Promote artifact entre environments

### 6. Notificaciones

- Slack/Discord/Teams en deploy success/failure
- PagerDuty/Opsgenie en failures de prod

### 7. Rollback rápido

- Mantener N versiones anteriores deployables
- Botón / comando de rollback
- Probado periódicamente

### 8. Limites de tiempo (timeouts)

- Job timeout (no infinito)
- Step timeout en operaciones críticas
- Approval timeout (auto-decline después de X horas)
