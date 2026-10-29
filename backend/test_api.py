"""
Test suite for Flask API endpoints using app.test_client.
"""

from app import app


def run_api_tests():
    client = app.test_client()

    print("Testing API Health...")
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json["status"] == "healthy"
    print("  [OK] /api/health passed")

    print("Testing GET /api/products...")
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json["data"]
    assert len(products) > 0
    # verify sorted by price
    prices = [p["price"] for p in products]
    assert prices == sorted(prices), "Products should be sorted by price ascending"
    print(f"  [OK] /api/products returned {len(products)} sorted products")

    print("Testing GET /api/stats...")
    res = client.get("/api/stats")
    assert res.status_code == 200
    stats = res.json["data"]
    assert stats["total_products"] == len(products)
    assert stats["is_balanced"] is True
    print(f"  [OK] /api/stats: {stats['total_products']} products, tree height: {stats['tree_height']}")

    print("Testing POST /api/products...")
    new_item = {"name": "Test Wireless Charger", "category": "Accessories", "price": 24.50}
    res = client.post("/api/products", json=new_item)
    assert res.status_code == 201
    created = res.json["data"]
    created_id = created["id"]
    print(f"  [OK] POST /api/products created ID {created_id}")

    print("Testing Search by exact price with trace...")
    res = client.get("/api/search?price=24.50")
    assert res.status_code == 200
    assert any(p["id"] == created_id for p in res.json["data"])
    assert "trace" in res.json
    assert len(res.json["trace"]) > 0
    print(f"  [OK] Search by exact price passed with {len(res.json['trace'])} trace steps")

    print("Testing Search by price range...")
    res = client.get("/api/search?min_price=20.00&max_price=30.00")
    assert res.status_code == 200
    range_items = res.json["data"]
    assert all(20.00 <= p["price"] <= 30.00 for p in range_items)
    print(f"  [OK] Search by price range found {len(range_items)} items")

    print("Testing PUT /api/products/<id>...")
    res = client.put(f"/api/products/{created_id}", json={
        "name": "Test Wireless Charger Pro",
        "category": "Accessories",
        "price": 29.99
    })
    assert res.status_code == 200
    assert res.json["data"]["name"] == "Test Wireless Charger Pro"
    assert res.json["data"]["price"] == 29.99
    print("  [OK] PUT /api/products passed")

    print("Testing DELETE /api/products/<id>...")
    res = client.delete(f"/api/products/{created_id}")
    assert res.status_code == 200
    # verify item is gone
    res_verify = client.get("/api/search?price=29.99")
    assert not any(p["id"] == created_id for p in res_verify.json["data"])
    print("  [OK] DELETE /api/products passed")

    print("Testing GET /api/tree...")
    res = client.get("/api/tree")
    assert res.status_code == 200
    tree_dict = res.json["data"]
    assert "price" in tree_dict
    assert "balance_factor" in tree_dict
    assert "height" in tree_dict
    print("  [OK] GET /api/tree structure verified")

    print("Testing Demo Rotation Scenarios (LL, RR, LR, RL)...")
    for rot in ["LL", "RR", "LR", "RL"]:
        res_rot = client.post("/api/demo-rotation", json={"type": rot})
        assert res_rot.status_code == 200
        assert res_rot.json["success"] is True
        assert res_rot.json["stats"]["is_balanced"] is True
        print(f"  [OK] Demo rotation {rot} verified")

    # Reset back to default sample dataset
    res_reset = client.post("/api/reset")
    assert res_reset.status_code == 200
    print("  [OK] Reset demo data verified")

    print("\nALL API ENDPOINT TESTS PASSED SUCCESSFULLY! :)")


if __name__ == "__main__":
    run_api_tests()
