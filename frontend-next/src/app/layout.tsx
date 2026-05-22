import type { Metadata } from 'next';
import { Providers } from './providers';
import { AppShell } from '@/components/AppShell';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './globals.css';

const sansFont = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Refa — Control vehicular',
  description: 'Taller y refaccionaria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="font-sans antialiased bg-[#0b0a0a] text-[#c1c7d3]">
        <PrimeReactProvider value={{ ripple: true }}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
