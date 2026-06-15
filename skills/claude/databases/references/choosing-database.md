# Elección de Base de Datos

Árbol de decisión y comparativa práctica para elegir DB según el caso.

## Las preguntas correctas

Antes de elegir, responder:

1. **¿Estructura de los datos?** — Relacional, document, key-value, time-series, graph, vector
2. **¿Patrón de acceso?** — Queries conocidas vs ad-hoc, joins, full-text, agregaciones
3. **¿Volumen?** — Bytes, registros, requests/seg
4. **¿Latencia requerida?** — Sub-millisecond, millisecond, segundos OK
5. **¿Consistencia?** — Strong (ACID), eventual, session
6. **¿Tipo de operaciones?** — OLTP (transaccional) vs OLAP (analytics)
7. **¿Multi-region?** — Single, multi-master, eventual consistency cross-region
8. **¿Tamaño de equipo y experiencia?** — ¿Conoces el motor? ¿Hay DBAs?
9. **¿Hosted o self-managed?** — Cloud managed (RDS, Atlas) vs self-hosted
10. **¿Presupuesto?** — Free tiers, costos operativos

## Árbol de decisión

```
1. ¿Necesitas ACID + joins + queries ad-hoc?
   └── Sí → SQL (PostgreSQL default)
       │
       ¿Workload OLTP típico?
       ├── Sí → PostgreSQL / MySQL
       └── No (OLAP/analytics) → Redshift / BigQuery / Snowflake / ClickHouse / DuckDB

2. ¿Embebida en app (no servidor)?
   └── Sí → SQLite

3. ¿Key-value de altísima velocidad?
   ├── ¿Persistente y escalable horizontalmente? → DynamoDB
   └── ¿In-memory, cache, sessions? → Redis

4. ¿Documents flexibles con queries variadas?
   ├── ¿Casos típicos? → MongoDB
   └── ¿Ya tienes PostgreSQL? → PostgreSQL JSONB (a menudo suficiente)

5. ¿Time-series (métricas, IoT, eventos)?
   └── TimescaleDB (PG) / InfluxDB / Timestream / ClickHouse

6. ¿Full-text search heavy?
   ├── ¿Empezando o moderado? → PostgreSQL FTS
   └── ¿Avanzado (fuzzy, facets, ML)? → OpenSearch / Elasticsearch / Meilisearch

7. ¿Vector / semantic search?
   ├── ¿Ya tienes PostgreSQL? → pgvector
   └── ¿Dedicado? → Pinecone / Qdrant / Weaviate / Milvus

8. ¿Geo/spatial pesado?
   ├── PostgreSQL + PostGIS (default)
   └── MongoDB con índices geo

9. ¿Graph (relaciones N:M complejas)?
   ├── ¿Workload simple? → PostgreSQL con CTEs recursivas
   └── ¿Pathfinding, recommendations complejas? → Neo4j / Neptune

10. ¿Necesitas multi-master geo-distribuido?
    └── CockroachDB / Spanner / YugabyteDB / DynamoDB Global Tables

11. ¿Realtime sync mobile/web?
    └── Firestore / Realm / Supabase Realtime / RethinkDB
```

## Default seguro

**PostgreSQL** es la respuesta correcta para el 70-80% de proyectos. Razones:

- ACID completo
- Queries SQL estándar + extensiones
- JSON/JSONB para flexibilidad
- Full-text search built-in
- PostGIS para geo
- pgvector para AI
- TimescaleDB para time-series
- Replicación y particiones
- Excelente comunidad y herramientas
- Managed everywhere (RDS, Aurora, GCP Cloud SQL, Azure DB, Supabase, Neon, Crunchy)

**Solo elegir otra DB si tienes una razón concreta**:
- "Es lo que el equipo conoce" → mantener
- "Necesito features que PG no tiene" → evaluar específico
- "Necesito escala que PG no aguanta" → ¿estás seguro? PG aguanta TBs

