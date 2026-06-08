import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../db/db';
import CustomerCard from '../components/CustomerCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { CUSTOMER_FILTER, CUSTOMER_STATUS } from '../utils/customerStatus';
import { useI18n } from '../i18n';

export default function Customers({ setCurrentPage, setSelectedCustomerId, statusFilter, setStatusFilter }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const statusPills = [
    { id: CUSTOMER_FILTER.ALL, label: t('All') },
    { id: CUSTOMER_STATUS.ACTIVE, label: t('Active') },
    { id: CUSTOMER_STATUS.INACTIVE, label: t('Inactive') },
    { id: CUSTOMER_FILTER.LOST_CARD_CURRENT, label: t('Lost Currently') },
    { id: CUSTOMER_FILTER.LOST_CARD_PREVIOUS, label: t('Lost Previously') },
  ];

  // Debounced search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const result = await db.getCustomers(search, page, 8, statusFilter); // 8 items per page fits mobile view well
      setCustomers(result.data);
      setTotalPages(result.pages);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (id) => {
    setSelectedCustomerId(id);
    setCurrentPage('customer_profile');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('Customers Directory')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{totalCount} {t('total customers')}</p>
        </div>
        <button
          onClick={() => setCurrentPage('customer_add')}
          className="flex items-center gap-1.5 bg-sky-600 text-white font-bold py-2 px-3.5 rounded-xl text-sm shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} className="stroke-[3px]" />
          <span>{t('Add')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Search by customer name, mobile, or customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          voice
          type="text"
          className="w-full"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {statusPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setStatusFilter(pill.id)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
              statusFilter === pill.id
                ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="flex flex-col gap-3 min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="animate-spin text-sky-600" size={28} />
            <span className="text-slate-500 text-sm font-semibold">Searching customer list...</span>
          </div>
        ) : customers.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => handleCustomerClick(customer.id)}
                onRecharge={() => {
                  setSelectedCustomerId(customer.id);
                  setCurrentPage('recharge');
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-3xl text-center">
            <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
              <UserPlus size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('No Customers Found')}</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {search || statusFilter !== CUSTOMER_FILTER.ALL
                ? 'No customers match the current search or status filter.'
                : 'Get started by adding your first water customer.'}
            </p>
            {!search && statusFilter === CUSTOMER_FILTER.ALL && (
              <Button
                onClick={() => setCurrentPage('customer_add')}
                variant="primary"
                fullWidth={false}
                icon={Plus}
                className="mt-4 !py-2.5 text-sm"
              >
                {t('Add First Customer')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 font-bold py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 disabled:opacity-40 disabled:pointer-events-none active:bg-slate-50 transition-all"
          >
            <ChevronLeft size={16} />
            <span>{t('Prev')}</span>
          </button>
          
          <span className="text-sm font-bold text-slate-600">
            {t('Page')} {page} {t('of')} {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 font-bold py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 disabled:opacity-40 disabled:pointer-events-none active:bg-slate-50 transition-all"
          >
            <span>{t('Next')}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
