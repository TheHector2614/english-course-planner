# Cultura DevOps / SRE

DORA metrics, SLOs/SLIs, error budgets, on-call, toil, postmortems.

**Nota**: para formato de postmortems/runbooks ver `technical-docs`. Para respuesta a incidentes de seguridad ver `cybersecurity-defense`. Aquí: prácticas de cultura y confiabilidad.

## DevOps vs SRE

- **DevOps**: cultura/movimiento para unir desarrollo y operaciones, automatizar entrega
- **SRE** (Site Reliability Engineering): implementación de DevOps con prácticas concretas (Google). "SRE es lo que pasa cuando le pedís a un ingeniero de software que diseñe operaciones"

Comparten objetivos. SRE aporta prácticas medibles (SLOs, error budgets, toil).

## DORA Metrics

Las 4 métricas que predicen performance de entrega (DevOps Research & Assessment / Google).

### Las 4 métricas

| Métrica | Qué mide | Cómo mejorar |
|---|---|---|
| **Deployment Frequency** | Cuán seguido desplegás a prod | CI/CD, deploys pequeños, automatización |
| **Lead Time for Changes** | De commit a producción | Pipelines rápidos, PRs chicas, menos handoffs |
| **Change Failure Rate** | % de deploys que causan fallos | Tests, canary, code review |
| **Time to Restore** (MTTR) | Cuánto tardás en recuperar de un fallo | Rollback fácil, observabilidad, runbooks |

Throughput (velocidad): Deploy Frequency + Lead Time.
Stability (estabilidad): Change Failure Rate + MTTR.

**Insight clave**: velocidad y estabilidad NO se oponen. Los equipos elite tienen ambas (deploy seguido Y con pocos fallos). La causa es la misma: buena automatización, deploys pequeños, feedback rápido.

### Niveles de performance

| Nivel | Deploy freq | Lead time | CFR | MTTR |
|---|---|---|---|---|
| **Elite** | On-demand (varios/día) | < 1 hora | 0-15% | < 1 hora |
| **High** | 1/día a 1/semana | 1 día-1 semana | 16-30% | < 1 día |
| **Medium** | 1/semana a 1/mes | 1 semana-1 mes | 16-30% | 1 día-1 semana |
| **Low** | < 1/mes | 1-6 meses | 16-30%+ | 1 semana-1 mes |

### Quinta métrica (moderna)

5. **Reliability**: cumplimiento de SLOs. Agregada en investigación reciente de DORA.

### Cómo medir

- **Deploy Frequency**: contar deploys a prod (del CI/CD)
- **Lead Time**: timestamp commit → timestamp deploy
- **CFR**: deploys que requirieron hotfix/rollback / total deploys
- **MTTR**: tiempo de incidentes (de detección a resolución)

Tools: Four Keys (Google, open source), Sleuth, LinearB, o dashboards custom sobre datos de CI/CD + incidentes.

## SLI / SLO / SLA

Jerarquía de objetivos de confiabilidad.

```
SLI (Indicator)  → la métrica (ej: % requests exitosos)
SLO (Objective)  → el objetivo interno (ej: 99.9% exitosos)
SLA (Agreement)  → el contrato con el cliente (ej: 99.5%, con penalización)
```

SLO siempre más estricto que SLA (margen de seguridad).

### SLI (Service Level Indicator)

Métrica cuantitativa de un aspecto del servicio. Buenos SLIs:

```promql
# Availability: % de requests exitosos
sum(rate(http_requests_total{status!~"5.."}[30d]))
/ sum(rate(http_requests_total[30d]))

# Latency: % de requests bajo umbral
sum(rate(http_request_duration_seconds_bucket{le="0.3"}[30d]))
/ sum(rate(http_request_duration_seconds_count[30d]))
```

Tipos comunes:
- **Availability**: % de requests exitosos
- **Latency**: % de requests bajo umbral
- **Throughput**: requests/seg
- **Error rate**: % de errores
- **Durability**: datos no perdidos

### SLO (Service Level Objective)

Objetivo de confiabilidad sobre un SLI.

```
SLO de availability: 99.9% de requests exitosos en 30 días
SLO de latency: 99% de requests bajo 300ms en 30 días
```

