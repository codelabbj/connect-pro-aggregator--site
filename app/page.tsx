'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, CreditCard, ChevronRight, Wallet, Plus } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/lib/useApi';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, accountData] = await Promise.all([
          api.get('/api/aggregator/dashboard/'),
          api.get('/api/payments/user/account/')
        ]);
        setStats(statsData);
        setAccount(accountData);
      } catch (error) {
        console.error(error);
        if (!stats) {
          setStats({
            transactions: { total_count: 0, pending_count: 0, success_count: 0, failed_count: 0, success_rate: 0 },
            payin: { total_count: 0, success_count: 0, total_amount: 0 },
            payout: { total_count: 0, success_count: 0, total_amount: 0 },
            today: { total_count: 0, success_count: 0, total_amount: 0 },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  if (loading) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

      {/* Balance Hero */}
      <BalanceHero account={account} t={t} />

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title={t('dashboard.totalTransactions')}
          value={stats.transactions.total_count}
          sub={`${stats.transactions.success_rate}% ${t('dashboard.successRate')}`}
          icon={<Activity size={20} />}
          color="purple"
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
            <DistRow label={t('common.failed')} value={stats.transactions.failed_count} color="var(--error)" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

function BalanceHero({ account, t }: any) {
  return (
    <div className="balance-hero card">
      <div className="hero-content">
        <div className="hero-main">
          <div className="hero-icon-wrapper">
            <Wallet size={20} />
          </div>
          <div className="hero-text">
            <h2 className="hero-label">{t('dashboard.walletBalance')}</h2>
            <div className="hero-value-row">
              <span className="hero-value">{account?.formatted_balance || '0 FCFA'}</span>
            </div>
            <p className="hero-user-name">{account?.user_name || t('common.user')}</p>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-stats">
            <div className="h-stat">
              <span className="h-stat-label">Total Recharged</span>
              <span className="h-stat-value">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(account?.total_recharged || 0))}</span>
            </div>
            <div className="h-divider" />
            <div className="h-stat">
              <span className="h-stat-label">Net Flow</span>
              <span className={`h-stat-value ${Number(account?.net_flow) >= 0 ? 'text-success' : 'text-error'}`}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(account?.net_flow || 0))}
              </span>
            </div>
          </div>

          <Link href="/recharges" className="hero-action-btn">
            <span>{t('recharges.createNew')}</span>
            <Plus size={16} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .balance-hero {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          border: 1px solid var(--border-base);
          box-shadow: var(--shadow-sm);
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .hero-main {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-icon-wrapper {
          width: 44px;
          height: 44px;
          background: rgba(37, 99, 235, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .hero-text {
          display: flex;
          flex-direction: column;
        }

        .hero-label {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }

        .hero-value {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .hero-user-name {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .hero-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 8px 16px;
          background: var(--bg-app);
          border-radius: 12px;
          border: 1px solid var(--border-base);
        }

        .h-stat {
          display: flex;
          flex-direction: column;
        }

        .h-stat-label {
          font-size: 0.5625rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }

        .h-stat-value {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .h-divider {
          width: 1px;
          height: 16px;
          background: var(--border-base);
        }

        .hero-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-primary);
          color: white;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8125rem;
          transition: all 0.2s;
          text-decoration: none;
        }

        .hero-action-btn:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .text-success { color: var(--success); }
        .text-error { color: var(--error); }

        @media (max-width: 900px) {
          .hero-content {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          .hero-right {
            flex-direction: column-reverse;
            align-items: stretch;
            gap: 12px;
          }
          .hero-stats {
            justify-content: space-around;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'rgba(37,99,235,0.08)',
    green: 'rgba(16,185,129,0.08)',
    orange: 'rgba(245,158,11,0.08)',
    purple: 'rgba(139,92,246,0.08)',
  };
  const textColors: Record<string, string> = {
    blue: '#2563eb',
    green: '#10b981',
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
