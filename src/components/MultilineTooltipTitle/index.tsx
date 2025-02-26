import { ReactElement } from "react";

export default function MultilineTooltipTitle(props: {
  lines: string[];
}): ReactElement {
  return <div style={{ whiteSpace: "pre-line" }}>{props.lines.join("\n")}</div>;
}