## Comparativas por dimensión

### Relacionales (SQL)

| | PostgreSQL | MySQL | MariaDB | SQL Server | Oracle | SQLite |
|---|---|---|---|---|---|---|
| Open source | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Licencia comercial libre | ✅ | ✅ (GPL) | ✅ | ❌ | ❌ | ✅ (Public Domain) |
| ACID | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| JSON nativo | JSONB excelente | JSON OK | JSON OK | JSON OK | JSON OK | JSON OK |
| Full-text search | Built-in | Built-in | Built-in | Built-in | Sí | FTS5 |
| Geo | PostGIS (mejor en clase) | Spatial OK | Spatial OK | Sí | Sí | R-Tree |
| Window functions | ✅ | ✅ (8.0+) | ✅ | ✅ | ✅ | ✅ |
| CTEs (WITH) | ✅ | ✅ (8.0+) | ✅ | ✅ | ✅ | ✅ |
| Recursive CTEs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Particionamiento | ✅ | ✅ | ✅ | ✅ | ✅ | Limitado |
| Extensiones | Excelente | Plugins | Plugins | Limitado | Limitado | Limitado |
| Replicación | Streaming, logical | Standard, GTID | Standard, GTID | Always On | Data Guard | N/A |
| Multi-master | Limitado | Group Replication | Galera | Always On | RAC | N/A |
| Soporte cloud managed | Excelente (RDS, Aurora, etc.) | Excelente | OK | Azure SQL, AWS RDS | OCI, RDS | N/A |

**Recomendaciones**:
- **PostgreSQL**: default para nuevos proyectos
- **MySQL/MariaDB**: si tu equipo lo conoce, hosting más barato, apps web simples
- **SQL Server**: ecosistema .NET, requisitos corporativos Windows
- **Oracle**: enterprise legacy, requisitos específicos (RAC, Exadata)
- **SQLite**: embebida en apps (mobile, desktop, CLI tools), tests locales

### NoSQL

| | DynamoDB | MongoDB | Redis | Cassandra |
|---|---|---|---|---|
| Modelo | Key-value/Document | Document | Key-value (estructuras) | Wide column |
| Managed cloud | AWS only | Atlas (multi-cloud) | ElastiCache, Upstash, etc. | AWS Keyspaces, Astra |
| Consistency | Strong/eventual configurable | Strong por default | Strong (single node) | Eventual (tunable) |
| Latencia típica | <10ms | <50ms | <1ms | <10ms |
| Escalabilidad | Casi infinita | Sharding | Cluster | Casi infinita |
| Queries | Patrones definidos | Flexibles | Por clave | Patrones definidos |
| Transactions | Sí (limitadas) | Sí | Multi-key con MULTI/EXEC | Limitadas |
| Costo | Por uso o provisioned | Por instancia | Por instancia | Por nodo |
| Cuándo | Apps serverless, alto throughput predecible | Documents flexibles, queries variadas | Cache, sessions, leaderboards | Write-heavy a escala masiva |

### Especializadas

| Caso | DBs |
|---|---|
| **Time-series** | TimescaleDB, InfluxDB, AWS Timestream, ClickHouse, QuestDB |
| **Vector** | pgvector, Pinecone, Qdrant, Weaviate, Milvus, Chroma |
| **Graph** | Neo4j, AWS Neptune, ArangoDB, JanusGraph |
| **Search** | Elasticsearch, OpenSearch, Meilisearch, Typesense, Algolia |
| **Analytics (OLAP)** | ClickHouse, DuckDB, Druid, BigQuery, Redshift, Snowflake |
| **Event sourcing** | EventStoreDB, Kafka (como log), Postgres |
| **Multi-model** | ArangoDB, Couchbase, OrientDB |
| **NewSQL distribuida** | CockroachDB, Spanner, TiDB, YugabyteDB |

## Casos de uso comunes

### "App SaaS B2B con multi-tenancy"

