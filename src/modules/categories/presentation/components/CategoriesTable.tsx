import React from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Category } from '../../domain/interfaces/ICategoriesRepository';

interface CategoriesTableProps {
  categories: Category[];
  sortField: 'id' | 'name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'id' | 'name' | 'created_at') => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortOrder === 'asc' ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th onClick={() => onSort('id')} style={{ cursor: 'pointer' }}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => onSort('name')} style={{ cursor: 'pointer' }}>
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>
                  Created At {getSortIcon('created_at')}
                </th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{new Date(category.created_at).toLocaleDateString()}</td>
                  <td className="text-end">
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
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {categories.map((category) => (
          <div key={category.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">#{category.id}</h6>
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
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}; 