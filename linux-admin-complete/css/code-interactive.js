// Interactive Code Examples - Copy and Run functionality
(function() {
    function enhanceCodeBlocks() {
        // Skip enhancement on system-admin page (will use ASCIImania demos instead)
        if (window.location.pathname.includes('system-admin.html')) {
            return;
        }

        // Find all code blocks
        const codeBlocks = document.querySelectorAll('pre code, .command-example pre code');

        codeBlocks.forEach((codeBlock, index) => {
            const pre = codeBlock.closest('pre');
            if (!pre || pre.classList.contains('enhanced')) return;

            // Skip code blocks inside info/warning/tip/note boxes (conceptual explanations, not executable)
            if (pre.closest('.info-box, .warning-box, .tip-box, .note-box')) return;

            // Skip code blocks that are "Expected Output" examples
            // Check if the previous sibling contains "Expected Output:" or Arabic equivalent
            const prevElement = pre.previousElementSibling;
            if (prevElement && (prevElement.textContent.includes('Expected Output:') ||
                                prevElement.textContent.includes('الناتج المتوقع:'))) {
                return; // This is output, not a command
            }

            pre.classList.add('enhanced');
            const parent = pre.parentElement;
            parent.classList.add('code-example-interactive');

            // Store original code text before adding buttons
            const originalCode = codeBlock.textContent.trim();
            codeBlock.setAttribute('data-original-code', originalCode);

            // Create actions container
            const actions = document.createElement('div');
            actions.className = 'code-actions';

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-btn copy-btn';
            copyBtn.innerHTML = '📋 Copy';
            copyBtn.setAttribute('data-code-index', index);
            copyBtn.addEventListener('click', () => copyCode(codeBlock, copyBtn));
            actions.appendChild(copyBtn);

            // Run button (only if terminal exists)
            if (document.getElementById('terminalToggleBtn')) {
                const runBtn = document.createElement('button');
                runBtn.className = 'code-btn run-btn';
                runBtn.innerHTML = '▶️ Run';
                runBtn.addEventListener('click', () => runInTerminal(codeBlock));
                actions.appendChild(runBtn);
            }

            pre.appendChild(actions);
        });

        // Create notification element if it doesn't exist
        if (!document.getElementById('copyNotification')) {
            const notification = document.createElement('div');
            notification.id = 'copyNotification';
            notification.className = 'copy-notification';
            document.body.appendChild(notification);
        }
    }

    function copyCode(codeBlock, button) {
        // Get the original code stored before buttons were added
        const code = codeBlock.getAttribute('data-original-code') || codeBlock.textContent.trim();

        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            // Show success feedback
            button.classList.add('copied');
            button.textContent = 'Copied!';

            // Show notification
            showNotification('Code copied to clipboard!');

            // Reset button after 2 seconds
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '📋 Copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy code', true);
        });
    }

    function runInTerminal(codeBlock) {
        // Get the original code stored before buttons were added
        let code = codeBlock.getAttribute('data-original-code') || codeBlock.textContent.trim();

        // Filter out comment lines (lines starting with #) and empty lines
        const lines = code.split('\n');
        const executableLines = lines.filter(line => {
            const trimmed = line.trim();
            // Keep line if it's not empty and doesn't start with #
            return trimmed.length > 0 && !trimmed.startsWith('#');
        });
        code = executableLines.join('\n');

        // If no executable commands remain, show error
        if (!code.trim()) {
            showNotification('No executable commands found (only comments)', true);
            return;
        }

        // Get terminal elements
        const terminalToggle = document.getElementById('terminalToggleBtn');
        const terminalModal = document.getElementById('terminalModal');

        if (terminalModal) {
            // Check current state - terminal uses 'open' class
            const isCurrentlyOpen = terminalModal.classList.contains('open');

            // Open terminal only if it's currently closed
            if (!isCurrentlyOpen && terminalToggle) {
                // Click the toggle button to properly open and initialize terminal
                terminalToggle.click();
            }

            // Wait for terminal to be fully ready
            // Use longer delay if terminal was just opened
            const delay = isCurrentlyOpen ? 100 : 1500;

            setTimeout(() => {
                // Try to get the terminal instance and execute command
                const term = window.terminalInstance || window.term;
                if (term && term._core) {
                    term.focus();

                    // Get the shell handler if available
                    const shell = window.shell;

                    if (shell && typeof shell.executeCommand === 'function') {
                        // Use the shell's executeCommand method
                        shell.executeCommand(code);
                        showNotification(`Executed: ${code}`);
                    } else {
                        // Fallback: simulate keyboard input character by character
                        let charIndex = 0;
                        const typeInterval = setInterval(() => {
                            if (charIndex < code.length) {
                                const char = code[charIndex];
                                // Simulate actual keyboard input
                                term.paste(char);
                                charIndex++;
                            } else {
                                clearInterval(typeInterval);
                                // Send Enter after a brief delay
                                setTimeout(() => {
                                    term.paste('\n');
                                    showNotification(`Command sent: ${code}`);
                                }, 100);
                            }
                        }, 30);
                    }
                } else {
                    showNotification('Terminal not ready. Please try again.', true);
                }
            }, delay);
        } else {
            showNotification('Terminal not available on this page', true);
        }
    }

    function showNotification(message, isError = false) {
        const notification = document.getElementById('copyNotification');
        if (!notification) return;

        notification.textContent = message;
        notification.style.background = isError ? '#ff6b6b' : '#4ecdc4';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);
    } else {
        enhanceCodeBlocks();
    }
})();
