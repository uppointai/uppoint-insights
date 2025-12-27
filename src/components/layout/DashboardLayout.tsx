import { ReactNode, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background w-full relative">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={handleMobileMenuClose} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] transition-all duration-300">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};
