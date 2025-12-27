// js/commands/executeScript.js
// Handles execution of shell scripts (./script.sh or /path/to/script.sh)

import { getPathObject, resolvePath, canExecute } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';

/**
 * Execute a shell script
 * @param {string} scriptPath - Path to the script (e.g., './myscript.sh' or '/path/to/script.sh')
 * @param {object} handlers - Command handlers object
 * @returns {string} Output from script execution
 */
export const executeScript = (scriptPath, handlers) => {
    // Remove ./ or / prefix to get the actual path
    const cleanPath = scriptPath.startsWith('./') ? scriptPath.slice(2) : scriptPath;

    const resolved = resolvePath(cleanPath);
    const scriptFile = getPathObject(resolved);

    if (!scriptFile) {
        return `bash: ${scriptPath}: No such file or directory`;
    }

    if (scriptFile.type !== 'file') {
        return `bash: ${scriptPath}: Is a directory`;
    }

    // Check execute permission
    const currentUser = getCurrentUser();
    if (!canExecute(scriptFile, currentUser)) {
        return `bash: ${scriptPath}: Permission denied`;
    }

    // Read script content
    const lines = scriptFile.content.split('\n').filter(line => line.trim());
    const outputs = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip shebang line
        if (line.startsWith('#!')) {
            continue;
        }

        // Skip comments
        if (line.startsWith('#')) {
            continue;
        }

        // Skip empty lines
        if (line === '') {
            continue;
        }

        // Parse command
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        // Execute command
        if (handlers[cmd]) {
            try {
                const output = handlers[cmd](args);
                // Always push output, even if it's an empty string (for blank lines)
                if (output !== undefined) {
                    outputs.push(output);
                }
            } catch (error) {
                return `bash: line ${i + 1}: ${cmd}: ${error.message}`;
            }
        } else {
            return `bash: line ${i + 1}: ${cmd}: command not found`;
        }
    }

    return outputs.join('\r\n');
};
