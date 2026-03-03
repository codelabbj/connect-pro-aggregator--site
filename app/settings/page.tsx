'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, Link2, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const api = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchWebhook = async () => {
      try {
        const data = await api.get('/api/aggregator/webhook-url/');
        setWebhookUrl(data.webhook_url || '');
      } catch (error) { console.error(error); }
    };
    fetchWebhook();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/aggregator/webhook-url/', { webhook_url: webhookUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      await api.post('/api/auth/password-update/', { old_password: currentPassword, new_password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || t('common.error'));
    } finally { setPasswordLoading(false); }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account and integration preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Webhook Section */}
        <section className="card settings-section">
          <div className="section-icon-header">
            <div className="section-icon-box"><Link2 size={20} /></div>
            <div>
              <h2 className="section-name">{t('settings.webhookTitle')}</h2>
              <p className="section-desc">{t('settings.webhookSubtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="settings-form">
            <div className="form-field">
              <label>{t('settings.callbackUrl')}</label>
              <input
                type="url"
                value={webhookUrl || ''}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={t('settings.urlPlaceholder')}
                required
              />
              <span className="field-hint">{t('settings.webhookHint')}</span>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className={`action-btn ${saved ? 'success-state' : 'primary-state'}`}>
                {loading ? t('common.saving') : saved ? (
                  <><CheckCircle size={16} /> {t('common.saved')}</>
                ) : t('common.update')}
              </button>
            </div>
          </form>
        </section>

        {/* Security Section */}
        <section className="card settings-section">
          <div className="section-icon-header">
            <div className="section-icon-box shield"><Shield size={20} /></div>
            <div>
              <h2 className="section-name">{t('settings.securityTitle')}</h2>
              <p className="section-desc">{t('settings.securitySubtitle')}</p>
            </div>
          </div>

          {passwordError && (
            <div className="feedback-bar error-bar">
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}
          {passwordSuccess && (
            <div className="feedback-bar success-bar">
              <CheckCircle size={16} />
              <span>{t('settings.passwordSuccess')}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-field">
              <label>{t('settings.currentPassword')}</label>
              <div className="pw-input-wrap">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword || ''}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-eye" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>{t('settings.newPassword')}</label>
              <div className="pw-input-wrap">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword || ''}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-eye" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={passwordLoading} className="action-btn primary-state">
                {passwordLoading ? t('common.saving') : t('settings.updatePassword')}
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-2xl);
        }

        .settings-header { }
        .settings-title { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text-primary); }
        .settings-subtitle { color: var(--text-tertiary); font-size: 0.9375rem; margin-top: 4px; }

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
          background: var(--accent-soft);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .section-icon-box.shield {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .section-name { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); }
        .section-desc { font-size: 0.8125rem; color: var(--text-tertiary); margin-top: 2px; line-height: 1.5; }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 12px 16px;
          font-size: 0.9375rem;
          font-family: inherit;
          color: var(--text-primary);
          background: var(--bg-app);
          border: 1.5px solid var(--border-subtle);
          border-radius: 10px;
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .form-field input::placeholder {
          color: var(--text-muted);
        }

        .form-field input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .pw-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .pw-input-wrap input { padding-right: 48px; }

        .pw-eye {
          position: absolute;
          right: 14px;
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }
        .pw-eye:hover { color: var(--accent-primary); }

        .form-actions { display: flex; justify-content: flex-end; padding-top: var(--space-sm); }

        .action-btn {
          padding: 10px 24px;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-fast);
          min-width: 120px;
          justify-content: center;
        }

        .action-btn.primary-state {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .action-btn.primary-state:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .action-btn.success-state {
          background: var(--success);
          color: white;
        }

        .action-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

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
        .success-bar { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--success); }

        @media (max-width: 640px) {
          .settings-section { padding: var(--space-xl) !important; }
          .settings-title { font-size: 1.375rem; }
          .form-actions { justify-content: stretch; }
          .action-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
