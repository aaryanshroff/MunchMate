from pathlib import Path
from hashlib import sha256
import re
from typing import Set
from sqlite3 import IntegrityError

import db
from flask import Flask, request
from flask_cors import CORS
from models.restaurant import Restaurant, RestaurantType

app = Flask(__name__)
db.init_app(app)

# Enables CORS for all domains on all routes
# Read more: https://github.com/corydolphin/flask-cors?tab=readme-ov-file#simple-usage
CORS(app)


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Flask"}


@app.get("/api/restaurants")
def get_restaurants():
    try:
        # SQLite FTS5 is not case-sensitive
        search_term = request.args.get("q", "").strip()

        types_param = request.args.get("types")
        type_ids = types_param.split(",") if types_param else []

        city = request.args.get("city", "").strip()

        results = _list_restaurants(search_term, type_ids, city)

        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


def _list_restaurants(
    search_term: str = "", type_ids: list[int] = [], city: str = ""
) -> list[Restaurant]:
    if len(type_ids) == 0 and city == "":
        # List and filter are separate queries b/c list uses LEFT JOIN
        # and filter uses INNER JOIN
        sql_file = Path("queries") / "list_restaurants.sql"
        return db.query_db_from_file(sql_file)

    filter_predicates = []
    query_args = []

    if len(type_ids) > 0:
        placeholders = ", ".join(["?"] * len(type_ids))
        filter_predicates.append(f"rta.type_id IN ({placeholders})")
        query_args.extend(type_ids)

    if city != "":
        filter_predicates.append(f"city = ?")
        query_args.append(city)

    where_clause = f"WHERE {filter_predicates[0] if len(filter_predicates) == 1 else ' AND '.join(filter_predicates)}"

    sql_file = Path("queries") / "filter_restaurants.sql"
    # NOT SQL injection b/c we only substitute with X number of ?
    # ? substitution is handled by SQLite engine
    query = sql_file.read_text(encoding="utf-8").format(where_clause=where_clause)
    print(query)

    return db.query_db(query, query_args)

    # TODO: Fix FTS
    # if search_term:
    #     sql_file = Path("queries") / "search_restaurants.sql"
    #     params = (search_term,)


@app.get("/api/restaurants/add")
def add_restaurant():
    try:
        name = request.args.get("name", "").strip()
        address = request.args.get("address", "").strip()
        city = request.args.get("city", "").strip()
        state = request.args.get("state", "").strip()
        zip_code = request.args.get("zip_code", "").strip()
        phone = request.args.get("phone", "").strip()
        types = request.args.get("types", "").strip().split(",")
        images = request.args.get("images", "").strip().split(",")

        results = _add_restaurant(
            name, address, city, state, zip_code, phone, types, images
        )

        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


def _add_restaurant(
    name: str = "",
    address: str = "",
    city: str = "",
    state: str = "",
    zip_code: str = "",
    phone: str = "",
    types: list[str] = [],
    images: list[str] = [],
) -> int:
    sql_file = Path("queries") / "add_restaurant.sql"
    add_restaurant_query = sql_file.read_text(encoding="utf-8")
    print(add_restaurant_query)

    params = (name, address, city, state, zip_code, phone)
    query_response = db.query_db(add_restaurant_query, params)

    restaurant_id = str(
        db.query_db("SELECT LAST_INSERT_ROWID()")[0]["LAST_INSERT_ROWID()"]
    )

    sql_file = Path("queries") / "assign_restaurant_types.sql"
    assign_types_query = sql_file.read_text(encoding="utf-8")
    print(assign_types_query)

    for t in types:
        params = (restaurant_id, t)
        db.query_db(assign_types_query, params)

    sql_file = Path("queries") / "add_restaurant_images.sql"
    add_images_query = sql_file.read_text(encoding="utf-8")

    print(images)
    for image_url in images:
        params = (restaurant_id, image_url)
        db.query_db(add_images_query, params)

    return query_response


