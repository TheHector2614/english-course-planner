---
name: aws-cloud
description: Skill mixta completa para infraestructura en AWS - diseño de arquitectura, Infrastructure as Code (Terraform, CDK TypeScript/Python, CloudFormation/SAM), deployment de apps Angular/Astro/Java, auditoría y optimización (Well-Architected Framework), operaciones (CloudWatch, alerting), y FinOps. Explica el "por qué" de cada decisión para usuarios principiantes. Activa esta skill SIEMPRE que el usuario mencione "AWS", "S3", "Lambda", "EC2", "ECS", "EKS", "RDS", "DynamoDB", "VPC", "CloudFront", "Route 53", "IAM", "API Gateway", "Terraform", "CDK", "CloudFormation", "SAM", "serverless", "cloud", "deploy a la nube", "infraestructura", "IaC", "subir mi app a AWS", "configurar AWS", "cuenta de AWS", "arquitectura cloud", o pida desplegar/migrar/escalar/auditar/optimizar cualquier app en AWS. También cuando hable de CloudWatch, monitoring de AWS, costos de AWS, FinOps, o multi-account/Organizations. SIEMPRE buscar en docs.aws.amazon.com para verificar precios actuales, features nuevos, o límites antes de afirmar.
---

# AWS Cloud Infrastructure

Skill mixta completa para AWS orientada a aprendizaje progresivo. Cubre diseño, IaC, deployment, auditoría, operaciones y FinOps.

## Principios de la skill (importantes)

### 1. Enseñar mientras trabaja

El usuario es principiante. Por cada decisión técnica:
- **Explicar el "por qué"** brevemente, no solo el "cómo"
- Mencionar **alternativas** y por qué se eligió esta
- Aclarar **términos AWS** la primera vez que aparecen ("VPC = Virtual Private Cloud, la red privada de tu cuenta")
- Avisar de **trampas comunes** antes de que las pise

### 2. Empezar simple, escalar después

Nunca proponer arquitecturas complejas si una simple basta:
- ✅ Empezar con S3 + CloudFront para sitio estático antes de proponer ECS
- ✅ Una región hasta que el caso justifique multi-región
- ✅ Una cuenta hasta que el equipo justifique multi-account
- ❌ NO proponer Kubernetes para un proyecto que cabe en Lambda
- ❌ NO sugerir microservicios cuando un monolito funciona bien

### 3. Verificar info actualizada con web_search

El conocimiento de Claude tiene cutoff de **enero 2026**. AWS lanza features semanalmente. Para:

- **Precios** (siempre cambian) → `web_search` o `web_fetch` a `https://aws.amazon.com/pricing/`
- **Features nuevos** o **disponibilidad regional** → buscar en `https://docs.aws.amazon.com/`
- **Límites de servicio** (cuotas) → verificar docs oficiales
- **Best practices recientes** → Well-Architected Framework actualizado

Hacerlo **proactivamente** sin pedir permiso. El usuario espera información correcta.

### 4. Estimar costos SIEMPRE antes de desplegar

Antes de generar IaC o ejecutar comandos que crean recursos:

1. Identificar qué recursos se van a crear
2. **Buscar precios actuales** con `web_search` si no son obvios
3. Calcular **estimación mensual** con supuestos claros (tráfico, almacenamiento, etc.)
4. Identificar recursos que tienen **free tier**
5. Advertir sobre recursos con costos sorpresa (NAT Gateway, data transfer, logs sin retención)

### 5. Seguridad por defecto (integrar con `web-backend-security`)

Toda arquitectura/IaC generada incluye:
- IAM con least privilege (nunca `*` en permisos)
- Encriptación at-rest (S3, EBS, RDS, etc.)
- TLS en endpoints públicos
- Secrets en Secrets Manager o Parameter Store (NUNCA en variables de entorno hardcoded)
- VPC con subredes públicas/privadas correctamente separadas
- CloudTrail habilitado
- Default deny en Security Groups

