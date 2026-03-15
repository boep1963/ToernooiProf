import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decodeSessionCookie, SESSION_COOKIE_NAME } from '@/lib/session';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (sessionCookie?.value) {
    const session = decodeSessionCookie(sessionCookie.value);
    if (session?.orgNummer) {
      redirect('/dashboard');
    }
  }
  redirect('/inloggen');
}
