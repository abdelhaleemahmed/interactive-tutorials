// js/commands/sed.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * sed command - Stream editor for text transformation
 * Usage: sed <expression> <file>
 *        sed -n '<range>p' <file>
 *        sed -e <expr1> -e <expr2> <file>
 *
 * Supported expressions:
 * - s/pattern/replacement/[g]  - Substitute
 * - Nd                          - Delete line N
 * - /pattern/d                  - Delete lines matching pattern
 * - N,Mp                        - Print lines N to M (with -n)
 */

/**
 * Parse sed expression
 */
function parseExpression(expr) {
    // Substitution: s/pattern/replacement/flags
    const substMatch = expr.match(/^s\/(.+?)\/(.*)\/([g]?)$/);
    if (substMatch) {
        return {
            type: 'substitute',
            pattern: substMatch[1],
            replacement: substMatch[2],
            global: substMatch[3] === 'g'
        };
    }

    // Delete line by number: 5d
    const deleteNumMatch = expr.match(/^(\d+)d$/);
    if (deleteNumMatch) {
        return {
            type: 'delete',
            lineNum: parseInt(deleteNumMatch[1])
        };
    }

    // Delete by pattern: /pattern/d
    const deletePatMatch = expr.match(/^\/(.+?)\/d$/);
    if (deletePatMatch) {
        return {
            type: 'delete',
            pattern: deletePatMatch[1]
        };
    }

    // Print range: N,Mp
    const printMatch = expr.match(/^(\d+),(\d+)p$/);
    if (printMatch) {
        return {
            type: 'print',
            startLine: parseInt(printMatch[1]),
            endLine: parseInt(printMatch[2])
        };
    }

    // Single line print: Np
    const printSingleMatch = expr.match(/^(\d+)p$/);
    if (printSingleMatch) {
        return {
            type: 'print',
            startLine: parseInt(printSingleMatch[1]),
            endLine: parseInt(printSingleMatch[1])
        };
    }

    return null;
}

/**
 * Apply sed expression to content
 */
function applyExpression(content, expr, quietMode) {
    const lines = content.split('\n');
    let result = [];

    switch (expr.type) {
        case 'substitute':
            // Create regex from pattern
            const flags = expr.global ? 'g' : '';
            const regex = new RegExp(expr.pattern, flags);

            result = lines.map(line => line.replace(regex, expr.replacement));
            break;

        case 'delete':
            if (expr.lineNum !== undefined) {
                // Delete specific line number (1-indexed)
                result = lines.filter((_, idx) => idx + 1 !== expr.lineNum);
            } else if (expr.pattern) {
                // Delete lines matching pattern
                const regex = new RegExp(expr.pattern);
                result = lines.filter(line => !regex.test(line));
            }
            break;

        case 'print':
            if (quietMode) {
                // Only print specified range
                result = lines.filter((_, idx) => {
                    const lineNum = idx + 1;
                    return lineNum >= expr.startLine && lineNum <= expr.endLine;
                });
            } else {
                // In non-quiet mode, print acts normally
                result = lines;
            }
            break;

        default:
            result = lines;
    }

    return result.join('\n');
}

/**
 * sed command implementation
 */
export const sedCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('sed', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'sed: missing arguments\nUsage: sed <expression> <file>\n' +
               '      sed -n <range>p <file>\n' +
               '      sed -e <expr> [-e <expr>] <file>';
    }

    const currentUser = getCurrentUser();
    let quietMode = false;
    let expressions = [];
    let filename = null;
    let i = 0;

    // Parse arguments
    while (i < args.length) {
        if (args[i] === '-n') {
            quietMode = true;
            i++;
        } else if (args[i] === '-e') {
            if (i + 1 >= args.length) {
                return 'sed: -e requires an expression argument';
            }
            expressions.push(args[i + 1]);
            i += 2;
        } else if (!filename && i === args.length - 1) {
            // Last argument is the filename
            filename = args[i];
            i++;
        } else if (!expressions.length) {
            // First non-flag argument is the expression
            expressions.push(args[i]);
            i++;
        } else {
            return `sed: unexpected argument '${args[i]}'`;
        }
    }

    // Validate we have expression and filename
    if (expressions.length === 0) {
        return 'sed: no expression specified';
    }

    if (!filename) {
        return 'sed: no input file specified';
    }

    // Resolve and read file
    const resolved = resolvePath(filename);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return `sed: ${filename}: No such file or directory`;
    }

    if (fileObj.type !== 'file') {
        return `sed: ${filename}: Is a directory`;
    }

    if (!canRead(fileObj, currentUser)) {
        return `sed: ${filename}: Permission denied`;
    }

    // Get file content
    let content = fileObj.content || '';

    // Parse all expressions
    const parsedExprs = [];
    for (const expr of expressions) {
        const parsed = parseExpression(expr);
        if (!parsed) {
            return `sed: invalid expression '${expr}'`;
        }
        parsedExprs.push(parsed);
    }

    // Apply expressions in order
    for (const expr of parsedExprs) {
        content = applyExpression(content, expr, quietMode);
    }

    return content;
};
