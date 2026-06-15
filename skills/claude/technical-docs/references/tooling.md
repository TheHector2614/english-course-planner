# Tooling para Documentación

MkDocs, Docusaurus, Sphinx, Confluence, Notion. Cuándo cada uno.

## Decision matrix

| Necesidad | Herramienta recomendada |
|---|---|
| README en repo | Markdown plano |
| Docs internas de proyecto | Markdown en `/docs/` |
| Sitio docs estilo Read the Docs (Python) | Sphinx + RTD theme |
| Sitio docs librería JS/TS | Docusaurus |
| Sitio docs simple multi-página | MkDocs (especialmente Material theme) |
| API docs REST | Swagger UI / Redoc / Stoplight |
| Wiki corporativo | Confluence / Notion |
| Docs personales o team chico | Notion / Obsidian |
| Marketing site con docs integradas | Next.js / Astro |

## Markdown plano

**Cuándo**: READMEs, docs en repo, simple.

**Pros**:
- Renderiza en GitHub/GitLab nativo
- Versionable junto al código
- No requiere build

**Cons**:
- Sin búsqueda
- Sin navegación entre páginas (excepto links)
- Sin temas, sin componentes

**Tools útiles**:
- **markdownlint** para style consistency
- **prettier** para formato
- **markdown-link-check** para links rotos
- **doctoc** para tabla de contenidos auto

## MkDocs

Sitio estático generado desde Markdown. Python-based.

**Cuándo**: docs de proyecto sin necesidad de mucho JS, principalmente Markdown.

```bash
pip install mkdocs mkdocs-material
mkdocs new my-docs
cd my-docs
mkdocs serve  # dev server en localhost:8000
mkdocs build  # genera /site
```

`mkdocs.yml`:
```yaml
site_name: My Project Docs
site_url: https://docs.example.com
repo_url: https://github.com/org/project

theme:
  name: material
  features:
    - navigation.instant
    - navigation.tracking
    - navigation.tabs
    - search.suggest
    - search.highlight
    - content.code.copy

nav:
  - Home: index.md
  - Tutorial:
    - Getting Started: tutorial/getting-started.md
    - First Feature: tutorial/first-feature.md
  - How-to:
    - Deploy: how-to/deploy.md
  - Reference:
    - API: reference/api.md
    - CLI: reference/cli.md
  - Explanation:
    - Architecture: explanation/architecture.md

plugins:
  - search
  - mkdocstrings   # docs desde código Python

markdown_extensions:
  - admonition
  - codehilite
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - toc:
      permalink: true
```

**MkDocs Material**:
- Theme moderno, popular
- Mermaid built-in
- Búsqueda excelente
- Dark mode

**Hosting**:
- GitHub Pages
- Read the Docs (gratis para open source)
- Netlify / Vercel / Cloudflare Pages

## Docusaurus

React-based. Por Facebook/Meta. Excelente para sitios de docs con interactividad.

**Cuándo**: librerías JS/TS, sitios con muchos features (versioning, i18n, blog).

```bash
npx create-docusaurus@latest my-docs classic
cd my-docs
npm start
```

Estructura:
```
my-docs/
├── docs/                    # Markdown docs
├── blog/                    # Blog posts
├── src/                     # React custom
│   ├── components/
│   └── pages/
├── static/
├── docusaurus.config.js     # config principal
└── sidebars.js              # navigation
```

`docusaurus.config.js` (simplificado):
```javascript
module.exports = {
  title: 'My Project',
  tagline: 'Modern docs',
  url: 'https://docs.example.com',
  baseUrl: '/',

  presets: [
    ['classic', {
      docs: {
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/org/repo/edit/main/'
      },
      blog: {
        showReadingTime: true,
      },
      theme: {
        customCss: require.resolve('./src/css/custom.css')
      }
    }]
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: { mermaid: true },

  themeConfig: {
    navbar: {
      title: 'My Project',
      items: [
        { type: 'doc', docId: 'intro', label: 'Docs' },
        { to: '/blog', label: 'Blog' },
        { href: 'https://github.com/org/repo', label: 'GitHub' }
      ]
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula')
    }
  }
};
```

**Features destacados**:
- **Versioning** built-in (docs/v1, docs/v2)
- **i18n** built-in
- **MDX**: React components en Markdown
- **Algolia DocSearch** integration
- **Theme system** completo

**Hosting**:
- Vercel, Netlify, Cloudflare Pages
- GitHub Pages
- Self-hosted

## Sphinx

Python-based. El más maduro para docs técnicas.

