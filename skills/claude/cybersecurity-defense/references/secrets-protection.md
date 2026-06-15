# Protección de Secretos

Vault, KMS, rotación, protección en runtime. Evitar que credenciales y secretos se roben.

**MITRE ATT&CK**: Credential Access (TA0006), específicamente T1552 (Unsecured Credentials).

## Principio: secretos fuera del código, cifrados, rotados, auditados

Los secretos (API keys, passwords, tokens, certificados, claves de cifrado) son objetivo primario. Comprometer un secreto a menudo da acceso a todo lo que protege.

## Dónde NO poner secretos

- ❌ Código fuente (hardcoded)
- ❌ Repositorios Git (ni en historial — ver `git-workflows`)
- ❌ Variables de entorno en claro (visibles en `/proc`, logs, crash dumps)
- ❌ Archivos de config sin cifrar commiteados
- ❌ Logs
- ❌ Imágenes de contenedor (quedan en layers)
- ❌ Tickets, wikis, chats
- ❌ URLs (query params quedan en logs)

## Dónde SÍ: gestores de secretos

### HashiCorp Vault

El estándar open source para gestión de secretos.

```bash
# Almacenar secreto
vault kv put secret/myapp/db password="..." username="appuser"

# Leer
vault kv get secret/myapp/db

# La app obtiene el secreto en runtime, autenticándose a Vault
```

Capacidades:
- **Secrets estáticos**: almacenados y cifrados
- **Dynamic secrets**: genera credenciales on-demand con TTL (ej: credenciales de DB temporales)
- **Encryption as a service**: cifrar/descifrar sin exponer keys
- **PKI**: emitir certificados
- **Auto-rotación**
- **Audit log** de todo acceso

### Cloud secret managers

**AWS Secrets Manager**:
```bash
aws secretsmanager create-secret --name prod/myapp/db \
  --secret-string '{"username":"app","password":"..."}'

# Rotación automática built-in
aws secretsmanager rotate-secret --secret-id prod/myapp/db \
  --rotation-lambda-arn arn:aws:lambda:...
```

**AWS Parameter Store** (más barato para config + secrets simples):
```bash
aws ssm put-parameter --name /prod/myapp/api-key \
  --value "..." --type SecureString
```

**GCP Secret Manager**, **Azure Key Vault**: equivalentes.

### Comparación

| Tool | Cuándo |
|---|---|
| **Vault** | Multi-cloud, dynamic secrets, control total |
| **AWS Secrets Manager** | AWS-native, rotación built-in |
| **AWS Parameter Store** | AWS, secrets simples, más barato |
| **GCP Secret Manager** | GCP-native |
| **Azure Key Vault** | Azure-native |
| **Sealed Secrets / SOPS** | Secrets en Git cifrados (GitOps) |

## KMS (Key Management Service)

Gestión de claves de cifrado. Las claves nunca salen del KMS/HSM.

- **AWS KMS**, **GCP KMS**, **Azure Key Vault**
- **HSM** (Hardware Security Module): claves en hardware, máxima seguridad
- Envelope encryption: KMS cifra una data key, la data key cifra los datos

```bash
# AWS KMS: cifrar
aws kms encrypt --key-id alias/myapp --plaintext fileb://secret.txt \
  --output text --query CiphertextBlob | base64 -d > secret.enc

# Descifrar
aws kms decrypt --ciphertext-blob fileb://secret.enc \
  --output text --query Plaintext | base64 -d
```

Principios:
- Keys de cifrado en KMS/HSM, nunca en código
- Rotación de keys
- Acceso a keys con least privilege + audit
- Separación: quien tiene los datos no tiene la key, y viceversa

## Inyección de secretos en runtime

Cómo las apps obtienen secretos sin hardcodearlos:

### Contenedores / Kubernetes

```yaml
# Kubernetes: secret montado (mejor que env var)
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      volumeMounts:
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: myapp-secrets
```

Mejor: **External Secrets Operator** o **Vault Agent** que inyectan desde el secret manager externo:

```yaml
# External Secrets Operator: sincroniza de Vault/AWS/etc. a k8s
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-db
spec:
  secretStoreRef:
    name: vault-backend
  target:
    name: myapp-db-secret
  data:
    - secretKey: password
      remoteRef:
        key: secret/myapp/db
        property: password
```

⚠️ **Kubernetes Secrets nativos** están solo en base64 (NO cifrados por default). Habilitar **encryption at rest** en etcd, o usar secret manager externo.

```yaml
# Habilitar encryption at rest de secrets en etcd
# EncryptionConfiguration
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources: ["secrets"]
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: <base64-encoded-key>
      - identity: {}
```

### Aplicaciones

```javascript
// Cargar de secret manager en runtime, no de env hardcoded
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});
let cached;

async function getDbCredentials() {
  if (!cached) {
    const res = await client.send(new GetSecretValueCommand({
      SecretId: 'prod/myapp/db'
    }));
    cached = JSON.parse(res.SecretString);
  }
  return cached;
}
```

