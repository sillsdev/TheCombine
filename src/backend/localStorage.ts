import { User } from "api/models";

export enum LocalStorageKey {
  Avatar = "avatar",
  ClosedBanner = "closedBanner",
  ProjectId = "projectId",
  User = "user",
}

// This function should only be used on Logout.
export function clearLocalStorage(): void {
  for (const keyString in LocalStorageKey) {
    const key = keyString as keyof typeof LocalStorageKey;
    remove(LocalStorageKey[key]);
  }
}

export function getAvatar(): string {
  return localStorage.getItem(LocalStorageKey.Avatar) || "";
}
export function setAvatar(src: string): void {
  localStorage.setItem(LocalStorageKey.Avatar, src);
}

export function getClosedBanner(): string {
  return localStorage.getItem(LocalStorageKey.ClosedBanner) || "";
}
export function setClosedBanner(src: string): void {
  localStorage.setItem(LocalStorageKey.ClosedBanner, src);
}

export function getCurrentUser(): User | undefined {
  const userString = localStorage.getItem(LocalStorageKey.User);
  return userString ? JSON.parse(userString) : undefined;
}
export function setCurrentUser(user: User): void {
  const userString = JSON.stringify(user);
  localStorage.setItem(LocalStorageKey.User, userString);
}

export function getProjectId(): string {
  return localStorage.getItem(LocalStorageKey.ProjectId) || "";
}
export function setProjectId(id = ""): void {
  localStorage.setItem(LocalStorageKey.ProjectId, id);
}

export function getUserId(): string {
  const user = getCurrentUser();
  return user ? user.id : "";
}

export function remove(localStorageKey: LocalStorageKey): void {
  localStorage.removeItem(localStorageKey);
}
