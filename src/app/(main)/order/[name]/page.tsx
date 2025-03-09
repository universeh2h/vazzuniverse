import { Navbar } from '@/components/layouts/navbar';
import { JSX } from 'react';
import { auth } from '../../../../../auth';
import { User } from '@/types/schema/user';
import { findUserById } from '@/app/(auth)/_components/api';
import { OrderMainPage } from '@/features/pages/order/main';

export default async function Page(): Promise<JSX.Element> {
  const session = await auth();
  let user = null;

  if (session?.user?.id) {
    user = await findUserById(session.user.id);
  }

  return (
    <>
      <Navbar user={user as User} />
      <OrderMainPage />
    </>
  );
}
