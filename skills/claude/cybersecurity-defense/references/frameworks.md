# Frameworks de Seguridad

CIS Benchmarks, NIST CSF, MITRE ATT&CK/D3FEND, CIS Controls. Cómo mapear defensas a marcos reconocidos.

## Por qué usar frameworks

- **Comprehensividad**: no olvidar áreas
- **Priorización**: qué hacer primero
- **Comunicación**: lenguaje común con auditores, management, equipos
- **Compliance**: muchas regulaciones referencian estos marcos
- **Benchmarking**: medir madurez

## NIST Cybersecurity Framework (CSF) 2.0

Framework de alto nivel. Organiza la seguridad en 6 funciones:

```
┌──────────┐
│  GOVERN  │  (nuevo en 2.0) — estrategia, roles, política, supply chain
└────┬─────┘
     │
┌────▼─────┐  ┌─────────┐  ┌────────┐  ┌─────────┐  ┌─────────┐
│ IDENTIFY │→ │ PROTECT │→ │ DETECT │→ │ RESPOND │→ │ RECOVER │
└──────────┘  └─────────┘  └────────┘  └─────────┘  └─────────┘
```

### Las 6 funciones

| Función | Qué | Esta skill |
|---|---|---|
| **Govern** | Estrategia, políticas, roles, riesgo, supply chain | Políticas de seguridad, supply-chain-security |
| **Identify** | Inventario de activos, datos, riesgos | Clasificación, asset management |
| **Protect** | Controles preventivos | execution-control, hardening, identity-access, network-defense |
| **Detect** | Monitoreo y detección | detection-monitoring |
| **Respond** | Respuesta a incidentes | incident-response |
| **Recover** | Recuperación y resiliencia | backups-ransomware |

### Uso práctico

Para cada función, evaluar madurez (Tier 1-4) y definir target. Usar como estructura de auditoría (ver `security-audit.md`).

NIST CSF es **qué** hacer, no **cómo**. Para el cómo → CIS Benchmarks y Controls.

## CIS Controls v8

18 controles priorizados, ordenados por impacto. Más accionable que NIST CSF.

### Implementation Groups (IG)

- **IG1** (básico): toda org debería tener. ~56 safeguards.
- **IG2** (intermedio): orgs con datos sensibles.
- **IG3** (avanzado): orgs con alto riesgo/recursos.

### Los 18 controles

| # | Control | Esta skill |
|---|---|---|
| 1 | Inventory of Enterprise Assets | Identify |
| 2 | Inventory of Software Assets | execution-control (allowlisting) |
| 3 | Data Protection | data-exfiltration-prevention |
| 4 | Secure Configuration | endpoint-hardening, CIS Benchmarks |
| 5 | Account Management | identity-access |
| 6 | Access Control Management | identity-access |
| 7 | Continuous Vulnerability Management | patch management, scanning |
| 8 | Audit Log Management | detection-monitoring |
| 9 | Email and Web Browser Protections | endpoint-hardening, execution-control |
| 10 | Malware Defenses | endpoint-hardening (EDR) |
| 11 | Data Recovery | backups-ransomware |
| 12 | Network Infrastructure Management | network-defense |
| 13 | Network Monitoring and Defense | detection-monitoring, network-defense |
| 14 | Security Awareness Training | (organizacional) |
| 15 | Service Provider Management | supply-chain-security |
| 16 | Application Software Security | web-backend-security (skill aparte) |
| 17 | Incident Response Management | incident-response |
| 18 | Penetration Testing | (validación — contratar terceros) |

### Priorización recomendada (empezar por IG1)

1. Inventario (Controls 1, 2)
2. Secure config + MFA (Controls 4, 5, 6)
3. Backups (Control 11)
4. Malware defense / EDR (Control 10)
5. Logging (Control 8)
6. Patching (Control 7)

## CIS Benchmarks

Configuraciones **específicas y técnicas** por plataforma. El "cómo" concreto.

