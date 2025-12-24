# OpenShift Deployment Instructions - Event Scheduling System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Troubleshooting](#troubleshooting)
5. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Prerequisites

### 1. OpenShift CLI (oc)
Download and install the OpenShift CLI:
- **Windows**: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-windows.zip
- **Mac**: `brew install openshift-cli`
- **Linux**: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-linux.tar.gz

Verify installation:
```bash
oc version
```

### 2. OpenShift Cluster Access
You need access to an OpenShift cluster. Options:
- **Red Hat Developer Sandbox** (Free): https://developers.redhat.com/developer-sandbox
- **Your organization's cluster**
- **Local: CodeReady Containers (CRC)**

### 3. Docker Images on DockerHub
Your images should already be on DockerHub:
- `mohamedashraffahmy/event-scheduling-frontend:latest`
- `mohamedashraffahmy/event-scheduling-backend:latest`
- `mohamedashraffahmy/event-scheduling-postgres:latest`

---

## Understanding the Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPENSHIFT CLUSTER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │    Route     │     │    Route     │     │              │    │
│  │  (Frontend)  │     │  (Backend)   │     │              │    │
│  │   HTTPS      │     │   HTTPS      │     │              │    │
│  └──────┬───────┘     └──────┬───────┘     │              │    │
│         │                    │             │              │    │
│  ┌──────▼───────┐     ┌──────▼───────┐     │              │    │
│  │   Service    │     │   Service    │     │   Service    │    │
│  │  (Frontend)  │     │  (Backend)   │     │  (Database)  │    │
│  │   :8080      │     │   :3000      │     │   :5432      │    │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘    │
│         │                    │                    │            │
│  ┌──────▼───────┐     ┌──────▼───────┐     ┌──────▼───────┐    │
│  │  Deployment  │     │  Deployment  │     │  Deployment  │    │
│  │   (nginx)    │────▶│  (Node.js)   │────▶│ (PostgreSQL) │    │
│  │              │     │              │     │              │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                   │            │
│                                            ┌──────▼───────┐    │
│                                            │     PVC      │    │
│                                            │  (Storage)   │    │
│                                            └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Components Explained:

| Component | Purpose | Why Needed |
|-----------|---------|------------|
| **Namespace** | Isolates your app from others | Security & organization |
| **Secrets** | Stores passwords, keys | Security - keeps sensitive data encrypted |
| **ConfigMap** | Stores configuration | Separates config from code |
| **PVC** | Persistent storage | Database data survives restarts |
| **Deployment** | Manages pods | Auto-restart, scaling, updates |
| **Service** | Internal networking | Stable DNS names for pods |
| **Route** | External access | HTTPS URLs for users |

---

## Step-by-Step Deployment

### Step 1: Login to OpenShift

#### Option A: Via Web Console
1. Go to your OpenShift web console
2. Click your username (top right) → "Copy login command"
3. Click "Display Token"
4. Copy and run the `oc login` command

#### Option B: Direct Login
```bash
oc login <cluster-url> -u <username> -p <password>
```

**Example for Developer Sandbox:**
```bash
oc login --token=sha256~xxxxx --server=https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443
```

### Step 2: Check Your Project/Namespace

```bash
# List your projects
oc projects

# Switch to your project (Developer Sandbox assigns one automatically)
oc project <your-username>-dev
```

**IMPORTANT**: If you're on Developer Sandbox, you cannot create new namespaces. You must use your assigned project. Update all YAML files:

```bash
# Replace 'event-scheduling' with your project name in all files
# On Windows (PowerShell):
(Get-Content *.yaml) -replace 'namespace: event-scheduling', 'namespace: YOUR-PROJECT-NAME' | Set-Content *.yaml

# On Linux/Mac:
sed -i 's/namespace: event-scheduling/namespace: YOUR-PROJECT-NAME/g' *.yaml
```

### Step 3: Deploy Using Script

**Windows (Command Prompt):**
```cmd
cd openshift
deploy.bat
```

**Linux/Mac/Git Bash:**
```bash
cd openshift
chmod +x deploy.sh
./deploy.sh
```

### Step 4: Manual Deployment (Alternative)

If the script fails, deploy manually in this order:

```bash
# 1. Secrets (must be first - other resources depend on it)
oc apply -f 02-secrets.yaml

# 2. ConfigMaps
oc apply -f 03-configmap.yaml
oc apply -f 04-nginx-configmap.yaml

# 3. Database storage
oc apply -f 05-database-pvc.yaml

# 4. Database (wait for it to be ready)
oc apply -f 06-database-deployment.yaml
oc apply -f 07-database-service.yaml
oc get pods -w  # Wait until database pod is Running

# 5. Backend
oc apply -f 08-backend-deployment.yaml
oc apply -f 09-backend-service.yaml
oc get pods -w  # Wait until backend pod is Running

# 6. Frontend
oc apply -f 10-frontend-deployment.yaml
oc apply -f 11-frontend-service.yaml

# 7. Routes (external access)
oc apply -f 12-routes.yaml
```

