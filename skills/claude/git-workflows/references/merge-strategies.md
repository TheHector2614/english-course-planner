# Estrategias de Merge

Merge commit vs squash vs rebase. Cuándo cada uno.

## Las 3 opciones principales

```
main:  A---B---C---------G  (merge commit con D, E, F)
            \           /
feature:     D---E---F-/
```

vs

```
main:  A---B---C---D'  (squash: D+E+F → D')
            \
feature:     D---E---F
```

vs

```
main:  A---B---C---D'---E'---F'  (rebase: replay con nuevos hashes)
                                  (D', E', F' = D, E, F replayed)
```

## Merge commit (no fast-forward)

`git merge --no-ff feature`

### Pros
- Preserva la historia exacta de la feature
- Claro cuándo se mergeó (timestamp del merge)
- Posible revertir un grupo de commits con un solo `revert`

### Cons
- Más "ruido" en `git log`
- Muchos merges = grafo complejo
- Conflictos pueden ser difíciles de bisect

### Cuándo usar
- Branches importantes (releases)
- Cuando preservar contexto de la feature importa
- Cuando los commits individuales son útiles (atómicos, bien escritos)

## Squash and merge

`git merge --squash feature` + commit manual, o el botón "Squash and merge" en GitHub/GitLab.

Convierte todos los commits de la branch en **uno solo** en main.

### Pros
- `git log` super limpio
- Una PR = un commit
- Mensajes WIP se pierden (irrelevantes)
- Más fácil de revertir (un solo commit)

### Cons
- Pierde granularidad de commits individuales
- Atribución se complica con co-authors
- Bisect menos preciso (granularidad menor)

### Cuándo usar
- Default para PRs en webapps
- Cuando commits de la branch eran WIP
- Equipo prefiere historia lineal limpia

### Configurar squash en GitHub

Settings → Branches → Default branch → Pull Requests:
- ✅ Allow squash merging
- ✅ Default to PR title for squash commit message
- ✅ Default to PR title and description for squash merge body

**Importante**: con squash merge, el **PR title** se vuelve el commit message. Si validás PR titles con Conventional Commits, automatizás todo.

## Rebase and merge

`git rebase main` en la feature, luego fast-forward merge.

Aplica los commits de la feature **encima** del tip de main, generando nuevos hashes.

### Pros
- Historia lineal sin merge commits
- Commits individuales preservados
- `git log` parece secuencial

### Cons
- Re-escribe historia (commits originales reemplazados por nuevos)
- Más conflictos a resolver (uno por commit, no uno global)
- Hashes cambian (si alguien tenía referencia, se rompe)
- Requiere disciplina

### Cuándo usar
- Equipo disciplinado
- Commits ya están limpios (Conventional Commits aplicado)
- Querés historia lineal con commits útiles
- Proyectos open source serios (Linux kernel, Rust)

## Fast-forward only

`git merge --ff-only feature`

Solo permite merge si la branch está **delante** de main sin divergencia.

### Pros
- Historia perfectamente lineal
- Sin merge commits
- Trunk-based puro

### Cons
- Requiere rebase manual antes del merge
- Más fricción

### Cuándo usar
- Trunk-based estricto
- Equipos muy disciplinados
- Configuración como branch protection rule

## Decisión rápida

| Contexto | Recomendación |
|---|---|
| SaaS startup, webapps típicas | **Squash and merge** |
| Open source serio con commits cuidados | **Rebase and merge** |
| Software con releases versionados | **Merge commit** |
| Trunk-based con feature flags | **Fast-forward only** |
| Equipo mixed (algunos jr, algunos sr) | **Squash and merge** (menos riesgo) |

## Configurar políticas en cada plataforma

### GitHub

Settings → General → Pull Requests:
- Allow merge commits: ✅/❌
- Allow squash merging: ✅/❌
- Allow rebase merging: ✅/❌
- Always suggest updating PR branches: ✅
- Allow auto-merge: ✅
- Automatically delete head branches: ✅

