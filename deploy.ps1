# ============================================================
# AdaptiveEd — Fresh GCP Project Creation & Cloud Run Deployment
# ============================================================
# Run this script in PowerShell from the project root directory.
# Prerequisites: gcloud CLI installed and authenticated (gcloud auth login)
# ============================================================

$ErrorActionPreference = "Stop"

# --- Configuration ---
# To avoid hitting project quotas, let's use a consistent name if possible, 
# but keep the random suffix for "freshness".
$PROJECT_ID     = "adaptived-$(Get-Random -Minimum 10000 -Maximum 99999)"
$SERVICE_NAME   = "adaptived"
$REGION         = "us-central1"
$BILLING_ACCOUNT = "017640-6C7464-4F3915"  # Automatically set from your input
$API_KEY        = "AIzaSyBiKDxAp2g7LFMN0mWDrC-6xBYW7WCg0YA"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " AdaptiveEd Deployment Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check for .gcloudignore
if (-not (Test-Path ".gcloudignore")) {
    Write-Host "[Info] Creating default .gcloudignore..." -ForegroundColor Gray
    ".gcloudignore`n.git`nnode_modules/`ndist/`nDockerfile`n.env`n" | Out-File -FilePath ".gcloudignore" -Encoding utf8
}

# Check if gcloud is available
$gcloudCmd = "gcloud"
try { & $gcloudCmd --version | Out-Null } catch {
    $gcloudCmd = "gcloud.cmd"
    try { & $gcloudCmd --version | Out-Null } catch {
        Write-Host "ERROR: 'gcloud' command not found." -ForegroundColor Red
        exit 1
    }
}

# --- Step 1: Create a new GCP project ---
Write-Host "`n[Step 1] Creating GCP project: $PROJECT_ID" -ForegroundColor Green
& $gcloudCmd projects create $PROJECT_ID --name="AdaptiveEd"
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Project creation failed" -ForegroundColor Red; exit 1 }

Write-Host "Waiting 10 seconds for project initialization..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# --- Step 2: Link billing account ---
Write-Host "`n[Step 2] Linking billing account: $BILLING_ACCOUNT" -ForegroundColor Green
& $gcloudCmd billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
if ($LASTEXITCODE -ne 0) { 
    Write-Host "ERROR: Linking billing account failed. If this is a personal 'Free Trial' account, you might need to enable billing manually in the console for this project." -ForegroundColor Yellow
    exit 1 
}

Write-Host "Waiting 15 seconds for billing status to update..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# --- Step 3: Set active project ---
Write-Host "`n[Step 3] Setting active project..." -ForegroundColor Green
& $gcloudCmd config set project $PROJECT_ID

# --- Step 4: Enable required APIs ---
Write-Host "`n[Step 4] Enabling required APIs (Cloud Build, Cloud Run, Artifact Registry)..." -ForegroundColor Green
Write-Host "  This may take up to 2 minutes. Please wait..." -ForegroundColor Gray
& $gcloudCmd services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com artifactregistry.googleapis.com

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to enable APIs. This is almost always a billing delay." -ForegroundColor Red
    Write-Host "Try running the script again in 30 seconds." -ForegroundColor Yellow
    exit 1
}

Write-Host "Waiting 20 seconds for APIs and storage permissions to propagate..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# --- Step 5: Grant IAM Permissions ---
Write-Host "`n[Step 5] Granting IAM permissions to Cloud Build service account..." -ForegroundColor Green
$PROJECT_NUMBER = (& $gcloudCmd projects describe $PROJECT_ID --format="value(projectNumber)").Trim()
$CB_SERVICE_ACCOUNT = "$($PROJECT_NUMBER)@cloudbuild.gserviceaccount.com"

# Retry loop for IAM assignment as the service account might not exist immediately
$retryCount = 0
while ($retryCount -lt 3) {
    try {
        & $gcloudCmd projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SERVICE_ACCOUNT" --role="roles/run.admin"
        & $gcloudCmd projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SERVICE_ACCOUNT" --role="roles/iam.serviceAccountUser"
        break
    } catch {
        Write-Host "Service account not ready yet, retrying in 10s... ($($retryCount + 1)/3)" -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $retryCount++
    }
}

# --- Step 6: Build and Deploy ---
Write-Host "`n[Step 6] Running Cloud Build (Build + Deploy)..." -ForegroundColor Green
& $gcloudCmd builds submit --config cloudbuild.yaml --substitutions="_VITE_GEMINI_API_KEY=$API_KEY,_SERVICE_NAME=$SERVICE_NAME,_REGION=$REGION"

if ($LASTEXITCODE -ne 0) { 
    Write-Host "`nERROR: Build or Deployment failed!" -ForegroundColor Red
    exit 1 
}

# --- Step 7: Get the service URL ---
Write-Host "`n[Step 7] Getting service URL..." -ForegroundColor Green
$SERVICE_URL = & $gcloudCmd run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host " Project ID : $PROJECT_ID" -ForegroundColor White
Write-Host " Service URL: $SERVICE_URL" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
