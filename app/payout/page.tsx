'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { aggregatorApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

export default function PayoutPage() {
  const [loading, setLoading] = useState(false);
  const [networks, setNetworks] = useState<any[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const api = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await aggregatorApi.getNetworks();
        const list = res?.data || res;
        setNetworks(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNetworks();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData(e.currentTarget);
    const payload = {
      amount: formData.get('amount'),
      recipient_phone: formData.get('phone'),
      network: formData.get('network'),
    };
    try {
      await api.post('/api/aggregator/payout/', payload);
      setSuccess(t('common.success'));
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('payout.title')}</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: 4 }}>{t('payout.subtitle')}</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {error && (
            <div style={{ padding: 'var(--space-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--error)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: 'var(--space-md)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.875rem' }}>
              {success}
            </div>
          )}

          <FormField label={t('payout.amountLabel')}>
            <input type="number" name="amount" placeholder="5000" required style={inputStyle} />
          </FormField>

          <FormField label={t('payout.phoneLabel')}>
            <input type="tel" name="phone" placeholder="0196062448" required style={inputStyle} />
          </FormField>

          <FormField label={t('payout.networkLabel')}>
            <select name="network" required style={inputStyle}>
              <option value="">— Select —</option>
              {networks.map(n => (
                <option key={n.network_uid} value={n.network_uid}>{n.network_name}</option>
              ))}
            </select>
          </FormField>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 48,
              background: 'var(--accent-primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t('common.processing') : t('payout.submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--bg-app)',
  border: '1.5px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '0.9375rem',
};
