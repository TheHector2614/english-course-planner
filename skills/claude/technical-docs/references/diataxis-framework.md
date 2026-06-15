# Diátaxis Framework

Framework para organizar documentación técnica en 4 cuadrantes distintos. Creado por Daniele Procida. Adoptado por Django, Cloudflare, GitLab, NumPy y otros.

## Por qué Diátaxis

Documentación mal organizada confunde porque mezcla tipos de contenido con propósitos distintos. Diátaxis separa la docs en 4 cuadrantes basados en **2 ejes**:

```
                    Acción (práctico)         Cognición (teórico)
                  ┌─────────────────────────┬─────────────────────────┐
                  │                         │                         │
   Estudio        │      TUTORIAL           │     EXPLANATION         │
   (aprender)     │   "Lecciones guiadas"   │   "Discusión, contexto" │
                  │                         │                         │
                  ├─────────────────────────┼─────────────────────────┤
                  │                         │                         │
   Trabajo        │      HOW-TO GUIDE       │     REFERENCE           │
   (lograr meta)  │   "Recetas de tareas"   │   "Información técnica" │
                  │                         │                         │
                  └─────────────────────────┴─────────────────────────┘
```

## Los 4 cuadrantes

### 1. Tutorial

**Propósito**: enseñar a un principiante por medio de una experiencia exitosa.

**Características**:
- Orientado a aprendizaje
- Paso a paso, mano sobre mano
- El usuario sigue exactamente lo que dice
- Cuando termine, el usuario ha aprendido algo
- Resultado garantizado si sigue los pasos

**Analogía**: enseñar a un niño a cocinar acompañándolo.

**Ejemplo**: "Tu primera app en X — un paseo guiado"

#### Reglas

✅ Lenguaje en primera persona plural ("vamos a crear...")
✅ Pasos numerados, cada uno verificable
✅ Resultado intermedio visible en cada paso
✅ Funciona EXACTAMENTE como dice (testear repetidamente)
✅ Asume principiante (no asume conocimiento previo del producto)

❌ Explicar por qué (eso es Explanation)
❌ Cubrir múltiples opciones o variantes (eso es How-to)
❌ Listar todas las opciones disponibles (eso es Reference)
❌ Discutir alternativas

#### Estructura típica

```markdown
# Tutorial: Tu primera <thing>

En este tutorial vas a construir <X>. Al final tendrás <Y> funcionando.

## Prerequisitos

- <prerequisito 1>
- <prerequisito 2>

## Paso 1: <acción concreta>

\`\`\`bash
<comando>
\`\`\`

Deberías ver:

\`\`\`
<output esperado>
\`\`\`

## Paso 2: <siguiente acción>

[continuación...]

## ¡Felicidades!

Lograste <X>. Construiste tu primera <thing>.

## Próximos pasos

- Ver [How-to: hacer Y](...)
- Ver [Explanation: cómo funciona X](...)
```

### 2. How-to Guide

**Propósito**: mostrar cómo lograr un objetivo específico. Para usuarios que ya saben qué quieren hacer.

**Características**:
- Orientado a resultado/tarea
- Asume conocimiento previo
- Solución a un problema concreto
- Múltiples problemas → múltiples how-tos

**Analogía**: receta de cocina ("Cómo hacer tortilla de papas").

**Ejemplo**: "Cómo configurar autenticación con OAuth"

#### Reglas

✅ Empieza con "Cómo X" o "How to X"
✅ Asume contexto y conocimiento
✅ Va al grano
✅ Solo lo necesario para esa tarea
✅ Puede mencionar alternativas con trade-offs

❌ Enseñar fundamentos (eso es Tutorial)
❌ Cubrir todo sobre el tema (eso es Reference)
❌ Justificar diseño o decisiones (eso es Explanation)

#### Estructura típica

```markdown
# Cómo <lograr objetivo>

## Antes de empezar

- <prerequisito>
- <prerequisito>

## Pasos

1. <paso conciso>

   \`\`\`bash
   <comando>
   \`\`\`

2. <paso conciso>

## Verificación

<cómo confirmar que funcionó>

## Troubleshooting

### Si ves error X
<solución>

## Ver también

- <link a docs relacionados>
```

### 3. Reference

**Propósito**: información técnica precisa. Para consulta, no para leer linearmente.

**Características**:
- Orientado a información
- Estructura predecible (alfabética, por categoría)
- Completo y exhaustivo
- Consistente
- Plano descriptivo (qué es, no por qué)

**Analogía**: enciclopedia, manual técnico de un auto.

**Ejemplos**:
- "API Reference"
- "CLI commands"
- "Configuration options"
- "Glossary"

#### Reglas

✅ Descripción de las cosas (qué, no cómo aprender)
✅ Estructura consistente entre items
✅ Indexable y searchable
✅ Lenguaje denso, técnico
✅ Generable desde código cuando sea posible

❌ Tutoriales o explicaciones largas
❌ Opiniones o recomendaciones
❌ Pasos para lograr objetivos (eso es How-to)

#### Estructura típica para API endpoint

