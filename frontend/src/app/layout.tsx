import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'ArFlow — AR & Credit Management', template: '%s | ArFlow' },
  description: 'Enterprise B2B accounts receivable, credit management, and cash collection platform',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '13px', maxWidth: '380px' },
              success: { iconTheme: { primary: '#2eab6f', secondary: '#fff' } },
              error: { iconTheme: { primary: '#d94040', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
