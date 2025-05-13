import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Setting',
  description: '',
};

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
