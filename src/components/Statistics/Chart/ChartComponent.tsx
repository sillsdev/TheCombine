import { BarChartTimestampNode } from "api";
import React, { useEffect, useState } from "react";
import { GetBarChartTimestampNodeCounts } from "backend";
import BarChartComp from "./BarChartComponent";

export enum chartTypeEnum {
  BarChart = "BAR",
  otherChart = "TBD",
}

interface BarChartProps {
  currentProjectId: string;
  chartType: chartTypeEnum;
}

export default function ChartComponent(props: BarChartProps) {
  const [barChartList, setBarChartList] = useState<BarChartTimestampNode[]>([]);
  const [chartType, setChartType] = useState<chartTypeEnum>(props.chartType);

  useEffect(() => {
    const updateBarChartList = async () => {
      const list = await GetBarChartTimestampNodeCounts(props.currentProjectId);
      if (list != undefined) {
        return setBarChartList(list);
      }
    };

    updateBarChartList();
  }, [props.currentProjectId]);

  return (
    <React.Fragment>
      {chartType === chartTypeEnum.BarChart && (
        <BarChartComp barChartNodeList={barChartList} />
      )}
    </React.Fragment>
  );
}
