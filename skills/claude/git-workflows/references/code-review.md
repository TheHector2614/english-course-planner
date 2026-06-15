# Code Review

Cómo dar y recibir feedback constructivo en PRs.

## Por qué hacer code review

**Beneficios reales** (con evidencia, no rituales):

1. **Detección temprana de bugs**: más barato arreglar antes de mergear
2. **Compartir conocimiento**: equipo aprende del código de otros
3. **Mantener consistencia**: estilo, patrones, convenciones
4. **Mentoring implícito**: junior aprende, senior se mantiene actualizado
5. **Documentación viva**: el review queda como historial

**NO razones**:
- ❌ Por ritual ("siempre lo hicimos así")
- ❌ Por desconfianza
- ❌ Para "exhibir conocimiento"

## Qué revisar (orden de prioridad)

```
1. ¿Funciona? (correctness)
2. ¿Es la forma correcta? (design)
3. ¿Edge cases cubiertos? (testing)
4. ¿Seguro? (security, si aplica)
5. ¿Performance aceptable? (si aplica)
6. ¿Mantenible? (legibilidad, abstracciones apropiadas)
7. ¿Consistente con codebase? (style — idealmente automatizado)
```

**Si automatizás 6 y 7**, el reviewer se enfoca en 1-5 (lo importante).

## Cómo revisar paso a paso

### 1. Leer la descripción

¿Entendés qué quiere lograr esta PR? Si no, **preguntá antes de revisar el código**.

### 2. Entender el contexto

- Ver el issue/ticket linkeado
- Conocer el área del código que cambia
- Si es feature nueva, ¿hay design doc / RFC?

### 3. Self-test (cuando aplique)

Para cambios no triviales, **correr el código localmente**:

```bash
gh pr checkout 123  # GitHub CLI
# probar
```

Reviews "solo del diff" a veces missan cosas que solo aparecen ejecutando.

### 4. Leer el diff

**No escanear**. Leer línea por línea.

Buscar:
- ¿Lógica correcta?
- ¿Cubre los casos descritos?
- ¿Tests apropiados?
- ¿Hay regresiones obvias?
- ¿Edge cases?

### 5. Dejar comments

Cada comment con **propósito claro**:
- 🛑 **Blocking**: debe arreglarse antes de mergear
- 💡 **Suggestion**: mejora opcional
- ❓ **Question**: no entiendo, ¿podés explicar?
- 👍 **Praise**: algo bien hecho

Usar prefijos en el comment:
```
blocking: Esta query es vulnerable a SQL injection.
Cambiar a parameterized query:
\`\`\`
db.query('SELECT * FROM users WHERE id = ?', [userId])
\`\`\`

nit: typo "recieve" → "receive"

question: ¿Por qué cambiamos de POST a PUT acá?

praise: Excelente extracción de validation logic en clase separada 👍
```

### 6. Concluir

- **Approve**: si está bien (no perfecto, "bueno suficiente")
- **Request changes**: solo si hay blocking issues
- **Comment**: si tenés feedback pero alguien más debe aprobar

## Cómo dar feedback constructivo

### Específico, no vago

```
❌ "Esto está mal."
❌ "No me gusta esta estructura."
❌ "Hay un problema acá."

✅ "Esta función tiene un bug: si `users` es vacío, retorna `undefined` en lugar de `[]`."
✅ "Sugiero extraer estas 3 condiciones en una función `isEligibleForDiscount()` para mejorar legibilidad."
✅ "La validación de email permite emails sin '@'. Considerar usar regex stricter o lib como zod."
```

### Sugerí soluciones cuando criticás

```
❌ "Esta abstracción no me convence."
✅ "Esta abstracción me cuesta seguir. ¿Considerar dividir en X e Y porque tienen responsabilidades diferentes?"
```

### Criticá código, no personas

```
❌ "Otra vez no manejaste el null."
❌ "Como siempre, te olvidaste del test."
❌ "¿No sabés que esto es un anti-pattern?"

✅ "Acá falta manejar el caso null."
✅ "Falta test para el edge case X."
✅ "Esto se considera anti-pattern en este codebase porque [razón]. Ver ADR-005."
```

### Distinguir reglas de preferencias

```
✅ "blocking: Esto es vulnerable a XSS, hay que sanitizar."  (regla)
✅ "nit: Prefiero usar `const` aquí en lugar de `let`, pero opcional." (preferencia)
✅ "Subjetivo, pero esta función me parece larga (60 líneas). ¿Dividir?" (preferencia)
```

Si discutís preferencias durante 1 hora, perdés tiempo de todos. Si es una **regla del proyecto**, escribirla en CONTRIBUTING o style guide y referenciarla.

### Cuando hay desacuerdo

