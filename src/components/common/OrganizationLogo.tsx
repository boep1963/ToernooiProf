'use client';

import React, { useState, useEffect } from 'react';

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
  fallbackSrc = '/clubmatch-logo_1.svg',
}: OrganizationLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

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
      className={className}
      onError={handleError}
    />
  );
}
