/**
 * Kubernetes interview question bank content for AllPreps.
 * 18 topics × 3 difficulties × 4 questions + 20 production scenarios.
 */

export const TOPIC_CONTENT = {
  containers: {
    easy: [
      {
        q: 'What is a container and how does it differ from a virtual machine?',
        a: 'A container packages an application and its dependencies into an isolated process namespace sharing the host kernel. Unlike VMs, containers do not include a guest OS — they start in seconds, use less memory, and achieve isolation via cgroups and namespaces (PID, network, mount, IPC, UTS). VMs provide stronger hardware-level isolation via hypervisors but with higher overhead. In Kubernetes, containers are the unit of execution inside Pods.',
        cmd: '# Compare container vs host resource usage\ndocker stats --no-stream\nkubectl top pod -A\nkubectl get nodes -o custom-columns=NAME:.metadata.name,CPU:.status.capacity.cpu,MEM:.status.capacity.memory',
      },
      {
        q: 'Explain the role of cgroups and namespaces in container isolation.',
        a: 'Linux namespaces isolate what a process can see: PID (process tree), NET (network stack), MNT (filesystem), IPC, UTS (hostname), and USER (UID mapping). cgroups limit and account for CPU, memory, I/O, and PIDs. Together they let multiple containers share one kernel safely. Kubernetes maps Pod resource requests/limits to container cgroups via the kubelet and container runtime (containerd/CRI-O).',
        cmd: '# Inspect cgroup limits on a node (containerd)\nsudo crictl inspect $(sudo crictl ps -q --name myapp | head -1) | jq \'.info.runtimeSpec.linux.resources\'\nkubectl describe pod myapp -n prod | grep -A5 "Limits\\|Requests"',
      },
      {
        q: 'What is an OCI image and how is it structured?',
        a: 'An OCI (Open Container Initiative) image is a stack of read-only layers identified by SHA256 digests, described by an image manifest and config JSON. Each Dockerfile instruction adds a layer; layers are shared across images for efficient storage. The config specifies entrypoint, env vars, exposed ports, and default command. Runtimes pull manifests from registries, extract layers to overlay filesystems, and create a container from the top layer plus a writable container layer.',
        cmd: '# Inspect image layers locally\ndocker history myregistry.io/app:v1.2 --no-trunc\ndocker inspect myregistry.io/app:v1.2 --format=\'{{json .RootFS.Layers}}\' | jq\nskopeo inspect docker://myregistry.io/app:v1.2',
      },
      {
        q: 'How would you explain container immutability to a new team member?',
        a: 'Treat container images as immutable artifacts: build once, tag with a unique digest or semver, deploy that exact image everywhere. Never SSH into running containers to patch code — rebuild and redeploy. Immutability enables reproducible rollbacks, consistent dev/staging/prod behavior, and auditable supply chains. Kubernetes enforces this via image fields in Pod specs; changing an app means updating the Deployment image tag and rolling out.',
        cmd: '# Verify deployed image digest matches CI build\nkubectl get pod -l app=checkout -n prod -o jsonpath=\'{range .items[*]}{.metadata.name}{"\\t"}{.status.containerStatuses[0].imageID}{"\\n"}{end}\'\ndocker inspect myregistry.io/checkout:v2.4.1 --format=\'{{index .RepoDigests 0}}\'',
      },
    ],
    medium: [
      {
        q: 'How do you implement multi-stage Docker builds for production Kubernetes workloads?',
        a: 'Use a builder stage with full SDK/toolchain to compile artifacts, then copy only runtime artifacts into a minimal final stage (distroless, alpine, or scratch). This shrinks attack surface and image size, speeds pulls, and keeps secrets/build tools out of production images. Pin base image digests, run as non-root, and scan images in CI. In Kubernetes, smaller images reduce node disk pressure and ImagePull times during scale-out events.',
        cmd: '# Example multi-stage build + deploy\n# Dockerfile: FROM golang:1.22 AS build ... FROM gcr.io/distroless/static-debian12\n docker build -t myregistry.io/api:$(git rev-parse --short HEAD) .\n docker push myregistry.io/api:$(git rev-parse --short HEAD)\n kubectl set image deployment/api api=myregistry.io/api:$(git rev-parse --short HEAD) -n prod',
      },
      {
        q: 'What are common pitfalls when running containers as root in Kubernetes?',
        a: 'Root containers can escape via kernel bugs, modify mounted volumes, bind privileged ports, and read host paths if misconfigured. Pitfalls include writable root filesystems, missing readOnlyRootFilesystem, excessive capabilities (NET_RAW, SYS_ADMIN), and hostPath mounts. Production best practice: runAsNonRoot, readOnlyRootFilesystem: true, drop ALL capabilities, use seccomp/AppArmor profiles, and avoid privileged: true unless absolutely required with strict Pod Security Standards enforcement.',
        cmd: 'kubectl auth can-i --list --as=system:serviceaccount:prod:api\nkubectl get pod api-7d4f8 -n prod -o jsonpath=\'{.spec.securityContext}\' | jq\nkubectl get pods -A -o json | jq \'.items[] | select(.spec.containers[].securityContext.privileged==true) | .metadata.name\'',
      },
      {
        q: 'Compare container runtimes used in production Kubernetes clusters.',
        a: 'containerd is the default CRI runtime used by most managed K8s (EKS, GKE, AKS). CRI-O is common in OpenShift/RHEL environments — lightweight, OCI-native. Both implement the CRI gRPC API for kubelet. dockerd (legacy dockershim) is deprecated. For sandboxing, gVisor and Kata Containers add kernel-level isolation at latency cost. Choose based on compliance needs, node OS, and operational familiarity; containerd offers the broadest ecosystem support.',
        cmd: '# Verify runtime on nodes\nkubectl get nodes -o wide\nkubectl describe node worker-1 | grep -i "container runtime"\nsudo crictl info | jq \'.runtimeHandlers\'\n# EKS: kubectl get nodeclaim or describe node for AMI/runtime version',
      },
      {
        q: 'How do you monitor container resource usage and OOM events in production?',
        a: 'Use metrics-server for kubectl top and HPA, cAdvisor/kubelet metrics for Prometheus scraping, and node-exporter for host context. Alert on container_memory_working_set_bytes approaching limits, OOMKilled reason in pod status, and throttled CPU (container_cpu_cfs_throttled_seconds_total). Correlate with application latency SLOs. For post-incident analysis, check dmesg on the node for OOM killer entries and describe pod for Last State: Terminated, Reason: OOMKilled.',
        cmd: 'kubectl top pod -n prod --containers\nkubectl get events -n prod --field-selector reason=OOMKilling\nkubectl describe pod api-7d4f8 -n prod | grep -A3 "Last State"\n# Prometheus: increase(kube_pod_container_status_last_terminated_reason{reason="OOMKilled"}[1h])',
      },
    ],
    hard: [
      {
        q: 'Design a highly available containerized stateless API on Kubernetes with zero-downtime deploys.',
        a: 'Deploy behind a Deployment with minReadySeconds, readiness probes gating Service endpoints, and PodDisruptionBudgets (minAvailable: 80%). Use rollingUpdate maxSurge: 25%, maxUnavailable: 0. Spread across zones via topologySpreadConstraints and podAntiAffinity. HorizontalPodAutoscaler on CPU and custom latency metrics. Ingress with health-checked backends. PreStop hook with sleep for connection draining. Image pinned by digest; GitOps (Argo CD/Flux) for declarative rollouts with automated rollback on failed readiness.',
        cmd: 'kubectl apply -f - <<EOF\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: api-pdb\n  namespace: prod\nspec:\n  minAvailable: 80%\n  selector:\n    matchLabels:\n      app: api\nEOF\nkubectl rollout status deployment/api -n prod\nkubectl get pdb -n prod',
      },
      {
        q: 'How would you optimize container image pull performance during peak autoscaling?',
        a: 'Reduce image size (multi-stage, distroless), use regional registry mirrors or pull-through caches (Harbor, ECR pull-through, GCR remote repos), pre-pull images via DaemonSet or node image cache on warm node pools, and set imagePullPolicy: IfNotPresent for tagged releases. For bursty workloads, maintain over-provisioned node pools or use Karpenter/Cluster Autoscaler with pre-warmed AMIs containing common base layers. Monitor image pull duration via kubelet metrics and kube_pod_container_status_waiting_reason{reason="ImagePullBackOff"}.',
        cmd: '# Pre-pull critical images on all nodes\nkubectl apply -f image-prepull-daemonset.yaml\n# Check pull backoff\nkubectl get pods -n prod | grep -E "ImagePull|ErrImage"\nkubectl describe pod checkout-abc -n prod | grep -A10 Events\n# ECR: aws ecr create-pull-through-cache-rule --upstream-registry-url public.ecr.aws',
      },
      {
        q: 'Explain container escape scenarios and how Kubernetes mitigates them.',
        a: 'Escapes exploit kernel bugs, misconfigured privileged containers, hostPath mounts to sensitive paths (/var/run/docker.sock, /), excessive capabilities, or shared PID namespace with host. Mitigations: Pod Security Standards (restricted), seccomp RuntimeDefault, AppArmor/SELinux, no privileged/hostNetwork/hostPID, NetworkPolicies limiting lateral movement, regular node patching, and runtime sandboxing (gVisor) for untrusted workloads. Audit with kube-bench, Polaris, and OPA Gatekeeper policies denying risky pod specs at admission.',
        cmd: 'kubectl label namespace prod pod-security.kubernetes.io/enforce=restricted\nkubectl get pods -A -o json | jq \'.items[] | select(.spec.hostPID or .spec.hostNetwork or (.spec.containers[].securityContext.privileged)) | {ns: .metadata.namespace, name: .metadata.name}\'\n# Run kube-bench on node\nkubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml',
      },
      {
        q: 'Lead an incident review where a container memory leak caused cascading failures — what do you present?',
        a: 'Timeline: leak detected via memory working set growth → HPA scaled replicas → node memory pressure → kubelet evicted unrelated pods → SLO breach. Root cause: missing memory limits allowed one container to consume node RAM; no alerts on approaching limits. Actions: set requests=limits for predictable workloads, add Prometheus alerts at 85% of limit, implement liveness tied to /health not just process up, load test with memory profiling, add LimitRange defaults per namespace. Present blast radius, customer impact, detection gap, and preventive controls added to CI policy checks.',
        cmd: 'kubectl get events -A --sort-by=.lastTimestamp | grep -i Evicted\nkubectl describe node worker-3 | grep -A20 "Allocated resources"\n# Post-fix validation\nkubectl get limitrange -n prod\nkubectl top pod -n prod --sort-by=memory',
      },
    ],
  },

  docker: {
    easy: [
      {
        q: 'What is Docker and how does it relate to Kubernetes?',
        a: 'Docker popularized container tooling: docker CLI, image build (Dockerfile), and container runtime (containerd under the hood since Docker 20.10). Kubernetes orchestrates containers at scale via the CRI API — it does not require the Docker CLI. Modern clusters use containerd or CRI-O directly. Developers still use Docker locally to build images pushed to registries that Kubernetes pulls at deploy time.',
        cmd: '# Build locally, deploy to K8s\ndocker build -t myregistry.io/web:1.0 .\ndocker push myregistry.io/web:1.0\nkubectl create deployment web --image=myregistry.io/web:1.0\nkubectl rollout status deployment/web',
      },
      {
        q: 'Explain the purpose of a Dockerfile ENTRYPOINT vs CMD.',
        a: 'ENTRYPOINT defines the main executable that always runs; CMD provides default arguments overrideable at docker run. Combined form: ENTRYPOINT ["python"] + CMD ["app.py"] lets kubectl/docker run pass alternate args. In Kubernetes, command maps to ENTRYPOINT override and args maps to CMD override in container spec. Use exec form (JSON array) to avoid shell signal handling issues with PID 1.',
        cmd: 'kubectl run debug --image=busybox --restart=Never --command -- sleep 3600\nkubectl get pod debug -o jsonpath=\'{.spec.containers[0].command}\'\n# Override in deployment manifest:\n# command: ["python"]\n# args: ["-m", "gunicorn", "app:application"]',
      },
      {
        q: 'Describe a basic use case for Docker Compose vs Kubernetes.',
        a: 'Docker Compose defines multi-container apps on a single host for local dev and small deployments — one YAML file, docker compose up. Kubernetes targets production orchestration: multi-node scheduling, self-healing, service discovery, autoscaling, rolling updates, and RBAC. Typical flow: develop with Compose, build images in CI, deploy manifests/Helm charts to Kubernetes for staging and production.',
        cmd: '# Local dev\ndocker compose up -d\ndocker compose logs -f api\n# Production equivalent\nkubectl apply -f k8s/\nkubectl get pods,svc,ingress -n staging',
      },
      {
        q: 'How would you explain Docker image tags vs digests to a new team member?',
        a: 'Tags are mutable pointers (latest, v1.2) — convenient but unsafe for production because the same tag can reference different content after a push. Digests are immutable SHA256 content addresses (myapp@sha256:abc123). Kubernetes status.containerStatuses[].imageID stores the resolved digest. Always deploy by digest or immutable tags in prod; use semver tags in CI with promotion gates.',
        cmd: 'docker pull nginx:1.25\ndocker inspect nginx:1.25 --format=\'{{index .RepoDigests 0}}\'\nkubectl set image deployment/web web=nginx@sha256:abc123def456 -n prod\nkubectl get pod -l app=web -o jsonpath=\'{.items[0].status.containerStatuses[0].imageID}\'',
      },
    ],
    medium: [
      {
        q: 'How do you implement production-grade Docker builds in a Kubernetes CI/CD pipeline?',
        a: 'Use BuildKit/kaniko or Docker-in-Docker in CI runners to build without daemon on nodes. Multi-stage builds, non-root users, .dockerignore to exclude secrets, SBOM generation (syft), image scanning (Trivy, Grype), and sign with cosign. Push to private registry with IAM/RBAC auth. Kubernetes pulls via imagePullSecrets or workload identity (EKS pod identity, GKE workload identity). Tag with git SHA; update Deployment via GitOps or kubectl set image triggered by pipeline.',
        cmd: '# Kaniko in-cluster build\nkubectl apply -f kaniko-job.yaml\nkubectl logs job/kaniko-build -f\n# Scan before deploy\ntrivy image myregistry.io/api:abc123 --severity HIGH,CRITICAL --exit-code 1\ncosign sign --key cosign.key myregistry.io/api:abc123',
      },
      {
        q: 'What are common pitfalls with Docker layer caching in Kubernetes deployments?',
        a: 'Developers push :latest assuming K8s pulls fresh content, but imagePullPolicy: IfNotPresent skips re-pull on nodes with cached layers. Mitigation: use unique tags per build (git SHA), set imagePullPolicy: Always for dev, or use image digest in manifest. Another pitfall: COPY . . early in Dockerfile busts cache on any file change — order Dockerfile from least to most frequently changing layers. Stale cached images on nodes cause "works in CI but not prod" incidents.',
        cmd: 'kubectl patch deployment api -n prod -p \'{"spec":{"template":{"spec":{"containers":[{"name":"api","imagePullPolicy":"Always"}]}}}}\'\nkubectl rollout restart deployment/api -n prod\nkubectl get pod -o jsonpath=\'{range .items[*]}{.metadata.name}{" imagePullPolicy="}{.spec.containers[0].imagePullPolicy}{"\\n"}{end}\'',
      },
      {
        q: 'Compare Docker volume strategies with Kubernetes volume types.',
        a: 'Docker named volumes and bind mounts are node-local and not portable across hosts. Kubernetes abstracts storage via PV/PVC, ConfigMaps/Secrets as volumes, emptyDir for ephemeral scratch, and CSI drivers for cloud/network storage shared across nodes. StatefulSets use volumeClaimTemplates for stable per-pod storage. For logs, prefer stdout/stderr (collected by agents) over Docker log files on disk.',
        cmd: 'kubectl explain pod.spec.volumes\nkubectl get pvc -n prod\nkubectl describe pod db-0 -n prod | grep -A15 "Mounts:"\n# Docker equivalent is node-local only:\n# docker volume create data && docker run -v data:/var/lib/mysql mysql:8',
      },
      {
        q: 'How do you troubleshoot ImagePullBackOff errors in Kubernetes?',
        a: 'Check pod Events for exact error: auth failure (401), not found (404), rate limit, or TLS issues. Verify image name/tag, registry credentials in imagePullSecret referenced by ServiceAccount, network egress to registry, and private registry DNS. For ECR/GCR/ACR use cloud-specific credential helpers or workload identity. Test pull manually: crictl pull on the node or kubectl debug node with nsenter.',
        cmd: 'kubectl describe pod failing-pod -n prod | grep -A20 Events\nkubectl get sa default -n prod -o yaml | grep imagePullSecrets\nkubectl create secret docker-registry regcred --docker-server=myregistry.io --docker-username=user --docker-password=pass -n prod\nkubectl patch sa default -n prod -p \'{"imagePullSecrets":[{"name":"regcred"}]}\'',
      },
    ],
    hard: [
      {
        q: 'Design a secure container supply chain from Docker build to Kubernetes deployment.',
        a: 'Pipeline: lint Dockerfile (hadolint) → BuildKit build with pinned bases → SBOM (syft) → scan (Trivy) → sign (cosign keyless via OIDC) → push to registry with immutable tags → admission controller (Kyverno/Cosign) verifies signature at deploy → deploy via GitOps. Runtime: Pod Security restricted, read-only root FS, NetworkPolicy default-deny. Audit trail links git commit → image digest → deployed ReplicaSet revision.',
        cmd: '# Verify signature at deploy time (Kyverno policy excerpt)\n# kubectl apply -f verify-image-signature-policy.yaml\ncosign verify --certificate-identity=... --certificate-oidc-issuer=... myregistry.io/api:sha-abc123\nkubectl annotate deployment api -n prod image.digest=sha256:abc123 --overwrite',
      },
      {
        q: 'How would you optimize Docker-to-Kubernetes workflow for a monorepo with 50 microservices?',
        a: 'Use Bazel or buildx bake for selective builds based on changed paths. Shared base images cached in registry. Matrix CI builds only affected services. Helm umbrella chart or individual charts per service with shared library templates. Remote cache (ECR/GCR) and parallel kaniko jobs in K8s CI namespace. Argo CD ApplicationSet for per-service sync. Standardize Dockerfile patterns, health probes, and resource templates to reduce drift across 50 services.',
        cmd: '# Build only changed services\ngit diff --name-only HEAD~1 | grep ^services/ | cut -d/ -f2 | sort -u > changed.txt\nxargs -a changed.txt -I{} docker buildx build --cache-from type=registry,ref=myregistry.io/{}:cache --push -t myregistry.io/{}:${GIT_SHA} services/{}\nargocd app sync $(cat changed.txt | sed \'s/.*/&-prod/\')',
      },
      {
        q: 'Explain failure scenarios when migrating from Docker Compose to Kubernetes.',
        a: 'Common failures: hardcoded localhost service URLs (must use K8s DNS), missing health probes causing premature traffic, stateful data on local volumes without PVC migration, depends_on semantics absent (use init containers or readiness), single-replica assumptions without PodDisruptionBudgets, and env files becoming ConfigMaps/Secrets. Network: Compose bridge != ClusterIP — verify NetworkPolicies do not block migrated traffic. Plan blue/green deploy with parallel run and traffic cutover.',
        cmd: 'kubectl run curl --rm -it --image=curlimages/curl -- curl -s http://api.prod.svc.cluster.local:8080/health\nkubectl get endpoints api -n prod\nkompose convert -f docker-compose.yml  # starting point, requires manual fixes\nkubectl diff -f k8s/ | less',
      },
      {
        q: 'Lead an incident review where a malicious base image compromised containers — what do you present?',
        a: 'Detection: anomaly alerts on unexpected outbound connections from pods. Impact: compromised credentials exfiltrated via side-channel. Root cause: unpinned base image tag pulled compromised layer from public registry; no admission scanning. Remediation: rotate all secrets, rebuild from known-good digests, deploy cosign verification policy, block :latest in prod namespaces via OPA. Long-term: private registry mirror, weekly base image rebuilds, SBOM diff in CI, runtime Falco rules for unexpected syscalls.',
        cmd: 'trivy image --severity CRITICAL myregistry.io/api:compromised-tag\nkubectl get networkpolicy -A\nfalcoctl rules list | grep outbound\nkubectl rollout undo deployment/api -n prod\nkubectl set image deployment/api api=myregistry.io/api@sha256:knowngood -n prod',
      },
    ],
  },

  'kubernetes-architecture': {
    easy: [
      {
        q: 'Describe the main components of a Kubernetes control plane.',
        a: 'The control plane manages cluster state: kube-apiserver (REST API front door, authn/authz, admission), etcd (consistent key-value store for all cluster data), kube-scheduler (assigns Pods to Nodes), kube-controller-manager (runs controllers like Deployment, Node, ServiceAccount), and cloud-controller-manager (cloud integration: LB, routes, volumes). All components are HA in production — typically 3+ control plane nodes with stacked etcd or external etcd cluster.',
        cmd: 'kubectl get componentstatuses 2>/dev/null || kubectl get --raw=\'/healthz?verbose\'\nkubectl -n kube-system get pods -l tier=control-plane\nkubectl get nodes -l node-role.kubernetes.io/control-plane',
      },
      {
        q: 'What is the role of the kubelet on worker nodes?',
        a: 'The kubelet is the node agent that registers the node with the API server, watches PodSpecs bound to its node, and ensures containers run via the CRI runtime. It executes liveness/readiness probes, reports node and pod status, mounts volumes, and enforces pod resources via cgroups. It does not manage containers not created by Kubernetes.',
        cmd: 'kubectl describe node worker-1 | grep -A5 Conditions\nsudo systemctl status kubelet\nsudo journalctl -u kubelet -f --no-pager | tail -50\nkubectl get pods -n prod -o wide --field-selector spec.nodeName=worker-1',
      },
      {
        q: 'Explain how kubectl communicates with the cluster.',
        a: 'kubectl is a CLI client that sends HTTPS requests to kube-apiserver using kubeconfig (~/.kube/config) containing cluster URL, credentials (cert, token, or exec plugin for OIDC/cloud IAM), and context. It never talks directly to kubelets for management operations. Requests pass authentication, authorization (RBAC), admission controllers, then persist to etcd. kubectl get/describe reads from API server cache/watch streams.',
        cmd: 'kubectl config view --minify\nkubectl config current-context\nkubectl get --raw /api/v1/namespaces/prod/pods --v=8 2>&1 | grep -E "curl|Authorization"\nkubectl auth can-i get pods -n prod',
      },
      {
        q: 'How would you explain the declarative model of Kubernetes to a new team member?',
        a: 'You declare desired state in YAML manifests (3 replicas, image v2, port 8080) and submit to the API server. Controllers continuously reconcile actual state toward desired state — if a pod dies, the ReplicaSet controller creates a replacement. You do not run imperative repair scripts; you fix the manifest or kubectl apply the corrected spec. This enables GitOps, auditable changes, and self-healing infrastructure.',
        cmd: 'kubectl apply -f deployment.yaml\nkubectl get deployment api -n prod -o yaml | grep -A10 status\nkubectl diff -f deployment.yaml\n# GitOps: git push → Argo CD syncs desired state',
      },
    ],
    medium: [
      {
        q: 'How does the Kubernetes scheduling pipeline work for a new Pod?',
        a: 'After admission and persistence to etcd, the scheduler performs filtering (nodeSelector, affinity, taints/tolerations, resource requests, PVC topology) then scoring (spread, preferred affinity, image locality). It binds the Pod to a node via API patch. The kubelet watches bound pods, pulls images, creates sandbox and containers via CRI, mounts volumes, and starts probes. Failed scheduling shows PodScheduled=False with reason; use describe pod for events.',
        cmd: 'kubectl describe pod pending-pod -n prod | grep -A30 Events\nkubectl get events -n prod --field-selector reason=FailedScheduling\n# Simulate scheduling\nkubectl apply -f pod-with-affinity.yaml\nkubectl get pod pending-pod -o jsonpath=\'{.status.conditions[?(@.type=="PodScheduled")]}\' | jq',
      },
      {
        q: 'What are common pitfalls with etcd in production Kubernetes?',
        a: 'etcd is the single source of truth — latency or corruption affects entire cluster. Pitfalls: undersized disks causing slow writes, defragmentation neglected, no regular snapshots/backups, running on oversubscribed control plane nodes, and exceeding recommended 8GB database size without compaction. Monitor etcd_disk_wal_fsync_duration_seconds, leader changes, and db size. Backup with etcdctl snapshot save before upgrades; test restore in staging.',
        cmd: '# On control plane node\nsudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  endpoint health\nsudo ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-$(date +%F).db',
      },
      {
        q: 'Compare stacked etcd vs external etcd topologies.',
        a: 'Stacked: etcd runs on same nodes as control plane components — simpler for kubeadm/small clusters, but failure correlation if node dies. External: dedicated etcd cluster (3 or 5 nodes) — better isolation, required for large clusters and some enterprise setups. Managed K8s (EKS/GKE/AKS) hides etcd entirely with SLA-backed backups. Choose external when control plane scaling or etcd I/O isolation is critical.',
        cmd: 'kubectl -n kube-system get pods -l component=etcd\n# kubeadm: cat /etc/kubernetes/manifests/etcd.yaml\n# External etcd health from admin host\nETCDCTL_API=3 etcdctl --endpoints=https://etcd-1:2379,https://etcd-2:2379,https://etcd-3:2379 endpoint status -w table',
      },
      {
        q: 'How do you monitor control plane health in production?',
        a: 'Scrape apiserver metrics (/metrics on secure port), etcd metrics, scheduler/controller-manager metrics via Prometheus ServiceMonitors. Alert on apiserver request latency p99, etcd leader loss, admission webhook failures, and 5xx rates. Use kubectl get --raw /healthz and /readyz. Cloud managed control planes expose cloud-specific health dashboards. Synthetic checks: canary kubectl apply/delete in monitoring namespace.',
        cmd: 'kubectl get --raw=\'/readyz?verbose\'\nkubectl get --raw=\'/metrics\' | grep apiserver_request_duration_seconds | head\n# GKE: gcloud container clusters describe CLUSTER --zone=ZONE\n# EKS: aws eks describe-cluster --name prod',
      },
    ],
    hard: [
      {
        q: 'Design a highly available multi-AZ Kubernetes cluster architecture for a financial services workload.',
        a: '3+ control plane nodes across AZs (or managed control plane with 99.95% SLA). Worker node pools per AZ with topologySpreadConstraints on critical apps. External etcd or managed backend with cross-AZ replication. Ingress/load balancer multi-AZ. PodDisruptionBudgets, anti-affinity for stateless tiers, StatefulSets with zone-aware PVCs. NetworkPolicies default-deny. Separate etcd/control plane from worker blast radius. DR: etcd snapshots + Velero cluster backups, RTO/RPO defined, quarterly restore drills.',
        cmd: 'kubectl get nodes -L topology.kubernetes.io/zone\nkubectl get pdb -A\nkubectl apply -f - <<EOF\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: payments\n  namespace: prod\nspec:\n  replicas: 6\n  template:\n    spec:\n      topologySpreadConstraints:\n      - maxSkew: 1\n        topologyKey: topology.kubernetes.io/zone\n        whenUnsatisfiable: DoNotSchedule\n        labelSelector:\n          matchLabels:\n            app: payments\nEOF',
      },
      {
        q: 'How would you optimize API server performance under 10,000+ Pod churn per hour?',
        a: 'Increase apiserver --max-requests-inflight, tune etcd quota and defrag schedule, use API Priority and Fairness (APF) flowschemas for critical controllers. Reduce list/watch pressure: avoid cluster-wide unfiltered watches in controllers, use informer resync wisely, shard operators by namespace. Tune kube-controller-manager QPS/burst. Consider event aggregation, limit kubectl get pods -A in CI. Monitor etcd db size and apiserver watch count; horizontal apiserver scaling where supported.',
        cmd: 'kubectl get flowschema -o wide\nkubectl get prioritylevelconfiguration\nkubectl get --raw /metrics | grep etcd_db_total_size_in_bytes\nkubectl top pods -n kube-system | grep -E "kube-apiserver|etcd"',
      },
      {
        q: 'Explain failure scenarios during a Kubernetes control plane upgrade.',
        a: 'Risks: etcd schema/version skew if nodes upgraded out of order, admission webhook timeouts blocking all creates, API aggregation layer incompatibility, CRD version deprecation breaking operators, and kubelet/API version skew beyond supported N-2 window. Mitigation: read release notes, upgrade etcd first (if external), then control plane, then nodes one AZ at a time. Maintain PodDisruptionBudgets; verify /healthz after each step. Rollback plan: restore etcd snapshot or revert control plane manifests.',
        cmd: 'kubectl version\nkubeadm upgrade plan\nkubectl get nodes -o custom-columns=NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion\nkubectl drain cp-node-1 --ignore-daemonsets --delete-emptydir-data',
      },
      {
        q: 'Lead an incident review where etcd corruption caused cluster-wide outage — what do you present?',
        a: 'Timeline: slow writes → apiserver timeouts → controllers stop reconciling → deployments frozen. Root cause: full disk on etcd member, WAL corruption after unclean shutdown. Detection gap: no alert on etcd_disk_backend_commit_duration or disk usage. Recovery: restore from last good snapshot (4h RPO), validate object counts, restart controllers. Prevention: dedicated SSD volumes with 50% headroom, automated snapshots every hour, defrag cron, runbook-tested restore, exclude etcd data from generic node disk cleanup scripts.',
        cmd: 'sudo ETCDCTL_API=3 etcdctl snapshot status /backup/etcd-latest.db -w table\nsudo ETCDCTL_API=3 etcdctl snapshot restore /backup/etcd-latest.db --data-dir=/var/lib/etcd-restore\n# Post-incident: verify object counts\nkubectl get all -A --no-headers | wc -l',
      },
    ],
  },

  pods: {
    easy: [
      {
        q: 'What is a Pod in Kubernetes and why is it the smallest deployable unit?',
        a: 'A Pod wraps one or more containers that share network namespace (same IP, localhost communication), IPC, and optionally volumes. Sidecar pattern colocates helper containers (logging, proxy). Pods are ephemeral — controllers (Deployment, StatefulSet) create and replace them. You rarely create bare Pods in production; instead use controllers for self-healing and scaling.',
        cmd: 'kubectl get pods -n prod\nkubectl describe pod api-7f8d9-abc12 -n prod\nkubectl get pod api-7f8d9-abc12 -n prod -o yaml | grep -A20 "spec:"',
      },
      {
        q: 'Explain the Pod lifecycle phases: Pending, Running, Succeeded, Failed, Unknown.',
        a: 'Pending: accepted but not scheduled or images pulling. Running: at least one container started. Succeeded: all containers terminated exit 0 (Jobs). Failed: terminated with non-zero exit. Unknown: node communication lost. Conditions (PodScheduled, Initialized, ContainersReady, Ready) give finer detail. Use kubectl describe pod Events for transitions like Scheduled, Pulled, Created, Started.',
        cmd: 'kubectl get pods -n prod -o custom-columns=NAME:.metadata.name,PHASE:.status.phase,READY:.status.conditions[?(@.type=="Ready")].status\nkubectl describe pod api-abc -n prod | grep -E "Phase:|Conditions:|Events:" -A15',
      },
      {
        q: 'Describe a basic use case for init containers in a Pod.',
        a: 'Init containers run sequentially before app containers start, completing setup tasks: wait for dependencies (DB migration service), download config, validate permissions, or delay startup until a service is reachable. They must exit successfully before main containers launch. Example: init container runs flyway migrate; app container starts only after schema is ready.',
        cmd: 'kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: app-with-init\n  namespace: staging\nspec:\n  initContainers:\n  - name: wait-for-db\n    image: busybox:1.36\n    command: ["sh", "-c", "until nc -z postgres 5432; do sleep 2; done"]\n  containers:\n  - name: app\n    image: myapp:1.0\nEOF\nkubectl logs app-with-init -c wait-for-db -n staging',
      },
      {
        q: 'How would you explain restartPolicy to a new team member?',
        a: 'restartPolicy controls what kubelet does when a container exits: Always (default for Deployments — always restart on same node), OnFailure (restart only on error, used by Jobs), Never (bare Pods, debugging). It does not reschedule to another node — that requires a controller. For crash loops, kubelet applies exponential backoff (CrashLoopBackOff) visible in pod status.',
        cmd: 'kubectl get pod crash-demo -n dev -o jsonpath=\'{.spec.restartPolicy}\'\nkubectl describe pod crash-demo -n dev | grep -A5 "Restart Count\\|Last State"\nkubectl run fail --image=busybox --restart=Never -- sh -c "exit 1"',
      },
    ],
    medium: [
      {
        q: 'How do liveness, readiness, and startup probes differ in production?',
        a: 'Readiness: pod receives Service traffic only when ready — remove from endpoints on failure (graceful during slow start). Liveness: failure restarts container — use carefully to avoid restart storms on slow dependencies. Startup: disables liveness/readiness until app finishes boot (JVM, large cache warm-up). Configure appropriate timeouts, failureThreshold, and httpGet/tcpSocket/exec handlers. Never point liveness at downstream dependencies.',
        cmd: 'kubectl explain pod.spec.containers.livenessProbe\nkubectl get pod -l app=api -n prod -o json | jq \'.items[0].spec.containers[0] | {readinessProbe, livenessProbe, startupProbe}\'\nkubectl describe pod api-xyz -n prod | grep -A8 "Liveness\\|Readiness\\|Startup"',
      },
      {
        q: 'What are common pitfalls with Pod resource requests and limits?',
        a: 'Setting limits without requests causes unpredictable scheduling. Limits >> requests causes noisy neighbor issues if QoS is Burstable. No limits allows OOM on node affecting other pods. CPU limits cause throttling without OOM — latency spikes. Best practice: set requests to p95 usage, limits to peak for memory (requests=limits for Guaranteed QoS on critical tiers). Use Vertical Pod Autoscaler recommendations in staging.',
        cmd: 'kubectl describe node worker-2 | grep -A15 "Allocated resources"\nkubectl get pod api-abc -n prod -o jsonpath=\'{.status.qosClass}\'\nkubectl top pod -n prod --containers | sort -k3 -hr | head -20',
      },
      {
        q: 'Compare sidecar vs init container patterns at scale.',
        a: 'Init: sequential, terminates before app starts — good for one-time setup. Sidecar: runs alongside app for entire pod life — logging (Fluent Bit), service mesh (Envoy), config reload. Pitfall: sidecars inflate resource accounting and complicate termination (preStop ordering). Kubernetes 1.28+ native sidecar containers (restartPolicy: Always, initContainers with sidecar flag) improve lifecycle. Monitor sidecar CPU/memory separately.',
        cmd: 'kubectl get pod -l app=orders -n prod -o jsonpath=\'{range .items[*]}{.metadata.name}{": "}{range .spec.containers[*]}{.name}{" "}{end}{"\\n"}{end}\'\nkubectl logs orders-pod -c istio-proxy -n prod --tail=20\nkubectl exec orders-pod -n prod -c app -- curl -s localhost:15000/stats',
      },
      {
        q: 'How do you troubleshoot pods stuck in Pending or ContainerCreating?',
        a: 'Pending: check FailedScheduling events — insufficient CPU/memory, PVC unbound, nodeSelector/affinity unsatisfiable, taints without tolerations. ContainerCreating: image pull in progress, volume mount failure (PVC, secret, configmap missing), CNI not ready. Use describe pod Events, kubectl get pvc, and verify node conditions. For CNI issues, check kube-system pods (calico, cilium, aws-node).',
        cmd: 'kubectl describe pod pending-pod -n prod | tail -30\nkubectl get pvc -n prod\nkubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints,READY:.status.conditions[?(@.type=="Ready")].status\nkubectl get pods -n kube-system -o wide',
      },
    ],
    hard: [
      {
        q: 'Design a Pod spec for a latency-sensitive Java service with graceful shutdown.',
        a: 'Guaranteed QoS: requests=limits for CPU/memory. startupProbe with long failureThreshold for JVM boot. readinessProbe on /ready after warmup. livenessProbe on lightweight /health. terminationGracePeriodSeconds: 60 with preStop hook sleeping 15s for LB deregistration. lifecycle.preStop: exec sleep. PodDisruptionBudget minAvailable. Spread across nodes/AZs. Avoid CPU limits if latency-critical (use dedicated nodes instead).',
        cmd: 'kubectl apply -f java-deployment.yaml\nkubectl delete pod -l app=payments -n prod --grace-period=60\nkubectl get events -n prod --field-selector involvedObject.name=payments-abc | grep -i Killing',
      },
      {
        q: 'How would you optimize pod density on cost-constrained node pools?',
        a: 'Right-size requests using VPA/historical metrics. Use LimitRanges to cap per-pod max. Bin-pack with descheduler for rebalancing. Separate bursty workloads from steady-state via taints/tolerations and dedicated pools. Enable CPU manager static policy for pinned workloads if needed. Monitor node allocatable vs requested; target 70-80% utilization with headroom for bursts and system pods.',
        cmd: 'kubectl describe nodes | grep -E "Name:|cpu|memory" -A2\nkubectl get pods -A -o json | jq \'[.items[].spec.containers[].resources.requests.cpu // "0"] | length\'\nkubectl top nodes\n# Descheduler: kubectl apply -f descheduler-policy-configmap.yaml',
      },
      {
        q: 'Explain pod eviction scenarios: node pressure, preemption, and API eviction.',
        a: 'Node pressure: kubelet evicts BestEffort then Burstable exceeding requests when memory/disk/PID pressure (see describe node Conditions). API eviction: kubectl drain/eviction subresource respects PDBs. Preemption: scheduler removes lower-priority pods to schedule pending high-priority pods. Mitigation: set appropriate QoS, PDBs, priorityClasses, and monitor eviction events. Critical apps use PriorityClass system-cluster-critical with caution.',
        cmd: 'kubectl describe node worker-1 | grep -A10 Conditions\nkubectl get events -A | grep Evicted\nkubectl get priorityclass\nkubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data --grace-period=30',
      },
      {
        q: 'Lead an incident review where incorrect probe config caused an outage — what do you present?',
        a: 'Incident: liveness probe hit /health which checks DB; DB blip caused mass pod restarts → thundering herd on DB → full outage. Root cause: liveness coupled to dependency. Fix: liveness checks process only (/live), readiness checks dependencies (/ready), increased failureThreshold. Added runbook and lint policy in CI rejecting dependency checks in liveness. Present probe flow diagram, restart count graph correlation, and admission policy enforcing probe standards.',
        cmd: 'kubectl get pods -n prod -l app=checkout -o json | jq \'.items[] | {name: .metadata.name, restarts: .status.containerStatuses[0].restartCount}\'\nkubectl describe deployment checkout -n prod | grep -A12 Liveness',
      },
    ],
  },

  deployments: {
    easy: [
      {
        q: 'What is a Deployment and how does it manage ReplicaSets?',
        a: 'A Deployment declaratively manages ReplicaSets to run stateless app replicas. It supports rolling updates, rollbacks, and scaling. When you change the pod template (e.g., new image), Deployment creates a new ReplicaSet and gradually shifts replicas. Old ReplicaSets are retained for rollback history (revisionHistoryLimit). kubectl rollout undo reverts to previous ReplicaSet.',
        cmd: 'kubectl get deployment,rs,pods -n prod -l app=api\nkubectl describe deployment api -n prod | grep -A10 "Replica Sets"\nkubectl rollout history deployment/api -n prod',
      },
      {
        q: 'Explain rolling update strategy parameters maxSurge and maxUnavailable.',
        a: 'maxSurge: extra pods above desired count during update (absolute or percent). maxUnavailable: pods that can be down during update. Example: 10 replicas, maxSurge 25% (3), maxUnavailable 0 → always at least 10 ready; up to 13 total during rollout. Setting maxUnavailable 0 ensures no capacity drop — important for production traffic.',
        cmd: 'kubectl get deployment api -n prod -o jsonpath=\'{.spec.strategy.rollingUpdate}\'\nkubectl patch deployment api -n prod -p \'{"spec":{"strategy":{"rollingUpdate":{"maxSurge":"25%","maxUnavailable":0}}}}\'\nkubectl rollout status deployment/api -n prod',
      },
      {
        q: 'Describe a basic use case for kubectl rollout undo.',
        a: 'After deploying a bad image causing 500 errors, quickly revert: kubectl rollout undo deployment/api rolls back to previous ReplicaSet revision without re-applying old YAML. Verify with rollout status and error rate dashboards. For GitOps, revert the git commit and sync instead to keep source of truth aligned.',
        cmd: 'kubectl rollout undo deployment/api -n prod\nkubectl rollout status deployment/api -n prod\nkubectl rollout history deployment/api -n prod --revision=3\nkubectl get rs -n prod -l app=api --sort-by=.metadata.creationTimestamp',
      },
      {
        q: 'How would you explain labels and selectors in Deployments?',
        a: 'Deployment pod template labels (app: api) must match its selector (matchLabels). Service selectors route traffic to matching pod labels. Consistent labeling enables kubectl -l app=api, NetworkPolicies, and HPAs. Changing immutable selector fields requires recreating Deployment. Use recommended labels (app.kubernetes.io/name, /version, /component) for tooling compatibility.',
        cmd: 'kubectl get deployment api -n prod --show-labels\nkubectl get pods -n prod -l app=api\nkubectl get svc api -n prod -o jsonpath=\'{.spec.selector}\'\nkubectl label pod api-xyz -n prod version=v2 --overwrite',
      },
    ],
    medium: [
      {
        q: 'How do you implement blue-green or canary deployments with Kubernetes Deployments?',
        a: 'Blue-green: two Deployments (api-blue, api-green) behind Service — switch selector or use Argo Rollouts/Flagger for automated traffic split. Canary: separate canary Deployment with fewer replicas; Ingress/service mesh weighted routes (5% → 25% → 100%). Monitor error rate and latency gates. Native Deployment rolling update is canary-lite; for fine traffic control use Istio VirtualService or Argo Rollouts analysis templates.',
        cmd: '# Argo Rollouts canary\nkubectl argo rollouts get rollout api -n prod\nkubectl argo rollouts promote api -n prod\n# Manual blue-green Service switch\nkubectl patch svc api -n prod -p \'{"spec":{"selector":{"version":"green"}}}\'',
      },
      {
        q: 'What are common pitfalls during Deployment rollouts in production?',
        a: 'Missing readiness probes → traffic to unready pods. maxUnavailable too high → capacity drop. Config change without image change not triggering rollout (need checksum annotation on configmap). Resource quota blocking new pods. PDB blocking rollout when maxUnavailable conflicts. ImagePullBackOff on new version halting rollout mid-way leaving mixed versions. Always watch rollout status and set progressDeadlineSeconds.',
        cmd: 'kubectl rollout status deployment/api -n prod --timeout=5m\nkubectl get rs -n prod -l app=api\nkubectl describe deployment api -n prod | grep -A5 Conditions\nkubectl get events -n prod --field-selector reason=FailedCreate',
      },
      {
        q: 'Compare Deployment vs StatefulSet for application workloads.',
        a: 'Deployment: stateless, random pod names, interchangeable replicas, RollingUpdate default — web APIs, workers. StatefulSet: stable network ID (pod-0, pod-1), ordered deploy/scale, per-pod PVCs — databases, Kafka, ZooKeeper. Do not run primary databases in Deployment unless using external managed DB. StatefulSet requires headless Service for stable DNS.',
        cmd: 'kubectl explain statefulset.spec\nkubectl get statefulset,deployment -n prod\nkubectl get pod db-0 -n prod -o jsonpath=\'{.metadata.name}{" "}{.spec.hostname}{"\\n"}\'\ndig db-0.db.prod.svc.cluster.local',
      },
      {
        q: 'How do you monitor Deployment rollout health and revision history?',
        a: 'Watch deployment_status_replicas_updated/unavailable/available metrics. Alert on progressDeadlineSeconds exceeded (ReplicaSet failure). Track kube_deployment_status_condition. Log rollouts in change management. Keep revisionHistoryLimit >= 5 for rollback. Annotate deployments with change ticket, git SHA, and deployer for audit. Use kubectl rollout status in CI/CD gates before promoting.',
        cmd: 'kubectl get deployment api -n prod -o yaml | grep -A20 status\nkubectl rollout history deployment/api -n prod\n# Prometheus: kube_deployment_status_replicas_unavailable{deployment="api"} > 0',
      },
    ],
    hard: [
      {
        q: 'Design a zero-downtime global Deployment strategy across multiple clusters.',
        a: 'GitOps with Argo CD ApplicationSet per cluster/region. Sequential promotion: canary cluster → 10% traffic regions → full. Each cluster: Deployment with maxUnavailable 0, PDB, HPA headroom. Global load balancer health checks per region. Feature flags decouple code deploy from exposure. Automated rollback on cross-cluster SLO breach via Argo Rollouts or custom pipeline. Consistent image digest across clusters; config via Kustomize overlays per region.',
        cmd: 'argocd app list | grep api\nkubectl config use-context prod-us-east\nkubectl rollout status deployment/api -n prod\nkubectl config use-context prod-eu-west\nkubectl get deployment api -n prod -o jsonpath=\'{.spec.template.spec.containers[0].image}\'',
      },
      {
        q: 'How would you optimize Deployment rollout speed for a 200-replica service?',
        a: 'Increase maxSurge (50%) for faster parallel pod creation if cluster capacity allows. Pre-warm nodes via over-provisioned node pool or Karpenter. Reduce image size and use regional registry. readinessProbe initialDelaySeconds tuned to actual startup p99. Pod topology spread may slow scheduling — relax for rollout window. progressDeadlineSeconds aligned with expected duration. Consider surge node pool that scales during deploys.',
        cmd: 'kubectl patch deployment api -n prod -p \'{"spec":{"strategy":{"rollingUpdate":{"maxSurge":"50%","maxUnavailable":"5%"}}}}\'\nkubectl get pods -n prod -l app=api --no-headers | wc -l\nkubectl top nodes\nkubectl get events -n prod --sort-by=.lastTimestamp | grep -i "SuccessfulCreate" | tail -10',
      },
      {
        q: 'Explain failure scenarios when Deployment and HPA interact during rollouts.',
        a: 'HPA may scale up old ReplicaSet during rollout if metrics spike from mixed-version latency. New pods not ready → HPA scales more → resource exhaustion. Mitigation: pause HPA during deploy (remove autoscaler temporarily), use Argo Rollouts with HPA integration, or ensure maxSurge provides enough headroom. PDB minAvailable can block both rollout and scale-down. Test rollouts under load in staging with HPA enabled.',
        cmd: 'kubectl get hpa -n prod\nkubectl describe hpa api -n prod\nkubectl autoscale deployment api -n prod --min=10 --max=50 --cpu-percent=70\n# Pause: kubectl patch hpa api -n prod -p \'{"spec":{"minReplicas":30,"maxReplicas":30}}\'',
      },
      {
        q: 'Lead an incident review where a partial rollout caused data corruption — what do you present?',
        a: 'Context: schema migration in new version incompatible with old version; 40% pods on new, 60% old during rolling update. Root cause: backward-incompatible API change without expand-contract migration pattern. Fix: immediate rollback, expand-contract process mandated, Job-based migration before Deployment update, readiness gate on migration completion. Present version mix timeline, error logs showing mixed-version writes, and new deploy checklist requiring compatibility window.',
        cmd: 'kubectl rollout undo deployment/api -n prod\nkubectl get rs -n prod -l app=api -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,CURRENT:.status.replicas,READY:.status.readyReplicas\nkubectl logs -l app=api -n prod --prefix --tail=5 | grep -i "schema\\|migration"',
      },
    ],
  },

  replicasets: {
    easy: [
      {
        q: 'What is a ReplicaSet and how does it differ from a Deployment?',
        a: 'ReplicaSet ensures a specified number of pod replicas with matching labels are running. It creates/deletes pods to match spec.replicas. Deployments manage ReplicaSets and add rolling updates/rollbacks — you should not manage ReplicaSets directly in production. Bare ReplicaSets only support recreate-style updates (delete all, create new).',
        cmd: 'kubectl get rs -n prod -l app=web\nkubectl describe rs web-6d4f8b9c7 -n prod\nkubectl get rs -n prod -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,READY:.status.readyReplicas',
      },
      {
        q: 'Explain how ReplicaSet selectors match pod labels.',
        a: 'ReplicaSet spec.selector.matchLabels must match template.metadata.labels. If labels on running pods do not match selector, ReplicaSet ignores them. Orphan pods (created manually with matching labels) are adopted if controllerRef not set. Immutable selector in apps/v1 ReplicaSet — changing it requires delete/recreate. Deployment owns ReplicaSets via ownerReferences.',
        cmd: 'kubectl get rs web-6d4f8b9c7 -n prod -o jsonpath=\'{.spec.selector.matchLabels}\'\nkubectl get pods -n prod -l app=web --show-labels\nkubectl get rs web-6d4f8b9c7 -n prod -o jsonpath=\'{.metadata.ownerReferences[0].kind}\'',
      },
      {
        q: 'Describe what happens when you scale a Deployment from 3 to 10 replicas.',
        a: 'Deployment updates its active ReplicaSet spec.replicas to 10. ReplicaSet controller creates 7 new pods; scheduler assigns nodes; kubelet starts containers. Deployment status shows updatedReplicas increasing until 10/10 ready. HPA may later adjust this count based on metrics. Scale-down removes pods gracefully respecting terminationGracePeriodSeconds and PDB.',
        cmd: 'kubectl scale deployment web -n prod --replicas=10\nkubectl get pods -n prod -l app=web -w\nkubectl get deployment web -n prod -o jsonpath=\'{.status.replicas}{" ready "}{.status.readyReplicas}{"\\n"}\'',
      },
      {
        q: 'How would you explain ownerReferences to a new team member?',
        a: 'Kubernetes uses ownerReferences to establish parent-child relationships. ReplicaSet owns Pods; Deployment owns ReplicaSets. When parent is deleted, children are garbage collected (unless orphanDependents). This prevents orphaned pods consuming resources. kubectl delete deployment removes ReplicaSets and pods cascade by default.',
        cmd: 'kubectl get pod web-abc -n prod -o jsonpath=\'{.metadata.ownerReferences}\' | jq\nkubectl delete deployment web -n prod\nkubectl get rs,pods -n prod -l app=web  # should show none',
      },
    ],
    medium: [
      {
        q: 'How do ReplicaSets handle node failures and pod evictions?',
        a: 'ReplicaSet is level-triggered: it continuously compares desired vs actual replicas. If node fails, pods enter Unknown/Failed; after nodeNotReady timeout (default 5m), pods marked for deletion; ReplicaSet creates replacements on healthy nodes. Faster recovery: reduce pod-eviction-timeout or use PodDisruptionBudgets with minAvailable during voluntary disruptions. DaemonSets differ — one pod per node regardless of ReplicaSet logic.',
        cmd: 'kubectl get pods -n prod -o wide\nkubectl describe node failed-node | grep -A5 Conditions\nkubectl get rs web -n prod -w\nkubectl get events -n prod | grep -i "node not ready"',
      },
      {
        q: 'What are common pitfalls with manual pod deletion and ReplicaSets?',
        a: 'Deleting a pod triggers immediate recreation — useful for restart but confusing if debugging on same pod name. kubectl delete pod without fixing root cause enters CrashLoopBackOff loop. For debugging, scale to 0 first or use --force only in emergencies. Deleting ReplicaSet directly (bypassing Deployment) causes Deployment to recreate it — always scale/delete Deployment instead.',
        cmd: 'kubectl delete pod web-abc -n prod\nkubectl get pods -n prod -l app=web --watch\nkubectl scale deployment web -n prod --replicas=0\nkubectl scale deployment web -n prod --replicas=3',
      },
      {
        q: 'Compare ReplicaSet scaling with HorizontalPodAutoscaler.',
        a: 'ReplicaSet/Deployment spec.replicas is the desired count set manually or by HPA. HPA watches metrics (CPU, memory, custom) and patches Deployment replicas every sync period (default 15s). HPA respects min/max bounds. Without HPA, manual scaling or cluster autoscaler only adds nodes not pods. Combine HPA (pod count) with Cluster Autoscaler (node count) for full elasticity.',
        cmd: 'kubectl autoscale deployment web -n prod --min=3 --max=20 --cpu-percent=75\nkubectl get hpa web -n prod -w\nkubectl describe hpa web -n prod | grep -A10 Conditions',
      },
      {
        q: 'How do you troubleshoot ReplicaSet with ready replicas less than desired?',
        a: 'Check pod states: ImagePullBackOff, CrashLoopBackOff, Pending (scheduling), unready (probe failing). describe rs shows Events; get pods shows individual failures. Common causes: resource quota, insufficient cluster capacity, bad image, probe misconfig, PVC pending. Fix underlying pod issue — ReplicaSet will converge once pods become Ready.',
        cmd: 'kubectl describe rs web-6d4f8b9c7 -n prod\nkubectl get pods -n prod -l app=web | grep -v Running\nkubectl describe pod web-failing -n prod | tail -25\nkubectl get resourcequota -n prod',
      },
    ],
    hard: [
      {
        q: 'Design a multi-tier application with independent ReplicaSet scaling per tier.',
        a: 'Separate Deployments per tier (frontend, api, worker) with independent HPAs — frontend scales on RPS via custom metrics, api on CPU, worker on queue depth (KEDA). Each Deployment owns its ReplicaSet. NetworkPolicies enforce tier boundaries. Shared config via ConfigMaps. Avoid single Deployment with mixed containers — prevents independent scaling and complicates rollouts.',
        cmd: 'kubectl apply -f frontend-deployment.yaml -f api-deployment.yaml -f worker-deployment.yaml\nkubectl get hpa -n prod\nkubectl get deploy -n prod\n# KEDA ScaledObject for worker\nkubectl get scaledobject -n prod',
      },
      {
        q: 'How would you optimize ReplicaSet controller behavior during large-scale node loss?',
        a: 'Sudden loss of many nodes causes simultaneous pod recreation — API server thundering herd. Mitigation: pod topology spread avoids single-AZ concentration; over-provision nodes; rate-limit via multiple smaller Deployments; priority classes ensure critical pods schedule first. Cluster Autoscaler adds nodes but lag minutes — maintain buffer capacity. Monitor scheduling queue depth and pending pod count.',
        cmd: 'kubectl get pods -A --field-selector status.phase=Pending | wc -l\nkubectl get events -A --field-selector reason=FailedScheduling | tail -20\nkubectl describe node | grep -E "Name:|Allocatable" -A3',
      },
      {
        q: 'Explain revision history and orphaned ReplicaSets after failed rollouts.',
        a: 'Deployment keeps old ReplicaSets scaled to 0 for rollback (revisionHistoryLimit). Failed rollout may leave new RS with 0 ready and old RS serving traffic — Deployment condition Progressing=False. Manual intervention: rollout undo or fix new template. Orphan RS (deployment deleted with orphanDependents) continue running unmanaged pods — dangerous drift. Always manage via Deployment; audit with kubectl get rs showing DESIRED > 0 but no owner Deployment.',
        cmd: 'kubectl rollout history deployment/api -n prod\nkubectl get rs -n prod -l app=api\nkubectl get rs -n prod -o json | jq \'.items[] | select(.spec.replicas > 0 and (.metadata.ownerReferences | length == 0)) | .metadata.name\'\nkubectl rollout undo deployment/api -n prod --to-revision=2',
      },
      {
        q: 'Lead an incident review where ReplicaSet thrashing caused API server overload — what do you present?',
        a: 'Trigger: misconfigured liveness probe caused continuous pod restarts; ReplicaSet recreated pods at max rate; API server LIST/WATCH traffic spiked. Impact: cluster-wide slowdown, delayed scheduling for other teams. Fix: probe correction, temporary scale-down, API Priority/Fairness tuning. Prevention: probe linting in CI, alert on pod restart rate > threshold per deployment, rate-limit buggy deployments via admission webhook requiring probe review for new services.',
        cmd: 'kubectl get pods -n prod -l app=buggy -o json | jq \'[.items[].status.containerStatuses[].restartCount] | add\'\nkubectl get --raw /metrics | grep apiserver_request_total | head\nkubectl top pods -n kube-system | grep apiserver',
      },
    ],
  },

  services: {
    easy: [
      {
        q: 'What is a Kubernetes Service and why do you need one?',
        a: 'Pods are ephemeral with changing IPs. A Service provides a stable virtual IP (ClusterIP) and DNS name (my-svc.namespace.svc.cluster.local) that load-balances traffic to matching pod endpoints via kube-proxy or dataplane (iptables/IPVS/eBPF). Types: ClusterIP (internal), NodePort, LoadBalancer (cloud LB), ExternalName (DNS CNAME).',
        cmd: 'kubectl get svc -n prod\nkubectl describe svc api -n prod\nkubectl get endpoints api -n prod\nnslookup api.prod.svc.cluster.local',
      },
      {
        q: 'Explain ClusterIP vs NodePort vs LoadBalancer Service types.',
        a: 'ClusterIP: internal VIP, default type, reachable only inside cluster. NodePort: exposes on each node high port (30000-32767), often fronted by external LB. LoadBalancer: provisions cloud LB (ELB, NLB, GCP LB) pointing to NodePort/ClusterIP — external access. ExternalName: maps service to external DNS. Production external traffic typically: Ingress → Service or LoadBalancer Service.',
        cmd: 'kubectl expose deployment api -n prod --port=8080 --target-port=8080 --type=ClusterIP\nkubectl get svc api -n prod -o wide\n# LoadBalancer\nkubectl patch svc api -n prod -p \'{"spec":{"type":"LoadBalancer"}}\'',
      },
      {
        q: 'Describe how kube-proxy routes traffic to pod endpoints.',
        a: 'kube-proxy (or CNI replacement like Cilium) watches Services and Endpoints/EndpointSlices, programming rules on each node. iptables/IPVS modes DNAT ClusterIP:port to pod IP:port. Only Ready pods appear in endpoints (readiness probe governs). SessionAffinity: ClientIP sticks sessions to same pod for stateful interactions.',
        cmd: 'kubectl get endpointslices -n prod -l kubernetes.io/service-name=api\nkubectl get pods -n kube-system -l k8s-app=kube-proxy\n# Cilium: cilium service list\nkubectl run curl --rm -it --image=curlimages/curl -n prod -- curl -v http://api:8080/health',
      },
      {
        q: 'How would you explain headless Services to a new team member?',
        a: 'Headless Service (clusterIP: None) does not allocate VIP — DNS returns individual pod A records directly. Used by StatefulSets for stable per-pod DNS (pod-0.my-svc.ns.svc.cluster.local). Clients connect to specific pods or use client-side load balancing. Required for StatefulSet identity and some databases/cluster software.',
        cmd: 'kubectl get svc db -n prod -o yaml | grep clusterIP\nkubectl run dns --rm -it --image=busybox:1.36 -n prod -- nslookup db.prod.svc.cluster.local\ndig db-0.db.prod.svc.cluster.local +short',
      },
    ],
    medium: [
      {
        q: 'How do you implement session affinity and external traffic policies in production?',
        a: 'sessionAffinity: ClientIP with timeoutSeconds for sticky sessions when app lacks shared session store — prefer external session store (Redis) instead. externalTrafficPolicy: Local preserves source IP on LoadBalancer/NodePort but may cause uneven load if pods not on all nodes — use topology-aware hints or ensure even pod distribution. Cluster (default) SNATs source IP at node.',
        cmd: 'kubectl patch svc api -n prod -p \'{"spec":{"sessionAffinity":"ClientIP","sessionAffinityConfig":{"clientIP":{"timeoutSeconds":3600}}}}\'\nkubectl get svc api -n prod -o jsonpath=\'{.spec.externalTrafficPolicy}\'\nkubectl describe svc api -n prod | grep -A5 "Session Affinity"',
      },
      {
        q: 'What are common pitfalls with Service selectors and named ports?',
        a: 'Selector mismatch (app: api vs app: api-v2) → empty endpoints → connection refused. Port name typos in Ingress/monitoring break references. targetPort as string referencing container port name is safer than numeric when ports change. Forgetting readiness probe → not-ready pods excluded silently reducing capacity. Always verify endpoints before debugging app code.',
        cmd: 'kubectl get svc api -n prod -o jsonpath=\'{.spec.selector}\'\nkubectl get endpoints api -n prod\nkubectl get pods -n prod -l app=api --show-labels\nkubectl describe svc api -n prod | grep -A10 Endpoints',
      },
      {
        q: 'Compare ClusterIP Service discovery with environment variables vs DNS.',
        a: 'Legacy: Kubernetes injects env vars (API_SERVICE_HOST/PORT) for Services existing at pod creation — does not update dynamically, not recommended. DNS (CoreDNS): always current, standard approach — short name within namespace, FQDN cross-namespace. CoreDNS stub domains and ndots affect resolution. Debug with nslookup/dig from debug pod.',
        cmd: 'kubectl run debug --rm -it --image=busybox:1.36 -n prod -- sh\n# nslookup api\n# nslookup api.default.svc.cluster.local\nkubectl get pods -n kube-system -l k8s-app=kube-dns\nkubectl logs -n kube-system -l k8s-app=kube-dns --tail=30',
      },
      {
        q: 'How do you troubleshoot Service connectivity issues between namespaces?',
        a: 'Verify DNS: FQDN service.namespace.svc.cluster.local. Check NetworkPolicy allows egress/ingress on port. Confirm endpoints non-empty and pods Ready. Test with kubectl run curl pod in source namespace. For cross-cluster, use multi-cluster Services or service mesh. Misconfigured service mesh sidecar injection can block traffic — check mTLS policies.',
        cmd: 'kubectl run curl -n frontend --rm -it --image=curlimages/curl -- curl -sv http://api.backend.svc.cluster.local:8080\nkubectl get networkpolicy -n backend\nkubectl get endpoints api -n backend\nkubectl auth can-i get services -n backend --as=system:serviceaccount:frontend:default',
      },
    ],
    hard: [
      {
        q: 'Design a multi-cluster Service discovery strategy for disaster recovery.',
        a: 'Options: global load balancer with health checks per cluster, Submariner/Liqo multi-cluster Services, service mesh (Istio multi-primary), or DNS failover (Route53). Active-active requires data layer replication and conflict handling. Active-passive simpler: standby cluster warm with scaled-to-zero or minimal replicas, failover updates DNS/LB. Avoid split-brain with leader election at data tier.',
        cmd: '# Submariner export\nsubctl export service api -n prod\nsubctl show connections\n# Route53 failover\naws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://failover.json',
      },
      {
        q: 'How would you optimize Service load balancing for gRPC long-lived connections?',
        a: 'kube-proxy round-robin does not rebalance existing TCP/gRPC connections — leads to hot pods. Solutions: client-side load balancing with headless Service + gRPC resolver, service mesh (Envoy LB), or proxy layer (nginx with upstream keepalive and least_conn). Set appropriate connection limits and HPA on custom metrics (active streams).',
        cmd: 'kubectl get svc api -n prod -o yaml | grep clusterIP\n# Headless for gRPC\nkubectl patch svc api -n prod -p \'{"spec":{"clusterIP":"None"}}\'\n# Istio DestinationRule\nkubectl apply -f api-destinationrule.yaml',
      },
      {
        q: 'Explain kube-proxy modes and when IPVS or eBPF dataplanes outperform iptables.',
        a: 'iptables: default, O(n) rules per service causing latency at thousands of services. IPVS: hash-based, better performance at scale, supports more LB algorithms. eBPF (Cilium): bypass kube-proxy, direct pod-to-pod with policy enforcement, lower latency. Migration: test rule sync during upgrades, verify health check node ports on LoadBalancer with externalTrafficPolicy Local.',
        cmd: 'kubectl get configmap kube-proxy -n kube-system -o yaml | grep mode\nkubectl exec -n kube-system ds/kube-proxy -- ipvsadm -Ln 2>/dev/null || echo "iptables mode"\ncilium status | grep KubeProxyReplacement',
      },
      {
        q: 'Lead an incident review where stale Endpoints caused black-holed traffic — what do you present?',
        a: 'Scenario: pods terminated but endpoints not updated due to endpoint controller lag during apiserver outage; traffic sent to dead pods. Impact: 15% error rate until cache refreshed. Root cause: apiserver instability + long terminationGracePeriod without preStop deregistration. Fix: implement preStop hook, reduce endpoints sync dependency with service mesh outlier detection, apiserver HA hardening. Added alert on endpoints count vs ready pods mismatch.',
        cmd: 'kubectl get endpoints api -n prod -o yaml\nkubectl get pods -n prod -l app=api -o wide\nkubectl get events -n prod | grep -i endpoint\n# Compare counts\nkubectl get pods -l app=api -n prod --field-selector status.phase=Running | wc -l',
      },
    ],
  },

  ingress: {
    easy: [
      {
        q: 'What is an Ingress resource and how does it differ from a LoadBalancer Service?',
        a: 'Ingress defines HTTP/HTTPS routing rules (host, path) to backend Services — single entry point with TLS termination, path-based routing, and virtual hosts. Requires an Ingress Controller (nginx, traefik, AWS ALB) to implement rules. LoadBalancer Service creates one LB per Service — expensive at scale. Ingress consolidates many routes behind one LB.',
        cmd: 'kubectl get ingress -n prod\nkubectl describe ingress api-ingress -n prod\nkubectl get svc -n ingress-nginx\nkubectl get pods -n ingress-nginx',
      },
      {
        q: 'Explain how Ingress maps hostnames and paths to Services.',
        a: 'spec.rules[].host matches Host header (api.example.com). paths[].path with pathType Prefix/Exact/ImplementationSpecific route to backend service name and port number. Default backend catches unmatched requests. TLS section references Secret with cert/key for HTTPS. Controller watches Ingress and configures reverse proxy (nginx.conf, ALB listener rules).',
        cmd: 'kubectl get ingress api -n prod -o yaml\nkubectl explain ingress.spec.rules\n# Test routing\ncurl -H "Host: api.example.com" http://<ingress-ip>/v1/health',
      },
      {
        q: 'Describe a basic TLS setup for Ingress.',
        a: 'Create kubernetes.io/tls Secret with tls.crt and tls.key (from cert-manager or manual). Reference in ingress.spec.tls[].secretName and hosts. Controller terminates TLS and forwards plain HTTP or re-encrypts to backends. cert-manager automates Let\'s Encrypt via ClusterIssuer — preferred for production cert lifecycle.',
        cmd: 'kubectl create secret tls api-tls --cert=tls.crt --key=tls.key -n prod\nkubectl apply -f ingress-tls.yaml\nkubectl get certificate -n prod  # cert-manager\nkubectl describe certificate api-tls -n prod',
      },
      {
        q: 'How would you explain ingressClassName to a new team member?',
        a: 'ingressClassName selects which Ingress Controller handles the Ingress (nginx vs alb vs traefik). IngressClass resource defines controller value (k8s.io/ingress-nginx). Without class, default controller may pick it up — ambiguous in multi-controller clusters. Always specify ingressClassName explicitly in production.',
        cmd: 'kubectl get ingressclass\nkubectl get ingress api -n prod -o jsonpath=\'{.spec.ingressClassName}\'\nkubectl annotate ingress api -n prod kubectl.kubernetes.io/ingress.class=nginx  # legacy',
      },
    ],
    medium: [
      {
        q: 'How do you implement path-based routing and canary traffic with Ingress?',
        a: 'Native Ingress: multiple paths to different Services (/api → api-svc, /web → web-svc). Canary: nginx ingress annotations (canary, canary-weight), Traefik weighted services, or Istio/Gateway API HTTPRoute with weights. Gateway API (HTTPRoute) is the modern replacement with better role separation and traffic splitting.',
        cmd: 'kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: api-canary\n  namespace: prod\n  annotations:\n    nginx.ingress.kubernetes.io/canary: "true"\n    nginx.ingress.kubernetes.io/canary-weight: "10"\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: api.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: api-canary\n            port:\n              number: 8080\nEOF',
      },
      {
        q: 'What are common pitfalls with Ingress annotations and controller-specific behavior?',
        a: 'Annotations differ per controller — nginx.ingress.kubernetes.io/* vs alb.ingress.kubernetes.io/*. Copy-paste from docs of wrong controller silently ignored. Large annotation sets not portable. Prefer Gateway API for portability. SSL redirect, body size, timeout annotations must match controller version. Test in staging with same controller version as prod.',
        cmd: 'kubectl get ingress -n prod -o json | jq \'.items[].metadata.annotations\'\nkubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- nginx -T | grep api.example.com -A20\nhelm list -n ingress-nginx',
      },
      {
        q: 'Compare Ingress vs Gateway API for new projects.',
        a: 'Ingress: mature, wide support, annotation-heavy, limited TCP/UDP, no role separation. Gateway API: expressive (HTTPRoute, GRPCRoute, TCPRoute), role-oriented (platform vs app teams), standard traffic splitting, better extensibility. Migration path: install Gateway controller (nginx, Istio, Cilium), create Gateway (infra) + HTTPRoute (app teams).',
        cmd: 'kubectl get gatewayclass\nkubectl get gateway -A\nkubectl get httproute -n prod\nkubectl describe httproute api-route -n prod',
      },
      {
        q: 'How do you monitor Ingress controller health and request errors?',
        a: 'Scrape controller metrics (nginx_ingress_controller_requests, request_duration). Alert on 5xx rate, cert expiry (ssl_cert_not_after), config reload failures. Log access logs centrally. Synthetic probes through Ingress VIP. Monitor controller pod restarts and admission webhook latency. For ALB: CloudWatch HTTPCode_Target_5XX.',
        cmd: 'kubectl top pods -n ingress-nginx\nkubectl logs -n ingress-nginx deploy/ingress-nginx-controller --tail=50 | grep error\ncurl -s http://ingress-controller-metrics:10254/metrics | grep nginx_ingress_controller_nginx_process_requests_total',
      },
    ],
    hard: [
      {
        q: 'Design a highly available Ingress architecture handling 100k RPS.',
        a: 'Multiple controller replicas with PodAntiAffinity across AZs, HPA on CPU/connections. External LB (NLB/GLB) with cross-zone load balancing. Separate internal/external Ingress tiers. WAF at edge (Cloudflare, AWS WAF). TLS at LB or controller with session ticket optimization. Backend keepalive, appropriate worker_connections. Rate limiting annotations or WAF rules. CDN for static assets.',
        cmd: 'kubectl get deploy -n ingress-nginx -o wide\nkubectl get hpa -n ingress-nginx\nkubectl describe svc ingress-nginx-controller -n ingress-nginx | grep -A5 "Load Balancer"\n# NLB cross-zone\nkubectl annotate svc ingress-nginx-controller -n ingress-nginx service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled=true',
      },
      {
        q: 'How would you implement automatic TLS certificate rotation with cert-manager?',
        a: 'Install cert-manager, create ClusterIssuer (Let\'s Encrypt prod with DNS-01 for wildcards or HTTP-01 for host routes). Certificate resource or ingress annotation cert-manager.io/cluster-issuer triggers ACME order. cert-manager renews at 2/3 lifetime. Monitor Certificate Ready=False, cert expiry metrics. Use separate issuers for staging vs prod. Backup account key.',
        cmd: 'kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml\nkubectl get clusterissuer\nkubectl describe certificate api-tls -n prod\nkubectl get certificaterequest -n prod',
      },
      {
        q: 'Explain failure scenarios when Ingress backend Service has no ready endpoints.',
        a: 'Controller returns 502/503 to clients. Causes: all pods failing readiness, selector mismatch, wrong service port, NetworkPolicy blocking controller→pod. Debug: kubectl get endpoints, describe ingress backend, curl from controller pod to service ClusterIP. During rollouts, brief 502s if maxUnavailable > 0 without enough ready replicas — tune rollout and probes.',
        cmd: 'kubectl get endpoints api -n prod\nkubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- curl -sv http://api.prod.svc.cluster.local:8080/health\nkubectl describe ingress api -n prod | grep -A10 "Backends"',
      },
      {
        q: 'Lead an incident review where Ingress misconfiguration exposed internal admin APIs — what do you present?',
        a: 'Root cause: wildcard path / routed to wrong backend including /admin; missing IP allowlist and auth at Ingress layer. Impact: unauthorized access to admin endpoints. Remediation: path-specific routes, OAuth2 proxy sidecar or nginx auth annotations, NetworkPolicy restricting admin Service to internal CIDR, WAF rules. Process: Ingress manifest review in PR, OPA policy denying catch-all / to sensitive namespaces.',
        cmd: 'kubectl get ingress -n prod -o yaml | grep -B5 -A15 "path: /"\nkubectl auth can-i --list --as=system:serviceaccount:prod:ingress-nginx\n# Add IP whitelist annotation\nkubectl annotate ingress admin -n prod nginx.ingress.kubernetes.io/whitelist-source-range="10.0.0.0/8" --overwrite',
      },
    ],
  },

  configmaps: {
    easy: [
      {
        q: 'What is a ConfigMap and when should you use one?',
        a: 'ConfigMap stores non-sensitive configuration as key-value pairs or file content (up to 1MB per object). Mount as files in pod volumes or inject as environment variables. Use for app settings, feature flags, config files — not secrets (use Secret resource). Changes to mounted ConfigMaps propagate to pods asynchronously (kubelet sync ~60s) unless using subPath (no auto-update).',
        cmd: 'kubectl create configmap app-config --from-literal=LOG_LEVEL=info --from-literal=ENV=prod -n prod\nkubectl get configmap app-config -n prod -o yaml\nkubectl describe configmap app-config -n prod',
      },
      {
        q: 'Explain mounting a ConfigMap as a volume vs environment variables.',
        a: 'Env vars: injected at pod start, good for simple key-value, requires pod restart to pick up changes. Volume mount: projects keys as files in directory, supports config files, auto-updates in place (apps must watch/reload). subPath mounts single file but does NOT update on ConfigMap change. Prefer volumes for file-based config with reload support.',
        cmd: 'kubectl apply -f pod-with-configmap.yaml\nkubectl exec app-pod -n prod -- cat /etc/config/app.properties\nkubectl exec app-pod -n prod -- printenv LOG_LEVEL\nkubectl get pod app-pod -n prod -o jsonpath=\'{.spec.volumes[*].configMap.name}\'',
      },
      {
        q: 'Describe a basic use case for immutable ConfigMaps.',
        a: 'immutable: true prevents updates/deletes — kubelet uses watch-based injection avoiding periodic API polls, improving control plane performance at scale. Trade-off: must create new ConfigMap name (app-config-v2) and update pod spec reference to change config — aligns with GitOps and versioned config. Recommended for large clusters with many ConfigMap-mounted pods.',
        cmd: 'kubectl create configmap static-config --from-file=nginx.conf -n prod --dry-run=client -o yaml | kubectl apply -f -\nkubectl patch configmap static-config -n prod -p \'{"immutable":true}\'\n# To update: create static-config-v2 and update deployment volume reference',
      },
      {
        q: 'How would you explain the 1MB ConfigMap size limit to a new team member?',
        a: 'etcd stores ConfigMaps; large objects hurt API performance and hit request size limits. Split large configs into multiple ConfigMaps or use init containers to fetch from object storage (S3/GCS). For extensive static assets, use volumes backed by PVC or CDN — not ConfigMaps. Monitor config size in CI linting.',
        cmd: 'kubectl get configmap large-config -n prod -o json | wc -c\nkubectl create configmap test-size --from-file=big.json -n prod --dry-run=client -o yaml | wc -c\n# Alternative: init container fetch\nkubectl logs app-pod -n prod -c config-fetcher',
      },
    ],
    medium: [
      {
        q: 'How do you implement hot-reload of ConfigMap changes without pod restart?',
        a: 'Mount ConfigMap as volume (not subPath, not env). Application watches file changes (inotify) or polls periodically — Spring @RefreshScope, nginx -s reload, custom SIGHUP handler. For Deployments, add checksum annotation of ConfigMap hash to pod template triggering rolling restart when config changes (reloader/stakater/Reloader operator automates this). Choose based on app reload capability.',
        cmd: 'kubectl patch configmap app-config -n prod --patch \'{"data":{"LOG_LEVEL":"debug"}}\'\nkubectl exec app-pod -n prod -- ls -la /etc/config/\n# Stakater Reloader\nkubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml\nkubectl annotate deployment app -n prod reloader.stakater.com/auto="true"',
      },
      {
        q: 'What are common pitfalls when ConfigMaps are not mounted correctly?',
        a: 'Wrong key name in volume items mapping. ConfigMap in different namespace (must be same ns as pod). Missing volumeMount path. subPath prevents updates. Env var from ConfigMap key missing → container fails CreateContainerConfigError. Deployment pod template not updated after ConfigMap change when using env (stale values until restart). Always kubectl describe pod for mount errors.',
        cmd: 'kubectl describe pod app-pod -n prod | grep -A10 "Mounts:\\|Volumes:"\nkubectl get events -n prod | grep -i "configmap\\|CreateContainerConfig"\nkubectl get pod app-pod -n prod -o yaml | grep -A20 volumes',
      },
      {
        q: 'Compare ConfigMaps with external configuration stores (Consul, Vault, AWS AppConfig).',
        a: 'ConfigMaps: native, GitOps-friendly, no extra infra, limited size, no encryption at rest by default. External stores: dynamic config, audit, encryption, fine-grained ACL — add dependency and latency. Hybrid: bootstrap from ConfigMap, runtime from external via sidecar (consul-template) or CSI Secret Store driver. Choose native for static config; external for frequently changing or compliance-heavy config.',
        cmd: 'kubectl get pods -n prod -l app=vault-agent\nkubectl exec app-pod -n prod -c vault-agent -- cat /vault/secrets/config\n# CSI: kubectl get secretproviderclass\nhelm list -n kube-system | grep secrets-store',
      },
      {
        q: 'How do you monitor and audit ConfigMap changes in production?',
        a: 'Enable audit logging for ConfigMap create/update/delete. Use GitOps (Argo CD) for declarative changes with PR review. Kyverno/Gatekeeper policies restrict who can modify prod ConfigMaps. Alert on unexpected ConfigMap changes via audit webhook. For runtime drift, compare live vs git with kubectl diff. Reloader logs config-triggered rollouts.',
        cmd: 'kubectl get events -A --field-selector involvedObject.kind=ConfigMap\nkubectl auth can-i update configmaps -n prod --as=system:serviceaccount:ci:deployer\nargocd app diff prod-app\nkubectl logs -n reloader deploy/reloader --tail=20',
      },
    ],
    hard: [
      {
        q: 'Design a configuration management strategy for 100 microservices across environments.',
        a: 'Kustomize overlays per env (base + dev/staging/prod patches). ConfigMaps generated from env files in git. Sealed Secrets or External Secrets for sensitive overlap. Reloader triggers rollouts on config change. Naming convention: {service}-config-{env}. CI validates config schema (JSON Schema/cue). No manual kubectl edit in prod — GitOps only. Feature flags in dedicated service (LaunchDarkly) for dynamic toggles.',
        cmd: 'kustomize build overlays/prod | kubectl apply --dry-run=client -f -\nkubectl get configmap -n prod -l app.kubernetes.io/part-of=platform\nargocd app sync prod-services --dry-run\nkubectl diff -k overlays/prod',
      },
      {
        q: 'How would you optimize ConfigMap volume propagation at scale (5000+ pods)?',
        a: 'Use immutable ConfigMaps to enable kubelet watch-based updates vs polling. Reduce number of distinct ConfigMaps — shared base config with app-specific overlays. Avoid mounting huge ConfigMaps — use init container or artifact server. Split clusters by blast radius. Monitor apiserver LIST configmaps QPS. Consider node-local cache (Konfig) patterns for read-heavy static config.',
        cmd: 'kubectl get configmaps -A --no-headers | wc -l\nkubectl get --raw /metrics | grep apiserver_request_total | grep configmaps\nkubectl get pods -A -o json | jq \'[.items[].spec.volumes[]? | select(.configMap)] | length\'',
      },
      {
        q: 'Explain failure scenarios when ConfigMap and Deployment get out of sync.',
        a: 'Operator updates ConfigMap but Deployment unchanged — pods run stale env vars until manual restart. Rolling update mid-config change causes mixed config versions — brief inconsistent behavior. Mitigation: checksum annotation on pod template, atomic config releases (new ConfigMap name + deployment update in single transaction), integration tests verifying config version endpoint. Document config version in /health response.',
        cmd: 'kubectl get deployment app -n prod -o jsonpath=\'{.spec.template.metadata.annotations}\' | jq\nkubectl exec app-pod-1 -n prod -- printenv CONFIG_VERSION\nkubectl exec app-pod-2 -n prod -- printenv CONFIG_VERSION\nkubectl rollout restart deployment/app -n prod',
      },
      {
        q: 'Lead an incident review where a bad ConfigMap rollout caused production misconfiguration — what do you present?',
        a: 'Change: LOG_LEVEL=debug pushed to prod ConfigMap, mounted as env — no pod restart, but new pods from HPA scale-up picked debug causing log volume spike and disk pressure on logging pipeline. Root cause: env-based ConfigMap without rollout trigger; no prod change review. Fix: switch to Reloader, block direct ConfigMap edits via RBAC, require PR for prod overlays. Added config diff gate in CI.',
        cmd: 'kubectl get configmap app-config -n prod -o yaml | grep LOG_LEVEL\nkubectl get events -n logging | grep -i disk\nkubectl rollout history deployment/app -n prod\nkubectl annotate deployment app -n prod reloader.stakater.com/auto=true',
      },
    ],
  },

  secrets: {
    easy: [
      {
        q: 'What is a Kubernetes Secret and how does it differ from a ConfigMap?',
        a: 'Secrets store sensitive data (passwords, tokens, TLS keys) as base64-encoded values in etcd (encrypted at rest if encryption at rest enabled). Types: Opaque, kubernetes.io/tls, kubernetes.io/dockerconfigjson, bootstrap token. Same consumption patterns as ConfigMap (env/volume). Never commit plain secrets to git — use Sealed Secrets, External Secrets Operator, or cloud secret managers.',
        cmd: 'kubectl create secret generic db-creds --from-literal=username=app --from-literal=password=\'s3cr3t\' -n prod\nkubectl get secret db-creds -n prod\nkubectl describe secret db-creds -n prod  # values hidden',
      },
      {
        q: 'Explain how to mount a TLS Secret for Ingress or application use.',
        a: 'Create kubernetes.io/tls Secret with tls.crt and tls.key. Reference in Ingress spec.tls[].secretName or mount as volume at /etc/tls in pod. cert-manager creates and renews these automatically. For mTLS, mount ca.crt alongside. Pods can read Secrets only if RBAC allows the ServiceAccount.',
        cmd: 'kubectl create secret tls api-tls --cert=fullchain.pem --key=privkey.pem -n prod\nkubectl get secret api-tls -n prod -o jsonpath=\'{.type}\'\nkubectl apply -f ingress-with-tls.yaml',
      },
      {
        q: 'Describe a basic use case for imagePullSecrets.',
        a: 'Private container registries require authentication. Create docker-registry Secret with registry credentials; reference in pod spec.imagePullSecrets or ServiceAccount.imagePullSecrets for automatic injection. EKS/GKE/ACR often use IAM/workload identity instead of long-lived docker config.',
        cmd: 'kubectl create secret docker-registry regcred \\\n  --docker-server=myregistry.io \\\n  --docker-username=robot \\\n  --docker-password=token -n prod\nkubectl patch serviceaccount default -n prod -p \'{"imagePullSecrets":[{"name":"regcred"}]}\'',
      },
      {
        q: 'How would you explain that base64 in Secrets is not encryption?',
        a: 'Base64 is encoding, trivially reversible — anyone with RBAC get secret access reads values. Real protection: RBAC least privilege, encryption at rest (KMS), avoid logging secret values, use external secret managers, enable audit logging. Never expose secrets in env vars to processes that dump environ or in CI logs.',
        cmd: 'kubectl get secret db-creds -n prod -o jsonpath=\'{.data.password}\' | base64 -d; echo\nkubectl auth can-i get secrets -n prod --as=system:serviceaccount:dev:default\nkubectl get encryptionconfig  # check if encryption at rest configured',
      },
    ],
    medium: [
      {
        q: 'How do you implement External Secrets Operator with AWS Secrets Manager?',
        a: 'Install ESO, create SecretStore/ClusterSecretStore with IAM role (IRSA on EKS). ExternalSecret defines remote key mapping to K8s Secret. ESO syncs on interval; target Secret owned by ESO. Rotate in AWS; ESO updates K8s Secret; Reloader restarts pods. Avoid storing long-lived creds in git; reference AWS ARN only.',
        cmd: 'kubectl apply -f clustersecretstore-aws.yaml\nkubectl apply -f externalsecret-db.yaml\nkubectl get externalsecret -n prod\nkubectl get secret db-creds -n prod -o yaml | grep ownerReferences -A5',
      },
      {
        q: 'What are common pitfalls with Secret rotation in running pods?',
        a: 'Mounted Secrets update on disk (~kubelet sync) but apps cache credentials at startup — DB connection pools hold old password after rotation. Mitigation: dual-credential window, app reload on file change, rolling restart after rotation, use dynamic credentials (Vault DB engine). For TLS, ensure apps reload certs or restart via Reloader.',
        cmd: 'kubectl patch secret db-creds -n prod -p \'{"data":{"password":"\'$(echo -n newpass | base64)\'"}}\'\nkubectl exec app-pod -n prod -- cat /var/run/secrets/db/password\nkubectl rollout restart deployment/app -n prod\nkubectl logs app-pod -n prod | grep -i "auth\\|connection refused"',
      },
      {
        q: 'Compare Sealed Secrets vs External Secrets vs Vault Agent sidecar.',
        a: 'Sealed Secrets: encrypt Secret manifest for git storage, cluster-specific sealing key, good for GitOps static secrets. External Secrets: pull from cloud SM at runtime, central rotation. Vault Agent: dynamic secrets, sidecar injects files, best for short-lived creds, more operational complexity. Choose based on secret lifecycle and compliance requirements.',
        cmd: 'kubeseal --format yaml < secret.yaml > sealedsecret.yaml\nkubectl apply -f sealedsecret.yaml\nkubectl get sealedsecret -n prod\nkubectl get secret -n prod -l sealedsecrets.bitnami.com/sealed-secrets-manager',
      },
      {
        q: 'How do you audit Secret access and prevent accidental exposure?',
        a: 'RBAC: restrict get/list/watch secrets to necessary ServiceAccounts. Audit policy logs secret access. OPA/Gatekeeper: deny Secret creation without owner label, block secrets in env for prod namespaces. Scan git with gitleaks/trufflehog. Disable secret printing in describe (default). Use ephemeral containers carefully — they inherit SA permissions.',
        cmd: 'kubectl auth can-i get secrets --as=system:serviceaccount:prod:api -n prod\nkubectl get rolebinding -n prod -o yaml | grep -B5 secret\nkubectl get events -A --field-selector reason=Forbidden | grep secret',
      },
    ],
    hard: [
      {
        q: 'Design a zero-trust secrets architecture for a multi-tenant Kubernetes platform.',
        a: 'Per-tenant namespace isolation with NetworkPolicy. External Secrets from tenant-specific vault paths. IRSA/workload identity — no static cloud keys. Encryption at rest with per-cluster KMS. Secret rotation automation with Reloader. Admission policy denying Opaque secrets without external-secrets owner. Audit all secret reads. Break-glass access via PAM with MFA and session recording.',
        cmd: 'kubectl get namespaces -L tenant\nkubectl get networkpolicy -A\nkubectl apply -f deny-manual-secrets-policy.yaml\naws kms describe-key --key-id alias/k8s-etcd-encryption',
      },
      {
        q: 'How would you handle etcd encryption at rest key rotation?',
        a: 'Configure EncryptionConfiguration with identity + aescbc/kms provider. Rotate: add new key as first in sequence, run kube-apiserver with updated config, run encryption-provider-config-rotation.sh (or manual re-encrypt all secrets via kubectl get/apply). Remove old key after all objects re-encrypted. Test restore from backup after rotation in staging.',
        cmd: 'kubectl get secrets -A -o json | kubectl replace -f -  # triggers re-encrypt\n# Verify encryption\nkubectl get --raw /metrics | grep apiserver_storage_data_key\n# EKS: aws eks associate-encryption-config',
      },
      {
        q: 'Explain failure scenarios when Secret sync fails silently.',
        a: 'ExternalSecret status Degraded but Deployment still references stale K8s Secret — app runs with expired creds until auth failure. ESO IAM misconfiguration stops sync; no alert. Mitigation: monitor externalsecret_status_condition, alert on Secret age > rotation interval, liveness that validates credential validity, integration test post-rotation.',
        cmd: 'kubectl describe externalsecret db-creds -n prod\nkubectl get secret db-creds -n prod -o jsonpath=\'{.metadata.creationTimestamp}\'\nkubectl logs -n external-secrets deploy/external-secrets --tail=30',
      },
      {
        q: 'Lead an incident review where Secret rotation broke the application — what do you present?',
        a: 'Timeline: AWS SM rotated DB password → ESO updated K8s Secret → pods not restarted → connection pool auth failures → outage. Root cause: no Reloader, app does not reload DB creds. Fix: immediate rollout restart, implement Reloader + rotation runbook with dual-password support window. Prevention: automated post-rotation health check job, alert on DB auth error rate spike within 5min of secret update.',
        cmd: 'kubectl rollout restart deployment/api -n prod\nkubectl get secret db-creds -n prod -o jsonpath=\'{.metadata.resourceVersion}\'\nkubectl logs -l app=api -n prod | grep -i "password authentication failed" | tail -10',
      },
    ],
  },

  'persistent-volumes': {
    easy: [
      {
        q: 'Explain the relationship between PersistentVolume, PersistentVolumeClaim, and Pods.',
        a: 'PV is cluster storage resource (admin or dynamic provisioner). PVC is user storage request (size, access mode, storageClass). Binding matches PVC to PV. Pod references PVC in volumes.persistentVolumeClaim. Dynamic provisioning creates PV automatically when PVC created with storageClassName. Access modes: RWO (single node), RWX (multi node read-write), ROX (read-only many).',
        cmd: 'kubectl get pv,pvc -A\nkubectl describe pvc data-api-0 -n prod\nkubectl get pod db-0 -n prod -o jsonpath=\'{.spec.volumes[*].persistentVolumeClaim.claimName}\'',
      },
      {
        q: 'What are PersistentVolume access modes and reclaim policies?',
        a: 'AccessModes: ReadWriteOnce (most block storage), ReadWriteMany (NFS/EFS), ReadOnlyMany. reclaimPolicy on PV: Retain (manual cleanup after PVC delete), Delete (cloud volume deleted with PVC), Recycle (deprecated). Production dynamic volumes typically use Delete with backup strategy for stateful data.',
        cmd: 'kubectl get pv -o custom-columns=NAME:.metadata.name,ACCESS:.spec.accessModes,RECLAIM:.spec.persistentVolumeReclaimPolicy,STATUS:.status.phase\nkubectl explain persistentvolume.spec',
      },
      {
        q: 'Describe a basic StatefulSet volumeClaimTemplate use case.',
        a: 'StatefulSet volumeClaimTemplates auto-create per-pod PVCs (data-db-0, data-db-1) with stable binding — pod-0 always reattaches same volume after reschedule. Used for databases, Kafka, Elasticsearch. Headless Service provides stable network ID. Ordered rollout: pod-1 starts after pod-0 ready.',
        cmd: 'kubectl get statefulset db -n prod\nkubectl get pvc -n prod | grep data-db\nkubectl describe pod db-0 -n prod | grep -A5 "Volumes:"\nkubectl get statefulset db -n prod -o jsonpath=\'{.spec.volumeClaimTemplates[0].spec}\' | jq',
      },
      {
        q: 'How would you explain volume mounting in a Pod spec?',
        a: 'Pod spec.volumes defines PVC reference; containers.volumeMounts specifies mountPath, readOnly, subPath. Permissions depend on fsGroup in securityContext for volume ownership. mountPropagation for host-to-container propagation (rare). Init containers can mount same PVC for prep (chown, format).',
        cmd: 'kubectl get pod app-0 -n prod -o yaml | grep -A30 volumeMounts\nkubectl exec app-0 -n prod -- df -h /data\nkubectl exec app-0 -n prod -- ls -la /data',
      },
    ],
    medium: [
      {
        q: 'How do you implement backup and restore for PersistentVolumes?',
        a: 'Velero for cluster-level PV backup (snapshots via CSI or restic file backup). Cloud-native snapshots (EBS snapshot, GCP disk snapshot) via VolumeSnapshot CRD. Schedule backups, test restores quarterly. For RWO volumes, scale StatefulSet to 0 or use snapshot without quiesce for crash-consistent (prefer app-level backup for DBs). Document RPO/RTO per tier.',
        cmd: 'kubectl get volumesnapshotclass\nvelero backup create prod-daily --include-namespaces prod --snapshot-volumes\nvelero restore create --from-backup prod-daily-20240619\nkubectl get volumesnapshot -n prod',
      },
      {
        q: 'What are common pitfalls with zone-bound PersistentVolumes?',
        a: 'EBS/GCE PD volumes are zone-specific — pod rescheduling to another AZ fails with FailedAttachVolume. Mitigation: topology-aware provisioning, pod affinity to zone, or regional volumes (EFS, Filestore, Ceph). StatefulSet pod-0 in us-east-1a cannot move to 1b without volume migration. Check PV nodeAffinity for allowed topologies.',
        cmd: 'kubectl describe pv pvc-abc -n prod | grep -A10 NodeAffinity\nkubectl get pv -o custom-columns=NAME:.metadata.name,ZONE:.metadata.labels.topology\\.kubernetes\\.io/zone\nkubectl describe pod db-0 -n prod | grep -i "FailedAttach\\|volume"',
      },
      {
        q: 'Compare block storage (RWO) vs shared filesystem (RWX) for Kubernetes workloads.',
        a: 'RWO block (EBS, PD): high IOPS, single writer, databases, etcd. RWX NFS/EFS: multiple pods read-write same data, content management, shared config — lower IOPS, higher latency. ROX for read-heavy shared data. Match access mode to app architecture; do not force RWX on block-only storage classes.',
        cmd: 'kubectl get storageclass\nkubectl get pvc -n prod -o custom-columns=NAME:.metadata.name,ACCESS:.spec.accessModes,CLASS:.spec.storageClassName\nkubectl describe sc gp3 | grep -A5 Parameters',
      },
      {
        q: 'How do you troubleshoot PVC stuck in Pending state?',
        a: 'Events show: no StorageClass, provisioner failure, insufficient quota, no matching PV for static provisioning, topology mismatch. Check: kubectl describe pvc, storageclass exists, CSI driver pods healthy, cloud IAM permissions, default StorageClass annotation. For bound delay, verify dynamic provisioner logs.',
        cmd: 'kubectl describe pvc data-pending -n prod\nkubectl get storageclass\nkubectl get pods -n kube-system -l app=ebs-csi-controller\nkubectl logs -n kube-system deploy/ebs-csi-controller --tail=30',
      },
    ],
    hard: [
      {
        q: 'Design storage architecture for a PostgreSQL HA cluster on Kubernetes.',
        a: 'Prefer managed RDS/Cloud SQL for production Postgres; if in-cluster: CloudNativePG or Crunchy Operator with RWO gp3/io2, synchronous replication, Velero backups, PDB. Separate WAL and data volumes. node affinity for IO-heavy nodes. Monitor disk latency and replication lag. Avoid NFS for Postgres data dir. Test failover and restore regularly.',
        cmd: 'kubectl get cluster -n prod  # CloudNativePG\nkubectl cnpg status pg-prod -n prod\nkubectl get pvc -n prod -l cnpg.io/cluster=pg-prod\nvelero schedule create pg-backup --schedule="0 2 * * *" --include-namespaces prod',
      },
      {
        q: 'How would you migrate PersistentVolumes between clusters or storage classes?',
        a: 'Velero backup/restore cross-cluster with matching StorageClass mapping. Or: snapshot PV → create new PVC from VolumeSnapshot in target SC → rsync data → switch app. For live migration, use vendor tools (Portworx, Rook migration). Plan downtime or dual-write window. Validate checksums post-migration.',
        cmd: 'kubectl create volumesnapshot data-snap --source-persistent-volume-claim-name=data-db-0 -n prod\nkubectl get volumesnapshot data-snap -n prod\nvelero restore create migrate --from-backup source-cluster-backup --storage-class-mappings old-sc:new-sc',
      },
      {
        q: 'Explain volume expansion and its limitations.',
        a: 'PVC spec.resources.requests.storage can increase if StorageClass allowVolumeExpansion: true and CSI driver supports it. Patch PVC size; controller expands volume and filesystem (if supported). Cannot shrink. Some file systems require pod restart for FS expand. RWX expansion behavior varies by provider. Test expansion in staging; monitor resize conditions.',
        cmd: 'kubectl patch pvc data-db-0 -n prod -p \'{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}\'\nkubectl get pvc data-db-0 -n prod -o jsonpath=\'{.status.conditions}\' | jq\nkubectl describe pvc data-db-0 -n prod | grep -i "resiz\\|expand"',
      },
      {
        q: 'Lead an incident review where PV data loss occurred after PVC deletion — what do you present?',
        a: 'Incident: engineer deleted PVC thinking reclaim Retain would preserve data; StorageClass reclaimPolicy was Delete → EBS volume destroyed. Root cause: wrong assumption, no backup, no IaC for SC policy. Recovery: restore from Velero snapshot (6h RPO). Prevention: Retain for critical SC, OPA deny PVC delete in prod without annotation, mandatory backups, soft-delete retention on cloud volumes.',
        cmd: 'kubectl get storageclass gp3 -o jsonpath=\'{.reclaimPolicy}\'\nvelero restore create data-recovery --from-backup prod-daily --include-resources persistentvolumeclaims,persistentvolumes\naws ec2 describe-snapshots --filters Name=tag:velero.io/backup,Values=prod-daily',
      },
    ],
  },

  'storage-classes': {
    easy: [
      {
        q: 'What is a StorageClass and how does dynamic provisioning work?',
        a: 'StorageClass defines provisioner (ebs.csi.aws.com, pd.csi.storage.gke.io), parameters (type, iops), reclaimPolicy, allowVolumeExpansion, volumeBindingMode (Immediate vs WaitForFirstConsumer). PVC with storageClassName triggers provisioner to create PV automatically. Default SC annotated storageclass.kubernetes.io/is-default-class: true.',
        cmd: 'kubectl get storageclass\nkubectl describe storageclass gp3\nkubectl get pvc -n prod -o custom-columns=NAME:.metadata.name,SC:.spec.storageClassName,SIZE:.spec.resources.requests.storage',
      },
      {
        q: 'Explain volumeBindingMode Immediate vs WaitForFirstConsumer.',
        a: 'Immediate: PV provisioned and bound when PVC created — may be in wrong zone vs pending pod. WaitForFirstConsumer: provisioning delayed until pod scheduled, ensuring volume topology matches pod node zone — recommended for zonal block storage. Topology-aware scheduling coordinates PVC binding with pod placement.',
        cmd: 'kubectl get sc gp3 -o jsonpath=\'{.volumeBindingMode}\'\nkubectl describe pvc zonal-vol -n prod | grep -A5 Events\nkubectl get pod app -n prod -o wide',
      },
      {
        q: 'Describe a basic use case for multiple StorageClasses in one cluster.',
        a: 'Tiered storage: gp3 (default, general), io2 (high IOPS databases), st1/sc1 (throughput/cold), efs-sc (RWX shared). Apps request appropriate class via PVC storageClassName. Platform team manages SC definitions; app teams select in manifests. Cost optimization by matching workload I/O profile.',
        cmd: 'kubectl get sc\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: fast-data\n  namespace: prod\nspec:\n  accessModes: [ReadWriteOnce]\n  storageClassName: io2\n  resources:\n    requests:\n      storage: 100Gi\nEOF',
      },
      {
        q: 'How would you explain the CSI driver model to a new team member?',
        a: 'Container Storage Interface standardizes storage plugins: external CSI driver deploys controller (provisioner, attacher, snapshotter) and node daemonset (mount/unmount). kubelet calls CSI for volume lifecycle. Replaces in-tree cloud providers. Install via helm (aws-ebs-csi-driver, gcp-compute-persistent-disk-csi-driver).',
        cmd: 'kubectl get csidriver\nkubectl get pods -n kube-system | grep csi\nkubectl describe csidriver ebs.csi.aws.com\nhelm list -n kube-system | grep csi',
      },
    ],
    medium: [
      {
        q: 'How do you configure a StorageClass for production EBS gp3 with custom IOPS?',
        a: 'StorageClass parameters: type: gp3, iops: "6000", throughput: "250" (AWS EBS CSI). encrypted: "true", kmsKeyId optional. reclaimPolicy: Delete with backup strategy or Retain for critical data. allowVolumeExpansion: true. volumeBindingMode: WaitForFirstConsumer for multi-AZ clusters.',
        cmd: 'kubectl apply -f - <<EOF\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: gp3-fast\nprovisioner: ebs.csi.aws.com\nparameters:\n  type: gp3\n  iops: "6000"\n  throughput: "250"\n  encrypted: "true"\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true\nreclaimPolicy: Delete\nEOF',
      },
      {
        q: 'What are common pitfalls with default StorageClass changes?',
        a: 'Changing default SC does not migrate existing PVCs. New PVCs without storageClassName pick new default — unexpected cost/performance. Removing default breaks apps assuming implicit SC. Document default in runbooks; explicitly set storageClassName in all prod PVCs. Test Helm charts that create PVCs without class specified.',
        cmd: 'kubectl annotate storageclass gp3 storageclass.kubernetes.io/is-default-class=true --overwrite\nkubectl annotate storageclass gp2 storageclass.kubernetes.io/is-default-class=false --overwrite\nkubectl get pvc -A -o json | jq \'.items[] | select(.spec.storageClassName == null) | .metadata.name\'',
      },
      {
        q: 'Compare local storage vs network-attached StorageClasses.',
        a: 'Local PV (local-ssd): lowest latency, tied to specific node — pod cannot reschedule without data loss unless replicated app-side. Network (EBS/NFS): portable across nodes in zone, slightly higher latency. Use local for high-perf caching layers with replication (Cassandra, Kafka); network for general persistence and databases with external backup.',
        cmd: 'kubectl get pv -l type=local\nkubectl describe pod latency-app -n prod | grep -A5 "Node-Selectors\\|Tolerations"\nkubectl get storageclass local-ssd -o yaml',
      },
      {
        q: 'How do you monitor storage provisioning failures and capacity?',
        a: 'Alert on PVC Pending > 5min, CSI sidecar errors, cloud quota limits (EBS volume count per region). Track kubelet volume stats, node disk pressure. Prometheus: kube_persistentvolumeclaim_status_phase{phase="Pending"}. Dashboard per StorageClass usage. Cloud billing alerts for storage cost anomalies.',
        cmd: 'kubectl get pvc -A --field-selector status.phase=Pending\nkubectl logs -n kube-system -l app=ebs-csi-controller --tail=50 | grep -i error\nkubectl top pods -n kube-system | grep csi',
      },
    ],
    hard: [
      {
        q: 'Design a multi-tenant StorageClass strategy with quotas and isolation.',
        a: 'Per-tenant StorageClasses with different parameters and allowed topologies. ResourceQuota limits PVC count and total storage per namespace. RBAC restricts SC usage via admission (only platform SCs allowed). Separate cloud accounts/subscriptions for large tenants. Encrypt with tenant-specific KMS keys. Chargeback via labels on PVCs.',
        cmd: 'kubectl apply -f - <<EOF\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: storage-quota\n  namespace: tenant-a\nspec:\n  hard:\n    persistentvolumeclaims: "20"\n    requests.storage: 500Gi\nEOF\nkubectl describe resourcequota storage-quota -n tenant-a',
      },
      {
        q: 'How would you implement cross-AZ resilient storage for ReadWriteMany workloads?',
        a: 'Use regional shared filesystem: AWS EFS, Azure Files, GCP Filestore, or Ceph/Rook CephFS. StorageClass with RWX access mode. Accept latency trade-off vs block. For read-heavy, replicate with CDN front. Avoid block RWO stretched across AZs. Test failover: kill all pods in one AZ, verify remount on survivors.',
        cmd: 'kubectl get sc efs-sc -o yaml\nkubectl apply -f pvc-rwx.yaml\nkubectl run test -n prod --image=nginx --overrides=\'{"spec":{"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"shared-data"}}],"containers":[{"name":"nginx","volumeMounts":[{"name":"data","mountPath":"/usr/share/nginx/html"}]}]}}\'',
      },
      {
        q: 'Explain CSI snapshot and clone workflows for disaster recovery.',
        a: 'VolumeSnapshotClass defines snapshot driver. Create VolumeSnapshot from PVC; restore to new PVC via dataSource snapshot. Clone PVC with dataSource pvc (same namespace). Snapshots crash-consistent unless app quiesce hook. Automate with Velero or scheduled VolumeSnapshot CRs. Cross-region copy via cloud replication on snapshot.',
        cmd: 'kubectl get volumesnapshotclass\nkubectl apply -f snapshot.yaml\nkubectl get volumesnapshot -n prod\nkubectl apply -f restore-pvc-from-snapshot.yaml',
      },
      {
        q: 'Lead an incident review where wrong StorageClass caused performance degradation — what do you present?',
        a: 'Change: Helm chart omitted storageClassName; new default st1 (throughput HDD) replaced gp3 for DB PVCs. Symptom: 10x query latency increase post deploy. Detection: DB metrics dashboard, not storage. Fix: patch PVCs (requires migration), fix chart, pin SC in values. Prevention: OPA require storageClassName label on PVCs in prod, performance test in staging with production SC.',
        cmd: 'kubectl get pvc -n prod -o custom-columns=NAME:.metadata.name,SC:.spec.storageClassName\nkubectl describe sc st1\nkubectl patch statefulset db -n prod --type=json -p=\'[{"op":"replace","path":"/spec/volumeClaimTemplates/0/spec/storageClassName","value":"gp3"}]\'',
      },
    ],
  },

  namespaces: {
    easy: [
      {
        q: 'What is a Kubernetes namespace and why use multiple namespaces?',
        a: 'Namespaces provide virtual clusters within a physical cluster — scope for names, RBAC, ResourceQuotas, NetworkPolicies, and LimitRanges. Use cases: env separation (dev/staging/prod), team isolation, blast radius containment. Not a security boundary alone — combine with RBAC and NetworkPolicy. kube-system, kube-public, default are built-in.',
        cmd: 'kubectl get namespaces\nkubectl create namespace staging\nkubectl get all -n prod\nkubectl config set-context --current --namespace=prod',
      },
      {
        q: 'Explain ResourceQuota and LimitRange at namespace level.',
        a: 'ResourceQuota caps aggregate namespace consumption: total CPU/memory requests/limits, pod count, PVC count, LoadBalancer services. LimitRange sets defaults and min/max per container/PVC in namespace — prevents tiny or huge pods. Apply together: LimitRange defaults + ResourceQuota ceiling.',
        cmd: 'kubectl describe resourcequota -n prod\nkubectl describe limitrange -n prod\nkubectl get pods -n prod -o json | jq \'.items[].spec.containers[].resources\'',
      },
      {
        q: 'Describe a basic use case for namespace labels and annotations.',
        a: 'Labels enable selection: environment=prod, team=platform for policy, billing, monitoring. Annotations store metadata: cost-center, owner email, runbook URL. Used by OPA/Gatekeeper (require labels), Prometheus service discovery, and GitOps ApplicationSet generators matching namespace labels.',
        cmd: 'kubectl label namespace prod environment=production team=checkout --overwrite\nkubectl get namespace prod --show-labels\nkubectl annotate namespace prod runbook=https://wiki.example.com/prod-runbook',
      },
      {
        q: 'How would you explain cross-namespace Service DNS to a new team member?',
        a: 'Services are namespace-scoped. Cross-namespace access uses FQDN: service-name.other-namespace.svc.cluster.local. Same-namespace uses short name service-name. NetworkPolicy must allow cross-namespace traffic if enforced. Avoid overly permissive cross-namespace access — prefer API gateway or service mesh for controlled boundaries.',
        cmd: 'kubectl run curl -n frontend --rm -it --image=curlimages/curl -- curl -s http://api.backend.svc.cluster.local:8080/health\nkubectl get svc -n backend\nkubectl get networkpolicy -n backend',
      },
    ],
    medium: [
      {
        q: 'How do you implement namespace-per-environment vs namespace-per-team models?',
        a: 'Per-environment: dev/staging/prod namespaces, shared cluster, RBAC separates teams within env. Per-team: team-a-prod, team-b-prod — stronger isolation, more namespaces to manage. Hybrid common: team namespaces within shared prod cluster + NetworkPolicy default-deny. Multi-cluster for hard prod/non-prod separation in regulated industries.',
        cmd: 'kubectl get rolebinding -n prod --all-namespaces\nkubectl get networkpolicy -A\nkubectl auth can-i create deployments --as=system:serviceaccount:team-a:ci -n prod',
      },
      {
        q: 'What are common pitfalls with the default namespace?',
        a: 'Teams deploy to default without RBAC scoping — naming collisions, no ResourceQuota, harder multi-tenancy. ServiceAccounts share default SA with overly broad permissions. Production workloads should never use default namespace. Enforce via OPA/Gatekeeper deny deployments to default in prod clusters.',
        cmd: 'kubectl get pods -n default\nkubectl get rolebinding -n default\nkubectl apply -f deny-default-namespace-policy.yaml\nkubectl auth can-i create pods -n default --as=system:serviceaccount:default:default',
      },
      {
        q: 'Compare namespace termination and finalizers behavior.',
        a: 'Deleting namespace sets phase Terminating; API server removes resources in namespace. Stuck Terminating: resources with finalizers (custom operators, PV Retain) block completion. Debug: kubectl get namespace ns -o json | jq .spec.finalizers, find remaining resources kubectl api-resources --verbs=list --namespaced -o name | xargs -n1 kubectl get -n ns. Remove finalizers only as last resort.',
        cmd: 'kubectl delete namespace stuck-ns\nkubectl get namespace stuck-ns -o json | jq .status\nkubectl get all -n stuck-ns\nkubectl api-resources --verbs=list --namespaced -o name | xargs -n1 -I{} sh -c \'kubectl get {} -n stuck-ns 2>/dev/null | tail -n +2 | grep . && echo {}\'',
      },
      {
        q: 'How do you monitor namespace resource utilization and quota exhaustion?',
        a: 'kubectl describe resourcequota shows USED vs HARD. Prometheus: kube_resourcequota{resource=requests.cpu}. Alert when quota usage > 85%. Dashboard per namespace for pod count, CPU/memory requests vs limits. Regular review of LimitRange appropriateness. Self-service quota increase via ticket workflow.',
        cmd: 'kubectl describe resourcequota compute-quota -n prod\nkubectl top pods -n prod --sort-by=memory\n# Prometheus: kube_resourcequota_used / kube_resourcequota_hard > 0.85',
      },
    ],
    hard: [
      {
        q: 'Design a multi-tenant namespace architecture for a shared Kubernetes platform.',
        a: 'Namespace per tenant with: ResourceQuota, LimitRange, NetworkPolicy default-deny, dedicated ServiceAccount, Pod Security restricted, separate Ingress subdomain, External Secrets per tenant, HPA limits in quota. Platform namespace for shared ingress controller, monitoring agents. Admission webhook validates required labels/annotations on namespace create. No cluster-admin for tenants.',
        cmd: 'kubectl get ns -l type=tenant\nkubectl describe resourcequota -n tenant-a\nkubectl get networkpolicy -n tenant-a\nkubectl get rolebinding -n tenant-a',
      },
      {
        q: 'How would you automate namespace provisioning via GitOps?',
        a: 'Argo CD ApplicationSet with git generator: directories per tenant/env create Namespace + Quota + RBAC + NetworkPolicy from kustomize overlay. PR review for new tenant onboarding. Sync wave ordering: namespace first, then policies, then apps. Track namespace inventory in git as source of truth.',
        cmd: 'kubectl apply -f applicationset-tenants.yaml\nargocd app list | grep tenant\nkubectl get applications -n argocd\nkustomize build tenants/tenant-a | kubectl apply --dry-run=client -f -',
      },
      {
        q: 'Explain namespace-scoped vs cluster-scoped resources for platform operators.',
        a: 'Cluster-scoped: Node, PV, StorageClass, ClusterRole, CRD, Namespace — platform team manages. Namespace-scoped: Pod, Service, Deployment, ConfigMap — tenant manages within bounds. Operators may use cluster-scoped CRDs with namespace-scoped custom resources. RBAC separation: tenant admin Role vs platform ClusterRole.',
        cmd: 'kubectl api-resources --namespaced=true -o name | head -20\nkubectl api-resources --namespaced=false -o name | head -20\nkubectl get clusterrolebinding | grep platform\nkubectl get role -n tenant-a',
      },
      {
        q: 'Lead an incident review where missing ResourceQuota allowed noisy neighbor outage — what do you present?',
        a: 'Incident: one team deployed memory-unbounded batch job in shared prod namespace, triggered node memory pressure, evicted critical payment pods. Root cause: no ResourceQuota on namespace, no LimitRange defaults. Fix: immediate job kill, apply Quota/LimitRange, reschedule evicted pods. Prevention: mandatory Quota template on namespace create, alert on pod without resource requests, cluster policy audit.',
        cmd: 'kubectl delete job runaway-batch -n prod\nkubectl apply -f namespace-quota-template.yaml\nkubectl get events -n prod | grep Evicted\nkubectl describe resourcequota -n prod',
      },
    ],
  },

  rbac: {
    easy: [
      {
        q: 'Explain Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings.',
        a: 'Role: namespaced permissions (verbs on resources in namespace). ClusterRole: cluster-wide or aggregatable permissions. RoleBinding grants Role/ClusterRole to user/group/ServiceAccount within namespace. ClusterRoleBinding grants cluster-wide. Principle of least privilege: bind minimal verbs (get, list) not wildcard for app ServiceAccounts.',
        cmd: 'kubectl get role,rolebinding -n prod\nkubectl get clusterrole,clusterrolebinding | head -20\nkubectl describe rolebinding dev-team -n prod',
      },
      {
        q: 'What is a ServiceAccount and how does it relate to RBAC?',
        a: 'ServiceAccount provides identity for pods. Mounted token at /var/run/secrets/kubernetes.io/serviceaccount (or projected token with expiration). RBAC RoleBinding links SA to Role. Pods specify serviceAccountName. Default SA in namespace often too permissive — create dedicated SA per app with minimal permissions.',
        cmd: 'kubectl get sa -n prod\nkubectl describe sa api -n prod\nkubectl get pod api-abc -n prod -o jsonpath=\'{.spec.serviceAccountName}\'\nkubectl auth can-i list secrets --as=system:serviceaccount:prod:api -n prod',
      },
      {
        q: 'Describe how kubectl auth can-i helps verify permissions.',
        a: 'can-i checks authorization without performing action: kubectl auth can-i create deployments -n prod --as=user@corp.com. Useful for debugging Forbidden errors from CI/CD ServiceAccounts. --list shows all permissions. Impersonation requires cluster-admin or impersonate privilege.',
        cmd: 'kubectl auth can-i create pods -n prod --as=system:serviceaccount:ci:deployer\nkubectl auth can-i --list --as=system:serviceaccount:prod:api -n prod\nkubectl auth can-i get secrets --as=developer -n prod',
      },
      {
        q: 'How would you explain RBAC vs ABAC vs admission webhooks?',
        a: 'RBAC: role-based, static rules in API server — primary K8s authz. ABAC: legacy attribute-based policy file — deprecated. Admission webhooks: dynamic policy at create/update (OPA, Kyverno) — validate/mutate beyond RBAC (require labels, deny :latest). Use RBAC for identity permissions; webhooks for policy compliance.',
        cmd: 'kubectl get validatingwebhookconfigurations\nkubectl get mutatingwebhookconfigurations\nkubectl get clusterrole view -o yaml | grep -A30 rules',
      },
    ],
    medium: [
      {
        q: 'How do you implement least-privilege RBAC for CI/CD deployment pipelines?',
        a: 'Dedicated ServiceAccount per pipeline. Role with create/update/patch on deployments, services, configmaps in target namespace only — not secrets get unless needed. No cluster-admin. Use impersonation for cross-namespace deploys via CI orchestrator. Rotate SA tokens; prefer projected tokens with audience and expiration. Audit with can-i in pipeline dry-run stage.',
        cmd: 'kubectl apply -f ci-deployer-role.yaml\nkubectl create rolebinding ci-deploy -n prod --role=deployer --serviceaccount=ci:deployer\nkubectl auth can-i delete nodes --as=system:serviceaccount:ci:deployer\nkubectl auth can-i patch deployments --as=system:serviceaccount:ci:deployer -n prod',
      },
      {
        q: 'What are common pitfalls with cluster-admin and wildcard RBAC?',
        a: 'Binding cluster-admin to developers or default SA — full cluster compromise if pod escaped. Wildcard verbs/resources in custom roles — audit with rbac-tool. Overly broad get/list secrets cluster-wide. Helm creating cluster-admin bindings. Regular RBAC audit: who can escalate (create rolebindings, bind cluster-admin).',
        cmd: 'kubectl get clusterrolebinding -o json | jq \'.items[] | select(.roleRef.name=="cluster-admin") | .subjects\'\nrbac-tool audit cluster\nkubectl auth can-i create clusterrolebindings --as=developer',
      },
      {
        q: 'Compare user authentication methods: certs, OIDC, and cloud IAM.',
        a: 'X509 client certs: kubeadm default, hard to rotate at scale. OIDC: integrate corporate IdP (Okta, Azure AD) via --oidc-* apiserver flags, groups claim maps to RBAC. Cloud: aws eks get-token, gcloud container clusters get-credentials — IAM to RBAC via aws-auth ConfigMap or EKS access entries. Prefer OIDC/IAM over static certs.',
        cmd: 'kubectl config view --raw | grep -A5 users\nkubectl get configmap aws-auth -n kube-system -o yaml  # EKS\naws eks create-access-entry --cluster-name prod --principal-arn arn:aws:iam::123:role/DevOps',
      },
      {
        q: 'How do you troubleshoot RBAC Forbidden errors in production?',
        a: 'Read exact error: User "system:serviceaccount:ns:sa" cannot "verb" resource "name". Check RoleBindings in namespace and ClusterRoleBindings referencing SA. Verify Role rules include resource/apiGroup. For CRDs, ensure custom resource in rules. Test with auth can-i. Check if admission webhook denied (different error message).',
        cmd: 'kubectl describe rolebinding -n prod | grep -A10 Subjects\nkubectl get role deployer -n prod -o yaml\nkubectl auth can-i patch deployments --as=system:serviceaccount:ci:deployer -n prod -v=6',
      },
    ],
    hard: [
      {
        q: 'Design RBAC model for platform team, app teams, and read-only auditors.',
        a: 'ClusterRoles: platform-admin (nodes, PV, CRDs), app-admin (all namespaced resources in owned namespaces via RoleBinding per ns), developer (get/list/watch, port-forward), auditor (get/list cluster-wide, no secrets). ClusterRoleBinding for platform/auditor; RoleBinding per namespace for app teams. Automate via Terraform/Helm on namespace onboarding. No shared cluster-admin.',
        cmd: 'kubectl get clusterrole platform-admin -o yaml\nkubectl get rolebinding -n team-checkout\nkubectl auth can-i list nodes --as=auditor@corp.com\nkubectl auth can-i get secrets --as=auditor@corp.com -n prod',
      },
      {
        q: 'How would you implement just-in-time elevated access for production incidents?',
        a: 'Break-glass ClusterRoleBinding created via automation on PagerDuty ack, auto-expires in 1h (CronJob removes binding or use impersonation token). All actions audit logged. Alternative: Teleport/kubernetes access proxy with session recording. Never permanent cluster-admin for on-call. Post-incident review of break-glass usage.',
        cmd: 'kubectl create clusterrolebinding breakglass-jane --clusterrole=cluster-admin --user=jane@corp.com\n# Auto-remove via CronJob or:\nkubectl delete clusterrolebinding breakglass-jane\nkubectl get events -A | grep breakglass',
      },
      {
        q: 'Explain privilege escalation paths and how to audit them.',
        a: 'Escalation vectors: create pods with privileged SA, bind cluster-admin RoleBinding, exec into privileged pod, modify kube-system, create ValidatingWebhook that always allows, access secrets with cloud credentials. Audit: rbac-tool viz, who-can --list, restrict escalate verb, Pod Security Standards, deny exec to sensitive namespaces.',
        cmd: 'rbac-tool viz --out-dir /tmp/rbac\nkubectl auth can-i create pods --as=developer -n prod\nkubectl auth can-i create rolebindings --as=developer -n prod\nkubectl get clusterrole -o json | jq \'.items[] | select(.rules[]?.verbs[]? == "escalate") | .metadata.name\'',
      },
      {
        q: 'Lead an incident review where overly permissive RBAC enabled lateral movement — what do you present?',
        a: 'Attack path: compromised dev SA with secrets list cluster-wide → extracted cloud creds from kube-system → AWS account access. Root cause: shared powerful SA, no namespace isolation. Remediation: rotate all secrets, scope SA to namespace, remove secrets from Role, enable audit alerts on secret list. Long-term: RBAC audit quarterly, OPA deny secret access except ESO SA.',
        cmd: 'kubectl get clusterrolebinding -o json | jq \'.items[] | select(.subjects[]?.name=="compromised-sa")\'\nkubectl delete clusterrolebinding overly-permissive\nkubectl apply -f least-privilege-rbac.yaml\naws iam create-access-key --user-name audit  # rotate affected creds',
      },
    ],
  },

  helm: {
    easy: [
      {
        q: 'What is Helm and how does it simplify Kubernetes deployments?',
        a: 'Helm is package manager for Kubernetes — charts templatize manifests (Deployment, Service, Ingress, etc.) with values.yaml for customization. helm install/upgrade manages releases with revision history. helm rollback reverts bad deploys. Repositories share charts (Bitnami, official). Reduces YAML duplication across environments.',
        cmd: 'helm list -A\nhelm search repo nginx\nhelm install my-nginx bitnami/nginx -n prod --set service.type=ClusterIP\nhelm status my-nginx -n prod',
      },
      {
        q: 'Explain Helm chart structure: Chart.yaml, values.yaml, templates/.',
        a: 'Chart.yaml: metadata, version, appVersion. values.yaml: default parameters. templates/: Go-template YAML files (_helpers.tpl for shared snippets). charts/: subchart dependencies. helm template renders locally without install. Release name injects into resource names via {{ .Release.Name }}.',
        cmd: 'helm pull bitnami/nginx --untar\ncat nginx/Chart.yaml\nhelm template my-nginx ./nginx --set replicaCount=3\nls nginx/templates/',
      },
      {
        q: 'Describe a basic helm upgrade workflow.',
        a: 'Change values or chart version, run helm upgrade release chart -n namespace -f values-prod.yaml. Helm performs three-way strategic merge patch (live, old manifest, new manifest). --atomic waits for readiness and rolls back on failure. --wait with timeout for production. Check helm history before/after.',
        cmd: 'helm upgrade api ./charts/api -n prod -f values-prod.yaml --wait --timeout 10m\nhelm history api -n prod\nhelm get values api -n prod\nkubectl rollout status deployment/api -n prod',
      },
      {
        q: 'How would you explain Helm release revisions to a new team member?',
        a: 'Each install/upgrade increments revision number stored as Secret (helm.sh/release.vN). helm history shows revisions with status (deployed, failed, superseded). helm rollback api 3 reverts to revision 3 config. Useful for quick recovery; still maintain git as source of truth for values.',
        cmd: 'helm history api -n prod\nhelm get manifest api -n prod --revision 5\nhelm rollback api 4 -n prod\nkubectl get secrets -n prod -l owner=helm | grep api',
      },
    ],
    medium: [
      {
        q: 'How do you manage Helm values across dev, staging, and production?',
        a: 'Layered values: values.yaml (defaults), values-staging.yaml, values-prod.yaml overrides. helm upgrade -f values.yaml -f values-prod.yaml (later files override). Or Kustomize helmChartInflationGenerator. CI promotes tested values files through git branches. Never edit live release with helm upgrade --set in prod without git commit.',
        cmd: 'helm upgrade api ./charts/api -n prod \\\n  -f values.yaml -f values-prod.yaml \\\n  --dry-run --debug | less\nhelm diff upgrade api ./charts/api -n prod -f values-prod.yaml\nhelm get values api -n prod -o yaml > live-values.yaml',
      },
      {
        q: 'What are common pitfalls with Helm hooks and ordering?',
        a: 'Hooks (pre-install, post-upgrade, test) run as Jobs/Pods with hook-weight ordering and hook-delete-policy. Pitfalls: hook Job fails blocking upgrade, hooks not cleaned up filling namespace, hook RBAC missing, pre-upgrade hook downtime if scales to zero. Test hooks in staging; use --no-hooks for emergency bypass only.',
        cmd: 'helm upgrade api ./charts/api -n prod --dry-run | grep -A5 "helm.sh/hook"\nkubectl get pods -n prod -l helm.sh/hook\nhelm upgrade api ./charts/api -n prod --no-hooks  # emergency only\nkubectl logs job/api-pre-upgrade -n prod',
      },
      {
        q: 'Compare Helm vs Kustomize vs raw manifests for platform teams.',
        a: 'Helm: templating, package distribution, release management — good for third-party apps (Prometheus, ingress-nginx). Kustomize: patch/overlay without templating — good for own apps, git-native. Raw YAML: simple but no DRY. Many teams: Helm for infra charts, Kustomize for microservices, Argo CD for GitOps delivery of both.',
        cmd: 'kustomize build overlays/prod | kubectl apply --dry-run=client -f -\nhelm template prometheus prometheus-community/kube-prometheus-stack -f monitoring-values.yaml | kubectl apply --dry-run=client -f -\nargocd app diff prod-api',
      },
      {
        q: 'How do you troubleshoot failed Helm releases?',
        a: 'helm status shows NOTES and last revision state. helm history for failed revisions. kubectl get pods,jobs -n ns for hook failures. --debug on upgrade shows rendered templates. Failed atomic upgrade auto-rolls back — check previous revision. For stuck pending-upgrade, helm rollback or helm upgrade --force (recreates resources — use carefully).',
        cmd: 'helm status api -n prod\nhelm history api -n prod\nkubectl get events -n prod --sort-by=.lastTimestamp | tail -20\nhelm upgrade api ./charts/api -n prod --debug --dry-run 2>&1 | less',
      },
    ],
    hard: [
      {
        q: 'Design a GitOps workflow with Helm charts and Argo CD.',
        a: 'Charts in git repo; environment values in overlays. Argo CD Application points to chart path + valueFiles. Sync policy: manual for prod, automated for dev. helm dependency update in CI. Chart version pinned; appVersion tracks image. Pre-sync hooks for DB migration Jobs. Rollback via Argo CD history or git revert + sync.',
        cmd: 'argocd app create api-prod --repo https://git.example.com/charts --path api --dest-namespace prod --helm-set-file values=values-prod.yaml\nargocd app sync api-prod\nargocd app history api-prod\nhelm dependency update ./charts/api',
      },
      {
        q: 'How would you implement Helm chart testing and validation in CI?',
        a: 'helm lint chart/, kubeconform or helm template | kubectl apply --dry-run=server, chart-testing (ct lint-and-install) in kind cluster, helm unittest plugin for template logic tests. Policy check rendered YAML with conftest/kyverno. Pin chart and dependency versions. SBOM and sign charts with cosign for supply chain.',
        cmd: 'helm lint ./charts/api\nhelm template api ./charts/api -f values-prod.yaml | kubeconform -strict -summary\nct lint-and-install --chart-dirs charts/ --all\nhelm unittest ./charts/api',
      },
      {
        q: 'Explain Helm release storage and migration to secrets driver.',
        a: 'Default: release metadata in Secrets (or ConfigMaps) in release namespace, max 1MB per release — large charts hit limit. Secrets driver (helm-secrets plugin) encrypts values. Helm 3 stores compressed; helm mapkubeapis migrates deprecated API versions in release history. Backup releases before major Helm upgrades.',
        cmd: 'kubectl get secrets -n prod -l owner=helm,name=api\nhelm mapkubeapis api -n prod\nhelm plugin install https://github.com/jkroepke/helm-secrets\nhelm secrets upgrade api ./charts/api -f secrets.prod.yaml -n prod',
      },
      {
        q: 'Lead an incident review where Helm upgrade failure left cluster in broken state — what do you present?',
        a: 'Upgrade without --atomic: new Deployment broken, old ReplicaSet scaled down manually by chart hook — partial outage. Root cause: chart hook pre-upgrade deleted resources, new version ImagePullBackOff, no automatic rollback. Fix: helm rollback, fix image tag. Prevention: --atomic --wait mandatory in prod pipeline, helm diff in PR review, staging soak test, chart hook RBAC and idempotency review.',
        cmd: 'helm rollback api -n prod\nhelm history api -n prod\nkubectl get rs -n prod -l app.kubernetes.io/instance=api\n# CI gate: helm upgrade --atomic --wait --timeout 15m',
      },
    ],
  },

  monitoring: {
    easy: [
      {
        q: 'What metrics does metrics-server provide and how is it used?',
        a: 'metrics-server collects resource usage (CPU/memory) from kubelets via Summary API, serves metrics.k8s.io for kubectl top and HPA. Not for long-term storage — use Prometheus for that. Requires kubelet read-only port or authentication. One metrics-server deployment per cluster (typically kube-system).',
        cmd: 'kubectl top nodes\nkubectl top pods -n prod --containers\nkubectl get apiservice v1beta1.metrics.k8s.io -o yaml\nkubectl get pods -n kube-system -l k8s-app=metrics-server',
      },
      {
        q: 'Explain liveness vs readiness probes from a monitoring perspective.',
        a: 'Readiness failure removes pod from Service endpoints — metric: kube_pod_status_ready{condition="false"}. Liveness failure triggers restart — track restart count and CrashLoopBackOff. Monitor probe failure events and latency. Alert on sustained unready pods or restart rate spikes. Probes are first-line health signals before deep APM.',
        cmd: 'kubectl get pods -n prod -o json | jq \'.items[] | {name: .metadata.name, ready: (.status.conditions[]|select(.type=="Ready")|.status), restarts: .status.containerStatuses[0].restartCount}\'\nkubectl describe pod api-abc -n prod | grep -A5 "Warning Unhealthy"',
      },
      {
        q: 'Describe a basic Prometheus + Grafana monitoring stack on Kubernetes.',
        a: 'kube-prometheus-stack Helm chart deploys Prometheus Operator, Prometheus, Alertmanager, Grafana, node-exporter, kube-state-metrics. ServiceMonitors/PodMonitors scrape app metrics. Grafana dashboards visualize cluster and app health. Alertmanager routes to PagerDuty/Slack. kube-state-metrics exposes K8s object state as metrics.',
        cmd: 'helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace\nkubectl get servicemonitor -A\nkubectl port-forward svc/monitoring-grafana -n monitoring 3000:80\nkubectl get prometheusrules -n monitoring',
      },
      {
        q: 'How would you explain Kubernetes events to a new team member?',
        a: 'Events are ephemeral cluster notifications: Scheduled, Pulled, Created, FailedMount, BackOff, Evicted. kubectl get events sorted by time aids debugging. Not persisted long-term by default — forward to logging (Elasticsearch, Loki) via event exporter. High event rates may indicate systemic issues or overly chatty controllers.',
        cmd: 'kubectl get events -n prod --sort-by=.lastTimestamp | tail -30\nkubectl get events -n prod --field-selector type=Warning\nkubectl get events -A --field-selector reason=FailedScheduling',
      },
    ],
    medium: [
      {
        q: 'How do you implement custom application metrics for HPA and alerting?',
        a: 'Expose /metrics in Prometheus format from app (client_golang). ServiceMonitor selects Service with prometheus.io/scrape annotation or explicit selector. Prometheus adapter registers custom.metrics.k8s.io for HPA external metrics. Alert rules on error rate, latency p99. Validate metric cardinality — avoid unbounded labels.',
        cmd: 'kubectl apply -f servicemonitor-api.yaml\nkubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/prod/services/*/http_requests_per_second" | jq\nkubectl get hpa api -n prod -o yaml | grep -A10 metrics\nkubectl get prometheusrules -n monitoring',
      },
      {
        q: 'What are common pitfalls with monitoring DaemonSets and node-level metrics?',
        a: 'node-exporter needs hostPath mounts — security consideration. Duplicate metrics if multiple scrapers. Missing tolerations → no metrics from tainted nodes. High cardinality from cAdvisor container labels. Resource limits on monitoring agents causing OOM during spikes. Ensure Prometheus retention and storage sized for cluster growth.',
        cmd: 'kubectl get ds -n monitoring\nkubectl describe ds node-exporter -n monitoring | grep -A10 Tolerations\nkubectl top pods -n monitoring\nkubectl get prometheus -n monitoring -o jsonpath=\'{.items[0].spec.retention}\'',
      },
      {
        q: 'Compare centralized logging approaches: EFK vs Loki vs cloud-native.',
        a: 'EFK (Elasticsearch/Fluentd/Fluent Bit/Kibana): full-text search, heavy resource footprint. Loki: label-based, integrates with Grafana, lower cost, less ad-hoc query flexibility. Cloud: CloudWatch Container Insights, GCP Cloud Logging, Azure Monitor — managed, integrated billing. All use DaemonSet or sidecar log collectors shipping stdout/stderr.',
        cmd: 'kubectl get pods -n logging -l app=fluent-bit\nkubectl logs -n prod -l app=api --tail=100\n# Loki query via Grafana: {namespace="prod"} |= "error"\nhelm list -n logging',
      },
      {
        q: 'How do you set up alerting for cluster and application SLOs?',
        a: 'Define SLIs: availability (success rate), latency p99, error budget. PrometheusRule alerts: high 5xx rate, pod not ready > 5min, node NotReady, PVC pending, cert expiry < 14d. Alertmanager routes by severity/team. Runbooks linked in annotations. Avoid alert fatigue — tune thresholds, use inhibition rules, page only on SLO burn rate.',
        cmd: 'kubectl apply -f prometheusrule-slo.yaml\nkubectl get prometheusrule -n monitoring\nkubectl port-forward svc/monitoring-alertmanager -n monitoring 9093:9093\namtool alert query',
      },
    ],
    hard: [
      {
        q: 'Design an observability platform for a 500-node multi-tenant Kubernetes cluster.',
        a: 'Tiered: metrics (Prometheus federation or Thanos/Mimir for long-term), logs (Loki with tenant labels), traces (Tempo/Jaeger via OpenTelemetry Collector DaemonSet). Per-tenant billing via label cardinality controls. HA Prometheus pairs per region, Alertmanager clustering. Grafana with RBAC orgs per team. SLO dashboards per service. On-call rotation integrated with Alertmanager.',
        cmd: 'helm install thanos bitnami/thanos -n monitoring -f thanos-values.yaml\nkubectl get pods -n monitoring -l app.kubernetes.io/name=otel-collector\nkubectl apply -f opentelemetry-instrumentation.yaml\nkubectl get servicemonitor -A | wc -l',
      },
      {
        q: 'How would you optimize Prometheus cardinality and scrape performance at scale?',
        a: 'Drop high-cardinality labels via relabel_configs, avoid pod name in alert labels, use recording rules for expensive queries, federation for cross-cluster, sharding Prometheus by namespace/team. Tune scrape intervals (30s default → 60s for non-critical). Limit targets per Prometheus (~10k). Use adaptive metrics (Grafana Cloud) or Mimir for horizontal scale.',
        cmd: 'kubectl exec -n monitoring prometheus-prometheus-0 -- promtool tsdb analyze /prometheus | head -50\nkubectl get prometheus -n monitoring -o yaml | grep -A20 retention\n# Check series count\ncurl -s http://prometheus:9090/api/v1/status/tsdb | jq .data.seriesCountByMetricName | head',
      },
      {
        q: 'Explain monitoring blind spots during control plane and CNI failures.',
        a: 'Apiserver down: in-cluster Prometheus may fail scrapes and alerts — need external synthetic monitoring (Datadog, Pingdom hitting Ingress). CNI failure: pod-to-pod metrics break while node metrics look fine. etcd slow: no direct app impact until widespread. Mitigation: external health checks, multi-region observability, node-local buffering (Fluent Bit storage.path), dead-man-switch alerts.',
        cmd: 'kubectl get --raw /healthz\nkubectl run nettest --rm -it --image=nicolaka/netshoot -n prod -- iperf3 -c target\nkubectl get pods -n kube-system -l k8s-app=calico-node\n# External: curl https://api.example.com/health from outside cluster',
      },
      {
        q: 'Lead an incident review where monitoring gaps delayed detection by 45 minutes — what do you present?',
        a: 'Incident: memory leak caused gradual degradation; no alert on memory working set trend, only on pod restart (too late). HPA scaled on CPU but leak was memory. Detection via customer report. Actions: memory-based HPA/vpa, alert on container_memory approaching limit at 80%, synthetic transaction monitoring, RED metrics dashboard. Present MTTD improvement plan and error budget consumed.',
        cmd: 'kubectl top pod -n prod --sort-by=memory | head -10\nkubectl get hpa api -n prod -o yaml\nkubectl apply -f prometheusrule-memory-pressure.yaml\n# Add: kube_pod_container_resource_limits_memory_bytes metric alert',
      },
    ],
  },

  scaling: {
    easy: [
      {
        q: 'What is the Horizontal Pod Autoscaler (HPA) and how does it work?',
        a: 'HPA adjusts Deployment/StatefulSet replicas based on metrics (CPU, memory, custom, external). Compares current metric to target (e.g., 70% CPU), calculates desired replicas, patches scale subresource every sync period (~15s). Requires metrics-server for resource metrics. Respects minReplicas/maxReplicas bounds.',
        cmd: 'kubectl autoscale deployment api -n prod --min=2 --max=20 --cpu-percent=70\nkubectl get hpa -n prod\nkubectl describe hpa api -n prod\nkubectl get deployment api -n prod -o jsonpath=\'{.spec.replicas}\'',
      },
      {
        q: 'Explain Cluster Autoscaler and its relationship with HPA.',
        a: 'HPA adds pods; if no node has capacity, pods stay Pending. Cluster Autoscaler (CA) detects unschedulable pods and adds nodes to node groups/pools; removes underutilized nodes after cooldown. CA respects PodDisruptionBudgets, taints, and node selectors. Works with cloud auto-scaling groups (ASG, MIG, VMSS) or Karpenter for faster provisioning.',
        cmd: 'kubectl get pods -A --field-selector status.phase=Pending\nkubectl logs -n kube-system deploy/cluster-autoscaler --tail=30\nkubectl get nodes\n# EKS: aws autostart autoscaling describe-auto-scaling-groups',
      },
      {
        q: 'Describe a basic use case for Vertical Pod Autoscaler (VPA).',
        a: 'VPA recommends or auto-adjusts container CPU/memory requests/limits based on historical usage. Modes: Off (recommendations only), Initial (set on pod create), Auto (evict and recreate pods with new resources). Do not use VPA Auto with HPA on same CPU metric — conflict. Good for right-sizing before enabling HPA.',
        cmd: 'kubectl apply -f https://github.com/kubernetes/autoscaler/releases/download/vertical-pod-autoscaler-1.0.0/vpa-release.yaml\nkubectl get vpa -n prod\nkubectl describe vpa api -n prod | grep -A10 Recommendation',
      },
      {
        q: 'How would you explain manual scaling with kubectl scale?',
        a: 'kubectl scale deployment/api --replicas=10 directly sets spec.replicas. HPA overrides manual scale if active (reverts to metric-driven count). For temporary scale during event, pause HPA or adjust minReplicas. StatefulSet scale respects ordering. Always verify capacity: nodes, quotas, PDB.',
        cmd: 'kubectl scale deployment api -n prod --replicas=10\nkubectl get deployment api -n prod\nkubectl scale statefulset db -n prod --replicas=3\nkubectl get hpa api -n prod -o jsonpath=\'{.status.currentReplicas}\'',
      },
    ],
    medium: [
      {
        q: 'How do you configure HPA with custom metrics from Prometheus?',
        a: 'Install prometheus-adapter mapping Prometheus queries to custom.metrics.k8s.io or external.metrics.k8s.io. HPA spec references metric name and target AverageValue or Value. Example: scale on http_requests_per_second or queue depth. Ensure metric reflects load accurately; tune target based on capacity testing.',
        cmd: 'kubectl apply -f prometheus-adapter-config.yaml\nkubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1" | jq .resources\nkubectl apply -f - <<EOF\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: api\n  namespace: prod\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: api\n  minReplicas: 3\n  maxReplicas: 50\n  metrics:\n  - type: Pods\n    pods:\n      metric:\n        name: http_requests_per_second\n      target:\n        type: AverageValue\n        averageValue: "1000"\nEOF',
      },
      {
        q: 'What are common pitfalls when HPA does not scale as expected?',
        a: 'Missing metrics-server or adapter. CPU target with missing resource requests (HPA needs requests set). Cooldown/stabilization windows delaying scale-down. maxReplicas too low. Metrics lag. PDB blocking scale-down. VPA conflict. Custom metric returning stale data. Pods Pending due to quota not CPU — HPA keeps adding. Always describe hpa for conditions.',
        cmd: 'kubectl describe hpa api -n prod\nkubectl get apiservice v1beta1.metrics.k8s.io\nkubectl get pods -n prod -l app=api -o json | jq \'.items[0].spec.containers[0].resources\'\nkubectl get hpa api -n prod -o yaml | grep -A20 behavior',
      },
      {
        q: 'Compare KEDA vs HPA for event-driven scaling.',
        a: 'HPA: metric-based on CPU/memory/custom metrics from in-cluster sources. KEDA: ScaledObject triggers on external events — Kafka lag, SQS queue length, Cron, Prometheus query, cloud pub/sub. KEDA manages HPA under the hood. Use KEDA for queue workers, batch jobs; HPA for request-serving APIs on CPU/RPS.',
        cmd: 'kubectl get scaledobject -n prod\nkubectl describe scaledobject worker -n prod\nkubectl get hpa -n prod  # KEDA-created\nhelm install keda kedacore/keda -n keda --create-namespace',
      },
      {
        q: 'How do you scale cluster nodes efficiently with Karpenter?',
        a: 'Karpenter watches Pending pods and provisions right-sized nodes in seconds (vs CA minutes). NodePool defines instance types, limits, taints. Consolidation removes empty/underutilized nodes. Works with AWS (primary), Azure, GCP expanding. Configure interruption handling (SQS spot termination). Set resource limits on NodePool to cap cost.',
        cmd: 'kubectl get nodepool\nkubectl get nodeclaim\nkubectl logs -n karpenter deploy/karpenter --tail=30\nkubectl describe nodeclaim default-abc123',
      },
    ],
    hard: [
      {
        q: 'Design autoscaling strategy for a flash-sale e-commerce platform on Kubernetes.',
        a: 'Pre-warm: scale Deployment minReplicas 2h before event via CronJob/KEDA cron trigger. HPA on RPS custom metric + CPU with aggressive scale-up (0s stabilization), conservative scale-down (300s). Over-provisioned node pool or Karpenter NodePool with high limits. CDN for static. PDB minAvailable 80%. Load test to calibrate targets. Cluster Autoscaler/Karpenter headroom. Circuit breakers in app.',
        cmd: 'kubectl patch hpa api -n prod --type=merge -p \'{"spec":{"behavior":{"scaleUp":{"stabilizationWindowSeconds":0,"policies":[{"type":"Percent","value":100,"periodSeconds":15}]}}}}\'\nkubectl apply -f keda-scaledobject-cron.yaml\nkubectl get nodes -l node.kubernetes.io/instance-type\nkubectl top pods -n prod',
      },
      {
        q: 'How would you optimize scale-down behavior to protect SLAs during traffic dips?',
        a: 'HPA behavior.scaleDown.stabilizationWindowSeconds (default 300) prevents flapping. scaleDown policies limit percent/pods removed per period. PDB ensures minimum availability. Pod terminationGracePeriod for connection drain. For CA/Karpenter, delay node removal until pods rescheduled. Monitor scale events correlation with error rate — tune if premature scale-down causes latency spikes.',
        cmd: 'kubectl get hpa api -n prod -o jsonpath=\'{.spec.behavior.scaleDown}\' | jq\nkubectl get pdb -n prod\nkubectl get events -n prod | grep -i Scale\nkubectl describe hpa api -n prod | grep -A15 Conditions',
      },
      {
        q: 'Explain scaling failures when ResourceQuota and LimitRange block new pods.',
        a: 'HPA increases replicas but new pods Pending — FailedScheduling or quota exceeded, not visible in HPA conditions as scaling "succeeded". Cluster Autoscaler cannot help if quota is namespace CPU cap. Fix: raise ResourceQuota, reduce per-pod requests, or optimize efficiency. Alert on pending pods + HPA at maxReplicas simultaneously.',
        cmd: 'kubectl describe hpa api -n prod\nkubectl get pods -n prod -l app=api | grep Pending\nkubectl describe resourcequota -n prod\nkubectl get events -n prod | grep FailedCreate',
      },
      {
        q: 'Lead an incident review where aggressive autoscaling caused cost overrun — what do you present?',
        a: 'Trigger: misconfigured HPA custom metric (duplicate time series summed) drove replicas to maxReplicas 200 for 6 hours. Cost spike $40k. Root cause: metric query error in prometheus-adapter config, no maxReplicas review in PR. Fix: maxReplicas cap, cost anomaly alert, metric validation in CI. Present scaling graph, metric query fix, FinOps approval gate for maxReplicas > 50.',
        cmd: 'kubectl get hpa api -n prod -o jsonpath=\'{.spec.maxReplicas}\'\nkubectl describe hpa api -n prod | grep -A5 "current\\|desired"\nkubectl patch hpa api -n prod -p \'{"spec":{"maxReplicas":30}}\'\n# Cost: kubectl-cost or cloud billing dashboard',
      },
    ],
  },

  troubleshooting: {
    easy: [
      {
        q: 'What is your systematic approach to troubleshooting a failing Pod?',
        a: '1) kubectl get pod — check STATUS (CrashLoopBackOff, ImagePullBackOff, Pending). 2) kubectl describe pod — Events section is key. 3) kubectl logs pod [-c container] [--previous]. 4) kubectl exec for live debug. 5) Check Service endpoints, NetworkPolicy, resource limits. Follow detect → triage → mitigate → root cause → prevent.',
        cmd: 'kubectl get pod failing -n prod\nkubectl describe pod failing -n prod\nkubectl logs failing -n prod --previous --tail=100\nkubectl exec -it failing -n prod -- sh',
      },
      {
        q: 'Explain common Pod status reasons: CrashLoopBackOff, ImagePullBackOff, ErrImagePull, OOMKilled.',
        a: 'CrashLoopBackOff: container exits repeatedly, kubelet backs off restarts — check logs and exit code. ImagePullBackOff/ErrImagePull: registry auth, wrong tag, network. OOMKilled: exceeded memory limit — increase limit or fix leak. CreateContainerConfigError: missing ConfigMap/Secret key. RunContainerError: bad command or volume mount.',
        cmd: 'kubectl get pod -n prod -o wide\nkubectl describe pod crash -n prod | grep -E "State:|Reason:|Exit Code:"\nkubectl logs crash -n prod --previous\nkubectl get events -n prod --field-selector involvedObject.name=crash',
      },
      {
        q: 'Describe how kubectl debug (ephemeral containers) helps troubleshoot production pods.',
        a: 'Kubernetes 1.23+ ephemeral containers attach debug tools to running pod without restarting main container. kubectl debug pod/name -it --image=nicolaka/netshoot --target=app copies pod spec and adds netshoot for network debugging. Useful when distroless images lack shell. Requires EphemeralContainers feature gate (enabled by default recent versions).',
        cmd: 'kubectl debug pod/api-abc -n prod -it --image=nicolaka/netshoot --target=api\n# Node debug:\nkubectl debug node/worker-1 -it --image=ubuntu -- chroot /host bash\nkubectl get pod api-abc -n prod -o jsonpath=\'{.spec.ephemeralContainers}\'',
      },
      {
        q: 'How would you use kubectl logs effectively during an incident?',
        a: 'kubectl logs pod -c container --tail=200 --since=10m for recent context. --previous for last crashed container instance. --follow for live stream. Stern plugin for multi-pod tail: stern api -n prod. Ensure apps log to stdout/stderr (12-factor). Correlate timestamps with deployment events and metric spikes.',
        cmd: 'kubectl logs -l app=api -n prod --tail=50 --prefix\nkubectl logs api-abc -n prod --previous\nkubectl logs -f deployment/api -n prod --all-containers=true\n# stern api -n prod --since 15m',
      },
    ],
    medium: [
      {
        q: 'How do you troubleshoot network connectivity between Pods across namespaces?',
        a: 'Verify DNS resolution, Service endpoints, NetworkPolicy rules, and service mesh mTLS policies. Test path: curl from debug pod → ClusterIP → pod IP direct. Check kube-proxy/CNI health. For Ingress issues, test from inside cluster first to isolate L7 vs L4. tcpdump in netshoot on source and destination.',
        cmd: 'kubectl run netshoot -n frontend --rm -it --image=nicolaka/netshoot -- bash\n# nslookup api.backend.svc.cluster.local\n# curl -v telnet://api.backend.svc.cluster.local:8080\nkubectl get networkpolicy -n backend -o yaml\nkubectl get endpoints api -n backend',
      },
      {
        q: 'What are common pitfalls when using kubectl describe vs logs vs exec?',
        a: 'describe Events rotate quickly — capture early. logs missing if container never started (check describe). exec into CrashLoopBackOff pod may fail if crash is instant — use --previous logs. describe shows probe failures but not app stack traces. Multiple containers require -c flag. RBAC may block exec but allow logs.',
        cmd: 'kubectl auth can-i exec pods --as=developer -n prod\nkubectl auth can-i get logs --as=developer -n prod\nkubectl describe pod multi -n prod | grep -A3 "Containers:"\nkubectl logs multi -n prod -c sidecar --previous',
      },
      {
        q: 'Compare troubleshooting tools: k9s, stern, kubectl-tree, and lens.',
        a: 'k9s: terminal UI for rapid navigation, logs, describe, port-forward. stern: multi-pod log tailing with regex filter. kubectl-tree (via krew): ownership hierarchy pod→rs→deployment. Lens/Headlamp: GUI cluster view. All wrap kubectl/API — know raw kubectl for CI/scripts and interview scenarios. kube-capacity for resource overview.',
        cmd: 'kubectl krew install tree stern\nkubectl tree deployment api -n prod\nstern api -n prod --since 5m | grep -i error\nkubectl top nodes\nkubectl get pods -A | grep -v Running | grep -v Completed',
      },
      {
        q: 'How do you troubleshoot scheduling failures and node resource exhaustion?',
        a: 'Pending pods: describe for FailedScheduling message — insufficient cpu/memory, taints, affinity, volume topology. kubectl describe node for Allocated resources and Conditions (MemoryPressure, DiskPressure). Check ResourceQuota. Fix: add nodes (CA/Karpenter), reduce requests, fix affinity, clear taints, expand quota.',
        cmd: 'kubectl describe pod pending -n prod | grep -A20 Events\nkubectl describe nodes | grep -A15 "Allocated resources"\nkubectl get pods -A --field-selector status.phase=Pending\nkubectl taint nodes worker-1 dedicated-:NoSchedule-  # if intentional taint blocking',
      },
    ],
    hard: [
      {
        q: 'Design a production troubleshooting runbook framework for Kubernetes on-call.',
        a: 'Tiered runbooks per alert with: symptom, blast radius checklist, diagnostic commands, mitigation steps, escalation path, comms template. Integrate runbook links in Alertmanager annotations. Post-incident: update runbook. Categories: pod lifecycle, networking, storage, control plane, security. Monthly game days validate runbooks. Avoid single-person tribal knowledge.',
        cmd: '# Runbook example commands section:\nkubectl get pods -n $NS -l app=$APP\nkubectl describe pod $POD -n $NS\nkubectl logs $POD -n $NS --previous\n# Link: https://runbooks.example.com/k8s/crashloop',
      },
      {
        q: 'How would you diagnose intermittent failures that leave no obvious pod status errors?',
        a: 'Intermittent: correlate with deployments, node events, spot interruptions, GC pauses, DNS timeouts. Enable distributed tracing (OpenTelemetry). Capture metrics during failure window (latency histograms, tcp retransmits). Use kubectl debug with tcpdump. Check apiserver audit for admission webhook latency spikes. Chaos engineering to reproduce.',
        cmd: 'kubectl get events -A --sort-by=.lastTimestamp | grep -i "spot\\|preempt\\|evict"\nkubectl top pod -n prod -l app=api\nkubectl run tcpdump --rm -it --image=nicolaka/netshoot -n prod -- tcpdump -i any host api.prod.svc.cluster.local\n# Jaeger: search traces with error=true during incident window',
      },
      {
        q: 'Explain advanced troubleshooting for admission webhook and CRD controller failures.',
        a: 'Webhook timeout blocks all matching operations — cluster-wide create failures. Check ValidatingWebhookConfiguration failurePolicy (Fail vs Ignore), webhook pod health, network from apiserver to webhook Service. CRD controller errors: kubectl get <crd> -o yaml status conditions. For operators: check operator logs, finalizers blocking deletion, reconcile errors in status.',
        cmd: 'kubectl get validatingwebhookconfigurations -o yaml | grep -A10 failurePolicy\nkubectl get pods -n cert-manager\nkubectl logs -n op deploy/postgres-operator --tail=50\nkubectl get postgrescluster db -n prod -o jsonpath=\'{.status.conditions}\' | jq',
      },
      {
        q: 'Lead an incident review as the Kubernetes troubleshooting expert — what framework do you present?',
        a: 'Use structured postmortem: Timeline (UTC), Impact (users/revenue/SLO), Detection (MTTD, who reported), Root Cause (5 whys, not blame), Resolution steps, Lessons Learned, Action Items (owner, due date). Technical appendix: key kubectl outputs, metric graphs, config diffs. Emphasize systemic fixes: alerts, automation, testing, runbooks — not "be more careful."',
        cmd: 'kubectl get events -n prod --sort-by=.lastTimestamp --field-selector type=Warning\nkubectl rollout history deployment/api -n prod\nkubectl diff -f deployment.yaml\n# Document: git log --oneline -10 --since="2024-06-19"',
      },
    ],
  },
};

