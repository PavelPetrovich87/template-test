# Cloud Infrastructure Skill

> **Purpose:** Designing scalable, cost-effective, and secure cloud architectures with Infrastructure as Code principles.

---

## 1. Architecture Decision Framework

### Before ANY infrastructure decision, answer:
```
1. What is the expected load? (requests/sec, concurrent users)
2. What is the availability requirement? (99.9%, 99.99%)
3. What is the data residency requirement? (regions, compliance)
4. What is the budget constraint? (monthly, yearly)
5. What is the team's operational capacity? (managed vs self-hosted)
```

### Decision Matrix
| Requirement | Lean Towards |
| :--- | :--- |
| Rapid iteration | Serverless (Lambda, Cloud Functions) |
| Predictable high load | Containers (ECS, Cloud Run, K8s) |
| Stateful workloads | VMs or dedicated instances |
| Cost optimization | Spot/Preemptible instances |
| Zero ops overhead | Fully managed services |

---

## 2. Infrastructure as Code (IaC) Standards

### Tool Selection
```
Terraform → Multi-cloud, complex infrastructure
Pulumi → TypeScript-native teams
CloudFormation → AWS-only, tight integration
CDK → AWS with programming language preference
```

### IaC Principles
1. **Idempotency:** Running twice produces same result
2. **Version Control:** All infrastructure in Git
3. **Modular Design:** Reusable modules for common patterns
4. **State Management:** Remote state with locking (S3 + DynamoDB)

### Directory Structure
```
infrastructure/
├── modules/
│   ├── vpc/
│   ├── database/
│   └── compute/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── shared/
    └── backend.tf
```

---

## 3. Compute Architecture Patterns

### Pattern A: Serverless Functions
**Use when:** Event-driven, variable load, <15min execution
```yaml
# Example: API Gateway + Lambda
Trigger: HTTP Request
Function: Stateless handler
Scaling: Automatic (0 to 1000s)
Cost: Pay per invocation
```

### Pattern B: Container Services
**Use when:** Consistent load, longer processes, microservices
```yaml
# Example: ECS/Fargate or Cloud Run
Container: Docker image
Scaling: Target tracking (CPU/Memory)
Cost: Pay for allocated resources
Networking: VPC integration
```

### Pattern C: Kubernetes
**Use when:** Complex orchestration, multi-team, hybrid cloud
```yaml
# Example: EKS/GKE/AKS
Orchestration: Declarative deployments
Scaling: HPA, VPA, Cluster Autoscaler
Networking: Service mesh optional
Complexity: HIGH - requires dedicated expertise
```

---

## 4. Database Infrastructure

### Selection Criteria
| Workload | Recommended |
| :--- | :--- |
| Relational, ACID | RDS PostgreSQL, Cloud SQL |
| Document store | MongoDB Atlas, DynamoDB |
| Key-value, cache | ElastiCache Redis, Memorystore |
| Time-series | TimescaleDB, InfluxDB |
| Search | OpenSearch, Elasticsearch |

### High Availability Configuration
```
Primary-Replica Setup:
├── Primary (writes) ──→ Region A, AZ 1
├── Replica (reads)  ──→ Region A, AZ 2
└── Replica (reads)  ──→ Region A, AZ 3

Cross-Region (disaster recovery):
└── Async Replica   ──→ Region B
```

### Backup Strategy
```
RPO (Recovery Point Objective): How much data can you lose?
├── Continuous: Point-in-time recovery (PITR)
├── Hourly: Automated snapshots
└── Daily: Cross-region backup copies

RTO (Recovery Time Objective): How fast must you recover?
├── <1 min: Multi-AZ failover
├── <15 min: Automated snapshot restore
└── <1 hour: Cross-region restore
```

---

## 5. Networking Architecture

