// VALIDATING
// js/commands/more.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * more command - Simple paginated file viewer
 * Usage: more <file>
 *
 * Interactive keys (in real implementation):
 * - Space: Next page
 * - Enter: Next line
 * - q: Quit
 *
 * Note: This is a simplified implementation for the simulator.
 * Shows first page with percentage indicator.
 */
export const moreCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('more', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'more: missing filename\nUsage: more <file>';
    }

    const currentUser = getCurrentUser();
    const filename = args[0];

    if (args.length > 1) {
        return `more: too many arguments\nUsage: more <file>`;
    }

    // Resolve and read file
    const resolved = resolvePath(filename);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return `more: ${filename}: No such file or directory`;
    }

    if (fileObj.type !== 'file') {
        return `more: ${filename}: Is a directory`;
    }

    if (!canRead(fileObj, currentUser)) {
        return `more: ${filename}: Permission denied`;
    }

    // Get file content
    const content = fileObj.content || '';
    const lines = content.split('\n');

    // Define page size
    const PAGE_SIZE = 20;
    const totalLines = lines.length;

    // Calculate percentage for first page
    const linesShown = Math.min(PAGE_SIZE, totalLines);
    const percentage = totalLines > 0 ? Math.round((linesShown / totalLines) * 100) : 100;

    // Show first page
    const firstPage = lines.slice(0, PAGE_SIZE);
    let output = firstPage.join('\r\n');

    // Add more prompt if there's more content
    if (totalLines > PAGE_SIZE) {
        output += `\r\n\r\n--More--(${percentage}%)`;
        output += `\r\n[In a real terminal: Space=Next page, Enter=Next line, q=Quit]\r\n`;
        output += `\r\nNote: This simulator shows the first page only.\r\n`;
        output += `Use 'cat ${filename}' to see the full file.\r\n`;
    } else {
        // File fits in one page
        output += `\r\n`;
    }

    return output;
};
