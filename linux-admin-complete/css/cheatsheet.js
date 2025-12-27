// Command Cheat Sheet Panel
(function() {
    const commands = {
        'Navigation': [
            { name: 'pwd', desc: 'Print working directory' },
            { name: 'ls', desc: 'List directory contents' },
            { name: 'ls -la', desc: 'List all files with details' },
            { name: 'cd <dir>', desc: 'Change to directory' },
            { name: 'cd ..', desc: 'Go up one level' },
            { name: 'cd ~', desc: 'Go to home directory' },
            { name: 'cd -', desc: 'Go to previous directory' }
        ],
        'File Operations': [
            { name: 'cat <file>', desc: 'Display file contents' },
            { name: 'less <file>', desc: 'View file with pagination' },
            { name: 'head <file>', desc: 'Show first 10 lines' },
            { name: 'tail <file>', desc: 'Show last 10 lines' },
            { name: 'mkdir <dir>', desc: 'Create directory' },
            { name: 'touch <file>', desc: 'Create empty file' },
            { name: 'cp <src> <dst>', desc: 'Copy file/directory' },
            { name: 'mv <src> <dst>', desc: 'Move/rename file' },
            { name: 'rm <file>', desc: 'Remove file' },
            { name: 'rm -r <dir>', desc: 'Remove directory recursively' }
        ],
        'Permissions': [
            { name: 'chmod 755 <file>', desc: 'Change file permissions' },
            { name: 'chmod +x <file>', desc: 'Make file executable' },
            { name: 'chown <user> <file>', desc: 'Change file owner' },
            { name: 'chgrp <group> <file>', desc: 'Change file group' },
            { name: 'umask', desc: 'View default permissions' }
        ],
        'System Info': [
            { name: 'whoami', desc: 'Show current username' },
            { name: 'hostname', desc: 'Show system hostname' },
            { name: 'uname -a', desc: 'Show system information' },
            { name: 'df -h', desc: 'Show disk space usage' },
            { name: 'du -sh <dir>', desc: 'Show directory size' },
            { name: 'free -h', desc: 'Show memory usage' },
            { name: 'uptime', desc: 'Show system uptime' }
        ],
        'Process Management': [
            { name: 'ps aux', desc: 'List all processes' },
            { name: 'top', desc: 'Monitor processes live' },
            { name: 'htop', desc: 'Interactive process viewer' },
            { name: 'kill <pid>', desc: 'Kill process by ID' },
            { name: 'killall <name>', desc: 'Kill processes by name' },
            { name: 'bg', desc: 'Resume job in background' },
            { name: 'fg', desc: 'Bring job to foreground' }
        ],
        'Package Management': [
            { name: 'apt update', desc: 'Update package list (Debian/Ubuntu)' },
            { name: 'apt install <pkg>', desc: 'Install package' },
            { name: 'apt remove <pkg>', desc: 'Remove package' },
            { name: 'yum install <pkg>', desc: 'Install package (RHEL/CentOS)' },
            { name: 'dnf install <pkg>', desc: 'Install package (Fedora)' }
        ]
    };

    function createCheatSheet() {
        const panel = document.createElement('div');
        panel.className = 'cheatsheet-panel';
        panel.id = 'cheatsheetPanel';

        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'cheatsheet-panel-content';

        // Toggle button
        const toggle = document.createElement('div');
        toggle.className = 'cheatsheet-toggle';
        toggle.innerHTML = '📖 Command Cheat Sheet';
        toggle.addEventListener('click', togglePanel);
        panel.appendChild(toggle);

        // Header
        const header = document.createElement('div');
        header.className = 'cheatsheet-header';
        header.innerHTML = `
            <h3>📖 Linux Command Reference</h3>
        `;
        contentWrapper.appendChild(header);

        // Search bar
        const searchBar = document.createElement('div');
        searchBar.className = 'cheatsheet-search';
        searchBar.innerHTML = `
            <input type="text" id="cheatsheetSearch" placeholder="🔍 Search commands... (e.g., 'file', 'chmod', 'process')" />
            <button class="search-clear" id="searchClear" style="display: none;">×</button>
        `;
        contentWrapper.appendChild(searchBar);

        // Content
        const content = document.createElement('div');
        content.className = 'cheatsheet-content';

        Object.keys(commands).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'cheatsheet-category';

            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = category;
            categoryDiv.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'commands-grid';

            commands[category].forEach(cmd => {
                const item = document.createElement('div');
                item.className = 'command-item';
                item.innerHTML = `
                    <div class="command-name">${cmd.name}</div>
                    <div class="command-desc">${cmd.desc}</div>
                `;
                grid.appendChild(item);
            });

            categoryDiv.appendChild(grid);
            content.appendChild(categoryDiv);
        });

        contentWrapper.appendChild(content);

        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'cheatsheet-resize-handle';
        contentWrapper.appendChild(resizeHandle);

        panel.appendChild(contentWrapper);
        document.body.appendChild(panel);

        // Setup resize functionality
        setupResize(resizeHandle, panel);

        // Setup search functionality
        setupSearch();
    }

    function setupResize(resizeHandle, panel) {
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;

        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startY = e.clientY;
            startHeight = panel.offsetHeight;

            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ns-resize';

            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;

            const deltaY = e.clientY - startY;
            const newHeight = startHeight + deltaY;

            // Apply constraints
            const minHeight = 200;
            const maxHeight = window.innerHeight * 0.8;

            if (newHeight >= minHeight && newHeight <= maxHeight) {
                panel.style.height = newHeight + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
            }
        });
    }

    function setupSearch() {
        const searchInput = document.getElementById('cheatsheetSearch');
        const searchClear = document.getElementById('searchClear');

        if (!searchInput) return;

        // Search input handler
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();

            // Show/hide clear button
            searchClear.style.display = query ? 'block' : 'none';

            filterCommands(query);
        });

        // Clear button handler
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchClear.style.display = 'none';
            filterCommands('');
            searchInput.focus();
        });

        // Focus search when panel opens
        const panel = document.getElementById('cheatsheetPanel');
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.classList.contains('active')) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            });
        });

        if (panel) {
            observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
        }
    }

    function filterCommands(query) {
        const categories = document.querySelectorAll('.cheatsheet-category');
        let totalVisible = 0;

        categories.forEach(category => {
            const items = category.querySelectorAll('.command-item');
            let visibleInCategory = 0;

            items.forEach(item => {
                const commandName = item.querySelector('.command-name').textContent.toLowerCase();
                const commandDesc = item.querySelector('.command-desc').textContent.toLowerCase();

                // Check if query matches command name or description
                const matches = !query ||
                               commandName.includes(query) ||
                               commandDesc.includes(query);

                if (matches) {
                    item.style.display = '';
                    visibleInCategory++;
                    totalVisible++;

                    // Highlight matching text
                    if (query) {
                        highlightText(item.querySelector('.command-name'), query);
                        highlightText(item.querySelector('.command-desc'), query);
                    } else {
                        removeHighlight(item.querySelector('.command-name'));
                        removeHighlight(item.querySelector('.command-desc'));
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            // Hide category if no visible items
            category.style.display = visibleInCategory > 0 ? '' : 'none';
        });

        // Show "no results" message if needed
        showNoResultsMessage(totalVisible === 0 && query !== '');
    }

    function highlightText(element, query) {
        const text = element.getAttribute('data-original-text') || element.textContent;
        if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', text);
        }

        const regex = new RegExp(`(${query})`, 'gi');
        const highlighted = text.replace(regex, '<mark>$1</mark>');
        element.innerHTML = highlighted;
    }

    function removeHighlight(element) {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
        }
    }

    function showNoResultsMessage(show) {
        let message = document.getElementById('noResultsMessage');

        if (show) {
            if (!message) {
                message = document.createElement('div');
                message.id = 'noResultsMessage';
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">No commands found</div>
                    <div class="no-results-hint">Try different keywords like 'file', 'user', or 'process'</div>
                `;
                const content = document.querySelector('.cheatsheet-content');
                if (content) content.appendChild(message);
            }
            message.style.display = 'block';
        } else if (message) {
            message.style.display = 'none';
        }
    }

    function togglePanel() {
        const panel = document.getElementById('cheatsheetPanel');
        if (panel) {
            const isActive = panel.classList.contains('active');

            if (isActive) {
                // Closing: move panel up by its full height
                const panelHeight = panel.offsetHeight;
                panel.style.top = `-${panelHeight}px`;
                panel.classList.remove('active');
            } else {
                // Opening: move panel to top
                panel.style.top = '0px';
                panel.classList.add('active');
            }
        }
    }

    // Keyboard shortcut - Press 'C' to toggle cheat sheet
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'c' || e.key === 'C') && !isTypingInInput()) {
            togglePanel();
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
        document.addEventListener('DOMContentLoaded', createCheatSheet);
    } else {
        createCheatSheet();
    }
})();
