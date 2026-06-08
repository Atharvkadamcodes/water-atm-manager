import React from 'react';
import { 
  IndianRupee, 
  StickyNote
} from 'lucide-react';

export function formatDate(dateString) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    // Formats to "DD-MMM-YYYY" (e.g., "08-Jun-2026")
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${day}-${month}-${year} ${time}`;
  } catch (e) {
    return dateString;
  }
}

export default function TimelineItem({ item, showCustomerName = false, compact = false }) {
  const { event_type, amount, notes, created_at, customer_name, customer_code } = item;

  if (event_type !== 'RECHARGE') {
    return null;
  }

  return (
    <div className={`flex gap-3 relative group ${compact ? 'pb-4 last:pb-1' : 'pb-6 last:pb-2'}`}>
      {/* Connector line */}
      <div className={`absolute left-5 bottom-0 w-[2px] bg-slate-200 group-last:hidden ${compact ? 'top-9' : 'top-10'}`}></div>

      {/* Circle Icon */}
      <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 z-10 shadow-sm bg-emerald-50 text-emerald-600 border-emerald-200">
        <IndianRupee size={18} />
      </div>

      {/* Details Box */}
      <div className="flex-1 pt-1 min-w-0">
        <div className="text-xs font-semibold text-slate-400">
          {compact ? formatDateTime(created_at) : formatDate(created_at)}
        </div>
        
        {showCustomerName && (
          <div className="mt-1">
            <div className="text-sm font-bold text-slate-800">{customer_name}</div>
            <div className="text-base mt-0.5 text-emerald-800 font-bold">
              Recharge ₹{amount}
            </div>
          </div>
        )}

        {!showCustomerName && (
          <div className="text-base mt-0.5 text-emerald-800 font-bold">
            Recharge ₹{amount}
          </div>
        )}

        {notes && (
          <div className={`mt-1.5 rounded-lg leading-relaxed ${compact ? 'text-xs p-2' : 'text-sm p-2'} bg-white border border-slate-100 text-slate-500`}>
            <div className="flex items-start gap-1.5">
              <StickyNote size={14} className="shrink-0 mt-0.5 text-slate-400" />
              <span>{notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
