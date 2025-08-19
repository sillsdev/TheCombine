// Chrome silently converts non-ASCII characters in a Textfield of type="email".
// Use punycode.toUnicode() to convert them from punycode back to Unicode.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const punycode = require("punycode/");

export function meetsPasswordRequirements(password: string): boolean {
  return password.length >= 8;
}

export function meetsUsernameRequirements(username: string): boolean {
  return username.length >= 3;
}

/** Text field of type="email" silently converted its input from Unicode to punycode.
This function trims whitespace, and converts to normalized Unicode. */
export function normalizeEmail(email: string): string {
  return punycode.toUnicode(email.trim()).normalize("NFC");
}
