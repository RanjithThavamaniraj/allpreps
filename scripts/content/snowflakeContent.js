/**
 * Snowflake interview content for AllPreps track generation.
 * 17 topics × 3 difficulties × 4 variants + 20 production scenarios.
 */

export const TOPIC_CONTENT = {
  'snowflake-architecture': {
    easy: [
      {
        q: "What are the three layers of Snowflake architecture and how do they interact?",
        a: "Snowflake separates cloud services, compute, and storage into independent layers that scale independently.\n• Cloud services layer handles authentication, metadata, query parsing, optimization, and access control—shared across the account.\n• Compute layer consists of virtual warehouses (MPP clusters) that execute queries; warehouses do not store data persistently.\n• Storage layer holds all table data in cloud object storage (S3, Azure Blob, GCS) as encrypted micro-partitions managed by Snowflake.\n• Queries flow: cloud services compile SQL → warehouse reads micro-partitions from storage → results return to client.\n• This separation lets you suspend warehouses to stop compute billing while storage remains available.\n\nInterview tip: contrast with monolithic databases where compute and storage are coupled on the same nodes.",
        cmd: "SHOW WAREHOUSES;\nSHOW DATABASES;\n\nSELECT CURRENT_REGION(), CURRENT_ACCOUNT(), CURRENT_VERSION();",
      },
      {
        q: "How does Snowflake achieve multi-tenant isolation while sharing infrastructure?",
        a: "Snowflake uses a shared-disk, shared-nothing hybrid architecture for secure multi-tenancy.\n• All customer data lives in shared cloud storage, but metadata and encryption keys isolate each account logically.\n• Compute is isolated per virtual warehouse—your queries never run on another customer's warehouse nodes.\n• Cloud services enforce RBAC and query authorization before any data access occurs.\n• Each account has its own metadata catalog; cross-account access requires explicit data sharing grants.\n• Snowflake handles patching, upgrades, and capacity planning transparently without customer downtime windows.\n\nStrong answers mention that you never SSH into Snowflake nodes—everything is managed via SQL and the web UI.",
        cmd: "SELECT CURRENT_ACCOUNT(), CURRENT_ROLE(), CURRENT_USER();\n\nSHOW GRANTS TO ROLE PUBLIC;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.APPLICABLE_ROLES());",
      },
      {
        q: "What is the role of the cloud services layer in query execution?",
        a: "The cloud services layer is Snowflake's \"brain\"—it orchestrates every request before compute touches data.\n• Parses SQL, resolves object names, checks privileges, and builds an optimized distributed execution plan.\n• Maintains the global metadata catalog (databases, schemas, tables, columns, statistics).\n• Coordinates transaction management, locking, and session state across the account.\n• Handles infrastructure tasks: file compaction, clustering maintenance, and replication coordination.\n• Cloud services are highly available and automatically scaled by Snowflake—no customer configuration needed.\n\nWhen queries are slow before execution starts, investigate cloud services latency via QUERY_HISTORY compilation time.",
        cmd: "SELECT query_id, compilation_time, total_elapsed_time, warehouse_name\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE compilation_time > 5000\nORDER BY start_time DESC LIMIT 20;",
      },
      {
        q: "Explain why Snowflake does not require manual index management like traditional RDBMS.",
        a: "Snowflake replaces B-tree indexes with automatic micro-partition metadata and optional clustering keys.\n• Each micro-partition stores min/max statistics per column; the optimizer prunes partitions at query time.\n• No DBA creates or rebuilds indexes—pruning is automatic based on partition metadata.\n• Clustering keys (optional) co-locate related rows within partitions for heavy filter/join columns.\n• Search optimization service can accelerate point lookups on large tables when pruning alone is insufficient.\n• This design trades index maintenance overhead for scan efficiency on columnar, compressed data.\n\nMention that EXPLAIN plan shows partitions scanned vs partitions total as the key pruning metric.",
        cmd: "SELECT SYSTEM$CLUSTERING_INFORMATION('SALES.PUBLIC.ORDERS', '(ORDER_DATE)');\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%ORDERS%'\nORDER BY start_time DESC LIMIT 5;",
      }
    ],
    medium: [
      {
        q: "How do you design warehouse sizing strategy across dev, staging, and production workloads?",
        a: "Warehouse sizing balances query concurrency, queue time, and credit consumption across environments.\n• Dev/staging: X-Small or Small warehouses with aggressive AUTO_SUSPEND (60–300 seconds) to limit waste.\n• Production ETL: Medium–Large multi-cluster warehouses with MIN/MAX clusters for burst concurrency.\n• BI/reporting: separate warehouse from ETL to prevent resource contention and simplify cost attribution.\n• Use QUERY_ACCELERATION_SERVICE for occasional large scans without permanently upsizing warehouses.\n• Tag warehouses with environment and cost_center for ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY analysis.\n\nReview weekly: avg_queue_time, avg_running time, and credits per warehouse to right-size.",
        cmd: "CREATE WAREHOUSE etl_prod WITH\n  WAREHOUSE_SIZE = 'LARGE'\n  AUTO_SUSPEND = 300\n  AUTO_RESUME = TRUE\n  MIN_CLUSTER_COUNT = 1\n  MAX_CLUSTER_COUNT = 3\n  SCALING_POLICY = 'STANDARD';\n\nALTER WAREHOUSE etl_prod SET TAG cost_center = 'data-platform';",
      },
      {
        q: "What happens during a Snowflake platform upgrade and how does it affect running workloads?",
        a: "Snowflake performs rolling upgrades with minimal customer impact due to compute-storage separation.\n• Cloud services upgrades are transparent—new sessions may hit updated services while old sessions complete.\n• Running warehouse queries typically finish; new queries route to upgraded compute nodes.\n• Brief connection retries may occur; client drivers with automatic retry handle this gracefully.\n• New features and SQL functions appear after upgrade; review release notes for breaking changes.\n• Test critical pipelines in a secondary account or clone before production release week.\n\nMonitor RELEASE_CHANNEL setting and subscribe to Snowflake status page for maintenance windows.",
        cmd: "SELECT CURRENT_VERSION();\n\nSHOW PARAMETERS LIKE 'RELEASE_CHANNEL' IN ACCOUNT;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE error_message IS NOT NULL\n  AND start_time > DATEADD(hour, -2, CURRENT_TIMESTAMP())\nORDER BY start_time DESC;",
      },
      {
        q: "Compare single-cluster vs multi-cluster warehouses for concurrent workload patterns.",
        a: "Multi-cluster warehouses auto-scale compute clusters to handle concurrent query bursts.\n• Single-cluster: one set of nodes; concurrent queries share resources or queue—cost predictable but concurrency limited.\n• Multi-cluster (MIN/MAX): Snowflake spins up additional identical clusters when queue builds; scales down when idle.\n• SCALING_POLICY STANDARD favors starting clusters quickly; ECONOMY waits longer to save credits.\n• Best for unpredictable BI dashboards, many concurrent users, or SaaS embedding scenarios.\n• Not needed for sequential ETL where one large warehouse processes jobs back-to-back.\n\nWatch WAREHOUSE_LOAD_HISTORY for queuing patterns before enabling multi-cluster.",
        cmd: "ALTER WAREHOUSE bi_wh SET\n  MIN_CLUSTER_COUNT = 1\n  MAX_CLUSTER_COUNT = 4\n  SCALING_POLICY = 'STANDARD';\n\nSELECT warehouse_name, avg_running, avg_queued_load, avg_blocked\nFROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -7, CURRENT_TIMESTAMP())\n));",
      },
      {
        q: "How do you implement disaster recovery architecture using Snowflake cross-region features?",
        a: "DR architecture leverages account replication and failover for RPO/RTO targets.\n• Account replication copies databases, shares, users, and roles to a secondary region on a schedule.\n• Failover promotes secondary account to primary—planned for region outage or DR drill.\n• For table-level needs, database replication or external backup to secondary cloud region suffices.\n• Document RPO from replication refresh lag and RTO from failover runbook steps including DNS/connection string updates.\n• Test failover quarterly in non-prod replica account before relying on it in production.\n\nPair with client connection strings that support account locator failover URLs.",
        cmd: "SHOW REPLICATION DATABASES;\n\nALTER DATABASE prod_db REFRESH;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.DATABASE_REPLICATION_USAGE_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -7, CURRENT_TIMESTAMP())\n));",
      }
    ],
    hard: [
      {
        q: "Design a Snowflake account architecture for a global enterprise with data residency in EU and US.",
        a: "Global architecture maps legal boundaries to accounts while preserving governed analytics.\n• Separate Snowflake accounts per region (EU, US) with data stored in-region—no cross-border storage.\n• Organization account centralizes billing, user provisioning via SCIM, and security policy templates.\n• Cross-region analytics via Secure Data Sharing on aggregated datasets or Snowflake Marketplace listings.\n• Replication for DR within region; never replicate PII across borders without legal review.\n• Central platform team publishes naming standards, RBAC templates, and Terraform modules.\n\nPresent diagram: Org → Regional Accounts → Env databases (DEV/STG/PRD) → Role hierarchy per domain.",
        cmd: "CREATE DATABASE eu_prod;\nCREATE SHARE eu_kpi_share;\nGRANT USAGE ON DATABASE eu_prod TO SHARE eu_kpi_share;\nGRANT SELECT ON TABLE eu_prod.analytics.daily_kpis TO SHARE eu_kpi_share;\n\nALTER SHARE eu_kpi_share ADD ACCOUNTS = US_ANALYTICS_ACCOUNT;",
      },
      {
        q: "Lead an incident review where a misconfigured warehouse caused a 10x credit spike — what do you present?",
        a: "Structure the review around timeline, root cause, blast radius, and systemic fixes.\n• Timeline: oversized warehouse left running 24/7, AUTO_SUSPEND disabled during debugging, spike detected on monthly invoice.\n• Root cause: human config change bypassed IaC; no alerting on sustained warehouse uptime or daily credit threshold.\n• Impact: budget breach and FinOps escalation; no data corruption.\n• Fixes: re-enable AUTO_SUSPEND, downsize warehouse, enforce RESOURCE MONITOR, Terraform-only warehouse changes.\n• Prevention: account-level budget alerts, weekly credit review dashboard, deny direct ACCOUNTADMIN warehouse DDL in prod.\n\nDeliverables: runbook update, IaC drift detection, training for on-call engineers.",
        cmd: "SELECT warehouse_name, SUM(credits_used) AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD(day, -30, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 2 DESC;\n\nCREATE RESOURCE MONITOR prod_limit WITH CREDIT_QUOTA = 5000\n  FREQUENCY = MONTHLY TRIGGERS ON 80 PERCENT DO NOTIFY\n  ON 100 PERCENT DO SUSPEND;",
      },
      {
        q: "How would you evaluate Snowflake vs a cloud-native warehouse for a greenfield analytics platform?",
        a: "Evaluation requires workload-fit analysis across performance, ops burden, cost model, and ecosystem.\n• Snowflake: separation of compute/storage, instant cloning, data sharing, minimal tuning—strong for multi-cloud and SaaS patterns.\n• BigQuery: serverless slots, deep GCP integration—strong for GCP-native shops with unpredictable query patterns.\n• Redshift: reserved capacity, tight AWS integration—strong for steady-state heavy ETL on AWS with ops tolerance.\n• PoC criteria: p95 query latency on representative SQL, credit/cost per TB scanned, concurrency under 50 users, VARIANT handling.\n• TCO includes data egress, third-party tool compatibility, and hiring market for platform skills.\n\nPresent weighted scorecard with 90-day PoC results, not vendor marketing claims.",
        cmd: "SELECT warehouse_name, AVG(total_elapsed_time)/1000 AS avg_sec,\n       SUM(bytes_scanned)/POWER(1024,3) AS gb_scanned\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time > DATEADD(day, -7, CURRENT_TIMESTAMP())\n  AND execution_status = 'SUCCESS'\nGROUP BY 1;",
      },
      {
        q: "Explain Snowflake's query result caching and when it helps or misleads performance testing.",
        a: "Snowflake caches query results for 24 hours when underlying micro-partitions are unchanged.\n• Identical query text + same warehouse + unchanged data → result served from cache (0 credits for re-execution).\n• Metadata cache and warehouse local disk cache also accelerate repeated scans.\n• Performance testing pitfall: second run appears 100x faster due to cache—always note cold vs warm in benchmarks.\n• Use QUERY_TAG and disable result reuse awareness when comparing optimization changes.\n• RESULT_SCAN() retrieves prior query results without re-running SQL.\n\nProduction benefit: BI dashboards with repeated queries cost near-zero after first run per day.",
        cmd: "SELECT * FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()));\n\nALTER SESSION SET USE_CACHED_RESULT = FALSE;\n\nSELECT query_id, bytes_scanned, credits_used_compute_storage\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nORDER BY start_time DESC LIMIT 10;",
      }
    ],
  },

  'virtual-warehouses': {
    easy: [
      {
        q: "What is a virtual warehouse in Snowflake and what resources does it provide?",
        a: "A virtual warehouse is Snowflake's compute cluster that executes queries and DML operations.\n• Warehouses come in sizes from X-Small to 6X-Large; each size doubles compute and credit cost.\n• Warehouses are independent—ETL and BI workloads should use separate warehouses to avoid contention.\n• Data is not stored on warehouse nodes; they read from shared cloud storage on demand.\n• Warehouses can be started, suspended, resized, and dropped without affecting stored data.\n• Billing is per-second while running, with 60-second minimum per resume.\n\nKey interview point: suspending a warehouse stops compute charges immediately.",
        cmd: "CREATE WAREHOUSE analytics_wh WITH\n  WAREHOUSE_SIZE = 'MEDIUM'\n  AUTO_SUSPEND = 300\n  AUTO_RESUME = TRUE;\n\nALTER SESSION SET WAREHOUSE = analytics_wh;\nSELECT CURRENT_WAREHOUSE();",
      },
      {
        q: "Explain AUTO_SUSPEND and AUTO_RESUME settings on a warehouse.",
        a: "AUTO_SUSPEND and AUTO_RESUME control warehouse lifecycle and cost.\n• AUTO_SUSPEND: seconds of inactivity before warehouse suspends; 0 disables auto-suspend (avoid in dev/prod).\n• AUTO_RESUME: when TRUE, queries automatically resume a suspended warehouse (brief startup delay).\n• Suspended warehouses incur zero compute credits; storage costs continue separately.\n• Typical dev setting: AUTO_SUSPEND = 60–300; prod ETL may use 600 if jobs run hourly.\n• Users may see 1–2 second delay on first query after suspend while warehouse resumes.\n\nCost leak pattern: warehouse never suspends because periodic lightweight query keeps it alive.",
        cmd: "ALTER WAREHOUSE dev_wh SET AUTO_SUSPEND = 120 AUTO_RESUME = TRUE;\n\nSHOW WAREHOUSES LIKE 'dev_wh';\n\nSELECT warehouse_name, state, started_clusters, running\nFROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(\n  DATE_RANGE_START => DATEADD(hour, -24, CURRENT_TIMESTAMP())\n));",
      },
      {
        q: "What is the difference between warehouse size and number of clusters?",
        a: "Warehouse size controls power per cluster; cluster count controls parallelism across concurrent workloads.\n• Size (XS to 6XL): more CPUs, memory, and local cache per node—faster individual queries.\n• Single cluster: all concurrent queries share one cluster's resources.\n• Multi-cluster (MIN/MAX): Snowflake adds clusters when queries queue; each cluster is same size.\n• Doubling size helps query speed; adding clusters helps concurrent user count.\n• Resize is instant without data movement; cluster scaling takes seconds to minutes.\n\nRight-size by measuring whether queries are CPU-bound (resize up) or queuing (add clusters).",
        cmd: "ALTER WAREHOUSE etl_wh SET WAREHOUSE_SIZE = 'LARGE';\n\nALTER WAREHOUSE bi_wh SET MIN_CLUSTER_COUNT = 1 MAX_CLUSTER_COUNT = 3;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_METERING_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -7, CURRENT_TIMESTAMP())\n));",
      },
      {
        q: "How do you assign a default warehouse to a user or role?",
        a: "Default warehouses simplify onboarding and prevent queries from failing with no warehouse selected.\n• User-level: ALTER USER sets DEFAULT_WAREHOUSE for that user's sessions.\n• Role-level: ALTER ROLE can set DEFAULT_WAREHOUSE inherited when role is active.\n• Session override: USE WAREHOUSE or ALTER SESSION SET WAREHOUSE for ad-hoc changes.\n• Service accounts for ETL should have dedicated warehouses sized for batch workloads.\n• Avoid sharing one Small warehouse across all users in prod—causes queuing and noisy neighbor issues.\n\nDocument warehouse assignment matrix: role → warehouse → size → auto_suspend policy.",
        cmd: "ALTER USER etl_svc SET DEFAULT_WAREHOUSE = etl_wh DEFAULT_ROLE = etl_role;\n\nALTER ROLE analyst SET DEFAULT_WAREHOUSE = bi_wh;\n\nGRANT USAGE ON WAREHOUSE bi_wh TO ROLE analyst;",
      }
    ],
    medium: [
      {
        q: "How do you troubleshoot queries queuing on a warehouse during peak BI hours?",
        a: "Query queuing indicates insufficient compute for concurrent demand.\n• Check WAREHOUSE_LOAD_HISTORY for avg_queued_load and avg_blocked metrics trending up.\n• Review QUERY_HISTORY for queries_running > warehouse capacity; identify long-running queries hogging slots.\n• Short-term: enable multi-cluster scaling or temporarily resize warehouse up one size.\n• Medium-term: separate heavy ETL from interactive BI; schedule large scans off-peak.\n• Enable QUERY_ACCELERATION_SERVICE for overflow queries beyond warehouse capacity.\n\nSet alert when queue time p95 exceeds SLA threshold (e.g., 30 seconds for dashboards).",
        cmd: "SELECT warehouse_name, avg_running, avg_queued_load\nFROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -3, CURRENT_TIMESTAMP())\n));\n\nALTER WAREHOUSE bi_wh SET MAX_CLUSTER_COUNT = 5;\n\nALTER WAREHOUSE bi_wh SET ENABLE_QUERY_ACCELERATION = TRUE\n  QUERY_ACCELERATION_MAX_SCALE_FACTOR = 4;",
      },
      {
        q: "What is QUERY_ACCELERATION_SERVICE and when should you enable it?",
        a: "Query Acceleration Service (QAS) borrows extra compute for individual queries beyond warehouse capacity.\n• Enabled per warehouse; Snowflake allocates additional resources for eligible long-running queries.\n• QUERY_ACCELERATION_MAX_SCALE_FACTOR caps how much extra compute (1–100x) a query can use.\n• Best for occasional large scans on otherwise right-sized warehouses—avoids permanent upsizing.\n• Not a substitute for clustering, pruning, or proper warehouse sizing for daily heavy workloads.\n• Additional credits billed for acceleration compute beyond base warehouse cost.\n\nEnable when p95 query time spikes are rare but SLA-critical; monitor credits_used_query_acceleration.",
        cmd: "ALTER WAREHOUSE reporting_wh SET\n  ENABLE_QUERY_ACCELERATION = TRUE\n  QUERY_ACCELERATION_MAX_SCALE_FACTOR = 8;\n\nSELECT query_id, query_acceleration_bytes_scanned, warehouse_size\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_acceleration_partitions_scanned > 0\n  AND start_time > DATEADD(day, -7, CURRENT_TIMESTAMP());",
      },
      {
        q: "How do you implement warehouse resource governance with resource monitors?",
        a: "Resource monitors cap credit consumption at account or warehouse level with automated actions.\n• CREATE RESOURCE MONITOR with CREDIT_QUOTA and FREQUENCY (daily, weekly, monthly, yearly).\n• TRIGGERS: NOTIFY at threshold, SUSPEND warehouses, or SUSPEND_IMMEDIATE to kill running queries.\n• Assign monitor to warehouse: ALTER WAREHOUSE SET RESOURCE_MONITOR = monitor_name.\n• Account-level monitor protects against runaway spend; warehouse-level for team chargeback.\n• SUSPEND_IMMEDIATE is disruptive—use NOTIFY first, SUSPEND at hard cap for non-prod.\n\nPair with tagging and USAGE views for showback dashboards per cost center.",
        cmd: "CREATE RESOURCE MONITOR etl_monitor WITH\n  CREDIT_QUOTA = 500 FREQUENCY = MONTHLY\n  START_TIMESTAMP = IMMEDIATELY\n  TRIGGERS ON 75 PERCENT DO NOTIFY\n           ON 100 PERCENT DO SUSPEND;\n\nALTER WAREHOUSE etl_wh SET RESOURCE_MONITOR = etl_monitor;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.RESOURCE_MONITORS;",
      },
      {
        q: "Compare GEN1 vs GEN2 warehouse types and migration considerations.",
        a: "Snowflake introduced GEN2 warehouses with improved performance characteristics for many workloads.\n• GEN2: better price/performance on newer hardware; improved local SSD cache behavior.\n• Migration: CREATE new GEN2 warehouse, redirect workloads, compare QUERY_HISTORY metrics, decommission GEN1.\n• Not all regions/features support GEN2 immediately—check account parameters and release notes.\n• Some specialized workloads may need A/B testing before cutover.\n• Warehouse type set at creation; cannot convert in place—create parallel warehouse instead.\n\nDocument rollback plan: keep GEN1 warehouse suspended for one sprint after migration validation.",
        cmd: "CREATE WAREHOUSE etl_wh_gen2 WITH\n  WAREHOUSE_TYPE = 'STANDARD'\n  WAREHOUSE_SIZE = 'LARGE'\n  AUTO_SUSPEND = 300;\n\nSHOW WAREHOUSES;\n\nSELECT warehouse_name, AVG(total_elapsed_time) AS avg_ms\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time > DATEADD(day, -14, CURRENT_TIMESTAMP())\nGROUP BY 1;",
      }
    ],
    hard: [
      {
        q: "Design a warehouse fleet for 500 concurrent Tableau users with sub-10-second dashboard SLA.",
        a: "High-concurrency BI requires multi-cluster warehouses, workload isolation, and caching strategy.\n• Dedicated BI warehouse: Large or X-Large with MIN=2, MAX=10 clusters, SCALING_POLICY=STANDARD.\n• Separate warehouses per business unit if chargeback and blast-radius isolation required.\n• Enable query result cache; encourage consistent SQL text in Tableau (no random comments breaking cache).\n• Materialized views or dynamic tables for heavy aggregations—dashboards hit pre-computed data.\n• Monitor WAREHOUSE_LOAD_HISTORY queue metrics; auto-scale MAX clusters before SLA breach.\n• Tableau extract refresh on separate ETL warehouse off-peak—never share with live queries.\n\nLoad test with 500 simulated concurrent queries before go-live; document cluster scale-up latency.",
        cmd: "CREATE WAREHOUSE tableau_wh WITH\n  WAREHOUSE_SIZE = 'X-LARGE'\n  MIN_CLUSTER_COUNT = 2\n  MAX_CLUSTER_COUNT = 10\n  SCALING_POLICY = 'STANDARD'\n  AUTO_SUSPEND = 600;\n\nGRANT USAGE ON WAREHOUSE tableau_wh TO ROLE tableau_users;\n\nSELECT warehouse_name, avg_queued_load, avg_running\nFROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(\n  DATE_RANGE_START => DATEADD(hour, -4, CURRENT_TIMESTAMP())\n));",
      },
      {
        q: "How would you optimize warehouse costs by 40% without missing nightly ETL SLAs?",
        a: "FinOps on warehouses targets waste, right-sizing, and scheduling—not arbitrary downsizing.\n• Baseline: WAREHOUSE_METERING_HISTORY credits by warehouse; identify 24/7 running warehouses.\n• Quick wins: enforce AUTO_SUSPEND ≤300s, terminate idle dev warehouses nightly via task.\n• Right-size: if queries finish in <30s on Large, test Medium; use QUERY_HISTORY execution time distribution.\n• Schedule: resize ETL warehouse UP only during batch window via ALTER WAREHOUSE cron task.\n• Multi-cluster MAX too high wastes credits—tune down after measuring peak concurrency.\n\nPresent 30/60/90-day plan with measured SLA impact at each step; never cut prod SLA for savings.",
        cmd: "SELECT warehouse_name,\n       SUM(credits_used) AS credits,\n       COUNT(DISTINCT DATE_TRUNC('hour', start_time)) AS active_hours\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD(day, -30, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY credits DESC;\n\nALTER WAREHOUSE etl_wh SET WAREHOUSE_SIZE = 'MEDIUM';",
      },
      {
        q: "Lead incident response when RESOURCE MONITOR SUSPEND_IMMEDIATE killed production ETL mid-run.",
        a: "This is a credit governance failure causing pipeline outage and downstream data staleness.\n• Detect: ETL tasks fail with \"warehouse suspended\" errors; data freshness alerts fire.\n• Triage: check RESOURCE_MONITOR trigger history; confirm quota miscalculation or wrong monitor assignment.\n• Mitigate: temporarily increase quota or remove monitor; resume warehouse; replay failed task runs from stream offsets.\n• Communicate: stakeholder notification on stale dashboards; ETA for catch-up completion.\n• Root cause: prod warehouse assigned dev monitor quota; or monthly quota not adjusted for data growth.\n• Prevent: NOTIFY-only triggers in prod, separate monitors per environment, IaC for monitor definitions.\n\nPostmortem includes credit forecast model update and approval workflow for quota changes.",
        cmd: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.RESOURCE_MONITOR_HISTORY\nWHERE start_time > DATEADD(day, -1, CURRENT_TIMESTAMP());\n\nALTER RESOURCE MONITOR etl_monitor SET CREDIT_QUOTA = 2000;\n\nALTER WAREHOUSE etl_wh RESUME IF SUSPENDED;",
      },
      {
        q: "Explain warehouse locking behavior during DDL and impact on concurrent DML workloads.",
        a: "Snowflake uses metadata locking that differs from traditional row-level lock contention on warehouses.\n• DDL operations (ALTER TABLE, SWAP) may block concurrent DML on same table briefly during metadata update.\n• Warehouse suspension does not roll back running queries—queries complete or fail on SUSPEND IMMEDIATE.\n• Multiple warehouses can DML same table concurrently; Snowflake handles row-level conflict detection.\n• Long-running DDL on large table (ADD COLUMN) is metadata-only in Snowflake—fast, minimal blocking.\n• CLONE and SWAP are metadata operations—instant pointer swaps without data copy.\n\nDesign ETL to use SWAP for blue-green deploys instead of in-place DELETE+INSERT during business hours.",
        cmd: "ALTER TABLE staging.orders SWAP WITH prod.orders;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%SWAP%'\nORDER BY start_time DESC LIMIT 10;\n\nSHOW TRANSACTIONS;",
      }
    ],
  },

  'databases-and-schemas': {
    easy: [
      {
        q: "What is the hierarchy of database objects in Snowflake?",
        a: "Snowflake organizes objects in a logical hierarchy from account down to individual columns.\n• Account contains databases; databases contain schemas; schemas contain tables, views, stages, streams, tasks.\n• Fully qualified name: database.schema.object (e.g., PROD.SALES.ORDERS).\n• Each database has its own storage quota accounting; schemas are namespaces for organization only.\n• USE DATABASE and USE SCHEMA set session context for unqualified object references.\n• INFORMATION_SCHEMA and ACCOUNT_USAGE provide metadata views at account level.\n\nUnlike Oracle, schemas in Snowflake are not tied to users— they are pure namespaces.",
        cmd: "CREATE DATABASE analytics;\nCREATE SCHEMA analytics.staging;\nCREATE TABLE analytics.staging.raw_events (id INT, payload VARIANT);\n\nSHOW SCHEMAS IN DATABASE analytics;\nSHOW TABLES IN SCHEMA analytics.staging;",
      },
      {
        q: "How do you create and switch between databases in a session?",
        a: "Session context determines where unqualified DDL/DML applies.\n• CREATE DATABASE creates a new logical container; requires CREATE DATABASE privilege.\n• USE DATABASE switches context; subsequent CREATE TABLE lands in that database.\n• USE SCHEMA further narrows context within the current database.\n• SHOW DATABASES lists accessible databases based on current role grants.\n• DROP DATABASE removes database and all contained objects—irreversible without Time Travel on tables.\n\nBest practice: explicit three-part names in production ETL to avoid wrong-database accidents.",
        cmd: "USE DATABASE prod;\nUSE SCHEMA sales;\n\nSELECT CURRENT_DATABASE(), CURRENT_SCHEMA();\n\nCREATE TABLE prod.sales.orders (order_id INT, order_date DATE);",
      },
      {
        q: "Explain TRANSIENT vs permanent databases and when to use each.",
        a: "Database permanence controls Time Travel and Fail-safe retention for all tables within.\n• Permanent (default): full Time Travel retention and Fail-safe protection on all tables.\n• TRANSIENT database: tables inherit no Fail-safe; reduced Time Travel—lower storage cost for staging.\n• Use TRANSIENT for ETL staging, temp analytics, rebuildable data with external source of truth.\n• Production curated data should live in permanent databases for recovery guarantees.\n• Changing database type after creation requires recreation—plan at design time.\n\nStaging → swap pattern: load in TRANSIENT staging, validate, SWAP into permanent prod schema.",
        cmd: "CREATE TRANSIENT DATABASE etl_staging;\nCREATE SCHEMA etl_staging.raw;\n\nSHOW DATABASES LIKE 'etl_staging';\n\nSELECT database_name, retention_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.DATABASES\nWHERE database_name = 'ETL_STAGING';",
      },
      {
        q: "What is a schema and how does it differ from a database in Snowflake?",
        a: "Schemas are namespaces within a database for organizing related objects.\n• One database can hold hundreds of schemas (bronze, silver, gold, staging, etc.).\n• Schemas do not isolate storage billing—that is at database level.\n• GRANT privileges at schema level to delegate ownership to domain teams.\n• CREATE SCHEMA requires USAGE on parent database and CREATE SCHEMA privilege.\n• Managed access schemas centralize privilege management—only schema owner grants on objects.\n\nMedallion pattern: prod.bronze, prod.silver, prod.gold schemas in one production database.",
        cmd: "CREATE SCHEMA prod.silver;\nGRANT USAGE ON SCHEMA prod.silver TO ROLE data_engineer;\nGRANT CREATE TABLE ON SCHEMA prod.silver TO ROLE data_engineer;\n\nSHOW GRANTS ON SCHEMA prod.silver;",
      }
    ],
    medium: [
      {
        q: "How do you implement environment separation using databases vs schemas?",
        a: "Environment isolation strategy affects security boundaries, cloning, and promotion workflows.\n• Separate databases per env (DEV_DB, STG_DB, PROD_DB): strongest isolation, independent Time Travel, easy clone-to-stg promotion.\n• Separate schemas in one database (dev.sales, prod.sales): simpler naming but weaker isolation—risk of wrong-schema writes.\n• Enterprise pattern: one database per environment per domain with replicated schema structure.\n• CI/CD promotes code + DDL; data promotion via CLONE or replication refresh.\n• RBAC: prod roles have no USAGE on dev databases.\n\nDocument decision matrix: regulatory requirements favor separate databases; small teams may use schemas.",
        cmd: "CREATE DATABASE dev CLONE prod;\n\nGRANT USAGE ON DATABASE dev TO ROLE developer;\nREVOKE USAGE ON DATABASE prod FROM ROLE developer;\n\nSHOW GRANTS TO ROLE developer;",
      },
      {
        q: "What are managed access schemas and when should you enable them?",
        a: "Managed access schemas restrict privilege grants to the schema owner only.\n• ENABLE MANAGED ACCESS on schema: only schema owner (or role with MANAGE GRANTS) can grant on objects inside.\n• Prevents object owners from granting access independently—centralized governance.\n• Required for some compliance frameworks where ad-hoc sharing must be blocked.\n• Trade-off: slower self-service; every access request goes through schema owner.\n• Combine with future grants for automatic privilege on new tables.\n\nUse in production curated layers; avoid in sandbox dev schemas where engineers need autonomy.",
        cmd: "CREATE SCHEMA prod.gold WITH MANAGED ACCESS;\n\nALTER SCHEMA prod.gold ENABLE MANAGED ACCESS;\n\nGRANT SELECT ON FUTURE TABLES IN SCHEMA prod.gold TO ROLE bi_readonly;\n\nSHOW GRANTS ON SCHEMA prod.gold;",
      },
      {
        q: "How do you migrate objects between schemas without data copy?",
        a: "Snowflake metadata operations enable fast object moves when restructuring namespaces.\n• ALTER TABLE ... RENAME TO new_schema.table moves table metadata—no data copy, instant.\n• Works for views, stages, streams if dependencies allow.\n• RENAME DATABASE and RENAME SCHEMA also metadata-only for reorganization.\n• Verify grants after rename—privileges move with object but future grants may need update.\n• SWAP WITH between staging and prod tables for blue-green deployments.\n\nTest in dev clone first; update downstream tasks/streams referencing old fully qualified names.",
        cmd: "ALTER TABLE prod.staging.orders RENAME TO prod.sales.orders;\n\nALTER SCHEMA prod.staging RENAME TO prod.archive;\n\nSHOW VIEWS IN SCHEMA prod.sales;",
      },
      {
        q: "How do you audit database and schema usage across a large account?",
        a: "Governance at scale requires ACCOUNT_USAGE queries and tagging discipline.\n• DATABASES and SCHEMATA views show creation time, retention, owner.\n• ACCESS_HISTORY logs which roles queried which objects—detect unused schemas.\n• Tag databases with owner, cost_center, data_classification for reporting.\n• Periodic job: flag schemas with no queries in 90 days for archival review.\n• OBJECT_DEPENDENCIES view maps downstream impact before DROP.\n\nQuarterly cleanup: drop orphaned dev databases past retention policy.",
        cmd: "SELECT catalog_name, schema_name, last_altered\nFROM SNOWFLAKE.ACCOUNT_USAGE.SCHEMATA\nORDER BY last_altered ASC;\n\nSELECT object_name, COUNT(*) AS query_count\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE object_domain = 'Table'\n  AND query_start_time > DATEADD(day, -90, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY query_count ASC LIMIT 20;",
      }
    ],
    hard: [
      {
        q: "Design a multi-tenant SaaS data model using databases, schemas, or row-level security.",
        a: "SaaS tenancy model impacts isolation, cost, and operational complexity.\n• Database-per-tenant: strongest isolation, highest ops overhead—suitable for enterprise tier.\n• Schema-per-tenant: moderate isolation, shared warehouse—good for hundreds of mid-market tenants.\n• Shared tables + ROW ACCESS POLICY: lowest overhead, single schema—requires careful policy testing.\n• Hybrid: shared bronze, tenant-isolated gold with dynamic tables per tier.\n• Billing: attribute warehouse tags per tenant for usage-based chargeback.\n\nPresent threat model: can tenant A ever see tenant B data? Prove with penetration test queries.",
        cmd: "CREATE ROW ACCESS POLICY tenant_isolation AS (tenant_id VARCHAR)\n  RETURNS BOOLEAN ->\n  CURRENT_ROLE() = 'ADMIN' OR tenant_id = CURRENT_SESSION()->>'tenant_id';\n\nALTER TABLE shared.events ADD ROW ACCESS POLICY tenant_isolation ON (tenant_id);\n\nSHOW ROW ACCESS POLICIES;",
      },
      {
        q: "How would you restructure 200 legacy schemas into a medallion architecture without downtime?",
        a: "Large-scale reorganization requires phased migration with compatibility views.\n• Phase 1: create prod.bronze, prod.silver, prod.gold; deploy views in old schemas pointing to new locations.\n• Phase 2: redirect ETL to write new data to medallion schemas; backfill historical via CLONE+CTAS.\n• Phase 3: update tasks, streams, BI tools to new qualified names with dual-write period.\n• Phase 4: deprecate old schemas after 30-day validation; keep views for backward compatibility.\n• Zero-downtime key: SWAP tables during cutover windows; never DROP until consumers migrated.\n\nRunbook includes rollback: views still point to old tables if SWAP reverted.",
        cmd: "CREATE VIEW legacy_sales.orders AS SELECT * FROM prod.gold.orders;\n\nCREATE TABLE prod.gold.orders CLONE legacy_sales.orders;\n\nALTER TABLE prod.gold.orders_new SWAP WITH prod.gold.orders;",
      },
      {
        q: "Lead governance design for OBJECT OWNERSHIP vs centralized ADMIN role on schemas.",
        a: "Ownership model affects who can ALTER, DROP, and GRANT on objects.\n• Default: creator becomes object owner with full control—risky in shared warehouses.\n• Pattern: ETL role creates objects; TRANSFER OWNERSHIP to schema admin role immediately after creation.\n• Managed access schema + dedicated schema owner role prevents privilege sprawl.\n• ACCOUNTADMIN retains override—minimize direct use via break-glass procedure.\n• Terraform snowflake provider enforces role in object definitions.\n\nADR should document: who can DROP prod tables, approval workflow, and audit trail requirements.",
        cmd: "GRANT OWNERSHIP ON TABLE prod.sales.orders TO ROLE schema_admin COPY CURRENT GRANTS;\n\nSHOW GRANTS ON TABLE prod.sales.orders;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.GRANTS_TO_ROLES\nWHERE granted_on = 'TABLE' AND name = 'ORDERS';",
      },
      {
        q: "Explain database replication setup for DR with multiple production databases.",
        a: "Database replication provides cross-account DR for critical databases.\n• Enable replication on source account; create replica in secondary account/region.\n• ALTER DATABASE ... REFRESH on schedule or via task for RPO control.\n• Failover: promote replica to primary during region outage.\n• Replicate shares, users, roles with account-level replication for full DR.\n• Monitor DATABASE_REPLICATION_USAGE_HISTORY for lag and refresh failures.\n\nTest quarterly: failover drill, validate connection strings, measure RTO from detection to restored service.",
        cmd: "ALTER DATABASE prod ENABLE REPLICATION TO ACCOUNTS aws_us_east.secondary_acct;\n\nCREATE DATABASE prod_replica AS REPLICA OF primary_acct.prod;\n\nALTER DATABASE prod_replica REFRESH;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.DATABASE_REPLICATION_USAGE_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -7, CURRENT_TIMESTAMP())\n));",
      }
    ],
  },

  'storage-architecture': {
    easy: [
      {
        q: "Where does Snowflake physically store table data?",
        a: "Snowflake stores all table data in cloud provider object storage, not on warehouse nodes.\n• AWS: S3; Azure: Azure Blob; GCP: Google Cloud Storage.\n• Data is organized into immutable micro-partition files (50–500 MB compressed columnar format).\n• Snowflake manages encryption at rest with keys controlled by Snowflake or customer-managed (Tri-Secret).\n• Compute warehouses read micro-partitions over the network; local SSD caches hot data.\n• Storage billing is separate from compute—charged per TB/month regardless of warehouse state.\n\nCustomers never manage S3 buckets for base table storage—Snowflake handles lifecycle.",
        cmd: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.STORAGE_USAGE\nORDER BY USAGE_DATE DESC LIMIT 7;\n\nSELECT table_catalog, table_schema, table_name, active_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nORDER BY active_bytes DESC LIMIT 10;",
      },
      {
        q: "What is the difference between active and time travel storage charges?",
        a: "Snowflake storage billing has multiple components beyond current table data.\n• Active bytes: current version of all table data—the primary storage cost.\n• Time Travel bytes: historical versions retained per table DATA_RETENTION_TIME_IN_DAYS setting.\n• Fail-safe bytes: 7-day disaster recovery buffer after Time Travel expires—cannot be disabled.\n• Stages (internal) also consume storage for staged files awaiting load.\n• Dropping a table moves data to Time Travel before eventual purge.\n\nReducing retention on staging tables significantly lowers storage bills.",
        cmd: "ALTER TABLE staging.events SET DATA_RETENTION_TIME_IN_DAYS = 1;\n\nSELECT table_name, active_bytes, time_travel_bytes, failsafe_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_schema = 'STAGING';",
      },
      {
        q: "Explain internal vs external stages for data loading.",
        a: "Stages are named locations where data files reside before COPY INTO loads them into tables.\n• Internal stage: Snowflake-managed storage; types include user stage, table stage, named internal stage.\n• External stage: points to customer S3/Azure/GCS bucket; data stays in your cloud account.\n• PUT uploads files to internal stages via SnowSQL/client; external stages reference existing cloud paths.\n• External stages require STORAGE INTEGRATION for secure credential-less access.\n• Snowpipe ingests from stages automatically on file arrival.\n\nProduction pattern: external stage on landing bucket → Snowpipe → target table.",
        cmd: "CREATE STAGE my_int_stage;\nCREATE STAGE my_ext_stage\n  URL = 's3://datalake/landing/'\n  STORAGE_INTEGRATION = s3_integration;\n\nLIST @my_ext_stage;\n\nPUT file:///local/data.csv @my_int_stage;",
      },
      {
        q: "How does Snowflake compress data and why does it matter for query performance?",
        a: "Snowflake uses columnar compression within each micro-partition for storage and scan efficiency.\n• Same-column values compress together—low cardinality columns compress extremely well.\n• Compressed data means less I/O from cloud storage during query execution.\n• VARIANT/JSON columns compress less efficiently than typed columns—schema-on-read has cost.\n• Approximate compression ratio visible in table storage metrics.\n• Choosing appropriate data types (DATE vs VARCHAR for dates) improves compression and pruning.\n\nInterview tip: narrowing column types during ETL is both storage and query optimization.",
        cmd: "CREATE TABLE events (\n  event_date DATE,\n  user_id NUMBER(10,0),\n  event_type VARCHAR(50),\n  properties VARIANT\n);\n\nSELECT active_bytes, row_count\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'EVENTS';",
      }
    ],
    medium: [
      {
        q: "How do you monitor and control storage growth across the account?",
        a: "Storage governance prevents uncontrolled cost from data hoarding and poor retention policies.\n• Weekly report from TABLE_STORAGE_METRICS: top tables by active_bytes growth week-over-week.\n• Set DATA_RETENTION_TIME_IN_DAYS appropriately: 1 day staging, 7–90 days prod per compliance.\n• Use TRANSIENT tables for rebuildable intermediates—no Fail-safe overhead.\n• Archive cold data to external stage (Glacier tier) via EXPORT and DROP.\n• Resource monitors do not cap storage—storage alerts need custom tasks on STORAGE_USAGE.\n\nPartner with data owners on retention policy; legal holds may require longer Time Travel.",
        cmd: "SELECT table_name,\n       active_bytes / POWER(1024,3) AS active_gb,\n       time_travel_bytes / POWER(1024,3) AS tt_gb\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nORDER BY active_bytes DESC LIMIT 25;\n\nALTER TABLE logs.raw SET DATA_RETENTION_TIME_IN_DAYS = 3;",
      },
      {
        q: "What is a storage integration and how does it secure external stage access?",
        a: "Storage integrations allow Snowflake to access cloud storage without embedding credentials in stage definitions.\n• CREATE STORAGE INTEGRATION defines IAM role (AWS) or service principal (Azure) trust relationship.\n• Snowflake assumes role to read/write external stages; no access keys in DDL.\n• ALLOWED_LOCATIONS restricts which bucket paths the integration can access.\n• DESC INTEGRATION shows AWS IAM user/role ARNs to configure in cloud console.\n• One integration can serve multiple stages in allowed path prefix.\n\nRotate and audit: integration changes require ACCOUNTADMIN; log in ACCESS_HISTORY.",
        cmd: "CREATE STORAGE INTEGRATION s3_int\n  TYPE = EXTERNAL_STAGE\n  STORAGE_PROVIDER = S3\n  ENABLED = TRUE\n  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::123456789:role/snowflake-access'\n  STORAGE_ALLOWED_LOCATIONS = ('s3://datalake/landing/');\n\nDESC INTEGRATION s3_int;\n\nGRANT USAGE ON INTEGRATION s3_int TO ROLE etl_role;",
      },
      {
        q: "How do you troubleshoot COPY INTO failures from external stages?",
        a: "COPY failures stem from permissions, file format mismatches, or data quality issues.\n• Check LOAD_HISTORY or COPY_HISTORY for error messages per file.\n• VALIDATION_MODE = RETURN_ERRORS previews issues without loading.\n• Common errors: wrong FILE_FORMAT, encoding issues, column count mismatch, IAM permission denied.\n• ON_ERROR = CONTINUE vs ABORT controls whether bad rows skip or halt load.\n• For large loads: MAX_FILE_SIZE, parallelization via multiple files in stage.\n\nAlways test FILE_FORMAT on sample file with INFER_SCHEMA before production load.",
        cmd: "COPY INTO target_table\nFROM @ext_stage/data/\nFILE_FORMAT = (TYPE = CSV SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '\"')\nON_ERROR = 'CONTINUE'\nVALIDATION_MODE = 'RETURN_ERRORS';\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'TARGET_TABLE',\n  START_TIME => DATEADD(hour, -24, CURRENT_TIMESTAMP())\n));",
      },
      {
        q: "Explain hybrid tables and their storage/compute characteristics vs standard tables.",
        a: "Hybrid tables (Unistore) support transactional row-oriented workloads alongside analytics.\n• Row store optimized for point lookups and frequent small updates—OLTP patterns.\n• Standard tables remain columnar micro-partitions for analytics scans.\n• Hybrid tables have different performance profile; not a drop-in for all OLTP.\n• Use when you need low-latency primary key lookups without exporting to external RDBMS.\n• Billing and optimization differ—check current Snowflake docs for workload fit.\n\nArchitecture pattern: hybrid for operational state, standard for analytical aggregates via streams.",
        cmd: "CREATE HYBRID TABLE app_sessions (\n  session_id VARCHAR PRIMARY KEY,\n  user_id INT,\n  last_active TIMESTAMP_LTZ\n);\n\nSELECT GET_DDL('TABLE', 'app_sessions');",
      }
    ],
    hard: [
      {
        q: "Design a data lake ingestion architecture using external tables, stages, and Iceberg.",
        a: "Modern lakehouse ingestion balances query-in-place vs load-into-Snowflake trade-offs.\n• External tables query files in place—no Snowflake storage cost but slower scans.\n• Iceberg tables on external volume provide ACID, time travel in open format.\n• Pattern: land raw as Iceberg on external volume → Snowpipe/stream into curated Snowflake tables.\n• Catalog integration (Glue, Polaris) for metadata discovery across formats.\n• Egress and scan costs: external table queries may scan more data than pruned native tables.\n\nPoC compare: p95 latency and cost for external vs native for top 10 analytical queries.",
        cmd: "CREATE EXTERNAL TABLE ext_events (\n  id INT AS (VALUE:id::INT),\n  ts TIMESTAMP AS (VALUE:ts::TIMESTAMP)\n)\nWITH LOCATION = @iceberg_stage/events/\n  FILE_FORMAT = (TYPE = PARQUET);\n\nSELECT COUNT(*) FROM ext_events WHERE ts >= CURRENT_DATE() - 7;",
      },
      {
        q: "How would you implement customer-managed encryption keys (Tri-Secret Secure) for compliance?",
        a: "Tri-Secret Secure gives customers control over encryption key lifecycle for regulatory requirements.\n• Customer hosts key in cloud KMS (AWS KMS, Azure Key Vault); Snowflake requests envelope encryption.\n• If customer revokes key, data becomes inaccessible—disaster if misconfigured.\n• Setup requires ACCOUNTADMIN coordination with cloud KMS policies.\n• Key rotation procedures must be documented and tested.\n• Performance impact minimal but operational burden significant.\n\nUse only when contractually required; standard Snowflake encryption suffices for most enterprises.",
        cmd: "ALTER ACCOUNT SET TRI_SECRET_AND_PRIVACY = TRUE;\n\n-- Configure in Snowflake UI: Admin -> Security -> Encryption\n-- AWS: grant KMS permissions to Snowflake IAM user\n\nSELECT SYSTEM$GET_ACCOUNT_PRIVACY_STATUS();",
      },
      {
        q: "Lead capacity planning for 500 TB annual storage growth with budget constraints.",
        a: "Storage capacity planning projects growth, retention impact, and archival strategy.\n• Baseline: STORAGE_USAGE daily trend; categorize growth by database/schema owner.\n• Model: raw ingestion TB/day × retention days × (1 + Time Travel overhead %) + Fail-safe buffer.\n• Levers: reduce retention on staging, TRANSIENT for rebuildable, compress via efficient types, archive to external cold storage.\n• Clone and zero-copy clone do not duplicate storage until changes—leverage for env copies.\n• Forecast quarterly; alert when 30-day projected growth exceeds budget by 15%.\n\nPresent CFO-facing dashboard: $/TB/month trend and top 10 growth tables with owner accountability.",
        cmd: "SELECT USAGE_DATE,\n       STORAGE_BYTES / POWER(1024,4) AS storage_tb\nFROM SNOWFLAKE.ACCOUNT_USAGE.STORAGE_USAGE\nWHERE USAGE_DATE >= DATEADD(month, -12, CURRENT_DATE())\nORDER BY USAGE_DATE;\n\nSELECT table_name, active_bytes,\n       DATEDIFF(day, created, CURRENT_TIMESTAMP()) AS age_days\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nORDER BY active_bytes DESC LIMIT 20;",
      },
      {
        q: "Explain storage implications of UNDROP vs CLONE for accidental table deletion recovery.",
        a: "Recovery options differ in speed, storage cost, and scope after accidental DROP.\n• UNDROP TABLE: restores table to pre-drop state within Time Travel retention—metadata restore, instant.\n• CLONE from Time Travel: CREATE TABLE ... CLONE ... AT(OFFSET => -3600) for point-in-time copy without undropping.\n• Fail-safe: after Time Travel expires, Snowflake support can recover within 7-day Fail-safe window—last resort.\n• UNDROP DATABASE restores entire database hierarchy.\n• Prevention beats recovery: restrict DROP privileges; use soft-delete patterns for critical tables.\n\nRunbook: attempt UNDROP first; if retention expired, open support ticket with table name and drop timestamp.",
        cmd: "UNDROP TABLE prod.sales.orders;\n\nCREATE TABLE prod.sales.orders_recovered\n  CLONE prod.sales.orders AT (TIMESTAMP => '2024-06-15 10:00:00'::TIMESTAMP_LTZ);\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'ORDERS';",
      }
    ],
  },

  'micro-partitions': {
    easy: [
      {
        q: "What is a micro-partition in Snowflake and how big is it?",
        a: "Micro-partitions are Snowflake's fundamental unit of data storage and pruning.\n• Each micro-partition holds 50–500 MB of compressed columnar data (not fixed row count).\n• Snowflake automatically splits data into micro-partitions on load—no user configuration.\n• Each partition stores min/max/null-count metadata per column for partition pruning.\n• Queries scan only partitions whose metadata overlaps filter predicates.\n• Partitions are immutable; updates create new partitions and mark old ones for cleanup.\n\nContrast with Hive partitions: Snowflake pruning is automatic metadata-driven, not directory-based.",
        cmd: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'ORDERS';\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('SALES.PUBLIC.ORDERS', '(ORDER_DATE)');",
      },
      {
        q: "How does partition pruning work during query execution?",
        a: "Partition pruning eliminates micro-partitions from the scan plan before reading cloud storage.\n• Optimizer compares filter predicates (e.g., date range) against per-column min/max in each partition.\n• Partitions with non-overlapping ranges are skipped entirely—no I/O cost.\n• Pruning works on equality, range, and IN predicates on columns with good metadata.\n• Functions on columns (YEAR(order_date)) may prevent pruning—filter on raw column instead.\n• Query profile shows partitions scanned vs total partitions.\n\nStrong answers: pruning is why clustering keys matter for large tables with selective filters.",
        cmd: "SELECT COUNT(*) FROM orders\nWHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';\n\nSELECT query_id, partitions_scanned, partitions_total, bytes_scanned\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION())\nORDER BY start_time DESC LIMIT 1;",
      },
      {
        q: "Why do too many small micro-partitions hurt performance?",
        a: "Small files and excessive micro-partitions increase metadata overhead and reduce scan efficiency.\n• Each partition has metadata overhead; millions of tiny partitions slow query planning.\n• Causes: frequent small inserts, lack of batching, tables without natural clustering on filter columns.\n• Symptom: high partitions_total, low bytes per partition, long compilation time.\n• Fix: batch loads, COPY INTO larger files, CLUSTER BY or automatic clustering, periodic recluster.\n• Target roughly 100–300 MB per partition for analytical tables.\n\nMonitor via SYSTEM$CLUSTERING_INFORMATION depth and average partition size metrics.",
        cmd: "INSERT INTO orders SELECT * FROM staging_orders;\n\n-- Prefer batched load:\nCOPY INTO orders FROM @stage FILES = ('batch_001.parquet', 'batch_002.parquet');\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_DATE)');",
      },
      {
        q: "Explain columnar storage within a micro-partition.",
        a: "Snowflake stores data column-by-column within each micro-partition for compression and projection.\n• Only columns referenced in SELECT are read from storage—column pruning.\n• Same-type adjacent values compress efficiently (run-length, dictionary encoding).\n• SELECT * forces reading all columns—anti-pattern on wide tables.\n• Joins benefit when both tables prune to overlapping partition subsets.\n• VARIANT columns store semi-structured data but with less efficient pruning on nested paths.\n\nETL best practice: separate wide JSON landing from typed narrow analytical tables.",
        cmd: "SELECT order_id, order_date, amount FROM orders\nWHERE order_date = CURRENT_DATE();\n\n-- Avoid on 200-column table:\n-- SELECT * FROM wide_events WHERE event_date = CURRENT_DATE();",
      }
    ],
    medium: [
      {
        q: "How do you diagnose poor pruning on a large fact table?",
        a: "Poor pruning means queries scan far more partitions than necessary.\n• Compare partitions_scanned to partitions_total in QUERY_HISTORY for typical filter queries.\n• Check if filter column min/max ranges overlap most partitions—data not clustered on filter key.\n• Verify predicates are sargable: avoid functions on column, avoid implicit type casts.\n• Run SYSTEM$CLUSTERING_INFORMATION to see clustering depth and constant overhead.\n• EXPLAIN or query profile identifies pruning effectiveness.\n\nRemediation path: add clustering key, rewrite ETL to load in sorted order, or use Search Optimization Service.",
        cmd: "SELECT query_id, partitions_scanned, partitions_total,\n       ROUND(partitions_scanned/NULLIF(partitions_total,0)*100,2) AS pct_scanned\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE table_names ILIKE '%ORDERS%'\n  AND start_time > DATEADD(day, -7, CURRENT_TIMESTAMP())\nORDER BY bytes_scanned DESC LIMIT 20;\n\nALTER TABLE orders CLUSTER BY (order_date);",
      },
      {
        q: "What impact do DELETE and UPDATE have on micro-partitions?",
        a: "DML operations in Snowflake are copy-on-write at the micro-partition level.\n• UPDATE/DELETE marks affected rows; new micro-partitions written with remaining rows.\n• Old partitions retained in Time Travel until retention expires—storage grows temporarily.\n• Frequent row-level updates fragment partitions and degrade clustering.\n• MERGE is preferred for upsert patterns in ETL over row-by-row UPDATE.\n• Tables with heavy updates may need periodic CLUSTER or table rebuild via CLONE+SWAP.\n\nOLTP-heavy patterns are poor fit for standard Snowflake tables—consider hybrid tables.",
        cmd: "UPDATE orders SET status = 'CANCELLED' WHERE order_id = 12345;\n\nDELETE FROM orders WHERE order_date < '2020-01-01';\n\nSELECT active_bytes, time_travel_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'ORDERS';",
      },
      {
        q: "How do you measure partition skew across a table?",
        a: "Partition skew occurs when data distribution is uneven across micro-partitions.\n• Skewed partitions: one partition much larger than median—causes straggler scan tasks.\n• Causes: monotonically increasing keys without clustering, hot keys in dimension tables.\n• SYSTEM$CLUSTERING_INFORMATION shows average overlaps and partition depth.\n• Query profile may show one worker processing disproportionate data.\n• Mitigation: salt high-cardinality keys, cluster on composite key, redistribute via CTAS.\n\nCompare max partition bytes to median in storage metrics for skew detection.",
        cmd: "SELECT SYSTEM$CLUSTERING_INFORMATION('EVENTS', '(user_id)');\n\nCREATE OR REPLACE TABLE events_rebalanced AS\nSELECT * FROM events ORDER BY event_date, user_id;\n\nALTER TABLE events_rebalanced CLUSTER BY (event_date, user_id);",
      },
      {
        q: "Compare automatic clustering vs manual CLUSTER BY maintenance.",
        a: "Snowflake offers automatic clustering service that reclusters tables in background.\n• CLUSTER BY (col): declares intent; Snowflake rebalances partitions automatically (credit cost).\n• Manual RECLUSTER (legacy) or automatic service maintains depth metric above threshold.\n• Automatic clustering bills credits proportional to data moved during reclustering.\n• Not all tables need clustering—only large tables with selective filters on clustering key.\n• Disable on append-only tables where load order already matches filter pattern.\n\nMonitor clustering_cost in ACCOUNT_USAGE and depth trending down over time.",
        cmd: "ALTER TABLE orders CLUSTER BY (order_date);\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_DATE)');\n\nALTER TABLE orders SUSPEND RECLUSTER;",
      }
    ],
    hard: [
      {
        q: "Design storage layout for a 10 billion row events table with 90-day hot query window.",
        a: "At billions of rows, partition pruning and clustering strategy determine query viability.\n• Cluster on (event_date, event_type) for typical dashboard filters.\n• Load data sorted by event_date via staged COPY—natural clustering without heavy recluster cost.\n• Partition-equivalent: micro-partitions align to date ranges through clustering, not Hive paths.\n• Archive >90 days: move to separate table or external Iceberg with cheaper storage class.\n• Search Optimization on event_id for rare point lookups if needed.\n• SLA: p95 scan <5s for last-7-day queries on Large warehouse.\n\nCapacity model: TB/month growth, recluster credits, retention tiers.",
        cmd: "CREATE TABLE events (\n  event_id VARCHAR,\n  event_date DATE,\n  event_type VARCHAR(50),\n  payload VARIANT\n) CLUSTER BY (event_date, event_type);\n\nCOPY INTO events FROM @stage\nFILE_FORMAT = (TYPE = PARQUET)\nMATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;",
      },
      {
        q: "How would you investigate a sudden doubling of bytes_scanned for a critical report?",
        a: "Regression in bytes scanned indicates pruning failure or query rewrite issue.\n• Compare QUERY_HISTORY before/after deploy: partitions_scanned, query_text diff.\n• Check for new UDF on filter column, implicit cast, OR clause preventing pruning.\n• Verify table did not receive unclustered bulk load diluting metadata overlap.\n• Check if statistics or clustering depth degraded—SYSTEM$CLUSTERING_INFORMATION.\n• Join explosion: new join key causes cartesian expansion—bytes scanned spikes.\n\nRollback query text or table state via Time Travel clone for A/B validation.",
        cmd: "SELECT query_text, partitions_scanned, partitions_total, bytes_scanned, start_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_id IN ('before_id', 'after_id');\n\nCREATE TABLE orders_debug CLONE orders AT (OFFSET => -86400);",
      },
      {
        q: "Lead postmortem where micro-partition explosion caused metadata service slowdown.",
        a: "Extreme partition counts can degrade cloud services metadata operations account-wide.\n• Symptom: all queries slow compilation; high partitions_total on newly loaded table.\n• Cause: streaming micro-inserts every second without batching created millions of tiny partitions.\n• Impact: 2-hour analytics outage; warehouse compute idle while compilation queued.\n• Fix: pause inserts, CTAS into batched table, SWAP, add clustering, enforce batch window in pipeline.\n• Prevent: Snowpipe with larger files, buffer in stream, alert on partitions_total threshold.\n\nAction items: max file size policy, pipeline review, partition count monitoring dashboard.",
        cmd: "CREATE TABLE events_fixed CLUSTER BY (event_date) AS\nSELECT * FROM events_broken;\n\nALTER TABLE events_broken SWAP WITH events_fixed;\n\nSELECT COUNT(*) AS partition_estimate\nFROM TABLE(INFORMATION_SCHEMA.TABLE_STORAGE_METRICS(\n  'EVENTS_BROKEN'));",
      },
      {
        q: "Explain interaction between micro-partitions and result cache invalidation.",
        a: "Result cache keys depend on micro-partition checksums at query execution time.\n• Any DML changing a scanned partition invalidates cached results for queries touching that partition.\n• High-churn tables rarely benefit from result cache—BI on near-real-time data sees constant invalidation.\n• Stable dimension tables and historical fact partitions cache well.\n• Design: separate slowly-changing aggregates (materialized views/dynamic tables) from raw ingest table.\n• USE_CACHED_RESULT = FALSE for benchmarking; TRUE (default) for production cost savings.\n\nArchitect dashboards to query aggregate tables refreshed hourly, not raw events every refresh.",
        cmd: "ALTER SESSION SET USE_CACHED_RESULT = TRUE;\n\nSELECT region, SUM(revenue) FROM orders\nWHERE order_date >= DATEADD(year, -1, CURRENT_DATE())\nGROUP BY 1;\n\n-- Re-run identical query — check QUERY_HISTORY for credits_used = 0",
      }
    ],
  },

  'clustering': {
    easy: [
      {
        q: "What is table clustering in Snowflake and why use it?",
        a: "Clustering co-locates related rows within micro-partitions to improve partition pruning.\n• DECLARE CLUSTER BY (column_list) on table—Snowflake maintains sort order over time.\n• Best for large tables (TB+) filtered on specific columns (dates, regions, IDs).\n• Without clustering, data layout follows load order which may not match query patterns.\n• Clustering depth metric indicates effectiveness—higher depth means better pruning potential.\n• Automatic clustering service reorders data in background for a credit cost.\n\nNot a replacement for good ETL load order—loading sorted data reduces recluster needs.",
        cmd: "ALTER TABLE sales CLUSTER BY (sale_date);\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('SALES', '(SALE_DATE)');",
      },
      {
        q: "How do you check clustering quality on a table?",
        a: "SYSTEM$CLUSTERING_INFORMATION provides clustering health metrics.\n• average_depth: lower is better; target typically <4 for good pruning on large tables.\n• average_overlaps: partition overlap count—lower means cleaner boundaries.\n• cluster_by_keys: active clustering columns.\n• Notes field explains if reclustering is in progress or suspended.\n• Query QUERY_HISTORY partitions_scanned ratio validates real-world impact.\n\nCheck after large bulk loads—depth often spikes until recluster completes.",
        cmd: "SELECT SYSTEM$CLUSTERING_INFORMATION('SALES.PUBLIC.ORDERS', '(ORDER_DATE)');\n\nSELECT partitions_scanned, partitions_total\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%orders%'\nORDER BY start_time DESC LIMIT 5;",
      },
      {
        q: "What columns should you choose for a clustering key?",
        a: "Clustering key selection should match the most selective filter columns in production queries.\n• High-cardinality date/timestamp columns are common choices for fact tables.\n• Composite keys (region, date) when queries always filter both dimensions.\n• Avoid clustering on low-cardinality alone (boolean flags)—limited pruning benefit.\n• Do not cluster on columns rarely used in WHERE clauses—wasted recluster credits.\n• Maximum practical keys: typically 3–4 columns; more keys increase maintenance cost.\n\nInterview approach: ask about top 5 production queries and their filter columns first.",
        cmd: "ALTER TABLE events CLUSTER BY (event_date, region);\n\n-- Query pattern that benefits:\nSELECT * FROM events\nWHERE event_date >= '2024-06-01' AND region = 'US';",
      },
      {
        q: "Does clustering eliminate the need for partition pruning knowledge?",
        a: "Clustering enhances pruning but does not remove need to write sargable queries.\n• Pruning still requires filter predicates compatible with min/max metadata.\n• Clustering improves overlap quality so fewer partitions match broad scans.\n• Functions on clustered columns (TO_DATE(varchar_col)) may still block pruning.\n• Joins benefit when both sides cluster on join key—co-located micro-partitions possible.\n• Engineers must still understand EXPLAIN and query profile metrics.\n\nClustering is physical optimization; logical SQL quality remains essential.",
        cmd: "SELECT * FROM orders WHERE order_date = '2024-06-15';\n\n-- Bad for pruning:\n-- SELECT * FROM orders WHERE YEAR(order_date) = 2024;",
      }
    ],
    medium: [
      {
        q: "How do you balance clustering cost vs query performance improvement?",
        a: "Clustering incurs background recluster credits—justify with measured query savings.\n• Baseline: QUERY_HISTORY bytes_scanned and elapsed time before clustering.\n• Enable clustering; monitor SYSTEM$CLUSTERING_INFORMATION depth over 1–2 weeks.\n• Compare bytes_scanned after depth stabilizes—target 50%+ reduction for justified tables.\n• Review AUTOMATIC_CLUSTERING_HISTORY for credits spent on reclustering.\n• Suspend recluster on tables where depth is acceptable and queries are fast enough.\n\nROI formula: (compute credits saved monthly) > (recluster credits + storage overhead).",
        cmd: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.AUTOMATIC_CLUSTERING_HISTORY\nWHERE start_time > DATEADD(day, -30, CURRENT_TIMESTAMP());\n\nALTER TABLE orders SUSPEND RECLUSTER;",
      },
      {
        q: "What happens to clustering when you bulk load unsorted data?",
        a: "Unsorted bulk loads temporarily degrade clustering depth until reclustering catches up.\n• New micro-partitions may have wide min/max ranges overlapping existing data.\n• Queries during this window scan more partitions—temporary performance regression.\n• Mitigation: pre-sort files before COPY, load during maintenance window, temporarily upsize warehouse.\n• PIPE loads with Snowpipe may continuously degrade clustering—schedule recluster or batch files.\n• Consider separate staging table sorted CTAS into clustered production table.\n\nPattern: LOAD staging → CREATE TABLE prod_new AS SELECT * ORDER BY key → SWAP.",
        cmd: "COPY INTO orders FROM @stage;\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_DATE)');\n\nCREATE TABLE orders_sorted CLUSTER BY (order_date) AS\nSELECT * FROM orders_staging ORDER BY order_date;",
      },
      {
        q: "Compare CLUSTER BY with Search Optimization Service for point lookups.",
        a: "Different tools solve different access patterns on large tables.\n• CLUSTER BY: optimizes range scans and equality on leading clustering columns across partitions.\n• Search Optimization Service (SOS): builds auxiliary search structures for point lookups (single row by ID).\n• SOS costs storage and maintenance credits; best for \"needle in haystack\" on billion-row tables.\n• CLUSTER BY insufficient when equality filter column has extreme cardinality spread across all partitions.\n• Can use both: cluster on date, SOS on transaction_id within recent partitions.\n\nEvaluate with query patterns: dashboards need clustering; API lookup by PK needs SOS.",
        cmd: "ALTER TABLE transactions ADD SEARCH OPTIMIZATION ON EQUALITY(transaction_id);\n\nSELECT * FROM transactions WHERE transaction_id = 'TXN-987654321';\n\nSHOW SEARCH OPTIMIZATION ON transactions;",
      },
      {
        q: "How do you change clustering keys on a production table?",
        a: "Changing clustering keys requires ALTER and accepts temporary depth degradation.\n• ALTER TABLE ... CLUSTER BY (new_keys) starts new reclustering trajectory.\n• Old partition layout persists until background service rewrites partitions.\n• Safer approach: CREATE TABLE new CLONE/CTAS with new clustering → validate → SWAP.\n• Schedule during low-traffic window; monitor depth and query metrics during transition.\n• Update downstream documentation and ETL load sort order to match new keys.\n\nSWAP approach enables instant rollback if performance regresses.",
        cmd: "ALTER TABLE orders CLUSTER BY (customer_id, order_date);\n\n-- Safer migration:\nCREATE TABLE orders_v2 CLUSTER BY (customer_id, order_date) AS SELECT * FROM orders;\nALTER TABLE orders SWAP WITH orders_v2;",
      }
    ],
    hard: [
      {
        q: "Design clustering strategy for a multi-tenant table with 10K tenants and date-range queries.",
        a: "Multi-tenant clustering must balance tenant isolation in partition layout with date pruning.\n• Option A: cluster by (tenant_id, event_date) if queries always filter tenant first.\n• Option B: separate table per tenant tier (enterprise vs SMB) with different clustering.\n• Row access policies do not affect physical layout—clustering must match query filter order.\n• Hot tenants with massive row counts may skew partitions—monitor per-tenant scan metrics.\n• Consider tenant_id hash salt for largest tenants to spread partition load.\n\nLoad test top 10 tenants' typical queries; measure partitions_scanned per tenant.",
        cmd: "ALTER TABLE tenant_events CLUSTER BY (tenant_id, event_date);\n\nSELECT tenant_id, COUNT(*) FROM tenant_events\nWHERE tenant_id = 'T-100' AND event_date >= '2024-06-01'\nGROUP BY 1;",
      },
      {
        q: "Lead optimization project when clustering depth stuck above 8 despite months of reclustering.",
        a: "Persistently high depth indicates fundamental mismatch between load pattern and clustering key.\n• Diagnose: load order random by key; continuous small inserts; wrong clustering column choice.\n• Analyze top queries—maybe cluster key should be (date, region) not just (date).\n• Nuclear option: CTAS with ORDER BY clustering keys, SWAP, enforce sorted loads going forward.\n• Evaluate if table is too wide for clustering benefit—archive old partitions to separate table.\n• Cost: recluster credits exceeding savings—suspend and accept scan cost or redesign.\n\nPresent data-driven recommendation to leadership with cost/performance trade-off curves.",
        cmd: "CREATE TABLE orders_rebuilt CLUSTER BY (order_date) AS\nSELECT * FROM orders ORDER BY order_date;\n\nALTER TABLE orders SWAP WITH orders_rebuilt;\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_DATE)');",
      },
      {
        q: "How does clustering interact with Time Travel storage for frequently updated tables?",
        a: "Clustering maintenance and DML both generate new micro-partitions affecting storage.\n• Each UPDATE creates new partitions; old versions retained in Time Travel.\n• Reclustering rewrites partitions—both old and new versions consume storage temporarily.\n• High-churn + clustering = storage and credit amplification.\n• Mitigation: shorter retention on staging, MERGE batch patterns, separate current-state table from history.\n• SCD Type 2 history tables may cluster on (business_key, valid_from) for temporal queries.\n\nModel storage: active + time_travel + failsafe growth rate with clustering enabled vs disabled.",
        cmd: "ALTER TABLE order_history SET DATA_RETENTION_TIME_IN_DAYS = 7;\n\nALTER TABLE order_history CLUSTER BY (order_id, valid_from);\n\nSELECT active_bytes, time_travel_bytes, failsafe_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'ORDER_HISTORY';",
      },
      {
        q: "Explain when to drop clustering entirely and rely on natural load order.",
        a: "Clustering is not free—sometimes natural load order is sufficient.\n• Append-only time-series loaded in chronological order often has excellent natural clustering on timestamp.\n• Adding CLUSTER BY on same column triggers unnecessary recluster credits.\n• Validate: depth already <2 without declared clustering key.\n• Drop clustering: ALTER TABLE ... DROP CLUSTERING KEY; suspend recluster.\n• Re-evaluate if query patterns change to filter on different columns.\n\nDocument decision in table catalog: \"natural clustering via ordered Snowpipe ingest.\"",
        cmd: "SELECT SYSTEM$CLUSTERING_INFORMATION('EVENTS', '(EVENT_TS)');\n\nALTER TABLE events DROP CLUSTERING KEY;\n\nALTER TABLE events SUSPEND RECLUSTER;",
      }
    ],
  },

  'query-optimization': {
    easy: [
      {
        q: "What metrics in QUERY_HISTORY indicate an expensive query?",
        a: "QUERY_HISTORY exposes resource consumption metrics for every executed query.\n• bytes_scanned: primary cost driver—data read from storage regardless of rows returned.\n• partitions_scanned vs partitions_total: pruning effectiveness ratio.\n• total_elapsed_time: end-to-end latency including compilation and queue time.\n• credits_used_cloud_services + credits_used_compute_storage: billing impact.\n• rows_produced vs rows_inserted: detect accidental full table scans returning few rows.\n\nStart optimization triage with highest bytes_scanned queries in last 7 days.",
        cmd: "SELECT query_id, query_text, bytes_scanned,\n       partitions_scanned, partitions_total,\n       total_elapsed_time/1000 AS elapsed_sec\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nORDER BY bytes_scanned DESC LIMIT 20;",
      },
      {
        q: "How does column pruning reduce query cost?",
        a: "Column pruning reads only columns referenced in the query from micro-partitions.\n• SELECT col_a, col_b reads two columns' compressed data, not entire wide row.\n• SELECT * on 200-column table scans all columns—massive bytes_scanned increase.\n• Joins prune columns per table independently based on SELECT and JOIN keys.\n• CREATE VIEW with explicit column list encourages narrow queries from BI tools.\n• VARIANT/OBJECT columns are wide—extract needed fields early in ETL to typed columns.\n\nRule: never SELECT * in production ETL or BI semantic layers.",
        cmd: "SELECT order_id, order_date, amount FROM orders\nWHERE order_date >= CURRENT_DATE() - 7;\n\n-- Compare bytes_scanned with:\n-- SELECT * FROM orders WHERE order_date >= CURRENT_DATE() - 7;",
      },
      {
        q: "What is a result cache hit and how do you identify one?",
        a: "Result cache serves identical query results without re-executing the scan.\n• Cache hit: query returns instantly with 0 or minimal credits_used_compute.\n• Requirements: same query text, same warehouse, underlying partitions unchanged.\n• QUERY_HISTORY may show bytes_scanned = 0 on cache hit.\n• 24-hour cache lifetime; great for repeated dashboard queries.\n• ALTER SESSION SET USE_CACHED_RESULT = FALSE to bypass for testing.\n\nDesign repeated queries with stable SQL text—avoid random comments or timestamps in SQL string.",
        cmd: "ALTER SESSION SET USE_CACHED_RESULT = TRUE;\n\nSELECT region, COUNT(*) FROM customers GROUP BY region;\n\n-- Run twice; check second execution:\nSELECT query_id, bytes_scanned, credits_used_compute_storage\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nORDER BY start_time DESC LIMIT 2;",
      },
      {
        q: "Why should you avoid using functions on filter columns?",
        a: "Functions on filter columns prevent micro-partition pruning in most cases.\n• WHERE YEAR(order_date) = 2024 forces evaluation on every row—scans all partitions.\n• Better: WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'.\n• Same issue: UPPER(email) = 'X' vs email = 'x' with consistent casing in ETL.\n• Implicit casts (WHERE varchar_col = 123) may also block pruning.\n• Exception: some optimizations may still prune—always verify in query profile.\n\nCode review checklist: sargable predicates on clustered columns.",
        cmd: "SELECT COUNT(*) FROM orders\nWHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';\n\n-- Avoid:\n-- SELECT COUNT(*) FROM orders WHERE YEAR(order_date) = 2024;",
      }
    ],
    medium: [
      {
        q: "How do you optimize a query with a large table join to a small dimension?",
        a: "Join optimization leverages broadcast when one table is small enough to fit in memory.\n• Snowflake auto-broadcasts small tables (< ~250 MB default threshold) to all workers.\n• Hint: USE HASH(table) or query profile shows BROADCAST JOIN in plan.\n• If auto-broadcast fails, increase BROADCAST JOIN threshold session parameter cautiously.\n• Large-large joins require sort-merge or hash join with shuffle—both sides must prune well.\n• Pre-aggregate dimension if only subset of columns needed in join.\n\nEnsure stats are current; stale stats may choose suboptimal join order.",
        cmd: "ALTER SESSION SET JOIN_COLLISION_RATIO = 0.5;\n\nSELECT /*+ BROADCAST(dim) */ f.*, d.category\nFROM fact f\nJOIN dim d ON f.category_id = d.id\nWHERE f.sale_date >= '2024-06-01';\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION())\nORDER BY start_time DESC LIMIT 1;",
      },
      {
        q: "What is spilling and how do you detect memory pressure in queries?",
        a: "Spilling occurs when intermediate results exceed available warehouse memory during sorts/joins.\n• Query profile shows bytes spilled to local or remote storage—major latency increase.\n• Causes: oversized joins, DISTINCT on high-cardinality columns, insufficient warehouse size.\n• Fix: increase warehouse size one step, reduce join width, pre-filter before join, break into temp tables.\n• Repeated spills on same query justify permanent warehouse upsize or query rewrite.\n• Monitor QUERY_ACCELERATION and spill metrics in QUERY_HISTORY extended fields.\n\nWarehouse memory scales with size; X-Large has 4× memory of Large—not linear to cost always worth it.",
        cmd: "SELECT query_id, bytes_spilled_to_local_storage,\n       bytes_spilled_to_remote_storage\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE bytes_spilled_to_remote_storage > 0\n  AND start_time > DATEADD(day, -7, CURRENT_TIMESTAMP());\n\nALTER WAREHOUSE analytics_wh SET WAREHOUSE_SIZE = 'LARGE';",
      },
      {
        q: "How do materialized views accelerate queries and what are their limitations?",
        a: "Materialized views store precomputed results incrementally maintained by Snowflake.\n• Query rewriter automatically routes compatible queries to MV when beneficial.\n• Best for repeated aggregations on large base tables with predictable patterns.\n• Limitations: not all SQL constructs supported; maintenance lag during heavy base table DML.\n• MV storage adds cost; stale MV if base table changes faster than refresh.\n• Monitor MATERIALIZED_VIEW_REFRESH_HISTORY for failures and duration.\n\nAlternative: Dynamic Tables offer more flexible transformation pipelines with explicit refresh SLAs.",
        cmd: "CREATE MATERIALIZED VIEW mv_daily_sales AS\nSELECT sale_date, region, SUM(amount) AS total\nFROM sales GROUP BY 1, 2;\n\nSELECT * FROM mv_daily_sales WHERE sale_date >= '2024-06-01';\n\nALTER MATERIALIZED VIEW mv_daily_sales REFRESH;",
      },
      {
        q: "How do you use QUERY_TAG for performance troubleshooting at scale?",
        a: "QUERY_TAG attaches metadata to queries for filtering in ACCOUNT_USAGE views.\n• Set per session: ALTER SESSION SET QUERY_TAG = 'tableau:dashboard_sales'.\n• ETL frameworks set tag per job/run for attribution.\n• Filter QUERY_HISTORY by query_tag to isolate BI vs ETL performance regressions.\n• Combine with user_name and warehouse_name for full context.\n• Standardize tag format: app:object:version for parseable dashboards.\n\nEnforce via network policy or login hook setting tag for service accounts.",
        cmd: "ALTER SESSION SET QUERY_TAG = 'etl:nightly_orders:v2';\n\nSELECT query_tag, AVG(total_elapsed_time) AS avg_ms,\n       SUM(bytes_scanned) AS total_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time > DATEADD(day, -7, CURRENT_TIMESTAMP())\n  AND query_tag LIKE 'etl:%'\nGROUP BY 1 ORDER BY total_bytes DESC;",
      }
    ],
    hard: [
      {
        q: "Design a query governance framework to prevent runaway scans in a self-service BI environment.",
        a: "Self-service BI needs guardrails without blocking legitimate analysis.\n• Statement timeouts: STATEMENT_TIMEOUT_IN_SECONDS per role or warehouse.\n• Resource monitors on BI warehouses with NOTIFY then SUSPEND thresholds.\n• Row limits in BI tool + semantic layer pre-aggregated models.\n• Automated alert on queries scanning >1 TB without query_tag approval.\n• Query acceleration and result cache for approved dashboard SQL patterns.\n• Education: query profile review office hours for top bytes_scanned users.\n\nTechnical + process: blocked query log reviewed weekly; exceptions via ticket for research queries.",
        cmd: "ALTER WAREHOUSE bi_wh SET STATEMENT_TIMEOUT_IN_SECONDS = 300;\n\nCREATE RESOURCE MONITOR bi_guard WITH CREDIT_QUOTA = 1000\n  FREQUENCY = MONTHLY TRIGGERS ON 90 PERCENT DO NOTIFY;\n\nALTER WAREHOUSE bi_wh SET RESOURCE_MONITOR = bi_guard;",
      },
      {
        q: "How would you debug a 50x query regression after a Snowflake version upgrade?",
        a: "Version upgrade regressions require systematic before/after comparison.\n• Identify affected query_ids in QUERY_HISTORY around upgrade timestamp.\n• Compare query profiles: join type changes, pruning differences, new optimizer behavior.\n• Test in pre-upgrade clone (Time Travel) vs current with identical warehouse and data.\n• Check release notes for optimizer changes affecting your SQL patterns.\n• Open Snowflake support case with query_id pair if platform regression suspected.\n• Temporary mitigation: rewrite query, add MV, or pin warehouse size up.\n\nMaintain upgrade test suite: top 50 queries with expected bytes_scanned bounds.",
        cmd: "SELECT query_id, query_text, bytes_scanned, start_time, release_version\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_hash = 'abc123def'\nORDER BY start_time DESC LIMIT 10;\n\nALTER SESSION SET USE_CACHED_RESULT = FALSE;",
      },
      {
        q: "Lead optimization of a 3-hour MERGE statement processing 500M rows nightly.",
        a: "Large MERGE optimization requires staging strategy, clustering, and warehouse sizing.\n• Ensure join keys match clustering on both target and source staging table.\n• Filter source to changed rows only—delta detection via stream or timestamp watermark.\n• Right-size warehouse: test L vs XL measuring spill and duration; multi-cluster rarely helps single MERGE.\n• Break into batch MERGE by date partition if predicate allows independent commits.\n• Use MATCHED / NOT MATCHED clauses efficiently; avoid unnecessary column updates.\n• Monitor lock contention if concurrent readers during MERGE—schedule off-peak.\n\nTarget: <45 min MERGE via 80% source row reduction and clustering alignment.",
        cmd: "MERGE INTO prod.orders t\nUSING staging.orders_delta s ON t.order_id = s.order_id\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET ...\nWHEN NOT MATCHED THEN INSERT ...;\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_ID)');",
      },
      {
        q: "Explain trade-offs between pre-aggregation tables, dynamic tables, and materialized views.",
        a: "Three patterns solve repeated aggregation with different ops models.\n• Manual pre-agg table + task: full control, explicit refresh schedule, custom logic, ops burden.\n• Materialized view: automatic query rewrite, incremental maintenance, SQL limitations.\n• Dynamic table: declarative pipeline, dependency graph, TARGET_LAG SLA, replaces many task chains.\n• Choose MV for simple rollups queried variably; Dynamic Tables for multi-stage pipelines.\n• Cost: compare refresh credits + query savings across options in PoC.\n\nMigration path: task-maintained summary → dynamic table with equivalent SELECT for simpler lineage.",
        cmd: "CREATE DYNAMIC TABLE dt_daily_kpis\n  TARGET_LAG = '1 hour'\n  WAREHOUSE = etl_wh AS\nSELECT order_date, SUM(amount) AS revenue FROM orders GROUP BY 1;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.DYNAMIC_TABLE_REFRESH_HISTORY\nWHERE name = 'DT_DAILY_KPIS' ORDER BY refresh_start_time DESC;",
      }
    ],
  },

  'security': {
    easy: [
      {
        q: "What are the main security layers in Snowflake?",
        a: "Snowflake security is defense-in-depth across network, identity, access, and encryption.\n• Network policies restrict IP ranges allowed to connect to the account.\n• Authentication via password, SSO/SAML, OAuth, key pair for service accounts.\n• Authorization via RBAC roles granting privileges on securable objects.\n• Encryption at rest (AES-256) and in transit (TLS); optional Tri-Secret Secure for customer keys.\n• Audit via LOGIN_HISTORY, QUERY_HISTORY, and ACCESS_HISTORY in ACCOUNT_USAGE.\n\nInterview framing: Snowflake is shared responsibility—customer manages RBAC and network; platform manages infrastructure.",
        cmd: "SHOW PARAMETERS LIKE 'REQUIRE_STORAGE_INTEGRATION_FOR_STAGE_CREATION' IN ACCOUNT;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nORDER BY EVENT_TIMESTAMP DESC LIMIT 10;",
      },
      {
        q: "How does Snowflake encrypt data at rest and in transit?",
        a: "Encryption is enabled by default with no customer configuration required for standard deployments.\n• In transit: all client connections use TLS 1.2+.\n• At rest: all micro-partitions encrypted with AES-256; keys managed by Snowflake key hierarchy.\n• Internal stage and table storage use same encryption model on cloud object storage.\n• Tri-Secret Secure / CMK: customer holds master key in cloud KMS for regulatory control.\n• End-to-end encryption for external stages via encrypted files before upload optional.\n\nCompliance answers reference SOC 2, HIPAA eligibility, and regional deployment options.",
        cmd: "SHOW PARAMETERS LIKE 'CLIENT_ENCRYPTION_KEY_SIZE' IN ACCOUNT;\n\nALTER ACCOUNT SET REQUIRE_STORAGE_INTEGRATION_FOR_STAGE_CREATION = TRUE;",
      },
      {
        q: "What is multi-factor authentication and how is it enforced in Snowflake?",
        a: "MFA adds a second verification factor beyond password for human users.\n• Supported: Duo push, TOTP authenticator apps, WebAuthn/FIDO2 hardware keys.\n• ACCOUNTADMIN can set MFA_REQUIRED policy for roles or account-wide.\n• Service accounts should use key-pair auth instead of password+MFA.\n• SSO via IdP may delegate MFA to corporate Okta/Azure AD.\n• LOGIN_HISTORY shows FIRST_AUTHENTICATION_FACTOR and SECOND_AUTHENTICATION_FACTOR status.\n\nBest practice: MFA mandatory for all human users with ACCOUNTADMIN or SECURITYADMIN roles.",
        cmd: "ALTER ACCOUNT SET MFA_REQUIRED = TRUE;\n\nSELECT USER_NAME, EVENT_TYPE, FIRST_AUTHENTICATION_FACTOR,\n       SECOND_AUTHENTICATION_FACTOR\nFROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nWHERE EVENT_TIMESTAMP > DATEADD(day, -7, CURRENT_TIMESTAMP());",
      },
      {
        q: "Explain private connectivity options for Snowflake (PrivateLink, Private Service Connect).",
        a: "Private connectivity keeps Snowflake traffic off the public internet.\n• AWS PrivateLink: VPC endpoint to Snowflake service; DNS resolves to private IP.\n• Azure Private Link and GCP Private Service Connect provide equivalent patterns.\n• Benefits: data exfiltration risk reduction, compliance with network segmentation policies.\n• Setup requires cloud admin coordination and Snowflake support/account team for some regions.\n• Client drivers connect via private URL; same SQL interface.\n\nDocument split-tunnel VPN vs PrivateLink for corporate network architecture reviews.",
        cmd: "SHOW PARAMETERS LIKE 'ENABLE_INTERNAL_STAGES_PRIVATELINK' IN ACCOUNT;\n\n-- Connection string uses account.privatelink.snowflakecomputing.com\nSELECT SYSTEM$GET_PRIVATELINK_CONFIG();",
      }
    ],
    medium: [
      {
        q: "How do you implement network policies for IP allowlisting?",
        a: "Network policies control which IP addresses can connect to Snowflake users or the entire account.\n• CREATE NETWORK POLICY with ALLOWED_IP_LIST and BLOCKED_IP_LIST.\n• Apply to account: ALTER ACCOUNT SET NETWORK_POLICY = policy_name.\n• Per-user override possible for contractors with different IP ranges.\n• Always include corporate egress IPs and CI/CD runner IPs before enforcing.\n• Lockout risk: test with secondary admin session before applying account-wide policy.\n\nCombine with SSO and short-lived service account keys for defense in depth.",
        cmd: "CREATE NETWORK POLICY corp_access\n  ALLOWED_IP_LIST = ('203.0.113.0/24', '198.51.100.50')\n  BLOCKED_IP_LIST = ('0.0.0.0/0')\n  COMMENT = 'Corporate VPN and office egress';\n\nALTER ACCOUNT SET NETWORK_POLICY = corp_access;",
      },
      {
        q: "What is row access policy and when do you use it?",
        a: "Row access policies filter which rows a query returns based on session context.\n• CREATE ROW ACCESS POLICY with predicate using CURRENT_ROLE(), CURRENT_USER(), or session context.\n• Attach to table: ALTER TABLE ... ADD ROW ACCESS POLICY policy ON (column).\n• Use for multi-tenant data in shared tables without separate tables per tenant.\n• Complements column masking for cell-level security.\n• Test thoroughly: policy bugs cause data leaks or empty result sets.\n\nCommon pattern: tenant_id column filtered by SESSION context set at login.",
        cmd: "CREATE ROW ACCESS POLICY tenant_filter AS (tenant_id VARCHAR) RETURNS BOOLEAN ->\n  tenant_id = CURRENT_SESSION()->>'tenant_id' OR IS_ROLE_IN_SESSION('ADMIN');\n\nALTER TABLE shared_data ADD ROW ACCESS POLICY tenant_filter ON (tenant_id);\n\nSELECT * FROM shared_data; -- returns only tenant rows",
      },
      {
        q: "How do column masking policies protect sensitive data?",
        a: "Masking policies dynamically transform column values at query time based on role.\n• CREATE MASKING POLICY with CASE on IS_ROLE_IN_SESSION for different mask levels.\n• Attach: ALTER TABLE ... MODIFY COLUMN ... SET MASKING POLICY policy.\n• Analysts see hashed/masked SSN; privileged roles see plaintext.\n• Masking applies at read time—underlying storage unchanged.\n• Combine with secure views for additional abstraction layer.\n\nRegulatory use: PCI, HIPAA columns masked by default; break-glass role for full access with audit.",
        cmd: "CREATE MASKING POLICY ssn_mask AS (val VARCHAR) RETURNS VARCHAR ->\n  CASE WHEN IS_ROLE_IN_SESSION('PII_READER') THEN val\n       ELSE '***-**-' || RIGHT(val, 4) END;\n\nALTER TABLE customers MODIFY COLUMN ssn SET MASKING POLICY ssn_mask;\n\nSELECT ssn FROM customers;",
      },
      {
        q: "How do you audit user activity and detect anomalous access patterns?",
        a: "Security monitoring leverages ACCOUNT_USAGE views and SIEM integration.\n• LOGIN_HISTORY: failed logins, new IP addresses, MFA bypass attempts.\n• QUERY_HISTORY: bulk SELECT on sensitive tables by unusual roles.\n• ACCESS_HISTORY: object access patterns over time.\n• Alert: first-time access to PII tables, queries outside business hours, large result downloads.\n• Ship logs to Splunk/Datadog via Snowflake Data Sharing or external stage export.\n\nRun monthly access review: users with ACCOUNTADMIN, stale users not logged in 90 days.",
        cmd: "SELECT user_name, client_ip, reported_client_type, event_type\nFROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nWHERE event_type = 'LOGIN'\n  AND event_timestamp > DATEADD(day, -1, CURRENT_TIMESTAMP());\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE object_name = 'CUSTOMERS'\nORDER BY query_start_time DESC LIMIT 20;",
      }
    ],
    hard: [
      {
        q: "Design a zero-trust security model for Snowflake in a regulated financial institution.",
        a: "Zero-trust in Snowflake eliminates implicit trust based on network location alone.\n• PrivateLink only—no public endpoint; network policy deny-by-default.\n• SSO with step-up MFA for privileged roles; no shared service passwords.\n• RBAC least privilege: functional roles, no direct grants to users, quarterly access reviews.\n• Row/column policies on all PII tables; secure views as only consumer interface.\n• Immutable audit logs exported to WORM storage; alerting on policy DDL changes.\n• Separation of duties: SECURITYADMIN cannot read data; DATA_ADMIN cannot change network policy.\n\nMap controls to SOC2/CCAR requirements with evidence collection automation.",
        cmd: "CREATE NETWORK POLICY zero_trust ALLOWED_IP_LIST = ('10.0.0.0/8');\nALTER ACCOUNT SET NETWORK_POLICY = zero_trust;\n\nCREATE ROW ACCESS POLICY region_policy AS (region VARCHAR) RETURNS BOOLEAN ->\n  region = CURRENT_SESSION()->>'authorized_region';\n\nGRANT ROLE data_reader TO USER analyst WITHOUT ADMIN OPTION;",
      },
      {
        q: "Lead incident response for suspected credential compromise of a service account.",
        a: "Service account compromise requires immediate containment and forensic analysis.\n• Detect: anomalous queries from service account IP, unusual data volume export, login from new geography.\n• Contain: ALTER USER ... SET DISABLED = TRUE; rotate key pair immediately.\n• Revoke and re-grant minimal privileges after scope review.\n• Forensics: QUERY_HISTORY and ACCESS_HISTORY for exfiltration scope; preserve query_ids.\n• Eradicate: new RSA key pair, update secrets manager, invalidate old public key on user.\n• Prevent: key rotation policy 90 days, network policy on service user, query tag monitoring.\n\nRegulatory notification if PII accessed—document timeline within 72 hours.",
        cmd: "ALTER USER etl_svc SET RSA_PUBLIC_KEY = 'MIIBIjAN...';\n\nALTER USER etl_svc SET DISABLED = TRUE;\n\nSELECT query_text, bytes_scanned, start_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE user_name = 'ETL_SVC'\n  AND start_time > DATEADD(day, -3, CURRENT_TIMESTAMP())\nORDER BY bytes_scanned DESC;",
      },
      {
        q: "How do you implement data classification and tag-based access policies at scale?",
        a: "Classification tags drive automated policy application across thousands of objects.\n• Tag objects: ALTER TABLE ... SET TAG data_classification = 'PII'.\n• Tag-based masking: masking policy references SYSTEM$GET_TAG on column.\n• OBJECT_DEPENDENCIES and TAG_REFERENCES audit tag propagation.\n• Terraform/Snowflake provider applies tags consistently in IaC.\n• Governance workflow: data steward tags at creation; policy auto-attaches via stored procedure.\n\nScale challenge: retroactive tagging sprint on legacy tables before policy enforcement date.",
        cmd: "CREATE TAG data_classification ALLOWED_VALUES 'PUBLIC', 'INTERNAL', 'PII', 'RESTRICTED';\n\nALTER TABLE customers SET TAG data_classification = 'PII';\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.TAG_REFERENCES\nWHERE tag_name = 'DATA_CLASSIFICATION';",
      },
      {
        q: "Compare security implications of external functions vs native SQL for data processing.",
        a: "External functions call external APIs (Lambda, Azure Functions) with security trade-offs.\n• Data leaves Snowflake boundary to external endpoint—network and compliance review required.\n• API integration uses secrets in API integration object—not embedded in function DDL.\n• Latency and availability depend on external service SLA.\n• Native SQL UDFs/Java UDFs keep data in Snowflake trust boundary.\n• Use external functions only when capability unavailable natively (ML API, geocoding).\n\nDocument data flow diagram for security review board approval.",
        cmd: "CREATE API INTEGRATION ext_api\n  API_PROVIDER = aws_api_gateway\n  API_AWS_ROLE_ARN = 'arn:aws:iam::123:role/snowflake_api'\n  ENABLED = TRUE;\n\nCREATE EXTERNAL FUNCTION geocode(v VARCHAR)\n  RETURNS VARIANT\n  API_INTEGRATION = ext_api\n  AS 'https://api.example.com/geocode';",
      }
    ],
  },

  'rbac': {
    easy: [
      {
        q: "Explain Snowflake's role-based access control model.",
        a: "Snowflake RBAC grants privileges to roles, which are assigned to users.\n• Securables: databases, schemas, tables, warehouses, integrations, etc.\n• Privileges: SELECT, INSERT, CREATE TABLE, USAGE, OWNERSHIP, etc.\n• Users activate roles per session: USE ROLE role_name; one primary role default.\n• Roles can inherit from other roles via GRANT ROLE child TO ROLE parent.\n• ACCOUNTADMIN is top-level—minimize direct assignment to humans.\n\nPrinciple of least privilege: grant minimum needed privilege on specific objects.",
        cmd: "SHOW ROLES;\nSHOW GRANTS TO ROLE analyst;\nSHOW GRANTS TO USER jane_doe;\n\nUSE ROLE analyst;\nSELECT CURRENT_ROLE(), CURRENT_AVAILABLE_ROLES();",
      },
      {
        q: "What is the difference between USAGE and SELECT privileges?",
        a: "Different privilege types govern different capabilities on different object types.\n• USAGE on database/schema: allows referencing objects inside—required before table access.\n• SELECT on table/view: allows reading rows (subject to row access policies).\n• USAGE on warehouse: allows running queries on that compute resource.\n• CREATE TABLE on schema: allows DDL for new tables in schema.\n• Missing USAGE on database causes \"does not exist or not authorized\" even with SELECT on table.\n\nGrant order: USAGE on DB → USAGE on SCHEMA → SELECT on TABLE.",
        cmd: "GRANT USAGE ON DATABASE prod TO ROLE analyst;\nGRANT USAGE ON SCHEMA prod.sales TO ROLE analyst;\nGRANT SELECT ON TABLE prod.sales.orders TO ROLE analyst;\n\nSHOW GRANTS TO ROLE analyst;",
      },
      {
        q: "How do you grant a role to a user?",
        a: "Role assignment connects users to privilege bundles.\n• GRANT ROLE role_name TO USER user_name.\n• User's DEFAULT_ROLE set on login if multiple roles granted.\n• SECONDARY ROLES: ALL enables all granted roles simultaneously in session.\n• ADMIN OPTION on grant allows user to re-grant role to others—use sparingly.\n• REVOKE ROLE removes access without deleting user.\n\nOnboarding checklist: grant role, set default warehouse, verify with SHOW GRANTS.",
        cmd: "GRANT ROLE data_analyst TO USER jane_doe;\nALTER USER jane_doe SET DEFAULT_ROLE = data_analyst DEFAULT_WAREHOUSE = bi_wh;\n\nGRANT ROLE etl_developer TO ROLE data_engineer;",
      },
      {
        q: "What are system-defined roles in Snowflake?",
        a: "Snowflake provides built-in roles with predefined capabilities.\n• ACCOUNTADMIN: full account control—users, roles, billing, all objects.\n• SECURITYADMIN: manage users, roles, grants—cannot read arbitrary data.\n• USERADMIN: create users and roles—cannot grant on data objects.\n• SYSADMIN: create warehouses and databases—typical for data platform team.\n• PUBLIC: automatically granted to all users—revoke dangerous default grants.\n\nCustom functional roles (ANALYST, ETL_ROLE) should hold actual data access—not ACCOUNTADMIN.",
        cmd: "SHOW ROLES LIKE '%ADMIN%';\n\nREVOKE CREATE DATABASE ON ACCOUNT FROM ROLE PUBLIC;\n\nGRANT ROLE sysadmin TO ROLE custom_platform_admin;",
      }
    ],
    medium: [
      {
        q: "How do you design a role hierarchy for a data platform team?",
        a: "Role hierarchy mirrors organizational functions with inheritance reducing grant sprawl.\n• Base roles: RAW_READER, RAW_LOADER, CURATED_READER, CURATED_WRITER per medallion layer.\n• Functional roles: DATA_ENGINEER inherits RAW_LOADER + CURATED_WRITER; ANALYST inherits CURATED_READER.\n• Environment roles: DEV_ENGINEER vs PROD_ENGINEER—prod write restricted.\n• Warehouse USAGE granted at functional role level.\n• Avoid role explosion: max 2–3 inheritance levels; document in data governance wiki.\n\nReview quarterly: SHOW GRANTS OF ROLE to find unused inherited privileges.",
        cmd: "CREATE ROLE curated_reader;\nGRANT USAGE ON DATABASE prod TO ROLE curated_reader;\nGRANT USAGE ON SCHEMA prod.gold TO ROLE curated_reader;\nGRANT SELECT ON ALL TABLES IN SCHEMA prod.gold TO ROLE curated_reader;\nGRANT SELECT ON FUTURE TABLES IN SCHEMA prod.gold TO ROLE curated_reader;\n\nGRANT ROLE curated_reader TO ROLE bi_analyst;",
      },
      {
        q: "What are future grants and why are they important?",
        a: "Future grants apply privileges to objects created after the grant statement.\n• GRANT SELECT ON FUTURE TABLES IN SCHEMA prod.gold TO ROLE analyst.\n• Without future grants, new tables invisible to role until manual GRANT.\n• FUTURE grants exist for tables, views, stages, functions, etc.\n• OWNERSHIP transfer may reset grant behavior—verify after ownership changes.\n• Managed access schemas centralize future grant management.\n\nETL automation creates tables nightly—future grants prevent daily access tickets.",
        cmd: "GRANT SELECT ON FUTURE TABLES IN SCHEMA prod.silver TO ROLE analyst;\nGRANT SELECT ON FUTURE VIEWS IN SCHEMA prod.gold TO ROLE bi_tool;\n\nSHOW FUTURE GRANTS TO ROLE analyst;",
      },
      {
        q: "How do you troubleshoot \"Insufficient privileges\" errors?",
        a: "Privilege errors require tracing grant chain from user to object.\n• Confirm active role: SELECT CURRENT_ROLE(); user may need USE ROLE.\n• SHOW GRANTS TO ROLE current_role for object privilege.\n• Check parent role inheritance: SHOW GRANTS OF ROLE child_role.\n• USAGE required on database and schema before table SELECT.\n• Row access policy may filter all rows—looks like empty table not privilege error.\n• USE SECONDARY ROLES ALL if privilege spread across roles.\n\nSimulate: USE ROLE target_role as SECURITYADMIN to reproduce issue.",
        cmd: "USE ROLE analyst;\nSELECT CURRENT_ROLE(), CURRENT_AVAILABLE_ROLES();\n\nSHOW GRANTS TO ROLE analyst;\nSHOW GRANTS ON TABLE prod.sales.orders;\n\nSHOW GRANTS TO USER jane_doe;",
      },
      {
        q: "Explain OWNERSHIP privilege and transfer implications.",
        a: "OWNERSHIP is the highest privilege on an object—implies all other privileges.\n• Object creator typically becomes owner automatically.\n• GRANT OWNERSHIP TO ROLE x COPY CURRENT GRANTS transfers control preserving grants.\n• GRANT OWNERSHIP ... REVOKE CURRENT GRANTS removes existing grants on transfer.\n• Only owner (or ACCOUNTADMIN) can DROP or ALTER object.\n• Centralized ownership model: platform role owns all prod objects; creators use service role.\n\nTerraform manages ownership to prevent individual users owning production tables.",
        cmd: "GRANT OWNERSHIP ON TABLE prod.sales.orders TO ROLE schema_admin COPY CURRENT GRANTS;\n\nSHOW GRANTS ON TABLE prod.sales.orders;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.GRANTS_TO_ROLES\nWHERE name = 'ORDERS' AND granted_on = 'TABLE';",
      }
    ],
    hard: [
      {
        q: "Design RBAC for a Snowflake account with 500 users and SOX compliance requirements.",
        a: "SOX-compliant RBAC enforces segregation of duties and auditable access changes.\n• No direct data access for users with deployment privileges.\n• CHANGE_MANAGEMENT role can deploy tasks/procedures but not SELECT prod financial tables.\n• FINANCE_READER read-only on gold finance schema; no WRITE anywhere.\n• All grants via Terraform PR with approval; no manual ACCOUNTADMIN in prod.\n• Quarterly access certification: managers attest SHOW GRANTS TO USER reports.\n• Break-glass ACCOUNTADMIN: named individuals, MFA, session logged to SIEM.\n\nEvidence package: grant change tickets, LOGIN_HISTORY, ACCESS_HISTORY for auditors.",
        cmd: "CREATE ROLE finance_reader;\nGRANT USAGE ON DATABASE prod TO ROLE finance_reader;\nGRANT USAGE ON SCHEMA prod.finance TO ROLE finance_reader;\nGRANT SELECT ON ALL TABLES IN SCHEMA prod.finance TO ROLE finance_reader;\n\nREVOKE ROLE sysadmin FROM USER contractor_1;",
      },
      {
        q: "How would you migrate from user-level grants to role-based model on legacy account?",
        a: "Legacy accounts often have direct grants to users causing governance debt.\n• Inventory: SNOWFLAKE.ACCOUNT_USAGE.GRANTS_TO_USERS full export.\n• Design target role matrix mapping old grants to functional roles.\n• Create roles, grant privileges, GRANT ROLE to user, verify access.\n• REVOKE direct grants from users once role verified.\n• Communicate change window; risk of brief access gap if misconfigured.\n• Automate drift detection: alert on new direct user grants.\n\nPhased by department: finance week 1, engineering week 2—rollback plan per phase.",
        cmd: "SELECT grantee_name, privilege, granted_on, name\nFROM SNOWFLAKE.ACCOUNT_USAGE.GRANTS_TO_USERS\nORDER BY grantee_name;\n\nREVOKE SELECT ON TABLE prod.sales.orders FROM USER legacy_user;\nGRANT ROLE sales_analyst TO USER legacy_user;",
      },
      {
        q: "Lead incident where PUBLIC role had unintended CREATE INTEGRATION privilege.",
        a: "Over-privileged PUBLIC role is a critical security vulnerability affecting all users.\n• Detect: security scan or auditor finding SHOW GRANTS TO ROLE PUBLIC.\n• Impact: any user could create external stages pointing to attacker buckets—data exfil risk.\n• Fix: REVOKE dangerous privileges from PUBLIC immediately.\n• Audit: ACCESS_HISTORY and QUERY_HISTORY for unauthorized integration/stage creation.\n• Root cause: bootstrap script granted overly broad privileges.\n• Prevent: CIS benchmark alignment, grant hardening in Terraform, deny-list monitor on PUBLIC grants.\n\nExecutive briefing: no evidence of exploitation vs confirmed exfiltration scope.",
        cmd: "SHOW GRANTS TO ROLE PUBLIC;\n\nREVOKE CREATE INTEGRATION ON ACCOUNT FROM ROLE PUBLIC;\nREVOKE CREATE STAGE ON ACCOUNT FROM ROLE PUBLIC;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.INTEGRATIONS\nWHERE created_on > DATEADD(day, -90, CURRENT_TIMESTAMP());",
      },
      {
        q: "Explain differences between RBAC and Discretionary Access Control in Snowflake context.",
        a: "Snowflake primarily uses RBAC but object owners have discretionary grant ability.\n• RBAC: central role grants managed by SECURITYADMIN/platform team.\n• DAC element: object owner can GRANT privileges on owned objects unless managed access schema.\n• Managed access schemas disable owner discretionary grants—owner approves via centralized model.\n• Enterprise standard: managed access on prod gold; discretionary allowed on dev sandboxes.\n• Conflict resolution: OWNERSHIP transfer to service role eliminates individual discretion in prod.\n\nArchitecture decision record should specify which schemas use managed access.",
        cmd: "CREATE SCHEMA prod.gold WITH MANAGED ACCESS;\nALTER SCHEMA prod.gold ENABLE MANAGED ACCESS;\n\n-- Owner cannot independently GRANT SELECT to new user\nSHOW MANAGED ACCESS SCHEMAS;",
      }
    ],
  },

  'streams': {
    easy: [
      {
        q: "What is a Snowflake stream and what problem does it solve?",
        a: "A stream is a change tracking object that records DML changes on a table.\n• Stream captures INSERT, UPDATE, DELETE metadata as rows in the stream object.\n• Enables incremental processing: consume only changed rows since last consumption.\n• Used with tasks for CDC pipelines without external tools like Debezium.\n• Stream data is not separate storage—it is metadata pointer to changed rows in base table.\n• Must be consumed (queried with DML or INSERT) to advance stream offset.\n\nPattern: stream on source table → task MERGEs changes into target.",
        cmd: "CREATE STREAM orders_stream ON TABLE orders;\n\nSELECT * FROM orders_stream;\n\nSHOW STREAMS IN SCHEMA sales;",
      },
      {
        q: "Explain INSERT-only vs standard (default) stream types.",
        a: "Stream type determines which DML operations are tracked.\n• Standard stream (default): tracks INSERT, UPDATE, DELETE with METADATA$ACTION column.\n• INSERT-only stream: tracks only new rows—lighter weight for append-only sources.\n• APPEND_ONLY table stream option for tables that never update/delete.\n• Choose INSERT-only when source is immutable event log.\n• Standard required when MERGE updates/deletes must propagate to downstream.\n\nWrong stream type causes missed deletes in slowly-changing dimension pipelines.",
        cmd: "CREATE STREAM events_insert_only ON TABLE events APPEND_ONLY = TRUE;\n\nCREATE STREAM customers_std ON TABLE customers;\n\nSELECT METADATA$ACTION, METADATA$ISUPDATE, * FROM customers_std;",
      },
      {
        q: "What are METADATA$ columns in a stream query result?",
        a: "Streams expose system metadata columns describing each change row.\n• METADATA$ACTION: INSERT, DELETE, or combined for UPDATE (appears as DELETE+INSERT pair).\n• METADATA$ISUPDATE: TRUE when row is update-delete half of update pair.\n• METADATA$ROW_ID: unique row identifier within stream result.\n• Use METADATA$ACTION in MERGE logic to route inserts vs deletes.\n• Consumer query should handle UPDATE as delete old + insert new pattern.\n\nTask MERGE templates filter WHERE METADATA$ACTION = 'INSERT' for append-only consumption.",
        cmd: "SELECT METADATA$ACTION, METADATA$ISUPDATE, order_id, status\nFROM orders_stream\nWHERE METADATA$ACTION IN ('INSERT', 'DELETE');",
      },
      {
        q: "How do you create a stream on a table?",
        a: "Stream creation is lightweight metadata DDL on existing or new tables.\n• CREATE STREAM stream_name ON TABLE table_name.\n• Optional SHOW_INITIAL_ROWS = TRUE includes existing rows at stream creation (one-time snapshot).\n• Stream must be in same database/schema context or fully qualified.\n• Requires SELECT on base table for stream owner role.\n• Stream does not work on external tables—only Snowflake-managed tables.\n\nAfter CREATE, first SELECT shows changes since stream creation (or all rows if SHOW_INITIAL_ROWS).",
        cmd: "CREATE OR REPLACE STREAM sales.orders_stream ON TABLE sales.orders;\n\nINSERT INTO sales.orders VALUES (1001, '2024-06-15', 250.00);\n\nSELECT * FROM sales.orders_stream;",
      }
    ],
    medium: [
      {
        q: "How do streams advance offset and what happens if a stream is not consumed?",
        a: "Stream offset tracks consumption point on the change log.\n• Querying stream alone does not advance offset—DML using stream results does (INSERT INTO target SELECT FROM stream).\n• Unconsumed streams accumulate changes; very long delay increases Time Travel dependency on base table.\n• Stream becomes stale if base table Time Travel retention exceeded before consumption—data loss risk.\n• SHOW STREAMS displays stale_after hint based on retention.\n• Monitor stream lag: row count in stream vs consumption task schedule.\n\nAlert if stream row count grows monotonically for 24+ hours.",
        cmd: "SELECT SYSTEM$STREAM_GET_TABLE_TIMESTAMP('orders_stream');\n\nSHOW STREAMS LIKE 'orders_stream';\n\nSELECT COUNT(*) FROM orders_stream;",
      },
      {
        q: "How do you build a CDC pipeline with stream and task?",
        a: "Stream + task is the native Snowflake CDC pattern for table-to-table replication.\n• CREATE STREAM on source; CREATE TASK scheduled WHEN SYSTEM$STREAM_HAS_DATA(stream).\n• Task body: MERGE INTO target USING (SELECT * FROM stream) ON key ...\n• Task must RESUME after creation (tasks created suspended by default).\n• Use EXECUTE AS CALLER or OWNER for appropriate privilege context.\n• Warehouse required for task execution—size for MERGE volume.\n\nError handling: ON_ERROR = SKIP_TASK or CONTINUE per task reliability requirements.",
        cmd: "CREATE TASK process_orders\n  WAREHOUSE = etl_wh\n  SCHEDULE = '1 MINUTE'\n  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')\n  AS MERGE INTO target_orders t\n  USING (SELECT * FROM orders_stream) s ON t.id = s.id\n  WHEN MATCHED THEN UPDATE SET ...\n  WHEN NOT MATCHED THEN INSERT ...;\n\nALTER TASK process_orders RESUME;",
      },
      {
        q: "What causes a stream to become stale and how do you recover?",
        a: "Stale stream means change data is no longer available in Time Travel for unconsumed offset.\n• Cause: task failed for longer than table DATA_RETENTION_TIME_IN_DAYS.\n• SHOW STREAMS shows stale = true and stale_after timestamp.\n• Recovery: full reload from base table or CLONE AT timestamp before staleness.\n• Recreate stream with SHOW_INITIAL_ROWS = TRUE after fixing pipeline.\n• Prevent: extend retention on source, faster task recovery, alerting on task failures.\n\nStale stream is data pipeline incident—downstream may have missed changes.",
        cmd: "SHOW STREAMS IN SCHEMA sales;\n\nCREATE OR REPLACE STREAM orders_stream ON TABLE orders SHOW_INITIAL_ROWS = TRUE;\n\nALTER TABLE orders SET DATA_RETENTION_TIME_IN_DAYS = 7;",
      },
      {
        q: "Can multiple streams exist on one table and multiple consumers share a stream?",
        a: "Multiple streams on same table support independent consumption pipelines.\n• Each stream maintains independent offset on same base table changes.\n• One stream should not have multiple uncoordinated consumers—race on offset advancement.\n• Pattern: one stream per downstream target (analytics stream, audit stream).\n• Views on streams not supported—query stream directly in task.\n• CLONE table copies data but not streams—recreate streams on clone.\n\nDocument stream ownership: which task consumes which stream.",
        cmd: "CREATE STREAM stream_for_analytics ON TABLE orders;\nCREATE STREAM stream_for_audit ON TABLE orders;\n\nSHOW STREAMS ON TABLE orders;",
      }
    ],
    hard: [
      {
        q: "Design exactly-once CDC from operational table to analytics warehouse with streams.",
        a: "Exactly-once semantics require idempotent MERGE and transactional task boundaries.\n• Stream captures changes; MERGE keyed on business primary key is idempotent on retry.\n• Task ON_ERROR = SUSPEND prevents silent skip; monitor TASK_HISTORY for failures.\n• Handle UPDATE pairs: MERGE logic uses METADATA$ACTION and METADATA$ISUPDATE correctly.\n• Ordering: process stream in transaction; single task consumer per stream.\n• Validation: reconciliation query comparing source COUNT/SUM to target daily.\n• Dead letter: rows failing validation inserted to quarantine table from stream.\n\nSLA: max 5-minute lag; zero duplicate rows measured by unique key constraint.",
        cmd: "CREATE TASK cdc_orders\n  WAREHOUSE = etl_wh\n  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')\n  AS\n    MERGE INTO analytics.orders t\n    USING (\n      SELECT * FROM orders_stream WHERE METADATA$ACTION != 'DELETE'\n    ) s ON t.order_id = s.order_id\n    WHEN MATCHED THEN UPDATE SET ...\n    WHEN NOT MATCHED THEN INSERT ...;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY())\nORDER BY scheduled_time DESC LIMIT 10;",
      },
      {
        q: "How do streams interact with Time Travel, CLONE, and DROP on base table?",
        a: "Stream lifecycle is tightly coupled to base table existence and retention.\n• DROP TABLE invalidates streams immediately.\n• CLONE TABLE does not copy streams—must recreate manually.\n• Time Travel UNDROP restores table but stream offsets may need validation.\n• TRUNCATE TABLE generates DELETE entries in standard stream.\n• SWAP TABLE: streams remain on respective tables post-swap—verify naming.\n\nBlue-green SWAP: recreate streams pointing to new prod table after cutover.",
        cmd: "CREATE TABLE orders_new CLONE orders;\nCREATE STREAM orders_new_stream ON TABLE orders_new;\n\nALTER TABLE orders SWAP WITH orders_new;\n\nSHOW STREAMS ON TABLE orders;",
      },
      {
        q: "Lead debugging of duplicate rows in downstream table fed by stream-task pipeline.",
        a: "Duplicate rows indicate MERGE idempotency failure or multiple task executions.\n• Check TASK_HISTORY for overlapping executions or manual task runs during schedule.\n• Verify MERGE ON clause uses unique business key—not date alone.\n• Stream consumed multiple times if transaction rolled back but offset advanced—rare; check task error log.\n• Multiple tasks reading same stream—architectural bug.\n• Fix: dedupe CTAS, add UNIQUE constraint, fix MERGE key, suspend duplicate tasks.\n\nRoot cause analysis: compare duplicate key timestamps to task execution log.",
        cmd: "SELECT order_id, COUNT(*) FROM target_orders GROUP BY 1 HAVING COUNT(*) > 1;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(TASK_NAME => 'PROCESS_ORDERS'))\nWHERE state = 'SUCCEEDED'\nORDER BY scheduled_time DESC LIMIT 20;\n\nALTER TASK process_orders SUSPEND;",
      },
      {
        q: "Compare Snowflake streams vs external CDC tools (Debezium, Fivetran) for enterprise CDC.",
        a: "Tool selection depends on source systems, latency, ops capacity, and cost.\n• Streams: native for Snowflake-to-Snowflake; no external infra; limited to Snowflake DML visibility.\n• Debezium: true DB transaction log CDC from Oracle/Postgres; requires Kafka ops.\n• Fivetran: managed connectors; SaaS cost; broad source support.\n• Hybrid: Debezium → Snowpipe → landing; streams for silver-to-gold inside Snowflake.\n• Evaluation: source latency, exactly-once guarantees, schema evolution, TCO over 3 years.\n\nPresent decision matrix for hybrid lakehouse referencing existing Kafka investment.",
        cmd: "CREATE STREAM bronze_to_silver ON TABLE bronze.events;\n\n-- External CDC lands via:\nCOPY INTO bronze.events FROM @kafka_stage FILE_FORMAT = (TYPE = AVRO);\n\nSELECT COUNT(*) FROM bronze_to_silver;",
      }
    ],
  },

  'tasks': {
    easy: [
      {
        q: "What is a Snowflake task and how is it different from an external scheduler?",
        a: "Tasks are Snowflake-native scheduled SQL execution with dependency support.\n• CREATE TASK with SCHEDULE cron or AFTER dependency on another task.\n• Runs SQL/ CALL procedure on specified warehouse when triggered.\n• No external Airflow/cron server required—metadata in Snowflake cloud services.\n• Tasks created in SUSPENDED state—must ALTER TASK RESUME.\n• Task history in INFORMATION_SCHEMA.TASK_HISTORY.\n\nUse external orchestrator when cross-system dependencies exceed Snowflake-only scope.",
        cmd: "CREATE TASK daily_load\n  WAREHOUSE = etl_wh\n  SCHEDULE = 'USING CRON 0 6 * * * America/New_York'\n  AS INSERT INTO summary SELECT * FROM staging;\n\nALTER TASK daily_load RESUME;\n\nSHOW TASKS IN SCHEMA sales;",
      },
      {
        q: "Explain task scheduling with CRON expressions in Snowflake.",
        a: "Snowflake tasks use standard cron syntax with timezone specification.\n• Format: USING CRON minute hour day month day-of-week timezone.\n• Example: 0 6 * * * America/New_York = daily 6 AM Eastern.\n• Minimum interval depends on account—typically 1 minute for serverless tasks.\n• SCHEDULE = NULL with WHEN clause for event-driven (stream has data).\n• TIMESTAMP_INPUT_FORMAT for task parameterization with scheduled time.\n\nUse UTC timezone for global teams to avoid DST confusion, or explicit regional timezone.",
        cmd: "CREATE TASK hourly_agg\n  WAREHOUSE = etl_wh\n  SCHEDULE = 'USING CRON 0 * * * * UTC'\n  AS CALL aggregate_hourly();\n\nALTER TASK hourly_agg RESUME;",
      },
      {
        q: "Why are tasks created in SUSPENDED state by default?",
        a: "Suspended-by-default prevents accidental execution before validation.\n• Creator must explicitly RESUME after reviewing SQL, warehouse, and schedule.\n• Allows building task DAG (root + children) before starting execution.\n• CI/CD can deploy tasks suspended; resume in controlled change window.\n• ALTER TASK SUSPEND immediately stops future runs—incident response.\n• SHOW TASKS displays state column: started/suspended.\n\nProduction promotion checklist: resume only after dependency tasks verified.",
        cmd: "CREATE TASK child_task\n  WAREHOUSE = etl_wh\n  AFTER parent_task\n  AS CALL process_child();\n\nSELECT state FROM TABLE(INFORMATION_SCHEMA.TASKS())\nWHERE name = 'CHILD_TASK';\n\nALTER TASK child_task RESUME;",
      },
      {
        q: "What warehouse is required for task execution?",
        a: "Tasks require an active warehouse to execute SQL—cloud services only orchestrates.\n• WAREHOUSE parameter mandatory on root scheduled tasks.\n• Child tasks in DAG inherit warehouse from root unless overridden.\n• Serverless tasks (Snowflake-managed warehouse) available for some task types—check account.\n• Warehouse must be RESUMED or AUTO_RESUME enabled—suspended warehouse delays task.\n• Right-size warehouse for task SQL—nightly MERGE may need Large.\n\nCost: task credits appear in WAREHOUSE_METERING_HISTORY under task warehouse.",
        cmd: "CREATE TASK merge_task\n  WAREHOUSE = etl_wh\n  SCHEDULE = 'USING CRON 30 5 * * * UTC'\n  AS MERGE INTO prod.t FROM staging.t ...;\n\nSHOW WAREHOUSES LIKE 'etl_wh';\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY())\nORDER BY scheduled_time DESC LIMIT 5;",
      }
    ],
    medium: [
      {
        q: "How do you create a task DAG with dependencies?",
        a: "Task graphs chain execution order without external orchestration.\n• Root task has SCHEDULE; child tasks use AFTER parent_task_name.\n• Only root needs SCHEDULE; children trigger when parent succeeds.\n• Resume order: children first, then parents (bottom-up resume).\n• Suspend order: parents first (top-down suspend) to prevent orphan runs.\n• Deep DAGs supported but complex graphs better in Airflow for visibility.\n\nNaming convention: schema.task_layer_step for clear dependency graph.",
        cmd: "CREATE TASK root_task WAREHOUSE = etl_wh SCHEDULE = 'USING CRON 0 5 * * * UTC' AS CALL step1();\nCREATE TASK child_a AFTER root_task AS CALL step2a();\nCREATE TASK child_b AFTER child_a AS CALL step2b();\n\nALTER TASK child_b RESUME;\nALTER TASK child_a RESUME;\nALTER TASK root_task RESUME;",
      },
      {
        q: "How do you monitor task failures and set up alerting?",
        a: "Task operational health requires TASK_HISTORY monitoring and notifications.\n• INFORMATION_SCHEMA.TASK_HISTORY or ACCOUNT_USAGE.TASK_HISTORY shows state, error_code, error_message.\n• Failed states: FAILED, CANCELLED, TIMED_OUT.\n• Snowflake email notifications on task failure via notification integration.\n• Custom alert: scheduled task queries TASK_HISTORY and sends via external function.\n• ON_ERROR = SUSPEND_TASK stops DAG on failure—prevents downstream corruption.\n\nDashboard: success rate per task last 7 days, p95 duration trend.",
        cmd: "SELECT name, state, error_message, scheduled_time, completed_time\nFROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(\n  SCHEDULED_TIME_RANGE_START => DATEADD(day, -1, CURRENT_TIMESTAMP())\n))\nWHERE state != 'SUCCEEDED'\nORDER BY scheduled_time DESC;\n\nALTER TASK merge_task SET USER_TASK_TIMEOUT_MS = 3600000;",
      },
      {
        q: "What is USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE for serverless tasks?",
        a: "Serverless tasks use Snowflake-managed compute without specifying customer warehouse.\n• Snowflake provisions and scales compute automatically for the task.\n• Billed separately—compare cost vs dedicated warehouse for predictable workloads.\n• USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE sets starting size for managed tasks.\n• Good for sporadic light tasks; heavy MERGE may be cheaper on dedicated warehouse.\n• Not all accounts/regions support all serverless task features.\n\nBenchmark: run task 30 days serverless vs dedicated WH and compare credits.",
        cmd: "CREATE TASK serverless_refresh\n  SCHEDULE = 'USING CRON 0 */4 * * * UTC'\n  USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE = 'MEDIUM'\n  AS CALL refresh_summary();\n\nALTER TASK serverless_refresh RESUME;",
      },
      {
        q: "How do you pass parameters or context into task SQL?",
        a: "Tasks support limited parameterization through SQL and session context.\n• CALL stored procedure with arguments defined in task body.\n• SYSTEM$TASK_RUNTIME_INFO() returns scheduled time for incremental watermark.\n• Session variables set in stored procedure called by task.\n• No native task parameters like Airflow macros—use procedure arguments.\n• {{scheduled_time}} not available in raw SQL task—wrap in procedure.\n\nPattern: procedure reads runtime info and processes WHERE updated_at > last_watermark.",
        cmd: "CREATE PROCEDURE process_delta()\nRETURNS VARCHAR\nLANGUAGE SQL\nAS $$\n  DECLARE run_ts TIMESTAMP;\n  BEGIN\n    run_ts := (SELECT SCHEDULED_TIME FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY())\n               WHERE name = 'DELTA_TASK' ORDER BY scheduled_time DESC LIMIT 1);\n    MERGE INTO target USING (SELECT * FROM source WHERE updated_at <= :run_ts) ...;\n    RETURN 'OK';\n  END;\n$$;\n\nCREATE TASK delta_task WAREHOUSE = etl_wh SCHEDULE = 'USING CRON */15 * * * * UTC' AS CALL process_delta();",
      }
    ],
    hard: [
      {
        q: "Design a task orchestration replacing Airflow for Snowflake-only ETL with 40 tasks.",
        a: "Migrating 40 tasks requires DAG design, error handling, and observability parity with Airflow.\n• Organize into layered DAGs: ingest → silver → gold per domain to limit blast radius.\n• Root tasks per layer with AFTER dependencies; avoid single monolithic 40-node graph.\n• ON_ERROR = SUSPEND_TASK on all tasks; central monitoring task checks TASK_HISTORY.\n• Warehouse per layer: ingest_wh, transform_wh sized independently.\n• Keep Airflow only for cross-system (Salesforce extract) triggers via external task trigger API.\n• Document resume/suspend order in runbook for deployments.\n\nSuccess criteria: match Airflow SLA, reduce orchestration infra cost 50%.",
        cmd: "CREATE TASK gold_refresh AFTER silver_clean AS CALL build_gold();\n\nSELECT root_task_id, name, state, scheduled_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.TASK_HISTORY\nWHERE scheduled_time > DATEADD(day, -1, CURRENT_TIMESTAMP())\nORDER BY graph_version DESC, name;",
      },
      {
        q: "Troubleshoot a task chain where parent succeeds but child never executes.",
        a: "Child non-execution despite parent success indicates dependency or resume state issues.\n• Verify child is RESUMED: SHOW TASKS—child state must be started.\n• Parent must complete with SUCCEEDED state—not SKIPPED or cancelled with continue.\n• Check child AFTER clause references correct parent name including schema.\n• Graph version: task DDL changes create new graph version—resume new graph.\n• Warehouse suspended on child prevents run—check warehouse state.\n• WHEN condition on child (stream has data) may be false despite parent success.\n\nExecute: SELECT SYSTEM$USER_TASK_CANCEL_ONGOING_TASKS() only if stuck run.",
        cmd: "SHOW TASKS IN SCHEMA etl;\n\nSELECT name, state, condition, predecessor\nFROM TABLE(INFORMATION_SCHEMA.TASK_DEPENDENTS(TASK_NAME => 'ROOT_TASK'));\n\nALTER TASK child_task RESUME;",
      },
      {
        q: "Lead incident where runaway task loop consumed monthly warehouse budget.",
        a: "Runaway tasks create credit emergencies requiring immediate suspension and root cause analysis.\n• Scenario: stream-triggered task reschedules every minute; MERGE full table each run.\n• Detect: WAREHOUSE_METERING_HISTORY spike; TASK_HISTORY shows hundreds of runs/hour.\n• Mitigate: ALTER TASK ... SUSPEND; ALTER WAREHOUSE ... SUSPEND IMMEDIATE.\n• Root cause: missing WHEN SYSTEM$STREAM_HAS_DATA guard; or task resumes itself via procedure.\n• Fix: add stream condition, increase schedule interval, optimize MERGE to delta only.\n• Prevent: resource monitor on task warehouse; alert on >N task runs per hour.\n\nPostmortem credit recovery: request Snowflake support goodwill only if platform bug.",
        cmd: "ALTER TASK runaway_task SUSPEND;\n\nSELECT name, COUNT(*) AS runs, SUM(DATEDIFF(second, scheduled_time, completed_time)) AS total_sec\nFROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(\n  SCHEDULED_TIME_RANGE_START => DATEADD(day, -1, CURRENT_TIMESTAMP())\n))\nGROUP BY 1 ORDER BY runs DESC;\n\nCREATE RESOURCE MONITOR task_wh_limit WITH CREDIT_QUOTA = 200 TRIGGERS ON 100 PERCENT DO SUSPEND;",
      },
      {
        q: "Compare tasks with dynamic tables for pipeline orchestration in 2024+ architectures.",
        a: "Dynamic tables increasingly replace simple task+stream+MERGE patterns.\n• Dynamic tables: declarative TARGET_LAG, automatic dependency graph, refresh scheduling built-in.\n• Tasks: imperative SQL/procedure, full control, complex branching, external integrations.\n• Migration: replace linear stream MERGE chains with dynamic table equivalents.\n• Keep tasks for: CALL procedures, multi-step branching, non-SQL operations, stream WHEN triggers.\n• Hybrid: dynamic tables for transforms; task for export to external systems post-refresh.\n\nArchitecture review: 60% of task DAG may convert to dynamic tables simplifying ops.",
        cmd: "CREATE DYNAMIC TABLE dt_orders TARGET_LAG = '10 minutes' WAREHOUSE = etl_wh AS\nSELECT * FROM raw.orders WHERE status = 'ACTIVE';\n\nSHOW DYNAMIC TABLES;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.DYNAMIC_TABLE_REFRESH_HISTORY LIMIT 10;",
      }
    ],
  },

  'dynamic-tables': {
    easy: [
      {
        q: "What is a Snowflake dynamic table and how does it differ from a view?",
        a: "Dynamic tables are materialized query results with automatic incremental refresh.\n• Defined by AS SELECT query like a view but Snowflake maintains physical storage.\n• TARGET_LAG specifies maximum staleness (e.g., 1 hour, downstream refresh triggers).\n• Refresh uses warehouse compute; dependency graph auto-orchestrates upstream-first refresh.\n• Unlike views, queries scan pre-materialized data—faster for heavy aggregations.\n• Unlike manual tables + tasks, no explicit MERGE/stream code required.\n\nUse dynamic tables for declarative pipeline layers replacing task chains.",
        cmd: "CREATE DYNAMIC TABLE dt_active_users\n  TARGET_LAG = '1 hour'\n  WAREHOUSE = etl_wh AS\nSELECT user_id, last_login FROM users WHERE status = 'ACTIVE';\n\nSELECT * FROM dt_active_users;",
      },
      {
        q: "Explain TARGET_LAG and how it controls refresh frequency.",
        a: "TARGET_LAG is the maximum acceptable staleness for dynamic table data.\n• '1 minute', '5 minutes', '1 hour', 'DOWNSTREAM' (refresh when downstream DT queried).\n• Snowflake schedules refreshes to keep data within lag SLA.\n• Shorter lag = more frequent refreshes = more credits.\n• DOWNSTREAM optimizes cost when table only needed on-demand by child DT.\n• Monitor refresh history for actual lag vs target.\n\nMatch TARGET_LAG to business SLA: hourly KPIs do not need 1-minute lag.",
        cmd: "ALTER DYNAMIC TABLE dt_sales SET TARGET_LAG = '30 minutes';\n\nSELECT name, target_lag, scheduling_state\nFROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLES());",
      },
      {
        q: "How do dynamic tables form dependency graphs?",
        a: "Dynamic tables automatically detect upstream dependencies from query text.\n• DT gold references DT silver in SELECT—gold refresh waits for silver refresh.\n• Snowflake builds DAG and refreshes in topological order.\n• ALTER DYNAMIC TABLE ... REFRESH manually triggers refresh including dependencies.\n• Broken dependency (dropped source) suspends dynamic table.\n• SHOW DYNAMIC TABLES shows scheduling_state and last refresh time.\n\nReplaces manual task AFTER chains for SQL-only transforms.",
        cmd: "CREATE DYNAMIC TABLE dt_silver TARGET_LAG = '15 min' WAREHOUSE = etl_wh AS\nSELECT * FROM bronze.raw_orders WHERE valid = TRUE;\n\nCREATE DYNAMIC TABLE dt_gold TARGET_LAG = '30 min' WAREHOUSE = etl_wh AS\nSELECT region, SUM(amount) FROM dt_silver GROUP BY 1;",
      },
      {
        q: "What warehouse is used for dynamic table refresh?",
        a: "Dynamic tables require a warehouse for refresh compute—specified at creation.\n• WAREHOUSE = wh_name in CREATE DYNAMIC TABLE statement.\n• Same warehouse can serve multiple DTs—watch concurrency and queuing.\n• Refresh credits billed to specified warehouse in metering history.\n• ALTER DYNAMIC TABLE ... SET WAREHOUSE = new_wh to change.\n• Suspend dynamic table to stop refresh credits during maintenance.\n\nSize warehouse based on refresh QUERY_HISTORY bytes_scanned per DT.",
        cmd: "CREATE DYNAMIC TABLE dt_kpis\n  TARGET_LAG = '1 hour'\n  WAREHOUSE = transform_wh AS\nSELECT order_date, COUNT(*) FROM orders GROUP BY 1;\n\nALTER DYNAMIC TABLE dt_kpis SET WAREHOUSE = transform_wh_large;",
      }
    ],
    medium: [
      {
        q: "How do you troubleshoot a dynamic table with refresh failures?",
        a: "Refresh failures appear in DYNAMIC_TABLE_REFRESH_HISTORY with error messages.\n• Check scheduling_state: SUSPENDED, FAILED reasons in history view.\n• Common causes: warehouse suspended, privilege lost on base table, SQL error in definition.\n• ALTER DYNAMIC TABLE ... REFRESH for manual retry after fix.\n• Validate base table schema change did not break SELECT (new column dependency).\n• Warehouse too small causes timeout—upsize or increase STATEMENT_TIMEOUT.\n\nCompare error_message across refreshes for recurring vs transient failures.",
        cmd: "SELECT name, state, error_message, refresh_start_time, refresh_end_time\nFROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY())\nWHERE state = 'FAILED'\nORDER BY refresh_start_time DESC LIMIT 10;\n\nALTER DYNAMIC TABLE dt_kpis REFRESH;",
      },
      {
        q: "When should you choose dynamic tables over streams + tasks?",
        a: "Selection depends on pipeline complexity and team preference for declarative vs imperative.\n• Dynamic tables: linear SQL transforms, clear lag SLA, reduced ops code.\n• Streams + tasks: complex MERGE logic, conditional branching, non-SQL steps, external calls.\n• Dynamic tables handle incremental refresh automatically; tasks give explicit control.\n• Migration path: prototype as DT, fall back to task if SQL limitations hit.\n• Cost compare: DT refresh credits vs task MERGE credits over 30 days.\n\nHybrid architectures use DT for silver/gold and tasks for ingestion triggers.",
        cmd: "CREATE DYNAMIC TABLE dt_enriched TARGET_LAG = '10 minutes' WAREHOUSE = etl_wh AS\nSELECT o.*, c.segment FROM orders o JOIN customers c ON o.cust_id = c.id;\n\nSHOW DYNAMIC TABLES LIKE 'dt_enriched';",
      },
      {
        q: "How do you suspend and resume dynamic table refreshes for maintenance?",
        a: "Suspension stops scheduled refreshes without dropping the table.\n• ALTER DYNAMIC TABLE ... SUSPEND stops refresh scheduling.\n• RESUME re-enables per TARGET_LAG schedule.\n• Use during upstream schema migration or data backfill on base tables.\n• Downstream DTs may stall if upstream suspended—coordinate dependency chain.\n• Data remains queryable at last successful refresh state while suspended.\n\nMaintenance window: suspend gold first, then silver, then modify bronze.",
        cmd: "ALTER DYNAMIC TABLE dt_gold SUSPEND;\nALTER DYNAMIC TABLE dt_silver SUSPEND;\n\n-- perform maintenance on base tables\n\nALTER DYNAMIC TABLE dt_silver RESUME;\nALTER DYNAMIC TABLE dt_gold RESUME;",
      },
      {
        q: "What are limitations of dynamic table SQL definitions?",
        a: "Dynamic tables support subset of SQL—verify current docs for unsupported constructs.\n• Generally: SELECT, JOIN, aggregations, window functions within supported set.\n• Unsupported patterns may require views as intermediate or task-based load.\n• External tables, certain UDF types, and non-deterministic functions may be restricted.\n• Very complex multi-stage logic may be clearer as chained DTs than one giant query.\n• Test CREATE in dev before prod deployment.\n\nWhen blocked, create secure view + task MERGE as fallback pattern.",
        cmd: "CREATE DYNAMIC TABLE dt_test TARGET_LAG = '1 hour' WAREHOUSE = etl_wh AS\nSELECT a.id, b.name FROM table_a a LEFT JOIN table_b b ON a.id = b.id;\n\nSELECT GET_DDL('DYNAMIC TABLE', 'dt_test');",
      }
    ],
    hard: [
      {
        q: "Design a medallion lakehouse using only dynamic tables with tiered TARGET_LAG.",
        a: "All-dynamic-table medallion simplifies lineage and reduces task sprawl.\n• Bronze: DT from external table/stage with TARGET_LAG 5 min on landing data.\n• Silver: DT cleanses bronze with 15 min lag, JOIN to reference data.\n• Gold: DT aggregates silver with 1 hour lag for BI consumption.\n• Warehouse isolation: bronze_wh (small frequent), gold_wh (large hourly).\n• Monitoring: dashboard on refresh history lag vs target per layer.\n• Failure isolation: suspend gold only while fixing silver upstream.\n\nDocument dependency DAG exported from SHOW DYNAMIC TABLES and REFRESH_HISTORY.",
        cmd: "CREATE DYNAMIC TABLE bronze_orders TARGET_LAG = '5 minutes' WAREHOUSE = ingest_wh AS\nSELECT * FROM @landing_stage/orders/;\n\nCREATE DYNAMIC TABLE gold_daily TARGET_LAG = '1 hour' WAREHOUSE = analytics_wh AS\nSELECT order_date, SUM(amount) FROM silver_orders GROUP BY 1;",
      },
      {
        q: "Optimize dynamic table refresh cost for a pipeline spending 40% of account credits.",
        a: "DT cost optimization targets lag tuning, warehouse sizing, and query efficiency.\n• Increase TARGET_LAG where SLA allows—1 min → 15 min can cut refreshes 15×.\n• Use DOWNSTREAM lag for tables only consumed by other DTs.\n• Right-size refresh warehouse; separate heavy and light DTs to different warehouses.\n• Optimize underlying SELECT: prune columns, filter early, cluster base tables.\n• Suspend unused DTs discovered via ACCESS_HISTORY zero queries 30 days.\n\nPresent savings forecast: lag changes vs SLA impact per dashboard.",
        cmd: "SELECT name, SUM(credits_used) AS refresh_credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.DYNAMIC_TABLE_REFRESH_HISTORY\nWHERE start_time > DATEADD(day, -30, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 2 DESC;\n\nALTER DYNAMIC TABLE dt_low_priority SET TARGET_LAG = '4 hours';",
      },
      {
        q: "Lead migration from 25-task stream MERGE pipeline to dynamic tables.",
        a: "Migration requires parity validation and phased cutover.\n• Inventory task DAG; map each MERGE to equivalent DT SELECT.\n• Build DTs in parallel writing to _v2 tables; compare row counts and hashes.\n• Cutover: rename/swap tables, suspend old tasks, resume DTs.\n• Rollback plan: resume tasks, swap back if lag SLA missed in week one.\n• Train team on REFRESH_HISTORY monitoring replacing TASK_HISTORY.\n• Decommission streams after 14-day parallel run with zero discrepancies.\n\nExecutive summary: 70% less pipeline code, 15% credit reduction, same 15-min SLA.",
        cmd: "CREATE DYNAMIC TABLE orders_silver_v2 TARGET_LAG = '15 minutes' WAREHOUSE = etl_wh AS\nSELECT * FROM bronze.orders WHERE _processed IS NOT NULL;\n\nALTER TASK legacy_merge SUSPEND;\nALTER TABLE orders_silver SWAP WITH orders_silver_v2;",
      },
      {
        q: "Explain refresh modes and incremental maintenance internals at a high level.",
        a: "Understanding refresh internals helps debug lag and correctness issues.\n• Snowflake tracks changes on base objects to refresh DT incrementally when possible.\n• Full refresh fallback occurs when incremental not possible (certain DDL, definition change).\n• Definition change may require INITIALIZE or full rebuild depending on alteration.\n• Monitor refresh_type in history: incremental vs full.\n• Full refresh on large DT is expensive—schedule definition changes off-peak.\n\nInterview depth: incremental leverages micro-partition change tracking similar to streams conceptually.",
        cmd: "SELECT name, refresh_action, refresh_start_time, refresh_end_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.DYNAMIC_TABLE_REFRESH_HISTORY\nWHERE name = 'DT_ORDERS'\nORDER BY refresh_start_time DESC LIMIT 20;\n\nALTER DYNAMIC TABLE dt_orders REFRESH;",
      }
    ],
  },

  'snowpipe': {
    easy: [
      {
        q: "What is Snowpipe and how does it differ from COPY INTO?",
        a: "Snowpipe is Snowflake's continuous auto-ingest service for cloud storage files.\n• COPY INTO: manual or scheduled batch load command you execute.\n• Snowpipe: event-driven—cloud storage notification triggers automatic ingest on file arrival.\n• Snowpipe uses compute credits per file loaded (serverless ingest mode).\n• Near-real-time latency (minutes) vs batch COPY on schedule.\n• PIPE object defines COPY logic; AUTO_INGEST = TRUE enables event notifications.\n\nUse Snowpipe for streaming landing zone; COPY for bulk historical backfill.",
        cmd: "CREATE PIPE orders_pipe AUTO_INGEST = TRUE AS\nCOPY INTO orders FROM @landing_stage FILE_FORMAT = csv_format;\n\nSHOW PIPES;\n\nSELECT SYSTEM$PIPE_STATUS('orders_pipe');",
      },
      {
        q: "How do you check Snowpipe load status and history?",
        a: "Pipe monitoring uses system functions and load history views.\n• SYSTEM$PIPE_STATUS(pipe_name) returns execution state and pending file count.\n• COPY_HISTORY or LOAD_HISTORY shows files loaded, errors, row counts.\n• PIPE_USAGE_HISTORY in ACCOUNT_USAGE for billing and throughput.\n• Notification channel errors appear in pipe status when SQS/Event Grid misconfigured.\n• Alert on pending file backlog growth.\n\nDashboard: files/hour, error rate, avg latency file-arrival to loaded.",
        cmd: "SELECT SYSTEM$PIPE_STATUS('sales.public.orders_pipe');\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'ORDERS',\n  START_TIME => DATEADD(hour, -24, CURRENT_TIMESTAMP())\n));\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY LIMIT 10;",
      },
      {
        q: "What cloud notifications does Snowpipe require for auto-ingest?",
        a: "Auto-ingest depends on cloud provider event notifications to Snowflake SQS queue.\n• AWS: S3 event notification → SQS queue (Snowflake-provided) → pipe trigger.\n• Azure: Event Grid on blob storage; GCP: Pub/Sub notifications.\n• DESC PIPE shows notification_channel with SQS ARN to configure in S3.\n• Without notification, use ALTER PIPE ... REFRESH for manual polling mode.\n• Storage integration secures Snowflake access to stage without keys.\n\nSetup checklist: stage, integration, pipe, notification, test file upload.",
        cmd: "DESC PIPE orders_pipe;\n\n-- Configure S3 event notification to SQS ARN from DESC PIPE output\n\nALTER PIPE orders_pipe REFRESH;",
      },
      {
        q: "Explain ON_ERROR options in Snowpipe COPY statements.",
        a: "ON_ERROR controls pipe behavior when individual rows or files fail validation.\n• ON_ERROR = CONTINUE: skip bad rows, load good rows, log errors.\n• ON_ERROR = SKIP_FILE: skip entire file on any error.\n• ON_ERROR = ABORT_STATEMENT: fail file load on first error.\n• Production pipes often use CONTINUE + quarantine monitoring on rejected records.\n• VALIDATION_MODE not used in pipe—test format separately before pipe DDL.\n\nPair with FILE_FORMAT error handling options for malformed CSV.",
        cmd: "CREATE PIPE events_pipe AUTO_INGEST = TRUE AS\nCOPY INTO events FROM @stage\nFILE_FORMAT = (TYPE = JSON)\nON_ERROR = 'CONTINUE';\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'EVENTS', START_TIME => DATEADD(hour, -1, CURRENT_TIMESTAMP())\n));",
      }
    ],
    medium: [
      {
        q: "How do you troubleshoot Snowpipe files stuck in pending state?",
        a: "Pending files indicate notification or permission pipeline breakdown.\n• SYSTEM$PIPE_STATUS: pending_file_count > 0 with no progress.\n• Verify S3 event notification targets correct SQS; check IAM/SQS policy.\n• Storage integration ALLOWED_LOCATIONS includes file path.\n• File size zero or unsupported compression blocks ingest.\n• ALTER PIPE ... REFRESH forces poll—if works, notification path is broken.\n• Snowflake support for persistent pipe internal errors with pipe_id.\n\nRunbook: test with single file, trace notification → SQS → pipe metrics.",
        cmd: "SELECT SYSTEM$PIPE_STATUS('orders_pipe');\n\nALTER PIPE orders_pipe REFRESH;\n\nDESC INTEGRATION s3_integration;\n\nLIST @landing_stage;",
      },
      {
        q: "How does Snowpipe handle duplicate file loads?",
        a: "Snowpipe provides load idempotency for duplicate file delivery.\n• Snowflake tracks loaded files by name and metadata—re-sending same file skipped.\n• File renamed but same content may load again—use path conventions with unique names.\n• PIPE with COPY options MATCH_BY_COLUMN_NAME for evolving Parquet schemas.\n• Exactly-once at file level; within-file duplicates need MERGE dedup downstream.\n• LIST @stage compared to COPY_HISTORY detects unloaded files.\n\nKafka landing: include offset in filename for uniqueness and ordering debug.",
        cmd: "SELECT file_name, status, row_count, last_load_time\nFROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'ORDERS',\n  START_TIME => DATEADD(day, -7, CURRENT_TIMESTAMP())\n))\nORDER BY last_load_time DESC;",
      },
      {
        q: "Compare Snowpipe with Snowpipe Streaming (Kafka API) for real-time ingest.",
        a: "Two ingest modes serve different latency and source requirements.\n• Classic Snowpipe: files in cloud storage, minute-level latency, cheapest for batch micro-files.\n• Snowpipe Streaming: SDK/Kafka API direct insert, sub-second latency, per-row billing model.\n• Streaming for true real-time dashboards; classic pipe for log files dropped in S3.\n• Streaming does not require cloud storage notification setup.\n• Hybrid: streaming to bronze, pipe for bulk historical backfill.\n\nEvaluate monthly cost at expected TPS for each mode.",
        cmd: "CREATE PIPE bulk_pipe AUTO_INGEST = TRUE AS COPY INTO events FROM @s3_stage;\n\n-- Snowpipe Streaming uses ingest SDK:\n-- INSERT INTO events SELECT PARSE_JSON($1) FROM VALUES (...);\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY;",
      },
      {
        q: "How do you secure Snowpipe access to external stages?",
        a: "Security uses storage integration and least-privilege IAM—not embedded credentials.\n• STORAGE INTEGRATION with ALLOWED_LOCATIONS prefix restricts bucket paths.\n• IAM role trust policy allows Snowflake IAM user to assume role.\n• Pipe owner role needs USAGE on integration, stage, and INSERT on target table.\n• Separate integrations per environment (dev vs prod buckets).\n• Audit pipe DDL and stage changes in ACCESS_HISTORY.\n\nNever create external stage with ACCESS_KEY_ID in production.",
        cmd: "CREATE STORAGE INTEGRATION prod_s3_int\n  STORAGE_PROVIDER = S3\n  ENABLED = TRUE\n  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::123:role/sf-prod'\n  STORAGE_ALLOWED_LOCATIONS = ('s3://prod-landing/');\n\nGRANT USAGE ON INTEGRATION prod_s3_int TO ROLE pipe_admin;",
      }
    ],
    hard: [
      {
        q: "Design high-volume Snowpipe architecture for 1 million files per day.",
        a: "Million-file/day ingest requires file batching, path partitioning, and error isolation.\n• Upstream aggregator batches small files to 100–250 MB Parquet before landing—reduces pipe overhead.\n• Hive-style paths: s3://bucket/yyyy/mm/dd/hh/ for partition alignment and debugging.\n• Multiple pipes per domain table to isolate failure blast radius.\n• Monitor PIPE_USAGE_HISTORY credits; file-per-row JSON is anti-pattern at scale.\n• Dead letter prefix for files failing COPY after N retries.\n• Auto-scaling: Snowflake manages pipe compute; focus on notification throughput.\n\nSLA: 95% files loaded within 5 minutes of landing.",
        cmd: "CREATE PIPE events_pipe AUTO_INGEST = TRUE AS\nCOPY INTO events FROM @stage/events/\nFILE_FORMAT = (TYPE = PARQUET)\nPATTERN = '.*[.]parquet';\n\nSELECT COUNT(*), DATE_TRUNC('hour', last_load_time)\nFROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(TABLE_NAME => 'EVENTS', START_TIME => DATEADD(day, -1, CURRENT_TIMESTAMP())))\nGROUP BY 2;",
      },
      {
        q: "Lead incident where Snowpipe silently stopped loading for 12 hours.",
        a: "Silent pipe failure causes data freshness SLA breach and downstream stale analytics.\n• Detect: freshness monitor on MAX(loaded_at); pipe pending count; stakeholder reports.\n• Triage: SYSTEM$PIPE_STATUS error field; AWS SQS depth; expired IAM role credentials on integration.\n• Mitigate: ALTER PIPE REFRESH; fix notification; backfill with COPY INTO for missed files.\n• Root cause: S3 event config removed during bucket policy change; or integration DISABLED.\n• Prevent: synthetic canary file every 15 min with alert if not in COPY_HISTORY within 30 min.\n\nCommunicate data gap window; replay downstream DT/tasks after backfill.",
        cmd: "SELECT SYSTEM$PIPE_STATUS('critical_pipe');\n\nCOPY INTO orders FROM @stage/missed_files/ FILE_FORMAT = parquet_fmt;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY\nWHERE pipe_name = 'CRITICAL_PIPE'\nORDER BY start_time DESC LIMIT 50;",
      },
      {
        q: "Optimize Snowpipe cost while maintaining 5-minute data freshness SLA.",
        a: "Pipe cost drivers are file count, file size, and transformation complexity in COPY.\n• Batch files upstream: 1000 tiny JSON → one Parquet saves 99% pipe invocations.\n• Load to narrow staging table; MERGE to prod via task—keep pipe COPY simple.\n• Compress with Snappy/Gzip Parquet; avoid CSV for large volumes.\n• FILE_FORMAT with STRIP_OUTER_ARRAY for JSON arrays reduces parse cost.\n• Review SNOWPIPE billing vs batch COPY if latency SLA allows 15-min batch window.\n\nROI: measure credits per million rows pipe vs COPY scheduled.",
        cmd: "CREATE PIPE optimized_pipe AUTO_INGEST = TRUE AS\nCOPY INTO staging.events FROM @stage\nFILE_FORMAT = (TYPE = PARQUET COMPRESSION = SNAPPY);\n\nSELECT SUM(credits_used), COUNT(*)\nFROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY\nWHERE start_time > DATEADD(day, -30, CURRENT_TIMESTAMP());",
      },
      {
        q: "Explain pipe error notifications and integration with incident management.",
        a: "Proactive pipe alerting reduces mean time to detect ingest failures.\n• Snowflake notification integration: email, webhook, SNS, Pub/Sub on pipe error.\n• CREATE NOTIFICATION INTEGRATION + associate with pipe error events.\n• Custom task polls COPY_HISTORY for status = LOAD_FAILED in last 15 minutes.\n• PagerDuty via webhook payload with pipe name, file, error message.\n• Runbook links from alert to SYSTEM$PIPE_STATUS and DESC PIPE checklist.\n\nIntegrate with data observability platform (Monte Carlo, Elementary) for freshness SLAs.",
        cmd: "CREATE NOTIFICATION INTEGRATION pipe_alerts\n  TYPE = WEBHOOK\n  ENABLED = TRUE\n  WEBHOOK_URL = 'https://hooks.pagerduty.com/integration/xxx/enqueue';\n\n-- Associate via Snowflake alerts on pipe errors (account-level feature)\nSELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'ORDERS', START_TIME => DATEADD(hour, -1, CURRENT_TIMESTAMP())\n))\nWHERE status = 'LOAD_FAILED';",
      }
    ],
  },

  'time-travel': {
    easy: [
      {
        q: "What is Time Travel in Snowflake and what is it used for?",
        a: "Time Travel query past states of tables without restoring backups.\n• Query historical data using AT(TIMESTAMP) or AT(OFFSET => seconds) or BEFORE(STATEMENT => id).\n• Undrop dropped tables, schemas, databases within retention window.\n• Investigate data issues: what did row look like yesterday before bad ETL?\n• Retention controlled by DATA_RETENTION_TIME_IN_DAYS (0–90 enterprise).\n• Time Travel storage billed separately in TABLE_STORAGE_METRICS.\n\nDefault retention often 1 day; increase for prod tables needing recovery window.",
        cmd: "SELECT * FROM orders AT(OFFSET => -3600);\n\nSELECT * FROM orders AT(TIMESTAMP => '2024-06-15 08:00:00'::TIMESTAMP_LTZ);\n\nUNDROP TABLE orders;",
      },
      {
        q: "How do you set data retention time on a table?",
        a: "DATA_RETENTION_TIME_IN_DAYS controls Time Travel window per table.\n• Default inherits from database or account parameter DATA_RETENTION_TIME_IN_DAYS.\n• ALTER TABLE ... SET DATA_RETENTION_TIME_IN_DAYS = N.\n• 0 disables Time Travel—use only for truly disposable staging data.\n• Maximum 90 days on Enterprise; 1 day Standard default.\n• Longer retention increases time_travel_bytes storage cost.\n\nAlign retention with recovery RPO: finance tables 30 days, staging 1 day.",
        cmd: "ALTER TABLE prod.orders SET DATA_RETENTION_TIME_IN_DAYS = 30;\n\nSHOW PARAMETERS LIKE 'DATA_RETENTION_TIME_IN_DAYS' IN TABLE prod.orders;\n\nSELECT table_name, retention_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLES\nWHERE table_name = 'ORDERS';",
      },
      {
        q: "How do you undrop a accidentally dropped table?",
        a: "UNDROP restores dropped table metadata and data within Time Travel retention.\n• UNDROP TABLE table_name; restores to schema context.\n• UNDROP DATABASE / SCHEMA for container recovery.\n• If object name reused after drop, UNDROP renames with suffix.\n• After retention expires, only Fail-safe may recover—contact support.\n• Verify grants intact after UNDROP; test SELECT immediately.\n\nPrevention: restrict DROP privilege; use soft-delete column pattern.",
        cmd: "DROP TABLE prod.sales.orders_backup;\n\nUNDROP TABLE prod.sales.orders_backup;\n\nSELECT COUNT(*) FROM prod.sales.orders_backup;",
      },
      {
        q: "What is the difference between AT and BEFORE clauses?",
        a: "Both query historical state but reference different points in time.\n• AT(TIMESTAMP => ...): state at exact wall-clock time.\n• AT(OFFSET => -N): N seconds before current time.\n• BEFORE(STATEMENT => 'query_id'): state immediately before that statement executed.\n• BEFORE useful for debugging: find data before specific failed MERGE query_id.\n• Query_id from QUERY_HISTORY links to BEFORE for forensic analysis.\n\nBEFORE requires query_id that modified table—SELECT-only query_ids invalid.",
        cmd: "SELECT * FROM orders BEFORE(STATEMENT => '01b2c3d4-0001-abcd-0000-000000000001');\n\nSELECT query_id, query_text, start_time\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%MERGE%orders%'\nORDER BY start_time DESC LIMIT 5;",
      }
    ],
    medium: [
      {
        q: "How do you investigate data corruption using Time Travel?",
        a: "Time Travel forensic workflow isolates when corruption introduced.\n• Identify approximate corruption time from monitoring or user report.\n• Query AT timestamps bracketing incident comparing row counts and checksums.\n• BEFORE(STATEMENT) on suspected MERGE query_id shows exact pre-change state.\n• CREATE TABLE clean CLONE orders AT(TIMESTAMP => before_incident) for recovery.\n• SWAP or INSERT overwrite from clean clone after validation.\n\nDocument query_ids and timestamps in incident ticket for audit trail.",
        cmd: "SELECT COUNT(*), SUM(amount) FROM orders AT(TIMESTAMP => '2024-06-14 23:59:00');\nSELECT COUNT(*), SUM(amount) FROM orders AT(TIMESTAMP => '2024-06-15 01:00:00');\n\nCREATE TABLE orders_recovery CLONE orders AT(TIMESTAMP => '2024-06-14 23:59:00');",
      },
      {
        q: "How does Time Travel retention affect streams and pipe consumption?",
        a: "Streams depend on Time Travel to retain unconsumed change metadata.\n• Stream becomes stale when changes fall outside base table retention.\n• Extending retention on source table prevents stream staleness during pipeline outages.\n• Dropping table invalidates streams immediately regardless of retention.\n• Plan retention >= max expected pipeline downtime + safety margin.\n• SHOW STREAMS stale_after column guides retention sizing.\n\nIf pipeline may be down 72h, retention must exceed 72h on source.",
        cmd: "ALTER TABLE source_orders SET DATA_RETENTION_TIME_IN_DAYS = 7;\n\nSHOW STREAMS ON TABLE source_orders;\n\nSELECT SYSTEM$STREAM_GET_TABLE_TIMESTAMP('orders_stream');",
      },
      {
        q: "Compare CLONE AT timestamp vs Time Travel SELECT for recovery scenarios.",
        a: "Both access historical data but serve different recovery mechanics.\n• SELECT AT: read-only query of historical rows; no new object created.\n• CREATE TABLE ... CLONE ... AT(TIMESTAMP): instant zero-copy snapshot as new table for manipulation.\n• CLONE for recovery: validate clone, then SWAP with corrupted prod table.\n• CLONE does not duplicate storage until modifications—fast and cheap.\n• SELECT AT for analysis only; CLONE AT for actionable recovery artifact.\n\nRecovery pattern: CLONE AT → validate → SWAP → drop bad table.",
        cmd: "CREATE TABLE orders_fixed CLONE orders AT(TIMESTAMP => '2024-06-14 12:00:00');\n\nSELECT COUNT(*) FROM orders_fixed;\n\nALTER TABLE orders SWAP WITH orders_fixed;",
      },
      {
        q: "How do you manage Time Travel storage costs on high-churn tables?",
        a: "High DML tables accumulate large time_travel_bytes quickly.\n• Reduce DATA_RETENTION_TIME_IN_DAYS on staging and scratch tables.\n• TRANSIENT tables: reduced retention, no Fail-safe—significant savings.\n• Batch DML instead of row-by-row updates to reduce version churn.\n• Monitor TABLE_STORAGE_METRICS time_travel_bytes weekly.\n• Archive historical versions to separate history table via SCD2 instead of relying on long Time Travel.\n\nProd fact tables: balance 7-day retention vs compliance requirement.",
        cmd: "SELECT table_name,\n       time_travel_bytes/POWER(1024,3) AS tt_gb,\n       active_bytes/POWER(1024,3) AS active_gb\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nORDER BY time_travel_bytes DESC LIMIT 15;\n\nALTER TABLE staging.temp SET DATA_RETENTION_TIME_IN_DAYS = 1;",
      }
    ],
    hard: [
      {
        q: "Design retention policy across account for compliance (GDPR) and operational recovery.",
        a: "Retention policy balances legal hold, right-to-erasure, and ops recovery.\n• Classification tags drive retention: PII tables 30-day TT, logs 7-day, staging 1-day.\n• GDPR erasure: DELETE + shorten retention; document that Time Travel copies purge after retention.\n• Legal hold: suspend DROP and extend retention on specific tables via ticket workflow.\n• Automated policy enforcement: task alerts tables with retention exceeding classification limit.\n• Fail-safe always 7 days—cannot disable; factor in compliance timelines.\n\nLegal review sign-off before account-wide retention parameter changes.",
        cmd: "ALTER TABLE pii.customers SET DATA_RETENTION_TIME_IN_DAYS = 30;\n\nCREATE TAG retention_class ALLOWED_VALUES '7D','30D','90D';\nALTER TABLE pii.customers SET TAG retention_class = '30D';\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.TAG_REFERENCES WHERE tag_name = 'RETENTION_CLASS';",
      },
      {
        q: "Recover production database after accidental DROP DATABASE by junior admin.",
        a: "DROP DATABASE is catastrophic but recoverable within retention if acted quickly.\n• Immediate: UNDROP DATABASE prod; verify schemas and tables accessible.\n• If name conflict: UNDROP renames with _DROPPED suffix—rename after.\n• Assess downstream: tasks, streams, pipes may need recreation if invalidated.\n• If retention expired: open Snowflake support Fail-safe recovery ticket immediately.\n• Contain: revoke DROP DATABASE from role; enable object deletion protection if available.\n\nPostmortem: break-glass procedure, Terraform state prevents manual DROP, approval workflow.",
        cmd: "UNDROP DATABASE prod;\n\nSHOW TABLES IN DATABASE prod;\n\nREVOKE DROP DATABASE ON ACCOUNT FROM ROLE junior_developer;",
      },
      {
        q: "Lead forensic analysis using QUERY_HISTORY and Time Travel for audit investigation.",
        a: "Audit investigation reconstructs who changed what and when with evidence chain.\n• QUERY_HISTORY filters DML on sensitive table by user and time range.\n• BEFORE(STATEMENT => query_id) captures pre-change snapshot for each suspect query.\n• ACCESS_HISTORY corroborates object access by role.\n• Export evidence: row samples, query text, user, role, IP from LOGIN_HISTORY join.\n• Preserve query_ids immediately—retention on QUERY_HISTORY is limited (45 days account usage).\n\nDeliver audit package to compliance with immutable timestamped exports.",
        cmd: "SELECT user_name, role_name, query_text, start_time, query_id\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%customers%' AND query_type = 'UPDATE'\n  AND start_time BETWEEN '2024-06-01' AND '2024-06-15';\n\nSELECT * FROM customers BEFORE(STATEMENT => 'suspect-query-id');",
      },
      {
        q: "Explain interaction between Time Travel, cloning, and replication for point-in-time consistency.",
        a: "Point-in-time consistency across objects requires coordinated timestamp semantics.\n• CLONE AT(TIMESTAMP) gives consistent snapshot of single table at instant.\n• Multiple table recovery: use same AT timestamp; verify no cross-table transactions broke consistency.\n• Replicated database refresh lag means secondary not at same logical time as primary.\n• Failover to replica: point-in-time on secondary reflects last refresh not primary wall clock.\n• Document RPO: max data loss = replication lag + retention gap.\n\nFinancial close: CLONE all gold tables AT same TIMESTAMP for frozen reporting copy.",
        cmd: "CREATE TABLE orders_close CLONE orders AT(TIMESTAMP => '2024-06-30 23:59:59');\nCREATE TABLE payments_close CLONE payments AT(TIMESTAMP => '2024-06-30 23:59:59');\n\nALTER DATABASE prod_replica REFRESH;",
      }
    ],
  },

  'fail-safe': {
    easy: [
      {
        q: "What is Fail-safe in Snowflake and how does it differ from Time Travel?",
        a: "Fail-safe is Snowflake's disaster recovery storage after Time Travel expires.\n• Time Travel: user-accessible historical queries and UNDROP within retention (0–90 days).\n• Fail-safe: additional 7-day buffer only recoverable by Snowflake support—not directly queryable.\n• Fail-safe cannot be disabled on permanent tables; no customer control of duration.\n• Billed as failsafe_bytes in storage metrics—separate line item.\n• TRANSIENT tables skip Fail-safe entirely.\n\nUse Time Travel for self-service recovery; Fail-safe for catastrophic loss after retention lapse.",
        cmd: "SELECT table_name, time_travel_bytes, failsafe_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE failsafe_bytes > 0\nORDER BY failsafe_bytes DESC LIMIT 10;",
      },
      {
        q: "Can users query or UNDROP data in Fail-safe period?",
        a: "Fail-safe data is not directly accessible to customers.\n• No SQL syntax to query Fail-safe period data.\n• UNDROP fails if beyond Time Travel even if within Fail-safe.\n• Recovery requires Snowflake support ticket with table name, drop timestamp, account.\n• Support evaluates recoverability— not guaranteed in all scenarios.\n• Prevention critical: do not rely on Fail-safe as primary backup strategy.\n\nOperational backup: periodic CLONE to DR account or external export.",
        cmd: "UNDROP TABLE critical_data;  -- fails if beyond Time Travel\n\n-- Contact Snowflake Support with:\nSELECT table_name, dropped_on\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLES\nWHERE table_name = 'CRITICAL_DATA' AND deleted IS NOT NULL;",
      },
      {
        q: "How is Fail-safe storage billed?",
        a: "Fail-safe contributes to total storage bill as failsafe_bytes.\n• Charged per TB/month similar to Time Travel storage rates.\n• Visible in TABLE_STORAGE_METRICS per table.\n• High-churn large tables accumulate significant failsafe_bytes briefly after Time Travel purge.\n• TRANSIENT tables avoid failsafe_bytes—cost saving for disposable data.\n• Cannot reduce failsafe duration—only reduce churn and retention to minimize volume.\n\nFinOps report: top tables by failsafe_bytes week over week.",
        cmd: "SELECT SUM(failsafe_bytes)/POWER(1024,4) AS failsafe_tb\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS;\n\nSELECT table_name, failsafe_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nORDER BY failsafe_bytes DESC LIMIT 10;",
      },
      {
        q: "Why do TRANSIENT tables not have Fail-safe protection?",
        a: "TRANSIENT designation opts out of extended disaster recovery for cost savings.\n• TRANSIENT database or table: no Fail-safe, reduced Time Travel retention.\n• Suitable for rebuildable staging data with external source of truth.\n• Permanent tables always have 7-day Fail-safe after Time Travel—cannot opt out.\n• Compliance workloads requiring guaranteed recovery should never use TRANSIENT.\n• Explicit architectural choice: speed/cost vs recoverability.\n\nDocument in data catalog which layers are TRANSIENT and rebuild procedure.",
        cmd: "CREATE TRANSIENT TABLE staging.tmp_load (id INT, data VARCHAR);\n\nSELECT table_name, table_type, retention_time\nFROM SNOWFLAKE.INFORMATION_SCHEMA.TABLES\nWHERE table_name = 'TMP_LOAD';",
      }
    ],
    medium: [
      {
        q: "When should you open a Snowflake support case for Fail-safe recovery?",
        a: "Support recovery is last resort when self-service Time Travel options exhausted.\n• Table dropped or corrupted beyond DATA_RETENTION_TIME_IN_DAYS.\n• Within 7 days after Time Travel data purged (Fail-safe window).\n• Gather: account locator, table FQN, drop timestamp (from TABLES view deleted column), incident description.\n• Recovery not guaranteed—depends on internal state; may take hours to days.\n• Parallel: rebuild from external backup if RTO cannot wait support SLA.\n\nRunbook escalation tree: UNDROP → CLONE AT → support ticket → rebuild from lake.",
        cmd: "SELECT table_catalog, table_schema, table_name, deleted\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLES\nWHERE table_name = 'ORDERS' AND deleted IS NOT NULL;\n\n-- Open support case with above metadata",
      },
      {
        q: "How do you design backup strategy beyond Fail-safe for critical tables?",
        a: "Fail-safe alone insufficient for enterprise RPO/RTO requirements.\n• Periodic CLONE to DR account in secondary region—metadata instant, storage shared until change.\n• EXPORT to external stage (Parquet) scheduled via task for air-gapped backup.\n• Database replication to secondary account with scheduled REFRESH.\n• Third-party backup tools (Accurics, etc.) if policy requires.\n• Test restore quarterly: CLONE from DR or IMPORT from external stage.\n\n3-2-1 rule adapted: 3 copies, 2 regions, 1 external format export.",
        cmd: "CREATE DATABASE dr_backup CLONE prod;\n\nCOPY INTO @backup_stage/orders/ FROM orders\nFILE_FORMAT = (TYPE = PARQUET COMPRESSION = SNAPPY)\nHEADER = TRUE;\n\nALTER DATABASE prod_replica REFRESH;",
      },
      {
        q: "Explain storage lifecycle from active data through Time Travel to Fail-safe purge.",
        a: "Data passes through distinct storage lifecycle phases automatically.\n• Active: current committed rows visible to queries.\n• Time Travel: historical versions retained per DATA_RETENTION_TIME_IN_DAYS after change/delete.\n• Fail-safe: 7 days after Time Travel expiry—internal disaster recovery only.\n• Permanent purge: after Fail-safe, data irrecoverable.\n• DROP TABLE: data enters Time Travel immediately; active_bytes zeroes.\n\nTimeline diagram in runbooks helps stakeholders understand recovery windows.",
        cmd: "SELECT table_name, active_bytes, time_travel_bytes, failsafe_bytes,\n       retention_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'ORDERS';",
      },
      {
        q: "How does dropping a large table impact Fail-safe storage temporarily?",
        a: "Large dropped tables spike time_travel then failsafe_bytes before eventual purge.\n• DROP moves all active_bytes to time_travel_bytes immediately.\n• After retention: transitions toward failsafe_bytes for 7 days.\n• Account storage metric may jump noticeably—FinOps alert warranted.\n• UNDROP within retention avoids failsafe transition entirely.\n• Plan large table drops during budget review period with stakeholder notice.\n\nAlternative: TRUNCATE if goal is empty table not remove object metadata.",
        cmd: "DROP TABLE legacy_huge_fact;\n\nSELECT SUM(storage_bytes) FROM SNOWFLAKE.ACCOUNT_USAGE.STORAGE_USAGE\nWHERE usage_date >= CURRENT_DATE() - 7;\n\nUNDROP TABLE legacy_huge_fact;  -- if within retention",
      }
    ],
    hard: [
      {
        q: "Design enterprise data recovery framework with defined RPO/RTO per data tier.",
        a: "Tiered recovery framework maps business criticality to technical controls.\n• Tier 1 (critical): 30-day Time Travel, cross-region replica, hourly external export, RTO 4h.\n• Tier 2 (important): 7-day retention, nightly CLONE to DR, RTO 24h.\n• Tier 3 (staging): TRANSIENT, 1-day retention, rebuild from source, RTO 72h.\n• Runbooks per tier with automated monitoring of retention compliance.\n• Annual DR drill: simulate drop, execute recovery, measure actual RTO.\n• Executive dashboard: % tables compliant with tier policy.\n\nAlign with BCP documentation and regulatory examination expectations.",
        cmd: "CREATE TAG recovery_tier ALLOWED_VALUES 'T1', 'T2', 'T3';\nALTER TABLE finance.ledger SET TAG recovery_tier = 'T1';\nALTER TABLE finance.ledger SET DATA_RETENTION_TIME_IN_DAYS = 30;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.TAG_REFERENCES WHERE tag_name = 'RECOVERY_TIER';",
      },
      {
        q: "Lead crisis management when Time Travel expired and Fail-safe is only hope.",
        a: "Crisis protocol when self-service recovery window missed.\n• Hour 0: confirm drop timestamp; calculate Fail-safe deadline (retention expiry + 7 days).\n• Hour 1: open Sev-1 support ticket with complete metadata; parallel rebuild team activated.\n• Communicate to leadership: recovery uncertain; rebuild ETA as backup plan.\n• Preserve QUERY_HISTORY and audit logs before 45-day expiry for investigation.\n• Post-crisis: root cause (who dropped, why no retention), policy changes mandatory.\n\nNever promise support recovery certainty to business stakeholders.",
        cmd: "SELECT table_name, deleted, retention_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLES\nWHERE table_schema = 'FINANCE' AND deleted IS NOT NULL;\n\n-- Support ticket + parallel:\nCREATE TABLE ledger_rebuild AS SELECT * FROM @external_backup/ledger/;",
      },
      {
        q: "Compare Fail-safe recovery vs logical backup restore for compliance auditability.",
        a: "Auditors evaluate recovery provability and process documentation.\n• Fail-safe: Snowflake-internal, opaque process, limited customer audit trail, uncertain timeline.\n• Logical backup (EXPORT Parquet to WORM storage): customer-controlled, provable restore tests, checksums.\n• Regulators often prefer demonstrable restore over vendor-opaque recovery.\n• Document every restore test with row-count reconciliation signed by data owner.\n• Fail-safe remains safety net—not primary compliance control.\n\nAudit evidence package: export logs, restore test results, retention policy tags.",
        cmd: "COPY INTO @worm_backup/ledger/ FROM ledger\nFILE_FORMAT = (TYPE = PARQUET) OVERWRITE = TRUE;\n\nCREATE TABLE ledger_restore AS SELECT * FROM @worm_backup/ledger/;\n\nSELECT COUNT(*) FROM ledger UNION ALL SELECT COUNT(*) FROM ledger_restore;",
      },
      {
        q: "Model total storage cost including Fail-safe for high-churn fact table over 12 months.",
        a: "Cost model projects active + time_travel + failsafe bytes from DML patterns.\n• Inputs: daily insert TB, update %, delete %, retention days.\n• Each UPDATE/DELETE creates new version in Time Travel until retention purge.\n• Model monthly failsafe spike when large purge events occur.\n• Sensitivity analysis: retention 7 vs 30 days on churn rate 20% daily updates.\n• Present CFO chart: cost vs retention trade-off curve.\n\nRecommendation: reduce churn via batch MERGE; shorten staging retention.",
        cmd: "SELECT DATE_TRUNC('month', usage_date) AS month,\n       AVG(storage_bytes)/POWER(1024,4) AS avg_tb\nFROM SNOWFLAKE.ACCOUNT_USAGE.STORAGE_USAGE\nGROUP BY 1 ORDER BY 1;\n\nSELECT table_name, active_bytes, time_travel_bytes, failsafe_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_name = 'FACT_EVENTS';",
      }
    ],
  },

  'zero-copy-clone': {
    easy: [
      {
        q: "What is zero-copy clone in Snowflake?",
        a: "Zero-copy clone creates instant copy of database, schema, or table without duplicating storage.\n• Clone shares underlying micro-partitions with source until diverging changes occur.\n• CREATE ... CLONE completes in seconds regardless of table size (terabytes).\n• Changes to clone or source create new partitions only for modified data (copy-on-write).\n• Used for dev/test environments, backups, experimentation, blue-green deploys.\n• CLONE can include AT(TIMESTAMP) for point-in-time clone.\n\nRevolutionary for data platform agility—no more multi-hour database copies.",
        cmd: "CREATE DATABASE dev_db CLONE prod_db;\n\nCREATE TABLE orders_dev CLONE prod.sales.orders;\n\nSELECT COUNT(*) FROM dev_db.sales.orders;",
      },
      {
        q: "How does storage billing work for cloned objects?",
        a: "Clones minimize storage cost through shared micro-partitions.\n• Initial clone: zero additional active_bytes—all partitions shared with source.\n• Storage grows only when clone or source modifies data—new partitions allocated to changer.\n• Dev environment that only reads prod clone costs nearly zero extra storage.\n• Heavy writes in dev clone accumulate independent active_bytes.\n• Monitor TABLE_STORAGE_METRICS on clones to detect unexpected divergence cost.\n\nFinOps win: refresh dev weekly via CLONE replaces stale full copy approach.",
        cmd: "CREATE SCHEMA dev_test CLONE prod.sales;\n\nSELECT table_name, active_bytes\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nWHERE table_schema = 'DEV_TEST';",
      },
      {
        q: "Can you clone at a specific point in time?",
        a: "Time Travel integration allows historical clones.\n• CREATE TABLE new CLONE source AT(TIMESTAMP => ...).\n• AT(OFFSET => -seconds) also supported.\n• Useful for reproducing bug with yesterday's data in isolated clone schema.\n• Retention must cover requested timestamp or clone fails.\n• Cloned historical state diverges independently after creation.\n\nPattern: weekly automated task creates AT clone for regression test dataset.",
        cmd: "CREATE TABLE orders_june15 CLONE orders\n  AT(TIMESTAMP => '2024-06-15 00:00:00'::TIMESTAMP_LTZ);\n\nSELECT COUNT(*) FROM orders_june15;",
      },
      {
        q: "What objects can be cloned in Snowflake?",
        a: "Clone operation supported at database, schema, and table levels.\n• DATABASE CLONE includes schemas, tables, views, most objects within.\n• SCHEMA CLONE copies tables and views in schema.\n• TABLE CLONE copies single table data and structure.\n• Some objects not cloned: streams (recreate manually), tasks may need verification.\n• CLONE across databases requires appropriate privileges on source.\n\nAfter database clone: verify streams, pipes, tasks recreated or scripted.",
        cmd: "CREATE DATABASE qa CLONE prod;\n\nSHOW TABLES IN DATABASE qa;\n\nSHOW STREAMS IN DATABASE qa;",
      }
    ],
    medium: [
      {
        q: "How do you use clone for blue-green table deployment?",
        a: "Blue-green via SWAP enables zero-downtime table replacement.\n• Build new version: CREATE TABLE orders_green CLONE orders; modify green table with fixed ETL.\n• Validate green: row counts, checksums, sample queries.\n• Cutover: ALTER TABLE orders SWAP WITH orders_green; instant metadata pointer swap.\n• Rename if needed: ALTER TABLE orders_green RENAME TO orders after swap.\n• Rollback: SWAP back if green issues discovered quickly.\n\nUsers query orders throughout—SWAP is metadata operation invisible to SELECT.",
        cmd: "CREATE TABLE orders_green CLONE orders;\n\nINSERT INTO orders_green SELECT * FROM staging_orders_fixed;\n\nALTER TABLE orders SWAP WITH orders_green;",
      },
      {
        q: "What privileges are required to clone production data to dev?",
        a: "Clone requires read access to source and create on target.\n• CREATE DATABASE on account + USAGE on source database minimum.\n• Role-based pattern: PROD_READER role with SELECT on prod; DEV_ADMIN creates dev CLONE.\n• Consider data masking: clone copies raw PII—mask in dev via post-clone views or masking policies.\n• Some orgs block prod clone entirely; use sanitized subset CTAS instead.\n• Audit CLONE operations in QUERY_HISTORY and ACCESS_HISTORY.\n\nGovernance: automated weekly dev refresh with approved role only.",
        cmd: "GRANT USAGE ON DATABASE prod TO ROLE dev_clone_svc;\nGRANT CREATE DATABASE ON ACCOUNT TO ROLE dev_clone_svc;\n\nCREATE OR REPLACE DATABASE dev CLONE prod;\n\nSELECT query_text, user_name FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%CLONE%prod%' ORDER BY start_time DESC LIMIT 5;",
      },
      {
        q: "How do clones interact with Time Travel and dropped source tables?",
        a: "Clone independence from source has limits when source is dropped or modified.\n• DROP source table: clone retains shared partitions until clone modified or dropped.\n• UNDROP source does not affect existing clone.\n• Source Time Travel changes do not retroactively affect existing clone.\n• CLONE from dropped table within retention via UNDROP first then clone.\n• Long-lived dev clone from prod: refresh clone weekly to avoid stale data.\n\nDocument dev clone refresh SLA aligned with prod release cadence.",
        cmd: "DROP TABLE prod.sandbox_test;\n\n-- Clone still queryable:\nSELECT COUNT(*) FROM dev.sandbox_test;\n\nCREATE OR REPLACE DATABASE dev CLONE prod;",
      },
      {
        q: "Troubleshoot CLONE failures due to permissions or missing objects.",
        a: "Clone failures usually indicate privilege gaps or unsupported object types.\n• Error \"does not exist or not authorized\": missing USAGE on source database/schema.\n• Encrypted objects or policy restrictions may block clone in some configurations.\n• Verify source exists and not dropped beyond retention.\n• CLONE across accounts not supported directly—use replication or SHARE instead.\n• Check QUERY_HISTORY error_message for specific failure detail.\n\nTest: CLONE single small table before full database clone.",
        cmd: "SHOW GRANTS TO ROLE dev_admin;\n\nCREATE TABLE test_clone CLONE prod.sales.small_table;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%CLONE%' AND error_message IS NOT NULL\nORDER BY start_time DESC LIMIT 5;",
      }
    ],
    hard: [
      {
        q: "Design automated dev/staging refresh pipeline using zero-copy clone.",
        a: "Automated refresh keeps lower environments current with minimal ops burden.\n• Weekly task: CREATE OR REPLACE DATABASE dev CLONE prod WITH GRANT OPTION OFF.\n• Post-clone: apply masking policies, revoke prod-sensitive grants, resize warehouses down.\n• Sanitization procedure on PII columns via UPDATE on clone (creates new partitions—acceptable in dev).\n• Notify developers in Slack on refresh completion with schema change summary.\n• Rollback: keep previous dev as dev_backup one day before REPLACE.\n\nIaC: Terraform snowflake_database resource with clone source parameter.",
        cmd: "CREATE OR REPLACE TASK refresh_dev\n  WAREHOUSE = admin_wh\n  SCHEDULE = 'USING CRON 0 2 * * 0 UTC'\n  AS CREATE OR REPLACE DATABASE dev CLONE prod;\n\nALTER TASK refresh_dev RESUME;\n\nCREATE OR REPLACE DATABASE dev_backup CLONE dev;",
      },
      {
        q: "Lead security review of prod-to-dev cloning with PII and SOC2 implications.",
        a: "Prod clone to dev is common SOC2 audit finding if inadequately controlled.\n• Risk: developers access full prod PII in unsecured dev account.\n• Controls: masking policies auto-applied post-clone; dev account separate SSO group.\n• Alternative: clone only non-PII schemas; synthetic data generation for PII tables.\n• Log all clone operations; quarterly access review on dev post-refresh.\n• Data processing agreement: dev clone still subject to GDPR if EU PII.\n\nAuditor evidence: masking policy DDL, access review sign-offs, clone task audit log.",
        cmd: "ALTER TABLE dev.customers MODIFY COLUMN ssn SET MASKING POLICY ssn_mask;\n\nREVOKE ROLE prod_admin FROM USER developer;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%CREATE%DATABASE%dev%CLONE%';",
      },
      {
        q: "Optimize clone-heavy workflow costing 20TB additional storage from dev divergence.",
        a: "Storage creep occurs when many clones modify data independently.\n• Root cause: developers run UPDATE on full dev clone instead of subsets.\n• Policy: dev is read-mostly; writes only in personal schemas.\n• Weekly REPLACE DATABASE dev CLONE prod resets divergence—zero storage from old dev.\n• Personal sandboxes: CLONE single tables not full database.\n• Monitor active_bytes growth rate on dev vs prod ratio.\n\nTarget: dev storage <5% of prod via weekly refresh and write restrictions.",
        cmd: "SELECT database_name, SUM(active_bytes)/POWER(1024,4) AS tb\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLE_STORAGE_METRICS\nGROUP BY 1 ORDER BY 2 DESC;\n\nCREATE OR REPLACE DATABASE dev CLONE prod;",
      },
      {
        q: "Compare zero-copy clone vs database replication for DR use cases.",
        a: "Clone and replication serve different DR and environment provisioning needs.\n• Clone: point-in-time snapshot, same account, instant, no ongoing sync—manual refresh.\n• Replication: continuous cross-account/region sync, scheduled REFRESH, failover support.\n• DR: replication not clone—RPO requires automated refresh not weekly manual CLONE.\n• Dev refresh: clone ideal—cheap, fast, same-region.\n• Combine: replicate prod to DR account; CLONE from replica for DR testing without touching prod.\n\nDecision tree on slide: RPO < 1h → replication; dev env → clone.",
        cmd: "ALTER DATABASE prod ENABLE REPLICATION TO ACCOUNTS dr_account;\n\nCREATE DATABASE prod_dr CLONE prod;  -- same-account snapshot only\n\nALTER DATABASE prod_replica REFRESH;",
      }
    ],
  },

  'data-sharing': {
    easy: [
      {
        q: "What is Secure Data Sharing in Snowflake?",
        a: "Secure Data Sharing enables live read-only access to data across Snowflake accounts without copying.\n• Provider shares tables/views via SHARE object; consumer mounts as imported database.\n• No ETL duplication—consumer queries provider data in real time.\n• Provider controls exactly which objects and columns are shared.\n• Billing: consumer pays compute; provider pays storage.\n• Works cross-region and cross-cloud in supported configurations.\n\nRevolutionizes B2B data exchange vs SFTP file drops.",
        cmd: "CREATE SHARE sales_share;\nGRANT USAGE ON DATABASE prod TO SHARE sales_share;\nGRANT SELECT ON TABLE prod.analytics.revenue TO SHARE sales_share;\n\nALTER SHARE sales_share ADD ACCOUNTS = consumer_account;",
      },
      {
        q: "How does a consumer access a shared database?",
        a: "Consumer mounts share from provider as imported database in their account.\n• Provider runs ALTER SHARE ... ADD ACCOUNTS = consumer_org_account.\n• Consumer: CREATE DATABASE imported_db FROM SHARE provider_account.share_name.\n• Query like local tables: SELECT * FROM imported_db.analytics.revenue.\n• Consumer needs warehouse; provider data not copied.\n• SHOW GRANTS IMPORTED ON DATABASE shows share lineage.\n\nConsumer cannot see provider objects not explicitly granted to share.",
        cmd: "CREATE DATABASE partner_data FROM SHARE provider_acct.sales_share;\n\nSELECT * FROM partner_data.analytics.revenue LIMIT 10;\n\nSHOW IMPORTED DATABASES;",
      },
      {
        q: "What is the difference between a share and a shared database?",
        a: "Terminology distinguishes provider object vs consumer view.\n• SHARE: provider-side securable listing shared objects.\n• Shared database: consumer-side imported database from share.\n• One share can grant to multiple consumer accounts.\n• Consumer database name chosen by consumer independently of provider name.\n• Reader accounts: Snowflake-managed lightweight consumer without full account.\n\nProvider manages SHARE; consumers manage their imported database names.",
        cmd: "SHOW SHARES;\n\nDESC SHARE sales_share;\n\nCREATE DATABASE acme_revenue FROM SHARE acme_org.revenue_share;",
      },
      {
        q: "Can consumers modify shared data?",
        a: "Shared data is read-only for consumers by default.\n• Consumers can SELECT shared tables and create local views on shares.\n• INSERT/UPDATE/DELETE on provider data not permitted through share.\n• Consumers can combine shared data with local tables in queries.\n• Write-back requires separate API or reverse share pattern.\n• Secure views on provider side hide underlying columns from consumer.\n\nMulti-party collaboration uses listing/marketplace or dedicated write APIs.",
        cmd: "SELECT s.region, l.local_factor\nFROM partner_share.analytics.revenue s\nJOIN local.ref_factors l ON s.region = l.region;\n\nSHOW GRANTS TO SHARE sales_share;",
      }
    ],
    medium: [
      {
        q: "How do you share secure views instead of base tables?",
        a: "Secure views hide logic and columns while enabling controlled sharing.\n• CREATE SECURE VIEW with filtered/aggregated data; GRANT SELECT ON VIEW TO SHARE.\n• Secure keyword prevents consumers from viewing underlying base table definitions.\n• Row-level filters in view definition limit data exposure.\n• Do not share base table if view suffices—principle of least sharing.\n• Test consumer perspective in reader account before granting production consumer.\n\nSecure view required when sharing view (non-secure views cannot be shared).",
        cmd: "CREATE SECURE VIEW analytics.revenue_masked AS\nSELECT region, product, amount  -- exclude customer_id\nFROM analytics.revenue WHERE amount > 0;\n\nGRANT SELECT ON VIEW analytics.revenue_masked TO SHARE sales_share;",
      },
      {
        q: "Troubleshoot \"Object does not exist or not authorized\" on shared database.",
        a: "Share access errors involve provider grants and consumer mount steps.\n• Consumer: verify CREATE DATABASE FROM SHARE completed; SHOW DATABASES.\n• Provider: confirm ALTER SHARE ADD ACCOUNTS includes correct consumer account org+account.\n• Provider: USAGE on database, SELECT on tables granted TO SHARE.\n• Replication lag if share on replicated database not refreshed.\n• Consumer role needs USAGE on imported database and SELECT on shared schemas.\n\nProvider runs DESC SHARE to list grants; consumer runs SHOW GRANTS ON DATABASE.",
        cmd: "DESC SHARE provider_acct.sales_share;\n\nSHOW GRANTS ON DATABASE partner_data;\n\nGRANT IMPORTED PRIVILEGES ON DATABASE partner_data TO ROLE analyst;",
      },
      {
        q: "How does data sharing work with Snowflake Marketplace listings?",
        a: "Marketplace extends sharing to many consumers with monetization and discovery.\n• Provider creates listing from share; consumers request access via Marketplace UI.\n• Free or paid listings with Stripe integration for billing.\n• Data never leaves provider account; consumers query in place.\n• Automated legal terms acceptance tracked per consumer.\n• Private listings for specific consumer accounts without public discovery.\n\nEnterprise data products team manages listing lifecycle and SLA.",
        cmd: "CREATE SHARE marketplace_kpi_share;\nGRANT SELECT ON TABLE prod.kpis.daily TO SHARE marketplace_kpi_share;\n\n-- Provider UI: Create Listing from share\n-- Consumer UI: Get Data -> create imported database",
      },
      {
        q: "Explain cross-region and cross-cloud data sharing considerations.",
        a: "Sharing works across regions/clouds with latency and egress implications.\n• Provider and consumer accounts can be in different regions; queries cross network.\n• Latency higher for cross-region SELECT; consumers should aggregate locally if heavy.\n• Egress costs may apply on provider cloud side for cross-cloud sharing.\n• Replication can place share data closer to consumer region before sharing.\n• Verify account edition and region support matrix in Snowflake docs.\n\nArchitecture: replicate to EU, share from EU account to EU consumers for GDPR.",
        cmd: "ALTER DATABASE eu_prod ENABLE REPLICATION TO ACCOUNTS eu_consumer_acct;\n\nCREATE SHARE eu_share;\nGRANT SELECT ON TABLE eu_prod.analytics.kpis TO SHARE eu_share;\n\nALTER SHARE eu_share ADD ACCOUNTS = eu_consumer_acct;",
      }
    ],
    hard: [
      {
        q: "Design multi-tenant data provider platform sharing datasets to 200 customers.",
        a: "Provider platform scales sharing with automation and isolation.\n• Per-customer SHARE or secure view with tenant filter; automated provisioning via Terraform.\n• Naming: share_customer_{id} with SELECT on tenant-specific secure view.\n• Reader accounts for customers without Snowflake—lower friction onboarding.\n• Monitoring: ACCESS_HISTORY per share; alert on anomalous scan volume.\n• Offboarding: ALTER SHARE ... REMOVE ACCOUNTS; audit trail retention.\n• SLA: 99.9% share availability; incident comms to all consumers on outage.\n\nAutomate consumer onboarding API: validate contract → ADD ACCOUNTS → notify.",
        cmd: "CREATE SECURE VIEW analytics.tenant_100_data AS\nSELECT * FROM analytics.all_data WHERE tenant_id = 100;\n\nCREATE SHARE share_tenant_100;\nGRANT SELECT ON VIEW analytics.tenant_100_data TO SHARE share_tenant_100;\n\nALTER SHARE share_tenant_100 ADD ACCOUNTS = tenant100_acct;",
      },
      {
        q: "Lead incident when provider accidentally shared PII table instead of masked view.",
        a: "Data sharing misconfiguration is a potential data breach requiring immediate response.\n• Detect: consumer reports unexpected columns; or internal audit of DESC SHARE.\n• Contain: REVOKE SELECT ON TABLE pii_table FROM SHARE immediately.\n• Assess: ACCESS_HISTORY on provider for consumer query patterns downloading PII.\n• Notify: legal, affected consumers, potentially regulatory bodies per jurisdiction.\n• Fix: share only secure view; recreate consumer imported database.\n• Prevent: CI validation on share DDL; no direct table grants to shares in prod.\n\nPostmortem: mandatory security review on all new share grants.",
        cmd: "REVOKE SELECT ON TABLE prod.raw.customers FROM SHARE external_share;\n\nGRANT SELECT ON VIEW prod.secure.customers_masked TO SHARE external_share;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE object_name = 'CUSTOMERS' AND query_start_time > DATEADD(day, -7, CURRENT_TIMESTAMP());",
      },
      {
        q: "Compare data sharing vs COPY OUT for partner data delivery compliance.",
        a: "Compliance teams evaluate data residency and audit requirements.\n• Sharing: data stays in provider account; consumer compute only; audit via ACCESS_HISTORY both sides.\n• COPY OUT: data physically copied to consumer cloud—residency transfer; DPA implications.\n• Some contracts prohibit data leaving provider account—sharing only option.\n• Others require consumer-owned copy for independence—scheduled EXPORT to consumer stage.\n• Hybrid: share for live queries; periodic EXPORT for consumer archival.\n\nLegal sign-off documents data flow diagram per delivery method.",
        cmd: "COPY INTO @consumer_stage/partner_feed/ FROM secure_view\nFILE_FORMAT = (TYPE = PARQUET);\n\n-- vs live share:\nSELECT COUNT(*) FROM imported_partner.secure.daily_feed;",
      },
      {
        q: "Architect bi-directional analytics collaboration between parent and subsidiary accounts.",
        a: "Bi-directional needs require two shares or centralized account model.\n• Snowflake sharing is one-directional per share.\n• Parent shares consolidated data down; subsidiary shares regional data up via separate share.\n• Alternatively: all data in parent account; subsidiaries get reader accounts or roles.\n• ETL in each account publishes to local share; consumers mount multiple imported databases.\n• Governance: data mesh with domain-owned shares and federated governance council.\n\nAvoid share loops; diagram data flows unambiguously for auditors.",
        cmd: "CREATE SHARE subsidiary_apac_share;\nGRANT SELECT ON TABLE apac.regional.sales TO SHARE subsidiary_apac_share;\nALTER SHARE subsidiary_apac_share ADD ACCOUNTS = parent_hq_acct;\n\nCREATE DATABASE apac_data FROM SHARE subsidiary_apac.subsidiary_apac_share;",
      }
    ],
  }
};

