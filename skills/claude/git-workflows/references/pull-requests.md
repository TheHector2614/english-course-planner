# Pull Requests / Merge Requests

Cómo crear PRs revisables, templates, tamaño, descripción.

## Anatomía de una buena PR

```
1. Título claro (Conventional Commit format si aplica)
2. Descripción: qué y por qué (no cómo)
3. Cambios pequeños y focalizados
4. Tests incluidos
5. Docs actualizadas si aplica
6. CI verde antes de pedir review
7. Auto-review primero (revisar el propio diff)
```

## Título

**Formato recomendado**: Conventional Commit.

```
✅ feat(auth): add OAuth2 login flow
✅ fix(api): handle null user in profile endpoint
✅ refactor(orders): extract OrderValidator from OrderService

❌ Login stuff
❌ WIP
❌ Fix bug
❌ Update files
```

Si usás squash merge, el PR title se convierte en el commit. Doble razón para que sea claro.

## Descripción

### Lo esencial

- **Qué** cambia (resumen, no diff verbatim)
- **Por qué** este cambio
- **Cómo probar** (steps para validar)
- **Riesgos** o consideraciones especiales

### Lo opcional pero útil

- Screenshots / GIFs (UI changes)
- Antes/después (perf, refactor)
- Links a docs/RFCs/ADRs
- Trade-offs considerados

## Template PR universal

`.github/pull_request_template.md`:

```markdown
## Descripción

<!-- Qué cambia y por qué. Conciso, no parafrasear el diff. -->

## Tipo de cambio

- [ ] Bug fix (no breaking)
- [ ] New feature (no breaking)
- [ ] Breaking change
- [ ] Documentation only
- [ ] Refactor / chore

## Cómo probar

<!-- Pasos para verificar funcionamiento, o "CI cubre todos los casos" -->

1.
2.

## Checklist

- [ ] Tests agregados o actualizados
- [ ] Documentación actualizada (README, docs/, comentarios)
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Sin secrets, credentials o datos sensibles
- [ ] Auto-review del diff realizado
- [ ] CI verde

## Tickets relacionados

<!-- Closes #N / Refs #N -->

## Screenshots (si aplica)

<!-- Cambios visuales: antes/después o video -->
```

## Templates específicos

### Para bugs

```markdown
## Bug fix: <breve descripción>

### Síntoma

<qué estaba mal>

### Causa raíz

<por qué pasaba>

### Fix

<qué cambia y por qué resuelve>

### Test

<test que falla antes, pasa después>
```

### Para features

```markdown
## Feature: <nombre>

### Problema que resuelve

<contexto de negocio o técnico>

### Solución

<approach elegido y por qué>

### Alternativas consideradas

<brevemente, qué otras opciones>

### Riesgos

<qué puede ir mal>

### Rollback plan

<cómo revertir si falla>
```

### Para refactors

```markdown
## Refactor: <área>

### Motivo

<por qué refactorear ahora>

### Cambios

<qué se mueve / renombra / extrae>

### Comportamiento

- [ ] Sin cambios funcionales
- [ ] Tests existentes pasan sin modificar
- [ ] Tests nuevos para nuevos componentes
```

## Tamaño de PR

### Por qué importa

| Líneas | Calidad de review |
|---|---|
| < 100 | Excelente — reviewer puede entender todo |
| 100-300 | Bueno |
| 300-500 | Marginal |
| 500-1000 | Mala — reviewer escanea |
| > 1000 | Nadie revisa bien — "LGTM 🚀" |

### Cómo dividir PRs grandes

**Opciones**:

1. **Stacked PRs**: PR B depende de PR A
   - PR A: mergear primero
   - PR B: re-base sobre A después

2. **Feature branch + PRs incrementales**:
   - `feat/big-feature` larga
   - PRs chicos hacia esta branch, no a main
   - Cuando completa, mergear a main

3. **Feature flags**:
   - Cambios mergeados a main escondidos detrás de flag
   - Múltiples PRs construyendo la feature gradualmente

### Excepciones permitidas

PRs grandes que son OK:
- ✅ Renaming masivo (cambio mecánico, fácil de revisar)
- ✅ Auto-formatting masivo (commit separado)
- ✅ Generated code (vendor/, generated/)
- ✅ Migrations de schema con muchos archivos

Marcar claramente: "Mostly auto-generated, see commit X for logic".

## Draft PRs

