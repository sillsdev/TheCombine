import React, { useEffect, useState } from "react";

import BarChartComp from "./BarChartComponent";
import LineChartComponent from "./LineChartComponent";
import { ChartTimestampNode } from "api";
import { GetChartTimestampNodeCounts } from "backend";

export enum chartTypeEnum {
  BarChart = "BAR",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: chartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [barChartList, setBarChartList] = useState<ChartTimestampNode[]>([]);
  const [chartType, setChartType] = useState<chartTypeEnum>(props.chartType);

  useEffect(() => {
    const updateBarChartList = async () => {
      const list = await GetChartTimestampNodeCounts(props.currentProjectId);
      if (list != undefined) {
        return setBarChartList(list);
      }
    };

    updateBarChartList();
  }, [props.currentProjectId]);

  return (
    <React.Fragment>
      {chartType === chartTypeEnum.BarChart && (
        <BarChartComp chartNodeList={barChartList} />
      )}
      {chartType === chartTypeEnum.BarChart && (
        <LineChartComponent chartNodeList={barChartList} />
      )}
    </React.Fragment>
  );
}
