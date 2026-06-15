# Operaciones Avanzadas

Bisect, cherry-pick, rebase interactivo, worktree, stash, submódulos.

## `git bisect`: encontrar el commit que introdujo un bug

Cuando un bug apareció "en algún momento" pero no sabés cuándo:

```bash
git bisect start

# Marcar versión actual como mala
git bisect bad

# Marcar última versión conocida como buena
git bisect good v1.2.0

# Git checkea un commit del medio
# Probás manualmente
# Indicar: good o bad
git bisect good      # si el bug NO está
git bisect bad       # si el bug ESTÁ

# Repetir hasta que Git encuentre el commit culprit

# Terminar
git bisect reset
```

### Bisect automatizado

Si el bug es testeable:

```bash
git bisect start HEAD v1.2.0
git bisect run npm test
# Git checkea commits y corre `npm test` automáticamente
# Identifica el commit donde el test empieza a fallar
```

Excelente para bugs con repro confiable.

### Output esperado

```
abc1234 is the first bad commit
commit abc1234
Author: Alice <alice@example.com>
Date:   Mon Apr 15 10:23:45 2026

    refactor(query): optimize order lookup

# Ahora sabés exactamente qué commit causó el bug
```

## `git cherry-pick`: copiar commit a otra branch

```bash
# Un commit
git cherry-pick <hash>

# Múltiples commits
git cherry-pick <hash1> <hash2>

# Rango (exclusive de start)
git cherry-pick <start>..<end>

# Rango (inclusive)
git cherry-pick <start>^..<end>

# Sin commitear (mergear los cambios)
git cherry-pick -n <hash>

# Mantener autor original
git cherry-pick -x <hash>      # agrega línea "cherry picked from..."
```

### Casos comunes

**Backport fix a release branch**:
```bash
# Fix en main
git checkout release/v1.0
git cherry-pick <commit-hash>
git push
```

**Recuperar commit de branch borrada** (ver `recovery.md`):
```bash
git checkout -b restore
git cherry-pick <hash-from-reflog>
```

### Conflictos en cherry-pick

```bash
git cherry-pick <hash>
# CONFLICT

# Resolver
git add <files>
git cherry-pick --continue

# O abortar
git cherry-pick --abort
```

## `git rebase -i`: interactive rebase

Editar historia local.

```bash
git rebase -i HEAD~5         # últimos 5 commits
git rebase -i origin/main    # desde main hasta HEAD
```

Editor abre:
```
pick a1b2c3 feat: add login
pick d4e5f6 fix typo
pick g7h8i9 fix again
pick j1k2l3 feat: add OAuth
pick m4n5o6 wip
```

Comandos:
- `pick` (p): mantener
- `reword` (r): cambiar mensaje
- `edit` (e): pausar para modificar
- `squash` (s): combinar con anterior, editar mensaje combinado
- `fixup` (f): combinar con anterior, descartar mensaje
- `drop` (d): eliminar commit
- `exec` (x): correr comando shell

### Workflow típico: limpiar commits antes de PR

```
pick a1b2c3 feat: add login
fixup d4e5f6 fix typo
fixup g7h8i9 fix again
pick j1k2l3 feat: add OAuth
fixup m4n5o6 wip
```

Resultado: 2 commits limpios en lugar de 5.

### `edit`: modificar un commit antiguo

```
edit a1b2c3 feat: add login   # ← pausa aquí
pick d4e5f6 fix typo
pick g7h8i9 ...
```

Git para. Hacés cambios:
```bash
# Modificar archivos
git add <files>
git commit --amend
git rebase --continue
```

### `exec`: tests entre commits

```
pick a1b2c3 feat: add login
exec npm test                 # corre tests después del commit
pick d4e5f6 next feature
exec npm test
```

Útil para verificar que cada commit es "atómico" (compila y pasa tests).

### Después de rebase

```bash
git push --force-with-lease    # TU branch, OK
```

Solo en branches personales o avisar al equipo.

## `git stash`: guardar trabajo temporal

```bash
# Guardar cambios actuales
git stash
git stash push -m "WIP: implementando login"

# Listar
git stash list

# Aplicar el más reciente
git stash pop                  # aplica y elimina del stack
git stash apply                # aplica pero deja en stack

# Específico
git stash apply stash@{2}

# Ver contenido
git stash show -p stash@{0}

# Borrar
git stash drop stash@{0}
git stash clear                # todos
```

