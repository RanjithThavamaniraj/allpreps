/**
 * PostgreSQL & MySQL track generator definitions.
 * Run: node scripts/generate-db-tracks.mjs
 */

export const DB_TRACKS = {
  postgresql: {
    id: 'postgresql',
    label: 'PostgreSQL',
    topics: [
      { slug: 'architecture', file: 'architecture.js', label: 'Architecture' },
      { slug: 'sql-fundamentals', file: 'architecture.js', label: 'SQL Fundamentals' },
      { slug: 'indexing', file: 'indexing.js', label: 'Indexing' },
      { slug: 'mvcc', file: 'mvcc.js', label: 'MVCC' },
      { slug: 'performance', file: 'performance.js', label: 'Performance Tuning' },
      { slug: 'replication', file: 'replication.js', label: 'Replication' },
      { slug: 'backup-recovery', file: 'backupRecovery.js', label: 'Backup & Recovery' },
      { slug: 'high-availability', file: 'highAvailability.js', label: 'High Availability' },
    ],
    learningPath: [
      'Architecture', 'SQL Fundamentals', 'Indexing', 'MVCC',
      'Performance Tuning', 'Replication', 'Backup & Recovery', 'High Availability',
    ],
    scenarios: [
      'Autovacuum Not Keeping Up', 'Replication Lag on Standby', 'Connection Pool Exhaustion',
      'Bloat Causing Slow Queries', 'Failover During Primary Outage', 'WAL Disk Full',
      'Lock Contention on Hot Table', 'Index Missing on Production Query',
      'pg_hba.conf Authentication Failure', 'Logical Replication Conflict',
      'Partition Pruning Not Working', 'Checkpoint Tuning Regression',
      'Streaming Replication Slot Bloat', 'Backup Restore RTO Missed',
      'Patroni Cluster Split Brain', 'Query Plan Regression After Upgrade',
      'Toast Table Bloat', 'Idle in Transaction Session Leak',
      'Extension Upgrade Failure', 'Cross-Region Read Replica Lag',
    ],
  },
  mysql: {
    id: 'mysql',
    label: 'MySQL',
    topics: [
      { slug: 'architecture', file: 'architecture.js', label: 'Architecture' },
      { slug: 'sql-fundamentals', file: 'architecture.js', label: 'SQL Fundamentals' },
      { slug: 'indexing', file: 'indexing.js', label: 'Indexes' },
      { slug: 'query-optimization', file: 'queryOptimization.js', label: 'Query Optimization' },
      { slug: 'replication', file: 'replication.js', label: 'Replication' },
      { slug: 'performance', file: 'performance.js', label: 'Performance Tuning' },
      { slug: 'backup-recovery', file: 'backupRecovery.js', label: 'Backup & Recovery' },
      { slug: 'high-availability', file: 'highAvailability.js', label: 'High Availability' },
    ],
    learningPath: [
      'Architecture', 'SQL Fundamentals', 'Indexes', 'Query Optimization',
      'Replication', 'Backup & Recovery', 'Performance Tuning', 'High Availability',
    ],
    scenarios: [
      'Replication Lag on Replica', 'InnoDB Lock Wait Timeout', 'Binary Log Disk Full',
      'GTID Replication Error', 'Slow Query Log Spike', 'Connection Limit Reached',
      'MHA Failover Failure', 'Corrupted InnoDB Tablespace', 'Group Replication Node Expelled',
      'Backup LVM Snapshot Consistency Issue', 'Index Not Used After Migration',
      'Deadlock Storm on Checkout Table', 'Replica SQL Thread Stopped',
      'Buffer Pool Too Small', 'Table Metadata Lock Blocking DDL',
      'Semi-Sync Replication Timeout', 'Partition Maintenance Failure',
      'Privilege Escalation via DEFINER View', 'Orchestrator Recovery Stuck',
      'Galera Cluster Desync',
    ],
  },
};

