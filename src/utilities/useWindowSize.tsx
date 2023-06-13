import { useLayoutEffect, useState } from "react";

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
