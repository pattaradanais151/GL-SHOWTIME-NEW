import { useLanguage } from '../contexts/LanguageContext';

const License = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="glass-panel static-page">
        <h1>{t('license.title')}</h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '2rem' }}>{t('license.subtitle')}</p>

        <h2>{t('license.h1')}</h2>
        <p>{t('license.p1')}</p>

        <h2>{t('license.h2')}</h2>
        <p>{t('license.p2')}</p>

        <h2>{t('license.h3')}</h2>
        <p>{t('license.p3')}</p>

        <h2>{t('license.h4')}</h2>
        <p>{t('license.p4')}</p>
      </div>
    </div>
  );
};

export default License;