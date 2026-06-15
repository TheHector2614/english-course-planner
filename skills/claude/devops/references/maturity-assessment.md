# DevOps Maturity Assessment

Checklist para evaluar la madurez DevOps de una organización/proyecto y trazar un plan de mejora.

## Cómo usar

Cuando el usuario pida "evaluá mi madurez DevOps", "qué me falta", "cómo mejoro mi pipeline/operación", aplicar este assessment por dimensiones. Para cada una, ubicar el nivel actual y el siguiente paso.

Niveles:
- 🔴 **Inicial**: manual, ad-hoc, sin proceso
- 🟠 **Gestionado**: algo de automatización, procesos básicos
- 🟡 **Definido**: automatizado, procesos consistentes
- 🟢 **Optimizado**: elite, mejora continua, todo automatizado

## Dimensión 1: Containerización

| Nivel | Estado |
|---|---|
| 🔴 | Apps corren en VMs/bare metal sin contenedores |
| 🟠 | Algunas apps containerizadas, Dockerfiles básicos |
| 🟡 | Todo containerizado, multi-stage, imágenes optimizadas |
| 🟢 | Imágenes mínimas/distroless, escaneadas, firmadas, registry con políticas |

Preguntas:
- [ ] ¿Apps containerizadas?
- [ ] ¿Multi-stage builds?
- [ ] ¿Imágenes mínimas (distroless/alpine)?
- [ ] ¿Tags específicos (no latest en prod)?
- [ ] ¿Imágenes escaneadas? (ver `cybersecurity-defense`)

Referencia: `docker.md`

## Dimensión 2: Orquestación

| Nivel | Estado |
|---|---|
| 🔴 | Deploy manual de contenedores (docker run en servidores) |
| 🟠 | Docker Compose en servidores |
| 🟡 | Kubernetes con manifests, health probes, resource limits |
| 🟢 | K8s con autoscaling, Helm, operadores, multi-cluster |

Preguntas:
- [ ] ¿Orquestador (K8s) o solo contenedores sueltos?
- [ ] ¿Health probes (liveness/readiness)?
- [ ] ¿Resource requests/limits?
- [ ] ¿Autoscaling (HPA)?
- [ ] ¿Alta disponibilidad (múltiples réplicas, PDB)?

Referencia: `kubernetes.md`

## Dimensión 3: CI/CD

| Nivel | Estado |
|---|---|
| 🔴 | Deploy manual, sin pipeline |
| 🟠 | CI básico (tests), deploy semi-manual |
| 🟡 | Pipeline completo (lint→test→build→deploy), automatizado |
| 🟢 | CD con gates, deploy strategies, OIDC, monorepo affected |

Preguntas:
- [ ] ¿CI corre en cada PR?
- [ ] ¿Tests automatizados en el pipeline?
- [ ] ¿Build + push de imagen automatizado?
- [ ] ¿Deploy automatizado?
- [ ] ¿Gate de aprobación para prod?
- [ ] ¿Security scanning en CI? (ver `cybersecurity-defense`)
- [ ] ¿OIDC para cloud (no keys estáticas)?

Referencia: `cicd.md`

## Dimensión 4: Estrategias de deploy

| Nivel | Estado |
|---|---|
| 🔴 | Deploy con downtime (recreate), sin rollback claro |
| 🟠 | Rolling updates |
| 🟡 | Blue-green o canary, rollback fácil |
| 🟢 | Progressive delivery con análisis automático, feature flags |

Preguntas:
- [ ] ¿Deploys sin downtime?
- [ ] ¿Estrategia definida (rolling/blue-green/canary)?
- [ ] ¿Rollback fácil y rápido?
- [ ] ¿Rollback automático en fallo?
- [ ] ¿Feature flags (desacoplar deploy de release)?

Referencia: `deployment-strategies.md`

## Dimensión 5: GitOps / gestión de config

| Nivel | Estado |
|---|---|
| 🔴 | `kubectl apply` manual, config dispersa |
| 🟠 | Manifests en Git, deploy desde CI (push) |
| 🟡 | GitOps (ArgoCD/Flux), Git como fuente de verdad |
| 🟢 | GitOps con multi-entorno, selfHeal, promoción automatizada |

Preguntas:
- [ ] ¿Config en Git?
- [ ] ¿GitOps (pull) o deploy manual/push?
- [ ] ¿Drift detection / selfHeal?
- [ ] ¿Promoción entre entornos definida?
- [ ] ¿Rollback vía Git?

