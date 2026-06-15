# Style Guide para Documentación Técnica

Voz, tono, gramática para documentación bilingüe (ES/EN).

## Principios generales

1. **Audiencia primero**: ¿quién va a leer? ¿qué necesitan?
2. **Conciso > exhaustivo**: less is more
3. **Activa > pasiva** (cuando hay agente claro)
4. **Concreto > abstracto**
5. **Consistente** dentro del proyecto
6. **Verificable**: si dice "tarda 5 min", verificar

## Voz y tono

### Voz

**Voz** = personalidad consistente del producto/equipo.

- Profesional, no formal-rígido
- Confiable, no condescendiente
- Directo, no curt
- Útil, no servil

### Tono

**Tono** = ajuste según contexto:

| Tipo de doc | Tono |
|---|---|
| Tutorial para principiantes | Acogedor, paciente |
| Reference técnica | Directo, preciso |
| Runbook (incidente) | Urgente, claro, sin floritura |
| Postmortem | Honesto, blameless, reflexivo |
| Error messages | Útil, accionable |
| Onboarding | Bienvenido, estructurado |
| Marketing docs | Entusiasta sin sobreventa |

### Ejemplos

**Tutorial (acogedor)**:
> "Vamos a crear tu primer proyecto. Toma alrededor de 15 minutos. ¿Listo?"

**Reference (directo)**:
> "Retorna el total con impuestos. Lanza `ValidationError` si el precio es negativo."

**Runbook (urgente)**:
> "**STOP**. Confirma que no hay deploys activos antes de continuar."

**Postmortem (reflexivo)**:
> "El bug llegó a producción porque el ambiente de testing no replica las condiciones de carga real. Esto no es culpa de Alice; es un gap del sistema."

## Reglas universales

### Voz activa > pasiva

```
❌ "El archivo es procesado por el sistema."
✅ "El sistema procesa el archivo."

❌ "Es recomendado configurar HTTPS."
✅ "Recomendamos configurar HTTPS."

❌ "Errors must be handled."
✅ "Handle errors properly." / "You must handle errors."
```

Pasiva OK cuando el agente es irrelevante o desconocido:
> "El servicio se reinicia automáticamente cada hora."

### Concreto > abstracto

```
❌ "Configurá las opciones apropiadas."
✅ "Configurá DATABASE_URL y API_KEY en el archivo .env."

❌ "Use the appropriate method for your case."
✅ "For REST APIs, use POST /api/v1/orders. For batch, use POST /api/v1/orders/bulk."
```

### Evitar palabras vacías

**Eliminá** (no aportan):
- "Simplemente", "just", "simply"
- "Obviamente", "obviously"
- "Fácil", "easy"
- "Por favor", "please" (en docs técnicas)
- "Básicamente", "basically"
- "En realidad", "actually"
- "Como puedes ver", "as you can see"

```
❌ "Simplemente ejecuta este comando."
✅ "Ejecuta este comando."

❌ "Obviously, you need to authenticate first."
✅ "Authenticate first."
```

### Pronombres

**Primera persona plural** ("nosotros / we") para:
- Tutoriales guiados
- Explicar decisiones del equipo

**Segunda persona** ("tú / you") para:
- How-tos
- Reference que el usuario aplica

**Tercera persona** para:
- Reference impersonal
- Documentación generada

```
✅ "Vamos a crear el primer endpoint." (Tutorial)
✅ "Configura tu API key en variables de entorno." (How-to)
✅ "El método retorna el total." (Reference)
```

### Tiempos verbales

**Presente** como default:
```
✅ "El servicio escucha en el puerto 8080."
❌ "El servicio escuchará en el puerto 8080."
```

**Imperativo** para instrucciones:
```
✅ "Instala las dependencias con npm install."
❌ "Vas a instalar las dependencias..."
```

**Futuro** solo cuando hay tiempo real involucrado:
```
✅ "El próximo release incluirá soporte para X."
```

### Listas

**Numeradas** cuando el orden importa:
```
1. Instalar dependencias
2. Configurar variables de entorno
3. Iniciar el servicio
```

**Bullets** cuando no:
```
- Fácil de configurar
- Buena performance
- Soporte LTS
```

**Items paralelos**: misma estructura gramatical.
```
❌ MAL
- Instala las deps
- Configuración
- Inicia el servidor

✅ BIEN (todos imperativos)
- Instala las dependencias
- Configura las variables
- Inicia el servidor
```

### Headings

**Sentence case** > Title Case (más legible).

```
❌ Title Case Everywhere Is Hard To Read
✅ Sentence case is easier
```

Excepciones:
- Productos / marcas: "AWS Lambda"
- Tecnologías: "PostgreSQL", "React"

**Acción en H2/H3** cuando guías:
```
✅ "Install dependencies"
✅ "Configure your API key"
```

