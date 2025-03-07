
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  getQuotations, 
  Quotation, 
  QuotationItem,
  getProducts,
  Product
} from '@/lib/firebase';
import { toast } from 'sonner';

const Quotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quotationsData, productsData] = await Promise.all([
          getQuotations(),
          getProducts()
        ]);
        setQuotations(quotationsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching quotations:', error);
        toast.error('Failed to load quotations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get product details by ID
  const getProductDetails = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Safe number formatter to handle undefined values
  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-IN');
  };

  return (
    <>
      <Header title="Quotations" />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-800">Quotations</h1>
            <p className="text-gray-600">Manage your quotations</p>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading quotations...</p>
            </div>
          ) : quotations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotations.map((quotation) => (
                <Card key={quotation.id} className="p-4 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm border-green-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{quotation.customerName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quotation.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Items</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {quotation.items && Array.isArray(quotation.items) ? 
                        quotation.items.map((item, index) => {
                          const product = getProductDetails(item.productId);
                          return (
                            <div key={index} className="text-sm border-b border-gray-100 py-1 flex justify-between">
                              <span>{item.productName}</span>
                              <span>
                                {item.quantity || 0} {item.unit} x ₹{formatNumber(item.unitPrice)}
                              </span>
                            </div>
                          );
                        }) : 
                        <p className="text-sm text-gray-500">No items in this quotation</p>
                      }
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-green-700">
                      ₹{formatNumber(quotation.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No quotations found</p>
              <Button className="mt-4">Create New Quotation</Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Quotations;