Si la otra skill (`web-backend-security`) aplica, mencionarlo y aplicarla.

### 6. Confirmar antes de operaciones destructivas

Si la skill puede ejecutar comandos (a través de CLI/agentes futuros), **confirmar siempre** antes de:
- Borrar recursos
- Modificar políticas IAM existentes
- Cambiar configuración de VPC
- Operaciones con factura > $0 inesperada
- Cualquier operación sobre cuenta de producción

## Decisiones iniciales (las preguntas correctas al empezar un proyecto)

Cuando el usuario empieza un proyecto AWS, hacer estas preguntas si no están claras:

### ¿Qué tipo de carga es?
- **Sitio estático** (HTML, Angular SPA, Astro estático) → S3 + CloudFront
- **App con backend dinámico** → Lambda + API Gateway (serverless) o ECS Fargate (contenedores)
- **App de larga duración con sockets/streaming** → ECS Fargate o EC2
- **Procesamiento batch/ETL** → Step Functions + Lambda, Batch, EMR
- **Backend Java/Spring Boot** → ECS Fargate (default), Beanstalk (más fácil), o Lambda con SnapStart

### ¿Qué región?

Ver `references/region-selection.md` para guía completa. Reglas rápidas:

- **Default razonable**: `us-east-1` (más servicios, precios más bajos, mejor disponibilidad de features)
- **Latencia a Colombia**: `us-east-1` ≈ 70ms, `us-east-2` ≈ 80ms (similar), `sa-east-1` ≈ 130ms (peor para Colombia)
- **Compliance LATAM** (datos deben quedarse en LATAM): `sa-east-1` (São Paulo)
- **Multi-región** solo si: hay DR riguroso requerido, latencia crítica multi-continental, o compliance lo exige

⚠️ **Advertencia importante**: `us-east-1` históricamente ha tenido outages que afectan servicios globales. Para producción crítica, considerar `us-east-2` o `us-west-2`.

### ¿Una o varias cuentas AWS?

Recomendación según tamaño:

| Tamaño/madurez | Recomendación |
|---|---|
| **Hobby / aprendizaje / prototipo** | Una cuenta, todo junto |
| **Side project / freelance pequeño** | Una cuenta con tags por proyecto |
| **Producto real con clientes** | 2 cuentas: dev (test) + prod |
| **Equipo de varios devs / clientes grandes** | 3+ cuentas: dev, staging, prod |
| **Empresa / multi-team** | AWS Organizations con OU's: Security, Sandbox, Workloads (dev/staging/prod), Logs |

**Recomendación para alguien empezando**: una sola cuenta hasta que tengas algo en producción. Después saltar a 2 cuentas (dev + prod). Después Organizations cuando haya equipo.

Detalles en `references/account-strategy.md`.

### ¿Qué herramienta de IaC?

Según el proyecto y tu comodidad:

| Herramienta | Cuándo |
|---|---|
| **Terraform** | Multi-cloud, equipos grandes, ecosistema más maduro |
| **AWS CDK (TypeScript)** | Devs TypeScript/JS, programación real (loops, condicionales), proyectos AWS-only |
| **AWS CDK (Python)** | Devs Python, proyectos AWS-only |
| **CloudFormation/SAM** | Apps serverless simples, sin querer aprender otra herramienta |
| **Consola** | Aprendizaje, prototipos rápidos. **No usar para prod**. |

Para alguien que empieza: **CDK TypeScript** si conoces TS, **Terraform** si planeas escalar a multi-cloud o gran equipo, **SAM** si es 100% serverless simple.

Detalles + cuándo elegir cada uno en `references/iac-comparison.md`.

## Servicios core que debes conocer

Tabla rápida; el usuario no necesita memorizar pero debe reconocer:

