import React, { useState, useEffect } from 'react';
import { Student } from '../../types/interfaces';

interface EditStudentProps {
  student: Student | null;
  onStudentUpdate: (student: Student) => void;
  onClose: () => void;
}

export default function EditStudent({ student, onStudentUpdate, onClose }: EditStudentProps) {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    gender: 'male' as 'male' | 'female',
    birthYear: new Date().getFullYear() - 10,
    school: '',
    address: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        class: student.class,
        gender: student.gender,
        birthYear: student.birthYear,
        school: student.school,
        address: student.address
      });
      setErrors({});
    }
  }, [student]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Vui lòng nhập lớp';
    }

    if (formData.birthYear < 2010 || formData.birthYear > 2020) {
      newErrors.birthYear = 'Năm sinh phải từ 2010 đến 2020';
    }

    if (!formData.school.trim()) {
      newErrors.school = 'Vui lòng nhập tên trường';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student || !validateForm()) return;

    const updatedStudent: Student = {
      ...student,
      name: formData.name.trim(),
      class: formData.class.trim(),
      gender: formData.gender,
      birthYear: formData.birthYear,
      school: formData.school.trim(),
      address: formData.address.trim(),
      updatedAt: new Date().toISOString() // ← Auto set updatedAt
    };

    onStudentUpdate(updatedStudent);
    onClose();
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">✏️ Chỉnh sửa học sinh</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Họ và tên *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập họ và tên học sinh"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Lớp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏫 Lớp *
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.class ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: 5A, 4B..."
              />
              {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚥ Giới tính
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="text-blue-600"
                  />
                  <span>👦 Nam</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="text-pink-600"
                  />
                  <span>👧 Nữ</span>
                </label>
              </div>
            </div>

            {/* Năm sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Năm sinh *
              </label>
              <select
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.birthYear ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
            </div>

            {/* Trường */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏫 Trường *
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.school ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tên trường học"
              />
              {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Địa chỉ *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Địa chỉ nhà học sinh"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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