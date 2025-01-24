import { StoreLocation } from "../../../stores/domain/interfaces/IStoreLocationRepository";
import { Product } from "./IProductsRepository";
import { PaginatedResponse } from "../../../shared/types/PaginatedResponse";
import { ProductEntrySortField, SortOrder } from "../types/sorting";

export interface ProductEntry {
  id: number;
  price: number;
  created_at: string;
  product: Product;
  store_location: StoreLocation;
}

export interface IProductEntriesRepository {
  getAllProductEntries(
    search?: string, 
    page?: number, 
    per_page?: number,
    sort_field?: ProductEntrySortField,
    sort_order?: SortOrder
  ): Promise<PaginatedResponse<ProductEntry>>;
  createProductEntry(product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  updateProductEntry(id: number, product_id: number, store_location_id: number, price: number): Promise<ProductEntry>;
  deleteProductEntry(id: number): Promise<void>;
} 