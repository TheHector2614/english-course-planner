# Documentación de Componentes

Plantillas para documentar componentes generados a partir de Figma.

## Plantilla MDX (Storybook)

```mdx
import { Meta, Story, Canvas, Controls } from '@storybook/blocks';
import { Button } from './Button';

<Meta of={Button} />

# Button

Componente de botón principal del design system.

**Figma**: [Ver en Figma](https://figma.com/design/{fileKey}/...?node-id={nodeId})

## Uso básico

\`\`\`tsx
<Button variant="primary" size="md">Click me</Button>
\`\`\`

## Props

<Controls />

## Variantes

### Primary
<Canvas>
  <Story name="Primary">
    <Button variant="primary">Primary</Button>
  </Story>
</Canvas>

### Secondary
<Canvas>
  <Story name="Secondary">
    <Button variant="secondary">Secondary</Button>
  </Story>
</Canvas>

### Ghost
<Canvas>
  <Story name="Ghost">
    <Button variant="ghost">Ghost</Button>
  </Story>
</Canvas>

## Tamaños

<Canvas>
  <Story name="Sizes">
    <div className="flex gap-2 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  </Story>
</Canvas>

## Estados

<Canvas>
  <Story name="States">
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  </Story>
</Canvas>

## Accesibilidad

- Focus visible con anillo de 2px
- `aria-disabled` cuando está deshabilitado
- Contraste mínimo 4.5:1 cumplido en todas las variantes
- Tamaño de target táctil mínimo 44x44px en `size="md"` y `size="lg"`

## Guías de uso

✅ **Hacer**:
- Usar `primary` para la acción principal de una vista (solo una por sección)
- Usar `secondary` para acciones alternativas
- Usar `ghost` para acciones terciarias o destructivas suaves

❌ **No hacer**:
- No poner más de un `primary` en la misma sección visual
- No usar `disabled` sin proporcionar feedback de por qué está deshabilitado
- No anidar Buttons dentro de otros Buttons
```

## Plantilla README.md (dentro de la carpeta del componente)

```markdown
# Button

Componente de botón del design system.

## Instalación

Si el componente está en una librería interna:
\`\`\`bash
import { Button } from '@/components/ui/Button';
\`\`\`

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `disabled` | `boolean` | `false` | Deshabilita interacción |
| `href` | `string` | - | Si está presente, renderiza como `<a>` |
| `onClick` | `(event: MouseEvent) => void` | - | Handler de click |

## Ejemplos

### Básico
\`\`\`tsx
<Button onClick={() => console.log('clicked')}>
  Click me
</Button>
\`\`\`

### Como link
\`\`\`tsx
<Button href="/dashboard" variant="primary">
  Ir al dashboard
</Button>
\`\`\`

### Con icono
\`\`\`tsx
<Button variant="ghost" size="sm">
  <Icon name="search" />
  Buscar
</Button>
\`\`\`

## Variantes visuales

- **primary**: acción principal (azul)
- **secondary**: acción alternativa (outline)
- **ghost**: acción terciaria (sin fondo)

## Accesibilidad

- ✅ Focus visible con outline
- ✅ Contraste WCAG AA
- ✅ Soporte de teclado (Enter/Space)
- ✅ `aria-disabled` cuando está deshabilitado

## Diseño

[Ver componente en Figma](https://figma.com/design/{fileKey}/...?node-id={nodeId})

## Changelog

- v1.2.0 — Agregada variante `ghost`
- v1.1.0 — Soporte para `href` (renderiza como link)
- v1.0.0 — Versión inicial
```

## Plantilla para Angular (con JSDoc inline)

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

/**
 * Componente de botón del design system.
 *
 * Figma: https://figma.com/design/{fileKey}/...?node-id={nodeId}
 *
 * @example
 * ```html
 * <app-button variant="primary" size="md" (clicked)="onSave()">
 *   Guardar
 * </app-button>
 * ```
 */
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [class]="classes()" [disabled]="disabled()" (click)="clicked.emit($event)">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  /** Estilo visual del botón */
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');

  /** Tamaño del botón */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Deshabilita la interacción */
  disabled = input<boolean>(false);

  /** Emitido al hacer click (solo si no está disabled) */
  clicked = output<MouseEvent>();

  classes = computed(() => {
    // ...
  });
}
```

## Plantilla compacta (componentes secundarios)

Para componentes simples que no ameritan documentación extensa, usar un comentario JSDoc/TSDoc en la cabecera:

```typescript
/**
 * Card básica con padding y sombra.
 *
 * Figma: https://figma.com/design/{fileKey}/...?node-id={nodeId}
 *
 * @example <Card><h2>Título</h2><p>Contenido</p></Card>
 */
export const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">{children}</div>
);
```

## Estructura recomendada por componente

Cada componente del design system debería tener:

```
Button/
├── Button.tsx                (o .component.ts si es Angular)
├── Button.module.css         (si usa CSS modules; opcional con Tailwind)
├── Button.stories.tsx        (si usa Storybook)
├── Button.test.tsx           (solo si pidieron tests)
├── README.md                 (documentación humana)
└── index.ts                  (re-exports)
```

## Mapeo a Figma con Code Connect

Para que Figma muestre el código del componente en Dev Mode:

```typescript
// Button.figma.tsx
import { figma } from '@figma/code-connect';
import { Button } from './Button';

figma.connect(Button, 'https://figma.com/design/{fileKey}/...?node-id={nodeId}', {
  props: {
    variant: figma.enum('Variant', {
      Primary: 'primary',
      Secondary: 'secondary',
      Ghost: 'ghost',
    }),
    size: figma.enum('Size', {
      Small: 'sm',
      Medium: 'md',
      Large: 'lg',
    }),
    disabled: figma.boolean('Disabled'),
    children: figma.children('Label'),
  },
  example: ({ variant, size, disabled, children }) => (
    <Button variant={variant} size={size} disabled={disabled}>
      {children}
    </Button>
  ),
});
```

Publicar con:
```bash
npx @figma/code-connect publish
```

Esto hace que cuando alguien seleccione el componente en Figma, vea el código React/Angular/etc. directamente.
