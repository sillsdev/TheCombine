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
import autocolors from "chartjs-plugin-autocolors";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import { ChartTimestampNode } from "api";

ChartJS.defaults.font.size = 18;
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  autocolors
);

interface LineChartProps {
  chartNodeList: ChartTimestampNode[];
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
}

interface LineChartNodeProps {
  labels: Array<string>;
  datasets: Array<DatasetsProps>;
}

export default function LineChartComponent(props: LineChartProps) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<LineChartNodeProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    var LineChartNode: LineChartNodeProps = {
      labels: [],
      datasets: [],
    };
    const updateLineChartData = () => {
      props.chartNodeList.forEach((element) => {
        LineChartNode.labels.push(element.shortDateString);
        if (LineChartNode.datasets.length == 0) {
          let totalDay = 0;
          for (const key in element.userNameCountDictionary) {
            const value = element.userNameCountDictionary[key];
            totalDay += value;
            LineChartNode.datasets.push({
              label: key,
              data: [value],
            });
          }
          LineChartNode.datasets.push({
            label: "Total",
            data: [totalDay],
          });
        } else {
          let totalDay = 0;
          for (const key in element.userNameCountDictionary) {
            const value = element.userNameCountDictionary[key];
            totalDay += value;
            LineChartNode.datasets
              .find((t) => t.label === key)
              ?.data.push(value);
          }
          LineChartNode.datasets
            .find((t) => t.label === "Total")
            ?.data.push(totalDay);
        }
      });

      return setChartData(LineChartNode);
    };
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Word Collected Per User Per Day",
        },
        autocolors: {
          enabled: true,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    });

    updateLineChartData();
  }, [props]);

  return <Line data={chartData} options={chartOptions} />;
}
