import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sliders, Shield, Bell, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('finflow_currency');
    if (savedCurrency) setCurrency(savedCurrency);

    const savedNotifications = localStorage.getItem('finflow_notify_enabled');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedAutoSave = localStorage.getItem('finflow_autosave_enabled');
    if (savedAutoSave) setAutoSave(JSON.parse(savedAutoSave));
  }, []);

  const handleSave = () => {
    localStorage.setItem('finflow_currency', currency);
    localStorage.setItem('finflow_notify_enabled', JSON.stringify(notifications));
    localStorage.setItem('finflow_autosave_enabled', JSON.stringify(autoSave));

    // Record an audit log event
    const storedLogs = localStorage.getItem('finflow_audit_logs');
    const logs = storedLogs ? JSON.parse(storedLogs) : [];
    const newLog = {
      id: `aud-${Date.now()}`,
      action: 'SETTINGS_UPDATE',
      details: `Saved settings: Currency=${currency}, Notifications=${notifications}, Auto-save=${autoSave}`,
      ipAddress: '192.168.1.42',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('finflow_audit_logs', JSON.stringify([newLog, ...logs]));

    // Invalidate dashboard stats and lists to update currency symbols
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['categorySpending'] });
    queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
    queryClient.invalidateQueries({ queryKey: ['reportExpenses'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });

    toast.success('Settings updated successfully');
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-surface-600">Configure application settings, parameters, and localized preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Section */}
        <div className="flex flex-col gap-2.5">
          <button className="flex items-center gap-3 px-4 py-2.5 bg-surface-100 border border-surface-200/50 rounded-lg text-xs font-semibold text-brand-400 shadow-sm text-left cursor-pointer">
            <Sliders className="w-4.5 h-4.5" />
            General Preferences
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-150 border border-transparent rounded-lg text-xs font-medium text-surface-600 hover:text-white text-left transition-all cursor-pointer">
            <Bell className="w-4.5 h-4.5" />
            Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-150 border border-transparent rounded-lg text-xs font-medium text-surface-600 hover:text-white text-left transition-all cursor-pointer">
            <Shield className="w-4.5 h-4.5" />
            Security & MFA
          </button>
        </div>

        {/* Configurations Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional & Localization</CardTitle>
              <CardDescription>Adjust currency symbols and auto-saving preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-surface-600">Currency Display</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2.5 border-t border-b border-surface-200/50 mt-2">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-semibold text-white">Email Notifications</span>
                  <span className="text-[10px] text-surface-500">Receive weekly analytical insights of your finances.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-surface-300 focus:ring-brand-500 bg-surface-50"
                />
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-surface-200/50">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-semibold text-white">Draft Auto-Save</span>
                  <span className="text-[10px] text-surface-500">Persist expense draft entries inside local cache.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-surface-300 focus:ring-brand-500 bg-surface-50"
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} variant="primary">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-brand-500/25 border-dashed bg-brand-500/5 glow-purple">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-xs font-bold text-brand-400">ExpenseFlow Premium Activated</h4>
                <p className="text-[10px] text-surface-500 leading-relaxed max-w-md">
                  Enjoy automated category classification, advanced download history, security audit trials, and customized PDF export center features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