**Cuándo**: proyectos Python, libraries científicas, libros técnicos.

```bash
pip install sphinx sphinx-rtd-theme
sphinx-quickstart
make html
```

reStructuredText (rst) es el formato nativo, pero Markdown con `myst-parser` también:

```bash
pip install myst-parser
```

`conf.py`:
```python
project = 'My Project'
author = 'My Team'
version = '1.0'

extensions = [
    'sphinx.ext.autodoc',       # docs desde docstrings
    'sphinx.ext.napoleon',       # Google/NumPy docstrings
    'sphinx.ext.intersphinx',    # links a otras docs Sphinx
    'sphinx.ext.viewcode',
    'sphinx_rtd_theme',
    'sphinxcontrib.mermaid',
    'myst_parser',               # Markdown support
]

html_theme = 'sphinx_rtd_theme'
```

**Features destacados**:
- **autodoc**: genera docs desde docstrings Python
- **intersphinx**: links cross-project (Python stdlib, NumPy, etc.)
- **Multi-format output**: HTML, PDF, ePub
- **Versiones múltiples** vía Read the Docs

**Hosting típico**:
- **Read the Docs** (gratis para open source, integrado)
- GitHub Pages
- Self-hosted

**Cuándo NO Sphinx**:
- Equipo no-Python (curva de aprendizaje del ecosystem)
- No necesitas multi-format
- Quieres algo simple → MkDocs es más fácil

## Read the Docs

Plataforma para hostear docs (especialmente Sphinx).

**Pros**:
- Gratis para open source
- Build automático en cada commit
- Versioning automático (basado en tags Git)
- PR previews
- Subdominios `*.readthedocs.io`

**Config** `.readthedocs.yaml`:
```yaml
version: 2

build:
  os: ubuntu-22.04
  tools:
    python: "3.12"

python:
  install:
    - requirements: docs/requirements.txt

sphinx:
  configuration: docs/conf.py
```

## API docs

Ver `api-documentation.md` para detalles.

### Swagger UI

```html
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({ url: "openapi.yaml", dom_id: '#swagger-ui' });
</script>
```

### Redoc

```html
<redoc spec-url="openapi.yaml"></redoc>
<script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
```

### Stoplight Elements

```html
<elements-api apiDescriptionUrl="openapi.yaml" router="hash"></elements-api>
<script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
```

### Integrar en MkDocs/Docusaurus

**MkDocs** con plugin:
```yaml
plugins:
  - render_swagger
```

**Docusaurus**:
```bash
npm install docusaurus-plugin-openapi-docs
```

## Confluence (corporativo)

**Cuándo**: empresas grandes, mucha doc no técnica, integración con Jira.

**Pros**:
- Bueno para wiki tradicional
- Search built-in
- Permisos granulares
- Templates corporativos

**Cons**:
- Caro (per-user)
- Editor WYSIWYG limita Markdown
- Versioning débil comparado con Git
- Devs lo odian por default

**Strategy híbrida** común:
- Docs de código en repos (Markdown)
- Docs operacionales y de procesos en Confluence
- Linkear entre ambos

## Notion

**Cuándo**: equipos chicos/medianos, productivity + docs, mixed content.

**Pros**:
- Flexibilidad enorme
- Bloques rich (databases, embeds, etc.)
- Mejor UX que Confluence
- Templates community
- Bueno para no-devs también

**Cons**:
- No versionable como Git
- Performance con docs grandes
- Búsqueda decente pero no Algolia-level
- Lock-in propietario (aunque export funciona)
- Caro para empresas grandes

**Strategy**:
- Docs de proyecto en Notion
- Code docs en repos
- API docs en Swagger/Redoc

## Obsidian

**Cuándo**: docs personales, knowledge base, equipos muy chicos.

**Pros**:
- Local-first (markdown files)
- Backlinks entre notas
- Graph view
- Extensible con plugins
- Tu data es tuya (archivos Markdown locales)

**Cons**:
- No tiene web hosting nativo
- Colaboración limitada (sync paid)
- No es web-first

Buena opción para zettelkasten / second brain.

## Docs internos vs públicos

### Docs públicos

- Open source library → **Docusaurus** o **MkDocs Material**
- API pública → **Redoc** o **Swagger UI**
- Marketing site con docs → **Next.js** con MDX
- Tutorial site → **Docusaurus** con blog feature

### Docs internos

- Tech docs del proyecto → **MkDocs** en repo
- Wiki corporativo → **Confluence** o **Notion**
- ADRs/RFCs → Markdown en repo
- Runbooks → Confluence o repo (proximidad al código)

