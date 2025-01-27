export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum ProductSortField {
  NAME = 'name',
  BARCODE = 'barcode',
  CREATED_AT = 'created_at'
}

export enum ProductEntrySortField {
  CREATED_AT = 'created_at',
  PRICE = 'price'
}

export type SortOrder = 'asc' | 'desc'; 