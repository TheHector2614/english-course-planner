# Supply Chain Security

SBOM, firma, dependency scanning, SLSA. Defender contra dependencias y artefactos comprometidos.

**MITRE ATT&CK**: Supply Chain Compromise (T1195), Initial Access vía software comprometido.

## Principio: no confiar ciegamente en lo que importás

Tu software depende de cientos/miles de paquetes de terceros. Cada uno es un vector potencial. Ataques de supply chain (SolarWinds, Log4Shell, xz backdoor, dependency confusion) demuestran el riesgo.

## Tipos de ataque a supply chain

| Ataque | Qué | Defensa |
|---|---|---|
| **Dependencia comprometida** | Paquete legítimo hackeado | Pinning, scanning, SBOM |
| **Typosquatting** | Paquete malicioso con nombre similar | Verificar nombres, allowlisting |
| **Dependency confusion** | Paquete público suplanta uno interno | Scoped packages, registry config |
| **Malicious maintainer** | Mantenedor agrega backdoor | Review, signing, reproducibilidad |
| **Build system compromise** | CI/CD hackeado | Hardening de CI, SLSA |
| **Compromised artifacts** | Binario/imagen alterada | Firma, verificación |

## Dependency management

### Pinning (versiones exactas)

```json
// ❌ MAL: rangos permiten updates no controlados
"dependencies": {
  "lodash": "^4.17.0"
}

// ✅ MEJOR: versión exacta + lockfile
"dependencies": {
  "lodash": "4.17.21"
}
```

**Lockfiles** (commitear siempre — ver `git-workflows`):
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `Cargo.lock`, `poetry.lock`, `Pipfile.lock`, `go.sum`

Garantizan que todos instalan exactamente lo mismo.

### Verificar integridad

Lockfiles modernos incluyen hashes. Verifican que el paquete no cambió:

```json
// package-lock.json incluye integrity hashes
"lodash": {
  "version": "4.17.21",
  "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvA=="
}
```

```bash
# npm: verificar integridad
npm ci  # usa lockfile estrictamente, falla si no coincide

# Go: verificar checksums
go mod verify
```

## Vulnerability scanning de dependencias

Detectar dependencias con CVEs conocidos.

### Tools

```bash
# npm audit
npm audit
npm audit fix

# Trivy (multi-lenguaje, contenedores, IaC)
trivy fs .
trivy image myapp:1.0

# Grype (de Anchore)
grype dir:.
grype myapp:1.0

# OWASP Dependency-Check
dependency-check --scan ./ --format HTML

# Snyk
snyk test
snyk monitor

# pip-audit (Python)
pip-audit

# cargo audit (Rust)
cargo audit

# govulncheck (Go)
govulncheck ./...
```

### Automatización

- **Dependabot** / **Renovate**: PRs automáticos para updates (ver `git-workflows`)
- **CI scanning**: fallar build si hay CVE crítico
- **Continuous monitoring**: Snyk/Trivy monitorean post-deploy

```yaml
# CI: fallar si hay vulnerabilidad crítica
- name: Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: fs
    severity: CRITICAL,HIGH
    exit-code: 1   # falla el build
```

### Priorización

No todos los CVEs importan igual:
- **Exploitability**: ¿hay exploit público? (CISA KEV)
- **Reachability**: ¿tu código realmente usa la parte vulnerable?
- **Severity**: CVSS score
- **Context**: ¿expuesto a internet?

Tools como Snyk reachability analysis ayudan a priorizar lo que realmente importa.

## SBOM (Software Bill of Materials)

Inventario de todos los componentes de tu software. "Lista de ingredientes".

### Por qué

- Saber qué tenés (cuando sale un Log4Shell, ¿estás afectado?)
- Responder rápido a vulnerabilidades nuevas
- Compliance (regulaciones lo empiezan a requerir)
- Transparencia con clientes

### Formatos

- **SPDX** (Linux Foundation)
- **CycloneDX** (OWASP)

### Generar SBOM

```bash
# Syft (genera SBOM)
syft myapp:1.0 -o cyclonedx-json > sbom.json
syft dir:. -o spdx-json > sbom.spdx.json

# Trivy también genera SBOM
trivy image --format cyclonedx myapp:1.0 > sbom.json

# Docker (built-in)
docker sbom myapp:1.0
```

### Usar SBOM

```bash
# Escanear un SBOM contra vulnerabilidades
grype sbom:./sbom.json

# Cuando sale un CVE nuevo, buscar en tus SBOMs si estás afectado
```

Mantener SBOM por release, escanearlos continuamente contra nuevas vulnerabilidades.

## Firma y verificación de artefactos

Garantizar que un artefacto (imagen, binario, paquete) es auténtico y no fue alterado.

### Sigstore / Cosign (moderno, recomendado)

Firma keyless (OIDC, sin gestionar claves):

```bash
# Firmar imagen de contenedor
cosign sign myregistry/myapp:1.0

# Verificar
cosign verify myregistry/myapp:1.0 \
  --certificate-identity=ci@myorg.com \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# Firmar blobs
cosign sign-blob --output-signature app.sig app.bin
```

