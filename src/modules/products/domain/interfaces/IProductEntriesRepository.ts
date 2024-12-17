export interface ProductEntry {
  id: number;
  product_id: number;
  store_location_id: number;
  price: number;
  created_at: string;
  product_name?: string;      // Optional fields that might come from the API
  store_address?: string;     // for displaying in the table
  store_brand_name?: string;
}

export interface IProductEntriesRepository {
  getAllProductEntries(): Promise<ProductEntry[]>;
  createProductEntry(product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  updateProductEntry(id: number, product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  deleteProductEntry(id: number): Promise<void>;
} 