
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { getQuotations, Quotation, createInvoice, Invoice } from '@/lib/firebase';

const CreateInvoice = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setIsLoading(true);
        const data = await getQuotations();
        // Filter only approved quotations
        const approvedQuotations = data.filter(q => q.status === 'approved');
        setQuotations(approvedQuotations);
      } catch (error: any) {
        console.error('Error loading quotations:', error);
        toast.error('Failed to load quotations');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, []);

  const handleSelectQuotation = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    setSelectedQuotation(quotation || null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuotation) {
      toast.error('Please select a quotation');
      return;
    }

    try {
      setIsLoading(true);
      
      const invoiceData: Partial<Invoice> = {
        ...formData,
        quotationId: selectedQuotation.id,
        customerName: selectedQuotation.customerName || 'Unknown Customer',
        customerId: selectedQuotation.customerId || '',
        items: selectedQuotation.items || [],
        totalAmount: selectedQuotation.totalAmount || 0,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      
      await createInvoice(invoiceData);
      toast.success('Invoice created successfully');
      navigate('/dashboard/invoices');
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedQuotation?.items?.length) return 0;
    return selectedQuotation.items.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return total + itemTotal;
    }, 0);
  };

  return (
    <DashboardLayout
      title="Create Invoice"
      subtitle="Generate a new invoice from an approved quotation"
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/invoices')}
        >
          Cancel
        </Button>
      }
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quotation">Quotation</Label>
                  <Select onValueChange={handleSelectQuotation} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations.length > 0 ? (
                        quotations.map((quotation) => (
                          <SelectItem key={quotation.id} value={quotation.id || ''}>
                            {quotation.customerName || 'Unnamed'} - ₹{quotation.totalAmount?.toLocaleString() || '0'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-quotations" disabled>
                          No approved quotations available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedQuotation && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h3 className="font-medium">Quotation Details</h3>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="text-gray-500">Customer:</span> {selectedQuotation.customerName || 'Unknown'}</p>
                      <p><span className="text-gray-500">Total Amount:</span> ₹{selectedQuotation.totalAmount?.toLocaleString() || '0'}</p>
                      <p><span className="text-gray-500">Created:</span> {selectedQuotation.createdAt ? new Date(selectedQuotation.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      name="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes for this invoice"
                    />
                  </div>
                </div>

                {selectedQuotation && selectedQuotation.items && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedQuotation.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{item.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.quantity}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{item.unitPrice?.toLocaleString() || '0'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">Total</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">₹{calculateTotal().toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={!selectedQuotation || isLoading}>
                    {isLoading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;
