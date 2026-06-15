# Control de Ejecución

Prevenir que se ejecute código no autorizado. La defensa central contra scripts maliciosos, malware y ejecución arbitraria.

**MITRE ATT&CK contrarrestado**: Execution (TA0002), específicamente T1059 (Command and Scripting Interpreter), T1204 (User Execution), T1203 (Exploitation for Client Execution).

## Principio: default deny en ejecución

Por default, **nada se ejecuta** salvo lo explícitamente permitido (allowlisting). Lo opuesto a antivirus tradicional (blocklisting), que solo bloquea lo conocido-malo.

| Enfoque | Cómo | Efectividad |
|---|---|---|
| **Blocklisting** (antivirus) | Bloquea malware conocido | Reactivo, falla con malware nuevo |
| **Allowlisting** | Solo permite lo aprobado | Proactivo, bloquea lo desconocido |

Allowlisting es **drásticamente más efectivo** contra amenazas nuevas (zero-days, malware custom, living-off-the-land).

## Linux

### SELinux (Mandatory Access Control)

Controla qué puede hacer cada proceso, más allá de permisos Unix.

```bash
# Verificar estado
sestatus
getenforce

# Modos: Enforcing (bloquea), Permissive (solo loguea), Disabled
sudo setenforce 1                    # enforcing
# Persistente en /etc/selinux/config:
# SELINUX=enforcing

# Ver violaciones (lo que se bloqueó)
sudo ausearch -m AVC -ts recent
sudo sealert -a /var/log/audit/audit.log
```

SELinux confina procesos a dominios. Un proceso web comprometido no puede leer `/etc/shadow` aunque esté como root, si la política lo prohíbe.

**Recomendación**: mantener Enforcing. No deshabilitar "porque da problemas" — ajustar políticas.

```bash
# Generar política custom para una app
sudo ausearch -c 'miapp' --raw | audit2allow -M miapp_policy
sudo semodule -i miapp_policy.pp
```

### AppArmor (alternativa, Ubuntu/Debian default)

Confina programas con perfiles basados en paths.

```bash
# Estado
sudo aa-status

# Perfiles en /etc/apparmor.d/
sudo aa-enforce /etc/apparmor.d/usr.bin.miapp   # enforce
sudo aa-complain /etc/apparmor.d/usr.bin.miapp  # solo loguear

# Generar perfil
sudo aa-genprof /usr/bin/miapp
```

Ejemplo de perfil restrictivo:
```
/usr/bin/miapp {
  # Solo lectura de config
  /etc/miapp/** r,
  # Escritura solo en su directorio de datos
  /var/lib/miapp/** rw,
  # Sin acceso a nada más
  deny /etc/shadow r,
  deny /home/** rw,
  # Sin red salvo lo necesario
  network inet stream,
}
```

### fapolicyd (File Access Policy Daemon - RHEL)

Allowlisting de ejecución a nivel de archivo.

```bash
sudo dnf install fapolicyd
sudo systemctl enable --now fapolicyd

# Por default permite ejecutar binarios de paquetes RPM instalados
# y bloquea ejecutables en /tmp, /home, etc. (directorios escribibles)

# Agregar regla allowlisting
echo "allow perm=execute exe=/usr/bin/python3 : path=/opt/miapp/script.py" \
  | sudo tee -a /etc/fapolicyd/rules.d/50-miapp.rules
sudo fagenrules --load
sudo systemctl restart fapolicyd
```

Bloquea el patrón clásico: descargar script a `/tmp` y ejecutarlo.

### Restringir ejecución en directorios escribibles

Montar `/tmp`, `/var/tmp`, `/dev/shm` con `noexec`:

```bash
# /etc/fstab
tmpfs /tmp tmpfs defaults,noexec,nosuid,nodev 0 0
tmpfs /dev/shm tmpfs defaults,noexec,nosuid,nodev 0 0

# Verificar
mount | grep noexec
```

Esto bloquea ejecutar binarios desde directorios temporales — un vector muy común.

⚠️ Algunas apps legítimas necesitan exec en /tmp (algunos instaladores). Testear.

### Restringir intérpretes y shells

```bash
# Limitar quién puede usar shells
# Usuarios de servicio sin shell:
sudo usermod -s /usr/sbin/nologin appuser

# Auditar uso de intérpretes
# auditd rule:
sudo auditctl -a always,exit -F arch=b64 -S execve -F exe=/usr/bin/python3 -k python_exec
```

### Inmutabilidad con chattr

```bash
# Hacer un binario/config inmutable (ni root puede modificar sin quitar el flag)
sudo chattr +i /usr/local/bin/critical-binary
sudo chattr +i /etc/critical-config.conf

# Verificar
lsattr /usr/local/bin/critical-binary

# Quitar (para updates legítimos)
sudo chattr -i /usr/local/bin/critical-binary
```

