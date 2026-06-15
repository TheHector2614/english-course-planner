# README Templates

Plantillas por tipo de proyecto. Adaptar según el caso.

## Principios

1. **Un README sirve para 3 lectores**:
   - **Usuario**: ¿qué es? ¿lo necesito? ¿cómo lo uso?
   - **Contribuidor**: ¿cómo lo desarrollo / contribuyo?
   - **Maintainer futuro (yo mismo en 6 meses)**: ¿cómo lo opero?

2. **Estructura "embudo"**: lo más importante arriba (one-liner, install/run). Detalles cada vez más específicos abajo.

3. **Linkear, no cargar**: README no debe ser una enciclopedia. Linkear a docs específicos.

4. **Mantenible**: cada sección debe poder verificarse o actualizarse.

## Template: Aplicación / Servicio

```markdown
# Project Name

> One-liner: qué hace el proyecto en una frase clara.

![Build](badge) ![Coverage](badge) ![License](badge)

## What it does

Párrafo de 2-4 líneas explicando:
- Qué hace
- Para quién es
- Por qué existe (problema que resuelve)

## Architecture

(Diagrama Mermaid breve o link a docs/architecture.md)

\`\`\`mermaid
graph LR
    Client --> API
    API --> DB[(PostgreSQL)]
    API --> Cache[(Redis)]
\`\`\`

## Quick Start

Para correr localmente:

\`\`\`bash
# Pre-requisitos: Docker, Node.js 20+
git clone <repo>
cd <project>
cp .env.example .env
docker compose up -d
npm install
npm run dev
\`\`\`

App disponible en http://localhost:3000.

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js 20, Express
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Deploy**: AWS ECS Fargate

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)
- [Runbook](docs/runbook.md)

## Contributing

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

- Issues: [GitHub Issues](repo/issues)
- Slack: #project-support

## License

[MIT](LICENSE) © 2026 Company
```

## Template: Librería / SDK

```markdown
# @company/lib-name

> One-liner describiendo qué hace la librería.

[![npm version](badge)](npm-link) [![License](badge)](LICENSE)

## Installation

\`\`\`bash
npm install @company/lib-name
\`\`\`

\`\`\`bash
yarn add @company/lib-name
\`\`\`

\`\`\`bash
pnpm add @company/lib-name
\`\`\`

## Usage

\`\`\`typescript
import { Client } from '@company/lib-name';

const client = new Client({ apiKey: process.env.API_KEY });

const result = await client.doSomething({ input: 'value' });
console.log(result);
\`\`\`

## Features

- Feature 1 — breve descripción
- Feature 2 — breve descripción
- Feature 3 — breve descripción

## API

Ver [API Reference](https://docs.example.com/api).

### Quick reference

#### `new Client(options)`

Crea una instancia del cliente.

| Option | Type | Description |
|---|---|---|
| `apiKey` | `string` | Required. API key |
| `baseUrl` | `string` | Optional. Default: `https://api.example.com` |
| `timeout` | `number` | Optional. Default: `30000` ms |

#### `client.doSomething(params)`

[breve descripción]

## Examples

Ejemplos completos en [`examples/`](examples/):
- [Basic usage](examples/basic.ts)
- [Advanced usage](examples/advanced.ts)
- [Error handling](examples/errors.ts)

## Compatibility

- Node.js 18+
- Modern browsers (Chrome 100+, Firefox 100+, Safari 15+)
- TypeScript 5.0+

## Versioning

