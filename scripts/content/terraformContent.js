/**
 * Terraform interview content for AllPreps track generation.
 * 15 topics × 3 difficulties × 4 variants + 20 production scenarios.
 */

export const TOPIC_CONTENT = {
  'infrastructure-as-code': {
    easy: [
      {
        q: 'What is Infrastructure as Code (IaC) and why do teams adopt it over manual provisioning?',
        a: 'Infrastructure as Code treats cloud and datacenter resources as version-controlled, repeatable definitions instead of click-ops or ad-hoc shell scripts.\n• Declarative files describe desired end state; automation reconciles reality to match.\n• Changes go through PR review, CI validation, and auditable apply history.\n• Environments (dev/stage/prod) share the same modules with different variable files.\n• Rollback and disaster recovery improve because infrastructure is reproducible from Git.\n\nIn interviews, contrast IaC with imperative scripts (Ansible playbooks, bash) and explain when Terraform\'s plan/apply model fits best.',
        cmd: '# Inspect repo layout for IaC project\nls -la *.tf *.tfvars\n\n# Validate syntax before review\nterraform fmt -check -recursive\nterraform validate',
      },
      {
        q: 'Explain the difference between declarative and imperative infrastructure management.',
        a: 'Declarative tools (Terraform, CloudFormation) specify what the infrastructure should look like; the engine computes diffs and applies changes.\n• Imperative tools (CLI scripts, many Ansible tasks) specify step-by-step commands to run.\n• Declarative reduces drift when the same config is reapplied—Terraform converges to desired state.\n• Imperative gives fine-grained control for one-off migrations but is harder to reason about at scale.\n• Terraform still runs imperative API calls under the hood, but authors think in resources and dependencies.\n\nStrong answers mention idempotency: running Terraform twice should produce no changes when state matches config.',
        cmd: '# Declarative: plan shows desired delta\nterraform plan -var-file=dev.tfvars\n\n# Imperative contrast (avoid in prod)\naws ec2 run-instances --image-id ami-123 --instance-type t3.micro',
      },
      {
        q: 'What problems does IaC solve for platform and DevOps teams?',
        a: 'Manual infrastructure creates snowflake environments, slow onboarding, and incident-prone change windows.\n• IaC eliminates "works in my account" by codifying networking, IAM, and compute together.\n• New engineers spin up identical dev stacks from a branch and tfvars file.\n• Compliance teams audit Git history instead of guessing console changes.\n• Cost attribution improves when every resource carries consistent tags defined in code.\n• Pair IaC with policy-as-code (Sentinel, OPA) to block public S3 buckets or missing encryption before apply.',
        cmd: '# Show who changed infrastructure and when\ngit log --oneline -- main.tf modules/\n\n# Tag enforcement in provider block\n# provider "aws" { default_tags { tags = { managed_by = "terraform" } } }',
      },
      {
        q: 'How would you explain the Terraform workflow to a developer new to IaC?',
        a: 'The core loop is write → plan → review → apply, with state tracking what exists.\n• Authors edit .tf files defining providers, resources, variables, and outputs.\n• terraform init downloads providers and configures the backend.\n• terraform plan compares config + state to the live API and prints a change set.\n• terraform apply executes approved changes; state file records resource IDs.\n• Destroy removes resources Terraform manages—never delete cloud objects manually without updating state.\n\nEmphasize that plan output is the contract reviewers sign off on; never apply blind in production.',
        cmd: 'terraform init\nterraform plan -out=tfplan\nterraform show tfplan\nterraform apply tfplan',
      },
    ],
    medium: [
      {
        q: 'How do you structure an IaC repository for a multi-team organization?',
        a: 'Mature orgs separate concerns to limit blast radius and clarify ownership.\n• Monorepo vs polyrepo: monorepo with directories per domain (networking/, compute/, data/) works when platform team owns CI; polyrepo per service when teams deploy independently.\n• Shared modules live in a dedicated registry (Terraform Cloud, Git tags) version-pinned by consumers.\n• Root modules per environment (env/prod/, env/staging/) pass tfvars and backend config.\n• README per module documents inputs, outputs, and upgrade notes.\n• CODEOWNERS routes PRs to service teams; platform team owns core networking modules.\n\nAvoid a single main.tf thousands of lines long—partition by bounded context and lifecycle.',
        cmd: '# Recommended layout\n# modules/vpc/\n# modules/eks/\n# environments/prod/main.tf\n# environments/prod/prod.tfvars\n\nterraform -chdir=environments/prod init\nterraform -chdir=environments/prod plan',
      },
      {
        q: 'Compare Terraform with CloudFormation, Pulumi, and CDK for enterprise IaC.',
        a: 'Each tool trades off language choice, cloud coupling, and ecosystem maturity.\n• Terraform: multi-cloud HCL, largest module registry, remote state ecosystem—default for platform teams.\n• CloudFormation: native AWS, stack exports/imports, drift detection—best when AWS-only and org mandates it.\n• Pulumi/CDK: general-purpose languages (TypeScript, Python)—great for developers who want loops/unit tests in familiar syntax.\n• Terraform excels at module sharing across clouds; CDK/Pulumi excel when infra logic is complex application code.\n• Evaluation criteria: multi-cloud need, team skills, policy tooling, state management, and existing investment.\n\nPresent a decision matrix rather than declaring one winner—many enterprises run Terraform for core platform and CDK for app teams.',
        cmd: '# Terraform multi-cloud\nterraform providers\n\n# CloudFormation drift (AWS-only)\naws cloudformation detect-stack-drift --stack-name prod-vpc',
      },
      {
        q: 'How do you integrate IaC into a GitOps or CI/CD pipeline safely?',
        a: 'Pipeline gates prevent destructive surprises and enforce policy before credentials touch production.\n• PR triggers: terraform fmt -check, validate, tflint, tfsec/checkov, plan posted as comment.\n• Protected branches require two approvals for prod; apply runs only from main with OIDC auth (no long-lived keys).\n• Plan artifacts stored (S3, TFC run) so apply uses exact approved plan file.\n• Separate pipelines per environment with promotion: dev auto-apply, staging manual, prod change window.\n• Post-apply: smoke tests, Slack notification, automatic rollback runbook link.\n\nNever store state locally on CI runners—use remote backend with locking from day one.',
        cmd: '# CI plan with saved artifact\nterraform plan -var-file=prod.tfvars -out=plan.bin\nterraform show -json plan.bin > plan.json\n\n# Apply exact approved plan\nterraform apply plan.bin',
      },
      {
        q: 'What are common anti-patterns when teams first adopt IaC?',
        a: 'Early mistakes compound into state debt and fear of changing anything.\n• Click-ops then import everything without refactoring into modules.\n• Secrets in .tfvars committed to Git instead of env vars or Vault.\n• Local state files on laptops—lost laptop = lost infrastructure map.\n• Giant modules with 80 variables and no documentation.\n• Running apply without plan review or mixing manual console edits causing drift.\n• Using count = 1 instead of removing resources, leaving tombstones in state.\n\nRemediation: remote state, secret management, module boundaries, drift detection schedules, and terraform plan in CI on every PR.',
        cmd: '# Detect unformatted or invalid code\nterraform fmt -check -recursive\nterraform validate\n\n# Scan for secrets\n# checkov -d . --framework terraform',
      },
    ],
    hard: [
      {
        q: 'Design an enterprise IaC strategy spanning multiple clouds, business units, and compliance zones.',
        a: 'Global IaC requires federated governance without blocking team velocity.\n• Tier modules: L0 landing zone (network, logging, IAM baseline), L1 platform (EKS, RDS patterns), L2 app stacks owned by product teams.\n• Separate state per blast-radius boundary—never one state for entire org.\n• Policy-as-code at plan time (Sentinel/OPA) enforces tagging, regions, encryption, and approved instance types.\n• Module registry with semver; breaking changes require migration guides and deprecation window.\n• Cross-cloud abstraction: accept some duplication rather than lowest-common-denominator modules that leak cloud-specific hacks.\n• Audit: CloudTrail + Terraform Cloud run history + Git signed commits for SOC2 evidence.\n\nPresent a reference diagram: IdP → CI OIDC → TFC workspaces → cloud accounts with SCP guardrails.',
        cmd: '# Workspace per account/environment\n# terraform.cloud workspace: acme-prod-networking\n\nterraform login\nterraform workspace select prod-networking\nterraform plan',
      },
      {
        q: 'How would you migrate a large manually managed environment to IaC without downtime?',
        a: 'Big-bang rewrite fails; incremental import with parallel validation succeeds.\n• Discovery: inventory resources via cloud APIs (former2, aws-nuke inventory, Azure Resource Graph).\n• Prioritize by dependency order: IAM → network → data → compute → apps.\n• Write modules matching existing topology; use terraform import or import blocks (TF 1.5+) resource by resource.\n• Run plan after each import batch—goal is zero changes before cutover.\n• Dual-run period: IaC manages tags and non-critical attrs while runbooks handle critical paths until confidence grows.\n• Decommission manual changes via IAM deny on console for managed resource types.\n\nBudget 2–3× calendar time for state cleanup and module extraction versus initial import.',
        cmd: '# Import existing resource\nterraform import aws_instance.web i-0abc1234567890def\n\n# Terraform 1.5+ import block\n# import { to = aws_s3_bucket.logs id = "acme-prod-logs" }',
      },
      {
        q: 'Lead an incident review where IaC drift caused a production outage. What do you present?',
        a: 'Structure the review around timeline, root cause, detection gaps, and systemic fixes.\n• Timeline: manual SG change in console → next terraform apply reverted rule → broke health checks → outage.\n• Root cause: drift tolerated; no alert on plan diffs in prod; break-glass console access without ticket.\n• Impact: duration, customers affected, failed SLAs, cost of rollback.\n• Fixes: enforce IAM SCP denying manual changes on tagged resources; scheduled terraform plan with drift alerts; break-glass requires MFA + ticket.\n• Prevention: lifecycle ignore_changes only with documented exception; quarterly drift audits.\n\nExecutives want blameless analysis and measurable controls—show before/after policy enforcement and MTTR improvement.',
        cmd: '# Detect drift without applying\nterraform plan -refresh-only -detailed-exitcode\n\n# Exit codes: 0=no drift, 2=drift detected\n# Wire exit 2 to PagerDuty in CI cron',
      },
      {
        q: 'Evaluate build vs buy for an internal IaC platform wrapper versus vanilla Terraform Cloud.',
        a: 'The decision hinges on integration surface, compliance, TCO, and team capacity over 3 years.\n• Terraform Cloud/Enterprise: RBAC, private registry, Sentinel, run tasks, SSO—fast time to value.\n• Internal wrapper: custom portals, chargeback dashboards, org-specific workflows—high build/maintenance cost.\n• Hybrid: TFC for state/runs + internal Backstage templates calling TFC API for golden paths.\n• Criteria: required compliance (FedRAMP), multi-tenant isolation, cost at 500+ workspaces, need for custom policy engine.\n• Hidden costs: on-call for internal platform, provider upgrade lag, engineer attrition.\n\nDeliver ADR with 3-year TCO model and PoC metrics: plan latency, developer NPS, policy violation catch rate.',
        cmd: '# TFC API trigger run\ncurl -H "Authorization: Bearer $TF_TOKEN" \\\n  -H "Content-Type: application/vnd.api+json" \\\n  --request POST \\\n  https://app.terraform.io/api/v2/runs \\\n  -d \'{"data":{"type":"runs","attributes":{"message":"CI trigger"},"relationships":{"workspace":{"data":{"type":"workspaces","id":"ws-xxx"}}}}}\'',
      },
    ],
  },

  'terraform-basics': {
    easy: [
      {
        q: 'What is Terraform and what core problems does it solve?',
        a: 'Terraform is HashiCorp\'s open-source IaC tool that provisions and manages infrastructure using a declarative configuration language (HCL).\n• It talks to cloud and SaaS APIs via providers, building a dependency graph of resources.\n• Plan/apply workflow shows intended changes before execution.\n• State tracks real-world IDs so Terraform knows what it manages.\n• Modules enable reuse and composition across projects.\n\nIt is the de facto standard for multi-cloud infrastructure in many enterprises.',
        cmd: 'terraform version\nterraform -help\n\n# Quick start\nterraform init\nterraform plan\nterraform apply',
      },
      {
        q: 'Describe the standard Terraform project files and their roles.',
        a: 'A minimal Terraform project includes several file types with distinct purposes.\n• main.tf / *.tf: resource and provider definitions.\n• variables.tf: input variable declarations; terraform.tfvars supplies values.\n• outputs.tf: exported values for other stacks or CI.\n• versions.tf: required Terraform and provider version constraints.\n• backend config: where state is stored (often in versions.tf or backend.hcl).\n• .terraform.lock.hcl: provider checksum lock file—commit to Git.\n\nterraform.tfstate should never be committed when using local state; use remote backend instead.',
        cmd: 'ls *.tf .terraform.lock.hcl\n\n# Initialize and show providers\nterraform init\nterraform providers',
      },
      {
        q: 'What happens when you run terraform init, plan, and apply?',
        a: 'Each command has a distinct phase in the infrastructure lifecycle.\n• init: downloads provider plugins, configures backend, installs modules.\n• plan: refreshes state, compares to config, outputs create/update/delete actions.\n• apply: executes the plan, updates state, returns outputs.\n• Providers call cloud APIs; Terraform core orchestrates parallelism respecting depends_on.\n• Failed apply may leave partial changes—state reflects what succeeded; re-plan to converge.\n\nAlways run plan in CI and apply saved plans in production for reproducibility.',
        cmd: 'terraform init -upgrade\nterraform plan -out=plan.tfplan\nterraform apply plan.tfplan\n\n# Show current state resources\nterraform state list',
      },
      {
        q: 'Explain HCL syntax basics: resources, blocks, and attributes.',
        a: 'HCL (HashiConfiguration Language) is Terraform\'s DSL for describing infrastructure.\n• Blocks have a type and label: resource "aws_instance" "web" { ... }.\n• Attributes are key = value pairs inside blocks; nested blocks configure complex settings.\n• Expressions reference variables (var.name), resources (aws_instance.web.id), and functions (join, cidrsubnet).\n• Meta-arguments: count, for_each, lifecycle, depends_on, provider aliases.\n• Comments use # or //.\n\nValid HCL passes terraform validate; fmt enforces canonical formatting for readable diffs.',
        cmd: 'resource "aws_s3_bucket" "logs" {\n  bucket = "${var.prefix}-logs"\n\n  tags = {\n    Environment = var.environment\n  }\n}\n\nterraform fmt\nterraform validate',
      },
    ],
    medium: [
      {
        q: 'How do Terraform dependencies work—implicit vs explicit depends_on?',
        a: 'Terraform builds a DAG to determine create/destroy order.\n• Implicit dependencies: referencing another resource\'s attribute (aws_instance.web.subnet_id = aws_subnet.app.id) creates ordering.\n• Explicit depends_on: required when dependency is not via attribute reference (e.g., IAM role propagation delay).\n• destroy order is reverse of create; changing dependency graph can force replacement cascades.\n• Overusing depends_on reduces parallelism and hides missing attribute links.\n\nDebug ordering with TF_LOG=TRACE or graph output: terraform graph | dot -Tsvg > graph.svg.',
        cmd: 'resource "aws_instance" "app" {\n  depends_on = [aws_iam_role_policy_attachment.node]\n  ami           = var.ami\n  instance_type = "t3.micro"\n}\n\nterraform graph -type=plan',
      },
      {
        q: 'What is the Terraform lifecycle block and when do you use lifecycle rules?',
        a: 'lifecycle meta-arguments customize how Terraform treats individual resources.\n• create_before_destroy: minimize downtime when replacement is unavoidable (e.g., ASG launch template change).\n• prevent_destroy: block accidental terraform destroy on critical resources like prod database.\n• ignore_changes: stop managing specific attributes (e.g., tags applied by autoscaler)—use sparingly with comments.\n• replace_triggered_by (TF 1.2+): force replacement when another resource changes.\n\nMisused ignore_changes causes silent drift; document every exception in module README.',
        cmd: 'resource "aws_instance" "db" {\n  lifecycle {\n    prevent_destroy = true\n    ignore_changes  = [tags["LastPatched"]]\n  }\n}',
      },
      {
        q: 'How do you manage Terraform and provider version upgrades safely?',
        a: 'Version skew between CLI, providers, and modules is a top cause of surprise replacements.\n• Pin terraform { required_version = "~> 1.7.0" } and provider versions in required_providers.\n• Commit .terraform.lock.hcl; run terraform init -upgrade in a branch with full plan diff review.\n• Read provider CHANGELOG for ForceNew attribute changes—plan may show destroy/create on innocent edits.\n• Upgrade one provider at a time; run acceptance tests in staging workspace.\n• Use terraform version in CI to match local dev (tfenv, asdf).\n\nSchedule quarterly upgrade windows rather than running latest on production Friday afternoon.',
        cmd: 'terraform {\n  required_version = ">= 1.5.0, < 2.0.0"\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      version = "~> 5.0"\n    }\n  }\n}\n\nterraform init -upgrade',
      },
      {
        q: 'Explain terraform refresh-only and when to use it instead of a normal plan.',
        a: 'Refresh-only mode updates state from real infrastructure without applying config changes.\n• terraform plan -refresh-only (or terraform apply -refresh-only) reconciles state when manual drift occurred.\n• Use after incident console fixes to align state before next regular plan.\n• detailed-exitcode: 0 = no drift, 2 = drift detected—ideal for cron monitoring.\n• Does not change cloud resources—only state file entries.\n• Contrast with terraform apply which enforces config and may revert manual fixes.\n\nPair refresh-only plans with alerting; follow up with code change or import if drift was intentional.',
        cmd: 'terraform plan -refresh-only -detailed-exitcode\n\n# Apply state sync only\nterraform apply -refresh-only -auto-approve',
      },
    ],
    hard: [
      {
        q: 'Design a Terraform coding standard for a 200-engineer organization.',
        a: 'Standards reduce review friction and prevent state disasters at scale.\n• Naming: snake_case resources, descriptive labels (aws_s3_bucket.audit_logs not bucket1).\n• File layout: versions.tf, providers.tf, main.tf split by domain, data.tf for data sources.\n• Variables: every module input has type, description, validation block; sensitive = true for secrets.\n• Outputs: document consumers; mark sensitive outputs appropriately.\n• Required checks: fmt, validate, tflint, checkov on every PR; no apply without approved plan artifact.\n• Exceptions: lifecycle ignore_changes require ticket reference in comment.\n\nPublish standards in Backstage/confluence; enforce via CI and Sentinel policies. Include worked examples and anti-patterns appendix.',
        cmd: '# .pre-commit-config.yaml snippet\n# - repo: terraform fmt / validate / tflint\n\nterraform fmt -recursive\nterraform validate\ntflint --recursive',
      },
      {
        q: 'How would you troubleshoot a Terraform apply that partially failed mid-run?',
        a: 'Partial failure leaves infrastructure and state potentially inconsistent—treat as incident.\n• Capture error message and which resource failed; state already records completed resources.\n• Do NOT manually delete failed resources without state update—causes orphan or duplicate on retry.\n• Re-run terraform plan: shows remaining changes; may need taint or replace if resource is corrupted.\n• Provider bugs: check GitHub issues; workaround with lifecycle or split resource.\n• If state lock stuck from crashed CI, force-unlock only after confirming no active run.\n• Document RTO: some AWS resources (RDS, TGW) have long async failures.\n\nPost-incident: add retry logic in CI, reduce batch size with -target (emergency only), improve depends_on for propagation delays.',
        cmd: '# Retry after fixing root cause\nterraform plan\nterraform apply\n\n# Force replacement if resource is tainted\nterraform taint aws_instance.broken\nterraform apply',
      },
      {
        q: 'Explain advanced state manipulation: moved blocks, removed blocks, and taint vs replace.',
        a: 'Terraform 1.1+ improved refactoring without destructive state surgery.\n• moved block: renames resources in config without destroy/create (refactor module addresses).\n• removed block (1.7+): removes resource from config but keeps in state or destroys per config.\n• terraform state mv: CLI equivalent for moving resources between addresses.\n• taint (deprecated path): marks resource for recreate on next apply; prefer terraform apply -replace=ADDR.\n• apply -replace: targeted replacement for single resource debugging.\n\nAlways run plan after refactor—zero changes expected. Backup state before bulk state mv operations.',
        cmd: 'moved {\n  from = aws_instance.old_name\n  to   = aws_instance.new_name\n}\n\nterraform apply -replace=aws_instance.corrupted',
      },
      {
        q: 'Lead a technical evaluation of Terraform vs OpenTofu for your platform team.',
        a: 'Post-HashiCorp license change, many orgs evaluate OpenTofu ( MPL fork ) vs staying on Terraform.\n• Compatibility: OpenTofu 1.6+ tracks Terraform features; provider ecosystem largely shared.\n• Support: HashiCorp commercial support vs community/OpenTofu Foundation roadmap.\n• Terraform Cloud/Enterprise features have no OpenTofu equivalent—need separate CI/state solution.\n• Risk: long-term divergence in features (state encryption natively in OT, etc.).\n• Migration: swap binary, verify lock file, run plan with zero diff in staging.\n\nPresent risk matrix to leadership: legal, bus factor, TFC dependency, and 12-month feature parity assessment from PoC.',
        cmd: '# OpenTofu drop-in trial\ntofu version\ntofu init\ntofu plan\n\n# Compare plan output with terraform plan diff',
      },
    ],
  },

  providers: {
    easy: [
      {
        q: 'What is a Terraform provider and how does it relate to Terraform core?',
        a: 'Providers are plugins that translate Terraform resource definitions into API calls for a specific platform.\n• Terraform core handles graph, state, and CLI; providers implement CRUD for each resource type.\n• Each provider block configures authentication and default settings for its resources.\n• Providers are downloaded during terraform init from registry.terraform.io (or custom mirror).\n• Multiple providers can coexist in one module (aws, kubernetes, datadog).\n\nWithout a configured provider, resources cannot reach the cloud API.',
        cmd: 'terraform {\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      version = "~> 5.0"\n    }\n  }\n}\n\nprovider "aws" {\n  region = "us-east-1"\n}\n\nterraform init',
      },
      {
        q: 'How do you configure AWS provider authentication in Terraform?',
        a: 'The AWS provider accepts credentials from several sources in precedence order.\n• Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN.\n• Shared credentials file (~/.aws/credentials) and config profiles.\n• IAM role assumption via assume_role block in provider config.\n• In CI/CD: OIDC federation (no static keys)—preferred for production.\n• Never hardcode access keys in .tf files.\n\nUse distinct profiles or roles per environment to prevent accidental prod applies from dev laptops.',
        cmd: 'provider "aws" {\n  region  = var.region\n  profile = "staging"\n\n  assume_role {\n    role_arn = "arn:aws:iam::123456789012:role/TerraformDeploy"\n  }\n}',
      },
      {
        q: 'Explain provider aliases and when you need multiple provider configurations.',
        a: 'Provider aliases let one module manage resources in multiple regions or accounts.\n• Define: provider "aws" { alias = "west"; region = "us-west-2" }.\n• Reference: resource "aws_s3_bucket" "replica" { provider = aws.west ... }.\n• Common uses: multi-region replication, cross-account VPC peering, DR stacks.\n• Default provider has no alias; explicit provider meta-argument selects alias.\n• Each alias is a separate provider instance with its own configuration.\n\nDocument required providers in modules/README so consumers pass providers correctly.',
        cmd: 'provider "aws" {\n  alias  = "dr"\n  region = "eu-west-1"\n}\n\nresource "aws_s3_bucket" "dr_backup" {\n  provider = aws.dr\n  bucket   = "${var.prefix}-dr-backup"\n}',
      },
      {
        q: 'What is the Terraform provider registry and how are providers versioned?',
        a: 'The public registry at registry.terraform.io hosts official and community providers.\n• Source address format: namespace/type (hashicorp/aws, DataDog/datadog).\n• Version constraints use semver: ~> 5.0 allows 5.x patches, >= 4.0, < 6.0.\n• terraform init downloads matching versions and writes checksums to .terraform.lock.hcl.\n• Private registry (Terraform Cloud/Enterprise) hosts internal providers.\n• Pin versions to avoid surprise breaking changes on fresh init.\n\nReview provider CHANGELOG before minor bumps—new resources are safe; attribute renames may ForceNew.',
        cmd: 'terraform providers\n\nterraform providers schema -json | jq \'.provider_schemas | keys\'\n\n# Lock provider version\nterraform init',
      },
    ],
    medium: [
      {
        q: 'How do you use provider configuration aliases across modules (provider passing)?',
        a: 'Modules do not inherit parent provider configs automatically when aliases are involved.\n• Module must declare configuration_aliases in terraform { required_providers }.\n• Parent passes providers block when calling module.\n• Child resources reference provider = aws.prod explicitly.\n• Failure symptom: resources created in wrong account/region silently.\n• Test with plan review checking account IDs in resource ARNs.\n\nPlatform modules should accept providers map pattern for multi-account fan-out.',
        cmd: 'module "network" {\n  source = "./modules/network"\n\n  providers = {\n    aws = aws.prod\n  }\n}\n\n# modules/network/versions.tf\n# required_providers { aws { configuration_aliases = [aws] } }',
      },
      {
        q: 'Troubleshoot provider plugin download failures in CI and air-gapped environments.',
        a: 'Init failures block all Terraform operations—common in locked-down networks.\n• Error: registry unreachable → configure network mirror or terraformrc filesystem_mirror.\n• Error: checksum mismatch → delete lock entry and re-init with -upgrade after verifying provider authenticity.\n• Air-gap: vendor providers with terraform providers mirror, serve via internal Artifactory.\n• CI: cache .terraform/providers directory keyed on lock file hash.\n• Document fallback provider version in runbook when registry is down.\n\nValidate mirror with terraform init from a clean runner before declaring DR ready.',
        cmd: '# ~/.terraformrc\nprovider_installation {\n  filesystem_mirror {\n    path    = "/opt/terraform/providers"\n    include = ["registry.terraform.io/*/*"]\n  }\n  direct {\n    exclude = ["registry.terraform.io/*/*"]\n  }\n}\n\nterraform providers mirror /opt/terraform/providers',
      },
      {
        q: 'Compare official HashiCorp providers vs community providers for production use.',
        a: 'Provider maturity affects reliability and support expectations.\n• Official (hashicorp/*): maintained by HashiCorp or partner, broad adoption, responsive to API changes.\n• Community: verify maintainer activity, download counts, issue response time before prod adoption.\n• Some cloud features appear in community providers first (cloudflare/cloudflare vs legacy).\n• Pin exact versions for community providers; test upgrades in staging.\n• Evaluate Terraform Registry verification badges and security scan results.\n\nFor regulated industries, prefer official providers or vendored forks with internal SLA.',
        cmd: 'terraform init\n\n# Inspect installed provider version\nls .terraform/providers/registry.terraform.io/hashicorp/aws/',
      },
      {
        q: 'How do provider default_tags and ignore_tags reduce tagging drift?',
        a: 'AWS provider default_tags apply consistent tags to all supported resources automatically.\n• Define in provider block: default_tags { tags = { Environment = "prod", Team = "platform" } }.\n• ignore_tags keys prevent perpetual diffs when autoscaler or backup service adds tags.\n• Resource-level tags merge with defaults; explicit resource tags override same keys.\n• Other clouds have similar patterns (azurerm default tags via features block in newer versions).\n• Plan review should confirm cost allocation tags present on every billable resource.\n\nAvoid duplicating default tags manually on each resource—single source of truth in provider config.',
        cmd: 'provider "aws" {\n  region = "us-east-1"\n\n  default_tags {\n    tags = {\n      Environment = var.environment\n      ManagedBy   = "terraform"\n    }\n  }\n\n  ignore_tags {\n    keys = ["kubernetes.io/cluster/*"]\n  }\n}',
      },
    ],
    hard: [
      {
        q: 'Design a multi-account AWS provider strategy with OIDC, role chaining, and least privilege.',
        a: 'Enterprise AWS landing zones require Terraform to assume roles per account with minimal permissions.\n• CI OIDC provider trusts GitHub/GitLab; pipeline assumes org-level terraform-deploy role.\n• Role chaining: hub role → account-specific OrganizationAccountAccessRole or custom terraform role.\n• Provider per account via alias + assume_role; separate state per account.\n• IAM policy: scoped to required services; deny iam:* except approved paths via permission boundaries.\n• CloudTrail alerts on AssumeRole from unexpected principals.\n\nDiagram: CI → OIDC → mgmt account role → sts:AssumeRole → workload account provider alias. Rotate no long-lived keys.',
        cmd: 'provider "aws" {\n  alias  = "workload_prod"\n  region = "us-east-1"\n\n  assume_role {\n    role_arn     = "arn:aws:iam::111122223333:role/TerraformExecution"\n    session_name = "ci-${var.pipeline_id}"\n  }\n}',
      },
      {
        q: 'How would you handle a breaking provider upgrade that forces replacement of critical resources?',
        a: 'Provider upgrades that change ForceNew attributes can schedule mass destruction—treat as change program.\n• Identify affected resources: plan in staging with -upgrade, grep for forces replacement.\n• Mitigations: lifecycle prevent_destroy during migration, create_before_destroy for compatible types.\n• State manipulation: split resources, import into new resource address if schema allows.\n• Vendor escalation: open provider issue if replacement seems unnecessary.\n• Blue/green: stand up parallel stack, migrate traffic, decommission old.\n\nNever upgrade provider on prod state without staged plan diff signed by service owners.',
        cmd: 'terraform plan -upgrade | grep -E "forces replacement|must be replaced"\n\n# Targeted test\nterraform plan -target=aws_instance.critical',
      },
      {
        q: 'Explain custom provider development and when building an in-house provider makes sense.',
        a: 'Custom providers implement the Terraform plugin SDK for internal APIs not covered by existing providers.\n• Use terraform-plugin-framework (Go) for new development; SDKv2 is legacy.\n• Justify when: proprietary internal platform, unsupported API surface, compliance requires controlled plugin.\n• Costs: Go expertise, testing harness, release pipeline, long-term maintenance.\n• Alternatives first: null_resource + local-exec (anti-pattern at scale), HTTP data source, external provider.\n• Publish to private registry with semver and acceptance tests against mock API.\n\nMost teams should exhaust generic providers + API wrappers before committing to custom plugin maintenance.',
        cmd: '# Scaffold provider (Go)\n# go install github.com/hashicorp/terraform-plugin-docs/cmd/tfplugindocs@latest\n\n# Local dev override\n# ~/.terraformrc dev_overrides for registry.terraform.io/acme/internal',
      },
      {
        q: 'Lead incident response when wrong provider credentials applied changes to production account.',
        a: 'Applying with prod credentials to dev config (or vice versa) is a Sev-1 with potential data impact.\n• Stop: cancel running apply, revoke session if still active.\n• Assess: terraform state list vs CloudTrail CreateEvents in wrong account.\n• Rollback: terraform destroy targeted resources if safe; restore from backup if data touched.\n• Root cause: missing workspace/backend isolation, shared AWS_PROFILE, hardcoded account ID not validated.\n• Fixes: plan output must include account ID annotation; CI validates var.account_id matches workspace; SCP denies cross-account resource creation from CI role.\n\nBlameless review: add mandatory account guard variable with validation block checked in Sentinel.',
        cmd: 'data "aws_caller_identity" "current" {}\n\noutput "account_id" {\n  value = data.aws_caller_identity.current.account_id\n}\n\n# CI gate: fail if account_id != expected',
      },
    ],
  },

  resources: {
    easy: [
      {
        q: 'What is a Terraform resource and how is it declared in HCL?',
        a: 'Resources represent infrastructure objects Terraform creates, updates, and destroys.\n• Syntax: resource "TYPE" "NAME" { attribute = value }.\n• TYPE maps to provider resource (aws_instance, google_compute_network).\n• NAME is local identifier for references within the module.\n• Required and optional attributes depend on provider schema.\n• terraform state stores TYPE.NAME → remote ID mapping.\n\nResources are the building blocks; data sources read existing objects without managing them.',
        cmd: 'resource "aws_vpc" "main" {\n  cidr_block           = "10.0.0.0/16"\n  enable_dns_hostnames = true\n\n  tags = {\n    Name = "${var.prefix}-vpc"\n  }\n}',
      },
      {
        q: 'Explain the difference between Terraform resources and data sources.',
        a: 'Resources are managed: Terraform creates, updates, and destroys them to match config.\n• Data sources are read-only lookups of existing infrastructure (data "aws_ami" "latest").\n• Data sources refresh on every plan; no lifecycle management.\n• Use data sources for AMI IDs, existing VPCs, secrets from AWS Secrets Manager.\n• Mixing them: resource depends on data source attributes for configuration.\n• Import brings existing resources under resource management, not data sources.\n\nRule: if Terraform should enforce desired state, use resource; if referencing external fixed objects, use data.',
        cmd: 'data "aws_ami" "amazon_linux" {\n  most_recent = true\n  owners      = ["amazon"]\n\n  filter {\n    name   = "name"\n    values = ["amzn2-ami-hvm-*-x86_64-gp2"]\n  }\n}\n\nresource "aws_instance" "web" {\n  ami           = data.aws_ami.amazon_linux.id\n  instance_type = "t3.micro"\n}',
      },
      {
        q: 'What does it mean when Terraform wants to replace a resource during plan?',
        a: 'Replacement means destroy existing object and create new one—often causes downtime or new IDs.\n• Triggered when changing ForceNew attributes (aws_instance ami, subnet_id).\n• Plan shows: # aws_instance.web must be replaced.\n• create_before_destroy lifecycle can reduce downtime when supported.\n• Changing resource name in config destroys old address and creates new—not the same as in-place update.\n• Review every replacement in prod plans carefully.\n\nUse terraform plan -json and tools like Infracost to quantify replacement blast radius.',
        cmd: 'terraform plan\n\n# Force inspect replacement reasons\nterraform plan -json | jq \'.resource_changes[] | select(.change.actions[] == "delete")\'',
      },
      {
        q: 'How do count and for_each differ for creating multiple similar resources?',
        a: 'Both create multiple instances but with different ergonomics and stability.\n• count: integer index (count = 3); reference with resource.name[0]; removing middle item reshuffles indices.\n• for_each: map or set of strings; stable keys survive item removal (for_each = toset(["a","b","c"])).\n• for_each preferred for named instances and when identifiers must remain stable.\n• count acceptable for homogeneous numbered replicas with no external references to indices.\n• Module expansion supports both meta-arguments similarly.\n\nMigrating count → for_each requires state mv or moved blocks—plan carefully.',
        cmd: 'resource "aws_subnet" "private" {\n  for_each = var.private_subnets\n\n  vpc_id     = aws_vpc.main.id\n  cidr_block = each.value.cidr\n  tags       = { Name = each.key }\n}',
      },
    ],
    medium: [
      {
        q: 'How do you use dynamic blocks to generate nested configuration from variables?',
        a: 'Dynamic blocks iterate over complex variable structures for nested schema (ingress rules, routes).\n• Syntax: dynamic "ingress" { for_each = var.rules; content { ... } }.\n• content block exposes each.key and each.value.\n• Replaces copy-paste of repeated nested blocks.\n• Limitation: only for nested blocks, not top-level resources.\n• Combine with optional objects in variables for flexible module APIs.\n\nValidate variable shape with object type constraints to catch malformed input at plan time.',
        cmd: 'variable "ingress_rules" {\n  type = list(object({\n    port        = number\n    cidr_blocks = list(string)\n  }))\n}\n\nresource "aws_security_group" "app" {\n  dynamic "ingress" {\n    for_each = var.ingress_rules\n    content {\n      from_port   = ingress.value.port\n      to_port     = ingress.value.port\n      protocol    = "tcp"\n      cidr_blocks = ingress.value.cidr_blocks\n    }\n  }\n}',
      },
      {
        q: 'Explain resource targeting (-target) and why it should be avoided in routine operations.',
        a: 'terraform apply -target=resource limits graph walk to specified resource and dependencies.\n• Useful for emergency fixes or debugging single resource failures.\n• Risks: skips updates to dependent resources, causes config/state divergence.\n• Not a substitute for proper module boundaries or separate states.\n• Terraform warns that targeted apply is for exceptional use only.\n• Follow up with full untargeted plan to converge remaining drift.\n\nDocument every targeted apply in incident ticket with follow-up full apply scheduled.',
        cmd: '# Emergency only\nterraform apply -target=aws_security_group_rule.fix\n\n# Verify full graph afterward\nterraform plan',
      },
      {
        q: 'How do you manage resources that Terraform partially supports alongside external controllers?',
        a: 'Hybrid ownership is common with Kubernetes controllers, autoscalers, and SaaS integrations.\n• lifecycle ignore_changes on attributes managed externally (replica count, tags).\n• Separate resources Terraform owns (cluster) from those managed in-cluster (deployments).\n• Use kubernetes_manifest or helm_release for in-cluster resources when appropriate.\n• Periodic plan should show zero drift if ignore_changes is correct.\n• Anti-pattern: ignore_changes on critical security attributes.\n\nDefine clear ownership matrix: platform team = VPC, app team = K8s manifests via separate pipeline.',
        cmd: 'resource "aws_autoscaling_group" "app" {\n  lifecycle {\n    ignore_changes = [desired_capacity, tag]\n  }\n\n  min_size = 2\n  max_size = 10\n}',
      },
      {
        q: 'What are null_resource and terraform_data, and when are they appropriate?',
        a: 'These resources trigger provisioners or track arbitrary state without managing cloud objects.\n• null_resource (deprecated pattern): runs local-exec/remote-exec provisioners with triggers.\n• terraform_data (TF 1.4+): replacement for null_resource with input/output attributes.\n• Use sparingly: glue scripts, bootstrap steps not covered by providers.\n• triggers or input_change forces re-run when values change.\n• Prefer native provider resources or CI steps over provisioners when possible.\n\nOveruse of provisioners indicates missing provider feature or need for separate automation tool.',
        cmd: 'resource "terraform_data" "bootstrap" {\n  input = var.cluster_version\n\n  provisioner "local-exec" {\n    when    = create\n    command = "./scripts/post-cluster-create.sh ${var.cluster_name}"\n  }\n}',
      },
    ],
    hard: [
      {
        q: 'Design a resource abstraction layer that supports multi-cloud compute with a unified module interface.',
        a: 'Multi-cloud modules expose common variables (instance_size, network_id, tags) and branch internally.\n• Use provider-specific submodules selected by var.cloud = "aws" | "gcp" | "azure".\n• outputs normalize to common structure: { id, private_ip, hostname }.\n• Accept lowest-common-denominator features in interface; expose cloud_specific map for extensions.\n• Test matrix: plan in each cloud staging account on every module release.\n• Document unsupported feature gaps per cloud in compatibility matrix.\n\nAvoid mega-conditionals in one file—split into cloud submodule directories for maintainability.',
        cmd: 'module "compute" {\n  source = "./modules/compute/${var.cloud}"\n\n  instance_size = var.instance_size\n  subnet_id     = var.subnet_id\n  tags          = var.tags\n}',
      },
      {
        q: 'How would you refactor a monolithic resource file into modules without causing downtime?',
        a: 'Refactoring addresses without replacement requires moved blocks and disciplined planning.\n• Extract resources into module incrementally—one resource group per PR.\n• Add moved { from = aws_instance.web to = module.app.aws_instance.web } for each address change.\n• Run plan expecting zero changes after each extraction.\n• Avoid changing resource attributes during refactor PRs.\n• Keep old and new addresses in same state file during transition.\n• Rollback plan: revert Git, moved blocks are reversible.\n\nFor large extracts, use terraform state pull backup before each merge to prod.',
        cmd: 'moved {\n  from = aws_lb.main\n  to   = module.networking.aws_lb.main\n}\n\nterraform plan  # expect 0 changes',
      },
      {
        q: 'Troubleshoot circular dependency errors in complex resource graphs.',
        a: 'Circular dependencies prevent Terraform from building a valid DAG.\n• Error: Cycle: resource A depends on B depends on A.\n• Common cause: mutual attribute references or security group rules referencing each other.\n• Fix patterns: aws_security_group_rule as separate resources, depends_on break with intermediate resource, split stacks.\n• Use terraform graph to visualize cycle.\n• Sometimes split into two apply phases with -target bootstrap (document as technical debt).\n\nLong-term fix: redesign module boundaries so networking and compute states are separate.',
        cmd: 'terraform graph -type=plan | dot -Tsvg > plan.svg\n\n# Split SG rules\nresource "aws_security_group_rule" "app_ingress" {\n  type              = "ingress"\n  security_group_id = aws_security_group.app.id\n  from_port         = 443\n  to_port           = 443\n  protocol          = "tcp"\n  cidr_blocks       = [var.vpc_cidr]\n}',
      },
      {
        q: 'Explain handling resources with asynchronous creation (AWS ACM, RDS, EKS) in Terraform.',
        a: 'Cloud APIs return before resource is fully ready—Terraform must wait or subsequent resources fail.\n• Providers implement polling timeouts (create_timeout) waiting for status = available.\n• Tune timeouts block: timeouts { create = "60m" } for slow resources.\n• depends_on ensures ordering but not readiness—provider must handle wait.\n• If races persist: time_sleep resource (hashicorp/time) or health check data source.\n• EKS: wait for cluster endpoint live before kubernetes provider resources.\n\nMonitor apply duration metrics; alert when creates approach timeout indicating API issues.',
        cmd: 'resource "aws_db_instance" "main" {\n  timeouts {\n    create = "40m"\n    update = "40m"\n  }\n\n  allocated_storage = 100\n  engine            = "postgres"\n  instance_class    = "db.r6g.large"\n}',
      },
    ],
  },

  variables: {
    easy: [
      {
        q: 'What are Terraform input variables and how do you declare them?',
        a: 'Input variables parameterize modules and root modules without hardcoding values.\n• Declare in variables.tf: variable "region" { type = string; default = "us-east-1" }.\n• Set via terraform.tfvars, -var flags, or TF_VAR_ environment variables.\n• description helps documentation and Terraform Cloud variable forms.\n• type constraints catch errors early (string, number, bool, list, map, object).\n• Variables make modules reusable across environments.\n\nNever store secrets in tfvars files committed to Git—use env vars with sensitive = true.',
        cmd: 'variable "environment" {\n  description = "Deployment environment name"\n  type        = string\n}\n\n# prod.tfvars\nenvironment = "prod"',
      },
      {
        q: 'Explain variable types and why type constraints matter.',
        a: 'Strong typing prevents subtle bugs from wrong-shaped input at plan time.\n• Primitives: string, number, bool.\n• Collections: list(type), set(type), map(type).\n• Structural: object({ key = type }) and tuple([type, type]).\n• any disables validation—avoid except migration shims.\n• optional() in object attributes (TF 1.3+) for partial specs.\n\nExample failure caught by types: passing "3" string where number expected for instance_count.',
        cmd: 'variable "subnets" {\n  type = map(object({\n    cidr = string\n    az   = string\n  }))\n}',
      },
      {
        q: 'What is the difference between terraform.tfvars, *.auto.tfvars, and -var-file?',
        a: 'Multiple mechanisms supply variable values with precedence rules.\n• terraform.tfvars and terraform.tfvars.json loaded automatically if present.\n• *.auto.tfvars loaded alphabetically—good for default layers.\n• -var-file=explicit.tfvars on CLI for environment-specific files.\n• -var "key=value" for one-offs; lowest precedence vs tfvars in some cases.\n• TF_VAR_name env vars for CI secrets injection.\n\nConvention: prod.tfvars, staging.tfvars kept in repo (non-secret); secrets via CI env only.',
        cmd: 'terraform plan -var-file=prod.tfvars\n\nexport TF_VAR_db_password="$(vault read -field=password secret/db)"\nterraform apply -var-file=prod.tfvars',
      },
      {
        q: 'How do you mark a variable as sensitive and what effect does it have?',
        a: 'sensitive = true on a variable redacts its value from plan/apply output and logs.\n• Prevents accidental exposure of passwords, API keys in CI logs.\n• Value still stored in state file—state access must also be restricted.\n• Does not encrypt state; use remote backend encryption and RBAC.\n• Sensitive variables still pass to resources normally.\n• terraform console will also redact sensitive values.\n\nPair with external secret stores (Vault, AWS SM) and ephemeral CI credentials.',
        cmd: 'variable "api_token" {\n  type      = string\n  sensitive = true\n}\n\n# Still appears in state — protect backend access',
      },
    ],
    medium: [
      {
        q: 'How do variable validation blocks work and what are good validation patterns?',
        a: 'validation blocks (TF 0.13+) add custom constraints beyond type checking.\n• condition = expression must be true; error_message shown on failure.\n• Validate CIDR format, enum environments, regex naming conventions.\n• Multiple validation blocks per variable allowed.\n• Runs at plan time—no API calls in validation (keep it pure HCL).\n• Combine with nullable = false (TF 1.1+) to require explicit values.\n\nExample: enforce prod uses instance types from approved list via contains().',
        cmd: 'variable "environment" {\n  type = string\n\n  validation {\n    condition     = contains(["dev", "staging", "prod"], var.environment)\n    error_message = "environment must be dev, staging, or prod."\n  }\n}',
      },
      {
        q: 'Explain variable precedence when the same variable is set in multiple places.',
        a: 'Terraform merges variable sources with defined precedence (highest wins last applied conceptually).\n• CLI -var and -var-file override tfvars in practice when specified later.\n• Environment TF_VAR_* typically override auto-loaded tfvars.\n• Terraform Cloud workspace variables override repo tfvars when marked overwrite.\n• Document team convention to avoid confusion about which file is authoritative.\n• Use terraform console or debug log to trace unexpected values.\n\nCI should pass -var-file explicitly rather than relying on implicit auto-loading.',
        cmd: 'terraform plan \\\n  -var-file=common.tfvars \\\n  -var-file=prod.tfvars \\\n  -var="instance_count=5"',
      },
      {
        q: 'How do you design module variable interfaces for optional features (feature flags)?',
        a: 'Optional features use nullable objects, bool toggles, or empty defaults.\n• Pattern: enable_monitoring = false with dynamic resources gated by count = var.enable ? 1 : 0.\n• object with optional fields (TF 1.3+): optional(string) defaults to null.\n• Provide sensible defaults so minimal module call works.\n• Document which combinations are tested; unsupported combos fail validation.\n• Avoid 40 bool flags—group related settings into objects (monitoring_config = { ... }).\n\nVersion module interface changes with semver; add validation when deprecating flags.',
        cmd: 'variable "monitoring" {\n  type = object({\n    enabled = optional(bool, false)\n    retention_days = optional(number, 30)\n  })\n  default = {}\n}',
      },
      {
        q: 'What are local values (locals) and when should you use them instead of variables?',
        a: 'locals are computed intermediate values not exposed as module inputs.\n• Defined in locals { name = expression } block.\n• Reference as local.name.\n• Use for derived values: name_prefix = "${var.project}-${var.env}".\n• Reduces repetition; keeps DRY tag naming and ARN construction.\n• Cannot be set from CLI—internal only.\n\nIf external callers need to influence it, make it a variable; if computed from other inputs, use local.',
        cmd: 'locals {\n  name_prefix = "${var.project}-${var.environment}"\n  common_tags = {\n    Project     = var.project\n    Environment = var.environment\n    ManagedBy   = "terraform"\n  }\n}',
      },
    ],
    hard: [
      {
        q: 'Design a variable schema for a landing-zone module consumed by 50 application teams.',
        a: 'Shared landing-zone modules need strict contracts and escape hatches.\n• Core required: account_id, vpc_cidr, environment, cost_center.\n• Validations: CIDR overlaps, naming regex, approved regions list.\n• Optional feature objects: enable_transit_gateway, enable_flow_logs with defaults.\n• tags map merged with enforced platform tags via locals (teams cannot override ManagedBy).\n• Versioned JSON schema published for IDE autocomplete (terraform-docs, variable JSON export).\n• Breaking changes require major version bump and migration workshop.\n\nProvide example tfvars per persona: minimal app team vs full platform extension.',
        cmd: 'variable "account" {\n  type = object({\n    id          = string\n    cost_center = string\n    region      = string\n  })\n\n  validation {\n    condition     = can(regex("^\\d{12}$", var.account.id))\n    error_message = "account.id must be 12-digit AWS account ID."\n  }\n}',
      },
      {
        q: 'How would you migrate from flat tfvars to hierarchical config (YAML/Jsonnet) feeding Terraform?',
        a: 'Large orgs outgrow flat tfvars; external config generation keeps Terraform HCL clean.\n• Pipeline renders terraform.tfvars.json from YAML per environment using Python/Jsonnet/Cue.\n• Terraform reads JSON tfvars natively.\n• Single source of truth for app + infra config; diffable in PR.\n• Alternative: terragrunt inputs from hierarchy of hcl files.\n• Validate rendered output against JSON Schema before terraform plan.\n\nAvoid runtime external data sources for config that should be PR-reviewed—render at CI time.',
        cmd: '# Render config\npython scripts/render_tfvars.py --env prod > prod.auto.tfvars.json\n\nterraform plan -var-file=prod.auto.tfvars.json',
      },
      {
        q: 'Troubleshoot "Invalid value for variable" errors blocking CI pipelines at scale.',
        a: 'Validation failures are desirable gates but need actionable messages and discoverability.\n• Read full error_message from validation block—improve if vague.\n• Common causes: typo in enum, wrong object shape after module upgrade, null passed to non-nullable.\n• CI: print var.environment and redacted tfvars on failure for debugging.\n• Maintain CHANGELOG for variable renames with sed migration scripts.\n• Temporary: validation { condition = true } feature flag only in emergency with ticket.\n\nTrack validation failure rate in CI metrics—spikes indicate bad module release.',
        cmd: 'terraform plan -var-file=prod.tfvars 2>&1 | tee plan.log\n\n# Test variable in isolation\nterraform console -var-file=prod.tfvars\n> var.instance_types',
      },
      {
        q: 'Explain using variable files with Terraform Cloud/Enterprise variable sets across workspaces.',
        a: 'TFC variable sets propagate common values to workspace groups.\n• Global set: organization name, shared tags; env-specific set: account IDs.\n• HCL vs ENV category: HCL for maps/lists, ENV for TF_VAR strings.\n• Sensitive variables encrypted at rest; not shown in UI after save.\n• Precedence: workspace variable overrides variable set when same key.\n• terraform.tfvars in VCS still loaded unless overridden—watch duplicates.\n\nAutomate variable set updates via TFC API when onboarding new accounts to landing zone.',
        cmd: 'curl \\\n  -H "Authorization: Bearer $TF_TOKEN" \\\n  -H "Content-Type: application/vnd.api+json" \\\n  --request POST \\\n  https://app.terraform.io/api/v2/varsets/<id>/relationships/vars \\\n  -d \'{"data":{"type":"vars","attributes":{"key":"environment","value":"prod","category":"terraform","hcl":false}}}\'',
      },
    ],
  },

  outputs: {
    easy: [
      {
        q: 'What are Terraform outputs and why define them?',
        a: 'Outputs export values from a module or root module to users, CI, or other stacks.\n• Declare: output "vpc_id" { value = aws_vpc.main.id }.\n• Displayed after apply; readable via terraform output command.\n• Module outputs consumed by parent: module.network.vpc_id.\n• Enable remote state data sources for stack-to-stack wiring.\n• description documents purpose for terraform-docs.\n\nOutputs are the public API of a module— treat breaking output renames as semver major bumps.',
        cmd: 'output "load_balancer_dns" {\n  description = "Public DNS name of the ALB"\n  value       = aws_lb.main.dns_name\n}\n\nterraform output load_balancer_dns',
      },
      {
        q: 'How do you reference outputs from another Terraform state?',
        a: 'Remote state data source reads outputs from another backend without duplicating resources.\n• data "terraform_remote_state" "network" { backend = "s3"; config = { bucket = ... } }.\n• Access: data.terraform_remote_state.network.outputs.vpc_id.\n• Requires upstream stack to expose output explicitly.\n• Couples stacks loosely—upstream output removal breaks downstream plan.\n• Alternative: use service discovery (SSM Parameter Store, Consul) for runtime decoupling.\n\nDocument dependency direction: network → compute → app; never circular remote state.',
        cmd: 'data "terraform_remote_state" "vpc" {\n  backend = "s3"\n  config = {\n    bucket = "acme-terraform-state"\n    key    = "network/prod/terraform.tfstate"\n    region = "us-east-1"\n  }\n}\n\nvpc_id = data.terraform_remote_state.vpc.outputs.vpc_id',
      },
      {
        q: 'Explain sensitive outputs and how they differ from sensitive variables.',
        a: 'sensitive = true on outputs redacts values in CLI and UI display after apply.\n• Prevents leaking private IPs, connection strings in CI logs.\n• State still contains cleartext—secure backend mandatory.\n• Downstream remote state consumers can still read sensitive outputs programmatically with access.\n• Mark outputs sensitive even when sourced from non-sensitive resources (private DB endpoint).\n• terraform output -json respects sensitivity flags.\n\nSecurity reviews should grep for outputs exposing credentials without sensitive flag.',
        cmd: 'output "db_connection_string" {\n  description = "PostgreSQL connection URI"\n  value       = "postgresql://${aws_db_instance.main.endpoint}"\n  sensitive   = true\n}',
      },
      {
        q: 'What is terraform output -json used for in automation?',
        a: 'JSON output enables scripts and CI to consume Terraform results programmatically.\n• terraform output -json returns all outputs keyed by name.\n• jq extracts values for subsequent deploy steps (kubectl config, smoke test URLs).\n• Non-sensitive outputs only in logs; pipe sensitive carefully.\n• Empty if no outputs defined or state not applied.\n• Prefer structured outputs (objects) over string parsing of human-readable output.\n\nExample CI flow: apply → output -json → deploy app using cluster endpoint.',
        cmd: 'terraform apply -auto-approve\n\nCLUSTER=$(terraform output -json | jq -r \'.cluster_name.value\')\necho "Deploying to $CLUSTER"',
      },
    ],
    medium: [
      {
        q: 'How do you design module outputs for composability without leaking internal resources?',
        a: 'Good outputs expose stable contracts, not implementation details.\n• Export IDs and DNS names consumers need; hide internal security group IDs unless required.\n• Use objects for grouped outputs: { id, arn, endpoint }.\n• preconditions on outputs (TF 1.2+) validate value non-null before expose.\n• Avoid outputting entire resource objects—locks consumers to provider schema.\n• terraform-docs generates tables from output descriptions.\n\nSemver: adding outputs is minor; removing or renaming is major.',
        cmd: 'output "database" {\n  description = "RDS instance connection details"\n  value = {\n    endpoint = aws_db_instance.main.endpoint\n    port     = aws_db_instance.main.port\n    name     = aws_db_instance.main.db_name\n  }\n}',
      },
      {
        q: 'Compare remote state outputs vs SSM Parameter Store / Vault for cross-stack configuration.',
        a: 'Both patterns pass data between stacks with different coupling and runtime characteristics.\n• Remote state: compile-time coupling, fails plan if upstream missing, Terraform-native.\n• SSM/Vault: runtime lookup via data source, decouples release cycles, supports non-Terraform consumers.\n• SSM better when app teams poll config at boot; remote state better for infra-infra dependencies.\n• Secrets belong in Vault/SM, referenced by data source—never plain outputs for passwords.\n• Hybrid: network stack writes SSM; app stack reads parameter; no remote state dependency.\n\nChoose based on blast radius of upstream change and who consumes the value.',
        cmd: 'resource "aws_ssm_parameter" "vpc_id" {\n  name  = "/platform/prod/vpc_id"\n  type  = "String"\n  value = aws_vpc.main.id\n}\n\ndata "aws_ssm_parameter" "vpc" {\n  name = "/platform/prod/vpc_id"\n}',
      },
      {
        q: 'How do output preconditions and preconditions block improve reliability?',
        a: 'Preconditions (check blocks family) fail fast with clear errors when invariants break.\n• output precondition: condition ensures value meets contract before exposing.\n• Example: fail if load_balancer_dns is empty string after apply.\n• Catches provider bugs or misconfiguration before downstream stacks consume bad data.\n• Prefer preconditions over post-apply shell scripts asserting outputs.\n• lifecycle precondition on resources validates settings pre-apply similarly.\n\nUse for critical platform guarantees: CIDR non-zero, TLS cert ARN present.',
        cmd: 'output "api_url" {\n  value = aws_apigatewayv2_api.main.api_endpoint\n\n  precondition {\n    condition     = startswith(aws_apigatewayv2_api.main.api_endpoint, "https://")\n    error_message = "API endpoint must be HTTPS."\n  }\n}',
      },
      {
        q: 'Troubleshoot downstream errors when an upstream output changes type or is removed.',
        a: 'Output contract breaks manifest as downstream plan failures or wrong-type errors.\n• Symptom: Invalid index on object, unsupported attribute in remote state output.\n• Fix upstream: restore deprecated output with deprecation notice for one release cycle.\n• Downstream: pin remote state to known good state version temporarily (dangerous).\n• Process: treat outputs as API—changelog, semver, integration test between stacks.\n• Alternative output name during migration: vpc_id_v2 parallel to vpc_id.\n\nRun coordinated multi-stack apply windows for breaking output changes.',
        cmd: '# Downstream diagnostic\nterraform console\n> data.terraform_remote_state.network.outputs\n\n# Upstream: keep deprecated output one release\noutput "vpc_id" {\n  value       = aws_vpc.main.id\n  description = "DEPRECATED: use network.vpc.id"\n}',
      },
    ],
    hard: [
      {
        q: 'Design an output federation pattern for a hub-and-spoke multi-account landing zone.',
        a: 'Hub stack exports shared infrastructure; spokes consume via remote state or SSM fan-out.\n• Hub outputs: transit_gateway_id, private_hosted_zone_id, centralized_log_bucket_arn.\n• Each spoke data source reads hub remote state from known S3 key with IAM restricted read.\n• Avoid spokes reading other spokes—hub only topology.\n• Output change management: hub plan reviewed by all spoke owners.\n• DR: replicate state bucket; document failover output keys.\n\nFor 100+ accounts, push hub outputs to SSM in each account via provider alias loop instead of remote state fan-in.',
        cmd: 'output "transit_gateway_id" {\n  value = aws_ec2_transit_gateway.main.id\n}\n\n# Spoke\nhub_tgw = data.terraform_remote_state.hub.outputs.transit_gateway_id',
      },
      {
        q: 'How would you prevent sensitive output leakage in CI logs and Terraform Cloud run UI?',
        a: 'Defense in depth beyond sensitive = true flag.\n• Mark all credential-adjacent outputs sensitive; audit with static analysis (tfsec).\n• CI: strip terraform output from public logs; store in sealed artifact.\n• TFC: restrict workspace access; sensitive outputs hidden from low-privilege users.\n• Never echo terraform output to PR comments for prod without redaction bot.\n• Use short-lived credentials generated post-apply inside vault, not output as long-lived keys.\n• Alert on regex patterns (AKIA, Bearer) in CI log scanners.\n\nIncident playbooks for accidental log exposure: rotate credentials immediately.',
        cmd: 'terraform apply -auto-approve\n\n# Write to secure store, not stdout\nterraform output -json | \\\n  jq -r \'.db_password.value\' | \\\n  vault kv put secret/db/prod password=-',
      },
      {
        q: 'Explain output value interpolation across workspaces using terraform_remote_state vs TFC outputs.',
        a: 'TFC can orchestrate run triggers when upstream workspace applies; remote state is pull-based.\n• TFC run triggers: downstream auto-plans when network workspace completes—reduces stale config window.\n• terraform_remote_state: explicit dependency, works with any S3/GCS backend.\n• TFC terraform_remote_state backend config uses organization + workspace name.\n• tfe_outputs data source (TFE provider) reads workspace outputs via API.\n• Trade-off: TFC coupling vs portable S3 remote state.\n\nMulti-region: replicate outputs to regional SSM for local consumption latency.',
        cmd: 'data "terraform_remote_state" "peer" {\n  backend = "remote"\n  config = {\n    organization = "acme"\n    workspaces = {\n      name = "networking-prod"\n    }\n  }\n}',
      },
      {
        q: 'Lead a review of output sprawl causing tight coupling between 15 Terraform stacks.',
        a: 'Output sprawl creates fragile dependency mesh—refactor toward bounded contexts.\n• Inventory: diagram which stacks read which remote states (script terraform state pull metadata).\n• Classify outputs: platform contract (keep), convenience (delete), secret (move to vault).\n• Introduce event-driven updates: hub writes SSM; consumers use data source—remove remote state deps where possible.\n• Enforce max outputs per module lint rule.\n• Merge stacks that always plan/apply together—wrong state split causes output ping-pong.\n\nSuccess metric: reduce cross-stack remote state references by 50% without increasing manual steps.',
        cmd: '# Inventory remote state usage\nrg "terraform_remote_state" environments/ --glob "*.tf"\n\n# Count outputs per stack\nterraform output -json | jq \'keys | length\'',
      },
    ],
  },

  'state-files': {
    easy: [
      {
        q: 'What is Terraform state and why is it required?',
        a: 'Terraform state is a JSON snapshot mapping resource addresses to real-world IDs and metadata.\n• Providers need IDs to update/delete existing objects on subsequent runs.\n• State caches attribute values for performance (avoid full API refresh every plan).\n• Without state, Terraform assumes nothing exists and tries to recreate everything.\n• State may contain sensitive values—treat as confidential.\n• Default local state: terraform.tfstate in working directory.\n\nRemote state with locking is mandatory for team production use.',
        cmd: 'terraform state list\nterraform state show aws_vpc.main\n\n# Never commit terraform.tfstate to Git in team projects',
      },
      {
        q: 'Explain the difference between terraform.tfstate and terraform.tfstate.backup.',
        a: 'Terraform maintains state files locally when using default backend.\n• terraform.tfstate: current authoritative state after last successful apply.\n• terraform.tfstate.backup: previous state snapshot before last write.\n• Backup enables manual recovery if state corrupted during failed write.\n• Remote backends manage versioning separately (S3 versioning, TFC history).\n• terraform state pull/push manipulates remote state manually—use with caution.\n\nEnable S3 versioning on state buckets for point-in-time recovery.',
        cmd: 'terraform state pull > state.json\n\n# Restore from backup (local backend emergency)\n# cp terraform.tfstate.backup terraform.tfstate',
      },
      {
        q: 'What metadata does state store beyond resource IDs?',
        a: 'State JSON includes rich metadata Terraform needs for operations.\n• Resource attributes (including sensitive, marked sensitive in output).\n• Dependencies and provider configuration.\n• serial and lineage fields for concurrent write detection.\n• terraform version and each resource\'s schema version.\n• Outputs section mirrors last apply output values.\n\nterraform show and state show read from state without calling cloud APIs for cached attrs.',
        cmd: 'terraform state pull | jq \'.resources[0]\'\n\nterraform show -json | jq \'.values.root_module.resources | length\'',
      },
      {
        q: 'How do you inspect and filter resources in state?',
        a: 'State subcommands help operations and debugging without editing JSON by hand.\n• terraform state list: all addresses; filter with grep.\n• terraform state show ADDR: attributes for one resource.\n• terraform state rm ADDR: remove from state without destroying cloud object (dangerous).\n• terraform state mv: rename address.\n• Prefer moved blocks over manual mv when refactoring.\n\nAlways backup state before rm or mv operations.',
        cmd: 'terraform state list | grep aws_instance\n\nterraform state show aws_instance.web\n\nterraform state mv aws_instance.old aws_instance.new',
      },
    ],
    medium: [
      {
        q: 'How does state locking prevent concurrent writes and what backends support it?',
        a: 'Locking ensures only one apply modifies state at a time.\n• S3 backend uses DynamoDB lock table; GCS uses native locking; Azure uses blob leases.\n• Terraform Cloud locks automatically during runs.\n• Stale lock from crashed CI: terraform force-unlock LOCK_ID after verifying no active run.\n• Without locking, concurrent applies corrupt state with last-write-wins.\n• Lock timeout configurable for long applies.\n\nMonitor force-unlock usage—frequent unlocks indicate CI reliability issues.',
        cmd: 'terraform {\n  backend "s3" {\n    bucket         = "acme-tfstate"\n    key            = "prod/app/terraform.tfstate"\n    region         = "us-east-1"\n    dynamodb_table = "terraform-locks"\n    encrypt        = true\n  }\n}\n\nterraform force-unlock <LOCK_ID>',
      },
      {
        q: 'Explain state encryption at rest and in transit for compliance.',
        a: 'State contains secrets—encryption and access control are compliance requirements.\n• S3 backend: encrypt = true enables SSE; use KMS CMK for key rotation audit.\n• In transit: HTTPS for S3/TFC API calls.\n• Terraform 1.2+ optional state encryption with passphrase (experimental features vary).\n• Restrict IAM to state bucket: least privilege for CI roles.\n• Enable bucket versioning and MFA delete protection on prod state buckets.\n\nSOC2 auditors ask who can read state—document IAM policies and break-glass procedure.',
        cmd: 'terraform {\n  backend "s3" {\n    bucket  = "acme-tfstate"\n    key     = "prod/terraform.tfstate"\n    region  = "us-east-1"\n    encrypt = true\n    kms_key_id = "arn:aws:kms:us-east-1:123:key/abc"\n  }\n}',
      },
      {
        q: 'What happens to state when you remove a resource block from configuration?',
        a: 'Terraform plans to destroy resources present in state but absent from config.\n• Plan shows: # aws_instance.old will be destroyed.\n• To keep cloud object but stop managing: terraform state rm (orphan) or removed block.\n• Accidental deletion from config is common outage cause—use prevent_destroy for critical resources.\n• VCS history can restore config; state unchanged until apply.\n• Code review must catch resource deletions in diffs.\n\nUse terraform plan in CI with deletion count alert threshold.',
        cmd: 'terraform plan | grep "will be destroyed"\n\n# Stop managing without destroy\nterraform state rm aws_s3_bucket.legacy',
      },
      {
        q: 'How do you recover from a corrupted or partially written state file?',
        a: 'State corruption blocks all Terraform operations until repaired.\n• Symptoms: JSON parse error, serial mismatch, missing resources in state vs reality.\n• Restore from S3 version history or terraform.tfstate.backup.\n• terraform state push uploads repaired JSON after manual edit (expert only).\n• Import missing resources if state lost but cloud objects exist.\n• TFC: contact support or revert to previous state version in UI.\n\nPost-recovery: full plan should show zero or expected minimal changes; run in staging first.',
        cmd: 'aws s3api list-object-versions \\\n  --bucket acme-tfstate \\\n  --prefix prod/app/terraform.tfstate\n\naws s3api get-object \\\n  --bucket acme-tfstate \\\n  --key prod/app/terraform.tfstate \\\n  --version-id <VERSION_ID> restored.tfstate',
      },
    ],
    hard: [
      {
        q: 'Design state partitioning strategy for a large organization (one state vs many).',
        a: 'State partitioning limits blast radius and parallelizes applies.\n• Separate state per environment minimum (dev/staging/prod).\n• Further split by lifecycle: network (rare changes) vs app (frequent) vs data (strict change control).\n• Avoid monolithic state >500 resources—plan time and lock contention grow.\n• Cross-stack wiring via remote state outputs or SSM—not merged state.\n• Document dependency DAG between stacks for apply ordering.\n\nRule of thumb: if teams deploy independently, states should be independent.',
        cmd: '# State keys layout\n# s3://acme-tfstate/network/prod/terraform.tfstate\n# s3://acme-tfstate/compute/prod/terraform.tfstate\n# s3://acme-tfstate/app/prod/terraform.tfstate',
      },
      {
        q: 'How would you execute a zero-downtime state migration from local to S3 backend?',
        a: 'Backend migration moves state storage without changing managed infrastructure.\n• Add backend block to terraform config.\n• terraform init -migrate-state copies local to remote with confirmation prompt.\n• Verify: terraform state list matches; plan shows no changes.\n• Delete local terraform.tfstate only after successful remote plan in CI.\n• Update CI to remove local artifact assumptions; configure AWS creds for state access.\n• Communicate lock table creation for DynamoDB before team applies.\n\nRollback: migrate-state back to local if issues—keep local backup until stable one week.',
        cmd: 'terraform init -migrate-state\n\nterraform plan  # must be empty\n\nrm terraform.tfstate terraform.tfstate.backup  # after CI verified',
      },
      {
        q: 'Explain state surgery anti-patterns and safer alternatives.',
        a: 'Manual JSON editing of state is last resort with high outage risk.\n• Anti-pattern: hand-edit IDs after wrong import.\n• Anti-pattern: delete resources from state to "fix" plan without understanding orphan.\n• Safer: terraform import, moved blocks, state mv, apply -replace.\n• Use terraform state pull | jq for read-only analysis.\n• Practice in staging copy of prod state in isolated workspace.\n• Require two-person review for any state push to prod.\n\nMaintain runbook with decision tree: drift → refresh-only; wrong address → moved; orphan → import or destroy.',
        cmd: 'terraform state pull > /tmp/state-inspect.json\n\n# Safer refactor\nmoved {\n  from = aws_instance.a\n  to   = module.compute.aws_instance.a\n}',
      },
      {
        q: 'Lead disaster recovery planning when primary state bucket is lost or ransomware encrypted.',
        a: 'State loss does not delete cloud resources but Terraform loses control map—DR is critical.\n• Prevention: cross-region replication, versioning, Object Lock, separate backup account.\n• Detection: state bucket access alerts, failed plan/apply in CI.\n• Recovery: restore version from backup; if total loss, reconstruct via terraform import bulk scripts.\n• former2/terraformer generate import candidates from live inventory.\n• Freeze manual infra changes during recovery; deny console writes via SCP.\n• RTO/RPO targets: state RPO should match version retention (minutes with versioning).\n\nTabletop exercise quarterly: restore state to scratch workspace and plan diff review.',
        cmd: 'aws s3 sync s3://acme-tfstate-replica/prod/ /tmp/recovered-state/\n\nterraform init -reconfigure -backend-config=backend-recovery.hcl\nterraform plan',
      },
    ],
  },

  'remote-state': {
    easy: [
      {
        q: 'What is a Terraform remote backend and why use one?',
        a: 'Remote backends store state in shared storage instead of local disk.\n• Enables team collaboration on same infrastructure.\n• Supports locking to prevent concurrent corruption.\n• Centralizes encryption, versioning, and access audit.\n• Common backends: S3, GCS, Azure Blob, Terraform Cloud, Consul.\n• terraform init configures backend; backend change requires init -reconfigure.\n\nLocal state is acceptable only for personal sandbox experiments.',
        cmd: 'terraform {\n  backend "s3" {\n    bucket = "my-tfstate"\n    key    = "dev/terraform.tfstate"\n    region = "us-east-1"\n  }\n}\n\nterraform init',
      },
      {
        q: 'Configure S3 backend with DynamoDB locking table.',
        a: 'S3 + DynamoDB is the standard AWS remote state pattern.\n• S3 bucket stores state object; enable versioning and encryption.\n• DynamoDB table with LockID hash key stores lock records.\n• IAM policy grants CI role s3:GetObject/PutObject and dynamodb:GetItem/PutItem/DeleteItem.\n• Table name referenced in dynamodb_table backend argument.\n• Create table once via separate bootstrap stack.\n\nBootstrap chicken-and-egg: create bucket/table manually or via CloudFormation once.',
        cmd: 'resource "aws_dynamodb_table" "terraform_locks" {\n  name         = "terraform-locks"\n  billing_mode = "PAY_PER_REQUEST"\n  hash_key     = "LockID"\n\n  attribute {\n    name = "LockID"\n    type = "S"\n  }\n}',
      },
      {
        q: 'How do you use partial backend configuration with -backend-config files?',
        a: 'Partial configuration separates secrets and env-specific values from committed code.\n• Backend block leaves attributes empty or uses placeholders.\n• backend.hcl or backend-prod.hcl supplies bucket, key, region at init.\n• CI runs: terraform init -backend-config=backend-prod.hcl.\n• Allows same code repo targeting different state buckets per environment.\n• -reconfigure switches backend without migrate prompt when intentional.\n\nNever commit backend.hcl with secrets—use CI variables for sensitive backend config if any.',
        cmd: '# backend.hcl\nbucket = "acme-tfstate-prod"\nkey    = "network/terraform.tfstate"\nregion = "us-east-1"\n\nterraform init -backend-config=backend.hcl',
      },
      {
        q: 'Explain terraform init -reconfigure vs -migrate-state.',
        a: 'Both handle backend changes with different state handling.\n• -migrate-state: copies existing state to new backend; prompts for confirmation.\n• -reconfigure: reinitializes backend ignoring previous backend; does NOT migrate—state appears empty until restored.\n• Use migrate when moving S3 bucket or key intentionally with same infrastructure.\n• Use reconfigure when cloning repo fresh or fixing broken backend config without old state.\n• Wrong choice can appear to lose resources—always backup state first.\n\nDocument init flags in team onboarding to prevent panic empty plans.',
        cmd: '# Migrate state to new backend\nterraform init -migrate-state\n\n# Point to different backend without migration\nterraform init -reconfigure -backend-config=backend.hcl',
      },
    ],
    medium: [
      {
        q: 'How do you secure remote state bucket access with IAM and bucket policies?',
        a: 'State bucket is crown jewels—defense in depth required.\n• Block public access on bucket; deny s3:PutObject without encryption header.\n• IAM: CI role limited to prefix per environment (prod/* vs dev/*).\n• Separate read-only role for auditors via state pull only.\n• Bucket policy denies non-TLS transport (aws:SecureTransport).\n• CloudTrail data events on state bucket for forensic audit.\n• Cross-account state read: bucket policy allowing specific downstream account roles.\n\nNever use root account credentials for state access.',
        cmd: 'data "aws_iam_policy_document" "state" {\n  statement {\n    sid       = "DenyInsecureTransport"\n    effect    = "Deny"\n    actions   = ["s3:*"]\n    resources = ["arn:aws:s3:::acme-tfstate/*"]\n    condition {\n      test     = "Bool"\n      variable = "aws:SecureTransport"\n      values   = ["false"]\n    }\n  }\n}',
      },
      {
        q: 'Compare S3, GCS, Azure Blob, and Terraform Cloud as remote backends.',
        a: 'Backend choice often follows cloud provider and collaboration needs.\n• S3 + DynamoDB: mature, flexible, requires self-managed IAM and locking table.\n• GCS: native locking in bucket, simpler than DynamoDB setup.\n• Azure Blob: azurerm backend with storage account; use blob leasing for locks.\n• Terraform Cloud: RBAC, run history, no bucket management; SaaS dependency.\n• Consul/etcd: legacy on-prem patterns.\n\nMulti-cloud platform teams sometimes standardize on TFC; single-cloud on native object storage.',
        cmd: '# GCS backend\nterraform {\n  backend "gcs" {\n    bucket = "acme-tfstate"\n    prefix = "prod/network"\n  }\n}\n\n# Azure backend\n# backend "azurerm" { resource_group_name = ... storage_account_name = ... }',
      },
      {
        q: 'How do cross-account remote state reads work in AWS landing zones?',
        a: 'Spoke accounts consume hub infrastructure IDs from centralized state bucket in network account.\n• Hub state bucket policy allows s3:GetObject to spoke terraform role ARNs.\n• Spoke CI role assumes role in spoke; reads hub state via terraform_remote_state.\n• KMS: spoke roles need kms:Decrypt on state bucket CMK.\n• Prefix per hub stack: network/hub/terraform.tfstate.\n• Avoid write access from spokes—read-only IAM.\n\nTest cross-account access with aws sts get-caller-identity and terraform init in spoke pipeline.',
        cmd: 'data "terraform_remote_state" "hub" {\n  backend = "s3"\n  config = {\n    bucket = "network-account-tfstate"\n    key    = "hub/terraform.tfstate"\n    region = "us-east-1"\n    role_arn = "arn:aws:iam::HUB:role/StateReadForSpokes"\n  }\n}',
      },
      {
        q: 'Troubleshoot "Error acquiring the state lock" in CI pipelines.',
        a: 'Lock errors block applies when another process holds lock or crashed mid-run.\n• Read lock info: Error message includes LockID and who holds it.\n• Verify no concurrent pipeline on same workspace/state key.\n• If crashed runner: confirm process dead, then terraform force-unlock LOCK_ID.\n• Stale locks from network timeout during apply— increase lock timeout if supported.\n• Prevention: pipeline concurrency limit = 1 per state key; cancel superseded runs.\n\nLog every force-unlock with operator identity; alert on repeated locks same hour.',
        cmd: 'terraform plan  # shows lock holder metadata\n\nterraform force-unlock fd3c619e-1111-2222-3333-444444444444\n\n# GitHub Actions concurrency\n# concurrency: group: tfstate-prod limit: 1',
      },
    ],
    hard: [
      {
        q: 'Design multi-region state replication and failover for regulated workloads.',
        a: 'Regulated industries require state availability matching RPO targets.\n• Primary state in region A with S3 versioning; CRR to region B bucket.\n• DynamoDB global table or manual lock table per region (locks not globally replicated—run primary region only).\n• Failover: update backend config to replica bucket; init -reconfigure; verify serial.\n• Document split-brain risk: never apply simultaneously in two regions same stack.\n• Object Lock WORM for tamper evidence on prod state objects.\n\nTest failover annually; measure time to restore plan capability from replica.',
        cmd: 'resource "aws_s3_bucket_replication_configuration" "state" {\n  bucket = aws_s3_bucket.tfstate.id\n  role   = aws_iam_role.replication.arn\n\n  rule {\n    id     = "replicate-state"\n    status = "Enabled"\n    destination { bucket = aws_s3_bucket.tfstate_dr.arn }\n  }\n}',
      },
      {
        q: 'How would you migrate remote state between AWS accounts during account restructuring?',
        a: 'Account migration requires state and backend IAM move without resource recreation.\n• Copy state object to new account bucket preserving version metadata.\n• Update backend config with new bucket/account KMS key.\n• terraform init -migrate-state or manual state push after init -reconfigure.\n• Update IAM roles in provider assume_role to target new account if resources moved.\n• If resources stay in old account temporarily: provider still assumes old account role—only state moves.\n• Full plan diff must be zero before cutover CI.\n\nCoordinate with cloud team on SCP updates allowing terraform roles in new org unit.',
        cmd: 'aws s3 cp \\\n  s3://old-account-tfstate/prod/app/terraform.tfstate \\\n  s3://new-account-tfstate/prod/app/terraform.tfstate\n\nterraform init -reconfigure -backend-config=backend-new-account.hcl\nterraform plan',
      },
      {
        q: 'Explain state locking internals and edge cases with partial applies and crashed agents.',
        a: 'Understanding lock mechanics prevents dangerous force-unlock habits.\n• Lock record includes operation (Apply/Plan), who, version, timestamp.\n• Apply holds lock entire duration—long applies block other runs (by design).\n• Crash mid-apply: lock remains; state may reflect partial resource writes.\n• force-unlock does not rollback cloud changes—only releases lock.\n• Post-crash: plan first; may need taint/replace incomplete resources.\n• TFC agent pools: agent disconnect can stale lock—use graceful cancellation.\n\nRunbook: never force-unlock without checking cloud console for in-progress resource operations.',
        cmd: 'terraform force-unlock <ID>  # only after verifying no active apply\n\nterraform plan\n\n# TFC: cancel run via API/UI before force-unlock',
      },
      {
        q: 'Evaluate self-hosted remote state vs Terraform Cloud for air-gapped classified environments.',
        a: 'Air-gap constraints eliminate public SaaS; self-hosted patterns required.\n• MinIO/S3-compatible on-prem for state; DynamoDB-compatible locking (Scylla, manual lock via postgres backend experiments).\n• Terraform Enterprise self-hosted in classified network with offline provider mirror.\n• OpenTofu alternative if license concerns; still need state store.\n• Compliance: state at rest encryption with HSM-backed keys; no outbound internet from apply runners.\n• Trade-off: operational burden of HA state store vs TFC convenience.\n\nDeliver IL5/IL6 compatible reference architecture with STIG-hardened runners and quarterly pen test scope including state bucket.',
        cmd: 'terraform {\n  backend "s3" {\n    bucket   = "tfstate"\n    key      = "classified/prod.tfstate"\n    region   = "us-gov-west-1"\n    endpoint = "https://minio.internal:9000"\n    skip_credentials_validation = true\n    skip_metadata_api_check     = true\n    force_path_style            = true\n  }\n}',
      },
    ],
  },

  modules: {
    easy: [
      {
        q: 'What is a Terraform module and how do you call one?',
        a: 'Modules are reusable containers of Terraform resources with defined inputs and outputs.\n• module "vpc" { source = "./modules/vpc"; cidr = var.vpc_cidr }.\n• source can be local path, Git URL, or registry address.\n• Child module has its own namespace; resources address as module.vpc.aws_subnet.main.\n• Modules enable DRY patterns and golden paths for platform teams.\n• Public registry: source = "terraform-aws-modules/vpc/aws".\n\nRoot module is the working directory where you run terraform apply.',
        cmd: 'module "vpc" {\n  source = "terraform-aws-modules/vpc/aws"\n  version = "5.1.0"\n\n  name = "my-vpc"\n  cidr = "10.0.0.0/16"\n  azs  = ["us-east-1a", "us-east-1b"]\n}',
      },
      {
        q: 'Explain module sources: local, Git, and Terraform Registry.',
        a: 'Source attribute determines where Terraform downloads module code.\n• Local: source = "../modules/vpc" — fast iteration, same repo.\n• Git: source = "git::https://github.com/acme/terraform-vpc.git?ref=v1.2.0" — version via ref.\n• Registry: source = "namespace/name/provider" with version constraint.\n• terraform init downloads modules to .terraform/modules.\n• Commit .terraform.lock.hcl; modules cached locally after init.\n\nPin Git refs and registry versions—main branch source is unstable for prod.',
        cmd: 'module "eks" {\n  source  = "terraform-aws-modules/eks/aws"\n  version = "~> 20.0"\n\n  cluster_name = var.cluster_name\n}\n\nterraform init',
      },
      {
        q: 'How do module inputs and outputs work?',
        a: 'Modules expose variables as inputs and output values to callers.\n• Parent passes: cidr_block = var.vpc_cidr maps to child variable "cidr_block".\n• Child outputs: output "vpc_id" { value = aws_vpc.this.id }.\n• Parent reads: module.vpc.vpc_id.\n• Undeclared variables in module call error at plan time (unless experimental pass-through).\n• Document inputs/outputs in README and terraform-docs.\n\nTreat undocumented outputs as private implementation details.',
        cmd: 'module "network" {\n  source   = "./modules/network"\n  vpc_cidr = "10.0.0.0/16"\n}\n\noutput "vpc_id" {\n  value = module.network.vpc_id\n}',
      },
      {
        q: 'What is the Terraform Registry and how do version constraints work on modules?',
        a: 'registry.terraform.io hosts verified modules with documentation and examples.\n• version = "5.1.0" exact pin; ~> 5.1 allows 5.x >= 5.1; >= 4.0, < 6.0 range.\n• terraform init selects latest matching constraint.\n• Module versions independent of provider versions—both pinned in lock file.\n• Private registry in TFC for internal modules with same syntax.\n• Review module README for breaking changes between major versions.\n\nPrefer well-maintained community modules (terraform-aws-modules) over copy-paste VPC code.',
        cmd: 'module "security_group" {\n  source  = "terraform-aws-modules/security-group/aws"\n  version = "~> 5.0"\n\n  name   = "web"\n  vpc_id = module.vpc.vpc_id\n}',
      },
    ],
    medium: [
      {
        q: 'How do you develop and test modules locally before publishing?',
        a: 'Module development uses examples/ directory as integration test root module.\n• Structure: modules/vpc/{main.tf, variables.tf, outputs.tf, README.md, examples/complete/}.\n• Run terraform plan/apply from examples/complete with test tfvars.\n• terratest (Go) automates apply/destroy and assertion for CI.\n• terraform fmt -check and validate in module directory.\n• Pre-release: tag Git v1.2.3; consumers pin ref=v1.2.3.\n\nSemantic versioning: breaking input changes = major bump.',
        cmd: 'cd modules/vpc/examples/complete\nterraform init\nterraform plan -var-file=test.tfvars\n\n# Tag release\ngit tag v1.2.3 && git push origin v1.2.3',
      },
      {
        q: 'Explain nested modules and when to flatten vs nest deeply.',
        a: 'Modules can call other modules forming a hierarchy.\n• Root → network module → subnet submodule pattern.\n• Deep nesting hides complexity but makes plan output harder to read.\n• Flatten when team needs visibility into resources created.\n• Nest when encapsulating stable abstractions (private subnet logic).\n• Avoid circular module calls—same as resource cycles.\n• Limit depth to 2–3 levels for maintainability.\n\nPlatform modules wrap registry modules with org-specific defaults (tags, CIDR ranges).',
        cmd: 'module "vpc" {\n  source = "./modules/vpc"\n\n  # internally calls module "subnets"\n  private_subnets = var.private_subnets\n}',
      },
      {
        q: 'How do you handle module versioning across 50 consuming repositories?',
        a: 'Central module registry with semver prevents chaotic copy-paste drift.\n• Publish internal modules to TFC private registry or Artifactory.\n• Renovate/Dependabot PRs bump module version constraints weekly.\n• Changelog with migration notes for major versions.\n• Support N-1 major version for 6 months.\n• Breaking change workshop before major release.\n• Metrics: adoption rate of latest minor per module.\n\nAvoid git source main branch—immutable version tags only for prod consumers.',
        cmd: 'module "landing_zone" {\n  source  = "app.terraform.io/acme/landing-zone/aws"\n  version = "~> 3.2"\n\n  account_id = var.account_id\n}',
      },
      {
        q: 'What are common module design mistakes?',
        a: 'Poor module APIs cause consumer frustration and unsafe workarounds.\n• Too many required variables without sensible defaults.\n• Leaking provider configuration inside module without configuration_aliases.\n• Using absolute resource addresses instead of outputs for composition.\n• Hardcoding environment names instead of parameterized tags.\n• Monolithic module doing VPC + EKS + RDS—split by lifecycle.\n• Missing validation on inputs causing apply-time API errors.\n\nReview modules as product APIs with consumers in design sessions.',
        cmd: '# Bad: hardcoded\n# vpc_cidr = "10.0.0.0/16"\n\n# Good\nvariable "vpc_cidr" {\n  type = string\n  validation {\n    condition     = can(cidrhost(var.vpc_cidr, 0))\n    error_message = "Must be valid CIDR."\n  }\n}',
      },
    ],
    hard: [
      {
        q: 'Design a composable module library for AWS landing zone (network, identity, guardrails).',
        a: 'Layered module library accelerates account vending with guardrails baked in.\n• L1 primitives: vpc, subnet, route — thin wrappers over registry modules.\n• L2 compositions: standard_az_network (3 AZ private/public/database subnets + NAT).\n• L3 landing_zone: wires IAM baseline, CloudTrail, Config, SCP-ready tags.\n• Each layer semver independently; L3 pins L2 versions explicitly.\n• Contract tests: kitchen-sink example deploys to sandbox account on release.\n• Document upgrade paths: v2→v3 subnet tagging change requires moved blocks.\n\nExpose escape hatch raw_map variables for advanced teams sparingly.',
        cmd: 'module "landing_zone" {\n  source  = "app.terraform.io/acme/landing-zone/aws"\n  version = "~> 2.0"\n\n  account = var.account\n  network = var.network\n  guardrails = {\n    enable_cloudtrail = true\n    enable_config     = true\n  }\n}',
      },
      {
        q: 'How would you refactor a popular internal module without breaking 40 downstream consumers?',
        a: 'Module API changes require deprecation discipline and tooling support.\n• Add new variable/output alongside deprecated; emit warning via check block or README.\n• Provide compatibility shim release (minor) translating old inputs to new internally.\n• Codemod scripts update consumer repos (sed/terraform fmt).\n• Major release removes deprecated; schedule coordinated upgrade window.\n• Integration test matrix against representative consumer configs.\n• Rollback tag preserved (v2.9.last) for emergency pin.\n\nCommunicate via internal changelog RSS and #platform-terraform Slack with timeline.',
        cmd: '# Deprecation pattern\nvariable "subnet_cidrs" {\n  type    = list(string)\n  default = null\n}\n\nvariable "subnets" {\n  type    = map(object({ cidr = string }))\n  default = null\n}\n\nlocals {\n  resolved_subnets = coalesce(var.subnets, { for i, c in var.subnet_cidrs : "subnet-${i}" => { cidr = c } })\n}',
      },
      {
        q: 'Explain module composition vs inheritance patterns in Terraform.',
        a: 'Terraform favors composition over inheritance—no class-style extension.\n• Composition: root calls vpc + eks modules; wires vpc_id into eks.\n• Inheritance simulation: base module merged via wrapper passing common tags/locals.\n• merge() and defaults in variable objects share config across modules.\n• Anti-pattern: fork-and-edit registry module—merge upstream updates painfully.\n• Prefer wrapper module adding org tags around registry module call.\n• Use terragrunt stack dependencies for composition at folder level.\n\nArchitecture reviews should favor small composable modules over mega-modules.',
        cmd: 'module "vpc" {\n  source = "terraform-aws-modules/vpc/aws"\n  tags   = merge(local.common_tags, var.extra_tags)\n}\n\nmodule "eks" {\n  source  = "terraform-aws-modules/eks/aws"\n  vpc_id  = module.vpc.vpc_id\n  subnet_ids = module.vpc.private_subnets\n}',
      },
      {
        q: 'Lead security review of third-party registry modules before enterprise adoption.',
        a: 'Third-party modules execute in your pipeline with provider credentials—supply chain risk.\n• Review module source on GitHub: check contributors, issue history, recent commits.\n• Pin exact version; verify checksum in lock file after init.\n• Static scan: checkov/trivy on module code in CI before allowlisting.\n• Run plan in sandbox account; inspect created IAM policies for * permissions.\n• Prefer verified modules; hashicorp partner badge is positive signal not guarantee.\n• Maintain internal fork only when necessary with documented delta from upstream.\n\nMaintain approved module list in policy-as-code; deny unapproved sources in Sentinel.',
        cmd: 'terraform init\n\n# Scan module code\ncheckov -d .terraform/modules/vpc\n\n# Inspect planned IAM\nterraform plan -json | jq \'.resource_changes[] | select(.type|test("aws_iam"))\'',
      },
    ],
  },

  workspaces: {
    easy: [
      {
        q: 'What are Terraform workspaces and what problem do they solve?',
        a: 'Workspaces maintain multiple state files within the same backend configuration.\n• Default workspace: default.\n• terraform workspace new staging creates isolated state with same backend key prefix.\n• Switch: terraform workspace select prod.\n• Same .tf code, different state—useful for dev/staging in one directory historically.\n• List: terraform workspace list.\n\nWorkspaces are NOT multi-tenancy isolation—use separate backends or TFC workspaces for prod isolation.',
        cmd: 'terraform workspace list\nterraform workspace new dev\nterraform workspace select dev\nterraform plan -var-file=dev.tfvars',
      },
      {
        q: 'How do workspace names affect remote state storage paths?',
        a: 'Backend stores state per workspace with naming convention.\n• S3 backend: key = env:/${workspace}/terraform.tfstate or workspace prefix in path.\n• Default workspace often omits prefix depending on backend config.\n• terraform.workspace interpolation references current workspace name in HCL.\n• TFC workspaces are separate entities—not the same as CLI workspaces on S3.\n• Explicit backend key per environment (separate directories) is clearer for prod at scale.\n\nDocument state key layout in runbook to avoid applying to wrong environment.',
        cmd: 'locals {\n  env = terraform.workspace\n}\n\nresource "aws_s3_bucket" "logs" {\n  bucket = "acme-${local.env}-logs"\n}',
      },
      {
        q: 'Explain terraform.workspace vs using a variable for environment name.',
        a: 'Both select environment config; teams differ on preference.\n• terraform.workspace: implicit from CLI workspace select; can surprise CI if wrong workspace selected.\n• var.environment: explicit in tfvars; clearer in code review.\n• Many enterprises prefer directory-per-env (env/prod/) over workspaces entirely.\n• Workspace advantage: less file duplication for truly identical configs.\n• Variable advantage: explicit, works without workspace commands, clearer in TFC mapping.\n\nPick one pattern org-wide—mixing causes double-environment bugs.',
        cmd: '# Explicit variable pattern (recommended at scale)\nvariable "environment" { type = string }\n\nresource "aws_instance" "web" {\n  tags = { Environment = var.environment }\n}',
      },
      {
        q: 'When should you NOT use Terraform workspaces for environment separation?',
        a: 'Workspaces share the same backend credentials and code—insufficient for prod isolation.\n• Different AWS accounts per environment → separate state backends and provider assume_role.\n• Different approval policies or change windows → separate TFC workspaces with RBAC.\n• Compliance requires hard isolation between prod and dev state.\n• Different provider versions or module versions per environment.\n• Workspaces appropriate for ephemeral developer sandboxes in shared dev account.\n\nProduction standard: env/prod/ and env/staging/ directories with distinct backend.hcl files.',
        cmd: '# Separate backends per environment\nterraform -chdir=environments/prod init -backend-config=prod.backend.hcl\nterraform -chdir=environments/staging init -backend-config=staging.backend.hcl',
      },
    ],
    medium: [
      {
        q: 'Compare CLI workspaces, directory-based environments, and Terraform Cloud workspaces.',
        a: 'Three patterns often confused—each maps state to environment differently.\n• CLI workspaces: multiple states, one code folder, one backend config.\n• Directory-based: environments/prod/, environments/staging/ with separate backends.\n• TFC workspaces: SaaS entity with variables, RBAC, run history—not CLI workspace.\n• TFC VCS-driven workflow triggers plan on PR per workspace.\n• Enterprise standard: TFC workspace per env/account OR directory-based with CI matrix.\n\nDocument mapping: TFC workspace prod-network ↔ Git path environments/prod/network.',
        cmd: '# TFC remote backend\nterraform {\n  backend "remote" {\n    organization = "acme"\n    workspaces { name = "app-prod" }\n  }\n}',
      },
      {
        q: 'How do you prevent applying the wrong workspace in CI/CD?',
        a: 'Wrong workspace incidents destroy dev resources or worse—apply prod config to wrong account.\n• CI sets TF_WORKSPACE or explicit terraform workspace select with validated name.\n• Fail if terraform.workspace != expected env from pipeline variable.\n• validation block: var.environment == terraform.workspace when using both.\n• Separate CI jobs per environment with protected secrets and branch rules.\n• Plan output header includes workspace and account ID from data.aws_caller_identity.\n\nProd pipelines require manual approval gate and run only from release branch.',
        cmd: 'check "workspace_matches_env" {\n  assert {\n    condition     = terraform.workspace == var.environment\n    error_message = "Workspace ${terraform.workspace} != var.environment ${var.environment}"\n  }\n}',
      },
      {
        q: 'How do you migrate from workspaces to directory-based environments?',
        a: 'Migration improves clarity for growing teams outgrowing workspace pattern.\n• Export state per workspace: select workspace, terraform state pull > prod.tfstate.\n• Create environments/prod/ with copied .tf files and backend key prod/terraform.tfstate.\n• Push state: terraform state push prod.tfstate in new directory after init.\n• Verify zero plan diff; update CI to use -chdir=environments/prod.\n• Decommission old workspace after parallel run period.\n\nCommunicate cutover date; freeze applies during state migration window.',
        cmd: 'terraform workspace select prod\nterraform state pull > /tmp/prod.tfstate\n\ncd environments/prod\nterraform init\nterraform state push /tmp/prod.tfstate\nterraform plan',
      },
      {
        q: 'Explain workspace-specific variable files and backend configuration patterns.',
        a: 'Combining workspaces with var-files requires disciplined naming conventions.\n• Pattern: tfvars named ${terraform.workspace}.tfvars loaded via script wrapper.\n• Terraform auto-loads terraform.tfvars only—not workspace-named files automatically.\n• Wrapper: terraform plan -var-file="${TF_WORKSPACE}.tfvars".\n• Backend config can use partial config per workspace in CI matrix.\n• Terragrunt generates backend and inputs from hierarchy eliminating manual select.\n\nAvoid duplicating entire .tf trees per workspace—only vars and backend should differ.',
        cmd: 'terraform workspace select prod\nterraform plan -var-file=prod.tfvars\n\n# terragrunt.hcl\n# inputs = read_terragrunt_config("prod.hcl")',
      },
    ],
    hard: [
      {
        q: 'Design workspace strategy for 200 developers with ephemeral preview environments.',
        a: 'Preview envs need fast create/destroy without polluting prod state namespace.\n• TFC speculative plans on PR; optional ephemeral workspace per PR via API automation.\n• Naming: app-pr-1234 with auto-destroy after merge via webhook.\n• Separate AWS account for previews with SCP limits (no prod data, instance type caps).\n• State prefix per PR in shared dev backend; cleanup job deletes state and runs destroy.\n• Cost attribution tags: pr_number, author, created_at.\n\nPrevent preview state collisions with unique backend key including PR ID—not shared default workspace.',
        cmd: '# CI creates workspace per PR\nterraform workspace new pr-${PR_NUMBER}\nterraform apply -var-file=preview.tfvars -auto-approve\n\n# Cleanup on merge\nterraform destroy -auto-approve\nterraform workspace delete pr-${PR_NUMBER}',
      },
      {
        q: 'How would you troubleshoot workspace state collision between two teams?',
        a: 'State collision occurs when teams share workspace name and backend key unintentionally.\n• Symptom: unexpected resources in plan; teammate\'s resources appear in state list.\n• Confirm: terraform state list shows foreign resources; compare backend key in init output.\n• Immediate: stop applies; split teams to distinct backend keys or TFC workspaces.\n• Recover: state mv resources to correct team state via import/export surgery or destroy foreign in wrong state carefully.\n• Prevention: namespace backend keys by team/project; IAM prefix restrictions.\n\nPost-incident: mandatory backend key review in module template and CI validation script.',
        cmd: 'terraform state list\n\n# Show backend config\nterraform init -backend=false 2>&1 | grep bucket\n\n# Move team to dedicated key\nterraform init -reconfigure -backend-config=team-alpha.backend.hcl',
      },
      {
        q: 'Integrate Terraform workspaces with Terragrunt for DRY multi-account deployments.',
        a: 'Terragrunt wraps Terraform providing DRY backend and provider config across accounts.\n• Directory tree: live/prod/us-east-1/vpc/terragrunt.hcl includes root.hcl.\n• root.hcl generates remote_state block and provider assume_role per account.hcl.\n• No CLI workspaces—each folder is isolated state automatically.\n• run-all plan applies dependency graph across modules.\n• Reduces copy-paste vs raw Terraform directories.\n\nTrade-off: Terragrunt adds abstraction layer—train teams on include hierarchy debugging.',
        cmd: '# terragrunt.hcl\ninclude "root" {\n  path = find_in_parent_folders("root.hcl")\n}\n\nterraform {\n  source = "git::https://github.com/acme/modules.git//vpc?ref=v1.0.0"\n}\n\ninputs = {\n  vpc_cidr = "10.1.0.0/16"\n}',
      },
      {
        q: 'Lead decision between monorepo workspaces vs polyrepo per service for Terraform at scale.',
        a: 'Org structure drives repo strategy with trade-offs in coupling and CI complexity.\n• Monorepo + directories: shared modules colocated, atomic refactors, heavy CI fan-out.\n• Polyrepo per domain: independent release cycles, module version pinning overhead.\n• Workspaces in monorepo rarely scale to prod—directories or TFC workspaces per stack.\n• Criteria: blast radius, team autonomy, module change frequency, compliance audit scope.\n• Hybrid: monorepo platform modules + polyrepo app stacks consuming registry.\n\nPresent ADR with developer survey data on plan wait times and deployment frequency per model.',
        cmd: '# Monorepo CI matrix\n# terraform -chdir=environments/${{ matrix.env }}/${{ matrix.stack }} plan\n\n# Polyrepo\n# module source = "app.terraform.io/acme/vpc/aws" version = "~> 2.1"',
      },
    ],
  },

  provisioners: {
    easy: [
      {
        q: 'What are Terraform provisioners and when are they used?',
        a: 'Provisioners run scripts on resource creation, update, or destruction to perform actions providers cannot.\n• Types: local-exec (runs on machine running Terraform), remote-exec, file, shell.\n• Attached inside resource or terraform_data/null_resource blocks.\n• Run only during apply, not plan.\n• Last resort when no provider resource exists for bootstrap step.\n• HashiCorp recommends avoiding provisioners when possible—use cloud-init, Ansible, or CI steps instead.\n\nProvisioners are imperative glue in declarative workflow—minimize usage.',
        cmd: 'resource "aws_instance" "web" {\n  ami           = var.ami\n  instance_type = "t3.micro"\n\n  provisioner "local-exec" {\n    command = "echo ${self.private_ip} >> deploy.log"\n  }\n}',
      },
      {
        q: 'Explain local-exec vs remote-exec provisioners.',
        a: 'Execution location differs between provisioner types.\n• local-exec: command runs on Terraform operator machine or CI runner—use for curl hooks, local scripts.\n• remote-exec: SSH/RDP into created resource to run commands—requires connection block with host, user, key.\n• remote-exec needs network path from runner to instance (security groups, bastion).\n• local-exec has access to Terraform variables and self attributes.\n• Both fail apply if command returns non-zero exit code unless on_failure = continue.\n\nCI local-exec must not assume developer laptop paths—use relative scripts in repo.',
        cmd: 'resource "aws_instance" "app" {\n  # ...\n\n  connection {\n    type        = "ssh"\n    host        = self.public_ip\n    user        = "ubuntu"\n    private_key = file("~/.ssh/id_rsa")\n  }\n\n  provisioner "remote-exec" {\n    inline = ["sudo apt-get update", "sudo apt-get install -y nginx"]\n  }\n}',
      },
      {
        q: 'What are provisioner triggers and why are they important?',
        a: 'Provisioners only run on create by default for most resources—triggers force re-run.\n• null_resource/terraform_data triggers map: changes force replace and re-run provisioners.\n• Example: triggers = { cluster_version = var.cluster_version } reruns bootstrap on upgrade.\n• Without triggers, changing script content does not re-execute provisioner.\n• replace_triggered_by on resources (TF 1.2+) offers alternative replacement semantics.\n• Over-triggering causes unnecessary destructive reprovisioning.\n\nDocument which attribute changes intentionally rerun bootstrap scripts.',
        cmd: 'resource "terraform_data" "bootstrap" {\n  input = var.cluster_version\n\n  provisioner "local-exec" {\n    when    = create\n    command = "./bootstrap.sh ${var.cluster_name}"\n  }\n}',
      },
      {
        q: 'Why does HashiCorp recommend minimizing provisioner usage?',
        a: 'Provisioners introduce imperative failure modes into declarative IaC.\n• Not part of plan diff—failures happen mid-apply after resources partially created.\n• Not rerunnable independently—must taint resource to retry script.\n• CI runner environment differences cause "works locally" failures.\n• No idempotency guarantee unless script author implements it.\n• Better alternatives: user_data/cloud-init for EC2, custom images (Packer), Kubernetes operators, post-apply CI jobs.\n\nInterview answer: reach for provisioner only after ruling out provider and cloud-native bootstrap options.',
        cmd: '# Preferred: cloud-init in launch template\nresource "aws_instance" "web" {\n  user_data = templatefile("cloud-init.yaml", { app_version = var.version })\n}',
      },
    ],
    medium: [
      {
        q: 'How do you configure connection blocks for remote-exec through a bastion host?',
        a: 'Private instances require bastion jump configuration in connection block.\n• Nested connection: bastion_host, bastion_user, bastion_private_key on primary connection.\n• Security group must allow SSH from bastion to private instance.\n• Alternative: AWS Systems Manager Session Manager plugin avoids SSH keys (use external provider or local-exec with aws ssm start-session).\n• Test connectivity manually before embedding in provisioner.\n• Timeouts: increase for slow boot—provisioner may run before cloud-init completes without depends_on time_sleep.\n\nPrefer SSM over SSH bastions for auditability and no open port 22.',
        cmd: 'connection {\n  type        = "ssh"\n  host        = self.private_ip\n  user        = "ec2-user"\n  private_key = file(var.key_path)\n\n  bastion_host        = aws_instance.bastion.public_ip\n  bastion_user        = "ec2-user"\n  bastion_private_key = file(var.key_path)\n}',
      },
      {
        q: 'Handle provisioner failures and partial apply recovery.',
        a: 'Provisioner failure marks resource tainted or leaves inconsistent state.\n• Apply stops; cloud resource may exist but bootstrap incomplete.\n• Fix script; taint resource or terraform apply -replace to rerun provisioners.\n• on_failure = fail (default) vs continue—continue risks silent incomplete setup.\n• when = create vs destroy runs provisioner on specific lifecycle event.\n• destroy-time provisioners for cleanup hooks—dangerous if destroy provisioner fails.\n\nRunbook: never leave failed instance serving traffic—health check should fail until reprovision succeeds.',
        cmd: 'terraform apply -replace=terraform_data.bootstrap\n\n# Or taint\nterraform taint terraform_data.bootstrap\nterraform apply',
      },
      {
        q: 'Compare provisioners vs user_data vs configuration management (Ansible) post-apply.',
        a: 'Each bootstrap pattern fits different operational models.\n• user_data/cloud-init: runs on first boot, no Terraform runner dependency, idempotent modules recommended.\n• Provisioner: ties bootstrap to apply moment; couples infra and config in one pipeline.\n• Ansible/Chef post-apply: separate CM pipeline triggered after Terraform output—clean separation, better idempotency testing.\n• Golden AMI (Packer): zero boot-time config; fastest instance launch.\n• Kubernetes: Helm/manifests applied after cluster resource created—never remote-exec into nodes for app deploy.\n\nEnterprise pattern: Terraform creates VPC/EKS; ArgoCD deploys apps.',
        cmd: '# Packer + Terraform pattern\nresource "aws_launch_template" "app" {\n  image_id = var.golden_ami_id  # from Packer pipeline\n  # no provisioners needed\n}',
      },
      {
        q: 'Use when = destroy provisioners safely for cleanup tasks.',
        a: 'Destroy-time provisioners run before resource deletion—useful for deregistering external systems.\n• Example: remove node from external load balancer pool before instance destroy.\n• Risks: destroy fails if cleanup script fails—blocks resource deletion.\n• on_failure = continue may leave orphan registrations.\n• Provider may delete resource before destroy provisioner completes—ordering matters.\n• Prefer external controller or lifecycle hooks (Lambda on ASG terminate) for critical cleanup.\n\nTest destroy path in staging—provisioners often only tested on create.',
        cmd: 'resource "terraform_data" "register" {\n  provisioner "local-exec" {\n    when    = destroy\n    command = "./deregister.sh ${self.input}"\n  }\n\n  input = var.node_id\n}',
      },
    ],
    hard: [
      {
        q: 'Design bootstrap architecture for EKS nodes without provisioners.',
        a: 'EKS worker bootstrap should be declarative and provider-native.\n• Managed node groups or Karpenter with launch templates referencing user_data for kubelet/bootstrap.\n• EKS add-ons via aws_eks_addon resource—not shell scripts.\n• Cluster auth: aws eks update-kubeconfig in CI after cluster apply; kubernetes provider with exec auth.\n• Helm releases via helm_release resource for cluster components (CNI, metrics-server).\n• Avoid remote-exec to nodes—breaks with private nodes and violates immutable infrastructure.\n\nImmutable nodes: new launch template version rolls ASG rather than SSH patching.',
        cmd: 'resource "aws_eks_node_group" "main" {\n  cluster_name    = aws_eks_cluster.main.name\n  node_group_name = "workers"\n  node_role_arn   = aws_iam_role.node.arn\n  subnet_ids      = module.vpc.private_subnets\n\n  launch_template {\n    id      = aws_launch_template.eks.id\n    version = aws_launch_template.eks.latest_version\n  }\n}',
      },
      {
        q: 'Lead incident review: provisioner timeout on boot caused failed production deploy.',
        a: 'Classic provisioner incident: instance created but remote-exec timed out waiting for SSH.\n• Timeline: apply started, instance running, SSH unavailable (SG, key, cloud-init not finished), provisioner failed, pipeline red.\n• Root cause: no time_sleep between instance and provisioner; overly aggressive timeout; wrong SSH user for AMI.\n• Impact: partial cluster, manual cleanup, delayed release.\n• Fixes: remove remote-exec; move to user_data; add time_sleep hashicorp/time provider if temporary; health check gate in CI.\n• Prevention: ban remote-exec in Sentinel policy for prod workspaces.\n\nBlameless: provisioners are fragile—policy block is systemic fix.',
        cmd: 'resource "time_sleep" "wait_for_cloud_init" {\n  depends_on      = [aws_instance.app]\n  create_duration = "120s"\n}\n\n# Better: eliminate provisioner entirely',
      },
      {
        q: 'Explain provisioner security risks and hardening in CI pipelines.',
        a: 'Provisioners execute arbitrary shell with Terraform runner credentials—high risk surface.\n• local-exec inherits CI IAM role and network access—malicious script exfiltrates state.\n• remote-exec private keys in CI secrets—rotation and scope critical.\n• Command injection if interpolating unsanitized variables into scripts—use templatefile with escaping.\n• Pin script checksums; code review scripts same as .tf files.\n• Deny provisioners in prod via Sentinel unless approved module path.\n\nPrefer OIDC-scoped short-lived creds and separate bootstrap role with minimal permissions.',
        cmd: 'provisioner "local-exec" {\n  command = ["${path.module}/scripts/bootstrap.sh", var.cluster_name]\n  environment = {\n    AWS_REGION = var.region\n  }\n}',
      },
      {
        q: 'Migrate legacy provisioner-based workflow to cloud-native bootstrap without downtime.',
        a: 'Migration phases reduce risk for running production workloads.\n• Phase 1: dual-write—provisioner still runs but cloud-init also configured; validate parity.\n• Phase 2: new instances use golden AMI + user_data only; old instances drained.\n• Phase 3: remove provisioner blocks; replace terraform_data with no-op removed.\n• Rolling ASG instance refresh replaces nodes without single cutover.\n• Plan must show zero in-place changes to running instances until refresh triggered.\n\nCommunicate to app teams: connection draining during node replacement window.',
        cmd: 'resource "aws_autoscaling_group" "app" {\n  instance_refresh {\n    strategy = "Rolling"\n    preferences {\n      min_healthy_percentage = 90\n    }\n  }\n\n  launch_template {\n    id      = aws_launch_template.app_v2.id\n    version = "$Latest"\n  }\n}',
      },
    ],
  },

  'terraform-cloud': {
    easy: [
      {
        q: 'What is Terraform Cloud (TFC) and how does it differ from CLI-only Terraform?',
        a: 'Terraform Cloud is HashiCorp\'s SaaS platform for collaborative Terraform runs.\n• Remote execution: plans and applies run on TFC agents, not local laptops.\n• Remote state, locking, and run history included.\n• VCS integration triggers plans on pull requests.\n• Private module registry and team RBAC.\n• Free tier for small teams; paid tiers for SSO, Sentinel, audit logs.\n\nTerraform Enterprise is self-hosted equivalent for air-gapped or compliance needs.',
        cmd: 'terraform login\n\nterraform {\n  backend "remote" {\n    organization = "acme-corp"\n    workspaces { name = "app-prod" }\n  }\n}\n\nterraform init',
      },
      {
        q: 'Explain VCS-driven workflow in Terraform Cloud.',
        a: 'VCS workflow connects GitHub/GitLab/Bitbucket to TFC workspaces.\n• Push to feature branch → speculative plan on PR (optional).\n• Merge to main → plan + manual/auto apply per workspace settings.\n• TFC clones repo at commit SHA—reproducible runs.\n• Working directory setting targets monorepo subdirectory.\n• Trigger patterns filter which paths trigger runs.\n\nDevelopers stop running terraform apply locally for connected workspaces—CI governance enforced.',
        cmd: '# Configure in TFC UI:\n# Settings → Version Control → Connect to GitHub\n# Working Directory: environments/prod\n# Automatic speculative plans: enabled',
      },
      {
        q: 'What are Terraform Cloud workspace variables and variable sets?',
        a: 'TFC stores input variables and environment variables per workspace or shared sets.\n• Terraform category variables map to HCL variables; HCL flag for maps/lists.\n• Environment variables: AWS_ACCESS_KEY_ID or TF_VAR_* injection.\n• Sensitive variables encrypted; not shown after save.\n• Variable sets attach to multiple workspaces (e.g., org-wide AWS region).\n• Workspace variables override variable set on key collision when marked overwrite.\n\nReplace long-lived AWS keys with dynamic provider credentials (TFC AWS provider).',
        cmd: '# Set via CLI/API\ncurl -H "Authorization: Bearer $TF_TOKEN" \\\n  https://app.terraform.io/api/v2/workspaces/ws-xxx/vars \\\n  -d \'{"data":{"type":"vars","attributes":{"key":"environment","value":"prod","category":"terraform"}}}\'',
      },
      {
        q: 'How do you trigger a manual run in Terraform Cloud?',
        a: 'Runs can be VCS-triggered or manually started.\n• UI: New run → plan and apply (or plan only).\n• CLI: terraform plan/apply after remote backend configured pushes run to TFC.\n• API: POST /runs with workspace relationship.\n• Run types: plan-only (no apply button), fresh plan+apply, destroy plan.\n• Queue: one run at a time per workspace by default.\n\nUse plan-only runs to validate module upgrades without apply permission.',
        cmd: 'terraform plan  # executes remotely when using remote backend\n\n# API trigger\ncurl -X POST -H "Authorization: Bearer $TF_TOKEN" \\\n  -H "Content-Type: application/vnd.api+json" \\\n  https://app.terraform.io/api/v2/runs \\\n  -d @run.json',
      },
    ],
    medium: [
      {
        q: 'Configure run triggers between dependent Terraform Cloud workspaces.',
        a: 'Run triggers auto-queue downstream plan when upstream workspace completes apply.\n• Workspace A (network) triggers Workspace B (app) on successful apply.\n• Prevents app deploying on stale VPC outputs.\n• Configure in Settings → Run Triggers → attach source workspaces.\n• Downstream still requires apply approval if configured.\n• Alternative: tfe_outputs data source polling—not real-time.\n\nMap dependency DAG in documentation; avoid circular triggers.',
        cmd: '# Configure via TFE provider\nresource "tfe_run_trigger" "app_after_network" {\n  workspace_id  = tfe_workspace.app.id\n  sourceable_id = tfe_workspace.network.id\n}',
      },
      {
        q: 'Explain Sentinel policy-as-code in Terraform Cloud.',
        a: 'Sentinel policies enforce compliance rules before apply confirmation.\n• Soft-mandatory: override with permission; hard-mandatory: no override.\n• Policies inspect plan JSON: require tags, deny public resources, limit instance types.\n• Policy sets attached to workspace groups.\n• Test policies with sentinel test framework locally.\n• Alternative: OPA via run tasks (post-plan external HTTP check).\n\nExample policy: deny S3 buckets without encryption flag in plan.',
        cmd: '# sentinel.hcl example\nimport "tfplan/v2" as tfplan\n\nmain = rule {\n  all tfplan.resource_changes as _, rc {\n    rc.type is not "aws_s3_bucket" or\n    rc.change.after.server_side_encryption_configuration is not null\n  }\n}',
      },
      {
        q: 'How do Terraform Cloud agents work for private network access?',
        a: 'TFC agents run plans/applies inside your network for private endpoints.\n• Required when targeting private APIs, on-prem vCenter, databases without public access.\n• Agent pools registered to organization; workspaces assigned to pool.\n• Agents outbound-only connection to TFC—no inbound firewall rules.\n• Scale agent VMs based on concurrent run queue depth.\n• Agent updates: pin agent version; test before org-wide rollout.\n\nMonitor agent health; queued runs forever often means no healthy agents in pool.',
        cmd: '# Install agent on VM\n./tfc-agent install\n./tfc-agent start\n\n# Assign workspace to agent pool in TFC UI',
      },
      {
        q: 'Compare remote execution vs local execution mode in Terraform Cloud.',
        a: 'Execution mode determines where terraform binary runs.\n• Remote (default): TFC/agents execute; state stays in TFC.\n• Local: CLI triggers run but execution on developer machine—legacy migration path.\n• Agent: hybrid—your infrastructure, TFC orchestration.\n• Remote enforces consistent Terraform version and provider cache.\n• Local mode bypasses some governance—disable for prod workspaces.\n\nSet execution mode in workspace General Settings; enforce via TFE provider terraform_version.',
        cmd: 'resource "tfe_workspace" "prod" {\n  name              = "app-prod"\n  organization      = var.org\n  execution_mode    = "agent"\n  agent_pool_id     = tfe_agent_pool.private.id\n  terraform_version = "1.7.5"\n}',
      },
    ],
    hard: [
      {
        q: 'Design enterprise Terraform Cloud organization structure for 500 workspaces.',
        a: 'Scale requires project boundaries, RBAC, and automation—not flat workspace list.\n• Projects group workspaces by business unit (payments, platform, data).\n• Teams: read plan on all, apply limited to platform-ops on prod projects.\n• Variable sets: org-wide tags, BU-specific AWS roles, env-specific CIDR maps.\n• No-code modules (optional) for self-service with guardrails.\n• Audit: SIEM ingestion of audit trail API; quarterly access review.\n• Workspace naming: {bu}-{env}-{stack} standard.\n\nAutomate workspace creation via TFE provider + ServiceNow webhook on new account vending.',
        cmd: 'resource "tfe_project" "payments" {\n  name         = "payments"\n  organization = var.org\n}\n\nresource "tfe_workspace" "payments_prod" {\n  name         = "payments-prod-app"\n  organization = var.org\n  project_id   = tfe_project.payments.id\n}',
      },
      {
        q: 'Troubleshoot Terraform Cloud runs queued forever.',
        a: 'Queued runs indicate capacity or configuration blockage—not always TFC outage.\n• Check run queue: prior run awaiting approval blocks subsequent.\n• Agent pool: zero healthy agents → runs wait indefinitely.\n• Concurrency limits on tier—too many parallel org runs.\n• Stuck run: cancel via UI/API; verify state lock released.\n• VCS webhook failure: runs never queued—check webhook delivery in GitHub.\n\nRunbook: status.terraform.io for incidents; internal checks first.',
        cmd: '# List runs\ncurl -H "Authorization: Bearer $TF_TOKEN" \\\n  "https://app.terraform.io/api/v2/workspaces/ws-xxx/runs?filter%5Bstatus%5D=pending"\n\n# Cancel stuck run\ncurl -X POST -H "Authorization: Bearer $TF_TOKEN" \\\n  https://app.terraform.io/api/v2/runs/run-xxx/actions/cancel',
      },
      {
        q: 'Implement drift detection and continuous planning with Terraform Cloud.',
        a: 'Drift detection schedules refresh-only plans comparing state to reality.\n• Enable drift detection in workspace settings (Business tier feature).\n• Alerts on detected drift to Slack/PagerDuty via run tasks or webhook.\n• Remediation: apply to revert or update code to match intentional change.\n• Complement with scheduled plan-only runs via API cron if tier lacks native drift.\n• Pair with AWS Config for resources outside Terraform.\n\nMetric: mean time to drift remediation; target <24h for prod networking.',
        cmd: '# Scheduled plan via GitHub Actions cron\nterraform plan -refresh-only -detailed-exitcode\n\n# TFC drift detection configured in UI\n# Settings → Health → Drift Detection',
      },
      {
        q: 'Evaluate Terraform Cloud vs self-hosted Atlantis vs Spacelift for platform standardization.',
        a: 'Platform teams compare orchestration tools on governance, cost, and DX.\n• TFC: lowest ops burden, HashiCorp integration, SaaS compliance docs.\n• Atlantis: open source, PR-driven apply on self-hosted runner, no Sentinel unless added.\n• Spacelift: SaaS alternative with strong policy and stack dependencies.\n• Criteria: SSO/SAML, policy engine, private VCS, multi-tenant, cost at 500 workspaces, agent model.\n• Migration cost from existing Atlantis workflows significant—assess webhook and lock file patterns.\n\nPoC scorecard: plan latency, developer onboarding time, policy violation catch rate, monthly cost projection.',
        cmd: '# Atlantis repo structure\n# atlantis.yaml\nversion: 3\nprojects:\n  - dir: environments/prod\n    autoplan:\n      when_modified: ["*.tf", "*.tfvars"]\n    workflow: custom',
      },
    ],
  },

  security: {
    easy: [
      {
        q: 'What are Terraform security best practices for credentials?',
        a: 'Credential hygiene prevents account compromise via leaked state or logs.\n• Never commit secrets to Git—use env vars, Vault, AWS Secrets Manager.\n• Mark sensitive variables and outputs; restrict state backend access.\n• CI uses OIDC federation—not static AWS access keys.\n• Short-lived tokens scoped to minimum IAM permissions.\n• Rotate credentials if state bucket accessed by unauthorized principal.\n\nScan repos with gitleaks/trufflehog on every push.',
        cmd: 'provider "aws" {\n  # No access_key in HCL\n  region = var.region\n}\n\n# CI: OIDC to assume role\n# AWS_ROLE_ARN + AWS_WEB_IDENTITY_TOKEN_FILE',
      },
      {
        q: 'Explain static analysis tools for Terraform: tfsec, checkov, and trivy.',
        a: 'IaC scanning catches misconfigurations before apply.\n• tfsec/checkov/trivy scan .tf files for public S3, open SG rules, unencrypted disks.\n• Run in CI on every PR; fail build on HIGH severity.\n• False positives: suppress with documented skip comments after review.\n• Complement runtime CSPM (AWS Security Hub) for drift outside Terraform.\n• Custom policies for org standards (required tags, approved regions).\n\nScan modules in .terraform/modules after init for third-party risk.',
        cmd: 'checkov -d . --framework terraform\n\ntfsec .\n\ntrivy config --severity HIGH,CRITICAL .',
      },
      {
        q: 'Why is Terraform state a sensitive asset?',
        a: 'State files contain full resource attributes including secrets in cleartext.\n• Database passwords, private keys, API tokens often appear in state JSON.\n• sensitive flag redacts CLI output but values still in state.\n• Compromised state bucket equals infrastructure blueprint plus credentials.\n• Encrypt at rest, restrict IAM, enable versioning and access logging.\n• Consider external secret storage with data sources instead of storing secrets in resources.\n\nAudit who has s3:GetObject on state bucket quarterly.',
        cmd: 'terraform state pull | jq \'.resources[].instances[].attributes | keys\'\n\n# Use AWS Secrets Manager\ndata "aws_secretsmanager_secret_version" "db" {\n  secret_id = var.db_secret_arn\n}',
      },
      {
        q: 'How do you prevent secrets from appearing in plan output and CI logs?',
        a: 'Plan logs often leak secrets if not marked sensitive.\n• sensitive = true on variables passed to resources.\n• Avoid echoing terraform output in public CI logs for prod.\n• Use -compact-warnings; redact tools for PR comment bots.\n• Random_password resource output marked sensitive automatically when referenced correctly.\n• TFC hides sensitive values in UI for marked variables.\n\nNever pass secrets via -var on command line—visible in process list and shell history.',
        cmd: 'variable "db_password" {\n  type      = string\n  sensitive = true\n}\n\nresource "random_password" "db" {\n  length = 32\n}\n\noutput "db_password" {\n  value     = random_password.db.result\n  sensitive = true\n}',
      },
    ],
    medium: [
      {
        q: 'Implement least-privilege IAM for Terraform CI roles.',
        a: 'Terraform CI roles often start overprivileged and never get tightened.\n• Split roles: plan role (read-only + iam:GetRole simulation) vs apply role (write scoped).\n• Permission boundaries on roles Terraform creates prevent privilege escalation.\n• Deny iam:CreateUser, organizations:* unless platform module.\n• Resource-level constraints: arn:aws:s3:::acme-${env}-* patterns.\n• CloudTrail alert on AssumeRole to apply role outside CI hours.\n\nUse IAM Access Analyzer policy generation from CloudTrail as baseline refinement.',
        cmd: 'data "aws_iam_policy_document" "terraform_apply" {\n  statement {\n    actions   = ["ec2:*", "s3:*"]\n    resources = ["arn:aws:ec2:us-east-1:123:instance/*"]\n    condition {\n      test     = "StringEquals"\n      variable = "aws:RequestedRegion"\n      values   = ["us-east-1"]\n    }\n  }\n}',
      },
      {
        q: 'How does policy-as-code (Sentinel/OPA) enforce security in Terraform pipelines?',
        a: 'Policy-as-code evaluates plan output before apply authorization.\n• Deny: 0.0.0.0/0 on port 22, unencrypted RDS, missing mandatory tags.\n• Require: encryption, VPC-only endpoints, approved instance families.\n• Soft vs hard mandatory enforcement tiers.\n• OPA/Rego via TFC run tasks or Conftest locally in CI.\n• Version policy sets; test with example good/bad plans.\n\nPolicies should fail with actionable messages citing resource address.',
        cmd: '# conftest test\nconftest test plan.json -p policies/\n\n# OPA rego deny rule\n# deny[msg] { input.resource_changes[_].change.after.publicly_accessible == true }',
      },
      {
        q: 'Explain supply chain security for Terraform providers and modules.',
        a: 'Compromised provider or module executes with your cloud credentials.\n• Commit .terraform.lock.hcl; verify provider checksums on init.\n• Pin module versions to immutable Git tags or registry semver.\n• Internal mirror for providers in air-gap; scan mirror artifacts.\n• Dependabot/Renovate PRs for module/provider updates with plan diff review.\n• Sigstore/cosign adoption emerging for provider signing—monitor HashiCorp announcements.\n\nDeny init from unapproved registry namespaces via corporate terraformrc mirror config.',
        cmd: 'terraform init\n\ncat .terraform.lock.hcl\n\n# Provider mirror in ~/.terraformrc\nprovider_installation {\n  filesystem_mirror {\n    path    = "/opt/terraform/providers"\n    include = ["registry.terraform.io/hashicorp/*"]\n  }\n}',
      },
      {
        q: 'Secure remote state bucket against unauthorized access and tampering.',
        a: 'State tampering could inject malicious resource definitions or steal secrets.\n• Block public access; bucket policy deny insecure transport.\n• MFA delete and Object Lock for prod state objects.\n• Separate KMS CMK; key policy limits decrypt to CI roles only.\n• CloudTrail data events alert on DeleteObject and PutObject from unexpected principals.\n• Cross-account read via explicit bucket policy—not public ACLs.\n\nImmutable state history helps forensic reconstruction after security incident.',
        cmd: 'resource "aws_s3_bucket_public_access_block" "state" {\n  bucket                  = aws_s3_bucket.tfstate.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}',
      },
    ],
    hard: [
      {
        q: 'Design zero-trust Terraform pipeline with OIDC, short-lived creds, and split plan/apply roles.',
        a: 'Zero-trust IaC pipeline eliminates standing privileges and enforces verification gates.\n• GitHub OIDC → AWS IAM role trust policy limited to repo + branch ref.\n• Plan job assumes read-only role; posts plan artifact.\n• Apply job requires manual approval + assumes write role with tighter resource scope.\n• Sigstore attestation of plan artifact hash before apply (advanced).\n• Secrets from Vault dynamic DB credentials at apply time—not in state when possible.\n• Audit trail: CloudTrail + TFC run logs + Git commit SHA linkage.\n\nThreat model: compromised developer laptop cannot apply prod without CI approval chain.',
        cmd: '# GitHub Actions OIDC\n- uses: aws-actions/configure-aws-credentials@v4\n  with:\n    role-to-assume: arn:aws:iam::123:role/TerraformPlan\n    aws-region: us-east-1\n\n# Separate apply job with environment protection',
      },
      {
        q: 'Respond to sensitive Terraform output leaked in public CI logs.',
        a: 'Secret exposure in logs is credential incident requiring immediate rotation.\n• Revoke/rotate exposed credentials within minutes (DB password, API keys).\n• Purge CI log history if platform supports (GitHub may retain—assume compromised).\n• Fix: mark output sensitive; stop echoing terraform output in PR comments.\n• Scan logs with secret scanners; add pre-commit gitleaks.\n• Root cause: missing sensitive flag or debug step printing TF_LOG=DEBUG with secrets.\n\nPost-incident: inventory all outputs and variables for sensitivity classification.',
        cmd: '# Immediate rotation\naws secretsmanager rotate-secret --secret-id prod/db\n\n# Fix output\noutput "token" {\n  value     = aws_iam_access_key.bot.secret\n  sensitive = true\n}',
      },
      {
        q: 'Implement encryption and access control for secrets referenced by Terraform without storing in state.',
        a: 'Minimize secret footprint in state using data sources and external systems.\n• Data source reads secret at apply time; lifecycle may still persist in state—use ephemeral resources (TF 1.10+) where supported.\n• AWS Secrets Manager + IAM auth; rotate secrets outside Terraform.\n• Kubernetes secrets managed in-cluster post-provision, not terraform kubernetes_secret with plaintext.\n• Vault dynamic secrets with short TTL.\n• terraform state rm sensitive resource after bootstrap if one-time secret (edge case).\n\nEvaluate ephemeral write-only resources for bootstrap tokens that should not persist.',
        cmd: 'ephemeral "aws_secretsmanager_secret_version" "db" {\n  secret_id = aws_secretsmanager_secret.db.id\n}\n\nresource "aws_db_instance" "main" {\n  password = ephemeral.aws_secretsmanager_secret_version.db.secret_string\n}',
      },
      {
        q: 'Lead security assessment of Terraform managing IAM policies at enterprise scale.',
        a: 'Terraform-managed IAM is powerful—misconfiguration creates org-wide privilege escalation.\n• Review modules creating iam:* policies; deny PassRole to unrestricted principals.\n• Permission boundaries on all roles Terraform creates.\n• Separate IAM state workspace with stricter approval than app stacks.\n• IAM Access Analyzer continuous monitoring for external access.\n• Policy size limits (6144 chars) may cause failed applies—use policy documents split across attachments.\n\nInclude threat scenarios: malicious PR adding AdministratorAccess, typosquat module with backdoor policy.',
        cmd: 'resource "aws_iam_role" "app" {\n  permissions_boundary = aws_iam_policy.boundary.arn\n}\n\n# Sentinel deny\n# main = rule { not (tfplan.resource_changes contains admin policy) }',
      },
    ],
  },

  'multi-environment-deployments': {
    easy: [
      {
        q: 'What are common patterns for deploying Terraform across dev, staging, and prod?',
        a: 'Environment promotion requires isolated state and controlled variable differences.\n• Directory per env: environments/{dev,staging,prod}/ with shared modules.\n• Same modules, different tfvars (instance sizes, CIDRs, feature flags).\n• Separate AWS accounts per environment recommended.\n• CI promotes artifact (plan file or Git tag) through pipeline stages.\n• Never share state between prod and dev.\n\nTag all resources with Environment variable for cost and audit.',
        cmd: 'terraform -chdir=environments/dev plan -var-file=dev.tfvars\nterraform -chdir=environments/prod plan -var-file=prod.tfvars',
      },
      {
        q: 'Explain how tfvars files differ per environment.',
        a: 'Variable files capture environment-specific configuration without code forks.\n• dev.tfvars: small instances, relaxed deletion protection, verbose logging.\n• prod.tfvars: larger instances, prevent_destroy via variable-gated lifecycle, multi-AZ.\n• common.tfvars loaded first; env file overrides.\n• Secrets excluded— injected via CI secrets as TF_VAR_*.\n• Validate prod-specific constraints with validation blocks.\n\nKeep tfvars in Git for non-secrets; document required CI secrets per environment.',
        cmd: '# dev.tfvars\nenvironment    = "dev"\ninstance_type  = "t3.micro"\nmin_capacity   = 1\n\n# prod.tfvars\nenvironment    = "prod"\ninstance_type  = "m6i.large"\nmin_capacity   = 3',
      },
      {
        q: 'Why use separate AWS accounts for dev and prod Terraform deployments?',
        a: 'Account separation is strongest blast-radius control.\n• Prod SCPs and IAM differ from sandbox permissions.\n• Dev experiments cannot accidentally terminate prod databases.\n• Billing isolation and clearer cost allocation.\n• Provider assume_role per account in environment backend config.\n• AWS Organizations OU structure maps to environment lifecycle.\n\nSame Terraform modules target different accounts via var.account_id and provider assume_role.',
        cmd: 'provider "aws" {\n  assume_role {\n    role_arn = "arn:aws:iam::${var.account_id}:role/TerraformDeploy"\n  }\n}',
      },
      {
        q: 'What is environment promotion in a Terraform CI/CD context?',
        a: 'Promotion moves tested infrastructure changes toward production deliberately.\n• Flow: PR → plan on dev → merge → auto-apply dev → manual promote to staging → approved prod apply.\n• Same Git commit SHA applied to each environment for parity.\n• Smoke tests gate between stages.\n• Rollback: revert Git commit and re-apply or restore state version.\n• Avoid editing prod tfvars only without code change—config drift between envs.\n\nTrack promotion in change management ticket linked to Git SHA.',
        cmd: 'git checkout v1.4.2\nterraform -chdir=environments/staging apply -var-file=staging.tfvars\n\n# After validation\nterraform -chdir=environments/prod apply -var-file=prod.tfvars',
      },
    ],
    medium: [
      {
        q: 'How do you manage configuration drift between environments intentionally and safely?',
        a: 'Not all environments should be identical—document intentional differences.\n• Feature flags: enable_waf = true only in prod via tfvars.\n• Scaling variables: prod multi-AZ, dev single-AZ.\n• Drift registry spreadsheet: variable, dev value, prod value, justification.\n• Avoid undocumentated drift from manual console changes—refresh-only plans detect.\n• Periodic env parity audits compare terraform show across workspaces.\n\nStaging should mirror prod topology at smaller scale—not different architecture.',
        cmd: 'variable "enable_waf" {\n  type    = bool\n  default = false\n}\n\nresource "aws_wafv2_web_acl_association" "alb" {\n  count = var.enable_waf ? 1 : 0\n  # ...\n}',
      },
      {
        q: 'Implement blue/green or canary infrastructure deployments with Terraform.',
        a: 'Traffic shifting patterns reduce rollout risk for infrastructure changes.\n• Blue/green: parallel stack module.app_blue and module.app_green; switch Route53/ALB target weights.\n• Canary: weighted target groups 10% new / 90% old; monitor error rate before full cutover.\n• Terraform manages both stacks; cutover is variable change triggering weight update.\n• Old stack destroyed after bake period via count or separate destroy pipeline.\n• Database migrations may block full blue/green—use compatible schema changes.\n\nCoordinate with app deployment pipeline—infra green alone insufficient if app incompatible.',
        cmd: 'resource "aws_lb_listener_rule" "canary" {\n  listener_arn = aws_lb_listener.https.arn\n  priority     = 100\n\n  action {\n    type             = "forward"\n    target_group_arn = aws_lb_target_group.green.arn\n  }\n\n  condition {\n    http_header {\n      http_header_name = "X-Canary"\n      values           = ["true"]\n    }\n  }\n}',
      },
      {
        q: 'How do Terragrunt and Atlantis simplify multi-environment workflows?',
        a: 'Wrapper tools reduce duplication across environment folders.\n• Terragrunt: DRY backend/provider config via parent hcl; dependency blocks wire remote state.\n• Atlantis: PR-driven terraform plan/apply per directory in atlantis.yaml.\n• Terragrunt run-all apply applies dependency-ordered stacks.\n• Atlantis autoplan triggers only when relevant .tf files change.\n• Both support monorepo with many environments without copy-paste init blocks.\n\nChoose Terragrunt for generate blocks; Atlantis for GitOps PR workflow enforcement.',
        cmd: '# terragrunt dependency\n dependency "vpc" {\n  config_path = "../vpc"\n}\n\ninputs = {\n  vpc_id = dependency.vpc.outputs.vpc_id\n}',
      },
      {
        q: 'Handle provider and module version skew across environments.',
        a: 'Different versions per environment cause "works in dev, breaks in prod" promotions.\n• Pin same required_providers version in all environments—shared versions.tf from template.\n• Upgrade dev first; soak period; then staging; then prod with same lock file bump PR.\n• CI fails if .terraform.lock.hcl differs between environments unintentionally.\n• Document exception process for emergency prod-only hotfix with retro merge to dev.\n\nPromotion includes provider lock file change review in same PR as code.',
        cmd: '# Shared versions.tf symlink or module\nterraform {\n  required_version = ">= 1.7.0"\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "= 5.47.0" }\n  }\n}',
      },
    ],
    hard: [
      {
        q: 'Design multi-region active-active deployment with Terraform across us-east-1 and eu-west-1.',
        a: 'Active-active requires duplicated stacks, global traffic routing, and data replication strategy.\n• Provider aliases per region; module "app" called twice with providers map.\n• Route53 latency-based or geolocation routing to regional ALBs.\n• State: separate state per region (app-us-east, app-eu-west) or single state with clear resource naming—prefer separate for blast radius.\n• RDS: read replicas or Aurora Global Database—Terraform manages primary; understand failover runbook outside Terraform.\n• S3 CRR for static assets; DynamoDB global tables if used.\n\nTest regional failure by plan-only simulation and game days disabling one region.',
        cmd: 'module "app_us" {\n  source    = "./modules/app"\n  providers = { aws = aws.us_east_1 }\n  region    = "us-east-1"\n}\n\nmodule "app_eu" {\n  source    = "./modules/app"\n  providers = { aws = aws.eu_west_1 }\n  region    = "eu-west-1"\n}',
      },
      {
        q: 'Lead promotion failure when prod apply diverges from staging despite same Git SHA.',
        a: 'Same code different outcome indicates environmental externalities—not Terraform bug.\n• Compare: provider credentials account ID, tfvars values, remote state outputs, provider version lock, data source results (AMI IDs differ per region).\n• Staging may lack prod SCP constraint causing API denial in prod.\n• Quota limits hit only in prod scale (VPC limit, EIP limit).\n• Fix: align pre-apply checks (quota scanner, policy simulation iam simulate-principal-policy).\n• Process: staging must use prod-equivalent account policy on scaled-down resources.\n\nDocument parity checklist signed before prod promotion.',
        cmd: 'data "aws_caller_identity" "current" {}\n\nterraform plan -var-file=prod.tfvars | tee prod.plan.txt\n\ndiff staging.plan.txt prod.plan.txt',
      },
      {
        q: 'Implement GitOps promotion with environment branches vs trunk-based development for Terraform.',
        a: 'Branch strategy affects promotion velocity and merge conflict pain.\n• Trunk-based: single main; env directories + approval gates; feature flags for incomplete work.\n• Environment branches (dev/staging/prod): merges promote changes; risk of branch drift and merge hell.\n• GitOps (Flux-style) less common for Terraform than app code—TFC VCS on main is standard.\n• Release tags mark prod applies: v2024.06.19-prod.\n• Long-lived env branches discouraged—prefer directory tfvars on trunk.\n\nADR should define: all changes via PR to main; prod apply requires tag + approval.',
        cmd: 'git tag -a prod-2024.06.19 -m "Prod release"\ngit push origin prod-2024.06.19\n\nterraform apply -var-file=prod.tfvars',
      },
      {
        q: 'Architect account vending pipeline provisioning new environments from Terraform zero-touch.',
        a: 'Account vending automates Organizations account creation + baseline Terraform apply.\n• Control tower or AFT (Account Factory for Terraform) pipeline triggers on account request.\n• Step Functions: create account → move to OU → assume role → terraform apply landing_zone module.\n• State bucket pre-created per account or shared with prefix isolation.\n• Service catalog portal for app teams requesting dev account with budget cap.\n• Guardrails SCP applied before any workload Terraform runs.\n\nMeasure vending SLA: request to ready-for-workloads under 30 minutes.',
        cmd: '# AFT-style customization terraform\nmodule "baseline" {\n  source = "./modules/landing-zone"\n\n  account_id  = var.new_account_id\n  environment = "dev"\n}\n\nterraform apply -var="new_account_id=111122223333"',
      },
    ],
  },

  'best-practices': {
    easy: [
      {
        q: 'What are the fundamental Terraform best practices every team should follow?',
        a: 'Core practices prevent pain as infrastructure grows.\n• Remote state with locking; never commit terraform.tfstate.\n• Pin provider and module versions; commit .terraform.lock.hcl.\n• Run fmt, validate, and scan on every PR.\n• Use modules for reuse; meaningful resource naming.\n• Plan before apply; no manual console changes without codifying.\n• Document variables and outputs with descriptions.\n\nConsistency matters more than perfect tool choice—enforce via CI.',
        cmd: 'terraform fmt -recursive\nterraform validate\ncheckov -d .\nterraform plan -out=plan.tfplan',
      },
      {
        q: 'Why run terraform fmt and validate in CI?',
        a: 'Formatting and validation catch errors before human review.\n• fmt: canonical style reduces noisy diffs and review fatigue.\n• validate: syntax and internal consistency without cloud credentials (mostly).\n• validate catches missing required attributes and type errors.\n• CI gate: PR fails if fmt -check diffs exist.\n• Pre-commit hooks run locally for fast feedback.\n\nvalidate does not catch all API-level errors—plan still required with credentials.',
        cmd: 'terraform fmt -check -recursive\nterraform init -backend=false\nterraform validate',
      },
      {
        q: 'Explain the principle of immutability in Terraform-managed infrastructure.',
        a: 'Immutable infrastructure replaces rather than patches in place when configuration changes materially.\n• Launch template new version → ASG instance refresh replaces nodes.\n• Avoid SSH patching prod servers managed as pets.\n• Terraform apply creates new resources when ForceNew triggered.\n• Containers and AMIs embody immutability; config drift minimized.\n• Pair with CI-built artifacts (Packer AMIs) for reproducible deploys.\n\nPets vs cattle: Terraform excels at cattle—versioned, replaceable resources.',
        cmd: 'resource "aws_launch_template" "app" {\n  image_id      = var.ami_id\n  instance_type = var.instance_type\n\n  lifecycle {\n    create_before_destroy = true\n  }\n}',
      },
      {
        q: 'How should you organize Terraform files in a root module?',
        a: 'Logical file split improves navigation without changing behavior—all .tf files merge.\n• versions.tf: terraform and provider blocks.\n• providers.tf: provider configurations.\n• variables.tf / outputs.tf: interface.\n• main.tf or network.tf, compute.tf: resources by domain.\n• data.tf: data sources.\n• locals.tf: computed values.\n\nAvoid single 2000-line main.tf; avoid one resource per file overkill.',
        cmd: 'tree environments/prod/\n# versions.tf providers.tf variables.tf\n# vpc.tf eks.tf rds.tf outputs.tf',
      },
    ],
    medium: [
      {
        q: 'What is the DRY principle in Terraform and how do locals and modules help?',
        a: 'DRY (Don\'t Repeat Yourself) reduces maintenance when naming conventions or tags change.\n• locals: shared tags, name prefixes, computed ARNs used across resources.\n• modules: encapsulate repeated patterns (standard SG, S3 bucket with encryption defaults).\n• templatefile() for JSON policies with variable substitution.\n• Over-DRY via complex nested modules hurts readability—balance abstraction.\n• terraform-docs generates module docs from variables/outputs automatically.\n\nIf you copy-paste same block three times, extract a module.',
        cmd: 'locals {\n  common_tags = {\n    Project     = var.project\n    Environment = var.environment\n    ManagedBy   = "terraform"\n  }\n}\n\nresource "aws_s3_bucket" "a" {\n  tags = local.common_tags\n}',
      },
      {
        q: 'How do you write Terraform code for reviewability and team collaboration?',
        a: 'Code is reviewed as often as application code—clarity prevents incidents.\n• Small focused PRs; include plan output snippet in description.\n• Variable descriptions explain purpose and valid values.\n• Avoid hardcoded account IDs and regions—use variables.\n• Comment only non-obvious business logic, not every resource.\n• Use CODEOWNERS for prod directories.\n\nPlan diffs in PR comments via atlantis or tfc VCS integration accelerate review.',
        cmd: 'variable "instance_type" {\n  description = "EC2 instance type for web tier. Use t3.* for dev, m6i.* for prod."\n  type        = string\n}',
      },
      {
        q: 'Explain testing pyramid for Terraform: validate, plan, integration, and policy tests.',
        a: 'Layered testing catches different failure classes economically.\n• validate/fmt: syntax, free, every commit.\n• plan in CI with mocked or sandbox creds: catches API shape errors.\n• Integration: terratest apply/destroy in ephemeral account.\n• Policy: checkov/Sentinel on plan JSON.\n• Contract tests: module examples must plan cleanly.\n\nNot every team needs terratest—start with validate + plan + checkov minimum bar.',
        cmd: '# Makefile\ntest: fmt validate\n\tterraform plan -var-file=test.tfvars\n\tcheckov -d .\n\n# terratest (Go)\nterraform.InitAndApply(t, opts)\nterraform.Destroy(t, opts)',
      },
      {
        q: 'When should you split infrastructure into multiple Terraform states?',
        a: 'State split decisions affect blast radius, plan speed, and team autonomy.\n• Split when: different teams own stacks, different change cadence, different access levels.\n• Split when: plan time exceeds 10 minutes or lock contention frequent.\n• Keep together when: tight coupling and always deployed together (small projects).\n• Wire via remote state outputs or SSM parameters.\n• Anti-pattern: one state per resource—operational overhead explosion.\n\nReview state split annually as architecture evolves.',
        cmd: '# Separate states\n# network/ → outputs vpc_id\n# app/     → data.terraform_remote_state.network\n\nterraform state list | wc -l  # monitor growth',
      },
    ],
    hard: [
      {
        q: 'Establish Terraform platform engineering standards for 100+ developers.',
        a: 'Platform team publishes golden paths reducing cognitive load and incidents.\n• Approved module catalog in private registry with SLAs.\n• Scaffold CLI (cookiecutter) generates repo with CI, backend, provider template.\n• Documented state layout, naming, tagging, and promotion process.\n• Office hours and #terraform-help channel; RFC process for module changes.\n• Metrics: MTTR infra incidents, plan failure rate, module adoption %.\n• Deprecation policy for anti-patterns (local state, -target in prod).\n\nDeveloper experience goal: new service infra PR within 1 day using templates.',
        cmd: '# Platform template repo\ncookiecutter gh:acme/terraform-service-template\n\n# Metrics from TFC API\n# track run status, duration, policy failures',
      },
      {
        q: 'How would you implement comprehensive documentation and discoverability for Terraform modules?',
        a: 'Undocumented modules become black boxes feared and forked.\n• terraform-docs generates README tables from variables/outputs.\n• examples/complete working deployment per module.\n• Backstage software catalog registers module with owner, tier, on-call.\n• Changelog per module semver in Git tags.\n• Architecture Decision Records linked from module README.\n• Interactive workshop quarterly for major module consumers.\n\nSearch: internal registry full-text search by resource type (vpc, eks).',
        cmd: 'terraform-docs markdown table . > README.md\n\n# pre-commit hook\nterraform-docs markdown table --output-file README.md --output-mode inject .',
      },
      {
        q: 'Lead technical debt reduction program for legacy Terraform codebase.',
        a: 'Legacy Terraform accumulates state debt, unpinned versions, and monolithic modules.\n• Inventory: unpinned providers, local state stragglers, resources without tags.\n• Prioritize by risk score: prod local state first, then public SG rules.\n• Quarterly sprints: pin versions, extract modules, enable remote state, add checkov.\n• Boy scout rule: touch legacy only with small improvement when nearby.\n• Measure debt burndown chart; exec visibility sustains funding.\n\nAvoid big-bang rewrite—incremental migration with zero-downtime moved blocks.',
        cmd: '# Debt inventory scripts\nrg "version\\\\s*=" --glob "*.tf" | rg -v required_providers\n\nfind . -name terraform.tfstate  # local state stragglers',
      },
      {
        q: 'Define SLOs and operational excellence for Terraform platform reliability.',
        a: 'Platform SLOs align infra automation reliability with product expectations.\n• Plan success rate >99% excluding user config errors.\n• P95 plan duration per workspace tier documented with alerts.\n• State lock contention incidents <2/month.\n• Policy false positive rate <5% blocking valid PRs.\n• On-call runbooks: lock stuck, state corrupt, provider outage, TFC degraded.\n• Error budget: if apply failure rate spikes, freeze module upgrades.\n\nReview SLOs monthly with infra leadership; publish status dashboard.',
        cmd: '# TFC metrics export\ncurl -H "Authorization: Bearer $TF_TOKEN" \\\n  "https://app.terraform.io/api/v2/organizations/acme/runs?page[size]=100" | \\\n  jq \'[.data[] | .attributes.status] | group_by(.) | map({status: .[0], count: length})\'',
      },
    ],
  },
};

