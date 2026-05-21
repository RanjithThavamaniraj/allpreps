export const QUESTIONS_DATA = [
  {
    id: 1,
    title: "Explain Oracle SGA vs PGA Memory Structures",
    category: "oracle dba",
    difficulty: "easy",
    answer: "System Global Area (SGA) is a shared memory region allocated when an Oracle instance starts. It is accessible by all server and background processes.\n\nKey SGA Components:\n• Database Buffer Cache — caches data blocks read from datafiles.\n• Shared Pool — caches parsed SQL/PLSQL, execution plans, and data dictionary rows.\n• Redo Log Buffer — temporarily stores redo entries before LGWR writes them to redo log files.\n\nProgram Global Area (PGA) is a private, non-shared memory region for each server process.\n\nKey PGA Components:\n• Private SQL Area — holds bind variable values and runtime cursor state.\n• SQL Work Areas — used for sorting, hashing, and bitmap merge operations.\n\nSizing:\n• SGA is controlled by SGA_TARGET or MEMORY_TARGET.\n• PGA is controlled by PGA_AGGREGATE_TARGET.",
    command: "-- Check SGA component sizes\nSELECT name, bytes/1024/1024 AS size_mb FROM v$sgainfo;\n\n-- Check PGA target and usage\nSELECT name, value/1024/1024 AS mb\nFROM v$pgastat\nWHERE name IN ('PGA Target','total PGA allocated');"
  },
  {
    id: 2,
    title: "Find Duplicate Rows in SQL Without a Subquery",
    category: "sql",
    difficulty: "easy",
    answer: "The simplest approach uses GROUP BY with HAVING to find column values that appear more than once.\n\nHow it works:\n1. GROUP BY collapses rows sharing the same value.\n2. COUNT(*) counts occurrences within each group.\n3. HAVING COUNT(*) > 1 filters to only groups with duplicates.\n\nThis is efficient, readable, and works across all major SQL databases (Oracle, PostgreSQL, MySQL, SQL Server).",
    command: "-- Find duplicate emails\nSELECT email, COUNT(*) AS occurrences\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;"
  },
  {
    id: 3,
    title: "What is standard port for Oracle Listener and how to change it?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "The default port for the Oracle Net Listener is 1521.\n\nTo change the listener port:\n1. Edit the listener.ora configuration file (usually in $ORACLE_HOME/network/admin).\n2. Update the PORT parameter under the listener definition.\n3. Restart the listener using lsnrctl.\n4. Update the LOCAL_LISTENER parameter in the database instance so the database registers services with the new port.",
    command: "# Edit listener.ora and change PORT = 1521 to PORT = 1522\n# Restart listener:\nlsnrctl stop\nlsnrctl start\n\n# Update database local_listener parameter:\nALTER SYSTEM SET LOCAL_LISTENER='(ADDRESS=(PROTOCOL=TCP)(HOST=dbhost)(PORT=1522))' SCOPE=BOTH;"
  },
  {
    id: 4,
    title: "How do you check current memory/CPU usage on Linux?",
    category: "linux",
    difficulty: "easy",
    answer: "Several built-in utilities exist to monitor server performance:\n• top / htop: Interactive real-time process monitoring.\n• free -h: Displays total, used, and free physical memory and swap space in human-readable format.\n• vmstat 1: Output memory, swap, I/O, and CPU statistics every 1 second.\n• sar: System Activity Reporter to collect and report system activity.",
    command: "# Show human readable memory usage\nfree -h\n\n# Show CPU and VM statistics every 2 seconds, 5 times\nvmstat 2 5\n\n# Show top processes sorted by memory usage\ntop -o %MEM"
  },
  {
    id: 5,
    title: "How do you create an S3 bucket and upload a file via AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "You can interact with Amazon S3 using the aws s3 or aws s3api CLI tools. The bucket name must be globally unique across all AWS accounts.\n\nSteps:\n1. Create the bucket specifying the region.\n2. Upload a file using the s3 cp or s3 sync command.",
    command: "# Create S3 bucket (mb = make bucket)\naws s3 mb s3://my-unique-dba-backup-bucket --region us-east-1\n\n# Upload a local backup file to the bucket\naws s3 cp /u01/backups/rman_bkp.dmp s3://my-unique-dba-backup-bucket/rman_bkp.dmp"
  },
  {
    id: 6,
    title: "Difference between UNION and UNION ALL in SQL",
    category: "sql",
    difficulty: "easy",
    answer: "Both operators combine the result sets of two or more SELECT queries into a single result.\n\nKey Differences:\n• UNION removes duplicate rows from the final result set. It performs a sort operation to find and remove duplicates, which can be resource-intensive.\n• UNION ALL includes all rows from both queries, including duplicates. It does not perform a sort, making it faster and more memory-efficient.\n\nRule of thumb: Use UNION ALL unless you specifically need duplicates removed.",
    command: "-- UNION (removes duplicates, performs sort)\nSELECT job_id FROM employees\nUNION\nSELECT job_id FROM job_history;\n\n-- UNION ALL (keeps duplicates, faster)\nSELECT department_id FROM employees\nUNION ALL\nSELECT department_id FROM departments;"
  },
  {
    id: 7,
    title: "How to check Oracle Database version and status?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "You can query the instance status and version using SQL*Plus while connected to the database as SYSDBA.\n\nKey views:\n• v$instance: Contains instance status, host name, startup time, and version.\n• v$database: Contains database name, creation date, log mode, and open mode.",
    command: "-- Query instance info\nSELECT instance_name, status, host_name, startup_time, version FROM v$instance;\n\n-- Query database open status and log mode\nSELECT name, open_mode, log_mode FROM v$database;"
  },
  {
    id: 8,
    title: "What is SSH and how do you generate key pairs?",
    category: "linux",
    difficulty: "easy",
    answer: "SSH (Secure Shell) is a protocol used to securely connect to remote systems over an unsecured network.\n\nKey-based authentication uses a public key (uploaded to the server) and a private key (kept on your client machine). This is far more secure than password-based logins.\n\nSteps:\n1. Run ssh-keygen on your client to generate a public/private keypair.\n2. Copy the public key to the remote server using ssh-copy-id.",
    command: "# Generate an RSA 4096-bit key pair\nssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_prod\n\n# Copy public key to remote host\nssh-copy-id -i ~/.ssh/id_rsa_prod.pub dba_admin@dbserver01"
  },
  {
    id: 9,
    title: "Basic Shell Script structure and execution permissions",
    category: "shell scripting",
    difficulty: "easy",
    answer: "A shell script is a text file containing a sequence of commands. It must start with a \"shebang\" line (e.g., #!/bin/bash) to tell the kernel which shell interpreter to use.\n\nTo run a script:\n1. Create the text file.\n2. Give the file execute permissions using chmod +x.\n3. Run the script using ./scriptname.",
    command: "# 1. Create a simple script\necho -e '#!/bin/bash\\necho \"Database status check complete.\"' > db_check.sh\n\n# 2. Add execute permissions\nchmod +x db_check.sh\n\n# 3. Execute the script\n./db_check.sh"
  },
  {
    id: 10,
    title: "Explain differences between Clustered and Non-Clustered Indexes",
    category: "sql",
    difficulty: "easy",
    answer: "Indexes speed up data retrieval by providing quick access paths.\n\nKey Differences:\n• Clustered Index (Index-Organized Table in Oracle): Determines the physical order of data blocks in the table. A table can have only one clustered index because rows can be stored in only one physical order.\n• Non-Clustered Index: A separate structure from the table data. It contains index key values and row pointers (ROWIDs) pointing to the actual data. A table can have multiple non-clustered indexes.",
    command: "-- Oracle default index (Non-Clustered B-Tree)\nCREATE INDEX idx_emp_last_name ON employees(last_name);\n\n-- Create Index-Organized Table (Clustered Index equivalent in Oracle)\nCREATE TABLE countries_iot (\n  country_id CHAR(2) PRIMARY KEY,\n  country_name VARCHAR2(40)\n) ORGANIZATION INDEX;"
  },
  {
    id: 11,
    title: "How do you check tablespace usage in Oracle?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Tablespaces store physical database objects. Managing tablespace usage is critical to prevent database hangs when datafiles run out of space.\n\nYou can calculate the allocated, used, and free space by joining information from the DBA_DATA_FILES and DBA_FREE_SPACE views.",
    command: "-- Check tablespace usage percentage\nSELECT d.tablespace_name,\n       ROUND(a.bytes/1024/1024, 2) AS total_mb,\n       ROUND((a.bytes - f.bytes)/1024/1024, 2) AS used_mb,\n       ROUND(f.bytes/1024/1024, 2) AS free_mb,\n       ROUND(((a.bytes - f.bytes)/a.bytes)*100, 2) AS pct_used\nFROM   (SELECT tablespace_name, SUM(bytes) bytes FROM dba_data_files GROUP BY tablespace_name) a,\n       (SELECT tablespace_name, SUM(bytes) bytes FROM dba_free_space GROUP BY tablespace_name) f\nWHERE  a.tablespace_name = f.tablespace_name\nORDER BY pct_used DESC;"
  },
  {
    id: 12,
    title: "What is a Docker image vs container?",
    category: "devops",
    difficulty: "easy",
    answer: "• Docker Image: A read-only template that contains all the instructions to create a container. It packages the application code, runtime libraries, environment settings, and configurations.\n• Docker Container: A runnable, isolated instance of a Docker image. It runs natively on the host kernel but is sandboxed from other containers.",
    command: "# Pull a pre-built Postgres image from Docker Hub\ndocker pull postgres:15-alpine\n\n# Run a container instance from that image\ndocker run --name my-postgres-db -e POSTGRES_PASSWORD=secret -d -p 5432:5432 postgres:15-alpine"
  },
  {
    id: 13,
    title: "How do you view file changes in real time in Linux?",
    category: "linux",
    difficulty: "easy",
    answer: "The tail command is the industry standard for viewing log file updates as they happen.\n\nOptions:\n• tail -f filename: Follows the file and updates in real time.\n• tail -F filename: Follows the file, and retries opening it if it is rotated or replaced (crucial for log file monitoring).",
    command: "# Follow Oracle alert log changes in real time\ntail -f /u01/app/oracle/diag/rdbms/orcl/orcl/trace/alert_orcl.log\n\n# View last 100 lines and follow changes\ntail -100f /var/log/messages"
  },
  {
    id: 14,
    title: "How to define a variable and check its value in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "In Bash, define variables with no spaces around the equals sign (`=`). Access the variable's value by prefixing the variable name with a dollar sign (`$`).",
    command: "# Define variables\nORACLE_SID=\"prod_db\"\nBACKUP_DIR=\"/db/backups\"\n\n# Print variable values\necho \"Current Database SID is: $ORACLE_SID\"\necho \"Backup path is: $BACKUP_DIR\""
  },
  {
    id: 15,
    title: "What is the purpose of AWS IAM?",
    category: "aws",
    difficulty: "easy",
    answer: "AWS Identity and Access Management (IAM) is a service that helps you securely control access to AWS resources. It controls authentication (signing in) and authorization (permissions) to allow specific users or systems to interact with S3, EC2, RDS, and other services.",
    command: "# List active IAM users in your AWS account\naws iam list-users\n\n# List access keys for a specific user\naws iam list-access-keys --user-name dba_backup_agent"
  },
  {
    id: 16,
    title: "Identifying and Tuning Slow Queries using EXPLAIN PLAN",
    category: "oracle dba",
    difficulty: "medium",
    answer: "An execution plan shows the step-by-step operations Oracle performs to retrieve query results.\n\nRed Flags in an Execution Plan:\n• TABLE ACCESS FULL on large tables — missing index or the optimizer chose not to use one.\n• NESTED LOOPS on large datasets — consider HASH JOIN for better performance.\n• High COST value — indicates significant resource consumption.\n• Cardinality mismatch — the optimizer estimates do not match actual row counts (stale statistics).\n\nTuning Steps:\n1. Gather fresh optimizer statistics using DBMS_STATS.\n2. Add indexes on filter columns (WHERE, JOIN conditions).\n3. Use composite indexes for multi-column predicates.\n4. Use SQL Hints (/*+ INDEX */, /*+ FULL */) only as a last resort.\n5. Review V$SQL_PLAN_STATISTICS_ALL for actual vs estimated rows.",
    command: "-- Generate execution plan\nEXPLAIN PLAN FOR\nSELECT e.employee_id, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id\nWHERE e.salary > 80000;\n\n-- Display the plan\nSELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);\n\n-- Gather statistics for accurate plans\nEXEC DBMS_STATS.GATHER_TABLE_STATS('HR','EMPLOYEES');\n\n-- Real-time plan with actual row counts\nSELECT /*+ GATHER_PLAN_STATISTICS */ e.employee_id\nFROM employees e WHERE e.salary > 80000;\nSELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(FORMAT=>'ALLSTATS LAST'));"
  },
  {
    id: 17,
    title: "Oracle Active Data Guard vs Classic Physical Standby",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Physical Standby (Classic):\n• The standby database is in MOUNT mode during redo apply.\n• It cannot serve read queries while redo is being applied.\n• To run reports, you must stop redo apply and open READ ONLY — creating an apply gap.\n\nActive Data Guard (ADG):\n• The standby database is open READ ONLY while simultaneously applying redo.\n• Supports real-time query results on the standby with no apply gap.\n• Offloads reporting, backups, and read workloads from the primary.\n\nKey Differences:\n• ADG requires a separate license from Oracle.\n• ADG supports Automatic Block Repair — if a corrupt block is detected on primary, it fetches the good copy from standby automatically.\n• ADG supports Far Sync instances for zero-data-loss protection over long distances.",
    command: "-- Check database role and open mode\nSELECT database_role, open_mode, protection_mode FROM v$database;\n\n-- Verify redo apply status on standby\nSELECT process, status, sequence#, block#\nFROM v$managed_standby WHERE process LIKE 'MRP%';\n\n-- Check apply lag\nSELECT name, value, datum_time FROM v$dataguard_stats\nWHERE name LIKE '%lag%';"
  },
  {
    id: 18,
    title: "Managing ASM Disk Groups and Rebalancing",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Automatic Storage Management (ASM) is Oracle's volume manager and file system for database files.\n\nHow ASM Works:\n• Files are striped across all disks in a disk group for balanced I/O.\n• Redundancy levels: EXTERNAL (no mirroring), NORMAL (2-way mirror), HIGH (3-way mirror).\n• When disks are added or dropped, ASM automatically rebalances data across the remaining disks.\n\nRebalancing:\n• Rebalance power ranges from 1 (slowest, least I/O impact) to 1024 (fastest).\n• Default power is 1. Production systems typically use 4-8 to balance speed vs. workload impact.\n• Rebalancing runs as a background operation and can be monitored in real time.",
    command: "-- Check disk group status and space\nSELECT name, type, total_mb, free_mb, required_mirror_free_mb\nFROM v$asm_diskgroup;\n\n-- View individual disks and their state\nSELECT group_number, disk_number, name, total_mb, free_mb, state\nFROM v$asm_disk;\n\n-- Monitor active rebalance operations\nSELECT group_number, operation, state, power, est_minutes\nFROM v$asm_operation;\n\n-- Manually trigger a faster rebalance\nALTER DISKGROUP data REBALANCE POWER 8;"
  },
  {
    id: 19,
    title: "Linux Virtual Memory Management & Swappiness Tuning",
    category: "linux",
    difficulty: "medium",
    answer: "Virtual Memory in Linux combines physical RAM with swap space on disk to give processes the illusion of a larger, contiguous memory space.\n\nHow it works:\n• The kernel divides memory into pages (typically 4KB).\n• When RAM is full, the kernel moves inactive pages to swap (paging out).\n• When a swapped page is needed, it is brought back into RAM (paging in) — this is slow.\n\nSwappiness (vm.swappiness):\n• A value from 0 to 100 controlling how aggressively the kernel swaps.\n• swappiness=0 — kernel avoids swapping as much as possible.\n• swappiness=100 — kernel aggressively moves pages to swap.\n• Default is usually 60.\n\nBest Practice for Databases (Oracle, PostgreSQL):\n• Set vm.swappiness to 1–10 to keep application data in RAM.\n• High swappiness causes latency spikes when SGA/PGA pages get swapped.",
    command: "# Check current swappiness\ncat /proc/sys/vm/swappiness\n\n# Set temporarily (lost on reboot)\nsudo sysctl vm.swappiness=10\n\n# Set permanently\necho \"vm.swappiness = 10\" | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p\n\n# View current memory and swap usage\nfree -h"
  },
  {
    id: 20,
    title: "Monitor Disk Space with Bash and Send Alerts",
    category: "shell scripting",
    difficulty: "medium",
    answer: "A production monitoring script should:\n1. Parse the output of df to get partition usage percentages.\n2. Compare each percentage against a defined threshold.\n3. Log a warning or send an email/Slack alert if exceeded.\n4. Be scheduled via cron for recurring execution (e.g., every 15 minutes).\n\nKey Considerations:\n• Exclude pseudo-filesystems (tmpfs, devtmpfs) from the check.\n• Use -P flag with df for POSIX-compliant output (no line wrapping).\n• Log results with timestamps to a file for audit purposes.\n• In production, integrate with monitoring stacks (Nagios, Prometheus node_exporter).",
    command: "#!/bin/bash\n# disk_monitor.sh — Alert when disk usage exceeds threshold\n\nTHRESHOLD=85\nLOG=\"/var/log/disk_monitor.log\"\nADMIN=\"admin@company.com\"\n\necho \"--- Disk Check: \\$(date) ---\" >> \"\\$LOG\"\n\ndf -HP | grep -vE '^Filesystem|tmpfs|devtmpfs' | awk '{print \\$5 \" \" \\$6}' | while read output; do\n  usep=\\$(echo \"\\$output\" | awk '{print \\$1}' | tr -d '%')\n  partition=\\$(echo \"\\$output\" | awk '{print \\$2}')\n\n  if [ \"\\$usep\" -ge \"\\$THRESHOLD\" ]; then\n    msg=\"WARNING: \\$partition is at \\${usep}% on \\$(hostname)\"\n    echo \"\\$msg\" >> \"\\$LOG\"\n  fi\ndone"
  },
  {
    id: 21,
    title: "AWS RDS Multi-AZ vs Read Replicas Comparison",
    category: "aws",
    difficulty: "medium",
    answer: "Multi-AZ Deployment:\n• Purpose: High availability and disaster recovery.\n• Replication: Synchronous — every write to the primary is replicated to the standby before acknowledgement.\n• Failover: Automatic — AWS updates the DNS endpoint (CNAME) to point to the standby. Typically completes in 60–120 seconds.\n• Standby is NOT accessible for reads.\n\nRead Replicas:\n• Purpose: Horizontal read scaling.\n• Replication: Asynchronous — there is a small replication lag.\n• Failover: Manual — you must explicitly promote a replica to become a standalone primary.\n• Replicas ARE accessible for read queries.\n\nCan you combine both? Yes.\n• A Multi-AZ primary can have Read Replicas.\n• Read Replicas themselves can be Multi-AZ.",
    command: "# Create a Multi-AZ RDS instance\naws rds create-db-instance \\\n  --db-instance-identifier prod-primary \\\n  --engine oracle-ee \\\n  --db-instance-class db.r6i.xlarge \\\n  --multi-az \\\n  --allocated-storage 200\n\n# Create a Read Replica from the primary\naws rds create-db-instance-read-replica \\\n  --db-instance-identifier prod-read-1 \\\n  --source-db-instance-identifier prod-primary"
  },
  {
    id: 22,
    title: "Linux LVM Disk Expansion on a Live System",
    category: "linux",
    difficulty: "medium",
    answer: "Logical Volume Manager (LVM) allows dynamic resizing of partitions without downtime.\n\nLVM Architecture:\n• Physical Volume (PV) — a raw disk or partition (/dev/sdb).\n• Volume Group (VG) — a pool of one or more PVs.\n• Logical Volume (LV) — a virtual partition carved from the VG.\n\nExpansion Steps (Online):\n1. Add a new disk or expand the existing one (e.g., in a VM or cloud instance).\n2. Create a Physical Volume on the new disk.\n3. Extend the Volume Group to include the new PV.\n4. Extend the Logical Volume.\n5. Resize the filesystem (ext4 or xfs) online — no unmount needed.\n\nThis is fully online for ext4 (resize2fs) and xfs (xfs_growfs).",
    command: "# 1. Create a Physical Volume\nsudo pvcreate /dev/sdc\n\n# 2. Extend the Volume Group\nsudo vgextend vg_data /dev/sdc\n\n# 3. Extend the Logical Volume (use 100% of free space)\nsudo lvextend -l +100%FREE /dev/vg_data/lv_app\n\n# 4. Resize ext4 filesystem (online)\nsudo resize2fs /dev/vg_data/lv_app"
  },
  {
    id: 23,
    title: "Write a Multi-Stage Dockerfile for a Production App",
    category: "devops",
    difficulty: "medium",
    answer: "Multi-stage builds use multiple FROM statements in a single Dockerfile. Each stage can use a different base image.\n\nBenefits:\n• The final image contains only production artifacts — no compilers, source code, or dev dependencies.\n• Dramatically smaller image size (often 10–50x reduction).\n• Improved security — fewer packages = smaller attack surface.\n\nTypical Pattern:\n1. Stage 1 (builder): Use a full Node/Java/Go image, install dependencies, compile/build.\n2. Stage 2 (runner): Use a minimal image (alpine, distroless, nginx:alpine), copy only the built output.\n\nBest Practices:\n• Use .dockerignore to exclude node_modules, .git, etc.\n• Pin specific image versions (node:20-alpine, not node:latest).\n• Run as a non-root user in the final image.",
    command: "# Stage 1: Build\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production=false\nCOPY . .\nRUN npm run build\n\n# Stage 2: Serve with Nginx\nFROM nginx:1.25-alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]"
  },
  {
    id: 24,
    title: "Configuring Oracle RMAN Incremental Level 1 Backups",
    category: "oracle dba",
    difficulty: "medium",
    answer: "RMAN incremental backups capture only the data blocks that have changed since a previous backup, significantly reducing backup time and storage.\n\nBackup Levels:\n• Level 0 — full backup of all data blocks. This is the baseline.\n• Level 1 Differential — backs up blocks changed since the last Level 0 OR Level 1.\n• Level 1 Cumulative — backs up all blocks changed since the last Level 0 only.\n\nCumulative vs Differential:\n• Cumulative backups are larger but recovery is faster (only needs Level 0 + latest Level 1).\n• Differential backups are smaller but recovery requires applying each Level 1 in sequence.\n\nBest Practice:\n• Take a Level 0 weekly (e.g., Sunday).\n• Take Level 1 Cumulative daily.\n• Enable Block Change Tracking (BCT) for faster incremental detection.",
    command: "# Connect to RMAN\nrman target /\n\n# Enable Block Change Tracking for faster incrementals\nRMAN> ALTER DATABASE ENABLE BLOCK CHANGE TRACKING USING FILE '/u01/app/oracle/bct/bct.chg';\n\n# Level 0 baseline (run weekly)\nRMAN> BACKUP INCREMENTAL LEVEL 0 DATABASE TAG 'weekly_full';\n\n# Level 1 cumulative (run daily)\nRMAN> BACKUP INCREMENTAL LEVEL 1 CUMULATIVE DATABASE TAG 'daily_cumul';"
  },
  {
    id: 25,
    title: "Managing Oracle Alert Logs and Trace Files",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Oracle diagnostic files are stored in the Automatic Diagnostic Repository (ADR).\n\nKey Concepts:\n• ADR Base: Directory where diag files are stored (configured by DIAGNOSTIC_DEST).\n• ADR Home: Specific subdirectory for a database instance (e.g., diag/rdbms/orcl/orcl).\n• Alert Log: A chronological log tracking critical errors, startups, shutdowns, tablespace fills, and checkpoint details.\n• ADRCI: Command-line tool to manage trace files, view alert logs, and package incident data for Oracle Support.",
    command: "# View last 50 lines of alert log using ADRCI\nadrci -execute \"show alert -tail 50\"\n\n# List trace files older than 10 days\nadrci -execute \"show tracefile -age 14400\"\n\n# Clean up trace files older than 30 days (43200 minutes)\nadrci -execute \"purge -age 43200 -type TRACE\""
  },
  {
    id: 26,
    title: "How to troubleshoot ORA-01555 (Snapshot Too Old)?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The ORA-01555 error occurs when a long-running query needs to read historical data block images to maintain read consistency, but those images have been overwritten in the Undo tablespace.\n\nCauses:\n1. Undo tablespace is too small.\n2. UNDO_RETENTION parameter is set too low.\n3. Massive commits are happening concurrently with the read query (committing inside loops).\n\nSolutions:\n• Increase the size of the Undo Tablespace or set datafiles to AUTOEXTEND.\n• Increase the UNDO_RETENTION parameter.\n• Optimize the long-running query to execute faster.\n• Avoid frequent, small commits in concurrent jobs.",
    command: "-- Check current undo settings\nSHOW PARAMETER undo;\n\n-- Increase undo retention to 12 hours (43200 seconds)\nALTER SYSTEM SET UNDO_RETENTION = 43200 SCOPE=BOTH;\n\n-- Monitor Undo usage and check for unexpired extents\nSELECT status, SUM(bytes)/1024/1024 AS size_mb \nFROM dba_undo_extents \nGROUP BY status;"
  },
  {
    id: 27,
    title: "What is a CTE (Common Table Expression) and how does it compare to Subqueries?",
    category: "sql",
    difficulty: "medium",
    answer: "A Common Table Expression (CTE) is a temporary result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement.\n\nKey Differences:\n• Readability: CTEs are declared at the top of the query using the WITH clause. This modularizes complex query logic, making it easier to read than nested subqueries.\n• Reusability: A CTE can be referenced multiple times within the same query. In contrast, a subquery must be written out again each time it is used.\n• Recursion: CTEs support recursive queries (using the WITH RECURSIVE syntax), which are required to query hierarchical data structures like org charts.",
    command: "-- CTE structure with multiple references\nWITH avg_salaries AS (\n  SELECT department_id, AVG(salary) AS avg_sal\n  FROM employees\n  GROUP BY department_id\n)\nSELECT e.employee_id, e.first_name, e.salary, a.avg_sal\nFROM employees e\nJOIN avg_salaries a ON e.department_id = a.department_id\nWHERE e.salary > a.avg_sal;"
  },
  {
    id: 28,
    title: "How to configure cron jobs for scheduled DB backups?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Cron is a daemon that runs scheduled tasks in Unix-like systems. Cron jobs are configured in a crontab file using a 5-field syntax representing minute, hour, day of month, month, and day of week.\n\nKey rules for DB backups in cron:\n• Always use absolute file paths for commands and scripts.\n• Cron runs with a minimal environment. You must explicitly source profile files (like .bash_profile) or export environment variables (ORACLE_HOME, PATH) inside the script.\n• Redirect standard output and error to log files.",
    command: "# View cron jobs for current user\ncrontab -l\n\n# Edit cron jobs\ncrontab -e\n\n# Example cron entry: Run backup script every day at 1:30 AM\n# Min Hour Dom Mon Dow Command\n30 01 * * * /u01/app/oracle/scripts/backup.sh >> /u01/app/oracle/logs/backup.log 2>&1"
  },
  {
    id: 29,
    title: "Difference between Hard Parsing and Soft Parsing in Oracle",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Oracle processes SQL statements by checking the Shared Pool for existing execution plans.\n\nKey Differences:\n• Hard Parse: Occurs when a query is not in the Shared Pool. Oracle must compile the query, validate objects, check privileges, run the optimizer, and generate a new plan. This is CPU-intensive and requires latch/mutex locks.\n• Soft Parse: Occurs when a matching query is found in the Shared Pool. Oracle skips optimization and reuses the existing plan, which is much faster.\n\nOptimization:\n• Use bind variables (e.g. WHERE id = :id) rather than literals (WHERE id = 5) so queries share execution plans.",
    command: "-- Check parse ratios in your instance\nSELECT name, value \nFROM v$sysstat \nWHERE name IN ('parse count (hard)', 'parse count (total)', 'execute count');\n\n-- Calculate ratio: (total - hard) / total * 100"
  },
  {
    id: 30,
    title: "Explain VPC Peering vs AWS Transit Gateway",
    category: "aws",
    difficulty: "medium",
    answer: "• VPC Peering: A direct network connection between two VPCs. Routing is point-to-point. It is cost-effective (no active gateway fee, only data transfer fees) and offers very low latency. However, it does not support transitive routing (if A is peered to B, and B to C, A cannot talk to C without a direct peer). The network complexity grows exponentially: N*(N-1)/2 connections.\n• AWS Transit Gateway (TGW): Acts as a cloud router. VPCs attach to the TGW in a hub-and-spoke model. It simplifies network architecture, supports transitive routing, and acts as a central checkpoint. However, it charges an hourly port attachment fee plus data processing fees.",
    command: "# List active VPC peering connections\naws ec2 describe-vpc-peering-connections\n\n# Describe Transit Gateways in your region\naws ec2 describe-transit-gateways"
  },
  {
    id: 31,
    title: "Oracle RAC Architecture & Cache Fusion Mechanics",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Oracle Real Application Clusters (RAC) allows multiple compute nodes to access a single shared database simultaneously.\n\nArchitecture:\n• All nodes share the same storage (ASM disk groups or shared file system).\n• Grid Infrastructure (GI) manages cluster membership, VIPs, and SCAN listeners.\n• Each node runs its own instance with its own SGA and PGA.\n\nCache Fusion:\nWhen Node A needs a data block that resides in Node B's buffer cache, the transfer happens over the private interconnect without writing to disk.\n\n1. Node A sends a block request to the Global Resource Directory (GRD).\n2. GRD identifies Node B as the master/holder of that resource.\n3. Node B ships the block directly to Node A's buffer cache via the interconnect.\n\nThis is managed by:\n• GCS (Global Cache Service) — handles data block transfers.\n• GES (Global Enqueue Service) — handles lock and enqueue coordination.",
    command: "-- Verify active RAC instances\nSELECT inst_id, instance_name, host_name, status FROM gv$instance;\n\n-- Monitor interconnect performance\nSELECT inst_id, name, ip_address, is_public FROM gv$cluster_interconnects;\n\n-- Check Cache Fusion wait events\nSELECT event, total_waits, time_waited_micro/1000000 AS secs\nFROM gv$system_event WHERE event LIKE 'gc%' ORDER BY time_waited_micro DESC;"
  },
  {
    id: 32,
    title: "Autobackup Control File Recovery using RMAN",
    category: "oracle dba",
    difficulty: "hard",
    answer: "When all control files are lost (e.g., storage corruption), the database cannot mount because it cannot locate datafiles or redo logs.\n\nRecovery Procedure:\n1. Startup NOMOUNT — starts only the instance (SGA + background processes).\n2. Set DBID — required when restoring without a recovery catalog so RMAN can locate the autobackup files.\n3. Restore controlfile from autobackup — RMAN searches the configured autobackup location.\n4. Mount database — now the control file knows where all datafiles and redo logs are.\n5. Recover database — applies archived/redo logs to bring the database forward.\n6. Open with RESETLOGS — creates new redo log incarnation and opens the database.\n\nPrerequisites:\n• CONTROLFILE AUTOBACKUP must have been enabled before the failure.\n• The Flash Recovery Area (FRA) or autobackup format path must be accessible.",
    command: "# Connect to RMAN\nrman target /\n\n# Step 1: Start in NOMOUNT\nRMAN> STARTUP FORCE NOMOUNT;\n\n# Step 2: Set DBID (find it from alert log or previous backups)\nRMAN> SET DBID 1489201932;\n\n# Step 3: Restore control file\nRMAN> RESTORE CONTROLFILE FROM AUTOBACKUP;\n\n# Step 4: Mount and recover\nRMAN> ALTER DATABASE MOUNT;\nRMAN> RECOVER DATABASE;\n\n# Step 5: Open with RESETLOGS\nRMAN> ALTER DATABASE OPEN RESETLOGS;"
  },
  {
    id: 33,
    title: "Optimize SQL Queries with Nested Joins and Indexes",
    category: "sql",
    difficulty: "hard",
    answer: "When a query performs full table scans on millions of rows with nested loop joins, optimization starts with understanding the execution plan.\n\nOptimization Strategy:\n1. Run EXPLAIN ANALYZE to see actual row counts vs. estimates.\n2. Identify sequential scans — add B-Tree indexes on filter and join columns.\n3. Replace correlated subqueries with JOINs or CTEs where possible.\n4. Use composite indexes that match multi-column WHERE clauses (leftmost prefix rule).\n5. For large result sets, Hash Joins outperform Nested Loops — the optimizer picks this when both sides are large.\n\nPagination:\n• Avoid OFFSET-based pagination on large tables (LIMIT 1000000, 10 scans 1M rows).\n• Use keyset/cursor pagination: WHERE id > :last_id ORDER BY id LIMIT 10.",
    command: "-- Analyze the execution plan\nEXPLAIN ANALYZE\nSELECT e.employee_id, e.first_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nWHERE e.salary > 75000 AND e.hire_date > '2020-01-01';\n\n-- Create a composite index matching the WHERE clause\nCREATE INDEX idx_emp_salary_hire ON employees(salary, hire_date);\n\n-- Keyset pagination example\nSELECT * FROM employees\nWHERE id > 50000 ORDER BY id LIMIT 20;"
  },
  {
    id: 34,
    title: "Deploy Stateful Apps on Kubernetes with AWS EBS Volumes",
    category: "devops",
    difficulty: "hard",
    answer: "Stateful applications (databases, message queues) need persistent storage that survives pod restarts and rescheduling.\n\nKubernetes Persistent Storage Model:\n1. StorageClass — defines the provisioner (e.g., ebs.csi.aws.com) and volume parameters.\n2. PersistentVolumeClaim (PVC) — a request for storage from a StorageClass.\n3. Pod/StatefulSet — mounts the PVC as a volume.\n\nAWS EBS Specifics:\n• EBS volumes are Availability Zone (AZ) scoped — pods must schedule in the same AZ.\n• Use volumeBindingMode: WaitForFirstConsumer to defer provisioning until the pod is scheduled.\n• EBS supports ReadWriteOnce only (single node mount).\n• For multi-AZ, consider EFS (Elastic File System) which supports ReadWriteMany.",
    command: "# StorageClass for AWS EBS CSI driver\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: ebs-gp3\nprovisioner: ebs.csi.aws.com\nparameters:\n  type: gp3\n  fsType: ext4\nvolumeBindingMode: WaitForFirstConsumer\nreclaimPolicy: Retain\n\n# PersistentVolumeClaim\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: app-data-pvc\nspec:\n  accessModes: [ReadWriteOnce]\n  storageClassName: ebs-gp3\n  resources:\n    requests:\n      storage: 50Gi"
  },
  {
    id: 35,
    title: "Tuning Oracle DB Keep and Recycle Buffer Pools",
    category: "oracle dba",
    difficulty: "hard",
    answer: "By default, all objects are read into the DEFAULT buffer pool. To optimize database block retention:\n• KEEP Buffer Pool: Holds blocks of tables/indexes that are frequently accessed. The goal is to keep these blocks in memory permanently, avoiding disk reads.\n• RECYCLE Buffer Pool: Used for blocks of large tables that are read rarely or in full scans. Blocks are aged out immediately, preventing them from flushing out critical blocks in the DEFAULT pool.\n\nSteps:\n1. Monitor cache hit ratios for objects.\n2. Allocate memory to KEEP and RECYCLE pools using db_keep_cache_size and db_recycle_cache_size.\n3. Alter target tables to associate them with the desired pool.",
    command: "-- Check current allocations\nSHOW PARAMETER cache_size;\n\n-- Allocate sizes to Keep and Recycle pools (SGA dynamic adjustment)\nALTER SYSTEM SET db_keep_cache_size = 512M SCOPE=BOTH;\nALTER SYSTEM SET db_recycle_cache_size = 256M SCOPE=BOTH;\n\n-- Assign a lookup table to the KEEP pool\nALTER TABLE lookup_zipcodes STORAGE (BUFFER_POOL KEEP);\n\n-- Assign a history log table to the RECYCLE pool\nALTER TABLE audit_log STORAGE (BUFFER_POOL RECYCLE);"
  },
  {
    id: 36,
    title: "Oracle RAC OCR and Voting Disk Recovery",
    category: "oracle dba",
    difficulty: "hard",
    answer: "The Oracle Cluster Registry (OCR) and Voting Disks are key files for Oracle Grid Infrastructure.\n• OCR: Stores cluster configuration data.\n• Voting Disk: Manages cluster node membership and heartbeat details.\n\nIf these are lost or corrupted, the cluster will fail to start.\n\nRecovery Steps:\n1. Start Grid Infrastructure in exclusive mode on one node (prevents join attempts).\n2. Restore OCR from auto-backup (Grid Infrastructure takes automatic backups of OCR).\n3. Recreate the voting disks in the ASM disk group using crsctl.\n4. Stop exclusive cluster mode and restart clusterware on all nodes.",
    command: "# Connect as grid user\n# Start CRS in exclusive mode (no voting disks needed)\nsudo crsctl start crs -excl -nocrs\n\n# Restore OCR from automatic backup\nocrconfig -restore /u01/app/grid/cdata/mycluster/backup_xx.ocr\n\n# Recreate Voting Disks in ASM disk group\ncrsctl replace votedisk +VOTE\n\n# Restart CRS normally\nsudo crsctl stop crs -f\nsudo crsctl start crs"
  },
  {
    id: 37,
    title: "Designing a 3-Tier Multi-Region VPC in AWS",
    category: "aws",
    difficulty: "hard",
    answer: "A secure enterprise 3-tier VPC architecture isolates database resources completely from the public internet.\n\nLayers:\n1. Public Web Tier: Hosts ALB (Application Load Balancer) and NAT Gateways. Routes external requests to the App tier.\n2. Private App Tier: Hosts EC2 auto-scaling groups running applications. Connects to databases in the DB tier.\n3. Isolated DB Tier: No internet route. Hosts RDS/Aurora databases. Allows inbound access only from the App tier.\n\nMulti-Region Strategy:\n• Set up secondary VPC in target region.\n• Create VPC Peering or Transit Gateway between regions.\n• Configure Route 53 latency or failover routing.\n• Use cross-region RDS read replicas for disaster recovery.",
    command: "# Associate route tables with private subnets\naws ec2 associate-route-table --route-table-id rtb-private1 --subnet-id subnet-app-1a\n\n# Create a DB Subnet Group across multiple AZs\naws rds create-db-subnet-group \\\n  --db-subnet-group-name db-private-group \\\n  --db-subnet-group-description \"Private DB Subnets\" \\\n  --subnet-ids subnet-db-1a subnet-db-1b"
  },
  {
    id: 38,
    title: "Linux Kernel Parameter Tuning for high load Oracle DBs",
    category: "linux",
    difficulty: "hard",
    answer: "High-performance databases require adjustments to kernel limits to prevent resource starvation, lock failures, and swap issues.\n\nKey Parameters in sysctl.conf:\n• fs.file-max: Sets maximum system-wide open file handles (databases open thousands of files).\n• kernel.sem: Configures semaphores (SEMMSL, SEMMNS, SEMOPM, SEMMNI) for inter-process communication.\n• kernel.shmmax & kernel.shmall: Sets maximum shared memory segment size (must be large enough to hold the Oracle SGA in memory).\n• vm.max_map_count: Adjusts virtual memory map count to prevent memory allocation failures under high session counts.",
    command: "# Add configuration to /etc/sysctl.conf\ncat <<EOF | sudo tee -a /etc/sysctl.conf\nfs.file-max = 6815744\nkernel.sem = 250 32000 100 128\nkernel.shmmax = 4294967296\nkernel.shmall = 1048576\nkernel.shmmni = 4096\nvm.max_map_count = 655360\nEOF\n\n# Reload sysctl configurations live\nsudo sysctl -p"
  },
  {
    id: 39,
    title: "Troubleshooting Oracle Mutex/Latch Contention",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Latches and Mutexes are internal database locks that protect shared memory structures (SGA) from concurrent modification.\n\nCommon Wait Events:\n• library cache: mutex X / latch: wait events in SQL parsing. Often caused by high parse rates due to missing bind variables.\n• row cache objects: Contention in data dictionary access (e.g. sequences, user validations).\n• cache buffers chains: Occurs when multiple sessions compete for access to the same database block in the buffer cache (hot block).\n\nResolution:\n1. Trace ASH (Active Session History) or run an AWR report.\n2. Match sql_id to wait events.\n3. For hot blocks, split indexes, distribute tables, or reduce concurrent executions.",
    command: "-- Query Active Session History for current latch waits\nSELECT event, count(*)\nFROM v$active_session_history\nWHERE wait_class <> 'Idle' AND sample_time > sysdate - 1/24\nGROUP BY event\nORDER BY count(*) DESC;\n\n-- Identify hot block objects causing cache buffer chains waits\nSELECT o.owner, o.object_name, o.object_type\nFROM dba_objects o\nJOIN v$session_wait w ON w.p1raw = o.object_id\nWHERE w.event = 'latch: cache buffers chains';"
  },
  {
    id: 40,
    title: "Advanced Shell Scripting: Implementing lockfiles to prevent concurrent runs",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Database maintenance scripts (backups, cleanup, synchronization) must never run concurrently. If a second cron trigger starts before the first script run completes, it can cause index locks, CPU spikes, or corrupted backups.\n\nLocking Strategy (flock):\n• Use the system flock tool to acquire an exclusive lock on a file.\n• Wrap the lock in a shell trap to guarantee lock release when the script exits, crashes, or receives a terminate signal.",
    command: "#!/bin/bash\n# rman_backup_wrapper.sh\nLOCKFILE=\"/var/run/rman_backup.lock\"\n\n# Try to acquire exclusive lock on file descriptor 9. Exit if lock in use.\nexec 9>\"\\$LOCKFILE\"\nflock -n 9 || {\n  echo \"ERROR: Backup job is already running.\" >&2\n  exit 1\n}\n\n# Trap exits to release lock cleanly\ntrap 'rm -f \"\\$LOCKFILE\"' EXIT\n\n# Run the RMAN backup\necho \"Lock acquired. Running backup...\"\nrman target / cmdfile=/opt/scripts/backup.rcv"
  },
  {
    id: 41,
    title: "SQL Optimization: Row Store vs Column Store execution plans",
    category: "sql",
    difficulty: "hard",
    answer: "Traditional Relational Databases use **Row Store** (transactional/OLTP), while Data Warehouses use **Column Store** (analytical/OLAP).\n\nRow Store:\n• Stores entire rows contiguously in block files. Highly efficient for single-row lookups (e.g., SELECT * FROM users WHERE id = 1).\n• Terrible for aggregates (e.g., SUM(salary)) because the engine must read every column of every row in the block, wasting disk I/O.\n\nColumn Store:\n• Stores every column value contiguously in its own block structure. Extremely efficient for scanning and aggregating single columns.\n• Terrible for wide transactional writes because updating a row requires writing to multiple distinct disk blocks (causes massive locking).",
    command: "-- Row store query (scans contiguous blocks; index scan matches ID)\nSELECT * FROM users WHERE user_id = 14023;\n\n-- Column store equivalent (Oracle In-Memory Option / redshift)\n-- Scans only the 'salary' column blocks, applying compression optimization\nSELECT SUM(salary) FROM employees;"
  },
  {
    id: 42,
    title: "Implementing GitOps CI/CD pipelines with ArgoCD and Kubernetes",
    category: "devops",
    difficulty: "hard",
    answer: "GitOps is a practice where Git is the single source of truth for declarative infrastructure and applications.\n\nMechanics:\n1. Code & manifests are committed to Git.\n2. ArgoCD runs as an agent inside the Kubernetes cluster.\n3. ArgoCD monitors the Git repository and compares it against the active state of resources running in the cluster.\n4. If Git differs from the cluster, ArgoCD flags \"OutOfSync\" and triggers a reconciliation loop to apply the Git state directly to the cluster (auto-sync).",
    command: "# Install ArgoCD namespace and manifests\nkubectl create namespace argocd\nkubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml\n\n# Register Git repo and deploy app via ArgoCD CLI\nargocd app create oracle-infra-app \\\n  --repo https://github.com/myorg/k8s-manifests.git \\\n  --path db-deployments \\\n  --dest-server https://kubernetes.default.svc \\\n  --dest-namespace databases \\\n  --sync-policy auto"
  },
  {
    id: 43,
    title: "Migrating an On-Premise 10TB Oracle DB to AWS RDS using Datapump & S3",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Migrating a large database requires planning to minimize cutover downtime.\n\nStrategy (Data Pump + S3 Integration):\n1. Create a logical schema dump using expdp with compression and parallel options.\n2. Upload the dump files to an S3 bucket (or AWS Snowball for massive sizes).\n3. Integrate the target RDS instance with the S3 bucket using the AWS_S3 option group.\n4. Download the dump files from S3 to the RDS local DATA_PUMP_DIR.\n5. Import the dump files using impdp.",
    command: "# Step 1: On-prem export using parallelism\nexpdp system/passwd@prod directory=EXPORT_DIR dumpfile=prod_exp_%u.dmp logfile=prod_exp.log parallel=8 compression=ALL\n\n# Step 2: Upload to S3\naws s3 cp /db/export/ s3://db-migration-bucket/dumps/ --recursive\n\n# Step 3: RDS PL/SQL command to download dump files from S3\nSELECT rdsadmin.rdsadmin_s3_tasks.download_from_s3(\n  p_bucket_name => 'db-migration-bucket',\n  p_directory_name => 'DATA_PUMP_DIR',\n  p_s3_prefix => 'dumps/'\n) AS task_id FROM dual;"
  },
  {
    id: 44,
    title: "Troubleshooting Linux OOM Killer for databases",
    category: "linux",
    difficulty: "hard",
    answer: "The Linux Out-Of-Memory (OOM) Killer is an operating system mechanism that terminates processes to free up RAM when physical memory and swap are completely exhausted.\n\nWhy databases get targeted:\n• Database servers hold a large footprint (SGA/PGA or Buffer Pools). The OOM algorithm selects processes based on their oom_score, which favors killing high-memory, long-running processes.\n\nPrevention:\n1. Configure HugePages: Locks the database SGA in physical RAM, preventing it from being swapped or targeted by OOM.\n2. Set vm.overcommit_memory = 2: Prevents the OS from committing more memory than physically available.\n3. Adjust the oom_score_adj parameter for the database PID (-1000 protects it from OOM completely).",
    command: "# Check OS logs for OOM killer executions\ngrep -i -E 'oom|kill' /var/log/messages\n\n# Adjust oom_score_adj for database process (PID 14205)\necho -1000 | sudo tee /proc/14205/oom_score_adj\n\n# Check current HugePages settings\ngrep Huge /proc/meminfo"
  },
  {
    id: 45,
    title: "Oracle ASM Metadata Corruption Recovery",
    category: "oracle dba",
    difficulty: "hard",
    answer: "ASM metadata corruption prevents disk groups from mounting, locking database access to all datafiles.\n\nRecovery Strategy:\n1. Backup ASM metadata periodically using the md_backup command.\n2. If a disk group fails to mount due to block header corruption, run AMDU (ASM Metadata Dump Utility) to extract datafiles directly from the unmounted disk group.\n3. Use KFED (Kernel Files Editor) to read, check, and repair corrupted block headers on individual ASM disks.",
    command: "# Backup ASM metadata (run daily/weekly)\nasmcmd md_backup /opt/backups/asm_meta.bak\n\n# Run KFED to check block header of a disk\nkfed read /dev/oracleasm/disks/DISK01 | grep kfbh\n\n# Extract datafiles from unmounted corrupted disk group (+DATA)\namdu -diskstring '/dev/oracleasm/disks/*' -extract DATA.256 -output /tmp/datafile_extract.dbf"
  },
  {
    id: 46,
    title: "Designing Zero Downtime Schema Migrations in SQL",
    category: "sql",
    difficulty: "hard",
    answer: "Applying schema migrations directly (like ALTER TABLE ADD COLUMN default_val) locks tables on large datasets, causing application downtime.\n\nZero Downtime Pattern:\n1. Add Column (Nullable): Add the column without constraints or default values. This is a metadata-only change that takes milliseconds.\n2. Write Code (Dual-Write): Update the application code to write to both the old columns and the new column, but read only from the old column.\n3. Backfill Data: Run a background batch script to update historical records in small batches to avoid lock escalation.\n4. Deploy Read Code: Update the application to read from the new column.\n5. Deprecate Old Column: Remove any dual-write code and drop the old column asynchronously.",
    command: "-- Step 1: Add new column as nullable (instant operation)\nALTER TABLE transactions ADD column_v2 VARCHAR(100);\n\n-- Step 3: Backfill data in small batches to prevent table locks\nUPDATE transactions \nSET column_v2 = old_column \nWHERE id BETWEEN 1 AND 1000;\n-- COMMIT; repeat for next 1000 rows"
  },
  {
    id: 47,
    title: "Docker Network Driver Mechanics: Bridge vs Host vs Overlay",
    category: "devops",
    difficulty: "hard",
    answer: "Docker uses network drivers to provide communication paths for containers.\n\nDrivers:\n• bridge (Default): Creates a private virtual bridge interface on the host (e.g. docker0). Containers get local IPs and communicate with the outside world via NAT. Good for isolation but introduces translation overhead.\n• host: Disables isolation between the container and host. The container shares the host's IP and network interface directly. Offers maximum performance and port mapping efficiency, but has port conflict risks.\n• overlay: Creates a distributed network across multiple Docker daemon hosts. Enables swarm service containers to communicate across nodes without host-routing setup.",
    command: "# Create a custom bridge network with custom subnet\ndocker network create --driver bridge --subnet 192.168.100.0/24 db_isolated_net\n\n# Run container on the host network driver (binds directly to host 8080)\ndocker run -d --name host-web --network host nginx"
  },
  {
    id: 48,
    title: "Setting up AWS RDS IAM Database Authentication",
    category: "aws",
    difficulty: "hard",
    answer: "IAM Database Authentication allows users to connect to RDS database instances using AWS IAM credentials instead of database-managed passwords.\n\nBenefits:\n• Centrally manage access using IAM policies.\n• No database passwords stored in files or secrets managers.\n• Uses temporary security tokens (15-minute lifespan).\n\nSteps:\n1. Enable IAM DB Auth on the RDS instance.\n2. Create a DB user matching the IAM user/role name (using IDENTIFIED EXTERNALLY).\n3. Attach an IAM policy to the user allowing rds-db:connect.\n4. Use the AWS CLI to generate an auth token and connect using that token as the password.",
    command: "# Generate authentication token for RDS PostgreSQL\nPGPASSWORD=$(aws rds generate-db-auth-token \\\n  --hostname my-database.c123456789.us-east-1.rds.amazonaws.com \\\n  --port 5432 \\\n  --username dba_iam_user \\\n  --region us-east-1)\n\n# Connect using the generated token\npsql -h my-database.c123456789.us-east-1.rds.amazonaws.com -U dba_iam_user -d postgres"
  },
  {
    id: 49,
    title: "Troubleshooting high CPU and IO Wait on Linux DB server",
    category: "linux",
    difficulty: "hard",
    answer: "When a database server experiences slowdowns, you must determine if the bottleneck is CPU (processing) or disk/network wait.\n\nDebugging Process:\n1. Run top/htop: Look at %us (user CPU) vs %sy (system kernel overhead) vs %wa (I/O wait).\n2. If %wa is high, run iostat -x 1 5 to inspect disk metrics. Look at %util (disk saturation) and await (average wait time in ms). If await is > 10ms, disks are bottlenecked.\n3. Run iotop to identify which process PID is reading/writing the most data.\n4. Run vmstat to inspect memory swapping (si/so columns). If swapping is active, memory pressure is causing I/O wait.",
    command: "# Check disk IO statistics with extended details every 2 seconds\niostat -xz 2 5\n\n# Check active swap ins (si) and swap outs (so)\nvmstat 1 10\n\n# List top IO consuming processes\nsudo iotop -o -P"
  },
  {
    id: 50,
    title: "Configuring Oracle Data Guard Switchover & Failover via DGMGRL",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Data Guard Broker (DGMGRL) simplifies replication management, role transitions, and monitoring.\n• Switchover: Planned role reversal. Primary becomes Standby, and Standby becomes Primary. Zero data loss.\n• Failover: Unplanned transition. Executed when the primary database is lost or unreachable. May result in data loss unless running in Max Protection mode.\n\nBroker Steps:\n1. Configure the broker configuration on both sides.\n2. Validate the configuration using VALIDATE DATABASE.\n3. Execute the switchover.",
    command: "# Connect to Data Guard Broker\ndgmgrl sys/passwd@prod_primary\n\n# Show current replication configuration\nDGMGRL> SHOW CONFIGURATION;\n\n# Validate primary and standby nodes\nDGMGRL> VALIDATE DATABASE 'prod_primary';\nDGMGRL> VALIDATE DATABASE 'prod_standby';\n\n# Execute planned switchover\nDGMGRL> SWITCHOVER TO 'prod_standby';"
  },
  {
    id: 51,
    title: "How to check database session count and find active sessions?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Monitoring session status is a key task for a DBA to identify connection spikes or hung application pools.\n\nKey Session Views:\n• v$session: Main view showing session details (SID, SERIAL#, status, username, machine, program, sql_id).\n• v$process: Shows OS process details mapped to Oracle server processes.\n\nUnderstanding Session States:\n• ACTIVE: Currently executing a SQL statement.\n• INACTIVE: Connected but idle, waiting for the application to send work.\n• KILLED: Marked to be terminated by the database engine.",
    command: "-- Count sessions by status\nSELECT status, COUNT(*) AS count_sessions\nFROM v$session\nGROUP BY status;\n\n-- Find details of all active user sessions\nSELECT sid, serial#, username, osuser, machine, program, sql_id\nFROM v$session\nWHERE status = 'ACTIVE'\n  AND username IS NOT NULL;"
  },
  {
    id: 52,
    title: "How do you lock and unlock a user account in Oracle?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "User accounts can be locked either manually by an administrator or automatically by Oracle if a user exceeds the maximum allowed failed login attempts defined in their profile.\n\nAdministrative actions:\n• Locking an account immediately prevents new sessions, but does not terminate active sessions.\n• Unlocking an account restores immediate access.",
    command: "-- Lock a user account\nALTER USER hr ACCOUNT LOCK;\n\n-- Unlock a user account\nALTER USER hr ACCOUNT UNLOCK;\n\n-- Force password change at next login along with unlock\nALTER USER hr IDENTIFIED BY \"NewSecurePassword123\" ACCOUNT UNLOCK;"
  },
  {
    id: 53,
    title: "Explain the purpose of the Flashback Recovery Area (FRA)",
    category: "oracle dba",
    difficulty: "easy",
    answer: "The Fast Recovery Area (formerly Flashback Recovery Area) is a centralized disk location managed by Oracle to store recovery-related files.\n\nFiles stored in the FRA:\n• Multiplexed copies of the current control file and active redo log files.\n• Archived redo log files.\n• RMAN backups (datafile copies, backup sets).\n• Flashback logs (used for FLASHBACK DATABASE operations).\n\nKey parameters:\n• DB_RECOVERY_FILE_DEST: Path to the storage directory (or ASM disk group).\n• DB_RECOVERY_FILE_DEST_SIZE: Hard storage limit. Oracle manages retention and automatically purges obsolete files when space pressure occurs.",
    command: "-- Check current FRA configuration parameters\nSHOW PARAMETER db_recovery_file_dest;\n\n-- Monitor space utilization in the recovery area\nSELECT name, space_limit/1024/1024/1024 AS limit_gb,\n       space_used/1024/1024/1024 AS used_gb,\n       space_reclaimable/1024/1024/1024 AS reclaimable_gb,\n       number_of_files\nFROM v$recovery_file_dest;\n\n-- Query space percentage usage by file type\nSELECT * FROM v$recovery_area_usage;"
  },
  {
    id: 54,
    title: "How to check Oracle database open mode and log mode?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "A DBA must verify the operating state and archiving status of the database after instance startup or maintenance.\n\nOpen Modes:\n• MOUNTED: Control files read, datafiles closed. Used for recovery operations.\n• READ WRITE: Normal production mode. Fully accessible.\n• READ ONLY: Read-only access (often standby databases or reporting instances).\n\nLog Modes:\n• ARCHIVELOG: Redo logs are archived before reuse. Enables hot backups and point-in-time recovery.\n• NOARCHIVELOG: Redo logs are overwritten. Risk of data loss since last cold backup.",
    command: "-- Verify open mode, database role and database log mode\nSELECT name, open_mode, log_mode, database_role FROM v$database;\n\n-- SQL*Plus quick command\nARCHIVE LOG LIST;"
  },
  {
    id: 55,
    title: "What is the difference between TRUNCATE and DELETE in Oracle SQL?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Although both commands remove rows from a table, they behave differently under the hood:\n\nDELETE (DML):\n• Generates undo data. Can be rolled back before committing.\n• Fires row-level and table-level triggers.\n• Does not reset the High-Water Mark (HWM) of the table, meaning subsequent scans still read empty space.\n• Requires row-level locks, causing performance degradation on large datasets.\n\nTRUNCATE (DDL):\n• Does not generate undo. Cannot be rolled back (implicit commit).\n• Does not fire triggers.\n• Resets the High-Water Mark (HWM), freeing up disk extents back to the tablespace.\n• Locks the table exclusively, but completes almost instantly.",
    command: "-- DELETE: Deletes specific rows, generates undo, can be rolled back\nDELETE FROM log_records WHERE log_date < SYSDATE - 90;\nROLLBACK; -- Undo changes\n\n-- TRUNCATE: Instantly clears the entire table, resets storage\nTRUNCATE TABLE temp_log_stage;"
  },
  {
    id: 56,
    title: "How to find the size of a specific table in Oracle?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "To find the physical storage footprint of a table, query the data dictionary view `dba_segments` or `user_segments`.\n\nKey Concepts:\n• A table segment consists of one or more extents allocated in a tablespace.\n• A segment's size includes both used blocks and empty blocks below the high-water mark.\n• For tables with LOB columns, the LOB segments (`LOBSEGMENT`) are stored separately and must be added to get the true table size.",
    command: "-- Calculate physical size of a table (excluding LOBs)\nSELECT segment_name, tablespace_name, bytes/1024/1024 AS size_mb\nFROM user_segments\nWHERE segment_name = 'EMPLOYEES'\n  AND segment_type IN ('TABLE', 'TABLE PARTITION');\n\n-- Calculate total size including related LOB columns\nSELECT SUM(bytes)/1024/1024 AS total_mb\nFROM user_segments\nWHERE segment_name = 'EMPLOYEES'\n   OR segment_name IN (\n     SELECT segment_name FROM user_lobs WHERE table_name = 'EMPLOYEES'\n   );"
  },
  {
    id: 57,
    title: "How to check if an Oracle listener is running?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "The Listener is a separate operating system process that broker client connections to the Oracle Database instance.\n\nVerification steps:\n• Use the Listener Control utility (`lsnrctl`) from the OS command-line.\n• Run `lsnrctl status` to inspect active services, protocol addresses (IP and port), and log file directories.\n• If inactive, use `lsnrctl start` using the oracle software owner account.",
    command: "# Run these commands in the terminal as the oracle user\n\n# Check listener status\nlsnrctl status\n\n# Start the default listener (named LISTENER)\nlsnrctl start\n\n# Stop the listener\nlsnrctl stop"
  },
  {
    id: 58,
    title: "What are Oracle profiles and how to check user profile settings?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Profiles are set limits on database resources and password policy configurations assigned to database users.\n\nControl Options:\n• Password management: Expiration time, complexity check functions, lock time after failed attempts (`FAILED_LOGIN_ATTEMPTS`).\n• Resource limits: Maximum CPU time per session/call, maximum connect/idle time, session count limit per user.\n• Resource limits are only active if the database parameter `RESOURCE_LIMIT` is set to TRUE.",
    command: "-- Check resource limit parameter status\nSHOW PARAMETER resource_limit;\n\n-- Find profile assigned to a specific user\nSELECT username, profile FROM dba_users WHERE username = 'APP_USER';\n\n-- Check limit parameters of a specific profile\nSELECT resource_name, limit \nFROM dba_profiles \nWHERE profile = 'DEFAULT';"
  },
  {
    id: 59,
    title: "How to view invalid objects in a schema and recompile them?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Objects (views, packages, procedures, triggers) can become INVALID if underlying tables are altered or dropped.\n\nResolution:\n• Identify invalid objects using `dba_objects` status.\n• Recompile objects using individual DDL statements or use the Oracle-supplied package `DBMS_UTILITY` or `UTL_RECOMP` for batch recompilation.",
    command: "-- List invalid objects in the current schema\nSELECT object_name, object_type, last_ddl_time\nFROM user_objects\nWHERE status = 'INVALID';\n\n-- Recompile a specific package body\nALTER PACKAGE hr_salary_pkg COMPILE BODY;\n\n-- Recompile all invalid objects in a schema\nEXEC DBMS_UTILITY.COMPILE_SCHEMA(schema => 'HR', compile_all => FALSE);"
  },
  {
    id: 60,
    title: "What is DBID in Oracle and how to find it?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "The Database Identifier (DBID) is a unique, internally generated 32-bit number that distinguishes an Oracle database from all other databases.\n\nImportance:\n• Required when restoring control files from RMAN autobackups if a recovery catalog is not used.\n• Stored in all datafile headers and backup files.",
    command: "-- Find DBID and DB Name via SQL\nSELECT dbid, name FROM v$database;\n\n-- Find DBID when database is down (inspected from RMAN log or alert log)\n-- Or look at RMAN autobackup filenames which contain the DBID in their names"
  },
  {
    id: 61,
    title: "How to check active directory objects in Oracle database?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Directory objects are logical aliases for physical directories on the host operating system. They are widely used by Oracle Data Pump (expdp/impdp) and file I/O operations (`UTL_FILE`).\n\nDBAs must verify that:\n• The logical directory object is created in the database.\n• The physical path exists on the OS database server.\n• The operating system user `oracle` has read and write permissions on the physical path.\n• The database user has grants to READ or WRITE on the directory object.",
    command: "-- List all directory objects and paths\nSELECT directory_name, directory_path FROM dba_directories;\n\n-- Grant read/write access to a specific database user\nGRANT READ, WRITE ON DIRECTORY data_pump_dir TO app_developer;"
  },
  {
    id: 62,
    title: "How to enable/disable ARCHIVELOG mode in Oracle?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Transitioning to ARCHIVELOG mode enables continuous database archiving, allowing online backups and Point-In-Time recovery.\n\nSteps:\n1. Shutdown the database cleanly.\n2. Start the database in MOUNT mode.\n3. Alter database to ARCHIVELOG mode.\n4. Open the database.\n5. Verify status and ensure archiver background process (ARCn) is active.",
    command: "-- Enable ARCHIVELOG mode\nSHUTDOWN IMMEDIATE;\nSTARTUP MOUNT;\nALTER DATABASE ARCHIVELOG;\nALTER DATABASE OPEN;\n\n-- Verify logging status\nARCHIVE LOG LIST;\n\n-- Disable ARCHIVELOG mode (not recommended for production)\n-- SHUTDOWN IMMEDIATE;\n-- STARTUP MOUNT;\n-- ALTER DATABASE NOARCHIVELOG;\n-- ALTER DATABASE OPEN;"
  },
  {
    id: 63,
    title: "Troubleshooting ORA-00257: Archiver error. Connect internal only, until freed.",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The error ORA-00257 indicates that the Archiver (ARCn) process cannot write redo log files to the archive destination because the storage is completely full. As a result, the database freezes transactions.\n\nDiagnostic Steps:\n1. Check the archiver destination path or FRA space usage.\n2. Inspect the database alert log.\n\nResolution Paths:\n• Route A: Increase the `DB_RECOVERY_FILE_DEST_SIZE` parameter dynamically if disk space is available.\n• Route B: Run RMAN to crosscheck and delete obsolete archive logs to free up space inside the FRA.",
    command: "-- Check space utilization in the recovery area\nSELECT name, space_limit, space_used, space_reclaimable \nFROM v$recovery_file_dest;\n\n-- Dynamically increase FRA size\nALTER SYSTEM SET DB_RECOVERY_FILE_DEST_SIZE = 30G SCOPE=BOTH;\n\n-- Clean up archivelogs using RMAN (freeing up FRA space)\n# rman target /\n# RMAN> CROSSCHECK ARCHIVELOG ALL;\n# RMAN> DELETE EXPIRED ARCHIVELOG ALL;\n# RMAN> DELETE OBSOLETE;"
  },
  {
    id: 64,
    title: "How to identify locks and blocking sessions in Oracle Database?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Locks maintain data consistency, but slow-running transactions or unindexed foreign keys can cause sessions to hang, leading to application timeouts.\n\nDBA task:\n• Find the blocked session and the blocker session.\n• Find the SQL statements they are executing.\n• Decide whether to kill the blocker session to release locks.",
    command: "-- Find blocker and blocked sessions\nSELECT blocking_session AS blocker_sid,\n       sid AS blocked_sid,\n       serial# AS blocked_serial,\n       status, event, seconds_in_wait\nFROM v$session\nWHERE blocking_session IS NOT NULL;\n\n-- Find SQL statement executed by blocker session\nSELECT s.sid, q.sql_text \nFROM v$session s \nJOIN v$sql q ON s.sql_id = q.sql_id \nWHERE s.sid = &blocker_sid;\n\n-- Kill blocking session immediately\nALTER SYSTEM KILL SESSION 'blocker_sid,blocker_serial' IMMEDIATE;"
  },
  {
    id: 65,
    title: "What is Oracle Flashback Database and how to enable it?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Flashback Database is a disaster recovery feature that allows rewinding an entire database to a previous point in time. It is faster than traditional media recovery because it doesn't require restoring datafiles.\n\nMechanics:\n• Writes \"before-images\" of data blocks to flashback logs in the FRA.\n• Rewinds the database using flashback logs, then rolls forward using archived redo logs.\n\nPrerequisites:\n• Database must be in ARCHIVELOG mode.\n• FRA must be configured.\n• Flashback capability must be enabled (database must be mounted).",
    command: "-- Enable Flashback Database\nSHUTDOWN IMMEDIATE;\nSTARTUP MOUNT;\nALTER DATABASE FLASHBACK ON;\nALTER DATABASE OPEN;\n\n-- Verify status\nSELECT flashback_on FROM v$database;\n\n-- Flashback command execution (while database is mounted)\n-- FLASHBACK DATABASE TO TIMESTAMP TO_TIMESTAMP('2026-05-21 08:00:00','YYYY-MM-DD HH24:MI:SS');\n-- FLASHBACK DATABASE TO SCN 4820193;"
  },
  {
    id: 66,
    title: "How to kill long-running active sessions in Oracle?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Active sessions executing buggy SQL statements or unindexed joins can exhaust CPU and connection pools.\n\nVerification:\n• Identify queries running excessively long by evaluating the `LAST_CALL_ET` column in `v$session` (measured in seconds since the session changed state).\n• Verify the SQL ID and resource consumption.",
    command: "-- Find sessions running active queries for more than 30 minutes (1800 seconds)\nSELECT sid, serial#, username, last_call_et AS active_seconds, machine, program, sql_id\nFROM v$session\nWHERE status = 'ACTIVE'\n  AND username IS NOT NULL\n  AND last_call_et > 1800;\n\n-- Kill the problematic session\nALTER SYSTEM KILL SESSION 'sid,serial' IMMEDIATE;"
  },
  {
    id: 67,
    title: "How to rebuild fragmented indexes in Oracle?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Large amounts of DML (inserts, updates, deletes) leave empty spaces in index B-Tree leaves. This index fragmentation wastes space and increases index scan cost.\n\nTuning Strategy:\n• Determine fragmentation level using `ANALYZE INDEX ... VALIDATE STRUCTURE` and checking `pct_used` or deleted leaf rows.\n• Rebuild fragmented indexes. Always use the `ONLINE` keyword in production environments so DML operations can continue on the target table without lock blocks.",
    command: "-- Validate index structure (locks table briefly)\nANALYZE INDEX idx_emp_email VALIDATE STRUCTURE;\n\n-- Query index stats (del_lf_rows_len / lf_rows_len > 20% indicates rebuild required)\nSELECT name, height, lf_rows, del_lf_rows, \n       (del_lf_rows/NULLIF(lf_rows,0))*100 AS pct_deleted_rows\nFROM index_stats;\n\n-- Rebuild index online\nALTER INDEX idx_emp_email REBUILD ONLINE;\n\n-- Rebuild index online to a different tablespace\nALTER INDEX idx_emp_email REBUILD TABLESPACE index_ts ONLINE;"
  },
  {
    id: 68,
    title: "Managing Oracle Database Temp Tablespace Space Issues",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The Temp tablespace stores temporary data used for disk-sorts, hash-joins, and global temporary tables. If it runs out of space, users receive the error `ORA-01652: unable to extend temp segment`.\n\nManagement procedures:\n• Monitor active TEMP segment utilization.\n• Add tempfiles to scale tablespace capacity.\n• Recreate or shrink tempfiles to reclaim disk space after large batch operations.",
    command: "-- Monitor active temporary space allocations\nSELECT tablespace_name, total_blocks*8192/1024/1024 AS total_mb,\n       used_blocks*8192/1024/1024 AS used_mb,\n       free_blocks*8192/1024/1024 AS free_mb\nFROM v$sort_segment;\n\n-- Add a new tempfile with autoextend enabled\nALTER TABLESPACE temp \nADD TEMPFILE '/u01/app/oracle/oradata/orcl/temp02.dbf' SIZE 1G\nAUTOEXTEND ON NEXT 100M MAXSIZE 16G;\n\n-- Shrink temporary tablespace to reclaim host disk space\nALTER TABLESPACE temp SHRINK SPACE;"
  },
  {
    id: 69,
    title: "Explain differences between row-level locks and table-level locks in Oracle",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Oracle Database employs automatic locking to ensure maximum data concurrency.\n\nRow-Level Locks (TX):\n• Acquired automatically when a row is modified by UPDATE, INSERT, DELETE, or SELECT FOR UPDATE.\n• Stored inside the data block header (ITL - Interested Transaction List), meaning there is no memory-based lock escalation. Oracle can support millions of row locks without issues.\n\nTable-Level Locks (TM):\n• Acquired to ensure the table structure is not modified (e.g. dropping a column) while transactions are modifying its data.\n• Different modes: Row Share (RS), Row Exclusive (RX), Share (S), Share Row Exclusive (SRX), Exclusive (X).",
    command: "-- View active DML table locks (TM locks)\nSELECT session_id, object_id, \n       DECODE(locked_mode, 0, 'None', 1, 'Null', 2, 'Row Share', 3, 'Row Exclusive',\n                           4, 'Share', 5, 'Share Row Excl', 6, 'Exclusive') AS lock_mode\nFROM v$locked_object;\n\n-- Query active transaction locks (TX locks)\nSELECT sid, type, id1, id2, lmode, request\nFROM v$lock\nWHERE type = 'TX';"
  },
  {
    id: 70,
    title: "Oracle RAC SCAN (Single Client Access Name) Architecture & DNS Configuration",
    category: "oracle dba",
    difficulty: "hard",
    answer: "SCAN (Single Client Access Name) is a feature in Oracle RAC that provides a single hostname for clients to access any database running in the cluster.\n\nHow it works:\n• SCAN simplifies connection configuration because client connection strings don't need to change when nodes are added or removed from the cluster.\n• The SCAN hostname resolves via DNS to three distinct round-robin IP addresses.\n• Three SCAN listeners run in the cluster (on different nodes) and route connections to local node listeners based on server load.",
    command: "# Check active SCAN config under Grid Infrastructure\nsrvctl config scan\n\n# Query SCAN listener status across all nodes\nsrvctl status scan_listener\n\n# Verify DNS round-robin resolution (should return 3 IP addresses)\nnslookup prod-scan.company.internal"
  },
  {
    id: 71,
    title: "How to perform an Oracle database recovery using RMAN Point-In-Time Recovery (PITR)?",
    category: "oracle dba",
    difficulty: "hard",
    answer: "RMAN Point-in-Time Recovery (PITR) restores the database to an exact point in time before a logical corruption occurred (e.g., a batch script accidentally overwrote data).\n\nSteps:\n1. Mount the database.\n2. Specify the target timestamp, SCN, or restore point.\n3. Restore and recover database files.\n4. Open database using RESETLOGS.",
    command: "# Run recovery commands in RMAN\nrman target /\n\n-- Mount database\nRMAN> STARTUP FORCE MOUNT;\n\n-- Execute Recovery Block\nRMAN> RUN {\n  -- Set target time (make sure NLS_DATE_FORMAT is matched)\n  SET UNTIL TIME \"TO_DATE('2026-05-21 14:00:00','YYYY-MM-DD HH24:MI:SS')\";\n  RESTORE DATABASE;\n  RECOVER DATABASE;\n}\n\n-- Open database resetting redo log sequences\nRMAN> ALTER DATABASE OPEN RESETLOGS;"
  },
  {
    id: 72,
    title: "Resolving Oracle Split-Brain Scenario in RAC (Split Brain Prevention & Fencing)",
    category: "oracle dba",
    difficulty: "hard",
    answer: "A split-brain scenario in RAC occurs when network communication fails between cluster nodes, causing them to believe the other node has crashed.\n\nFencing Mechanics:\n• Nodes write heartbeats to the shared Voting Disks.\n• The node that can write to the majority of voting disks survives.\n• The CSSD daemon evicts/reboots the losing node to prevent write corruption to the shared storage.\n• If network heartbeat fails, the node with the lower node ID usually attempts to evict the other.",
    command: "# Verify active node listings in the cluster\nolsnodes -s -t\n\n# Check voting disk locations and status\ncrsctl query css votedisk\n\n# Inspect cluster log files for eviction events (run as root/grid)\ntail -n 100 /u01/app/grid/diag/crs/\\\\$(hostname)/crs/trace/ocssd.trc"
  },
  {
    id: 73,
    title: "Tuning Oracle SGA Automatic Memory Management (AMM) vs Automatic Shared Memory Management (ASMM)",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Oracle memory management has evolved across versions, requiring configuration tuning under large workloads.\n\nAutomatic Memory Management (AMM):\n• Enabled via `MEMORY_TARGET` and `MEMORY_MAX_TARGET`.\n• Dynamically adjusts both SGA components and PGA size.\n• Critically, AMM cannot be used on Linux systems configured with HugePages (which requires pinning memory regions).\n\nAutomatic Shared Memory Management (ASMM):\n• Enabled via `SGA_TARGET` while `MEMORY_TARGET` is set to 0.\n• Manages buffer cache, shared pool, large pool, and java pool dynamically.\n• Allows static PGA configuration via `PGA_AGGREGATE_TARGET`.\n• Supports HugePages, making it the industry standard for production environments.",
    command: "-- Inspect current memory configuration parameters\nSHOW PARAMETER target;\n\n-- Convert AMM to ASMM + HugePages (Requires SPFILE)\n-- Step 1: Set memory target to 0\nALTER SYSTEM SET memory_target = 0 SCOPE=SPFILE;\nALTER SYSTEM SET memory_max_target = 0 SCOPE=SPFILE;\n\n-- Step 2: Set SGA and PGA targets\nALTER SYSTEM SET sga_target = 16G SCOPE=SPFILE;\nALTER SYSTEM SET sga_max_size = 16G SCOPE=SPFILE;\nALTER SYSTEM SET pga_aggregate_target = 8G SCOPE=SPFILE;\n\n-- Step 3: Restart instance and verify allocations"
  },
  {
    id: 74,
    title: "Troubleshooting Oracle ASM Disk Rebalancing Performance Bottlenecks",
    category: "oracle dba",
    difficulty: "hard",
    answer: "When a new disk is added to or dropped from an ASM disk group, ASM automatically rebalances the data across all disks. If rebalancing is too slow, disks remain unbalanced, risking disk failure bottlenecks. If it is too fast, it generates high I/O wait, causing database transaction lag.\n\nTuning parameters:\n• `ASM_POWER_LIMIT`: Restricts rebalancing bandwidth (values 0-1024). Default is 1.\n• Adjust rebalance power dynamically using `ALTER DISKGROUP` to match off-peak hours.",
    command: "-- Check active ASM rebalance execution details\nSELECT group_number, operation, state, power, actual, sofar, est_work \nFROM v$asm_operation;\n\n-- Increase ASM rebalance power to 11 to speed up completion\nALTER DISKGROUP data REBALANCE POWER 11;\n\n-- Monitor Disk Group space and path status\nSELECT name, state, total_mb, free_mb FROM v$asm_diskgroup;"
  },
  {
    id: 75,
    title: "Recovering from Corrupted Undo Tablespace Blocks in Oracle",
    category: "oracle dba",
    difficulty: "hard",
    answer: "If block corruption occurs in the active Undo tablespace (often due to OS storage faults), the database may crash or fail to open, returning error codes like `ORA-00600 [4194]` or `ORA-00600 [4193]`.\n\nRecovery Steps:\n1. If database is open or can be mounted, create a new temporary undo tablespace.\n2. Alter system to switch active undo tablespace to the new tablespace.\n3. Drop the corrupted undo tablespace including contents and datafiles.\n4. If the database cannot open, use hidden parameter `_corrupted_rollback_segments` only as a last resort under Oracle Support supervision.",
    command: "-- 1. Create a new undo tablespace\nCREATE UNDO TABLESPACE undotbs_new \nDATAFILE '/u01/app/oracle/oradata/orcl/undotbs_new01.dbf' SIZE 4G \nAUTOEXTEND ON NEXT 100M MAXSIZE 32G;\n\n-- 2. Dynamically switch system undo tablespace parameter\nALTER SYSTEM SET undo_tablespace = undotbs_new SCOPE=BOTH;\n\n-- 3. Drop the corrupted tablespace once active transactions clear\nDROP TABLESPACE undotbs1 INCLUDING CONTENTS AND DATAFILES;"
  },
  {
    id: 76,
    title: "Optimizing Oracle SQL Tuning Advisor and SQL Profiles",
    category: "oracle dba",
    difficulty: "hard",
    answer: "When a critical application SQL degrades in production, modifying application code to add hints is often impossible. SQL Profiles can inject optimizer statistics adjustments to stabilize execution plans without source code edits.\n\nProcess:\n1. Identify degraded sql_id.\n2. Run SQL Tuning Advisor to analyze execution history.\n3. Accept recommendations and implement SQL Profile.",
    command: "-- Step 1: Create a Tuning Task for a slow query\nDECLARE\n  l_task_name VARCHAR2(30);\nBEGIN\n  l_task_name := DBMS_SQLTUNE.CREATE_TUNING_TASK(\n                   sql_id      => '8g3k8h1a7x21d',\n                   scope       => 'COMPREHENSIVE',\n                   time_limit  => 60,\n                   task_name   => 'tune_slow_query_task'\n                 );\n  DBMS_SQLTUNE.EXECUTE_TUNING_TASK('tune_slow_query_task');\nEND;\n/\n\n-- Step 2: View Recommendations Report\nSELECT DBMS_SQLTUNE.REPORT_TUNING_TASK('tune_slow_query_task') FROM dual;\n\n-- Step 3: Implement recommended SQL Profile to lock optimal plan\n-- EXEC DBMS_SQLTUNE.ACCEPT_SQL_PROFILE(task_name => 'tune_slow_query_task', replace => TRUE);"
  },
  {
    id: 77,
    title: "Configuring Oracle Multi-tenant (CDB/PDB) Backup and Recovery in RMAN",
    category: "oracle dba",
    difficulty: "hard",
    answer: "In Oracle Multitenant architecture, DBAs must manage backups for the Container Database (CDB) and multiple Pluggable Databases (PDBs).\n\nKey Scenarios:\n• Backup the entire CDB (includes ROOT, SEED, and all PDBs).\n• Backup a specific PDB.\n• Restore a single corrupted PDB while other PDBs remain open and online serving users.",
    command: "# 1. Connect to CDB Root as target\n# rman target /\n\n# Backup CDB database and archive logs\nRMAN> BACKUP DATABASE PLUS ARCHIVELOG;\n\n# Backup specific pluggable database\nRMAN> BACKUP PLUGGABLE DATABASE pdb_sales;\n\n# Restore and recover a single pluggable database without affecting others\nRMAN> ALTER PLUGGABLE DATABASE pdb_sales CLOSE;\n\n# RESTORE PLUGGABLE DATABASE pdb_sales;\n# RECOVER PLUGGABLE DATABASE pdb_sales;\n# ALTER PLUGGABLE DATABASE pdb_sales OPEN;"
  },
  {
    id: 78,
    title: "Tuning Oracle Database Writers (DBWR) and Log Writer (LGWR) I/O issues",
    category: "oracle dba",
    difficulty: "hard",
    answer: "High user workloads can generate database write write event delays, identified by `log file sync` (LGWR bottleneck) or `write complete waits` (DBWR bottleneck).\n\nTuning LGWR:\n• Ensure redo logs are placed on high-speed disk arrays (SSD/NVMe).\n• Set `disk_asynch_io = true` to allow concurrent async writes.\n\nTuning DBWR:\n• Configure multiple DB writer processes using `db_writer_processes` to handle high buffer cache write-backs.\n• Enable asynchronous I/O at the OS level.",
    command: "-- Check asynchronous IO parameter settings\nSHOW PARAMETER disk_asynch_io;\n\n-- View active DBWR processes count\nSHOW PARAMETER db_writer_processes;\n\n-- Increase DBWR processes (requires SPFILE, recommended: 1 per 8 CPU cores)\nALTER SYSTEM SET db_writer_processes = 8 SCOPE=SPFILE;\n\n-- Query system wait events for log writer and database writer latency\nSELECT event, total_waits, time_waited_micro/1000000 AS secs_waited\nFROM v$system_event\nWHERE event IN ('log file sync', 'log file parallel write', 'free buffer waits');"
  },
  {
    id: 79,
    title: "Recovering from Lost Tempfiles and Redo Log File Corruption in Oracle",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Recovery methods differ depending on which physical file type is lost or corrupted:\n\nLost Tempfile:\n• Database will still start up, but operations requiring sorting fail.\n• Fix: Re-add tempfile dynamically online.\n\nCorrupted Redo Log:\n• If log group is INACTIVE: Clear the group.\n• If log group is ACTIVE: Force checkpoint, then clear.\n• If log group is CURRENT: Point-in-Time recovery is required as the data has not been checkpointed or archived.",
    command: "-- Add new tempfile to temp tablespace online\nALTER TABLESPACE temp \nADD TEMPFILE '/u01/app/oracle/oradata/orcl/temp01.dbf' SIZE 2G REUSE;\n\n-- Clear corrupted INACTIVE redo log group (e.g. Group 3)\nALTER DATABASE CLEAR LOGFILE GROUP 3;\n\n-- Clear corrupted unarchived log group\nALTER DATABASE CLEAR UNARCHIVED LOGFILE GROUP 3;"
  },
  {
    id: 80,
    title: "How to troubleshoot ORA-04031: unable to allocate bytes of shared memory",
    category: "oracle dba",
    difficulty: "hard",
    answer: "The error `ORA-04031` occurs when the Shared Pool does not have enough contiguous free memory to allocate a required object (such as a large PL/SQL package or parsed cursor).\n\nCauses:\n• Shared Pool fragmentation: Memory is divided into small free blocks, but no single block is large enough.\n• Application is not using bind variables, leading to thousands of unique SQL cursor allocations.\n\nResolution steps:\n1. Run `ALTER SYSTEM FLUSH SHARED_POOL` as a quick temporary mitigation.\n2. Pin large objects in memory using `DBMS_SHARED_POOL.KEEP`.\n3. Increase Shared Pool size.",
    command: "-- Check shared pool free memory allocations\nSELECT pool, name, bytes/1024/1024 AS size_mb \nFROM v$sgastat \nWHERE pool = 'shared pool' \n  AND name = 'free memory';\n\n-- Flush the shared pool to coalesce memory fragments (releases locks)\nALTER SYSTEM FLUSH SHARED_POOL;\n\n-- Pin a heavy database package into memory\nEXEC DBMS_SHARED_POOL.KEEP('HR.HR_REPORTS_PKG');\n\n-- Dynamically increase shared pool size\nALTER SYSTEM SET shared_pool_size = 3G SCOPE=BOTH;"
  },
  {
    id: 81,
    title: "How to resolve ORA-00060: deadlock detected while waiting for resource",
    category: "oracle dba",
    difficulty: "hard",
    answer: "A deadlock occurs when Session A locks Row 1 and waits for Row 2, while Session B locks Row 2 and waits for Row 1. Oracle automatically detects this condition and terminates/rolls back one of the statements to break the lock cycle.\n\nDBA diagnostic path:\n1. Locate the deadlock trace file in the Diagnostic Dest directory.\n2. Review the trace log to identify the SQL statements and row IDs involved.\n3. Resolve by implementing proper indexing on Foreign Keys (unindexed FKs cause whole-table locks during parent table updates) or coordinate application lock order.",
    command: "-- Find path of current deadlock trace file\nSELECT value FROM v$diag_info WHERE name = 'Default Trace File';\n\n-- Query locks and associated session information\nSELECT l.sid, s.username, l.type, l.lmode, l.request, l.id1, l.id2\nFROM v$lock l \nJOIN v$session s ON l.sid = s.sid\nWHERE l.type IN ('TM', 'TX')\n  AND s.username IS NOT NULL;"
  },
  {
    id: 82,
    title: "How to check Linux OS distribution name and kernel version?",
    category: "linux",
    difficulty: "easy",
    answer: "You can find the Linux operating system distribution and kernel release version using built-in system files or terminal tools:\n• /etc/os-release: Standard file containing OS identification data.\n• uname -r: Returns the running kernel release version.\n• hostnamectl: Displays OS, kernel, and system architecture details.",
    command: "# View operating system details\ncat /etc/os-release\n\n# Print kernel release version\nuname -r\n\n# Display system information overview\nhostnamectl"
  },
  {
    id: 83,
    title: "How do you find files larger than 100MB in a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "The 'find' command searches the directory hierarchy for files matching specific size criteria. Using options like '-type f' limits the search to regular files, and '-size' filters by size. Running it with 'ls' or 'du' formats the output to show exact sizes.",
    command: "# Find and list files larger than 100MB in /var/log\nfind /var/log -type f -size +100M -exec ls -lh {} \\;\n\n# Search current directory recursively for files > 100MB\nfind . -type f -size +100M"
  },
  {
    id: 84,
    title: "Explain the difference between soft links and hard links in Linux",
    category: "linux",
    difficulty: "easy",
    answer: "• Soft Link (Symlink): A symbolic path pointing to another filename. If the original file is deleted, the symlink becomes broken ('dangling'). It can span across different filesystems.\n• Hard Link: An additional directory entry pointing directly to the file's underlying inode. If the original filename is deleted, the file content remains accessible via the hard link. It cannot span across different filesystems or point to directories.",
    command: "# Create a soft link (symlink)\nln -s /etc/nginx/nginx.conf ~/my_nginx.conf\n\n# Create a hard link\nln /var/log/messages ~/messages_backup\n\n# View inodes to verify (hard links share the same inode number)\nls -li"
  },
  {
    id: 85,
    title: "How do you check which process is listening on port 80 or 443?",
    category: "linux",
    difficulty: "easy",
    answer: "To troubleshoot connection errors or find port conflicts, use utilities like 'ss', 'netstat', or 'lsof'. You typically need superuser privileges to see the process name and PID.",
    command: "# Using ss (socket statistics) - Recommended\nsudo ss -tulpn | grep -E ':80|:443'\n\n# Using lsof (list open files)\nsudo lsof -i :80\n\n# Using netstat\nsudo netstat -tulpn | grep -E ':80|:443'"
  },
  {
    id: 86,
    title: "How to change file permissions and ownership in Linux?",
    category: "linux",
    difficulty: "easy",
    answer: "• chmod: Modifies file permissions using symbolic representation (e.g. u+x) or octal notation (e.g. 755).\n• chown: Modifies file owner and group ownership.\nUse the '-R' option with either command to apply the changes recursively to all subdirectories.",
    command: "# Set owner read/write/execute, group/others read/execute (755)\nchmod 755 /var/www/html/index.html\n\n# Make a script executable\nchmod +x deploy.sh\n\n# Change owner to 'oracle' and group to 'oinstall' recursively\nsudo chown -R oracle:oinstall /u01/app/oracle"
  },
  {
    id: 87,
    title: "How to view and search compressed log files without extracting them?",
    category: "linux",
    difficulty: "easy",
    answer: "Linux systems rotate logs and compress them using gzip (.gz format). You can search or view these logs directly without manually decompressing them using 'z-commands':\n• zcat: Concat and view files.\n• zless / zmore: Paginate through text.\n• zgrep: Search for patterns.",
    command: "# Search for ORA- errors inside compressed log archives\nzgrep \"ORA-\" /var/log/oracle/alert_log.*.gz\n\n# Page through a compressed log file\nzless /var/log/nginx/access.log.2.gz"
  },
  {
    id: 88,
    title: "How to check system uptime and load average?",
    category: "linux",
    difficulty: "easy",
    answer: "Load average represents the average system load over a period of time (1, 5, and 15 minutes). It counts the number of processes in runnable or uninterruptible sleep states.\n• uptime: Shows uptime, active sessions, and load averages.\n• w: Shows who is logged in and what they are doing.",
    command: "# Check uptime and load averages\nuptime\n\n# View active user sessions and load averages\nw"
  },
  {
    id: 89,
    title: "How do you kill a process by its name instead of PID?",
    category: "linux",
    difficulty: "easy",
    answer: "While 'kill' requires a process ID (PID), you can terminate processes by name using:\n• killall: Kills all processes matching the exact name.\n• pkill: Kills processes matching a pattern.\n• pgrep: Lists PIDs matching a process name.",
    command: "# Find PIDs of all running Nginx instances\npgrep nginx\n\n# Terminate all processes named 'httpd' gracefully (SIGTERM)\npkill httpd\n\n# Forcefully kill all processes named 'node' (SIGKILL)\nkillall -9 node"
  },
  {
    id: 90,
    title: "How do you search for a pattern in all files within a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "Use 'grep' with recursive flags. Useful options include:\n• -r or -R: Recursive search.\n• -n: Show line numbers.\n• -i: Case-insensitive search.\n• -w: Match whole words only.",
    command: "# Search for 'localhost' in all files under /etc\ngrep -rn \"localhost\" /etc/\n\n# Case-insensitive search for 'error' in /var/log\ngrep -ri \"error\" /var/log/"
  },
  {
    id: 91,
    title: "How do you monitor log updates live in color using tail?",
    category: "linux",
    difficulty: "easy",
    answer: "You can follow file updates live with 'tail -f'. To highlight specific words like 'ERROR' or 'WARNING' in color, pipe the output to grep or use utilities like 'grc' or 'multitail'.",
    command: "# Follow log files live\ntail -f /var/log/nginx/error.log\n\n# Color highlight 'ERROR' using grep\ntail -f /var/log/syslog | grep --color=auto -iE 'error|warning|critical'"
  },
  {
    id: 92,
    title: "How to check available disk space on all mounted filesystems?",
    category: "linux",
    difficulty: "easy",
    answer: "Use the 'df' command. The '-h' flag prints the capacity in human-readable units (e.g. GB, MB), and '-T' displays the filesystem type (ext4, xfs, nfs).",
    command: "# Display disk space in human-readable format\ndf -h\n\n# Display disk space with filesystem types\ndf -hT"
  },
  {
    id: 93,
    title: "How to manage system services using systemctl?",
    category: "linux",
    difficulty: "easy",
    answer: "Modern Linux distributions use systemd to manage services. The 'systemctl' tool controls the status, startup, and shutdown behavior of system units.",
    command: "# Check status of SSH service\nsystemctl status sshd\n\n# Start, stop, or restart a service\nsudo systemctl start nginx\nsudo systemctl stop nginx\nsudo systemctl restart nginx\n\n# Enable service to start automatically on system boot\nsudo systemctl enable docker"
  },
  {
    id: 94,
    title: "How do you diagnose and resolve inode exhaustion?",
    category: "linux",
    difficulty: "medium",
    answer: "An inode represents a metadata record for a file. If a filesystem runs out of inodes, you cannot create new files, even if there is plenty of raw disk space available. This commonly occurs when an application creates millions of tiny session files or mail queues.\n\nResolution steps:\n1. Check inode consumption using `df -i`.\n2. Find the directories containing the highest number of files.\n3. Delete the unnecessary small files using `find -delete` or `xargs` (since running `rm *` will fail with 'Argument list too long').",
    command: "# Check inode availability per filesystem\ndf -i\n\n# Find directories with high file counts\nfind / -xdev -type d -exec sh -c 'echo \"$(find \"$1\" -type f | wc -l) $1\"' _ {} \\; | sort -rn | head -10\n\n# Delete millions of tiny files safely without memory overflow\nfind /var/spool/postfix/maildrop -type f -delete"
  },
  {
    id: 95,
    title: "How to add and enable swap space dynamically on a running system?",
    category: "linux",
    difficulty: "medium",
    answer: "If physical RAM is fully utilized, the system may invoke the Out-Of-Memory (OOM) killer to terminate database or application processes. You can dynamically create swap space using a swap file without resizing partitions.\n\nSteps:\n1. Allocate a blank file of the desired size using `dd` or `fallocate`.\n2. Set correct root-only permissions (600).\n3. Format the file as swap space using `mkswap`.\n4. Enable it using `swapon`.\n5. Append it to `/etc/fstab` for persistence.",
    command: "# Create a 4GB swap file\nsudo fallocate -l 4G /swapfile\n\n# Set correct permissions\nsudo chmod 600 /swapfile\n\n# Format the file as swap\nsudo mkswap /swapfile\n\n# Enable the swap file\nsudo swapon /swapfile\n\n# Verify active swap spaces\nswapon --show\n\n# Persist in fstab\necho '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
  },
  {
    id: 96,
    title: "How to configure visudo to grant passwordless permissions to a specific user?",
    category: "linux",
    difficulty: "medium",
    answer: "Directly editing `/etc/sudoers` can lock you out of system administration if a syntax error is introduced. Always use the `visudo` command, which validates configuration syntax before saving.\n\nConfiguration format:\n`username host=(runas_user:runas_group) [NOPASSWD:] commands`",
    command: "# Open sudoers file in safe edit mode\nsudo visudo\n\n# Add this line to allow user 'dba' to run systemctl restart database passwordless:\n# dba ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart oracle-xe\n\n# Add this line to allow user 'deploy' to run all commands without password:\n# deploy ALL=(ALL) NOPASSWD: ALL"
  },
  {
    id: 97,
    title: "Explain Linux systemd custom unit file creation and management",
    category: "linux",
    difficulty: "medium",
    answer: "A systemd unit file (.service) configures how systemd manages a daemon. It is typically created in `/etc/systemd/system/`.\n\nKey sections:\n• [Unit]: Description and boot dependency orders (After=network.target).\n• [Service]: Command to execute (ExecStart), restart policy (Restart=always), and run user/group constraints.\n• [Install]: Activation targets (WantedBy=multi-user.target).",
    command: "# Create custom service file\nsudo cat << 'EOF' > /etc/systemd/system/myapp.service\n[Unit]\nDescription=My NodeJS App Service\nAfter=network.target\n\n[Service]\nUser=node\nWorkingDirectory=/var/www/myapp\nExecStart=/usr/bin/node server.js\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\n# Reload systemd configuration\nsudo systemctl daemon-reload\n\n# Start and enable the service\nsudo systemctl start myapp\nsudo systemctl enable myapp"
  },
  {
    id: 98,
    title: "How to diagnose slow disk performance and write bottlenecks?",
    category: "linux",
    difficulty: "medium",
    answer: "Disk I/O latency can degrade database throughput. Diagnose storage bottlenecks using:\n• iostat: Checks CPU statistics and I/O statistics for devices. Pay attention to '%util' (disk utilization) and 'await' (average I/O response time in milliseconds).\n• iotop: Shows real-time disk I/O usage per process, identifying which process is writing heavily.",
    command: "# Run iostat every 2 seconds, displaying detailed disk extended statistics\niostat -x 2 5\n\n# View processes actively performing read/write operations\nsudo iotop -o"
  },
  {
    id: 99,
    title: "Configuring logrotate to manage growing application logs",
    category: "linux",
    difficulty: "medium",
    answer: "Logrotate automatically rotates, compresses, and purges log files to prevent partition exhaustion. It is controlled by config scripts under `/etc/logrotate.d/`.\n\nCommon options:\n• daily/weekly/monthly: Rotation frequency.\n• rotate count: How many archived files to keep.\n• compress: Compress logs using gzip.\n• missingok: Skip without error if the log file is missing.\n• delaycompress: Postpone compression until the next rotation cycle.",
    command: "# Create custom logrotate configuration for an app\nsudo cat << 'EOF' > /etc/logrotate.d/myapp\n/var/log/myapp/*.log {\n    daily\n    rotate 7\n    compress\n    delaycompress\n    missingok\n    notifempty\n    create 0660 app_user app_group\n    sharedscripts\n    postrotate\n        /usr/bin/systemctl reload myapp > /dev/null 2>&1\n    endscript\n}\nEOF\n\n# Force test run logrotate execution manually\nsudo logrotate -f /etc/logrotate.d/myapp"
  },
  {
    id: 100,
    title: "How to resolve 'Too many open files' errors on Linux?",
    category: "linux",
    difficulty: "medium",
    answer: "The kernel limits the number of file descriptors a process can open (typically 1024 for non-root users). Under high concurrent load, web servers or databases will crash with a 'Too many open files' error.\n\nResolution steps:\n1. Check current limits using `ulimit -n`.\n2. Monitor open file descriptors using `lsof`.\n3. Modify system-wide and user limits in `/etc/security/limits.conf`.",
    command: "# Check active shell open file descriptor limits\nulimit -n\n\n# Count open files for a specific PID\nlsof -p 2481 | wc -l\n\n# Add limits permanently in /etc/security/limits.conf:\n# oracle   soft   nofile   65536\n# oracle   hard   nofile   65536"
  },
  {
    id: 101,
    title: "How do you run commands in the background that survive terminal disconnection?",
    category: "linux",
    difficulty: "medium",
    answer: "Standard shell processes terminate if the SSH connection drops. To run tasks that persist:\n• screen / tmux: Virtual terminal multiplexers that run sessions independently of SSH status.\n• nohup: Executes a command, ignoring hangup signals (SIGHUP), redirecting output to nohup.out.\n• bg/fg/jobs: Built-in shell job control.",
    command: "# Run a background backup job that persists after exit\nnohup /u01/app/oracle/scripts/backup.sh > /tmp/backup.log 2>&1 &\n\n# Start a tmux session\ntmux new -s db_restore\n\n# Detach from tmux: press Ctrl+B, then D\n# Re-attach to tmux later:\ntmux attach -t db_restore"
  },
  {
    id: 102,
    title: "How to configure system clock sync using chrony?",
    category: "linux",
    difficulty: "medium",
    answer: "Database replication, Active Directory, and log analysis require precise clock synchronization across nodes. Chrony is the modern NTP implementation used to sync system time with reliable internet time servers.\n\nManagement steps:\n• Configure NTP pool servers in `/etc/chrony.conf`.\n• Manage chronyd daemon.\n• Validate sync status using `chronyc`.",
    command: "# Check chrony clock synchronization details\nchronyc tracking\n\n# List configured NTP servers and check their connectivity status\nchronyc sources -v\n\n# Force step the system clock immediately if time offset is large\nsudo chronyc -a makestep"
  },
  {
    id: 103,
    title: "How to secure network connections in Linux using firewalld?",
    category: "linux",
    difficulty: "medium",
    answer: "Firewalld is a firewall management tool that dynamically manages network ports. It uses Zones (e.g. public, internal) to classify network traffic.\n\nSteps:\n1. Add a port or service rule.\n2. Reload configuration to apply.\n3. Verify open configurations.",
    command: "# Add Oracle listener port (1521) permanently to public zone\nsudo firewall-cmd --zone=public --add-port=1521/tcp --permanent\n\n# Reload firewall rules\nsudo firewall-cmd --reload\n\n# List active firewall rules in default zone\nsudo firewall-cmd --list-all"
  },
  {
    id: 104,
    title: "Using rsync to synchronize directories across servers securely",
    category: "linux",
    difficulty: "medium",
    answer: "Rsync is a fast, file-copying tool that syncs directories over SSH. It uses an delta-transfer algorithm, copying only the differences between source and destination files to reduce network bandwidth.\n\nKey flags:\n• -a: Archive mode (preserves permissions, ownership, timestamps, and symlinks).\n• -v: Verbose output.\n• -z: Compress data during transfer.\n• --delete: Deletes files in destination that no longer exist in source.",
    command: "# Sync local backup directory to a backup server over SSH\nrsync -avz --delete /u01/backups/ backup_user@bkpserver:/storage/backups/\n\n# Perform a dry run to see changes without copying\nrsync -avz --dry-run /u01/backups/ backup_user@bkpserver:/storage/backups/"
  },
  {
    id: 105,
    title: "How to examine kernel rings and system event buffers using dmesg?",
    category: "linux",
    difficulty: "medium",
    answer: "The 'dmesg' command prints the kernel message buffer. It is a critical diagnostic tool for identifying hardware errors, driver issues, memory errors (OOM kills), or block layer issues.",
    command: "# Search kernel logs for Out-Of-Memory events\ndmesg -T | grep -i oom\n\n# Search for disk I/O or SCSI connection errors\ndmesg -T | grep -iE 'sd|scsi|block|error'\n\n# View live kernel logs\ndmesg -w"
  },
  {
    id: 106,
    title: "How do you audit directory disk space usage using du and ncdu?",
    category: "linux",
    difficulty: "medium",
    answer: "When a partition fills up, you must identify what files are consuming space. Use 'du' with sort filters, or the interactive command-line analyzer 'ncdu'.",
    command: "# Find top 10 largest folders under /var/log\nsudo du -ah /var/log/ | sort -rh | head -n 10\n\n# Run interactive disk usage analyzer (if installed)\nncdu /var"
  },
  {
    id: 107,
    title: "Troubleshooting Kernel Panic and Unresponsive OS",
    category: "linux",
    difficulty: "hard",
    answer: "A kernel panic is a safety measure taken by the operating system kernel when it encounters an unrecoverable internal error (e.g., driver crash, memory corruption, filesystem loss). When a panic occurs, the OS freezes to prevent data corruption.\n\nDiagnostics steps:\n1. Inspect the console screen or IPMI console interface for panic trace dumps.\n2. Configure Kdump to capture kernel core dump files (/var/crash/).\n3. Load the crash dump into 'crash' utility using crash tools to debug memory variables.\n4. Search /var/log/messages or journald for logs preceding the crash.",
    command: "# Verify kdump service status\nsystemctl status kdump\n\n# View kernel crash logs\nls -l /var/crash/\n\n# Configure kernel behavior to reboot automatically 10 seconds after a panic\nsudo sysctl kernel.panic=10\n\n# Force crash dump generation to test kdump (CAUTION: Reboots host immediately)\n# sudo sh -c \"echo c > /proc/sysrq-trigger\""
  },
  {
    id: 108,
    title: "Tuning Linux sysctl Virtual Memory and Dirty Page Ratios",
    category: "linux",
    difficulty: "hard",
    answer: "Under heavy write-heavy database workloads, Linux can block on disk operations if system memory caching parameters are misconfigured. Tuning virtual memory settings prevents 'I/O spikes' and database freeze cycles.\n\nKey Parameters:\n• vm.dirty_background_ratio: Memory percentage at which the pdflush/flush kernel threads start writing dirty blocks to disk in the background (Default ~10%).\n• vm.dirty_ratio: Memory percentage at which a process performing writes is forced to write dirty blocks to disk, blocking its own executions until completed (Default ~20%).\n• For databases with fast storage, reduce these ratios to keep writes smooth (e.g. background 5%, dirty 10%).",
    command: "# View current virtual memory dirty ratios\nsysctl -a | grep -E 'dirty_ratio|dirty_background_ratio'\n\n# Tune VM memory ratios dynamically\nsudo sysctl vm.dirty_background_ratio=5\nsudo sysctl vm.dirty_ratio=10\n\n# Persist modifications in /etc/sysctl.conf\necho -e 'vm.dirty_background_ratio = 5\\nvm.dirty_ratio = 10' | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p"
  },
  {
    id: 109,
    title: "Analyzing Process Performance Bottlenecks using strace and lsof",
    category: "linux",
    difficulty: "hard",
    answer: "When a critical process is running slowly or consuming 100% CPU, you can trace system calls in real time using 'strace' and inspect open file descriptors using 'lsof'.\n\nDiagnostics:\n• strace: Intercepts and logs system calls made by a process. High volumes of specific calls (e.g. read/write/futex) reveal what a process is waiting on.\n• lsof: Identifies which files, directories, or sockets the process is interacting with.",
    command: "# Trace system calls for a process PID, counting time spent per call\nsudo strace -c -p 14820\n\n# Trace file read and write calls with timestamps\nsudo strace -t -e trace=read,write -p 14820\n\n# List network connections and sockets opened by process PID\nsudo lsof -i -a -p 14820"
  },
  {
    id: 110,
    title: "Debugging Network Packet Drops using tcpdump and iptables",
    category: "linux",
    difficulty: "hard",
    answer: "Network drops or connection timeouts between databases and application servers require protocol packet auditing.\n\nWorkflow:\n1. Check network socket statistics with 'ss'.\n2. Capture packet dumps with 'tcpdump' to verify if handshakes (SYN, SYN-ACK, ACK) complete.\n3. Audit 'iptables' drops or firewalld rules. Use the 'TRACE' target in iptables raw table to trace which rule drops the packets.",
    command: "# Capture TCP packets on interface eth0 on port 1521, writing to file\nsudo tcpdump -i eth0 port 1521 -w /tmp/db_traffic.pcap\n\n# Read captured packet trace file, showing details in ASCII\ntcpdump -r /tmp/db_traffic.pcap -A | head -n 50\n\n# Check firewall drop counts and active rules\nsudo iptables -L -n -v"
  },
  {
    id: 111,
    title: "Setting up LVM Snapshots for Zero-Downtime Backups",
    category: "linux",
    difficulty: "hard",
    answer: "LVM snapshots allow creating a read-only copy of a logical volume at a specific point in time. It uses a copy-on-write (COW) mechanism, meaning it only allocates space to store data blocks as they change on the original volume.\n\nBackup Strategy:\n1. Freeze the database or application writes (e.g. fsfreeze or SQL flush).\n2. Create the LVM snapshot.\n3. Unfreeze filesystem writes (minimizes downtime to <1s).\n4. Mount the snapshot to a different path and copy files.\n5. Unmount and delete the snapshot to free up storage.",
    command: "# 1. Create a 5GB snapshot named 'lv_db_snap' from 'lv_db'\nsudo lvcreate -L 5G -s -n lv_db_snap /dev/vg_data/lv_db\n\n# 2. Mount the snapshot (use nouuid flag for XFS filesystems)\nsudo mount -o ro,nouuid /dev/vg_data/lv_db_snap /mnt/db_backup\n\n# 3. Copy files using tar or rsync\ntar -czf /storage/db_backup.tar.gz /mnt/db_backup\n\n# 4. Cleanup snapshot\nsudo umount /mnt/db_backup\nsudo lvremove -f /dev/vg_data/lv_db_snap"
  },
  {
    id: 112,
    title: "Configuring SELinux Policies for Custom Database Paths",
    category: "linux",
    difficulty: "hard",
    answer: "SELinux (Security-Enhanced Linux) enforces mandatory access control (MAC) policies. If you move Oracle, PostgreSQL, or Nginx storage to a custom directory (e.g. /u02/app/data), SELinux will block the daemon from accessing it, causing startup failures.\n\nFixing SELinux issues:\n• Do not set SELinux to permissive or disabled in production.\n• Update the SELinux file contexts for the custom path using 'semanage fcontext' and apply changes using 'restorecon'.",
    command: "# Check active SELinux status\nsestatus\n\n# View denials in audit logs\nsudo ausearch -m AVC -ts recent\n\n# Add context type for custom directory (e.g. postgres_db_t)\nsudo semanage fcontext -a -t postgresql_db_t \"/u02/data(/.*)?\"\n\n# Apply the context changes\nsudo restorecon -R -v /u02/data"
  },
  {
    id: 113,
    title: "Recovering corrupted Linux Ext4/XFS filesystems",
    category: "linux",
    difficulty: "hard",
    answer: "Sudden power outages or SAN disconnections can cause filesystem corruption. The kernel will automatically remount the filesystem as read-only to prevent further damage.\n\nRecovery Steps:\n1. Identify the corrupted volume (dmesg or mount status).\n2. Unmount the volume. Never run filesystem repairs on a mounted volume.\n3. For Ext4: Run `fsck` (or `e2fsck`) to fix inconsistencies.\n4. For XFS: Run `xfs_repair` (XFS does not use fsck).",
    command: "# Unmount the partition\nsudo umount /dev/vg_data/lv_app\n\n# Repair Ext4 volume\nsudo e2fsck -f -y /dev/vg_data/lv_app\n\n# Repair XFS volume (if XFS log holds dirty transactions, use -L flag as last resort)\n# sudo xfs_repair /dev/vg_data/lv_app"
  },
  {
    id: 114,
    title: "Configuring network interface bonding (Active-Passive) on RedHat/CentOS",
    category: "linux",
    difficulty: "hard",
    answer: "Network interface bonding combines multiple physical NICs into a single logical channel. This provides network redundancy (failover) and link aggregation (increased bandwidth).\n\nModes:\n• Mode 0 (Balance-RR): Load balancing.\n• Mode 1 (Active-Backup): High availability. If active link fails, backup NIC takes over.",
    command: "# View active bond0 interface configuration details\ncat /proc/net/bonding/bond0\n\n# Show status of all physical connections\nnmcli device status"
  },
  {
    id: 115,
    title: "Tuning Linux HugePages for database SGA structures",
    category: "linux",
    difficulty: "hard",
    answer: "By default, Linux uses 4KB memory page sizes. For databases with large SGAs (e.g. 32GB+), managing millions of page table entries consumes substantial CPU overhead. Configuring HugePages (typically 2MB sizes) locks memory blocks in RAM, prevents swap-out, and improves TLB cache efficiency.\n\nSteps:\n1. Determine required HugePages count from SGA target size.\n2. Configure HugePages allocation dynamically or in sysctl.conf.\n3. Adjust user memlock limits in limits.conf.\n4. Restart database and verify.",
    command: "# Check current HugePage allocation and size\ngrep -i huge /proc/meminfo\n\n# Calculate count: SGA_SIZE / Hugepagesize (e.g. 16GB / 2MB = 8192 pages)\n# Configure temporarily:\nsudo sysctl vm.nr_hugepages=8192\n\n# Check user memory locking limits (Max Locked Memory)\nulimit -l"
  },
  {
    id: 116,
    title: "Troubleshooting Linux OOM Killer Events",
    category: "linux",
    difficulty: "hard",
    answer: "The Linux Out-Of-Memory (OOM) killer is a mechanism that terminates processes to save the system from crashing when memory is completely depleted. The kernel evaluates processes and assigns an 'oom_score' based on memory usage and process characteristics. The process with the highest score is killed.\n\nMitigation Strategy:\n• Optimize application memory leaks.\n• Set up swap space.\n• Adjust oom_score_adj for critical system daemons (like SSH or database listeners) to protect them from being terminated.",
    command: "# Find OOM kills in system logs\njournalctl -xb | grep -i oom-killer\n\n# Search log files directly\ngrep -i \"killed process\" /var/log/messages\n\n# Protect Nginx from OOM (set score adjustment to -1000)\necho -1000 | sudo tee /proc/$(pgrep nginx | head -1)/oom_score_adj"
  },
  {
    id: 117,
    title: "Diagnosing zombie and defunct processes",
    category: "linux",
    difficulty: "hard",
    answer: "A zombie process (defunct) is a process that has completed execution but still has an entry in the process table. This happens because the parent process has not read its exit status using wait() or waitpid(). While zombies do not consume CPU or RAM, they occupy process table slots (PIDs).\n\nResolution:\n• Find the parent process using 'ps'.\n• Send a SIGCHLD signal to the parent to force it to clean up the zombie.\n• If that fails, restart the parent process, which makes the zombie an orphan, and the init process (PID 1) will automatically clean it up.",
    command: "# Find zombie processes\nps aux | grep Z\n\n# List zombie PIDs alongside parent process details\nps -eo pid,ppid,stat,cmd | grep -E '[Zz]' | grep -v grep\n\n# Kill the parent process of a zombie\nkill -1 $(ps -o ppid= -p <zombie_pid>)"
  },
  {
    id: 118,
    title: "Tuning TCP Keepalive and Socket Buffers for High-Concurrency Web Servers",
    category: "linux",
    difficulty: "hard",
    answer: "Under high volumes of network connections, Linux sockets can hang in TIME_WAIT status, exhausting ephemeral ports and blocking new connections.\n\nOptimization:\n• Enable socket reuse (net.ipv4.tcp_tw_reuse).\n• Increase local port range (net.ipv4.ip_local_port_range).\n• Increase backlog parameters (net.core.somaxconn) to handle higher queue lengths.\n• Tune TCP read and write memory buffers.",
    command: "# View current network parameters\nsysctl net.ipv4.ip_local_port_range\nsysctl net.core.somaxconn\n\n# Tune TCP settings dynamically\nsudo sysctl -w net.ipv4.tcp_tw_reuse=1\nsudo sysctl -w net.core.somaxconn=1024\nsudo sysctl -w net.ipv4.ip_local_port_range=\"10240 65535\""
  },
  {
    id: 119,
    title: "How to configure custom journald log retention and rotation settings?",
    category: "linux",
    difficulty: "hard",
    answer: "By default, systemd-journald stores system logs. If misconfigured, journal logs can consume tens of gigabytes of disk space under `/var/log/journal/`.\n\nManagement:\n• Edit `/etc/systemd/journald.conf` to limit log sizes.\n• Set SystemMaxUse (maximum disk usage cap) and MaxFileSec (maximum time window per log file).\n• Query journal sizes and run maintenance tasks using `journalctl`.",
    command: "# Check total disk space consumed by journal logs\njournalctl --disk-usage\n\n# Clean up journal logs keeping only the last 7 days of logs\nsudo journalctl --vacuum-time=7d\n\n# Clean up journal logs keeping only the last 1GB of logs\nsudo journalctl --vacuum-size=1G"
  },
  {
    id: 120,
    title: "Recovering lost root passwords using GRUB boot modifications",
    category: "linux",
    difficulty: "hard",
    answer: "If the root password is lost, you can gain shell access to reset it by booting into a rescue terminal.\n\nSteps:\n1. Reboot the host and press any key to enter the GRUB bootloader menu.\n2. Select the kernel and press 'e' to edit boot parameters.\n3. Find the line starting with 'linux' or 'linux16' and append 'rd.break' or 'init=/bin/sh' at the end.\n4. Press Ctrl+X to boot. The system mounts the root filesystem as read-only at /sysroot/.\n5. Mount the directory as read-write: `mount -o remount,rw /sysroot`.\n6. Change root environment: `chroot /sysroot`.\n7. Run `passwd` to set a new password.\n8. Enable SELinux auto-relabel: `touch /.autorelabel`.\n9. Reboot.",
    command: "# Run these inside the emergency shell:\nmount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\ntouch /.autorelabel\nexit\nreboot"
  },
  {
    id: 121,
    title: "Auditing user actions using Auditd daemon",
    category: "linux",
    difficulty: "hard",
    answer: "The Linux Audit Daemon (auditd) logs security-relevant events on a system. Unlike standard application loggers, it can track system calls, file access events, execution parameters, and network activities.\n\nUsage:\n• Create rules in `/etc/audit/rules.d/audit.rules`.\n• Query audit logs using `ausearch`.\n• Generate reports using `aureport`.",
    command: "# Track modifications to /etc/passwd (key=passwd_change)\nsudo auditctl -w /etc/passwd -p wa -k passwd_change\n\n# Query audit logs for events with key 'passwd_change'\nsudo ausearch -k passwd_change\n\n# Generate a summary report of failed logins\nsudo aureport --login --failed"
  },
  {
    id: 122,
    title: "Troubleshooting read-only filesystem issues",
    category: "linux",
    difficulty: "hard",
    answer: "When Linux detects hardware corruption, block layer errors, or lost network access on a partition (such as an NFS mount), it remounts the filesystem as read-only to prevent disk corruption.\n\nDiagnosis:\n1. Search kernel logs using dmesg for write errors or I/O timeouts.\n2. Identify the filesystem type (ext4, xfs) and device path.\n3. Unmount the volume and run repairs. If it is the root partition, reboot into a live rescue image to run repairs.",
    command: "# Check mount parameters for read-only (ro) flags\nmount | grep ' ro,'\n\n# Remount a partition as read-write dynamically if it was set to ro manually\nsudo mount -o remount,rw /data"
  },
  {
    id: 123,
    title: "Configuring cgroups to limit process memory and CPU limits",
    category: "linux",
    difficulty: "hard",
    answer: "Control Groups (cgroups) are a kernel feature that limits, isolates, and measures resource usage (CPU, memory, disk I/O, network) for groups of processes. Docker uses cgroups internally to enforce container resource boundaries.\n\nManagement:\n• Create control directories under `/sys/fs/cgroup/memory/` or use systemd slices.\n• Set limit bounds (e.g. limit_in_bytes) by writing to control files.\n• Assign processes to cgroups.",
    command: "# Create custom cgroup under systemd slice\nsudo systemd-run --unit=capped_job --slice=capped_slice --property=MemoryMax=500M /opt/batch_job.sh\n\n# Check slice configurations\nsystemctl status capped_job"
  },
  {
    id: 124,
    title: "How to handle NULL values in SQL using COALESCE?",
    category: "sql",
    difficulty: "easy",
    answer: "NULL indicates a missing or unknown value in a database. Direct comparisons like '= NULL' will fail. The COALESCE function returns the first non-null expression from a list of arguments, making it perfect for setting default values.",
    command: "-- Return 'N/A' if the phone number is NULL\nSELECT employee_id, first_name, COALESCE(phone_number, 'N/A') AS contact_phone\nFROM employees;\n\n-- Retrieve first non-null contact info (mobile, then home, then work)\nSELECT first_name, COALESCE(mobile_phone, home_phone, work_phone, 'No Contact') AS primary_phone\nFROM customers;"
  },
  {
    id: 125,
    title: "Difference between LEFT JOIN, RIGHT JOIN, and INNER JOIN",
    category: "sql",
    difficulty: "easy",
    answer: "• INNER JOIN: Returns rows when there is a match in both tables.\n• LEFT JOIN (or LEFT OUTER JOIN): Returns all rows from the left table, and matched rows from the right table. If no match is found, NULL is returned for right-side columns.\n• RIGHT JOIN (or RIGHT OUTER JOIN): Returns all rows from the right table, and matched rows from the left table. (Generally avoided; prefer LEFT JOIN for consistency).",
    command: "-- INNER JOIN (Only returns employees with departments)\nSELECT e.first_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;\n\n-- LEFT JOIN (Returns all employees, even those without a department)\nSELECT e.first_name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;"
  },
  {
    id: 126,
    title: "How to use GROUP BY with HAVING to filter aggregated results?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters rows *before* aggregation takes place.\n• HAVING: Filters groups *after* aggregation (GROUP BY) takes place.\nYou cannot use aggregate functions (like COUNT, SUM) in a WHERE clause; you must use HAVING.",
    command: "-- Find departments with an average salary greater than $10,000\nSELECT department_id, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id\nHAVING AVG(salary) > 10000;"
  },
  {
    id: 127,
    title: "How to retrieve unique rows from a query using DISTINCT?",
    category: "sql",
    difficulty: "easy",
    answer: "The DISTINCT keyword is placed immediately after SELECT to filter out duplicate rows from the result set. It evaluates the combination of all selected columns to determine uniqueness.",
    command: "-- Get a list of all unique departments that have active employees\nSELECT DISTINCT department_id\nFROM employees\nWHERE status = 'ACTIVE';"
  },
  {
    id: 128,
    title: "How to perform wild card searches in SQL using LIKE?",
    category: "sql",
    difficulty: "easy",
    answer: "The LIKE operator filters rows matching string patterns. It uses wildcards:\n• %: Represents zero, one, or multiple characters.\n• _: Represents exactly one character.\nFor case-insensitive searches in some databases, use ILIKE or UPPER/LOWER.",
    command: "# Search for emails ending with '@gmail.com'\nSELECT first_name, email\nFROM users\nWHERE email LIKE '%@gmail.com';\n\n# Search for names where the second letter is 'a'\nSELECT first_name\nFROM users\nWHERE first_name LIKE '_a%';"
  },
  {
    id: 129,
    title: "What is a primary key vs foreign key?",
    category: "sql",
    difficulty: "easy",
    answer: "• Primary Key (PK): A column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL values and must be unique.\n• Foreign Key (FK): A column in one table that links to the Primary Key of another table. It enforces referential integrity, ensuring you cannot insert orphan records.",
    command: "-- Table definition with PK and FK\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);"
  },
  {
    id: 130,
    title: "How to update values in a table using UPDATE and WHERE?",
    category: "sql",
    difficulty: "easy",
    answer: "The UPDATE statement modifies existing records. Always include a WHERE clause; omitting the WHERE clause updates *all* rows in the table.",
    command: "-- Update a user's email address by user ID\nUPDATE users\nSET email = 'new_email@company.com'\nWHERE user_id = 104;\n\n-- Give all employees in department 10 a 5% raise\nUPDATE employees\nSET salary = salary * 1.05\nWHERE department_id = 10;"
  },
  {
    id: 131,
    title: "How to safely delete rows from a table using DELETE vs TRUNCATE?",
    category: "sql",
    difficulty: "easy",
    answer: "• DELETE: A DML operation that removes specific rows matching a WHERE clause. It logs each row deletion, supports rollback, and fires triggers. It is slower.\n• TRUNCATE: A DDL operation that removes all rows from a table by deallocating data pages. It is faster, uses minimal log space, cannot be rolled back in some databases, and does not fire triggers.",
    command: "-- Delete specific rows (can be rolled back)\nDELETE FROM activity_logs\nWHERE log_date < '2025-01-01';\n\n-- Truncate entire table (fast, deallocates pages)\nTRUNCATE TABLE temp_staging_data;"
  },
  {
    id: 132,
    title: "How do you count rows in a table using COUNT(*) vs COUNT(column)?",
    category: "sql",
    difficulty: "easy",
    answer: "• COUNT(*): Counts the total number of rows in the query result, including rows with NULL values.\n• COUNT(column): Counts only rows where the specified column contains a non-null value.",
    command: "-- Total rows (e.g. 100 rows)\nSELECT COUNT(*) FROM employees;\n\n-- Non-null phone numbers (e.g. 85 rows if 15 are NULL)\nSELECT COUNT(phone_number) FROM employees;"
  },
  {
    id: 133,
    title: "How to limit query results and implement pagination in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "To return a subset of rows (e.g., for paginated pages), use LIMIT and OFFSET (PostgreSQL, MySQL) or FETCH NEXT ROWS (Oracle, SQL Server).",
    command: "-- MySQL/PostgreSQL: Get the first 10 rows\nSELECT id, title FROM questions LIMIT 10;\n\n-- Get rows 11 to 20 (page 2)\nSELECT id, title FROM questions LIMIT 10 OFFSET 10;\n\n-- Oracle standard syntax:\n-- SELECT id, title FROM questions FETCH FIRST 10 ROWS ONLY;"
  },
  {
    id: 134,
    title: "How to use CASE WHEN statements for conditional logic in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "The CASE expression provides conditional logic (if-then-else) inline in SQL queries. It evaluates conditions and returns a value when a match is found.",
    command: "-- Label salaries as High, Medium, or Low\nSELECT first_name, salary,\n       CASE \n         WHEN salary >= 10000 THEN 'High'\n         WHEN salary >= 5000 THEN 'Medium'\n         ELSE 'Low'\n       END AS salary_bracket\nFROM employees;"
  },
  {
    id: 135,
    title: "What is the difference between WHERE and HAVING?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters records *before* any groupings are created. It cannot reference aggregate functions.\n• HAVING: Filters records *after* GROUP BY groupings are formed. It must reference aggregated values.",
    command: "-- Filtering rows before grouping (WHERE)\nSELECT job_id, COUNT(*) \nFROM employees \nWHERE salary > 5000 \nGROUP BY job_id;\n\n-- Filtering groups after aggregation (HAVING)\nSELECT job_id, COUNT(*)\nFROM employees\nGROUP BY job_id\nHAVING COUNT(*) > 5;"
  },
  {
    id: 136,
    title: "Explain SQL Window Functions: ROW_NUMBER, RANK, and DENSE_RANK",
    category: "sql",
    difficulty: "medium",
    answer: "Window functions perform calculations across a set of table rows related to the current row, without collapsing them into a single row (unlike GROUP BY).\n\nKey Differences:\n• ROW_NUMBER(): Assigns a unique sequential integer to each row. In case of ties, it assigns numbers arbitrarily.\n• RANK(): Assigns rank with gaps. If two rows tie for 1st, they both get 1, and the next row gets 3.\n• DENSE_RANK(): Assigns rank without gaps. If two rows tie for 1st, they both get 1, and the next row gets 2.",
    command: "-- Calculate rank of employee salaries within each department\nSELECT department_id, first_name, salary,\n       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,\n       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rnk\nFROM employees;"
  },
  {
    id: 137,
    title: "Using LEAD and LAG to calculate differences between consecutive rows",
    category: "sql",
    difficulty: "medium",
    answer: "LEAD and LAG are window functions that allow accessing data from other rows relative to the current row without using a self-join:\n• LAG(column, offset): Returns the column value from 'offset' rows prior.\n• LEAD(column, offset): Returns the column value from 'offset' rows ahead.\n\nThis is useful for calculating period-over-period growth or time-series changes.",
    command: "-- Compare monthly sales with the previous month's sales\nSELECT sales_month, total_revenue,\n       LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue,\n       total_revenue - LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS monthly_revenue_change\nFROM monthly_sales;"
  },
  {
    id: 138,
    title: "What is database normalization? Explain 1NF, 2NF, and 3NF",
    category: "sql",
    difficulty: "medium",
    answer: "Normalization organizes table structures to minimize data redundancy and prevent insertion, update, and deletion anomalies.\n\nNormalization stages:\n• 1st Normal Form (1NF): Column values must be atomic (no arrays/comma-separated lists) and rows must be unique.\n• 2nd Normal Form (2NF): Must be in 1NF, and all non-key columns must depend completely on the primary key (no partial dependencies on composite keys).\n• 3rd Normal Form (3NF): Must be in 2NF, and non-key columns must not depend on other non-key columns (no transitive dependencies).",
    command: "-- Example of converting 2NF to 3NF:\n-- Violates 3NF: (emp_id [PK] -> dept_id -> dept_name)\n-- Fix: Split into two tables:\nCREATE TABLE depts (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE emps (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT REFERENCES depts(dept_id)\n);"
  },
  {
    id: 139,
    title: "Explain CTEs (Common Table Expressions) and their benefits over nested subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "A Common Table Expression (CTE) is a temporary result set defined using a 'WITH' clause. It improves readability, modularizes complex query blocks, and can be referenced multiple times within a single query.",
    command: "-- Modular query using CTE\nWITH dept_costs AS (\n  SELECT department_id, SUM(salary) AS total_dept_salary\n  FROM employees\n  GROUP BY department_id\n),\ncompany_avg AS (\n  SELECT AVG(total_dept_salary) AS avg_dept_salary\n  FROM dept_costs\n)\nSELECT d.department_id, d.total_dept_salary\nFROM dept_costs d, company_avg c\nWHERE d.total_dept_salary > c.avg_dept_salary;"
  },
  {
    id: 140,
    title: "How do you identify and kill blocking queries in PostgreSQL?",
    category: "sql",
    difficulty: "medium",
    answer: "Locks prevent concurrent data updates from clashing. However, uncommitted transactions or heavy queries can hold locks indefinitely, blocking other operations.\n\nResolution:\n1. Query the 'pg_stat_activity' catalog view to identify blocking and blocked queries.\n2. Terminate the blocking backend process using pg_terminate_backend.",
    command: "-- Find queries waiting for locks and the blockers holding them\nSELECT blocked_locks.pid     AS blocked_pid,\n       blocked_activity.query  AS blocked_statement,\n       blocking_locks.pid    AS blocking_pid,\n       blocking_activity.query AS blocking_statement\nFROM  pg_catalog.pg_locks         blocked_locks\nJOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid\nJOIN pg_catalog.pg_locks         blocking_locks \n  ON blocking_locks.locktype = blocked_locks.locktype\n  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database\n  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation\n  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page\n  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple\n  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid\n  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid\n  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid\n  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid\n  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid\n  AND blocking_locks.pid != blocked_locks.pid\nJOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid\nWHERE NOT blocked_locks.granted;\n\n-- Terminate blocking process PID gracefully\nSELECT pg_cancel_backend(blocking_pid);\n\n-- Forcefully terminate process PID\nSELECT pg_terminate_backend(blocking_pid);"
  },
  {
    id: 141,
    title: "What are ACID properties in database transactions?",
    category: "sql",
    difficulty: "medium",
    answer: "ACID defines the key properties required to guarantee database transaction reliability:\n• Atomicity: Entire transaction completes successfully, or all changes are rolled back (All-or-Nothing).\n• Consistency: Database transitions from one valid state to another, maintaining all constraints, triggers, and schemas.\n• Isolation: Transactions running concurrently execute independently without interfering with each other.\n• Durability: Once a transaction commits, its modifications are permanently recorded in non-volatile memory (surviving system crashes).",
    command: "-- Example of ensuring Atomicity using Transaction Block\nBEGIN TRANSACTION;\n  UPDATE bank_accounts SET balance = balance - 500 WHERE account_id = 10;\n  UPDATE bank_accounts SET balance = balance + 500 WHERE account_id = 11;\nCOMMIT; -- If either statement fails, execute ROLLBACK;"
  },
  {
    id: 142,
    title: "Difference between clustered index, non-clustered index, and covering index",
    category: "sql",
    difficulty: "medium",
    answer: "• Clustered Index: Sorts and stores the physical data rows of the table based on key values. A table can have only one clustered index.\n• Non-Clustered Index: Maintains a separate structure containing key values and pointers (ROWIDs or primary keys) back to the actual data rows.\n• Covering Index: A non-clustered index that includes/covers *all* columns requested by a SELECT query. Since the index holds all requested data, the query planner can return results directly from the index tree, skipping the expensive table lookup step (index-only scan).",
    command: "-- Create covering index (index includes filter and select columns)\nCREATE INDEX idx_emp_dept_salary ON employees(department_id, salary, employee_id);\n\n-- This query performs an index-only scan (no table blocks accessed)\nSELECT department_id, employee_id\nFROM employees\nWHERE department_id = 20;"
  },
  {
    id: 143,
    title: "How to use Self-Joins to compare rows within the same table?",
    category: "sql",
    difficulty: "medium",
    answer: "A self-join is a standard join that links a table to itself. This requires assigning distinct aliases to the table in the FROM clause. It is used to query hierarchical data (e.g. employee-manager links) or compare records in the same table.",
    command: "-- Find employees and their managers from a single employees table\nSELECT e.first_name AS employee,\n       m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;"
  },
  {
    id: 144,
    title: "How do you implement Upsert operations (INSERT ON CONFLICT/MERGE)?",
    category: "sql",
    difficulty: "medium",
    answer: "An 'Upsert' operation inserts a new row, or updates the existing row if it violates a uniqueness constraint (like a Primary Key duplicate).\n• PostgreSQL: INSERT ON CONFLICT DO UPDATE\n• MySQL: INSERT ... ON DUPLICATE KEY UPDATE\n• SQL Standard / Oracle: MERGE",
    command: "-- PostgreSQL Upsert (inserts new user, updates active timestamp on duplicate)\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON CONFLICT (user_id)\nDO UPDATE SET last_active = EXCLUDED.last_active, token = EXCLUDED.token;\n\n-- MySQL Upsert\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON DUPLICATE KEY UPDATE token = VALUES(token), last_active = VALUES(last_active);"
  },
  {
    id: 145,
    title: "Explain the difference between correlated and uncorrelated subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "• Uncorrelated Subquery: Executes independently of the outer query. It runs once, returns a result set, and the outer query uses that result.\n• Correlated Subquery: References columns from the outer query. It must execute repeatedly, once for every candidate row evaluated by the outer query. These are typically slower and should be replaced with JOINs or CTEs where possible.",
    command: "-- Uncorrelated: Subquery runs once\nSELECT first_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);\n\n-- Correlated: Subquery runs once for EVERY employee row to check their department average\nSELECT e1.first_name, e1.salary, e1.department_id\nFROM employees e1\nWHERE e1.salary > (\n  SELECT AVG(e2.salary) \n  FROM employees e2 \n  WHERE e2.department_id = e1.department_id\n);"
  },
  {
    id: 146,
    title: "What are Foreign Key constraints and cascading actions?",
    category: "sql",
    difficulty: "medium",
    answer: "Foreign Keys enforce referential integrity between tables. When a referenced parent row is updated or deleted, you can configure cascading actions to define what happens to child rows:\n• ON DELETE CASCADE: Deletes child rows automatically when the parent row is deleted.\n• ON DELETE SET NULL: Sets child foreign key columns to NULL.\n• ON DELETE RESTRICT / NO ACTION: Blocks the deletion of the parent row if child references exist (Default behavior).",
    command: "-- Create foreign key with cascade delete rule\nCREATE TABLE order_items (\n  item_id INT PRIMARY KEY,\n  order_id INT,\n  product_id INT,\n  quantity INT,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE\n);"
  },
  {
    id: 147,
    title: "Using COALESCE to implement conditional queries dynamically",
    category: "sql",
    difficulty: "medium",
    answer: "COALESCE is useful for writing dynamic search filters in stored procedures or APIs. By passing optional search parameters alongside column checks, you can filter records dynamically without building dynamic SQL queries.",
    command: "-- Dynamic search where parameters can be NULL (if NULL, column matches itself)\nSELECT employee_id, first_name, job_id, department_id\nFROM employees\nWHERE department_id = COALESCE(:dept_param, department_id)\n  AND job_id = COALESCE(:job_param, job_id);"
  },
  {
    id: 148,
    title: "Difference between char, varchar, and text datatypes in databases",
    category: "sql",
    difficulty: "medium",
    answer: "• CHAR(N): Fixed-length string. If you insert a string shorter than N, the database pads it with trailing spaces. Best for fixed-length codes (ISO country codes, status chars).\n• VARCHAR(N): Variable-length string up to N characters. Stores exactly the length of the string plus a 1-2 byte length prefix. Best for names, addresses, and variable strings.\n• TEXT / CLOB: Unlimited length string (or up to 2-4GB). Typically stored off-row (outside the table's main data page) with pointers, resulting in slightly slower access times but supporting massive text payloads.",
    command: "-- Table definition using optimal character structures\nCREATE TABLE product_catalogue (\n  product_iso_code CHAR(3) PRIMARY KEY, -- e.g. 'USA', 'CAN'\n  product_name VARCHAR(100) NOT NULL,\n  product_description TEXT\n);"
  },
  {
    id: 149,
    title: "How to use NULLIF in SQL to avoid divide-by-zero errors?",
    category: "sql",
    difficulty: "medium",
    answer: "Dividing by zero causes runtime query crashes. The NULLIF(value1, value2) function compares two expressions. If they are equal, it returns NULL. Since dividing a number by NULL results in NULL instead of a crash, you can wrap divisor columns in NULLIF.",
    command: "-- Safely calculate percentage margin without crash risks if units_sold is 0\nSELECT product_id,\n       total_revenue / NULLIF(units_sold, 0) AS average_price_per_unit\nFROM sales_reports;"
  },
  {
    id: 150,
    title: "Analyzing execution plans using EXPLAIN ANALYZE for optimization",
    category: "sql",
    difficulty: "hard",
    answer: "Optimizing slow queries requires analyzing execution plans. Using 'EXPLAIN' displays the execution path estimated by the optimizer, while 'EXPLAIN ANALYZE' (or 'EXPLAIN (ANALYZE, BUFFERS)' in PostgreSQL) actually executes the query, outputting real-time timings and I/O buffer hits.\n\nKey plan metrics:\n• Seq Scan vs Index Scan: Sequential scans read entire tables; check if indexes should be added.\n• Nested Loops vs Hash Joins: Hash joins are preferred for large datasets.\n• Actual rows vs Estimated rows: A mismatch indicates stale statistics; update them with ANALYZE.\n• Shared hit/read: Buffer blocks read from RAM cache (hit) vs disk (read).",
    command: "-- Explain query execution details in PostgreSQL\nEXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT u.username, count(o.order_id)\nFROM users u\nJOIN orders o ON u.user_id = o.user_id\nWHERE u.registration_date > '2025-01-01'\nGROUP BY u.username;"
  },
  {
    id: 151,
    title: "SQL Transaction Isolation Levels and Concurrency Anomalies",
    category: "sql",
    difficulty: "hard",
    answer: "SQL-92 defines four transaction isolation levels to balance concurrency against data consistency anomalies. Higher isolation levels increase lock overhead and reduce transaction throughput.\n\nConcurrency Anomalies:\n1. Dirty Read: Transaction A reads uncommitted modifications made by Transaction B.\n2. Non-Repeatable Read: Transaction A reads a row, Transaction B updates that row and commits, and Transaction A re-reads the row to find different values.\n3. Phantom Read: Transaction A queries a range of rows, Transaction B inserts new rows in that range and commits, and Transaction A re-runs the query to find new rows.\n\nIsolation Levels:\n• Read Uncommitted: Allows all anomalies.\n• Read Committed: Prevents Dirty Reads (Default in Postgres, Oracle, SQL Server).\n• Repeatable Read: Prevents Dirty and Non-Repeatable Reads.\n• Serializable: Prevents all anomalies using lock-graphs or Optimistic Concurrency Control.",
    command: "-- Set transaction isolation level dynamically in a session\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n\n-- Example of starting transaction\nBEGIN;\n  SELECT balance FROM accounts WHERE id = 1;\nCOMMIT;"
  },
  {
    id: 152,
    title: "Writing Recursive CTEs to query hierarchical tree structures",
    category: "sql",
    difficulty: "hard",
    answer: "Recursive CTEs reference themselves to query hierarchical data structures (e.g. organizational hierarchies, bill-of-materials, network routings).\n\nStructure:\n1. Anchor Member: An initial query that serves as the baseline for recursion.\n2. UNION or UNION ALL: Combines the anchor results with the recursive results.\n3. Recursive Member: A query referencing the CTE name, joining it with the source table to traverse the hierarchy.",
    command: "-- Query organizational structure recursively, calculating hierarchy level\nWITH RECURSIVE org_chart AS (\n  -- Anchor Member: Root CEO\n  SELECT employee_id, first_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL\n\n  -- Recursive Member: Join CTE with employees to find direct reports\n  SELECT e.employee_id, e.first_name, e.manager_id, o.depth + 1\n  FROM employees e\n  JOIN org_chart o ON e.manager_id = o.employee_id\n)\nSELECT employee_id, first_name, manager_id, depth\nFROM org_chart\nORDER BY depth, employee_id;"
  },
  {
    id: 153,
    title: "Tuning Composite Indexes and the Leftmost Prefix Rule",
    category: "sql",
    difficulty: "hard",
    answer: "A composite index contains multiple columns (e.g. INDEX(col_a, col_b, col_c)). Designing these indexes requires understanding the leftmost prefix rule.\n\nRules:\n• The query planner can use the index if the query filters on columns from left to right (e.g. WHERE col_a = 5 or WHERE col_a = 5 AND col_b = 6).\n• If the query filters on col_b or col_c without filtering on col_a, the index cannot be traversed efficiently (leading to index scans or index skips).\n• Column ordering rule: Put highly selective columns (equality filters) first, followed by range filter columns.",
    command: "-- Create composite index\nCREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date, status);\n\n-- Uses index efficiently (Leftmost col matches)\nSELECT * FROM orders WHERE customer_id = 1045 AND order_date > '2026-01-01';\n\n-- Cannot use index effectively (Missing leftmost customer_id filter)\nSELECT * FROM orders WHERE order_date > '2026-01-01' AND status = 'COMPLETED';"
  },
  {
    id: 154,
    title: "Materialized Views vs Standard Views: Performance and Sync Mechanics",
    category: "sql",
    difficulty: "hard",
    answer: "• Standard View: A virtual table containing a saved SQL query. When queried, it executes the underlying query on the fly. It consumes no storage but incurs CPU overhead for complex joins.\n• Materialized View: A physical table that pre-calculates and stores the query results. Queries are extremely fast because they read pre-computed data from disk. However, the data can become stale, requiring manual or automated refreshes.\n\nRefresh methods:\n• REFRESH MATERIALIZED VIEW (Full): Locks and recalculates the entire view.\n• CONCURRENTLY: Refreshes the view using diff logs without locking read access (Requires a unique index on the materialized view).",
    command: "-- Create materialized view for heavy analytical query\nCREATE MATERIALIZED VIEW sales_summary_mv AS\nSELECT product_id, COUNT(*) AS sales_count, SUM(amount) AS total_revenue\nFROM sales\nGROUP BY product_id;\n\n-- Create unique index required for concurrent refreshes\nCREATE UNIQUE INDEX idx_sales_summary_prod ON sales_summary_mv(product_id);\n\n-- Refresh materialized view concurrently in background\nREFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary_mv;"
  },
  {
    id: 155,
    title: "Table Partitioning Strategies: Range, List, and Hash Partitioning",
    category: "sql",
    difficulty: "hard",
    answer: "Partitioning splits a massive table (e.g., 500GB+) into smaller physical segments (partitions) based on a partition key. This improves performance via partition pruning (the query planner ignores partitions that don't match the query filter) and simplifies maintenance.\n\nPartitioning types:\n• Range Partitioning: Segments data by value ranges (e.g., date ranges like monthly or yearly).\n• List Partitioning: Segments data based on an explicit list of values (e.g., country codes or regions).\n• Hash Partitioning: Distributes data across a fixed number of partitions using a hash function on the partition key. Best for balancing write I/O.",
    command: "-- Create parent partitioned table in PostgreSQL (Range partitioning by date)\nCREATE TABLE audit_logs (\n  log_id INT,\n  log_date DATE NOT NULL,\n  message TEXT\n) PARTITION BY RANGE (log_date);\n\n-- Create child partitions\nCREATE TABLE audit_logs_y2025 PARTITION OF audit_logs\n  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');\n\nCREATE TABLE audit_logs_y2026 PARTITION OF audit_logs\n  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');"
  },
  {
    id: 156,
    title: "Avoiding deadlocks in high-throughput SQL databases",
    category: "sql",
    difficulty: "hard",
    answer: "Deadlocks occur when two transactions hold locks on different resources, and each attempts to acquire a lock on the resource held by the other. The engine aborts one of the transactions to break the cycle.\n\nPrevention Strategies:\n• Acquire locks in a consistent order across all application transactions (e.g., always update 'users' before 'orders').\n• Keep transactions small and short. Avoid calling external HTTP APIs or performing user interactions inside transaction blocks.\n• Use SELECT ... FOR UPDATE with NOWAIT or SKIP LOCKED to fail fast or skip locked rows instead of waiting.",
    command: "-- Acquire lock, fail immediately if row is locked by another transaction\nSELECT balance FROM accounts\nWHERE id = 10\nFOR UPDATE NOWAIT;\n\n-- Queue processing: Skip locked rows to avoid blocking concurrent workers\nSELECT task_id, payload\nFROM task_queue\nWHERE status = 'PENDING'\nLIMIT 5\nFOR UPDATE SKIP LOCKED;"
  },
  {
    id: 157,
    title: "Pivoting and Unpivoting Data dynamically in SQL",
    category: "sql",
    difficulty: "hard",
    answer: "• Pivoting: Converts rows into columns, typically aggregating values for reporting dashboards.\n• Unpivoting: Converts columns back into rows, restructuring denormalized tables into a normalized format.\nIn databases lacking native PIVOT syntax, you can pivot data using conditional aggregation (CASE WHEN + SUM/MAX).",
    command: "-- Pivoting quarterly sales rows into distinct columns using CASE WHEN\nSELECT product_id,\n       SUM(CASE WHEN quarter = 'Q1' THEN sales_amount ELSE 0 END) AS Q1_sales,\n       SUM(CASE WHEN quarter = 'Q2' THEN sales_amount ELSE 0 END) AS Q2_sales,\n       SUM(CASE WHEN quarter = 'Q3' THEN sales_amount ELSE 0 END) AS Q3_sales,\n       SUM(CASE WHEN quarter = 'Q4' THEN sales_amount ELSE 0 END) AS Q4_sales\nFROM quarterly_sales\nGROUP BY product_id;"
  },
  {
    id: 158,
    title: "Explain index selectivity and B-Tree traversal mechanics",
    category: "sql",
    difficulty: "hard",
    answer: "Index selectivity represents the ratio of unique values in a column to the total row count. A column with high selectivity (e.g. primary key, UUID) is an excellent candidate for B-Tree indexing because traversing the index tree quickly isolates a single row.\n\nB-Tree Mechanics:\n• A B-Tree index has root, branch, and leaf nodes.\n• Leaf nodes contain key values and pointers (ROWIDs) to data blocks, linked as a doubly-linked list for fast range scans.\n• If a column has low selectivity (e.g., boolean status flags), the optimizer will bypass the index and perform a full table scan, as the cost of reading index blocks plus random table reads exceeds the cost of a sequential scan.",
    command: "-- Query index selectivity from database stats\nSELECT relname, n_distinct, description\nFROM pg_stat_user_tables;\n\n-- Create index on highly selective column\nCREATE INDEX idx_users_uuid ON users(uuid_string);"
  },
  {
    id: 159,
    title: "Optimizing database lock contention under write-heavy workloads",
    category: "sql",
    difficulty: "hard",
    answer: "Under write-heavy workloads, lock queues build up, causing connection timeouts.\n\nOptimization:\n• Use Multi-Version Concurrency Control (MVCC) so reads do not block writes, and writes do not block reads.\n• Avoid locking whole tables. Use fine-grained row-level locks.\n• Batch bulk inserts to minimize transaction overhead, but keep batch sizes small enough (~1000-5000 rows) to avoid lock escalations.\n• Use index-organized tables or partitioned indexes to distribute write I/O.",
    command: "-- Check lock types and waiting sessions in SQL Server/Postgres\nSELECT pid, mode, locktype, granted \nFROM pg_locks \nWHERE NOT granted;"
  },
  {
    id: 160,
    title: "Designing database triggers to audit data changes securely",
    category: "sql",
    difficulty: "hard",
    answer: "Triggers execute automatically in response to DML operations (INSERT, UPDATE, DELETE). They are commonly used to enforce security policies or audit data changes.\n\nBest Practices:\n• Keep triggers extremely fast; they run inside the client's transaction context and block completion.\n• Avoid calling external network APIs or heavy queries inside triggers.\n• Handle NULLs and conditional operations properly using OLD and NEW aliases.",
    command: "-- Create audit table\nCREATE TABLE audit_trail (\n  audit_id SERIAL PRIMARY KEY,\n  table_name VARCHAR(50),\n  action VARCHAR(10),\n  record_id INT,\n  changed_by VARCHAR(50),\n  changed_at TIMESTAMP DEFAULT NOW()\n);\n\n-- Create audit trigger function in PostgreSQL\nCREATE OR REPLACE FUNCTION audit_trigger_func()\nRETURNS TRIGGER AS $$\nBEGIN\n  INSERT INTO audit_trail(table_name, action, record_id, changed_by)\n  VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id), current_user);\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Bind trigger to employees table\nCREATE TRIGGER emp_audit_trigger\nAFTER UPDATE OR DELETE ON employees\nFOR EACH ROW EXECUTE FUNCTION audit_trigger_func();"
  },
  {
    id: 161,
    title: "Difference between logical replication and physical replication in PostgreSQL",
    category: "sql",
    difficulty: "hard",
    answer: "• Physical Replication: Copies the raw byte-for-byte data blocks of the database (WAL files). The standby database is an exact replica of the primary and must run the same major version. It replicates the entire instance, and the standby can only be open in read-only mode.\n• Logical Replication: Replicates SQL statements/data changes based on a publication/subscription model. It allows replicating specific tables rather than the entire instance. It supports cross-major-version replication (useful for zero-downtime upgrades) and allows the subscriber database to be open in read-write mode.",
    command: "-- On Primary: Create publication for specific tables\nCREATE PUBLICATION app_publication FOR TABLE users, orders;\n\n-- On Subscriber: Create subscription pointing to primary\nCREATE SUBSCRIPTION app_subscription \nCONNECTION 'host=primary_db port=5432 dbname=prod_db user=repl_user password=secret'\nPUBLICATION app_publication;"
  },
  {
    id: 162,
    title: "Optimizing SQL query cost using Optimizer Hints",
    category: "sql",
    difficulty: "hard",
    answer: "The query optimizer determines the execution plan for a query. While it usually makes the correct choice, stale statistics or complex query structures can lead to sub-optimal plans. In these cases, you can use optimizer hints to force a specific execution path.\n\nCaution: Hints should be used as a last resort in production. They can break if schemas or database versions change. Always prioritize gathering fresh statistics first.\n• Oracle/MySQL: Uses inline comments (e.g. /*+ INDEX(e idx_emp_sal) */).\n• PostgreSQL: PostgreSQL does not support hints natively; use parameters (like 'SET enable_seqscan = off') or pg_hint_plan.",
    command: "-- Force Oracle to use a specific index\nSELECT /*+ INDEX(e idx_emp_salary) */ first_name, salary\nFROM employees e\nWHERE salary > 80000;\n\n-- Force Oracle to use a Hash Join\nSELECT /*+ USE_HASH(e d) */ e.first_name, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id;"
  },
  {
    id: 163,
    title: "Troubleshooting database connection pools and max connection limits",
    category: "sql",
    difficulty: "hard",
    answer: "When client applications attempt to open more connections than the database allows, the database rejects new connections with errors like 'Too many connections' or 'Fatal: remaining connection slots are reserved'.\n\nResolution:\n• Set up a connection pooler (e.g. PgBouncer for PostgreSQL) to multiplex client connections.\n• Tune maximum connection parameters on the database server.\n• Optimize client pool settings to reuse active connections and prevent leaks.",
    command: "-- View current active connection counts by database in PostgreSQL\nSELECT datname, numbackends FROM pg_stat_database;\n\n-- View max connections setting\nSHOW max_connections;\n\n-- Adjust max connections (requires restart)\n-- ALTER SYSTEM SET max_connections = 500;"
  },
  {
    id: 164,
    title: "Handling character set conversion and collation conflicts in queries",
    category: "sql",
    difficulty: "hard",
    answer: "Joining tables with different character sets or collations (e.g., comparing latin1 vs utf8 strings) leads to collation mismatch errors.\n\nResolution:\n• Convert column collations during the join using the COLLATE clause.\n• Standardize database character sets to UTF-8.",
    command: "-- Resolve collation mismatch in SQL Server\nSELECT e.name, h.history_log\nFROM employees e\nJOIN employee_history h ON e.name = h.name COLLATE Latin1_General_CS_AS;\n\n-- Collation conversion in PostgreSQL\nSELECT * FROM products \nWHERE name COLLATE \"C\" = 'Sample';"
  },
  {
    id: 165,
    title: "Tuning query execution speed with covering index structures",
    category: "sql",
    difficulty: "hard",
    answer: "A covering index contains all columns referenced by a query (including columns in SELECT, JOIN, and WHERE clauses). When a covering index is available, the database can return query results directly from the index tree, skipping the table lookup step.\n\nOptimization:\n• Use the INCLUDE clause (PostgreSQL, SQL Server) to append non-key columns to an index. This keeps the index tree clean while providing covering benefits.",
    command: "-- Create index with included columns in PostgreSQL\nCREATE INDEX idx_orders_customer_include\nON orders(customer_id)\nINCLUDE (order_date, total_amount);\n\n-- This query performs an index-only scan, reading data directly from the index blocks\nSELECT order_date, total_amount\nFROM orders\nWHERE customer_id = 4580;"
  },
  {
    id: 166,
    title: "Optimizing bulk data imports using copy commands and staging tables",
    category: "sql",
    difficulty: "hard",
    answer: "Running millions of standard INSERT statements is slow because each insert incurs transactional overhead, index updates, and log writes.\n\nBulk import strategies:\n• Use the COPY command (or BULK INSERT) to stream raw files directly into a staging table.\n• Drop indexes and foreign key constraints on the staging table before importing, and recreate them afterward.\n• Perform data validation and transformations in the staging table before merging it into target production tables.",
    command: "-- PostgreSQL COPY command to stream a CSV file directly into a staging table\nCOPY staging_sales(product_id, units_sold, price, sale_date)\nFROM '/var/lib/postgresql/data/sales_data.csv'\nDELIMITER ',' CSV HEADER;\n\n-- Merge staging data into production table using MERGE or INSERT ON CONFLICT"
  },
  {
    id: 167,
    title: "Difference between Security Groups and Network Access Control Lists (NACLs)",
    category: "aws",
    difficulty: "easy",
    answer: "Both act as firewalls but function at different layers of your Virtual Private Cloud (VPC):\n• Security Group: Operates at the instance level (EC2). It is stateful (inbound allowed traffic automatically allows outbound response). It supports ALLOW rules only.\n• Network ACL (NACL): Operates at the subnet level. It is stateless (outbound responses must be explicitly allowed by rules). It supports both ALLOW and DENY rules. Rules are processed in numerical order.",
    command: "# Describe security groups in a specific VPC\naws ec2 describe-security-groups --filters Name=vpc-id,Values=vpc-08ac3024c125\n\n# Describe NACLs for a specific VPC\naws ec2 describe-network-acls --filters Name=vpc-id,Values=vpc-08ac3024c125"
  },
  {
    id: 168,
    title: "Explain Amazon S3 Storage Classes and lifecycle policies",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon S3 offers different storage classes to optimize cost based on data access patterns:\n• S3 Standard: High durability and availability for active data.\n• S3 Standard-IA (Infrequent Access): Lower storage cost, but retrieval fee. For data accessed less than once a month.\n• S3 Glacier Flexible Retrieval: Secure, low-cost archive with retrieval times from minutes to hours.\n• S3 Glacier Deep Archive: Lowest cost storage with retrievals in 12 hours.\nLifecycle policies automate transitions between these classes (e.g. move logs to Glacier after 30 days, then delete after 90 days).",
    command: "# Put a lifecycle configuration on an S3 bucket\naws s3api put-bucket-lifecycle-configuration \\\n  --bucket my-app-logs-bucket \\\n  --lifecycle-configuration file://lifecycle.json\n\n# Contents of lifecycle.json:\n# {\n#   \"Rules\": [\n#     {\n#       \"ID\": \"MoveLogsToGlacier\",\n#       \"Status\": \"Enabled\",\n#       \"Filter\": {\"Prefix\": \"logs/\"},\n#       \"Transitions\": [\n#         {\"Days\": 30, \"StorageClass\": \"GLACIER\"}\n#       ]\n#     }\n#   ]\n# }"
  },
  {
    id: 169,
    title: "How to configure the AWS CLI on a new system?",
    category: "aws",
    difficulty: "easy",
    answer: "To interact with AWS services from the terminal, configure your access keys. Running 'aws configure' prompts for four pieces of information:\n1. AWS Access Key ID\n2. AWS Secret Access Key\n3. Default Region Name (e.g. us-east-1)\n4. Default Output Format (json, text, or table)\nThese settings are saved in credentials and config files in ~/.aws/.",
    command: "# Start interactive configuration\naws configure\n\n# Verify your identity and permissions\naws sts get-caller-identity\n\n# List files in the configuration directory\nls -l ~/.aws/"
  },
  {
    id: 170,
    title: "What is an Elastic IP address vs Public IP in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "• Public IP: Dynamically assigned to an EC2 instance. It changes every time the instance is stopped and started. This breaks external DNS or firewall white-lists.\n• Elastic IP (EIP): A static, public IPv4 address allocated to your AWS account. You can associate it with any EC2 instance. It remains unchanged even if the instance is stopped or restarted.",
    command: "# Allocate an Elastic IP address in your region\naws ec2 allocate-address --domain vpc\n\n# Associate an Elastic IP with an EC2 instance\naws ec2 associate-address --instance-id i-0482ac8c21 --public-ip 54.210.14.85"
  },
  {
    id: 171,
    title: "How do you check EC2 instance status and details using AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "Use 'aws ec2' commands to list, filter, and inspect virtual machines. Use the query parameter to return specific properties, such as IP addresses or instance states, in a clean format.",
    command: "# List all running EC2 instances with ID and Type\naws ec2 describe-instances \\\n  --filters \"Name=instance-state-name,Values=running\" \\\n  --query \"Reservations[*].Instances[*].[InstanceId,InstanceType,PublicIpAddress]\" \\\n  --output table"
  },
  {
    id: 172,
    title: "Explain the difference between an IAM User, Group, and Role",
    category: "aws",
    difficulty: "easy",
    answer: "• IAM User: An identity representing a single person or service that interacts with AWS. It has long-term credentials (password, access keys).\n• IAM Group: A collection of users. You assign permissions to a group so all members inherit them, simplifying user management.\n• IAM Role: An identity with temporary credentials. It is assumed by services (e.g. EC2) or users from other accounts, avoiding the need to hardcode credentials in applications.",
    command: "# Create a new IAM Group\naws iam create-group --group-name DBA-Admins\n\n# Attach a policy to the group\naws iam attach-group-policy \\\n  --group-name DBA-Admins \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess"
  },
  {
    id: 173,
    title: "What is Amazon Route 53 and what are A vs CNAME records?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon Route 53 is a highly available and scalable Domain Name System (DNS) service.\n• A Record (Address): Maps a domain name directly to an IPv4 address (e.g., app.com -> 54.2.14.8).\n• CNAME Record (Canonical Name): Maps a domain name to another domain name (e.g., www.app.com -> app-load-balancer-1234.us-east-1.elb.amazonaws.com). Route 53 also supports Alias records, which act like CNAMEs but route directly to AWS resources (like ELBs or S3 buckets) without incurring extra DNS query charges.",
    command: "# List hosted zones in your Route 53 account\naws route53 list-hosted-zones\n\n# List resource record sets in a specific hosted zone\naws route53 list-resource-record-sets --hosted-zone-id Z0482937108"
  },
  {
    id: 174,
    title: "How to enable billing alerts and alarms in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "To prevent unexpected cloud bills, enable billing alerts in the Billing Console. This publishes metrics to CloudWatch in the us-east-1 region. You can then create a CloudWatch alarm to send email notifications via Simple Notification Service (SNS) when costs exceed a defined threshold.",
    command: "# Create a CloudWatch alarm to trigger when monthly charges exceed $100\naws cloudwatch put-metric-alarm \\\n  --alarm-name \"Monthly-Budget-Alarm\" \\\n  --metric-name EstimatedCharges \\\n  --namespace AWS/Billing \\\n  --statistic Maximum \\\n  --period 21600 \\\n  --evaluation-periods 1 \\\n  --threshold 100 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=Currency,Value=USD \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:billing-alerts-topic"
  },
  {
    id: 175,
    title: "Explain the difference between a public subnet and private subnet",
    category: "aws",
    difficulty: "easy",
    answer: "Both subnets exist inside a Virtual Private Cloud (VPC) but differ in routing configuration:\n• Public Subnet: Its route table contains an entry pointing to an Internet Gateway (IGW), allowing resources inside the subnet to communicate directly with the internet.\n• Private Subnet: Its route table does not contain a path to an IGW. To download updates, resources in a private subnet route traffic through a Network Address Translation (NAT) Gateway placed in a public subnet.",
    command: "# Describe subnets in your VPC\naws ec2 describe-subnets --filters \"Name=vpc-id,Values=vpc-08ac3024c125\""
  },
  {
    id: 176,
    title: "How to stop, start, and reboot EC2 instances using the AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "You can manage the lifecycle of your virtual instances using the AWS CLI. Stopping an instance stops billing for compute resources, but EBS volumes continue to incur storage fees. Rebooting performs an operating system restart without changing the underlying physical host.",
    command: "# Stop a running EC2 instance\naws ec2 stop-instances --instance-ids i-085fac801\n\n# Start a stopped EC2 instance\naws ec2 start-instances --instance-ids i-085fac801\n\n# Reboot an instance online\naws ec2 reboot-instances --instance-ids i-085fac801"
  },
  {
    id: 177,
    title: "What is Amazon CloudWatch and what are basic vs detailed monitoring?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon CloudWatch is a monitoring and management service that collects performance data and log files from AWS resources.\n• Basic Monitoring: Enabled by default for EC2 instances. It collects metrics (CPU, disk, network) at 5-minute intervals at no additional charge.\n• Detailed Monitoring: Collects metrics at 1-minute intervals for an additional charge, allowing you to react quickly to scaling events.",
    command: "# Enable detailed monitoring on an EC2 instance\naws ec2 monitor-instances --instance-ids i-085fac801\n\n# Disable detailed monitoring (revert to basic)\naws ec2 unmonitor-instances --instance-ids i-085fac801"
  },
  {
    id: 178,
    title: "How to create an IAM role for EC2 to access S3 buckets?",
    category: "aws",
    difficulty: "easy",
    answer: "Hardcoding AWS access keys inside code running on EC2 is a major security risk. Instead, create an IAM Role with permissions to access the S3 bucket, and attach it to the EC2 instance as an Instance Profile. The AWS SDK retrieves temporary credentials automatically.",
    command: "# Create the IAM role with trust policy (trusts EC2 service)\naws iam create-role --role-name EC2-S3-ReadOnly-Role --assume-role-policy-document file://trust_policy.json\n\n# Attach ReadOnly S3 access policy\naws iam attach-role-policy --role-name EC2-S3-ReadOnly-Role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess\n\n# Create instance profile and associate with EC2\naws iam create-instance-profile --instance-profile-name EC2-S3-Profile\naws iam add-role-to-instance-profile --instance-profile-name EC2-S3-Profile --role-name EC2-S3-ReadOnly-Role"
  },
  {
    id: 179,
    title: "What is the AWS KMS (Key Management Service) and customer managed vs AWS managed keys?",
    category: "aws",
    difficulty: "easy",
    answer: "AWS Key Management Service (KMS) manages cryptographic keys used to encrypt data at rest across AWS services (EBS, RDS, S3).\n• AWS Managed Keys: Created and managed automatically by AWS on your behalf. They are free, but their key policies cannot be modified, and they cannot be shared across AWS accounts.\n• Customer Managed Keys (CMKs): Created by you. You have full control over their key policies, rotation schedules, and cross-account access. They cost $1/key/month.",
    command: "# List KMS keys in your AWS account\naws kms list-keys\n\n# Create a new Customer Managed Key\naws kms create-key --description \"My Database Backup Key\""
  },
  {
    id: 180,
    title: "How to configure VPC Peering between two separate Virtual Private Clouds?",
    category: "aws",
    difficulty: "medium",
    answer: "VPC Peering connects two VPCs, allowing resources in either network to communicate using private IP addresses. It does not support transitive routing (e.g. if A is peered to B, and B to C, A cannot access C without a direct peer).\n\nSetup Steps:\n1. Send a Peering Connection Request from the requester VPC to the accepter VPC.\n2. Accept the Peering Request in the accepter VPC.\n3. Add routes in the route tables of both VPCs pointing to the peering connection ID (pcx-xxxx) for the destination CIDR block.",
    command: "# Create VPC Peering connection request\naws ec2 create-vpc-peering-connection \\\n  --vpc-id vpc-01111111111111111 (Requester) \\\n  --peer-vpc-id vpc-02222222222222222 (Accepter)\n\n# Accept the peering connection request\naws ec2 accept-vpc-peering-connection \\\n  --vpc-peering-connection-id pcx-0123456789abcdef0"
  },
  {
    id: 181,
    title: "Writing a secure IAM Policy in JSON restricting S3 bucket access",
    category: "aws",
    difficulty: "medium",
    answer: "IAM policies define permissions. Always write policies adhering to the Principle of Least Privilege. Specify exactly which actions are allowed on which resources, and use condition keys (like source IP addresses) to restrict access.",
    command: "# Put a bucket policy to restrict access to a specific IP address\naws s3api put-bucket-policy --bucket secure-data-bucket --policy file://policy.json\n\n# Contents of policy.json:\n# {\n#   \"Version\": \"2012-10-17\",\n#   \"Statement\": [\n#     {\n#       \"Effect\": \"Deny\",\n#       \"Principal\": \"*\",\n#       \"Action\": \"s3:*\",\n#       \"Resource\": [\n#         \"arn:aws:s3:::secure-data-bucket\",\n#         \"arn:aws:s3:::secure-data-bucket/*\"\n#       ],\n#       \"Condition\": {\n#         \"NotIpAddress\": {\"aws:SourceIp\": \"192.168.1.0/24\"}\n#       }\n#     }\n#   ]\n# }"
  },
  {
    id: 182,
    title: "Configuring EC2 Auto Scaling Groups and scaling policies",
    category: "aws",
    difficulty: "medium",
    answer: "Auto Scaling Groups (ASG) dynamically scale the number of EC2 instances up or down based on resource demands.\n\nKey parameters:\n• Launch Template: Defines the AMI, instance type, security groups, and key pairs to use when launching new instances.\n• Min, Max, and Desired Capacity: Restricts the scale limits.\n• Target Tracking Scaling Policy: Adjusts instances dynamically to keep a metric (like average CPU utilization) at a target percentage (e.g. keep CPU at 60%).",
    command: "# Create a scaling policy using CPU target tracking\naws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name my-web-asg \\\n  --policy-name cpu-60-tracking-policy \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration file://scaling_config.json\n\n# Contents of scaling_config.json:\n# {\n#   \"TargetValue\": 60.0,\n#   \"PredefinedMetricSpecification\": {\n#     \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"\n#   }\n# }"
  },
  {
    id: 183,
    title: "AWS CloudFront CDN: Origin Access Control (OAC) vs Origin Access Identity (OAI)",
    category: "aws",
    difficulty: "medium",
    answer: "To secure a static website hosted in S3, bypass direct public S3 URLs and force users to access the site through CloudFront. This allows you to enforce SSL, geoblocking, and caching benefits.\n\nOrigin Access Identity (OAI) vs Origin Access Control (OAC):\n• OAI: Legacy method. It restricts S3 bucket access to a specific CloudFront identity, but it does not support SSE-KMS encryption or modern S3 upload techniques.\n• OAC: Modern, recommended method. It supports KMS encryption, POST requests, and offers improved security settings.",
    command: "# Describe CloudFront distribution details\naws cloudfront list-distributions"
  },
  {
    id: 184,
    title: "Managing secrets securely using AWS Systems Manager (SSM) Parameter Store",
    category: "aws",
    difficulty: "medium",
    answer: "Avoid committing database credentials or API keys directly to git repositories. Store them securely in AWS Systems Manager (SSM) Parameter Store as SecureString parameters, encrypted using AWS KMS. Applications can retrieve them dynamically using the AWS SDK.",
    command: "# Store database password securely in Parameter Store\naws ssm put-parameter \\\n  --name \"/prod/database/password\" \\\n  --value \"SuperSecretPassword123\" \\\n  --type \"SecureString\" \\\n  --key-id \"alias/aws/ssm\" \\\n  --overwrite\n\n# Retrieve decrypted password\naws ssm get-parameter \\\n  --name \"/prod/database/password\" \\\n  --with-decryption \\\n  --query \"Parameter.Value\" \\\n  --output text"
  },
  {
    id: 185,
    title: "How to configure S3 Bucket CORS (Cross-Origin Resource Sharing)?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Origin Resource Sharing (CORS) defines rules allowing web applications running in one domain to access assets (like images or JSON files) hosted in a different domain (an S3 bucket). By default, browsers block these cross-origin requests for security reasons.",
    command: "# Apply CORS configuration to a bucket\naws s3api put-bucket-cors \\\n  --bucket my-assets-bucket \\\n  --cors-configuration file://cors.json\n\n# Contents of cors.json:\n# {\n#   \"CORSRules\": [\n#     {\n#       \"AllowedHeaders\": [\"*\"],\n#       \"AllowedMethods\": [\"GET\", \"HEAD\"],\n#       \"AllowedOrigins\": [\"https://my-app.com\"],\n#       \"MaxAgeSeconds\": 3000\n#     }\n#   ]\n# }"
  },
  {
    id: 186,
    title: "What is an Application Load Balancer (ALB) and path-based routing?",
    category: "aws",
    difficulty: "medium",
    answer: "An Application Load Balancer (ALB) operates at Layer 7 (Application Layer) of the OSI model. It routes incoming traffic to Target Groups (instances or containers) based on request attributes, such as HTTP headers, methods, or URL paths (e.g. route /api to API servers, and /static to asset servers).",
    command: "# Describe load balancers in your account\naws elb describe-load-balancers\n\n# List target groups configured for the load balancer\naws elds describe-target-groups"
  },
  {
    id: 187,
    title: "How to configure custom CloudWatch Alarms for EC2 Disk Space usage?",
    category: "aws",
    difficulty: "medium",
    answer: "By default, AWS cannot see the internal state of your EC2 instances (such as memory usage or disk partition space) due to virtualization boundaries. To monitor these, install the CloudWatch Agent inside the EC2 operating system. The agent pushes metrics to CloudWatch, allowing you to create custom disk alarms.",
    command: "# Put a metric alarm on a custom metric reported by the agent\naws cloudwatch put-metric-alarm \\\n  --alarm-name \"High-Disk-Usage-Alarm\" \\\n  --metric-name disk_used_percent \\\n  --namespace CWAgent \\\n  --statistic Average \\\n  --period 300 \\\n  --evaluation-periods 2 \\\n  --threshold 85 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=InstanceId,Value=i-0482ac8c21 Name=path,Value=/ \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:admin-alerts"
  },
  {
    id: 188,
    title: "Difference between NAT Gateway and NAT Instance in AWS",
    category: "aws",
    difficulty: "medium",
    answer: "Both allow instances in private subnets to connect to the internet while blocking incoming connections:\n• NAT Instance: A virtual machine configured to perform NAT. It is managed by you. It does not scale automatically and represents a single point of failure unless configured in an HA pair.\n• NAT Gateway: A managed AWS service. It scales automatically, provides high availability within an AZ, and supports bandwidth up to 45 Gbps. It requires no maintenance but incurs higher hourly and data processing fees.",
    command: "# Describe active NAT gateways in your VPC\naws ec2 describe-nat-gateways"
  },
  {
    id: 189,
    title: "DynamoDB read/write capacity modes: On-Demand vs Provisioned Capacity",
    category: "aws",
    difficulty: "medium",
    answer: "DynamoDB charges based on read/write throughput and storage:\n• Provisioned Capacity Mode: You specify the exact Read Capacity Units (RCU) and Write Capacity Units (WCU) your application requires. You can configure auto-scaling. It is cost-effective for predictable workloads.\n• On-Demand Mode: DynamoDB scales throughput automatically to handle traffic spikes. You pay exactly for the requests you make (no capacity planning needed). It is best for unpredictable or low-traffic workloads.",
    command: "# Create a DynamoDB table with Provisioned Capacity (5 RCU, 5 WCU)\naws dynamodb create-table \\\n  --table-name Users \\\n  --attribute-definitions AttributeName=UserId,AttributeType=S \\\n  --key-schema AttributeName=UserId,KeyType=HASH \\\n  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5"
  },
  {
    id: 190,
    title: "How to configure cross-region replication (CRR) in Amazon S3?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Region Replication (CRR) replicates S3 objects automatically from a source bucket in one region to a destination bucket in a different region. This is useful for disaster recovery or compliance requirements.\n\nPrerequisites:\n• Both source and destination buckets must have Versioning enabled.\n• An IAM Role must be configured to grant S3 permissions to replicate objects across regions.",
    command: "# Enable versioning on source bucket\naws s3api put-bucket-versioning \\\n  --bucket source-bucket \\\n  --versioning-configuration Status=Enabled\n\n# Enable versioning on destination bucket\naws s3api put-bucket-versioning \\\n  --bucket destination-bucket \\\n  --versioning-configuration Status=Enabled"
  },
  {
    id: 191,
    title: "What is Amazon RDS database backup and retention policy management?",
    category: "aws",
    difficulty: "medium",
    answer: "Amazon RDS automates database backups. By default, it takes a daily full snapshot and archives database transaction logs (transaction logs are updated every 5 minutes), allowing Point-In-Time Recovery (PITR) to any second within the retention period (default 7 days, max 35 days). Disabling backups (setting retention to 0) deletes all automated snapshots.",
    command: "# Modify RDS instance to increase backup retention period to 14 days\naws rds modify-db-instance \\\n  --db-instance-identifier prod-db-instance \\\n  --backup-retention-period 14 \\\n  --apply-immediately"
  },
  {
    id: 192,
    title: "How to encrypt existing unencrypted EBS volumes using KMS?",
    category: "aws",
    difficulty: "medium",
    answer: "You cannot encrypt an existing active EBS volume directly. To encrypt an unencrypted volume, follow this workaround:\n1. Create a Snapshot of the unencrypted volume.\n2. Copy the snapshot, checking the Encryption box and selecting a KMS key.\n3. Create a new EBS volume from the encrypted snapshot.\n4. Swap the old volume with the new encrypted volume.",
    command: "# 1. Create a snapshot of unencrypted volume\naws ec2 create-snapshot --volume-id vol-08ac3021\n\n# 2. Copy the snapshot, encrypting the copy with KMS\naws ec2 copy-snapshot \\\n  --source-region us-east-1 \\\n  --source-snapshot-id snap-012345 \\\n  --encrypted \\\n  --kms-key-id alias/aws/ebs"
  },
  {
    id: 193,
    title: "Designing a highly available multi-tier architecture in AWS",
    category: "aws",
    difficulty: "hard",
    answer: "A production enterprise application should be designed for high availability and disaster recovery across multiple Availability Zones (AZs):\n• Tier 1 (Presentation): Public-facing Application Load Balancers (ALBs) distributed across public subnets in multiple AZs.\n• Tier 2 (Application): Auto Scaling Groups (ASG) running instances in private subnets, managed by CPU/request target tracking policies.\n• Tier 3 (Database): Multi-AZ Amazon RDS instances in private subnets (primary in AZ-A, synchronous standby in AZ-B).\n• Security: Restrict Security Groups so database instances only accept connections from application servers, and application servers only accept connections from the ALB.",
    command: "# Describe target health of a load balancer to monitor instances across AZs\naws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/app-tg/085ac12"
  },
  {
    id: 194,
    title: "How to configure cross-account access using IAM Role Assumption?",
    category: "aws",
    difficulty: "hard",
    answer: "Cross-account access allows users in Account A (Production) to perform actions in Account B (Development) without logging in and out. This is secured using IAM Role Assumption.\n\nSteps:\n1. In Account B (Target): Create an IAM Role. The trust policy must allow Account A's root ID to assume it.\n2. In Account B: Attach permissions (e.g. read access) to the role.\n3. In Account A (Source): Create a policy allowing users to run `sts:assume-role` on the role ARN in Account B.",
    command: "# Assume the role in the destination account (Account B)\naws sts assume-role \\\n  --role-arn arn:aws:iam::222222222222:role/CrossAccountRDSAdminRole \\\n  --role-session-name \"DBA-CrossAccountSession\"\n\n# Save the returned AccessKeyId, SecretAccessKey, and SessionToken to environment variables"
  },
  {
    id: 195,
    title: "AWS Transit Gateway Architecture and Hub-and-Spoke routing configuration",
    category: "aws",
    difficulty: "hard",
    answer: "As network complexity grows, VPC peering becomes unmanageable (N*(N-1)/2 connections). AWS Transit Gateway acts as a cloud router, connecting thousands of VPCs in a hub-and-spoke model.\n\nImplementation:\n1. Create the Transit Gateway (TGW).\n2. Attach VPCs to the TGW.\n3. Configure Transit Gateway Route Tables to control traffic routing between attachments.\n4. Update individual VPC route tables to route target network CIDRs through the Transit Gateway attachment.",
    command: "# Create a Transit Gateway\naws ec2 create-transit-gateway --description \"Enterprise-Central-Router\"\n\n# Attach a VPC to the Transit Gateway\naws ec2 create-transit-gateway-vpc-attachment \\\n  --transit-gateway-id tgw-08acf1428a \\\n  --vpc-id vpc-08ac3024c125 \\\n  --subnet-ids subnet-01111111 subnet-02222222"
  },
  {
    id: 196,
    title: "Configuring VPC Endpoints: Gateway Endpoints vs Interface Endpoints (Privatelink)",
    category: "aws",
    difficulty: "hard",
    answer: "By default, instances in private subnets connecting to S3, DynamoDB, or AWS APIs route traffic over the internet (via a NAT Gateway). VPC Endpoints allow private connections to these services without leaving the Amazon network.\n\nGateway Endpoints:\n• Supported only for S3 and DynamoDB.\n• Free to use. They update VPC route tables directly to route target traffic through the gateway endpoint.\n\nInterface Endpoints (AWS PrivateLink):\n• Supported for all other AWS services (KMS, EC2, CloudWatch) and SaaS apps.\n• Charge an hourly fee plus data processing fees. They provision Elastic Network Interfaces (ENIs) with private IP addresses inside your subnets.",
    command: "# Create a Gateway Endpoint for Amazon S3 in your VPC\naws ec2 create-vpc-endpoint \\\n  --vpc-id vpc-08ac3024c125 \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids rtb-0123456789abcdef0"
  },
  {
    id: 197,
    title: "How to troubleshoot KMS key policy lockouts and access failures?",
    category: "aws",
    difficulty: "hard",
    answer: "If an IAM policy grants full access to KMS, but the KMS key policy does not explicitly trust the IAM user, access is denied. If you misconfigure a Customer Managed Key policy, you can lock yourself out, preventing any user (including root) from managing the key.\n\nKey rules:\n• To allow IAM policies to grant access to a key, the key policy must include a statement trusting the root account (arn:aws:iam::account-id:root).\n• If locked out, you must contact AWS Support to resolve key policy issues.",
    command: "# Get the policy configuration for a KMS key to inspect rules\naws kms get-key-policy --key-id 1234abcd-12ab-34cd-56ef-1234567890ab --policy-name default"
  },
  {
    id: 198,
    title: "AWS Organizations: Service Control Policies (SCPs) and permissions boundaries",
    category: "aws",
    difficulty: "hard",
    answer: "Service Control Policies (SCPs) manage permissions across all AWS accounts in your AWS Organization. SCPs define a boundary for the maximum permissions that can be granted. Even if an IAM user has AdministratorAccess, an SCP deny rule overrides all local policies.\n\nKey use cases:\n• Prevent child accounts from leaving the organization.\n• Restrict AWS services or regions that can be used (e.g. block launching resources outside us-east-1).\n• Block users from disabling CloudTrail or deleting S3 logs.",
    command: "# Describe Service Control Policies in your organization\naws organizations list-policies --filter SERVICE_CONTROL_POLICY"
  },
  {
    id: 199,
    title: "Lambda serverless VPC networking: cold starts and ENI scaling limits",
    category: "aws",
    difficulty: "hard",
    answer: "When a Lambda function runs inside a VPC, it can access database resources (like RDS) securely using private IP addresses. However, this has historically caused severe cold starts while Lambda provisioned an Elastic Network Interface (ENI).\n\nModern VPC Networking (AWS Hyperplane):\n• Lambda shares pre-provisioned network interfaces (Hyperplane ENIs) across functions. This reduces cold start overhead to sub-second levels.\n• Cold starts still occur if the function scale spikes rapidly, exhausting subnets' private IP capacity.",
    command: "# Create a Lambda function connected to subnets and security groups in a VPC\naws lambda create-function \\\n  --function-name my-vpc-function \\\n  --runtime nodejs18.x \\\n  --role arn:aws:iam::123456789012:role/lambda-vpc-role \\\n  --handler index.handler \\\n  --zip-file fileb://function.zip \\\n  --vpc-config SubnetIds=subnet-01111111,subnet-02222222,SecurityGroupIds=sg-08ac12"
  },
  {
    id: 200,
    title: "Configuring Route 53 Latency-Based and Failover DNS Routing Policies",
    category: "aws",
    difficulty: "hard",
    answer: "Route 53 supports advanced routing policies for global, high-performance applications:\n• Latency-Based Routing: Routes user requests to the AWS region that provides the lowest network latency.\n• Failover Routing (Active-Passive): Uses Route 53 Health Checks to monitor your primary endpoint. If the primary health check fails, Route 53 automatically redirects traffic to a passive secondary endpoint (e.g., a static S3 error site).",
    command: "# List Route 53 health checks configured in your account\naws route53 list-health-checks"
  },
  {
    id: 201,
    title: "AWS CloudFormation vs Terraform: IaC state management and drift detection",
    category: "aws",
    difficulty: "hard",
    answer: "• CloudFormation: A native AWS IaC service. It saves state files automatically and manages resources within a CloudFormation stack. It supports drift detection to find manual configuration changes made outside IaC.\n• Terraform: An open-source multi-cloud IaC tool. It saves state locally or in a remote backend (such as an S3 bucket with DynamoDB locking). Terraform uses state files to map configuration code to real-world resources.",
    command: "# Check for drift on a CloudFormation stack\naws cloudformation detect-stack-drift --stack-name production-vpc-stack\n\n# Check drift status results\naws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id 1234-abcd"
  },
  {
    id: 202,
    title: "Configuring S3 Object Lock for WORM (Write Once Read Many) Compliance",
    category: "aws",
    difficulty: "hard",
    answer: "S3 Object Lock enforces WORM (Write Once, Read Many) compliance to protect objects from deletion or modification. This is critical for regulatory audits and ransomware protection.\n\nModes:\n• Governance Mode: Users with specific IAM permissions (BypassGovernanceRetention) can override retention settings.\n• Compliance Mode: No user (including the root account) can override retention settings or delete the object during its retention window.\n• Legal Hold: Blocks deletion indefinitely. It must be manually disabled.",
    command: "# Enable legal hold on an S3 object to prevent deletion\naws s3api put-object-legal-hold \\\n  --bucket compliance-vault-bucket \\\n  --key Q4_report.pdf \\\n  --legal-hold Status=ON"
  },
  {
    id: 203,
    title: "Troubleshooting EC2 connection drops and network path analysis using Reachability Analyzer",
    category: "aws",
    difficulty: "hard",
    answer: "When an EC2 instance cannot communicate with another instance or database, check for routing issues using AWS Reachability Analyzer. It simulates network paths through security groups, NACLs, and route tables without sending actual traffic.",
    command: "# Start path analysis between source instance and database instance\naws ec2 start-network-insights-analysis \\\n  --network-insights-path-id nip-08ac30f14a"
  },
  {
    id: 204,
    title: "Tuning CloudWatch Agent configuration files on EC2 for custom log collection",
    category: "aws",
    difficulty: "hard",
    answer: "The CloudWatch Agent collects system logs and custom application logs from EC2 instances. It is configured using a JSON schema (`amazon-cloudwatch-agent.json`) to define which files to watch, log group structures, and rotation rules.",
    command: "# Push updated agent configuration file from Systems Manager Parameter Store\naws ssm put-parameter \\\n  --name \"AmazonCloudWatch-AgentConfig\" \\\n  --value file://amazon-cloudwatch-agent.json \\\n  --type \"String\" \\\n  --overwrite"
  },
  {
    id: 205,
    title: "Configuring cross-region read replicas for MySQL/PostgreSQL RDS",
    category: "aws",
    difficulty: "hard",
    answer: "Cross-region read replicas improve read latency for global users and serve as a disaster recovery solution.\n\nMechanics:\n• AWS uses asynchronous replication to sync changes to the secondary region.\n• During promotion, replication lag must be minimized to avoid data loss.\n• Promoting a replica breaks replication, making it a standalone primary database.",
    command: "# Create cross-region read replica in us-west-2 from us-east-1 primary\naws rds create-db-instance-read-replica \\\n  --db-instance-identifier prod-replica-west \\\n  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:prod-db-primary \\\n  --region us-west-2"
  },
  {
    id: 206,
    title: "Designing AWS RDS custom DB parameter groups for memory tuning",
    category: "aws",
    difficulty: "hard",
    answer: "Amazon RDS instances are optimized using DB Parameter Groups. You cannot edit default parameter groups; you must create a custom group, modify parameters (such as shared_buffers, work_mem, or max_connections), and apply the group to your RDS instance.",
    command: "# Create a custom parameter group for PostgreSQL 15\naws rds create-db-parameter-group \\\n  --db-parameter-group-name custom-pg15 \\\n  --db-parameter-group-family postgres15 \\\n  --description \"Custom PostgreSQL 15 parameters\"\n\n# Modify parameters dynamically in the group\naws rds modify-db-parameter-group \\\n  --db-parameter-group-name custom-pg15 \\\n  --parameters \"ParameterName=work_mem,ParameterValue=16384,ApplyMethod=immediate\""
  },
  {
    id: 207,
    title: "Managing CloudFront cache invalidation and Cache Behaviours",
    category: "aws",
    difficulty: "hard",
    answer: "CloudFront caches content at edge locations based on Time-To-Live (TTL) settings. When you push updates to S3, users may continue to see cached, stale content until the TTL expires. To force immediate updates, create a cache invalidation request.",
    command: "# Create invalidation request to clear all files under the /assets/ path\naws cloudfront create-invalidation \\\n  --distribution-id E1234567890ABC \\\n  --paths \"/assets/*\""
  },
  {
    id: 208,
    title: "Troubleshooting Amazon EKS (Kubernetes) Node Joining and Cluster Autoscaler issues",
    category: "aws",
    difficulty: "hard",
    answer: "When worker nodes fail to join an EKS cluster, check the node's bootstrap logs. Common causes include:\n• Missing or misconfigured IAM Roles in the aws-auth ConfigMap.\n• Worker nodes cannot communicate with the EKS control plane due to security group rules or route issues in private subnets.",
    command: "# Retrieve active Kubernetes auth config map from EKS\naws eks update-kubeconfig --name production-cluster\nkubectl get configmap aws-auth -n kube-system -o yaml"
  },
  {
    id: 209,
    title: "AWS API Gateway: Private integration with VPC Link to internal load balancers",
    category: "aws",
    difficulty: "hard",
    answer: "To expose internal backend services (running on ECS or EC2 behind a private ALB) securely, use API Gateway with a VPC Link. This routes traffic from public API Gateway endpoints directly to private VPC resources without exposing them to the internet.",
    command: "# List active VPC links configured in API Gateway\naws apigatewayv2 get-vpc-links"
  },
  {
    id: 210,
    title: "Tuning AWS DynamoDB Global Tables and Multi-Region Replication Conflict Resolution",
    category: "aws",
    difficulty: "hard",
    answer: "DynamoDB Global Tables provide active-active multi-region replication. DynamoDB replicates data updates automatically across all participant regions.\n\nConflict Resolution:\n• DynamoDB uses Last-Write-Wins (LWW) conflict resolution based on timestamps. The region with the latest update timestamp wins conflicts.",
    command: "# Update an existing table to enable global replication to us-west-2\naws dynamodb update-table \\\n  --table-name Users \\\n  --replica-updates \"Create={RegionName=us-west-2}\""
  },
  {
    id: 211,
    title: "How to read command-line arguments in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash scripts can accept command-line arguments. These are automatically assigned to positional parameters:\n• $1, $2, $3...: First, second, third arguments.\n• $0: The name of the script itself.\n• $#: The number of arguments passed.\n• $@: All positional parameters as separate words (preferred over $*).\n• $*: All positional parameters as a single word.",
    command: "# Create a script to print arguments\ncat << 'EOF' > arg_test.sh\n#!/bin/bash\necho \"Script Name: $0\"\necho \"Total Arguments: $#\"\necho \"First Arg: $1\"\necho \"Second Arg: $2\"\necho \"All Args (List): $@\"\nEOF\n\nchmod +x arg_test.sh\n./arg_test.sh param1 param2"
  },
  {
    id: 212,
    title: "How to check if a file or directory exists using if conditions?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can perform file testing checks inside conditional brackets [ ] or [[ ]]:\n• -f file: True if the file exists and is a regular file.\n• -d dir: True if the directory exists.\n• -e path: True if the path exists (regardless of type).\n• -r path: True if readable.\n• -w path: True if writable.",
    command: "# Check if /etc/hosts exists and is a file\nif [ -f \"/etc/hosts\" ]; then\n  echo \"/etc/hosts exists.\"\nfi\n\n# Check if backup directory exists, create if missing\nBACKUP_DIR=\"/tmp/backup\"\nif [ ! -d \"$BACKUP_DIR\" ]; then\n  mkdir -p \"$BACKUP_DIR\"\nfi"
  },
  {
    id: 213,
    title: "Explain exit status codes ($?) and how to use them for error handling?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Every Linux command returns an exit status code (0 to 255) upon completion:\n• 0: Success.\n• Non-Zero (1-255): Failure or specific error state.\n\nYou can query this status code using the special variable '$?' immediately after running a command, or evaluate it in conditionals.",
    command: "# Ping a server and check if it is online\nping -c 1 -W 2 google.com > /dev/null 2>&1\nSTATUS=$?\n\nif [ $STATUS -eq 0 ]; then\n  echo \"Internet connection active.\"\nelse\n  echo \"Network ping failed with exit code $STATUS.\"\nfi"
  },
  {
    id: 214,
    title: "How to loop through all files in a directory using a for loop?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can iterate over files in a directory using globbing patterns (e.g., *) in a for loop. Avoid using the output of `ls` in loops, as filenames containing spaces can break parsing.",
    command: "# Loop through all .log files in /var/log/nginx/\nfor file in /var/log/nginx/*.log; do\n  # Check if file exists to handle empty directories safely\n  [ -e \"$file\" ] || continue\n  echo \"Processing log file: $(basename \"$file\")\"\ndone"
  },
  {
    id: 215,
    title: "How to perform basic arithmetic operations in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash only supports integer arithmetic. You can perform arithmetic calculations using:\n• $(( expression )): The modern double-parentheses syntax (preferred).\n• let statement: Performs variable assignment.\n• expr command: Legacy syntax (slower, requires spaces).",
    command: "# Calculate sum using double-parentheses\nnum1=15\nnum2=20\nsum=$((num1 + num2))\necho \"Sum: $sum\"\n\n# Increment a variable\ncount=1\n((count++))\necho \"Incremented Count: $count\"\n\n# Multiplication\nproduct=$((num1 * num2))\necho \"Product: $product\""
  },
  {
    id: 216,
    title: "How to redirect messages to standard error (stderr) instead of stdout?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "By default, 'echo' writes to standard output (file descriptor 1). To write error messages to standard error (file descriptor 2) so they can be separated during logging, redirect the output of echo using '>&2'.",
    command: "# Print standard output message\necho \"This is standard output.\"\n\n# Print error message to stderr\necho \"ERROR: Database connection failed!\" >&2\n\n# Running script while routing errors to a log file:\n# ./my_script.sh 2> errors.log"
  },
  {
    id: 217,
    title: "How to read user input interactively in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Use the built-in `read` command to pause execution and capture input from the user.\nUseful options:\n• -p \"Prompt\": Displays a prompt text without a newline.\n• -s: Silent mode (does not echo input characters, useful for passwords).\n• -t seconds: Timeout limit.",
    command: "# Ask for username\nread -p \"Enter Database Username: \" db_user\n\n# Ask for password silently\nread -s -p \"Enter Database Password: \" db_pass\necho \"\" # Print newline after password mask\n\necho \"Connecting to DB as user $db_user...\""
  },
  {
    id: 218,
    title: "Explain the difference between single quotes, double quotes, and backticks in Bash",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Single Quotes ('...'): Strong quoting. Treats every character literally. No variable expansion or command substitution occurs.\n• Double Quotes (\"...\"): Weak quoting. Resolves variables ($var) and command substitutions ($(command)), but treats spaces literally.\n• Backticks (`...`): Legacy command substitution. Runs the command inside and returns its output (use $(command) instead for nested queries).",
    command: "NAME=\"Oracle\"\n\n# Single quotes (Literal text output)\necho 'Database name is $NAME' # Output: Database name is $NAME\n\n# Double quotes (Variable expanded)\necho \"Database name is $NAME\" # Output: Database name is Oracle\n\n# Command substitution\nCURRENT_DIR=$(pwd)\necho \"Current path is: $CURRENT_DIR\""
  },
  {
    id: 219,
    title: "How to redirect stdout and stderr to a log file?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Redirection manages where standard streams go:\n• > log.txt: Redirects stdout to a file (overwriting).\n• >> log.txt: Appends stdout to a file.\n• 2> err.txt: Redirects stderr to a file.\n• &> log.txt: Redirects BOTH stdout and stderr to a file (modern).\n• > log.txt 2>&1: Legacy redirect of both streams (redirects stdout to file, then stderr to stdout).",
    command: "# Run backup script and redirect all outputs (overwrite)\n/opt/db_backup.sh &> /var/log/db_backup.log\n\n# Run cleanup script and append logs, sending errors to a separate file\n/opt/cleanup.sh >> /var/log/cleanup.log 2>> /var/log/cleanup_errors.log"
  },
  {
    id: 220,
    title: "How to concatenate strings and get the length of a string in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Concatenation: Simply place variables next to each other, optionally wrapping them in braces ${var} to avoid character ambiguity.\n• String Length: Use the syntax ${#varname} to return the character count of a string variable.",
    command: "prefix=\"db_backup_\"\ndate_suffix=\"2026-05-21\"\n\n# Concatenate strings\nfile_name=\"${prefix}${date_suffix}.dmp\"\necho \"Target File: $file_name\"\n\n# Get string length\nlength=${#file_name}\necho \"Filename Length: $length characters\""
  },
  {
    id: 221,
    title: "How to check if a string contains a substring in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can check for substrings inside double brackets [[ ]] using wildcard globbing patterns (e.g. *pattern*), or by using the case statement.",
    command: "DB_URL=\"jdbc:postgresql://dbhost:5432/production\"\n\n# Check substring using double brackets and glob matching\nif [[ \"$DB_URL\" == *\"postgresql\"* ]]; then\n  echo \"Database type identified as PostgreSQL.\"\nfi\n\n# Alternate search using case\ncase \"$DB_URL\" in\n  *oracle*) echo \"Oracle database detected\" ;;\n  *postgresql*) echo \"Postgres database detected\" ;;\n  *) echo \"Unknown database\" ;;\nesac"
  },
  {
    id: 222,
    title: "How to use command substitution ( $(command) ) in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Command substitution runs a specified command in a subshell and assigns its standard output to a variable or passes it inline. The modern syntax is `$(command)`, replacing the legacy backticks ``command`` syntax because it supports easy nesting.",
    command: "# Assign command output to a variable\nCURRENT_USER=$(whoami)\nSERVER_IP=$(hostname -I | awk '{print $1}')\n\necho \"Running audit on host $SERVER_IP as user $CURRENT_USER.\"\n\n# Nested command substitution\nARCHIVE_SIZE=$(du -sh \"$(find /var/log -type f -name '*.gz' | head -n 1)\" | awk '{print $1}')\necho \"Size of first log archive: $ARCHIVE_SIZE\""
  },
  {
    id: 223,
    title: "How to define and call basic functions in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Functions modularize code. Define them using `function_name() { ... }` or `function function_name { ... }`.\n\nKey rules:\n• Functions must be defined *before* they are called.\n• Pass arguments like standard scripts ($1, $2).\n• Localize variables inside functions using the 'local' keyword to prevent global scope contamination.",
    command: "# Define a function to log messages with timestamps\nlog_message() {\n  local log_level=$1\n  local message=$2\n  echo \"$(date '+%Y-%m-%d %H:%M:%S') [$log_level] $message\"\n}\n\n# Call the function with arguments\nlog_message \"INFO\" \"Starting database validation process.\"\nlog_message \"WARNING\" \"Free space on /u01 is low.\""
  },
  {
    id: 224,
    title: "How to read a file line by line in Bash using a while loop?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To read a text file line-by-line safely, combine a `while read -r` loop with input redirection. The `-r` option prevents backslash character escapes from being interpreted. Clearing the Internal Field Separator (IFS=) prevents leading/trailing whitespace trimming.",
    command: "# Read database server IP list from a config file\nCONFIG_FILE=\"/tmp/servers.txt\"\necho -e \"10.0.1.5\\n10.0.1.6\\n10.0.1.7\" > \"$CONFIG_FILE\"\n\nwhile IFS= read -r line; do\n  # Skip empty lines or commented lines\n  [[ -z \"$line\" || \"$line\" =~ ^# ]] && continue\n  echo \"Checking node connection to: $line\"\n  ssh -o ConnectTimeout=2 \"admin@$line\" \"uptime\" < /dev/null\ndone < \"$CONFIG_FILE\""
  },
  {
    id: 225,
    title: "Handling options and flags in shell scripts using getopts",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The built-in `getopts` utility parses command-line flags and options in a loop. It supports single-character flags (e.g. -f, -v). A colon after a flag letter indicates that the option requires an argument (stored in $OPTARG).",
    command: "# Parse script configurations\nwhile getopts \"h:p:v\" opt; do\n  case \"$opt\" in\n    h) HOST=\"$OPTARG\" ;;\n    p) PORT=\"$OPTARG\" ;;\n    v) VERBOSE=true ;;\n    *) echo \"Invalid option\" ;;\n  esac\ndone\n\necho \"Configured host: $HOST, port: $PORT, verbose: ${VERBOSE:-false}\""
  },
  {
    id: 226,
    title: "How to debug a shell script using bash shell options?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To diagnose issues in complex scripts, enable bash debugging settings at the top of your script using 'set':\n• set -x: Prints every command before executing it (execution trace).\n• set -e: Terminates the script immediately if any command fails (non-zero status).\n• set -u: Terminates script if an unbound/undefined variable is evaluated.\n• set -o pipefail: Returns the exit status of the first failed command in a pipeline.",
    command: "#!/bin/bash\n# Enable strict debugging settings\nset -euo pipefail\nset -x\n\n# This failed command will stop the script immediately due to 'set -e'\nls /non_existent_folder\n\necho \"This line will never execute.\""
  },
  {
    id: 227,
    title: "Dynamic temporary file creation using mktemp and cleanup using trap",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Hardcoding temporary file paths (like /tmp/output.txt) can lead to file clashes or security risks. Use `mktemp` to create secure, unique temp files. To ensure these files are cleaned up if the script crashes or completes, bind a cleanup function using the `trap` command.",
    command: "# Create a secure temporary file\nTEMP_FILE=$(mktemp /tmp/db_audit.XXXXXX)\n\n# Define cleanup action\ncleanup() {\n  echo \"Cleaning up temp files...\"\n  rm -f \"$TEMP_FILE\"\n}\n\n# Trap signals (Exit, Interrupt, Terminate)\ntrap cleanup EXIT INT TERM\n\n# Execute operations using the secure temp file\necho \"Running query...\" > \"$TEMP_FILE\"\ncat \"$TEMP_FILE\""
  },
  {
    id: 228,
    title: "String manipulation and substring extraction in Bash without external tools",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash has powerful built-in parameter expansion patterns. This is far faster than invoking external tools like `sed`, `awk`, or `cut` in loops:\n• ${var#pattern}: Removes shortest match of pattern from start.\n• ${var##pattern}: Removes longest match of pattern from start.\n• ${var%pattern}: Removes shortest match of pattern from end.\n• ${var%%pattern}: Removes longest match of pattern from end.\n• ${var/pattern/replacement}: Replaces first match.\n• ${var//pattern/replacement}: Replaces all matches.",
    command: "FILE_PATH=\"/var/log/oracle/alert_DBA.log\"\n\n# Extract directory path (remove everything after last slash)\nDIR_PATH=\"${FILE_PATH%/*}\"\necho \"Dir: $DIR_PATH\" # /var/log/oracle\n\n# Extract filename (remove everything before last slash)\nFILE_NAME=\"${FILE_PATH##*/}\"\necho \"File: $FILE_NAME\" # alert_DBA.log\n\n# Extract file extension\nEXT=\"${FILE_NAME##*.}\"\necho \"Ext: $EXT\" # log"
  },
  {
    id: 229,
    title: "How to check if a command exists in the system path before executing it?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Before calling external tools (like `jq`, `git`, or `docker`), check if they are installed. Avoid parsing `which`, as it acts inconsistently across Linux distros. Instead, use the shell built-in commands `command -v`, `type`, or `hash`.",
    command: "# Check if jq is installed in the system path\nif ! command -v jq &> /dev/null; then\n  echo \"ERROR: 'jq' utility is not installed. Exiting.\" >&2\n  exit 1\nfi\n\n# Safe to proceed with jq commands\necho '{\"status\":\"ok\"}' | jq .status"
  },
  {
    id: 230,
    title: "Working with indexed arrays in Bash",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash supports 1-dimensional indexed arrays. You can declare and manipulate them using standard array syntax:\n• Declare: `declare -a my_array` or `my_array=(val1 val2 val3)`.\n• Access item: `${my_array[index]}`.\n• Access all items: `${my_array[@]}`.\n• Array size: `${#my_array[@]}`.\n• Append item: `my_array+=(\"new_val\")`.",
    command: "# Define array of target databases\ndatabases=(\"prod_db\" \"uat_db\" \"test_db\")\n\n# Append a database\ndatabases+=(\"dev_db\")\n\n# Print array size\necho \"Total DBs to backup: ${#databases[@]}\"\n\n# Iterate through the array\nfor db in \"${databases[@]}\"; do\n  echo \"Running RMAN backup for $db...\"\ndone"
  },
  {
    id: 231,
    title: "How to perform floating point arithmetic in Bash using bc?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Since Bash only supports integers (e.g. 5/2 = 2), you must delegate floating-point operations to an external utility like `bc` (Basic Calculator) using piping. Use the 'scale' parameter in bc to define decimal precision.",
    command: "# Divide 5 by 2 with 2 decimal precision\nresult=$(echo \"scale=2; 5 / 2\" | bc)\necho \"Result: $result\" # 2.50\n\n# Perform complex float calculations dynamically\nused_mem=15420\ntotal_mem=16384\npct_mem=$(echo \"scale=4; ($used_mem / $total_mem) * 100\" | bc)\necho \"Memory consumption percentage: $pct_mem%\""
  },
  {
    id: 232,
    title: "Pattern matching and replacement in files using sed in-place",
    category: "shell scripting",
    difficulty: "medium",
    answer: "`sed` (Stream Editor) modifies text dynamically. Use the `-i` option to modify the target file directly (in-place) without redirects. In macOS, `sed -i ''` is required, while Linux accepts `sed -i`.",
    command: "# Create configuration file\necho \"port = 8080\" > /tmp/app.conf\necho \"db_host = localhost\" >> /tmp/app.conf\n\n# Replace 'localhost' with '10.0.1.25' in-place\nsed -i 's/localhost/10.0.1.25/g' /tmp/app.conf\n\n# Replace port 8080 with 443\nsed -i 's/port = 8080/port = 443/g' /tmp/app.conf\n\ncat /tmp/app.conf"
  },
  {
    id: 233,
    title: "Extracting columns and formatting report text using awk",
    category: "shell scripting",
    difficulty: "medium",
    answer: "`awk` is a text-processing utility designed for data extraction. By default, it splits lines into positional variables ($1, $2...) based on whitespace fields. Use the `-F` flag to change the field separator (e.g. colon for /etc/passwd).",
    command: "# Get usernames and home paths of system accounts (split by colon)\nawk -F: '$3 >= 1000 {print \"User: \" $1 \"\\tHome: \" $6}' /etc/passwd\n\n# Calculate the total memory size of all files listed by ls -l\nls -l | awk '{sum += $5} END {print \"Total Size: \" sum / 1024 / 1024 \" MB\"}'"
  },
  {
    id: 234,
    title: "How to set script timeout and kill hung processes in Bash?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To prevent automation scripts from hanging indefinitely on network calls or stuck database connections, wrap the process in a timeout threshold using the Linux `timeout` command, which sends SIGTERM or SIGKILL if the process exceeds the time limit.",
    command: "# Run backup script with 10 seconds timeout limit\ntimeout 10s rsync -avz /data/ backup_user@remotehost:/storage/\nSTATUS=$?\n\nif [ $STATUS -eq 124 ]; then\n  echo \"ERROR: Backup timed out after 10 seconds.\" >&2\nelse\n  echo \"Backup finished with status $STATUS.\"\nfi"
  },
  {
    id: 235,
    title: "Using the select statement to build interactive text-based menus",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The `select` statement is a bash built-in loop that creates dynamic text-based menus. It displays a list of options with numeric indices, prompts the user (using the PS3 string), and stores the user's choice in a variable.",
    command: "# Configure prompt message\nPS3=\"Select a DBA action: \"\n\nselect opt in \"Start Database\" \"Stop Database\" \"Check Status\" \"Exit\"; do\n  case \"$opt\" in\n    \"Start Database\") echo \"Initializing startup...\" ;;\n    \"Stop Database\") echo \"Shutting down...\" ;;\n    \"Check Status\") uptime ;;\n    \"Exit\") break ;;\n    *) echo \"Invalid option $REPLY\" ;;\n  esac\ndone"
  },
  {
    id: 236,
    title: "How to run multiple background jobs and wait for all of them to complete?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To run tasks in parallel, append the ampersand character `&` to push them to the background. To block script execution until all concurrent background tasks finish, use the built-in `wait` command.",
    command: "# Define worker tasks\nrun_backup() {\n  echo \"Starting backup $1...\"\n  sleep 2\n  echo \"Finished backup $1.\"\n}\n\n# Trigger 3 background workers concurrently\nrun_backup \"ora_db\" &\nrun_backup \"pg_db\" &\nrun_backup \"mysql_db\" &\n\n# Wait for all background PIDs to complete\necho \"Waiting for database backups to complete...\"\nwait\necho \"All backups completed successfully.\""
  },
  {
    id: 237,
    title: "Implementing safe, production-grade Bash scripts using Strict Mode",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Standard Bash behavior is permissive: it skips missing variables, continues executing scripts if a middle step fails, and masks pipe errors. Production automation scripts should use the 'Unofficial Bash Strict Mode' at the top of the file to force immediate, clean crashes if an anomaly occurs.\n\nSettings:\n• set -e: Fail fast.\n• set -u: Block undefined variables.\n• set -o pipefail: Capture pipeline errors.\n• IFS=$'\\n\\t': Internal Field Separator set to split *only* on newlines and tabs (prevents spaces in filenames from breaking loops).",
    command: "#!/bin/bash\n# Unofficial Bash Strict Mode\nset -euo pipefail\nIFS=$'\\n\\t'\n\n# Clean directory scan without splitting on space\nfor file in $(find . -maxdepth 1 -type f); do\n  echo \"Safe check: $file\"\ndone"
  },
  {
    id: 238,
    title: "Writing a script to monitor database CPU/memory usage and kill runaway queries",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Under heavy database loads, bad SQL executions can consume 100% CPU. You can write a daemonized shell script that audits process resources via 'ps', filters out runaway queries running longer than a threshold (e.g. 5 minutes), and terminates them.",
    command: "#!/bin/bash\nset -eu\n\n# Define thresholds\nCPU_LIMIT=90\nTIME_LIMIT=300 # 5 minutes\n\n# Scan processes using ps\nps -eo pid,pcpu,etime,comm | grep -E 'postgres|oracle' | while read -r pid cpu etime comm; do\n  # Convert elapsed time (etime format: DD-HH:MM:SS or MM:SS) to raw seconds\n  sec=$(echo \"$etime\" | awk -F: '{ if (NF==3) print $1*3600 + $2*60 + $3; else print $1*60 + $2 }')\n  \n  # Check if thresholds are breached\n  if (( $(echo \"$cpu > $CPU_LIMIT\" | bc) )) && [ \"$sec\" -gt \"$TIME_LIMIT\" ]; then\n    echo \"WARNING: Runaway process PID $pid CPU $cpu% Time $etime. Terminating...\" >&2\n    kill -15 \"$pid\"\n  fi\ndone"
  },
  {
    id: 239,
    title: "Parsing JSON configuration files in Bash using jq with error handling",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Parsing JSON files inside shell scripts should use `jq` rather than regex or sed. Your script must validate that the JSON syntax is valid, handle missing fields, and capture execution errors safely.",
    command: "#!/bin/bash\nset -euo pipefail\n\nJSON_DATA='{\"database\":{\"host\":\"dbhost\",\"port\":5432,\"active\":true}}'\n\n# Validate JSON structure\nif ! echo \"$JSON_DATA\" | jq empty 2>/dev/null; then\n  echo \"ERROR: Invalid JSON configuration file.\" >&2\n  exit 1\nfi\n\n# Extract properties safely\nHOST=$(echo \"$JSON_DATA\" | jq -r '.database.host // empty')\nPORT=$(echo \"$JSON_DATA\" | jq -r '.database.port // 5432')\n\nif [ -z \"$HOST\" ]; then\n  echo \"ERROR: Host parameters are missing in JSON.\" >&2\n  exit 1\nfi\n\necho \"Configured connection to $HOST on port $PORT\""
  },
  {
    id: 240,
    title: "Implementing exponential backoff and retry logic in Bash",
    category: "shell scripting",
    difficulty: "hard",
    answer: "When integrating shell scripts with network APIs or database ports, temporary network blips can cause immediate failures. Writing a retry loop with exponential backoff introduces delays that increase exponentially (e.g. 2s, 4s, 8s, 16s...) between attempts, helping target servers recover.",
    command: "#!/bin/bash\n\nattempt_connect() {\n  local max_attempts=5\n  local attempt=1\n  local delay=2\n\n  while [ $attempt -le $max_attempts ]; do\n    echo \"Connection attempt $attempt of $max_attempts...\"\n    \n    # Simulate network connection check\n    if curl -s -m 2 http://dbhost:8080 >/dev/null; then\n      echo \"Connected successfully!\"\n      return 0\n    fi\n\n    echo \"Failed to connect. Retrying in $delay seconds...\"\n    sleep \"$delay\"\n    attempt=$((attempt + 1))\n    delay=$((delay * 2)) # Double the delay\n  done\n\n  echo \"ERROR: Connection failed after $max_attempts attempts.\" >&2\n  return 1\n}"
  },
  {
    id: 241,
    title: "Writing a multi-threaded parallel file processor using xargs",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Processing millions of files (e.g., compressing rotated logs) sequentially is slow. You can use `xargs` with the `-P` option to run multiple worker threads in parallel, utilizing all available CPU cores.",
    command: "# Find all .dmp files and compress them using 4 concurrent threads\nfind /u01/backups -type f -name \"*.dmp\" -print0 | xargs -0 -P 4 -n 1 gzip\n\n# Explanation:\n# -print0 and -0: Delimit filenames with null characters to handle spaces safely\n# -P 4: Spawn up to 4 parallel processes\n# -n 1: Pass exactly 1 file to each gzip execution"
  },
  {
    id: 242,
    title: "Dynamic configuration loading from environment files with default fallbacks",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Standard practice is to load variables from a local `.env` file. A production script should check if the file exists, parse it without using dangerous `source` commands (which can execute arbitrary malicious code hidden in the file), and set default fallback values for unset parameters.",
    command: "#!/bin/bash\nset -euo pipefail\n\nENV_FILE=\"/tmp/.env\"\necho \"DB_PORT=5432\" > \"$ENV_FILE\"\n\n# Load variables manually avoiding source\nif [ -f \"$ENV_FILE\" ]; then\n  while IFS= read -r line || [[ -n \"$line\" ]]; do\n    # Skip comments and empty lines\n    [[ \"$line\" =~ ^# || -z \"$line\" ]] && continue\n    # Export variable name and value\n    export \"$line\"\n  done < \"$ENV_FILE\"\nfi\n\n# Set fallbacks using parameter expansion\nDB_HOST=\"${DB_HOST:-localhost}\"\nDB_PORT=\"${DB_PORT:-1521}\"\n\necho \"Host: $DB_HOST, Port: $DB_PORT\""
  },
  {
    id: 243,
    title: "Writing a database replication delay checker and email alert notifier",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Replication lag indicates synchronization bottlenecks on standby databases. Write a shell script that runs in cron, queries database lag metrics, and triggers alerts via mailx or mail if lag exceeds critical bounds.",
    command: "#!/bin/bash\nset -euo pipefail\n\n# Query Postgres replication lag in seconds\nLAG_SECONDS=$(psql -At -c \"SELECT COALESCE(EXTRACT(epoch FROM pg_last_xact_replay_timestamp() - now()), 0)::int\" -U postgres || echo 999)\n\n# Absolute value\nLAG_ABS=$(( LAG_SECONDS < 0 ? -LAG_SECONDS : LAG_SECONDS ))\n\nCRITICAL_LIMIT=60\n\nif [ \"$LAG_ABS\" -gt \"$CRITICAL_LIMIT\" ]; then\n  echo \"CRITICAL: Replication lag is $LAG_ABS seconds!\" | mail -s \"ALERT: Replication Lag Warning\" dba_alerts@company.com\nfi"
  },
  {
    id: 244,
    title: "Synchronizing backups using rsync with SSH key integration and lock protection",
    category: "shell scripting",
    difficulty: "hard",
    answer: "A production sync script must ensure that only one instance of the sync job runs at a time (preventing overlapping transfers). Use `flock` to create a file lock. The script should run rsync securely using SSH keys, compressing data dynamically.",
    command: "#!/bin/bash\nset -euo pipefail\n\nLOCK_FILE=\"/var/run/db_sync.lock\"\n\n# Force execution using lock descriptor\nexec 9>\"$LOCK_FILE\"\nif ! flock -n 9; then\n  echo \"ERROR: Another backup sync process is already running.\" >&2\n  exit 1\nfi\n\n# Sync command using SSH\nrsync -e \"ssh -i /home/backup_user/.ssh/id_rsa -o StrictHostKeyChecking=accept-new\" \\\n  -avz --delete /u01/backups/ backup_user@remotehost:/storage/db_backups/\n\n# Release lock\nflock -u 9"
  },
  {
    id: 245,
    title: "Implementing a database schema migration runner script with rollback support",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Automating schema updates requires executing SQL scripts sequentially. Your script must track executed files in a migration log table inside the database, wrap each migration run in a transaction, and support rollback hooks if an error occurs.",
    command: "#!/bin/bash\nset -euo pipefail\n\nMIGRATION_DIR=\"/opt/migrations\"\npotential_migrations=$(find \"$MIGRATION_DIR\" -type f -name \"*.sql\" | sort)\n\n# Loop through migrations\nfor sql_file in $potential_migrations; do\n  # Check if migration was already executed\n  mig_name=$(basename \"$sql_file\")\n  check=$(psql -At -c \"SELECT count(*) FROM schema_migrations WHERE version='$mig_name'\")\n  \n  if [ \"$check\" -eq 0 ]; then\n    echo \"Running migration $mig_name...\"\n    # Wrap execution inside transactional block\n    psql -1 -f \"$sql_file\" && \\\n    psql -c \"INSERT INTO schema_migrations (version) VALUES ('$mig_name')\"\n  fi\ndone"
  },
  {
    id: 246,
    title: "Creating a self-extracting archive or installer script using Bash payload concatenation",
    category: "shell scripting",
    difficulty: "hard",
    answer: "You can create a single installer script (.run file) that contains both the Bash installation logic and a binary tar payload concatenated at the end of the text file. The script parses its own file, locates the payload divider (e.g. `__ARCHIVE_FOLLOWS__`), extracts it, and decompresses it.",
    command: "#!/bin/bash\n# Self-Extracting Installer Script Blueprint\nset -eu\n\n# Find the index line where binary payload starts\nPAYLOAD_LINE=$(awk '/^__ARCHIVE_FOLLOWS__/ {print NR + 1; exit 0;}' \"$0\")\n\n# Create temp extraction folder\ntmp_dir=$(mktemp -d)\n\n# Extract and decompress payload\ntail -n +\"$PAYLOAD_LINE\" \"$0\" | tar -xz -C \"$tmp_dir\"\n\n# Run setup logic\ncd \"$tmp_dir\" && ./install.sh\n\n# Exit before execution flows into binary data\nexit 0\n__ARCHIVE_FOLLOWS__\n# (Binary tar.gz data is concatenated directly below this marker)"
  },
  {
    id: 247,
    title: "Parsing XML configuration files in Bash using xmllint",
    category: "shell scripting",
    difficulty: "hard",
    answer: "XML files should not be parsed with fragile regex or sed tools. Use the command-line utility `xmllint` with XPath queries to isolate and extract nested tags or attributes safely.",
    command: "# Sample XML file\ncat << 'EOF' > /tmp/web.xml\n<web-app>\n  <servlet>\n    <servlet-name>Controller</servlet-name>\n    <servlet-class>com.app.Controller</servlet-class>\n  </servlet>\n</web-app>\nEOF\n\n# Query servlet class using XPath\nSERVLET_CLASS=$(xmllint --xpath \"string(/web-app/servlet/servlet-class)\" /tmp/web.xml)\necho \"Servlet Class: $SERVLET_CLASS\""
  },
  {
    id: 248,
    title: "Implementing custom log levels with terminal colors and syslogging",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Production scripts should write logs to files and standard stream channels simultaneously. Create a custom log function that writes color-coded outputs to stdout/stderr (for terminal sessions) and forwards logs directly to the system logs daemon using `logger`.",
    command: "#!/bin/bash\n\nlog() {\n  local level=$1\n  local msg=$2\n  local color=\"\"\n  \n  case \"$level\" in\n    \"INFO\")  color=\"\\e[32m\" ;; # Green\n    \"WARN\")  color=\"\\e[33m\" ;; # Yellow\n    \"ERROR\") color=\"\\e[31m\" ;; # Red\n  esac\n  \n  # Print colorized logs to stdout/stderr\n  echo -e \"${color}[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg\\e[0m\"\n  \n  # Forward log to system log daemon (syslog)\n  logger -t \"DB_SCRIPT\" \"[$level] $msg\"\n}\n\nlog \"INFO\" \"Logs initialized.\"\nlog \"ERROR\" \"Failed to connect to RDS database.\""
  },
  {
    id: 249,
    title: "Checking SSL certificate expiration dates and alerting via Slack Webhooks",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Expired SSL certificates cause browser warnings and API drops. Write a shell script that pulls expiration metadata using `openssl s_client` for a domain list, calculates the days remaining, and sends JSON alerts via a Slack Webhook using `curl`.",
    command: "#!/bin/bash\nset -euo pipefail\n\nDOMAIN=\"google.com\"\nSLACK_WEBHOOK_URL=\"https://hooks.slack.com/services/T00/B00/X00\"\n\n# Query expiration date\nexp_date=$(openssl s_client -servername \"$DOMAIN\" -connect \"$DOMAIN\":443 </dev/null 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)\n\n# Convert to seconds\nexp_sec=$(date -d \"$exp_date\" +%s)\nnow_sec=$(date +%s)\ndiff_sec=$((exp_sec - now_sec))\ndays_left=$((diff_sec / 86400))\n\n# Trigger Slack notification if less than 30 days left\nif [ \"$days_left\" -lt 30 ]; then\n  payload=\"{\\\"text\\\": \\\"WARNING: SSL Certificate for $DOMAIN expires in $days_left days!\\\"}\"\n  curl -X POST -H 'Content-type: application/json' --data \"$payload\" \"$SLACK_WEBHOOK_URL\"\nfi"
  },
  {
    id: 250,
    title: "Implementing a production backup rotation script",
    category: "shell scripting",
    difficulty: "hard",
    answer: "A standard backup policy retains recent daily backups, weekly archives, and monthly historical archives, removing older files to save storage. Write a script that checks timestamps and deletes files matching Grandfather-Father-Son retention parameters.",
    command: "#!/bin/bash\nset -eu\n\nBACKUP_DIR=\"/var/backups\"\n\n# 1. Keep daily backups for 7 days\nfind \"$BACKUP_DIR\" -type f -name \"daily_*\" -mtime +7 -delete\n\n# 2. Keep weekly backups for 4 weeks (28 days)\nfind \"$BACKUP_DIR\" -type f -name \"weekly_*\" -mtime +28 -delete\n\n# 3. Keep monthly backups for 12 months (365 days)\nfind \"$BACKUP_DIR\" -type f -name \"monthly_*\" -mtime +365 -delete"
  },
  {
    id: 251,
    title: "How to daemonize a shell script to run as a persistent background process",
    category: "shell scripting",
    difficulty: "hard",
    answer: "To run a script as a daemon (background service) without using systemd:\n1. Redirect all standard input, output, and error streams to /dev/null or log files.\n2. Disassociate the process from the controlling terminal session using `nohup` or `setsid`.\n3. Write the background process ID (PID) to a PID file (/var/run/mydaemon.pid) so it can be managed (started/stopped) later.",
    command: "#!/bin/bash\nPID_FILE=\"/var/run/my_daemon.pid\"\nLOG_FILE=\"/var/log/my_daemon.log\"\n\nstart_daemon() {\n  if [ -f \"$PID_FILE\" ] && kill -0 \"$(cat \"$PID_FILE\")\" 2>/dev/null; then\n    echo \"Daemon already running.\"\n    exit 1\n  fi\n\n  # Start in background, decoupling terminal connections\n  nohup /usr/local/bin/daemon_loop.sh > \"$LOG_FILE\" 2>&1 &\n  echo $! > \"$PID_FILE\"\n  echo \"Daemon started with PID $(cat \"$PID_FILE\")\"\n}\n\nstop_daemon() {\n  if [ -f \"$PID_FILE\" ]; then\n    kill -15 \"$(cat \"$PID_FILE\")\"\n    rm -f \"$PID_FILE\"\n    echo \"Daemon stopped.\"\n  fi\n}"
  },
  {
    id: 252,
    title: "Handling signals gracefully in complex scripts using trap",
    category: "shell scripting",
    difficulty: "hard",
    answer: "If a long-running batch processing script is terminated by a user (SIGINT / Ctrl+C) or standard shutdown (SIGTERM), it can leave half-written files, locked connections, or active background processes. Use `trap` to bind cleanups to specific signals, terminating children and cleaning locks safely.",
    command: "#!/bin/bash\nset -eu\n\n# Track background processes\nchildren_pids=\"\"\n\ncleanup() {\n  echo \"Signal received. Terminating child processes...\"\n  for pid in $children_pids; do\n    kill -15 \"$pid\" 2>/dev/null || true\n  done\n  exit 1\n}\n\n# Bind SIGINT and SIGTERM\ntrap cleanup INT TERM\n\n# Spawn background workers\nsleep 100 &\nchildren_pids+=\" $!\"\nsleep 100 &\nchildren_pids+=\" $!\"\n\nwait"
  },
  {
    id: 253,
    title: "Writing a health check script for an Application Load Balancer target group",
    category: "shell scripting",
    difficulty: "hard",
    answer: "An internal health checker routes requests to application endpoints, audits response codes and latency, and updates local routing hosts if a backend becomes unresponsive. The script should query response metrics and compare them against threshold parameters.",
    command: "#!/bin/bash\nset -euo pipefail\n\nBACKEND_URL=\"http://10.0.1.15:8080/health\"\nCONSECUTIVE_FAILURES_ALLOWED=3\nfail_count=0\n\nwhile true; do\n  # Get HTTP status code and request duration\n  http_status=$(curl -s -o /dev/null -w \"%{http_code}\" --connect-timeout 2 \"$BACKEND_URL\" || echo \"500\")\n  \n  if [ \"$http_status\" -eq 200 ]; then\n    fail_count=0\n  else\n    fail_count=$((fail_count + 1))\n  fi\n\n  if [ \"$fail_count\" -ge \"$CONSECUTIVE_FAILURES_ALLOWED\" ]; then\n    echo \"CRITICAL: Backend offline. Triggering failover...\" >&2\n    # Trigger failover script/alert here\n    exit 1\n  fi\n  sleep 5\ndone"
  },
  {
    id: 254,
    title: "Auditing shell script execution using syslog forwarding and auditd",
    category: "shell scripting",
    difficulty: "hard",
    answer: "In high-security environments, you must track who executes administrative scripts and audit exactly what commands were run inside the script. You can configure syslog forwarding to send script traces directly to a centralized SIEM, and bind auditd rules to monitor execution activities.",
    command: "# 1. Forward bash history to syslog (add to /etc/bash.bashrc):\n# export PROMPT_COMMAND='RETRN_VAL=$?; logger -p local6.debug \"$(whoami) [$$]: $(history 1 | sed \"s/^[ ]*[0-9]*[ ]*//\") [v=$RETRN_VAL]\"'\n\n# 2. Add auditd rule to monitor executions of a deploy script\n# sudo auditctl -w /opt/deploy.sh -p x -k deploy_audit"
  },
  {
    id: 255,
    title: "Writing a script to parse access logs, count requests, and block IPs",
    category: "shell scripting",
    difficulty: "hard",
    answer: "To mitigate application-layer DDoS attacks, write a script that parses web access logs (like Nginx access.log), aggregates request counts by client IP within a short window, and dynamically appends drop rules to iptables if an IP exceeds thresholds (e.g. 500 requests/minute).",
    command: "#!/bin/bash\nLOG_FILE=\"/var/log/nginx/access.log\"\nTHRESHOLD=500\n\n# Get requests in the last 1 minute, count by IP\ntail -n 10000 \"$LOG_FILE\" | awk '{print $1}' | sort | uniq -c | while read -r count ip; do\n  if [ \"$count\" -gt \"$THRESHOLD\" ]; then\n    # Check if IP is already blocked\n    if ! iptables -C INPUT -s \"$ip\" -j DROP &>/dev/null; then\n      echo \"Blocking abusive IP: $ip ($count requests)\"\n      iptables -A INPUT -s \"$ip\" -j DROP\n    fi\n  fi\ndone"
  },
  {
    id: 256,
    title: "What is CI/CD and what is its purpose?",
    category: "devops",
    difficulty: "easy",
    answer: "CI/CD stands for Continuous Integration and Continuous Delivery (or Deployment):\n• Continuous Integration (CI): Developers merge code changes into a central repository frequently. Each merge triggers automated builds and tests to identify bugs early.\n• Continuous Delivery/Deployment (CD): Automated release pipeline that deploys code to staging (Delivery) or directly to production (Deployment) once tests pass.\n\nPurpose: To speed up release cycles, minimize human errors, and ensure code is always in a deployable state.",
    command: "# Simple workflow representation:\n# Git Commit -> Trigger Webhook -> Run Tests -> Build Artifact -> Scan Vulnerabilities -> Deploy to Server"
  },
  {
    id: 257,
    title: "Explain Virtualization vs Containerization",
    category: "devops",
    difficulty: "easy",
    answer: "• Virtualization (VMs): Runs a full Guest OS on top of physical hardware using a Hypervisor (e.g. VMware, VirtualBox). Each VM has virtualized memory, CPU, and disk. They are heavy, slow to boot (minutes), and consume substantial resource overhead.\n• Containerization (Docker): Shares the host OS kernel and runs processes in isolated namespaces. Containers do not require a guest OS. They are extremely lightweight, boot in seconds, and share host resources efficiently.",
    command: "# View running processes inside a container (shares host kernel but isolated)\ndocker run -d --name test-container alpine sleep 3600\ndocker top test-container"
  },
  {
    id: 258,
    title: "What is Git and explain clone vs fork vs pull?",
    category: "devops",
    difficulty: "easy",
    answer: "Git is a distributed version control system to track file modifications.\n• Clone: Creates a local copy of a remote Git repository on your machine, linking your local repo back to the remote origin.\n• Fork: Creates a copy of a repository under *your* GitHub/GitLab account. You can make modifications without affecting the original project, then submit a Pull Request.\n• Pull: Fetches modifications from a remote repository and merges them into your active local branch.",
    command: "# Clone a repository\ngit clone https://github.com/app/allpreps.git\n\n# Fetch and merge latest changes from active remote branch\ngit pull origin main"
  },
  {
    id: 259,
    title: "What is Infrastructure as Code (IaC) and what are its benefits?",
    category: "devops",
    difficulty: "easy",
    answer: "Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure (VPCs, servers, databases, DNS) using machine-readable configuration files (like Terraform, CloudFormation, Ansible) instead of manual console actions.\n\nBenefits:\n• Consistency: Eliminates configuration drift.\n• Version Control: Infrastructure definitions can be committed to Git, reviewed, and rolled back.\n• Automation: Spawns complex infrastructures in minutes.",
    command: "# Example of declarative Terraform resource definition\n# resource \"aws_instance\" \"app_server\" {\n#   ami           = \"ami-085fac801\"\n#   instance_type = \"t3.micro\"\n# }"
  },
  {
    id: 260,
    title: "Explain the difference between YAML and JSON syntax rules",
    category: "devops",
    difficulty: "easy",
    answer: "YAML and JSON are serialization languages commonly used for config files (YAML for Kubernetes/Ansible/pipelines, JSON for APIs/Terraform states):\n• YAML: Uses indentation (spaces, never tabs) for structure. It is highly human-readable, supports comments (#), and has no brackets or braces.\n• JSON: Uses curly braces {} for objects, square brackets [] for arrays, and colons for key-value maps. Keys must be double-quoted. It does not support comments and is less human-readable.",
    command: "# YAML representation:\ndatabase:\n  host: dbhost\n  port: 5432\n\n# JSON equivalent:\n# {\n#   \"database\": {\n#     \"host\": \"dbhost\",\n#     \"port\": 5432\n#   }\n# }"
  },
  {
    id: 261,
    title: "What is a Dockerfile and explain its basic commands?",
    category: "devops",
    difficulty: "easy",
    answer: "A Dockerfile is a text document containing instructions to build a Docker image:\n• FROM: Sets the base image (e.g. ubuntu, alpine, node).\n• RUN: Runs a command during the image build phase (installs packages).\n• COPY: Copies local files from host machine to the image filesystem.\n• CMD: Specifies the default command to execute when the container starts.",
    command: "# Create a simple Dockerfile\ncat << 'EOF' > Dockerfile\nFROM alpine:3.18\nRUN apk add --no-cache curl\nCOPY app.sh /app.sh\nCMD [\"sh\", \"/app.sh\"]\nEOF"
  },
  {
    id: 262,
    title: "How do you list, stop, and remove Docker containers from the CLI?",
    category: "devops",
    difficulty: "easy",
    answer: "Docker provides CLI commands to manage container lifecycles:\n• docker ps: Lists running containers.\n• docker ps -a: Lists *all* containers (running and stopped).\n• docker stop [ID/Name]: Gracefully terminates a running container (SIGTERM).\n• docker rm [ID/Name]: Deletes a stopped container.\n• docker kill [ID/Name]: Forcefully kills a container (SIGKILL).",
    command: "# List active containers\ndocker ps\n\n# Stop a container named 'my-web-app'\ndocker stop my-web-app\n\n# Delete the stopped container\ndocker rm my-web-app\n\n# Delete all stopped containers at once\ndocker container prune -f"
  },
  {
    id: 263,
    title: "What is Kubernetes (K8s) and what is a Pod?",
    category: "devops",
    difficulty: "easy",
    answer: "Kubernetes is an open-source container orchestration platform designed to automate deploying, scaling, and managing containerized applications.\n\n• Pod: The smallest deployable unit in Kubernetes. A Pod hosts one or more containers (usually just one) that share network interfaces, storage volumes, and IP addresses. Containers within a Pod communicate using localhost.",
    command: "# List active pods in default namespace\nkubectl get pods\n\n# Describe details of a specific pod\nkubectl describe pod my-app-pod"
  },
  {
    id: 264,
    title: "What is a Jenkinsfile and explain declarative vs scripted pipeline syntax?",
    category: "devops",
    difficulty: "easy",
    answer: "A Jenkinsfile is a text file that contains the definition of a Jenkins Pipeline and is committed to source control.\n• Declarative Pipeline: Uses a structured, pre-defined format (stages, step, agent) which is easier to write and read. It has built-in syntax validation.\n• Scripted Pipeline: Uses Groovy script code. It is highly flexible but complex to write and maintain.",
    command: "# Minimal Declarative Pipeline structure:\n# pipeline {\n#   agent any\n#   stages {\n#     stage('Test') {\n#       steps { sh 'npm test' }\n#     }\n#   }\n# }"
  },
  {
    id: 265,
    title: "What is Prometheus and Grafana in DevOps monitoring?",
    category: "devops",
    difficulty: "easy",
    answer: "Prometheus and Grafana are open-source tools used for system observability:\n• Prometheus: A time-series database and monitoring tool. It pulls (scrapes) numeric metrics from targets at regular intervals, evaluates rule expressions, and triggers alerts.\n• Grafana: A visualization platform. It connects to Prometheus (and other databases) to build rich, interactive dashboards displaying graphs, CPU/Memory charts, and server statuses.",
    command: "# Check active Prometheus config file\n# cat /etc/prometheus/prometheus.yml"
  },
  {
    id: 266,
    title: "Explain Git branching strategy: Gitflow vs Trunk-Based Development",
    category: "devops",
    difficulty: "easy",
    answer: "• Gitflow: Multi-branch strategy. Developers work on 'feature' branches, merge to 'develop', release via 'release' branches, and merge to 'main' for production. It is highly controlled but slow and creates merge debt.\n• Trunk-Based Development: Modern CI/CD practice. Developers merge small, frequent commits into a single central branch ('trunk' or 'main') daily. Feature flags are used to hide incomplete features. It accelerates CI/CD pipelines.",
    command: "# Trunk-based simple flow:\n# git checkout main\n# git pull\n# git checkout -b feat/add-login\n# (write code) -> commit -> merge directly to main"
  },
  {
    id: 267,
    title: "Explain the difference between Docker CMD and ENTRYPOINT instructions",
    category: "devops",
    difficulty: "easy",
    answer: "Both define the execution command of a container, but interact differently when arguments are passed at runtime:\n• ENTRYPOINT: Configures the container to run as an executable. It cannot be overridden by standard docker run arguments (unless using --entrypoint).\n• CMD: Defines default arguments or commands. It can be easily overridden by appending commands to `docker run`.\nIf combined, CMD acts as default parameters appended to the ENTRYPOINT command.",
    command: "# In Dockerfile:\n# ENTRYPOINT [\"ping\"]\n# CMD [\"8.8.8.8\"]\n\n# Running container without args pings 8.8.8.8:\n# docker run my-ping-image\n\n# Running with args overrides CMD, pinging 1.1.1.1 instead:\n# docker run my-ping-image 1.1.1.1"
  },
  {
    id: 268,
    title: "What is Ansible and what is a Playbook?",
    category: "devops",
    difficulty: "easy",
    answer: "Ansible is an open-source, agentless configuration management tool. It connects to remote hosts over SSH (or WinRM) to install software, modify configurations, and manage user accounts.\n\n• Playbook: A YAML file containing one or more 'plays'. Each play defines the target host group and a sequential list of 'tasks' (e.g. install Nginx, copy config, start service) using built-in Ansible modules.",
    command: "# Execute an Ansible Playbook\nansible-playbook -i inventory.ini deploy_web.yml"
  },
  {
    id: 269,
    title: "Explain Microservices architecture vs Monolithic",
    category: "devops",
    difficulty: "easy",
    answer: "• Monolithic Architecture: The entire application (UI, business logic, database access) is built, packaged, and deployed as a single unit. It is simple to develop but hard to scale, scale limits block progress, and a single bug can crash the entire system.\n• Microservices Architecture: The application is split into small, independent services (e.g. payment service, user service) communicating via lightweight protocols (REST, gRPC, message queues). Each service has its own database, can be written in different languages, and scales independently.",
    command: "# Microservices layout:\n# UI Gateway -> Auth Service (DB1) & Payment Service (DB2) & Email Queue"
  },
  {
    id: 270,
    title: "Explain Kubernetes Services: ClusterIP vs NodePort vs LoadBalancer",
    category: "devops",
    difficulty: "medium",
    answer: "Kubernetes Pods are ephemeral (they die and get recreated with new IP addresses). Services provide a stable network endpoint to route traffic to active Pods:\n• ClusterIP (Default): Exposes the service on a private internal cluster IP. It is accessible only from inside the Kubernetes cluster.\n• NodePort: Exposes the service on a static port (30000-32767) on each Node's IP. External traffic can access the service by calling Node_IP:NodePort.\n• LoadBalancer: Integrates with cloud providers (AWS, GCP) to automatically provision a public-facing cloud load balancer routing directly to NodePorts.",
    command: "# Expose a deployment named 'my-web' via NodePort\nkubectl expose deployment my-web --type=NodePort --port=80 --target-port=8080\n\n# Get service status and exposed ports\nkubectl get svc"
  },
  {
    id: 271,
    title: "How do you optimize Docker image sizes using multi-stage builds?",
    category: "devops",
    difficulty: "medium",
    answer: "Standard Docker builds package compilers, test tools, and source code into the final image, bloating sizes (e.g. Node SDK is 1GB+). Multi-stage builds use multiple FROM instructions in a single Dockerfile. You compile code in a heavy 'build' stage, and then copy *only* the compiled binary/dist folder into a lightweight 'runtime' stage (e.g., alpine or distroless), stripping out compilers and source code.",
    command: "# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80"
  },
  {
    id: 272,
    title: "What is Docker Volume and difference between bind mount vs named volume?",
    category: "devops",
    difficulty: "medium",
    answer: "By default, files created inside a container are ephemeral and get deleted when the container exits. Volumes persist container data outside the container filesystem:\n• Bind Mount: Maps a specific, absolute path on the host system to a path inside the container. Best for local development (syncing code changes instantly).\n• Named Volume: Managed entirely by Docker. Docker stores the data in a dedicated folder (/var/lib/docker/volumes/) on the host. Best for production databases and backups since it prevents host OS directory conflicts.",
    command: "# Run container with a bind mount\ndocker run -d -v /home/user/project:/app node:18\n\n# Run container with a named volume (created if missing)\ndocker run -d -v db_data:/var/lib/postgresql/data postgres:15-alpine"
  },
  {
    id: 273,
    title: "How to manage Kubernetes configurations using ConfigMaps and Secrets?",
    category: "devops",
    difficulty: "medium",
    answer: "Decoupling config parameters from container images ensures portability across Dev, Staging, and Prod environments:\n• ConfigMap: Stores non-sensitive, plain-text key-value configurations (database hostnames, ports, environment flags).\n• Secret: Stores sensitive configurations (passwords, tokens, API keys) encoded in Base64. Secrets are stored in temp memory (tmpfs) on nodes, protecting them from disk exposure.\nBoth can be loaded as environment variables or mounted as files inside pods.",
    command: "# Create a ConfigMap from a literal value\nkubectl create configmap app-config --from-literal=DB_HOST=pgdb.local\n\n# Create a Secret\nkubectl create secret generic db-credentials --from-literal=password=SuperSecret\n\n# View secret (returns Base64 encoded value)\nkubectl get secret db-credentials -o yaml"
  },
  {
    id: 274,
    title: "Explain Blue-Green deployment vs Canary deployment strategies",
    category: "devops",
    difficulty: "medium",
    answer: "• Blue-Green Deployment: You maintain two identical environments. Blue is active (production), Green is standby. You deploy the new release to Green, run integration tests, and then swap router DNS/load balancer targets to point to Green. It provides instant rollback but is expensive as it requires doubling resource footprints.\n• Canary Deployment: You deploy the new release to a small subset of instances (e.g. 5% of traffic). You monitor error rates, CPU usage, and user behavior. If stable, you roll it out to 100% of servers. It minimizes blast radius of bugs.",
    command: "# Routing swap representation:\n# Router -> Blue (v1.0)\n# (Deploy v2.0 to Green) -> (Tests Pass) -> Swap Router to Green (v2.0)"
  },
  {
    id: 275,
    title: "What is Git merge vs rebase, and when should you use which?",
    category: "devops",
    difficulty: "medium",
    answer: "Both integrate commits from one branch into another:\n• Merge: Creates a new 'merge commit' combining the histories of both branches. It preserves the exact chronological history of work but can clutter the git tree with merge commits.\n• Rebase: Rewrites commits from the feature branch on top of the target branch's latest commit. It creates a clean, linear commit history, but it alters commit hashes. Rule of thumb: Never rebase public shared branches; only rebase local private branches to clean up work before merging.",
    command: "# Rebase feature branch on top of main\ngit checkout feature-login\ngit rebase main\n\n# If conflicts, resolve and run:\ngit rebase --continue"
  },
  {
    id: 276,
    title: "How do you handle secrets securely in Jenkins/GitHub Actions pipelines?",
    category: "devops",
    difficulty: "medium",
    answer: "Hardcoding passwords or SSH keys in pipeline scripts or committing them to git is a critical vulnerability. Instead:\n• GitHub Actions: Save secrets in Repository Settings under 'Secrets and variables'. Reference them in YAML as `${{ secrets.SECRET_NAME }}`. GitHub masks these values in console outputs automatically.\n• Jenkins: Save secrets in the Credentials Manager. Bind credentials to environment variables using the `withCredentials` block in Jenkinsfiles.",
    command: "# In GitHub Actions pipeline YAML:\n# steps:\n#   - name: Deploy to Docker Hub\n#     env:\n#       DOCKER_PASSWORD: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}\n#     run: echo \"$DOCKER_PASSWORD\" | docker login -u user --password-stdin"
  },
  {
    id: 277,
    title: "What is Terraform state file and why is remote state locking important?",
    category: "devops",
    difficulty: "medium",
    answer: "Terraform saves the configuration mappings and metadata of the resources it manages to a local file called `terraform.tfstate`.\n\nRemote State and Locking:\n• Committing state to git exposes sensitive parameters (passwords are stored in plain text in the state file).\n• In a team, if two developers run `terraform apply` concurrently, it can lead to state corruption or duplicate resources.\n• Fix: Store the state file in a remote backend (e.g. S3) and configure remote locking using a database (e.g. DynamoDB) to lock access during runs.",
    command: "# Terraform backend configuration block:\n# terraform {\n#   backend \"s3\" {\n#     bucket         = \"prod-terraform-state-bucket\"\n#     key            = \"vpc/terraform.tfstate\"\n#     dynamodb_table = \"terraform-locks\"\n#   }\n# }"
  },
  {
    id: 278,
    title: "What is Ansible Inventory and dynamic inventories?",
    category: "devops",
    difficulty: "medium",
    answer: "• Ansible Inventory: A file (INI or YAML format) listing the hostnames, IP addresses, and group structures of target servers that Ansible connects to.\n• Dynamic Inventory: In cloud environments (AWS, GCP), instances scale up and down, changing IP addresses constantly, making static files obsolete. A dynamic inventory is an Ansible plugin/script that queries cloud API endpoints to automatically resolve and group hosts based on tags (e.g. environment:production).",
    command: "# Static Inventory (inventory.ini):\n# [web_servers]\n# 192.168.1.15 ansible_user=deploy\n# 192.168.1.16 ansible_user=deploy\n\n# Using AWS dynamic inventory plugin (aws_ec2):\n# ansible-playbook -i aws_ec2.yml deploy_web.yml"
  },
  {
    id: 279,
    title: "Explain Kubernetes ReplicaSet vs Deployment vs StatefulSet",
    category: "devops",
    difficulty: "medium",
    answer: "• ReplicaSet: Ensures a specified number of identical Pod replicas are running at all times. It replaces pods if they crash.\n• Deployment: Wraps around ReplicaSets. It provides declarative updates for Pods (rolling updates, rollbacks) and handles updates automatically.\n• StatefulSet: Used for stateful applications (databases like Postgres or Cassandra). Unlike deployments where pods have random names (app-58da-21), StatefulSet Pods have static, ordinal names (db-0, db-1). They maintain persistent volume mappings and scale in a strict sequential order.",
    command: "# Scale a deployment to 5 replicas\nkubectl scale deployment my-web-app --replicas=5\n\n# View StatefulSet pods (ordered ordinal IDs)\nkubectl get pods -l app=database"
  },
  {
    id: 280,
    title: "How to implement log aggregation using the ELK Stack?",
    category: "devops",
    difficulty: "medium",
    answer: "Log files scattered across hundreds of servers are difficult to search. The ELK Stack provides centralized log aggregation:\n• Filebeat/Logstash: Agents collect logs from servers and parse them.\n• Elasticsearch: A search engine that indexes and stores logs.\n• Kibana: A web interface to search logs using query expressions.",
    command: "# Search logs dynamically in elasticsearch via REST API\ncurl -X GET \"localhost:9200/nginx-logs/_search?q=status:500&pretty\""
  },
  {
    id: 281,
    title: "What is Prometheus exporter and how do you monitor custom metrics?",
    category: "devops",
    difficulty: "medium",
    answer: "Prometheus does not monitor systems directly. It relies on Exporters (agents running on targets that translate local metrics to a text format Prometheus can parse):\n• Node Exporter: Collects hardware metrics (disk, CPU, RAM).\n• PostgreSQL/MySQL Exporter: Collects database active sessions, locks, and cache hit ratios.\n• Custom Application Metrics: Libraries expose an HTTP endpoint (usually /metrics) hosting counters or gauges.",
    command: "# Curl Node Exporter endpoint to see Prometheus formatting\ncurl http://localhost:9100/metrics | head -n 10\n\n# Example of output:\n# node_cpu_seconds_total{cpu=\"0\",mode=\"idle\"} 12450.8"
  },
  {
    id: 282,
    title: "Designing a simple CI pipeline in GitHub Actions",
    category: "devops",
    difficulty: "medium",
    answer: "GitHub Actions automates code checks via YAML files committed to `.github/workflows/`. The runner pulls the repository, installs dependencies, runs tests, and can compile Docker artifacts.",
    command: "# Create directory structure and add workflow file\nmkdir -p .github/workflows\ncat << 'EOF' > .github/workflows/ci.yml\nname: Node CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Install dependencies\n        run: npm ci\n      - name: Run Tests\n        run: npm test\nEOF"
  },
  {
    id: 283,
    title: "What is Helm and how do you manage Kubernetes applications?",
    category: "devops",
    difficulty: "medium",
    answer: "Helm is a package manager for Kubernetes. Managing apps using raw YAML files is hard because configuring different parameters for Dev/Staging requires duplicating code.\n• Helm Charts: Packages of parameterized template files.\n• values.yaml: A file containing values applied to templates.\n• Releases: Installed instances of charts. Supports quick upgrades/rollbacks.",
    command: "# Add public repo and install a Redis cluster using Helm\nhelm repo add bitnami https://charts.bitnami.com/bitnami\nhelm install my-redis bitnami/redis --set auth.password=secret\n\n# Rollback to revision 1\nhelm rollback my-redis 1"
  },
  {
    id: 284,
    title: "Troubleshooting Kubernetes Pod stuck in CrashLoopBackOff status",
    category: "devops",
    difficulty: "hard",
    answer: "CrashLoopBackOff indicates the Pod starts, encounters a fatal error, crashes, and Kubernetes attempts to restart it repeatedly with an exponential delay.\n\nDiagnostics steps:\n1. Inspect pod events: Run `kubectl describe pod [pod_name]` to see if there are OOM kills or liveness probe failures.\n2. Fetch container logs: Run `kubectl logs [pod_name] --previous` to print the error output before the crash.\n3. Common causes: Missing environment variables, database port connection drops, file permission errors, or syntax runtime crashes.",
    command: "# Check events and container statuses\nkubectl describe pod my-api-pod\n\n# View logs of the crashed container instance\nkubectl logs my-api-pod --previous\n\n# Run dynamic shell debug container in the pod's network (ephemeral container)\n# kubectl debug -it my-api-pod --image=busybox"
  },
  {
    id: 285,
    title: "Designing secure rolling updates in Kubernetes using probes",
    category: "devops",
    difficulty: "hard",
    answer: "A production rolling update must not drop connections or route traffic to uninitialized pods. Configure Deployment rolling update limits alongside proper container health checks:\n• Readiness Probe: Determines if the container is ready to accept traffic. If it fails, the pod is removed from Service endpoints.\n• Liveness Probe: Determines if the container needs to be restarted. If it fails, the container is killed and restarted.\n• Startup Probe: Disables liveness/readiness probes during initial startup to prevent premature kills of slow-booting apps.\n• maxSurge and maxUnavailable: Controls how many pods are created and destroyed during deployment rolling transitions.",
    command: "# Deployment yaml snippet configuration:\n# spec:\n#   strategy:\n#     type: RollingUpdate\n#     rollingUpdate:\n#       maxSurge: 25%\n#       maxUnavailable: 0\n#   template:\n#     spec:\n#       containers:\n#         - name: web\n#           readinessProbe:\n#             httpGet:\n#               path: /healthz\n#               port: 8080\n#             initialDelaySeconds: 5\n#             periodSeconds: 10"
  },
  {
    id: 286,
    title: "Writing Terraform code to provision a highly available VPC",
    category: "devops",
    difficulty: "hard",
    answer: "Provisioning a multi-AZ VPC requires dynamically mapping resources. Best practices include modularizing subnets across availability zones, routing private traffic through NAT Gateways, and locking state changes using DynamoDB.",
    command: "# Run terraform commands\n# Initialize working directory, downloading AWS plugins\nterraform init\n\n# Show resource execution plans to verify configurations\nterraform plan\n\n# Apply modifications to provision the VPC infrastructure\n# terraform apply -auto-approve"
  },
  {
    id: 287,
    title: "Designing a GitOps continuous delivery pipeline using ArgoCD",
    category: "devops",
    difficulty: "hard",
    answer: "GitOps uses Git repositories as the Single Source of Truth for infrastructure states. In push pipelines, CI environments deploy changes. In pull-based GitOps (ArgoCD), an agent runs in the Kubernetes cluster. It polls the Git repository for changes, compares the declared manifest state against the live cluster state, and automatically reconciles deviations (pruning orphan resources). This eliminates the need to expose Kubernetes cluster credentials to CI environments.",
    command: "# Log into ArgoCD server CLI\nargocd login argocd.company.com --username admin --password secret\n\n# Create application to sync deployment manifest repo to cluster namespace\nargocd app create prod-web-app \\\n  --repo https://github.com/app/deploy-manifests.git \\\n  --path overlays/production \\\n  --dest-server https://kubernetes.default.svc \\\n  --dest-namespace production \\\n  --sync-policy auto"
  },
  {
    id: 288,
    title: "Troubleshooting Docker network interface drops and MTU mismatch errors",
    category: "devops",
    difficulty: "hard",
    answer: "Network timeouts or connection freezes (large payloads drop, small payloads succeed) between containers and external networks often indicate Maximum Transmission Unit (MTU) mismatches. If physical network switches restrict packet frames (e.g. overlay networks like vxlan caps frames at 1450 bytes) but Docker defaults interfaces to 1500 bytes, packets get fragmented or silently dropped.\n\nResolution:\n• Configure custom MTU settings in `/etc/docker/daemon.json` to match physical interfaces.\n• Restart the Docker daemon and verify bridge network interfaces.",
    command: "# View current network interfaces and MTU sizes\nip link show\n\n# Set custom docker MTU in daemon.json:\n# {\n#   \"mtu\": 1450\n# }\n# Restart service:\n# sudo systemctl restart docker"
  },
  {
    id: 289,
    title: "Implementing container security scanning in CI/CD pipelines using Trivy",
    category: "devops",
    difficulty: "hard",
    answer: "Production pipelines must identify security issues before pushing images to registries. Integrate vulnerability scanners (like Trivy) to audit base packages, library dependencies, and look for secrets committed in code. The pipeline should crash if high or critical vulnerabilities are discovered.",
    command: "# Scan code repository for vulnerabilities and secrets\ntrivy fs .\n\n# Scan a built Docker image, exit with code 1 if critical issues exist\ntrivy image --severity HIGH,CRITICAL --exit-code 1 my-app:latest"
  },
  {
    id: 290,
    title: "Configuring Ansible roles and vault encryption for multi-environment deployments",
    category: "devops",
    difficulty: "hard",
    answer: "Structuring complex playbooks requires creating Ansible Roles (modular directories separating tasks, variables, files, templates, and handlers). To manage sensitive values (database passwords, private keys), use `ansible-vault` to encrypt files. The playbook decrypts secrets in memory during executions.",
    command: "# Create vault file containing passwords\nansible-vault create vars/prod_secrets.yml\n\n# Run playbook passing vault password file\nansible-playbook -i inventories/production/hosts site.yml --vault-password-file ~/.vault_pass.txt"
  },
  {
    id: 291,
    title: "Scaling Kubernetes nodes dynamically using Karpenter vs Cluster Autoscaler",
    category: "devops",
    difficulty: "hard",
    answer: "• Cluster Autoscaler: Standard scaling tool. It monitors for pods that cannot schedule due to resource constraints, calls cloud provider APIs to add instances to Auto Scaling Groups (ASGs). Scaling is slow (minutes) and bound by fixed instance group definitions.\n• Karpenter: Modern, high-performance node provisioner developed for AWS EKS. It operates agentless, bypasses ASGs, and directly evaluates scheduling constraints. Karpenter launches optimal, mixed-type EC2 instances directly to match pod requirements (bin-packing), improving scale times to seconds.",
    command: "# Get Karpenter configuration CRDs\nkubectl get provisioners -A 2>/dev/null || echo \"Karpenter not installed\""
  },
  {
    id: 292,
    title: "Designing a distributed tracing system using OpenTelemetry",
    category: "devops",
    difficulty: "hard",
    answer: "In microservices, identifying performance bottlenecks requires distributed tracing. OpenTelemetry provides standard SDKs to instrument applications. The SDK injects tracing contexts (traceparent header) into outgoing HTTP/gRPC requests. Internal calls generate Span records, forwarded to an OpenTelemetry Collector. The collector buffers, filters, and forwards traces to backends like Jaeger or Zipkin.",
    command: "# Trace context injection header standard format:\n# traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
  },
  {
    id: 293,
    title: "Troubleshooting Terraform state lockouts and resolving state corruption",
    category: "devops",
    difficulty: "hard",
    answer: "If a terraform execution crashes, gets killed, or network connectivity drops during an update, the DynamoDB lock remains active, blocking all future runs with a 'State Locked' error.\n\nResolution:\n1. Copy the Lock Info ID from the terminal error message.\n2. Force unlock the lock dynamically using the ID.\n3. If state corruption occurs, never edit the raw state file manually. Use `terraform state` subcommands to view, import, remove, or pull the state database.",
    command: "# Force release a lock using lock ID\nterraform force-unlock 1234abcd-12ab-34cd-56ef-1234567890ab\n\n# Pull remote state file to local environment safely for review\nterraform state pull > state_debug.json\n\n# Remove a resource from state manually without destroying it\nterraform state rm aws_instance.old_server"
  },
  {
    id: 294,
    title: "Configuring Nginx Ingress Controllers with cert-manager for Let's Encrypt SSL",
    category: "devops",
    difficulty: "hard",
    answer: "An Ingress Controller manages external traffic entering a Kubernetes cluster. cert-manager automates SSL certificate management. It registers custom resources (ClusterIssuers) validating ownership via HTTP-01 or DNS-01 challenges, contacts Let's Encrypt to sign certificates, and dynamically provisions Kubernetes TLS secrets used by Nginx Ingress to secure routes.",
    command: "# Check active cert-manager issuers\nkubectl get clusterissuers\n\n# Check certificate renewal status\nkubectl get certificates -A"
  },
  {
    id: 295,
    title: "Implementing Mutual TLS (mTLS) and Traffic Policies using Istio Service Mesh",
    category: "devops",
    difficulty: "hard",
    answer: "In Kubernetes, pod-to-pod network traffic is unencrypted by default. Istio Service Mesh secures cluster traffic without modifying application code by injecting Envoy proxy sidecars. The proxy intercepts all inbound and outbound traffic, using a central control plane (Istiod) to distribute TLS certificates, enforce strict Mutual TLS (mTLS) configurations, and control service traffic policies (e.g. rate limiting or circuit breaking).",
    command: "# Enable Istio sidecar injection on a namespace\nkubectl label namespace default istio-injection=enabled\n\n# Apply PeerAuthentication rule to enforce strict mTLS\n# kubectl apply -f - <<EOF\n# apiVersion: security.istio.io/v1beta1\n# kind: PeerAuthentication\n# metadata:\n#   name: default\n# spec:\n#   mtu: STRICT\n# EOF"
  },
  {
    id: 296,
    title: "Troubleshooting Jenkins pipeline memory leaks and executor node optimization",
    category: "devops",
    difficulty: "hard",
    answer: "Jenkins runs on the JVM. Poorly written Groovy scripts (e.g. loops with large outputs, serializing non-serializable objects) can cause Metaspace or Heap exhaustion, crashing Jenkins with Out-Of-Memory (OOM) errors.\n\nOptimization:\n• Restrict master nodes from running build executions. Move tasks to remote agent nodes (using Docker containers or VM nodes).\n• Use Pipeline Shared Libraries to modularize code.\n• Tune garbage collection parameters and limit build log history sizes.",
    command: "# Example JVM arguments for Jenkins Master node in system configuration:\n# JAVA_OPTS=\"-XX:+UseG1GC -XX:+UseStringDeduplication -Xms4g -Xmx8g -XX:MaxMetaspaceSize=1g\""
  },
  {
    id: 297,
    title: "Designing disaster recovery replication for Kubernetes using Velero backups",
    category: "devops",
    difficulty: "hard",
    answer: "Backing up Kubernetes objects requires capturing both resource manifests (deployments, configs) and physical data volumes. Velero is a backup tool that hooks into cloud APIs to create backups of cluster objects, alongside physical snapshots of PV storage volumes, exporting them to secure S3 vaults.",
    command: "# Install Velero CLI and trigger a cluster backup\nvelero backup create prod-cluster-backup --include-namespaces production\n\n# Describe backup logs and verify snapshot runs\nvelero backup describe prod-cluster-backup"
  },
  {
    id: 298,
    title: "Managing configurations securely using HashiCorp Vault",
    category: "devops",
    difficulty: "hard",
    answer: "HashiCorp Vault provides centralized secret management. Unlike static config files, Vault encrypts data transit dynamically, offers role-based access, and generates dynamic credentials (e.g. databases passwords valid for 1 hour). Applications authenticate to Vault via Kubernetes service accounts or IAM policies to retrieve secrets dynamically.",
    command: "# Read database secret from Vault CLI\nvault kv get secret/production/database"
  },
  {
    id: 299,
    title: "Troubleshooting high CPU/Memory resource starvation on Kubernetes worker nodes",
    category: "devops",
    difficulty: "hard",
    answer: "If worker nodes run out of memory or CPU, they begin evicting Pods. The kernel may trigger OOMKilled events. To prevent resource starvation, enforce LimitRanges and ResourceQuotas. Always define 'requests' (minimum resources guaranteed) and 'limits' (maximum ceiling resources) in Pod specs.",
    command: "# View node resource consumption\nkubectl top nodes\n\n# View pod resource consumption\nkubectl top pods -A\n\n# Check for evicted pods or system warnings\nkubectl get pods -A | grep -iE 'evicted|oomkilled'"
  },
  {
    id: 300,
    title: "Designing multi-region deployments in GitHub Actions using AWS OIDC role assumption",
    category: "devops",
    difficulty: "hard",
    answer: "Exposing permanent AWS Access Keys inside GitHub Actions is a security risk. Instead, configure an OpenID Connect (OIDC) trust relationship between GitHub and AWS. GitHub Actions requests a short-lived JWT token from GitHub's OIDC provider. The action then presents this token to AWS Security Token Service (STS) to assume an IAM Role dynamically, retrieving temporary credentials valid for 1 hour.",
    command: "# Workflow file configuration:\n# - name: Configure AWS Credentials\n#   uses: aws-actions/configure-aws-credentials@v2\n#   with:\n#     role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeployRole\n#     aws-region: us-east-1"
  },
  {
    id: 400,
    title: "How do you create a new ExpressRoute resource?",
    category: "azure",
    difficulty: "easy",
    answer: "[ExpressRoute - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 401,
    title: "What is the primary use case for Azure Data Lake Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Data Lake Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 402,
    title: "How can you monitor the basic metrics of ExpressRoute?",
    category: "azure",
    difficulty: "easy",
    answer: "[ExpressRoute - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 403,
    title: "Explain the pricing model for Azure Kubernetes Service (AKS).",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Kubernetes Service (AKS) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Kubernetes Service (AKS).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 404,
    title: "How do you configure basic access for Disk Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Disk Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Disk Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 405,
    title: "What are the limitations of Azure Files in the free tier?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Files - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Files.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 406,
    title: "How do you connect to a running Virtual Network (VNet) instance?",
    category: "azure",
    difficulty: "easy",
    answer: "[Virtual Network (VNet) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Network (VNet).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 407,
    title: "What is the difference between Cosmos DB and standard alternatives?",
    category: "azure",
    difficulty: "easy",
    answer: "[Cosmos DB - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cosmos DB.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 408,
    title: "How do you set up billing alerts for Azure Active Directory (AAD)?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Active Directory (AAD) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Active Directory (AAD).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 409,
    title: "What are the required parameters to initialize Azure Data Lake Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Data Lake Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 410,
    title: "How do you create a new Azure Load Balancer resource?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Load Balancer - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 411,
    title: "What is the primary use case for Blob Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Blob Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Blob Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 412,
    title: "How can you monitor the basic metrics of Key Vault?",
    category: "azure",
    difficulty: "easy",
    answer: "[Key Vault - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 413,
    title: "Explain the pricing model for Azure Load Balancer.",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Load Balancer - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 414,
    title: "How do you configure basic access for Azure Security Center?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Security Center - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Security Center.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 415,
    title: "How do you implement high availability for Azure Load Balancer across multiple zones?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Load Balancer - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 416,
    title: "Explain how to configure auto-scaling for Azure SQL Database based on CPU usage.",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure SQL Database - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure SQL Database.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 417,
    title: "What is the best way to migrate on-premises data to Azure Active Directory (AAD) with minimal downtime?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Active Directory (AAD) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Active Directory (AAD).",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 418,
    title: "How do you securely manage secrets and credentials when using Cosmos DB?",
    category: "azure",
    difficulty: "medium",
    answer: "[Cosmos DB - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cosmos DB.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 419,
    title: "Describe the process of setting up a CI/CD pipeline targeting Azure Kubernetes Service (AKS).",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Kubernetes Service (AKS) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Kubernetes Service (AKS).",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 420,
    title: "How can you optimize the cost of running Key Vault in production?",
    category: "azure",
    difficulty: "medium",
    answer: "[Key Vault - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 421,
    title: "Explain how to troubleshoot network connectivity issues with Azure Database for PostgreSQL.",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Database for PostgreSQL - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Database for PostgreSQL.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 422,
    title: "How do you implement cross-region replication for Key Vault?",
    category: "azure",
    difficulty: "medium",
    answer: "[Key Vault - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 423,
    title: "What are the best practices for logging and auditing Blob Storage?",
    category: "azure",
    difficulty: "medium",
    answer: "[Blob Storage - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Blob Storage.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 424,
    title: "How do you handle stateful workloads effectively in Virtual Machine Scale Sets?",
    category: "azure",
    difficulty: "medium",
    answer: "[Virtual Machine Scale Sets - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machine Scale Sets.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 425,
    title: "How do you implement high availability for Disk Storage across multiple zones?",
    category: "azure",
    difficulty: "medium",
    answer: "[Disk Storage - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Disk Storage.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 426,
    title: "Explain how to configure auto-scaling for App Service based on CPU usage.",
    category: "azure",
    difficulty: "medium",
    answer: "[App Service - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding App Service.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 427,
    title: "What is the best way to migrate on-premises data to Azure Files with minimal downtime?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Files - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Files.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 428,
    title: "How do you securely manage secrets and credentials when using Azure Files?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Files - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Files.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 429,
    title: "Describe the process of setting up a CI/CD pipeline targeting Virtual Machines (VMs).",
    category: "azure",
    difficulty: "medium",
    answer: "[Virtual Machines (VMs) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machines (VMs).",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 430,
    title: "How can you optimize the cost of running ExpressRoute in production?",
    category: "azure",
    difficulty: "medium",
    answer: "[ExpressRoute - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 431,
    title: "Explain how to troubleshoot network connectivity issues with Azure Load Balancer.",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Load Balancer - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 432,
    title: "How do you implement cross-region replication for Blob Storage?",
    category: "azure",
    difficulty: "medium",
    answer: "[Blob Storage - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Blob Storage.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 433,
    title: "What are the best practices for logging and auditing Application Gateway?",
    category: "azure",
    difficulty: "medium",
    answer: "[Application Gateway - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Application Gateway.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 434,
    title: "How do you handle stateful workloads effectively in Azure Load Balancer?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Load Balancer - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 435,
    title: "Design an enterprise disaster recovery architecture using Azure Data Lake Storage with an RTO of 5 minutes.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Data Lake Storage - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 436,
    title: "How would you debug a severe latency spike occurring intermittently in Azure Data Lake Storage under heavy load?",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Data Lake Storage - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 437,
    title: "Explain how to implement zero-trust network architecture integrating Azure SQL Database with on-premise Active Directory.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure SQL Database - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure SQL Database.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 438,
    title: "How do you handle a scenario where Virtual Machine Scale Sets experiences a regional outage during peak traffic?",
    category: "azure",
    difficulty: "hard",
    answer: "[Virtual Machine Scale Sets - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machine Scale Sets.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 439,
    title: "Describe a strategy for zero-downtime database schema migrations when applications are running on Azure Cache for Redis.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Cache for Redis - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Cache for Redis.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 440,
    title: "How would you architect a globally distributed, multi-tenant SaaS application utilizing Virtual Machine Scale Sets?",
    category: "azure",
    difficulty: "hard",
    answer: "[Virtual Machine Scale Sets - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machine Scale Sets.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 441,
    title: "Explain the internal mechanisms of how Virtual Machine Scale Sets handles distributed consensus and split-brain scenarios.",
    category: "azure",
    difficulty: "hard",
    answer: "[Virtual Machine Scale Sets - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machine Scale Sets.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 442,
    title: "How do you perform real-time forensic analysis on a compromised Azure Active Directory (AAD) environment?",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Active Directory (AAD) - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Active Directory (AAD).",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 443,
    title: "What is your approach to achieving 99.999% SLA using ExpressRoute in a hybrid cloud setup?",
    category: "azure",
    difficulty: "hard",
    answer: "[ExpressRoute - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 444,
    title: "Describe the process of implementing custom, low-level performance tuning on the underlying compute of Azure Security Center.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Security Center - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Security Center.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 445,
    title: "Design an enterprise disaster recovery architecture using Azure Kubernetes Service (AKS) with an RTO of 5 minutes.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Kubernetes Service (AKS) - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Kubernetes Service (AKS).",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 446,
    title: "How would you debug a severe latency spike occurring intermittently in Azure Database for PostgreSQL under heavy load?",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Database for PostgreSQL - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Database for PostgreSQL.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 447,
    title: "Explain how to implement zero-trust network architecture integrating Azure Database for PostgreSQL with on-premise Active Directory.",
    category: "azure",
    difficulty: "hard",
    answer: "[Azure Database for PostgreSQL - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Database for PostgreSQL.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 448,
    title: "How do you handle a scenario where Key Vault experiences a regional outage during peak traffic?",
    category: "azure",
    difficulty: "hard",
    answer: "[Key Vault - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 449,
    title: "Describe a strategy for zero-downtime database schema migrations when applications are running on Application Gateway.",
    category: "azure",
    difficulty: "hard",
    answer: "[Application Gateway - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Application Gateway.",
    command: "# Advanced multi-region setup\naz network traffic-manager profile create --name MyProfile --resource-group MyResourceGroup\naz postgres server replica create --name MyReplica --source-server MyPrimary"
  },
  {
    id: 450,
    title: "How do you create a new Google Kubernetes Engine (GKE) resource?",
    category: "google",
    difficulty: "easy",
    answer: "[Google Kubernetes Engine (GKE) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Google Kubernetes Engine (GKE).",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 451,
    title: "What is the primary use case for Persistent Disk?",
    category: "google",
    difficulty: "easy",
    answer: "[Persistent Disk - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Persistent Disk.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 452,
    title: "How can you monitor the basic metrics of App Engine?",
    category: "google",
    difficulty: "easy",
    answer: "[App Engine - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding App Engine.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 453,
    title: "Explain the pricing model for Cloud Run.",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Run - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Run.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 454,
    title: "How do you configure basic access for Cloud Storage?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Storage.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 455,
    title: "What are the limitations of Persistent Disk in the free tier?",
    category: "google",
    difficulty: "easy",
    answer: "[Persistent Disk - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Persistent Disk.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 456,
    title: "How do you connect to a running Filestore instance?",
    category: "google",
    difficulty: "easy",
    answer: "[Filestore - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 457,
    title: "What is the difference between Security Command Center and standard alternatives?",
    category: "google",
    difficulty: "easy",
    answer: "[Security Command Center - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Security Command Center.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 458,
    title: "How do you set up billing alerts for VPC Network?",
    category: "google",
    difficulty: "easy",
    answer: "[VPC Network - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Network.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 459,
    title: "What are the required parameters to initialize Cloud Spanner?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Spanner - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Spanner.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 460,
    title: "How do you create a new Cloud Run resource?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Run - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Run.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 461,
    title: "What is the primary use case for Bigtable?",
    category: "google",
    difficulty: "easy",
    answer: "[Bigtable - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Bigtable.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 462,
    title: "How can you monitor the basic metrics of Cloud Functions?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Functions - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Functions.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 463,
    title: "Explain the pricing model for Cloud DNS.",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud DNS - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud DNS.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 464,
    title: "How do you configure basic access for Cloud Spanner?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Spanner - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Spanner.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 465,
    title: "How do you implement high availability for Cloud SQL across multiple zones?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud SQL - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud SQL.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 466,
    title: "Explain how to configure auto-scaling for VPC Service Controls based on CPU usage.",
    category: "google",
    difficulty: "medium",
    answer: "[VPC Service Controls - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Service Controls.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 467,
    title: "What is the best way to migrate on-premises data to Bigtable with minimal downtime?",
    category: "google",
    difficulty: "medium",
    answer: "[Bigtable - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Bigtable.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 468,
    title: "How do you securely manage secrets and credentials when using Filestore?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 469,
    title: "Describe the process of setting up a CI/CD pipeline targeting Cloud DNS.",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud DNS - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud DNS.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 470,
    title: "How can you optimize the cost of running Filestore in production?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 471,
    title: "Explain how to troubleshoot network connectivity issues with VPC Network.",
    category: "google",
    difficulty: "medium",
    answer: "[VPC Network - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Network.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 472,
    title: "How do you implement cross-region replication for Cloud IAM?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud IAM - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud IAM.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 473,
    title: "What are the best practices for logging and auditing Filestore?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 474,
    title: "How do you handle stateful workloads effectively in Cloud IAM?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud IAM - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud IAM.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 475,
    title: "How do you implement high availability for Filestore across multiple zones?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 476,
    title: "Explain how to configure auto-scaling for Filestore based on CPU usage.",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 477,
    title: "What is the best way to migrate on-premises data to Google Kubernetes Engine (GKE) with minimal downtime?",
    category: "google",
    difficulty: "medium",
    answer: "[Google Kubernetes Engine (GKE) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Google Kubernetes Engine (GKE).",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 478,
    title: "How do you securely manage secrets and credentials when using Bigtable?",
    category: "google",
    difficulty: "medium",
    answer: "[Bigtable - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Bigtable.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 479,
    title: "Describe the process of setting up a CI/CD pipeline targeting Google Kubernetes Engine (GKE).",
    category: "google",
    difficulty: "medium",
    answer: "[Google Kubernetes Engine (GKE) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Google Kubernetes Engine (GKE).",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 480,
    title: "How can you optimize the cost of running VPC Service Controls in production?",
    category: "google",
    difficulty: "medium",
    answer: "[VPC Service Controls - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Service Controls.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 481,
    title: "Explain how to troubleshoot network connectivity issues with Local SSD.",
    category: "google",
    difficulty: "medium",
    answer: "[Local SSD - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Local SSD.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 482,
    title: "How do you implement cross-region replication for Cloud Functions?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud Functions - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Functions.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 483,
    title: "What are the best practices for logging and auditing Cloud Spanner?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud Spanner - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Spanner.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 484,
    title: "How do you handle stateful workloads effectively in Firestore?",
    category: "google",
    difficulty: "medium",
    answer: "[Firestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Firestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 485,
    title: "Design an enterprise disaster recovery architecture using Cloud Storage with an RTO of 5 minutes.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud Storage - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Storage.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 486,
    title: "How would you debug a severe latency spike occurring intermittently in Compute Engine under heavy load?",
    category: "google",
    difficulty: "hard",
    answer: "[Compute Engine - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Compute Engine.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 487,
    title: "Explain how to implement zero-trust network architecture integrating VPC Service Controls with on-premise Active Directory.",
    category: "google",
    difficulty: "hard",
    answer: "[VPC Service Controls - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Service Controls.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 488,
    title: "How do you handle a scenario where Persistent Disk experiences a regional outage during peak traffic?",
    category: "google",
    difficulty: "hard",
    answer: "[Persistent Disk - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Persistent Disk.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 489,
    title: "Describe a strategy for zero-downtime database schema migrations when applications are running on Cloud DNS.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud DNS - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud DNS.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 490,
    title: "How would you architect a globally distributed, multi-tenant SaaS application utilizing Cloud CDN?",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud CDN - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud CDN.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 491,
    title: "Explain the internal mechanisms of how Cloud CDN handles distributed consensus and split-brain scenarios.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud CDN - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud CDN.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 492,
    title: "How do you perform real-time forensic analysis on a compromised VPC Service Controls environment?",
    category: "google",
    difficulty: "hard",
    answer: "[VPC Service Controls - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Service Controls.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 493,
    title: "What is your approach to achieving 99.999% SLA using Cloud Storage in a hybrid cloud setup?",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud Storage - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Storage.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 494,
    title: "Describe the process of implementing custom, low-level performance tuning on the underlying compute of Cloud SQL.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud SQL - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud SQL.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 495,
    title: "Design an enterprise disaster recovery architecture using Cloud IAM with an RTO of 5 minutes.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud IAM - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud IAM.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 496,
    title: "How would you debug a severe latency spike occurring intermittently in Filestore under heavy load?",
    category: "google",
    difficulty: "hard",
    answer: "[Filestore - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 497,
    title: "Explain how to implement zero-trust network architecture integrating Local SSD with on-premise Active Directory.",
    category: "google",
    difficulty: "hard",
    answer: "[Local SSD - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Local SSD.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 498,
    title: "How do you handle a scenario where Cloud Memorystore experiences a regional outage during peak traffic?",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud Memorystore - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Memorystore.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 499,
    title: "Describe a strategy for zero-downtime database schema migrations when applications are running on Cloud Interconnect.",
    category: "google",
    difficulty: "hard",
    answer: "[Cloud Interconnect - HARD]\n\nIn enterprise, mission-critical scenarios, you must design for failure. Implement multi-region active-active deployments using global traffic routers. For data persistence, utilize asynchronous replication with conflict resolution. Implement stringent security using VPC peering, private endpoints, and KMS-encrypted data at rest. During incidents, rely on automated failover scripts and detailed distributed tracing to identify bottlenecks.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Interconnect.",
    command: "# Advanced multi-region setup\ngcloud compute backend-services create my-backend --global\ngcloud spanner instances create my-instance --config=regional-us-central1 --nodes=3"
  },
  {
    id: 500,
    title: "Difference between Security Groups and Network Access Control Lists (NACLs)",
    category: "aws",
    difficulty: "easy",
    answer: "Both act as firewalls but function at different layers of your Virtual Private Cloud (VPC):\n• Security Group: Operates at the instance level (EC2). It is stateful (inbound allowed traffic automatically allows outbound response). It supports ALLOW rules only.\n• Network ACL (NACL): Operates at the subnet level. It is stateless (outbound responses must be explicitly allowed by rules). It supports both ALLOW and DENY rules. Rules are processed in numerical order.",
    command: "# Describe security groups in a specific VPC\naws ec2 describe-security-groups --filters Name=vpc-id,Values=vpc-08ac3024c125\n\n# Describe NACLs for a specific VPC\naws ec2 describe-network-acls --filters Name=vpc-id,Values=vpc-08ac3024c125"
  },
  {
    id: 501,
    title: "Explain Amazon S3 Storage Classes and lifecycle policies",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon S3 offers different storage classes to optimize cost based on data access patterns:\n• S3 Standard: High durability and availability for active data.\n• S3 Standard-IA (Infrequent Access): Lower storage cost, but retrieval fee. For data accessed less than once a month.\n• S3 Glacier Flexible Retrieval: Secure, low-cost archive with retrieval times from minutes to hours.\n• S3 Glacier Deep Archive: Lowest cost storage with retrievals in 12 hours.\nLifecycle policies automate transitions between these classes (e.g. move logs to Glacier after 30 days, then delete after 90 days).",
    command: "# Put a lifecycle configuration on an S3 bucket\naws s3api put-bucket-lifecycle-configuration \\\n  --bucket my-app-logs-bucket \\\n  --lifecycle-configuration file://lifecycle.json\n\n# Contents of lifecycle.json:\n# {\n#   \"Rules\": [\n#     {\n#       \"ID\": \"MoveLogsToGlacier\",\n#       \"Status\": \"Enabled\",\n#       \"Filter\": {\"Prefix\": \"logs/\"},\n#       \"Transitions\": [\n#         {\"Days\": 30, \"StorageClass\": \"GLACIER\"}\n#       ]\n#     }\n#   ]\n# }"
  },
  {
    id: 502,
    title: "How to configure the AWS CLI on a new system?",
    category: "aws",
    difficulty: "easy",
    answer: "To interact with AWS services from the terminal, configure your access keys. Running 'aws configure' prompts for four pieces of information:\n1. AWS Access Key ID\n2. AWS Secret Access Key\n3. Default Region Name (e.g. us-east-1)\n4. Default Output Format (json, text, or table)\nThese settings are saved in credentials and config files in ~/.aws/.",
    command: "# Start interactive configuration\naws configure\n\n# Verify your identity and permissions\naws sts get-caller-identity\n\n# List files in the configuration directory\nls -l ~/.aws/"
  },
  {
    id: 503,
    title: "What is an Elastic IP address vs Public IP in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "• Public IP: Dynamically assigned to an EC2 instance. It changes every time the instance is stopped and started. This breaks external DNS or firewall white-lists.\n• Elastic IP (EIP): A static, public IPv4 address allocated to your AWS account. You can associate it with any EC2 instance. It remains unchanged even if the instance is stopped or restarted.",
    command: "# Allocate an Elastic IP address in your region\naws ec2 allocate-address --domain vpc\n\n# Associate an Elastic IP with an EC2 instance\naws ec2 associate-address --instance-id i-0482ac8c21 --public-ip 54.210.14.85"
  },
  {
    id: 504,
    title: "How do you check EC2 instance status and details using AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "Use 'aws ec2' commands to list, filter, and inspect virtual machines. Use the query parameter to return specific properties, such as IP addresses or instance states, in a clean format.",
    command: "# List all running EC2 instances with ID and Type\naws ec2 describe-instances \\\n  --filters \"Name=instance-state-name,Values=running\" \\\n  --query \"Reservations[*].Instances[*].[InstanceId,InstanceType,PublicIpAddress]\" \\\n  --output table"
  },
  {
    id: 505,
    title: "Explain the difference between an IAM User, Group, and Role",
    category: "aws",
    difficulty: "easy",
    answer: "• IAM User: An identity representing a single person or service that interacts with AWS. It has long-term credentials (password, access keys).\n• IAM Group: A collection of users. You assign permissions to a group so all members inherit them, simplifying user management.\n• IAM Role: An identity with temporary credentials. It is assumed by services (e.g. EC2) or users from other accounts, avoiding the need to hardcode credentials in applications.",
    command: "# Create a new IAM Group\naws iam create-group --group-name DBA-Admins\n\n# Attach a policy to the group\naws iam attach-group-policy \\\n  --group-name DBA-Admins \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess"
  },
  {
    id: 506,
    title: "What is Amazon Route 53 and what are A vs CNAME records?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon Route 53 is a highly available and scalable Domain Name System (DNS) service.\n• A Record (Address): Maps a domain name directly to an IPv4 address (e.g., app.com -> 54.2.14.8).\n• CNAME Record (Canonical Name): Maps a domain name to another domain name (e.g., www.app.com -> app-load-balancer-1234.us-east-1.elb.amazonaws.com). Route 53 also supports Alias records, which act like CNAMEs but route directly to AWS resources (like ELBs or S3 buckets) without incurring extra DNS query charges.",
    command: "# List hosted zones in your Route 53 account\naws route53 list-hosted-zones\n\n# List resource record sets in a specific hosted zone\naws route53 list-resource-record-sets --hosted-zone-id Z0482937108"
  },
  {
    id: 507,
    title: "How to enable billing alerts and alarms in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "To prevent unexpected cloud bills, enable billing alerts in the Billing Console. This publishes metrics to CloudWatch in the us-east-1 region. You can then create a CloudWatch alarm to send email notifications via Simple Notification Service (SNS) when costs exceed a defined threshold.",
    command: "# Create a CloudWatch alarm to trigger when monthly charges exceed $100\naws cloudwatch put-metric-alarm \\\n  --alarm-name \"Monthly-Budget-Alarm\" \\\n  --metric-name EstimatedCharges \\\n  --namespace AWS/Billing \\\n  --statistic Maximum \\\n  --period 21600 \\\n  --evaluation-periods 1 \\\n  --threshold 100 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=Currency,Value=USD \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:billing-alerts-topic"
  },
  {
    id: 508,
    title: "Explain the difference between a public subnet and private subnet",
    category: "aws",
    difficulty: "easy",
    answer: "Both subnets exist inside a Virtual Private Cloud (VPC) but differ in routing configuration:\n• Public Subnet: Its route table contains an entry pointing to an Internet Gateway (IGW), allowing resources inside the subnet to communicate directly with the internet.\n• Private Subnet: Its route table does not contain a path to an IGW. To download updates, resources in a private subnet route traffic through a Network Address Translation (NAT) Gateway placed in a public subnet.",
    command: "# Describe subnets in your VPC\naws ec2 describe-subnets --filters \"Name=vpc-id,Values=vpc-08ac3024c125\""
  },
  {
    id: 509,
    title: "How to stop, start, and reboot EC2 instances using the AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "You can manage the lifecycle of your virtual instances using the AWS CLI. Stopping an instance stops billing for compute resources, but EBS volumes continue to incur storage fees. Rebooting performs an operating system restart without changing the underlying physical host.",
    command: "# Stop a running EC2 instance\naws ec2 stop-instances --instance-ids i-085fac801\n\n# Start a stopped EC2 instance\naws ec2 start-instances --instance-ids i-085fac801\n\n# Reboot an instance online\naws ec2 reboot-instances --instance-ids i-085fac801"
  },
  {
    id: 510,
    title: "What is Amazon CloudWatch and what are basic vs detailed monitoring?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon CloudWatch is a monitoring and management service that collects performance data and log files from AWS resources.\n• Basic Monitoring: Enabled by default for EC2 instances. It collects metrics (CPU, disk, network) at 5-minute intervals at no additional charge.\n• Detailed Monitoring: Collects metrics at 1-minute intervals for an additional charge, allowing you to react quickly to scaling events.",
    command: "# Enable detailed monitoring on an EC2 instance\naws ec2 monitor-instances --instance-ids i-085fac801\n\n# Disable detailed monitoring (revert to basic)\naws ec2 unmonitor-instances --instance-ids i-085fac801"
  },
  {
    id: 511,
    title: "How to create an IAM role for EC2 to access S3 buckets?",
    category: "aws",
    difficulty: "easy",
    answer: "Hardcoding AWS access keys inside code running on EC2 is a major security risk. Instead, create an IAM Role with permissions to access the S3 bucket, and attach it to the EC2 instance as an Instance Profile. The AWS SDK retrieves temporary credentials automatically.",
    command: "# Create the IAM role with trust policy (trusts EC2 service)\naws iam create-role --role-name EC2-S3-ReadOnly-Role --assume-role-policy-document file://trust_policy.json\n\n# Attach ReadOnly S3 access policy\naws iam attach-role-policy --role-name EC2-S3-ReadOnly-Role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess\n\n# Create instance profile and associate with EC2\naws iam create-instance-profile --instance-profile-name EC2-S3-Profile\naws iam add-role-to-instance-profile --instance-profile-name EC2-S3-Profile --role-name EC2-S3-ReadOnly-Role"
  },
  {
    id: 512,
    title: "What is the AWS KMS (Key Management Service) and customer managed vs AWS managed keys?",
    category: "aws",
    difficulty: "easy",
    answer: "AWS Key Management Service (KMS) manages cryptographic keys used to encrypt data at rest across AWS services (EBS, RDS, S3).\n• AWS Managed Keys: Created and managed automatically by AWS on your behalf. They are free, but their key policies cannot be modified, and they cannot be shared across AWS accounts.\n• Customer Managed Keys (CMKs): Created by you. You have full control over their key policies, rotation schedules, and cross-account access. They cost $1/key/month.",
    command: "# List KMS keys in your AWS account\naws kms list-keys\n\n# Create a new Customer Managed Key\naws kms create-key --description \"My Database Backup Key\""
  },
  {
    id: 513,
    title: "How to configure VPC Peering between two separate Virtual Private Clouds?",
    category: "aws",
    difficulty: "medium",
    answer: "VPC Peering connects two VPCs, allowing resources in either network to communicate using private IP addresses. It does not support transitive routing (e.g. if A is peered to B, and B to C, A cannot access C without a direct peer).\n\nSetup Steps:\n1. Send a Peering Connection Request from the requester VPC to the accepter VPC.\n2. Accept the Peering Request in the accepter VPC.\n3. Add routes in the route tables of both VPCs pointing to the peering connection ID (pcx-xxxx) for the destination CIDR block.",
    command: "# Create VPC Peering connection request\naws ec2 create-vpc-peering-connection \\\n  --vpc-id vpc-01111111111111111 (Requester) \\\n  --peer-vpc-id vpc-02222222222222222 (Accepter)\n\n# Accept the peering connection request\naws ec2 accept-vpc-peering-connection \\\n  --vpc-peering-connection-id pcx-0123456789abcdef0"
  },
  {
    id: 514,
    title: "Writing a secure IAM Policy in JSON restricting S3 bucket access",
    category: "aws",
    difficulty: "medium",
    answer: "IAM policies define permissions. Always write policies adhering to the Principle of Least Privilege. Specify exactly which actions are allowed on which resources, and use condition keys (like source IP addresses) to restrict access.",
    command: "# Put a bucket policy to restrict access to a specific IP address\naws s3api put-bucket-policy --bucket secure-data-bucket --policy file://policy.json\n\n# Contents of policy.json:\n# {\n#   \"Version\": \"2012-10-17\",\n#   \"Statement\": [\n#     {\n#       \"Effect\": \"Deny\",\n#       \"Principal\": \"*\",\n#       \"Action\": \"s3:*\",\n#       \"Resource\": [\n#         \"arn:aws:s3:::secure-data-bucket\",\n#         \"arn:aws:s3:::secure-data-bucket/*\"\n#       ],\n#       \"Condition\": {\n#         \"NotIpAddress\": {\"aws:SourceIp\": \"192.168.1.0/24\"}\n#       }\n#     }\n#   ]\n# }"
  },
  {
    id: 515,
    title: "Configuring EC2 Auto Scaling Groups and scaling policies",
    category: "aws",
    difficulty: "medium",
    answer: "Auto Scaling Groups (ASG) dynamically scale the number of EC2 instances up or down based on resource demands.\n\nKey parameters:\n• Launch Template: Defines the AMI, instance type, security groups, and key pairs to use when launching new instances.\n• Min, Max, and Desired Capacity: Restricts the scale limits.\n• Target Tracking Scaling Policy: Adjusts instances dynamically to keep a metric (like average CPU utilization) at a target percentage (e.g. keep CPU at 60%).",
    command: "# Create a scaling policy using CPU target tracking\naws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name my-web-asg \\\n  --policy-name cpu-60-tracking-policy \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration file://scaling_config.json\n\n# Contents of scaling_config.json:\n# {\n#   \"TargetValue\": 60.0,\n#   \"PredefinedMetricSpecification\": {\n#     \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"\n#   }\n# }"
  },
  {
    id: 516,
    title: "AWS CloudFront CDN: Origin Access Control (OAC) vs Origin Access Identity (OAI)",
    category: "aws",
    difficulty: "medium",
    answer: "To secure a static website hosted in S3, bypass direct public S3 URLs and force users to access the site through CloudFront. This allows you to enforce SSL, geoblocking, and caching benefits.\n\nOrigin Access Identity (OAI) vs Origin Access Control (OAC):\n• OAI: Legacy method. It restricts S3 bucket access to a specific CloudFront identity, but it does not support SSE-KMS encryption or modern S3 upload techniques.\n• OAC: Modern, recommended method. It supports KMS encryption, POST requests, and offers improved security settings.",
    command: "# Describe CloudFront distribution details\naws cloudfront list-distributions"
  },
  {
    id: 517,
    title: "Managing secrets securely using AWS Systems Manager (SSM) Parameter Store",
    category: "aws",
    difficulty: "medium",
    answer: "Avoid committing database credentials or API keys directly to git repositories. Store them securely in AWS Systems Manager (SSM) Parameter Store as SecureString parameters, encrypted using AWS KMS. Applications can retrieve them dynamically using the AWS SDK.",
    command: "# Store database password securely in Parameter Store\naws ssm put-parameter \\\n  --name \"/prod/database/password\" \\\n  --value \"SuperSecretPassword123\" \\\n  --type \"SecureString\" \\\n  --key-id \"alias/aws/ssm\" \\\n  --overwrite\n\n# Retrieve decrypted password\naws ssm get-parameter \\\n  --name \"/prod/database/password\" \\\n  --with-decryption \\\n  --query \"Parameter.Value\" \\\n  --output text"
  },
  {
    id: 518,
    title: "How to configure S3 Bucket CORS (Cross-Origin Resource Sharing)?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Origin Resource Sharing (CORS) defines rules allowing web applications running in one domain to access assets (like images or JSON files) hosted in a different domain (an S3 bucket). By default, browsers block these cross-origin requests for security reasons.",
    command: "# Apply CORS configuration to a bucket\naws s3api put-bucket-cors \\\n  --bucket my-assets-bucket \\\n  --cors-configuration file://cors.json\n\n# Contents of cors.json:\n# {\n#   \"CORSRules\": [\n#     {\n#       \"AllowedHeaders\": [\"*\"],\n#       \"AllowedMethods\": [\"GET\", \"HEAD\"],\n#       \"AllowedOrigins\": [\"https://my-app.com\"],\n#       \"MaxAgeSeconds\": 3000\n#     }\n#   ]\n# }"
  },
  {
    id: 519,
    title: "What is an Application Load Balancer (ALB) and path-based routing?",
    category: "aws",
    difficulty: "medium",
    answer: "An Application Load Balancer (ALB) operates at Layer 7 (Application Layer) of the OSI model. It routes incoming traffic to Target Groups (instances or containers) based on request attributes, such as HTTP headers, methods, or URL paths (e.g. route /api to API servers, and /static to asset servers).",
    command: "# Describe load balancers in your account\naws elb describe-load-balancers\n\n# List target groups configured for the load balancer\naws elds describe-target-groups"
  },
  {
    id: 520,
    title: "How to configure custom CloudWatch Alarms for EC2 Disk Space usage?",
    category: "aws",
    difficulty: "medium",
    answer: "By default, AWS cannot see the internal state of your EC2 instances (such as memory usage or disk partition space) due to virtualization boundaries. To monitor these, install the CloudWatch Agent inside the EC2 operating system. The agent pushes metrics to CloudWatch, allowing you to create custom disk alarms.",
    command: "# Put a metric alarm on a custom metric reported by the agent\naws cloudwatch put-metric-alarm \\\n  --alarm-name \"High-Disk-Usage-Alarm\" \\\n  --metric-name disk_used_percent \\\n  --namespace CWAgent \\\n  --statistic Average \\\n  --period 300 \\\n  --evaluation-periods 2 \\\n  --threshold 85 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=InstanceId,Value=i-0482ac8c21 Name=path,Value=/ \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:admin-alerts"
  },
  {
    id: 521,
    title: "Difference between NAT Gateway and NAT Instance in AWS",
    category: "aws",
    difficulty: "medium",
    answer: "Both allow instances in private subnets to connect to the internet while blocking incoming connections:\n• NAT Instance: A virtual machine configured to perform NAT. It is managed by you. It does not scale automatically and represents a single point of failure unless configured in an HA pair.\n• NAT Gateway: A managed AWS service. It scales automatically, provides high availability within an AZ, and supports bandwidth up to 45 Gbps. It requires no maintenance but incurs higher hourly and data processing fees.",
    command: "# Describe active NAT gateways in your VPC\naws ec2 describe-nat-gateways"
  },
  {
    id: 522,
    title: "DynamoDB read/write capacity modes: On-Demand vs Provisioned Capacity",
    category: "aws",
    difficulty: "medium",
    answer: "DynamoDB charges based on read/write throughput and storage:\n• Provisioned Capacity Mode: You specify the exact Read Capacity Units (RCU) and Write Capacity Units (WCU) your application requires. You can configure auto-scaling. It is cost-effective for predictable workloads.\n• On-Demand Mode: DynamoDB scales throughput automatically to handle traffic spikes. You pay exactly for the requests you make (no capacity planning needed). It is best for unpredictable or low-traffic workloads.",
    command: "# Create a DynamoDB table with Provisioned Capacity (5 RCU, 5 WCU)\naws dynamodb create-table \\\n  --table-name Users \\\n  --attribute-definitions AttributeName=UserId,AttributeType=S \\\n  --key-schema AttributeName=UserId,KeyType=HASH \\\n  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5"
  },
  {
    id: 523,
    title: "How to configure cross-region replication (CRR) in Amazon S3?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Region Replication (CRR) replicates S3 objects automatically from a source bucket in one region to a destination bucket in a different region. This is useful for disaster recovery or compliance requirements.\n\nPrerequisites:\n• Both source and destination buckets must have Versioning enabled.\n• An IAM Role must be configured to grant S3 permissions to replicate objects across regions.",
    command: "# Enable versioning on source bucket\naws s3api put-bucket-versioning \\\n  --bucket source-bucket \\\n  --versioning-configuration Status=Enabled\n\n# Enable versioning on destination bucket\naws s3api put-bucket-versioning \\\n  --bucket destination-bucket \\\n  --versioning-configuration Status=Enabled"
  },
  {
    id: 524,
    title: "What is Amazon RDS database backup and retention policy management?",
    category: "aws",
    difficulty: "medium",
    answer: "Amazon RDS automates database backups. By default, it takes a daily full snapshot and archives database transaction logs (transaction logs are updated every 5 minutes), allowing Point-In-Time Recovery (PITR) to any second within the retention period (default 7 days, max 35 days). Disabling backups (setting retention to 0) deletes all automated snapshots.",
    command: "# Modify RDS instance to increase backup retention period to 14 days\naws rds modify-db-instance \\\n  --db-instance-identifier prod-db-instance \\\n  --backup-retention-period 14 \\\n  --apply-immediately"
  },
  {
    id: 525,
    title: "How do you create a new ExpressRoute resource?",
    category: "azure",
    difficulty: "easy",
    answer: "[ExpressRoute - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 526,
    title: "What is the primary use case for Azure Data Lake Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Data Lake Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 527,
    title: "How can you monitor the basic metrics of ExpressRoute?",
    category: "azure",
    difficulty: "easy",
    answer: "[ExpressRoute - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding ExpressRoute.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 528,
    title: "Explain the pricing model for Azure Kubernetes Service (AKS).",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Kubernetes Service (AKS) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Kubernetes Service (AKS).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 529,
    title: "How do you configure basic access for Disk Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Disk Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Disk Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 530,
    title: "What are the limitations of Azure Files in the free tier?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Files - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Files.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 531,
    title: "How do you connect to a running Virtual Network (VNet) instance?",
    category: "azure",
    difficulty: "easy",
    answer: "[Virtual Network (VNet) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Network (VNet).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 532,
    title: "What is the difference between Cosmos DB and standard alternatives?",
    category: "azure",
    difficulty: "easy",
    answer: "[Cosmos DB - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cosmos DB.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 533,
    title: "How do you set up billing alerts for Azure Active Directory (AAD)?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Active Directory (AAD) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Active Directory (AAD).",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 534,
    title: "What are the required parameters to initialize Azure Data Lake Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Data Lake Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Data Lake Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 535,
    title: "How do you create a new Azure Load Balancer resource?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Load Balancer - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 536,
    title: "What is the primary use case for Blob Storage?",
    category: "azure",
    difficulty: "easy",
    answer: "[Blob Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Blob Storage.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 537,
    title: "How can you monitor the basic metrics of Key Vault?",
    category: "azure",
    difficulty: "easy",
    answer: "[Key Vault - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 538,
    title: "Explain the pricing model for Azure Load Balancer.",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Load Balancer - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 539,
    title: "How do you configure basic access for Azure Security Center?",
    category: "azure",
    difficulty: "easy",
    answer: "[Azure Security Center - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Security Center.",
    command: "# Example Azure CLI command\naz resource create --name MyResource --resource-group MyResourceGroup"
  },
  {
    id: 540,
    title: "How do you implement high availability for Azure Load Balancer across multiple zones?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Load Balancer - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Load Balancer.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 541,
    title: "Explain how to configure auto-scaling for Azure SQL Database based on CPU usage.",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure SQL Database - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure SQL Database.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 542,
    title: "What is the best way to migrate on-premises data to Azure Active Directory (AAD) with minimal downtime?",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Active Directory (AAD) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Active Directory (AAD).",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 543,
    title: "How do you securely manage secrets and credentials when using Cosmos DB?",
    category: "azure",
    difficulty: "medium",
    answer: "[Cosmos DB - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cosmos DB.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 544,
    title: "Describe the process of setting up a CI/CD pipeline targeting Azure Kubernetes Service (AKS).",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Kubernetes Service (AKS) - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Kubernetes Service (AKS).",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 545,
    title: "How can you optimize the cost of running Key Vault in production?",
    category: "azure",
    difficulty: "medium",
    answer: "[Key Vault - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 546,
    title: "Explain how to troubleshoot network connectivity issues with Azure Database for PostgreSQL.",
    category: "azure",
    difficulty: "medium",
    answer: "[Azure Database for PostgreSQL - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Azure Database for PostgreSQL.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 547,
    title: "How do you implement cross-region replication for Key Vault?",
    category: "azure",
    difficulty: "medium",
    answer: "[Key Vault - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Key Vault.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 548,
    title: "What are the best practices for logging and auditing Blob Storage?",
    category: "azure",
    difficulty: "medium",
    answer: "[Blob Storage - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Blob Storage.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 549,
    title: "How do you handle stateful workloads effectively in Virtual Machine Scale Sets?",
    category: "azure",
    difficulty: "medium",
    answer: "[Virtual Machine Scale Sets - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Virtual Machine Scale Sets.",
    command: "# Configure scaling and networking\naz monitor autoscale create --resource-group MyResourceGroup --resource MyResource\naz network vnet subnet update --vnet-name MyVNet --name MySubnet"
  },
  {
    id: 550,
    title: "What is CI/CD and what is its purpose?",
    category: "devops",
    difficulty: "easy",
    answer: "CI/CD stands for Continuous Integration and Continuous Delivery (or Deployment):\n• Continuous Integration (CI): Developers merge code changes into a central repository frequently. Each merge triggers automated builds and tests to identify bugs early.\n• Continuous Delivery/Deployment (CD): Automated release pipeline that deploys code to staging (Delivery) or directly to production (Deployment) once tests pass.\n\nPurpose: To speed up release cycles, minimize human errors, and ensure code is always in a deployable state.",
    command: "# Simple workflow representation:\n# Git Commit -> Trigger Webhook -> Run Tests -> Build Artifact -> Scan Vulnerabilities -> Deploy to Server"
  },
  {
    id: 551,
    title: "Explain Virtualization vs Containerization",
    category: "devops",
    difficulty: "easy",
    answer: "• Virtualization (VMs): Runs a full Guest OS on top of physical hardware using a Hypervisor (e.g. VMware, VirtualBox). Each VM has virtualized memory, CPU, and disk. They are heavy, slow to boot (minutes), and consume substantial resource overhead.\n• Containerization (Docker): Shares the host OS kernel and runs processes in isolated namespaces. Containers do not require a guest OS. They are extremely lightweight, boot in seconds, and share host resources efficiently.",
    command: "# View running processes inside a container (shares host kernel but isolated)\ndocker run -d --name test-container alpine sleep 3600\ndocker top test-container"
  },
  {
    id: 552,
    title: "What is Git and explain clone vs fork vs pull?",
    category: "devops",
    difficulty: "easy",
    answer: "Git is a distributed version control system to track file modifications.\n• Clone: Creates a local copy of a remote Git repository on your machine, linking your local repo back to the remote origin.\n• Fork: Creates a copy of a repository under *your* GitHub/GitLab account. You can make modifications without affecting the original project, then submit a Pull Request.\n• Pull: Fetches modifications from a remote repository and merges them into your active local branch.",
    command: "# Clone a repository\ngit clone https://github.com/app/allpreps.git\n\n# Fetch and merge latest changes from active remote branch\ngit pull origin main"
  },
  {
    id: 553,
    title: "What is Infrastructure as Code (IaC) and what are its benefits?",
    category: "devops",
    difficulty: "easy",
    answer: "Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure (VPCs, servers, databases, DNS) using machine-readable configuration files (like Terraform, CloudFormation, Ansible) instead of manual console actions.\n\nBenefits:\n• Consistency: Eliminates configuration drift.\n• Version Control: Infrastructure definitions can be committed to Git, reviewed, and rolled back.\n• Automation: Spawns complex infrastructures in minutes.",
    command: "# Example of declarative Terraform resource definition\n# resource \"aws_instance\" \"app_server\" {\n#   ami           = \"ami-085fac801\"\n#   instance_type = \"t3.micro\"\n# }"
  },
  {
    id: 554,
    title: "Explain the difference between YAML and JSON syntax rules",
    category: "devops",
    difficulty: "easy",
    answer: "YAML and JSON are serialization languages commonly used for config files (YAML for Kubernetes/Ansible/pipelines, JSON for APIs/Terraform states):\n• YAML: Uses indentation (spaces, never tabs) for structure. It is highly human-readable, supports comments (#), and has no brackets or braces.\n• JSON: Uses curly braces {} for objects, square brackets [] for arrays, and colons for key-value maps. Keys must be double-quoted. It does not support comments and is less human-readable.",
    command: "# YAML representation:\ndatabase:\n  host: dbhost\n  port: 5432\n\n# JSON equivalent:\n# {\n#   \"database\": {\n#     \"host\": \"dbhost\",\n#     \"port\": 5432\n#   }\n# }"
  },
  {
    id: 555,
    title: "What is a Dockerfile and explain its basic commands?",
    category: "devops",
    difficulty: "easy",
    answer: "A Dockerfile is a text document containing instructions to build a Docker image:\n• FROM: Sets the base image (e.g. ubuntu, alpine, node).\n• RUN: Runs a command during the image build phase (installs packages).\n• COPY: Copies local files from host machine to the image filesystem.\n• CMD: Specifies the default command to execute when the container starts.",
    command: "# Create a simple Dockerfile\ncat << 'EOF' > Dockerfile\nFROM alpine:3.18\nRUN apk add --no-cache curl\nCOPY app.sh /app.sh\nCMD [\"sh\", \"/app.sh\"]\nEOF"
  },
  {
    id: 556,
    title: "How do you list, stop, and remove Docker containers from the CLI?",
    category: "devops",
    difficulty: "easy",
    answer: "Docker provides CLI commands to manage container lifecycles:\n• docker ps: Lists running containers.\n• docker ps -a: Lists *all* containers (running and stopped).\n• docker stop [ID/Name]: Gracefully terminates a running container (SIGTERM).\n• docker rm [ID/Name]: Deletes a stopped container.\n• docker kill [ID/Name]: Forcefully kills a container (SIGKILL).",
    command: "# List active containers\ndocker ps\n\n# Stop a container named 'my-web-app'\ndocker stop my-web-app\n\n# Delete the stopped container\ndocker rm my-web-app\n\n# Delete all stopped containers at once\ndocker container prune -f"
  },
  {
    id: 557,
    title: "What is Kubernetes (K8s) and what is a Pod?",
    category: "devops",
    difficulty: "easy",
    answer: "Kubernetes is an open-source container orchestration platform designed to automate deploying, scaling, and managing containerized applications.\n\n• Pod: The smallest deployable unit in Kubernetes. A Pod hosts one or more containers (usually just one) that share network interfaces, storage volumes, and IP addresses. Containers within a Pod communicate using localhost.",
    command: "# List active pods in default namespace\nkubectl get pods\n\n# Describe details of a specific pod\nkubectl describe pod my-app-pod"
  },
  {
    id: 558,
    title: "What is a Jenkinsfile and explain declarative vs scripted pipeline syntax?",
    category: "devops",
    difficulty: "easy",
    answer: "A Jenkinsfile is a text file that contains the definition of a Jenkins Pipeline and is committed to source control.\n• Declarative Pipeline: Uses a structured, pre-defined format (stages, step, agent) which is easier to write and read. It has built-in syntax validation.\n• Scripted Pipeline: Uses Groovy script code. It is highly flexible but complex to write and maintain.",
    command: "# Minimal Declarative Pipeline structure:\n# pipeline {\n#   agent any\n#   stages {\n#     stage('Test') {\n#       steps { sh 'npm test' }\n#     }\n#   }\n# }"
  },
  {
    id: 559,
    title: "What is Prometheus and Grafana in DevOps monitoring?",
    category: "devops",
    difficulty: "easy",
    answer: "Prometheus and Grafana are open-source tools used for system observability:\n• Prometheus: A time-series database and monitoring tool. It pulls (scrapes) numeric metrics from targets at regular intervals, evaluates rule expressions, and triggers alerts.\n• Grafana: A visualization platform. It connects to Prometheus (and other databases) to build rich, interactive dashboards displaying graphs, CPU/Memory charts, and server statuses.",
    command: "# Check active Prometheus config file\n# cat /etc/prometheus/prometheus.yml"
  },
  {
    id: 560,
    title: "Explain Git branching strategy: Gitflow vs Trunk-Based Development",
    category: "devops",
    difficulty: "easy",
    answer: "• Gitflow: Multi-branch strategy. Developers work on 'feature' branches, merge to 'develop', release via 'release' branches, and merge to 'main' for production. It is highly controlled but slow and creates merge debt.\n• Trunk-Based Development: Modern CI/CD practice. Developers merge small, frequent commits into a single central branch ('trunk' or 'main') daily. Feature flags are used to hide incomplete features. It accelerates CI/CD pipelines.",
    command: "# Trunk-based simple flow:\n# git checkout main\n# git pull\n# git checkout -b feat/add-login\n# (write code) -> commit -> merge directly to main"
  },
  {
    id: 561,
    title: "Explain the difference between Docker CMD and ENTRYPOINT instructions",
    category: "devops",
    difficulty: "easy",
    answer: "Both define the execution command of a container, but interact differently when arguments are passed at runtime:\n• ENTRYPOINT: Configures the container to run as an executable. It cannot be overridden by standard docker run arguments (unless using --entrypoint).\n• CMD: Defines default arguments or commands. It can be easily overridden by appending commands to `docker run`.\nIf combined, CMD acts as default parameters appended to the ENTRYPOINT command.",
    command: "# In Dockerfile:\n# ENTRYPOINT [\"ping\"]\n# CMD [\"8.8.8.8\"]\n\n# Running container without args pings 8.8.8.8:\n# docker run my-ping-image\n\n# Running with args overrides CMD, pinging 1.1.1.1 instead:\n# docker run my-ping-image 1.1.1.1"
  },
  {
    id: 562,
    title: "What is Ansible and what is a Playbook?",
    category: "devops",
    difficulty: "easy",
    answer: "Ansible is an open-source, agentless configuration management tool. It connects to remote hosts over SSH (or WinRM) to install software, modify configurations, and manage user accounts.\n\n• Playbook: A YAML file containing one or more 'plays'. Each play defines the target host group and a sequential list of 'tasks' (e.g. install Nginx, copy config, start service) using built-in Ansible modules.",
    command: "# Execute an Ansible Playbook\nansible-playbook -i inventory.ini deploy_web.yml"
  },
  {
    id: 563,
    title: "Explain Microservices architecture vs Monolithic",
    category: "devops",
    difficulty: "easy",
    answer: "• Monolithic Architecture: The entire application (UI, business logic, database access) is built, packaged, and deployed as a single unit. It is simple to develop but hard to scale, scale limits block progress, and a single bug can crash the entire system.\n• Microservices Architecture: The application is split into small, independent services (e.g. payment service, user service) communicating via lightweight protocols (REST, gRPC, message queues). Each service has its own database, can be written in different languages, and scales independently.",
    command: "# Microservices layout:\n# UI Gateway -> Auth Service (DB1) & Payment Service (DB2) & Email Queue"
  },
  {
    id: 564,
    title: "Explain Kubernetes Services: ClusterIP vs NodePort vs LoadBalancer",
    category: "devops",
    difficulty: "medium",
    answer: "Kubernetes Pods are ephemeral (they die and get recreated with new IP addresses). Services provide a stable network endpoint to route traffic to active Pods:\n• ClusterIP (Default): Exposes the service on a private internal cluster IP. It is accessible only from inside the Kubernetes cluster.\n• NodePort: Exposes the service on a static port (30000-32767) on each Node's IP. External traffic can access the service by calling Node_IP:NodePort.\n• LoadBalancer: Integrates with cloud providers (AWS, GCP) to automatically provision a public-facing cloud load balancer routing directly to NodePorts.",
    command: "# Expose a deployment named 'my-web' via NodePort\nkubectl expose deployment my-web --type=NodePort --port=80 --target-port=8080\n\n# Get service status and exposed ports\nkubectl get svc"
  },
  {
    id: 565,
    title: "How do you optimize Docker image sizes using multi-stage builds?",
    category: "devops",
    difficulty: "medium",
    answer: "Standard Docker builds package compilers, test tools, and source code into the final image, bloating sizes (e.g. Node SDK is 1GB+). Multi-stage builds use multiple FROM instructions in a single Dockerfile. You compile code in a heavy 'build' stage, and then copy *only* the compiled binary/dist folder into a lightweight 'runtime' stage (e.g., alpine or distroless), stripping out compilers and source code.",
    command: "# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80"
  },
  {
    id: 566,
    title: "What is Docker Volume and difference between bind mount vs named volume?",
    category: "devops",
    difficulty: "medium",
    answer: "By default, files created inside a container are ephemeral and get deleted when the container exits. Volumes persist container data outside the container filesystem:\n• Bind Mount: Maps a specific, absolute path on the host system to a path inside the container. Best for local development (syncing code changes instantly).\n• Named Volume: Managed entirely by Docker. Docker stores the data in a dedicated folder (/var/lib/docker/volumes/) on the host. Best for production databases and backups since it prevents host OS directory conflicts.",
    command: "# Run container with a bind mount\ndocker run -d -v /home/user/project:/app node:18\n\n# Run container with a named volume (created if missing)\ndocker run -d -v db_data:/var/lib/postgresql/data postgres:15-alpine"
  },
  {
    id: 567,
    title: "How to manage Kubernetes configurations using ConfigMaps and Secrets?",
    category: "devops",
    difficulty: "medium",
    answer: "Decoupling config parameters from container images ensures portability across Dev, Staging, and Prod environments:\n• ConfigMap: Stores non-sensitive, plain-text key-value configurations (database hostnames, ports, environment flags).\n• Secret: Stores sensitive configurations (passwords, tokens, API keys) encoded in Base64. Secrets are stored in temp memory (tmpfs) on nodes, protecting them from disk exposure.\nBoth can be loaded as environment variables or mounted as files inside pods.",
    command: "# Create a ConfigMap from a literal value\nkubectl create configmap app-config --from-literal=DB_HOST=pgdb.local\n\n# Create a Secret\nkubectl create secret generic db-credentials --from-literal=password=SuperSecret\n\n# View secret (returns Base64 encoded value)\nkubectl get secret db-credentials -o yaml"
  },
  {
    id: 568,
    title: "Explain Blue-Green deployment vs Canary deployment strategies",
    category: "devops",
    difficulty: "medium",
    answer: "• Blue-Green Deployment: You maintain two identical environments. Blue is active (production), Green is standby. You deploy the new release to Green, run integration tests, and then swap router DNS/load balancer targets to point to Green. It provides instant rollback but is expensive as it requires doubling resource footprints.\n• Canary Deployment: You deploy the new release to a small subset of instances (e.g. 5% of traffic). You monitor error rates, CPU usage, and user behavior. If stable, you roll it out to 100% of servers. It minimizes blast radius of bugs.",
    command: "# Routing swap representation:\n# Router -> Blue (v1.0)\n# (Deploy v2.0 to Green) -> (Tests Pass) -> Swap Router to Green (v2.0)"
  },
  {
    id: 569,
    title: "What is Git merge vs rebase, and when should you use which?",
    category: "devops",
    difficulty: "medium",
    answer: "Both integrate commits from one branch into another:\n• Merge: Creates a new 'merge commit' combining the histories of both branches. It preserves the exact chronological history of work but can clutter the git tree with merge commits.\n• Rebase: Rewrites commits from the feature branch on top of the target branch's latest commit. It creates a clean, linear commit history, but it alters commit hashes. Rule of thumb: Never rebase public shared branches; only rebase local private branches to clean up work before merging.",
    command: "# Rebase feature branch on top of main\ngit checkout feature-login\ngit rebase main\n\n# If conflicts, resolve and run:\ngit rebase --continue"
  },
  {
    id: 570,
    title: "How do you handle secrets securely in Jenkins/GitHub Actions pipelines?",
    category: "devops",
    difficulty: "medium",
    answer: "Hardcoding passwords or SSH keys in pipeline scripts or committing them to git is a critical vulnerability. Instead:\n• GitHub Actions: Save secrets in Repository Settings under 'Secrets and variables'. Reference them in YAML as `${{ secrets.SECRET_NAME }}`. GitHub masks these values in console outputs automatically.\n• Jenkins: Save secrets in the Credentials Manager. Bind credentials to environment variables using the `withCredentials` block in Jenkinsfiles.",
    command: "# In GitHub Actions pipeline YAML:\n# steps:\n#   - name: Deploy to Docker Hub\n#     env:\n#       DOCKER_PASSWORD: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}\n#     run: echo \"$DOCKER_PASSWORD\" | docker login -u user --password-stdin"
  },
  {
    id: 571,
    title: "What is Terraform state file and why is remote state locking important?",
    category: "devops",
    difficulty: "medium",
    answer: "Terraform saves the configuration mappings and metadata of the resources it manages to a local file called `terraform.tfstate`.\n\nRemote State and Locking:\n• Committing state to git exposes sensitive parameters (passwords are stored in plain text in the state file).\n• In a team, if two developers run `terraform apply` concurrently, it can lead to state corruption or duplicate resources.\n• Fix: Store the state file in a remote backend (e.g. S3) and configure remote locking using a database (e.g. DynamoDB) to lock access during runs.",
    command: "# Terraform backend configuration block:\n# terraform {\n#   backend \"s3\" {\n#     bucket         = \"prod-terraform-state-bucket\"\n#     key            = \"vpc/terraform.tfstate\"\n#     dynamodb_table = \"terraform-locks\"\n#   }\n# }"
  },
  {
    id: 572,
    title: "What is Ansible Inventory and dynamic inventories?",
    category: "devops",
    difficulty: "medium",
    answer: "• Ansible Inventory: A file (INI or YAML format) listing the hostnames, IP addresses, and group structures of target servers that Ansible connects to.\n• Dynamic Inventory: In cloud environments (AWS, GCP), instances scale up and down, changing IP addresses constantly, making static files obsolete. A dynamic inventory is an Ansible plugin/script that queries cloud API endpoints to automatically resolve and group hosts based on tags (e.g. environment:production).",
    command: "# Static Inventory (inventory.ini):\n# [web_servers]\n# 192.168.1.15 ansible_user=deploy\n# 192.168.1.16 ansible_user=deploy\n\n# Using AWS dynamic inventory plugin (aws_ec2):\n# ansible-playbook -i aws_ec2.yml deploy_web.yml"
  },
  {
    id: 573,
    title: "Explain Kubernetes ReplicaSet vs Deployment vs StatefulSet",
    category: "devops",
    difficulty: "medium",
    answer: "• ReplicaSet: Ensures a specified number of identical Pod replicas are running at all times. It replaces pods if they crash.\n• Deployment: Wraps around ReplicaSets. It provides declarative updates for Pods (rolling updates, rollbacks) and handles updates automatically.\n• StatefulSet: Used for stateful applications (databases like Postgres or Cassandra). Unlike deployments where pods have random names (app-58da-21), StatefulSet Pods have static, ordinal names (db-0, db-1). They maintain persistent volume mappings and scale in a strict sequential order.",
    command: "# Scale a deployment to 5 replicas\nkubectl scale deployment my-web-app --replicas=5\n\n# View StatefulSet pods (ordered ordinal IDs)\nkubectl get pods -l app=database"
  },
  {
    id: 574,
    title: "How to implement log aggregation using the ELK Stack?",
    category: "devops",
    difficulty: "medium",
    answer: "Log files scattered across hundreds of servers are difficult to search. The ELK Stack provides centralized log aggregation:\n• Filebeat/Logstash: Agents collect logs from servers and parse them.\n• Elasticsearch: A search engine that indexes and stores logs.\n• Kibana: A web interface to search logs using query expressions.",
    command: "# Search logs dynamically in elasticsearch via REST API\ncurl -X GET \"localhost:9200/nginx-logs/_search?q=status:500&pretty\""
  },
  {
    id: 575,
    title: "How do you create a new Google Kubernetes Engine (GKE) resource?",
    category: "google",
    difficulty: "easy",
    answer: "[Google Kubernetes Engine (GKE) - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Google Kubernetes Engine (GKE).",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 576,
    title: "What is the primary use case for Persistent Disk?",
    category: "google",
    difficulty: "easy",
    answer: "[Persistent Disk - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Persistent Disk.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 577,
    title: "How can you monitor the basic metrics of App Engine?",
    category: "google",
    difficulty: "easy",
    answer: "[App Engine - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding App Engine.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 578,
    title: "Explain the pricing model for Cloud Run.",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Run - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Run.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 579,
    title: "How do you configure basic access for Cloud Storage?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Storage - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Storage.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 580,
    title: "What are the limitations of Persistent Disk in the free tier?",
    category: "google",
    difficulty: "easy",
    answer: "[Persistent Disk - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Persistent Disk.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 581,
    title: "How do you connect to a running Filestore instance?",
    category: "google",
    difficulty: "easy",
    answer: "[Filestore - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 582,
    title: "What is the difference between Security Command Center and standard alternatives?",
    category: "google",
    difficulty: "easy",
    answer: "[Security Command Center - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Security Command Center.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 583,
    title: "How do you set up billing alerts for VPC Network?",
    category: "google",
    difficulty: "easy",
    answer: "[VPC Network - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Network.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 584,
    title: "What are the required parameters to initialize Cloud Spanner?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Spanner - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Spanner.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 585,
    title: "How do you create a new Cloud Run resource?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Run - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Run.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 586,
    title: "What is the primary use case for Bigtable?",
    category: "google",
    difficulty: "easy",
    answer: "[Bigtable - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Bigtable.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 587,
    title: "How can you monitor the basic metrics of Cloud Functions?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Functions - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Functions.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 588,
    title: "Explain the pricing model for Cloud DNS.",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud DNS - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud DNS.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 589,
    title: "How do you configure basic access for Cloud Spanner?",
    category: "google",
    difficulty: "easy",
    answer: "[Cloud Spanner - EASY]\n\nTo use this resource effectively, you typically start by navigating to the console or using the CLI. Ensure that your IAM permissions are correctly configured. Basic monitoring can be done via the default metrics dashboard. It is designed to be fully managed, allowing you to focus on application logic rather than infrastructure maintenance.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud Spanner.",
    command: "# Example gcloud command\ngcloud compute instances create my-instance --zone=us-central1-a"
  },
  {
    id: 590,
    title: "How do you implement high availability for Cloud SQL across multiple zones?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud SQL - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud SQL.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 591,
    title: "Explain how to configure auto-scaling for VPC Service Controls based on CPU usage.",
    category: "google",
    difficulty: "medium",
    answer: "[VPC Service Controls - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Service Controls.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 592,
    title: "What is the best way to migrate on-premises data to Bigtable with minimal downtime?",
    category: "google",
    difficulty: "medium",
    answer: "[Bigtable - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Bigtable.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 593,
    title: "How do you securely manage secrets and credentials when using Filestore?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 594,
    title: "Describe the process of setting up a CI/CD pipeline targeting Cloud DNS.",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud DNS - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud DNS.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 595,
    title: "How can you optimize the cost of running Filestore in production?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 596,
    title: "Explain how to troubleshoot network connectivity issues with VPC Network.",
    category: "google",
    difficulty: "medium",
    answer: "[VPC Network - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding VPC Network.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 597,
    title: "How do you implement cross-region replication for Cloud IAM?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud IAM - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud IAM.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 598,
    title: "What are the best practices for logging and auditing Filestore?",
    category: "google",
    difficulty: "medium",
    answer: "[Filestore - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Filestore.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 599,
    title: "How do you handle stateful workloads effectively in Cloud IAM?",
    category: "google",
    difficulty: "medium",
    answer: "[Cloud IAM - MEDIUM]\n\nFor intermediate usage, you must consider automated scaling and robust networking. Implementing Health Checks and configuring Load Balancing is critical. Use infrastructure as code (like Terraform) to deploy these resources predictably. Ensure that proper subnetting and firewall rules are established to prevent unauthorized access while allowing necessary internal traffic.\n\nAlways ensure you consult the official documentation for the latest best practices regarding Cloud IAM.",
    command: "# Configure scaling and networking\ngcloud compute instance-groups managed set-autoscaling my-group --max-num-replicas=10\ngcloud compute firewall-rules create allow-internal"
  },
  {
    id: 600,
    title: "How to check Linux OS distribution name and kernel version?",
    category: "linux",
    difficulty: "easy",
    answer: "You can find the Linux operating system distribution and kernel release version using built-in system files or terminal tools:\n• /etc/os-release: Standard file containing OS identification data.\n• uname -r: Returns the running kernel release version.\n• hostnamectl: Displays OS, kernel, and system architecture details.",
    command: "# View operating system details\ncat /etc/os-release\n\n# Print kernel release version\nuname -r\n\n# Display system information overview\nhostnamectl"
  },
  {
    id: 601,
    title: "How do you find files larger than 100MB in a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "The 'find' command searches the directory hierarchy for files matching specific size criteria. Using options like '-type f' limits the search to regular files, and '-size' filters by size. Running it with 'ls' or 'du' formats the output to show exact sizes.",
    command: "# Find and list files larger than 100MB in /var/log\nfind /var/log -type f -size +100M -exec ls -lh {} \\;\n\n# Search current directory recursively for files > 100MB\nfind . -type f -size +100M"
  },
  {
    id: 602,
    title: "Explain the difference between soft links and hard links in Linux",
    category: "linux",
    difficulty: "easy",
    answer: "• Soft Link (Symlink): A symbolic path pointing to another filename. If the original file is deleted, the symlink becomes broken ('dangling'). It can span across different filesystems.\n• Hard Link: An additional directory entry pointing directly to the file's underlying inode. If the original filename is deleted, the file content remains accessible via the hard link. It cannot span across different filesystems or point to directories.",
    command: "# Create a soft link (symlink)\nln -s /etc/nginx/nginx.conf ~/my_nginx.conf\n\n# Create a hard link\nln /var/log/messages ~/messages_backup\n\n# View inodes to verify (hard links share the same inode number)\nls -li"
  },
  {
    id: 603,
    title: "How do you check which process is listening on port 80 or 443?",
    category: "linux",
    difficulty: "easy",
    answer: "To troubleshoot connection errors or find port conflicts, use utilities like 'ss', 'netstat', or 'lsof'. You typically need superuser privileges to see the process name and PID.",
    command: "# Using ss (socket statistics) - Recommended\nsudo ss -tulpn | grep -E ':80|:443'\n\n# Using lsof (list open files)\nsudo lsof -i :80\n\n# Using netstat\nsudo netstat -tulpn | grep -E ':80|:443'"
  },
  {
    id: 604,
    title: "How to change file permissions and ownership in Linux?",
    category: "linux",
    difficulty: "easy",
    answer: "• chmod: Modifies file permissions using symbolic representation (e.g. u+x) or octal notation (e.g. 755).\n• chown: Modifies file owner and group ownership.\nUse the '-R' option with either command to apply the changes recursively to all subdirectories.",
    command: "# Set owner read/write/execute, group/others read/execute (755)\nchmod 755 /var/www/html/index.html\n\n# Make a script executable\nchmod +x deploy.sh\n\n# Change owner to 'oracle' and group to 'oinstall' recursively\nsudo chown -R oracle:oinstall /u01/app/oracle"
  },
  {
    id: 605,
    title: "How to view and search compressed log files without extracting them?",
    category: "linux",
    difficulty: "easy",
    answer: "Linux systems rotate logs and compress them using gzip (.gz format). You can search or view these logs directly without manually decompressing them using 'z-commands':\n• zcat: Concat and view files.\n• zless / zmore: Paginate through text.\n• zgrep: Search for patterns.",
    command: "# Search for ORA- errors inside compressed log archives\nzgrep \"ORA-\" /var/log/oracle/alert_log.*.gz\n\n# Page through a compressed log file\nzless /var/log/nginx/access.log.2.gz"
  },
  {
    id: 606,
    title: "How to check system uptime and load average?",
    category: "linux",
    difficulty: "easy",
    answer: "Load average represents the average system load over a period of time (1, 5, and 15 minutes). It counts the number of processes in runnable or uninterruptible sleep states.\n• uptime: Shows uptime, active sessions, and load averages.\n• w: Shows who is logged in and what they are doing.",
    command: "# Check uptime and load averages\nuptime\n\n# View active user sessions and load averages\nw"
  },
  {
    id: 607,
    title: "How do you kill a process by its name instead of PID?",
    category: "linux",
    difficulty: "easy",
    answer: "While 'kill' requires a process ID (PID), you can terminate processes by name using:\n• killall: Kills all processes matching the exact name.\n• pkill: Kills processes matching a pattern.\n• pgrep: Lists PIDs matching a process name.",
    command: "# Find PIDs of all running Nginx instances\npgrep nginx\n\n# Terminate all processes named 'httpd' gracefully (SIGTERM)\npkill httpd\n\n# Forcefully kill all processes named 'node' (SIGKILL)\nkillall -9 node"
  },
  {
    id: 608,
    title: "How do you search for a pattern in all files within a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "Use 'grep' with recursive flags. Useful options include:\n• -r or -R: Recursive search.\n• -n: Show line numbers.\n• -i: Case-insensitive search.\n• -w: Match whole words only.",
    command: "# Search for 'localhost' in all files under /etc\ngrep -rn \"localhost\" /etc/\n\n# Case-insensitive search for 'error' in /var/log\ngrep -ri \"error\" /var/log/"
  },
  {
    id: 609,
    title: "How do you monitor log updates live in color using tail?",
    category: "linux",
    difficulty: "easy",
    answer: "You can follow file updates live with 'tail -f'. To highlight specific words like 'ERROR' or 'WARNING' in color, pipe the output to grep or use utilities like 'grc' or 'multitail'.",
    command: "# Follow log files live\ntail -f /var/log/nginx/error.log\n\n# Color highlight 'ERROR' using grep\ntail -f /var/log/syslog | grep --color=auto -iE 'error|warning|critical'"
  },
  {
    id: 610,
    title: "How to check available disk space on all mounted filesystems?",
    category: "linux",
    difficulty: "easy",
    answer: "Use the 'df' command. The '-h' flag prints the capacity in human-readable units (e.g. GB, MB), and '-T' displays the filesystem type (ext4, xfs, nfs).",
    command: "# Display disk space in human-readable format\ndf -h\n\n# Display disk space with filesystem types\ndf -hT"
  },
  {
    id: 611,
    title: "How to manage system services using systemctl?",
    category: "linux",
    difficulty: "easy",
    answer: "Modern Linux distributions use systemd to manage services. The 'systemctl' tool controls the status, startup, and shutdown behavior of system units.",
    command: "# Check status of SSH service\nsystemctl status sshd\n\n# Start, stop, or restart a service\nsudo systemctl start nginx\nsudo systemctl stop nginx\nsudo systemctl restart nginx\n\n# Enable service to start automatically on system boot\nsudo systemctl enable docker"
  },
  {
    id: 612,
    title: "How do you diagnose and resolve inode exhaustion?",
    category: "linux",
    difficulty: "medium",
    answer: "An inode represents a metadata record for a file. If a filesystem runs out of inodes, you cannot create new files, even if there is plenty of raw disk space available. This commonly occurs when an application creates millions of tiny session files or mail queues.\n\nResolution steps:\n1. Check inode consumption using `df -i`.\n2. Find the directories containing the highest number of files.\n3. Delete the unnecessary small files using `find -delete` or `xargs` (since running `rm *` will fail with 'Argument list too long').",
    command: "# Check inode availability per filesystem\ndf -i\n\n# Find directories with high file counts\nfind / -xdev -type d -exec sh -c 'echo \"$(find \"$1\" -type f | wc -l) $1\"' _ {} \\; | sort -rn | head -10\n\n# Delete millions of tiny files safely without memory overflow\nfind /var/spool/postfix/maildrop -type f -delete"
  },
  {
    id: 613,
    title: "How to add and enable swap space dynamically on a running system?",
    category: "linux",
    difficulty: "medium",
    answer: "If physical RAM is fully utilized, the system may invoke the Out-Of-Memory (OOM) killer to terminate database or application processes. You can dynamically create swap space using a swap file without resizing partitions.\n\nSteps:\n1. Allocate a blank file of the desired size using `dd` or `fallocate`.\n2. Set correct root-only permissions (600).\n3. Format the file as swap space using `mkswap`.\n4. Enable it using `swapon`.\n5. Append it to `/etc/fstab` for persistence.",
    command: "# Create a 4GB swap file\nsudo fallocate -l 4G /swapfile\n\n# Set correct permissions\nsudo chmod 600 /swapfile\n\n# Format the file as swap\nsudo mkswap /swapfile\n\n# Enable the swap file\nsudo swapon /swapfile\n\n# Verify active swap spaces\nswapon --show\n\n# Persist in fstab\necho '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
  },
  {
    id: 614,
    title: "How to configure visudo to grant passwordless permissions to a specific user?",
    category: "linux",
    difficulty: "medium",
    answer: "Directly editing `/etc/sudoers` can lock you out of system administration if a syntax error is introduced. Always use the `visudo` command, which validates configuration syntax before saving.\n\nConfiguration format:\n`username host=(runas_user:runas_group) [NOPASSWD:] commands`",
    command: "# Open sudoers file in safe edit mode\nsudo visudo\n\n# Add this line to allow user 'dba' to run systemctl restart database passwordless:\n# dba ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart oracle-xe\n\n# Add this line to allow user 'deploy' to run all commands without password:\n# deploy ALL=(ALL) NOPASSWD: ALL"
  },
  {
    id: 615,
    title: "Explain Linux systemd custom unit file creation and management",
    category: "linux",
    difficulty: "medium",
    answer: "A systemd unit file (.service) configures how systemd manages a daemon. It is typically created in `/etc/systemd/system/`.\n\nKey sections:\n• [Unit]: Description and boot dependency orders (After=network.target).\n• [Service]: Command to execute (ExecStart), restart policy (Restart=always), and run user/group constraints.\n• [Install]: Activation targets (WantedBy=multi-user.target).",
    command: "# Create custom service file\nsudo cat << 'EOF' > /etc/systemd/system/myapp.service\n[Unit]\nDescription=My NodeJS App Service\nAfter=network.target\n\n[Service]\nUser=node\nWorkingDirectory=/var/www/myapp\nExecStart=/usr/bin/node server.js\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\n# Reload systemd configuration\nsudo systemctl daemon-reload\n\n# Start and enable the service\nsudo systemctl start myapp\nsudo systemctl enable myapp"
  },
  {
    id: 616,
    title: "How to diagnose slow disk performance and write bottlenecks?",
    category: "linux",
    difficulty: "medium",
    answer: "Disk I/O latency can degrade database throughput. Diagnose storage bottlenecks using:\n• iostat: Checks CPU statistics and I/O statistics for devices. Pay attention to '%util' (disk utilization) and 'await' (average I/O response time in milliseconds).\n• iotop: Shows real-time disk I/O usage per process, identifying which process is writing heavily.",
    command: "# Run iostat every 2 seconds, displaying detailed disk extended statistics\niostat -x 2 5\n\n# View processes actively performing read/write operations\nsudo iotop -o"
  },
  {
    id: 617,
    title: "Configuring logrotate to manage growing application logs",
    category: "linux",
    difficulty: "medium",
    answer: "Logrotate automatically rotates, compresses, and purges log files to prevent partition exhaustion. It is controlled by config scripts under `/etc/logrotate.d/`.\n\nCommon options:\n• daily/weekly/monthly: Rotation frequency.\n• rotate count: How many archived files to keep.\n• compress: Compress logs using gzip.\n• missingok: Skip without error if the log file is missing.\n• delaycompress: Postpone compression until the next rotation cycle.",
    command: "# Create custom logrotate configuration for an app\nsudo cat << 'EOF' > /etc/logrotate.d/myapp\n/var/log/myapp/*.log {\n    daily\n    rotate 7\n    compress\n    delaycompress\n    missingok\n    notifempty\n    create 0660 app_user app_group\n    sharedscripts\n    postrotate\n        /usr/bin/systemctl reload myapp > /dev/null 2>&1\n    endscript\n}\nEOF\n\n# Force test run logrotate execution manually\nsudo logrotate -f /etc/logrotate.d/myapp"
  },
  {
    id: 618,
    title: "How to resolve 'Too many open files' errors on Linux?",
    category: "linux",
    difficulty: "medium",
    answer: "The kernel limits the number of file descriptors a process can open (typically 1024 for non-root users). Under high concurrent load, web servers or databases will crash with a 'Too many open files' error.\n\nResolution steps:\n1. Check current limits using `ulimit -n`.\n2. Monitor open file descriptors using `lsof`.\n3. Modify system-wide and user limits in `/etc/security/limits.conf`.",
    command: "# Check active shell open file descriptor limits\nulimit -n\n\n# Count open files for a specific PID\nlsof -p 2481 | wc -l\n\n# Add limits permanently in /etc/security/limits.conf:\n# oracle   soft   nofile   65536\n# oracle   hard   nofile   65536"
  },
  {
    id: 619,
    title: "How do you run commands in the background that survive terminal disconnection?",
    category: "linux",
    difficulty: "medium",
    answer: "Standard shell processes terminate if the SSH connection drops. To run tasks that persist:\n• screen / tmux: Virtual terminal multiplexers that run sessions independently of SSH status.\n• nohup: Executes a command, ignoring hangup signals (SIGHUP), redirecting output to nohup.out.\n• bg/fg/jobs: Built-in shell job control.",
    command: "# Run a background backup job that persists after exit\nnohup /u01/app/oracle/scripts/backup.sh > /tmp/backup.log 2>&1 &\n\n# Start a tmux session\ntmux new -s db_restore\n\n# Detach from tmux: press Ctrl+B, then D\n# Re-attach to tmux later:\ntmux attach -t db_restore"
  },
  {
    id: 620,
    title: "How to configure system clock sync using chrony?",
    category: "linux",
    difficulty: "medium",
    answer: "Database replication, Active Directory, and log analysis require precise clock synchronization across nodes. Chrony is the modern NTP implementation used to sync system time with reliable internet time servers.\n\nManagement steps:\n• Configure NTP pool servers in `/etc/chrony.conf`.\n• Manage chronyd daemon.\n• Validate sync status using `chronyc`.",
    command: "# Check chrony clock synchronization details\nchronyc tracking\n\n# List configured NTP servers and check their connectivity status\nchronyc sources -v\n\n# Force step the system clock immediately if time offset is large\nsudo chronyc -a makestep"
  },
  {
    id: 621,
    title: "How to secure network connections in Linux using firewalld?",
    category: "linux",
    difficulty: "medium",
    answer: "Firewalld is a firewall management tool that dynamically manages network ports. It uses Zones (e.g. public, internal) to classify network traffic.\n\nSteps:\n1. Add a port or service rule.\n2. Reload configuration to apply.\n3. Verify open configurations.",
    command: "# Add Oracle listener port (1521) permanently to public zone\nsudo firewall-cmd --zone=public --add-port=1521/tcp --permanent\n\n# Reload firewall rules\nsudo firewall-cmd --reload\n\n# List active firewall rules in default zone\nsudo firewall-cmd --list-all"
  },
  {
    id: 622,
    title: "Using rsync to synchronize directories across servers securely",
    category: "linux",
    difficulty: "medium",
    answer: "Rsync is a fast, file-copying tool that syncs directories over SSH. It uses an delta-transfer algorithm, copying only the differences between source and destination files to reduce network bandwidth.\n\nKey flags:\n• -a: Archive mode (preserves permissions, ownership, timestamps, and symlinks).\n• -v: Verbose output.\n• -z: Compress data during transfer.\n• --delete: Deletes files in destination that no longer exist in source.",
    command: "# Sync local backup directory to a backup server over SSH\nrsync -avz --delete /u01/backups/ backup_user@bkpserver:/storage/backups/\n\n# Perform a dry run to see changes without copying\nrsync -avz --dry-run /u01/backups/ backup_user@bkpserver:/storage/backups/"
  },
  {
    id: 623,
    title: "How to examine kernel rings and system event buffers using dmesg?",
    category: "linux",
    difficulty: "medium",
    answer: "The 'dmesg' command prints the kernel message buffer. It is a critical diagnostic tool for identifying hardware errors, driver issues, memory errors (OOM kills), or block layer issues.",
    command: "# Search kernel logs for Out-Of-Memory events\ndmesg -T | grep -i oom\n\n# Search for disk I/O or SCSI connection errors\ndmesg -T | grep -iE 'sd|scsi|block|error'\n\n# View live kernel logs\ndmesg -w"
  },
  {
    id: 624,
    title: "How do you audit directory disk space usage using du and ncdu?",
    category: "linux",
    difficulty: "medium",
    answer: "When a partition fills up, you must identify what files are consuming space. Use 'du' with sort filters, or the interactive command-line analyzer 'ncdu'.",
    command: "# Find top 10 largest folders under /var/log\nsudo du -ah /var/log/ | sort -rh | head -n 10\n\n# Run interactive disk usage analyzer (if installed)\nncdu /var"
  },
  {
    id: 625,
    title: "How to read command-line arguments in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash scripts can accept command-line arguments. These are automatically assigned to positional parameters:\n• $1, $2, $3...: First, second, third arguments.\n• $0: The name of the script itself.\n• $#: The number of arguments passed.\n• $@: All positional parameters as separate words (preferred over $*).\n• $*: All positional parameters as a single word.",
    command: "# Create a script to print arguments\ncat << 'EOF' > arg_test.sh\n#!/bin/bash\necho \"Script Name: $0\"\necho \"Total Arguments: $#\"\necho \"First Arg: $1\"\necho \"Second Arg: $2\"\necho \"All Args (List): $@\"\nEOF\n\nchmod +x arg_test.sh\n./arg_test.sh param1 param2"
  },
  {
    id: 626,
    title: "How to check if a file or directory exists using if conditions?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can perform file testing checks inside conditional brackets [ ] or [[ ]]:\n• -f file: True if the file exists and is a regular file.\n• -d dir: True if the directory exists.\n• -e path: True if the path exists (regardless of type).\n• -r path: True if readable.\n• -w path: True if writable.",
    command: "# Check if /etc/hosts exists and is a file\nif [ -f \"/etc/hosts\" ]; then\n  echo \"/etc/hosts exists.\"\nfi\n\n# Check if backup directory exists, create if missing\nBACKUP_DIR=\"/tmp/backup\"\nif [ ! -d \"$BACKUP_DIR\" ]; then\n  mkdir -p \"$BACKUP_DIR\"\nfi"
  },
  {
    id: 627,
    title: "Explain exit status codes ($?) and how to use them for error handling?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Every Linux command returns an exit status code (0 to 255) upon completion:\n• 0: Success.\n• Non-Zero (1-255): Failure or specific error state.\n\nYou can query this status code using the special variable '$?' immediately after running a command, or evaluate it in conditionals.",
    command: "# Ping a server and check if it is online\nping -c 1 -W 2 google.com > /dev/null 2>&1\nSTATUS=$?\n\nif [ $STATUS -eq 0 ]; then\n  echo \"Internet connection active.\"\nelse\n  echo \"Network ping failed with exit code $STATUS.\"\nfi"
  },
  {
    id: 628,
    title: "How to loop through all files in a directory using a for loop?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can iterate over files in a directory using globbing patterns (e.g., *) in a for loop. Avoid using the output of `ls` in loops, as filenames containing spaces can break parsing.",
    command: "# Loop through all .log files in /var/log/nginx/\nfor file in /var/log/nginx/*.log; do\n  # Check if file exists to handle empty directories safely\n  [ -e \"$file\" ] || continue\n  echo \"Processing log file: $(basename \"$file\")\"\ndone"
  },
  {
    id: 629,
    title: "How to perform basic arithmetic operations in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash only supports integer arithmetic. You can perform arithmetic calculations using:\n• $(( expression )): The modern double-parentheses syntax (preferred).\n• let statement: Performs variable assignment.\n• expr command: Legacy syntax (slower, requires spaces).",
    command: "# Calculate sum using double-parentheses\nnum1=15\nnum2=20\nsum=$((num1 + num2))\necho \"Sum: $sum\"\n\n# Increment a variable\ncount=1\n((count++))\necho \"Incremented Count: $count\"\n\n# Multiplication\nproduct=$((num1 * num2))\necho \"Product: $product\""
  },
  {
    id: 630,
    title: "How to redirect messages to standard error (stderr) instead of stdout?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "By default, 'echo' writes to standard output (file descriptor 1). To write error messages to standard error (file descriptor 2) so they can be separated during logging, redirect the output of echo using '>&2'.",
    command: "# Print standard output message\necho \"This is standard output.\"\n\n# Print error message to stderr\necho \"ERROR: Database connection failed!\" >&2\n\n# Running script while routing errors to a log file:\n# ./my_script.sh 2> errors.log"
  },
  {
    id: 631,
    title: "How to read user input interactively in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Use the built-in `read` command to pause execution and capture input from the user.\nUseful options:\n• -p \"Prompt\": Displays a prompt text without a newline.\n• -s: Silent mode (does not echo input characters, useful for passwords).\n• -t seconds: Timeout limit.",
    command: "# Ask for username\nread -p \"Enter Database Username: \" db_user\n\n# Ask for password silently\nread -s -p \"Enter Database Password: \" db_pass\necho \"\" # Print newline after password mask\n\necho \"Connecting to DB as user $db_user...\""
  },
  {
    id: 632,
    title: "Explain the difference between single quotes, double quotes, and backticks in Bash",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Single Quotes ('...'): Strong quoting. Treats every character literally. No variable expansion or command substitution occurs.\n• Double Quotes (\"...\"): Weak quoting. Resolves variables ($var) and command substitutions ($(command)), but treats spaces literally.\n• Backticks (`...`): Legacy command substitution. Runs the command inside and returns its output (use $(command) instead for nested queries).",
    command: "NAME=\"Oracle\"\n\n# Single quotes (Literal text output)\necho 'Database name is $NAME' # Output: Database name is $NAME\n\n# Double quotes (Variable expanded)\necho \"Database name is $NAME\" # Output: Database name is Oracle\n\n# Command substitution\nCURRENT_DIR=$(pwd)\necho \"Current path is: $CURRENT_DIR\""
  },
  {
    id: 633,
    title: "How to redirect stdout and stderr to a log file?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Redirection manages where standard streams go:\n• > log.txt: Redirects stdout to a file (overwriting).\n• >> log.txt: Appends stdout to a file.\n• 2> err.txt: Redirects stderr to a file.\n• &> log.txt: Redirects BOTH stdout and stderr to a file (modern).\n• > log.txt 2>&1: Legacy redirect of both streams (redirects stdout to file, then stderr to stdout).",
    command: "# Run backup script and redirect all outputs (overwrite)\n/opt/db_backup.sh &> /var/log/db_backup.log\n\n# Run cleanup script and append logs, sending errors to a separate file\n/opt/cleanup.sh >> /var/log/cleanup.log 2>> /var/log/cleanup_errors.log"
  },
  {
    id: 634,
    title: "How to concatenate strings and get the length of a string in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Concatenation: Simply place variables next to each other, optionally wrapping them in braces ${var} to avoid character ambiguity.\n• String Length: Use the syntax ${#varname} to return the character count of a string variable.",
    command: "prefix=\"db_backup_\"\ndate_suffix=\"2026-05-21\"\n\n# Concatenate strings\nfile_name=\"${prefix}${date_suffix}.dmp\"\necho \"Target File: $file_name\"\n\n# Get string length\nlength=${#file_name}\necho \"Filename Length: $length characters\""
  },
  {
    id: 635,
    title: "How to check if a string contains a substring in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can check for substrings inside double brackets [[ ]] using wildcard globbing patterns (e.g. *pattern*), or by using the case statement.",
    command: "DB_URL=\"jdbc:postgresql://dbhost:5432/production\"\n\n# Check substring using double brackets and glob matching\nif [[ \"$DB_URL\" == *\"postgresql\"* ]]; then\n  echo \"Database type identified as PostgreSQL.\"\nfi\n\n# Alternate search using case\ncase \"$DB_URL\" in\n  *oracle*) echo \"Oracle database detected\" ;;\n  *postgresql*) echo \"Postgres database detected\" ;;\n  *) echo \"Unknown database\" ;;\nesac"
  },
  {
    id: 636,
    title: "How to use command substitution ( $(command) ) in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Command substitution runs a specified command in a subshell and assigns its standard output to a variable or passes it inline. The modern syntax is `$(command)`, replacing the legacy backticks ``command`` syntax because it supports easy nesting.",
    command: "# Assign command output to a variable\nCURRENT_USER=$(whoami)\nSERVER_IP=$(hostname -I | awk '{print $1}')\n\necho \"Running audit on host $SERVER_IP as user $CURRENT_USER.\"\n\n# Nested command substitution\nARCHIVE_SIZE=$(du -sh \"$(find /var/log -type f -name '*.gz' | head -n 1)\" | awk '{print $1}')\necho \"Size of first log archive: $ARCHIVE_SIZE\""
  },
  {
    id: 637,
    title: "How to define and call basic functions in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Functions modularize code. Define them using `function_name() { ... }` or `function function_name { ... }`.\n\nKey rules:\n• Functions must be defined *before* they are called.\n• Pass arguments like standard scripts ($1, $2).\n• Localize variables inside functions using the 'local' keyword to prevent global scope contamination.",
    command: "# Define a function to log messages with timestamps\nlog_message() {\n  local log_level=$1\n  local message=$2\n  echo \"$(date '+%Y-%m-%d %H:%M:%S') [$log_level] $message\"\n}\n\n# Call the function with arguments\nlog_message \"INFO\" \"Starting database validation process.\"\nlog_message \"WARNING\" \"Free space on /u01 is low.\""
  },
  {
    id: 638,
    title: "How to read a file line by line in Bash using a while loop?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To read a text file line-by-line safely, combine a `while read -r` loop with input redirection. The `-r` option prevents backslash character escapes from being interpreted. Clearing the Internal Field Separator (IFS=) prevents leading/trailing whitespace trimming.",
    command: "# Read database server IP list from a config file\nCONFIG_FILE=\"/tmp/servers.txt\"\necho -e \"10.0.1.5\\n10.0.1.6\\n10.0.1.7\" > \"$CONFIG_FILE\"\n\nwhile IFS= read -r line; do\n  # Skip empty lines or commented lines\n  [[ -z \"$line\" || \"$line\" =~ ^# ]] && continue\n  echo \"Checking node connection to: $line\"\n  ssh -o ConnectTimeout=2 \"admin@$line\" \"uptime\" < /dev/null\ndone < \"$CONFIG_FILE\""
  },
  {
    id: 639,
    title: "Handling options and flags in shell scripts using getopts",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The built-in `getopts` utility parses command-line flags and options in a loop. It supports single-character flags (e.g. -f, -v). A colon after a flag letter indicates that the option requires an argument (stored in $OPTARG).",
    command: "# Parse script configurations\nwhile getopts \"h:p:v\" opt; do\n  case \"$opt\" in\n    h) HOST=\"$OPTARG\" ;;\n    p) PORT=\"$OPTARG\" ;;\n    v) VERBOSE=true ;;\n    *) echo \"Invalid option\" ;;\n  esac\ndone\n\necho \"Configured host: $HOST, port: $PORT, verbose: ${VERBOSE:-false}\""
  },
  {
    id: 640,
    title: "How to debug a shell script using bash shell options?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To diagnose issues in complex scripts, enable bash debugging settings at the top of your script using 'set':\n• set -x: Prints every command before executing it (execution trace).\n• set -e: Terminates the script immediately if any command fails (non-zero status).\n• set -u: Terminates script if an unbound/undefined variable is evaluated.\n• set -o pipefail: Returns the exit status of the first failed command in a pipeline.",
    command: "#!/bin/bash\n# Enable strict debugging settings\nset -euo pipefail\nset -x\n\n# This failed command will stop the script immediately due to 'set -e'\nls /non_existent_folder\n\necho \"This line will never execute.\""
  },
  {
    id: 641,
    title: "Dynamic temporary file creation using mktemp and cleanup using trap",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Hardcoding temporary file paths (like /tmp/output.txt) can lead to file clashes or security risks. Use `mktemp` to create secure, unique temp files. To ensure these files are cleaned up if the script crashes or completes, bind a cleanup function using the `trap` command.",
    command: "# Create a secure temporary file\nTEMP_FILE=$(mktemp /tmp/db_audit.XXXXXX)\n\n# Define cleanup action\ncleanup() {\n  echo \"Cleaning up temp files...\"\n  rm -f \"$TEMP_FILE\"\n}\n\n# Trap signals (Exit, Interrupt, Terminate)\ntrap cleanup EXIT INT TERM\n\n# Execute operations using the secure temp file\necho \"Running query...\" > \"$TEMP_FILE\"\ncat \"$TEMP_FILE\""
  },
  {
    id: 642,
    title: "String manipulation and substring extraction in Bash without external tools",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash has powerful built-in parameter expansion patterns. This is far faster than invoking external tools like `sed`, `awk`, or `cut` in loops:\n• ${var#pattern}: Removes shortest match of pattern from start.\n• ${var##pattern}: Removes longest match of pattern from start.\n• ${var%pattern}: Removes shortest match of pattern from end.\n• ${var%%pattern}: Removes longest match of pattern from end.\n• ${var/pattern/replacement}: Replaces first match.\n• ${var//pattern/replacement}: Replaces all matches.",
    command: "FILE_PATH=\"/var/log/oracle/alert_DBA.log\"\n\n# Extract directory path (remove everything after last slash)\nDIR_PATH=\"${FILE_PATH%/*}\"\necho \"Dir: $DIR_PATH\" # /var/log/oracle\n\n# Extract filename (remove everything before last slash)\nFILE_NAME=\"${FILE_PATH##*/}\"\necho \"File: $FILE_NAME\" # alert_DBA.log\n\n# Extract file extension\nEXT=\"${FILE_NAME##*.}\"\necho \"Ext: $EXT\" # log"
  },
  {
    id: 643,
    title: "How to check if a command exists in the system path before executing it?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Before calling external tools (like `jq`, `git`, or `docker`), check if they are installed. Avoid parsing `which`, as it acts inconsistently across Linux distros. Instead, use the shell built-in commands `command -v`, `type`, or `hash`.",
    command: "# Check if jq is installed in the system path\nif ! command -v jq &> /dev/null; then\n  echo \"ERROR: 'jq' utility is not installed. Exiting.\" >&2\n  exit 1\nfi\n\n# Safe to proceed with jq commands\necho '{\"status\":\"ok\"}' | jq .status"
  },
  {
    id: 644,
    title: "Working with indexed arrays in Bash",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash supports 1-dimensional indexed arrays. You can declare and manipulate them using standard array syntax:\n• Declare: `declare -a my_array` or `my_array=(val1 val2 val3)`.\n• Access item: `${my_array[index]}`.\n• Access all items: `${my_array[@]}`.\n• Array size: `${#my_array[@]}`.\n• Append item: `my_array+=(\"new_val\")`.",
    command: "# Define array of target databases\ndatabases=(\"prod_db\" \"uat_db\" \"test_db\")\n\n# Append a database\ndatabases+=(\"dev_db\")\n\n# Print array size\necho \"Total DBs to backup: ${#databases[@]}\"\n\n# Iterate through the array\nfor db in \"${databases[@]}\"; do\n  echo \"Running RMAN backup for $db...\"\ndone"
  },
  {
    id: 645,
    title: "How to perform floating point arithmetic in Bash using bc?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Since Bash only supports integers (e.g. 5/2 = 2), you must delegate floating-point operations to an external utility like `bc` (Basic Calculator) using piping. Use the 'scale' parameter in bc to define decimal precision.",
    command: "# Divide 5 by 2 with 2 decimal precision\nresult=$(echo \"scale=2; 5 / 2\" | bc)\necho \"Result: $result\" # 2.50\n\n# Perform complex float calculations dynamically\nused_mem=15420\ntotal_mem=16384\npct_mem=$(echo \"scale=4; ($used_mem / $total_mem) * 100\" | bc)\necho \"Memory consumption percentage: $pct_mem%\""
  },
  {
    id: 646,
    title: "Pattern matching and replacement in files using sed in-place",
    category: "shell scripting",
    difficulty: "medium",
    answer: "`sed` (Stream Editor) modifies text dynamically. Use the `-i` option to modify the target file directly (in-place) without redirects. In macOS, `sed -i ''` is required, while Linux accepts `sed -i`.",
    command: "# Create configuration file\necho \"port = 8080\" > /tmp/app.conf\necho \"db_host = localhost\" >> /tmp/app.conf\n\n# Replace 'localhost' with '10.0.1.25' in-place\nsed -i 's/localhost/10.0.1.25/g' /tmp/app.conf\n\n# Replace port 8080 with 443\nsed -i 's/port = 8080/port = 443/g' /tmp/app.conf\n\ncat /tmp/app.conf"
  },
  {
    id: 647,
    title: "Extracting columns and formatting report text using awk",
    category: "shell scripting",
    difficulty: "medium",
    answer: "`awk` is a text-processing utility designed for data extraction. By default, it splits lines into positional variables ($1, $2...) based on whitespace fields. Use the `-F` flag to change the field separator (e.g. colon for /etc/passwd).",
    command: "# Get usernames and home paths of system accounts (split by colon)\nawk -F: '$3 >= 1000 {print \"User: \" $1 \"\\tHome: \" $6}' /etc/passwd\n\n# Calculate the total memory size of all files listed by ls -l\nls -l | awk '{sum += $5} END {print \"Total Size: \" sum / 1024 / 1024 \" MB\"}'"
  },
  {
    id: 648,
    title: "How to set script timeout and kill hung processes in Bash?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To prevent automation scripts from hanging indefinitely on network calls or stuck database connections, wrap the process in a timeout threshold using the Linux `timeout` command, which sends SIGTERM or SIGKILL if the process exceeds the time limit.",
    command: "# Run backup script with 10 seconds timeout limit\ntimeout 10s rsync -avz /data/ backup_user@remotehost:/storage/\nSTATUS=$?\n\nif [ $STATUS -eq 124 ]; then\n  echo \"ERROR: Backup timed out after 10 seconds.\" >&2\nelse\n  echo \"Backup finished with status $STATUS.\"\nfi"
  },
  {
    id: 649,
    title: "Using the select statement to build interactive text-based menus",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The `select` statement is a bash built-in loop that creates dynamic text-based menus. It displays a list of options with numeric indices, prompts the user (using the PS3 string), and stores the user's choice in a variable.",
    command: "# Configure prompt message\nPS3=\"Select a DBA action: \"\n\nselect opt in \"Start Database\" \"Stop Database\" \"Check Status\" \"Exit\"; do\n  case \"$opt\" in\n    \"Start Database\") echo \"Initializing startup...\" ;;\n    \"Stop Database\") echo \"Shutting down...\" ;;\n    \"Check Status\") uptime ;;\n    \"Exit\") break ;;\n    *) echo \"Invalid option $REPLY\" ;;\n  esac\ndone"
  },
  {
    id: 650,
    title: "How to handle NULL values in SQL using COALESCE?",
    category: "sql",
    difficulty: "easy",
    answer: "NULL indicates a missing or unknown value in a database. Direct comparisons like '= NULL' will fail. The COALESCE function returns the first non-null expression from a list of arguments, making it perfect for setting default values.",
    command: "-- Return 'N/A' if the phone number is NULL\nSELECT employee_id, first_name, COALESCE(phone_number, 'N/A') AS contact_phone\nFROM employees;\n\n-- Retrieve first non-null contact info (mobile, then home, then work)\nSELECT first_name, COALESCE(mobile_phone, home_phone, work_phone, 'No Contact') AS primary_phone\nFROM customers;"
  },
  {
    id: 651,
    title: "Difference between LEFT JOIN, RIGHT JOIN, and INNER JOIN",
    category: "sql",
    difficulty: "easy",
    answer: "• INNER JOIN: Returns rows when there is a match in both tables.\n• LEFT JOIN (or LEFT OUTER JOIN): Returns all rows from the left table, and matched rows from the right table. If no match is found, NULL is returned for right-side columns.\n• RIGHT JOIN (or RIGHT OUTER JOIN): Returns all rows from the right table, and matched rows from the left table. (Generally avoided; prefer LEFT JOIN for consistency).",
    command: "-- INNER JOIN (Only returns employees with departments)\nSELECT e.first_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;\n\n-- LEFT JOIN (Returns all employees, even those without a department)\nSELECT e.first_name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;"
  },
  {
    id: 652,
    title: "How to use GROUP BY with HAVING to filter aggregated results?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters rows *before* aggregation takes place.\n• HAVING: Filters groups *after* aggregation (GROUP BY) takes place.\nYou cannot use aggregate functions (like COUNT, SUM) in a WHERE clause; you must use HAVING.",
    command: "-- Find departments with an average salary greater than $10,000\nSELECT department_id, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id\nHAVING AVG(salary) > 10000;"
  },
  {
    id: 653,
    title: "How to retrieve unique rows from a query using DISTINCT?",
    category: "sql",
    difficulty: "easy",
    answer: "The DISTINCT keyword is placed immediately after SELECT to filter out duplicate rows from the result set. It evaluates the combination of all selected columns to determine uniqueness.",
    command: "-- Get a list of all unique departments that have active employees\nSELECT DISTINCT department_id\nFROM employees\nWHERE status = 'ACTIVE';"
  },
  {
    id: 654,
    title: "How to perform wild card searches in SQL using LIKE?",
    category: "sql",
    difficulty: "easy",
    answer: "The LIKE operator filters rows matching string patterns. It uses wildcards:\n• %: Represents zero, one, or multiple characters.\n• _: Represents exactly one character.\nFor case-insensitive searches in some databases, use ILIKE or UPPER/LOWER.",
    command: "# Search for emails ending with '@gmail.com'\nSELECT first_name, email\nFROM users\nWHERE email LIKE '%@gmail.com';\n\n# Search for names where the second letter is 'a'\nSELECT first_name\nFROM users\nWHERE first_name LIKE '_a%';"
  },
  {
    id: 655,
    title: "What is a primary key vs foreign key?",
    category: "sql",
    difficulty: "easy",
    answer: "• Primary Key (PK): A column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL values and must be unique.\n• Foreign Key (FK): A column in one table that links to the Primary Key of another table. It enforces referential integrity, ensuring you cannot insert orphan records.",
    command: "-- Table definition with PK and FK\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);"
  },
  {
    id: 656,
    title: "How to update values in a table using UPDATE and WHERE?",
    category: "sql",
    difficulty: "easy",
    answer: "The UPDATE statement modifies existing records. Always include a WHERE clause; omitting the WHERE clause updates *all* rows in the table.",
    command: "-- Update a user's email address by user ID\nUPDATE users\nSET email = 'new_email@company.com'\nWHERE user_id = 104;\n\n-- Give all employees in department 10 a 5% raise\nUPDATE employees\nSET salary = salary * 1.05\nWHERE department_id = 10;"
  },
  {
    id: 657,
    title: "How to safely delete rows from a table using DELETE vs TRUNCATE?",
    category: "sql",
    difficulty: "easy",
    answer: "• DELETE: A DML operation that removes specific rows matching a WHERE clause. It logs each row deletion, supports rollback, and fires triggers. It is slower.\n• TRUNCATE: A DDL operation that removes all rows from a table by deallocating data pages. It is faster, uses minimal log space, cannot be rolled back in some databases, and does not fire triggers.",
    command: "-- Delete specific rows (can be rolled back)\nDELETE FROM activity_logs\nWHERE log_date < '2025-01-01';\n\n-- Truncate entire table (fast, deallocates pages)\nTRUNCATE TABLE temp_staging_data;"
  },
  {
    id: 658,
    title: "How do you count rows in a table using COUNT(*) vs COUNT(column)?",
    category: "sql",
    difficulty: "easy",
    answer: "• COUNT(*): Counts the total number of rows in the query result, including rows with NULL values.\n• COUNT(column): Counts only rows where the specified column contains a non-null value.",
    command: "-- Total rows (e.g. 100 rows)\nSELECT COUNT(*) FROM employees;\n\n-- Non-null phone numbers (e.g. 85 rows if 15 are NULL)\nSELECT COUNT(phone_number) FROM employees;"
  },
  {
    id: 659,
    title: "How to limit query results and implement pagination in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "To return a subset of rows (e.g., for paginated pages), use LIMIT and OFFSET (PostgreSQL, MySQL) or FETCH NEXT ROWS (Oracle, SQL Server).",
    command: "-- MySQL/PostgreSQL: Get the first 10 rows\nSELECT id, title FROM questions LIMIT 10;\n\n-- Get rows 11 to 20 (page 2)\nSELECT id, title FROM questions LIMIT 10 OFFSET 10;\n\n-- Oracle standard syntax:\n-- SELECT id, title FROM questions FETCH FIRST 10 ROWS ONLY;"
  },
  {
    id: 660,
    title: "How to use CASE WHEN statements for conditional logic in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "The CASE expression provides conditional logic (if-then-else) inline in SQL queries. It evaluates conditions and returns a value when a match is found.",
    command: "-- Label salaries as High, Medium, or Low\nSELECT first_name, salary,\n       CASE \n         WHEN salary >= 10000 THEN 'High'\n         WHEN salary >= 5000 THEN 'Medium'\n         ELSE 'Low'\n       END AS salary_bracket\nFROM employees;"
  },
  {
    id: 661,
    title: "What is the difference between WHERE and HAVING?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters records *before* any groupings are created. It cannot reference aggregate functions.\n• HAVING: Filters records *after* GROUP BY groupings are formed. It must reference aggregated values.",
    command: "-- Filtering rows before grouping (WHERE)\nSELECT job_id, COUNT(*) \nFROM employees \nWHERE salary > 5000 \nGROUP BY job_id;\n\n-- Filtering groups after aggregation (HAVING)\nSELECT job_id, COUNT(*)\nFROM employees\nGROUP BY job_id\nHAVING COUNT(*) > 5;"
  },
  {
    id: 662,
    title: "Explain SQL Window Functions: ROW_NUMBER, RANK, and DENSE_RANK",
    category: "sql",
    difficulty: "medium",
    answer: "Window functions perform calculations across a set of table rows related to the current row, without collapsing them into a single row (unlike GROUP BY).\n\nKey Differences:\n• ROW_NUMBER(): Assigns a unique sequential integer to each row. In case of ties, it assigns numbers arbitrarily.\n• RANK(): Assigns rank with gaps. If two rows tie for 1st, they both get 1, and the next row gets 3.\n• DENSE_RANK(): Assigns rank without gaps. If two rows tie for 1st, they both get 1, and the next row gets 2.",
    command: "-- Calculate rank of employee salaries within each department\nSELECT department_id, first_name, salary,\n       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,\n       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rnk\nFROM employees;"
  },
  {
    id: 663,
    title: "Using LEAD and LAG to calculate differences between consecutive rows",
    category: "sql",
    difficulty: "medium",
    answer: "LEAD and LAG are window functions that allow accessing data from other rows relative to the current row without using a self-join:\n• LAG(column, offset): Returns the column value from 'offset' rows prior.\n• LEAD(column, offset): Returns the column value from 'offset' rows ahead.\n\nThis is useful for calculating period-over-period growth or time-series changes.",
    command: "-- Compare monthly sales with the previous month's sales\nSELECT sales_month, total_revenue,\n       LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue,\n       total_revenue - LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS monthly_revenue_change\nFROM monthly_sales;"
  },
  {
    id: 664,
    title: "What is database normalization? Explain 1NF, 2NF, and 3NF",
    category: "sql",
    difficulty: "medium",
    answer: "Normalization organizes table structures to minimize data redundancy and prevent insertion, update, and deletion anomalies.\n\nNormalization stages:\n• 1st Normal Form (1NF): Column values must be atomic (no arrays/comma-separated lists) and rows must be unique.\n• 2nd Normal Form (2NF): Must be in 1NF, and all non-key columns must depend completely on the primary key (no partial dependencies on composite keys).\n• 3rd Normal Form (3NF): Must be in 2NF, and non-key columns must not depend on other non-key columns (no transitive dependencies).",
    command: "-- Example of converting 2NF to 3NF:\n-- Violates 3NF: (emp_id [PK] -> dept_id -> dept_name)\n-- Fix: Split into two tables:\nCREATE TABLE depts (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE emps (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT REFERENCES depts(dept_id)\n);"
  },
  {
    id: 665,
    title: "Explain CTEs (Common Table Expressions) and their benefits over nested subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "A Common Table Expression (CTE) is a temporary result set defined using a 'WITH' clause. It improves readability, modularizes complex query blocks, and can be referenced multiple times within a single query.",
    command: "-- Modular query using CTE\nWITH dept_costs AS (\n  SELECT department_id, SUM(salary) AS total_dept_salary\n  FROM employees\n  GROUP BY department_id\n),\ncompany_avg AS (\n  SELECT AVG(total_dept_salary) AS avg_dept_salary\n  FROM dept_costs\n)\nSELECT d.department_id, d.total_dept_salary\nFROM dept_costs d, company_avg c\nWHERE d.total_dept_salary > c.avg_dept_salary;"
  },
  {
    id: 666,
    title: "How do you identify and kill blocking queries in PostgreSQL?",
    category: "sql",
    difficulty: "medium",
    answer: "Locks prevent concurrent data updates from clashing. However, uncommitted transactions or heavy queries can hold locks indefinitely, blocking other operations.\n\nResolution:\n1. Query the 'pg_stat_activity' catalog view to identify blocking and blocked queries.\n2. Terminate the blocking backend process using pg_terminate_backend.",
    command: "-- Find queries waiting for locks and the blockers holding them\nSELECT blocked_locks.pid     AS blocked_pid,\n       blocked_activity.query  AS blocked_statement,\n       blocking_locks.pid    AS blocking_pid,\n       blocking_activity.query AS blocking_statement\nFROM  pg_catalog.pg_locks         blocked_locks\nJOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid\nJOIN pg_catalog.pg_locks         blocking_locks \n  ON blocking_locks.locktype = blocked_locks.locktype\n  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database\n  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation\n  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page\n  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple\n  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid\n  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid\n  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid\n  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid\n  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid\n  AND blocking_locks.pid != blocked_locks.pid\nJOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid\nWHERE NOT blocked_locks.granted;\n\n-- Terminate blocking process PID gracefully\nSELECT pg_cancel_backend(blocking_pid);\n\n-- Forcefully terminate process PID\nSELECT pg_terminate_backend(blocking_pid);"
  },
  {
    id: 667,
    title: "What are ACID properties in database transactions?",
    category: "sql",
    difficulty: "medium",
    answer: "ACID defines the key properties required to guarantee database transaction reliability:\n• Atomicity: Entire transaction completes successfully, or all changes are rolled back (All-or-Nothing).\n• Consistency: Database transitions from one valid state to another, maintaining all constraints, triggers, and schemas.\n• Isolation: Transactions running concurrently execute independently without interfering with each other.\n• Durability: Once a transaction commits, its modifications are permanently recorded in non-volatile memory (surviving system crashes).",
    command: "-- Example of ensuring Atomicity using Transaction Block\nBEGIN TRANSACTION;\n  UPDATE bank_accounts SET balance = balance - 500 WHERE account_id = 10;\n  UPDATE bank_accounts SET balance = balance + 500 WHERE account_id = 11;\nCOMMIT; -- If either statement fails, execute ROLLBACK;"
  },
  {
    id: 668,
    title: "Difference between clustered index, non-clustered index, and covering index",
    category: "sql",
    difficulty: "medium",
    answer: "• Clustered Index: Sorts and stores the physical data rows of the table based on key values. A table can have only one clustered index.\n• Non-Clustered Index: Maintains a separate structure containing key values and pointers (ROWIDs or primary keys) back to the actual data rows.\n• Covering Index: A non-clustered index that includes/covers *all* columns requested by a SELECT query. Since the index holds all requested data, the query planner can return results directly from the index tree, skipping the expensive table lookup step (index-only scan).",
    command: "-- Create covering index (index includes filter and select columns)\nCREATE INDEX idx_emp_dept_salary ON employees(department_id, salary, employee_id);\n\n-- This query performs an index-only scan (no table blocks accessed)\nSELECT department_id, employee_id\nFROM employees\nWHERE department_id = 20;"
  },
  {
    id: 669,
    title: "How to use Self-Joins to compare rows within the same table?",
    category: "sql",
    difficulty: "medium",
    answer: "A self-join is a standard join that links a table to itself. This requires assigning distinct aliases to the table in the FROM clause. It is used to query hierarchical data (e.g. employee-manager links) or compare records in the same table.",
    command: "-- Find employees and their managers from a single employees table\nSELECT e.first_name AS employee,\n       m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;"
  },
  {
    id: 670,
    title: "How do you implement Upsert operations (INSERT ON CONFLICT/MERGE)?",
    category: "sql",
    difficulty: "medium",
    answer: "An 'Upsert' operation inserts a new row, or updates the existing row if it violates a uniqueness constraint (like a Primary Key duplicate).\n• PostgreSQL: INSERT ON CONFLICT DO UPDATE\n• MySQL: INSERT ... ON DUPLICATE KEY UPDATE\n• SQL Standard / Oracle: MERGE",
    command: "-- PostgreSQL Upsert (inserts new user, updates active timestamp on duplicate)\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON CONFLICT (user_id)\nDO UPDATE SET last_active = EXCLUDED.last_active, token = EXCLUDED.token;\n\n-- MySQL Upsert\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON DUPLICATE KEY UPDATE token = VALUES(token), last_active = VALUES(last_active);"
  },
  {
    id: 671,
    title: "Explain the difference between correlated and uncorrelated subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "• Uncorrelated Subquery: Executes independently of the outer query. It runs once, returns a result set, and the outer query uses that result.\n• Correlated Subquery: References columns from the outer query. It must execute repeatedly, once for every candidate row evaluated by the outer query. These are typically slower and should be replaced with JOINs or CTEs where possible.",
    command: "-- Uncorrelated: Subquery runs once\nSELECT first_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);\n\n-- Correlated: Subquery runs once for EVERY employee row to check their department average\nSELECT e1.first_name, e1.salary, e1.department_id\nFROM employees e1\nWHERE e1.salary > (\n  SELECT AVG(e2.salary) \n  FROM employees e2 \n  WHERE e2.department_id = e1.department_id\n);"
  },
  {
    id: 672,
    title: "What are Foreign Key constraints and cascading actions?",
    category: "sql",
    difficulty: "medium",
    answer: "Foreign Keys enforce referential integrity between tables. When a referenced parent row is updated or deleted, you can configure cascading actions to define what happens to child rows:\n• ON DELETE CASCADE: Deletes child rows automatically when the parent row is deleted.\n• ON DELETE SET NULL: Sets child foreign key columns to NULL.\n• ON DELETE RESTRICT / NO ACTION: Blocks the deletion of the parent row if child references exist (Default behavior).",
    command: "-- Create foreign key with cascade delete rule\nCREATE TABLE order_items (\n  item_id INT PRIMARY KEY,\n  order_id INT,\n  product_id INT,\n  quantity INT,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE\n);"
  },
  {
    id: 673,
    title: "Using COALESCE to implement conditional queries dynamically",
    category: "sql",
    difficulty: "medium",
    answer: "COALESCE is useful for writing dynamic search filters in stored procedures or APIs. By passing optional search parameters alongside column checks, you can filter records dynamically without building dynamic SQL queries.",
    command: "-- Dynamic search where parameters can be NULL (if NULL, column matches itself)\nSELECT employee_id, first_name, job_id, department_id\nFROM employees\nWHERE department_id = COALESCE(:dept_param, department_id)\n  AND job_id = COALESCE(:job_param, job_id);"
  },
  {
    id: 674,
    title: "Difference between char, varchar, and text datatypes in databases",
    category: "sql",
    difficulty: "medium",
    answer: "• CHAR(N): Fixed-length string. If you insert a string shorter than N, the database pads it with trailing spaces. Best for fixed-length codes (ISO country codes, status chars).\n• VARCHAR(N): Variable-length string up to N characters. Stores exactly the length of the string plus a 1-2 byte length prefix. Best for names, addresses, and variable strings.\n• TEXT / CLOB: Unlimited length string (or up to 2-4GB). Typically stored off-row (outside the table's main data page) with pointers, resulting in slightly slower access times but supporting massive text payloads.",
    command: "-- Table definition using optimal character structures\nCREATE TABLE product_catalogue (\n  product_iso_code CHAR(3) PRIMARY KEY, -- e.g. 'USA', 'CAN'\n  product_name VARCHAR(100) NOT NULL,\n  product_description TEXT\n);"
  },
  {
    id: 675,
    title: "Explain Oracle ASM (Automatic Storage Management)",
    category: "oracle dba",
    difficulty: "medium",
    answer: "ASM provides a clustered file system and volume manager specifically designed for Oracle databases. It uses disk groups to provide mirroring and striping without needing a third-party logical volume manager.",
    command: "SELECT name, state, type FROM v$asm_diskgroup;"
  },
  {
    id: 676,
    title: "How to check active user sessions in Oracle?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "You can query the v$session dynamic performance view filtering by type = 'USER' to see active user connections.",
    command: "SELECT sid, serial#, username, status FROM v$session WHERE type = 'USER';"
  },
  {
    id: 677,
    title: "What is an Oracle Data Block?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "The data block is the smallest unit of I/O in an Oracle database. Multiple OS blocks make up one Oracle data block (e.g. 8KB).",
    command: "SHOW PARAMETER db_block_size;"
  },
  {
    id: 678,
    title: "Explain the role of LGWR process",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The Log Writer (LGWR) is a background process that writes redo entries from the redo log buffer in the SGA to the online redo log files on disk.",
    command: "-- No direct command, it runs in the background. Check via: ps -ef | grep lgwr"
  },
  {
    id: 679,
    title: "How do you gather schema statistics?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "You use the DBMS_STATS package to gather optimizer statistics for tables, indexes, schemas, or the entire database to help the cost-based optimizer (CBO).",
    command: "EXEC DBMS_STATS.GATHER_SCHEMA_STATS('HR');"
  },
  {
    id: 680,
    title: "What is the difference between TRUNCATE and DELETE?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "TRUNCATE is a DDL command that quickly removes all rows and resets the high water mark without generating extensive undo/redo. DELETE is a DML command that logs each row deletion.",
    command: "TRUNCATE TABLE employees_temp;"
  },
  {
    id: 681,
    title: "How to find the size of a database table?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Query the dba_segments or user_segments view to sum up the bytes allocated for a specific table.",
    command: "SELECT segment_name, bytes/1024/1024 as MB FROM user_segments WHERE segment_type='TABLE' AND segment_name='EMPLOYEES';"
  },
  {
    id: 682,
    title: "Explain Oracle RAC (Real Application Clusters)",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Oracle RAC allows multiple instances running on different servers to access a single physical database concurrently. It provides high availability and scalability.",
    command: "srvctl status database -d orcl"
  },
  {
    id: 683,
    title: "What is a Tablespace?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "A tablespace is a logical storage unit within an Oracle database. It groups related logical structures like tables and indexes, and physically consists of one or more data files.",
    command: "SELECT tablespace_name, status FROM dba_tablespaces;"
  },
  {
    id: 684,
    title: "How to resize a data file?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "You can use the ALTER DATABASE DATAFILE command to resize an existing data file to increase or decrease its size.",
    command: "ALTER DATABASE DATAFILE '/u01/app/oracle/oradata/users01.dbf' RESIZE 10G;"
  },
  {
    id: 685,
    title: "Explain the role of the DBWn process",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The Database Writer (DBWn) process writes dirty blocks (modified data blocks) from the database buffer cache to the data files on disk.",
    command: "ps -ef | grep dbw"
  },
  {
    id: 686,
    title: "How to check database backup status in RMAN?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Use RMAN commands like LIST BACKUP or query the v$rman_backup_job_details view.",
    command: "RMAN> LIST BACKUP SUMMARY;"
  },
  {
    id: 687,
    title: "What is an Oracle Sequence?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "A sequence is a database object used to generate unique integers automatically, typically for primary keys.",
    command: "CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1;"
  },
  {
    id: 688,
    title: "How to unlock a locked user account?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Use the ALTER USER command specifying ACCOUNT UNLOCK.",
    command: "ALTER USER hr ACCOUNT UNLOCK;"
  },
  {
    id: 689,
    title: "What is the SYSAUX tablespace?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "SYSAUX is an auxiliary tablespace to the SYSTEM tablespace. It stores metadata for database components (like AWR) to reduce the load on the SYSTEM tablespace.",
    command: "SELECT occupant_name, space_usage_kbytes FROM v$sysaux_occupants;"
  },
  {
    id: 690,
    title: "How to force a log switch?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "You can manually force a log switch using ALTER SYSTEM SWITCH LOGFILE, which causes LGWR to start writing to the next redo log group.",
    command: "ALTER SYSTEM SWITCH LOGFILE;"
  },
  {
    id: 691,
    title: "Explain Oracle Flashback Query",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Flashback Query allows you to view data as it existed at a past point in time, using undo data.",
    command: "SELECT * FROM employees AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '1' HOUR);"
  },
  {
    id: 692,
    title: "How to view the current database instance name?",
    category: "oracle dba",
    difficulty: "easy",
    answer: "Query the v$instance view.",
    command: "SELECT instance_name, host_name FROM v$instance;"
  },
  {
    id: 693,
    title: "What is an Index Organized Table (IOT)?",
    category: "oracle dba",
    difficulty: "hard",
    answer: "An IOT stores table data directly within a B-tree index structure based on the primary key, providing fast access via the primary key.",
    command: "CREATE TABLE t1 (id INT PRIMARY KEY, val VARCHAR(10)) ORGANIZATION INDEX;"
  },
  {
    id: 694,
    title: "How to drop a database user and all their objects?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Use the DROP USER command with the CASCADE keyword.",
    command: "DROP USER test_user CASCADE;"
  },
  {
    id: 695,
    title: "What is AWR (Automatic Workload Repository)?",
    category: "oracle dba",
    difficulty: "hard",
    answer: "AWR is a built-in repository that collects, processes, and maintains performance statistics for problem detection and self-tuning.",
    command: "SELECT * FROM dba_hist_snapshot;"
  },
  {
    id: 696,
    title: "How to check the undo retention period?",
    category: "oracle dba",
    difficulty: "medium",
    answer: "Check the undo_retention parameter, which specifies the minimum time (in seconds) undo data is retained.",
    command: "SHOW PARAMETER undo_retention;"
  },
  {
    id: 697,
    title: "Explain the role of the PMON process",
    category: "oracle dba",
    difficulty: "medium",
    answer: "The Process Monitor (PMON) performs process recovery when a user process fails. It cleans up the cache and frees resources that the process was using.",
    command: "ps -ef | grep pmon"
  },
  {
    id: 698,
    title: "How to multiplex Oracle control files?",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Modify the control_files parameter to include multiple paths, shut down the database, copy the existing control file to the new locations, and start up.",
    command: "ALTER SYSTEM SET control_files='/u01/c1.ctl','/u02/c2.ctl' SCOPE=SPFILE;"
  },
  {
    id: 699,
    title: "What is Oracle Data Guard?",
    category: "oracle dba",
    difficulty: "hard",
    answer: "Data Guard provides disaster recovery by creating and maintaining one or more standby databases synchronized with the primary database.",
    command: "SELECT process, status, sequence# FROM v$managed_standby;"
  }
];
