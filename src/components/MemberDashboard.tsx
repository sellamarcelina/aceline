import React, { useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Book, Member, Transaction } from '../types/library';
import { HERO_BANNER_URL } from '../data/seedData';
import { BookCover } from './BookCover';
import {
  diffDaysFromToday,
  formatDisplayDate,
  getDueCountdownLabel,
} from '../utils/dateHelpers';

interface MemberDashboardProps {
  member: Member;
  books: Book[];
  transactions: Transaction[];
  onBrowseCatalog: () => void;
  onOpenShelf: () => void;
  onSelectBook: (book: Book) => void;
  onReturnLoan: (transactionId: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  member,
  books,
  transactions,
  onBrowseCatalog,
  onOpenShelf,
  onSelectBook,
  onReturnLoan,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const memberTransactions = transactions.filter(
    (tx) => tx.memberId === member.id
  );
  const activeLoans = memberTransactions.filter((tx) => tx.status !== 'Returned');
  const returnedCount = memberTransactions.filter(
    (tx) => tx.status === 'Returned'
  ).length;

  const sortedNextDue = [...activeLoans].sort(
    (a, b) => diffDaysFromToday(a.dueDate) - diffDaysFromToday(b.dueDate)
  )[0];

  const recommendedBooks = books.filter((b) => b.featured || b.availableCopies > 0);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -340 : 340;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Hero Split Banner */}
      <section className="overflow-hidden rounded-2xl border border-[#F1D4E3] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] items-stretch">
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#800020]">
                Member Reading Room · {member.memberCode}
              </p>
              <h1 className="mt-3 font-editorial text-4xl sm:text-5xl font-semibold leading-[1.08] text-[#2A0A14] text-balance">
                Welcome back, {member.name.split(' ')[0]}. Your quiet library awaits.
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#6E4A56]">
                Explore new acquisitions in {member.favoriteGenre.toLowerCase()}, check
                your upcoming return dates, or reserve an edition for your personal shelf.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="inline-flex items-center gap-2 rounded-lg bg-[#800020] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Browse Collection</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenShelf}
                className="inline-flex items-center gap-2 rounded-lg border border-[#EBC6D8] bg-[#FDF2F8] px-5 py-2.5 text-sm font-medium text-[#5C0017] hover:bg-[#FCE7F3] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View My Shelf ({activeLoans.length})</span>
              </button>
            </div>
          </div>

          <div className="relative min-h-[260px] lg:min-h-[380px]">
            <img
              src={HERO_BANNER_URL}
              alt="Sunlit minimalist reading nook with blush and burgundy hardcover books"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4-Column Personal Reading Stats Strip */}
      <section aria-label="Personal reading statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#F1D4E3] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Currently Borrowed</p>
          <p className="mt-2 font-editorial text-3xl font-semibold text-[#2A0A14] tabular-nums">
            {activeLoans.length}
          </p>
          <p className="mt-1 text-xs text-[#6E4A56]">Active reading loans</p>
        </div>
        <div className="rounded-xl border border-[#F1D4E3] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Books Completed</p>
          <p className="mt-2 font-editorial text-3xl font-semibold text-[#2A0A14] tabular-nums">
            {returnedCount}
          </p>
          <p className="mt-1 text-xs text-[#6E4A56]">Returned in 2026</p>
        </div>
        <div className="rounded-xl border border-[#F1D4E3] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Next Return Due</p>
          <p className="mt-2 font-editorial text-3xl font-semibold text-[#800020] tabular-nums">
            {sortedNextDue ? formatDisplayDate(sortedNextDue.dueDate) : 'None'}
          </p>
          <p className="mt-1 text-xs text-[#6E4A56]">
            {sortedNextDue
              ? getDueCountdownLabel(sortedNextDue.dueDate).label
              : 'All clear'}
          </p>
        </div>
        <div className="rounded-xl border border-[#F1D4E3] bg-white p-5">
          <p className="text-xs font-medium text-[#6E4A56]">Primary Interest</p>
          <p className="mt-2 font-editorial text-2xl font-semibold text-[#2A0A14] truncate">
            {member.favoriteGenre}
          </p>
          <p className="mt-1 text-xs text-[#6E4A56]">Curated preference</p>
        </div>
      </section>

      {/* Currently Borrowed Books with Due-Date Countdowns */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#F1D4E3] pb-3">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#2A0A14]">
              Currently Borrowed
            </h2>
            <p className="text-xs text-[#6E4A56]">
              Manage active checkouts and return deadlines
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenShelf}
            className="text-xs font-semibold text-[#800020] hover:text-[#5C0017] transition-colors"
          >
            Full Reading History
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="rounded-xl border border-[#F1D4E3] bg-white p-8 text-center">
            <p className="font-editorial text-xl font-semibold text-[#2A0A14]">
              Your reading shelf is clear
            </p>
            <p className="mt-1 text-sm text-[#6E4A56]">
              Browse the Acelivre collection to borrow your next volume.
            </p>
            <button
              type="button"
              onClick={onBrowseCatalog}
              className="mt-4 rounded-lg bg-[#800020] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C0017] transition-colors"
            >
              Explore Books
            </button>
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
                  className="flex gap-4 sm:gap-5 rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="w-24 sm:w-28 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] rounded-lg"
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
                      <p className="text-xs text-[#6E4A56] truncate">
                        {book.category}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="mt-0.5 block text-left"
                      >
                        <h3 className="font-editorial text-xl font-semibold leading-snug text-[#2A0A14] hover:text-[#800020] transition-colors line-clamp-2">
                          {book.title}
                        </h3>
                      </button>
                      <p className="mt-0.5 text-xs text-[#6E4A56]">
                        {book.author}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums">
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
                        <span className="text-[#6E4A56]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[#6E4A56]">
                          Due {formatDisplayDate(loan.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onReturnLoan(loan.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#800020] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5C0017] transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Return Book</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="rounded-lg border border-[#EBC6D8] bg-[#FDF2F8] px-3.5 py-2 text-xs font-medium text-[#2A0A14] hover:bg-[#FCE7F3] transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Reads Carousel */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#F1D4E3] pb-3">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#2A0A14]">
              Recommended Reads
            </h2>
            <p className="text-xs text-[#6E4A56]">
              Curated selections from our librarians
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll recommended reads left"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBC6D8] bg-white text-[#5C0017] hover:bg-[#FCE7F3] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll recommended reads right"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBC6D8] bg-white text-[#5C0017] hover:bg-[#FCE7F3] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto pb-3 scroll-smooth scrollbar-hide snap-x snap-mandatory"
        >
          {recommendedBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => onSelectBook(book)}
                className="group snap-start flex w-[210px] sm:w-[230px] shrink-0 flex-col rounded-xl border border-[#F1D4E3] bg-white p-3.5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020]"
              >
                <BookCover
                  src={book.coverUrl}
                  title={book.title}
                  author={book.author}
                  className="rounded-lg"
                />
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#6E4A56]">
                  <span className="truncate">{book.category}</span>
                </div>
                <h3 className="mt-1 font-editorial text-lg font-semibold leading-snug text-[#2A0A14] group-hover:text-[#800020] transition-colors line-clamp-2">
                  {book.title}
                </h3>
                <p className="mt-0.5 text-xs text-[#6E4A56] truncate">
                  {book.author}
                </p>
                <p
                  className={`mt-2 text-[11px] font-medium tabular-nums ${
                    isAvailable ? 'text-emerald-800' : 'text-[#800020]'
                  }`}
                >
                  {isAvailable
                    ? `${book.availableCopies} copies available`
                    : 'Currently checked out'}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
