# Incident Response

Qué hacer cuando hay (o se sospecha) un incidente de seguridad.

## Fases (NIST SP 800-61)

```
1. Preparation → 2. Detection → 3. Containment → 4. Eradication → 5. Recovery → 6. Lessons Learned
```

## Fase 1: Preparación (antes del incidente)

### Plan de respuesta documentado

Documento accesible (no solo en el sistema afectado) con:

- **Definición de incidente** (qué cuenta como incidente, severidades)
- **Equipo de respuesta**: roles y suplentes
- **Canales de comunicación**: Slack interno, fuera de banda (Signal, llamada) por si el principal está comprometido
- **Runbooks** para escenarios comunes
- **Contactos externos**: proveedores cloud, legal, forense, regulators
- **Tiempos de respuesta** según severidad

### Roles (RACI)

| Rol | Responsabilidades |
|---|---|
| **Incident Commander (IC)** | Coordina la respuesta, toma decisiones, no opera técnicamente |
| **Tech Lead** | Investigación técnica, contención |
| **Communications Lead** | Updates internos y externos, status page |
| **Legal/Compliance** | Notificaciones regulatorias, liaison con autoridades |
| **Scribe** | Documenta timeline en tiempo real |

En equipos chicos, una persona puede tener múltiples roles, pero **separar IC de Tech Lead** ayuda.

### Severidades

| Sev | Definición | Ejemplo | SLA respuesta |
|---|---|---|---|
| **SEV-1** | Crítico, impacto severo | Breach activo, RCE en producción, DB exfiltrada | 15 min |
| **SEV-2** | Alto, impacto significativo | Auth bypass identificado, sospecha de compromise | 1 hora |
| **SEV-3** | Medio, impacto limitado | Vuln descubierta sin evidencia de explotación | 1 día hábil |
| **SEV-4** | Bajo, sin impacto inmediato | Vuln en componente no crítico | 1 semana |

### Herramientas listas

- **Comunicación**: Slack channel dedicado + bridge fuera de banda
- **Documentación**: doc compartido (Google Doc, Notion) para timeline
- **Acceso**: cuentas break-glass para emergencias (auditadas)
- **Forense**: snapshots, dumps de memoria, herramientas pre-instaladas
- **Status page**: pre-configurada (Statuspage, BetterUptime)

### Drills periódicos

- Tabletop exercises cada 6 meses (discutir escenarios hipotéticos)
- Game days: simulación real con uno o más escenarios
- Cada drill genera mejoras al plan

## Fase 2: Detection y triage

### Señales típicas de un incidente

- Alertas del SIEM (failed logins masivos, refresh token reuse, etc.)
- Reportes externos (usuarios, researchers, threat intel)
- Anomalías en métricas (5xx spike, traffic raro)
- Detección de WAF / EDR
- Servicio caído sin causa obvia
- Aviso de CERT / autoridad

### Triage inicial

Cuando llega una alerta:

1. **¿Es real?** — verificar (no perder tiempo en false positives)
2. **¿Qué severidad?** — asignar según matriz
3. **¿Qué está afectado?** — alcance inicial
4. **¿Necesitamos activar IR formal?** — si sev-1/2, sí

Si activamos IR:
- Crear channel `#incident-YYYYMMDD-N`
- Asignar IC
- Iniciar documento de timeline
- Notificar stakeholders según matriz

## Fase 3: Containment

**Objetivo**: detener el daño en curso, preservar evidencia.

### Containment a corto plazo (minutos)

Acciones rápidas para detener el ataque sin destruir evidencia:

- **Aislar sistemas afectados** (cortar tráfico, no apagar — perderías RAM)
- **Revocar credenciales** sospechadas (tokens, API keys, sesiones)
- **Bloquear IPs atacantes** en WAF
- **Deshabilitar cuentas** comprometidas
- **Snapshot de discos** y dump de memoria para forense
- **Activar maintenance mode** si es necesario

⚠️ **No apagar el servidor antes de hacer dump de memoria** — la RAM tiene evidencia clave.

### Containment a mediano plazo

- Aplicar parches temporales
- Configurar reglas WAF custom para bloquear el patrón de ataque
- Rotar secrets que pudieron estar expuestos
- Aislar segmentos de red si hay lateral movement

### Qué preservar (evidencia)

