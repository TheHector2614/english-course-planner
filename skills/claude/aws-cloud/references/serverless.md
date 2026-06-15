# Serverless en AWS

Lambda, API Gateway, EventBridge, SQS, SNS, Step Functions.

## Cuándo elegir serverless

✅ **Buen ajuste**:
- APIs REST con tráfico variable o bajo
- Event-driven (procesar archivo subido a S3, mensaje SQS)
- Cron jobs
- Webhooks
- Procesamiento async (post-procesar uploads, generar PDFs)
- Spike traffic ocasional
- Costos por uso (pagas solo cuando ejecuta)

❌ **Mal ajuste**:
- Tráfico constante alto (sale más caro que ECS)
- Procesos largos (Lambda max 15 min)
- Conexiones persistentes (WebSockets sí pero con API GW WebSocket, no estándar)
- ML inference con modelos grandes (cold start largo)
- Apps que necesitan estado en memoria

## Lambda

### Conceptos básicos

- **Runtime**: lenguaje (Node.js 20, Python 3.12, Java 17/21, .NET 8, Go, Ruby)
- **Handler**: función entry point
- **Memory**: 128 MB - 10240 MB (afecta CPU también — más mem = más CPU)
- **Timeout**: max 15 min
- **Concurrency**: invocaciones paralelas, por default 1000/cuenta (soft limit)
- **Cold start**: primera invocación tarda más (init runtime + código)

### Pricing

- **Compute**: $0.0000166667 / GB-segundo
- **Requests**: $0.20 / millón
- **Free tier**: 1M requests + 400k GB-segundos / mes (siempre, no expira)

Para apps de tráfico moderado: free tier o muy poco costo. Ojo si pasas a millones de invocaciones.

### Hello World (Node.js)

```javascript
// handler.mjs
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from Lambda!' })
  };
};
```

### Hello World (Python)

```python
# handler.py
import json

def handler(event, context):
    print(f"Event: {json.dumps(event)}")

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'Hello from Lambda!'})
    }
```

### Hello World (Java con Spring Cloud Function)

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public Function<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> hello() {
        return event -> {
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            response.setBody("{\"message\":\"Hello from Lambda!\"}");
            return response;
        };
    }
}
```

Con **SnapStart** activado: cold starts de Spring Boot de 5-10s pasan a ~200ms.

### Cold start mitigation

| Técnica | Cómo |
|---|---|
| **Provisioned Concurrency** | N instances "calientes" siempre. Cuesta $0.0000041667/GB-segundo extra |
| **SnapStart** (Java) | Snapshot del estado inicializado. Gratis. Java 11/17/21 |
| **Lambda Warmer** (deprecado) | Pings periódicos. EventBridge schedule cada 5 min |
| **Minimal init** | Lazy load de dependencias pesadas |
| **Runtime adecuado** | Node/Python: cold start ~200-500ms. Java sin SnapStart: 2-10s. Go: muy rápido |
| **Tiered storage** | Layers para deps compartidas |

### Memory tuning

Más memoria = más CPU. A veces aumentar memoria reduce costos porque la función termina más rápido.

```bash
# AWS Lambda Power Tuning (open source)
# Prueba diferentes configuraciones y recomienda la óptima
```

Como regla: empezar con 512 MB, medir, ajustar.

### Environment variables

```hcl
resource "aws_lambda_function" "api" {
  function_name = "mi-api"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  memory_size   = 512
  timeout       = 10

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  role = aws_iam_role.lambda.arn

  environment {
    variables = {
      NODE_ENV       = "production"
      LOG_LEVEL      = "INFO"
      DATABASE_URL   = "..."  # NO secrets aquí
    }
  }

  tracing_config { mode = "Active" }  # X-Ray

  # VPC config solo si necesitas (cold starts más lentos)
  # vpc_config {
  #   subnet_ids         = aws_subnet.private[*].id
  #   security_group_ids = [aws_security_group.lambda.id]
  # }
}
```

**Secrets**: usar Secrets Manager o Parameter Store, no env vars hardcoded.

```javascript
// Cargar secret en el handler (con cache)
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});
let cachedSecret;

