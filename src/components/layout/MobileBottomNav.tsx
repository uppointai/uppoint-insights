import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: MessageSquare, label: 'Chats', href: '/conversations' },
  { icon: ThumbsUp, label: 'Feedback', href: '/feedback' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  
  // Determine active route
  const activeNavItems = navItems.map(item => ({
    ...item,
    active: location.pathname === item.href,
  }));

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {activeNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] min-h-[44px] rounded-xl transition-all duration-200',
                'active:scale-95 touch-manipulation',
                item.active
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', item.active && 'text-accent')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                />
              )}
            </a>
          );
        })}
      </div>
    </motion.nav>
  );
};
