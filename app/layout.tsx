import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const sans = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'MemoryOS — Know the one thing to do right now',
    template: '%s · MemoryOS',
  },
  description:
    'MemoryOS watches the work on your Mac, names what to do today, and gives Claude, ChatGPT, and Cursor the context for your current goal. Stored on your device.',
  icons: {
    icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-[family-name:var(--font-sans)]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
