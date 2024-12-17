export interface StoreBrand {
  id: number;
  name: string;
}

export interface StoreLocation {
  id: number;
  address: string;
  created_at: string;
  store_brand: StoreBrand;
}

export interface IStoreLocationRepository {
  getAllStoreLocations(): Promise<StoreLocation[]>;
  createStoreLocation(address: string, store_brand_id: number): Promise<StoreLocation>;
  updateStoreLocation(id: number, address: string, store_brand_id: number): Promise<StoreLocation>;
  deleteStoreLocation(id: number): Promise<void>;
} 