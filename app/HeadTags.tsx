'use client';

import { Helmet } from 'react-helmet-async';

export function HeadTags() {
  return (
    <Helmet>
      {/* Preconnect for fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap" as="style" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    </Helmet>
  );
}
