import { PaginatedResponse } from "../../../shared/types/PaginatedResponse";
import { OrderDirection, ProductEntrySortField } from "../../../shared/types/sorting";

export interface ProductEntry {
  id: number;
  product: {
    id: number;
    name: string;
    image_url: string | null;
  };
  store_location: {
    id: number;
    address: string;
    store_brand: {
      id: number;
      name: string;
    };
  };
  price: number;
  created_at: string;
}

export interface IProductEntriesRepository {
  getAllProductEntries(
    search?: string,
    product_id?: number,
    page?: number,
    page_size?: number,
    sort_field?: ProductEntrySortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<ProductEntry>>;
  
  createProductEntry(
    product_id: number,
    store_location_id: number,
    price: number
  ): Promise<ProductEntry>;
  
  updateProductEntry(
    id: number,
    product_id: number,
    store_location_id: number,
    price: number
  ): Promise<ProductEntry>;
  
  deleteProductEntry(id: number): Promise<void>;
} 