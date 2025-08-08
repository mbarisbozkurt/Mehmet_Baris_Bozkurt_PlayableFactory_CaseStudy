"use client";
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { API_BASE } from '@/lib/config';

type Props = Omit<ImageProps, 'src' | 'alt'> & { src?: string; alt: string };

export const SafeImage = ({ src, alt, ...props }: Props) => {
  const [error, setError] = useState(false);
  let computedSrc = src || '';
  if (computedSrc.startsWith('/static')) {
    computedSrc = `${API_BASE}${computedSrc}`;
  }
  const finalSrc = !error && computedSrc ? computedSrc : '/placeholder-product.svg';
  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      onError={() => setError(true)}
    />
  );
};


