export type UserRole = 'member' | 'admin';

export type BookCategory =
  | 'Literary Fiction'
  | 'Architecture & Design'
  | 'Botanical & Natural History'
  | 'Philosophy & Essays'
  | 'Art & Ceramics'
  | 'Astronomy & Science';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  isbn: string;
  publishedYear: number;
  pages: number;
  totalCopies: number;
  availableCopies: number;
  coverUrl: string;
  synopsis: string;
  shelfLocation: string;
  featured?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  memberCode: string;
  joinedDate: string;
  avatarUrl: string;
  favoriteGenre: BookCategory;
}

export type TransactionStatus = 'Active' | 'Returned' | 'Overdue';

export interface Transaction {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD | null
  status: TransactionStatus;
}

export type ActivityType = 'borrow' | 'return' | 'overdue' | 'added' | 'updated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  memberName: string;
  timestamp: string; // ISO string or readable datetime
  note: string;
}

export interface BookFormValues {
  title: string;
  author: string;
  category: BookCategory;
  isbn: string;
  publishedYear: number;
  pages: number;
  totalCopies: number;
  coverUrl: string;
  synopsis: string;
  shelfLocation: string;
  featured?: boolean;
}
