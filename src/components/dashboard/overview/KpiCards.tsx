
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const KpiCards: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Customer Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">+24%</div>
          <Progress value={24} className="h-2" indicatorClassName="bg-green-500" />
          <p className="mt-2 text-xs text-muted-foreground">Increased customer acquisition rate</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sales Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">68%</div>
          <Progress value={68} className="h-2" indicatorClassName="bg-blue-500" />
          <p className="mt-2 text-xs text-muted-foreground">Quotation to invoice conversion</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">32%</div>
          <Progress value={32} className="h-2" indicatorClassName="bg-purple-500" />
          <p className="mt-2 text-xs text-muted-foreground">Average profit margin on sales</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">78%</div>
          <Progress value={78} className="h-2" indicatorClassName="bg-amber-500" />
          <p className="mt-2 text-xs text-muted-foreground">Based on completed tasks</p>
        </CardContent>
      </Card>
    </div>
  );
};
