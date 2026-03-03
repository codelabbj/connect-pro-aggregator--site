'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Calendar,
  ExternalLink,
  Info,
  Clock,
  Loader2
} from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState('');

  // Filters
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [reference, setReference] = useState('');
  const [externalId, setExternalId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const api = useApi();
  const { t } = useLanguage();

  const fetchTransactions = useCallback(async (url?: string) => {
    setLoading(true);
    try {
      let endpoint = url || '/api/aggregator/transactions/';

      // If no URL provided, build from state
      if (!url) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (type) params.append('transaction_type', type);
        if (reference) params.append('reference', reference);
        if (externalId) params.append('external_id', externalId);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        params.append('page', page.toString());

        endpoint = `${endpoint}?${params.toString()}`;
      }

      const data = await api.get(endpoint);
      setTransactions(data?.results || (Array.isArray(data) ? data : []));
      setCount(data?.count || 0);
      setNextUrl(data?.next || null);
      setPrevUrl(data?.previous || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [api, status, type, reference, externalId, dateFrom, dateTo, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const resetFilters = () => {
    setStatus('');
    setType('');
    setReference('');
    setExternalId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const copyRef = (ref: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopied(ref);
    setTimeout(() => setCopied(''), 2000);
  };

  const goNext = () => {
    if (nextUrl) {
      setPage(p => p + 1);
      const path = nextUrl.replace(/^https?:\/\/[^/]+/, '');
      fetchTransactions(path);
    }
  };

  const goPrev = () => {
    if (prevUrl) {
      setPage(p => p - 1);
      const path = prevUrl.replace(/^https?:\/\/[^/]+/, '');
      fetchTransactions(path);
    }
  };

  const viewDetails = async (tx: any) => {
    setSelectedTx(tx);
    setDetailLoading(true);
    try {
      const data = await api.get(`/api/aggregator/transactions/${tx.uid}/`);
      setSelectedTx(data);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="transactions-container">
      <div className="header-flex">
        <div>
          <h1 className="page-title">{t('transactions.history')}</h1>
          <p className="page-subtitle">
            {count} transaction{count !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className={`filter-toggle mobile-only ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
          {(status || type || reference || externalId || dateFrom || dateTo) && <span className="filter-badge" />}
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className={`filter-bar-wrapper ${showFilters ? 'expanded' : ''}`}>
        <form onSubmit={handleSearch} className="filter-grid">
          <div className="filter-item">
            <label>Reference</label>
            <div className="input-with-icon">
              <Search size={14} className="icon" />
              <input
                type="text"
                placeholder="Search Reference..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-item">
            <label>External ID</label>
            <div className="input-with-icon">
              <ExternalLink size={14} className="icon" />
              <input
                type="text"
                placeholder="External ID..."
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-item">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Types</option>
              <option value="payin">Payin</option>
              <option value="payout">Payout</option>
            </select>
          </div>
          <div className="filter-item">
            <label>From</label>
            <div className="input-with-icon">
              <Calendar size={14} className="icon" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-item">
            <label>To</label>
            <div className="input-with-icon">
              <Calendar size={14} className="icon" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-reset" onClick={resetFilters}>Reset</button>
            <button type="submit" className="btn-search">Apply Filters</button>
          </div>
        </form>
      </div>

      {/* ── Transaction List ── */}
      <div className="table-card">
        <div className="table-responsive desktop-only">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Net</th>
                <th className="show-desktop-tx">Network</th>
                <th className="show-desktop-tx">Phone</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={9}><div className="skeleton-line" /></td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.uid} onClick={() => viewDetails(tx)} className="clickable-row">
                    <td title={tx.reference}>
                      <div className="ref-cell">
                        <span className="mono-ref">{tx.reference}</span>
                        <button onClick={(e) => copyRef(tx.reference, e)} className="btn-copy">
                          {copied === tx.reference ? <CheckCircle size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`tag-type ${tx.transaction_type}`}>
                        {tx.transaction_type === 'payin' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${tx.status}`}>{tx.status}</span>
                    </td>
                    <td className="font-bold">{fmt(tx.amount)}</td>
                    <td className="text-success font-bold">{tx.net_amount ? fmt(tx.net_amount) : '—'}</td>
                    <td className="show-desktop-tx text-secondary">{tx.network_name || '—'}</td>
                    <td className="show-desktop-tx text-secondary">{tx.recipient_phone || '—'}</td>
                    <td className="text-tertiary">
                      <div className="date-cell">
                        <span className="date-main">{new Date(tx.created_at).toLocaleDateString()}</span>
                        <span className="date-sub">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-info"><Info size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <div className="empty-content">
                      <Search size={40} />
                      <p>No transactions found matching your criteria.</p>
                      <button onClick={resetFilters} className="btn-link">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only card-list">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.uid} className="mobile-tx-card" onClick={() => viewDetails(tx)}>
                <div className="card-row">
                  <span className="mono-ref">{tx.reference}</span>
                  <span className={`badge-status ${tx.status}`}>{tx.status}</span>
                </div>
                <div className="card-row main">
                  <div className="type-amount">
                    <span className={`tag-type ${tx.transaction_type}`}>
                      {tx.transaction_type === 'payin' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                    </span>
                    <span className="amount">{fmt(tx.amount)}</span>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </div>
                <div className="card-row footer">
                  <span className="date">{new Date(tx.created_at).toLocaleString()}</span>
                  <span className="network">{tx.network_name || tx.network_code}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state mobile">
              <Search size={40} />
              <p>No transactions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {count > 0 && !loading && (
        <div className="pagination-bar">
          <span className="page-info">
            Showing Page <b>{page}</b> of <b>{Math.ceil(count / 20)}</b>
          </span>
          <div className="page-btns">
            <button onClick={goPrev} disabled={!prevUrl} className="btn-page">
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <button onClick={goNext} disabled={!nextUrl} className="btn-page">
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Transaction Detail Modal ── */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="btn-close" onClick={() => setSelectedTx(null)}><X size={20} /></button>
            </div>

            <div className={`modal-body ${detailLoading ? 'is-loading' : ''}`}>
              {detailLoading ? (
                <div className="modal-loader">
                  <Loader2 size={32} className="animate-spin" />
                  <p>Loading details...</p>
                </div>
              ) : (
                <div className="detail-grid">
                  <div className="detail-section full">
                    <div className="detail-label">Reference</div>
                    <div className="detail-value mono">
                      {selectedTx.reference}
                      <button onClick={() => copyRef(selectedTx.reference)} className="btn-copy-lg">
                        {copied === selectedTx.reference ? <CheckCircle size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      <span className={`badge-status large ${selectedTx.status}`}>{selectedTx.status}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Type</div>
                    <div className="detail-value">
                      <span className={`tag-type large ${selectedTx.transaction_type}`}>{selectedTx.transaction_type}</span>
                    </div>
                  </div>

                  <div className="detail-divider" />

                  <div className="detail-section">
                    <div className="detail-label">Amount</div>
                    <div className="detail-value price">{fmt(selectedTx.amount)}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Net Amount</div>
                    <div className="detail-value price success">{fmt(selectedTx.net_amount)}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Fee (Percent)</div>
                    <div className="detail-value">{selectedTx.user_fee_percent}%</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Fee (Amount)</div>
                    <div className="detail-value">{fmt(selectedTx.user_fee_amount)}</div>
                  </div>

                  <div className="detail-divider" />

                  <div className="detail-section">
                    <div className="detail-label">Network</div>
                    <div className="detail-value">{selectedTx.network_name} ({selectedTx.network_code})</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Phone</div>
                    <div className="detail-value">{selectedTx.recipient_phone}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Created At</div>
                    <div className="detail-value icon-flex"><Clock size={14} /> {new Date(selectedTx.created_at).toLocaleString()}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Completed At</div>
                    <div className="detail-value icon-flex">
                      {selectedTx.completed_at ? <><CheckCircle size={14} /> {new Date(selectedTx.completed_at).toLocaleString()}</> : '—'}
                    </div>
                  </div>

                  {selectedTx.external_id && (
                    <div className="detail-section full">
                      <div className="detail-label">External ID</div>
                      <div className="detail-value">{selectedTx.external_id}</div>
                    </div>
                  )}

                  {(selectedTx.objet || selectedTx.commentaire) && (
                    <div className="detail-section full">
                      <div className="detail-label">Notes</div>
                      <div className="detail-value notes">
                        {selectedTx.objet && <div><b>Object:</b> {selectedTx.objet}</div>}
                        {selectedTx.commentaire && <div><b>Comment:</b> {selectedTx.commentaire}</div>}
                      </div>
                    </div>
                  )}

                  {selectedTx.payment_comment && (
                    <div className="detail-section full">
                      <div className="detail-label">Payment Instruction</div>
                      <div className="detail-value instruction">{selectedTx.payment_comment}</div>
                    </div>
                  )}

                  {selectedTx.error_message && (
                    <div className="detail-section full">
                      <div className="detail-label">Error Message</div>
                      <div className="detail-value error-text">{selectedTx.error_message}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary-close" onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .transactions-container {
          padding-bottom: 40px;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
        }

        .page-title { font-size: 1.5rem; font-weight: 800; }
        .page-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: 4px; }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .filter-toggle:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .filter-toggle.active { background: var(--accent-soft); border-color: var(--accent-primary); color: var(--accent-primary); }
        .filter-badge {
          position: absolute;
          top: -4px; right: -4px;
          width: 10px; height: 10px;
          background: var(--accent-primary);
          border: 2px solid var(--bg-surface);
          border-radius: 50%;
        }

        /* Filter Bar */
        .filter-bar-wrapper {
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          margin-bottom: 0;
        }
        .filter-bar-wrapper.expanded {
          max-height: 800px;
          opacity: 1;
          margin-bottom: var(--space-xl);
        }

        @media (min-width: 769px) {
          .filter-bar-wrapper {
            max-height: none;
            overflow: visible;
            opacity: 1;
            margin-bottom: var(--space-xl);
          }
        }

        .filter-grid {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-lg);
          box-shadow: var(--shadow-sm);
        }

        .filter-item { display: flex; flex-direction: column; gap: 6px; }
        .filter-item label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        .filter-item input, .filter-item select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border-subtle);
          background: var(--bg-app);
          font-size: 0.875rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }
        .filter-item input:focus, .filter-item select:focus { border-color: var(--accent-primary); }

        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon input { padding-left: 36px; }

        .filter-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }

        .btn-reset { 
          padding: 10px 20px; border-radius: 8px; border: none; background: var(--bg-app); 
          color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-reset:hover { background: var(--border-subtle); color: var(--text-primary); }

        .btn-search {
          padding: 10px 24px; border-radius: 8px; border: none; background: var(--accent-primary);
          color: white; font-weight: 700; cursor: pointer; transition: 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .btn-search:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }

        .table-card { 
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .table-responsive { overflow-x: auto; }
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { 
          background: var(--bg-app);
          padding: 14px 18px;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--border-subtle);
        }
        .data-table td { padding: 16px 18px; border-bottom: 1px solid var(--border-subtle); font-size: 0.875rem; vertical-align: middle; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: var(--bg-app); }

        /* Mobile Card Style */
        .card-list { display: flex; flex-direction: column; }
        .mobile-tx-card { padding: 16px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; }
        .mobile-tx-card:active { background: var(--bg-app); }
        .card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .card-row.main { margin-bottom: 4px; }
        .card-row .type-amount { display: flex; align-items: center; gap: 8px; }
        .card-row .amount { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); }
        .card-row .date { font-size: 0.75rem; color: var(--text-tertiary); }
        .card-row .network { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .skeleton-card { height: 100px; width: 100%; border-bottom: 1px solid var(--border-subtle); position: relative; overflow: hidden; }
        .skeleton-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, var(--bg-app), transparent); animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .ref-cell { display: flex; align-items: center; gap: 8px; }
        .mono-ref { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; color: var(--text-primary); }
        .btn-copy { background: none; border: none; color: var(--text-muted); padding: 4px; border-radius: 4px; cursor: pointer; display: flex; }
        .btn-copy:hover { background: var(--border-subtle); color: var(--accent-primary); }

        .tag-type { 
          display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; 
          border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
        }
        .tag-type.payin { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .tag-type.payout { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .tag-type.large { font-size: 0.8125rem; padding: 6px 14px; }

        .badge-status {
          display: inline-block; padding: 4px 10px; border-radius: 6px; 
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
        }
        .badge-status.pending { background: #f3f4f6; color: #6b7280; }
        .badge-status.completed { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .badge-status.failed { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .badge-status.large { font-size: 0.8125rem; padding: 6px 14px; }

        .date-cell { display: flex; flex-direction: column; }
        .date-main { font-weight: 700; color: var(--text-secondary); }
        .date-sub { font-size: 0.7rem; color: var(--text-tertiary); }

        .btn-info { background: var(--bg-app); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px; color: var(--text-tertiary); cursor: pointer; }
        .btn-info:hover { color: var(--accent-primary); border-color: var(--accent-primary); }

        .empty-state { text-align: center; padding: 60px 0; }
        .empty-content { display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-muted); }
        .btn-link { background: none; border: none; color: var(--accent-primary); font-weight: 700; cursor: pointer; text-decoration: underline; }

        /* Pagination */
        .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-xl); }
        .page-info { font-size: 0.8125rem; color: var(--text-muted); }
        .page-btns { display: flex; gap: 8px; }
        .btn-page { 
          display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px;
          border: 1px solid var(--border-subtle); background: var(--bg-surface); 
          color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-page:not(:disabled):hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Modal Styles */
        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
          z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal-content { 
          background: var(--bg-surface); border-radius: 20px; width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: modalIn 0.3s ease-out;
        }
        @keyframes modalIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header { 
          padding: 20px 24px; border-bottom: 1px solid var(--border-subtle);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h3 { font-size: 1.125rem; font-weight: 800; }
        .btn-close { background: none; border: none; color: var(--text-muted); cursor: pointer; }

        .modal-body { padding: 24px; position: relative; min-height: 200px; }
        .modal-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 0; color: var(--text-muted); }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-section.full { grid-column: 1 / -1; }
        .detail-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .detail-value { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; word-break: break-all; }
        .detail-value.mono { font-family: monospace; display: flex; align-items: center; gap: 8px; }
        .detail-value.price { font-size: 1.25rem; font-weight: 900; }
        .detail-value.success { color: var(--success); }
        .detail-value.icon-flex { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; }
        .detail-value.notes { background: var(--bg-app); padding: 12px; border-radius: 8px; font-weight: 500; font-size: 0.8125rem; line-height: 1.6; }
        .detail-value.instruction { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 16px; border-radius: 12px; font-weight: 500; font-size: 0.8125rem; line-height: 1.6; }
        .detail-value.error-text { color: var(--error); background: rgba(239, 68, 68, 0.05); padding: 12px; border-radius: 8px; }

        .detail-divider { grid-column: 1 / -1; height: 1px; background: var(--border-subtle); margin: 4px 0; }
        
        .btn-copy-lg { background: var(--bg-app); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 10px; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; }
        .btn-copy-lg:hover { color: var(--accent-primary); border-color: var(--accent-primary); }

        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; }
        .btn-primary-close { padding: 10px 24px; border-radius: 10px; background: var(--accent-primary); color: white; border: none; font-weight: 700; cursor: pointer; }

        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
          .pagination-bar { flex-direction: column; gap: 12px; }
          .page-btns { width: 100%; justify-content: space-between; }
        }

        @media (max-width: 640px) {
          .header-flex { flex-direction: column; gap: 16px; align-items: stretch; }
          .filter-grid { grid-template-columns: 1fr; gap: 16px; }
          .filter-actions { flex-direction: column-reverse; }
          .btn-search, .btn-reset { width: 100%; }
          .detail-grid { grid-template-columns: 1fr; gap: 16px; }
          .modal-content { border-radius: 0; height: 100vh; max-height: 100vh; }
          .modal-header { padding: 16px 20px; }
          .modal-body { padding: 20px; }
          .detail-value.price { font-size: 1.125rem; }
        }

        /* Skeleton */
        .skeleton-row td { padding: 20px; }
        .skeleton-line { height: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeletonLoading 1.5s infinite; border-radius: 6px; }
        @keyframes skeletonLoading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* Global Helper */}
      <style jsx global>{`
        .loader-icon { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function fmt(val: string | number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(Number(val));
}
