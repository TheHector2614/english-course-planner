# SQL Server y Oracle

Features enterprise, T-SQL y PL/SQL específicos.

## SQL Server

### Cuándo usar

- Ecosistema .NET / Azure
- Requisitos corporativos Windows
- SSRS / SSIS / Power BI integration
- Always On Availability Groups (HA enterprise)

### Versiones

- **SQL Server Express**: gratis, hasta 10 GB DB
- **SQL Server Standard**: PYMEs
- **SQL Server Enterprise**: full features (partition, online ops)
- **SQL Server Developer**: gratis para dev (no prod)
- **Azure SQL Database**: PaaS managed

### Tipos de datos importantes

- `NVARCHAR(n)` o `NVARCHAR(MAX)`: Unicode (preferir sobre VARCHAR)
- `DATETIME2`: mejor precisión que `DATETIME` legacy
- `DATETIMEOFFSET`: con timezone (equivalente TIMESTAMPTZ)
- `DECIMAL(p,s)` para dinero
- `UNIQUEIDENTIFIER`: UUID
- `BIT`: boolean
- `JSON`: almacenado como NVARCHAR(MAX); funciones JSON desde 2016

### T-SQL: características útiles

**MERGE**:
```sql
MERGE users AS target
USING (SELECT 1 AS id, 'Alice' AS name) AS source
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET name = source.name
WHEN NOT MATCHED THEN
  INSERT (id, name) VALUES (source.id, source.name);
```

**Window functions**:
```sql
SELECT
  order_id,
  total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
  SUM(total) OVER (PARTITION BY user_id) AS user_total
FROM orders;
```

**CTEs y recursive CTEs** (igual sintaxis que estándar SQL).

**TRY_CAST / TRY_CONVERT**:
```sql
SELECT TRY_CAST('abc' AS INT);  -- NULL en lugar de error
```

**APPLY** (alternativa a JOIN para correlated subqueries):
```sql
SELECT u.name, o.last_order
FROM users u
CROSS APPLY (
  SELECT TOP 1 created_at AS last_order
  FROM orders WHERE user_id = u.id ORDER BY created_at DESC
) o;
```

### Identity / Sequence

```sql
-- IDENTITY (autoincrement)
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255)
);

-- SEQUENCE (más flexible)
CREATE SEQUENCE seq_order_number START WITH 1000 INCREMENT BY 1;
SELECT NEXT VALUE FOR seq_order_number;
```

### Particionamiento

```sql
CREATE PARTITION FUNCTION pf_orders_by_year (DATE)
AS RANGE RIGHT FOR VALUES ('2024-01-01', '2025-01-01', '2026-01-01');

CREATE PARTITION SCHEME ps_orders_by_year
AS PARTITION pf_orders_by_year ALL TO ([PRIMARY]);

CREATE TABLE orders (
  id INT, created_at DATE, ...
) ON ps_orders_by_year(created_at);
```

### Always On (HA)

Availability Groups: réplicas síncronas o asíncronas con failover.

```sql
-- Crear AG (simplificado)
CREATE AVAILABILITY GROUP ag1
WITH (CLUSTER_TYPE = WSFC)
FOR DATABASE mydb
REPLICA ON
  'server1' WITH (...),
  'server2' WITH (...);
```

### Stored procedures

```sql
CREATE OR ALTER PROCEDURE GetUserOrders
  @user_id INT,
  @from_date DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, total, status
  FROM orders
  WHERE user_id = @user_id
    AND (@from_date IS NULL OR created_at >= @from_date);
END;

-- Llamar
EXEC GetUserOrders @user_id = 1, @from_date = '2026-01-01';
```

### Performance: tools

- **SQL Server Management Studio (SSMS)**: IDE
- **Query Store**: histórico de queries y planes
- **Extended Events**: tracing
- **DMVs** (Dynamic Management Views): metadatos en runtime

```sql
-- Top 10 queries más lentas
SELECT TOP 10
  qs.total_elapsed_time / qs.execution_count AS avg_time_us,
  qs.execution_count,
  SUBSTRING(qt.text, qs.statement_start_offset/2 + 1,
    ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(qt.text)
      ELSE qs.statement_end_offset END - qs.statement_start_offset)/2) + 1) AS query
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_time_us DESC;
```

### Encryption

- **TDE (Transparent Data Encryption)**: encripta data files at-rest
- **Always Encrypted**: columnas específicas, claves en cliente
- **Row-Level Security**: predicates en accesos
- **Dynamic Data Masking**: enmascarar datos sensibles en SELECT

## Oracle

### Cuándo usar

- Apps legacy enterprise
- Workloads transaccionales masivos con RAC
- Compliance / requisitos contractuales
- Ya tienes licencias y conocimiento

### Versiones

- **Oracle Database Express Edition (XE)**: gratis, hasta 12 GB
- **Standard Edition 2**: PYMEs
- **Enterprise Edition**: full features
- **Oracle Cloud (OCI)**: Autonomous Database managed

