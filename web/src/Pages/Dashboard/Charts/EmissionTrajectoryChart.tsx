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
            max: 200,
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
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
              { x: 2025, y: 73.389 },
              { x: 2026, y: 74.951 },
              { x: 2027, y: 76.559 },
              { x: 2028, y: 78.21 },
              { x: 2029, y: 79.907 },
              { x: 2030, y: 82.774 },
              { x: 2031, y: 85.642 },
              { x: 2032, y: 88.302 },
              { x: 2033, y: 90.945 },
              { x: 2034, y: 93.571 },
              { x: 2035, y: 96.368 },
              { x: 2036, y: 99.374 },
              { x: 2037, y: 102.414 },
              { x: 2038, y: 105.538 },
              { x: 2039, y: 108.747 },
              { x: 2040, y: 112.044 },
              { x: 2041, y: 115.431 },
              { x: 2042, y: 118.911 },
              { x: 2043, y: 122.486 },
              { x: 2044, y: 126.158 },
              { x: 2045, y: 129.931 },
              { x: 2046, y: 133.807 },
              { x: 2047, y: 137.789 },
              { x: 2048, y: 141.88 },
              { x: 2049, y: 146.084 },
              { x: 2050, y: 150.0 },
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
