export default class Stack<T> {
  stack: T[] = [];

  constructor(t: T[]) {
    this.stack = t;
  }

  makeCopy() {
    let newStack = Object.assign([], this.stack);
    return new Stack<T>(newStack);
  }

  push(t: T) {
    this.stack.push(t);
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
