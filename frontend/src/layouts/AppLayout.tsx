

import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundSystem } from '@/components/ui/background';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PieChart,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  PiggyBank,
  RefreshCw,
  Bell,
  FileText,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppLayout = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Budgets', path: '/budgets', icon: PiggyBank },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Recurring Expenses', path: '/recurring', icon: RefreshCw },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Audit Activity', path: '/audit-activity', icon: Activity },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-surface-400 tracking-wider">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative selection:bg-brand-500/30 selection:text-white">
      <BackgroundSystem />
      
      {/* ─── Sidebar Desktop ────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-[260px] flex-col justify-between sticky top-0 h-screen z-20 p-4">
        <div className="glass-card flex-1 rounded-2xl flex flex-col overflow-hidden shadow-glass border border-surface-200/30">
          <div className="flex flex-col gap-6 px-4 py-6 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="p-1.5 bg-gradient-to-tr from-brand-500 to-accent-violet rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">ExpenseFlow</span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    {/* Hover & Active Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-brand-500/15 border border-brand-500/30 rounded-xl"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-surface-200/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    )}

                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10 ${isActive ? 'text-brand-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-surface-500'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Footer Profile Info */}
          <div className="border-t border-surface-200/30 p-4 flex flex-col gap-3 bg-surface-50/30 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-accent-violet flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-surface-600 truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-red-400" />}
            className="w-full text-left !justify-start hover:bg-red-500/10 hover:text-red-400 text-red-400/90 text-xs border border-transparent hover:border-red-500/20 cursor-pointer"
          >
            Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header ───────────────────────────────────────────── */}
      <header className="md:hidden w-full bg-surface-100 border-b border-surface-200/50 px-5 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-brand-600 to-accent-violet rounded-lg shadow-md">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">ExpenseFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {/* User profile icon */}
          <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-400 font-bold flex items-center justify-center text-xs">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="!p-1.5 text-surface-400 hover:text-surface-900"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-surface-950/60 backdrop-blur-sm z-30"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-64 bg-surface-100 border-r border-surface-200/50 z-40 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6 px-4 py-5 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-gradient-to-tr from-brand-600 to-accent-violet rounded-lg shadow-md">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">ExpenseFlow</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                    className="!p-1 text-surface-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-brand-500/10 text-brand-400 font-semibold border-l-2 border-brand-500'
                            : 'text-surface-600 hover:bg-surface-200/40 hover:text-surface-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-surface-500'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-surface-200/50 p-4 flex flex-col gap-3 bg-surface-50/20">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-accent-violet flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
                    <span className="text-[10px] text-surface-600 truncate">{user?.email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-red-400" />}
                  className="w-full text-left !justify-start hover:bg-red-500/10 hover:text-red-400 text-red-400/90 text-xs border border-transparent hover:border-red-500/20"
                >
                  Log Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content Column ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        <div className="p-5 md:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
