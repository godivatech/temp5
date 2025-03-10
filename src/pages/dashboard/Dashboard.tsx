
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp } from 'lucide-react';
import { getCustomers, getProducts, getQuotations } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { PerformanceTab } from '@/components/dashboard/tabs/PerformanceTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userData } = useAuth();
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const customers = await getCustomers();
        const products = await getProducts();
        const quotationsList = await getQuotations();
        
        setCustomerCount(customers.length);
        setProductCount(products.length);
        setQuotationCount(quotationsList.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={`Welcome back, ${userData?.displayName || 'User'}`}
    >
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <OverviewTab 
          customerCount={customerCount}
          productCount={productCount}
          quotationCount={quotationCount}
          loading={loading}
        />

        {/* Performance Tab */}
        <PerformanceTab />
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
