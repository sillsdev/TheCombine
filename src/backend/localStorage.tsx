import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";
import { getUser } from ".";

export enum localStorageKeys {
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
  userId = "userId",
  username = "username",
  userToken = "userToken",
  workedProjects = "workedProjects",
}

export function clearLocalStorage() {
  for (const key in localStorageKeys) {
    remove(key as localStorageKeys);
  }
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

export function getUsername(): string {
  return localStorage.getItem(localStorageKeys.username) || "";
}

export function getUserToken(): string {
  return localStorage.getItem(localStorageKeys.userToken) || "";
}

export function getWorkedProjects(): Hash<string> {
  const workedProjects = localStorage.getItem(localStorageKeys.workedProjects);
  return workedProjects ? JSON.parse(workedProjects) : {};
}

export function remove(localStorageKey: localStorageKeys) {
  localStorage.removeItem(localStorageKey);
}

export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function setProjectId(id: string) {
  if (id !== getProjectId()) remove(localStorageKeys.mergeDupsBlacklist);
  localStorage.setItem(localStorageKeys.projectId, id);
}

export function setUser(user: User) {
  setUserId(user.id);
  setUsername(user.username);
  setUserToken(user.token);
  setWorkedProjects(user.workedProjects);
}

export function setUserId(userId: string) {
  localStorage.setItem(localStorageKeys.userId, userId);
}

export function setUsername(username: string) {
  localStorage.setItem(localStorageKeys.username, username);
}

export function setUserToken(userToken: string) {
  localStorage.setItem(localStorageKeys.userToken, userToken);
}

export function setWorkedProjects(workedProjects: Hash<string>) {
  const workedProjectsString = JSON.stringify(workedProjects);
  localStorage.setItem(localStorageKeys.workedProjects, workedProjectsString);
}

export async function updateUser(userId?: string) {
  const currentUserId: string = userId ? userId : getUserId();
  if (currentUserId) {
    getUser(currentUserId).then((user: User) => setUser(user));
  }
}

export async function updateWorkedProjects() {
  const userId = getUserId();
  if (userId) {
    getUser(userId).then((user: User) =>
      setWorkedProjects(user.workedProjects)
    );
  }
}
