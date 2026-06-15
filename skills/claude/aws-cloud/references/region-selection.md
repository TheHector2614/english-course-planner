# Selección de Región AWS

Cómo elegir la región correcta. Aplicar las 4 dimensiones: latencia, costos, compliance, disponibilidad de servicios.

## Las preguntas correctas

1. **¿Dónde están tus usuarios?** → latencia
2. **¿Cuánto cuesta?** → precios varían entre regiones
3. **¿Hay restricciones legales?** → datos en cierto país/región
4. **¿Necesitas un servicio específico?** → no todos los servicios están en todas las regiones

## Regiones más relevantes (geografía del usuario: Colombia)

| Región | Código | Latencia Colombia | Notas |
|---|---|---|---|
| US East (N. Virginia) | `us-east-1` | ~60-80ms | Más servicios, precios más bajos. Historial de outages que afectan servicios globales |
| US East (Ohio) | `us-east-2` | ~70-90ms | Más estable, similar a us-east-1 en latencia |
| US West (Oregon) | `us-west-2` | ~100-130ms | Buena alternativa cuando us-east-1 tiene issues |
| South America (São Paulo) | `sa-east-1` | ~120-150ms | Datos en LATAM por compliance. Más caro, menos servicios |

### Por qué `us-east-1` NO siempre es la mejor opción

- **Outages históricos** (2017, 2021, 2023) afectaron servicios globales (IAM, Route 53, CloudFront)
- Servicios "globales" en AWS están físicamente en us-east-1
- En picos hay capacity issues más frecuentes

### Por qué `us-east-2` es a menudo mejor

- Latencia similar (segundo a Colombia ≈ misma que us-east-1)
- Más estable históricamente
- Precios iguales que us-east-1
- Casi todos los servicios disponibles

### Por qué `sa-east-1` solo cuando necesario

- ~50-70% más caro que us-east-1 en EC2/RDS
- Menos servicios disponibles (siempre rezago)
- Mayor latencia hacia US y Europa
- **Solo cuando**: compliance exige datos en LATAM, o usuarios mayoritariamente en Brasil/Argentina

## Servicios "globales" (no eligen región)

Algunos servicios son globales aunque tengan endpoint en us-east-1:

- IAM
- Route 53
- CloudFront
- WAF (Cloud edition)
- ACM Certificates (para CloudFront — solo desde us-east-1)
- Organizations
- Billing

Esto es importante: aunque trabajes en `sa-east-1`, los certificados ACM para CloudFront deben crearse en `us-east-1`. Trampa común.

## Precios: variación entre regiones

Comparativa típica (precios EC2 t3.medium, RDS db.t3.medium en USD/hora):

| Servicio | us-east-1 | us-east-2 | us-west-2 | sa-east-1 |
|---|---|---|---|---|
| EC2 t3.medium | ~$0.0416 | $0.0416 | $0.0416 | ~$0.0728 |
| RDS db.t3.medium (Multi-AZ) | ~$0.136 | $0.136 | $0.136 | ~$0.230 |
| S3 Standard (per GB) | $0.023 | $0.023 | $0.023 | $0.0405 |
| Data transfer OUT (per GB) | $0.09 | $0.09 | $0.09 | $0.150 |

⚠️ Precios pueden cambiar. **Verificar con `web_search` "aws ec2 pricing us-east-1"** antes de prometer un costo.

## Disponibilidad de servicios

No todos los servicios están en todas las regiones. Especialmente nuevos features:

- **us-east-1, us-west-2**: siempre los primeros en recibir features nuevos
- **us-east-2**: usualmente al mismo tiempo o poco después
- **eu-west-1**: tercera ola
- **sa-east-1**: a veces meses después de US

Verificar disponibilidad en `https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html` o "[servicio] availability AWS region".

## Compliance y soberanía de datos

### Si los datos deben quedarse en cierto país

| Caso | Recomendación |
|---|---|
| Datos deben quedarse en LATAM | `sa-east-1` (São Paulo) |
| Datos deben quedarse en US | cualquier región US |
| Datos deben quedarse en UE (GDPR) | `eu-central-1` (Frankfurt), `eu-west-1` (Irlanda), etc. |
| Datos deben quedarse en Reino Unido | `eu-west-2` (London) |

