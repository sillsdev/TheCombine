import { useLayoutEffect, useState } from "react";

/***
 * Custom hook for getting a component to update when the window size changes.
 * Use when the xs/sm/md/lg/xl breakpoints with components like Grid and Hidden are insufficient.
 */
export function useWindowSize(): { windowHeight: number; windowWidth: number } {
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  const updateWindowSize = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  };

  useLayoutEffect(() => {
    updateWindowSize();
    addEventListener("resize", updateWindowSize);
    return () => removeEventListener("resize", updateWindowSize);
  }, []);

  return { windowHeight, windowWidth };
}
