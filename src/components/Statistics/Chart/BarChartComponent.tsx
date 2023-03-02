import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import distinctColors from "distinct-colors";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import { ChartTimestampNode } from "api";

ChartJS.defaults.font.size = 18;
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  chartNodeList: ChartTimestampNode[];
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

export default function BarChartComponent(props: ChartProps) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<BarChartNodeProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    var barChartNode: BarChartNodeProps = {
      labels: [],
      datasets: [],
    };
    var palette: chroma.Color[];
    if (props.chartNodeList.length) {
      palette = distinctColors({
        count: Object.keys(props.chartNodeList[0].userNameCountDictionary)
          .length,
      });
      const updateBarChartData = () => {
        props.chartNodeList.forEach((element) => {
          barChartNode.labels.push(element.shortDateString);
          if (barChartNode.datasets.length == 0) {
            let colorIndex = 0;
            for (const key in element.userNameCountDictionary) {
              const value = element.userNameCountDictionary[key];
              barChartNode.datasets.push({
                label: key,
                data: [value],
                backgroundColor: palette[colorIndex++].hex().toString(),
              });
            }
          } else {
            for (const key in element.userNameCountDictionary) {
              const value = element.userNameCountDictionary[key];
              barChartNode.datasets
                .find((t) => t.label === key)
                ?.data.push(value);
            }
          }
        });

        return setChartData(barChartNode);
      };
      updateBarChartData();
    }
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
  }, [props]);

  return <Bar data={chartData} options={chartOptions} />;
}
