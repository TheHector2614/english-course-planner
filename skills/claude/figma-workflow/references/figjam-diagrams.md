# Diagramas FigJam con Mermaid

Sintaxis Mermaid soportada por `Figma:generate_diagram` y patrones recomendados.

## Tipos soportados

- `graph` / `flowchart` — diagramas de flujo y árboles de decisión
- `sequenceDiagram` — interacciones entre actores/sistemas en el tiempo
- `stateDiagram` / `stateDiagram-v2` — máquinas de estado
- `gantt` — cronogramas y planning
- `erDiagram` — diagramas entidad-relación (DB schema)

**NO soportados**: class diagrams, timelines, venn diagrams, mind maps.

## Reglas de la herramienta

1. Mantener los diagramas **simples** (a menos que el usuario pida detalle)
2. Para `graph`/`flowchart`/`erDiagram`: usar dirección **LR** (left-right) por defecto
3. Texto de shapes y edges **siempre entre comillas**: `["Texto"]`, `-->|"Edge label"|`
4. **No usar emojis** en el código Mermaid
5. **No usar `\n`** para saltos de línea
6. En `gantt`: **no usar colores** (estilo fijo)
7. En `sequenceDiagram`: **no usar notas**
8. **No usar la palabra "end"** en classNames
9. Para `graph`/`flowchart` se permite **styling de color con moderación**

## Flowchart estándar

```mermaid
flowchart LR
    A["Inicio"] --> B{"¿Usuario autenticado?"}
    B -->|"Sí"| C["Dashboard"]
    B -->|"No"| D["Login"]
    D --> E["Validar credenciales"]
    E --> B
    C --> F["Fin"]
```

## Flowchart con styling

```mermaid
flowchart LR
    A["Request"] --> B["Auth middleware"]
    B --> C["Route handler"]
    C --> D["Response"]

    classDef success fill:#10b981,color:#fff,stroke:#059669
    classDef error fill:#ef4444,color:#fff,stroke:#dc2626

    class D success
```

## Sequence diagram

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API
    participant DB as Base de datos

    U->>F: Click en "Comprar"
    F->>A: POST /api/orders
    A->>DB: INSERT order
    DB-->>A: order_id
    A-->>F: 201 Created
    F-->>U: Redirigir a confirmación
```

## State diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: enviar
    Submitted --> Review: asignar reviewer
    Review --> Approved: aprobar
    Review --> Rejected: rechazar
    Rejected --> Draft: corregir
    Approved --> Published: publicar
    Published --> [*]
```

## Gantt (cronograma)

```mermaid
gantt
    title Plan de proyecto
    dateFormat YYYY-MM-DD

    section Diseño
    Wireframes      :a1, 2026-01-01, 7d
    UI Design       :a2, after a1, 14d
    Design Review   :a3, after a2, 3d

    section Desarrollo
    Setup           :b1, after a1, 3d
    Frontend        :b2, after a2, 21d
    Backend         :b3, after a2, 21d
    Integración     :b4, after b2, 5d

    section Testing
    QA              :c1, after b4, 7d
    UAT             :c2, after c1, 5d
```

## ER diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER_ITEM }|--|| PRODUCT : "references"
    USER {
        uuid id PK
        string email
        string name
        timestamp created_at
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        decimal total
        string status
    }
    PRODUCT {
        uuid id PK
        string name
        decimal price
        int stock
    }
    ORDER_ITEM {
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
```

## Patrones comunes a generar

### User journey (como flowchart)

```mermaid
flowchart LR
    A["Landing page"] --> B["Click CTA"]
    B --> C["Formulario de registro"]
    C --> D{"Datos válidos?"}
    D -->|"Sí"| E["Email de verificación"]
    D -->|"No"| C
    E --> F["Click en email"]
    F --> G["Onboarding"]
    G --> H["Dashboard"]
```

### Arquitectura de sistema (como flowchart con styling)

```mermaid
flowchart LR
    Client["Cliente Web"] --> CDN["CDN"]
    CDN --> LB["Load Balancer"]
    LB --> App1["App Server 1"]
    LB --> App2["App Server 2"]
    App1 --> Cache["Redis Cache"]
    App2 --> Cache
    App1 --> DB["PostgreSQL"]
    App2 --> DB
    App1 --> Queue["Message Queue"]
    Queue --> Worker["Worker"]
    Worker --> DB

    classDef external fill:#dbeafe,stroke:#3b82f6
    classDef compute fill:#fef3c7,stroke:#f59e0b
    classDef data fill:#dcfce7,stroke:#22c55e

    class Client,CDN external
    class LB,App1,App2,Worker compute
    class Cache,DB,Queue data
```

### Decision tree

```mermaid
flowchart TD
    Start["¿Necesitas estado global?"] --> Q1{"¿Cuántas features?"}
    Q1 -->|"1-3"| Signals["Signals locales"]
    Q1 -->|"4-10"| Q2{"¿Estado complejo entre features?"}
    Q1 -->|"10+"| NgRx["NgRx Signal Store"]

    Q2 -->|"No"| Services["Servicios con signals"]
    Q2 -->|"Sí"| NgRx
```

### Flujo de autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Cliente
    participant API as API
    participant Auth as Auth Service

    U->>C: Ingresa credenciales
    C->>API: POST /auth/login
    API->>Auth: Validar
    Auth-->>API: Token JWT
    API-->>C: { token, refresh_token }
    C->>C: Guardar en storage

    Note: requests subsiguientes
    C->>API: GET /resource (Bearer token)
    API->>Auth: Verificar token
    Auth-->>API: OK
    API-->>C: Datos
```

## Antes de llamar a `generate_diagram`

1. **Definir userIntent** claro: qué quiere lograr el usuario
2. **Generar el código Mermaid** mentalmente y validar:
   - Sintaxis correcta
   - Textos en comillas
   - Sin emojis ni `\n`
3. **Asignar un name** descriptivo (será el título del diagrama)
4. **Pedir confirmación al usuario** ("Voy a generar este diagrama en FigJam, ¿procedo?")
5. Si el usuario tiene un archivo FigJam abierto y quiere agregarlo ahí, **pasar `fileKey`**

## Manejo de errores comunes

- **"end" en nodos**: renombrar (ej: `End` por `Finish` o `EndNode`)
- **Caracteres especiales en texto**: usar comillas dobles siempre
- **Diagrama muy denso**: dividir en múltiples diagramas o simplificar
- **Mermaid version**: si una sintaxis nueva falla, simplificar a la versión clásica
