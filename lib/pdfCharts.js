import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800;
const height = 400;

const chartCanvas = new ChartJSNodeCanvas({ width, height });

export async function generateLineChart(data) {
  const configuration = {
    type: "line",
    data: {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: "Earnings",
          data: data.map((d) => d.amount),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.2)",
          tension: 0.4,
        },
      ],
    },
  };

  return await chartCanvas.renderToBuffer(configuration);
}

export async function generateBarChart(data, label) {
  const configuration = {
    type: "bar",
    data: {
      labels: data.map((d) => d.name),
      datasets: [
        {
          label,
          data: data.map((d) => d.amount || d.donors),
          backgroundColor: "#22c55e",
        },
      ],
    },
  };

  return await chartCanvas.renderToBuffer(configuration);
}
