// VALIDATING
// js/commands/less.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * less command - View file contents with pagination
 * Usage: less [-N] <file>
 *
 * Interactive keys (in real implementation):
 * - Space: Next page
 * - b: Previous page
 * - /pattern: Search
 * - q: Quit
 *
 * Note: This is a simplified implementation for the simulator.
 * In practice, less would require modal/interactive mode.
 * For now, we display paginated content with instructions.
 */
export const lessCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('less', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'less: missing filename\nUsage: less [-N] <file>';
    }

    const currentUser = getCurrentUser();
    let showLineNumbers = false;
    let filename = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-N') {
            showLineNumbers = true;
        } else if (!filename) {
            filename = args[i];
        } else {
            return `less: unexpected argument '${args[i]}'`;
        }
    }

    if (!filename) {
        return 'less: missing filename';
    }

    // Resolve and read file
    const resolved = resolvePath(filename);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return `less: ${filename}: No such file or directory`;
    }

    if (fileObj.type !== 'file') {
        return `less: ${filename}: Is a directory`;
    }

    if (!canRead(fileObj, currentUser)) {
        return `less: ${filename}: Permission denied`;
    }

    // Get file content
    const content = fileObj.content || '';
    const lines = content.split('\n');

    // Define page size (lines per page)
    const PAGE_SIZE = 20;
    const totalLines = lines.length;
    const totalPages = Math.ceil(totalLines / PAGE_SIZE);

    // For simulator, we'll show the first page with instructions
    let output = '';

    // Add header
    output += `\r\n=== Viewing: ${filename} ===\r\n`;
    output += `Lines: ${totalLines} | Pages: ${totalPages} | Mode: less\r\n`;
    output += `\r\n`;

    // Show first page
    const firstPage = lines.slice(0, PAGE_SIZE);

    if (showLineNumbers) {
        firstPage.forEach((line, idx) => {
            const lineNum = (idx + 1).toString().padStart(6, ' ');
            output += `${lineNum}  ${line}\r\n`;
        });
    } else {
        output += firstPage.join('\r\n');
    }

    // Add footer with instructions
    if (totalPages > 1) {
        output += `\r\n\r\n--- Page 1/${totalPages} ---\r\n`;
        output += `[In a real terminal: Space=Next, b=Previous, /=Search, q=Quit]\r\n`;
        output += `\r\nNote: This simulator shows the first page only.\r\n`;
        output += `Use 'cat ${filename}' to see the full file.\r\n`;
    } else {
        output += `\r\n\r\n(END)`;
    }

    return output;
};
