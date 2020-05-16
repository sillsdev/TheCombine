import { User } from "../types/user";

export function getUserFromLocalStorage(): User | null {
  const user: string | null = localStorage.getItem("user");
  if (user != null) {
    return JSON.parse(user);
  }
  return null;
}
