import React, { useState } from "react";

import {
  getLineChartRootData,
  getProgressEstimationLineChartRoot,
} from "backend";
import LineChartComponent from "components/Statistics/Chart/LineChartComponent";

export enum ChartTypeEnum {
  LineChart = "LINE",
  Estimate = "ESTIMATE",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: ChartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [chartType] = useState<ChartTypeEnum>(props.chartType);

  return (
    <React.Fragment>
      {chartType === ChartTypeEnum.LineChart && (
        <LineChartComponent
          fetchData={() => getLineChartRootData(props.currentProjectId)}
        />
      )}
      {chartType === ChartTypeEnum.Estimate && (
        <LineChartComponent
          isFilterZero
          fetchData={() =>
            getProgressEstimationLineChartRoot(props.currentProjectId)
          }
        />
      )}
    </React.Fragment>
  );
}
