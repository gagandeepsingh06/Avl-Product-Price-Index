"""
AVL Tree Implementation for Product Price Indexing.

This module implements a self-balancing AVL Binary Search Tree where each node
represents a unique price key. Multiple products sharing the same price are stored
in a list within the corresponding price node.

Balance Factor Formula:
    BF(node) = height(node.left) - height(node.right)
AVL Invariant:
    -1 <= BF(node) <= 1 for all nodes in the tree.
"""

from typing import List, Dict, Any, Optional


class AVLNode:
    """Represents a node in the AVL Tree indexed by price."""

    def __init__(self, price: float, product: Optional[Dict[str, Any]] = None):
        self.price: float = round(float(price), 2)
        self.products: List[Dict[str, Any]] = [product] if product is not None else []
        self.height: int = 1
        self.left: Optional[AVLNode] = None
        self.right: Optional[AVLNode] = None

    def __repr__(self) -> str:
        return f"AVLNode(price={self.price}, items={len(self.products)}, h={self.height})"


class AVLTree:
    """Self-balancing Binary Search Tree (AVL) for indexing products by price."""

    def __init__(self):
        self.root: Optional[AVLNode] = None

    # ---------------------------------------------------------
    # Height & Balance Factor Utilities
    # ---------------------------------------------------------

    def get_height(self, node: Optional[AVLNode]) -> int:
        """Returns height of node, or 0 if node is None."""
        if not node:
            return 0
        return node.height

    def get_balance(self, node: Optional[AVLNode]) -> int:
        """
        Calculates balance factor of a node:
        BF = height(left_subtree) - height(right_subtree)
        """
        if not node:
            return 0
        return self.get_height(node.left) - self.get_height(node.right)

    def _update_height(self, node: AVLNode) -> None:
        """Recalculates and updates the height of a given node."""
        node.height = 1 + max(self.get_height(node.left), self.get_height(node.right))

    # ---------------------------------------------------------
    # Rotations
    # ---------------------------------------------------------

    def _right_rotate(self, y: AVLNode) -> AVLNode:
        r"""
        Right Rotation (LL Case):
              y                             x
             / \                           / \
            x   T3   -- Right Rotate ->   T1  y
           / \                               / \
          T1  T2                            T2  T3
        """
        x = y.left
        assert x is not None
        t2 = x.right

        # Perform rotation
        x.right = y
        y.left = t2

        # Update heights (child first, then parent)
        self._update_height(y)
        self._update_height(x)

        return x

    def _left_rotate(self, x: AVLNode) -> AVLNode:
        r"""
        Left Rotation (RR Case):
            x                               y
           / \                             / \
          T1  y     -- Left Rotate ->     x   T3
             / \                         / \
            T2  T3                      T1  T2
        """
        y = x.right
        assert y is not None
        t2 = y.left

        # Perform rotation
        y.left = x
        x.right = t2

        # Update heights (child first, then parent)
        self._update_height(x)
        self._update_height(y)

        return y

    # ---------------------------------------------------------
    # Insertion
    # ---------------------------------------------------------

    def insert(self, price: float, product: Dict[str, Any]) -> None:
        """Public method to insert a product at a given price."""
        norm_price = round(float(price), 2)
        self.root = self._insert_node(self.root, norm_price, product)

    def _insert_node(self, node: Optional[AVLNode], price: float, product: Dict[str, Any]) -> AVLNode:
        """Recursive helper to insert product and rebalance tree."""
        # 1. Standard BST insertion
        if not node:
            return AVLNode(price, product)

        if price == node.price:
            # Handle duplicate prices: append to node's product list without creating a new node
            node.products.append(product)
            return node
        elif price < node.price:
            node.left = self._insert_node(node.left, price, product)
        else:
            node.right = self._insert_node(node.right, price, product)

        # 2. Update height of current ancestor node
        self._update_height(node)

        # 3. Get balance factor to check if this node became unbalanced
        balance = self.get_balance(node)

        # 4. If unbalanced, apply one of 4 rotation cases:

        # Case 1: Left Left (LL)
        if balance > 1 and price < node.left.price:
            return self._right_rotate(node)

        # Case 2: Right Right (RR)
        if balance < -1 and price > node.right.price:
            return self._left_rotate(node)

        # Case 3: Left Right (LR)
        if balance > 1 and price > node.left.price:
            node.left = self._left_rotate(node.left)
            return self._right_rotate(node)

        # Case 4: Right Left (RL)
        if balance < -1 and price < node.right.price:
            node.right = self._right_rotate(node.right)
            return self._left_rotate(node)

        return node

    # ---------------------------------------------------------
    # Deletion
    # ---------------------------------------------------------

    def _get_min_value_node(self, node: AVLNode) -> AVLNode:
        """Finds the node with the minimum price key (leftmost child)."""
        current = node
        while current.left is not None:
            current = current.left
        return current

    def delete_product(self, product_id: int, price: float) -> bool:
        """
        Deletes a specific product by product_id at the specified price.
        If the node's product list becomes empty, removes the price node from AVL.
        Returns True if product was found and removed, False otherwise.
        """
        norm_price = round(float(price), 2)
        found = [False]
        self.root = self._delete_helper(self.root, norm_price, product_id, found)
        return found[0]

    def _delete_helper(self, node: Optional[AVLNode], price: float, product_id: int, found: List[bool]) -> Optional[AVLNode]:
        """Recursive helper to locate product, remove it, and delete price node if empty."""
        if not node:
            return None

        if price < node.price:
            node.left = self._delete_helper(node.left, price, product_id, found)
        elif price > node.price:
            node.right = self._delete_helper(node.right, price, product_id, found)
        else:
            # Found matching price node
            initial_count = len(node.products)
            node.products = [p for p in node.products if p.get("id") != product_id]

            if len(node.products) < initial_count:
                found[0] = True

            # If node still has products at this price, no AVL structural deletion needed
            if len(node.products) > 0:
                return node

            # If no products remain at this price, remove the AVL node itself
            # Node with only one child or no child
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            # Node with two children: get in-order successor (smallest in the right subtree)
            successor = self._get_min_value_node(node.right)

            # Copy successor data to this node
            node.price = successor.price
            node.products = list(successor.products)

            # Delete the successor node from the right subtree
            # We pass a dummy found flag since we are deleting the successor node entirely
            dummy_flag = [False]
            node.right = self._delete_node_by_price(node.right, successor.price, dummy_flag)

        # Update height and balance
        self._update_height(node)
        balance = self.get_balance(node)

        # Balance the node:
        # Case 1: Left Left (LL)
        if balance > 1 and self.get_balance(node.left) >= 0:
            return self._right_rotate(node)

        # Case 2: Left Right (LR)
        if balance > 1 and self.get_balance(node.left) < 0:
            node.left = self._left_rotate(node.left)
            return self._right_rotate(node)

        # Case 3: Right Right (RR)
        if balance < -1 and self.get_balance(node.right) <= 0:
            return self._left_rotate(node)

        # Case 4: Right Left (RL)
        if balance < -1 and self.get_balance(node.right) > 0:
            node.right = self._right_rotate(node.right)
            return self._left_rotate(node)

        return node

    def _delete_node_by_price(self, node: Optional[AVLNode], price: float, found: List[bool]) -> Optional[AVLNode]:
        """Removes an entire price node from the AVL tree and rebalances."""
        if not node:
            return None

        if price < node.price:
            node.left = self._delete_node_by_price(node.left, price, found)
        elif price > node.price:
            node.right = self._delete_node_by_price(node.right, price, found)
        else:
            found[0] = True
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            successor = self._get_min_value_node(node.right)
            node.price = successor.price
            node.products = list(successor.products)
            node.right = self._delete_node_by_price(node.right, successor.price, found)

        self._update_height(node)
        balance = self.get_balance(node)

        if balance > 1 and self.get_balance(node.left) >= 0:
            return self._right_rotate(node)

        if balance > 1 and self.get_balance(node.left) < 0:
            node.left = self._left_rotate(node.left)
            return self._right_rotate(node)

        if balance < -1 and self.get_balance(node.right) <= 0:
            return self._left_rotate(node)

        if balance < -1 and self.get_balance(node.right) > 0:
            node.right = self._right_rotate(node.right)
            return self._left_rotate(node)

        return node

    # ---------------------------------------------------------
    # Search Operations
    # ---------------------------------------------------------

    def search(self, price: float) -> List[Dict[str, Any]]:
        """Searches for products with an exact price. Time Complexity: O(log n)."""
        norm_price = round(float(price), 2)
        current = self.root
        while current:
            if norm_price == current.price:
                return list(current.products)
            elif norm_price < current.price:
                current = current.left
            else:
                current = current.right
        return []

    def search_with_trace(self, price: float) -> Dict[str, Any]:
        """
        Searches for products with exact price and records the step-by-step
        comparison path traversed through the AVL Tree nodes.
        """
        norm_price = round(float(price), 2)
        current = self.root
        trace: List[Dict[str, Any]] = []

        while current:
            step: Dict[str, Any] = {
                "price": current.price,
                "height": current.height,
                "balance_factor": self.get_balance(current),
            }
            if norm_price == current.price:
                step["action"] = "match"
                step["message"] = f"Match found at ${current.price:.2f} ({len(current.products)} product{'s' if len(current.products) > 1 else ''})"
                trace.append(step)
                return {"found": True, "products": list(current.products), "trace": trace}
            elif norm_price < current.price:
                step["action"] = "left"
                step["message"] = f"${norm_price:.2f} < ${current.price:.2f} \u2192 Traverse Left"
                trace.append(step)
                current = current.left
            else:
                step["action"] = "right"
                step["message"] = f"${norm_price:.2f} > ${current.price:.2f} \u2192 Traverse Right"
                trace.append(step)
                current = current.right

        if not trace:
            trace.append({"price": None, "action": "empty", "message": "Tree is empty"})

        return {"found": False, "products": [], "trace": trace}

    def range_search(self, min_price: float, max_price: float) -> List[Dict[str, Any]]:
        """
        Finds all products whose price falls in [min_price, max_price].
        Prunes subtrees that fall outside the range for optimal search.
        """
        results: List[Dict[str, Any]] = []
        low = round(float(min_price), 2)
        high = round(float(max_price), 2)

        def _range_helper(node: Optional[AVLNode]) -> None:
            if not node:
                return

            # If current price is greater than low, left subtree might have qualifying prices
            if node.price > low:
                _range_helper(node.left)

            # If current price is in range, include its products
            if low <= node.price <= high:
                results.extend(node.products)

            # If current price is less than high, right subtree might have qualifying prices
            if node.price < high:
                _range_helper(node.right)

        _range_helper(self.root)
        return results

    # ---------------------------------------------------------
    # Traversal
    # ---------------------------------------------------------

    def inorder_products(self) -> List[Dict[str, Any]]:
        """
        Performs in-order traversal (Left, Root, Right).
        Returns all products in ascending order of price.
        Time Complexity: O(N) where N is total products.
        """
        ordered: List[Dict[str, Any]] = []

        def _inorder(node: Optional[AVLNode]) -> None:
            if not node:
                return
            _inorder(node.left)
            ordered.extend(node.products)
            _inorder(node.right)

        _inorder(self.root)
        return ordered

    # ---------------------------------------------------------
    # Serialization & Statistics (for React UI Visualization)
    # ---------------------------------------------------------

    def to_dict(self, node: Optional[AVLNode] = None, is_root: bool = True) -> Optional[Dict[str, Any]]:
        """
        Serializes the tree into a nested dictionary structure
        suitable for JSON API and React hierarchical visualization.
        """
        target = self.root if is_root else node
        if not target:
            return None

        return {
            "price": target.price,
            "height": target.height,
            "balance_factor": self.get_balance(target),
            "product_count": len(target.products),
            "products": target.products,
            "left": self.to_dict(target.left, is_root=False),
            "right": self.to_dict(target.right, is_root=False),
        }

    def get_stats(self) -> Dict[str, Any]:
        """Calculates statistics: counts, min, max, average price, tree height."""
        products = self.inorder_products()
        total_products = len(products)

        if total_products == 0:
            return {
                "total_products": 0,
                "distinct_prices": 0,
                "min_price": 0.0,
                "max_price": 0.0,
                "avg_price": 0.0,
                "tree_height": 0,
                "is_balanced": True,
            }

        prices = [p["price"] for p in products]
        distinct_count = self._count_nodes(self.root)
        is_balanced = self._check_is_balanced(self.root)

        return {
            "total_products": total_products,
            "distinct_prices": distinct_count,
            "min_price": round(min(prices), 2),
            "max_price": round(max(prices), 2),
            "avg_price": round(sum(prices) / total_products, 2),
            "tree_height": self.get_height(self.root),
            "is_balanced": is_balanced,
        }

    def _count_nodes(self, node: Optional[AVLNode]) -> int:
        """Returns the number of unique price nodes in the tree."""
        if not node:
            return 0
        return 1 + self._count_nodes(node.left) + self._count_nodes(node.right)

    def _check_is_balanced(self, node: Optional[AVLNode]) -> bool:
        """Verifies if the subtree satisfies AVL balance condition at every node."""
        if not node:
            return True
        bf = abs(self.get_balance(node))
        if bf > 1:
            return False
        return self._check_is_balanced(node.left) and self._check_is_balanced(node.right)