Crear como **draft** cuando:
- Querés feedback temprano sin pedir aprobación
- Cambios aún WIP pero querés mostrar dirección
- Discutir approach antes de pulir

```bash
gh pr create --draft  # GitHub CLI
```

GitHub/GitLab muestran badge "Draft" — reviewers saben que no es para aprobar todavía.

## Workflow recomendado

```bash
# 1. Asegurar main actualizado
git checkout main
git pull

# 2. Branch desde main
git checkout -b feat/oauth-login

# 3. Trabajar, commits pequeños
git add .
git commit -m "feat(auth): add OAuth provider config"

# 4. Push branch
git push -u origin feat/oauth-login

# 5. Auto-review del diff antes de pedir review humano
gh pr create --draft  # o equivalente
# Leer el propio diff. Encontrar cosas como:
# - Console.logs olvidados
# - TODO sin owner
# - Código comentado
# - Test data dejado

# 6. Limpiar lo encontrado
git commit --amend  # o nuevos commits

# 7. Cuando listo, marcar ready for review
gh pr ready

# 8. Reviewers comentan
# 9. Iterar (commits nuevos, no force-push si la PR está en review activo)
# 10. Merge cuando aprobada
```

## Auto-review (paso crítico que muchos saltan)

Antes de pedir review humano:

1. Leer el diff completo de la PR
2. Buscar:
   - `console.log`, `debugger`, `dump()`
   - `TODO` sin contexto
   - Código comentado (debería borrarse)
   - Tests skipped intencionalmente
   - Hardcoded values (URLs, IDs)
   - Imports no usados
   - Variables temporarias con nombres feos (`x`, `tmp`, `xx`)
   - Pasos de debug olvidados

Si encontrás algo: limpiarlo antes de mandar a review. Mostrarle un diff "sucio" a otros es no respetar su tiempo.

## Stacked PRs

Para features grandes, dividir en cadena:

```
main ← PR-A (base) ← PR-B (depende de A) ← PR-C (depende de B)
```

Cuando A se mergea, B se rebasea sobre main, C sobre B (o main).

### Herramientas

