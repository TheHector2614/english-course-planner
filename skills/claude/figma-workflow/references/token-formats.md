# Formatos de Design Tokens

Plantillas completas para exportar tokens desde Figma a cada formato.

## Estrategia general

Antes de generar, normalizar los tokens extraídos de Figma a una estructura intermedia:

```typescript
interface TokenSet {
  colors: { [path: string]: { value: string; mode?: { light: string; dark: string } } };
  spacing: { [name: string]: string };
  typography: { [name: string]: { fontFamily: string; fontSize: string; fontWeight: number; lineHeight: string; letterSpacing?: string } };
  radii: { [name: string]: string };
  shadows: { [name: string]: string };
  zIndex?: { [name: string]: number };
}
```

Luego generar el formato pedido a partir de esta estructura.

## 1. Tailwind (`tailwind.config.mjs`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx,astro,vue}'],
  darkMode: 'class', // si hay mode dark
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          900: '#171717',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        // Tailwind ya tiene 0-96 por defecto; solo extender si hay valores custom
        '18': '4.5rem',
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cal Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Si el sistema define escalas custom
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
```

**Modes (light/dark)**: en Tailwind se manejan con `dark:` prefix + variables CSS:

```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      bg: 'rgb(var(--color-bg) / <alpha-value>)',
      fg: 'rgb(var(--color-fg) / <alpha-value>)',
    },
  },
}

// styles/global.css
:root {
  --color-bg: 255 255 255;
  --color-fg: 23 23 23;
}
.dark {
  --color-bg: 23 23 23;
  --color-fg: 250 250 250;
}
```

## 2. CSS Variables (`tokens.css`)

```css
:root {
  /* Colors - Brand */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* Colors - Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Colors - Surface (light mode default) */
  --color-bg: #ffffff;
  --color-fg: #171717;
  --color-surface: #fafafa;
  --color-border: #e5e5e5;

  /* Spacing */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Cal Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 1000;
  --z-tooltip: 2000;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-fg: #fafafa;
    --color-surface: #171717;
    --color-border: #262626;
  }
}

/* Manual dark mode (clase) */
.dark {
  --color-bg: #0a0a0a;
  --color-fg: #fafafa;
  --color-surface: #171717;
  --color-border: #262626;
}
```

## 3. JSON/TS (tokens tipados)

```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    neutral: {
      50: '#fafafa',
      900: '#171717',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem',
    16: '4rem',
  },
  typography: {
    'display-xl': {
      fontFamily: 'Cal Sans',
      fontSize: '4.5rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    'body-lg': {
      fontFamily: 'Inter',
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof tokens.colors;
```

### JSON puro (`tokens.json`)

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "colors": {
    "primary": {
      "500": { "$value": "#3b82f6", "$type": "color" }
    }
  },
  "spacing": {
    "4": { "$value": "1rem", "$type": "dimension" }
  }
}
```

## 4. SCSS (`_tokens.scss`)

```scss
// Colors
$color-primary-50: #eff6ff;
$color-primary-500: #3b82f6;
$color-primary-900: #1e3a8a;

$color-neutral-50: #fafafa;
$color-neutral-900: #171717;

$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;

// Mapa para iteración
$colors: (
  'primary-50': $color-primary-50,
  'primary-500': $color-primary-500,
  'success': $color-success,
  'warning': $color-warning,
  'error': $color-error,
);

// Spacing
$spacing: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  4: 1rem,
  8: 2rem,
);

@function space($key) {
  @return map-get($spacing, $key);
}

// Typography
$font-sans: 'Inter', system-ui, sans-serif;
$font-display: 'Cal Sans', sans-serif;

$text-sizes: (
  'xs': (0.75rem, 1rem),
  'sm': (0.875rem, 1.25rem),
  'base': (1rem, 1.5rem),
  'lg': (1.125rem, 1.75rem),
);

@mixin text($size) {
  $values: map-get($text-sizes, $size);
  font-size: nth($values, 1);
  line-height: nth($values, 2);
}

// Radii
$radius-sm: 0.25rem;
$radius-md: 0.5rem;
$radius-lg: 0.75rem;
$radius-full: 9999px;

// Breakpoints
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
);

@mixin breakpoint($key) {
  @media (min-width: map-get($breakpoints, $key)) {
    @content;
  }
}
```

## 5. Style Dictionary (multi-plataforma)

Estructura de carpetas:
```
tokens/
├── color/
│   ├── base.json
│   ├── semantic.json
│   └── mode-dark.json
├── size/
│   ├── spacing.json
│   ├── font.json
│   └── radius.json
├── typography/
│   └── styles.json
└── shadow.json

config.json
build.js
```

### `tokens/color/base.json`

```json
{
  "color": {
    "primary": {
      "50": { "value": "#eff6ff" },
      "500": { "value": "#3b82f6" },
      "900": { "value": "#1e3a8a" }
    },
    "neutral": {
      "50": { "value": "#fafafa" },
      "900": { "value": "#171717" }
    }
  }
}
```

### `config.json`

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [{ "destination": "variables.css", "format": "css/variables" }]
    },
    "scss": {
      "transformGroup": "scss",
      "buildPath": "build/scss/",
      "files": [{ "destination": "_variables.scss", "format": "scss/variables" }]
    },
    "js": {
      "transformGroup": "js",
      "buildPath": "build/js/",
      "files": [{ "destination": "tokens.js", "format": "javascript/es6" }]
    },
    "ts": {
      "transformGroup": "js",
      "buildPath": "build/ts/",
      "files": [{ "destination": "tokens.d.ts", "format": "typescript/es6-declarations" }]
    }
  }
}
```

### `build.js`

```javascript
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary('./config.json');
await sd.buildAllPlatforms();
```

### `package.json` script
```json
{
  "scripts": {
    "tokens:build": "node build.js"
  }
}
```

## Tips de nombrado

- Usar **kebab-case** o nested objects (no camelCase para tokens)
- Jerarquía clara: `color.primary.500` no `primaryColor500`
- Semánticos > literales: `color-error` no `color-red`
- Modes en variables separadas: no `--color-bg-light` y `--color-bg-dark`, sino `--color-bg` que cambia según mode
- Escala consistente: si usas 100-900 para colores, no mezcles con `light/medium/dark`
