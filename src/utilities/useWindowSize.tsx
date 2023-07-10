import { useLayoutEffect, useState } from "react";

export function useWindowSize(): { windowHeight: number; windowWidth: number } {
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  const updateWindowSize = () => {
    // Check documentElement to account for a scrollbar.
    const { clientHeight, clientWidth } = document.documentElement;
    const { innerHeight, innerWidth } = window;
    setWindowHeight(
      clientHeight ? Math.min(clientHeight, innerHeight) : innerHeight
    );
    setWindowWidth(
      clientWidth ? Math.min(clientWidth, innerWidth) : innerWidth
    );
  };

  useLayoutEffect(() => {
    updateWindowSize();
    addEventListener("resize", updateWindowSize);
    return () => removeEventListener("resize", updateWindowSize);
  }, []);

  return { windowHeight, windowWidth };
}
