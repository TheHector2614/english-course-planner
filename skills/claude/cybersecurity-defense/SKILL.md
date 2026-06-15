---
name: cybersecurity-defense
description: Skill de seguridad DEFENSIVA integral (blue team), ESTRICTAMENTE defensiva, nunca ofensiva. Cubre control de ejecución (allowlisting, bloqueo de scripts, SELinux/AppArmor, WDAC/AppLocker), prevención de exfiltración (DLP, egress filtering), endpoint hardening (EDR, anti-ransomware), defensa de red (segmentación, Zero Trust, firewall, IDS/IPS), detección (SIEM, threat hunting), respuesta a incidentes, protección de secretos, supply chain (SBOM), y seguridad de contenedores/Kubernetes y cloud (AWS/GCP/Azure). Mapea a CIS Benchmarks, NIST CSF y MITRE ATT&CK. Activa esta skill cuando el usuario mencione ciberseguridad, seguridad defensiva, blue team, hardening, endurecer, prevenir ejecución, allowlisting, bloquear scripts, DLP, exfiltración, EDR, anti-ransomware, IDS/IPS, SIEM, respuesta a incidentes, threat hunting, Zero Trust, CIS Benchmark, MITRE ATT&CK, egress filtering, SBOM, o pida endurecer/proteger/defender sistemas, redes, endpoints, contenedores o cloud contra código malicioso o robo de datos.
---

# Cybersecurity Defense Skill (Blue Team)

Skill de seguridad **estrictamente defensiva**: prevenir, detectar y responder a amenazas.

## ⚠️ Alcance: SOLO defensivo

Esta skill **NUNCA**:
- Crea exploits, malware, scripts de ataque, payloads, o herramientas ofensivas
- Explica cómo atacar, evadir defensas, o robar información
- Asiste en pentesting ofensivo, red teaming activo, o cualquier acción contra sistemas
- Provee técnicas de evasión, persistencia maliciosa, o lateral movement ofensivo

Esta skill **SÍ**:
- Endurece sistemas para que sea difícil ejecutar código no autorizado
- Configura defensas contra exfiltración de datos
- Detecta y responde a intrusiones
- Mapea defensas a frameworks reconocidos (CIS, NIST, MITRE ATT&CK)

Si una solicitud cruza a territorio ofensivo, redirigir hacia la defensa equivalente o declinar.

## Relación con otras skills

| Skill | Cubre | Esta skill complementa |
|---|---|---|
| `web-backend-security` | Código de apps web, OWASP, SQLi/XSS | Defensa a nivel sistema/red/endpoint/cloud |
| `aws-cloud` | Infra AWS general, security-defaults | Defensa multi-cloud, detección, respuesta |
| `git-workflows` | Secrets en repos, signed commits | Protección de secretos en runtime |
| `databases` | Encriptación, queries seguras | Defensa de datos en reposo y en tránsito |

Cuando se solapen, delegar a la skill especializada.

## Principios fundamentales

### 1. Defense in depth (defensa en capas)

Ninguna capa es suficiente sola. Capas independientes:

```
┌─────────────────────────────────────────────┐
│ Identity & Access (Zero Trust, MFA)          │
│ ┌─────────────────────────────────────────┐ │
│ │ Network (segmentación, egress filter)    │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Endpoint (hardening, EDR)            │ │ │
│ │ │ ┌─────────────────────────────────┐ │ │ │
│ │ │ │ Application (control ejecución) │ │ │ │
│ │ │ │ ┌─────────────────────────────┐ │ │ │ │
│ │ │ │ │ Data (encryption, DLP)      │ │ │ │ │
│ │ │ │ └─────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
   + Monitoring/Detection transversal a todo
```

Si una capa falla, las otras contienen el daño.

### 2. Least privilege (mínimo privilegio)

Todo (usuarios, procesos, servicios, contenedores) corre con los **mínimos permisos necesarios**. Default deny, allow explícito.

### 3. Default deny

- Ejecución: nada corre salvo lo permitido explícitamente (allowlisting)
- Red: nada sale/entra salvo lo permitido (egress/ingress filtering)
- Acceso: nadie accede salvo autorización explícita (Zero Trust)

### 4. Assume breach (asumir compromiso)

