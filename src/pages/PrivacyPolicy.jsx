import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel static-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '2rem' }}>{t('privacy.title')}</h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>{t('privacy.subtitle')}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--pink-accent)', marginBottom: '0.5rem' }}>{t('privacy.h1')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('privacy.p1')}</p>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--pink-accent)', marginBottom: '0.5rem' }}>{t('privacy.h2')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('privacy.p2')}</p>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--pink-accent)', marginBottom: '0.5rem' }}>{t('privacy.h3')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('privacy.p3')}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--pink-accent)', marginBottom: '0.5rem' }}>{t('privacy.h4')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{t('privacy.p4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;