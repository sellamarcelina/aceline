import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Book, Member, Transaction, TransactionStatus } from '../types/library';
import { formatDisplayDate, TODAY_ISO } from '../utils/dateHelpers';

interface ReportsViewProps {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  onReturnLoan: (transactionId: string) => void;
  onNotify: (message: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  books,
  members,
  transactions,
  onReturnLoan,
  onNotify,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [query, setQuery] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const book = books.find((b) => b.id === tx.bookId);
      const member = members.find((m) => m.id === tx.memberId);

      const matchesStatus =
        statusFilter === 'All' || tx.status === statusFilter;
      const matchesStart = !startDate || tx.borrowDate >= startDate;
      const matchesEnd = !endDate || tx.borrowDate <= endDate;
      const matchesQuery =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        (book?.title.toLowerCase().includes(q) ?? false) ||
        (member?.name.toLowerCase().includes(q) ?? false) ||
        (member?.memberCode.toLowerCase().includes(q) ?? false);

      return matchesStatus && matchesStart && matchesEnd && matchesQuery;
    });
  }, [transactions, books, members, statusFilter, startDate, endDate, query]);

  const metrics = useMemo(() => {
    const total = filteredTransactions.length;
    const active = filteredTransactions.filter((t) => t.status === 'Active').length;
    const returned = filteredTransactions.filter(
      (t) => t.status === 'Returned'
    ).length;
    const overdue = filteredTransactions.filter((t) => t.status === 'Overdue').length;
    return { total, active, returned, overdue };
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Book Title',
      'Author',
      'ISBN',
      'Member Name',
      'Member Code',
      'Borrow Date',
      'Due Date',
      'Return Date',
      'Status',
    ];

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const rows = filteredTransactions.map((tx) => {
      const book = books.find((b) => b.id === tx.bookId);
      const member = members.find((m) => m.id === tx.memberId);
      return [
        tx.id,
        book?.title || 'Removed Title',
        book?.author || '—',
        book?.isbn || '—',
        member?.name || 'Member',
        member?.memberCode || '—',
        tx.borrowDate,
        tx.dueDate,
        tx.returnDate || '',
        tx.status,
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acelivre-circulation-report-${TODAY_ISO}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-Only Formal Header */}
      <div className="hidden print-only border-b border-zinc-300 pb-4 mb-6">
        <h1 className="font-editorial text-3xl font-bold text-black">
          Acelivre — Official Circulation Ledger
        </h1>
        <p className="mt-1 text-xs text-zinc-600">
          Generated on {formatDisplayDate(TODAY_ISO)} · Filter Range: {startDate || 'Start'} to{' '}
          {endDate || 'Present'} · Status: {statusFilter}
        </p>
      </div>

      {/* Screen Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F1D4E3] pb-5">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#2A0A14]">
            Circulation Reports
          </h1>
          <p className="mt-1 text-sm text-[#6E4A56]">
            Filter borrowing ledgers by date range or status, export CSV archives, or
            print formal statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-[#EBC6D8] bg-white px-4 py-2.5 text-sm font-medium text-[#2A0A14] hover:bg-[#FCE7F3]/60 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4 text-[#800020]" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="print-clean-card rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Filtered Records</p>
          <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#2A0A14] tabular-nums">
            {metrics.total}
          </p>
        </div>
        <div className="print-clean-card rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Active Loans</p>
          <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#800020] tabular-nums">
            {metrics.active}
          </p>
        </div>
        <div className="print-clean-card rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Returned On Record</p>
          <p className="mt-1.5 font-editorial text-3xl font-semibold text-emerald-800 tabular-nums">
            {metrics.returned}
          </p>
        </div>
        <div className="print-clean-card rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Overdue Items</p>
          <p className="mt-1.5 font-editorial text-3xl font-semibold text-red-700 tabular-nums">
            {metrics.overdue}
          </p>
        </div>
      </section>

      {/* Filters Toolbar */}
      <section className="no-print rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E4A56]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by book title, member name, or ID..."
              aria-label="Filter report records"
              className="w-full rounded-lg border border-[#EBC6D8] bg-[#FDF2F8]/50 py-2.5 pl-10 pr-4 text-sm text-[#2A0A14] focus:border-[#800020] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="report-start-date"
              className="text-xs font-medium text-[#6E4A56] whitespace-nowrap"
            >
              From
            </label>
            <input
              id="report-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2 text-xs font-mono text-[#2A0A14] focus:border-[#800020] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="report-end-date"
              className="text-xs font-medium text-[#6E4A56] whitespace-nowrap"
            >
              To
            </label>
            <input
              id="report-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2 text-xs font-mono text-[#2A0A14] focus:border-[#800020] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Loan status filter"
            className="inline-flex items-center rounded-lg border border-[#EBC6D8] bg-[#FDF2F8] p-1"
          >
            {(['All', 'Active', 'Returned', 'Overdue'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === status
                    ? 'bg-[#800020] text-white'
                    : 'text-[#6E4A56] hover:text-[#2A0A14]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setStartDate('2026-10-01');
              setEndDate('2026-12-31');
              setQuery('');
            }}
            className="text-xs font-medium text-[#800020] hover:text-[#5C0017]"
          >
            Reset Report Filters
          </button>
        </div>
      </section>

      {/* Ledger Table */}
      <section className="print-clean-card overflow-x-auto rounded-xl border border-[#F1D4E3] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#F1D4E3] bg-[#FDF2F8]/70 text-xs font-semibold text-[#6E4A56]">
              <th className="py-3.5 pl-5 pr-3">ID</th>
              <th className="py-3.5 px-3">Book Title</th>
              <th className="py-3.5 px-3">Member</th>
              <th className="py-3.5 px-3">Borrow Date</th>
              <th className="py-3.5 px-3">Due Date</th>
              <th className="py-3.5 px-3">Return Date</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="no-print py-3.5 pl-3 pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1D4E3]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-[#6E4A56]">
                  No circulation records match the selected date range and status.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const book = books.find((b) => b.id === tx.bookId);
                const member = members.find((m) => m.id === tx.memberId);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FDF2F8]/40 transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-mono text-xs text-[#6E4A56] uppercase whitespace-nowrap tabular-nums">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-3 min-w-[200px]">
                      <p className="font-medium text-[#2A0A14]">
                        {book?.title || 'Removed Title'}
                      </p>
                      <p className="text-xs text-[#6E4A56]">{book?.author || '—'}</p>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="text-[#2A0A14]">{member?.name || 'Member'}</p>
                      <p className="font-mono text-[11px] text-[#6E4A56]">
                        {member?.memberCode}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#2A0A14] whitespace-nowrap tabular-nums">
                      {formatDisplayDate(tx.borrowDate)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#2A0A14] whitespace-nowrap tabular-nums">
                      {formatDisplayDate(tx.dueDate)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#6E4A56] whitespace-nowrap tabular-nums">
                      {tx.returnDate ? formatDisplayDate(tx.returnDate) : '—'}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {tx.status === 'Returned' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Returned</span>
                        </span>
                      )}
                      {tx.status === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#800020]">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                      {tx.status === 'Overdue' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </td>
                    <td className="no-print py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      {tx.status !== 'Returned' ? (
                        <button
                          type="button"
                          onClick={() => onReturnLoan(tx.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#800020] px-2.5 py-1 text-xs font-medium text-[#800020] hover:bg-[#800020] hover:text-white transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Mark Returned</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#6E4A56]">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};
