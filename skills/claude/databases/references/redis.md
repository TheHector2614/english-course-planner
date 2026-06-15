# Redis

In-memory data store. Cache, sessions, queues, leaderboards, pub/sub.

## Cuándo usar Redis

✅ **Sí**:
- Cache de resultados pesados
- Sessions de usuario
- Rate limiting / counters
- Leaderboards
- Distributed locks
- Pub/sub ligero
- Queues simples
- Recent activity feeds

❌ **NO como source of truth para datos críticos** sin replication + persistence + monitoring serio.

## Data structures

### Strings

```bash
SET user:123:name "Alice"
GET user:123:name
SETEX session:abc 3600 "user_data"  # con TTL
INCR counter:visits
INCRBY counter:visits 5
```

**Cuándo**: cache de objetos (JSON serializado), counters.

### Hashes

```bash
HSET user:123 name "Alice" email "alice@x.com" age 30
HGET user:123 name
HGETALL user:123
HINCRBY user:123 age 1
```

**Cuándo**: objetos con campos individuales accesibles.

### Lists

```bash
LPUSH queue:emails "task1" "task2"
RPOP queue:emails

# Bloqueante (useful para queues)
BLPOP queue:emails 0  # espera indefinido
```

**Cuándo**: queues simples, recent items, timeline.

### Sets

```bash
SADD user:123:tags "admin" "premium"
SISMEMBER user:123:tags "admin"
SMEMBERS user:123:tags

# Operaciones de set
SINTER user:1:friends user:2:friends  # mutual friends
SDIFF user:1:friends user:2:friends
SUNION ...
```

**Cuándo**: miembros únicos, tags, mutual friends.

### Sorted Sets

```bash
ZADD leaderboard 100 "alice" 200 "bob" 150 "charlie"
ZRANGE leaderboard 0 -1 WITHSCORES  # ASC
ZREVRANGE leaderboard 0 9 WITHSCORES  # top 10
ZINCRBY leaderboard 10 "alice"  # incrementar score

# Range queries
ZRANGEBYSCORE leaderboard 100 200
```

**Cuándo**: leaderboards, time-ordered queues, priority queues.

### Streams (Redis 5+)

Kafka-lite. Logs append-only con consumer groups.

```bash
XADD events * action "login" user_id 123
XREAD COUNT 10 STREAMS events 0

# Consumer groups
XGROUP CREATE events processors $ MKSTREAM
XREADGROUP GROUP processors worker1 COUNT 10 STREAMS events >
```

**Cuándo**: event streaming sin la complejidad de Kafka.

### Pub/Sub

```bash
SUBSCRIBE channel:notifications
PUBLISH channel:notifications "hello"
```

⚠️ Fire-and-forget. Si subscriber está down, pierde mensajes. Para guaranteed delivery: Streams.

### HyperLogLog

Contar cardinality (uniques) con poca memoria, aproximado.

```bash
PFADD daily_visitors "user1" "user2" "user1"
PFCOUNT daily_visitors  # ~ 2
PFMERGE total_visitors daily_visitors_jan daily_visitors_feb
```

**Cuándo**: count uniques en gran volumen, con ~0.81% error aceptable.

### Geo

```bash
GEOADD locations -74.0721 4.5980 "PlazaBolivar"
GEOSEARCH locations FROMLONLAT -74.0721 4.5980 BYRADIUS 5 km ASC
GEODIST locations "PlazaBolivar" "MuseoOro" km
```

**Cuándo**: "near me" features ligeros, sin necesidad de PostGIS.

### Bitmap

```bash
SETBIT user:123:visits 100 1  # día 100 visitó
BITCOUNT user:123:visits      # cuántos días
```

**Cuándo**: flags compactos, presence tracking.

## Persistence

Redis es **in-memory** pero puede persistir a disco:

### RDB (snapshots)

Snapshots periódicos.
```
# redis.conf
save 900 1      # 1 cambio en 15 min
save 300 10     # 10 cambios en 5 min
save 60 10000   # 10k cambios en 1 min
```

Más eficiente. Pero **puedes perder data entre snapshots** en crash.

### AOF (Append-Only File)

