# Set error action to stop execution on errors
$ErrorActionPreference = "Stop"

# Save current directory so we can jump back here after this script finishes
Push-Location

# Move to directory containing script
Set-Location -Path $PSScriptRoot

# All paths relative to our backend directory
Set-Location -Path "..\..\backend"

# Environment Variables
#
# DB_TYPE: 
#   desc:        use production database or sample?
#   valid input: { "sample", "prod" }
#   defaults:    "sample"
# REINIT_DB:
#   desc:        if database exists, should it be reinitialized?
#   valid input: Boolean
#   defaults:    "false"

$DB_TYPE = $env:DB_TYPE
$REINIT_DB = $env:REINIT_DB

# Set defaults if not provided
if (-not $DB_TYPE) { $DB_TYPE = "sample" }
if (-not $REINIT_DB) { $REINIT_DB = "false" }

# Setup database filepaths
$SAMPLE_DB_DIR = "databases\sample_db"
$PROD_DB_DIR = "databases\prod_db"

$SAMPLE_DB_FILEPATH = "$SAMPLE_DB_DIR\sample_dataset.db"
$PROD_DB_FILEPATH = "$PROD_DB_DIR\prod_dataset.db"

$DB_DIR = ""
$DB_FILEPATH = ""

if ($DB_TYPE -eq "sample") {
    Write-Host "Using sample database."
    $DB_DIR = $SAMPLE_DB_DIR
    $DB_FILEPATH = $SAMPLE_DB_FILEPATH
} else {
    Write-Host "Using production database."
    $DB_DIR = $PROD_DB_DIR
    $DB_FILEPATH = $PROD_DB_FILEPATH
}

# Activate the virtual environment
. ..\.venv\Scripts\Activate.ps1

# Initialize the backend database
if ($REINIT_DB -eq "true") {
    Write-Host "Recreating the database from scratch..."

    if (Test-Path $DB_FILEPATH) {
        Write-Host "Database already exists, wiping and recreating it..."
        Remove-Item $DB_FILEPATH -Force
    }

    Write-Host "Building database schema..."
    python "$DB_DIR\init_sample_db.py"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build database schema! Will try to destroy DB before exiting."
        Remove-Item $DB_FILEPATH -ErrorAction SilentlyContinue
        deactivate
        Pop-Location
        exit 1
    }
}

Write-Host "Populating database with data..."
python "$DB_DIR\populate_sample_db.py"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to populate database! Will try to destroy DB before exiting."
    Remove-Item $DB_FILEPATH -ErrorAction SilentlyContinue
    deactivate
    Pop-Location
    exit 1
}

Write-Host "Successfully initialized database!"

Write-Host "Starting Flask backend..."
python app.py

# Deactivate the virtual environment
deactivate

Pop-Location
