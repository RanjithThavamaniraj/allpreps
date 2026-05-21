export const awsNewQuestions = [
  // ==========================================
  // EASY QUESTIONS (13 new, IDs 167 to 179)
  // ==========================================
  {
    id: 167,
    title: "Difference between Security Groups and Network Access Control Lists (NACLs)",
    category: "aws",
    difficulty: "easy",
    answer: "Both act as firewalls but function at different layers of your Virtual Private Cloud (VPC):\n• Security Group: Operates at the instance level (EC2). It is stateful (inbound allowed traffic automatically allows outbound response). It supports ALLOW rules only.\n• Network ACL (NACL): Operates at the subnet level. It is stateless (outbound responses must be explicitly allowed by rules). It supports both ALLOW and DENY rules. Rules are processed in numerical order.",
    command: `# Describe security groups in a specific VPC\naws ec2 describe-security-groups --filters Name=vpc-id,Values=vpc-08ac3024c125\n\n# Describe NACLs for a specific VPC\naws ec2 describe-network-acls --filters Name=vpc-id,Values=vpc-08ac3024c125`
  },
  {
    id: 168,
    title: "Explain Amazon S3 Storage Classes and lifecycle policies",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon S3 offers different storage classes to optimize cost based on data access patterns:\n• S3 Standard: High durability and availability for active data.\n• S3 Standard-IA (Infrequent Access): Lower storage cost, but retrieval fee. For data accessed less than once a month.\n• S3 Glacier Flexible Retrieval: Secure, low-cost archive with retrieval times from minutes to hours.\n• S3 Glacier Deep Archive: Lowest cost storage with retrievals in 12 hours.\nLifecycle policies automate transitions between these classes (e.g. move logs to Glacier after 30 days, then delete after 90 days).",
    command: `# Put a lifecycle configuration on an S3 bucket\naws s3api put-bucket-lifecycle-configuration \\\n  --bucket my-app-logs-bucket \\\n  --lifecycle-configuration file://lifecycle.json\n\n# Contents of lifecycle.json:\n# {\n#   "Rules": [\n#     {\n#       "ID": "MoveLogsToGlacier",\n#       "Status": "Enabled",\n#       "Filter": {"Prefix": "logs/"},\n#       "Transitions": [\n#         {"Days": 30, "StorageClass": "GLACIER"}\n#       ]\n#     }\n#   ]\n# }`
  },
  {
    id: 169,
    title: "How to configure the AWS CLI on a new system?",
    category: "aws",
    difficulty: "easy",
    answer: "To interact with AWS services from the terminal, configure your access keys. Running 'aws configure' prompts for four pieces of information:\n1. AWS Access Key ID\n2. AWS Secret Access Key\n3. Default Region Name (e.g. us-east-1)\n4. Default Output Format (json, text, or table)\nThese settings are saved in credentials and config files in ~/.aws/.",
    command: `# Start interactive configuration\naws configure\n\n# Verify your identity and permissions\naws sts get-caller-identity\n\n# List files in the configuration directory\nls -l ~/.aws/`
  },
  {
    id: 170,
    title: "What is an Elastic IP address vs Public IP in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "• Public IP: Dynamically assigned to an EC2 instance. It changes every time the instance is stopped and started. This breaks external DNS or firewall white-lists.\n• Elastic IP (EIP): A static, public IPv4 address allocated to your AWS account. You can associate it with any EC2 instance. It remains unchanged even if the instance is stopped or restarted.",
    command: `# Allocate an Elastic IP address in your region\naws ec2 allocate-address --domain vpc\n\n# Associate an Elastic IP with an EC2 instance\naws ec2 associate-address --instance-id i-0482ac8c21 --public-ip 54.210.14.85`
  },
  {
    id: 171,
    title: "How do you check EC2 instance status and details using AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "Use 'aws ec2' commands to list, filter, and inspect virtual machines. Use the query parameter to return specific properties, such as IP addresses or instance states, in a clean format.",
    command: `# List all running EC2 instances with ID and Type\naws ec2 describe-instances \\\n  --filters "Name=instance-state-name,Values=running" \\\n  --query "Reservations[*].Instances[*].[InstanceId,InstanceType,PublicIpAddress]" \\\n  --output table`
  },
  {
    id: 172,
    title: "Explain the difference between an IAM User, Group, and Role",
    category: "aws",
    difficulty: "easy",
    answer: "• IAM User: An identity representing a single person or service that interacts with AWS. It has long-term credentials (password, access keys).\n• IAM Group: A collection of users. You assign permissions to a group so all members inherit them, simplifying user management.\n• IAM Role: An identity with temporary credentials. It is assumed by services (e.g. EC2) or users from other accounts, avoiding the need to hardcode credentials in applications.",
    command: `# Create a new IAM Group\naws iam create-group --group-name DBA-Admins\n\n# Attach a policy to the group\naws iam attach-group-policy \\\n  --group-name DBA-Admins \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess`
  },
  {
    id: 173,
    title: "What is Amazon Route 53 and what are A vs CNAME records?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon Route 53 is a highly available and scalable Domain Name System (DNS) service.\n• A Record (Address): Maps a domain name directly to an IPv4 address (e.g., app.com -> 54.2.14.8).\n• CNAME Record (Canonical Name): Maps a domain name to another domain name (e.g., www.app.com -> app-load-balancer-1234.us-east-1.elb.amazonaws.com). Route 53 also supports Alias records, which act like CNAMEs but route directly to AWS resources (like ELBs or S3 buckets) without incurring extra DNS query charges.",
    command: `# List hosted zones in your Route 53 account\naws route53 list-hosted-zones\n\n# List resource record sets in a specific hosted zone\naws route53 list-resource-record-sets --hosted-zone-id Z0482937108`
  },
  {
    id: 174,
    title: "How to enable billing alerts and alarms in AWS?",
    category: "aws",
    difficulty: "easy",
    answer: "To prevent unexpected cloud bills, enable billing alerts in the Billing Console. This publishes metrics to CloudWatch in the us-east-1 region. You can then create a CloudWatch alarm to send email notifications via Simple Notification Service (SNS) when costs exceed a defined threshold.",
    command: `# Create a CloudWatch alarm to trigger when monthly charges exceed $100\naws cloudwatch put-metric-alarm \\\n  --alarm-name "Monthly-Budget-Alarm" \\\n  --metric-name EstimatedCharges \\\n  --namespace AWS/Billing \\\n  --statistic Maximum \\\n  --period 21600 \\\n  --evaluation-periods 1 \\\n  --threshold 100 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=Currency,Value=USD \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:billing-alerts-topic`
  },
  {
    id: 175,
    title: "Explain the difference between a public subnet and private subnet",
    category: "aws",
    difficulty: "easy",
    answer: "Both subnets exist inside a Virtual Private Cloud (VPC) but differ in routing configuration:\n• Public Subnet: Its route table contains an entry pointing to an Internet Gateway (IGW), allowing resources inside the subnet to communicate directly with the internet.\n• Private Subnet: Its route table does not contain a path to an IGW. To download updates, resources in a private subnet route traffic through a Network Address Translation (NAT) Gateway placed in a public subnet.",
    command: `# Describe subnets in your VPC\naws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-08ac3024c125"`
  },
  {
    id: 176,
    title: "How to stop, start, and reboot EC2 instances using the AWS CLI?",
    category: "aws",
    difficulty: "easy",
    answer: "You can manage the lifecycle of your virtual instances using the AWS CLI. Stopping an instance stops billing for compute resources, but EBS volumes continue to incur storage fees. Rebooting performs an operating system restart without changing the underlying physical host.",
    command: `# Stop a running EC2 instance\naws ec2 stop-instances --instance-ids i-085fac801\n\n# Start a stopped EC2 instance\naws ec2 start-instances --instance-ids i-085fac801\n\n# Reboot an instance online\naws ec2 reboot-instances --instance-ids i-085fac801`
  },
  {
    id: 177,
    title: "What is Amazon CloudWatch and what are basic vs detailed monitoring?",
    category: "aws",
    difficulty: "easy",
    answer: "Amazon CloudWatch is a monitoring and management service that collects performance data and log files from AWS resources.\n• Basic Monitoring: Enabled by default for EC2 instances. It collects metrics (CPU, disk, network) at 5-minute intervals at no additional charge.\n• Detailed Monitoring: Collects metrics at 1-minute intervals for an additional charge, allowing you to react quickly to scaling events.",
    command: `# Enable detailed monitoring on an EC2 instance\naws ec2 monitor-instances --instance-ids i-085fac801\n\n# Disable detailed monitoring (revert to basic)\naws ec2 unmonitor-instances --instance-ids i-085fac801`
  },
  {
    id: 178,
    title: "How to create an IAM role for EC2 to access S3 buckets?",
    category: "aws",
    difficulty: "easy",
    answer: "Hardcoding AWS access keys inside code running on EC2 is a major security risk. Instead, create an IAM Role with permissions to access the S3 bucket, and attach it to the EC2 instance as an Instance Profile. The AWS SDK retrieves temporary credentials automatically.",
    command: `# Create the IAM role with trust policy (trusts EC2 service)\naws iam create-role --role-name EC2-S3-ReadOnly-Role --assume-role-policy-document file://trust_policy.json\n\n# Attach ReadOnly S3 access policy\naws iam attach-role-policy --role-name EC2-S3-ReadOnly-Role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess\n\n# Create instance profile and associate with EC2\naws iam create-instance-profile --instance-profile-name EC2-S3-Profile\naws iam add-role-to-instance-profile --instance-profile-name EC2-S3-Profile --role-name EC2-S3-ReadOnly-Role`
  },
  {
    id: 179,
    title: "What is the AWS KMS (Key Management Service) and customer managed vs AWS managed keys?",
    category: "aws",
    difficulty: "easy",
    answer: "AWS Key Management Service (KMS) manages cryptographic keys used to encrypt data at rest across AWS services (EBS, RDS, S3).\n• AWS Managed Keys: Created and managed automatically by AWS on your behalf. They are free, but their key policies cannot be modified, and they cannot be shared across AWS accounts.\n• Customer Managed Keys (CMKs): Created by you. You have full control over their key policies, rotation schedules, and cross-account access. They cost $1/key/month.",
    command: `# List KMS keys in your AWS account\naws kms list-keys\n\n# Create a new Customer Managed Key\naws kms create-key --description "My Database Backup Key"`
  },

  // ==========================================
  // MEDIUM QUESTIONS (13 new, IDs 180 to 192)
  // ==========================================
  {
    id: 180,
    title: "How to configure VPC Peering between two separate Virtual Private Clouds?",
    category: "aws",
    difficulty: "medium",
    answer: "VPC Peering connects two VPCs, allowing resources in either network to communicate using private IP addresses. It does not support transitive routing (e.g. if A is peered to B, and B to C, A cannot access C without a direct peer).\n\nSetup Steps:\n1. Send a Peering Connection Request from the requester VPC to the accepter VPC.\n2. Accept the Peering Request in the accepter VPC.\n3. Add routes in the route tables of both VPCs pointing to the peering connection ID (pcx-xxxx) for the destination CIDR block.",
    command: `# Create VPC Peering connection request\naws ec2 create-vpc-peering-connection \\\n  --vpc-id vpc-01111111111111111 (Requester) \\\n  --peer-vpc-id vpc-02222222222222222 (Accepter)\n\n# Accept the peering connection request\naws ec2 accept-vpc-peering-connection \\\n  --vpc-peering-connection-id pcx-0123456789abcdef0`
  },
  {
    id: 181,
    title: "Writing a secure IAM Policy in JSON restricting S3 bucket access",
    category: "aws",
    difficulty: "medium",
    answer: "IAM policies define permissions. Always write policies adhering to the Principle of Least Privilege. Specify exactly which actions are allowed on which resources, and use condition keys (like source IP addresses) to restrict access.",
    command: `# Put a bucket policy to restrict access to a specific IP address\naws s3api put-bucket-policy --bucket secure-data-bucket --policy file://policy.json\n\n# Contents of policy.json:\n# {\n#   "Version": "2012-10-17",\n#   "Statement": [\n#     {\n#       "Effect": "Deny",\n#       "Principal": "*",\n#       "Action": "s3:*",\n#       "Resource": [\n#         "arn:aws:s3:::secure-data-bucket",\n#         "arn:aws:s3:::secure-data-bucket/*"\n#       ],\n#       "Condition": {\n#         "NotIpAddress": {"aws:SourceIp": "192.168.1.0/24"}\n#       }\n#     }\n#   ]\n# }`
  },
  {
    id: 182,
    title: "Configuring EC2 Auto Scaling Groups and scaling policies",
    category: "aws",
    difficulty: "medium",
    answer: "Auto Scaling Groups (ASG) dynamically scale the number of EC2 instances up or down based on resource demands.\n\nKey parameters:\n• Launch Template: Defines the AMI, instance type, security groups, and key pairs to use when launching new instances.\n• Min, Max, and Desired Capacity: Restricts the scale limits.\n• Target Tracking Scaling Policy: Adjusts instances dynamically to keep a metric (like average CPU utilization) at a target percentage (e.g. keep CPU at 60%).",
    command: `# Create a scaling policy using CPU target tracking\naws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name my-web-asg \\\n  --policy-name cpu-60-tracking-policy \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration file://scaling_config.json\n\n# Contents of scaling_config.json:\n# {\n#   "TargetValue": 60.0,\n#   "PredefinedMetricSpecification": {\n#     "PredefinedMetricType": "ASGAverageCPUUtilization"\n#   }\n# }`
  },
  {
    id: 183,
    title: "AWS CloudFront CDN: Origin Access Control (OAC) vs Origin Access Identity (OAI)",
    category: "aws",
    difficulty: "medium",
    answer: "To secure a static website hosted in S3, bypass direct public S3 URLs and force users to access the site through CloudFront. This allows you to enforce SSL, geoblocking, and caching benefits.\n\nOrigin Access Identity (OAI) vs Origin Access Control (OAC):\n• OAI: Legacy method. It restricts S3 bucket access to a specific CloudFront identity, but it does not support SSE-KMS encryption or modern S3 upload techniques.\n• OAC: Modern, recommended method. It supports KMS encryption, POST requests, and offers improved security settings.",
    command: `# Describe CloudFront distribution details\naws cloudfront list-distributions`
  },
  {
    id: 184,
    title: "Managing secrets securely using AWS Systems Manager (SSM) Parameter Store",
    category: "aws",
    difficulty: "medium",
    answer: "Avoid committing database credentials or API keys directly to git repositories. Store them securely in AWS Systems Manager (SSM) Parameter Store as SecureString parameters, encrypted using AWS KMS. Applications can retrieve them dynamically using the AWS SDK.",
    command: `# Store database password securely in Parameter Store\naws ssm put-parameter \\\n  --name "/prod/database/password" \\\n  --value "SuperSecretPassword123" \\\n  --type "SecureString" \\\n  --key-id "alias/aws/ssm" \\\n  --overwrite\n\n# Retrieve decrypted password\naws ssm get-parameter \\\n  --name "/prod/database/password" \\\n  --with-decryption \\\n  --query "Parameter.Value" \\\n  --output text`
  },
  {
    id: 185,
    title: "How to configure S3 Bucket CORS (Cross-Origin Resource Sharing)?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Origin Resource Sharing (CORS) defines rules allowing web applications running in one domain to access assets (like images or JSON files) hosted in a different domain (an S3 bucket). By default, browsers block these cross-origin requests for security reasons.",
    command: `# Apply CORS configuration to a bucket\naws s3api put-bucket-cors \\\n  --bucket my-assets-bucket \\\n  --cors-configuration file://cors.json\n\n# Contents of cors.json:\n# {\n#   "CORSRules": [\n#     {\n#       "AllowedHeaders": ["*"],\n#       "AllowedMethods": ["GET", "HEAD"],\n#       "AllowedOrigins": ["https://my-app.com"],\n#       "MaxAgeSeconds": 3000\n#     }\n#   ]\n# }`
  },
  {
    id: 186,
    title: "What is an Application Load Balancer (ALB) and path-based routing?",
    category: "aws",
    difficulty: "medium",
    answer: "An Application Load Balancer (ALB) operates at Layer 7 (Application Layer) of the OSI model. It routes incoming traffic to Target Groups (instances or containers) based on request attributes, such as HTTP headers, methods, or URL paths (e.g. route /api to API servers, and /static to asset servers).",
    command: `# Describe load balancers in your account\naws elb describe-load-balancers\n\n# List target groups configured for the load balancer\naws elds describe-target-groups`
  },
  {
    id: 187,
    title: "How to configure custom CloudWatch Alarms for EC2 Disk Space usage?",
    category: "aws",
    difficulty: "medium",
    answer: "By default, AWS cannot see the internal state of your EC2 instances (such as memory usage or disk partition space) due to virtualization boundaries. To monitor these, install the CloudWatch Agent inside the EC2 operating system. The agent pushes metrics to CloudWatch, allowing you to create custom disk alarms.",
    command: `# Put a metric alarm on a custom metric reported by the agent\naws cloudwatch put-metric-alarm \\\n  --alarm-name "High-Disk-Usage-Alarm" \\\n  --metric-name disk_used_percent \\\n  --namespace CWAgent \\\n  --statistic Average \\\n  --period 300 \\\n  --evaluation-periods 2 \\\n  --threshold 85 \\\n  --comparison-operator GreaterThanOrEqualToThreshold \\\n  --dimensions Name=InstanceId,Value=i-0482ac8c21 Name=path,Value=/ \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:admin-alerts`
  },
  {
    id: 188,
    title: "Difference between NAT Gateway and NAT Instance in AWS",
    category: "aws",
    difficulty: "medium",
    answer: "Both allow instances in private subnets to connect to the internet while blocking incoming connections:\n• NAT Instance: A virtual machine configured to perform NAT. It is managed by you. It does not scale automatically and represents a single point of failure unless configured in an HA pair.\n• NAT Gateway: A managed AWS service. It scales automatically, provides high availability within an AZ, and supports bandwidth up to 45 Gbps. It requires no maintenance but incurs higher hourly and data processing fees.",
    command: `# Describe active NAT gateways in your VPC\naws ec2 describe-nat-gateways`
  },
  {
    id: 189,
    title: "DynamoDB read/write capacity modes: On-Demand vs Provisioned Capacity",
    category: "aws",
    difficulty: "medium",
    answer: "DynamoDB charges based on read/write throughput and storage:\n• Provisioned Capacity Mode: You specify the exact Read Capacity Units (RCU) and Write Capacity Units (WCU) your application requires. You can configure auto-scaling. It is cost-effective for predictable workloads.\n• On-Demand Mode: DynamoDB scales throughput automatically to handle traffic spikes. You pay exactly for the requests you make (no capacity planning needed). It is best for unpredictable or low-traffic workloads.",
    command: `# Create a DynamoDB table with Provisioned Capacity (5 RCU, 5 WCU)\naws dynamodb create-table \\\n  --table-name Users \\\n  --attribute-definitions AttributeName=UserId,AttributeType=S \\\n  --key-schema AttributeName=UserId,KeyType=HASH \\\n  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5`
  },
  {
    id: 190,
    title: "How to configure cross-region replication (CRR) in Amazon S3?",
    category: "aws",
    difficulty: "medium",
    answer: "Cross-Region Replication (CRR) replicates S3 objects automatically from a source bucket in one region to a destination bucket in a different region. This is useful for disaster recovery or compliance requirements.\n\nPrerequisites:\n• Both source and destination buckets must have Versioning enabled.\n• An IAM Role must be configured to grant S3 permissions to replicate objects across regions.",
    command: `# Enable versioning on source bucket\naws s3api put-bucket-versioning \\\n  --bucket source-bucket \\\n  --versioning-configuration Status=Enabled\n\n# Enable versioning on destination bucket\naws s3api put-bucket-versioning \\\n  --bucket destination-bucket \\\n  --versioning-configuration Status=Enabled`
  },
  {
    id: 191,
    title: "What is Amazon RDS database backup and retention policy management?",
    category: "aws",
    difficulty: "medium",
    answer: "Amazon RDS automates database backups. By default, it takes a daily full snapshot and archives database transaction logs (transaction logs are updated every 5 minutes), allowing Point-In-Time Recovery (PITR) to any second within the retention period (default 7 days, max 35 days). Disabling backups (setting retention to 0) deletes all automated snapshots.",
    command: `# Modify RDS instance to increase backup retention period to 14 days\naws rds modify-db-instance \\\n  --db-instance-identifier prod-db-instance \\\n  --backup-retention-period 14 \\\n  --apply-immediately`
  },
  {
    id: 192,
    title: "How to encrypt existing unencrypted EBS volumes using KMS?",
    category: "aws",
    difficulty: "medium",
    answer: "You cannot encrypt an existing active EBS volume directly. To encrypt an unencrypted volume, follow this workaround:\n1. Create a Snapshot of the unencrypted volume.\n2. Copy the snapshot, checking the Encryption box and selecting a KMS key.\n3. Create a new EBS volume from the encrypted snapshot.\n4. Swap the old volume with the new encrypted volume.",
    command: `# 1. Create a snapshot of unencrypted volume\naws ec2 create-snapshot --volume-id vol-08ac3021\n\n# 2. Copy the snapshot, encrypting the copy with KMS\naws ec2 copy-snapshot \\\n  --source-region us-east-1 \\\n  --source-snapshot-id snap-012345 \\\n  --encrypted \\\n  --kms-key-id alias/aws/ebs`
  },

  // ==========================================
  // HARD QUESTIONS (18 new, IDs 193 to 210)
  // ==========================================
  {
    id: 193,
    title: "Designing a highly available multi-tier architecture in AWS",
    category: "aws",
    difficulty: "hard",
    answer: "A production enterprise application should be designed for high availability and disaster recovery across multiple Availability Zones (AZs):\n• Tier 1 (Presentation): Public-facing Application Load Balancers (ALBs) distributed across public subnets in multiple AZs.\n• Tier 2 (Application): Auto Scaling Groups (ASG) running instances in private subnets, managed by CPU/request target tracking policies.\n• Tier 3 (Database): Multi-AZ Amazon RDS instances in private subnets (primary in AZ-A, synchronous standby in AZ-B).\n• Security: Restrict Security Groups so database instances only accept connections from application servers, and application servers only accept connections from the ALB.",
    command: `# Describe target health of a load balancer to monitor instances across AZs\naws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/app-tg/085ac12`
  },
  {
    id: 194,
    title: "How to configure cross-account access using IAM Role Assumption?",
    category: "aws",
    difficulty: "hard",
    answer: "Cross-account access allows users in Account A (Production) to perform actions in Account B (Development) without logging in and out. This is secured using IAM Role Assumption.\n\nSteps:\n1. In Account B (Target): Create an IAM Role. The trust policy must allow Account A's root ID to assume it.\n2. In Account B: Attach permissions (e.g. read access) to the role.\n3. In Account A (Source): Create a policy allowing users to run \`sts:assume-role\` on the role ARN in Account B.",
    command: `# Assume the role in the destination account (Account B)\naws sts assume-role \\\n  --role-arn arn:aws:iam::222222222222:role/CrossAccountRDSAdminRole \\\n  --role-session-name "DBA-CrossAccountSession"\n\n# Save the returned AccessKeyId, SecretAccessKey, and SessionToken to environment variables`
  },
  {
    id: 195,
    title: "AWS Transit Gateway Architecture and Hub-and-Spoke routing configuration",
    category: "aws",
    difficulty: "hard",
    answer: "As network complexity grows, VPC peering becomes unmanageable (N*(N-1)/2 connections). AWS Transit Gateway acts as a cloud router, connecting thousands of VPCs in a hub-and-spoke model.\n\nImplementation:\n1. Create the Transit Gateway (TGW).\n2. Attach VPCs to the TGW.\n3. Configure Transit Gateway Route Tables to control traffic routing between attachments.\n4. Update individual VPC route tables to route target network CIDRs through the Transit Gateway attachment.",
    command: `# Create a Transit Gateway\naws ec2 create-transit-gateway --description "Enterprise-Central-Router"\n\n# Attach a VPC to the Transit Gateway\naws ec2 create-transit-gateway-vpc-attachment \\\n  --transit-gateway-id tgw-08acf1428a \\\n  --vpc-id vpc-08ac3024c125 \\\n  --subnet-ids subnet-01111111 subnet-02222222`
  },
  {
    id: 196,
    title: "Configuring VPC Endpoints: Gateway Endpoints vs Interface Endpoints (Privatelink)",
    category: "aws",
    difficulty: "hard",
    answer: "By default, instances in private subnets connecting to S3, DynamoDB, or AWS APIs route traffic over the internet (via a NAT Gateway). VPC Endpoints allow private connections to these services without leaving the Amazon network.\n\nGateway Endpoints:\n• Supported only for S3 and DynamoDB.\n• Free to use. They update VPC route tables directly to route target traffic through the gateway endpoint.\n\nInterface Endpoints (AWS PrivateLink):\n• Supported for all other AWS services (KMS, EC2, CloudWatch) and SaaS apps.\n• Charge an hourly fee plus data processing fees. They provision Elastic Network Interfaces (ENIs) with private IP addresses inside your subnets.",
    command: `# Create a Gateway Endpoint for Amazon S3 in your VPC\naws ec2 create-vpc-endpoint \\\n  --vpc-id vpc-08ac3024c125 \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids rtb-0123456789abcdef0`
  },
  {
    id: 197,
    title: "How to troubleshoot KMS key policy lockouts and access failures?",
    category: "aws",
    difficulty: "hard",
    answer: "If an IAM policy grants full access to KMS, but the KMS key policy does not explicitly trust the IAM user, access is denied. If you misconfigure a Customer Managed Key policy, you can lock yourself out, preventing any user (including root) from managing the key.\n\nKey rules:\n• To allow IAM policies to grant access to a key, the key policy must include a statement trusting the root account (arn:aws:iam::account-id:root).\n• If locked out, you must contact AWS Support to resolve key policy issues.",
    command: `# Get the policy configuration for a KMS key to inspect rules\naws kms get-key-policy --key-id 1234abcd-12ab-34cd-56ef-1234567890ab --policy-name default`
  },
  {
    id: 198,
    title: "AWS Organizations: Service Control Policies (SCPs) and permissions boundaries",
    category: "aws",
    difficulty: "hard",
    answer: "Service Control Policies (SCPs) manage permissions across all AWS accounts in your AWS Organization. SCPs define a boundary for the maximum permissions that can be granted. Even if an IAM user has AdministratorAccess, an SCP deny rule overrides all local policies.\n\nKey use cases:\n• Prevent child accounts from leaving the organization.\n• Restrict AWS services or regions that can be used (e.g. block launching resources outside us-east-1).\n• Block users from disabling CloudTrail or deleting S3 logs.",
    command: `# Describe Service Control Policies in your organization\naws organizations list-policies --filter SERVICE_CONTROL_POLICY`
  },
  {
    id: 199,
    title: "Lambda serverless VPC networking: cold starts and ENI scaling limits",
    category: "aws",
    difficulty: "hard",
    answer: "When a Lambda function runs inside a VPC, it can access database resources (like RDS) securely using private IP addresses. However, this has historically caused severe cold starts while Lambda provisioned an Elastic Network Interface (ENI).\n\nModern VPC Networking (AWS Hyperplane):\n• Lambda shares pre-provisioned network interfaces (Hyperplane ENIs) across functions. This reduces cold start overhead to sub-second levels.\n• Cold starts still occur if the function scale spikes rapidly, exhausting subnets' private IP capacity.",
    command: `# Create a Lambda function connected to subnets and security groups in a VPC\naws lambda create-function \\\n  --function-name my-vpc-function \\\n  --runtime nodejs18.x \\\n  --role arn:aws:iam::123456789012:role/lambda-vpc-role \\\n  --handler index.handler \\\n  --zip-file fileb://function.zip \\\n  --vpc-config SubnetIds=subnet-01111111,subnet-02222222,SecurityGroupIds=sg-08ac12`
  },
  {
    id: 200,
    title: "Configuring Route 53 Latency-Based and Failover DNS Routing Policies",
    category: "aws",
    difficulty: "hard",
    answer: "Route 53 supports advanced routing policies for global, high-performance applications:\n• Latency-Based Routing: Routes user requests to the AWS region that provides the lowest network latency.\n• Failover Routing (Active-Passive): Uses Route 53 Health Checks to monitor your primary endpoint. If the primary health check fails, Route 53 automatically redirects traffic to a passive secondary endpoint (e.g., a static S3 error site).",
    command: `# List Route 53 health checks configured in your account\naws route53 list-health-checks`
  },
  {
    id: 201,
    title: "AWS CloudFormation vs Terraform: IaC state management and drift detection",
    category: "aws",
    difficulty: "hard",
    answer: "• CloudFormation: A native AWS IaC service. It saves state files automatically and manages resources within a CloudFormation stack. It supports drift detection to find manual configuration changes made outside IaC.\n• Terraform: An open-source multi-cloud IaC tool. It saves state locally or in a remote backend (such as an S3 bucket with DynamoDB locking). Terraform uses state files to map configuration code to real-world resources.",
    command: `# Check for drift on a CloudFormation stack\naws cloudformation detect-stack-drift --stack-name production-vpc-stack\n\n# Check drift status results\naws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id 1234-abcd`
  },
  {
    id: 202,
    title: "Configuring S3 Object Lock for WORM (Write Once Read Many) Compliance",
    category: "aws",
    difficulty: "hard",
    answer: "S3 Object Lock enforces WORM (Write Once, Read Many) compliance to protect objects from deletion or modification. This is critical for regulatory audits and ransomware protection.\n\nModes:\n• Governance Mode: Users with specific IAM permissions (BypassGovernanceRetention) can override retention settings.\n• Compliance Mode: No user (including the root account) can override retention settings or delete the object during its retention window.\n• Legal Hold: Blocks deletion indefinitely. It must be manually disabled.",
    command: `# Enable legal hold on an S3 object to prevent deletion\naws s3api put-object-legal-hold \\\n  --bucket compliance-vault-bucket \\\n  --key Q4_report.pdf \\\n  --legal-hold Status=ON`
  },
  {
    id: 203,
    title: "Troubleshooting EC2 connection drops and network path analysis using Reachability Analyzer",
    category: "aws",
    difficulty: "hard",
    answer: "When an EC2 instance cannot communicate with another instance or database, check for routing issues using AWS Reachability Analyzer. It simulates network paths through security groups, NACLs, and route tables without sending actual traffic.",
    command: `# Start path analysis between source instance and database instance\naws ec2 start-network-insights-analysis \\\n  --network-insights-path-id nip-08ac30f14a`
  },
  {
    id: 204,
    title: "Tuning CloudWatch Agent configuration files on EC2 for custom log collection",
    category: "aws",
    difficulty: "hard",
    answer: "The CloudWatch Agent collects system logs and custom application logs from EC2 instances. It is configured using a JSON schema (\`amazon-cloudwatch-agent.json\`) to define which files to watch, log group structures, and rotation rules.",
    command: `# Push updated agent configuration file from Systems Manager Parameter Store\naws ssm put-parameter \\\n  --name "AmazonCloudWatch-AgentConfig" \\\n  --value file://amazon-cloudwatch-agent.json \\\n  --type "String" \\\n  --overwrite`
  },
  {
    id: 205,
    title: "Configuring cross-region read replicas for MySQL/PostgreSQL RDS",
    category: "aws",
    difficulty: "hard",
    answer: "Cross-region read replicas improve read latency for global users and serve as a disaster recovery solution.\n\nMechanics:\n• AWS uses asynchronous replication to sync changes to the secondary region.\n• During promotion, replication lag must be minimized to avoid data loss.\n• Promoting a replica breaks replication, making it a standalone primary database.",
    command: `# Create cross-region read replica in us-west-2 from us-east-1 primary\naws rds create-db-instance-read-replica \\\n  --db-instance-identifier prod-replica-west \\\n  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:prod-db-primary \\\n  --region us-west-2`
  },
  {
    id: 206,
    title: "Designing AWS RDS custom DB parameter groups for memory tuning",
    category: "aws",
    difficulty: "hard",
    answer: "Amazon RDS instances are optimized using DB Parameter Groups. You cannot edit default parameter groups; you must create a custom group, modify parameters (such as shared_buffers, work_mem, or max_connections), and apply the group to your RDS instance.",
    command: `# Create a custom parameter group for PostgreSQL 15\naws rds create-db-parameter-group \\\n  --db-parameter-group-name custom-pg15 \\\n  --db-parameter-group-family postgres15 \\\n  --description "Custom PostgreSQL 15 parameters"\n\n# Modify parameters dynamically in the group\naws rds modify-db-parameter-group \\\n  --db-parameter-group-name custom-pg15 \\\n  --parameters "ParameterName=work_mem,ParameterValue=16384,ApplyMethod=immediate"`
  },
  {
    id: 207,
    title: "Managing CloudFront cache invalidation and Cache Behaviours",
    category: "aws",
    difficulty: "hard",
    answer: "CloudFront caches content at edge locations based on Time-To-Live (TTL) settings. When you push updates to S3, users may continue to see cached, stale content until the TTL expires. To force immediate updates, create a cache invalidation request.",
    command: `# Create invalidation request to clear all files under the /assets/ path\naws cloudfront create-invalidation \\\n  --distribution-id E1234567890ABC \\\n  --paths "/assets/*"`
  },
  {
    id: 208,
    title: "Troubleshooting Amazon EKS (Kubernetes) Node Joining and Cluster Autoscaler issues",
    category: "aws",
    difficulty: "hard",
    answer: "When worker nodes fail to join an EKS cluster, check the node's bootstrap logs. Common causes include:\n• Missing or misconfigured IAM Roles in the aws-auth ConfigMap.\n• Worker nodes cannot communicate with the EKS control plane due to security group rules or route issues in private subnets.",
    command: `# Retrieve active Kubernetes auth config map from EKS\naws eks update-kubeconfig --name production-cluster\nkubectl get configmap aws-auth -n kube-system -o yaml`
  },
  {
    id: 209,
    title: "AWS API Gateway: Private integration with VPC Link to internal load balancers",
    category: "aws",
    difficulty: "hard",
    answer: "To expose internal backend services (running on ECS or EC2 behind a private ALB) securely, use API Gateway with a VPC Link. This routes traffic from public API Gateway endpoints directly to private VPC resources without exposing them to the internet.",
    command: `# List active VPC links configured in API Gateway\naws apigatewayv2 get-vpc-links`
  },
  {
    id: 210,
    title: "Tuning AWS DynamoDB Global Tables and Multi-Region Replication Conflict Resolution",
    category: "aws",
    difficulty: "hard",
    answer: "DynamoDB Global Tables provide active-active multi-region replication. DynamoDB replicates data updates automatically across all participant regions.\n\nConflict Resolution:\n• DynamoDB uses Last-Write-Wins (LWW) conflict resolution based on timestamps. The region with the latest update timestamp wins conflicts.",
    command: `# Update an existing table to enable global replication to us-west-2\naws dynamodb update-table \\\n  --table-name Users \\\n  --replica-updates "Create={RegionName=us-west-2}"`
  }
];