@app.get("/api/types")
def get_types():
    try:
        sql_file = Path("queries") / "list_types.sql"
        results = db.query_db_from_file(sql_file)
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/cities")
def get_cities():
    try:
        sql_file = Path("queries") / "list_cities.sql"
        results = db.query_db_from_file(sql_file)
        # SQLite rows converted to dicts will lead to a result like
        # [{"city": "Toronto"}, {"city": "San Francisco"}]
        # This result is flattened for front-end ease-of-use
        cities = [row["city"] for row in results]
        return {"data": cities}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/users/<int:uid>")
def get_user_profile(uid):
    try:
        sql_file = Path("queries") / "get_user_profile.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid,))
        if results:
            return {"data": results[0]}, 200
        else:
            return {"error": "User not found"}, 404
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/users/<int:uid>/followers")
def get_user_followers(uid):
    try:
        sql_file = Path("queries") / "list_followers.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid,))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/users/<int:uid>/following")
def get_user_following(uid):
    try:
        sql_file = Path("queries") / "list_following.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid,))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/users/<int:uid>/reviews")
def get_user_reviews(uid):
    try:
        limit = request.args.get("limit", default=10, type=int)
        sql_file = Path("queries") / "list_my_reviews.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid, limit))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/users/<int:uid>/friends-reviews")
def get_friends_reviews(uid):
    try:
        # Default limit to 10 if not provided, and convert to int.
        limit = request.args.get("limit", default=10, type=int)
        # Reads the SQL query from the file.
        sql_file = Path("queries") / "list_following_reviews.sql"
        query = sql_file.read_text(encoding="utf-8")
        # Execute query with current user id and limit as parameters.
        results = db.query_db(query, (uid, limit))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/restaurants/<int:restaurant_id>")
def get_restaurant_details(restaurant_id):
    try:
        sql_file = Path("queries") / "get_restaurant_details.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (restaurant_id,))
        print(results)
        if results:
            return {"data": results[0]}, 200
        else:
            return {"error": "Restaurant not found"}, 404
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/restaurants/<int:restaurant_id>/my-review")
def get_my_review(restaurant_id):
    try:
        uid = request.args.get("uid", type=int)
        if uid is None:
            return {"error": "Missing uid parameter"}, 400

        sql_file = Path("queries") / "get_my_review.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (restaurant_id, uid))
        if results:
            return {"data": results[0]}, 200
        else:
            return {"data": None}, 200  # No review exists yet.
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.post("/api/restaurants/<int:restaurant_id>/review")
def post_review(restaurant_id):
    try:
        data = request.get_json()
        uid = data.get("uid")
        rating = data.get("rating")
        review_text = data.get("review_text", "").strip()

        if not uid or not rating:
            return {"error": "Missing uid or rating"}, 400

        if len(review_text) > 150:
            return {"error": "Review must be 150 characters or less"}, 400

        sql_file = Path("queries") / "upsert_review.sql"
        query = sql_file.read_text(encoding="utf-8")
        db.query_db(query, (uid, restaurant_id, rating, review_text))
        # Since our db.query_db now commits non-SELECT queries, no extra commit is needed.
        return {"message": "Review saved successfully"}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.get("/api/restaurants/<int:restaurant_id>/reviews")
def get_restaurant_reviews(restaurant_id):
    try:
        limit = request.args.get("limit", default=10, type=int)
        sql_file = Path("queries") / "get_restaurant_reviews.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (restaurant_id, limit))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500
      
@app.get("/api/users/<int:uid>/is-following")
def is_following(uid):
    try:
        # Expect the current user's id to be passed as a query parameter
        follower_id = request.args.get("follower_id", type=int)
        if follower_id is None:
            return {"error": "Missing follower_id parameter"}, 400

        sql_file = Path("queries") / "get_is_following.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid, follower_id))
        # If any row exists, the current user is following the profile user.
        return {"data": bool(results)}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500

@app.post("/api/users/<int:uid>/follow")
def follow_user(uid):
    try:
        data = request.get_json()
        follower_id = data.get("follower_id")
        if not follower_id:
            return {"error": "Missing follower_id in request body"}, 400

        sql_file = Path("queries") / "add_follow.sql"
        query = sql_file.read_text(encoding="utf-8")
        db.query_db(query, (uid, follower_id))
        return {"message": "Followed successfully"}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


