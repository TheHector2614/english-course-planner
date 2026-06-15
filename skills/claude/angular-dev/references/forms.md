# Formularios

Guía completa para formularios Reactive y Template-driven en Angular 17+.

## Cuándo usar cada uno

| Caso | Solución |
|---|---|
| Login, contacto, búsqueda simple | Template-driven (`ngModel`) |
| Form con validación compleja | Reactive (`FormBuilder`) |
| Form dinámico (campos que aparecen/desaparecen) | Reactive |
| Form con cross-field validation | Reactive |
| Form con FormArray (lista de items) | Reactive |
| Forms tipados estrictos | Reactive con `nonNullable` |

## Reactive Forms tipados (recomendado)

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Nombre" />
      @if (showError('name')) { <p class="err">Nombre requerido</p> }

      <input formControlName="email" type="email" placeholder="Email" />
      @if (showError('email')) { <p class="err">Email inválido</p> }

      <input formControlName="age" type="number" placeholder="Edad" />
      @if (showError('age')) { <p class="err">Mayor de 18</p> }

      <button type="submit" [disabled]="form.invalid || submitting()">
        {{ submitting() ? 'Enviando...' : 'Registrarse' }}
      </button>
    </form>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  submitting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    age: [0, [Validators.required, Validators.min(18)]],
  });

  showError(field: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.touched && ctrl.invalid;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    // ...
  }
}
```

## Validators personalizados (síncronos)

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    if (hasNumber && hasUpper && hasSpecial) return null;
    return {
      passwordStrength: {
        hasNumber, hasUpper, hasSpecial,
      },
    };
  };
}

// Uso
this.fb.nonNullable.group({
  password: ['', [Validators.required, passwordStrength()]],
});
```

## Validators asíncronos (ej: email único)

```typescript
import { AsyncValidatorFn } from '@angular/forms';
import { map, debounceTime, switchMap, first } from 'rxjs/operators';

export function uniqueEmailValidator(userService: UserService): AsyncValidatorFn {
  return (control) => {
    return of(control.value).pipe(
      debounceTime(400),
      switchMap(email => userService.checkEmail(email)),
      map(exists => exists ? { emailTaken: true } : null),
      first(),
    );
  };
}

// Uso (3er argumento del control)
this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email], [uniqueEmailValidator(this.userService)]],
});
```

## Cross-field validation

```typescript
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

// Uso en el group
this.form = this.fb.nonNullable.group(
  {
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  },
  { validators: passwordsMatch }
);

// En template
@if (form.hasError('passwordMismatch') && form.controls.confirmPassword.touched) {
  <p class="err">Las contraseñas no coinciden</p>
}
```

## FormArray (lista dinámica)

```typescript
@Component({...})
export class TeamFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    teamName: ['', Validators.required],
    members: this.fb.nonNullable.array<FormGroup<{ name: FormControl<string>; role: FormControl<string> }>>([])
  });

  get members() {
    return this.form.controls.members;
  }

  addMember(): void {
    this.members.push(
      this.fb.nonNullable.group({
        name: ['', Validators.required],
        role: ['', Validators.required],
      })
    );
  }

  removeMember(index: number): void {
    this.members.removeAt(index);
  }
}
```

```html
<form [formGroup]="form">
  <input formControlName="teamName" />

  <div formArrayName="members">
    @for (member of members.controls; track $index; let i = $index) {
      <div [formGroupName]="i">
        <input formControlName="name" />
        <input formControlName="role" />
        <button type="button" (click)="removeMember(i)">Eliminar</button>
      </div>
    }
  </div>

  <button type="button" (click)="addMember()">+ Agregar miembro</button>
</form>
```

## Form value observable + signal

```typescript
@Component({...})
export class FilterFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    query: [''],
    category: ['all'],
  });

  // Valores como signal con debounce
  filters = toSignal(
    this.form.valueChanges.pipe(
      debounceTime(300),
      startWith(this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() }
  );

  // Reaccionar a cambios
  results = computed(() => {
    const f = this.filters();
    return this.searchService.filter(f);
  });
}
```

## Template-driven simple (login, búsqueda)

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="query" (keyup.enter)="onSearch()" placeholder="Buscar..." />
    <button (click)="onSearch()">Buscar</button>
  `,
})
export class SearchBarComponent {
  query = signal('');

  onSearch(): void {
    if (this.query().trim()) {
      // ...
    }
  }
}
```

## Patrón: deshabilitar form mientras se envía

```typescript
@Component({...})
export class SubmitComponent {
  submitting = signal(false);
  form = this.fb.nonNullable.group({/* ... */});

  constructor() {
    effect(() => {
      if (this.submitting()) this.form.disable();
      else this.form.enable();
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    try {
      await this.api.save(this.form.getRawValue());
    } finally {
      this.submitting.set(false);
    }
  }
}
```

## Accesibilidad en forms

- Cada `<input>` con `<label for>` asociado (o `aria-label` si no hay label visible)
- Errores con `role="alert"` o `aria-live="polite"`
- `aria-invalid="true"` cuando hay error
- `aria-describedby` para conectar input con su mensaje de error
- `autocomplete` apropiado (`name`, `email`, `tel`, `current-password`, etc.)
- Botón submit con tipo `type="submit"` explícito
- `required` HTML para que lectores de pantalla lo anuncien

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  formControlName="email"
  autocomplete="email"
  required
  [attr.aria-invalid]="showError('email')"
  aria-describedby="email-error"
/>
@if (showError('email')) {
  <p id="email-error" role="alert">Ingresa un email válido</p>
}
```
