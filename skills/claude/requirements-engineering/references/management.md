# Gestión de Requisitos

Priorización (MoSCoW, Kano, WSJF, RICE, value/effort), trazabilidad (RTM), versionado, baselines, change management.

## Priorización

No todo es igual de importante. Sin priorización explícita, el equipo prioriza por defecto (mal) y lo crítico compite con lo trivial. Varias técnicas, según el objetivo.

### MoSCoW (para definir alcance)

La más usada. Clasifica en 4 categorías:

| Categoría | Significa |
|---|---|
| **Must have** | Sin esto, el release falla. Crítico, no negociable |
| **Should have** | Importante, pero el release sobrevive sin ello (con dolor) |
| **Could have** | Deseable, se hace si hay tiempo. Primero en caer |
| **Won't have** (this time) | Explícitamente fuera de este release (quizás el próximo) |

```
Release MVP de checkout:
- Must:   pagar con tarjeta, confirmar pedido, validar stock
- Should: guardar tarjeta para próxima vez, aplicar cupón
- Could:  pago en cuotas, wishlist
- Won't:  pago con cripto (futuro)
```

⚠️ Regla práctica: los "Must" no deberían superar ~60% del esfuerzo. Si todo es "Must", nada está priorizado.

### Kano (para satisfacción del usuario)

Clasifica features por cómo afectan la satisfacción:

| Tipo | Si está | Si falta |
|---|---|---|
| **Básico/esperado** (must-be) | No suma (se da por hecho) | Insatisfacción fuerte |
| **De desempeño** (lineal) | Más es mejor | Menos es peor |
| **Atractivo** (delighter) | Encanta (sorpresa positiva) | No se nota su ausencia |
| **Indiferente** | No importa | No importa |

Insight: invertir solo en básicos no diferencia; los delighters sorprenden pero con el tiempo se vuelven esperados (ej: cámara de un celular). Balancear.

### Value vs Effort (matriz 2x2)

Rápida y visual:
```
Alto valor │ Quick wins    │ Big bets
           │ (hacer ya)    │ (planear)
           ├───────────────┼──────────────
Bajo valor │ Time sinks    │ Fill-ins
           │ (evitar)      │ (si sobra tiempo)
           └───────────────┴──────────────
            Bajo esfuerzo    Alto esfuerzo
```

### WSJF (Weighted Shortest Job First — SAFe)

Para **secuenciar**: priorizar lo de mayor valor y menor duración.

```
WSJF = Costo de la demora / Tamaño del trabajo

Costo de la demora = valor de negocio + urgencia (time criticality)
                     + reducción de riesgo / habilitación de oportunidad
```

Mayor WSJF = hacer primero. Favorece trabajos cortos de alto valor.

### RICE (producto)

```
RICE = (Reach × Impact × Confidence) / Effort

Reach:      cuántos usuarios alcanza (por período)
Impact:     cuánto impacta (escala, ej: 0.25 a 3)
Confidence: qué tan seguros estamos (%)
Effort:     persona-mes
```

Útil para comparar iniciativas de producto objetivamente.

### Cuál usar

| Objetivo | Técnica |
|---|---|
| Definir alcance de un release | MoSCoW |
| Entender satisfacción del usuario | Kano |
| Decisión rápida y visual | Value/Effort |
| Secuenciar un backlog (ágil escalado) | WSJF |
| Comparar iniciativas de producto | RICE |

Se combinan: MoSCoW para el alcance, WSJF/RICE para el orden dentro de los "Must/Should".

## Trazabilidad

Capacidad de seguir un requisito a lo largo de su vida: de dónde viene y hacia dónde va.

### Por qué importa

- **Análisis de impacto**: si cambia un requisito, ¿qué se afecta?
- **Cobertura**: ¿todo requisito tiene diseño, código y test?
- **Verificación**: ¿todo lo construido responde a un requisito? (vs gold plating)
- **Auditoría/compliance**: obligatorio en contextos regulados

### Direcciones de trazabilidad

```
Hacia atrás (backward):  requisito → origen (stakeholder, objetivo de negocio)
Hacia adelante (forward): requisito → diseño → código → test → release
Bidireccional: ambas (lo ideal)
```

### Matriz de trazabilidad (RTM)

```
| Req ID  | Requisito          | Origen      | Diseño  | Código        | Test     | Estado |
|---------|--------------------|-------------|---------|---------------|----------|--------|
| REQ-001 | Login email/pass   | OBJ-1 (PO)  | UC-01   | auth.service  | T-001..3 | Done   |
| REQ-002 | Bloqueo 5 intentos | SEC-policy  | UC-01   | auth.guard    | T-004    | Done   |
| REQ-003 | Reset por email    | OBJ-2 (PO)  | UC-02   | reset.service | T-005..7 | WIP    |
```