### IMA/EVM (Integrity Measurement Architecture)

Verifica integridad de archivos vía firmas. Avanzado pero potente para servidores críticos.

## Windows

### Windows Defender Application Control (WDAC)

El mecanismo de allowlisting más fuerte de Windows. Basado en políticas a nivel de kernel.

```powershell
# Crear política base desde un sistema "golden" limpio
New-CIPolicy -Level Publisher -FilePath .\policy.xml -UserPEs

# Convertir a binario
ConvertFrom-CIPolicy -XmlFilePath .\policy.xml -BinaryFilePath .\policy.bin

# Desplegar (requiere reboot)
# Copiar a C:\Windows\System32\CodeIntegrity\
```

Niveles de regla (de más a menos seguro):
- `Hash`: por hash exacto del archivo
- `Publisher`: por certificado del publisher + nombre
- `FilePublisher`: publisher + versión mínima
- `LeafCertificate`, `PcaCertificate`: por cadena de certificados

**Recomendación**: empezar en modo audit, revisar qué se bloquearía, luego enforce.

### AppLocker (alternativa, más simple)

```powershell
# Generar reglas automáticas basadas en lo instalado
Get-AppLockerFileInformation -Directory "C:\Program Files\" -Recurse -FileType Exe |
  New-AppLockerPolicy -RuleType Publisher -User Everyone -Xml > policy.xml

# Categorías de reglas:
# - Executable (.exe, .com)
# - Windows Installer (.msi, .msp)
# - Script (.ps1, .bat, .cmd, .vbs, .js)
# - Packaged apps
# - DLL
```

Configurar vía GPO: `Computer Configuration → Windows Settings → Security Settings → Application Control Policies → AppLocker`.

Regla clave: bloquear ejecución desde directorios escribibles por el usuario (`%TEMP%`, `Downloads`, `%APPDATA%`).

### PowerShell Constrained Language Mode

Limita PowerShell a operaciones seguras, bloqueando técnicas de ataque comunes.

```powershell
# Verificar modo actual
$ExecutionContext.SessionState.LanguageMode

# Forzar Constrained Language (vía variable de entorno del sistema, GPO, o WDAC)
[Environment]::SetEnvironmentVariable('__PSLockdownPolicy', '4', 'Machine')
```

Constrained Language Mode bloquea:
- Llamadas a APIs .NET arbitrarias
- Add-Type (compilar código)
- COM objects no aprobados
- Muchos vectores de in-memory execution

Combinar con WDAC para que sea efectivo (sin WDAC se puede evadir).

### PowerShell logging (detección)

```powershell
# Script Block Logging — registra todo lo que ejecuta PowerShell
# GPO: Administrative Templates → Windows Components → Windows PowerShell
# "Turn on PowerShell Script Block Logging" → Enabled

# Module Logging y Transcription también
```

Crítico para detectar abuso de PowerShell (técnica T1059.001 muy común).

### Deshabilitar macros de Office (vector #1 de malware)

```
# GPO: User Configuration → Administrative Templates → Microsoft Office → Security Settings
# "Block macros from running in Office files from the Internet" → Enabled
# "VBA Macro Notification Settings" → Disable all with notification
```

Las macros de Office son uno de los vectores de entrada más comunes. Bloquear las de internet por default.

### Attack Surface Reduction (ASR) rules

Microsoft Defender ASR bloquea comportamientos comunes de ataque:

```powershell
# Bloquear ejecución de scripts ofuscados
Set-MpPreference -AttackSurfaceReductionRules_Ids 5BEB7EFE-FD9A-4556-801D-275E5FFC04CC -AttackSurfaceReductionRules_Actions Enabled

# Bloquear que Office cree procesos hijos
Add-MpPreference -AttackSurfaceReductionRules_Ids D4F940AB-401B-4EFC-AADC-AD5F3C50688A -AttackSurfaceReductionRules_Actions Enabled

# Bloquear ejecución de ejecutables desde email
Add-MpPreference -AttackSurfaceReductionRules_Ids BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550 -AttackSurfaceReductionRules_Actions Enabled
```

Lista completa de ASR rules en docs de Microsoft. Aplicar en modo audit primero.

## macOS

### Gatekeeper

```bash
# Verificar estado
spctl --status

# Solo permitir apps firmadas y notarizadas (default moderno)
sudo spctl --master-enable
```

### System Integrity Protection (SIP)

```bash
# Verificar (no deshabilitar salvo razón muy específica)
csrutil status
```