Referencia: `gitops.md`

## Dimensión 6: Infrastructure as Code

| Nivel | Estado |
|---|---|
| 🔴 | Infra creada a mano (clicks en consola) |
| 🟠 | Algunos scripts, IaC parcial |
| 🟡 | Todo en IaC (Terraform/Pulumi), state remoto, módulos |
| 🟢 | IaC con policy-as-code, CI/CD de infra, drift detection |

Preguntas:
- [ ] ¿Infra como código?
- [ ] ¿State remoto con lock?
- [ ] ¿Módulos reutilizables?
- [ ] ¿Entornos separados?
- [ ] ¿Policy as code? (ver `cybersecurity-defense`)
- [ ] ¿IaC en CI/CD con plan/apply?

Referencia: `iac.md`

## Dimensión 7: Observabilidad

| Nivel | Estado |
|---|---|
| 🔴 | Solo logs locales, sin métricas |
| 🟠 | Logs centralizados, métricas básicas |
| 🟡 | Métricas + logs + alertas, golden signals, dashboards |
| 🟢 | Tracing distribuido, SLO-based alerting, observabilidad completa |

Preguntas:
- [ ] ¿Métricas (Prometheus/equivalente)?
- [ ] ¿Golden signals por servicio?
- [ ] ¿Logs estructurados y centralizados?
- [ ] ¿Tracing distribuido (microservicios)?
- [ ] ¿Dashboards (Grafana)?
- [ ] ¿Alertas accionables?

Referencia: `observability.md`

## Dimensión 8: Confiabilidad / SRE

| Nivel | Estado |
|---|---|
| 🔴 | Sin SLOs, on-call ad-hoc, sin postmortems |
| 🟠 | Algunos SLOs, on-call con rotación |
| 🟡 | SLOs + error budgets, postmortems blameless, runbooks |
| 🟢 | Error budget policy, toil < 50%, mejora continua |

Preguntas:
- [ ] ¿SLOs definidos?
- [ ] ¿Error budgets?
- [ ] ¿On-call sostenible (rotación, compensación)?
- [ ] ¿Runbooks? (ver `technical-docs`)
- [ ] ¿Postmortems blameless?
- [ ] ¿Toil medido y reducido?

Referencia: `sre-culture.md`

## Dimensión 9: DORA Metrics

Medir el estado actual:

| Métrica | Tu valor | Nivel |
|---|---|---|
| Deployment Frequency | ? | Elite: varios/día |
| Lead Time for Changes | ? | Elite: < 1 hora |
| Change Failure Rate | ? | Elite: 0-15% |
| Time to Restore (MTTR) | ? | Elite: < 1 hora |

Preguntas:
- [ ] ¿Medís DORA metrics?
- [ ] ¿Deploy frequency? (¿cuántas veces/semana?)
- [ ] ¿Lead time de commit a prod?
- [ ] ¿Change failure rate?
- [ ] ¿MTTR?

Referencia: `sre-culture.md`

## Dimensión 10: Seguridad (DevSecOps)

Delegar a `cybersecurity-defense`, pero verificar integración:

| Nivel | Estado |
|---|---|
| 🔴 | Seguridad al final, manual |
| 🟠 | Algún scanning, secrets en secret manager |
| 🟡 | Security en CI (shift-left), supply chain básico |
| 🟢 | DevSecOps completo, policy-as-code, SBOM, firma |

Preguntas:
- [ ] ¿Security scanning en CI?
- [ ] ¿Secrets fuera del código?
- [ ] ¿Supply chain security (SBOM, scanning de deps)?
- [ ] ¿Policy as code?
- [ ] ¿Imágenes escaneadas y firmadas?

Referencia: `cybersecurity-defense` (skill aparte)

## Reporte de assessment

### Template

