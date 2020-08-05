import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";
import { getUser } from ".";

export enum localStorageKeys {
  avatar = "avatar",
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
  token = "token",
  user = "user",
  userId = "userId",
}

// This function should only be used on Logout.
export function clearLocalStorage() {
  for (const key in localStorageKeys) {
    remove(key as localStorageKeys);
  }
}

export function getAvatar(): string {
  return localStorage.getItem(localStorageKeys.avatar) || "";
}

export function getCurrentUser(): User | undefined {
  const userString: string | null = localStorage.getItem(localStorageKeys.user);
  if (userString) {
    return JSON.parse(userString);
  }
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(localStorageKeys.mergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}

export function getProjectId(): string {
  return localStorage.getItem(localStorageKeys.projectId) || "";
}

export function getToken(): string {
  return localStorage.getItem(localStorageKeys.token) || "";
}

export function getUserId(): string {
  return localStorage.getItem(localStorageKeys.userId) || "";
}

export function remove(localStorageKey: localStorageKeys) {
  localStorage.removeItem(localStorageKey);
}

export function setAvatar(src: string) {
  localStorage.setItem(localStorageKeys.avatar, src);
}

// Since avatar, password, and token are not returned with Backend's GetUser,
// we can't expect them in what we are saving to localStorage.
export function setCurrentUser(user: User) {
  const userString: string = JSON.stringify(user);
  localStorage.setItem(localStorageKeys.user, userString);
  setUserId(user.id);
}

export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function setProjectId(id: string) {
  if (id !== getProjectId()) remove(localStorageKeys.mergeDupsBlacklist);
  localStorage.setItem(localStorageKeys.projectId, id);
}

export function setToken(token: string) {
  localStorage.setItem(localStorageKeys.token, token);
}

// You generally don't want to use this on its own,
// but rather setCurrentUser(user) or updateUser(userId),
// to assure user and userId aren't out of sync
export function setUserId(userId: string) {
  localStorage.setItem(localStorageKeys.userId, userId);
}

export async function updateUser(userId?: string) {
  const currentUserId: string = userId ? userId : getUserId();
  if (currentUserId) {
    getUser(currentUserId).then((user: User) => setCurrentUser(user));
  }
}
