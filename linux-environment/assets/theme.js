// Dark mode theme toggle
(function() {
    const darkModeKey = 'linux-env-dark-mode';
    const body = document.body;
    const toggleBtn = document.getElementById('themeToggle');

    function initTheme() {
        // Load stored preference
        const savedMode = localStorage.getItem(darkModeKey);
        if (savedMode === 'true') {
            body.classList.add('dark-mode');
            if (toggleBtn) toggleBtn.innerHTML = '☀️';
        } else {
            if (toggleBtn) toggleBtn.innerHTML = '🌙';
        }

        // Add click event listener
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                body.classList.toggle('dark-mode');
                toggleBtn.innerHTML = body.classList.contains('dark-mode') ? '☀️' : '🌙';
                localStorage.setItem(darkModeKey, body.classList.contains('dark-mode'));
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