Permite ver de un vistazo: cobertura de tests, qué objetivo cumple cada requisito, qué se afecta ante un cambio.

### Trazabilidad ligera (ágil)

No siempre hace falta una RTM formal. En ágil:
- Historia ↔ épica ↔ objetivo (en la herramienta: Jira/Linear linkean)
- Commits/PRs referencian el ticket (`#123`)
- Tests nombrados o etiquetados por historia

La herramienta mantiene la traza sin una matriz manual.

## Versionado y baselines

### Versionar requisitos

Los documentos de requisitos cambian. Versionarlos:
- Historial de cambios (qué cambió, quién, cuándo, por qué)
- Versión semántica del documento (v1.0, v1.1...)
- En sistemas de control de versiones (requisitos como código/markdown en Git) o herramientas dedicadas

### Baseline

Una **baseline** es una versión aprobada y congelada de los requisitos en un punto del tiempo, que sirve de referencia. Los cambios posteriores se miden contra ella.

```
Baseline v1.0 (aprobada para el release 1)
   ↓ cambios gestionados (change requests)
Baseline v1.1 (aprobada para el release 2)
```

En contextos formales/regulados, las baselines son obligatorias y los cambios pasan por control formal.

## Change management (gestión de cambios)

Los requisitos cambian: el objetivo es **gestionar** el cambio, no impedirlo ni aceptarlo a ciegas.

### Proceso de cambio

```
1. Solicitud de cambio (change request): qué se quiere cambiar y por qué
2. Análisis de impacto: qué requisitos/diseño/código/tests/cronograma afecta
   (la trazabilidad lo hace posible)
3. Evaluación: ¿vale la pena? (costo vs valor)
4. Decisión: aprobar / rechazar / diferir (quién decide: PO, CCB)
5. Implementar: actualizar requisitos (nueva versión/baseline) y propagar
6. Comunicar: a todos los afectados
```

### CCB (Change Control Board)

En proyectos formales, un comité decide sobre los cambios. En ágil, el Product Owner cumple ese rol (prioriza el backlog).

### Scope creep

El crecimiento incontrolado del alcance (requisitos que se cuelan sin gestión). Lo previene:
- Out of scope explícito
- Todo cambio pasa por el proceso (no "mientras estás, agregá...")
- Priorización (un nuevo "Must" desplaza a otro)

## Herramientas

| Tipo | Herramientas |
|---|---|
| Ágil / backlog | Jira, Linear, Azure DevOps Boards, GitHub Projects, Shortcut |
| Requisitos formales | DOORS, Jama, Helix RM, Polarion |
| Docs / colaborativo | Notion, Confluence (ver `technical-docs`) |
| Como código | Markdown en Git (requisitos versionados con el repo) |

La elección depende del formalismo: ágil/producto → Jira/Linear/Notion; regulado → herramienta de RM dedicada con trazabilidad y baselines.

## Métricas de requisitos

- **Volatilidad**: % de requisitos que cambian por período (alta volatilidad = problema de elicitación o alcance)
- **Cobertura de trazabilidad**: % de requisitos con test asociado
- **Completitud**: % de requisitos en estado "done" vs total
- **Defectos por requisitos**: bugs originados en requisitos mal definidos

## Anti-patterns

- ❌ Sin priorización (todo crítico = nada priorizado)
- ❌ >60% de los requisitos como "Must"
- ❌ Sin trazabilidad (no poder analizar impacto de cambios)
- ❌ Construir cosas sin requisito que las respalde (gold plating)
- ❌ Congelar requisitos (negar el cambio) en lugar de gestionarlo
- ❌ Aceptar cambios sin análisis de impacto
- ❌ Scope creep (cambios que se cuelan sin proceso)
- ❌ RTM formal pesada en un contexto ágil que no la necesita
- ❌ Sin versionado (no saber qué cambió ni por qué)
- ❌ No comunicar los cambios a los afectados

## Checklist de gestión

### Priorización
- [ ] Técnica elegida según objetivo (MoSCoW/Kano/WSJF/RICE)
- [ ] Prioridad asignada a cada requisito
- [ ] "Must" acotados (no todo es crítico)

### Trazabilidad
- [ ] Cada requisito rastreable a su origen/objetivo
- [ ] Trazabilidad hacia diseño/código/test (RTM o links en herramienta)
- [ ] Permite análisis de impacto

### Versionado y cambio
- [ ] Requisitos versionados (historial)
- [ ] Baseline aprobada (si formal)
- [ ] Proceso de change request definido
- [ ] Análisis de impacto antes de aprobar cambios
- [ ] Out of scope explícito (anti scope creep)
- [ ] Cambios comunicados a afectados
