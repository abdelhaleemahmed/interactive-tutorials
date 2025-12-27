// Theme system for Linux Administration Tutorial (Light, Dark, Terminal)
(function() {
    const themeKey = 'linux-admin-theme';
    const body = document.body;
    const themes = ['light', 'dark', 'terminal'];
    let currentTheme = 'light';

    function initTheme() {
        // Load stored preference or detect system preference
        const savedTheme = localStorage.getItem(themeKey);

        if (savedTheme && themes.includes(savedTheme)) {
            currentTheme = savedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        }

        applyTheme(currentTheme);
        setupThemeSelector();
        setupLegacyToggle();
    }

    function applyTheme(theme) {
        // Remove all theme classes
        body.classList.remove('dark-mode', 'terminal-mode');

        // Apply new theme
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else if (theme === 'terminal') {
            body.classList.add('terminal-mode');
        }

        currentTheme = theme;
        localStorage.setItem(themeKey, theme);

        // Update theme selector buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(theme)) {
                btn.classList.add('active');
            }
        });

        // Update legacy toggle button if it exists
        const legacyToggle = document.getElementById('themeToggle');
        if (legacyToggle) {
            legacyToggle.innerHTML = theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '💻';
        }
    }

    function setupThemeSelector() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.classList.contains('light') ? 'light' :
                             this.classList.contains('dark') ? 'dark' : 'terminal';
                applyTheme(theme);
            });
        });
    }

    function setupLegacyToggle() {
        // Support for old single-button toggle (cycles through themes)
        const legacyToggle = document.getElementById('themeToggle');
        if (legacyToggle) {
            legacyToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const currentIndex = themes.indexOf(currentTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                applyTheme(themes[nextIndex]);
            });
        }
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem(themeKey)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
