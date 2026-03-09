'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useApi } from '@/lib/useApi';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { aggregatorApi } from '@/services/api';
import styles from './create-link.module.css';

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

interface CreateLinkForm {
  objet: string;
  description: string;
  amount: string;
  network: string;
  expires_in_hours: string;
}

export default function CreerUnLienDePaiement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { post, get } = useApi();

  const [formData, setFormData] = useState<CreateLinkForm>({
    objet: '',
    description: '',
    amount: '',
    network: '',
    expires_in_hours: '48',
  });

  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [networks, setNetworks] = useState<any[]>([]);
  const itemsPerPage = 10;

  // Fetch payment links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await get('/api/aggregator/payment-links');
      console.log('Payment links response:', response);
      
      if (response?.success) {
        // Handle different response formats
        const allLinks = response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [];
        // Show all links (both one-time and reusable)
        console.log('All links:', allLinks);
        setLinks(allLinks);
      } else {
        console.error('API response error:', response);
        setError(t('paymentLinks.errorLoading'));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(t('paymentLinks.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch networks
  const fetchNetworks = async () => {
    try {
      const res = await aggregatorApi.getNetworks();
      const list = res?.data || res;
      setNetworks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching networks:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchNetworks();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.objet.trim()) {
      setError(t('paymentLinks.objectRequired'));
      return;
    }

    try {
      setCreatingLink(true);
      setError(null);
      setSuccessMessage(null);

      const payload = {
        objet: formData.objet,
        description: formData.description,
        amount: formData.amount ? parseInt(formData.amount) : null,
        network: formData.network || null,
        expires_in_hours: parseInt(formData.expires_in_hours) || 48,
      };

      const response = await post('/api/aggregator/payment-links/', payload);

      if (response.success) {
        setSuccessMessage(`${t('paymentLinks.linkCreatedSuccess')}${response.payment_url}`);
        setFormData({
          objet: '',
          description: '',
          amount: '',
          network: '',
          expires_in_hours: '48',
        });
        fetchLinks();
      } else {
        setError(t('paymentLinks.errorCreating'));
      }
    } catch (err: any) {
      setError(err.message || t('paymentLinks.errorCreating'));
      console.error(err);
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyLink = (url: string, uid: string) => {
    navigator.clipboard.writeText(url);
    setCopied(uid);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleViewLink = (url: string) => {
    window.open(url, '_blank');
  };

  // Pagination
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLinks = links.slice(startIndex, startIndex + itemsPerPage);

  if (!user) {
    return <div className={styles.container}><p>{t('paymentLinks.pleaseSignIn')}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1>{t('paymentLinks.createLink')}</h1>

      {/* Form Section */}
      <div className={styles.formCard}>
        <h2>{t('paymentLinks.createNewTitle')}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <form onSubmit={handleCreateLink} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="objet">{t('paymentLinks.objectLabel')}</label>
            <input
              type="text"
              id="objet"
              name="objet"
              value={formData.objet}
              onChange={handleInputChange}
              placeholder={t('paymentLinks.objectPlaceholder')}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">{t('paymentLinks.descriptionLabel')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('paymentLinks.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="amount">{t('paymentLinks.amountLabel')}</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder={t('paymentLinks.amountPlaceholder')}
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* <div className={styles.formGroup}>
              <label htmlFor="network">{t('paymentLinks.networkLabel')}</label>
              <select
                id="network"
                name="network"
                value={formData.network}
                onChange={handleInputChange}
              >
                <option value="">{t('paymentLinks.selectNetwork') || 'Select a network'}</option>
                {networks.map(network => (
                  <option key={network.network_uid} value={network.network_uid}>
                    {network.network_name}
                  </option>
                ))}
              </select>
            </div> */}

            <div className={styles.formGroup}>
              <label htmlFor="expires_in_hours">{t('paymentLinks.validityLabel')}</label>
              <input
                type="number"
                id="expires_in_hours"
                name="expires_in_hours"
                value={formData.expires_in_hours}
                onChange={handleInputChange}
                min="1"
                max="8760"
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={creatingLink}
          >
            {creatingLink ? t('paymentLinks.generatingButton') : t('paymentLinks.generateButton')}
          </button>
        </form>
      </div>

      {/* Links List Section */}
      <div className={styles.listCard}>
        <h2>{t('paymentLinks.myLinks')}</h2>

        {loading ? (
          <p className={styles.loading}>{t('paymentLinks.loadingLinks')}</p>
        ) : links.length === 0 ? (
          <p className={styles.noLinks}>{t('paymentLinks.noLinks')}</p>
        ) : (
          <>
            <div className={styles.linksGrid}>
              {paginatedLinks.map(link => (
                <div key={link.uid} className={styles.linkCard}>
                  <div className={styles.linkCardHeader}>
                    <div className={styles.linkInfo}>
                      <h3 className={styles.linkObject}>{link.objet}</h3>
                      <span className={`${styles.status} ${styles[link.status.toLowerCase()]}`}>
                        {link.status_display}
                      </span>
                    </div>
                  </div>

                  <div className={styles.linkCardBody}>
                    <div className={styles.linkDetail}>
                      <span className={styles.label}>{t('paymentLinks.tableColumns.amount')}</span>
                      <span className={styles.value}>{link.amount ? `${link.amount} XOF` : 'Flexible'}</span>
                    </div>
                    
                    <div className={styles.linkDetail}>
                      <span className={styles.label}>{t('paymentLinks.tableColumns.date')}</span>
                      <span className={styles.value}>{new Date(link.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <div className={styles.linkDetail}>
                      <span className={styles.label}>{t('paymentLinks.tableColumns.url')}</span>
                      <span className={styles.urlValue} title={link.token}>{link.token.substring(0, 16)}...</span>
                    </div>

                    {link.description && (
                      <div className={styles.linkDetail}>
                        <span className={styles.label}>{t('common.description') || 'Description'}</span>
                        <span className={styles.value}>{link.description}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.linkCardQR}>
                    <QRCode
                      value={link.payment_url}
                      size={100}
                      level="H"
                      includeMargin={false}
                    />
                    <span className={styles.qrLabel}>{t('paymentLinks.qrCode')}</span>
                  </div>

                  <div className={styles.linkCardFooter}>
                    <a 
                      href={link.payment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.viewButton}
                    >
                      👁️ {t('paymentLinks.actions.view')}
                    </a>
                    <button
                      onClick={() => handleCopyLink(link.payment_url, link.uid)}
                      className={`${styles.copyButtonSmall} ${copied === link.uid ? styles.copied : ''}`}
                      title={t('paymentLinks.actions.copy')}
                    >
                      {copied === link.uid ? `✓ ${t('common.copied')}` : `📋 ${t('paymentLinks.actions.copyLink')}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  {t('paymentLinks.pagination.previous')}
                </button>
                <span className={styles.pageInfo}>
                  {t('paymentLinks.pagination.pageInfo').replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  {t('paymentLinks.pagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
