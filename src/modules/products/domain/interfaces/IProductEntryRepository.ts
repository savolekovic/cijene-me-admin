export interface ProductEntry {
  id: number; 
  product_id: number; 
  store_brand_id: number;
  store_location_Id: number;
  price: string;
  created_at: string;
  product_name?: string;
  store_brand_name?: string;
  store_location_name?: string;
}

export interface IProductEntryRepository {
  getAllProductEntries(): Promise<ProductEntry[]>;
  createProductEntry(productId: number, storeBrandId: number, storeLocationId: number, price: string): Promise<ProductEntry>;
  updateProductEntry(productEntryId: number, productId: number, storeBrandId: number, storeLocationId: number, price: string): Promise<ProductEntry>;
  deleteProductEntry(productEntryId: number): Promise<void>;
} 