Log de cada operación.
```
appendonly yes
appendfsync everysec  # o always (más seguro), no (más rápido)
```

Pérdida máxima: 1 segundo (con `everysec`).

### Híbrido

`aof-use-rdb-preamble yes` — start desde RDB, después aplicar AOF. Recomendado.

⚠️ Si usas Redis como **cache**, persistence no es crítica.
⚠️ Si usas como **DB**, AOF + replication + backups.

## Replication

### Master-replica

```
# Master por defecto
# Replica config:
replicaof master.example.com 6379
replica-read-only yes
```

Async replication. Replica puede lag en cargas pesadas.

### Sentinel (HA con auto-failover)

Sentinels monitorean master/replicas; si master cae, eligen nuevo.

Setup: 3+ sentinels.

```
# sentinel.conf
sentinel monitor mymaster 192.168.1.10 6379 2  # quorum=2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
```

App conecta a sentinels para discovery.

### Cluster (sharding)

16384 slots distribuidos en N nodes. Cada key hasheada a un slot.

```bash
redis-cli --cluster create \
    192.168.1.10:6379 192.168.1.11:6379 192.168.1.12:6379 \
    192.168.1.13:6379 192.168.1.14:6379 192.168.1.15:6379 \
    --cluster-replicas 1
```

**Limitations**:
- Multi-key operations solo si keys en mismo slot (`{tag}` para forzar)
- Algunas commands no soportadas en cluster mode

**Cuándo**: dataset no cabe en un solo nodo, alto throughput.

## Patterns de uso

### Cache-aside

```python
def get_user(user_id):
    key = f"user:{user_id}"
    cached = redis.get(key)
    if cached:
        return json.loads(cached)

    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    redis.setex(key, 3600, json.dumps(user))  # TTL 1 hour
    return user
```

### Cache invalidation

```python
def update_user(user_id, data):
    db.update("UPDATE users SET ... WHERE id = %s", user_id)
    redis.delete(f"user:{user_id}")  # invalidar cache
```

### Write-through cache

```python
def update_user(user_id, data):
    db.update("UPDATE users SET ... WHERE id = %s", user_id)
    redis.set(f"user:{user_id}", json.dumps(data))  # actualizar cache
```

### Rate limiting

**Token bucket simple**:
```python
def is_allowed(user_id, max_per_min=60):
    key = f"rate:{user_id}:{int(time.time() / 60)}"
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, 60)
    return count <= max_per_min
```

**Sliding window con sorted set**:
```python
def is_allowed(user_id, max_per_min=60):
    key = f"rate:{user_id}"
    now = time.time()
    window_start = now - 60

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, 60)
    _, _, count, _ = pipe.execute()

    return count <= max_per_min
```

### Distributed lock

```python
def acquire_lock(resource, ttl=10):
    token = str(uuid.uuid4())
    acquired = redis.set(f"lock:{resource}", token, nx=True, ex=ttl)
    return token if acquired else None

def release_lock(resource, token):
    # Lua script para atomicity
    script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    end
    return 0
    """
    redis.eval(script, 1, f"lock:{resource}", token)
```

⚠️ Para distributed locks robustos, usar **Redlock** algorithm (con múltiples instances).

### Session storage

```python
def create_session(user_id):
    session_id = str(uuid.uuid4())
    redis.setex(f"session:{session_id}", 3600, json.dumps({"user_id": user_id}))
    return session_id

def get_session(session_id):
    data = redis.get(f"session:{session_id}")
    return json.loads(data) if data else None
```

### Leaderboard

```python
# Incrementar score
redis.zincrby("leaderboard:weekly", 1, f"user:{user_id}")

# Top 10
redis.zrevrange("leaderboard:weekly", 0, 9, withscores=True)

# Posición del user
rank = redis.zrevrank("leaderboard:weekly", f"user:{user_id}")
```

### Queue ligero

```python
# Producer
redis.lpush("queue:emails", json.dumps({"to": "alice@x.com", "subject": "..."}))

# Consumer (bloqueante)
while True:
    _, task_json = redis.brpop("queue:emails")
    task = json.loads(task_json)
    process(task)
```

Para queues serios: **RabbitMQ**, **Kafka**, **SQS** (cloud).