⚠️ Verificar también dónde están los servicios "globales" usados. Si CloudFront cachea contenido, técnicamente sale de la región de origen.

### Si tu cliente exige cumplimiento (PCI, HIPAA, etc.)

Casi todas las regiones US son compatibles. Verificar en `https://aws.amazon.com/compliance/services-in-scope/`.

## Recomendaciones por caso de uso

### Sitio estático / SPA con audiencia global

- Origin: `us-east-1` (más barato, todos los servicios)
- **CloudFront**: distribución global automática (edge en LATAM, US, Europa, Asia)
- ACM en `us-east-1` para el cert de CloudFront

Resultado: latencia baja para usuarios globales aunque el bucket esté en US.

### App con backend dinámico (API + DB) audiencia LATAM

**Opción A — Recomendada para empezar**:
- Todo en `us-east-2` (us-east-1 si quieres más servicios disponibles)
- CloudFront delante para usuarios LATAM
- Latencia ≈ 80-100ms (aceptable para apps web típicas)

**Opción B — Si latencia es crítica**:
- Todo en `sa-east-1`
- 50% más caro pero latencia ≈ 30-50ms en LATAM
- Pesar: ¿realmente importa esa diferencia para tu app?

### App regulada (datos personales LATAM)

- `sa-east-1` para todo lo que toque PII
- Si quieres lo mejor de ambos: app pública en `us-east-1` (frontend, assets) + backend con datos en `sa-east-1`

### Aprendizaje / hobby

- `us-east-1` o `us-east-2`
- Más recursos en free tier disponibles
- Más tutoriales asumen us-east-1

## Multi-región: cuándo, cómo

Multi-región **NO** es algo que un principiante deba hacer en su primer proyecto. Es **complejo y caro**. Trampas:

- Replicación de datos entre regiones (RDS no replica automáticamente entre regiones; necesitas Aurora Global o snapshots)
- Costos x2 (al menos)
- Sincronización de configuración
- Failover testing real es difícil
- Latencia de escritura inter-región

### Cuándo SÍ vale la pena multi-región

- **Compliance**: usuarios en distintos continentes con leyes de residencia de datos
- **DR (Disaster Recovery) crítico**: RTO/RPO bajos (minutos)
- **Disponibilidad altísima**: 99.99%+ con SLA contractual
- **Latencia crítica global**: aplicaciones tiempo real para usuarios en US + Europa + Asia

### Patrones multi-región

- **Pilot light**: infra mínima en region B; activar en disaster
- **Warm standby**: infra reducida corriendo en B; escalar en disaster
- **Active-active**: ambas regiones sirven tráfico (Route 53 con latency-based routing)

Costo y complejidad: Active-active > Warm standby > Pilot light.

## Cómo cambiar la región una vez desplegado

Si te equivocaste de región:

1. **No "muevas" recursos** entre regiones — no se puede directamente
2. **Crea infra nueva** en la región correcta (con IaC es fácil)
3. **Migra datos**:
   - S3 → S3 Cross-Region Replication o `aws s3 sync`
   - RDS → snapshot + restore en otra región (downtime); o `pg_dump`/`mysqldump`
   - DynamoDB → Global Tables o backup/restore
4. **Switchea DNS** (Route 53)
5. **Destruye la infra vieja**

Es un dolor. Por eso elegir bien la primera vez.

## Checklist de decisión

Antes de crear el primer recurso pregúntate:

- [ ] ¿Dónde están la mayoría de mis usuarios?
- [ ] ¿Hay requisitos legales de residencia de datos?
- [ ] ¿Qué servicios específicos necesito? ¿Están en esa región?
- [ ] ¿Cuánto cuesta vs alternativas?
- [ ] Si elijo us-east-1, ¿soy consciente del riesgo de outages globales?
- [ ] Si elijo sa-east-1, ¿estoy listo para pagar 50% más?
- [ ] ¿Voy a necesitar CloudFront? Recuerda ACM en us-east-1.

## Mi recomendación por defecto

Si dudas, **empieza en `us-east-2`** para casi todo lo que no sea compliance LATAM:
- Precios bajos
- Latencia aceptable a Colombia
- Mayor estabilidad histórica
- Todos los servicios que necesitas como principiante
- Free tier funciona igual
