import React, { useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { db } from '../db/db';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await db.adminLogin(email.trim(), password);
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center bg-slate-50 px-4 py-8 max-w-md mx-auto border-x border-slate-200 shadow-xl">
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img 
            src="/logo.png" 
            alt="Aqua Family Logo" 
            className="w-20 h-20 rounded-full border shadow-sm object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=Aqua+ATM' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Aqua Family</h1>
            <p className="text-sm text-slate-500 font-medium">Water ATM Admin Portal</p>
            <p className="text-xs text-slate-400 mt-1">{db.getAuthModeLabel()}</p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoCapitalize="none"
            autoComplete="email"
            disabled={loading}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={KeyRound}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          <div className="mt-2">
            <Button 
              type="submit" 
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
          Use a separate login for each family member if possible. That keeps access simple and avoids sharing one password.
        </div>

        <div className="text-center text-xs text-slate-400 mt-2">
          &copy; {new Date().getFullYear()} Aqua Family Business. All rights reserved.
        </div>
      </div>
    </div>
  );
}