```markdown
# DevOps Maturity Assessment: <organización/proyecto>

## Resumen ejecutivo

- Madurez general: 🟠 Gestionado (transicionando a Definido)
- Fortalezas: containerización, CI básico
- Gaps principales: sin GitOps, observabilidad limitada, sin SLOs

## Scorecard por dimensión

| Dimensión | Nivel actual | Objetivo | Prioridad |
|---|---|---|---|
| Containerización | 🟡 Definido | 🟢 | Baja |
| Orquestación | 🟠 Gestionado | 🟡 | Media |
| CI/CD | 🟡 Definido | 🟢 | Baja |
| Deploy strategies | 🔴 Inicial | 🟡 | Alta |
| GitOps | 🔴 Inicial | 🟡 | Alta |
| IaC | 🟠 Gestionado | 🟡 | Media |
| Observabilidad | 🔴 Inicial | 🟡 | Alta |
| SRE/Confiabilidad | 🔴 Inicial | 🟠 | Media |
| DORA | No medido | Medir | Alta |
| Seguridad | 🟠 Gestionado | 🟡 | Media |

## DORA metrics actuales

- Deployment Frequency: 1/semana (High)
- Lead Time: ~2 días (High)
- Change Failure Rate: ~25% (Medium) ← mejorar
- MTTR: ~4 horas (High)

## Gaps priorizados

### Alta prioridad (mayor impacto)
1. **Sin observabilidad** → volar a ciegas. Implementar Prometheus + Grafana + alertas.
2. **Deploy con downtime** → implementar rolling/canary + rollback.
3. **No medís DORA** → instrumentar para saber dónde estás.

### Media prioridad
1. GitOps (ArgoCD) para eliminar deploys manuales
2. IaC completa (mover infra manual a Terraform)
3. SLOs para servicios clave

### Baja prioridad (ya estás bien)
1. Optimizar imágenes (ya containerizado)

## Plan de mejora (roadmap)

### Fase 1 (1-2 meses): visibilidad
- Implementar observabilidad (métricas + logs + alertas)
- Empezar a medir DORA metrics
- Golden signals por servicio

### Fase 2 (2-4 meses): confiabilidad de deploys
- Estrategia de deploy sin downtime
- Rollback automatizado
- Reducir change failure rate (más tests, canary)

### Fase 3 (4-6 meses): GitOps + IaC
- ArgoCD/Flux para deploys
- Terraform para toda la infra
- Promoción entre entornos

### Fase 4 (continuo): SRE
- SLOs + error budgets
- Postmortems blameless
- Reducir toil

## Quick wins (empezar ya)
1. Health probes en K8s (si faltan)
2. Resource limits
3. Medir deploy frequency (fácil, da baseline)
4. Logs estructurados
```

## Roadmap genérico de madurez

```
🔴 Inicial → 🟠 Gestionado:
- Containerizar apps
- CI básico (tests en PR)
- Logs centralizados
- IaC para nueva infra

🟠 Gestionado → 🟡 Definido:
- Kubernetes con probes/limits
- Pipeline CI/CD completo
- Observabilidad (métricas + alertas)
- GitOps
- IaC para toda la infra
- Empezar a medir DORA

🟡 Definido → 🟢 Optimizado:
- Progressive delivery (canary con análisis)
- Tracing distribuido
- SLOs + error budgets
- Toil < 50%
- DevSecOps completo
- Platform engineering (self-service)
- Mejora continua basada en métricas
```

## Quick wins universales (alto impacto, bajo esfuerzo)

1. **Health probes** en K8s (evita servir tráfico a pods rotos)
2. **Resource limits** (evita noisy neighbors)
3. **CI en cada PR** (lint + test)
4. **Logs estructurados** (debugging más fácil)
5. **Medir deploy frequency** (baseline DORA gratis)
6. **Rollback documentado** (recuperación rápida)
7. **Tags específicos** (no latest en prod)
8. **Secrets fuera del código** (ver `cybersecurity-defense`)
9. **Dashboard de golden signals** (saber si está sano)
10. **Postmortems blameless** (aprender de fallos)

## Anti-patterns a buscar

Durante el assessment, banderas rojas:

- Deploys manuales a producción
- "Funciona en mi máquina" (sin paridad dev/prod)
- Sin observabilidad (no saben si algo está mal hasta que un usuario reporta)
- Sin rollback claro
- Infra creada a mano (no reproducible)
- `latest` tag en producción
- Sin health probes
- Sin resource limits
- Heroísmo (depender de una persona que "sabe cómo")
- Sin postmortems o con culpa
- On-call insostenible
- No medir nada (no saben si mejoran)
- Velocidad vs estabilidad como trade-off asumido
- Silos dev/ops

## Checklist del assessment

- [ ] Las 10 dimensiones evaluadas
- [ ] Nivel actual por dimensión
- [ ] DORA metrics medidas (o plan para medirlas)
- [ ] Gaps priorizados por impacto
- [ ] Roadmap en fases
- [ ] Quick wins identificados
- [ ] Objetivos realistas (no saltar de 🔴 a 🟢 de golpe)
