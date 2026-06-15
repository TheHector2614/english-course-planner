# Recovery: Recuperar Trabajo Perdido

Reflog, rescate de branches borradas, stashes perdidos.

## Principio: casi nada se pierde "para siempre"

Git guarda referencias durante **90 días** por default (gc.reflogExpire). Durante ese tiempo, podés recuperar casi todo.

## `git reflog`: tu mejor amigo

Reflog = historial de **dónde estuvo HEAD** (y branches).

```bash
git reflog
```

Output:
```
abc1234 (HEAD -> main) HEAD@{0}: commit: feat: add feature X
def5678 HEAD@{1}: pull: Fast-forward
ghi9012 HEAD@{2}: checkout: moving from feat/old to main
jkl3456 HEAD@{3}: commit: WIP debugging
mno7890 HEAD@{4}: rebase (start): checkout main
```

Cada línea es un **estado anterior** de HEAD.

### Reflog de branch específica

```bash
git reflog show feat/mi-branch
```

### Restaurar a un estado previo

```bash
git checkout HEAD@{3}       # checkout en un estado anterior (detached HEAD)
git branch recovered HEAD@{3}  # crear branch desde ahí
git reset --hard HEAD@{3}    # restaurar branch actual al estado de HEAD@{3}
```

## Casos comunes

### Caso 1: Hice `git reset --hard` y perdí commits

```bash
git reflog
# Encontrar el commit "perdido"
git reset --hard HEAD@{2}    # volver al estado anterior al reset
```

O:
```bash
git branch recovered <commit-hash>
```

### Caso 2: Borré una branch

```bash
# La branch estaba en commit abc1234
git reflog
# o
git fsck --lost-found

# Recrear
git branch feat/recovered abc1234
```

Si la branch fue pusheada y borrada del remote también:
```bash
# Si tenés clone local con la branch
git push origin feat/recovered

# Si no, buscar en PR cerrada — el commit sigue accesible
git fetch origin pull/123/head:recovered-branch
```

### Caso 3: Force push borró commits

Si vos hiciste el force push:
```bash
git reflog
git reset --hard HEAD@{1}   # antes del force push
git push --force-with-lease
```

Si **alguien más** hizo force push borrando tu trabajo:
- Verificar si todavía tenés clone local con commits
- Si sí: push de tu local
- Si no: buscar en CI logs, PR descripcion (algunos providers preservan info)

### Caso 4: Commit perdido por rebase mal hecho

```bash
git reflog
# Encontrar pre-rebase
git reset --hard HEAD@{5}   # o donde estaba antes
```

O cherry-pick los commits perdidos:
```bash
git cherry-pick <commit-perdido>
```

### Caso 5: Cambios stashed perdidos

```bash
# Listar stashes
git stash list

# Si un stash se "perdió"
git fsck --lost-found
# Listará blobs y commits unreachable

git show <commit-hash>   # verificar contenido
git stash apply <commit-hash>
```

### Caso 6: Commit hecho en branch equivocada

```bash
# Estabas en main, hiciste commit que iba en feat/X
git checkout feat/X
git cherry-pick main   # trae el último commit de main
git checkout main
git reset --hard HEAD~1   # quitar el commit de main
```

### Caso 7: Archivos no commiteados borrados localmente

Sin commit, **no hay reflog**. Pero si los archivos estaban tracked:

```bash
git checkout HEAD -- <archivo>    # restaurar a versión del último commit
```

Si los archivos eran nuevos (no tracked) y los borraste: imposible recuperar de Git. (Tu IDE puede tener history local, o backup del SO.)

### Caso 8: Detached HEAD con commits

Hiciste commits en detached HEAD y volviste a main, ahora "no están":

```bash
git reflog
# Encontrar HEAD@{N} con los commits

git branch save-my-work HEAD@{N}
```

Detached HEAD genera reflog igual.

### Caso 9: Merge mal hecho

```bash
# Estás en medio del merge con conflictos no resueltos
git merge --abort

# Ya commiteaste el merge mal
git reset --hard ORIG_HEAD       # ORIG_HEAD = pre-merge
# o
git reset --hard HEAD~1           # si fue un merge commit

# El merge ya está pusheado
git revert -m 1 <merge-commit>    # crear commit revert
```

### Caso 10: Rebase con conflictos sin terminar

```bash
git rebase --abort               # cancelar rebase
git rebase --continue            # continuar tras resolver
git rebase --skip                # skipear commit actual

# Si quedaste en estado mixto raro
git reset --hard ORIG_HEAD       # volver al pre-rebase
```

## `git fsck`: buscar objetos perdidos

```bash
git fsck --lost-found

# Lista commits, blobs, trees no referenciados
# dangling commit abc1234
# dangling blob def5678
```

