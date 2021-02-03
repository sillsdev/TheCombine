import { Hash } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "types/user";
import { getUser } from "backend";

export enum LocalStorageKey {
  Avatar = "avatar",
  MergeDupsBlacklist = "mergeDupsBlacklist",
  ProjectId = "projectId",
  User = "user",
}

// This function should only be used on Logout.
export function clearLocalStorage() {
  for (const keyString in LocalStorageKey) {
    const key = keyString as keyof typeof LocalStorageKey;
    remove(LocalStorageKey[key]);
  }
}

export function getAvatar(): string {
  return localStorage.getItem(LocalStorageKey.Avatar) || "";
}
export function setAvatar(src: string) {
  localStorage.setItem(LocalStorageKey.Avatar, src);
}

export function getCurrentUser(): User | undefined {
  const userString = localStorage.getItem(LocalStorageKey.User);
  return userString ? JSON.parse(userString) : undefined;
}
export function setCurrentUser(user: User) {
  const userString = JSON.stringify(user);
  localStorage.setItem(LocalStorageKey.User, userString);
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(LocalStorageKey.MergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}
export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(LocalStorageKey.MergeDupsBlacklist, blacklistString);
}

export function getProjectId(): string {
  return localStorage.getItem(LocalStorageKey.ProjectId) || "";
}
export function setProjectId(id: string) {
  localStorage.setItem(LocalStorageKey.ProjectId, id);
}

export function getUserId(): string {
  const user = getCurrentUser();
  return user ? user.id : "";
}

export function remove(localStorageKey: LocalStorageKey) {
  localStorage.removeItem(localStorageKey);
}

// Update user in LocalStorage from backend.
export async function updateUser(userId?: string) {
  const currentUserId = userId ? userId : getUserId();
  if (currentUserId) {
    await getUser(currentUserId).then((user) => setCurrentUser(user));
  }
}