Recomendación: **solo habilitar 1-2 estrategias** para forzar consistencia.

### GitLab

Settings → Merge requests:
- Merge method: Merge commit / Merge commit with semi-linear history / Fast-forward merge
- Squash commits when merging: Do not allow / Allow / Encourage / Require

### Bitbucket

Repository settings → Merge strategies → habilitar las que querés.

### Azure DevOps

Branch policies → Merge requirements → estrategia permitida.

## Rebase de feature branches

### Manteniendo feature actualizada con main

```bash
# Tu feature branch
git checkout feat/mi-feature

# Opción A: rebase
git fetch origin
git rebase origin/main
# Resolver conflictos si hay
git push --force-with-lease

# Opción B: merge
git fetch origin
git merge origin/main
git push
```

**Rebase**:
- ✅ Historia lineal
- ❌ Re-escribe commits (force-push)

**Merge**:
- ✅ Sin reescribir
- ❌ Genera merge commit dentro de la feature

**Para PRs en revisión activa**: preferir **merge** (no force-push borra el contexto de comments).

**Para PRs propias sin reviews aún**: **rebase** está bien.

### Interactive rebase (limpiar commits)

Antes de mergear, limpiar commits de la feature:

```bash
git rebase -i origin/main
```

Editor abre:
```
pick a1b2c3 feat: add login button
pick d4e5f6 fix typo
pick g7h8i9 fix again
pick j1k2l3 feat: add OAuth callback
pick m4n5o6 wip
pick p7q8r9 fix tests
```

Cambiar a:
```
pick a1b2c3 feat: add login button
fixup d4e5f6 fix typo            # combinar con anterior sin abrir editor
fixup g7h8i9 fix again
pick j1k2l3 feat: add OAuth callback
squash m4n5o6 wip                # combinar con anterior, edit mensaje
fixup p7q8r9 fix tests
```

Comandos comunes:
- `pick` (p): usar el commit como está
- `reword` (r): cambiar el mensaje
- `edit` (e): pausar para editar el commit
- `squash` (s): combinar con anterior, editor abre para combinar mensajes
- `fixup` (f): combinar con anterior, descartar mensaje
- `drop` (d): eliminar el commit

Después:
```bash
git push --force-with-lease  # OK porque es TU branch
```

## Force-push: cuándo es OK

### Siempre OK
- Tu branch propia que nadie más usa
- Después de interactive rebase para limpiar

### A veces OK
- Compartiste la branch para review pero advertís ANTES
- Marcaste claramente que vas a re-escribir

### NUNCA OK
- `main`
- Branches compartidas sin avisar
- Branches en review activo con comments
- Branches protegidas (deberían rechazarlo)

### Usar `--force-with-lease`

Siempre mejor que `--force`:

```bash
git push --force-with-lease  # ✅
```

vs

```bash
git push --force             # ❌ peligroso
```

`--force-with-lease` falla si alguien más pusheó commits que vos no tenés (evita borrar trabajo ajeno por accidente).

## Conflictos durante rebase

```bash
git rebase main
# CONFLICT in file.ts

# Resolver el conflicto editando el archivo
git add file.ts
git rebase --continue

# Si querés cancelar
git rebase --abort
```

Durante rebase, **cada commit se replay individualmente**. Si conflicto en commit 3, se pausa. Resolver, continuar, sigue con commit 4, etc.

Para rebases largos, considerar **mergear feature → main** y limpiar después en lugar de rebase doloroso.

## Squash automático con `--autosquash`

Marcar commits como "fixup" en el momento:

```bash
git commit --fixup=<commit-hash>
git commit --fixup=HEAD~2
```

Después:
```bash
git rebase -i --autosquash main
```

Editor abre con los `fixup!` ya ordenados correctamente. Solo aceptar.

Setup global:
```bash
git config --global rebase.autoSquash true
```