export const SCENARIO_CONTENT = [
  {
    title: 'State File Corruption During Apply',
    difficulty: 'easy',
    q: '[Production Scenario] State File Corruption During Apply: What is your troubleshooting approach?',
    a: 'Structured response for state corruption mid-apply:\n\nDetect & stabilize:\n• Stop further applies immediately; announce incident channel.\n• Check if apply process crashed mid-write—state JSON may be truncated.\n• Verify cloud resources: some may exist while state lacks their records.\n\nTriage:\n• Attempt terraform state list—if JSON parse error, state is corrupt.\n• Restore from S3 version history or terraform.tfstate.backup.\n• Compare restored state serial with last known good CI artifact.\n\nRecover:\n• terraform state push restored file after backup current broken state to S3 incident prefix.\n• Run terraform plan—expect zero changes if restoration perfect; import missing resources if partial.\n\nPrevent:\n• Enable S3 versioning and MFA delete on state bucket.\n• CI concurrency limit 1; never kill -9 apply process.\n• Post-incident: add state integrity check (jq empty) before unlock.',
    cmd: 'aws s3api list-object-versions \\\n  --bucket acme-tfstate \\\n  --prefix prod/app/terraform.tfstate\n\naws s3api get-object \\\n  --bucket acme-tfstate \\\n  --key prod/app/terraform.tfstate \\\n  --version-id <GOOD_VERSION> restored.tfstate\n\ncp terraform.tfstate terraform.tfstate.corrupt\nterraform state push restored.tfstate\nterraform plan',
  },
  {
    title: 'Drift Detection in Production',
    difficulty: 'easy',
    q: '[Production Scenario] Drift Detection in Production: What is your troubleshooting approach?',
    a: 'Drift means live infrastructure differs from Terraform code/state.\n\nDetect:\n• Scheduled terraform plan -refresh-only -detailed-exitcode exits 2.\n• TFC drift detection alert or AWS Config rule flags manual change.\n• Symptom: unexpected behavior (SG rule) after someone "fixed prod quickly" in console.\n\nTriage:\n• Identify drifted resources in plan output—note attribute differences.\n• Interview recent console changes via CloudTrail; correlate timestamp with incident.\n• Classify: intentional hotfix vs unauthorized change.\n\nMitigate:\n• If code is source of truth: terraform apply to revert drift (during change window).\n• If manual fix was correct: codify in .tf, PR review, then apply.\n• Never leave uncodified drift—next apply will surprise someone.\n\nPrevent:\n• IAM SCP denying manual changes on tagged resources.\n• Weekly refresh-only cron with Slack alert on exit code 2.',
    cmd: 'terraform plan -refresh-only -detailed-exitcode\n\n# CloudTrail lookup\naws cloudtrail lookup-events \\\n  --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress \\\n  --start-time 2024-06-18T00:00:00Z\n\nterraform apply  # revert or codify first',
  },
  {
    title: 'Multi Region Deployment Failure',
    difficulty: 'easy',
    q: '[Production Scenario] Multi Region Deployment Failure: What is your troubleshooting approach?',
    a: 'Multi-region apply failed in one region while other succeeded—partial global footprint.\n\nDetect:\n• CI apply failed on module.app_eu; us-east succeeded.\n• Users report EU latency or EU-specific 503 errors.\n• Route53 health checks failing for eu-west-1 endpoint.\n\nTriage:\n• Read error: common causes—EU service quota, unsupported instance type in region, AMI not copied.\n• terraform state list per regional workspace; identify half-created resources.\n• Check provider alias configuration and credentials for EU account/region.\n\nMitigate:\n• Fix root cause (request quota increase, pick supported instance type).\n• terraform apply targeted region workspace or full re-apply after fix.\n• Temporarily route 100% traffic to healthy US region via Route53 weight adjustment (manual or TF var).\n\nPrevent:\n• Pre-apply quota checks script per region.\n• Staging deploys both regions before prod promotion.',
    cmd: 'terraform workspace select prod-eu-west-1\nterraform plan -var-file=prod.tfvars\n\naws service-quotas get-service-quota \\\n  --service-code ec2 \\\n  --quota-code L-1216C47A \\\n  --region eu-west-1\n\nterraform apply -var-file=prod.tfvars',
  },
  {
    title: 'Module Version Pin Mismatch',
    difficulty: 'easy',
    q: '[Production Scenario] Module Version Pin Mismatch: What is your troubleshooting approach?',
    a: 'Consumer repo pins module v3 but expects outputs from v4 API.\n\nDetect:\n• terraform plan/apply error: Unsupported attribute "vpc_flow_log_id" on module.vpc.\n• CI started failing after developer ran init -upgrade locally without committing lock file.\n• Different plan results between CI and laptop.\n\nTriage:\n• Compare module version constraint in module block vs CHANGELOG for renamed outputs.\n• cat .terraform/modules/modules.json for resolved versions.\n• Identify which PR bumped version without updating consumer references.\n\nMitigate:\n• Pin exact version matching working deployment: version = "3.2.1".\n• Update consumer code to new output names per migration guide OR rollback module version.\n• terraform init -upgrade=false to respect lock file.\n\nPrevent:\n• Renovate PRs must include plan diff from all consuming workspaces.\n• Semver: treat output renames as major version bumps.',
    cmd: 'cat .terraform/modules/modules.json | jq \'.Modules[] | {Key, VersionSource}\'\n\nmodule "vpc" {\n  source  = "terraform-aws-modules/vpc/aws"\n  version = "3.2.1"  # pin exact until migration complete\n}\n\nterraform init\nterraform plan',
  },
  {
    title: 'CI/CD Pipeline State Lock',
    difficulty: 'easy',
    q: '[Production Scenario] CI/CD Pipeline State Lock: What is your troubleshooting approach?',
    a: 'Pipeline blocked because another process holds Terraform state lock.\n\nDetect:\n• Error acquiring the state lock: ConditionalCheckFailedException or lock ID shown.\n• Queued CI jobs stacking up; no applies completing.\n• Message includes Lock Info: ID, Path, Operation, Who, Created.\n\nTriage:\n• Check if legitimate apply still running in TFC or other CI job.\n• If crashed job: verify runner terminated; note lock age > apply timeout threshold.\n• Search for concurrent pipelines on same backend key (duplicate cron triggers).\n\nMitigate:\n• Cancel stuck TFC run or wait for legitimate completion.\n• terraform force-unlock LOCK_ID only after confirming no active apply.\n• Re-run pipeline from plan step.\n\nPrevent:\n• concurrency: group: tfstate-prod limit: 1 in GitHub Actions.\n• Alert on lock held >30 minutes.',
    cmd: 'terraform plan  # displays lock metadata\n\n# After confirming no active run\nterraform force-unlock abc123-def456-789\n\n# GitHub Actions\n# concurrency:\n#   group: terraform-prod\n#   cancel-in-progress: false',
  },
  {
    title: 'Remote Backend Auth Expired',
    difficulty: 'easy',
    q: '[Production Scenario] Remote Backend Auth Expired: What is your troubleshooting approach?',
    a: 'Terraform init or plan fails accessing S3/GCS backend due to expired credentials.\n\nDetect:\n• Error: AccessDenied calling GetObject on state bucket.\n• STS ExpiredToken exception in CI logs.\n• Started after OIDC session duration change or rotated IAM role trust policy.\n\nTriage:\n• Verify CI OIDC trust relationship: repo, branch, audience.\n• aws sts get-caller-identity in pipeline debug step.\n• Check role session duration vs long-running apply exceeding token TTL.\n\nMitigate:\n• Refresh credentials: re-run configure-aws-credentials step.\n• Extend role MaxSessionDuration if apply legitimately exceeds 1 hour.\n• Fix trust policy if repo rename broke subject claim.\n• Use TFC remote backend to offload credential complexity to agents.\n\nPrevent:\n• Monitor credential expiry in apply jobs >45 min.\n• Document IAM role trust policy as code in Terraform.',
    cmd: 'aws sts get-caller-identity\n\n# Debug OIDC\necho "$ACTIONS_ID_TOKEN_REQUEST_TOKEN"\n\n# Reconfigure CI credentials\naws-actions/configure-aws-credentials@v4\n  role-to-assume: arn:aws:iam::123:role/TerraformCI\n  role-duration-seconds: 7200',
  },
  {
    title: 'Workspace State Collision',
    difficulty: 'easy',
    q: '[Production Scenario] Workspace State Collision: What is your troubleshooting approach?',
    a: 'Two teams or pipelines accidentally share the same Terraform workspace/backend key.\n\nDetect:\n• Plan shows unexpected resources (another team\'s RDS instance).\n• Apply destroyed resources team did not create.\n• terraform state list includes unfamiliar addresses.\n\nTriage:\n• Print backend config: bucket, key, workspace prefix.\n• Compare with other team\'s pipeline variables—duplicate key likely.\n• Check TFC workspace name collision across projects.\n\nMitigate:\n• STOP all applies immediately.\n• Split states: team B init -reconfigure with unique backend key.\n• terraform state pull per team; surgically remove foreign resources from wrong state using state rm (expert review) OR restore from backup.\n• Verify syntax: import team resources back if wrongly removed from state.\n\nPrevent:\n• Namespace backend keys: {team}/{env}/{stack}/terraform.tfstate.\n• CI validation script asserts expected account ID and state key.',
    cmd: 'terraform init -backend=false\n\n# Show current workspace\nterraform workspace show\n\n# Reconfigure unique backend\nterraform init -reconfigure -backend-config=team-alpha.backend.hcl\n\nterraform state list',
  },
  {
    title: 'Provisioner Timeout on Boot',
    difficulty: 'medium',
    q: '[Production Scenario] Provisioner Timeout on Boot: What is your troubleshooting approach?',
    a: 'remote-exec or local-exec provisioner failed waiting for instance readiness.\n\nDetect:\n• Apply error: timeout waiting for SSH or script exit code 255.\n• Instance exists in AWS console but application not configured.\n• Pipeline red; partial infrastructure deployed.\n\nTriage:\n• Check SG allows SSH/SSM from runner or bastion.\n• Verify cloud-init status on instance: cloud-init status --long.\n• Confirm correct AMI user (ec2-user vs ubuntu) in connection block.\n• Review if instance still booting when provisioner ran—no delay resource.\n\nMitigate:\n• Short term: terraform taint + apply after fixing SG/key/cloud-init.\n• Better: remove provisioner; move script to user_data or Packer AMI.\n• Add time_sleep 120s only as temporary bridge.\n\nPrevent:\n• Ban remote-exec in prod via Sentinel.\n• Immutable bootstrap via launch template user_data.',
    cmd: '# On instance via SSM\naws ssm start-session --target i-0abc123\nc sudo cloud-init status --long\n\nterraform apply -replace=aws_instance.app\n\n# Replace provisioner with user_data\nresource "aws_instance" "app" {\n  user_data = file("cloud-init.yaml")\n}',
  },
  {
    title: 'Import Existing Resource Conflict',
    difficulty: 'medium',
    q: '[Production Scenario] Import Existing Resource Conflict: What is your troubleshooting approach?',
    a: 'terraform import fails because resource already in state or config does not match live object.\n\nDetect:\n• Error: resource already managed, or import ID format wrong.\n• Plan after import wants to destroy/recreate due to attribute mismatch.\n\nTriage:\n• terraform state list | grep resource address.\n• Compare config attributes with aws cli describe for live resource.\n• Verify import ID format per provider docs (S3 bucket name vs ARN differs).\n\nMitigate:\n• If duplicate in state: remove wrong entry with state rm before import.\n• Align config with reality: adjust tags, lifecycle ignore_changes for unmanaged attrs.\n• Use import block (TF 1.5+) in PR for reviewable import.\n• Run plan until zero changes post-import.\n\nPrevent:\n• Import runbook with ID format examples per resource type.\n• Staging import rehearsal before prod.',
    cmd: 'terraform import aws_s3_bucket.logs acme-prod-logs\n\nimport {\n  to = aws_s3_bucket.logs\n  id = "acme-prod-logs"\n}\n\nterraform plan  # must show 0 changes when aligned',
  },
  {
    title: 'Count vs For Each Refactor Break',
    difficulty: 'medium',
    q: '[Production Scenario] Count vs For Each Refactor Break: What is your troubleshooting approach?',
    a: 'Refactoring aws_subnet.private[0] to aws_subnet.private["app-a"] plans destroy/create all subnets.\n\nDetect:\n• Plan shows 6 destroys + 6 creates for subnet refactor PR.\n• Reviewer flags unintended replacement of production subnets.\n\nTriage:\n• Understand index instability: count removal shifts indices.\n• Map old indices to new keys explicitly before apply.\n\nMitigate:\n• Use moved blocks:\n  moved { from = aws_subnet.private[0] to = aws_subnet.private["app-a"] }\n• Or terraform state mv for each instance.\n• Apply moved blocks PR first; verify zero change plan.\n• Never direct apply destroy/create on subnets with running workloads.\n\nPrevent:\n• Prefer for_each from greenfield.\n• Refactor guide in module README; require moved blocks in PR template.',
    cmd: 'moved {\n  from = aws_subnet.private[0]\n  to   = aws_subnet.private["app-a"]\n}\n\nmoved {\n  from = aws_subnet.private[1]\n  to   = aws_subnet.private["app-b"]\n}\n\nterraform plan  # expect 0 changes',
  },
  {
    title: 'Provider Plugin Version Skew',
    difficulty: 'medium',
    q: '[Production Scenario] Provider Plugin Version Skew: What is your troubleshooting approach?',
    a: 'CI and developer machines run different AWS provider versions causing divergent plans.\n\nDetect:\n• "works on my machine"—CI plan shows replacements dev plan does not.\n• .terraform.lock.hcl not committed or conflicting in merge.\n• init -upgrade in CI pulls newer provider than lock file intended.\n\nTriage:\n• diff .terraform.lock.hcl between branches.\n• terraform version and provider versions side by side.\n• Read provider CHANGELOG for ForceNew changes in minor bump.\n\nMitigate:\n• Commit lock file; enforce terraform init without -upgrade in CI.\n• Align provider version in required_providers with lock file.\n• Staging plan with upgraded provider before prod.\n\nPrevent:\n• Pre-commit hook rejects missing lock file changes when providers change.\n• Single terraform version in CI container image.',
    cmd: 'terraform providers\n\ncat .terraform.lock.hcl | grep hashicorp/aws\n\nterraform init  # no -upgrade in CI\nterraform plan',
  },
  {
    title: 'Sensitive Output Leaked in Logs',
    difficulty: 'medium',
    q: '[Production Scenario] Sensitive Output Leaked in Logs: What is your troubleshooting approach?',
    a: 'Database password or API key appeared in CI log output or PR comment.\n\nDetect:\n• Secret scanner alert on CI log.\n• Engineer reports credential in public GitHub Actions output.\n\nTriage:\n• Identify source: terraform output without sensitive, debug print, TF_LOG=DEBUG.\n• Scope: which secret, which environments affected, log retention exposure.\n\nMitigate:\n• Rotate compromised credentials immediately—assume full exposure.\n• Mark output sensitive = true; remove echo steps from pipeline.\n• Purge PR bot comments if platform allows.\n\nPrevent:\n• gitleaks in CI; ban terraform output in public logs for prod.\n• Use Vault dynamic credentials; audit all outputs for sensitive classification.',
    cmd: '# Rotate secret\naws secretsmanager rotate-secret --secret-id prod/app/db\n\n# Fix output\noutput "db_password" {\n  value     = aws_db_instance.main.password\n  sensitive = true\n}\n\n# Remove from CI\n# - run: terraform output db_password  # DELETE THIS',
  },
  {
    title: 'Terraform Cloud Run Queued Forever',
    difficulty: 'medium',
    q: '[Production Scenario] Terraform Cloud Run Queued Forever: What is your troubleshooting approach?',
    a: 'TFC run stuck in queued state; deployment pipeline blocked.\n\nDetect:\n• Run status "pending" for >15 minutes in TFC UI.\n• Downstream environments waiting on run trigger.\n\nTriage:\n• Prior run awaiting approval blocking queue?\n• Agent pool has zero healthy agents?\n• Org concurrency limit reached on tier?\n• status.terraform.io for platform incident.\n\nMitigate:\n• Approve or cancel blocking run.\n• Restart unhealthy agents; verify outbound connectivity to app.terraform.io.\n• Cancel queued run and re-trigger via API.\n• Temporary: switch workspace to local execution only if emergency (document exception).\n\nPrevent:\n• Agent health monitoring; alert on queue depth.\n• Auto-cancel superseded speculative plans on same workspace.',
    cmd: 'curl -H "Authorization: Bearer $TF_TOKEN" \\\n  "https://app.terraform.io/api/v2/workspaces/ws-xxx/runs?filter%5Bstatus%5D=pending"\n\n# Cancel run\ncurl -X POST -H "Authorization: Bearer $TF_TOKEN" \\\n  https://app.terraform.io/api/v2/runs/run-xxx/actions/cancel\n\n# Check agent pool\n# TFC UI → Agents → Pool health',
  },
  {
    title: 'State Migration Between Backends',
    difficulty: 'medium',
    q: '[Production Scenario] State Migration Between Backends: What is your troubleshooting approach?',
    a: 'Migrating state from local/S3 to TFC or between AWS accounts requires careful execution.\n\nDetect:\n• init -migrate-state prompts or fails mid-copy.\n• Post-migration plan wants to recreate all resources (state not actually migrated).\n\nTriage:\n• Verify state object exists in destination bucket/TFC workspace.\n• Compare resource count: terraform state list before vs after.\n• Check backend config matches intended destination key.\n\nMitigate:\n• Backup source state: terraform state pull > backup.json.\n• terraform init -migrate-state with confirmed yes.\n• If failed: terraform init -reconfigure + terraform state push backup.json.\n• Plan must show zero changes before declaring success.\n\nPrevent:\n• Migration runbook with rollback steps.\n• Maintenance window communication; freeze applies during migration.',
    cmd: 'terraform state pull > pre-migration-backup.json\n\nterraform init -migrate-state\n\nterraform plan  # MUST be empty\n\n# Rollback if needed\nterraform init -reconfigure -backend-config=old.backend.hcl\nterraform state push pre-migration-backup.json',
  },
  {
    title: 'Module Output Circular Dependency',
    difficulty: 'hard',
    q: '[Production Scenario] Module Output Circular Dependency: What is your troubleshooting approach?',
    a: 'Modules A and B reference each other\'s outputs causing cycle error or perpetual diff.\n\nDetect:\n• Error: Cycle: module.network depends on module.app depends on module.network.\n• Plan always changes shared resource despite no config edit.\n\nTriage:\n• Draw dependency graph: terraform graph | dot.\n• Identify mutual output references (SG from app module fed to network module and vice versa).\n\nMitigate:\n• Break cycle: extract shared SG rules to third module or root module.\n• Pass IDs one direction only: network → app, never app → network.\n• Split stacks: network state outputs consumed by app via remote state.\n\nPrevent:\n• Architecture review for module dependency direction before implementation.\n• Lint against module cycles in CI where possible.',
    cmd: 'terraform graph -type=plan | dot -Tsvg > cycle-debug.svg\n\n# Fix: remote state instead of module output loop\n# network stack outputs vpc_id\n# app stack: data.terraform_remote_state.network.outputs.vpc_id',
  },
  {
    title: 'IAM Policy Too Large Error',
    difficulty: 'hard',
    q: '[Production Scenario] IAM Policy Too Large Error: What is your troubleshooting approach?',
    a: 'Apply fails: Max policy size of 10240 bytes exceeded (or 6144 for managed policy).\n\nDetect:\n• Error on aws_iam_role_policy or aws_iam_policy during apply.\n• Grew after adding S3 bucket ARNs dynamically via inline policy.\n\nTriage:\n• Measure policy JSON size: wc -c policy.json.\n• Identify unbounded lists (every bucket ARN in account appended).\n\nMitigate:\n• Split into multiple aws_iam_role_policy_attachment documents.\n• Replace inline enumerations with prefix/wildcard where acceptable: arn:aws:s3:::acme-prod-*.\n• Use permission sets or ABAC with principal tags instead of resource lists.\n• aws_iam_policy_document merge with dynamic groups by service.\n\nPrevent:\n• Policy size CI check on terraform plan JSON.\n• Design IAM with path prefixes; avoid per-resource ARNs in single policy.',
    cmd: 'data "aws_iam_policy_document" "s3" {\n  statement {\n    actions   = ["s3:GetObject"]\n    resources = ["arn:aws:s3:::${var.prefix}-*/*"]\n  }\n}\n\n# Split attachments\nresource "aws_iam_role_policy_attachment" "s3_read" {\n  role       = aws_iam_role.app.name\n  policy_arn = aws_iam_policy.s3_read.arn\n}',
  },
  {
    title: 'Destroy Blocked by Dependency',
    difficulty: 'hard',
    q: '[Production Scenario] Destroy Blocked by Dependency: What is your troubleshooting approach?',
    a: 'terraform destroy fails because resources have dependent objects outside or inside Terraform.\n\nDetect:\n• Error: DependencyViolation: resource has dependent objects.\n• Common: VPC has ENIs, subnet has LB, S3 bucket not empty, IAM role attached.\n\nTriage:\n• Read AWS error detail for specific blocker.\n• terraform state list remaining resources.\n• Check prevent_destroy lifecycle blocking intentional destroy.\n\nMitigate:\n• Destroy order: children before parents—Terraform usually handles; manual ENIs/LB may block VPC.\n• Empty S3 bucket: aws_s3_object deletion or force_destroy = true on bucket resource.\n• Remove prevent_destroy temporarily with approved change ticket.\n• Delete external dependencies or import into state for managed destroy.\n\nPrevent:\n• destroy plan in staging before prod decommission.\n• Module decommission runbook with ordered destroy targets.',
    cmd: 'terraform destroy\n\n# S3 force destroy\nresource "aws_s3_bucket" "temp" {\n  force_destroy = true\n}\n\n# Find ENIs blocking VPC\naws ec2 describe-network-interfaces --filters Name=vpc-id,Values=vpc-abc123',
  },
  {
    title: 'Variable Validation Failing in CI',
    difficulty: 'hard',
    q: '[Production Scenario] Variable Validation Failing in CI: What is your troubleshooting approach?',
    a: 'Plan fails: Invalid value for variable due to validation block—blocking all deploys.\n\nDetect:\n• CI red on all branches after module upgrade merged.\n• Error message from validation block with custom error_message.\n\nTriage:\n• Compare tfvars values against new validation rules in upgraded module.\n• Identify if prod tfvars violates new constraint (instance type not in approved list).\n• Check TF_VAR env vars missing in CI causing null validation failure.\n\nMitigate:\n• Update tfvars to compliant values OR rollback module minor version.\n• If validation too strict: patch module with expanded allowed list in patch release.\n• Communicate breaking validation as minor/major semver appropriately.\n\nPrevent:\n• Staged rollout: dev tfvars tested in Renovate PR before prod.\n• Validation error messages must include allowed values list.',
    cmd: 'terraform plan -var-file=prod.tfvars\n\n# Example fix\n# prod.tfvars\ninstance_type = "m6i.large"  # was t3.micro, now rejected\n\n# Module validation\nvalidation {\n  condition     = contains(var.approved_types, var.instance_type)\n  error_message = "Must be one of: ${join(", ", var.approved_types)}"\n}',
  },
  {
    title: 'Backend Lock Not Released',
    difficulty: 'hard',
    q: '[Production Scenario] Backend Lock Not Released: What is your troubleshooting approach?',
    a: 'DynamoDB state lock persists after CI runner killed; all applies blocked for hours.\n\nDetect:\n• Error acquiring state lock with same LockID repeatedly.\n• Lock Created timestamp hours ago; no running apply in TFC/CI.\n\nTriage:\n• Confirm runner pod/process terminated (Kubernetes OOM, GitHub timeout cancel).\n• Query DynamoDB terraform-locks table for LockID item.\n• Verify no legitimate long-running apply (RDS create) still in progress.\n\nMitigate:\n• terraform force-unlock LOCK_ID from authorized operator.\n• If DynamoDB item orphaned: manual delete only if force-unlock fails (last resort).\n• Re-run pipeline from clean plan.\n\nPrevent:\n• CI timeout > longest expected apply; graceful cancel hooks.\n• Alert lock age >45 min.\n• Use TFC remote runs for resilience vs ephemeral CI runners.',
    cmd: 'aws dynamodb get-item \\\n  --table-name terraform-locks \\\n  --key \'{"LockID":{"S":"acme-tfstate/prod/app/terraform.tfstate-md5"}}\'\n\nterraform force-unlock 8b6e-aaaa-bbbb-cccc-ddddeeeeffff\n\nterraform plan',
  },
  {
    title: 'Policy as Code Denied Apply',
    difficulty: 'hard',
    q: '[Production Scenario] Policy as Code Denied Apply: What is your troubleshooting approach?',
    a: 'Sentinel/OPA/Checkov policy blocked apply on legitimate or urgent change.\n\nDetect:\n• TFC run: Policy check failed: main rule false.\n• CI checkov exit code 1 on new resource.\n\nTriage:\n• Read policy violation message; identify failing resource and attribute.\n• Classify: true misconfiguration (public SG) vs false positive (approved exception).\n• Check if emergency break-glass override available (soft-mandatory Sentinel).\n\nMitigate:\n• If misconfiguration: fix .tf to comply (restrict cidr_blocks, enable encryption).\n• If false positive: policy exception PR with security team approval updating Sentinel.\n• Emergency: org admin override soft-mandatory with ticket; hard-mandatory requires policy change deploy first.\n\nPrevent:\n• Policy development includes positive/negative test cases.\n• Sandbox workspace tests policy changes before org-wide rollout.\n• Document exception process with 48h retro policy update.',
    cmd: '# Local reproduce\nterraform plan -out=plan.bin\nterraform show -json plan.bin > plan.json\n\nconftest test plan.json -p policies/\n\n# Sentinel soft-mandatory override in TFC UI\n# Requires Manage Policies permission + audit log entry',
  },
];
