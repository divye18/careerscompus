import type { Metadata } from 'next';
import { Inter, Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Display serif for the Meridian Atlas headlines (single weight; italic used for emphasis)
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'CareersCompus | Find Your Direction',
  description: 'Premium guidance for students to discover top careers, university programs, and courses in India.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${instrumentSerif.variable}`}>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
