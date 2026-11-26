import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  ActivityEvent,
  Book,
  BookFormValues,
  Member,
  Transaction,
  UserRole,
} from './types/library';
import {
  CURRENT_MEMBER_ID,
  INITIAL_ACTIVITY,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
} from './data/seedData';
import { addDaysIso, TODAY_ISO } from './utils/dateHelpers';
import { ActiveTab, TopNav } from './components/TopNav';
import { MemberDashboard } from './components/MemberDashboard';
import { MemberShelfView } from './components/MemberShelfView';
import { AdminDashboard } from './components/AdminDashboard';
import { BookCatalog } from './components/BookCatalog';
import { CirculationDesk } from './components/CirculationDesk';
import { ReportsView } from './components/ReportsView';
import { BookDetailModal } from './components/BookDetailModal';
import { BookFormModal } from './components/BookFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

const STORAGE_KEY = 'acelivre_library_state_v1';

interface PersistedState {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  activityFeed: ActivityEvent[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.books) &&
        Array.isArray(parsed.members) &&
        Array.isArray(parsed.transactions) &&
        Array.isArray(parsed.activityFeed)
      ) {
        return {
          books: parsed.books,
          members: parsed.members,
          transactions: parsed.transactions,
          activityFeed: parsed.activityFeed,
        };
      }
    }
  } catch {
    // Fall back to pre-populated seed
  }
  return {
    books: INITIAL_BOOKS,
    members: INITIAL_MEMBERS,
    transactions: INITIAL_TRANSACTIONS,
    activityFeed: INITIAL_ACTIVITY,
  };
}

function formatNowTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `Nov 25 · ${hh}:${mm}`;
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());

  const [role, setRole] = useState<UserRole>('member');
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');

  const [books, setBooks] = useState<Book[]>(initial.books);
  const [members] = useState<Member[]>(initial.members);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initial.transactions
  );
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(
    initial.activityFeed
  );

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        books,
        members,
        transactions,
        activityFeed,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [books, members, transactions, activityFeed]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3400);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const currentMember =
    members.find((m) => m.id === CURRENT_MEMBER_ID) || members[0];
  const selectedBook = books.find((b) => b.id === selectedBookId) || null;

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    if (nextRole === 'admin') {
      if (activeTab === 'discover' || activeTab === 'shelf') {
        setActiveTab('dashboard');
      }
    } else {
      if (
        activeTab === 'dashboard' ||
        activeTab === 'circulation' ||
        activeTab === 'reports'
      ) {
        setActiveTab('discover');
      }
    }
  };

  const handleBorrowBook = (
    bookId: string,
    memberId: string,
    durationDays: number
  ) => {
    const targetBook = books.find((b) => b.id === bookId);
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetBook || targetBook.availableCopies <= 0 || !targetMember) return;

    const alreadyActive = transactions.some(
      (tx) =>
        tx.bookId === bookId &&
        tx.memberId === memberId &&
        tx.status !== 'Returned'
    );
    if (alreadyActive) {
      setToastMessage(
        `${targetMember.name} already holds an active copy of "${targetBook.title}".`
      );
      return;
    }

    const dueDate = addDaysIso(TODAY_ISO, durationDays);
    const newTx: Transaction = {
      id: `tx-${Math.floor(1015 + Math.random() * 8900)}`,
      bookId,
      memberId,
      borrowDate: TODAY_ISO,
      dueDate,
      returnDate: null,
      status: 'Active',
    };

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'borrow',
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookCoverUrl: targetBook.coverUrl,
      memberName: targetMember.name,
      timestamp: formatNowTimestamp(),
      note: `${durationDays}-day loan checked out`,
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );
    setTransactions((prev) => [newTx, ...prev]);
    setActivityFeed((prev) => [newEvent, ...prev]);
    setToastMessage(
      `Checked out "${targetBook.title}" for ${durationDays} days.`
    );
  };

  const handleReturnLoan = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status === 'Returned') return;

    const targetBook = books.find((b) => b.id === tx.bookId);
    const targetMember = members.find((m) => m.id === tx.memberId);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, status: 'Returned', returnDate: TODAY_ISO }
          : t
      )
    );

    if (targetBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === targetBook.id
            ? {
                ...b,
                availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
              }
            : b
        )
      );

      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'return',
        bookId: targetBook.id,
        bookTitle: targetBook.title,
        bookCoverUrl: targetBook.coverUrl,
        memberName: targetMember?.name || 'Member',
        timestamp: formatNowTimestamp(),
        note: 'Returned and verified on shelf',
      };
      setActivityFeed((prev) => [newEvent, ...prev]);
    }

    setToastMessage(
      `Returned "${targetBook?.title || 'book'}" to available stock.`
    );
  };

  const handleSaveBook = (values: BookFormValues, existingBookId?: string) => {
    if (existingBookId) {
      const existing = books.find((b) => b.id === existingBookId);
      const checkedOutCount = existing
        ? existing.totalCopies - existing.availableCopies
        : 0;
      const nextAvailable = Math.max(0, values.totalCopies - checkedOutCount);

      setBooks((prev) =>
        prev.map((b) =>
          b.id === existingBookId
            ? {
                ...b,
                ...values,
                availableCopies: nextAvailable,
              }
            : b
        )
      );

      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'updated',
        bookId: existingBookId,
        bookTitle: values.title,
        bookCoverUrl: values.coverUrl,
        memberName: 'Claire Moreau (Admin)',
        timestamp: formatNowTimestamp(),
        note: 'Catalog entry updated',
      };
      setActivityFeed((prev) => [newEvent, ...prev]);
      setToastMessage(`Updated "${values.title}" in catalog.`);
    } else {
      const newBook: Book = {
        id: `bk-${Date.now()}`,
        ...values,
        availableCopies: values.totalCopies,
      };
      setBooks((prev) => [newBook, ...prev]);

      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'added',
        bookId: newBook.id,
        bookTitle: newBook.title,
        bookCoverUrl: newBook.coverUrl,
        memberName: 'Claire Moreau (Admin)',
        timestamp: formatNowTimestamp(),
        note: `Added ${newBook.totalCopies} copies to ${newBook.shelfLocation}`,
      };
      setActivityFeed((prev) => [newEvent, ...prev]);
      setToastMessage(`Added "${newBook.title}" to Acelivre.`);
    }

    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleConfirmDeleteBook = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBookId === bookId) setSelectedBookId(null);
    setDeletingBook(null);
    if (target) {
      setToastMessage(`Removed "${target.title}" from the catalog.`);
    }
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBooks(INITIAL_BOOKS);
    setTransactions(INITIAL_TRANSACTIONS);
    setActivityFeed(INITIAL_ACTIVITY);
    setToastMessage('Restored default Acelivre collection and ledger.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF2F8] text-[#2A0A14]">
      <TopNav
        role={role}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        memberName={currentMember.name}
      />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {role === 'member' && activeTab === 'discover' && (
          <MemberDashboard
            member={currentMember}
            books={books}
            transactions={transactions}
            onBrowseCatalog={() => setActiveTab('catalog')}
            onOpenShelf={() => setActiveTab('shelf')}
            onSelectBook={(b) => setSelectedBookId(b.id)}
            onReturnLoan={handleReturnLoan}
          />
        )}

        {role === 'member' && activeTab === 'shelf' && (
          <MemberShelfView
            member={currentMember}
            books={books}
            transactions={transactions}
            onSelectBook={(b) => setSelectedBookId(b.id)}
            onReturnLoan={handleReturnLoan}
            onBrowseCatalog={() => setActiveTab('catalog')}
          />
        )}

        {role === 'admin' && activeTab === 'dashboard' && (
          <AdminDashboard
            books={books}
            members={members}
            transactions={transactions}
            activityFeed={activityFeed}
            onOpenAddBook={() => {
              setEditingBook(null);
              setIsFormOpen(true);
            }}
            onOpenReports={() => setActiveTab('reports')}
            onOpenCirculation={() => setActiveTab('circulation')}
            onSelectBook={(b) => setSelectedBookId(b.id)}
          />
        )}

        {activeTab === 'catalog' && (
          <BookCatalog
            books={books}
            role={role}
            onSelectBook={(b) => setSelectedBookId(b.id)}
            onAddBook={() => {
              setEditingBook(null);
              setIsFormOpen(true);
            }}
            onEditBook={(b) => {
              setEditingBook(b);
              setIsFormOpen(true);
            }}
            onDeleteBook={(b) => setDeletingBook(b)}
          />
        )}

        {role === 'admin' && activeTab === 'circulation' && (
          <CirculationDesk
            books={books}
            members={members}
            transactions={transactions}
            onBorrow={handleBorrowBook}
            onReturn={handleReturnLoan}
            onSelectBook={(b) => setSelectedBookId(b.id)}
          />
        )}

        {role === 'admin' && activeTab === 'reports' && (
          <ReportsView
            books={books}
            members={members}
            transactions={transactions}
            onReturnLoan={handleReturnLoan}
            onNotify={(msg) => setToastMessage(msg)}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="no-print border-t border-[#F1D4E3] bg-white/70">
        <div className="mx-auto flex max-w-[1400px] flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-5 text-xs text-[#6E4A56]">
          <p>
            <span className="font-editorial text-base font-semibold text-[#5C0017]">
              Acelivre
            </span>{' '}
            <span aria-hidden="true">·</span> Curated Digital Library &amp;
            Circulation Archive
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            className="text-xs font-medium text-[#800020] hover:text-[#5C0017] transition-colors"
          >
            Reset Sample Collection
          </button>
        </div>
      </footer>

      {/* Modals */}
      <BookDetailModal
        book={selectedBook}
        role={role}
        currentMemberId={currentMember.id}
        members={members}
        transactions={transactions}
        onClose={() => setSelectedBookId(null)}
        onBorrow={handleBorrowBook}
        onReturn={handleReturnLoan}
        onEditBook={(b) => {
          setEditingBook(b);
          setIsFormOpen(true);
        }}
      />

      <BookFormModal
        isOpen={isFormOpen}
        editingBook={editingBook}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleSaveBook}
      />

      <DeleteConfirmModal
        book={deletingBook}
        onCancel={() => setDeletingBook(null)}
        onConfirm={handleConfirmDeleteBook}
      />

      {/* Non-blocking Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-[#800020]/30 bg-[#5C0017] px-4 py-3 text-xs font-medium text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FBCFE8]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
