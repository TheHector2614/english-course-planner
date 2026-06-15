# API Documentation

OpenAPI, ejemplos, Swagger UI, GraphQL.

## Principios

1. **Ejemplos reales**, no placeholders (`{ "key": "value" }` no enseña nada)
2. **Errores documentados** con códigos y razones
3. **Autenticación clara** desde el inicio
4. **Versionado explícito** y política de cambios
5. **Sincronizada con el código** (idealmente generada)
6. **Múltiples lenguajes** en ejemplos cuando aplica

## OpenAPI (REST APIs)

OpenAPI 3.1 es el estándar. Reemplaza Swagger 2.0.

### Estructura mínima

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: |
    Lo que hace esta API y para quién es.
  contact:
    name: API Team
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

security:
  - BearerAuth: []

paths:
  /orders:
    get:
      summary: List orders
      description: Lista las órdenes del usuario autenticado.
      operationId: listOrders
      tags: [Orders]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, paid, shipped, delivered, cancelled]
          example: pending
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: cursor
          in: query
          schema:
            type: string
          description: Cursor de paginación (de respuesta previa)
      responses:
        '200':
          description: Lista de órdenes
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderList'
              example:
                items:
                  - id: ord_01H8KPQR9V
                    customer_id: cus_01H8KPQR9V
                    total: "99.99"
                    currency: USD
                    status: paid
                    created_at: "2026-05-19T14:23:45Z"
                next_cursor: "eyJpZCI6Im9yZF8wMUg4S1BR..."
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'

    post:
      summary: Create order
      operationId: createOrder
      tags: [Orders]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreate'
            example:
              customer_id: cus_01H8KPQR9V
              items:
                - product_id: prd_01H8KPQR9V
                  quantity: 2
              shipping_address:
                line1: Calle 100 # 15-20
                city: Bogotá
                country: CO
                postal_code: "110111"
      responses:
        '201':
          description: Orden creada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Order:
      type: object
      required: [id, customer_id, total, currency, status, created_at]
      properties:
        id:
          type: string
          pattern: '^ord_[A-Z0-9]{12}$'
          example: ord_01H8KPQR9V
        customer_id:
          type: string
          example: cus_01H8KPQR9V
        total:
          type: string
          description: Decimal as string para evitar pérdida de precisión
          example: "99.99"
        currency:
          type: string
          enum: [USD, EUR, COP, MXN]
        status:
          type: string
          enum: [pending, paid, shipped, delivered, cancelled]
        created_at:
          type: string
          format: date-time
          example: "2026-05-19T14:23:45Z"

    OrderList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Order'
        next_cursor:
          type: string
          nullable: true
          description: Para siguiente página, o null si es la última

    OrderCreate:
      type: object
      required: [customer_id, items]
      properties:
        customer_id:
          type: string
        items:
          type: array
          minItems: 1
          items:
            type: object
            required: [product_id, quantity]
            properties:
              product_id:
                type: string
              quantity:
                type: integer
                minimum: 1

    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          example: validation_failed
        message:
          type: string
          example: customer_id is required
        details:
          type: object

  responses:
    Unauthorized:
      description: Token inválido o ausente
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: unauthorized
            message: Invalid or missing token

    ValidationError:
      description: Datos inválidos
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: validation_failed
            message: customer_id is required
            details:
              field: customer_id
              reason: missing

    RateLimited:
      description: Demasiadas solicitudes
      headers:
        Retry-After:
          schema:
            type: integer
          description: Segundos a esperar
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

### Generar desde código vs escribir manual

**Generar desde código** (recomendado para APIs internas):

| Stack | Tool |
|---|---|
| Spring Boot (Java) | springdoc-openapi |
| NestJS | @nestjs/swagger |
| FastAPI (Python) | Built-in |
| Django REST | drf-spectacular |
| Express (Node) | swagger-jsdoc, tsoa |
| Go | swaggo/swag, oapi-codegen |
| .NET | Swashbuckle |

**Pros**: siempre sincronizado, less work.
**Cons**: anotaciones repetitivas, harder para ejemplos ricos.

**Escribir manual** (recomendado para APIs públicas serias):

**Pros**: control total, mejor narrativa, ejemplos cuidados.
**Cons**: deriva con el código si no hay disciplina.

