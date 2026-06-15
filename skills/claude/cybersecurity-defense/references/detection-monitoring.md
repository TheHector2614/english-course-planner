# Detección y Monitoreo

SIEM, logs, Sigma rules, threat hunting, EDR. Detectar lo que pasa las defensas preventivas.

**MITRE ATT&CK**: detección transversal a todas las tácticas. Mapear cada detección a técnicas.

## Principio: no podés defender lo que no ves

Las defensas preventivas fallan eventualmente. La detección encuentra al atacante que ya entró, idealmente antes del daño.

```
Prevención falla → Detección encuentra → Respuesta contiene
                   ↑ acá reducimos "dwell time"
```

**Dwell time**: tiempo entre compromiso y detección. Reducirlo es clave (atacantes pueden estar meses sin ser detectados).

## Pilares de la detección

```
1. Telemetría    → recolectar logs/eventos de todo
2. Centralización → SIEM (un solo lugar)
3. Correlación   → conectar eventos dispersos
4. Detección     → reglas + ML + threat intel
5. Alerting      → notificar lo importante
6. Hunting       → buscar proactivamente
```

## Qué loguear (fuentes de telemetría)

### Endpoints
- **Process creation** (Sysmon Event 1, auditd execve)
- **Network connections** (Sysmon 3)
- **File creation/modification** (Sysmon 11, auditd)
- **Registry changes** (Windows, Sysmon 12-14)
- **PowerShell** (Script Block Logging)
- **Authentication** (logon/logoff, fallos)
- **Privilege use**

### Red
- **Firewall logs** (allow/deny)
- **DNS queries** (Zeek dns.log)
- **HTTP/TLS** (Zeek http.log, ssl.log)
- **Flow data** (NetFlow, conn.log)
- **IDS/IPS alerts** (Suricata)

### Cloud
- **CloudTrail** (AWS API calls)
- **VPC Flow Logs**
- **GuardDuty findings**
- **GCP Audit Logs / Azure Activity Logs**

### Aplicaciones
- **Auth events**
- **Access logs**
- **Error logs**
- **Audit logs** (cambios sensibles)

### Identity
- **IdP logs** (Okta, Entra ID, etc.)
- **MFA events**
- **Privileged access**

## SIEM (Security Information and Event Management)

Centraliza, correlaciona y analiza logs de toda la infraestructura.

### Opciones

| SIEM | Tipo |
|---|---|
| **Wazuh** | Open source (SIEM + XDR) |
| **Elastic Security** | Open source / comercial (ELK + security) |
| **Splunk** | Comercial, potente |
| **Microsoft Sentinel** | Cloud-native (Azure) |
| **Google Chronicle/SecOps** | Cloud-native |
| **Graylog** | Open source log management |
| **OpenSearch + plugins** | Open source |

### Arquitectura típica (open source: ELK/Wazuh)

```
Endpoints/Network/Cloud
  │ (agentes, forwarders)
  ▼
Ingest (Logstash/Beats/Fluentd)
  │
  ▼
Storage + Index (Elasticsearch/OpenSearch)
  │
  ▼
Detección (reglas, ML) + Visualización (Kibana/dashboards)
  │
  ▼
Alerting → SOAR / tickets / Slack
```

### Wazuh (recomendado open source)

```bash
# Wazuh combina: log analysis, FIM, rootkit detection,
# vulnerability detection, y detección con reglas + MITRE ATT&CK mapping

# Manager central + agentes en endpoints
# Dashboard con detecciones mapeadas a ATT&CK

# Reglas custom en /var/ossec/etc/rules/local_rules.xml
```

## Reglas de detección con Sigma

Sigma es un formato genérico de reglas de detección (como Snort para logs). Se convierte a queries de cualquier SIEM.

### Anatomía de una regla Sigma

