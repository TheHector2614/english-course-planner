# Health Check de Base de Datos

Checklist completo para auditar la salud de una DB existente.

## Cómo usar este documento

Cuando el usuario pida "audita mi DB", "está bien diseñada", o "qué le falta", recorrer este checklist por categorías. Reportar findings con severidad:

- 🔴 **Crítico**: riesgo de pérdida de datos, exposición de seguridad, downtime inminente
- 🟠 **Alto**: performance significativo, riesgos operativos
- 🟡 **Medio**: mejoras importantes pero no urgentes
- 🟢 **Bajo**: mejoras nice-to-have

## 1. Schema design

### Estructura
- [ ] Tablas tienen PRIMARY KEY
- [ ] Naming consistente (snake_case, plural, etc.)
- [ ] Tipos correctos (`DECIMAL` para dinero, `TIMESTAMPTZ` con timezone)
- [ ] `NOT NULL` donde aplica
- [ ] No hay columnas nullable que deberían ser NOT NULL (señal de mal diseño)
- [ ] FOREIGN KEY constraints declaradas
- [ ] UNIQUE constraints en natural keys
- [ ] CHECK constraints en reglas de negocio
- [ ] No hay EAV (Entity-Attribute-Value) anti-pattern
- [ ] No hay tablas "common" / "config" como cajón de sastre
- [ ] No hay columnas tipo "tag1, tag2, tag3" (debería ser N:M)
- [ ] No hay strings concatenados con IDs (`"1,5,23"`)
- [ ] Datos enumerados en ENUM o CHECK (no strings libres)

### Auditabilidad
- [ ] `created_at`, `updated_at` en entidades importantes
- [ ] Trigger o lógica de app actualiza `updated_at`
- [ ] Soft delete (`deleted_at`) si aplica, con filtro en queries
- [ ] Versionado optimista (`version`) en entidades concurrentes

### Multi-tenancy (si aplica)
- [ ] Estrategia clara (DB-per-tenant, schema, shared)
- [ ] Si shared: `tenant_id` en TODAS las tablas
- [ ] Enforcement de filtrado (RLS o ORM-level)
- [ ] Tests específicos de aislamiento

```sql
-- PostgreSQL: detectar tablas sin PK
SELECT t.table_schema, t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints c
  ON t.table_schema = c.table_schema
  AND t.table_name = c.table_name
  AND c.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND c.constraint_name IS NULL;

-- Detectar columnas TEXT/VARCHAR sin longitud razonable
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE data_type IN ('character varying', 'character')
  AND (character_maximum_length IS NULL OR character_maximum_length > 1000);
```

## 2. Indexes

### Faltantes
- [ ] FKs tienen índice (PostgreSQL no los crea automáticamente)
- [ ] Columnas en WHERE frecuentes tienen índice
- [ ] Columnas en JOIN ON tienen índice
- [ ] Columnas en ORDER BY frecuentes (con WHERE) tienen índice
- [ ] Queries lentas identificadas (slow query log) tienen índices apropiados

```sql
-- PostgreSQL: FKs sin índice
SELECT
  c.conrelid::regclass AS table,
  string_agg(a.attname, ', ') AS columns,
  c.conname AS fk_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
      AND c.conkey[1:array_length(c.conkey, 1)] @> i.indkey::int[]
  )
GROUP BY c.conrelid, c.conname;
```

### Innecesarios
- [ ] No hay índices nunca usados (idx_scan = 0)
- [ ] No hay índices duplicados
- [ ] No hay índices redundantes (cubiertos por compuestos)

