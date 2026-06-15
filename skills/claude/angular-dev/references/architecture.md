# Arquitectura

Decisiones de arquitectura para proyectos Angular 17+.

## Estructura por tamaño de proyecto

### Pequeño (MVP, prototipo, 1-5 features)

```
src/app/
├── components/        Componentes compartidos
├── pages/             Componentes de ruta
├── services/          Servicios singleton
├── models/            Interfaces TypeScript
├── app.component.ts
├── app.config.ts      Providers (router, http, etc.)
└── app.routes.ts      Rutas con loadComponent
```

**Cuándo**: prototipo rápido, demo, app pequeña sin equipo. Refactor obligatorio si crece.

### Mediano (5-15 features, 1-3 devs)

```
src/app/
├── core/              Solo se importa una vez (singletons)
│   ├── services/      AuthService, LoggerService, etc.
│   ├── interceptors/  auth, error, loading
│   ├── guards/        authGuard, roleGuard
│   └── models/        Tipos compartidos a nivel app
├── shared/            Reutilizable, sin estado
│   ├── components/    Button, Card, Modal, Spinner
│   ├── pipes/         Formatters, custom pipes
│   └── directives/    AutoFocus, ClickOutside
├── features/          Features lazy-loaded
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── auth.routes.ts
│   ├── dashboard/
│   └── products/
├── layouts/           MainLayout, AuthLayout
├── app.config.ts
└── app.routes.ts
```

**Cuándo**: la mayoría de las apps reales. Es la estructura por defecto recomendada.

### Grande (15+ features, equipos múltiples)

Misma base que mediano + cada feature totalmente autocontenido y opcionalmente librerías Nx/monorepo.

```
src/app/features/products/
├── components/        Componentes solo de products
├── pages/             ProductListPage, ProductDetailPage
├── services/          ProductService
├── store/             Signal store o NgRx feature state
├── models/            Product, Order
├── guards/            Si aplica
├── resolvers/         Si aplica
└── products.routes.ts
```

**Regla**: nada de `features/products/` debe importarse desde `features/orders/`. Si necesitan algo en común, va a `shared/` o `core/`.

## app.config.ts (providers estándar)

```typescript
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    provideClientHydration(), // Si usa SSR
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
```

## Inyección de dependencias avanzada

### InjectionToken para configuración

```typescript
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  features: { darkMode: boolean; beta: boolean };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// Proveer en app.config.ts
providers: [
  { provide: APP_CONFIG, useValue: { apiUrl: environment.apiUrl, features: { darkMode: true, beta: false } } },
],

// Usar
@Injectable({...})
export class FeatureService {
  private config = inject(APP_CONFIG);
}
```

### Providers a nivel de ruta

```typescript
// products.routes.ts
export const productsRoutes: Routes = [
  {
    path: '',
    providers: [
      ProductService,        // solo disponible en este feature
      ProductStore,
    ],
    loadComponent: () => import('./pages/products-list/products-list.component').then(m => m.ProductsListComponent),
  },
];
```

### Providers a nivel de componente (instancia por componente)

```typescript
@Component({
  selector: 'app-editor',
  standalone: true,
  providers: [EditorStateService], // nueva instancia por cada uso del componente
  template: `...`,
})
export class EditorComponent {
  state = inject(EditorStateService);
}
```

### inject() en funciones helper

```typescript
// utils/get-current-user.ts
export function getCurrentUser(): Signal<User | null> {
  return inject(AuthService).user;
}

// Solo se puede usar en contexto de inyección (constructor, field initializer, factory)
@Component({...})
export class HeaderComponent {
  currentUser = getCurrentUser(); // funciona porque está en field initializer
}
```

## Patrón "feature module" sin NgModule

Cada feature exporta sus rutas y opcionalmente servicios:

```typescript
// features/products/products.routes.ts
import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    providers: [/* providers del feature */],
    children: [
      { path: '', loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent) },
      { path: ':id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
    ],
  },
];

// app.routes.ts
{
  path: 'products',
  loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
}
```

## environments

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableLogging: true,
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.acme.com',
  enableLogging: false,
};
```

Configurar `angular.json` con `fileReplacements` para producción.

## Layouts y outlets nombrados

```typescript
// MainLayoutComponent
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class MainLayoutComponent {}

// routes
{
  path: '',
  component: MainLayoutComponent,
  children: [
    { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'products', loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes) },
  ],
},
{
  path: 'auth',
  component: AuthLayoutComponent,
  children: [
    { path: 'login', loadComponent: () => /* ... */ },
    { path: 'register', loadComponent: () => /* ... */ },
  ],
},
```

## Anti-patterns a evitar

- ❌ NgModules nuevos (incluso "para encapsular providers")
- ❌ Importar de un feature a otro (rompe el encapsulamiento)
- ❌ Servicios singleton con estado mutable público
- ❌ Component logic en template (más de 3 líneas en una expresión)
- ❌ Subscribirse en constructor (usar `ngOnInit` o `takeUntilDestroyed`)
- ❌ Llamadas HTTP en componentes (siempre en servicios)
- ❌ `any` type (usar `unknown` y narrowing)
- ❌ `console.log` en producción (usar LoggerService)
- ❌ Hardcodear URLs y secrets (usar environment + InjectionToken)
