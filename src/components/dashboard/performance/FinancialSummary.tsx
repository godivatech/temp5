
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FinancialSummary: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Revenue</span>
            <span className="font-semibold text-green-600">$245,890.65</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Expenses</span>
            <span className="font-semibold text-red-600">$84,234.20</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profit</span>
            <span className="font-semibold">$161,656.45</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profit Margin</span>
              <span className="font-semibold text-blue-600">65.7%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
