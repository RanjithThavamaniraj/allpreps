export const linuxNewQuestions = [
  // ==========================================
  // EASY QUESTIONS (12 new, IDs 82 to 93)
  // ==========================================
  {
    id: 82,
    title: "How to check Linux OS distribution name and kernel version?",
    category: "linux",
    difficulty: "easy",
    answer: "You can find the Linux operating system distribution and kernel release version using built-in system files or terminal tools:\n• /etc/os-release: Standard file containing OS identification data.\n• uname -r: Returns the running kernel release version.\n• hostnamectl: Displays OS, kernel, and system architecture details.",
    command: `# View operating system details\ncat /etc/os-release\n\n# Print kernel release version\nuname -r\n\n# Display system information overview\nhostnamectl`
  },
  {
    id: 83,
    title: "How do you find files larger than 100MB in a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "The 'find' command searches the directory hierarchy for files matching specific size criteria. Using options like '-type f' limits the search to regular files, and '-size' filters by size. Running it with 'ls' or 'du' formats the output to show exact sizes.",
    command: `# Find and list files larger than 100MB in /var/log\nfind /var/log -type f -size +100M -exec ls -lh {} \\;\n\n# Search current directory recursively for files > 100MB\nfind . -type f -size +100M`
  },
  {
    id: 84,
    title: "Explain the difference between soft links and hard links in Linux",
    category: "linux",
    difficulty: "easy",
    answer: "• Soft Link (Symlink): A symbolic path pointing to another filename. If the original file is deleted, the symlink becomes broken ('dangling'). It can span across different filesystems.\n• Hard Link: An additional directory entry pointing directly to the file's underlying inode. If the original filename is deleted, the file content remains accessible via the hard link. It cannot span across different filesystems or point to directories.",
    command: `# Create a soft link (symlink)\nln -s /etc/nginx/nginx.conf ~/my_nginx.conf\n\n# Create a hard link\nln /var/log/messages ~/messages_backup\n\n# View inodes to verify (hard links share the same inode number)\nls -li`
  },
  {
    id: 85,
    title: "How do you check which process is listening on port 80 or 443?",
    category: "linux",
    difficulty: "easy",
    answer: "To troubleshoot connection errors or find port conflicts, use utilities like 'ss', 'netstat', or 'lsof'. You typically need superuser privileges to see the process name and PID.",
    command: `# Using ss (socket statistics) - Recommended\nsudo ss -tulpn | grep -E ':80|:443'\n\n# Using lsof (list open files)\nsudo lsof -i :80\n\n# Using netstat\nsudo netstat -tulpn | grep -E ':80|:443'`
  },
  {
    id: 86,
    title: "How to change file permissions and ownership in Linux?",
    category: "linux",
    difficulty: "easy",
    answer: "• chmod: Modifies file permissions using symbolic representation (e.g. u+x) or octal notation (e.g. 755).\n• chown: Modifies file owner and group ownership.\nUse the '-R' option with either command to apply the changes recursively to all subdirectories.",
    command: `# Set owner read/write/execute, group/others read/execute (755)\nchmod 755 /var/www/html/index.html\n\n# Make a script executable\nchmod +x deploy.sh\n\n# Change owner to 'oracle' and group to 'oinstall' recursively\nsudo chown -R oracle:oinstall /u01/app/oracle`
  },
  {
    id: 87,
    title: "How to view and search compressed log files without extracting them?",
    category: "linux",
    difficulty: "easy",
    answer: "Linux systems rotate logs and compress them using gzip (.gz format). You can search or view these logs directly without manually decompressing them using 'z-commands':\n• zcat: Concat and view files.\n• zless / zmore: Paginate through text.\n• zgrep: Search for patterns.",
    command: `# Search for ORA- errors inside compressed log archives\nzgrep "ORA-" /var/log/oracle/alert_log.*.gz\n\n# Page through a compressed log file\nzless /var/log/nginx/access.log.2.gz`
  },
  {
    id: 88,
    title: "How to check system uptime and load average?",
    category: "linux",
    difficulty: "easy",
    answer: "Load average represents the average system load over a period of time (1, 5, and 15 minutes). It counts the number of processes in runnable or uninterruptible sleep states.\n• uptime: Shows uptime, active sessions, and load averages.\n• w: Shows who is logged in and what they are doing.",
    command: `# Check uptime and load averages\nuptime\n\n# View active user sessions and load averages\nw`
  },
  {
    id: 89,
    title: "How do you kill a process by its name instead of PID?",
    category: "linux",
    difficulty: "easy",
    answer: "While 'kill' requires a process ID (PID), you can terminate processes by name using:\n• killall: Kills all processes matching the exact name.\n• pkill: Kills processes matching a pattern.\n• pgrep: Lists PIDs matching a process name.",
    command: `# Find PIDs of all running Nginx instances\npgrep nginx\n\n# Terminate all processes named 'httpd' gracefully (SIGTERM)\npkill httpd\n\n# Forcefully kill all processes named 'node' (SIGKILL)\nkillall -9 node`
  },
  {
    id: 90,
    title: "How do you search for a pattern in all files within a directory?",
    category: "linux",
    difficulty: "easy",
    answer: "Use 'grep' with recursive flags. Useful options include:\n• -r or -R: Recursive search.\n• -n: Show line numbers.\n• -i: Case-insensitive search.\n• -w: Match whole words only.",
    command: `# Search for 'localhost' in all files under /etc\ngrep -rn "localhost" /etc/\n\n# Case-insensitive search for 'error' in /var/log\ngrep -ri "error" /var/log/`
  },
  {
    id: 91,
    title: "How do you monitor log updates live in color using tail?",
    category: "linux",
    difficulty: "easy",
    answer: "You can follow file updates live with 'tail -f'. To highlight specific words like 'ERROR' or 'WARNING' in color, pipe the output to grep or use utilities like 'grc' or 'multitail'.",
    command: `# Follow log files live\ntail -f /var/log/nginx/error.log\n\n# Color highlight 'ERROR' using grep\ntail -f /var/log/syslog | grep --color=auto -iE 'error|warning|critical'`
  },
  {
    id: 92,
    title: "How to check available disk space on all mounted filesystems?",
    category: "linux",
    difficulty: "easy",
    answer: "Use the 'df' command. The '-h' flag prints the capacity in human-readable units (e.g. GB, MB), and '-T' displays the filesystem type (ext4, xfs, nfs).",
    command: `# Display disk space in human-readable format\ndf -h\n\n# Display disk space with filesystem types\ndf -hT`
  },
  {
    id: 93,
    title: "How to manage system services using systemctl?",
    category: "linux",
    difficulty: "easy",
    answer: "Modern Linux distributions use systemd to manage services. The 'systemctl' tool controls the status, startup, and shutdown behavior of system units.",
    command: `# Check status of SSH service\nsystemctl status sshd\n\n# Start, stop, or restart a service\nsudo systemctl start nginx\nsudo systemctl stop nginx\nsudo systemctl restart nginx\n\n# Enable service to start automatically on system boot\nsudo systemctl enable docker`
  },

  // ==========================================
  // MEDIUM QUESTIONS (13 new, IDs 94 to 106)
  // ==========================================
  {
    id: 94,
    title: "How do you diagnose and resolve inode exhaustion?",
    category: "linux",
    difficulty: "medium",
    answer: "An inode represents a metadata record for a file. If a filesystem runs out of inodes, you cannot create new files, even if there is plenty of raw disk space available. This commonly occurs when an application creates millions of tiny session files or mail queues.\n\nResolution steps:\n1. Check inode consumption using \`df -i\`.\n2. Find the directories containing the highest number of files.\n3. Delete the unnecessary small files using \`find -delete\` or \`xargs\` (since running \`rm *\` will fail with 'Argument list too long').",
    command: `# Check inode availability per filesystem\ndf -i\n\n# Find directories with high file counts\nfind / -xdev -type d -exec sh -c 'echo "$(find "$1" -type f | wc -l) $1"' _ {} \\; | sort -rn | head -10\n\n# Delete millions of tiny files safely without memory overflow\nfind /var/spool/postfix/maildrop -type f -delete`
  },
  {
    id: 95,
    title: "How to add and enable swap space dynamically on a running system?",
    category: "linux",
    difficulty: "medium",
    answer: "If physical RAM is fully utilized, the system may invoke the Out-Of-Memory (OOM) killer to terminate database or application processes. You can dynamically create swap space using a swap file without resizing partitions.\n\nSteps:\n1. Allocate a blank file of the desired size using \`dd\` or \`fallocate\`.\n2. Set correct root-only permissions (600).\n3. Format the file as swap space using \`mkswap\`.\n4. Enable it using \`swapon\`.\n5. Append it to \`/etc/fstab\` for persistence.",
    command: `# Create a 4GB swap file\nsudo fallocate -l 4G /swapfile\n\n# Set correct permissions\nsudo chmod 600 /swapfile\n\n# Format the file as swap\nsudo mkswap /swapfile\n\n# Enable the swap file\nsudo swapon /swapfile\n\n# Verify active swap spaces\nswapon --show\n\n# Persist in fstab\necho '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab`
  },
  {
    id: 96,
    title: "How to configure visudo to grant passwordless permissions to a specific user?",
    category: "linux",
    difficulty: "medium",
    answer: "Directly editing \`/etc/sudoers\` can lock you out of system administration if a syntax error is introduced. Always use the \`visudo\` command, which validates configuration syntax before saving.\n\nConfiguration format:\n\`username host=(runas_user:runas_group) [NOPASSWD:] commands\`",
    command: `# Open sudoers file in safe edit mode\nsudo visudo\n\n# Add this line to allow user 'dba' to run systemctl restart database passwordless:\n# dba ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart oracle-xe\n\n# Add this line to allow user 'deploy' to run all commands without password:\n# deploy ALL=(ALL) NOPASSWD: ALL`
  },
  {
    id: 97,
    title: "Explain Linux systemd custom unit file creation and management",
    category: "linux",
    difficulty: "medium",
    answer: "A systemd unit file (.service) configures how systemd manages a daemon. It is typically created in \`/etc/systemd/system/\`.\n\nKey sections:\n• [Unit]: Description and boot dependency orders (After=network.target).\n• [Service]: Command to execute (ExecStart), restart policy (Restart=always), and run user/group constraints.\n• [Install]: Activation targets (WantedBy=multi-user.target).",
    command: `# Create custom service file\nsudo cat << 'EOF' > /etc/systemd/system/myapp.service\n[Unit]\nDescription=My NodeJS App Service\nAfter=network.target\n\n[Service]\nUser=node\nWorkingDirectory=/var/www/myapp\nExecStart=/usr/bin/node server.js\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\n# Reload systemd configuration\nsudo systemctl daemon-reload\n\n# Start and enable the service\nsudo systemctl start myapp\nsudo systemctl enable myapp`
  },
  {
    id: 98,
    title: "How to diagnose slow disk performance and write bottlenecks?",
    category: "linux",
    difficulty: "medium",
    answer: "Disk I/O latency can degrade database throughput. Diagnose storage bottlenecks using:\n• iostat: Checks CPU statistics and I/O statistics for devices. Pay attention to '%util' (disk utilization) and 'await' (average I/O response time in milliseconds).\n• iotop: Shows real-time disk I/O usage per process, identifying which process is writing heavily.",
    command: `# Run iostat every 2 seconds, displaying detailed disk extended statistics\niostat -x 2 5\n\n# View processes actively performing read/write operations\nsudo iotop -o`
  },
  {
    id: 99,
    title: "Configuring logrotate to manage growing application logs",
    category: "linux",
    difficulty: "medium",
    answer: "Logrotate automatically rotates, compresses, and purges log files to prevent partition exhaustion. It is controlled by config scripts under \`/etc/logrotate.d/\`.\n\nCommon options:\n• daily/weekly/monthly: Rotation frequency.\n• rotate count: How many archived files to keep.\n• compress: Compress logs using gzip.\n• missingok: Skip without error if the log file is missing.\n• delaycompress: Postpone compression until the next rotation cycle.",
    command: `# Create custom logrotate configuration for an app\nsudo cat << 'EOF' > /etc/logrotate.d/myapp\n/var/log/myapp/*.log {\n    daily\n    rotate 7\n    compress\n    delaycompress\n    missingok\n    notifempty\n    create 0660 app_user app_group\n    sharedscripts\n    postrotate\n        /usr/bin/systemctl reload myapp > /dev/null 2>&1\n    endscript\n}\nEOF\n\n# Force test run logrotate execution manually\nsudo logrotate -f /etc/logrotate.d/myapp`
  },
  {
    id: 100,
    title: "How to resolve 'Too many open files' errors on Linux?",
    category: "linux",
    difficulty: "medium",
    answer: "The kernel limits the number of file descriptors a process can open (typically 1024 for non-root users). Under high concurrent load, web servers or databases will crash with a 'Too many open files' error.\n\nResolution steps:\n1. Check current limits using \`ulimit -n\`.\n2. Monitor open file descriptors using \`lsof\`.\n3. Modify system-wide and user limits in \`/etc/security/limits.conf\`.",
    command: `# Check active shell open file descriptor limits\nulimit -n\n\n# Count open files for a specific PID\nlsof -p 2481 | wc -l\n\n# Add limits permanently in /etc/security/limits.conf:\n# oracle   soft   nofile   65536\n# oracle   hard   nofile   65536`
  },
  {
    id: 101,
    title: "How do you run commands in the background that survive terminal disconnection?",
    category: "linux",
    difficulty: "medium",
    answer: "Standard shell processes terminate if the SSH connection drops. To run tasks that persist:\n• screen / tmux: Virtual terminal multiplexers that run sessions independently of SSH status.\n• nohup: Executes a command, ignoring hangup signals (SIGHUP), redirecting output to nohup.out.\n• bg/fg/jobs: Built-in shell job control.",
    command: `# Run a background backup job that persists after exit\nnohup /u01/app/oracle/scripts/backup.sh > /tmp/backup.log 2>&1 &\n\n# Start a tmux session\ntmux new -s db_restore\n\n# Detach from tmux: press Ctrl+B, then D\n# Re-attach to tmux later:\ntmux attach -t db_restore`
  },
  {
    id: 102,
    title: "How to configure system clock sync using chrony?",
    category: "linux",
    difficulty: "medium",
    answer: "Database replication, Active Directory, and log analysis require precise clock synchronization across nodes. Chrony is the modern NTP implementation used to sync system time with reliable internet time servers.\n\nManagement steps:\n• Configure NTP pool servers in \`/etc/chrony.conf\`.\n• Manage chronyd daemon.\n• Validate sync status using \`chronyc\`.",
    command: `# Check chrony clock synchronization details\nchronyc tracking\n\n# List configured NTP servers and check their connectivity status\nchronyc sources -v\n\n# Force step the system clock immediately if time offset is large\nsudo chronyc -a makestep`
  },
  {
    id: 103,
    title: "How to secure network connections in Linux using firewalld?",
    category: "linux",
    difficulty: "medium",
    answer: "Firewalld is a firewall management tool that dynamically manages network ports. It uses Zones (e.g. public, internal) to classify network traffic.\n\nSteps:\n1. Add a port or service rule.\n2. Reload configuration to apply.\n3. Verify open configurations.",
    command: `# Add Oracle listener port (1521) permanently to public zone\nsudo firewall-cmd --zone=public --add-port=1521/tcp --permanent\n\n# Reload firewall rules\nsudo firewall-cmd --reload\n\n# List active firewall rules in default zone\nsudo firewall-cmd --list-all`
  },
  {
    id: 104,
    title: "Using rsync to synchronize directories across servers securely",
    category: "linux",
    difficulty: "medium",
    answer: "Rsync is a fast, file-copying tool that syncs directories over SSH. It uses an delta-transfer algorithm, copying only the differences between source and destination files to reduce network bandwidth.\n\nKey flags:\n• -a: Archive mode (preserves permissions, ownership, timestamps, and symlinks).\n• -v: Verbose output.\n• -z: Compress data during transfer.\n• --delete: Deletes files in destination that no longer exist in source.",
    command: `# Sync local backup directory to a backup server over SSH\nrsync -avz --delete /u01/backups/ backup_user@bkpserver:/storage/backups/\n\n# Perform a dry run to see changes without copying\nrsync -avz --dry-run /u01/backups/ backup_user@bkpserver:/storage/backups/`
  },
  {
    id: 105,
    title: "How to examine kernel rings and system event buffers using dmesg?",
    category: "linux",
    difficulty: "medium",
    answer: "The 'dmesg' command prints the kernel message buffer. It is a critical diagnostic tool for identifying hardware errors, driver issues, memory errors (OOM kills), or block layer issues.",
    command: `# Search kernel logs for Out-Of-Memory events\ndmesg -T | grep -i oom\n\n# Search for disk I/O or SCSI connection errors\ndmesg -T | grep -iE 'sd|scsi|block|error'\n\n# View live kernel logs\ndmesg -w`
  },
  {
    id: 106,
    title: "How do you audit directory disk space usage using du and ncdu?",
    category: "linux",
    difficulty: "medium",
    answer: "When a partition fills up, you must identify what files are consuming space. Use 'du' with sort filters, or the interactive command-line analyzer 'ncdu'.",
    command: `# Find top 10 largest folders under /var/log\nsudo du -ah /var/log/ | sort -rh | head -n 10\n\n# Run interactive disk usage analyzer (if installed)\nncdu /var`
  },

  // ==========================================
  // HARD QUESTIONS (17 new, IDs 107 to 123)
  // ==========================================
  {
    id: 107,
    title: "Troubleshooting Kernel Panic and Unresponsive OS",
    category: "linux",
    difficulty: "hard",
    answer: "A kernel panic is a safety measure taken by the operating system kernel when it encounters an unrecoverable internal error (e.g., driver crash, memory corruption, filesystem loss). When a panic occurs, the OS freezes to prevent data corruption.\n\nDiagnostics steps:\n1. Inspect the console screen or IPMI console interface for panic trace dumps.\n2. Configure Kdump to capture kernel core dump files (/var/crash/).\n3. Load the crash dump into 'crash' utility using crash tools to debug memory variables.\n4. Search /var/log/messages or journald for logs preceding the crash.",
    command: `# Verify kdump service status\nsystemctl status kdump\n\n# View kernel crash logs\nls -l /var/crash/\n\n# Configure kernel behavior to reboot automatically 10 seconds after a panic\nsudo sysctl kernel.panic=10\n\n# Force crash dump generation to test kdump (CAUTION: Reboots host immediately)\n# sudo sh -c "echo c > /proc/sysrq-trigger"`
  },
  {
    id: 108,
    title: "Tuning Linux sysctl Virtual Memory and Dirty Page Ratios",
    category: "linux",
    difficulty: "hard",
    answer: "Under heavy write-heavy database workloads, Linux can block on disk operations if system memory caching parameters are misconfigured. Tuning virtual memory settings prevents 'I/O spikes' and database freeze cycles.\n\nKey Parameters:\n• vm.dirty_background_ratio: Memory percentage at which the pdflush/flush kernel threads start writing dirty blocks to disk in the background (Default ~10%).\n• vm.dirty_ratio: Memory percentage at which a process performing writes is forced to write dirty blocks to disk, blocking its own executions until completed (Default ~20%).\n• For databases with fast storage, reduce these ratios to keep writes smooth (e.g. background 5%, dirty 10%).",
    command: `# View current virtual memory dirty ratios\nsysctl -a | grep -E 'dirty_ratio|dirty_background_ratio'\n\n# Tune VM memory ratios dynamically\nsudo sysctl vm.dirty_background_ratio=5\nsudo sysctl vm.dirty_ratio=10\n\n# Persist modifications in /etc/sysctl.conf\necho -e 'vm.dirty_background_ratio = 5\\nvm.dirty_ratio = 10' | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p`
  },
  {
    id: 109,
    title: "Analyzing Process Performance Bottlenecks using strace and lsof",
    category: "linux",
    difficulty: "hard",
    answer: "When a critical process is running slowly or consuming 100% CPU, you can trace system calls in real time using 'strace' and inspect open file descriptors using 'lsof'.\n\nDiagnostics:\n• strace: Intercepts and logs system calls made by a process. High volumes of specific calls (e.g. read/write/futex) reveal what a process is waiting on.\n• lsof: Identifies which files, directories, or sockets the process is interacting with.",
    command: `# Trace system calls for a process PID, counting time spent per call\nsudo strace -c -p 14820\n\n# Trace file read and write calls with timestamps\nsudo strace -t -e trace=read,write -p 14820\n\n# List network connections and sockets opened by process PID\nsudo lsof -i -a -p 14820`
  },
  {
    id: 110,
    title: "Debugging Network Packet Drops using tcpdump and iptables",
    category: "linux",
    difficulty: "hard",
    answer: "Network drops or connection timeouts between databases and application servers require protocol packet auditing.\n\nWorkflow:\n1. Check network socket statistics with 'ss'.\n2. Capture packet dumps with 'tcpdump' to verify if handshakes (SYN, SYN-ACK, ACK) complete.\n3. Audit 'iptables' drops or firewalld rules. Use the 'TRACE' target in iptables raw table to trace which rule drops the packets.",
    command: `# Capture TCP packets on interface eth0 on port 1521, writing to file\nsudo tcpdump -i eth0 port 1521 -w /tmp/db_traffic.pcap\n\n# Read captured packet trace file, showing details in ASCII\ntcpdump -r /tmp/db_traffic.pcap -A | head -n 50\n\n# Check firewall drop counts and active rules\nsudo iptables -L -n -v`
  },
  {
    id: 111,
    title: "Setting up LVM Snapshots for Zero-Downtime Backups",
    category: "linux",
    difficulty: "hard",
    answer: "LVM snapshots allow creating a read-only copy of a logical volume at a specific point in time. It uses a copy-on-write (COW) mechanism, meaning it only allocates space to store data blocks as they change on the original volume.\n\nBackup Strategy:\n1. Freeze the database or application writes (e.g. fsfreeze or SQL flush).\n2. Create the LVM snapshot.\n3. Unfreeze filesystem writes (minimizes downtime to <1s).\n4. Mount the snapshot to a different path and copy files.\n5. Unmount and delete the snapshot to free up storage.",
    command: `# 1. Create a 5GB snapshot named 'lv_db_snap' from 'lv_db'\nsudo lvcreate -L 5G -s -n lv_db_snap /dev/vg_data/lv_db\n\n# 2. Mount the snapshot (use nouuid flag for XFS filesystems)\nsudo mount -o ro,nouuid /dev/vg_data/lv_db_snap /mnt/db_backup\n\n# 3. Copy files using tar or rsync\ntar -czf /storage/db_backup.tar.gz /mnt/db_backup\n\n# 4. Cleanup snapshot\nsudo umount /mnt/db_backup\nsudo lvremove -f /dev/vg_data/lv_db_snap`
  },
  {
    id: 112,
    title: "Configuring SELinux Policies for Custom Database Paths",
    category: "linux",
    difficulty: "hard",
    answer: "SELinux (Security-Enhanced Linux) enforces mandatory access control (MAC) policies. If you move Oracle, PostgreSQL, or Nginx storage to a custom directory (e.g. /u02/app/data), SELinux will block the daemon from accessing it, causing startup failures.\n\nFixing SELinux issues:\n• Do not set SELinux to permissive or disabled in production.\n• Update the SELinux file contexts for the custom path using 'semanage fcontext' and apply changes using 'restorecon'.",
    command: `# Check active SELinux status\nsestatus\n\n# View denials in audit logs\nsudo ausearch -m AVC -ts recent\n\n# Add context type for custom directory (e.g. postgres_db_t)\nsudo semanage fcontext -a -t postgresql_db_t "/u02/data(/.*)?"\n\n# Apply the context changes\nsudo restorecon -R -v /u02/data`
  },
  {
    id: 113,
    title: "Recovering corrupted Linux Ext4/XFS filesystems",
    category: "linux",
    difficulty: "hard",
    answer: "Sudden power outages or SAN disconnections can cause filesystem corruption. The kernel will automatically remount the filesystem as read-only to prevent further damage.\n\nRecovery Steps:\n1. Identify the corrupted volume (dmesg or mount status).\n2. Unmount the volume. Never run filesystem repairs on a mounted volume.\n3. For Ext4: Run \`fsck\` (or \`e2fsck\`) to fix inconsistencies.\n4. For XFS: Run \`xfs_repair\` (XFS does not use fsck).",
    command: `# Unmount the partition\nsudo umount /dev/vg_data/lv_app\n\n# Repair Ext4 volume\nsudo e2fsck -f -y /dev/vg_data/lv_app\n\n# Repair XFS volume (if XFS log holds dirty transactions, use -L flag as last resort)\n# sudo xfs_repair /dev/vg_data/lv_app`
  },
  {
    id: 114,
    title: "Configuring network interface bonding (Active-Passive) on RedHat/CentOS",
    category: "linux",
    difficulty: "hard",
    answer: "Network interface bonding combines multiple physical NICs into a single logical channel. This provides network redundancy (failover) and link aggregation (increased bandwidth).\n\nModes:\n• Mode 0 (Balance-RR): Load balancing.\n• Mode 1 (Active-Backup): High availability. If active link fails, backup NIC takes over.",
    command: `# View active bond0 interface configuration details\ncat /proc/net/bonding/bond0\n\n# Show status of all physical connections\nnmcli device status`
  },
  {
    id: 115,
    title: "Tuning Linux HugePages for database SGA structures",
    category: "linux",
    difficulty: "hard",
    answer: "By default, Linux uses 4KB memory page sizes. For databases with large SGAs (e.g. 32GB+), managing millions of page table entries consumes substantial CPU overhead. Configuring HugePages (typically 2MB sizes) locks memory blocks in RAM, prevents swap-out, and improves TLB cache efficiency.\n\nSteps:\n1. Determine required HugePages count from SGA target size.\n2. Configure HugePages allocation dynamically or in sysctl.conf.\n3. Adjust user memlock limits in limits.conf.\n4. Restart database and verify.",
    command: `# Check current HugePage allocation and size\ngrep -i huge /proc/meminfo\n\n# Calculate count: SGA_SIZE / Hugepagesize (e.g. 16GB / 2MB = 8192 pages)\n# Configure temporarily:\nsudo sysctl vm.nr_hugepages=8192\n\n# Check user memory locking limits (Max Locked Memory)\nulimit -l`
  },
  {
    id: 116,
    title: "Troubleshooting Linux OOM Killer Events",
    category: "linux",
    difficulty: "hard",
    answer: "The Linux Out-Of-Memory (OOM) killer is a mechanism that terminates processes to save the system from crashing when memory is completely depleted. The kernel evaluates processes and assigns an 'oom_score' based on memory usage and process characteristics. The process with the highest score is killed.\n\nMitigation Strategy:\n• Optimize application memory leaks.\n• Set up swap space.\n• Adjust oom_score_adj for critical system daemons (like SSH or database listeners) to protect them from being terminated.",
    command: `# Find OOM kills in system logs\njournalctl -xb | grep -i oom-killer\n\n# Search log files directly\ngrep -i "killed process" /var/log/messages\n\n# Protect Nginx from OOM (set score adjustment to -1000)\necho -1000 | sudo tee /proc/$(pgrep nginx | head -1)/oom_score_adj`
  },
  {
    id: 117,
    title: "Diagnosing zombie and defunct processes",
    category: "linux",
    difficulty: "hard",
    answer: "A zombie process (defunct) is a process that has completed execution but still has an entry in the process table. This happens because the parent process has not read its exit status using wait() or waitpid(). While zombies do not consume CPU or RAM, they occupy process table slots (PIDs).\n\nResolution:\n• Find the parent process using 'ps'.\n• Send a SIGCHLD signal to the parent to force it to clean up the zombie.\n• If that fails, restart the parent process, which makes the zombie an orphan, and the init process (PID 1) will automatically clean it up.",
    command: `# Find zombie processes\nps aux | grep Z\n\n# List zombie PIDs alongside parent process details\nps -eo pid,ppid,stat,cmd | grep -E '[Zz]' | grep -v grep\n\n# Kill the parent process of a zombie\nkill -1 $(ps -o ppid= -p <zombie_pid>)`
  },
  {
    id: 118,
    title: "Tuning TCP Keepalive and Socket Buffers for High-Concurrency Web Servers",
    category: "linux",
    difficulty: "hard",
    answer: "Under high volumes of network connections, Linux sockets can hang in TIME_WAIT status, exhausting ephemeral ports and blocking new connections.\n\nOptimization:\n• Enable socket reuse (net.ipv4.tcp_tw_reuse).\n• Increase local port range (net.ipv4.ip_local_port_range).\n• Increase backlog parameters (net.core.somaxconn) to handle higher queue lengths.\n• Tune TCP read and write memory buffers.",
    command: `# View current network parameters\nsysctl net.ipv4.ip_local_port_range\nsysctl net.core.somaxconn\n\n# Tune TCP settings dynamically\nsudo sysctl -w net.ipv4.tcp_tw_reuse=1\nsudo sysctl -w net.core.somaxconn=1024\nsudo sysctl -w net.ipv4.ip_local_port_range="10240 65535"`
  },
  {
    id: 119,
    title: "How to configure custom journald log retention and rotation settings?",
    category: "linux",
    difficulty: "hard",
    answer: "By default, systemd-journald stores system logs. If misconfigured, journal logs can consume tens of gigabytes of disk space under \`/var/log/journal/\`.\n\nManagement:\n• Edit \`/etc/systemd/journald.conf\` to limit log sizes.\n• Set SystemMaxUse (maximum disk usage cap) and MaxFileSec (maximum time window per log file).\n• Query journal sizes and run maintenance tasks using \`journalctl\`.",
    command: `# Check total disk space consumed by journal logs\njournalctl --disk-usage\n\n# Clean up journal logs keeping only the last 7 days of logs\nsudo journalctl --vacuum-time=7d\n\n# Clean up journal logs keeping only the last 1GB of logs\nsudo journalctl --vacuum-size=1G`
  },
  {
    id: 120,
    title: "Recovering lost root passwords using GRUB boot modifications",
    category: "linux",
    difficulty: "hard",
    answer: "If the root password is lost, you can gain shell access to reset it by booting into a rescue terminal.\n\nSteps:\n1. Reboot the host and press any key to enter the GRUB bootloader menu.\n2. Select the kernel and press 'e' to edit boot parameters.\n3. Find the line starting with 'linux' or 'linux16' and append 'rd.break' or 'init=/bin/sh' at the end.\n4. Press Ctrl+X to boot. The system mounts the root filesystem as read-only at /sysroot/.\n5. Mount the directory as read-write: \`mount -o remount,rw /sysroot\`.\n6. Change root environment: \`chroot /sysroot\`.\n7. Run \`passwd\` to set a new password.\n8. Enable SELinux auto-relabel: \`touch /.autorelabel\`.\n9. Reboot.",
    command: `# Run these inside the emergency shell:\nmount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\ntouch /.autorelabel\nexit\nreboot`
  },
  {
    id: 121,
    title: "Auditing user actions using Auditd daemon",
    category: "linux",
    difficulty: "hard",
    answer: "The Linux Audit Daemon (auditd) logs security-relevant events on a system. Unlike standard application loggers, it can track system calls, file access events, execution parameters, and network activities.\n\nUsage:\n• Create rules in \`/etc/audit/rules.d/audit.rules\`.\n• Query audit logs using \`ausearch\`.\n• Generate reports using \`aureport\`.",
    command: `# Track modifications to /etc/passwd (key=passwd_change)\nsudo auditctl -w /etc/passwd -p wa -k passwd_change\n\n# Query audit logs for events with key 'passwd_change'\nsudo ausearch -k passwd_change\n\n# Generate a summary report of failed logins\nsudo aureport --login --failed`
  },
  {
    id: 122,
    title: "Troubleshooting read-only filesystem issues",
    category: "linux",
    difficulty: "hard",
    answer: "When Linux detects hardware corruption, block layer errors, or lost network access on a partition (such as an NFS mount), it remounts the filesystem as read-only to prevent disk corruption.\n\nDiagnosis:\n1. Search kernel logs using dmesg for write errors or I/O timeouts.\n2. Identify the filesystem type (ext4, xfs) and device path.\n3. Unmount the volume and run repairs. If it is the root partition, reboot into a live rescue image to run repairs.",
    command: `# Check mount parameters for read-only (ro) flags\nmount | grep ' ro,'\n\n# Remount a partition as read-write dynamically if it was set to ro manually\nsudo mount -o remount,rw /data`
  },
  {
    id: 123,
    title: "Configuring cgroups to limit process memory and CPU limits",
    category: "linux",
    difficulty: "hard",
    answer: "Control Groups (cgroups) are a kernel feature that limits, isolates, and measures resource usage (CPU, memory, disk I/O, network) for groups of processes. Docker uses cgroups internally to enforce container resource boundaries.\n\nManagement:\n• Create control directories under \`/sys/fs/cgroup/memory/\` or use systemd slices.\n• Set limit bounds (e.g. limit_in_bytes) by writing to control files.\n• Assign processes to cgroups.",
    command: `# Create custom cgroup under systemd slice\nsudo systemd-run --unit=capped_job --slice=capped_slice --property=MemoryMax=500M /opt/batch_job.sh\n\n# Check slice configurations\nsystemctl status capped_job`
  }
];