```sql
-- PostgreSQL: índices nunca usados
SELECT
  schemaname || '.' || relname AS table,
  indexrelname AS index,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size,
  idx_scan AS scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%'
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Mal diseñados
- [ ] Orden correcto en índices compuestos (cols más selectivas primero o las usadas en más queries)
- [ ] Partial indexes donde aplica (soft delete, status)
- [ ] Covering indexes para queries frecuentes con pocos campos

## 3. Performance

### Queries
- [ ] Slow query log habilitado
- [ ] Top queries lentas identificadas y atendidas
- [ ] `pg_stat_statements` (PG) habilitado
- [ ] No hay N+1 queries en la app (revisar logs)
- [ ] EXPLAIN ANALYZE en queries críticas
- [ ] No hay sequential scans en tablas grandes
- [ ] No hay SELECT * en código de producción
- [ ] OFFSET grandes evitados (usar keyset pagination)
- [ ] COUNT(*) en tablas grandes evitado o cacheado

### Configuración
- [ ] `shared_buffers` ≈ 25% RAM (PG)
- [ ] `work_mem` razonable (no muy alto, considera concurrencia)
- [ ] `maintenance_work_mem` adecuado para VACUUM
- [ ] `random_page_cost` ajustado para SSD (1.1, no 4)
- [ ] `effective_cache_size` ≈ 50-75% RAM
- [ ] Autovacuum/autoanalyze habilitado
- [ ] Estadísticas actualizadas

### Connection pool
- [ ] App usa connection pool (HikariCP, pgbouncer, etc.)
- [ ] Tamaño del pool razonable (10-20 por instancia)
- [ ] `max_connections` de DB no excedido
- [ ] PgBouncer / RDS Proxy si Lambda + RDS
- [ ] Connection leaks monitoreados

### Caché
- [ ] Redis u otra cache delante de queries pesadas
- [ ] Cache invalidation strategy clara
- [ ] Cache hit rate monitoreado

## 4. Seguridad

(Integra con `web-backend-security`)

### Acceso
- [ ] DB NO publicly accessible (no IP pública)
- [ ] Security groups / firewall solo desde apps autorizadas
- [ ] TLS forzado (`require_ssl=on` o equivalente)
- [ ] No usar usuario superuser para la app
- [ ] Usuario de app con least privilege (sin DROP/ALTER)
- [ ] Read-only user para reportes/analytics
- [ ] Passwords fuertes y rotados
- [ ] Credentials en Secrets Manager / Vault (no en código)
- [ ] MFA en accesos administrativos

### Encriptación
- [ ] Encryption at-rest habilitada
- [ ] Encryption in-transit (TLS)
- [ ] Backups encriptados
- [ ] Columnas sensibles encriptadas a nivel app (PII, datos de salud)
- [ ] Keys gestionadas en KMS / Vault
- [ ] Rotación de keys planificada

### Audit
- [ ] Audit logging habilitado (pgaudit, MySQL audit, etc.)
- [ ] Logs centralizados (no solo en la DB)
- [ ] Retention apropiada
- [ ] Alertas en eventos sensibles (privilegios cambiados, accesos fuera de horario)

### Inyección
- [ ] Queries parametrizadas (no string concat)
- [ ] ORM configurado correctamente
- [ ] No hay queries dinámicas peligrosas

```sql
-- Listar usuarios y sus permisos (PostgreSQL)
SELECT
  rolname,
  rolsuper,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin,
  rolreplication
FROM pg_roles
ORDER BY rolname;

-- Privilegios de un user en una tabla
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'users';
```

## 5. Backups

- [ ] Backups automatizados configurados
- [ ] Retention apropiada (compliance + necesidad)
- [ ] Backups encriptados
- [ ] Cross-region copy si DR lo justifica
- [ ] Inmutables (Object Lock) para anti-ransomware
- [ ] **Restore testing periódico** (trimestral mínimo)
- [ ] RTO/RPO definidos y testeados
- [ ] Runbook documentado
- [ ] Alertas si backup falla
- [ ] Cost monitoring de backup storage

```sql
-- PostgreSQL: verificar último backup (depende del setup)
-- Si usas pgBackRest:
-- pgbackrest info

-- RDS:
aws rds describe-db-snapshots --db-instance-identifier prod-db \
  --query 'DBSnapshots[?Status==`available`]|[-1].SnapshotCreateTime'
```

## 6. Replicación y HA

### Si tiene HA
- [ ] Multi-AZ habilitado (RDS) o equivalente
- [ ] Failover testeado
- [ ] Replica lag monitoreado
- [ ] Read replicas para escalar reads (si aplica)
- [ ] App usa replicas para reads no críticos
- [ ] Cross-region para DR crítico

### Si NO tiene HA (señales rojas en prod)
- [ ] ¿Por qué? ¿Se asume el downtime?
- [ ] ¿RTO documentado y aceptado?

```sql
-- PostgreSQL: estado de replicación
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  EXTRACT(EPOCH FROM (now() - reply_time)) AS lag_seconds
FROM pg_stat_replication;
```

## 7. Monitoring

- [ ] CloudWatch / Datadog / Prometheus configurado
- [ ] Métricas core: CPU, RAM, IOPS, connections
- [ ] Métricas DB: slow queries, deadlocks, cache hit ratio, replication lag
- [ ] Alertas configuradas con thresholds razonables
- [ ] Dashboards de operación
- [ ] Logs centralizados
- [ ] Slow query log revisado periódicamente

### Métricas críticas

| Métrica | Threshold típico de alerta |
|---|---|
| CPU sostenido | > 70% por 5 min |
| Connections usadas | > 80% del max |
| Free storage | < 20% |
| Replication lag | > 5s |
| Deadlocks | > 0 por minuto sostenido |
| Cache hit ratio | < 99% (PG buffer cache) |
| IOPS | > 80% del provisioned |

## 8. Maintenance

### PostgreSQL
- [ ] Autovacuum habilitado y funcionando
- [ ] No hay table bloat severo
- [ ] Estadísticas actualizadas (`ANALYZE`)
- [ ] Versión actualizada (no EOL)

```sql
-- Tablas con bloat (requires pgstattuple extension)
CREATE EXTENSION pgstattuple;
SELECT * FROM pgstattuple('users');

