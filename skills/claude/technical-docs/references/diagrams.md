# Diagramas en Documentación

Cuándo y cómo usar Mermaid, PlantUML, Excalidraw, Figma.

## Principio: diagrama con propósito

Un diagrama vale mil palabras **solo si clarifica**. Si lo agregas sin propósito, agrega ruido.

✅ Usar diagrama cuando:
- Estructura espacial importa (arquitectura)
- Flujo o secuencia compleja
- Relaciones entre entidades (ER)
- Estados y transiciones
- Timeline o fases

❌ NO usar diagrama cuando:
- Es solo lista (mejor bullets)
- Es solo tabla de datos (mejor tabla)
- Texto explica igual de bien
- El diagrama sería un blob inentendible

## Mermaid (recomendado por defecto)

**Por qué Mermaid**:
- Texto, no binario → versionable en Git
- Renderizado nativo en GitHub, GitLab, Notion, Docusaurus, MkDocs
- Cubre flowchart, sequence, ER, state, gantt, class, mindmap, timeline, etc.
- Edita = edita texto, no requiere tool gráfico

**Cuándo NO Mermaid**:
- Diagramas muy estilizados/pulidos para presentaciones → Figma
- UML estricto y complejo → PlantUML
- Sketches conceptuales informales → Excalidraw

### Flowchart

Para flujos de proceso, decisiones, arquitecturas simples.

```mermaid
flowchart LR
    A[Start] --> B{Auth?}
    B -->|Yes| C[Process Request]
    B -->|No| D[Return 401]
    C --> E[(Database)]
    E --> F[Return Response]
```

Direcciones: `TB` (top-bottom), `BT`, `LR`, `RL`.

Formas:
- `[ ]` rectángulo
- `( )` rectángulo redondeado
- `{ }` rombo (decisión)
- `[( )]` cilindro (DB/storage)
- `(( ))` círculo
- `> ]` flag
- `[/ /]` paralelogramo

### Sequence diagram

Para interacciones entre componentes/actores en el tiempo.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant API
    participant Auth as Auth Service
    participant DB

    User->>Frontend: Click "Login"
    Frontend->>API: POST /login
    API->>Auth: Validate credentials
    Auth->>DB: Query user
    DB-->>Auth: User data
    Auth-->>API: JWT token
    API-->>Frontend: 200 + token
    Frontend-->>User: Show dashboard
```

Flechas:
- `->>` mensaje normal
- `-->>` respuesta
- `->>+` activa lifecycle
- `->>-` desactiva
- `--x` mensaje perdido

Otros:
- `Note over A,B: Esto es una nota`
- `loop` para bucles
- `alt / else / end` para branches
- `par` para paralelo

### Entity Relationship

Para schemas de DB. Integra con skill `databases`.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDER_ITEMS }|--|| PRODUCTS : references
    USERS {
        bigint id PK
        varchar email UK
        varchar name
        timestamptz created_at
    }
    ORDERS {
        bigint id PK
        bigint user_id FK
        decimal total
        varchar status
        timestamptz created_at
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCTS {
        bigint id PK
        varchar sku UK
        varchar name
        decimal price
    }
```

Cardinality:
- `||--||` one-to-one
- `||--o{` one-to-many
- `}|--|{` many-to-many (al menos uno cada lado)
- `}o--o{` many-to-many (opcional ambos lados)

### State diagram

Para máquinas de estado (orden lifecycle, conexiones TCP, etc.).

```mermaid
stateDiagram-v2
    [*] --> Pending: order created
    Pending --> Paid: payment received
    Pending --> Cancelled: timeout
    Paid --> Shipped: dispatched
    Paid --> Refunded: refund requested
    Shipped --> Delivered: confirmed
    Shipped --> Lost: tracking lost
    Delivered --> [*]
    Cancelled --> [*]
    Refunded --> [*]
    Lost --> [*]
```

### Class diagram

UML clásico para diseño OO.

```mermaid
classDiagram
    class User {
        +Long id
        +String email
        +String name
        +login(password)
        +logout()
    }
    class Order {
        +Long id
        +User user
        +List~OrderItem~ items
        +BigDecimal total()
        +place()
    }
    class OrderItem {
        +Product product
        +int quantity
        +subtotal()
    }
    User "1" --> "*" Order : places
    Order "1" *-- "1..*" OrderItem : contains
```

Relations:
- `<|--` herencia (extends)
- `*--` composición
- `o--` agregación
- `-->` asociación
- `..>` dependencia
- `..|>` realización (implements)

