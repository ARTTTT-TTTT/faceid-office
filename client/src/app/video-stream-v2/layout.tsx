import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Video Stream V2',
  description: '',
};

export default function VideoStreamV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
