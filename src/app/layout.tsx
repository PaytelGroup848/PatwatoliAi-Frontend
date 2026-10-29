import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';
import '@/components/landing/landing-navbar.css';
import '@/components/landing/landing-footer.css';

export const metadata = {
  title: 'Patwatoli AI',
  description: 'Landing page for Patwatoli AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var b = localStorage.getItem('patwatoli_brightness');
                if (b === 'dim') {
                  document.documentElement.style.filter = 'brightness(0.80)';
                } else if (b === 'soft') {
                  document.documentElement.style.filter = 'brightness(0.90)';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
