import React, { useState } from 'react';

/* ── Traversal helpers ───────────────────────────────────────────────────── */
function inOrder(n)   { if (!n) return []; return [...inOrder(n.left), n.price, ...inOrder(n.right)]; }
function preOrder(n)  { if (!n) return []; return [n.price, ...preOrder(n.left), ...preOrder(n.right)]; }
function postOrder(n) { if (!n) return []; return [...postOrder(n.left), ...postOrder(n.right), n.price]; }
function levelOrder(n) {
  if (!n) return [];
  const q = [n], r = [];
  while (q.length) { const c = q.shift(); r.push(c.price); if (c.left) q.push(c.left); if (c.right) q.push(c.right); }
  return r;
}

/* ── Single Tree Node ────────────────────────────────────────────────────── */
function TreeNode({ node, selected, traversing, onSelect }) {
  if (!node) return null;

  const bf         = node.balance_factor;
  const bfColor    = Math.abs(bf) > 1 ? '#ef4444' : bf !== 0 ? '#818cf8' : '#34d399';
  const isSelected   = selected   === node.price;
  const isTraversing = traversing === node.price;

  const hasLeft  = !!node.left;
  const hasRight = !!node.right;
  const hasChildren = hasLeft || hasRight;
  const hasBoth     = hasLeft && hasRight;

  return (
    <div className="tn-wrap">
      {/* ── Node Card ── */}
      <div
        className={`tn-card${isSelected ? ' tn-selected' : ''}${isTraversing ? ' tn-traversing' : ''}`}
        onClick={() => onSelect(node)}
      >
        {node.product_count > 1 && (
          <span className="tn-badge">{node.product_count}</span>
        )}
        <div className="tn-price">
          ₹{Number(node.price).toLocaleString('en-IN')}
        </div>
        <div className="tn-meta">
          <span>H:{node.height}</span>
          <span style={{ color: bfColor, fontWeight: 700 }}>BF:{bf > 0 ? `+${bf}` : bf}</span>
        </div>
      </div>

      {/* ── Children with connectors ── */}
      {hasChildren && (
        <div className={`tn-children ${hasBoth ? 'tn-two' : hasLeft ? 'tn-left-only' : 'tn-right-only'}`}>
          {hasLeft && (
            <div className="tn-branch tn-branch-l">
              <span className="tn-dir">L</span>
              <TreeNode node={node.left} selected={selected} traversing={traversing} onSelect={onSelect} />
            </div>
          )}
          {hasRight && (
            <div className="tn-branch tn-branch-r">
              <span className="tn-dir">R</span>
              <TreeNode node={node.right} selected={selected} traversing={traversing} onSelect={onSelect} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Visualizer ─────────────────────────────────────────────────────── */
export default function TreeVisualizer({
  treeData,
  onRefreshTree,
  onTriggerRotation,
  onResetData,
  activeScenario,
  scenarioDescription,
  loading,
}) {
  const [selected,    setSelected]    = useState(null);
  const [zoom,        setZoom]        = useState(1);
  const [travType,    setTravType]    = useState('inorder');
  const [travResult,  setTravResult]  = useState([]);
  const [travPrice,   setTravPrice]   = useState(null);
  const [playing,     setPlaying]     = useState(false);

  const fmtINR = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handlePlay = () => {
    if (!treeData || playing) return;
    const prices =
      travType === 'inorder'   ? inOrder(treeData) :
      travType === 'preorder'  ? preOrder(treeData) :
      travType === 'postorder' ? postOrder(treeData) :
      levelOrder(treeData);
    setTravResult([]);
    setPlaying(true);
    let i = 0;
    const iv = setInterval(() => {
      if (i < prices.length) {
        setTravPrice(prices[i]);
        setTravResult(prev => [...prev, prices[i]]);
        i++;
      } else {
        clearInterval(iv);
        setPlaying(false);
        setTimeout(() => setTravPrice(null), 1200);
      }
    }, 550);
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="section-title">AVL Tree Visualizer</div>
          <div className="section-sub">
            Price hierarchy · BF ∈ [−1, +1] · Click any node to inspect
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="select" style={{ width: 'auto' }} value={travType}
            onChange={e => setTravType(e.target.value)} disabled={playing}>
            <option value="inorder">In-Order (sorted)</option>
            <option value="preorder">Pre-Order</option>
            <option value="postorder">Post-Order</option>
            <option value="levelorder">Level-Order (BFS)</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm"
            onClick={handlePlay} disabled={playing || !treeData}>
            {playing ? '⏳ Playing…' : '▶ Play'}
          </button>

          <select className="select" style={{ width: 'auto' }}
            value={activeScenario || ''}
            onChange={e => { if (e.target.value) onTriggerRotation(e.target.value); }}
            disabled={loading}>
            <option value="">Simulate Rotation…</option>
            <option value="LL">LL (Right Rotate)</option>
            <option value="RR">RR (Left Rotate)</option>
            <option value="LR">LR (Double)</option>
            <option value="RL">RL (Double)</option>
          </select>

          <button type="button" className="btn btn-secondary btn-sm" onClick={onResetData}>🔄 Reset</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRefreshTree} disabled={loading}>↺ Refresh</button>

          <div className="zoom-group">
            <button type="button" onClick={() => setZoom(z => Math.max(+(z - 0.1).toFixed(1), 0.4))}>−</button>
            <button type="button" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => setZoom(z => Math.min(+(z + 0.1).toFixed(1), 1.5))}>+</button>
          </div>
        </div>
      </div>

      {scenarioDescription && (
        <div className="alert-banner">
          ⚡ <strong>Rotation:</strong> {scenarioDescription}
        </div>
      )}

      {/* Traversal sequence */}
      {travResult.length > 0 && (
        <div className="card" style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>
            {travType} sequence ({travResult.length} nodes):
          </div>
          <div className="traversal-pills">
            {travResult.map((p, i) => (
              <span key={i} className="trav-pill">{fmtINR(p)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tree canvas */}
      <div className="card tree-canvas-card">
        {!treeData ? (
          <div className="empty-state">
            <div className="empty-icon">🌳</div>
            <p style={{ fontWeight: 600 }}>Tree is empty</p>
            <p>Add products to see the AVL tree.</p>
          </div>
        ) : (
          <div className="tree-canvas-scroll">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s' }}>
              <TreeNode
                node={treeData}
                selected={selected?.price ?? null}
                traversing={travPrice}
                onSelect={n => setSelected(n)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Node inspector */}
      {selected && (
        <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="card-title">Node: {fmtINR(selected.price)}</div>
              <div className="card-sub">
                Height: {selected.height} · BF: {selected.balance_factor} · {selected.products?.length ?? selected.product_count} product(s)
              </div>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          {selected.products?.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.products.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{p.id}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="tag">{p.category}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{fmtINR(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
