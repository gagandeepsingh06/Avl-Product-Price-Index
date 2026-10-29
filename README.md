# Product Price Index Using AVL Trees

A full-stack, beginner-friendly academic mini-project built for Computer Science & Engineering students to demonstrate the practical application of **Self-Balancing AVL Binary Search Trees** in indexing and querying e-commerce product prices.

---

## 🌟 Key Features

1. **Custom AVL Tree from Scratch**:
   - Written purely in Python with no external tree libraries.
   - Self-balancing via **LL, RR, LR, and RL rotations**.
   - Maintains strict AVL balance property: $-1 \le BF(node) \le 1$ where $BF(node) = \text{height}(left) - \text{height}(right)$.
   - Handles **duplicate prices** cleanly by storing a list of products within each price node without losing records.
2. **Fast Product Operations**:
   - **Add Product**: Inserts price key in $O(\log n)$ and rebalances.
   - **Update Product Price**: Automatically re-indexes the product from the old price node to the new price node.
   - **Delete Product**: Removes product; if the price node has no remaining products, removes the AVL node and rebalances.
   - **Exact Price Search**: $O(\log n)$ binary search.
   - **Price Range Filter**: Efficient range search with subtree pruning.
   - **Sorted Product Display**: Natural ascending order via $O(n)$ In-Order Traversal.
3. **Interactive React UI Dashboard**:
   - **Dashboard**: Real-time metrics (Total products, distinct price nodes, lowest price, highest price, average price, tree height, balance condition).
   - **Product Manager**: Clean form to add/edit products, sample data loader, and responsive table.
   - **Search by Price**: Switch between exact price match and min-max range queries with DSA complexity hints.
   - **AVL Tree Visualization**: Visual tree layout displaying each node's Price, Height, and Balance Factor ($BF$). Click any node to view all products attached to that price key.

---

## 📂 Project Structure

```text
product-price-index/
├── backend/
│   ├── venv/               # Python Virtual Environment
│   ├── app.py              # Flask REST API endpoints
│   ├── avl_tree.py         # Custom AVL Tree data structure from scratch
│   ├── products.py         # Catalog coordinator and optional SQLite persistence
│   ├── requirements.txt    # Python dependencies (Flask, Flask-CORS)
│   ├── test_avl.py         # Comprehensive AVL Tree unit tests
│   └── test_api.py         # Flask API endpoint unit tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Summary statistics & concept overview
│   │   │   ├── ProductManager.jsx   # Add/Edit form & product list table
│   │   │   ├── SearchPrice.jsx      # Exact & range price query interface
│   │   │   └── TreeVisualizer.jsx   # Interactive AVL Tree visualization & rotation guide
│   │   ├── App.jsx         # Main application container & state sync
│   │   ├── App.css         # Modern, clean CSS styling
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite dev server and proxy configuration
│   └── index.html          # HTML template
├── .gitignore              # Ignores venv, node_modules, .db, and cache files
├── README.md               # Setup and running instructions
└── project-report.md       # Comprehensive academic project report & viva Q&A
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version 3.9+ (Python 3.10, 3.11, 3.12, 3.13, or 3.14)
- **Node.js**: Version 18+ and **npm**

---

### Step 1: Set Up & Run the Python Flask Backend (using `venv`)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. **Activate the virtual environment**:
   - **On Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
     *(If script execution is disabled, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*
   - **On Windows (Command Prompt `cmd`)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **On macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

   *(Note: If creating a fresh venv from scratch at any time, simply run `python -m venv venv` followed by `pip install -r requirements.txt`).*

3. **Run the unit tests** to verify the AVL Tree logic and API routes:
   ```bash
   python test_avl.py
   python test_api.py
   ```

4. **Start the Flask server**:
   ```bash
   python app.py
   ```
   *The Flask API will start running at `http://127.0.0.1:5000`.*

---

### Step 2: Set Up & Run the React Frontend

1. Open a **second terminal** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install the node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```text
   http://localhost:5173
   ```

---

## 📡 REST API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products sorted by price ascending (via AVL in-order traversal). |
| `POST` | `/api/products` | Add a new product (`{ name, category, price }`). |
| `PUT` | `/api/products/<id>` | Update an existing product. Re-indexes price in AVL tree if price changed. |
| `DELETE`| `/api/products/<id>` | Delete product and rebalance AVL tree if price node becomes empty. |
| `GET` | `/api/search?price=...` | Search products with an exact price ($O(\log n)$). |
| `GET` | `/api/search?min_price=...&max_price=...` | Search products within a price range using tree pruning. |
| `GET` | `/api/tree` | Returns the hierarchical AVL Tree JSON structure for visualization. |
| `GET` | `/api/stats` | Returns calculated metrics (total items, distinct prices, min/max/avg price, height, balance status). |
| `POST` | `/api/reset` | Resets dataset to the default demonstration sample products. |

---

## ⏱️ Time Complexity Overview

| Operation | AVL Tree Index | Unsorted Array / List |
| :--- | :---: | :---: |
| **Search by Price** | **$O(\log n)$** | $O(N)$ |
| **Insert Product** | **$O(\log n)$** | $O(1)$ |
| **Delete Product** | **$O(\log n)$** | $O(N)$ |
| **Price Range Query** | **$O(\log n + k)$** | $O(N)$ |
| **In-Order Traversal (Sorted List)** | **$O(N)$** | $O(N \log N)$ (sorting required) |

*Where $n$ is the number of distinct price nodes, $N$ is the total number of products, and $k$ is the number of products within the query range.*

---

## 📖 Project Documentation & Viva Preparation

For the complete project report, mathematical rotation proofs, screenshot guidelines, and **15 College Viva Questions with Detailed Answers**, please see:
👉 [project-report.md](project-report.md)