const PROMPTS = {
  easy: [
    (topic, label) => `Explain the fundamentals of ${topic} in ${label}.`,
    (topic, label) => `What is ${topic} and why does it matter for ${label} DBAs?`,
    (topic, label) => `Describe a basic production use case for ${topic}.`,
    (topic, label) => `How would you explain ${topic} to a junior database engineer?`,
  ],
  medium: [
    (topic, label) => `How do you implement and monitor ${topic} in production ${label}?`,
    (topic, label) => `What are common pitfalls when working with ${topic}?`,
    (topic, label) => `How do you troubleshoot ${topic}-related performance issues?`,
    (topic, label) => `Compare best-practice approaches to ${topic} at scale.`,
  ],
  hard: [
    (topic, label) => `Design a highly available ${label} solution leveraging ${topic}.`,
    (topic, label) => `Lead an incident where ${topic} was the root cause — what do you present?`,
    (topic, label) => `How would you optimize ${topic} under peak load and strict RPO/RTO?`,
    (topic, label) => `Explain failure modes and recovery strategies for ${topic}.`,
  ],
};

function buildAnswer(track, topic, difficulty) {
  const level = difficulty === 'easy' ? 'Beginner' : difficulty === 'medium' ? 'Intermediate' : 'Advanced';
  return `[${topic} — ${level}]\n\nStrong ${track.label} interview answers for ${topic} should cover:\n• Core architecture and how ${topic} fits in the ${track.label} stack\n• Operational monitoring signals and diagnostic queries\n• Common failure modes and mitigation patterns\n• Security, reliability, and performance trade-offs\n\nInclude concrete examples from production troubleshooting and reference official ${track.label} documentation for version-specific behavior.`;
}

function buildCommand(track, topic) {
  if (track.id === 'postgresql') {
    return `-- ${topic}\nSELECT * FROM pg_stat_activity;\nEXPLAIN (ANALYZE, BUFFERS) SELECT ...;\nSELECT * FROM pg_stat_replication;`;
  }
  return `-- ${topic}\nSHOW ENGINE INNODB STATUS\\G\nSHOW SLAVE STATUS\\G\nEXPLAIN FORMAT=JSON SELECT ...;`;
}

export function generateQuestionsForDbTrack(track) {
  const byFile = {};
  const difficulties = ['easy', 'medium', 'hard'];

  for (const difficulty of difficulties) {
    for (let n = 0; n < 50; n++) {
      const topicMeta = track.topics[n % track.topics.length];
      const variant = Math.floor(n / track.topics.length);
      const promptFn = PROMPTS[difficulty][variant % PROMPTS[difficulty].length];
      const q = {
        id: `${track.id}-${topicMeta.slug}-${difficulty}-${n + 1}`,
        technology: track.id,
        category: track.id,
        difficulty,
        question: `${topicMeta.label}: ${promptFn(topicMeta.label, track.label)}`,
        answer: buildAnswer(track, topicMeta.label, difficulty),
        command: buildCommand(track, topicMeta.label),
        tags: [track.id, topicMeta.slug, difficulty],
      };
      if (!byFile[topicMeta.file]) byFile[topicMeta.file] = [];
      byFile[topicMeta.file].push(q);
    }
  }

  track.scenarios.forEach((scenario, idx) => {
    const difficulty = idx < 7 ? 'easy' : idx < 14 ? 'medium' : 'hard';
    const file = 'highAvailability.js';
    const q = {
      id: `${track.id}-scenario-${idx + 1}`,
      technology: track.id,
      category: track.id,
      difficulty,
      question: `[Production Scenario] ${scenario}: What is your troubleshooting approach?`,
      answer: `[Production Scenario — ${difficulty}]\n\nContext: On-call for ${track.label} production. ${scenario} reported.\n\n1. Confirm blast radius and customer impact.\n2. Collect logs, metrics, and recent changes.\n3. Stabilize — failover, scale, kill blocker sessions, or rollback.\n4. Document root cause and preventive actions.\n\nStructure: detect → triage → mitigate → communicate → prevent recurrence.`,
      command: buildCommand(track, scenario),
      tags: [track.id, 'production-scenario', 'scenario'],
    };
    if (!byFile[file]) byFile[file] = [];
    byFile[file].push(q);
  });

  return byFile;
}

