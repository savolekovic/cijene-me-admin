import React from 'react';
import { StoreBrand } from '../../../domain/interfaces/IStoreBrandRepository';

interface StoreBrandsTableProps {
  storeBrands: StoreBrand[];
  sortField: 'name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'created_at') => void;
  onEdit: (brand: StoreBrand) => void;
  onDelete: (id: number) => void;
}

export const StoreBrandsTable: React.FC<StoreBrandsTableProps> = ({
  storeBrands,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th 
              onClick={() => onSort('name')} 
              style={{ cursor: 'pointer', width: '60%', padding: '0.5rem 1rem' }}
              className="border-bottom"

            >
              Name
              {sortField === 'name' && (
                <i className={`ms-1 fa fa-sort-${sortOrder}`} />
              )}
            </th>
            <th 
              onClick={() => onSort('created_at')} 
              style={{ cursor: 'pointer', width: '25%' }}
              className="text-end border-bottom"
            >
              Created At
              {sortField === 'created_at' && (
                <i className={`ms-1 fa fa-sort-${sortOrder}`} />
              )}
            </th>
            <th 
              style={{ width: '15%' }}
              className="text-end border-bottom"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {storeBrands.map((brand) => (
            <tr key={brand.id}>
              <td style={{ padding: '0.5rem 1rem' }}>{brand.name}</td>
              <td className="text-end">
                {new Date(brand.created_at).toLocaleDateString()}
              </td>
              <td className="text-end">
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
                  >
                    Delete
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