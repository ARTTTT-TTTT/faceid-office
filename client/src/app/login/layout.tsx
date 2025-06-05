import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Login',
  description: '',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
