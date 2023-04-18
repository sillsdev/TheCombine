import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import LineChartComponent from "./LineChartComponent";
import {
  getLineChartRootData,
  getProgressEstimationLineChartRoot,
} from "backend";

export enum ChartTypeEnum {
  LineChart = "Line",
  Estimate = "Estimate",
  otherChart = "TBD",
}

interface ChartProps {
  currentProjectId: string;
  chartType: ChartTypeEnum;
}

export default function ChartComponent(props: ChartProps) {
  const [chartType, setChartType] = useState<ChartTypeEnum>(props.chartType);
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {chartType === ChartTypeEnum.LineChart && (
        <LineChartComponent
          titleText={t("statistics.wordsPerDay")}
          isFilterZero={false}
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
