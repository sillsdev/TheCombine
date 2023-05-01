import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import distinctColors from "distinct-colors";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { ChartRootData } from "api";

ChartJS.defaults.font.size = 18;
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  isFilterZero?: boolean;
  fetchData: () => Promise<ChartRootData | undefined>;
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
  borderColor?: string;
  backgroundColor?: string;
  tension: 0.4;
  fill: false;
  cubicInterpolationMode: "monotone";
}

interface LineChartDataProps {
  labels: Array<string>;
  datasets: Array<DatasetsProps>;
}

const getDefaultProps = (): LineChartDataProps => ({
  labels: [],
  datasets: [],
});

function FilteredData(numbers: number[]): number[] {
  return numbers.map((num) => (num ? num : NaN));
}

export default function LineChartComponent(props: LineChartProps) {
  const [chartData, setChartData] = useState(getDefaultProps());

  useEffect(() => {
    const updateChartList = async () => {
      const tempData = await props.fetchData();
      const newChartData = getDefaultProps();
      if (tempData) {
        // Get array of unique Color
        const palette = distinctColors({ count: tempData.datasets.length });
        // Update the updateChartData by retrieve
        tempData.dates.map((e) => {
          // trim the format from year-mm-dd to mm-dd
          newChartData.labels.push(e.slice(-5));
        });
        tempData.datasets.forEach((e, index) => {
          newChartData.datasets.push({
            label: e.userName,
            data: props.isFilterZero ? FilteredData(e.data) : e.data,
            borderColor: palette[index].hex().toString(),
            backgroundColor: palette[index].hex().toString(),
            tension: 0.4,
            fill: false,
            cubicInterpolationMode: "monotone",
          });
        });
      }
      setChartData(newChartData);
    };

    updateChartList();
  }, [props]);

  const { t } = useTranslation();
  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { title: { display: true, text: t("statistics.axisLabel.date") } },
      y: { title: { display: true, text: t("statistics.axisLabel.words") } },
    },
  } as any;

  return <Line data={chartData} options={chartOptions} />;
}
