/**
 * PostgREST Client
 *
 * A lightweight client that mimics the Supabase query interface for PostgREST.
 * This allows switching from Supabase to a self-hosted PostgREST with minimal code changes.
 */

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in';

interface Filter {
  column: string;
  operator: FilterOperator;
  value: string | number | boolean | null;
}

interface QueryOptions {
  count?: 'exact' | 'planned' | 'estimated';
}

interface QueryResult<T> {
  data: T[] | null;
  error: { message: string } | null;
  count?: number;
}

class PostgRESTQueryBuilder<T = any> {
  private baseUrl: string;
  private table: string;
  private selectColumns: string = '*';
  private filters: Filter[] = [];
  private orFilters: string[] = [];
  private orderBy: { column: string; ascending: boolean }[] = [];
  private limitValue?: number;
  private rangeStart?: number;
  private rangeEnd?: number;
  private countOption?: 'exact' | 'planned' | 'estimated';

  constructor(baseUrl: string, table: string) {
    this.baseUrl = baseUrl;
    this.table = table;
  }

  select(columns: string = '*', options?: QueryOptions): this {
    this.selectColumns = columns;
    if (options?.count) {
      this.countOption = options.count;
    }
    return this;
  }

  eq(column: string, value: string | number | boolean): this {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: string | number | boolean): this {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: string | number): this {
    this.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: string | number): this {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: string | number): this {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: string | number): this {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): this {
    this.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): this {
    this.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  is(column: string, value: null | boolean): this {
    this.filters.push({ column, operator: 'is', value });
    return this;
  }

  in(column: string, values: (string | number)[]): this {
    this.filters.push({ column, operator: 'in', value: `(${values.join(',')})` });
    return this;
  }

  or(filterString: string): this {
    // PostgREST OR filter format: or=(filter1,filter2)
    // Input format from Supabase: "column1.op.value,column2.op.value"
    this.orFilters.push(filterString);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderBy.push({
      column,
      ascending: options?.ascending ?? true,
    });
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  range(start: number, end: number): this {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  private buildUrl(): string {
    const params = new URLSearchParams();

    // Select columns
    params.set('select', this.selectColumns);

    // Add filters
    for (const filter of this.filters) {
      const value = filter.value === null ? 'null' : String(filter.value);
      params.append(filter.column, `${filter.operator}.${value}`);
    }

    // Add OR filters
    for (const orFilter of this.orFilters) {
      params.append('or', `(${orFilter})`);
    }

    // Add ordering
    if (this.orderBy.length > 0) {
      const orderString = this.orderBy
        .map((o) => `${o.column}.${o.ascending ? 'asc' : 'desc'}`)
        .join(',');
      params.set('order', orderString);
    }

    // Add limit (if no range specified)
    if (this.limitValue !== undefined && this.rangeStart === undefined) {
      params.set('limit', String(this.limitValue));
    }

    return `${this.baseUrl}/${this.table}?${params.toString()}`;
  }

  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add range header for pagination
    if (this.rangeStart !== undefined && this.rangeEnd !== undefined) {
      headers['Range'] = `${this.rangeStart}-${this.rangeEnd}`;
      headers['Range-Unit'] = 'items';
    }

    // Add count preference header
    if (this.countOption) {
      headers['Prefer'] = `count=${this.countOption}`;
    }

    return headers;
  }

  async then<TResult = QueryResult<T>>(
    resolve: (value: QueryResult<T>) => TResult
  ): Promise<TResult> {
    const result = await this.execute();
    return resolve(result);
  }

  private async execute(): Promise<QueryResult<T>> {
    try {
      const url = this.buildUrl();
      const headers = this.buildHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.details || errorText;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        return {
          data: null,
          error: { message: errorMessage },
        };
      }

      const data = await response.json();

      // Extract count from Content-Range header if requested
      let count: number | undefined;
      if (this.countOption) {
        const contentRange = response.headers.get('Content-Range');
        if (contentRange) {
          // Format: "0-9/100" or "*/100"
          const match = contentRange.match(/\/(\d+|\*)/);
          if (match && match[1] !== '*') {
            count = parseInt(match[1], 10);
          }
        }
      }

      return {
        data: data as T[],
        error: null,
        count,
      };
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Unknown error' },
      };
    }
  }
}

class PostgRESTClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  from<T = any>(table: string): PostgRESTQueryBuilder<T> {
    return new PostgRESTQueryBuilder<T>(this.baseUrl, table);
  }
}

export function createPostgRESTClient(url: string): PostgRESTClient {
  return new PostgRESTClient(url);
}

export type { PostgRESTClient, PostgRESTQueryBuilder, QueryResult };
