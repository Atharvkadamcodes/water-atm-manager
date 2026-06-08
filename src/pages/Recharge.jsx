import React, { useState, useEffect } from 'react';
import { IndianRupee, ArrowLeft, Save, AlertCircle, User, RefreshCw } from 'lucide-react';
import { db } from '../db/db';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Recharge({ customerId, setCurrentPage, setSelectedCustomerId }) {
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
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
      } catch (err) {
        setError('Could not load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amtFloat = parseFloat(amount);
    if (isNaN(amtFloat) || amtFloat <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await db.addRecharge(customerId, amtFloat, notes.trim());
      setSelectedCustomerId(customerId);
      setCurrentPage('customer_profile');
    } catch (err) {
      setError(err.message || 'Failed to save recharge.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="animate-spin text-sky-600" size={28} />
        <span className="text-slate-500 text-sm font-semibold">Loading customer...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setSelectedCustomerId(customerId); setCurrentPage('customer_profile'); }}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 m-0">Record Recharge</h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">Record a recharge entry for this customer</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-5">
        {/* Customer banner — read-only, no search */}
        {customer && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="bg-sky-100 text-sky-700 p-2 rounded-xl shrink-0">
              <User size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wide">Customer</span>
              <div className="text-base font-bold text-slate-800 leading-snug">{customer.full_name}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <Input label="Recharge Amount (₹)" id="amount" type="number" inputMode="decimal"
            placeholder="Enter amount (e.g. 200)" value={amount}
            onChange={(e) => setAmount(e.target.value)} icon={IndianRupee}
            required disabled={submitting} autoFocus
            helperText="Exact amount paid by the customer" />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="notes" className="text-sm font-bold text-slate-700">Optional Notes</label>
            <textarea id="notes" rows={2} placeholder="e.g. Paid in cash, UPI ref, etc."
              value={notes} onChange={(e) => setNotes(e.target.value)} disabled={submitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all" />
          </div>

          <div className="bg-sky-50 border border-sky-100 text-sky-800 text-xs p-3 rounded-2xl flex gap-2 items-start">
            <AlertCircle size={16} className="shrink-0 text-sky-600 mt-0.5" />
            <span className="leading-relaxed font-medium">
              <strong>Note:</strong> The ATM machine manages the actual card balance internally. This form only records the transaction history.
            </span>
          </div>

          <Button type="submit" variant="success" disabled={submitting} icon={Save} fullWidth>
            {submitting ? 'Saving Recharge...' : 'Confirm & Save Recharge'}
          </Button>
        </form>
      </div>
    </div>
  );
}
