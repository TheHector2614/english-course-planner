# Respuesta a Incidentes

Playbooks, fases NIST, contención, erradicación, recuperación, forense defensivo.

**Nota**: este documento cubre respuesta **defensiva**. El forense aquí es para entender el incidente y recuperar, no para atacar de vuelta (hack-back es ilegal y peligroso).

## Marco: NIST IR Lifecycle (SP 800-61)

```
┌─────────────────┐
│ 1. Preparation  │ ← antes del incidente (lo más importante)
└────────┬────────┘
         │
┌────────▼─────────────────┐
│ 2. Detection & Analysis  │ ← identificar y entender
└────────┬─────────────────┘
         │
┌────────▼──────────────────────────────┐
│ 3. Containment, Eradication, Recovery  │ ← actuar
└────────┬──────────────────────────────┘
         │
┌────────▼─────────────────┐
│ 4. Post-Incident Activity│ ← lecciones aprendidas
└──────────────────────────┘
         │
         └──────► (feedback a Preparation)
```

## Fase 1: Preparación (antes del incidente)

La fase más importante. Lo que tengas listo determina qué tan bien respondés.

### Tener listo

- **IR plan documentado** y aprobado
- **IR team** definido con roles
- **Playbooks** por tipo de incidente
- **Contactos**: legal, comunicaciones, ejecutivos, externos (forense, IR firm), autoridades
- **Herramientas**: EDR, SIEM, forensics, comunicación out-of-band
- **Acceso de emergencia** (break-glass)
- **Backups inmutables testeados** (ver `backups-ransomware.md`)
- **Runbooks** de sistemas críticos
- **War room** (físico o virtual) predefinido

### Roles del IR team

| Rol | Responsabilidad |
|---|---|
| **Incident Commander** | Coordina, toma decisiones, no hace trabajo técnico |
| **Technical Lead** | Dirige investigación técnica |
| **Communications** | Interno, clientes, prensa |
| **Legal** | Implicaciones legales, notificaciones |
| **Scribe** | Documenta timeline en tiempo real |
| **Liaison** | Con ejecutivos, terceros |

### Comunicación out-of-band

Si el atacante está en la red, no uses los canales comprometidos (email corporativo, Slack interno). Tener:
- Canal alternativo (Signal, teléfono)
- Asumir que el atacante puede estar leyendo

## Fase 2: Detección y Análisis

### Triage inicial

1. **¿Es un incidente real?** (vs falso positivo)
2. **Severidad**: ¿qué tan grave?
3. **Alcance**: ¿qué sistemas/datos afectados?
4. **Tipo**: malware, ransomware, exfiltración, cuenta comprometida, etc.

### Clasificación de severidad

| Sev | Criterio |
|---|---|
| **SEV-1 / Critical** | Ransomware activo, exfiltración masiva, sistemas críticos caídos, datos regulados expuestos |
| **SEV-2 / High** | Compromiso confirmado, propagación en curso, datos sensibles en riesgo |
| **SEV-3 / Medium** | Compromiso limitado, contenido, sin datos críticos |
| **SEV-4 / Low** | Intento fallido, anomalía menor |

### Análisis

- **Scope**: qué sistemas, qué cuentas, qué datos
- **Timeline**: cuándo empezó, qué pasó (de logs/SIEM)
- **Entry point**: cómo entró (para cerrar la puerta)
- **TTPs**: técnicas usadas (mapear a ATT&CK)
- **IOCs**: indicadores para buscar en otros sistemas
- **Persistencia**: ¿el atacante tiene formas de volver?

### Preservar evidencia (forense)

Antes de remediar, preservar (para análisis y posibles implicaciones legales):

```bash
# Memoria (volátil — capturar primero)
# Linux: con herramientas como LiME, avml
sudo avml memory.dump

# Disco: imagen forense (bit-by-bit)
sudo dd if=/dev/sda of=/mnt/external/disk.img bs=4M conv=noerror,sync
# Mejor: dc3dd o forensic imagers con hashing
sudo dc3dd if=/dev/sda of=disk.img hash=sha256 log=image.log

# Hashes para integridad
sha256sum disk.img > disk.img.sha256
```

**Chain of custody**: documentar quién, qué, cuándo, cómo se recolectó la evidencia.

Para casos serios o legales: considerar firma forense profesional (DFIR).

## Fase 3: Containment, Eradication, Recovery

### Containment (contención)

Detener la propagación. Decisión clave: contención inmediata vs observación.

