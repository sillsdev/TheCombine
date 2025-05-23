import { ReactElement } from "react";

interface DownBraceProps {
  backgroundColor?: string;
  color?: string;
  height: number;
  width: number;
}

export default function DownBrace(props: DownBraceProps): ReactElement {
  const color = props.color ?? "#C6CACC";
  const height = 16;
  const wScaled = props.width * (height / props.height);
  const wEnd = 9;
  const wMid = 16;
  const wRequired = 2 * wEnd + wMid;
  const wBar = Math.max(0, wScaled - wRequired) / 2;
  const width = wRequired + 2 * wBar;

  return (
    <svg
      height={props.height}
      preserveAspectRatio="none" // In case wRequired > wScaled
      viewBox={`0 0 ${width} ${height}`}
      width={props.width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect
        fill={props.backgroundColor ?? "white"}
        height={height}
        width={width}
      />

      {/* Endcap */}
      <g fill={color}>
        <path d="M2 16C2.03757 10.5664 4.2842 8.95611 9 9.00001L9 7C2.08822 7.03228 0.71149 8.74186 0 16L2 16Z" />
      </g>

      {/* Bar */}
      <g fill={color} transform={`translate(${wEnd})`}>
        <rect height={2} width={wBar} y={7} />
      </g>

      {/* Middle */}
      <g fill={color} transform={`translate(${wEnd + wBar})`}>
        <path d="M10 0C10.0376 5.4336 11.2842 7.04389 16 6.99999L16 9C9.08822 8.96772 6.7115 7.25814 6 0L10 0Z" />
        <path d="M6 0C5.96243 5.4336 4.71577 7.04389 0 6.99999L0 9C6.91178 8.96772 9.2885 7.25814 10 0L6 0Z" />
      </g>

      {/* Bar */}
      <g fill={color} transform={`translate(${wEnd + wBar + wMid})`}>
        <rect height={2} width={wBar} y={7} />
      </g>

      {/* Endcap */}
      <g fill={color} transform={`translate(${wEnd + wBar + wMid + wBar})`}>
        <path d="M7 16C6.96243 10.5664 4.71577 8.95611 0 9.00001L0 7C6.91178 7.03228 8.28851 8.74186 9 16L7 16Z" />
      </g>
    </svg>
  );
}
