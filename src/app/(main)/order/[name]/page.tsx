import { JSX } from 'react';

import { OrderMainPage } from '@/features/pages/order/main';

export default async function Page(): Promise<JSX.Element> {
  return (
    <>
      <OrderMainPage />
    </>
  );
}