### Step 5: Verify Deployment

```bash
# Check all pods are running
oc get pods

# Expected output:
# NAME                                          READY   STATUS    RESTARTS   AGE
# event-scheduling-db-xxx                       1/1     Running   0          5m
# event-scheduling-backend-xxx                  1/1     Running   0          3m
# event-scheduling-frontend-xxx                 1/1     Running   0          2m

# Get your application URLs
oc get routes

# Expected output:
# NAME                        HOST/PORT                                                    
# event-scheduling-frontend   event-scheduling-frontend-xxx.apps.cluster.com
# event-scheduling-backend    event-scheduling-backend-xxx.apps.cluster.com
```

### Step 6: Access Your Application

Open the frontend URL in your browser:
```
https://event-scheduling-frontend-<namespace>.apps.<cluster-domain>
```

---

## Troubleshooting

### Check Pod Status
```bash
oc get pods
```

Status meanings:
- `Running` ✅ - Pod is healthy
- `Pending` - Waiting for resources
- `CrashLoopBackOff` - Container keeps crashing
- `ImagePullBackOff` - Can't pull Docker image
- `CreateContainerError` - Container creation failed

### View Pod Logs
```bash
# View logs for a specific pod
oc logs <pod-name>

# Follow logs in real-time
oc logs -f <pod-name>

# View logs for a deployment
oc logs -f deployment/event-scheduling-backend
```

### Describe Pod (Detailed Info)
```bash
oc describe pod <pod-name>
```

### Common Debugging Commands
```bash
# Get events (shows recent cluster activity)
oc get events --sort-by='.lastTimestamp'

# Execute command in pod
oc exec -it <pod-name> -- /bin/sh

# Check service endpoints
oc get endpoints

# Check PVC status
oc get pvc
```

---

## Common Issues and Solutions

### Issue 1: "Namespace forbidden" Error
**Cause**: You don't have permission to create namespaces (common on shared clusters)

**Solution**: Use your assigned project
```bash
oc projects  # List available projects
oc project <your-project>  # Switch to it
# Update namespace in all YAML files
```

### Issue 2: Database CrashLoopBackOff
**Cause**: PostgreSQL permission issues with PGDATA directory

**Solution**: Ensure PGDATA is set to a subdirectory:
```yaml
env:
  - name: PGDATA
    value: /var/lib/postgresql/data/pgdata
```

### Issue 3: Frontend CrashLoopBackOff (Port 80)
**Cause**: OpenShift doesn't allow containers to bind to ports < 1024

**Solution**: Use nginx-unprivileged image on port 8080 (already configured)

### Issue 4: ImagePullBackOff
**Cause**: Can't pull image from DockerHub

**Solutions**:
1. Check image name is correct
2. If private repo, create image pull secret:
```bash
oc create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username=<username> \
  --docker-password=<password>
oc secrets link default dockerhub-secret --for=pull
```

### Issue 5: Backend Can't Connect to Database
**Cause**: Database not ready or wrong connection string

**Solutions**:
1. Check database is running: `oc get pods`
2. Check service exists: `oc get svc event-scheduling-db`
3. Check environment variables: `oc describe pod <backend-pod>`

### Issue 6: CORS Errors in Browser
**Cause**: Backend rejecting requests from frontend domain

**Solution**: Update CORS_ORIGIN in backend deployment:
```yaml
- name: CORS_ORIGIN
  value: "https://event-scheduling-frontend-xxx.apps.cluster.com"
```

---

## Cleanup

To remove all deployed resources:
```bash
cd openshift
oc delete -f .
```

Or delete specific resources:
```bash
oc delete deployment event-scheduling-frontend
oc delete deployment event-scheduling-backend
oc delete deployment event-scheduling-db
oc delete svc event-scheduling-frontend event-scheduling-backend event-scheduling-db
oc delete route event-scheduling-frontend event-scheduling-backend
oc delete pvc event-scheduling-db-pvc
oc delete secret event-scheduling-db-secret
oc delete configmap event-scheduling-config nginx-config
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `oc get pods` | List all pods |
| `oc get svc` | List all services |
| `oc get routes` | List all routes (URLs) |
| `oc logs <pod>` | View pod logs |
| `oc describe pod <pod>` | Detailed pod info |
| `oc delete pod <pod>` | Delete pod (will restart) |
| `oc scale deployment/<name> --replicas=2` | Scale deployment |
| `oc rollout restart deployment/<name>` | Restart deployment |
