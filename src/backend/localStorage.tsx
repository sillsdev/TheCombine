import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";
import { getUser } from ".";

export enum localStorageKeys {
  avatar = "avatar",
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
  user = "user",
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
export function setAvatar(src: string) {
  localStorage.setItem(localStorageKeys.avatar, src);
}

export function getCurrentUser(): User | null {
  const userString: string | null = localStorage.getItem(localStorageKeys.user);
  return userString ? JSON.parse(userString) : null;
}
export function setCurrentUser(user: User) {
  const userString: string = JSON.stringify(user);
  localStorage.setItem(localStorageKeys.user, userString);
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(localStorageKeys.mergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}
export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function getProjectId(): string {
  return localStorage.getItem(localStorageKeys.projectId) || "";
}
export function setProjectId(id: string) {
  localStorage.setItem(localStorageKeys.projectId, id);
}

export function getUserId(): string {
  const user: User | null = getCurrentUser();
  return user ? user.id : "";
}

export function remove(localStorageKey: localStorageKeys) {
  localStorage.removeItem(localStorageKey);
}

// Update user in LocalStorage from backend.
export async function updateUser(userId?: string) {
  const currentUserId: string = userId ? userId : getUserId();
  if (currentUserId) {
    await getUser(currentUserId).then((user: User) => setCurrentUser(user));
  }
}
