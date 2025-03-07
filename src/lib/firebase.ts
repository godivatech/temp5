import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  push, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  DatabaseReference
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBo8D4pTG6oNGg4qy7V4AaC73qfAB0HRcc",
  authDomain: "solar-energy-56bc8.firebaseapp.com",
  databaseURL: "https://solar-energy-56bc8-default-rtdb.firebaseio.com",
  projectId: "solar-energy-56bc8",
  storageBucket: "solar-energy-56bc8.firebasestorage.app",
  messagingSenderId: "833087081002",
  appId: "1:833087081002:web:10001186150884d311d153",
  measurementId: "G-2S9TJM6E3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Role types
export type UserRole = 'master_admin' | 'admin' | 'employee';

// User data type
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: number;
}

// Customer type
export interface Customer {
  id?: string;
  name: string;
  address: string;
  email: string;
  location: string;
  scope: string;
  createdAt: number;
  createdBy: string;
}

// Product type
export interface Product {
  id?: string;
  name: string;
  type: string;
  voltage: string;
  rating: string;
  make: string;
  quantity: number;
  unit: string;
  price: number;
  createdAt: number;
  createdBy: string;
}

// Quotation type
export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id?: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  createdAt: number;
  createdBy: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

// Invoice type
export interface Invoice {
  id?: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  createdAt: number;
  createdBy: string;
  pdfUrl?: string;
  status?: 'paid' | 'pending' | 'overdue' | 'draft';
}

// Attendance type
export interface AttendanceRecord {
  id?: string;
  userId: string;
  userName: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

// Auth functions
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string, 
  phoneNumber: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });
    
    // Save additional user data to the database
    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      displayName,
      phoneNumber,
      role: 'employee', // Default role
      createdAt: Date.now(),
    };
    
    await set(ref(database, `users/${user.uid}`), userData);
    
    return userData;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Master admin initialization function
export const initializeMasterAdmin = async (
  email: string, 
  password: string, 
  displayName: string, 
  phoneNumber: string
) => {
  try {
    // Check if master admin already exists
    const masterAdminQuery = query(
      ref(database, 'users'),
      orderByChild('role'),
      equalTo('master_admin')
    );
    
    const snapshot = await get(masterAdminQuery);
    
    if (snapshot.exists()) {
      console.log("Master admin already exists");
      return null;
    }

    // If no master admin exists, create one
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });
    
    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      displayName,
      phoneNumber,
      role: 'master_admin',
      createdAt: Date.now(),
    };
    
    await set(ref(database, `users/${user.uid}`), userData);
    
    return userData;
  } catch (error) {
    console.error("Error initializing master admin:", error);
    throw error;
  }
};

// Login function
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from database
    const userDataSnapshot = await get(ref(database, `users/${user.uid}`));
    const userData = userDataSnapshot.val() as UserData;
    
    return userData;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Get current user data
export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    const userDataSnapshot = await get(ref(database, `users/${user.uid}`));
    return userDataSnapshot.val() as UserData;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  try {
    // Check if current user is master admin
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || currentUser.role !== 'master_admin') {
      throw new Error("Only master admin can update user roles");
    }
    
    await update(ref(database, `users/${userId}`), { role: newRole });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Database functions for customers
export const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const customerRef = ref(database, 'customers');
    const newCustomerRef = push(customerRef);
    
    const newCustomer: Customer = {
      ...customer,
      createdAt: Date.now(),
      createdBy: user.uid,
    };
    
    await set(newCustomerRef, newCustomer);
    return { id: newCustomerRef.key, ...newCustomer };
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
  try {
    await update(ref(database, `customers/${customerId}`), updates);
    return true;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (customerId: string) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to delete customers");
    }
    
    await remove(ref(database, `customers/${customerId}`));
    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

export const getCustomers = async () => {
  try {
    const customersRef = ref(database, 'customers');
    const snapshot = await get(customersRef);
    
    if (!snapshot.exists()) return [];
    
    const customers: Customer[] = [];
    snapshot.forEach((childSnapshot) => {
      customers.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return customers;
  } catch (error) {
    console.error("Error getting customers:", error);
    throw error;
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    const customerRef = ref(database, `customers/${customerId}`);
    const snapshot = await get(customerRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.key,
      ...snapshot.val()
    } as Customer;
  } catch (error) {
    console.error("Error getting customer:", error);
    throw error;
  }
};

// Database functions for products
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'createdBy'>) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to add products");
    }
    
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const productRef = ref(database, 'products');
    const newProductRef = push(productRef);
    
    const newProduct: Product = {
      ...product,
      createdAt: Date.now(),
      createdBy: user.uid,
    };
    
    await set(newProductRef, newProduct);
    return { id: newProductRef.key, ...newProduct };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>) => {
  try {
    await update(ref(database, `products/${productId}`), updates);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to delete products");
    }
    
    await remove(ref(database, `products/${productId}`));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);
    
    if (!snapshot.exists()) return [];
    
    const products: Product[] = [];
    snapshot.forEach((childSnapshot) => {
      products.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductById = async (productId: string) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.key,
      ...snapshot.val()
    } as Product;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Database functions for quotations
export const createQuotation = async (quotation: Omit<Quotation, 'id' | 'createdAt' | 'createdBy'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const quotationsRef = ref(database, 'quotations');
    const newQuotationRef = push(quotationsRef);
    
    const newQuotation: Quotation = {
      ...quotation,
      createdAt: Date.now(),
      createdBy: user.uid,
    };
    
    await set(newQuotationRef, newQuotation);
    return { id: newQuotationRef.key, ...newQuotation };
  } catch (error) {
    console.error("Error creating quotation:", error);
    throw error;
  }
};

