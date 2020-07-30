import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";

export enum localStorageKeys {
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
  userId = "userId",
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(localStorageKeys.mergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}

export function getProjectId(): string {
  return localStorage.getItem(localStorageKeys.projectId) || "";
}

export function getUserId(): string {
  return localStorage.getItem(localStorageKeys.userId) || "";
}

export function remove(localStorageKey: localStorageKeys) {
  localStorage.removeItem(localStorageKey);
}

export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function setProjectId(id: string) {
  if (id != getProjectId()) remove(localStorageKeys.mergeDupsBlacklist);
  localStorage.setItem(localStorageKeys.projectId, id);
}

export function setUserId(userId: string) {
  localStorage.setItem(localStorageKeys.userId, userId);
}
