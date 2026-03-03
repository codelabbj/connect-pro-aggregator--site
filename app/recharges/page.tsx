'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';
import {
    Plus,
    Search,
    Filter,
    X,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Clock3,
    Image as ImageIcon,
    Copy,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    Upload
} from 'lucide-react';

export default function RechargesPage() {
    const [recharges, setRecharges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRecharge, setSelectedRecharge] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Create Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const api = useApi();
    const { t } = useLanguage();

    const fetchRecharges = useCallback(async (url?: string) => {
        setLoading(true);
        try {
            let endpoint = url || '/api/payments/user/recharges/';

            if (!url) {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (status) params.append('status', status);
                if (dateFrom) params.append('date_from', dateFrom);
                if (dateTo) params.append('date_to', dateTo);
                params.append('page', page.toString());
                endpoint = `${endpoint}?${params.toString()}`;
            }

            const data = await api.get(endpoint);
            setRecharges(data?.results || (Array.isArray(data) ? data : []));
            setCount(data?.count || 0);
            setNextUrl(data?.next || null);
            setPrevUrl(data?.previous || null);
        } catch (error) {
            console.error('Failed to fetch recharges:', error);
        } finally {
            setLoading(false);
        }
    }, [api, search, status, dateFrom, dateTo, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRecharges();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchRecharges]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        setSubmitting(true);
        setFormError(null);
        try {
            const formData = new FormData();
            formData.append('amount', amount);
            if (proofFile) formData.append('proof_image', proofFile);
            if (description) formData.append('proof_description', description);
            if (transactionDate) formData.append('transaction_date', transactionDate);

            await api.post('/api/payments/user/recharges/', formData);
            setShowCreateModal(false);
            resetForm();
            fetchRecharges();
        } catch (error: any) {
            setFormError(error.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setTransactionDate('');
        setProofFile(null);
        setPreviewUrl(null);
        setFormError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setProofFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={14} className="text-success" />;
            case 'rejected': return <AlertCircle size={14} className="text-error" />;
            case 'pending': return <Clock3 size={14} className="text-muted" />;
            case 'proof_submitted': return <ImageIcon size={14} className="text-blue" />;
            case 'expired': return <Clock size={14} className="text-muted" />;
            default: return null;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fmtAmount = (val: string | number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <div className="recharges-container">
            <div className="header-flex">
                <div>
                    <h1 className="page-title">{t('recharges.title')}</h1>
                    <p className="page-subtitle">{t('recharges.subtitle')}</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`filter-toggle mobile-only ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>{showFilters ? t('common.cancel') : t('common.search')}</span>
                    </button>
                    <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        <span>{t('recharges.createNew')}</span>
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className={`filter-bar-wrapper ${showFilters ? 'expanded' : ''}`}>
                <div className="filter-grid">
                    <div className="filter-item">
                        <label>{t('common.search')}</label>
                        <div className="input-with-icon">
                            <Search size={14} className="icon" />
                            <input
                                type="text"
                                placeholder={t('recharges.searchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-item">
                        <label>{t('common.status')}</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">{t('recharges.filterStatus')}</option>
                            <option value="pending">{t('recharges.statusPending')}</option>
                            <option value="approved">{t('recharges.statusApproved')}</option>
                            <option value="rejected">{t('recharges.statusRejected')}</option>
                            <option value="expired">{t('recharges.statusExpired')}</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>{t('common.date')} ({t('common.confirm')})</label>
                        <div className="input-with-icon">
                            <Calendar size={14} className="icon" />
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                    </div>
                    <div className="filter-item">
                        <label>{t('common.date')} ({t('common.cancel')})</label>
                        <div className="input-with-icon">
                            <Calendar size={14} className="icon" />
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── List View ── */}
            <div className="table-card">
                <div className="table-responsive desktop-only">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('common.reference')}</th>
                                <th>{t('common.amount')}</th>
                                <th>{t('common.status')}</th>
                                <th>{t('common.date')}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="skeleton-row">
                                        <td colSpan={5}><div className="skeleton-line" /></td>
                                    </tr>
                                ))
                            ) : recharges.length > 0 ? (
                                recharges.map((item) => (
                                    <tr key={item.uid} onClick={() => setSelectedRecharge(item)} className="clickable-row">
                                        <td><span className="mono-ref">{item.reference}</span></td>
                                        <td className="font-bold">{fmtAmount(item.amount)}</td>
                                        <td>
                                            <span className={`badge-status ${item.status}`}>
                                                {getStatusIcon(item.status)}
                                                {t(`recharges.status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}
                                            </span>
                                        </td>
                                        <td className="text-secondary">{formatDate(item.created_at)}</td>
                                        <td><ChevronRight size={18} className="text-muted" /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        <div className="empty-content">
                                            <Clock3 size={40} />
                                            <p>No recharge requests found.</p>
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
                    ) : recharges.length > 0 ? (
                        recharges.map((item) => (
                            <div key={item.uid} className="mobile-recharge-card" onClick={() => setSelectedRecharge(item)}>
                                <div className="card-row">
                                    <span className="mono-ref">{item.reference}</span>
                                    <span className={`badge-status ${item.status}`}>
                                        {getStatusIcon(item.status)}
                                        {t(`recharges.status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}
                                    </span>
                                </div>
                                <div className="card-row main">
                                    <span className="amount">{fmtAmount(item.amount)}</span>
                                    <ChevronRight size={18} className="text-muted" />
                                </div>
                                <div className="card-row footer">
                                    <span className="date">{formatDate(item.created_at)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state mobile">
                            <Clock3 size={40} />
                            <p>No recharge requests found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Pagination ── */}
            {count > 0 && !loading && (
                <div className="pagination-bar">
                    <span className="page-info">Total: <b>{count}</b></span>
                    <div className="page-btns">
                        <button onClick={() => setPage(p => p - 1)} disabled={!prevUrl} className="btn-page">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="page-current">{page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={!nextUrl} className="btn-page">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Create Modal ── */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('recharges.createNew')}</h3>
                            <button className="btn-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="modal-body">
                            {formError && (
                                <div className="form-error-banner">
                                    <AlertCircle size={18} />
                                    <span>{formError}</span>
                                </div>
                            )}
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>{t('recharges.amountLabel')}</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('recharges.transactionDateLabel')}</label>
                                    <input
                                        type="date"
                                        value={transactionDate}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>{t('recharges.proofDescLabel')}</label>
                                    <textarea
                                        rows={2}
                                        placeholder="..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="form-group full">
                                    <label>{t('recharges.proofImageLabel')}</label>
                                    <div className="upload-container" onClick={() => fileInputRef.current?.click()}>
                                        {previewUrl ? (
                                            <div className="image-preview-wrapper" onClick={e => e.stopPropagation()}>
                                                <img src={previewUrl} alt="Preview" className="image-preview" />
                                                <button type="button" className="btn-remove-image" onClick={removeFile}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Upload size={24} />
                                                <p>Click to upload proof of payment</p>
                                                <span>JPG, PNG or PDF (max 5MB)</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : t('recharges.submitRequest')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Detail Modal ── */}
            {selectedRecharge && (
                <div className="modal-overlay" onClick={() => setSelectedRecharge(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('recharges.details')}</h3>
                            <button className="btn-close" onClick={() => setSelectedRecharge(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body detail-view">
                            <div className="detail-header-status">
                                <div className="status-top">
                                    <span className={`badge-status large ${selectedRecharge.status}`}>
                                        {getStatusIcon(selectedRecharge.status)}
                                        {t(`recharges.status${selectedRecharge.status.charAt(0).toUpperCase() + selectedRecharge.status.slice(1)}`)}
                                    </span>
                                    <span className="detail-amount">{fmtAmount(selectedRecharge.amount)}</span>
                                </div>
                                <div className="detail-ref">
                                    <span className="label">REF:</span> {selectedRecharge.reference}
                                </div>
                            </div>

                            <div className="detail-info-grid">
                                <div className="info-item">
                                    <label>{t('common.date')}</label>
                                    <span>{formatDate(selectedRecharge.created_at)}</span>
                                </div>
                                {selectedRecharge.transaction_date && (
                                    <div className="info-item">
                                        <label>{t('recharges.transactionDateLabel')}</label>
                                        <span>{new Date(selectedRecharge.transaction_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {selectedRecharge.expires_at && !selectedRecharge.is_expired && (
                                    <div className="info-item">
                                        <label>{t('recharges.timeRemaining')}</label>
                                        <span className="text-warning">{selectedRecharge.time_remaining}s</span>
                                    </div>
                                )}
                            </div>

                            {selectedRecharge.proof_description && (
                                <div className="detail-section">
                                    <label>{t('recharges.proofDescLabel')}</label>
                                    <div className="note-box">{selectedRecharge.proof_description}</div>
                                </div>
                            )}

                            {selectedRecharge.proof_image && (
                                <div className="detail-section">
                                    <label>{t('recharges.proofImageLabel')}</label>
                                    <div className="proof-image-display">
                                        <img src={selectedRecharge.proof_image} alt="Proof" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .recharges-container { padding-bottom: 40px; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .header-actions { display: flex; gap: 12px; }
        .page-title { font-size: 1.5rem; font-weight: 800; }
        .page-subtitle { color: var(--text-tertiary); font-size: 0.875rem; }

        .btn-create {
          display: flex; align-items: center; gap: 8px; padding: 10px 18px;
          background: var(--accent-primary); color: white; border-radius: 10px;
          font-weight: 700; font-size: 0.875rem; transition: transform 0.2s;
        }
        .btn-create:hover { transform: translateY(-1px); filter: brightness(1.1); }

        .filter-toggle {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          background: var(--bg-surface); border: 1px solid var(--border-subtle);
          border-radius: 10px; color: var(--text-secondary); font-weight: 600; cursor: pointer;
        }
        .filter-toggle.active { background: var(--accent-soft); color: var(--accent-primary); border-color: var(--accent-primary); }

        .filter-bar-wrapper { max-height: 0; overflow: hidden; opacity: 0; transition: all 0.3s ease; }
        .filter-bar-wrapper.expanded { max-height: 500px; opacity: 1; margin-bottom: 24px; }
        
        @media (min-width: 769px) {
          .filter-bar-wrapper { max-height: none; overflow: visible; opacity: 1; margin-bottom: 24px; }
        }

        .filter-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;
          background: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-subtle);
        }
        .filter-item { display: flex; flex-direction: column; gap: 6px; }
        .filter-item label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .filter-item input, .filter-item select { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-app); font-size: 0.875rem; width: 100%; transition: border-color 0.2s; }
        .filter-item input:focus, .filter-item select:focus { border-color: var(--accent-primary); outline: none; }

        .table-card { background: var(--bg-surface); border-radius: 16px; border: 1px solid var(--border-subtle); overflow: hidden; box-shadow: var(--shadow-sm); }
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { background: var(--bg-app); padding: 14px 18px; font-size: 0.75rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; border-bottom: 2px solid var(--border-subtle); }
        .data-table td { padding: 16px 18px; border-bottom: 1px solid var(--border-subtle); font-size: 0.875rem; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: var(--bg-app); }

        /* Mobile Card Style */
        .card-list { display: flex; flex-direction: column; }
        .mobile-recharge-card { padding: 16px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background 0.2s; }
        .mobile-recharge-card:last-child { border-bottom: none; }
        .mobile-recharge-card:active { background: var(--bg-app); }
        .card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .card-row.main { margin-bottom: 4px; }
        .card-row.footer { margin-bottom: 0; }
        .card-row .amount { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); }
        .card-row .date { font-size: 0.75rem; color: var(--text-tertiary); }
        .skeleton-card { height: 80px; width: 100%; border-bottom: 1px solid var(--border-subtle); padding: 16px; position: relative; overflow: hidden; }
        .skeleton-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, var(--bg-app), transparent); animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .mono-ref { font-family: monospace; color: var(--text-secondary); }
        .badge-status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .badge-status.pending { background: #f3f4f6; color: #6b7280; }
        .badge-status.approved { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .badge-status.proof_submitted { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .badge-status.rejected { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .badge-status.expired { background: #fee2e2; color: #991b1b; }
        .badge-status.large { padding: 8px 14px; font-size: 0.875rem; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { background: var(--bg-surface); border-radius: 20px; width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1.5px solid var(--border-subtle); background: var(--bg-app); color: var(--text-primary); }

        .upload-container { border: 2px dashed var(--border-subtle); border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: border-color 0.2s; }
        .upload-container:hover { border-color: var(--accent-primary); }
        .upload-placeholder { color: var(--text-tertiary); display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .upload-placeholder p { font-weight: 600; font-size: 0.875rem; }
        .upload-placeholder span { font-size: 0.75rem; }
        .image-preview-wrapper { position: relative; width: 100%; max-height: 200px; border-radius: 8px; overflow: hidden; }
        .image-preview { width: 100%; height: 100%; object-fit: contain; }
        .btn-remove-image { position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; padding: 6px; border-radius: 50%; cursor: pointer; }

        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .btn-secondary { padding: 10px 20px; border-radius: 10px; background: var(--bg-app); font-weight: 600; cursor: pointer; }
        .btn-primary { padding: 10px 24px; border-radius: 10px; background: var(--accent-primary); color: white; font-weight: 700; cursor: pointer; border: none; }

        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .detail-header-status { margin-bottom: 24px; }
        .status-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .detail-amount { font-size: 1.5rem; font-weight: 900; }
        .detail-ref { font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); }
        .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: var(--bg-app); padding: 16px; border-radius: 12px; margin-bottom: 24px; }
        .info-item label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .info-item span { font-weight: 700; font-size: 0.875rem; }
        .note-box { background: var(--bg-app); padding: 16px; border-radius: 12px; font-size: 0.875rem; line-height: 1.6; }
        .proof-image-display { margin-top: 12px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle); }
        .proof-image-display img { width: 100%; display: block; }

        .hidden { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
          .pagination-bar { flex-direction: column; gap: 12px; align-items: center; }
          .page-btns { width: 100%; justify-content: space-between; }
        }

        @media (max-width: 640px) {
          .header-flex { flex-direction: column; gap: 16px; align-items: stretch; }
          .header-actions { width: 100%; }
          .btn-create, .filter-toggle { flex: 1; justify-content: center; }
          .form-grid, .detail-info-grid { grid-template-columns: 1fr; gap: 16px; }
          .modal-content { border-radius: 0; height: 100vh; max-height: 100vh; }
          .modal-header { padding: 16px 20px; }
          .modal-body { padding: 20px; }
          .status-top { flex-direction: column; align-items: flex-start; gap: 12px; }
          .detail-amount { font-size: 1.25rem; }
        }
      `}</style>
        </div>
    );
}
