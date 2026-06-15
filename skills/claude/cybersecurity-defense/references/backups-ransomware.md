# Backups & Anti-Ransomware

Backups inmutables, estrategia 3-2-1, recuperación, defensa en capas contra ransomware.

**MITRE ATT&CK**: Impact (TA0040), específicamente T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery).

## Principio: los backups son la última línea contra ransomware

Si todo falla y el ransomware cifra todo, **backups inmutables y testeados** te permiten recuperar sin pagar. Pero los atacantes modernos atacan los backups primero — por eso la inmutabilidad es clave.

## Defensa en capas contra ransomware

El ransomware no es un solo punto de fallo. Defender en cada etapa:

```
1. Initial access  → email security, MFA, patching, allowlisting
2. Execution       → application allowlisting (execution-control.md)
3. Privilege esc   → least privilege, sin admin local
4. Lateral movement→ segmentación (network-defense.md)
5. Exfiltration    → egress filtering (double extortion)
6. Encryption      → EDR comportamental, Controlled Folder Access
7. Recovery        → BACKUPS INMUTABLES ← último recurso
```

Cada capa que falle, la siguiente contiene. Backups son el seguro final.

## Estrategia 3-2-1 (y más)

### 3-2-1 clásico

```
3 copias de los datos
2 medios diferentes
1 copia off-site
```

### 3-2-1-1-0 (moderno, anti-ransomware)

```
3 copias
2 medios diferentes
1 off-site
1 offline/inmutable (air-gapped)
0 errores (verificado con testeo de restore)
```

El "1 inmutable" es lo que derrota al ransomware: aunque comprometa todo, no puede alterar esa copia.

## Inmutabilidad (clave anti-ransomware)

Backups que **no se pueden modificar ni borrar** durante un período, ni siquiera por un admin comprometido.

### Object Lock (cloud)

```bash
# AWS S3 Object Lock (WORM - Write Once Read Many)
aws s3api put-object-lock-configuration \
  --bucket backup-bucket \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Days": 30
      }
    }
  }'
```

Modos:
- **COMPLIANCE**: ni el root account puede borrar antes del período. Máxima protección.
- **GOVERNANCE**: usuarios con permisos especiales pueden override (menos estricto).

Para anti-ransomware: **COMPLIANCE mode**. Aunque el atacante comprometa todo, no puede borrar los backups.

### Equivalentes

- **AWS**: S3 Object Lock, Backup Vault Lock
- **Azure**: Immutable Blob Storage, Backup soft delete + immutability
- **GCP**: Bucket Lock (retention policies)
- **On-prem**: appliances con inmutabilidad (Veeam hardened repo, etc.), tape (air-gapped natural)

### Air-gapped

Copia físicamente desconectada de la red:
- Tape rotada off-site
- Disco desconectado tras backup
- Cuenta cloud separada con acceso muy restringido

Un atacante en la red no puede tocar lo que no está conectado.

## Implementación

### Backups cloud (ejemplo AWS)

```bash
# AWS Backup con vault lock (inmutable)
aws backup create-backup-vault \
  --backup-vault-name immutable-vault \
  --backup-vault-tags Purpose=ransomware-protection

# Vault Lock en compliance mode
aws backup put-backup-vault-lock-configuration \
  --backup-vault-name immutable-vault \
  --min-retention-days 30 \
  --max-retention-days 365 \
  --changeable-for-days 3   # tras 3 días, el lock es inmutable
```

### Versioning (capa adicional)

```bash
# S3 versioning: cada cambio guarda versión anterior
# Si ransomware cifra objetos, las versiones previas siguen
aws s3api put-bucket-versioning --bucket data-bucket \
  --versioning-configuration Status=Enabled

# MFA Delete: borrar versiones requiere MFA (anti-ransomware)
aws s3api put-bucket-versioning --bucket data-bucket \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::123:mfa/user 123456"
```

### Bases de datos

Ver `databases` skill para backups de DB. Anti-ransomware:
- Backups automáticos a almacenamiento inmutable
- Cross-region/cross-account
- Point-in-time recovery
- Testear restores

### Separación de cuenta/credenciales

```
Cuenta de producción         Cuenta de backups (separada)
  - datos                      - backups inmutables
  - apps                       - acceso muy restringido
  - credenciales prod          - credenciales separadas
       │                              ▲
       └──── push backups ────────────┘
             (one-way, no delete)
```

Las credenciales de producción NO pueden borrar backups. Aunque se comprometa prod, los backups están a salvo en otra cuenta con otras credenciales.

## Aislar backups del compromiso

Los atacantes buscan y destruyen backups antes de cifrar. Proteger:

- **Credenciales separadas** (no las mismas que prod)
- **Cuenta/proyecto separado**
- **Inmutabilidad** (no se pueden borrar aunque tengan acceso)
- **MFA Delete**
- **Sin montaje directo** (backups no montados como drive accesible — el ransomware cifra drives montados)
- **Network isolation** del repositorio de backups

## Anti-ransomware en endpoints

Ver `endpoint-hardening.md` y `execution-control.md`:

- **EDR** con detección comportamental (detecta cifrado masivo)
- **Controlled Folder Access** (Windows): protege carpetas de cambios no autorizados
- **Application allowlisting** (bloquea el binario de ransomware)
- **Sin admin local** (limita lo que el ransomware puede hacer)
- **Macros bloqueadas** (vector de entrada común)

