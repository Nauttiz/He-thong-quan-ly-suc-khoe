import React, { useState } from 'react';
import { Session } from '../../types/interfaces';

interface EditSessionProps {
  session: Session;
  onSave: (updatedSession: Session) => Promise<void>; // Add onSave
  onCancel: () => void;
}

export default function EditSession({ session, onSave, onCancel }: EditSessionProps) {
  const [formData, setFormData] = useState({
    code: session.code || '',
    name: session.name || '',
    date: session.date || '',
    school: session.school || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.school.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      setIsSaving(true);
      
      const updatedSession: Session = {
        ...session,
        code: formData.code.trim(),
        name: formData.name.trim(),
        date: formData.date || new Date().toISOString().split('T')[0],
        school: formData.school.trim(),
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedSession); // Use onSave prop
      
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Có lỗi khi cập nhật phiên đo!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">✏️ Chỉnh sửa phiên đo</h3>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phiên
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="VD: HK1-2025"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên phiên đo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Khám sức khỏe HK1 2024-2025"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Ngày thực hiện
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trường học *
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="VD: Trường THCS Cao Văn Bé"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isSaving 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.name.trim() || !formData.school.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isSaving || !formData.name.trim() || !formData.school.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Đang lưu...
                  </span>
                ) : (
                  '💾 Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}