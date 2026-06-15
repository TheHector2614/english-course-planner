# Signed Commits

GPG, SSH, Sigstore. Cuándo y cómo configurar firma de commits.

## Por qué firmar commits

Por default, Git permite que cualquiera ponga **cualquier nombre y email** en author/committer. Sin firma, no podés verificar quién hizo realmente un commit.

### Casos donde importa

- ✅ Open source (impersonation evita)
- ✅ Proyectos con compliance (auditoría)
- ✅ Software con riesgo (supply chain attacks)
- ✅ Empresas reguladas (SOC 2, ISO 27001)
- ✅ Cualquier proyecto que tome PRs externas

### Ataques que previene

- **Spoofing**: alguien commitea con tu email
- **Repo compromise**: commits maliciosos firmados como maintainer legítimo
- **Force push attacks**: re-escribir historia haciéndose pasar por otro

## Opciones

### 1. GPG (tradicional)

Funciona en todas partes. Más complejo de gestionar (keys, expiración, revocación).

### 2. SSH (Git 2.34+)

Reutiliza tu key SSH existente. Más simple. **Recomendado por defecto.**

### 3. Sigstore / gitsign (moderno)

OIDC-based. No gestionás keys (las efímeras se generan al firmar y se descartan). Transparency log público. Más nuevo, menos universal.

## Setup GPG

### Generar key

```bash
# Generar
gpg --full-generate-key

# Tipo: (1) RSA and RSA
# Bits: 4096
# Expira: 2y (recomendado, renovable)
# Nombre, email (mismo que git config)
# Passphrase fuerte
```

Listar keys:
```bash
gpg --list-secret-keys --keyid-format=long
```

Output:
```
sec   rsa4096/3AA5C34371567BD2 2026-05-21 [SC]
      ABC123DEF456789...
uid                 [ultimate] Tu Nombre <tu@email.com>
ssb   rsa4096/4BB6D45482678CE3 2026-05-21 [E]
```

El ID a usar es `3AA5C34371567BD2`.

### Configurar Git

```bash
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
git config --global tag.gpgsign true
git config --global gpg.program gpg
```

### Exportar pubkey y subir a GitHub/GitLab/etc.

```bash
gpg --armor --export 3AA5C34371567BD2
```

Copiar todo (con `-----BEGIN PGP PUBLIC KEY BLOCK-----`) y subir en:

- **GitHub**: Settings → SSH and GPG keys → New GPG key
- **GitLab**: Preferences → GPG Keys
- **Bitbucket**: Personal settings → GPG keys
- **Azure DevOps**: Settings → User → GPG public keys

### Test

```bash
git commit -m "test: signed commit"
git log --show-signature -1
```

Output debería incluir:
```
gpg: Signature made ...
gpg: Good signature from "Tu Nombre <tu@email.com>"
```

### Troubleshooting GPG

**Error: "gpg failed to sign the data"**

```bash
# Asegurar GPG_TTY (para macOS/Linux)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
source ~/.bashrc

# Configurar pinentry
git config --global gpg.program $(which gpg)
```

**macOS**:
```bash
brew install gnupg pinentry-mac
echo "pinentry-program $(which pinentry-mac)" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

**Windows**: usar Gpg4win.

## Setup SSH signing (recomendado)

Más simple. Funciona desde Git 2.34+.

### Verificar versión

```bash
git --version
# Necesitas >= 2.34
```

### Generar key (si no tenés ya)

```bash
ssh-keygen -t ed25519 -C "tu@email.com" -f ~/.ssh/git_signing_key
```

### Configurar Git

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/git_signing_key.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

### Subir pubkey

Contenido:
```bash
cat ~/.ssh/git_signing_key.pub
```

Subir como **signing key** (no authentication key):

- **GitHub**: Settings → SSH and GPG keys → New SSH key → Key type: **Signing Key**
- **GitLab**: Preferences → SSH Keys → Usage type: **Signing**
- **Bitbucket**: similar
- **Azure DevOps**: no soporta SSH signing aún, usar GPG

### Configurar `allowed_signers` para verificar localmente

```bash
mkdir -p ~/.config/git
echo "tu@email.com $(cat ~/.ssh/git_signing_key.pub)" > ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

### Test

```bash
git commit -m "test: signed commit"
git log --show-signature -1
```

Output:
```
Good "git" signature for tu@email.com with ED25519 key SHA256:...
```

## Setup Sigstore / gitsign

OIDC-based: firmás con tu identidad (Google, GitHub, Microsoft OIDC), no con keys persistentes.

### Instalación

```bash
# macOS
brew install sigstore/tap/gitsign

# Linux
curl -O -L https://github.com/sigstore/gitsign/releases/latest/download/gitsign_linux_amd64
chmod +x gitsign_linux_amd64
sudo mv gitsign_linux_amd64 /usr/local/bin/gitsign
```

### Configurar Git

```bash
git config --global commit.gpgsign true
git config --global tag.gpgsign true
git config --global gpg.x509.program gitsign
git config --global gpg.format x509
```

### Primer commit firmado

```bash
git commit -m "test: sigstore signed commit"
# Abre browser para auth (Google, GitHub, etc.)
# Firma con identity efímera
```

Verificación: https://search.sigstore.dev (transparency log público).

