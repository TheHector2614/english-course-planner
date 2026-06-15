# Elicitación de Requisitos

Técnicas para descubrir requisitos, identificar stakeholders, sacar a la luz lo implícito.

**Nota**: para una **entrevista guiada en vivo** que define un proyecto desde cero, usar `entrevistador-procesos`. Aquí: las técnicas, su teoría, y cómo procesar lo elicitado en requisitos.

## Qué es elicitación

Elicitar ≠ "recolectar". Los stakeholders rara vez saben exactamente qué quieren o no lo expresan completo. Elicitar es **extraer, descubrir y co-construir** los requisitos, incluyendo los que nadie dijo explícitamente.

```
Lo que el stakeholder dice      →  requisito explícito
Lo que el stakeholder asume     →  requisito implícito (hay que sacarlo)
Lo que el stakeholder no sabe   →  requisito latente (hay que descubrirlo)
que necesita
```

## Stakeholders: identificarlos primero

Antes de elicitar, saber **a quién**. Tipos:

| Stakeholder | Aporta |
|---|---|
| **Usuarios finales** | Necesidades reales de uso, flujos, dolor |
| **Sponsor/cliente** | Objetivos de negocio, presupuesto, prioridades |
| **Product owner** | Visión, priorización |
| **Equipo técnico** | Restricciones, factibilidad |
| **Operaciones/soporte** | Requisitos operacionales, mantenibilidad |
| **Legal/compliance** | Restricciones regulatorias |
| **Seguridad** | Requisitos de seguridad (ver `cybersecurity-defense`) |

Mapa de stakeholders (poder vs interés):
```
Alto poder │ Mantener         │ Gestionar
           │ satisfechos      │ de cerca (clave)
           ├──────────────────┼──────────────────
Bajo poder │ Monitorear       │ Mantener
           │ (mínimo esfuerzo)│ informados
           └──────────────────┴──────────────────
             Bajo interés        Alto interés
```

Los de **alto poder + alto interés** son los clave: involucrarlos activamente.

## Técnicas de elicitación

### Entrevistas

Conversación 1-a-1 o grupo chico. La técnica más común.

- **Estructurada**: preguntas predefinidas (comparable entre entrevistados)
- **No estructurada**: exploratoria, abierta
- **Semi-estructurada**: guía + libertad para profundizar (lo más útil)

Buenas preguntas:
- Abiertas: "¿Cómo hacés esto hoy?" (no "¿usás Excel?")
- Por qué encadenados (5 whys): llegar a la causa raíz de la necesidad
- Sobre el dolor: "¿Qué es lo más frustrante del proceso actual?"
- Sobre excepciones: "¿Qué pasa cuando algo sale mal?"
- Evitar preguntas que sugieren la respuesta (sesgo)

### Workshops / talleres

Sesión con múltiples stakeholders. Útil para alinear, resolver conflictos, co-crear.

- **Story mapping**: mapear el viaje del usuario y derivar historias
- **Event storming**: descubrir eventos de dominio (DDD)
- **Design studio**: bocetar soluciones en grupo

Requiere facilitación: que no domine una voz, capturar todo, gestionar conflictos.

### Observación (etnografía)

Observar a los usuarios en su contexto real. Revela lo que la gente **hace** vs lo que **dice** que hace (suelen diferir).

- Shadowing: seguir a un usuario en su jornada
- Útil para descubrir workarounds, pasos no documentados, dolor tácito

### Análisis de documentos

Revisar lo existente: sistemas actuales, manuales, regulaciones, tickets de soporte, procesos.

- Tickets de soporte = mina de oro de dolor real
- Sistema legacy = requisitos implícitos ya implementados

### Prototipos / mockups

Mostrar algo concreto para provocar reacción. "No es esto, es más bien..." saca requisitos que la conversación abstracta no logra.

- Baja fidelidad (papel, wireframe) para explorar
- Útil cuando el stakeholder no sabe expresar qué quiere hasta que lo ve
- Para diseño visual → `figma-workflow`

### Encuestas / cuestionarios

Para muchos stakeholders, datos cuantitativos. Menos profundo pero escalable.

### Casos de uso / escenarios