## Merge commits útiles vs ruidosos

### Útil
```
Merge release/v2.0 into main
```

Marca claramente cuándo se hizo release.

### Ruidoso
```
Merge branch 'main' into feat/mi-branch
Merge branch 'main' into feat/mi-branch
Merge branch 'main' into feat/mi-branch
Merge branch 'feat/mi-branch' of github.com:org/repo into feat/mi-branch
```

Cada vez que actualizás tu feature con merge en lugar de rebase, generás esto.

**Solución**: rebase para actualizar feature (no merge), squash al mergear a main.

## Revertir un merge

### Squashed (un commit)

```bash
git revert <merge-commit-hash>
```

Simple.

### Merge commit con multiple commits

```bash
git revert -m 1 <merge-commit-hash>
```

`-m 1`: especifica el "parent mainline" (en general 1 = main, 2 = feature).

### Si revertís y querés re-mergear

Después de `git revert <merge>`, no podés simplemente re-mergear la feature original.

```bash
# Opción A: revert el revert
git revert <revert-commit>

# Opción B: nueva PR con los cambios (más limpio)
```

## Mergear PRs viejas (stale)

Si una PR está abierta hace mucho:

```bash
# Verificar si compila/funciona
git checkout feat/old-branch
git fetch origin
git rebase origin/main   # o merge

# Resolver conflictos
# Re-testear
git push --force-with-lease
```

Si el código viejo no aplica más al codebase actual, mejor cerrar y abrir PR nueva.

## Cherry-pick: traer commit específico

Útil para hotfixes a múltiples branches:

```bash
# Fix en main
git checkout main
git commit -m "fix(security): patch XYZ vuln"

# Aplicar a release/v1.0
git checkout release/v1.0
git cherry-pick <commit-hash>
git push
```

Cherry-pick genera **nuevo commit con nuevo hash** pero contenido idéntico.

### Cherry-pick multiple commits

```bash
git cherry-pick <commit-1> <commit-2> <commit-3>
git cherry-pick <commit-start>..<commit-end>  # rango (exclusive de start)
git cherry-pick <commit-start>^..<commit-end> # rango (inclusive)
```

### Cherry-pick con conflictos

```bash
git cherry-pick <commit>
# CONFLICT
# Resolver, agregar
git cherry-pick --continue

# O abortar
git cherry-pick --abort
```

## Reglas resumidas

### Reglas duras
- ❌ Force push a `main`
- ❌ Force push a branches en review activo
- ✅ Use `--force-with-lease`, no `--force`
- ✅ Rebase TU branch sin compartirla
- ❌ Re-escribir historia compartida sin avisar

### Reglas blandas (recomendaciones)
- Una estrategia consistente por repo
- Squash merge default para webapps
- Rebase para actualizar feature con main
- Interactive rebase para limpiar antes de PR
- Conventional Commits + squash = automation friendly

## Trampas comunes

- ❌ Force push y "perdés" trabajo de otro
- ❌ Squash sin verificar el commit message resultante (queda WIP)
- ❌ Rebase con conflictos en cada commit → noche perdida
- ❌ Cherry-pick olvidando que cambia el hash
- ❌ Merge --ff con divergencia (no permite, no entendés por qué)
- ❌ Diferentes estrategias en el mismo repo → historia incoherente
- ❌ Permitir todas las opciones en GitHub → cada dev hace algo distinto

## Checklist merge strategy

- [ ] Estrategia única elegida por repo (documentar en CONTRIBUTING)
- [ ] Configurar branch protection con esa estrategia
- [ ] Deshabilitar las no permitidas en provider
- [ ] Conventional Commits si squash merge (PR titles)
- [ ] Auto-delete branches después de merge
- [ ] Documentar `--force-with-lease` vs `--force`
- [ ] Hook que prevenga force-push a branches importantes
- [ ] Estrategia para hotfixes (cherry-pick a release branches?)
