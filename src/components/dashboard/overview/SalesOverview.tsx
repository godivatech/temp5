
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
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

export const SalesOverview: React.FC = () => {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
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
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
