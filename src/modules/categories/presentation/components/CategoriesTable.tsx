import React from 'react';
import { Category } from '../../domain/interfaces/ICategoriesRepository';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onEdit,
  onDelete
}) => {
  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr className="border-0">
                <th style={{ width: '60%', padding: '0.75rem 1rem' }}>Name</th>
                <th style={{ width: '25%', textAlign: 'right', padding: '0.75rem 1rem' }}>Created At</th>
                <th style={{ width: '15%', textAlign: 'right', padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {categories.map((category) => (
                <tr key={category.id} className="border-bottom" style={{ borderColor: '#f0f0f0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>{category.name}</td>
                  <td className="text-end" style={{ padding: '0.75rem 1rem' }}>
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-end" style={{ padding: '0.75rem 1rem' }}>
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
          <div key={category.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex flex-column mb-3">
                <h5 className="card-title mb-1">{category.name}</h5>
                <div className="text-muted small">
                  Added on {new Date(category.created_at).toLocaleDateString()}
                </div>
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