# Security Audit

Checklist de auditoría multi-capa con severidades. Cómo evaluar y reportar la postura de seguridad defensiva.

## Cómo usar

Cuando el usuario pida "audita mi seguridad", "evaluá mi postura", "qué me falta para defenderme", aplicar este checklist por capas. Reportar con severidad:

- 🔴 **Crítico**: brecha explotable ya, riesgo inmediato de compromiso o pérdida de datos
- 🟠 **Alto**: falta defensa clave, gap importante
- 🟡 **Medio**: mejora importante pero no urgente
- 🟢 **Bajo**: hardening adicional, nice-to-have

Mapear cada hallazgo a frameworks (CIS, NIST CSF, MITRE ATT&CK) — ver `frameworks.md`.

## 1. Identity & Access (NIST: Protect | CIS Control 5, 6)

### Crítico
- [ ] MFA en todos los accesos privilegiados
- [ ] MFA en cuentas cloud root/admin
- [ ] Sin credenciales hardcodeadas/compartidas en uso
- [ ] Offboarding revoca acceso inmediatamente

### Alto
- [ ] MFA phishing-resistant (FIDO2) para crítico
- [ ] Least privilege (sin permisos excesivos)
- [ ] PAM para cuentas privilegiadas
- [ ] Cuentas de servicio con mínimo privilegio + rotación
- [ ] Sin cuentas huérfanas

### Medio
- [ ] JIT access para privilegiado
- [ ] Conditional access (Zero Trust)
- [ ] Access reviews periódicos
- [ ] Detección de impossible travel / brute force

Referencia: `identity-access.md`

## 2. Control de Ejecución (NIST: Protect | MITRE: Execution)

### Crítico
- [ ] Servidores críticos con application allowlisting
- [ ] `/tmp` con noexec (Linux)
- [ ] Macros de Office de internet bloqueadas (Windows)

### Alto
- [ ] SELinux/AppArmor enforcing (Linux)
- [ ] WDAC/AppLocker (Windows)
- [ ] PowerShell Constrained Language + logging
- [ ] ASR rules habilitadas (Windows)

### Medio
- [ ] fapolicyd o equivalente
- [ ] Usuarios de servicio sin shell
- [ ] Monitoreo de ejecuciones bloqueadas
- [ ] LOLBins monitoreados

Referencia: `execution-control.md`

## 3. Prevención de Exfiltración (NIST: Protect | MITRE: Exfiltration)

### Crítico
- [ ] Datos sensibles cifrados (at-rest e in-transit)
- [ ] Egress filtering (no salida abierta a todo internet)
- [ ] Storage cloud no público (salvo necesidad)

### Alto
- [ ] DLP en canales clave (email, endpoints)
- [ ] DNS solo a resolvers internos
- [ ] Detección de DNS tunneling
- [ ] VPC endpoints (cloud, no salir a internet)
- [ ] USB device control

### Medio
- [ ] Clasificación de datos sensibles
- [ ] Honeytokens desplegados
- [ ] Detección de volumen anómalo saliente
- [ ] CASB (si hay SaaS)
- [ ] Detección de beaconing/C2

Referencia: `data-exfiltration-prevention.md`

## 4. Endpoint Hardening (NIST: Protect | CIS Control 4, 10)

### Crítico
- [ ] EDR/XDR desplegado y activo
- [ ] Disk encryption
- [ ] Patch management con SLA (críticos rápido)
- [ ] Sin admin local para usuarios

### Alto
- [ ] CIS Benchmark aplicado (verificado con OpenSCAP/Lynis)
- [ ] Host firewall habilitado
- [ ] SSH hardened (no root, no password, MFA) (Linux)
- [ ] Credential Guard + LSA Protection (Windows)
- [ ] SMBv1 deshabilitado (Windows)
- [ ] Logging detallado (auditd/Sysmon)

### Medio
- [ ] File integrity monitoring (AIDE)
- [ ] Vulnerability scanning periódico
- [ ] fail2ban (Linux)
- [ ] Superficie reducida (servicios/puertos mínimos)
- [ ] LAPS (Windows)

Referencia: `endpoint-hardening.md`

## 5. Network Defense (NIST: Protect, Detect | CIS Control 12, 13)

### Crítico
- [ ] Firewall default-deny (ingress)
- [ ] Data tier no accesible desde internet
- [ ] Egress filtering (default-deny salida)

### Alto
- [ ] Segmentación de red (zonas)
- [ ] Management network separada
- [ ] IDS/IPS (Suricata/Snort)
- [ ] Security groups restrictivos (cloud)
- [ ] WAF en apps públicas

### Medio
- [ ] Micro-segmentación en workloads críticos
- [ ] ZTNA en vez de VPN amplia
- [ ] Network monitoring (Zeek)
- [ ] Detección de lateral movement
- [ ] Service mesh con mTLS (microservicios)

