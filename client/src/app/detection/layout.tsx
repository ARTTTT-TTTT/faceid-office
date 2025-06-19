import { Metadata } from 'next';

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
