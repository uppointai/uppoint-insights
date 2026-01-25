import { ReactNode, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshContainer } from '@/components/ui/PullToRefresh';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { refresh } = useDateRange();
  const isMobile = useIsMobile();

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    refresh();
    // Simulate minimum refresh time for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, [refresh]);

  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <div className="min-h-screen bg-background w-full relative">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={handleMobileMenuClose} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] transition-all duration-300">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />
        {isMobile ? (
          <PullToRefreshContainer
            ref={containerRef}
            pullDistance={pullDistance}
            isRefreshing={isRefreshing}
            className="flex-1 p-3 md:p-4 lg:p-6 overflow-auto pb-20 md:pb-6"
          >
            {children}
          </PullToRefreshContainer>
        ) : (
          <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-auto pb-20 md:pb-6">
            {children}
          </main>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};