Referencia: `network-defense.md`

## 6. Detección & Monitoreo (NIST: Detect | CIS Control 8, 13)

### Crítico
- [ ] Logs centralizados (SIEM)
- [ ] Logs forwarded inmediatamente (no solo locales)
- [ ] EDR con detección comportamental

### Alto
- [ ] Reglas mapeadas a MITRE ATT&CK
- [ ] Cobertura de técnicas críticas (execution, cred access, exfil, lateral)
- [ ] GuardDuty/equivalente (cloud)
- [ ] Alertas con escalación (on-call para critical)
- [ ] Logs inmutables/protegidos de tampering

### Medio
- [ ] Reglas Sigma desplegadas y ajustadas
- [ ] Threat hunting periódico
- [ ] Falsos positivos ajustados (anti-fatiga)
- [ ] SOAR para respuestas automatizables
- [ ] Métricas (MTTD, dwell time)

Referencia: `detection-monitoring.md`

## 7. Respuesta a Incidentes (NIST: Respond | CIS Control 17)

### Crítico
- [ ] IR plan documentado
- [ ] Backups inmutables testeados (para recuperar)
- [ ] Capacidad de aislar hosts (EDR)

### Alto
- [ ] IR team con roles definidos
- [ ] Playbooks por tipo de incidente
- [ ] Contactos de emergencia (legal, autoridades, DFIR)
- [ ] Comunicación out-of-band

### Medio
- [ ] Tabletop exercises periódicos
- [ ] Herramientas DFIR disponibles
- [ ] Break-glass access
- [ ] Proceso de preservación de evidencia

Referencia: `incident-response.md`

## 8. Protección de Secretos (NIST: Protect | MITRE: Credential Access)

### Crítico
- [ ] Cero secretos en código/Git
- [ ] Secret manager desplegado (Vault/Secrets Manager)
- [ ] gitleaks en pre-commit y CI

### Alto
- [ ] Secretos inyectados en runtime (no hardcoded)
- [ ] Keys de cifrado en KMS/HSM
- [ ] CI/CD usa OIDC (no keys estáticas)
- [ ] Rotación de secretos
- [ ] Kubernetes Secrets con encryption at rest

### Medio
- [ ] Dynamic secrets (Vault)
- [ ] Audit logs de acceso a secretos
- [ ] Certificados con auto-renovación
- [ ] LSASS/credential protection

Referencia: `secrets-protection.md`

## 9. Supply Chain (NIST: Govern, Identify | CIS Control 15, 16)

### Crítico
- [ ] Lockfiles commiteados (versiones pinned)
- [ ] Vulnerability scanning de dependencias en CI

### Alto
- [ ] Build falla con CVE crítico
- [ ] Dependabot/Renovate para updates
- [ ] SBOM generado por release
- [ ] CI hardened (OIDC, least privilege)

### Medio
- [ ] Artefactos firmados (Cosign)
- [ ] Verificación de firma en deploy
- [ ] SLSA provenance
- [ ] Scoped packages (anti-confusion)
- [ ] Private registry proxy

Referencia: `supply-chain-security.md`

## 10. Contenedores & Kubernetes (si aplica)

### Crítico
- [ ] Contenedores non-root
- [ ] Sin --privileged ni Docker socket montado
- [ ] Imágenes escaneadas (sin críticas)

### Alto
- [ ] Read-only filesystem
- [ ] Drop ALL capabilities
- [ ] Pod Security Standards: restricted (k8s)
- [ ] RBAC least privilege (k8s)
- [ ] Network Policies default-deny (k8s)
- [ ] Secrets con encryption at rest (k8s)

### Medio
- [ ] Imágenes distroless/mínimas
- [ ] Pin por digest
- [ ] Imágenes firmadas + verificación
- [ ] Runtime security (Falco)
- [ ] Admission control (Kyverno/Gatekeeper)
- [ ] kube-bench/Docker Bench passing

Referencia: `container-k8s-security.md`

## 11. Cloud Security (si aplica)

### Crítico
- [ ] Root account: MFA, sin keys
- [ ] Storage público bloqueado (account-wide)
- [ ] CloudTrail/Audit Logs habilitado (multi-region)
- [ ] Encryption at rest por default

### Alto
- [ ] CSPM activo (Prowler/Scout/comercial)
- [ ] Least privilege IAM
- [ ] Workload identity / OIDC (no keys estáticas)
- [ ] GuardDuty/Defender activo
- [ ] Logs en cuenta separada + inmutables
- [ ] IMDSv2 obligatorio (AWS)

### Medio
- [ ] Multi-account/project (blast radius)
- [ ] SCPs/guardrails preventivos
- [ ] Policy as Code en CI (Checkov/tfsec)
- [ ] Detección de exfiltración cloud
- [ ] Macie/data discovery

