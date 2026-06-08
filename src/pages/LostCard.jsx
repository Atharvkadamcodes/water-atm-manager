import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle, User } from 'lucide-react';
import { db } from '../db/db';
import Button from '../components/Button';

export default function LostCard({ customerId, setCurrentPage, setSelectedCustomerId }) {
  const [customer, setCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) {
      setCurrentPage('customers');
      return;
    }
    (async () => {
      try {
        const result = await db.getCustomerById(customerId);
        setCustomer(result.customer);
      } catch (e) {
        setError('Failed to load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await db.markCardLost(customerId);
      setSelectedCustomerId(customerId);
      setCurrentPage('customer_profile');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="animate-pulse text-amber-600" size={28} />
        <span className="text-slate-500 text-sm font-semibold">Loading data…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setCurrentPage('customer_profile'); setSelectedCustomerId(customerId); }}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Replace Card</h2>
          <p className="text-xs text-slate-500 mt-0.5">Assign a replacement card to reactivate this customer</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        {/* Customer banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shrink-0 mt-0.5">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-amber-700">Customer</div>
            <div className="font-bold text-slate-800 mt-0.5">{customer.full_name}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}
          <div className="bg-amber-50 border border-amber-100 text-amber-900 text-xs p-3.5 rounded-2xl flex gap-2.5 items-start leading-relaxed font-medium">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Actions Performed:</strong>
              <ul className="list-disc pl-4 mt-1 flex flex-col gap-0.5">
                <li>Move customer back to Active status</li>
                <li>Keep recharge workflow inside the customer profile</li>
              </ul>
            </div>
          </div>

          <Button type="submit" variant="danger" disabled={submitting} icon={Save} fullWidth>
            {submitting ? 'Saving…' : 'Confirm Status Update'}
          </Button>
        </form>
      </div>
    </div>
  );
}
