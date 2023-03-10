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

import { WordsPerDayUserChartJSCount } from "api";

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
  chartNodeList: WordsPerDayUserChartJSCount[];
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
  borderColor: string;
  backgroundColor: string;
}

interface LineChartDataProps {
  labels: Array<string>;
  datasets: Array<DatasetsProps>;
}

export default function LineChartComponent(props: LineChartProps) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<LineChartDataProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    var LineChartData: LineChartDataProps = {
      labels: [],
      datasets: [],
    };
    // Get array of unique Color
    var palette: chroma.Color[];
    if (props.chartNodeList.length) {
      palette = distinctColors({
        count:
          Object.keys(props.chartNodeList[0].userNameCountDictionary).length +
          1,
      });
      // Update chartData to LineChartData
    }

    // Line Chart Options
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Words Collected Per User Per Day",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    });
  }, [props]);

  return <Line data={chartData} options={chartOptions} />;
}