```markdown
## POST /api/v1/orders

Crea una nueva orden.

### Authentication

Bearer token requerido. Scope: `orders:write`.

### Request

| Field | Type | Required | Description |
|---|---|---|---|
| `customer_id` | uuid | Yes | ID del cliente |
| `items` | array | Yes | Items de la orden |
| `notes` | string | No | Notas opcionales |

#### Example

\`\`\`json
{
  "customer_id": "...",
  "items": [{"product_id": "...", "qty": 2}]
}
\`\`\`

### Response

`201 Created`

\`\`\`json
{
  "id": "...",
  "status": "pending",
  ...
}
\`\`\`

### Errors

| Code | Reason |
|---|---|
| `400` | Validation failed |
| `401` | Unauthorized |
| `409` | Customer inactive |
```

### 4. Explanation

**Propósito**: comprensión profunda. Discutir contexto, alternativas, decisiones, "por qué".

**Características**:
- Orientado a comprensión
- Discursivo
- Puede ser opinable y reflexivo
- Provee contexto, historia, motivación
- Conecta ideas

**Analogía**: ensayo, artículo de divulgación.

**Ejemplos**:
- "Why we chose PostgreSQL over MongoDB"
- "Understanding our caching strategy"
- "Trade-offs in our authentication model"

#### Reglas

✅ Discutir y reflexionar
✅ Comparar alternativas con trade-offs
✅ Conectar con contexto más amplio
✅ Puede tener opinión justificada
✅ Suficiente extensión para desarrollar idea

❌ Instrucciones paso a paso (eso es Tutorial o How-to)
❌ Listas exhaustivas (eso es Reference)
❌ Detalles de implementación (link a Reference)

#### Estructura típica

```markdown
# <Tema>: una explicación

## Resumen

<TL;DR de la idea principal>

## Contexto

<historia, problema que motivó>

## Cómo funciona

<modelo mental, no implementación detallada>

## Alternativas consideradas

<por qué no las otras opciones>

## Trade-offs

<qué se gana, qué se pierde>

## Ver también

- Reference: <link>
- How-to: <link>
```

## Errores comunes al mezclar cuadrantes

### Tutorial + How-to mezclados

❌ "En este tutorial vamos a configurar OAuth. Hay 3 opciones..."

Si es tutorial, asume principiante: elige UNA opción y enséñala. Las otras van a How-tos separadas.

### Reference + Explanation mezclados

❌ "Esta función calcula el hash MD5. MD5 fue creado en 1991 y es considerado inseguro..."

La reference es la firma y comportamiento. La historia y opinión va a Explanation separado.

### How-to + Tutorial mezclados

❌ "Cómo desplegar a producción (asumimos que ya configuraste tu cuenta AWS desde cero)..."

How-to asume conocimiento. Si necesita setup desde cero, link a Tutorial separado.

### Reference + How-to mezclados

❌ Documentación de un endpoint que incluye "Para usar este endpoint, primero crea una cuenta..."

La reference describe qué hace. Cómo se usa en un workflow es How-to separado.

## Cómo aplicar en la práctica

### Para un proyecto nuevo

Estructura de carpetas según Diátaxis:

```
docs/
├── tutorials/
│   ├── 01-getting-started.md
│   └── 02-your-first-feature.md
├── how-to/
│   ├── deploy-to-production.md
│   ├── configure-oauth.md
│   └── handle-errors.md
├── reference/
│   ├── api/
│   ├── cli-commands.md
│   └── configuration.md
└── explanation/
    ├── architecture.md
    ├── why-postgresql.md
    └── auth-model.md
```

Algunos proyectos prefieren combinar con `index.md` por sección.

### Para proyectos existentes (refactor)

1. **Inventory**: listar docs existentes
2. **Categorizar**: identificar cuadrante de cada uno
3. **Detectar mezclas**: docs que cubren varios cuadrantes
4. **Separar**: dividir mezclas en docs distintos
5. **Detectar gaps**: ¿faltan tutoriales? ¿How-tos comunes?
6. **Reorganizar**: nueva estructura de carpetas

### Detectar tipo de documento

Preguntar al escribir:

| Pregunta | Si "sí" → es... |
|---|---|
| ¿Está enseñando paso a paso a un principiante? | Tutorial |
| ¿El lector tiene un objetivo específico ya en mente? | How-to |
| ¿Es información para consultar, no para leer? | Reference |
| ¿Discute "por qué" o contexto amplio? | Explanation |

## Mismo tema, 4 docs distintos

Para un mismo tema (p.ej., "autenticación") podrías tener:

- **Tutorial**: "Implementa tu primer login en 20 minutos" (paso a paso, principiante)
- **How-to**: "Cómo agregar 2FA" / "Cómo rotar JWTs" (problemas específicos)
- **Reference**: API endpoints, configuración, parámetros (datos)
- **Explanation**: "Modelo de autenticación de nuestra plataforma" (contexto, decisiones)

Cada uno hace su trabajo bien. Mezclados serían un mar de confusión.

## Recursos

- Diátaxis website: https://diataxis.fr/
- Charla de Daniele Procida: https://www.youtube.com/watch?v=t4vKPhjcMZg
- Adopción por Django: https://docs.djangoproject.com/

## Limitaciones de Diátaxis

No todo cabe perfecto. Algunos casos:
- **CHANGELOG**: ni tutorial ni reference. Es histórico. Ponerlo aparte.
- **CONTRIBUTING**: mezcla how-to + explanation. OK que sea híbrido.
- **README**: hub, no cabe en un solo cuadrante. Es índice.
- **Postmortems**: análisis histórico. Aparte.
- **ADRs**: registro de decisiones. Aparte (más cerca de Explanation).

Usar Diátaxis como guía, no como dogma.