Disponibles para: Linux (Ubuntu, RHEL, Debian, etc.), Windows, macOS, AWS, GCP, Azure, Kubernetes, Docker, bases de datos, navegadores, y más.

### Niveles

- **Level 1**: configuración base, bajo impacto en funcionalidad
- **Level 2**: hardening profundo (puede afectar funcionalidad, para alta seguridad)

### Aplicar automáticamente

**Linux — herramientas de evaluación**:
```bash
# CIS-CAT (oficial, requiere membresía CIS)
# o alternativas open source:

# OpenSCAP (evaluar contra perfiles)
sudo dnf install openscap-scanner scap-security-guide
sudo oscap xccdf eval \
  --profile xccdf_org.ssgproject.content_profile_cis \
  --results results.xml --report report.html \
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml

# Lynis (auditoría general)
sudo lynis audit system
```

**Aplicar hardening**:
```bash
# Ansible roles que implementan CIS:
# - ansible-lockdown/RHEL9-CIS
# - ansible-lockdown/UBUNTU22-CIS
ansible-playbook -i inventory site.yml
```

**Windows**:
- CIS-CAT
- Microsoft Security Compliance Toolkit
- DSC (Desired State Configuration)

**Cloud (AWS/GCP/Azure)**:
- CSPM tools (ver `cloud-security.md`)
- Prowler (AWS, open source): `prowler aws --compliance cis_2.0_aws`
- Scout Suite

**Kubernetes**:
```bash
# kube-bench (CIS Kubernetes Benchmark)
kube-bench run --targets master,node
```

**Docker**:
```bash
# Docker Bench for Security
docker run --rm -it \
  --net host --pid host --userns host --cap-add audit_control \
  -v /etc:/etc:ro -v /var/lib:/var/lib:ro \
  docker/docker-bench-security
```

## MITRE ATT&CK

Base de conocimiento de tácticas y técnicas de adversarios reales. Para **defensores**: entender cómo atacan para defenderse mejor.

### Estructura

```
Tácticas (el "por qué" — objetivo del adversario)
  └── Técnicas (el "cómo" — método)
        └── Sub-técnicas (variantes específicas)
```

### Las 14 tácticas (Enterprise)

| Táctica | Objetivo del adversario | Defensa principal (esta skill) |
|---|---|---|
| Reconnaissance | Recopilar info | (limitar exposición) |
| Resource Development | Preparar infraestructura | (threat intel) |
| Initial Access | Entrar | endpoint-hardening, email, network |
| **Execution** | Ejecutar código | **execution-control** |
| Persistence | Mantener acceso | endpoint-hardening, detección |
| Privilege Escalation | Más privilegios | least privilege, hardening |
| Defense Evasion | Evadir detección | detección comportamental, EDR |
| Credential Access | Robar credenciales | secrets-protection, identity-access |
| Discovery | Explorar el entorno | detección, segmentación |
| Lateral Movement | Moverse | network-defense (segmentación) |
| **Collection** | Recolectar datos | data-exfiltration-prevention |
| Command and Control | Comunicarse con C2 | network-defense (egress) |
| **Exfiltration** | Sacar datos | **data-exfiltration-prevention** |
| Impact | Daño (ransomware, etc.) | backups-ransomware |

### Uso defensivo

1. **Threat modeling**: ¿qué técnicas usaría un adversario contra nosotros?
2. **Detection coverage**: ¿qué técnicas detectamos? (mapear reglas SIEM a ATT&CK)
3. **Gap analysis**: ¿qué técnicas NO cubrimos?
4. **Priorización**: cubrir técnicas más comunes/impactantes primero

### ATT&CK Navigator

Herramienta para visualizar cobertura defensiva sobre la matriz. Colorear técnicas según:
- Detección que tenemos
- Prevención que tenemos
- Gaps

### Detecciones mapeadas a ATT&CK

Las reglas de detección (Sigma) deben mapear a técnicas ATT&CK:

