# Prevención de Exfiltración de Datos

Evitar que datos sensibles salgan del entorno. La defensa central contra el robo de información.

**MITRE ATT&CK contrarrestado**: Exfiltration (TA0010), Collection (TA0009), Command and Control (TA0011 - canales de salida).

## Principio: controlar la salida (egress)

La mayoría de defensas se enfocan en evitar la entrada. Pero para **robar datos, el atacante necesita sacarlos**. Controlar la salida es a menudo la última y más efectiva línea.

```
Atacante entra → se mueve → recolecta datos → INTENTA SACARLOS ← acá lo paramos
```

## Estrategia multi-capa anti-exfiltración

```
1. Clasificación      → saber qué es sensible
2. Encryption         → datos inútiles si se roban cifrados
3. Access control     → mínimo acceso a datos sensibles
4. Egress filtering   → solo destinos permitidos
5. DLP                → detectar patrones sensibles saliendo
6. Monitoring         → detectar canales y volúmenes anómalos
```

## 1. Clasificación de datos

No podés proteger lo que no sabés que es sensible.

Niveles típicos:
- **Public**: sin restricción
- **Internal**: solo empleados
- **Confidential**: necesidad de saber
- **Restricted/Secret**: máxima protección (PII, PHI, secretos, financiero)

Identificar dónde viven:
- PII (nombres, emails, documentos, direcciones)
- PHI (datos de salud)
- PCI (tarjetas de crédito)
- Credenciales y secretos
- Propiedad intelectual

Tools de discovery: AWS Macie, Microsoft Purview, Google DLP, open source (como `gitleaks` para repos).

## 2. Encryption (datos inútiles si se roban)

### At-rest

```bash
# Linux: LUKS full disk
sudo cryptsetup luksFormat /dev/sdb
sudo cryptsetup open /dev/sdb encrypted_volume

# Verificar disco cifrado
lsblk -f
```

- **Discos**: LUKS (Linux), BitLocker (Windows), FileVault (macOS)
- **Bases de datos**: TDE, column-level encryption (ver `databases`)
- **Cloud storage**: SSE-KMS (S3), CMEK (GCP)
- **Backups**: siempre cifrados

### In-transit

- **TLS 1.2+** en todo (TLS 1.3 preferido)
- mTLS para servicio-a-servicio
- VPN/ZTNA para acceso remoto

### En uso

- Acceso controlado (least privilege)
- Confidential computing (enclaves) para casos extremos

Si los datos están cifrados y las keys bien gestionadas (KMS/HSM/Vault), exfiltrar el blob cifrado no sirve.

## 3. Access control mínimo

Cuanta menos gente/procesos acceden a datos sensibles, menor superficie de robo.

- **Least privilege**: solo quien necesita
- **Just-in-time access**: acceso temporal, no permanente
- **Separación de deberes**
- **Auditoría de accesos** a datos sensibles
- **Row/column-level security** en DBs

## 4. Egress filtering (clave)

Controlar **qué sale** de la red. Default deny en salida.

### Firewall egress

```bash
# iptables: default deny egress, permitir solo lo necesario
# Permitir DNS a servidores específicos
sudo iptables -A OUTPUT -p udp --dport 53 -d 10.0.0.2 -j ACCEPT
# Permitir HTTPS a destinos aprobados (ej: API conocidas)
sudo iptables -A OUTPUT -p tcp --dport 443 -d api.trusted.com -j ACCEPT
# Permitir tráfico interno
sudo iptables -A OUTPUT -d 10.0.0.0/8 -j ACCEPT
# DROP todo lo demás (default deny)
sudo iptables -P OUTPUT DROP
sudo iptables -A OUTPUT -j LOG --log-prefix "EGRESS_DROP: "
```

### nftables (moderno)

```
table inet filter {
    chain output {
        type filter hook output priority 0; policy drop;

        # Established connections
        ct state established,related accept

        # DNS a servidores aprobados
        ip daddr 10.0.0.2 udp dport 53 accept

        # Internal
        ip daddr 10.0.0.0/8 accept

        # Log y drop lo demás
        log prefix "EGRESS_DROP: " drop
    }
}
```

