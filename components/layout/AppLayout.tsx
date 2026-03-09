'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  History,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Key,
  CreditCard,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('common.dashboard'), icon: LayoutDashboard },
    { href: '/transactions', label: t('common.transactions'), icon: History },
    { href: '/payin', label: t('common.paymentsIn'), icon: ArrowDownLeft },
    { href: '/payout', label: t('common.paymentsOut'), icon: ArrowUpRight },
    { href: '/recharges', label: t('recharges.title'), icon: CreditCard },
    { href: '/mon-lien-de-paiement', label: t('paymentLinks.myLink'), icon: LinkIcon },
    { href: '/creer-un-lien-de-paiement', label: t('paymentLinks.createLink'), icon: Plus },
    { href: '/api-keys', label: t('common.apiKeys') || 'API Keys', icon: Key },
    { href: '/settings', label: t('common.settings'), icon: Settings },
  ];

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  if (loading) return (
    <div className="loading-screen"><div className="loader"></div></div>
  );

  const isAuthPage = pathname?.startsWith('/login');
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-text">{process.env.NEXT_PUBLIC_APP_NAME || t('login.title')}</span>
          <button
            className="close-btn show-mobile"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-group-label">MENU</span>
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar"><User size={16} /></div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.username || user?.email || t('common.user')}</span>
              <span className="sidebar-user-role">
                {user?.is_superuser ? t('common.superAdmin')
                  : user?.is_aggregator ? t('common.aggregator')
                    : t('common.member')}
              </span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>{t('common.signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <main className="content">
        <header className="top-nav">
          <div className="nav-left">
            <button
              className="menu-trigger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="page-title show-desktop">
              {navItems.find(n => n.href === pathname)?.label || t('dashboard.overview')}
            </h1>
            <span className="logo-mobile show-mobile">{process.env.NEXT_PUBLIC_APP_NAME || t('login.title')}</span>
          </div>

          <div className="nav-actions">
            <button className="icon-btn show-desktop" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <ThemeToggle />
            <LanguageToggle />
            <div className="user-profile show-desktop">
              <div className="user-info">
                <span className="user-name">{user?.username || user?.email || t('common.user')}</span>
                <span className="user-role">
                  {user?.is_superuser ? t('common.superAdmin')
                    : user?.is_aggregator ? t('common.aggregator')
                      : t('common.member')}
                </span>
              </div>
              <div className="avatar"><User size={16} /></div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-app);
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 260px;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          transition: transform var(--transition-base);
        }

        .sidebar-logo {
          padding: 28px 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .close-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: 8px;
        }
        .close-btn:hover { background: var(--bg-app); }

        /* Nav */
        .sidebar-nav { flex: 1; padding: 0 12px; overflow-y: auto; }

        .nav-group-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding: 0 14px;
          margin-bottom: 8px;
        }

        .nav-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 14px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          transition: all var(--transition-fast);
          text-decoration: none;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: var(--bg-app);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--accent-soft);
          color: var(--accent-primary);
          font-weight: 700;
          border-left-color: var(--accent-primary);
        }

        /* Footer */
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: var(--bg-app);
        }

        .sidebar-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-user-info { flex: 1; min-width: 0; }
        .sidebar-user-name {
          display: block;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-role {
          display: block;
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: var(--text-tertiary);
          font-weight: 600;
          font-size: 0.8125rem;
          transition: all var(--transition-fast);
        }
        .logout-btn:hover { color: var(--error); background: rgba(239,68,68,0.06); }

        /* Overlay */
        .sidebar-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        /* ===== MAIN CONTENT ===== */
        .content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Top nav */
        .top-nav {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-xl);
          position: sticky; top: 0; z-index: 900;
          background: var(--bg-surface-glass);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
        }

        .nav-left { display: flex; align-items: center; gap: var(--space-md); }
        .page-title { font-size: 1.0625rem; font-weight: 700; margin: 0; }
        .logo-mobile { font-size: 1rem; font-weight: 800; color: var(--accent-primary); }
        .nav-actions { display: flex; align-items: center; gap: var(--space-sm); }

        .menu-trigger {
          display: none;
          width: 38px; height: 38px;
          align-items: center; justify-content: center;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: var(--bg-app);
          color: var(--text-secondary);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding-left: var(--space-lg);
          border-left: 1px solid var(--border-subtle);
          margin-left: var(--space-sm);
        }

        .user-info { display: flex; flex-direction: column; align-items: flex-end; }
        .user-name { font-size: 0.8125rem; font-weight: 700; color: var(--text-primary); }
        .user-role { font-size: 0.6875rem; color: var(--text-tertiary); }

        .avatar {
          width: 32px; height: 32px;
          border-radius: var(--radius-full);
          background: var(--accent-soft);
          color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
        }

        .page-content {
          padding: var(--space-xl);
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        /* Loading */
        .loading-screen {
          width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-app);
        }
        .loader {
          width: 36px; height: 36px;
          border: 3px solid var(--accent-soft);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.mobile-open { transform: translateX(0); box-shadow: var(--shadow-xl); }
          .content { margin-left: 0; }
          .menu-trigger { display: flex; }
          .top-nav { padding: 0 16px; }
          .page-content { padding: 16px; }
        }

        @media (max-width: 1024px) {
          .show-desktop { display: none !important; }
          .show-mobile  { display: flex  !important; }
        }
        @media (min-width: 1025px) {
          .show-desktop { display: flex !important; }
          .show-mobile  { display: none !important; }
        }
      `}</style>
    </div>
  );
}
