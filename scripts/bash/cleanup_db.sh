#!/bin/bash

set -e

# Assume running from project root
# All paths relative to our backend dir
cd backend

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

DB_TYPE="${DB_TYPE:-sample}"

if [ "$DB_TYPE" != "sample" ] && [ "$DB_TYPE" != "prod" ]; then
    echo "ERROR: Env var DB_TYPE expects value sample or prod. Given ${DB_TYPE}"
    echo "Exiting early..."
    exit 1
fi

echo "Cleaning $DB_TYPE database..."

# Database filepath
DB_DIR="databases"

export DB_FILEPATH="${DB_DIR}/${DB_TYPE}_db/${DB_TYPE}_dataset.db"

if [ -f "$DB_FILEPATH" ]; then
    rm "$DB_FILEPATH"
    echo "Cleaned dataset!"
else
    echo "Nothing to clean."
fi