/** Seed questions merged into topic files (interview-quality samples) */
export const POSTGRESQL_SEEDS = {
  architecture: [
    { difficulty: 'easy', question: 'Describe the PostgreSQL process architecture: postmaster, backends, and background workers.', answer: 'PostgreSQL uses a postmaster parent process that listens for connections and forks backend processes per client session.\n• Background workers handle autovacuum, checkpointer, WAL writer, stats collector, and optional logical replication apply workers.\n• Shared memory holds buffer pool, WAL buffers, and lock tables.\n• Each connection is an OS process — heavy connection counts require pooling (PgBouncer).\n• Crash recovery replays WAL from last checkpoint on restart.', command: 'SELECT pid, usename, application_name, state, query FROM pg_stat_activity;\nSELECT name, setting FROM pg_settings WHERE name LIKE \'max_connections\';' },
    { difficulty: 'medium', question: 'How do tablespaces and storage layout affect PostgreSQL operations?', answer: 'Tablespaces map database objects to filesystem directories.\n• Default pg_default and pg_global tablespaces cover most deployments.\n• Separate tablespaces allow tiering hot data on NVMe and archives on cheaper storage.\n• CREATE TABLESPACE requires OS directory ownership by postgres user.\n• Moving tables between tablespaces rewrites data — plan maintenance windows.\n• Monitor disk per tablespace to avoid WAL or data partition full incidents.', command: 'SELECT spcname, pg_tablespace_location(oid) FROM pg_tablespace;\nSELECT relname, tablespace FROM pg_tables WHERE schemaname = \'public\';' },
  ],
  mvcc: [
    { difficulty: 'easy', question: 'What is MVCC in PostgreSQL and how does it handle concurrent reads and writes?', answer: 'Multi-Version Concurrency Control keeps multiple row versions visible to different transactions.\n• Each row has xmin (insert xid) and xmax (delete/update xid) transaction IDs.\n• Readers do not block writers; writers do not block readers.\n• Old row versions remain until VACUUM reclaims dead tuples.\n• Transaction isolation levels (Read Committed default, Repeatable Read, Serializable) control visibility.\n• Long transactions prevent vacuum from reclaiming space — causes bloat.', command: 'SELECT xmin, xmax, * FROM orders LIMIT 5;\nSHOW transaction_isolation;\nSELECT datname, age(datfrozenxid) FROM pg_database;' },
    { difficulty: 'medium', question: 'Explain WAL (Write-Ahead Log) and its role in PostgreSQL durability.', answer: 'WAL ensures durability and crash recovery before data files are updated.\n• Changes are appended to WAL first; checkpoint flushes dirty buffers to data files.\n• wal_level controls replication and logical decoding (minimal, replica, logical).\n• Archive mode enables PITR via pg_basebackup + WAL archives.\n• Monitor pg_wal directory size and wal_segment_size.\n• Synchronous_commit trade-off: off improves latency, risks last transactions on crash.', command: 'SHOW wal_level;\nSHOW archive_mode;\nSELECT pg_current_wal_lsn(), pg_walfile_name(pg_current_wal_lsn());\nSELECT * FROM pg_stat_wal;' },
    { difficulty: 'hard', question: 'How does autovacuum work and when does it fail to keep up?', answer: 'Autovacuum reclaims dead tuples and prevents transaction ID wraparound.\n• Triggered when dead tuple ratio exceeds autovacuum_vacuum_scale_factor threshold.\n• Also runs anti-wraparound vacuums on tables approaching age(datfrozenxid) limit.\n• Fails to keep up when: massive bulk deletes, long idle-in-transaction sessions, autovacuum workers too few, or aggressive cost limits.\n• Symptoms: bloat, seq scans getting slower, imminent wraparound warnings.\n• Mitigate: lower scale factor on hot tables, increase autovacuum_max_workers, manual VACUUM (FULL only as last resort).', command: 'SELECT relname, n_dead_tup, last_autovacuum, autovacuum_count\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;\nSELECT * FROM pg_stat_progress_vacuum;' },
  ],
  replication: [
    { difficulty: 'medium', question: 'Compare streaming replication vs logical replication in PostgreSQL.', answer: 'Streaming replication (physical): ships WAL records to standby; standby is byte-for-byte copy; read-only queries on hot standby.\n• Synchronous vs asynchronous trade-off for RPO.\n• Replication slots prevent WAL removal on primary.\n\nLogical replication: publishes row-level changes via pgoutput plugin; subscribers apply via apply workers.\n• Selective table replication, cross-version upgrades, zero-downtime migrations.\n• Conflicts possible on subscribers — need conflict handlers.\n\nChoose physical for HA failover; logical for selective sync and upgrades.', command: 'SELECT * FROM pg_stat_replication;\nSELECT * FROM pg_publication;\nSELECT * FROM pg_subscription;' },
    { difficulty: 'hard', question: 'How do you set up and monitor streaming replication with failover?', answer: 'Primary creates replication role; standby uses pg_basebackup -R for standby.signal and primary_conninfo.\n• Monitor pg_stat_replication: write_lag, flush_lag, replay_lag.\n• Use Patroni, repmgr, or cloud-managed HA for automated failover.\n• Synchronous_standby_names for zero data loss at cost of write latency.\n• Test failover quarterly; verify rewind or resync procedures.\n• Alert on lag > SLA and replication slot inactive.', command: 'SELECT client_addr, state, sync_state,\n  write_lag, flush_lag, replay_lag\nFROM pg_stat_replication;\nSELECT slot_name, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained\nFROM pg_replication_slots;' },
  ],
  indexing: [
    { difficulty: 'easy', question: 'What index types does PostgreSQL support and when use each?', answer: '• B-tree (default): equality and range queries on most columns.\n• Hash: equality only; rarely used vs btree.\n• GiST/GIN/SP-GiST: full-text search, JSONB, geospatial, arrays.\n• BRIN: very large tables with natural physical correlation (timestamps).\n• Partial indexes: index subset matching WHERE clause — smaller, faster.\n• Covering indexes (INCLUDE): index-only scans without heap access.', command: 'CREATE INDEX idx_orders_date ON orders(order_date);\nCREATE INDEX idx_orders_open ON orders(status) WHERE status = \'OPEN\';\nCREATE INDEX idx_docs ON documents USING GIN (to_tsvector(\'english\', body));' },
    { difficulty: 'medium', question: 'Explain table partitioning strategies in PostgreSQL.', answer: 'Declarative partitioning (PG 10+): RANGE, LIST, HASH on parent table.\n• Partition pruning skips irrelevant partitions at plan time.\n• Attach/detach partitions for archival without full rewrite.\n• Each partition can have own indexes; global uniqueness requires partition key in PK.\n• Common pattern: monthly RANGE on created_at for time-series.\n• Pitfall: missing partition key in WHERE prevents pruning.', command: 'CREATE TABLE events (\n  id bigint,\n  created_at timestamptz NOT NULL,\n  payload jsonb\n) PARTITION BY RANGE (created_at);\n\nCREATE TABLE events_2024_06 PARTITION OF events\n  FOR VALUES FROM (\'2024-06-01\') TO (\'2024-07-01\');' },
  ],
  performance: [
    { difficulty: 'medium', question: 'How do you analyze a slow query using EXPLAIN ANALYZE in PostgreSQL?', answer: 'EXPLAIN (ANALYZE, BUFFERS) executes the query and shows actual vs estimated rows.\n• Look for Seq Scan on large tables → missing index.\n• Nested Loop with high loops → bad join order or stale stats.\n• Sort/Hash aggregate spilling to disk → work_mem too low.\n• Check Buffers: read vs hit for cache efficiency.\n• Run ANALYZE on tables after bulk loads; consider extended statistics for correlated columns.', command: 'EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT o.* FROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.region = \'APAC\' AND o.created_at > now() - interval \'7 days\';\n\nSELECT * FROM pg_stat_user_tables WHERE relname = \'orders\';' },
  ],
  backupRecovery: [
    { difficulty: 'medium', question: 'Describe PostgreSQL backup and PITR recovery workflow.', answer: 'Base backup via pg_basebackup or filesystem snapshot + continuous WAL archiving.\n• archive_command copies WAL segments to safe storage (S3, NFS).\n• PITR: restore base backup, create recovery.signal, set recovery_target_time in postgresql.conf.\n• pgBackRest and Barman automate retention and validation.\n• Test restores monthly — backup without tested restore is useless.\n• RPO = WAL archive lag; RTO = restore + replay time.', command: 'pg_basebackup -D /backup/base -Ft -z -P\n-- recovery.conf / postgresql.auto.conf\nrestore_command = \'cp /wal_archive/%f %p\'\nrecovery_target_time = \'2024-06-15 14:30:00\'' },
  ],
  highAvailability: [
    { difficulty: 'hard', question: 'Design a PostgreSQL HA architecture for 99.95% uptime.', answer: 'Primary + synchronous standby in AZ-A, async standby in AZ-B for DR.\n• Connection pooling via PgBouncer; read traffic to hot standbys with target_session_attrs=read-write for writes.\n• Patroni + etcd/Consul for leader election and automated failover.\n• Monitor replication lag, connection counts, checkpoint frequency.\n• Runbook: failover, switchback, split-brain prevention.\n• Application retry logic with exponential backoff on connection errors.', command: '-- Patroni REST API check\ncurl -s http://patroni-node:8008/patroni | jq .role\n-- PgBouncer pools\nSHOW POOLS;\nSHOW SERVERS;' },
  ],
};