```yaml
title: Suspicious PowerShell Download Cradle
id: a1b2c3d4-...
status: stable
description: Detecta PowerShell descargando y ejecutando código
references:
  - https://attack.mitre.org/techniques/T1059/001/
tags:
  - attack.execution
  - attack.t1059.001
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|endswith: '\powershell.exe'
    CommandLine|contains:
      - 'DownloadString'
      - 'DownloadFile'
      - 'IEX'
      - 'Invoke-Expression'
      - 'Net.WebClient'
  condition: selection
falsepositives:
  - Scripts de administración legítimos
level: high
```

### Convertir Sigma a tu SIEM

```bash
# sigma-cli convierte a Splunk, Elastic, Sentinel, etc.
pip install sigma-cli
sigma convert -t splunk rule.yml
sigma convert -t elasticsearch rule.yml
```

### Repos de reglas Sigma

- **SigmaHQ/sigma**: miles de reglas comunitarias mapeadas a ATT&CK
- Usar como base, ajustar a tu entorno

## Detecciones esenciales (mapeadas a ATT&CK)

### Execution (T1059)
- PowerShell ofuscado / encoded commands
- Scripts ejecutados desde directorios temporales
- Office spawneando procesos (cmd, powershell)
- wscript/cscript ejecutando scripts

### Credential Access (T1003)
- LSASS access/dumping (Windows)
- Acceso a /etc/shadow (Linux)
- Mimikatz-like behavior
- Kerberoasting patterns

### Persistence (T1543, T1053)
- Nuevos servicios creados
- Scheduled tasks/cron jobs nuevos
- Cambios en registro de autorun
- Nuevas cuentas creadas

### Defense Evasion (T1070)
- Logs borrados/limpiados
- Servicios de seguridad deshabilitados
- Modificación de configuración de auditoría

### Lateral Movement (T1021)
- Logins remotos anómalos (RDP, SSH, WMI, WinRM)
- Una cuenta accediendo a muchos hosts
- Pass-the-hash patterns

### Exfiltration (T1041, T1048)
- Volumen anómalo de datos saliente
- DNS tunneling (ver `data-exfiltration-prevention.md`)
- Uploads a destinos no aprobados
- Beaconing / C2

### Privilege Escalation (T1068, T1548)
- sudo/su anómalo
- Explotación de servicios privilegiados
- UAC bypass attempts (Windows)
- setuid abuse (Linux)

## Reducir falsos positivos

Demasiadas alertas → fatiga → se ignoran (alert fatigue es un problema serio).

Estrategias:
- **Baseline** del comportamiento normal
- **Tuning**: ajustar reglas a tu entorno
- **Allowlisting** de actividad legítima conocida
- **Risk scoring**: priorizar por severidad + contexto
- **Correlación**: alertar solo cuando varios indicadores coinciden
- **Enrichment**: agregar contexto (es admin?, horario?, geo?)

## Alerting y escalación

### Niveles

| Severidad | Ejemplo | Respuesta |
|---|---|---|
| Critical | Ransomware activo, exfiltración masiva | Inmediata, 24/7 |
| High | Posible compromiso, credenciales robadas | < 1 hora |
| Medium | Actividad sospechosa | < 1 día |
| Low | Anomalía menor | Revisión rutinaria |

### Canales

- Critical/High → PagerDuty/Opsgenie + Slack + on-call
- Medium → ticket + Slack
- Low → dashboard, revisión periódica

### SOAR (Security Orchestration, Automation, Response)

Automatizar respuesta a alertas comunes:
- Aislar host automáticamente ante detección de ransomware
- Bloquear IP ante ataque
- Deshabilitar cuenta ante login imposible (viaje imposible)
- Enriquecer alertas automáticamente

Tools: Shuffle (open source), Tines, Splunk SOAR, Microsoft Sentinel playbooks.

## Threat Hunting

Búsqueda proactiva de amenazas que evadieron detección automática.

### Enfoques

1. **Hypothesis-driven**: "¿hay lateral movement vía WMI?"
2. **IOC-based**: buscar indicadores de amenazas conocidas
3. **TTP-based**: buscar técnicas de ATT&CK específicas
4. **Anomaly-based**: buscar lo que se desvía del baseline

