import { Metadata } from 'next';

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
