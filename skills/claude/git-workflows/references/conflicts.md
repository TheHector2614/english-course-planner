# Resolución de Conflictos

Cómo entender, resolver y evitar conflictos de merge/rebase.

## Anatomía de un conflicto

Cuando Git no puede mergear automáticamente, deja marcadores en el archivo:

```typescript
function calculateTotal(items: Item[]): number {
<<<<<<< HEAD
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
=======
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
>>>>>>> feat/rename-fields
}
```

- **`<<<<<<< HEAD`** hasta `=======`: tu versión actual
- **`=======`** hasta `>>>>>>> branch`: la versión de la otra branch

Editás manualmente para resolver, eliminás los marcadores, agregás, continuás.

## Comandos esenciales

```bash
# Durante merge con conflictos
git status                       # ver archivos en conflicto
git diff                         # ver los conflictos
# Editar archivos resolviendo
git add <archivo>                # marcar como resuelto
git merge --continue             # o git commit (cierra el merge)
git merge --abort                # cancelar todo el merge

# Durante rebase con conflictos
git status
# Editar archivos
git add <archivo>
git rebase --continue
git rebase --skip                # skipear este commit
git rebase --abort               # cancelar
```

## Estrategias de resolución

### 1. Aceptar una versión completamente

```bash
# Aceptar tu versión (ours)
git checkout --ours <archivo>
git add <archivo>

# Aceptar la otra versión (theirs)
git checkout --theirs <archivo>
git add <archivo>
```

⚠️ **Cuidado con la semántica**:
- **En `merge`**: `ours` = branch actual, `theirs` = la que mergeás
- **En `rebase`**: invertido. `ours` = upstream, `theirs` = tu branch (porque "rebase" replaya tus commits sobre la otra)

### 2. Mezclar ambas (manual)

Editar el archivo, combinando lo mejor de cada uno:

```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
```

Eliminar marcadores `<<<<<<<`, `=======`, `>>>>>>>`.

Marcar resuelto:
```bash
git add <archivo>
```

### 3. Verificar funcional, no solo sin marcadores

Resolución sintáctica no garantiza correcta. Después de resolver:

```bash
npm test
npm run typecheck
npm run lint
```

Si tests fallan, el merge está mal aunque "compile".

## Tipos de conflictos

### Same line, different content

Más común. Ambos modificaron la misma línea.

### Same file, near lines

Git puede reportar conflict por proximidad aunque no sea misma línea.

### Rename + edit

Una branch renombra el archivo, otra lo edita. Git intenta resolver pero a veces falla.

### Delete + edit

Una branch borra el archivo, otra lo edita.

```bash
git status
# both deleted: file.ts        → ambas borraron, OK
# deleted by us: file.ts       → vos borraste, otro editó
# deleted by them: file.ts     → otro borró, vos editaste
```

Decisión: ¿borrar o mantener?
```bash
git rm <archivo>           # confirmar borrado
# o
git add <archivo>          # mantener (con tus ediciones)
```

### Binary files

Git no puede merge-ear binarios. Decisión: ours o theirs.

```bash
git checkout --ours <archivo>
git checkout --theirs <archivo>
git add <archivo>
```

Para imágenes, PDFs, etc., considerar Git LFS para minimizar conflictos.

## Herramientas de merge

### Built-in

`git mergetool` lanza tu mergetool configurado.

### Tools comunes

| Tool | Cuándo |
|---|---|
| **VSCode** | Built-in mergetool, bueno para la mayoría |
| **IntelliJ / WebStorm** | Excelente UI, devs de JetBrains |
| **vimdiff** | CLI, devs de Vim |
| **Meld** | Linux/macOS, simple |
| **Kdiff3** | Cross-platform |
| **Beyond Compare** | Premium, muy potente |
| **DiffMerge** | Free, decente |

Configurar:
```bash
# VSCode
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Vim
git config --global merge.tool vimdiff

# IntelliJ
git config --global merge.tool idea
git config --global mergetool.idea.cmd 'idea merge "$LOCAL" "$REMOTE" "$BASE" "$MERGED"'
```

Lanzar:
```bash
git mergetool                # interactivo
git mergetool <archivo>      # un archivo
```

### Three-way merge UI

Las mejores tools muestran 4 paneles:

```
| BASE (común) | LOCAL (tuyo) |
| REMOTO (otro) | RESULTADO   |
```

Resultado es lo que vos editás, los otros 3 son referencia.

## VSCode merge editor

VSCode tiene built-in. Cuando hay conflict:

1. Abrir archivo en VSCode
2. Veré botones "Accept Current Change | Accept Incoming Change | Accept Both Changes | Compare Changes"
3. O usar el merge editor (3-way) clickeando "Open in Merge Editor"

## Prevenir conflictos

### 1. Branches cortas

Mientras más larga la branch, más probable hay drift con main → más conflictos.

Mergear y rebasear seguido.

### 2. Pull seguido

```bash
git pull --rebase                # actualizar tu branch con main
# o
git fetch && git rebase origin/main
```

### 3. Comunicación

Si dos personas trabajan en mismo archivo, coordinar:
- Quién mergea primero
- El segundo rebasea/mergea

### 4. Code formatters consistentes

Diferencias de formato (semicolons, indent, line endings) causan conflicts pseudo. Solución: prettier/black/etc. obligatorios en pre-commit.

### 5. `.gitattributes`

Para line endings cross-platform:
```
* text=auto
*.sh text eol=lf
*.bat text eol=crlf
```