### VPC Design
```
VPC CIDR: 10.0.0.0/16 (65,536 IPs)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   └── Load Balancers, NAT Gateways, Bastion
├── Private Subnets (10.0.10.0/24, 10.0.11.0/24)
│   └── Application servers, Containers
└── Data Subnets (10.0.20.0/24, 10.0.21.0/24)
    └── Databases, Cache (no internet access)
```

### Security Groups Strategy
```
Layer 1: ALB Security Group
├── Inbound: 443 from 0.0.0.0/0
└── Outbound: App port to App SG

Layer 2: Application Security Group
├── Inbound: App port from ALB SG only
└── Outbound: DB port to DB SG

Layer 3: Database Security Group
├── Inbound: DB port from App SG only
└── Outbound: None (stateful responses allowed)
```

---

## 6. Cost Optimization

### Immediate Wins
- [ ] Right-size instances (analyze CPU/Memory utilization)
- [ ] Use Reserved Instances for stable workloads (1-3 year)
- [ ] Spot Instances for fault-tolerant workloads
- [ ] Delete unused resources (EBS volumes, old snapshots)
- [ ] S3 lifecycle policies (move to Glacier after 90 days)

### Cost Monitoring
```
Set up:
├── Budget alerts at 50%, 80%, 100%
├── Cost allocation tags on ALL resources
├── Weekly cost review meetings
└── Anomaly detection alerts
```

### Cost Per Environment
```
Production: Full redundancy, reserved pricing
Staging: Reduced redundancy, on-demand
Development: Minimal, auto-shutdown nights/weekends
```

---

## 7. Observability Stack

### The Three Pillars
```
1. Metrics (CloudWatch, Datadog, Prometheus)
   └── CPU, Memory, Request count, Latency percentiles

2. Logs (CloudWatch Logs, ELK, Loki)
   └── Structured JSON, correlation IDs, retention policies

3. Traces (X-Ray, Jaeger, Honeycomb)
   └── Request flow across services, latency breakdown
```

### Alert Thresholds
| Metric | Warning | Critical |
| :--- | :--- | :--- |
| CPU | >70% for 5min | >90% for 5min |
| Memory | >80% | >95% |
| Error Rate | >1% | >5% |
| Latency p99 | >500ms | >2000ms |
| Disk | >70% | >85% |

---

## 8. Disaster Recovery

### DR Strategies (by RTO)
| Strategy | RTO | Cost |
| :--- | :--- | :--- |
| Backup & Restore | Hours | $ |
| Pilot Light | 10-30 min | $$ |
| Warm Standby | Minutes | $$$ |
| Active-Active | Seconds | $$$$ |

### DR Checklist
```
□ Runbook documented and tested quarterly
□ Cross-region backups verified
□ DNS failover configured
□ Team trained on DR procedures
□ Communication plan established
```

---

## 9. Specification Template for systemPatterns.md

When documenting infrastructure decisions:

```markdown
## Infrastructure: {Component Name}

### Architecture Decision
- **Pattern:** {Serverless/Container/VM}
- **Service:** {AWS Lambda, ECS, EC2, etc.}
- **Rationale:** {Why this choice}

### Configuration
- **Compute:** {Instance type, memory, CPU}
- **Scaling:** {Min/Max instances, scaling trigger}
- **Networking:** {VPC, subnets, security groups}

### Resilience
- **Availability:** {Multi-AZ, Multi-region}
- **Backup:** {Frequency, retention, cross-region}
- **Recovery:** {RTO, RPO, failover procedure}

### Cost Estimate
- **Monthly:** ${amount}
- **Scaling:** {Cost at 2x, 10x load}
```

---

## 10. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Hardcoded IPs/endpoints | Service discovery, DNS |
| Single AZ deployment | Multi-AZ minimum for production |
| No resource tagging | Tag everything for cost tracking |
| Manual infrastructure changes | IaC for all changes |
| Oversized instances "just in case" | Right-size based on actual metrics |
| No backup testing | Regular restore drills |

