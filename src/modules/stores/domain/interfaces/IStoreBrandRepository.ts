export interface StoreBrand {
  id: number;
  name: string;
  created_at: string;
}

export interface IStoreBrandRepository {
  getAllStoreBrands(): Promise<StoreBrand[]>;
  createStoreBrand(name: string): Promise<StoreBrand>;
  updateStoreBrand(id: number, name: string): Promise<StoreBrand>;
  deleteStoreBrand(id: number): Promise<void>;
} 