Referencia: `cloud-security.md`

## 12. Backups & Anti-Ransomware (NIST: Recover | CIS Control 11)

### Crítico
- [ ] Backups con inmutabilidad (Object Lock)
- [ ] Backups off-site
- [ ] Restore testeado (no solo configurado)
- [ ] Credenciales de backup separadas de producción

### Alto
- [ ] Estrategia 3-2-1-1-0
- [ ] Backups cifrados
- [ ] RPO/RTO definidos
- [ ] Runbook de recuperación documentado
- [ ] MFA Delete habilitado
- [ ] Detección de cifrado masivo / borrado de backups

### Medio
- [ ] Air-gapped copy
- [ ] Restore drills periódicos
- [ ] Controlled Folder Access (Windows)
- [ ] Detección de borrado de shadow copies

Referencia: `backups-ransomware.md`

## Reporte de auditoría

### Template

```markdown
# Security Audit: <organización/sistema>

## Resumen ejecutivo

- Alcance: <qué se evaluó>
- Frameworks: NIST CSF, CIS Controls v8, MITRE ATT&CK
- Hallazgos: X críticos, Y altos, Z medios
- Postura general: 🔴/🟠/🟡/🟢
- Top 3 riesgos:
  1. <riesgo más urgente>
  2. ...
  3. ...

## Hallazgos por severidad

### 🔴 Críticos (acción inmediata)

#### C1. Sin MFA en cuentas privilegiadas
**Capa**: Identity & Access
**Framework**: CIS Control 6, NIST PR.AA, MITRE T1078
**Riesgo**: credenciales robadas = compromiso total. Causa #1 de breaches.
**Evidencia**: <qué se encontró>
**Recomendación**: habilitar MFA (FIDO2 ideal) en todos los accesos admin/cloud root.
**Esfuerzo**: medio | **Impacto**: muy alto

#### C2. Backups sin inmutabilidad
**Capa**: Backups & Anti-Ransomware
**Framework**: CIS Control 11, NIST RC.RP, MITRE T1490
**Riesgo**: ransomware puede borrar backups → sin recuperación → pagar o perder todo.
**Recomendación**: Object Lock COMPLIANCE mode, cuenta separada, testear restore.
**Esfuerzo**: medio | **Impacto**: muy alto

### 🟠 Altos

[...]

### 🟡 Medios

[...]

## Cobertura MITRE ATT&CK

<qué tácticas/técnicas están cubiertas vs gaps>

## Plan de remediación priorizado

### Inmediato (esta semana): críticos
1. MFA en privilegiados
2. Backups inmutables
3. Egress filtering básico

### Corto plazo (este mes): altos
1. EDR en endpoints
2. SIEM / centralización de logs
3. Segmentación de red

### Mediano plazo: medios
1. Threat hunting
2. SOAR
3. Hardening adicional

## Quick wins (alto impacto, bajo esfuerzo)

<los fixes más rentables>
```

## Quick wins universales

Los de mayor impacto/esfuerzo (empezar acá):

1. **MFA en todo lo privilegiado** (especialmente cloud root)
2. **Backups inmutables + testeo de restore**
3. **EDR en endpoints**
4. **Centralizar logs** (SIEM básico)
5. **Egress filtering** (controlar salida)
6. **Patch management** de críticos
7. **Quitar admin local**
8. **Disk encryption**
9. **gitleaks** (secrets en repos)
10. **Segmentación** de lo crítico

## Orden de prioridad general

```
1. No perder datos     → backups inmutables testeados
2. No ser comprometido → MFA, patching, least privilege, EDR
3. Detectar si pasa    → logs centralizados, detección
4. Limitar el daño     → segmentación, egress filtering
5. Responder rápido    → IR plan, playbooks
6. Hardening profundo  → allowlisting, micro-segmentación, etc.
```

## Validación

Para validar la postura (no parte de esta skill, pero recomendado):
- **Vulnerability scanning** (Nessus, OpenVAS) — periódico
- **Penetration testing** por terceros — anual (CIS Control 18)
- **Red team exercises** — para orgs maduras
- **Tabletop exercises** — para validar IR
- **CSPM continuo** — para cloud
- **Auditorías de compliance** — según regulación

⚠️ Pentesting/red team se contrata a profesionales con autorización explícita. Esta skill es defensiva — no realiza ataques.

## Checklist de la auditoría misma

- [ ] Todas las capas evaluadas (1-12 según aplique)
- [ ] Hallazgos clasificados por severidad
- [ ] Cada hallazgo mapeado a framework
- [ ] Evidencia documentada
- [ ] Recomendaciones concretas y accionables
- [ ] Esfuerzo e impacto estimados
- [ ] Cobertura MITRE ATT&CK analizada
- [ ] Plan de remediación priorizado
- [ ] Quick wins identificados