| Categoría | Servicios | Para qué |
|---|---|---|
| **Compute** | EC2, Lambda, ECS, EKS, Fargate, Beanstalk | Correr código |
| **Storage** | S3, EBS, EFS, FSx | Guardar archivos |
| **Database** | RDS, Aurora, DynamoDB, ElastiCache, OpenSearch | Datos estructurados/no |
| **Networking** | VPC, ALB, NLB, CloudFront, Route 53, API Gateway | Conectividad |
| **Security** | IAM, KMS, Secrets Manager, WAF, Shield, GuardDuty | Auth, encriptación, defensa |
| **Observability** | CloudWatch, X-Ray, CloudTrail | Logs, métricas, trazas, audit |
| **Integration** | SQS, SNS, EventBridge, Step Functions | Mensajería y orquestación |
| **Developer tools** | CodePipeline, CodeBuild, CodeDeploy, CodeCommit | CI/CD nativo |

Detalles por categoría en archivos de referencia.

## Flujos de trabajo

### Flujo A — "Quiero desplegar mi app X a AWS"

1. **Identificar el stack** del usuario (Angular/Astro/Java/etc.). Si tiene una de las otras skills, mencionar la integración
2. **Diseño**: proponer arquitectura simple primero
3. **Estimación de costos** (con `web_search` de precios actuales)
4. **Confirmar región** y cuenta(s)
5. **Generar IaC** con la herramienta elegida
6. **CI/CD pipeline** para deploys automáticos
7. **Observability**: CloudWatch logs + métricas básicas + alarmas críticas
8. **Seguridad**: aplicar `web-backend-security` para hardening
9. **Runbook** básico: cómo verificar que funciona, cómo hacer rollback

### Flujo B — "Audita mi infra AWS actual"

1. Solicitar acceso al código IaC o describir lo desplegado
2. Aplicar **Well-Architected Framework** (`references/well-architected.md`):
   - Operational Excellence
   - Security
   - Reliability
   - Performance Efficiency
   - Cost Optimization
   - Sustainability
3. Reportar hallazgos por pillar con severidad
4. Estimar **costos actuales vs optimizados**
5. Plan de acción priorizado

### Flujo C — "Diseña arquitectura para X"

1. Entender requisitos: tráfico esperado, latencia, disponibilidad, presupuesto, compliance
2. Proponer **2-3 opciones** con trade-offs (simple/medio/avanzado)
3. Comparar **costos** de cada una
4. Recomendar la más adecuada con justificación
5. Diagramar (usar `Figma:generate_diagram` para flowchart o `visualize:show_widget` para diagrama)
6. Esperar confirmación antes de generar IaC

### Flujo D — "Mi factura de AWS subió, ¿por qué?"

1. Pedir acceso a Cost Explorer o screenshots
2. Identificar top servicios por costo
3. Aplicar checklist de **FinOps** (`references/finops.md`):
   - Recursos no usados (EC2 idle, EBS huérfanos, snapshots viejos)
   - Sobre-aprovisionamiento (RIGHT-sizing)
   - Data transfer (causa común de costos sorpresa)
   - NAT Gateway por horas (cara, alternativas)
   - Logs sin retención (CloudWatch puede ser caro)
   - Almacenamiento en clase incorrecta (S3 Standard vs IA/Glacier)
4. Plan de acción con ahorro estimado

### Flujo E — "Algo no funciona, ayúdame a debuggear"

1. Recopilar info: servicio, mensaje de error, qué cambió recientemente
2. **CloudWatch Logs** primero (el 80% de los problemas se ven ahí)
3. Si es networking: VPC Reachability Analyzer, Security Groups, NACLs, route tables
4. Si es IAM: AWS IAM Policy Simulator, CloudTrail
5. Si es performance: X-Ray, CloudWatch Metrics
6. Sugerir runbook de diagnóstico documentado

## Patterns por stack del usuario

### Angular SPA

