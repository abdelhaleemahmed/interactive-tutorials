// VALIDATING
// js/commands/nano.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * nano command - Simple text editor (simulator version)
 * Usage: nano <file>
 *
 * Note: This is a simplified simulation. In a real terminal, nano would
 * open an interactive full-screen editor. For this simulator, we provide
 * a demonstration of how nano works and show the file content.
 *
 * In a production version, this would need:
 * - Full terminal screen takeover
 * - Keyboard event capture
 * - Cursor positioning
 * - Real-time editing buffer
 *
 * For now, we show how to use nano and display file contents for editing.
 */
export const nanoCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('nano', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'nano: missing filename\n' +
               'Usage: nano <file>\n\n' +
               'nano is a simple text editor. Key commands:\n' +
               '  ^S  (Ctrl+S)    Save current file\n' +
               '  ^O  (Ctrl+O)    Write Out (save as)\n' +
               '  ^X  (Ctrl+X)    Exit nano\n' +
               '  ^K  (Ctrl+K)    Cut current line\n' +
               '  ^U  (Ctrl+U)    Paste cut text\n' +
               '  ^W  (Ctrl+W)    Search\n' +
               '  ^\\  (Ctrl+\\)    Replace\n' +
               '  ^G  (Ctrl+G)    Display help';
    }

    const currentUser = getCurrentUser();
    const filename = args[0];

    if (args.length > 1) {
        return 'nano: too many arguments\nUsage: nano <file>';
    }

    // Resolve path
    const resolved = resolvePath(filename);
    const fileObj = getPathObject(resolved);

    // Check if file exists
    if (fileObj) {
        // File exists
        if (fileObj.type !== 'file') {
            return `nano: ${filename}: Is a directory`;
        }

        if (!canRead(fileObj, currentUser)) {
            return `nano: ${filename}: Permission denied`;
        }

        // Get file content
        const content = fileObj.content || '';
        const lines = content.split('\n');
        const lineCount = lines.length;
        const charCount = content.length;

        // Display nano editor simulation
        let output = '\r\n';
        output += '┌─────────────────────────────────────────────────────────────┐\r\n';
        output += `│  GNU nano 7.2               ${filename.padEnd(28)} │\r\n`;
        output += '├─────────────────────────────────────────────────────────────┤\r\n';
        output += '│                                                             │\r\n';

        // Show first 10 lines of content
        const displayLines = lines.slice(0, 10);
        displayLines.forEach(line => {
            const truncated = line.length > 59 ? line.substring(0, 56) + '...' : line;
            output += `│ ${truncated.padEnd(59)} │\r\n`;
        });

        // Pad if less than 10 lines
        for (let i = displayLines.length; i < 10; i++) {
            output += '│                                                             │\r\n';
        }

        if (lines.length > 10) {
            output += `│ ... (${lines.length - 10} more lines) ...`.padEnd(62) + '│\r\n';
        }

        output += '│                                                             │\r\n';
        output += '├─────────────────────────────────────────────────────────────┤\r\n';
        output += '│ ^G Help    ^O Write Out  ^W Where Is  ^K Cut       ^T To    │\r\n';
        output += '│ ^X Exit    ^R Read File  ^\\Replace    ^U Paste     ^J Justify│\r\n';
        output += '└─────────────────────────────────────────────────────────────┘\r\n';
        output += `\r\nFile: ${filename} | Lines: ${lineCount} | Characters: ${charCount}\r\n`;
        output += '\r\n';
        output += '━━━ SIMULATOR NOTE ━━━\r\n';
        output += 'This is a demonstration of how nano looks.\r\n';
        output += 'In a real terminal, you would:\r\n';
        output += '  1. Type to edit the content\r\n';
        output += '  2. Press ^S (Ctrl+S) to save changes\r\n';
        output += '  3. Press ^X (Ctrl+X) to exit\r\n';
        output += '\r\n';
        output += `To view the full file, use: cat ${filename}\r\n`;
        output += `To modify files in this simulator, use: echo "content" > ${filename}\r\n`;

        return output;

    } else {
        // File doesn't exist - show new file interface
        let output = '\r\n';
        output += '┌─────────────────────────────────────────────────────────────┐\r\n';
        output += `│  GNU nano 7.2           [ New File ]                       │\r\n`;
        output += '├─────────────────────────────────────────────────────────────┤\r\n';
        output += '│                                                             │\r\n';

        // Empty editor space
        for (let i = 0; i < 12; i++) {
            output += '│                                                             │\r\n';
        }

        output += '├─────────────────────────────────────────────────────────────┤\r\n';
        output += '│ ^G Help    ^O Write Out  ^W Where Is  ^K Cut       ^T To    │\r\n';
        output += '│ ^X Exit    ^R Read File  ^\\Replace    ^U Paste     ^J Justify│\r\n';
        output += '└─────────────────────────────────────────────────────────────┘\r\n';
        output += `\r\nFile: ${filename} [ New File ]\r\n`;
        output += '\r\n';
        output += '━━━ SIMULATOR NOTE ━━━\r\n';
        output += 'This is a demonstration of nano for a new file.\r\n';
        output += 'In a real terminal, you would:\r\n';
        output += '  1. Type your content\r\n';
        output += '  2. Press ^O (Ctrl+O) then Enter to save\r\n';
        output += '  3. Press ^X (Ctrl+X) to exit\r\n';
        output += '\r\n';
        output += `To create this file in the simulator, use:\r\n`;
        output += `  echo "your content" > ${filename}\r\n`;
        output += `  touch ${filename}   # (creates empty file)\r\n`;

        return output;
    }
};
