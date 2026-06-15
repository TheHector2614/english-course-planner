# Compliance

Mapeo de normativas a controles técnicos concretos.

## Disclaimer

Esta guía proporciona orientación técnica. **No reemplaza asesoría legal**. Para certificación formal (PCI-DSS, SOC 2, etc.) consultar QSAs, auditores y abogados especializados.

## GDPR / LGPD (datos personales)

GDPR (UE) y LGPD (Brasil) son similares. Aplica si tratas datos de residentes de UE/Brasil, sin importar dónde esté tu empresa.

### Principios

1. **Lawfulness, fairness, transparency** — base legal clara para el tratamiento
2. **Purpose limitation** — usar datos solo para el propósito declarado
3. **Data minimization** — recolectar solo lo necesario
4. **Accuracy** — datos correctos y actualizados
5. **Storage limitation** — borrar cuando ya no se necesite
6. **Integrity and confidentiality** — seguridad apropiada
7. **Accountability** — poder demostrar cumplimiento

### Controles técnicos

| Requisito | Implementación |
|---|---|
| **Consentimiento** | Opt-in explícito, granular, revocable. Guardar timestamp + IP + versión del aviso. |
| **Derecho de acceso** | Endpoint `/api/v1/me/data-export` que devuelve todos los datos del usuario en JSON portable |
| **Derecho de rectificación** | Permitir editar datos personales en la app |
| **Derecho al olvido** | Endpoint `/api/v1/me/delete-account` que borra o anonimiza datos. Considerar legal hold para datos con obligación de retención |
| **Portabilidad** | Export en formato estructurado y leíble por máquina (JSON, CSV) |
| **Notificación de breach** | Si hay breach que afecta datos personales, notificar a la autoridad en **72 horas** y a los usuarios sin dilación si hay alto riesgo |
| **Privacy by design** | Threat model considerando privacidad. Default = privacidad alta. |
| **DPIA** | Data Protection Impact Assessment para tratamientos de alto riesgo |
| **DPO** | Data Protection Officer designado |

### Implementación

#### Endpoint de export

```java
@GetMapping("/api/v1/me/data-export")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserDataExport> exportMyData(@AuthenticationPrincipal UserPrincipal user) {
    UserDataExport data = new UserDataExport(
        userService.getProfile(user.getId()),
        orderService.findByUser(user.getId()),
        sessionService.findByUser(user.getId()),
        auditService.findByUser(user.getId()),
        // ... todo lo demás
    );
    securityLogger.info("GDPR_DATA_EXPORT user={}", user.getEmail());
    return ResponseEntity.ok(data);
}
```

#### Endpoint de borrado

```java
@DeleteMapping("/api/v1/me/account")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal UserPrincipal user) {
    // Step-up auth: requerir password reciente
    // Soft delete + tarea async para anonimización
    userService.requestAccountDeletion(user.getId());
    securityLogger.info("GDPR_DELETION_REQUESTED user={}", user.getEmail());
    return ResponseEntity.accepted().build();
}
```

#### Anonimización vs borrado

A veces no se puede borrar (obligación legal de retener facturación 5+ años). En ese caso, **anonimizar**:

```java
@Transactional
public void anonymizeUser(Long userId) {
    User user = userRepo.findById(userId).orElseThrow();
    user.setEmail("deleted-" + UUID.randomUUID() + "@anonymized.local");
    user.setName("Deleted User");
    user.setPhone(null);
    user.setAddress(null);
    user.setActive(false);
    user.setDeletedAt(Instant.now());
    userRepo.save(user);

    // Ordenes: mantener para contabilidad, pero desvincular PII
    orderRepo.anonymizePersonalDataFor(userId);
}
```

#### Política de retención

Definir y aplicar TTL por tipo de dato:

| Dato | Retención |
|---|---|
| Logs de auth | 6-12 meses |
| Logs de aplicación | 1 mes |
| Datos de marketing | Hasta retiro de consent |
| Carrito abandonado | 30 días |
| Cuenta inactiva | Alertar y borrar tras N años |
| Facturas | 5-10 años (obligación fiscal) |
| Backups | Documentar y rotar |

Implementar con jobs scheduled.

## PCI-DSS (datos de pago)

