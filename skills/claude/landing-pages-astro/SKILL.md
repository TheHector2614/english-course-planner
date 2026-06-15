---
name: landing-pages-astro
description: Crea landing pages y sitios de marketing completos usando Astro + Tailwind CSS, con estructura modular de componentes, mobile-first, accesibilidad WCAG, SEO optimizado y animaciones avanzadas (scroll animations, parallax). Activa esta skill SIEMPRE que el usuario pida una "landing", "landing page", "página de aterrizaje", "sitio de marketing", "página de ventas", "sitio promocional", "one-pager", "página de producto", "página de captura", o describa un proyecto que incluya secciones típicas de landing (hero, features, pricing, testimonios, FAQ, CTA, formulario de contacto). También úsala cuando el usuario mencione "Astro" junto con cualquier tarea de sitio web de marketing, aunque no diga literalmente "landing".
---

# Landing Pages con Astro + Tailwind

Skill para crear landing pages y sitios de marketing profesionales con Astro + Tailwind CSS siguiendo convenciones específicas.

## Stack obligatorio

- **Framework**: Astro (última versión estable)
- **Estilos**: Tailwind CSS (instalado vía `@astrojs/tailwind`)
- **Imágenes**: `astro:assets` para optimización automática
- **Iconos**: `astro-icon` con sets de Iconify (preferir `lucide` o `heroicons`)
- **Animaciones**: combinación de Tailwind + Intersection Observer API + CSS `@keyframes`. Para parallax usar `transform: translateY()` con scroll listener o CSS `transform: translate3d()` para mejor performance

## Estructura de proyecto obligatoria

Toda landing debe entregarse con esta estructura completa de archivos:

```
src/
├── components/
│   ├── Navbar.astro
│   ├── Hero.astro
│   ├── Features.astro
│   ├── Logos.astro          (logos de clientes/partners)
│   ├── Testimonials.astro
│   ├── Pricing.astro
│   ├── FAQ.astro
│   ├── ContactForm.astro
│   ├── FinalCTA.astro
│   ├── Footer.astro
│   └── ui/                  (componentes reutilizables)
│       ├── Button.astro
│       ├── Container.astro
│       └── SectionTitle.astro
├── layouts/
│   └── BaseLayout.astro     (HTML base con SEO y meta tags)
├── pages/
│   └── index.astro          (compone todas las secciones)
├── scripts/
│   └── animations.js        (scroll observer y parallax)
├── styles/
│   └── global.css           (variables CSS, animaciones globales)
└── content/
    └── site.json            (textos, datos, configuración central)
astro.config.mjs
tailwind.config.mjs
package.json
tsconfig.json
README.md
```

**Regla clave**: el contenido (textos, precios, FAQs, testimonios) va en `src/content/site.json` para que sea editable sin tocar componentes. Los componentes leen de ahí.

## Convenciones de código

### Nombrado
- Componentes: `PascalCase.astro` (ej: `Hero.astro`, `ContactForm.astro`)
- Archivos JS/CSS: `kebab-case` (ej: `animations.js`, `global.css`)
- Clases CSS personalizadas: `kebab-case` con prefijo cuando sea ambiguo

### Estructura de un componente Astro
```astro
---
// 1. Imports
import Container from './ui/Container.astro';

// 2. Props tipadas
interface Props {
  title: string;
  subtitle?: string;
}
const { title, subtitle } = Astro.props;

// 3. Data local si aplica
---

<section class="..." aria-labelledby="...">
  <Container>
    <!-- contenido -->
  </Container>
</section>

<style>
  /* solo si se necesita CSS que Tailwind no cubre */
</style>

<script>
  /* solo si se necesita JS específico del componente */
</script>
```

### Tailwind
- **Mobile-first siempre**: clases base sin prefijo, luego `sm:`, `md:`, `lg:`, `xl:`
- Breakpoints estándar: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Usar `@apply` solo cuando se repita mucha combinación; preferir clases inline
- Definir paleta del cliente en `tailwind.config.mjs` bajo `theme.extend.colors`

## Accesibilidad obligatoria (WCAG AA mínimo)

Todo componente debe cumplir:

- **HTML semántico**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` (nunca solo `<div>` para estructura)
- **Encabezados jerárquicos**: un solo `<h1>` por página (en el Hero), luego `<h2>` para cada sección
- **Alt en imágenes**: descriptivo y específico; usar `alt=""` SOLO si es puramente decorativa
- **ARIA**: `aria-labelledby` en secciones, `aria-label` en botones de icono, `aria-expanded` en acordeones del FAQ, `aria-current="page"` en navbar
- **Foco visible**: nunca quitar outline sin reemplazarlo (`focus-visible:ring-2 focus-visible:ring-offset-2`)
- **Contraste**: mínimo 4.5:1 texto normal, 3:1 texto grande. Verificar con el color del cliente
- **Formularios**: cada input con `<label>` asociado (`for`/`id`), mensajes de error con `aria-describedby`, `aria-invalid` cuando falle validación
- **Skip link**: link "Saltar al contenido" oculto que aparece al tabular
- **Reduce motion**: respetar `prefers-reduced-motion` desactivando animaciones complejas

## SEO obligatorio

En `BaseLayout.astro` incluir siempre:

- `<html lang="...">` con idioma del cliente
- `<meta charset="UTF-8">` y `<meta name="viewport">`
- Title único y descriptivo (50-60 caracteres)
- `<meta name="description">` (150-160 caracteres)
- Open Graph completo: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">`
- Favicon y apple-touch-icon
- JSON-LD con `Schema.org` (Organization, LocalBusiness, o Product según el caso)
- `sitemap.xml` y `robots.txt` (usar `@astrojs/sitemap`)