### Cloud egress control

**AWS**:
- Security Groups: solo egress necesario (no `0.0.0.0/0` por default)
- NACLs
- VPC endpoints para servicios AWS (no salir a internet)
- Egress-only internet gateway (IPv6)
- AWS Network Firewall para inspección

**Kubernetes NetworkPolicy** (default deny egress):
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress
spec:
  podSelector: {}
  policyTypes:
    - Egress
  # Sin egress rules = bloquea todo el egress
---
# Permitir solo DNS y un servicio específico
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-and-api
spec:
  podSelector:
    matchLabels:
      app: myapp
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
    - to:
        - ipBlock:
            cidr: 10.0.0.0/8
      ports:
        - protocol: TCP
          port: 443
```

Egress filtering bloquea que malware "llame a casa" (C2) o suba datos a destinos no aprobados.

### Proxy forzado para HTTP/HTTPS

Forzar todo el tráfico web a través de un proxy que:
- Filtra destinos (allowlisting de dominios)
- Inspecciona contenido (con TLS interception donde sea legal/apropiado)
- Loguea todo

## 5. DLP (Data Loss Prevention)

Detectar y bloquear datos sensibles saliendo.

### Qué detecta

- Patrones: números de tarjeta (regex + Luhn), SSN, documentos de identidad
- Keywords y clasificaciones
- Fingerprinting de documentos sensibles
- Volumen anómalo de datos

### Canales monitoreados

- Email (adjuntos, contenido)
- Web uploads
- USB / dispositivos removibles
- Cloud sync (Dropbox, Drive personal)
- Impresión
- Clipboard (en endpoints managed)

### Tools

- **Cloud**: Microsoft Purview DLP, Google Workspace DLP, AWS Macie (S3)
- **Endpoint**: EDR/XDR con DLP, Forcepoint, Symantec DLP
- **Network**: DLP en gateway/proxy
- **Open source**: limited (OpenDLP histórico, mejor usar reglas custom en SIEM)

### Ejemplo de regla DLP (concepto)

```
SI un email saliente contiene:
  - 3+ números que pasan validación Luhn (tarjetas), O
  - Patrón de documento de identidad, O
  - Documento clasificado "Confidential"
ENTONCES:
  - Bloquear envío
  - Alertar a seguridad
  - Requerir justificación/aprobación
```

### USB control

```bash
# Linux: deshabilitar USB storage
echo "blacklist usb-storage" | sudo tee /etc/modprobe.d/blacklist-usb.conf
# O con udev rules para control granular
```

```powershell
# Windows: bloquear USB storage vía GPO
# Computer Configuration → Administrative Templates → System → Removable Storage Access
# "All Removable Storage classes: Deny all access" → Enabled
```

## 6. Detección de exfiltración

Monitorear canales y patrones de salida anómalos.

### DNS exfiltration / tunneling

Atacantes codifican datos en queries DNS para evadir filtros.

Señales:
- Volumen anómalo de queries DNS
- Subdominios muy largos o de alta entropía
- Queries a dominios recién registrados
- TXT records inusuales

```
# Detección (Sigma-style)
SI queries DNS a un dominio > N por minuto, O
   longitud de subdominio > 50 chars, O
   entropía del subdominio alta
ENTONCES → posible DNS tunneling, ALERTAR
```

Defensa:
- DNS filtering (Cisco Umbrella, Cloudflare Gateway, Pi-hole + listas)
- Solo permitir DNS a resolvers internos
- Monitorear logs DNS

### Volumen anómalo de datos salientes

```
# Baseline normal: ~X MB/día por host
SI un host sube > 10x su baseline normal
   O sube a un destino nunca visto antes
   O sube en horario anómalo (3 AM)
