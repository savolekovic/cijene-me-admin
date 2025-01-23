import { useState } from 'react';
import { Product } from '../../domain/interfaces/IProductsRepository';
import { StoreLocation } from '../../../stores/domain/interfaces/IStoreLocationRepository';
import { ProductsRepository } from '../../infrastructure/ProductsRepository';
import { StoreLocationRepository } from '../../../stores/infrastructure/StoreLocationRepository';

const productsRepository = new ProductsRepository();
const storeLocationRepository = new StoreLocationRepository();

export const useDropdownData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    if (products.length > 0 && storeLocations.length > 0) return;
    
    setIsLoading(true);
    try {
      const [productsData, locationsData] = await Promise.all([
        productsRepository.getAllProducts(),
        storeLocationRepository.getAllStoreLocations()
      ]);
      setProducts(productsData.data);
      setStoreLocations(locationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    storeLocations,
    isLoading,
    error,
    fetchData
  };
}; 