1. **Asumí buena fe**: la otra persona tiene contexto que vos no
2. **Preguntá antes de afirmar**: "¿Por qué elegiste esta approach?" antes de "esto está mal"
3. **Citá fuentes**: docs, ADRs, casos reales
4. **Cedé en sugerencias, no en bloqueantes**: discutir bikeshed = nadie gana
5. **Si no llegan a acuerdo**: traer a tercero (otro reviewer, tech lead)

### Reconocer cosas bien hechas

```
✅ "praise: Esta refactorización quedó muy clara, gracias."
✅ "👍 Excelente cobertura de tests."
✅ "Aprendí algo nuevo con este patrón. Vale agregarlo a nuestro internal style guide."
```

Reviews que solo critican generan resentimiento. Praise honesto motiva.

## Cómo recibir feedback

### Sin defensividad

```
❌ "Pero es que..."
❌ "Eso ya lo había pensado, pero..."
❌ "Funciona así porque..."

✅ "Buen punto, voy a cambiarlo."
✅ "No había considerado eso, gracias."
✅ "Tenés razón en X. Sobre Y, mi razonamiento fue Z, ¿qué pensás?"
```

### Si discrepás

**OK discrepar**. Pero:
1. Releer el comment para asegurar que lo entendiste
2. Si todavía discrepás, explicar contexto/razonamiento
3. No es batalla ganar/perder

```
"Entiendo tu punto sobre extraer la función, pero en este caso me parece overkill porque solo se usa una vez. Si esto se reusara, totalmente de acuerdo. ¿OK dejarlo inline?"
```

### Si no entendés

Preguntá. No silencio que parece que ignoraste.

```
"No estoy seguro de qué quieres decir con 'simplificar esto'. ¿Podés dar un ejemplo de cómo lo verías?"
```

### Reaccionar a feedback

- ✅ Cambios pequeños: nuevo commit con fix
- ✅ Cambios grandes: discutir primero, después implementar
- ✅ Sugerencias no-blocking: "Voy a aplicar esto, gracias" o "Lo voy a dejar como TODO para después porque [razón]"
- ✅ Resolver conversation cuando arreglaste

## Niveles de review

### Light review

Para PRs chicas, cambios mecánicos, hot fixes:
- Skim del diff
- Verificar tests existen
- Aprobar si parece bien

### Standard review

PRs típicas:
- Leer descripción
- Leer diff completo
- Comentar lo encontrado
- Aprobar o pedir cambios

### Deep review

PRs grandes, arquitecturales, security-critical:
- Self-test local
- Probar edge cases
- Considerar implicaciones a largo plazo
- Quizás involve a otros expertos

Calibrar nivel de review según importancia. Reviewers experimentados saben cuándo aplicar cada uno.

## Code review checklist por área

### General

- [ ] Hace lo que el título/descripción dice
- [ ] Cambios atómicos y enfocados
- [ ] Sin código comentado
- [ ] Sin `console.log`, `debugger`, prints debug
- [ ] Sin TODOs sin contexto
- [ ] Nombres claros (variables, funciones, archivos)
- [ ] Sin duplicación obvia
- [ ] Errores manejados apropiadamente
- [ ] Logging apropiado (ni mucho ni poco)

### Tests

- [ ] Tests para casos felices
- [ ] Tests para edge cases
- [ ] Tests para errores
- [ ] Tests legibles (qué prueban es claro)
- [ ] Sin tests skipped sin razón documentada
- [ ] Asserts específicos (no solo "no crashed")
- [ ] Coverage razonable (sin obsesionarse)

### Seguridad (delegar a `web-backend-security` si profundo)

- [ ] Input validation (no confiar en cliente)
- [ ] Sanitización (XSS, SQL injection)
- [ ] AuthN/AuthZ correcta
- [ ] Secrets no commiteados
- [ ] Sin información sensible en logs/errors
- [ ] HTTPS forzado donde aplique
- [ ] CORS apropiado
- [ ] Rate limiting si endpoint público

### Performance

- [ ] Sin N+1 queries
- [ ] Indexes apropiados en queries nuevas
- [ ] Caché donde tiene sentido
- [ ] No carga toda la lista para luego paginar
- [ ] Async donde apropiado
- [ ] Sin bloqueos de UI en operaciones largas

### Database (delegar a `databases`)

- [ ] Migrations idempotentes
- [ ] Sin DROP TABLE sin plan
- [ ] FKs declaradas
- [ ] Indexes en FKs
- [ ] Tipos correctos (DECIMAL para dinero)
- [ ] NOT NULL apropiado
- [ ] Constraints apropiadas

### Frontend

- [ ] Accesibilidad (alt text, aria, contraste, keyboard)
- [ ] Responsive
- [ ] Loading states
- [ ] Error states
- [ ] i18n si aplica
- [ ] Sin keys hardcoded
- [ ] Memoización donde tiene sentido (sin sobre-optimizar)

