
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Users,
  Package,
  FileText,
  Activity,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from 'lucide-react';
import { getCustomers, getProducts, getQuotations } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Recharts components
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';

// Sample data for charts
const salesData = [
  { name: 'Jan', sales: 25000 },
  { name: 'Feb', sales: 35000 },
  { name: 'Mar', sales: 32000 },
  { name: 'Apr', sales: 40000 },
  { name: 'May', sales: 38000 },
  { name: 'Jun', sales: 45000 },
  { name: 'Jul', sales: 48000 },
  { name: 'Aug', sales: 51000 },
  { name: 'Sep', sales: 55000 },
  { name: 'Oct', sales: 60000 },
  { name: 'Nov', sales: 58000 },
  { name: 'Dec', sales: 65000 },
];

const revenueByCategory = [
  { name: 'Solar Panels', value: 45 },
  { name: 'Inverters', value: 30 },
  { name: 'Batteries', value: 15 },
  { name: 'Other', value: 10 },
];

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
        <TabsContent value="overview" className="space-y-4">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : customerCount}</div>
                <p className="text-xs text-muted-foreground">
                  {customerCount > 10 ? '+10% from last month' : 'Building your customer base'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : productCount}</div>
                <p className="text-xs text-muted-foreground">
                  {productCount > 0 ? 'Active in your inventory' : 'No products added yet'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quotations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : quotationCount}</div>
                <p className="text-xs text-muted-foreground">
                  {quotationCount > 5 ? '+5 new this week' : 'Start creating quotations'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm text-gray-600">New customer added: ABC Corp</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <p className="text-sm text-gray-600">Quotation #123 created</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    <p className="text-sm text-gray-600">Payment received from XYZ Ltd</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                    <p className="text-sm text-gray-600">New product added: 5kW Inverter</p>
                  </div>
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    View All Activity
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
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
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
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
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Solar Panel 440W</span>
                    <span className="text-sm">$120,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">5kW Inverter</span>
                    <span className="text-sm">$89,400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lithium Battery 10kWh</span>
                    <span className="text-sm">$76,300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mounting System</span>
                    <span className="text-sm">$54,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">North Region</span>
                      <span className="text-sm">$95,300</span>
                    </div>
                    <Progress value={42} className="h-2" indicatorClassName="bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">South Region</span>
                      <span className="text-sm">$68,400</span>
                    </div>
                    <Progress value={30} className="h-2" indicatorClassName="bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">East Region</span>
                      <span className="text-sm">$45,100</span>
                    </div>
                    <Progress value={20} className="h-2" indicatorClassName="bg-amber-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">West Region</span>
                      <span className="text-sm">$18,200</span>
                    </div>
                    <Progress value={8} className="h-2" indicatorClassName="bg-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full py-6">
                  <div className="text-5xl font-bold text-green-600">92%</div>
                  <Progress value={92} className="h-2 w-3/4 mt-4" indicatorClassName="bg-green-500" />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Based on customer feedback from 230 completed projects
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
