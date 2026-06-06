import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono, Spectral } from 'next/font/google';
import { OpsShell } from '@/components/ops/OpsShell';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-spectral',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GridPulse Ops Console',
  description: 'Autonomous multi-source EV energy orchestrator — Arthurite × AWS hackathon demo',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable} ${spectral.variable}`}>
      <body className={`${archivo.className} ops-console bg-ink text-text antialiased`}>
        <OpsShell>{children}</OpsShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
