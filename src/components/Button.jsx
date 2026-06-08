import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  fullWidth = true, 
  disabled = false,
  className = '',
  icon: Icon
}) {
  const baseStyle = "flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl text-base shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 focus:ring-4 focus:ring-sky-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:ring-4 focus:ring-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-4 focus:ring-rose-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-4 focus:ring-emerald-100"
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
    >
      {Icon && <Icon size={20} className="shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
