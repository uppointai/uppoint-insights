// Mock data for Uppoint AI Analytics Dashboard

export interface ChatAnalytics {
  id: number;
  session_id: string;
  timestamp: string;
  user_message: string;
  user_message_length: number;
  bot_response: string;
  bot_response_length: number;
  tool_used: string | null;
  tool_count: number;
  search_term: string | null;
  products_found: number;
  product_names: string[] | null;
  tool_error: boolean;
  is_callback: boolean;
  is_fallback: boolean;
  detected_language: string;
  hour_of_day: number;
  day_of_week: number;
  created_at: string;
}

export interface MetricData {
  value: number;
  previousValue: number;
  trend: 'up' | 'down' | 'neutral';
  percentChange: number;
}

export interface ConversationVolumeData {
  date: string;
  conversations: number;
  hour?: number;
}

export interface HourlyData {
  hour: number;
  day: number;
  value: number;
}

export interface ToolUsageData {
  name: string;
  count: number;
  successRate: number;
}

export interface LanguageData {
  language: string;
  count: number;
  percentage: number;
}

// Generate realistic sample data
const generateSessionId = () => `session_${Math.random().toString(36).substr(2, 9)}`;

const tools = ['product_search', 'order_lookup', 'price_check', 'inventory_check', 'customer_support', 'faq_lookup'];
const languages = ['de', 'en', 'fr', 'es', 'it'];
const searchTerms = ['iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'iPad Air', 'AirPods', 'Apple Watch', 'PlayStation 5', 'Nintendo Switch'];

const germanMessages = [
  'Ich suche nach einem neuen Smartphone',
  'Was kostet das iPhone 15?',
  'Haben Sie das Produkt auf Lager?',
  'Können Sie mir bei meiner Bestellung helfen?',
  'Wann wird meine Lieferung ankommen?',
  'Gibt es einen Rabatt auf dieses Produkt?',
  'Ich möchte meine Bestellung stornieren',
  'Welche Farben sind verfügbar?',
];

const germanResponses = [
  'Natürlich, ich kann Ihnen helfen. Hier sind unsere aktuellen Smartphone-Angebote...',
  'Das iPhone 15 ist ab 999€ erhältlich. Möchten Sie mehr Details?',
  'Ja, dieses Produkt ist derzeit auf Lager und sofort lieferbar.',
  'Ich habe Ihre Bestellung gefunden. Wie kann ich Ihnen helfen?',
  'Ihre Lieferung wird voraussichtlich in 2-3 Werktagen eintreffen.',
  'Aktuell haben wir einen Rabatt von 10% auf ausgewählte Produkte.',
  'Ich habe die Stornierung für Sie eingeleitet. Sie erhalten eine Bestätigung per E-Mail.',
  'Dieses Produkt ist in Schwarz, Weiß und Blau erhältlich.',
];

export const generateMockConversations = (count: number = 100): ChatAnalytics[] => {
  const conversations: ChatAnalytics[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const hourOfDay = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const messageIndex = Math.floor(Math.random() * germanMessages.length);
    const toolUsed = Math.random() > 0.3 ? tools[Math.floor(Math.random() * tools.length)] : null;
    
    conversations.push({
      id: i + 1,
      session_id: generateSessionId(),
      timestamp: timestamp.toISOString(),
      user_message: germanMessages[messageIndex],
      user_message_length: germanMessages[messageIndex].length,
      bot_response: germanResponses[messageIndex],
      bot_response_length: germanResponses[messageIndex].length,
      tool_used: toolUsed,
      tool_count: toolUsed ? Math.floor(Math.random() * 3) + 1 : 0,
      search_term: Math.random() > 0.5 ? searchTerms[Math.floor(Math.random() * searchTerms.length)] : null,
      products_found: Math.floor(Math.random() * 10),
      product_names: Math.random() > 0.5 ? [searchTerms[Math.floor(Math.random() * searchTerms.length)]] : null,
      tool_error: Math.random() < 0.03,
      is_callback: Math.random() < 0.15,
      is_fallback: Math.random() < 0.08,
      detected_language: Math.random() > 0.2 ? 'de' : languages[Math.floor(Math.random() * languages.length)],
      hour_of_day: hourOfDay,
      day_of_week: dayOfWeek,
      created_at: timestamp.toISOString(),
    });
  }
  
  return conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const mockConversations = generateMockConversations(500);

// Calculate metrics from conversations
export const calculateMetrics = (conversations: ChatAnalytics[]) => {
  const total = conversations.length;
  const previousTotal = Math.floor(total * 0.85);
  
  const toolUsages = conversations.filter(c => c.tool_used).length;
  const toolErrors = conversations.filter(c => c.tool_error).length;
  const fallbacks = conversations.filter(c => c.is_fallback).length;
  
  const avgResponseTime = 2.4 + Math.random() * 1.5;
  const previousAvgResponseTime = 2.8 + Math.random() * 1.5;
  
  return {
    totalConversations: {
      value: total,
      previousValue: previousTotal,
      trend: total > previousTotal ? 'up' : 'down',
      percentChange: Math.round(((total - previousTotal) / previousTotal) * 100),
    } as MetricData,
    avgResponseTime: {
      value: parseFloat(avgResponseTime.toFixed(1)),
      previousValue: parseFloat(previousAvgResponseTime.toFixed(1)),
      trend: avgResponseTime < previousAvgResponseTime ? 'up' : 'down',
      percentChange: Math.round(((previousAvgResponseTime - avgResponseTime) / previousAvgResponseTime) * 100),
    } as MetricData,
    toolUsageRate: {
      value: Math.round((toolUsages / total) * 100),
      previousValue: Math.round((toolUsages / total) * 100 * 0.9),
      trend: 'up',
      percentChange: 8,
    } as MetricData,
    fallbackRate: {
      value: parseFloat(((fallbacks / total) * 100).toFixed(1)),
      previousValue: parseFloat(((fallbacks / total) * 100 * 1.2).toFixed(1)),
      trend: 'up',
      percentChange: -15,
    } as MetricData,
  };
};

export const generateConversationVolume = (days: number = 30): ConversationVolumeData[] => {
  const data: ConversationVolumeData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseConversations = isWeekend ? 80 : 150;
    const variation = Math.floor(Math.random() * 60) - 30;
    
    data.push({
      date: date.toISOString().split('T')[0],
      conversations: Math.max(20, baseConversations + variation),
    });
  }
  
  return data;
};

export const generateHourlyHeatmap = (): HourlyData[] => {
  const data: HourlyData[] = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isBusinessHours = hour >= 9 && hour <= 18;
      const isWeekend = day === 0 || day === 6;
      const baseValue = isBusinessHours && !isWeekend ? 80 : 20;
      const peakBonus = (hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 16) ? 40 : 0;
      
      data.push({
        hour,
        day,
        value: Math.max(0, baseValue + peakBonus + Math.floor(Math.random() * 30) - 15),
      });
    }
  }
  
  return data;
};

export const getToolUsageData = (conversations: ChatAnalytics[]): ToolUsageData[] => {
  const toolCounts: Record<string, { count: number; errors: number }> = {};
  
  conversations.forEach(c => {
    if (c.tool_used) {
      if (!toolCounts[c.tool_used]) {
        toolCounts[c.tool_used] = { count: 0, errors: 0 };
      }
      toolCounts[c.tool_used].count++;
      if (c.tool_error) {
        toolCounts[c.tool_used].errors++;
      }
    }
  });
  
  return Object.entries(toolCounts)
    .map(([name, data]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: data.count,
      successRate: Math.round(((data.count - data.errors) / data.count) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

export const getLanguageDistribution = (conversations: ChatAnalytics[]): LanguageData[] => {
  const langCounts: Record<string, number> = {};
  
  conversations.forEach(c => {
    langCounts[c.detected_language] = (langCounts[c.detected_language] || 0) + 1;
  });
  
  const total = conversations.length;
  const languageNames: Record<string, string> = {
    de: 'Deutsch',
    en: 'Englisch',
    fr: 'Französisch',
    es: 'Spanisch',
    it: 'Italienisch',
  };
  
  return Object.entries(langCounts)
    .map(([lang, count]) => ({
      language: languageNames[lang] || lang,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

export const getResponseQuality = (conversations: ChatAnalytics[]) => {
  const total = conversations.length;
  const successful = conversations.filter(c => !c.is_fallback && !c.tool_error).length;
  const fallback = conversations.filter(c => c.is_fallback).length;
  const errors = conversations.filter(c => c.tool_error).length;
  
  return [
    { name: 'Erfolgreich', value: successful, color: 'hsl(80, 100%, 62%)' },
    { name: 'Fallback', value: fallback, color: 'hsl(45, 100%, 60%)' },
    { name: 'Fehler', value: errors, color: 'hsl(0, 72%, 55%)' },
  ];
};

export const mockMetrics = calculateMetrics(mockConversations);
export const mockConversationVolume = generateConversationVolume(30);
export const mockHourlyHeatmap = generateHourlyHeatmap();
export const mockToolUsage = getToolUsageData(mockConversations);
export const mockLanguages = getLanguageDistribution(mockConversations);
export const mockResponseQuality = getResponseQuality(mockConversations);
