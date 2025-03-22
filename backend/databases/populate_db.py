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
INSERT INTO Restaurants (restaurant_id, name, address, city, state, zip_code, phone, num_of_reviews, avg_rating, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

# The following 2 queries are to initially set the nuumber and average rating for restaurants,
# subsequent updates to the Reviews table will update number and average ratings through triggers
CALCULATE_RATINGS_DATA = """
CREATE TEMP TABLE temp_ratings AS
SELECT 
    r.restaurant_id,
    COALESCE( ROUND( avg( rv.rating ), 1 ), 0 ) AS avg_rating,
    COUNT(rv.restaurant_id) AS num_of_reviews
FROM Restaurants r
LEFT JOIN Reviews rv ON r.restaurant_id = rv.restaurant_id
GROUP BY r.restaurant_id;
"""

UPDATE_RATINGS_DATA = """
UPDATE Restaurants
SET avg_rating = (
    SELECT avg_rating
    FROM temp_ratings tr
    WHERE tr.restaurant_id = Restaurants.restaurant_id
),
    num_of_reviews = (
    SELECT num_of_reviews
    FROM temp_ratings tr
    WHERE tr.restaurant_id = Restaurants.restaurant_id
);
"""

SETUP_REVIEWS_INSERT_TRIGGER = """
CREATE TRIGGER reviews_insert_trigger 
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    UPDATE Restaurants
    SET avg_rating = ROUND( ( avg_rating * num_of_reviews + NEW.rating ) / ( num_of_reviews + 1 ), 1 ),
        num_of_reviews = num_of_reviews + 1
    WHERE restaurant_id = NEW.restaurant_id;
END;
"""

SETUP_REVIEWS_UPDATE_TRIGGER = """
CREATE TRIGGER reviews_update_trigger 
AFTER UPDATE of rating ON Reviews
FOR EACH ROW
BEGIN
    UPDATE Restaurants
    SET avg_rating = ROUND( (SELECT AVG(rating) FROM Reviews WHERE restaurant_id = NEW.restaurant_id), 1 )
    WHERE restaurant_id = NEW.restaurant_id;
END;
"""

# FTS triggers to keep the search index in sync with the Restaurants table
SETUP_RESTAURANTS_FTS_INSERT_TRIGGER = """
CREATE TRIGGER IF NOT EXISTS restaurants_fts_insert_trigger
AFTER INSERT ON Restaurants
FOR EACH ROW
BEGIN
    INSERT INTO RestaurantSearch(rowid, name, address, city, state)
    VALUES (NEW.restaurant_id, NEW.name, NEW.address, NEW.city, NEW.state);
END;
"""

SETUP_RESTAURANTS_FTS_UPDATE_TRIGGER = """
CREATE TRIGGER IF NOT EXISTS restaurants_fts_update_trigger
AFTER UPDATE ON Restaurants
FOR EACH ROW
BEGIN
    UPDATE RestaurantSearch
    SET name = NEW.name,
        address = NEW.address,
        city = NEW.city,
        state = NEW.state
    WHERE rowid = NEW.restaurant_id;
END;
"""

SETUP_RESTAURANTS_FTS_DELETE_TRIGGER = """
CREATE TRIGGER IF NOT EXISTS restaurants_fts_delete_trigger
AFTER DELETE ON Restaurants
FOR EACH ROW
BEGIN
    DELETE FROM RestaurantSearch WHERE rowid = OLD.restaurant_id;
END;
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

    # Do before populating tables so that FTS is also populated together
    print("Setting up FTS triggers")
    cursor.execute(SETUP_RESTAURANTS_FTS_INSERT_TRIGGER)
    cursor.execute(SETUP_RESTAURANTS_FTS_UPDATE_TRIGGER)
    cursor.execute(SETUP_RESTAURANTS_FTS_DELETE_TRIGGER)
    print("Done setting up FTS triggers")

    print("Populating tables")
    for i in range(len(csv_files)):
        with open(csv_files[i], "r", encoding="utf-8") as file:
            print(f"Reading {csv_files[i]}")
            csv_reader = csv.reader(file)
            data = [tuple(row) for row in csv_reader]
            cursor.executemany(QUERIES[i], data)

    # Calculates the average rating per restaurant and updates the database with the found values
    print(
        "\nDone populating tables\nCalculating average rating per restaurant and setting up triggers"
    )
    print("This may take a minute...")
    cursor.execute(CALCULATE_RATINGS_DATA)
    cursor.execute(UPDATE_RATINGS_DATA)
    cursor.execute(SETUP_REVIEWS_INSERT_TRIGGER)
    cursor.execute(SETUP_REVIEWS_UPDATE_TRIGGER)
    cursor.execute(SETUP_RESTAURANTS_FTS_INSERT_TRIGGER)
    cursor.execute(SETUP_RESTAURANTS_FTS_UPDATE_TRIGGER)
    cursor.execute(SETUP_RESTAURANTS_FTS_DELETE_TRIGGER)
    print("DONE!")

    conn.commit()
    if conn:
        conn.close()
except sqlite3.Error as e:
    print(f"FAILED: {sys.argv[0]}: {e}")

    if conn:
        conn.close()

    sys.exit(1)

sys.exit(0)
