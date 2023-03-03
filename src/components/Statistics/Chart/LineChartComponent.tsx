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
      // Update the LineCharNode
      const updateLineChartData = () => {
        props.chartNodeList.forEach((element) => {
          LineChartData.labels.push(element.shortDateString);
          // Create DatasetsProps If have not created yet for LineChartData
          if (LineChartData.datasets.length == 0) {
            let totalDay = 0;
            let colorIndex = 0;
            for (const key in element.userNameCountDictionary) {
              const value = element.userNameCountDictionary[key];
              totalDay += value;
              LineChartData.datasets.push({
                label: key,
                data: [value],
                borderColor: palette[colorIndex].hex().toString(),
                backgroundColor: palette[colorIndex++].hex().toString(),
              });
            }
            // Add a extra total element
            LineChartData.datasets.push({
              label: "Total",
              data: [totalDay],
              borderColor: palette[colorIndex].hex().toString(),
              backgroundColor: palette[colorIndex++].hex().toString(),
            });
          } else {
            // Update data if DatasetsProps exist
            let totalDay = 0;
            for (const key in element.userNameCountDictionary) {
              const value = element.userNameCountDictionary[key];
              totalDay += value;
              LineChartData.datasets
                .find((t) => t.label === key)
                ?.data.push(value);
            }
            LineChartData.datasets
              .find((t) => t.label === "Total")
              ?.data.push(totalDay);
          }
        });
        // Update chartData to LineChartData
        return setChartData(LineChartData);
      };
      updateLineChartData();
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
