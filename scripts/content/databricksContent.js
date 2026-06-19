/**
 * Databricks interview content for AllPreps track generation.
 * 15 topics × 3 difficulties × 4 variants + 20 production scenarios.
 */

export const TOPIC_CONTENT = {
  'databricks-fundamentals': {
    easy: [
      {
        q: 'What is Databricks and how does it differ from running open-source Spark on your own cluster?',
        a: 'Databricks is a unified analytics platform built on Apache Spark that adds a managed control plane, collaborative workspace, and integrated services like Delta Lake, Unity Catalog, and MLflow.\n• Self-managed Spark requires you to provision clusters, patch runtimes, tune configs, and wire up monitoring yourself.\n• Databricks provides autoscaling job/all-purpose clusters, DBR (Databricks Runtime) with pre-integrated libraries, notebook collaboration, and built-in security integrations.\n• The platform separates compute from storage when using cloud object stores, so you pay for clusters only while jobs run.\n• DBR adds Photon engine, optimized connectors, and Delta Lake ACID guarantees out of the box.\n\nIn interviews, emphasize that Databricks is not a replacement for Spark—it is Spark plus operational tooling that reduces time-to-production for data engineering and ML teams.',
        cmd: '# List available DBR versions in workspace\ndatabricks clusters spark-versions\n\n# Create an interactive all-purpose cluster\ndatabricks clusters create --json \'{\n  "cluster_name": "dev-explore",\n  "spark_version": "14.3.x-scala2.12",\n  "node_type_id": "i3.xlarge",\n  "autotermination_minutes": 30,\n  "num_workers": 2\n}\'',
      },
      {
        q: 'Explain the Databricks workspace components: notebooks, repos, and the data explorer.',
        a: 'A Databricks workspace is the collaborative UI layer where teams develop and operate data workloads.\n• Notebooks support Python, SQL, Scala, and R with cell-level execution, version history, and scheduling via Workflows.\n• Repos (Git folders) sync notebooks and Python modules from GitHub/Azure DevOps, enabling CI/CD and code review before deployment.\n• The Data Explorer (Catalog Explorer) lets you browse Unity Catalog metastore objects—catalogs, schemas, tables, volumes—and preview data or run quick queries.\n• Clusters attach to notebooks for compute; SQL warehouses serve BI and ad-hoc SQL without managing Spark configs manually.\n\nStrong answers mention that production code typically lives in Repos or packaged wheel files, while notebooks are best for exploration and orchestration glue.',
        cmd: '# Mount a repo in workspace via CLI\ndatabricks repos create \\\n  --url https://github.com/acme/data-platform.git \\\n  --provider github \\\n  --path /Repos/prod/data-platform\n\n# List workspace objects\ndatabricks workspace list /Users',
      },
      {
        q: 'What is the Databricks Runtime (DBR) and why does the version matter?',
        a: 'DBR is a curated Spark distribution maintained by Databricks with patched Apache Spark, optimized libraries, and integrated open-source packages (Delta Lake, MLflow, Koalas/pandas API on Spark).\n• Each DBR version pins a specific Spark version, Scala/Java versions, and Python runtime—mixing versions across jobs causes serialization and UDF failures.\n• LTS (Long Term Support) runtimes receive extended security patches and are recommended for production Workflows.\n• DBR variants include Standard, ML (GPU and ML libraries), and Photon-enabled runtimes for accelerated SQL/DataFrame queries.\n• Upgrading DBR requires regression testing because deprecated APIs (e.g., RDD-heavy patterns) may break.\n\nAlways align cluster DBR with library dependencies and document the upgrade path in your platform runbook.',
        cmd: '# In notebook — check runtime and Spark version\nspark.conf.get("spark.databricks.clusterUsageTags.sparkVersion")\nprint(spark.version)\n\n# SQL warehouse runtime\ndatabricks sql warehouses get --id <warehouse-id>',
      },
      {
        q: 'Describe how Databricks separates storage and compute in a cloud deployment.',
        a: 'In AWS, Azure, or GCP deployments, Databricks clusters are ephemeral compute while data lives in cloud object storage (S3, ADLS, GCS) registered through external locations or managed storage.\n• When a cluster terminates, no data is lost because tables point to cloud storage paths, not local HDFS.\n• Multiple clusters can read the same Delta tables concurrently without copying data.\n• This model enables independent scaling: burst compute for heavy ETL, then terminate clusters to stop billing.\n• Unity Catalog adds a centralized metastore layer so table metadata is decoupled from any single cluster.\n\nCost-aware teams use job clusters (auto-terminate after task completion) and right-size node types rather than keeping all-purpose clusters running 24/7.',
        cmd: '# Describe table storage location\nspark.sql("DESCRIBE DETAIL catalog.schema.orders")\n\n# Check DBFS vs cloud path usage\nspark.sql("DESCRIBE TABLE EXTENDED catalog.schema.orders").filter("col_name = \'Location\'").show(truncate=False)',
      },
    ],
    medium: [
      {
        q: 'How do you implement environment isolation (dev/staging/prod) in a Databricks workspace strategy?',
        a: 'Enterprise teams isolate environments using a combination of workspace boundaries, Unity Catalog catalogs, and CI/CD pipelines.\n• Separate workspaces per environment (dev/stage/prod) prevent accidental production writes and allow different IAM policies.\n• Unity Catalog maps one metastore per region with catalogs named dev, staging, prod—schemas mirror across catalogs for promotion testing.\n• Service principals and group-based ACLs restrict prod catalog write access to deployment pipelines only.\n• Repos branch strategy (feature → main) triggers Workflows in lower environments before prod promotion.\n• Secrets scopes are environment-scoped so dev credentials never reach prod jobs.\n\nDocument a promotion checklist: schema diff, row-count validation, performance baseline, and rollback procedure via Delta time travel or version tags.',
        cmd: '# Grant read-only prod access to analysts\nspark.sql("""\n  GRANT USE CATALOG ON CATALOG prod TO `data-analysts`;\n  GRANT SELECT ON SCHEMA prod.analytics TO `data-analysts`;\n""")\n\n# List catalogs\nspark.sql("SHOW CATALOGS").show()',
      },
      {
        q: 'What are common pitfalls when onboarding a team from self-managed Hadoop/Spark to Databricks?',
        a: 'Migration teams often carry anti-patterns that cause cost and reliability issues on Databricks.\n• Treating DBFS root as durable storage—data there is tied to the workspace and not suitable for production tables.\n• Running long-lived all-purpose clusters for scheduled jobs instead of ephemeral job clusters with autoscaling.\n• Ignoring partition and file-size tuning, leading to millions of small files and slow queries after lift-and-shift.\n• Using collect() or toPandas() on large datasets, causing driver OOM on modest cluster sizes.\n• Hardcoding credentials in notebooks instead of secret scopes and instance profiles.\n\nA structured migration includes catalog registration, Delta conversion, Workflows replacement for cron, and Spark UI review to eliminate skew and spill.',
        cmd: '# Convert Parquet to Delta during migration\nspark.sql("""\n  CONVERT TO DELTA parquet.`s3://datalake/bronze/events`\n""")\n\n# Register in Unity Catalog\nspark.sql("""\n  CREATE TABLE prod.bronze.events\n  USING DELTA\n  LOCATION \'s3://datalake/bronze/events\'\n""")',
      },
      {
        q: 'How do you monitor Databricks workspace health and job reliability at scale?',
        a: 'Operational monitoring combines platform audit logs, job run metrics, and custom application telemetry.\n• Enable account-level audit logs and ship to SIEM for login, ACL changes, and cluster events.\n• Use the Jobs API or system tables (when available) to track success rate, duration p95, and failure reasons by task.\n• Cluster event logs reveal autoscaling decisions, spot loss, and init script failures.\n• Integrate Spark listener metrics or Databricks observability (Lakehouse Monitoring) for data quality SLAs.\n• Alert on: consecutive job failures, runtime drift >20% from baseline, DBU spend anomalies, and queue backlog.\n\nRun weekly reliability reviews with top failing jobs, flaky upstream dependencies, and clusters with chronic memory pressure.',
        cmd: '# List recent job runs with result state\ndatabricks jobs runs list --job-id <job-id> --limit 20\n\n# Query job run timeline in SQL\nspark.sql("""\n  SELECT job_id, run_id, result_state, run_duration_ms\n  FROM system.lakeflow.job_run_timeline\n  WHERE start_time > current_timestamp() - INTERVAL 7 DAYS\n  ORDER BY start_time DESC\n""")',
      },
      {
        q: 'Compare all-purpose clusters, job clusters, and SQL warehouses for different workload types.',
        a: 'Each compute type optimizes for different access patterns and cost profiles.\n• All-purpose clusters: interactive notebooks, ad-hoc exploration, long idle tolerance with autotermination—higher cost per DBU hour but instant attach for developers.\n• Job clusters: spin up per Workflow task, autoscale for batch ETL, terminate on completion—best cost efficiency for scheduled pipelines.\n• SQL warehouses: serverless or classic endpoints for BI tools (Tableau, Power BI) and SQL-native users; Photon acceleration for repetitive aggregations.\n• ML workloads may need GPU all-purpose or dedicated job clusters with ML runtime.\n\nDecision matrix: batch ETL → job cluster; dashboard SQL → warehouse; notebook prototyping → all-purpose with strict autotermination policy.',
        cmd: '# Create a job cluster spec in Workflow JSON\n{\n  "job_clusters": [{\n    "job_cluster_key": "etl_cluster",\n    "new_cluster": {\n      "spark_version": "14.3.x-scala2.12",\n      "node_type_id": "i3.2xlarge",\n      "autoscale": { "min_workers": 2, "max_workers": 8 }\n    }\n  }]\n}\n\n# Create SQL warehouse\ndatabricks sql warehouses create --json \'{"name":"bi-wh","cluster_size":"Medium","auto_stop_mins":10}\'',
      },
    ],
    hard: [
      {
        q: 'Design a multi-workspace Databricks landing zone for a global enterprise with data residency requirements.',
        a: 'A global landing zone maps legal/regulatory boundaries to infrastructure while preserving a consistent developer experience.\n• Deploy regional workspaces (EU, US, APAC) each with its own metastore and storage accounts in-region—no cross-border data at rest.\n• Use Delta Sharing or clean-room patterns for cross-region analytics on aggregated datasets only.\n• Central identity via SCIM sync from IdP; account-level groups map to regional workspace permissions.\n• Hub workspace hosts shared libraries, Terraform/Asset Bundle templates, and CI/CD runners—spoke workspaces consume versioned artifacts.\n• Network: private link/VNet injection, no public IPs on clusters, egress through inspected NAT.\n\nPresent a reference architecture diagram showing account console → regional metastores → catalog-per-domain → Workflows with service principals. Include DR: replicate Delta tables via deep clone or vendor replication to paired region.',
        cmd: '# Account-level metastore assignment (CLI)\ndatabricks account metastores assign \\\n  --workspace-id <ws-id> \\\n  --metastore-id <regional-metastore-id>\n\n# Delta Sharing share creation\nspark.sql("""\n  CREATE SHARE eu_customer_aggregates;\n  ALTER SHARE eu_customer_aggregates ADD TABLE eu_prod.analytics.daily_kpis;\n""")',
      },
      {
        q: 'You are leading an incident where a misconfigured workspace-wide init script broke every cluster start. What is your response?',
        a: 'This is a Sev-1 platform outage—all compute is blocked until init scripts are remediated.\n• Detect: spike in cluster start failures in audit logs, PagerDuty from job failure storm, users unable to attach notebooks.\n• Triage: identify recently modified global init script in admin settings; pull script from DBFS/workspace files; reproduce on a test cluster.\n• Mitigate: disable or revert the global init script immediately via account admin console; for stuck clusters, terminate and recreate after fix.\n• Communicate: status page update, ETA for restored job runs, list of impacted Workflows for owners to replay.\n• Root cause: missing `set -e`, silent `apt-get` failure, wrong Python path, or script assuming a mount that does not exist on job clusters.\n• Prevent: version-control init scripts in Git, test on job cluster profile in staging, require PR approval for global scope, add cluster start canary job every 15 minutes.',
        cmd: '# List init scripts on a cluster config\ndatabricks clusters get --cluster-id <id> | jq .init_scripts\n\n# Remove global init script via API (account admin)\ncurl -X PATCH "$DATABRICKS_HOST/api/2.0/workspace-conf" \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"enableDbfsFileBrowser":"true","initScripts.global":[]}\'',
      },
      {
        q: 'How would you build a FinOps practice to reduce Databricks spend by 30% without sacrificing SLAs?',
        a: 'FinOps on Databricks targets compute waste, inefficient Spark jobs, and policy gaps—not arbitrary cluster downsizing.\n• Baseline: tag all clusters/jobs with cost center, domain, environment; export billing usage to dashboard by tag.\n• Quick wins: enforce autotermination (≤30 min dev), migrate scheduled jobs from all-purpose to job clusters, right-size over-provisioned worker counts.\n• Spark efficiency: fix skew, enable AQE, compact small files, switch eligible SQL to Photon warehouses.\n• Policy guardrails: max node type, max workers, spot instances for non-critical batch, deny GPU clusters without approval.\n• Chargeback/showback: monthly report to engineering managers with top 10 expensive jobs and optimization recommendations.\n\nPresent a 90-day roadmap: weeks 1–2 visibility, 3–6 quick wins, 7–12 structural changes (bundle-based deployment, autoscaling tuning). Measure success via DBU/GB processed and p95 job duration stability.',
        cmd: '# Tag policy example in cluster create\ndatabricks clusters create --json \'{\n  "custom_tags": {"cost_center":"finops","env":"prod"},\n  "autotermination_minutes": 20,\n  "aws_attributes": {"availability": "SPOT_WITH_FALLBACK"}\n}\'\n\n# Analyze table scan sizes\nspark.sql("""\n  SELECT table_name, size_in_bytes, num_files\n  FROM prod.information_schema.tables\n  ORDER BY size_in_bytes DESC LIMIT 20\n""")',
      },
      {
        q: 'Explain how you would evaluate build vs buy for a new real-time analytics requirement on Databricks vs a dedicated stream processor.',
        a: 'The decision hinges on latency SLA, team skills, operational burden, and total cost of ownership over 3 years.\n• Databricks Structured Streaming + Delta: unified batch/stream code, exactly-once with idempotent sinks, ML feature parity—best when latency is seconds-to-minutes and team already owns the lakehouse.\n• Dedicated stream processor (Flink, Kafka Streams): sub-second latency, complex event processing, independent scaling—better for fraud detection or operational dashboards under 500ms.\n• Hybrid: ingest via Kafka → Structured Streaming bronze → Delta → batch gold for analytics; use Flink only for hot path.\n• Evaluation criteria: p99 latency, cost at peak TPS, state size, upgrade cadence, disaster recovery, and hiring market.\n\nIn an architecture review, present a decision matrix with weighted scores and a PoC comparing end-to-end latency and DBU cost at 2× projected load.',
        cmd: '# Structured Streaming micro-batch metrics\nstreamingQuery.lastProgress\n\n# Compare with Kafka lag\nkafka-consumer-groups --bootstrap-server $BROKER \\\n  --group databricks-ingest --describe',
      },
    ],
  },

  'apache-spark-basics': {
    easy: [
      {
        q: 'What is Apache Spark and what problem does it solve compared to MapReduce?',
        a: 'Apache Spark is a unified distributed computing engine for large-scale data processing with in-memory computation and a rich API surface.\n• MapReduce writes intermediate results to disk between stages, making iterative algorithms (ML, graph) extremely slow.\n• Spark keeps data in memory across transformations when possible, achieving 10–100× speedups on iterative workloads.\n• Spark offers DataFrames, SQL, Streaming, MLlib, and GraphX in one runtime instead of stitching separate systems.\n• Lazy evaluation builds a DAG optimized by Catalyst (SQL) and Tungsten (execution).\n\nDatabricks runs Spark as its core engine; interview answers should connect Spark concepts to how DBR packages and optimizes the runtime.',
        cmd: '# SparkSession entry point\nfrom pyspark.sql import SparkSession\nspark = SparkSession.builder.appName("demo").getOrCreate()\nprint(spark.sparkContext.version)\n\n# Check active application in Spark UI\n# Cluster → Spark UI → Jobs tab',
      },
      {
        q: 'Explain lazy evaluation and action vs transformation in Spark.',
        a: 'Spark builds a logical plan when you call transformations but executes nothing until an action triggers job submission.\n• Transformations (map, filter, select, join) return new RDDs/DataFrames and are lazy—they only extend the DAG.\n• Actions (count, collect, write, show) force execution by submitting a Spark job to the cluster.\n• Lazy evaluation enables whole-stage codegen, predicate pushdown, and pipelining across operators.\n• Calling an action repeatedly without caching recomputes the entire lineage from scratch.\n\nBest practice: chain transformations, cache/persist only when reuse justifies memory cost, and minimize actions during development (use limit() before collect()).',
        cmd: 'df = spark.read.parquet("s3://lake/events/")\nfiltered = df.filter("event_date >= \'2024-01-01\'")  # transformation\nselected = filtered.select("user_id", "event_type")   # transformation\nselected.write.mode("overwrite").parquet("s3://lake/out/")  # action triggers job',
      },
      {
        q: 'What are RDDs and why are DataFrames preferred for most ETL workloads today?',
        a: 'RDDs (Resilient Distributed Datasets) are Spark\'s original low-level abstraction—immutable partitioned collections with functional operators.\n• RDDs require manual optimization; the engine cannot see column names or types for predicate pushdown.\n• DataFrames/Datasets provide schema-aware Catalyst optimization, column pruning, and whole-stage codegen.\n• SQL interoperability: the same DataFrame can be registered as a temp view and queried with Spark SQL.\n• RDDs remain relevant for unstructured data, custom partitioning, or legacy code—but new pipelines should default to DataFrames.\n\nMigration path: replace RDD map/filter with DataFrame select/where for cleaner code and faster plans.',
        cmd: '# DataFrame API\nspark.read.json("s3://lake/logs/").createOrReplaceTempView("logs")\nspark.sql("SELECT level, count(*) FROM logs GROUP BY level").show()\n\n# RDD (legacy)\nrdd = spark.sparkContext.textFile("s3://lake/logs/")\nrdd.filter(lambda line: "ERROR" in line).count()',
      },
      {
        q: 'Describe Spark\'s driver, executors, and cluster manager roles.',
        a: 'Spark follows a driver-executor model coordinated by a cluster manager (Databricks manages this internally).\n• Driver: runs your main() or notebook kernel, holds SparkContext, builds DAGs, schedules tasks, and collects results—driver OOM is a common failure mode.\n• Executors: JVM processes on worker nodes that run tasks, cache partitions, and shuffle data.\n• Cluster manager: allocates resources—on Databricks this is abstracted; you configure worker count and node type.\n• Tasks are the unit of work sent to executors; stages group tasks separated by shuffle boundaries.\n\nSizing rule of thumb: driver handles metadata and small collects; heavy data never flows through the driver except during improper collect() calls.',
        cmd: '# Executor and memory config\nspark.conf.set("spark.executor.memory", "8g")\nspark.conf.set("spark.executor.cores", "4")\nspark.conf.set("spark.driver.memory", "4g")\n\n# View executor status in Spark UI → Executors tab',
      },
    ],
    medium: [
      {
        q: 'How does Spark shuffle work and why is it often the bottleneck in joins and aggregations?',
        a: 'Shuffle redistributes data across the cluster so records with the same key land on the same partition for joins, groupBy, or window operations.\n• Map-side tasks write shuffle blocks to local disk; reduce-side tasks fetch remote blocks over the network.\n• Shuffle volume scales with data size and partition count—too few partitions cause massive per-task memory; too many cause metadata overhead.\n• Skew occurs when one key dominates (e.g., NULL or a popular user_id), leaving one task running hours while others finish.\n• Mitigations: salting keys, broadcast join for small tables, AQE skew join hints, repartition before write, and adaptive coalesce.\n\nUse Spark UI → Stages → Shuffle Read/Write metrics to identify shuffle-heavy stages and compare before/after optimization.',
        cmd: '# Broadcast hint for small dimension table\nfrom pyspark.sql.functions import broadcast\nfact.join(broadcast(dim), "product_id")\n\n# Check shuffle partitions\nspark.conf.get("spark.sql.shuffle.partitions")  # default 200\nspark.conf.set("spark.sql.adaptive.enabled", "true")',
      },
      {
        q: 'What is the Catalyst optimizer and how does it improve Spark SQL performance?',
        a: 'Catalyst is Spark SQL\'s rule-based and cost-based optimizer that transforms unresolved logical plans into optimized physical execution plans.\n• Analysis resolves tables/columns; optimization applies rules like predicate pushdown, column pruning, constant folding, and join reordering.\n• Physical planning chooses join strategies (broadcast hash, sort-merge, shuffle hash) based on statistics.\n• Whole-stage codegen fuses multiple operators into single JVM loops, reducing virtual call overhead.\n• EXPLAIN EXTENDED / EXPLAIN COST shows plan transformations for debugging regressions.\n\nWhen statistics are stale (no ANALYZE), Catalyst may choose sort-merge over broadcast, causing unnecessary shuffles—refresh stats after large loads.',
        cmd: 'spark.sql("ANALYZE TABLE prod.sales COMPUTE STATISTICS FOR ALL COLUMNS")\n\nspark.sql("EXPLAIN COST SELECT /*+ BROADCAST(c) */ * FROM orders o JOIN customers c ON o.cust_id = c.id").show(truncate=False)',
      },
      {
        q: 'How do you troubleshoot a Spark job that runs slowly with no obvious error?',
        a: 'Systematic performance triage starts in the Spark UI and event logs before guessing at hardware.\n• Jobs tab: identify straggler stages—one task taking 10× median time indicates skew or bad partitioning.\n• Storage tab: verify cached datasets and memory spill to disk (spill = undersized executor memory).\n• SQL tab: examine physical plan for Cartesian products, missing filters pushed to scan, or excessive shuffle.\n• Check input file count—millions of small Parquet files cause listing and open overhead.\n• Compare executor GC time; >10% GC suggests memory pressure or too many concurrent tasks per core.\n\nDocument baseline duration per stage; alert when p95 regresses after code or data volume changes.',
        cmd: '# Enable Spark event log for history server\nspark.conf.set("spark.eventLog.enabled", "true")\n\n# List stage metrics programmatically\nspark.sparkContext.statusTracker().getExecutorInfos()',
      },
      {
        q: 'Explain partitioning in Spark and when you should repartition vs coalesce.',
        a: 'Partitions determine parallelism—each partition becomes at most one task per stage (before AQE adjustments).\n• repartition(n): full shuffle redistributing data evenly—use before heavy joins or writes when partition count is wrong.\n• coalesce(n): reduces partitions without full shuffle (narrow)—use after filter reduced data volume significantly.\n• Default spark.sql.shuffle.partitions=200 is often wrong for 1 GB or 10 TB jobs—tune per pipeline.\n• Writing: target 128 MB–1 GB per file; use repartition or adaptive coalesce on write.\n• Reading: partitionBy on write aligns directory layout with common filters for partition pruning.\n\nAnti-pattern: repartition(1) before every write—it serializes output and hides upstream parallelism issues.',
        cmd: 'df.repartition(64, "event_date").write.partitionBy("event_date").mode("overwrite").parquet("s3://lake/gold/events")\n\n# After heavy filter\ndf.filter("country = \'US\'").coalesce(8).write.parquet("s3://lake/us-only/")',
      },
    ],
    hard: [
      {
        q: 'Design a Spark application architecture for a 50 TB daily batch pipeline with strict 4-hour SLA.',
        a: 'At 50 TB/day, architecture must minimize shuffle, maximize scan parallelism, and isolate failure domains.\n• Ingest bronze as partitioned Delta with auto compaction scheduled off-peak; target 256 MB files via OPTIMIZE or write tuning.\n• Silver transformations: incremental MERGE instead of full overwrite; Z-ORDER on high-cardinality filter columns.\n• Split pipeline into independent Workflow tasks by domain/date slice with parallel task values—failure reruns only failed slices.\n• Cluster: autoscaling job cluster with storage-optimized nodes (i3/d instances), shuffle service enabled, AQE + Photon if SQL-heavy.\n• SLA buffer: checkpoint intermediate Delta tables; stage 1 (ingest) 1h, stage 2 (enrich) 2h, stage 3 (aggregate) 45m, 15m margin.\n• Observability: per-stage SLA metrics, automatic escalation if bronze lag > 30 minutes.\n\nPresent failure modes: upstream delay, skewed key, metastore throttling—and pre-approved mitigations (scale workers, salt key, increase partition count).',
        cmd: '# Parallel Workflow task keys\n{"task_key": "silver_{{date}}", "for_each_task": {"inputs": "[\\"2024-01-01\\",\\"2024-01-02\\"]", "task": {"spark_python_task": {"python_file": "silver.py", "parameters": ["{{input}}"]}}}}\n\nspark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")',
      },
      {
        q: 'How would you lead a post-incident review where a Spark upgrade caused widespread UDF failures?',
        a: 'Frame the review around blast radius, detection gap, and systemic prevention—not individual blame.\n• Timeline: DBR upgrade deployed → jobs fail with PicklingError/Arrow errors → 6-hour backlog → rollback DBR pin.\n• Root cause: Python UDFs relying on deprecated pyarrow API; Scala UDFs compiled against old Spark version.\n• Contributing factors: no staging soak test, jobs pinned to "latest" DBR, insufficient automated regression suite.\n• Corrective actions: pin DBR LTS in all production jobs, CI matrix testing UDFs against candidate DBR, migrate hot-path UDFs to pandas UDF or native Spark SQL.\n• Detection improvement: canary job suite runs hourly on staging with new DBR two weeks before prod promotion.\n\nDeliverables: upgraded runbook for DBR lifecycle, ownership matrix for library compatibility, and executive summary of customer impact (missed SLAs, replay cost).',
        cmd: '# Pin runtime in job definition\n"new_cluster": {"spark_version": "13.3.x-scala2.12"}\n\n# Test UDF in notebook\n@udf("string")\ndef legacy_transform(val):\n    return val.strip().upper()\ndf.select(legacy_transform("col")).show()',
      },
      {
        q: 'Compare Spark\'s memory model (execution vs storage) and how misconfiguration causes OOM or spill.',
        a: 'Each executor JVM divides spark.executor.memory into unified memory managed by Spark\'s internal allocator.\n• Execution memory: shuffles, joins, sorts, aggregations—eviction can spill to disk, degrading performance.\n• Storage memory: cached/persisted datasets—LRU eviction when execution needs space.\n• spark.memory.fraction (default 0.6) and spark.memory.storageFraction control the split; off-heap is optional for large caches.\n• OOM causes: too many concurrent tasks (cores × partitions), oversized broadcasts, collecting huge results to driver, or UDF memory leaks.\n• Tuning: reduce spark.executor.cores to 4–5 on memory-heavy jobs, increase executor memory, enable spark.sql.adaptive.advisoryPartitionSizeInBytes.\n\nIn incidents, heap dumps and Spark UI storage tab distinguish cache pressure from shuffle spill.',
        cmd: 'spark.conf.set("spark.executor.memory", "16g")\nspark.conf.set("spark.memory.offHeap.enabled", "true")\nspark.conf.set("spark.memory.offHeap.size", "4g")\n\n# Clear over-cached data\nspark.catalog.clearCache()',
      },
      {
        q: 'Explain how you would implement custom partitioners and when they are justified over default hash partitioning.',
        a: 'Default HashPartitioner distributes keys pseudo-randomly; custom partitioners enforce domain-specific locality.\n• Use cases: co-locate all records for a tenant on fixed executors for locality-aware processing, pre-partition for known join keys, or route hot keys to dedicated partitions.\n• Implementation: extend Partitioner in Scala/Java RDD API; DataFrame API uses repartition(num, col) or bucketBy on write for controlled layout.\n• Delta liquid clustering replaces many custom partitioner patterns by optimizing file layout dynamically.\n• Risks: uneven custom ranges recreate skew; changing partitioner breaks shuffle dependency assumptions.\n\nJustify only when EXPLAIN shows repeated shuffle on same key and bucketBy/liquid clustering cannot solve it. Document partition count and key distribution assumptions for future maintainers.',
        cmd: '# Bucket write for join optimization\nspark.sql("""\n  CREATE TABLE prod.sales_bucketed (\n    order_id BIGINT, customer_id BIGINT, amount DECIMAL(10,2)\n  )\n  USING DELTA\n  CLUSTER BY (customer_id)\n""")\n\ndf.write.format("delta").partitionBy("region").save("s3://lake/regional/")',
      },
    ],
  },

  'dataframes': {
    easy: [
      {
        q: 'What is a Spark DataFrame and how does it differ from a Pandas DataFrame?',
        a: 'A Spark DataFrame is a distributed collection of data organized into named columns with a schema, backed by Spark\'s Catalyst optimizer.\n• Pandas operates on single-node in-memory data; Spark DataFrames partition rows across a cluster for parallel execution.\n• Spark lazy-evaluates transformations; Pandas executes eagerly.\n• Spark handles datasets far exceeding driver RAM; Pandas requires chunking or Dask for scale-out.\n• Interop: pandas API on Spark (pyspark.pandas) and toPandas()/createDataFrame() bridge small datasets.\n\nUse Spark DataFrames for production ETL; use Pandas for local exploration or when data fits comfortably in memory (< few GB).',
        cmd: 'from pyspark.sql import functions as F\n\ndf = spark.read.csv("s3://lake/customers.csv", header=True, inferSchema=True)\ndf.select("name", F.col("age").cast("int")).filter(F.col("age") > 21).show(5)',
      },
      {
        q: 'How do you read and write common file formats with Spark DataFrames?',
        a: 'Spark DataFrames natively support Parquet, Delta, JSON, CSV, ORC, Avro (with package), and JDBC sources.\n• Parquet/Delta: preferred for analytics—columnar, compressed, schema embedded; Delta adds ACID and time travel.\n• CSV: specify header, inferSchema or explicit schema; beware type inference errors on large files.\n• JSON: multiline option for nested records; use schema_of_json for complex structures.\n• Write modes: overwrite, append, ignore, errorIfExists control idempotency behavior.\n\nAlways pass explicit schema for production CSV/JSON ingestion to avoid silent type coercion.',
        cmd: 'schema = "order_id LONG, customer_id LONG, amount DOUBLE, order_ts TIMESTAMP"\n\ndf = spark.read.schema(schema).json("s3://lake/orders/")\ndf.write.format("delta").mode("append").save("s3://lake/delta/orders/")',
      },
      {
        q: 'Explain common DataFrame operations: select, filter, groupBy, and join.',
        a: 'These four operations form the backbone of most Spark ETL pipelines.\n• select: project columns, add computed columns with withColumn—prefer select over SELECT * for column pruning.\n• filter/where: row-level predicates pushed to scan when possible.\n• groupBy + agg: aggregations (sum, count, avg); watch for implicit shuffle on high-cardinality keys.\n• join: inner, left, right, full; always specify join keys explicitly; broadcast small tables.\n\nChain operations fluently; register result as temp view for SQL users on the same team.',
        cmd: 'from pyspark.sql.functions import sum as _sum, count\n\norders.join(customers, "customer_id", "left") \\\n  .filter("order_date >= \'2024-01-01\'") \\\n  .groupBy("country") \\\n  .agg(_sum("amount").alias("revenue"), count("*").alias("orders")) \\\n  .orderBy(F.desc("revenue")) \\\n  .show()',
      },
      {
        q: 'What is a Spark schema and why should you define schemas explicitly in production?',
        a: 'A schema defines column names, data types, and nullability for a DataFrame—Spark\'s contract for serialization and optimization.\n• inferSchema scans data samples; it is slow on large datasets and can misinfer (INT vs LONG, timestamps as strings).\n• Explicit schemas fail fast on malformed records instead of silently corrupting downstream aggregates.\n• Schema evolution: Delta mergeSchema option allows additive columns; breaking changes require migration plans.\n• StructType with nested StructField supports arrays and maps for semi-structured data.\n\nStore schemas in code (StructType) or JSON schema files versioned alongside ingestion jobs.',
        cmd: 'from pyspark.sql.types import StructType, StructField, StringType, LongType, TimestampType\n\nschema = StructType([\n  StructField("event_id", StringType(), False),\n  StructField("user_id", LongType(), True),\n  StructField("event_ts", TimestampType(), False)\n])\n\ndf = spark.read.schema(schema).parquet("s3://lake/events/")',
      },
    ],
    medium: [
      {
        q: 'How do you handle null values, duplicates, and data quality checks in DataFrames?',
        a: 'Production pipelines embed quality gates before promoting data to gold layers.\n• Nulls: dropna(subset=[cols]) for hard requirements; fillna for defaults; coalesce for first-non-null across columns.\n• Duplicates: dropDuplicates(["key_cols"]) or window row_number() to keep latest by timestamp.\n• Constraints: Delta CHECK constraints or expectations in DLT (DELAYED / FAIL on violation).\n• Great Expectations or custom assert: row count vs source, null rate thresholds, referential integrity joins.\n• Quarantine pattern: write failing rows to a dead-letter Delta table with error reason column.\n\nLog quality metrics to a monitoring table for trend analysis—sudden null spike often signals upstream API change.',
        cmd: 'from pyspark.sql.window import Window\nfrom pyspark.sql.functions import row_number, col\n\nw = Window.partitionBy("order_id").orderBy(col("updated_at").desc())\ndeduped = df.withColumn("rn", row_number().over(w)).filter("rn = 1").drop("rn")\n\nbad = deduped.filter(col("amount").isNull() | (col("amount") < 0))\nbad.write.format("delta").mode("append").save("s3://lake/quarantine/orders/")',
      },
      {
        q: 'Explain window functions in Spark DataFrames with a practical example.',
        a: 'Window functions compute aggregates over a defined partition without collapsing rows like groupBy.\n• Window spec: partitionBy defines groups; orderBy defines row ordering within group; rowsBetween/rangeBetween bounds the frame.\n• Use cases: running totals, rank/dense_rank, lag/lead for sessionization, deduplication by latest record.\n• Performance: requires shuffle on partitionBy columns; narrow windows perform better than unbounded frames on huge partitions.\n• SQL equivalent: OVER (PARTITION BY ... ORDER BY ...) in spark.sql.\n\nExample: compute 7-day rolling revenue per customer ordered by date—express as sum(amount) over window, not self-join.',
        cmd: 'from pyspark.sql.window import Window\nfrom pyspark.sql.functions import sum as _sum, col\n\nw = Window.partitionBy("customer_id").orderBy("order_date").rowsBetween(-6, 0)\n\ndf.withColumn("rolling_7d_revenue", _sum("amount").over(w)).show()',
      },
      {
        q: 'How do you debug a DataFrame schema mismatch error during a join or write?',
        a: 'Schema mismatches surface as AnalysisException or silent null columns if using loose JSON ingestion.\n• Compare schemas: printSchema() on both DataFrames side by side; look for same column name with different types (INT vs BIGINT).\n• Common culprits: date stored as string, decimal precision differences, nested struct field renames.\n• Fix: cast columns explicitly with cast("type"), rename with withColumnRenamed, or align via select with matching order.\n• Delta merge: update/insert clauses require target and source column type compatibility.\n• Prevention: enforce schema registry (Avro/Protobuf/JSON schema) at ingestion boundary.\n\nUse exceptAll on key columns after cast to find rows lost to type coercion.',
        cmd: 'df1.printSchema()\ndf2.printSchema()\n\naligned = df2.withColumn("customer_id", col("customer_id").cast("long"))\ndf1.join(aligned, "customer_id", "inner")\n\n# Find type coercion issues\ndf1.select("amount").dtypes',
      },
      {
        q: 'What are UDFs and pandas UDFs, and when should you avoid them?',
        a: 'UDFs (User Defined Functions) extend Spark with custom row or batch logic not available in built-in functions.\n• Python UDFs serialize rows one at a time across the Python-JVM boundary—very slow at scale.\n• pandas UDFs (vectorized) amortize transfer cost using Apache Arrow batches—preferred for Python custom logic.\n• Prefer native Spark SQL functions (regexp_extract, transform, aggregate) or Scala UDFs for hot paths.\n• Avoid UDFs when expressible as SQL—Catalyst cannot optimize inside opaque UDF black boxes.\n\nIf UDF is required, mark deterministic where possible, keep memory footprint small, and unit test with local Spark session.',
        cmd: 'from pyspark.sql.functions import pandas_udf\nimport pandas as pd\n\n@pandas_udf("double")\ndef normalize_scores(s: pd.Series) -> pd.Series:\n    return (s - s.mean()) / s.std()\n\ndf.withColumn("norm_score", normalize_scores("score"))',
      },
    ],
    hard: [
      {
        q: 'Design a reusable DataFrame transformation framework for a multi-team data platform.',
        a: 'Centralize transformations as tested, composable functions to prevent copy-paste ETL drift across domains.\n• Package as Python wheel with pure functions: (DataFrame, config) → DataFrame; no hidden global SparkSession side effects.\n• Config-driven: YAML defines source paths, column mappings, quality rules—same code processes finance and marketing with different configs.\n• Lineage metadata: attach transformation version and run_id columns for auditability.\n• Testing: local SparkSession with small fixture DataFrames; integration tests on staging catalog tables.\n• Deployment: Asset Bundles deploy wheel to DBFS/Unity Volume; Workflows reference entry point.\n\nGovernance: platform team owns framework; domain teams contribute plugins reviewed via PR. Document breaking change policy and semver for the library.',
        cmd: '# pyproject.toml entry point\n# [project.scripts]\n# domain-etl = "platform_etl.runner:main"\n\n# Workflow task\n{"python_wheel_task": {\n  "package_name": "platform_etl",\n  "entry_point": "domain-etl",\n  "parameters": ["--config", "/Volumes/prod/configs/finance.yaml"]\n}}',
      },
      {
        q: 'How would you optimize a pipeline that chains ten DataFrame transformations with repeated shuffles?',
        a: 'Repeated shuffles indicate poor stage planning—each groupBy/join/repartition triggers a new shuffle boundary.\n• Collapse sequential narrow transformations; batch aggregations where business logic allows.\n• Replace multiple groupBy on same keys with single groupBy + multiple agg expressions.\n• Broadcast consecutive small joins instead of shuffle joins in sequence.\n• Persist at strategic shuffle boundaries only once if downstream branches reuse intermediate result.\n• Rewrite SQL with CTEs materialized via CACHE TABLE selectively—not everywhere.\n• Enable AQE to coalesce skewed partitions dynamically at runtime.\n\nProfile with Spark UI: aim to reduce stage count by 30–50%. Present before/after DAG screenshots in optimization review.',
        cmd: 'spark.conf.set("spark.sql.adaptive.enabled", "true")\nspark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")\n\n# Single shuffle aggregation\n df.groupBy("region", "product").agg(\n   F.sum("revenue").alias("total_rev"),\n   F.countDistinct("customer_id").alias("unique_customers")\n )',
      },
      {
        q: 'Lead an architecture decision between DataFrame API, Spark SQL, and Delta Live Tables for a new pipeline.',
        a: 'Evaluate maintainability, testability, operational features, and team skill mix.\n• DataFrame API: best for complex programmatic logic, unit testing in Python, dynamic column handling.\n• Spark SQL: best for analytics engineers, readable transformations, easy EXPLAIN; use with sql files in repos.\n• Delta Live Tables: declarative pipelines with built-in expectations, dependency graph, and automatic retry—higher platform lock-in, less fine-grained control.\n• Hybrid: DLT for medallion standard paths; notebooks/wheels for ML feature engineering outliers.\n• Decision criteria: need for data quality enforcement, CI/CD maturity, latency requirements, cost of DLT compute.\n\nDeliver ADR documenting chosen approach, rejected alternatives, and migration path if requirements change in 12 months.',
        cmd: '# DLT expectation example\n@dlt.table(name="silver_orders")\n@dlt.expect_or_drop("valid_amount", "amount >= 0")\ndef silver_orders():\n    return dlt.read("bronze_orders").filter("order_id IS NOT NULL")',
      },
      {
        q: 'Explain handling of slowly changing dimensions (SCD Type 2) using DataFrames on Delta Lake.',
        a: 'SCD Type 2 preserves history by closing old records and inserting new versions when attributes change.\n• Stage incoming batch with hash of tracked columns (hash_diff) and effective_date.\n• MERGE INTO target: WHEN MATCHED AND hash_diff changed → UPDATE SET end_date = current, is_current = false; INSERT new row.\n• WHEN NOT MATCHED → INSERT new current row with start_date = today, end_date = NULL.\n• Index/filter on is_current = true for dimension lookups in fact joins.\n• Handle late-arriving records with retroactive end_date adjustments—requires careful transaction ordering.\n\nTest with edge cases: duplicate natural keys, deletes (soft delete flag), and backfill reruns idempotently via merge keys.',
        cmd: 'spark.sql("""\n  MERGE INTO prod.dim_customer AS t\n  USING staging.customer_updates AS s\n  ON t.customer_id = s.customer_id AND t.is_current = true\n  WHEN MATCHED AND t.hash_diff <> s.hash_diff THEN UPDATE SET\n    t.end_date = current_date(), t.is_current = false\n  WHEN NOT MATCHED THEN INSERT *\n""")',
      },
    ],
  },

  'delta-lake': {
    easy: [
      {
        q: 'What is Delta Lake and what ACID properties does it provide on object storage?',
        a: 'Delta Lake is an open-source storage layer that brings ACID transactions, schema enforcement, and time travel to Parquet files on cloud object stores.\n• Atomicity: commits are all-or-nothing via transaction log (_delta_log).\n• Consistency: schema validation on write prevents corrupt files entering the table.\n• Isolation: readers see snapshot isolation via log replay; concurrent writers serialize via optimistic concurrency.\n• Durability: data files in object storage persist independently of compute.\n\nUnlike plain Parquet directories, Delta supports UPDATE, DELETE, MERGE, and rollback to prior versions—essential for mutable lakehouse tables.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.bronze.events (\n    event_id STRING, event_ts TIMESTAMP, payload STRING\n  ) USING DELTA\n  LOCATION \'s3://datalake/bronze/events\'\n""")\n\nspark.sql("DESCRIBE HISTORY prod.bronze.events").show()',
      },
      {
        q: 'Explain the Delta transaction log and how it enables reliable reads.',
        a: 'The transaction log (_delta_log) is an ordered JSON record of every table change stored alongside Parquet data files.\n• Each commit appends a JSON file (00000000000000000001.json) listing added/removed files and metadata.\n• Checkpoints every N commits compact log history into a Parquet checkpoint for faster replay.\n• Readers compute current snapshot by applying log entries after latest checkpoint—no cluster lock required.\n• The log stores schema, partition columns, and table properties like enableChangeDataFeed.\n\nCorrupted or manually deleted log files break the table—never edit _delta_log by hand in production.',
        cmd: 'spark.sql("DESCRIBE DETAIL prod.bronze.events").select("numFiles", "sizeInBytes", "minReaderVersion").show()\n\n# Read raw log (debug only)\ndbutils.fs.ls("s3://datalake/bronze/events/_delta_log/")',
      },
      {
        q: 'What is Delta time travel and when would you use it?',
        a: 'Time travel queries historical snapshots of a Delta table by version number or timestamp.\n• Use cases: audit what data looked like before a bad deploy, recover from accidental DELETE, reproduce ML training on exact historical slice.\n• Syntax: VERSION AS OF n or TIMESTAMP AS OF \'2024-06-01T08:00:00\'.\n• Retention controlled by deletedFileRetentionDuration and logRetentionDuration table properties.\n• RESTORE TABLE resets live table to prior version—destructive, requires appropriate permissions.\n\nTime travel requires log files still retained—if VACUUM removed data files, old versions become unreadable.',
        cmd: 'spark.sql("SELECT count(*) FROM prod.orders VERSION AS OF 42")\n\nspark.sql("SELECT * FROM prod.orders TIMESTAMP AS OF \'2024-05-15 10:00:00\' LIMIT 10")\n\nspark.sql("RESTORE TABLE prod.orders TO VERSION AS OF 42")',
      },
      {
        q: 'How does Delta Lake compare to plain Parquet on S3 for analytics workloads?',
        a: 'Parquet alone is an immutable file format; Delta adds transactional metadata and DML operations.\n• Parquet directories suffer partial write failures leaving corrupt state; Delta commits are atomic.\n• Concurrent Parquet overwrites risk lost updates; Delta uses optimistic locking with conflict detection.\n• Parquet lacks built-in UPDATE/DELETE/MERGE; Delta supports upserts natively via MERGE INTO.\n• Delta enables Z-ORDER, liquid clustering, CDF, and Unity Catalog integration.\n• Migration: CONVERT TO DELTA or CREATE TABLE ... USING DELTA LOCATION existing path.\n\nKeep raw landing zone as Parquet/JSON if immutable; promote to Delta at bronze boundary.',
        cmd: 'spark.sql("CONVERT TO DELTA parquet.`s3://lake/legacy/sales`")\n\nspark.sql("""\n  OPTIMIZE delta.`s3://lake/legacy/sales`\n  ZORDER BY (customer_id)\n""")',
      },
    ],
    medium: [
      {
        q: 'How do you handle schema evolution and schema enforcement in Delta Lake?',
        a: 'Delta supports controlled schema changes to accommodate upstream API drift without breaking pipelines.\n• mergeSchema=true on write allows additive columns automatically—new fields appear in table schema.\n• overwriteSchema=true replaces entire schema (dangerous in prod—requires explicit approval).\n• Schema enforcement (default): writes rejecting unknown columns fail fast, protecting downstream contracts.\n• ALTER TABLE ADD COLUMN for explicit migrations with documentation in migration scripts.\n• Breaking changes (rename, type change) require shadow table + copy or generated column bridge period.\n\nMaintain schema registry and run compatibility checks in CI before deploying ingestion code.',
        cmd: 'spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")\n\ndf.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable("prod.bronze.api_events")\n\nspark.sql("ALTER TABLE prod.bronze.api_events ADD COLUMN device_type STRING")',
      },
      {
        q: 'Explain OPTIMIZE, Z-ORDER, and VACUUM operations and their operational impact.',
        a: 'These maintenance commands keep Delta tables performant and storage-efficient over time.\n• OPTIMIZE: compacts small files into larger ones via bin-packing—reduces listing overhead and improves scan parallelism.\n• ZORDER BY (cols): colocates related data in fewer files for filter pruning on high-cardinality columns (not a sort on read).\n• VACUUM: physically deletes data files no longer referenced by the log beyond retention threshold—irreversible.\n• Schedule OPTIMIZE off-peak; auto-compaction and optimized writes reduce manual need on ingest.\n• Never VACUUM with retention shorter than downstream time travel or streaming checkpoint requirements.\n\nMonitor numFiles in DESCRIBE DETAIL; alert when file count exceeds 10× partition count.',
        cmd: 'spark.sql("OPTIMIZE prod.silver.events ZORDER BY (user_id, event_date)")\n\nspark.sql("SET spark.databricks.delta.retentionDurationCheck.enabled = false")\nspark.sql("VACUUM prod.silver.events RETAIN 168 HOURS")',
      },
      {
        q: 'What is Change Data Feed (CDF) and how do you consume it downstream?',
        a: 'CDF captures row-level INSERT, UPDATE, DELETE events after each commit for incremental downstream processing.\n• Enable: ALTER TABLE SET TBLPROPERTIES (delta.enableChangeDataFeed = true).\n• Read changes: table_changes(\'table\', startVersion, endVersion) returns _change_type and _commit_version columns.\n• Use cases: propagate updates to search indexes, replicate to warehouses, incremental feature stores.\n• CDF retains change files per log retention—coordinate with VACUUM policies.\n• Alternative: streaming read of Delta table with startingVersion tracks inserts; CDF adds update/delete semantics.\n\nDesign consumers idempotently keyed on (_commit_version, primary_key) to handle replays.',
        cmd: 'spark.sql("ALTER TABLE prod.customers SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")\n\nspark.sql("""\n  SELECT * FROM table_changes(\'prod.customers\', 10, 20)\n  WHERE _change_type IN (\'insert\', \'update_postimage\')\n""").show()',
      },
      {
        q: 'How do you troubleshoot concurrent write conflicts on Delta tables?',
        a: 'Delta uses optimistic concurrency: if two writers touch overlapping files, the later commit fails with ConcurrentModificationException.\n• Common causes: two jobs overwriting same partition, streaming + batch merge on same table, OPTIMIZE concurrent with heavy writes.\n• Retry with exponential backoff for transient conflicts—Structured Streaming has built-in retry.\n• Reduce overlap: partition jobs by date LLD/date, serialize writes per table via job queue, use MERGE instead of blind overwrite.\n• Liquid clustering and smaller file sizes reduce file overlap probability.\n• Monitor conflict rate metric; sustained high rate indicates architectural contention needing table split or queue.\n\nDESCRIBE HISTORY shows operation metrics and conflict failures per commit.',
        cmd: 'spark.sql("DESCRIBE HISTORY prod.silver.inventory").select("version", "operation", "operationMetrics").show(truncate=False)\n\n# Idempotent merge instead of overwrite\nspark.sql("""\n  MERGE INTO prod.silver.inventory t\n  USING updates u ON t.sku = u.sku\n  WHEN MATCHED THEN UPDATE SET *\n  WHEN NOT MATCHED THEN INSERT *\n""")',
      },
    ],
    hard: [
      {
        q: 'Design a disaster recovery strategy for critical Delta tables across regions.',
        a: 'DR for Delta spans metadata, data files, and operational runbooks—not just bucket replication.\n• Deep clone or REPLICATE table to DR region on schedule; verify row counts and checksums post-sync.\n• Metastore: Unity Catalog metastore paired with regional storage; document failover catalog promotion steps.\n• RPO/RTO targets drive sync frequency: hourly clone for 1-hour RPO; continuous replication for minutes.\n• Failover: redirect Workflows to DR workspace, update external location credentials, validate GRANTs.\n• Test DR quarterly with game day—measure actual RTO vs paper plan.\n• Streaming checkpoints and CDF offsets must be included in DR scope or consumers replay from known version.\n\nPresent runbook: detection → declare incident → freeze writes → promote DR → validate → communicate → postmortem.',
        cmd: 'spark.sql("CREATE OR REPLACE TABLE dr.silver.orders DEEP CLONE prod.silver.orders")\n\n# Verify clone\nspark.sql("""\n  SELECT \'prod\' src, count(*) FROM prod.silver.orders\n  UNION ALL\n  SELECT \'dr\', count(*) FROM dr.silver.orders\n""").show()',
      },
      {
        q: 'How would you migrate 500 TB of Hive tables to Delta with minimal downtime?',
        a: 'Large migrations require phased cutover, dual-write validation, and rollback capability.\n• Phase 1: CONVERT TO DELTA in place or CREATE TABLE ... LOCATION pointing at converted path—no data copy if format compatible.\n• Phase 2: register in Unity Catalog, apply ACLs, update downstream jobs to read Delta paths.\n• Phase 3: parallel run old Hive and new Delta outputs; diff row counts and hash aggregates per partition.\n• Cutover: freeze Hive writes, final incremental sync via MERGE, switch Workflow pointers, keep Hive read-only 30 days.\n• Optimize post-migration: OPTIMIZE + ZORDER on hot tables during maintenance window.\n• Risk: non-Parquet formats need full rewrite; nested types may need schema adjustment.\n\nStaff migration war room with hourly progress dashboard: TB converted, tables remaining, validation failures.',
        cmd: 'spark.sql("CONVERT TO DELTA parquet.`s3://hive-warehouse/db/table`")\n\nspark.sql("MSCK REPAIR TABLE prod.migrated_table SYNC METADATA")\n\nspark.sql("OPTIMIZE prod.migrated_table")',
      },
      {
        q: 'Lead an incident review where VACUUM deleted files still needed for compliance audit.',
        a: 'This is a data governance Sev-1 with potential regulatory exposure.\n• Facts: operator ran VACUUM RETAIN 0 HOURS on production table; audit requires 7-year retention; versions 100–500 unrecoverable from storage.\n• Impact: inability to reproduce historical reports for investigated period; possible regulatory fine.\n• Root cause: bypassed retentionDurationCheck, no prod VACUUM approval workflow, misunderstanding that VACUUM is physical delete.\n• Recovery options: restore from cross-region bucket replication if lifecycle had not expired; rebuild from upstream archive if exists.\n• Prevent: deny VACUUM to non-admin roles, enforce minimum RETAIN via policy, separate compliance archive (WORM storage) independent of Delta retention.\n\nAction items: automated pre-VACUUM checklist, legal hold flag on tables, training for platform admins.',
        cmd: '# Check if deleted files recoverable via bucket versioning\naws s3api list-object-versions --bucket datalake-prod --prefix silver/orders/\n\nspark.sql("ALTER TABLE prod.orders SET TBLPROPERTIES (\'delta.deletedFileRetentionDuration\' = \'interval 2555 days\')")',
      },
      {
        q: 'Compare liquid clustering vs partition-by vs Z-ORDER for a 10B row fact table.',
        a: 'Layout choice dramatically affects query latency and maintenance overhead at billion-row scale.\n• Partition by date: excellent for daily filters and partition pruning; risk of skewed partitions and too many small directories if high cardinality added.\n• Z-ORDER: multi-dimensional clustering within files; great for ad-hoc filters on 2–4 columns; requires periodic OPTIMIZE.\n• Liquid clustering (Delta 3+): incremental clustering without explicit partition columns; adapts to changing query patterns; simplifies schema evolution.\n• Hybrid: partition by month for coarse prune + liquid cluster on customer_id for point lookups.\n• Benchmark: run representative queries with DESCRIBE DETAIL file stats and scan bytes read from EXPLAIN.\n\nRecommend liquid clustering when filter columns shift frequently; partition when 90% queries hit date range.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.fact_events (\n    event_id STRING, user_id BIGINT, event_date DATE, payload STRING\n  ) USING DELTA\n  CLUSTER BY (user_id, event_date)\n""")\n\nspark.sql("ALTER TABLE prod.fact_events CLUSTER BY (user_id, event_date)")',
      },
    ],
  },

  'delta-tables': {
    easy: [
      {
        q: 'How do you create and query a managed Delta table in Unity Catalog?',
        a: 'Managed tables store data in the catalog\'s managed storage location; Unity Catalog owns lifecycle and ACLs.\n• CREATE TABLE catalog.schema.name (...) USING DELTA; omits LOCATION—platform picks managed path.\n• Query with three-level namespace: SELECT * FROM prod.analytics.revenue.\n• SHOW TABLES IN prod.analytics lists registered objects.\n• DROP TABLE removes metadata and managed files (unless external table semantics differ).\n\nPrefer managed tables for standard domain data; external tables when data must remain in pre-existing bucket paths.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.sales.orders (\n    order_id BIGINT, customer_id BIGINT, amount DECIMAL(12,2), order_date DATE\n  ) USING DELTA\n""")\n\nspark.sql("SELECT * FROM prod.sales.orders WHERE order_date = current_date() LIMIT 10")',
      },
      {
        q: 'What is the difference between managed and external Delta tables?',
        a: 'The distinction is who controls the storage path and what happens on DROP TABLE.\n• Managed: UC/Databricks manages storage path; DROP deletes underlying files—good for curated datasets.\n• External: CREATE TABLE ... LOCATION \'s3://...\' ; DROP removes catalog entry only—data files remain.\n• External suits data shared across engines or governed by separate storage team retention policies.\n• Migration: CREATE TABLE ... DEEP CLONE or ALTER TABLE SET LOCATION with care.\n\nDocument external table ownership—orphan buckets occur when catalog entry deleted but storage team still bills.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.bronze.raw_logs\n  USING DELTA\n  LOCATION \'s3://company-datalake/bronze/raw_logs\'\n""")\n\nspark.sql("DESCRIBE EXTENDED prod.bronze.raw_logs").filter("col_name = \'Location\'").show()',
      },
      {
        q: 'Explain basic DML operations on Delta tables: INSERT, UPDATE, DELETE.',
        a: 'Delta supports row-level mutations unlike immutable Parquet datasets.\n• INSERT INTO: append rows; use for batch loads or INSERT SELECT from staging.\n• UPDATE: SET column expressions with WHERE filter—rewrites affected files.\n• DELETE: remove rows matching predicate—also file rewrite.\n• All DML creates new transaction log entry; old files removed on VACUUM per retention.\n• Large UPDATE/DELETE without partition filter can touch entire table—always filter by partition column when possible.\n\nFor upsert patterns, prefer MERGE INTO over separate UPDATE + INSERT logic.',
        cmd: 'spark.sql("INSERT INTO prod.customers VALUES (1001, \'Acme Corp\', \'US\')")\n\nspark.sql("UPDATE prod.customers SET country = \'USA\' WHERE customer_id = 1001")\n\nspark.sql("DELETE FROM prod.customers WHERE customer_id = 1001")',
      },
      {
        q: 'How do you inspect Delta table metadata and file statistics?',
        a: 'Rich metadata commands help operators understand table health without scanning all data.\n• DESCRIBE DETAIL: size, numFiles, numPartitions, min/max reader/writer versions, location.\n• DESCRIBE HISTORY: commit timeline with operation type and metrics.\n• DESCRIBE TABLE EXTENDED: column details, Serde, table properties.\n• SHOW TBLPROPERTIES: delta.enableChangeDataFeed, retention settings.\n\nUse numFiles and sizeInBytes ratio to detect small-file problem before users report slow queries.',
        cmd: 'spark.sql("DESCRIBE DETAIL prod.sales.orders").show(truncate=False)\n\nspark.sql("DESCRIBE HISTORY prod.sales.orders LIMIT 10").show()\n\nspark.sql("SHOW TBLPROPERTIES prod.sales.orders").show()',
      },
    ],
    medium: [
      {
        q: 'How do you implement MERGE INTO for idempotent upserts from a staging table?',
        a: 'MERGE is the standard pattern for CDC ingestion ensuring reruns do not duplicate rows.\n• Match on business key: ON target.id = source.id.\n• WHEN MATCHED AND source.updated_at > target.updated_at THEN UPDATE SET *.\n• WHEN NOT MATCHED THEN INSERT *.\n• Optional WHEN NOT MATCHED BY SOURCE THEN DELETE for sync-delete semantics.\n• Run merge from staging table populated in same job—avoid merging directly from streaming foreachBatch without dedup.\n\nValidate merge with pre/post row counts and null key rejection in staging constraints.',
        cmd: 'spark.sql("""\n  MERGE INTO prod.dim_product AS t\n  USING staging.product_updates AS s\n  ON t.product_id = s.product_id\n  WHEN MATCHED AND s.row_hash <> t.row_hash THEN UPDATE SET *\n  WHEN NOT MATCHED THEN INSERT *\n""")',
      },
      {
        q: 'What table properties and constraints should you set on production Delta tables?',
        a: 'Table properties encode operational policy directly in table metadata.\n• delta.autoOptimize.optimizeWrite / autoCompact: reduce small files on ingest (with DBU cost tradeoff).\n• delta.enableChangeDataFeed: for downstream incremental consumers.\n• delta.deletedFileRetentionDuration: align with compliance before VACUUM.\n• CHECK constraints: ALTER TABLE ADD CONSTRAINT valid_amount CHECK (amount >= 0).\n• Column masks and row filters via Unity Catalog for sensitive fields.\n\nDocument property changes in migration tickets—some require table rewrite or feature version upgrade.',
        cmd: 'spark.sql("""\n  ALTER TABLE prod.finance.payments SET TBLPROPERTIES (\n    \'delta.autoOptimize.optimizeWrite\' = \'true\',\n    \'delta.autoOptimize.autoCompact\' = \'true\'\n  )\n""")\n\nspark.sql("ALTER TABLE prod.finance.payments ADD CONSTRAINT chk_amount CHECK (amount >= 0)")',
      },
      {
        q: 'How do you partition Delta tables effectively without creating too many partitions?',
        a: 'Partitioning trades query pruning against metadata overhead and small-file proliferation.\n• Choose low-to-medium cardinality columns aligned with 80% of query filters (date, region).\n• Avoid partitioning on high-cardinality IDs—use Z-ORDER or liquid clustering instead.\n• Target hundreds to low thousands of partitions, not millions.\n• Replace static partitions with liquid clustering when query patterns diversify.\n• MSCK REPAIR / SYNC METADATA refreshes partition listing after external additions.\n\nRule: if average partition size < 1 GB, consider coarser partition grain or drop partition column.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.events (\n    event_id STRING, user_id BIGINT, event_ts TIMESTAMP, event_date DATE\n  ) USING DELTA\n  PARTITIONED BY (event_date)\n""")\n\nspark.sql("ALTER TABLE prod.events ADD PARTITION FIELD event_date")',
      },
      {
        q: 'Troubleshoot a Delta table that returns fewer rows than expected after a MERGE job.',
        a: 'Row count regressions after MERGE usually trace to join logic, filters, or accidental deletes.\n• Compare staging vs target key sets: anti-join to find missing keys.\n• Check WHEN NOT MATCHED BY SOURCE DELETE clause—often unintentionally enabled.\n• Verify merge condition handles NULL keys (NULL = NULL is unknown, not true).\n• Review DESCRIBE HISTORY for operationMetrics numTargetRowsInserted/Updated/Deleted counters.\n• Time travel to pre-merge version: count(*) VERSION AS OF n.\n\nAdd merge audit table logging matched/inserted/deleted counts per run_id.',
        cmd: 'spark.sql("SELECT count(*) FROM prod.orders VERSION AS OF 88")\n\nspark.sql("""\n  SELECT s.order_id FROM staging.orders s\n  LEFT ANTI JOIN prod.orders t ON s.order_id = t.order_id\n""").show()',
      },
    ],
    hard: [
      {
        q: 'Design a table lifecycle policy for bronze/silver/gold Delta tables with different retention tiers.',
        a: 'Lifecycle policies balance cost, compliance, and query performance across medallion layers.\n• Bronze: raw ingest, 90-day retention, partition by ingest_date, minimal OPTIMIZE, legal hold exceptions.\n• Silver: conformed entities, 3-year retention, MERGE SCD patterns, weekly OPTIMIZE, CDF enabled.\n• Gold: aggregated marts, indefinite retention, liquid clustering, BI-optimized file sizes.\n• Automation: Workflow runs VACUUM/DELETE WHERE ingest_date < cutoff per layer; tags tables with retention_class property.\n• Compliance archive: async export to WORM storage before bronze delete.\n\nPresent policy matrix to legal/compliance for sign-off; enforce via UC grants preventing manual override without ticket.',
        cmd: 'spark.sql("DELETE FROM prod.bronze.events WHERE ingest_date < current_date() - INTERVAL 90 DAYS")\n\nspark.sql("ALTER TABLE prod.bronze.events SET TBLPROPERTIES (\'retention_class\' = \'bronze_90d\')")',
      },
      {
        q: 'How would you handle a corrupted Delta table where _delta_log checkpoint is missing?',
        a: 'Log corruption blocks all reads—treat as P1 data platform incident.\n• Assess scope: single table vs storage outage; check S3/ADLS availability and permissions.\n• Attempt REPAIR TABLE or recreate checkpoint via spark.databricks.delta.retentionDurationCheck and expert restore utilities if available.\n• If recent good checkpoint exists: restore _delta_log from bucket versioning backup.\n• Last resort: rebuild table from raw bronze archive or Parquet data path bypassing log—loses version history.\n• Engage Databricks support with table path and DESCRIBE HISTORY export if any reads work.\n\nPost-incident: enable bucket versioning on all production Delta paths, block manual _delta_log edits via IAM.',
        cmd: 'dbutils.fs.ls("s3://datalake/prod/orders/_delta_log/")\n\n# Restore from backup checkpoint\ndbutils.fs.cp("s3://backup/orders/_delta_log/00000000000000000123.checkpoint.parquet",\n              "s3://datalake/prod/orders/_delta_log/00000000000000000123.checkpoint.parquet")',
      },
      {
        q: 'Architect row-level security on Delta tables for multi-tenant SaaS analytics.',
        a: 'Multi-tenant isolation requires defense in depth beyond application filters.\n• Unity Catalog row filters: CREATE ROW FILTER on table mapping tenant_id to current_user() or session variable.\n• Column masks for PII fields per role.\n• Separate catalogs per tenant for largest customers with strict isolation requirements.\n• Application sets spark.databricks.sql.session.tenant_id via job parameter; row filter references it.\n• Audit: log all queries via audit logs; periodic penetration test attempting cross-tenant reads.\n\nTradeoffs: single shared table with row filters simplifies ops; separate tables simplify compliance but multiply maintenance.',
        cmd: 'spark.sql("""\n  CREATE FUNCTION prod.security.tenant_filter(tenant_id STRING)\n  RETURN tenant_id = current_user();\n""")\n\nspark.sql("""\n  ALTER TABLE prod.shared.events\n  SET ROW FILTER prod.security.tenant_filter ON (tenant_id)\n""")',
      },
      {
        q: 'Lead optimization of a gold Delta table where BI queries scan 5 TB daily for 50 MB results.',
        a: 'Excessive scan bytes indicate missing pruning, wrong layout, or non-selective aggregates.\n• Profile queries: identify filter columns and join keys from Query Profile / SQL warehouse history.\n• Implement liquid cluster or partition on date + Z-ORDER on dimension keys matching filters.\n• Pre-aggregate: materialized summary tables refreshed incrementally for dashboard metrics.\n• Enable Photon on SQL warehouse for scan-heavy workloads.\n• Statistics: ANALYZE TABLE + column stats for broadcast decisions.\n• Target: reduce bytes read 90% within 30 days; track via system.query.history scanned_bytes metric.\n\nPresent cost savings: 5 TB → 200 MB scan × daily query volume = DBU reduction estimate.',
        cmd: 'spark.sql("OPTIMIZE prod.gold.daily_kpis ZORDER BY (region, product_line)")\n\nspark.sql("""\n  CREATE OR REPLACE TABLE prod.gold.daily_kpis_summary AS\n  SELECT region, product_line, sum(revenue) revenue\n  FROM prod.gold.daily_kpis\n  GROUP BY region, product_line\n""")',
      },
    ],
  },

  'unity-catalog': {
    easy: [
      {
        q: 'What is Unity Catalog and what problems does it solve in Databricks?',
        a: 'Unity Catalog is Databricks\' unified governance layer for data and AI assets across workspaces.\n• Centralized metastore: one source of truth for tables, views, volumes, models, and functions.\n• Fine-grained access control: catalog/schema/table/column level GRANT/REVOKE.\n• Data lineage: track upstream/downstream dependencies for impact analysis.\n• Audit logging: who accessed which table when—required for SOC2 and GDPR.\n\nBefore UC, hive metastore per workspace caused silos, inconsistent ACLs, and no cross-workspace sharing.',
        cmd: 'spark.sql("SHOW CATALOGS").show()\n\nspark.sql("CREATE CATALOG IF NOT EXISTS prod COMMENT \'Production data\'")\n\nspark.sql("GRANT USE CATALOG ON CATALOG prod TO `data-engineers`")',
      },
      {
        q: 'Explain the Unity Catalog three-level namespace.',
        a: 'All securable objects live under catalog.schema.object hierarchy.\n• Catalog: top-level boundary (often maps to environment or business unit)—prod, dev, finance.\n• Schema (database): groups related tables within a catalog—bronze, silver, analytics.\n• Object: table, view, volume, function, model—referenced as catalog.schema.table_name.\n• USE CATALOG prod; USE SCHEMA silver; sets default namespace for unqualified references.\n\nNaming conventions should be documented in data governance handbook to prevent catalog sprawl.',
        cmd: 'spark.sql("CREATE SCHEMA IF NOT EXISTS prod.silver COMMENT \'Conformed layer\'")\n\nspark.sql("SHOW TABLES IN prod.silver")\n\nspark.sql("SELECT * FROM prod.silver.customers LIMIT 5")',
      },
      {
        q: 'What are Unity Catalog volumes and when do you use them instead of DBFS?',
        a: 'Volumes are UC-governed storage for non-tabular files—libraries, configs, ML artifacts, unstructured data.\n• Managed volumes: UC controls path; external volumes register cloud path with UC ACLs.\n• Replace ad-hoc DBFS paths which bypass governance and are workspace-scoped.\n• Access via /Volumes/catalog/schema/volume_name/path in notebooks and %fs commands.\n• Apply same GRANT model as tables—READ VOLUME vs WRITE VOLUME.\n\nMigrate init scripts, wheel files, and training datasets from dbfs:/FileStore to volumes for prod compliance.',
        cmd: 'spark.sql("CREATE EXTERNAL VOLUME prod.libs.wheels LOCATION \'s3://platform/libs/wheels/\'")\n\n# Reference in job\n# --wheel /Volumes/prod/libs/wheels/platform_etl-1.2.0-py3-none-any.whl',
      },
      {
        q: 'How do you grant basic read access to a table for an analyst group?',
        a: 'Unity Catalog uses standard SQL GRANT statements with identity groups synced from SCIM.\n• USE CATALOG: required before querying objects in catalog.\n• USE SCHEMA: required for schema contents.\n• SELECT: read table data; SHOW grants visibility of metadata.\n• Groups (backtick quoted): `data-analysts` from IdP sync.\n• Principle of least privilege: grant SELECT on specific tables, not ALL TABLES.\n\nReview grants quarterly; orphaned access accumulates when employees change roles.',
        cmd: 'spark.sql("GRANT USE CATALOG ON CATALOG prod TO `data-analysts`")\nspark.sql("GRANT USE SCHEMA ON SCHEMA prod.analytics TO `data-analysts`")\nspark.sql("GRANT SELECT ON TABLE prod.analytics.revenue TO `data-analysts`")\n\nspark.sql("SHOW GRANTS ON TABLE prod.analytics.revenue").show()',
      },
    ],
    medium: [
      {
        q: 'How do you configure external locations and storage credentials in Unity Catalog?',
        a: 'External locations link cloud storage paths to UC with credential validation.\n• Storage credential: IAM role (AWS), service principal (Azure), or service account (GCP) UC assumes to access storage.\n• External location: registers s3://bucket/prefix bound to a credential.\n• CREATE EXTERNAL TABLE or MANAGED LOCATION on schema maps data to approved paths.\n• UC validates creator has WRITE on external location before CREATE TABLE.\n\nMisconfigured credentials cause TABLE_OR_VIEW_NOT_FOUND or ACCESS_DENIED on cluster init—test with CREATE TABLE dry run in staging.',
        cmd: 'spark.sql("""\n  CREATE STORAGE CREDENTIAL aws_prod_role\n  WITH IAM ROLE \'arn:aws:iam::123456789012:role/databricks-uc-storage\'\n""")\n\nspark.sql("""\n  CREATE EXTERNAL LOCATION prod_s3_lake\n  URL \'s3://company-datalake/prod/\'\n  WITH (STORAGE CREDENTIAL aws_prod_role)\n""")',
      },
      {
        q: 'Explain service principals and how automation jobs authenticate with Unity Catalog.',
        a: 'Service principals are non-human identities for Workflows, CI/CD, and API integrations.\n• Create in account console; assign to workspace; add to UC groups with appropriate grants.\n• Jobs run as service principal via run_as field in job settings—not personal user tokens.\n• Personal PATs tied to employees break when they leave; service principals are durable.\n• OAuth M2M preferred over long-lived PATs for production automation.\n• Audit logs attribute actions to service principal ID for traceability.\n\nRotate credentials on schedule; never embed PATs in notebook source—use secret scopes.',
        cmd: '# Job run_as configuration\n{"run_as": {"service_principal_name": "prod-etl-sp@company.com"}}\n\n# Generate OAuth token for SP (automation)\ncurl -X POST "$DATABRICKS_HOST/oidc/v1/token" \\\n  -d "grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=$SECRET&scope=all-apis"',
      },
      {
        q: 'How do you troubleshoot PERMISSION_DENIED errors on Unity Catalog objects?',
        a: 'UC permission errors require tracing identity, grants, and inheritance chain.\n• Confirm active identity: SELECT current_user(), current_catalog().\n• SHOW GRANTS ON TABLE/O SCHEMA/CATALOG for direct grants.\n• Check group membership: user may lack group added to grant.\n• External location: need READ/WRITE on location plus SELECT on table.\n• Ownership: owner has full control; transfer with ALTER OWNER if team changed.\n• Workspace-local admin ≠ UC metastore admin—escalate to account admin for metastore GRANT.\n\nReproduce with same run_as identity in notebook before changing production ACLs broadly.',
        cmd: 'spark.sql("SELECT current_user(), current_catalog()").show()\n\nspark.sql("SHOW GRANTS ON TABLE prod.silver.orders").show(false)\n\nspark.sql("SHOW GRANTS `user@company.com` ON TABLE prod.silver.orders").show()',
      },
      {
        q: 'What is data lineage in Unity Catalog and how do teams use it operationally?',
        a: 'Lineage captures dependencies between tables, notebooks, jobs, and dashboards.\n• Automatic capture for Spark reads/writes in supported runtimes when lineage enabled.\n• Lineage graph answers: if I change this column, which dashboards break?\n• Incident triage: upstream bronze delay propagates to which gold tables.\n• Compliance: demonstrate data provenance for regulated reports.\n• Limitations: external systems may not appear unless integrated; verify coverage for critical paths.\n\nComplement UC lineage with data contracts documenting SLA and schema between producer/consumer teams.',
        cmd: '# View lineage in Catalog Explorer UI or API\ncurl "$DATABRICKS_HOST/api/2.0/lineage-tracking/table-lineage" \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"table_name":"prod.gold.revenue","include_entity_lineage":true}\'',
      },
    ],
    hard: [
      {
        q: 'Design a Unity Catalog governance model for 500 engineers across 20 business units.',
        a: 'Enterprise UC governance balances autonomy with centralized standards.\n• Account structure: one metastore per region; catalogs per domain (finance, marketing) not per team.\n• Groups: `{domain}-{role}` pattern—finance-analyst, finance-engineer—synced via SCIM from IdP.\n• Roles: data owners approve grants; stewards manage schema; platform admins manage credentials/locations.\n• Self-service: catalog explorer grant requests via ServiceNow integrated with UC APIs.\n• Policies: deny external table creation outside approved locations; mandatory tags on catalogs.\n• Federation: Delta Sharing for cross-BU reads without copying data.\n\nMeasure: grant request SLA, audit finding count, orphaned table cleanup rate.',
        cmd: 'spark.sql("CREATE CATALOG finance COMMENT \'Owned by Finance Data Office\'")\n\nspark.sql("GRANT ALL PRIVILEGES ON CATALOG finance TO `finance-data-owner`")\n\nspark.sql("ALTER CATALOG finance SET TAGS (\'cost_center\' = \'FIN-001\', \'data_class\' = \'confidential\')")',
      },
      {
        q: 'How would you migrate from workspace-local Hive metastore to Unity Catalog with zero data copy?',
        a: 'UC migration re-registers existing cloud paths under UC governance without moving bytes.\n• Enable UC on workspace; assign metastore; create storage credential and external locations covering existing buckets.\n• SYNC block: CREATE TABLE ... LOCATION pointing at existing Delta/Parquet paths.\n• Migrate ACLs: map old ACLs to UC GRANTs via script; validate with access test matrix.\n• Update jobs: replace spark.table("hive_db.table") with prod.schema.table three-level names.\n• Deprecate hive_metastore catalog after parallel validation period.\n\nRisk: tables in DBFS root must relocate—UC does not support durable DBFS-managed prod data.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.bronze.legacy_orders\n  USING DELTA\n  LOCATION \'s3://existing-bucket/warehouse/orders\'\n""")\n\n# UC upgrade assistant (workspace admin UI) documents remaining hive tables',
      },
      {
        q: 'Lead incident response when a misconfigured GRANT exposed PII tables to all workspace users.',
        a: 'Data exposure incident requires immediate containment and regulatory assessment.\n• Detect: audit log alert on unusual SELECT volume on pii.customers; or external report.\n• Contain: REVOKE broad grant immediately; ALTER TABLE ENABLE ROW FILTER if available; disable compromised service principal.\n• Assess: query audit logs for identities and query count during exposure window; determine if data exported.\n• Notify: legal, security, potentially affected customers per GDPR/CCPA timelines.\n• Root cause: GRANT SELECT ON SCHEMA ... TO `users` instead of specific group; lack of grant review.\n• Prevent: break-glass approval for broad grants, automated policy detecting SELECT to all-users groups, quarterly access review.',
        cmd: 'spark.sql("REVOKE SELECT ON TABLE prod.pii.customers FROM `users`")\n\nspark.sql("SHOW GRANTS ON TABLE prod.pii.customers").show(false)\n\n# Audit query\ncurl "$DATABRICKS_HOST/api/2.0/audit-logs" -d \'{"filter_by":{"service_name":"unityCatalog","action_name":"getTable"}}\'',
      },
      {
        q: 'Compare Unity Catalog vs external governance tools (Collibra, Alation) in a hybrid architecture.',
        a: 'UC is enforcement layer; catalog tools are collaboration and policy documentation—many enterprises use both.\n• UC strengths: real-time ACL enforcement, lineage in execution path, Databricks-native integration.\n• External catalog: business glossary, data quality scoring, cross-platform assets (Snowflake, BigQuery).\n• Integration: sync UC metadata via APIs to Collibra; glossary terms link to UC table URLs.\n• Policy: define retention/classification in Collibra; enforce via UC tags and ABAC policies.\n• Avoid duplicate source of truth—pick system of record for ownership and sync unidirectionally.\n\nArchitecture review should show metadata flow: UC → sync job → enterprise catalog → data marketplace UI.',
        cmd: '# Export UC tables for sync\nspark.sql("""\n  SELECT catalog_name, schema_name, table_name, comment, created\n  FROM system.information_schema.tables\n  WHERE catalog_name = \'prod\'\n""").write.mode("overwrite").json("s3://governance/uc-export/")',
      },
    ],
  },

  'medallion-architecture': {
    easy: [
      {
        q: 'What is the medallion architecture and what are the bronze, silver, and gold layers?',
        a: 'Medallion architecture organizes data in quality stages from raw to business-ready.\n• Bronze: raw ingest, append-only, minimal transformation, preserves source fidelity and audit trail.\n• Silver: cleaned, deduplicated, conformed schemas, joins across sources—trusted entity layer.\n• Gold: business aggregates, KPIs, feature tables optimized for BI and ML consumption.\n• Each layer is typically separate Delta tables/schemas with increasing data quality SLAs.\n• Pipelines flow bronze → silver → gold with explicit contracts between layers.\n\nNot every dataset needs all three layers—simple pipelines may skip bronze if source is already clean.',
        cmd: 'spark.sql("CREATE SCHEMA IF NOT EXISTS prod.bronze")\nspark.sql("CREATE SCHEMA IF NOT EXISTS prod.silver")\nspark.sql("CREATE SCHEMA IF NOT EXISTS prod.gold")\n\nspark.sql("SHOW TABLES IN prod.bronze")',
      },
      {
        q: 'Why should bronze layer data remain immutable or append-only?',
        a: 'Bronze immutability preserves reprocessing capability and audit defensibility.\n• Append-only ingest captures every arrival; bad silver logic can be replayed from bronze without re-extracting from source.\n• Immutable bronze supports exactly-once semantics when combined with ingest metadata (file arrival time, source batch id).\n• Corrections happen in silver via MERGE, not by mutating bronze history.\n• Compliance: auditors verify raw data unchanged since ingestion timestamp.\n\nIf source sends corrections, model as new bronze records with event_type column rather than overwriting.',
        cmd: 'df.withColumn("ingest_ts", F.current_timestamp()) \\\n  .withColumn("source_file", F.input_file_name()) \\\n  .write.format("delta").mode("append").saveAsTable("prod.bronze.api_events")',
      },
      {
        q: 'What transformations typically happen between bronze and silver layers?',
        a: 'Silver applies data quality, standardization, and entity resolution.\n• Schema enforcement: cast types, rename columns to standard naming convention.\n• Deduplication: window row_number on business key keeping latest.\n• Null handling: quarantine invalid records to dead-letter table.\n• Harmonization: map source-specific codes to enterprise reference data.\n• Join enrichment: attach dimension keys from slowly changing dimensions.\n\nSilver outputs should have documented primary keys and freshness SLA (e.g., updated within 1 hour of bronze).',
        cmd: 'spark.sql("""\n  CREATE OR REPLACE TABLE prod.silver.orders AS\n  SELECT order_id, customer_id, CAST(amount AS DECIMAL(12,2)) amount,\n         to_date(order_ts) order_date, ingest_ts\n  FROM prod.bronze.raw_orders\n  WHERE order_id IS NOT NULL AND amount >= 0\n""")',
      },
      {
        q: 'How does the gold layer differ from silver in terms of consumers and design?',
        a: 'Gold optimizes for business questions, not source fidelity.\n• Wide denormalized tables for BI tools—star/snowflake schemas or wide KPI tables.\n• Pre-computed aggregations: daily revenue, funnel metrics, cohort retention.\n• Stable column names aligned to business glossary for self-service analytics.\n• Stricter change management: breaking schema changes require stakeholder notification.\n• May denormalize across multiple silver entities for query performance.\n\nGold tables should document metric definitions to prevent conflicting dashboard numbers.',
        cmd: 'spark.sql("""\n  CREATE OR REPLACE TABLE prod.gold.daily_revenue AS\n  SELECT order_date, region, sum(amount) total_revenue, count(DISTINCT customer_id) unique_customers\n  FROM prod.silver.orders o\n  JOIN prod.silver.customers c ON o.customer_id = c.customer_id\n  GROUP BY order_date, region\n""")',
      },
    ],
    medium: [
      {
        q: 'How do you implement incremental processing in a medallion pipeline?',
        a: 'Incremental pipelines process only changed data since last run for cost and speed.\n• Bronze: append new files or streaming micro-batches with ingest watermark.\n• Silver: MERGE from bronze WHERE ingest_ts > last_processed watermark stored in control table.\n• Gold: MERGE aggregates for affected dates only, not full re-aggregation.\n• Track watermarks: pipeline_metadata table with layer, table, max_version, max_ts per run.\n• Idempotency: rerunning same batch produces identical results—critical for Workflow retries.\n\nFull reprocessing fallback: replay bronze from date X when silver logic changes materially.',
        cmd: 'last_ts = spark.sql("SELECT max_ts FROM prod.meta.watermarks WHERE table=\'orders\'").collect()[0][0]\n\nspark.sql(f"""\n  MERGE INTO prod.silver.orders t\n  USING (SELECT * FROM prod.bronze.raw_orders WHERE ingest_ts > \'{last_ts}\') s\n  ON t.order_id = s.order_id\n  WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *\n""")',
      },
      {
        q: 'What data quality checks belong at each medallion layer?',
        a: 'Quality gates escalate strictness as data approaches business consumers.\n• Bronze: row arrived, file parsable, record count within ±20% of baseline, schema matches expected.\n• Silver: primary key uniqueness, referential integrity to dimensions, business rule validation (amount >= 0).\n• Gold: reconciliation to finance systems, metric totals match silver aggregates, no null KPIs.\n• Implementation: DLT expectations, Delta constraints, custom assert jobs writing to quality_metrics table.\n• Fail policy: bronze quarantine bad files; silver block promote; gold page on-call if reconciliation fails.\n\nTrend quality metrics—gradual drift warns before hard failure.',
        cmd: '@dlt.expect("valid_order_id", "order_id IS NOT NULL")\n@dlt.expect_or_fail("positive_amount", "amount >= 0")\ndef silver_orders():\n    return dlt.read("bronze_orders")',
      },
      {
        q: 'How do you organize schemas and catalogs for medallion layers in Unity Catalog?',
        a: 'UC naming should communicate layer, domain, and environment clearly.\n• Pattern: {env}.{domain}_{layer} or {env}.{layer}.{domain}—pick one standard.\n• Example: prod.sales_bronze, prod.sales_silver, prod.sales_gold OR prod.bronze.sales.\n• Grants: engineers write bronze/silver; analysts read gold only; ML service accounts read silver+gold.\n• Tags: layer=bronze, domain=sales, pii=true for policy automation.\n• Avoid mixing layers in one schema—complicates ACLs and confuses consumers.\n\nDocument catalog layout in onboarding wiki with example table paths per domain.',
        cmd: 'spark.sql("CREATE SCHEMA prod.bronze_sales COMMENT \'Sales bronze layer\'")\nspark.sql("ALTER SCHEMA prod.bronze_sales SET TAGS (\'layer\'=\'bronze\', \'domain\'=\'sales\')")\n\nspark.sql("GRANT SELECT ON SCHEMA prod.gold_sales TO `sales-analysts`")',
      },
      {
        q: 'Troubleshoot silver layer row count mismatch versus bronze after daily ETL.',
        a: 'Row count deltas may be expected (dedup) or indicate pipeline bugs.\n• Compare: bronze count vs silver count vs quarantine count—should sum logically.\n• Check filter predicates removing valid rows (timezone boundary on date filter).\n• Dedup window: verify row_number partition keys match business definition of "latest".\n• Anti-join bronze keys missing in silver to find dropped records.\n• MERGE logic: accidental WHEN NOT MATCHED BY SOURCE DELETE.\n\nDocument expected shrink ratio (e.g., 2% dedup)—alert when deviation exceeds threshold.',
        cmd: 'spark.sql("""\n  SELECT \'bronze\' layer, count(*) FROM prod.bronze.orders\n  UNION ALL SELECT \'silver\', count(*) FROM prod.silver.orders\n  UNION ALL SELECT \'quarantine\', count(*) FROM prod.quarantine.orders\n""").show()\n\nspark.sql("SELECT b.order_id FROM prod.bronze.orders b LEFT ANTI JOIN prod.silver.orders s ON b.order_id = s.order_id").count()',
      },
    ],
    hard: [
      {
        q: 'Design a medallion architecture for real-time and batch unified analytics on the same entities.',
        a: 'Lambda-lite architecture merges streaming bronze with batch correction in silver/gold.\n• Bronze streaming: Structured Streaming append to Delta with ingest_ts and source metadata.\n• Bronze batch: nightly reconciliation files from source systems land alongside stream.\n• Silver: MERGE prioritizing batch corrections over stream for same business key when conflict.\n• Gold: dual-path—real-time KPI table (5-min refresh) + daily certified mart from batch silver.\n• Consumers label dashboards "provisional" vs "certified" based on table source.\n\nKey challenge: out-of-order events—use watermark in stream bronze but unbounded correction window in silver MERGE.',
        cmd: 'stream_df.writeStream.format("delta") \\\n  .outputMode("append") \\\n  .option("checkpointLocation", "s3://lake/checkpoints/bronze_orders") \\\n  .toTable("prod.bronze.orders_stream")\n\nspark.sql("MERGE INTO prod.silver.orders ...")  # batch correction job',
      },
      {
        q: 'How would you refactor a legacy single-layer data lake into medallion without stopping the business?',
        a: 'Strangler migration introduces layers incrementally while legacy tables remain live.\n• Identify highest-value domain first (e.g., sales)—build parallel bronze/silver/gold pipeline.\n• Dual-publish: new gold table + legacy table; BI dashboards migrate one at a time.\n• Validation: automated diff reports between legacy and gold metrics for 30-day soak.\n• Deprecate legacy: announce sunset date, redirect grants, archive old path read-only.\n• Do not rename legacy tables in place—confusing; create new UC objects with clear names.\n\nProgram manage with domain owners; 12-month roadmap with quarterly milestones and measurable adoption %.',
        cmd: 'spark.sql("""\n  SELECT l.date, l.revenue legacy_rev, g.total_revenue new_rev,\n         abs(l.revenue - g.total_revenue) diff\n  FROM legacy.daily_revenue l\n  FULL OUTER JOIN prod.gold.daily_revenue g ON l.date = g.order_date\n  WHERE abs(l.revenue - g.total_revenue) > 0.01\n""").show()',
      },
      {
        q: 'Lead architecture review where gold layer has become a "data swamp" of 400 overlapping tables.',
        a: 'Gold sprawl erodes trust—identical metrics with different numbers across dashboards.\n• Discovery: inventory tables, owners, last accessed date from system tables/audit logs.\n• Consolidation: define canonical metric definitions; merge overlapping tables into certified marts.\n• Governance: gold table creation requires architecture review ticket; deny CREATE in gold schema without approval.\n• Deprecation: mark duplicate tables DEPRECATED tag, 90-day migration period, then drop.\n• Metric layer: optional semantic layer (Metric Views) so BI references metrics not raw tables.\n\nKPI: reduce gold tables 400 → 80 certified; single source for revenue, active users, churn.',
        cmd: 'spark.sql("""\n  SELECT table_schema, table_name, comment,\n         last_altered FROM system.information_schema.tables\n  WHERE table_schema LIKE \'gold%\'\n  ORDER BY last_altered DESC\n""").show()\n\nspark.sql("ALTER TABLE prod.gold.old_revenue_v3 SET TAGS (\'status\'=\'deprecated\')")',
      },
      {
        q: 'Explain cost optimization strategies specific to medallion pipelines on Databricks.',
        a: 'Medallion cost drivers are redundant full scans, over-frequent gold refreshes, and small files.\n• Bronze: cheap storage, minimal compute—avoid heavy transforms; use autoloader with managed file events.\n• Silver: incremental MERGE only; partition prune; OPTIMIZE weekly not daily unless needed.\n• Gold: refresh aggregated partitions affected by change only; materialized views for SQL warehouses.\n• Right-size job clusters per layer—bronze ingest needs less memory than silver joins.\n• Archive cold bronze partitions to cheaper storage class after retention window.\n\nMonthly FinOps review: DBU by layer tag; target bronze 20%, silver 50%, gold 30% of pipeline spend.',
        cmd: 'spark.sql("""\n  DELETE FROM prod.gold.daily_kpis\n  WHERE order_date IN (SELECT DISTINCT order_date FROM prod.silver.orders WHERE updated_at > current_date() - 1)\n""")\n\n# Recompute only affected dates\nspark.sql("INSERT INTO prod.gold.daily_kpis SELECT ... GROUP BY order_date")',
      },
    ],
  },

  'etl-pipelines': {
    easy: [
      {
        q: 'What is an ETL pipeline in Databricks and how does it differ from ELT?',
        a: 'ETL transforms data before loading to the warehouse; ELT loads raw first then transforms in-place.\n• Databricks lakehouse favors ELT: land raw in bronze Delta, transform with Spark in silver/gold.\n• Extract: Autoloader, JDBC, API connectors, cloud storage listing.\n• Transform: Spark SQL/DataFrame in cluster compute on data already in the lake.\n• Load: write to Delta tables registered in Unity Catalog.\n• Benefit: replay transforms without re-extracting; storage is cheap relative to repeated extract API calls.\n\nUse classic ETL only when source constraints forbid raw storage (licensing, PII at rest restrictions).',
        cmd: 'df = spark.read.format("cloudFiles") \\\n  .option("cloudFiles.format", "json") \\\n  .load("s3://landing/events/")\n\ndf.write.format("delta").mode("append").saveAsTable("prod.bronze.events")',
      },
      {
        q: 'What is Autoloader and why use it for file ingestion?',
        a: 'Autoloader (cloudFiles source) incrementally ingests new files from cloud storage with exactly-once semantics.\n• Tracks processed files in checkpoint location—reruns skip already ingested files.\n• Scales to millions of files via file notification mode (SQS/Event Grid) instead of directory listing.\n• Schema inference and evolution with schemaHints and schemaLocation for tracking changes.\n• Handles file arrival out of order with appropriate options.\n\nPrefer Autoloader over spark.read.parquet("path/*") in scheduled jobs—that full listing does not scale.',
        cmd: 'spark.readStream.format("cloudFiles") \\\n  .option("cloudFiles.format", "parquet") \\\n  .option("cloudFiles.schemaLocation", "s3://lake/checkpoints/bronze_events/schema") \\\n  .load("s3://landing/events/") \\\n  .writeStream.option("checkpointLocation", "s3://lake/checkpoints/bronze_events/") \\\n  .table("prod.bronze.events")',
      },
      {
        q: 'How do you schedule a batch ETL job in Databricks Workflows?',
        a: 'Workflows (formerly Jobs) orchestrate notebook, Python, SQL, and JAR tasks on schedules or triggers.\n• Create multi-task job with dependency graph (task B after task A succeeds).\n• Schedule: cron expression or continuous trigger for streaming-adjacent workloads.\n• Use job cluster that terminates after run—cost efficient for batch ETL.\n• Configure retries, email/Slack notifications on failure, timeout per task.\n• Parameterize with job parameters passed to notebook widgets or Python argparse.\n\nProduction ETL should not rely on notebook manual Run—everything via version-controlled job definitions.',
        cmd: 'databricks jobs create --json \'{\n  "name": "daily-silver-etl",\n  "schedule": {"quartz_cron_expression": "0 0 6 * * ?", "timezone_id": "America/New_York"},\n  "tasks": [{"task_key": "silver_orders", "notebook_task": {"notebook_path": "/Repos/prod/etl/silver_orders", "base_parameters": {"run_date": "{{job.start_time.iso_date}}"}}}]\n}\'',
      },
      {
        q: 'Explain idempotency and why it matters for ETL pipelines.',
        a: 'Idempotent pipelines produce the same output when run multiple times with the same input—essential for safe retries.\n• Non-idempotent overwrite may duplicate rows or lose data on retry mid-run.\n• Patterns: MERGE keyed on business id, partition overwrite with dynamic partition mode for specific dates only.\n• Track batch_id in target table; reject or skip if batch already processed.\n• Streaming: use checkpoint + deduplication on event id within watermark window.\n\nWorkflow task retry after network blip must not double-load financial transactions.',
        cmd: 'batch_id = dbutils.widgets.get("batch_id")\n\nif spark.sql(f"SELECT 1 FROM prod.meta.batches WHERE batch_id=\'{batch_id}\'").count() == 0:\n    # process and record\n    spark.sql(f"INSERT INTO prod.meta.batches VALUES (\'{batch_id}\', current_timestamp())")',
      },
    ],
    medium: [
      {
        q: 'How do you handle slowly changing source APIs with rate limits in ETL extraction?',
        a: 'API extraction requires respectful pacing, pagination, and incremental cursor tracking.\n• Store last_successful_cursor in control table; each run fetches since cursor.\n• Implement exponential backoff on 429 responses; respect Retry-After headers.\n• Parallelize across entity shards if API allows (by region, date window)—not unbounded threads.\n• Land raw JSON in bronze before parsing—API schema changes debugged from raw payload.\n• Secrets: API keys in Databricks secret scope, never hardcoded.\n\nCircuit breaker: pause extraction after N consecutive failures; alert integration owner.',
        cmd: 'import requests\n\ntoken = dbutils.secrets.get(scope="api", key="crm_token")\nheaders = {"Authorization": f"Bearer {token}"}\ncursor = spark.sql("SELECT cursor FROM prod.meta.api_state WHERE source=\'crm\'").collect()[0][0]\nresp = requests.get(f"https://api.crm.com/v2/records?since={cursor}", headers=headers)',
      },
      {
        q: 'Design error handling and dead-letter patterns for production ETL.',
        a: 'Robust ETL separates happy path from failure capture without stopping entire batch.\n• Try/parse per record or per file: malformed rows to prod.quarantine.{table} with error_reason.\n• Task-level: Workflow retries transient failures; on permanent failure, trigger downstream skip via task values.\n• Alert on quarantine row rate threshold—spike indicates upstream schema break.\n• Replay tool: parameterized job to reprocess quarantine after fix deployed.\n• DLQ metadata: source_file, raw_payload, exception_message, ingest_ts for forensic analysis.\n\nSLA: 99% records succeed; quarantine reviewed within 24 hours by data steward.',
        cmd: 'try:\n    clean_df = raw_df.filter("order_id IS NOT NULL")\n    bad_df = raw_df.subtract(clean_df).withColumn("error", F.lit("null order_id"))\n    bad_df.write.format("delta").mode("append").saveAsTable("prod.quarantine.orders")\nexcept Exception as e:\n    dbutils.notebook.exit(json.dumps({"status": "FAILED", "error": str(e)}))',
      },
      {
        q: 'How do you parameterize ETL pipelines across environments without code duplication?',
        a: 'Environment parameterization keeps one codebase deployable to dev/staging/prod.\n• Databricks Asset Bundles: target-specific variables (catalog name, storage path) in databricks.yml.\n• Job parameters: {{job.parameters.catalog}} passed to notebooks.\n• Config files on Unity Catalog volumes per environment read at runtime.\n• Avoid if/else env blocks in notebook—centralize config loader module.\n• CI/CD promotes same git tag across targets with integration tests in staging.\n\nAnti-pattern: three copies of notebook with prod hardcoded in cell one.',
        cmd: '# databricks.yml\n# targets:\n#   prod:\n#     variables:\n#       catalog: prod\n#   dev:\n#     variables:\n#       catalog: dev\n\ncatalog = spark.conf.get("etl.catalog", "dev")\nspark.sql(f"USE CATALOG {catalog}")',
      },
      {
        q: 'Compare notebook-based ETL vs packaged Python wheel jobs for maintainability.',
        a: 'Notebooks suit exploration; wheels suit production maintainability and testing.\n• Notebooks: fast iteration, visual outputs; risk of untested cell order dependency and hidden state.\n• Wheels: proper package structure, pytest unit tests, type hints, linting in CI.\n• Hybrid: thin notebook calls %pip install wheel + main(config_path).\n• Workflows python_wheel_task is entry point for prod; notebooks deprecated after stabilization.\n• Version pin wheel in job spec; artifact stored on UC volume with semver tags.\n\nMigration: extract notebook logic to functions module-by-module with parity tests comparing outputs.',
        cmd: '{"python_wheel_task": {\n  "package_name": "company_etl",\n  "entry_point": "run_silver",\n  "parameters": ["--catalog", "prod", "--table", "orders"]\n}}\n\n# Build: python -m build && databricks fs cp dist/*.whl /Volumes/prod/libs/wheels/',
      },
    ],
    hard: [
      {
        q: 'Architect a multi-source ETL platform ingesting 200+ sources with SLAs from 5 minutes to daily.',
        a: 'Multi-SLA platform needs tiered infrastructure, not one-size-fits-all clusters.\n• Tier 1 (5-min): Structured Streaming + Autoloader, dedicated small always-on or triggered streaming jobs.\n• Tier 2 (hourly): incremental batch MERGE on job clusters with autoscale.\n• Tier 3 (daily): large batch on spot instances with partition parallelism.\n• Shared framework: connector SDK with extract/transform hooks; metadata registry maps source → tier → SLA.\n• Observability: unified pipeline_status table with lag_minutes per source; SLA breach alerts.\n• Self-service onboarding: template repo + CI scaffold; platform team reviews connector PR.\n\nCapacity plan: peak concurrent Tier-1 jobs, metastore API limits, storage request rate on landing buckets.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.meta.pipeline_sla (\n    source_id STRING, tier INT, sla_minutes INT,\n    last_success_ts TIMESTAMP, lag_minutes INT\n  ) USING DELTA\n""")\n\nspark.sql("SELECT * FROM prod.meta.pipeline_sla WHERE lag_minutes > sla_minutes")',
      },
      {
        q: 'How would you recover from a bad ETL deploy that corrupted silver tables for three days?',
        a: 'Multi-day corruption requires coordinated rollback across layers and consumer communication.\n• Stop pipelines immediately; freeze gold downstream refreshes.\n• Assess: DESCRIBE HISTORY identifies bad commit versions; time travel samples validate good version before deploy.\n• Silver: RESTORE TABLE TO VERSION AS OF last_good or replay bronze for affected dates with fixed code.\n• Gold: rebuild from restored silver for date range.\n• Validate: reconciliation queries vs source systems and finance controls.\n• Communicate: notify BI teams which dashboards were wrong and corrected date range.\n\nPostmortem: staging soak period, automated output diff in CI, canary deploy on 1% partition before full rollout.',
        cmd: 'spark.sql("RESTORE TABLE prod.silver.orders TO VERSION AS OF 1042")\n\nspark.sql("""\n  INSERT OVERWRITE prod.gold.daily_revenue\n  SELECT ... FROM prod.silver.orders\n  WHERE order_date BETWEEN \'2024-06-01\' AND \'2024-06-03\'\n""")',
      },
      {
        q: 'Lead design of CI/CD for Databricks ETL with automated data quality gates.',
        a: 'CI/CD for data pipelines extends code deployment with data validation gates.\n• PR: unit tests (pytest), sqlfluff lint, bundle validate, deploy to dev workspace via GitHub Actions.\n• Staging run: execute pipeline on sampled prod data (masked) or full staging catalog.\n• Quality gate: row count within tolerance, schema match, metric diff < 0.1% vs baseline.\n• Prod promote: manual approval + tagged release; Workflow job definition updated via bundle deploy.\n• Rollback: previous wheel version pin + RESTORE TABLE if bad data shipped.\n\nTools: Databricks Asset Bundles, dbx or custom Terraform provider, Great Expectations or DLT expectations.',
        cmd: '# GitHub Actions snippet\ndatabricks bundle validate -t staging\ndatabricks bundle deploy -t staging\ndatabricks jobs run-now --job-id $STAGING_JOB_ID\n# Fail PR if quality assertion notebook returns non-zero',
      },
      {
        q: 'Explain backfill strategy for reprocessing one year of historical data without overloading the platform.',
        a: 'Large backfills need throttling, parallelism control, and off-peak scheduling.\n• Split backfill into date chunks (weekly)—Workflow for-each task with concurrency limit 5.\n• Use spot instances and separate backfill job cluster policy with lower priority.\n• Incremental MERGE per chunk avoids duplicating unaffected partitions.\n• Monitor: cluster queue depth, source API rate limits, storage write IOPS.\n• Coordinate with FinOps—backfill DBU spike should be forecasted.\n• Validate sample weeks before full year; automate row count/hash checks per chunk.\n\nPause non-critical jobs during backfill window if shared metastore shows throttling.',
        cmd: '{"for_each_task": {\n  "inputs": "[\\"2023-01\\",\\"2023-02\\",\\"...\\"]",\n  "concurrency": 4,\n  "task": {"spark_python_task": {"python_file": "backfill.py", "parameters": ["{{input}}"]}}\n}}',
      },
    ],
  },

  'structured-streaming': {
    easy: [
      {
        q: 'What is Structured Streaming in Spark and how does it process data?',
        a: 'Structured Streaming treats a live data stream as an unbounded table appended row-by-row.\n• You write batch-like DataFrame/SQL logic; Spark incrementally executes micro-batches on new data.\n• Output modes: append (new rows), complete (full aggregate snapshot), update (changed rows only for aggregations).\n• Checkpoint directory stores offset metadata and query progress for fault tolerance.\n• Exactly-once semantics achievable with idempotent sinks like Delta Lake and transactional writes.\n\nUnlike DStreams (legacy), Structured Streaming uses Catalyst optimizer and integrates with DataFrame API.',
        cmd: 'stream = spark.readStream.format("kafka") \\\n  .option("subscribe", "events") \\\n  .option("kafka.bootstrap.servers", "broker:9092") \\\n  .load()\n\nquery = stream.writeStream.format("delta") \\\n  .option("checkpointLocation", "s3://lake/checkpoints/events") \\\n  .outputMode("append") \\\n  .table("prod.bronze.kafka_events")',
      },
      {
        q: 'Explain checkpointing in Structured Streaming and why it is required.',
        a: 'Checkpoints persist streaming query state so restarts resume without reprocessing or losing progress.\n• Stores source offsets, sink write confirmations, and aggregation state (state store).\n• On driver restart, query replays from last committed checkpoint batch.\n• Deleting checkpoint resets stream to configured startingOffsets—may duplicate or miss data.\n• Separate checkpoint per query—never share between streams.\n• State store grows with stateful operations (dropDuplicates, aggregations)—monitor RocksDB state size.\n\nBackup checkpoint path before code changes that alter state schema— incompatible changes require new checkpoint.',
        cmd: 'query = df.writeStream \\\n  .format("delta") \\\n  .option("checkpointLocation", "s3://lake/checkpoints/orders_v2") \\\n  .trigger(processingTime="30 seconds") \\\n  .start("s3://lake/bronze/orders")\n\nquery.awaitTermination()',
      },
      {
        q: 'What is a watermark in Structured Streaming and when do you use it?',
        a: 'Watermark bounds state by event-time, allowing Spark to drop old state and finalize late-data handling.\n• Define: withWatermark("event_ts", "10 minutes") on event-time column.\n• Rows older than watermark are considered late; policy determines drop vs update.\n• Required for unbounded aggregations and deduplication to prevent state explosion.\n• Tradeoff: longer watermark tolerates more lateness but retains more state (memory cost).\n• Without watermark, state grows forever on stateful queries.\n\nAlign watermark with business SLA for lateness (e.g., source may arrive 15 min late).',
        cmd: 'from pyspark.sql.functions import window, col\n\nstream.withWatermark("event_ts", "15 minutes") \\\n  .groupBy(window(col("event_ts"), "5 minutes"), col("product_id")) \\\n  .count() \\\n  .writeStream.format("delta").option("checkpointLocation", path).start()',
      },
      {
        q: 'How do you read from and write to Delta Lake in Structured Streaming?',
        a: 'Delta is the recommended sink for streaming pipelines on Databricks.\n• Read stream: spark.readStream.format("delta").table("prod.bronze.events") for downstream silver processing.\n• Write stream: writeStream.format("delta").outputMode("append") to Delta table path or .toTable().\n• foreachBatch enables MERGE upserts in micro-batch callback for silver layer.\n• Delta streaming supports startingVersion/startingTimestamp for consuming CDF or incremental reads.\n\nUse availableNow trigger for cost-efficient "streaming" batch runs on scheduled jobs.',
        cmd: 'def upsert_batch(batch_df, batch_id):\n    batch_df.createOrReplaceTempView("updates")\n    spark.sql("""MERGE INTO prod.silver.orders t USING updates s ON t.id=s.id WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *""")\n\nstream.writeStream.foreachBatch(upsert_batch).option("checkpointLocation", path).start()',
      },
    ],
    medium: [
      {
        q: 'How do you implement exactly-once streaming ingestion from Kafka to Delta?',
        a: 'Exactly-once requires coordinated offset commits and idempotent writes at sink.\n• Kafka source tracks offsets in checkpoint; Delta sink commits atomically per micro-batch.\n• Use unique event_id deduplication within watermark window for at-least-once sources with effective exactly-once semantics.\n• MERGE on event_id in foreachBatch handles duplicate delivery from Kafka rebalance.\n• Disable unclean leader election awareness—use consistent serialization (Avro/Protobuf schema registry).\n• Monitor consumer lag vs processing rate; lag growth indicates under-provisioned cluster.\n\nValidate: kill driver mid-batch, restart, verify no duplicate keys in target table.',
        cmd: 'spark.readStream.format("kafka") \\\n  .option("kafka.bootstrap.servers", brokers) \\\n  .option("subscribe", "orders") \\\n  .option("startingOffsets", "latest") \\\n  .option("failOnDataLoss", "true") \\\n  .load() \\\n  .selectExpr("CAST(value AS STRING) json", "timestamp kafka_ts")',
      },
      {
        q: 'Troubleshoot a Structured Streaming query that stops processing with no error in notebook.',
        a: 'Silent stalls often indicate backpressure, state store pressure, or trigger misconfiguration.\n• Check query.status and lastProgress—isTriggerActive false means query stopped.\n• Spark UI Streaming tab: input rate vs processing rate; if processing < input, backlog grows.\n• State store spill: increase executor memory or reduce state retention/watermark.\n• Driver OOM from too many concurrent streaming queries on same cluster.\n• Checkpoint corruption: exception buried in driver logs—search for ConcurrentModificationException or state schema mismatch.\n\nRestart with fresh checkpoint only after understanding data loss implications.',
        cmd: 'for q in spark.streams.active:\n    print(q.name, q.lastProgress)\n    print(q.status)\n\n# Restart query\nquery.stop()\n# fix issue then start with same checkpoint path',
      },
      {
        q: 'Explain foreachBatch vs continuous processing trigger options.',
        a: 'Trigger choice affects latency, cost, and compatibility with sink operations.\n• Default processingTime trigger: micro-batches at interval (e.g., 10s)—best for Delta MERGE and complex logic.\n• Once/availableNow: process all available data then stop—ideal for scheduled incremental jobs.\n• Continuous trigger (low latency, experimental for some sources): sub-second latency but limited sink support.\n• foreachBatch: run arbitrary DataFrame operations per batch including MERGE, multiple sinks, custom metrics.\n\nProduction silver layer almost always uses processingTime + foreachBatch MERGE pattern.',
        cmd: 'stream.writeStream \\\n  .foreachBatch(merge_to_silver) \\\n  .trigger(processingTime="1 minute") \\\n  .option("checkpointLocation", checkpoint) \\\n  .start()\n\n# Scheduled incremental\nstream.writeStream.trigger(availableNow=True).foreachBatch(merge).start().awaitTermination()',
      },
      {
        q: 'How do you monitor Structured Streaming pipeline lag and throughput in production?',
        a: 'Streaming SLAs require metrics beyond notebook lastProgress manual checks.\n• Custom metrics: foreachBatch logs batchId, inputRows, durationMs to Delta monitoring table.\n• Kafka lag: compare max event_ts in bronze vs source wall clock.\n• Databricks job alerts on streaming query termination or failure.\n• Ganglia/Spark metrics: records/sec per micro-batch from StreamingQueryListener.\n• Alert thresholds: lag > 30 min, processing time > trigger interval consistently, state store memory > 80%.\n\nDashboard: lag trend, batch duration p95, failed batches count per 24h.',
        cmd: 'spark.streams.addListener(StreamingQueryListener())\n\n# Log to monitoring table in foreachBatch\nmetrics_df = spark.createDataFrame([(batch_id, batch_df.count(), duration_ms)], ["batch_id","rows","duration_ms"])\nmetrics_df.write.format("delta").mode("append").saveAsTable("prod.meta.stream_metrics")',
      },
    ],
    hard: [
      {
        q: 'Design a multi-hop streaming pipeline from Kafka through bronze/silver/gold with distinct SLAs.',
        a: 'Chained streams decouple layers but multiply checkpoint and failure domains.\n• Stream 1: Kafka → bronze Delta (append, 30s trigger, raw JSON preserved).\n• Stream 2: readStream bronze → silver MERGE (1 min trigger, dedup + validation).\n• Stream 3: silver change feed or readStream → gold aggregates (5 min trigger).\n• Independent checkpoints per hop; failure in silver does not reset bronze offsets.\n• SLA monitoring per hop; gold provisional label until silver lag clears threshold.\n• Scale: separate job clusters per stream; avoid running three streams on one undersized driver.\n\nDocument recovery: which checkpoints to reset for each failure scenario without full replay from Kafka retention limit.',
        cmd: '# Bronze job\nkafka_stream.writeStream.option("checkpointLocation", "s3://cp/bronze").toTable("prod.bronze.events")\n\n# Silver job — separate Workflow\nspark.readStream.table("prod.bronze.events").writeStream.foreachBatch(merge_silver).option("checkpointLocation", "s3://cp/silver").start()',
      },
      {
        q: 'How would you handle a schema change in upstream Kafka topic without stopping the stream?',
        a: 'Schema evolution in streaming requires backward-compatible changes and careful state handling.\n• Use schema registry (Confluent/Protobuf) with compatible mode (add optional fields only).\n• from_json with schema_of_json or explicit StructType; unknown fields to variant column for bronze.\n• mergeSchema on Delta bronze append for additive columns.\n• Breaking change (rename/remove): dual-topic migration—consume old+new topics, union with normalized schema, deprecate old after cutover.\n• Update checkpoint only after validating stateful operator schema change—may require new checkpoint path.\n\nCoordinate with producers on compatibility policy; test in staging with copy of prod traffic.',
        cmd: 'from pyspark.sql.functions import from_json, schema_of_json\n\nsample = spark.read.format("kafka").load().select("value").limit(1)\nschema = schema_of_json(sample.selectExpr("CAST(value AS STRING)").first()[0])\n\nparsed = stream.select(from_json(col("value").cast("string"), schema).alias("data"))',
      },
      {
        q: 'Lead incident where streaming duplicate records caused double revenue reporting.',
        a: 'Duplicate revenue is high-severity data integrity incident requiring finance coordination.\n• Detect: finance reconciliation alert; duplicate event_ids in gold or inflated daily totals vs source.\n• Triage: identify window without dedup; checkpoint reset reprocessed Kafka offsets; MERGE key missing.\n• Contain: pause gold dashboards; notify stakeholders not to use affected dates.\n• Fix: backfill silver with dropDuplicates on event_id; rebuild gold partitions; add MERGE idempotency.\n• Prevent: mandatory event_id uniqueness constraint; stream audit comparing source count vs bronze count per hour.\n\nPostmortem timeline with Kafka retention boundary—records outside retention unrecoverable without archive.',
        cmd: 'spark.sql("""\n  SELECT event_id, count(*) cnt FROM prod.gold.revenue\n  WHERE event_date = \'2024-06-15\' GROUP BY event_id HAVING cnt > 1\n""").show()\n\nspark.sql("DELETE FROM prod.gold.revenue WHERE event_date = \'2024-06-15\'")\n# Rebuild from deduped silver',
      },
      {
        q: 'Compare Structured Streaming vs Delta Live Tables for streaming ingestion decision.',
        a: 'Both build on Spark streaming but differ in operational model and flexibility.\n• Structured Streaming: full programmatic control, custom foreachBatch MERGE, any trigger pattern, portable Spark code.\n• DLT: declarative @dlt.table, automatic dependency graph, built-in expectations, managed recovery—less boilerplate.\n• DLT costs DLT pipeline compute; harder to inject complex side-effect logic mid-stream.\n• Choose Streaming: complex multi-sink, non-Delta targets, fine-grained Kafka tuning, existing wheel codebase.\n• Choose DLT: standard medallion paths, team prefers SQL/Python declarations, want platform-managed lineage.\n\nHybrid common: DLT for 80% paths; raw Structured Streaming for high-custom Kafka ingestion gateway.',
        cmd: 'import dlt\n\n@dlt.table(name="bronze_events")\ndef bronze():\n    return spark.readStream.format("cloudFiles").option("cloudFiles.format","json").load("s3://landing/")',
      },
    ],
  },

  'spark-optimization': {
    easy: [
      {
        q: 'What is Adaptive Query Execution (AQE) and what optimizations does it enable?',
        a: 'AQE reoptimizes the query plan at runtime based on actual shuffle statistics collected during execution.\n• Coalesce partitions: merge small shuffle partitions to reduce task overhead after filter.\n• Switch join strategy: convert sort-merge to broadcast if runtime stats show table is small.\n• Skew join optimization: split skewed partitions into sub-partitions automatically.\n• Enabled by default on DBR 9+ for Spark SQL: spark.sql.adaptive.enabled=true.\n\nAQE reduces need for manual spark.sql.shuffle.partitions tuning on many workloads.',
        cmd: 'spark.conf.set("spark.sql.adaptive.enabled", "true")\nspark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")\nspark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")\n\nspark.sql("EXPLAIN FORMATTED SELECT * FROM large a JOIN small b ON a.id = b.id").show(truncate=False)',
      },
      {
        q: 'When should you use broadcast join and how do you hint it in Spark SQL?',
        a: 'Broadcast join sends a small table to all executors, eliminating shuffle on the join.\n• Effective when one side fits in spark.sql.autoBroadcastJoinThreshold (default 10 MB, tune cautiously to 50–100 MB).\n• Risk: broadcasting large table causes driver/executor OOM.\n• Hint: SELECT /*+ BROADCAST(dim) */ * FROM fact JOIN dim ON ...\n• DataFrame API: join(broadcast(dim), "key").\n• AQE may auto-broadcast if runtime stats confirm small size even without hint.\n\nIf broadcast inappropriate, ensure ANALYZE TABLE stats are current for cost-based decision.',
        cmd: 'spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "50m")\n\nspark.sql("""\n  SELECT /*+ BROADCAST(c) */ o.order_id, c.name\n  FROM orders o JOIN customers c ON o.customer_id = c.customer_id\n""")',
      },
      {
        q: 'What causes data skew in Spark and what is a simple mitigation?',
        a: 'Skew occurs when one partition holds disproportionate data—often a hot key like NULL, default ID, or blockbuster product.\n• Symptom: one task in stage runs 10–100× longer than others in Spark UI.\n• Cause: hash partitioning sends all same-key records to one partition.\n• Simple fix: filter skewed key separately and union results; salt key with random suffix for join then aggregate.\n• AQE skew join handles moderate skew automatically when enabled.\n• Prevention: avoid grouping on ultra-high-cardinality columns without sampling analysis.\n\nIdentify skew keys with approximate count by key before production deploy.',
        cmd: 'spark.sql("SELECT customer_id, count(*) c FROM orders GROUP BY customer_id ORDER BY c DESC LIMIT 10").show()\n\n# Salt join pattern\nfrom pyspark.sql.functions import concat, lit, floor, rand\nsalted = df.withColumn("salt_key", concat(col("key"), lit("_"), floor(rand()*10)))',
      },
      {
        q: 'Why should you avoid SELECT * in production Spark SQL queries?',
        a: 'SELECT * prevents optimizer from pruning unused columns, increasing I/O and memory.\n• Columnar formats (Parquet/Delta) read only projected columns—SELECT * reads every column.\n• Wide tables with nested structs amplify scan cost unnecessarily.\n• Schema evolution adds columns over time—SELECT * behavior changes silently breaking downstream.\n• Explicit column lists document contract and enable safer refactors.\n\nException: exploratory notebooks on small samples—never in scheduled production jobs.',
        cmd: '# Bad\nspark.sql("SELECT * FROM prod.silver.events WHERE event_date = \'2024-06-01\'")\n\n# Good\nspark.sql("""\n  SELECT event_id, user_id, event_type, event_ts\n  FROM prod.silver.events WHERE event_date = \'2024-06-01\'\n""")',
      },
    ],
    medium: [
      {
        q: 'How do you use Spark UI and query profiles to diagnose slow SQL queries?',
        a: 'Performance diagnosis combines Spark UI stage metrics with Databricks query profile for SQL warehouses.\n• Spark UI Jobs/Stages: identify longest stage; check task duration distribution for skew.\n• SQL tab: compare logical vs physical plan; look for BroadcastHashJoin vs SortMergeHashJoin.\n• Metrics: shuffle read/write bytes, spill (memory/disk), GC time per executor.\n• Query profile (SQL warehouse): scan size, partition pruning effectiveness, Photon usage.\n• Compare EXPLAIN before/after optimization to confirm plan change.\n\nCapture baseline profile before releases; alert on scan bytes regression > 20%.',
        cmd: 'spark.sql("EXPLAIN COST SELECT region, sum(amount) FROM prod.sales GROUP BY region").show(truncate=False)\n\n# Driver log for query profile link\n# Cluster → Driver logs → search "Query Profile"',
      },
      {
        q: 'Explain file sizing best practices for Delta/Parquet tables and how to fix small files.',
        a: 'Optimal file size balances parallelism (not too few huge files) with metadata overhead (not too many tiny files).\n• Target 128 MB–1 GB per file for analytics scans.\n• Small file causes: streaming micro-batches, per-file ingest without compaction, over-partitioning.\n• Fixes: OPTIMIZE command, auto compaction table properties, repartition before bulk write, Autoloader with aggregated batches.\n• Monitor numFiles in DESCRIBE DETAIL; ratio numFiles/partitions > 100 warrants action.\n• Z-ORDER after compaction for filter performance.\n\nSchedule OPTIMIZE during off-peak; large tables use WHERE partition filter on OPTIMIZE.',
        cmd: 'spark.sql("OPTIMIZE prod.silver.events WHERE event_date >= current_date() - INTERVAL 7 DAYS")\n\nspark.sql("ALTER TABLE prod.silver.events SET TBLPROPERTIES (\'delta.autoOptimize.autoCompact\'=\'true\')")',
      },
      {
        q: 'How does Photon acceleration work and when should you enable it?',
        a: 'Photon is Databricks\' native vectorized execution engine replacing JVM row processing for SQL/DataFrame operations.\n• Compiles query fragments to optimized native code; significant speedup on scan-heavy aggregations and joins.\n• Enabled on job clusters (select Photon runtime) and SQL warehouses (Photon enabled by default on many tiers).\n• Not all operations supported—some UDFs and exotic expressions fall back to Spark engine.\n• Validate with A/B benchmark on representative queries before mandating platform-wide.\n• Cost: Photon DBU rate differs—faster queries may still reduce total DBU if runtime drops enough.\n\nCheck query profile for "Photon" indicator; if absent on large scan, investigate unsupported operators.',
        cmd: '# Job cluster with Photon\n"runtime_engine": "PHOTON",\n"spark_version": "14.3.x-scala2.12"\n\n# SQL warehouse\ndatabricks sql warehouses edit --id <id> --enable-photon true',
      },
      {
        q: 'What Spark configurations do you tune for memory-heavy shuffle operations?',
        a: 'Shuffle-heavy joins and aggregations need balanced executor memory and partition count.\n• spark.sql.shuffle.partitions: start with 2–4× total cores; adjust via AQE coalesce.\n• spark.executor.memory + overhead: 10–20% overhead for off-heap/network; increase if OOM or spill.\n• Reduce spark.executor.cores to 4 on memory-bound jobs—too many concurrent tasks per executor cause spill.\n• spark.memory.fraction and spark.sql.adaptive.advisoryPartitionSizeInBytes guide partition sizing.\n• spark.serializer=Kryo for RDD legacy paths; less relevant for pure SQL.\n\nMeasure spill metrics; any disk spill on shuffle means memory undersized or too many partitions per executor.',
        cmd: 'spark.conf.set("spark.sql.shuffle.partitions", "400")\nspark.conf.set("spark.executor.memory", "16g")\nspark.conf.set("spark.executor.memoryOverhead", "4g")\nspark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128MB")',
      },
    ],
    hard: [
      {
        q: 'Design a Spark performance testing framework before promoting query changes to production.',
        a: 'Regression prevention requires automated benchmarks on representative data volumes.\n• Golden queries: 20–50 production queries with expected plan characteristics and max runtime SLA.\n• Test environment: staging cluster with prod-like data sample or anonymized full volume subset.\n• Metrics captured: wall time, bytes scanned, shuffle bytes, spill, Photon on/off delta.\n• CI gate: PR fails if p95 runtime increases >15% or scan bytes doubles.\n• Store results history in Delta for trend analysis.\n• Include data skew scenarios and peak partition dates in test suite.\n\nPresent framework as platform service—teams submit query SQL + SLA; nightly benchmark job validates.',
        cmd: 'import time\nstart = time.time()\nspark.sql(query_sql).count()\nduration = time.time() - start\n\nspark.createDataFrame([(query_id, duration, bytes_scanned)], ["query_id","duration_sec","bytes"]) \\\n  .write.mode("append").saveAsTable("prod.meta.query_benchmarks")',
      },
      {
        q: 'How would you optimize a 3-hour nightly job to meet a 45-minute SLA without doubling cost?',
        a: 'SLA compression requires eliminating waste before scaling hardware.\n• Profile: 80% runtime often in 1–2 stages—skewed join or full table scan without partition filter.\n• Quick wins: partition pruning, broadcast small dims, drop unnecessary shuffle via pre-aggregation, fix UDF hot paths.\n• Incremental processing: MERGE today\'s partition only vs full overwrite.\n• OPTIMIZE + Z-ORDER on join keys if scan-bound.\n• Moderate autoscale increase only after plan optimized—2× workers on bad plan still slow.\n• Parallelize independent domain splits as Workflow tasks.\n\nDocument runtime budget per stage post-optimization; target 40 min compute + 5 min buffer.',
        cmd: 'spark.sql("EXPLAIN EXTENDED INSERT INTO prod.gold.summary SELECT ...").show(truncate=False)\n\n# Incremental replace\nspark.sql("DELETE FROM prod.gold.summary WHERE run_date = current_date()")\nspark.sql("INSERT INTO prod.gold.summary SELECT ... WHERE event_date = current_date()")',
      },
      {
        q: 'Lead review of a team using 50+ cached DataFrames causing cluster memory exhaustion.',
        a: 'Cache misuse is a common platform anti-pattern with cluster-wide impact.\n• Problem: persist() on large DataFrames never unpersisted; storage tab shows 90%+ memory used across executors.\n• Impact: shuffle spill, GC pauses, OOM kills, slower unrelated jobs on shared all-purpose cluster.\n• Audit: Spark UI Storage tab lists cached RDDs/DataFrames; identify notebook users and ages.\n• Policy: cache only after expensive shuffle reused ≥2 times; unpersist in finally block; prefer writing intermediate Delta instead of cache.\n• Platform: cluster policy limiting spark.memory.storageFraction; education sessions.\n\nIncident action: cluster restart clears cache; implement shared staging Delta tables for reused intermediates.',
        cmd: 'spark.catalog.clearCache()\n\ndf.persist(StorageLevel.MEMORY_AND_DISK)\ntry:\n    process(df)\nfinally:\n    df.unpersist()',
      },
      {
        q: 'Explain advanced join optimization: bucket join, sort-merge vs shuffle hash, and runtime filters.',
        a: 'Join strategy selection dominates performance on large fact-dimension workloads.\n• Bucket join: both tables bucketed on join key with same bucket count—avoid shuffle entirely.\n• Sort-merge join: default for large-large joins; both sides sorted on join key; expensive shuffle.\n• Shuffle hash join: one side fits in memory per partition after shuffle; rare at scale.\n• Runtime filters (dynamic partition pruning): star schema filter on dimension propagates to fact scan.\n• Delta liquid clustering approximates bucket benefits without rigid bucket count maintenance.\n\nBenchmark join strategies with EXPLAIN; bucket join requires planning at table creation time.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.fact_sales CLUSTER BY (product_id) AS SELECT * FROM staging.fact\n""")\n\nspark.sql("""\n  SELECT /*+ REPARTITION(200) */ *\n  FROM fact f JOIN dim d ON f.product_id = d.product_id\n  WHERE d.category = \'Electronics\'\n""")',
      },
    ],
  },

  'cluster-management': {
    easy: [
      {
        q: 'What is the difference between all-purpose and job clusters in Databricks?',
        a: 'Cluster types serve different workload patterns and billing models.\n• All-purpose: interactive development, multiple users attach notebooks, manual or autotermination after idle.\n• Job clusters: created for single Workflow run, terminate when tasks complete—lower cost for batch.\n• Job clusters cannot be manually attached to notebooks.\n• Same node types and DBR versions available to both.\n• Production batch should use job clusters; dev exploration uses all-purpose with autotermination.\n\nCost reports often show all-purpose clusters as top spend—migrate scheduled workloads to jobs.',
        cmd: '# All-purpose\ndatabricks clusters create --json \'{"cluster_name":"dev","spark_version":"14.3.x-scala2.12","node_type_id":"i3.xlarge","autotermination_minutes":30,"num_workers":2}\'\n\n# Job cluster defined inside Workflow JSON under job_clusters[]',
      },
      {
        q: 'Explain autoscaling on Databricks clusters and how min/max workers work.',
        a: 'Autoscaling dynamically adjusts worker count based on Spark task backlog.\n• Set min_workers and max_workers; cluster scales up when tasks queue, scales down when idle.\n• Job clusters benefit from autoscale for variable daily data volumes.\n• Scale-up is not instant—allow headroom in SLA for cold scale events.\n• max_workers caps cost; min_workers > 0 keeps baseline capacity (reduces scale latency but costs when idle).\n• Autoscaling differs from cluster pool pre-warming which reduces startup time.\n\nMonitor cluster events log for scale decisions and spot instance loss causing shrink.',
        cmd: 'databricks clusters create --json \'{\n  "cluster_name": "etl-autoscale",\n  "autoscale": {"min_workers": 2, "max_workers": 16},\n  "spark_version": "14.3.x-scala2.12",\n  "node_type_id": "i3.2xlarge"\n}\'',
      },
      {
        q: 'What are cluster pools and why use them for job workloads?',
        a: 'Pools maintain idle instances ready for fast cluster acquisition.\n• Reduce job start latency from minutes to seconds by pre-warming VMs.\n• Configure min_idle_instances for peak window pre-warm; max_capacity limits pool size cost.\n• Job clusters reference pool_id instead of specifying node type directly in some configs.\n• Tradeoff: idle pool instances incur cost even without active jobs.\n• Best for SLA-sensitive hourly jobs where startup delay exceeds compute time.\n\nSize pools from historical job start time P95 and concurrent job peak analysis.',
        cmd: 'databricks instance-pools create --json \'{\n  "instance_pool_name": "etl-pool",\n  "node_type_id": "i3.2xlarge",\n  "min_idle_instances": 2,\n  "max_capacity": 20,\n  "idle_instance_autotermination_minutes": 30\n}\'',
      },
      {
        q: 'How do you choose a node type for Spark workloads on AWS?',
        a: 'Node selection balances CPU, memory, local SSD, and network for workload profile.\n• General ETL: i3/i4i instances with NVMe SSD for shuffle spill performance.\n• Memory-heavy joins: r5/r6i family with higher memory per vCPU.\n• Storage-optimized scan workloads: i3.2xlarge or i3.4xlarge common starting points.\n• Graviton (m6g/r6g): lower cost if libraries support ARM; validate UDF compatibility.\n• Driver node: often same as workers; increase driver memory for heavy broadcast or collect misuse.\n\nBenchmark representative job on two node types before standardizing platform policy.',
        cmd: '# Compare node types\ndatabricks clusters list-node-types | jq \'.node_types[] | select(.node_type_id | startswith("i3")) | {node_type_id, memory_mb, num_cores}\'\n\n# Set driver vs worker\n{"driver_node_type_id": "i3.2xlarge", "node_type_id": "i3.xlarge", "num_workers": 8}',
      },
    ],
    medium: [
      {
        q: 'How do you configure init scripts and cluster-scoped libraries safely?',
        a: 'Init scripts run on every node at cluster start; misconfiguration breaks all workloads.\n• Types: global (account), cluster-scoped, and policy-scoped—prefer cluster-scoped for isolation.\n• Store scripts on Unity Catalog volumes, not ephemeral DBFS paths.\n• Use set -e in bash; log to known path for debugging.\n• Libraries: cluster-installed vs notebook-scoped; prod jobs pin library versions via requirements.txt or Maven coordinates.\n• Init script use cases: install agents, mount external FS, configure certs—not heavy data processing.\n\nTest init scripts on job cluster profile in staging before attaching to shared all-purpose clusters.',
        cmd: 'databricks clusters edit --json \'{\n  "cluster_id": "<id>",\n  "init_scripts": [{"volumes": {"destination": "/Volumes/prod/libs/init/install_monitoring.sh"}}],\n  "spark_env_vars": {"ENV": "prod"}\n}\'\n\ndatabricks libraries install --cluster-id <id> --pypi \'{"package":"great-expectations==0.18.12"}\'',
      },
      {
        q: 'Troubleshoot a cluster stuck in pending or terminating state.',
        a: 'Cluster lifecycle issues usually trace to cloud quota, networking, or instance availability.\n• Pending: insufficient instance quota in AWS account/AZ; spot capacity unavailable; VPC/subnet misconfiguration.\n• Terminating stuck: zombie cluster state—force terminate via API; check cloud console for orphaned instances.\n• Review cluster event log: REQUEST_FAILED, INSTANCE_UNREACHABLE, SPOT_INSTANCE_LOSS.\n• Pool exhaustion: jobs queue waiting for pool capacity—increase max_capacity or reduce concurrency.\n• Escalate to cloud admin for quota increase if recurring.\n\nDocument regional AZ fallback strategy if primary AZ lacks instance capacity during peaks.',
        cmd: 'databricks clusters events --cluster-id <id>\n\naws ec2 describe-instances --filters "Name=tag:Vendor,Values=Databricks"\n\ndatabricks clusters delete --cluster-id <id>  # force if terminating stuck',
      },
      {
        q: 'How do cluster policies enforce governance and cost controls?',
        a: 'Cluster policies are JSON rules limiting configurable fields for non-admin users.\n• Restrict node_type_id to approved list, max_workers ceiling, autotermination required, spot only for dev.\n• Deny custom spark_conf keys that disable security features.\n• Assign policy to groups; admins exempt for break-glass.\n• Policy violations return clear error at cluster create—self-service without ticket for standard configs.\n• Review policy quarterly against new instance types and FinOps targets.\n\nCombine policies with tags mandatory via policy fixed_values for cost allocation.',
        cmd: '# Policy snippet\n{\n  "node_type_id": {"type": "allowlist", "values": ["i3.xlarge","i3.2xlarge","r5.2xlarge"]},\n  "autotermination_minutes": {"type": "fixed", "value": 30},\n  "autoscale.max_workers": {"type": "range", "maxValue": 16}\n}\n\ndatabricks cluster-policies create --json @policy.json',
      },
      {
        q: 'Explain spot instances with fallback on Databricks and operational tradeoffs.',
        a: 'Spot (AWS) or preemptible VMs reduce batch cost 60–80% with interruption risk.\n• SPOT_WITH_FALLBACK: try spot first, fall back to on-demand if unavailable.\n• Spot loss mid-job: Spark retries failed tasks; streaming may need checkpoint recovery.\n• Not recommended for latency-critical or stateful streaming without careful checkpoint design.\n• Mix: on-demand driver + spot workers for stability.\n• Monitor spot loss rate in cluster events; high loss erases savings from retries.\n\nFinOps policy: allow spot for dev/staging and non-critical batch; require on-demand for revenue-critical SLAs.',
        cmd: 'databricks clusters create --json \'{\n  "aws_attributes": {\n    "availability": "SPOT_WITH_FALLBACK",\n    "spot_bid_price_percent": 100,\n    "first_on_demand": 1\n  },\n  "node_type_id": "i3.2xlarge",\n  "autoscale": {"min_workers": 4, "max_workers": 20}\n}\'',
      },
    ],
    hard: [
      {
        q: 'Design cluster sizing strategy for mixed interactive and batch workloads sharing an account.',
        a: 'Shared accounts need isolation mechanisms preventing batch from starving interactive users.\n• Separate workspaces or resource quotas: batch workspace with aggressive spot; analytics workspace with guaranteed pools.\n• Job scheduling: batch heavy jobs off-peak; concurrency limits on Workflow level.\n• Instance pool reservation for interactive SLA; batch uses overflow pool.\n• Unity Catalog and network shared; compute billing tagged by workspace.\n• Autoscaling max caps per policy tier: analyst max 8 workers, ETL max 64.\n\nPresent capacity model: peak concurrent vCPUs, monthly DBU budget, headroom for month-end batch surge.',
        cmd: 'databricks jobs create --json \'{"max_concurrent_runs": 5, "name": "batch-etl", ...}\'\n\n# Workspace-level usage export via account console billing API',
      },
      {
        q: 'How would you lead migration from fixed-size clusters to autoscaling for 200 production jobs?',
        a: 'Migration at scale requires measurement, phased rollout, and rollback pins.\n• Baseline: export 30-day job duration and peak executor utilization from Spark metrics.\n• Categorize jobs: CPU-bound (scale workers), memory-bound (bigger nodes not more workers), skew-bound (fix plan first).\n• Pilot: 10 representative jobs with autoscale min=previous fixed/2, max=previous fixed*2.\n• Validate: duration within SLA, cost delta acceptable, no increase in failure rate.\n• Rollout via Asset Bundles template updating job cluster configs; canary 20 jobs/week.\n• Rollback: keep previous cluster JSON in git tag for one-click revert.\n\nSuccess metric: 15% DBU reduction with ≤5% duration increase p95.',
        cmd: '# Bundle cluster template\nresources:\n  jobs:\n    etl_job:\n      job_clusters:\n        - job_cluster_key: main\n          new_cluster:\n            autoscale: {min_workers: 2, max_workers: 12}',
      },
      {
        q: 'Architect multi-cluster connectivity for private link deployments with no public internet on workers.',
        a: 'Private link architectures require deliberate egress paths for package installs and external APIs.\n• VNet-injected / customer-managed VPC: workers in private subnets; NAT gateway or firewall for controlled egress.\n• Unity Catalog and storage via private endpoints (S3 gateway endpoint, ADLS private endpoint).\n• Init scripts and libraries from internal Artifactory on private network—not PyPI direct.\n• DNS: private DNS zones resolving Databricks control plane and storage endpoints.\n• Security review: no 0.0.0.0/0 except via inspected egress appliance.\n\nTest job end-to-end in isolated staging VPC before prod cutover; validate package install and JDBC to on-prem via VPN.',
        cmd: 'databricks clusters create --json \'{\n  "spark_conf": {\n    "spark.databricks.pyspark.enableProcessIsolation": "true"\n  },\n  "aws_attributes": {\n    "zone_id": "auto",\n    "ebs_volume_count": 0\n  },\n  "custom_tags": {"network": "private-link"}\n}\'',
      },
      {
        q: 'Lead incident when spot instance loss caused cascading failures across 40 concurrent jobs.',
        a: 'Mass spot loss is infrastructure Sev-1 with widespread job retry storms.\n• Detect: cluster events SPOT_INSTANCE_LOSS spike; job failure rate alert; duration SLA breach.\n• Mitigate: switch job policy to ON_DEMAND temporarily via policy override; reduce max_concurrent_runs to lower retry pressure.\n• Stabilize: drain and recreate affected clusters; prioritize revenue-critical job queue.\n• Root cause: AWS spot capacity crunch in single AZ; all jobs used same instance type/pool.\n• Prevent: diversify instance types in pool fallback list; multi-AZ; first_on_demand ≥ 1; critical jobs on-demand only.\n\nPostmortem: cost vs reliability policy update; spot allowed only below tier-2 SLA jobs.',
        cmd: 'databricks clusters edit --json \'{"cluster_id":"<id>","aws_attributes":{"availability":"ON_DEMAND"}}\'\n\n# Replay failed runs\ndatabricks jobs runs list --job-id <id> --active-only false | jq \'.runs[] | select(.state.result_state=="FAILED")\'',
      },
    ],
  },

  'security': {
    easy: [
      {
        q: 'How does Databricks authenticate users and integrate with enterprise identity providers?',
        a: 'Databricks supports SSO and automated user provisioning for enterprise security.\n• SAML/OIDC SSO with Okta, Azure AD, Google Workspace—no local passwords in prod.\n• SCIM provisioning syncs users and groups from IdP to workspace automatically.\n• Account console manages users across workspaces; workspace admin manages local settings.\n• MFA enforced at IdP level; conditional access policies apply before Databricks session.\n• Service principals for automation separate from human identities.\n\nDisable local account creation in prod workspaces; audit quarterly for stale accounts.',
        cmd: '# SCIM provisioning via IdP admin console\n# Databricks account → Settings → Identity → SSO configuration\n\n# List workspace users\ndatabricks users list',
      },
      {
        q: 'What are Databricks secret scopes and how do you reference secrets in notebooks?',
        a: 'Secret scopes store credentials outside source code, backed by Azure Key Vault, AWS Secrets Manager, or Databricks-backed scope.\n• Create scope: databricks secrets create-scope --scope prod-api --scope-backend-type AZURE_KEYVAULT.\n• Store secret: databricks secrets put --scope prod-api --key db-password.\n• Reference: dbutils.secrets.get(scope="prod-api", key="db-password")—value redacted in notebook output.\n• Never print or log secret values.\n• ACL on scopes limits which users/groups read which secrets.\n\nRotate secrets in vault; Databricks reads latest on next get() call without redeploy.',
        cmd: 'dbutils.secrets.get(scope="prod-crm", key="api_token")\n\ndatabricks secrets create-scope --scope prod-crm --scope-backend-type AWS_SECRETS_MANAGER \\\n  --resource-id arn:aws:secretsmanager:us-east-1:123456789012:secret:databricks/',
      },
      {
        q: 'Explain network security options for isolating Databricks clusters from the public internet.',
        a: 'Network isolation prevents data exfiltration and meets enterprise security requirements.\n• Classic: secure cluster connectivity, optional no-public-IP workers with NAT for egress.\n• Customer-managed VPC/VNet injection: deploy workers in your subnets with firewall rules.\n• Private Link / PrivateLink: traffic between users and control plane over private backbone.\n• IP access lists restrict workspace login to corporate VPN CIDR ranges.\n• Storage firewalls allow only Databricks access to data buckets via VPC endpoint or service principal.\n\nSecurity architecture review should map every egress path and data flow diagram.',
        cmd: '# Workspace IP access list\ndatabricks ip-access-lists create --json \'{\n  "label": "corp-vpn",\n  "list_type": "ALLOW",\n  "ip_addresses": ["203.0.113.0/24"]\n}\'',
      },
      {
        q: 'What is credential passthrough and when is it used for accessing cloud storage?',
        a: 'Credential passthrough (table ACL / single-user clusters legacy pattern) accesses storage as the end user identity.\n• User\'s cloud IAM role assumed for S3/ADLS reads—audit trail shows individual user not shared cluster role.\n• Unity Catalog external locations largely supersede legacy passthrough with centralized storage credentials.\n• UC model: storage credential + external location + GRANT controls access without per-user IAM mapping complexity.\n• Compliance benefit: UC audit logs tie data access to identity.\n\nNew deployments should use Unity Catalog external locations rather than legacy mount + passthrough.',
        cmd: 'spark.sql("""\n  CREATE STORAGE CREDENTIAL user_data_cred\n  WITH IAM ROLE \'arn:aws:iam::123456789012:role/databricks-uc-prod\'\n""")\n\nspark.sql("SELECT * FROM prod.sensitive.table LIMIT 1")  # audited via UC',
      },
    ],
    medium: [
      {
        q: 'How do you implement encryption at rest and in transit for Databricks workloads?',
        a: 'Encryption protects data across storage, network, and notebook artifacts.\n• At rest: cloud storage SSE-S3/SSE-KMS on Delta files; DBFS root encrypted by cloud provider; customer-managed keys (CMK) for compliance.\n• In transit: TLS for all control plane and data plane traffic; JDBC/ODBC connections require SSL.\n• Secrets never stored plaintext in notebooks—secret scopes only.\n• CMK rotation procedures documented with cloud KMS team.\n• Unity Catalog managed storage inherits account encryption settings.\n\nValidate CMK policy allows Databricks service principal decrypt on storage credential role.',
        cmd: '# S3 bucket policy requiring KMS\naws s3api put-bucket-encryption --bucket company-datalake \\\n  --server-side-encryption-configuration \'{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"arn:aws:kms:..."}}]}\'',
      },
      {
        q: 'How do you audit data access and administrative actions in Databricks?',
        a: 'Auditability requires enabling logs and integrating with SIEM.\n• Account audit logs: authentication, cluster create, job run, UC grant changes—deliver to S3/Splunk/Datadog.\n• UC audit events: SELECT, GRANT, CREATE TABLE with user identity and resource name.\n• CloudTrail/AWS logs for underlying storage access via storage credential role.\n• Lineage supplements audit with data flow context.\n• Retention: align with compliance (often 1–7 years in cold storage).\n\nRun quarterly access reviews comparing UC grants to HR system active employees.',
        cmd: '# Configure audit log delivery (account console)\n# Or API:\ncurl -X POST "$ACCOUNT_HOST/api/2.0/accounts/$ACCOUNT_ID/audit-logs/delivery-configs" \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"delivery_path":"s3://audit-logs/databricks/", "status": "ENABLED"}\'',
      },
      {
        q: 'Explain column-level security with dynamic views and column masks in Unity Catalog.',
        a: 'Fine-grained security restricts sensitive columns without duplicating tables.\n• Column mask: ALTER TABLE SET COLUMN MASK on email, SSN—hash or null for unauthorized roles.\n• Row filter: restrict rows by region or tenant for multi-tenant data.\n• Dynamic views: CREATE VIEW with CASE expressions checking IS_MEMBER() or CURRENT_USER().\n• Masks compose with GRANT SELECT—user sees masked value even with table SELECT.\n• Performance: masks apply at scan time; complex UDF masks may slow queries.\n\nDocument mask functions in security schema owned by InfoSec team, not domain engineers.',
        cmd: 'spark.sql("""\n  CREATE FUNCTION prod.security.mask_email(email STRING)\n  RETURN CASE WHEN is_member(\'pii-readers\') THEN email ELSE sha2(email, 256) END\n""")\n\nspark.sql("ALTER TABLE prod.customers ALTER COLUMN email SET MASK prod.security.mask_email")',
      },
      {
        q: 'Troubleshoot unauthorized access concerns when a notebook output exposes sensitive data.',
        a: 'Data exposure in notebook outputs requires immediate containment and process review.\n• Contain: revoke notebook access; clear revision history if credentials displayed; rotate exposed secrets.\n• Assess: who viewed notebook; was output shared externally; audit dbutils secrets misuse.\n• Technical fixes: remove display() on sensitive columns; use .limit() in exploration; enable result download restrictions.\n• Policy: prohibit SELECT * on PII tables in shared notebooks; use SQL warehouse with row filters for analysts.\n• Training: secrets redaction behavior, no copy-paste credentials into cells.\n\nEnable workspace setting to hide values matching secret patterns in future outputs.',
        cmd: '# Redact before display\nfrom pyspark.sql.functions import sha2\ndf.select("customer_id", sha2("email", 256).alias("email_hash")).display()\n\nspark.sql("REVOKE READ FILES ON VOLUME prod.raw.pii FROM `contractors`")',
      },
    ],
    hard: [
      {
        q: 'Design a zero-trust security model for Databricks across multiple business units.',
        a: 'Zero-trust assumes breach; every access request is authenticated, authorized, and logged.\n• Identity: SSO + SCIM only; no long-lived PATs for humans; short-lived OAuth tokens.\n• Network: private link, no public IPs, egress through firewall with domain allowlist.\n• Data: UC grants default deny; ABAC tags (data_class=restricted) drive automatic policies.\n• Compute: cluster policies enforce encryption, instance types, max lifetime.\n• Detection: SIEM rules on anomalous SELECT volume, grant changes, failed auth spikes.\n• Segmentation: prod catalog isolated; cross-BU sharing via Delta Sharing with recipient audit.\n\nMap controls to NIST CSF or ISO 27001 for auditor presentation.',
        cmd: 'spark.sql("ALTER CATALOG prod SET TAGS (\'data_class\'=\'restricted\', \'bu\'=\'finance\')")\n\n# ABAC policy (account-level feature)\n# Deny SELECT where tag data_class=restricted unless group in pii-readers',
      },
      {
        q: 'How would you respond to a suspected credential leak of a Databricks personal access token?',
        a: 'Token leak is credential incident requiring immediate revocation and blast radius analysis.\n• Revoke: delete PAT via user settings or admin API immediately.\n• Audit: pull audit logs for token owner API calls during exposure window—jobs created, data exported, ACL changes.\n• Rotate: dependent integrations to service principal with OAuth; update secret scopes if secondary exposure.\n• Assess: was token in git history public repo—scan and purge commit; notify security if external exposure.\n• Prevent: org policy block PAT creation; enforce OAuth-only automation; secret scanning in CI.\n\nDocument incident timeline for compliance; user re-education on token storage in env vars not code.',
        cmd: 'databricks tokens delete --token-id <id>\n\n# List recent API activity\ncurl "$DATABRICKS_HOST/api/2.0/audit-logs" -H "Authorization: Bearer $ADMIN_TOKEN" \\\n  -d \'{"filter_by":{"user_name":"user@company.com","start_time":1718000000000}}\'',
      },
      {
        q: 'Lead architecture for HIPAA-compliant analytics on Databricks with BAA requirements.',
        a: 'HIPAA on Databricks requires administrative, physical, and technical safeguards beyond default config.\n• BAA signed with Databricks and cloud provider; use HIPAA-eligible services only.\n• PHI in dedicated workspace + catalog; encryption CMK; no PHI in logs or cluster tags.\n• Access: minimum necessary RBAC; break-glass procedure documented; all access audited.\n• De-identification pipeline before non-clinical analytics; quarantine raw PHI in restricted schema.\n• BA subprocessors list maintained; no export to non-BAA tools.\n• Disaster recovery tested with encrypted backups.\n\nEngage compliance officer for control mapping; annual risk assessment and penetration test on workspace.',
        cmd: 'spark.sql("CREATE SCHEMA prod.phi RESTRICTED COMMENT \'HIPAA PHI - authorized clinical analysts only\'")\n\nspark.sql("GRANT SELECT ON SCHEMA prod.phi TO `clinical-analysts`")',
      },
      {
        q: 'Compare customer-managed keys vs platform-managed encryption for regulated workloads.',
        a: 'CMK gives customers control over key lifecycle; platform-managed simplifies operations.\n• CMK: revoke key to cryptographically deny access; audit key usage in CloudTrail; rotation coordination required.\n• Platform-managed: Databricks/cloud handles keys; fewer moving parts; less control for crypto-shredding scenarios.\n• CMK complexity: grant Databricks storage credential role kms:Decrypt; misconfiguration breaks all table reads.\n• Regulated industries often mandate CMK for PHI/PCI data at rest.\n• Performance: negligible difference for object storage SSE.\n\nDecision ADR should document key custodian, rotation SLA, and break-glass key recovery procedure.',
        cmd: 'aws kms create-grant --key-id arn:aws:kms:us-east-1:123:key/abc \\\n  --grantee-principal arn:aws:iam::123:role/databricks-uc-storage \\\n  --operations Decrypt GenerateDataKey',
      },
    ],
  },

  'workflows': {
    easy: [
      {
        q: 'What are Databricks Workflows and how do they differ from cron-scheduled notebook runs?',
        a: 'Workflows is the native orchestration service for multi-task data pipelines on Databricks.\n• Supports DAG dependencies: task B runs after task A succeeds; conditional branches and parallel tasks.\n• Multiple task types: notebook, Python script, SQL, JAR, wheel, pipeline, run job (nested).\n• Job clusters spin up per run and terminate—better cost than keeping cron cluster alive.\n• Built-in retry, timeout, alerting, and parameterization with dynamic job triggers.\n• Observability: run history, task-level logs, repair runs for failed subset.\n\nReplace legacy Jobs 1.0 and external cron hitting notebook URLs with version-controlled Workflow JSON.',
        cmd: 'databricks jobs create --json \'{\n  "name": "daily-etl",\n  "schedule": {"quartz_cron_expression": "0 0 5 * * ?", "timezone_id": "UTC"},\n  "tasks": [\n    {"task_key": "bronze", "notebook_task": {"notebook_path": "/Repos/prod/etl/bronze"}},\n    {"task_key": "silver", "depends_on": [{"task_key": "bronze"}], "notebook_task": {"notebook_path": "/Repos/prod/etl/silver"}}\n  ]\n}\'',
      },
      {
        q: 'How do you pass parameters between Workflow tasks?',
        a: 'Task values and job parameters enable dynamic data handoff between pipeline stages.\n• Job parameters: defined at job level; referenced as {{job.parameters.run_date}} in task configs.\n• Task values: upstream notebook sets dbutils.jobs.taskValues.set(key, value); downstream reads with taskValues.get.\n• Built-in: {{job.start_time.iso_date}}, {{job.run_id}} for run context.\n• SQL tasks can reference parameters in query definitions.\n• Limitation: task values size bounded—pass table names not large datasets.\n\nPattern: bronze task writes watermark to task value; silver reads watermark for incremental filter.',
        cmd: '# Upstream notebook\ndbutils.jobs.taskValues.set("max_ingest_ts", str(max_ts))\n\n# Downstream notebook\nlast_ts = dbutils.jobs.taskValues.get(taskKey="bronze", key="max_ingest_ts", default="1970-01-01")',
      },
      {
        q: 'Explain job cluster vs existing cluster attachment in Workflows.',
        a: 'Workflow tasks need compute via job cluster, existing all-purpose cluster, or serverless (where supported).\n• Job cluster (recommended): defined in job_clusters[]; shared across tasks via job_cluster_key; terminates after run.\n• Existing cluster: attach to running all-purpose cluster—risky for prod (manual lifecycle, config drift).\n• Same job_cluster_key on multiple tasks reuses one cluster within the run—faster than cold start per task.\n• Different keys spin separate clusters for isolation or different node sizes.\n\nProd standard: always job clusters with pinned DBR and autoscale policy.',
        cmd: '{\n  "job_clusters": [{"job_cluster_key": "shared_etl", "new_cluster": {"spark_version": "14.3.x-scala2.12", "node_type_id": "i3.2xlarge", "autoscale": {"min_workers": 2, "max_workers": 8}}}],\n  "tasks": [\n    {"task_key": "task_a", "job_cluster_key": "shared_etl", ...},\n    {"task_key": "task_b", "job_cluster_key": "shared_etl", "depends_on": [{"task_key": "task_a"}]}\n  ]\n}',
      },
      {
        q: 'How do you configure alerts and notifications for failed Workflow runs?',
        a: 'Timely failure notification reduces MTTR for data pipeline incidents.\n• Job email notifications: on_failure, on_success (optional), on_duration_warning_threshold_exceeded.\n• Webhook notifications to Slack/PagerDuty via incoming webhook URL in job settings.\n• Per-task retry: max_retries and min_retry_interval_millis for transient failures.\n• Run-as identity determines who receives default notifications—configure ops DL email.\n• Integrate with observability: push run results to Datadog via API from webhook receiver.\n\nAvoid alert fatigue: separate dev job notifications from prod PagerDuty escalation paths.',
        cmd: 'databricks jobs update --json \'{\n  "job_id": 12345,\n  "email_notifications": {\n    "on_failure": ["data-platform-oncall@company.com"],\n    "no_alert_for_skipped_runs": true\n  },\n  "webhook_notifications": {\n    "on_failure": [{"id": "pagerduty-webhook-id"}]\n  },\n  "max_concurrent_runs": 1\n}\'',
      },
    ],
    medium: [
      {
        q: 'How do you implement conditional branching and parallel execution in Workflows?',
        a: 'Complex DAGs require parallel fan-out and conditional paths based on outcomes.\n• Parallel: multiple tasks depending on same upstream with no inter-dependency run concurrently.\n• Conditional: if/else task (run condition task) sets outcome; downstream tasks use depends_on with outcome field.\n• For-each task: iterate array of dates/regions with concurrency limit—backfill pattern.\n• Run job task: trigger separate Workflow for modular pipeline composition.\n• Avoid diamond dependencies without clear merge task—downstream should wait for all branches via depends_on list.\n\nModel DAG in diagram tool; validate with dry-run in staging before prod schedule enable.',
        cmd: '{"tasks": [\n  {"task_key": "validate", "condition_task": {"op": "EQUAL_TO", "left": "{{job.parameters.env}}", "right": "prod"}},\n  {"task_key": "prod_load", "depends_on": [{"task_key": "validate", "outcome": "true"}]},\n  {"task_key": "dev_load", "depends_on": [{"task_key": "validate", "outcome": "false"}]}\n]}',
      },
      {
        q: 'Troubleshoot a Workflow where downstream tasks show skipped despite upstream success.',
        a: 'Skipped tasks usually indicate dependency outcome mismatch or run cancellation policy.\n• Check run page: skipped reason—dependency not met, branch condition false, max concurrent runs exceeded.\n• Condition task returned unexpected outcome string—case sensitivity matters.\n• Upstream task success but taskValues missing causes downstream parameter default silently wrong—not skip but bad data.\n• Repair run: selectively rerun failed/skipped chain from failure point without re-running succeeded tasks.\n• Examine depends_on outcome for conditional tasks vs standard SUCCESS dependency.\n\nExport run JSON via API for postmortem when UI unclear.',
        cmd: 'databricks jobs runs get --run-id <run-id>\n\ndatabricks jobs runs repair --run-id <run-id> --rerun_tasks silver,gold',
      },
      {
        q: 'How do you deploy Workflows as code using Databricks Asset Bundles?',
        a: 'Asset Bundles provide CI/CD-friendly YAML definitions for jobs, pipelines, and clusters.\n• databricks.yml defines resources (jobs, schemas) and targets (dev, prod) with variable substitution.\n• Git-integrated: bundle deploy pushes job definition to workspace matching git commit.\n• Variables: ${var.catalog} per environment; secrets referenced not embedded.\n• validate command catches schema errors pre-deploy.\n• Prod deploy requires approval gate in CI pipeline.\n\nReplace UI-created jobs with bundle-managed resources to prevent configuration drift.',
        cmd: '# databricks.yml\nbundle:\n  name: data-platform\nresources:\n  jobs:\n    daily_etl:\n      name: "[${var.env}] daily-etl"\n      tasks: [...]\ntargets:\n  prod:\n    variables:\n      env: prod\n\n# CI\ndatabricks bundle validate -t prod\ndatabricks bundle deploy -t prod',
      },
      {
        q: 'Explain run-as identity and permission requirements for production Workflow jobs.',
        a: 'Workflows execute tasks with run-as user or service principal identity—not the job creator after deployment.\n• run_as.service_principal_name recommended for prod—survives employee turnover.\n• SP needs: CAN_MANAGE_RUN on job, USE CLUSTER policy, UC grants for tables touched, READ secret scopes.\n• Common failure: job owner deploys but SP lacks SELECT on prod table—works in dev test as owner.\n• Least privilege: SP gets only schemas required for that pipeline.\n• Audit: all writes attributed to SP in UC logs—clearer than shared personal account.\n\nChecklist SP permissions validated in staging with identical run_as before prod deploy.',
        cmd: '{"run_as": {"service_principal_name": "prod-etl-sp@company.com"}}\n\n# Verify SP grants\nspark.sql("SHOW GRANTS `prod-etl-sp@company.com` ON TABLE prod.silver.orders").show()',
      },
    ],
    hard: [
      {
        q: 'Design a Workflow orchestration platform for 500 jobs with dependency management across teams.',
        a: 'At 500 jobs, central orchestration needs standards, visibility, and cross-team dependency contracts.\n• Modular jobs: domain-owned Workflows; cross-domain deps via run_job_task triggering downstream job with parameters.\n• Metadata registry: job catalog in Delta (owner, SLA, upstream/downstream, tier) synced from bundle deploy.\n• SLA monitor: Workflow queries system.lakeflow tables; alert when upstream late blocks downstream start.\n• Naming convention: {domain}_{layer}_{entity}_{frequency}.\n• Platform team owns bundle templates, SP provisioning, and dependency approval workflow.\n• Avoid mega-DAGs with 50 tasks—split for blast radius and repair granularity.\n\nQuarterly dependency graph review to remove obsolete edges causing unnecessary serial bottlenecks.',
        cmd: '{"task_key": "trigger_finance_gold", "run_job_task": {"job_id": 67890, "job_parameters": {"run_date": "{{job.parameters.run_date}}"}}}\n\nspark.sql("SELECT * FROM prod.meta.job_catalog WHERE sla_minutes < lag_minutes")',
      },
      {
        q: 'How would you recover from a Workflow metadata corruption after accidental bulk job deletion?',
        a: 'Mass job deletion is operational disaster if UI/API script targeted wrong workspace.\n• Immediate: stop automation accounts; inventory missing jobs from audit logs (delete events).\n• Restore: redeploy all bundles from git tags—source of truth is git not workspace UI.\n• Prioritize: tier-1 revenue jobs first; communicate ETA to stakeholders.\n• Data impact: missed schedules may cause stale dashboards—trigger manual run-now for catch-up with backfill parameters.\n• Prevent: restrict jobs/delete permission to CI service principal only; soft-delete pattern via disable schedule instead of delete.\n\nValidate job count post-restore matches catalog registry; run integration test suite.',
        cmd: 'git checkout tags/prod-release-2024.06.01\ndatabricks bundle deploy -t prod\n\ndatabricks jobs list | wc -l  # compare to expected count',
      },
      {
        q: 'Lead optimization of Workflow scheduling to eliminate resource contention at midnight cron peak.',
        a: 'Midnight cron stacking causes cluster quota exhaustion and SLA misses.\n• Analysis: histogram job start times from audit logs; identify 200 jobs starting 00:00 UTC.\n• Stagger: spread cron across 00:00–04:00 window using hash of job_id minute offset.\n• Prioritize: tier-1 jobs keep preferred window; tier-3 shifted to off-peak.\n• Concurrency: job-level max_concurrent_runs and account-level job queue settings.\n• Pool sizing: increase pre-warmed capacity before peak window.\n• Alternative: trigger downstream via file arrival not clock—event-driven reduces artificial peaks.\n\nTarget: no more than N concurrent cluster creates per 5-minute bucket.',
        cmd: '# Staggered cron examples\n"quartz_cron_expression": "0 17 * * ?"   # job A — 00:17 UTC\n"quartz_cron_expression": "0 43 * * ?"   # job B — 00:43 UTC\n\n# File arrival trigger\n"trigger": {"file_arrival": {"url": "s3://landing/daily/", "wait_after_last_change_seconds": 60}}',
      },
      {
        q: 'Architect disaster recovery for Workflow definitions and run history across workspace failure.',
        a: 'DR spans job definitions (git), runtime state (checkpoints), and operational metadata.\n• Job definitions: all in git bundles; deploy to DR workspace from same tag.\n• Checkpoints/storage: cross-region replication on S3/ADLS buckets.\n• Run history: export system tables to durable storage; not all history replicated by default.\n• Failover: DNS/workspace URL switch for users; update bundle target to DR workspace.\n• Playbook: disable prod schedules, enable DR schedules, validate SP credentials in DR region.\n• RTO test quarterly: deploy bundle to DR and run tier-1 job end-to-end.\n\nDocument which jobs require active-active vs active-passive based on RPO.',
        cmd: '# DR bundle target\ntargets:\n  dr:\n    workspace:\n      host: https://dbc-dr.cloud.databricks.com\n    variables:\n      catalog: prod_dr\n\ndatabricks bundle deploy -t dr',
      },
    ],
  },

  'ml-integration': {
    easy: [
      {
        q: 'What is MLflow and how is it integrated with Databricks?',
        a: 'MLflow is an open-source platform for ML lifecycle management—tracking, registry, deployment.\n• MLflow Tracking: log parameters, metrics, artifacts per experiment run in Databricks workspace.\n• Model Registry: versioned models with stage transitions (Staging, Production, Archived).\n• Unity Catalog registers models as UC assets with same governance as tables.\n• Autologging: automatic capture of sklearn, XGBoost, PyTorch metrics with minimal code.\n• Models deployed via Model Serving endpoints or batch inference jobs.\n\nEvery Databricks workspace includes managed MLflow—no separate server install required.',
        cmd: 'import mlflow\nmlflow.set_experiment("/Shared/customer_churn")\n\nwith mlflow.start_run():\n    mlflow.log_param("n_estimators", 100)\n    mlflow.log_metric("auc", 0.92)\n    mlflow.sklearn.log_model(model, "model")',
      },
      {
        q: 'How do you log and compare ML experiment runs in Databricks notebooks?',
        a: 'Experiment tracking enables reproducibility and model selection based on metrics.\n• mlflow.start_run() context manager wraps training code.\n• log_param for hyperparameters; log_metric for scalars (can log multiple steps); log_artifact for plots.\n• Compare runs in MLflow UI Experiments tab—sort by metric, overlay charts.\n• Nested runs for hyperparameter search loops.\n• Tags: mlflow.set_tag("team", "marketing") for filtering.\n\nBest practice: log training dataset version (Delta table version) for reproducibility audit.',
        cmd: 'with mlflow.start_run(run_name="rf_baseline") as run:\n    mlflow.log_param("max_depth", 10)\n    mlflow.log_metric("f1", f1_score)\n    mlflow.log_artifact("confusion_matrix.png")\n    print(f"Run ID: {run.info.run_id}")',
      },
      {
        q: 'What is the Databricks ML runtime and when should you select it for a cluster?',
        a: 'ML runtime extends DBR with popular ML frameworks preinstalled and GPU support.\n• Includes TensorFlow, PyTorch, XGBoost, scikit-learn, Hugging Face integrations on CPU/GPU nodes.\n• GPU node types (g4dn, etc.) for deep learning training; requires ML runtime variant.\n• CPU ML runtime sufficient for classical ML and feature engineering at scale on Spark.\n• Photon + ML for feature engineering SQL before single-node training on pandas.\n\nUse standard DBR for pure ETL; switch to ML runtime when training or GPU inference on cluster.',
        cmd: 'databricks clusters create --json \'{\n  "spark_version": "14.3.x-gpu-ml-scala2.12",\n  "node_type_id": "g4dn.xlarge",\n  "num_workers": 0,\n  "cluster_name": "gpu-training"\n}\'',
      },
      {
        q: 'Explain batch vs real-time model inference patterns on Databricks.',
        a: 'Inference deployment matches latency requirements and request volume.\n• Batch scoring: apply model to large Delta tables using spark_udf or pandas UDF in scheduled Workflow—minutes to hours latency.\n• Real-time serving: Model Serving endpoint with REST API—milliseconds latency for online apps.\n• Feature lookup: precompute features in gold Feature Store table; serving endpoint reads online store or computes on fly.\n• Batch cheaper for nightly churn scores; serving for fraud detection at transaction time.\n\nLog predictions to Delta for monitoring drift and audit.',
        cmd: '# Batch inference\nfrom mlflow.pyfunc import spark_udf\npredict_udf = spark_udf(model_uri="models:/churn_model/Production", result_type="double")\ndf.withColumn("churn_score", predict_udf("features")).write.saveAsTable("prod.scores.churn")\n\n# Serving endpoint\ndatabricks serving-endpoints create --json \'{"name":"churn-api","config":{"served_models":[{"model_name":"churn_model","model_version":"3"}]}}\'',
      },
    ],
    medium: [
      {
        q: 'How do you use Unity Catalog for ML model governance and lineage?',
        a: 'UC extends governance from tables to models, features, and functions.\n• Register models in catalog.schema namespace: models:/prod.ml.churn_model/Production.\n• GRANT on models controls who can transition stages or deploy endpoints.\n• Lineage links training data tables to model versions—impact analysis when feature table schema changes.\n• Model aliases (Production, Champion) replace legacy stage transitions in newer APIs.\n• Audit model access and version changes via UC audit logs.\n\nAlign model naming with domain schemas; avoid orphan models in personal catalog paths.',
        cmd: 'mlflow.register_model("runs:/abc123/model", "prod.ml.churn_model")\n\nspark.sql("GRANT EXECUTE ON MODEL prod.ml.churn_model TO `ml-serving-sp`")\n\nmlflow.set_registered_model_alias("prod.ml.churn_model", "Production", version=5)',
      },
      {
        q: 'Describe Feature Store workflow for training and serving consistency.',
        a: 'Feature Store ensures training-serving skew elimination via centralized feature definitions.\n• Define feature table in UC with primary keys and timestamp for point-in-time correctness.\n• Offline store: Delta table for batch training with historical feature snapshots.\n• Online store: low-latency lookup for serving endpoints (Databricks Feature Serving or external Redis).\n• Training: FeatureStoreClient.create_training_set with point-in-time join against labels.\n• Publishing: write features once; consumers reuse instead of duplicating feature logic.\n\nCritical: point-in-time join prevents label leakage from future data in training sets.',
        cmd: 'from databricks.feature_store import FeatureStoreClient\nfs = FeatureStoreClient()\n\nfs.create_table(name="prod.features.customer_metrics", primary_keys=["customer_id"], schema=schema)\n\ntraining_set = fs.create_training_set("prod.ml.churn_labels", feature_lookups=[FeatureLookup("prod.features.customer_metrics")], label="churned")',
      },
      {
        q: 'How do you monitor production ML models for drift and performance degradation?',
        a: 'Model monitoring closes the loop between deployment and retraining triggers.\n• Lakehouse Monitoring (or custom): track prediction distribution vs training baseline.\n• Log inference requests and outcomes to Delta table; compare weekly AUC on labeled subset.\n• Data drift: PSI or KS test on feature columns; alert when threshold exceeded.\n• Concept drift: performance metric drop on holdout labels arriving delayed.\n• Automated retraining Workflow triggered when drift alert fires; champion/challenger comparison before promotion.\n\nDashboard: prediction volume, latency p99, error rate, drift score trend.',
        cmd: 'predictions.write.format("delta").mode("append").saveAsTable("prod.monitoring.churn_predictions")\n\nspark.sql("""\n  SELECT date, avg(churn_score) avg_score, stddev(churn_score) std_score\n  FROM prod.monitoring.churn_predictions\n  WHERE date >= current_date() - 30\n  GROUP BY date ORDER BY date\n""").show()',
      },
      {
        q: 'Troubleshoot MLflow model loading failures in a production batch scoring job.',
        a: 'Model load failures block entire scoring pipeline—diagnose environment and artifact issues.\n• Error "model not found": wrong registry path or UC permission on model for run-as SP.\n• Flavor mismatch: pyfunc model requires same library versions as training—log pip requirements in MLflow.\n• Artifact corruption: incomplete model upload; re-log model from known good run.\n• Spark UDF: model too large for broadcast—use pandas UDF or partition batch scoring.\n• CUDA/GPU model loaded on CPU cluster—use CPU-compatible artifact or ML runtime GPU.\n\nPin mlflow and sklearn versions in cluster libraries matching training environment exactly.',
        cmd: 'model = mlflow.pyfunc.load_model("models:/prod.ml.churn_model/Production")\nmodel.predict(test_df[:5])\n\n# Check run environment\nmlflow.get_run(run_id).data.tags.get("pip_requirements")',
      },
    ],
    hard: [
      {
        q: 'Design an end-to-end MLOps platform on Databricks for a team shipping 20 models per quarter.',
        a: 'MLOps at scale requires standardized templates, automated gates, and shared infrastructure.\n• Repo template: train.py, evaluate.py, bundle job, Feature Store definitions, monitoring notebook.\n• CI: unit tests, data validation, train on sample, register if metric > baseline.\n• CD: staging endpoint shadow traffic; prod promotion requires approval + drift check pass.\n• Shared Feature Store catalog; model registry per domain schema.\n• GPU pool for training queue; serving endpoints auto-scale per endpoint SLA.\n• Model cards document intended use, limitations, and training data snapshot.\n\nPlatform KPI: time from experiment to prod endpoint, retraining frequency, incident count per model.',
        cmd: '# Bundle ML pipeline\nresources:\n  jobs:\n    train_churn:\n      tasks:\n        - task_key: train\n          python_wheel_task: {package_name: "ml_platform", entry_point: "train"}\n        - task_key: register\n          depends_on: [{task_key: train}]\n          python_wheel_task: {entry_point: "register_if_pass"}\n  model_serving_endpoints:\n    churn_api: {...}',
      },
      {
        q: 'How would you handle model promotion blocked by governance requiring explainability and bias testing?',
        a: 'Regulated ML requires gates beyond accuracy metrics before Production alias assignment.\n• Explainability: SHAP values logged as artifact; global feature importance in model card.\n• Bias testing: evaluate metric parity across protected groups; fail if disparity > threshold.\n• Governance workflow: Jira ticket linked in mlflow tag; approver group signs off in registry comment.\n• Technical gate: pre-promotion notebook computes fairness metrics; exits non-zero to block bundle deploy step.\n• Documentation: training data consent scope, PII handling, retention policy.\n\nBalance compliance velocity with automated checks—manual review only for exceptions flagged by automated bias scan.',
        cmd: 'import shap\nexplainer = shap.TreeExplainer(model)\nmlflow.log_artifact(shap.summary_plot(explainer.values), "shap")\n\nmlflow.set_tag("bias_audit_status", "passed")\nmlflow.set_tag("approver", "ml-governance@company.com")',
      },
      {
        q: 'Lead architecture for real-time feature computation feeding Model Serving with <100ms p99 latency.',
        a: 'Sub-100ms serving requires precomputed online features and optimized endpoint infrastructure.\n• Stream features: Structured Streaming aggregates to online Feature Store table synced to low-latency store.\n• Serving endpoint: provisioned concurrency, scale-to-zero disabled for prod, input schema validation.\n• Feature retrieval: FeatureSpec in endpoint config pulls from online store by entity ID—not batch Delta scan.\n• Cache hot entities in serving layer memory where supported.\n• Fallback: default feature values if online miss; alert on miss rate.\n• Load test with production QPS before launch; profile endpoint traces for bottleneck.\n\nSeparate training feature pipeline from online pipeline code sharing same transformation definitions (single source truth module).',
        cmd: 'fs.publish_table("prod.features.realtime_metrics", online_store="online_store")\n\ndatabricks serving-endpoints update-config --name fraud-api --json \'{\n  "served_entities": [{\n    "entity_name": "fraud_model",\n    "workload_size": "Medium",\n    "scale_to_zero_enabled": false,\n    "min_provisioned_concurrency": 4\n  }]\n}\'',
      },
      {
        q: 'Explain multi-model endpoint strategy vs dedicated endpoints for cost and isolation tradeoffs.',
        a: 'Serving architecture affects blast radius, scaling granularity, and DBU cost.\n• Dedicated endpoint per model: independent scaling, clear SLA, higher minimum cost per endpoint.\n• Multi-model endpoint (MME): share compute across models with low traffic; cost efficient but noisy neighbor risk.\n• Route by model name in API request; scale based on aggregate traffic.\n• Critical fraud model: dedicated with min concurrency; experimental models: shared MME or scale-to-zero.\n• Version rollout: traffic split between model versions on same endpoint for A/B testing.\n\nFinOps review: consolidate endpoints with <100 req/day; split when p99 latency SLO violated due to resource contention.',
        cmd: 'databricks serving-endpoints create --json \'{\n  "name": "shared-scoring",\n  "config": {\n    "served_models": [\n      {"model_name": "prod.ml.model_a", "model_version": "2", "workload_size": "Small"},\n      {"model_name": "prod.ml.model_b", "model_version": "1", "workload_size": "Small"}\n    ]\n  }\n}\'',
      },
    ],
  },

  'lakehouse-architecture': {
    easy: [
      {
        q: 'What is a data lakehouse and how does it combine data lake and warehouse benefits?',
        a: 'Lakehouse merges low-cost open storage with warehouse reliability and performance features.\n• Data lake strengths: cheap object storage, schema-on-read flexibility, diverse data types.\n• Warehouse strengths: ACID transactions, schema enforcement, BI performance, governance.\n• Delta Lake on cloud storage provides the transactional layer enabling both.\n• Single copy of data serves ETL, ML, and SQL analytics without duplication to separate warehouse.\n• Databricks popularized the architecture with Unity Catalog governance on top.\n\nInterview tip: contrast with dual-write lake + warehouse pattern that causes sync lag and cost duplication.',
        cmd: 'spark.sql("""\n  CREATE TABLE prod.gold.kpi_summary USING DELTA\n  AS SELECT region, sum(revenue) FROM prod.silver.orders GROUP BY region\n""")\n\n# Same table queried from SQL warehouse and ML notebook',
      },
      {
        q: 'Explain open table formats (Delta, Iceberg, Hudi) and why Delta is central to Databricks lakehouse.',
        a: 'Open table formats add transactional metadata on Parquet/ORC files in object storage.\n• Delta Lake: Databricks-native, deep integration with UC, Photon, DLT, and time travel.\n• Iceberg/Hudi: alternative formats with multi-engine support (Trino, Flink)—consider for polyglot estates.\n• All provide ACID, schema evolution, and incremental reads to varying degrees.\n• Delta UniForm (where available) enables Iceberg reader compatibility on Delta tables.\n• Format choice impacts engine support, tooling maturity, and migration cost.\n\nGreenfield on Databricks typically standardizes Delta; evaluate Iceberg if heavy Trino/Flink consumption required.',
        cmd: 'spark.sql("DESCRIBE DETAIL prod.silver.events").select("format", "minReaderVersion", "minWriterVersion").show()\n\n# UniForm (if enabled)\nspark.sql("ALTER TABLE prod.silver.events SET TBLPROPERTIES (\'delta.universalFormat.enabledFormats\' = \'iceberg\')")',
      },
      {
        q: 'What role does Unity Catalog play in a lakehouse architecture?',
        a: 'Unity Catalog is the governance and discovery layer unifying lakehouse assets.\n• Central metastore registers all Delta tables, volumes, models, and functions.\n• Fine-grained ACLs replace inconsistent per-workspace hive grants.\n• Lineage connects pipelines to tables for impact analysis.\n• External locations bind storage to credentials for secure access.\n• Enables data marketplace patterns: internal sharing via grants, external via Delta Sharing.\n\nWithout UC, lakehouse devolves into path-based chaos with unclear ownership and access sprawl.',
        cmd: 'spark.sql("SHOW CATALOGS").show()\nspark.sql("SELECT * FROM prod.information_schema.tables WHERE table_schema = \'gold\'").show()',
      },
      {
        q: 'How do SQL warehouses fit into lakehouse architecture for BI users?',
        a: 'SQL warehouses provide serverless-optimized SQL compute for BI without managing Spark clusters.\n• Query same Unity Catalog Delta tables as data engineering pipelines—no data copy.\n• Photon acceleration for aggregations and joins on gold layer marts.\n• JDBC/ODBC connectivity for Tableau, Power BI, Looker.\n• Separate scaling from batch ETL clusters—BI concurrency does not starve ETL jobs.\n• Warehouse sizes (2X-Small to 4X-Large) map to concurrency needs and cost.\n\nGold layer tables should be BI-ready: denormalized, documented columns, optimized file layout.',
        cmd: 'databricks sql warehouses create --json \'{"name": "bi-prod", "cluster_size": "Medium", "enable_photon": true, "auto_stop_mins": 10}\'\n\n# JDBC connection string from warehouse connection details tab',
      },
    ],
    medium: [
      {
        q: 'How do you implement data mesh principles on a Databricks lakehouse platform?',
        a: 'Data mesh decentralizes ownership while centralizing platform standards.\n• Domain teams own bronze/silver/gold schemas in UC catalog per domain (sales, finance).\n• Self-serve platform: bundle templates, CI/CD, cluster policies, shared ETL framework.\n• Data products: gold tables with documented SLAs, schema contracts, and consumer onboarding guide.\n• Federated governance: global UC policies + domain data owner approves local grants.\n• Delta Sharing exposes domain products to other domains without copying data.\n\nPlatform team enables; domain teams deliver. Avoid mesh as excuse for no standards—enforce interoperability via contracts.',
        cmd: 'spark.sql("CREATE CATALOG sales COMMENT \'Sales domain data product owner: sales-data@company.com\'")\n\nspark.sql("CREATE SHARE sales_kpi_share")\nspark.sql("ALTER SHARE sales_kpi_share ADD TABLE sales.gold.daily_revenue")',
      },
      {
        q: 'Compare batch-only lakehouse vs lambda architecture for analytics platforms.',
        a: 'Architecture choice depends on latency requirements and operational complexity tolerance.\n• Batch-only: nightly/hourly Delta refreshes, simplest ops, lowest cost, minutes-hours staleness.\n• Lambda: separate speed (stream) and batch (accurate) layers merged at serve—complex, dual pipeline maintenance.\n• Lakehouse streaming: Structured Streaming bronze + batch silver correction—simplified "kappa-lite".\n• Serving layer reads gold with freshness SLA label (provisional vs certified).\n• Most enterprises: batch gold for finance; streaming bronze/silver for operational dashboards only where justified.\n\nAvoid lambda by default—add streaming only when business quantifies cost of staleness.',
        cmd: '# Batch gold refresh\nspark.sql("CREATE OR REPLACE TABLE prod.gold.daily_kpi AS SELECT ...")\n\n# Streaming bronze for ops\nstream.writeStream.format("delta").option("checkpointLocation", path).toTable("prod.bronze.live_events")',
      },
      {
        q: 'How do you integrate external warehouses (Snowflake, BigQuery) with a Databricks lakehouse?',
        a: 'Hybrid architectures require governed data movement avoiding shadow copies.\n• Delta Sharing: zero-copy read of Delta tables from external platforms supporting the protocol.\n• Lakehouse Federation: query external tables via foreign catalogs without ingest (pushdown varies).\n• ETL sync: scheduled export/import via cloud storage intermediate when federation insufficient.\n• Single source of truth: designate lakehouse or warehouse as authoritative per domain—not both.\n• Lineage must cross system boundaries in enterprise catalog tool.\n\nMinimize bidirectional sync loops that cause conflicting metric definitions.',
        cmd: 'spark.sql("""\n  CREATE FOREIGN CATALOG snowflake_catalog\n  USING CONNECTION snowflake_prod\n""")\n\nspark.sql("SELECT * FROM snowflake_catalog.analytics.public.orders LIMIT 10")',
      },
      {
        q: 'What storage layout and catalog design decisions impact long-term lakehouse maintainability?',
        a: 'Early design choices compound over years—plan for growth and organizational change.\n• Hierarchical paths: s3://datalake/{env}/{layer}/{domain}/{table}—avoid flat bucket sprawl.\n• One metastore per region; catalogs per domain not per team.\n• External vs managed: external for migration period; managed for greenfield curated layers.\n• Tagging: owner, layer, pii, retention_class on all schemas.\n• Avoid table name versioning (orders_v2_v3)—use UC versions and deprecation tags instead.\n\nAnnual architecture review: orphaned tables, storage growth by domain, catalog count sanity check.',
        cmd: 'spark.sql("ALTER SCHEMA prod.silver_sales SET TAGS (\'owner\'=\'sales-eng\', \'layer\'=\'silver\', \'pii\'=\'false\')")\n\nspark.sql("SELECT table_catalog, table_schema, count(*) FROM system.information_schema.tables GROUP BY 1,2 ORDER BY 3 DESC").show()',
      },
    ],
    hard: [
      {
        q: 'Design a lakehouse platform supporting batch analytics, ML, and real-time decisioning on shared data.',
        a: 'Unified platform architecture serves diverse consumers from one governed Delta foundation.\n• Ingestion gateway: Kafka + Autoloader bronze; API batch landing zone.\n• Processing: medallion pipelines (DLT or Workflows); Feature Store for ML features.\n• Consumption: SQL warehouses (BI), Model Serving (real-time), Delta Sharing (partners).\n• Governance: UC central; row/column security; audit to SIEM.\n• SLAs tiered: gold batch T+1 for finance; silver streaming T+5min for ops; features T+1sec online store.\n• Observability: unified data quality dashboard across layers.\n\nPresent reference diagram with clear consumer paths and shared storage—no duplicate gold copies per consumer type.',
        cmd: '# Platform stack summary commands\nspark.sql("USE CATALOG prod")\nspark.sql("SHOW SCHEMAS").show()\n\nfs = FeatureStoreClient()\nfs.get_online_store("prod_online").describe()',
      },
      {
        q: 'How would you migrate an enterprise from data warehouse centric to lakehouse-first architecture?',
        a: 'Migration is multi-year organizational change—not just technology swap.\n• Phase 1: land raw in lakehouse bronze; replicate warehouse loads in parallel for validation.\n• Phase 2: rebuild silver/gold in Delta; BI dashboards migrate domain by domain with metric reconciliation.\n• Phase 3: decommission warehouse ETL for migrated domains; retain warehouse as consumption engine optionally via federation.\n• People: upskill SQL analysts on UC three-level names; train engineers on Delta MERGE patterns.\n• Risk: executive metric discrepancies during parallel run—weekly reconciliation reports mandatory.\n• Savings model: reduced warehouse storage compute duplication funds platform team.\n\nExecutive sponsor required; celebrate first domain fully on lakehouse with documented cost delta.',
        cmd: 'spark.sql("""\n  SELECT g.date, g.revenue lakehouse_rev, w.revenue warehouse_rev,\n         abs(g.revenue - w.revenue) / w.revenue pct_diff\n  FROM prod.gold.daily_revenue g\n  JOIN legacy_wh.public.daily_revenue w ON g.date = w.date\n  WHERE abs(g.revenue - w.revenue) / w.revenue > 0.001\n""").show()',
      },
      {
        q: 'Lead architecture review debating single unified lakehouse vs regional data silos for a global bank.',
        a: 'Global banks balance data residency, latency, and unified analytics— rarely pure single lakehouse.\n• Regional lakehouses: EU, US, APAC with separate metastores and storage—regulatory compliance.\n• Global analytics: aggregated gold via Delta Sharing or cross-region replication of summaries only—no raw PII export.\n• Identity: global SSO; regional UC grants; break-glass audited.\n• Platform consistency: same bundle templates, DBR versions, policies across regions.\n• Central COE sets standards; regional ops executes.\n\nDecision matrix scores: regulatory risk, query latency to local data, operational complexity, cost of replication.',
        cmd: 'spark.sql("CREATE SHARE eu_aggregates COMMENT \'Cross-border approved aggregates only\'")\nspark.sql("ALTER SHARE eu_aggregates ADD TABLE eu_prod.gold.regional_kpis")\n\n# Recipient in US workspace accepts share via Catalog Explorer',
      },
      {
        q: 'Explain how you would measure and communicate lakehouse platform ROI to executive leadership.',
        a: 'Executives need business outcomes—not DBU metrics alone.\n• Cost: DBU + storage vs prior warehouse + Hadoop TCO; include headcount efficiency (fewer pipeline FTE per domain onboarded).\n• Velocity: time-to-insight from new data source (days before vs after); self-service adoption rate.\n• Quality: incident count from bad data; SLA adherence percentage.\n• Revenue enablement: models in production, experiments shipped, partner data products launched.\n• Risk reduction: audit findings closed, PII exposure incidents zero.\n\nQuarterly business review deck: 3 cost charts, 2 velocity metrics, 1 risk slide, 1 customer impact story. Tie platform investment to OKRs.',
        cmd: 'spark.sql("""\n  SELECT month, sum(dbus) total_dbus, sum(bytes_processed)/1e12 tb_processed\n  FROM prod.meta.platform_usage\n  GROUP BY month ORDER BY month DESC LIMIT 12\n""").show()\n\n# Export to exec dashboard via SQL warehouse → BI tool',
      },
    ],
  },
};

