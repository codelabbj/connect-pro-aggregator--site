'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import '../login.css';

function ResetConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setErrorMessage(t('resetConfirm.invalidLink'));
    }
  }, [uid, token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage(t('resetConfirm.mismatchError'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      if (!uid || !token) throw new Error(t('resetConfirm.invalidLink'));
      await authService.resetPasswordConfirm(uid, token, password);
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="status-container animate-fade-in">
        <CheckCircle2 size={48} className="success-icon" />
        <h2>{t('common.success')}</h2>
        <p>{t('resetConfirm.successMessage')}</p>
        <Link href="/login" className="login-btn" style={{ marginTop: 'var(--space-xl)', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          {t('forgotPassword.backToSignIn')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="logo-section">
        <h1 className="logo-text">{t('resetConfirm.title')}</h1>
        <p className="subtitle">{t('resetConfirm.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {errorMessage && (
          <div className="error-alert">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="password">{t('resetConfirm.newPassword')}</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input 
              id="password"
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={password || ''}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="input-group">
          <label htmlFor="confirmPassword">{t('resetConfirm.confirmPassword')}</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input 
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={confirmPassword || ''}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading || status === 'error'} className="login-btn">
          {loading ? <Loader2 size={18} className="animate-spin" /> : t('resetConfirm.resetButton')}
        </button>
      </form>
    </>
  );
}

export default function ResetConfirmPage() {
  return (
    <div className="login-container">
      <div className="login-header">
        <span className="login-brand">Connect Pro Agg</span>
        <div className="login-header-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
      
      <div className="login-card-wrapper">
        <div className="login-card">
          <Suspense fallback={<div style={{ height: '300px', display:'flex', alignItems:'center', justifyContent:'center' }}><Loader2 className="animate-spin" size={32} /></div>}>
            <ResetConfirmContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
