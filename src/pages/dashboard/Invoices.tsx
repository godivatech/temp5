
import React, { useState, useEffect } from 'react';
import { getInvoices, Invoice } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Column } from '@/components/ui/data-table-types';
import { toast } from 'sonner';
import { 
  Download, 
  Search, 
  FileText, 
  Filter, 
  ArrowUpDown, 
  Calendar
} from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { userData } = useAuth();

  const columns: Column<Invoice>[] = [
    {
      key: 'id',
      title: 'Invoice ID',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      key: 'customerName',
      title: 'Customer',
      accessorKey: 'customerName',
      cell: ({ row }) => (
        <div>{row.original.customerName}</div>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <div className="font-medium">₹{row.original.totalAmount.toLocaleString()}</div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status || 'pending';
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'paid' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            status === 'overdue' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(row.original)}
            disabled={!row.original.pdfUrl}
            className="h-8 px-2 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewInvoice(row.original)}
            className="h-8 px-2 text-xs"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error(error.message || 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      toast.error('PDF not available for this invoice');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // This would typically navigate to a detailed invoice view
    toast.info(`Viewing invoice ${invoice.id}`);
    // Example: navigate(`/dashboard/invoices/${invoice.id}`);
  };

  const handleCreateInvoice = () => {
    // This would typically navigate to an invoice creation page
    toast.info('Creating new invoice');
    // Example: navigate('/dashboard/invoices/create');
  };

  const getFilteredInvoices = () => {
    return invoices.filter((invoice) => {
      // Filter by search term
      const matchesSearch = 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = !statusFilter || invoice.status === statusFilter;
      
      // Filter by date
      const matchesDate = !date || 
        new Date(invoice.createdAt).toDateString() === date.toDateString();
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Invoices" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold">Invoices</h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Calendar className="h-4 w-4 mr-2" />
                        {date ? format(date, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                      {date && (
                        <div className="p-3 border-t border-gray-100 flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDate(undefined)}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Filter className="h-4 w-4 mr-2" />
                        {statusFilter ? `Status: ${statusFilter}` : "All statuses"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                        All statuses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
                        Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>
                        Overdue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button onClick={handleCreateInvoice}>
                    Create Invoice
                  </Button>
                </div>
              </div>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">All Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredInvoices}
                  isLoading={isLoading}
                />
                
                {filteredInvoices.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchTerm || statusFilter || date
                        ? "Try adjusting your filters"
                        : "Create your first invoice to get started"
                      }
                    </p>
                    {!searchTerm && !statusFilter && !date && (
                      <Button onClick={handleCreateInvoice}>
                        Create Invoice
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoices.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invoices.filter(i => i.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{invoices
                      .filter(i => i.status === 'paid')
                      .reduce((total, invoice) => total + (invoice.totalAmount || 0), 0)
                      .toLocaleString()}
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

export default Invoices;
