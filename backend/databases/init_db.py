import os
import sqlite3
import sys

if len(sys.argv) != 2:
    print(
        f"FAILED: {sys.argv[0]} expects 2 args DB_TYPE=[sample|prod], received {len(sys.argv)} args"
    )
    sys.exit(1)

DB_TYPE = sys.argv[1]

# CWD will be backend/ as this script is run by ./run_backend.sh
# which executes this script after running cd'ing into backend
CWD = os.getcwd()
DB = os.path.join(CWD, "databases", DB_TYPE + "_db", DB_TYPE + "_dataset.db")
SQL = "sql"
CREATE_TABLES = os.path.join(CWD, SQL, "create_tables.sql")

############################ DB SETUP ############################
try:
    # Try connect to locally stored database
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    # Set up all of the initial tables
    with open(CREATE_TABLES) as create_statements:
        conn.executescript(create_statements.read())

    conn.commit()
    if conn:
        conn.close()
except sqlite3.Error as e:
    print(f"FAILED: {sys.argv[0]}: {e}")

    if conn:
        conn.close()

    sys.exit(1)

sys.exit(0)
