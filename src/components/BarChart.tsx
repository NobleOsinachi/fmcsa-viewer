import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getBarChartData } from '../common/utils';
import { Record } from '../common/types';

const OutOfServiceBarChart = ({ records }: { records: Record[] }) => {
  const barChartData = getBarChartData(records);

  if (!records.length) {
    return (
      <p>
        No records of <b>out of service</b> companies!
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={barChartData}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OutOfServiceBarChart;
