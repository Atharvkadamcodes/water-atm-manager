import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useI18n } from '../i18n';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  icon: Icon,
  className = '',
  voice = false,
  ...props
}) {
  const { speechLanguage } = useI18n();
  const [listening, setListening] = React.useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || disabled) return;

    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      onChange({ target: { value: transcript } });
    };
    recognition.start();
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-slate-700 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-xl border bg-white text-slate-800 text-base shadow-sm focus:outline-none focus:ring-4 transition-all duration-150 ${
            Icon ? 'pl-11' : ''
          } ${
            voice ? 'pr-11' : ''
          } ${
            error 
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/10' 
              : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
          } ${disabled ? 'bg-slate-50 text-slate-400 border-slate-200' : ''}`}
          {...props}
        />
        {voice && (
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={disabled}
            className={`absolute right-2.5 p-1.5 rounded-lg transition-colors ${
              listening ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title="Voice input"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs font-semibold text-rose-500 mt-0.5">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>
      )}
    </div>
  );
}
