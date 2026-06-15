# Patrones de Componentes

Patrones avanzados para componentes Angular 17+.

## ViewChild con signal queries

```typescript
import { Component, viewChild, ElementRef, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  template: `<input #searchInput type="text" />`,
})
export class SearchComponent {
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    afterNextRender(() => {
      this.searchInput()?.nativeElement.focus();
    });
  }
}
```

## ContentChild y proyección de contenido

```typescript
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article class="card">
      <header>
        <ng-content select="[card-header]" />
      </header>
      <div class="card-body">
        <ng-content />
      </div>
      <footer>
        <ng-content select="[card-footer]" />
      </footer>
    </article>
  `,
})
export class CardComponent {}

// Uso:
// <app-card>
//   <h2 card-header>Título</h2>
//   <p>Cuerpo</p>
//   <button card-footer>Acción</button>
// </app-card>
```

## Host bindings

```typescript
@Component({
  selector: 'app-button',
  standalone: true,
  host: {
    'class': 'inline-flex items-center justify-center',
    '[class.disabled]': 'disabled()',
    '[attr.role]': '"button"',
    '[attr.aria-disabled]': 'disabled()',
    '(click)': 'onClick($event)',
  },
  template: `<ng-content />`,
})
export class ButtonComponent {
  disabled = input<boolean>(false);

  onClick(event: MouseEvent): void {
    if (this.disabled()) event.preventDefault();
  }
}
```

## Componentes dinámicos

```typescript
import { Component, ViewContainerRef, inject, signal } from '@angular/core';

@Component({
  selector: 'app-host',
  standalone: true,
  template: `<ng-container #container />`,
})
export class HostComponent {
  container = viewChild('container', { read: ViewContainerRef });

  async loadComponent(name: string) {
    const ref = this.container();
    if (!ref) return;
    ref.clear();

    const { DynamicComponent } = await import(`./dynamic/${name}.component`);
    const compRef = ref.createComponent(DynamicComponent);
    compRef.setInput('data', { foo: 'bar' });
  }
}
```

## Effects con signals

```typescript
import { Component, effect, signal, inject } from '@angular/core';

@Component({...})
export class ThemeComponent {
  private storage = inject(LocalStorageService);
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => {
      const current = this.theme();
      document.documentElement.setAttribute('data-theme', current);
      this.storage.set('theme', current);
    });
  }
}
```

**Reglas con `effect()`**:
- No modificar signals dentro de un effect (genera warning)
- Para modificar signals usar `allowSignalWrites: true` (raramente)
- Effects se limpian automáticamente al destruirse el componente

## DestroyRef en lugar de OnDestroy

```typescript
import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class FeedComponent {
  private destroyRef = inject(DestroyRef);
  private feedService = inject(FeedService);

  ngOnInit() {
    // Opción 1: takeUntilDestroyed
    this.feedService.stream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => /* ... */);

    // Opción 2: callback manual
    this.destroyRef.onDestroy(() => {
      // cleanup custom
    });
  }
}
```

## Comunicación padre-hijo con signals

```typescript
// Hijo
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ value() }}</span>
    <button (click)="increment()">+</button>
  `,
})
export class CounterComponent {
  value = input.required<number>();
  valueChange = output<number>();

  increment(): void { this.valueChange.emit(this.value() + 1); }
  decrement(): void { this.valueChange.emit(this.value() - 1); }
}

// Padre
@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CounterComponent],
  template: `<app-counter [value]="count()" (valueChange)="count.set($event)" />`,
})
export class ParentComponent {
  count = signal(0);
}
```

## Model inputs (two-way binding moderno)

```typescript
// Componente con model()
@Component({
  selector: 'app-toggle',
  standalone: true,
  template: `<input type="checkbox" [checked]="checked()" (change)="toggle()" />`,
})
export class ToggleComponent {
  checked = model<boolean>(false);

  toggle(): void {
    this.checked.update(v => !v);
  }
}

// Uso con sintaxis [()]
// <app-toggle [(checked)]="isActive" />
```

## Componentes deferred

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder (minimum 500ms) {
  <div class="skeleton">Cargando...</div>
} @loading (minimum 1s) {
  <app-spinner />
} @error {
  <p>Error cargando el gráfico</p>
}

@defer (on interaction(button)) {
  <app-modal />
}

<button #button>Abrir modal</button>
```

## Animaciones simples sin @angular/animations

Para animaciones básicas, preferir CSS o Web Animations API:

```typescript
@Component({...})
export class FadeComponent {
  el = inject(ElementRef);

  fadeIn(): void {
    this.el.nativeElement.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, fill: 'forwards' }
    );
  }
}
```

Para casos complejos, usar `@angular/animations` clásico.