@app.delete("/api/users/<int:uid>/unfollow")
def unfollow_user(uid):
    try:
        data = request.get_json()
        follower_id = data.get("follower_id")
        if not follower_id:
            return {"error": "Missing follower_id in request body"}, 400

        sql_file = Path("queries") / "unfollow.sql"
        query = sql_file.read_text(encoding="utf-8")
        db.query_db(query, (uid, follower_id))
        return {"message": "Unfollowed successfully"}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500
      
# 5. Attempt login
@app.post("/api/login")
def login():
    username = request.form.get("username").strip()
    password = request.form.get("password")
    # No salt so that password is one-to-one with hash and we can pass it
    # into the login query. Sufficiently secure for this project, otherwise use argon2-cffi
    password_hash = sha256(password.encode()).hexdigest()

    # Check if acct. is locked out
    lockout_status = db.query_db_from_file(
        Path("queries") / "get_account_lockout.sql", (username,)
    )

    if lockout_status[0]["locked_out"]:
        return {
            "error": "This account has been locked out. Please try again later."
        }, 401

    # Attempt login
    results = db.query_db_from_file(
        Path("queries") / "login.sql", (password_hash, username)
    )
    if results:
        uid = results[0]["uid"]
        success = results[0]["authenticated"]
        try:
            # Record login attempt, continue even if insert fails
            db.query_db_from_file(
                Path("queries") / "add_login_attempt.sql",
                (uid, success),
            )
        except Exception as e:
            print(f"{type(e).__name__}({e})")

        if results[0]["authenticated"]:
            return {"user_id": uid}, 201

    return {"error": "Invalid username or password"}, 401


def check_password(pwd: str) -> list[str]:
    issues = []
    if len(pwd) < 6 or len(pwd) > 50:
        issues.append("be between 6 and 50 characters long,")
    if not re.search(r"[a-z]", pwd):
        issues.append("contain at least one lowercase letter,")
    if not re.search(r"[A-Z]", pwd):
        issues.append("contain at least one uppercase letter,")
    if not re.search(r"\d", pwd):
        issues.append("contain at least one digit,")
    if not re.search(r"[@$!%*#?&]", pwd):
        issues.append("contain at least one special character (@$!%*#?&),")

    if len(issues) > 0:
        issues[-1] = issues[-1][:-1] + "."  # Replace trailing comma with period
        return ["Password must:"] + issues

    return issues

# 6. Register new account
@app.post("/api/register")
def register():
    try:
        username = request.form.get("username").strip()
        first_name = request.form.get("first_name").strip()
        last_name = request.form.get("last_name").strip()
        email = request.form.get("email").strip()
        password = request.form.get("password")
        password_hash = sha256(password.encode()).hexdigest()

        password_issues = check_password(password)

        if password_issues:
            return {"error": [f"{issue}\n" for issue in password_issues]}, 400

        query_response = db.query_db_from_file(
            Path("queries") / "create_account.sql",
            (username, first_name, last_name, email, password_hash),
        )

        user_id = str(
            db.query_db("SELECT LAST_INSERT_ROWID()")[0]["LAST_INSERT_ROWID()"]
        )

        return {"response": query_response, "user_id": user_id}, 201

    except IntegrityError as e:
        print(f"{type(e).__name__}({e})")
        error_msg = str(e)
        if "username" in error_msg:
            return {"error": "Username already exists"}, 409
        elif "email" in error_msg:
            return {"error": "Email already exists"}, 409
        else:
            return {"error": str(e)}, 500
        
@app.get("/api/users/search")
def search_users():
    try:
        # Get the search query from the URL query parameters
        search_query = request.args.get("query", "").strip()
        # Wrap with wildcards for a partial match
        query_param = f"%{search_query}%"
        sql_file = Path("queries") / "search_users.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (query_param,))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)
