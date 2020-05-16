import { User } from "../types/user";

/**
 * Gets the current user from local storage.
 */
export function getUser(): User | null {
  const user: string | null = localStorage.getItem("user");
  if (user != null) {
    return JSON.parse(user);
  }
  return null;
}

export function setProjectID(id: string) {
  localStorage.setItem("projectId", id);
}

export function getProjectId(): string {
  return localStorage.getItem("projectId") || "";
}
