# Deploy Astro a AWS

Patrón completo para Astro, considerando estático vs SSR.

## Decisión: ¿estático o SSR?

```bash
# Verificar en astro.config.mjs
output: 'static'  # → mismo patrón que Angular (S3 + CloudFront)
output: 'server'  # → necesita compute (Lambda, ECS, etc.)
output: 'hybrid'  # → mix; partes estáticas en S3, dinámicas en Lambda
```

**La mayoría de landings y blogs**: `static`. Es lo que recomiendo y lo más barato.

## Caso 1: Astro estático (recomendado para landings)

Idéntico al patrón Angular: **S3 + CloudFront + Route 53 + ACM**.

Ver `deploy-angular.md` para el HCL completo. Solo cambia el build:

```bash
npm run build
# Output en dist/
```

Y la sincronización:

```yaml
- name: Build Astro
  run: npm run build

- name: Deploy to S3
  run: |
    aws s3 sync dist/ s3://mi-astro-site/ \
      --delete \
      --cache-control "public, max-age=31536000, immutable" \
      --exclude "*.html" \
      --exclude "*.xml"

    # HTML y sitemaps con caché corto
    aws s3 sync dist/ s3://mi-astro-site/ \
      --cache-control "public, max-age=0, must-revalidate" \
      --exclude "*" \
      --include "*.html" \
      --include "*.xml"
```

**Nota sobre routing**: Astro estático genera HTMLs físicos (`/about/index.html`, etc.), así que no necesita el fallback de SPA. CloudFront servirá los archivos correctamente.

## Caso 2: Astro SSR/hybrid

Necesitas un runtime que ejecute JavaScript en cada request. 4 opciones:

### Opción A: AWS Amplify Hosting (más simple)

Servicio managed que detecta Astro automáticamente y deploya con SSR.

**Pros**:
- Setup en 5 minutos
- Build, deploy y hosting integrados
- Preview branches automáticos (como Vercel/Netlify)
- HTTPS, custom domain, env vars incluidos

**Cons**:
- Más caro que S3+CloudFront
- Menos control
- Lock-in a Amplify

**Costo**: ~$0.01/build-min + $0.15/GB serve. Para sitio típico: $5-20/mes.

**Setup**:
```bash
# Via consola: Amplify Hosting → Conectar GitHub repo → detecta Astro → deploy
# Via CLI:
amplify init
amplify add hosting
amplify publish
```

Recomendado si: quieres simplicidad y no te importan los $5-10 extra.

### Opción B: Astro con adaptador AWS (Lambda + CloudFront)

Usar el adaptador `astro-aws` o `@astrojs/aws-lambda`:

```bash
npm install astro-aws
```

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import aws from 'astro-aws';

export default defineConfig({
  output: 'server',
  adapter: aws({
    edge: false,  // Lambda regional (no Lambda@Edge)
  }),
});
```

```bash
npm run build
# Genera Lambda function en dist/server/
```

Deploy con CDK o Terraform:
- Lambda function con el código de Astro
- API Gateway HTTP API delante
- CloudFront con dos origins: S3 (estático) + API Gateway (dinámico)
- Behaviors en CloudFront que rutean rutas dinámicas al Lambda

**Pros**:
- Pago por uso (gratis si nadie visita)
- Escalado automático
- Control total

**Cons**:
- Cold starts en Lambda (puede impactar TTFB)
- Setup más complejo

**Costo**: free tier de Lambda + CloudFront. Pago real solo en tráfico alto.

### Opción C: ECS Fargate con Node container

Servir Astro con `node` en un contenedor:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

Deploy con ECS Fargate detrás de ALB. Ver `deploy-java-spring.md` para el patrón general (igual pero con node).

**Cuándo**: si necesitas conexiones largas (WebSockets, SSE) o ya tienes ECS infra.

**Cons**: paga por hora 24/7 aunque no haya tráfico (~$15-25/mes mínimo).

### Opción D: AWS App Runner

Container managed, fully serverless:

```bash
# apprunner.yaml
version: 1.0
runtime: nodejs20
build:
  commands:
    pre-build:
      - npm ci
    build:
      - npm run build
run:
  runtime-version: 20
  command: node ./dist/server/entry.mjs
  network:
    port: 4321
    env: PORT