export const SCENARIO_CONTENT = [
  {
    title: 'Delta Table Performance Issues',
    difficulty: 'easy',
    q: 'Users report that queries against prod.silver.events have slowed from 30 seconds to 8 minutes over the past week. What is your systematic troubleshooting approach?',
    a: 'Start with scope and impact: confirm which queries regressed, whether all filters or specific date ranges are affected, and if concurrent ETL writes increased.\n• Detect: run DESCRIBE DETAIL on prod.silver.events—check numFiles, sizeInBytes, and average file size; spike in numFiles indicates small-file problem.\n• Triage: DESCRIBE HISTORY for recent OPTIMIZE absence or streaming append surge; compare Spark UI scan bytes for slow query vs baseline.\n• Mitigate: run OPTIMIZE prod.silver.events ZORDER BY (user_id, event_date) on affected partitions; increase shuffle partitions if skew visible in stage timeline.\n• Prevent: enable autoOptimize on write, schedule weekly OPTIMIZE job, alert when numFiles > 10× partition count.\n\nCommunicate ETA to analysts after OPTIMIZE completes and validate query time restored under 45 seconds.',
    cmd: 'spark.sql("DESCRIBE DETAIL prod.silver.events").show(truncate=False)\n\nspark.sql("SELECT count(*) num_files FROM (DESCRIBE DETAIL prod.silver.events)")\n\nspark.sql("OPTIMIZE prod.silver.events WHERE event_date >= current_date() - INTERVAL 7 DAYS ZORDER BY (user_id)")',
  },
  {
    title: 'Streaming Pipeline Failure',
    difficulty: 'easy',
    q: 'A Kafka-to-Delta Structured Streaming job stopped appending data 2 hours ago with no obvious error in the job run UI. How do you diagnose and restore processing?',
    a: 'Treat as data freshness incident—downstream silver lag is accumulating.\n• Detect: check active streams via spark.streams.active; inspect lastProgress for inputRowsPerSecond = 0; verify Kafka topic still receiving data.\n• Triage: driver logs for ConcurrentModificationException, checkpoint corruption, or state store OOM; confirm checkpoint path S3 permissions unchanged.\n• Mitigate: if query terminated, restart streaming job with same checkpoint path; if checkpoint corrupt, clone checkpoint from backup or reset with startingOffsets=latest accepting gap documentation.\n• Validate: compare max(event_ts) in bronze vs Kafka high watermark; confirm micro-batches resuming in lastProgress.\n• Prevent: alert on streaming lag > 30 min; automated job restart policy; checkpoint path versioning.\n\nNotify downstream owners of potential 2-hour gap and estimated backfill need.',
    cmd: 'for s in spark.streams.active: print(s.id, s.status, s.lastProgress)\n\ndatabricks jobs runs get-output --run-id <run-id>\n\n# Restart via Workflow run-now\ndatabricks jobs run-now --job-id <streaming-job-id>',
  },
  {
    title: 'Cluster Cost Optimization',
    difficulty: 'easy',
    q: 'FinOps flagged a 40% DBU increase month-over-month on the data platform team with flat workload volume. How do you investigate and reduce spend?',
    a: 'Cost spikes without volume growth usually indicate cluster waste or inefficient queries.\n• Detect: export billing usage by cluster_name and job_id tags; identify top 10 expensive all-purpose clusters and jobs.\n• Triage: clusters without autotermination running 24/7; jobs on oversized fixed worker counts; recent DBR upgrade changing Photon billing.\n• Mitigate: enforce 30-min autotermination on dev clusters; migrate scheduled notebooks to job clusters with autoscale; right-size max_workers from Spark UI utilization (target 70% peak).\n• Quick win: switch eligible batch jobs to spot with fallback.\n• Prevent: cluster policies mandating autotermination and max workers; weekly FinOps report to engineering managers.\n\nTarget 25% reduction in 30 days without SLA breach on tier-1 jobs.',
    cmd: 'databricks clusters list --output JSON | jq \'.clusters[] | {name: .cluster_name, workers: .num_workers, autoterm: .autotermination_minutes}\'\n\ndatabricks jobs list --output JSON | jq \'.jobs[] | {name: .settings.name, id: .job_id}\'\n\n# Enable spot on non-critical job\ndatabricks jobs reset --json \'{"job_id":123,"new_settings":{"tasks":[{"new_cluster":{"aws_attributes":{"availability":"SPOT_WITH_FALLBACK"}}}]}}\'',
  },
  {
    title: 'Unity Catalog Access Problems',
    difficulty: 'easy',
    q: 'A new analyst reports PERMISSION_DENIED when querying prod.analytics.revenue despite being added to the data-analysts group yesterday. How do you resolve this?',
    a: 'UC permission issues require tracing identity, group sync, and grant chain.\n• Detect: confirm user runs SELECT current_user() and matches IdP account; verify SCIM sync completed (group membership in workspace admin).\n• Triage: SHOW GRANTS ON TABLE prod.analytics.revenue—check if data-analysts has SELECT; verify USE CATALOG prod and USE SCHEMA analytics grants exist (both required).\n• Mitigate: GRANT missing privileges at catalog, schema, and table levels; if external table, confirm READ on external location.\n• Validate: ask analyst to reconnect SQL warehouse session (cached auth) and rerun query.\n• Prevent: document standard analyst onboarding grant template; automate via Terraform/bundle on group creation.\n\nEscalate to account admin only if metastore-level deny policy blocks access.',
    cmd: 'spark.sql("SELECT current_user()").show()\n\nspark.sql("SHOW GRANTS ON TABLE prod.analytics.revenue").show(false)\n\nspark.sql("GRANT USE CATALOG ON CATALOG prod TO `data-analysts`")\nspark.sql("GRANT SELECT ON TABLE prod.analytics.revenue TO `data-analysts`")',
  },
  {
    title: 'ETL Failures',
    difficulty: 'easy',
    q: 'The nightly silver ETL Workflow failed at 03:00 with AnalysisException: column customer_id cannot be resolved. The job succeeded for months. What steps do you take?',
    a: 'Schema drift or upstream column rename is the likely cause after months of stability.\n• Detect: review failed task stderr in job run output; identify exact SQL/DataFrame line referencing customer_id.\n• Triage: compare bronze table schema today vs yesterday via DESCRIBE TABLE; check upstream API changelog or bronze ingest job for column rename (cust_id vs customer_id).\n• Mitigate: hotfix notebook with alias in select: cust_id AS customer_id; deploy via emergency bundle deploy; rerun failed task with repair run.\n• Validate: row count and sample join against dim_customers succeeds post-fix.\n• Prevent: explicit schema in bronze ingest; schema evolution alerts when new columns appear; contract tests in CI.\n\nPost-incident: add schema compatibility check task before silver in Workflow DAG.',
    cmd: 'spark.sql("DESCRIBE TABLE prod.bronze.raw_orders").show()\n\nspark.sql("SELECT * FROM prod.bronze.raw_orders LIMIT 1").printSchema()\n\ndatabricks jobs runs repair --run-id <run-id> --rerun_tasks silver_orders',
  },
  {
    title: 'Autoscaling Not Triggering',
    difficulty: 'easy',
    q: 'A job cluster configured with autoscale min=2 max=16 stayed at 2 workers while a stage ran 90 minutes with severe task queuing. Why might autoscale fail to add workers?',
    a: 'Autoscaling adds workers based on task backlog and policy constraints—not automatically on long runtimes alone.\n• Detect: Spark UI shows pending tasks > 0 while worker count static; cluster events log for SCALE_UP_REQUESTED vs DENIED.\n• Triage: check cluster policy max_workers cap; instance quota exhaustion in AWS account; pool max_capacity reached if using instance pool.\n• Also verify: job uses job cluster with autoscale config not fixed num_workers; local storage on i3 fills causing tasks hang not queue.\n• Mitigate: temporarily increase max_workers or switch to on-demand if spot unavailable; request AWS quota increase.\n• Prevent: load test autoscale behavior; alert when pending tasks > 100 for > 10 minutes.\n\nDocument if skew not scale issue—adding workers won\'t fix single hot partition.',
    cmd: 'databricks clusters get --cluster-id <id> | jq \'{autoscale, num_workers, state}\'\n\ndatabricks clusters events --cluster-id <id> | grep -i scale\n\naws service-quotas get-service-quota --service-code ec2 --quota-code L-1216C47A',
  },
  {
    title: 'Job Cluster OOM',
    difficulty: 'easy',
    q: 'A production ETL job failed with java.lang.OutOfMemoryError: Java heap space on the driver. What are the most common causes and immediate fixes?',
    a: 'Driver OOM kills the entire job—all executors terminate with the driver.\n• Detect: driver log shows OutOfMemoryError; often during collect(), toPandas(), broadcast too large, or wide schema inference.\n• Triage: Spark UI driver memory; search code for .collect(), .toPandas(), count on huge RDD without aggregation; check broadcast join threshold exceeded.\n• Mitigate: remove collect—write results to Delta instead; increase spark.driver.memory to 8–16g; replace broadcast with sort-merge if table too large.\n• If executor OOM misreported as driver: increase executor memory and reduce cores per executor.\n• Prevent: code review ban collect in prod; static analysis in CI; driver memory sized per job profile.\n\nRerun with fix on repair run after confirming root cause in stack trace.',
    cmd: 'spark.conf.set("spark.driver.memory", "16g")\nspark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")  # disable broadcast temporarily\n\n# Replace collect pattern\n# df.collect()  BAD\ndf.write.mode("overwrite").saveAsTable("prod.staging.results")  # GOOD',
  },
  {
    title: 'Delta Lake Concurrent Write Conflict',
    difficulty: 'medium',
    q: 'Two teams\' batch jobs writing to prod.silver.inventory frequently fail with ConcurrentModificationException. How do you redesign writes to eliminate conflicts?',
    a: 'Concurrent write conflicts indicate overlapping file rewrites from parallel writers on same table/partitions.\n• Detect: DESCRIBE HISTORY shows multiple WRITE operations failing; jobs retrying with increasing duration.\n• Triage: identify overlapping jobs via audit logs; determine if both use overwrite mode on same partitions.\n• Mitigate: serialize writes—merge jobs into one Workflow or use job-level max_concurrent_runs=1 for inventory table.\n• Redesign: switch blind overwrite to MERGE INTO keyed on sku; partition jobs by warehouse_id so writers touch disjoint paths.\n• Prevent: table ownership policy one writer team per table; optimistic concurrency retry wrapper with backoff for transient conflicts.\n\nLong-term: evaluate splitting hot table by region or using Delta liquid clustering to reduce file overlap.',
    cmd: 'spark.sql("DESCRIBE HISTORY prod.silver.inventory LIMIT 20").select("version","timestamp","operation","operationMetrics").show(truncate=False)\n\nspark.sql("""\n  MERGE INTO prod.silver.inventory t\n  USING staging.inventory_updates s ON t.sku = s.sku AND t.warehouse_id = s.warehouse_id\n  WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *\n""")',
  },
  {
    title: 'Medallion Layer Data Quality Regression',
    difficulty: 'medium',
    q: 'Gold layer daily revenue dropped 35% compared to yesterday with no business explanation. Silver row counts look normal. How do you investigate?',
    a: 'Revenue drop with stable silver counts suggests transformation logic, join, or filter regression—not ingest loss.\n• Detect: compare gold vs silver aggregate: sum(amount) by order_date; identify which dimension join lost rows (LEFT JOIN dropping unmatched).\n• Triage: git diff gold notebook between yesterday\'s deploy and today; check for new filter (status=\'completed\' excluding valid rows).\n• Triage silver: null rate on join keys increased; dim table stale missing new customer_ids.\n• Mitigate: rollback gold job to previous git tag; RESTORE gold table VERSION AS OF last good if needed.\n• Prevent: daily reconciliation job comparing gold total to silver source-of-truth with 1% tolerance alert.\n\nCommunicate to finance if reported numbers were published—issue correction advisory.',
    cmd: 'spark.sql("""\n  SELECT \'silver\' src, sum(amount) FROM prod.silver.orders WHERE order_date = current_date() - 1\n  UNION ALL\n  SELECT \'gold\', sum(total_revenue) FROM prod.gold.daily_revenue WHERE order_date = current_date() - 1\n""").show()\n\nspark.sql("SELECT count(*) FROM prod.silver.orders o LEFT ANTI JOIN prod.silver.customers c ON o.customer_id = c.customer_id").show()',
  },
  {
    title: 'Structured Streaming Checkpoint Corruption',
    difficulty: 'medium',
    q: 'After an S3 outage, a streaming job fails on restart with checkpoint metadata corruption errors. How do you recover without duplicating a week of data?',
    a: 'Checkpoint corruption after storage outage requires careful recovery balancing data loss vs duplication.\n• Detect: exception mentions checkpoint path unreadable or MetadataLogError; verify S3 object integrity on checkpoint prefix.\n• Triage: identify last successfully committed batch from prod.meta.stream_metrics or Kafka consumer lag vs Delta max timestamp.\n• Mitigate option A: restore checkpoint from S3 versioning backup if available.\n• Mitigate option B: new checkpoint with startingVersion on Delta source (if downstream) or startingOffsets by timestamp on Kafka—accept reprocessing window.\n• Dedup: MERGE on event_id for overlap window after restart.\n• Prevent: checkpoint on versioned bucket; cross-region replication; streaming job SLA monitor.\n\nDocument gap/overlap window for downstream consumers before restart.',
    cmd: 'aws s3api list-object-versions --bucket datalake --prefix checkpoints/orders/\n\ndbutils.fs.ls("s3://datalake/checkpoints/orders/commits/")\n\n# Restart with offset by timestamp\n.option("startingTimestamp", "2024-06-15T00:00:00Z")',
  },
  {
    title: 'Photon Not Used on Large Scan',
    difficulty: 'medium',
    q: 'A SQL warehouse query scanning 2 TB runs 12 minutes and the query profile shows Photon was not used. How do you diagnose and enable acceleration?',
    a: 'Missing Photon on large scan wastes performance headroom on supported queries.\n• Detect: query profile shows "Spark" engine not "Photon"; warehouse has enable_photon=false or unsupported operators present.\n• Triage: identify unsupported expressions—complex UDFs, certain Python UDFs, specific JSON functions force Spark fallback.\n• Triage: verify warehouse not pinned to non-Photon DBR; check if query uses RDD API or legacy hints.\n• Mitigate: rewrite query replacing UDF with native SQL functions; enable Photon on warehouse; upgrade to latest DBR SQL warehouse version.\n• Validate: rerun query—expect 2–10× speedup on scan-heavy aggregation; compare scanned bytes unchanged.\n• Prevent: lint SQL for Photon compatibility in CI; default Photon on for prod warehouses.\n\nIf operator unsupported permanently, consider precomputing expression in silver ETL.',
    cmd: 'databricks sql warehouses get --id <warehouse-id> | jq .enable_photon\n\ndatabricks sql warehouses edit --id <warehouse-id> --enable-photon true\n\nEXPLAIN EXTENDED SELECT region, sum(amount) FROM prod.gold.sales GROUP BY region;',
  },
  {
    title: 'Workflow Dependency Chain Failure',
    difficulty: 'medium',
    q: 'A 12-task Workflow failed at task 8 causing tasks 9–12 to skip. Upstream tasks 1–7 succeeded but task 8 timed out after 3 hours. How do you recover and harden the pipeline?',
    a: 'Mid-DAG timeout requires selective repair and SLA re-architecture for the slow task.\n• Detect: job run UI shows task 8 TIMED_OUT; downstream SKIPPED due to dependency failure.\n• Triage: Spark UI for task 8—identify straggler stage; check if data volume spike or skew caused 3h runtime vs 45m baseline.\n• Mitigate: increase task 8 timeout temporarily; run repair run rerunning tasks 8–12 only (preserves 1–7 outputs).\n• Fix root cause: optimize task 8 query (partition filter, broadcast join); increase autoscale max_workers.\n• Harden: split task 8 into parallel for-each by date; add duration alert at 90m; set depends_on with optional timeout escalation.\n• Prevent: SLA buffer in schedule—DAG must finish 2h before downstream consumer deadline.\n\nCommunicate partial data availability if tasks 9–12 include external delivery.',
    cmd: 'databricks jobs runs repair --run-id <run-id> --rerun_tasks task_8,task_9,task_10,task_11,task_12\n\ndatabricks jobs runs get --run-id <run-id> | jq \'.tasks[] | {key: .task_key, state: .state.result_state, duration: .execution_duration}\'',
  },
  {
    title: 'Secrets Scope Permission Denied',
    difficulty: 'medium',
    q: 'A production Workflow using dbutils.secrets.get(scope=\'prod-api\', key=\'token\') fails with PERMISSION_DENIED after migrating run_as to a service principal. How do you fix this?',
    a: 'Secret scope ACLs are identity-specific—SP migration requires explicit scope permission grant.\n• Detect: task fails at secret read line; works when run manually as original user.\n• Triage: databricks secrets list-acls --scope prod-api—verify run_as SP not in ACL list.\n• Triage: confirm scope backend (Key Vault/Secrets Manager) policy allows Databricks access principal.\n• Mitigate: databricks secrets put-acl --scope prod-api --principal prod-etl-sp@company.com --permission READ.\n• Validate: trigger test run with run_as SP; confirm secret retrieved (redacted in logs).\n• Prevent: scope ACL managed as code in bundle/Terraform; SP onboarding checklist includes all required scopes.\n\nRotate secret if there is concern SP compromise during debugging exposure.',
    cmd: 'databricks secrets list-acls --scope prod-api\n\ndatabricks secrets put-acl --scope prod-api \\\n  --principal prod-etl-sp@company.com --permission READ\n\ndatabricks jobs run-now --job-id <job-id>',
  },
  {
    title: 'MLflow Model Promotion Blocked',
    difficulty: 'medium',
    q: 'A data scientist cannot promote churn_model version 7 to Production in Unity Catalog registry due to permission errors. The model must deploy tonight. What do you do?',
    a: 'Model promotion blocks require separating UC permissions from MLflow UI issues.\n• Detect: error on set alias Production or transition stage—note exact UC vs MLflow message.\n• Triage: SHOW GRANTS ON MODEL prod.ml.churn_model for user/SP; need APPLY TAG or MODIFY on model per UC model ACL model.\n• Triage: governance policy may require alias change via CI service principal only—not individual users.\n• Mitigate: ml-governance SP runs promotion via approved pipeline; or GRANT temporary MODIFY to lead DS with ticket approval.\n• Validate: mlflow.set_registered_model_alias("prod.ml.churn_model", "Production", 7); verify serving endpoint picks up version.\n• Prevent: document promotion runbook; self-service staging, gated prod via CI.\n\nIf version 7 fails quality gate not permission—run evaluation notebook before promotion override.',
    cmd: 'spark.sql("SHOW GRANTS ON MODEL prod.ml.churn_model").show(false)\n\nmlflow.set_registered_model_alias("prod.ml.churn_model", "Production", 7)\n\nspark.sql("GRANT EXECUTE ON MODEL prod.ml.churn_model TO `ml-governance-sp`")',
  },
  {
    title: 'Lakehouse Bronze Ingestion Lag',
    difficulty: 'medium',
    q: 'Bronze Autoloader ingestion lag for clickstream data grew from 5 minutes to 45 minutes during a marketing campaign traffic spike. How do you restore SLA?',
    a: 'Ingestion lag during traffic spikes requires scaling throughput and eliminating bottlenecks.\n• Detect: compare landing bucket file arrival rate vs bronze max(ingest_ts) lag; Autoloader lastProgress input rate.\n• Triage: cluster undersized—2 workers cannot process 10× file volume; listing mode on huge directory instead of file notification mode.\n• Triage: small files overwhelming open overhead; downstream shuffle in same streaming query.\n• Mitigate: scale job cluster max_workers; switch to cloudFiles.useNotifications=true with SQS; split ingest from silver into separate jobs.\n• Validate: lag drops below 10 min within 30 min of scale; monitor for 24h through campaign peak.\n• Prevent: autoscale policy for streaming job; pre-scale before known campaigns; file size enforcement at producer.\n\nPost-mortem: capacity plan for 3× peak with headroom.',
    cmd: 'spark.readStream.format("cloudFiles") \\\n  .option("cloudFiles.format", "json") \\\n  .option("cloudFiles.useNotifications", "true") \\\n  .option("cloudFiles.schemaLocation", schema_path) \\\n  .load("s3://landing/clicks/")\n\ndatabricks clusters edit --cluster-id <id> --json \'{"autoscale":{"min_workers":4,"max_workers":32}}\'',
  },
  {
    title: 'Cluster Init Script Failure',
    difficulty: 'hard',
    q: 'All clusters in the workspace fail to start after deploying a new global init script intended to install a monitoring agent. Every production job is down. What is your incident command?',
    a: 'Global init script failure is workspace-wide Sev-1—all compute blocked.\n• Detect: cluster state ERROR on start; event log INIT_SCRIPT_FAILURE; PagerDuty from mass job failures.\n• Contain: account/workspace admin removes or disables global init script immediately via admin console/API.\n• Triage: retrieve script from /Volumes or DBFS; reproduce on test cluster; common failures: apt without network egress, wrong architecture binary, missing chmod +x.\n• Mitigate: terminate ERROR clusters; rerun critical jobs on clusters without init script (temporary policy exemption).\n• Recover: fix script in staging with set -e and logging; promote cluster-scoped not global; canary on single job cluster 24h.\n• Prevent: global init scripts require platform CAB approval; automated cluster start canary every 15 min.\n\nIncident commander assigns comms lead for stakeholder updates every 30 min until green.',
    cmd: '# Disable global init via workspace conf API\ncurl -X PATCH "$DATABRICKS_HOST/api/2.0/workspace-conf" \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"init_scripts.global": []}\'\n\ndatabricks clusters events --cluster-id <failed-id> | grep -i init',
  },
  {
    title: 'Table ACL Inheritance Issue',
    difficulty: 'hard',
    q: 'An engineer with USE SCHEMA on prod.silver cannot read prod.silver.orders despite a table-level GRANT SELECT. A DENY at catalog level was added last week for contractors group. How do you unravel this?',
    a: 'UC privilege resolution follows grant/deny precedence—DENY overrides ALLOW.\n• Detect: SELECT current_user() and group membership; error is PERMISSION_DENIED not TABLE_NOT_FOUND.\n• Triage: SHOW GRANTS ON TABLE prod.silver.orders for user; SHOW GRANTS ON CATALOG prod for contractors group.\n• Triage: DENY SELECT ON CATALOG prod TO contractors blocks all catalog objects regardless of table GRANT.\n• Mitigate: if engineer is contractor, expected behavior—move to read replica catalog or specific external share.\n• If engineer should access: REMOVE DENY or add to exception group with explicit ALLOW that supersedes per UC deny rules (account for deny-wins semantics).\n• Prevent: deny policy review in CAB; document deny hierarchy; test access matrix after deny changes.\n\nUC deny-wins: only remove deny or restructure group membership—table-level grant alone insufficient.',
    cmd: 'spark.sql("SHOW GRANTS ON CATALOG prod").show(false)\n\nspark.sql("SHOW GRANTS ON TABLE prod.silver.orders").show(false)\n\nspark.sql("SHOW GRANTS `engineer@company.com` ON CATALOG prod").show()',
  },
  {
    title: 'Optimize Command Not Reducing Files',
    difficulty: 'hard',
    q: 'OPTIMIZE on a 5 TB Delta table ran 3 hours but numFiles dropped only 2% (800K to 784K files). What explains ineffective compaction and how do you fix it?',
    a: 'Ineffective OPTIMIZE usually means wrong strategy for table layout or OPTIMIZE scope too narrow.\n• Detect: DESCRIBE DETAIL before/after numFiles; OPTIMIZE operationMetrics in DESCRIBE HISTORY shows filesAdded vs filesRemoved ratio.\n• Triage: table over-partitioned (800K partitions)—OPTIMIZE compacts within partitions only, cannot merge across partitions.\n• Triage: ZORDER on high-cardinality column prevents effective bin-packing; concurrent streaming writes adding files during OPTIMIZE.\n• Mitigate: pause streaming writes during maintenance window; OPTIMIZE full table not single partition filter.\n• Structural fix: migrate to liquid clustering replacing excessive partition columns; or rewrite table with coarser partition (month not hour).\n• Alternative: repartition(200) write to new table swap.\n• Prevent: ingest tuning target 128MB files; autoCompact; partition design review at table creation.\n\nExpect hours-long OPTIMIZE on 5TB—use phased OPTIMIZE WHERE date ranges over multiple nights.',
    cmd: 'spark.sql("DESCRIBE HISTORY prod.silver.events WHERE operation = \'OPTIMIZE\' LIMIT 5").show(truncate=False)\n\nspark.sql("OPTIMIZE prod.silver.events WHERE event_date BETWEEN \'2024-06-01\' AND \'2024-06-07\'")\n\nspark.sql("ALTER TABLE prod.silver.events CLUSTER BY (user_id, event_date)")',
  },
  {
    title: 'Streaming Watermark Dropping Records',
    difficulty: 'hard',
    q: 'Business reports 8% of late-arriving transactions missing from streaming aggregates after you reduced watermark from 2 hours to 15 minutes for cost savings. How do you correct and redesign?',
    a: 'Aggressive watermark reduction drops late events permanently from stateful aggregations.\n• Detect: compare streaming gold totals vs batch reconciliation table; missing records have lateness > 15 min between event_ts and processing time.\n• Triage: review watermark change deploy date correlating with discrepancy start.\n• Mitigate immediate: increase watermark back to 2 hours; restart stream (state rebuild required).\n• Correct data: batch MERGE rebuild affected date partitions in gold from bronze with full lateness tolerance.\n• Redesign: dual-path—streaming provisional metrics with 15 min watermark for ops dashboard; daily batch correction job certifies finance numbers with 24h lateness window.\n• Prevent: never change watermark without business sign-off on lateness SLA; monitor droppedRecords metric in StreamingQueryListener.\n\nDocument lateness SLA: ops 15 min provisional, finance T+1 certified from batch.',
    cmd: 'stream.withWatermark("event_ts", "2 hours")  # restore\n\nspark.sql("""\n  MERGE INTO prod.gold.hourly_revenue t\n  USING (SELECT ... FROM prod.bronze.events WHERE event_date = \'2024-06-15\') s\n  ON t.hour = s.hour AND t.region = s.region\n  WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *\n""")\n\n# Monitor drops\nquery.lastProgress["numInputRows"], query.lastProgress["stateOperators"]',
  },
  {
    title: 'Cross-Workspace Sharing Failure',
    difficulty: 'hard',
    q: 'A Delta Share recipient in partner workspace reports they cannot query shared table eu_prod.analytics.kpis—authentication succeeds but query fails on storage access. Diagnose cross-workspace sharing failure.',
    a: 'Delta Sharing failures often split between share definition, recipient activation, and storage credential boundaries.\n• Detect: confirm share exists: SHOW SHARES; DESCRIBE SHARE eu_kpi_share; recipient sees share in Catalog Explorer.\n• Triage recipient side: share activated to correct metastore; recipient token not expired.\n• Triage provider side: shared table storage credential valid; IAM role trust includes Databricks sharing service; bucket policy allows sharing principal.\n• Triage: IP access list or storage firewall blocking recipient Databricks control plane egress.\n• Mitigate: refresh share GRANT SELECT ON SHARE to recipient; re-create recipient activation link; validate storage credential with UC storage validation tool.\n• Prevent: sharing runbook with pre-flight credential test; monitor share query failures via provider audit logs.\n\nEscalate to Databricks support with share name, recipient metastore ID, and exact error from recipient query profile.',
    cmd: 'spark.sql("SHOW SHARES").show()\nspark.sql("DESCRIBE SHARE eu_kpi_share").show()\n\nspark.sql("GRANT SELECT ON SHARE eu_kpi_share TO RECIPIENT `partner-corp`")\n\n# Provider storage credential validation\nspark.sql("DESCRIBE STORAGE CREDENTIAL eu_sharing_cred").show()',
  },
];

