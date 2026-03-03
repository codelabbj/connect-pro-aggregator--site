'use client';

import { useState } from 'react';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';
import { Key, AlertTriangle, CheckCircle, Copy, AlertCircle, Loader2 } from 'lucide-react';

interface ApiKeyResponse {
  detail: string;
  api_key: string;
  api_secret: string;
  created_at: string;
}

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyData, setKeyData] = useState<ApiKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const api = useApi();
  const { t } = useLanguage();

  const handleGenerate = async () => {
    if (!window.confirm(t('apiKeys.confirmGenerate') || 'Are you sure you want to generate a new API Key? The old one will be revoked.')) {
      return;
    }

    setLoading(true);
    setError('');
    setKeyData(null);
    setCopiedKey(false);
    setCopiedSecret(false);

    try {
      const data = await api.get('/api/auth/api-key/');
      setKeyData(data);
    } catch (err: any) {
      setError(err.message || t('common.error') || 'An error occurred while generating the API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'key' | 'secret') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="api-keys-page">
      <div className="page-header">
        <h1 className="page-title">{t('common.apiKeys') || 'API Keys'}</h1>
        <p className="page-subtitle">{t('apiKeys.subtitle') || 'Manage your API Keys for integrating with our platform.'}</p>
      </div>

      <div className="settings-grid">
        <section className="card settings-section">
          <div className="section-icon-header">
            <div className="section-icon-box"><Key size={20} /></div>
            <div>
              <h2 className="section-name">{t('apiKeys.manageTitle') || 'Manage API Key'}</h2>
              <p className="section-desc">
                {t('apiKeys.manageDesc') || 'Generate a new API Key and Secret. Generating a new key will immediately revoke your previous pair.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="feedback-bar error-bar">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!keyData ? (
            <div className="generate-wrapper">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="action-btn primary-state generate-btn"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t('common.generating') || 'Generating...'}</> : t('apiKeys.generateBtn') || 'Generate New API Key'}
              </button>
            </div>
          ) : (
            <div className="key-results">
              <div className="warning-box">
                <AlertTriangle size={24} className="warning-icon" />
                <div className="warning-text">
                  <p className="warning-detail">{keyData.detail}</p>
                </div>
              </div>

              <div className="key-display-group">
                <div className="key-field">
                  <label>API Key</label>
                  <div className="key-value-wrap">
                    <code className="key-value">{keyData.api_key}</code>
                    <button onClick={() => handleCopy(keyData.api_key, 'key')} className="copy-btn" title="Copy API Key">
                      {copiedKey ? <CheckCircle size={18} className="text-success" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="key-field">
                  <label>API Secret</label>
                  <div className="key-value-wrap">
                    <code className="key-value">{keyData.api_secret}</code>
                    <button onClick={() => handleCopy(keyData.api_secret, 'secret')} className="copy-btn" title="Copy API Secret">
                      {copiedSecret ? <CheckCircle size={18} className="text-success" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-actions mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="action-btn danger-state"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> {t('common.generating') || 'Generating...'}</> : t('apiKeys.generateAnother') || 'Revoke & Generate Another Key'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .api-keys-page {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-2xl);
        }

        .page-header { }
        .page-title { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text-primary); }
        .page-subtitle { color: var(--text-tertiary); font-size: 0.9375rem; margin-top: 4px; }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .settings-section { padding: var(--space-2xl) !important; }

        .section-icon-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
          padding-bottom: var(--space-xl);
          border-bottom: 1px solid var(--border-subtle);
        }

        .section-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.1); /* Amber tint for keys */
          color: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-name { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); }
        .section-desc { font-size: 0.8125rem; color: var(--text-tertiary); margin-top: 2px; line-height: 1.5; }

        .generate-wrapper {
          display: flex;
          justify-content: flex-start;
          padding: var(--space-md) 0;
        }

        .action-btn {
          padding: 10px 24px;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-fast);
          justify-content: center;
          cursor: pointer;
          border: none;
        }
        .action-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

        .action-btn.primary-state {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }
        .action-btn.primary-state:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        
        .action-btn.danger-state {
          background: var(--bg-app);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .action-btn.danger-state:not(:disabled):hover {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .feedback-bar {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: var(--space-lg);
        }
        .error-bar { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--error); }

        .warning-box {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-xl);
          color: #b45309;
        }
        .warning-icon { flex-shrink: 0; margin-top: 2px; }
        .warning-detail { font-size: 0.875rem; font-weight: 600; line-height: 1.5; margin: 0; }

        .key-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .key-display-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          background: var(--bg-app);
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .key-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .key-field label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }

        .key-value-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: 8px;
          padding: 12px 16px;
        }

        .key-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9rem;
          color: var(--text-primary);
          word-break: break-all;
          margin-right: 16px;
        }

        .copy-btn {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .copy-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: var(--accent-soft);
        }

        .text-success { color: var(--success); }
        .mt-4 { margin-top: 1rem; }

        @media (max-width: 640px) {
          .settings-section { padding: var(--space-xl) !important; }
          .page-title { font-size: 1.375rem; }
          .key-value-wrap { flex-direction: column; align-items: stretch; gap: 12px; }
          .key-value { margin-right: 0; }
          .copy-btn { width: 100%; }
        }
      `}</style>
      <style jsx global>{`
        .animate-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