### Stash con files no-tracked

```bash
git stash -u                   # incluir untracked
git stash -a                   # incluir untracked e ignored
```

### Stash parcial

```bash
git stash push -m "msg" -- <archivo>
git stash push -p              # interactivo, elegir hunks
```

### Conflict al aplicar stash

```bash
git stash pop
# CONFLICT

# Resolver, agregar
# El stash sigue en el stack hasta que arregles
```

## `git worktree`: múltiples branches simultáneas

En lugar de `git checkout` (cambia branch en place), `worktree` crea **otro directorio** con otra branch.

```bash
# Estás en /repo en main
# Crear worktree para feat/X
git worktree add ../repo-feat-X feat/X

# Ahora:
# /repo               → main
# /repo-feat-X        → feat/X
# Podés trabajar en ambos sin checkout

# Listar
git worktree list

# Remover
git worktree remove ../repo-feat-X

# Limpiar referencias
git worktree prune
```

### Útil para
- Code review (worktree del PR sin tocar tu work-in-progress)
- Build de release branch en paralelo
- Hot-fix sin perder contexto del feature actual

## Submódulos

Repos dentro de repos. **Frágiles**, considerar alternativas (monorepo, package manager).

### Agregar

```bash
git submodule add https://github.com/org/lib.git lib/
git commit -m "chore: add lib submodule"
```

### Clonar con submódulos

```bash
git clone --recurse-submodules <url>
# o
git clone <url>
git submodule update --init --recursive
```

### Actualizar

```bash
# Llevar submódulo al último commit
cd lib/
git pull origin main
cd ..
git add lib/
git commit -m "chore: update lib submodule"
```

### Anti-patterns submódulos

- ❌ Submódulos en repos grandes (operaciones lentas)
- ❌ Submódulos con cambios bidireccionales (caos)
- ❌ Submódulos para shared code que cambia mucho

### Alternativas

- **Package manager** (npm, pip, maven, etc.): para deps
- **Monorepo** (Nx, Turborepo): para varios paquetes relacionados
- **Subtrees**: incrustar repos sin submodule overhead (también complejo)

## Reset, revert, restore

### `git reset` (peligroso)

Mueve HEAD a commit anterior.

```bash
git reset --soft HEAD~1        # mantener cambios en staging
git reset --mixed HEAD~1       # default. cambios en working tree
git reset --hard HEAD~1        # descarta cambios (peligroso)
```

`--hard` es destructivo. Reflog te salva (usualmente).

### `git revert` (seguro)

Crea **nuevo commit** que revierte cambios.

```bash
git revert <hash>              # un commit
git revert <hash1> <hash2>     # múltiples
git revert -m 1 <merge-hash>   # un merge commit
```

Seguro porque no re-escribe historia.

### `git restore` (Git 2.23+)

Más explícito que checkout para restaurar archivos.

```bash
git restore <archivo>                 # descartar cambios working tree
git restore --staged <archivo>        # quitar de staging
git restore --source=HEAD~3 <archivo> # restaurar a versión de hace 3 commits
```

## `git blame`: ver autor de cada línea

```bash
git blame <archivo>
git blame -L 10,20 <archivo>          # líneas 10-20
git blame -w <archivo>                # ignorar whitespace changes
git blame --since=2.weeks <archivo>
```

Útil para entender historia / quién hizo qué.

### Mejor: `git log -p`

```bash
git log -p <archivo>                  # cambios al archivo
git log -p -L 10,20:<archivo>         # cambios a líneas específicas
git log --all --follow <archivo>      # incluyendo renames
```

## `git diff`: comparaciones

```bash
git diff                              # working vs staged
git diff --staged                     # staged vs HEAD
git diff HEAD                         # working vs HEAD
git diff main..feat/X                 # entre branches
git diff main...feat/X                # desde el común ancestor

# Solo nombres
git diff --name-only
git diff --stat                       # summary

# Word-level
git diff --word-diff

# Solo en un archivo
git diff <archivo>

# Externos
git diff > changes.patch              # exportar como patch
git apply changes.patch               # aplicar patch
```

## `git log`: historia