Construir narrativas de uso concretas con el stakeholder valida entendimiento.

### Técnicas complementarias

- **Brainstorming**: generar ideas sin filtrar (luego priorizar)
- **Benchmarking**: analizar soluciones de la competencia
- **Análisis de interfaces**: requisitos de integración con otros sistemas

## Sacar requisitos implícitos y latentes

Lo más valioso suele ser lo no dicho.

### Requisitos implícitos (asumidos)

El stakeholder los da por obvios. Ejemplos: "obvio que debe funcionar en móvil", "obvio que los datos no se pierden". Técnicas para sacarlos:

- Preguntar lo "obvio" explícitamente
- Cuestionar supuestos: "¿asumimos que...?"
- Revisar categorías de NFR sistemáticamente (ver `non-functional.md`)

### Requisitos latentes (no consciente)

El stakeholder no sabe que los necesita. Técnicas:

- Modelo de Kano (ver `management.md`): descubrir "delighters"
- Observación (revela necesidades no articuladas)
- Prototipos (provocan "ah, también necesito...")

## Manejo de problemas comunes

| Problema | Abordaje |
|---|---|
| Stakeholders en conflicto | Workshop de alineación; escalar al sponsor; documentar la decisión |
| "Quiero todo, ya" | Priorización (MoSCoW); error budget de alcance |
| El stakeholder describe la solución, no el problema | Preguntar "¿qué problema resolvería eso?" (volver al qué) |
| Requisitos que cambian constantemente | Iterar (ágil); gestionar cambio (ver `management.md`) |
| Stakeholder ausente/inaccesible | Proxy (product owner); documentar supuestos para validar |
| Scope creep | Out of scope explícito; change control |

## De lo elicitado a requisitos

La elicitación produce notas crudas. Procesarlas:

1. **Separar** problema de solución (capturar el problema)
2. **Clasificar**: funcional vs no funcional; nivel (negocio/usuario/sistema)
3. **Eliminar** duplicados y resolver contradicciones
4. **Redactar** en el formato elegido (historias, casos de uso, etc.)
5. **Validar** con el stakeholder (¿entendí bien?)
6. **Priorizar** (ver `management.md`)

### Niveles de requisitos (no confundir)

```
Requisitos de negocio   → por qué (objetivo de la organización)
   "Reducir 30% las llamadas a soporte"
        ▼
Requisitos de usuario   → qué necesita lograr el usuario
   "El usuario puede resetear su contraseña sin llamar"
        ▼
Requisitos de sistema   → qué hace el sistema
   "El sistema envía un email con link de reset válido por 1h"
```

Cada nivel se deriva del de arriba. Mezclarlos genera confusión.

## Validación vs verificación

- **Validación**: ¿son los requisitos correctos? (¿construimos lo correcto?) → revisar con stakeholders
- **Verificación**: ¿están bien escritos? (¿lo construimos bien?) → auditoría de calidad (ver `quality-review.md`)

## Anti-patterns

- ❌ Asumir que el stakeholder sabe exactamente qué quiere
- ❌ Recolectar solo lo dicho, ignorar lo implícito/latente
- ❌ No identificar a todos los stakeholders (faltan requisitos)
- ❌ Preguntas que sugieren la respuesta (sesgo)
- ❌ Aceptar la solución del stakeholder sin entender el problema
- ❌ No validar lo entendido (asumir que entendiste bien)
- ❌ Una sola técnica (combinar entrevistas + observación + docs)
- ❌ No documentar supuestos cuando falta un stakeholder
- ❌ Confundir niveles (negocio/usuario/sistema)

## Checklist de elicitación

- [ ] Stakeholders identificados y mapeados (poder/interés)
- [ ] Técnicas elegidas según contexto (≥2 combinadas)
- [ ] Problema separado de solución
- [ ] Requisitos implícitos cuestionados
- [ ] Categorías de NFR revisadas sistemáticamente
- [ ] Contradicciones resueltas
- [ ] Niveles separados (negocio/usuario/sistema)
- [ ] Entendimiento validado con stakeholders
- [ ] Supuestos documentados (donde falta info)
- [ ] Listo para redactar (ver formato apropiado)
