import { initializeApp } from "firebase/app";
import { getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "firebase/auth";
import { getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    where 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Firebase Authentication Types
export type FirebaseUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
};

export type UserRole = 'master_admin' | 'admin' | 'employee';

// User Data Type
export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber: string;
    role: UserRole;
}

// Quotation Interface
export interface Quotation {
    id?: string;
    customerId?: string;
    customerName?: string;
    quotationNumber?: string;
    date?: string;
    items?: Array<{
        name?: string;
        description?: string;
        quantity?: number;
        unitPrice?: number;
    }>;
    totalAmount?: number;
    status?: 'pending' | 'approved' | 'rejected';
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Add this to the existing types:
export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  quotationId?: string;
  customerId?: string;
  customerName?: string;
  invoiceDate?: string;
  dueDate?: string;
  items?: Array<{
    name?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }>;
  totalAmount?: number;
  status?: 'pending' | 'paid' | 'overdue';
  notes?: string;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Authentication Functions
export const registerUser = async (email: string, password: string, name: string, phone: string): Promise<UserData> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile
        await updateProfile(user, {
            displayName: name
        });

        // Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: name,
            phoneNumber: phone,
            role: 'employee' // Default role
        });

        return {
            uid: user.uid,
            email: user.email || '',
            displayName: name,
            phoneNumber: phone,
            role: 'employee'
        };
    } catch (error: any) {
        console.error("Error registering user:", error.message);
        throw new Error(error.message);
    }
};

export const loginUser = async (email: string, password: string): Promise<UserData> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            return userData;
        } else {
            throw new Error("User data not found in Firestore");
        }
    } catch (error: any) {
        console.error("Error logging in user:", error.message);
        throw new Error(error.message);
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: any) {
        console.error("Error logging out user:", error.message);
        throw new Error(error.message);
    }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            const firebaseUser: FirebaseUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            };
            callback(firebaseUser);
        } else {
            callback(null);
        }
    });
};

// Firestore Functions
export const getCurrentUserData = async (): Promise<UserData> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently logged in.");
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as UserData;
    } else {
        throw new Error("User data not found in Firestore");
    }
};

// Quotation Functions
export const getQuotations = async (): Promise<Quotation[]> => {
    try {
        const quotationsCollection = collection(db, "quotations");
        const quotationSnapshot = await getDocs(quotationsCollection);
        return quotationSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Quotation[];
    } catch (error: any) {
        console.error("Error fetching quotations:", error.message);
        throw new Error(error.message);
    }
};

export const createQuotation = async (quotationData: Quotation): Promise<Quotation> => {
    try {
        const quotationsCollection = collection(db, "quotations");
        const docRef = await addDoc(quotationsCollection, quotationData);
        const docSnapshot = await getDoc(docRef);
        return {
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as Quotation;
    } catch (error: any) {
        console.error("Error creating quotation:", error.message);
        throw new Error(error.message);
    }
};

export const updateQuotation = async (quotationId: string, updates: Partial<Quotation>): Promise<void> => {
    try {
        const quotationDocRef = doc(db, "quotations", quotationId);
        await updateDoc(quotationDocRef, updates);
    } catch (error: any) {
        console.error("Error updating quotation:", error.message);
        throw new Error(error.message);
    }
};

export const deleteQuotation = async (quotationId: string): Promise<void> => {
    try {
        const quotationDocRef = doc(db, "quotations", quotationId);
        await deleteDoc(quotationDocRef);
    } catch (error: any) {
        console.error("Error deleting quotation:", error.message);
        throw new Error(error.message);
    }
};

// User Management Functions
export const getAllUsers = async (): Promise<UserData[]> => {
    try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        return usersSnapshot.docs.map(doc => doc.data() as UserData);
    } catch (error: any) {
        console.error("Error fetching users:", error.message);
        throw new Error(error.message);
    }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { role: newRole });
    } catch (error: any) {
        console.error("Error updating user role:", error.message);
        throw new Error(error.message);
    }
};

// Attendance Functions
export const addAttendanceRecord = async (userId: string, date: string, timeIn: string, timeOut: string): Promise<void> => {
    try {
        const attendanceCollection = collection(db, "attendance");
        await addDoc(attendanceCollection, {
            userId,
            date,
            timeIn,
            timeOut
        });
    } catch (error: any) {
        console.error("Error adding attendance record:", error.message);
        throw new Error(error.message);
    }
};

export const getAttendanceRecords = async (): Promise<any[]> => {
    try {
        const attendanceCollection = collection(db, "attendance");
        const attendanceSnapshot = await getDocs(attendanceCollection);
        return attendanceSnapshot.docs.map(doc => doc.data());
    } catch (error: any) {
        console.error("Error fetching attendance records:", error.message);
        throw new Error(error.message);
    }
};

// Storage Functions
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error: any) {
        console.error("Error uploading file:", error.message);
        throw new Error(error.message);
    }
};

// Initial Master Admin Account
export const initializeMasterAdmin = async (email: string, password: string, name: string, phone: string): Promise<UserData | null> => {
    try {
        // Check if a master admin already exists
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where("role", "==", "master_admin"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log("Master admin account already exists.");
            return null;
        }

        // Create the new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile
        await updateProfile(user, {
            displayName: name
        });

        // Set master admin role in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: name,
            phoneNumber: phone,
            role: 'master_admin'
        });

        return {
            uid: user.uid,
            email: user.email || '',
            displayName: name,
            phoneNumber: phone,
            role: 'master_admin'
        };
    } catch (error: any) {
        console.error("Error initializing master admin:", error.message);
        throw new Error(error.message);
    }
};

// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    try {
        const invoicesCollection = collection(db, "invoices");
        const invoiceSnapshot = await getDocs(invoicesCollection);
        return invoiceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Invoice[];
    } catch (error: any) {
        console.error("Error fetching invoices:", error.message);
        throw new Error(error.message);
    }
};

// Create a new invoice
export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const db = getFirestore();
    const invoicesCollection = collection(db, "invoices");
    
    const docRef = await addDoc(invoicesCollection, {
      ...invoiceData,
      createdAt: new Date().toISOString(),
    });
    
    // Get the complete invoice data
    const invoiceDoc = await getDoc(docRef);
    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice;
    
    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice.");
  }
}

// Get a specific invoice by ID
export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  try {
    const db = getFirestore();
    const invoiceRef = doc(db, "invoices", invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);
    
    if (!invoiceDoc.exists()) {
      throw new Error("Invoice not found.");
    }
    
    return { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw new Error("Failed to fetch invoice.");
  }
}
