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
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import { getProgressEstimationLineChartRoot } from "backend";

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
  tension: 0.4;
  fill: false;
  cubicInterpolationMode: "monotone";
}

interface LineChartDataProps {
  labels: Array<string>;
  datasets: Array<DatasetsProps>;
}

export default function EstimateComponent(props: LineChartProps) {
  const [chartOptions, setChartOptions] = useState({});
  const [estimateDate, setEstimateDate] = useState<LineChartDataProps>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const updateChartList = async () => {
      const tempDate = await getProgressEstimationLineChartRoot(
        props.currentProjectId
      );
      var updateEstimateDate: LineChartDataProps = {
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
          // trim the format from year-mm-dd to mm-dd
          updateEstimateDate.labels.push(e.slice(-5));
        });
        tempDate.datasets.forEach((e) => {
          updateEstimateDate.datasets.push({
            label: e.userName,
            data: e.data,
            borderColor: palette[colorIndex].hex().toString(),
            backgroundColor: palette[colorIndex++].hex().toString(),
            tension: 0.4,
            fill: false,
            cubicInterpolationMode: "monotone",
          });
        });
      }
      setEstimateDate(updateEstimateDate);
    };

    updateChartList();

    // Line Chart Options
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Workshop Estimate",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    });
  }, [props]);

  return (
    <React.Fragment>
      <Line data={estimateDate} options={chartOptions} />
    </React.Fragment>
  );
}
