import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';

interface UseDebounceSearchProps {
  delay?: number;
  initialValue?: string;
}

interface UseDebounceSearchResult {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const useDebounceSearch = ({
  delay = 300,
  initialValue = ''
}: UseDebounceSearchProps = {}): UseDebounceSearchResult => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialValue);

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, delay),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchQuery, debouncedSetSearch]);

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery
  };
}; 