import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="glass-panel static-page">
        <h1>{t('privacy.title')}</h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '2rem' }}>{t('privacy.subtitle')}</p>
        
        <h2>{t('privacy.h1')}</h2>
        <p>{t('privacy.p1')}</p>
        
        <h2>{t('privacy.h2')}</h2>
        <p>{t('privacy.p2')}</p>
        
        <h2>{t('privacy.h3')}</h2>
        <p>{t('privacy.p3')}</p>

        <h2>{t('privacy.h4')}</h2>
        <p>{t('privacy.p4')}</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;