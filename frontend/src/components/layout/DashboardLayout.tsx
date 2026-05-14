'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Receipt, CreditCard, AlertTriangle,
  GitBranch, Settings2, CheckSquare, Mail, Shield, BarChart3,
  Plug, Brain, ChevronLeft, ChevronRight, Bell, Search,
  HelpCircle, ChevronDown, LogOut, User, Building2, Zap, TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', badge: null },
      { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics', badge: null },
    ],
  },
  {
    label: 'Receivables',
    items: [
      { label: 'Customers', icon: Users, href: '/dashboard/customers', badge: null },
      { label: 'Invoices', icon: Receipt, href: '/dashboard/invoices', badge: 23, badgeColor: 'bg-danger' },
      { label: 'Payments', icon: CreditCard, href: '/dashboard/payments', badge: null },
      { label: 'Disputes', icon: AlertTriangle, href: '/dashboard/disputes', badge: 7, badgeColor: 'bg-danger' },
    ],
  },
  {
    label: 'Collections',
    items: [
      { label: 'Agenda', icon: CheckSquare, href: '/dashboard/agenda', badge: 12, badgeColor: 'bg-warning' },
      { label: 'Scenarios', icon: Settings2, href: '/dashboard/scenarios', badge: null },
      { label: 'Communications', icon: Mail, href: '/dashboard/communications', badge: null },
    ],
  },
  {
    label: 'Credit Risk',
    items: [
      { label: 'Risk Analysis', icon: Shield, href: '/dashboard/risk', badge: null },
      { label: 'AI Insights', icon: Brain, href: '/dashboard/ai', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'ERP Integrations', icon: Plug, href: '/dashboard/erp', badge: null },
      { label: 'Admin', icon: Settings2, href: '/dashboard/admin', badge: null },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push('/auth/login');
    toast.success('Logged out successfully');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f6f8]">
      {/* ── TOP BAR ── */}
      <header className="h-10 bg-brand-500 flex items-center px-3 gap-2 z-50 shadow-md flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-[160px]">
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">ArFlow</span>
        </div>

        {/* Top nav links */}
        <nav className="flex items-stretch gap-0 h-full">
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/dashboard/customers' },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'Agenda', href: '/dashboard/agenda' },
            { label: 'Reports', href: '/dashboard/analytics' },
            { label: 'Scenarios', href: '/dashboard/scenarios' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-white/80 text-xs px-3 flex items-center border-b-2 border-transparent transition-all hover:bg-white/10 hover:text-white',
                isActive(item.href) && 'text-white border-white bg-white/10'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex items-center bg-white/10 border border-white/20 rounded px-2 gap-1.5 ml-2">
          <Search className="w-3.5 h-3.5 text-white/60" />
          <input
            type="text"
            placeholder="Search customers, invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-xs placeholder-white/50 outline-none py-1 w-52"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-brand-500" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-9 w-80 bg-white border border-border rounded-lg shadow-dropdown z-50"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="text-xs text-muted-foreground">4 new</span>
                  </div>
                  {[
                    { icon: '⚠', text: 'Omega Group — INV-2041 overdue 45d', time: '2m ago', color: 'text-danger' },
                    { icon: '✅', text: 'Payment received — Kestrel Ltd €12,400', time: '18m ago', color: 'text-success' },
                    { icon: '🔄', text: 'SAP sync completed — 248 invoices', time: '1h ago', color: 'text-info' },
                    { icon: '🤖', text: 'AI: Vertex Inc flagged high risk', time: '2h ago', color: 'text-warning' },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-2.5 border-b border-border/60 last:border-0 hover:bg-secondary/50 cursor-pointer">
                      <div className={cn('text-xs font-medium', n.color)}>{n.icon} {n.text}</div>
                      <div className="text-2xs text-muted-foreground mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/10"
            >
              <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-2xs font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="text-xs">{user?.firstName} {user?.lastName}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-9 w-52 bg-white border border-border rounded-lg shadow-dropdown z-50"
                >
                  <div className="px-3 py-3 border-b border-border">
                    <div className="text-sm font-semibold">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                    <div className="text-2xs text-brand-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{user?.company?.name}
                    </div>
                  </div>
                  <div className="p-1">
                    <Link href="/dashboard/admin" className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary rounded cursor-pointer">
                      <User className="w-3.5 h-3.5 text-muted-foreground" /> Profile
                    </Link>
                    <Link href="/dashboard/admin" className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary rounded cursor-pointer">
                      <Settings2 className="w-3.5 h-3.5 text-muted-foreground" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary rounded text-danger"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-white/30 text-xs mx-1">|</span>
          <span className="text-white/60 text-xs">{user?.company?.name}</span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 48 : 192 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="bg-white border-r border-border flex flex-col overflow-hidden flex-shrink-0"
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                {!sidebarCollapsed && (
                  <div className="px-3 pt-3 pb-1 text-2xs font-bold text-muted-foreground uppercase tracking-widest">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn('nav-item', active && 'active', sidebarCollapsed && 'justify-center px-0')}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="text-xs truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span className={cn('text-white rounded-full px-1.5 py-0.5 text-2xs font-bold', item.badgeColor || 'bg-brand-500')}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center h-8 border-t border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </motion.aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
