import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Video Stream V1',
  description: '',
};

export default function VideoStreamV1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