Inspeccionar:
```bash
git show <hash>
git log <hash>
```

Recuperar:
```bash
git branch recovered <hash>   # si es commit
git show <hash> > recovered.file  # si es blob (archivo)
```

## Casos extremos

### Caso 11: Repo entero corrupto

```bash
# Verificar integridad
git fsck --full

# Si hay corruption, intentar fetch desde remote
git fetch --all
git reset --hard origin/main
```

Si remote también corrupto: backups (Git providers tienen retention).

### Caso 12: Borrar pubkey y perder acceso a SSH

Es Git-adjacent. Re-generar key y resubir a proveedor.

### Caso 13: Push a repo equivocado

```bash
# Push fue a fork wrong, querías upstream
git push origin feat/X       # corregir push a remote correcto
# El push original sigue en el fork wrong, podés ignorar o borrar branch en ese fork
```

### Caso 14: Commitear secret y empujar

```bash
# 1. ROTAR EL SECRET INMEDIATAMENTE (revocar, regenerar)
#    Ya está expuesto, borrarlo del historial NO lo desexpose

# 2. Si querés limpiar historial (no urgente, es secundario)
git filter-repo --invert-paths --path secrets.env
# o BFG Repo-Cleaner
java -jar bfg.jar --delete-files secrets.env

# Re-push (force, después de coordinar con equipo)
git push --force-with-lease

# 3. Verificar logs del proveedor por uso no autorizado
```

### Caso 15: `git clean -fd` borró archivos importantes

`git clean` borra archivos no-tracked. No están en Git.

**Recuperar desde**:
- IDE local history (VSCode, IntelliJ)
- Backup del sistema operativo (Time Machine, etc.)
- Snapshot del filesystem si existe

Git no tiene esos archivos. Lesson learned: `.gitignore` archivos importantes, no los dejes sin track ni gitignore.

## Limitar pérdida futura

### Configuración protectora

```bash
# Mantener reflog más tiempo (default 90 días)
git config --global gc.reflogExpire 365.days

# Mantener reflog de objects inalcanzables
git config --global gc.reflogExpireUnreachable 90.days

# Auto-stash en rebase
git config --global rebase.autoStash true
```

### Backups remotos

- Push de feature branches **frecuente**, aunque no estén "listas"
- Múltiples remotos (origin + fork personal)
- Servicios como GitHub guardan PRs cerradas (commits accesibles)

### Convenciones del equipo

- Branches importantes con protección (no force push, no delete)
- Tags inmutables
- Drills periódicos de recovery

## Aliases útiles

```bash
git config --global alias.lost "fsck --lost-found"
git config --global alias.last "log -1 HEAD"
git config --global alias.rfl "reflog --date=iso"
git config --global alias.undo "reset --hard HEAD~1"
git config --global alias.unpush "push -f origin HEAD~1:$(git rev-parse --abbrev-ref HEAD)"
```

## Workflow de pánico

Cuando algo malo pasó:

1. **No hagas nada destructivo más** (no `git gc`, no `git prune`)
2. `git reflog` — ver historia reciente
3. `git fsck --lost-found` — encontrar dangling
4. `git status` — entender estado actual
5. `git stash` — guardar lo que sea que estés haciendo
6. Tomar respiración
7. Identificar el commit/branch a recuperar
8. `git branch recovered <hash>` — crear branch desde el punto perdido
9. Verificar contenido antes de seguir
10. Si todo bien, integrar a workflow normal

## Cuándo está realmente perdido

Casi nunca, pero:

- ❌ Archivos no-tracked + `git clean -fd` = Git no los tiene
- ❌ Archivos no-tracked + reset = Git no los tiene
- ❌ Pasados 90 días + `git gc` corrió = perdidos del reflog
- ❌ Force push borrando trabajo Y no tenías clone local
- ❌ `rm -rf .git` sin backup

## Drills periódicos

Equipos serios practican recovery:
1. Crear branch de prueba
2. Simular escenarios (force push, reset, rebase mal)
3. Verificar que el equipo sabe recuperar
4. Documentar procedimientos en runbook

Reduce pánico cuando pasa en serio.

## Checklist recovery

Cuando pasa algo malo:
- [ ] Detuviste comandos destructivos
- [ ] Revisaste `git reflog`
- [ ] Revisaste `git fsck --lost-found`
- [ ] Identificaste commit/branch a recuperar
- [ ] Creaste branch para guardar el estado recuperado
- [ ] Verificaste contenido antes de continuar

Para prevenir:
- [ ] Reflog retention extendido
- [ ] Push frequente de feature branches
- [ ] Branch protection en branches críticas
- [ ] Backups de proveedor (GitHub/GitLab) activos
- [ ] Equipo conoce `git reflog`
- [ ] Drills periódicos
