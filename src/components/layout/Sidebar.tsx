import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen gradient-sidebar border-r border-sidebar-border flex flex-col"
    >
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
            />
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-hover transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
};

const NavButton = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
  const Icon = item.icon;
  
  return (
    <motion.a
      href={item.href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
        'hover:bg-sidebar-accent group',
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
