import os
from pathlib import Path
import sqlite3

from flask import Flask, g


def get_db() -> sqlite3.Connection:
    # g is a special object that is unique for each request.
    # It is used to store data that might be accessed by multiple functions during the request.
    if "db" not in g:
        g.db = sqlite3.connect(
            os.environ["DB_FILEPATH"],
        )
        # sqlite3.Row tells the connection to return rows that behave like dicts. This allows accessing the columns by name.
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(exception=None):
    """
    Close a DB connection if it exists.
    """
    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_db() -> None:
    db = get_db()

    with open(os.path.join("sql", "create_tables.sql")) as f:
        db.executescript(f.read().decode("utf8"))


def init_app(app: Flask) -> None:
    # app.teardown_appcontext() tells Flask to call that function when cleaning up after returning the response.
    app.teardown_appcontext(close_db)


def query_db(sql_file: Path, args=(), one=False):
    """
    Query function that combines getting the cursor, executing and fetching the results.
    """
    query = sql_file.read_text(encoding="utf-8")
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv
