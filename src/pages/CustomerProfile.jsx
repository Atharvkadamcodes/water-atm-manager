import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  IndianRupee, 
  RefreshCw,
  CheckCircle,
  XCircle,
  CreditCard,
  PencilLine,
  ShieldAlert
} from 'lucide-react';
import { db } from '../db/db';
import TimelineItem, { formatDate } from '../components/TimelineItem';
import Button from '../components/Button';
import Input from '../components/Input';
import { CUSTOMER_STATUS, getStatusBadgeClasses, getStatusLabel, hasOpenLostCard, normalizeCustomerStatus } from '../utils/customerStatus';
import { useI18n } from '../i18n';

export default function CustomerProfile({ 
  customerId, 
  setCurrentPage, 
  setSelectedCustomerId 
}) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await db.getCustomerById(customerId);
      setData(result);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchProfile();
    }
  }, [customerId]);

  // Open Recharge modal instead of navigating to a separate page
  const [showRechargeModal, setShowRechargeModal] = React.useState(false);
  const [rechargeAmount, setRechargeAmount] = React.useState('');
  const [rechargeNotes, setRechargeNotes] = React.useState('');
  const [rechargeSubmitting, setRechargeSubmitting] = React.useState(false);
  const [rechargeError, setRechargeError] = React.useState('');
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [statusValue, setStatusValue] = React.useState(CUSTOMER_STATUS.ACTIVE);
  const [statusSubmitting, setStatusSubmitting] = React.useState(false);
  const [statusError, setStatusError] = React.useState('');
  const [showLostCardModal, setShowLostCardModal] = React.useState(false);
  const [lostCardNote, setLostCardNote] = React.useState('');
  const [lostCardSubmitting, setLostCardSubmitting] = React.useState(false);
  const [lostCardError, setLostCardError] = React.useState('');
  const [showResolveLostCardModal, setShowResolveLostCardModal] = React.useState(false);
  const [resolveStatusValue, setResolveStatusValue] = React.useState(CUSTOMER_STATUS.ACTIVE);
  const [resolveLostCardNote, setResolveLostCardNote] = React.useState('');

  const handleRechargeAction = () => {
    setShowRechargeModal(true);
    // reset fields when opening
    setRechargeAmount('');
    setRechargeNotes('');
    setRechargeError('');
  };

  const handleRechargeSave = async (e) => {
    e.preventDefault();
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      setRechargeError('Enter a valid amount > 0');
      return;
    }
    setRechargeSubmitting(true);
    setRechargeError('');
    try {
      await db.addRecharge(customerId, amt, rechargeNotes.trim());
      // Refresh profile to show new history entry
      await fetchProfile();
      setShowRechargeModal(false);
    } catch (err) {
      setRechargeError(err.message || 'Failed to save recharge');
    } finally {
      setRechargeSubmitting(false);
    }
  };

  const handleLostCardAction = () => {
    setLostCardNote('');
    setLostCardError('');
    setShowLostCardModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="animate-spin text-sky-600" size={28} />
        <span className="text-slate-500 text-sm font-semibold">Loading customer profile...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl max-w-sm font-semibold">
          {error || 'Customer not found'}
        </div>
        <Button onClick={() => setCurrentPage('customers')} variant="secondary" fullWidth={false}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const { customer, history } = data;
  const currentStatus = normalizeCustomerStatus(customer);
  const rechargeHistory = (history || []).filter((item) => item.event_type === 'RECHARGE');
  const totalRechargeRevenue = rechargeHistory.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const lostCardHistory = (history || []).filter((item) => item.event_type === 'LOST_CARD' || item.event_type === 'LOST_CARD_RESOLVED');
  const lostCardOpen = hasOpenLostCard(customer);

  const handleStatusSave = async (e) => {
    e.preventDefault();
    setStatusSubmitting(true);
    setStatusError('');

    try {
      await db.updateCustomer(customerId, {
        status: statusValue
      });
      await fetchProfile();
      setShowStatusModal(false);
    } catch (err) {
      setStatusError(err.message || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleReportLostCard = async (e) => {
    e.preventDefault();
    setLostCardSubmitting(true);
    setLostCardError('');

    try {
      await db.markCardLost(customerId, lostCardNote.trim());
      await fetchProfile();
      setShowLostCardModal(false);
    } catch (err) {
      setLostCardError(err.message || 'Failed to save lost card record');
    } finally {
      setLostCardSubmitting(false);
    }
  };

  const handleOpenResolveLostCard = () => {
    setResolveStatusValue(currentStatus);
    setResolveLostCardNote('');
    setLostCardError('');
    setShowResolveLostCardModal(true);
  };

  const handleClearLostCard = async (e) => {
    e.preventDefault();
    setLostCardSubmitting(true);
    setLostCardError('');

    try {
      await db.clearLostCard(customerId, resolveStatusValue, resolveLostCardNote.trim());
      await fetchProfile();
      setShowResolveLostCardModal(false);
    } catch (err) {
      setLostCardError(err.message || 'Failed to clear lost card record');
    } finally {
      setLostCardSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage('customers')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('Customer Details')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('Profile & transaction logs')}</p>
        </div>
      </div>

      {/* Info Card Block */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        {/* Top Code Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            {customer.customer_code}
          </span>
          <div className="flex items-center gap-1.5">
            {currentStatus === CUSTOMER_STATUS.ACTIVE ? (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 text-emerald-700 bg-emerald-50">
                <CheckCircle size={12} className="stroke-[3px]" />
                <span>{getStatusLabel(currentStatus)}</span>
              </span>
            ) : (
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClasses(currentStatus)}`}>
                <XCircle size={12} className="stroke-[3px]" />
                <span>{getStatusLabel(currentStatus)}</span>
              </span>
            )}
            {lostCardOpen && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-100 text-rose-700 bg-rose-50">
                <ShieldAlert size={12} className="stroke-[3px]" />
                <span>Lost Card Open</span>
              </span>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="flex flex-col gap-3">
          {/* Name */}
          <div className="flex items-start gap-3">
            <User size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Customer Name')}</span>
              <div className="text-lg font-bold text-slate-800 leading-tight">{customer.full_name}</div>
            </div>
          </div>

          {/* Customer ID */}
          <div className="flex items-start gap-3">
            <User size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Customer ID')}</span>
              <div className="text-base font-mono font-bold text-sky-700 leading-tight">
                {customer.id}
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Mobile Number')}</span>
              <div className="text-base font-semibold text-slate-700 leading-tight">
                {customer.mobile_number}
              </div>
            </div>
          </div>

          {/* Created At / Registration Date */}
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Status')}</span>
              <div className="text-sm font-semibold text-slate-700 leading-tight">
                {getStatusLabel(currentStatus)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Registration Date')}</span>
              <div className="text-sm font-semibold text-slate-600 leading-tight">
                {formatDate(customer.created_at)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <IndianRupee size={18} className="text-slate-400 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Total Recharge Revenue')}</span>
              <div className="text-base font-bold text-emerald-700 leading-tight">
                ₹{Math.round(totalRechargeRevenue)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Lost Card Record')}</div>
              {lostCardOpen ? (
                <>
                  <div className="mt-1 text-sm font-semibold text-rose-700">
                    Reported on {formatDate(customer.lost_card_reported_at)}
                  </div>
                  {customer.lost_card_note && (
                    <div className="mt-1 text-sm text-slate-600">{customer.lost_card_note}</div>
                  )}
                </>
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-500">{t('No open lost card record.')}</div>
              )}
            </div>
            {lostCardOpen && (
              <Button onClick={handleOpenResolveLostCard} variant="secondary" className="!py-2 text-xs" disabled={lostCardSubmitting}>
                {lostCardSubmitting ? 'Updating...' : 'Card Taken'}
              </Button>
            )}
          </div>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          <Button 
            onClick={handleRechargeAction}
            variant="success"
            icon={IndianRupee}
            className="!py-3 text-sm"
          >
            {t('Recharge')}
          </Button>
          <Button onClick={() => setCurrentPage('customer_edit')} variant="secondary" icon={PencilLine} className="!py-3 text-sm">
            {t('Edit Customer')}
          </Button>
          <Button onClick={() => {
            setStatusValue(currentStatus);
            setStatusError('');
            setShowStatusModal(true);
          }} variant="secondary" icon={CheckCircle} className="!py-3 text-sm">
            {t('Change Status')}
          </Button>
          <Button onClick={handleLostCardAction} variant="secondary" icon={CreditCard} className="!py-3 text-sm sm:col-span-3">
            {t('Mark Lost Card')}
          </Button>

          {/* Recharge Modal */}
          {showRechargeModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Record Recharge</h3>
                <form onSubmit={handleRechargeSave} className="flex flex-col gap-4">
                  {rechargeError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-center text-sm">
                      {rechargeError}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600 mb-1">Customer Name</span>
                    <input
                      type="text"
                      readOnly
                      className="bg-slate-100 text-slate-800 border border-slate-200 rounded-md p-2"
                      value={customer.full_name}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600 mb-1">Customer ID</span>
                    <input
                      type="text"
                      readOnly
                      className="bg-slate-100 text-slate-800 border border-slate-200 rounded-md p-2"
                      value={customer.id}
                    />
                  </div>
                  <Input
                    label="Recharge Amount (₹)"
                    id="rechargeAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    required
                    disabled={rechargeSubmitting}
                    voice
                  />
                  <div className="flex flex-col">
                    <label htmlFor="rechargeNotes" className="text-xs font-medium text-slate-600 mb-1">
                      Optional Notes
                    </label>
                    <textarea
                      id="rechargeNotes"
                      rows={2}
                      placeholder="e.g. Cash payment, UPI ref..."
                      value={rechargeNotes}
                      onChange={(e) => setRechargeNotes(e.target.value)}
                      disabled={rechargeSubmitting}
                      className="w-full py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowRechargeModal(false)}
                      disabled={rechargeSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      icon={IndianRupee}
                      disabled={rechargeSubmitting}
                    >
                      {rechargeSubmitting ? 'Saving...' : 'Save Recharge'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Customer Status</h3>
            <form onSubmit={handleStatusSave} className="flex flex-col gap-4">
              {statusError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-center text-sm">
                  {statusError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                {[CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.INACTIVE].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusValue(status)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                      statusValue === status ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowStatusModal(false)} disabled={statusSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={statusSubmitting}>
                  {statusSubmitting ? 'Saving...' : 'Save Status'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResolveLostCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Resolve Lost Card</h3>
            <form onSubmit={handleClearLostCard} className="flex flex-col gap-4">
              {lostCardError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-center text-sm">
                  {lostCardError}
                </div>
              )}
              <div className="text-sm text-slate-600">
                Was the card taken by the customer?
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.INACTIVE].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setResolveStatusValue(status)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                      resolveStatusValue === status ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {status === CUSTOMER_STATUS.ACTIVE ? 'Active (Yes)' : 'Inactive (No)'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col">
                <label htmlFor="resolveLostCardNote" className="text-xs font-medium text-slate-600 mb-1">
                  Optional Note
                </label>
                <textarea
                  id="resolveLostCardNote"
                  rows={3}
                  placeholder="e.g. New card collected, customer will come later"
                  value={resolveLostCardNote}
                  onChange={(e) => setResolveLostCardNote(e.target.value)}
                  disabled={lostCardSubmitting}
                  className="w-full py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowResolveLostCardModal(false)} disabled={lostCardSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={lostCardSubmitting}>
                  {lostCardSubmitting ? 'Saving...' : 'Save Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLostCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Record Lost Card</h3>
            <form onSubmit={handleReportLostCard} className="flex flex-col gap-4">
              {lostCardError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-center text-sm">
                  {lostCardError}
                </div>
              )}
              <div className="text-sm text-slate-600">
                This records that the customer reported a lost card today. Their account status stays separate and can remain Active or be changed to Inactive later.
              </div>
              <div className="flex flex-col">
                <label htmlFor="lostCardNote" className="text-xs font-medium text-slate-600 mb-1">
                  Optional Note
                </label>
                <textarea
                  id="lostCardNote"
                  rows={3}
                  placeholder="e.g. Lost near market, reported by customer"
                  value={lostCardNote}
                  onChange={(e) => setLostCardNote(e.target.value)}
                  disabled={lostCardSubmitting}
                  className="w-full py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowLostCardModal(false)} disabled={lostCardSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={lostCardSubmitting}>
                  {lostCardSubmitting ? 'Saving...' : 'Save Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History timeline Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
          {t('Recharge History')}
        </h3>

        {rechargeHistory.length > 0 ? (
          <div className="flex flex-col pl-1">
            {rechargeHistory.map((item) => (
              <TimelineItem key={item.id} item={item} compact />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400 font-medium">
            No recharge records found for this customer.
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
          {t('Lost Card History')}
        </h3>

        {lostCardHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
            {lostCardHistory.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className={`mt-1 text-sm font-bold ${item.event_type === 'LOST_CARD' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {item.event_type === 'LOST_CARD' ? 'Lost Card Reported' : 'Lost Card Resolved'}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-semibold">
                      {item.event_type === 'LOST_CARD' ? 'Lost Date' : 'Re-taken Date'}
                    </span>
                    <span className="text-slate-700 font-bold text-right">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
                {item.notes && <div className="mt-1 text-sm text-slate-600">{item.notes}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400 font-medium">
            No lost card records found for this customer.
          </div>
        )}
      </div>
    </div>
  );
}
