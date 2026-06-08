import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Calendar, RefreshCw } from 'lucide-react';
import { db } from '../db/db';
import TimelineItem from '../components/TimelineItem';
import Input from '../components/Input';
import { useI18n } from '../i18n';

export default function History({ setCurrentPage, setSelectedCustomerId }) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, TODAY, THIS_WEEK, THIS_MONTH, CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateFilters = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'CUSTOM', label: 'Custom Range' }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        searchQuery,
        dateRange,
        startDate: dateRange === 'CUSTOM' ? startDate : '',
        endDate: dateRange === 'CUSTOM' ? endDate : ''
      };
      
      const result = await db.getHistory(filters);
      setLogs(result);
    } catch (err) {
      console.error('Error fetching global logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce and trigger fetch on filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Don't fetch custom range if start/end dates are not filled
      if (dateRange === 'CUSTOM' && (!startDate || !endDate)) {
        return;
      }
      fetchLogs();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dateRange, startDate, endDate]);

  const handleActivityClick = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentPage('customer_profile');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t('Recharge History')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">Filter recharge records across all customers</p>
      </div>

      {/* Main filter container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col gap-3.5">
        
        {/* Search */}
        <Input
          placeholder="Search by customer name, customer ID, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          type="text"
          voice
        />

        {/* Date Filter Scroll Pills */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Calendar size={12} />
            <span>Date Range</span>
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none snap-x">
            {dateFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateRange(filter.id)}
                className={`snap-start shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all active:scale-95 ${
                  dateRange === filter.id
                    ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range pickers */}
        {dateRange === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 mt-1.5 animate-fadeIn">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">From Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">To Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="animate-spin text-sky-600" size={28} />
            <span className="text-slate-500 text-sm font-semibold">Filtering log history...</span>
          </div>
        ) : logs.length > 0 ? (
          <div className="flex flex-col pl-1">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => handleActivityClick(log.customer_id)}
                className="cursor-pointer hover:bg-slate-50/50 rounded-xl p-1.5 transition-colors active:bg-slate-100"
                title="View Customer Profile"
              >
                <TimelineItem item={log} showCustomerName={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <div className="p-3 bg-slate-50 rounded-full text-slate-300 mb-2">
              <HistoryIcon size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Logs Matching Filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Try modifying your date range or search terms to view recharge records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
