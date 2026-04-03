import React, { useState } from 'react';
import { Student } from '../../types/interfaces';

interface StudentFormProps {
  onStudentCreated?: (student: Omit<Student, 'id'>) => void;
}

export default function StudentForm({ onStudentCreated }: StudentFormProps) {
  const [student, setStudent] = useState<Omit<Student, 'id' | 'createdAt'>>({
    name: '',
    birthYear: new Date().getFullYear() - 6, // DEFAULT: 6 tuổi
    class: '',
    school: '',
    address: '',
    gender: 'male'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]); // Error state

  // Validation function
  const validateStudent = (studentData: typeof student): string[] => {
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

  const validationErrors = validateStudent(student);
  setErrors(validationErrors);
  
  if (validationErrors.length > 0) {
    console.log('❌ Validation failed:', validationErrors);
    return;
  }

  try {
    setIsSubmitting(true);
    console.log('📝 Creating student with data:', student);

    // FIX: Create correct data type without id
    const newStudentData: Omit<Student, 'id'> = {
      ...student,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('🚀 Calling onStudentCreated with:', newStudentData);
    await onStudentCreated?.(newStudentData); // Pass correct type
    
    console.log('✅ Student created successfully');

    // Reset form
    setStudent({
      name: '',
      birthYear: new Date().getFullYear() - 6,
      class: '',
      school: '',
      address: '',
      gender: 'male'
    });
    
    setErrors([]);

  } catch (error) {
    console.error('❌ Error in StudentForm:', error);
    const errorMessage = 'Có lỗi khi thêm học sinh: ' + (error as Error).message;
    setErrors([errorMessage]);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">👥 Thêm học sinh mới</h2>
      
      {/*  ADD: Error Display */}
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
             Họ và tên *
            </label>
            <input
              type="text"
              value={student.name}
              onChange={(e) => setStudent(s => ({...s, name: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm sinh *
            </label>
            <input
              type="number"
              value={student.birthYear}
              onChange={(e) => setStudent(s => ({...s, birthYear: parseInt(e.target.value) || new Date().getFullYear()}))}
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
              Lớp *
            </label>
            <input
              type="text"
              value={student.class}
              onChange={(e) => setStudent(s => ({...s, class: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: 5A, 6B"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính *
            </label>
            <select
              value={student.gender}
              onChange={(e) => setStudent(s => ({...s, gender: e.target.value as 'male' | 'female'}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
        </div>

        {/* OPTIONAL FIELDS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trường <span className="text-gray-500">(không bắt buộc)</span>
          </label>
          <input
            type="text"
            value={student.school}
            onChange={(e) => setStudent(s => ({...s, school: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Trường THCS Nguyễn Huệ"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ <span className="text-gray-500">(không bắt buộc)</span>
          </label>
          <textarea
            value={student.address}
            onChange={(e) => setStudent(s => ({...s, address: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Địa chỉ nhà học sinh..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 lg:py-3 px-6 rounded-xl transition-colors font-medium text-base lg:text-sm ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          } text-white`}
        >
          <span className="flex items-center justify-center">
            <span className="mr-2">{isSubmitting ? '⏳' : '👥'}</span>
            {isSubmitting ? 'Đang thêm...' : 'Thêm học sinh'}
          </span>
        </button>
      </form>
    </div>
  );
}