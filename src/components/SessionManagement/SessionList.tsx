import React, { useState } from 'react';
import { Session } from '../../types/interfaces';
import EditSession from './EditSession'; // ← Thêm import

interface SessionListProps {
  sessions: Session[];
  onSessionSelect: (session: Session) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionUpdate: (session: Session) => void; 
  selectedSession?: Session | null;
}

export default function SessionList({ 
  sessions, 
  onSessionSelect, 
  onSessionDelete,
  onSessionUpdate, 
  selectedSession 
}: SessionListProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
  };

  const handleCloseEdit = () => {
    setEditingSession(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Danh sách phiên đo</h2>
          <div className="text-sm text-gray-500">Tổng: {sessions.length} phiên</div>
        </div>

        {/* Search và Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã phiên..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">Chưa có phiên đo nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mã phiên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tên phiên</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Trường</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ngày đo</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedSession?.id === session.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onSessionSelect(session)}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                      {session.code}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {session.name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {session.school}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {formatDate(session.date)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* ← NÚT SỬA */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(session);
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                        >
                          Sửa
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn có chắc muốn xóa phiên "${session.name}"?`)) {
                              onSessionDelete(session.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ← EDIT SESSION MODAL */}
      {editingSession && (
        <EditSession
          session={editingSession}
          onSessionUpdate={onSessionUpdate}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
}