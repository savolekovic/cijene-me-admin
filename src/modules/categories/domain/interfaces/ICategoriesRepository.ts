export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface ICategoriesRepository {
  getAllCategories(): Promise<Category[]>;
  createCategory(name: string): Promise<Category>;
  deleteCategory(categoryId: number): Promise<void>;
  updateCategory(categoryId: number, name: string): Promise<Category>;
}
