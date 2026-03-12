import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';
import { validateApiToken } from '@/lib/validateApiToken';

/**
 * POST /api/public/contact
 *
 * Beveiligd met HMAC-token vanuit de landing page.
 * Slaat een contactbericht op in de email_queue
 * zodat een Cloud Function het kan verzenden.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('X-Api-Token');
    if (!validateApiToken(token)) {
      return NextResponse.json(
        { error: 'Ongeautoriseerd verzoek.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const naam = String(body.naam ?? '').trim();
    const email = String(body.email ?? '').trim();
    const onderwerp = String(body.onderwerp ?? '').trim();
    const bericht = String(body.bericht ?? '').trim();

    if (!naam || !email || !onderwerp || !bericht) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht.' },
        { status: 400 }
      );
    }

    // Basis e-mail validatie
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres.' },
        { status: 400 }
      );
    }

    // Beperk lengte
    if (bericht.length > 5000) {
      return NextResponse.json(
        { error: 'Bericht is te lang (max 5000 tekens).' },
        { status: 400 }
      );
    }

    const emailDoc = {
      to: 'info@email.biljart.app',
      bcc: 'hanseekels@gmail.com, p@de-boer.net',
      subject: `Contactformulier: ${onderwerp}`,
      body: `Nieuw bericht via het contactformulier op biljart.app\n\nVan: ${naam}\nE-mail: ${email}\nOnderwerp: ${onderwerp}\n\n${bericht}`,
      status: 'pending',
      type: 'contact',
      created_at: new Date().toISOString(),
    };

    await db.collection('email_queue').add(emailDoc);

    return cachedJsonResponse({ success: true }, 'no-cache');
  } catch (error) {
    console.error('[PUBLIC-CONTACT] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij verzenden van bericht.' },
      { status: 500 }
    );
  }
}
