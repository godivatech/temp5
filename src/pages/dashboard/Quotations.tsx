
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Quotation, QuotationItem, Product, Customer,
  getProducts, getCustomers, createQuotation, getQuotations, 
  updateQuotation, deleteQuotation
} from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Plus, Eye, Trash, FileText } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
};

const Quotations = () => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master_admin';
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Resources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  
  // New quotation form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Edit status
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>('draft');

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchTerm, quotations]);

  useEffect(() => {
    // Set selected customer when customer ID changes
    const customer = customers.find(c => c.id === selectedCustomerId);
    setSelectedCustomer(customer || null);
  }, [selectedCustomerId, customers]);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await getQuotations();
      setQuotations(data);
      setFilteredQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const filterQuotations = () => {
    if (!searchTerm.trim()) {
      setFilteredQuotations(quotations);
      return;
    }

    const filtered = quotations.filter(quotation => 
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredQuotations(filtered);
    setCurrentPage(1);
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    
    const product = products.find(p => p.id === selectedProductId);
    
    if (!product) {
      toast.error('Product not found');
      return;
    }
    
    if (selectedQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    if (selectedQuantity > product.quantity) {
      toast.error(`Only ${product.quantity} ${product.unit}(s) available in inventory`);
      return;
    }
    
    // Check if product already in the list
    const existingItemIndex = quotationItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedItems = [...quotationItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + selectedQuantity;
      
      if (newQuantity > product.quantity) {
        toast.error(`Cannot add more than available inventory (${product.quantity} ${product.unit}s)`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        totalPrice: product.price * newQuantity
      };
      
      setQuotationItems(updatedItems);
    } else {
      // Add new item
      const newItem: QuotationItem = {
        productId: product.id || '',
        productName: product.name,
        quantity: selectedQuantity,
        unit: product.unit,
        unitPrice: product.price,
        totalPrice: product.price * selectedQuantity
      };
      
      setQuotationItems([...quotationItems, newItem]);
    }
    
    // Reset selection
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const removeQuotationItem = (index: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  };

  const handleCreateQuotation = async () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    
    if (quotationItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    if (!selectedCustomer) {
      toast.error('Selected customer not found');
      return;
    }
    
    try {
      const totalAmount = quotationItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const newQuotation: Omit<Quotation, 'id' | 'createdAt' | 'createdBy'> = {
        customerId: selectedCustomerId,
        customerName: selectedCustomer.name,
        items: quotationItems,
        totalAmount,
        status: 'draft'
      };
      
      await createQuotation(newQuotation);
      toast.success('Quotation created successfully');
      
      // Reset form
      setSelectedCustomerId('');
      setQuotationItems([]);
      setIsAddDialogOpen(false);
      
      // Refresh quotations
      await fetchQuotations();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error('Failed to create quotation');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    try {
      await deleteQuotation(id);
      toast.success('Quotation deleted successfully');
      await fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedQuotation?.id) return;
    
    try {
      await updateQuotation(selectedQuotation.id, { status: selectedStatus });
      toast.success('Quotation status updated successfully');
      setIsEditStatusDialogOpen(false);
      await fetchQuotations();
    } catch (error) {
      console.error('Error updating quotation status:', error);
      toast.error('Failed to update quotation status');
    }
  };

  const openViewDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  const openEditStatusDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedStatus(quotation.status);
    setIsEditStatusDialogOpen(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const calculateTotal = () => {
    return quotationItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-gray-500">Create and manage quotations for customers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search quotations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quotation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quotation</DialogTitle>
                <DialogDescription>
                  Select a customer and add products to create a quotation
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id || ''}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCustomerId && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Customer Details</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p><span className="font-medium">Name:</span> {selectedCustomer?.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedCustomer?.email}</p>
                        <p><span className="font-medium">Location:</span> {selectedCustomer?.location}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Add Products to Quotation</h3>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1">
                          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id || ''}>
                                  {product.name} - {product.price.toLocaleString('en-IN')} ₹ ({product.quantity} {product.unit}s available)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full sm:w-24">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                          />
                        </div>
                        <Button type="button" onClick={handleAddItem}>Add</Button>
                      </div>
                      
                      {quotationItems.length > 0 && (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {quotationItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.productName}</TableCell>
                                  <TableCell>₹{item.unitPrice.toLocaleString('en-IN')}</TableCell>
                                  <TableCell>{item.quantity} {item.unit}</TableCell>
                                  <TableCell>₹{item.totalPrice.toLocaleString('en-IN')}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => removeQuotationItem(index)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">Total Amount:</TableCell>
                                <TableCell className="font-bold">₹{calculateTotal().toLocaleString('en-IN')}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateQuotation} 
                  disabled={!selectedCustomerId || quotationItems.length === 0}
                >
                  Create Quotation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-pulse flex items-center gap-2">
                <div className="h-4 w-4 bg-primary rounded-full"></div>
                <div className="h-4 w-4 bg-primary rounded-full animation-delay-200"></div>
                <div className="h-4 w-4 bg-primary rounded-full animation-delay-400"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          {searchTerm ? 'No quotations found matching your search' : 'No quotations created yet'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-medium">{quotation.id?.substring(0, 8)}</TableCell>
                          <TableCell>{quotation.customerName}</TableCell>
                          <TableCell>₹{quotation.totalAmount.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[quotation.status]} hover:${statusColors[quotation.status]}`}>
                              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openViewDialog(quotation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditStatusDialog(quotation)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this quotation for {quotation.customerName}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => quotation.id && handleDeleteQuotation(quotation.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredQuotations.length > itemsPerPage && (
                <div className="py-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNum = currentPage;
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        // Ensure page numbers are valid
                        if (pageNum <= totalPages && pageNum > 0) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                onClick={() => paginate(pageNum)}
                                isActive={pageNum === currentPage}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Quotation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="font-medium">{selectedQuotation.customerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={`${statusColors[selectedQuotation.status]} hover:${statusColors[selectedQuotation.status]}`}>
                    {selectedQuotation.status.charAt(0).toUpperCase() + selectedQuotation.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                  <p>{new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                  <p className="font-medium">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuotation.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>₹{item.unitPrice.toLocaleString('en-IN')}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>₹{item.totalPrice.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Total Amount:</TableCell>
                        <TableCell className="font-bold">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Quotation Status</DialogTitle>
            <DialogDescription>
              Change the status of this quotation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as 'draft' | 'sent' | 'accepted' | 'rejected')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;
