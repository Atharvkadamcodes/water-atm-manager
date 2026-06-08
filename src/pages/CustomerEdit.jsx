import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Phone, RefreshCw } from 'lucide-react';
import { db } from '../db/db';
import Input from '../components/Input';
import Button from '../components/Button';
import { useI18n } from '../i18n';

export default function CustomerEdit({ customerId, setCurrentPage, setSelectedCustomerId }) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customerId) {
      setCurrentPage('customers');
      return;
    }
    (async () => {
      try {
        const result = await db.getCustomerById(customerId);
        const c = result.customer;
        setFullName(c.full_name);
        setMobileNumber(c.mobile_number);
      } catch (err) {
        setError('Could not load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Name is required'); return; }
    if (!mobileNumber.trim()) { setError('Mobile number is required'); return; }

    setSubmitting(true);
    setError('');
    try {
      await db.updateCustomer(customerId, {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      setSelectedCustomerId(customerId);
      setCurrentPage('customer_profile');
    } catch (err) {
      setError(err.message || 'Failed to update customer.');
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
          <h2 className="text-xl font-bold text-slate-800 m-0">{t('Edit Customer')}</h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">Update profile details</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <Input label={t('Customer Full Name')} id="editFullName" placeholder="e.g. Ramesh Kumar"
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            icon={User} required disabled={submitting} voice />

          <Input label={t('Mobile Number')} id="editMobile" type="tel" placeholder="e.g. 9876543210"
            value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
            icon={Phone} required disabled={submitting} voice />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              Status is changed from the customer profile using the Change Status action.
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button onClick={() => { setSelectedCustomerId(customerId); setCurrentPage('customer_profile'); }}
              variant="secondary" disabled={submitting} fullWidth>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} icon={Save} fullWidth>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
