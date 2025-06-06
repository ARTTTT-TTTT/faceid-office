import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Person',
  description: '',
};

export default function PersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
