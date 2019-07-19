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
  let bytes = (count: number) =>
    Math.floor((1 + Math.random()) * 2 ** (count * 8 + 4))
      .toString(16)
      .substring(1);
  return (
    bytes(4) + "-" + bytes(2) + "-" + bytes(2) + "-" + bytes(2) + "-" + bytes(6)
  );
}

export function randElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

//quicksort implmentation O(n log n)
export function quicksort<T>(arr: T[], score: (item: T) => number): T[] {
  if (arr.length <= 1) return arr;

  let pivotIndex = 0;
  let pivot = arr[0];

  let less = [];
  let greater = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== pivotIndex) {
      score(arr[i]) > score(pivot) ? greater.push(arr[i]) : less.push(arr[i]);
    }
  }

  return [...quicksort(less, score), pivot, ...quicksort(greater, score)];
}
