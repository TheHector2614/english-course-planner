# Backups y Replicación

Estrategias de backup, restore testing, replicación, read replicas.

## Principios

### Regla 3-2-1

- **3** copias de los datos
- En **2** medios diferentes
- **1** off-site

Aplicado a cloud:
- DB en vivo (1)
- Backup automático en mismo region (2)
- Backup cross-region o exportado a S3/Glacier (3)

### Backup ≠ Restore

**Un backup no probado no es un backup.** Restore testing periódico OBLIGATORIO.

### RPO y RTO

- **RPO (Recovery Point Objective)**: cuánto data puedes perder. "Tolero perder 5 min de data" → RPO 5 min
- **RTO (Recovery Time Objective)**: cuánto puede estar el sistema caído. "Tolero 1h de downtime" → RTO 1h

Definir antes de elegir estrategia.

## Tipos de backups

### 1. Full backup

Toda la DB. Más espacio, restore simple.

### 2. Incremental

Solo cambios desde el último backup (full o incremental). Menos espacio, restore más complejo (chain de backups).

### 3. Differential

Cambios desde el último FULL. Más espacio que incremental, restore más simple (full + último diff).

### 4. Point-in-time (PITR / continuous)

Combinación de full + WAL/binlog/oplog. Restore a cualquier momento.

## PostgreSQL

### Logical backup: pg_dump

Exporta SQL o archivo personalizado.

```bash
# SQL plano
pg_dump -h localhost -U postgres mydb > mydb.sql

# Custom format (compresión, restore selectivo)
pg_dump -h localhost -U postgres -F c -f mydb.dump mydb

# Solo schema
pg_dump --schema-only mydb > schema.sql

# Solo data
pg_dump --data-only mydb > data.sql

# Todas las DBs
pg_dumpall > all.sql
```

Restore:
```bash
psql mydb < mydb.sql
# o
pg_restore -d mydb mydb.dump
```

**Pros**: portable, restore selectivo (tablas).
**Cons**: lento en DBs grandes, snapshot al inicio.

### Physical backup: pg_basebackup

Copia de los archivos físicos del cluster.

```bash
pg_basebackup -h localhost -U replica -D /backup/dir -F tar -z -P
```

**Pros**: rápido.
**Cons**: misma versión, no selectivo.

### Continuous archiving (PITR)

WAL streaming continuo:

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://mi-bucket/wal/%f'
```

Restore a punto en el tiempo:
```bash
# Restaurar base backup, luego replay de WAL hasta el momento
```

Herramientas que automatizan:
- **pgBackRest** (recomendado)
- **Barman**
- **WAL-G** (cloud-native, S3/GCS/Azure)

### Managed (RDS / Aurora)

- **Automated backups**: continuous + daily snapshot. Retención 0-35 días.
- **Manual snapshots**: persisten hasta que borres.
- **PITR**: restore a cualquier segundo en la retención window.
- **Cross-region snapshots**: copia para DR.

```bash
# Restore a un momento
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier prod-db \
  --target-db-instance-identifier prod-db-restored \
  --restore-time 2026-05-19T12:00:00Z
```

## MySQL

### Logical: mysqldump

```bash
# DB completa
mysqldump -u root -p mydb > mydb.sql

# Múltiples DBs
mysqldump -u root -p --databases db1 db2 > backup.sql

# Todas
mysqldump --all-databases > all.sql

# Solo schema
mysqldump --no-data mydb > schema.sql

# Single transaction (consistent backup, InnoDB)
mysqldump --single-transaction --master-data=2 mydb > mydb.sql
```

Restore:
```bash
mysql mydb < mydb.sql
```

### Physical: Percona XtraBackup

```bash
# Backup hot (no requiere lock)
xtrabackup --backup --target-dir=/backup/full

# Prepare (apply logs)
xtrabackup --prepare --target-dir=/backup/full

# Restore
xtrabackup --copy-back --target-dir=/backup/full
```

### Binary log para PITR

```ini
# my.cnf
[mysqld]
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7
```

Restore a punto en el tiempo: full backup + replay de binlogs.

## MongoDB

### mongodump / mongorestore

```bash
mongodump --uri="mongodb://..." --out=/backups/$(date +%F)
mongorestore --uri="..." /backups/2026-05-19
```

**Cons**: lento en DBs grandes.

### Filesystem snapshots

Con LVM, EBS snapshots, ZFS:
- Hacer `fsyncLock()` en MongoDB
- Snapshot
- `fsyncUnlock()`

Mucho más rápido para DBs grandes.

### Atlas Backups

Continuous backup + on-demand snapshots. Restore PITR a cualquier segundo en la retención.

## DynamoDB

### Point-in-Time Recovery (PITR)

```bash
aws dynamodb update-continuous-backups \
  --table-name app \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

