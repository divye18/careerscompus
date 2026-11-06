import type { Metadata, Viewport } from 'next';
import { MotionPreferences } from '@/components/MotionPreferences';
import { color } from '@/theme/tokens';
import { IS_PRODUCTION_SITE, SITE_URL } from '@/lib/site';
import { Inter, Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
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

// Monospace for instrument labels and data (approved; variable font, Latin subset)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['500', '600', '700', '800'],
});

const description = 'Explore careers, understand course pathways and discover universities in India, with every institution fact checked against its official website.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CareersCompus | Find Your Direction', template: '%s | CareersCompus' },
  description,
  applicationName: 'CareersCompus',
  // Previews carry no canonical: it would point a noindex page at production.
  alternates: IS_PRODUCTION_SITE ? { canonical: '/' } : undefined,
  robots: IS_PRODUCTION_SITE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: 'website', siteName: 'CareersCompus', title: 'CareersCompus | Find Your Direction', description, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary', title: 'CareersCompus | Find Your Direction', description },
};

export const viewport: Viewport = { themeColor: color.ink950 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <MotionPreferences>{children}</MotionPreferences>
      </body>
    </html>
  );
}