```yaml
# Ejemplo Sigma rule con mapeo ATT&CK
title: PowerShell Download Cradle
tags:
  - attack.execution
  - attack.t1059.001    # PowerShell
detection:
  selection:
    Image|endswith: '\powershell.exe'
    CommandLine|contains:
      - 'DownloadString'
      - 'Net.WebClient'
  condition: selection
```

## MITRE D3FEND

Complemento defensivo de ATT&CK. Cataloga **contramedidas defensivas** y las mapea a las técnicas ofensivas que contrarrestan.

Categorías D3FEND:
- **Harden**: reducir superficie (application hardening, platform hardening)
- **Detect**: detectar actividad (process analysis, network traffic analysis)
- **Isolate**: aislar (execution isolation, network isolation)
- **Deceive**: engañar (decoy environment, honeytokens)
- **Evict**: expulsar (process termination, credential revocation)

Usar D3FEND para encontrar la defensa específica para cada técnica de ATT&CK que querés contrarrestar.

## Otros frameworks relevantes

### ISO/IEC 27001/27002

Estándar internacional de gestión de seguridad (ISMS). Más orientado a gestión y certificación. 27002 tiene controles específicos.

### SOC 2

Para proveedores de servicios (SaaS). Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy.

### PCI DSS

Obligatorio si manejás tarjetas de crédito. 12 requisitos. Ver `web-backend-security` para detalle de compliance.

### OWASP

Para seguridad de aplicaciones. Ver `web-backend-security` (skill aparte).

### SLSA

Supply chain security. Ver `supply-chain-security.md`.

## Mapeo cruzado (cheat sheet)

| Quiero... | Framework a usar |
|---|---|
| Estructura de alto nivel | NIST CSF |
| Lista priorizada de qué hacer | CIS Controls v8 |
| Configuración técnica específica | CIS Benchmarks |
| Entender amenazas | MITRE ATT&CK |
| Encontrar contramedida específica | MITRE D3FEND |
| Certificación internacional | ISO 27001 |
| Vender SaaS a enterprise | SOC 2 |
| Manejar tarjetas | PCI DSS |
| Seguridad de apps | OWASP (web-backend-security) |
| Supply chain | SLSA |

## Cómo usar frameworks en una evaluación

1. **NIST CSF** como estructura general (6 funciones)
2. **CIS Controls** para priorizar acciones (IG1 → IG2 → IG3)
3. **CIS Benchmarks** para implementar configuración técnica
4. **MITRE ATT&CK** para validar cobertura de detección
5. **D3FEND** para encontrar defensas específicas a gaps

No es necesario "hacer todos". Elegir según contexto, regulación aplicable, y madurez.

## Herramientas de evaluación

| Tool | Qué evalúa | Open source |
|---|---|---|
| **OpenSCAP** | CIS/STIG benchmarks (Linux) | Sí |
| **Lynis** | Hardening general (Unix) | Sí |
| **kube-bench** | CIS Kubernetes | Sí |
| **Docker Bench** | CIS Docker | Sí |
| **Prowler** | CIS AWS + más | Sí |
| **Scout Suite** | Multi-cloud | Sí |
| **CIS-CAT** | CIS Benchmarks oficial | No (membresía) |
| **Nessus/OpenVAS** | Vulnerabilidades | OpenVAS sí |
| **ATT&CK Navigator** | Cobertura de detección | Sí |

## Checklist de uso de frameworks

- [ ] NIST CSF como estructura de programa de seguridad
- [ ] CIS Controls IG apropiado al riesgo de la org
- [ ] CIS Benchmark aplicado a cada plataforma (Linux, Windows, cloud, k8s, docker)
- [ ] Evaluación automatizada periódica (OpenSCAP, Prowler, kube-bench, etc.)
- [ ] Detecciones mapeadas a MITRE ATT&CK
- [ ] Gap analysis de cobertura ATT&CK
- [ ] D3FEND consultado para defensas específicas
- [ ] Compliance frameworks según regulación aplicable
