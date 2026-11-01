import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import SearchPrice from './components/SearchPrice';
import TreeVisualizer from './components/TreeVisualizer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('avl-theme') || 'light');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [treeData, setTreeData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchTrace, setSearchTrace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastOpComplexity, setLastOpComplexity] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioDescription, setScenarioDescription] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('avl-theme', theme);
  }, [theme]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, statsRes, treeRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stats'),
        fetch('/api/tree'),
      ]);
      if (prodRes.ok) {
        const j = await prodRes.json();
        setProducts(j.data || []);
      }
      if (statsRes.ok) {
        const j = await statsRes.json();
        setStats(j.data || {});
      }
      if (treeRes.ok) {
        const j = await treeRes.json();
        setTreeData(j.data || null);
      }
    } catch (err) {
      showNotification('Cannot reach Flask backend — is it running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ── Product Operations ────────────────────────────────────────────────────
  const handleAddProduct = useCallback(async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product added!');
        if (data.complexity) setLastOpComplexity(data.complexity);
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to add product', 'error');
      }
    } catch {
      showNotification('Network error adding product', 'error');
    }
  }, [showNotification, fetchAllData]);

  const handleUpdateProduct = useCallback(async (id, fields) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product updated!');
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to update', 'error');
      }
    } catch {
      showNotification('Network error updating product', 'error');
    }
  }, [showNotification, fetchAllData]);

  // Delete WITH confirm (used in ProductManager)
  const handleDeleteProduct = useCallback(async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product deleted!');
        if (data.complexity) setLastOpComplexity(data.complexity);
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to delete', 'error');
      }
    } catch {
      showNotification('Network error deleting product', 'error');
    }
  }, [showNotification, fetchAllData]);

  // Delete WITHOUT confirm (used in Dashboard quick-test)
  const handleQuickDelete = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product removed (test)!');
        if (data.complexity) setLastOpComplexity(data.complexity);
        fetchAllData();
      } else {
        showNotification(data.error || 'Failed to delete', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    }
  }, [showNotification, fetchAllData]);

  const handleResetData = useCallback(async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setLastOpComplexity(null);
        setActiveScenario(null);
        setScenarioDescription(null);
        showNotification('Catalog reset — 10 demo products loaded!');
        fetchAllData();
      }
    } catch {
      showNotification('Network error resetting catalog', 'error');
    }
  }, [showNotification, fetchAllData]);

  const handleTriggerRotation = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveScenario(type);
        setScenarioDescription(data.description);
        showNotification(`${type} rotation simulated!`);
        fetchAllData();
        setActiveTab('tree');
      } else {
        showNotification(data.error || 'Rotation failed', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification, fetchAllData]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearchExact = useCallback(async (price) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?price=${price}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data || []);
        setSearchTrace(data.trace || []);
      }
    } catch {
      showNotification('Search error', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [showNotification]);

  const handleSearchRange = useCallback(async (min, max) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?min_price=${min}&max_price=${max}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data || []);
        setSearchTrace([]);
      }
    } catch {
      showNotification('Search error', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [showNotification]);

  const handleClearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchTrace([]);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span className="brand-icon">🌳</span>
            <div>
              <div className="brand-title">AVL Price Index</div>
              <div className="brand-sub">Self-Balancing Catalog · ₹ INR</div>
            </div>
          </div>

          <nav className="main-nav">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'products', label: `Products (${products.length})` },
              { key: 'search', label: 'Search' },
              { key: 'tree', label: 'Visualizer' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`nav-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* ── Toast ── */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* ── Main ── */}
      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            products={products}
            lastOpComplexity={lastOpComplexity}
            onNavigateToProducts={() => setActiveTab('products')}
            onNavigateToTree={() => setActiveTab('tree')}
            onNavigateToSearch={() => setActiveTab('search')}
            onAddProduct={handleAddProduct}
            onQuickDelete={handleQuickDelete}
          />
        )}
        {activeTab === 'products' && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetData={handleResetData}
            lastOpComplexity={lastOpComplexity}
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
  );
}
