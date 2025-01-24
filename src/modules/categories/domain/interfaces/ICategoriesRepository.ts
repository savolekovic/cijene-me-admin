import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';

export interface CategoryDropdownItem {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface ICategoriesRepository {
  getAllCategories(search?: string, page?: number, per_page?: number): Promise<PaginatedResponse<Category>>;
  getCategoriesForDropdown(): Promise<CategoryDropdownItem[]>;
  createCategory(name: string): Promise<Category>;
  deleteCategory(categoryId: number): Promise<void>;
  updateCategory(categoryId: number, name: string): Promise<Category>;
}
