import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';

const EmissionSourcesComparisonChart = () => {
  return (
    <ChartWrapper height={'100%'} title="Distribution of GHG Emissions by Sector">
      <Chart
        options={{
          plotOptions: { pie: { offsetY: 30 } },
          colors: [
            '#9B59B6A0', // Industrial Process
            '#e63946A0', // Waste
            '#2a9d8fA0', // Enteric and Manure
            '#f57812A0', // Power and Water
            '#3498DBA0', // Road Transport
            '#F1C40FA0', // Building Industry
            '#2ECC71A0', // Oil and Gas
          ],
          legend: {
            position: 'bottom',
            offsetY: 50,
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' MtCO2e';
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
