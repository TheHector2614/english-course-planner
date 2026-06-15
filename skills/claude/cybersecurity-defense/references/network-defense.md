# Network Defense

Segmentación, Zero Trust, firewall, IDS/IPS, DNS security. Limitar movimiento y comunicaciones del atacante.

**MITRE ATT&CK**: Lateral Movement (TA0008), Command and Control (TA0011), Discovery (TA0007).

## Principio: segmentar + default deny + monitorear

El modelo "castle-and-moat" (perímetro fuerte, interior plano) está obsoleto. Una vez dentro, el atacante se mueve libremente. Reemplazar con:

- **Segmentación**: dividir la red, limitar movimiento
- **Default deny**: nada pasa salvo lo permitido
- **Zero Trust**: verificar siempre, no confiar por ubicación
- **Monitoreo**: detectar movimiento anómalo

## Segmentación de red

Dividir la red en zonas con control entre ellas. Limita el blast radius de un compromiso.

### Niveles de segmentación

```
Internet
   │
[Firewall/WAF]
   │
┌──┴──────────────────────────────────┐
│ DMZ (servicios públicos)             │
│  - Load balancers, reverse proxy     │
└──┬──────────────────────────────────┘
   │ [Firewall interno]
┌──┴──────────────────────────────────┐
│ App tier (lógica de negocio)         │
└──┬──────────────────────────────────┘
   │ [Firewall interno]
┌──┴──────────────────────────────────┐
│ Data tier (bases de datos)           │
│  - Solo accesible desde app tier     │
└─────────────────────────────────────┘

Separados también:
- Red de management (admin)
- Red de usuarios (corporativa)
- Red de invitados (aislada)
- OT/IoT (aislada)
```

### Micro-segmentación

Más granular: control a nivel de workload individual, no solo zonas.

- Cada servicio solo habla con los que necesita
- Default deny entre todo
- Implementado con: security groups (cloud), NetworkPolicies (k8s), service mesh (Istio), host firewalls

### Principios

- **Data tier nunca accesible desde internet** (ni desde user network)
- **Management network separada** y con acceso muy restringido
- **Egress filtering** en cada segmento (ver `data-exfiltration-prevention.md`)
- **Default deny** entre segmentos, allow explícito

## Firewall

### Default deny

```bash
# iptables
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT DROP    # egress también (anti-exfiltración)

# Permitir loopback
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Established/related
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Permitir solo lo necesario (ej: HTTPS inbound)
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# SSH solo desde bastion
sudo iptables -A INPUT -p tcp --dport 22 -s 10.0.1.10 -j ACCEPT

# Loguear lo dropeado
sudo iptables -A INPUT -j LOG --log-prefix "INPUT_DROP: "
sudo iptables -A OUTPUT -j LOG --log-prefix "OUTPUT_DROP: "
```

### nftables (moderno, reemplaza iptables)

```
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        iif lo accept
        ct state established,related accept
        ct state invalid drop
        tcp dport 443 accept
        tcp dport 22 ip saddr 10.0.1.10 accept
        log prefix "INPUT_DROP: "
    }
    chain forward {
        type filter hook forward priority 0; policy drop;
    }
    chain output {
        type filter hook output priority 0; policy drop;
        oif lo accept
        ct state established,related accept
        # Egress controlado
        ip daddr 10.0.0.0/8 accept
        udp dport 53 ip daddr 10.0.0.2 accept
        tcp dport 443 ip daddr { 1.2.3.4, 5.6.7.8 } accept
        log prefix "OUTPUT_DROP: "
    }
}
```

### Cloud firewalls

**AWS Security Groups**:
```hcl
# Default deny, allow explícito
resource "aws_security_group" "app" {
  # Solo desde el ALB
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]   # SG ref, no IP
  }
  # Egress solo a DB y servicios necesarios
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.db.id]
  }
}
```

**AWS Network Firewall / NACLs** para control adicional a nivel subnet.

### Web Application Firewall (WAF)

Ver `web-backend-security` para WAF de aplicación. A nivel red, WAF protege apps web de ataques L7.

## Zero Trust

"Never trust, always verify". No confiar por ubicación de red.

### Principios

1. **Verificar explícitamente**: cada acceso autenticado y autorizado
2. **Least privilege access**: mínimo necesario, just-in-time
3. **Assume breach**: segmentar, monitorear, cifrar

### Zero Trust Network Access (ZTNA)

Reemplaza VPN tradicional:

| VPN tradicional | ZTNA |
|---|---|
| Acceso a toda la red tras conectar | Acceso solo a apps específicas |
| Confianza por estar "dentro" | Verificación continua |
| Perímetro | Por-recurso |

Implementaciones: Cloudflare Access, Tailscale, Twingate, Zscaler Private Access, Google BeyondCorp.

### Componentes Zero Trust

- **Identity provider** con MFA (ver `identity-access.md`)
- **Device trust**: solo dispositivos managed/compliant
- **Conditional access**: por riesgo, ubicación, dispositivo
- **Micro-segmentación**
- **Continuous verification**: re-verificar, no "una vez y listo"

## IDS / IPS

Detectar (IDS) y bloquear (IPS) tráfico malicioso.

### Tipos

- **NIDS/NIPS**: a nivel red (analiza tráfico)
- **HIDS/HIPS**: a nivel host (analiza el endpoint)

### Suricata (open source, IDS/IPS/NSM)

```bash
sudo apt install suricata

# Modo IDS (detección)
sudo suricata -i eth0

# Reglas (Emerging Threats, propias)
# /etc/suricata/rules/
# Actualizar reglas:
sudo suricata-update

# Modo IPS (inline, bloquea)
# Requiere configuración con NFQUEUE
```

