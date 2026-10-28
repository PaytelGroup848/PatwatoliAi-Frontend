import { QueryProvider } from '@/providers/query-provider';
import './globals.css';
import '@/components/landing/landing-navbar.css';
import '@/components/landing/landing-footer.css';

export const metadata = {
  title: 'Patwatoli AI',
  description: 'Landing page for Patwatoli AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
