# Design-to-Code: Reglas de Mapeo

Reglas para convertir nodos de Figma a código limpio y mantenible.

## Mapeo de estructura

### Frames con Auto Layout → Flexbox/Grid

| Figma Auto Layout | CSS/Tailwind |
|---|---|
| Direction: Horizontal | `flex flex-row` |
| Direction: Vertical | `flex flex-col` |
| Direction: Wrap | `flex flex-wrap` |
| Alignment: Start | `items-start` o `justify-start` |
| Alignment: Center | `items-center` o `justify-center` |
| Alignment: End | `items-end` o `justify-end` |
| Distribution: Space between | `justify-between` |
| Gap: 16px | `gap-4` |
| Padding: 16px all | `p-4` |
| Padding: 16px horizontal, 8px vertical | `px-4 py-2` |
| Fill container | `flex-1` o `w-full` |
| Hug contents | sin width/height (default) |
| Fixed size | `w-[size] h-[size]` |

### Grid

Si el Auto Layout tiene wrap + tamaño fijo de hijos, evaluar si conviene `grid` en lugar de `flex flex-wrap`:

```html
<!-- Auto Layout horizontal con wrap, 3 cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- cards -->
</div>
```

### Frames anidados → estructura semántica

No mapear 1:1 `<div>` por cada frame. Identificar el rol semántico:

| Rol detectado | HTML |
|---|---|
| Frame root de página | `<main>` |
| Header con logo + nav | `<header>` + `<nav>` |
| Hero / banner | `<section>` con `aria-labelledby` |
| Tarjetas en lista | `<article>` o `<li>` |
| Footer | `<footer>` |
| Sidebar | `<aside>` |
| Botón de acción | `<button>` (no `<div>` con onClick) |
| Link de navegación | `<a>` |
| Imagen | `<img>` con `alt` (o `<Image>` optimizado) |
| Texto encabezado | `<h1>` - `<h6>` según jerarquía |
| Párrafo | `<p>` |
| Lista | `<ul>` / `<ol>` / `<li>` |

## Mapeo de componentes Figma → componentes de código

### Componente con variantes

Figma:
```
Component: Button
  Variants:
    - variant: primary | secondary | ghost
    - size: sm | md | lg
    - state: default | hover | disabled
```

Código (Angular):
```typescript
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class]="classes()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();

  classes = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition focus-visible:ring-2 focus-visible:ring-offset-2';
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50',
      ghost: 'text-primary-600 hover:bg-primary-50',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });
}
```

Código (Astro):
```astro
---
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}
const { variant = 'primary', size = 'md', href } = Astro.props;

const base = 'inline-flex items-center justify-center font-medium rounded-md transition focus-visible:ring-2 focus-visible:ring-offset-2';
const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
};
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
const cls = `${base} ${variants[variant]} ${sizes[size]}`;
const Tag = href ? 'a' : 'button';
---
<Tag class={cls} href={href}>
  <slot />
</Tag>
```

### Componente con boolean property

Figma: `Component / Button` con prop `hasIcon: true | false`

Código:
```typescript
icon = input<string | null>(null);
```

Template:
```html
<button>
  @if (icon()) {
    <svg [attr.aria-hidden]="true">...</svg>
  }
  <ng-content />
</button>
```

## Mapeo de texto

### Text styles → clases tipográficas

Figma define text styles (e.g. "Display / XL", "Body / LG"). En código:

```html
<!-- Si usas Tailwind con tokens custom -->
<h1 class="text-display-xl">Headline</h1>
<p class="text-body-lg">Body text</p>

<!-- Si usas clases utility -->
<h1 class="text-5xl font-bold leading-tight tracking-tight">Headline</h1>
<p class="text-lg leading-relaxed">Body text</p>
```

### Jerarquía semántica

El text style NO determina el tag HTML. Determinar por el rol visual y de contenido:

- Un solo `<h1>` por página (el título principal)
- `<h2>` para títulos de sección
- `<h3>` para subtítulos dentro de sección
- No saltar niveles (no h2 → h4 directo)

