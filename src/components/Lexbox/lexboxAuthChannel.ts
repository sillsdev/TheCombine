/** Lets a Lexbox login completed in another window notify this one. */
const channelName = "lexbox-auth";

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
