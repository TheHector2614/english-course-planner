# Animaciones: Scroll y Parallax

Código completo y listo para usar en `src/scripts/animations.js`.

## Script completo

```js
// src/scripts/animations.js

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  initScrollAnimations();
  initParallax();
}

/**
 * Scroll animations con Intersection Observer
 * Elementos con .animate-on-scroll se animan al entrar al viewport
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * Parallax con requestAnimationFrame para performance óptimo
 * Elementos con [data-parallax] reciben transform basado en scroll
 */
function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (elements.length === 0) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;

    elements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallaxSpeed || '0.3');
      const offset = scrollY * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}
```

## CSS asociado (en `src/styles/global.css`)

```css
/* Animaciones de entrada por scroll */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Variantes opcionales */
.animate-on-scroll[data-animation="fade-left"] {
  transform: translateX(-2rem);
}
.animate-on-scroll[data-animation="fade-left"].is-visible {
  transform: translateX(0);
}

.animate-on-scroll[data-animation="fade-right"] {
  transform: translateX(2rem);
}
.animate-on-scroll[data-animation="fade-right"].is-visible {
  transform: translateX(0);
}

.animate-on-scroll[data-animation="scale"] {
  transform: scale(0.95);
}
.animate-on-scroll[data-animation="scale"].is-visible {
  transform: scale(1);
}

/* Stagger delays (aplicar con clase) */
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }
.delay-500 { transition-delay: 500ms; }

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  [data-parallax] {
    transform: none !important;
  }
}
```

## Uso en componentes

```astro
<!-- Animación básica al hacer scroll -->
<div class="animate-on-scroll">
  Aparece con fade + slide up
</div>

<!-- Con delay para stagger -->
<div class="animate-on-scroll delay-200">Segundo</div>
<div class="animate-on-scroll delay-400">Tercero</div>

<!-- Variante de animación -->
<div class="animate-on-scroll" data-animation="fade-left">Aparece desde izquierda</div>

<!-- Parallax (típicamente en Hero o fondos) -->
<div class="absolute inset-0" data-parallax data-parallax-speed="0.5">
  <img src="/bg.jpg" alt="" />
</div>

<!-- Parallax inverso (sube al hacer scroll) -->
<div data-parallax data-parallax-speed="-0.3"></div>
```

## Microinteracciones con solo Tailwind

```astro
<!-- Botón -->
<a class="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95">
  Click me
</a>

<!-- Card -->
<div class="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
  ...
</div>

<!-- Link con underline animado -->
<a class="relative group">
  Link
  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-current transition-all group-hover:w-full"></span>
</a>

<!-- Icono con rotación -->
<button class="group">
  <svg class="transition-transform group-hover:rotate-12">...</svg>
</button>
```

## Performance tips

1. **`will-change` con cuidado**: solo en el momento de la animación, no permanentemente
2. **`translate3d` en lugar de `top/left`**: usa GPU
3. **Pasivos en listeners de scroll**: `{ passive: true }`
4. **`requestAnimationFrame`**: nunca actualizar estilos directamente en `scroll`
5. **`IntersectionObserver`** > `getBoundingClientRect()` en loop
6. **`unobserve` después de animar**: libera memoria
