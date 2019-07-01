export function uuid(): string {
  let bytes = (count: number) => Math.floor(
    (1 + Math.random()) * (2 ** (count * 8 + 4)))
    .toString(16)
    .substring(1);
  return bytes(4) + '-' + bytes(2) + '-' + bytes(2) + '-' + bytes(2) + '-' + bytes(6);

}
