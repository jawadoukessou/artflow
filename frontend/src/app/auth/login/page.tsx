'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@acmecorp.com');
  const [password, setPassword] = useState('ArFlow2026!');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await authApi.login({ email, password });
      const d = res.data;
      setAuth(d.user, d.accessToken, d.refreshToken);
      toast.success('Welcome back ' + d.user.firstName + '!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-500">ArFlow</h1>
          <p className="text-xs text-muted-foreground mt-1">AR & Credit Management Platform</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-8 shadow-card">
          <h2 className="text-lg font-bold mb-6">Sign in to your account</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 text-white rounded font-semibold hover:bg-brand-600 disabled:opacity-60 transition-colors">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-5 p-3 bg-brand-50 border border-brand-100 rounded text-xs">
            <div className="font-semibold text-brand-700 mb-1">Demo credentials</div>
            <div className="text-brand-600">admin@acmecorp.com / ArFlow2026!</div>
            <div className="text-brand-600">s.martin@acmecorp.com / ArFlow2026!</div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            No account? <Link href="/auth/register" className="text-brand-500 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
