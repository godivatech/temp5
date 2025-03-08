
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/dashboard/Header';
import { Users, Package, FileText, FileInput, TrendingUp, BarChart2 } from 'lucide-react';
import { getCustomers, getProducts, getQuotations, getInvoices } from '@/lib/firebase';
import { useQuery } from '@tanstack/react-query';

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
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
    }).length;
  };
  
  // Get count of new products added this week
  const getNewProductsThisWeek = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return products.filter(product => {
      const productDate = new Date(product.createdAt);
      return productDate >= oneWeekAgo;
    }).length;
  };
  
  // Get count of quotations sent this month
  const getQuotationsSentThisMonth = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return quotations.filter(quotation => {
      const quotationDate = new Date(quotation.createdAt);
      return quotationDate.getMonth() === thisMonth && 
             quotationDate.getFullYear() === thisYear &&
             quotation.status === 'sent';
    }).length;
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      icon: <Users className="h-8 w-8 text-primary" />,
      description: `${customers.length} customers in database`
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: <Package className="h-8 w-8 text-primary" />,
      description: `${getNewProductsThisWeek()} new products added this week`
    },
    {
      title: 'Quotations',
      value: quotations.length.toString(),
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: `${getQuotationsSentThisMonth()} sent this month`
    },
    {
      title: 'Invoices',
      value: invoices.length.toString(),
      icon: <FileInput className="h-8 w-8 text-primary" />,
      description: `₹${calculateTotalRevenue().toLocaleString('en-IN')} revenue generated`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {userData?.displayName || 'User'}</h1>
        <p className="text-gray-500">Here's what's happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <Card key={index} className="dashboard-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-md">
              <TrendingUp className="h-12 w-12 text-gray-300 mr-2" />
              <span className="text-gray-500">Sales chart will be displayed here</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-md">
              <BarChart2 className="h-12 w-12 text-gray-300 mr-2" />
              <span className="text-gray-500">Product stats will be displayed here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
