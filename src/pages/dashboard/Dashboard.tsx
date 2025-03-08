
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText, FileInput, TrendingUp, BarChart2 } from 'lucide-react';
import { getCustomers, getProducts, getQuotations, getInvoices } from '@/lib/firebase';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  const { userData } = useAuth();
  
  // Fetch real-time data using React Query
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });
  
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });
  
  const { data: quotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });
  
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices().catch(() => []), // Handle permission errors
  });
  
  // Calculate revenue from invoices
  const calculateTotalRevenue = () => {
    return invoices.reduce((total, invoice) => total + (invoice.totalAmount || 0), 0);
  };
  
  // Get count of invoices from current month
  const getMonthlyInvoicesCount = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return invoices.filter(invoice => {
      const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt) : null;
      return invoiceDate && 
             invoiceDate.getMonth() === thisMonth && 
             invoiceDate.getFullYear() === thisYear;
    }).length;
  };
  
  // Get count of new products added this week
  const getNewProductsThisWeek = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return products.filter(product => {
      const productDate = product.createdAt ? new Date(product.createdAt) : null;
      return productDate && productDate >= oneWeekAgo;
    }).length;
  };
  
  // Get count of quotations sent this month
  const getQuotationsSentThisMonth = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return quotations.filter(quotation => {
      const quotationDate = quotation.createdAt ? new Date(quotation.createdAt) : null;
      return quotationDate && 
             quotationDate.getMonth() === thisMonth && 
             quotationDate.getFullYear() === thisYear &&
             quotation.status === 'sent';
    }).length;
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      icon: <Users className="h-8 w-8 text-primary" />,
      description: `${customers.length} customers in database`,
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: <Package className="h-8 w-8 text-indigo-500" />,
      description: `${getNewProductsThisWeek()} new products added this week`,
      color: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'Quotations',
      value: quotations.length.toString(),
      icon: <FileText className="h-8 w-8 text-amber-500" />,
      description: `${getQuotationsSentThisMonth()} sent this month`,
      color: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      title: 'Invoices',
      value: invoices.length.toString(),
      icon: <FileInput className="h-8 w-8 text-emerald-500" />,
      description: `₹${calculateTotalRevenue().toLocaleString('en-IN')} revenue generated`,
      color: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {userData?.displayName || 'User'}</h1>
        <p className="text-gray-600 dark:text-gray-300">Here's what's happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        {statCards.map((card, index) => (
          <Card 
            key={index} 
            className={`shadow-sm hover:shadow-md transition-all duration-300 border-none ${card.color} backdrop-blur-sm overflow-hidden`}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">{card.title}</CardTitle>
              <div className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-none bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/30">
              <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mr-2" />
              <span className="text-gray-500 dark:text-gray-400">Sales chart will be displayed here</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-none bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/30">
              <BarChart2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mr-2" />
              <span className="text-gray-500 dark:text-gray-400">Product stats will be displayed here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const DashboardWithLayout = () => (
  <DashboardLayout>
    <Dashboard />
  </DashboardLayout>
);

export default DashboardWithLayout;
