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

import {
  getLineChartRootData,
  getProgressEstimationLineChartRoot,
} from "backend";
import React from "react";

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
  const [tempDate, setTempDate] = useState<LineChartDataProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const updateBarChartList = async () => {
      var updateChartData: LineChartDataProps = {
        labels: [],
        datasets: [],
      };

      const chartData = await getLineChartRootData(props.currentProjectId);

      if (chartData != undefined) {
        // Get array of unique Color
        var palette: chroma.Color[];
        if (chartData.datasets.length) {
          palette = distinctColors({
            count: chartData.datasets.length,
          });
        }
        let colorIndex = 0;
        // Update the updateChartData by retrieve
        chartData.dates.map((e) => {
          updateChartData.labels.push(e);
        });
        chartData.datasets.forEach((e) => {
          updateChartData.datasets.push({
            label: e.userName,
            data: e.data,
            borderColor: palette[colorIndex].hex().toString(),
            backgroundColor: palette[colorIndex++].hex().toString(),
          });
        });
      }

      const tempDate = await getProgressEstimationLineChartRoot(
        props.currentProjectId
      );
      var updateChartData2222: LineChartDataProps = {
        labels: [],
        datasets: [],
      };
      if (tempDate != undefined) {
        // Get array of unique Color
        var palette: chroma.Color[];
        if (tempDate.datasets.length) {
          palette = distinctColors({
            count: tempDate.datasets.length,
          });
        }
        let colorIndex = 0;
        // Update the updateChartData by retrieve
        tempDate.dates.map((e) => {
          updateChartData2222.labels.push(e);
        });
        tempDate.datasets.forEach((e) => {
          updateChartData2222.datasets.push({
            label: e.userName,
            data: e.data,
            borderColor: palette[colorIndex].hex().toString(),
            backgroundColor: palette[colorIndex++].hex().toString(),
          });
        });
      }
      setChartData(updateChartData);
      setTempDate(updateChartData2222);
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

  console.log(tempDate);

  return (
    <React.Fragment>
      <Line data={chartData} options={chartOptions} />
      <Line data={tempDate} options={chartOptions} />
    </React.Fragment>
  );
}
