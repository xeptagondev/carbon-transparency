import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';

const EmissionSourcesComparisonChart = () => {
  return (
    <ChartWrapper height={'100%'} title="Distribution of GHG Emissions by Sector">
      <Chart
        options={{
          plotOptions: { pie: { offsetY: 30 } },
          theme: {
            monochrome: {
              enabled: true,
              color: '#8a1538',
            },
          },
          legend: {
            position: 'bottom',
            offsetY: 50,
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
              },
            },
          },
        }}
        series={[
          {
            name: 'Distribution of GHG Emissions by Sector',
            data: [
              {
                x: 'Industrial Process',
                y: 5312.667,
              },
              {
                x: 'Waste',
                y: 413.538,
              },
              {
                x: 'Enteric and Manure',
                y: 84.865,
              },
              {
                x: 'Power and Water',
                y: 16611.469,
              },
              {
                x: 'Road Transport',
                y: 4553.199,
              },
              {
                x: 'Building Industry',
                y: 3599.838,
              },
              {
                x: 'Oil and Gas',
                y: 31174.617,
              },
            ],
          },
        ]}
        type="pie"
      />
    </ChartWrapper>
  );
};

export default EmissionSourcesComparisonChart;