### Cuándo Sigstore

✅ No querés gestionar keys
✅ OK con auth interactiva al firmar
✅ Querés transparency log público
❌ Air-gapped environments
❌ Sin acceso a OIDC providers

## Verificar commits firmados

```bash
# Ver firma del último commit
git log --show-signature -1

# Solo commits firmados en log
git log --pretty="format:%h %G? %s"
# G = good, B = bad, U = unknown, N = none
```

`%G?` valores:
- `G`: good (válido y trusted)
- `B`: bad (firma inválida)
- `U`: untrusted (válida pero key no trusted)
- `N`: no signature
- `E`: error
- `X`: expired key
- `Y`: expired signature
- `R`: revoked key

## Branch protection: requerir signed commits

### GitHub

Settings → Branches → Branch protection rule → **Require signed commits**

Si activado: PRs con commits sin firmar son rechazados.

### GitLab

Settings → Repository → Push Rules → **Reject unsigned commits**

### Bitbucket

Branch permissions → **Require signed commits** (en planes Premium).

### Azure DevOps

Branch Policies → **Require commits to be signed** (con extension o build validation).

## Política recomendada

| Contexto | Política |
|---|---|
| Open source público | SSH signing obligatorio en mainline |
| SaaS empresa | SSH signing obligatorio |
| Compliance (SOC2, ISO 27001) | GPG con keys gestionadas + audit |
| Proyectos críticos / financial | GPG con hardware token (YubiKey) |
| Proyecto personal | Opcional |

## Hardware-backed signing (extra seguridad)

Para máxima seguridad, key en hardware (no extraíble):

### YubiKey

GPG en YubiKey:
```bash
gpg --edit-key <key-id>
gpg> keytocard
# Selecciona slot
```

Cada firma requiere YubiKey física + touch.

### Smartcard

Similar, otras opciones de hardware (Nitrokey, OnlyKey).

## Auditar firma del repo

Script para verificar todos los commits:

```bash
#!/usr/bin/env bash
# verify-signed-commits.sh

unsigned=$(git log --pretty='format:%H %G?' main | grep -v ' G$' | wc -l)
if [ "$unsigned" -gt 0 ]; then
  echo "Found $unsigned unsigned/invalid commits in main"
  git log --pretty='format:%H %G? %s' main | grep -v ' G '
  exit 1
fi
echo "All commits in main are signed"
```

## Rotation y revocación

### GPG: keys que expiran

Renovar antes de expirar:
```bash
gpg --edit-key <key-id>
gpg> expire
# Nuevo periodo
gpg> save
```

Re-subir pubkey actualizada.

### SSH: cambiar key

1. Generar nueva key
2. Configurar Git con nueva
3. Subir nueva a GitHub/GitLab/etc.
4. Eliminar vieja
5. Commits viejos siguen verificados (la pubkey vieja está en historial)

### Sigstore: nada que rotar

Identidades efímeras, no hay keys persistentes.

## Trampas comunes

- ❌ Generar key sin passphrase (compromiso = acceso)
- ❌ Email del key != email de git config (commits aparecen como "unverified")
- ❌ Pubkey no subida al provider (verifications fallan)
- ❌ Subir SSH key como "Authentication" en GitHub cuando necesitás "Signing"
- ❌ Olvidar pinentry config (signing falla en terminal)
- ❌ Force push hace que firmas previas "queden huérfanas" si re-escribís historia
- ❌ Aceptar PRs con commits unsigned cuando branch protection lo requiere
- ❌ Compartir keys entre devs (cada uno la suya)
- ❌ Backup de private key sin encryption (defeats el propósito)

## CI: enforce signed commits

GitHub Actions ejemplo:

```yaml
name: Verify commits signed

on:
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Verify signed commits
        run: |
          unsigned=$(git log --pretty='format:%H %G?' origin/main..HEAD | grep -v ' G$' || true)
          if [ -n "$unsigned" ]; then
            echo "❌ Unsigned commits found:"
            git log --pretty='format:%H %G? %s' origin/main..HEAD
            exit 1
          fi
          echo "✅ All commits are signed"
```

## Recomendación final

**Para casi todos los casos: SSH signing**.

- Simple
- Reutiliza key existente
- Soporte en major providers (GitHub, GitLab, etc.)
- Sin overhead operativo

Solo elegir GPG si:
- Necesitás compliance que lo requiere explícitamente
- Hardware token con GPG-only support

Solo elegir Sigstore si:
- Querés OIDC-based (sin gestión de keys)
- Transparency log público te suma
- Equipo ya familiarizado con Sigstore ecosystem

## Checklist signing

- [ ] Decisión: GPG, SSH, o Sigstore
- [ ] Key generada con passphrase fuerte
- [ ] Email del key = email de git config
- [ ] Pubkey subida al provider como **signing key**
- [ ] `commit.gpgsign = true` global
- [ ] `tag.gpgsign = true` global
- [ ] Test: primer commit firmado verifica con `git log --show-signature`
- [ ] Branch protection requiere signed commits
- [ ] CI valida signed commits en PRs
- [ ] Backup seguro de private key (encrypted)
- [ ] Documentación de setup en CONTRIBUTING.md
- [ ] Para empresa: política de rotación y revocación
