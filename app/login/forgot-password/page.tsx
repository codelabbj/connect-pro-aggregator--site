'use client';

import { useState } from 'react';
import { authService } from '@/services/auth';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Loader2, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import '../login.css';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=enter email, 2=enter code+pw, 3=done
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.resetPassword(identifier);
      setInfo(res.message || 'A reset code has been sent.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.confirmReset({ identifier, code, new_password: newPassword });
      setInfo(res.message || 'Password reset successfully!');
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <span className="login-brand">{t('login.title')}</span>
        <div className="login-header-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">

          {/* ── STEP 1: Enter identifier ── */}
          {step === 1 && (
            <>
              <div className="logo-section">
                <p className="subtitle">{t('forgotPassword.subtitle')}</p>
              </div>

              <form onSubmit={handleInitiate} className="login-form">
                {error && <div className="error-alert">{error}</div>}

                <div className="input-group">
                  <label htmlFor="identifier">{t('forgotPassword.identifier')}</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="identifier"
                      type="text"
                      placeholder={t('forgotPassword.identifierPlaceholder')}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : t('forgotPassword.sendLink')}
                </button>
              </form>

              <div className="login-footer">
                <Link href="/login" className="back-link">
                  <ArrowLeft size={16} />
                  {t('forgotPassword.backToSignIn')}
                </Link>
              </div>
            </>
          )}

          {/* ── STEP 2: Enter code + new password ── */}
          {step === 2 && (
            <>
              <div className="logo-section">
                <p className="subtitle">{info}</p>
              </div>

              <form onSubmit={handleConfirm} className="login-form">
                {error && <div className="error-alert">{error}</div>}

                <div className="input-group">
                  <label htmlFor="code">Reset Code</label>
                  <div className="input-wrapper">
                    <KeyRound size={18} className="input-icon" />
                    <input
                      id="code"
                      type="text"
                      placeholder="Enter the code you received"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>

              <div className="login-footer">
                <button onClick={() => { setStep(1); setError(''); }} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <ArrowLeft size={16} />
                  Go back
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <>
              <div className="logo-section" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <CheckCircle size={28} />
                </div>
                <p className="subtitle" style={{ color: 'var(--success)', fontWeight: 600 }}>{info}</p>
              </div>
              <div className="login-footer">
                <Link href="/login" className="login-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                  Back to Sign In
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
