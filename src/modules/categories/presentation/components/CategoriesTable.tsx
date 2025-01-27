import React from 'react';
import { Category } from '../../domain/interfaces/ICategoriesRepository';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { CategorySortField, OrderDirection } from '../../../shared/types/sorting';

interface CategoriesTableProps {
  categories: Category[];
  sortField: CategorySortField;
  sortOrder: OrderDirection;
  onSort: (field: CategorySortField) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  deletingCategories: number[];
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  deletingCategories
}) => {
  const getSortIcon = (field: CategorySortField) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === OrderDirection.ASC ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th 
                  style={{ width: '60%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  className="border-bottom align-middle"
                  onClick={() => onSort(CategorySortField.NAME)}
                >
                  Name
                  {getSortIcon(CategorySortField.NAME)}
                </th>
                <th 
                  style={{ width: '25%', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  className="border-bottom align-middle"
                  onClick={() => onSort(CategorySortField.CREATED_AT)}
                >
                  Created At
                  {getSortIcon(CategorySortField.CREATED_AT)}
                </th>
                <th 
                  style={{ width: '15%', padding: '0.5rem 1rem' }}
                  className="border-bottom align-middle text-end"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {categories.map((category) => (
                <tr key={category.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">{category.name}</td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }} className="align-middle text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(category.id)}
                        disabled={deletingCategories.includes(category.id)}
                      >
                        {deletingCategories.includes(category.id) ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {categories.map((category) => (
          <div key={category.id} className="card mb-3 ms-2 me-2">
            <div className="card-body">
              <h5 className="card-title mb-2">{category.name}</h5>
              <div className="mb-3 text-muted small">
                <i>Added on {new Date(category.created_at).toLocaleDateString()}</i>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => onEdit(category)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => onDelete(category.id)}
                  disabled={deletingCategories.includes(category.id)}
                >
                  {deletingCategories.includes(category.id) ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}; 