### 6. Estructura modular

Si dos personas siempre tocan el mismo archivo, quizás ese archivo es demasiado grande. Dividir.

## Conflictos comunes y cómo evitarlos

### `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`

Conflictos frecuentes. Estrategias:

```bash
# Tu branch tiene conflicto en lockfile
# Aceptar versión de main y re-instalar deps
rm package-lock.json
git checkout origin/main -- package-lock.json
npm install
git add package-lock.json
```

`.gitattributes`:
```
package-lock.json merge=ours
```

(no perfecto, pero reduce ruido)

### `CHANGELOG.md`

Si todos editan en el top:

**Mejor**: changesets (acumulan separados, se mezclan al release).

**Manual**: secciones por feature, no mismo lugar.

### Generated files

`dist/`, `build/`, `*.generated.ts`:

**No commitear**. `.gitignore`.

### Schema migrations

Conflictos en numbering si dos devs crean migraciones con mismo número.

**Solución**: timestamp como numbering (`V20260521_120000__migration.sql`).

### Versiones de paquete

```
{
  "version":
<<<<<<< HEAD
    "1.2.3"
=======
    "1.2.4"
>>>>>>> feat/X
}
```

Resolver con la **más alta** (mantener la que viene de release branch).

## Rerere (Reuse Recorded Resolution)

Si resolvés el mismo conflicto múltiples veces (rebases sucesivos), Git puede memorizar:

```bash
git config --global rerere.enabled true
```

Primera vez resolvés: Git memoriza.
Siguiente vez aparece el mismo conflict: Git lo resuelve automáticamente.

Útil para feature branches largas con muchos rebases.

## Conflictos en rebase: estrategias

### Si el rebase tiene muchos conflictos por cada commit

```bash
# Opción A: rebase --interactive y squash todo
git rebase -i origin/main
# Squashear todos los commits → un solo commit → un solo conflict

# Opción B: merge en lugar de rebase
git rebase --abort
git merge origin/main
# Un solo conflict

# Opción C: cherry-pick los importantes
git rebase --abort
git checkout origin/main
git checkout -b feat/X-clean
git cherry-pick <hash>          # los commits relevantes
```

### `git rebase --rebase-merges`

Preserva merge commits durante rebase. Útil para branches con history más compleja.

## Conflict en submódulos

```bash
# Submódulo apuntando a hash diferente en cada branch
git status
# both modified: submodule_dir

cd submodule_dir
git status                    # ver qué commits hay
git log --oneline             # entender historial

# Elegir el hash correcto
cd ..
git add submodule_dir
git commit
```

## Abortar y replantear

Si el conflict es muy complejo y vas a romper algo:

```bash
git merge --abort
# o
git rebase --abort
```

Volvés al estado pre-merge/rebase. Replanteá:
- ¿Necesito esta branch entera o cherry-pick partial?
- ¿Puedo dividir en commits más chicos?
- ¿Vale rehacer el cambio sobre main actualizado?

## Conflict no en código: comentarios, docs

Mismo proceso. Tomar la decisión semántica correcta.

A veces conflictos en docs revelan que docs estaban desactualizados. Aprovechar.

## Conflicto durante cherry-pick

```bash
git cherry-pick <hash>
# CONFLICT

# Resolver, agregar
git add <archivo>
git cherry-pick --continue

# O abortar
git cherry-pick --abort

# O skipear este commit y continuar con otros (si --multi)
git cherry-pick --skip
```

## Anti-patterns

- ❌ Resolver conflict aceptando "todo lo mío" sin pensar
- ❌ Borrar marcadores sin entender ambas versiones
- ❌ Resolver y no testear funcional
- ❌ Rebases gigantes con 50+ conflicts en lugar de merge simple
- ❌ Conflict en lockfile: hacer "merge manual" (siempre re-generar)
- ❌ Conflict en migration: editar la migración (hacer una nueva)
- ❌ Force push después de conflict mal resuelto sin coordinar
- ❌ "Quick fix" en producción durante merge conflict (escala el problema)

## Cuando un conflict revela problema arquitectural

Si:
- Mismos archivos en conflicto repetidamente
- Branches que no pueden mergear por divergencia
- Hot files (cada PR los toca)

Síntoma de **mala estructura**:
- Archivos demasiado grandes
- Acoplamiento alto
- Falta de modularización

Solución arquitectural: dividir, refactorizar. No es problema de Git, es problema de diseño.

## Workflow recomendado

```bash
# 1. Antes de empezar a trabajar
git checkout main
git pull --rebase

# 2. Branch nueva
git checkout -b feat/X

# 3. Trabajar, commits pequeños

# 4. Cada día (o cuando main cambia mucho)
git fetch
git rebase origin/main         # o merge si preferís

# 5. Resolver conflicts gradualmente, no al final

# 6. Antes de PR final
git rebase -i origin/main      # limpiar commits

# 7. Push
git push --force-with-lease    # OK porque es TU branch
```

Mantenerse sincronizado evita el "big bang conflict resolution" al final.

## Checklist al resolver conflicto

- [ ] Entendí ambas versiones (no aceptar ciego)
- [ ] La resolución es semánticamente correcta (no solo sintáctica)
- [ ] Eliminé todos los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
- [ ] Re-corrí tests
- [ ] Type check / lint
- [ ] Si era cambio de API/contract, verifiqué consumers
- [ ] Si lockfile, re-generé
- [ ] Si migration, re-numeré si necesario
- [ ] Commit message del merge claro