Aplica si tu sistema **almacena, procesa o transmite** datos de tarjetas (PAN, expiry, CVV).

### Regla número uno

**No toques las tarjetas.** Usa Stripe, Mercado Pago, PayU, Adyen, etc. y deja que ellos manejen PCI scope.

Si el cliente ingresa la tarjeta en un **iframe del provider** (Stripe Elements, etc.), tu sistema queda fuera del scope crítico (SAQ A).

### Si DEBES procesar tarjetas directamente

- **NUNCA** almacenes el CVV/CVC (prohibido después de la autorización)
- **NUNCA** almacenes el PAN en plain text
- Si almacenas PAN: usar **tokenización** o encriptación con keys en HSM
- Truncar PAN para display: `**** **** **** 1234`
- Logs **NUNCA** contienen PAN, CVV ni track data

### Requisitos de PCI-DSS v4.0 (resumen)

| Requirement | Lo que significa técnicamente |
|---|---|
| 1. Firewall/network segmentation | DMZ, network policies, no acceso directo a DB desde internet |
| 2. No usar defaults | Cambiar passwords default, deshabilitar servicios innecesarios |
| 3. Proteger datos almacenados | Encriptación at-rest, keys en HSM, no CVV |
| 4. Encriptar en tránsito | TLS 1.2+ |
| 5. Antimalware | EDR en servidores |
| 6. Desarrollo seguro | SAST, secure coding, code review |
| 7. Least privilege | RBAC, separación de duties |
| 8. Auth strong | MFA, password policy |
| 9. Acceso físico | DC con controles físicos |
| 10. Logging y monitoring | Audit logs centralizados, retención 1 año (3 meses online) |
| 11. Pruebas de seguridad | Pentest anual, ASV scans trimestrales |
| 12. Política | Programa formal de seguridad |

### SAQ (Self-Assessment Questionnaire)

| SAQ | Cuándo |
|---|---|
| **SAQ A** | Outsourcing total a provider (iframe) — la mayoría de e-commerce SaaS |
| **SAQ A-EP** | Tu página redirige a provider pero hostea el JS del formulario |
| **SAQ D** | Almacenas o procesas PAN directamente — full compliance |

**Objetivo**: quedar en SAQ A.

## HIPAA (datos de salud)

Aplica si manejas **PHI** (Protected Health Information) de pacientes en EE.UU.

### Roles

- **Covered entity**: provider de salud, plan de salud, clearinghouse
- **Business Associate**: tú, si procesas PHI para una covered entity (necesitas firmar **BAA**)

### Safeguards técnicos

| Salvaguarda | Implementación |
|---|---|
| **Access control** | Unique user IDs, login automático, encriptación |
| **Audit controls** | Logs de quién accedió a qué PHI, cuándo |
| **Integrity** | Detección de modificación no autorizada (hashes, checksums) |
| **Transmission security** | TLS, VPN |
| **Encryption** | At-rest y in-transit (no es obligatorio pero es el único safe harbor en breach) |

### Implementación

```java
// Audit log obligatorio para cada acceso a PHI
@Aspect
@Component
public class PhiAccessAuditAspect {

    @AfterReturning("@annotation(com.example.security.PhiAccess)")
    public void logAccess(JoinPoint jp) {
        UserPrincipal user = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String method = jp.getSignature().getName();
        Object[] args = jp.getArgs();

        phiAuditLogger.info("PHI_ACCESS user={} method={} args={} ip={} timestamp={}",
            user.getEmail(),
            method,
            sanitize(args),
            getCurrentIp(),
            Instant.now()
        );
    }
}

@PhiAccess
public PatientRecord getPatient(Long patientId) { /* ... */ }
```

### Encriptación de PHI

**Obligatoria para "safe harbor"** (si no encriptas y hay breach, debes notificar; si encriptas con keys separadas, no es breach reportable).

- Encriptar PHI en DB (field-level con AES-GCM o nativo)
- Encriptar backups
- Encriptar discos
- TLS 1.2+ en tránsito
- Keys en KMS

### Otros requerimientos

