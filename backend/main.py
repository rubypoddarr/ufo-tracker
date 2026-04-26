import sqlite3
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# ---------------- DB CONFIG ----------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data/db/ufo_sightings.db")

def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


# ---------------- CORE FUNCTIONS ----------------

def get_sightings(filters: dict = None, limit: int = 1000):
    conn = _get_db()
    try:
        query = "SELECT * FROM sightings WHERE 1=1"
        params = []

        if filters:
            if filters.get("year"):
                query += " AND year = ?"
                params.append(filters["year"])
            if filters.get("month"):
                query += " AND month = ?"
                params.append(filters["month"])
            if filters.get("shape"):
                query += " AND shape = ?"
                params.append(filters["shape"])
            if filters.get("country"):
                query += " AND country = ?"
                params.append(filters["country"])
            if filters.get("state"):
                query += " AND state = ?"
                params.append(filters["state"])

        query += " ORDER BY datetime_parsed DESC LIMIT ?"
        params.append(limit)

        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

    finally:
        conn.close()


def get_filter_options():
    conn = _get_db()
    try:
        years = [r["year"] for r in conn.execute(
            "SELECT DISTINCT year FROM sightings WHERE year IS NOT NULL ORDER BY year DESC"
        ).fetchall()]

        shapes = [r["shape"] for r in conn.execute(
            "SELECT DISTINCT shape FROM sightings WHERE shape IS NOT NULL AND shape != '' ORDER BY shape"
        ).fetchall()]

        countries = [r["country"] for r in conn.execute(
            "SELECT DISTINCT country FROM sightings WHERE country IS NOT NULL AND country != '' ORDER BY country"
        ).fetchall()]

        return {
            "years": years,
            "shapes": shapes,
            "countries": countries
        }

    finally:
        conn.close()


def get_stats():
    conn = _get_db()
    try:
        total = conn.execute("SELECT COUNT(*) FROM sightings").fetchone()[0]

        top_shape = conn.execute("""
            SELECT shape FROM sightings 
            WHERE shape IS NOT NULL AND shape != '' 
            GROUP BY shape ORDER BY COUNT(*) DESC LIMIT 1
        """).fetchone()

        top_country = conn.execute("""
            SELECT country FROM sightings 
            WHERE country IS NOT NULL AND country != '' 
            GROUP BY country ORDER BY COUNT(*) DESC LIMIT 1
        """).fetchone()

        return {
            "total_sightings": total,
            "top_shape": top_shape["shape"] if top_shape else "Unknown",
            "top_country": top_country["country"] if top_country else "Unknown"
        }

    finally:
        conn.close()


# ---------------- API LAYER (THIS WAS MISSING) ----------------

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["POST"])
def rpc():
    data = request.get_json()

    func = data.get("func")
    args = data.get("args", {})

    try:
        if func == "get_sightings":
            return jsonify(get_sightings(args))

        if func == "get_filter_options":
            return jsonify(get_filter_options())

        if func == "get_stats":
            return jsonify(get_stats())

        return jsonify({"error": "Unknown function"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
