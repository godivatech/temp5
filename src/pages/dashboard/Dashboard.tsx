
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Users, Package, FileText, FileInput, 
  TrendingUp, BarChart2 
} from 'lucide-react';
import { 
  getCustomers, 
  getProducts, 
  getQuotations, 
  getInvoices,
  Customer,
  Product,
  Quotation,
  Invoice
} from '@/lib/firebase';
import { toast } from 'sonner';

const Dashboard = () => {
  const { userData } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [customersData, productsData, quotationsData, invoicesData] = await Promise.all([
          getCustomers(),
          getProducts(),
          getQuotations(),
          getInvoices().catch(err => {
            console.error('Error fetching invoices:', err);
            return [];
          }) // Handle permission errors gracefully
        ]);
        
        setCustomers(customersData);
        setProducts(productsData);
        setQuotations(quotationsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate revenue from invoices
  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  
  // Get recent quotations
  const recentQuotations = quotations
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const statCards = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      icon: <Users className="h-8 w-8 text-blue-600" />,
      description: `${customers.length > 0 ? customers[customers.length - 1]?.name || 'No new' : 'No'} customer added recently`
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: <Package className="h-8 w-8 text-emerald-600" />,
      description: `${products.length} items in inventory`
    },
    {
      title: 'Quotations',
      value: quotations.length.toString(),
      icon: <FileText className="h-8 w-8 text-amber-600" />,
      description: `${quotations.filter(q => q.status === 'sent').length} sent this month`
    },
    {
      title: 'Invoices',
      value: invoices.length.toString(),
      icon: <FileInput className="h-8 w-8 text-purple-600" />,
      description: `₹${totalRevenue.toLocaleString('en-IN')} revenue generated`
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-green-800">Welcome, {userData?.displayName || 'User'}</h1>
              <p className="text-gray-600">Here's what's happening with your business today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statCards.map((card, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm border-green-100">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <p className="text-xs text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm bg-white/80 backdrop-blur-sm border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <span className="text-gray-500">Loading sales data...</span>
                    </div>
                  ) : invoices.length > 0 ? (
                    <div className="h-64 space-y-2 overflow-auto">
                      {invoices.slice(0, 5).map((invoice, index) => (
                        <div key={index} className="flex justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium">{invoice.customerName || "Unknown Customer"}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-700">₹{invoice.totalAmount?.toLocaleString('en-IN') || 0}</p>
                            <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status || 'pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center border rounded-md">
                      <TrendingUp className="h-12 w-12 text-gray-300 mr-2" />
                      <span className="text-gray-500">No sales data available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="shadow-sm bg-white/80 backdrop-blur-sm border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <span className="text-gray-500">Loading product data...</span>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="h-64 space-y-2 overflow-auto">
                      {products.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-700">₹{product.price?.toLocaleString('en-IN') || 0}</p>
                            <p className="text-xs text-gray-500">Stock: {product.quantity || 0} {product.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center border rounded-md">
                      <BarChart2 className="h-12 w-12 text-gray-300 mr-2" />
                      <span className="text-gray-500">No product data available</span>
                    </div>
                  )}
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
