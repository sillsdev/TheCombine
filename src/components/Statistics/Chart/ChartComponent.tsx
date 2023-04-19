import React, { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {chartType === ChartTypeEnum.LineChart && (
        <LineChartComponent
          titleText={t("statistics.wordsPerDay")}
          fetchData={() => getLineChartRootData(props.currentProjectId)}
        />
      )}
      {chartType === ChartTypeEnum.Estimate && (
        <LineChartComponent
          titleText={t("statistics.workshopSchedule")}
          isFilterZero
          fetchData={() =>
            getProgressEstimationLineChartRoot(props.currentProjectId)
          }
        />
      )}
    </React.Fragment>
  );
}
