# Identity & Access

MFA, Zero Trust, PAM, least privilege, conditional access. La primera línea de defensa.

**MITRE ATT&CK**: Credential Access (TA0006), Initial Access vía cuentas válidas (T1078).

## Principio: la identidad es el nuevo perímetro

Con cloud y trabajo remoto, el perímetro de red se disolvió. La identidad es ahora el control de acceso primario. Credenciales comprometidas son la causa #1 de breaches.

## MFA (Multi-Factor Authentication)

**La medida de mayor impacto contra robo de credenciales.** Bloquea la mayoría de ataques de cuentas.

### Factores

```
Algo que sabés    (password)
Algo que tenés    (token, teléfono, llave)
Algo que sos      (biometría)
```

MFA = combinar 2+ de categorías diferentes.

### Tipos de MFA (de más débil a más fuerte)

| Tipo | Seguridad | Notas |
|---|---|---|
| SMS OTP | Débil | Vulnerable a SIM swap, intercepción |
| Email OTP | Débil | Si email comprometido, inútil |
| TOTP (app authenticator) | Media | Mejor que SMS, vulnerable a phishing |
| Push notification | Media | Vulnerable a MFA fatigue/bombing |
| **FIDO2 / WebAuthn / Passkeys** | **Fuerte** | **Phishing-resistant** |
| Hardware key (YubiKey) | Fuerte | Phishing-resistant, físico |

### Phishing-resistant MFA (recomendado)

FIDO2/WebAuthn vincula la credencial al dominio legítimo. Aunque el usuario sea phisheado, la llave no funciona en el sitio falso.

```
Phishing tradicional: usuario ingresa OTP en sitio falso → atacante lo usa → comprometido
Con FIDO2: la llave solo responde al dominio real → phishing falla
```

**Recomendación**: FIDO2/passkeys para todo lo crítico. Al menos TOTP donde no sea posible. Evitar SMS salvo último recurso.

### Dónde MFA (todo)

- ✅ Acceso a cloud (AWS/GCP/Azure consoles)
- ✅ VPN/ZTNA
- ✅ Email
- ✅ SaaS críticos
- ✅ SSH a servidores
- ✅ Acceso privilegiado (admin)
- ✅ Repos de código (GitHub, etc.)
- ✅ Sistemas de CI/CD

### MFA fatigue / bombing (defensa)

Atacantes con credenciales válidas spam push notifications hasta que el usuario aprueba por error.

Defensas:
- **Number matching**: usuario ingresa número mostrado (no solo "aprobar")
- **FIDO2** (no susceptible)
- Límite de intentos
- Alertas de múltiples push denegados

## Least Privilege

Cada identidad (usuario, servicio, rol) tiene los **mínimos permisos necesarios**.

### Principios

- Default deny, grant explícito
- Roles específicos, no "admin para todo"
- Revisar y revocar accesos no usados
- Separación de deberes (nadie controla todo el flujo)

### Just-In-Time (JIT) access

En lugar de acceso permanente, acceso temporal cuando se necesita:

- Solicitar acceso → aprobación → acceso temporal (horas) → expira
- Reduce ventana de exposición
- Tools: cloud PIM (Azure), AWS IAM con sesiones temporales, Teleport, ConductorOne

### Privileged Access Management (PAM)

Gestión especial de cuentas privilegiadas (admin, root):

- **Vault de credenciales privilegiadas** (no las saben los humanos directamente)
- **Session recording** de actividad privilegiada
- **Checkout/checkin** de credenciales
- **Rotación automática** de passwords privilegiados
- **JIT elevation** (elevar privilegios temporalmente)

Tools: CyberArk, Delinea, HashiCorp Vault, Teleport, open source (Vault + custom).

### En cloud (IAM)

```hcl
# AWS: política de least privilege (no wildcards amplios)
# ❌ MAL
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

# ✅ BIEN: específico
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::mi-bucket/uploads/*"
}
```

Ver `cloud-security.md` para IAM cloud detallado.

```bash
# Linux: sudo granular
# /etc/sudoers.d/app-deploy
%deployers ALL=(www-data) NOPASSWD: /usr/bin/systemctl restart myapp
# Solo reiniciar myapp, nada más
```

## Zero Trust

"Never trust, always verify." No confiar por ubicación de red ni "estar dentro".

### Pilares

1. **Verify explicitly**: autenticar y autorizar cada acceso con todo el contexto disponible
2. **Least privilege access**: JIT + just-enough-access
3. **Assume breach**: minimizar blast radius, segmentar, cifrar, monitorear

### Componentes

- **Strong identity** con MFA phishing-resistant
- **Device trust**: solo dispositivos managed/compliant acceden
- **Conditional access**: decisiones basadas en riesgo
- **Micro-segmentación** (ver `network-defense.md`)
- **Continuous verification**: re-evaluar, no "una vez"

### Conditional Access

Decidir acceso según contexto:

```
SI usuario + dispositivo compliant + ubicación esperada + bajo riesgo
   → permitir
SI ubicación inusual O dispositivo desconocido O alto riesgo
   → MFA adicional O bloquear O acceso limitado
```

