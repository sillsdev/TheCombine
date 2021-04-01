export function passwordRequirements(password: string): boolean {
  return password.length >= 8;
}

export function usernameRequirements(username: string): boolean {
  return username.length >= 3;
}

export function randElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomIntString(): string {
  return Math.floor(Math.random() * 9999999).toString();
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

export function getNowDateTimeString() {
  const now = new Date(Date.now());
  const vals = [
    now.getFullYear(),
    // Date.getMonth() starts at 0 for January.
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ];
  const strs = vals.map((value) => (value < 10 ? `0${value}` : `${value}`));
  return `${strs.slice(0, 3).join("-")}_${strs.slice(3, 6).join("-")}`;
}