## Search

Docs sin búsqueda son docs muertos.

### Opciones

| Tool | Cómo |
|---|---|
| **Algolia DocSearch** | Gratis para open source, excelente |
| **Lunr.js / Pagefind** | Client-side search, no requiere server |
| **Built-in MkDocs search** | Decente para docs medianos |
| **Built-in Docusaurus search** | Decente |
| **Typesense** | Self-hosted Algolia-like |

### Algolia DocSearch (recomendado para open source)

Aplicar en https://docsearch.algolia.com/apply/. Si aprobado, gratis para siempre.

```html
<script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3"></script>
<script>
  docsearch({
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'YOUR_INDEX',
    container: '#docsearch'
  });
</script>
```

## i18n (multi-idioma)

### Docusaurus

```javascript
// docusaurus.config.js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es', 'pt'],
}
```

```
docs/                    # default (en)
i18n/
  es/
    docusaurus-plugin-content-docs/
      current/
        intro.md         # traducción
  pt/
    ...
```

### MkDocs

Plugin `mkdocs-static-i18n`:
```yaml
plugins:
  - i18n:
      languages:
        - locale: en
          default: true
        - locale: es
```

### Estrategia bilingüe pragmática

- **Una sola fuente de verdad** (idioma principal)
- Traducción **on demand** (no todo, solo lo crítico)
- Marcar docs no traducidas claramente
- Considerar AI/MT para drafts, humano para review final

## Versionado de docs

Para libraries con múltiples versiones activas.

### Docusaurus

```bash
npm run docusaurus docs:version 1.0
```

Crea snapshot de docs/ → versioned_docs/version-1.0/.

URLs: `/docs/intro` (latest), `/docs/1.0/intro` (versión vieja).

### MkDocs

`mike` plugin para multi-version:
```bash
mike deploy --push 1.0
mike deploy --push --update-aliases 1.1 latest
mike set-default --push latest
```

### Sphinx + RTD

Read the Docs hace versioning automático basado en tags Git.

## Performance y SEO

- **Sitemap.xml**: generado automático por mejores herramientas
- **robots.txt**: si docs son públicas, permitir indexing
- **Open Graph tags**: para previews en social media
- **Canonical URLs**: especialmente con i18n y versiones
- **Lazy loading** de imágenes
- **Static generation**: todas las opciones aquí generan HTML estático

## Hosting

| Opción | Cuándo |
|---|---|
| **GitHub Pages** | Open source, simple, gratis |
| **Vercel / Netlify / Cloudflare Pages** | Sitios complejos, edge functions, gratis para hobbyist |
| **Read the Docs** | Docs Python/Sphinx, gratis open source |
| **S3 + CloudFront** | Control total, AWS-integrated (ver skill `aws-cloud`) |
| **Self-hosted (Nginx)** | Empresas con compliance estricto |

Integración con la skill `aws-cloud`: deploy a S3 + CloudFront sigue el patrón Angular SPA.

## CI/CD para docs

```yaml
# .github/workflows/docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - '.github/workflows/docs.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r docs/requirements.txt
      - run: mkdocs gh-deploy --force
```

### PR previews

Vercel/Netlify generan previews automáticos en PRs. Excelente para revisar docs antes de mergear.

## Cuándo cambiar de herramienta

⚠️ Migrar entre herramientas es costoso. Decidir bien primero.

Buenos motivos:
- Crecimiento (de README a sitio completo)
- Cambio de stack (Python → JS = MkDocs → Docusaurus quizá)
- Necesidades nuevas (versioning, i18n)

Malos motivos:
- "Es lo nuevo"
- "Mejor look"
- Aburrimiento del maintainer

Si migrás:
1. Empezar híbrido (vieja + nueva en paralelo)
2. Migrar carpeta por carpeta
3. Redirects de URLs viejas a nuevas
4. Verificar links rotos
5. Cutover cuando esté estable

## Checklist tooling docs

- [ ] Tool apropiado al tamaño/complejidad
- [ ] Markdown como source de verdad
- [ ] Versionable en Git
- [ ] Búsqueda funcional
- [ ] Hosting decidido (probado)
- [ ] CI/CD para deploy automático
- [ ] PR previews
- [ ] Soporte para diagramas (Mermaid)
- [ ] Code highlighting con copy button
- [ ] Responsive (mobile-friendly)
- [ ] Dark mode si users esperan
- [ ] Open Graph tags para sharing
- [ ] Sitemap generado
- [ ] Analytics si necesitas (Plausible, GA, etc.)
- [ ] Link checker en CI
