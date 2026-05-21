export const shellNewQuestions = [
  // ==========================================
  // EASY QUESTIONS (13 new, IDs 211 to 223)
  // ==========================================
  {
    id: 211,
    title: "How to read command-line arguments in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash scripts can accept command-line arguments. These are automatically assigned to positional parameters:\n• $1, $2, $3...: First, second, third arguments.\n• $0: The name of the script itself.\n• $#: The number of arguments passed.\n• $@: All positional parameters as separate words (preferred over $*).\n• $*: All positional parameters as a single word.",
    command: `# Create a script to print arguments\ncat << 'EOF' > arg_test.sh\n#!/bin/bash\necho "Script Name: $0"\necho "Total Arguments: $#"\necho "First Arg: $1"\necho "Second Arg: $2"\necho "All Args (List): $@"\nEOF\n\nchmod +x arg_test.sh\n./arg_test.sh param1 param2`
  },
  {
    id: 212,
    title: "How to check if a file or directory exists using if conditions?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can perform file testing checks inside conditional brackets [ ] or [[ ]]:\n• -f file: True if the file exists and is a regular file.\n• -d dir: True if the directory exists.\n• -e path: True if the path exists (regardless of type).\n• -r path: True if readable.\n• -w path: True if writable.",
    command: `# Check if /etc/hosts exists and is a file\nif [ -f "/etc/hosts" ]; then\n  echo "/etc/hosts exists."\nfi\n\n# Check if backup directory exists, create if missing\nBACKUP_DIR="/tmp/backup"\nif [ ! -d "$BACKUP_DIR" ]; then\n  mkdir -p "$BACKUP_DIR"\nfi`
  },
  {
    id: 213,
    title: "Explain exit status codes ($?) and how to use them for error handling?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Every Linux command returns an exit status code (0 to 255) upon completion:\n• 0: Success.\n• Non-Zero (1-255): Failure or specific error state.\n\nYou can query this status code using the special variable '$?' immediately after running a command, or evaluate it in conditionals.",
    command: `# Ping a server and check if it is online\nping -c 1 -W 2 google.com > /dev/null 2>&1\nSTATUS=$?\n\nif [ $STATUS -eq 0 ]; then\n  echo "Internet connection active."\nelse\n  echo "Network ping failed with exit code $STATUS."\nfi`
  },
  {
    id: 214,
    title: "How to loop through all files in a directory using a for loop?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can iterate over files in a directory using globbing patterns (e.g., *) in a for loop. Avoid using the output of \`ls\` in loops, as filenames containing spaces can break parsing.",
    command: `# Loop through all .log files in /var/log/nginx/\nfor file in /var/log/nginx/*.log; do\n  # Check if file exists to handle empty directories safely\n  [ -e "$file" ] || continue\n  echo "Processing log file: $(basename "$file")"\ndone`
  },
  {
    id: 215,
    title: "How to perform basic arithmetic operations in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Bash only supports integer arithmetic. You can perform arithmetic calculations using:\n• $(( expression )): The modern double-parentheses syntax (preferred).\n• let statement: Performs variable assignment.\n• expr command: Legacy syntax (slower, requires spaces).",
    command: `# Calculate sum using double-parentheses\nnum1=15\nnum2=20\nsum=$((num1 + num2))\necho "Sum: $sum"\n\n# Increment a variable\ncount=1\n((count++))\necho "Incremented Count: $count"\n\n# Multiplication\nproduct=$((num1 * num2))\necho "Product: $product"`
  },
  {
    id: 216,
    title: "How to redirect messages to standard error (stderr) instead of stdout?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "By default, 'echo' writes to standard output (file descriptor 1). To write error messages to standard error (file descriptor 2) so they can be separated during logging, redirect the output of echo using '>&2'.",
    command: `# Print standard output message\necho "This is standard output."\n\n# Print error message to stderr\necho "ERROR: Database connection failed!" >&2\n\n# Running script while routing errors to a log file:\n# ./my_script.sh 2> errors.log`
  },
  {
    id: 217,
    title: "How to read user input interactively in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Use the built-in \`read\` command to pause execution and capture input from the user.\nUseful options:\n• -p \"Prompt\": Displays a prompt text without a newline.\n• -s: Silent mode (does not echo input characters, useful for passwords).\n• -t seconds: Timeout limit.",
    command: `# Ask for username\nread -p "Enter Database Username: " db_user\n\n# Ask for password silently\nread -s -p "Enter Database Password: " db_pass\necho "" # Print newline after password mask\n\necho "Connecting to DB as user $db_user..."`
  },
  {
    id: 218,
    title: "Explain the difference between single quotes, double quotes, and backticks in Bash",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Single Quotes ('...'): Strong quoting. Treats every character literally. No variable expansion or command substitution occurs.\n• Double Quotes (\"...\"): Weak quoting. Resolves variables ($var) and command substitutions ($(command)), but treats spaces literally.\n• Backticks (\`...\`): Legacy command substitution. Runs the command inside and returns its output (use $(command) instead for nested queries).",
    command: `NAME="Oracle"\n\n# Single quotes (Literal text output)\necho 'Database name is $NAME' # Output: Database name is $NAME\n\n# Double quotes (Variable expanded)\necho "Database name is $NAME" # Output: Database name is Oracle\n\n# Command substitution\nCURRENT_DIR=$(pwd)\necho "Current path is: $CURRENT_DIR"`
  },
  {
    id: 219,
    title: "How to redirect stdout and stderr to a log file?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Redirection manages where standard streams go:\n• > log.txt: Redirects stdout to a file (overwriting).\n• >> log.txt: Appends stdout to a file.\n• 2> err.txt: Redirects stderr to a file.\n• &> log.txt: Redirects BOTH stdout and stderr to a file (modern).\n• > log.txt 2>&1: Legacy redirect of both streams (redirects stdout to file, then stderr to stdout).",
    command: `# Run backup script and redirect all outputs (overwrite)\n/opt/db_backup.sh &> /var/log/db_backup.log\n\n# Run cleanup script and append logs, sending errors to a separate file\n/opt/cleanup.sh >> /var/log/cleanup.log 2>> /var/log/cleanup_errors.log`
  },
  {
    id: 220,
    title: "How to concatenate strings and get the length of a string in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "• Concatenation: Simply place variables next to each other, optionally wrapping them in braces ${var} to avoid character ambiguity.\n• String Length: Use the syntax ${#varname} to return the character count of a string variable.",
    command: `prefix="db_backup_"\ndate_suffix="2026-05-21"\n\n# Concatenate strings\nfile_name="\${prefix}\${date_suffix}.dmp"\necho "Target File: $file_name"\n\n# Get string length\nlength=\${#file_name}\necho "Filename Length: $length characters"`
  },
  {
    id: 221,
    title: "How to check if a string contains a substring in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "You can check for substrings inside double brackets [[ ]] using wildcard globbing patterns (e.g. *pattern*), or by using the case statement.",
    command: `DB_URL="jdbc:postgresql://dbhost:5432/production"\n\n# Check substring using double brackets and glob matching\nif [[ "$DB_URL" == *"postgresql"* ]]; then\n  echo "Database type identified as PostgreSQL."\nfi\n\n# Alternate search using case\ncase "$DB_URL" in\n  *oracle*) echo "Oracle database detected" ;;\n  *postgresql*) echo "Postgres database detected" ;;\n  *) echo "Unknown database" ;;\nesac`
  },
  {
    id: 222,
    title: "How to use command substitution ( $(command) ) in Bash?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Command substitution runs a specified command in a subshell and assigns its standard output to a variable or passes it inline. The modern syntax is \`$(command)\`, replacing the legacy backticks \`\`command\`\` syntax because it supports easy nesting.",
    command: `# Assign command output to a variable\nCURRENT_USER=$(whoami)\nSERVER_IP=$(hostname -I | awk '{print $1}')\n\necho "Running audit on host $SERVER_IP as user $CURRENT_USER."\n\n# Nested command substitution\nARCHIVE_SIZE=$(du -sh "$(find /var/log -type f -name '*.gz' | head -n 1)" | awk '{print $1}')\necho "Size of first log archive: $ARCHIVE_SIZE"`
  },
  {
    id: 223,
    title: "How to define and call basic functions in a Bash script?",
    category: "shell scripting",
    difficulty: "easy",
    answer: "Functions modularize code. Define them using \`function_name() { ... }\` or \`function function_name { ... }\`.\n\nKey rules:\n• Functions must be defined *before* they are called.\n• Pass arguments like standard scripts ($1, $2).\n• Localize variables inside functions using the 'local' keyword to prevent global scope contamination.",
    command: `# Define a function to log messages with timestamps\nlog_message() {\n  local log_level=$1\n  local message=$2\n  echo "$(date '+%Y-%m-%d %H:%M:%S') [$log_level] $message"\n}\n\n# Call the function with arguments\nlog_message "INFO" "Starting database validation process."\nlog_message "WARNING" "Free space on /u01 is low."`
  },

  // ==========================================
  // MEDIUM QUESTIONS (13 new, IDs 224 to 236)
  // ==========================================
  {
    id: 224,
    title: "How to read a file line by line in Bash using a while loop?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To read a text file line-by-line safely, combine a \`while read -r\` loop with input redirection. The \`-r\` option prevents backslash character escapes from being interpreted. Clearing the Internal Field Separator (IFS=) prevents leading/trailing whitespace trimming.",
    command: `# Read database server IP list from a config file\nCONFIG_FILE="/tmp/servers.txt"\necho -e "10.0.1.5\\n10.0.1.6\\n10.0.1.7" > "$CONFIG_FILE"\n\nwhile IFS= read -r line; do\n  # Skip empty lines or commented lines\n  [[ -z "$line" || "$line" =~ ^# ]] && continue\n  echo "Checking node connection to: $line"\n  ssh -o ConnectTimeout=2 "admin@$line" "uptime" < /dev/null\ndone < "$CONFIG_FILE"`
  },
  {
    id: 225,
    title: "Handling options and flags in shell scripts using getopts",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The built-in \`getopts\` utility parses command-line flags and options in a loop. It supports single-character flags (e.g. -f, -v). A colon after a flag letter indicates that the option requires an argument (stored in $OPTARG).",
    command: `# Parse script configurations\nwhile getopts "h:p:v" opt; do\n  case "$opt" in\n    h) HOST="$OPTARG" ;;\n    p) PORT="$OPTARG" ;;\n    v) VERBOSE=true ;;\n    *) echo "Invalid option" ;;\n  esac\ndone\n\necho "Configured host: $HOST, port: $PORT, verbose: \${VERBOSE:-false}"`
  },
  {
    id: 226,
    title: "How to debug a shell script using bash shell options?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To diagnose issues in complex scripts, enable bash debugging settings at the top of your script using 'set':\n• set -x: Prints every command before executing it (execution trace).\n• set -e: Terminates the script immediately if any command fails (non-zero status).\n• set -u: Terminates script if an unbound/undefined variable is evaluated.\n• set -o pipefail: Returns the exit status of the first failed command in a pipeline.",
    command: `#!/bin/bash\n# Enable strict debugging settings\nset -euo pipefail\nset -x\n\n# This failed command will stop the script immediately due to 'set -e'\nls /non_existent_folder\n\necho "This line will never execute."`
  },
  {
    id: 227,
    title: "Dynamic temporary file creation using mktemp and cleanup using trap",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Hardcoding temporary file paths (like /tmp/output.txt) can lead to file clashes or security risks. Use \`mktemp\` to create secure, unique temp files. To ensure these files are cleaned up if the script crashes or completes, bind a cleanup function using the \`trap\` command.",
    command: `# Create a secure temporary file\nTEMP_FILE=$(mktemp /tmp/db_audit.XXXXXX)\n\n# Define cleanup action\ncleanup() {\n  echo "Cleaning up temp files..."\n  rm -f "$TEMP_FILE"\n}\n\n# Trap signals (Exit, Interrupt, Terminate)\ntrap cleanup EXIT INT TERM\n\n# Execute operations using the secure temp file\necho "Running query..." > "$TEMP_FILE"\ncat "$TEMP_FILE"`
  },
  {
    id: 228,
    title: "String manipulation and substring extraction in Bash without external tools",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash has powerful built-in parameter expansion patterns. This is far faster than invoking external tools like \`sed\`, \`awk\`, or \`cut\` in loops:\n• \${var#pattern}: Removes shortest match of pattern from start.\n• \${var##pattern}: Removes longest match of pattern from start.\n• \${var%pattern}: Removes shortest match of pattern from end.\n• \${var%%pattern}: Removes longest match of pattern from end.\n• \${var/pattern/replacement}: Replaces first match.\n• \${var//pattern/replacement}: Replaces all matches.",
    command: `FILE_PATH="/var/log/oracle/alert_DBA.log"\n\n# Extract directory path (remove everything after last slash)\nDIR_PATH="\${FILE_PATH%/*}"\necho "Dir: $DIR_PATH" # /var/log/oracle\n\n# Extract filename (remove everything before last slash)\nFILE_NAME="\${FILE_PATH##*/}"\necho "File: $FILE_NAME" # alert_DBA.log\n\n# Extract file extension\nEXT="\${FILE_NAME##*.}"\necho "Ext: $EXT" # log`
  },
  {
    id: 229,
    title: "How to check if a command exists in the system path before executing it?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Before calling external tools (like \`jq\`, \`git\`, or \`docker\`), check if they are installed. Avoid parsing \`which\`, as it acts inconsistently across Linux distros. Instead, use the shell built-in commands \`command -v\`, \`type\`, or \`hash\`.",
    command: `# Check if jq is installed in the system path\nif ! command -v jq &> /dev/null; then\n  echo "ERROR: 'jq' utility is not installed. Exiting." >&2\n  exit 1\nfi\n\n# Safe to proceed with jq commands\necho '{"status":"ok"}' | jq .status`
  },
  {
    id: 230,
    title: "Working with indexed arrays in Bash",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Bash supports 1-dimensional indexed arrays. You can declare and manipulate them using standard array syntax:\n• Declare: \`declare -a my_array\` or \`my_array=(val1 val2 val3)\`.\n• Access item: \`\${my_array[index]}\`.\n• Access all items: \`\${my_array[@]}\`.\n• Array size: \`\${#my_array[@]}\`.\n• Append item: \`my_array+=(\"new_val\")\`.",
    command: `# Define array of target databases\ndatabases=("prod_db" "uat_db" "test_db")\n\n# Append a database\ndatabases+=("dev_db")\n\n# Print array size\necho "Total DBs to backup: \${#databases[@]}"\n\n# Iterate through the array\nfor db in "\${databases[@]}"; do\n  echo "Running RMAN backup for $db..."\ndone`
  },
  {
    id: 231,
    title: "How to perform floating point arithmetic in Bash using bc?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "Since Bash only supports integers (e.g. 5/2 = 2), you must delegate floating-point operations to an external utility like \`bc\` (Basic Calculator) using piping. Use the 'scale' parameter in bc to define decimal precision.",
    command: `# Divide 5 by 2 with 2 decimal precision\nresult=$(echo "scale=2; 5 / 2" | bc)\necho "Result: $result" # 2.50\n\n# Perform complex float calculations dynamically\nused_mem=15420\ntotal_mem=16384\npct_mem=$(echo "scale=4; ($used_mem / $total_mem) * 100" | bc)\necho "Memory consumption percentage: $pct_mem%"`
  },
  {
    id: 232,
    title: "Pattern matching and replacement in files using sed in-place",
    category: "shell scripting",
    difficulty: "medium",
    answer: "\`sed\` (Stream Editor) modifies text dynamically. Use the \`-i\` option to modify the target file directly (in-place) without redirects. In macOS, \`sed -i ''\` is required, while Linux accepts \`sed -i\`.",
    command: `# Create configuration file\necho "port = 8080" > /tmp/app.conf\necho "db_host = localhost" >> /tmp/app.conf\n\n# Replace 'localhost' with '10.0.1.25' in-place\nsed -i 's/localhost/10.0.1.25/g' /tmp/app.conf\n\n# Replace port 8080 with 443\nsed -i 's/port = 8080/port = 443/g' /tmp/app.conf\n\ncat /tmp/app.conf`
  },
  {
    id: 233,
    title: "Extracting columns and formatting report text using awk",
    category: "shell scripting",
    difficulty: "medium",
    answer: "\`awk\` is a text-processing utility designed for data extraction. By default, it splits lines into positional variables ($1, $2...) based on whitespace fields. Use the \`-F\` flag to change the field separator (e.g. colon for /etc/passwd).",
    command: `# Get usernames and home paths of system accounts (split by colon)\nawk -F: '$3 >= 1000 {print "User: " $1 "\\tHome: " $6}' /etc/passwd\n\n# Calculate the total memory size of all files listed by ls -l\nls -l | awk '{sum += $5} END {print "Total Size: " sum / 1024 / 1024 " MB"}'`
  },
  {
    id: 234,
    title: "How to set script timeout and kill hung processes in Bash?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To prevent automation scripts from hanging indefinitely on network calls or stuck database connections, wrap the process in a timeout threshold using the Linux \`timeout\` command, which sends SIGTERM or SIGKILL if the process exceeds the time limit.",
    command: `# Run backup script with 10 seconds timeout limit\ntimeout 10s rsync -avz /data/ backup_user@remotehost:/storage/\nSTATUS=$?\n\nif [ $STATUS -eq 124 ]; then\n  echo "ERROR: Backup timed out after 10 seconds." >&2\nelse\n  echo "Backup finished with status $STATUS."\nfi`
  },
  {
    id: 235,
    title: "Using the select statement to build interactive text-based menus",
    category: "shell scripting",
    difficulty: "medium",
    answer: "The \`select\` statement is a bash built-in loop that creates dynamic text-based menus. It displays a list of options with numeric indices, prompts the user (using the PS3 string), and stores the user's choice in a variable.",
    command: `# Configure prompt message\nPS3="Select a DBA action: "\n\nselect opt in "Start Database" "Stop Database" "Check Status" "Exit"; do\n  case "$opt" in\n    "Start Database") echo "Initializing startup..." ;;\n    "Stop Database") echo "Shutting down..." ;;\n    "Check Status") uptime ;;\n    "Exit") break ;;\n    *) echo "Invalid option $REPLY" ;;\n  esac\ndone`
  },
  {
    id: 236,
    title: "How to run multiple background jobs and wait for all of them to complete?",
    category: "shell scripting",
    difficulty: "medium",
    answer: "To run tasks in parallel, append the ampersand character \`&\` to push them to the background. To block script execution until all concurrent background tasks finish, use the built-in \`wait\` command.",
    command: `# Define worker tasks\nrun_backup() {\n  echo "Starting backup $1..."\n  sleep 2\n  echo "Finished backup $1."\n}\n\n# Trigger 3 background workers concurrently\nrun_backup "ora_db" &\nrun_backup "pg_db" &\nrun_backup "mysql_db" &\n\n# Wait for all background PIDs to complete\necho "Waiting for database backups to complete..."\nwait\necho "All backups completed successfully."`
  },

  // ==========================================
  // HARD QUESTIONS (19 new, IDs 237 to 255)
  // ==========================================
  {
    id: 237,
    title: "Implementing safe, production-grade Bash scripts using Strict Mode",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Standard Bash behavior is permissive: it skips missing variables, continues executing scripts if a middle step fails, and masks pipe errors. Production automation scripts should use the 'Unofficial Bash Strict Mode' at the top of the file to force immediate, clean crashes if an anomaly occurs.\n\nSettings:\n• set -e: Fail fast.\n• set -u: Block undefined variables.\n• set -o pipefail: Capture pipeline errors.\n• IFS=$'\\n\\t': Internal Field Separator set to split *only* on newlines and tabs (prevents spaces in filenames from breaking loops).",
    command: `#!/bin/bash\n# Unofficial Bash Strict Mode\nset -euo pipefail\nIFS=$'\\n\\t'\n\n# Clean directory scan without splitting on space\nfor file in $(find . -maxdepth 1 -type f); do\n  echo "Safe check: $file"\ndone`
  },
  {
    id: 238,
    title: "Writing a script to monitor database CPU/memory usage and kill runaway queries",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Under heavy database loads, bad SQL executions can consume 100% CPU. You can write a daemonized shell script that audits process resources via 'ps', filters out runaway queries running longer than a threshold (e.g. 5 minutes), and terminates them.",
    command: `#!/bin/bash\nset -eu\n\n# Define thresholds\nCPU_LIMIT=90\nTIME_LIMIT=300 # 5 minutes\n\n# Scan processes using ps\nps -eo pid,pcpu,etime,comm | grep -E 'postgres|oracle' | while read -r pid cpu etime comm; do\n  # Convert elapsed time (etime format: DD-HH:MM:SS or MM:SS) to raw seconds\n  sec=$(echo "$etime" | awk -F: '{ if (NF==3) print $1*3600 + $2*60 + $3; else print $1*60 + $2 }')\n  \n  # Check if thresholds are breached\n  if (( $(echo "$cpu > $CPU_LIMIT" | bc) )) && [ "$sec" -gt "$TIME_LIMIT" ]; then\n    echo "WARNING: Runaway process PID $pid CPU $cpu% Time $etime. Terminating..." >&2\n    kill -15 "$pid"\n  fi\ndone`
  },
  {
    id: 239,
    title: "Parsing JSON configuration files in Bash using jq with error handling",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Parsing JSON files inside shell scripts should use \`jq\` rather than regex or sed. Your script must validate that the JSON syntax is valid, handle missing fields, and capture execution errors safely.",
    command: `#!/bin/bash\nset -euo pipefail\n\nJSON_DATA='{"database":{"host":"dbhost","port":5432,"active":true}}'\n\n# Validate JSON structure\nif ! echo "$JSON_DATA" | jq empty 2>/dev/null; then\n  echo "ERROR: Invalid JSON configuration file." >&2\n  exit 1\nfi\n\n# Extract properties safely\nHOST=$(echo "$JSON_DATA" | jq -r '.database.host // empty')\nPORT=$(echo "$JSON_DATA" | jq -r '.database.port // 5432')\n\nif [ -z "$HOST" ]; then\n  echo "ERROR: Host parameters are missing in JSON." >&2\n  exit 1\nfi\n\necho "Configured connection to $HOST on port $PORT"`
  },
  {
    id: 240,
    title: "Implementing exponential backoff and retry logic in Bash",
    category: "shell scripting",
    difficulty: "hard",
    answer: "When integrating shell scripts with network APIs or database ports, temporary network blips can cause immediate failures. Writing a retry loop with exponential backoff introduces delays that increase exponentially (e.g. 2s, 4s, 8s, 16s...) between attempts, helping target servers recover.",
    command: `#!/bin/bash\n\nattempt_connect() {\n  local max_attempts=5\n  local attempt=1\n  local delay=2\n\n  while [ $attempt -le $max_attempts ]; do\n    echo "Connection attempt $attempt of $max_attempts..."\n    \n    # Simulate network connection check\n    if curl -s -m 2 http://dbhost:8080 >/dev/null; then\n      echo "Connected successfully!"\n      return 0\n    fi\n\n    echo "Failed to connect. Retrying in $delay seconds..."\n    sleep "$delay"\n    attempt=$((attempt + 1))\n    delay=$((delay * 2)) # Double the delay\n  done\n\n  echo "ERROR: Connection failed after $max_attempts attempts." >&2\n  return 1\n}`
  },
  {
    id: 241,
    title: "Writing a multi-threaded parallel file processor using xargs",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Processing millions of files (e.g., compressing rotated logs) sequentially is slow. You can use \`xargs\` with the \`-P\` option to run multiple worker threads in parallel, utilizing all available CPU cores.",
    command: `# Find all .dmp files and compress them using 4 concurrent threads\nfind /u01/backups -type f -name "*.dmp" -print0 | xargs -0 -P 4 -n 1 gzip\n\n# Explanation:\n# -print0 and -0: Delimit filenames with null characters to handle spaces safely\n# -P 4: Spawn up to 4 parallel processes\n# -n 1: Pass exactly 1 file to each gzip execution`
  },
  {
    id: 242,
    title: "Dynamic configuration loading from environment files with default fallbacks",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Standard practice is to load variables from a local \`.env\` file. A production script should check if the file exists, parse it without using dangerous \`source\` commands (which can execute arbitrary malicious code hidden in the file), and set default fallback values for unset parameters.",
    command: `#!/bin/bash\nset -euo pipefail\n\nENV_FILE="/tmp/.env"\necho "DB_PORT=5432" > "$ENV_FILE"\n\n# Load variables manually avoiding source\nif [ -f "$ENV_FILE" ]; then\n  while IFS= read -r line || [[ -n "$line" ]]; do\n    # Skip comments and empty lines\n    [[ "$line" =~ ^# || -z "$line" ]] && continue\n    # Export variable name and value\n    export "$line"\n  done < "$ENV_FILE"\nfi\n\n# Set fallbacks using parameter expansion\nDB_HOST="\${DB_HOST:-localhost}"\nDB_PORT="\${DB_PORT:-1521}"\n\necho "Host: $DB_HOST, Port: $DB_PORT"`
  },
  {
    id: 243,
    title: "Writing a database replication delay checker and email alert notifier",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Replication lag indicates synchronization bottlenecks on standby databases. Write a shell script that runs in cron, queries database lag metrics, and triggers alerts via mailx or mail if lag exceeds critical bounds.",
    command: `#!/bin/bash\nset -euo pipefail\n\n# Query Postgres replication lag in seconds\nLAG_SECONDS=$(psql -At -c "SELECT COALESCE(EXTRACT(epoch FROM pg_last_xact_replay_timestamp() - now()), 0)::int" -U postgres || echo 999)\n\n# Absolute value\nLAG_ABS=$(( LAG_SECONDS < 0 ? -LAG_SECONDS : LAG_SECONDS ))\n\nCRITICAL_LIMIT=60\n\nif [ "$LAG_ABS" -gt "$CRITICAL_LIMIT" ]; then\n  echo "CRITICAL: Replication lag is $LAG_ABS seconds!" | mail -s "ALERT: Replication Lag Warning" dba_alerts@company.com\nfi`
  },
  {
    id: 244,
    title: "Synchronizing backups using rsync with SSH key integration and lock protection",
    category: "shell scripting",
    difficulty: "hard",
    answer: "A production sync script must ensure that only one instance of the sync job runs at a time (preventing overlapping transfers). Use \`flock\` to create a file lock. The script should run rsync securely using SSH keys, compressing data dynamically.",
    command: `#!/bin/bash\nset -euo pipefail\n\nLOCK_FILE="/var/run/db_sync.lock"\n\n# Force execution using lock descriptor\nexec 9>"$LOCK_FILE"\nif ! flock -n 9; then\n  echo "ERROR: Another backup sync process is already running." >&2\n  exit 1\nfi\n\n# Sync command using SSH\nrsync -e "ssh -i /home/backup_user/.ssh/id_rsa -o StrictHostKeyChecking=accept-new" \\\n  -avz --delete /u01/backups/ backup_user@remotehost:/storage/db_backups/\n\n# Release lock\nflock -u 9`
  },
  {
    id: 245,
    title: "Implementing a database schema migration runner script with rollback support",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Automating schema updates requires executing SQL scripts sequentially. Your script must track executed files in a migration log table inside the database, wrap each migration run in a transaction, and support rollback hooks if an error occurs.",
    command: `#!/bin/bash\nset -euo pipefail\n\nMIGRATION_DIR="/opt/migrations"\npotential_migrations=$(find "$MIGRATION_DIR" -type f -name "*.sql" | sort)\n\n# Loop through migrations\nfor sql_file in $potential_migrations; do\n  # Check if migration was already executed\n  mig_name=$(basename "$sql_file")\n  check=$(psql -At -c "SELECT count(*) FROM schema_migrations WHERE version='$mig_name'")\n  \n  if [ "$check" -eq 0 ]; then\n    echo "Running migration $mig_name..."\n    # Wrap execution inside transactional block\n    psql -1 -f "$sql_file" && \\\n    psql -c "INSERT INTO schema_migrations (version) VALUES ('$mig_name')"\n  fi\ndone`
  },
  {
    id: 246,
    title: "Creating a self-extracting archive or installer script using Bash payload concatenation",
    category: "shell scripting",
    difficulty: "hard",
    answer: "You can create a single installer script (.run file) that contains both the Bash installation logic and a binary tar payload concatenated at the end of the text file. The script parses its own file, locates the payload divider (e.g. \`__ARCHIVE_FOLLOWS__\`), extracts it, and decompresses it.",
    command: `#!/bin/bash\n# Self-Extracting Installer Script Blueprint\nset -eu\n\n# Find the index line where binary payload starts\nPAYLOAD_LINE=$(awk '/^__ARCHIVE_FOLLOWS__/ {print NR + 1; exit 0;}' "$0")\n\n# Create temp extraction folder\ntmp_dir=$(mktemp -d)\n\n# Extract and decompress payload\ntail -n +"$PAYLOAD_LINE" "$0" | tar -xz -C "$tmp_dir"\n\n# Run setup logic\ncd "$tmp_dir" && ./install.sh\n\n# Exit before execution flows into binary data\nexit 0\n__ARCHIVE_FOLLOWS__\n# (Binary tar.gz data is concatenated directly below this marker)`
  },
  {
    id: 247,
    title: "Parsing XML configuration files in Bash using xmllint",
    category: "shell scripting",
    difficulty: "hard",
    answer: "XML files should not be parsed with fragile regex or sed tools. Use the command-line utility \`xmllint\` with XPath queries to isolate and extract nested tags or attributes safely.",
    command: `# Sample XML file\ncat << 'EOF' > /tmp/web.xml\n<web-app>\n  <servlet>\n    <servlet-name>Controller</servlet-name>\n    <servlet-class>com.app.Controller</servlet-class>\n  </servlet>\n</web-app>\nEOF\n\n# Query servlet class using XPath\nSERVLET_CLASS=$(xmllint --xpath "string(/web-app/servlet/servlet-class)" /tmp/web.xml)\necho "Servlet Class: $SERVLET_CLASS"`
  },
  {
    id: 248,
    title: "Implementing custom log levels with terminal colors and syslogging",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Production scripts should write logs to files and standard stream channels simultaneously. Create a custom log function that writes color-coded outputs to stdout/stderr (for terminal sessions) and forwards logs directly to the system logs daemon using \`logger\`.",
    command: `#!/bin/bash\n\nlog() {\n  local level=$1\n  local msg=$2\n  local color=""\n  \n  case "$level" in\n    "INFO")  color="\\e[32m" ;; # Green\n    "WARN")  color="\\e[33m" ;; # Yellow\n    "ERROR") color="\\e[31m" ;; # Red\n  esac\n  \n  # Print colorized logs to stdout/stderr\n  echo -e "\${color}[$(date +'%Y-%m-%d %H:%M:%S')] [\$level] \$msg\\e[0m"\n  \n  # Forward log to system log daemon (syslog)\n  logger -t "DB_SCRIPT" "[\$level] \$msg"\n}\n\nlog "INFO" "Logs initialized."\nlog "ERROR" "Failed to connect to RDS database."`
  },
  {
    id: 249,
    title: "Checking SSL certificate expiration dates and alerting via Slack Webhooks",
    category: "shell scripting",
    difficulty: "hard",
    answer: "Expired SSL certificates cause browser warnings and API drops. Write a shell script that pulls expiration metadata using \`openssl s_client\` for a domain list, calculates the days remaining, and sends JSON alerts via a Slack Webhook using \`curl\`.",
    command: `#!/bin/bash\nset -euo pipefail\n\nDOMAIN="google.com"\nSLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00/B00/X00"\n\n# Query expiration date\nexp_date=$(openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 </dev/null 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)\n\n# Convert to seconds\nexp_sec=$(date -d "$exp_date" +%s)\nnow_sec=$(date +%s)\ndiff_sec=$((exp_sec - now_sec))\ndays_left=$((diff_sec / 86400))\n\n# Trigger Slack notification if less than 30 days left\nif [ "$days_left" -lt 30 ]; then\n  payload="{\\"text\\": \\"WARNING: SSL Certificate for $DOMAIN expires in $days_left days!\\"}"\n  curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL"\nfi`
  },
  {
    id: 250,
    title: "Implementing a production backup rotation script",
    category: "shell scripting",
    difficulty: "hard",
    answer: "A standard backup policy retains recent daily backups, weekly archives, and monthly historical archives, removing older files to save storage. Write a script that checks timestamps and deletes files matching Grandfather-Father-Son retention parameters.",
    command: `#!/bin/bash\nset -eu\n\nBACKUP_DIR="/var/backups"\n\n# 1. Keep daily backups for 7 days\nfind "$BACKUP_DIR" -type f -name "daily_*" -mtime +7 -delete\n\n# 2. Keep weekly backups for 4 weeks (28 days)\nfind "$BACKUP_DIR" -type f -name "weekly_*" -mtime +28 -delete\n\n# 3. Keep monthly backups for 12 months (365 days)\nfind "$BACKUP_DIR" -type f -name "monthly_*" -mtime +365 -delete`
  },
  {
    id: 251,
    title: "How to daemonize a shell script to run as a persistent background process",
    category: "shell scripting",
    difficulty: "hard",
    answer: "To run a script as a daemon (background service) without using systemd:\n1. Redirect all standard input, output, and error streams to /dev/null or log files.\n2. Disassociate the process from the controlling terminal session using \`nohup\` or \`setsid\`.\n3. Write the background process ID (PID) to a PID file (/var/run/mydaemon.pid) so it can be managed (started/stopped) later.",
    command: `#!/bin/bash\nPID_FILE="/var/run/my_daemon.pid"\nLOG_FILE="/var/log/my_daemon.log"\n\nstart_daemon() {\n  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then\n    echo "Daemon already running."\n    exit 1\n  fi\n\n  # Start in background, decoupling terminal connections\n  nohup /usr/local/bin/daemon_loop.sh > "$LOG_FILE" 2>&1 &\n  echo $! > "$PID_FILE"\n  echo "Daemon started with PID $(cat "$PID_FILE")"\n}\n\nstop_daemon() {\n  if [ -f "$PID_FILE" ]; then\n    kill -15 "$(cat "$PID_FILE")"\n    rm -f "$PID_FILE"\n    echo "Daemon stopped."\n  fi\n}`
  },
  {
    id: 252,
    title: "Handling signals gracefully in complex scripts using trap",
    category: "shell scripting",
    difficulty: "hard",
    answer: "If a long-running batch processing script is terminated by a user (SIGINT / Ctrl+C) or standard shutdown (SIGTERM), it can leave half-written files, locked connections, or active background processes. Use \`trap\` to bind cleanups to specific signals, terminating children and cleaning locks safely.",
    command: `#!/bin/bash\nset -eu\n\n# Track background processes\nchildren_pids=""\n\ncleanup() {\n  echo "Signal received. Terminating child processes..."\n  for pid in $children_pids; do\n    kill -15 "$pid" 2>/dev/null || true\n  done\n  exit 1\n}\n\n# Bind SIGINT and SIGTERM\ntrap cleanup INT TERM\n\n# Spawn background workers\nsleep 100 &\nchildren_pids+=" $!"\nsleep 100 &\nchildren_pids+=" $!"\n\nwait`
  },
  {
    id: 253,
    title: "Writing a health check script for an Application Load Balancer target group",
    category: "shell scripting",
    difficulty: "hard",
    answer: "An internal health checker routes requests to application endpoints, audits response codes and latency, and updates local routing hosts if a backend becomes unresponsive. The script should query response metrics and compare them against threshold parameters.",
    command: `#!/bin/bash\nset -euo pipefail\n\nBACKEND_URL="http://10.0.1.15:8080/health"\nCONSECUTIVE_FAILURES_ALLOWED=3\nfail_count=0\n\nwhile true; do\n  # Get HTTP status code and request duration\n  http_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$BACKEND_URL" || echo "500")\n  \n  if [ "$http_status" -eq 200 ]; then\n    fail_count=0\n  else\n    fail_count=$((fail_count + 1))\n  fi\n\n  if [ "$fail_count" -ge "$CONSECUTIVE_FAILURES_ALLOWED" ]; then\n    echo "CRITICAL: Backend offline. Triggering failover..." >&2\n    # Trigger failover script/alert here\n    exit 1\n  fi\n  sleep 5\ndone`
  },
  {
    id: 254,
    title: "Auditing shell script execution using syslog forwarding and auditd",
    category: "shell scripting",
    difficulty: "hard",
    answer: "In high-security environments, you must track who executes administrative scripts and audit exactly what commands were run inside the script. You can configure syslog forwarding to send script traces directly to a centralized SIEM, and bind auditd rules to monitor execution activities.",
    command: `# 1. Forward bash history to syslog (add to /etc/bash.bashrc):\n# export PROMPT_COMMAND='RETRN_VAL=$?; logger -p local6.debug "$(whoami) [$$]: $(history 1 | sed "s/^[ ]*[0-9]*[ ]*//") [v=$RETRN_VAL]"'\n\n# 2. Add auditd rule to monitor executions of a deploy script\n# sudo auditctl -w /opt/deploy.sh -p x -k deploy_audit`
  },
  {
    id: 255,
    title: "Writing a script to parse access logs, count requests, and block IPs",
    category: "shell scripting",
    difficulty: "hard",
    answer: "To mitigate application-layer DDoS attacks, write a script that parses web access logs (like Nginx access.log), aggregates request counts by client IP within a short window, and dynamically appends drop rules to iptables if an IP exceeds thresholds (e.g. 500 requests/minute).",
    command: `#!/bin/bash\nLOG_FILE="/var/log/nginx/access.log"\nTHRESHOLD=500\n\n# Get requests in the last 1 minute, count by IP\ntail -n 10000 "$LOG_FILE" | awk '{print $1}' | sort | uniq -c | while read -r count ip; do\n  if [ "$count" -gt "$THRESHOLD" ]; then\n    # Check if IP is already blocked\n    if ! iptables -C INPUT -s "$ip" -j DROP &>/dev/null; then\n      echo "Blocking abusive IP: $ip ($count requests)"\n      iptables -A INPUT -s "$ip" -j DROP\n    fi\n  fi\ndone`
  }
];
