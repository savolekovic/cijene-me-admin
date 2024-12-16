export interface Product {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  created_at: string;
  category_name?: string;  // Optional field that might come from the API
}

export interface IProductsRepository {
  getAllProducts(): Promise<Product[]>;
  createProduct(name: string, imageUrl: string, categoryId: number): Promise<Product>;
  updateProduct(productId: number, name: string, imageUrl: string, categoryId: number): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
} 