import { useQuery } from '@tanstack/react-query';
import {
  fetchConversations,
  fetchMetrics,
  fetchConversationVolume,
  fetchHourlyHeatmap,
  fetchToolUsage,
  fetchLanguageDistribution,
  fetchResponseQuality,
  fetchIntentDistribution,
  fetchPopularSearchTerms,
  fetchErrorTypes,
  fetchInfoCoverage,
  ConversationFilters,
} from '@/services/analyticsService';
import type {
  ParsedConversationRow,
  Metrics,
  ConversationVolumeData,
  HourlyData,
  ToolUsageData,
  LanguageData,
  ResponseQualityData,
  IntentData,
  SearchTermData,
  ErrorTypeData,
  InfoCoverageData,
} from '@/services/analyticsService';

// Hook for fetching conversations
export const useConversations = (filters: ConversationFilters = {}) => {
  return useQuery<ParsedConversationRow[]>({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      const result = await fetchConversations(filters);
      return result.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

// Hook for fetching conversations with pagination info
export const useConversationsWithPagination = (filters: ConversationFilters = {}) => {
  return useQuery<{ data: ParsedConversationRow[]; count: number }>({
    queryKey: ['conversations-paginated', filters],
    queryFn: () => fetchConversations(filters),
    staleTime: 30000,
  });
};

// Hook for fetching metrics
export const useMetrics = (startDate?: string, endDate?: string) => {
  return useQuery<Metrics>({
    queryKey: ['metrics', startDate, endDate],
    queryFn: () => fetchMetrics(startDate, endDate),
    staleTime: 60000, // 1 minute
  });
};

// Hook for fetching conversation volume
export const useConversationVolume = (days: number = 30, startDate?: string, endDate?: string) => {
  return useQuery<ConversationVolumeData[]>({
    queryKey: ['conversation-volume', days, startDate, endDate],
    queryFn: () => fetchConversationVolume(days, startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching hourly heatmap
export const useHourlyHeatmap = (startDate?: string, endDate?: string) => {
  return useQuery<HourlyData[]>({
    queryKey: ['hourly-heatmap', startDate, endDate],
    queryFn: () => fetchHourlyHeatmap(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching tool usage
export const useToolUsage = (startDate?: string, endDate?: string) => {
  return useQuery<ToolUsageData[]>({
    queryKey: ['tool-usage', startDate, endDate],
    queryFn: () => fetchToolUsage(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching language distribution
export const useLanguageDistribution = (startDate?: string, endDate?: string) => {
  return useQuery<LanguageData[]>({
    queryKey: ['language-distribution', startDate, endDate],
    queryFn: () => fetchLanguageDistribution(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching response quality
export const useResponseQuality = (startDate?: string, endDate?: string) => {
  return useQuery<ResponseQualityData[]>({
    queryKey: ['response-quality', startDate, endDate],
    queryFn: () => fetchResponseQuality(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching intent distribution
export const useIntentDistribution = (startDate?: string, endDate?: string) => {
  return useQuery<IntentData[]>({
    queryKey: ['intent-distribution', startDate, endDate],
    queryFn: () => fetchIntentDistribution(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching popular search terms
export const usePopularSearchTerms = (startDate?: string, endDate?: string, limit: number = 20) => {
  return useQuery<SearchTermData[]>({
    queryKey: ['popular-search-terms', startDate, endDate, limit],
    queryFn: () => fetchPopularSearchTerms(startDate, endDate, limit),
    staleTime: 60000,
  });
};

// Hook for fetching error types
export const useErrorTypes = (startDate?: string, endDate?: string) => {
  return useQuery<ErrorTypeData[]>({
    queryKey: ['error-types', startDate, endDate],
    queryFn: () => fetchErrorTypes(startDate, endDate),
    staleTime: 60000,
  });
};

// Hook for fetching info coverage
export const useInfoCoverage = (startDate?: string, endDate?: string) => {
  return useQuery<InfoCoverageData>({
    queryKey: ['info-coverage', startDate, endDate],
    queryFn: () => fetchInfoCoverage(startDate, endDate),
    staleTime: 60000,
  });
};

