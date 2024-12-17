import { useState } from 'react';
import { ProductEntry } from '../../domain/interfaces/IProductEntriesRepository';
import { ProductEntriesRepository } from '../../infrastructure/ProductEntriesRepository';

const productEntriesRepository = new ProductEntriesRepository();

export const useProductEntries = () => {
  const [productEntries, setProductEntries] = useState<ProductEntry[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteEntry = async (entryId: number) => {
    setIsDeleting(true);
    try {
      await productEntriesRepository.deleteProductEntry(entryId);
      setProductEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    productEntries,
    setProductEntries,
    isDeleting,
    error,
    setError,
    handleDeleteEntry
  };
}; 