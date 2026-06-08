import React, { useState } from 'react';
import { Download, LogOut, Wifi, Database, Info } from 'lucide-react';
import { db } from '../db/db';
import Button from '../components/Button';
import { LANGUAGES, useI18n } from '../i18n';

export default function Settings({ onLogout, adminUser }) {
  const [exporting, setExporting] = useState(false);
  const { language, setLanguage, t } = useI18n();

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { customers, history } = await db.getAllData();

      // Generate Customers CSV
      const custHeaders = 'ID,Code,Full Name,Mobile,Status,Created At';
      const custRows = customers.map(c =>
        `${c.id},${c.customer_code},"${c.full_name}",${c.mobile_number},${c.status || (c.is_active ? 'ACTIVE' : 'INACTIVE')},${c.created_at}`
      );
      const custCsv = [custHeaders, ...custRows].join('\n');

      // Generate History CSV
      const histHeaders = 'ID,Customer ID,Event Type,Amount,Notes,Created At';
      const histRows = history.map(h =>
        `${h.id},${h.customer_id},${h.event_type},${h.amount ?? ''},"${(h.notes || '').replace(/"/g, '""')}",${h.created_at}`
      );
      const histCsv = [histHeaders, ...histRows].join('\n');

      const fullCsv = '=== CUSTOMERS ===\n' + custCsv + '\n\n=== HISTORY ===\n' + histCsv;

      // Download
      const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `water_atm_export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check console for details.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 m-0">{t('Settings')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 m-0">Manage your admin session and data</p>
      </div>

      {/* Admin Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl"><Info size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Logged In As')}</span>
            <div className="text-base font-bold text-slate-800">{adminUser?.username || 'admin'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Wifi size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('Database')}</span>
            <div className="text-sm font-bold text-slate-700">Supabase PostgreSQL</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-700">{t('Language')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(LANGUAGES).map(([id, option]) => (
            <button
              key={id}
              onClick={() => setLanguage(id)}
              className={`rounded-xl border py-3 px-3 text-sm font-bold transition-all ${
                language === id ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Database size={16} /> {t('Data Management')}
        </h3>

        <Button onClick={handleExportCSV} variant="secondary" icon={Download} fullWidth>
          {exporting ? 'Exporting...' : t('Export All Data (CSV)')}
        </Button>
      </div>

      {/* Logout */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <Button onClick={onLogout} variant="danger" icon={LogOut} fullWidth>
          {t('Sign Out')}
        </Button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-4">
        &copy; {new Date().getFullYear()} Aqua Family Water ATM · v1.0
      </div>
    </div>
  );
}
