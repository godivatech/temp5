
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { StatsCards } from '../overview/StatsCards';
import { SalesOverview } from '../overview/SalesOverview';
import { RecentActivity } from '../overview/RecentActivity';
import { KpiCards } from '../overview/KpiCards';

interface OverviewTabProps {
  customerCount: number;
  productCount: number;
  quotationCount: number;
  loading: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  customerCount,
  productCount,
  quotationCount,
  loading
}) => {
  return (
    <TabsContent value="overview" className="space-y-4">
      {/* Overview Cards */}
      <StatsCards 
        customerCount={customerCount}
        productCount={productCount}
        quotationCount={quotationCount}
        loading={loading}
      />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesOverview />
        <RecentActivity />
      </div>

      {/* KPI Cards */}
      <KpiCards />
    </TabsContent>
  );
};
