import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type DateRange = 'Letzte 24 Stunden' | 'Letzte 7 Tage' | 'Letzte 30 Tage' | 'Letzte 90 Tage' | 'Dieses Jahr';

interface DateRangeContextType {
  selectedRange: DateRange;
  setSelectedRange: (range: DateRange) => void;
  startDate: string | undefined;
  endDate: string | undefined;
  refresh: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within DateRangeProvider');
  }
  return context;
};

// Convert date range text to actual dates
const getDateRange = (range: DateRange): { startDate: string; endDate: string } => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today
  const startDate = new Date();

  switch (range) {
    case 'Letzte 24 Stunden':
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'Letzte 7 Tage':
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'Letzte 30 Tage':
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'Letzte 90 Tage':
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'Dieses Jahr':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 7);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

interface DateRangeProviderProps {
  children: ReactNode;
}

export const DateRangeProvider = ({ children }: DateRangeProviderProps) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('Letzte 7 Tage');
  const queryClient = useQueryClient();

  const { startDate, endDate } = getDateRange(selectedRange);

  const refresh = useCallback(() => {
    // Invalidate all queries to force refetch
    queryClient.invalidateQueries();
  }, [queryClient]);

  return (
    <DateRangeContext.Provider value={{ selectedRange, setSelectedRange, startDate, endDate, refresh }}>
      {children}
    </DateRangeContext.Provider>
  );
};

