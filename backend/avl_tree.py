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
        self.last_op_metrics: Dict[str, Any] = {}

    @staticmethod
    def get_complexity_reference() -> Dict[str, Any]:
        """Provides theoretical algorithmic complexity details for AVL operations."""
        return {
            "add": {
                "operation": "Adding a Product (AVL Insertion)",
                "time_complexity": "O(log n)",
                "best_case": "O(1) - when chaining into existing price node",
                "average_case": "O(log n)",
                "worst_case": "O(log n)",
                "space_complexity": "O(1) auxiliary, O(log n) call stack",
                "max_rotations": "At most 1 Single (LL/RR) or 1 Double (LR/RL) rotation",
                "description": (
                    "Inserting a product requires descending the tree from root to leaf in O(log n) time. "
                    "Ancestor heights are updated on recursion unwinding. If an imbalance (|BF| > 1) occurs, "
                    "at most ONE rotation (LL, RR, LR, or RL) completely restores the entire tree's AVL property."
                ),
                "steps": [
                    "BST Descent: Compare new price with current node; branch Left or Right (O(log n))",
                    "Node Attachment: Insert new AVLNode or append to duplicate products list (O(1))",
                    "Height Recalculation: Update node.height = 1 + max(left.h, right.h) along the path",
                    "Balance Verification: Compute BF = height(left) - height(right)",
                    "Single/Double Rotation: If |BF| > 1, perform 1 rotation in O(1) time to rebalance"
                ]
            },
            "remove": {
                "operation": "Removing a Product (AVL Deletion)",
                "time_complexity": "O(log n)",
                "best_case": "O(1) - when removing from duplicate bucket without pruning node",
                "average_case": "O(log n)",
                "worst_case": "O(log n)",
                "space_complexity": "O(1) auxiliary, O(log n) call stack",
                "max_rotations": "Up to O(log n) cascade rotations up to root",
                "description": (
                    "Deleting locates the price node in O(log n) time. If other products share the price, "
                    "the item is removed in O(1) with 0 tree modifications. If the node becomes empty, "
                    "it is spliced out or replaced with its in-order successor. Unlike insertion, deletion "
                    "can trigger cascade rebalancing rotations at multiple ancestor levels up to the root."
                ),
                "steps": [
                    "BST Search: Locate target price node in O(log n) time",
                    "Bucket Inspection: If node holds multiple products, pop product in O(1); node stays intact",
                    "Node Splicing: If empty, splice leaf/single-child or substitute in-order successor (min of right)",
                    "Height Recalculation: Update heights along ancestor path up to root (O(log n))",
                    "Cascade Rebalancing: Perform LL, RR, LR, or RL rotations at every unbalanced ancestor level"
                ]
            },
            "exact_search": {
                "operation": "Search by Exact Price",
                "time_complexity": "O(log n)",
                "space_complexity": "O(1) auxiliary",
                "description": "Standard binary search tree lookup bounded by AVL maximum height 1.44 * log2(n+2)."
            },
            "range_search": {
                "operation": "Search by Price Range [min, max]",
                "time_complexity": "O(log n + k)",
                "space_complexity": "O(k) where k is matching items",
                "description": "Logarithmic descent to range boundaries with aggressive subtree pruning."
            },
            "inorder_traversal": {
                "operation": "Sorted Catalog Display (In-Order)",
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "description": "In-Order traversal (Left, Root, Right) yields natural sorted order in linear time."
            }
        }

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
        initial_height = self.get_height(self.root)
        rotations: List[str] = []
        comparisons = [0]
        duplicate = [False]

        self.root = self._insert_node_tracked(self.root, norm_price, product, comparisons, duplicate, rotations)
        new_height = self.get_height(self.root)

        self.last_op_metrics = {
            "operation": "add",
            "entity": product.get("name", "Product"),
            "price": norm_price,
            "time_complexity": "O(log n)",
            "space_complexity": "O(1) auxiliary, O(log n) call stack",
            "comparisons": comparisons[0],
            "tree_height_before": initial_height,
            "tree_height_after": new_height,
            "duplicate_node": duplicate[0],
            "rotations": rotations,
            "rotations_count": len(rotations),
            "max_theoretical_rotations": 1,
            "explanation": (
                f"Inserted \u20b9{norm_price:.2f} using {comparisons[0]} tree level comparisons. "
                f"{'Appended into existing shared price node (0 structural tree changes).' if duplicate[0] else 'Indexed new price key into AVL tree.'} "
                f"{'Rebalanced using ' + ', '.join(rotations) + ' in O(1) time.' if rotations else 'AVL balance condition held (|BF| <= 1), requiring 0 rotations.'}"
            )
        }

    def _insert_node(self, node: Optional[AVLNode], price: float, product: Dict[str, Any]) -> AVLNode:
        """Standard helper for compatibility."""
        return self._insert_node_tracked(node, price, product, [0], [False], [])

    def _insert_node_tracked(
        self,
        node: Optional[AVLNode],
        price: float,
        product: Dict[str, Any],
        comparisons: List[int],
        duplicate: List[bool],
        rotations: List[str],
    ) -> AVLNode:
        """Recursive helper to insert product, count comparisons, and rebalance tree."""
        # 1. Standard BST insertion
        if not node:
            return AVLNode(price, product)

        comparisons[0] += 1
        if price == node.price:
            # Handle duplicate prices: append to node's product list without creating a new node
            duplicate[0] = True
            node.products.append(product)
            return node
        elif price < node.price:
            node.left = self._insert_node_tracked(node.left, price, product, comparisons, duplicate, rotations)
        else:
            node.right = self._insert_node_tracked(node.right, price, product, comparisons, duplicate, rotations)

        # 2. Update height of current ancestor node
        self._update_height(node)

        # 3. Get balance factor to check if this node became unbalanced
        balance = self.get_balance(node)

        # 4. If unbalanced, apply one of 4 rotation cases:

        # Case 1: Left Left (LL)
        if balance > 1 and price < node.left.price:
            rotations.append("Right Rotation (LL)")
            return self._right_rotate(node)

        # Case 2: Right Right (RR)
        if balance < -1 and price > node.right.price:
            rotations.append("Left Rotation (RR)")
            return self._left_rotate(node)

        # Case 3: Left Right (LR)
        if balance > 1 and price > node.left.price:
            rotations.append("Double Left-Right Rotation (LR)")
            node.left = self._left_rotate(node.left)
            return self._right_rotate(node)

        # Case 4: Right Left (RL)
        if balance < -1 and price < node.right.price:
            rotations.append("Double Right-Left Rotation (RL)")
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
        initial_height = self.get_height(self.root)
        found = [False]
        comparisons = [0]
        pruned_node = [False]
        rotations: List[str] = []

        self.root = self._delete_helper_tracked(
            self.root, norm_price, product_id, found, comparisons, pruned_node, rotations
        )
        new_height = self.get_height(self.root)

        self.last_op_metrics = {
            "operation": "delete",
            "product_id": product_id,
            "price": norm_price,
            "time_complexity": "O(log n)",
            "space_complexity": "O(1) auxiliary, O(log n) call stack",
            "comparisons": comparisons[0],
            "tree_height_before": initial_height,
            "tree_height_after": new_height,
            "node_pruned": pruned_node[0],
            "rotations": rotations,
            "rotations_count": len(rotations),
            "max_theoretical_rotations": "Up to O(log n) cascade rotations",
            "explanation": (
                f"Searched price \u20b9{norm_price:.2f} across {comparisons[0]} tree levels in O(log n) time. "
                f"{'Removed item and pruned empty price node.' if pruned_node[0] else 'Removed item from duplicate bucket; price node retained in AVL tree.'} "
                f"{'Rebalanced with ' + ', '.join(rotations) + '.' if rotations else 'Tree remained strictly balanced (|BF| <= 1), requiring 0 rotations.'}"
            )
        }
        return found[0]

    def _delete_helper(self, node: Optional[AVLNode], price: float, product_id: int, found: List[bool]) -> Optional[AVLNode]:
        """Standard helper for compatibility."""
        return self._delete_helper_tracked(node, price, product_id, found, [0], [False], [])

    def _delete_helper_tracked(
        self,
        node: Optional[AVLNode],
        price: float,
        product_id: int,
        found: List[bool],
        comparisons: List[int],
        pruned_node: List[bool],
        rotations: List[str],
    ) -> Optional[AVLNode]:
        """Recursive helper to locate product, remove it, and delete price node if empty."""
        if not node:
            return None

        comparisons[0] += 1
        if price < node.price:
            node.left = self._delete_helper_tracked(node.left, price, product_id, found, comparisons, pruned_node, rotations)
        elif price > node.price:
            node.right = self._delete_helper_tracked(node.right, price, product_id, found, comparisons, pruned_node, rotations)
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
            pruned_node[0] = True

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
            dummy_flag = [False]
            node.right = self._delete_node_by_price(node.right, successor.price, dummy_flag)

        # Update height and balance
        self._update_height(node)
        balance = self.get_balance(node)

        # Balance the node:
        # Case 1: Left Left (LL)
        if balance > 1 and self.get_balance(node.left) >= 0:
            rotations.append("Right Rotation (LL)")
            return self._right_rotate(node)

        # Case 2: Left Right (LR)
        if balance > 1 and self.get_balance(node.left) < 0:
            rotations.append("Double Left-Right Rotation (LR)")
            node.left = self._left_rotate(node.left)
            return self._right_rotate(node)

        # Case 3: Right Right (RR)
        if balance < -1 and self.get_balance(node.right) <= 0:
            rotations.append("Left Rotation (RR)")
            return self._left_rotate(node)

        # Case 4: Right Left (RL)
        if balance < -1 and self.get_balance(node.right) > 0:
            rotations.append("Double Right-Left Rotation (RL)")
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
                step["message"] = f"Match found at \u20b9{current.price:.2f} ({len(current.products)} product{'s' if len(current.products) > 1 else ''})"
                trace.append(step)
                return {"found": True, "products": list(current.products), "trace": trace}
            elif norm_price < current.price:
                step["action"] = "left"
                step["message"] = f"\u20b9{norm_price:.2f} < \u20b9{current.price:.2f} \u2192 Traverse Left"
                trace.append(step)
                current = current.left
            else:
                step["action"] = "right"
                step["message"] = f"\u20b9{norm_price:.2f} > \u20b9{current.price:.2f} \u2192 Traverse Right"
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
    # Traversal & Advanced Analytics
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

    def find_min_node(self) -> Optional[AVLNode]:
        """
        Finds the node with the minimum price in O(log n) time
        by traversing left pointers only.
        """
        if not self.root:
            return None
        current = self.root
        while current.left:
            current = current.left
        return current

    def find_max_node(self) -> Optional[AVLNode]:
        """
        Finds the node with the maximum price in O(log n) time
        by traversing right pointers only.
        """
        if not self.root:
            return None
        current = self.root
        while current.right:
            current = current.right
        return current

    def find_closest_budget(self, budget: float) -> Dict[str, Any]:
        """
        Finds products closest to a target budget using AVL logarithmic traversal:
        - Exact match (if price == budget)
        - Predecessor (highest price <= budget)
        - Successor (lowest price >= budget)
        - Closest overall node
        Includes step-by-step traversal trace for UI visualization.
        Time Complexity: O(log n).
        """
        target = round(float(budget), 2)
        if not self.root:
            return {
                "budget": target,
                "found_exact": False,
                "exact_products": [],
                "predecessor": None,
                "successor": None,
                "closest": None,
                "trace": [{"message": "AVL Tree is empty.", "action": "empty"}],
            }

        current = self.root
        trace: List[Dict[str, Any]] = []
        pred_node: Optional[AVLNode] = None
        succ_node: Optional[AVLNode] = None
        exact_node: Optional[AVLNode] = None

        while current:
            step: Dict[str, Any] = {
                "price": current.price,
                "height": current.height,
                "balance_factor": self.get_balance(current),
            }

            if abs(current.price - target) < 0.001:
                step["action"] = "exact"
                step["message"] = f"Budget match: \u20b9{current.price:.2f} matches \u20b9{target:.2f} exactly!"
                trace.append(step)
                exact_node = current
                pred_node = current
                succ_node = current
                break
            elif target < current.price:
                succ_node = current  # Potential successor (cheapest item above budget)
                step["action"] = "left"
                step["message"] = f"\u20b9{target:.2f} < \u20b9{current.price:.2f} \u2192 Traverse Left (candidate successor: \u20b9{current.price:.2f})"
                trace.append(step)
                current = current.left
            else:
                pred_node = current  # Potential predecessor (most expensive item within budget)
                step["action"] = "right"
                step["message"] = f"\u20b9{target:.2f} > \u20b9{current.price:.2f} \u2192 Traverse Right (candidate predecessor: \u20b9{current.price:.2f})"
                trace.append(step)
                current = current.right

        def _node_summary(n: Optional[AVLNode]) -> Optional[Dict[str, Any]]:
            if not n:
                return None
            return {
                "price": n.price,
                "height": n.height,
                "balance_factor": self.get_balance(n),
                "count": len(n.products),
                "products": list(n.products),
            }

        # Determine closest overall node
        closest_node = exact_node
        if not closest_node:
            if pred_node and succ_node:
                diff_pred = abs(target - pred_node.price)
                diff_succ = abs(succ_node.price - target)
                closest_node = pred_node if diff_pred <= diff_succ else succ_node
            else:
                closest_node = pred_node or succ_node

        return {
            "budget": target,
            "found_exact": exact_node is not None,
            "exact_products": list(exact_node.products) if exact_node else [],
            "predecessor": _node_summary(pred_node),
            "successor": _node_summary(succ_node),
            "closest": _node_summary(closest_node),
            "trace": trace,
        }

    def get_all_traversals(self) -> Dict[str, Any]:
        """
        Computes all 4 fundamental tree traversal orders:
        1. In-Order (Left, Root, Right) -> Ascending sorted prices
        2. Pre-Order (Root, Left, Right) -> Tree reconstruction order
        3. Post-Order (Left, Right, Root) -> Bottom-up evaluation order
        4. Level-Order (BFS) -> Breadth-First row by row with depth levels
        """
        inorder_nodes: List[Dict[str, Any]] = []
        preorder_nodes: List[Dict[str, Any]] = []
        postorder_nodes: List[Dict[str, Any]] = []

        def _traverse(node: Optional[AVLNode]) -> None:
            if not node:
                return

            node_info = {
                "price": node.price,
                "height": node.height,
                "balance_factor": self.get_balance(node),
                "product_count": len(node.products),
            }

            preorder_nodes.append(node_info)
            _traverse(node.left)
            inorder_nodes.append(node_info)
            _traverse(node.right)
            postorder_nodes.append(node_info)

        _traverse(self.root)

        # Level-order (BFS)
        levelorder_nodes: List[Dict[str, Any]] = []
        if self.root:
            queue: List[tuple[AVLNode, int]] = [(self.root, 0)]
            while queue:
                curr, depth = queue.pop(0)
                levelorder_nodes.append({
                    "price": curr.price,
                    "depth": depth,
                    "height": curr.height,
                    "balance_factor": self.get_balance(curr),
                    "product_count": len(curr.products),
                })
                if curr.left:
                    queue.append((curr.left, depth + 1))
                if curr.right:
                    queue.append((curr.right, depth + 1))

        return {
            "inorder": inorder_nodes,
            "preorder": preorder_nodes,
            "postorder": postorder_nodes,
            "levelorder": levelorder_nodes,
        }

    def validate_avl_invariants(self) -> Dict[str, Any]:
        """
        Conducts an algorithmic audit of the entire AVL Tree:
        - BST ordering property: node.left.price < node.price < node.right.price
        - Height calculation correctness: height == 1 + max(left_h, right_h)
        - AVL balance condition: |balance_factor| <= 1
        Returns full diagnostics and any detected violations.
        """
        violations: List[str] = []
        node_count = 0
        balance_factors: List[int] = []

        def _audit(node: Optional[AVLNode], min_val: float, max_val: float) -> int:
            nonlocal node_count
            if not node:
                return 0

            node_count += 1
            bf = self.get_balance(node)
            balance_factors.append(bf)

            # 1. BST Invariant Check
            if not (min_val < node.price < max_val):
                violations.append(
                    f"BST Violation at price \u20b9{node.price:.2f}: Not in valid range (\u20b9{min_val}, \u20b9{max_val})"
                )

            # 2. AVL Invariant Check
            if abs(bf) > 1:
                violations.append(
                    f"AVL Balance Violation at price \u20b9{node.price:.2f}: Balance Factor is {bf} (must be -1, 0, or +1)"
                )

            # 3. Height Invariant Check
            left_h = _audit(node.left, min_val, node.price)
            right_h = _audit(node.right, node.price, max_val)
            expected_h = 1 + max(left_h, right_h)

            if node.height != expected_h:
                violations.append(
                    f"Height Invariant Violation at price \u20b9{node.price:.2f}: Stored height {node.height} != Computed {expected_h}"
                )

            return node.height

        actual_height = _audit(self.root, float("-inf"), float("inf"))
        is_valid = len(violations) == 0

        return {
            "is_valid": is_valid,
            "total_nodes": node_count,
            "tree_height": actual_height,
            "min_balance_factor": min(balance_factors) if balance_factors else 0,
            "max_balance_factor": max(balance_factors) if balance_factors else 0,
            "violations": violations,
            "status_message": "All AVL Tree properties are strictly satisfied!" if is_valid else f"{len(violations)} invariant violations detected.",
        }

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
