
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, Invoice } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Column } from '@/components/ui/data-table-types';
import { toast } from 'sonner';
import { Download, Search, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userData, hasRole } = useAuth();
  const navigate = useNavigate();

  const columns: Column<Invoice>[] = [
    {
      key: 'id',
      title: 'Invoice ID',
      accessorKey: 'id',
    },
    {
      key: 'customerName',
      title: 'Customer',
      accessorKey: 'customerName',
      cell: ({ row }: { row: any }) => (
        <span>{row.original.customerName || 'Unknown Customer'}</span>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }: { row: any }) => (
        <span>₹{row.original.totalAmount?.toLocaleString() || '0'}</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: any }) => (
        <span>{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: any }) => {
        const status = row.original.status || 'pending';
        const statusClasses = {
          pending: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-green-100 text-green-800',
          overdue: 'bg-red-100 text-red-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(row.original)}
            disabled={!row.original.pdfUrl}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
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

  const filteredInvoices = invoices.filter((invoice) =>
    (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (invoice.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Invoices"
      actions={
        hasRole(['master_admin', 'admin']) && (
          <Button onClick={() => navigate('/dashboard/invoices/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="relative w-64">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredInvoices}
              isLoading={isLoading}
              primaryKey="id"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