Diseñar como si el atacante ya estuviera dentro:
- Segmentación para limitar lateral movement
- Detección para encontrar actividad anómala
- Respuesta para contener rápido
- Backups inmutables para recuperar

### 5. Prevención + Detección + Respuesta

Las tres fases del NIST CSF (más Identify y Recover):

```
Identify → Protect → Detect → Respond → Recover
```

No basta prevenir: hay que detectar lo que pasa las defensas y responder.

### 6. Datos: el objetivo final a proteger

La mayoría de ataques buscan datos. Proteger:
- En reposo (encryption at-rest)
- En tránsito (TLS)
- En uso (acceso controlado, DLP)
- Salida (egress filtering, exfiltration detection)

### 7. Reducir superficie de ataque

Menos cosas = menos vulnerabilidades:
- Desinstalar lo innecesario
- Cerrar puertos no usados
- Deshabilitar servicios no requeridos
- Minimal base images (contenedores)

## Mapeo a frameworks

Esta skill mapea cada medida a:

- **CIS Benchmarks**: configuraciones específicas por plataforma
- **NIST CSF 2.0**: Govern, Identify, Protect, Detect, Respond, Recover
- **MITRE ATT&CK**: técnicas de adversarios → contramedidas defensivas (D3FEND)
- **CIS Controls v8**: 18 controles priorizados

Ver `references/frameworks.md`.

## Decisión rápida: ¿qué defensa aplicar?

| Amenaza | Defensa principal | Referencia |
|---|---|---|
| Ejecución de scripts/binarios no autorizados | Application allowlisting | `execution-control.md` |
| Robo/fuga de datos | DLP + egress filtering | `data-exfiltration-prevention.md` |
| Ransomware | Backups inmutables + EDR + segmentación | `backups-ransomware.md` |
| Malware en endpoint | EDR + hardening | `endpoint-hardening.md` |
| Lateral movement | Segmentación + Zero Trust | `network-defense.md` |
| Credenciales robadas | MFA + secrets management + Zero Trust | `secrets-protection.md`, `identity-access.md` |
| Dependencia comprometida | Supply chain security + SBOM | `supply-chain-security.md` |
| Contenedor comprometido | Container/K8s hardening | `container-k8s-security.md` |
| Cuenta cloud comprometida | Cloud security + detección | `cloud-security.md` |
| Intrusión activa | IDS/IPS + SIEM + IR | `detection-monitoring.md`, `incident-response.md` |

## Flujos de trabajo

### Flujo A — "Endurecé este sistema/servidor"

1. **Identificar** SO/plataforma, rol del sistema, datos que maneja
2. **Aplicar CIS Benchmark** apropiado (Linux, Windows, cloud, contenedor)
3. **Reducir superficie**: desinstalar/deshabilitar lo innecesario
4. **Control de ejecución**: allowlisting, SELinux/AppArmor
5. **Network**: firewall egress/ingress, cerrar puertos
6. **Logging**: habilitar auditoría (auditd, sysmon, etc.)
7. **Generar checklist** verificable + script de hardening

### Flujo B — "Prevení que se ejecuten scripts/código no autorizado"

1. Identificar plataforma
2. Configurar **application allowlisting**:
   - Linux: SELinux/AppArmor, fapolicyd, restricciones de exec
   - Windows: WDAC / AppLocker, PowerShell Constrained Language
   - Contenedores: read-only filesystem, seccomp, no shell
3. Bloquear vectores comunes (macros, scripts en directorios escribibles)
4. Monitorear intentos de ejecución bloqueados

Ver `execution-control.md`.

### Flujo C — "Prevení robo/exfiltración de datos"

1. Clasificar datos sensibles
2. **Egress filtering**: solo destinos permitidos salen
3. **DLP**: detectar patrones de datos sensibles saliendo
4. **Encryption** en reposo y tránsito
5. **Monitoreo de canales de exfiltración**: DNS tunneling, uploads anómalos, etc.
6. **Acceso mínimo**: quién puede leer qué

Ver `data-exfiltration-prevention.md`.

### Flujo D — "Configurá detección de intrusiones"

1. **Centralizar logs** (SIEM): qué fuentes, qué formato
2. **Detecciones**: reglas mapeadas a MITRE ATT&CK
3. **EDR** en endpoints
4. **Network monitoring**: IDS/IPS
5. **Alerting**: thresholds, escalación
6. **Threat hunting**: búsquedas proactivas

