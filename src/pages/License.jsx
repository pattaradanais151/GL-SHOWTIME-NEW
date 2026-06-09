import { useLanguage } from '../contexts/LanguageContext';

const License = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel static-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '2rem' }}>{t('license.title')}</h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>{t('license.subtitle')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#4db8ff', marginBottom: '0.5rem' }}>{t('license.h1')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('license.p1')}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#4db8ff', marginBottom: '0.5rem' }}>{t('license.h2')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('license.p2')}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#4db8ff', marginBottom: '0.5rem' }}>{t('license.h3')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('license.p3')}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#4db8ff', marginBottom: '0.5rem' }}>{t('license.h4')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('license.p4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default License;