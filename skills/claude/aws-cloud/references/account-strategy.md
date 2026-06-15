# Estrategia de Cuentas AWS

Cuándo usar una cuenta vs varias vs AWS Organizations.

## Decisión rápida

| Situación | Recomendación |
|---|---|
| Aprendiendo / hobby / primer proyecto | **1 cuenta** |
| Side project / freelance / MVP | **1 cuenta** con tags por proyecto |
| Producto en producción con clientes | **2 cuentas**: `dev` + `prod` |
| Equipo de 2-5 devs / clientes corporativos | **3 cuentas**: `dev` + `staging` + `prod` |
| Empresa / multi-team | **AWS Organizations** con OUs |
| Múltiples productos independientes | **Organizations** con cuenta por producto |

## Por qué separar cuentas

### Ventajas

1. **Aislamiento de blast radius**: un error/breach en dev no afecta prod
2. **Límites de servicio independientes**: cuota agotada en dev no afecta prod
3. **Facturación separada**: claro qué cuesta cada environment
4. **IAM más limpio**: permisos diferentes naturales por cuenta
5. **Compliance**: requisitos diferentes para prod
6. **Acceso granular**: dev puede tener acceso permisivo, prod restringido
7. **Recuperación más fácil**: si una cuenta es comprometida, las otras siguen
8. **Resource limits**: AWS aplica cuotas por cuenta, no por VPC

### Desventajas

1. **Más complejidad operativa**: cross-account roles, IaC entre cuentas
2. **Configuración duplicada**: cada cuenta necesita CloudTrail, GuardDuty, etc.
3. **Networking complejo**: si necesitas que se hablen, peering/Transit Gateway
4. **Costos extra**: algunos servicios cuestan por cuenta

## Patrón "1 cuenta" — cuándo y cómo

### Cuándo

- Aprendiendo AWS
- Proyecto personal sin clientes reales
- Prototipo que vas a destruir
- Side project chico

### Cómo

Separación lógica con:
- **Tags** consistentes: `Environment=dev|prod`, `Project=mi-app`
- **Prefijos** en nombres: `dev-mi-app-bucket`, `prod-mi-app-bucket`
- **IAM policies** que limitan por tag
- **Billing alarms** generales

### Limitaciones

- Imposible aislamiento real entre "dev" y "prod"
- Si un script borra todo en la cuenta, se va todo
- IAM se complica rápido con muchos recursos

## Patrón "2 cuentas: dev + prod"

### Cuándo

- Tienes algo en producción que genera ingresos
- Has tenido "ups" en dev que casi tocan prod
- Quieres dormir tranquilo

### Cómo

**Cuenta dev**: experimentación libre, permisos amplios al equipo
**Cuenta prod**: solo deploys vía CI/CD, MFA obligatorio para acceso humano

Cross-account access:
- Tu usuario en `dev`
- Asume rol en `prod` cuando necesitas (con MFA)
- CI/CD del repo tiene roles separados por cuenta

```
GitHub repo
├── deploy a dev → AssumeRole en cuenta dev
└── deploy a prod → AssumeRole en cuenta prod (requiere approval manual)
```

## Patrón "3 cuentas: dev + staging + prod"

Igual que el anterior pero con `staging` (también llamado `qa` o `pre-prod`):
- Espejo de prod para tests finales
- Mismas configuraciones que prod
- Datos de prueba (no datos reales)

Útil cuando hay QA team o smoke tests pre-prod.

## AWS Organizations

### Qué es

Servicio para gestionar **múltiples cuentas** desde una cuenta "management" (antes "master").

Beneficios:
- **Billing consolidado** (una factura, múltiples cuentas)
- **Volume discounts** acumulados (más volumen = más descuento RIs/Savings Plans)
- **Service Control Policies (SCPs)**: políticas que aplican a cuentas hijas
- **Cross-account IAM** simplificado (con IAM Identity Center)
- **Centralized logging/security** (CloudTrail, GuardDuty, Config)
- **Account Factory**: crear cuentas nuevas automatizado

### Estructura recomendada (Landing Zone básica)

```
Root (management account)
├── Security OU
│   ├── Log Archive (cuenta solo para logs)
│   └── Audit (cuenta read-only para auditores)
├── Workloads OU
│   ├── Dev OU
│   │   └── dev-cuenta
│   ├── Staging OU
│   │   └── staging-cuenta
│   └── Prod OU
│       └── prod-cuenta
├── Sandbox OU
│   └── sandbox-{persona} (cuentas de prueba personal)
└── Suspended OU (para cuentas a cerrar)
```

### Cuándo usar Organizations

- **Equipo de 3+ devs**: separación por persona o equipo
- **Múltiples productos**: cuenta por producto
- **Compliance**: requisitos de aislamiento estricto
- **Más de $1000/mes de gasto**: volume discounts justifican el setup
- **Necesitas Control Tower**: feature de AWS para Landing Zones automatizadas

### Cuándo NO usar Organizations

- Estás aprendiendo (curva de aprendizaje empinada)
- Es un proyecto chico (overhead injustificado)
- No tienes plan claro de governance

