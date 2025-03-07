import csv
import os
import sys
import sqlite3

############################ SAMPLE CSV SETUP ############################
INSERT_USERS = """
INSERT INTO Users (uid, username, first_name, last_name, email, password_hash, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
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

# CWD will be backend/ as this script is run by ./run_backend.sh
# which executes this script after running cd'ing into backend 
CWD = os.getcwd()
SAMPLE_DB_DIR = os.path.join( CWD, 'databases', 'sample_db' )

SAMPLE_DATASET = os.path.join( SAMPLE_DB_DIR, "sample_dataset.db" )
SAMPLE_CSV_DIR = os.path.join( SAMPLE_DB_DIR, "sample_csv_files" )

csv_files = ['sample_users.csv',
             'sample_restaurants.csv',
             'sample_restaurant_images.csv',
             'sample_restaurant_types.csv',
             'sample_restaurant_type_assignments.csv',
             'sample_reviews.csv',
             'sample_followers.csv']

for i in range(len(csv_files)):
    csv_files[i] = os.path.join( SAMPLE_CSV_DIR, csv_files[i] )

QUERIES = [INSERT_USERS,
           INSERT_RESTAURANTS,
           INSERT_RESTAURANT_IMAGES,
           INSERT_RESTAURANT_TYPES,
           INSERT_RESTAURANT_TYPE_ASSIGNMENTS,
           INSERT_REVIEWS,
           INSERT_FOLLOWERS]

# We only assert that every file has a corresponding query
# Any file DNE, permissions, or syntactic errors should be caught in our try-catch
assert( len( csv_files ) == len( QUERIES ) )

############################ SAMPLE DB POPULATION ############################
try:
    # Try connect to locally stored sample dataset
    conn = sqlite3.connect( SAMPLE_DATASET )
    cursor = conn.cursor()

    for i in range( len( csv_files ) ):
        with open( csv_files[i], 'r' ) as file:
            print(f"Reading {csv_files[i]}")
            csv_reader = csv.reader( file )
            data = [tuple(row) for row in csv_reader]
            cursor.executemany( QUERIES[i], data )
        
    # TODO: Fix FTS
    # cursor.execute(INSERT_RESTAURANTS_FTS_REBUILD);

    conn.commit()
    if conn:
        conn.close()
except sqlite3.Error as e:
    print( f"FAILED: populate_sample_db.py: {e}" )

    if conn:
        conn.close()

    sys.exit( 1 )

sys.exit( 0 )
