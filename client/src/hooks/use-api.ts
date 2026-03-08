"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function useApi<T>(endpoint: string, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<T>>(endpoint);
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [fetch, immediate]);

  return { data, isLoading, error, refetch: fetch, setData };
}
