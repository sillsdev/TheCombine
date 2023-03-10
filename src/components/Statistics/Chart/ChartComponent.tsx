import React, { useEffect, useState } from "react";

import LineChartComponent from "./LineChartComponent";
import { WordsPerDayUserChartJSCount } from "api";
import { GetWordsPerDayUserChartJSCounts } from "backend";

export enum ChartTypeEnum {
  LineChart = "Line",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: ChartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [chartList, setChartList] = useState<WordsPerDayUserChartJSCount[]>([]);
  const [chartType, setChartType] = useState<ChartTypeEnum>(props.chartType);

  console.log(chartList);

  useEffect(() => {
    const updateBarChartList = async () => {
      const list = await GetWordsPerDayUserChartJSCounts(
        props.currentProjectId
      );
      if (list != undefined) {
        return setChartList(list);
      }
    };

    updateBarChartList();
  }, [props.currentProjectId]);

  return (
    <React.Fragment>
      {chartType === ChartTypeEnum.LineChart && (
        <LineChartComponent chartNodeList={chartList} />
      )}
    </React.Fragment>
  );
}