### CI/CD

```yaml
# GitHub Actions: usar secrets del repo/org (cifrados) + OIDC para cloud
# NO hardcodear en el workflow
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123:role/ci-role  # OIDC, sin keys
  - run: |
      DB_PASS=$(aws secretsmanager get-secret-value --secret-id prod/db --query SecretString --output text)
```

## Rotación de secretos

Secretos de larga vida son más peligrosos. Rotar:

- **Automática** donde sea posible (Secrets Manager, Vault dynamic secrets)
- **Tras compromiso** (obligatorio inmediato)
- **Periódica** para credenciales estáticas
- **Tras offboarding** de quien las conocía

### Dynamic secrets (lo mejor)

Vault genera credenciales temporales on-demand:

```bash
# Vault genera credenciales de DB con TTL de 1 hora
vault read database/creds/myapp-role
# username: v-token-myapp-x8s9d... password: ... lease_duration: 1h
# Después de 1h, Vault las revoca automáticamente
```

Si se roban, expiran solas. No hay "secreto permanente" que robar.

## Detección de secretos expuestos

### En código / repos

```bash
# gitleaks (pre-commit y CI — ver git-workflows)
gitleaks detect --source . --verbose

# trufflehog
trufflehog git file://. --json
```

### En runtime

- Monitorear acceso anómalo al secret manager (Vault/Secrets Manager audit logs)
- Detectar uso de credenciales desde ubicaciones inusuales
- **Honeytokens**: credenciales falsas que alertan si se usan (ver `data-exfiltration-prevention.md`)

### Si un secreto se expone

```
1. ROTAR INMEDIATAMENTE (revocar viejo, generar nuevo)
2. Asumir comprometido (no esperar confirmación de abuso)
3. Investigar acceso/uso no autorizado (logs)
4. Limpiar de donde se expuso (pero rotación es lo crítico, no la limpieza)
5. Revisar qué accedía ese secreto
6. Mejorar para que no vuelva a pasar
```

## Certificados y PKI

- **Gestión de lifecycle**: emisión, renovación, revocación
- **Auto-renovación** (cert-manager en k8s, ACME/Let's Encrypt)
- **No certificados de larga vida** (rotar)
- **CA privada** para servicios internos (Vault PKI, cloud CA)
- **Monitoreo de expiración** (cert expirado = outage o downgrade de seguridad)

```bash
# cert-manager en Kubernetes: auto-renovación de certificados
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: myapp-tls
spec:
  secretName: myapp-tls-secret
  duration: 2160h    # 90 días
  renewBefore: 360h  # renovar 15 días antes
  issuerRef:
    name: letsencrypt-prod
```

## Protección de credenciales en memoria

Avanzado, pero relevante para sistemas críticos:

- **LSASS protection** (Windows): Credential Guard, LSA Protection (ver `endpoint-hardening.md`)
- **No dumps de memoria** de procesos con secretos (`fs.suid_dumpable=0` en Linux)
- **Secrets en memoria por mínimo tiempo** (cargar, usar, limpiar)
- **mlock** para evitar swap de memoria sensible a disco

## Anti-patterns

- ❌ Secretos en código o Git
- ❌ Secretos en env vars en claro (preferir archivos/mounts o secret managers)
- ❌ Mismo secreto en muchos lugares (rotar uno = rotar todos)
- ❌ Secretos sin rotación (de larga vida)
- ❌ Secretos en logs
- ❌ Secretos en imágenes de contenedor
- ❌ Kubernetes Secrets sin encryption at rest
- ❌ Credenciales de larga vida en CI (usar OIDC)
- ❌ Compartir secretos por chat/email
- ❌ Sin auditoría de acceso a secretos
- ❌ Sin detección de secretos expuestos (gitleaks)
- ❌ Certificados sin monitoreo de expiración

## Checklist protección de secretos

### Almacenamiento
- [ ] Secret manager desplegado (Vault/Secrets Manager/etc.)
- [ ] Cero secretos en código o Git
- [ ] gitleaks en pre-commit y CI
- [ ] Keys de cifrado en KMS/HSM
- [ ] Kubernetes Secrets con encryption at rest (o secret manager externo)

### Runtime
- [ ] Secretos inyectados en runtime (no hardcoded)
- [ ] Apps cargan de secret manager
- [ ] Contenedores: External Secrets Operator o Vault Agent
- [ ] CI/CD usa OIDC (no keys estáticas)

### Rotación
- [ ] Rotación automática donde posible
- [ ] Dynamic secrets para DBs (Vault)
- [ ] Proceso de rotación tras compromiso
- [ ] Certificados con auto-renovación

### Detección
- [ ] Audit logs de acceso a secretos
- [ ] Detección de secretos expuestos (scanning)
- [ ] Honeytokens desplegados
- [ ] Monitoreo de expiración de certificados
- [ ] Alertas de acceso anómalo a secret manager

### Acceso
- [ ] Least privilege a secretos
- [ ] Separación: datos vs keys
- [ ] LSASS/credential protection en endpoints
