import React from 'react';
import { StoreBrand } from '../../../domain/interfaces/IStoreBrandRepository';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { OrderDirection, StoreBrandSortField } from '../../../../shared/types/sorting';

interface StoreBrandsTableProps {
  storeBrands: StoreBrand[];
  sortField: StoreBrandSortField;
  sortOrder: OrderDirection;
  onSort: (field: StoreBrandSortField) => void;
  onEdit: (brand: StoreBrand) => void;
  onDelete: (id: number) => void;
  deletingBrands: number[];
}

export const StoreBrandsTable: React.FC<StoreBrandsTableProps> = ({
  storeBrands,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  deletingBrands
}) => {
  const getSortIcon = (field: StoreBrandSortField) => {
    if (field !== sortField) return <FaSort />;
    return sortOrder === OrderDirection.ASC ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th 
              className="border-0 px-3" 
              style={{ cursor: 'pointer', minWidth: '200px' }}
              onClick={() => onSort(StoreBrandSortField.NAME)}
            >
              <div className="d-flex align-items-center gap-2">
                Name
                {getSortIcon(StoreBrandSortField.NAME)}
              </div>
            </th>
            <th 
              className="border-0 px-3" 
              style={{ cursor: 'pointer', minWidth: '200px' }}
              onClick={() => onSort(StoreBrandSortField.CREATED_AT)}
            >
              <div className="d-flex align-items-center gap-2">
                Created At
                {getSortIcon(StoreBrandSortField.CREATED_AT)}
              </div>
            </th>
            <th className="border-0 px-3 text-end" style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {storeBrands.map((brand) => (
            <tr key={brand.id}>
              <td className="px-3">{brand.name}</td>
              <td className="px-3">{new Date(brand.created_at).toLocaleDateString()}</td>
              <td className="px-3 text-end">
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEdit(brand)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(brand.id)}
                    disabled={deletingBrands.includes(brand.id)}
                  >
                    {deletingBrands.includes(brand.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 