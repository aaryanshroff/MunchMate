# Set error action to stop execution on errors
$ErrorActionPreference = "Stop"

# Save current directory so we can jump back here after this script finishes
Push-Location

# All paths relative to our backend directory

# Move to directory containing script
Set-Location -Path $PSScriptRoot

# Environment Variables
#
# DB_TYPE: 
#   desc:        use production database or sample?
#   valid input: { "sample", "prod" }
#   defaults:    "sample"
$DB_TYPE = $env:DB_TYPE
if (-not $DB_TYPE) { $DB_TYPE = "sample" }

# Move to directory containing script
Set-Location -Path $PSScriptRoot

# Database filepaths
$MAIN_DB_DIR = "..\..\backend\databases"
$SAMPLE_DB_DIR = "$MAIN_DB_DIR\sample_db"
$PROD_DB_DIR = "$MAIN_DB_DIR\prod_db"

$SAMPLE_DB_FILEPATH = "$SAMPLE_DB_DIR\sample_dataset.db"
$PROD_DB_FILEPATH = "$PROD_DB_DIR\prod_dataset.db"

$DB_FILEPATH = ""

if ($DB_TYPE -eq "sample") {
    Write-Host "Cleaning sample database..."
    $DB_FILEPATH = $SAMPLE_DB_FILEPATH
}
else {
    Write-Host "Cleaning production database..."
    $DB_FILEPATH = $PROD_DB_FILEPATH
}

Write-Host "Using $DB_TYPE database."

# Setup database filepaths
$DB_DIR = "databases"
$DB_FILEPATH = "$DB_DIR\$DB_TYPE`_db\$DB_TYPE`_dataset.db"

Write-Host "Cleaning $DB_TYPE database..."

if (Test-Path $DB_FILEPATH) {
    Remove-Item $DB_FILEPATH -Force
    Write-Host "Cleaned dataset!"
}
else {
    Write-Host "Nothing to clean."
}

Pop-Location
