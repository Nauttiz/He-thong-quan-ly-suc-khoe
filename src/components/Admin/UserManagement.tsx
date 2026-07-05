import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          uid: d.id,
          email: (d.data().email as string) || '(no email)',
          role: ((d.data().role as UserRole) || 'pending'),
          createdAt: d.data().createdAt as string | undefined
        }));
        // Pending accounts first, then by creation date
        list.sort((a, b) => {
          if ((a.role === 'pending') !== (b.role === 'pending')) {
            return a.role === 'pending' ? -1 : 1;
          }
          return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
        });
        setUsers(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error loading users:', err);
        setError('Failed to load users. Make sure your account has the admin role.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const changeRole = async (user: UserProfile, newRole: UserRole) => {
    if (user.uid === currentUser?.uid) {
      alert('You cannot change your own role.');
      return;
    }

    if (newRole === 'admin' && !window.confirm(
      `Grant ADMIN to ${user.email}? Admins can manage all users and data.`
    )) return;

    if (newRole === 'pending' && !window.confirm(
      `Revoke access for ${user.email}? They will no longer be able to use the system.`
    )) return;

    try {
      setBusyUid(user.uid);
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('❌ Error updating role:', err);
      alert('Failed to update role: ' + (err as Error).message);
    } finally {
      setBusyUid(null);
    }
  };

  const removeUser = async (user: UserProfile) => {
    if (user.uid === currentUser?.uid) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(
      `Delete the profile of ${user.email}?\n\nNote: this removes their access, but the login account itself must be deleted in Firebase Console → Authentication.`
    )) return;

    try {
      setBusyUid(user.uid);
      await deleteDoc(doc(db, 'users', user.uid));
    } catch (err) {
      console.error('❌ Error deleting user profile:', err);
      alert('Failed to delete user profile: ' + (err as Error).message);
    } finally {
      setBusyUid(null);
    }
  };

  const roleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      admin: 'bg-purple-100 text-purple-700',
      customer: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    const labels: Record<UserRole, string> = {
      admin: '👑 Admin',
      customer: '✅ Customer',
      pending: '⏳ Pending'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const pendingCount = users.filter(u => u.role === 'pending').length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-3">🔄</div>
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-600">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-medium">
            ⏳ {pendingCount} account(s) waiting for approval
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
        <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">👤 User Management</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 pr-4 font-medium">Registered</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isSelf = user.uid === currentUser?.uid;
                const isBusy = busyUid === user.uid;
                return (
                  <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-gray-900">{user.email}</span>
                      {isSelf && (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">{roleBadge(user.role)}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="py-3">
                      {isSelf ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.role === 'pending' && (
                            <button
                              onClick={() => changeRole(user, 'customer')}
                              disabled={isBusy}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              ✅ Approve
                            </button>
                          )}
                          {user.role === 'customer' && (
                            <>
                              <button
                                onClick={() => changeRole(user, 'pending')}
                                disabled={isBusy}
                                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                🚫 Revoke access
                              </button>
                              <button
                                onClick={() => changeRole(user, 'admin')}
                                disabled={isBusy}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                👑 Make admin
                              </button>
                            </>
                          )}
                          {user.role === 'admin' && (
                            <button
                              onClick={() => changeRole(user, 'customer')}
                              disabled={isBusy}
                              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              ⬇️ Demote to customer
                            </button>
                          )}
                          <button
                            onClick={() => removeUser(user)}
                            disabled={isBusy}
                            className="bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No user profiles found.
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          ℹ️ Deleting a profile here only removes the user's access. To fully delete their
          login account, use Firebase Console → Authentication → Users.
        </div>
      </div>
    </div>
  );
}
