# Casos de Uso y SRS (Requisitos Formales)

Casos de uso, Software Requirements Specification (SRS), IEEE 830/29148, requisitos funcionales formales.

**Cuándo usar esto vs user stories**: requisitos formales cuando hay alta complejidad, regulación (médico, financiero, aeroespacial), equipos grandes/distribuidos, contratos, o cuando el costo de un error es muy alto. Para ágil ligero → `user-stories.md`.

## Requisitos funcionales

Describen **qué hace** el sistema: funciones, comportamientos, respuestas a entradas.

### Formato: numerados y atómicos

```
REQ-AUTH-001: El sistema debe permitir al usuario autenticarse con email y contraseña.

REQ-AUTH-002: El sistema debe bloquear la cuenta tras 5 intentos fallidos
              consecutivos en un período de 15 minutos.

REQ-AUTH-003: El sistema debe enviar un email de notificación cuando se
              detecta un inicio de sesión desde un dispositivo nuevo.
```

Reglas:
- **Atómico**: un requisito = una función verificable
- **Numerado/identificable**: ID único (REQ-XXX) para trazabilidad
- **"debe"/"shall"**: para obligatorios; "debería"/"should" para recomendados (terminología consistente)
- **Sin ambigüedad ni implementación**

### Lenguaje normativo (RFC 2119 / ISO)

| Término | Significado |
|---|---|
| **debe / shall / must** | Obligatorio |
| **no debe / shall not** | Prohibido |
| **debería / should** | Recomendado (puede haber excepciones justificadas) |
| **puede / may** | Opcional |

Consistencia en el uso permite distinguir lo obligatorio de lo deseable.

## Casos de uso

Describen una **interacción completa** entre un actor y el sistema para lograr un objetivo. Más narrativos que un requisito funcional suelto.

### Estructura completa

```
Caso de uso: UC-01 Recuperar contraseña

Actor principal: Usuario registrado
Stakeholders e intereses:
  - Usuario: recuperar acceso rápido y seguro
  - Seguridad: que nadie más pueda secuestrar la cuenta

Precondiciones:
  - El usuario tiene una cuenta registrada
  - El usuario no está autenticado

Garantía de éxito (postcondición):
  - La contraseña queda cambiada
  - Las sesiones previas se invalidan

Flujo principal (camino feliz):
  1. El usuario selecciona "Olvidé mi contraseña"
  2. El sistema solicita el email
  3. El usuario ingresa su email
  4. El sistema envía un email con un link de reset (válido 1h)
  5. El usuario abre el link
  6. El sistema solicita la nueva contraseña
  7. El usuario ingresa una contraseña que cumple la política
  8. El sistema actualiza la contraseña e invalida sesiones previas
  9. El sistema confirma el cambio

Flujos alternativos:
  3a. El email no está registrado:
      1. El sistema muestra el mismo mensaje de confirmación
         (no revela si el email existe)
      2. No se envía email
  7a. La contraseña no cumple la política:
      1. El sistema indica los requisitos no cumplidos
      2. Vuelve al paso 6

Flujos de excepción:
  *a. El servicio de email no está disponible:
      1. El sistema registra el error
      2. Informa al usuario que reintente más tarde

Requisitos especiales:
  - El link debe ser de un solo uso (ver REQ-AUTH-010)

Frecuencia: media
```

### Diagrama de casos de uso (UML)

Visión general de actores y casos de uso (no el detalle). Para diagramas → ver `technical-docs` (Mermaid/PlantUML) o `figma-workflow`.

```
        ┌─────────────────────────────┐
        │       Sistema de Cuentas    │
        │                             │
  ┌──┐  │   ( Registrarse )           │
  │👤│──┼──( Iniciar sesión )         │
  └──┘  │   ( Recuperar contraseña )  │
 Usuario│   ( Editar perfil )         │
        └─────────────────────────────┘
```

### Casos de uso vs user stories

| | User story | Caso de uso |
|---|---|---|
| Tamaño | Pequeña, una capacidad | Interacción completa con variantes |
| Detalle | Mínimo (charla después) | Flujos detallados (principal/alt/excepción) |
| Contexto | Ágil | Formal, complejo |
| Formato | Como/quiero/para | Actor/precondición/flujos/postcondición |

No son excluyentes: una épica puede documentarse como caso de uso y dividirse en historias.

## SRS (Software Requirements Specification)

Documento formal que especifica todos los requisitos. Base: **IEEE 830** (clásico) / **ISO/IEC/IEEE 29148** (vigente, lo reemplaza).