¿Cuántos "nueves"?

| SLO | Downtime/año | Downtime/mes | Downtime/semana |
|---|---|---|---|
| 99% | 3.65 días | 7.2 horas | 1.68 horas |
| 99.9% | 8.76 horas | 43.2 min | 10.1 min |
| 99.95% | 4.38 horas | 21.6 min | 5 min |
| 99.99% | 52.6 min | 4.32 min | 1 min |
| 99.999% | 5.26 min | 25.9 seg | 6 seg |

⚠️ Más nueves = exponencialmente más caro. 100% es imposible y el objetivo equivocado. Elegir según necesidad real del negocio.

### SLA (Service Level Agreement)

Contrato con el cliente. Si no se cumple, hay consecuencias (créditos, penalizaciones). Siempre menos estricto que el SLO interno.

## Error Budget

El "presupuesto" de fallo permitido. Si tu SLO es 99.9%, tu error budget es 0.1%.

```
SLO = 99.9%  →  Error budget = 0.1% del tiempo/requests
En 30 días: 0.1% = ~43 minutos de "presupuesto" de downtime
```

### Para qué sirve

El error budget alinea desarrollo y operaciones:

- **Budget disponible** → podés tomar riesgos (deploys, features, experimentos)
- **Budget agotado** → freeze de features, foco en estabilidad

Resuelve la tensión clásica: dev quiere lanzar rápido, ops quiere estabilidad. El error budget lo cuantifica: mientras haya budget, lanzá; si se agota, estabilizá.

### Política de error budget

```
Si el error budget del trimestre se agota:
- Freeze de releases de features
- Todo el foco en confiabilidad
- Postmortems de lo que consumió el budget
- Volver a features cuando se recupere
```

### Burn rate

Velocidad a la que se consume el budget. Alertar sobre burn rate alto:

```promql
# Burn rate: qué tan rápido se consume el error budget
# Alertar si a este ritmo el budget se agota antes de fin de período
(1 - (sum(rate(http_requests_total{status!~"5.."}[1h])) / sum(rate(http_requests_total[1h]))))
/ (1 - 0.999)  # SLO 99.9%
```

Multi-window burn rate alerts (Google SRE): alertar rápido si se quema mucho budget rápido, más lento si es gradual.

## On-call

Rotación de quién responde a incidentes fuera de horario.

### Principios de on-call sostenible

- **Rotación justa**: distribuir la carga
- **Compensación**: pagar/compensar el on-call
- **Carga razonable**: no más de ~2 incidentes por turno (si hay más, arreglar la causa)
- **Runbooks**: documentar cómo responder (ver `technical-docs`)
- **Escalación clara**: a quién escalar
- **Handoff**: traspaso entre turnos
- **Tiempo de recuperación**: tras un turno pesado, descanso

### Alert quality

On-call solo es sostenible si las alertas son buenas:
- **Accionables**: cada página requiere acción humana
- **Urgentes**: si puede esperar a mañana, no es página
- **Sin ruido**: alert fatigue quema a la gente

Si el on-call recibe muchas alertas no accionables, arreglar las alertas (no normalizar el sufrimiento).

### Herramientas

PagerDuty, Opsgenie, Grafana OnCall, VictorOps. Gestionan rotaciones, escalación, alertas.

## Toil (trabajo manual repetitivo)

Toil = trabajo manual, repetitivo, automatizable, sin valor duradero, que escala con el servicio.

Ejemplos de toil:
- Reiniciar servicios manualmente
- Aplicar el mismo fix una y otra vez
- Provisioning manual
- Responder las mismas alertas con los mismos pasos

### Por qué reducir toil

- Escala linealmente con el servicio (no sostenible)
- Quema a los ingenieros
- Propenso a error
- No agrega valor duradero

### Cómo reducir

- **Automatizar** lo repetitivo (scripts, runbooks ejecutables, operadores)
- **Eliminar la causa** (¿por qué hay que reiniciar? arreglar el bug)
- **Self-service** (que los devs resuelvan sin ops)

SRE recomienda: **máximo 50% del tiempo en toil**, el resto en ingeniería (automatización, mejoras). Si supera 50%, es señal de alarma.

## Postmortems blameless

