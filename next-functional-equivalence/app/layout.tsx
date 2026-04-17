import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Functional Equivalence Address Flow',
  description: 'Step-based address eligibility checker with stateful context.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
