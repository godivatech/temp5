
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Users, Package, FileText, FileInput, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { userData } = useAuth();

  const statCards = [
    {
      title: 'Total Customers',
      value: '234',
      icon: <Users className="h-8 w-8 text-primary" />,
      description: '12% increase from last month'
    },
    {
      title: 'Total Products',
      value: '52',
      icon: <Package className="h-8 w-8 text-primary" />,
      description: '5 new products added this week'
    },
    {
      title: 'Quotations',
      value: '158',
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: '23 sent this month'
    },
    {
      title: 'Invoices',
      value: '92',
      icon: <FileInput className="h-8 w-8 text-primary" />,
      description: '₹1.2M revenue generated'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Welcome, {userData?.displayName || 'User'}</h1>
              <p className="text-gray-500">Here's what's happening with your business today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statCards.map((card, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
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
                    <Package className="h-12 w-12 text-gray-300 mr-2" />
                    <span className="text-gray-500">Product stats will be displayed here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
