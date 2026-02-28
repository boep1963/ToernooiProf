'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  fallbackSrc = '/clubmatchlogo.png',
}: OrganizationLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const cacheBusterRef = useRef(0);

  useEffect(() => {
    if (src) {
      cacheBusterRef.current += 1;
      const isDataUrl = src.startsWith('data:');
      const url = isDataUrl ? src : `${src}${src.includes('?') ? '&' : '?'}_t=${cacheBusterRef.current}`;
      setImgSrc(url);
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
