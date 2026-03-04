'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ identifier, password });
    } catch (err: any) {
      setError(err.message || t('login.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <span className="login-brand">{process.env.NEXT_PUBLIC_APP_NAME || t('login.title')}</span>
        <div className="login-header-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="logo-section">
            <p className="subtitle">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-alert">{error}</div>}

            <div className="input-group">
              <label htmlFor="email">{t('common.email')}</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={identifier || ''}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">{t('common.password')}</label>
                <Link href="/login/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? <Loader2 size={18} className="animate-spin" /> : t('login.signIn')}
            </button>
          </form>

          <div className="login-footer">
            <p>{t('login.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
