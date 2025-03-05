import { auth } from '../../auth';
import { Navbar } from '@/layouts/navbar';

export default async function Home() {
  // Get the current user session
  const session = await auth();
  console.log(session);

  // Detailed logging to understand the session structure
  console.log('Full Session Object:', JSON.stringify(session, null, 2));
  console.log('Session User Object:', JSON.stringify(session?.user, null, 2));

  // Check if user is authenticated
  if (session?.user) {
    return (
      <>
        <Navbar />
        <div className="mt-40">
          <h1>User Details</h1>
          <p>User ID: {session.user.id}</p>
          <p>
            Username:{' '}
            {session.user.username || session.user.name || 'No username'}
          </p>
          <p>Role: {session.user.role}</p>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Navbar />
        <div>
          <h1>Please Log In</h1>
        </div>
      </>
    );
  }
}
