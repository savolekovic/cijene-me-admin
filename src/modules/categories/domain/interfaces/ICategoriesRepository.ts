export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface ICategoriesRepository {
  getAllCategories(): Promise<Category[]>;
} 