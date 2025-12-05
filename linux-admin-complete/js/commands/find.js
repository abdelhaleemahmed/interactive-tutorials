// js/commands/find.js

import { getPathObject, resolvePath, currentPath, canRead, canExecute } from '../terminalUtils.js';
import { missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';

export const findCommand = (args) => {
    let output = '';
    const currentUser = getCurrentUser();

    if (args.length < 2) {
        output = 'bash: find: missing arguments\r\nUsage: find <path> -name <pattern>';
    } else {
        const searchPath = args[0];
        const isNameFlag = args[1] === '-name';
        const pattern = args[2];

        if (!isNameFlag || !pattern) {
            output = 'bash: find: invalid syntax\r\nUsage: find <path> -name <pattern>';
        } else {
            const resolved = resolvePath(searchPath);
            const pathObj = getPathObject(resolved);

            if (!pathObj) {
                output = `bash: find: '${searchPath}': No such file or directory`;
            } else if (pathObj.type === 'file') {
                output = `bash: find: '${searchPath}': Not a directory`;
            } else {
                // Check permission to read directory
                if (!canRead(pathObj, currentUser)) {
                    output = `bash: find: '${searchPath}': Permission denied`;
                } else {
                    // Search recursively for matching files
                    const matches = [];
                    const searchRecursive = (dir, currentPath) => {
                        if (!dir.children) return;

                        Object.entries(dir.children).forEach(([name, item]) => {
                            const fullPath = currentPath ? `${currentPath}/${name}` : name;

                            if (name.includes(pattern)) {
                                matches.push(fullPath);
                            }

                            if (item.type === 'directory' && canExecute(item, currentUser)) {
                                searchRecursive(item, fullPath);
                            }
                        });
                    };

                    searchRecursive(pathObj, '');

                    if (matches.length === 0) {
                        output = '';
                    } else {
                        output = matches.join('\r\n');
                    }
                }
            }
        }
    }

    return output;
};
