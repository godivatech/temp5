
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, Quotation, addInvoice, getCustomerById, QuotationItem } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CalendarIcon, CheckIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  quotationId: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      productName: z.string().min(1, "Product name is required"),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      unit: z.string().optional(),
      unitPrice: z.coerce.number().min(1, "Unit price must be greater than 0"),
      totalPrice: z.coerce.number().optional(),
    })
  ).min(1, "At least one item is required"),
  totalAmount: z.coerce.number().min(1, "Total amount is required"),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateInvoice = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userData } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      totalAmount: 0,
      status: 'draft',
    },
  });

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await getQuotations();
      // Only show accepted quotations
      setQuotations(data.filter(q => q.status === 'accepted'));
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to fetch quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuotationSelect = async (quotationId: string) => {
    try {
      const selected = quotations.find(q => q.id === quotationId);
      if (selected) {
        setSelectedQuotation(selected);
        
        // Fetch customer details if needed
        if (selected.customerId) {
          const customer = await getCustomerById(selected.customerId);
          
          // Prepare items from quotation
          const items = selected.items?.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity || 0,
            unit: item.unit || 'Unit',
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
          })) || [];
          
          // Reset the form with quotation data
          form.reset({
            quotationId: selected.id,
            customerId: selected.customerId,
            customerName: customer?.name || selected.customerName,
            invoiceDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: items.length > 0 ? items : [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
            totalAmount: selected.totalAmount || 0,
            notes: selected.notes,
            status: 'draft',
          });
        }
      }
    } catch (error) {
      console.error('Error selecting quotation:', error);
      toast.error('Failed to load quotation details');
    }
  };

  const calculateItemTotal = (item: { quantity?: number; unitPrice?: number }) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return quantity * unitPrice;
  };

  const recalculateTotals = () => {
    const items = form.getValues('items');
    
    // Update each item's total price
    const updatedItems = items.map(item => ({
      ...item,
      totalPrice: calculateItemTotal(item),
    }));
    
    // Calculate the grand total
    const grandTotal = updatedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    // Update the form
    form.setValue('items', updatedItems);
    form.setValue('totalAmount', grandTotal);
  };

  const addItem = () => {
    const items = form.getValues('items');
    form.setValue('items', [...items, { productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues('items');
    if (items.length > 1) {
      form.setValue('items', items.filter((_, i) => i !== index));
      recalculateTotals();
    } else {
      toast.error('Invoice must have at least one item');
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      // Prepare invoice data
      const invoiceData = {
        ...data,
        createdAt: new Date().toISOString(),
        createdBy: userData?.uid,
        status: 'draft',
      };
      
      // Save invoice
      await addInvoice(invoiceData);
      toast.success('Invoice created successfully');
      navigate('/dashboard/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Create Invoice" 
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/invoices')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Invoices</span>
        </Button>
      }
    >
      <div className="w-full max-w-6xl mx-auto">
        <Tabs defaultValue="quotation" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="quotation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              From Quotation
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quotation">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Quotation</CardTitle>
                <CardDescription>Choose an accepted quotation to create an invoice from</CardDescription>
              </CardHeader>
              <CardContent>
                {quotations.length > 0 ? (
                  <Select onValueChange={handleQuotationSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations.map((quotation) => (
                        <SelectItem key={quotation.id} value={quotation.id || ''}>
                          {quotation.id} - {quotation.customerName} (₹{quotation.totalAmount?.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No accepted quotations</AlertTitle>
                    <AlertDescription>
                      There are no accepted quotations to create invoices from. Create a quotation first or use manual entry.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                  <CardDescription>Enter the invoice information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Invoice Date */}
                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Invoice Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} readOnly={!!selectedQuotation} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes for this invoice" 
                            className="min-h-[100px]" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Invoice Items */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add products or services to this invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product/Service</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price (₹)</TableHead>
                        <TableHead>Total (₹)</TableHead>
                        <TableHead width={100}></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.watch('items').map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.productName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min={1}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setTimeout(recalculateTotals, 0);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} value={field.value || 'Unit'} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min={0}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setTimeout(recalculateTotals, 0);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.totalPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      readOnly 
                                      value={field.value?.toLocaleString() || calculateItemTotal(item).toLocaleString()} 
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={form.watch('items').length <= 1}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                    >
                      Add Item
                    </Button>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className="font-medium">Total Amount:</span>
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  readOnly
                                  value={`₹${field.value?.toLocaleString() || '0'}`}
                                  className="w-32 text-right"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/invoices')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;
