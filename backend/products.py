"""
Product Catalog Manager with AVL Tree Price Indexing.

Manages product entities and keeps the AVL Tree synchronized whenever
products are added, updated, or deleted. Also handles optional SQLite persistence.
"""

import os
import sqlite3
from typing import List, Dict, Any, Optional
from avl_tree import AVLTree


class ProductManager:
    """
    Coordinates product storage and AVL Tree price indexing.
    - O(1) direct lookup by product ID via dictionary.
    - O(log n) price-based search, range search, and sorted retrieval via AVL Tree.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.products: Dict[int, Dict[str, Any]] = {}
        self.avl_tree: AVLTree = AVLTree()
        self.next_id: int = 1
        self.db_path: Optional[str] = db_path

        if self.db_path:
            self._init_db()
            self._load_from_db()

        # If empty, populate with helpful sample products
        if not self.products:
            self.seed_sample_data()

    def _init_db(self) -> None:
        """Initializes SQLite schema if persistence is enabled."""
        if not self.db_path:
            return
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL
                )
            """)
            conn.commit()

    def _load_from_db(self) -> None:
        """Loads products from SQLite into memory and reconstructs the AVL tree."""
        if not self.db_path or not os.path.exists(self.db_path):
            return
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, category, price FROM products ORDER BY id ASC")
            rows = cursor.fetchall()

            for row in rows:
                p_id, name, category, price = row
                product = {
                    "id": p_id,
                    "name": name,
                    "category": category,
                    "price": round(float(price), 2),
                }
                self.products[p_id] = product
                self.avl_tree.insert(product["price"], product)
                if p_id >= self.next_id:
                    self.next_id = p_id + 1

    def _persist_product(self, product: Dict[str, Any]) -> None:
        """Saves or updates a product in SQLite."""
        if not self.db_path:
            return
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO products (id, name, category, price)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    category = excluded.category,
                    price = excluded.price
            """, (product["id"], product["name"], product["category"], product["price"]))
            conn.commit()

    def _delete_persisted_product(self, product_id: int) -> None:
        """Deletes a product from SQLite."""
        if not self.db_path:
            return
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
            conn.commit()

    # ---------------------------------------------------------
    # Core Product Operations
    # ---------------------------------------------------------

    def add_product(self, name: str, category: str, price: float) -> Dict[str, Any]:
        """Creates a new product and indexes it into the AVL Tree."""
        product_id = self.next_id
        self.next_id += 1

        product = {
            "id": product_id,
            "name": name.strip(),
            "category": category.strip(),
            "price": round(float(price), 2),
        }

        # Store in dictionary
        self.products[product_id] = product
        # Index in AVL Tree by price
        self.avl_tree.insert(product["price"], product)
        # Optional persistence
        self._persist_product(product)

        return product

    def get_all_products(self) -> List[Dict[str, Any]]:
        """
        Retrieves all products sorted in ascending order of price
        using the AVL Tree's in-order traversal.
        """
        return self.avl_tree.inorder_products()

    def get_product_by_id(self, product_id: int) -> Optional[Dict[str, Any]]:
        """Fetches product details by ID."""
        return self.products.get(product_id)

    def search_by_price(self, price: float) -> List[Dict[str, Any]]:
        """
        Searches products matching the exact price using AVL Tree.
        Complexity: O(log n) where n is distinct price keys.
        """
        return self.avl_tree.search(price)

    def search_by_price_with_trace(self, price: float) -> Dict[str, Any]:
        """Searches products with step-by-step traversal path for educational visualization."""
        return self.avl_tree.search_with_trace(price)

    def load_rotation_scenario(self, scenario_type: str) -> Dict[str, Any]:
        """Loads a clean 3-node sequence demonstrating one of the 4 AVL rotation types."""
        self.products.clear()
        self.avl_tree = AVLTree()
        self.next_id = 1

        if self.db_path and os.path.exists(self.db_path):
            with sqlite3.connect(self.db_path) as conn:
                conn.cursor().execute("DELETE FROM products")
                conn.commit()

        st = scenario_type.upper()
        if st == "LL":
            items = [
                ("Ergonomic Keyboard", "Peripherals", 3000.00),
                ("Wireless Mouse", "Peripherals", 2000.00),
                ("Braided Cable", "Accessories", 1000.00),
            ]
            desc = "LL Imbalance: Inserted 3000.00 \u2192 2000.00 (Left) \u2192 1000.00 (Left). BF of 3000 reached +2. Single Right Rotation performed. 2000.00 is now Root."
        elif st == "RR":
            items = [
                ("Stylus Pen", "Stationery", 1000.00),
                ("Desk Mat", "Office", 2000.00),
                ("Wireless Headphones", "Audio", 3000.00),
            ]
            desc = "RR Imbalance: Inserted 1000.00 \u2192 2000.00 (Right) \u2192 3000.00 (Right). BF of 1000 reached -2. Single Left Rotation performed. 2000.00 is now Root."
        elif st == "LR":
            items = [
                ("LED Desk Lamp", "Home Office", 3000.00),
                ("USB-C Adapter", "Accessories", 1000.00),
                ("Mousepad Pro", "Accessories", 2000.00),
            ]
            desc = "LR Imbalance: Inserted 3000.00 \u2192 1000.00 (Left) \u2192 2000.00 (Right). Double rotation: Left Rotate(1000.00), then Right Rotate(3000.00). 2000.00 is now Root."
        elif st == "RL":
            items = [
                ("Webcam HD", "Displays", 1000.00),
                ("Condenser Mic", "Audio", 3000.00),
                ("Fast Charger", "Electronics", 2000.00),
            ]
            desc = "RL Imbalance: Inserted 1000.00 \u2192 3000.00 (Right) \u2192 2000.00 (Left). Double rotation: Right Rotate(3000.00), then Left Rotate(1000.00). 2000.00 is now Root."
        else:
            return {"success": False, "error": f"Unknown rotation scenario '{scenario_type}'"}

        for name, cat, price in items:
            self.add_product(name, cat, price)

        return {
            "success": True,
            "scenario": st,
            "description": desc,
            "tree": self.avl_tree.to_dict(),
            "stats": self.avl_tree.get_stats(),
        }

    def search_by_range(self, min_price: float, max_price: float) -> List[Dict[str, Any]]:
        """
        Searches products within the range [min_price, max_price]
        using AVL Tree range search pruning.
        """
        return self.avl_tree.range_search(min_price, max_price)

    def update_product(self, product_id: int, name: str, category: str, price: float) -> Optional[Dict[str, Any]]:
        """
        Updates product attributes. If price is modified, re-indexes the product
        in the AVL tree (removes old price entry, inserts at new price).
        """
        product = self.products.get(product_id)
        if not product:
            return None

        old_price = product["price"]
        new_price = round(float(price), 2)

        # Update product fields
        product["name"] = name.strip()
        product["category"] = category.strip()

        if old_price != new_price:
            # Rebalance AVL Tree by deleting old price reference and inserting new price
            self.avl_tree.delete_product(product_id, old_price)
            product["price"] = new_price
            self.avl_tree.insert(new_price, product)
        else:
            product["price"] = new_price

        self._persist_product(product)
        return product

    def delete_product(self, product_id: int) -> bool:
        """
        Deletes a product by ID and removes it from the AVL Tree.
        """
        product = self.products.get(product_id)
        if not product:
            return False

        # Remove from AVL tree
        self.avl_tree.delete_product(product_id, product["price"])
        # Remove from memory map
        del self.products[product_id]
        # Remove from persistence
        self._delete_persisted_product(product_id)

        return True

    def get_tree_structure(self) -> Optional[Dict[str, Any]]:
        """Returns the serialized AVL Tree for frontend visualization."""
        return self.avl_tree.to_dict()

    def get_statistics(self) -> Dict[str, Any]:
        """Calculates dashboard statistics from the AVL Tree."""
        stats = self.avl_tree.get_stats()
        stats["categories_count"] = len(self.get_category_distribution())
        return stats

    def get_last_operation_metrics(self) -> Dict[str, Any]:
        """Returns complexity metrics and rotation count for the most recent insert/delete."""
        return self.avl_tree.last_op_metrics

    def get_complexity_guide(self) -> Dict[str, Any]:
        """Returns algorithmic complexity breakdown for all AVL tree operations."""
        return self.avl_tree.get_complexity_reference()

    def find_closest_budget(self, budget: float) -> Dict[str, Any]:
        """Finds closest product, predecessor, and successor in O(log n) time."""
        return self.avl_tree.find_closest_budget(budget)

    def get_tree_traversals(self) -> Dict[str, Any]:
        """Returns in-order, pre-order, post-order, and level-order sequences."""
        return self.avl_tree.get_all_traversals()

    def validate_tree_invariants(self) -> Dict[str, Any]:
        """Runs complete invariant audit on the AVL Tree."""
        return self.avl_tree.validate_avl_invariants()

    def get_category_distribution(self) -> List[Dict[str, Any]]:
        """Computes product distribution and price ranges grouped by category."""
        cat_map: Dict[str, List[float]] = {}
        for p in self.products.values():
            cat = p["category"]
            cat_map.setdefault(cat, []).append(p["price"])

        results = []
        for cat, prices in cat_map.items():
            results.append({
                "category": cat,
                "count": len(prices),
                "min_price": round(min(prices), 2),
                "max_price": round(max(prices), 2),
                "avg_price": round(sum(prices) / len(prices), 2),
            })
        return sorted(results, key=lambda x: x["count"], reverse=True)

    def bulk_add_products(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Inserts multiple products in batch."""
        added = []
        errors = []
        for i, item in enumerate(items):
            try:
                name = str(item.get("name", "")).strip()
                category = str(item.get("category", "")).strip()
                price = float(item.get("price", 0))
                if not name or not category or price < 0:
                    errors.append(f"Row {i + 1}: Invalid name, category, or negative price.")
                    continue
                product = self.add_product(name, category, price)
                added.append(product)
            except Exception as e:
                errors.append(f"Row {i + 1}: {str(e)}")

        return {
            "success": len(errors) == 0,
            "total_added": len(added),
            "errors": errors,
            "products": added,
        }

    def export_dataset(self) -> Dict[str, Any]:
        """Exports the entire catalog and AVL tree metrics in JSON-ready format."""
        return {
            "catalog": self.get_all_products(),
            "tree": self.get_tree_structure(),
            "statistics": self.get_statistics(),
            "invariants": self.validate_tree_invariants(),
        }

    # ---------------------------------------------------------
    # Sample Dataset
    # ---------------------------------------------------------

    def seed_sample_data(self) -> None:
        """Populates sample products showcasing unique & duplicate prices."""
        self.products.clear()
        self.avl_tree = AVLTree()
        self.next_id = 1

        if self.db_path and os.path.exists(self.db_path):
            with sqlite3.connect(self.db_path) as conn:
                conn.cursor().execute("DELETE FROM products")
                conn.commit()

        samples = [
            ("USB-C Fast Cable", "Electronics", 999.00),
            ("Braided Audio Aux Cable", "Accessories", 999.00),  # Duplicate price
            ("Optical Mouse", "Electronics", 1649.00),
            ("Compact Mechanical Keyboard", "Electronics", 4199.00),
            ("Ergonomic Vertical Mouse", "Electronics", 4199.00),  # Duplicate price
            ("27-inch IPS Monitor", "Displays", 15999.00),
            ("Laptop Stand Aluminium", "Accessories", 2499.00),
            ("Wireless Noise Cancelling Earbuds", "Audio", 6799.00),
            ("Desk LED Lamp", "Home Office", 2899.00),
            ("External SSD 1TB", "Storage", 9299.00),
        ]

        for name, cat, price in samples:
            self.add_product(name, cat, price)