Ver `detection-monitoring.md`.

### Flujo E — "Diseñá respuesta a incidentes"

1. **Playbooks** por tipo de incidente
2. **Fases NIST**: preparación, detección, contención, erradicación, recuperación, lecciones
3. **Roles y escalación**
4. **Comunicación** (interna, legal, clientes)
5. **Forense**: preservar evidencia (sin acción ofensiva)

Ver `incident-response.md`.

### Flujo F — "Asegurá contenedores/Kubernetes"

1. Imágenes mínimas + scanning
2. Non-root, read-only fs, seccomp, capabilities drop
3. Network policies (default deny)
4. RBAC mínimo
5. Pod Security Standards
6. Secrets management
7. Runtime security (Falco)

Ver `container-k8s-security.md`.

### Flujo G — "Auditá la postura de seguridad"

1. Aplicar checklist multi-capa (ver `security-audit.md`)
2. Mapear gaps a frameworks
3. Priorizar por riesgo (impacto × probabilidad)
4. Plan de remediación con quick wins

### Flujo H — "Protegé contra ransomware"

1. **Backups inmutables** (3-2-1, air-gapped, object lock)
2. **EDR** con detección de comportamiento
3. **Segmentación** para limitar propagación
4. **Allowlisting** para bloquear ejecución
5. **Least privilege** (sin admin local)
6. **MFA** everywhere
7. **Plan de recuperación testeado**

Ver `backups-ransomware.md`.

## Capa 1: Identity & Access

Primera línea de defensa. Si la identidad se compromete, todo lo demás importa menos.

Esenciales:
- **MFA obligatorio** en todo acceso (phishing-resistant: FIDO2/WebAuthn ideal)
- **Least privilege**: roles mínimos, just-in-time access
- **Zero Trust**: nunca confiar, siempre verificar
- **No credenciales compartidas**
- **Rotación de credenciales**
- **Privileged Access Management (PAM)** para cuentas admin
- **Conditional access**: por dispositivo, ubicación, riesgo

Ver `identity-access.md`.

## Capa 2: Network Defense

Limitar movimiento y comunicaciones.

Esenciales:
- **Segmentación**: micro-segmentación, VLANs, security groups
- **Default deny** en firewall (ingress y egress)
- **Egress filtering**: controlar qué sale (clave anti-exfiltración)
- **IDS/IPS**: detectar/bloquear tráfico malicioso
- **DNS security**: filtrado, detección de tunneling
- **Zero Trust Network Access (ZTNA)** en lugar de VPN tradicional
- **TLS everywhere**

Ver `network-defense.md`.

## Capa 3: Endpoint Hardening

Donde corre el código y viven los usuarios.

Esenciales:
- **CIS Benchmark** del SO
- **EDR/XDR**: detección y respuesta
- **Application allowlisting**
- **Disk encryption** (BitLocker, LUKS, FileVault)
- **Patch management**
- **Sin admin local** para usuarios
- **Host firewall**
- **Anti-malware**
- **USB/peripheral control**

Ver `endpoint-hardening.md`.

## Capa 4: Application / Execution Control

Que solo corra lo autorizado.

Esenciales:
- **Allowlisting** (WDAC/AppLocker, fapolicyd, SELinux)
- **Script control** (PowerShell Constrained, bloqueo de macros)
- **Mandatory Access Control** (SELinux, AppArmor)
- **Sandboxing** de aplicaciones de riesgo
- **Code signing** verification

Ver `execution-control.md`.

## Capa 5: Data Protection

El objetivo final.

Esenciales:
- **Encryption at-rest** (disco, DB, archivos)
- **Encryption in-transit** (TLS 1.2+)
- **DLP**: detección de fuga
- **Egress control**: canales de salida
- **Classification**: saber qué es sensible
- **Access control**: mínimo necesario
- **Key management** (KMS, HSM, Vault)

Ver `data-exfiltration-prevention.md`.

## Capa transversal: Detection & Monitoring

Sobre todas las capas.

