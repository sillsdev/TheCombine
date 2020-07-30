import { User } from "../types/user";

/**
 * Gets the current user from local storage.
 */
export function getCurrentUser(): User | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setProjectId(id: string) {
  localStorage.setItem("projectId", id);
}

export function getProjectId(): string {
  return localStorage.getItem("projectId") || "";
}

export function setAvatar(src: string) {
  localStorage.setItem("avatar", src);
}

export function getAvatar(): string {
  return localStorage.getItem("avatar") || "";
}
