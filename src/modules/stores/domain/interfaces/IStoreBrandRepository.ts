import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { OrderDirection, StoreBrandSortField } from '../../../shared/types/sorting';

export interface StoreBrand {
  id: number;
  name: string;
  created_at: string;
}

export interface StoreBrandDropdownItem {
  id: number;
  name: string;
}

export interface IStoreBrandRepository {
  getAllStoreBrands(
    search?: string, 
    page?: number, 
    per_page?: number,
    sort_field?: StoreBrandSortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<StoreBrand>>;
  getStoreBrandsForDropdown(): Promise<StoreBrandDropdownItem[]>;
  createStoreBrand(name: string): Promise<StoreBrand>;
  updateStoreBrand(id: number, name: string): Promise<StoreBrand>;
  deleteStoreBrand(id: number): Promise<void>;
} 