```bash
git log                               # todos
git log --oneline                     # compacto
git log --graph                       # ASCII art del árbol
git log --all                         # todas las branches

# Combinados
git log --all --graph --decorate --oneline

# Por autor
git log --author="Alice"

# Por fecha
git log --since="2 weeks ago"
git log --until="2026-01-01"

# Por mensaje
git log --grep="feat:"

# Por archivo
git log <archivo>
git log -p <archivo>                  # con diff

# Por contenido
git log -S "function_name"            # commits que agregaron/quitaron "function_name"

# Pretty format
git log --pretty=format:"%h %an %s"
```

Aliases útiles:
```bash
git config --global alias.lg "log --graph --decorate --oneline --all"
git config --global alias.last "log -1 HEAD"
```

## `git reflog`: ver historia de HEAD

Ya cubierto en `recovery.md`.

```bash
git reflog
git reflog show <branch>
```

## Filtrar historia: `git filter-repo`

Reescribe historia. Para borrar secrets, archivos grandes, etc.

```bash
# Instalar
pip install git-filter-repo

# Borrar un archivo de TODA la historia
git filter-repo --path secrets.env --invert-paths

# Borrar carpeta
git filter-repo --path old_dir/ --invert-paths

# Re-escribir email del autor
git filter-repo --email-callback '
  return email.replace(b"old@example.com", b"new@example.com")
'
```

⚠️ **Re-escribe historia completamente**. Hashes nuevos. Todos los clones deben re-clonar.

Alternativa: **BFG Repo-Cleaner** (más rápido para casos simples).

```bash
java -jar bfg.jar --delete-files secrets.env
java -jar bfg.jar --strip-blobs-bigger-than 50M
```

## Hooks útiles avanzados

### post-commit: notify

```bash
# .git/hooks/post-commit
#!/usr/bin/env bash
osascript -e 'display notification "Commit done!" with title "Git"'
```

### post-merge: auto-install deps

```bash
# .git/hooks/post-merge
#!/usr/bin/env bash
if git diff HEAD@{1} HEAD --name-only | grep -q "package-lock.json"; then
  echo "package-lock.json changed, running npm install"
  npm install
fi
```

### pre-rebase: prevent rebasing main

```bash
# .git/hooks/pre-rebase
#!/usr/bin/env bash
branch=$(git symbolic-ref --short HEAD)
if [ "$branch" = "main" ]; then
  echo "Refusing to rebase main"
  exit 1
fi
```

## Git aliases poderosos

```bash
# Pretty graph
git config --global alias.lg \
  "log --graph --abbrev-commit --decorate --format=format:'%C(yellow)%h%C(reset) - %C(green)(%ar)%C(reset) %s %C(blue)<%an>%C(reset)%C(red)%d%C(reset)' --all"

# Show stash diff
git config --global alias.stash-diff "stash show -p"

# Last commit
git config --global alias.last "log -1 HEAD --stat"

# Files changed in last commit
git config --global alias.changed "show --stat --oneline HEAD"

# Undo last commit (keep changes)
git config --global alias.undo "reset --soft HEAD~1"

# Delete merged branches
git config --global alias.cleanup "!git branch --merged main | grep -v '^*\|main\|develop' | xargs -n 1 git branch -d"

# Update fork from upstream
git config --global alias.sync \
  "!git fetch upstream && git checkout main && git merge upstream/main && git push origin main"
```

## `.gitignore` patterns útiles

Ver `gitignore-patterns.md`.

## Performance Git

Para repos grandes:

```bash
# Garbage collection
git gc --aggressive --prune=now

# Repack
git repack -ad

# Limit pack size
git config --global pack.windowMemory 100m
git config --global pack.packSizeLimit 100m

# Shallow clone
git clone --depth=1 <url>

# Partial clone
git clone --filter=blob:none <url>
```

## Performance: SSH connection sharing

```
# ~/.ssh/config
Host github.com
  ControlMaster auto
  ControlPath ~/.ssh/controlmasters/%r@%h:%p
  ControlPersist 10m
```

Reusa la conexión SSH, no autentica en cada push.

## Checklist operaciones avanzadas

- [ ] `git bisect` para encontrar bugs históricos
- [ ] `git cherry-pick` para portar fixes
- [ ] Interactive rebase para limpiar antes de PR
- [ ] `git stash` para context switches
- [ ] `git worktree` para múltiples branches simultáneas
- [ ] Aliases comunes configurados
- [ ] Conocer `git reflog` para recovery
- [ ] Saber diferencia entre reset, revert, restore
