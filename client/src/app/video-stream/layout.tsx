import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Video Stream',
  description: '',
};

export default function VideoStreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
