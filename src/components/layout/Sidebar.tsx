import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  Search,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: true },
  { icon: MessageSquare, label: 'Konversationen', href: '/conversations' },
  { icon: BarChart3, label: 'Analysen', href: '/analytics' },
  { icon: Zap, label: 'Tool-Nutzung', href: '/tools' },
  { icon: Search, label: 'Suche', href: '/search' },
  { icon: Globe, label: 'Sprachen', href: '/languages' },
  { icon: Users, label: 'Nutzer', href: '/users' },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: 'Einstellungen', href: '/settings' },
  { icon: HelpCircle, label: 'Hilfe', href: '/help' },
];

// Context to share collapsed state
const SidebarContext = createContext<{ collapsed: boolean; width: number }>({ collapsed: false, width: 260 });
export const useSidebarContext = () => useContext(SidebarContext);

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 80 : 260;

  return (
    <SidebarContext.Provider value={{ collapsed, width: sidebarWidth }}>
      <>
        {/* Mobile Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarWidth,
            x: 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ width: sidebarWidth }}
          className={cn(
            'fixed inset-y-0 left-0 h-screen gradient-sidebar border-r border-sidebar-border flex flex-col z-50',
            'hidden lg:flex', // Desktop: always visible
            mobileOpen && 'flex' // Mobile: overlay when open
          )}
        >
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="absolute top-4 right-4 lg:hidden min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <motion.div
              className="flex items-center gap-3"
              animate={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center glow-accent-sm">
                <span className="text-xl font-bold text-primary">U</span>
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  <span className="text-lg font-semibold text-foreground">Uppoint AI</span>
                  <span className="text-xs text-muted-foreground">Analytics</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavButton
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  onMobileClose={onMobileClose}
                />
              ))}
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="py-4 px-3 border-t border-sidebar-border">
            <div className="space-y-1">
              {bottomNavItems.map((item) => (
                <NavButton
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  onMobileClose={onMobileClose}
                />
              ))}
            </div>
          </div>

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-hover transition-colors hidden lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] gradient-sidebar border-r border-sidebar-border flex flex-col z-50 lg:hidden"
            >
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center glow-accent-sm">
                    <span className="text-xl font-bold text-primary">U</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground">Uppoint AI</span>
                    <span className="text-xs text-muted-foreground">Analytics</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavButton
                      key={item.label}
                      item={item}
                      collapsed={false}
                      onMobileClose={onMobileClose}
                    />
                  ))}
                </div>
              </nav>

              {/* Bottom Navigation */}
              <div className="py-4 px-3 border-t border-sidebar-border safe-area-bottom">
                <div className="space-y-1">
                  {bottomNavItems.map((item) => (
                    <NavButton
                      key={item.label}
                      item={item}
                      collapsed={false}
                      onMobileClose={onMobileClose}
                    />
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    </SidebarContext.Provider>
  );
};

interface NavButtonProps {
  item: NavItem;
  collapsed: boolean;
  onMobileClose: () => void;
}

const NavButton = ({ item, collapsed, onMobileClose }: NavButtonProps) => {
  const Icon = item.icon;

  return (
    <motion.a
      href={item.href}
      onClick={onMobileClose}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
        'hover:bg-sidebar-accent group min-h-[44px] touch-manipulation',
        item.active
          ? 'bg-sidebar-accent text-accent'
          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0 transition-colors',
          item.active ? 'text-accent' : 'text-sidebar-foreground group-hover:text-accent'
        )}
      />
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-medium"
        >
          {item.label}
        </motion.span>
      )}
      {item.active && !collapsed && (
        <motion.div
          layoutId="activeIndicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
        />
      )}
    </motion.a>
  );
};

export const MobileMenuButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="lg:hidden min-h-[44px] min-w-[44px]"
  >
    <Menu className="w-5 h-5" />
  </Button>
);
