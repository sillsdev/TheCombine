import { ReactElement, ReactNode } from "react";

interface OverlayProps {
  children?: ReactNode;
  on?: boolean;
}

export default function Overlay(props: OverlayProps): ReactElement {
  return (
    <div
      style={
        props.on ? { backgroundColor: "white", opacity: 0.4, zIndex: 9 } : {}
      }
    >
      {props.children}
    </div>
  );
}
