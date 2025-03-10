
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { MonthlyRevenue } from '../performance/MonthlyRevenue';
import { FinancialSummary } from '../performance/FinancialSummary';
import { TopSellingProducts } from '../performance/TopSellingProducts';
import { RegionalPerformance } from '../performance/RegionalPerformance';
import { CustomerSatisfaction } from '../performance/CustomerSatisfaction';

export const PerformanceTab: React.FC = () => {
  return (
    <TabsContent value="performance" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyRevenue />
        <FinancialSummary />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopSellingProducts />
        <RegionalPerformance />
        <CustomerSatisfaction />
      </div>
    </TabsContent>
  );
};
