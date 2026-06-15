# Endpoint Hardening

Endurecer endpoints (workstations, servidores) contra compromiso. EDR, anti-malware, configuración segura.

**MITRE ATT&CK**: Initial Access (TA0001), Persistence (TA0003), Privilege Escalation (TA0004), Defense Evasion (TA0005).

## Principio: reducir superficie + detectar + responder

1. **Reducir superficie**: menos software, menos servicios, menos puertos
2. **Configurar seguro**: CIS Benchmarks
3. **Detectar y responder**: EDR
4. **Mantener**: patching

## EDR / XDR

Endpoint Detection and Response: detecta comportamiento malicioso (no solo firmas), permite investigar y responder.

### EDR vs Antivirus tradicional

| | Antivirus | EDR |
|---|---|---|
| Detección | Firmas de malware conocido | Comportamiento + firmas + ML |
| Visibilidad | Limitada | Telemetría completa del endpoint |
| Respuesta | Cuarentena | Aislamiento, kill process, rollback, forense |
| Zero-days | Débil | Fuerte (comportamental) |

### Capacidades clave que debe tener

- **Detección comportamental** (no solo firmas)
- **Aislamiento de host** (cortar de la red remotamente)
- **Process termination** remoto
- **Forensics**: timeline de actividad
- **Threat hunting**: búsqueda en telemetría
- **Rollback** (algunos): revertir cambios de ransomware
- **Mapeo a MITRE ATT&CK**

### Opciones

- **Comerciales**: CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne, Palo Alto Cortex XDR
- **Open source**: Wazuh (HIDS + EDR-like), OSSEC, Velociraptor (DFIR + hunting), osquery (telemetría)

### Wazuh (open source, completo)

```bash
# Wazuh: SIEM + HIDS + detección. Agente en endpoints, manager central
# Agente reporta: file integrity, logs, rootkit detection, vulnerabilities

# Instalar manager (servidor central)
curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh
sudo bash ./wazuh-install.sh -a

# Agente en endpoint (apunta al manager)
# Detecta: cambios en archivos críticos, malware, anomalías
```

### osquery (telemetría con SQL)

Consultar el endpoint como una base de datos:

```sql
-- Procesos sin firma corriendo desde directorios temporales
SELECT name, path, pid FROM processes
WHERE path LIKE '/tmp/%' OR path LIKE '/dev/shm/%';

-- Conexiones de red establecidas
SELECT DISTINCT process.name, socket.remote_address, socket.remote_port
FROM process_open_sockets socket
JOIN processes process USING (pid)
WHERE socket.remote_address NOT LIKE '10.%';

-- Usuarios con shell de login
SELECT username, shell FROM users WHERE shell NOT LIKE '%nologin%';

-- Crontabs (persistencia)
SELECT * FROM crontab;
```

Fleet/Kolide para gestionar osquery en flotas.

## Hardening Linux

### Base: CIS Benchmark

Ver `frameworks.md` para OpenSCAP/Lynis. Aquí lo esencial manual.

### Reducir superficie

```bash
# Listar servicios activos
systemctl list-units --type=service --state=running

# Deshabilitar lo innecesario
sudo systemctl disable --now avahi-daemon cups bluetooth

# Listar paquetes instalados, remover lo no usado
# (revisar con cuidado)

# Listar puertos abiertos
sudo ss -tulpn

# Cerrar lo que no se usa (deshabilitar servicio que lo abre)
```

### Kernel hardening (sysctl)

```bash
# /etc/sysctl.d/99-hardening.conf

# Network
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv6.conf.all.accept_redirects = 0

# Kernel
kernel.randomize_va_space = 2       # ASLR
kernel.kptr_restrict = 2            # ocultar punteros del kernel
kernel.dmesg_restrict = 1           # restringir dmesg
kernel.yama.ptrace_scope = 1        # restringir ptrace (anti-debugging malicioso)
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0                # no core dumps de setuid

# Aplicar
sudo sysctl --system
```