Mantener SIP habilitado. Protege archivos del sistema incluso de root.

### Allowlisting con MDM

Para fleets, usar MDM (Jamf, Kandji, etc.) para:
- Application allowlisting
- Bloqueo de ejecución no firmada
- Configuración de Gatekeeper enforced

## Contenedores

### Read-only filesystem

```yaml
# Docker Compose
services:
  app:
    image: myapp:1.0
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid    # tmp escribible pero no ejecutable
```

```yaml
# Kubernetes
securityContext:
  readOnlyRootFilesystem: true
```

Si el filesystem es read-only, el atacante no puede dropear ni ejecutar binarios nuevos.

### Drop capabilities y no-new-privileges

```yaml
# Kubernetes
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
  runAsNonRoot: true
  runAsUser: 1000
```

### Seccomp (restringir syscalls)

```yaml
# Kubernetes
securityContext:
  seccompProfile:
    type: RuntimeDefault   # bloquea syscalls peligrosas
```

Seccomp limita qué syscalls puede hacer el contenedor, reduciendo lo que un proceso comprometido puede hacer.

### Sin shell en imagen (distroless)

```dockerfile
# Imagen sin shell, sin package manager, sin utilidades
FROM gcr.io/distroless/java17-debian12
COPY --from=builder /app/app.jar /app.jar
ENTRYPOINT ["/app.jar"]
```

Sin shell, el atacante no puede ejecutar comandos arbitrarios aunque comprometa el proceso.

Ver `container-k8s-security.md` para detalle.

## Bloquear vectores de ejecución comunes

| Vector | Defensa |
|---|---|
| Script en /tmp ejecutado | `noexec` en /tmp + fapolicyd |
| Macro de Office | Bloquear macros de internet |
| PowerShell ofuscado | Constrained Language + ASR + logging |
| LOLBins (binarios legítimos abusados) | WDAC/allowlisting + monitoreo |
| Ejecutable de email | ASR rules + filtrado de email |
| DLL sideloading | WDAC con reglas de DLL |
| Living-off-the-land | Allowlisting + EDR comportamental |

## LOLBins (Living-Off-the-Land Binaries)

Atacantes abusan de binarios legítimos del sistema (certutil, regsvr32, mshta, wmic, etc.) para evadir detección.

Defensa:
- **Allowlisting** que también controle CÓMO se usan
- **Monitoreo** de uso anómalo (certutil descargando archivos, etc.)
- **ASR rules** que bloquean patrones específicos
- Referencia: proyecto LOLBAS documenta estos binarios para que los **defensores** los monitoreen

```
# Ejemplo de detección (Sigma-style): certutil usado para descargar
process: certutil.exe
args contains: -urlcache OR -decode
→ ALERT (posible abuso para download/decode de payload)
```

## Implementación gradual (no romper producción)

Allowlisting mal implementado rompe sistemas. Proceso seguro:

1. **Audit mode**: registrar qué se ejecutaría sin bloquear
2. **Análisis**: revisar logs, identificar software legítimo
3. **Construir allowlist** desde sistema limpio conocido
4. **Test** en subset de sistemas
5. **Enforce gradual**: por grupos
6. **Monitoreo** de bloqueos legítimos → ajustar
7. **Mantener**: nuevos deploys actualizan allowlist

## Checklist control de ejecución

### Linux
- [ ] SELinux o AppArmor en Enforcing
- [ ] `/tmp`, `/var/tmp`, `/dev/shm` con `noexec,nosuid,nodev`
- [ ] fapolicyd o equivalente en servidores críticos
- [ ] Usuarios de servicio sin shell (`nologin`)
- [ ] Binarios críticos inmutables (`chattr +i`)
- [ ] auditd registrando execve

### Windows
- [ ] WDAC o AppLocker en enforce
- [ ] Bloqueo de ejecución en directorios escribibles
- [ ] PowerShell Constrained Language Mode
- [ ] PowerShell Script Block Logging
- [ ] Macros de Office de internet bloqueadas
- [ ] ASR rules habilitadas
- [ ] Defender en modo activo

### macOS
- [ ] Gatekeeper enabled
- [ ] SIP enabled
- [ ] Allowlisting vía MDM (fleets)

### Contenedores
- [ ] Read-only root filesystem
- [ ] Non-root user
- [ ] Drop ALL capabilities
- [ ] Seccomp RuntimeDefault
- [ ] allowPrivilegeEscalation: false
- [ ] Imágenes distroless/mínimas (sin shell)

### General
- [ ] Implementación gradual (audit → enforce)
- [ ] Monitoreo de ejecuciones bloqueadas
- [ ] Proceso para actualizar allowlist con nuevos deploys
