import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppLayout = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-surface-600">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row relative">
      {/* ─── Sidebar Desktop ────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-surface-200 flex-col justify-between sticky top-0 h-screen z-20">
        <div className="flex flex-col gap-8 px-6 py-7">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-surface-900">FinFlow</span>
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-surface-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Info */}
        <div className="border-t border-surface-100 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-surface-900 truncate">{user?.name}</span>
              <span className="text-[10px] text-surface-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
            className="w-full text-left !justify-start hover:bg-red-50 hover:text-red-700 text-red-600"
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* ─── Mobile Header ───────────────────────────────────────────── */}
      <header className="md:hidden w-full bg-white border-b border-surface-200 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-600 rounded-lg">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-surface-900">FinFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {/* User profile icon */}
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="!p-1.5 text-surface-600 hover:text-surface-900"
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
              className="md:hidden fixed inset-0 bg-surface-950/40 backdrop-blur-sm z-30"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-surface-200 z-40 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-8 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-brand-600 rounded-lg">
                      <Wallet className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-surface-900">FinFlow</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                    className="!p-1 text-surface-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-semibold'
                            : 'text-surface-600 hover:bg-surface-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-surface-500'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-surface-100 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-surface-900 truncate">{user?.name}</span>
                    <span className="text-[10px] text-surface-500 truncate">{user?.email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
                  className="w-full text-left !justify-start hover:bg-red-50 hover:text-red-700 text-red-600"
                >
                  Log Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content Column ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-5 md:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
