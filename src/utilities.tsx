/*
 * This generates a UUID. A UUID is a 16 byte number.
 * A UUID is written in hex with dashes after 4, 2, 2, 2, and 6 bytes.
 *
 * Typescript doesn't have a particularly clean syntax for padding a string
 * with zeros to a fixed length. So instead we are generating a number with a
 * leading 1 before the information we are interested in. Instead of 0042 we are
 * generating 10042 and then taking the substring 1[0042].
 */

export function uuid(): string {
  let bytes = (count: number) => Math.floor(
    (1 + Math.random()) * (2 ** (count * 8 + 4)))
    .toString(16)
    .substring(1);
  return bytes(4) + '-' + bytes(2) + '-' + bytes(2) + '-' + bytes(2) + '-' + bytes(6);

}

export function randElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
