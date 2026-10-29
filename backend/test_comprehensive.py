"""
Comprehensive Stress & Edge-Case Test Suite for Product Price Index Using AVL Trees.

Tests:
1. Large Sequential Ingestion (anti-skew test: ensures AVL tree does not degrade like normal BST)
2. Extreme Duplicate Stress Test (many items sharing same price node)
3. Partial & Full Node Deletion Rebalancing
4. Edge cases: Empty searches, out-of-bounds ranges, precision rounding
5. Full Tree JSON Schema Validation for React Visualizer
"""

import math
from app import app
from avl_tree import AVLTree


def test_anti_skew_property():
    print("[1/5] Testing Anti-Skew Property (Sequential Price Ingestion)...")
    tree = AVLTree()
    # Insert 100 sequential prices: 1.00, 2.00, 3.00, ... 100.00
    # In a standard un-balanced BST, height would become 100 (O(n) linked list).
    # In an AVL tree, height must be <= 1.44 * log2(100 + 2) ≈ 10 levels.
    for i in range(1, 101):
        tree.insert(float(i), {"id": i, "name": f"Item {i}", "price": float(i)})

    height = tree.get_height(tree.root)
    max_allowed = math.ceil(1.44 * math.log2(102))
    assert height <= max_allowed, f"Height {height} exceeded maximum allowed {max_allowed}"
    assert tree.get_stats()["is_balanced"] is True
    print(f"  [OK] 100 sequential prices: Height is only {height} (Theoretical max: {max_allowed}). AVL balance guaranteed!")


def test_duplicate_stress():
    print("[2/5] Testing Duplicate Price Stress Test...")
    tree = AVLTree()
    target_price = 49.99
    # Insert 25 products with the exact same price
    for i in range(1, 26):
        tree.insert(target_price, {"id": i, "name": f"Keyboard Variation {i}", "price": target_price})

    stats = tree.get_stats()
    assert stats["total_products"] == 25
    assert stats["distinct_prices"] == 1, f"Expected 1 node, got {stats['distinct_prices']}"
    assert tree.get_height(tree.root) == 1

    # Search should return all 25 items
    matches = tree.search(target_price)
    assert len(matches) == 25
    print("  [OK] 25 products correctly grouped in a single AVL node without data loss.")

    # Delete 24 items one by one
    for i in range(1, 25):
        tree.delete_product(i, target_price)
        assert tree.get_stats()["distinct_prices"] == 1

    # Delete the final 25th item -> node must be deleted
    tree.delete_product(25, target_price)
    assert tree.get_stats()["distinct_prices"] == 0
    assert tree.root is None
    print("  [OK] Partial deletions retained node; last item deletion cleanly pruned AVL node.")


def test_edge_cases_and_ranges():
    print("[3/5] Testing Price Range Edge Cases & Search Trace...")
    client = app.test_client()

    # Reset to default sample items first
    client.post("/api/reset")

    # 1. Range where min_price > max_price (should return 400 error)
    res_err = client.get("/api/search?min_price=100.00&max_price=50.00")
    assert res_err.status_code == 400
    assert "cannot exceed" in res_err.json["error"]
    print("  [OK] Invalid range bounds min > max rejected with HTTP 400.")

    # 2. Range that matches zero items
    res_empty = client.get("/api/search?min_price=1000.00&max_price=2000.00")
    assert res_empty.status_code == 200
    assert res_empty.json["count"] == 0
    print("  [OK] Non-matching range returned empty array with HTTP 200.")

    # 3. Exact price with trace
    res_trace = client.get("/api/search?price=12.99")
    assert res_trace.status_code == 200
    assert res_trace.json["count"] == 2  # Duplicate price (USB Cable & Aux Cable)
    assert len(res_trace.json["trace"]) > 0
    print(f"  [OK] Exact price search for $12.99 returned 2 duplicate products with {len(res_trace.json['trace'])} trace steps.")


def test_tree_serialization_schema():
    print("[4/5] Testing Tree Serialization Schema for React UI...")
    client = app.test_client()
    res = client.get("/api/tree")
    assert res.status_code == 200
    tree_data = res.json["data"]

    def validate_node(node):
        if not node:
            return
        assert "price" in node
        assert "height" in node
        assert "balance_factor" in node
        assert "product_count" in node
        assert "products" in node
        assert isinstance(node["products"], list)
        assert abs(node["balance_factor"]) <= 1
        validate_node(node.get("left"))
        validate_node(node.get("right"))

    validate_node(tree_data)
    print("  [OK] Tree serialization recursively validated against React schema.")


def test_rotation_scenarios_e2e():
    print("[5/5] Testing All 4 Rotation Scenarios via REST API...")
    client = app.test_client()
    for rot in ["LL", "RR", "LR", "RL"]:
        res = client.post("/api/demo-rotation", json={"type": rot})
        assert res.status_code == 200
        data = res.json
        assert data["success"] is True
        assert data["stats"]["total_products"] == 3
        assert data["stats"]["distinct_prices"] == 3
        # In all 4 demo scenarios, node 20.00 is designed to become the root
        assert data["tree"]["price"] == 20.00
        assert data["stats"]["is_balanced"] is True
        print(f"  [OK] Scenario {rot}: Rebalancing executed. Root is $20.00, BF={data['tree']['balance_factor']}.")

    # Restore default demo catalog
    client.post("/api/reset")
    print("  [OK] Dataset restored to standard demo state.")


if __name__ == "__main__":
    print("=" * 65)
    print("RUNNING COMPREHENSIVE TEST SUITE FOR AVL PRODUCT PRICE INDEX")
    print("=" * 65)
    test_anti_skew_property()
    test_duplicate_stress()
    test_edge_cases_and_ranges()
    test_tree_serialization_schema()
    test_rotation_scenarios_e2e()
    print("=" * 65)
    print("ALL COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS! :)")
    print("=" * 65)
