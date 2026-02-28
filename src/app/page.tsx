import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('toernooiprof-session');
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session?.orgNummer) {
        redirect('/dashboard');
      }
    } catch {
      // Ongeldige sessie, ga naar login
    }
  }
  redirect('/inloggen');
}