- **Graphite** (https://graphite.dev): stacked PRs nativo
- **ghstack** (de Meta)
- **git absorb** (no stacked pero ayuda)
- Manual con branches

### Manual

```bash
# Branch A (base)
git checkout main
git checkout -b feat/a
# commits
git push -u origin feat/a
gh pr create

# Branch B (depende de A)
git checkout -b feat/b
# commits
git push -u origin feat/b
gh pr create --base feat/a   # base es feat/a, no main

# Cuando A merges
git checkout feat/b
git rebase --onto main feat/a  # rebasear B sobre main
git push --force-with-lease
gh pr edit feat/b --base main   # cambiar base de B
```

## Conflict resolution en PRs

Si la PR tiene conflictos:

```bash
git checkout feat/mi-branch
git fetch origin
git rebase origin/main   # o merge si tu estrategia es merge
# Resolver conflicts
git add <files>
git rebase --continue
git push --force-with-lease  # solo en TU branch, nunca en main
```

`--force-with-lease` > `--force`: falla si alguien más pusheó.

## Aproval workflows

### Por tamaño de equipo

| Equipo | Approvals requeridos | CODEOWNERS |
|---|---|---|
| Solo | 0 (self-merge OK) | No necesario |
| 2-5 | 1 | Opcional |
| 5-15 | 1-2 | Recomendado |
| 15+ | 2 + CODEOWNERS | Obligatorio |
| Open source | 1-2 maintainers | Sí |

### Self-merge

❌ **No en equipo**: alguien más debe revisar.
✅ **Solo**: OK pero igual abrir PR (para CI + historial).
✅ **Hotfix urgente**: alguien debe aprobar post-facto, ideal con segundo review luego.

## CI obligatorio en PRs

Mínimo:
- ✅ Build pasa
- ✅ Tests pasan
- ✅ Lint pasa
- ✅ Format check
- ✅ Type check (TS, Python con mypy, etc.)
- ✅ Security scan (gitleaks, dependency scan)

Para proyectos serios:
- Coverage threshold
- Performance regression check
- Visual regression (UI)
- Contract testing (APIs)

## Merge una vez aprobado

### Estrategias (ver `merge-strategies.md`)

- **Squash and merge** (default recomendado): un commit en main, historia limpia
- **Rebase and merge**: lineal, commits individuales preservados
- **Merge commit**: preserva contexto de la branch pero ensucia historia

### Antes de mergear

- [ ] CI verde
- [ ] Approvals requeridos
- [ ] Conflictos resueltos
- [ ] PR title sigue Conventional Commits (especialmente si squash merge)
- [ ] Description actualizada con lo que terminó siendo (a veces difiere de la propuesta original)

### Después de mergear

```bash
git checkout main
git pull
git branch -d feat/oauth-login  # local
git push origin --delete feat/oauth-login  # remote (si no auto-delete)
```

Muchos providers auto-borran branches después de merge — habilitarlo.

## Re-abrir y re-mergear

Si una PR se mergea y descubrís un bug crítico:

**Opción A**: nuevo commit que arregla
```bash
git checkout main
git checkout -b fix/issue-from-prev-merge
# fix
gh pr create
```

**Opción B**: revert + nuevo intento
```bash
git revert <merge-commit-hash>
# Revertis los cambios, crea PR
# Luego trabajar de nuevo en la feature
```

`git revert` no destroy historia, es seguro.

## PR feedback culture

### Si sos autor

- Responder a todo comentario (aunque sea "ack")
- Si discrepás, explicar (no solo "no")
- Si cambiás algo, marcar "Resolved" en el comment
- Push fixes como commits separados durante el review (no force-push)
- Solo después de approval, squashear si vas a mergear sin squash

### Si sos reviewer

- Distinguir bloqueante vs sugerencia
- `nit:`, `nitpick:`, `optional:`, `suggestion:` para no-blocking
- `blocking:` para crítico
- `question:` cuando no entendés (puede ser tu falta de contexto)
- Aprobar cuando esté bien, no perfecto
- "Approve with comments" si las observaciones son menores

## Anti-patterns en PRs

- ❌ Título: "WIP", "Fixes", "Updates", "Changes"
- ❌ Sin descripción ("see commits")
- ❌ Mezclar 3 cosas no relacionadas
- ❌ PR de 2000 líneas
- ❌ Pedir review sin auto-review primero
- ❌ Force-push durante review activo
- ❌ Comentarios sin contexto: "fix this"
- ❌ "LGTM 🚀" sin haber leído
- ❌ Aprobar para "no bloquear el equipo" sin entender
- ❌ Self-merge sin reviews en equipo
- ❌ Ignorar CI rojo y mergear igual
- ❌ Comentarios pasivo-agresivos
- ❌ Mergear "en frío" sin avisar al equipo cambios importantes

## Templates por contexto

### Open source PR

Incluir:
- License acknowledgment
- DCO sign-off (`Signed-off-by:` en commit)
- Mención al issue que cierra
- Cómo testeaste (especialmente para mantenedores externos)

### Empresa interna

Incluir:
- Ticket Jira/Linear/etc.
- Impact analysis si afecta otros equipos
- Comunicaciones requeridas (Slack, email)
- Rollback plan para producción

### Hotfix

Incluir:
- Severity / Impact
- Root cause breve
- Tested manualmente (sí/no, cómo)
- Plan para fix completo si este es solo mitigación

## Métricas útiles

Para mejorar proceso, medir:

- **Time to first review**: cuánto tarda alguien en mirar
- **Time to merge**: de creada a mergeada
- **Cycle time**: de primer commit a producción
- **PR size**: distribución de líneas
- **Reviews per PR**: cuántas iteraciones

Si time to merge > 3 días en promedio, hay un problema (PRs grandes, reviewers no priorizan, falta de capacidad).

## Checklist PR

Al crear:
- [ ] Título Conventional Commit
- [ ] Descripción clara: qué y por qué
- [ ] Tamaño manejable (< 500 líneas idealmente)
- [ ] Tests incluidos
- [ ] Auto-review hecho
- [ ] CI verde antes de marcar ready
- [ ] Labels apropiados (bug, feature, etc.)
- [ ] Linked al ticket

Al recibir:
- [ ] Leer descripción completa
- [ ] Revisar diff completo (no escanear)
- [ ] Probar localmente si cambios complejos
- [ ] Feedback constructivo
- [ ] Distinguir bloqueante vs sugerencia

Al mergear:
- [ ] CI verde
- [ ] Approvals requeridos
- [ ] Conflictos resueltos
- [ ] PR title final correcto
- [ ] Estrategia merge apropiada (squash/rebase/merge)
- [ ] Branch borrada después