**Contención a corto plazo** (rápida):
- Aislar host(s) comprometido(s) de la red (EDR network isolation)
- Deshabilitar cuentas comprometidas
- Bloquear IPs/dominios de C2 (firewall, DNS)
- Segmentar para limitar movimiento

```bash
# Aislar host (ejemplo con iptables — mejor con EDR remoto)
# Permitir solo comunicación con el IR team
sudo iptables -P INPUT DROP
sudo iptables -P OUTPUT DROP
sudo iptables -A INPUT -s <IR_team_IP> -j ACCEPT
sudo iptables -A OUTPUT -d <IR_team_IP> -j ACCEPT
```

**Decisión: ¿apagar o aislar?**
- **Aislar** (mantener encendido): preserva memoria volátil, permite observar. Preferido si hay capacidad forense.
- **Apagar**: detiene todo pero pierde memoria volátil. Solo si el daño activo lo justifica (ej: ransomware cifrando).

**Contención a largo plazo**:
- Parches temporales
- Aumentar monitoreo
- Preparar para erradicación

### Eradication (erradicación)

Eliminar la presencia del atacante:

- Remover malware
- Cerrar el entry point (parchear vuln, cerrar cuenta)
- Eliminar persistencia (servicios, tareas, cuentas creadas, backdoors)
- Resetear credenciales comprometidas (y potencialmente todas, si hay duda)
- Verificar que no queden formas de volver

⚠️ **No subestimar persistencia**: atacantes dejan múltiples backdoors. Erradicación incompleta = vuelven.

**A menudo: rebuild from scratch** es más seguro que limpiar. Reimaginar sistemas comprometidos desde imagen limpia conocida.

### Recovery (recuperación)

Restaurar operaciones de forma segura:

- Restaurar desde backups limpios (verificados pre-compromiso)
- Rebuild de sistemas comprometidos
- Restaurar servicios gradualmente
- Monitoreo aumentado post-recuperación (el atacante puede intentar volver)
- Validar integridad antes de volver a producción

**Verificar antes de reconectar**:
- Sistema limpio (scan, no IOCs)
- Vulnerabilidad cerrada
- Credenciales rotadas
- Monitoreo activo

## Fase 4: Post-Incident (lecciones aprendidas)

Reunión blameless (como postmortems, ver `technical-docs`):

- **Timeline** completo del incidente
- **Root cause**: cómo entró, por qué funcionó
- **Qué funcionó** en la respuesta
- **Qué falló** o fue lento
- **Action items** para prevenir recurrencia
- **Mejoras** a detección, prevención, respuesta

Documentar para:
- Mejorar defensas
- Cumplir requisitos regulatorios
- Compartir con la comunidad (threat intel)

## Playbooks por tipo de incidente

### Ransomware

```
1. CONTENER INMEDIATO:
   - Aislar sistemas afectados de la red YA
   - Identificar el alcance (qué está cifrado)
   - NO apagar si se está capturando forense (pero SÍ si sigue cifrando)
   - Deshabilitar cuentas comprometidas

2. NO PAGAR (recomendación general):
   - No garantiza recuperación
   - Financia crimen
   - Puede violar sanciones
   - Consultar legal y autoridades

3. INVESTIGAR:
   - Identificar variante de ransomware
   - Entry point
   - ¿Hubo exfiltración antes del cifrado? (double extortion)

4. ERRADICAR:
   - Rebuild de sistemas afectados
   - Cerrar entry point

5. RECUPERAR:
   - Restaurar desde backups inmutables limpios
   - Verificar integridad
   - Monitoreo aumentado

6. NOTIFICAR:
   - Legal, autoridades (FBI/CISA en US, equivalentes locales)
   - Clientes si datos afectados (compliance)
```

### Cuenta comprometida

```
1. Deshabilitar/resetear la cuenta inmediatamente
2. Revocar sesiones activas y tokens
3. Resetear MFA
4. Investigar qué hizo la cuenta (logs)
5. Buscar lateral movement desde esa cuenta
6. Verificar si creó persistencia (cuentas nuevas, reglas de forwarding, etc.)
7. Revisar accesos a datos sensibles
8. Resetear credenciales relacionadas
```

### Exfiltración de datos

```
1. Identificar qué datos, cuánto, a dónde
2. Cortar el canal de exfiltración (egress block)
3. Preservar evidencia
4. Determinar el alcance (qué se sacó)
5. Evaluar obligaciones de notificación (GDPR 72h, etc.)
6. Notificar a legal, afectados, reguladores según corresponda
7. Erradicar acceso del atacante
8. Mejorar controles de exfiltración (ver data-exfiltration-prevention.md)
```