### SSH hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no          # solo keys
PubkeyAuthentication yes
PermitEmptyPasswords no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no              # si no se necesita
Protocol 2
# Limitar usuarios/grupos
AllowGroups ssh-users
# Algoritmos modernos solamente
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Reload
sudo systemctl reload sshd
```

Adicional:
- **MFA en SSH**: con `pam_google_authenticator` o hardware tokens
- **fail2ban**: bloquear IPs con intentos fallidos
- **Bastion host**: no exponer SSH directo a internet

```bash
# fail2ban
sudo apt install fail2ban
# /etc/fail2ban/jail.local
[sshd]
enabled = true
maxretry = 3
bantime = 3600
findtime = 600
```

### Auditoría (auditd)

```bash
sudo apt install auditd

# /etc/audit/rules.d/hardening.rules
# Monitorear cambios a archivos críticos
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/sudoers -p wa -k sudoers_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config

# Monitorear ejecución de comandos privilegiados
-a always,exit -F arch=b64 -S execve -F euid=0 -k root_commands

# Monitorear carga de módulos del kernel
-w /sbin/insmod -p x -k module_insertion
-a always,exit -F arch=b64 -S init_module -S finit_module -k module_load

sudo augenrules --load
sudo systemctl restart auditd
```

### Filesystem

```bash
# Particiones separadas con opciones de montaje seguras (/etc/fstab)
/tmp      tmpfs  defaults,noexec,nosuid,nodev  0 0
/var/tmp  tmpfs  defaults,noexec,nosuid,nodev  0 0
/dev/shm  tmpfs  defaults,noexec,nosuid,nodev  0 0
# /home, /var con nosuid,nodev donde aplique
```

### Disk encryption

```bash
# LUKS para discos/particiones
sudo cryptsetup luksFormat /dev/sdb
sudo cryptsetup open /dev/sdb cryptdata
```

### AIDE (file integrity monitoring)

```bash
sudo apt install aide
sudo aideinit
# Baseline en /var/lib/aide/aide.db

# Chequeo periódico (cron)
sudo aide --check
```

Detecta modificaciones no autorizadas a archivos del sistema.

## Hardening Windows

### Base: CIS Benchmark + Security Baselines

Microsoft Security Compliance Toolkit aplica baselines vía GPO.

### Esenciales

```powershell
# Defender en modo activo y actualizado
Set-MpPreference -DisableRealtimeMonitoring $false
Update-MpSignature

# Cloud-delivered protection
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# Tamper protection (proteger Defender de ser deshabilitado)
# Via Intune o Security Center

# PUA protection (Potentially Unwanted Applications)
Set-MpPreference -PUAProtection Enabled

# Controlled Folder Access (anti-ransomware)
Set-MpPreference -EnableControlledFolderAccess Enabled
```

### Credential protection

```powershell
# Credential Guard (protege credenciales con virtualización)
# Habilitar vía GPO o:
# Device Guard and Credential Guard hardware readiness tool

# LSA Protection (RunAsPPL) — protege LSASS de dumping
# Registry: HKLM\SYSTEM\CurrentControlSet\Control\Lsa
# RunAsPPL = 1
```

LSASS dumping (T1003.001) es técnica muy común para robar credenciales. LSA Protection y Credential Guard lo dificultan.

### Deshabilitar protocolos legacy inseguros

```powershell
# Deshabilitar SMBv1 (vector de WannaCry, etc.)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Deshabilitar LLMNR y NetBIOS (poisoning attacks)
# Via GPO: Turn off multicast name resolution

# TLS: deshabilitar versiones viejas (1.0, 1.1)
```

### ASR rules

Ver `execution-control.md` para Attack Surface Reduction rules.

### Windows Firewall

```powershell
# Habilitar en todos los perfiles
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Default deny inbound
Set-NetFirewallProfile -DefaultInboundAction Block -DefaultOutboundAction Allow