export const updateQuotation = async (quotationId: string, updates: Partial<Quotation>) => {
  try {
    await update(ref(database, `quotations/${quotationId}`), updates);
    return true;
  } catch (error) {
    console.error("Error updating quotation:", error);
    throw error;
  }
};

export const deleteQuotation = async (quotationId: string) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to delete quotations");
    }
    
    await remove(ref(database, `quotations/${quotationId}`));
    return true;
  } catch (error) {
    console.error("Error deleting quotation:", error);
    throw error;
  }
};

export const getQuotations = async () => {
  try {
    const quotationsRef = ref(database, 'quotations');
    const snapshot = await get(quotationsRef);
    
    if (!snapshot.exists()) return [];
    
    const quotations: Quotation[] = [];
    snapshot.forEach((childSnapshot) => {
      quotations.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return quotations;
  } catch (error) {
    console.error("Error getting quotations:", error);
    throw error;
  }
};

export const getQuotationById = async (quotationId: string) => {
  try {
    const quotationRef = ref(database, `quotations/${quotationId}`);
    const snapshot = await get(quotationRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.key,
      ...snapshot.val()
    } as Quotation;
  } catch (error) {
    console.error("Error getting quotation:", error);
    throw error;
  }
};

// Database functions for invoices
export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'createdBy'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const invoicesRef = ref(database, 'invoices');
    const newInvoiceRef = push(invoicesRef);
    
    const newInvoice: Invoice = {
      ...invoice,
      createdAt: Date.now(),
      createdBy: user.uid,
    };
    
    await set(newInvoiceRef, newInvoice);
    return { id: newInvoiceRef.key, ...newInvoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
  try {
    await update(ref(database, `invoices/${invoiceId}`), updates);
    return true;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to delete invoices");
    }
    
    await remove(ref(database, `invoices/${invoiceId}`));
    return true;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

export const getInvoices = async () => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to view invoices");
    }
    
    const invoicesRef = ref(database, 'invoices');
    const snapshot = await get(invoicesRef);
    
    if (!snapshot.exists()) return [];
    
    const invoices: Invoice[] = [];
    snapshot.forEach((childSnapshot) => {
      invoices.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return invoices;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (invoiceId: string) => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to view this invoice");
    }
    
    const invoiceRef = ref(database, `invoices/${invoiceId}`);
    const snapshot = await get(invoiceRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.key,
      ...snapshot.val()
    } as Invoice;
  } catch (error) {
    console.error("Error getting invoice:", error);
    throw error;
  }
};

// Attendance functions
export const markAttendance = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = today.toTimeString().split(' ')[0]; // HH:MM:SS
    
    // Check if already marked attendance today
    const userAttendanceQuery = query(
      ref(database, 'attendance'),
      orderByChild('userId'),
      equalTo(user.uid)
    );
    
    const snapshot = await get(userAttendanceQuery);
    let found = false;
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const record = childSnapshot.val() as AttendanceRecord;
        if (record.date === dateStr) {
          found = true;
          
          // Update timeOut if already marked in
          if (!record.timeOut) {
            update(childSnapshot.ref, {
              timeOut: timeStr,
              status: 'present'
            });
          }
        }
      });
    }
    
    if (!found) {
      // Mark new attendance
      const userData = await getCurrentUserData();
      if (!userData) throw new Error("User data not found");
      
      const attendanceRef = ref(database, 'attendance');
      const newAttendanceRef = push(attendanceRef);
      
      const attendanceRecord: AttendanceRecord = {
        userId: user.uid,
        userName: userData.displayName,
        date: dateStr,
        timeIn: timeStr,
        status: 'present'
      };
      
      await set(newAttendanceRef, attendanceRecord);
      return { id: newAttendanceRef.key, ...attendanceRecord };
    }
    
    return true;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

export const getUserAttendance = async (userId?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const targetUserId = userId || user.uid;
    
    // If requesting other user's attendance, check permission
    if (targetUserId !== user.uid) {
      const currentUser = await getCurrentUserData();
      
      if (!currentUser || !['master_admin', 'admin'].includes(currentUser.role)) {
        throw new Error("You don't have permission to view other users' attendance");
      }
    }
    
    const userAttendanceQuery = query(
      ref(database, 'attendance'),
      orderByChild('userId'),
      equalTo(targetUserId)
    );
    
    const snapshot = await get(userAttendanceQuery);
    
    if (!snapshot.exists()) return [];
    
    const attendanceRecords: AttendanceRecord[] = [];
    snapshot.forEach((childSnapshot) => {
      attendanceRecords.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return attendanceRecords;
  } catch (error) {
    console.error("Error getting attendance:", error);
    throw error;
  }
};

export const getAllUsersAttendance = async () => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin'].includes(currentUser.role)) {
      throw new Error("You don't have permission to view all attendance records");
    }
    
    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (!snapshot.exists()) return [];
    
    const attendanceRecords: AttendanceRecord[] = [];
    snapshot.forEach((childSnapshot) => {
      attendanceRecords.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val()
      });
    });
    
    return attendanceRecords;
  } catch (error) {
    console.error("Error getting all attendance records:", error);
    throw error;
  }
};

// User management functions
export const getUsers = async () => {
  try {
    // Check if user has permission
    const currentUser = await getCurrentUserData();
    
    if (!currentUser || !['master_admin'].includes(currentUser.role)) {
      throw new Error("Only master admin can view all users");
    }
    
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) return [];
    
    const users: UserData[] = [];
    snapshot.forEach((childSnapshot) => {
      users.push(childSnapshot.val());
    });
    
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// Setup auth listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Export Firebase instances - fixing the isolatedModules type export issue
export { auth, database, ref, onValue };
export type { FirebaseUser };