async function getSecret() {
  if (!cachedSecret) {
    const cmd = new GetSecretValueCommand({ SecretId: 'prod/api/db' });
    const res = await client.send(cmd);
    cachedSecret = JSON.parse(res.SecretString);
  }
  return cachedSecret;
}
```

Mejor: usar **Parameters and Secrets Lambda Extension** (cache automático).

### Triggers (eventos que invocan Lambda)

| Trigger | Caso |
|---|---|
| **API Gateway** | HTTP endpoints |
| **ALB** | HTTP con ALB delante |
| **EventBridge** | Cron jobs, eventos AWS, custom |
| **S3** | Archivo subido/borrado |
| **DynamoDB Streams** | Cambios en tabla |
| **SQS** | Mensaje en queue |
| **SNS** | Notificación |
| **Kinesis** | Streaming data |
| **Cognito** | Triggers de auth (pre-signup, post-confirm) |
| **CloudFront** | Lambda@Edge (cerca del usuario) |
| **Step Functions** | Tarea en workflow |

### Permisos IAM

Cada Lambda necesita un **execution role**:

```hcl
resource "aws_iam_role" "lambda" {
  name = "mi-api-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

# Logs (siempre necesario)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Permisos custom para acceder a S3, DDB, etc.
resource "aws_iam_role_policy" "lambda_custom" {
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:GetItem", "dynamodb:PutItem"]
        Resource = aws_dynamodb_table.orders.arn
      },
      {
        Effect = "Allow"
        Action = "secretsmanager:GetSecretValue"
        Resource = aws_secretsmanager_secret.db.arn
      }
    ]
  })
}
```

### Error handling

**Dead Letter Queue (DLQ)**: para eventos fallidos.

```hcl
resource "aws_lambda_function" "processor" {
  # ...
  dead_letter_config {
    target_arn = aws_sqs_queue.dlq.arn
  }
}
```

**Lambda Destinations** (más moderno): on-success y on-failure separados.

```hcl
resource "aws_lambda_function_event_invoke_config" "processor" {
  function_name = aws_lambda_function.processor.function_name

  destination_config {
    on_failure {
      destination = aws_sqs_queue.dlq.arn
    }
    on_success {
      destination = aws_sns_topic.processed.arn
    }
  }

  maximum_retry_attempts = 2
}
```

## API Gateway

### Tipos

| Tipo | Cuándo |
|---|---|
| **REST API** | Maduro, muchas features (auth, throttling, transformations). Más caro |
| **HTTP API** | Nuevo, más simple, 70% más barato, latencia menor |
| **WebSocket API** | Conexiones persistentes |

**Para nuevos proyectos**: HTTP API a menos que necesites features específicos de REST API (request transformations, API keys complejas, etc.).

### Pricing

- **HTTP API**: $1/M requests (primer 300M); luego más barato
- **REST API**: $3.50/M requests

### Setup HTTP API con Lambda

```hcl
resource "aws_apigatewayv2_api" "main" {
  name          = "mi-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://app.example.com"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      path           = "$context.path"
      status         = "$context.status"
      latency        = "$context.responseLatency"
      userAgent      = "$context.identity.userAgent"
    })
  }
}

# Integración con Lambda
resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn

  payload_format_version = "2.0"
}

# Rutas
resource "aws_apigatewayv2_route" "get_orders" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /orders"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "create_order" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /orders"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Permiso para que API Gateway invoque Lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Custom domain
resource "aws_apigatewayv2_domain_name" "main" {
  domain_name = "api.example.com"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  domain_name = aws_apigatewayv2_domain_name.main.id
  stage       = aws_apigatewayv2_stage.prod.id
}
```

### Authorizers

```hcl
# JWT Authorizer (Cognito, Auth0, etc.)
resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "jwt-authorizer"

  jwt_configuration {
    audience = ["api-client"]
    issuer   = "https://cognito-idp.us-east-2.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# Aplicar a rutas
resource "aws_apigatewayv2_route" "protected" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /me"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}
```

## SAM (Serverless Application Model)

Si todo tu proyecto es serverless, SAM simplifica la definición. Es CloudFormation con macros para Lambda/API GW.

### `template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: nodejs20.x
    Tracing: Active
    Environment:
      Variables:
        LOG_LEVEL: INFO
    Tags:
      Project: mi-app
      Environment: prod

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: handler.handler
      Events:
        GetOrders:
          Type: HttpApi
          Properties:
            Path: /orders
            Method: GET
            ApiId: !Ref Api
        CreateOrder:
          Type: HttpApi
          Properties:
            Path: /orders
            Method: POST
            ApiId: !Ref Api
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable

  Api:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins:
          - https://app.example.com
        AllowMethods:
          - GET
          - POST
        AllowHeaders:
          - Content-Type
          - Authorization

  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH

Outputs:
  ApiEndpoint:
    Value: !Sub https://${Api}.execute-api.${AWS::Region}.amazonaws.com
```

### Comandos

```bash
sam build              # empaqueta
sam local invoke       # test local
sam local start-api    # API local
sam deploy --guided    # primera vez
sam deploy             # siguientes
sam delete             # borra todo
sam logs -n ApiFunction --tail  # logs en vivo
```

## EventBridge (eventos)

Bus de eventos. Permite arquitecturas event-driven.

### Casos

- Cron jobs (más flexible que cron Lambda)
- Reaccionar a eventos AWS (auto-scaling, EC2 state change, etc.)
- Eventos custom entre microservicios

### Cron job

```hcl
resource "aws_cloudwatch_event_rule" "daily" {
  name                = "daily-cleanup"
  schedule_expression = "cron(0 2 * * ? *)"  # 2 AM UTC todos los días
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.daily.name
  target_id = "cleanup-lambda"
  arn       = aws_lambda_function.cleanup.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily.arn
}
```

### Custom event bus

```hcl
resource "aws_cloudwatch_event_bus" "app" {
  name = "mi-app-events"
}

# Publicar desde código:
# aws events put-events --entries Source=mi-app,DetailType="OrderCreated",Detail='{...}'
```

## SQS (queues)

### Tipos

- **Standard**: at-least-once, no ordenado. Mayor throughput.
- **FIFO**: exactly-once, ordenado. Menor throughput, más costoso.

### Setup

```hcl
resource "aws_sqs_queue" "orders" {
  name                       = "orders-queue"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB max
  message_retention_seconds  = 1209600 # 14 días
  receive_wait_time_seconds  = 20      # long polling
  visibility_timeout_seconds = 30      # importante: > timeout de la Lambda

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "dlq" {
  name                      = "orders-dlq"
  message_retention_seconds = 1209600
}

# Lambda consumiendo de SQS
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = aws_sqs_queue.orders.arn
  function_name    = aws_lambda_function.order_processor.arn
  batch_size       = 10
  maximum_batching_window_in_seconds = 5
}
```

### Anti-patterns

- ❌ Visibility timeout < Lambda timeout → mensaje se procesa múltiples veces
- ❌ Sin DLQ → mensajes fallan en silencio
- ❌ Batch size 1 cuando podrías procesar lotes (más caro y lento)
- ❌ FIFO cuando no necesitas orden (FIFO es más caro)

## SNS (pub/sub)

### Setup

```hcl
resource "aws_sns_topic" "notifications" {
  name = "user-notifications"
}

# Suscripciones múltiples
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "email"
  endpoint  = "admin@example.com"
}

resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.email_sender.arn
}

resource "aws_sns_topic_subscription" "sqs" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notifications.arn
}
```

### Fan-out pattern: SNS → SQS

Publicar a SNS, múltiples SQS suscritas. Cada suscriptor procesa a su ritmo.

## Step Functions (orquestación)

Para workflows con múltiples pasos.

### Cuándo

- Procesos con múltiples Lambdas en secuencia/paralelo
- Workflows con retries, branches, errors handling
- ETL pipelines
- Sagas (transacciones distribuidas)
- Procesos de larga duración (hasta 1 año!)

### Ejemplo: procesamiento de orden

```json
{
  "Comment": "Order processing workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:function:validate-order",
      "Next": "ProcessPayment",
      "Catch": [{
        "ErrorEquals": ["ValidationError"],
        "Next": "RejectOrder"
      }]
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:function:process-payment",
      "Retry": [{
        "ErrorEquals": ["PaymentTimeoutError"],
        "MaxAttempts": 3,
        "IntervalSeconds": 2,
        "BackoffRate": 2
      }],
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "RefundCustomer"
      }],
      "Next": "FulfillOrder"
    },
    "FulfillOrder": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "UpdateInventory",
          "States": { "UpdateInventory": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:...:function:update-inventory",
            "End": true
          }}
        },
        {
          "StartAt": "SendEmail",
          "States": { "SendEmail": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:...:function:send-email",
            "End": true
          }}
        }
      ],
      "End": true
    },
    "RejectOrder": { "Type": "Pass", "End": true },
    "RefundCustomer": { "Type": "Task", "Resource": "...", "End": true }
  }
}
```

### Tipos

- **Standard**: hasta 1 año, $0.025/1000 state transitions
- **Express**: hasta 5 min, $1.00/M requests + duración. Para high-throughput

## Trampas comunes serverless

- ❌ Lambda con VPC innecesario (cold starts ↑)
- ❌ Lambda timeout muy bajo (perdida de invocaciones)
- ❌ SQS visibility timeout < Lambda timeout
- ❌ No usar provisioned concurrency cuando se necesita baja latencia consistente
- ❌ Cargar conexiones DB en cada invocación (sin reuse en handlers)
- ❌ Sin RDS Proxy si Lambda + RDS (agota conexiones)
- ❌ Logs verbosos sin retention
- ❌ Sin Dead Letter Queue para fallos async
- ❌ Try/catch tragándose errores (sin loguear ni alertar)
- ❌ Lambda haciendo polling de SQS (usar event source mapping, no `receiveMessage` loop)
- ❌ Lambda con bundle gigante (cold start lento)
- ❌ Java/.NET sin warm-up consideration

## Checklist serverless

- [ ] Función con permisos IAM mínimos
- [ ] Timeout apropiado al caso
- [ ] Memory ajustado (medido, no asumido)
- [ ] Dead Letter Queue o Destinations
- [ ] Tracing X-Ray habilitado
- [ ] Logs con retention configurada
- [ ] Secrets en Secrets Manager, no env vars
- [ ] Custom domain en API Gateway
- [ ] WAF en API Gateway si público
- [ ] Throttling configurado
- [ ] CORS configurado correctamente
- [ ] Authorizer en endpoints protegidos
- [ ] Cold start mitigation si latencia crítica (Provisioned Concurrency o SnapStart)
- [ ] Alarms en errores y duración
