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
                    return import('../js/shellParser.js').then(({ ShellParser }) => {
                        setupTerminalHandlers(term, commandHandlers(term), utils, new ShellParser());
                    });
                });
            }).catch(err => {
                console.error('Failed to load terminal modules:', err);
                term.write('Error: Could not load terminal command handlers.\r\n');
                term.write('Some terminal features may not work correctly.\r\n\r\n');
            });
        }

        function setupTerminalHandlers(term, handlers, utils, parser) {
            let currentCommand = '';
            const commandHistory = [];
            let historyIndex = -1;
            let cursorPos = 0;

            function handleCommand(command) {
                let output = '';

                // Handle empty command
                if (!command || command.trim() === '') {
                    return;
                }

                if (parser.needsShellParsing(command)) {
                    output = handlePipedCommand(command);
                } else {
                    const parts = command.split(/\s+/).filter(p => p.length > 0);
                    const cmd = parts[0];
                    const args = parts.slice(1);

                    // Double-check cmd is not undefined
                    if (!cmd) {
                        return;
                    }

                    const handler = handlers[cmd];

                    if (handler) {
                        output = handler(args);
                    } else {
                        output = `bash: ${cmd}: command not found`;
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

                if (redirections.output) {
                    return `Output redirected to: ${redirections.output}`;
                } else if (redirections.append) {
                    return `Output appended to: ${redirections.append}`;
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
                    if (currentCommand.trim().length > 0) {
                        commandHistory.push(currentCommand.trim());
                        historyIndex = commandHistory.length;
                    }
                    handleCommand(currentCommand.trim());
                    currentCommand = '';
                    cursorPos = 0;
                    utils.writePrompt(term);
                } else if (e === '\x7F') {
                    if (cursorPos > 0) {
                        currentCommand = currentCommand.slice(0, cursorPos - 1) + currentCommand.slice(cursorPos);
                        cursorPos--;
                        redrawLine();
                    }
                } else if (e === '\x1B[A') {
                    if (historyIndex > 0) {
                        historyIndex--;
                        currentCommand = commandHistory[historyIndex];
                        cursorPos = currentCommand.length;
                        redrawLine();
                    }
                } else if (e === '\x1B[B') {
                    if (historyIndex < commandHistory.length - 1) {
                        historyIndex++;
                        currentCommand = commandHistory[historyIndex];
                        cursorPos = currentCommand.length;
                        redrawLine();
                    } else if (historyIndex === commandHistory.length - 1) {
                        historyIndex = commandHistory.length;
                        currentCommand = '';
                        cursorPos = 0;
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
                    const currentDir = utils.getCurrentDir();
                    if (!currentDir || !currentDir.children) return;

                    const commandParts = currentCommand.split(/\s+/);
                    const lastPart = commandParts.pop() || '';
                    const itemsInDir = Object.keys(currentDir.children);
                    const matches = itemsInDir.filter(item => item.startsWith(lastPart));

                    if (matches.length === 1) {
                        const completion = matches[0].substring(lastPart.length);
                        term.write(completion);
                        currentCommand += completion;
                        cursorPos = currentCommand.length;
                        if (currentDir.children[matches[0]].type === 'directory') {
                            term.write('/');
                            currentCommand += '/';
                            cursorPos = currentCommand.length;
                        }
                    } else if (matches.length > 1) {
                        term.write('\r\n');
                        term.write(matches.join('\t') + '\r\n');
                        utils.writePrompt(term);
                        term.write(currentCommand);
                        cursorPos = currentCommand.length;
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
