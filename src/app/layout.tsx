import type { Metadata } from 'next';
import './globals.css';
import { PlanProvider } from '@/lib/context/PlanContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'Occasio — GenAI Event Planning Assistant',
  description:
    'A GenAI-powered planning assistant organizing weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-event="wedding" className="paper-grain">
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <PlanProvider>
          <Header />
          <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
            <Sidebar />
            <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden" tabIndex={-1}>
              {children}
            </main>
          </div>
          <MobileNav />
        </PlanProvider>
      </body>
    </html>
  );
}
