import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';
import { OrderDirection, ProductSortField } from '../types/sorting';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  image_url: string | null;
  created_at: string;
  category: Category;
}

export interface ProductDropdownItem {
  id: number;
  name: string;
}

export interface IProductsRepository {
  getAllProducts(
    search?: string, 
    page?: number, 
    per_page?: number,
    sort_field?: ProductSortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<Product>>;
  getProductsForDropdown(): Promise<ProductDropdownItem[]>;
  createProduct(name: string, barcode: string, image: File, categoryId: number): Promise<Product>;
  updateProduct(id: number, name: string, barcode: string, image: File | null, categoryId: number): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
} 