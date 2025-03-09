
import React, { useState, useEffect } from 'react';
import { getInvoices, Invoice } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Column } from '@/components/ui/data-table-types';
import { toast } from 'sonner';
import { Download, Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userData } = useAuth();
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
        <span>{row.original.customerName || 'N/A'}</span>
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
      generatePdf(invoice);
    }
  };

  const generatePdf = (invoice: Invoice) => {
    try {
      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text('Prakash Green Energy', 105, 20, { align: 'center' });
      
      // Add invoice info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice #: ${invoice.id || 'N/A'}`, 20, 40);
      doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}`, 20, 48);
      doc.text(`Customer: ${invoice.customerName || 'N/A'}`, 20, 56);
      
      // Add items table
      const tableColumn = ["Item", "Quantity", "Unit", "Price", "Total"];
      const tableRows: any[] = [];
      
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
          const itemData = [
            item.productName || 'N/A',
            item.quantity?.toString() || '0',
            item.unit || 'Unit',
            `₹${item.unitPrice?.toLocaleString() || '0'}`,
            `₹${item.totalPrice?.toLocaleString() || '0'}`
          ];
          tableRows.push(itemData);
        });
      }
      
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });
      
      // Add total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text(`Total Amount: ₹${invoice.totalAmount?.toLocaleString() || '0'}`, 150, finalY, { align: 'right' });
      
      // Save or open the PDF
      doc.save(`Invoice_${invoice.id}.pdf`);
      toast.success('Invoice PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };

  const handleCreateInvoice = () => {
    navigate('/dashboard/invoices/create');
  };

  const filteredInvoices = invoices.filter((invoice) =>
    (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (invoice.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Invoices" 
      actions={
        <Button onClick={handleCreateInvoice} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </Button>
      }
    >
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredInvoices}
              primaryKey="id"
              isLoading={isLoading}
              emptyMessage="No invoices found. Create one to get started."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
