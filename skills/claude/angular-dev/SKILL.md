---
name: angular-dev
description: Desarrolla aplicaciones, componentes, features y arquitectura en Angular 17+ usando standalone components, signals, control flow nuevo (@if, @for, @switch), inject(), y deferrable views. Activa esta skill SIEMPRE que el usuario mencione "Angular", "componente Angular", "app Angular", "servicio Angular", "directiva", "pipe", "guard", "interceptor", "feature module", "standalone component", "signals", o pida cualquier tarea que involucre desarrollo con Angular (crear componentes, features completos, formularios, llamadas HTTP, estado con signals/RxJS/NgRx, routing, lazy loading, autenticación). También cuando hable de migrar a standalone, refactorizar a signals, o aplicar mejores prácticas de Angular moderno. NO usar para AngularJS (1.x) ni versiones legacy con NgModules clásicos como prioridad.
---

# Angular Development (17+)

Skill para desarrollar con Angular 17+ moderno: standalone components, signals, control flow nuevo, inject(), HttpClient + interceptors, y arquitectura adaptable.

## Stack y versión

- **Angular 17+** (preferir la última estable: usar `ng version` para verificar)
- **Standalone components SIEMPRE** (no NgModules en código nuevo)
- **Control flow nuevo**: `@if`, `@for`, `@switch`, `@defer` (no `*ngIf`, `*ngFor`, `*ngSwitch` en código nuevo)
- **`inject()`** para inyección de dependencias (no constructor injection en código nuevo)
- **Signals** como primera opción para estado reactivo
- **TypeScript strict mode** activado

## Decisión clave al empezar: librería de UI

**Antes de generar código**, si no fue especificado, pregunta al usuario qué librería usar:

- **Angular Material** (apps corporativas, dashboards admin)
- **Tailwind CSS** (apps modernas, control total del diseño)
- **PrimeNG** (apps empresariales con muchos componentes complejos: tablas, calendarios)
- **Bootstrap** (compatibilidad con sistemas legacy o templates Bootstrap)
- **SCSS puro** (cuando se quiere máximo control y componentes propios)
- **Combinación** (ej: Tailwind para layout + Material para componentes complejos)

Pregunta una sola vez al inicio del proyecto y mantén la decisión consistente. Si el usuario está agregando algo a un proyecto existente, **inspecciona primero** `package.json` y/o `styles.scss` para detectar qué se está usando.

## Decisión sobre estructura de carpetas

La estructura depende del tamaño del proyecto:

### Proyecto pequeño (1-5 features, MVP, prototipo)
```
src/app/
├── components/        (componentes compartidos)
├── pages/             (componentes de ruta)
├── services/
├── models/
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

### Proyecto mediano (5-15 features)
```
src/app/
├── core/              (singletons: servicios, interceptors, guards)
│   ├── services/
│   ├── interceptors/
│   └── guards/
├── shared/            (componentes/pipes/directivas reutilizables)
│   ├── components/
│   ├── pipes/
│   └── directives/
├── features/          (un folder por feature)
│   ├── auth/
│   ├── dashboard/
│   └── products/
├── layouts/           (layouts de la app: main, auth, etc.)
└── app.config.ts
```

### Proyecto grande (15+ features, equipos múltiples)
Estructura por dominio (cada feature autocontenido):
```
src/app/
├── core/
├── shared/
├── features/
│   └── products/
│       ├── components/    (componentes solo de este feature)
│       ├── pages/
│       ├── services/
│       ├── models/
│       ├── store/         (si usa NgRx)
│       └── products.routes.ts
└── app.config.ts
```

Cuando el usuario no especifica tamaño, **pregunta o asume basándote en el contexto** (un componente suelto → pequeño; "una app de e-commerce" → mediano/grande).

## Convenciones de código

### Componentes standalone (template obligatorio)

```typescript
import { Component, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  // 1. Inputs (signal-based en Angular 17.1+)
  product = input.required<Product>();
  variant = input<'compact' | 'full'>('full');

  // 2. Outputs
  selected = output<Product>();

  // 3. Injects
  private cartService = inject(CartService);

  // 4. State (signals)
  isLoading = signal(false);

  // 5. Computed
  totalPrice = computed(() => this.product().price * 1.19);

  // 6. Métodos
  onSelect(): void {
    this.selected.emit(this.product());
  }
}
```

**Reglas**:
- `ChangeDetectionStrategy.OnPush` por defecto en todos los componentes
- `signal()` para estado mutable, `computed()` para derivados
- `input()` / `output()` en lugar de `@Input()` / `@Output()` decorators
- `inject()` en lugar de constructor injection
- `templateUrl` y `styleUrl` separados (no inline) excepto para componentes muy pequeños (< 20 líneas total)

### Control flow nuevo

```html
<!-- ✅ NUEVO -->
@if (user(); as currentUser) {
  <p>Hola {{ currentUser.name }}</p>
} @else {
  <p>No has iniciado sesión</p>
}

