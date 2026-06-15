# Búsquedas Especializadas

Full-text, vector/semantic, geo/spatial y time-series con cada motor.

## Full-text search

### PostgreSQL FTS (built-in)

Para empezar y la mayoría de casos. Buena performance hasta millones de docs.

```sql
-- Columna search_vector calculada y mantenida automáticamente
ALTER TABLE articles ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(body, '')), 'B')
    ) STORED;

-- Index GIN
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Query
SELECT id, title,
       ts_rank(search_vector, query) AS rank
FROM articles, plainto_tsquery('spanish', 'inteligencia artificial') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- Con highlights
SELECT
    id,
    ts_headline('spanish', body, query) AS snippet
FROM articles, plainto_tsquery('spanish', 'machine learning') query
WHERE search_vector @@ query;
```

**Features**:
- Stemming (correr/corre/corrieron → mismo término)
- Stopwords (de/la/el ignorados)
- Diccionarios por idioma
- Weights (titulo > body)
- Highlights / snippets
- Ranking básico (ts_rank)

**Limitaciones**:
- No fuzzy matching nativo (sin `pg_trgm`)
- Sin sinónimos / aprendizaje
- Sin faceting eficiente
- Configuración por idioma

**Mejorar con extensiones**:
```sql
-- Fuzzy matching
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_articles_title_trgm ON articles USING GIN (title gin_trgm_ops);

SELECT * FROM articles
WHERE title % 'inteligensia';  -- match aprox
```

### MySQL FTS

```sql
ALTER TABLE articles ADD FULLTEXT INDEX ft_idx_articles (title, body);

SELECT *,
       MATCH(title, body) AGAINST('inteligencia artificial' IN NATURAL LANGUAGE MODE) AS score
FROM articles
WHERE MATCH(title, body) AGAINST('inteligencia artificial' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC;

-- Boolean mode (más control)
SELECT * FROM articles
WHERE MATCH(title, body) AGAINST('+inteligencia -fake' IN BOOLEAN MODE);
```

Menos features que PostgreSQL.

### SQLite FTS5

Sorprendentemente bueno para apps embebidas:

```sql
CREATE VIRTUAL TABLE articles_fts USING fts5(title, body, content='articles', content_rowid='id');

-- Triggers para mantener sync
CREATE TRIGGER articles_ai AFTER INSERT ON articles
    INSERT INTO articles_fts(rowid, title, body) VALUES (NEW.id, NEW.title, NEW.body);

-- Query
SELECT id FROM articles_fts WHERE articles_fts MATCH 'inteligencia';
```

### MongoDB text search

```javascript
// Index de texto
db.articles.createIndex({ title: "text", body: "text" }, {
    weights: { title: 10, body: 1 },
    default_language: "spanish"
});

// Query
db.articles.find({ $text: { $search: "inteligencia artificial" } })
    .sort({ score: { $meta: "textScore" } });
```

Bueno para casos simples. Para serio: Atlas Search (basado en Lucene).

### Elasticsearch / OpenSearch

Para búsqueda avanzada:
- Fuzzy / typo tolerance
- Faceting / aggregations
- Synonyms
- Multi-tenant indexes
- Highlighting avanzado
- ML / Learning to rank

**Cuándo usar**:
- >10M documents
- Búsquedas complejas con facets
- Multi-language sofisticado
- Casos como Stack Overflow, Wikipedia, e-commerce serio

**Trade-offs**:
- Cluster aparte (operación extra)
- Sync desde DB principal (CDC con Debezium, Logical Replication, o aplicación)
- Eventual consistency con la DB

**Setup básico OpenSearch**:
```json
PUT /articles
{
    "settings": {
        "analysis": {
            "analyzer": {
                "spanish_analyzer": {
                    "type": "standard",
                    "stopwords": "_spanish_"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "title": { "type": "text", "analyzer": "spanish_analyzer", "boost": 2 },
            "body":  { "type": "text", "analyzer": "spanish_analyzer" },
            "tags":  { "type": "keyword" },
            "publishedAt": { "type": "date" }
        }
    }
}
```

```json
POST /articles/_search
{
    "query": {
        "bool": {
            "must": [{ "match": { "title": "inteligencia artificial" } }],
            "filter": [{ "term": { "tags": "tech" } }]
        }
    },
    "aggs": {
        "by_tag": { "terms": { "field": "tags" } }
    },
    "highlight": {
        "fields": { "title": {}, "body": {} }
    }
}
```

### Alternativas modernas

