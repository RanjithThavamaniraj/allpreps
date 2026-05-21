export const devopsNewQuestions = [
  // ==========================================
  // EASY QUESTIONS (14 new, IDs 256 to 269)
  // ==========================================
  {
    id: 256,
    title: "What is CI/CD and what is its purpose?",
    category: "devops",
    difficulty: "easy",
    answer: "CI/CD stands for Continuous Integration and Continuous Delivery (or Deployment):\n• Continuous Integration (CI): Developers merge code changes into a central repository frequently. Each merge triggers automated builds and tests to identify bugs early.\n• Continuous Delivery/Deployment (CD): Automated release pipeline that deploys code to staging (Delivery) or directly to production (Deployment) once tests pass.\n\nPurpose: To speed up release cycles, minimize human errors, and ensure code is always in a deployable state.",
    command: `# Simple workflow representation:\n# Git Commit -> Trigger Webhook -> Run Tests -> Build Artifact -> Scan Vulnerabilities -> Deploy to Server`
  },
  {
    id: 257,
    title: "Explain Virtualization vs Containerization",
    category: "devops",
    difficulty: "easy",
    answer: "• Virtualization (VMs): Runs a full Guest OS on top of physical hardware using a Hypervisor (e.g. VMware, VirtualBox). Each VM has virtualized memory, CPU, and disk. They are heavy, slow to boot (minutes), and consume substantial resource overhead.\n• Containerization (Docker): Shares the host OS kernel and runs processes in isolated namespaces. Containers do not require a guest OS. They are extremely lightweight, boot in seconds, and share host resources efficiently.",
    command: `# View running processes inside a container (shares host kernel but isolated)\ndocker run -d --name test-container alpine sleep 3600\ndocker top test-container`
  },
  {
    id: 258,
    title: "What is Git and explain clone vs fork vs pull?",
    category: "devops",
    difficulty: "easy",
    answer: "Git is a distributed version control system to track file modifications.\n• Clone: Creates a local copy of a remote Git repository on your machine, linking your local repo back to the remote origin.\n• Fork: Creates a copy of a repository under *your* GitHub/GitLab account. You can make modifications without affecting the original project, then submit a Pull Request.\n• Pull: Fetches modifications from a remote repository and merges them into your active local branch.",
    command: `# Clone a repository\ngit clone https://github.com/app/allpreps.git\n\n# Fetch and merge latest changes from active remote branch\ngit pull origin main`
  },
  {
    id: 259,
    title: "What is Infrastructure as Code (IaC) and what are its benefits?",
    category: "devops",
    difficulty: "easy",
    answer: "Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure (VPCs, servers, databases, DNS) using machine-readable configuration files (like Terraform, CloudFormation, Ansible) instead of manual console actions.\n\nBenefits:\n• Consistency: Eliminates configuration drift.\n• Version Control: Infrastructure definitions can be committed to Git, reviewed, and rolled back.\n• Automation: Spawns complex infrastructures in minutes.",
    command: `# Example of declarative Terraform resource definition\n# resource "aws_instance" "app_server" {\n#   ami           = "ami-085fac801"\n#   instance_type = "t3.micro"\n# }`
  },
  {
    id: 260,
    title: "Explain the difference between YAML and JSON syntax rules",
    category: "devops",
    difficulty: "easy",
    answer: "YAML and JSON are serialization languages commonly used for config files (YAML for Kubernetes/Ansible/pipelines, JSON for APIs/Terraform states):\n• YAML: Uses indentation (spaces, never tabs) for structure. It is highly human-readable, supports comments (#), and has no brackets or braces.\n• JSON: Uses curly braces {} for objects, square brackets [] for arrays, and colons for key-value maps. Keys must be double-quoted. It does not support comments and is less human-readable.",
    command: `# YAML representation:\ndatabase:\n  host: dbhost\n  port: 5432\n\n# JSON equivalent:\n# {\n#   "database": {\n#     "host": "dbhost",\n#     "port": 5432\n#   }\n# }`
  },
  {
    id: 261,
    title: "What is a Dockerfile and explain its basic commands?",
    category: "devops",
    difficulty: "easy",
    answer: "A Dockerfile is a text document containing instructions to build a Docker image:\n• FROM: Sets the base image (e.g. ubuntu, alpine, node).\n• RUN: Runs a command during the image build phase (installs packages).\n• COPY: Copies local files from host machine to the image filesystem.\n• CMD: Specifies the default command to execute when the container starts.",
    command: `# Create a simple Dockerfile\ncat << 'EOF' > Dockerfile\nFROM alpine:3.18\nRUN apk add --no-cache curl\nCOPY app.sh /app.sh\nCMD ["sh", "/app.sh"]\nEOF`
  },
  {
    id: 262,
    title: "How do you list, stop, and remove Docker containers from the CLI?",
    category: "devops",
    difficulty: "easy",
    answer: "Docker provides CLI commands to manage container lifecycles:\n• docker ps: Lists running containers.\n• docker ps -a: Lists *all* containers (running and stopped).\n• docker stop [ID/Name]: Gracefully terminates a running container (SIGTERM).\n• docker rm [ID/Name]: Deletes a stopped container.\n• docker kill [ID/Name]: Forcefully kills a container (SIGKILL).",
    command: `# List active containers\ndocker ps\n\n# Stop a container named 'my-web-app'\ndocker stop my-web-app\n\n# Delete the stopped container\ndocker rm my-web-app\n\n# Delete all stopped containers at once\ndocker container prune -f`
  },
  {
    id: 263,
    title: "What is Kubernetes (K8s) and what is a Pod?",
    category: "devops",
    difficulty: "easy",
    answer: "Kubernetes is an open-source container orchestration platform designed to automate deploying, scaling, and managing containerized applications.\n\n• Pod: The smallest deployable unit in Kubernetes. A Pod hosts one or more containers (usually just one) that share network interfaces, storage volumes, and IP addresses. Containers within a Pod communicate using localhost.",
    command: `# List active pods in default namespace\nkubectl get pods\n\n# Describe details of a specific pod\nkubectl describe pod my-app-pod`
  },
  {
    id: 264,
    title: "What is a Jenkinsfile and explain declarative vs scripted pipeline syntax?",
    category: "devops",
    difficulty: "easy",
    answer: "A Jenkinsfile is a text file that contains the definition of a Jenkins Pipeline and is committed to source control.\n• Declarative Pipeline: Uses a structured, pre-defined format (stages, step, agent) which is easier to write and read. It has built-in syntax validation.\n• Scripted Pipeline: Uses Groovy script code. It is highly flexible but complex to write and maintain.",
    command: `# Minimal Declarative Pipeline structure:\n# pipeline {\n#   agent any\n#   stages {\n#     stage('Test') {\n#       steps { sh 'npm test' }\n#     }\n#   }\n# }`
  },
  {
    id: 265,
    title: "What is Prometheus and Grafana in DevOps monitoring?",
    category: "devops",
    difficulty: "easy",
    answer: "Prometheus and Grafana are open-source tools used for system observability:\n• Prometheus: A time-series database and monitoring tool. It pulls (scrapes) numeric metrics from targets at regular intervals, evaluates rule expressions, and triggers alerts.\n• Grafana: A visualization platform. It connects to Prometheus (and other databases) to build rich, interactive dashboards displaying graphs, CPU/Memory charts, and server statuses.",
    command: `# Check active Prometheus config file\n# cat /etc/prometheus/prometheus.yml`
  },
  {
    id: 266,
    title: "Explain Git branching strategy: Gitflow vs Trunk-Based Development",
    category: "devops",
    difficulty: "easy",
    answer: "• Gitflow: Multi-branch strategy. Developers work on 'feature' branches, merge to 'develop', release via 'release' branches, and merge to 'main' for production. It is highly controlled but slow and creates merge debt.\n• Trunk-Based Development: Modern CI/CD practice. Developers merge small, frequent commits into a single central branch ('trunk' or 'main') daily. Feature flags are used to hide incomplete features. It accelerates CI/CD pipelines.",
    command: `# Trunk-based simple flow:\n# git checkout main\n# git pull\n# git checkout -b feat/add-login\n# (write code) -> commit -> merge directly to main`
  },
  {
    id: 267,
    title: "Explain the difference between Docker CMD and ENTRYPOINT instructions",
    category: "devops",
    difficulty: "easy",
    answer: "Both define the execution command of a container, but interact differently when arguments are passed at runtime:\n• ENTRYPOINT: Configures the container to run as an executable. It cannot be overridden by standard docker run arguments (unless using --entrypoint).\n• CMD: Defines default arguments or commands. It can be easily overridden by appending commands to \`docker run\`.\nIf combined, CMD acts as default parameters appended to the ENTRYPOINT command.",
    command: `# In Dockerfile:\n# ENTRYPOINT ["ping"]\n# CMD ["8.8.8.8"]\n\n# Running container without args pings 8.8.8.8:\n# docker run my-ping-image\n\n# Running with args overrides CMD, pinging 1.1.1.1 instead:\n# docker run my-ping-image 1.1.1.1`
  },
  {
    id: 268,
    title: "What is Ansible and what is a Playbook?",
    category: "devops",
    difficulty: "easy",
    answer: "Ansible is an open-source, agentless configuration management tool. It connects to remote hosts over SSH (or WinRM) to install software, modify configurations, and manage user accounts.\n\n• Playbook: A YAML file containing one or more 'plays'. Each play defines the target host group and a sequential list of 'tasks' (e.g. install Nginx, copy config, start service) using built-in Ansible modules.",
    command: `# Execute an Ansible Playbook\nansible-playbook -i inventory.ini deploy_web.yml`
  },
  {
    id: 269,
    title: "Explain Microservices architecture vs Monolithic",
    category: "devops",
    difficulty: "easy",
    answer: "• Monolithic Architecture: The entire application (UI, business logic, database access) is built, packaged, and deployed as a single unit. It is simple to develop but hard to scale, scale limits block progress, and a single bug can crash the entire system.\n• Microservices Architecture: The application is split into small, independent services (e.g. payment service, user service) communicating via lightweight protocols (REST, gRPC, message queues). Each service has its own database, can be written in different languages, and scales independently.",
    command: `# Microservices layout:\n# UI Gateway -> Auth Service (DB1) & Payment Service (DB2) & Email Queue`
  },

  // ==========================================
  // MEDIUM QUESTIONS (14 new, IDs 270 to 283)
  // ==========================================
  {
    id: 270,
    title: "Explain Kubernetes Services: ClusterIP vs NodePort vs LoadBalancer",
    category: "devops",
    difficulty: "medium",
    answer: "Kubernetes Pods are ephemeral (they die and get recreated with new IP addresses). Services provide a stable network endpoint to route traffic to active Pods:\n• ClusterIP (Default): Exposes the service on a private internal cluster IP. It is accessible only from inside the Kubernetes cluster.\n• NodePort: Exposes the service on a static port (30000-32767) on each Node's IP. External traffic can access the service by calling Node_IP:NodePort.\n• LoadBalancer: Integrates with cloud providers (AWS, GCP) to automatically provision a public-facing cloud load balancer routing directly to NodePorts.",
    command: `# Expose a deployment named 'my-web' via NodePort\nkubectl expose deployment my-web --type=NodePort --port=80 --target-port=8080\n\n# Get service status and exposed ports\nkubectl get svc`
  },
  {
    id: 271,
    title: "How do you optimize Docker image sizes using multi-stage builds?",
    category: "devops",
    difficulty: "medium",
    answer: "Standard Docker builds package compilers, test tools, and source code into the final image, bloating sizes (e.g. Node SDK is 1GB+). Multi-stage builds use multiple FROM instructions in a single Dockerfile. You compile code in a heavy 'build' stage, and then copy *only* the compiled binary/dist folder into a lightweight 'runtime' stage (e.g., alpine or distroless), stripping out compilers and source code.",
    command: `# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80`
  },
  {
    id: 272,
    title: "What is Docker Volume and difference between bind mount vs named volume?",
    category: "devops",
    difficulty: "medium",
    answer: "By default, files created inside a container are ephemeral and get deleted when the container exits. Volumes persist container data outside the container filesystem:\n• Bind Mount: Maps a specific, absolute path on the host system to a path inside the container. Best for local development (syncing code changes instantly).\n• Named Volume: Managed entirely by Docker. Docker stores the data in a dedicated folder (/var/lib/docker/volumes/) on the host. Best for production databases and backups since it prevents host OS directory conflicts.",
    command: `# Run container with a bind mount\ndocker run -d -v /home/user/project:/app node:18\n\n# Run container with a named volume (created if missing)\ndocker run -d -v db_data:/var/lib/postgresql/data postgres:15-alpine`
  },
  {
    id: 273,
    title: "How to manage Kubernetes configurations using ConfigMaps and Secrets?",
    category: "devops",
    difficulty: "medium",
    answer: "Decoupling config parameters from container images ensures portability across Dev, Staging, and Prod environments:\n• ConfigMap: Stores non-sensitive, plain-text key-value configurations (database hostnames, ports, environment flags).\n• Secret: Stores sensitive configurations (passwords, tokens, API keys) encoded in Base64. Secrets are stored in temp memory (tmpfs) on nodes, protecting them from disk exposure.\nBoth can be loaded as environment variables or mounted as files inside pods.",
    command: `# Create a ConfigMap from a literal value\nkubectl create configmap app-config --from-literal=DB_HOST=pgdb.local\n\n# Create a Secret\nkubectl create secret generic db-credentials --from-literal=password=SuperSecret\n\n# View secret (returns Base64 encoded value)\nkubectl get secret db-credentials -o yaml`
  },
  {
    id: 274,
    title: "Explain Blue-Green deployment vs Canary deployment strategies",
    category: "devops",
    difficulty: "medium",
    answer: "• Blue-Green Deployment: You maintain two identical environments. Blue is active (production), Green is standby. You deploy the new release to Green, run integration tests, and then swap router DNS/load balancer targets to point to Green. It provides instant rollback but is expensive as it requires doubling resource footprints.\n• Canary Deployment: You deploy the new release to a small subset of instances (e.g. 5% of traffic). You monitor error rates, CPU usage, and user behavior. If stable, you roll it out to 100% of servers. It minimizes blast radius of bugs.",
    command: `# Routing swap representation:\n# Router -> Blue (v1.0)\n# (Deploy v2.0 to Green) -> (Tests Pass) -> Swap Router to Green (v2.0)`
  },
  {
    id: 275,
    title: "What is Git merge vs rebase, and when should you use which?",
    category: "devops",
    difficulty: "medium",
    answer: "Both integrate commits from one branch into another:\n• Merge: Creates a new 'merge commit' combining the histories of both branches. It preserves the exact chronological history of work but can clutter the git tree with merge commits.\n• Rebase: Rewrites commits from the feature branch on top of the target branch's latest commit. It creates a clean, linear commit history, but it alters commit hashes. Rule of thumb: Never rebase public shared branches; only rebase local private branches to clean up work before merging.",
    command: `# Rebase feature branch on top of main\ngit checkout feature-login\ngit rebase main\n\n# If conflicts, resolve and run:\ngit rebase --continue`
  },
  {
    id: 276,
    title: "How do you handle secrets securely in Jenkins/GitHub Actions pipelines?",
    category: "devops",
    difficulty: "medium",
    answer: "Hardcoding passwords or SSH keys in pipeline scripts or committing them to git is a critical vulnerability. Instead:\n• GitHub Actions: Save secrets in Repository Settings under 'Secrets and variables'. Reference them in YAML as \`\${{ secrets.SECRET_NAME }}\`. GitHub masks these values in console outputs automatically.\n• Jenkins: Save secrets in the Credentials Manager. Bind credentials to environment variables using the \`withCredentials\` block in Jenkinsfiles.",
    command: `# In GitHub Actions pipeline YAML:\n# steps:\n#   - name: Deploy to Docker Hub\n#     env:\n#       DOCKER_PASSWORD: \${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}\n#     run: echo "$DOCKER_PASSWORD" | docker login -u user --password-stdin`
  },
  {
    id: 277,
    title: "What is Terraform state file and why is remote state locking important?",
    category: "devops",
    difficulty: "medium",
    answer: "Terraform saves the configuration mappings and metadata of the resources it manages to a local file called \`terraform.tfstate\`.\n\nRemote State and Locking:\n• Committing state to git exposes sensitive parameters (passwords are stored in plain text in the state file).\n• In a team, if two developers run \`terraform apply\` concurrently, it can lead to state corruption or duplicate resources.\n• Fix: Store the state file in a remote backend (e.g. S3) and configure remote locking using a database (e.g. DynamoDB) to lock access during runs.",
    command: `# Terraform backend configuration block:\n# terraform {\n#   backend "s3" {\n#     bucket         = "prod-terraform-state-bucket"\n#     key            = "vpc/terraform.tfstate"\n#     dynamodb_table = "terraform-locks"\n#   }\n# }`
  },
  {
    id: 278,
    title: "What is Ansible Inventory and dynamic inventories?",
    category: "devops",
    difficulty: "medium",
    answer: "• Ansible Inventory: A file (INI or YAML format) listing the hostnames, IP addresses, and group structures of target servers that Ansible connects to.\n• Dynamic Inventory: In cloud environments (AWS, GCP), instances scale up and down, changing IP addresses constantly, making static files obsolete. A dynamic inventory is an Ansible plugin/script that queries cloud API endpoints to automatically resolve and group hosts based on tags (e.g. environment:production).",
    command: `# Static Inventory (inventory.ini):\n# [web_servers]\n# 192.168.1.15 ansible_user=deploy\n# 192.168.1.16 ansible_user=deploy\n\n# Using AWS dynamic inventory plugin (aws_ec2):\n# ansible-playbook -i aws_ec2.yml deploy_web.yml`
  },
  {
    id: 279,
    title: "Explain Kubernetes ReplicaSet vs Deployment vs StatefulSet",
    category: "devops",
    difficulty: "medium",
    answer: "• ReplicaSet: Ensures a specified number of identical Pod replicas are running at all times. It replaces pods if they crash.\n• Deployment: Wraps around ReplicaSets. It provides declarative updates for Pods (rolling updates, rollbacks) and handles updates automatically.\n• StatefulSet: Used for stateful applications (databases like Postgres or Cassandra). Unlike deployments where pods have random names (app-58da-21), StatefulSet Pods have static, ordinal names (db-0, db-1). They maintain persistent volume mappings and scale in a strict sequential order.",
    command: `# Scale a deployment to 5 replicas\nkubectl scale deployment my-web-app --replicas=5\n\n# View StatefulSet pods (ordered ordinal IDs)\nkubectl get pods -l app=database`
  },
  {
    id: 280,
    title: "How to implement log aggregation using the ELK Stack?",
    category: "devops",
    difficulty: "medium",
    answer: "Log files scattered across hundreds of servers are difficult to search. The ELK Stack provides centralized log aggregation:\n• Filebeat/Logstash: Agents collect logs from servers and parse them.\n• Elasticsearch: A search engine that indexes and stores logs.\n• Kibana: A web interface to search logs using query expressions.",
    command: `# Search logs dynamically in elasticsearch via REST API\ncurl -X GET "localhost:9200/nginx-logs/_search?q=status:500&pretty"`
  },
  {
    id: 281,
    title: "What is Prometheus exporter and how do you monitor custom metrics?",
    category: "devops",
    difficulty: "medium",
    answer: "Prometheus does not monitor systems directly. It relies on Exporters (agents running on targets that translate local metrics to a text format Prometheus can parse):\n• Node Exporter: Collects hardware metrics (disk, CPU, RAM).\n• PostgreSQL/MySQL Exporter: Collects database active sessions, locks, and cache hit ratios.\n• Custom Application Metrics: Libraries expose an HTTP endpoint (usually /metrics) hosting counters or gauges.",
    command: `# Curl Node Exporter endpoint to see Prometheus formatting\ncurl http://localhost:9100/metrics | head -n 10\n\n# Example of output:\n# node_cpu_seconds_total{cpu="0",mode="idle"} 12450.8`
  },
  {
    id: 282,
    title: "Designing a simple CI pipeline in GitHub Actions",
    category: "devops",
    difficulty: "medium",
    answer: "GitHub Actions automates code checks via YAML files committed to \`.github/workflows/\`. The runner pulls the repository, installs dependencies, runs tests, and can compile Docker artifacts.",
    command: `# Create directory structure and add workflow file\nmkdir -p .github/workflows\ncat << 'EOF' > .github/workflows/ci.yml\nname: Node CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Install dependencies\n        run: npm ci\n      - name: Run Tests\n        run: npm test\nEOF`
  },
  {
    id: 283,
    title: "What is Helm and how do you manage Kubernetes applications?",
    category: "devops",
    difficulty: "medium",
    answer: "Helm is a package manager for Kubernetes. Managing apps using raw YAML files is hard because configuring different parameters for Dev/Staging requires duplicating code.\n• Helm Charts: Packages of parameterized template files.\n• values.yaml: A file containing values applied to templates.\n• Releases: Installed instances of charts. Supports quick upgrades/rollbacks.",
    command: `# Add public repo and install a Redis cluster using Helm\nhelm repo add bitnami https://charts.bitnami.com/bitnami\nhelm install my-redis bitnami/redis --set auth.password=secret\n\n# Rollback to revision 1\nhelm rollback my-redis 1`
  },

  // ==========================================
  // HARD QUESTIONS (17 new, IDs 284 to 300)
  // ==========================================
  {
    id: 284,
    title: "Troubleshooting Kubernetes Pod stuck in CrashLoopBackOff status",
    category: "devops",
    difficulty: "hard",
    answer: "CrashLoopBackOff indicates the Pod starts, encounters a fatal error, crashes, and Kubernetes attempts to restart it repeatedly with an exponential delay.\n\nDiagnostics steps:\n1. Inspect pod events: Run \`kubectl describe pod [pod_name]\` to see if there are OOM kills or liveness probe failures.\n2. Fetch container logs: Run \`kubectl logs [pod_name] --previous\` to print the error output before the crash.\n3. Common causes: Missing environment variables, database port connection drops, file permission errors, or syntax runtime crashes.",
    command: `# Check events and container statuses\nkubectl describe pod my-api-pod\n\n# View logs of the crashed container instance\nkubectl logs my-api-pod --previous\n\n# Run dynamic shell debug container in the pod's network (ephemeral container)\n# kubectl debug -it my-api-pod --image=busybox`
  },
  {
    id: 285,
    title: "Designing secure rolling updates in Kubernetes using probes",
    category: "devops",
    difficulty: "hard",
    answer: "A production rolling update must not drop connections or route traffic to uninitialized pods. Configure Deployment rolling update limits alongside proper container health checks:\n• Readiness Probe: Determines if the container is ready to accept traffic. If it fails, the pod is removed from Service endpoints.\n• Liveness Probe: Determines if the container needs to be restarted. If it fails, the container is killed and restarted.\n• Startup Probe: Disables liveness/readiness probes during initial startup to prevent premature kills of slow-booting apps.\n• maxSurge and maxUnavailable: Controls how many pods are created and destroyed during deployment rolling transitions.",
    command: `# Deployment yaml snippet configuration:\n# spec:\n#   strategy:\n#     type: RollingUpdate\n#     rollingUpdate:\n#       maxSurge: 25%\n#       maxUnavailable: 0\n#   template:\n#     spec:\n#       containers:\n#         - name: web\n#           readinessProbe:\n#             httpGet:\n#               path: /healthz\n#               port: 8080\n#             initialDelaySeconds: 5\n#             periodSeconds: 10`
  },
  {
    id: 286,
    title: "Writing Terraform code to provision a highly available VPC",
    category: "devops",
    difficulty: "hard",
    answer: "Provisioning a multi-AZ VPC requires dynamically mapping resources. Best practices include modularizing subnets across availability zones, routing private traffic through NAT Gateways, and locking state changes using DynamoDB.",
    command: `# Run terraform commands\n# Initialize working directory, downloading AWS plugins\nterraform init\n\n# Show resource execution plans to verify configurations\nterraform plan\n\n# Apply modifications to provision the VPC infrastructure\n# terraform apply -auto-approve`
  },
  {
    id: 287,
    title: "Designing a GitOps continuous delivery pipeline using ArgoCD",
    category: "devops",
    difficulty: "hard",
    answer: "GitOps uses Git repositories as the Single Source of Truth for infrastructure states. In push pipelines, CI environments deploy changes. In pull-based GitOps (ArgoCD), an agent runs in the Kubernetes cluster. It polls the Git repository for changes, compares the declared manifest state against the live cluster state, and automatically reconciles deviations (pruning orphan resources). This eliminates the need to expose Kubernetes cluster credentials to CI environments.",
    command: `# Log into ArgoCD server CLI\nargocd login argocd.company.com --username admin --password secret\n\n# Create application to sync deployment manifest repo to cluster namespace\nargocd app create prod-web-app \\\n  --repo https://github.com/app/deploy-manifests.git \\\n  --path overlays/production \\\n  --dest-server https://kubernetes.default.svc \\\n  --dest-namespace production \\\n  --sync-policy auto`
  },
  {
    id: 288,
    title: "Troubleshooting Docker network interface drops and MTU mismatch errors",
    category: "devops",
    difficulty: "hard",
    answer: "Network timeouts or connection freezes (large payloads drop, small payloads succeed) between containers and external networks often indicate Maximum Transmission Unit (MTU) mismatches. If physical network switches restrict packet frames (e.g. overlay networks like vxlan caps frames at 1450 bytes) but Docker defaults interfaces to 1500 bytes, packets get fragmented or silently dropped.\n\nResolution:\n• Configure custom MTU settings in \`/etc/docker/daemon.json\` to match physical interfaces.\n• Restart the Docker daemon and verify bridge network interfaces.",
    command: `# View current network interfaces and MTU sizes\nip link show\n\n# Set custom docker MTU in daemon.json:\n# {\n#   "mtu": 1450\n# }\n# Restart service:\n# sudo systemctl restart docker`
  },
  {
    id: 289,
    title: "Implementing container security scanning in CI/CD pipelines using Trivy",
    category: "devops",
    difficulty: "hard",
    answer: "Production pipelines must identify security issues before pushing images to registries. Integrate vulnerability scanners (like Trivy) to audit base packages, library dependencies, and look for secrets committed in code. The pipeline should crash if high or critical vulnerabilities are discovered.",
    command: `# Scan code repository for vulnerabilities and secrets\ntrivy fs .\n\n# Scan a built Docker image, exit with code 1 if critical issues exist\ntrivy image --severity HIGH,CRITICAL --exit-code 1 my-app:latest`
  },
  {
    id: 290,
    title: "Configuring Ansible roles and vault encryption for multi-environment deployments",
    category: "devops",
    difficulty: "hard",
    answer: "Structuring complex playbooks requires creating Ansible Roles (modular directories separating tasks, variables, files, templates, and handlers). To manage sensitive values (database passwords, private keys), use \`ansible-vault\` to encrypt files. The playbook decrypts secrets in memory during executions.",
    command: `# Create vault file containing passwords\nansible-vault create vars/prod_secrets.yml\n\n# Run playbook passing vault password file\nansible-playbook -i inventories/production/hosts site.yml --vault-password-file ~/.vault_pass.txt`
  },
  {
    id: 291,
    title: "Scaling Kubernetes nodes dynamically using Karpenter vs Cluster Autoscaler",
    category: "devops",
    difficulty: "hard",
    answer: "• Cluster Autoscaler: Standard scaling tool. It monitors for pods that cannot schedule due to resource constraints, calls cloud provider APIs to add instances to Auto Scaling Groups (ASGs). Scaling is slow (minutes) and bound by fixed instance group definitions.\n• Karpenter: Modern, high-performance node provisioner developed for AWS EKS. It operates agentless, bypasses ASGs, and directly evaluates scheduling constraints. Karpenter launches optimal, mixed-type EC2 instances directly to match pod requirements (bin-packing), improving scale times to seconds.",
    command: `# Get Karpenter configuration CRDs\nkubectl get provisioners -A 2>/dev/null || echo "Karpenter not installed"`
  },
  {
    id: 292,
    title: "Designing a distributed tracing system using OpenTelemetry",
    category: "devops",
    difficulty: "hard",
    answer: "In microservices, identifying performance bottlenecks requires distributed tracing. OpenTelemetry provides standard SDKs to instrument applications. The SDK injects tracing contexts (traceparent header) into outgoing HTTP/gRPC requests. Internal calls generate Span records, forwarded to an OpenTelemetry Collector. The collector buffers, filters, and forwards traces to backends like Jaeger or Zipkin.",
    command: `# Trace context injection header standard format:\n# traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
  },
  {
    id: 293,
    title: "Troubleshooting Terraform state lockouts and resolving state corruption",
    category: "devops",
    difficulty: "hard",
    answer: "If a terraform execution crashes, gets killed, or network connectivity drops during an update, the DynamoDB lock remains active, blocking all future runs with a 'State Locked' error.\n\nResolution:\n1. Copy the Lock Info ID from the terminal error message.\n2. Force unlock the lock dynamically using the ID.\n3. If state corruption occurs, never edit the raw state file manually. Use \`terraform state\` subcommands to view, import, remove, or pull the state database.",
    command: `# Force release a lock using lock ID\nterraform force-unlock 1234abcd-12ab-34cd-56ef-1234567890ab\n\n# Pull remote state file to local environment safely for review\nterraform state pull > state_debug.json\n\n# Remove a resource from state manually without destroying it\nterraform state rm aws_instance.old_server`
  },
  {
    id: 294,
    title: "Configuring Nginx Ingress Controllers with cert-manager for Let's Encrypt SSL",
    category: "devops",
    difficulty: "hard",
    answer: "An Ingress Controller manages external traffic entering a Kubernetes cluster. cert-manager automates SSL certificate management. It registers custom resources (ClusterIssuers) validating ownership via HTTP-01 or DNS-01 challenges, contacts Let's Encrypt to sign certificates, and dynamically provisions Kubernetes TLS secrets used by Nginx Ingress to secure routes.",
    command: `# Check active cert-manager issuers\nkubectl get clusterissuers\n\n# Check certificate renewal status\nkubectl get certificates -A`
  },
  {
    id: 295,
    title: "Implementing Mutual TLS (mTLS) and Traffic Policies using Istio Service Mesh",
    category: "devops",
    difficulty: "hard",
    answer: "In Kubernetes, pod-to-pod network traffic is unencrypted by default. Istio Service Mesh secures cluster traffic without modifying application code by injecting Envoy proxy sidecars. The proxy intercepts all inbound and outbound traffic, using a central control plane (Istiod) to distribute TLS certificates, enforce strict Mutual TLS (mTLS) configurations, and control service traffic policies (e.g. rate limiting or circuit breaking).",
    command: `# Enable Istio sidecar injection on a namespace\nkubectl label namespace default istio-injection=enabled\n\n# Apply PeerAuthentication rule to enforce strict mTLS\n# kubectl apply -f - <<EOF\n# apiVersion: security.istio.io/v1beta1\n# kind: PeerAuthentication\n# metadata:\n#   name: default\n# spec:\n#   mtu: STRICT\n# EOF`
  },
  {
    id: 296,
    title: "Troubleshooting Jenkins pipeline memory leaks and executor node optimization",
    category: "devops",
    difficulty: "hard",
    answer: "Jenkins runs on the JVM. Poorly written Groovy scripts (e.g. loops with large outputs, serializing non-serializable objects) can cause Metaspace or Heap exhaustion, crashing Jenkins with Out-Of-Memory (OOM) errors.\n\nOptimization:\n• Restrict master nodes from running build executions. Move tasks to remote agent nodes (using Docker containers or VM nodes).\n• Use Pipeline Shared Libraries to modularize code.\n• Tune garbage collection parameters and limit build log history sizes.",
    command: `# Example JVM arguments for Jenkins Master node in system configuration:\n# JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -Xms4g -Xmx8g -XX:MaxMetaspaceSize=1g"`
  },
  {
    id: 297,
    title: "Designing disaster recovery replication for Kubernetes using Velero backups",
    category: "devops",
    difficulty: "hard",
    answer: "Backing up Kubernetes objects requires capturing both resource manifests (deployments, configs) and physical data volumes. Velero is a backup tool that hooks into cloud APIs to create backups of cluster objects, alongside physical snapshots of PV storage volumes, exporting them to secure S3 vaults.",
    command: `# Install Velero CLI and trigger a cluster backup\nvelero backup create prod-cluster-backup --include-namespaces production\n\n# Describe backup logs and verify snapshot runs\nvelero backup describe prod-cluster-backup`
  },
  {
    id: 298,
    title: "Managing configurations securely using HashiCorp Vault",
    category: "devops",
    difficulty: "hard",
    answer: "HashiCorp Vault provides centralized secret management. Unlike static config files, Vault encrypts data transit dynamically, offers role-based access, and generates dynamic credentials (e.g. databases passwords valid for 1 hour). Applications authenticate to Vault via Kubernetes service accounts or IAM policies to retrieve secrets dynamically.",
    command: `# Read database secret from Vault CLI\nvault kv get secret/production/database`
  },
  {
    id: 299,
    title: "Troubleshooting high CPU/Memory resource starvation on Kubernetes worker nodes",
    category: "devops",
    difficulty: "hard",
    answer: "If worker nodes run out of memory or CPU, they begin evicting Pods. The kernel may trigger OOMKilled events. To prevent resource starvation, enforce LimitRanges and ResourceQuotas. Always define 'requests' (minimum resources guaranteed) and 'limits' (maximum ceiling resources) in Pod specs.",
    command: `# View node resource consumption\nkubectl top nodes\n\n# View pod resource consumption\nkubectl top pods -A\n\n# Check for evicted pods or system warnings\nkubectl get pods -A | grep -iE 'evicted|oomkilled'`
  },
  {
    id: 300,
    title: "Designing multi-region deployments in GitHub Actions using AWS OIDC role assumption",
    category: "devops",
    difficulty: "hard",
    answer: "Exposing permanent AWS Access Keys inside GitHub Actions is a security risk. Instead, configure an OpenID Connect (OIDC) trust relationship between GitHub and AWS. GitHub Actions requests a short-lived JWT token from GitHub's OIDC provider. The action then presents this token to AWS Security Token Service (STS) to assume an IAM Role dynamically, retrieving temporary credentials valid for 1 hour.",
    command: `# Workflow file configuration:\n# - name: Configure AWS Credentials\n#   uses: aws-actions/configure-aws-credentials@v2\n#   with:\n#     role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeployRole\n#     aws-region: us-east-1`
  }
];
