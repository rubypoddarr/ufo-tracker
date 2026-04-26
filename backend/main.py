from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_PATH = "data/db/ufo_sightings.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/api", methods=["POST"])
def api():
    data = request.get_json()

    func = data.get("func")
    args = data.get("args", {})

    conn = get_db()

    try:
        # GET SIGHTINGS
        if func == "get_sightings":
            query = "SELECT * FROM sightings WHERE 1=1"
            params = []

            if args.get("year"):
                query += " AND year=?"
                params.append(args["year"])

            if args.get("shape"):
                query += " AND shape=?"
                params.append(args["shape"])

            query += " ORDER BY datetime_parsed DESC LIMIT 500"

            rows = conn.execute(query, params).fetchall()
            return jsonify([dict(r) for r in rows])

        # STATS
        if func == "get_stats":
            total = conn.execute("SELECT COUNT(*) as c FROM sightings").fetchone()["c"]

            top_shape = conn.execute("""
                SELECT shape FROM sightings 
                WHERE shape IS NOT NULL AND shape!=''
                GROUP BY shape ORDER BY COUNT(*) DESC LIMIT 1
            """).fetchone()

            return jsonify({
                "total_sightings": total,
                "top_shape": top_shape["shape"] if top_shape else "Unknown"
            })

        # FILTERS
        if func == "get_filter_options":
            years = conn.execute("SELECT DISTINCT year FROM sightings").fetchall()
            shapes = conn.execute("SELECT DISTINCT shape FROM sightings").fetchall()

            return jsonify({
                "years": [y["year"] for y in years if y["year"]],
                "shapes": [s["shape"] for s in shapes if s["shape"]]
            })

        return jsonify({"error": "Invalid function"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
