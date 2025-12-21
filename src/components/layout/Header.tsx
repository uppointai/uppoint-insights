import { Bell, RefreshCw, Download, Calendar, ChevronDown, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Letzte 7 Tage');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const timeRanges = [
    'Letzte 24 Stunden',
    'Letzte 7 Tage',
    'Letzte 30 Tage',
    'Letzte 90 Tage',
    'Dieses Jahr',
  ];

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur-sm px-3 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={onMobileMenuToggle} />
        
        <h1 className="text-base md:text-xl font-semibold text-foreground truncate">
          Chatbot Analytics
        </h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md hidden sm:inline-block">
          Live
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* Date Range Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 md:gap-2 px-2 md:px-4 min-h-[44px] text-xs md:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedRange}</span>
              <span className="sm:hidden">7T</span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-50">
            {timeRanges.map((range) => (
              <DropdownMenuItem
                key={range}
                onClick={() => setSelectedRange(range)}
                className={selectedRange === range ? 'bg-accent/10 text-accent' : ''}
              >
                {range}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="min-h-[44px] min-w-[44px]"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        </Button>

        {/* Export Button - Hidden on small mobile */}
        <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] hidden sm:flex">
          <Download className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="relative min-h-[44px] min-w-[44px]">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </Button>

        {/* User Menu - Simplified on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 min-h-[44px]">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-medium hidden md:inline">Admin</span>
              <ChevronDown className="w-4 h-4 opacity-50 hidden md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-50">
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Einstellungen</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Abmelden</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
