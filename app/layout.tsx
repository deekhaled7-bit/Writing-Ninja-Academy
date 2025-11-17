import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navigation/navbar';
import Footer from '@/components/navigation/footer';
import { SessionProvider } from '@/components/providers/session-provider';
import BeltAchievementNotifier from '@/components/providers/belt-achievement-notifier';

export const metadata: Metadata = {
  title: 'The Writing Ninja - Where Young Authors Share Their Stories',
  description: 'A kid-friendly platform for young writers to share their stories and discover amazing tales from fellow ninjas.',
  keywords: ['kids stories', 'young writers', 'children books', 'writing platform'],
  authors: [{ name: 'The Writing Ninja Team' }],
  openGraph: {
    title: 'The Writing Ninja',
    description: 'Where Young Authors Share Their Stories',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <BeltAchievementNotifier />
        </SessionProvider>
      </body>
    </html>
  );
}