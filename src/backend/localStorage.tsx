import { User } from "../types/user";

/**
 * Gets the current user from local storage.
 */
export function getUser(): User | null {
  const user: string | null = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setProjectID(id: string) {
  localStorage.setItem("projectId", id);
}

export function getProjectId(): string {
  return localStorage.getItem("projectId") || "";
}
