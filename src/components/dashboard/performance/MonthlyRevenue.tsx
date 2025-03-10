
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Sample data for the chart
const salesData = [
  { name: 'Jan', sales: 25000 },
  { name: 'Feb', sales: 35000 },
  { name: 'Mar', sales: 32000 },
  { name: 'Apr', sales: 40000 },
  { name: 'May', sales: 38000 },
  { name: 'Jun', sales: 45000 },
  { name: 'Jul', sales: 48000 },
  { name: 'Aug', sales: 51000 },
  { name: 'Sep', sales: 55000 },
  { name: 'Oct', sales: 60000 },
  { name: 'Nov', sales: 58000 },
  { name: 'Dec', sales: 65000 },
];

export const MonthlyRevenue: React.FC = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={salesData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
