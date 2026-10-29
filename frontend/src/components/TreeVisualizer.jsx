import React, { useState, useEffect } from 'react';

// Helper functions for tree traversals
function getInOrderPrices(node) {
  if (!node) return [];
  return [...getInOrderPrices(node.left), node.price, ...getInOrderPrices(node.right)];
}

function getPreOrderPrices(node) {
  if (!node) return [];
  return [node.price, ...getPreOrderPrices(node.left), ...getPreOrderPrices(node.right)];
}

function getPostOrderPrices(node) {
  if (!node) return [];
  return [...getPostOrderPrices(node.left), ...getPostOrderPrices(node.right), node.price];
}

// Recursive Component to render AVL Nodes and branches
function TreeNode({ node, onSelectNode, selectedPrice, traversingPrice, direction = 'ROOT' }) {
  if (!node) return null;

  const isSelected = selectedPrice === node.price;
  const isTraversing = traversingPrice === node.price;
  const bf = node.balance_factor;
  const isBalanced = Math.abs(bf) <= 1;

  // Balance factor badge styling
  let bfClass = 'bf-zero';
  if (!isBalanced) bfClass = 'bf-invalid';
  else if (bf > 0) bfClass = 'bf-pos';
  else if (bf < 0) bfClass = 'bf-neg';

  return (
    <div className="tree-node-wrapper">
      {/* Node Direction Indicator (L or R) */}
      {direction !== 'ROOT' && (
        <span className="branch-dir-badge">
          {direction === 'L' ? '◀ L' : 'R ▶'}
        </span>
      )}

      {/* Node Card */}
      <div
        className={`tree-node-card-awesome ${isSelected ? 'selected' : ''} ${isTraversing ? 'traversing-active' : ''}`}
        onClick={() => onSelectNode(node)}
        title="Click to inspect all products attached to this price node"
      >
        <div className="node-price-label">${node.price.toFixed(2)}</div>

        <div className="node-meta-row">
          <span className="node-pill-height">H: {node.height}</span>
          <span className={`node-pill-bf ${bfClass}`}>
            BF: {bf > 0 ? `+${bf}` : bf}
          </span>
        </div>

        {node.product_count > 1 && (
          <div className="node-badge-shared">
            ● {node.product_count} Products
          </div>
        )}
      </div>

      {/* Child branches (Left & Right) */}
      {(node.left || node.right) && (
        <div className="tree-children-container">
          {/* Left Branch */}
          <div className="tree-branch-column">
            {node.left ? (
              <TreeNode
                node={node.left}
                onSelectNode={onSelectNode}
                selectedPrice={selectedPrice}
                traversingPrice={traversingPrice}
                direction="L"
              />
            ) : (
              <div style={{ width: '40px', height: '20px', visibility: 'hidden' }}></div>
            )}
          </div>

          {/* Right Branch */}
          <div className="tree-branch-column">
            {node.right ? (
              <TreeNode
                node={node.right}
                onSelectNode={onSelectNode}
                selectedPrice={selectedPrice}
                traversingPrice={traversingPrice}
                direction="R"
              />
            ) : (
              <div style={{ width: '40px', height: '20px', visibility: 'hidden' }}></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeVisualizer({
  treeData,
  onRefreshTree,
  onTriggerRotation,
  onResetData,
  activeScenario,
  scenarioDescription,
  loading,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTraversal, setActiveTraversal] = useState(null);
  const [traversingPrice, setTraversingPrice] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);

  // Handle animated tree traversal
  const handleStartTraversal = (type) => {
    if (!treeData) return;

    let prices = [];
    if (type === 'inorder') prices = getInOrderPrices(treeData);
    else if (type === 'preorder') prices = getPreOrderPrices(treeData);
    else if (type === 'postorder') prices = getPostOrderPrices(treeData);

    setActiveTraversal(type);
    setTraversalResult([]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < prices.length) {
        const curPrice = prices[step];
        setTraversingPrice(curPrice);
        setTraversalResult((prev) => [...prev, curPrice]);
        step += 1;
      } else {
        clearInterval(interval);
        setTimeout(() => setTraversingPrice(null), 1000);
      }
    }, 600);
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.4));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.65));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div>
      {/* Interactive Rotation Simulator Bar */}
      <div className="simulator-box">
        <div className="simulator-header">
          <div className="simulator-title">
            <span>🎮</span>
            <span>Live AVL Rotation Simulator & Viva Player</span>
          </div>

          <button
            type="button"
            className="btn-modern btn-modern-secondary btn-xs"
            onClick={onResetData}
            title="Restore original 10 sample products"
          >
            🔄 Restore Full Catalog
          </button>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Click any preset below to trigger that specific AVL rotation on the live tree:
        </p>

        <div className="simulator-actions">
          <button
            type="button"
            className={`sim-btn ${activeScenario === 'LL' ? 'active' : ''}`}
            onClick={() => onTriggerRotation('LL')}
          >
            ▶ LL: Right Rotate (30 &rarr; 20 &rarr; 10)
          </button>
          <button
            type="button"
            className={`sim-btn ${activeScenario === 'RR' ? 'active' : ''}`}
            onClick={() => onTriggerRotation('RR')}
          >
            ▶ RR: Left Rotate (10 &rarr; 20 &rarr; 30)
          </button>
          <button
            type="button"
            className={`sim-btn ${activeScenario === 'LR' ? 'active' : ''}`}
            onClick={() => onTriggerRotation('LR')}
          >
            ▶ LR: Double Rotate (30 &rarr; 10 &rarr; 20)
          </button>
          <button
            type="button"
            className={`sim-btn ${activeScenario === 'RL' ? 'active' : ''}`}
            onClick={() => onTriggerRotation('RL')}
          >
            ▶ RL: Double Rotate (10 &rarr; 30 &rarr; 20)
          </button>
        </div>

        {scenarioDescription && (
          <div className="sim-explanation-card">
            <strong>Active Simulation:</strong> {scenarioDescription}
          </div>
        )}
      </div>

      {/* Traversal Animator Bar */}
      <div className="traversal-animator-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>🚶‍♂️ Live Traversal Animator:</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Highlights nodes sequentially:
          </span>
        </div>

        <div className="traversal-controls">
          <button
            type="button"
            className={`traversal-btn ${activeTraversal === 'inorder' ? 'active' : ''}`}
            onClick={() => handleStartTraversal('inorder')}
            title="Left -> Root -> Right: Visits in ascending sorted price order"
          >
            ▶ In-Order (Sorted Ascending)
          </button>
          <button
            type="button"
            className={`traversal-btn ${activeTraversal === 'preorder' ? 'active' : ''}`}
            onClick={() => handleStartTraversal('preorder')}
          >
            ▶ Pre-Order (Root First)
          </button>
          <button
            type="button"
            className={`traversal-btn ${activeTraversal === 'postorder' ? 'active' : ''}`}
            onClick={() => handleStartTraversal('postorder')}
          >
            ▶ Post-Order (Children First)
          </button>
        </div>

        {traversalResult.length > 0 && (
          <div style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Sequence:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {traversalResult.map((p, idx) => (
                <span key={idx} className="traversal-result-pill">
                  ${p.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tree Visualization Canvas Card */}
      <div className="glass-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-heading">
              <span>🌳</span> AVL Tree Visualizer Canvas
            </h3>
            <p className="card-subtext">
              Real-time graphical tree generated from the Python backend. Click any node to inspect its product bucket.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Zoom Controls */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card-subtle)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                className="btn-modern btn-modern-secondary btn-xs"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                className="btn-modern btn-modern-secondary btn-xs"
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                className="btn-modern btn-modern-secondary btn-xs"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                -
              </button>
            </div>

            <span className="node-pill-bf bf-zero" style={{ fontSize: '0.7rem' }}>
              BF: 0 (Equal)
            </span>
            <span className="node-pill-bf bf-pos" style={{ fontSize: '0.7rem' }}>
              BF: +1 (Left-heavy)
            </span>
            <span className="node-pill-bf bf-neg" style={{ fontSize: '0.7rem' }}>
              BF: -1 (Right-heavy)
            </span>

            <button
              type="button"
              className="btn-modern btn-modern-secondary btn-xs"
              onClick={onRefreshTree}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Canvas'}
            </button>
          </div>
        </div>

        {/* Tree Render Canvas with Zoom Transform */}
        {!treeData ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p>Tree is currently empty. Add products to generate nodes.</p>
          </div>
        ) : (
          <div className="tree-canvas-scroll">
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
              <TreeNode
                node={treeData}
                onSelectNode={handleSelectNode}
                selectedPrice={selectedNode ? selectedNode.price : null}
                traversingPrice={traversingPrice}
                direction="ROOT"
              />
            </div>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginTop: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏷️</span> Price Node: ${selectedNode.price.toFixed(2)}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Node Height: <strong>{selectedNode.height}</strong> &bull; Balance Factor: <strong>{selectedNode.balance_factor}</strong> &bull; Storing {selectedNode.products.length} product{selectedNode.products.length > 1 ? 's' : ''}
                </p>
              </div>

              <button
                className="btn-modern btn-modern-secondary btn-xs"
                onClick={() => setSelectedNode(null)}
              >
                Close Inspector &times;
              </button>
            </div>

            <div className="table-wrapper-modern">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNode.products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        #{p.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="badge-category">{p.category}</span></td>
                      <td><span className="price-pill-bold">${p.price.toFixed(2)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
