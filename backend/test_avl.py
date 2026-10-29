"""
Test suite to verify AVL tree functionality and balance invariants.
Tests:
- All 4 rotation types (LL, RR, LR, RL)
- Duplicate price grouping
- Exact price search & range search
- Product deletion with node cleanup
- Inorder traversal sorted order
"""

from avl_tree import AVLTree


def test_rotations():
    print("Testing 4 AVL Rotations...")

    # 1. LL Rotation (insert 30, 20, 10) -> Right Rotate
    tree_ll = AVLTree()
    tree_ll.insert(30.0, {"id": 1, "name": "Item 30", "price": 30.0})
    tree_ll.insert(20.0, {"id": 2, "name": "Item 20", "price": 20.0})
    tree_ll.insert(10.0, {"id": 3, "name": "Item 10", "price": 10.0})
    assert tree_ll.root.price == 20.0, f"LL failed: root should be 20, got {tree_ll.root.price}"
    assert tree_ll.root.left.price == 10.0
    assert tree_ll.root.right.price == 30.0
    assert tree_ll.get_balance(tree_ll.root) == 0
    print("  [OK] LL Rotation passed")

    # 2. RR Rotation (insert 10, 20, 30) -> Left Rotate
    tree_rr = AVLTree()
    tree_rr.insert(10.0, {"id": 1, "name": "Item 10", "price": 10.0})
    tree_rr.insert(20.0, {"id": 2, "name": "Item 20", "price": 20.0})
    tree_rr.insert(30.0, {"id": 3, "name": "Item 30", "price": 30.0})
    assert tree_rr.root.price == 20.0, f"RR failed: root should be 20, got {tree_rr.root.price}"
    assert tree_rr.root.left.price == 10.0
    assert tree_rr.root.right.price == 30.0
    assert tree_rr.get_balance(tree_rr.root) == 0
    print("  [OK] RR Rotation passed")

    # 3. LR Rotation (insert 30, 10, 20) -> Left Rotate left child, then Right Rotate root
    tree_lr = AVLTree()
    tree_lr.insert(30.0, {"id": 1, "name": "Item 30", "price": 30.0})
    tree_lr.insert(10.0, {"id": 2, "name": "Item 10", "price": 10.0})
    tree_lr.insert(20.0, {"id": 3, "name": "Item 20", "price": 20.0})
    assert tree_lr.root.price == 20.0, f"LR failed: root should be 20, got {tree_lr.root.price}"
    assert tree_lr.root.left.price == 10.0
    assert tree_lr.root.right.price == 30.0
    assert tree_lr.get_balance(tree_lr.root) == 0
    print("  [OK] LR Rotation passed")

    # 4. RL Rotation (insert 10, 30, 20) -> Right Rotate right child, then Left Rotate root
    tree_rl = AVLTree()
    tree_rl.insert(10.0, {"id": 1, "name": "Item 10", "price": 10.0})
    tree_rl.insert(30.0, {"id": 2, "name": "Item 30", "price": 30.0})
    tree_rl.insert(20.0, {"id": 3, "name": "Item 20", "price": 20.0})
    assert tree_rl.root.price == 20.0, f"RL failed: root should be 20, got {tree_rl.root.price}"
    assert tree_rl.root.left.price == 10.0
    assert tree_rl.root.right.price == 30.0
    assert tree_rl.get_balance(tree_rl.root) == 0
    print("  [OK] RL Rotation passed")


def test_duplicates_and_searches():
    print("Testing Duplicates and Search Operations...")
    tree = AVLTree()
    products = [
        {"id": 1, "name": "USB Cable", "category": "Electronics", "price": 9.99},
        {"id": 2, "name": "Stylus Pen", "category": "Stationery", "price": 9.99},
        {"id": 3, "name": "Mousepad", "category": "Accessories", "price": 14.50},
        {"id": 4, "name": "Wireless Mouse", "category": "Electronics", "price": 25.00},
        {"id": 5, "name": "Gaming Mouse", "category": "Electronics", "price": 25.00},
        {"id": 6, "name": "Mechanical Keyboard", "category": "Electronics", "price": 79.99},
        {"id": 7, "name": "Desk Lamp", "category": "Home", "price": 34.00},
    ]

    for p in products:
        tree.insert(p["price"], p)

    # Search exact price with duplicates
    res_999 = tree.search(9.99)
    assert len(res_999) == 2, f"Expected 2 products for 9.99, got {len(res_999)}"
    assert {p["name"] for p in res_999} == {"USB Cable", "Stylus Pen"}
    print("  [OK] Duplicate price search passed")

    # Search non-existent price
    assert tree.search(999.99) == []
    print("  [OK] Non-existent price search passed")

    # Range search
    range_res = tree.range_search(10.00, 35.00)
    # items in [10.00, 35.00]: 14.50 (1), 25.00 (2), 34.00 (1) -> total 4 items
    assert len(range_res) == 4, f"Expected 4 items in range [10, 35], got {len(range_res)}"
    prices = [p["price"] for p in range_res]
    assert prices == sorted(prices), "Range search results must be in ascending order"
    print("  [OK] Range search passed")

    # Inorder products
    all_prods = tree.inorder_products()
    assert len(all_prods) == 7
    all_prices = [p["price"] for p in all_prods]
    assert all_prices == sorted(all_prices)
    print("  [OK] Inorder sorted traversal passed")


def test_deletion():
    print("Testing Deletion and Rebalancing...")
    tree = AVLTree()
    # Insert multiple items
    items = [
        (50.0, 1), (25.0, 2), (75.0, 3), (10.0, 4), (30.0, 5), (60.0, 6), (80.0, 7),
        (25.0, 8), # Duplicate price at 25.0
    ]
    for price, pid in items:
        tree.insert(price, {"id": pid, "name": f"P-{pid}", "price": price})

    stats = tree.get_stats()
    assert stats["total_products"] == 8
    assert stats["distinct_prices"] == 7

    # 1. Delete one duplicate at 25.0 (Product 8)
    del_ok = tree.delete_product(8, 25.0)
    assert del_ok is True
    res_25 = tree.search(25.0)
    assert len(res_25) == 1
    assert res_25[0]["id"] == 2
    # Distinct prices should still be 7 because product 2 still exists at 25.0
    assert tree.get_stats()["distinct_prices"] == 7
    print("  [OK] Deletion of one item from duplicate price node passed")

    # 2. Delete the last item at 25.0 (Product 2) -> node should be removed and AVL balanced
    del_ok2 = tree.delete_product(2, 25.0)
    assert del_ok2 is True
    assert tree.search(25.0) == []
    assert tree.get_stats()["distinct_prices"] == 6
    assert tree.get_stats()["is_balanced"] is True
    print("  [OK] Complete node deletion and rebalancing passed")

    # 3. Delete root node (50.0)
    del_root = tree.delete_product(1, 50.0)
    assert del_root is True
    assert tree.search(50.0) == []
    assert tree.get_stats()["is_balanced"] is True
    print("  [OK] Root node deletion with successor replacement passed")


if __name__ == "__main__":
    test_rotations()
    test_duplicates_and_searches()
    test_deletion()
    print("\nALL AVL TESTS PASSED SUCCESSFULLY! :)")
