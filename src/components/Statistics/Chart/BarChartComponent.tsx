import { BarChartTimestampNode } from "api";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.defaults.font.size = 18;
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  barChartNodeList: BarChartTimestampNode[];
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
  backgroundColor: string;
}

interface BarChartNodeProps {
  labels: Array<string>;
  datasets: Array<DatasetsProps>;
}

export default function BarChartComp(props: BarChartProps) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<BarChartNodeProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const generateColor = () => {
      const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
      return `#${randomColor}`;
    };

    var barChartNode: BarChartNodeProps = {
      labels: [],
      datasets: [],
    };
    const updateBarChartData = () => {
      props.barChartNodeList.forEach((element) => {
        barChartNode.labels.push(element.shortDateString);
        if (barChartNode.datasets.length == 0) {
          for (let key in element.userNameCountDictionary) {
            let value = element.userNameCountDictionary[key];
            barChartNode.datasets.push({
              label: key,
              data: [value],
              backgroundColor: generateColor(),
            });
          }
        } else {
          for (let key in element.userNameCountDictionary) {
            let value = element.userNameCountDictionary[key];
            barChartNode.datasets
              .find((t) => t.label === key)
              ?.data.push(value);
          }
        }
      });

      return setChartData(barChartNode);
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
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    });

    updateBarChartData();
  }, [props]);

  return <Bar data={chartData} options={chartOptions} />;
}
