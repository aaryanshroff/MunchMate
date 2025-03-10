from pathlib import Path
from hashlib import sha256
import re
from typing import Set

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

        results = _list_restaurants(search_term, type_ids)

        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


def _list_restaurants(
    search_term: str = "", type_ids: list[int] = []
) -> list[Restaurant]:
    if len(type_ids) == 0:
        sql_file = Path("queries") / "list_restaurants.sql"
        return db.query_db_from_file(sql_file)

    placeholders = ", ".join(["?"] * len(type_ids))

    sql_file = Path("queries") / "filter_restaurants.sql"
    # NOT SQL injection b/c we only substitute with X number of ?
    # ? substitution is handled by SQLite engine
    query = sql_file.read_text(encoding="utf-8").format(placeholders=placeholders)
    print(query)

    return db.query_db(query, tuple(type_ids))

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
    print(add_images_query)

    for image_url in images:
        params = (restaurant_id, image_url)
        db.query_db(add_images_query, params)

    return query_response


@app.get("/api/types")
def get_types():
    try:
        results = _list_types()
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


def _list_types() -> list[RestaurantType]:
    sql_file = Path("queries") / "list_types.sql"

    return db.query_db_from_file(sql_file)


# 1. Get User Profile Details
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


# 2. Get Followers List
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


# 3. Get Following List
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


# 4. Get Reviewed Restaurants by User
@app.get("/api/users/<int:uid>/reviews")
def get_user_reviews(uid):
    try:
        sql_file = Path("queries") / "list_user_reviews.sql"
        query = sql_file.read_text(encoding="utf-8")
        results = db.query_db(query, (uid,))
        return {"data": results}, 200
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


# 5. Attempt login
@app.post("/api/login")
def login():
    try:
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
            Path("queries") / "login.sql", (username, password_hash)
        )
        # Record login attempt, continue even if insert fails
        try:
            db.query_db_from_file(
                Path("queries") / "add_login_attempt.sql", (username, bool(results))
            )
        except Exception as e:
            print(f"{type(e).__name__}({e})")

        if results:
            return get_user_profile(results[0]["uid"])
        else:
            return {"error": "Invalid username or password"}, 401
    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


def check_password(pwd: str) -> Set[str]:
    issues = set()
    if len(pwd) < 6 or len(pwd) > 50:
        issues.add("Password must be between 6 and 50 characters long.")
    if not re.search(r"[a-z]", pwd):
        issues.add("Password must contain at least one lowercase letter.")
    if not re.search(r"[A-Z]", pwd):
        issues.add("Password must contain at least one uppercase letter.")
    if not re.search(r"\d", pwd):
        issues.add("Password must contain at least one digit.")
    if not re.search(r"[@$!%*#?&]", pwd):
        issues.add("Password must contain at least one special character (@$!%*#?&).")

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
            return {"error": list(password_issues)}, 400

        # Print type and value of the variables
        print(f"username: {type(username)} - {username}")
        print(f"first_name: {type(first_name)} - {first_name}")
        print(f"last_name: {type(last_name)} - {last_name}")
        print(f"email: {type(email)} - {email}")
        print(f"password_hash: {type(password_hash)} - {password_hash}")

        query_response = db.query_db_from_file(
            Path("queries") / "create_account.sql",
            (username, first_name, last_name, email, password_hash),
        )

        print(query_response)

        return query_response, 201

    except Exception as e:
        print(f"{type(e).__name__}({e})")
        return {"error": str(e)}, 500


if __name__ == "__main__":
    app.run(debug=True)
