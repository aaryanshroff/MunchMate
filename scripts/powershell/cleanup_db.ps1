# Set error action to stop execution on errors
$ErrorActionPreference = "Stop"

# Save current directory so we can jump back here after this script finishes
Push-Location

# All paths relative to our backend directory
Set-Location -Path "..\..\backend"

# Environment Variables
#
# DB_TYPE: 
#   desc:        use production database or sample?
#   valid input: { "sample", "prod" }
#   defaults:    "sample"
$DB_TYPE = $env:DB_TYPE
if (-not $DB_TYPE) { $DB_TYPE = "sample" }

if ($DB_TYPE -ne "sample" -and $DB_TYPE -ne "prod") {
    Write-Host "ERROR: Env var DB_TYPE expects value sample or prod. Given $DB_TYPE"
    Write-Host "Exiting early..."
    Pop-Location
    exit 1
}

Write-Host "Using $DB_TYPE database."

# Setup database filepaths
$DB_DIR = "databases"
$DB_FILEPATH = "$DB_DIR\$DB_TYPE`_db\$DB_TYPE`_dataset.db"

Write-Host "Cleaning $DB_TYPE database..."

if (Test-Path $DB_FILEPATH) {
    Remove-Item $DB_FILEPATH -Force
    Write-Host "Cleaned dataset!"
} else {
    Write-Host "Nothing to clean."
}

Pop-Location