## TTL / Expiración

```bash
SET key value EX 60      # expires in 60s
EXPIRE key 60            # set TTL on existing key
TTL key                  # seconds remaining
PERSIST key              # remove TTL
```

**Cuidado**: si key se actualiza con SET, el TTL se resetea (a no ser que uses KEEPTTL en Redis 7+).

## Eviction policies

Cuando memoria llena:

```
maxmemory 2gb
maxmemory-policy allkeys-lru
```

Policies:
- `noeviction`: errores en writes (default)
- `allkeys-lru`: LRU sobre todas las keys
- `allkeys-lfu`: LFU (Least Frequently Used)
- `volatile-lru`: LRU sobre keys con TTL
- `volatile-ttl`: keys con TTL más bajo primero
- `allkeys-random`: random
- `volatile-random`: random sobre keys con TTL

**Recomendación para cache**: `allkeys-lru` o `allkeys-lfu`.

## Connection pooling

Cliente debe usar pool, no abrir/cerrar por request:

```java
// Jedis (Java)
JedisPool pool = new JedisPool(new JedisPoolConfig(), "redis-host", 6379);
try (Jedis jedis = pool.getResource()) {
    jedis.set("key", "value");
}
```

```python
# Python
import redis
pool = redis.ConnectionPool(host='localhost', port=6379, max_connections=50)
r = redis.Redis(connection_pool=pool)
```

## Lua scripts (atomicity)

Para múltiples operaciones atómicas:

```lua
-- KEYS[1] = key, ARGV[1] = increment, ARGV[2] = max
local current = tonumber(redis.call('GET', KEYS[1]) or 0)
if current + ARGV[1] <= ARGV[2] then
    return redis.call('INCRBY', KEYS[1], ARGV[1])
else
    return -1
end
```

Ejecutar via `EVAL` o `EVALSHA`.

## Security

- **Bind**: no exponer a `0.0.0.0` sin firewall. Default 6379 sin auth = catastrófico.
- **Auth**: `requirepass yourpassword` en config, o ACLs (Redis 6+)
- **TLS**: habilitar en producción
- **ACLs**: usuarios con permisos limitados
```
ACL SETUSER reader on >password ~* +@read
```
- **No Redis pública**: filtros en cloud security groups

## Monitoring

```bash
INFO            # stats globales
INFO memory     # uso de memoria
CLIENT LIST     # conexiones activas
SLOWLOG GET 10  # queries lentos
MEMORY USAGE key  # memoria de una key
DEBUG OBJECT key  # detalles
```

Tools:
- **redis-cli**: básico
- **RedisInsight** (RedisLabs): GUI
- **Prometheus + redis_exporter**

## Common pitfalls

- ❌ Redis sin auth + público
- ❌ KEYS * en producción (bloquea Redis)
- ❌ SAVE manual en master (bloquea, usar BGSAVE)
- ❌ Sin TTL en keys que deberían expirar (memory leak)
- ❌ Usar Redis como DB sin AOF + replication
- ❌ Big keys (cientos de MB) — operaciones lentas
- ❌ Hot keys (1 key recibe todo el tráfico)
- ❌ Sin connection pool
- ❌ Confiar en pub/sub para mensajes críticos (usar Streams)
- ❌ Sharing single Redis para too many use cases (uno se vuelve hot, afecta otros)

## Alternativas

- **KeyDB**: Redis fork multithread
- **DragonflyDB**: Redis-compatible más performant
- **Valkey**: Redis fork open source (después de cambio de licencia de Redis)
- **Memcached**: solo key-value strings, sin features avanzados
- **Hazelcast**: distributed cache enterprise

## Checklist Redis

- [ ] Auth o ACLs habilitados
- [ ] No bind a 0.0.0.0 público
- [ ] TLS si fuera del VPC
- [ ] AOF + RDB para datos críticos
- [ ] Replication si HA importante
- [ ] maxmemory configurado
- [ ] eviction policy elegida
- [ ] Connection pool en clientes
- [ ] TTLs en keys efímeras
- [ ] Monitoring con alertas (memory, slow queries, conexiones)
- [ ] Backups y restore testing
