import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Book } from '../types/library';

interface DeleteConfirmModalProps {
  book: Book | null;
  onCancel: () => void;
  onConfirm: (bookId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  book,
  onCancel,
  onConfirm,
}) => {
  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A0A14]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-book-heading"
    >
      <div className="w-full max-w-md rounded-xl border border-[#F1D4E3] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF2F8] text-[#800020]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="delete-book-heading"
                className="font-editorial text-xl font-semibold text-[#2A0A14]"
              >
                Remove Title from Collection
              </h3>
              <p className="text-xs text-[#6E4A56]">This action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E4A56] hover:bg-[#FDF2F8] hover:text-[#2A0A14] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#4A2633]">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-[#2A0A14]">“{book.title}”</span> by{' '}
          {book.author} from the Acelivre catalog? Active historical references in the
          circulation log will remain archived.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#EBC6D8] bg-white px-4 py-2 text-sm font-medium text-[#2A0A14] hover:bg-[#FDF2F8] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(book.id)}
            className="rounded-lg bg-[#800020] px-4 py-2 text-sm font-medium text-white hover:bg-[#5C0017] transition-colors"
          >
            Remove Book
          </button>
        </div>
      </div>
    </div>
  );
};
