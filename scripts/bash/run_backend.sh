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

if [ "$DB_TYPE" != "sample" ] && [ "$DB_TYPE" != "prod" ]; then
    echo "ERROR: Env var DB_TYPE expects value sample or prod. Given ${DB_TYPE}"
    echo "Exiting early..."
    exit 1
fi

echo "Using $DB_TYPE database."

# Setup database filepaths
DB_DIR="databases"

export DB_FILEPATH="${DB_DIR}/${DB_TYPE}_db/${DB_TYPE}_dataset.db"

if [ ! -f .venv/bin/activate ]; then
    echo ".venv not found. Please run setup.sh"
    exit 1
fi

source .venv/bin/activate

# Initalize the backend database
if [ "$REINIT_DB" == "true" ] || [ ! -e "$DB_FILEPATH" ]; then

    if [ ! -e "$DB_FILEPATH" ]; then
        echo -e "$DB_FILEPATH does not exist, creating it..."
    else
        echo "Recreating the database from scratch..."
    fi

    if [ -f "$DB_FILEPATH" ]; then
        echo "Database already exists, wiping and recreating it..."
        rm "$DB_FILEPATH"
    fi

    echo "Building database schema..."
    python "$DB_DIR/init_db.py" "$DB_TYPE"
    if [ $? -ne 0 ]; then
        echo -e "Failed to build database schema!\nWill try to destroy db before exiting!"
        rm "$DB_FILEPATH" 2> /dev/null # If DB DNE it isn't a problem so don't print error msg
        deactivate
        exit 1
    fi

    echo -e "Populating database with data...\n"
    python "$DB_DIR/populate_db.py" "$DB_TYPE"
    if [ $? -ne 0 ]; then
        echo -e "Failed to populate database!\nWill try to destroy db before exiting!"
        rm "$DB_FILEPATH" 2> /dev/null # If DB DNE it isn't a problem so don't print error msg
        deactivate
        exit 1
    fi

    echo -e "\nSuccessfully initialized database!\n"
else
    echo -e "$DB_FILEPATH exists and REINIT_DB set to $REINIT_DB\nUsing existing DB!\n"
fi


echo "Starting Flask backend..."
python app.py

deactivate
