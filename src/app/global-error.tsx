'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '480px',
          margin: '4rem auto',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#9888;</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Er is iets misgegaan</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}