Un texto con style "Display XL" puede ser `<h1>` en una landing page pero `<p>` en otra parte si es solo grande visualmente, no es título.

## Mapeo de imágenes

### En Astro
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---
<Image src={heroImage} alt="Descripción" width={1200} height={600} loading="eager" />
```

### En Angular
```html
<img ngSrc="/assets/hero.jpg" alt="Descripción" width="1200" height="600" priority />
```

### En Next.js
```jsx
import Image from 'next/image';
<Image src="/hero.jpg" alt="Descripción" width={1200} height={600} priority />
```

### En HTML puro
```html
<img src="/hero.jpg" alt="Descripción" width="1200" height="600" loading="eager" />
```

**Reglas**:
- Usar nombre descriptivo de Figma como punto de partida del `alt`
- `loading="eager"` o `priority` solo en imagen above-the-fold (Hero)
- Especificar dimensiones siempre (evita CLS)
- Convertir a WebP/AVIF si el framework lo soporta

## Mapeo de iconos

Si en Figma hay un icono vectorial:

### Opción 1: Librería de iconos (recomendado si coincide)
```astro
---
import { Icon } from 'astro-icon/components';
---
<Icon name="lucide:search" class="w-5 h-5" />
```

### Opción 2: SVG inline (para iconos custom)
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <!-- paths del SVG exportado de Figma -->
</svg>
```

**Reglas**:
- `aria-hidden="true"` si es decorativo
- `aria-label` si el icono es la única indicación de un botón
- Usar `currentColor` en el stroke/fill para que herede el color del padre
- Limpiar el SVG exportado (quitar IDs random, defs no usadas)

## Mapeo de responsive

### Si hay frames por breakpoint

Figma típicamente tiene:
- Mobile (375px o 390px)
- Tablet (768px) — opcional
- Desktop (1280px o 1440px)

Generar mobile-first:

```html
<div class="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
  <!-- diferentes layouts según breakpoint -->
</div>
```

### Si solo hay desktop

Inferir el comportamiento mobile aplicando reglas estándar:
- Multi-column grids → stack vertical
- Side-by-side images + text → stack
- Horizontal navbar → hamburguesa
- Padding lateral grande → reducir en mobile

**Confirmar con el usuario** cuando haya ambigüedad.

## Mapeo de estados interactivos

Figma puede definir variantes `hover`, `focus`, `pressed`, `disabled`. Mapear:

```html
<button class="
  bg-primary-600 text-white
  hover:bg-primary-700
  focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
  active:bg-primary-800
  disabled:opacity-50 disabled:cursor-not-allowed
  transition
">
  Click me
</button>
```

**Reglas**:
- `focus-visible` en lugar de `focus` (solo muestra outline cuando se navega con teclado)
- `transition` siempre que haya hover/active states
- `disabled:` para el estado deshabilitado, no solo deshabilitar visualmente con opacity

## Mapeo de sombras y effects

Figma effects (drop shadow, inner shadow, blur, layer blur) → CSS:

```css
/* Drop shadow */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Inner shadow */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);

/* Blur de fondo */
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);

/* Layer blur */
filter: blur(4px);
```

Con Tailwind: `shadow-md`, `shadow-inner`, `backdrop-blur`, `blur-sm`.

## Workflow recomendado para un componente

1. **Obtener contexto del nodo** con `Figma:get_design_context`
2. **Si es un componente del design system**, verificar con `get_context_for_code_connect` para ver props y variantes
3. **Identificar el rol semántico** (botón, card, sección, etc.)
4. **Definir API del componente** en código (props/inputs)
5. **Mapear estructura** (Auto Layout → flex/grid)
6. **Aplicar tokens** (no valores hardcoded)
7. **Generar estados** (hover, focus, disabled)
8. **Verificar accesibilidad** (semántica, ARIA, contraste)
9. **Probar responsive** (si aplica)
10. **Opcional: Code Connect** para vincular Figma ↔ código
