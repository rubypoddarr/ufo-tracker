import sqlite3
import os
import json

DB_PATH = "apps/ufo_tracker/backend/data/db/ufo_sightings.db"

def _get_db():
    """Open a connection with recommended settings."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def get_sightings(filters: dict = None, limit: int = 1000):
    """
    Retrieve filtered sightings for the map and list.
    Filters can include: year, month, shape, country, state.
    """
    print(f"[BACKEND_START] get_sightings with filters={filters}, limit={limit}")
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
        
        print(f"[BACKEND_STEP] Executing query: {query} with params {params}")
        rows = conn.execute(query, params).fetchall()
        result = [dict(r) for r in rows]
        print(f"[BACKEND_SUCCESS] get_sightings returned {len(result)} records")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] get_sightings failed: {type(e).__name__}: {str(e)}")
        raise
    finally:
        conn.close()

def get_filter_options():
    """
    Get unique values for filters (years, shapes, countries).
    """
    print("[BACKEND_START] get_filter_options")
    conn = _get_db()
    try:
        # Get years
        years_rows = conn.execute("SELECT DISTINCT year FROM sightings WHERE year IS NOT NULL ORDER BY year DESC").fetchall()
        years = [r["year"] for r in years_rows]
        
        # Get shapes
        shapes_rows = conn.execute("SELECT DISTINCT shape FROM sightings WHERE shape IS NOT NULL AND shape != '' ORDER BY shape").fetchall()
        shapes = [r["shape"] for r in shapes_rows]
        
        # Get countries
        countries_rows = conn.execute("SELECT DISTINCT country FROM sightings WHERE country IS NOT NULL AND country != '' ORDER BY country").fetchall()
        countries = [r["country"] for r in countries_rows]
        
        result = {
            "years": years,
            "shapes": shapes,
            "countries": countries
        }
        print(f"[BACKEND_SUCCESS] get_filter_options returned {len(years)} years, {len(shapes)} shapes, {len(countries)} countries")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] get_filter_options failed: {type(e).__name__}: {str(e)}")
        raise
    finally:
        conn.close()

def get_stats():
    """
    Summary stats for the dashboard.
    """
    print("[BACKEND_START] get_stats")
    conn = _get_db()
    try:
        # Total sightings
        total_sightings = conn.execute("SELECT COUNT(*) FROM sightings").fetchone()[0]
        
        # Top shape
        top_shape_row = conn.execute("SELECT shape, COUNT(*) as cnt FROM sightings WHERE shape IS NOT NULL AND shape != '' GROUP BY shape ORDER BY cnt DESC LIMIT 1").fetchone()
        top_shape = top_shape_row["shape"] if top_shape_row else "Unknown"
        
        # Top country
        top_country_row = conn.execute("SELECT country, COUNT(*) as cnt FROM sightings WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY cnt DESC LIMIT 1").fetchone()
        top_country = top_country_row["country"] if top_country_row else "Unknown"
        
        result = {
            "total_sightings": total_sightings,
            "top_shape": top_shape,
            "top_country": top_country
        }
        print(f"[BACKEND_SUCCESS] get_stats: {result}")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] get_stats failed: {type(e).__name__}: {str(e)}")
        raise
    finally:
        conn.close()