### Tipos importantes

- `VARCHAR2(n)`: usar siempre (NUNCA `VARCHAR`)
- `NVARCHAR2(n)`: Unicode
- `NUMBER(p,s)`: dinero
- `DATE`: incluye hora (no solo fecha)
- `TIMESTAMP WITH TIME ZONE`
- `CLOB`: texto largo
- `BLOB`: binarios
- `RAW`: binarios chicos
- Boolean **NO existe nativo en SQL** (sí en PL/SQL); usar `CHAR(1)` con check

### PL/SQL: bloques anónimos

```sql
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM users;
  DBMS_OUTPUT.PUT_LINE('Users: ' || v_count);
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/
```

### Sequences (Oracle no tiene IDENTITY hasta 12c)

```sql
-- Pre-12c
CREATE SEQUENCE seq_user_id START WITH 1 INCREMENT BY 1;
INSERT INTO users(id, email) VALUES (seq_user_id.NEXTVAL, 'alice@example.com');

-- 12c+: IDENTITY
CREATE TABLE users (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR2(255)
);
```

### Stored procedures y functions

```sql
CREATE OR REPLACE FUNCTION get_user_order_count(p_user_id IN NUMBER)
RETURN NUMBER
IS
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM orders WHERE user_id = p_user_id;
  RETURN v_count;
END;
/

-- Llamar
SELECT get_user_order_count(1) FROM dual;
```

### Packages (agrupar procs/funcs)

```sql
CREATE OR REPLACE PACKAGE user_pkg AS
  FUNCTION get_user_count RETURN NUMBER;
  PROCEDURE deactivate_user(p_id IN NUMBER);
END user_pkg;
/

CREATE OR REPLACE PACKAGE BODY user_pkg AS
  FUNCTION get_user_count RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM users;
    RETURN v_count;
  END;

  PROCEDURE deactivate_user(p_id IN NUMBER) IS
  BEGIN
    UPDATE users SET is_active = 0 WHERE id = p_id;
    COMMIT;
  END;
END user_pkg;
/
```

### Particionamiento

```sql
CREATE TABLE orders (
  id NUMBER,
  user_id NUMBER,
  created_at DATE,
  total NUMBER(12,2)
)
PARTITION BY RANGE (created_at) (
  PARTITION p_2024 VALUES LESS THAN (DATE '2025-01-01'),
  PARTITION p_2025 VALUES LESS THAN (DATE '2026-01-01'),
  PARTITION p_max VALUES LESS THAN (MAXVALUE)
);
```

### RAC (Real Application Clusters)

Múltiples instances accediendo a una sola DB shared storage. HA + scale out.

Caro (licencias + storage compartido). Solo para workloads muy demandantes.

### Data Guard

Replicación logical o physical para DR.

### Performance: tools

- **AWR (Automatic Workload Repository)**: reports periódicos
- **ASH (Active Session History)**: muestreo en runtime
- **SQL Tuning Advisor**
- **SQL Monitor**

```sql
-- Top queries por elapsed time
SELECT *
FROM (
  SELECT
    sql_id, executions, elapsed_time / executions / 1000000 AS avg_sec,
    SUBSTR(sql_text, 1, 100) AS query
  FROM v$sqlstats
  WHERE executions > 0
  ORDER BY elapsed_time DESC
)
WHERE ROWNUM <= 10;
```

### Encryption

- **Transparent Data Encryption (TDE)**: tablespaces/columnas
- **Network encryption**: tráfico SQL*Net
- **Data Redaction**: enmascaramiento

## Migración a otra DB

Migrar de SQL Server / Oracle a PostgreSQL es común para reducir costos. Pasos:

1. **Schema migration**: usar herramientas como AWS SCT (Schema Conversion Tool), pgloader, Ora2Pg
2. **Data migration**: AWS DMS, herramientas third-party
3. **Stored procedures**: reescribir (PL/SQL → PL/pgSQL, T-SQL → PL/pgSQL)
4. **App changes**: cambios en SQL específico
5. **Cutover**: testing extenso, dual-write, switch

Estimar 6-18 meses para sistemas grandes. Considerar managed migration services.

## Comparación rápida

| Aspecto | SQL Server | Oracle |
|---|---|---|
| Costo licencia | Medio-alto | Muy alto |
| Performance | Excelente | Excelente |
| Procedural | T-SQL | PL/SQL (más rico) |
| HA | Always On | Data Guard, RAC |
| Cloud nativo | Azure SQL DB | OCI Autonomous DB |
| Comunidad | Grande | Más reducida (enterprise) |
| Para nuevos proyectos | Solo si ecosistema .NET o Azure | Casi nunca; PostgreSQL es mejor opción |

## Recomendación

Para **nuevos proyectos**, **PostgreSQL** es casi siempre mejor opción (gratis, excelente, comunidad enorme). SQL Server y Oracle se mantienen en proyectos legacy o con requisitos muy específicos.