- Logs (snapshot, no rotación)
- Memoria (dump completo)
- Discos (forensic image, write-blocked)
- Configuraciones
- Lista de procesos en el momento
- Conexiones de red activas
- Bash history, comandos recientes

Usar **chain of custody** si puede ir a procedimiento legal.

## Fase 4: Eradication

**Objetivo**: eliminar al atacante del entorno.

### Pasos típicos

1. **Identificar IOCs** (Indicators of Compromise): IPs, hashes de malware, accounts, archivos
2. **Buscar IOCs en todo el ambiente** (otros sistemas pueden estar comprometidos)
3. **Rotar TODOS los secrets** que pudieron tocarse (no solo los obvios)
4. **Aplicar fixes** definitivos a las vulnerabilidades explotadas
5. **Rebuild** de sistemas comprometidos desde imágenes confiables (no "limpiar" — reinstalar)
6. **Auditoría de accesos**: revocar/recrear cuentas que pudieron ser comprometidas

### Lista de cosas a rotar después de un breach

Asumir lo peor — rotar todo lo que pudo estar accesible:

- [ ] JWT signing keys
- [ ] Session encryption keys
- [ ] API keys de terceros (Stripe, Twilio, etc.)
- [ ] DB passwords
- [ ] OAuth client secrets
- [ ] AWS/GCP credentials, IAM roles
- [ ] SSH keys
- [ ] TLS certificates (si la private key pudo exfiltrarse)
- [ ] Encryption keys de datos (re-encriptar todo)
- [ ] Service account credentials
- [ ] Webhooks signing secrets
- [ ] Tokens de empleados (forzar re-login con MFA)
- [ ] Tokens de usuarios afectados (forzar re-login)

## Fase 5: Recovery

**Objetivo**: volver a operación normal de forma segura.

### Validación antes de restaurar

- [ ] Vulnerabilidades parchadas
- [ ] Secrets rotados
- [ ] Sistemas afectados reconstruidos
- [ ] Detección mejorada (alertas para detectar reincidencia)
- [ ] Tests de penetración del fix
- [ ] Approval del IC

### Restauración gradual

- Volver a servicio en stages (canary, percentage rollout)
- Monitorear de cerca durante 48-72h
- Mantener IR team alerta

### Comunicación de cierre

- Interno: cierre del incident channel, retrospectiva agendada
- Externo: update final en status page, comunicación a clientes afectados según compliance

## Fase 6: Lessons learned

**Objetivo**: mejorar para que no vuelva a pasar.

### Postmortem (blameless)

Documento con:

- **Timeline detallado** (acciones, horas)
- **Root cause analysis** (5 whys, fishbone)
- **Impacto**: usuarios afectados, datos comprometidos, downtime, $ perdidos
- **Lo que funcionó bien**
- **Lo que falló**
- **Action items** con dueños y deadlines

**Blameless**: enfocado en sistemas y procesos, no en personas. La presión de culpar oculta información valiosa.

### Action items típicos

- Mejorar detección (nueva alerta, regla SIEM)
- Cerrar la vulnerabilidad y similares en todo el código
- Mejorar runbook
- Training del equipo
- Cambios de arquitectura
- Update de threat model

## Comunicaciones

### Internamente

- Updates frecuentes en el channel del incidente (cada 30 min en SEV-1)
- Stakeholders notificados según matriz
- Status page interna actualizada

### Externamente

#### A los usuarios

Si hubo impacto (data leak, downtime), comunicar:
- **Qué pasó** (en términos claros, no jerga técnica)
- **A quién afecta**
- **Qué información estuvo expuesta**
- **Qué hicimos para resolverlo**
- **Qué deben hacer los usuarios** (cambiar password, monitorear cuentas, etc.)
- **Cómo contactarnos** para preguntas

Honestidad > minimizar. Las empresas que ocultan o minimizan pierden más reputación que las que comunican abiertamente.

#### A reguladores

Según compliance:

| Normativa | Cuándo notificar | A quién | Plazo |
|---|---|---|---|
| GDPR | Breach con riesgo a personas | DPA local (en Colombia: SIC) | 72 horas |
| LGPD | Breach significativo | ANPD | "Plazo razonable" |
| HIPAA | Breach de PHI > 500 personas | HHS, medios | 60 días |
| HIPAA | Breach individual | Affected individual | 60 días |
| PCI-DSS | Compromise de card data | Card brands, acquirer | Inmediato |
| SEC (US listed) | Material incidents | SEC Form 8-K | 4 business days |
| Estado / país-específico | Varía | Varía | Varía |