### Gantt

Para timelines de proyecto/release planning.

```mermaid
gantt
    title Release 2.0 Plan
    dateFormat YYYY-MM-DD

    section Design
    Architecture review     :done,    a1, 2026-05-01, 14d
    DB schema design        :done,    a2, after a1, 10d

    section Development
    Backend API             :active,  b1, 2026-05-15, 21d
    Frontend                :         b2, after b1, 14d

    section Testing
    QA                      :         c1, after b2, 7d
    UAT                     :         c2, after c1, 5d

    section Release
    Deploy to staging       :crit,    d1, after c2, 1d
    Deploy to production    :crit,    d2, after d1, 1d
```

### Mindmap

Brainstorming, taxonomía, organización conceptual.

```mermaid
mindmap
  root((API Design))
    REST
      Resources
      HTTP verbs
      Status codes
    GraphQL
      Schema
      Resolvers
      Subscriptions
    Authentication
      JWT
      OAuth
      API Keys
    Versioning
      URL
      Header
      Query param
```

### Timeline

Para historia de un proyecto, decisiones, milestones.

```mermaid
timeline
    title Product Roadmap
    2024 Q1 : MVP launch
            : 100 customers
    2024 Q3 : Mobile app
            : 1,000 customers
    2025 Q1 : Enterprise tier
            : 10,000 customers
    2026 Q2 : International expansion
            : Multi-region
```

### Estilo y temas

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart LR
    A --> B
```

Themes: `default`, `dark`, `forest`, `neutral`, `base`.

Custom CSS para nodos:

```mermaid
flowchart LR
    A[Important]:::critical --> B[Normal]
    classDef critical fill:#f96,stroke:#333,stroke-width:2px
```

## PlantUML (UML estricto)

Cuando necesitas UML formal o capacidades avanzadas:

```plantuml
@startuml
title User Authentication Flow

actor User
participant "Web App" as Web
participant "API Gateway" as Gateway
participant "Auth Service" as Auth
database "User DB" as DB

User -> Web : Click Login
Web -> Gateway : POST /login
Gateway -> Auth : Validate
Auth -> DB : Query
DB --> Auth : User found
Auth --> Gateway : JWT
Gateway --> Web : 200 + token
Web --> User : Dashboard

@enduml
```

PlantUML soporta más tipos UML (component, deployment, activity, use case, etc.) y opciones de estilo más ricas.

**Render**:
- VSCode: extension PlantUML
- IntelliJ: built-in
- Online: https://www.plantuml.com/plantuml/
- En GitHub: no nativo. Usar action o link al PNG generado.

### Cuándo PlantUML > Mermaid

- UML estricto académico
- Diagramas de componentes/deployment complejos
- Activity diagrams con swim lanes
- Soporte de C4 model
- Más opciones de styling

### Cuándo Mermaid > PlantUML

- Render nativo en repos Git
- Diagrama típico de software
- Quieres editar y ver inmediatamente
- Equipo no quiere instalar nada

## C4 model

Framework para diagramas de arquitectura en 4 niveles:

1. **System Context** — sistema en su entorno
2. **Container** — apps, servicios, bases dentro del sistema
3. **Component** — bloques dentro de un container
4. **Code** — clases/funciones (raramente vale la pena diagramar)

Mermaid C4 (experimental):

```mermaid
C4Context
    title System Context: E-commerce Platform

    Person(customer, "Customer", "End user")
    Person(admin, "Admin", "Internal staff")

    System(ecommerce, "E-commerce Platform", "Allow customers to buy products")

    System_Ext(stripe, "Stripe", "Payment processor")
    System_Ext(sendgrid, "SendGrid", "Email")

    Rel(customer, ecommerce, "Uses")
    Rel(admin, ecommerce, "Manages")
    Rel(ecommerce, stripe, "Processes payments")
    Rel(ecommerce, sendgrid, "Sends emails")
```

Container level:

```mermaid
C4Container
    title Container: E-commerce Platform

    Person(customer, "Customer")

    Container_Boundary(c1, "E-commerce Platform") {
        Container(web, "Web App", "Next.js", "Customer-facing UI")
        Container(api, "API", "NestJS", "Business logic")
        ContainerDb(db, "Database", "PostgreSQL", "Orders, users, products")
        ContainerDb(cache, "Cache", "Redis", "Sessions, cart")
    }

    System_Ext(stripe, "Stripe")

    Rel(customer, web, "HTTPS")
    Rel(web, api, "REST API")
    Rel(api, db, "SQL")
    Rel(api, cache, "Redis protocol")
    Rel(api, stripe, "HTTPS")
