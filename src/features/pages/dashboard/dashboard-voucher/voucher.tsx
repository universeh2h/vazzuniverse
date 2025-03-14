'use client';

import { useEffect, useState } from 'react';
import { HeaderVoucher } from './header-voucher';
import { trpc } from '@/utils/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Tag } from 'lucide-react';

export function VoucherPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const { data, isLoading } = trpc.voucher.getAll.useQuery({
    code: debouncedSearchTerm,
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <HeaderVoucher onChange={handleSearchChange} />

      <div className="m-8">
        <h2 className="text-2xl font-bold mb-4">Available Vouchers</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((voucher) => (
              <Card
                key={voucher.id}
                className="border hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{voucher.code}</CardTitle>
                    <Badge variant={voucher.isActive ? 'default' : 'outline'}>
                      {voucher.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{voucher.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md flex items-center justify-between mb-2">
                    <div className="font-mono font-bold text-lg">
                      {voucher.code}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(voucher.code)}
                      title="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {voucher.discountValue} % off • Expires:{' '}
                    {new Date(voucher.expiryDate).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline">{voucher.discountType}</Badge>
                  <Button variant="default" size="sm">
                    Use Voucher
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No vouchers found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : 'There are no available vouchers at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
