# Manejo de Estado

Guía para elegir entre Signals, RxJS y NgRx según el caso.

## Árbol de decisión

```
¿Es estado local de un componente?
├── Sí → signal() / computed()
└── No
    │
    ¿Es estado compartido entre pocos componentes (mismo feature)?
    ├── Sí → Servicio con signals (asReadonly)
    └── No
        │
        ¿Son datos del servidor / streams asíncronos?
        ├── Sí → RxJS (HttpClient retornando Observable, BehaviorSubject)
        │       Convertir a signal con toSignal() cuando se consuma en template
        └── No
            │
            ¿Es estado global, complejo, con múltiples features?
            ├── Sí → NgRx (Signal Store recomendado, o Classic Store)
            └── No → Servicio con signals
```

## Signals: patrones esenciales

### Signal básico

```typescript
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

// Leer
console.log(count(), doubled()); // 0, 0

// Escribir
count.set(5);                    // setter directo
count.update(v => v + 1);        // update basado en valor previo

// Reaccionar
effect(() => console.log('count cambió a', count()));
```

### Servicio con signals (patrón estándar)

```typescript
import { Injectable, signal, computed } from '@angular/core';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  // Estado privado (writable)
  private _todos = signal<Todo[]>([]);
  private _filter = signal<'all' | 'pending' | 'done'>('all');

  // API pública (readonly)
  todos = this._todos.asReadonly();
  filter = this._filter.asReadonly();

  // Derivados
  filteredTodos = computed(() => {
    const todos = this._todos();
    const filter = this._filter();
    if (filter === 'pending') return todos.filter(t => !t.done);
    if (filter === 'done') return todos.filter(t => t.done);
    return todos;
  });

  pendingCount = computed(() => this._todos().filter(t => !t.done).length);

  // Acciones
  add(text: string): void {
    this._todos.update(todos => [
      ...todos,
      { id: crypto.randomUUID(), text, done: false }
    ]);
  }

  toggle(id: string): void {
    this._todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  }

  remove(id: string): void {
    this._todos.update(todos => todos.filter(t => t.id !== id));
  }

  setFilter(filter: 'all' | 'pending' | 'done'): void {
    this._filter.set(filter);
  }
}
```

### Uso en componente

```typescript
@Component({
  selector: 'app-todos',
  standalone: true,
  template: `
    <ul>
      @for (todo of service.filteredTodos(); track todo.id) {
        <li>{{ todo.text }} ({{ todo.done ? 'hecho' : 'pendiente' }})</li>
      }
    </ul>
    <p>Pendientes: {{ service.pendingCount() }}</p>
  `,
})
export class TodosComponent {
  service = inject(TodoService);
}
```

## RxJS: cuándo y cómo

Usar RxJS para:
- Llamadas HTTP (siempre retornan Observable)
- Streams en tiempo real (WebSocket, EventSource, polling)
- Combinar múltiples fuentes asíncronas
- Operadores temporales (debounce, throttle, retry)
- Cancelar requests pendientes (switchMap)

### Patrón: servicio HTTP con cache

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<Product>>();

  getProduct(id: string): Observable<Product> {
    if (!this.cache.has(id)) {
      this.cache.set(id, this.http.get<Product>(`/api/products/${id}`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      ));
    }
    return this.cache.get(id)!;
  }

  invalidate(id: string): void {
    this.cache.delete(id);
  }
}
```

### Patrón: búsqueda con debounce

```typescript
@Component({...})
export class SearchComponent {
  query = signal('');
  private productService = inject(ProductService);

  // Convertir signal a observable, aplicar debounce, volver a signal
  results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q ? this.productService.search(q) : of([])),
    ),
    { initialValue: [] }
  );
}
```

### Patrón: combinar múltiples observables

```typescript
@Injectable({...})
export class DashboardService {
  private http = inject(HttpClient);

  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      stats: this.http.get<Stats>('/api/stats'),
      orders: this.http.get<Order[]>('/api/orders'),
      users: this.http.get<User[]>('/api/users'),
    });
  }
}
```

## Interop signals ↔ observables

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal (para usar en template)
private users$ = this.http.get<User[]>('/api/users');
users = toSignal(this.users$, { initialValue: [] });

// Signal → Observable (para componer con operadores RxJS)
filter = signal('');
filter$ = toObservable(this.filter);

// Patrón completo: signal-driven HTTP
userId = signal<string>('');
user = toSignal(
  toObservable(this.userId).pipe(
    filter(id => !!id),
    switchMap(id => this.http.get<User>(`/api/users/${id}`))
  )
);
```

## NgRx Signal Store (recomendado para estado global)

```typescript
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

interface ProductsState {
  loading: boolean;
  selectedId: string | null;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<ProductsState>({ loading: false, selectedId: null }),
  withEntities<Product>(),
  withComputed(({ entities, selectedId }) => ({
    selected: computed(() => entities().find(e => e.id === selectedId())),
    total: computed(() => entities().length),
  })),
  withMethods((store, api = inject(ProductApiService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true });
      const products = await firstValueFrom(api.getAll());
      patchState(store, setAllEntities(products), { loading: false });
    },
    select(id: string): void {
      patchState(store, { selectedId: id });
    },
  })),
);

// Uso
@Component({...})
export class ProductsComponent {
  store = inject(ProductsStore);

  ngOnInit() { this.store.load(); }
}
```

## NgRx Classic (cuando ya existe en el proyecto)

Solo si el proyecto ya usa NgRx classic (actions/reducers/effects/selectors). Para proyectos nuevos preferir Signal Store.

## Errores comunes

- ❌ Mutar el array en lugar de crear nuevo: `_todos().push(item)` → ✅ `_todos.update(t => [...t, item])`
- ❌ Exponer el signal writable: `todos = signal([])` público → ✅ `todos = this._todos.asReadonly()`
- ❌ Suscribirse manualmente sin cleanup → ✅ `async` pipe, `toSignal()` o `takeUntilDestroyed()`
- ❌ Llamar `.subscribe()` en template → ✅ `async` pipe
- ❌ `effect()` para lógica que debería ser `computed()` → ✅ `computed()` siempre que sea derivación pura
- ❌ Modificar DOM en computed → ✅ `effect()` (los computed deben ser puros)
