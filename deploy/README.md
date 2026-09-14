# Production Deployment & Infrastructure Guide

This directory contains the production-grade deployment configurations for the Rental Platform, including containerization, Kubernetes manifests, Helm v3 charts, zero-trust network policies, and automated cloud cost hibernation.

---

## 1. System Architecture

```
                                  [ Internet / Users ]
                                           │
                                           ▼
                             [ Ingress Controller (NGINX + TLS) ]
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     │ (path: /)                                 │ (path: /webhook)
                     ▼                                           ▼
        [ Web Deployment (HPA: 2-10) ]                [ n8n Workflow Engine ]
        (Next.js Standalone, UID 1001)                (Persistent Storage: 10Gi)
                     │                                           │
                     ├─────────────────────┬─────────────────────┤
                     │                     │                     │
                     ▼                     ▼                     ▼
             [ Redis Cache ]       [ Exa Web Search ]    [ External Rental APIs ]
         (Persistent Storage: 5Gi)  (Real-time Crawl)     (Apartments, Zillow, etc.)
```

### Key Components:
- **Web Service**: High-availability Next.js application built with multi-stage Alpine container, running unprivileged (`UID 1001`), with Horizontal Pod Autoscaler (2-10 replicas) and Pod Disruption Budget (`minAvailable: 2`).
- **Redis Cache & Broker**: In-memory caching with append-only persistence (`AOF`) and 5Gi PVC for ultra-fast query deduplication and crawler rate limiting.
- **n8n Automation Engine**: Self-hosted workflow automation service running on port 5678 with 10Gi PVC, handling distributed scraping, webhook triggers, and data normalization.
- **Ingress with TLS**: NGINX Ingress Controller with automated TLS termination via cert-manager.
- **Zero-Trust Network Policy**: Default isolation permitting only required inter-pod communications and outbound crawler egress.
- **Cloud Cost Hibernation**: Automated CronJobs that scale workloads to 0 replicas during off-peak hours and wake them before business hours, saving 60-70% on cloud compute bills.

---

## 2. Docker Containerization

The multi-stage `Dockerfile` uses Node 20 Alpine with dependency caching, build optimization, and a minimal runtime footprint.

### Build Image
```bash
docker build -t rental-platform:latest .
```

### Run Locally
```bash
docker run -d \
  --name rental-platform \
  -p 3000:3000 \
  -e NODE_ENV=production \
  rental-platform:latest
```

### Health Check
```bash
curl -I http://localhost:3000/api/health
```

---

## 3. Kubernetes Deployment (Kustomize)

Deploy the full stack directly to any Kubernetes cluster (EKS, GKE, AKS, or minikube):

```bash
# Preview generated manifests
kubectl kustomize deploy/k8s/

# Apply all manifests
kubectl apply -k deploy/k8s/

# Verify running resources
kubectl get pods,svc,ingress,hpa,cronjobs -n rental-platform
```

---

## 4. Helm v3 Deployment

The Helm chart in `deploy/helm/rental-platform` provides parameterized, production-ready release management.

### Lint Chart
```bash
helm lint deploy/helm/rental-platform/
```

### Dry Run Template
```bash
helm template rental-platform deploy/helm/rental-platform/ \
  --namespace rental-platform \
  --debug
```

### Install / Upgrade Release
```bash
helm upgrade --install rental-platform deploy/helm/rental-platform/ \
  --namespace rental-platform \
  --create-namespace \
  --values deploy/helm/rental-platform/values.yaml
```

### Custom Overrides Example
```bash
helm upgrade --install rental-platform deploy/helm/rental-platform/ \
  --namespace rental-platform \
  --set replicaCount=5 \
  --set hibernation.enabled=true \
  --set secrets.exaApiKey="YOUR_EXA_KEY"
```

---

## 5. Cloud Cost Hibernation ("Sleep / Wake")

To optimize cloud infrastructure costs during off-hours, scheduled CronJobs manage cluster scaling:

### Schedules
- **Sleep Schedule**: `0 22 * * *` (Every night at 22:00 UTC)
  - Scales `rental-platform-web` and `rental-platform-n8n` to 0 replicas.
  - Node autoscalers (Karpenter / Cluster Autoscaler) consolidate and shut down idle EC2/Compute nodes.
  - Redis state and n8n workflows remain completely preserved on their respective Persistent Volume Claims.
- **Wake Schedule**: `0 6 * * 1-5` (Monday through Friday at 06:00 UTC)
  - Restores `rental-platform-web` to 3 replicas (or configured capacity) and `rental-platform-n8n` to 1 replica.
  - Ready for business traffic prior to peak morning search hours.

### Manual Triggers (Testing)
To trigger an immediate sleep or wake cycle on demand:

```bash
# Trigger Sleep Now
kubectl create job --from=cronjob/rental-platform-hibernate-sleep manual-sleep-$(date +%s) -n rental-platform

# Trigger Wake Now
kubectl create job --from=cronjob/rental-platform-hibernate-wake manual-wake-$(date +%s) -n rental-platform
```

---

## 6. Security Hardening Checklist

- [x] Non-root container execution (`UID 1001:1001`).
- [x] Dropped all Linux capabilities (`drop: [ALL]`).
- [x] Read-only / restricted privilege escalation disabled (`allowPrivilegeEscalation: false`).
- [x] Zero-trust `NetworkPolicy` restricting ingress to reverse-proxy and egress to allowed HTTPS ports.
- [x] Hardened HTTP headers in `server.js` (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, HSTS).
- [x] Graceful shutdown handling (`SIGTERM`, `SIGINT`) with in-flight connection draining.
- [x] Production liveness and readiness health probe endpoints at `/api/health`.
