import React from 'react';
import { LayoutDashboard, Users, Settings, Wifi } from 'lucide-react';
import { useI18n } from '../i18n';

export default function Layout({
  children,
  currentPage,
  setCurrentPage,
  onLogout,
  adminUser,
  title,
}) {
  const { t } = useI18n();
  const navItems = [
    { id: 'dashboard', label: t('Dashboard'), Icon: LayoutDashboard },
    { id: 'customers', label: t('Customers'), Icon: Users },
  ];

  // Customer related sub‑pages should keep the Customers tab highlighted
  const customerPages = [
    'customer_add',
    'customer_profile',
    'recharge',
    'lost_card',
    'customer_edit',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto shadow-xl relative pb-20 border-x border-slate-200">
      {/* Connection status banner */}
      <div className="text-xs py-1 px-3 flex items-center justify-between font-medium bg-emerald-100 text-emerald-800">
        <div className="flex items-center gap-1.5">
          <Wifi size={13} />
          <span>Supabase connected</span>
        </div>
        <div className="text-[10px] opacity-75">User: {adminUser?.username || adminUser?.email || 'Owner'}</div>
      </div>

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <img
          src="/logo.png"
          alt="Aqua Family Logo"
          className="w-8 h-8 rounded-full border border-slate-100 object-cover shrink-0"
          onError={(e) => {
            e.target.src = 'https://placehold.co/100x100?text=ATM';
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-sky-800 m-0 p-0 leading-none">Aqua Family</h1>
          {title && <span className="text-xs text-slate-500 leading-none">{title}</span>}
        </div>
        <button
          onClick={() => setCurrentPage('settings')}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            currentPage === 'settings'
              ? 'bg-sky-50 text-sky-700'
              : 'text-slate-500 hover:text-sky-700 hover:bg-slate-100'
          }`}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around py-1.5 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        {navItems.map(({ id, label, Icon }) => {
          const isActive =
            currentPage === id || (id === 'customers' && customerPages.includes(currentPage));
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-sky-50' : ''}`}>
                <Icon size={23} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              </div>
              <span className="text-[11px] mt-0.5 font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
