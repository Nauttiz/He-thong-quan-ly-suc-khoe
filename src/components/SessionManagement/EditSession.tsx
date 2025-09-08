import React, { useState, useEffect } from 'react';
import { Session } from '../../types/interfaces';

interface EditSessionProps {
  session: Session | null;
  onSessionUpdate: (session: Session) => void;
  onClose: () => void;
}

export default function EditSession({ session, onSessionUpdate, onClose }: EditSessionProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    date: '',
    school: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (session) {
      setFormData({
        code: session.code,
        name: session.name,
        date: session.date,
        school: session.school
      });
      setErrors({});
    }
  }, [session]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã phiên';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên phiên';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày đo';
    }

    if (!formData.school.trim()) {
      newErrors.school = 'Vui lòng nhập tên trường';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !validateForm()) return;

    const updatedSession: Session = {
      ...session,
      code: formData.code.trim(),
      name: formData.name.trim(),
      date: formData.date,
      school: formData.school.trim(),
      updatedAt: new Date().toISOString() // ← Auto set updatedAt
    };

    onSessionUpdate(updatedSession);
    onClose();
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">✏️ Chỉnh sửa phiên đo</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mã phiên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔖 Mã phiên *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: KSK2024-001"
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            {/* Tên phiên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Tên phiên đo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: Khám sức khỏe đầu năm học 2024-2025"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Ngày đo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Ngày đo *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Trường */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏫 Tên trường *
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.school ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: TH Vĩnh Trường"
              />
              {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                💾 Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}