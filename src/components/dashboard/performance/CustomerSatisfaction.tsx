
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const CustomerSatisfaction: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Satisfaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full py-6">
          <div className="text-5xl font-bold text-green-600">92%</div>
          <Progress value={92} className="h-2 w-3/4 mt-4" indicatorClassName="bg-green-500" />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Based on customer feedback from 230 completed projects
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
