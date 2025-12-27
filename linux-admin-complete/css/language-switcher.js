// Language Switcher
// Handles switching between different language versions of the tutorial

(function() {
    'use strict';

    // Available languages (expand this as more languages are added)
    const languages = {
        en: { code: 'en', name: 'English', dir: 'ltr' },
        // ar: { code: 'ar', name: 'العربية', dir: 'rtl' }, // Future: Arabic
        // es: { code: 'es', name: 'Español', dir: 'ltr' }, // Future: Spanish
        // fr: { code: 'fr', name: 'Français', dir: 'ltr' }, // Future: French
    };

    function getCurrentLanguage() {
        // Detect current language from URL path
        const path = window.location.pathname;
        const match = path.match(/\/([a-z]{2})\//);
        return match ? match[1] : 'en';
    }

    function getCurrentPage() {
        // Get current page filename (e.g., 'index.html', 'basic-commands.html')
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'index.html';
    }

    function switchLanguage(newLang) {
        const currentLang = getCurrentLanguage();

        if (currentLang === newLang) {
            return; // Already on this language
        }

        // Get current page
        const currentPage = getCurrentPage();

        // Build new URL by replacing language code
        const path = window.location.pathname;
        const newPath = path.replace(`/${currentLang}/`, `/${newLang}/`);

        // Navigate to new language version
        window.location.href = newPath;
    }

    function initLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        const currentLang = getCurrentLanguage();

        // Set active state based on current language
        langButtons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');

            if (btnLang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }

            // Add click handler
            btn.addEventListener('click', function() {
                switchLanguage(btnLang);
            });
        });

        // Set document direction based on language
        const langConfig = languages[currentLang];
        if (langConfig) {
            document.documentElement.setAttribute('dir', langConfig.dir);
            document.documentElement.setAttribute('lang', langConfig.code);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSelector);
    } else {
        initLanguageSelector();
    }
})();
