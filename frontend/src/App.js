import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from './components/ui/Tooltip';

// Pages
import Dashboard from './pages/Dashboard';
import Residency from './pages/Residency';
import Income from './pages/Income';
import Deductions from './pages/Deductions';
import Review from './pages/Review';
import Documents from './pages/Documents';
import Filing from './pages/Filing';
import Login from './pages/Login';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { TaxProvider } from './context/TaxContext';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaxProvider>
          <TooltipProvider>
            <Router>
              <div className="app">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/residency" element={<Residency />} />
                  <Route path="/income" element={<Income />} />
                  <Route path="/deductions" element={<Deductions />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/filing" element={<Filing />} />
                  <Route path="/review" element={<Review />} />
                </Routes>
              </div>
            </Router>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1A365D',
                  color: '#fff',
                },
              }}
            />
          </TooltipProvider>
        </TaxProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
