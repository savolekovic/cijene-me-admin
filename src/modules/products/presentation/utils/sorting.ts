import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';

export type SortField = 'id' | 'product_name' | 'store_address' | 'store_brand_name' | 'price' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export const sortEntries = (
  entries: ProductEntry[],
  sortField: SortField,
  sortOrder: SortOrder
): ProductEntry[] => {
  return [...entries].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortField) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      // ... other cases
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}; 