
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const RegionalPerformance: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">North Region</span>
              <span className="text-sm">$95,300</span>
            </div>
            <Progress value={42} className="h-2" indicatorClassName="bg-blue-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">South Region</span>
              <span className="text-sm">$68,400</span>
            </div>
            <Progress value={30} className="h-2" indicatorClassName="bg-green-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">East Region</span>
              <span className="text-sm">$45,100</span>
            </div>
            <Progress value={20} className="h-2" indicatorClassName="bg-amber-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">West Region</span>
              <span className="text-sm">$18,200</span>
            </div>
            <Progress value={8} className="h-2" indicatorClassName="bg-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
