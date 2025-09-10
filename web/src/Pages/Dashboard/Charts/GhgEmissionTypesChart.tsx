import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';

const GhgEmissionTypesChart = () => {
  return (
    <ChartWrapper height={'100%'} title="GHG Emissions by Type">
      <Chart
        height={600}
        options={{
          chart: {
            id: 'GHG-emission',
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            type: 'numeric',
            min: 2013,
            max: 2025,
            // tickAmount: 5,
            labels: {
              formatter: (val) => parseInt(val).toFixed(0),
            },
          },
          parsing: {
            x: '',
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
              },
            },
          },
          stroke: {
            curve: 'monotoneCubic',
            width: [2, 2, 2, 2],
          },
        }}
        series={[
          {
            name: 'CO2',
            data: [
              {
                x: 2013,
                y: 76.539,
              },
              {
                x: 2014,
                y: 82.165,
              },
              {
                x: 2015,
                y: 85.21,
              },
              {
                x: 2016,
                y: 87.055,
              },
              {
                x: 2017,
                y: 88.731,
              },
              {
                x: 2018,
                y: 87.244,
              },
              {
                x: 2019,
                y: 90.945,
              },
              {
                x: 2020,
                y: 87.34,
              },
              {
                x: 2021,
                y: 88.684,
              },
            ],
            color: '#8a1538',
          },
          {
            name: 'CH4',
            data: [
              {
                x: 2013,
                y: 30.71,
              },
              {
                x: 2014,
                y: 29.851,
              },

              {
                x: 2015,
                y: 29.693,
              },
              {
                x: 2016,
                y: 30.111,
              },
              {
                x: 2017,
                y: 29.759,
              },
              {
                x: 2018,
                y: 29.799,
              },
              {
                x: 2019,
                y: 29.956,
              },
              {
                x: 2020,
                y: 29.941,
              },
              {
                x: 2021,
                y: 30.252,
              },
            ],
            type: 'line',
            color: '#42282c',
          },
          {
            name: 'N20',
            data: [
              {
                x: 2013,
                y: 0.485,
              },
              {
                x: 2014,
                y: 0.532,
              },

              {
                x: 2015,
                y: 0.56,
              },
              {
                x: 2016,
                y: 0.602,
              },
              {
                x: 2017,
                y: 0.619,
              },
              {
                x: 2018,
                y: 0.601,
              },
              {
                x: 2019,
                y: 0.621,
              },
              {
                x: 2020,
                y: 0.608,
              },
              {
                x: 2021,
                y: 0.611,
              },
            ],
            color: '#bd9e3a',
          },
          {
            name: 'F-gases',
            data: [
              {
                x: 2013,
                y: 0.485,
              },
              {
                x: 2014,
                y: 0.476,
              },

              {
                x: 2015,
                y: 0.587,
              },
              {
                x: 2016,
                y: 0.613,
              },
              {
                x: 2017,
                y: 0.638,
              },
              {
                x: 2018,
                y: 0.664,
              },
              {
                x: 2019,
                y: 0.69,
              },
              {
                x: 2020,
                y: 0.715,
              },
              {
                x: 2021,
                y: 0.764,
              },
            ],
            color: '#500b52',
          },
        ]}
        type="line"
      />
    </ChartWrapper>
  );
};

export default GhgEmissionTypesChart;