Restore:
```bash
aws dynamodb restore-table-to-point-in-time \
  --source-table-name app \
  --target-table-name app-restored \
  --restore-date-time 2026-05-19T12:00:00Z
```

Retención: 35 días.

### On-demand backups

```bash
aws dynamodb create-backup --table-name app --backup-name app-2026-05-19
```

Persisten hasta que borres.

### Export to S3

```bash
aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:... \
  --s3-bucket mi-bucket
```

Útil para analytics y archivado.

## Redis

### RDB (snapshot)

Snapshot binario cada N segundos:

```
# redis.conf
save 900 1      # cada 900s si 1+ cambios
save 300 10
save 60 10000
dir /var/lib/redis
dbfilename dump.rdb
```

### AOF (Append-Only File)

Log de cada operación. Más durabilidad, más espacio:

```
appendonly yes
appendfsync everysec    # everysec (balance), always (max durability), no (más rápido)
```

### Híbrido (recomendado)

Ambos habilitados. Restore desde AOF (más reciente) si existe, sino RDB.

### ElastiCache backups

Automated daily snapshots + manual snapshots. Restore crea cluster nuevo.

## SQL Server

```sql
-- Full backup
BACKUP DATABASE mydb TO DISK = 'D:\backups\mydb.bak';

-- Differential
BACKUP DATABASE mydb TO DISK = 'D:\backups\mydb_diff.bak' WITH DIFFERENTIAL;

-- Transaction log
BACKUP LOG mydb TO DISK = 'D:\backups\mydb_log.trn';

-- Restore
RESTORE DATABASE mydb FROM DISK = 'D:\backups\mydb.bak';
```

Para PITR: Full + diffs + logs en cadena.

## Oracle

### RMAN (Recovery Manager)

```sql
-- Backup
RMAN> BACKUP DATABASE PLUS ARCHIVELOG;

-- Restore
RMAN> RESTORE DATABASE;
RMAN> RECOVER DATABASE;
```

### Data Pump (logical)

```bash
expdp scott/tiger DIRECTORY=dpump_dir1 DUMPFILE=mydb.dmp
impdp scott/tiger DIRECTORY=dpump_dir1 DUMPFILE=mydb.dmp
```

## Restore testing

### Por qué importa

- Backups que no se restoran son inútiles
- Detección de corrupción
- Práctica del proceso (en emergencia no es momento de aprender)
- Verificación de tiempo (RTO)

### Procedimiento

1. **Periódico**: trimestral mínimo, mensual ideal
2. **Restore real** en infra paralela
3. **Validación**:
   - Conteo de registros vs esperado
   - Smoke tests (queries críticas funcionan)
   - Checksums de datos sensibles
4. **Medir tiempo**: cumple RTO?
5. **Documentar resultados**

### Automatizable

```bash
# Script básico (PostgreSQL)
#!/bin/bash
LATEST=$(aws rds describe-db-snapshots --db-instance-identifier prod \
  --query "DBSnapshots[?Status=='available']|[-1].DBSnapshotIdentifier" --output text)

aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier prod-restore-test \
  --db-snapshot-identifier $LATEST

# Esperar
aws rds wait db-instance-available --db-instance-identifier prod-restore-test

# Conectar y validar
psql -h prod-restore-test... -c "SELECT COUNT(*) FROM users;"

# Limpiar
aws rds delete-db-instance --db-instance-identifier prod-restore-test --skip-final-snapshot
```

## Replicación

### PostgreSQL

#### Streaming replication

```ini
# Primary: postgresql.conf
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB

# Primary: pg_hba.conf
host replication replica 10.0.0.0/24 md5

# Replica: setup
pg_basebackup -h primary -U replica -D /var/lib/postgresql/data -P -R
```

Replica es read-only. Lag típico: ms-segundos.

#### Logical replication

Replicación selectiva (tablas específicas), permite versiones diferentes:

```sql
-- Primary
CREATE PUBLICATION my_pub FOR TABLE users, orders;

-- Replica
CREATE SUBSCRIPTION my_sub CONNECTION 'host=primary ...' PUBLICATION my_pub;
```

Útil para:
- Sync a OpenSearch / data warehouse
- Migración cross-version
- Selective replication

### MySQL

#### Replication setup

```ini
# Primary: my.cnf
[mysqld]
server-id = 1
log_bin = mysql-bin

# Replica
server-id = 2
relay_log = relay-bin
read_only = ON
```

