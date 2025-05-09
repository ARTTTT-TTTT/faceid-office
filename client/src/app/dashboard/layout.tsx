import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
