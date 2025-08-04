import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface DebouncedSearchProps {
  term: string;
  setTerm: (term: string) => void;
  delay?: number; 
  placeholder?: string;
  className? : string
  onSearch?: (searchTerm: string) => void; 
}

export function DebouncedSearch({ 
  term, 
  setTerm, 
  className,
  delay = 500, 
  placeholder = "Search...",
  onSearch 
}: DebouncedSearchProps) {
  const [localTerm, setLocalTerm] = useState(term);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(localTerm);
      if (onSearch) {
        onSearch(localTerm);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localTerm, delay, setTerm, onSearch]);

  useEffect(() => {
    setLocalTerm(term);
  }, [term]);

  return (
      <Input
        type="text"
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        placeholder={placeholder}
        className={cn('',className)}
      />
  );
}
