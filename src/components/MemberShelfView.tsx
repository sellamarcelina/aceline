import React from 'react';
import { AlertCircle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { Book, Member, Transaction } from '../types/library';
import { BookCover } from './BookCover';
import { formatDisplayDate, getDueCountdownLabel } from '../utils/dateHelpers';

interface MemberShelfViewProps {
  member: Member;
  books: Book[];
  transactions: Transaction[];
  onSelectBook: (book: Book) => void;
  onReturnLoan: (transactionId: string) => void;
  onBrowseCatalog: () => void;
}

export const MemberShelfView: React.FC<MemberShelfViewProps> = ({
  member,
  books,
  transactions,
  onSelectBook,
  onReturnLoan,
  onBrowseCatalog,
}) => {
  const memberTxs = transactions.filter((tx) => tx.memberId === member.id);
  const activeLoans = memberTxs.filter((tx) => tx.status !== 'Returned');
  const pastLoans = memberTxs.filter((tx) => tx.status === 'Returned');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F1D4E3] pb-5">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#2A0A14]">
            My Reading Shelf
          </h1>
          <p className="mt-1 text-sm text-[#6E4A56]">
            {member.name} · Member {member.memberCode}
          </p>
        </div>
        <button
          type="button"
          onClick={onBrowseCatalog}
          className="rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors self-start sm:self-auto"
        >
          Borrow Another Book
        </button>
      </div>

      {/* Active Loans */}
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl font-semibold text-[#2A0A14]">
          Active Loans ({activeLoans.length})
        </h2>

        {activeLoans.length === 0 ? (
          <div className="rounded-xl border border-[#F1D4E3] bg-white p-8 text-center">
            <p className="font-editorial text-xl font-semibold text-[#2A0A14]">
              No active books checked out
            </p>
            <p className="mt-1 text-sm text-[#6E4A56]">
              Explore the collection to borrow your next read.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeLoans.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              if (!book) return null;
              const countdown = getDueCountdownLabel(loan.dueDate);

              return (
                <article
                  key={loan.id}
                  className="flex gap-4 rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="w-24 shrink-0 group rounded-lg"
                  >
                    <BookCover
                      src={book.coverUrl}
                      title={book.title}
                      author={book.author}
                      className="rounded-lg"
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="text-xs text-[#6E4A56]">{book.category}</p>
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="mt-0.5 text-left"
                      >
                        <h3 className="font-editorial text-xl font-semibold text-[#2A0A14] hover:text-[#800020] transition-colors">
                          {book.title}
                        </h3>
                      </button>
                      <p className="text-xs text-[#6E4A56]">{book.author}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs tabular-nums">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            countdown.tone === 'overdue'
                              ? 'text-red-700'
                              : countdown.tone === 'warning'
                              ? 'text-amber-700'
                              : 'text-[#800020]'
                          }`}
                        >
                          {countdown.tone === 'overdue' ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          <span>{countdown.label}</span>
                        </span>
                        <span className="text-[#6E4A56]">·</span>
                        <span className="text-[#6E4A56]">
                          Due {formatDisplayDate(loan.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => onReturnLoan(loan.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#800020] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5C0017] transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Return Book</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed / Returned History */}
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl font-semibold text-[#2A0A14]">
          Reading History ({pastLoans.length})
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[#F1D4E3] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#F1D4E3] bg-[#FDF2F8]/60 text-xs font-medium text-[#6E4A56]">
                <th className="py-3 pl-5 pr-4">Title</th>
                <th className="py-3 px-4">Borrowed</th>
                <th className="py-3 px-4">Returned</th>
                <th className="py-3 pl-4 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1D4E3]">
              {pastLoans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[#6E4A56]">
                    Your completed reading history will appear here once you return a
                    volume.
                  </td>
                </tr>
              ) : (
                pastLoans.map((tx) => {
                  const book = books.find((b) => b.id === tx.bookId);
                  return (
                    <tr key={tx.id} className="hover:bg-[#FDF2F8]/40 transition-colors">
                      <td className="py-3 pl-5 pr-4">
                        <button
                          type="button"
                          onClick={() => book && onSelectBook(book)}
                          className="font-medium text-[#2A0A14] hover:text-[#800020] text-left"
                        >
                          {book?.title || 'Archived Title'}
                        </button>
                        <p className="text-xs text-[#6E4A56]">{book?.author}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6E4A56] tabular-nums whitespace-nowrap">
                        {formatDisplayDate(tx.borrowDate)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6E4A56] tabular-nums whitespace-nowrap">
                        {tx.returnDate ? formatDisplayDate(tx.returnDate) : '—'}
                      </td>
                      <td className="py-3 pl-4 pr-5 text-xs font-medium text-emerald-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Returned</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