Análisis tras un incidente. **Blameless**: foco en sistemas y procesos, no en culpar personas.

Ver `technical-docs` (`operational-docs.md`) para el formato completo. Principios SRE:

- **Blameless**: las personas no temen reportar (si temen, ocultan info valiosa)
- **Foco en sistemas**: ¿por qué el sistema permitió el error?
- **Timeline factual**
- **Root cause** (5 whys, etc.)
- **Action items** con owners
- **Compartir**: aprendizaje para toda la org

```
Mal: "Juan rompió producción al desplegar sin testear"
Bien: "Un cambio llegó a prod sin tests porque el pipeline no los exigía.
       Action: hacer tests obligatorios en el pipeline."
```

El sistema debe hacer difícil cometer errores, no culpar a quien los comete.

## Cultura DevOps (CALMS)

Framework de cultura DevOps:

- **C**ulture: colaboración, no silos (dev + ops + security juntos)
- **A**utomation: automatizar todo lo repetible
- **L**ean: eliminar desperdicio, flujo continuo, lotes pequeños
- **M**easurement: medir todo (DORA, SLOs)
- **S**haring: compartir conocimiento, blameless, transparencia

## Prácticas de equipos elite

Según DORA research, los equipos elite:

- Despliegan **frecuentemente** (lotes pequeños = menos riesgo)
- **Automatizan** testing, deployment, infra
- **Trunk-based development** o branches cortas
- **CI/CD** robusto
- **Observabilidad** de primera clase
- **Cultura blameless**
- **Loosely coupled** architecture (equipos autónomos)
- **Documentación** de calidad
- **Foco en el usuario**

## Platform Engineering (tendencia)

Construir una "plataforma interna" (Internal Developer Platform) que abstrae complejidad para los devs:

- Self-service (devs despliegan sin tickets a ops)
- Golden paths (caminos recomendados, fáciles)
- Reduce carga cognitiva
- Tools: Backstage (portal), Crossplane (infra self-service)

Evolución de DevOps: en lugar de "cada equipo hace todo", una plataforma facilita lo común.

## Métricas más allá de DORA

- **SPACE** framework: Satisfaction, Performance, Activity, Communication, Efficiency (developer productivity holística)
- **Flow metrics**: cycle time, throughput, WIP
- **Reliability**: SLO compliance, error budget consumido
- **Cost**: FinOps (ver `aws-cloud` para costos)

## Anti-patterns culturales

- ❌ Silos dev vs ops (lo que DevOps busca eliminar)
- ❌ Postmortems con culpa (la gente oculta info)
- ❌ On-call sin compensación ni límites (burnout)
- ❌ Alert fatigue normalizada
- ❌ Toil sin reducir (no escala)
- ❌ Deploys grandes e infrecuentes (más riesgo)
- ❌ "Funciona en mi máquina" (falta de paridad dev/prod)
- ❌ No medir (no se puede mejorar lo que no se mide)
- ❌ 100% uptime como objetivo (imposible, mal foco)
- ❌ Velocidad vs estabilidad como trade-off (los elite tienen ambas)
- ❌ Heroísmo (depender de personas, no de sistemas)
- ❌ Ops como cuello de botella (sin self-service)

## Checklist cultura DevOps/SRE

### Medición
- [ ] DORA metrics medidas
- [ ] SLOs definidos para servicios clave
- [ ] SLIs instrumentados (ver observability.md)
- [ ] Error budgets establecidos
- [ ] Burn rate alerting

### Confiabilidad
- [ ] On-call sostenible (rotación, compensación, límites)
- [ ] Alertas accionables (sin fatiga)
- [ ] Runbooks para incidentes (ver technical-docs)
- [ ] Postmortems blameless
- [ ] Error budget policy (freeze si se agota)

### Eficiencia
- [ ] Toil medido y reducido (< 50%)
- [ ] Automatización de lo repetible
- [ ] Self-service para devs
- [ ] Deploys frecuentes y pequeños

### Cultura
- [ ] Colaboración dev/ops/security (sin silos)
- [ ] Blameless
- [ ] Compartir conocimiento
- [ ] Foco en mejorar sistemas, no culpar
- [ ] CALMS aplicado
