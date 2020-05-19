import { getCurrentUser } from "../../backend/localStorage";

/**
 * Returns authorization header with JWT token.
 *
 * When making an axios request on a protected endpoint, include
 * `{ headers:authHeader() }`
 *
 * example: `axios.post("localhost:5001", data, { headers: authHeader() })`
 */
export function authHeader() {
  let user = getCurrentUser();
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  } else {
    return {};
  }
}
