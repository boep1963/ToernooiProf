'use client';

import React from 'react';
import OrganizationLogo from '@/components/common/OrganizationLogo';

/** Logo voor in print-headers: organisatielogo of fallback ToernooiProf-logo, voor de titel. */
export default function PrintLogo({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <div className="mb-2">
      <OrganizationLogo
        src={logoUrl}
        alt="Logo"
        className="max-h-12 w-auto object-contain print:max-h-14"
      />
    </div>
  );
}