@for (item of items(); track item.id) {
  <app-item [data]="item" />
} @empty {
  <p>No hay items</p>
}

@switch (status()) {
  @case ('loading') { <app-spinner /> }
  @case ('error') { <app-error /> }
  @default { <app-content /> }
}

<!-- Deferred loading -->
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <div>Cargando...</div>
}

<!-- ❌ EVITAR en código nuevo -->
<div *ngIf="user as currentUser">...</div>
<div *ngFor="let item of items">...</div>
```

### Nombrado de archivos

- Componentes: `product-card.component.ts` + `.html` + `.scss`
- Servicios: `product.service.ts`
- Modelos/interfaces: `product.model.ts` o `product.interface.ts`
- Guards: `auth.guard.ts` (funcionales: `CanActivateFn`)
- Interceptors: `auth.interceptor.ts` (funcionales: `HttpInterceptorFn`)
- Pipes: `currency-format.pipe.ts`
- Directivas: `auto-focus.directive.ts`
- Tests: `<archivo>.spec.ts` (mismo nombre + `.spec`)

### Selectores de componentes
- Prefijo `app-` por defecto (o el prefijo del proyecto: `acme-`, `dashboard-`, etc.)
- kebab-case: `app-product-card`, no `appProductCard`

## Estado y reactividad: cómo elegir

| Caso de uso | Solución |
|---|---|
| Estado local del componente | **Signals** (`signal`, `computed`) |
| Estado compartido entre componentes hijos | **Signals en servicio** con `signal()` + métodos |
| Datos del servidor con polling/streams | **RxJS** (`Observable`, `BehaviorSubject`) |
| Operaciones HTTP únicas | **HttpClient retornando Observable + `toSignal()`** o `firstValueFrom()` |
| Estado global complejo (muchas features) | **NgRx** (signal store o classic store) |
| Combinar signals con observables | **`toSignal()` / `toObservable()`** de `@angular/core/rxjs-interop` |

### Servicio con signals (patrón estándar)

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  // Readonly para consumidores
  items = this._items.asReadonly();
  count = computed(() => this._items().length);
  total = computed(() => this._items().reduce((sum, i) => sum + i.price * i.qty, 0));

  add(item: CartItem): void {
    this._items.update(items => [...items, item]);
  }

  remove(id: string): void {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  clear(): void {
    this._items.set([]);
  }
}
```

### Servicio HTTP con interop

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  // Observable cuando se necesita streams/operadores
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }

  // Signal cuando se consume en template
  getProductsAsSignal() {
    return toSignal(this.getProducts(), { initialValue: [] });
  }
}
```

## HTTP + Interceptors estándar

Toda app debe configurar estos interceptors funcionales (Angular 17+ usa `HttpInterceptorFn`):

### app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
  ],
};
```

