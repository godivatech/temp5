
import React from 'react';
import { Header } from '@/components/dashboard/Header';

const Invoices = () => {
  return (
    <>
      <Header title="Invoices" />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-800">Invoices</h1>
            <p className="text-gray-600">Manage your invoices</p>
          </div>
          
          {/* Invoice content here */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <p>Invoice management interface coming soon...</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Invoices;
