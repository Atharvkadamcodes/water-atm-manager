import React, { useState } from 'react';
import { User, Phone, ArrowLeft, Save, IndianRupee } from 'lucide-react';
import { db } from '../db/db';
import Input from '../components/Input';
import Button from '../components/Button';
import { useI18n } from '../i18n';

export default function CustomerAdd({ setCurrentPage, setSelectedCustomerId }) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [initialRechargeAmount, setInitialRechargeAmount] = useState('');
  const [initialRechargeNotes, setInitialRechargeNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Full name is required';
    if (!mobileNumber.trim()) {
      tempErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(mobileNumber.replace(/[\s+-]/g, ''))) {
      tempErrors.mobileNumber = 'Enter a valid mobile number (10+ digits)';
    }
    if (initialRechargeAmount.trim()) {
      const amount = parseFloat(initialRechargeAmount);
      if (isNaN(amount) || amount <= 0) {
        tempErrors.initialRechargeAmount = 'Enter a valid recharge amount';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newCustomer = await db.addCustomer(
        fullName.trim(),
        mobileNumber.trim()
      );

      if (initialRechargeAmount.trim()) {
        await db.addRecharge(
          newCustomer.id,
          parseFloat(initialRechargeAmount),
          initialRechargeNotes.trim() || 'Initial recharge'
        );
      }
      
      // Redirect directly to the newly created customer profile
      setSelectedCustomerId(newCustomer.id);
      setCurrentPage('customer_profile');
    } catch (error) {
      console.error('Failed to create customer:', error);
      setErrors({ submit: error.message || 'Failed to save customer. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage('customers')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('Add New Customer')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('Create a customer account for recharge tracking')}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mt-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.submit && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3.5 rounded-xl text-center">
              {errors.submit}
            </div>
          )}

          <Input
            label={t('Customer Full Name')}
            id="fullName"
            placeholder="e.g. Ramesh Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={User}
            voice
            required
            disabled={submitting}
            error={errors.fullName}
          />

          <Input
            label={t('Mobile Number')}
            id="mobileNumber"
            type="tel"
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            icon={Phone}
            voice
            required
            disabled={submitting}
            error={errors.mobileNumber}
            helperText="10 to 12 digit phone number for records"
          />

          <Input
            label={t('Initial Recharge Amount (Optional)')}
            id="initialRechargeAmount"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 300"
            value={initialRechargeAmount}
            onChange={(e) => setInitialRechargeAmount(e.target.value)}
            icon={IndianRupee}
            disabled={submitting}
            error={errors.initialRechargeAmount}
            helperText="Leave blank if no recharge is paid now"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="initialRechargeNotes" className="text-sm font-bold text-slate-700">
              {t('Recharge Note (Optional)')}
            </label>
            <textarea
              id="initialRechargeNotes"
              rows={2}
              placeholder="e.g. Paid by cash"
              value={initialRechargeNotes}
              onChange={(e) => setInitialRechargeNotes(e.target.value)}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => setCurrentPage('customers')}
              variant="secondary"
              disabled={submitting}
              fullWidth
            >
              {t('Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              fullWidth
              icon={Save}
            >
              {submitting ? `${t('Saving')}...` : t('Save Customer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
