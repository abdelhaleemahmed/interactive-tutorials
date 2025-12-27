// Keyboard Shortcuts Panel
(function() {
    const shortcuts = [
        {
            section: "Navigation",
            items: [
                { description: "Next module", keys: ["→"] },
                { description: "Previous module", keys: ["←"] },
                { description: "Scroll down", keys: ["↓", "or", "J"] },
                { description: "Scroll up", keys: ["↑", "or", "K"] },
                { description: "Back to home", keys: ["H"] }
            ]
        },
        {
            section: "Interface",
            items: [
                { description: "Toggle theme", keys: ["T"] },
                { description: "Toggle shortcuts", keys: ["?"] },
                { description: "Focus search", keys: ["/"] },
                { description: "Escape/Close", keys: ["Esc"] }
            ]
        },
        {
            section: "Terminal",
            items: [
                { description: "Open terminal", keys: ["Ctrl", "+", "`"] },
                { description: "Clear terminal", keys: ["Ctrl", "+", "L"] },
                { description: "Command history", keys: ["↑", "↓"] },
                { description: "Auto-complete", keys: ["Tab"] }
            ]
        },
        {
            section: "Learning",
            items: [
                { description: "Copy code example", keys: ["C"] },
                { description: "Run example", keys: ["Enter"] },
                { description: "Toggle hints", keys: ["Shift", "+", "H"] },
                { description: "Mark as complete", keys: ["Ctrl", "+", "M"] }
            ]
        }
    ];

    function createShortcutsPanel() {
        console.log('Creating shortcuts panel...');
        const panel = document.createElement('div');
        panel.className = 'shortcuts-panel';
        panel.id = 'shortcutsPanel';
        console.log('Panel element created:', panel);

        // Toggle button
        const toggle = document.createElement('div');
        toggle.className = 'shortcuts-toggle';
        toggle.textContent = 'SHORTCUTS';
        toggle.addEventListener('click', togglePanel);
        panel.appendChild(toggle);

        // Header
        const header = document.createElement('div');
        header.className = 'shortcuts-header';
        header.innerHTML = `
            <h3>⌨️ Keyboard Shortcuts</h3>
            <p class="shortcuts-description">Use these shortcuts to navigate faster</p>
        `;
        panel.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'shortcuts-content';

        shortcuts.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'shortcuts-section';

            const title = document.createElement('div');
            title.className = 'shortcuts-section-title';
            title.textContent = section.section;
            sectionDiv.appendChild(title);

            section.items.forEach(item => {
                const shortcutItem = document.createElement('div');
                shortcutItem.className = 'shortcut-item';

                const description = document.createElement('div');
                description.className = 'shortcut-description';
                description.textContent = item.description;

                const keys = document.createElement('div');
                keys.className = 'shortcut-keys';

                item.keys.forEach(key => {
                    if (key === '+' || key === 'or') {
                        const separator = document.createElement('span');
                        separator.className = 'key-separator';
                        separator.textContent = key;
                        keys.appendChild(separator);
                    } else {
                        const keyElem = document.createElement('kbd');
                        keyElem.className = 'key';
                        keyElem.textContent = key;
                        keys.appendChild(keyElem);
                    }
                });

                shortcutItem.appendChild(description);
                shortcutItem.appendChild(keys);
                sectionDiv.appendChild(shortcutItem);
            });

            content.appendChild(sectionDiv);
        });

        panel.appendChild(content);
        document.body.appendChild(panel);
        console.log('Shortcuts panel added to body. Check element:', document.getElementById('shortcutsPanel'));
    }

    function togglePanel() {
        const panel = document.getElementById('shortcutsPanel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    // Keyboard event listener
    document.addEventListener('keydown', function(e) {
        // Toggle shortcuts panel with '?'
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            togglePanel();
            return;
        }

        // Close panel with Escape
        if (e.key === 'Escape') {
            const panel = document.getElementById('shortcutsPanel');
            if (panel && panel.classList.contains('active')) {
                panel.classList.remove('active');
                return;
            }
        }

        // Toggle theme with 'T'
        if (e.key === 't' || e.key === 'T') {
            if (!isTypingInInput()) {
                const themeButtons = document.querySelectorAll('.theme-btn');
                if (themeButtons.length > 0) {
                    // Cycle through themes
                    const activeBtn = document.querySelector('.theme-btn.active');
                    const currentIndex = Array.from(themeButtons).indexOf(activeBtn);
                    const nextIndex = (currentIndex + 1) % themeButtons.length;
                    themeButtons[nextIndex].click();
                }
            }
        }

        // Navigate with arrow keys (only when not typing)
        if (!isTypingInInput()) {
            if (e.key === 'ArrowDown' || e.key === 'j') {
                e.preventDefault();
                window.scrollBy({ top: 100, behavior: 'smooth' });
            }
            if (e.key === 'ArrowUp' || e.key === 'k') {
                e.preventDefault();
                window.scrollBy({ top: -100, behavior: 'smooth' });
            }
            if (e.key === 'h' || e.key === 'H') {
                // Go to home
                const homeLink = document.querySelector('a[href="./index.html"], a[href="index.html"]');
                if (homeLink && window.location.pathname !== '/index.html') {
                    window.location.href = './index.html';
                }
            }
        }
    });

    function isTypingInInput() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createShortcutsPanel);
    } else {
        createShortcutsPanel();
    }
})();
