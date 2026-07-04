import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sliders, Shield, Bell, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Settings</h1>
        <p className="text-sm text-surface-600">Configure application settings, preferences, and details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Section */}
        <div className="flex flex-col gap-2.5">
          <button className="flex items-center gap-3 px-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm font-semibold text-brand-700 shadow-sm text-left">
            <Sliders className="w-4.5 h-4.5" />
            General Preferences
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-white border border-transparent hover:border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:text-surface-900 text-left transition-all">
            <Bell className="w-4.5 h-4.5" />
            Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-white border border-transparent hover:border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:text-surface-900 text-left transition-all">
            <Shield className="w-4.5 h-4.5" />
            Security & MFA
          </button>
        </div>

        {/* Configurations Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border border-surface-200">
            <CardHeader>
              <CardTitle>Regional & Localization</CardTitle>
              <CardDescription>Adjust currency symbols and auto-saving preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-surface-850">Currency Display</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2.5 border-t border-b border-surface-100 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-surface-900">Email Notifications</span>
                  <span className="text-[10px] text-surface-500">Receive weekly analytical insights of your finances.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-surface-300 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-surface-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-surface-900">Draft Auto-Save</span>
                  <span className="text-[10px] text-surface-500">Persist expense draft entries inside local cache.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-surface-300 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} variant="primary">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-surface-200 border-dashed bg-brand-50/20">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="p-2 bg-brand-100 rounded-lg text-brand-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-bold text-brand-850">FinFlow Premium Features</h4>
                <p className="text-[10px] text-brand-900 leading-relaxed max-w-md">
                  Unlock automatic bank sync, multi-account capabilities, AI spend categorisation, and custom reports. Upgrade your account today for advanced ledger automation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