### Verificación en deploy

```yaml
# Kubernetes: admission controller que solo permite imágenes firmadas
# Kyverno / Sigstore policy-controller
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-signed-images
spec:
  rules:
    - name: verify-signature
      match:
        resources:
          kinds: [Pod]
      verifyImages:
        - imageReferences: ["myregistry/*"]
          attestors:
            - entries:
                - keyless:
                    subject: "ci@myorg.com"
                    issuer: "https://token.actions.githubusercontent.com"
```

Solo se ejecutan imágenes firmadas por tu CI. Una imagen maliciosa/alterada se rechaza.

## SLSA (Supply-chain Levels for Software Artifacts)

Framework para integridad de la cadena de build. Niveles de garantía:

| Nivel | Garantía |
|---|---|
| **SLSA 1** | Build documentado (provenance básica) |
| **SLSA 2** | Build con servicio + provenance firmada |
| **SLSA 3** | Build hardened, provenance no falsificable |
| **SLSA 4** | Máxima (revisión, builds reproducibles) |

### Provenance

Metadata firmada de cómo se construyó un artefacto:
- Qué código fuente (commit)
- Qué build system
- Qué dependencias
- Cuándo, por quién

```bash
# Generar provenance con SLSA GitHub generator
# Verificar provenance
slsa-verifier verify-artifact app.bin \
  --provenance-path app.intoto.jsonl \
  --source-uri github.com/myorg/myrepo
```

## Hardening del build system (CI/CD)

El CI/CD es objetivo de alto valor (acceso a código, secrets, deploy).

- **Least privilege**: el CI solo accede a lo necesario
- **OIDC** en lugar de credenciales estáticas (ver `secrets-protection.md`)
- **Ephemeral runners**: runners limpios por build (no persistentes con estado)
- **Pin de actions/dependencies del CI** (GitHub Actions a SHA, no tags movibles)
- **Aislar builds**: builds no confían entre sí
- **Audit del pipeline**: quién cambió qué
- **Branch protection** en el repo del pipeline

```yaml
# GitHub Actions: pin a SHA (no a tag movible)
# ❌ MAL: tag movible
- uses: actions/checkout@v4
# ✅ MEJOR: SHA pinned
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

## Dependency confusion / typosquatting

### Defensa

```bash
# npm: scoped packages internos
@myorg/internal-lib   # no confundible con público

# Configurar registry para scopes internos
# .npmrc
@myorg:registry=https://npm.internal.myorg.com
```

- **Verificar nombres** de paquetes antes de instalar (typos)
- **Scoped packages** para internos
- **Allowlisting** de paquetes/registries permitidos
- **Private registry** con proxy (Artifactory, Nexus) que controla qué se descarga

## Container base images

```dockerfile
# Imágenes base mínimas y confiables
# ❌ Imágenes random de Docker Hub
FROM randomuser/ubuntu-with-stuff

# ✅ Oficiales, mínimas, pinned por digest
FROM gcr.io/distroless/java17-debian12@sha256:abc123...
```

- Imágenes oficiales o verificadas
- Pin por digest (no solo tag)
- Mínimas (distroless, alpine)
- Escanear (Trivy)
- Actualizar regularmente

## Verificación de paquetes al instalar

```bash
# npm: scripts de instalación son vector de ataque
npm install --ignore-scripts   # no ejecutar postinstall scripts
# Revisar qué hacen los scripts de paquetes nuevos

# Python: preferir wheels verificados
pip install --require-hashes -r requirements.txt
```

## Checklist supply chain security

### Dependencias
- [ ] Lockfiles commiteados (versiones pinned)
- [ ] Integrity hashes verificados (`npm ci`, `go mod verify`)
- [ ] Vulnerability scanning en CI (Trivy/Snyk/etc.)
- [ ] Dependabot/Renovate para updates
- [ ] Build falla con CVE crítico
- [ ] Priorización por exploitability (CISA KEV)
- [ ] Scoped packages para internos (anti-confusion)
- [ ] Private registry proxy (control de descargas)

### SBOM
- [ ] SBOM generado por release (Syft/Trivy)
- [ ] SBOM escaneado continuamente contra nuevos CVEs
- [ ] SBOM archivado por versión

### Firma
- [ ] Artefactos firmados (Cosign/Sigstore)
- [ ] Verificación en deploy (admission controller)
- [ ] Solo imágenes firmadas se ejecutan (k8s)

### Build system
- [ ] CI con least privilege
- [ ] OIDC (no keys estáticas)
- [ ] Ephemeral runners
- [ ] Actions pinned a SHA
- [ ] SLSA provenance (al menos nivel 2-3)
- [ ] Branch protection en repos de pipeline

### Contenedores
- [ ] Base images oficiales/mínimas
- [ ] Pin por digest
- [ ] Scanning de imágenes
- [ ] Actualización regular de bases
