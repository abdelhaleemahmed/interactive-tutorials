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
    groups: [1000],
    isRoot: false
  },
  'guest': {
    username: 'guest',
    uid: 1001,
    gid: 1001,
    home: '/home/guest',
    shell: '/bin/bash',
    groups: [1001],
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
 * @param {string} username - The username to switch to
 * @returns {boolean} True if successful, false if user doesn't exist
 */
export function setCurrentUser(username) {
  if (!users[username]) {
    return false;
  }
  currentUser = users[username];
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