#### A las autoridades

- En casos graves: policía cibernética / FBI / equivalente local
- CERT nacional (en Colombia: ColCERT)
- ISP si hay DDoS originado en su red

### Lo que NO hacer en comunicaciones

- ❌ Decir "estamos seguros" o "nada se filtró" sin investigar completamente
- ❌ Culpar a un empleado individual
- ❌ Minimizar el impacto antes de saberlo
- ❌ Pagar ransomware sin consultar legal (en algunos países es ilegal)
- ❌ Negociar con atacantes (responsability del IR team + legal, no individuos)
- ❌ Borrar evidencia por reputación
- ❌ "No comment" prolongado (peor para reputación)

## Playbooks por escenario

### Playbook 1: Credentials filtradas en GitHub público

1. **Inmediato**: rotar la credential
2. Identificar qué se accedió con esa credential (logs de la API/servicio)
3. Si hubo acceso no autorizado → escalar a IR formal
4. Si no hubo uso → documentar como near-miss
5. Investigar cómo llegó a GitHub (developer, bug en CI)
6. Action items: pre-commit hook, secret scanning en CI

### Playbook 2: Sospecha de cuenta comprometida

1. Revocar sesiones activas del usuario
2. Forzar reset de password
3. Revisar logs de auth y actividad reciente del usuario
4. Notificar al usuario por canal alternativo (no email comprometido)
5. Si hay acceso a datos sensibles confirmado → activar IR formal
6. Cambiar password compromised y habilitar MFA si no estaba

### Playbook 3: Tráfico anómalo / posible DDoS

1. Verificar métricas (5xx rate, latencia, traffic volume)
2. Activar protección DDoS adicional (Cloudflare "Under Attack")
3. Identificar patrón (ASN, geo, user agent) y bloquear
4. Si no es DDoS sino abuse → rate limiting más agresivo
5. Status page si hay impacto al usuario
6. Postmortem para entender por qué los límites no aguantaron

### Playbook 4: Vulnerability disclosure recibida

1. Acknowledgment al reporter en < 24h
2. Triage de severidad
3. Si confirmada: crear ticket, asignar
4. Coordinar disclosure timeline (típico 90 días)
5. Fix + deploy + verificación
6. Notificar al reporter, posible bug bounty
7. Comunicación pública si crítica

### Playbook 5: Detección de SQLi o RCE intentado en logs

1. Verificar si fue exitoso (response status, datos retornados, comandos ejecutados)
2. Si NO exitoso: bloquear IP, mejorar detección, no escalar
3. Si SÍ exitoso: SEV-1 inmediato
4. Aislar servidor, preservar evidencia
5. Identificar alcance (qué datos, qué privilegios)
6. Activar IR completo

### Playbook 6: Ransomware en infraestructura

1. **NO pagar inmediatamente** (consultar legal, FBI/policía local)
2. Aislar máquinas infectadas (cortar red, no apagar)
3. Validar integridad de backups (offline, immutable)
4. Restaurar desde backups limpios en infra paralela
5. Investigar vector de entrada
6. Notificar a regulators según compliance
7. Comunicación interna y externa coordinada con legal

## Métricas de IR

Después de cada incidente medir:

- **MTTD** (Mean Time To Detect): desde que el incidente empezó hasta que se detectó
- **MTTA** (Mean Time To Acknowledge): desde detección hasta que alguien empezó a responder
- **MTTR** (Mean Time To Recover): tiempo total
- **% incidents detectados internamente** vs reportados externamente

Mejorar MTTD es lo más valioso (atacantes promedio están N días/semanas en el ambiente sin ser detectados).

## Checklist post-incidente

- [ ] Servicio restaurado y estable
- [ ] Vulnerabilidad parchada
- [ ] Secrets rotados
- [ ] Sistemas afectados rebuilt
- [ ] Postmortem programado en < 1 semana
- [ ] Action items con dueños y deadlines
- [ ] Comunicación externa completada
- [ ] Notificaciones regulatorias enviadas (si aplica)
- [ ] Lessons learned compartidas con el equipo
- [ ] Threat model actualizado
- [ ] Detección mejorada (nueva alerta agregada)
