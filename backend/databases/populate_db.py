import csv
import os
import sys
import sqlite3

############################ CSV SETUP ############################
INSERT_USERS = """
INSERT INTO Users (uid, username, first_name, last_name, email, password_hash, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

INSERT_LOGIN_ATTEMPTS = """
INSERT INTO LoginAttempts (uid, time, success)
VALUES (?, ?, ?)
"""

INSERT_RESTAURANTS = """
INSERT INTO Restaurants (restaurant_id, name, address, city, state, zip_code, phone, avg_rating, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

INSERT_RESTAURANT_IMAGES = """
INSERT INTO RestaurantImages (image_id, restaurant_id, image_url, created_at)
VALUES (?, ?, ?, ?)
"""

INSERT_RESTAURANT_TYPES = """
INSERT INTO RestaurantTypes (type_id, type_name)
VALUES (?, ?)
"""

INSERT_RESTAURANT_TYPE_ASSIGNMENTS = """
INSERT INTO RestaurantTypeAssignments (restaurant_id, type_id)
VALUES (?, ?)
"""

INSERT_REVIEWS = """
INSERT INTO Reviews (uid, restaurant_id, rating, review_text, created_at)
VALUES (?, ?, ?, ?, ?)
"""

INSERT_FOLLOWERS = """
INSERT INTO Followers (uid, follower_id)
VALUES (?, ?)
"""

INSERT_RESTAURANTS_FTS_REBUILD = """
-- Rebuilds the search index
INSERT INTO restaurants_fts(restaurants_fts) VALUES('rebuild');
"""

if len(sys.argv) != 2:
    print(
        f"FAILED: {sys.argv[0]} expects 2 args DB_TYPE=[sample|prod], received {len(sys.argv)} args"
    )
    sys.exit(1)

DB_TYPE = sys.argv[1]

# CWD will be backend/ as this script is run by ./run_backend.sh
# which executes this script after running cd'ing into backend
CWD = os.getcwd()
DB_DIR = os.path.join(CWD, "databases", DB_TYPE + "_db")

DATASET = os.path.join(DB_DIR, DB_TYPE + "_dataset.db")
CSV_DIR = os.path.join(DB_DIR, "csv_files")

csv_files = [
    "users.csv",
    "login_attempts.csv",
    "restaurants.csv",
    "restaurant_images.csv",
    "restaurant_types.csv",
    "restaurant_type_assignments.csv",
    "reviews.csv",
    "followers.csv",
]

for i in range(len(csv_files)):
    csv_files[i] = os.path.join(CSV_DIR, csv_files[i])

QUERIES = [
    INSERT_USERS,
    INSERT_LOGIN_ATTEMPTS,
    INSERT_RESTAURANTS,
    INSERT_RESTAURANT_IMAGES,
    INSERT_RESTAURANT_TYPES,
    INSERT_RESTAURANT_TYPE_ASSIGNMENTS,
    INSERT_REVIEWS,
    INSERT_FOLLOWERS,
]

# We only assert that every file has a corresponding query
# Any file DNE, permissions, or syntactic errors should be caught in our try-catch
assert len(csv_files) == len(QUERIES)

############################ DB POPULATION ############################
try:
    # Try connect to locally stored dataset
    conn = sqlite3.connect(DATASET)
    cursor = conn.cursor()

    for i in range(len(csv_files)):
        with open(csv_files[i], "r", encoding="utf-8") as file:
            print(f"Reading {csv_files[i]}")
            csv_reader = csv.reader(file)
            data = [tuple(row) for row in csv_reader]
            cursor.executemany(QUERIES[i], data)

    # TODO: Fix FTS
    # cursor.execute(INSERT_RESTAURANTS_FTS_REBUILD);

    conn.commit()
    if conn:
        conn.close()
except sqlite3.Error as e:
    print(f"FAILED: {sys.argv[0]}: {e}")

    if conn:
        conn.close()

    sys.exit(1)

sys.exit(0)
