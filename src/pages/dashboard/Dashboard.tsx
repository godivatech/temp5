
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { markAttendance, getCustomers, getProducts, getQuotations } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, Users, Package, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { userData } = useAuth();
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const customers = await getCustomers();
        const products = await getProducts();
        const quotations = await getQuotations();
        
        setCustomerCount(customers.length);
        setProductCount(products.length);
        setQuotationCount(quotations.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAttendance = async () => {
    try {
      await markAttendance();
      setIsAttendanceMarked(true);
      toast.success('Attendance marked successfully');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {userData?.displayName || 'User'}</p>
        </div>
        <Button 
          onClick={handleMarkAttendance} 
          className="mt-4 md:mt-0"
          disabled={isAttendanceMarked}
        >
          <Clock className="mr-2 h-4 w-4" />
          {isAttendanceMarked ? 'Attendance Marked' : 'Mark Attendance'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : customerCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/dashboard/customers')}>
                View all customers
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : productCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/dashboard/products')}>
                View all products
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : quotationCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/dashboard/quotations')}>
                View all quotations
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
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
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="justify-start" variant="outline" onClick={() => navigate('/dashboard/customers')}>
                <Users className="mr-2 h-4 w-4" />
                Add New Customer
              </Button>
              <Button className="justify-start" variant="outline" onClick={() => navigate('/dashboard/products')}>
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button className="justify-start" variant="outline" onClick={() => navigate('/dashboard/quotations')}>
                <FileText className="mr-2 h-4 w-4" />
                Create Quotation
              </Button>
              <Button className="justify-start" variant="outline" onClick={() => navigate('/dashboard/invoices')}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
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
    </div>
  );
};

export default Dashboard;