```sql
-- Primary: crear user para replica
CREATE USER 'replica'@'%' IDENTIFIED BY '...';
GRANT REPLICATION SLAVE ON *.* TO 'replica'@'%';

-- Replica: configurar
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = 'primary',
  SOURCE_USER = 'replica',
  SOURCE_PASSWORD = '...',
  SOURCE_LOG_FILE = 'mysql-bin.000001',
  SOURCE_LOG_POS = 0;
START REPLICA;
SHOW REPLICA STATUS;
```

#### GTID-based (recomendado)

```ini
gtid_mode = ON
enforce_gtid_consistency = ON
```

Failover más simple, posición tracked globalmente.

### MongoDB

Replica set (descrito en `mongodb.md`):
- Primary + Secondaries
- Failover automático
- Reads pueden ir a secondary con `readPreference`

### Read Replicas (managed)

| DB | Servicio | Lag típico |
|---|---|---|
| RDS PostgreSQL/MySQL | Read replicas | ~1s |
| Aurora | Aurora replicas | <100ms |
| Azure SQL | Read scale-out | <1s |
| Cloud SQL (GCP) | Read replicas | ~1s |
| ElastiCache Redis | Replicas | <1s |

**Beneficios**:
- Escalar reads
- Reportes sin impactar primary
- DR (cross-region replicas)

**Cuidados**:
- Lag (lecturas obsoletas)
- No usar para writes
- App debe manejar replicas (algunas ORMs lo soportan)

## Disaster Recovery

### Strategies (por costo/RTO)

| Strategy | RTO | RPO | Costo |
|---|---|---|---|
| **Backup & restore** | Horas | Horas | Bajo |
| **Pilot light** | Decenas de min | Min | Medio |
| **Warm standby** | Minutos | Min | Alto |
| **Multi-site active/active** | <Min | ~Cero | Muy alto |

### Por DB

- **PostgreSQL**: streaming replication cross-region o Aurora Global
- **MySQL**: replication cross-region
- **MongoDB**: replica set members cross-region o Atlas Global Clusters
- **DynamoDB**: Global Tables (multi-master cross-region)
- **Redis**: Global Datastore en ElastiCache

### DR drill

Probar el failover periódicamente. En emergencia real no es el momento de descubrir bugs en el runbook.

## Retención

Definir política según compliance y necesidad:

| Tipo | Retención típica |
|---|---|
| Backups diarios | 7-30 días |
| Snapshots semanales | 1-3 meses |
| Snapshots mensuales | 1 año |
| Snapshots anuales | 7+ años (si compliance lo exige) |
| Backups para DR | Documentar tiempo de "warm" |

### Tiered storage

Mover backups viejos a storage más barato:
- S3 Standard → S3 IA → S3 Glacier → S3 Glacier Deep Archive
- Lifecycle policies automáticas

```bash
# Ejemplo: Glacier después de 30 días
{
  "Rules": [{
    "Id": "ArchiveOldBackups",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 30,
      "StorageClass": "GLACIER"
    }, {
      "Days": 180,
      "StorageClass": "DEEP_ARCHIVE"
    }],
    "Expiration": { "Days": 2555 }   // 7 años
  }]
}
```

## Anti-patterns

- ❌ Backup sin restore testing
- ❌ Backups en mismo storage que la DB (rack/AZ failure pierde ambos)
- ❌ Sin retención clara (acumulación o eliminación accidental)
- ❌ Retención infinita "por si acaso" (costos crecen)
- ❌ Sin encryption en backups (sensitive data leakage si bucket comprometido)
- ❌ Snapshot manual y olvidarse (sin tag, sin lifecycle)
- ❌ Replica como backup (replica replica errores, no es backup)
- ❌ No documentar el restore procedure
- ❌ Olvidar backups de configuración (parameter groups, etc.)
- ❌ Solo full backups (caros, lentos; usar incrementales)
- ❌ Sin alerta si backup falla

## Checklist backups

- [ ] Backups automatizados configurados
- [ ] Retención según compliance
- [ ] Backups encriptados (at-rest)
- [ ] Cross-region copy para DR crítico
- [ ] Inmutables (Object Lock en S3 para anti-ransomware)
- [ ] Restore testing periódico (al menos trimestral)
- [ ] RTO/RPO definidos y testeados
- [ ] Runbook de restore documentado
- [ ] Alertas si backup falla
- [ ] Cost monitoring de backup storage
- [ ] Replica para HA en producción (si aplica)
- [ ] Lag de replica monitoreada
- [ ] DR drill anual mínimo