**Sustantivo** en reference:
```
✅ "Authentication"
✅ "Configuration options"
```

### Code en docs

#### Inline code

Backticks para:
- Nombres de archivos: `package.json`
- Variables: `NODE_ENV`
- Comandos cortos: `npm install`
- Valores literales: `true`, `null`
- Símbolos de código: `Array.prototype.map`

```markdown
Sets `NODE_ENV` to `production`.
```

#### Code blocks

Siempre con lenguaje:

```markdown
\`\`\`typescript
const foo = "bar";
\`\`\`
```

NO:
```markdown
\`\`\`
const foo = "bar";  // sin highlighting
\`\`\`
```

#### Comandos shell

Prefijo `$` solo si mezclás con output:

```bash
$ npm install
added 100 packages
$ npm start
Server running on :3000
```

Si es solo comandos, sin `$`:

```bash
npm install
npm start
```

#### Output esperado

Mostrarlo cuando es útil:

```bash
$ kubectl get pods -n prod
NAME                    READY   STATUS    RESTARTS   AGE
service-name-abc123     1/1     Running   0          5m
service-name-def456     1/1     Running   0          5m
```

### Links

#### Link text descriptivo

```
❌ "Click [here](url) for more info."
✅ "See the [API reference](url) for details."
```

#### Links internos relativos

```markdown
✅ [Setup guide](./setup.md)        # funciona si renombrás dominio
❌ [Setup guide](https://docs.example.com/setup)
```

#### Verificar links

CI con link checker (linkchecker, lychee, etc.).

### Imágenes

#### Alt text descriptivo

```markdown
❌ ![image](screenshot.png)
✅ ![Login screen with email field and continue button](screenshot.png)
```

#### Optimizar peso

- PNG / JPEG: < 200 KB
- Para tamaños mayores: WebP
- Lazy loading si soportado

#### Diagramas como código

Preferir Mermaid > PNG:
- Versionable
- Editable
- Accesible (texto)

### Glosario y consistencia

Para proyectos grandes, mantener glosario:

```markdown
# Glossary

**Order**: A purchase made by a customer. Has states: pending, paid, shipped, delivered, cancelled.

**Customer**: An individual or company that places orders. Has accounts.

**Account**: Login credentials and profile for a customer or admin.
```

Usar términos consistentemente. "User" y "Customer" no mezclables si tienen significados distintos.

## Español: gramática y convenciones

### Acentos correctos

Documentación técnica suele perder acentos. **Mantener acentos correctos**:

```
✅ Después, también, aquí, así, qué, cuál, cómo
❌ Despues, tambien, aqui, asi
```

### Tildes en imperativos

```
✅ "Ejecutá", "configurá", "agregá" (voseo argentino)
✅ "Ejecuta", "configura", "agrega" (tuteo)

Elegir uno y mantener consistencia.
```

Para docs neutras de LATAM: tuteo (más universal).

### Anglicismos vs traducciones

| Inglés | Español aceptado | Comentario |
|---|---|---|
| `endpoint` | endpoint | Universal en tech |
| `cache` | cache (no "caché") | Mantener en inglés |
| `framework` | framework | No traducir |
| `feature` | feature o "funcionalidad" | Ambos OK |
| `bug` | bug | Universal |
| `release` | release / lanzamiento | Ambos |
| `dashboard` | dashboard / tablero | Ambos |
| `query` | query / consulta | Ambos |
| `commit` | commit | No traducir |
| `pull request` / PR | PR | No traducir |
| `deploy` | deploy / despliegue | Ambos |
| `default` | por defecto | Traducir |
| `support` (v.) | soportar (anglicismo) → preferir "admitir" o "permitir" | |

**Regla**: si el término en inglés es universal en el equipo y la industria, mantenerlo. Si tiene traducción común y clara, traducirlo.

### Plural de palabras inglesas en español

```
✅ "los endpoints" (no "los endpointses")
✅ "varios bugs"
✅ "los pull requests" o "los PRs"
```

### Conjugación con tecnología

```
✅ "Spring Boot es un framework..."  (singular)
✅ "Las APIs son..."                  (plural)
✅ "Docker corre containers"          (gerundio OK)
```

### Mayúsculas

- **Nombres de productos**: como los escribe el vendor.
  - PostgreSQL (no Postgresql)
  - GitHub (no Github)
  - JavaScript (no Javascript)
- **Acrónimos**: en mayúscula (API, REST, HTTP)
- **Después de dos puntos**: minúscula (no como en inglés)

```
✅ "Hay tres opciones: PostgreSQL, MySQL y MongoDB."
❌ "Hay tres opciones: Postgresql, mysql y MongoDB."
```

## Inglés: gramática y convenciones

### Sentence case en headings

```
✅ "How to deploy"
❌ "How To Deploy"
```

