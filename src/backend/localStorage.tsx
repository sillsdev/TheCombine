import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";

enum localStorageKeys {
  user = "user",
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem(localStorageKeys.user);
  return user ? JSON.parse(user) : null;
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(localStorageKeys.mergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}

export function getProjectId(): string {
  return localStorage.getItem(localStorageKeys.projectId) || "";
}

export function removeCurrentUser() {
  localStorage.removeItem(localStorageKeys.user);
}

export function removeProjectId() {
  localStorage.removeItem(localStorageKeys.projectId);
}

export function setCurrentUser(user: User) {
  const userString = JSON.stringify(user);
  localStorage.setItem(localStorageKeys.user, userString);
}

export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function setProjectId(id: string) {
  localStorage.setItem(localStorageKeys.projectId, id);
}
