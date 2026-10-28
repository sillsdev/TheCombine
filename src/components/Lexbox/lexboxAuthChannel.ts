/** Lets a Lexbox login completed in another window notify this one. */
const channelName = "lexbox-auth";

/** Tells other windows that a Lexbox login completed. */
export function notifyLexboxLogin(): void {
  if (typeof BroadcastChannel === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(channelName);
  channel.postMessage("login");
  channel.close();
}

/** Calls `onLogin` whenever another window reports a Lexbox login.
 * Returns a function that stops listening. */
export function listenForLexboxLogin(onLogin: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(channelName);
  channel.onmessage = () => onLogin();
  return () => channel.close();
}