Factores:
- Identidad y rol
- Salud del dispositivo
- Ubicación geográfica
- Riesgo de la sesión (señales de IdP)
- Sensibilidad del recurso

Implementaciones: Entra ID Conditional Access, Okta, Google Context-Aware Access.

## Gestión de cuentas

### Lifecycle

- **Onboarding**: provisioning con permisos mínimos del rol
- **Cambios**: ajustar permisos al cambiar de rol (no acumular)
- **Offboarding**: revocar TODO inmediatamente al salir
- **Revisión periódica**: access reviews (¿siguen necesitando esto?)

### Cuentas a vigilar

- **Cuentas de servicio**: credenciales largas, alto riesgo. Rotar, monitorear, mínimo privilegio.
- **Cuentas compartidas**: ❌ evitar. Cada uno la suya (accountability).
- **Cuentas privilegiadas**: PAM, MFA, session recording.
- **Cuentas huérfanas**: de empleados que salieron. Auditar y eliminar.
- **Cuentas default**: cambiar passwords default, deshabilitar las no usadas.

### Detección de abuso de cuentas

```
# Señales de cuenta comprometida (a detectar — ver detection-monitoring.md)
- Login desde ubicación imposible (viaje imposible)
- Login fuera de horario habitual
- Acceso a recursos inusuales para esa cuenta
- Múltiples fallos seguidos de éxito
- Cambios de configuración de seguridad (MFA, forwarding rules)
```

## Passwords (cuando se usan)

Aunque MFA es clave, los passwords siguen existiendo:

- **Length > complexity**: passphrases largas mejor que "P@ss1!"
- **No rotación forzada arbitraria** (NIST actualizado: rotar solo si hay indicio de compromiso)
- **Bloquear passwords comprometidos** (check contra haveibeenpwned)
- **Password manager** para generar/almacenar únicos
- **No reutilización** entre sistemas
- **Hashing fuerte** en el backend (Argon2, bcrypt — ver web-backend-security)

### Passwordless (futuro)

Eliminar passwords con passkeys (FIDO2):
- Más seguro (phishing-resistant)
- Mejor UX
- Sin password que robar/phishear

## Federación e SSO

Single Sign-On centraliza la autenticación:

**Pros**:
- Un punto de control (MFA, políticas)
- Mejor UX
- Offboarding centralizado (deshabilitar en IdP = deshabilitar en todo)
- Menos passwords

**Cuidado**:
- El IdP es punto único crítico — protegerlo extremadamente
- Comprometer el IdP = comprometer todo

Protocolos: SAML, OIDC, OAuth2 (ver `web-backend-security` para implementación).

## Service accounts y secrets

Las identidades no-humanas (servicios, apps, CI/CD) también necesitan gestión:

- **Workload identity** en lugar de credenciales estáticas (cloud)
- **Short-lived tokens** (OIDC) en lugar de keys permanentes
- **Rotación** de credenciales de servicio
- **Vault** para secrets (ver `secrets-protection.md`)

```yaml
# Ejemplo: GitHub Actions → AWS sin keys estáticas (OIDC)
permissions:
  id-token: write
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123:role/gha-role
      # Sin AWS_ACCESS_KEY_ID estático
```

## Detección de ataques de identidad

| Ataque | Detección |
|---|---|
| Brute force | Múltiples fallos de login |
| Password spraying | Un password contra muchas cuentas |
| Credential stuffing | Logins con credenciales filtradas |
| MFA fatigue | Múltiples push denegados |
| Impossible travel | Logins desde ubicaciones imposibles |
| Token theft | Uso de token desde IP/device inusual |
| Privilege escalation | Cambios de roles/permisos anómalos |

## Checklist identity & access

### MFA
- [ ] MFA obligatorio en todos los accesos
- [ ] Phishing-resistant (FIDO2/passkeys) para crítico
- [ ] Number matching en push (anti-fatigue)
- [ ] SMS solo último recurso

### Least privilege
- [ ] Roles con permisos mínimos (sin wildcards amplios)
- [ ] JIT access para privilegiado
- [ ] PAM para cuentas admin
- [ ] Separación de deberes
- [ ] Access reviews periódicos

### Zero Trust
- [ ] Conditional access por riesgo/device/ubicación
- [ ] Device trust (solo compliant)
- [ ] Continuous verification
- [ ] No confianza por ubicación de red

### Gestión de cuentas
- [ ] Offboarding revoca todo inmediatamente
- [ ] Sin cuentas compartidas
- [ ] Cuentas de servicio con mínimo privilegio + rotación
- [ ] Auditoría de cuentas huérfanas
- [ ] Passwords default cambiados

### Detección
- [ ] Detección de impossible travel
- [ ] Detección de brute force / spraying
- [ ] Alertas de cambios de seguridad (MFA, forwarding)
- [ ] Monitoreo de accesos privilegiados

### Service identities
- [ ] Workload identity / OIDC (no keys estáticas)
- [ ] Short-lived tokens
- [ ] Secrets en Vault (no en código)