### Documentación

- [ ] README actualizado si setup cambió
- [ ] API docs actualizadas si endpoint cambió
- [ ] CHANGELOG si aplica
- [ ] Comentarios donde valor agregan (`code-comments.md`)
- [ ] Docstrings/JSDoc en APIs públicas

## Anti-patterns review

### Como reviewer

- ❌ Aprobar sin leer
- ❌ Solo señalar problemas, nunca elogiar
- ❌ Bikeshedding (discutir trivialidades)
- ❌ Imponer estilo personal sobre reglas del equipo
- ❌ Pedir refactor masivo en PR no relacionado
- ❌ "esto está mal" sin explicar
- ❌ Sarcasmo o pasivo-agresivo
- ❌ Block PR por días sin responder
- ❌ Block PR por algo que tiene fix en otra PR
- ❌ Approve "para no bloquear" sin entender

### Como autor

- ❌ Pedir review sin auto-review
- ❌ Defenderse de todo comment
- ❌ Re-enviar el mismo diff después de comments
- ❌ "Funciona, no toques" como excusa
- ❌ Mergear sin esperar reviews
- ❌ Force-push borrando comments contextuales
- ❌ Tomar review como ataque personal

## Tools que ayudan

### GitHub

- **Suggested changes**: reviewer propone diff exacto, autor acepta con un click
  ```markdown
  ​```suggestion
  const total = items.reduce((sum, item) => sum + item.price, 0);
  ​```
  ```
- **Required reviewers** (en branch protection)
- **CODEOWNERS** automático
- **Review approval rules** por archivo

### GitLab

- Similar a GitHub
- **Code Quality** integrado
- **Merge request approvals** flexible

### CodeClimate / SonarQube / DeepSource

Automáticos:
- Code smells
- Duplication
- Coverage
- Cyclomatic complexity

Usar como **input**, no como gatekeeper estricto.

### Reviewable.io / Graphite / Phabricator

Tools especializadas para reviews complejas. Útiles en monorepos grandes.

## Cómo escalar reviews

### Si sos reviewer overloaded

- Establecer **review hours** (e.g., 10-11 AM)
- Pedir que otros reviewers ayuden
- Sugerir PRs más chicas
- Auto-asignar tools (CodeRabbit, Greptile, etc.) como primer pass

### Si tu PR no recibe review

- Pedir explícitamente (Slack, no solo notification)
- Bookable office hours del reviewer
- Dividir en PRs más chicas (más fácil aceptar revisar 100 líneas que 1000)
- Compartir contexto (descripción extensa, ofrecer walkthrough)

## AI-assisted review

Tools que ayudan (no reemplazan humanos):

- **GitHub Copilot Workspace** / **Copilot PR**
- **CodeRabbit**
- **Greptile**
- **Cursor / Continue**
- **Claude / GPT** en PR descriptions

Usar para:
- Primer pass automático
- Detectar issues comunes
- Sugerencias de mejora

**No usar** para:
- Aprobar sin revisar humano
- Skip review en cambios críticos
- Reemplazar conocimiento de dominio

## Métricas de salud del review

Medir (sin obsesionarse):

- **Time to first review**: < 4 horas idealmente, < 24h máximo
- **Time to merge**: < 2-3 días
- **PR size**: distribución (objetivo: < 300 líneas mayoría)
- **Approval rate**: % de PRs aprobadas en primera ronda
- **Review iterations**: cuántas idas y vueltas

Métricas malas indican problemas:
- Time to first review > 1 día → reviewers no priorizan o falta capacidad
- PRs grandes → falta de práctica de divisional
- Muchas iteraciones → falta de contexto pre-PR (RFCs, design docs)

## Cultura de review

### Lo que funciona

- Time dedicado: bloquear horas para review
- Pair review: dos reviewers, uno experimentado, uno aprendiendo
- Review office hours
- Praise público + crítica privada (cuando aplique)
- Author = responsable de mergear cuando aprobada (no reviewer)

### Lo que no funciona

- "Drive-by reviews" sin contexto
- Penalizar críticamente comments
- Castigar al autor por errores
- Review como performance metric individual ("X reviews/week")
- Aprobar para "no bloquear" sin entender

## Recursos

- Google's Engineering Practices: https://google.github.io/eng-practices/review/
- "Code Review Best Practices" — varios libros y artículos
- Conventional Comments: https://conventionalcomments.org/

## Checklist code review (resumen)

Antes de aprobar:
- [ ] Entendí qué hace la PR
- [ ] Leí el diff completo
- [ ] Probé localmente si necesario
- [ ] Considerar correctness, design, tests, security, performance
- [ ] Dejé comments específicos y constructivos
- [ ] Distinguí blocking vs sugerencia
- [ ] CI verde
