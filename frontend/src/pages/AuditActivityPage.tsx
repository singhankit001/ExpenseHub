import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  History,
  Shield,
  Clock,
  Laptop,
  Globe,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    action: 'LOGIN',
    details: 'User authenticated successfully. Access token granted.',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    id: 'aud-2',
    action: 'PROFILE_UPDATE',
    details: 'Changed name from "Ankit" to "Ankit Singh".',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'aud-3',
    action: 'EXPENSE_CREATE',
    details: 'Added ledger entry: "Uber ride to office" - ₹450.00',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: 'aud-4',
    action: 'BUDGET_UPSERT',
    details: 'Budget set for Food: ₹12,000.00',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'aud-5',
    action: 'REGISTER',
    details: 'Account successfully registered and verified.',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
  },
];

export const AuditActivityPage = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('finflow_audit_logs');
    if (stored) {
      setLogs(JSON.parse(stored));
    } else {
      setLogs(DEFAULT_AUDIT_LOGS);
      localStorage.setItem('finflow_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
    localStorage.setItem('finflow_audit_logs', JSON.stringify([]));
    toast.success('Audit trails cleaned.');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
      case 'REGISTER':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20';
      case 'EXPENSE_CREATE':
      case 'EXPENSE_UPDATE':
      case 'EXPENSE_DELETE':
        return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
      case 'PROFILE_UPDATE':
      case 'SETTINGS_UPDATE':
        return 'bg-accent-violet/10 text-accent-violet border-accent-violet/20';
      default:
        return 'bg-surface-200/50 text-surface-600 border-surface-200/50';
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Audit Log</h1>
          <p className="text-sm text-surface-600">Track structural changes, session operations, and data changes.</p>
        </div>

        {logs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4 text-red-400" />}
            onClick={handleClearLogs}
            className="text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            Clear Trail
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-surface-600 uppercase tracking-wider">Device Trust Status</span>
              <span className="text-sm font-bold text-white">1 Active Device (Verified)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-accent-violet/10 text-accent-violet rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-surface-600 uppercase tracking-wider">Last Authorized IP</span>
              <span className="text-sm font-bold text-white">192.168.1.42 (Local)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-accent-emerald/10 text-accent-emerald rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-surface-600 uppercase tracking-wider">Total Audited Events</span>
              <span className="text-sm font-bold text-white">{logs.length} operations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-surface-200/50">
          <div>
            <CardTitle>Activity Trail</CardTitle>
            <CardDescription>Immutable record of database and security changes.</CardDescription>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 px-3 py-1.5 text-xs bg-surface-50 border border-surface-250 rounded-lg text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredLogs.length > 0 ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200/40 bg-surface-50/10 text-surface-600 uppercase tracking-wider font-semibold text-[9px]">
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Event</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">Network Node</th>
                  <th className="px-6 py-3.5">Device Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200/25">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-100/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-surface-600 font-medium font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getActionColor(log.action)} text-[8px] font-bold px-2 py-0.5 uppercase`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-surface-800 font-medium max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-surface-650 font-mono text-[10px]">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-surface-550 max-w-xs truncate font-mono text-[10px]" title={log.userAgent}>
                      {log.userAgent.includes('Macintosh') ? 'macOS • Chrome' : 'Linux • Browser'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <History className="w-8 h-8 text-surface-450 mb-3" />
              <span className="text-xs text-surface-500 font-medium">No activity items match search</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
