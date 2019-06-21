/**
 * Returns authorization header with jwt token
 *
 * When making an axios request on a protected endpoint, include `{headers:authHeader()}`
 *
 * example: `axios.post("localhost:5001", data, { headers: authHeader()})`
 */
export function authHeader() {
  let userString = localStorage.getItem("user");
  let user = userString ? JSON.parse(userString) : null;

  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  } else {
    return {};
  }
}
