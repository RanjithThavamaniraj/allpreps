/**
 * PostgreSQL interview question registry for AllPreps.
 * 21 topics × 5 questions = 105 production-focused questions.
 */

import { buildQuestion } from './dbAnswerFormat.js';

export const POSTGRESQL_QUESTIONS = [
  // ─── architecture.js: postgresql-architecture ─────────────────────────────────────
  buildQuestion({
    id: "pg-postgresql-architecture-1",
    trackId: 'postgresql',
    topic: "postgresql-architecture",
    file: "architecture.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "Describe the PostgreSQL process architecture: postmaster, backends, and background workers.",
    sections: {
      interview: "PostgreSQL uses a postmaster parent that listens on port 5432 and forks a dedicated backend process per client connection. Background workers include checkpointer, WAL writer, autovacuum launcher/workers, stats collector, and optional logical replication apply workers. Shared memory holds shared_buffers, WAL buffers, lock tables, and proc arrays. Each session is an OS process — high connection counts require external pooling.",
      explanation: "The postmaster manages startup, crash recovery, and child lifecycle. On connection it forks exec postgres backend which reads pg_hba.conf, authenticates, and attaches to shared memory. Background processes are postmaster children started at boot: bgwriter flushes dirty buffers, checkpointer writes checkpoint records to WAL, walwriter flushes WAL buffers, autovacuum launcher schedules workers, and archiver optionally ships WAL segments. Logical replication uses apply workers per subscription. This multi-process design avoids GIL-style contention but makes connection count a first-class capacity metric.",
      production: "An e-commerce platform hit 800 direct connections during a deploy spike; each backend consumed ~10MB RSS and the OS started thrashing. pg_stat_activity showed 600 idle sessions from a misconfigured app pool. Fix: deploy PgBouncer in transaction mode, set max_connections=200, and alert on pg_stat_activity count > 150.",
      followUps: [
        "What happens to in-flight transactions when postmaster crashes?",
        "How does max_connections interact with superuser_reserved_connections?",
        "Difference between background writer and checkpointer?",
        "When would you enable parallel workers vs connection pooling?"
      ],
      mistakes: [
        "Setting max_connections to 2000 without pooling or RAM planning",
        "Ignoring superuser_reserved_connections during incident response",
        "Assuming thread-per-connection like some other databases",
        "Killing postmaster with SIGKILL instead of SIGTERM during maintenance"
      ],
      seniorInsights: "Capacity planning starts with (max_connections × per-backend memory) + shared_buffers + wal_buffers + maintenance_work_mem ceiling for autovacuum workers. On managed RDS/Aurora, the connection limit is often the first hard ceiling before CPU. Monitor pg_stat_database numbackends and correlate with load average.",
      commands: [
        "SELECT pid, usename, application_name, state, wait_event_type, wait_event FROM pg_stat_activity;",
        "SELECT name, setting, unit FROM pg_settings WHERE name IN ('max_connections','superuser_reserved_connections','shared_buffers');"
      ],
      bestPractices: [
        "Use PgBouncer or pgpool for app-facing connections",
        "Set statement_timeout and idle_in_transaction_session_timeout",
        "Label connections via application_name for troubleshooting",
        "Reserve headroom below max_connections for admin and replication"
      ],
    },
  }),
  buildQuestion({
    id: "pg-postgresql-architecture-2",
    trackId: 'postgresql',
    topic: "postgresql-architecture",
    file: "architecture.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "How do tablespaces and on-disk storage layout affect PostgreSQL operations?",
    sections: {
      interview: "Tablespaces map database objects to filesystem directories via pg_tablespace. Default pg_default holds user data; pg_global holds shared catalogs. Separate tablespaces enable tiering hot tables on NVMe and cold archives on cheaper storage. Each table/index is stored as a relfilenode file under the tablespace path. Moving objects between tablespaces rewrites data and requires ACCESS EXCLUSIVE lock.",
      explanation: "PostgreSQL stores heap and index files as segments (default 1GB) named by relfilenode OID. CREATE TABLESPACE requires an empty directory owned by postgres. ALTER TABLE SET TABLESPACE copies the entire relation — expensive on terabyte tables. WAL and pg_wal always live on the data directory unless redirected. Monitoring per-tablespace disk prevents WAL/data partition exhaustion. Cloud volumes attach cleanly as tablespace mount points.",
      production: "A analytics team created TABLESPACE fast_nvme for a 2TB fact table but forgot to move indexes; sequential scans saturated the default EBS gp2 volume while NVMe sat idle. pg_table_size and du on $PGDATA/base confirmed misplacement. Scheduled maintenance: CREATE INDEX CONCURRENTLY on new tablespace, swap, drop old.",
      followUps: [
        "Can WAL live on a separate tablespace?",
        "How does CREATE DATABASE specify tablespace?",
        "Impact of tablespace on pg_basebackup paths?",
        "Temp files and tablespace interaction during sorts?"
      ],
      mistakes: [
        "Creating tablespace on NFS without testing fsync latency",
        "Running ALTER TABLE SET TABLESPACE on production without lock timeout",
        "Forgetting tablespace permissions after OS directory recreation",
        "Mixing tablespaces across different filesystem block sizes without testing"
      ],
      seniorInsights: "Tablespaces are underused but valuable for IO isolation on bare metal. On Aurora/RDS you often cannot use custom tablespaces — plan tiering via read replicas or partitioning instead. Always document tablespace-to-mount mappings in runbooks.",
      commands: [
        "SELECT spcname, pg_tablespace_location(oid) FROM pg_tablespace;",
        "SELECT c.relname, pg_tablespace_location(c.reltablespace) FROM pg_class c WHERE c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace LIMIT 20;"
      ],
      bestPractices: [
        "Document mount points and IOPS provisioning per tablespace",
        "Monitor disk usage per tablespace separately",
        "Test fsync performance before production tablespace creation",
        "Use partitioning before tablespace tiering for logical separation"
      ],
    },
  }),
  buildQuestion({
    id: "pg-postgresql-architecture-3",
    trackId: 'postgresql',
    topic: "postgresql-architecture",
    file: "architecture.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Explain shared_buffers, local buffers, and the buffer pool replacement strategy.",
    sections: {
      interview: "shared_buffers is PostgreSQL's primary page cache in shared memory; all backends read/write 8KB pages through it. Backend-private local buffers cache temporary tables. The clock-sweep algorithm evicts dirty pages, delegating writes to bgwriter/checkpointer. effective_cache_size hints the planner about OS page cache. Too-small shared_buffers increases disk IO; too-large can starve OS cache on Linux.",
      explanation: "Buffer tags identify (relfilenode, fork, block) tuples in the buffer pool. Pin/unpin reference counting prevents eviction during access. bgwriter scans dirty buffers proactively; checkpointer writes a checkpoint WAL record flushing dirty pages at checkpoint_completion_target intervals. pg_buffercache extension reveals which relations occupy buffers. On Linux, many DBAs set shared_buffers to 25% RAM and rely on OS cache for the rest.",
      production: "After upgrading shared_buffers from 4GB to 32GB on a 64GB host, random read latency improved but checkpoint spikes doubled write IO, causing replica lag. pg_stat_bgwriter showed buffers_checkpoint spiking. Tuned checkpoint_completion_target=0.9 and max_wal_size=8GB to spread writes.",
      followUps: [
        "What does pg_buffercache show and when is it safe to query?",
        "How does effective_cache_size affect EXPLAIN?",
        "Difference between buffer hit ratio on index vs heap?",
        "Impact of full_page_writes on buffer dirtying?"
      ],
      mistakes: [
        "Setting shared_buffers > 40% RAM on Linux without testing",
        "Ignoring checkpoint IO when tuning shared_buffers",
        "Using pg_prewarm blindly on cold start without measuring benefit",
        "Equating buffer cache hit ratio alone with query health"
      ],
      seniorInsights: "Hit ratio below 99% on OLTP is worth investigating but OLAP workloads legitimately scan cold data. Combine pg_stat_database blks_hit/blks_read with pg_stat_statements mean time. For RDS, shared_buffers is preset — tune work_mem and connection count instead.",
      commands: [
        "SELECT setting FROM pg_settings WHERE name IN ('shared_buffers','effective_cache_size','checkpoint_completion_target');",
        "SELECT sum(heap_blks_hit) / nullif(sum(heap_blks_hit)+sum(heap_blks_read),0) AS heap_hit_ratio FROM pg_statio_user_tables;"
      ],
      bestPractices: [
        "Benchmark before and after shared_buffers changes",
        "Monitor checkpoint duration via pg_stat_bgwriter",
        "Use pg_stat_statements for IO-heavy queries not captured by hit ratio",
        "Restart required for shared_buffers changes — plan maintenance"
      ],
    },
  }),
  buildQuestion({
    id: "pg-postgresql-architecture-4",
    trackId: 'postgresql',
    topic: "postgresql-architecture",
    file: "architecture.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Production Support",
    question: "What is the role of pg_hba.conf and how does authentication flow for a new connection?",
    sections: {
      interview: "pg_hba.conf defines which hosts/users/databases may connect and which auth method applies (scram-sha-256, cert, peer, md5). The postmaster reads it on startup and on SIGHUP reload. First matching rule wins. Client connection hits postmaster, which forks backend; backend evaluates pg_hba.conf before authentication completes.",
      explanation: "Rules specify connection type (local, host, hostssl), database, user, address/CIDR, and method. scram-sha-256 is preferred over md5. peer/trust are for local socket connections on Linux. SSL rules use hostssl; client certs use clientcert=verify-full in pg_ident.conf mappings. pg_hba.conf errors prevent reload — always validate with pg_reload_conf() and check logs.",
      production: "After a VPC subnet expansion, application pods got \"no pg_hba.conf entry for host\" errors. New pod CIDR 10.42.0.0/16 was missing from pg_hba.conf while 10.41.0.0/16 existed. Added hostssl rule, ran SELECT pg_reload_conf(), verified with psql from a canary pod.",
      followUps: [
        "How do you reload pg_hba.conf without restart?",
        "Difference between scram-sha-256 and md5?",
        "When to use pg_ident.conf?",
        "How does RDS handle pg_hba equivalent?"
      ],
      mistakes: [
        "Using trust on host entries in production",
        "Forgetting hostssl vs host when requiring TLS",
        "Rule order causing unintended deny — broader rules above specific ones",
        "Not testing reload on staging before production SIGHUP"
      ],
      seniorInsights: "Automate pg_hba changes via Ansible/Puppet with version control. Pair with pg_stat_ssl to audit encrypted connections. For zero-trust, combine cert auth and short-lived credentials from Vault.",
      commands: [
        "SELECT pg_reload_conf();",
        "SELECT a.pid, a.usename, s.ssl, a.client_addr FROM pg_stat_ssl s JOIN pg_stat_activity a USING (pid);",
        "# pg_hba.conf:\n# hostssl appdb appuser 10.42.0.0/16 scram-sha-256"
      ],
      bestPractices: [
        "Version-control pg_hba.conf with infrastructure code",
        "Use hostssl and scram-sha-256 for remote connections",
        "Document rule order and test with psql from each subnet",
        "Alert on authentication failure rate in PostgreSQL logs"
      ],
    },
  }),
  buildQuestion({
    id: "pg-postgresql-architecture-5",
    trackId: 'postgresql',
    topic: "postgresql-architecture",
    file: "architecture.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Design PostgreSQL architecture for a multi-tenant SaaS with strict tenant isolation and 99.95% uptime.",
    sections: {
      interview: "Use schema-per-tenant or database-per-tenant depending on scale; database-per-tenant simplifies backup/restore per customer but increases connection overhead — pool per tenant via PgBouncer. Primary-replica streaming replication with Patroni/etcd for automatic failover. Separate read replicas for reporting. RLS as defense-in-depth for shared-schema models. PITR with WAL archiving to S3 for RPO < 5 min.",
      explanation: "Architecture layers: Route53/GLB → PgBouncer (transaction mode) → Patroni-managed primary + 2 sync replicas in 3 AZs. Citus or sharding if single-tenant data exceeds 2TB. pg_audit for compliance. Connection limits per tenant via PgBouncer pool_size and database roles. Monitoring: pg_stat_replication lag, pg_stat_database conflicts, autovacuum backlog, connection saturation.",
      production: "A HR SaaS with 400 tenants on shared schema suffered noisy-neighbor IO when one tenant ran full-table analytics. Migrated largest 20 tenants to dedicated databases with per-tenant PgBouncer pools; implemented RLS policies on shared schema for remaining tenants. Failover tested quarterly via Patroni switchover — RTO 45 seconds.",
      followUps: [
        "Schema vs database vs row-level isolation trade-offs?",
        "How to handle cross-tenant reporting queries?",
        "Connection pool sizing formula for multi-tenant?",
        "Major version upgrade without downtime?"
      ],
      mistakes: [
        "Single max_connections for all tenants without pool isolation",
        "Skipping RLS on shared-schema multi-tenant",
        "No tested failover runbook — manual promotion during outage",
        "Autovacuum tuned globally ignoring per-tenant bloat variance"
      ],
      seniorInsights: "Tenant isolation is a product decision with ops cost. Database-per-tenant at 500+ tenants needs orchestration. Always measure blast radius: one tenant's VACUUM FULL should not block others — separate databases achieve this naturally.",
      commands: [
        "SELECT datname, numbackends FROM pg_stat_database ORDER BY numbackends DESC;",
        "patronictl list",
        "SELECT application_name, state, sync_state, replay_lag FROM pg_stat_replication;"
      ],
      bestPractices: [
        "Automate failover drills quarterly",
        "Per-tenant connection pools and statement timeouts",
        "Archive WAL to durable object storage",
        "Use pg_stat_statements tagged by application_name per tenant"
      ],
    },
  }),

  // ─── architecture.js: query-planner ─────────────────────────────────────
  buildQuestion({
    id: "pg-query-planner-1",
    trackId: 'postgresql',
    topic: "query-planner",
    file: "architecture.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "How does the PostgreSQL query planner choose between sequential scan, index scan, and bitmap scan?",
    sections: {
      interview: "The planner estimates cost using statistics from pg_statistic/pg_stats: row counts, selectivity, correlation. Sequential scan wins for large fractions of the table. Index scan suits highly selective predicates. Bitmap index scan combines multiple indexes then heap fetch — good for moderate selectivity. enable_seqscan and random_page_cost influence choices but should not be toggled casually in production.",
      explanation: "Cost units are abstract (seq_page_cost=1.0 default, random_page_cost=4.0). Planner compares paths: Seq Scan cost ≈ pages × seq_page_cost; Index Scan adds index pages + heap fetches × random_page_cost. Bitmap Heap Scan builds TID bitmap from one or more indexes before visiting heap — reduces random IO vs plain index scan on wide ranges. ANALYZE refreshes statistics; stale stats cause wrong row estimates and nested loop on large sets.",
      production: "After bulk load of 50M rows without ANALYZE, a billing query switched from index scan to seq scan on a 200-row filter because n_distinct was stale. EXPLAIN showed estimated rows=1, actual=180000. Ran ANALYZE billing_events; plan reverted to Bitmap Index Scan, latency dropped from 12s to 80ms.",
      followUps: [
        "When does the planner pick Index Only Scan?",
        "How does default_statistics_target affect estimates?",
        "What is the difference between nested loop and hash join selection?",
        "Impact of extended statistics (CREATE STATISTICS)?"
      ],
      mistakes: [
        "Disabling seqscan globally to force index use",
        "Not running ANALYZE after large COPY/DELETE",
        "Ignoring correlation stats for multi-column filters",
        "Assuming EXPLAIN without ANALYZE reflects production row counts"
      ],
      seniorInsights: "Always pair EXPLAIN (ANALYZE, BUFFERS) with pg_stat_statements. When estimates diverge 10× from actual, check stats freshness and consider increased statistics targets on skewed columns.",
      commands: [
        "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE status = $1 AND created_at > $2;",
        "SELECT schemaname, tablename, last_analyze, last_autoanalyze FROM pg_stat_user_tables WHERE relname = 'orders';",
        "SELECT attname, n_distinct, correlation FROM pg_stats WHERE tablename = 'orders';"
      ],
      bestPractices: [
        "Schedule ANALYZE after bulk loads via autovacuum or job",
        "Use EXPLAIN (ANALYZE, BUFFERS) in staging with production-like data volumes",
        "Create extended statistics for correlated columns",
        "Avoid planner GUC hacks — fix stats and indexes first"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-planner-2",
    trackId: 'postgresql',
    topic: "query-planner",
    file: "architecture.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Explain join algorithms in PostgreSQL: nested loop, hash join, and merge join.",
    sections: {
      interview: "Nested loop: for each outer row, probe inner — ideal when inner is index-backed and outer is small. Hash join: builds hash table on smaller input, probes larger — best for equi-joins without useful indexes on large sets. Merge join: both inputs sorted on join key — efficient for pre-sorted or index-ordered data. work_mem caps hash/sort memory; spills to disk if exceeded.",
      explanation: "Planner picks join order and method via dynamic programming (GEQO for many tables). Hash join requires equality predicates; merge join needs sortable types and ordered inputs. Nested loop with materialize appears when inner is re-scanned. Parallel hash join (PG 9.6+) splits build/probe across workers. join_collapse_limit and from_collapse_limit affect subquery flattening. pg_stat_statements reveals join-heavy queries by total time.",
      production: "A reporting query joining 4 tables used Hash Join with 2GB sort spill to disk — work_mem was 64MB. Increased work_mem to 256MB for the reporting role via SET LOCAL in a transaction block; query time fell from 45s to 6s. Monitored temp file usage via pg_stat_database temp_bytes.",
      followUps: [
        "When does PostgreSQL choose merge join over hash join?",
        "How does parallel join interact with max_parallel_workers_per_gather?",
        "What causes nested loop on 1M × 1M rows?",
        "Semi-join and anti-join plan shapes?"
      ],
      mistakes: [
        "Raising work_mem globally causing memory pressure under concurrency",
        "Missing join column statistics causing hash on wrong inner table",
        "Not indexing foreign key columns used in nested loops",
        "Ignoring enable_hashjoin toggles left from old debugging sessions"
      ],
      seniorInsights: "Hash join spill is a smoking gun for work_mem tuning per workload class, not globally. For OLTP, nested loop + index is usually correct — hash on millions of rows signals missing index or bad stats.",
      commands: [
        "EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ... FROM a JOIN b ON a.id = b.a_id;",
        "SELECT name, setting FROM pg_settings WHERE name IN ('work_mem','hash_mem_multiplier','enable_hashjoin');",
        "SELECT query, temp_blks_written FROM pg_stat_statements ORDER BY temp_blks_written DESC LIMIT 10;"
      ],
      bestPractices: [
        "Index foreign keys and high-cardinality join columns",
        "Set role-specific work_mem for batch/reporting roles",
        "Monitor temp file growth in pg_stat_database",
        "Use pg_hint_plan only as last resort with documented reason"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-planner-3",
    trackId: 'postgresql',
    topic: "query-planner",
    file: "architecture.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Production Support",
    question: "What role do pg_stats, histograms, and MCV lists play in selectivity estimation?",
    sections: {
      interview: "pg_stats stores per-column statistics: null_frac, avg_width, n_distinct, most_common_vals/freqs (MCV), and histogram_bounds for range queries. Selectivity of WHERE col = constant uses MCV if present; otherwise 1/n_distinct. Range predicates interpolate within histogram buckets. Correlated columns need CREATE STATISTICS ... n_distinct or functional dependencies.",
      explanation: "ANALYZE samples rows (default 300 × default_statistics_target) to build stats. Higher default_statistics_target increases histogram resolution and MCV count — costs more ANALYZE time. Extended stats capture multivariate ndistinct and dependencies. Expression indexes require statistics on expressions. inherited tables aggregate child stats. autovacuum_analyze_scale_factor triggers re-analyze on change fraction.",
      production: "Queries filtering status IN ('pending','processing') AND region = 'eu-west' underestimated rows because status and region were correlated — EU had 90% pending. CREATE STATISTICS stts (dependencies) ON status, region FROM orders; ANALYZE orders; plan switched from nested loop to hash join correctly.",
      followUps: [
        "How to inspect histogram buckets for a column?",
        "When does the planner assume uniform distribution?",
        "Impact of NULL fraction on index selectivity?",
        "Stats on partitioned table parent vs partitions?"
      ],
      mistakes: [
        "Increasing statistics target on every column without measuring ANALYZE duration",
        "Ignoring correlation on composite filters",
        "Not analyzing after CREATE INDEX CONCURRENTLY completes",
        "Assuming n_distinct from sample is exact on small tables"
      ],
      seniorInsights: "For skewed columns (status, country_code), MCV lists are critical — a rare status value with wrong estimate causes catastrophic nested loops. Check pg_stats.most_common_vals before adding indexes.",
      commands: [
        "SELECT attname, null_frac, n_distinct, most_common_vals, most_common_freqs, histogram_bounds FROM pg_stats WHERE tablename = 'orders' AND attname = 'status';",
        "CREATE STATISTICS orders_status_region (dependencies) ON status, region FROM orders;",
        "ANALYZE VERBOSE orders;"
      ],
      bestPractices: [
        "Target extended statistics at known correlated filter pairs",
        "Review pg_stats after schema changes affecting query patterns",
        "Tune autovacuum analyze thresholds on high-churn tables",
        "Document statistics maintenance in migration runbooks"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-planner-4",
    trackId: 'postgresql',
    topic: "query-planner",
    file: "architecture.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "How does parallel query planning work and when should you enable or disable it?",
    sections: {
      interview: "Parallel query splits scan/join/aggregate across background workers when expected benefit exceeds parallel_setup_cost. GUCs: max_parallel_workers_per_gather, max_parallel_workers, min_parallel_table_scan_size, parallel_tuple_cost. Gather node collects partial results. Parallel unsafe functions or subtransactions block parallelism. Serial plans may beat parallel on small tables due to worker startup overhead.",
      explanation: "Leader process coordinates workers; each worker scans a page range or hash partition. Parallel seq scan, parallel bitmap heap scan, parallel hash join, parallel aggregate (partial mode). max_worker_processes caps total background workers including autovacuum and logical replication. ALTER TABLE ... SET (parallel_workers = N) per table. EXPLAIN shows Workers Planned/Launched. RDS/Aurora expose parallel settings with instance-size limits.",
      production: "OLTP dashboard queries on a 500GB table triggered parallel seq scans saturating CPU — 8 workers per query × 50 concurrent requests. Set parallel_workers=0 on hot OLTP tables via ALTER TABLE, raised min_parallel_table_scan_size to 1GB, reserved max_parallel_workers for nightly ETL role only.",
      followUps: [
        "Why might Workers Launched be less than Workers Planned?",
        "Parallel query and replication slot interaction?",
        "Can parallel workers increase lock contention?",
        "parallel_leader_participation behavior?"
      ],
      mistakes: [
        "Enabling parallelism on tiny OLTP tables causing worker churn",
        "max_parallel_workers_per_gather=16 on 4-vCPU instance",
        "Using parallel unsafe PL/pgSQL functions in SELECT list",
        "Not checking parallel safety of custom C functions"
      ],
      seniorInsights: "Parallelism is for analytics and batch — default OLTP tables often benefit from parallel_workers=0. Watch pg_stat_activity wait_event ParallelBitmapScan when IO-bound. Combine with partition pruning for best wins.",
      commands: [
        "EXPLAIN (ANALYZE, BUFFERS) SELECT count(*) FROM events WHERE ts > now() - interval '7 days';",
        "SELECT relname, reloptions FROM pg_class WHERE relname = 'events';",
        "ALTER TABLE events SET (parallel_workers = 4);",
        "SELECT name, setting FROM pg_settings WHERE name LIKE '%parallel%';"
      ],
      bestPractices: [
        "Disable parallel workers on latency-sensitive OLTP tables",
        "Size max_parallel_workers to CPU cores minus headroom",
        "Use parallel query for batch ETL windows only",
        "Test parallel plans after major version upgrades"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-planner-5",
    trackId: 'postgresql',
    topic: "query-planner",
    file: "architecture.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Diagnose and fix a plan regression after a PostgreSQL major version upgrade.",
    sections: {
      interview: "Compare EXPLAIN plans pre/post upgrade using pg_stat_statements queryid and normalized query text. Check release notes for planner changes (join order, partitionwise join, default cost constants). Verify statistics refreshed via pg_upgrade --analyze-in-stages. Consider pg_store_plans or saved golden plans. Rollback via pg_hint_plan temporarily while fixing root cause.",
      explanation: "Common upgrade regressions: improved parallel defaults causing OLTP parallel scans; changed selectivity formulas; partitionwise aggregate now chosen incorrectly; extended statistics not migrated. pg_upgrade preserves data but stats may need rebuild. Compare auto_explain logs. Memoize nodes in PG 15 changed nested loop behavior. Test with same data volume — empty staging misleads.",
      production: "Post PG 15 upgrade, checkout query latency 3× higher — EXPLAIN showed Memoize on nested loop with negative cache hit. Workaround: SET enable_memoize=off for app role until PG 15.2 fix. Long-term: index on (cart_id, sku_id) eliminated repeated probes; re-enabled memoize after patch.",
      followUps: [
        "What does pg_upgrade --analyze-in-stages do?",
        "How to capture plans automatically with auto_explain?",
        "When to use prepared statements vs generic plans?",
        "Impact of plan_cache_mode on regressions?"
      ],
      mistakes: [
        "Blaming hardware before comparing plans side-by-side",
        "Skipping ANALYZE after pg_upgrade",
        "Permanent enable_*=off without ticket to fix stats/index",
        "Testing plan changes on empty tables"
      ],
      seniorInsights: "Maintain a golden query suite with saved EXPLAIN plans in CI. After upgrade, run EXPLAIN (ANALYZE) on top 20 pg_stat_statements by total_exec_time before opening traffic.",
      commands: [
        "SELECT query, calls, mean_exec_time, queryid FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;",
        "LOAD 'auto_explain'; SET auto_explain.log_analyze = true;",
        "ANALYZE;",
        "SELECT version();"
      ],
      bestPractices: [
        "Run analyze-in-stages after pg_upgrade",
        "Keep pre-upgrade pg_stat_statements export",
        "Stage upgrade with replay traffic and plan diff",
        "Document temporary GUC overrides with expiry dates"
      ],
    },
  }),

  // ─── mvcc.js: mvcc ─────────────────────────────────────
  buildQuestion({
    id: "pg-mvcc-1",
    trackId: 'postgresql',
    topic: "mvcc",
    file: "mvcc.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Explain PostgreSQL MVCC: xmin, xmax, and tuple visibility rules.",
    sections: {
      interview: "Each row version carries xmin (inserting xact) and xmax (deleting/updating xact). Snapshots compare active xids to determine visibility. Readers never block writers; UPDATE creates new tuple version leaving dead row until vacuum. Transaction isolation uses snapshot export at statement or transaction start.",
      explanation: "Heap tuples store t_xmin/t_xmax in tuple header. CLOG (pg_xact) and commit timestamps track commit status. SnapshotTooOld can occur on long snapshots with aggressive vacuum settings. Repeatable Read and Serializable use same snapshot for transaction duration. HOT updates avoid index changes when updated columns are not indexed and page has space.",
      production: "Support ticket: duplicate key on unique index despite SELECT showing no row — uncommitted INSERT held lock; concurrent session saw invisible tuple. pg_locks showed waiting on RowExclusiveLock. Resolved by shortening idle transactions holding open xacts.",
      followUps: [
        "What is HOT update and when does it fail?",
        "How does pg_snapshot_xmin() relate to vacuum?",
        "Difference between Read Committed and Repeatable Read visibility?",
        "What causes xmin horizon to stall vacuum?"
      ],
      mistakes: [
        "Assuming DELETE frees space immediately without vacuum",
        "Confusing MVCC with undo logs like Oracle",
        "Long idle in transaction blocking vacuum on entire cluster",
        "Not checking xmax for update conflicts in Serializable"
      ],
      seniorInsights: "Interview gold: trace SELECT visibility for one row through concurrent UPDATE and COMMIT. Mention freeze xmin and wraparound — separate but related vacuum concern.",
      commands: [
        "SELECT xmin, xmax, * FROM orders WHERE id = 1;",
        "SELECT txid_current();",
        "SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;",
        "SELECT pg_current_snapshot();"
      ],
      bestPractices: [
        "Keep transactions short to limit dead tuple accumulation",
        "Monitor n_dead_tup via pg_stat_user_tables",
        "Use READ COMMITTED default unless app needs RR semantics",
        "Alert on idle in transaction sessions > 5 minutes"
      ],
    },
  }),
  buildQuestion({
    id: "pg-mvcc-2",
    trackId: 'postgresql',
    topic: "mvcc",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "How do transaction isolation levels affect locking and anomalies in PostgreSQL?",
    sections: {
      interview: "Default READ COMMITTED takes new snapshot per statement — prevents dirty read but allows non-repeatable read. REPEATABLE READ prevents non-repeatable read; phantoms blocked differently than Oracle RR. SERIALIZABLE uses SSI detecting rw-conflicts with 40001 errors.",
      explanation: "RC: each statement sees rows committed before statement start. RR: snapshot at transaction start; concurrent updates to seen rows fail with serialization failure on write. Serializable tracks rw-dependencies. SELECT FOR UPDATE takes row locks regardless of isolation. Advisory locks are application-level.",
      production: "Payment service used RR but did not retry on 40001 — rare double-charge during flash sale. Added ORM retry on serialization_failure. pg_stat_database deadlocks unrelated — conflict was on primary write path.",
      followUps: [
        "When does SELECT FOR UPDATE SKIP LOCKED help?",
        "SSI predicate locking vs traditional 2PL?",
        "How does deferrable READ ONLY avoid snapshot conflicts?",
        "Lock modes for UPDATE vs DELETE?"
      ],
      mistakes: [
        "Using SERIALIZABLE globally without app retry logic",
        "Expecting RR to prevent all phantoms without understanding PG RR",
        "FOR UPDATE on non-indexed column causing seq scan + row lock storm",
        "Mixing isolation levels in same connection pool without SET per transaction"
      ],
      seniorInsights: "Most web apps are fine with READ COMMITTED + explicit locking for inventory. Serializable is for financial invariants — always pair with exponential backoff retry.",
      commands: [
        "SHOW transaction_isolation;",
        "BEGIN ISOLATION LEVEL SERIALIZABLE;",
        "SELECT * FROM pg_locks WHERE NOT granted;",
        "SELECT datname, deadlocks FROM pg_stat_database;"
      ],
      bestPractices: [
        "Document isolation level per service in architecture docs",
        "Implement retry on SQLSTATE 40001 for Serializable",
        "Use SELECT FOR UPDATE for explicit pessimistic paths",
        "Monitor deadlocks via pg_stat_database and log_lock_waits"
      ],
    },
  }),
  buildQuestion({
    id: "pg-mvcc-3",
    trackId: 'postgresql',
    topic: "mvcc",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "What causes \"could not serialize access due to concurrent update\" and how do you resolve it?",
    sections: {
      interview: "Error SQLSTATE 40001 in Serializable or when RR transaction re-reads row modified by concurrent commit. SSI detects dangerous structures between concurrent transactions. Resolution: application retry with backoff, reduce transaction scope, order lock acquisition consistently, or downgrade isolation where invariants allow.",
      explanation: "In RR, UPDATE/DELETE of row changed since snapshot raises 40001. In Serializable, rw-conflicts between concurrent read/write sets trigger rollback of one transaction. High conflict rate signals hot row contention — consider advisory lock per entity or queue serialization.",
      production: "Inventory decrement under Serializable caused 15% transaction failure rate during peak. Switched hot SKU path to SELECT FOR UPDATE in READ COMMITTED — conflicts dropped to near zero, latency predictable.",
      followUps: [
        "Difference between deadlock and serialization failure?",
        "How to log serialization failures?",
        "Does advisory lock participate in SSI?",
        "Impact of prepared statements on retry?"
      ],
      mistakes: [
        "Infinite retry without jitter causing thundering herd",
        "Catching generic Exception instead of 40001 specifically",
        "Using Serializable for read-heavy reporting",
        "Not reducing transaction touch set on hot rows"
      ],
      seniorInsights: "Measure conflict rate before choosing Serializable. Often explicit row lock + RC is simpler and faster than SSI rollback lottery.",
      commands: [
        "SET log_lock_waits = on;",
        "SELECT pg_advisory_xact_lock(hashtext('sku:123'));",
        "BEGIN ISOLATION LEVEL REPEATABLE READ;"
      ],
      bestPractices: [
        "Retry 40001 with exponential backoff capped at 3-5 attempts",
        "Serialize hot row updates via FOR UPDATE or advisory locks",
        "Keep Serializable transactions read-only when possible",
        "Load test isolation choice under peak concurrency"
      ],
    },
  }),
  buildQuestion({
    id: "pg-mvcc-4",
    trackId: 'postgresql',
    topic: "mvcc",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Explain HOT chains, line pointer redirection, and index bloat from non-HOT updates.",
    sections: {
      interview: "HOT (Heap Only Tuple): when UPDATE does not change indexed columns and same page has free space, new row version stays on page with HOT chain via ctid redirect. Index entries still point to chain head — no new index tuples. Non-HOT UPDATE when indexed column changes or page full causes index bloat.",
      explanation: "HOT reduces index write amplification on frequently updated non-indexed columns. pg_stat_user_tables n_tup_hot_upd tracks HOT ratio. REINDEX needed when index bloat exceeds benefit. fillfactor < 100 reserves page space for HOT.",
      production: "User sessions table updated last_active every 30s on indexed user_id PK — HOT ratio 0%, indexes 3× table size. Dropped redundant index, SET fillfactor=80, moved last_active to side table. n_tup_hot_upd rose to 85%.",
      followUps: [
        "How to detect HOT failure in pageinspect?",
        "fillfactor trade-offs for insert-heavy tables?",
        "BRIN and HOT interaction?",
        "Does VACUUM FULL rebuild HOT chains?"
      ],
      mistakes: [
        "Indexing every column on high-update tables",
        "fillfactor=100 on session/heartbeat tables",
        "Ignoring n_tup_hot_upd metric",
        "REINDEX CONCURRENTLY without fixing update pattern"
      ],
      seniorInsights: "Schema design beats tuning: separate volatile columns to side table without indexes on hot path.",
      commands: [
        "SELECT relname, n_tup_upd, n_tup_hot_upd FROM pg_stat_user_tables WHERE relname = 'sessions';",
        "ALTER TABLE sessions SET (fillfactor = 80);",
        "SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) FROM pg_stat_user_indexes WHERE relname = 'sessions';"
      ],
      bestPractices: [
        "Monitor HOT update ratio on high-churn tables",
        "Avoid indexing columns updated every request",
        "Use fillfactor 70-90 on update-heavy heaps",
        "Split volatile attributes to narrow side tables"
      ],
    },
  }),
  buildQuestion({
    id: "pg-mvcc-5",
    trackId: 'postgresql',
    topic: "mvcc",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "How does PostgreSQL handle transaction ID wraparound and freeze operations?",
    sections: {
      interview: "XIDs are 32-bit; vacuum FREEZE marks old tuples frozen so they remain visible forever without xid comparison. autovacuum triggers anti-wraparound when relfrozenxid ages. Emergency autovacuum runs at high cost delay zero. Failure to freeze before limit causes shutdown to protect data integrity.",
      explanation: "pg_class.relfrozenxid tracks oldest unfrozen xid per relation. age(datfrozenxid) in pg_database shows cluster-wide risk. vacuum freeze updates relfrozenxid. multixact has separate wraparound via pg_multixact.",
      production: "Monitoring alert: datfrozenxid age 1.8B on 9-year-old cluster — emergency VACUUM FREEZE on largest tables during maintenance window. autovacuum_freeze_max_age lowered proactively post-incident.",
      followUps: [
        "vacuum freeze vs vacuum full?",
        "Impact of long-running transactions on freeze cutoff?",
        "How do prepared transactions affect freeze?",
        "Replication slots holding xmin preventing freeze?"
      ],
      mistakes: [
        "Disabling autovacuum on high-churn tables",
        "Ignoring age(relfrozenxid) in monitoring",
        "Assuming pg_repack eliminates wraparound risk without freeze",
        "Replication slots holding xmin preventing freeze progress"
      ],
      seniorInsights: "Wraparound is rare on modern autovacuum but catastrophic — include datfrozenxid age in every dashboard.",
      commands: [
        "SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY 2 DESC;",
        "SELECT relname, age(relfrozenxid) FROM pg_class WHERE relkind = 'r' ORDER BY 2 DESC LIMIT 10;",
        "VACUUM (FREEZE, VERBOSE) large_table;",
        "SELECT * FROM pg_prepared_xacts;"
      ],
      bestPractices: [
        "Alert datfrozenxid age > 500M",
        "Never disable autovacuum globally",
        "Resolve orphaned prepared transactions promptly",
        "Include freeze progress in major maintenance runbooks"
      ],
    },
  }),

  // ─── mvcc.js: wal ─────────────────────────────────────
  buildQuestion({
    id: "pg-wal-1",
    trackId: 'postgresql',
    topic: "wal",
    file: "mvcc.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "What is PostgreSQL WAL and why is it critical for durability and recovery?",
    sections: {
      interview: "Write-Ahead Log records all data changes before reaching data files — crash recovery replays WAL from last checkpoint. WAL enables PITR, streaming replication, and logical decoding. pg_wal stores 16MB segments; wal_level controls content (minimal, replica, logical).",
      explanation: "Every commit waits for WAL flush to disk (wal_sync_method, synchronous_commit). Checkpoint records consistent recovery start point. full_page_writes protects against partial page writes after crash. wal_compression reduces segment size. archive_command ships completed segments to durable storage.",
      production: "Primary disk full on pg_wal — 500GB WAL accumulated because archive_command failed silently. Replication slots held segments. Fixed IAM role, added alert on pg_wal directory size > 100GB.",
      followUps: [
        "Difference between wal_level replica and logical?",
        "What triggers checkpoint?",
        "How does synchronous_commit=off affect RPO?",
        "WAL vs heap write ordering?"
      ],
      mistakes: [
        "Placing pg_wal on slow network storage without testing",
        "wal_level=minimal on replicas needing hot standby",
        "Ignoring archive_command non-zero exit in logs",
        "Manual rm on pg_wal files"
      ],
      seniorInsights: "WAL is the spine of PostgreSQL HA — trace commit → WAL insert → flush → bgwriter dirty pages.",
      commands: [
        "SELECT pg_current_wal_lsn();",
        "SELECT * FROM pg_stat_wal;",
        "SHOW wal_level;"
      ],
      bestPractices: [
        "Monitor pg_wal disk separately from data",
        "Test archive_command recovery monthly",
        "Set wal_level=replica minimum for HA",
        "Alert on pg_stat_archiver failed_count"
      ],
    },
  }),
  buildQuestion({
    id: "pg-wal-2",
    trackId: 'postgresql',
    topic: "wal",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Explain checkpoint tuning: max_wal_size, checkpoint_timeout, and checkpoint_completion_target.",
    sections: {
      interview: "Checkpoints flush dirty buffers and create recovery starting point. max_wal_size triggers checkpoint when WAL generated exceeds threshold. checkpoint_timeout is time-based cap. checkpoint_completion_target spreads dirty writes over checkpoint interval reducing IO spikes.",
      explanation: "Default max_wal_size 1GB often too low for write-heavy workloads — frequent checkpoints increase WAL volume via full_page_writes. Raising max_wal_size to 4-8GB spreads checkpoints; pair with checkpoint_completion_target=0.9. pg_stat_bgwriter buffers_checkpoint reveals spike severity.",
      production: "Replica lag spiked every 5 min correlating with checkpoint. Raised max_wal_size from 1GB to 8GB, checkpoint_completion_target 0.9; spike IO dropped 60%, replay lag stabilized.",
      followUps: [
        "Impact of checkpoint on replication lag?",
        "What is immediate checkpoint vs scheduled?",
        "How does full_page_writes interact with checkpoint frequency?",
        "pg_checkpoint view in PG 15+?"
      ],
      mistakes: [
        "max_wal_size huge without recovery time analysis",
        "checkpoint_completion_target=0 without spreading writes",
        "Ignoring pg_stat_bgwriter after storage migration",
        "Disabling full_page_writes to reduce WAL"
      ],
      seniorInsights: "Checkpoint tuning is IO smoothing — graph buffers_checkpoint against replica lag.",
      commands: [
        "SELECT * FROM pg_stat_bgwriter;",
        "SELECT name, setting FROM pg_settings WHERE name LIKE 'checkpoint%' OR name LIKE '%wal_size%';"
      ],
      bestPractices: [
        "Tune max_wal_size based on write throughput benchmarks",
        "Use checkpoint_completion_target 0.9 on cloud disks",
        "Monitor checkpoint duration after major tuning changes",
        "Document expected recovery time with chosen WAL sizes"
      ],
    },
  }),
  buildQuestion({
    id: "pg-wal-3",
    trackId: 'postgresql',
    topic: "wal",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "How do you diagnose and fix WAL disk full conditions?",
    sections: {
      interview: "WAL segments accumulate when archive_command fails, replication slots lag without consumption, or long pg_basebackup holds xmin. PostgreSQL stops accepting writes when pg_wal partition fills. Check pg_ls_waldir size, pg_replication_slots retained_wal, pg_stat_archiver, and standby replay lag.",
      explanation: "Each slot prevents removal of WAL until consumer advances confirmed_flush_lsn. inactive slot on dropped replica is classic leak. wal_keep_size retains extra WAL. max_slot_wal_keep_size limits retention per slot.",
      production: "Dev left replication slot \"test_slot\" after local replica deleted — 400GB WAL in 48h, primary read-only. Dropped slot; WAL recycled within hour.",
      followUps: [
        "Difference between pg_current_wal_lsn and insert_lsn?",
        "How does wal_keep_size differ from slot retention?",
        "Can you relocate pg_wal to separate mount?",
        "pg_wal_summary view usage?"
      ],
      mistakes: [
        "Creating slots without monitoring or TTL policy",
        "Ignoring pg_stat_archiver.last_failed_time",
        "Deleting WAL files manually to free space",
        "No separate filesystem for pg_wal on write-heavy systems"
      ],
      seniorInsights: "Runbook: WAL full → check slots → check archiver → check lagging standby → never rm WAL.",
      commands: [
        "SELECT slot_name, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained FROM pg_replication_slots;",
        "SELECT * FROM pg_stat_archiver;"
      ],
      bestPractices: [
        "Separate pg_wal mount with 20%+ headroom",
        "Alert on replication slot inactive with retained WAL",
        "Automate archive failure paging",
        "Set max_slot_wal_keep_size to bound slot bloat"
      ],
    },
  }),
  buildQuestion({
    id: "pg-wal-4",
    trackId: 'postgresql',
    topic: "wal",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Compare synchronous_commit settings and their impact on RPO and latency.",
    sections: {
      interview: "synchronous_commit=on (default): commit waits for WAL flush — durable on single node. remote_write waits for standby to receive WAL; remote_apply waits for apply. off/local: commit returns after WAL written to buffer — faster but RPO window on crash.",
      explanation: "synchronous_standby_names controls which standbys count for quorum (FIRST n or ANY n). pg_stat_replication sync_state shows sync/async. Group commit batches multiple commits per WAL flush even with sync on.",
      production: "Analytics batch loader set synchronous_commit=local in session — 40% throughput gain acceptable for staging table truncated nightly. Production OLTP kept default on via role GUC.",
      followUps: [
        "Quorum vs ANY in synchronous_standby_names?",
        "Impact on logical replication?",
        "Measuring commit latency?",
        "Difference remote_write vs sync rep replay lag?"
      ],
      mistakes: [
        "Global synchronous_commit=off on financial OLTP",
        "Expecting sync replica without synchronous_standby_names configured",
        "Not testing failover RPO after sync policy change",
        "Confusing remote_write with sync rep replay lag SLA"
      ],
      seniorInsights: "Map business RPO to GUC: financial ledger = on + sync standby; clickstream buffer = local acceptable.",
      commands: [
        "SHOW synchronous_commit;",
        "SELECT application_name, sync_state, sync_priority FROM pg_stat_replication;",
        "SELECT name, setting FROM pg_settings WHERE name LIKE 'synchronous%';"
      ],
      bestPractices: [
        "Document RPO per workload and matching commit settings",
        "Use sync standbys for zero-RPO failover targets",
        "Never set synchronous_commit=off globally without review",
        "Test primary crash recovery with chosen settings"
      ],
    },
  }),
  buildQuestion({
    id: "pg-wal-5",
    trackId: 'postgresql',
    topic: "wal",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Design WAL archiving and monitoring for cross-region disaster recovery.",
    sections: {
      interview: "Archive completed WAL via archive_command to S3/GCS with immutable versioning. Combine nightly pg_basebackup + continuous WAL for PITR. Monitor lag between pg_current_wal_lsn and last archived segment. DR restore: fetch base backup, replay WAL to target time via recovery.signal and restore_command.",
      explanation: "archive_mode=on, archive_command copies segments to object store. wal-g and pgBackRest automate base backup + WAL push. Cross-region: async replication for RPO minutes + WAL archive for RPO seconds on regional loss.",
      production: "Regional outage simulation: restored to DR region using wal-g backup 6h old + WAL replay to T-2min. RTO 90 min dominated by parallel restore of 2TB base.",
      followUps: [
        "pg_combinebackup vs traditional restore?",
        "How to validate WAL integrity before restore?",
        "Impact of encryption on archive throughput?",
        "recovery.signal vs recovery.conf PG 12+?"
      ],
      mistakes: [
        "Archive to same region/account as primary — loses DR value",
        "No restore drills — discovered corrupt base backup at real DR",
        "Missing timeline history files in archive",
        "Underestimating WAL replay time in RTO calc"
      ],
      seniorInsights: "DR architecture answer needs numbers: RPO from sync+archive, RTO from last restore drill.",
      commands: [
        "SELECT * FROM pg_stat_archiver;",
        "pgbackrest info",
        "touch $PGDATA/recovery.signal;"
      ],
      bestPractices: [
        "Automate restore drills to secondary region quarterly",
        "Store WAL in immutable object storage separate from primary",
        "Monitor archive lag and failed_count continuously",
        "Document timeline and target LSN recovery procedures"
      ],
    },
  }),

  // ─── mvcc.js: vacuum ─────────────────────────────────────
  buildQuestion({
    id: "pg-vacuum-1",
    trackId: 'postgresql',
    topic: "vacuum",
    file: "mvcc.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "What does VACUUM do in PostgreSQL and why is it not optional?",
    sections: {
      interview: "VACUUM reclaims dead tuple space from UPDATE/DELETE, updates visibility map for index-only scans, advances freeze cutoff, and updates planner statistics (with ANALYZE option). It does not block normal reads/writes unlike VACUUM FULL which rewrites tables exclusively.",
      explanation: "Dead tuples remain until vacuum marks space reusable within pages. Visibility map bits enable index-only scans when all tuples on page visible. vacuum_cost_delay throttles IO. Manual VACUUM needed when autovacuum cannot keep up or before DDL requiring low bloat.",
      production: "Orders table 80GB with 40% dead tuples — sequential scans 10× slower. pg_stat_user_tables showed n_dead_tup=32M, last_autovacuum NULL for 2 weeks (autovacuum disabled on table). VACUUM ANALYZE orders; latency normalized.",
      followUps: [
        "VACUUM vs VACUUM FULL vs pg_repack?",
        "What is visibility map?",
        "Does vacuum reclaim space to OS?",
        "Impact of vacuum on replication slots xmin?"
      ],
      mistakes: [
        "Running VACUUM FULL on production without maintenance window",
        "Disabling autovacuum on \"critical\" tables — opposite of intent",
        "Expecting VACUUM to shrink disk file size to OS",
        "Not vacuuming after massive DELETE before peak traffic"
      ],
      seniorInsights: "Vacuum is garbage collection — treat n_dead_tup ratio as SLA metric. VACUUM FULL is last resort; pg_repack preferred for online rewrite.",
      commands: [
        "VACUUM (VERBOSE, ANALYZE) orders;",
        "SELECT relname, n_live_tup, n_dead_tup, round(100.0*n_dead_tup/nullif(n_live_tup+n_dead_tup,0),2) AS dead_pct FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;",
        "SELECT * FROM pg_stat_progress_vacuum;"
      ],
      bestPractices: [
        "Never disable autovacuum globally or on high-churn tables",
        "Monitor dead tuple ratio per table",
        "Use pg_repack instead of VACUUM FULL when online shrink needed",
        "Schedule manual VACUUM after bulk deletes"
      ],
    },
  }),
  buildQuestion({
    id: "pg-vacuum-2",
    trackId: 'postgresql',
    topic: "vacuum",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Explain vacuum freeze, visibility map, and free space map (FSM).",
    sections: {
      interview: "Freeze marks tuples with xmin older than vacuum_freeze_min_age as frozen — immune to xid wraparound comparison. Visibility map tracks all-visible and all-frozen pages enabling index-only scans and skipping freeze checks. FSM tracks free space within pages for INSERT/UPDATE placement.",
      explanation: "All-visible pages allow index-only scans without heap visit when visibility map bit set. FSM stored in separate fork; VACUUM updates FSM with reclaimable space. pg_visibility extension inspects map. Aggressive freeze during anti-wraparound vacuum can increase IO.",
      production: "Index-only scan never chosen on events table — visibility map never set because long-running reporting transaction held snapshot. pg_stat_activity showed 6h idle in transaction on read replica connection to primary. Killed session; next vacuum set all-visible bits; IO dropped 30%.",
      followUps: [
        "How does vacuum_freeze_table_age trigger aggressive freeze?",
        "Can FSM be corrupted and how to detect?",
        "Index-only scan prerequisites?",
        "Impact of fillfactor on FSM?"
      ],
      mistakes: [
        "Long snapshots preventing all-visible page marking",
        "Ignoring index-only scan opportunities after vacuum",
        "Assuming freeze eliminates need for regular vacuum",
        "Not monitoring pg_stat_all_tables last_vacuum freeze stats"
      ],
      seniorInsights: "Index-only scan is free performance when VM bits set — debug why vacuum cannot set them (long xact, lock).",
      commands: [
        "CREATE EXTENSION pg_visibility;",
        "SELECT * FROM pg_visibility_map('events'::regclass) LIMIT 5;",
        "EXPLAIN SELECT id FROM events WHERE created_at > now()-interval '1 day';"
      ],
      bestPractices: [
        "Kill or timeout idle in transaction sessions",
        "Verify index-only scans on large indexed tables post-vacuum",
        "Monitor wraparound age alongside regular vacuum",
        "Use pg_stat_progress_vacuum during long runs"
      ],
    },
  }),
  buildQuestion({
    id: "pg-vacuum-3",
    trackId: 'postgresql',
    topic: "vacuum",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "When should you use VACUUM FULL versus pg_repack versus routine VACUUM?",
    sections: {
      interview: "Routine VACUUM reclaims space within pages without exclusive lock — use continuously via autovacuum. VACUUM FULL rewrites entire table with ACCESS EXCLUSIVE lock — shrinks file to OS but blocks all access. pg_repack rewrites online using triggers/logs with brief lock at end.",
      explanation: "Bloat from non-HOT updates leaves pages underfilled — routine vacuum cannot compact pages, only reuse space. pg_repack needs primary key and free disk ~ table size. VACUUM FULL simpler but unacceptable downtime on large OLTP tables. pg_squeeze and pg_repack are alternatives.",
      production: "30GB table bloat after archive delete — VACUUM reduced dead tuples but file size unchanged at 30GB. pg_repack -t archive_events during low traffic; file shrunk to 8GB with 2-minute exclusive lock at swap.",
      followUps: [
        "Does pg_repack work on partitioned tables?",
        "REINDEX CONCURRENTLY vs vacuum for index bloat?",
        "How to measure bloat without pgstattuple?",
        "Cloud managed PG bloat options?"
      ],
      mistakes: [
        "VACUUM FULL on multi-TB table during business hours",
        "pg_repack without disk space for copy",
        "Routine vacuum expecting OS-level shrink",
        "Ignoring toast table bloat separately"
      ],
      seniorInsights: "Present decision tree: dead tuples → VACUUM; page density → pg_repack; emergency shrink + downtime OK → VACUUM FULL.",
      commands: [
        "CREATE EXTENSION pgstattuple;",
        "SELECT * FROM pgstattuple('archive_events');",
        "pg_repack -d appdb -t archive_events",
        "VACUUM FULL VERBOSE archive_events; -- maintenance only"
      ],
      bestPractices: [
        "Prefer pg_repack for online bloat remediation",
        "Measure bloat with pgstattuple before choosing tool",
        "Ensure 2× table size free disk for repack",
        "Schedule VACUUM FULL only with explicit downtime approval"
      ],
    },
  }),
  buildQuestion({
    id: "pg-vacuum-4",
    trackId: 'postgresql',
    topic: "vacuum",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Common",
    role: "DBA",
    question: "How does vacuum interact with replication slots, hot standby, and conflict resolution?",
    sections: {
      interview: "Vacuum on primary removes dead tuples still needed by standby queries — catalog_xmin held by slot or hot standby feedback prevents cleanup causing bloat. Standby max_standby_streaming_delay can cancel long queries conflicting with vacuum cleanup. Logical slots hold xmin until consumed.",
      explanation: "Replication slot pg_replication_slots.catalog_xmin shows oldest xmin slot needs. hot_standby_feedback sends standby xmin to primary delaying vacuum. Conflicts on standby: snapshot too old if vacuum removed rows standby query needs. Monitor pg_stat_database_conflicts on standby.",
      production: "Logical replication slot on CDC pipeline stalled 48h — primary orders table bloat 60GB. catalog_xmin frozen by unconsumed slot. Consumer caught up; VACUUM reclaimed space. Added max_slot_wal_keep_size and consumer lag alert.",
      followUps: [
        "hot_standby_feedback trade-offs?",
        "vacuum_defer_cleanup_age purpose?",
        "Logical vs physical slot xmin behavior?",
        "Canceling standby queries vs primary bloat?"
      ],
      mistakes: [
        "hot_standby_feedback=on without monitoring primary bloat",
        "Orphan logical replication slots after consumer decommission",
        "Ignoring pg_stat_database_conflicts on replicas",
        "max_standby_streaming_delay=-1 allowing unlimited bloat"
      ],
      seniorInsights: "CDC slots are vacuum enemies — treat consumer lag as primary storage incident. Cap slot retention and page on catalog_xmin age.",
      commands: [
        "SELECT slot_name, catalog_xmin, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) FROM pg_replication_slots;",
        "SELECT * FROM pg_stat_database_conflicts WHERE datname = current_database();",
        "SHOW hot_standby_feedback;"
      ],
      bestPractices: [
        "Monitor catalog_xmin age per replication slot",
        "Set max_slot_wal_keep_size and consumer lag SLOs",
        "Use hot_standby_feedback judiciously with bloat alerts",
        "Drop unused slots immediately"
      ],
    },
  }),
  buildQuestion({
    id: "pg-vacuum-5",
    trackId: 'postgresql',
    topic: "vacuum",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Database Engineer",
    question: "Troubleshoot a table where vacuum never completes or constantly restarts.",
    sections: {
      interview: "Check pg_stat_progress_vacuum for phase and dead tuples remaining. Causes: infinite update churn on same pages, lock conflicts, wraparound vacuum competing, very large table with high cost delay, or blocked by long transaction xmin horizon. pg_locks shows blocking.",
      explanation: "Vacuum cannot truncate line pointers if xmin horizon blocked by idle transaction or slot. Constant updates on same rows create churn — vacuum never catches up. Reduce autovacuum_vacuum_cost_delay or increase autovacuum_max_workers temporarily. Consider partitioning hot append-only tables.",
      production: "Heartbeat table updated every second — autovacuum ran continuously, never finishing, CPU 30% vacuum. Fixed by UNLOGGED side table for heartbeats + periodic merge, and fillfactor=50 on main table.",
      followUps: [
        "What are vacuum phases in pg_stat_progress_vacuum?",
        "autovacuum_work_mem impact on large tables?",
        "Partitioning to isolate vacuum scope?",
        "Deadlock during vacuum freeze?"
      ],
      mistakes: [
        "Increasing cost delay when vacuum cannot keep up — wrong direction",
        "Not identifying update churn root cause",
        "Killing vacuum thinking it helps — worsens bloat",
        "Single monolithic table for high-frequency updates"
      ],
      seniorInsights: "If vacuum always active on one table, schema is wrong — partition or offload volatile columns before tuning GUCs forever.",
      commands: [
        "SELECT * FROM pg_stat_progress_vacuum;",
        "SELECT pid, state, xact_start, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY xact_start LIMIT 10;",
        "SELECT pg_blocking_pids(pid) FROM pg_stat_activity WHERE query LIKE '%vacuum%';"
      ],
      bestPractices: [
        "Architect away from single-row high-frequency update antipattern",
        "Watch pg_stat_progress_vacuum during incidents",
        "Resolve xmin horizon blockers before forcing vacuum",
        "Partition largest churn tables"
      ],
    },
  }),

  // ─── mvcc.js: autovacuum ─────────────────────────────────────
  buildQuestion({
    id: "pg-autovacuum-1",
    trackId: 'postgresql',
    topic: "autovacuum",
    file: "mvcc.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "How does autovacuum decide when to vacuum and analyze a table?",
    sections: {
      interview: "Autovacuum launcher forks workers when dead tuple count exceeds autovacuum_vacuum_scale_factor × reltuples + autovacuum_vacuum_threshold (similar formula for analyze). Anti-wraparound vacuum triggers regardless when relfrozenxid age exceeds autovacuum_freeze_max_age. Per-table settings via ALTER TABLE storage parameters override globals.",
      explanation: "Default scale factor 0.2 means 20% dead tuples before vacuum — too lazy for large tables (10M rows → 2M dead). Set autovacuum_vacuum_scale_factor=0.01 on hot tables. autovacuum_analyze_scale_factor controls stats refresh. pg_stat_user_tables last_autovacuum shows activity.",
      production: "10M row inventory table waited for 2M dead tuples before vacuum — caused periodic latency spikes. ALTER TABLE inventory SET (autovacuum_vacuum_scale_factor = 0.02, autovacuum_analyze_scale_factor = 0.01); spikes eliminated.",
      followUps: [
        "How many autovacuum workers default?",
        "autovacuum_vacuum_insert_scale_factor PG 13+?",
        "Does autovacuum run during replication?",
        "log_autovacuum_min_duration usage?"
      ],
      mistakes: [
        "Leaving default 0.2 scale factor on million-row OLTP tables",
        "Disabling autovacuum globally via autovacuum=off",
        "Not setting per-table params on append-heavy fact tables",
        "Ignoring anti-wraparound vacuum in monitoring"
      ],
      seniorInsights: "Formula interview answer: threshold + scale_factor × n_live_tup. Always give numeric example for 50M row table.",
      commands: [
        "SELECT relname, reloptions FROM pg_class WHERE relname = 'inventory';",
        "SELECT name, setting FROM pg_settings WHERE name LIKE 'autovacuum%';",
        "ALTER TABLE inventory SET (autovacuum_vacuum_scale_factor = 0.02);"
      ],
      bestPractices: [
        "Lower scale factor on large high-churn tables",
        "Enable log_autovacuum_min_duration to log slow vacuums",
        "Never disable autovacuum except brief debugging with ticket",
        "Document per-table autovacuum overrides in schema"
      ],
    },
  }),
  buildQuestion({
    id: "pg-autovacuum-2",
    trackId: 'postgresql',
    topic: "autovacuum",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Tune autovacuum for high-write OLTP workloads without starving the database.",
    sections: {
      interview: "Increase autovacuum_max_workers (requires max_worker_processes headroom), reduce autovacuum_vacuum_cost_delay (or set to 0 for aggressive), raise autovacuum_vacuum_cost_limit, and set maintenance_work_mem higher for vacuum sort phases. Per-table scale factors more impactful than global knobs.",
      explanation: "Vacuum cost based on page reads/writes/delay; defaults throttle heavily on busy systems. autovacuum_naptime controls launcher frequency. Too aggressive autovacuum competes with OLTP IO — monitor pg_stat_bgwriter and disk latency. RDS Parameter groups expose same GUCs with limits.",
      production: "Flash sale write storm — dead tuples piled faster than autovacuum. Temporarily set autovacuum_vacuum_cost_delay=0 and autovacuum_max_workers=6 on primary; reverted post-event. Added per-table tuning on orders and order_items.",
      followUps: [
        "maintenance_work_mem vs autovacuum_work_mem PG 16+?",
        "IO concurrency and autovacuum on SSD?",
        "Does autovacuum hold locks that block OLTP?",
        "autovacuum worker per database limit?"
      ],
      mistakes: [
        "autovacuum_max_workers=10 without max_worker_processes increase",
        "Permanent cost_delay=0 on IO-saturated disk",
        "Tuning globals instead of per-table on one problematic relation",
        "Ignoring autovacuum duration in logs"
      ],
      seniorInsights: "Autovacuum tuning is table-specific first. Global aggression is for incidents only — revert and fix scale factors.",
      commands: [
        "ALTER SYSTEM SET autovacuum_max_workers = 5;",
        "ALTER SYSTEM SET autovacuum_vacuum_cost_delay = 2;",
        "SELECT pg_reload_conf();",
        "SELECT * FROM pg_stat_progress_vacuum;"
      ],
      bestPractices: [
        "Tune per-table before global GUC changes",
        "Correlate autovacuum with disk IO metrics",
        "Revert temporary aggressive settings post-incident",
        "Size maintenance_work_mem for largest table vacuum needs"
      ],
    },
  }),
  buildQuestion({
    id: "pg-autovacuum-3",
    trackId: 'postgresql',
    topic: "autovacuum",
    file: "mvcc.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Diagnose \"autovacuum not keeping up\" on a production cluster.",
    sections: {
      interview: "Check pg_stat_user_tables n_dead_tup vs n_live_tup, last_autovacuum timestamps, pg_stat_progress_vacuum active workers, blocked xmin from pg_stat_activity and pg_replication_slots, and autovacuum settings. Compare vacuum rate to update/delete rate from pg_stat_user_tables n_tup_upd/n_tup_del.",
      explanation: "Common root causes: autovacuum disabled on table, scale factor too high, all workers busy on other tables, replication slot blocking cleanup, vacuum cost throttling, or table too large for naptime cycle. pg_stat_bgwriter and OS IO wait indicate resource starvation.",
      production: "Dashboard showed autovacuum workers always busy but events table n_dead_tup growing. Five workers vacuuming small dimension tables; events had no per-table tuning. Set storage params on events, increased max_workers to 4, dead ratio stabilized under 5%.",
      followUps: [
        "How to prioritize which table to tune first?",
        "pg_prewarm interaction with autovacuum?",
        "Autovacuum on standby PG 13+?",
        "toast table autovacuum separately?"
      ],
      mistakes: [
        "Adding indexes instead of fixing vacuum backlog",
        "Manual VACUUM FULL as first response",
        "Not checking replication slot catalog_xmin",
        "Assuming more CPU fixes IO-bound vacuum"
      ],
      seniorInsights: "Rank tables by n_dead_tup × seq_scan count from pg_stat_user_tables — highest impact first.",
      commands: [
        "SELECT relname, n_dead_tup, n_live_tup, last_autovacuum, last_autoanalyze FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 15;",
        "SELECT count(*) FROM pg_stat_progress_vacuum;",
        "SELECT slot_name, catalog_xmin FROM pg_replication_slots;"
      ],
      bestPractices: [
        "Dashboard dead tuple ratio top 20 tables",
        "Alert last_autovacuum > 24h on high-churn tables",
        "Review slot xmin during vacuum incidents",
        "Capacity plan autovacuum workers with table count"
      ],
    },
  }),
  buildQuestion({
    id: "pg-autovacuum-4",
    trackId: 'postgresql',
    topic: "autovacuum",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Common",
    role: "DBA",
    question: "Explain anti-wraparound autovacuum and emergency vacuum behavior.",
    sections: {
      interview: "When relfrozenxid age approaches autovacuum_freeze_max_age (default 200M), autovacuum triggers aggressive anti-wraparound vacuum with zero cost delay, even on large tables, to advance relfrozenxid. If age exceeds vacuum_freeze_table_age, vacuum marks table urgently. Catastrophic age forces shutdown.",
      explanation: "Anti-wraparound vacuum can IO-saturate disk and contend with OLTP. vacuum_freeze_min_age and vacuum_freeze_table_age control urgency. multixact has parallel autovacuum_multixact_freeze_max_age. Monitor age(relfrozenxid) proactively — do not wait for emergency.",
      production: "Alert at age 150M triggered planned VACUUM FREEZE on top 5 tables over weekend. Avoided emergency autovacuum during Monday peak that previously caused 40% latency increase.",
      followUps: [
        "Difference vacuum_freeze_min_age vs autovacuum_freeze_max_age?",
        "Can anti-wraparound be deferred?",
        "Impact on logical replication during freeze vacuum?",
        "pg_resetxlog never for wraparound — why?"
      ],
      mistakes: [
        "No datfrozenxid monitoring until emergency",
        "Long prepared xacts blocking freeze",
        "Assuming regular vacuum always advances relfrozenxid enough",
        "Disabling autovacuum on large old tables"
      ],
      seniorInsights: "Wraparound vacuum is the database saving itself — your job is never reaching it via proactive freeze monitoring.",
      commands: [
        "SELECT relname, age(relfrozenxid) AS freeze_age FROM pg_class WHERE relkind='r' ORDER BY 2 DESC LIMIT 10;",
        "SELECT datname, age(datfrozenxid) FROM pg_database;",
        "VACUUM (FREEZE) critical_table;"
      ],
      bestPractices: [
        "Alert relfrozenxid age at 50% of autovacuum_freeze_max_age",
        "Schedule proactive freeze vacuums on largest tables",
        "Clear prepared xacts and stale slots blocking freeze",
        "Include wraparound metrics in weekly DBA review"
      ],
    },
  }),
  buildQuestion({
    id: "pg-autovacuum-5",
    trackId: 'postgresql',
    topic: "autovacuum",
    file: "mvcc.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Design autovacuum monitoring and alerting strategy for 500+ table RDS PostgreSQL fleet.",
    sections: {
      interview: "Export pg_stat_user_tables metrics via postgres_exporter: n_dead_tup ratio, last_autovacuum age, autovacuum_count, table size. Alert thresholds per size tier. Track datfrozenxid age cluster-wide. Correlate with Performance Insights IO spikes and replication slot lag. Automate per-table tuning via Terraform postgrestablers.",
      explanation: "Fleet-wide: Prometheus recording rules for max dead ratio, tables without autovacuum in 7 days, freeze age max. RDS lacks pg_repack — plan table maintenance windows. Use pg_cron for off-peak VACUUM on known problem tables. CloudWatch alarms on FreeStorageSpace and ReplicationSlotDiskUsage.",
      production: "Implemented Datadog monitors on custom query max(dead_pct) by database — paged when >15% on any table >10GB. Reduced Sev2 incidents 70%. Per-table autovacuum params stored in schema migration repo.",
      followUps: [
        "postgres_exporter autovacuum metrics?",
        "RDS autovacuum limits by instance class?",
        "Aurora vs RDS autovacuum differences?",
        "Automating ALTER TABLE SET autovacuum via migration?"
      ],
      mistakes: [
        "Single global dead tuple threshold for 1KB vs 1TB tables",
        "No freeze age monitoring on managed PG",
        "Ignoring toast bloat in fleet dashboards",
        "Alert fatigue without severity tiers by table criticality"
      ],
      seniorInsights: "Fleet strategy: tier tables by size and business criticality — different thresholds and runbooks per tier.",
      commands: [
        "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)), n_dead_tup FROM pg_stat_user_tables WHERE pg_total_relation_size(relid) > 10737418240 ORDER BY n_dead_tup DESC;",
        "SELECT datname, age(datfrozenxid) FROM pg_database;"
      ],
      bestPractices: [
        "Tiered alerting by table size and criticality",
        "Automate autovacuum params in schema migrations",
        "Weekly report top 10 bloated tables per database",
        "Integrate slot lag with autovacuum dashboards"
      ],
    },
  }),

  // ─── replication.js: streaming-replication ─────────────────────────────────────
  buildQuestion({
    id: "pg-streaming-replication-1",
    trackId: 'postgresql',
    topic: "streaming-replication",
    file: "replication.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "How does PostgreSQL streaming replication work between primary and standby?",
    sections: {
      interview: "Standby connects to primary walsender process; primary streams WAL records as they are generated. Standby walreceiver writes to pg_wal and startup process replays via recovery. Synchronous mode waits for standby flush/apply per synchronous_standby_names. Replication uses physical WAL — byte-for-byte replica.",
      explanation: "Primary pg_stat_replication shows connected standbys, sent_lsn, write_lag, flush_lag, replay_lag. Standby hot_standby=on allows read queries during recovery. recovery_min_apply_delay can lag apply intentionally. Cascading replication: standby feeds downstream standbys.",
      production: "New standby provisioned via pg_basebackup -R -X stream -C -S standby1; slot ensured WAL retention during catch-up. pg_stat_replication replay_lag stabilized under 200ms after initial sync.",
      followUps: [
        "Difference sent_lsn vs replay_lsn?",
        "How to add standby without downtime?",
        "Hot standby feedback purpose?",
        "Cascading vs direct replication?"
      ],
      mistakes: [
        "No replication slot during pg_basebackup catch-up — WAL removed",
        "promote standby without checking timeline divergence",
        "Monitoring only flush_lag ignoring replay_lag on hot standby queries",
        "max_wal_senders too low blocking new standbys"
      ],
      seniorInsights: "Always create physical replication slot named per standby. replay_lag is what users feel on read replicas.",
      commands: [
        "SELECT application_name, state, sync_state, sent_lsn, replay_lsn, replay_lag FROM pg_stat_replication;",
        "pg_basebackup -h primary -D /var/lib/pgsql/standby -U replicator -Fp -Xs -P -R",
        "SELECT pg_create_physical_replication_slot('standby1');"
      ],
      bestPractices: [
        "Use replication slots for each standby",
        "Monitor replay_lag not just connection state",
        "Automate standby provisioning with pg_basebackup",
        "Test promotion procedure quarterly"
      ],
    },
  }),
  buildQuestion({
    id: "pg-streaming-replication-2",
    trackId: 'postgresql',
    topic: "streaming-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Diagnose and reduce replication lag on a hot standby.",
    sections: {
      interview: "Measure write_lag, flush_lag, replay_lag in pg_stat_replication. Causes: standby IO slower than primary WAL generation, long queries blocking recovery, insufficient wal_receiver/wal_writer, network bandwidth, or hot standby conflicts. Check pg_stat_database_conflicts and standby pg_is_in_recovery().",
      explanation: "Replay is single-threaded for WAL apply — CPU rarely bottleneck; IO and lock conflicts are. standby max_standby_streaming_delay cancels queries blocking recovery. wal_compression on primary reduces network. pg_wal_receiver_status on standby shows receive rate.",
      production: "Replica replay_lag climbed to 30s during primary checkpoint spikes. Standby on gp2 with low IOPS; migrated to io2 with 16k IOPS, added recovery_prefetch (PG 15), lag dropped to sub-second.",
      followUps: [
        "recovery_prefetch and wal_decode in PG 15+?",
        "Impact of large transactions on replay lag?",
        "Parallel apply for logical vs physical?",
        "Synchronous rep latency vs async lag?"
      ],
      mistakes: [
        "Read-heavy workload on standby without conflict monitoring",
        "Standby disk tier lower than primary",
        "Ignoring checkpoint-induced lag spikes",
        "max_standby_streaming_delay=-1 forever"
      ],
      seniorInsights: "Lag spikes at checkpoint = standby IO problem. Steady lag = WAL generation exceeds replay — IO or conflicts.",
      commands: [
        "SELECT * FROM pg_stat_replication;",
        "SELECT * FROM pg_stat_database_conflicts;",
        "SELECT pg_is_in_recovery();",
        "SHOW max_standby_streaming_delay;"
      ],
      bestPractices: [
        "Match or exceed primary storage IOPS on standbys",
        "Monitor pg_stat_database_conflicts on replicas",
        "Use dedicated replication network if cross-AZ",
        "Set sensible max_standby_streaming_delay with alerting"
      ],
    },
  }),
  buildQuestion({
    id: "pg-streaming-replication-3",
    trackId: 'postgresql',
    topic: "streaming-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "What are replication slots and why should every standby use one?",
    sections: {
      interview: "Replication slots track consumer LSN on primary — WAL segments not recycled until consumed. Physical slots tied to standby restart_lsn; logical slots to confirmed_flush_lsn. pg_replication_slots shows retained WAL. Without slot, standby falling behind loses WAL and needs rebuild.",
      explanation: "pg_create_physical_replication_slot creates durable slot surviving restarts. inactive slot still retains WAL — operational hazard. max_replication_slots limits count. max_slot_wal_keep_size bounds disk risk per slot.",
      production: "Standby rebuild required after 4h network partition — no slot, WAL gone. Post-incident: mandatory slot per standby via Patroni config, alert on pg_wal_lsn_diff > 1GB.",
      followUps: [
        "Drop slot safely when decommissioning standby?",
        "Logical slot pgoutput vs wal2json?",
        "Temporary vs permanent slots?",
        "Slot sync with pg_basebackup -C?"
      ],
      mistakes: [
        "Orphan slots after failed experiments",
        "Creating logical slots without consumer monitoring",
        "max_replication_slots default too low for HA + CDC",
        "Deleting slot while standby still running"
      ],
      seniorInsights: "Slot = contract that primary keeps WAL for consumer. Orphan slot is a disk-fill time bomb.",
      commands: [
        "SELECT * FROM pg_replication_slots;",
        "SELECT pg_create_physical_replication_slot('replica1', true);",
        "SELECT pg_drop_replication_slot('old_slot');",
        "SELECT pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) FROM pg_replication_slots;"
      ],
      bestPractices: [
        "One named slot per standby and logical consumer",
        "Alert inactive slots with retained WAL",
        "Document slot ownership in infrastructure registry",
        "Set max_slot_wal_keep_size as safety valve"
      ],
    },
  }),
  buildQuestion({
    id: "pg-streaming-replication-4",
    trackId: 'postgresql',
    topic: "streaming-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Configure synchronous replication with quorum for RPO zero across multiple AZs.",
    sections: {
      interview: "synchronous_standby_names = 'FIRST 2 (sync1, sync2, sync3)' requires two listed standbys to acknowledge commit. ANY 1 (...) allows any one of set. pg_stat_replication sync_state=sync on acknowledged standbys. Trade-off: commit latency = slowest sync standby RTT + flush time.",
      explanation: "Quorum protects against single AZ loss without blocking on one slow replica. priority in synchronous_standby_names orders preference. synchronous_commit=remote_apply strongest — waits apply not just flush. Cloud: cross-AZ latency 1-3ms adds to commit p99.",
      production: "Financial ledger required sync rep; FIRST 1 caused commits blocked when single AZ standby maintenance. Switched to FIRST 2 of 3 sync standbys — survived AZ outage with zero committed transaction loss.",
      followUps: [
        "Failover when sync standby down — commits block?",
        "synchronous_commit remote_write vs on?",
        "Patroni synchronous_mode vs PostgreSQL native?",
        "Aurora synchronous replica semantics?"
      ],
      mistakes: [
        "FIRST 1 with only one sync standby — no AZ redundancy",
        "All standbys async — believing HA without RPO guarantee",
        "Not testing commit latency impact before enabling sync",
        "Forgetting to update synchronous_standby_names after topology change"
      ],
      seniorInsights: "Quorum sync is the sweet spot for multi-AZ — explain FIRST 2 of 3 with commit latency math.",
      commands: [
        "ALTER SYSTEM SET synchronous_standby_names = 'FIRST 2 (az1, az2, az3)';",
        "SELECT application_name, sync_state, sync_priority FROM pg_stat_replication;",
        "SELECT pg_reload_conf();"
      ],
      bestPractices: [
        "Use quorum sync for multi-AZ RPO zero",
        "Load test commit latency with sync enabled",
        "Automate synchronous_standby_names updates in failover tooling",
        "Monitor sync_state and commit latency p99"
      ],
    },
  }),
  buildQuestion({
    id: "pg-streaming-replication-5",
    trackId: 'postgresql',
    topic: "streaming-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Recover a standby that has fallen behind or has timeline divergence after promotion.",
    sections: {
      interview: "If WAL missing: rebuild via pg_basebackup or pgBackRest restore. Timeline divergence after promote/failback: pg_rewind re-syncs diverged standby to new primary timeline using WAL overlap. pg_upgrade and pg_wal_replay_resume for controlled catch-up. Never manually edit pg_control without expert guidance.",
      explanation: "pg_rewind requires wal_log_hints or data_checksums enabled at init. Standby rejoins as replica after rewind + restart with primary_conninfo. Multiple promotions create timeline history files in pg_wal/archive. pg_switch_wal before promotion ensures clean segment boundary.",
      production: "Failed back to old primary after split-brain — timelines diverged. pg_rewind --target-pgdata=/var/lib/pgsql/data --source-server=connstr succeeded; rejoined as replica in 20 min vs 6h full rebuild.",
      followUps: [
        "When pg_rewind fails?",
        "pg_verifybackup role?",
        "Rebuild vs rewind decision tree?",
        "pg_resetwal danger scenarios?"
      ],
      mistakes: [
        "Manual copy of data directory without matching timeline",
        "Skipping data_checksums then needing rewind later",
        "Promoting multiple standbys without fencing old primary",
        "pg_resetwal as first troubleshooting step"
      ],
      seniorInsights: "Enable data_checksums + wal_log_hints at cluster birth — enables pg_rewind and corruption detection.",
      commands: [
        "pg_rewind --target-pgdata=$PGDATA --source-server=\"host=primary dbname=postgres user=rewind\"",
        "pg_controldata $PGDATA | grep Timeline",
        "pg_basebackup -h newprimary -D $PGDATA -Fp -Xs -P -R"
      ],
      bestPractices: [
        "Enable data_checksums on new clusters",
        "Document rewind vs rebuild criteria in runbook",
        "Fence old primary before any promotion",
        "Test pg_rewind in staging after simulated split-brain"
      ],
    },
  }),

  // ─── replication.js: logical-replication ─────────────────────────────────────
  buildQuestion({
    id: "pg-logical-replication-1",
    trackId: 'postgresql',
    topic: "logical-replication",
    file: "replication.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "What is logical replication and how does it differ from streaming replication?",
    sections: {
      interview: "Logical replication decodes WAL to row-level changes via replication slot and publishes to subscriber via pgoutput plugin. Supports table-level publication, cross-version upgrade, and selective replication. Physical streaming replicates entire cluster byte-identical; logical allows heterogeneous targets and transformations.",
      explanation: "Publisher: CREATE PUBLICATION, wal_level=logical. Subscriber: CREATE SUBSCRIPTION connects to publisher slot. Apply workers insert/update/delete on subscriber. Initial sync copies existing data. Conflicts on subscriber possible with concurrent writes. pg_stat_subscription tracks apply lag.",
      production: "Migrating PG 13 → 16: logical replication publication on old primary, subscription on new cluster, cutover after lag zero — near-zero downtime vs pg_dump.",
      followUps: [
        "wal_level logical WAL overhead?",
        "Publication FOR ALL TABLES vs specific?",
        "Bidirectional logical replication pitfalls?",
        "DDL replication support PG 15+?"
      ],
      mistakes: [
        "wal_level not logical before enabling publication",
        "No primary key on published table — UPDATE/DELETE cannot apply",
        "Writing to subscriber tables also receiving replication — conflicts",
        "Ignoring replication slot disk on publisher"
      ],
      seniorInsights: "Logical rep is the modern upgrade path and CDC mechanism — know publication/subscription/slot triangle.",
      commands: [
        "CREATE PUBLICATION orders_pub FOR TABLE orders, order_items;",
        "CREATE SUBSCRIPTION orders_sub CONNECTION 'host=pub dbname=app' PUBLICATION orders_pub;",
        "SELECT * FROM pg_stat_subscription;"
      ],
      bestPractices: [
        "Ensure PRIMARY KEY on all published tables",
        "Monitor publisher slot lag and retained WAL",
        "Use logical rep for major version upgrades",
        "Avoid concurrent writes on subscriber without conflict strategy"
      ],
    },
  }),
  buildQuestion({
    id: "pg-logical-replication-2",
    trackId: 'postgresql',
    topic: "logical-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "How do you handle logical replication conflicts and apply errors on the subscriber?",
    sections: {
      interview: "Subscriber apply errors pause subscription — pg_stat_subscription shows worker state. Conflicts when subscriber modified same row: default uses ERROR and stops. Options: disable subscription, fix data, skip LSN with pg_replication_origin_advance (dangerous), or use conflict-free subscriber (read-only). PG 16+ improved conflict policies.",
      explanation: "Common errors: duplicate key, missing row for UPDATE, FK violations. subscriber_disabled stops apply. ALTER SUBSCRIPTION ... DISABLE/ENABLE. pg_logical_emit_message for custom signaling. Transformations via BEFORE triggers on subscriber risky.",
      production: "CDC subscriber had manual hotfix UPDATE conflicting with replication — subscription stopped 2h. Disabled subscription, reconciled 47 rows via diff script, resumed from pg_stat_subscription latest_lsn after verification.",
      followUps: [
        "COPY vs INSERT for initial sync?",
        "Replication identity FULL vs DEFAULT?",
        "Filter rows in publication?",
        "Logical decoding plugin comparison?"
      ],
      mistakes: [
        "Manual subscriber writes on replicated tables",
        "Advancing LSN without understanding skipped transactions",
        "No alerting on pg_stat_subscription worker errors",
        "REPLICA IDENTITY FULL on wide tables — WAL bloat"
      ],
      seniorInsights: "Subscriber is read-only unless you have explicit bidirectional design with conflict resolution.",
      commands: [
        "ALTER SUBSCRIPTION orders_sub DISABLE;",
        "SELECT subname, received_lsn, latest_end_lsn, last_msg_receipt_time FROM pg_stat_subscription;",
        "ALTER SUBSCRIPTION orders_sub ENABLE;",
        "ALTER TABLE orders REPLICA IDENTITY FULL; -- only if needed"
      ],
      bestPractices: [
        "Keep subscriber apply tables read-only for CDC",
        "Alert on subscription worker not running",
        "Document conflict reconciliation procedure",
        "Use REPLICA IDENTITY DEFAULT unless UPDATE on non-PK columns"
      ],
    },
  }),
  buildQuestion({
    id: "pg-logical-replication-3",
    trackId: 'postgresql',
    topic: "logical-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Monitor logical replication lag and slot health on the publisher.",
    sections: {
      interview: "pg_stat_replication for logical walsender shows sent_lsn; pg_replication_slots confirmed_flush_lsn vs pg_current_wal_lsn measures lag bytes. pg_stat_subscription on subscriber shows apply lag. inactive logical slot retains WAL indefinitely — monitor pg_wal_lsn_diff.",
      explanation: "Logical slots named in CREATE SUBSCRIPTION create_slot option. pg_stat_replication.application_name matches subscription. Consumer lag in Debezium/Kafka visible separately — DB slot lag is authoritative for WAL retention risk.",
      production: "Debezium connector paused weekend — logical slot retained 180GB WAL. Added alert: pg_wal_lsn_diff > 10GB on any logical slot. Consumer auto-restart policy added.",
      followUps: [
        "pgoutput vs test_decoding?",
        "Slot export snapshot for consistent CDC start?",
        "Multiple subscriptions one publication?",
        "Drop subscription slot cleanup?"
      ],
      mistakes: [
        "Logical slot without active consumer",
        "Not naming slots — hard to trace ownership",
        "Monitoring Kafka lag only not PG slot lag",
        "max_replication_slots exhausted by orphaned logical slots"
      ],
      seniorInsights: "CDC pipeline health starts at pg_replication_slots on publisher — Kafka lag is downstream.",
      commands: [
        "SELECT slot_name, plugin, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS lag FROM pg_replication_slots WHERE slot_type='logical';",
        "SELECT * FROM pg_stat_replication WHERE application_name LIKE 'sub_%';"
      ],
      bestPractices: [
        "Tag slots with owner and consumer system in name",
        "Page on slot lag bytes not just active=false",
        "Drop subscription WITH (slot_name) on decommission",
        "Capacity plan max_replication_slots for HA + CDC"
      ],
    },
  }),
  buildQuestion({
    id: "pg-logical-replication-4",
    trackId: 'postgresql',
    topic: "logical-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Perform zero-downtime major version upgrade using logical replication.",
    sections: {
      interview: "Publisher on old version, subscriber on new: CREATE PUBLICATION on source, CREATE SUBSCRIPTION with copy_data=true on target. Wait sync lag zero. Stop writes briefly, verify counts, redirect apps to new cluster, drop old subscription. pglogical or native logical rep depending on version jump.",
      explanation: "Limitations: sequences not replicated — sync via pg_dump --data-only or setval. Large objects need separate handling. Extensions may differ between versions. DDL on PG 15+ can replicate via publication. Cutover window for final LSN catch-up typically seconds to minutes.",
      production: "PG 12→16 upgrade: logical rep to new RDS instance, pg_dump --data-only for sequences, 30-second write freeze at cutover, rollback plan kept old cluster read-only 48h.",
      followUps: [
        "Sequence sync strategies?",
        "Schema drift before cutover?",
        "Filter publication for unsupported types?",
        "Rollback if cutover fails?"
      ],
      mistakes: [
        "Forgetting sequence synchronization",
        "Different extension versions on subscriber",
        "Cutover without row count verification",
        "Dropping old cluster before soak period"
      ],
      seniorInsights: "Logical upgrade is standard for large DBs where pg_upgrade downtime unacceptable — rehearse twice.",
      commands: [
        "CREATE PUBLICATION upgrade_pub FOR ALL IN SCHEMA public;",
        "CREATE SUBSCRIPTION upgrade_sub CONNECTION '...' PUBLICATION upgrade_pub WITH (copy_data = true, create_slot = true);",
        "SELECT pg_size_pretty(pg_wal_lsn_diff(received_lsn, latest_end_lsn)) FROM pg_stat_subscription;"
      ],
      bestPractices: [
        "Rehearse full upgrade on clone",
        "Sync sequences explicitly at cutover",
        "Verify row counts per table before switch",
        "Keep old cluster available for rollback window"
      ],
    },
  }),
  buildQuestion({
    id: "pg-logical-replication-5",
    trackId: 'postgresql',
    topic: "logical-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Design logical replication architecture for multi-region read replicas with selective table sync.",
    sections: {
      interview: "Regional publisher in home region; subscribers in EU/APAC with publications filtered to regional-relevant tables. Avoid bidirectional unless using conflict-free CRDT patterns. Network: VPN/private link for replication connection. Slot per subscriber per region. RPO = replication lag; regional subscriber for read locality not DR alone.",
      explanation: "CREATE PUBLICATION pub_eu FOR TABLE eu_customers, eu_orders. Row filters PG 15+ WHERE clause in publication. Subscriber connection string with SSL. Cross-region lag higher — async by nature. Combine with physical WAL archive for regional DR.",
      production: "Global app replicated 200 tables to EU subscriber — unnecessary WAL and 45s lag. Split publications: global_read_pub (20 tables) per region; cut lag to 3s and halved slot WAL retention.",
      followUps: [
        "Publication row filters PG 15+?",
        "Security for replication connection cross-cloud?",
        "Citus vs logical for sharding?",
        "Subscriber connection failover?"
      ],
      mistakes: [
        "Replicating entire database cross-region unnecessarily",
        "Bidirectional without conflict strategy",
        "Public replication port on internet",
        "Single subscription for unrelated SLA tiers"
      ],
      seniorInsights: "Selective publication is performance and compliance — replicate only what region needs.",
      commands: [
        "CREATE PUBLICATION eu_pub FOR TABLE customers, orders WITH (publish = 'insert,update,delete');",
        "CREATE SUBSCRIPTION eu_sub CONNECTION 'host=primary sslmode=require' PUBLICATION eu_pub;"
      ],
      bestPractices: [
        "Filter publications to regional data needs",
        "Use private networking for replication traffic",
        "Separate slots and subscriptions per region",
        "Combine logical reads with WAL DR for RPO"
      ],
    },
  }),

  // ─── replication.js: physical-replication ─────────────────────────────────────
  buildQuestion({
    id: "pg-physical-replication-1",
    trackId: 'postgresql',
    topic: "physical-replication",
    file: "replication.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "Explain physical (binary) replication and what it copies.",
    sections: {
      interview: "Physical replication ships raw WAL bytes to standby replaying identical changes at page level. Entire cluster replicated — all databases, roles, tablespaces. Standby is block-level clone evolving with primary. Base backup + continuous WAL archive/stream completes replica.",
      explanation: "Requires wal_level=replica or logical. Standby recovery.conf/standby.signal configures primary_conninfo. hot_standby allows reads. Cannot replicate single database only — use logical for selective. pg_basebackup creates consistent snapshot using WAL.",
      production: "DR standby in secondary region initialized with pgBackRest backup + stream WAL; RPO 30s async. Quarterly promote test validates RTO.",
      followUps: [
        "File-level vs block-level replication?",
        "Tablespace replication paths?",
        "Standby promotion steps?",
        "pg_receivewal use case?"
      ],
      mistakes: [
        "Expecting selective DB replication with physical rep",
        "wal_level=minimal on primary with standbys",
        "Not testing promotion procedure",
        "Different major PG version on standby without compatibility check"
      ],
      seniorInsights: "Physical rep = full cluster clone. Interviewers ask when you would choose logical instead — selective tables, upgrades, CDC.",
      commands: [
        "pg_basebackup -h primary -U repl -D /standby -Fp -Xs -P -R",
        "SELECT pg_is_in_recovery();",
        "SHOW wal_level;"
      ],
      bestPractices: [
        "wal_level=replica minimum for any standby",
        "Automate base backup + replication setup",
        "Test promotion regularly",
        "Match major version on standbys"
      ],
    },
  }),
  buildQuestion({
    id: "pg-physical-replication-2",
    trackId: 'postgresql',
    topic: "physical-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "What is timeline history and how does it affect failover?",
    sections: {
      interview: "Each promotion increments timeline ID. WAL filenames encode timeline. History file records parent timeline and switchpoint LSN. Standby must follow new timeline after failover — pg_rewind or rebuild. pg_controldata shows current timeline.",
      explanation: "Failover: pg_ctl promote or trigger_file on standby. Old primary must be fenced — split-brain if still accepts writes. Patroni/etcd manages timeline and leader election. pg_waldump inspects WAL records across timelines.",
      production: "Manual promotion during outage forgot to fence old primary — split-brain 8 minutes until network isolation. Post-incident: Patroni with STONITH via cloud API disable old primary NIC.",
      followUps: [
        "pg_ctl promote vs pg_promote()?",
        "Timeline switch WAL record?",
        "Failback procedure after false promotion?",
        "etcd role in Patroni failover?"
      ],
      mistakes: [
        "Two primaries accepting writes simultaneously",
        "Not updating application connection strings after promotion",
        "Promoting lagging standby without acknowledging data loss",
        "Ignoring timeline in WAL archive during PITR"
      ],
      seniorInsights: "Timeline is PostgreSQL HA vocabulary — explain promotion creates new timeline branch.",
      commands: [
        "pg_controldata $PGDATA | grep -E 'Timeline|checkpoint'",
        "pg_ctl promote -D $PGDATA",
        "cat $PGDATA/pg_wal/*.history",
        "patronictl failover"
      ],
      bestPractices: [
        "Automate failover with fencing (Patroni/k8s operator)",
        "Never allow dual-primary writes",
        "Update DNS/proxy on timeline change",
        "Archive timeline history files with WAL"
      ],
    },
  }),
  buildQuestion({
    id: "pg-physical-replication-3",
    trackId: 'postgresql',
    topic: "physical-replication",
    file: "replication.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Provision a new physical standby using pg_basebackup best practices.",
    sections: {
      interview: "pg_basebackup -D target -Fp -Xs -P -R -C -S slotname from primary. -Xs streams WAL during backup for consistency. -R writes standby.signal and primary_conninfo. -C creates replication slot. Run during low IO if possible; parallel backup with -j for pgBackRest alternative.",
      explanation: "Backup takes base copy lock briefly at start checkpoint. Ensure enough disk on standby. recovery parameters in postgresql.auto.conf. Start standby without initdb — uses backup directory. Verify pg_stat_replication on primary shows connected standby.",
      production: "New replica added with pg_basebackup -j 4 via pgBackRest stanza — 800GB in 45 min vs 3h single-threaded. Slot prevented WAL loss during long backup.",
      followUps: [
        "pg_basebackup vs pgBackRest vs wal-g?",
        "Backup from replica allowed?",
        "Encrypt base backup in transit?",
        "Verify backup integrity before start?"
      ],
      mistakes: [
        "No replication slot during multi-hour basebackup",
        "Starting standby without standby.signal in PG 12+",
        "Insufficient disk for WAL accumulation during backup",
        "Wrong primary_conninfo SSL settings"
      ],
      seniorInsights: "Always -C -S slotname on pg_basebackup — textbook production answer.",
      commands: [
        "pg_basebackup -h primary -U replicator -D /var/lib/pgsql/16/data -Fp -Xs -P -R -C -S replica2",
        "pg_verifybackup /path/to/backup",
        "SELECT * FROM pg_stat_replication;"
      ],
      bestPractices: [
        "Create replication slot during basebackup",
        "Verify connectivity before cutover to standby",
        "Use parallel backup tools for large datasets",
        "Document replica provisioning in runbook"
      ],
    },
  }),
  buildQuestion({
    id: "pg-physical-replication-4",
    trackId: 'postgresql',
    topic: "physical-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Compare async vs sync physical replication for RPO/RTO in cloud deployments.",
    sections: {
      interview: "Async: primary commits without waiting — RPO = last replicated WAL on failure (seconds to minutes). Sync: commit waits for standby persist — RPO zero for acknowledged commits. RTO depends on promotion automation — manual minutes, Patroni ~30-60s. Cross-region async common; sync usually same-region multi-AZ.",
      explanation: "Cloud RDS: Multi-AZ synchronous to standby in another AZ — RPO zero within region. Read replicas async — RPO > 0. Aurora storage replication different model — shared storage layer. Network partition with sync rep blocks commits if quorum lost.",
      production: "Chose same-region sync Multi-AZ for OLTP (RPO 0) + cross-region async read replica for DR (RPO 5 min acceptable). Documented data loss window for regional disaster explicitly.",
      followUps: [
        "Aurora vs RDS Postgres replication model?",
        "Quorum sync across 3 AZs?",
        "RTO for manual vs automated promotion?",
        "Synchronous rep and pgbouncer transaction pooling?"
      ],
      mistakes: [
        "Believing cross-region async replica gives RPO zero",
        "No documented acceptable data loss for async DR",
        "Sync rep across regions — commit latency unacceptable",
        "Read replica promoted without measuring lag at failure time"
      ],
      seniorInsights: "Draw RPO/RTO matrix: same-AZ sync, cross-AZ async, cross-region async — different numbers each.",
      commands: [
        "SELECT application_name, sync_state, flush_lag, replay_lag FROM pg_stat_replication;",
        "SHOW synchronous_standby_names;"
      ],
      bestPractices: [
        "Document RPO/RTO per replica tier explicitly",
        "Same-region sync for zero RPO OLTP",
        "Cross-region async for DR with tested promotion",
        "Automate promotion to meet RTO SLO"
      ],
    },
  }),
  buildQuestion({
    id: "pg-physical-replication-5",
    trackId: 'postgresql',
    topic: "physical-replication",
    file: "replication.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Troubleshoot a standby that cannot connect or stays in recovery not catching up.",
    sections: {
      interview: "Check primary pg_hba for replication user, pg_stat_replication for connection attempts, standby postgresql.auto.conf primary_conninfo, network/firewall port 5432, replication slot existence, and pg_log on both sides. pg_is_in_recovery() true expected; pg_last_wal_receive_lsn vs pg_last_wal_replay_lsn on standby shows catch-up.",
      explanation: "Common failures: wrong repl user password, missing REPLICATION privilege, SSL mismatch, slot dropped while standby down, primary max_wal_senders exhausted, standby data directory from wrong timeline. walreceiver process absent in pg_stat_activity on standby.",
      production: "Standby stuck: primary_conninfo pointed to decommissioned ELB after failover. Updated auto.conf via Patroni, restarted standby — reconnected in 30s. Added Patroni DCS-managed conninfo to prevent drift.",
      followUps: [
        "pg_hba replication keyword line format?",
        "recovery_min_apply_delay misconfiguration?",
        "Standby readonly queries blocking replay?",
        "Reinit standby without full cluster rebuild?"
      ],
      mistakes: [
        "Replication user with LOGIN but not REPLICATION attribute",
        "Firewall allows 5432 app but blocks standby IP",
        "Manual auto.conf edits overwritten by Patroni",
        "Deleting standby data dir partial files corrupt state"
      ],
      seniorInsights: "Split troubleshooting: connection (hba, network, auth) vs catch-up (slot, lag, conflicts) — different symptoms.",
      commands: [
        "# pg_hba.conf: host replication repl 10.0.0.0/16 scram-sha-256",
        "SELECT rolreplication FROM pg_roles WHERE rolname='repl';",
        "SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();",
        "grep primary_conninfo $PGDATA/postgresql.auto.conf"
      ],
      bestPractices: [
        "Automate conninfo management via Patroni/operator",
        "Test replication auth from standby host before backup",
        "Monitor walreceiver process on standby",
        "Keep slot when standby intentionally stopped"
      ],
    },
  }),

  // ─── indexing.js: index-types ─────────────────────────────────────
  buildQuestion({
    id: "pg-index-types-1",
    trackId: 'postgresql',
    topic: "index-types",
    file: "indexing.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "What index access methods does PostgreSQL support and when use each?",
    sections: {
      interview: "B-tree default for equality and range. Hash for equality only (rare). GiST for geometric/full-text/generalized search. SP-GiST for non-balanced structures (quadtrees). GIN for inverted indexes (arrays, jsonb, fts). BRIN for very large naturally ordered tables. Bloom for multi-column equality (extension).",
      explanation: "Each AM implements consistent API for planner. B-tree handles <, <=, =, >=, > and ORDER BY. GIN larger but fast lookups on elements. BRIN tiny index size scanning heap ranges. Choose based on query operators and data shape — EXPLAIN shows Index Scan type.",
      production: "JSONB metadata queries used B-tree on expression — 2GB index, slow writes. Switched to GIN (jsonb_path_ops) — index 400MB, query 50ms vs 800ms.",
      followUps: [
        "Can one column have multiple index types?",
        "Default index type if not specified?",
        "GiST vs GIN for full-text?",
        "When is Hash index appropriate PG 10+?"
      ],
      mistakes: [
        "B-tree on JSONB containment @> queries",
        "GIN on low-cardinality boolean column",
        "BRIN on random-ordered UUID insert table",
        "GiST when GIN would be faster for jsonb"
      ],
      seniorInsights: "Operator class determines index usability — show query operator → index AM mapping.",
      commands: [
        "SELECT amname FROM pg_am WHERE amtype = 'i';",
        "\\d orders — view index definitions",
        "CREATE INDEX idx ON t USING gin (data jsonb_path_ops);"
      ],
      bestPractices: [
        "Match index AM to query operators in EXPLAIN",
        "Prototype index type on staging with realistic data",
        "Monitor index size vs query benefit in pg_stat_user_indexes",
        "Document non-B-tree indexes in schema guide"
      ],
    },
  }),
  buildQuestion({
    id: "pg-index-types-2",
    trackId: 'postgresql',
    topic: "index-types",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Explain partial, covering, and expression indexes.",
    sections: {
      interview: "Partial index: WHERE clause limits indexed rows — smaller, faster for filtered queries. Covering index: INCLUDE columns enable index-only scan without heap visit for included cols. Expression index: indexes function result CREATE INDEX ON t ((lower(email))). All require matching query predicates exactly.",
      explanation: "Partial index ideal for sparse predicates — WHERE status = 'open' on mostly-closed table. INCLUDE adds payload columns not in search key — PG 11+. Expression index for case-insensitive search lower(col). Unique partial indexes enforce conditional uniqueness.",
      production: "Unique email index on all rows failed for soft-deleted users with duplicate emails. CREATE UNIQUE INDEX users_email_active ON users (lower(email)) WHERE deleted_at IS NULL; solved constraint and halved index size.",
      followUps: [
        "Partial index and UNIQUE constraint?",
        "INCLUDE vs composite index trade-off?",
        "Immutable function requirement for expression index?",
        "Planner using partial index incorrectly?"
      ],
      mistakes: [
        "Partial index WHERE not matching query filter exactly",
        "INCLUDE columns not in SELECT — no index-only benefit",
        "Non-immutable function in expression index",
        "Duplicate overlapping indexes wasting write overhead"
      ],
      seniorInsights: "Partial indexes are underused — interview scenario: soft delete, status filters, active-only rows.",
      commands: [
        "CREATE UNIQUE INDEX users_email_active ON users (lower(email)) WHERE deleted_at IS NULL;",
        "CREATE INDEX orders_cover ON orders (customer_id) INCLUDE (total, created_at);",
        "EXPLAIN SELECT total FROM orders WHERE customer_id = 1;"
      ],
      bestPractices: [
        "Use partial indexes for skewed filter predicates",
        "INCLUDE columns frequently selected with key lookup",
        "Ensure expression indexes use immutable functions",
        "Drop redundant indexes after adding covering index"
      ],
    },
  }),
  buildQuestion({
    id: "pg-index-types-3",
    trackId: 'postgresql',
    topic: "index-types",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "How do you identify unused or redundant indexes in production?",
    sections: {
      interview: "pg_stat_user_indexes idx_scan = 0 since stats reset indicates unused (verify over weeks). pg_stat_statements + EXPLAIN for query coverage. Duplicate indexes: same leading columns — keep one. Index size vs scan count in pg_stat_user_indexes guides drop candidates.",
      explanation: "Reset stats after major release before judging. FK columns without index show up as seq scans on JOIN/DELETE parent. pg_repack/REINDEX before drop not needed for drop itself. CREATE INDEX CONCURRENTLY for new; DROP INDEX CONCURRENTLY to avoid blocking.",
      production: "Audit found 23 indexes with idx_scan=0 over 90 days — 15GB total. Dropped 18 after query log verification; write throughput on orders improved 12%.",
      followUps: [
        "idx_tup_read vs idx_scan interpretation?",
        "Drop index impact on constraint?",
        "Hypothetical index testing PG?",
        "Auto-explain for missing index detection?"
      ],
      mistakes: [
        "Dropping index after short stats window post-deploy",
        "Removing FK-supporting index causing lock on parent DELETE",
        "Dropping UNIQUE index backing constraint without replacement",
        "Not checking replication lag impact of large DROP INDEX"
      ],
      seniorInsights: "Present audit query joining pg_stat_user_indexes to pg_indexes with size — sorted by size where idx_scan=0.",
      commands: [
        "SELECT schemaname, relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) AS size FROM pg_stat_user_indexes ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;",
        "DROP INDEX CONCURRENTLY idx_unused;"
      ],
      bestPractices: [
        "Review unused indexes quarterly with 90-day stats",
        "Keep indexes supporting FK and UNIQUE constraints",
        "Drop CONCURRENTLY in production",
        "Verify pg_stat_statements query plans after drop"
      ],
    },
  }),
  buildQuestion({
    id: "pg-index-types-4",
    trackId: 'postgresql',
    topic: "index-types",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Compare index-only scans, bitmap scans, and sequential scans in execution plans.",
    sections: {
      interview: "Index-only scan: answers query from index if visibility map confirms all-visible pages — no heap fetch. Bitmap index scan: OR multiple indexes, sort TIDs, heap fetch in order — moderate selectivity. Seq scan: read all pages — wins when most rows needed or index random IO costly.",
      explanation: "Index-only requires INCLUDE or query columns all in index + VM bit. BitmapAnd combines predicates. Lossy bitmap pages skip exact TID if work_mem tight. increasing random_page_cost favors seq scan on SSD wrongly if left at 4.0 default.",
      production: "Dashboard query used Index Scan fetching heap every row — VM not set due to vacuum backlog. Fixed vacuum; plan became Index Only Scan — 70% IO reduction.",
      followUps: [
        "When bitmap scan becomes lossy?",
        "VM bit not set — root causes?",
        "Covering index vs index-only scan?",
        "Adjust random_page_cost for SSD?"
      ],
      mistakes: [
        "Adding INCLUDE without fixing vacuum for VM",
        "Misreading Bitmap Heap Scan as problem when appropriate",
        "Lowering random_page_cost to 0.1 without holistic testing",
        "Expecting index-only on JSONB GIN without appropriate query shape"
      ],
      seniorInsights: "Index-only scan failure → check visibility map and vacuum first, not index shape.",
      commands: [
        "EXPLAIN (ANALYZE, BUFFERS) SELECT id, status FROM orders WHERE customer_id = 123;",
        "SELECT * FROM pg_visibility_map('orders'::regclass) LIMIT 1;",
        "SET random_page_cost = 1.1; -- test SSD tuning session only"
      ],
      bestPractices: [
        "Maintain visibility map via healthy autovacuum",
        "Design covering indexes for high-QPS lookups",
        "Validate plan type after vacuum on large tables",
        "Tune random_page_cost per storage type with benchmarks"
      ],
    },
  }),
  buildQuestion({
    id: "pg-index-types-5",
    trackId: 'postgresql',
    topic: "index-types",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Design indexing strategy for mixed OLTP and reporting on same PostgreSQL database.",
    sections: {
      interview: "OLTP: narrow B-tree indexes on lookup/join keys, partial indexes for hot paths. Reporting: BRIN on time-series facts, GIN for search, consider covering indexes for top reports or offload to replica/columnar (Citus columnar, ClickHouse via FDW). Avoid over-indexing write-heavy OLTP tables — each index slows INSERT/UPDATE.",
      explanation: "Read replica for reporting isolates seq scans from OLTP. pg_stat_statements identifies reporting queries deserving dedicated indexes vs replica. CONCURRENTLY build indexes. Partitioning by time helps BRIN and detach old partitions. Materialized views with REFRESH CONCURRENTLY for dashboards.",
      production: "Reporting team added 8 indexes on orders OLTP table — write latency doubled. Moved reporting indexes to read replica only; OLTP kept 3 core indexes; materialized view refreshed nightly for CFO dashboard.",
      followUps: [
        "Hypopg extension for what-if indexes?",
        "Citus columnar for analytics?",
        "Incremental materialized view PG 13+?",
        "Index bloat from reporting index on OLTP?"
      ],
      mistakes: [
        "Same index set on primary and replica without need",
        "Materialized view REFRESH blocking without CONCURRENTLY",
        "GIN index on OLTP hot path killing write throughput",
        "No query routing — reports hit primary"
      ],
      seniorInsights: "Split OLTP vs reporting at connection pool level — different indexes allowed on replica.",
      commands: [
        "CREATE INDEX CONCURRENTLY idx_orders_created ON orders (created_at);",
        "CREATE MATERIALIZED VIEW mv_daily_sales AS SELECT ... WITH DATA;",
        "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;"
      ],
      bestPractices: [
        "Route reporting queries to read replicas",
        "Build reporting-specific indexes on replica when possible",
        "Use materialized views for heavy aggregations",
        "Review index count impact on write latency monthly"
      ],
    },
  }),

  // ─── indexing.js: btree-index ─────────────────────────────────────
  buildQuestion({
    id: "pg-btree-index-1",
    trackId: 'postgresql',
    topic: "btree-index",
    file: "indexing.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "How does PostgreSQL B-tree index structure support range and equality queries?",
    sections: {
      interview: "B-tree stores keys sorted with leaf pages linked for range scans. Root-to-leaf traversal O(log n). Supports =, <, <=, >, >=, BETWEEN, IN, IS NULL. Default for PRIMARY KEY and UNIQUE. Multi-column index uses leftmost prefix rule for composite keys.",
      explanation: "Internal pages hold pivot keys; leaves hold (key, heap_tid). Duplicate keys allowed unless UNIQUE. NULLs sorted with NULLS FIRST/LAST per index definition. page splits on insert; fillfactor default 90 leaves room. CLUSTER ON index reorders heap to match index — maintenance heavy.",
      production: "Slow ORDER BY created_at DESC LIMIT 20 — seq scan on 50M rows. CREATE INDEX CONCURRENTLY idx_orders_created ON orders (created_at DESC); query 800ms → 2ms.",
      followUps: [
        "Composite index column order rules?",
        "Index on UUID v4 random insert performance?",
        "B-tree deduplication PG 13+?",
        "When does planner skip index for ORDER BY?"
      ],
      mistakes: [
        "Wrong composite column order — filter on second column only",
        "UUID v4 PK causing index bloat and page splits",
        "Duplicate indexes on (a) and (a,b) without reason",
        "Missing CONCURRENTLY on production CREATE INDEX"
      ],
      seniorInsights: "Leftmost prefix rule is the #1 composite index interview question — give concrete multi-column example.",
      commands: [
        "CREATE INDEX CONCURRENTLY idx_orders_created ON orders (created_at DESC);",
        "EXPLAIN SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;",
        "SELECT * FROM pg_stat_user_indexes WHERE indexrelname = 'idx_orders_created';"
      ],
      bestPractices: [
        "Order composite columns by selectivity and query patterns",
        "Use CONCURRENTLY for production index builds",
        "Consider time-ordered keys (bigint sequences) over random UUID PK",
        "Verify index usage via pg_stat_user_indexes idx_scan"
      ],
    },
  }),
  buildQuestion({
    id: "pg-btree-index-2",
    trackId: 'postgresql',
    topic: "btree-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Explain B-tree index bloat, fragmentation, and REINDEX strategies.",
    sections: {
      interview: "Non-HOT updates and deletes leave empty index entries until vacuum reclaims — pages may stay allocated causing bloat. REINDEX rebuilds compact structure. REINDEX CONCURRENTLY (PG 12+) avoids long exclusive locks. pgstatuple and pgstattuple_approx measure bloat.",
      explanation: "Index bloat increases cache pressure and scan cost. VACUUM reclaims dead tuples but may not shrink index pages — REINDEX needed. REINDEX INDEX CONCURRENTLY builds new index, swaps via catalog update. pg_repack can rebuild indexes online too. autovacuum on index same as heap.",
      production: "users_email_idx bloated to 4GB (actual 800MB data) after bulk email update campaign. REINDEX INDEX CONCURRENTLY users_email_idx during low traffic; size 900MB, lookup latency halved.",
      followUps: [
        "pg_repack vs REINDEX CONCURRENTLY?",
        "Index bloat without heap bloat possible?",
        "REINDEX on PK constraint index?",
        "pgstatuple index scan safety?"
      ],
      mistakes: [
        "REINDEX without CONCURRENTLY on production OLTP",
        "Ignoring index bloat focusing only heap pgstattuple",
        "REINDEX entire database during peak",
        "Not investigating update pattern causing bloat"
      ],
      seniorInsights: "idx_scan high + idx_blks_read rising + index size growing = bloat suspicion before pgstattuple confirms.",
      commands: [
        "CREATE EXTENSION pgstattuple;",
        "SELECT * FROM pgstattuple('users_email_idx');",
        "REINDEX INDEX CONCURRENTLY users_email_idx;",
        "SELECT pg_size_pretty(pg_relation_size('users_email_idx'));"
      ],
      bestPractices: [
        "Monitor index size growth rate vs table growth",
        "Use REINDEX CONCURRENTLY in maintenance windows",
        "Fix HOT-unfriendly update patterns at source",
        "Schedule bloat checks on top 20 indexes quarterly"
      ],
    },
  }),
  buildQuestion({
    id: "pg-btree-index-3",
    trackId: 'postgresql',
    topic: "btree-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Why might PostgreSQL ignore a B-tree index and how do you fix it?",
    sections: {
      interview: "Planner chooses seq scan when estimated rows exceed index selectivity threshold, statistics stale, function wrapper prevents index use (WHERE lower(email)=), wrong data type coercion, or index invalid (CREATE INDEX CONCURRENTLY failed). EXPLAIN shows Seq Scan when index expected.",
      explanation: "Enable enable_seqscan off session-only to test index benefit. ANALYZE refreshes stats. Expression index must match expression exactly. Invalid indexes: indisvalid=false in pg_index. Cast mismatch: WHERE varchar_col = integer prevents index unless cast on column side.",
      production: "Query WHERE user_id = $1 seq scanned — user_id was text, parameter int implicit cast on column. Fixed query to cast parameter::text; Index Scan returned, 200ms → 3ms.",
      followUps: [
        "Invalid index from CONCURRENTLY failure?",
        "OR conditions and bitmap vs single index?",
        "Statistics target too low for skewed column?",
        "Partial index predicate mismatch?"
      ],
      mistakes: [
        "WHERE YEAR(created_at)=2024 instead of range on created_at",
        "Not checking pg_index.indisvalid after failed CONCURRENTLY",
        "Session enable_seqscan=off left in connection pool",
        "Adding index without ANALYZE verifying plan change"
      ],
      seniorInsights: "Always check implicit cast direction — index on column, cast on parameter not column.",
      commands: [
        "EXPLAIN ANALYZE SELECT * FROM users WHERE user_id = 12345;",
        "SELECT indexrelid::regclass, indisvalid FROM pg_index WHERE NOT indisvalid;",
        "ANALYZE users;",
        "CREATE INDEX CONCURRENTLY ... -- re-run if invalid dropped"
      ],
      bestPractices: [
        "Match query predicates to index definition exactly",
        "Check indisvalid after CONCURRENTLY index builds",
        "Run ANALYZE after index creation",
        "Use EXPLAIN to verify index usage before closing ticket"
      ],
    },
  }),
  buildQuestion({
    id: "pg-btree-index-4",
    trackId: 'postgresql',
    topic: "btree-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Optimize composite B-tree indexes for multi-column WHERE and ORDER BY queries.",
    sections: {
      interview: "Leading column must appear in WHERE for efficient use (exceptions with skip scan not native). Equality columns first, range last: (status, created_at) for WHERE status='open' AND created_at > X. INCLUDE columns for covering without sort key ordering constraints.",
      explanation: "Index-only scan needs all SELECT/WHERE columns in index or INCLUDE. Sort direction: (created_at DESC) matches ORDER BY created_at DESC. Multiple indexes combined via BitmapAnd. Consider separate indexes if queries use different leading columns exclusively.",
      production: "Existing (created_at, status) unused — queries filter status first. Added (status, created_at DESC) partial WHERE status IN ('open','pending'); 95th percentile 400ms → 15ms.",
      followUps: [
        "Skip scan workaround in PostgreSQL?",
        "INCLUDE vs composite for covering?",
        "Multicolumn statistics for correlated filters?",
        "Index merge bitmap performance?"
      ],
      mistakes: [
        "One composite trying to serve incompatible query patterns",
        "Range column before equality in index definition",
        "Ignoring sort direction mismatch in ORDER BY",
        "10-column composite index hurting write path"
      ],
      seniorInsights: "Draw two query patterns — show when two indexes beat one overloaded composite.",
      commands: [
        "CREATE INDEX CONCURRENTLY idx_open ON orders (status, created_at DESC) WHERE status IN ('open','pending');",
        "EXPLAIN ANALYZE SELECT * FROM orders WHERE status='open' AND created_at > now()-interval '7 days' ORDER BY created_at DESC;"
      ],
      bestPractices: [
        "Design composites per query pattern not per table",
        "Put equality columns before range in index",
        "Match DESC/ASC to ORDER BY direction",
        "Split indexes when leading columns differ across queries"
      ],
    },
  }),
  buildQuestion({
    id: "pg-btree-index-5",
    trackId: 'postgresql',
    topic: "btree-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Manage B-tree index build impact on production: CONCURRENTLY, parallelism, and locks.",
    sections: {
      interview: "CREATE INDEX CONCURRENTLY: SHARE UPDATE EXCLUSIVE — allows reads/writes but two table scans, longer build. Failed CONCURRENTLY leaves INVALID index. maintenance_work_mem sizes sort during build. max_parallel_maintenance_workers (PG 11+) parallelizes btree build.",
      explanation: "Non-concurrent CREATE INDEX blocks writes. Progress in pg_stat_progress_create_index. Long builds on huge tables — monitor replication lag and disk. DROP INDEX CONCURRENTLY similar lock level. Build during replica-first then CREATE on primary if acceptable lag.",
      production: "CREATE INDEX on 200GB table without CONCURRENTLY blocked checkout 22 minutes — incident. Policy: all production indexes CONCURRENTLY with lock_timeout alert; parallel_workers=4 cut build from 6h to 2h.",
      followUps: [
        "INVALID index cleanup procedure?",
        "Build index on replica then attach?",
        "Lock queue behind CREATE INDEX?",
        "Temp file usage during index build?"
      ],
      mistakes: [
        "CREATE INDEX without CONCURRENTLY on production",
        "Ignoring INVALID index after failed build",
        "maintenance_work_mem too low — disk sort spill",
        "Not monitoring pg_stat_progress_create_index"
      ],
      seniorInsights: "CONCURRENTLY failure leaves landmine INVALID index — monitoring indisvalid is production hygiene.",
      commands: [
        "CREATE INDEX CONCURRENTLY idx_big ON big_table (col);",
        "SELECT * FROM pg_stat_progress_create_index;",
        "SELECT indexrelid::regclass, indisvalid FROM pg_index WHERE NOT indisvalid;",
        "DROP INDEX CONCURRENTLY idx_invalid;"
      ],
      bestPractices: [
        "Mandatory CREATE INDEX CONCURRENTLY in production runbooks",
        "Alert on invalid indexes",
        "Size maintenance_work_mem for index builds",
        "Monitor build progress and replication lag"
      ],
    },
  }),

  // ─── indexing.js: gin-index ─────────────────────────────────────
  buildQuestion({
    id: "pg-gin-index-1",
    trackId: 'postgresql',
    topic: "gin-index",
    file: "indexing.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "When should you use a GIN index and what data types benefit most?",
    sections: {
      interview: "GIN (Generalized Inverted Index) excels at containment queries: arrays @>, &&, jsonb @>, ?, full-text @@, hstore. Inverted structure maps elements to row TIDs. Larger and slower to update than B-tree but fast for multi-value search.",
      explanation: "jsonb default GIN opclass jsonb_ops supports many operators; jsonb_path_ops smaller/faster for @> only. array, tsvector, uuid[] supported. GIN fastupdate pending list — batch insert fast, merge on vacuum. gin_pending_list_limit controls flush.",
      production: "Product search on jsonb attributes: seq scan 4s. CREATE INDEX idx_products_attrs ON products USING gin (attributes jsonb_path_ops); search 40ms.",
      followUps: [
        "jsonb_ops vs jsonb_path_ops?",
        "GIN vs GiST for full-text?",
        "gin_trgm_ops for LIKE?",
        "GIN index size expectations?"
      ],
      mistakes: [
        "GIN on column with single scalar values",
        "jsonb_path_ops when needing ? operator",
        "Ignoring GIN write overhead on high-INSERT table",
        "No gin_pending_list tuning on bulk load"
      ],
      seniorInsights: "GIN = inverted index interview answer — draw word → row list analogy for FTS/jsonb.",
      commands: [
        "CREATE INDEX idx_gin ON products USING gin (attributes jsonb_path_ops);",
        "EXPLAIN SELECT * FROM products WHERE attributes @> '{\"color\":\"red\"}';",
        "SELECT pg_size_pretty(pg_relation_size('idx_gin'));"
      ],
      bestPractices: [
        "Use jsonb_path_ops when only @> containment needed",
        "Measure write impact before GIN on hot OLTP tables",
        "Run VACUUM after bulk jsonb load to merge GIN pending",
        "Choose operator class matching query operators"
      ],
    },
  }),
  buildQuestion({
    id: "pg-gin-index-2",
    trackId: 'postgresql',
    topic: "gin-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Explain GIN pending list, fastupdate, and vacuum maintenance.",
    sections: {
      interview: "gin_fastupdate=ON (default): changes accumulate in pending list instead of immediate index merge — faster inserts, slower until merged at vacuum or when gin_pending_list_limit exceeded. Bulk load: consider disabling fastupdate during load then re-enable + VACUUM.",
      explanation: "Pending list bloat slows searches scanning both main tree and pending. gin_clean_pending_list() manual merge. autovacuum triggers merge. COPY into jsonb table with GIN — pending list can grow large before vacuum.",
      production: "Bulk jsonb import 10M rows — queries slow until vacuum ran 2h later. Set gin_pending_list_limit=256MB and scheduled VACUUM after each batch; query performance stable during load.",
      followUps: [
        "ALTER INDEX gin_fastupdate?",
        "GIN vs BRIN for jsonb analytics?",
        "autovacuum not merging GIN pending why?",
        "REINDEX GIN after bulk load?"
      ],
      mistakes: [
        "Never vacuuming after bulk GIN insert",
        "gin_fastupdate=off globally without understanding insert cost",
        "Pending list limit too small causing frequent merges during OLTP",
        "Assuming GIN maintenance-free"
      ],
      seniorInsights: "Bulk jsonb + GIN playbook: load → VACUUM (or increase pending limit during load).",
      commands: [
        "ALTER INDEX idx_gin SET (fastupdate = on);",
        "VACUUM ANALYZE products;",
        "SELECT * FROM pg_stat_user_indexes WHERE indexrelname = 'idx_gin';"
      ],
      bestPractices: [
        "VACUUM after bulk loads on GIN-indexed tables",
        "Tune gin_pending_list_limit for batch workloads",
        "Monitor index scan latency during large ingests",
        "Consider disabling fastupdate only for controlled bulk sessions"
      ],
    },
  }),
  buildQuestion({
    id: "pg-gin-index-3",
    trackId: 'postgresql',
    topic: "gin-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Implement full-text search with GIN tsvector indexes.",
    sections: {
      interview: "to_tsvector('english', body) converts text to lexemes; @@ match operator. CREATE INDEX USING gin(tsv). ts_rank for relevance ordering. Use plainto_tsquery or websearch_to_tsquery for user input. GiST alternative supports ranking but GIN faster lookup.",
      explanation: "Generated column or trigger maintains tsv column on INSERT/UPDATE. Configuration 'english' stems words. phraseto_tsquery for exact phrases. GIN index on expression: CREATE INDEX ON docs USING gin(to_tsvector('english', body)). Highlight via ts_headline.",
      production: "Blog search used ILIKE '%keyword%' — timeout on 2M posts. Added tsv GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || body)) STORED + GIN index; search p99 50ms.",
      followUps: [
        "Weighted search ts_rank with setweight?",
        "Update tsv on trigger vs generated column?",
        "Multilingual tsconfig?",
        "GiST vs GIN FTS trade-offs?"
      ],
      mistakes: [
        "ILIKE on large text instead of FTS",
        "Not using appropriate text search config language",
        "tsvector not updated on row change without trigger/generated",
        "User input passed raw to to_tsquery — syntax errors"
      ],
      seniorInsights: "Generated STORED tsv column (PG 12+) is cleaner than triggers for FTS maintenance.",
      commands: [
        "ALTER TABLE docs ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', body)) STORED;",
        "CREATE INDEX idx_docs_fts ON docs USING gin(tsv);",
        "SELECT title, ts_rank(tsv, query) FROM docs, plainto_tsquery('english', 'postgresql index') query WHERE tsv @@ query ORDER BY ts_rank DESC LIMIT 20;"
      ],
      bestPractices: [
        "Use plainto_tsquery/websearch_to_tsquery for user search input",
        "Generated column or trigger to keep tsvector fresh",
        "GIN index on tsvector column not raw text",
        "Choose language config matching content"
      ],
    },
  }),
  buildQuestion({
    id: "pg-gin-index-4",
    trackId: 'postgresql',
    topic: "gin-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Use pg_trgm GIN indexes for fuzzy and LIKE pattern search.",
    sections: {
      interview: "pg_trgm extension breaks strings into trigrams; similarity() and % operator; GIN gin_trgm_ops supports LIKE/ILIKE %pattern% via index. Index size significant. set_limit() adjusts similarity threshold. Better than seq scan for autocomplete on names.",
      explanation: "CREATE INDEX ON users USING gin (name gin_trgm_ops). pg_trgm.similarity_threshold GUC. ILIKE '%foo%' can use trigram index unlike B-tree. Combine with LIMIT for autocomplete. Write overhead moderate vs jsonb GIN.",
      production: "Customer name autocomplete ILIKE caused seq scans. CREATE INDEX users_name_trgm ON customers USING gin (name gin_trgm_ops); autocomplete latency 200ms → 8ms for prefix/substring patterns.",
      followUps: [
        "trgm vs B-tree prefix index for LIKE 'foo%'?",
        "Index on lower(name) vs gin_trgm?",
        "Similarity vs word_similarity?",
        "pg_trgm on JSON text fields?"
      ],
      mistakes: [
        "Trigram index on high-cardinality unique codes — no benefit",
        "Very short strings (<3 chars) poor trigram selectivity",
        "Not enabling pg_trgm extension in migration",
        "Expecting trigram to fix typo tolerance without similarity op"
      ],
      seniorInsights: "Trigram is the answer for ILIKE %x% when FTS stemming inappropriate — know operator class gin_trgm_ops.",
      commands: [
        "CREATE EXTENSION pg_trgm;",
        "CREATE INDEX customers_name_trgm ON customers USING gin (name gin_trgm_ops);",
        "SELECT * FROM customers WHERE name ILIKE '%smith%' LIMIT 20;",
        "SET pg_trgm.similarity_threshold = 0.3;"
      ],
      bestPractices: [
        "Use trigram for substring/autocomplete not exact match",
        "Enable pg_trgm extension explicitly in migrations",
        "Combine with LIMIT for UI autocomplete endpoints",
        "Benchmark write impact on high-INSERT name columns"
      ],
    },
  }),
  buildQuestion({
    id: "pg-gin-index-5",
    trackId: 'postgresql',
    topic: "gin-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Size and tune GIN indexes on terabyte-scale jsonb document stores.",
    sections: {
      interview: "GIN size often 30-70% of jsonb column size with jsonb_ops; jsonb_path_ops smaller. Partition table by time/hash to limit index size per partition. autovacuum aggressive on pending list. Consider jsonb subset columns for hot query paths instead of indexing entire blob.",
      explanation: "Extract hot keys to generated columns with targeted GIN. BRIN on created_at + GIN on partition. Monitoring pg_relation_size per partition index. REINDEX CONCURRENTLY per partition during rotation. TOAST compresses large jsonb — index includes toasted values.",
      production: "2TB events jsonb single GIN 800GB — autovacuum never caught pending on partition. Migrated to monthly partitions each with jsonb_path_ops GIN max 40GB; dropped monolithic index; ops manageable.",
      followUps: [
        "Hash vs range partition for jsonb?",
        "jsonb subset indexing expression?",
        "GIN on partitioned table attach pattern?",
        "Citus jsonb sharding?"
      ],
      mistakes: [
        "Single GIN on terabyte jsonb monolith",
        "jsonb_ops when only @> needed — 2× size",
        "No partition strategy with GIN write amplification",
        "Ignoring TOAST bloat separate from GIN"
      ],
      seniorInsights: "Partition + jsonb_path_ops is the terabyte jsonb answer — monolithic GIN does not scale operationally.",
      commands: [
        "CREATE TABLE events (...) PARTITION BY RANGE (created_at);",
        "CREATE INDEX ON events_2024_01 USING gin (payload jsonb_path_ops);",
        "SELECT pg_size_pretty(sum(pg_relation_size(indexrelid))) FROM pg_stat_user_indexes WHERE indexrelname LIKE 'events%';"
      ],
      bestPractices: [
        "Partition large jsonb tables before GIN index exceeds maintenance capacity",
        "Prefer jsonb_path_ops for containment-only workloads",
        "Extract frequently queried keys to indexed generated columns",
        "REINDEX CONCURRENTLY per partition on rolling schedule"
      ],
    },
  }),

  // ─── indexing.js: brin-index ─────────────────────────────────────
  buildQuestion({
    id: "pg-brin-index-1",
    trackId: 'postgresql',
    topic: "brin-index",
    file: "indexing.js",
    difficulty: "easy",
    frequency: "Common",
    role: "Database Engineer",
    question: "What is a BRIN index and when is it the right choice?",
    sections: {
      interview: "BRIN (Block Range Index) stores min/max summary per page range — tiny index size. Ideal for naturally ordered data: timestamps, serial IDs, append-only logs. Equality/range queries scan relevant heap ranges only. Wrong for random-ordered columns where every range matches.",
      explanation: "pages_per_range default 128 — tune smaller for selective ranges. Index size KB vs GB for B-tree on same column. Bitmap scan combines BRIN with heap fetch. Correlation near 1.0 in pg_stats predicts BRIN success.",
      production: "500GB append-only metrics table — B-tree on ts was 12GB. BRIN on ts 48KB index; time-range queries still sub-second via range exclusion.",
      followUps: [
        "BRIN vs B-tree size comparison?",
        "pages_per_range tuning?",
        "BRIN on partitioned table auto-create?",
        "Can BRIN support UNIQUE?"
      ],
      mistakes: [
        "BRIN on UUID random PK",
        "BRIN on frequently UPDATEd column breaking ordering",
        "Expecting index-only scan from BRIN",
        "pages_per_range too large missing selectivity"
      ],
      seniorInsights: "Check pg_stats.correlation — >0.9 correlation + append-only = BRIN candidate.",
      commands: [
        "CREATE INDEX idx_metrics_ts_brin ON metrics USING brin (ts);",
        "SELECT attname, correlation FROM pg_stats WHERE tablename='metrics' AND attname='ts';",
        "EXPLAIN SELECT * FROM metrics WHERE ts > now()-interval '1 hour';"
      ],
      bestPractices: [
        "Use BRIN on append-only time-series with high correlation",
        "Check correlation statistic before creating BRIN",
        "Prefer BRIN over B-tree for large historical scan-heavy tables",
        "Combine BRIN with partitioning for retention management"
      ],
    },
  }),
  buildQuestion({
    id: "pg-brin-index-2",
    trackId: 'postgresql',
    topic: "brin-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Tune BRIN pages_per_range and multi-column BRIN indexes.",
    sections: {
      interview: "Smaller pages_per_range = finer granularity, larger index, better selectivity. Multi-column BRIN stores combined range per page range — useful when physical order correlates (ts + sensor_id in insert order). Not equivalent to composite B-tree — all columns share same range buckets.",
      explanation: "BRIN scan returns lossy page ranges — recheck heap filter required. Multi-column BRIN on (device_id, ts) when rows inserted device-by-device. ALTER INDEX ... SET (pages_per_range = 32). Summarize manually BRIN not needed — auto maintained on insert.",
      production: "BRIN pages_per_range=128 missed selective hourly queries — too many heap pages scanned. SET pages_per_range=32; index 3× larger still only 120KB; query 3× faster.",
      followUps: [
        "BRIN summarize after bulk load?",
        "BRIN on numeric vs timestamptz?",
        "Combine BRIN with partial index?",
        "BRIN deduplication?"
      ],
      mistakes: [
        "Multi-column BRIN when columns not physically correlated",
        "Never tuning pages_per_range from default",
        "BRIN as only index on random data — useless",
        "Comparing BRIN size to B-tree expecting similar selectivity"
      ],
      seniorInsights: "pages_per_range is the BRIN knob — explain trade-off with heap pages scanned metric in EXPLAIN.",
      commands: [
        "CREATE INDEX idx_brin ON logs USING brin (device_id, ts) WITH (pages_per_range = 32);",
        "ALTER INDEX idx_brin SET (pages_per_range = 64);",
        "EXPLAIN (ANALYZE) SELECT * FROM logs WHERE ts BETWEEN $1 AND $2;"
      ],
      bestPractices: [
        "Benchmark pages_per_range on representative queries",
        "Use multi-column BRIN only with physical correlation",
        "Monitor heap blocks read in EXPLAIN ANALYZE",
        "Revisit BRIN params after data ingestion pattern changes"
      ],
    },
  }),
  buildQuestion({
    id: "pg-brin-index-3",
    trackId: 'postgresql',
    topic: "brin-index",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Why might BRIN index scans return many false-positive heap pages?",
    sections: {
      interview: "BRIN summarizes min/max per page range — if values within range spread across many ranges or correlation low, many ranges qualify. Lossy bitmap includes pages where only some rows match. High correlation and append-only insert pattern minimizes false positives.",
      explanation: "Updated rows breaking physical order degrade BRIN effectiveness — vacuum does not reorder heap. Cluster or partition by time maintains order. EXPLAIN shows Rows Removed by Filter high on BRIN scan. Re-cluster table or rebuild partition for order restoration.",
      production: "BRIN on created_at after mass UPDATE reshuffled rows — scan read 10× pages. New monthly partitions append-only restored BRIN efficiency; legacy partition got B-tree.",
      followUps: [
        "CLUSTER vs pg_repack for BRIN order?",
        "BRIN on partitioned append-only child?",
        "When to drop BRIN and use B-tree?",
        "BRIN autosummarize on partition attach?"
      ],
      mistakes: [
        "BRIN on heavily updated timestamp column",
        "Ignoring Rows Removed by Filter in EXPLAIN",
        "No correlation check before BRIN create",
        "Single BRIN on table with mixed insert patterns"
      ],
      seniorInsights: "BRIN degradation after UPDATE is classic — interview answer: BRIN assumes heap order matches index order.",
      commands: [
        "EXPLAIN (ANALYZE, BUFFERS) SELECT count(*) FROM events WHERE created_at > $1;",
        "SELECT correlation FROM pg_stats WHERE tablename='events' AND attname='created_at';",
        "CLUSTER events USING idx_events_ts_btree; -- restore order if needed"
      ],
      bestPractices: [
        "Use BRIN primarily on append-only partitions",
        "Monitor filter removal ratio in EXPLAIN ANALYZE",
        "Migrate updated partitions from BRIN to B-tree",
        "Validate correlation statistic periodically"
      ],
    },
  }),
  buildQuestion({
    id: "pg-brin-index-4",
    trackId: 'postgresql',
    topic: "brin-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Design BRIN + partitioning strategy for time-series telemetry data.",
    sections: {
      interview: "Partition by time range (daily/monthly); BRIN on ts per partition — small indexes, detach old partitions for archival. B-tree on (device_id, ts) for point lookups if needed. Compression via pg_compress or columnar extension optional. Retention: DROP partition vs export to cold storage.",
      explanation: "Default partition catch-all monitored separately. BRIN autosummarize on new partitions. pg_partman automates creation. Query must include partition key for pruning. BRIN on parent partitioned table PG 11+ indexes all children.",
      production: "IoT 5TB telemetry: monthly partitions, BRIN ts 2MB total across 60 partitions vs 80GB B-tree attempt abandoned. Queries always include time bounds — partition pruning + BRIN optimal.",
      followUps: [
        "BRIN index on partitioned table parent?",
        "pg_partman BRIN template?",
        "Cross-partition aggregate performance?",
        "TimescaleDB vs native partition+BRIN?"
      ],
      mistakes: [
        "Queries without partition key — scans all partitions",
        "BRIN on default partition receiving random backfill",
        "No automation for partition creation",
        "B-tree on every partition when BRIN suffices"
      ],
      seniorInsights: "Time-series stack: partition prune → BRIN range scan → optional device B-tree for point queries.",
      commands: [
        "CREATE TABLE metrics (ts timestamptz, device_id int, value float) PARTITION BY RANGE (ts);",
        "CREATE INDEX ON metrics_2024_01 USING brin (ts);",
        "EXPLAIN SELECT avg(value) FROM metrics WHERE ts > now()-interval '1 day';"
      ],
      bestPractices: [
        "Always filter on partition key in application queries",
        "Automate partition lifecycle with pg_partman",
        "Use BRIN per partition for append-only time ranges",
        "Archive/detach old partitions instead of DELETE"
      ],
    },
  }),
  buildQuestion({
    id: "pg-brin-index-5",
    trackId: 'postgresql',
    topic: "brin-index",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Compare BRIN vs B-tree vs Timescale hypertable indexing for cloud cost optimization.",
    sections: {
      interview: "BRIN: minimal storage cost, good for scan-heavy analytics on ordered data. B-tree: higher storage/IOPS, needed for selective OLTP lookups. Timescale: compression + chunk policies reducing storage 90%+, B-tree on compressed chunks limited. Cloud cost = storage GB + IOPS + compute for autovacuum/index maintenance.",
      explanation: "Aurora/RDS storage grows with index size — BRIN saves real money on logs. Timescale continuous aggregates precompute rollups. BRIN maintenance near zero vs B-tree write amplification. Evaluate query mix: if 95% range aggregates on logs, BRIN wins.",
      production: "Cloud bill audit: 400GB B-tree indexes on log tables — migrated to BRIN + partition detach to S3 via aws_s3 extension. Storage cost -$1.2k/month with same query SLAs on aggregates.",
      followUps: [
        "Aurora I/O-Optimized vs BRIN benefit?",
        "S3 foreign table for cold logs?",
        "Columnar compression PG extensions?",
        "Index maintenance CPU cost BRIN vs B-tree?"
      ],
      mistakes: [
        "B-tree on every log column by default template",
        "Ignoring index storage in cloud TCO",
        "Timescale compression without query plan validation",
        "BRIN on OLTP lookup path to save cost"
      ],
      seniorInsights: "Cloud DBA interview: translate index choice to $/month — BRIN on logs is FinOps not just performance.",
      commands: [
        "SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) FROM pg_stat_user_indexes WHERE relname LIKE 'logs%';",
        "CREATE INDEX logs_brin ON logs USING brin (logged_at);"
      ],
      bestPractices: [
        "Model storage cost of indexes in cloud architecture reviews",
        "Use BRIN for append-only log/analytics tables",
        "Compress or archive old partitions to object storage",
        "Match index strategy to query SLA not defaults"
      ],
    },
  }),

  // ─── indexing.js: partitioning ─────────────────────────────────────
  buildQuestion({
    id: "pg-partitioning-1",
    trackId: 'postgresql',
    topic: "partitioning",
    file: "indexing.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Explain declarative partitioning types in PostgreSQL: RANGE, LIST, and HASH.",
    sections: {
      interview: "RANGE: time/ID ranges (most common). LIST: discrete values (region, status). HASH: uniform shard by hash mod. PARTITION BY creates parent; CREATE TABLE ... PARTITION OF attaches child. Inserts route to partition via bound check. UNIQUE/PK must include partition key.",
      explanation: "PG 10+ declarative replaces inheritance manual triggers. DEFAULT partition catches unmatched rows — monitor overflow. Sub-partitioning supported. pg_partition_tree shows hierarchy. Constraint exclusion prunes partitions at plan time.",
      production: "Orders table 800GB — partitioned monthly by created_at. Queries with date filter scan 1 partition not 800GB; maintenance VACUUM per partition parallelizable.",
      followUps: [
        "PRIMARY KEY on partitioned table rules?",
        "DEFAULT partition pitfalls?",
        "Attach/detach PARTITION for archival?",
        "Inherited vs declarative partitioning?"
      ],
      mistakes: [
        "UNIQUE index without partition key column",
        "No DEFAULT partition — INSERT fails silently in app",
        "Forgetting partition key in query — full scan all children",
        "Manual inheritance triggers in new projects"
      ],
      seniorInsights: "PK must include partition key — schema design constraint interviewers test.",
      commands: [
        "CREATE TABLE orders (...) PARTITION BY RANGE (created_at);",
        "CREATE TABLE orders_2024_01 PARTITION OF orders FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');",
        "SELECT * FROM pg_partition_tree('orders');"
      ],
      bestPractices: [
        "Include partition key in PRIMARY KEY and UNIQUE constraints",
        "Automate partition creation (pg_partman)",
        "Always query with partition key filter when possible",
        "Plan DEFAULT partition for overflow monitoring"
      ],
    },
  }),
  buildQuestion({
    id: "pg-partitioning-2",
    trackId: 'postgresql',
    topic: "partitioning",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "How does partition pruning work and why might it fail?",
    sections: {
      interview: "Planner eliminates partitions whose bounds cannot match WHERE clause. Requires immutable partition key expression in predicate. Stable functions or wrong type coercion disable pruning. EXPLAIN shows Subplans Removed or Append with selected children only.",
      explanation: "enable_partition_pruning=on default. Constraint exclusion on CHECK bounds. Join pruning PG 11+ when partition key in join condition. prepare_threshold can cache generic plan missing pruning — plan_cache_mode=force_custom_plan for debugging. Static vs runtime pruning.",
      production: "Query WHERE created_at >= $1 failed pruning — app sent timestamptz param but column was timestamp without time zone. Cast mismatch fixed; partitions scanned dropped from 36 to 1.",
      followUps: [
        "Runtime vs compile-time pruning?",
        "Partition-wise join PG 11+?",
        "Pruning with OR conditions across partitions?",
        "Foreign key across partitioned table?"
      ],
      mistakes: [
        "Partition key type mismatch with parameter",
        "WHERE date_trunc('month', ts) preventing prune",
        "Generic prepared plan scanning all partitions",
        "Not checking EXPLAIN partition count after deploy"
      ],
      seniorInsights: "Pruning failure #1: function wrapper on partition key — show EXPLAIN Append node count.",
      commands: [
        "EXPLAIN SELECT count(*) FROM orders WHERE created_at >= '2024-06-01' AND created_at < '2024-07-01';",
        "SET plan_cache_mode = force_custom_plan;",
        "SHOW enable_partition_pruning;"
      ],
      bestPractices: [
        "Match partition key data type exactly in queries",
        "Avoid functions on partition key in WHERE",
        "Verify pruning in EXPLAIN after schema changes",
        "Use pg_partman premake to avoid missing future partitions"
      ],
    },
  }),
  buildQuestion({
    id: "pg-partitioning-3",
    trackId: 'postgresql',
    topic: "partitioning",
    file: "indexing.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Manage partition maintenance: CREATE, ATTACH, DETACH, and DROP safely.",
    sections: {
      interview: "CREATE new partition before data arrives (pg_partman premake). DETACH CONCURRENTLY (PG 14+) removes partition without blocking reads/writes on parent. ATTACH requires validation scan unless WITHOUT VALIDATION on pre-validated data. DROP partition fast alternative to DELETE millions of rows.",
      explanation: "DETACH for archival to cold storage or DROP. ATTACH PARTITION for backfill historical data. Partition-level INDEX builds faster than monolith. VACUUM one partition at a time reduces lock blast radius.",
      production: "Retention policy: DETACH CONCURRENTLY orders_2022_01, export to S3 via COPY, DROP TABLE — 40M row delete avoided, completed in 4 minutes vs 6 hour DELETE lock risk.",
      followUps: [
        "ATTACH CONCURRENTLY PG 14+?",
        "Exchange partition pattern for bulk load?",
        "Global index on partitioned PG version limits?",
        "Replication of partition DDL?"
      ],
      mistakes: [
        "DROP partition without backup confirmation",
        "ATTACH with wrong bound overlapping existing",
        "DELETE millions instead of DROP partition",
        "Missing premake — INSERT into nonexistent partition"
      ],
      seniorInsights: "DETACH + DROP is retention at scale — never DELETE by date range on partitioned table.",
      commands: [
        "ALTER TABLE orders DETACH PARTITION orders_2022_01 CONCURRENTLY;",
        "DROP TABLE orders_2022_01;",
        "SELECT partman.run_maintenance('public.orders'); -- pg_partman"
      ],
      bestPractices: [
        "Automate premake partitions 3 months ahead",
        "Use DETACH CONCURRENTLY for production archival",
        "Backup before DROP partition",
        "Document retention workflow in runbook"
      ],
    },
  }),
  buildQuestion({
    id: "pg-partitioning-4",
    trackId: 'postgresql',
    topic: "partitioning",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Implement partition-wise joins and aggregates for analytics performance.",
    sections: {
      interview: "PG 11+ enable_partitionwise_join and enable_partitionwise_aggregate allow joining/aggr matching partitioned tables per partition — parallelizable. Requires compatible partition bounds and keys. Major win for large star-schema fact+dimension when dimension also partitioned or small.",
      explanation: "Planner creates Append of per-partition joins. enable_partitionwise_aggregate reduces memory for GROUP BY. Both default on in recent PG. EXPLAIN shows Partition-wise Join. Mismatch partition schemes disables optimization.",
      production: "Star query fact_sales partition by month, dim_customers small — partitionwise join reduced 12-partition join from 90s to 18s on PG 15.",
      followUps: [
        "Sub-partition partitionwise?",
        "Hash-hash partition join alignment?",
        "When partitionwise disabled?",
        "Parallel partition-wise join workers?"
      ],
      mistakes: [
        "Different partition bounds on join tables",
        "Partitionwise expected without matching keys",
        "Not enabling on PG 11+ defaults off upgraded systems",
        "Oversized dimension forcing broadcast anyway"
      ],
      seniorInsights: "Partition-wise join requires partition key alignment in join predicate — design fact/dim partition strategy together.",
      commands: [
        "SET enable_partitionwise_join = on;",
        "SET enable_partitionwise_aggregate = on;",
        "EXPLAIN ANALYZE SELECT ... FROM fact JOIN dim ON ...;"
      ],
      bestPractices: [
        "Align partition schemes on frequently joined large tables",
        "Verify partitionwise nodes in EXPLAIN for top analytics queries",
        "Keep dimension tables small or co-partitioned",
        "Upgrade PG to leverage partitionwise improvements"
      ],
    },
  }),
  buildQuestion({
    id: "pg-partitioning-5",
    trackId: 'postgresql',
    topic: "partitioning",
    file: "indexing.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Migrate a large non-partitioned table to declarative partitioning with minimal downtime.",
    sections: {
      interview: "Strategy: create new partitioned parent + partitions, COPY/pg_dump data into correct partitions OR INSERT SELECT batched, CREATE INDEX CONCURRENTLY per partition, brief cutover rename swap. pg_partman partition_data_time for migration helper. Logical replication can sync during migration.",
      explanation: "ALTER TABLE ... PARTITION BY not in-place for existing heap — requires copy. Dual-write period or logical rep catches delta. FK references must be recreated. Sequences shared. Application cutover at low traffic. Validate row counts per partition.",
      production: "400GB orders migration: created partitioned clone, pg_copy physical load per month batch over weekend, logical rep caught delta, 5-min rename swap Monday AM. Rollback plan kept old table 72h.",
      followUps: [
        "Citus distribute from single node?",
        "FK to partitioned table PG 12+?",
        "Trigger-based vs copy migration?",
        "Index creation order during migration?"
      ],
      mistakes: [
        "In-place ALTER expecting instant partition",
        "No row count validation at cutover",
        "Forgetting sequence setval sync",
        "Cutover without lock on application writes"
      ],
      seniorInsights: "Large table partition migration is a project — logical rep + swap is modern standard answer.",
      commands: [
        "CREATE TABLE orders_new (...) PARTITION BY RANGE (created_at);",
        "INSERT INTO orders_2024_06 SELECT * FROM orders WHERE created_at >= ...;",
        "BEGIN; ALTER TABLE orders RENAME TO orders_old; ALTER TABLE orders_new RENAME TO orders; COMMIT;"
      ],
      bestPractices: [
        "Rehearse migration on clone with production volume",
        "Use logical replication for delta sync during copy",
        "Validate counts and checksums per partition at cutover",
        "Keep rollback table until soak period completes"
      ],
    },
  }),

  // ─── performance.js: query-optimization ─────────────────────────────────────
  buildQuestion({
    id: "pg-query-optimization-1",
    trackId: 'postgresql',
    topic: "query-optimization",
    file: "performance.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Walk through systematic PostgreSQL query optimization using EXPLAIN ANALYZE.",
    sections: {
      interview: "Capture query from pg_stat_statements. Run EXPLAIN (ANALYZE, BUFFERS, VERBOSE) — compare estimated vs actual rows. Identify seq scans on large tables, nested loops with high loops count, hash/sort spills to temp. Fix: indexes, stats, query rewrite, work_mem session tuning.",
      explanation: "Buffers: shared hit vs read shows cache effectiveness. Timing per node localizes cost. Rows Removed by Filter indicates index inefficiency. Planning time vs execution time — prepared statement caching. auto_explain in production for slow query capture.",
      production: "Top query 40% DB time — EXPLAIN showed Nested Loop 2M loops. Missing index on line_items.order_id. CREATE INDEX CONCURRENTLY; mean time 120ms → 4ms.",
      followUps: [
        "BUFFERS shared read vs local?",
        "When EXPLAIN ANALYZE modifies data?",
        "Generic vs custom plan prepared statements?",
        "pg_qualstats for predicate analysis?"
      ],
      mistakes: [
        "EXPLAIN without ANALYZE guessing at runtime cost",
        "Fixing query in prod without testing on staging clone",
        "Adding index before checking existing redundant indexes",
        "Ignoring Rows Removed by Filter metric"
      ],
      seniorInsights: "Optimization loop: pg_stat_statements → EXPLAIN ANALYZE → fix → reset stats → verify mean_time drop.",
      commands: [
        "CREATE EXTENSION pg_stat_statements;",
        "EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ...;",
        "SELECT query, calls, mean_exec_time, rows FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
      ],
      bestPractices: [
        "Always use EXPLAIN (ANALYZE, BUFFERS) for investigation",
        "Compare estimated vs actual rows at each plan node",
        "Verify fix impact in pg_stat_statements after deploy",
        "Enable auto_explain for queries exceeding threshold"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-optimization-2",
    trackId: 'postgresql',
    topic: "query-optimization",
    file: "performance.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Use pg_stat_statements for workload analysis and regression detection.",
    sections: {
      interview: "pg_stat_statements normalizes queries tracking calls, total_time, mean_time, rows, shared_blks_read, temp_blks_written. queryid groups identical plans. Identify top total_exec_time consumers first — not just mean_time. Reset stats after optimization to measure delta.",
      explanation: "Requires shared_preload_libraries. track_io_timing adds IO wait. pg_stat_statements_info tracks reset timestamp. Compare snapshots exported to Prometheus. Hypothetical indexes via hypopg before CREATE. pg_store_plans saves plan history.",
      production: "Weekly pg_stat_statements export — detected new deploy query with temp_blks_written spike. work_mem bump for report role + query rewrite eliminated 50GB temp files daily.",
      followUps: [
        "pg_stat_statements vs pg_stat_activity?",
        "Query normalization limitations?",
        "track_planning option PG 13+?",
        "Reset stats safely in production?"
      ],
      mistakes: [
        "Optimizing high mean_time but low call count queries first",
        "Not recording baseline before change",
        "shared_preload_libraries missing after restart",
        "Ignoring temp_blks_written leading indicator"
      ],
      seniorInsights: "Rank by total_exec_time = mean × calls — the 50ms query called 10M times beats 5s query called 100 times.",
      commands: [
        "SELECT query, calls, mean_exec_time, total_exec_time, shared_blks_read, temp_blks_written FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;",
        "SELECT pg_stat_statements_reset();",
        "SELECT * FROM pg_stat_statements_info;"
      ],
      bestPractices: [
        "Export pg_stat_statements metrics to monitoring weekly",
        "Prioritize by total_exec_time not mean alone",
        "Capture baseline before optimization changes",
        "Enable track_io_timing for IO-bound analysis"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-optimization-3",
    trackId: 'postgresql',
    topic: "query-optimization",
    file: "performance.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Identify and fix N+1 query patterns and ORM-generated inefficient SQL.",
    sections: {
      interview: "N+1: loop fetching parent then child per row — shows as many identical queries in pg_stat_activity. Fix: JOIN, WHERE IN batch, ORM eager loading (select_related/prefetch). ORM issues: SELECT *, implicit casts, OFFSET pagination on large tables, lack of LIMIT on relations.",
      explanation: "pg_stat_statements high calls + low rows per call signals N+1. application_name tags help trace to service. Prepared statements may hide in ORM logs — use log_min_duration_statement. Keyset pagination preferred over OFFSET for deep pages.",
      production: "API p99 spike — pg_stat_statements showed 500 calls/sec SELECT * FROM comments WHERE post_id=$1. Django prefetch_related fix reduced to 2 queries per request; p99 800ms → 45ms.",
      followUps: [
        "Lazy vs eager loading trade-offs?",
        "WHERE IN vs JOIN performance?",
        "Cursor-based pagination implementation?",
        "ORM partial index utilization?"
      ],
      mistakes: [
        "Database index on FK without ORM eager load fix",
        "OFFSET 100000 pagination on social feed",
        "SELECT * returning large TOAST columns unnecessarily",
        "Blaming PostgreSQL before checking ORM query log"
      ],
      seniorInsights: "N+1 is app pattern — show pg_stat_statements calls metric as detection signal.",
      commands: [
        "SELECT query, calls, rows/calls AS rows_per_call FROM pg_stat_statements WHERE query LIKE '%comments%' ORDER BY calls DESC;",
        "EXPLAIN ANALYZE SELECT * FROM comments WHERE post_id = ANY($1::int[]);"
      ],
      bestPractices: [
        "Tag connections with application_name per service",
        "Monitor queries with calls > 1000/min and rows/call < 5",
        "Use batch loading or JOIN in ORM configuration",
        "Prefer keyset pagination for large offsets"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-optimization-4",
    trackId: 'postgresql',
    topic: "query-optimization",
    file: "performance.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Database Engineer",
    question: "Optimize JSONB queries and avoid sequential scans on document columns.",
    sections: {
      interview: "Use GIN with jsonb_path_ops for @> containment. Expression indexes on ->> extracted fields for equality filters. jsonb_each for ad-hoc — not indexable. Select only needed keys not entire document. TOAST stores large jsonb — fetching full column expensive.",
      explanation: "CREATE INDEX ON t ((data->>'status')) for WHERE data->>'status' = 'active'. statistics on expressions need ANALYZE. jsonb_populate_record for structured access. Avoid OR across many jsonb paths — separate indexed generated columns better.",
      production: "WHERE data @> '{\"type\":\"premium\"}' seq scanned — GIN jsonb_path_ops index + partial on active records. Combined with generated column status extracted for reporting filter.",
      followUps: [
        "JSON_TABLE PG 17+ vs jsonb_each?",
        "TOAST threshold tuning?",
        "jsonb vs normalized schema trade-off?",
        "Immutable function requirement for jsonb index?"
      ],
      mistakes: [
        "B-tree on entire jsonb column",
        "data->key without GIN for containment",
        "Returning full jsonb blob in list API",
        "No statistics on expression index column"
      ],
      seniorInsights: "Extract hot filter fields to generated STORED columns — cleaner than complex GIN for mixed workload.",
      commands: [
        "CREATE INDEX idx_data_gin ON t USING gin (data jsonb_path_ops);",
        "ALTER TABLE t ADD COLUMN status text GENERATED ALWAYS AS (data->>'status') STORED;",
        "CREATE INDEX idx_status ON t (status);",
        "EXPLAIN SELECT id FROM t WHERE data @> '{\"type\":\"premium\"}';"
      ],
      bestPractices: [
        "GIN for containment; B-tree/expression for equality on extracted fields",
        "Minimize jsonb column width in SELECT lists",
        "Use generated columns for frequently filtered keys",
        "ANALYZE after adding jsonb indexes"
      ],
    },
  }),
  buildQuestion({
    id: "pg-query-optimization-5",
    trackId: 'postgresql',
    topic: "query-optimization",
    file: "performance.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Lead performance incident: database CPU 100% — structured triage approach.",
    sections: {
      interview: "1) pg_stat_activity: active queries, wait_events. 2) pg_stat_statements: top total_time last reset. 3) Check replication lag, autovacuum, checkpoints concurrently. 4) EXPLAIN active query. 5) Mitigate: cancel query, pg_terminate_backend, statement_timeout, route read to replica. 6) Root fix: index, rewrite, scale.",
      explanation: "CPU 100% causes: missing index seq scans, parallel query storm, excessive connection count, autovacuum anti-wraparound, cryptographic functions in query, PL/pgSQL tight loops. RDS Performance Insights maps wait events. Not always query — check connection count and background workers.",
      production: "Black Friday CPU pegged — pg_stat_activity showed 200 identical unindexed facet search queries. Emergency CREATE INDEX CONCURRENTLY on products(category, brand); cancelled runaway reporting session; CPU 95% → 40% in 8 minutes.",
      followUps: [
        "wait_event CPU vs IO vs Lock?",
        "When to fail over vs fix in place?",
        "Connection storm vs query storm differentiation?",
        "PgBouncer queue during CPU saturation?"
      ],
      mistakes: [
        "Restart PostgreSQL as first action losing diagnostic state",
        "Scaling CPU without identifying query root cause",
        "Killing autovacuum during wraparound risk",
        "No pg_stat_statements enabled pre-incident"
      ],
      seniorInsights: "Incident command answer: observe → identify top query → mitigate → fix → postmortem with pg_stat_statements snapshot.",
      commands: [
        "SELECT pid, now()-query_start AS dur, state, wait_event_type, wait_event, left(query,80) FROM pg_stat_activity WHERE state='active';",
        "SELECT pg_cancel_backend(pid);",
        "SELECT query, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 5;"
      ],
      bestPractices: [
        "Maintain pg_stat_statements always enabled",
        "Runbook for CPU incidents with ordered diagnostic queries",
        "Set statement_timeout globally with override role",
        "Post-incident: index/query fix ticket from captured plans"
      ],
    },
  }),

  // ─── backupRecovery.js: backup-recovery ─────────────────────────────────────
  buildQuestion({
    id: "pg-backup-recovery-1",
    trackId: 'postgresql',
    topic: "backup-recovery",
    file: "backupRecovery.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "Compare PostgreSQL backup methods: pg_dump, pg_basebackup, and filesystem snapshots.",
    sections: {
      interview: "pg_dump: logical, portable, slow restore large DBs, good for selective tables. pg_basebackup: physical consistent copy + WAL for PITR. Filesystem snapshot: fast but need pg_start_backup/pg_stop_backup or use pg_backup_start API to ensure consistency. pgBackRest/wal-g unify physical + WAL management.",
      explanation: "pg_dump -Fc custom format parallel restore. pg_basebackup requires replication connection or data dir access. Snapshots on cloud EBS without backup label risk inconsistent copy unless PostgreSQL aware. Continuous archiving enables PITR between backups.",
      production: "Nightly pg_dump -Fc for 50GB schema-only dev refresh; pgBackRest full weekly + incremental daily for 2TB production with 15-min WAL archive RPO.",
      followUps: [
        "pg_dump parallel -j option?",
        "Snapshot backup without pg_backup_start?",
        "pg_dumpall vs pg_dump?",
        "Cloud RDS snapshot vs logical export?"
      ],
      mistakes: [
        "Only pg_dump for 5TB production — RTO days",
        "EBS snapshot without understanding crash consistency",
        "No WAL archive with physical backup — cannot PITR",
        "pg_dump during peak without snapshot isolation"
      ],
      seniorInsights: "Answer matrix: logical for migration/small; physical+WAL for production DR with RPO/RTO SLAs.",
      commands: [
        "pg_dump -Fc -f backup.dump mydb",
        "pg_basebackup -D /backup/base -Fp -Xs -P",
        "SELECT pg_backup_start('snapshot_label', false); -- PG 15+",
        "pgbackrest --stanza=main backup"
      ],
      bestPractices: [
        "Physical backup + WAL archive for production DR",
        "Test restore quarterly measuring actual RTO",
        "Separate backup retention from production disk",
        "Automate backup verification (pg_verifybackup)"
      ],
    },
  }),
  buildQuestion({
    id: "pg-backup-recovery-2",
    trackId: 'postgresql',
    topic: "backup-recovery",
    file: "backupRecovery.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Configure and validate pgBackRest or wal-g backup pipeline.",
    sections: {
      interview: "pgBackRest: stanza config, full/differential/incremental, parallel backup/restore, encryption, S3/Azure/GCS repos. wal-g: delta backups, WAL push, simple S3. Both integrate archive_command. retention policies, backup scheduling via cron/k8s CronJob.",
      explanation: "pgBackRest manifest tracks checksums; pg_verifybackup validates. wal-g backup-push + wal-push. Point-in-time restore from base + WAL replay. Encryption at rest and in transit. Monitor last successful backup age alert.",
      production: "Migrated shell scripts to pgBackRest — backup window 4h → 45min with --process-max=8; restore test automated in CI weekly restoring to ephemeral instance.",
      followUps: [
        "pgBackRest diff vs incr?",
        "wal-g delta backup mechanics?",
        "Backup from standby vs primary?",
        "Encryption key rotation?"
      ],
      mistakes: [
        "No backup verification — corrupt backup discovered at DR",
        "WAL archive and backup tool misconfigured paths",
        "Single backup copy in same region",
        "Retention too short for compliance requirement"
      ],
      seniorInsights: "Name the tool but explain components: base backup + WAL chain + manifest + verify + restore drill.",
      commands: [
        "pgbackrest --stanza=main --type=full backup",
        "pgbackrest --stanza=main info",
        "wal-g backup-push $PGDATA",
        "pgbackrest --stanza=main verify"
      ],
      bestPractices: [
        "Automate backup verification after each run",
        "Store backups in separate region/account",
        "Document restore procedure with measured RTO",
        "Monitor backup job success with alerting"
      ],
    },
  }),
  buildQuestion({
    id: "pg-backup-recovery-3",
    trackId: 'postgresql',
    topic: "backup-recovery",
    file: "backupRecovery.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Perform full database restore from pg_dump custom format backup.",
    sections: {
      interview: "pg_restore -d target_db -j 4 backup.dump restores selective or full. Create empty database first. --section=pre-data/data/post-data for staged restore. Ownership and privileges via --no-owner if cross-env. Extension versions must exist on target.",
      explanation: "Parallel restore -j speeds large restores. Single transaction --single-transaction for atomicity small DBs. Conflicts: existing objects — use --clean carefully. Sequences restored with setval. Large restore: tune maintenance_work_mem, disable triggers temporarily if needed.",
      production: "Restored staging from prod pg_dump -Fc over weekend — pg_restore -j 8 --no-owner --role=staging_app completed 180GB in 2.5h. Verified row counts per schema against source manifest.",
      followUps: [
        "pg_restore vs psql plain SQL dump?",
        "Restore single table from custom dump?",
        "Cross-version pg_restore compatibility?",
        "RDS restore from logical dump?"
      ],
      mistakes: [
        "Restoring into non-empty database without --clean plan",
        "Missing extensions on target causing restore failure",
        "Not disabling application connections during restore",
        "Ignoring sequence setval mismatch post-restore"
      ],
      seniorInsights: "Staging refresh runbook: drop/create DB, pg_restore parallel, ANALYZE, smoke tests.",
      commands: [
        "createdb restore_target",
        "pg_restore -d restore_target -j 8 --no-owner --role=app backup.dump",
        "pg_restore -l backup.dump -- list contents",
        "ANALYZE;"
      ],
      bestPractices: [
        "Test restore procedure on isolated instance regularly",
        "Use parallel pg_restore for large databases",
        "Validate row counts and application smoke tests post-restore",
        "Document extension prerequisites on target server"
      ],
    },
  }),
  buildQuestion({
    id: "pg-backup-recovery-4",
    trackId: 'postgresql',
    topic: "backup-recovery",
    file: "backupRecovery.js",
    difficulty: "hard",
    frequency: "Common",
    role: "DBA",
    question: "Recover individual tables or schemas without full cluster restore.",
    sections: {
      interview: "From pg_dump: pg_restore -t table_name or -n schema only. From physical backup: not granular — must restore whole cluster to temp instance, pg_dump table, import. Logical decoding or replication for ongoing selective sync. pg_copy for partial export if source still up.",
      explanation: "Postgres lacks native table-level PITR from physical backups. Workaround: restore backup to scratch instance, replay WAL to point, pg_dump -t, restore to prod. pg_dump --exclude-table for inverse. Foreign tables for federated access during recovery.",
      production: "Accidental TRUNCATE on config_table — full restore unacceptable. Restored last nightly pg_dump -t config_table to temp DB, diffed rows, INSERT missing rows back to prod in transaction. 12-minute recovery.",
      followUps: [
        "pg_restore --table vs -t?",
        "Point-in-time table recovery patterns?",
        "Delay replica for oops protection?",
        "pg_surgery extension danger?"
      ],
      mistakes: [
        "Attempting table extract from raw data files manually",
        "No regular pg_dump with table-level granularity available",
        "Restoring full 2TB for one table without scratch automation",
        "TRUNCATE without delayed replica or audit log"
      ],
      seniorInsights: "Table-level recovery needs logical backup or PITR-to-scratch — physical backup alone insufficient.",
      commands: [
        "pg_restore -d prod -t config_table backup.dump",
        "pg_dump -t config_table -Fc prod > config_table.dump",
        "CREATE DATABASE scratch; pg_restore -d scratch full.backup; pg_dump -t config_table scratch"
      ],
      bestPractices: [
        "Maintain logical backups alongside physical for granular recovery",
        "Automate scratch instance restore for table-level DR",
        "Consider delayed standby for operator error protection",
        "Audit destructive DDL/DML on critical tables"
      ],
    },
  }),
  buildQuestion({
    id: "pg-backup-recovery-5",
    trackId: 'postgresql',
    topic: "backup-recovery",
    file: "backupRecovery.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Design backup retention, compliance, and encryption for regulated PostgreSQL workloads.",
    sections: {
      interview: "Retention: daily 30d, weekly 12w, monthly 7y per compliance. Immutable WORM storage for SOC2/HIPAA. Encryption: backup files AES-256, KMS-managed keys, TLS in transit. Access audit on backup bucket. Separate backup account from production AWS org.",
      explanation: "pgBackRest repo1-cipher-type=aes-256-cbc. wal-g GPG or SSE-KMS. Legal hold prevents deletion. Cross-region replication of backup bucket. Document RPO/RTO in compliance packet. pg_audit logs who restored when if instrumented.",
      production: "HIPAA Postgres: pgBackRest to S3 Object Lock COMPLIANCE mode 7yr, KMS CMK, backup in separate AWS account with break-glass procedure. Quarterly restore drill logged for auditors.",
      followUps: [
        "RDS automated backup vs custom compliance?",
        "Right to erasure vs backup retention conflict?",
        "Backup access IAM policy pattern?",
        "Air-gapped backup copy?"
      ],
      mistakes: [
        "Backups in same account/region as primary — ransomware risk",
        "No immutability — attacker deletes backups",
        "Encryption without key rotation procedure",
        "Retention policy not matching legal requirements"
      ],
      seniorInsights: "Regulated backup answer includes immutability + separate account + tested restore + audit trail.",
      commands: [
        "# pgBackRest: repo1-s3-key, repo1-cipher-pass",
        "aws s3api put-object-lock-configuration --bucket backups",
        "pgbackrest --stanza=main info"
      ],
      bestPractices: [
        "Immutable backup storage for compliance workloads",
        "Separate cloud account for backup repository",
        "Encrypt backups with KMS and rotate keys",
        "Log and audit every restore operation"
      ],
    },
  }),

  // ─── backupRecovery.js: pitr ─────────────────────────────────────
  buildQuestion({
    id: "pg-pitr-1",
    trackId: 'postgresql',
    topic: "pitr",
    file: "backupRecovery.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "Explain Point-in-Time Recovery (PITR) architecture in PostgreSQL.",
    sections: {
      interview: "Base backup + continuous WAL archiving enables recovery to any timestamp/LSN between backup and latest WAL. recovery.signal file triggers recovery mode on startup. restore_command fetches archived WAL segments. recovery_target_time or recovery_target_lsn sets stop point.",
      explanation: "Archive mode on; archive_command copies WAL. Base backup labels start LSN in pg_backup_label. On restore: copy base, create recovery.signal, set postgresql.conf recovery params or postgresql.auto.conf. PostgreSQL replays WAL until target reached then promotes with pg_ctl promote if desired.",
      production: "Operator error DELETE without WHERE — PITR to 5 minutes before incident using morning base backup + WAL archive. RPO 2 minutes achieved. Total recovery 45 minutes for 500GB.",
      followUps: [
        "recovery_target_action pause vs promote?",
        "Timeline switch during PITR?",
        "pg_combinebackup PG 17+?",
        "PITR on replica vs primary restore?"
      ],
      mistakes: [
        "No WAL archive enabled believing snapshots sufficient",
        "Wrong timezone in recovery_target_time",
        "Missing WAL segment in archive — recovery stops",
        "Promoting recovered instance without revoking old credentials"
      ],
      seniorInsights: "PITR = base + WAL + target — draw timeline on whiteboard for interview.",
      commands: [
        "# postgresql.auto.conf:\nrestore_command = 'cp /wal_archive/%f %p'\nrecovery_target_time = '2024-06-15 14:32:00 UTC'\nrecovery_target_action = promote",
        "touch $PGDATA/recovery.signal",
        "pg_ctl start -D $PGDATA"
      ],
      bestPractices: [
        "Continuous WAL archiving to durable storage",
        "Document recovery_target_time timezone convention UTC",
        "Test PITR quarterly on clone",
        "Verify WAL archive completeness with pg_archivecleanup monitoring"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pitr-2",
    trackId: 'postgresql',
    topic: "pitr",
    file: "backupRecovery.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Configure recovery_target options: time, LSN, name, and XID.",
    sections: {
      interview: "recovery_target_time: human timestamp (timezone critical). recovery_target_lsn: exact WAL position from pg_walfile_name/pg_current_wal_lsn. recovery_target_name: restore point from pg_create_restore_point(). recovery_target_xid: transaction ID. recovery_target_inclusive controls boundary inclusivity.",
      explanation: "pg_create_restore_point('before_migration') before risky DDL — named target for rollback. recovery_target_timeline for advanced timeline forks. pg_waldump finds LSN for incident time correlation. recovery_target_action=pause allows verification before promote.",
      production: "Before risky migration: SELECT pg_create_restore_point('pre_alter_orders'); migration failed; PITR to named restore point — faster than calculating timestamp.",
      followUps: [
        "recovery_target_timeline when needed?",
        "Find LSN for timestamp without replay?",
        "Promote after pause vs immediate?",
        "PITR to standby vs new instance?"
      ],
      mistakes: [
        "Local timezone in recovery_target_time causing 5h error",
        "No restore point before major migration",
        "recovery_target_inclusive misunderstanding off-by-one",
        "PITR without isolating from production network post-recover"
      ],
      seniorInsights: "Named restore points are DBA best practice before migrations — mention pg_create_restore_point.",
      commands: [
        "SELECT pg_create_restore_point('before_index_rebuild');",
        "SELECT pg_current_wal_lsn(), now();",
        "# recovery_target_name = 'before_index_rebuild'",
        "pg_waldump -t | head"
      ],
      bestPractices: [
        "Create named restore points before risky operations",
        "Always use UTC for recovery_target_time",
        "Pause recovery to verify data before promote",
        "Correlate incident time with pg_current_wal_lsn logs"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pitr-3",
    trackId: 'postgresql',
    topic: "pitr",
    file: "backupRecovery.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Troubleshoot PITR failure: missing WAL segment or recovery stops early.",
    sections: {
      interview: "Recovery stops at first missing WAL — check pg_log for \"could not open file\". Verify archive completeness: pg_waldump on archived segments sequence. Gap from archive_command failure or retention too short. pgBackRest/wal-g inventory lists available WAL. recovery_target past available WAL fails.",
      explanation: "WAL segments 16MB named 000000010000000000000001. Timeline history must be continuous. restore_command must return zero on success. Partial segment copy corrupts recovery. Test restore_command manually: cp or aws s3 cp.",
      production: "PITR stopped at 14:35 — WAL segment 0000000100000000000000AB missing from S3. archive_command had failed during 14:30-14:40 window. Restored to 14:30 accepting 5 min data loss; backfilled from application logs.",
      followUps: [
        "pg_wal_replay_resume PG 18+?",
        "Rebuild missing WAL from replica?",
        "wal-g wal-fetch during restore?",
        "Partial write detection in archive?"
      ],
      mistakes: [
        "WAL retention shorter than max time between backup and incident",
        "No monitoring of archive gaps",
        "restore_command typo %f vs %p",
        "Deleting WAL from archive per retention during active PITR need"
      ],
      seniorInsights: "Archive gap detection should be proactive — compare pg_current_wal_lsn to last archived segment continuously.",
      commands: [
        "SELECT * FROM pg_stat_archiver;",
        "ls /wal_archive/ | tail",
        "pg_waldump /wal_archive/0000000100000000000000AA",
        "restore_command = 'aws s3 cp s3://bucket/wal/%f %p'"
      ],
      bestPractices: [
        "Monitor archive lag and gap alerts",
        "Retain WAL beyond minimum RPO window",
        "Test restore_command fetch manually before full PITR",
        "Log archive failures with immediate paging"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pitr-4",
    trackId: 'postgresql',
    topic: "pitr",
    file: "backupRecovery.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Execute PITR on AWS RDS PostgreSQL vs self-managed EC2 PostgreSQL.",
    sections: {
      interview: "RDS: restore to point in time creates NEW instance from automated backups + transaction logs — cannot PITR in-place. Self-managed: manual base + WAL to existing or new EC2. Aurora: PITR similar RDS with shared storage model faster. RTO longer for RDS PITR due to provisioning.",
      explanation: "RDS retention 1-35 days configurable. Cross-region PITR if cross-region backup enabled. Self-managed: pgBackRest restore to time on bare instance — more control, more ops burden. Document connection string switch for RDS PITR new endpoint.",
      production: "RDS prod PITR to T-10min created new instance rds-recovery-20240615; app cutover via Route53 after validation. RTO 35 min including instance create. Self-managed DR region used pgBackRest stanza restore in parallel.",
      followUps: [
        "RDS vs Aurora PITR speed?",
        "In-place RDS rollback impossible why?",
        "Export RDS snapshot vs PITR?",
        "Combine RDS PITR with DMS?"
      ],
      mistakes: [
        "Expecting in-place RDS rollback",
        "PITR RDS instance in same subnet without security review",
        "Not updating application secrets/endpoint after RDS PITR",
        "RDS backup retention 1 day for compliance workload"
      ],
      seniorInsights: "Cloud managed PITR always creates new instance — plan DNS/credential cutover in RTO.",
      commands: [
        "aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier prod --target-db-instance-identifier recovery --restore-time 2024-06-15T14:32:00Z",
        "pgbackrest --stanza=main --type=time \"--target=2024-06-15 14:32:00\" restore"
      ],
      bestPractices: [
        "Document RDS PITR creates new instance with new endpoint",
        "Set RDS backup retention to meet RPO requirements",
        "Rehearse DNS cutover for RDS PITR recovery",
        "Maintain self-managed DR copy if multi-cloud portability needed"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pitr-5",
    trackId: 'postgresql',
    topic: "pitr",
    file: "backupRecovery.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Calculate and communicate RPO/RTO for PITR capability to stakeholders.",
    sections: {
      interview: "RPO: max acceptable data loss = WAL archive granularity + archive lag (e.g., 5 min async archive). RTO: time to restore base + replay WAL + validation + cutover. Document assumptions: team availability, runbook tested, network bandwidth for WAL fetch, instance provisioning time.",
      explanation: "RTO components: detect incident, decision, fetch base backup (TB hours), WAL replay (GB/min depends on IO), smoke test, DNS switch. RPO worse if archive breaks or sync rep not used. Tabletop exercises produce real numbers not guesses.",
      production: "Presented to exec: RPO 5 min (WAL archive), RTO 2h (2TB, last drill 1h 47m + 15m validation). Invested in pgBackRest parallel restore reducing RTO from 4h prior year.",
      followUps: [
        "Sync rep RPO vs archive RPO stacking?",
        "Incremental backup impact on RTO?",
        "Legal max RPO vs technical RPO?",
        "Chaos engineering for DR metrics?"
      ],
      mistakes: [
        "Claiming RPO zero without sync rep or quorum",
        "RTO slideware never validated by drill",
        "Ignoring application validation time in RTO",
        "Archive lag not in RPO calculation"
      ],
      seniorInsights: "Executives want numbers from last drill not theory — bring pgBackRest restore log timestamps.",
      commands: [
        "pgbackrest --stanza=main info",
        "# Document: last restore drill RTO=1h47m at 2TB",
        "SELECT now() - last_archived_time AS archive_lag FROM pg_stat_archiver;"
      ],
      bestPractices: [
        "Measure RTO via quarterly restore drills",
        "Include archive lag in RPO reporting",
        "Update stakeholders after infrastructure changes",
        "Separate OLTP RPO from analytics RPO tiers"
      ],
    },
  }),

  // ─── highAvailability.js: high-availability ─────────────────────────────────────
  buildQuestion({
    id: "pg-high-availability-1",
    trackId: 'postgresql',
    topic: "high-availability",
    file: "highAvailability.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "What are the core components of PostgreSQL high availability?",
    sections: {
      interview: "Primary-replica streaming replication for data redundancy. Automatic failover via Patroni/repmgr/Stolon with DCS (etcd/Consul). Connection routing via PgBouncer/HAProxy/VIP. WAL archiving for PITR. Monitoring replication lag, slot health, and leader status. Quorum sync for RPO zero when required.",
      explanation: "HA stack: app → pooler → Patroni-managed nodes → etcd quorum. Load balancer health checks read-only vs primary. Watchdog/fencing prevents split-brain. Backup independent of HA for logical errors. Multi-AZ placement for AZ failure tolerance.",
      production: "Patroni + etcd 3-node cluster on K8s, PgBouncer service, sync rep to 2 replicas in different AZs. Quarterly failover drill RTO 45s measured.",
      followUps: [
        "Patroni vs repmgr vs manual?",
        "etcd quorum sizing?",
        "HA without automatic failover acceptable when?",
        "Aurora HA vs Patroni?"
      ],
      mistakes: [
        "Two nodes only for etcd — no quorum",
        "HAProxy without read/write split sending writes to replica",
        "No fencing on old primary after failover",
        "Treating read replica as DR without promotion test"
      ],
      seniorInsights: "Draw full stack diagram in interview — pooler, DCS, sync/async tiers, backup side channel.",
      commands: [
        "patronictl list",
        "SELECT * FROM pg_stat_replication;",
        "curl http://etcd:2379/v2/keys/patroni/leader"
      ],
      bestPractices: [
        "Odd-number etcd cluster for quorum",
        "Automate failover with fencing",
        "Separate read and write endpoints in app config",
        "Quarterly failover and PITR drills"
      ],
    },
  }),
  buildQuestion({
    id: "pg-high-availability-2",
    trackId: 'postgresql',
    topic: "high-availability",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Design multi-AZ PostgreSQL HA on Kubernetes with Patroni operator.",
    sections: {
      interview: "Zalando Postgres Operator or CrunchyData PGO deploys Patroni StatefulSets across AZs. Pod anti-affinity spreads replicas. PersistentVolume per pod on fast storage. Services: primary (-rw) and replica (-ro). Sync rep via Patroni synchronous_mode or native sync_standby_names.",
      explanation: "Operator handles failover, backup sidecars (WAL-G), connection pooling optional PgBouncer sidecar. etcd as Patroni DCS or Kubernetes endpoints. Upgrades: rolling pod restart. Monitor via Prometheus postgres_exporter. Network policies restrict replication traffic.",
      production: "GKE 3-AZ Patroni cluster, 1 primary 2 sync replicas, PgBouncer sidecar 1000 app connections → 30 PG connections. Failover tested via pod delete — 38s leader election.",
      followUps: [
        "Local PV vs network storage for PG on K8s?",
        "Operator upgrade strategy?",
        "Cross-cluster DR on K8s?",
        "Resource limits for PostgreSQL pods?"
      ],
      mistakes: [
        "Single AZ node pool — defeats multi-AZ",
        "Shared RWO volume across pods",
        "No podDisruptionBudget — voluntary eviction causes outage",
        "Under-provisioned etcd on same nodes as PG"
      ],
      seniorInsights: "K8s PG HA answer must mention storage class IOPS and anti-affinity — not just Patroni logo.",
      commands: [
        "kubectl get postgresql -n db",
        "kubectl exec -it cluster-0 -- patronictl list",
        "kubectl get pods -o wide -n db"
      ],
      bestPractices: [
        "Pod anti-affinity across AZs",
        "Dedicated fast storage class for WAL/data",
        "PodDisruptionBudget minAvailable 1 for primary",
        "Monitor Patroni leader via Prometheus"
      ],
    },
  }),
  buildQuestion({
    id: "pg-high-availability-3",
    trackId: 'postgresql',
    topic: "high-availability",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Monitor PostgreSQL HA health: replication, lag, and leader election.",
    sections: {
      interview: "Metrics: pg_stat_replication replay_lag, pg_replication_slots retained WAL, Patroni /health and /patroni endpoints, pg_is_in_recovery() on each node, connection count per role. Alerts: lag > SLO, slot inactive, no primary in DCS, split-brain detection via timeline.",
      explanation: "postgres_exporter custom queries for lag bytes. Patroni exposes REST API cluster state. Alert on synchronous_standby_names unfulfilled — commits blocking. Grafana dashboards: lag p99, connections, checkpoints, autovacuum. Synthetic write+read probe through pooler.",
      production: "Datadog monitors: replay_lag > 5s page, patroni_has_leader=0 critical, pg_wal_lsn_diff slot > 5GB warning. Reduced undetected replica failure MTTR from 45min to 3min.",
      followUps: [
        "Lag alert threshold tuning?",
        "False positive lag during vacuum?",
        "Monitor etcd health separately?",
        "CloudWatch RDS replica lag vs replay_lag?"
      ],
      mistakes: [
        "Only monitoring primary CPU not replica lag",
        "No alert on missing sync standby",
        "Patroni REST not scraped by monitoring",
        "Treating flush_lag as user-visible lag on hot standby"
      ],
      seniorInsights: "HA monitoring minimum: leader exists, replay_lag SLO, slot retention, sync standby count.",
      commands: [
        "SELECT application_name, state, replay_lag, sync_state FROM pg_stat_replication;",
        "curl -s http://patroni:8008/patroni | jq .",
        "SELECT pg_is_in_recovery();"
      ],
      bestPractices: [
        "Alert on replication lag exceeding SLO",
        "Monitor Patroni leader and member state",
        "Track replication slot WAL retention",
        "Synthetic transaction probes through HA endpoint"
      ],
    },
  }),
  buildQuestion({
    id: "pg-high-availability-4",
    trackId: 'postgresql',
    topic: "high-availability",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Common",
    role: "DBA",
    question: "Compare Patroni, repmgr, and cloud-managed HA for PostgreSQL.",
    sections: {
      interview: "Patroni: DCS-based leader election, REST API, flexible, industry standard self-managed. repmgr: simpler, witness server, good for smaller deployments. RDS Multi-AZ: managed sync failover same region. Aurora: storage-layer replication, faster failover, different consistency model.",
      explanation: "Patroni supports sync rep, cascading, K8s native. repmgr less active development vs Patroni. Cloud managed trades control for ops reduction. pg_auto_failover (Microsoft) alternative with monitor node. Choose based on team skill, compliance, multi-cloud need.",
      production: "Migrated repmgr to Patroni for K8s compatibility and better REST integration. Kept RDS Multi-AZ for internal tools tier with different RTO/RPO SLA.",
      followUps: [
        "pg_auto_failover vs Patroni?",
        "Aurora storage vs WAL replication?",
        "Custom HA without DCS risks?",
        "License/support considerations?"
      ],
      mistakes: [
        "DIY heartbeat script without fencing in 2024",
        "Patroni without etcd TLS in production",
        "Assuming Aurora identical to PostgreSQL semantically",
        "repmgr without witness on 2-node cluster"
      ],
      seniorInsights: "Pick HA tool matching platform: Patroni for K8s/bare metal, RDS for managed tier, hybrid common at scale.",
      commands: [
        "patronictl list",
        "repmgr cluster show",
        "aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,MultiAZ]'"
      ],
      bestPractices: [
        "Standardize on Patroni for self-managed clusters",
        "Use cloud managed HA for appropriate tier SLAs",
        "Never run custom failover scripts without fencing",
        "Document HA tool choice per environment tier"
      ],
    },
  }),
  buildQuestion({
    id: "pg-high-availability-5",
    trackId: 'postgresql',
    topic: "high-availability",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Cloud Engineer",
    question: "Architect cross-region DR with RPO/RTO tiers alongside same-region HA.",
    sections: {
      interview: "Same-region: sync Patroni replicas RPO 0, RTO ~60s. Cross-region: async physical replica or WAL archive to DR region RPO minutes-hours. DNS/global load balancer routes after regional failover. Application dual-write or read-only DR until promotion. Compliance data residency may restrict region.",
      explanation: "DR promotion: Patroni in DR as independent cluster restored from archive or replica lag accepted. Route53 health check fails over write endpoint. Test regional failure game-day annually. Split-brain across regions prevented by never auto-promoting both.",
      production: "US-East Patroni primary + sync replicas; US-West async replica + daily wal-g copy. Regional DR runbook promotes West replica with 15-min RPO acceptance; RTO 90 min last drill.",
      followUps: [
        "Global database product comparison?",
        "Cross-region sync rep latency impact?",
        "Data residency blocking cross-region DR?",
        "Active-active multi-region PG?"
      ],
      mistakes: [
        "Cross-region sync rep killing commit latency",
        "No DR drill — West replica 7 days lag at real outage",
        "DNS TTL too high slowing cutover",
        "Assuming same-region HA equals regional DR"
      ],
      seniorInsights: "Separate same-region HA (RPO 0) from cross-region DR (RPO > 0) — different architecture and cost.",
      commands: [
        "SELECT application_name, replay_lag FROM pg_stat_replication;",
        "pgbackrest --stanza=main info",
        "patronictl list --role=master"
      ],
      bestPractices: [
        "Document distinct RPO/RTO for HA vs DR tiers",
        "Annual cross-region failover drill",
        "Automate WAL shipping to DR region",
        "Keep DR runbook independent of primary tooling"
      ],
    },
  }),

  // ─── highAvailability.js: failover ─────────────────────────────────────
  buildQuestion({
    id: "pg-failover-1",
    trackId: 'postgresql',
    topic: "failover",
    file: "highAvailability.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "Describe manual PostgreSQL failover steps and risks.",
    sections: {
      interview: "On standby: pg_ctl promote or touch trigger_file (legacy). Old primary must stop accepting writes — fence via Patroni, STONITH, or network isolation. Update application connection strings or VIP. Verify timeline, pg_stat_replication on new primary, recreate slots for remaining replicas.",
      explanation: "Unplanned promotion with lag = data loss equal to replay lag at failure. Split-brain if old primary not fenced — dual writes corrupt data. pg_rewind reintegrates old primary as replica. Synchronous rep reduces loss window. Document promotion checklist.",
      production: "Primary hardware failure — Patroni auto-promoted replica in 42s. Manual intervention only to decommission dead node. Previous manual runbook took 15 min before Patroni adoption.",
      followUps: [
        "pg_ctl promote vs pg_promote()?",
        "Failover vs switchover?",
        "How much data loss with 30s replay lag?",
        "Reintegrate old primary after failover?"
      ],
      mistakes: [
        "Promoting replica without stopping old primary",
        "Not measuring lag before manual promotion",
        "Forgetting to recreate replication slots",
        "Applications cache old primary DNS"
      ],
      seniorInsights: "Manual failover interview: always mention fencing old primary first — split-brain is the disaster.",
      commands: [
        "pg_ctl promote -D $PGDATA",
        "SELECT pg_is_in_recovery();",
        "patronictl failover",
        "pg_rewind --target-pgdata=$PGDATA --source-server=..."
      ],
      bestPractices: [
        "Automate failover with Patroni where possible",
        "Always fence old primary before promotion",
        "Measure replay lag before accepting manual promotion",
        "Maintain written failover checklist"
      ],
    },
  }),
  buildQuestion({
    id: "pg-failover-2",
    trackId: 'postgresql',
    topic: "failover",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "How does Patroni perform automatic failover and leader election?",
    sections: {
      interview: "Patroni agents on each node heartbeat to DCS (etcd). Leader holds leader lock key with TTL. On primary failure, lock expires, replica acquires lock, runs postgresql promote callback, updates leader key. Other replicas reconfigure primary_conninfo to new leader. REST API exposes role.",
      explanation: "loop_wait and ttl tune failover speed vs false positives. synchronous_mode waits for sync standby before responding. callbacks: on_role_change, reload config. bootstrap initializes new cluster. Watchdog optional for split-brain on primary isolation.",
      production: "Network partition isolated primary — Patroni primary demoted itself when could not renew DCS lock; replica promoted. 35s outage. postgresql.conf managed by Patroni — manual edits overwritten.",
      followUps: [
        "Patroni synchronous_mode vs PostgreSQL native sync?",
        "etcd split-brain impact?",
        "Patroni pause mode maintenance?",
        "Custom failover scripts via callbacks?"
      ],
      mistakes: [
        "Editing postgresql.conf outside Patroni scope",
        "etcd on same failed AZ as only primary",
        "ttl too high — slow failover",
        "No application retry on connection failure during failover"
      ],
      seniorInsights: "Patroni failover time = ttl + promote + DNS update — know default ~30-60s.",
      commands: [
        "patronictl list",
        "patronictl show-config",
        "curl http://node:8008/patroni",
        "patronictl pause --role=master"
      ],
      bestPractices: [
        "Run etcd in odd quorum across AZs",
        "Configure application connection retry with backoff",
        "Use Patroni for config management not manual edits",
        "Test Patroni failover in staging monthly"
      ],
    },
  }),
  buildQuestion({
    id: "pg-failover-3",
    trackId: 'postgresql',
    topic: "failover",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Troubleshoot split-brain and dual-primary scenarios after failover.",
    sections: {
      interview: "Symptoms: writes succeed on two nodes, divergent data, replication broken both directions. Cause: old primary not fenced during promotion. Fix: stop writes on wrong primary immediately, pg_rewind or rebuild wrong node as replica, audit divergent data manually if both accepted writes.",
      explanation: "Prevention: STONITH (shutdown old primary), Patroni DCS lock, load balancer health check only on DCS leader, iptables/cloud API isolate. Detection: compare pg_current_wal_lsn and timelines on suspected nodes. Never merge divergent PostgreSQL writes automatically.",
      production: "Misconfigured load balancer sent writes to both nodes 3 minutes during failover — 847 conflicting order rows. Old primary rewound via pg_rewind; conflicts reconciled from application audit log over 4 hours.",
      followUps: [
        "Patroni watchdog mode?",
        "Cloud API fencing example?",
        "Timeline divergence detection?",
        "Application idempotency during failover?"
      ],
      mistakes: [
        "Promoting without confirming old primary down",
        "Load balancer TCP check only — both appear healthy",
        "Delaying fencing hoping old primary recovers",
        "No audit log to reconcile dual-write period"
      ],
      seniorInsights: "Split-brain reconciliation is manual pain — prevention via fencing is the only production answer.",
      commands: [
        "SELECT pg_current_wal_lsn(), pg_is_in_recovery(), pg_control_checkpoint();",
        "patronictl list",
        "# STONITH: aws ec2 stop-instances --instance-ids i-oldprimary"
      ],
      bestPractices: [
        "Implement automatic fencing in failover tooling",
        "Load balancer must check Patroni leader role not just TCP",
        "Alert on multiple nodes accepting writes",
        "Maintain audit trail for post-failover reconciliation"
      ],
    },
  }),
  buildQuestion({
    id: "pg-failover-4",
    trackId: 'postgresql',
    topic: "failover",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Perform zero-downtime switchover (planned failover) with Patroni.",
    sections: {
      interview: "patronictl switchover demotes current primary gracefully, promotes chosen replica, minimal connection drop. Requires healthy sync replica. Application connection pools recycle connections on error. switchover vs failover: no data loss, controlled timing during maintenance.",
      explanation: "Switchover steps: verify lag zero on target, patronictl switchover --master old --candidate new, verify patronictl list, rolling app pool reload. Maintenance: primary OS patches via switchover to upgraded standby. Schedule during low traffic; still test app retry.",
      production: "Monthly OS kernel patch: patronictl switchover to patched replica, patch old primary, switchover back. Total user-visible errors: 12 connection resets caught by app retry — zero failed transactions.",
      followUps: [
        "Switchover with synchronous_mode required?",
        "PgBouncer behavior during switchover?",
        "Cancel switchover mid-flight?",
        "RDS reboot vs switchover?"
      ],
      mistakes: [
        "Switchover to lagging replica",
        "No sync standby available — data loss risk on crash mid-switch",
        "Applications without connection retry",
        "Switchover during active long transactions without notice"
      ],
      seniorInsights: "Planned switchover proves HA works — run monthly, measure connection error rate.",
      commands: [
        "patronictl switchover --master cluster-0 --candidate cluster-1",
        "patronictl list",
        "SHOW POOLS; -- pgbouncer reload"
      ],
      bestPractices: [
        "Monthly planned switchover drill",
        "Verify sync replica caught up before switchover",
        "Ensure app connection retry logic",
        "Document switchover in maintenance runbook"
      ],
    },
  }),
  buildQuestion({
    id: "pg-failover-5",
    trackId: 'postgresql',
    topic: "failover",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Lead post-failover validation checklist before declaring all-clear.",
    sections: {
      interview: "Verify: pg_is_in_recovery false on new primary only, pg_stat_replication shows connected replicas, replay lag nominal, application write/read smoke test, sequences advanced correctly, cron jobs running, replication slots recreated, backup jobs targeting new primary, monitoring updated leader tag.",
      explanation: "Check for orphaned prepared transactions, invalid indexes from interrupted CONCURRENTLY, subscription lag on logical replicas. Compare row counts critical tables vs pre-failover snapshot if available. Re-enable synchronous_standby_names if disabled during crisis.",
      production: "Post-failover checklist caught missing replication slot for analytics replica — CDC silent 2h until slot recreated. Added automated post-failover Ansible playbooks.",
      followUps: [
        "Sequence jump after failover?",
        "Logical replication re-point subscription?",
        "Patroni post-failover config drift?",
        "When to pg_rewind old primary vs rebuild?"
      ],
      mistakes: [
        "Declaring resolved after promote without replica connectivity",
        "Backup still pointing at old hostname",
        "Forgotten logical replication subscription update",
        "Not checking invalid indexes after crash"
      ],
      seniorInsights: "Failover is not done at promote — validation checklist is senior DBA differentiator.",
      commands: [
        "SELECT pg_is_in_recovery();",
        "SELECT * FROM pg_stat_replication;",
        "SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;",
        "SELECT pg_create_physical_replication_slot('replica1');"
      ],
      bestPractices: [
        "Maintain post-failover checklist in runbook",
        "Automate slot and subscription recreation",
        "Run smoke tests before all-clear announcement",
        "Verify backup and monitoring target new primary"
      ],
    },
  }),

  // ─── highAvailability.js: connection-pooling ─────────────────────────────────────
  buildQuestion({
    id: "pg-connection-pooling-1",
    trackId: 'postgresql',
    topic: "connection-pooling",
    file: "highAvailability.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "Database Engineer",
    question: "Why is connection pooling essential for PostgreSQL applications?",
    sections: {
      interview: "PostgreSQL uses process-per-connection — each backend consumes memory and file descriptors. Hundreds of app threads should not map 1:1 to backends. Pooler multiplexes many clients onto fewer server connections. Reduces memory pressure, speeds connection establishment, protects max_connections limit.",
      explanation: "Without pool: app server 200 workers = 200 PG backends × ~10MB. With pool: 200 clients → 20 server connections in transaction mode. Connection time ~ms vs fork backend ~20ms. Pool also centralizes SSL, auth, and routing to primary/replica.",
      production: "Java app with HikariCP pool_size=100 against PG max_connections=100 — exhausted connections during spike. Moved to PgBouncer transaction mode 1000 clients / 50 servers — stable under 3× traffic.",
      followUps: [
        "App-side pool vs external PgBouncer?",
        "max_connections sizing formula?",
        "Pool after failover behavior?",
        "RDS Proxy vs PgBouncer?"
      ],
      mistakes: [
        "max_connections=2000 on PG without pool",
        "Double pooling app + PgBouncer without understanding mode",
        "Each microservice opening 100 connections directly",
        "Ignoring connection count in load tests"
      ],
      seniorInsights: "Process-per-connection is THE reason pooler exists — quantify memory at interview.",
      commands: [
        "SELECT count(*), state FROM pg_stat_activity GROUP BY state;",
        "SHOW max_connections;",
        "SELECT setting FROM pg_settings WHERE name='superuser_reserved_connections';"
      ],
      bestPractices: [
        "Always pool at scale — external PgBouncer or RDS Proxy",
        "Size server connections << client connections",
        "Monitor pg_stat_activity connection count",
        "Reserve superuser connections for admin"
      ],
    },
  }),
  buildQuestion({
    id: "pg-connection-pooling-2",
    trackId: 'postgresql',
    topic: "connection-pooling",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Common",
    role: "DBA",
    question: "Compare transaction pooling, session pooling, and statement pooling modes.",
    sections: {
      interview: "Session mode: client owns server connection for session lifetime — compatible with all PG features, limited multiplexing. Transaction mode: server connection assigned per transaction only — high multiplexing, breaks session-scoped state (SET, temp tables, prepared stmts without DEALLOCATE). Statement mode: rare, per statement, most restrictions.",
      explanation: "Transaction mode: must not use SET without SET LOCAL, advisory locks problematic, LISTEN/NOTIFY broken, cursors dont survive. Session mode for ORMs needing prepared statements persistent. PgBouncer default transaction for web apps. RDS Proxy session pinning on SET variable.",
      production: "Django with transaction pooling failed — used SET search_path in middleware. Fixed: SET LOCAL search_path in transaction or switched affected services to session mode pool.",
      followUps: [
        "Prepared statements in transaction mode?",
        "PgBouncer max_prepared_statements PG 14+?",
        "HikariCP + PgBouncer double pool?",
        "Session mode connection count benefit?"
      ],
      mistakes: [
        "Transaction mode with app using SET SESSION",
        "Prepared statement leak across transactions",
        "Advisory locks in transaction pool — lock lost between txns",
        "LISTEN/NOTIFY through transaction pooler"
      ],
      seniorInsights: "Transaction mode caveat list is interview staple — SET, temp table, prepared stmt, advisory lock.",
      commands: [
        "# pgbouncer.ini pool_mode = transaction",
        "SHOW CONFIG; -- pgbouncer admin",
        "SET LOCAL search_path TO app, public;"
      ],
      bestPractices: [
        "Use transaction mode for stateless web apps",
        "Audit app for session-scoped features before transaction pooling",
        "Use SET LOCAL not SET SESSION in pooled apps",
        "Session mode for admin and migration tools only"
      ],
    },
  }),
  buildQuestion({
    id: "pg-connection-pooling-3",
    trackId: 'postgresql',
    topic: "connection-pooling",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Diagnose connection pool exhaustion and \"too many clients\" errors.",
    sections: {
      interview: "Error: FATAL remaining connection slots reserved or too many clients. Check pg_stat_activity count vs max_connections. Identify source via application_name, client_addr. Causes: pool leak, connection storm deploy, long idle sessions, missing pooler, replication connections consuming slots.",
      explanation: "superuser_reserved_connections leaves slots for admin. idle in transaction holds connection. pg_stat_activity backend_start shows connection age. Terminate idle: pg_terminate_backend. PgBouncer wait queue SHOW POOLS cl_waiting. App connection leak shows steady count growth.",
      production: "Deploy doubled pod count each opening 50 connections — hit max_connections 300. Short-term: raised max_connections to 400. Fix: PgBouncer with default_pool_size=30, app pods reduced to 10 direct max.",
      followUps: [
        "idle_in_transaction_session_timeout?",
        "Connection leak detection in app?",
        "Replication slots vs connection limit?",
        "PgBouncer queue timeout?"
      ],
      mistakes: [
        "Raising max_connections indefinitely",
        "Killing replication backends to free slots",
        "No application_name — cannot trace source",
        "Ignoring idle in transaction as connection consumer"
      ],
      seniorInsights: "Connection incident triage: pg_stat_activity group by application_name, client_addr — find noisy neighbor.",
      commands: [
        "SELECT application_name, client_addr, count(*) FROM pg_stat_activity GROUP BY 1,2 ORDER BY 3 DESC;",
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle' AND query_start < now()-interval '1 hour';",
        "SHOW POOLS;"
      ],
      bestPractices: [
        "Set idle_in_transaction_session_timeout globally",
        "Tag all connections with application_name",
        "Alert connection count > 80% max_connections",
        "Use pooler to bound server connection count"
      ],
    },
  }),
  buildQuestion({
    id: "pg-connection-pooling-4",
    trackId: 'postgresql',
    topic: "connection-pooling",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Design connection pooling architecture for microservices accessing shared PostgreSQL.",
    sections: {
      interview: "Central PgBouncer cluster or sidecar per AZ. Per-service database roles and pool_size limits. Transaction mode for stateless APIs. Read/write split: separate pools to primary vs replicas. Avoid each microservice unlimited HikariCP — cap total server connections across fleet.",
      explanation: "Formula: sum(default_pool_size per service) + replication + admin < max_connections × 0.8. PgBouncer user auth via auth_query from pg_shadow. TLS termination at pooler. Kubernetes: PgBouncer Deployment as shared service in mesh.",
      production: "40 microservices shared one RDS — connection chaos. Deployed PgBouncer per AZ with auth_query, per-service user pool_mode=transaction max 15 server conns each. Total server connections capped 120 on max_connections=150 RDS.",
      followUps: [
        "auth_user in PgBouncer?",
        "RDS Proxy multi-tenant?",
        "Circuit breaker on pool exhaustion?",
        "Separate pool per database vs per user?"
      ],
      mistakes: [
        "Each microservice 50 Hikari connections no central cap",
        "Shared DB user for all services — no attribution",
        "Single PgBouncer SPOF without HA",
        "No pool sizing math documented"
      ],
      seniorInsights: "Fleet connection budget spreadsheet — service × pool_size = must fit max_connections.",
      commands: [
        "# pgbouncer.ini auth_query = SELECT usename, passwd FROM pg_shadow WHERE usename=$1",
        "auth_user = pgbouncer_auth",
        "SHOW DATABASES;",
        "SHOW CLIENTS;"
      ],
      bestPractices: [
        "Central connection budget across microservices",
        "Per-service DB user and pool limits",
        "HA PgBouncer with multiple instances + LB",
        "Monitor PgBouncer SHOW STATS wait times"
      ],
    },
  }),
  buildQuestion({
    id: "pg-connection-pooling-5",
    trackId: 'postgresql',
    topic: "connection-pooling",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "Database Engineer",
    question: "Handle prepared statements, advisory locks, and LISTEN/NOTIFY with pooling.",
    sections: {
      interview: "Transaction pooling: prepared statements must be DEALLOCATE ALL before connection return or use PgBouncer max_prepared_statements (PG14+). Advisory locks dont survive transaction end in transaction mode — use session mode or DB-level locking. LISTEN/NOTIFY requires dedicated session mode connection outside pool.",
      explanation: "PgBouncer tracks prepared stmts per client-server mapping in newer versions. ORMs (Rails, Hibernate) often incompatible with transaction pool without config. NOTIFY listener long-lived connection bypasses pooler to dedicated channel. pg_advisory_xact_lock preferred over session lock in transaction mode.",
      production: "Rails prepared statements broke under PgBouncer transaction mode — disabled prepared_statements in database.yml OR moved to session pool for Rails tier only while Node APIs stayed transaction pool.",
      followUps: [
        "PgBouncer 1.21 prepared statement support?",
        "Skip locked with transaction pool?",
        "Temp tables in transaction mode?",
        "RDS Proxy session pinning?"
      ],
      mistakes: [
        "ORM prepared statements + transaction pool without testing",
        "pg_advisory_lock session lock in transaction pool",
        "LISTEN through PgBouncer transaction pool",
        "Not documenting which services need session mode"
      ],
      seniorInsights: "Pool mode compatibility matrix per app framework — real production gotcha.",
      commands: [
        "DEALLOCATE ALL;",
        "SELECT pg_advisory_xact_lock(12345);",
        "LISTEN order_events; -- dedicated session connection",
        "SHOW CONFIG; | grep max_prepared"
      ],
      bestPractices: [
        "Test ORM with target pool mode in staging",
        "Use pg_advisory_xact_lock in transaction pooled apps",
        "Dedicated session connection for LISTEN/NOTIFY",
        "Document per-service pool mode requirements"
      ],
    },
  }),

  // ─── highAvailability.js: pgbouncer ─────────────────────────────────────
  buildQuestion({
    id: "pg-pgbouncer-1",
    trackId: 'postgresql',
    topic: "pgbouncer",
    file: "highAvailability.js",
    difficulty: "easy",
    frequency: "Very Common",
    role: "DBA",
    question: "What is PgBouncer and how do you configure basic pool settings?",
    sections: {
      interview: "PgBouncer lightweight connection pooler. pgbouncer.ini: [databases] maps alias to connection string, [pgbouncer] pool_mode, default_pool_size, max_client_conn, listen_port 6432. Auth via auth_file or auth_query. Admin console: psql -p 6432 pgbouncer.",
      explanation: "default_pool_size server connections per user/database pair. max_client_conn total clients. reserve_pool for burst. server_lifetime recycles connections. unix socket or TCP. log_connections for audit.",
      production: "Standard config: transaction mode, default_pool_size=25, max_client_conn=1000, auth_query for credential rotation without ini reload.",
      followUps: [
        "PgBouncer vs pgpool-II?",
        "Unix socket vs TCP latency?",
        "Multiple PgBouncer behind LB?",
        "Version compatibility with PG 16?"
      ],
      mistakes: [
        "pool_mode=session defeating multiplexing purpose",
        "auth_file plaintext passwords in repo",
        "default_pool_size equal to max_client_conn",
        "No max_db_connections limit per database"
      ],
      seniorInsights: "Know pgbouncer.ini sections: databases, pgbouncer, users — admin question frequent.",
      commands: [
        "psql -h localhost -p 6432 -U pgbouncer pgbouncer -c \"SHOW POOLS;\"",
        "RELOAD; -- admin console",
        "# pool_mode = transaction\ndefault_pool_size = 25\nmax_client_conn = 1000"
      ],
      bestPractices: [
        "Start with transaction mode for web workloads",
        "Use auth_query for credential management",
        "Set max_client_conn >> default_pool_size",
        "Monitor via SHOW POOLS and SHOW STATS"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pgbouncer-2",
    trackId: 'postgresql',
    topic: "pgbouncer",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Common",
    role: "Database Engineer",
    question: "Configure PgBouncer auth_query and integrate with SCRAM authentication.",
    sections: {
      interview: "auth_query executes on PostgreSQL to fetch password hash for client user. auth_user connects to run query: SELECT usename, passwd FROM pg_shadow WHERE usename=$1. Supports SCRAM hashes from PG 10+. Avoids duplicating passwords in auth_file.",
      explanation: "Create pgbouncer_auth role with limited privileges executing security definer function if not direct pg_shadow access. SCRAM in PostgreSQL 14+ default. PgBouncer 1.17+ SCRAM client auth. Rotate passwords in PG only — pooler picks up on next auth.",
      production: "Migrated from auth_file MD5 to auth_query SCRAM — security audit finding closed. pgbouncer_auth user cannot login interactively, only via auth_query path.",
      followUps: [
        "security definer function vs pg_shadow?",
        "Client cert auth through PgBouncer?",
        "auth_hba_file option?",
        "Password rotation without disconnect?"
      ],
      mistakes: [
        "auth_user with superuser privileges",
        "auth_file MD5 in 2024 production",
        "auth_query function SQL injection in username",
        "Not TLS between PgBouncer and PostgreSQL"
      ],
      seniorInsights: "auth_query is production standard — explain auth_user minimal privilege pattern.",
      commands: [
        "CREATE USER pgbouncer_auth PASSWORD '...';\nGRANT pg_read_all_settings TO pgbouncer_auth; -- or custom fn",
        "auth_query = SELECT usename, passwd FROM pg_shadow WHERE usename=$1",
        "auth_type = scram-sha-256"
      ],
      bestPractices: [
        "Use auth_query not static auth_file in production",
        "SCRAM between client-PgBouncer and PgBouncer-PG",
        "Minimal privilege auth_user",
        "TLS for all pooler connections"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pgbouncer-3",
    trackId: 'postgresql',
    topic: "pgbouncer",
    file: "highAvailability.js",
    difficulty: "medium",
    frequency: "Very Common",
    role: "Production Support",
    question: "Monitor PgBouncer with SHOW commands and troubleshoot pool saturation.",
    sections: {
      interview: "SHOW POOLS: cl_active, cl_waiting, sv_active, sv_idle, maxwait. SHOW STATS: totals and averages. SHOW CLIENTS/SERVERS: connection detail. cl_waiting > 0 sustained = pool too small or slow queries holding server connections. maxwait shows longest wait seconds.",
      explanation: "Saturation fixes: increase default_pool_size, optimize long queries, ensure transaction mode releases quickly, add PgBouncer instances. query_wait_timeout kills waiting clients. server_idle_timeout closes unused server connections.",
      production: "cl_waiting peaked 847 during sale — default_pool_size 20 insufficient. Raised to 50, optimized 3 slow queries holding connections 30s+, cl_waiting zero during next sale.",
      followUps: [
        "Export PgBouncer metrics to Prometheus?",
        "pgbouncer_exporter Grafana?",
        "Pool saturation vs PG CPU saturation?",
        "reserve_pool configuration?"
      ],
      mistakes: [
        "Ignoring cl_waiting metric until users timeout",
        "Increasing pool_size without checking PG max_connections headroom",
        "Long transactions holding pooled server connection",
        "No query_wait_timeout — infinite client wait"
      ],
      seniorInsights: "SHOW POOLS cl_waiting is the PgBouncer panic metric — dashboard it.",
      commands: [
        "SHOW POOLS;",
        "SHOW STATS;",
        "SHOW CLIENTS;",
        "SET query_wait_timeout = 120; -- pgbouncer.ini"
      ],
      bestPractices: [
        "Dashboard cl_waiting and maxwait continuously",
        "Size pool considering query duration P99",
        "Set query_wait_timeout to fail fast",
        "Alert sv_active approaching default_pool_size sustained"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pgbouncer-4",
    trackId: 'postgresql',
    topic: "pgbouncer",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Common",
    role: "Cloud Engineer",
    question: "Deploy highly available PgBouncer tier with failover routing to PostgreSQL primary.",
    sections: {
      interview: "Multiple PgBouncer instances behind HAProxy/NLB. Patroni REST or consul-template updates backend primary address in pgbouncer.ini or use host=all in database line with separate routing layer. On failover: RELOAD PgBouncer or automated config push. Health check PgBouncer not just PostgreSQL.",
      explanation: "PgBouncer HA not built-in — stateless pooler instances scale horizontally. primary_conninfo change on failover requires pgbouncer database host update — automate via Patroni callback script calling RELOAD. Avoid single PgBouncer pod SPOF. Co-locate pooler with app in same AZ for latency with cross-AZ PG replica routing for reads.",
      production: "3 PgBouncer instances behind NLB, Patroni on_failover callback runs sed + pgbouncer -R on all poolers. Failover connection blip 2s average with app retry.",
      followUps: [
        "PgBouncer on same host as PG?",
        "K8s headless service for PgBouncer?",
        "Read/write split in PgBouncer config?",
        "AWS RDS Proxy HA built-in comparison?"
      ],
      mistakes: [
        "Single PgBouncer instance production SPOF",
        "Manual pgbouncer.ini host update during failover",
        "HAProxy checking PG through wrong pooler backend",
        "Not reloading all PgBouncer instances after primary change"
      ],
      seniorInsights: "PgBouncer HA = stateless N instances + automated primary tracking — not Patroni for pooler itself.",
      commands: [
        "# Patroni callback: sed -i \"s/host=.*/host=newprimary/\" /etc/pgbouncer/pgbouncer.ini && pgbouncer -R",
        "SHOW DATABASES;",
        "patronictl list"
      ],
      bestPractices: [
        "Run minimum 2 PgBouncer instances behind LB",
        "Automate primary address update on failover",
        "Health check each PgBouncer instance",
        "Test failover end-to-end including pooler reload"
      ],
    },
  }),
  buildQuestion({
    id: "pg-pgbouncer-5",
    trackId: 'postgresql',
    topic: "pgbouncer",
    file: "highAvailability.js",
    difficulty: "hard",
    frequency: "Rare",
    role: "DBA",
    question: "Advanced PgBouncer tuning: pool sizing, timeouts, and multi-tenant isolation.",
    sections: {
      interview: "Per-database pool_size override in [databases] section. max_user_connections limit noisy tenant. server_round_robin for load spread. pkt_buf/max_packet_size for large payloads. disable_pqexec for simple protocol. Application naming via connect_query SET application_name.",
      explanation: "Multi-tenant: separate database alias per tenant same PG database different pool_size. track_extra_parameters for SET tracking PG 14+. client_idle_timeout disconnects idle clients. query_timeout kills long server queries protecting pool.",
      production: "SaaS 200 tenants shared pool — one tenant batch job exhausted pool. Implemented per-tenant PgBouncer database alias with max_user_connections=5 for free tier, 50 for enterprise.",
      followUps: [
        "PgBouncer vs RDS Proxy feature matrix?",
        "Pool per tenant vs per tier?",
        "admin_users security?",
        "PgBouncer connection to multiple PG clusters?"
      ],
      mistakes: [
        "Single pool_size for heterogeneous tenant SLAs",
        "No query_timeout — one slow query blocks pool",
        "connect_query SET on every checkout overhead ignored",
        "admin password default pgbouncer"
      ],
      seniorInsights: "Multi-tenant pool isolation at PgBouncer layer — enterprise SaaS architecture pattern.",
      commands: [
        "# [databases]\ntenant_a = host=pg dbname=shared pool_size=5 max_user_connections=5\ntenant_b = host=pg dbname=shared pool_size=50",
        "connect_query = SET application_name='via-pgbouncer'",
        "SHOW CONFIG;"
      ],
      bestPractices: [
        "Tier pool limits by tenant SLA",
        "Set query_timeout to protect shared pools",
        "Secure admin console with strong auth_users",
        "Use connect_query for application_name attribution"
      ],
    },
  }),
];
