'use client';

import type React from 'react';

import { useState } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DialogOrderManual } from './dialog-order';
import { trpc } from '@/utils/trpc';
import { Category } from '@/types/category';

interface HeaderOrderManualProps {
  onChange: (term: string) => void;
}

export function HeaderOrderManual({ onChange }: HeaderOrderManualProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter options - replace with your actual filter categories
  const filterOptions = {
    status: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    date: ['Today', 'This Week', 'This Month', 'Last Month'],
    price: ['Under $50', '$50 - $100', '$100 - $200', 'Over $200'],
  };
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const { data } = trpc.main.getCategories.useQuery({
    fields: ['id', 'name', 'kode'],
  });

  // Handle search submission
  const handleSearchSubmit = () => {
    onChange(searchTerm);
  };
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9 pr-10"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.status.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={activeFilters.includes(status)}
                  onCheckedChange={() => toggleFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Date</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.date.map((date) => (
                <DropdownMenuCheckboxItem
                  key={date}
                  checked={activeFilters.includes(date)}
                  onCheckedChange={() => toggleFilter(date)}
                >
                  {date}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Price</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Price</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.price.map((price) => (
                <DropdownMenuCheckboxItem
                  key={price}
                  checked={activeFilters.includes(price)}
                  onCheckedChange={() => toggleFilter(price)}
                >
                  {price}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex gap-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => toggleFilter(filter)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {filter} filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <DialogOrderManual data={data?.data as Category[]}>
        <Button>
          <Plus />
          <span>Create</span>
        </Button>
      </DialogOrderManual>
    </section>
  );
}