Pasar título, descripción y OG image como props al layout desde `index.astro`.

## Animaciones (scroll + parallax)

Por defecto incluir en `src/scripts/animations.js`:

1. **Intersection Observer para fade-in al hacer scroll**:
   - Elementos con clase `.animate-on-scroll` empiezan con `opacity-0 translate-y-8`
   - Al entrar al viewport se les agrega `.is-visible` que transiciona a `opacity-100 translate-y-0`
   - Stagger opcional con `transition-delay` por índice

2. **Parallax en Hero o secciones destacadas**:
   - Listener `scroll` con `requestAnimationFrame`
   - Aplicar `transform: translate3d(0, scrollY * 0.3, 0)` a elementos con `data-parallax`
   - Velocidad configurable vía atributo `data-parallax-speed`

3. **Hover effects con Tailwind**:
   - Botones: `transition-all hover:scale-105 hover:shadow-lg`
   - Cards: `hover:-translate-y-1 hover:shadow-xl transition`

4. **Reduce motion**:
   - Envolver scripts con check `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`
   - En CSS: `@media (prefers-reduced-motion: reduce) { ... transition: none; }`

## Secciones estándar (todas obligatorias por defecto)

El `index.astro` debe componer estas secciones en este orden, a menos que el usuario indique otro:

1. **Navbar** — logo + links + CTA + menú mobile (hamburguesa con `aria-expanded`)
2. **Hero** — `<h1>`, subtítulo, CTA principal + secundario, imagen/ilustración con parallax
3. **Logos** — grid de logos de clientes/partners (escala de grises + hover a color)
4. **Features** — 3-6 features con icono + título + descripción, grid responsive
5. **Testimonials** — carrusel o grid con foto, nombre, cargo, quote
6. **Pricing** — 2-3 planes con plan destacado (escala mayor + badge "Recomendado")
7. **FAQ** — acordeón accesible con `<details>/<summary>` o componente custom con ARIA
8. **ContactForm** — name, email, mensaje + validación HTML5 + manejo de envío
9. **FinalCTA** — banner con headline potente + botón
10. **Footer** — links agrupados, redes sociales, copyright, legales

Si el usuario pide menos secciones, omitir las no solicitadas pero **mantener el orden** de las que sí incluya.

## Personalización por cliente

Como el estilo visual depende del cliente:

1. **Preguntar al inicio** (si no fue especificado): paleta de colores (primario, secundario, acento), tipografía preferida, tono (corporativo, juvenil, premium, etc.), referencias visuales
2. **Aplicar en**:
   - `tailwind.config.mjs`: extender `colors`, `fontFamily`
   - `src/styles/global.css`: variables CSS custom properties
   - `src/content/site.json`: textos del cliente
3. **Fuentes**: usar `@fontsource` para fuentes Google self-hosted (mejor performance) en lugar de CDN

## Performance

Aplicar siempre:

- Imágenes con `<Image />` de `astro:assets` (genera WebP/AVIF, lazy loading, dimensiones)
- `loading="eager"` solo en imagen del Hero (LCP)
- Fuentes con `font-display: swap`
- Minificación automática de Astro (no usar JS innecesario; preferir CSS puro)
- `client:visible` solo si hay islas interactivas (la mayoría debe ser HTML estático)

## Proceso para generar una landing

Cuando el usuario pida una landing:

1. **Si falta info crítica, preguntar**: rubro/industria del cliente, paleta de colores, nombre del producto/empresa, propuesta de valor en una frase, secciones que sí o sí necesita
2. **Crear los archivos** en `/mnt/user-data/outputs/<nombre-proyecto>/` siguiendo la estructura completa
3. **Generar `README.md`** con instrucciones de instalación (`npm install`, `npm run dev`, `npm run build`) y cómo personalizar editando `site.json` y `tailwind.config.mjs`
4. **Presentar archivos** al final con `present_files`
5. **Mostrar al usuario** un resumen breve: qué secciones se incluyeron, dónde editar contenido, cómo correr el proyecto

## Recursos de referencia

Si necesitas detalles específicos sobre un patrón concreto, consulta:

- `references/component-templates.md` — plantillas de cada sección con código completo
- `references/seo-checklist.md` — checklist completo de SEO técnico y meta tags
- `references/accessibility-patterns.md` — patrones ARIA específicos (FAQ, navbar mobile, formularios)
- `references/animation-snippets.md` — código listo de scroll observer y parallax

## Lo que NUNCA hay que hacer

- Usar `<div>` para estructura cuando hay etiqueta semántica disponible
- Olvidar `alt` en imágenes (aunque sea `alt=""`)
- Hardcodear textos en componentes (deben venir de `site.json` o props)
- Usar fuentes desde CDN externo sin self-hosting
- Quitar outline de foco sin reemplazo accesible
- Usar `!important` en Tailwind (refactorizar la especificidad)
- Crear landing sin meta tags Open Graph
- Omitir `prefers-reduced-motion` cuando hay animaciones
- Entregar archivo único cuando el usuario espera proyecto completo
