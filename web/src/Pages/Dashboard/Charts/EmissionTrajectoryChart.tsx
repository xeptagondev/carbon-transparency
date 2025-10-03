import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useEffect, useState } from 'react';

const zeroFillArray = Array(38).fill(0);
const initialEmission = 102.132;
const initialYear = 2013;
const finalYear = 2050;

const EmissionTrajectoryChart = () => {
  const [baselineSeries, setBaselineSeries] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const stepCount = finalYear - initialYear;
    const stepSize = initialEmission / stepCount;
    const netZeroSteps = Array.from({ length: stepCount + 1 }, (_, i) => {
      return initialEmission - stepSize * i;
    });
    const netZeroSeries: { x: number; y: number }[] = [];
    netZeroSteps.forEach((value, i) => {
      netZeroSeries.push({
        x: initialYear + i,
        y: parseFloat(netZeroSteps[i].toFixed(3)),
      });
    });
    setBaselineSeries(netZeroSeries);
  }, []);
  return (
    <ChartWrapper height={'100%'} title="Baseline-to-Net Zero Pathway">
      <Chart
        height={600}
        options={{
          chart: {
            id: 'GHG-emission',
            toolbar: {
              show: false,
            },
          },
          annotations: {
            points: [
              {
                x: 2030, // x-axis value or timestamp
                y: 146, // y-axis value
                marker: {
                  size: 4,
                  fillColor: '#FF4560',
                  strokeColor: '#FF4560',
                  // radius: 2,
                  offsetX: 5,
                  shape: 'none',
                },
                label: {
                  borderColor: '#FF4560',
                  offsetY: 0,
                  offsetX: 20,
                  style: {
                    color: '#fff',
                    background: '#FF4560',
                  },
                  text: 'BAU Prediction by 2030',
                },
              },
              {
                x: 2030, // x-axis value or timestamp
                y: 146 * 0.75, // y-axis value
                marker: {
                  size: 4,
                  fillColor: '#3396D3A0',
                  strokeColor: '#3396D3A0',
                  // radius: 2,
                  offsetX: 5,
                  shape: 'none',
                },
                label: {
                  borderColor: '#3396D3A0',
                  offsetY: 0,
                  offsetX: 20,
                  style: {
                    color: '#fff',
                    background: '#3396D3',
                  },
                  text: '25% Reduction Target by 2030',
                },
              },
            ],
          },
          plotOptions: {
            bar: {
              dataLabels: {
                position: 'top',
                total: {
                  enabled: true,
                },
                orientation: 'vertical',
              },
            },
          },
          dataLabels: {
            enabled: false,
            style: {
              colors: ['#333'],
            },
            offsetX: 0,
            offsetY: 10,
          },
          xaxis: {
            type: 'numeric',
            min: 2013,
            max: 2050,
            tickAmount: 5,
            stepSize: 1,
            labels: {
              formatter: (val) => parseInt(val).toFixed(0),
            },
          },
          yaxis: {
            max: 170,
            min: 0,
            tickAmount: 5,
            labels: {
              formatter: function (val) {
                return val + ' MtCO2e';
              },
            },
          },
          stroke: {
            curve: 'monotoneCubic',
            width: [3, 3, 3],
            // dashArray: [0, 5, 0],
          },
        }}
        series={[
          {
            name: 'Business as usual (BAU)',
            data: [
              {
                x: 2013,
                y: 102.132,
              },
              {
                x: 2014,
                y: 105.352,
              },
              {
                x: 2015,
                y: 110.861,
              },

              {
                x: 2016,
                y: 112.352,
              },
              {
                x: 2017,
                y: 112.258,
              },
              {
                x: 2018,
                y: 111.887,
              },
              {
                x: 2019,
                y: 111.373,
              },
              {
                x: 2020,
                y: 111.047,
              },
              {
                x: 2021,
                y: 112.411,
              },
              {
                x: 2022,
                y: 114.548,
              },
              {
                x: 2023,
                y: 116.015,
              },
              {
                x: 2024,
                y: 118.373,
              },
              {
                x: 2025,
                y: 120.874,
              },
            ],
            type: 'bar',
            color: '#6bc9d1',
          },
          {
            name: 'Net Zero pathway',
            data: baselineSeries,
            type: 'bar',
            color: '#B293D7',
          },
          {
            name: 'Prediction',
            data: [
              {
                x: 2026,
                y: 123.425,
              },
              {
                x: 2027,
                y: 126.028,
              },
              {
                x: 2028,
                y: 132.683,
              },
              {
                x: 2029,
                y: 140.392,
              },
              {
                x: 2030,
                y: 146.0,
                goals: [
                  {
                    name: 'Expected',
                    value: 146 * 0.75,
                    strokeWidth: 50000,
                    strokeColor: '#3396D3A0',
                    strokeDashArray: 3,
                  },
                ],
              },
              {
                x: 2031,
                y: 145.175,
              },
              {
                x: 2032,
                y: 144.35,
              },
              {
                x: 2033,
                y: 143.525,
              },
              {
                x: 2034,
                y: 142.7,
              },
              {
                x: 2035,
                y: 141.875,
              },
              {
                x: 2036,
                y: 141.05,
              },
              {
                x: 2037,
                y: 140.225,
              },
              {
                x: 2038,
                y: 139.4,
              },
              {
                x: 2039,
                y: 138.575,
              },
              {
                x: 2040,
                y: 137.75,
              },
              {
                x: 2041,
                y: 136.925,
              },
              {
                x: 2042,
                y: 136.1,
              },
              {
                x: 2043,
                y: 135.275,
              },
              {
                x: 2044,
                y: 134.45,
              },
              {
                x: 2045,
                y: 133.625,
              },
              {
                x: 2046,
                y: 132.8,
              },
              {
                x: 2047,
                y: 131.975,
              },
              {
                x: 2048,
                y: 128.15,
              },
              {
                x: 2049,
                y: 120.325,
              },
              {
                x: 2050,
                y: 109.5,
              },
            ],
            color: '#E0E0E0',
            type: 'bar',
          },
        ]}
        type="bar"
      />
    </ChartWrapper>
  );
};

export default EmissionTrajectoryChart;
