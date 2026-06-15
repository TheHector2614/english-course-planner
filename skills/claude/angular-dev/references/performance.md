# Performance

Optimizaciones de performance en Angular 17+.

## ChangeDetection: OnPush siempre

Todos los componentes deben usar `OnPush`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class ItemComponent {}
```

**Con `OnPush`, el componente se actualiza solo cuando**:
- Cambia un `@Input()` / `input()` (referencia, no profundo)
- Se emite un evento desde el template
- Cambia un signal usado en el template
- Un Observable consumido con `async` pipe emite

Si modificas algo y la vista no se actualiza, **no uses `ChangeDetectorRef.detectChanges()`**. Refactoriza a signals o usa `async` pipe.

## @for con track obligatorio

```html
<!-- ✅ Con track -->
@for (item of items(); track item.id) {
  <app-item [data]="item" />
}

<!-- ❌ Sin track (Angular obliga a poner uno) -->
@for (item of items(); track $index) {  <!-- aceptable si los items no tienen ID estable -->
  <app-item [data]="item" />
}
```

**`track item.id` es siempre mejor que `track $index`** porque permite reusar nodos del DOM cuando se reordena la lista.

## Deferred views (@defer)

Diferir componentes pesados hasta que se necesiten:

```html
<!-- Cargar cuando entre al viewport -->
@defer (on viewport) {
  <app-chart [data]="data()" />
} @placeholder {
  <div class="chart-skeleton"></div>
}

<!-- Cargar al hacer hover sobre un trigger -->
@defer (on hover(#trigger)) {
  <app-tooltip />
}
<button #trigger>Ver detalles</button>

<!-- Cargar al hacer click -->
@defer (on interaction) {
  <app-modal />
}

<!-- Cargar cuando el navegador esté idle -->
@defer (on idle; prefetch on idle) {
  <app-recommendations />
}

<!-- Cargar después de un timeout -->
@defer (on timer(5s)) {
  <app-newsletter-popup />
}

<!-- Cargar bajo una condición -->
@defer (when showChart()) {
  <app-chart />
}
```

**Bloques disponibles**:
- `@placeholder` — antes de que se dispare el trigger
- `@loading` — mientras se carga (con `minimum` para evitar flashes)
- `@error` — si falla la carga

## Virtual scroll para listas largas

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="h-96">
      <div *cdkVirtualFor="let item of items; trackBy: trackById">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class LargeListComponent {
  items = signal<Item[]>([/* miles de items */]);
  trackById = (_: number, item: Item) => item.id;
}
```

Cuándo usarlo: listas con más de 100 items visibles potencialmente.

## Lazy loading de rutas

```typescript
// ✅ Carga bajo demanda
{ path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes) }

// ✅ Componente individual lazy
{ path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) }
```

**Toda ruta que no sea la home debe ser lazy loaded.**

## Lazy loading de assets

```typescript
@Component({...})
export class HeavyImportComponent {
  async loadChart() {
    const { Chart } = await import('chart.js');
    // usar Chart
  }
}
```

## Optimización de imágenes con NgOptimizedImage

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <img
      ngSrc="/assets/hero.jpg"
      width="1200"
      height="600"
      priority
      alt="Hero"
    />

    <img
      ngSrc="/assets/product-1.jpg"
      width="300"
      height="300"
      loading="lazy"
      alt="Producto 1"
    />
  `,
})
export class HomeComponent {}
```

**Reglas**:
- `priority` solo para imágenes above-the-fold (Hero)
- `width` y `height` obligatorios (evita CLS)
- `ngSrc` en lugar de `src`

## SSR + Hydration

```typescript
// app.config.ts
providers: [
  provideClientHydration(
    withEventReplay() // captura eventos durante hydration
  ),
]
```

Activar SSR con `ng add @angular/ssr` durante el setup.

## Service Worker (PWA)

```bash
ng add @angular/pwa
```

```typescript
// app.config.ts
providers: [
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerWhenStable:30000'
  }),
]
```

## Bundle size: análisis y reducción

```bash
# Generar bundle stats
ng build --stats-json

# Analizar
npx webpack-bundle-analyzer dist/<proyecto>/stats.json
```

**Reducir bundle**:
- Lazy loading de rutas
- `@defer` para componentes pesados
- Tree-shakeable imports (`lodash-es` en lugar de `lodash`)
- Evitar polyfills innecesarios en `polyfills.ts`
- Producción con `--configuration production` (uglify + AOT + tree-shaking)

## Memory leaks: evitar

```typescript
// ❌ Suscripción sin cleanup
ngOnInit() {
  this.service.data$.subscribe(d => this.data = d);
}

// ✅ takeUntilDestroyed
private destroyRef = inject(DestroyRef);
ngOnInit() {
  this.service.data$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(d => this.data = d);
}

// ✅ async pipe (mejor todavía)
template: `{{ data$ | async }}`

// ✅ toSignal (cleanup automático)
data = toSignal(this.service.data$);
```

## Zone.js opcional: Zoneless (experimental)

```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

providers: [
  provideExperimentalZonelessChangeDetection(), // en lugar de provideZoneChangeDetection
]
```

Solo si la app es 100% basada en signals/`async` pipe. Mejora performance pero requiere refactor.

## Checklist de performance

- [ ] `ChangeDetectionStrategy.OnPush` en todos los componentes
- [ ] `track` en todos los `@for`
- [ ] `@defer` para componentes pesados/below-fold
- [ ] Lazy loading de rutas (todas excepto home)
- [ ] `NgOptimizedImage` para todas las imágenes
- [ ] `priority` solo en imagen del Hero
- [ ] Virtual scroll para listas > 100 items
- [ ] `provideClientHydration` si hay SSR
- [ ] Bundle inspeccionado con webpack-bundle-analyzer
- [ ] No suscripciones manuales sin `takeUntilDestroyed`
- [ ] Producción con `--configuration production`
- [ ] Lighthouse: meta 90+ en Performance