```powershell
# Windows: Controlled Folder Access (anti-ransomware nativo)
Set-MpPreference -EnableControlledFolderAccess Enabled
# Protege Documentos, Imágenes, etc. de modificación no autorizada
```

## Detección temprana de ransomware

Detectar antes de que cifre todo:

```
Señales (detección — ver detection-monitoring.md):
- Cifrado masivo de archivos en poco tiempo
- Borrado de Volume Shadow Copies (vssadmin delete shadows)
- Borrado de backups
- Modificación masiva de extensiones de archivo
- Procesos accediendo a muchos archivos rápidamente
- Notas de rescate creadas (README.txt en muchas carpetas)
```

```
# Detección clásica: borrado de shadow copies (T1490)
process: vssadmin.exe
args contains: "delete shadows"
→ ALERTA CRÍTICA (ransomware preparándose)

# O wbadmin, bcdedit modificando recovery
```

EDR comportamental detecta el patrón de cifrado masivo y puede detener el proceso + aislar el host automáticamente.

## Proteger mecanismos de recuperación

El ransomware intenta inhibir la recuperación (T1490):

- **Volume Shadow Copies**: proteger de borrado
- **Backups**: inmutables (lo central)
- **System restore**: proteger
- **Recovery partitions**

```
# Detectar/prevenir borrado de shadow copies
- Monitorear vssadmin, wmic shadowcopy delete
- EDR puede bloquear estos comandos
```

## Plan de recuperación testeado

Un backup que nunca se restauró NO es un backup confiable.

### Testeo regular

- **Restore drills** periódicos (mensual/trimestral)
- Verificar integridad de los datos restaurados
- Medir tiempo de recuperación (RTO real vs objetivo)
- Documentar el procedimiento

### Métricas

- **RPO** (Recovery Point Objective): cuántos datos podés perder (frecuencia de backup)
- **RTO** (Recovery Time Objective): cuánto tardás en recuperar

```
Ejemplo:
RPO = 1 hora  → backups cada hora (perdés máx 1h de datos)
RTO = 4 horas → debés poder restaurar en 4h
```

### Runbook de recuperación

Ver `incident-response.md` playbook de ransomware. Documentar:
1. Cómo identificar backups limpios (pre-compromiso)
2. Cómo restaurar cada sistema crítico
3. Orden de recuperación (dependencias)
4. Verificación de integridad
5. Cómo reconectar a producción de forma segura

## Recuperación tras ransomware

```
1. NO PAGAR (recomendación general — no garantiza recuperación, financia crimen)
2. Contener (aislar sistemas — ver incident-response.md)
3. Identificar backups limpios (anteriores al compromiso)
4. Rebuild de sistemas comprometidos (no solo restaurar datos sobre sistema infectado)
5. Restaurar datos desde backups inmutables verificados
6. Verificar integridad
7. Cerrar el entry point (cómo entraron)
8. Monitoreo aumentado (pueden volver)
9. Notificar (legal, autoridades, afectados)
```

⚠️ **No restaurar sobre un sistema comprometido**: el atacante puede seguir ahí. Rebuild + restore de datos.

## Backups: qué respaldar

- Datos de aplicaciones
- Bases de datos
- Configuración (IaC, configs)
- Secretos (en su secret manager, con su propio backup)
- Documentación crítica
- Estado de infraestructura

No olvidar: configuración y estado, no solo datos. Recuperar requiere reconstruir el entorno completo.

## Anti-patterns

- ❌ Backups sin inmutabilidad (ransomware los borra)
- ❌ Backups con las mismas credenciales que producción
- ❌ Backups montados como drive (se cifran con todo)
- ❌ Nunca testear restores
- ❌ Backups solo on-site (incendio/ransomware los alcanza)
- ❌ Sin air-gap ni inmutabilidad
- ❌ Backups sin cifrar (exfiltración del backup)
- ❌ RPO/RTO no definidos ni medidos
- ❌ Confiar solo en snapshots (no son backups reales si están en el mismo sistema)
- ❌ Sin plan de recuperación documentado

## Checklist backups & anti-ransomware

### Backups
- [ ] Estrategia 3-2-1-1-0
- [ ] Al menos una copia inmutable (Object Lock COMPLIANCE)
- [ ] Al menos una copia off-site
- [ ] Idealmente una air-gapped
- [ ] Backups cifrados
- [ ] Credenciales separadas de producción
- [ ] Cuenta/proyecto separado para backups
- [ ] MFA Delete habilitado
- [ ] Backups no montados como drive accesible
- [ ] Versioning habilitado (capa adicional)

### Recuperación
- [ ] RPO y RTO definidos
- [ ] Restore drills periódicos (testeo real)
- [ ] Integridad verificada tras restore
- [ ] Runbook de recuperación documentado
- [ ] Orden de recuperación definido (dependencias)
- [ ] Backups de config/estado, no solo datos

### Anti-ransomware (capas)
- [ ] Email security (vector de entrada)
- [ ] MFA everywhere
- [ ] Patching al día
- [ ] Application allowlisting (execution-control.md)
- [ ] EDR con detección comportamental
- [ ] Controlled Folder Access (Windows)
- [ ] Sin admin local
- [ ] Segmentación de red (limitar propagación)
- [ ] Egress filtering (anti double-extortion)

### Detección
- [ ] Detección de cifrado masivo
- [ ] Detección de borrado de shadow copies
- [ ] Detección de borrado de backups
- [ ] Alertas de modificación masiva de archivos
- [ ] EDR puede aislar host automáticamente
