
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TopSellingProducts: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Solar Panel 440W</span>
            <span className="text-sm">$120,500</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">5kW Inverter</span>
            <span className="text-sm">$89,400</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Lithium Battery 10kWh</span>
            <span className="text-sm">$76,300</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Mounting System</span>
            <span className="text-sm">$54,200</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
