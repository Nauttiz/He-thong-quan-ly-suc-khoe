import React, { useState } from 'react';
import { Student } from '../../types/interfaces';

interface EditStudentProps {
  student: Student;
  onStudentUpdate: (student: Student) => Promise<void>;
  onClose: () => void;
}

export default function EditStudent({ student, onStudentUpdate, onClose }: EditStudentProps) {
  const [editedStudent, setEditedStudent] = useState<Student>(student);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Validation function
  const validateStudent = (studentData: Student): string[] => {
    const validationErrors: string[] = [];
    
    // Required fields only
    if (!studentData.name?.trim()) {
      validationErrors.push('Họ và tên không được để trống');
    }
    
    if (!studentData.class?.trim()) {
      validationErrors.push('Lớp không được để trống');
    }
    
    if (!studentData.birthYear || studentData.birthYear < 2000 || studentData.birthYear > new Date().getFullYear()) {
      validationErrors.push('Năm sinh không hợp lệ (2000 - ' + new Date().getFullYear() + ')');
    }
    
    // School và address không bắt buộc - không validate
    
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate before submit
    const validationErrors = validateStudent(editedStudent);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('✏️ Updating student with data:', editedStudent);

      const updatedStudent: Student = {
        ...editedStudent,
        updatedAt: new Date().toISOString()
      };

      await onStudentUpdate(updatedStudent);
      
      console.log('✅ Student updated successfully');
      onClose();

    } catch (error) {
      console.error('❌ Error updating student:', error);
      const errorMessage = 'Có lỗi khi cập nhật học sinh: ' + (error as Error).message;
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-4 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">✏️ Sửa thông tin học sinh</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="font-medium text-red-800 mb-2">❌ Lỗi nhập liệu:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Họ và tên *
              </label>
              <input
                type="text"
                value={editedStudent.name}
                onChange={(e) => setEditedStudent(s => ({...s, name: e.target.value}))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎂 Năm sinh *
              </label>
              <input
                type="number"
                value={editedStudent.birthYear}
                onChange={(e) => setEditedStudent(s => ({...s, birthYear: parseInt(e.target.value) || new Date().getFullYear()}))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2000"
                max={new Date().getFullYear()}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏫 Lớp *
              </label>
              <input
                type="text"
                value={editedStudent.class}
                onChange={(e) => setEditedStudent(s => ({...s, class: e.target.value}))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 5A, 6B"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👫 Giới tính *
              </label>
              <select
                value={editedStudent.gender}
                onChange={(e) => setEditedStudent(s => ({...s, gender: e.target.value as 'male' | 'female'}))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏫 Trường <span className="text-gray-500">(không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={editedStudent.school || ''}
              onChange={(e) => setEditedStudent(s => ({...s, school: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Trường THCS Nguyễn Huệ"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Địa chỉ <span className="text-gray-500">(không bắt buộc)</span>
            </label>
            <textarea
              value={editedStudent.address || ''}
              onChange={(e) => setEditedStudent(s => ({...s, address: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Địa chỉ nhà học sinh..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl transition-colors font-medium ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } text-white`}
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">{isSubmitting ? '⏳' : '✏️'}</span>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}