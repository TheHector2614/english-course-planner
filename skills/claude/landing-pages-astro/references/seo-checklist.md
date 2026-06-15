# Checklist de SEO

## Meta tags obligatorios en `<head>`

- [ ] `<meta charset="UTF-8">`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] `<title>` único de 50-60 caracteres
- [ ] `<meta name="description">` de 150-160 caracteres
- [ ] `<link rel="canonical">` con URL absoluta
- [ ] `<html lang="...">` con código de idioma correcto

## Open Graph (compartido en redes sociales)

- [ ] `og:type` (website, article, product)
- [ ] `og:url` (URL absoluta)
- [ ] `og:title`
- [ ] `og:description`
- [ ] `og:image` (1200x630px, URL absoluta, < 5MB)
- [ ] `og:image:alt`
- [ ] `og:site_name`
- [ ] `og:locale` (ej: `es_ES`)

## Twitter Card

- [ ] `twitter:card` = `summary_large_image`
- [ ] `twitter:title`
- [ ] `twitter:description`
- [ ] `twitter:image`
- [ ] `twitter:site` (handle de la marca)

## Estructura HTML para SEO

- [ ] Un solo `<h1>` por página (en el Hero)
- [ ] Jerarquía H1 → H2 → H3 sin saltos
- [ ] `<main>` envolviendo el contenido principal
- [ ] Links internos con texto descriptivo (no "click aquí")
- [ ] Atributo `rel="noopener noreferrer"` en links externos con `target="_blank"`

## Imágenes

- [ ] Todas con `alt` descriptivo (vacío `alt=""` solo si son decorativas)
- [ ] Usar `<Image />` de `astro:assets` para WebP/AVIF automático
- [ ] `width` y `height` definidos (evita CLS)
- [ ] Imagen del Hero con `loading="eager"`, resto con `loading="lazy"`
- [ ] `og:image` con dimensiones recomendadas (1200x630)

## JSON-LD (Schema.org)

Incluir según tipo de negocio. Ejemplos:

### Organization
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nombre Empresa",
  "url": "https://ejemplo.com",
  "logo": "https://ejemplo.com/logo.png",
  "sameAs": [
    "https://twitter.com/empresa",
    "https://linkedin.com/company/empresa"
  ]
}
</script>
```

### LocalBusiness
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "...",
  "address": { "@type": "PostalAddress", "addressLocality": "...", "addressCountry": "..." },
  "telephone": "+57...",
  "openingHours": "Mo-Fr 09:00-18:00"
}
</script>
```

### Product (si la landing vende un producto)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "offers": { "@type": "Offer", "price": "...", "priceCurrency": "USD" }
}
</script>
```

### FAQPage (si hay sección FAQ)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "¿Pregunta?", "acceptedAnswer": { "@type": "Answer", "text": "Respuesta" } }
  ]
}
</script>
```

## Archivos en raíz

- [ ] `robots.txt` permitiendo crawl (`User-agent: *  Allow: /  Sitemap: ...`)
- [ ] `sitemap.xml` generado con `@astrojs/sitemap`
- [ ] `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` (180x180)
- [ ] `site.webmanifest` para PWA básica

## Performance (afecta ranking)

- [ ] Imágenes optimizadas (WebP/AVIF)
- [ ] Fuentes self-hosted con `font-display: swap`
- [ ] CSS crítico inline o `<link rel="preload">`
- [ ] JS mínimo (Astro es HTML estático por defecto)
- [ ] Compresión gzip/brotli activada en servidor
- [ ] Test con Lighthouse: meta de 95+ en Performance, Accessibility, SEO

## Configuración de Astro

En `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ejemplo.com',
  integrations: [tailwind(), sitemap()],
  build: { inlineStylesheets: 'auto' },
});
```
