'use client';
import { useEffect, useState } from 'react';
import { HeaderOrderManual } from './header-order-manual';

export function PesananManual() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchInput]);

  return (
    <main className="min-h-screen p-8 space-y-6">
      {/* header */}
      <HeaderOrderManual onChange={setSearchInput} />
    </main>
  );
}
