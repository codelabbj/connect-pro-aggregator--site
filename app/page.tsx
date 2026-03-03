'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/api/aggregator/dashboard/');
        setStats(data);
      } catch (error) {
        console.error(error);
        setStats({
          transactions: { total_count: 0, pending_count: 0, success_count: 0, failed_count: 0, success_rate: 0 },
          payin:  { total_count: 0, success_count: 0, total_amount: 0 },
          payout: { total_count: 0, success_count: 0, total_amount: 0 },
          today:  { total_count: 0, success_count: 0, total_amount: 0 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title={t('dashboard.totalTransactions')}
          value={stats.transactions.total_count}
          sub={`${stats.transactions.success_rate}% ${t('dashboard.successRate')}`}
          icon={<Activity size={20} />}
          color="blue"
        />
        <StatCard
          title={t('dashboard.payinVolume')}
          value={fmt(stats.payin.total_amount)}
          sub={`${stats.payin.success_count} success`}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title={t('dashboard.payoutVolume')}
          value={fmt(stats.payout.total_amount)}
          sub={`${stats.payout.success_count} success`}
          icon={<ArrowUpRight size={20} />}
          color="orange"
        />
        <StatCard
          title={t('dashboard.todayActivity')}
          value={fmt(stats.today.total_amount)}
          sub={`${stats.today.total_count} ${t('dashboard.txToday')}`}
          icon={<TrendingUp size={20} />}
          color="purple"
        />
      </div>

      {/* Charts row */}
      <div className="charts-grid">
        <div className="card">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t('dashboard.transactionTrends')}</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 2 }}>{t('dashboard.volumeThirtyDays')}</p>
          </div>
          <div style={{
            height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-app)', borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-base)', color: 'var(--text-muted)', fontSize: '0.875rem',
            flexDirection: 'column', gap: 'var(--space-md)',
          }}>
            <TrendingUp size={36} style={{ opacity: 0.2 }} />
            {t('dashboard.emptyChart')}
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t('dashboard.distribution')}</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 2 }}>{t('dashboard.byStatus')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <DistRow label={t('common.success')} value={stats.transactions.success_count} color="var(--success)" />
            <DistRow label={t('common.pending')} value={stats.transactions.pending_count} color="var(--warning)" />
            <DistRow label={t('common.failed')}  value={stats.transactions.failed_count}  color="var(--error)" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-xl);
        }
        @media (max-width: 1200px) {
          .stats-grid  { grid-template-columns: repeat(2, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .charts-grid { gap: 10px; }
          .stats-grid .card { padding: 14px !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }: any) {
  const colors: Record<string, string> = {
    blue:   'rgba(37,99,235,0.08)',
    green:  'rgba(16,185,129,0.08)',
    orange: 'rgba(245,158,11,0.08)',
    purple: 'rgba(139,92,246,0.08)',
  };
  const textColors: Record<string, string> = {
    blue:   '#2563eb',
    green:  '#10b981',
    orange: '#f59e0b',
    purple: '#8b5cf6',
  };

  return (
    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)',
          background: colors[color], color: textColors[color],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'var(--space-md)',
        }}>
          {icon}
        </div>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>{title}</p>
        <p className="stat-value" style={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{value}</p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</p>
      </div>
      <style jsx>{`
        .stat-value { font-size: 1.375rem; }
        @media (max-width: 400px) { .stat-value { font-size: 1.1rem; } }
      `}</style>
    </div>
  );
}

function DistRow({ label, value, color }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function fmt(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
}
