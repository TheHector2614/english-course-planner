# Docker

Dockerfiles óptimos, multi-stage, layers, registries, Compose. Empaquetado de aplicaciones.

**Nota**: para seguridad de contenedores (non-root, capabilities, escaneo, firma) ver `cybersecurity-defense` (`container-k8s-security.md`). Aquí: construcción y operación.

## Principios de buenas imágenes

1. **Mínimas**: menos capas, menos tamaño, menos superficie
2. **Multi-stage**: separar build de runtime
3. **Reproducibles**: pin de versiones, layers determinísticos
4. **Cacheables**: ordenar para aprovechar build cache
5. **Una responsabilidad**: un proceso principal por contenedor

## Dockerfile: anatomía

```dockerfile
# Imagen base con tag específico (no latest)
FROM node:20.11-slim

# Metadata
LABEL org.opencontainers.image.source="https://github.com/org/repo"

# Variables de build
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Directorio de trabajo
WORKDIR /app

# Copiar deps primero (mejor cache)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código (cambia más seguido, va después)
COPY . .

# Usuario non-root (ver cybersecurity-defense para detalle)
USER node

# Puerto documentado
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando
CMD ["node", "server.js"]
```

## Multi-stage builds (esencial)

Separa el entorno de build (con compiladores, dev deps) del runtime (mínimo).

### Node.js / TypeScript

```dockerfile
# Stage 1: build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production deps
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 3: runtime (mínimo)
FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER nonroot
EXPOSE 3000
CMD ["dist/server.js"]
```

Resultado: imagen final sin npm, sin source, sin dev deps. De ~1GB a ~150MB.

### Go (compilado, imagen ultra-mínima)

```dockerfile
# Build
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# Runtime (scratch o distroless)
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

Go compilado estáticamente → imagen de ~10MB con distroless static.

### Python

```dockerfile
# Build
FROM python:3.12-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime
FROM python:3.12-slim
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY . .
RUN useradd -m appuser
USER appuser
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
```

### Java (Spring Boot)

```dockerfile
# Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN useradd -m appuser
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Para Java, considerar también jlink/jib para imágenes optimizadas. Ver skill `java-backend`.

## Layer caching (builds rápidos)

Docker cachea layers. Ordenar de **menos a más cambiante**:

```dockerfile
# ✅ BIEN: deps primero (cambian poco), código después (cambia mucho)
COPY package*.json ./
RUN npm ci                  # cacheado si package.json no cambió
COPY . .                    # solo este layer se reconstruye al cambiar código

# ❌ MAL: todo junto
COPY . .
RUN npm ci                  # se reinstala TODO en cada cambio de código
```

### Reglas de cache

- Instrucciones que cambian poco → arriba
- Código fuente → abajo
- Combinar `RUN` relacionados (menos layers)
- `--no-cache-dir`, limpiar en el mismo RUN

```dockerfile
# Combinar y limpiar en un layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*
```

## .dockerignore

Excluir lo que no debe ir a la imagen (acelera build, reduce tamaño, evita secrets):

```
# .dockerignore
.git
.gitignore
node_modules
npm-debug.log
.env
.env.*
*.md
.vscode
.idea
dist
coverage
.dockerignore
Dockerfile
docker-compose*.yml
**/*.test.js
.github
```

⚠️ Crucial: excluir `.env`, `.git`, secrets (ver `cybersecurity-defense`).

## BuildKit (builds modernos)

```bash
# Habilitar BuildKit (default en Docker moderno)
export DOCKER_BUILDKIT=1

# Build con cache mount (no reinstala deps cada vez)
docker build --tag myapp:1.0 .
```

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
# Cache mount: persiste node_modules entre builds
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
```

Secrets en build (no quedan en la imagen):
```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```
```bash
docker build --secret id=npmrc,src=$HOME/.npmrc .
```

## Tags y versionado

```bash
# ❌ MAL: latest (no determinístico)
docker build -t myapp:latest .

# ✅ BIEN: versión semántica + git SHA
docker build -t myapp:1.2.3 -t myapp:1.2 -t myapp:$(git rev-parse --short HEAD) .
```

Estrategia de tags:
- `1.2.3` — versión exacta (inmutable, para producción)
- `1.2` — última patch de minor
- `1` — última minor de major
- `sha-abc1234` — commit específico
- `latest` — solo para dev/conveniencia, NUNCA en prod

## Registries

```bash
# Login
docker login registry.example.com
docker login ghcr.io        # GitHub Container Registry
docker login           # Docker Hub

# Tag para registry
docker tag myapp:1.2.3 ghcr.io/org/myapp:1.2.3

# Push
docker push ghcr.io/org/myapp:1.2.3

# Pull
docker pull ghcr.io/org/myapp:1.2.3
```

Registries comunes:
- **Docker Hub**: público/privado
- **GitHub Container Registry (ghcr.io)**: integrado con GitHub
- **GitLab Container Registry**: integrado con GitLab
- **Amazon ECR**, **Google Artifact Registry**, **Azure ACR**: cloud-native
- **Harbor**: self-hosted con scanning

Para firma y escaneo de imágenes → `cybersecurity-defense` (`supply-chain-security.md`).

## Docker Compose

Orquestar múltiples contenedores localmente (dev) o en servidores simples.

```yaml
# compose.yaml (Compose V2)
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./src:/app/src          # bind mount para dev (hot reload)
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

