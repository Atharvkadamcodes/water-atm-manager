import React from 'react';
import { Phone, User, ChevronRight } from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel, hasOpenLostCard, normalizeCustomerStatus } from '../utils/customerStatus';

export default function CustomerCard({ customer, onClick }) {
  const { id, customer_code, full_name, mobile_number } = customer;
  const status = normalizeCustomerStatus(customer);
  const statusLabel = getStatusLabel(status);
  const lostCardOpen = hasOpenLostCard(customer);

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-4 shadow-sm active:bg-slate-50 transition-all duration-150 cursor-pointer flex items-center gap-4 ${
        status === 'ACTIVE' ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {customer_code || `CUST-${String(id).padStart(4, '0')}`}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeClasses(status)}`}>
            {statusLabel}
          </span>
          {lostCardOpen && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border text-rose-700 bg-rose-50 border-rose-100">
              Lost Card
            </span>
          )}
        </div>

        <p className="text-lg font-bold text-slate-800 truncate flex items-center gap-2 mt-0.5 m-0">
          <User size={16} className="text-slate-400 shrink-0" />
          {full_name}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-slate-400 shrink-0" />
            {mobile_number}
          </span>
        </div>
      </div>

      <div className="bg-slate-50 p-2 rounded-full shrink-0">
        <ChevronRight size={18} className="text-slate-400" />
      </div>
    </div>
  );
}
