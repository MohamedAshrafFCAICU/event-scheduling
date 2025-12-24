@echo off
REM ============================================
REM Event Scheduling System - OpenShift Deployment Script (Windows)
REM ============================================
REM This script deploys all components in the correct order
REM Prerequisites: oc CLI installed and logged in
REM ============================================

echo ==========================================
echo Event Scheduling System - OpenShift Deployment
echo ==========================================
echo.

REM Check if oc is installed
where oc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: oc CLI is not installed or not in PATH
    echo Please install OpenShift CLI from: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
    exit /b 1
)

REM Check if logged in
oc whoami >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Not logged in to OpenShift
    echo Please run: oc login ^<cluster-url^> -u ^<username^> -p ^<password^>
    exit /b 1
)

echo [1/8] Creating namespace (or switching to existing project)...
oc apply -f 01-namespace.yaml 2>nul || oc project event-scheduling 2>nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: Could not create namespace. You may need to use your assigned project.
    echo Please update the namespace in all YAML files to match your project name.
    set /p PROJECT_NAME="Enter your project name: "
    oc project %PROJECT_NAME%
)
echo.

echo [2/8] Creating secrets...
oc apply -f 02-secrets.yaml
echo.

echo [3/8] Creating ConfigMaps...
oc apply -f 03-configmap.yaml
oc apply -f 04-nginx-configmap.yaml
echo.

echo [4/8] Creating Persistent Volume Claim for database...
oc apply -f 05-database-pvc.yaml
echo.

echo [5/8] Deploying database...
oc apply -f 06-database-deployment.yaml
oc apply -f 07-database-service.yaml
echo Waiting for database to be ready (this may take 1-2 minutes)...
timeout /t 30 /nobreak >nul
oc wait --for=condition=available deployment/event-scheduling-db --timeout=120s
echo.

echo [6/8] Deploying backend...
oc apply -f 08-backend-deployment.yaml
oc apply -f 09-backend-service.yaml
echo Waiting for backend to be ready...
timeout /t 15 /nobreak >nul
oc wait --for=condition=available deployment/event-scheduling-backend --timeout=120s
echo.

echo [7/8] Deploying frontend...
oc apply -f 10-frontend-deployment.yaml
oc apply -f 11-frontend-service.yaml
echo Waiting for frontend to be ready...
timeout /t 15 /nobreak >nul
oc wait --for=condition=available deployment/event-scheduling-frontend --timeout=120s
echo.

echo [8/8] Creating routes...
oc apply -f 12-routes.yaml
echo.

echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Getting route URLs...
echo.
echo Frontend URL:
oc get route event-scheduling-frontend -o jsonpath="{.spec.host}"
echo.
echo.
echo Backend API URL:
oc get route event-scheduling-backend -o jsonpath="{.spec.host}"
echo.
echo.
echo ==========================================
echo Useful Commands:
echo ==========================================
echo Check pod status:    oc get pods
echo View pod logs:       oc logs -f deployment/event-scheduling-backend
echo Describe pod:        oc describe pod ^<pod-name^>
echo Delete all:          oc delete -f .
echo ==========================================