- **Meilisearch**: open source, super fácil, perfecto para apps medianas
- **Typesense**: similar a Meilisearch, rápido
- **Algolia**: hosted, excelente UX, caro
- **Atlas Search**: MongoDB managed (basado en Lucene)
- **pg_search / ParadeDB**: BM25 en PostgreSQL

## Vector / Semantic Search

Para "buscar por significado", no por palabras exactas. Base para RAG (Retrieval-Augmented Generation) en aplicaciones de IA.

### Workflow

1. **Embedding**: convertir texto a vector con modelo (OpenAI ada, sentence-transformers, etc.)
2. **Storage**: guardar vectores en DB con index
3. **Query**: convertir pregunta a vector, buscar más cercanos

### pgvector (PostgreSQL)

Lo más práctico si ya usas PG. Soporta cosine, L2, inner product.

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002 dimension
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index HNSW (más rápido, más memoria)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Alternativa: IVFFlat (menos memoria, requiere VACUUM ANALYZE)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Insertar
INSERT INTO documents (content, embedding)
VALUES ('Texto del documento', '[0.1, 0.2, ...]');

-- Buscar similares
SELECT content,
       1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;

-- Híbrido: vector + full-text + metadata
SELECT content
FROM documents
WHERE metadata->>'category' = 'tech'
  AND content_fts @@ plainto_tsquery('AI')
ORDER BY embedding <=> $1 LIMIT 10;
```

**Operadores**:
- `<->`: distancia L2 (euclidean)
- `<#>`: negative inner product
- `<=>`: distancia coseno (más usado para text embeddings)

### Embedding desde código

```python
# Python con OpenAI
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Texto del documento"
)
embedding = response.data[0].embedding  # array de 1536 floats
```

```java
// Java con LangChain4j
EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
    .apiKey(apiKey)
    .modelName("text-embedding-3-small")
    .build();

Embedding embedding = embeddingModel.embed("Texto del documento").content();
float[] vector = embedding.vector();
```

### DBs vectoriales dedicadas

| DB | Cuándo |
|---|---|
| **Pinecone** | Managed, fácil setup, vendor lock-in |
| **Qdrant** | Open source, self-hosted o cloud |
| **Weaviate** | Open source, soporta múltiples vectorizers |
| **Milvus** | Open source, escalable, complejo |
| **Chroma** | Embebido, bueno para apps locales / desarrollo |

**Cuándo dedicado vs pgvector**:
- **>10M vectores** o queries muy frecuentes → dedicado
- **<10M y ya usas PG** → pgvector

### Patrones de uso

**Pattern: RAG (Retrieval-Augmented Generation)**

```
1. Usuario pregunta → embed → buscar top K docs similares
2. Construir prompt con docs + pregunta
3. LLM genera respuesta basada en context
```

```python
def answer_question(question: str) -> str:
    # 1. Embed pregunta
    q_embed = embed(question)

    # 2. Retrieve top 5 relevant docs
    docs = db.query("""
        SELECT content FROM documents
        ORDER BY embedding <=> %s::vector
        LIMIT 5
    """, (q_embed,))

    # 3. LLM con context
    context = "\n\n".join(d.content for d in docs)
    return llm.complete(f"""
        Context: {context}

        Question: {question}

        Answer based on context only:
    """)
```

**Pattern: Hybrid search**

Combinar full-text (BM25) con vector:
```sql
WITH fts AS (
    SELECT id, ts_rank(search_vector, query) * 0.3 AS score
    FROM documents, plainto_tsquery('spanish', 'pregunta') query
    WHERE search_vector @@ query
    LIMIT 50
),
vec AS (
    SELECT id, (1 - (embedding <=> $1::vector)) * 0.7 AS score
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT 50
)
SELECT id, COALESCE(fts.score, 0) + COALESCE(vec.score, 0) AS combined_score
FROM fts FULL OUTER JOIN vec USING (id)
ORDER BY combined_score DESC
LIMIT 10;
```

### Consideraciones

- **Modelo de embedding**: una vez elegido, no cambies sin re-embed todo
- **Dimensiones**: más dimensiones = más memoria y storage
- **Re-embedding** caro (1M docs × 1k tokens × $0.02/1M tokens = $20)
- **Versioning**: tag embeddings con modelo usado

## Geo / Spatial

### PostGIS (PostgreSQL)

El mejor del mercado para geo.

