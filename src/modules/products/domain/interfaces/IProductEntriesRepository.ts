import { StoreLocation } from "../../../stores/domain/interfaces/IStoreLocationRepository";
import { Product } from "./IProductsRepository";

export interface ProductEntry {
  id: number;
  price: number;
  created_at: string;
  product: Product;
  store_location: StoreLocation;
}

export interface IProductEntriesRepository {
  getAllProductEntries(): Promise<ProductEntry[]>;
  createProductEntry(product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  updateProductEntry(id: number, product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  deleteProductEntry(id: number): Promise<void>;
} 