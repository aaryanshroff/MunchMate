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
REINIT_DB="${REINIT_DB:-false}"

# Setup database filepaths
SAMPLE_DB_DIR="databases/sample_db"
PROD_DB_DIR="databases/prod_db"

SAMPLE_DB_FILEPATH="$SAMPLE_DB_DIR/sample_dataset.db"
PROD_DB_FILEPATH="$PROD_DB_DIR/prod_dataset.db"

DB_DIR=""
export DB_FILEPATH=""

if [ "$DB_TYPE" = "sample" ]; then
    echo "Using sample database."
    DB_DIR="$SAMPLE_DB_DIR"
    export DB_FILEPATH="$SAMPLE_DB_FILEPATH"
else
    echo "Using production database."
    DB_DIR="$PROD_DB_DIR"
    export DB_FILEPATH="$PROD_DB_FILEPATH"
fi

if [ ! -f .venv/bin/activate ]; then
    echo ".venv not found. Please run setup.sh"
    exit 1
fi

source .venv/bin/activate

# Initalize the backend database
if [ "$REINIT_DB" ]; then
    echo "Recreating the database from scratch..."

    if [ -f "$DB_FILEPATH" ]; then
        echo "Database already exists, wiping and recreating it..."
        rm "$DB_FILEPATH"
    fi

    echo "Building database schema..."
    python "$DB_DIR/init_db.py"
    if [ $? -ne 0 ]; then
        echo -e "Failed to build database schema!\nWill try to destroy db before exiting!"
        rm "$DB_FILEPATH" 2> /dev/null # If DB DNE it isn't a problem so don't print error msg
        deactivate
        exit 1
    fi

fi

echo -e "Populating database with data...\n"
python "$DB_DIR/populate_db.py"
if [ $? -ne 0 ]; then
    echo -e "Failed to populate database!\nWill try to destroy db before exiting!"
    rm "$DB_FILEPATH" 2> /dev/null # If DB DNE it isn't a problem so don't print error msg
    deactivate
    exit 1
fi

echo -e "\nSuccessfully initialized database!\n"


echo "Starting Flask backend..."
python app.py

deactivate
