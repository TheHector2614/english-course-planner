# Patrones de Accesibilidad

Referencia para implementar componentes interactivos accesibles (WCAG 2.1 AA).

## Navbar mobile (menú hamburguesa)

```astro
<nav aria-label="Navegación principal">
  <button
    id="menu-toggle"
    type="button"
    aria-expanded="false"
    aria-controls="mobile-menu"
    class="md:hidden focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <span class="sr-only">Abrir menú</span>
    <svg aria-hidden="true">...</svg>
  </button>

  <ul id="mobile-menu" class="hidden md:flex" role="list">
    <li><a href="#features" aria-current={current === 'features' ? 'page' : undefined}>Features</a></li>
  </ul>
</nav>

<script>
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  btn?.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu?.classList.toggle('hidden');
  });
</script>
```

**Reglas**:
- Cerrar menú con tecla `Escape`
- Trap focus dentro del menú cuando esté abierto en mobile
- `aria-current="page"` en el link activo

## FAQ acordeón

**Opción A: Nativa con `<details>/<summary>`** (más simple, totalmente accesible por defecto):

```astro
<details class="group">
  <summary class="cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2">
    ¿Pregunta?
  </summary>
  <div>Respuesta</div>
</details>
```

**Opción B: Custom con ARIA** (si se necesita control de animación):

```html
<div class="faq-item">
  <h3>
    <button
      type="button"
      aria-expanded="false"
      aria-controls="faq-1-panel"
      id="faq-1-trigger"
    >
      ¿Pregunta?
    </button>
  </h3>
  <div id="faq-1-panel" role="region" aria-labelledby="faq-1-trigger" hidden>
    Respuesta
  </div>
</div>
```

## Formularios accesibles

```astro
<form novalidate>
  <div>
    <label for="email" class="block">
      Email <span aria-label="requerido">*</span>
    </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      autocomplete="email"
      aria-describedby="email-help email-error"
      aria-invalid="false"
    />
    <p id="email-help" class="text-sm text-slate-500">Te enviaremos confirmación aquí</p>
    <p id="email-error" class="text-sm text-red-600" role="alert" hidden></p>
  </div>
</form>
```

**Reglas**:
- Cada `<input>` con su `<label for>` correspondiente
- `autocomplete` apropiado (`name`, `email`, `tel`, `address-level2`, etc.)
- Errores con `role="alert"` para que se anuncien
- `aria-invalid="true"` al fallar validación
- Asteriscos visuales con `aria-label="requerido"` para lectores de pantalla

## Skip link

```astro
<a
  href="#main"
  class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg focus:z-50"
>
  Saltar al contenido principal
</a>
<main id="main">...</main>
```

## Foco visible

Nunca hacer esto:
```css
*:focus { outline: none; } /* ❌ MAL */
```

Siempre con reemplazo:
```css
*:focus { outline: none; }
*:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}
```

O con Tailwind:
```html
<button class="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
```

## Contraste

- Texto normal (< 18px): mínimo 4.5:1
- Texto grande (≥ 18px o 14px bold): mínimo 3:1
- Componentes UI (bordes, iconos): mínimo 3:1

Validar con herramientas como WebAIM Contrast Checker antes de fijar paleta.

## Reduce motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  // inicializar parallax, scroll animations, etc.
}
```

## Imágenes decorativas vs informativas

```html
<!-- Decorativa (puro adorno): -->
<img src="..." alt="" role="presentation" />

<!-- Informativa: -->
<img src="..." alt="Descripción concreta de lo que muestra" />

<!-- Funcional (en botón sin texto): -->
<button aria-label="Cerrar">
  <svg aria-hidden="true">...</svg>
</button>
```

## sr-only utility (Tailwind ya la incluye)

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
