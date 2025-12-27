// Shared Terminal Modal - Works across all tutorial pages
(function() {
    // Only initialize once
    if (window.terminalModalInitialized) return;
    window.terminalModalInitialized = true;

    // Wait for DOM and required scripts to load
    function initTerminalModal() {
        // Check if required libraries are loaded
        if (typeof Terminal === 'undefined' || typeof FitAddon === 'undefined') {
            console.error('Terminal libraries not loaded yet');
            return;
        }

        // Create modal HTML structure
        const modalHTML = `
            <div class="terminal-modal" id="terminalModal">
                <div class="terminal-resize-handle" id="terminalResizeHandle"></div>
                <div class="terminal-modal-header">
                    <h3>💻 Interactive Terminal</h3>
                    <button class="terminal-modal-close" id="terminalModalClose" title="Close terminal">✕</button>
                </div>
                <div class="terminal-modal-body">
                    <div class="terminal-wrapper">
                        <div id="terminal"></div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get elements
        const modal = document.getElementById('terminalModal');
        const toggleBtn = document.getElementById('terminalToggleBtn');
        const closeBtn = document.getElementById('terminalModalClose');
        const resizeHandle = document.getElementById('terminalResizeHandle');

        // Resize functionality
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = modal.offsetHeight;
            document.body.style.userSelect = 'none';
            modal.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const deltaY = startY - e.clientY;
            const newHeight = startHeight + deltaY;
            const minHeight = 200;
            const maxHeight = window.innerHeight * 0.9;

            if (newHeight >= minHeight && newHeight <= maxHeight) {
                modal.style.height = newHeight + 'px';

                // Refit terminal after resize
                if (window.terminalFitAddon && window.terminalInstance) {
                    window.terminalFitAddon.fit();
                    // Scroll to bottom to keep prompt visible
                    window.terminalInstance.scrollToBottom();
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                modal.style.transition = '';

                // Final fit and scroll after resize complete
                if (window.terminalFitAddon && window.terminalInstance) {
                    setTimeout(() => {
                        window.terminalFitAddon.fit();
                        window.terminalInstance.scrollToBottom();
                    }, 50);
                }

                // Save height to localStorage
                localStorage.setItem('terminal-modal-height', modal.style.height);
            }
        });

        // Toggle terminal modal
        function toggleTerminal() {
            const isOpen = modal.classList.contains('open');
            if (isOpen) {
                modal.classList.remove('open');
                toggleBtn.classList.remove('active');
                toggleBtn.innerHTML = '💻';
                toggleBtn.title = 'Open terminal';
                localStorage.setItem('terminal-modal-open', 'false');
            } else {
                modal.classList.add('open');
                toggleBtn.classList.add('active');
                toggleBtn.innerHTML = '✕';
                toggleBtn.title = 'Close terminal';
                localStorage.setItem('terminal-modal-open', 'true');

                // Initialize terminal if not already done
                if (!window.terminalInstance) {
                    initTerminal();
                } else {
                    // Fit terminal to new size
                    if (window.terminalFitAddon) {
                        setTimeout(() => window.terminalFitAddon.fit(), 100);
                    }
                }
            }
        }

        // Event listeners
        toggleBtn.addEventListener('click', toggleTerminal);
        closeBtn.addEventListener('click', toggleTerminal);

        // Restore previous height
        const savedHeight = localStorage.getItem('terminal-modal-height');
        if (savedHeight) {
            modal.style.height = savedHeight;
        }

        // Restore previous state
        const wasOpen = localStorage.getItem('terminal-modal-open') === 'true';
        if (wasOpen) {
            toggleTerminal();
        }

        // Initialize terminal
        function initTerminal() {
            const terminalContainer = document.getElementById('terminal');

            const term = new Terminal({
                cursorBlink: true,
                convertEol: true,
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: 14,
                scrollback: 1000,
                theme: {
                    background: '#1e1e1e',
                    foreground: '#abb2bf',
                    cursor: '#abb2bf',
                    selection: 'rgba(128, 128, 128, 0.4)',
                    black: '#21252b',
                    red: '#e06c75',
                    green: '#98c379',
                    yellow: '#e5c07b',
                    blue: '#61afef',
                    magenta: '#c678dd',
                    cyan: '#56b6c2',
                    white: '#abb2bf',
                    brightBlack: '#5c6370',
                    brightRed: '#e06c75',
                    brightGreen: '#98c379',
                    brightYellow: '#e5c07b',
                    brightBlue: '#61afef',
                    brightMagenta: '#c678dd',
                    brightCyan: '#56b6c2',
                    brightWhite: '#ffffff'
                }
            });

            const fitAddon = new FitAddon.FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalContainer);
            fitAddon.fit();

            // Store globally for reuse
            window.terminalInstance = term;
            window.terminalFitAddon = fitAddon;

            // Refit on window resize
            window.addEventListener('resize', () => {
                if (modal.classList.contains('open')) {
                    fitAddon.fit();
                }
            });

            // Refit when modal opens
            const observer = new MutationObserver(() => {
                if (modal.classList.contains('open')) {
                    setTimeout(() => fitAddon.fit(), 100);
                }
            });
            observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

            // Import and initialize command handlers
            import('../js/commandRegistry.js').then(({ commandHandlers }) => {
                return import('../js/terminalUtils.js').then(utils => {
                    return import('../js/shellParser.js').then(({ ShellParser, handleOutputRedirection }) => {
                        return import('../js/commandSuggestions.js').then(suggestions => {
                            return import('../js/commandHistory.js').then(({ CommandHistory }) => {
                                return import('../js/progressTracking.js').then(({ getProgressTracker }) => {
                                    const historyManager = new CommandHistory();
                                    const progressTracker = getProgressTracker();

                                    // Track page visit on terminal open
                                    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
                                    progressTracker.visitPage(currentPage);

                                    setupTerminalHandlers(term, commandHandlers(term, historyManager), utils, new ShellParser(), suggestions, historyManager, progressTracker, handleOutputRedirection);
                                });
                            });
                        });
                    });
                });
            }).catch(err => {
                console.error('Failed to load terminal modules:', err);
                term.write('Error: Could not load terminal command handlers.\r\n');
                term.write('Some terminal features may not work correctly.\r\n\r\n');
            });
        }

        function setupTerminalHandlers(term, handlers, utils, parser, suggestions, historyManager, progressTracker, handleOutputRedirection) {
            let currentCommand = '';
            let cursorPos = 0;

            function handleCommand(command) {
                let output = '';

                // Track command execution for progress
                if (command && command.trim() && progressTracker) {
                    try {
                        progressTracker.incrementCommandCount();
                    } catch (e) {
                        // Silently fail
                    }
                }

                // Handle empty command
                if (!command || command.trim() === '') {
                    return;
                }

                // Strip comments (# not inside quotes)
                let commentIndex = -1;
                let inSingleQuote = false;
                let inDoubleQuote = false;
                for (let i = 0; i < command.length; i++) {
                    const char = command[i];
                    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
                    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
                    else if (char === '#' && !inSingleQuote && !inDoubleQuote) {
                        commentIndex = i;
                        break;
                    }
                }
                if (commentIndex !== -1) {
                    command = command.substring(0, commentIndex).trim();
                }

                // Skip empty commands after comment removal
                if (!command) {
                    return;
                }

                // Check for background execution (&)
                let isBackground = false;
                let trimmedCommand = command.trim();
                if (trimmedCommand.endsWith('&')) {
                    isBackground = true;
                    trimmedCommand = trimmedCommand.slice(0, -1).trim();
                }

                if (parser.needsShellParsing(trimmedCommand)) {
                    output = handlePipedCommand(trimmedCommand);
                } else {
                    const parts = trimmedCommand.split(/\s+/).filter(p => p.length > 0);
                    const cmd = parts[0];
                    let args = parts.slice(1);

                    // Double-check cmd is not undefined
                    if (!cmd) {
                        return;
                    }

                    // Check if this is a script execution (./script or /path/to/script)
                    if (cmd.startsWith('./') || cmd.startsWith('/')) {
                        // Import and execute script
                        import('../js/commands/executeScript.js').then(({ executeScript }) => {
                            output = executeScript(cmd, handlers);
                            if (output) {
                                term.write(output + '\r\n');
                            }
                            utils.writePrompt(term);
                        }).catch(err => {
                            term.write(`bash: ${cmd}: command not found\r\n`);
                            utils.writePrompt(term);
                        });
                        return;
                    }

                    // Expand wildcards in arguments (e.g., *.txt -> file1.txt file2.txt)
                    if (utils.expandWildcards) {
                        args = utils.expandWildcards(args);
                    }

                    const handler = handlers[cmd];

                    if (handler) {
                        // Pass isBackground flag to handler
                        const result = handler(args, isBackground);

                        // Check if result is a background job object
                        if (result && typeof result === 'object' && result.type === 'background') {
                            // Display job start notification
                            output = `[${result.jobId}] ${result.pid}`;
                        } else {
                            output = result;
                        }
                    } else {
                        output = suggestions.getCommandNotFoundMessage(cmd, handlers);
                    }
                }

                if (output) {
                    term.write(output + '\r\n');
                }

                // Scroll to bottom after command output
                term.scrollToBottom();
            }

            function handlePipedCommand(commandLine) {
                const parsed = parser.parse(commandLine);
                const { commands, redirections } = parsed;
                let output = '';

                for (let i = 0; i < commands.length; i++) {
                    const cmd = commands[i];
                    const handler = handlers[cmd.name];

                    if (!handler) {
                        return `bash: ${cmd.name}: command not found`;
                    }

                    try {
                        if (i === 0) {
                            output = handler(cmd.args);
                        } else {
                            output = executePipeStep(handler, cmd, output);
                        }
                    } catch (error) {
                        return `Error executing ${cmd.name}: ${error.message}`;
                    }
                }

                // Handle output redirection (> or >>)
                if (redirections.output || redirections.append) {
                    return handleOutputRedirection(output, redirections, utils);
                }

                return output;
            }

            function executePipeStep(handler, cmd, pipeInput) {
                const cmdName = cmd.name;
                const pipeableCommands = ['grep', 'sort', 'uniq', 'wc', 'head', 'tail'];

                if (pipeableCommands.includes(cmdName)) {
                    const lines = pipeInput.split('\n').filter(l => l.trim());

                    if (cmdName === 'grep') {
                        const pattern = cmd.args[0];
                        return lines.filter(l => l.includes(pattern)).join('\r\n');
                    } else if (cmdName === 'sort') {
                        const reverse = cmd.args.includes('-r');
                        let sorted = [...lines];
                        sorted.sort((a, b) => reverse ? b.localeCompare(a) : a.localeCompare(b));
                        return sorted.join('\r\n');
                    } else if (cmdName === 'wc') {
                        return lines.length.toString().padStart(7);
                    } else if (cmdName === 'head') {
                        // Parse line count from args (-10 or -n 10)
                        let lineCount = 10;
                        for (let i = 0; i < cmd.args.length; i++) {
                            if (/^-\d+$/.test(cmd.args[i])) {
                                lineCount = parseInt(cmd.args[i].substring(1), 10);
                            } else if (cmd.args[i] === '-n' && i + 1 < cmd.args.length) {
                                lineCount = parseInt(cmd.args[i + 1], 10);
                            }
                        }
                        return lines.slice(0, lineCount).join('\r\n');
                    } else if (cmdName === 'tail') {
                        // Parse line count from args (-10 or -n 10)
                        let lineCount = 10;
                        for (let i = 0; i < cmd.args.length; i++) {
                            if (/^-\d+$/.test(cmd.args[i])) {
                                lineCount = parseInt(cmd.args[i].substring(1), 10);
                            } else if (cmd.args[i] === '-n' && i + 1 < cmd.args.length) {
                                lineCount = parseInt(cmd.args[i + 1], 10);
                            }
                        }
                        return lines.slice(-lineCount).join('\r\n');
                    }
                }

                return handler(cmd.args);
            }

            function redrawLine() {
                term.write('\x1B[2K\r');
                utils.writePrompt(term);
                term.write(currentCommand);
                const charsAfterCursor = currentCommand.length - cursorPos;
                if (charsAfterCursor > 0) {
                    term.write(`\x1B[${charsAfterCursor}D`);
                }
                // Scroll to bottom to keep prompt visible
                term.scrollToBottom();
            }

            term.onData(e => {
                const charCode = e.charCodeAt(0);

                if (e === '\r') {
                    term.write('\r\n');
                    let commandToExecute = currentCommand.trim();

                    if (commandToExecute.length > 0) {
                        // Try to expand history shortcuts (!, !!, !n, !-n, !prefix)
                        const expanded = historyManager.expand(commandToExecute);

                        if (expanded === null) {
                            // Expansion failed
                            term.write(`bash: ${commandToExecute}: event not found\r\n`);
                            currentCommand = '';
                            cursorPos = 0;
                            utils.writePrompt(term);
                            term.scrollToBottom();
                            return;
                        }

                        commandToExecute = expanded;

                        // Show expanded command if it was changed
                        if (expanded !== currentCommand.trim()) {
                            term.write(`\x1B[2m${commandToExecute}\x1B[0m\r\n`);
                        }

                        // Add to history
                        historyManager.add(commandToExecute);
                    }

                    handleCommand(commandToExecute);
                    currentCommand = '';
                    cursorPos = 0;
                    utils.writePrompt(term);
                    term.scrollToBottom();
                } else if (e === '\x7F') {
                    if (cursorPos > 0) {
                        currentCommand = currentCommand.slice(0, cursorPos - 1) + currentCommand.slice(cursorPos);
                        cursorPos--;
                        redrawLine();
                    }
                } else if (e === '\x1B[A') {
                    // Arrow up - previous command
                    const prev = historyManager.getPrevious();
                    if (prev !== null) {
                        currentCommand = prev;
                        cursorPos = currentCommand.length;
                        redrawLine();
                    }
                } else if (e === '\x1B[B') {
                    // Arrow down - next command
                    const next = historyManager.getNext();
                    if (next !== null) {
                        currentCommand = next;
                        cursorPos = currentCommand.length;
                        redrawLine();
                    }
                } else if (e === '\x1B[C') {
                    if (cursorPos < currentCommand.length) {
                        cursorPos++;
                        term.write('\x1B[C');
                    }
                } else if (e === '\x1B[D') {
                    if (cursorPos > 0) {
                        cursorPos--;
                        term.write('\x1B[D');
                    }
                } else if (e === '\t') {
                    const commandParts = currentCommand.trim().split(/\s+/);
                    const isFirstWord = commandParts.length === 1 && !currentCommand.includes(' ');
                    const lastPart = commandParts[commandParts.length - 1] || '';

                    let matches = [];

                    if (isFirstWord) {
                        // Complete command names
                        const availableCommands = Object.keys(handlers);
                        matches = availableCommands.filter(cmd => cmd.startsWith(lastPart));
                    } else {
                        // Complete file/directory names
                        const currentDir = utils.getCurrentDir();
                        if (!currentDir || !currentDir.children) return;
                        const itemsInDir = Object.keys(currentDir.children);
                        matches = itemsInDir.filter(item => item.startsWith(lastPart));
                    }

                    if (matches.length === 1) {
                        const completion = matches[0].substring(lastPart.length);
                        term.write(completion);
                        currentCommand += completion;
                        cursorPos = currentCommand.length;

                        // Add trailing slash for directories
                        if (!isFirstWord) {
                            const currentDir = utils.getCurrentDir();
                            if (currentDir && currentDir.children && currentDir.children[matches[0]]?.type === 'directory') {
                                term.write('/');
                                currentCommand += '/';
                                cursorPos = currentCommand.length;
                            }
                        }
                    } else if (matches.length > 1) {
                        term.write('\r\n');
                        term.write(matches.join('\t') + '\r\n');
                        utils.writePrompt(term);
                        term.write(currentCommand);
                        cursorPos = currentCommand.length;
                        term.scrollToBottom();
                    }
                } else if (charCode >= 32 && charCode <= 126) {
                    currentCommand = currentCommand.slice(0, cursorPos) + e + currentCommand.slice(cursorPos);
                    cursorPos++;
                    redrawLine();
                }
            });

            term.write('Welcome to the Linux Administration tutorial terminal!\r\n');
            term.write('Type "help" to see available commands.\r\n\r\n');
            utils.writePrompt(term);
            term.scrollToBottom();
        }
    }

    // Initialize when everything is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Give time for Terminal libraries to load
            setTimeout(initTerminalModal, 100);
        });
    } else {
        setTimeout(initTerminalModal, 100);
    }
})();