Esenciales:
- **SIEM**: centralizar y correlacionar logs
- **EDR/XDR**: endpoints
- **NDR**: red
- **Audit logging**: en todos los sistemas
- **Threat detection** mapeada a MITRE ATT&CK
- **Threat hunting** proactivo
- **Alerting y SOAR**

Ver `detection-monitoring.md`.

## Quick wins universales

Las medidas con mayor impacto/esfuerzo:

1. **MFA en todo** (especialmente phishing-resistant)
2. **Backups inmutables + testeo de restore**
3. **Patch management** (parchear lo crítico rápido)
4. **Least privilege** (quitar admin local, roles mínimos)
5. **EDR en endpoints**
6. **Egress filtering** (controlar qué sale)
7. **Centralizar logs** (SIEM básico)
8. **Disk encryption**
9. **Application allowlisting** (al menos en servidores críticos)
10. **Network segmentation** (separar lo crítico)

## Output esperado

Según el flujo:

### Hardening
- Script idempotente de hardening
- Checklist verificable mapeado a CIS
- Antes/después de configuración

### Detección
- Reglas de detección (Sigma, etc.)
- Mapeo a MITRE ATT&CK
- Configuración de SIEM/EDR

### Respuesta a incidentes
- Playbooks por tipo
- Procedimientos de contención
- Plantilla de comunicación

### Auditoría
- Reporte con gaps por severidad
- Mapeo a frameworks
- Plan de remediación priorizado

## Referencias

- `references/frameworks.md` — CIS Benchmarks, NIST CSF, MITRE ATT&CK/D3FEND, CIS Controls
- `references/execution-control.md` — allowlisting, SELinux/AppArmor, WDAC/AppLocker, script control
- `references/data-exfiltration-prevention.md` — DLP, egress filtering, detección de exfiltración
- `references/endpoint-hardening.md` — EDR, hardening Linux/Windows/macOS, anti-malware
- `references/network-defense.md` — segmentación, Zero Trust, firewall, IDS/IPS, DNS security
- `references/detection-monitoring.md` — SIEM, logs, Sigma rules, threat hunting, EDR
- `references/incident-response.md` — playbooks, NIST IR, contención, forense defensivo
- `references/identity-access.md` — MFA, Zero Trust, PAM, least privilege, conditional access
- `references/secrets-protection.md` — Vault, KMS, rotación, runtime protection
- `references/supply-chain-security.md` — SBOM, firma, dependency scanning, SLSA
- `references/container-k8s-security.md` — Docker/K8s hardening, Pod Security, Falco, network policies
- `references/cloud-security.md` — AWS/GCP/Azure defensivo, CSPM, detección cloud
- `references/backups-ransomware.md` — backups inmutables, anti-ransomware, recuperación
- `references/security-audit.md` — checklist de auditoría multi-capa con severidades

## Lo que NUNCA hay que hacer (defensa)

- ❌ Confiar en una sola capa de defensa
- ❌ Dar admin/root por default
- ❌ Permitir ejecución sin restricciones en servidores
- ❌ Dejar egress abierto a todo internet
- ❌ Backups sin inmutabilidad ni testeo de restore
- ❌ Secrets en código, env vars en claro, o logs
- ❌ Sin MFA en accesos privilegiados
- ❌ Sin centralización de logs
- ❌ Sin EDR en endpoints
- ❌ Contenedores como root con filesystem escribible
- ❌ Sin segmentación (red plana)
- ❌ Deshabilitar logging "por performance"
- ❌ Ignorar alertas por fatiga
- ❌ Sin plan de respuesta a incidentes
- ❌ Confiar en perímetro solamente (castle-and-moat obsoleto)
- ❌ Parches críticos sin aplicar por meses
- ❌ Reutilizar credenciales entre sistemas

## Lo que esta skill NUNCA produce (límite ético)

- ❌ Exploits, malware, ransomware, payloads
- ❌ Scripts de ataque o herramientas ofensivas
- ❌ Técnicas de evasión de defensas
- ❌ Guías de cómo robar datos o comprometer sistemas
- ❌ Asistencia para atacar sistemas (propios o ajenos)
- ❌ Reverse shells, C2, keyloggers, stealers

Si se solicita algo ofensivo, redirigir a la defensa equivalente. Por ejemplo, ante "cómo hacer un keylogger" → explicar cómo detectar y prevenir keyloggers.
