import os
import sqlite3
import sys

# CWD will be backend/ as this script is run by ./run_backend.sh
# which executes this script after running cd'ing into backend 
CWD = os.getcwd()
SAMPLE_DB = os.path.join(CWD, 'databases', 'sample_db', 'sample_dataset.db')
SQL = 'sql'
CREATE_TABLES = os.path.join(CWD, SQL, 'create_tables.sql')

############################ SAMPLE DB SETUP ############################
try:
    # Try connect to locally stored sample database
    conn = sqlite3.connect(SAMPLE_DB)
    cursor = conn.cursor()

    # Set up all of the initial tables
    with open(CREATE_TABLES) as create_statements:
        conn.executescript(create_statements.read())

    conn.commit()
    if conn:
        conn.close()
except sqlite3.Error as e:
    print( f"FAILED: init_sample_db.py: {e}" )

    if conn:
        conn.close()

    sys.exit(1)

sys.exit(0)