### Ejemplo de hunt

```
Hipótesis: un atacante usa PsExec para lateral movement.

Hunt:
1. Buscar creación de servicios con nombres random (PsExec pattern)
2. Buscar PSEXESVC en logs
3. Buscar autenticaciones seguidas de creación de servicio remoto
4. Correlacionar con cuentas que normalmente no hacen esto

Resultado: confirmar benigno o escalar a incidente.
```

### Telemetría para hunting

- Process creation con command lines
- Network connections
- Authentication events
- DNS queries
- File modifications

Zeek + Sysmon + osquery + SIEM = buen stack de hunting.

## Detección en cloud

### AWS

- **GuardDuty**: detección gestionada (anomalías, malware, exfiltración)
- **CloudTrail**: todos los API calls (detectar acciones anómalas)
- **Security Hub**: agregación de findings
- **Detective**: investigación
- **Macie**: datos sensibles

```
# Findings GuardDuty importantes:
# - UnauthorizedAccess:* (acceso no autorizado)
# - CryptoCurrency:* (minería)
# - Trojan:*, Backdoor:* (malware/C2)
# - Exfiltration:* (robo de datos)
# - CredentialAccess:* (robo de credenciales)
```

### Multi-cloud

- CloudTrail (AWS) / Audit Logs (GCP) / Activity Log (Azure) → SIEM
- CSPM para misconfiguraciones (ver `cloud-security.md`)

## Métricas de detección

- **MTTD** (Mean Time To Detect): tiempo a detectar
- **MTTR** (Mean Time To Respond): tiempo a responder
- **Detection coverage**: % de técnicas ATT&CK cubiertas
- **False positive rate**: % de alertas falsas
- **Dwell time**: tiempo de permanencia del atacante

Objetivo: reducir MTTD y dwell time.

## Log retention y protección

- **Retención**: según compliance (típico 90 días hot, 1+ año cold)
- **Inmutabilidad**: logs que el atacante no pueda borrar (write-once, off-host)
- **Centralización**: logs salen del host inmediatamente (atacante no los borra localmente)
- **Integridad**: detección de tampering de logs

```bash
# Forward logs inmediatamente fuera del host
# rsyslog → SIEM remoto
# Si el atacante compromete el host y borra logs locales,
# ya están en el SIEM
```

Anti-pattern: logs solo locales → atacante los borra (T1070.001 Clear Windows Event Logs / T1070.002 Clear Linux Logs).

## Checklist detección y monitoreo

### Telemetría
- [ ] Sysmon (Windows) / auditd (Linux) en endpoints
- [ ] PowerShell Script Block Logging
- [ ] Firewall logs
- [ ] DNS query logs
- [ ] CloudTrail/Audit Logs (cloud)
- [ ] IdP/auth logs
- [ ] Application audit logs

### Centralización
- [ ] SIEM desplegado (Wazuh/Elastic/Splunk/Sentinel)
- [ ] Logs forwarded inmediatamente (no solo locales)
- [ ] Log retention según compliance
- [ ] Logs inmutables/protegidos de tampering

### Detección
- [ ] Reglas mapeadas a MITRE ATT&CK
- [ ] Reglas Sigma desplegadas y ajustadas
- [ ] EDR con detección comportamental
- [ ] IDS/IPS en red
- [ ] GuardDuty/equivalente en cloud
- [ ] Cobertura de técnicas críticas (execution, cred access, exfil, lateral)

### Alerting
- [ ] Severidades definidas
- [ ] Escalación clara (on-call para critical)
- [ ] Falsos positivos ajustados (anti-fatiga)
- [ ] SOAR para respuestas automatizables

### Proactivo
- [ ] Threat hunting periódico
- [ ] Gap analysis de cobertura ATT&CK
- [ ] Métricas (MTTD, dwell time) monitoreadas
- [ ] Threat intel integrado