```sql
CREATE EXTENSION postgis;

CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    -- POINT en SRID 4326 (WGS84, lat/long estándar)
    geom GEOGRAPHY(POINT, 4326) NOT NULL
);

CREATE INDEX idx_locations_geom ON locations USING GIST(geom);

-- Insertar
INSERT INTO locations (name, geom) VALUES
    ('Plaza Bolívar', ST_MakePoint(-74.0721, 4.5980)::geography),
    ('Museo del Oro', ST_MakePoint(-74.0719, 4.6019)::geography);

-- Buscar dentro de radio (5km)
SELECT name, ST_Distance(geom, point) AS distance_meters
FROM locations, ST_MakePoint(-74.0721, 4.5980)::geography AS point
WHERE ST_DWithin(geom, point, 5000)
ORDER BY ST_Distance(geom, point);

-- Más cercanos (sin radio fijo)
SELECT name
FROM locations
ORDER BY geom <-> ST_MakePoint(-74.0721, 4.5980)::geography
LIMIT 10;
```

**Tipos geométricos**:
- `POINT`: punto único (lat/long)
- `LINESTRING`: línea (calle, ruta)
- `POLYGON`: área (zona, país)
- `MULTIPOINT`, `MULTIPOLYGON`: colecciones

**`GEOGRAPHY` vs `GEOMETRY`**:
- `GEOGRAPHY`: lat/long con cálculos en superficie de esfera (preciso para distancias grandes)
- `GEOMETRY`: plano cartesiano (más rápido, menos preciso para distancias)

**Recomendación**: `GEOGRAPHY` para casos generales (lat/long del mundo real).

### Operaciones útiles

```sql
-- Punto dentro de polígono
SELECT name FROM zones
WHERE ST_Contains(geom, ST_MakePoint(-74.0721, 4.5980)::geometry);

-- Distancia entre dos puntos (km)
SELECT ST_Distance(
    ST_MakePoint(-74.0721, 4.5980)::geography,
    ST_MakePoint(-74.0500, 4.6000)::geography
) / 1000 AS km;

-- Intersección de polígonos
SELECT a.name, b.name
FROM zones a JOIN zones b ON ST_Intersects(a.geom, b.geom)
WHERE a.id < b.id;

-- Buffer (área alrededor de punto)
SELECT ST_Buffer(geom, 1000) AS area_1km
FROM locations WHERE id = 1;

-- Convertir GeoJSON
SELECT ST_AsGeoJSON(geom) FROM locations;
SELECT ST_GeomFromGeoJSON('{"type":"Point","coordinates":[-74.07,4.60]}');
```

### MongoDB geo

```javascript
db.locations.createIndex({ position: "2dsphere" });

db.locations.insertOne({
    name: "Plaza Bolívar",
    position: {
        type: "Point",
        coordinates: [-74.0721, 4.5980]  // [long, lat]
    }
});

// Dentro de radio
db.locations.find({
    position: {
        $nearSphere: {
            $geometry: { type: "Point", coordinates: [-74.0721, 4.5980] },
            $maxDistance: 5000  // meters
        }
    }
});
```

### Redis Geo

Estructura nativa Redis:
```bash
GEOADD locations -74.0721 4.5980 "Plaza Bolívar"
GEOADD locations -74.0719 4.6019 "Museo del Oro"

GEOSEARCH locations FROMLONLAT -74.0721 4.5980 BYRADIUS 5 km ASC
```

Bueno para casos "encuentra cerca de mí" con tráfico alto.

### MySQL / SQL Server geo

Soportan spatial types pero menos features que PostGIS.

```sql
-- MySQL
CREATE TABLE locations (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    position POINT NOT NULL SRID 4326,
    SPATIAL INDEX(position)
);

INSERT INTO locations (id, name, position)
VALUES (1, 'Plaza', ST_GeomFromText('POINT(-74.0721 4.5980)', 4326));

SELECT name, ST_Distance_Sphere(position, ST_GeomFromText('POINT(-74.0721 4.5980)', 4326)) AS d
FROM locations
WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(-74.0721 4.5980)', 4326)) < 5000;
```

## Time-series

Datos con dimensión temporal: métricas, IoT, eventos, logs.

### Características de datos time-series

- Insert-heavy (millones por hora)
- Queries por rango de tiempo
- Queries con agregaciones (avg, max, percentiles)
- Datos "naturalmente" inmutables
- Datos viejos menos valiosos (retention, downsampling)

### TimescaleDB (PostgreSQL)

Extension que convierte tablas en hypertables (partitioned por tiempo).

