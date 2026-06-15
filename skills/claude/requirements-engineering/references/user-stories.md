# User Stories y Criterios de Aceptación

User stories, INVEST, criterios de aceptación, Gherkin/BDD, épicas, story splitting.

## Qué es una user story

Una descripción corta de una funcionalidad **desde la perspectiva de quien la necesita**. No es una especificación completa: es una promesa de conversación. El detalle vive en los criterios de aceptación y la charla con el equipo.

### Las 3 C

- **Card** (tarjeta): la historia escrita, breve
- **Conversation** (conversación): el detalle se acuerda hablando
- **Confirmation** (confirmación): criterios de aceptación que confirman que está hecha

## Formato estándar

```
Como [rol/persona],
quiero [acción/capacidad],
para [beneficio/valor].
```

Ejemplo:
```
Como cliente registrado,
quiero recuperar mi contraseña por email,
para recuperar el acceso sin contactar a soporte.
```

El "para" es crucial: captura el **por qué** (el valor). Si no podés escribirlo, cuestioná si la historia vale la pena.

### Variantes

```
# Connextra (la clásica, de arriba)
Como X, quiero Y, para Z.

# Job story (enfoque en contexto/situación)
Cuando [situación],
quiero [motivación],
para [resultado esperado].

# Role-feature-reason
As a [role], I want [feature], so that [reason].
```

## INVEST: criterios de una buena historia

| Letra | Criterio | Significa |
|---|---|---|
| **I** | Independent | Se puede desarrollar y entregar sin depender de otras |
| **N** | Negotiable | No es un contrato rígido; el cómo se negocia |
| **V** | Valuable | Entrega valor a un usuario o cliente |
| **E** | Estimable | El equipo puede estimar su tamaño |
| **S** | Small | Cabe en un sprint (idealmente unos días) |
| **T** | Testable | Tiene criterios verificables |

Si una historia falla INVEST, suele necesitar dividirse o aclararse.

## Criterios de aceptación

Las condiciones que deben cumplirse para considerar la historia "hecha". Definen el **alcance** y la **prueba** de la historia.

### Formato 1: Lista de condiciones

```
Historia: Recuperar contraseña por email

Criterios de aceptación:
- El usuario ingresa su email y recibe un link de reset
- El link expira a los 60 minutos
- El link es de un solo uso
- Si el email no existe, se muestra el mismo mensaje (no revelar si existe)
- La nueva contraseña debe cumplir la política de contraseñas
- Tras resetear, las sesiones activas se invalidan
```

### Formato 2: Gherkin (Given/When/Then)

Estructura para BDD (Behavior-Driven Development). Cada escenario es ejecutable como test.

```gherkin
Feature: Recuperación de contraseña

  Scenario: Reset exitoso con email válido
    Given un usuario registrado con email "ana@example.com"
    When solicita recuperar su contraseña
    Then recibe un email con un link de reset
    And el link expira en 60 minutos

  Scenario: Email no registrado
    Given que no existe ninguna cuenta con "noexiste@example.com"
    When se solicita reset para ese email
    Then se muestra el mensaje genérico de confirmación
    And no se envía ningún email

  Scenario: Link expirado
    Given un link de reset generado hace más de 60 minutos
    When el usuario intenta usarlo
    Then se rechaza con un mensaje de "link expirado"
    And se ofrece solicitar uno nuevo
```

Estructura Gherkin:
- **Given**: contexto/precondición
- **When**: la acción
- **Then**: el resultado esperado
- **And/But**: encadenar pasos

Ventaja de Gherkin: el criterio de aceptación **es** la especificación del test (BDD). Herramientas: Cucumber, SpecFlow, Behave, pytest-bdd.

### Cuándo cada formato

- **Lista**: historias simples, equipos que no usan BDD
- **Gherkin**: comportamiento con varios escenarios, equipos con BDD, cuando se quiere automatizar la verificación

## Épicas

Una **épica** es una historia grande que no cabe en un sprint y se descompone en historias más chicas.

```
Épica: Gestión de cuenta de usuario
├── Historia: Registrarse con email
├── Historia: Iniciar sesión
├── Historia: Recuperar contraseña
├── Historia: Cambiar contraseña
├── Historia: Editar perfil
└── Historia: Eliminar cuenta
```

Jerarquía típica (varía por herramienta):
```
Iniciativa / Tema
   └── Épica
         └── Historia
               └── Tarea / Sub-tarea
```

## Story splitting (dividir historias grandes)

