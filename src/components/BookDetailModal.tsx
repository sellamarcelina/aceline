import React, { useState } from 'react';
import {
  BookCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  MapPin,
  RotateCcw,
  X,
} from 'lucide-react';
import { Book, Member, Transaction, UserRole } from '../types/library';
import { BookCover } from './BookCover';
import { formatDisplayDate, getDueCountdownLabel } from '../utils/dateHelpers';

interface BookDetailModalProps {
  book: Book | null;
  role: UserRole;
  currentMemberId: string;
  members: Member[];
  transactions: Transaction[];
  onClose: () => void;
  onBorrow: (bookId: string, memberId: string, durationDays: number) => void;
  onReturn: (transactionId: string) => void;
  onEditBook?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  role,
  currentMemberId,
  members,
  transactions,
  onClose,
  onBorrow,
  onReturn,
  onEditBook,
}) => {
  const [loanDays, setLoanDays] = useState<number>(14);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentMemberId);

  if (!book) return null;

  const activeLoansForBook = transactions.filter(
    (tx) => tx.bookId === book.id && tx.status !== 'Returned'
  );

  const memberActiveLoan = activeLoansForBook.find(
    (tx) => tx.memberId === currentMemberId
  );

  const isAvailable = book.availableCopies > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A0A14]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#F1D4E3] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close book details"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-[#F1D4E3] bg-white text-[#6E4A56] hover:bg-[#FDF2F8] hover:text-[#2A0A14] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 sm:gap-8 p-6 sm:p-8">
          {/* Framed Cover Pedestal */}
          <div className="flex flex-col gap-4">
            <BookCover
              src={book.coverUrl}
              title={book.title}
              author={book.author}
              className="rounded-lg shadow-sm"
            />
            <div className="rounded-lg border border-[#F1D4E3] bg-[#FDF2F8] p-3.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6E4A56]">Stock Status</span>
                <span
                  className={`font-semibold tabular-nums ${
                    isAvailable ? 'text-emerald-800' : 'text-[#800020]'
                  }`}
                >
                  {book.availableCopies} of {book.totalCopies} available
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between border-t border-[#F1D4E3] pt-2">
                <span className="text-[#6E4A56] inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </span>
                <span className="font-medium text-[#2A0A14]">
                  {book.shelfLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Content & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E4A56] pr-10">
                <span className="font-medium text-[#800020]">{book.category}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{book.publishedYear}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{book.pages} pages</span>
              </div>

              <h2
                id="book-detail-title"
                className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold leading-tight text-[#2A0A14]"
              >
                {book.title}
              </h2>
              <p className="mt-1 text-base text-[#6E4A56]">by {book.author}</p>

              <div className="mt-5 border-y border-[#F1D4E3] py-4">
                <p className="text-sm leading-relaxed text-[#3B1B26]">
                  {book.synopsis}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-[#6E4A56]">ISBN-13</dt>
                  <dd className="mt-0.5 font-mono text-[#2A0A14] tabular-nums">
                    {book.isbn}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6E4A56]">Catalog Reference</dt>
                  <dd className="mt-0.5 font-mono text-[#2A0A14] uppercase">
                    {book.id}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Role-Specific Borrowing / Return Workflow */}
            <div className="mt-6 rounded-xl border border-[#F1D4E3] bg-[#FDF2F8]/70 p-4">
              {role === 'member' ? (
                memberActiveLoan ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#800020]">
                        <BookCheck className="h-4 w-4" />
                        <span>Currently on Your Shelf</span>
                      </div>
                      <p className="mt-1 text-xs text-[#6E4A56] tabular-nums">
                        Borrowed {formatDisplayDate(memberActiveLoan.borrowDate)} · Due{' '}
                        {formatDisplayDate(memberActiveLoan.dueDate)} (
                        {getDueCountdownLabel(memberActiveLoan.dueDate).label})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onReturn(memberActiveLoan.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Return Book</span>
                    </button>
                  </div>
                ) : isAvailable ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#2A0A14] inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#800020]" />
                        Select Loan Duration
                      </span>
                      <div className="inline-flex rounded-lg border border-[#EBC6D8] bg-white p-0.5">
                        {[7, 14, 21].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setLoanDays(days)}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors tabular-nums ${
                              loanDays === days
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
                      type="button"
                      onClick={() => onBorrow(book.id, currentMemberId, loanDays)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#800020] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Borrow Book ({loanDays}-Day Loan)</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#800020] font-medium">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>All copies are currently checked out by readers.</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#2A0A14]">
                      Librarian Quick Circulation
                    </span>
                    {onEditBook && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditBook(book);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBC6D8] bg-white px-3 py-1.5 text-xs font-medium text-[#800020] hover:bg-[#FCE7F3] transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Book Details</span>
                      </button>
                    )}
                  </div>

                  {isAvailable && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        aria-label="Select member to issue loan"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="flex-1 rounded-lg border border-[#EBC6D8] bg-white px-3 py-2 text-xs text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.memberCode})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => onBorrow(book.id, selectedMemberId, 14)}
                        className="rounded-lg bg-[#800020] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C0017] transition-colors whitespace-nowrap shrink-0"
                      >
                        Issue 14-Day Loan
                      </button>
                    </div>
                  )}

                  {activeLoansForBook.length > 0 && (
                    <div className="border-t border-[#F1D4E3] pt-3">
                      <p className="text-[11px] font-medium text-[#6E4A56] mb-2">
                        Active Holders ({activeLoansForBook.length})
                      </p>
                      <div className="space-y-2">
                        {activeLoansForBook.map((tx) => {
                          const holder = members.find((m) => m.id === tx.memberId);
                          const dueInfo = getDueCountdownLabel(tx.dueDate);
                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-[#F1D4E3] bg-white px-3 py-2 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-[#2A0A14] truncate">
                                  {holder?.name || 'Member'}
                                </p>
                                <p className="text-[11px] text-[#6E4A56] tabular-nums">
                                  Due {formatDisplayDate(tx.dueDate)} · {dueInfo.label}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onReturn(tx.id)}
                                className="rounded-md border border-[#800020] px-2.5 py-1 text-[11px] font-medium text-[#800020] hover:bg-[#800020] hover:text-white transition-colors whitespace-nowrap shrink-0"
                              >
                                Check In
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
