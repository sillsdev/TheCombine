import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";
import { getUser } from ".";

export enum LocalStorageKey {
  Avatar = "avatar",
  MergeDupsBlacklist = "mergeDupsBlacklist",
  ProjectId = "projectId",
  User = "user",
}

// This function should only be used on Logout.
export function clearLocalStorage() {
  for (const key in LocalStorageKey) {
    remove(key as LocalStorageKey);
  }
}

export function getAvatar(): string {
  return localStorage.getItem(LocalStorageKey.Avatar) || "";
}
export function setAvatar(src: string) {
  localStorage.setItem(LocalStorageKey.Avatar, src);
}

export function getCurrentUser(): User | null {
  const userString: string | null = localStorage.getItem(LocalStorageKey.User);
  return userString ? JSON.parse(userString) : null;
}
export function setCurrentUser(user: User) {
  const userString: string = JSON.stringify(user);
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
  const user: User | null = getCurrentUser();
  return user ? user.id : "";
}

export function remove(localStorageKey: LocalStorageKey) {
  localStorage.removeItem(localStorageKey);
}

// Update user in LocalStorage from backend.
export async function updateUser(userId?: string) {
  const currentUserId: string = userId ? userId : getUserId();
  if (currentUserId) {
    await getUser(currentUserId).then((user: User) => setCurrentUser(user));
  }
}