**Híbrido (mejor de ambos)**:
1. Generar esqueleto desde código
2. Aumentar con ejemplos, descriptions ricos, errores específicos
3. Validar en CI que coincide con behavior real (contract testing)

### Convenciones de naming

```
✅ Nombres descriptivos
✅ Plural para colecciones: /orders, /users
✅ Singular para resources individuales: /orders/{id}
✅ snake_case en JSON o camelCase (consistente)
✅ Verbos HTTP correctos:
   GET    /orders        → list
   GET    /orders/{id}   → get one
   POST   /orders        → create
   PATCH  /orders/{id}   → update partial
   PUT    /orders/{id}   → replace
   DELETE /orders/{id}   → delete
```

### Errores: formato consistente

**Recomendado**: [Problem Details (RFC 7807)](https://www.rfc-editor.org/rfc/rfc7807) o variante propia consistente.

```json
{
  "code": "validation_failed",
  "message": "El campo 'email' es requerido",
  "details": {
    "field": "email",
    "reason": "missing"
  },
  "trace_id": "abc123def456"
}
```

Headers útiles:
- `X-Request-Id` o `X-Trace-Id`: para correlacionar con logs
- `Retry-After` en 429/503

### Versionado

3 estrategias comunes:

| Estrategia | Ejemplo | Pros | Cons |
|---|---|---|---|
| **URL** | `/v1/orders` | Visible, fácil cache | Difícil mantener varias versiones |
| **Header** | `Accept: application/vnd.api.v1+json` | URL limpia | Menos visible |
| **Query param** | `/orders?version=1` | Simple | "Sucia" |

Default: **URL** (`/v1/`). Simple, cacheable, claro.

**Política de breaking changes** (documentar explícitamente):
- ¿Cuándo se rompe contrato? (nuevo MAJOR)
- ¿Cuánto tiempo se mantiene la versión vieja?
- ¿Cómo se anuncian deprecations?

Deprecation con header:
```
Deprecation: true
Sunset: Wed, 11 Nov 2026 23:59:59 GMT
Link: <https://api.example.com/v2/orders>; rel="successor-version"
```

### Paginación

Tres estilos comunes:

**Offset/limit** (simple, lento en deep pagination):
```
GET /orders?offset=100&limit=20
```

**Page-based** (intuitivo, mismas limitaciones):
```
GET /orders?page=5&page_size=20
```

**Cursor** (recomendado para grandes datasets):
```
GET /orders?cursor=eyJpZCI6Im9yZF8...&limit=20

Response:
{
  "items": [...],
  "next_cursor": "eyJpZCI6Im9yZF8..."
}
```

Documentar siempre los límites máximos (`max_page_size`, etc.).

### Rate limiting

Headers estándar:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000000
Retry-After: 60
```

Documentar:
- Límites por endpoint o globales
- Diferencias por tier (free/pro)
- Comportamiento al exceder (429)
- Cómo solicitar aumento

## Tools para servir la documentación

### Swagger UI

Render interactivo del OpenAPI spec.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: "/openapi.yaml", dom_id: '#swagger-ui' });
  </script>
</body>
</html>
```

### Redoc

Más profesional, mejor para APIs públicas serias.

```html
<!DOCTYPE html>
<html>
<body>
  <redoc spec-url="/openapi.yaml"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

Genera HTML estático:
```bash
npx @redocly/cli build-docs openapi.yaml -o docs/api.html
```

### Stoplight Elements

Otra opción profesional, con interactividad.

### Comparación

| Tool | Cuándo |
|---|---|
| **Swagger UI** | Default, "try it out" interactivo |
| **Redoc** | API pública, mejor estética, sin "try it" |
| **Stoplight Elements** | Profesional con try-it, branding personalizable |
| **Mintlify, Bump.sh** | SaaS, branding completo |

## Ejemplos en múltiples lenguajes

Para SDKs/APIs públicas, mostrar mismo request en:
- cURL
- JavaScript (fetch)
- Python (requests)
- Java o Go (según audiencia)

OpenAPI 3 soporta `x-codeSamples`:

```yaml
paths:
  /orders:
    post:
      x-codeSamples:
        - lang: cURL
          source: |
            curl -X POST https://api.example.com/v1/orders \
              -H "Authorization: Bearer $TOKEN" \
              -H "Content-Type: application/json" \
              -d '{"customer_id":"cus_..."}'
        - lang: JavaScript
          source: |
            const response = await fetch('https://api.example.com/v1/orders', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ customer_id: 'cus_...' })
            });
        - lang: Python
          source: |
            import requests
            response = requests.post(
              'https://api.example.com/v1/orders',
              headers={'Authorization': f'Bearer {token}'},
              json={'customer_id': 'cus_...'}
            )
