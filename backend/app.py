"""
Flask REST API for Product Price Index Using AVL Trees.

Endpoints:
- GET /api/health           - System health and ping check
- GET /api/products         - Retrieve products (ordered by price via AVL in-order traversal, optional filters)
- POST /api/products        - Add new product with validation
- PUT /api/products/<id>    - Update product
- DELETE /api/products/<id> - Delete product
- GET /api/search           - Search by price (?price=...) or range (?min_price=...&max_price=...)
- GET /api/closest          - O(log n) Budget Recommender (closest price, predecessor <= budget, successor >= budget)
- GET /api/tree             - Get serialized AVL Tree structure
- GET /api/traversals       - All 4 AVL Tree traversals (In-order, Pre-order, Post-order, Level-order BFS)
- GET /api/tree/audit       - Formal mathematical verification of AVL balance and BST invariants
- GET /api/stats            - Get product and AVL tree dashboard statistics
- GET /api/categories       - Get category-wise breakdown and metrics
- GET /api/export           - Export complete catalog and tree state as JSON
- POST /api/bulk            - Batch insert multiple products
- POST /api/reset           - Reset dataset to default demonstration samples
- POST /api/demo-rotation   - Trigger LL, RR, LR, RL rotation viva simulations
"""

import os
import math
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from products import ProductManager

app = Flask(__name__)
# Enable CORS for frontend development and production ports
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Use SQLite in backend directory
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "products.db")
manager = ProductManager(db_path=DB_FILE)
START_TIME = time.time()


# -------------------------------------------------------------
# Input Validation Helpers
# -------------------------------------------------------------

def validate_string(val: any, field_name: str, max_len: int = 120) -> tuple[bool, str]:
    """Validates and sanitizes text strings."""
    if not isinstance(val, str) or not val.strip():
        return False, f"Field '{field_name}' must be a non-empty string."
    cleaned = val.strip()
    if len(cleaned) > max_len:
        return False, f"Field '{field_name}' must not exceed {max_len} characters."
    return True, cleaned


def validate_price(val: any) -> tuple[bool, float, str]:
    """Validates positive finite price numbers with realistic e-commerce bounds."""
    if val is None or val == "":
        return False, 0.0, "Field 'price' is required."
    try:
        num = float(val)
        if math.isnan(num) or math.isinf(num):
            return False, 0.0, "Price must be a valid finite number."
        if num < 0:
            return False, 0.0, "Price cannot be negative."
        if num > 100_000_000:
            return False, 0.0, "Price exceeds maximum supported catalog value (\u20b9100,000,000)."
        return True, round(num, 2), ""
    except (ValueError, TypeError):
        return False, 0.0, "Invalid numeric format for price."


# -------------------------------------------------------------
# Core API Routes
# -------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint with uptime and memory metrics."""
    uptime_sec = round(time.time() - START_TIME, 1)
    stats = manager.get_statistics()
    return jsonify({
        "status": "healthy",
        "service": "AVL Product Price Index API",
        "uptime_seconds": uptime_sec,
        "total_products": stats.get("total_products", 0),
        "is_balanced": stats.get("is_balanced", True),
    }), 200


@app.route("/api/products", methods=["GET"])
def get_products():
    """
    Returns products ordered by price via AVL In-Order Traversal.
    Optional Query Parameters:
    - category: Filter by category name
    - q: Text query matching name or category
    - order: 'asc' (default) or 'desc'
    """
    products = manager.get_all_products()

    # Optional category filter
    category = request.args.get("category")
    if category and category.lower() != "all":
        products = [p for p in products if p["category"].lower() == category.lower()]

    # Optional search text query
    q = request.args.get("q")
    if q and q.strip():
        term = q.strip().lower()
        products = [
            p for p in products
            if term in p["name"].lower() or term in p["category"].lower() or term in str(p["price"])
        ]

    # Optional reverse sort
    order = request.args.get("order", "asc").lower()
    if order == "desc":
        products = list(reversed(products))

    return jsonify({
        "success": True,
        "count": len(products),
        "order": order,
        "data": products
    }), 200


@app.route("/api/products", methods=["POST"])
def add_product():
    """Adds a new product to the AVL tree price index."""
    data = request.get_json() or {}

    valid_name, name_val = validate_string(data.get("name"), "name", max_len=100)
    if not valid_name:
        return jsonify({"success": False, "error": name_val}), 400

    valid_cat, cat_val = validate_string(data.get("category"), "category", max_len=60)
    if not valid_cat:
        return jsonify({"success": False, "error": cat_val}), 400

    valid_price, price_val, price_err = validate_price(data.get("price"))
    if not valid_price:
        return jsonify({"success": False, "error": price_err}), 400

    product = manager.add_product(name_val, cat_val, price_val)
    op_metrics = manager.get_last_operation_metrics()
    return jsonify({
        "success": True,
        "message": f"Product '{name_val}' added successfully at \u20b9{product['price']:.2f}",
        "data": product,
        "complexity": op_metrics
    }), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id: int):
    """Updates an existing product's details and price."""
    data = request.get_json() or {}

    valid_name, name_val = validate_string(data.get("name"), "name", max_len=100)
    if not valid_name:
        return jsonify({"success": False, "error": name_val}), 400

    valid_cat, cat_val = validate_string(data.get("category"), "category", max_len=60)
    if not valid_cat:
        return jsonify({"success": False, "error": cat_val}), 400

    valid_price, price_val, price_err = validate_price(data.get("price"))
    if not valid_price:
        return jsonify({"success": False, "error": price_err}), 400

    updated = manager.update_product(product_id, name_val, cat_val, price_val)
    if not updated:
        return jsonify({"success": False, "error": f"Product with ID {product_id} not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Product #{product_id} updated successfully.",
        "data": updated
    }), 200


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id: int):
    """Deletes a product by ID and rebalances the AVL Tree."""
    success = manager.delete_product(product_id)
    if not success:
        return jsonify({"success": False, "error": f"Product with ID {product_id} not found."}), 404

    op_metrics = manager.get_last_operation_metrics()
    return jsonify({
        "success": True,
        "message": f"Product #{product_id} deleted successfully.",
        "complexity": op_metrics
    }), 200


