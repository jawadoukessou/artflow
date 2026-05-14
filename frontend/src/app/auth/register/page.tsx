'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', companyName:'' });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({...f, [k]: e.target.value}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res: any = await authApi.register(form);
      const d = res.data;
      setAuth(d.user, d.accessToken, d.refreshToken);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err: any) { toast.error(err?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-500">ArFlow</h1>
        </div>
        <div className="bg-white border border-border rounded-lg p-8 shadow-card">
          <h2 className="text-lg font-bold mb-6">Create your workspace</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="form-label">First name</label><input className="form-input" value={form.firstName} onChange={set('firstName')} required /></div>
              <div><label className="form-label">Last name</label><input className="form-input" value={form.lastName} onChange={set('lastName')} required /></div>
            </div>
            <div><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={set('email')} required /></div>
            <div><label className="form-label">Password (min 8 chars)</label><input className="form-input" type="password" value={form.password} onChange={set('password')} required minLength={8} /></div>
            <div><label className="form-label">Company name</label><input className="form-input" value={form.companyName} onChange={set('companyName')} required /></div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 text-white rounded font-semibold hover:bg-brand-600 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Already have an account? <Link href="/auth/login" className="text-brand-500 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
