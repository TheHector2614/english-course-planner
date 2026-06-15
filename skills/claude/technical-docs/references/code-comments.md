# Comentarios en Código

Cuándo comentar, cuándo no. JSDoc, Javadoc, docstrings.

## Principio fundamental

> "Don't comment bad code—rewrite it." — Brian Kernighan

Comentarios son **complemento**, no sustituto del código claro. Si necesitas explicar QUÉ hace el código, probablemente el código no es claro.

Comentarios deben explicar **por qué**, no **qué**.

## Cuándo SÍ comentar

### 1. El "por qué" no obvio

```python
# ❌ MAL: explica el qué
# Incrementa el contador
counter += 1

# ✅ BIEN: explica el por qué
# Workaround: el ABI de la API externa empieza a contar desde 1, no 0
counter += 1
```

### 2. Decisión técnica con trade-off

```python
# Usamos PBKDF2 en lugar de bcrypt aquí porque el FIPS compliance lo exige.
# Trade-off: PBKDF2 es más débil que argon2, pero está aprobado por NIST.
hashed = pbkdf2_hmac('sha256', password.encode(), salt, 600_000)
```

### 3. Comportamiento sorprendente

```python
# Los IDs de Stripe pueden tener hasta 64 chars, no 32 como nuestros internos.
# No truncar — perderíamos información crítica para reconciliación.
stripe_id_column = Column(String(64))
```

### 4. Workarounds y hacks

```python
# HACK: la lib X tiene un bug en v2.3 que retorna None en lugar de [].
# Esperar fix en v2.4 (ticket: PROJ-1234) y remover este check.
result = api.fetch() or []
```

### 5. TODO / FIXME con contexto

```python
# TODO(@alice, 2026-12): migrar a la nueva API v3 cuando deprecada v2 confirme.
# Tracking: ENG-5678
client = OldApiClient()
```

Buenas TODOs:
- ✅ Tienen owner (@alice)
- ✅ Tienen fecha o issue para tracking
- ✅ Explican qué hay que hacer

Malas:
- ❌ `# TODO: fix this`
- ❌ `# FIXME: hack`

### 6. Restricciones legales/de negocio no obvias

```python
# Por GDPR, los datos de usuarios EU deben anonimizarse después de 30 días
# de cuenta inactiva. Ver política #SEC-001.
if last_active < datetime.now() - timedelta(days=30):
    anonymize(user)
```

### 7. Performance crítica con razón

```python
# Usamos LRU cache aquí porque este lookup se llama 100k+ veces/segundo
# durante validación de tokens. Sin cache, RDS se satura.
@lru_cache(maxsize=10_000)
def lookup_user(user_id: str) -> User: ...
```

## Cuándo NO comentar

### 1. Lo obvio del código

```python
# ❌ MAL
# Incrementa i en 1
i += 1

# ❌ MAL
# Si está vacío, retorna
if not data:
    return
```

### 2. Comentarios "decorativos"

```python
# ❌ MAL
###############################
# DATABASE CONNECTION SECTION #
###############################
```

Usar headings de markdown en docs, o agrupar con espacios en blanco.

### 3. Versionado / historial

```python
# ❌ MAL — usar Git, no comentarios
# 2026-01-15: Alice added validation
# 2026-02-20: Bob fixed null check
```

`git blame` ya lo hace.

### 4. Comentarios desactualizados peores que ninguno

```python
# ❌ MAL: comentario miente
# Retorna lista de IDs de usuarios activos
def get_users():
    return [u for u in users]  # ya no filtra "activos"
```

Si cambia el código, el comentario debe actualizarse o eliminarse.

### 5. Código comentado (dead code)

```python
# ❌ MAL — borrar, no comentar
# def old_function():
#     return legacy_behavior()
```

Git tiene historial. Si lo necesitas, está ahí.

### 6. Auto-promoción

```python
# ❌ MAL
# Genius hack by John 😎
```

## Doc comments (JSDoc, Javadoc, docstrings)

Doc comments son distintos: no son para devs leyendo el código, son para **generar documentación**.

### Python: docstrings

```python
def calculate_total(items: list[Item], tax_rate: float = 0.19) -> Decimal:
    """Calculate the total price including tax.

    Args:
        items: List of items to sum.
        tax_rate: Tax rate as decimal (e.g., 0.19 for 19%). Defaults to 0.19.

    Returns:
        Total price as Decimal with 2 decimal places.

    Raises:
        ValueError: If any item has negative price.

    Example:
        >>> calculate_total([Item(price=100)], tax_rate=0.19)
        Decimal('119.00')
    """
    if any(item.price < 0 for item in items):
        raise ValueError("Items cannot have negative price")
    subtotal = sum(item.price for item in items)
    return Decimal(subtotal) * Decimal(1 + tax_rate)
```