@app.route("/api/search", methods=["GET"])
def search_products():
    """
    Search endpoint supporting:
    - Exact price: ?price=2499.00
    - Price range: ?min_price=1000&max_price=5000
    """
    price = request.args.get("price")
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")

    if price is not None:
        valid, val, err = validate_price(price)
        if not valid:
            return jsonify({"success": False, "error": err}), 400

        search_res = manager.search_by_price_with_trace(val)
        results = search_res["products"]
        return jsonify({
            "success": True,
            "mode": "exact",
            "query": val,
            "count": len(results),
            "data": results,
            "trace": search_res.get("trace", [])
        }), 200

    if min_price is not None and max_price is not None:
        valid_min, min_val, min_err = validate_price(min_price)
        if not valid_min:
            return jsonify({"success": False, "error": f"min_price: {min_err}"}), 400

        valid_max, max_val, max_err = validate_price(max_price)
        if not valid_max:
            return jsonify({"success": False, "error": f"max_price: {max_err}"}), 400

        if min_val > max_val:
            return jsonify({"success": False, "error": "min_price cannot exceed max_price."}), 400

        results = manager.search_by_range(min_val, max_val)
        return jsonify({
            "success": True,
            "mode": "range",
            "min_price": min_val,
            "max_price": max_val,
            "count": len(results),
            "data": results
        }), 200

    return jsonify({
        "success": False,
        "error": "Provide either 'price' or both 'min_price' and 'max_price'."
    }), 400


@app.route("/api/closest", methods=["GET"])
def closest_budget():
    """
    O(log n) Budget Recommender endpoint:
    Finds:
    - Predecessor (highest price <= budget)
    - Successor (lowest price >= budget)
    - Closest overall node
    - Traversal trace path
    """
    budget_arg = request.args.get("budget")
    if budget_arg is None:
        return jsonify({"success": False, "error": "Query parameter 'budget' is required."}), 400

    valid, budget_val, err = validate_price(budget_arg)
    if not valid:
        return jsonify({"success": False, "error": err}), 400

    result = manager.find_closest_budget(budget_val)
    return jsonify({
        "success": True,
        "data": result
    }), 200


@app.route("/api/tree", methods=["GET"])
def get_tree():
    """Returns the serialized AVL Tree for frontend visualization."""
    tree_data = manager.get_tree_structure()
    return jsonify({
        "success": True,
        "data": tree_data
    }), 200


@app.route("/api/traversals", methods=["GET"])
def get_traversals():
    """Returns all 4 tree traversal sequences (Inorder, Preorder, Postorder, Levelorder BFS)."""
    traversals = manager.get_tree_traversals()
    return jsonify({
        "success": True,
        "data": traversals
    }), 200


@app.route("/api/tree/audit", methods=["GET"])
def audit_tree():
    """Performs deep mathematical validation of AVL Tree balance and BST invariants."""
    audit_data = manager.validate_tree_invariants()
    return jsonify({
        "success": True,
        "data": audit_data
    }), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns statistics derived from the AVL Tree."""
    stats = manager.get_statistics()
    return jsonify({
        "success": True,
        "data": stats
    }), 200


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Returns category breakdown and pricing statistics."""
    categories = manager.get_category_distribution()
    return jsonify({
        "success": True,
        "data": categories
    }), 200


@app.route("/api/export", methods=["GET"])
def export_dataset():
    """Exports full catalog, tree structure, and invariants as JSON."""
    export_data = manager.export_dataset()
    return jsonify({
        "success": True,
        "data": export_data
    }), 200


@app.route("/api/bulk", methods=["POST"])
def bulk_insert():
    """Batch inserts multiple products."""
    payload = request.get_json() or {}
    items = payload.get("products", [])
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"success": False, "error": "Expected a non-empty array of products."}), 400

    res = manager.bulk_add_products(items)
    status_code = 201 if res["success"] else 207
    return jsonify(res), status_code


@app.route("/api/complexity", methods=["GET"])
def get_complexity_reference():
    """Returns algorithmic complexity breakdown for all AVL tree operations."""
    guide = manager.get_complexity_guide()
    latest_op = manager.get_last_operation_metrics()
    return jsonify({
        "success": True,
        "guide": guide,
        "latest_operation": latest_op
    }), 200


@app.route("/api/reset", methods=["POST"])
def reset_samples():
    """Resets product list to original sample data for demonstrations."""
    manager.seed_sample_data()
    return jsonify({
        "success": True,
        "message": "Dataset reset to sample demonstration records."
    }), 200


@app.route("/api/demo-rotation", methods=["POST"])
def demo_rotation():
    """Triggers a 3-element insertion sequence showing LL, RR, LR, or RL rotations."""
    data = request.get_json() or {}
    scenario = data.get("type", "LL")
    result = manager.load_rotation_scenario(scenario)
    if not result.get("success"):
        return jsonify(result), 400
    return jsonify(result), 200


if __name__ == "__main__":
    # Host on 0.0.0.0:5000 so both localhost and 127.0.0.1 can reach the API
    app.run(host="0.0.0.0", port=5000, debug=True)
