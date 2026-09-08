import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'House Intelligence • Real Estate & Institutional Telemetry',
  description:
    'Next-generation real estate intelligence with freehand scribble mapping, subsurface soil mechanics, 20-year safety benchmarks, ranked amenities, CAD blueprints, and an institutional ROI Pass/Flow engine.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth w-full">
      <body className="min-h-screen w-full bg-slate-50 text-slate-900 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
