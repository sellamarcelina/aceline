import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src: string;
  title: string;
  author?: string;
  className?: string;
  aspectClassName?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  src,
  title,
  author,
  className = '',
  aspectClassName = 'aspect-[3/4]',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#FCE7F3] border border-[#F1D4E3] ${aspectClassName} ${className}`}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={`Cover of ${title}`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-between bg-gradient-to-br from-[#FDF2F8] via-[#FCE7F3] to-[#F5D0E2] p-4 text-center">
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#800020]/70">
            Acelivre
          </span>
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-7 w-7 text-[#800020]" strokeWidth={1.5} />
            <p className="font-editorial text-sm font-semibold leading-snug text-[#3D000F] line-clamp-3">
              {title}
            </p>
          </div>
          <span className="text-[11px] text-[#6E4A56] truncate max-w-full">
            {author || 'Curated Edition'}
          </span>
        </div>
      )}
    </div>
  );
};