ENTONCES → posible exfiltración, ALERTAR
```

### Canales de C2 comunes a detectar

- HTTPS a dominios recién registrados / baja reputación
- Conexiones a IPs en países inusuales
- Beaconing (conexiones periódicas regulares — patrón de C2)
- Tráfico a servicios de pastebin, file-sharing anónimos
- Protocolos en puertos no estándar

### Cloud data exfiltration

**AWS**:
- CloudTrail: detectar `GetObject` masivos, `CopyObject` cross-account
- S3 access logs
- GuardDuty: detección de exfiltración (incluye DNS, anomalías)
- Macie: descubrimiento de datos sensibles + alertas de acceso

```
# GuardDuty findings relevantes a exfiltración:
# - Exfiltration:S3/ObjectRead.Unusual
# - Trojan:EC2/DNSDataExfiltration
# - Backdoor:EC2/C&CActivity
```

## Canales de exfiltración y defensas

| Canal | Defensa |
|---|---|
| HTTP/HTTPS upload | Egress proxy + DLP + destino allowlisting |
| DNS tunneling | DNS filtering + detección de tunneling |
| Email | Email DLP + filtrado de adjuntos |
| USB | USB device control |
| Cloud sync personal | Bloquear apps no-corporativas + CASB |
| ICMP tunneling | Bloquear/limitar ICMP saliente |
| Conexión directa a IP | Egress filtering por IP/reputación |
| Encrypted channels (C2) | Detección comportamental (beaconing, anomalías) |
| Physical (impresión, foto) | DLP de impresión, políticas, controles físicos |

## Cloud Access Security Broker (CASB)

Para entornos con SaaS, un CASB:
- Controla qué apps cloud se usan (shadow IT)
- Aplica DLP en SaaS (Office 365, Google Workspace, etc.)
- Detecta uploads a apps no aprobadas
- Bloquea sync a cuentas personales

## Encryption no impide DLP (importante)

Si TODO está cifrado, ¿cómo hace DLP? Opciones:
- DLP en el endpoint (antes de cifrar para envío)
- TLS interception en el proxy (donde sea legal y apropiado, con políticas claras)
- Análisis de metadata y comportamiento cuando el contenido no es inspeccionable

Balance entre privacidad y seguridad — definir políticas claras.

## Honeytokens (detección de robo)

Datos falsos atractivos que alertan si se acceden:

- Registros falsos en DB ("honey records")
- Credenciales falsas que alertan si se usan
- Documentos marcados que llaman a casa si se abren
- AWS canary tokens (claves falsas que alertan al usarse)

```
# Ejemplo: canary token de AWS
# Crear credenciales AWS falsas, ponerlas en lugares "jugosos"
# Si alguien las usa → CloudTrail registra el intento → ALERTA inmediata
# Servicio: canarytokens.org (gratis) para tokens variados
```

Excelente para detectar que alguien está hurgando datos.

## Checklist anti-exfiltración

### Clasificación y encryption
- [ ] Datos sensibles clasificados e identificados
- [ ] Encryption at-rest en discos/DBs/backups
- [ ] Encryption in-transit (TLS 1.2+)
- [ ] Keys en KMS/HSM/Vault

### Egress control
- [ ] Firewall egress default-deny
- [ ] Solo destinos aprobados pueden recibir tráfico
- [ ] DNS solo a resolvers internos
- [ ] VPC endpoints (cloud) para no salir a internet
- [ ] Kubernetes NetworkPolicy default-deny egress
- [ ] Proxy forzado para HTTP/HTTPS

### DLP
- [ ] DLP en email
- [ ] DLP en endpoints
- [ ] DLP en cloud/SaaS (si aplica)
- [ ] USB device control
- [ ] Bloqueo de cloud sync personal

### Detección
- [ ] Monitoreo de volumen de datos saliente
- [ ] Detección de DNS tunneling
- [ ] Detección de beaconing/C2
- [ ] Alertas de acceso masivo a datos (CloudTrail, DB audit)
- [ ] Honeytokens desplegados
- [ ] GuardDuty/equivalente para detección cloud

### Acceso
- [ ] Least privilege a datos sensibles
- [ ] Auditoría de accesos a datos sensibles
- [ ] Just-in-time access para datos críticos
