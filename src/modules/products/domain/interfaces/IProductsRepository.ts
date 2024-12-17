export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
  category: Category;
}

export interface IProductsRepository {
  getAllProducts(): Promise<Product[]>;
  createProduct(name: string, imageUrl: string, categoryId: number): Promise<Product>;
  updateProduct(productId: number, name: string, imageUrl: string, categoryId: number): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
} 