### Comandos Compose

```bash
docker compose up -d            # levantar en background
docker compose up --build       # rebuild + levantar
docker compose down             # bajar
docker compose down -v          # bajar + borrar volúmenes
docker compose logs -f app      # logs de un servicio
docker compose ps               # estado
docker compose exec app sh      # shell en contenedor
docker compose restart app      # reiniciar servicio
```

### Compose para dev vs prod

```bash
# Base + override para dev
docker compose -f compose.yaml -f compose.dev.yaml up

# Producción
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

`compose.dev.yaml`:
```yaml
services:
  app:
    build:
      target: builder        # stage de dev con hot reload
    volumes:
      - ./src:/app/src
    environment:
      - NODE_ENV=development
```

⚠️ Compose es bueno para dev y servidores simples. Para producción a escala → Kubernetes.

## Optimización de imágenes

### Analizar tamaño

```bash
# Ver tamaño
docker images myapp

# Analizar layers (qué pesa)
docker history myapp:1.0

# dive (herramienta para explorar layers)
dive myapp:1.0
```

### Reducir tamaño

1. **Multi-stage** (lo más impactante)
2. **Imágenes base mínimas**: distroless > alpine > slim > full
3. **Combinar RUN**, limpiar en el mismo layer
4. **.dockerignore** completo
5. **--no-install-recommends** (apt), **--no-cache-dir** (pip)
6. No instalar lo innecesario

| Base | Tamaño aprox |
|---|---|
| `ubuntu` | ~70MB |
| `debian:slim` | ~30MB |
| `alpine` | ~5MB |
| `distroless/static` | ~2MB |
| `scratch` | 0 (vacío) |

## Healthchecks

```dockerfile
# En Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# En Compose
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 10s
```

En Kubernetes se usan probes (ver `kubernetes.md`), no HEALTHCHECK de Docker.

## Debugging de contenedores

```bash
# Logs
docker logs -f --tail 100 <container>

# Shell en contenedor corriendo
docker exec -it <container> sh

# Inspeccionar
docker inspect <container>

# Ver procesos
docker top <container>

# Stats en vivo (CPU, memoria)
docker stats

# Para imágenes distroless (sin shell), usar debug container
docker run -it --rm --pid container:<container> nicolaka/netshoot
```

### netshoot (debugging de red)

```bash
# Contenedor con herramientas de red para debug
docker run -it --rm --net container:<container> nicolaka/netshoot
# Adentro: tcpdump, dig, curl, netstat, etc.
```

## Volúmenes y persistencia

```bash
# Named volume (gestionado por Docker)
docker volume create mydata
docker run -v mydata:/data myapp

# Bind mount (directorio del host)
docker run -v $(pwd)/data:/data myapp

# tmpfs (en memoria, no persiste)
docker run --tmpfs /tmp myapp
```

| Tipo | Cuándo |
|---|---|
| Named volume | Datos persistentes (DBs) |
| Bind mount | Dev (código), config del host |
| tmpfs | Datos temporales, secrets en memoria |

## Networking

```bash
# Crear red
docker network create mynet

# Conectar contenedores (se resuelven por nombre)
docker run --network mynet --name db postgres
docker run --network mynet --name app myapp
# 'app' puede conectar a 'db:5432'

# Tipos de red
# bridge (default), host, none, overlay (swarm)
```

## Limpieza

```bash
# Borrar contenedores parados
docker container prune

# Borrar imágenes sin usar
docker image prune -a

# Borrar todo lo no usado (cuidado)
docker system prune -a --volumes

# Ver uso de disco
docker system df
```

## Anti-patterns

- ❌ `latest` en producción
- ❌ Sin multi-stage (imágenes gigantes)
- ❌ Root sin razón (ver `cybersecurity-defense`)
- ❌ Secrets en la imagen o en `ENV`
- ❌ `COPY . .` antes de instalar deps (rompe cache)
- ❌ Sin `.dockerignore`
- ❌ Múltiples procesos en un contenedor (usar uno por servicio)
- ❌ `apt-get install` sin `--no-install-recommends` ni limpieza
- ❌ Sin healthcheck
- ❌ Instalar herramientas de debug en imagen de prod
- ❌ Datos persistentes sin volumen (se pierden al recrear)
- ❌ Compose para producción a escala (usar K8s)

## Checklist Docker

- [ ] Multi-stage build
- [ ] Imagen base mínima (distroless/alpine/slim)
- [ ] Tag específico (no latest en prod)
- [ ] `.dockerignore` completo (incluye .env, .git)
- [ ] Layers ordenados para cache (deps antes de código)
- [ ] RUN combinados + limpieza en mismo layer
- [ ] Non-root user (ver cybersecurity-defense)
- [ ] HEALTHCHECK definido
- [ ] EXPOSE documentado
- [ ] Sin secrets en imagen
- [ ] Imagen escaneada (ver cybersecurity-defense)
- [ ] Volúmenes para datos persistentes
- [ ] Tamaño optimizado (verificar con dive/history)