Suricata detecta:
- Exploits conocidos
- Malware C2
- Anomalías de protocolo
- Patrones de ataque

### Zeek (network security monitoring)

```bash
# Zeek genera logs ricos del tráfico (no solo alertas)
# conn.log, dns.log, http.log, ssl.log, files.log, etc.
# Excelente para threat hunting y forense
```

Zeek + Suricata = visibilidad de red completa.

### Snort

IDS/IPS clásico, alternativa a Suricata.

## DNS Security

DNS es vector de C2 y exfiltración (ver `data-exfiltration-prevention.md`), pero también de filtrado defensivo.

### DNS filtering

Bloquear resolución de dominios maliciosos/no aprobados:

- **Cloudflare Gateway**, **Cisco Umbrella**, **Quad9** (1.1.1.2, 9.9.9.9 bloquean malware)
- **Pi-hole** + listas de bloqueo (self-hosted)
- **DNS sinkholing**: dominios maliciosos → IP nula

### Defensa DNS

- Solo permitir DNS a resolvers internos (bloquear DNS externo)
- DNSSEC para integridad
- DNS over HTTPS/TLS controlado (puede evadir filtros si no se gestiona)
- Monitorear queries (detección de tunneling)

```bash
# Forzar DNS interno, bloquear externo (firewall)
sudo iptables -A OUTPUT -p udp --dport 53 -d 10.0.0.2 -j ACCEPT  # interno OK
sudo iptables -A OUTPUT -p udp --dport 53 -j DROP                # externo bloqueado
sudo iptables -A OUTPUT -p tcp --dport 53 -j DROP
```

## Network Detection and Response (NDR)

Monitoreo continuo del tráfico para detectar amenazas:

- Análisis de comportamiento (baseline + anomalías)
- Detección de lateral movement
- Detección de C2 / beaconing
- Detección de exfiltración

Tools: Zeek + Suricata + SIEM, o comerciales (Darktrace, ExtraHop, Vectra).

## Lateral Movement: detectar y prevenir

Una vez dentro, atacantes se mueven lateralmente. Defensas:

### Prevención
- **Segmentación / micro-segmentación**
- **Least privilege** (cuentas no pueden acceder a todo)
- **Deshabilitar protocolos de movimiento** innecesarios (RDP, SMB, WinRM donde no se usen)
- **LAPS** (passwords admin local únicos — evita pass-the-hash entre máquinas)
- **Credential Guard** (Windows)

### Detección
- Logins anómalos (cuenta accediendo a sistemas inusuales)
- Uso de herramientas de admin remoto (PsExec, WMI, etc.)
- Autenticaciones laterales (Kerberos/NTLM patterns)
- East-west traffic anómalo (entre segmentos internos)

```
# Detección (concepto): cuenta de usuario accediendo a múltiples
# hosts en poco tiempo → posible lateral movement
SI una cuenta autentica a > N hosts distintos en < M minutos
ENTONCES → ALERTAR (posible lateral movement)
```

## VPN segura (si se usa)

Si usás VPN tradicional (migrar a ZTNA cuando sea posible):

- MFA obligatorio
- Split tunneling deshabilitado (todo el tráfico inspeccionado) o cuidadosamente controlado
- Acceso segmentado (no a toda la red)
- Logging y monitoreo
- Certificados de dispositivo

## Network access control (NAC)

Controlar qué dispositivos se conectan a la red:

- 802.1X (autenticación de dispositivos)
- Solo dispositivos compliant
- Quarantine VLAN para no-compliant
- Visibility de todo lo conectado

## Service Mesh (microservicios)

Para arquitecturas de microservicios, service mesh (Istio, Linkerd) provee:

- **mTLS automático** entre servicios
- **Authorization policies** (qué servicio habla con qué)
- **Observability** del tráfico
- **Default deny** entre servicios

```yaml
# Istio: default deny, allow explícito
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  {}  # vacío = deny all
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-frontend-to-api
spec:
  selector:
    matchLabels:
      app: api
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/frontend"]
```

## Checklist network defense

### Segmentación
- [ ] Red segmentada por zonas (DMZ, app, data, management)
- [ ] Data tier no accesible desde internet/user network
- [ ] Management network separada y restringida
- [ ] Micro-segmentación en workloads críticos
- [ ] Default deny entre segmentos

### Firewall
- [ ] Default deny inbound Y outbound (egress filtering)
- [ ] Reglas con least privilege (SG refs, no IPs amplias)
- [ ] Logging de tráfico dropeado
- [ ] WAF en apps públicas
- [ ] Cloud security groups restrictivos

### Zero Trust
- [ ] ZTNA en lugar de VPN amplia (o VPN bien segmentada)
- [ ] MFA en accesos
- [ ] Device trust
- [ ] Conditional access
- [ ] Verificación continua

### Detección
- [ ] IDS/IPS (Suricata/Snort)
- [ ] Network monitoring (Zeek)
- [ ] Detección de lateral movement
- [ ] Detección de C2/beaconing
- [ ] NDR o equivalente

### DNS
- [ ] DNS filtering (malware/dominios maliciosos)
- [ ] Solo DNS interno permitido
- [ ] Monitoreo de queries (anti-tunneling)
- [ ] DNSSEC

### Microservicios (si aplica)
- [ ] Service mesh con mTLS
- [ ] NetworkPolicies default-deny (k8s)
- [ ] Authorization policies entre servicios
