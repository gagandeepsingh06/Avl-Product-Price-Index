# 🌳 Product Price Index Using AVL Trees

> **ADSA College Project** — A full-stack application demonstrating the real-world application of **Self-Balancing AVL Binary Search Trees** for e-commerce product price indexing, built with Python Flask + React (Vite).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [AVL Tree — Core Concepts](#avl-tree--core-concepts)
6. [Time & Space Complexity](#time--space-complexity)
7. [REST API Reference](#rest-api-reference)
8. [Quick Start](#quick-start)
9. [Pre-loaded Demo Products](#pre-loaded-demo-products)
10. [Running Tests](#running-tests)
11. [UI Pages & Features](#ui-pages--features)
12. [Live Complexity Monitor](#live-complexity-monitor)

---

## Overview

This project implements a **Product Price Index** where every product is indexed by price inside a custom-built AVL Tree written entirely from scratch in Python — no external tree libraries used. The AVL Tree self-balances on every insert and delete, guaranteeing O(log n) search, insert, and delete at all times.

The frontend React application visualizes the tree structure live, tracks real-time operation metrics (comparisons, rotations, tree height changes), and supports a full product CRUD workflow — all priced in **Indian Rupees (₹ INR)**.

---

## Features

### Backend
- ✅ **Custom AVL Tree** — written from scratch in Python (`avl_tree.py`)
- ✅ **Self-balancing** via LL, RR, LR, RL rotations tracked in real time
- ✅ **Duplicate price handling** — multiple products can share a price node (stored as a list inside the node)
- ✅ **SQLite persistence** — all products survive server restarts
- ✅ **Operation metrics** — every insert/delete returns `comparisons`, `rotations`, `tree_height_before/after`, `time_complexity`, `explanation`
- ✅ **Full REST API** — 15+ endpoints covering CRUD, search, traversals, rotation demos, bulk import, export
- ✅ **3 comprehensive test suites** — AVL logic, API endpoints, and end-to-end comprehensive tests

### Frontend
- ✅ **Live Complexity Monitor** — updates in real time on every insert/delete showing O(log n) comparisons and rotation count
- ✅ **AVL Tree Visualizer** — interactive HTML tree with CSS connector lines, height (H) and balance factor (BF) on each node
- ✅ **4 Traversal Animations** — In-Order, Pre-Order, Post-Order, Level-Order (BFS) with step-by-step highlighting
- ✅ **Rotation Simulator** — trigger LL, RR, LR, RL demo rotations from the UI
- ✅ **Product Manager** — full Add / Edit / Delete CRUD with complexity guide panel
- ✅ **3-Mode Price Search** — Exact match, Price range, Budget filter (all O(log n))
- ✅ **Dark / Light theme** — persisted in localStorage
- ✅ **10 pre-loaded products** — seeded automatically on first run

---

## Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| Backend Language | Python | 3.9+ |
| Backend Framework | Flask | 3.x |
| Cross-Origin | Flask-CORS | 4.x |
| Database | SQLite (via `sqlite3` stdlib) | Built-in |
| Frontend Framework | React | 18.x |
| Frontend Bundler | Vite | 5.x |
| Styling | Pure CSS (custom, no frameworks) | — |
| Package Manager | npm | 18+ |

---

## Project Structure

```
Adsa project/
│
├── backend/
│   ├── venv/                    # Python virtual environment
│   ├── avl_tree.py              # ⭐ Core AVL Tree implementation (from scratch)
│   ├── products.py              # ProductManager — bridges AVL Tree with SQLite
│   ├── app.py                   # Flask REST API — 15+ endpoints
│   ├── products.db              # SQLite database (auto-created on first run)
│   ├── requirements.txt         # Python dependencies
│   ├── test_avl.py              # Unit tests for AVL Tree logic
│   ├── test_api.py              # Unit tests for all API endpoints
│   └── test_comprehensive.py   # End-to-end comprehensive test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Stats cards + Live Complexity Monitor
│   │   │   ├── ProductManager.jsx   # CRUD table + AVL Complexities guide
│   │   │   ├── SearchPrice.jsx      # Exact / Range / Budget search
│   │   │   └── TreeVisualizer.jsx   # Interactive tree + traversal animator
│   │   ├── App.jsx              # Root component — routing, state, API calls
│   │   ├── App.css              # All styles (clean minimalist, dark/light)
│   │   └── main.jsx             # React entry point
│   ├── index.html               # HTML shell
│   ├── vite.config.js           # Vite config + /api proxy to Flask :5000
│   └── package.json             # npm dependencies
│
├── .gitignore                   # Excludes venv/, node_modules/, *.db, __pycache__/
└── README.md                    # This file
```

---

## AVL Tree — Core Concepts

### What is an AVL Tree?
An **AVL Tree** (Adelson-Velsky and Landis, 1962) is a self-balancing Binary Search Tree where the **Balance Factor** of every node is always in the range **[−1, 0, +1]**.

```
Balance Factor (BF) = Height(left subtree) − Height(right subtree)
```

If any insertion or deletion causes `|BF| > 1`, the tree performs one of four **rotations** to restore balance.

### The Four Rotations

| Case | Imbalance | Fix | Rotations |
|:-----|:----------|:----|:----------|
| **LL** | Left-Left heavy (BF = +2, left child BF ≥ 0) | Right Rotate at node | 1 (single) |
| **RR** | Right-Right heavy (BF = −2, right child BF ≤ 0) | Left Rotate at node | 1 (single) |
| **LR** | Left-Right heavy (BF = +2, left child BF < 0) | Left Rotate at left child, then Right Rotate at node | 2 (double) |
| **RL** | Right-Left heavy (BF = −2, right child BF > 0) | Right Rotate at right child, then Left Rotate at node | 2 (double) |

### Height Bound
For an AVL tree with **n** distinct keys:

```
Height ≤ 1.44 × log₂(n + 2)
```

This guarantees O(log n) for **all** operations regardless of insertion order.

### Duplicate Price Handling
Multiple products may share the same price (e.g., two headphones both at ₹2,499). Instead of inserting duplicate keys, each AVL node stores a **list** of products at that price. Deleting the last product at a price removes the entire AVL node.

---

## Time & Space Complexity

### Operation Complexities

| Operation | AVL Tree | Naive Array | Notes |
|:----------|:--------:|:-----------:|:------|
| **Insert product** | **O(log n)** | O(1) | At most **1 rotation** on insert |
| **Delete product** | **O(log n)** | O(N) | Up to **O(log n) rotations** cascade |
| **Exact price search** | **O(log n)** | O(N) | Binary comparison from root |
| **Price range query** | **O(log n + k)** | O(N) | k = matching products |
| **Sorted listing** | **O(N)** | O(N log N) | Free via in-order traversal |
| **Tree height** | **O(1)** | — | Stored and updated per node |
| **Balance check** | **O(1)** | — | Balance factor cached per node |

*n = distinct price nodes, N = total products, k = results in range*

### Insertion vs Deletion — Key Difference

| Aspect | Insertion | Deletion |
|:-------|:----------|:---------|
| Max rotations | **≤ 1** (single or double) | **O(log n)** cascade |
| Reason | Inserting one node can only create one imbalanced ancestor | Removing a node can reduce subtree height, propagating imbalance upward to the root |
| Space auxiliary | O(1) | O(1) |
| Call stack | O(log n) | O(log n) |

### Space Complexity
- **Tree storage**: O(n) — one node per distinct price  
- **Total storage**: O(N) — N products distributed across n nodes  
- **Auxiliary (per operation)**: O(log n) recursion stack  

---

## REST API Reference

All endpoints are served at `http://localhost:5000/api/` and proxied from the Vite frontend at `/api/`.

### Products

| Method | Endpoint | Body / Params | Description |
|:-------|:---------|:--------------|:------------|
| `GET` | `/api/products` | `?category=&sort=` | All products sorted by price (AVL in-order traversal) |
| `POST` | `/api/products` | `{ name, category, price }` | Add product — returns `complexity` metrics |
| `PUT` | `/api/products/<id>` | `{ name?, category?, price? }` | Update product — re-indexes AVL node if price changed |
| `DELETE` | `/api/products/<id>` | — | Delete product — returns `complexity` metrics |

### Search

| Method | Endpoint | Params | Description |
|:-------|:---------|:-------|:------------|
| `GET` | `/api/search` | `?price=2499` | Exact price search — O(log n) BST descent |
| `GET` | `/api/search` | `?min_price=1000&max_price=5000` | Price range query with traversal trace |
| `GET` | `/api/closest` | `?budget=3000` | Budget recommender — predecessor ≤ budget < successor |

### Tree & Stats

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/tree` | Full serialized AVL tree JSON for visualizer |
| `GET` | `/api/stats` | Dashboard metrics (total, distinct prices, min/max/avg, height, balance status) |
| `GET` | `/api/traversals` | All 4 traversals: In-Order, Pre-Order, Post-Order, Level-Order |
| `GET` | `/api/tree/audit` | Formal verification of BST + AVL invariants |
| `GET` | `/api/complexity` | Latest operation metrics + algorithmic complexity guide |

### Utilities

| Method | Endpoint | Body | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/reset` | — | Wipe catalog and reload 10 demo products |
| `POST` | `/api/demo-rotation` | `{ type: "LL"\|"RR"\|"LR"\|"RL" }` | Inject nodes to trigger a specific rotation scenario |
| `POST` | `/api/bulk` | `{ products: [...] }` | Batch insert multiple products |
| `GET` | `/api/export` | — | Export full catalog + tree state as JSON |
| `GET` | `/api/categories` | — | Category-wise product breakdown |
| `GET` | `/api/health` | — | Server health check and uptime |

### Example — Add Product Response

```json
{
  "message": "Product 'Wireless Earbuds' added successfully at ₹2499.00.",
  "product": { "id": 11, "name": "Wireless Earbuds", "category": "Audio", "price": 2499.0 },
  "complexity": {
    "operation": "add",
    "entity": "Wireless Earbuds",
    "price": 2499.0,
    "time_complexity": "O(log n)",
    "comparisons": 3,
    "rotations": ["LL"],
    "rotations_count": 1,
    "tree_height_before": 4,
    "tree_height_after": 4,
    "explanation": "Inserted at ₹2499.00 after 3 comparisons. 1 LL rotation applied to restore AVL balance."
  }
}
```

---

## Quick Start

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher + npm

---

### Step 1 — Backend Setup

```powershell
# Navigate to backend
cd "H:\Adsa project\backend"

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If execution policy blocks it, run this first:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# (First time only) Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

> Flask will start at **http://127.0.0.1:5000**  
> The SQLite database (`products.db`) and 10 demo products are created automatically.

---

### Step 2 — Frontend Setup

Open a **second terminal**:

```powershell
# Navigate to frontend
cd "H:\Adsa project\frontend"

# (First time only) Install npm packages
npm install

# Start Vite dev server
npm run dev
```

> Open your browser at **http://localhost:5173**

---

### Both Servers at a Glance

| Service | URL | Purpose |
|:--------|:----|:--------|
| ⚛️ React (Vite) | http://localhost:5173 | Frontend UI |
| 🐍 Flask API | http://localhost:5000 | REST API |
| 🗄️ SQLite DB | `backend/products.db` | Data persistence |

---

## Pre-loaded Demo Products

The backend seeds **10 products** automatically on the first run (or after `/api/reset`), chosen to demonstrate a balanced AVL tree with varied price distribution:

| # | Product | Category | Price (₹ INR) |
|:-:|:--------|:---------|:-------------:|
| 1 | USB-C Hub 7-Port | Accessories | ₹999.00 |
| 2 | Noise-Cancelling Earbuds | Audio | ₹1,649.00 |
| 3 | Wireless Mouse | Electronics | ₹2,499.00 |
| 4 | Mechanical Keyboard | Electronics | ₹2,899.00 |
| 5 | 1080p Webcam | Electronics | ₹4,199.00 |
| 6 | Laptop Stand Aluminium | Accessories | ₹4,199.00 *(shared node)* |
| 7 | 24-inch IPS Monitor | Displays | ₹6,799.00 |
| 8 | 512 GB NVMe SSD | Storage | ₹9,299.00 |
| 9 | 27-inch 4K Monitor | Displays | ₹15,999.00 |
| 10 | RTX 4060 Graphics Card | Electronics | ₹29,999.00 |

> Products 5 and 6 intentionally share the same price (₹4,199) to demonstrate the **duplicate-key node** feature of the AVL Tree.

---

## Running Tests

All three test suites must be run from the `backend/` directory with the virtual environment active:

```powershell
cd "H:\Adsa project\backend"
.\venv\Scripts\Activate.ps1

# Test 1 — AVL Tree core logic (rotations, height, balance factors)
python test_avl.py

# Test 2 — Flask API endpoints (all routes, status codes, responses)
python test_api.py

# Test 3 — End-to-end comprehensive tests (full workflow, edge cases)
python test_comprehensive.py
```

Expected output for all three:
```
✅ ALL AVL TESTS PASSED
✅ ALL API ENDPOINT TESTS PASSED
✅ ALL COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS
```

---

## UI Pages & Features

### 📊 Dashboard
- **4 metric cards** — Total Products, Lowest Price, Highest Price, AVL Tree Status (balanced / rebalancing)
- **Live AVL Complexity Monitor** — shows the last operation's time complexity, comparison levels, rotations applied, and tree height change in real time
- **Algorithmic Comparison panel** — toggle between Insertion and Deletion to see O(log n) bounds, max rotations, and execution phases
- **Price Distribution bar chart** — products grouped by INR price tier
- **Category breakdown** — department pill counts
- **Quick navigation** buttons to other tabs

### 📦 Products (Product Manager)
- **Product table** — sortable by price or name, filterable by category and search term
- **AVL Node column** — shows whether a product occupies a unique price key or shares a node with others
- **Add / Edit form** with quick ₹ preset buttons
- **📦 Pre-add 10 Products** button — resets catalog to demo data
- **⚡ AVL Complexities** toggle — detailed step-by-step phase breakdown for both insertion and deletion
- **Live banner** — displays complexity metrics immediately after each add or delete

### 🔍 Search
- **Exact Price** — O(log n) binary search with AVL traversal trace (shows each comparison step)
- **Price Range** — returns all products between min and max price
- **Budget Filter** — returns all products priced at or below the budget

### 🌳 AVL Tree Visualizer
- **Interactive tree** — every node shows Price (₹), Height (H), and Balance Factor (BF), colour-coded by balance health
- **CSS connector lines** — parent-to-child edges drawn with CSS elbow connectors for two-child nodes and straight lines for single-child nodes
- **Click any node** to open the Node Inspector showing all products stored at that price
- **Traversal animator** — play In-Order / Pre-Order / Post-Order / Level-Order with step-by-step node highlighting and visited sequence display
- **Rotation simulator** — trigger LL, RR, LR, or RL rotation scenarios from the dropdown and watch the tree restructure live
- **Zoom controls** — 40% to 150% scale with reset button
- **🔄 Reset** — restore the 10 demo products

---

## Live Complexity Monitor

Every time a product is **added** or **deleted** (from the Dashboard quick-test buttons or the Products tab), the backend computes and returns exact runtime metrics:

```
⚡ INSERTION — "Wireless Earbuds" at ₹2,499.00
   Time Complexity : O(log n)
   Comparisons     : 3 levels
   Rotations       : LL  (1 rotation applied)
   Tree Height     : 4 → 4
```

The Dashboard's **"+ Test Insert"** and **"− Test Remove"** buttons let you see this live without navigating away — specifically designed to demonstrate O(log n) behaviour during demos and viva examinations.