### Malware en endpoint

```
1. Aislar el endpoint (EDR network isolation)
2. Identificar el malware (EDR, sandbox analysis)
3. Determinar alcance (¿otros endpoints? buscar IOCs)
4. Capturar forense si necesario
5. Erradicar (rebuild preferido sobre limpieza)
6. Cerrar entry point
7. Buscar persistencia y lateral movement
8. Restaurar y monitorear
```

### Compromiso de cuenta cloud (AWS/GCP/Azure)

```
1. Identificar credenciales comprometidas (access keys, roles)
2. Revocar/rotar credenciales inmediatamente
3. Revisar CloudTrail: qué hizo el atacante
4. Buscar persistencia: usuarios IAM nuevos, roles, backdoors
5. Revisar recursos creados (instancias de minería, etc.)
6. Revisar cambios de configuración (security groups, buckets públicos)
7. Verificar exfiltración (S3 access, snapshots compartidos)
8. Erradicar y endurecer (MFA, least privilege)
```

## Comunicación durante incidentes

### Interna
- Updates regulares al IR team y stakeholders
- Canal out-of-band si la red está comprometida
- Incident commander coordina

### Externa
- **Legal primero**: implicaciones, obligaciones
- **Clientes**: si sus datos están afectados (transparencia + compliance)
- **Reguladores**: según jurisdicción (GDPR 72h, etc.)
- **Autoridades**: FBI/CISA (US), CERT local, policía cibernética
- **Prensa**: solo a través de comunicaciones, mensaje coordinado

### Plantilla de notificación (concepto)

```
- Qué pasó (sin detalles que ayuden a otros atacantes)
- Qué datos afectados
- Qué estamos haciendo
- Qué deben hacer los afectados
- Contacto para preguntas
```

## Forense defensivo (entender, no atacar)

Para análisis post-incidente:

- **Memory forensics**: Volatility (analizar dumps de memoria)
- **Disk forensics**: Autopsy, Sleuth Kit
- **Log analysis**: SIEM, timeline tools (Plaso/log2timeline)
- **Network forensics**: análisis de PCAP (Wireshark, Zeek)
- **Malware analysis**: en sandbox aislado (NO en producción)

```bash
# Timeline con Plaso
log2timeline.py timeline.plaso disk.img
psort.py -o l2tcsv -w timeline.csv timeline.plaso

# Volatility (memory)
vol.py -f memory.dump windows.pslist
vol.py -f memory.dump windows.netscan
```

⚠️ Forense para **entender y recuperar**. Nunca para "hack back" (contraatacar) — es ilegal y peligroso.

## Herramientas DFIR

| Categoría | Tools (open source) |
|---|---|
| **Memory forensics** | Volatility, Rekall |
| **Disk forensics** | Autopsy, Sleuth Kit, dc3dd |
| **Timeline** | Plaso/log2timeline |
| **Live response** | Velociraptor, GRR, osquery |
| **Network** | Wireshark, Zeek, NetworkMiner |
| **Triage** | KAPE, CyLR |
| **Malware (sandbox)** | Cuckoo, CAPE (aislado) |

## Tabletop exercises

Practicar IR sin incidente real:

- Simular escenarios (ransomware, breach, etc.)
- El equipo "responde" en una reunión
- Identificar gaps en plan, roles, herramientas
- Mejorar antes de que pase de verdad

Hacer periódicamente (trimestral/anual).

## Checklist respuesta a incidentes

### Preparación
- [ ] IR plan documentado y aprobado
- [ ] IR team con roles definidos
- [ ] Playbooks por tipo de incidente
- [ ] Contactos de emergencia (legal, autoridades, DFIR firm)
- [ ] Comunicación out-of-band lista
- [ ] Backups inmutables testeados
- [ ] Acceso break-glass
- [ ] Tabletop exercises periódicos
- [ ] Herramientas DFIR disponibles

### Durante
- [ ] Triage y clasificación de severidad
- [ ] Incident commander asignado
- [ ] Timeline documentado (scribe)
- [ ] Evidencia preservada antes de remediar
- [ ] Contención (aislar, deshabilitar cuentas)
- [ ] Análisis de alcance y TTPs
- [ ] Erradicación completa (incluyendo persistencia)
- [ ] Recuperación desde fuentes limpias
- [ ] Comunicación según plan

### Después
- [ ] Post-incident review blameless
- [ ] Root cause identificado
- [ ] Action items con owners
- [ ] Mejoras a defensas implementadas
- [ ] Notificaciones regulatorias cumplidas
- [ ] Documentación completa
