import { auth } from '../../../auth';
import { findUserById } from '../(auth)/_components/api';
import { Navbar } from '@/components/layouts/navbar';
import { User } from '@/types/schema/user';
export default async function Home() {
  const session = await auth();
  let user: User | null = null;

  if (session?.user?.id) {
    user = await findUserById(session.user.id as string);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user as User} />

      <main className="flex-1">
        {/* Hero Section */}

        {/* You can add more sections as needed */}
      </main>
    </div>
  );
}
