import React, { useEffect, useState } from 'react';
import { AlertTriangle, ClipboardList, IndianRupee, RefreshCw, UserCheck, Users } from 'lucide-react';
import { db } from '../db/db';
import { CUSTOMER_FILTER } from '../utils/customerStatus';
import TimelineItem from '../components/TimelineItem';
import Button from '../components/Button';
import { PlusCircle, Search } from 'lucide-react';
import { useI18n } from '../i18n';

export default function Dashboard({ setCurrentPage, setSelectedCustomerId, setCustomerStatusFilter }) {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();

  const fetchData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        db.getStats(),
        db.getRecentActivities(5)
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openCustomerFilter = (filter) => {
    setCustomerStatusFilter(filter);
    setCurrentPage('customers');
  };

  const handleActivityClick = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentPage('customer_profile');
  };

  const statCards = [
    {
      label: t('Total Customers'),
      value: stats?.totalCustomers || 0,
      Icon: Users,
      color: 'bg-blue-50 text-blue-600',
      onClick: () => openCustomerFilter(CUSTOMER_FILTER.ALL)
    },
    {
      label: t('Active Customers'),
      value: stats?.activeCustomers || 0,
      Icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      onClick: () => openCustomerFilter(CUSTOMER_FILTER.ACTIVE)
    },
    {
      label: t('Inactive Customers'),
      value: stats?.inactiveCustomers || 0,
      Icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      onClick: () => openCustomerFilter(CUSTOMER_FILTER.INACTIVE)
    },
    {
      label: t('Lost Currently'),
      value: stats?.currentLostCardCustomers || 0,
      Icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-600',
      onClick: () => openCustomerFilter(CUSTOMER_FILTER.LOST_CARD_CURRENT)
    },
    {
      label: t('Lost Previously'),
      value: stats?.previousLostCardCustomers || 0,
      Icon: AlertTriangle,
      color: 'bg-slate-100 text-slate-600',
      onClick: () => openCustomerFilter(CUSTOMER_FILTER.LOST_CARD_PREVIOUS)
    },
    {
      label: t('Recharge Entries'),
      value: stats?.totalRecharges || 0,
      Icon: ClipboardList,
      color: 'bg-sky-50 text-sky-600',
      onClick: () => setCurrentPage('history')
    },
    {
      label: t('Recharge Revenue'),
      value: `₹${Math.round(stats?.totalRechargeRevenue || 0)}`,
      Icon: IndianRupee,
      color: 'bg-lime-50 text-lime-700',
      onClick: () => setCurrentPage('history')
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="animate-spin text-sky-600" size={32} />
        <span className="text-slate-500 font-semibold text-sm">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('Business Overview')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('Real-time status of customer accounts and activity')}</p>
        </div>
        <button 
          onClick={handleRefresh}
          className={`p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-all ${
            refreshing ? 'animate-spin text-sky-600' : ''
          }`}
          disabled={refreshing}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, Icon, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="min-h-[132px] bg-white border border-slate-200 rounded-2xl p-3 text-left shadow-sm active:bg-slate-50 transition-colors flex flex-col justify-between"
          >
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={23} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight min-h-[26px]">
                {label}
              </div>
              <div className="text-2xl font-black text-slate-800 leading-tight mt-1 break-words">
                {value}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-sky-900">{t('Quick Actions')}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <Button onClick={() => setCurrentPage('customer_add')} variant="primary" fullWidth icon={PlusCircle} className="!py-3 text-sm">
            {t('Add Customer')}
          </Button>
          <Button onClick={() => setCurrentPage('customers')} variant="secondary" fullWidth icon={Search} className="!py-3 text-sm">
            {t('Search Customer')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">{t('Recent Activities')}</h3>
          <button onClick={() => setCurrentPage('history')} className="text-xs font-bold text-sky-600 hover:text-sky-800 active:scale-95 transition-all">
            {t('View All')}
          </button>
        </div>

        <div className="mt-2 divide-y divide-slate-100">
          {recentActivities.length > 0 ? (
            <div className="flex flex-col pt-1">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity.customer_id)}
                  className="cursor-pointer hover:bg-slate-50/50 rounded-xl p-1.5 transition-colors active:bg-slate-100"
                >
                  <TimelineItem item={activity} showCustomerName={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-slate-400 font-medium">
              {t('No recent activities recorded.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
