import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import './Settings.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export function Settings() {
    const { t, i18n } = useTranslation();
    const { language, soundEnabled, hapticEnabled, updateLanguage, toggleSound, toggleHaptic } =
        useSettingsStore();

    const handleLanguageChange = (lang: string) => {
        updateLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="page container settings-page animate-fadeIn">
            <h1>{t('settings.title')}</h1>

            {/* Language */}
            <section className="settings-section">
                <label className="settings-label">{t('settings.language')}</label>
                <div className="settings-lang-grid">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`btn ${language === lang.code ? 'btn-primary' : 'btn-secondary'} settings-lang-btn`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Sound */}
            <section className="settings-section">
                <div className="settings-toggle-row">
                    <div>
                        <span className="settings-label">{t('settings.sound')}</span>
                    </div>
                    <button
                        className={`toggle-switch ${soundEnabled ? 'on' : ''}`}
                        onClick={toggleSound}
                        role="switch"
                        aria-checked={soundEnabled}
                    >
                        <span className="toggle-knob" />
                    </button>
                </div>
            </section>

            {/* Haptic */}
            <section className="settings-section">
                <div className="settings-toggle-row">
                    <div>
                        <span className="settings-label">{t('settings.haptic')}</span>
                    </div>
                    <button
                        className={`toggle-switch ${hapticEnabled ? 'on' : ''}`}
                        onClick={toggleHaptic}
                        role="switch"
                        aria-checked={hapticEnabled}
                    >
                        <span className="toggle-knob" />
                    </button>
                </div>
            </section>

            {/* About */}
            <section className="settings-section settings-about">
                <div className="settings-about-content">
                    <div className="settings-logo">
                        <span className="text-accent" style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-extrabold)' }}>
                            Niama Padel
                        </span>
                    </div>
                    <p className="text-tertiary" style={{ fontSize: 'var(--fs-sm)' }}>
                        {t('settings.version')} 1.0.0
                    </p>
                    <p className="text-tertiary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
                        {t('app.tagline')}
                    </p>
                </div>
            </section>
        </div>
    );
}