## AWS Control Tower vs Organizations manual

**Control Tower** es un servicio que automatiza la creación de una Landing Zone (Organizations + IAM Identity Center + guardrails + logging centralizado).

Pros:
- Setup en horas vs semanas
- Best practices aplicadas
- Guardrails preventivos y detectivos

Cons:
- Opinionado (su estructura puede no calzar con la tuya)
- Algunos costos extra (Config, CloudTrail en cuentas extra)
- Migrar de Organizations manual a Control Tower es complejo

**Recomendación**: si vas a Organizations desde cero y tu setup es estándar, usa Control Tower. Si necesitas control fino o ya tienes una estructura, Organizations manual.

## Cross-account access patterns

### Patrón 1: AssumeRole desde cuenta personal

Tu usuario está en cuenta `dev`, asumes rol en `prod` cuando necesitas:

```bash
# Configurar profile
aws configure set role_arn arn:aws:iam::PROD_ACCOUNT_ID:role/AdminRole --profile prod
aws configure set source_profile default --profile prod
aws configure set mfa_serial arn:aws:iam::DEV_ACCOUNT_ID:mfa/tu-usuario --profile prod

# Usar
aws s3 ls --profile prod
```

### Patrón 2: IAM Identity Center (recomendado para equipos)

Sucesor de AWS SSO. Usuarios federados con permission sets por cuenta.

Beneficios:
- Login único (Okta, Google Workspace, etc.)
- MFA centralizado
- Sin IAM users en cada cuenta
- Auditoría centralizada

Setup: requiere Organizations.

### Patrón 3: CI/CD con OIDC

GitHub Actions, GitLab CI asumen rol vía OIDC sin keys:

```yaml
# .github/workflows/deploy.yml
permissions:
  id-token: write    # para OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::PROD_ACCOUNT:role/GitHubDeployRole
      aws-region: us-east-2
```

El rol confía en GitHub OIDC. Ver `cicd-patterns.md`.

## Setup inicial recomendado (primera cuenta)

Sin importar si usarás 1 o múltiples cuentas, al crear la primera cuenta hacer **en este orden**:

1. **Habilitar MFA en root** (lo primero, hardware key o app TOTP)
2. **Crear usuario IAM admin** para uso diario (no usar root excepto para cosas que solo root puede)
3. **Guardar root credentials** en gestor de passwords offline (no usar excepto emergencia)
4. **Habilitar CloudTrail** (audit logs)
5. **Habilitar billing alerts**: alarma a $X de gasto
6. **Tagging policy** definida
7. **Bloquear acceso público a S3** a nivel cuenta
8. **Verificar región default** correcta
9. **Eliminar VPC default** si no la usas, o entender que está ahí
10. **Habilitar GuardDuty** (deteccion de threats; primeros 30 días gratis)

## Migración: cómo pasar de 1 a múltiples cuentas

Si empezaste con 1 cuenta y quieres separar:

### Estrategia 1: Crear nueva cuenta para nuevos workloads
- Crear cuenta `prod` nueva
- Nuevos proyectos van directo allí
- Proyectos viejos quedan en la original (que pasa a ser `dev`)

### Estrategia 2: Migrar workload por workload
- Crear cuenta destino
- Replicar infra con IaC
- Migrar datos (S3 sync, RDS snapshot/restore cross-account)
- Switch DNS
- Destruir en cuenta origen

### Estrategia 3: Crear cuenta limpia y mover lo importante
- Cuenta nueva con todas las best practices
- Migrar solo lo que está en producción
- Dejar morir lo viejo

Generalmente la 1 es la más realista. La 3 es la más limpia si tienes tiempo.

## Mi recomendación para ti (principiante)

**Etapa 1 (ahora)**: Una sola cuenta AWS personal
- Habilitar MFA en root
- Crear usuario IAM admin con MFA
- Habilitar billing alerts en $20-50
- Tags consistentes en todo lo que crees
- Free tier para experimentar

**Etapa 2 (cuando tengas algo real desplegado)**: Crear segunda cuenta `prod`
- Trasladar lo de producción
- Tu cuenta original pasa a ser `dev`
- Setup de AssumeRole

**Etapa 3 (cuando tengas equipo o varios proyectos)**: AWS Organizations
- Considera Control Tower
- IAM Identity Center
- OUs por environment

**No saltes etapas.** Cada una tiene complejidad que necesitas entender antes de pasar a la siguiente.

## Trampas comunes

- **Confundir cuenta root con cuenta management**: la cuenta de Organizations debe usarse SOLO para Organizations, no para workloads
- **Resetear MFA del root con email comprometido**: catastrófico. Proteger el email del root account
- **No habilitar CloudTrail desde día 1**: pierdes audit trail para siempre
- **Borrar Default VPC sin saber**: rompe Lambda y otros servicios. Si la vas a borrar, hazlo intencionalmente
- **Múltiples cuentas sin Organizations**: pierdes billing consolidado y volume discounts
- **Olvidar el `account-id`**: 12 dígitos, lo necesitas para ARNs y cross-account. Anótalo o consíguelo con `aws sts get-caller-identity`
