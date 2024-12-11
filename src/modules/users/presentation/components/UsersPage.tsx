import React, { useEffect, useState } from 'react';
import { User } from '../../domain/interfaces/IUsersRepository';
import { UsersRepository } from '../../infrastructure/UsersRepository';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const usersRepository = new UsersRepository();

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await usersRepository.getAllUsers();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          logout();
          navigate('/');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, navigate, logout]);

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <h1>Users Management</h1>
        <div className="card mt-4">
          <div className="card-body">
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <h1>Users Management</h1>
        <div className="alert alert-danger mt-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h1>Users Management</h1>
      <div className="card mt-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 