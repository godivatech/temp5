
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getQuotations, Quotation, createInvoice, Customer, getCustomerById } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Save, Download } from 'lucide-react';

const InvoiceCreate = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (selectedQuotation?.customerId) {
      fetchCustomer(selectedQuotation.customerId);
    }
  }, [selectedQuotation]);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await getQuotations();
      // Only show accepted quotations
      const acceptedQuotations = data.filter(q => q.status === 'accepted');
      setQuotations(acceptedQuotations);
    } catch (error: any) {
      console.error('Error fetching quotations:', error);
      toast.error(error.message || 'Failed to fetch quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomer = async (customerId: string) => {
    try {
      const customerData = await getCustomerById(customerId);
      setCustomer(customerData);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to fetch customer details');
    }
  };

  const handleQuotationSelect = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    setSelectedQuotation(quotation || null);
  };

  const handleCreateInvoice = async () => {
    if (!selectedQuotation) {
      toast.error('Please select a quotation');
      return;
    }

    try {
      const invoice = {
        quotationId: selectedQuotation.id!,
        customerId: selectedQuotation.customerId,
        customerName: selectedQuotation.customerName,
        items: selectedQuotation.items,
        totalAmount: selectedQuotation.totalAmount,
        notes: notes
      };

      await createInvoice(invoice);
      toast.success('Invoice created successfully');
      navigate('/dashboard/invoices');
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  return (
    <DashboardLayout title="Create Invoice">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/invoices')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Invoices
          </Button>
          <h1 className="text-2xl font-bold">Create New Invoice</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Quotation</CardTitle>
              <CardDescription>Choose an accepted quotation to create an invoice</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : quotations.length > 0 ? (
                <Select onValueChange={handleQuotationSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quotation" />
                  </SelectTrigger>
                  <SelectContent>
                    {quotations.map((quotation) => (
                      <SelectItem key={quotation.id} value={quotation.id || ''}>
                        {quotation.customerName} - ₹{quotation.totalAmount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No accepted quotations found
                </div>
              )}

              <div className="mt-6">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes for this invoice"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreateInvoice}
                disabled={!selectedQuotation}
              >
                <Save className="h-4 w-4 mr-1" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <CardDescription>Preview how your invoice will look</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedQuotation ? (
                <div className="border rounded-lg p-6 bg-white">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-indigo-700">INVOICE</h2>
                      <p className="text-gray-500">#{new Date().getTime().toString().slice(-6)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Your Company Name</p>
                      <p className="text-sm text-gray-500">123 Business Street</p>
                      <p className="text-sm text-gray-500">City, State 12345</p>
                      <p className="text-sm text-gray-500">contact@yourcompany.com</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                      <p className="font-medium">{selectedQuotation.customerName}</p>
                      {customer && (
                        <>
                          <p className="text-sm text-gray-600">{customer.address}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Invoice Details:</h3>
                      <div className="grid grid-cols-2 text-sm">
                        <p className="text-gray-600">Date:</p>
                        <p>{new Date().toLocaleDateString()}</p>
                        <p className="text-gray-600">Due Date:</p>
                        <p>{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuotation.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">₹{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{item.totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-8 flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Subtotal:</span>
                        <span>₹{selectedQuotation.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Tax (18%):</span>
                        <span>₹{(selectedQuotation.totalAmount * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{(selectedQuotation.totalAmount * 1.18).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {notes && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
                      <p className="text-sm text-gray-600">{notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                  <p>Select a quotation to preview your invoice</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceCreate;
