import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'security';
  isRead: boolean;
  createdAt: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Food budget limit warnings',
    message: 'Your spending in Food has reached 85% of your specified ₹12,000 budget.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: 'notif-2',
    title: 'Security Session Authorized',
    message: 'New login session created from local IP address. Secure token issued successfully.',
    type: 'security',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    title: 'AWS Server cost Renewed',
    message: 'Recurring monthly charge of ₹3,200 for AWS dev server was recorded successfully.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'notif-4',
    title: 'Password Updated Successfully',
    message: 'Your account login password reset completed. Safe tokens revoked globally.',
    type: 'security',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
  },
];

export const NotificationsPage = () => {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('finflow_notifications');
    if (stored) {
      setList(JSON.parse(stored));
    } else {
      setList(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('finflow_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }, []);

  const handleMarkAsRead = (id: string) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    setList(updated);
    localStorage.setItem('finflow_notifications', JSON.stringify(updated));
  };

  const handleMarkAllAsRead = () => {
    const updated = list.map((item) => ({ ...item, isRead: true }));
    setList(updated);
    localStorage.setItem('finflow_notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read.');
  };

  const handleDelete = (id: string) => {
    const updated = list.filter((item) => item.id !== id);
    setList(updated);
    localStorage.setItem('finflow_notifications', JSON.stringify(updated));
    toast.success('Alert dismissed.');
  };

  const activeList = filter === 'all' ? list : list.filter((item) => !item.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-accent-emerald" />;
      case 'security':
        return <Shield className="w-5 h-5 text-accent-violet" />;
      default:
        return <Info className="w-5 h-5 text-brand-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'success':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20';
      case 'security':
        return 'bg-accent-violet/10 text-accent-violet border-accent-violet/20';
      default:
        return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-sm text-surface-600">Track and monitor important budget, security, and invoice updates.</p>
        </div>

        {list.some((i) => !i.isRead) && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
            className="border-surface-200/50 text-surface-900 hover:bg-surface-100"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Main Container */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-surface-200/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-surface-200 text-white'
                  : 'text-surface-600 hover:text-white'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-surface-200 text-white'
                  : 'text-surface-600 hover:text-white'
              }`}
            >
              Unread
              {list.filter((i) => !i.isRead).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
          <CardDescription>
            Showing {activeList.length} entry/entries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="popLayout">
            {activeList.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activeList.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.id}
                    className={`p-5 rounded-xl border border-surface-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 ${
                      item.isRead ? 'bg-surface-100/20 opacity-70' : 'bg-surface-100/40 border-l-4 border-l-brand-500'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-2.5 bg-surface-200/60 rounded-xl shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{item.title}</span>
                          <Badge className={`${getBadgeColor(item.type)} text-[8px] font-bold px-1.5 py-0.5 uppercase`}>
                            {item.type}
                          </Badge>
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
                          )}
                        </div>
                        <p className="text-[11px] text-surface-600 mt-1 leading-relaxed">{item.message}</p>
                        <span className="text-[9px] text-surface-550 mt-2 font-medium">
                          {new Date(item.createdAt).toLocaleString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {!item.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="text-xs text-brand-400 hover:text-brand-350 hover:bg-brand-500/10"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="!p-2 text-surface-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <Bell className="w-10 h-10 text-surface-400 mb-3 animate-pulse" />
                <span className="text-sm font-semibold text-surface-400">All caught up!</span>
                <p className="text-xs text-surface-600 mt-1">
                  You have no pending system warnings or activity indicators.
                </p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
