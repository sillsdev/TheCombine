import { match } from "css-mediaquery";
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

/** Call before rendering to allow `useMediaQuery` to work.
 *  (Also need components wrapped in a `<ThemeProvider>`.)
 *  Modified from mui.com/material-ui/react-use-media-query/#testing */
export function setMatchMedia(width?: number): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: match(query, { width: width ?? window.innerWidth }),
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    }) as any;
}
