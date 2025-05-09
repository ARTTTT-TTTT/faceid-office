import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Detection',
  description: '',
};

export default function DetectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
