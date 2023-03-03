import React, { useEffect, useState } from "react";

import LineChartComponent from "./LineChartComponent";
import { WordsPerDayUserChartJSCount } from "api";
import { GetWordsPerDayUserChartJSCounts } from "backend";

export enum chartTypeEnum {
  LineChart = "Line",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: chartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [barChartList, setBarChartList] = useState<
    WordsPerDayUserChartJSCount[]
  >([]);
  const [chartType, setChartType] = useState<chartTypeEnum>(props.chartType);

  useEffect(() => {
    const updateBarChartList = async () => {
      const list = await GetWordsPerDayUserChartJSCounts(
        props.currentProjectId
      );
      if (list != undefined) {
        return setBarChartList(list);
      }
    };

    updateBarChartList();
  }, [props.currentProjectId]);

  return (
    <React.Fragment>
      {chartType === chartTypeEnum.LineChart && (
        <LineChartComponent chartNodeList={barChartList} />
      )}
    </React.Fragment>
  );
}
