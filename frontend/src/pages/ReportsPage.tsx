import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/utils';
import {
  FileDown,
  FileText,
  Calendar,
  Layers,
  History,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportHistoryItem {
  id: string;
  name: string;
  type: 'CSV' | 'PDF';
  date: string;
  size: string;
}

export const ReportsPage = () => {
  const [downloadHistory, setDownloadHistory] = useState<ReportHistoryItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    const stored = localStorage.getItem('finflow_report_history');
    if (stored) {
      setDownloadHistory(JSON.parse(stored));
    } else {
      const initial: ReportHistoryItem[] = [
        {
          id: 'rep-1',
          name: 'Q2_Expense_Summary.csv',
          type: 'CSV',
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          size: '4.2 KB',
        },
        {
          id: 'rep-2',
          name: 'June_Monthly_Detailed.pdf',
          type: 'PDF',
          date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          size: '124 KB',
        },
      ];
      setDownloadHistory(initial);
      localStorage.setItem('finflow_report_history', JSON.stringify(initial));
    }
  }, []);

  // Fetch all expenses to construct report content
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['reportExpenses'],
    queryFn: async () => {
      const res = await expenseService.list({ limit: 1000 });
      return res.data.data.expenses;
    },
  });

  const getFilteredExpenses = () => {
    if (!expensesData) return [];
    return expensesData.filter((e) => {
      const date = new Date(e.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const matchMonth = monthKey === selectedMonth;
      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      return matchMonth && matchCategory;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses found for the selected filters.');
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Notes'];
    const rows = filteredExpenses.map((e) => [
      formatDate(e.expenseDate),
      e.title.replace(/"/g, '""'),
      e.category,
      parseFloat(e.amount).toFixed(2),
      (e.notes || '').replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const fileName = `ExpenseFlow_${selectedMonth}_${selectedCategory}.csv`;
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save to history
    const newHistoryItem: ReportHistoryItem = {
      id: `rep-${Date.now()}`,
      name: fileName,
      type: 'CSV',
      date: new Date().toISOString(),
      size: `${(rows.length * 0.15 + 0.2).toFixed(1)} KB`,
    };

    const updated = [newHistoryItem, ...downloadHistory];
    setDownloadHistory(updated);
    localStorage.setItem('finflow_report_history', JSON.stringify(updated));
    toast.success('CSV Report generated and downloaded.');
  };

  const handlePrintPDF = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses found for the selected filters.');
      return;
    }

    // Trigger browser printing for the preview section
    window.print();

    // Add to history
    const fileName = `ExpenseFlow_${selectedMonth}_${selectedCategory}.pdf`;
    const newHistoryItem: ReportHistoryItem = {
      id: `rep-${Date.now()}`,
      name: fileName,
      type: 'PDF',
      date: new Date().toISOString(),
      size: `${(filteredExpenses.length * 2.5 + 45).toFixed(0)} KB`,
    };

    const updated = [newHistoryItem, ...downloadHistory];
    setDownloadHistory(updated);
    localStorage.setItem('finflow_report_history', JSON.stringify(updated));
    toast.success('PDF print command fired successfully.');
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Exports</h1>
        <p className="text-sm text-surface-600">Export transaction history and generate printable financial records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls and Exporter */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Filter parameters to package into your output ledger document.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-surface-600">Select Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-surface-600">Category Filter</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-50 border border-surface-250 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-surface-200/50 bg-surface-50/20 mt-2">
                <div className="flex justify-between items-center text-xs text-surface-600">
                  <span>Transactions Match:</span>
                  <span className="font-bold text-white">{filteredExpenses.length} entries</span>
                </div>
                <div className="flex justify-between items-center text-xs text-surface-600 mt-2">
                  <span>Aggregated Sum:</span>
                  <span className="font-bold text-accent-emerald">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={handleExportCSV}
                  leftIcon={<FileDown className="w-4.5 h-4.5" />}
                  className="w-full"
                >
                  Export CSV Ledger
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrintPDF}
                  leftIcon={<Printer className="w-4.5 h-4.5" />}
                  className="w-full border-surface-200/50 text-surface-900 hover:bg-surface-100"
                >
                  Print / Save PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="border-b border-surface-200/50">
              <CardTitle className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-surface-555" /> Download History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {downloadHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs border-b border-surface-200/20 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4.5 h-4.5 text-surface-600 shrink-0" />
                    <span className="text-surface-700 truncate font-medium">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-surface-555 font-mono shrink-0">{item.size}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 print:border-0 print:shadow-none print:bg-white print:text-black">
            <CardHeader className="border-b border-surface-200/50 print:hidden">
              <CardTitle>Report Document Live Preview</CardTitle>
              <CardDescription>Verify formatting structure before generating the final file.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex flex-col text-left">
              {/* Printable container */}
              <div id="printable-area" className="flex flex-col gap-6 font-sans">
                <div className="flex items-center justify-between pb-4 border-b border-surface-200/40">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white print:text-black">ExpenseFlow Reports</span>
                    <span className="text-[10px] text-surface-600 print:text-gray-500">Period: {selectedMonth} | Scoped: {selectedCategory}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xs font-semibold text-surface-600 print:text-gray-500">Generated</span>
                    <span className="text-[10px] text-white print:text-black">{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredExpenses.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Sum stats preview */}
                    <div className="grid grid-cols-2 gap-4 bg-surface-100/35 print:bg-gray-100 p-4 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-surface-600 print:text-gray-500 uppercase tracking-wider font-semibold">Total Spent</span>
                        <span className="text-xl font-bold text-white print:text-black">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-surface-600 print:text-gray-500 uppercase tracking-wider font-semibold">Item Count</span>
                        <span className="text-xl font-bold text-white print:text-black">{filteredExpenses.length} entries</span>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-surface-200/40 text-surface-600 print:text-gray-500 font-semibold">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Title</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200/20 print:divide-gray-200">
                        {filteredExpenses.slice(0, 10).map((e) => (
                          <tr key={e.id} className="text-surface-700 print:text-black">
                            <td className="py-2.5">{formatDate(e.expenseDate)}</td>
                            <td className="py-2.5 font-medium">{e.title}</td>
                            <td className="py-2.5">{e.category}</td>
                            <td className="py-2.5 text-right font-semibold">{formatCurrency(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredExpenses.length > 10 && (
                      <span className="text-[10px] text-surface-555 italic text-center print:hidden">
                        Showing first 10 entries. All {filteredExpenses.length} entries will be included in the downloaded file.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center text-xs text-surface-500">
                    <Clock className="w-10 h-10 text-surface-450 mb-3" />
                    <span>No data available matching chosen parameters.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
