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
import {
  GetWordsPerDayUserChartJSCounts,
  GetWordsPerDayUserLineChartData,
} from "backend";

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
  currentProjectId: string;
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
  borderColor?: string;
  backgroundColor?: string;
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
    const updateBarChartList = async () => {
      var updateChartData: LineChartDataProps = {
        labels: [],
        datasets: [],
      };

      const chartData = await GetWordsPerDayUserLineChartData(
        props.currentProjectId
      );

      if (chartData != undefined) {
        // Get array of unique Color
        var palette: chroma.Color[];
        if (chartData.datasets.length) {
          palette = distinctColors({
            count: chartData.datasets.length,
          });
        }
        let colorIndex = 0;
        chartData.labels.forEach((e) => {
          updateChartData.labels.push(e);
        });
        chartData.datasets.forEach((e) => {
          e.backgroundColor = palette[colorIndex].hex().toString();
          e.borderColor = palette[colorIndex++].hex().toString();
          updateChartData.datasets.push(e);
        });
      }

      setChartData(updateChartData);
    };

    updateBarChartList();

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
