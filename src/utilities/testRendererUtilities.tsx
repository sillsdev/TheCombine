import { type ReactTestInstance } from "react-test-renderer";

/** Checks if any node in the given `react-test-renderer` instance has the given text. */
export function testInstanceHasText(
  instance: ReactTestInstance,
  text: string
): boolean {
  return (
    instance.findAll(
      (node) => node.children.length === 1 && node.children[0] === text
    ).length > 0
  );
}
