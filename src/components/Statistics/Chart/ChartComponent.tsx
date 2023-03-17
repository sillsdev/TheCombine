import React, { useState } from "react";

import LineChartComponent from "./LineChartComponent";

export enum ChartTypeEnum {
  LineChart = "Line",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: ChartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [chartType, setChartType] = useState<ChartTypeEnum>(props.chartType);

  return (
    <React.Fragment>
      {chartType === ChartTypeEnum.LineChart && (
        <LineChartComponent currentProjectId={props.currentProjectId} />
      )}
    </React.Fragment>
  );
}