Esta librería sigue [Semantic Versioning](https://semver.org/).
Ver [CHANGELOG](CHANGELOG.md).

## Contributing

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
```

## Template: CLI Tool

```markdown
# tool-name

> One-liner describiendo qué hace el CLI.

[![License](badge)](LICENSE) [![npm](badge)](npm)

## Installation

\`\`\`bash
# Homebrew (macOS)
brew install tool-name

# npm
npm install -g tool-name

# Binary
curl -fsSL https://example.com/install.sh | sh
\`\`\`

Verifica:
\`\`\`bash
tool-name --version
\`\`\`

## Usage

\`\`\`bash
# Comando básico
tool-name <command> [options]

# Ejemplo más común
tool-name init my-project
cd my-project
tool-name build
\`\`\`

## Commands

| Command | Description |
|---|---|
| `init <name>` | Inicializa un proyecto nuevo |
| `build` | Construye el proyecto |
| `deploy` | Despliega al entorno configurado |
| `config <key> <value>` | Modifica configuración |

Ver `tool-name <command> --help` para detalles.

## Configuration

Configuración en `~/.tool-name/config.yaml`:

\`\`\`yaml
default_env: production
api_url: https://api.example.com
\`\`\`

O vía variables de entorno:
- `TOOL_API_URL`
- `TOOL_API_KEY`

## Examples

### Use case 1

\`\`\`bash
<comando completo con explicación>
\`\`\`

### Use case 2

\`\`\`bash
<comando>
\`\`\`

## Documentation

Documentación completa en https://docs.example.com.

## Support

- Issues: [GitHub Issues](repo/issues)
- Discussions: [GitHub Discussions](repo/discussions)

## License

[MIT](LICENSE)
```

## Template: Microservicio interno

```markdown
# service-name

> One-liner del servicio.

**Owner**: @team-name (Slack: #team-channel)
**On-call**: Ver [runbook](docs/runbook.md)

## Purpose

Qué hace este servicio y por qué existe. 1-2 párrafos.

## Architecture

\`\`\`mermaid
graph LR
    Caller -->|HTTP| API
    API --> DB[(PostgreSQL)]
    API -->|publishes| Events[(Kafka)]
\`\`\`

Detalles en [docs/architecture.md](docs/architecture.md).

## API

- **Internal**: see [API docs](docs/api.md)
- **OpenAPI spec**: [openapi.yaml](docs/openapi.yaml)
- **Swagger UI**: https://internal-docs.example.com/services/service-name

## Local Development

### Pre-requisites

- Docker
- Go 1.22+ (o el stack del servicio)
- `make`

### Setup

\`\`\`bash
git clone <repo>
cd service-name
cp .env.example .env
make up      # docker compose up dependencies
make test    # run tests
make run     # run service locally
\`\`\`

Servicio disponible en http://localhost:8080.
Health: http://localhost:8080/healthz

### Common tasks

\`\`\`bash
make test           # tests
make lint           # linter
make migration      # nueva migración DB
make seed           # data de prueba
\`\`\`

## Deployment

CI/CD automático desde `main`:
- Push a `main` → deploy a staging
- Tag `v*` → deploy a production (requires approval)

Ver [docs/deployment.md](docs/deployment.md) para detalles.

## Observability

- **Logs**: Datadog "service:service-name"
- **Metrics**: Datadog dashboard
- **Traces**: Datadog APM
- **Alerts**: PagerDuty service

## Runbook

Ver [docs/runbook.md](docs/runbook.md):
- Cómo restart
- Common issues
- Escalation

## Related

- Documentación de equipo: [Confluence link]
- Servicios relacionados: service-foo, service-bar
- Repositorios relacionados: [link]
```

## Template: Open Source Library Público

```markdown
# library-name

> One-liner.

[![CI](badge)](ci) [![npm](badge)](npm) [![License](badge)](LICENSE) [![Discord](badge)](discord)

🌟 **Features highlights**:
- ⚡ Feature 1
- 🔒 Feature 2
- 🌍 Feature 3

## Quick Start

\`\`\`bash
npm install library-name
\`\`\`

\`\`\`typescript
import { thing } from 'library-name';

thing('Hello, World!');
\`\`\`

## Documentation

📖 **Full docs**: https://docs.example.com

- [Tutorial: Getting Started](https://docs.example.com/tutorial)
- [How-to Guides](https://docs.example.com/how-to)
- [API Reference](https://docs.example.com/reference)
- [Examples](examples/)

## Community

- [Discord](https://discord.gg/...)
- [GitHub Discussions](https://github.com/.../discussions)
- [Twitter/X](@library-name)

## Contributing

Contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md).

Maintainers:
- [@user1](https://github.com/user1)
- [@user2](https://github.com/user2)

## Sponsors

[Sponsor logo] [Sponsor logo]

[Become a sponsor](sponsors-link)

## License

[MIT](LICENSE) © 2026 Authors
```

## Template: Monorepo

```markdown
# project-name

> Monorepo for [breve descripción].

## Structure

\`\`\`
.
├── apps/
│   ├── web/           # Frontend (Next.js)
│   └── api/           # Backend (NestJS)
├── packages/
│   ├── shared/        # Shared types and utils
│   ├── ui/            # UI components
│   └── config/        # Shared configs
├── docs/              # Documentation
└── scripts/           # Build/deploy scripts
\`\`\`

## Quick Start

\`\`\`bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Run all dev servers
pnpm dev

# Or run a specific app
pnpm --filter web dev
pnpm --filter api dev
\`\`\`

## Workspaces

| Package | Description | Docs |
|---|---|---|
| `apps/web` | Next.js frontend | [README](apps/web/README.md) |
| `apps/api` | NestJS backend | [README](apps/api/README.md) |
| `packages/shared` | Shared types | [README](packages/shared/README.md) |

## Common Tasks

\`\`\`bash
pnpm build      # build all
pnpm test       # test all
pnpm lint       # lint all
pnpm clean      # clean all artifacts
\`\`\`

## Architecture

Ver [docs/architecture.md](docs/architecture.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Contributing](CONTRIBUTING.md)
- Each app/package has its own README

## License

[MIT](LICENSE)
```

## Reglas universales

### One-liner crítico

Primera frase del README es la **más importante**. Debe contestar "¿qué es esto?" en un vistazo.

- ❌ "This project is a comprehensive solution that..."
- ✅ "Lightweight HTTP client for Node.js with built-in retry and circuit breaker."

### Quick Start funcional

Si tu Quick Start falla, perdés al usuario. Verificar regularmente:
- Comandos copy-pasteables
- Pre-requisitos claros
- Resultado esperado descrito

### Badges con propósito

Solo agregar badges que comuniquen algo útil:
- ✅ CI status (current state)
- ✅ npm version (última versión)
- ✅ License
- ✅ Code coverage
- ❌ "Made with ❤️"
- ❌ Visitor counter
- ❌ 20 badges decorativos

### Sección "Why"

A veces falta. Especialmente si hay competencia:
- ¿Por qué este, no otro?
- ¿Qué problema único resuelve?

### Tabla de contenidos

Para READMEs largos (>200 líneas). Generable automáticamente con herramientas (markdown-toc, etc.).

### Screenshots / demos

- Para CLIs visuales: GIF demostrativo
- Para UIs: screenshot principal
- Mantener < 1 MB
- Texto alternativo descriptivo

### Mantener corto

Si tu README pasa de 500 líneas, dividir:
- Quick start en README
- Detalles en `/docs/`
- Linkear ambos lados

## Checklist final de README

- [ ] One-liner claro al inicio
- [ ] Quick Start verificable
- [ ] Pre-requisitos explícitos
- [ ] Sección de uso/ejemplos
- [ ] Links a docs detalladas
- [ ] License declarada
- [ ] Owner / maintainer claro (para internos)
- [ ] CI/CD badge si aplica
- [ ] Sin TODO/FIXME visibles
- [ ] Sin secrets ni IPs internas
- [ ] Funciona el quick start (testeado)
- [ ] Links no rotos
