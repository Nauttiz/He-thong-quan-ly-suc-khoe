import React, { useState } from 'react';
import { Session } from '../../types/interfaces';
import EditSession from './EditSession';

interface SessionListProps {
  sessions: Session[];
  onSessionSelect: (session: Session) => void;
  onSessionDelete: (sessionId: string) => Promise<void>;
  onSessionUpdate: (session: Session) => Promise<void>;
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiên đo này và tất cả dữ liệu liên quan?')) {
      return;
    }

    try {
      setIsDeleting(sessionId);
      await onSessionDelete(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Có lỗi khi xóa phiên đo!');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
  };

  const handleEditSave = async (updatedSession: Session) => {
    try {
      await onSessionUpdate(updatedSession);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Có lỗi khi cập nhật phiên đo!');
    }
  };

  const handleEditCancel = () => {
    setEditingSession(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📋 Danh sách phiên đo</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Tổng: {sessions.length} phiên
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">Chưa có phiên đo nào</p>
          <p className="text-gray-400 text-sm mt-2">Tạo phiên đo đầu tiên để bắt đầu</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block lg:hidden space-y-4">
            {sessions.map((session, index) => (
              <div 
                key={session.id || `session-mobile-${index}`} // Unique key
                className={`border-2 rounded-xl p-4 transition-all ${
                  selectedSession?.id === session.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                        #{session.code || `S${index + 1}`}
                      </span>
                      <h3 className="font-bold text-lg">{session.name || 'Phiên không tên'}</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>🏫 {session.school || 'Chưa có trường'}</p>
                      <p>📅 {new Date(session.date || session.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  {selectedSession?.id === session.id && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Đã chọn
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSessionSelect(session)}
                    disabled={isDeleting === session.id}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors text-center ${
                      selectedSession?.id === session.id
                        ? 'bg-blue-100 text-blue-700 cursor-default'
                        : isDeleting === session.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedSession?.id === session.id ? '✅ Đã chọn' : '👆 Chọn phiên'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(session)}
                    disabled={isDeleting === session.id}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDeleting === session.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    ✏️
                  </button>
                  
                  <button
                    onClick={() => handleDelete(session.id)}
                    disabled={isDeleting === session.id}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDeleting === session.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {isDeleting === session.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mã phiên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tên phiên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trường</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ngày tạo</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session, index) => (
                  <tr 
                    key={session.id || `session-desktop-${index}`} // Unique key
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedSession?.id === session.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {session.code || `S${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {session.name || 'Phiên không tên'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {session.school || 'Chưa có trường'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(session.date || session.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {selectedSession?.id === session.id ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          ✅ Đã chọn
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Chưa chọn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onSessionSelect(session)}
                          disabled={selectedSession?.id === session.id || isDeleting === session.id}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            selectedSession?.id === session.id
                              ? 'bg-blue-100 text-blue-600 cursor-default'
                              : isDeleting === session.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {selectedSession?.id === session.id ? 'Đã chọn' : 'Chọn'}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(session)}
                          disabled={isDeleting === session.id}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            isDeleting === session.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-yellow-600 text-white hover:bg-yellow-700'
                          }`}
                        >
                          Sửa
                        </button>
                        
                        <button
                          onClick={() => handleDelete(session.id)}
                          disabled={isDeleting === session.id}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            isDeleting === session.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {isDeleting === session.id ? '⏳' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingSession && (
        <EditSession
          session={editingSession}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}