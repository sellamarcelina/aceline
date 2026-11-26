import React, { useState } from 'react';
import { AlertCircle, BookCheck, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { Book, Member, Transaction } from '../types/library';
import { BookCover } from './BookCover';
import { formatDisplayDate, getDueCountdownLabel } from '../utils/dateHelpers';

interface CirculationDeskProps {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  onBorrow: (bookId: string, memberId: string, durationDays: number) => void;
  onReturn: (transactionId: string) => void;
  onSelectBook: (book: Book) => void;
}

export const CirculationDesk: React.FC<CirculationDeskProps> = ({
  books,
  members,
  transactions,
  onBorrow,
  onReturn,
  onSelectBook,
}) => {
  const availableBooks = books.filter((b) => b.availableCopies > 0);
  const [selectedBookId, setSelectedBookId] = useState<string>(
    availableBooks[0]?.id || ''
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || ''
  );
  const [durationDays, setDurationDays] = useState<number>(14);

  const activeLoans = transactions.filter((t) => t.status !== 'Returned');

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBookId = selectedBookId || availableBooks[0]?.id;
    if (!targetBookId || !selectedMemberId) return;
    onBorrow(targetBookId, selectedMemberId, durationDays);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#F1D4E3] pb-5">
        <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#2A0A14]">
          Circulation Desk
        </h1>
        <p className="mt-1 text-sm text-[#6E4A56]">
          Issue loans to members and check in returned or overdue volumes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Issue New Loan Panel */}
        <section className="rounded-xl border border-[#F1D4E3] bg-white p-5 sm:p-6">
          <h2 className="font-editorial text-2xl font-semibold text-[#2A0A14]">
            Issue New Loan
          </h2>
          <p className="mt-1 text-xs text-[#6E4A56]">
            Select an available volume and assign it to a member
          </p>

          {availableBooks.length === 0 ? (
            <div className="mt-5 rounded-lg border border-[#F1D4E3] bg-[#FDF2F8] p-4 text-xs text-[#6E4A56]">
              Every copy in the catalog is currently checked out. Check in a returned
              book to release stock.
            </div>
          ) : (
            <form onSubmit={handleIssueSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="circ-book"
                  className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                >
                  Available Title
                </label>
                <select
                  id="circ-book"
                  value={
                    availableBooks.some((b) => b.id === selectedBookId)
                      ? selectedBookId
                      : availableBooks[0].id
                  }
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                >
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} avail.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="circ-member"
                  className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                >
                  Member Account
                </label>
                <select
                  id="circ-member"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#2A0A14] mb-1.5">
                  Loan Term
                </span>
                <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#EBC6D8] bg-[#FDF2F8] p-1">
                  {[7, 14, 21].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`rounded-md py-1.5 text-xs font-medium tabular-nums transition-colors ${
                        durationDays === days
                          ? 'bg-[#800020] text-white'
                          : 'text-[#6E4A56] hover:text-[#2A0A14]'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors"
              >
                <BookCheck className="h-4 w-4" />
                <span>Confirm Checkout</span>
              </button>
            </form>
          )}
        </section>

        {/* Active & Overdue Loans Queue */}
        <section className="rounded-xl border border-[#F1D4E3] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-[#F1D4E3] pb-4 mb-4">
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-[#2A0A14]">
                Open Checkouts ({activeLoans.length})
              </h2>
              <p className="text-xs text-[#6E4A56]">
                Click Check In to immediately restore stock and update records
              </p>
            </div>
          </div>

          {activeLoans.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6E4A56]">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
              All books are currently checked in.
            </div>
          ) : (
            <div className="divide-y divide-[#F1D4E3]">
              {activeLoans.map((tx) => {
                const book = books.find((b) => b.id === tx.bookId);
                const member = members.find((m) => m.id === tx.memberId);
                if (!book) return null;
                const due = getDueCountdownLabel(tx.dueDate);

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="w-11 shrink-0 rounded overflow-hidden"
                      >
                        <BookCover
                          src={book.coverUrl}
                          title={book.title}
                          className="rounded"
                        />
                      </button>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectBook(book)}
                          className="font-medium text-sm text-[#2A0A14] hover:text-[#800020] text-left truncate block max-w-full"
                        >
                          {book.title}
                        </button>
                        <p className="text-xs text-[#6E4A56] truncate">
                          {member?.name || 'Member'} ({member?.memberCode}) · Borrowed{' '}
                          {formatDisplayDate(tx.borrowDate)}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs tabular-nums">
                          {due.tone === 'overdue' ? (
                            <AlertCircle className="h-3.5 w-3.5 text-red-700" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-[#800020]" />
                          )}
                          <span
                            className={`font-medium ${
                              due.tone === 'overdue'
                                ? 'text-red-700'
                                : due.tone === 'warning'
                                ? 'text-amber-700'
                                : 'text-[#800020]'
                            }`}
                          >
                            {due.label} (Due {formatDisplayDate(tx.dueDate)})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onReturn(tx.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#800020] bg-white px-3.5 py-2 text-xs font-medium text-[#800020] hover:bg-[#800020] hover:text-white transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Check In Copy</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
