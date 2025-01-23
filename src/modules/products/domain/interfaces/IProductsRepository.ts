import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  image_url: string;
  created_at: string;
  category: Category;
}

export interface ProductDropdownItem {
  id: number;
  name: string;
}

export interface IProductsRepository {
  getAllProducts(search?: string, page?: number, per_page?: number): Promise<PaginatedResponse<Product>>;
  getProductsForDropdown(): Promise<ProductDropdownItem[]>;
  createProduct(name: string, barcode: string, image: File, categoryId: number): Promise<Product>;
  updateProduct(productId: number, name: string, barcode: string, image: File | null, categoryId: number): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
} 