- **BAA** (Business Associate Agreement) con cualquier vendor que toque PHI (AWS, GCP, etc.)
- **Mínimo necesario**: dar acceso solo al PHI necesario para la función
- **Breach notification**: 60 días al afectado, 60 días al HHS si afecta > 500 personas
- **Retención**: 6 años de documentación de policies/procedures

## SOC 2

Estándar para SaaS B2B. Audita controles internos en 5 categorías (Trust Services Criteria):

1. **Security** (siempre incluido)
2. Availability
3. Processing Integrity
4. Confidentiality
5. Privacy

### Type I vs Type II

- **Type I**: snapshot — "tienes los controles en este momento"
- **Type II**: período — "tus controles funcionaron correctamente durante N meses"

Type II tiene más valor comercial. Período mínimo: 3 meses (típico 6-12).

### Controles típicos

- **Access management**: provisioning/deprovisioning, RBAC, MFA, reviews trimestrales
- **Change management**: PRs requieren review, environments separados, deploys auditados
- **Vulnerability management**: scans, patching, SLAs
- **Incident response**: plan documentado, drills, comunicación
- **Vendor management**: due diligence en SaaS providers
- **BCP/DR**: backups, RTO/RPO, drills
- **Logging y monitoring**: SIEM, alerting, retención
- **Training**: security awareness para empleados
- **HR**: background checks, NDA, offboarding

### Herramientas que ayudan

- **Vanta**, **Drata**, **Secureframe**, **Tugboat Logic** — automatizan recolección de evidencia
- Conectan con AWS, GitHub, Okta, etc. y verifican controles
- Generan dashboard para auditoría

## ISO 27001

Estándar internacional para SGSI (Sistema de Gestión de Seguridad de la Información).

Más amplio que SOC 2 — gobernanza completa, no solo controles técnicos.

### Componentes

- **Política de seguridad**
- **Análisis de riesgos** (formal, documentado, revisado)
- **Statement of Applicability** (qué controles del Anexo A aplicas)
- **Anexo A**: 93 controles agrupados en 4 temas (organizacional, personas, físico, tecnológico)
- **Ciclo PDCA** (Plan-Do-Check-Act)

### Solapamiento con otros

ISO 27001 ≈ SOC 2 Security + governance. Muchas empresas obtienen ambas (ISO para clientes internacionales, SOC 2 para EE.UU.).

## Mapeo de controles comunes

Tabla de qué controles satisfacen múltiples normativas:

| Control técnico | GDPR | PCI-DSS | HIPAA | SOC 2 | ISO 27001 |
|---|:---:|:---:|:---:|:---:|:---:|
| Encriptación at-rest | ✓ | ✓ | ✓ | ✓ | ✓ |
| TLS 1.2+ in-transit | ✓ | ✓ | ✓ | ✓ | ✓ |
| MFA | ✓ | ✓ | ✓ | ✓ | ✓ |
| Audit logs | ✓ | ✓ | ✓ | ✓ | ✓ |
| RBAC + least privilege | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vulnerability scanning | | ✓ | ✓ | ✓ | ✓ |
| Pentest periódico | | ✓ | | ✓ | ✓ |
| Incident response plan | ✓ | ✓ | ✓ | ✓ | ✓ |
| Backups + DR | | ✓ | ✓ | ✓ | ✓ |
| Política de retención | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notificación de breach | ✓ | ✓ | ✓ | | |

**Estrategia**: implementar controles técnicos sólidos primero (cubren mucho), después agregar la documentación/governance para certificar.

## Cuándo el usuario pregunta sobre compliance

1. Confirmar qué normativa aplica (puede ser varias)
2. Identificar el alcance (qué sistemas tocan los datos en scope)
3. Recorrer los controles técnicos relevantes
4. Hacer **gap analysis**: qué tiene, qué falta
5. Priorizar lo crítico primero
6. Recomendar herramientas (Vanta, Drata) si va por certificación formal

## Para el usuario

Recordar siempre:

- **Compliance ≠ Seguridad**. Cumplir la norma es el piso, no el techo.
- Los **auditores** verifican que hagas lo que dices que haces (políticas + evidencia). La automatización con tooling ahorra cientos de horas.
- **Documentar** = casi tan importante como implementar. Para certificaciones, "si no está escrito, no existe".
- **Continuous compliance**: no es one-shot, es proceso continuo.
