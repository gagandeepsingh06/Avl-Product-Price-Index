"""
Flask REST API for Product Price Index Using AVL Trees.

Endpoints:
- GET /api/products         - Retrieve all products (ordered by price via AVL in-order traversal)
- POST /api/products        - Add new product
- PUT /api/products/<id>    - Update product
- DELETE /api/products/<id> - Delete product
- GET /api/search           - Search by price (?price=...) or range (?min_price=...&max_price=...)
- GET /api/tree             - Get serialized AVL Tree structure
- GET /api/stats            - Get product and AVL tree statistics
- POST /api/reset           - Reset dataset to default demonstration samples
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from products import ProductManager

app = Flask(__name__)
# Enable CORS for frontend Vite development server (typically localhost:5173 or localhost:3000)
CORS(app)

# Use SQLite in backend directory
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "products.db")
manager = ProductManager(db_path=DB_FILE)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "healthy", "service": "AVL Product Price Index API"}), 200


@app.route("/api/products", methods=["GET"])
def get_products():
    """Returns all products ordered by price using AVL in-order traversal."""
    products = manager.get_all_products()
    return jsonify({
        "success": True,
        "count": len(products),
        "data": products
    }), 200


@app.route("/api/products", methods=["POST"])
def add_product():
    """Adds a new product to the index."""
    data = request.get_json() or {}
    name = data.get("name")
    category = data.get("category")
    price = data.get("price")

    if not name or not category or price is None:
        return jsonify({
            "success": False,
            "error": "Fields 'name', 'category', and 'price' are required."
        }), 400

    try:
        price_val = float(price)
        if price_val < 0:
            return jsonify({"success": False, "error": "Price must be non-negative."}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid price format."}), 400

    product = manager.add_product(name, category, price_val)
    return jsonify({
        "success": True,
        "message": f"Product '{name}' added successfully at ${product['price']:.2f}",
        "data": product
    }), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id: int):
    """Updates an existing product's details and price."""
    data = request.get_json() or {}
    name = data.get("name")
    category = data.get("category")
    price = data.get("price")

    if not name or not category or price is None:
        return jsonify({
            "success": False,
            "error": "Fields 'name', 'category', and 'price' are required."
        }), 400

    try:
        price_val = float(price)
        if price_val < 0:
            return jsonify({"success": False, "error": "Price must be non-negative."}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid price format."}), 400

    updated = manager.update_product(product_id, name, category, price_val)
    if not updated:
        return jsonify({"success": False, "error": f"Product with ID {product_id} not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Product {product_id} updated successfully.",
        "data": updated
    }), 200


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id: int):
    """Deletes a product by ID and updates the AVL Tree index."""
    success = manager.delete_product(product_id)
    if not success:
        return jsonify({"success": False, "error": f"Product with ID {product_id} not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Product {product_id} deleted successfully."
    }), 200


@app.route("/api/search", methods=["GET"])
def search_products():
    """
    Search endpoint supporting:
    - Exact price: ?price=29.99
    - Price range: ?min_price=10&max_price=50
    """
    price = request.args.get("price")
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")

    if price is not None:
        try:
            val = float(price)
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
        except ValueError:
            return jsonify({"success": False, "error": "Invalid price parameter."}), 400

    if min_price is not None and max_price is not None:
        try:
            min_val = float(min_price)
            max_val = float(max_price)
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
        except ValueError:
            return jsonify({"success": False, "error": "Invalid range parameters."}), 400

    return jsonify({
        "success": False,
        "error": "Provide either 'price' or both 'min_price' and 'max_price'."
    }), 400


@app.route("/api/tree", methods=["GET"])
def get_tree():
    """Returns the AVL Tree hierarchical structure for frontend visualization."""
    tree_data = manager.get_tree_structure()
    return jsonify({
        "success": True,
        "data": tree_data
    }), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns statistics derived from the AVL Tree."""
    stats = manager.get_statistics()
    return jsonify({
        "success": True,
        "data": stats
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
    # Host on 0.0.0.0 or 127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)
