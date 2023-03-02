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

import { ChartTimestampNode } from "api";

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
  chartNodeList: ChartTimestampNode[];
}

interface DatasetsProps {
  label: string;
  data: Array<number>;
  borderColor: string;
  backgroundColor: string;
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
    var palette: chroma.Color[];
    if (props.chartNodeList.length) {
      palette = distinctColors({
        count:
          Object.keys(props.chartNodeList[0].userNameCountDictionary).length +
          1,
      });
      const updateLineChartData = () => {
        props.chartNodeList.forEach((element) => {
          LineChartNode.labels.push(element.shortDateString);
          if (LineChartNode.datasets.length == 0) {
            let totalDay = 0;
            let colorIndex = 0;
            for (const key in element.userNameCountDictionary) {
              const value = element.userNameCountDictionary[key];
              totalDay += value;
              LineChartNode.datasets.push({
                label: key,
                data: [value],
                borderColor: palette[colorIndex].hex().toString(),
                backgroundColor: palette[colorIndex++].hex().toString(),
              });
            }
            LineChartNode.datasets.push({
              label: "Total",
              data: [totalDay],
              borderColor: palette[colorIndex].hex().toString(),
              backgroundColor: palette[colorIndex++].hex().toString(),
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
      updateLineChartData();
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
          beginAtZero: true,
        },
      },
    });
  }, [props]);

  return <Line data={chartData} options={chartOptions} />;
}