```

App Runner construye desde repo Git directo o desde ECR.

**Pros**:
- Más simple que ECS
- Auto-scaling a 0 (en idle)
- HTTPS automático

**Cons**:
- Más caro que Lambda para tráfico alto
- Menos control que ECS
- Cold start cuando escala desde 0

**Costo**: $0.064/vCPU-h + $0.007/GB-h + provisioned container instance ($0.009/h). ~$25/mes en idle, sube con tráfico.

## Comparación de opciones SSR

| Opción | Setup | Costo idle | Cold start | Control | Recomendado para |
|---|---|---|---|---|---|
| **Amplify Hosting** | 5 min | $0-5 | Bajo | Bajo | MVP, demo, no DevOps |
| **Lambda + CloudFront** | 1-2h | $0 | Sí (~500ms) | Medio | Tráfico bajo/medio |
| **ECS Fargate** | 4-8h | $20+ | No | Alto | Conexiones largas, infra existente |
| **App Runner** | 30 min | $25+ | Sí (si escala a 0) | Medio | Containers managed sin ECS |

## Mi recomendación

- **Sitio estático (landing, blog)**: Caso 1 — S3 + CloudFront. ~$5/mes.
- **App con SSR ligero**: Caso 2A (Amplify) si empezando, Caso 2B (Lambda) si quieres optimizar costos.
- **App con websockets o features especiales**: Caso 2C (ECS Fargate).

## Costos comparados (sitio con 50k visitas/mes)

| Patrón | Mensual |
|---|---|
| Estático (S3 + CloudFront) | ~$6 |
| Amplify Hosting | ~$10-20 |
| Lambda + CloudFront | ~$2-8 |
| App Runner (mínimo) | ~$25 |
| ECS Fargate (mínimo) | ~$25-40 |

## Variables de entorno

### Astro estático

Solo `PUBLIC_*` se incluyen en el build (visibles en el cliente). Define en CI/CD:

```yaml
- run: npm run build
  env:
    PUBLIC_API_URL: ${{ vars.PUBLIC_API_URL }}
    # PUBLIC_STRIPE_KEY: ... (publishable key OK)
```

### Astro SSR

Variables secretas se cargan en runtime. NO usar `PUBLIC_` para secrets.

- **Lambda**: setear en env vars de la función (cuidado con tamaño)
- **ECS/Fargate/App Runner**: usar Secrets Manager o Parameter Store

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: aws(),
});

// .env (no commitear)
DATABASE_URL=postgresql://...
SECRET_API_KEY=...

// src/pages/api/something.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const dbUrl = import.meta.env.DATABASE_URL;
  // ...
};
```

## SEO + Performance

### Pre-render parcial (hybrid)

Para apps mixtas, usar `export const prerender = true` por página:

```typescript
// src/pages/blog/[slug].astro
export const prerender = true;  // Esta página se genera estáticamente
```

```typescript
// src/pages/dashboard.astro
export const prerender = false;  // Esta requiere SSR
```

Mejor de ambos mundos: páginas públicas estáticas (rápidas, baratas), dashboard dinámico.

### Sitemap

Configurar el integration `@astrojs/sitemap`:

```typescript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
});
```

Genera `sitemap-index.xml` en build. Asegurar que CloudFront sirva con caché corto:

```bash
aws s3 cp dist/sitemap-index.xml s3://bucket/sitemap-index.xml \
  --cache-control "public, max-age=3600"
```

### Image optimization

Astro tiene optimización built-in con `<Image />`. Asegurar:

```typescript
// astro.config.mjs
export default defineConfig({
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

Las imágenes optimizadas se generan en build (estático) o on-demand (SSR). Para SSR con muchas imágenes, considerar:
- **CloudFront + Lambda@Edge** para resize on-demand
- **AWS Serverless Image Handler** (template oficial)

## Headers de seguridad

En CloudFront response headers policy (ver `deploy-angular.md`).

Para SSR adicionalmente, set en código:

```typescript
// src/pages/api/something.ts
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    }
  });
};
```

## Trampas comunes Astro + AWS

- ❌ Olvidar configurar `site` en `astro.config.mjs` (rompe sitemap, canonical URLs)
- ❌ No setear `output: 'static'` cuando es sitio estático (compila innecesariamente como server)
- ❌ Usar `PUBLIC_` para secrets (van al cliente)
- ❌ Builds enormes en CI sin caché (`actions/cache` para `node_modules`)
- ❌ Path mismatch entre `astro.config.mjs` `outDir` y deploy script
- ❌ Routing con trailing slash inconsistente (`/about` vs `/about/`)
- ❌ Cache infinito en sitemap (Google no ve actualizaciones)
- ❌ Para SSR: olvidar incluir `node_modules` en el Lambda zip