export const MYSQL_SEEDS = {
  architecture: [
    { difficulty: 'easy', question: 'Compare InnoDB vs MyISAM storage engines.', answer: 'InnoDB (default): ACID transactions, row-level locking, MVCC, crash recovery, foreign keys.\n• MyISAM: table-level locks, no transactions, faster for read-heavy legacy apps but no crash safety.\n• Production workloads should use InnoDB exclusively.\n• InnoDB buffer pool caches data/index pages in memory.\n• MyISAM still found in legacy systems — migration path is mysqldump + reload to InnoDB.', command: 'SHOW TABLE STATUS WHERE Name = \'orders\'\\G\nSELECT engine, support FROM information_schema.engines;\nALTER TABLE legacy_table ENGINE=InnoDB;' },
    { difficulty: 'easy', question: 'Describe the MySQL connection and thread model.', answer: 'MySQL Server handles each connection with a thread (thread pool plugin optional in Enterprise).\n• max_connections limits concurrent sessions; max_used_connections tracks peak.\n• Each connection consumes memory — use ProxySQL or connection pooling for app tiers.\n• Aborted_connects and Connection_errors_* in SHOW GLOBAL STATUS indicate network/auth issues.', command: 'SHOW VARIABLES LIKE \'max_connections\';\nSHOW GLOBAL STATUS LIKE \'Threads_%\';\nSHOW PROCESSLIST;' },
  ],
  replication: [
    { difficulty: 'medium', question: 'Explain MySQL replication using binary logs and replication coordinates.', answer: 'Primary writes committed transactions to binary log (ROW format recommended).\n• Replica IO thread pulls events into relay log; SQL thread applies them.\n• Traditional: file + position; GTID (Global Transaction ID) simplifies failover and chain replication.\n• ROW-based replication reduces ambiguity vs STATEMENT format for non-deterministic queries.\n• Monitor Seconds_Behind_Master (deprecated in 8.0.22+) and replication lag metrics.', command: 'SHOW MASTER STATUS\\G\nSHOW REPLICA STATUS\\G\nSHOW VARIABLES LIKE \'gtid_mode\';\nSHOW BINARY LOGS;' },
    { difficulty: 'hard', question: 'What is GTID replication and how does it simplify failover?', answer: 'GTID assigns unique ID per committed transaction across the cluster.\n• Failover: point replica to new primary with CHANGE REPLICATION SOURCE TO without guessing log file/position.\n• Enables easier chain topologies and auto-positioning.\n• Requires gtid_mode=ON on all nodes; enforce_gtid_consistency=ON.\n• Errant transactions (extra GTIDs on old primary) must be handled before rejoining.\n• Used with InnoDB Cluster, MHA, Orchestrator.', command: 'SELECT @@gtid_mode, @@enforce_gtid_consistency;\nSHOW REPLICA STATUS\\G\n-- Look for Retrieved_Gtid_Set, Executed_Gtid_Set' },
  ],
  indexing: [
    { difficulty: 'medium', question: 'How do B-tree indexes work in MySQL InnoDB and what is the clustered index?', answer: 'InnoDB stores rows in PK order — clustered index is the table.\n• Secondary indexes store PK values as pointers — wide PKs bloat secondary indexes.\n• Choose short, monotonic PK (auto_increment or UUID v7) for insert performance.\n• Covering index: all selected columns in index enables index-only scan.\n• Duplicate indexes waste space — audit with sys.schema_redundant_indexes.', command: 'SHOW INDEX FROM orders;\nEXPLAIN SELECT id, status FROM orders WHERE customer_id = 100 AND status = \'OPEN\';\n-- Covering: CREATE INDEX idx_cust_status ON orders(customer_id, status, id);' },
  ],
  queryOptimization: [
    { difficulty: 'medium', question: 'How do you optimize a slow query using EXPLAIN in MySQL?', answer: 'EXPLAIN FORMAT=JSON or traditional EXPLAIN shows access type, rows examined, and index usage.\n• Avoid ALL (full table scan) on large tables.\n• type=ref/range/const better than index.\n• Check Extra: Using filesort, Using temporary indicate sort/temp table cost.\n• optimizer_switch and histogram statistics (8.0) improve plan quality.\n• Use slow query log with long_query_time and pt-query-digest for aggregation.', command: 'SET GLOBAL slow_query_log = ON;\nSET GLOBAL long_query_time = 1;\nEXPLAIN FORMAT=JSON SELECT * FROM orders WHERE created_at > \'2024-01-01\';\nANALYZE TABLE orders;' },
  ],
  performance: [
    { difficulty: 'hard', question: 'How do you tune InnoDB buffer pool and I/O for OLTP workloads?', answer: 'innodb_buffer_pool_size = 70-80% of RAM on dedicated DB servers.\n• Multiple instances (innodb_buffer_pool_instances) reduce mutex contention on large pools.\n• innodb_flush_log_at_trx_commit=1 for durability; =2 trades safety for speed.\n• innodb_io_capacity sets flush rate for SSD vs HDD.\n• Monitor buffer pool hit rate via Innodb_buffer_pool_reads vs _read_requests.\n• Avoid oversized buffer pool leaving no OS page cache for temp tables.', command: 'SHOW VARIABLES LIKE \'innodb_buffer_pool%\';\nSHOW GLOBAL STATUS LIKE \'Innodb_buffer_pool_%\';\nSELECT * FROM sys.memory_global_by_current_bytes WHERE event_name LIKE \'memory/innodb%\';' },
  ],
  backupRecovery: [
    { difficulty: 'medium', question: 'Compare mysqldump vs Percona XtraBackup for MySQL backups.', answer: 'mysqldump: logical backup, portable, slow on large datasets, restore is single-threaded SQL replay.\n• XtraBackup: physical hot backup of InnoDB files, near-zero downtime, supports incremental.\n• Binary log + full backup enables PITR.\n• For large production: XtraBackup + binlog archiving; validate restore on staging weekly.\n• Lock tables briefly for MyISAM; InnoDB hot backup with --single-transaction for dump.', command: 'mysqldump --single-transaction --routines --triggers --all-databases > full.sql\nxtrabackup --backup --target-dir=/backup/$(date +%F)\nxtrabackup --prepare --target-dir=/backup/2024-06-15' },
  ],
  highAvailability: [
    { difficulty: 'hard', question: 'Design MySQL high availability with Group Replication or InnoDB Cluster.', answer: 'InnoDB Cluster: MySQL Shell administers Group Replication + MySQL Router for RW/RO split.\n• Single-primary mode for traditional apps; multi-primary for write scaling with conflict detection.\n• Automatic failover when primary unreachable; majority quorum required.\n• Alternative: MHA/Orchestrator with async/semi-sync replication.\n• Application must handle brief write unavailability during failover.\n• Test split-brain scenarios and errant GTID cleanup.', command: 'SELECT * FROM performance_schema.replication_group_members;\nmysqlsh -- cluster status\nSHOW STATUS LIKE \'Rpl_semi_sync%\';\n' },
  ],
};