### Estructura SRS (basada en IEEE 830/29148)

```
1. Introducción
   1.1 Propósito
   1.2 Alcance (qué hace y qué NO hace el sistema)
   1.3 Definiciones, acrónimos y abreviaturas
   1.4 Referencias
   1.5 Visión general del documento

2. Descripción general
   2.1 Perspectiva del producto (contexto, sistemas relacionados)
   2.2 Funciones del producto (resumen)
   2.3 Características de los usuarios
   2.4 Restricciones (regulatorias, técnicas, de negocio)
   2.5 Supuestos y dependencias

3. Requisitos específicos
   3.1 Requisitos funcionales (numerados, por módulo/feature)
   3.2 Requisitos de interfaces externas
       - Interfaces de usuario
       - Interfaces de hardware
       - Interfaces de software (APIs, integraciones)
       - Interfaces de comunicación
   3.3 Requisitos no funcionales (ver non-functional.md)
       - Performance
       - Seguridad
       - Disponibilidad
       - Mantenibilidad
       - etc.
   3.4 Otros requisitos (legales, de negocio)

4. Apéndices
   - Matriz de trazabilidad
   - Modelos (datos, casos de uso)
   - Glosario
```

### Características de un buen SRS (IEEE)

El documento completo debe ser: correcto, no ambiguo, **completo**, consistente, priorizado, verificable, modificable y **trazable**. (Ver `quality-review.md`.)

### Modelos que acompañan al SRS

- **Diagramas de casos de uso** (actores y funciones)
- **Modelo de datos / ER** (ver `databases`)
- **Diagramas de flujo / actividad**
- **Diagramas de estado** (para entidades con ciclo de vida)
- **Diagramas de secuencia** (interacciones)

Para crear estos diagramas → `technical-docs` (Mermaid/PlantUML).

## Niveles y tipos de documentos formales

```
BRD (Business Requirements Document) → requisitos de negocio (por qué)
   ▼
SRS (Software Requirements Spec)     → requisitos de sistema (qué)
   ▼
SDD (Software Design Description)    → diseño (cómo) — ya no es requisito
```

- **BRD**: foco en objetivos de negocio, alto nivel, audiencia ejecutiva
- **SRS**: foco en el sistema, detallado, audiencia técnica
- **PRD**: foco en producto (ver `prd.md`) — más común en software de producto que BRD/SRS

## Trazabilidad en requisitos formales

Cada requisito funcional se rastrea (ver `management.md`):
```
Objetivo de negocio → Requisito (REQ-XXX) → Caso de uso → Diseño → Código → Test
```

La matriz de trazabilidad (RTM) es típicamente obligatoria en contextos regulados.

## Cuándo NO sobre-especificar

El formalismo tiene costo. Señales de que un SRS completo es excesivo:
- Equipo chico, co-ubicado, comunicación fluida
- Producto que itera rápido (los requisitos cambian semanalmente)
- Sin regulación ni contrato que lo exija
- El costo de un error es bajo y reversible

En esos casos: user stories + criterios de aceptación + un PRD ligero suelen alcanzar.

## Anti-patterns

- ❌ Requisitos funcionales no atómicos (varios "y")
- ❌ Terminología inconsistente (mezclar "debe"/"debería" sin criterio)
- ❌ Implementación en el requisito (el cómo)
- ❌ Casos de uso sin flujos alternativos/excepción (solo camino feliz)
- ❌ SRS sin sección de alcance (qué NO hace)
- ❌ SRS sin trazabilidad en contexto regulado
- ❌ Sobre-especificar en contexto ágil
- ❌ SRS que nadie mantiene (queda obsoleto y engaña)
- ❌ Confundir BRD/SRS/SDD (niveles distintos)

## Checklist requisitos formales

### Requisitos funcionales
- [ ] Numerados con ID único
- [ ] Atómicos (uno por requisito)
- [ ] Terminología normativa consistente (debe/debería)
- [ ] Sin implementación
- [ ] Testeables

### Casos de uso
- [ ] Actor, precondición, postcondición
- [ ] Flujo principal
- [ ] Flujos alternativos
- [ ] Flujos de excepción
- [ ] Trazables a requisitos

### SRS
- [ ] Alcance claro (qué hace y qué NO)
- [ ] Supuestos y restricciones documentados
- [ ] Funcionales + no funcionales
- [ ] Interfaces externas especificadas
- [ ] Matriz de trazabilidad (si regulado)
- [ ] Glosario / definiciones
- [ ] Modelos de apoyo (diagramas)
