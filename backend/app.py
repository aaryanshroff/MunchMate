from pathlib import Path

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

        results = _add_restaurant(name, address, city, state, zip_code, phone, types, images)

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
    images: list[str] = []
) -> int:
    sql_file = Path("queries") / "add_restaurant.sql"
    add_restaurant_query = sql_file.read_text(encoding="utf-8")
    print(add_restaurant_query)

    params = (name, address, city, state, zip_code, phone)
    query_response = db.query_db(add_restaurant_query, params)

    restaurant_id = str( db.query_db("SELECT LAST_INSERT_ROWID()")[0]['LAST_INSERT_ROWID()'] )

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

if __name__ == "__main__":
    app.run(debug=True)
