# Plantillas de Componentes

Plantillas base para cada sección. Adaptar paleta y contenido según cliente.

## BaseLayout.astro

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

const { title, description, ogImage = '/og-default.jpg', canonical } = Astro.props;
const canonicalURL = canonical || new URL(Astro.url.pathname, Astro.site).toString();
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonicalURL} />

    <title>{title}</title>
    <meta name="description" content={description} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, Astro.site).toString()} />
  </head>
  <body class="bg-white text-slate-900 antialiased">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg focus:z-50">
      Saltar al contenido
    </a>
    <slot />
    <script src="/src/scripts/animations.js"></script>
  </body>
</html>
```

## Hero.astro

```astro
---
import Container from './ui/Container.astro';
import Button from './ui/Button.astro';
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
import site from '../content/site.json';

const { hero } = site;
---

<section class="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden" aria-labelledby="hero-title">
  <div class="absolute inset-0 -z-10" data-parallax data-parallax-speed="0.3">
    <!-- fondo con parallax opcional -->
  </div>

  <Container>
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div class="animate-on-scroll">
        <h1 id="hero-title" class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          {hero.title}
        </h1>
        <p class="mt-6 text-lg md:text-xl text-slate-600">
          {hero.subtitle}
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4">
          <Button href={hero.cta.href} variant="primary">{hero.cta.label}</Button>
          <Button href={hero.ctaSecondary.href} variant="secondary">{hero.ctaSecondary.label}</Button>
        </div>
      </div>
      <div class="animate-on-scroll" style="transition-delay: 200ms">
        <Image src={heroImage} alt={hero.imageAlt} loading="eager" class="rounded-2xl shadow-2xl" />
      </div>
    </div>
  </Container>
</section>
```

## FAQ.astro (acordeón accesible)

```astro
---
import Container from './ui/Container.astro';
import site from '../content/site.json';
const { faq } = site;
---

<section class="py-16 md:py-24 bg-slate-50" aria-labelledby="faq-title">
  <Container>
    <h2 id="faq-title" class="text-3xl md:text-4xl font-bold text-center">Preguntas frecuentes</h2>
    <div class="mt-12 max-w-3xl mx-auto space-y-4">
      {faq.items.map((item) => (
        <details class="group bg-white rounded-lg shadow-sm">
          <summary class="flex justify-between items-center cursor-pointer p-6 font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 rounded-lg">
            <span>{item.question}</span>
            <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div class="px-6 pb-6 text-slate-600">{item.answer}</div>
        </details>
      ))}
    </div>
  </Container>
</section>
```

## ContactForm.astro

```astro
---
import Container from './ui/Container.astro';
---

<section class="py-16 md:py-24" aria-labelledby="contact-title">
  <Container>
    <h2 id="contact-title" class="text-3xl md:text-4xl font-bold text-center">Contáctanos</h2>
    <form class="mt-12 max-w-xl mx-auto space-y-6" id="contact-form" novalidate>
      <div>
        <label for="name" class="block text-sm font-medium">Nombre</label>
        <input type="text" id="name" name="name" required
          class="mt-1 w-full rounded-md border-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-describedby="name-error" />
        <p id="name-error" class="text-sm text-red-600 hidden" role="alert"></p>
      </div>
      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input type="email" id="email" name="email" required
          class="mt-1 w-full rounded-md border-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-describedby="email-error" />
        <p id="email-error" class="text-sm text-red-600 hidden" role="alert"></p>
      </div>
      <div>
        <label for="message" class="block text-sm font-medium">Mensaje</label>
        <textarea id="message" name="message" rows="4" required
          class="mt-1 w-full rounded-md border-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500"></textarea>
      </div>
      <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-md font-semibold hover:bg-primary-700 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500">
        Enviar mensaje
      </button>
    </form>
  </Container>
</section>
```

## Container.astro y Button.astro

```astro
---
// Container.astro
---
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <slot />
</div>
```

```astro
---
// Button.astro
interface Props {
  href: string;
  variant?: 'primary' | 'secondary';
}
const { href, variant = 'primary' } = Astro.props;
const base = 'inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2';
const styles = variant === 'primary'
  ? 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500'
  : 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500';
---
<a href={href} class={`${base} ${styles}`}><slot /></a>
```

## site.json (ejemplo)

```json
{
  "site": {
    "name": "Nombre del producto",
    "url": "https://ejemplo.com"
  },
  "hero": {
    "title": "Headline principal en una línea potente",
    "subtitle": "Subtítulo que explica la propuesta de valor",
    "imageAlt": "Descripción de la imagen del hero",
    "cta": { "label": "Empezar ahora", "href": "#contact" },
    "ctaSecondary": { "label": "Ver demo", "href": "#features" }
  },
  "features": [
    { "icon": "lucide:zap", "title": "Rápido", "description": "..." }
  ],
  "faq": {
    "items": [
      { "question": "¿Pregunta?", "answer": "Respuesta." }
    ]
  }
}
```
