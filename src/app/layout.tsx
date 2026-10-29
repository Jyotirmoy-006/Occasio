import type { Metadata } from 'next';
import './globals.css';
import { PlanProvider } from '@/lib/context/PlanContext';
import { TooltipProvider } from '@/components/ui/Tooltip';
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
    <html lang="en" data-event-theme="wedding" data-event="wedding" className="paper-grain">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <TooltipProvider delayDuration={300}>
          <PlanProvider>
            <div className="flex min-h-screen w-full">
              <Sidebar />
              <div className="flex-1 min-w-0 flex flex-col">
                <Header />
                <main
                  id="main-content"
                  className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto pb-24 md:pb-12"
                  tabIndex={-1}
                >
                  {children}
                </main>
              </div>
            </div>
            <MobileNav />
          </PlanProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