(Excepto productos: "How to deploy to AWS Lambda")

### Oxford comma

Usar coma antes de "and" en listas:

```
✅ "PostgreSQL, MySQL, and SQLite."
```

Consistente con stylebook (Microsoft, Google usan Oxford comma).

### American vs British

Elegir uno y mantener:
- **American**: color, optimize, organization (más universal en tech)
- **British**: colour, optimise, organisation

Mainstream en tech: American.

### Contracciones

Conversacional: OK ("don't", "you'll").
Formal o legal: evitar ("do not", "you will").

Documentación técnica típica: OK contracciones (más natural).

### "We" vs "you" vs imperativo

```
✅ "We use PostgreSQL because..."           (Explanation)
✅ "You can configure this via..."           (How-to)
✅ "Configure this via environment vars."    (Reference)
```

## Bilingüe: estrategias

### Mantener dos versiones

⚠️ Es 2x el trabajo. Considera:

- ¿Realmente necesitás ambas?
- ¿Tenés recursos para mantener ambas actualizadas?
- ¿Una versión desactualizada es peor que una sola idioma?

### Si decidís bilingüe

**Mismo contenido, no traducción literal**:
- Adaptar ejemplos culturales si aplica
- Mismo nivel de detalle
- Misma estructura

**Marcado claro**:
```
docs/
  en/
    intro.md
  es/
    intro.md
```

O sufijo:
```
README.md       # English (default)
README.es.md    # Spanish
```

**Indicar qué versión es source**:
- Source = English typically (más universal)
- Spanish = traducción
- Si source cambia, marcar Spanish como "outdated until translated"

### AI translation

Aceptable para drafts iniciales. **Review humano obligatorio** antes de publicar:
- Terminología técnica
- Tono
- Idioms

## Anti-patterns

### Tono

- ❌ Condescendiente: "as you should know"
- ❌ Defensive: "this might seem complicated but..."
- ❌ Sales-y: "amazing", "best", "revolutionary"
- ❌ Bromas (envejecen mal)
- ❌ Sarcasmo (problemas en idioma no nativo)
- ❌ Cultural references (no universales)

### Estructura

- ❌ Wall of text (sin headers, sin bullets)
- ❌ Mil bullets anidados
- ❌ Headings sin jerarquía
- ❌ "Click here", "see this", "this thing"
- ❌ Pronombres ambiguos ("It does X" — what's "it"?)

### Lenguaje

- ❌ "Recently" / "Soon" / "New" (envejecen)
- ❌ "I/We will be doing..." (futuro innecesario)
- ❌ Hedging excesivo: "kind of", "sort of", "maybe"
- ❌ Pasiva sin agente
- ❌ Jerga sin definir
- ❌ Acrónimos sin expansión la primera vez

## Plantillas de frases útiles

### Empezar tutorial
> "En este tutorial vas a crear X. Toma aproximadamente Y minutos."

> "By the end of this tutorial, you'll have a working X."

### Empezar how-to
> "Esta guía explica cómo lograr X."

> "This guide shows how to X."

### Introducir reference
> "Listado completo de opciones para X."

> "Complete reference for X."

### Empezar explanation
> "X resuelve el problema de Y mediante Z."

> "X solves the problem of Y by Z."

### Pre-requisitos
> "Antes de empezar, asegurate de tener: ..."

> "Before you start, make sure you have: ..."

### Advertencias
> "⚠️ Cuidado: X destruye Y irreversiblemente."

> "⚠️ Warning: X is irreversible."

### Verificación
> "Para verificar que funcionó: ejecutá X. Deberías ver Y."

> "To verify it worked, run X. You should see Y."

### Cuándo escalar (runbook)
> "Si tras 15 minutos no podés resolverlo, escalá a Y."

> "If you can't resolve this within 15 minutes, escalate to Y."

### Cierre tutorial
> "¡Felicitaciones! Construiste X. Próximos pasos: Y, Z."

> "Congratulations! You built X. Next steps: Y, Z."

## Checklist de revisión

Antes de publicar:

- [ ] One-liner claro al inicio
- [ ] Audiencia identificada
- [ ] Voz activa donde corresponde
- [ ] Sin "simplemente", "obviamente", "fácil"
- [ ] Sentence case en headings
- [ ] Bullets paralelos (misma estructura)
- [ ] Code blocks con lenguaje declarado
- [ ] Links descriptivos (no "click here")
- [ ] Imágenes con alt text
- [ ] Diagramas con propósito
- [ ] Sin TODO/FIXME visibles
- [ ] Sin secrets ni IPs en ejemplos
- [ ] Acentos correctos (español)
- [ ] Naming consistente con código
- [ ] Link checker pasó
- [ ] Spell check ejecutado
- [ ] Leído por otra persona (peer review)
