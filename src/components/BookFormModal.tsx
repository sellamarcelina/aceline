import React, { useState, useEffect, useRef } from 'react';
import { ImagePlus, Link2, Sparkles, Upload, X } from 'lucide-react';
import { Book, BookCategory, BookFormValues } from '../types/library';
import { BOOK_CATEGORIES, COVER_PRESETS } from '../data/seedData';
import { BookCover } from './BookCover';
import { createEditorialSvgCover } from '../utils/coverSvgs';

interface BookFormModalProps {
  isOpen: boolean;
  editingBook: Book | null;
  onClose: () => void;
  onSubmit: (values: BookFormValues, existingBookId?: string) => void;
}

const DEFAULT_VALUES: BookFormValues = {
  title: '',
  author: '',
  category: 'Literary Fiction',
  isbn: '',
  publishedYear: 2026,
  pages: 240,
  totalCopies: 3,
  coverUrl: COVER_PRESETS[0].url,
  synopsis: '',
  shelfLocation: 'Wing A · Shelf 01',
  featured: false,
};

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  editingBook,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<BookFormValues>(DEFAULT_VALUES);
  const [coverSourceMode, setCoverSourceMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setUploadedFileName('');
    if (editingBook) {
      setValues({
        title: editingBook.title,
        author: editingBook.author,
        category: editingBook.category,
        isbn: editingBook.isbn,
        publishedYear: editingBook.publishedYear,
        pages: editingBook.pages,
        totalCopies: editingBook.totalCopies,
        coverUrl: editingBook.coverUrl,
        synopsis: editingBook.synopsis,
        shelfLocation: editingBook.shelfLocation,
        featured: Boolean(editingBook.featured),
      });
      setCoverSourceMode(editingBook.coverUrl.startsWith('data:image/') ? 'upload' : 'url');
    } else {
      setValues({
        ...DEFAULT_VALUES,
        isbn: `978-0-99${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(10 + Math.random() * 89)}-0`,
      });
      setCoverSourceMode('upload');
    }
  }, [isOpen, editingBook]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, or SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file must be smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValues((prev) => ({ ...prev, coverUrl: reader.result as string }));
        setUploadedFileName(file.name);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCustomSvgCover = () => {
    const cover = createEditorialSvgCover({
      title: values.title.trim() || 'Untitled Monograph',
      author: values.author.trim() || 'Acelivre Author',
      edition: 'CURATED PRESS',
      motif: 'conservatory',
    });
    setValues((prev) => ({ ...prev, coverUrl: cover }));
    setUploadedFileName('Generated Editorial Typography Cover');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.author.trim()) {
      setErrorMsg('Title and author are required.');
      return;
    }
    if (!values.synopsis.trim()) {
      setErrorMsg('Please enter a brief editorial synopsis.');
      return;
    }
    if (values.totalCopies < 1) {
      setErrorMsg('Total copies must be at least 1.');
      return;
    }
    onSubmit(
      {
        ...values,
        title: values.title.trim(),
        author: values.author.trim(),
        isbn: values.isbn.trim() || '978-0-000000-00-0',
        synopsis: values.synopsis.trim(),
        shelfLocation: values.shelfLocation.trim() || 'Wing A · Shelf 01',
      },
      editingBook?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A0A14]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-form-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#F1D4E3] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F1D4E3] bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h2
              id="book-form-title"
              className="font-editorial text-2xl font-semibold text-[#2A0A14]"
            >
              {editingBook ? 'Edit Collection Title' : 'Add New Title to Catalog'}
            </h2>
            <p className="text-xs text-[#6E4A56]">
              Configure bibliographic metadata and cover artwork
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F1D4E3] text-[#6E4A56] hover:bg-[#FDF2F8] hover:text-[#2A0A14] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 rounded-lg border border-[#800020]/30 bg-[#FDF2F8] px-4 py-3 text-xs font-medium text-[#800020]">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            {/* Left Column: Live Cover Preview + Image Source Selector */}
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-[#6E4A56] mb-2">
                  Live Cover Preview
                </span>
                <BookCover
                  src={values.coverUrl}
                  title={values.title || 'New Title Preview'}
                  author={values.author || 'Author Name'}
                  className="rounded-lg shadow-sm"
                />
              </div>

              <div className="rounded-xl border border-[#F1D4E3] bg-[#FDF2F8]/60 p-3 space-y-3">
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#EBC6D8] bg-white p-0.5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setCoverSourceMode('upload')}
                    className={`rounded-md py-1.5 transition-colors ${
                      coverSourceMode === 'upload'
                        ? 'bg-[#800020] text-white'
                        : 'text-[#6E4A56] hover:text-[#2A0A14]'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverSourceMode('url')}
                    className={`rounded-md py-1.5 transition-colors ${
                      coverSourceMode === 'url'
                        ? 'bg-[#800020] text-white'
                        : 'text-[#6E4A56] hover:text-[#2A0A14]'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverSourceMode('preset')}
                    className={`rounded-md py-1.5 transition-colors ${
                      coverSourceMode === 'preset'
                        ? 'bg-[#800020] text-white'
                        : 'text-[#6E4A56] hover:text-[#2A0A14]'
                    }`}
                  >
                    Studio
                  </button>
                </div>

                {coverSourceMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#800020]/50 bg-white px-3 py-3 text-xs font-medium text-[#800020] hover:bg-[#FCE7F3]/60 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Cover File</span>
                    </button>
                    {uploadedFileName && (
                      <p className="text-[11px] text-[#6E4A56] truncate">
                        Selected: {uploadedFileName}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateCustomSvgCover}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#EBC6D8] bg-white px-3 py-2 text-[11px] font-medium text-[#2A0A14] hover:bg-[#FDF2F8] transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#800020]" />
                      <span>Compose Typographic Cover</span>
                    </button>
                  </div>
                )}

                {coverSourceMode === 'url' && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="book-cover-url"
                      className="text-[11px] font-medium text-[#6E4A56] inline-flex items-center gap-1"
                    >
                      <Link2 className="h-3 w-3" />
                      Image URL or Data URI
                    </label>
                    <input
                      id="book-cover-url"
                      type="text"
                      value={values.coverUrl}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, coverUrl: e.target.value }))
                      }
                      placeholder="https://... or /src/assets/..."
                      className="w-full rounded-lg border border-[#EBC6D8] bg-white px-2.5 py-2 text-xs text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                )}

                {coverSourceMode === 'preset' && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-[#6E4A56] inline-flex items-center gap-1">
                      <ImagePlus className="h-3 w-3" />
                      Curated Studio Bindings
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() =>
                            setValues((prev) => ({ ...prev, coverUrl: preset.url }))
                          }
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors ${
                            values.coverUrl === preset.url
                              ? 'border-[#800020] bg-[#800020] text-white'
                              : 'border-[#EBC6D8] bg-white text-[#2A0A14] hover:bg-[#FDF2F8]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="h-6 w-5 rounded-sm object-cover shrink-0"
                          />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Bibliographic Form Fields */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="book-title"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    Book Title
                  </label>
                  <input
                    id="book-title"
                    type="text"
                    required
                    value={values.title}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., The Architecture of Quiet Rooms"
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-author"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    Author
                  </label>
                  <input
                    id="book-author"
                    type="text"
                    required
                    value={values.author}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, author: e.target.value }))
                    }
                    placeholder="e.g., Clara Vance"
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-category"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="book-category"
                    value={values.category}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        category: e.target.value as BookCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="book-isbn"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    ISBN-13
                  </label>
                  <input
                    id="book-isbn"
                    type="text"
                    value={values.isbn}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, isbn: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 font-mono text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-shelf"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    Shelf Location
                  </label>
                  <input
                    id="book-shelf"
                    type="text"
                    value={values.shelfLocation}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        shelfLocation: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 text-sm text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <div>
                    <label
                      htmlFor="book-year"
                      className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                    >
                      Year
                    </label>
                    <input
                      id="book-year"
                      type="number"
                      min={1800}
                      max={2030}
                      value={values.publishedYear}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          publishedYear: Number(e.target.value) || 2025,
                        }))
                      }
                      className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2.5 text-sm tabular-nums text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="book-pages"
                      className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                    >
                      Pages
                    </label>
                    <input
                      id="book-pages"
                      type="number"
                      min={1}
                      max={5000}
                      value={values.pages}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          pages: Number(e.target.value) || 200,
                        }))
                      }
                      className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2.5 text-sm tabular-nums text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="book-copies"
                      className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                    >
                      Total Copies
                    </label>
                    <input
                      id="book-copies"
                      type="number"
                      min={1}
                      max={100}
                      value={values.totalCopies}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          totalCopies: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3 py-2.5 text-sm tabular-nums text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="book-synopsis"
                    className="block text-xs font-medium text-[#2A0A14] mb-1.5"
                  >
                    Editorial Synopsis
                  </label>
                  <textarea
                    id="book-synopsis"
                    rows={4}
                    required
                    value={values.synopsis}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, synopsis: e.target.value }))
                    }
                    placeholder="Provide a concise summary of the work, themes, and edition notes..."
                    className="w-full rounded-lg border border-[#EBC6D8] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#2A0A14] focus:border-[#800020] focus:outline-none"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#2A0A14] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(values.featured)}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#EBC6D8] accent-[#800020]"
                />
                <span>Feature in Member Recommended Reads Carousel</span>
              </label>

              <div className="flex items-center justify-end gap-3 border-t border-[#F1D4E3] pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#EBC6D8] bg-white px-5 py-2.5 text-sm font-medium text-[#2A0A14] hover:bg-[#FDF2F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#800020] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors"
                >
                  {editingBook ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