**Arquitectura recomendada (simple)**:
- Build en CI → upload a **S3** (con `aws s3 sync`)
- **CloudFront** delante para CDN + HTTPS + caching
- **Route 53** para DNS custom
- **ACM** para certificado SSL gratis
- Tiempo total: 30-60 min. Costo: < $1/mes con tráfico bajo

Detalles + IaC en `references/deploy-angular.md`.

### Astro

Si es **estático** (la mayoría de landings): igual que Angular SPA (S3 + CloudFront).

Si tiene **SSR**:
- Opción simple: **AWS Amplify Hosting** (managed)
- Opción serverless: **Lambda@Edge** o **CloudFront Functions** con el handler de Astro
- Opción contenedor: **App Runner** o **ECS Fargate**

Detalles en `references/deploy-astro.md`.

### Java / Spring Boot

Decisión clave: **contenedor o serverless**.

| Opción | Cuándo |
|---|---|
| **Lambda con SnapStart** | API REST simple, tráfico variable, optimización de costos por uso |
| **ECS Fargate** | App con tráfico constante, sockets, jobs largos. **Recomendado para Spring Boot típico** |
| **EKS** | Solo si ya tienes equipo K8s o requisitos muy específicos |
| **Beanstalk** | Aprendizaje rápido, gestión automática (pero menos control) |
| **App Runner** | Container managed, fácil setup |

Stack típico para Spring Boot productivo:
- Imagen Docker en **ECR**
- **ECS Fargate** con servicio + ALB delante
- **RDS PostgreSQL** (preferir Aurora para prod serio)
- **Secrets Manager** para DB credentials y JWT secret
- **CloudWatch Logs** + Container Insights
- **CodePipeline** o GitHub Actions para deploy

Detalles + IaC en `references/deploy-java-spring.md`.

## CI/CD según herramienta

La Skill genera workflows para la herramienta que uses:

| Tool | Detalles |
|---|---|
| **GitHub Actions** | Recomendado para la mayoría. Setup con OIDC para auth sin keys |
| **GitLab CI** | Si ya usas GitLab. Setup similar con OIDC |
| **AWS CodePipeline + CodeBuild** | Si quieres todo en AWS, integración nativa con CodeStar Connections |
| **Jenkins** | Si ya tienes Jenkins corriendo |

**Recomendación universal**: usar **OIDC** (no keys de larga duración) para autenticar el CI con AWS. Ver `references/cicd-patterns.md`.

## Referencias

Para profundizar:

- `references/iac-comparison.md` — Terraform vs CDK vs CloudFormation/SAM, cuándo usar cada uno + ejemplos
- `references/region-selection.md` — guía para elegir región (latencia, costos, compliance)
- `references/account-strategy.md` — single account vs multi-account vs Organizations
- `references/well-architected.md` — 6 pilares con checks concretos
- `references/finops.md` — optimización de costos, reservas, savings plans, anti-patterns
- `references/security-defaults.md` — IAM least privilege, encriptación, VPC segura (complemento de `web-backend-security`)
- `references/observability.md` — CloudWatch (logs, metrics, alarms), X-Ray, dashboards
- `references/networking.md` — VPC, subnets, ALB/NLB/CloudFront, Route 53
- `references/serverless.md` — Lambda, API Gateway, Step Functions, SAM
- `references/containers.md` — ECR, ECS Fargate, EKS, App Runner
- `references/databases.md` — RDS, Aurora, DynamoDB, ElastiCache; cuándo cada uno
- `references/deploy-angular.md` — patrón S3 + CloudFront completo con IaC
- `references/deploy-astro.md` — patrón Astro (estático y SSR)
- `references/deploy-java-spring.md` — Spring Boot a ECS Fargate completo
- `references/cicd-patterns.md` — GitHub Actions, GitLab CI, CodePipeline con OIDC

## Trampas comunes a advertir (importantes para principiantes)