```

## GraphQL

Las APIs GraphQL son auto-documentadas con introspection. Aún así:

### Schema + descriptions

```graphql
"""
Una orden de compra.
"""
type Order {
  """
  Identificador único de la orden.
  Formato: ord_XXXXXXXXXXXX
  """
  id: ID!

  """
  Items de la orden. Al menos 1.
  """
  items: [OrderItem!]!

  """
  Status actual. Ver OrderStatus para valores posibles.
  """
  status: OrderStatus!
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

type Query {
  """
  Obtiene una orden por ID.
  Requiere scope: orders:read
  """
  order(id: ID!): Order
}
```

### Tools GraphQL

- **GraphQL Playground / GraphiQL**: explorer interactivo
- **Apollo Studio**: dashboard managed
- **SpectaQL**: docs estáticas
- **GraphQL Voyager**: visualización del schema

## AsyncAPI (Event-driven)

Para APIs basadas en eventos (Kafka, RabbitMQ, WebSockets, MQTT).

```yaml
asyncapi: 3.0.0
info:
  title: Orders Events API
  version: 1.0.0

channels:
  order-created:
    address: orders.created.v1
    messages:
      OrderCreated:
        payload:
          type: object
          properties:
            order_id: { type: string }
            customer_id: { type: string }
            total: { type: number }
            timestamp: { type: string, format: date-time }
        examples:
          - payload:
              order_id: ord_01H8KPQR9V
              customer_id: cus_01H8KPQR9V
              total: 99.99
              timestamp: "2026-05-19T14:23:45Z"

operations:
  publishOrderCreated:
    action: send
    channel:
      $ref: '#/channels/order-created'
```

Render con AsyncAPI Studio.

## Contract testing

Verificar que docs y código coinciden:

- **Schemathesis** (Python): valida una API contra su OpenAPI
- **Dredd**: testing contra OpenAPI
- **Pact**: contract testing entre consumer y producer
- **Postman / Newman**: collections que validan responses

```bash
# Schemathesis ejemplo
schemathesis run https://api.example.com/openapi.yaml \
  --base-url=https://staging.example.com \
  --auth-type=bearer --auth-token=$TOKEN
```

Integrar en CI: si la API se desvía del spec, falla el build.

## Anti-patterns

- ❌ `{ "key": "value" }` como ejemplos
- ❌ Sin ejemplos de errores
- ❌ Authentication poco clara
- ❌ Sin descripción de qué hace el endpoint
- ❌ Documentar features no implementadas
- ❌ Cambiar URLs sin deprecation
- ❌ Spec en `/openapi.yaml` ignorado por equipo (drift)
- ❌ Generar spec automático y NUNCA revisar (descripciones malas)
- ❌ Sin info de rate limits, paginación, errors comunes
- ❌ Solo "happy path" documentado
- ❌ Mezclar versiones de OpenAPI (2.0 + 3.0)

## Checklist API docs

- [ ] OpenAPI/AsyncAPI/GraphQL spec en repo
- [ ] Versionado en URL o header
- [ ] Authentication documentada
- [ ] Cada endpoint con descripción, params, ejemplos
- [ ] Errores documentados con códigos
- [ ] Rate limits documentados
- [ ] Paginación documentada
- [ ] Ejemplos reales (no `{key: value}`)
- [ ] Múltiples lenguajes en ejemplos para públicas
- [ ] Schema con descriptions ricos
- [ ] Render interactivo accesible (Swagger UI / Redoc / Playground)
- [ ] Contract testing en CI
- [ ] Changelog de la API
- [ ] Política de deprecation declarada
- [ ] Spec generado o validado contra implementación
