import { auth } from '../../../auth';
import { findUserById } from '../(auth)/_components/api';
import { Navbar } from '@/components/layouts/navbar';
import { User } from '@/types/schema/user';
import { BannerSlider } from './banner';
import { PopularSection } from './populer';

import Categories from './categories';

export default async function Home() {
  const session = await auth();
  let user: User | null = null;

  if (session?.user?.id) {
    user = await findUserById(session.user.id as string);
  }

  const backgroundUrl =
    'https://res.cloudinary.com/dstvymie8/image/upload/v1741104865/download_1_bzlrrj.webp';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user as User} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* banner */}
        <div
          className="relative w-full py-8 rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-full">
            <div className="relative h-full flex items-center z-10">
              <BannerSlider />
            </div>
          </div>
        </div>

        {/* popular */}
        <section className="py-8">
          <PopularSection />
        </section>
        <Categories />
      </main>
    </div>
  );
}