Estilos populares:
- **Google style** (más legible)
- **NumPy style** (más estructurado, para libraries científicas)
- **Sphinx style** (`:param:`, `:return:`)

Generar docs:
- **Sphinx** + `sphinx.ext.autodoc`
- **MkDocs** + `mkdocstrings`
- **pdoc**

### TypeScript / JavaScript: JSDoc

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - List of items to sum.
 * @param taxRate - Tax rate as decimal. Defaults to 0.19 (19%).
 * @returns Total price including tax.
 * @throws {Error} If any item has negative price.
 *
 * @example
 * ```ts
 * const total = calculateTotal([{ price: 100 }]);
 * // 119
 * ```
 */
export function calculateTotal(items: Item[], taxRate = 0.19): number {
  if (items.some(i => i.price < 0)) {
    throw new Error("Items cannot have negative price");
  }
  const subtotal = items.reduce((acc, i) => acc + i.price, 0);
  return subtotal * (1 + taxRate);
}
```

En TypeScript, los tipos ya están en signatures. JSDoc agrega:
- `@param description` — descripción legible
- `@returns` — qué significa el return
- `@throws` — qué errors lanza
- `@example` — uso
- `@deprecated` — marcar deprecated
- `@see` — links a otros símbolos

Generar docs:
- **TypeDoc**: https://typedoc.org/
- **api-extractor** (Microsoft)

### Java: Javadoc

```java
/**
 * Calculates the total price including tax.
 *
 * @param items list of items to sum
 * @param taxRate tax rate as decimal (e.g., 0.19 for 19%)
 * @return total price as BigDecimal with 2 decimal places
 * @throws IllegalArgumentException if any item has negative price
 * @since 1.2.0
 *
 * <p>Example:
 * <pre>{@code
 * BigDecimal total = calculateTotal(items, new BigDecimal("0.19"));
 * }</pre>
 */
