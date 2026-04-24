export enum SessionStorageKey {
  SessionId = "sessionId",
}

/** Gets the current session id, generating and setting a new one if not one already. */
export function getSessionId(): string {
  let id = sessionStorage.getItem(SessionStorageKey.SessionId);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SessionStorageKey.SessionId, id);
  }
  return id;
}
