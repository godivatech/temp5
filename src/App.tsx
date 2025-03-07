
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/dashboard/Customers";
import Products from "./pages/dashboard/Products";
import Quotations from "./pages/dashboard/Quotations";
import Invoices from "./pages/dashboard/Invoices";
import UserManagement from "./pages/dashboard/UserManagement";
import Attendance from "./pages/dashboard/Attendance";

// Routes
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

const queryClient = new QueryClient();

// Firebase configuration check
const firebaseConfigured = () => {
  try {
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
    
    // Check if the Firebase config has been updated
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
  } catch (error) {
    return false;
  }
};

const App = () => {
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(firebaseConfigured());

  useEffect(() => {
    setIsFirebaseConfigured(firebaseConfigured());
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Firebase Configuration Missing</h1>
          <p className="text-gray-600 mb-4">
            Please update the Firebase configuration in <code className="bg-gray-100 px-2 py-1 rounded">src/lib/firebase.ts</code> with your Firebase project details.
          </p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mb-4">
{`const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`}
          </pre>
          <p className="text-gray-600">
            You can find these values in your Firebase project settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/customers" element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/quotations" element={
                <ProtectedRoute>
                  <Quotations />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/invoices" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['master_admin', 'admin']}>
                    <Invoices />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/users" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['master_admin']}>
                    <UserManagement />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/attendance" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['master_admin', 'admin']}>
                    <Attendance />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