export const SCENARIO_CONTENT = [
  {
    title: "Warehouse Performance Issues",
    difficulty: "easy",
    q: "Users report dashboards timing out during business hours. What is your troubleshooting approach?",
    a: "Warehouse performance issues during peak hours require systematic isolation of compute bottlenecks.\n• Confirm scope: which dashboards, warehouses, and time window; check if ETL and BI share same warehouse.\n• Immediate: identify running queries in QUERY_HISTORY with high total_elapsed_time and bytes_scanned.\n• Check WAREHOUSE_LOAD_HISTORY for avg_queued_load > 0 indicating concurrency saturation.\n• Short-term mitigation: enable multi-cluster scaling (increase MAX_CLUSTER_COUNT) or temporarily resize up one size.\n• Separate BI warehouse from ETL if shared; reschedule heavy batch jobs off-peak.\n• Communicate ETA to users; monitor queue clearing.\n\nRoot cause candidates: undersized warehouse, long-running queries blocking slots, missing clustering causing full scans.",
    cmd: "SELECT warehouse_name, avg_running, avg_queued_load, avg_blocked\nFROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(\n  DATE_RANGE_START => DATEADD(hour, -4, CURRENT_TIMESTAMP())\n));\n\nSELECT query_id, user_name, total_elapsed_time, bytes_scanned, query_text\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE execution_status = 'RUNNING' OR start_time > DATEADD(hour, -2, CURRENT_TIMESTAMP())\nORDER BY total_elapsed_time DESC LIMIT 15;\n\nALTER WAREHOUSE bi_wh SET MAX_CLUSTER_COUNT = 4;",
  },
  {
    title: "Query Optimization Regression",
    difficulty: "easy",
    q: "A critical report went from 30 seconds to 12 minutes after a deployment. How do you investigate?",
    a: "Query regression after deployment points to SQL change, data volume shift, or statistics drift.\n• Get query_id before and after from QUERY_HISTORY filtered by query_tag or user.\n• Compare partitions_scanned, partitions_total, bytes_scanned between versions.\n• Diff query text: new JOIN, removed filter, SELECT *, function on filter column.\n• Check if deployment included bulk load degrading clustering depth.\n• Test fix: rewrite SQL with sargable predicates; USE_CACHED_RESULT=FALSE for fair benchmark.\n• Rollback deployment if deadline critical while optimizing.\n\nDocument findings: root cause query change, fix PR, validation metrics post-fix.",
    cmd: "SELECT query_id, query_text, partitions_scanned, partitions_total,\n       bytes_scanned, total_elapsed_time, start_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%daily_revenue%'\n  AND start_time > DATEADD(day, -3, CURRENT_TIMESTAMP())\nORDER BY start_time DESC;\n\nALTER SESSION SET USE_CACHED_RESULT = FALSE;\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('ANALYTICS.DAILY_REVENUE', '(ORDER_DATE)');",
  },
  {
    title: "Cost Control Alert",
    difficulty: "easy",
    q: "FinOps alerts that daily credit usage exceeded threshold by 200%. What steps do you take?",
    a: "Credit spike triage balances immediate spend control with production stability.\n• Identify top warehouses by credits in WAREHOUSE_METERING_HISTORY today vs 7-day baseline.\n• Check for warehouses running 24/7 without AUTO_SUSPEND; new oversized warehouse created.\n• QUERY_HISTORY: top bytes_scanned queries and new query patterns.\n• Snowpipe and automatic clustering history for unexpected background spend.\n• Immediate: suspend non-critical warehouses; enable resource monitor SUSPEND on dev.\n• Communicate with engineering leads before suspending prod ETL warehouses.\n\nFollow-up: IaC review, tagging compliance, weekly credit dashboard.",
    cmd: "SELECT warehouse_name, SUM(credits_used) AS credits_today\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATE_TRUNC('day', CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 2 DESC;\n\nSELECT user_name, SUM(credits_used_compute) AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATE_TRUNC('day', CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 2 DESC LIMIT 10;\n\nALTER WAREHOUSE dev_wh SET AUTO_SUSPEND = 60;",
  },
  {
    title: "Data Sharing Access Denied",
    difficulty: "easy",
    q: "A partner cannot query your shared dataset and reports authorization errors. How do you resolve?",
    a: "Share access failures require coordinated provider and consumer debugging.\n• Provider: DESC SHARE — verify SELECT grants on tables/views and USAGE on database schema.\n• Confirm ALTER SHARE ADD ACCOUNTS used correct consumer organization and account name.\n• Consumer: verify imported database exists via SHOW DATABASES or SHOW IMPORTED DATABASES.\n• Consumer: GRANT IMPORTED PRIVILEGES on database to partner role; role must be active.\n• Check if shared object was dropped/recreated — may need re-grant TO SHARE.\n• Test with provider-created reader account mimicking consumer.\n\nResolution SLA: 4-hour partner onboarding with documented checklist.",
    cmd: "DESC SHARE partner_share;\n\nSHOW GRANTS TO SHARE partner_share;\n\n-- Consumer account:\nSHOW GRANTS ON DATABASE imported_partner_data;\n\nGRANT IMPORTED PRIVILEGES ON DATABASE imported_partner_data TO ROLE partner_analyst;",
  },
  {
    title: "Snowpipe Ingestion Failure",
    difficulty: "easy",
    q: "Files are landing in S3 but the target table has not received new rows for 2 hours. What do you check?",
    a: "Snowpipe stall diagnosis traces the notification-to-load pipeline end to end.\n• SYSTEM$PIPE_STATUS(pipe): pending_file_count, executionState, error messages.\n• COPY_HISTORY: recent LOAD_FAILED entries with first_error_message.\n• AWS: S3 event notification → SQS queue per DESC PIPE notification_channel.\n• Storage integration: ALLOWED_LOCATIONS covers file prefix; IAM role trust intact.\n• Test: ALTER PIPE ... REFRESH for manual poll — if works, notification path broken.\n• Backfill missed files: COPY INTO from stage path after fix.\n\nPrevent recurrence: synthetic file canary with alert on missing COPY_HISTORY entry.",
    cmd: "SELECT SYSTEM$PIPE_STATUS('sales.public.events_pipe');\n\nSELECT file_name, status, first_error_message, last_load_time\nFROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'EVENTS',\n  START_TIME => DATEADD(hour, -4, CURRENT_TIMESTAMP())\n));\n\nALTER PIPE events_pipe REFRESH;\n\nDESC INTEGRATION s3_landing_int;",
  },
  {
    title: "Warehouse Auto-Suspend Loop",
    difficulty: "easy",
    q: "A warehouse suspends and resumes every few minutes causing query delays. What is happening and how do you fix it?",
    a: "Auto-suspend thrashing occurs when background activity repeatedly wakes the warehouse.\n• Identify keep-alive queries: SHOW WAREHOUSES; check running queries in QUERY_HISTORY every few minutes.\n• Common culprits: monitoring tool polling, task with 1-minute schedule, stream-triggered task, BI tool connection test.\n• AUTO_SUSPEND too aggressive (60s) with periodic job every 90s causes suspend/resume cycle.\n• Fix: increase AUTO_SUSPEND above job interval; move monitoring to serverless tasks or separate tiny warehouse.\n• Consolidate scheduled jobs to run sequentially in one wake window.\n\nMeasure: warehouse uptime % should drop after fix; credits should decrease.",
    cmd: "SHOW WAREHOUSES LIKE 'etl_wh';\n\nSELECT query_text, start_time, user_name, role_name\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE warehouse_name = 'ETL_WH'\n  AND start_time > DATEADD(hour, -2, CURRENT_TIMESTAMP())\nORDER BY start_time;\n\nALTER WAREHOUSE etl_wh SET AUTO_SUSPEND = 600;",
  },
  {
    title: "Clustering Not Improving Pruning",
    difficulty: "easy",
    q: "You added CLUSTER BY but queries still scan 90% of partitions. What went wrong and how do you fix it?",
    a: "Clustering not helping usually means wrong key, unsorted loads, or insufficient recluster time.\n• Verify clustering depth via SYSTEM$CLUSTERING_INFORMATION — depth >4 means poor clustering.\n• Confirm query filters use clustering columns directly without functions.\n• Check if bulk unsorted load happened after CLUSTER BY — depth degrades until recluster completes.\n• Wrong key: queries filter on region but clustered on date — mismatch.\n• Fix: correct clustering key to match filters; pre-sort COPY loads; wait for automatic recluster or CTAS sorted rebuild.\n• Validate: partitions_scanned/partitions_total should drop below 20% for selective queries.",
    cmd: "SELECT SYSTEM$CLUSTERING_INFORMATION('ORDERS', '(ORDER_DATE)');\n\nSELECT query_id, partitions_scanned, partitions_total, query_text\nFROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())\nWHERE query_text ILIKE '%orders%'\nORDER BY start_time DESC LIMIT 5;\n\nALTER TABLE orders CLUSTER BY (order_date, region);",
  },
  {
    title: "Task Chain Not Executing",
    difficulty: "medium",
    q: "Your root task shows SUCCEEDED but downstream child tasks never ran overnight. How do you debug?",
    a: "Task DAG failures involve resume state, dependency graph, and conditional triggers.\n• SHOW TASKS: verify child tasks state = started (resumed), not suspended.\n• TASK_HISTORY for root and children: check state, error_message, scheduled_time gaps.\n• Resume order issue: children must be resumed bottom-up after creation.\n• Child may have WHEN SYSTEM$STREAM_HAS_DATA false despite parent success.\n• Graph version mismatch after DDL change — re-resume all tasks in DAG.\n• Warehouse suspended on child task prevents execution.\n\nFix: ALTER TASK child RESUME; verify predecessor name in AFTER clause matches parent exactly.",
    cmd: "SHOW TASKS IN SCHEMA etl;\n\nSELECT name, state, scheduled_time, completed_time, error_message\nFROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(\n  SCHEDULED_TIME_RANGE_START => DATEADD(day, -1, CURRENT_TIMESTAMP())\n))\nORDER BY scheduled_time DESC;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_DEPENDENTS(TASK_NAME => 'ROOT_ETL'));\n\nALTER TASK child_transform RESUME;",
  },
  {
    title: "Stream Stale Offset",
    difficulty: "medium",
    q: "A CDC stream is marked stale and the pipeline missed changes for 48 hours. What is your recovery plan?",
    a: "Stale stream is a pipeline outage requiring full recovery assessment.\n• Confirm: SHOW STREAMS — stale=true; compare stale_after with task failure timeline.\n• Root cause: task failed longer than source table DATA_RETENTION_TIME_IN_DAYS.\n• Assess downstream: how many changes missed; target table may be inconsistent.\n• Recovery: extend retention temporarily; full table resync via MERGE from source or CLONE+SWAP.\n• Recreate stream: CREATE OR REPLACE STREAM ... SHOW_INITIAL_ROWS=TRUE for baseline.\n• Resume task; validate row counts and checksums against source.\n\nPrevent: alert on task failure within 1 hour; retention >= 2x max expected outage.",
    cmd: "SHOW STREAMS LIKE 'orders_stream';\n\nALTER TABLE source_orders SET DATA_RETENTION_TIME_IN_DAYS = 14;\n\nCREATE OR REPLACE STREAM orders_stream ON TABLE source_orders SHOW_INITIAL_ROWS = TRUE;\n\nMERGE INTO target_orders t USING source_orders s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET t.* = s.* WHEN NOT MATCHED THEN INSERT ...;\n\nALTER TASK cdc_merge RESUME;",
  },
  {
    title: "Dynamic Table Refresh Lag",
    difficulty: "medium",
    q: "A dynamic table TARGET_LAG is 15 minutes but actual lag reached 2 hours. How do you troubleshoot?",
    a: "Dynamic table lag exceeding TARGET_LAG indicates refresh failures or resource constraints.\n• DYNAMIC_TABLE_REFRESH_HISTORY: failed refreshes, error_message, duration trends.\n• scheduling_state SUSPENDED or warehouse suspended blocks refresh.\n• Upstream base table heavy DML forces expensive incremental/full refresh.\n• Warehouse too small: refresh query spilling or timing out.\n• Dependency chain: upstream DT lag cascades to downstream.\n• Mitigate: upsize warehouse, fix SQL error, suspend non-critical DTs, manual ALTER DYNAMIC TABLE REFRESH.\n\nSLA restore: prioritize critical DT; communicate staleness to BI consumers.",
    cmd: "SELECT name, target_lag, scheduling_state, last_refresh\nFROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLES())\nWHERE name = 'DT_DAILY_KPIS';\n\nSELECT state, error_message, refresh_start_time, refresh_end_time\nFROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY())\nWHERE name = 'DT_DAILY_KPIS'\nORDER BY refresh_start_time DESC LIMIT 10;\n\nALTER DYNAMIC TABLE dt_daily_kpis SET WAREHOUSE = transform_wh_large;\nALTER DYNAMIC TABLE dt_daily_kpis REFRESH;",
  },
  {
    title: "Time Travel Query Too Slow",
    difficulty: "medium",
    q: "Forensic queries using AT(TIMESTAMP) on a 5TB table timeout. How do you retrieve historical data efficiently?",
    a: "Time Travel queries scan historical micro-partitions—same pruning rules apply but more versions exist.\n• Narrow time window: AT(TIMESTAMP) closest to needed moment vs wide range scan.\n• Add selective filters on clustered columns even with AT clause.\n• CREATE TABLE forensic_sample CLONE source AT(TIMESTAMP => ...) — then query clone with limits.\n• Use BEFORE(STATEMENT => query_id) for precise point before known bad MERGE.\n• Temporarily upsize warehouse for forensic window; set STATEMENT_TIMEOUT higher.\n• For repeated forensics: export daily snapshots via task to history tables.\n\nAvoid SELECT * AT on 5TB; sample with LIMIT or aggregate checksums first.",
    cmd: "CREATE TABLE orders_forensic CLONE orders\n  AT(TIMESTAMP => '2024-06-15 10:00:00'::TIMESTAMP_LTZ);\n\nSELECT COUNT(*), SUM(amount) FROM orders_forensic\nWHERE order_date >= '2024-06-01';\n\nALTER WAREHOUSE forensic_wh SET WAREHOUSE_SIZE = 'X-LARGE';\n\nSELECT * FROM orders AT(OFFSET => -7200) WHERE order_id = 12345;",
  },
  {
    title: "Fail Safe Recovery Request",
    difficulty: "medium",
    q: "A critical table was dropped 10 days ago; Time Travel expired. What are your options?",
    a: "Post-Time Travel recovery enters Fail-safe and external backup territory.\n• Calculate: drop date + retention + 7-day Fail-safe window — are we still inside Fail-safe?\n• If yes: immediately open Snowflake Sev-1 support ticket with account, table FQN, exact drop timestamp from ACCOUNT_USAGE.TABLES deleted column.\n• Parallel: initiate rebuild from external backup (EXPORT stage, replication replica, data lake).\n• If Fail-safe expired: support cannot recover; full rebuild only path.\n• Communicate to business: RPO breach; estimated rebuild timeline.\n• Post-incident: increase retention, restrict DROP privileges, implement external backup task.\n\nNever delay support ticket while attempting rebuild—run both tracks.",
    cmd: "SELECT table_catalog, table_schema, table_name, deleted, retention_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.TABLES\nWHERE table_name = 'CRITICAL_LEDGER';\n\nCOPY INTO critical_ledger FROM @backup_stage/ledger/\nFILE_FORMAT = (TYPE = PARQUET);\n\n-- Open Snowflake support case with metadata above",
  },
  {
    title: "Zero Copy Clone Permission Issue",
    difficulty: "medium",
    q: "Developers cannot refresh dev environment via CLONE prod. Error says not authorized. How do you resolve?",
    a: "Clone authorization requires explicit grants on source and target creation privileges.\n• Required: USAGE on source database/schemas; CREATE DATABASE on account for CLONE prod.\n• Pattern: dedicated dev_clone_svc role with minimal prod read + CREATE DATABASE.\n• Masking: after clone, apply masking policies — clone copies raw data.\n• If policy blocks: check database roles, future grants, managed access schemas.\n• Terraform service account executes clone task weekly with EXECUTE AS OWNER.\n• Audit: QUERY_HISTORY for failed CLONE attempts and grant changes.\n\nSelf-service portal: developers request refresh ticket triggering automated clone task.",
    cmd: "SHOW GRANTS TO ROLE dev_clone_svc;\n\nGRANT USAGE ON DATABASE prod TO ROLE dev_clone_svc;\nGRANT CREATE DATABASE ON ACCOUNT TO ROLE dev_clone_svc;\n\nCREATE OR REPLACE DATABASE dev CLONE prod;\n\nSELECT query_text, error_message, user_name\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%CLONE%' AND error_message IS NOT NULL\nORDER BY start_time DESC LIMIT 5;",
  },
  {
    title: "RBAC Role Hierarchy Conflict",
    difficulty: "medium",
    q: "A user has conflicting privileges from multiple roles causing unexpected WRITE access. How do you untangle this?",
    a: "Privilege conflicts arise from role inheritance and secondary roles enabling unintended access.\n• SELECT CURRENT_ROLE(), CURRENT_SECONDARY_ROLES(); check if SECONDARY ROLES ALL enabled.\n• SHOW GRANTS TO USER; SHOW GRANTS OF ROLE for each granted role tracing inheritance.\n• Identify conflicting WRITE grant from inherited role vs intended READ-only role.\n• Fix: REVOKE excessive grant; restructure hierarchy so READ and WRITE roles separate without overlap.\n• Use SET DEFAULT_SECONDARY_ROLES = () if secondary roles not needed.\n• Managed access schemas prevent discretionary grants compounding confusion.\n\nDocument role matrix; quarterly access certification per user.",
    cmd: "SHOW GRANTS TO USER jane_doe;\n\nSHOW GRANTS OF ROLE analyst;\n\nSELECT CURRENT_ROLE(), CURRENT_AVAILABLE_ROLES(), CURRENT_SECONDARY_ROLES();\n\nREVOKE INSERT, UPDATE, DELETE ON TABLE prod.sales.orders FROM ROLE analyst;\n\nALTER USER jane_doe SET DEFAULT_SECONDARY_ROLES = ();",
  },
  {
    title: "Credit Spike Investigation",
    difficulty: "hard",
    q: "Monthly credits doubled with no traffic increase reported. Lead a forensic investigation.",
    a: "Unexplained credit doubling requires comprehensive usage decomposition across all metered services.\n• Compare WAREHOUSE_METERING_HISTORY month-over-month by warehouse and day.\n• QUERY_HISTORY: new heavy queries, bytes_scanned outliers, new users or service accounts.\n• AUTOMATIC_CLUSTERING_HISTORY and PIPE_USAGE_HISTORY for background services.\n• DYNAMIC_TABLE_REFRESH_HISTORY for new DT pipelines.\n• Search optimization and materialized view maintenance costs.\n• Organizational: new team onboarded, clone refresh writing heavily in dev, forgotten Large warehouse.\n• Deliver executive summary with top 3 root causes, credits per cause, remediation owners.\n\nImplement: daily credit anomaly detection alert >20% from 14-day median.",
    cmd: "SELECT DATE_TRUNC('week', start_time) AS week,\n       SUM(credits_used) AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD(month, -3, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 1;\n\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.AUTOMATIC_CLUSTERING_HISTORY\nWHERE start_time >= DATEADD(month, -1, CURRENT_TIMESTAMP())\nORDER BY credits_used DESC LIMIT 20;\n\nSELECT SUM(credits_used) FROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY\nWHERE start_time >= DATEADD(month, -1, CURRENT_TIMESTAMP());",
  },
  {
    title: "Micro Partition Skew",
    difficulty: "hard",
    q: "One query on a billion-row table has a single task running 10x longer than peers. Diagnose and fix.",
    a: "Single-task straggler indicates micro-partition skew on join or aggregation key.\n• Query profile: one executor processes disproportionate partition bytes.\n• Skew cause: NULL join key, default value concentration, or monotonic hot key (popular user_id).\n• Check SYSTEM$CLUSTERING_INFORMATION for high overlap on skewed column.\n• Fixes: salt hot key (join on key||salt bucket), pre-filter NULLs, separate hot key processing branch.\n• Recluster on composite key including hash bucket.\n• For MERGE: batch by key range to distribute work.\n\nValidate fix: query profile shows even task duration distribution across workers.",
    cmd: "SELECT user_id, COUNT(*) FROM events GROUP BY 1 ORDER BY 2 DESC LIMIT 10;\n\nALTER TABLE events CLUSTER BY (HASH_BUCKET, event_date);\n\n-- Salted join pattern:\nSELECT * FROM fact f JOIN dim d\n  ON f.user_id = d.user_id AND f.salt_bucket = d.salt_bucket;\n\nSELECT SYSTEM$CLUSTERING_INFORMATION('EVENTS', '(HASH_BUCKET, EVENT_DATE)');",
  },
  {
    title: "External Stage Auth Failure",
    difficulty: "hard",
    q: "COPY INTO and Snowpipe fail with \"Access Denied\" on S3 external stage. Walk through resolution.",
    a: "External stage auth failures trace storage integration IAM trust chain.\n• DESC INTEGRATION: note STORAGE_AWS_IAM_USER_ARN and STORAGE_AWS_EXTERNAL_ID for IAM role trust.\n• AWS IAM role trust policy must allow Snowflake IAM user with external ID condition.\n• Role policy: s3:GetObject, s3:ListBucket on ALLOWED_LOCATIONS prefix only.\n• Recent AWS change: role policy modified, external ID rotated, integration DISABLED.\n• DESC STAGE: verify STORAGE_INTEGRATION referenced, URL matches ALLOWED_LOCATIONS.\n• Test: LIST @stage; small COPY with VALIDATION_MODE.\n\nDocument working IAM policy template in runbook; Terraform both integration and AWS role.",
    cmd: "DESC INTEGRATION s3_prod_int;\n\nDESC STAGE landing_stage;\n\nLIST @landing_stage;\n\nCOPY INTO test_load FROM @landing_stage/sample.parquet\nFILE_FORMAT = (TYPE = PARQUET) VALIDATION_MODE = 'RETURN_ERRORS';\n\nALTER STORAGE INTEGRATION s3_prod_int SET ENABLED = TRUE;",
  },
  {
    title: "Materialized View Staleness",
    difficulty: "hard",
    q: "Dashboards using a materialized view show data 6 hours behind despite active base table loads. Fix it.",
    a: "Materialized view staleness occurs when refresh lags behind base table change rate.\n• SHOW MATERIALIZED VIEWS: check refresh mode, last refresh time.\n• MATERIALIZED_VIEW_REFRESH_HISTORY: failures, duration, suspended state.\n• High DML on base table overwhelms incremental refresh—consider Dynamic Table with TARGET_LAG.\n• Manual: ALTER MATERIALIZED VIEW ... REFRESH; verify query rewrite routes to MV.\n• Base table structural change may break MV requiring recreate.\n• Warehouse for refresh suspended or too small.\n\nLong-term: migrate to Dynamic Table if MV limitations hit; schedule off-peak full refresh if needed.",
    cmd: "SHOW MATERIALIZED VIEWS LIKE 'MV_DAILY_SALES';\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.MATERIALIZED_VIEW_REFRESH_HISTORY())\nWHERE name = 'MV_DAILY_SALES'\nORDER BY refresh_start_time DESC LIMIT 10;\n\nALTER MATERIALIZED VIEW mv_daily_sales REFRESH;\n\nSELECT * FROM mv_daily_sales LIMIT 5;",
  },
  {
    title: "Cross-Region Replication Lag",
    difficulty: "hard",
    q: "DR replica is 8 hours behind primary. Business requires RPO under 1 hour. What do you do?",
    a: "Replication lag beyond RPO is a DR program failure requiring immediate escalation.\n• DATABASE_REPLICATION_USAGE_HISTORY: refresh lag trend, failures, bytes transferred.\n• Root causes: primary heavy DML outpacing refresh schedule, refresh task failure, network throttling.\n• Immediate: manual ALTER DATABASE replica REFRESH; increase refresh frequency via task.\n• Primary: reduce bulk DML batch size; schedule large loads after replication window.\n• Consider account-level replication vs per-database if many databases lag.\n• If chronic: resize replication service or split hot tables to dedicated replication group.\n\nReport RPO breach to risk committee; DR drill failure until lag consistently <1h for 30 days.",
    cmd: "SHOW REPLICATION DATABASES;\n\nSELECT * FROM TABLE(INFORMATION_SCHEMA.DATABASE_REPLICATION_USAGE_HISTORY(\n  DATE_RANGE_START => DATEADD(day, -7, CURRENT_TIMESTAMP())\n));\n\nALTER DATABASE prod_replica REFRESH;\n\nCREATE TASK replicate_refresh\n  WAREHOUSE = admin_wh\n  SCHEDULE = 'USING CRON 0 * * * * UTC'\n  AS ALTER DATABASE prod_replica REFRESH;",
  },
  {
    title: "Account Usage Query Timeout",
    difficulty: "hard",
    q: "Your monitoring queries against ACCOUNT_USAGE.QUERY_HISTORY timeout after 120 seconds. Optimize them.",
    a: "ACCOUNT_USAGE views are large; naive scans timeout without proper filtering and warehousing.\n• Use dedicated monitoring warehouse size Large+ for ACCOUNT_USAGE queries.\n• Always filter start_time range—never full table scan without date predicate.\n• Select only needed columns; avoid SELECT * on QUERY_HISTORY.\n• Use QUERY_HISTORY BY SESSION (INFORMATION_SCHEMA) for recent session queries instead.\n• Materialize daily aggregates via task into internal monitoring tables for dashboards.\n• Consider SNOWFLAKE database INFORMATION_SCHEMA alternatives for real-time small scope.\n\nPattern: CREATE TABLE monitoring.daily_query_stats AS daily rollup task; dashboards query rollup.",
    cmd: "ALTER WAREHOUSE monitoring_wh SET WAREHOUSE_SIZE = 'LARGE';\n\nSELECT warehouse_name, COUNT(*) AS query_count,\n       AVG(total_elapsed_time) AS avg_ms\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD(day, -1, CURRENT_TIMESTAMP())\n  AND execution_status = 'SUCCESS'\nGROUP BY 1;\n\nCREATE TABLE monitoring.daily_stats AS\nSELECT DATE_TRUNC('day', start_time) AS day,\n       warehouse_name, SUM(credits_used_cloud_services + credits_used_compute_storage) AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD(day, -7, CURRENT_TIMESTAMP())\nGROUP BY 1, 2;",
  }
];
