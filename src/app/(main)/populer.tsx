'use client';
import { trpc } from '@/utils/trpc';
import Image from 'next/image';
import Link from 'next/link';

export function PopularSection() {
  const { data } = trpc.main.getCategoriesPopular.useQuery();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((category) => (
          <Link
            href={`/categories/${category.name}`}
            key={category.id}
            className="group bg-blue-600/10 overflow-hidden rounded-lg border border-transparent hover:border-blue-500 transition-all duration-200"
          >
            <div className="flex space-x-2 p-2 items-center shadow-md shadow-blue-200">
              <div className="relative  overflow-hidden rounded-md">
                <Image
                  src={category.thumbnail}
                  width={100}
                  height={100}
                  alt={`${category.name} thumbnail`}
                  className="object-cover size-16 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-white">
                <h3 className="text-md truncate ">{category.name}</h3>
                <p className="text-xs">{category.subName}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