Cuando una historia es demasiado grande (no cabe en un sprint, no es estimable), dividirla. Patrones (SPIDR y otros):

### Por pasos del workflow
```
Grande: "Procesar un pedido completo"
→ Crear carrito
→ Aplicar cupón
→ Pagar
→ Confirmar
```

### Por reglas de negocio
```
Grande: "Calcular envío"
→ Envío estándar (tarifa fija)
→ Envío express
→ Envío gratis sobre cierto monto
```

### Por variaciones de datos / interfaz
```
Grande: "Importar contactos"
→ Importar desde CSV
→ Importar desde Google
→ Importar desde vCard
```

### Por camino feliz vs casos borde
```
Grande: "Login"
→ Login exitoso (camino feliz, primero)
→ Manejo de credenciales inválidas
→ Bloqueo tras N intentos
→ 2FA
```

### Por operaciones CRUD
```
Grande: "Gestionar productos"
→ Crear producto
→ Ver/listar productos
→ Editar producto
→ Eliminar producto
```

### Spike (cuando hay incertidumbre técnica)
Si no se puede estimar por desconocimiento, crear un **spike**: una tarea de investigación time-boxed para reducir la incertidumbre antes de estimar la historia.

### Reglas del buen split

- ✅ Cada parte entrega **valor** independiente (vertical slice, no capas)
- ✅ Cada parte es testeable
- ❌ NO dividir por capas técnicas ("hacer el frontend" / "hacer el backend" no entregan valor por separado)

```
❌ Split horizontal (por capa, no entrega valor)
→ Crear tabla en DB
→ Crear API
→ Crear UI

✅ Split vertical (cada uno entrega valor end-to-end)
→ Ver lista de productos (DB + API + UI mínimos)
→ Filtrar productos
→ Ordenar productos
```

## Definition of Ready / Done

Acuerdos del equipo (ver también `requirements-to-tickets.md`):

**Definition of Ready** (la historia está lista para tomarse):
- Tiene criterios de aceptación claros
- Es estimable y está estimada
- Dependencias identificadas
- Cabe en un sprint

**Definition of Done** (la historia está terminada):
- Código revisado y mergeado
- Tests pasando (incluidos los de los criterios)
- Documentación actualizada
- Desplegado (según el equipo)

## Errores comunes en user stories

| Error | Corrección |
|---|---|
| Historia técnica sin valor de usuario ("Migrar a Postgres") | Reformular con valor, o es una tarea/spike, no historia |
| Sin criterios de aceptación | Agregar (sin ellos "hecho" es ambiguo) |
| Demasiado grande | Dividir (story splitting) |
| Split horizontal (por capas) | Split vertical (por valor) |
| El "para qué" ausente o trivial | Cuestionar el valor real |
| Criterios que describen implementación | Criterios describen comportamiento observable |
| "Como usuario..." siempre (rol genérico) | Especificar el rol/persona concreto |

## Historias técnicas y deuda

No todo es una user story con rol. Trabajo válido que no encaja:
- **Tareas técnicas**: refactors, upgrades (pueden ir como tarea bajo una historia o como ítem técnico)
- **Spikes**: investigación time-boxed
- **Bugs**: con pasos para reproducir + comportamiento esperado
- **Enablers**: trabajo de infraestructura que habilita features

Mantener visible en el backlog, no esconder. Algunos equipos reservan % de capacidad por sprint para esto.

## Anti-patterns

- ❌ Historias sin criterios de aceptación
- ❌ Criterios que describen el cómo, no el qué observable
- ❌ Historias gigantes que no caben en un sprint
- ❌ Split por capas técnicas (no entrega valor)
- ❌ "Como usuario" genérico (sin rol concreto)
- ❌ Omitir el "para qué" (el valor)
- ❌ Tratar la historia como contrato rígido (no es negociable)
- ❌ Todo como user story (forzar roles en trabajo técnico)
- ❌ Criterios de aceptación inventados sin validar con el PO

## Checklist user story

- [ ] Formato: Como [rol concreto], quiero [acción], para [valor]
- [ ] Cumple INVEST
- [ ] Tiene criterios de aceptación (lista o Gherkin)
- [ ] Los criterios son testeables y describen comportamiento
- [ ] Cabe en un sprint (si no, dividir vertical)
- [ ] El valor es real (el "para qué" justifica la historia)
- [ ] Dependencias identificadas
- [ ] Estimada
- [ ] Cumple Definition of Ready
