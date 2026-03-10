'use client';

import React, { useState, useEffect, useRef } from 'react';

/** Alleen data-URLs of absolute URLs zijn bruikbaar als img src; een losse bestandsnaam (bijv. Logo_1106.jpg) zou relatief worden opgelost en 404 geven (bijv. /toernooien/3/Logo_1106.jpg). */
function isUsableLogoSrc(src: string | null | undefined): boolean {
  if (!src || !src.trim()) return false;
  return src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://');
}

interface OrganizationLogoProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function OrganizationLogo({
  src,
  alt,
  className = '',
  fallbackSrc = '/toernooiprof/ToernooiProf.png',
}: OrganizationLogoProps) {
  const usableSrc = isUsableLogoSrc(src) ? src : null;
  const [imgSrc, setImgSrc] = useState<string>(usableSrc || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const cacheBusterRef = useRef(0);

  useEffect(() => {
    if (usableSrc) {
      cacheBusterRef.current += 1;
      const isDataUrl = usableSrc.startsWith('data:');
      const url = isDataUrl ? usableSrc : `${usableSrc}${usableSrc.includes('?') ? '&' : '?'}_t=${cacheBusterRef.current}`;
      setImgSrc(url);
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [usableSrc, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`rounded-lg ${className}`.trim()}
      onError={handleError}
    />
  );
}
