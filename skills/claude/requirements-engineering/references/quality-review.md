# Calidad y Auditoría de Requisitos

Características de un buen requisito, detección de ambigüedad, "requirement smells", checklist de revisión. Cómo auditar requisitos existentes.

## Para qué auditar

Un requisito mal escrito cuesta caro: se descubre tarde (en desarrollo, en testing, o peor, en producción), genera retrabajo, malentendidos y bugs. Auditar requisitos **antes** de construir es de las inversiones más rentables.

```
Costo de arreglar un defecto de requisitos:
Requisitos:    1x
Diseño:        ~5x
Desarrollo:    ~10x
Testing:       ~20x
Producción:    ~100x+
```

## Características de un buen requisito (IEEE 29148)

Auditar cada requisito contra estas propiedades:

### Individuales (cada requisito)

| Característica | Pregunta de auditoría |
|---|---|
| **Necesario** | ¿Aporta valor? ¿Alguien lo pidió? (vs gold plating) |
| **No ambiguo** | ¿Tiene una sola interpretación posible? |
| **Completo** | ¿Tiene toda la info para implementarlo y probarlo? |
| **Singular/atómico** | ¿Es una sola necesidad? (no varios "y") |
| **Factible** | ¿Es implementable con recursos/tecnología reales? |
| **Verificable/testeable** | ¿Puedo escribir una prueba que confirme si se cumple? |
| **Trazable** | ¿Sé de dónde viene y hacia dónde va? |
| **Conforme** | ¿Sigue el formato/plantilla acordado? |

### Del conjunto (todos juntos)

| Característica | Pregunta |
|---|---|
| **Completo** | ¿Cubre todos los casos? (incluidos errores, bordes, NFRs) |
| **Consistente** | ¿Hay contradicciones entre requisitos? |
| **Sin duplicados** | ¿Hay requisitos repetidos o solapados? |
| **Priorizado** | ¿Está clara la importancia relativa? |

## Ambigüedad: el enemigo #1

### Palabras vagas (banderas rojas)

Buscar y eliminar:

```
fácil, simple, intuitivo, amigable, rápido, lento, eficiente,
robusto, flexible, escalable, seguro, confiable, óptimo,
apropiado, adecuado, suficiente, razonable, mínimo, máximo,
etc., y/o, según corresponda, si es necesario, normalmente,
aproximadamente, varios, algunos, muchos, pocos, mejor,
de alta calidad, moderno, estado del arte, user-friendly
```

Cada una de estas exige: **¿qué significa exactamente? ¿cómo se mide?**

```
❌ "El sistema debe responder rápido"
✅ "El sistema debe responder en <300ms en el p95"

❌ "La búsqueda debe ser flexible"
✅ "La búsqueda debe permitir filtrar por nombre, fecha y categoría,
    combinables con AND"

❌ "Manejar errores apropiadamente"
✅ "Ante un error de validación, mostrar el campo y el mensaje
    específico; ante un error de servidor, mostrar mensaje genérico
    y registrar el detalle en logs"
```

### Tipos de ambigüedad

- **Léxica**: palabra con varios significados ("usuario" = persona o cuenta?)
- **Sintáctica**: estructura ambigua ("notificar al admin y al usuario si falla" → ¿ambos si falla, o admin siempre + usuario si falla?)
- **Referencial**: pronombre/referencia poco clara ("se actualiza y luego se elimina" → ¿qué?)
- **De alcance**: "todos los usuarios pueden ver los reportes activos" → ¿todos los reportes activos, o los usuarios activos?

## Requirement smells (señales de problema)

| Smell | Ejemplo | Problema |
|---|---|---|
| **Vaguedad** | "interfaz intuitiva" | No testeable |
| **Compuesto** | "validar y guardar y notificar" | No atómico |
| **Implementación** | "usar Redis para cachear" | Es diseño, no requisito |
| **Especulación** | "debería poder integrarse con futuros sistemas" | No verificable, sin alcance |
| **Condicional vago** | "si es necesario, enviar email" | ¿Cuándo es necesario? |
| **Comparativo sin base** | "más rápido que el sistema actual" | ¿Cuánto? ¿Medido cómo? |
| **Negación múltiple** | "no debe no permitir..." | Confuso |
| **Cuantificador débil** | "la mayoría de las veces" | No determinístico |
| **Loophole** | "en la medida de lo posible" | Escapatoria, no compromiso |
| **Pronombre ambiguo** | "lo procesa y lo envía" | ¿Qué es "lo"? |

## Detectar requisitos faltantes (completitud)

Lo que NO está escrito es tan peligroso como lo mal escrito. Revisar sistemáticamente:

### Casos no felices
- ¿Qué pasa ante entradas inválidas?
- ¿Qué pasa ante errores del sistema/red/dependencias?
- ¿Qué pasa en los límites (0 elementos, máximo, vacío, muy grande)?
- ¿Estados concurrentes / condiciones de carrera?

