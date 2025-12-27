// js/userManagement.js
// User account management system for linux-tut

/**
 * User object structure
 * @typedef {Object} User
 * @property {string} username - Username
 * @property {number} uid - User ID
 * @property {number} gid - Primary group ID
 * @property {string} home - Home directory path
 * @property {string} shell - Default shell
 * @property {number[]} groups - Group memberships
 * @property {boolean} isRoot - Is this the root user
 */

/**
 * All available users in the system
 */
export const users = {
  'root': {
    username: 'root',
    uid: 0,
    gid: 0,
    home: '/root',
    shell: '/bin/bash',
    groups: [0],
    isRoot: true
  },
  'user': {
    username: 'user',
    uid: 1000,
    gid: 1000,
    home: '/home/user',
    shell: '/bin/bash',
    groups: ['user', 'sudo', 'www-data'],
    isRoot: false
  },
  'guest': {
    username: 'guest',
    uid: 1001,
    gid: 1001,
    home: '/home/guest',
    shell: '/bin/bash',
    groups: ['guest'],
    isRoot: false
  },
  'john': {
    username: 'john',
    uid: 1002,
    gid: 1002,
    home: '/home/john',
    shell: '/bin/bash',
    groups: ['john'],
    isRoot: false
  }
};

/**
 * Groups in the system
 * Maps group ID to group name
 */
export const groups = {
  0: 'root',
  1000: 'user',
  1001: 'guest'
};

/**
 * Current logged-in user
 * Starts as 'user' (non-root)
 */
let currentUser = users['user'];

/**
 * Get the currently logged-in user object
 * @returns {User} The current user object
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get a user by username
 * @param {string} username - The username to look up
 * @returns {User|null} The user object or null if not found
 */
export function getUser(username) {
  return users[username] || null;
}

/**
 * Get a group name by group ID
 * @param {number} gid - The group ID
 * @returns {string|null} The group name or null if not found
 */
export function getGroupName(gid) {
  return groups[gid] || null;
}

/**
 * Set the currently logged-in user
 * @param {string|User} usernameOrUser - The username to switch to or a user object
 * @returns {boolean} True if successful, false if user doesn't exist
 */
export function setCurrentUser(usernameOrUser) {
  // If it's an object (user object), set it directly
  if (typeof usernameOrUser === 'object' && usernameOrUser !== null) {
    currentUser = usernameOrUser;
    return true;
  }

  // Otherwise, treat it as a username string
  if (!users[usernameOrUser]) {
    return false;
  }
  currentUser = users[usernameOrUser];
  return true;
}

/**
 * Check if the current user is root
 * @returns {boolean} True if current user is root
 */
export function isRootUser() {
  return currentUser.isRoot;
}

/**
 * Check if a user is in a group
 * @param {User} user - The user object
 * @param {number} gid - The group ID
 * @returns {boolean} True if user is in the group
 */
export function userInGroup(user, gid) {
  return user.groups.includes(gid);
}

/**
 * Get all usernames
 * @returns {string[]} Array of usernames
 */
export function getAllUsernames() {
  return Object.keys(users);
}

/**
 * Get all users
 * @returns {User[]} Array of user objects
 */
export function getAllUsers() {
  return Object.values(users);
}

/**
 * Get the default path for a user (their home directory)
 * @param {string} username - The username
 * @returns {string[]} Array representing path (e.g., ['home', 'user'])
 */
export function getDefaultPath(username) {
  const user = users[username];
  if (!user) {
    return ['home', 'user'];
  }

  // Convert '/home/user' to ['home', 'user']
  return user.home
    .split('/')
    .filter(part => part.length > 0);
}

/**
 * Get the home directory path for a user
 * @param {string} username - The username
 * @returns {string} The home directory path (e.g., '/home/user')
 */
export function getHomePath(username) {
  const user = users[username];
  return user ? user.home : '/home/guest';
}

/**
 * Get current user's home directory path
 * @returns {string} The home directory path
 */
export function getCurrentUserHome() {
  return currentUser.home;
}

/**
 * Get current user's username
 * @returns {string} The current username
 */
export function getCurrentUsername() {
  return currentUser.username;
}

/**
 * List all users (for who/users commands)
 * @returns {string} Formatted list of logged in users
 */
export function listLoggedInUsers() {
  // In a real system, this would show multiple sessions
  // For now, just show the current user
  return currentUser.username;
}

/**
 * Get the next available UID
 * @returns {number} The next available UID
 */
export function getNextUid() {
  const uids = Object.values(users).map(u => u.uid);
  return Math.max(...uids) + 1;
}

/**
 * Get the next available GID
 * @returns {number} The next available GID
 */
export function getNextGid() {
  const gids = Object.keys(groups).map(g => parseInt(g));
  return Math.max(...gids) + 1;
}

/**
 * Add a new user to the system
 * @param {string} username - The username
 * @param {Object} options - User options
 * @param {number} [options.uid] - User ID (auto-generated if not provided)
 * @param {number} [options.gid] - Primary group ID (auto-generated if not provided)
 * @param {string} [options.home] - Home directory path
 * @param {string} [options.shell] - Default shell
 * @returns {User} The created user object
 */
export function addUser(username, options = {}) {
  const uid = options.uid || getNextUid();
  const gid = options.gid || uid; // Default: user's GID equals UID
  const home = options.home || `/home/${username}`;
  const shell = options.shell || '/bin/bash';

  const newUser = {
    username: username,
    uid: uid,
    gid: gid,
    home: home,
    shell: shell,
    groups: [username],
    isRoot: false
  };

  users[username] = newUser;

  // Also add a group with the same name (Linux default behavior)
  if (!groups[gid]) {
    groups[gid] = username;
  }

  return newUser;
}

/**
 * Remove a user from the system
 * @param {string} username - The username to remove
 * @returns {boolean} True if user was removed, false if not found
 */
export function removeUser(username) {
  if (!users[username]) {
    return false;
  }
  delete users[username];
  return true;
}

/**
 * Check if a user exists
 * @param {string} username - The username to check
 * @returns {boolean} True if user exists
 */
export function userExists(username) {
  return !!users[username];
}