-- Última autovacuum/analyze
SELECT relname, last_autovacuum, last_autoanalyze, last_vacuum, last_analyze
FROM pg_stat_user_tables
ORDER BY last_autovacuum DESC NULLS LAST;
```

### MySQL
- [ ] InnoDB buffer pool con cache hit alto
- [ ] No fragmentation severa
- [ ] Versión actualizada

```sql
-- InnoDB buffer pool hit rate
SELECT
  ROUND(
    (1 - (variable_value / (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_read_requests')))*100, 2
  ) AS hit_rate_pct
FROM performance_schema.global_status
WHERE variable_name = 'Innodb_buffer_pool_reads';
```

## 9. Crecimiento y capacidad

- [ ] Tamaño actual y proyección
- [ ] Storage auto-scaling habilitado
- [ ] Tablas grandes identificadas
- [ ] Particionamiento si aplica (>100GB/tabla)
- [ ] Archivado de datos viejos (cold storage)
- [ ] Lifecycle policy para logs/audit antiguos

```sql
-- PostgreSQL: top tablas por tamaño
SELECT
  schemaname || '.' || tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 20;
```

## 10. Documentación

- [ ] ER diagram actualizado
- [ ] Migraciones versionadas en repo (Flyway/Liquibase/etc.)
- [ ] Runbook operacional (cómo conectarse, restaurar, escalar)
- [ ] Decisiones de schema documentadas (ADRs)
- [ ] Convenciones de naming documentadas

## Quick wins típicos

Para reportes ejecutivos, estos son los fixes que más impacto suelen tener:

1. **Agregar índices en FKs** (PostgreSQL no los crea)
2. **Eliminar índices nunca usados** (ahorra writes y storage)
3. **Habilitar backups si no están** o aumentar retention
4. **Cerrar acceso público** si está abierto
5. **Habilitar encryption at-rest**
6. **Mover secrets de código a gestor**
7. **Configurar slow query log y revisar**
8. **Habilitar autovacuum** si está deshabilitado (PG)
9. **Limpiar usuarios huérfanos** y aplicar least privilege
10. **Configurar monitoring y alertas básicas**

## Output esperado

Reporte con estructura:

```markdown
# Auditoría DB: <proyecto>

## Resumen
- Motor: PostgreSQL 16
- Versión: 16.3
- Tamaño total: 234 GB
- Tablas: 89
- Hallazgos: 3 críticos, 8 altos, 12 medios

## Findings

### 🔴 Crítico
- **No hay backups automáticos configurados**
  - Riesgo: pérdida total de datos
  - Recomendación: configurar RDS automated backups con retention 30 días
  - Esfuerzo: 30 min

- **DB publicly accessible**
  - Riesgo: superficie de ataque expuesta a internet
  - Recomendación: setear publicly_accessible = false, configurar VPN/bastion
  - Esfuerzo: 1h

### 🟠 Alto
- **N+1 queries en endpoint /api/orders**
  - 200 queries por request, latencia 5s
  - Fix: agregar JOIN FETCH en JPA query
  - Esfuerzo: 2h

- **15 índices nunca usados ocupan 2 GB**
  - Lista en anexo
  - Esfuerzo: 1h

[...]

## Plan recomendado

### Sprint 1: críticos
1. Habilitar backups (P0)
2. Cerrar acceso público (P0)
3. Habilitar encryption at-rest (P0, requiere migración)

### Sprint 2: performance
1. Fix N+1 queries (P1)
2. Agregar índices faltantes (P1)
3. Eliminar índices no usados (P2)

[...]
```