### Categorías sistemáticas
- ¿Requisitos no funcionales? (performance, seguridad, etc. → `non-functional.md`)
- ¿Permisos/autorización? (¿quién puede hacer qué?)
- ¿Estados del dato? (creación, edición, borrado, archivado)
- ¿Internacionalización, accesibilidad?
- ¿Migración de datos existentes?
- ¿Auditoría/logging?
- ¿Qué pasa al desactivar/eliminar?

### Preguntas de completitud
```
- ¿Cubre el camino feliz Y los alternativos Y los de error?
- ¿Están definidos todos los estados de cada entidad?
- ¿Hay NFRs para esta funcionalidad?
- ¿Quién tiene permiso? ¿Qué ve cada rol?
- ¿Qué pasa con los datos existentes?
```

## Proceso de auditoría

1. **Por requisito**: pasar cada uno por las características individuales
2. **Detectar smells**: buscar palabras vagas y patrones problemáticos
3. **Del conjunto**: consistencia, duplicados, priorización
4. **Completitud**: ¿qué falta? (casos borde, errores, NFRs)
5. **Reescribir**: proponer la versión corregida
6. **Reportar**: hallazgos priorizados por severidad

### Formato de reporte de auditoría

```markdown
## Auditoría de requisitos: [proyecto]

### Resumen
- N requisitos revisados
- X problemas críticos, Y medios, Z menores
- Principales patrones: ambigüedad (N), no-testeables (N), faltantes (N)

### Hallazgos críticos
| ID | Requisito | Problema | Reescritura propuesta |
|----|-----------|----------|----------------------|
| REQ-003 | "debe ser rápido" | No testeable (vaguedad) | "responde en <200ms p95" |
| REQ-007 | "validar y enviar" | Compuesto (no atómico) | Separar en REQ-007a y 007b |

### Requisitos faltantes (completitud)
- No hay requisitos para el caso de email duplicado en registro
- Faltan NFRs de performance para la búsqueda
- No se define qué pasa al eliminar una cuenta con datos asociados

### Recomendaciones priorizadas
1. [Crítico] ...
2. [Medio] ...
```

## Antes/después: ejemplos

```
❌ "El sistema debe manejar muchos usuarios"
✅ "El sistema debe soportar 10.000 usuarios concurrentes con
    latencia p95 <500ms"

❌ "Los reportes deben generarse de forma eficiente"
✅ "Un reporte de hasta 100.000 filas debe generarse en <10s"

❌ "El login debe ser seguro y fácil"
✅ Separar en:
   - "El login usa TLS 1.2+ y bloquea tras 5 intentos fallidos en 15 min"
   - "Un usuario completa el login en ≤2 pasos"

❌ "Notificar a los usuarios relevantes cuando algo importante pase"
✅ "Cuando un pedido cambia de estado, notificar por email al cliente
    dueño del pedido dentro de los 60 segundos"
```

## Revisión por pares e inspección

Técnicas formales (para contextos que lo ameriten):
- **Walkthrough**: el autor presenta los requisitos al equipo
- **Inspección Fagan**: revisión formal con roles (moderador, lector, autor) y registro de defectos
- **Checklist-based review**: cada revisor usa un checklist
- **Perspective-based reading**: cada revisor lee desde una perspectiva (usuario, tester, desarrollador)

Para la mayoría de equipos, una revisión con checklist + criterios de aceptación claros alcanza.

## Anti-patterns

- ❌ No auditar (descubrir problemas en desarrollo/producción)
- ❌ Aceptar palabras vagas
- ❌ Requisitos no testeables
- ❌ Ignorar la completitud (solo revisar lo escrito, no lo faltante)
- ❌ No revisar casos de error/borde
- ❌ Auditar sin reescribir (señalar el problema sin la solución)
- ❌ No priorizar los hallazgos (todo "crítico")
- ❌ Revisar solo individualmente (ignorar consistencia del conjunto)

## Checklist de auditoría

### Por requisito
- [ ] Necesario (aporta valor, alguien lo pidió)
- [ ] No ambiguo (una interpretación)
- [ ] Sin palabras vagas
- [ ] Atómico (una necesidad)
- [ ] Testeable/verificable
- [ ] Factible
- [ ] Sin implementación (qué, no cómo)
- [ ] Trazable

### Del conjunto
- [ ] Consistente (sin contradicciones)
- [ ] Sin duplicados
- [ ] Priorizado
- [ ] Completo (casos felices + alternativos + errores + bordes)
- [ ] NFRs presentes
- [ ] Permisos/roles definidos
- [ ] Estados de las entidades cubiertos

### Reporte
- [ ] Hallazgos con reescritura propuesta
- [ ] Requisitos faltantes identificados
- [ ] Priorizado por severidad
