'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useApi } from '@/lib/useApi';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import styles from './payment-link.module.css';

interface PaymentLink {
  uid: string;
  token: string;
  payment_url: string;
  objet: string;
  description: string;
  amount: string | null;
  status: string;
  status_display: string;
  is_reusable: boolean;
  expires_at: string | null;
  created_at: string;
  aggregator_transaction_uid: string | null;
}

export default function MonLienDePaiement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { get } = useApi();
  const [reusableLink, setReusableLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReusableLink = async () => {
      try {
        setLoading(true);
        const response = await get('/api/aggregator/payment-links/receive/');
        console.log('Payment link response:', response);
        
        // Handle different response formats
        if (response?.success) {
          // If response has data property
          if (response.data) {
            const data = Array.isArray(response.data) ? response.data : [response.data];
            if (data.length > 0) {
              const link = data.find((l: PaymentLink) => l.is_reusable);
              if (link) {
                setReusableLink(link);
                return;
              }
            }
          }
          // If response itself is the payment link (direct response)
          if (response.payment_url && response.token) {
            setReusableLink(response as PaymentLink);
            return;
          }
          setError('Aucun lien de paiement réutilisable trouvé');
        } else {
          console.error('API response error:', response);
          setError('Impossible de charger votre lien de paiement');
        }
      } catch (err) {
        console.error('Error fetching reusable link:', err);
        setError('Une erreur est survenue lors du chargement du lien');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReusableLink();
    }
  }, [user, get]);

  const handleCopyLink = () => {
    if (reusableLink?.payment_url) {
      navigator.clipboard.writeText(reusableLink.payment_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return <div className={styles.container}><p>{t('paymentLinks.pleaseSignIn')}</p></div>;
  }

  if (loading) {
    return <div className={styles.container}><p>{t('paymentLinks.loadingLink')}</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
  }

  if (!reusableLink) {
    return <div className={styles.container}><p>{t('paymentLinks.noReusableLink')}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1>{t('paymentLinks.myLink')}</h1>
      
      <div className={styles.linkCard}>
        <div className={styles.linkContent}>
          <div className={styles.linkSection}>
            <h2>{t('paymentLinks.myPaymentLink')}</h2>
            <p className={styles.description}>
              {t('paymentLinks.shareDescription')}
            </p>

            <div className={styles.urlContainer}>
              <input
                type="text"
                value={reusableLink.payment_url}
                readOnly
                className={styles.urlInput}
              />
              <button
                onClick={handleCopyLink}
                className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
              >
                {copied ? t('paymentLinks.copied') : t('paymentLinks.copyLink')}
              </button>
            </div>

            <div className={styles.qrCodeContainer}>
              <h3>{t('paymentLinks.qrCode')}</h3>
              <div className={styles.qrCode}>
                <QRCode
                  value={reusableLink.payment_url}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className={styles.qrText}>{t('paymentLinks.qrText')}</p>
            </div>

            {/* <div className={styles.infoSection}>
              <h3>{t('paymentLinks.information')}</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>{t('paymentLinks.object')}:</label>
                  <span>{reusableLink.objet}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>{t('paymentLinks.status')}:</label>
                  <span className={styles.status}>{reusableLink.status_display}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>{t('paymentLinks.createdOn')}:</label>
                  <span>{new Date(reusableLink.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>{t('paymentLinks.validUntil')}:</label>
                  <span>{reusableLink.expires_at ? new Date(reusableLink.expires_at).toLocaleDateString('fr-FR') : t('paymentLinks.indefinite')}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