```

PlantUML tiene mejor soporte de C4 con la librería oficial.

## Excalidraw

Para sketches conceptuales informales. Hand-drawn look. Útil para:
- Whiteboarding remoto
- Brainstorming
- Diagramas "rough" en early stage
- Slides de discusión

Exportable a PNG/SVG. Source `.excalidraw` versionable en Git.

## Figma

Para diagramas de **alta calidad visual** en presentaciones, blogs, docs públicos. Coordina con la skill `figma-workflow` que ya tienes.

Cuándo Figma:
- Marketing material
- Docs públicas con branding
- Diagramas en presentaciones o pitches
- Templates reusables visuales

Para devs internos, Mermaid casi siempre es mejor (más rápido, versionable).

## ASCII art

Para README simples o diagramas inline en code comments:

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│ Gateway │────▶│ Service │
└─────────┘     └─────────┘     └─────────┘
                                      │
                                      ▼
                                 ┌─────────┐
                                 │   DB    │
                                 └─────────┘
```

Herramientas:
- https://asciiflow.com
- VSCode extensions

Cuándo:
- Code comments
- READMEs muy simples
- Cuando Mermaid no se renderiza

## Reglas generales

### Cantidad de información

❌ Diagrama con 50+ nodos: nadie entiende
✅ Foco en lo importante; detalles a sub-diagramas

### Niveles de zoom

Para arquitecturas complejas, **multiple diagramas en distinto nivel**:

1. System context (alto nivel) — el sistema completo
2. Container (medio) — apps dentro del sistema
3. Component (bajo) — bloques dentro de una app

Cada diagrama tiene UNA capa de detalle. Si necesitas más, otro diagrama.

### Naming consistente

- Componentes con mismo nombre en docs y código
- Acrónimos definidos
- Etiquetas claras (no "Service A")

### Direcciones de flujo

- Generalmente: arriba → abajo o izquierda → derecha
- Mantener convención en toda la doc
- Líneas que cruzan = mal layout

### Color con propósito

Usar color para significado, no decoración:
- Rojo = error, crítico
- Verde = success, healthy
- Amarillo = warning
- Gris = inactivo, fuera de scope

Accesibilidad: no depender SOLO de color (también shape o label).

### Mantenibilidad

- Diagrama desactualizado peor que sin diagrama
- Mermaid en repo = fácil actualizar
- Si tienes PNG generado, mantener source
- Auto-gen desde código cuando posible (terraform-docs, infracost-diagrams, etc.)

## Generación automática

Algunos diagramas pueden generarse desde código:

| Tipo | Herramienta |
|---|---|
| ER desde DB | SchemaSpy, DBeaver, mermaid-erd-cli |
| Class desde código | tplant (TS), pyreverse (Python) |
| Architecture desde Terraform | terraform-docs, inframap, rover |
| Sequence desde logs | Lots of tools (depend on stack) |
| Dependency graph | madge (JS), pydeps |

## Render

### GitHub/GitLab

Mermaid renderiza nativamente. PlantUML necesita workaround (GitHub Action que genera PNG).

### Docusaurus

```bash
npm install --save @docusaurus/theme-mermaid
```

```js
// docusaurus.config.js
themes: ['@docusaurus/theme-mermaid'],
markdown: { mermaid: true },
```

### MkDocs

Con `pymdown-extensions`:
```yaml
markdown_extensions:
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
```

### Sphinx

`sphinxcontrib-mermaid`:
```python
extensions = ['sphinxcontrib.mermaid']
```

### Notion

Mermaid embeds nativo en bloques de código.

### Confluence

Plugin "Mermaid Diagrams for Confluence" o macro custom.

## Checklist diagrama

- [ ] ¿El diagrama aporta valor sobre solo texto?
- [ ] Una idea por diagrama, no múltiples
- [ ] Naming consistente con código y otros docs
- [ ] Source versionable (Mermaid/PlantUML text, no PNG binario)
- [ ] Niveles de zoom apropiados (no todo en uno)
- [ ] Render correcto en la herramienta destino
- [ ] Color y forma con propósito
- [ ] Direcciones de flujo consistentes
- [ ] Sin información obsoleta
- [ ] Texto legible (no demasiado pequeño)
