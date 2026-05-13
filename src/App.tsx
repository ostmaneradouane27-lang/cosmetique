import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Inventory from '@/pages/Inventory';
import Customers from '@/pages/Customers';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Employees from '@/pages/Employees';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Setup from '@/pages/Setup';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useLocation } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading CosmoPOS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If store setup is pending and we are not on the setup page, redirect to setup
  if (user.storeId === 'pending' && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If store setup is DONE and we are on setup page, redirect to dashboard
  if (user.storeId !== 'pending' && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="employees" element={<Employees />} />
            </Route>
          </Routes>
        </TooltipProvider>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
