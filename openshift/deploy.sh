#!/bin/bash
# ============================================
# Event Scheduling System - OpenShift Deployment Script (Linux/Mac/Git Bash)
# ============================================
# This script deploys all components in the correct order
# Prerequisites: oc CLI installed and logged in
# ============================================

set -e  # Exit on error

echo "=========================================="
echo "Event Scheduling System - OpenShift Deployment"
echo "=========================================="
echo ""

# Check if oc is installed
if ! command -v oc &> /dev/null; then
    echo "ERROR: oc CLI is not installed or not in PATH"
    echo "Please install OpenShift CLI from: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/"
    exit 1
fi

# Check if logged in
if ! oc whoami &> /dev/null; then
    echo "ERROR: Not logged in to OpenShift"
    echo "Please run: oc login <cluster-url> -u <username> -p <password>"
    exit 1
fi

echo "[1/8] Creating namespace (or switching to existing project)..."
oc apply -f 01-namespace.yaml 2>/dev/null || oc project event-scheduling 2>/dev/null || {
    echo "WARNING: Could not create namespace. You may need to use your assigned project."
    echo "Please update the namespace in all YAML files to match your project name."
    read -p "Enter your project name: " PROJECT_NAME
    oc project "$PROJECT_NAME"
}
echo ""

echo "[2/8] Creating secrets..."
oc apply -f 02-secrets.yaml
echo ""

echo "[3/8] Creating ConfigMaps..."
oc apply -f 03-configmap.yaml
oc apply -f 04-nginx-configmap.yaml
echo ""

echo "[4/8] Creating Persistent Volume Claim for database..."
oc apply -f 05-database-pvc.yaml
echo ""

echo "[5/8] Deploying database..."
oc apply -f 06-database-deployment.yaml
oc apply -f 07-database-service.yaml
echo "Waiting for database to be ready (this may take 1-2 minutes)..."
sleep 30
oc wait --for=condition=available deployment/event-scheduling-db --timeout=120s || true
echo ""

echo "[6/8] Deploying backend..."
oc apply -f 08-backend-deployment.yaml
oc apply -f 09-backend-service.yaml
echo "Waiting for backend to be ready..."
sleep 15
oc wait --for=condition=available deployment/event-scheduling-backend --timeout=120s || true
echo ""

echo "[7/8] Deploying frontend..."
oc apply -f 10-frontend-deployment.yaml
oc apply -f 11-frontend-service.yaml
echo "Waiting for frontend to be ready..."
sleep 15
oc wait --for=condition=available deployment/event-scheduling-frontend --timeout=120s || true
echo ""

echo "[8/8] Creating routes..."
oc apply -f 12-routes.yaml
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Getting route URLs..."
echo ""
echo "Frontend URL:"
echo "https://$(oc get route event-scheduling-frontend -o jsonpath='{.spec.host}')"
echo ""
echo "Backend API URL:"
echo "https://$(oc get route event-scheduling-backend -o jsonpath='{.spec.host}')"
echo ""
echo "=========================================="
echo "Useful Commands:"
echo "=========================================="
echo "Check pod status:    oc get pods"
echo "View pod logs:       oc logs -f deployment/event-scheduling-backend"
echo "Describe pod:        oc describe pod <pod-name>"
echo "Delete all:          oc delete -f ."
echo "=========================================="
