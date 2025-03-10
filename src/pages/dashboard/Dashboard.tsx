
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { markAttendance, getCustomers, getProducts, getQuotations, getInvoices, ref, onValue, database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCog, 
  Users, 
  Package, 
  FileText, 
  Clock, 
  RefreshCcw, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const salesData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 },
];

// Tasks demo data
const taskData = [
  { id: 1, title: 'Follow up with Client A', status: 'pending', dueDate: '2023-05-15' },
  { id: 2, title: 'Prepare quotation for Project B', status: 'completed', dueDate: '2023-05-10' },
  { id: 3, title: 'Installation at Site C', status: 'pending', dueDate: '2023-05-18' },
  { id: 4, title: 'Inventory check', status: 'pending', dueDate: '2023-05-20' },
];

const Dashboard = () => {
  const { userData } = useAuth();
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState(taskData);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Set up real-time data fetching
    const fetchRealTimeData = () => {
      // Get customers in real-time
      const customersRef = ref(database, 'customers');
      const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
        if (snapshot.exists()) {
          const customers = Object.keys(snapshot.val()).length;
          setCustomerCount(customers);
        } else {
          setCustomerCount(0);
        }
      }, (error) => {
        console.error('Error fetching customers:', error);
      });

      // Get products in real-time
      const productsRef = ref(database, 'products');
      const unsubscribeProducts = onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
          const products = Object.keys(snapshot.val()).length;
          setProductCount(products);
        } else {
          setProductCount(0);
        }
      }, (error) => {
        console.error('Error fetching products:', error);
      });

      // Get quotations in real-time
      const quotationsRef = ref(database, 'quotations');
      const unsubscribeQuotations = onValue(quotationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const quotations = Object.keys(snapshot.val()).length;
          setQuotationCount(quotations);
        } else {
          setQuotationCount(0);
        }
      }, (error) => {
        console.error('Error fetching quotations:', error);
      });

      // Get invoices in real-time
      const invoicesRef = ref(database, 'invoices');
      const unsubscribeInvoices = onValue(invoicesRef, (snapshot) => {
        if (snapshot.exists()) {
          const invoices = Object.keys(snapshot.val()).length;
          setInvoiceCount(invoices);
        } else {
          setInvoiceCount(0);
        }
      }, (error) => {
        console.error('Error fetching invoices:', error);
      });

      setIsLoading(false);

      // Clean up subscriptions on unmount
      return () => {
        unsubscribeCustomers();
        unsubscribeProducts();
        unsubscribeQuotations();
        unsubscribeInvoices();
      };
    };

    fetchRealTimeData();
  }, []);

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch data manually (useful for ensuring we have the latest data)
      const customers = await getCustomers();
      const products = await getProducts();
      const quotations = await getQuotations();
      let invoices = [];
      
      try {
        invoices = await getInvoices();
      } catch (error) {
        console.log('User may not have permission to view invoices');
      }
      
      setCustomerCount(customers.length);
      setProductCount(products.length);
      setQuotationCount(quotations.length);
      setInvoiceCount(invoices.length);
      
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };
  
  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } 
        : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    toast.success(`Task ${task?.status === 'completed' ? 'marked as pending' : 'completed'}`);
  };
  
  // Calculate completion percentage
  const completionPercentage = Math.round(
    (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
  );

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${userData?.displayName || 'User'}`}
      actions={
        <Button 
          onClick={handleRefreshData} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50 border border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : customerCount}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  <Button variant="link" className="p-0 h-auto text-xs text-blue-600" onClick={() => navigate('/dashboard/customers')}>
                    View all customers
                  </Button>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-white to-indigo-50 border border-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : productCount}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  <Button variant="link" className="p-0 h-auto text-xs text-indigo-600" onClick={() => navigate('/dashboard/products')}>
                    View all products
                  </Button>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-white to-green-50 border border-green-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quotations</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : quotationCount}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  <Button variant="link" className="p-0 h-auto text-xs text-green-600" onClick={() => navigate('/dashboard/quotations')}>
                    View all quotations
                  </Button>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50 border border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Account Type</CardTitle>
                <UserCog className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{userData?.role || 'Employee'}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Role-based access
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="col-span-1 lg:col-span-2 hover:shadow-md transition-shadow border border-indigo-100">
              <CardHeader>
                <CardTitle className="text-indigo-700">Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" 
                    onClick={() => navigate('/dashboard/customers')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add New Customer
                  </Button>
                  <Button 
                    className="justify-start bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white" 
                    onClick={() => navigate('/dashboard/products')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                  <Button 
                    className="justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
                    onClick={() => navigate('/dashboard/quotations')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Quotation
                  </Button>
                  <Button 
                    className="justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" 
                    onClick={() => navigate('/dashboard/invoices')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border border-indigo-100">
              <CardHeader>
                <CardTitle className="text-indigo-700">System Information</CardTitle>
                <CardDescription>Solar Panel Management</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="help">Help</TabsTrigger>
                  </TabsList>
                  <TabsContent value="about" className="space-y-4 mt-4">
                    <p className="text-sm">
                      Prakash Green Energy Dashboard provides comprehensive tools for solar panel business management.
                    </p>
                    <p className="text-sm">
                      Version: 1.0.0
                    </p>
                  </TabsContent>
                  <TabsContent value="help" className="space-y-4 mt-4">
                    <p className="text-sm">
                      Need assistance? Contact our support team:
                    </p>
                    <p className="text-sm">
                      Email: support@prakashgreenenergy.com
                    </p>
                    <p className="text-sm">
                      Phone: +91-XXXXXXXXXX
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">January</span>
                    <span className="text-sm text-gray-500">15 customers</span>
                  </div>
                  <Progress value={55} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">February</span>
                    <span className="text-sm text-gray-500">12 customers</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">March</span>
                    <span className="text-sm text-gray-500">22 customers</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">April</span>
                    <span className="text-sm text-gray-500">18 customers</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>By product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Solar Panels</span>
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                    <Progress value={65} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Inverters</span>
                      <span className="text-sm text-gray-500">20%</span>
                    </div>
                    <Progress value={20} className="h-2 bg-green-100" indicatorClassName="bg-green-600" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Batteries</span>
                      <span className="text-sm text-gray-500">10%</span>
                    </div>
                    <Progress value={10} className="h-2 bg-yellow-100" indicatorClassName="bg-yellow-600" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Installation</span>
                      <span className="text-sm text-gray-500">5%</span>
                    </div>
                    <Progress value={5} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                <div className="flex items-center justify-between">
                  <span>Your current tasks and activities</span>
                  <div className="flex items-center gap-2">
                    <Progress value={completionPercentage} className="w-20 h-2" />
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3 border rounded-lg flex items-start justify-between ${
                      task.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-6 w-6 rounded-full ${
                          task.status === 'completed' 
                            ? 'text-green-600 hover:text-green-700 bg-green-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        {task.status === 'completed' 
                          ? <CheckCircle className="h-4 w-4" /> 
                          : <AlertCircle className="h-4 w-4" />}
                      </Button>
                      <div>
                        <p className={`text-sm font-medium ${
                          task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7"
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      {task.status === 'completed' ? 'Mark Pending' : 'Complete'}
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info('Task creation will be implemented in future updates!')}
                >
                  + Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