→ **PostgreSQL** + Row-Level Security para shared schema, o schema-per-tenant.

### "App mobile con sync offline"

→ Cliente: **SQLite** o **Realm**.
→ Servidor: **PostgreSQL** o **Firestore** (si quieres sync built-in).

### "E-commerce típico"

→ **PostgreSQL** para todo + **Redis** para cache de catálogo y sessions.

### "Catálogo con búsqueda avanzada"

→ **PostgreSQL** + **OpenSearch** (sync via Logical Replication o eventos).

### "Logs y métricas internas"

→ **TimescaleDB** o **ClickHouse**. Para logs: **OpenSearch**, Loki, Grafana stack.

### "App IoT con miles de sensores"

→ **TimescaleDB** o **InfluxDB**. **MQTT** + ingesta a la TSDB.

### "App de chat / mensajería"

→ **PostgreSQL** para mensajes + **Redis** para presence y pub/sub. **Cassandra** si escala masiva.

### "Recomendaciones / grafo de usuarios"

→ Empezar con **PostgreSQL** (relaciones simples bastan). **Neo4j** solo si pathfinding / centrality avanzado.

### "RAG / chatbot con knowledge base"

→ **pgvector** + PostgreSQL. **Pinecone** si necesitas escalar masivamente o ya no querés PG.

### "Game leaderboards"

→ **Redis** sorted sets.

### "App con plan free / freemium pequeña"

→ **PostgreSQL** en provider con free tier (Neon, Supabase). **SQLite** + Litestream si tráfico muy bajo.

## Anti-patterns

- ❌ **"Vamos con MongoDB porque escala"**: si no entiendes los patrones de acceso, MongoDB también te muerde
- ❌ **"NoSQL es más rápido"**: depende del caso. PG bien indexado es muy rápido
- ❌ **"DynamoDB porque es serverless"**: sin patrón de acceso claro, terminás con costos altos y rediseños
- ❌ **"Elasticsearch para todo"**: caro, complejo. Empezá con FTS en PostgreSQL
- ❌ **"Redis como DB principal"**: es cache, no source of truth (sin persistence correcta y replica)
- ❌ **"Multi-DB porque cada microservicio merece la suya"**: dispersión, operativo nightmare. Compartir cuando tiene sentido
- ❌ **Cambiar de DB para escapar problemas de diseño**: el problema te sigue. Arreglar el diseño primero
- ❌ **NewSQL/distributed cuando un PG vertical aguanta**: PG single-node aguanta 100k+ writes/seg con buena tuning

## Costos a considerar

Costos no obvios al elegir DB:

1. **Operación**: ¿hay alguien que sepa operar esto?
2. **Backups**: storage extra, retención
3. **Replicación**: 2x+ el costo de compute
4. **Networking cross-AZ/region**: data transfer
5. **Soporte**: comunidad vs enterprise support paid
6. **Migración futura**: ¿qué tan difícil es salir de esta DB?
7. **Tooling**: ORMs, IDEs, dashboards, herramientas de migración disponibles

## Plan de evaluación

Si dudas entre 2-3 opciones:

1. **Define use case concreto** con datos reales (al menos sample)
2. **POC pequeño** en cada opción: schema + queries críticas
3. **Benchmark realista**: con volumen y patrón esperado (no 10 inserts)
4. **Operación**: cómo se despliega, backups, monitoring
5. **Costo proyectado** a 1-3 años
6. **Decide y commit**: la mejor decisión es la que tomas y ejecutás bien

## Recursos para profundizar

- "Designing Data-Intensive Applications" (Martin Kleppmann) — el libro
- PostgreSQL docs: https://www.postgresql.org/docs/
- "The DynamoDB Book" (Alex DeBrie)
- "Database Internals" (Alex Petrov)
- DB-Engines ranking: https://db-engines.com/en/ranking
- Use The Index, Luke: https://use-the-index-luke.com/ (SQL tuning)
