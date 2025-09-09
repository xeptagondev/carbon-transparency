import { Card } from 'antd';
import { Component, FC, ReactElement } from 'react';

interface IChartWrapper {
  title?: string;
  children?: ReactElement | ReactElement[];
  height?: string;
}

const ChartWrapper = ({ title = 'Chart Title', children, height }: IChartWrapper) => {
  return (
    <div
      className="chart-wrapper"
      style={{
        height: height,
      }}
    >
      <div className="chart-body">
        <h2 className="p-4">{title}</h2>
        <div className="chart">{children}</div>
      </div>
    </div>
  );
};

export default ChartWrapper;
