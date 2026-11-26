import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Book, BookCategory, UserRole } from '../types/library';
import { BOOK_CATEGORIES } from '../data/seedData';
import { BookCover } from './BookCover';

interface BookCatalogProps {
  books: Book[];
  role: UserRole;
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  role,
  onSelectBook,
  onAddBook,
  onEditBook,
  onDeleteBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | BookCategory>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'all' | 'available' | 'borrowed'
  >('all');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'All' || book.category === selectedCategory;
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.availableCopies > 0) ||
        (availabilityFilter === 'borrowed' && book.availableCopies === 0);
      return matchesQuery && matchesCategory && matchesAvailability;
    });
  }, [books, searchQuery, selectedCategory, availabilityFilter]);

  return (
    <section className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F1D4E3] pb-5">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#2A0A14]">
            The Acelivre Collection
          </h1>
          <p className="mt-1 text-sm text-[#6E4A56]">
            {books.length} curated editions across literary fiction, architecture, and
            natural history
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={onAddBook}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Book</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 rounded-xl border border-[#F1D4E3] bg-white p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E4A56]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              aria-label="Search catalog"
              className="w-full rounded-lg border border-[#EBC6D8] bg-[#FDF2F8]/50 py-2.5 pl-10 pr-4 text-sm text-[#2A0A14] placeholder:text-[#6E4A56]/70 focus:border-[#800020] focus:bg-white focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Availability filter"
            className="inline-flex items-center rounded-lg border border-[#EBC6D8] bg-[#FDF2F8]/70 p-1 self-start"
          >
            {(
              [
                { id: 'all', label: 'All Titles' },
                { id: 'available', label: 'Available' },
                { id: 'borrowed', label: 'Borrowed Out' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAvailabilityFilter(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  availabilityFilter === opt.id
                    ? 'bg-[#800020] text-white'
                    : 'text-[#6E4A56] hover:text-[#2A0A14]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-[#5C0017] text-white'
                : 'bg-[#FDF2F8] text-[#6E4A56] hover:bg-[#FCE7F3] hover:text-[#2A0A14]'
            }`}
          >
            All Categories
          </button>
          {BOOK_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === category
                  ? 'bg-[#5C0017] text-white'
                  : 'bg-[#FDF2F8] text-[#6E4A56] hover:bg-[#FCE7F3] hover:text-[#2A0A14]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-[#F1D4E3] bg-white px-6 py-14 text-center">
          <p className="font-editorial text-2xl font-semibold text-[#2A0A14]">
            No matching titles found
          </p>
          <p className="mt-1.5 text-sm text-[#6E4A56]">
            Adjust your search terms or clear active category filters to view the full
            collection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setAvailabilityFilter('all');
            }}
            className="mt-5 rounded-lg bg-[#800020] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C0017] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <article
                key={book.id}
                className="group flex flex-col justify-between rounded-xl border border-[#F1D4E3] bg-white p-4 transition-shadow duration-200 hover:shadow-md"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] rounded-lg"
                  >
                    <BookCover
                      src={book.coverUrl}
                      title={book.title}
                      author={book.author}
                      className="rounded-lg"
                    />
                  </button>

                  <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#6E4A56] truncate">{book.category}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0 tabular-nums ${
                        isAvailable ? 'text-emerald-800' : 'text-[#800020]'
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isAvailable
                          ? `Available · ${book.availableCopies}/${book.totalCopies}`
                          : 'Borrowed'}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="mt-1.5 block w-full text-left"
                  >
                    <h3 className="font-editorial text-xl font-semibold leading-snug text-[#2A0A14] group-hover:text-[#800020] transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                  </button>
                  <p className="mt-1 text-xs text-[#6E4A56]">
                    {book.author} <span aria-hidden="true">·</span>{' '}
                    <span className="tabular-nums">{book.publishedYear}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F1D4E3] pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="text-xs font-semibold text-[#800020] hover:text-[#5C0017] transition-colors py-1"
                  >
                    {role === 'member'
                      ? isAvailable
                        ? 'Inspect & Borrow'
                        : 'View Details'
                      : 'Manage Copies'}
                  </button>

                  {role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditBook(book)}
                        aria-label={`Edit ${book.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F1D4E3] text-[#6E4A56] hover:bg-[#FDF2F8] hover:text-[#800020] transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBook(book)}
                        aria-label={`Delete ${book.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F1D4E3] text-[#6E4A56] hover:bg-[#FDF2F8] hover:text-[#800020] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
