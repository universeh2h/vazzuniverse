'use client';
import { trpc } from '@/utils/trpc';
import { HelpCircle } from 'lucide-react';
import { SidebarOrder } from './sidebar';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { OrderPage } from './order';
import { Product } from '@/types/digiflazz/ml';
import Image from 'next/image';
import { PlaceholderContent } from './placeholder/content';
import { Category, SubCategories } from '@/types/category';
import { usePlansStore } from '@/hooks/use-select-plan';
import { PaymentsSection } from '../payment/payment';

export default function DetailsCategories({ name }: { name: string }) {
  const { data, isLoading } = trpc.main.getCategoriesByName.useQuery({
    name: name,
  });
  const { data: plans } = trpc.digiflazz.getProductsByGame.useQuery({
    game: decodeURIComponent(name),
  });
  const category = data?.categories;
  const { selectPlans } = usePlansStore();

  if (isLoading) {
    return <LoadingOverlay />;
  }
  if (category === undefined || category === null) {
    return (
      <div className="min-h-screen w-full justify-center items-center text-white">
        <p>category belum tersedia</p>
      </div>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero Section */}
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src={category.bannerLayanan}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3  gap-6">
          <SidebarOrder category={category} />

          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Input */}
            <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Account Details
                </h2>
                <HelpCircle size={20} className="text-blue-400" />
              </div>

              <PlaceholderContent category={category as Category} />
            </div>
            <div>
              <OrderPage
                plans={plans as Product[]}
                subCategories={data?.subCategories as SubCategories[]}
              />

              {selectPlans && (
                <PaymentsSection
                  amount={selectPlans.price}
                  productDetails={selectPlans}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
