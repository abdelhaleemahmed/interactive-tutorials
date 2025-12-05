import os
import requests
from urllib.parse import urlparse

def setup_local_project_modular():
    """
    Sets up the local project structure and downloads necessary CSS and JS files
    for the interactive Linux terminal tutorial with a modular command design.
    """
    base_dir = os.getcwd() # Get the current working directory
    css_dir = os.path.join(base_dir, 'css')
    js_dir = os.path.join(base_dir, 'js')
    commands_dir = os.path.join(js_dir, 'commands')

    # Define files to download and their local paths
    files_to_download = {
        # CSS files
        'https://cdn.tailwindcss.com': os.path.join(css_dir, 'tailwind.min.css'),
        'https://unpkg.com/xterm@5.3.0/css/xterm.css': os.path.join(css_dir, 'xterm.css'),

        # Core xterm.js files
        'https://unpkg.com/xterm@5.3.0/lib/xterm.js': os.path.join(js_dir, 'xterm.js'),
        'https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js': os.path.join(js_dir, 'xterm-addon-fit.js'),
    }

    # Create directories if they don't exist
    print(f"Creating directory: {css_dir}")
    os.makedirs(css_dir, exist_ok=True)
    print(f"Creating directory: {js_dir}")
    os.makedirs(js_dir, exist_ok=True)
    print(f"Creating directory: {commands_dir}")
    os.makedirs(commands_dir, exist_ok=True)

    # Download external files
    for url, local_path in files_to_download.items():
        if url.startswith('http'): # Only download external URLs
            print(f"Downloading {url} to {local_path}...")
            try:
                response = requests.get(url, stream=True)
                response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"Successfully downloaded {os.path.basename(local_path)}")
            except requests.exceptions.RequestException as e:
                print(f"Error downloading {url}: {e}")
            except IOError as e:
                print(f"Error writing file {local_path}: {e}")

    # Write the content for local JS files
    print("\nWriting local JavaScript files...")

    # js/terminalUtils.js content
    with open(os.path.join(js_dir, 'terminalUtils.js'), 'w') as f:
        f.write("""
// js/terminalUtils.js

// Simulated File System (exported for access by commands)
export const fileSystem = {
    type: 'directory',
    children: {
        'home': {
            type: 'directory',
            children: {
                'user': {
                    type: 'directory',
                    children: {
                        'documents': {
                            type: 'directory',
                            children: {
                                'report.txt': {
                                    type: 'file',
                                    content: 'This is a sample report file.\\nIt contains some important information.',
                                    size: 60,
                                    date: 'Jul 25 10:00',
                                    permissions: '-rw-r--r--'
                                },
                                'notes.md': {
                                    type: 'file',
                                    content: '# My Notes\\n\\n- Idea 1\\n- Idea 2\\n- Idea 3',
                                    size: 40,
                                    date: 'Jul 26 14:30',
                                    permissions: '-rw-r--r--'
                                }
                            }
                        },
                        'projects': {
                            type: 'directory',
                            children: {
                                'my_blog': {
                                    type: 'directory',
                                    children: {
                                        'index.html': { type: 'file', content: '<!DOCTYPE html>...', size: 200, date: 'Jul 20 09:00', permissions: '-rw-r--r--' },
                                        'style.css': { type: 'file', content: 'body { color: blue; }', size: 50, date: 'Jul 20 09:05', permissions: '-rw-r--r--' },
                                        'script.js': { type: 'file', content: '// JavaScript code', size: 30, date: 'Jul 20 09:10', permissions: '-rw-r--r--' }
                                    }
                                },
                                'game_dev': {
                                    type: 'directory',
                                    children: {
                                        'main.py': { type: 'file', content: 'print(\\"Hello Game!\\")', size: 20, date: 'Jul 22 11:00', permissions: '-rw-r--r--' },
                                        'assets': { type: 'directory', children: {} }
                                    }
                                }
                            }
                        },
                        'downloads': {
                            type: 'directory',
                            children: {}
                        },
                        'README.txt': {
                            type: 'file',
                            content: 'Welcome to your simulated home directory!\\n\\nTry `ls -l` for more details.',
                            size: 70,
                            date: 'Jul 27 08:00',
                            permissions: '-rw-r--r--'
                        }
                    }
                }
            }
        }
    }
};

export let currentPath = ['home', 'user'];
export const user = 'bloguser';
export const hostname = 'bloghost';
export const defaultDirPermissions = 'drwxr-xr-x';
export const defaultFilePermissions = '-rw-r--r--';
export const defaultOwner = 'user';
export const defaultGroup = 'user';

export function getCurrentDateFormatted() {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${minutes}`;
}

export function writePrompt(term) {
    const pathDisplay = currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
    term.write(`\\x1B[1;32m${user}@${hostname}\\x1B[0m:\\x1B[1;34m${pathDisplay}\\x1B[0m$ `);
}

export function getCurrentDir() {
    let dir = fileSystem;
    for (const segment of currentPath) {
        if (dir.children && dir.children[segment]) {
            dir = dir.children[segment];
        } else {
            return null;
        }
    }
    return dir;
}

export function getPathObject(pathSegments) {
    let current = fileSystem;
    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (current.children && current.children[segment]) {
            current = current.children[segment];
        } else {
            return null;
        }
    }
    return current;
}

export function resolvePath(targetPath) {
    const pathSegments = targetPath.split('/').filter(s => s !== '');
    let resolved;

    if (targetPath.startsWith('/')) {
        resolved = [];
    } else {
        resolved = [...currentPath];
    }

    for (const segment of pathSegments) {
        if (segment === '..') {
            if (resolved.length > 0) {
                resolved.pop();
            }
        } else if (segment === '.') {
            // Do nothing
        } else if (segment === '~') {
            resolved = ['home', 'user'];
        } else {
            resolved.push(segment);
        }
    }
    return resolved;
}

export function updateCurrentPath(newPathArray) {
    currentPath = newPathArray;
}
""")
    print("  - js/terminalUtils.js written.")

    # js/commands/ls.js content
    with open(os.path.join(commands_dir, 'ls.js'), 'w') as f:
        f.write("""
// js/commands/ls.js

import {
    fileSystem, currentPath, user, hostname,
    defaultDirPermissions, defaultFilePermissions, defaultOwner, defaultGroup,
    getCurrentDateFormatted, getCurrentDir, getPathObject, resolvePath
} from '../terminalUtils.js';

export const lsCommand = (args) => {
    let lsTarget = args[0];
    let targetObjForLs = getCurrentDir();
    let showLongFormat = false;
    let output = '';

    if (args.includes('-l')) {
        showLongFormat = true;
        const filteredArgs = args.filter(arg => arg !== '-l');
        if (filteredArgs.length > 0) {
            lsTarget = filteredArgs[0];
        } else {
            lsTarget = undefined;
        }
    }

    if (lsTarget) {
        const resolvedPath = resolvePath(lsTarget);
        targetObjForLs = getPathObject(resolvedPath);
    }

    if (!targetObjForLs) {
        output = `ls: cannot access '${lsTarget}': No such file or directory`;
    } else if (targetObjForLs.type === 'file') {
        const fileName = lsTarget || Object.keys(getCurrentDir().children).find(key => getCurrentDir().children[key] === targetObjForLs);
        if (showLongFormat) {
            const permissions = targetObjForLs.permissions || defaultFilePermissions;
            const size = targetObjForLs.size !== undefined ? targetObjForLs.size : 0;
            const date = targetObjForLs.date || getCurrentDateFormatted();
            output = `${permissions} 1 ${defaultOwner} ${defaultGroup} ${size.toString().padStart(6)} ${date} ${fileName}`;
        } else {
            output = fileName;
        }
    } else if (targetObjForLs.type === 'directory') {
        const items = Object.keys(targetObjForLs.children || {});
        if (items.length === 0) {
            output = '';
        } else {
            if (showLongFormat) {
                output = items.map(item => {
                    const obj = targetObjForLs.children[item];
                    const permissions = obj.permissions || (obj.type === 'directory' ? defaultDirPermissions : defaultFilePermissions);
                    const size = obj.size !== undefined ? obj.size : (obj.type === 'directory' ? 4096 : 0);
                    const date = obj.date || getCurrentDateFormatted();
                    const name = obj.type === 'directory' ? `\\x1B[1;34m${item}\\x1B[0m` : item;
                    return `${permissions} 1 ${defaultOwner} ${defaultGroup} ${size.toString().padStart(6)} ${date} ${name}`;
                }).join('\\r\\n');
            } else {
                output = items.map(item => {
                    const obj = targetObjForLs.children[item];
                    return obj.type === 'directory' ? `\\x1B[1;34m${item}/\\x1B[0m` : item;
                }).join('\\t');
            }
        }
    } else {
        output = `ls: cannot access '${lsTarget}': Not a directory`;
    }
    return output;
};
""")
    print("  - js/commands/ls.js written.")

    # js/commands/cd.js content
    with open(os.path.join(commands_dir, 'cd.js'), 'w') as f:
        f.write("""
// js/commands/cd.js

import {
    currentPath, updateCurrentPath,
    getPathObject, resolvePath
} from '../terminalUtils.js';

export const cdCommand = (args) => {
    const targetCd = args[0];
    let output = '';

    if (!targetCd || targetCd === '~') {
        updateCurrentPath(['home', 'user']);
    } else if (targetCd === '..') {
        if (currentPath.length > 0) {
            updateCurrentPath(currentPath.slice(0, -1));
        }
    } else if (targetCd === '/') {
        updateCurrentPath([]);
    } else {
        const resolved = resolvePath(targetCd);
        const targetObj = getPathObject(resolved);

        if (targetObj && targetObj.type === 'directory') {
            updateCurrentPath(resolved);
        } else if (targetObj && targetObj.type === 'file') {
            output = `bash: cd: ${targetCd}: Not a directory`;
        } else {
            output = `bash: cd: ${targetCd}: No such file or directory`;
        }
    }
    return output;
};
""")
    print("  - js/commands/cd.js written.")

    # js/commands/mkdir.js content
    with open(os.path.join(commands_dir, 'mkdir.js'), 'w') as f:
        f.write("""
// js/commands/mkdir.js

import {
    getCurrentDir, getCurrentDateFormatted,
    defaultDirPermissions, defaultOwner, defaultGroup
} from '../terminalUtils.js';

export const mkdirCommand = (args) => {
    const newDirName = args[0];
    let output = '';
    if (!newDirName) {
        output = 'mkdir: missing operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        if (currentDirChildren[newDirName]) {
            output = `mkdir: cannot create directory '${newDirName}': File exists`;
        } else {
            currentDirChildren[newDirName] = {
                type: 'directory',
                children: {},
                permissions: defaultDirPermissions,
                date: getCurrentDateFormatted(),
                size: 4096
            };
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/mkdir.js written.")

    # js/commands/pwd.js content
    with open(os.path.join(commands_dir, 'pwd.js'), 'w') as f:
        f.write("""
// js/commands/pwd.js

import { currentPath } from '../terminalUtils.js';

export const pwdCommand = () => {
    return currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
};
""")
    print("  - js/commands/pwd.js written.")

    # js/commands/cat.js content
    with open(os.path.join(commands_dir, 'cat.js'), 'w') as f:
        f.write("""
// js/commands/cat.js

import { getPathObject, resolvePath } from '../terminalUtils.js';

export const catCommand = (args) => {
    const fileName = args[0];
    let output = '';
    if (!fileName) {
        output = 'cat: missing operand';
    } else {
        const resolved = resolvePath(fileName);
        const fileObj = getPathObject(resolved);

        if (fileObj && fileObj.type === 'file') {
            output = fileObj.content;
        } else if (fileObj && fileObj.type === 'directory') {
            output = `cat: ${fileName}: Is a directory`;
        } else {
            output = `cat: ${fileName}: No such file or directory`;
        }
    }
    return output;
};
""")
    print("  - js/commands/cat.js written.")

    # js/commands/rmdir.js content
    with open(os.path.join(commands_dir, 'rmdir.js'), 'w') as f:
        f.write("""
// js/commands/rmdir.js

import { getCurrentDir } from '../terminalUtils.js';

export const rmdirCommand = (args) => {
    const dirToRemove = args[0];
    let output = '';
    if (!dirToRemove) {
        output = 'rmdir: missing operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        const targetObj = currentDirChildren[dirToRemove];
        if (!targetObj) {
            output = `rmdir: failed to remove '${dirToRemove}': No such file or directory`;
        } else if (targetObj.type === 'file') {
            output = `rmdir: failed to remove '${dirToRemove}': Not a directory`;
        } else if (Object.keys(targetObj.children).length > 0) {
            output = `rmdir: failed to remove '${dirToRemove}': Directory not empty`;
        } else {
            delete currentDirChildren[dirToRemove];
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/rmdir.js written.")

    # js/commands/touch.js content
    with open(os.path.join(commands_dir, 'touch.js'), 'w') as f:
        f.write("""
// js/commands/touch.js

import { getCurrentDir, getCurrentDateFormatted, defaultFilePermissions } from '../terminalUtils.js';

export const touchCommand = (args) => {
    const fileToTouch = args[0];
    let output = '';
    if (!fileToTouch) {
        output = 'touch: missing file operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        if (currentDirChildren[fileToTouch] && currentDirChildren[fileToTouch].type === 'file') {
            currentDirChildren[fileToTouch].date = getCurrentDateFormatted();
            output = '';
        } else if (currentDirChildren[fileToTouch] && currentDirChildren[fileToTouch].type === 'directory') {
            output = `touch: cannot touch '${fileToTouch}': Is a directory`;
        } else {
            currentDirChildren[fileToTouch] = {
                type: 'file',
                content: '',
                size: 0,
                date: getCurrentDateFormatted(),
                permissions: defaultFilePermissions
            };
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/touch.js written.")

    # js/commands/rm.js content
    with open(os.path.join(commands_dir, 'rm.js'), 'w') as f:
        f.write("""
// js/commands/rm.js

import { getCurrentDir } from '../terminalUtils.js';

export const rmCommand = (args) => {
    const fileToRemove = args[0];
    let output = '';
    if (!fileToRemove) {
        output = 'rm: missing operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        const targetObj = currentDirChildren[fileToRemove];
        if (!targetObj) {
            output = `rm: cannot remove '${fileToRemove}': No such file or directory`;
        } else if (targetObj.type === 'directory') {
            output = `rm: cannot remove '${fileToRemove}': Is a directory`;
        } else {
            delete currentDirChildren[fileToRemove];
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/rm.js written.")

    # js/commands/mv.js content
    with open(os.path.join(commands_dir, 'mv.js'), 'w') as f:
        f.write("""
// js/commands/mv.js

import { getCurrentDir } from '../terminalUtils.js';

export const mvCommand = (args) => {
    let output = '';
    if (args.length !== 2) {
        output = 'mv: missing file operand\\\\nTry \\'mv SOURCE DEST\\'';
    } else {
        const source = args[0];
        const destination = args[1];
        const currentDirChildren = getCurrentDir().children;

        const sourceObj = currentDirChildren[source];
        if (!sourceObj) {
            output = `mv: cannot stat '${source}': No such file or directory`;
        } else if (currentDirChildren[destination]) {
            output = `mv: cannot move to '${destination}': File exists`;
        } else {
            currentDirChildren[destination] = sourceObj;
            delete currentDirChildren[source];
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/mv.js written.")

    # js/commands/cp.js content
    with open(os.path.join(commands_dir, 'cp.js'), 'w') as f:
        f.write("""
// js/commands/cp.js

import { getCurrentDir, getCurrentDateFormatted } from '../terminalUtils.js';

export const cpCommand = (args) => {
    let output = '';
    if (args.length !== 2) {
        output = 'cp: missing file operand\\\\nTry \\'cp SOURCE DEST\\'';
    } else {
        const source = args[0];
        const destination = args[1];
        const currentDirChildren = getCurrentDir().children;

        const sourceObj = currentDirChildren[source];
        if (!sourceObj) {
            output = `cp: cannot stat '${source}': No such file or directory`;
        } else if (sourceObj.type === 'directory') {
            output = `cp: -r not specified; omitting directory '${source}'`;
        } else if (currentDirChildren[destination]) {
            output = `cp: cannot copy to '${destination}': File exists`;
        } else {
            currentDirChildren[destination] = { ...sourceObj, date: getCurrentDateFormatted() };
            output = '';
        }
    }
    return output;
};
""")
    print("  - js/commands/cp.js written.")


    # js/commandRegistry.js content
    with open(os.path.join(js_dir, 'commandRegistry.js'), 'w') as f:
        f.write("""
// js/commandRegistry.js

import { lsCommand } from './commands/ls.js';
import { cdCommand } from './commands/cd.js';
import { mkdirCommand } from './commands/mkdir.js';
import { pwdCommand } from './commands/pwd.js';
import { catCommand } from './commands/cat.js';
import { rmdirCommand } from './commands/rmdir.js';
import { touchCommand } from './commands/touch.js';
import { rmCommand } from './commands/rm.js';
import { mvCommand } from './commands/mv.js';
import { cpCommand } from './commands/cp.js';

import { user, getCurrentDateFormatted } from './terminalUtils.js';

const helpCommand = () => {
    return `Supported commands:\\r\\n` +
           `  ls [-l]         - List directory contents. Use -l for long format.\\r\\n` +
           `  cd <dir>        - Change the current directory.\\r\\n` +
           `  pwd             - Print name of current working directory.\\r\\n` +
           `  cat <file>      - Concatenate and print files.\\r\\n` +
           `  mkdir <dir>     - Make directories.\\r\\n` +
           `  rmdir <dir>     - Remove empty directories.\\r\\n` +
           `  touch <file>    - Change file timestamps or create new files.\\r\\n` +
           `  rm <file>       - Remove files.\\r\\n` +
           `  mv <src> <dest> - Move or rename files or directories.\\r\\n` +
           `  cp <src> <dest> - Copy files.\\r\\n` +
           `  whoami          - Print the effective user ID.\\r\\n` +
           `  date            - Display the current date and time.\\r\\n` +
           `  clear           - Clear the terminal screen.\\r\\n` +
           `  help            - Display this help message.\\r\\n`;
};

const clearCommand = (termInstance) => {
    termInstance.clear();
    return '';
};

const whoamiCommand = () => {
    return user;
};

const dateCommand = () => {
    return getCurrentDateFormatted();
};

export const commandHandlers = (termInstance) => ({
    'ls': lsCommand,
    'cd': cdCommand,
    'pwd': pwdCommand,
    'cat': catCommand,
    'mkdir': mkdirCommand,
    'rmdir': rmdirCommand,
    'touch': touchCommand,
    'rm': rmCommand,
    'mv': mvCommand,
    'cp': cpCommand,
    'help': helpCommand,
    'clear': () => clearCommand(termInstance),
    'whoami': whoamiCommand,
    'date': dateCommand,
});
""")
    print("  - js/commandRegistry.js written.")


    print("\nProject setup complete!")
    print("Your 'tutorial.html' is now configured for this modular structure.")
    print("To run locally, navigate to your project directory in the terminal and run a simple HTTP server:")
    print("  python -m http.server 8000")
    print("Then open http://localhost:8000/tutorial.html in your browser.")
    print("\nTo add new commands:")
    print("1. Create a new file in 'js/commands/' (e.g., 'js/commands/mycommand.js').")
    print("2. Write your command logic in that file and export it (e.g., 'export const myCommand = (args) => { ... };').")
    print("3. Import your new command into 'js/commandRegistry.js'.")
    print("4. Add your new command to the 'commandHandlers' object in 'js/commandRegistry.js'.")
    print("5. (Optional) Update the 'helpCommand' in 'js/commandRegistry.js' to describe your new command.")

if __name__ == "__main__":
    setup_local_project_modular()