public BigDecimal calculateTotal(List<Item> items, BigDecimal taxRate) {
    if (items.stream().anyMatch(i -> i.getPrice().signum() < 0)) {
        throw new IllegalArgumentException("Items cannot have negative price");
    }
    BigDecimal subtotal = items.stream()
        .map(Item::getPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    return subtotal.multiply(BigDecimal.ONE.add(taxRate));
}
```

Tags Javadoc:
- `@param`, `@return`, `@throws`
- `@since` — versión donde se introdujo
- `@deprecated` — marca obsoleto + razón + alternativa
- `@see` — referencias cruzadas
- `{@link Class#method}` — links inline
- `{@code ...}` — código inline

Generar docs: `javadoc` CLI o herramientas como `mvn javadoc:javadoc`.

### Rust: doc comments

```rust
/// Calculates the total price including tax.
///
/// # Arguments
///
/// * `items` - Slice of items to sum
/// * `tax_rate` - Tax rate as decimal (e.g., 0.19 for 19%)
///
/// # Returns
///
/// Total price including tax.
///
/// # Errors
///
/// Returns `Err` if any item has a negative price.
///
/// # Examples
///
/// ```
/// let items = vec![Item { price: 100.0 }];
/// let total = calculate_total(&items, 0.19).unwrap();
/// assert_eq!(total, 119.0);
/// ```
pub fn calculate_total(items: &[Item], tax_rate: f64) -> Result<f64, Error> {
    if items.iter().any(|i| i.price < 0.0) {
        return Err(Error::NegativePrice);
    }
    let subtotal: f64 = items.iter().map(|i| i.price).sum();
    Ok(subtotal * (1.0 + tax_rate))
}
```

`cargo doc` genera HTML automáticamente. Los ejemplos en `# Examples` son **doctests** ejecutables.

### Go: godoc comments

```go
// CalculateTotal returns the total price including tax.
//
// The taxRate is a decimal (0.19 for 19%). Items must have non-negative prices.
//
// Example:
//
//	items := []Item{{Price: 100}}
//	total, err := CalculateTotal(items, 0.19)
//	// total = 119
func CalculateTotal(items []Item, taxRate float64) (float64, error) {
    for _, item := range items {
        if item.Price < 0 {
            return 0, errors.New("items cannot have negative price")
        }
    }
    var subtotal float64
    for _, item := range items {
        subtotal += item.Price
    }
    return subtotal * (1 + taxRate), nil
}
```

Go enforces simplicidad. Doc comment empieza con el nombre del símbolo.

## Cuándo necesitas doc comment

✅ Documentar SIEMPRE:
- API pública (exported / public)
- Funciones complejas con contrato no obvio
- Errores que se pueden lanzar
- Side effects no obvios
- Cualquier cosa con `@example` útil

❌ NO documentar:
- Getters/setters triviales
- Funciones obviamente nombradas con tipos claros
- Helpers internos triviales

## Comentarios en lenguajes específicos

### SQL

```sql
-- Migración para soportar multi-currency en pricing.
-- La columna `currency` debe ser ISO 4217 (3 chars, e.g., USD, COP, MXN).
-- Default 'USD' por compatibilidad con orders existentes.
ALTER TABLE orders ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'USD';
```

### YAML (Kubernetes, GitHub Actions, etc.)

```yaml
# Health check endpoint. Si responde 200, el pod se considera ready.
# Usar /healthz (no /api/health) para no consumir API rate limits.
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

### Terraform / HCL

```hcl
# Subnets privadas: aquí van apps que NO deben recibir tráfico de internet.
# Necesitan NAT Gateway para hacer requests salientes (e.g., a APIs externas).
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = { Name = "${var.app_name}-private-${count.index + 1}" }
}
```

### Bash / Shell

```bash
#!/usr/bin/env bash
# Script de backup diario. Corre en cron a las 02:00 UTC.
# Si falla, se sube métrica a Datadog con tag stage=backup-failure.
#
# Dependencias: aws cli, pg_dump
# Variables de entorno requeridas: DB_HOST, DB_USER, BACKUP_BUCKET

set -euo pipefail

# ...
```

### CSS

```css
/* Hack: Safari < 15 no respeta gap en flex containers.
   Workaround con margins negativos. Eliminar cuando subamos minimum.
   Ver: https://caniuse.com/flexbox-gap */
.row {
  display: flex;
  gap: 1rem;
}
```

## Lenguaje de los comentarios

### Español vs inglés

Para equipos hispanohablantes:
- **Comentarios y docs**: inglés (consistencia con código, naming, error messages)
- O **comentarios en español**: si el equipo es 100% hispano y nunca expondrá el código

**Lo importante**: consistencia dentro del proyecto. Mezclar idiomas es lo peor.

### Tono

- **Imperativo**: "Calcula el total" (más conciso)
- O **descriptivo**: "Calculates the total" (estándar JSDoc/Javadoc)

Mantener consistencia.

## Anti-patterns

- ❌ Comentarios que repiten el código
- ❌ Comentarios "decorativos" (líneas de #, banners ASCII)
- ❌ Comentarios desactualizados (mienten)
- ❌ Código comentado en lugar de borrar
- ❌ TODOs sin owner ni fecha
- ❌ Historial en comentarios (Git existe)
- ❌ Comentarios condescendientes ("obvio que...", "claramente...")
- ❌ Auto-promoción ("el genial truco de John")
- ❌ Bromas internas que confunden a nuevos
- ❌ Comentarios en idioma diferente al resto del proyecto
- ❌ Sobre-documentar funciones triviales
- ❌ Sub-documentar API pública

## Checklist al revisar comentarios

- [ ] ¿Explica POR QUÉ, no QUÉ?
- [ ] ¿Sigue siendo cierto con el código actual?
- [ ] ¿Aporta info que el código no puede dar?
- [ ] ¿Está en el idioma del proyecto?
- [ ] ¿Si es TODO, tiene owner y fecha?
- [ ] ¿No es ruido decorativo?
- [ ] Para doc comments: ¿genera doc útil?
- [ ] ¿Tiene ejemplos cuando aplica?

## Tools que ayudan

### Linters

- **ESLint** + `valid-jsdoc` (deprecated but functional) o `tsdoc`
- **pylint** / `pydocstyle` para Python
- **golint** para Go

### Doc generators

- **TypeDoc** (TS), **JSDoc** (JS)
- **Sphinx** (Python), **mkdocstrings**, **pdoc**
- **Javadoc** (Java)
- **rustdoc** / `cargo doc`
- **godoc**

### IDE help

VSCode, IntelliJ, etc. muestran doc comments en hover. Mantener buenos doc comments mejora DX (developer experience) inmediatamente.

## Cuándo NO comentar es mejor

A veces, **renombrar la función o variable** es mejor que comentar.

```python
# ❌ MAL
# t es el total final con tax
t = base * 1.19

# ✅ BIEN
total_with_tax = base * 1.19
```

```python
# ❌ MAL
# Verifica si el usuario tiene permisos para editar
if u.r == 'admin' or (u.r == 'editor' and u.dept == d.dept):
    ...

# ✅ BIEN
def can_edit_document(user: User, doc: Document) -> bool:
    if user.role == 'admin':
        return True
    if user.role == 'editor':
        return user.department == doc.department
    return False

if can_edit_document(user, doc):
    ...
```

**Código auto-documentado** > código + comentario.
