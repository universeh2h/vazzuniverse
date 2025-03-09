'use client';
import { useParams } from 'next/navigation';
import DetailsCategories from './details-categories';

export function OrderMainPage() {
  const { name } = useParams();
  return (
    <>
      <DetailsCategories name={name as string} />
    </>
  );
}
