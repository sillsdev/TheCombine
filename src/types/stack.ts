export class Stack<T> {
  stack: T[] = [];

  constructor(t: T[]) {
    this.stack = t;
  }

  push(t: T): Stack<T> {
    this.stack.push(t);
    return this; // return a new copy instead?
  }

  pop(): T | undefined {
    let tR: any = this.stack.pop();
    if (tR != undefined) return tR;
  }

  peek(): T | undefined {
    let last = this.stack.length - 1;
    if (last >= 0) return this.stack[last];
  }

  peekFirst(): T {
    return this.stack[0];
  }

  size(): number {
    return this.stack.length;
  }
}