Mencionar estas trampas **proactivamente** según corresponda:

### Costos sorpresa

1. **NAT Gateway**: ~$0.045/hora + $0.045/GB procesado. En LATAM puede ser >$40/mes solo por horas. Alternativa: NAT Instance (más manual), o no usar subnets privadas si no es estrictamente necesario para una app pequeña.
2. **Data transfer out**: $0.09/GB en us-east-1 saliendo a internet. Una app con 100GB/mes = $9 extra. Inter-AZ también cuesta.
3. **CloudWatch Logs sin retention**: por default guarda **para siempre**. Set retention a 7-30 días según necesidad.
4. **EBS snapshots olvidados**: se acumulan. Lifecycle policy obligatorio.
5. **Idle EC2/RDS** sin auto-stop fuera de horario laboral en dev.
6. **S3 versioning + no lifecycle**: versiones viejas se acumulan, factura crece.
7. **CloudFront sin caché correcto**: cada request va al origin = caro y lento.
8. **VPC Endpoints**: si no los usas, los servicios AWS van por NAT (caro). Si los usas, también cuestan pero menos.

### Seguridad

1. **Buckets S3 públicos por accidente**: tener Block Public Access habilitado por default
2. **IAM users con access keys**: preferir roles. Si necesitas keys: rotar y limitar permisos
3. **Security Groups con `0.0.0.0/0`**: solo para HTTPS/HTTP públicos. NUNCA en SSH/RDP/DB
4. **Credenciales en `.env`**: usar Secrets Manager o Parameter Store
5. **Sin MFA en root account**: lo PRIMERO al crear la cuenta
6. **Region wrong**: desplegar en `us-east-1` y olvidar que la consola estaba en otra región (recursos invisibles)

### Operativos

1. **No tagging**: imposible saber de qué proyecto/dueño es cada recurso. Adoptar tagging desde día 1
2. **Sin alertas de billing**: configurar alarma a $X de gasto mensual
3. **Eliminar VPC default sin pensar**: rompe AWS Lambda y otros servicios. Mejor dejarla
4. **Cambios desde consola en infra IaC**: drift. Hacer todo desde IaC o documentar excepciones
5. **No usar dev cuenta**: pruebas destructivas en prod. Separar cuentas o al menos environments

## Output esperado

Cuando se completa un flujo:

1. **Código IaC** en `/mnt/user-data/outputs/<nombre>/` con estructura clara
2. **README.md** con:
   - Qué se despliega
   - Pre-requisitos (AWS CLI, herramienta IaC, MFA en cuenta)
   - Comandos de deploy paso a paso
   - Estimación de costos mensual
   - Cómo destruir (importante para evitar facturas inesperadas)
3. **Diagrama** de arquitectura (usar `visualize:show_widget` para diagrama o `Figma:generate_diagram`)
4. **Checklist de post-deploy**: verificar HTTPS, alertas configuradas, MFA en cuenta, etc.

## Lo que NUNCA hay que hacer

- ❌ Generar IaC sin estimar costos antes
- ❌ Sugerir arquitectura compleja cuando una simple basta
- ❌ Hardcodear secrets en IaC o variables de entorno commiteadas
- ❌ Permisos IAM con `Action: "*"` o `Resource: "*"` sin justificación
- ❌ Security Groups con `0.0.0.0/0` en puertos no-HTTP/HTTPS
- ❌ Crear recursos en prod sin confirmación
- ❌ Asumir que precios o features son los mismos que en mi cutoff (siempre buscar)
- ❌ Olvidar cleanup/destroy en proyectos de aprendizaje
- ❌ Saltarse tagging
- ❌ Saltarse CloudTrail / billing alerts
- ❌ Decir "es serverless" como sinónimo de "es gratis"
- ❌ Recomendar EKS para un proyecto que cabe en App Runner o ECS Fargate
- ❌ Usar la región más lejana del usuario "porque es la default"
