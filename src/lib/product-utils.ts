
import { Product, QuotationItem } from '@/lib/firebase';

// Helper function to get product quantity
export const getProductQuantity = (product: Product): number => {
  // Handle both "quantity" and "qty" fields for backward compatibility
  if (typeof product.quantity === 'number') {
    return product.quantity;
  } else if (typeof (product as any).qty === 'number') {
    return (product as any).qty;
  }
  return 0;
};

// Create a quotation item from a product
export const createQuotationItemFromProduct = (
  product: Product, 
  quantity: number = 1
): QuotationItem => {
  return {
    productId: product.id || '',
    productName: product.name,
    quantity: quantity,
    unit: product.unit,
    unitPrice: product.price,
    totalPrice: product.price * quantity
  };
};

// Calculate total for a quotation item
export const calculateItemTotal = (item: QuotationItem): number => {
  return (item.quantity || 0) * (item.unitPrice || 0);
};

// Calculate grand total for all items
export const calculateGrandTotal = (items: QuotationItem[]): number => {
  return items.reduce((total, item) => total + (item.totalPrice || 0), 0);
};

// Format currency for Indian Rupee
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// Validate a quotation item
export const validateQuotationItem = (item: QuotationItem): boolean => {
  return (
    !!item.productId &&
    !!item.productName &&
    typeof item.quantity === 'number' && 
    item.quantity > 0 &&
    typeof item.unitPrice === 'number' && 
    item.unitPrice >= 0 &&
    typeof item.totalPrice === 'number' && 
    item.totalPrice >= 0
  );
};