# Para servidores críticos: también controlar outbound
```

### Logging

```powershell
# Sysmon (telemetría detallada — esencial para detección)
# Descargar de Sysinternals, config de SwiftOnSecurity o Olaf Hartong
sysmon -accepteula -i sysmonconfig.xml

# Sysmon registra: process creation, network connections,
# file creation, registry changes, etc. con detalle forense
```

Sysmon + un buen config es una de las mejores fuentes de telemetría para detección en Windows.

## Hardening macOS

```bash
# FileVault (disk encryption)
sudo fdesetup enable

# Firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on

# Gatekeeper
sudo spctl --master-enable

# SIP (verificar habilitado)
csrutil status

# Deshabilitar servicios innecesarios
# Limitar sharing (Screen, File, Remote Login)
```

Para fleets: MDM (Jamf, Kandji, Mosyle) con baselines de seguridad.

## Patch Management

Vulnerabilidades sin parchear son vector #1 de compromiso.

### Estrategia

- **Inventario** de software y versiones
- **Vulnerability scanning** regular (Nessus, OpenVAS, Qualys)
- **Priorización** por CVSS + exploitability (CISA KEV catalog = explotadas activamente)
- **SLA de parcheo**: críticas en días, no meses
- **Testing** antes de desplegar (staging)
- **Automatización** donde sea seguro

```bash
# Linux: actualizaciones automáticas de seguridad
# Debian/Ubuntu
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# RHEL
sudo dnf install dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

```bash
# Escanear vulnerabilidades
# OpenVAS / Greenbone
# Trivy para contenedores y filesystems
trivy fs /
trivy image myapp:1.0
```

### CISA KEV (Known Exploited Vulnerabilities)

Priorizar parcheo de CVEs en el catálogo KEV de CISA — son las que se explotan activamente en el mundo real.

## Least privilege en endpoints

- **Sin admin local** para usuarios estándar
- **LAPS** (Local Administrator Password Solution) para passwords de admin local únicos por máquina (Windows)
- **sudo** restringido y auditado (Linux)
- **Just-in-time admin** donde sea posible

```bash
# Linux: sudo granular (no ALL=ALL)
# /etc/sudoers.d/restricted
%webadmins ALL=(www-data) NOPASSWD: /usr/bin/systemctl restart nginx
# Solo pueden reiniciar nginx, nada más
```

## USB y dispositivos

Ver `data-exfiltration-prevention.md` para USB control (también vector de entrada de malware).

## Checklist endpoint hardening

### Universal
- [ ] EDR/XDR desplegado y activo
- [ ] Disk encryption (LUKS/BitLocker/FileVault)
- [ ] Host firewall habilitado
- [ ] Patch management con SLA
- [ ] Vulnerability scanning periódico
- [ ] Sin admin local para usuarios
- [ ] Logging detallado (auditd/Sysmon)
- [ ] File integrity monitoring (AIDE/equivalente)
- [ ] Superficie reducida (servicios/puertos mínimos)

### Linux
- [ ] CIS Benchmark aplicado (OpenSCAP/Lynis verde)
- [ ] SSH hardened (no root, no password, MFA)
- [ ] fail2ban activo
- [ ] sysctl hardening
- [ ] auditd con reglas
- [ ] SELinux/AppArmor enforcing
- [ ] /tmp noexec
- [ ] unattended-upgrades de seguridad

### Windows
- [ ] CIS Benchmark / Security Baseline
- [ ] Defender activo + tamper protection
- [ ] Credential Guard + LSA Protection
- [ ] SMBv1 deshabilitado
- [ ] LLMNR/NetBIOS deshabilitados
- [ ] ASR rules habilitadas
- [ ] Controlled Folder Access
- [ ] Sysmon con buen config
- [ ] LAPS para admin local

### macOS
- [ ] FileVault enabled
- [ ] Firewall + stealth mode
- [ ] Gatekeeper + SIP enabled
- [ ] MDM con baseline (fleets)