### auth.interceptor.ts

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
```

### error.interceptor.ts

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // redirigir a login
      } else if (err.status >= 500) {
        notifications.error('Error del servidor. Intenta de nuevo.');
      }
      return throwError(() => err);
    })
  );
};
```

### loading.interceptor.ts

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
```

## Formularios

Decide entre Reactive y Template-driven según el caso:

- **Reactive Forms**: forms complejos, validación dinámica, valores derivados, tests
- **Template-driven**: forms simples (login, búsqueda, contacto rápido)

### Reactive Form típico

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p class="error">Email inválido</p>
      }
      <input formControlName="password" type="password" />
      <button type="submit" [disabled]="form.invalid">Entrar</button>
    </form>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      // ...
    }
  }
}
```

**Reglas**:
- Usar `fb.nonNullable.group()` para tipado estricto sin nulls
- Validación visible solo después de `touched` o submit
- `disabled` en submit cuando `form.invalid`

## Routing y lazy loading

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
```

### Guards funcionales

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
```

## Tests

**No generar tests por defecto.** Solo cuando el usuario los solicite explícitamente con frases como "agrega tests", "con pruebas unitarias", "incluir specs". Si los pide, usar Jasmine/Karma (default de Angular CLI) salvo que indique Jest/Vitest.

## Cuándo consultar referencias

Para profundizar en patrones específicos, consulta:

- `references/components-patterns.md` — patrones avanzados de componentes (host bindings, ViewChild, content projection, dynamic components)
- `references/state-management.md` — guía completa: signals vs RxJS vs NgRx, patrones de servicios, signal stores
- `references/forms.md` — formularios avanzados (validators custom, async validators, formArrays, cross-field validation)
- `references/architecture.md` — decisiones de arquitectura por tamaño de proyecto, dependency injection avanzada, providers
- `references/performance.md` — OnPush, trackBy, defer, virtual scroll, lazy loading, hydration SSR

## Proceso para tareas

### Si piden crear un componente individual
1. Si no se especifica, asumir standalone + OnPush
2. Crear `.component.ts`, `.component.html`, `.component.scss`
3. Usar signals para estado, `input()`/`output()` para API
4. Aplicar el control flow nuevo en el template

### Si piden un feature completo (ej: "agrégame autenticación")
1. Crear carpeta `features/<nombre>/`
2. Generar: páginas, componentes, servicios, modelos, routes, guards si aplica
3. Configurar lazy loading en `app.routes.ts`
4. Crear interceptor si es necesario (ej: auth interceptor)

### Si piden una app completa
1. **Preguntar**: nombre del proyecto, librería UI, alcance (qué features)
2. Estructura mediana/grande según alcance
3. `app.config.ts` con providers (router, http + interceptors, animations, etc.)
4. Routing con lazy loading
5. Interceptors estándar (auth + error + loading)
6. Layout principal con outlet
7. Al menos un feature funcional como ejemplo

### Entregable
Crear archivos en `/mnt/user-data/outputs/<nombre-proyecto>/` con la estructura completa.
Incluir `README.md` con: `npm install`, `ng serve`, estructura, decisiones de arquitectura, dónde extender.
Llamar a `present_files` al final.

## Lo que NUNCA hay que hacer

- Usar NgModules en código nuevo (solo standalone)
- Usar `*ngIf`/`*ngFor` en lugar del control flow nuevo
- Usar constructor injection en código nuevo (usar `inject()`)
- Usar `@Input()`/`@Output()` decorators cuando se puede usar `input()`/`output()` signal-based
- Suscribirse manualmente a Observables sin gestionar la suscripción (preferir `async` pipe o `toSignal()`)
- Omitir `ChangeDetectionStrategy.OnPush`
- Manejar errores HTTP en cada servicio (debe estar en el interceptor)
- Hardcodear URLs de API (usar `environment.ts`)
- Mezclar lógica de UI con lógica de negocio en componentes (extraer a servicios)
- Crear servicios con estado mutable público (usar `signal().asReadonly()`)
- Generar tests cuando el usuario no los pidió
