import { PaginatedResponse } from "../../../shared/types/PaginatedResponse";
import { OrderDirection, ProductEntrySortField } from "../../../shared/types/sorting";

export interface ProductEntryFilters {
  search?: string;
  product_id?: number;
  store_brand_id?: number;
  store_location_id?: number;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  sort_field?: ProductEntrySortField;
  sort_order?: OrderDirection;
}

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
  getAllProductEntries(filters: ProductEntryFilters): Promise<PaginatedResponse<ProductEntry>>;
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