```sql
CREATE EXTENSION timescaledb;

CREATE TABLE metrics (
    time        TIMESTAMPTZ NOT NULL,
    device_id   INT NOT NULL,
    temperature DOUBLE PRECISION,
    humidity    DOUBLE PRECISION,
    pressure    DOUBLE PRECISION
);

SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '1 day');

CREATE INDEX idx_metrics_device_time ON metrics (device_id, time DESC);
```

```sql
-- Insertar millones (bulk insert es rápido)
INSERT INTO metrics SELECT
    NOW() - (random() * INTERVAL '30 days'),
    (random() * 100)::INT,
    20 + random() * 10,
    50 + random() * 20,
    1010 + random() * 20
FROM generate_series(1, 1000000);

-- Time bucket queries
SELECT
    time_bucket('1 hour', time) AS hour,
    device_id,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY temperature) AS p95
FROM metrics
WHERE time > NOW() - INTERVAL '24 hours'
GROUP BY hour, device_id
ORDER BY hour DESC;
```

**Continuous aggregates** (materializados, refresh automático):
```sql
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS hour,
    device_id,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp
FROM metrics
GROUP BY hour, device_id;

-- Refresh policy automática
SELECT add_continuous_aggregate_policy('metrics_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);
```

**Retention y compression**:
```sql
-- Comprimir chunks viejos
ALTER TABLE metrics SET (timescaledb.compress, timescaledb.compress_segmentby = 'device_id');
SELECT add_compression_policy('metrics', INTERVAL '7 days');

-- Drop chunks viejos
SELECT add_retention_policy('metrics', INTERVAL '90 days');
```

### InfluxDB

Time-series DB pura.

```
# Insertar (line protocol)
metrics,device_id=1,location=lab1 temperature=22.5,humidity=60 1716120000000000000

# Query (Flux)
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "metrics" and r.device_id == "1")
  |> aggregateWindow(every: 1m, fn: mean)
```

**Cuándo**: solo time-series, sin necesidad de joins relacionales.

### AWS Timestream

Managed, serverless, billing por uso. Good para AWS-only stack.

### ClickHouse

OLAP columnar, brutal para analytics y logs:
- Compresión 10x mejor que PG
- Queries en TB/seg
- Pero NO transaccional

```sql
CREATE TABLE metrics (
    time DateTime,
    device_id UInt32,
    temperature Float64
) ENGINE = MergeTree()
ORDER BY (device_id, time);

SELECT
    toStartOfHour(time) AS hour,
    avg(temperature)
FROM metrics
WHERE time > now() - INTERVAL 24 HOUR
GROUP BY hour;
```

### Anti-patterns en time-series

- ❌ Single tabla normal con millones de rows sin particionar
- ❌ Sin retention policy (DB crece infinito)
- ❌ Indexes inútiles para queries time-range
- ❌ DELETE para limpiar (vacuum dolor); usar DROP partition o retention policy
- ❌ Updates en datos históricos (TS data debe ser inmutable)
- ❌ JOINs complejos con tabla TS (separar dim tables, JOINs solo de bucket result)

## Cuándo cada cosa: árbol final

```
¿Búsqueda de texto?
├── Simple, <10M docs → PostgreSQL FTS
├── Avanzada (fuzzy, facets) → OpenSearch / Elasticsearch / Meilisearch
└── Embebida → SQLite FTS5

¿Búsqueda semántica / vector?
├── Ya usas PG, <10M vectores → pgvector
├── Escala masiva → Pinecone / Qdrant / Weaviate
└── Hybrid (BM25 + vector) → pgvector con FTS, o motores que soporten ambos

¿Geo?
├── Casi cualquier caso → PostgreSQL + PostGIS
├── Solo "near me" simple, cache → Redis Geo
└── App MongoDB existente → MongoDB geo

¿Time-series?
├── Empezando o moderado → TimescaleDB (PG)
├── Escala masiva metricas → InfluxDB / Timestream
└── Analytics + logs combinados → ClickHouse
```

## Checklist de búsquedas especializadas

- [ ] Tipo de búsqueda identificado
- [ ] Volumen y latencia estimados
- [ ] DB elegida (con justificación)
- [ ] Indexes adecuados creados
- [ ] Backup considera estos índices
- [ ] Sync entre DB principal y motor de búsqueda (si aplica)
- [ ] Monitoring de queries lentas
- [ ] Retention policy (TS y vectors costosos)
- [ ] Versioning de embeddings (si vector)
