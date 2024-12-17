import { useState, useMemo } from 'react';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { SortField, SortOrder, sortEntries } from '../utils/sorting';

export const useSorting = (entries: ProductEntry[]) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedEntries = useMemo(
    () => sortEntries(entries, sortField, sortOrder),
    [entries, sortField, sortOrder]
  );

  return {
    sortField,
    sortOrder,
    handleSort,
    sortedEntries
  };
}; 