import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import SearchPrice from './components/SearchPrice';
import TreeVisualizer from './components/TreeVisualizer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'search', 'tree'
  const [theme, setTheme] = useState(() => localStorage.getItem('avl-theme') || 'light');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [treeData, setTreeData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchTrace, setSearchTrace] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioDescription, setScenarioDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync theme changes with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('avl-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch all initial data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, statsRes, treeRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stats'),
        fetch('/api/tree'),
      ]);

      if (prodRes.ok) {
        const prodJson = await prodRes.json();
        setProducts(prodJson.data || []);
      }
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        setStats(statsJson.data || {});
      }
      if (treeRes.ok) {
        const treeJson = await treeRes.json();
        setTreeData(treeJson.data || null);
      }
    } catch (err) {
      console.error('Failed to connect to Flask API:', err);
      showNotification('Cannot reach Flask backend. Please make sure Flask is running on http://127.0.0.1:5000', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for Product Management
  const handleAddProduct = async (newProduct) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product added and indexed in AVL Tree!');
        setActiveScenario(null);
        setScenarioDescription(null);
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to add product', 'error');
      }
    } catch (err) {
      showNotification('Network error while adding product', 'error');
    }
  };

  const handleUpdateProduct = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product updated and re-indexed in AVL Tree!');
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to update product', 'error');
      }
    } catch (err) {
      showNotification('Network error while updating product', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" (ID #${id})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product deleted and AVL node rebalanced!');
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showNotification('Network error while deleting product', 'error');
    }
  };

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActiveScenario(null);
        setScenarioDescription(null);
        showNotification('Dataset successfully reset to demonstration samples!');
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to reset data', 'error');
      }
    } catch (err) {
      showNotification('Network error while resetting data', 'error');
    }
  };

  // Handler for Rotation Simulations
  const handleTriggerRotation = async (scenarioType) => {
    try {
      setLoading(true);
      const res = await fetch('/api/demo-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: scenarioType }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveScenario(scenarioType);
        setScenarioDescription(data.description);
        showNotification(`Simulated ${scenarioType} rotation successfully!`);
        fetchAllData();
        setActiveTab('tree');
      } else {
        showNotification(data.error || 'Failed to simulate rotation', 'error');
      }
    } catch (err) {
      showNotification('Network error during rotation simulation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Searching
  const handleSearchExact = async (price) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?price=${price}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data || []);
        setSearchTrace(data.trace || []);
      } else {
        showNotification(data.error || 'Search error', 'error');
      }
    } catch (err) {
      showNotification('Error performing exact price search', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchRange = async (minPrice, maxPrice) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?min_price=${minPrice}&max_price=${maxPrice}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data || []);
        setSearchTrace([]);
      } else {
        showNotification(data.error || 'Search error', 'error');
      }
    } catch (err) {
      showNotification('Error performing range search', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchTrace([]);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* Top Glass Header */}
        <header className="header-glass">
          <div className="brand-wrapper">
            <div className="brand-icon-box">🌲</div>
            <div>
              <h1 className="brand-title">Product Price Index</h1>
              <p className="brand-subtitle">Custom Self-Balancing AVL Binary Search Tree Implementation</p>
            </div>
          </div>

          <div className="header-controls">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title="Toggle Light / Dark Theme"
            >
              <span>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</span>
            </button>

            <span className="badge-live">
              <span className="pulse-dot"></span>
              AVL Condition: -1 &le; BF &le; +1
            </span>
          </div>
        </header>

        {/* Toast Notification Banner */}
        {notification && (
          <div className={`toast-banner ${notification.type}`}>
            <span>{notification.message}</span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'inherit' }}
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Modern Tabs Navigation */}
        <nav className="modern-nav-tabs">
          <button
            className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span>📦</span> Manage Products
            <span className="nav-badge-pill">{products.length}</span>
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <span>🔍</span> Search by Price
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveTab('tree')}
          >
            <span>🌳</span> AVL Tree Visualizer
          </button>
        </nav>

        {/* Main Tab Views */}
        <main>
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              products={products}
              onNavigateToProducts={() => setActiveTab('products')}
              onNavigateToTree={() => setActiveTab('tree')}
              onNavigateToSearch={() => setActiveTab('search')}
              onTriggerRotation={handleTriggerRotation}
            />
          )}

          {activeTab === 'products' && (
            <ProductManager
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetData={handleResetData}
              loading={loading}
            />
          )}

          {activeTab === 'search' && (
            <SearchPrice
              onSearchExact={handleSearchExact}
              onSearchRange={handleSearchRange}
              onClearSearch={handleClearSearch}
              searchResults={searchResults}
              searchTrace={searchTrace}
              isSearching={isSearching}
              totalProductsCount={products.length}
            />
          )}

          {activeTab === 'tree' && (
            <TreeVisualizer
              treeData={treeData}
              onRefreshTree={fetchAllData}
              onTriggerRotation={handleTriggerRotation}
              onResetData={handleResetData}
              activeScenario={activeScenario}
              scenarioDescription={scenarioDescription}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}