export const SCENARIO_CONTENT = [
  {
    title: 'Pod CrashLoopBackOff',
    difficulty: 'easy',
    q: '[Production Scenario] Pod CrashLoopBackOff: What is your troubleshooting approach?',
    a: 'Detect: alert on pod restart rate or CrashLoopBackOff status. Triage: kubectl get pods, describe pod for exit code and Events, logs --previous for stack trace. Common causes: misconfig (missing env), app bug, failed migrations, probe killing during slow start (check if liveness too aggressive). Mitigate: rollback deployment if post-release, scale unaffected replicas, fix config. Verify: new pods reach Running with restarts=0 for 10min. Prevent: staging soak test, startupProbe for slow apps, CI smoke tests.',
    cmd: 'kubectl get pods -n prod -l app=checkout\nkubectl describe pod checkout-7f8d9-xyz -n prod | grep -A30 Events\nkubectl logs checkout-7f8d9-xyz -n prod --previous --tail=200\nkubectl rollout undo deployment/checkout -n prod  # if post-deploy',
  },
  {
    title: 'Node Failure During Peak Traffic',
    difficulty: 'easy',
    q: '[Production Scenario] Node Failure During Peak Traffic: What is your troubleshooting approach?',
    a: 'Detect: node NotReady alert, pod rescheduling spike, error rate increase. Triage: kubectl get nodes, describe failed node (Conditions, Events), check cloud provider instance status. Pods on failed node rescheduled after pod-eviction-timeout (~5m). Mitigate: cordon bad node, verify replacements scheduling, ensure Cluster Autoscaler adds capacity, confirm PDB not blocking. Communicate status page if SLO impacted. Prevent: multi-AZ spread, PDB, over-provisioned node pools, spot diversification.',
    cmd: 'kubectl get nodes\nkubectl describe node ip-10-0-1-45.ec2.internal | grep -A10 Conditions\nkubectl get pods -A -o wide | grep -v Running\nkubectl get events -A | grep -i "node not ready\\|evict"\naws ec2 describe-instance-status --instance-ids i-0abc123',
  },
  {
    title: 'Service Connectivity Issues',
    difficulty: 'easy',
    q: '[Production Scenario] Service Connectivity Issues: What is your troubleshooting approach?',
    a: 'Detect: 502/503 from Ingress, connection refused errors in app logs. Triage: verify Service endpoints non-empty (kubectl get endpoints), pods Ready, selector labels match, NetworkPolicy allows traffic, DNS resolves (nslookup from client pod). Test ClusterIP directly bypassing Ingress. Mitigate: fix selector mismatch, restart misconfigured pods, adjust NetworkPolicy. Verify: curl from client namespace to service FQDN succeeds.',
    cmd: 'kubectl get svc api -n prod\nkubectl get endpoints api -n prod\nkubectl get pods -n prod -l app=api --show-labels\nkubectl run curl -n frontend --rm -it --image=curlimages/curl -- curl -sv http://api.prod.svc.cluster.local:8080/health\nkubectl get networkpolicy -n prod',
  },
  {
    title: 'Ingress TLS Certificate Expiry',
    difficulty: 'easy',
    q: '[Production Scenario] Ingress TLS Certificate Expiry: What is your troubleshooting approach?',
    a: 'Detect: browser TLS warnings, cert-manager Certificate NotReady alert, ssl_cert_not_after metric < 7 days. Triage: kubectl get certificate, describe for ACME challenge failures, check cert-manager logs, verify DNS/HTTP-01 reachability. Mitigate: manual cert secret update as hotfix, fix ClusterIssuer/Issuer config, renew via cert-manager. Verify: openssl s_client -connect api.example.com:443 | openssl x509 -dates. Prevent: alert at 30/14/7 days, automated renewal monitoring, staging issuer validation.',
    cmd: 'kubectl get certificate -n prod\nkubectl describe certificate api-tls -n prod\nkubectl logs -n cert-manager deploy/cert-manager --tail=50\nkubectl get certificaterequest,order,challenge -n prod\necho | openssl s_client -connect api.example.com:443 2>/dev/null | openssl x509 -noout -dates',
  },
  {
    title: 'Persistent Volume Mount Failure',
    difficulty: 'easy',
    q: '[Production Scenario] Persistent Volume Mount Failure: What is your troubleshooting approach?',
    a: 'Detect: pod stuck ContainerCreating, FailedMount events. Triage: describe pod Events (volume attachment, permission, wrong fs type), describe PVC (Bound?), PV nodeAffinity for zone match, CSI driver pod health. Common: volume attached to dead node, SELinux context, subPath directory missing. Mitigate: force detach volume (cloud console or CSI), delete pod to retry mount, fix fsGroup. Verify: pod Running with df showing mount.',
    cmd: 'kubectl describe pod db-0 -n prod | grep -A20 Events\nkubectl get pvc,pv -n prod\nkubectl get volumeattachment\nkubectl logs -n kube-system -l app=ebs-csi-node --tail=30\nkubectl exec db-0 -n prod -- df -h /var/lib/postgresql',
  },
  {
    title: 'HPA Not Scaling',
    difficulty: 'easy',
    q: '[Production Scenario] HPA Not Scaling: What is your troubleshooting approach?',
    a: 'Detect: sustained high CPU/latency but replica count flat. Triage: kubectl describe hpa for conditions (AbleToScale, ScalingActive), verify metrics-server running, pods have resource requests set, current metric vs target. Check maxReplicas not already reached, PDB blocking scale-down not up. Mitigate: fix missing requests, restart metrics-server, adjust target or maxReplicas. Verify: HPA scales within 2 sync periods under load test.',
    cmd: 'kubectl describe hpa api -n prod\nkubectl get apiservice v1beta1.metrics.k8s.io\nkubectl top pods -n prod -l app=api\nkubectl get hpa api -n prod -o yaml | grep -A15 metrics\nkubectl get pods -n prod -l app=api -o json | jq \'.items[0].spec.containers[0].resources\'',
  },
  {
    title: 'ConfigMap Not Mounted',
    difficulty: 'easy',
    q: '[Production Scenario] ConfigMap Not Mounted: What is your troubleshooting approach?',
    a: 'Detect: app using defaults/wrong config, CreateContainerConfigError, missing file in container. Triage: verify ConfigMap exists in same namespace, key names match volume items, volumeMount path correct, describe pod Mounts/Volumes section. Env-based config requires pod restart after ConfigMap change. Mitigate: fix ConfigMap keys, apply corrected deployment, rollout restart. Verify: kubectl exec cat /etc/config/app.yaml shows expected content.',
    cmd: 'kubectl get configmap app-config -n prod -o yaml\nkubectl describe pod app-abc -n prod | grep -A15 "Mounts:\\|Volumes:"\nkubectl exec app-abc -n prod -- ls -la /etc/config/\nkubectl get events -n prod | grep -i configmap\nkubectl rollout restart deployment/app -n prod',
  },
  {
    title: 'Secret Rotation Breaks App',
    difficulty: 'medium',
    q: '[Production Scenario] Secret Rotation Breaks App: What is your troubleshooting approach?',
    a: 'Detect: auth errors spike after secret update timestamp. Triage: compare Secret resourceVersion vs pod start time, check if app reloads mounted secrets or caches at startup, ESO sync status. Mitigate: immediate rollout restart to pick up new secret, temporarily restore dual-valid credentials at DB level, rollback secret if bad value. Verify: app connects with new credentials, no auth errors for 15min. Prevent: Reloader annotation, app SIGHUP reload, rotation runbook with overlap window.',
    cmd: 'kubectl get secret db-creds -n prod -o jsonpath=\'{.metadata.resourceVersion}{" "}{.metadata.creationTimestamp}{"\\n"}\'\nkubectl get pods -n prod -l app=api -o jsonpath=\'{range .items[*]}{.metadata.name}{" started "}{.status.startTime}{"\\n"}{end}\'\nkubectl rollout restart deployment/api -n prod\nkubectl logs -l app=api -n prod | grep -i "auth\\|password\\|denied" | tail -20',
  },
  {
    title: 'NetworkPolicy Blocking Traffic',
    difficulty: 'medium',
    q: '[Production Scenario] NetworkPolicy Blocking Traffic: What is your troubleshooting approach?',
    a: 'Detect: connection timeouts between known services after policy deploy. Triage: list NetworkPolicies in source and dest namespaces, identify default-deny policies, check if egress/ingress rules allow required ports and namespace/pod selectors, DNS (kube-system port 53 UDP/TCP). Mitigate: add explicit allow rule for required flow, or temporarily remove policy (emergency). Verify: netshoot curl between namespaces. Prevent: policy testing in staging, network policy simulator (cilium hubble, konfigure).',
    cmd: 'kubectl get networkpolicy -n prod\nkubectl get networkpolicy -n frontend -o yaml\nkubectl run test -n frontend --rm -it --image=nicolaka/netshoot -- curl -sv --max-time 5 http://api.backend.svc.cluster.local:8080\nkubectl describe networkpolicy default-deny -n prod\n# Cilium: cilium hubble observe --namespace prod',
  },
  {
    title: 'Deployment Rollout Stuck',
    difficulty: 'medium',
    q: '[Production Scenario] Deployment Rollout Stuck: What is your troubleshooting approach?',
    a: 'Detect: kubectl rollout status timeout, mixed ReplicaSet replica counts, ProgressDeadlineExceeded condition. Triage: get rs showing new RS with 0 ready, describe deployment, check new pod failures (image, probes, quota), PDB minAvailable blocking. Mitigate: fix failing pod issue or rollout undo, temporarily adjust maxUnavailable, resolve quota. Verify: all replicas on new RS, rollout status success. Prevent: --atomic helm upgrades, progressDeadlineSeconds alerting, pre-deploy resource checks.',
    cmd: 'kubectl rollout status deployment/api -n prod --timeout=2m\nkubectl get rs -n prod -l app=api\nkubectl describe deployment api -n prod | grep -A10 Conditions\nkubectl get pods -n prod -l app=api | grep -v "Running\\|Completed"\nkubectl rollout undo deployment/api -n prod  # if needed',
  },
  {
    title: 'StatefulSet Pod Ordering Failure',
    difficulty: 'medium',
    q: '[Production Scenario] StatefulSet Pod Ordering Failure: What is your troubleshooting approach?',
    a: 'Detect: pod-N stuck Pending/NotReady blocking pod-N+1 creation. Triage: describe failing pod-N (scheduling, PVC binding, readiness), check orderedReady policy, headless Service exists, PVC status for data-pod-N. Mitigate: fix pod-0 issue first (database bootstrap, PVC), never skip ordering by manual pod create. Verify: pods 0..N all Running and Ready sequentially. Prevent: robust readiness on pod-0, adequate zone/storage for PVCs.',
    cmd: 'kubectl get statefulset db -n prod\nkubectl get pods -n prod -l app=db --sort-by=.metadata.name\nkubectl describe pod db-0 -n prod\nkubectl get pvc -n prod | grep data-db\nkubectl logs db-0 -n prod --tail=50',
  },
  {
    title: 'Resource Quota Exceeded',
    difficulty: 'medium',
    q: '[Production Scenario] Resource Quota Exceeded: What is your troubleshooting approach?',
    a: 'Detect: FailedCreate events, pods Pending, HPA unable to scale, deploy pipeline failures. Triage: kubectl describe resourcequota showing USED vs HARD limits (pods, cpu, memory, pvc count). Identify resource hog (batch job, runaway HPA). Mitigate: delete unnecessary resources, temporary quota increase via platform team, optimize pod requests. Verify: new pods schedule successfully. Prevent: quota alerts at 80%, LimitRange defaults, regular capacity review.',
    cmd: 'kubectl describe resourcequota -n prod\nkubectl get events -n prod | grep -i "quota\\|exceeded\\|Forbidden"\nkubectl top pods -n prod --sort-by=memory | head -15\nkubectl get pods -n prod --field-selector status.phase=Pending',
  },
  {
    title: 'ImagePullBackOff in Production',
    difficulty: 'medium',
    q: '[Production Scenario] ImagePullBackOff in Production: What is your troubleshooting approach?',
    a: 'Detect: deployment rollout stuck, pods ImagePullBackOff/ErrImagePull. Triage: describe pod Events for 401/404/rate limit, verify image tag exists in registry, imagePullSecrets on SA/pod, registry reachable from nodes. Mitigate: fix tag/digest, update pull secret, rollback to known-good image, use cached digest on nodes. Verify: pods Pulled and Running. Prevent: deploy by digest, registry mirror, CI verify image exists before deploy.',
    cmd: 'kubectl describe pod api-new-xyz -n prod | grep -A15 Events\nkubectl get sa default -n prod -o yaml | grep imagePullSecrets\nkubectl run pull-test --rm -it --image=alpine --overrides=\'{"spec":{"containers":[{"name":"t","image":"myregistry.io/api:bad-tag"}]}}\' 2>&1 | head\nkubectl set image deployment/api api=myregistry.io/api@sha256:knowngood -n prod',
  },
  {
    title: 'DNS Resolution Failure Inside Cluster',
    difficulty: 'medium',
    q: '[Production Scenario] DNS Resolution Failure Inside Cluster: What is your troubleshooting approach?',
    a: 'Detect: NXDOMAIN or timeout errors in app logs for *.svc.cluster.local names. Triage: check CoreDNS pods Running in kube-system, kubectl logs on coredns, test nslookup from netshoot pod, verify Service exists, check ndots and search path in pod resolv.conf, NetworkPolicy blocking UDP/TCP 53 to kube-dns. Mitigate: restart CoreDNS, scale CoreDNS replicas, fix upstream forward config, add DNS allow NetworkPolicy. Verify: nslookup resolves all critical services.',
    cmd: 'kubectl get pods -n kube-system -l k8s-app=kube-dns\nkubectl logs -n kube-system -l k8s-app=kube-dns --tail=30\nkubectl run dns-test -n prod --rm -it --image=busybox:1.36 -- nslookup api.prod.svc.cluster.local\nkubectl exec app-pod -n prod -- cat /etc/resolv.conf\nkubectl get svc kube-dns -n kube-system',
  },
  {
    title: 'Helm Release Upgrade Failure',
    difficulty: 'hard',
    q: '[Production Scenario] Helm Release Upgrade Failure: What is your troubleshooting approach?',
    a: 'Detect: helm upgrade fails, release status pending-upgrade/failed, partial resource updates. Triage: helm status/history, --debug dry-run for template errors, hook Job failures, resource conflicts, CRD version mismatch, admission webhook rejections. Mitigate: helm rollback to last good revision, fix chart values, --force only if safe. Verify: helm status deployed, all pods ready, smoke tests pass. Prevent: helm diff in CI, --atomic --wait in prod, chart lint and kubeconform.',
    cmd: 'helm status api -n prod\nhelm history api -n prod\nhelm upgrade api ./charts/api -n prod -f values-prod.yaml --debug --dry-run 2>&1 | tail -50\nkubectl get jobs -n prod -l helm.sh/hook\nhelm rollback api -n prod',
  },
  {
    title: 'Node Disk Pressure Evictions',
    difficulty: 'hard',
    q: '[Production Scenario] Node Disk Pressure Evictions: What is your troubleshooting approach?',
    a: 'Detect: Evicted pods, node DiskPressure=True, imagefs/containerfs threshold exceeded alerts. Triage: describe node Conditions, identify disk usage (images, logs, emptyDir), kubectl get pods --field-selector status.phase=Failed. Mitigate: clean unused images (crictl rmi), increase disk or add nodes, reduce log volume, fix app writing unbounded emptyDir. Verify: node condition clears, evicted pods rescheduled. Prevent: monitoring node disk, log rotation, image GC tuning, ephemeral storage limits on pods.',
    cmd: 'kubectl describe node worker-2 | grep -A10 Conditions\nkubectl get pods -A --field-selector status.reason=Evicted | wc -l\nkubectl get events -A | grep -i "disk pressure\\|evict"\n# On node: sudo crictl images | wc -l && sudo crictl rmi --prune\nkubectl get pods -n prod -o json | jq \'.items[] | select(.spec.containers[].resources.limits."ephemeral-storage" == null) | .metadata.name\'',
  },
  {
    title: 'Liveness Probe Killing Pods',
    difficulty: 'hard',
    q: '[Production Scenario] Liveness Probe Killing Pods: What is your troubleshooting approach?',
    a: 'Detect: restart count climbing without deploy changes, Unhealthy liveness probe events, correlation with load spikes or GC pauses. Triage: describe pod probe config (timeout, periodSeconds, failureThreshold), check if /health checks downstream deps, compare with startup/readiness probes. Mitigate: fix probe endpoint to lightweight check, increase timeout/threshold, add startupProbe, rollout fixed deployment. Verify: restarts stable under peak load test. Prevent: probe standards in platform docs, CI lint rejecting dependency checks in liveness.',
    cmd: 'kubectl describe pod api-xyz -n prod | grep -A15 "Liveness\\|Events"\nkubectl get pods -n prod -l app=api -o json | jq \'.items[] | {name: .metadata.name, restarts: .status.containerStatuses[0].restartCount}\'\nkubectl logs api-xyz -n prod --previous | tail -30\nkubectl patch deployment api -n prod --type=json -p=\'[{"op":"replace","path":"/spec/template/spec/containers/0/livenessProbe/timeoutSeconds","value":5}]\'',
  },
  {
    title: 'RBAC Forbidden for CI ServiceAccount',
    difficulty: 'hard',
    q: '[Production Scenario] RBAC Forbidden for CI ServiceAccount: What is your troubleshooting approach?',
    a: 'Detect: CI/CD pipeline fails with "Forbidden" creating/updating resources. Triage: reproduce with kubectl auth can-i --as=system:serviceaccount:ci:deployer, review RoleBinding and Role rules for missing verbs/resources/apiGroups, check if deploying to wrong namespace. Mitigate: add required permissions to Role (not cluster-admin), bind SA to Role in target namespace. Verify: pipeline dry-run succeeds, can-i returns yes. Prevent: RBAC-as-code in git, least privilege review in PR, periodic rbac-tool audit.',
    cmd: 'kubectl auth can-i create deployments --as=system:serviceaccount:ci:deployer -n prod\nkubectl auth can-i patch deployments --as=system:serviceaccount:ci:deployer -n prod\nkubectl describe rolebinding ci-deploy -n prod\nkubectl get role deployer -n prod -o yaml\nkubectl auth can-i --list --as=system:serviceaccount:ci:deployer -n prod',
  },
  {
    title: 'PVC Binding Stuck Pending',
    difficulty: 'hard',
    q: '[Production Scenario] PVC Binding Stuck Pending: What is your troubleshooting approach?',
    a: 'Detect: pod Pending, PVC Pending, provisioning timeout alerts. Triage: describe PVC Events (no StorageClass, provisioner error, zone mismatch with WaitForFirstConsumer, quota, IAM permission for CSI). Check StorageClass exists, CSI controller logs, cloud volume limits. Mitigate: fix SC reference, correct IAM/IRSA for EBS CSI, increase quota, manually create PV for static provisioning. Verify: PVC Bound, pod schedules. Prevent: SC validation in CI, CSI health monitoring, default SC documentation.',
    cmd: 'kubectl describe pvc data-app-0 -n prod\nkubectl get storageclass\nkubectl logs -n kube-system deploy/ebs-csi-controller --tail=40\nkubectl get events -n prod | grep -i "provisioning\\|FailedBinding"\naws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123:role/ebs-csi --action-names ec2:CreateVolume',
  },
  {
    title: 'Cluster Autoscaler Not Adding Nodes',
    difficulty: 'hard',
    q: '[Production Scenario] Cluster Autoscaler Not Adding Nodes: What is your troubleshooting approach?',
    a: 'Detect: pods Pending FailedScheduling insufficient resources, node count static during load. Triage: CA logs (scale-up unneeded, max nodes reached, ASG at max, taints/tolerations mismatch, pod too large for any instance type, unschedulable due to affinity not autoscaler issue). Check node group max size, IAM for CA, expander config. Mitigate: increase max nodes, add instance types, fix pod resource requests, manual node group scale. Verify: CA log "Scale-up" and new node Ready, pods scheduled. Prevent: regular load tests, CA metrics dashboard, headroom node pool.',
    cmd: 'kubectl get pods -A --field-selector status.phase=Pending\nkubectl logs -n kube-system deploy/cluster-autoscaler --tail=50\nkubectl describe pod pending-large -n prod | grep -A10 Events\nkubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints\naws autoscaling describe-auto-scaling-groups --auto-scaling-group-names eks-prod-ng --query "AutoScalingGroups[0].[MinSize,MaxSize,DesiredCapacity]"',
  },
];
