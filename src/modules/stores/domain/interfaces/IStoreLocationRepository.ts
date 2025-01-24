import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';

export interface StoreBrand {
  id: number;
  name: string;
}

export interface StoreLocation {
  id: number;
  address: string;
  created_at: string;
  store_brand: StoreBrand;
}

export interface StoreLocationDropdownItem {
  id: number;
  address: string;
  store_brand_name: string;
}

export interface StoreLocationDropdownOptions {
  store_brand_id?: number;
  search?: string;
}

export interface IStoreLocationRepository {
  getAllStoreLocations(
    search?: string,
    page?: number,
    per_page?: number,
    sort_field?: string,
    sort_order?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<StoreLocation>>;
  getStoreLocationsForDropdown(options?: StoreLocationDropdownOptions): Promise<StoreLocationDropdownItem[]>;
  createStoreLocation(address: string, store_brand_id: number): Promise<StoreLocation>;
  updateStoreLocation(id: number, address: string, store_brand_id: number): Promise<StoreLocation>;
  deleteStoreLocation(id: number): Promise<void>;
} 