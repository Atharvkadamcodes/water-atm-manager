import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerAdd from './pages/CustomerAdd';
import CustomerEdit from './pages/CustomerEdit';
import CustomerProfile from './pages/CustomerProfile';
import Recharge from './pages/Recharge';
import LostCard from './pages/LostCard';
import History from './pages/History';
import Settings from './pages/Settings';
import { db } from './db/db';
import { isSupabaseConfigured } from './db/supabase';
import { CUSTOMER_FILTER } from './utils/customerStatus';
import { useI18n } from './i18n';

export default function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerStatusFilter, setCustomerStatusFilter] = useState(CUSTOMER_FILTER.ALL);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const session = await db.checkSession();
        if (mounted) {
          setAdminUser(session);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    let subscription;
    if (isSupabaseConfigured) {
      const authListener = db.onAuthStateChange((session) => {
        if (mounted) {
          setAdminUser(session);
        }
      });
      subscription = authListener?.data?.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const handleLoginSuccess = (session) => {
    setAdminUser(session);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await db.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAdminUser(null);
      setCurrentPage('dashboard');
      setSelectedCustomerId(null);
    }
  };

  // Intercept navigation to clear customer context if navigating from main tabs
  const navigateTo = (pageId) => {
    if (['dashboard', 'customers', 'recharge', 'history'].includes(pageId)) {
      setSelectedCustomerId(null);
    }
    if (pageId !== 'customers') {
      setCustomerStatusFilter(CUSTOMER_FILTER.ALL);
    }
    setCurrentPage(pageId);
  };

  const getCurrentPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return t('Dashboard');
      case 'customers': return t('Customers');
      case 'customer_add': return t('Add Customer');
      case 'customer_edit': return t('Edit Customer');
      case 'customer_profile': return t('Customer Details');
      case 'recharge': return t('Recharge');
      case 'lost_card': return 'Replace Lost Card';
      case 'history': return t('Recharge History');
      case 'settings': return t('Settings');
      default: return 'Water ATM Manager';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-semibold text-sm">Initializing app...</span>
        </div>
      </div>
    );
  }

  // If not logged in, force render Login page
  if (!adminUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Router switch to select body page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
            setCustomerStatusFilter={setCustomerStatusFilter}
          />
        );
      case 'customers':
        return (
          <Customers 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
            statusFilter={customerStatusFilter}
            setStatusFilter={setCustomerStatusFilter}
          />
        );
      case 'customer_add':
        return (
          <CustomerAdd 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
          />
        );
      case 'customer_profile':
        return (
          <CustomerProfile 
            customerId={selectedCustomerId} 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
          />
        );
      case 'customer_edit':
        return (
          <CustomerEdit
            customerId={selectedCustomerId}
            setCurrentPage={navigateTo}
            setSelectedCustomerId={setSelectedCustomerId}
          />
        );
      case 'recharge':
        return (
          <Recharge 
            customerId={selectedCustomerId} 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
          />
        );
      case 'lost_card':
        return (
          <LostCard 
            customerId={selectedCustomerId} 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
          />
        );
      case 'history':
        return (
          <History 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
          />
        );
      case 'settings':
        return (
          <Settings
            onLogout={handleLogout}
            adminUser={adminUser}
          />
        );
      default:
        return (
          <Dashboard 
            setCurrentPage={navigateTo} 
            setSelectedCustomerId={setSelectedCustomerId} 
            setCustomerStatusFilter={setCustomerStatusFilter}
          />
        );
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={navigateTo} 
      onLogout={handleLogout} 
      adminUser={adminUser}
      title={getCurrentPageTitle()}
    >
      {renderPage()}
    </Layout>
  );
}
