import { User } from '@/types/schema/user';
import { auth } from '../../../auth';
import { findUserById } from '../(auth)/_components/api';
import { Navbar } from '@/components/layouts/navbar';
import { ReactNode } from 'react';

export default async function LayoutMainPage({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  let user: User | null = null;

  if (session?.user?.id) {
    user = await findUserById(session.user.id as string);
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user as User} />
      {children}
    </div>
  );
}
