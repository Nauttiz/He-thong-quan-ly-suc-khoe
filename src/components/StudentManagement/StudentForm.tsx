import React, { useState } from 'react';
import { Student } from '../../types/interfaces';

interface StudentFormProps {
  onStudentCreated?: (student: Student) => void;
}

export default function StudentForm({ onStudentCreated }: StudentFormProps) {
  const [student, setStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    birthYear: new Date().getFullYear(),
    class: '',
    school: '',
    address: '',
    gender: 'male',
    createdAt: ''  // ← Thêm trường này
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStudent: Student = {
      id: crypto.randomUUID(),
      ...student,
      createdAt: new Date().toISOString()  // ← Set giá trị khi submit
    };

    onStudentCreated?.(newStudent);

    // Reset form
    setStudent({
      name: '',
      birthYear: new Date().getFullYear(),
      class: '',
      school: '',
      address: '',
      gender: 'male',
      createdAt: ''  // ← Thêm trường này
    });
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Thêm học sinh mới</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
            <input
              type="text"
              value={student.name}
              onChange={(e) => setStudent(s => ({...s, name: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm sinh *</label>
            <input
              type="number"
              value={student.birthYear}
              onChange={(e) => setStudent(s => ({...s, birthYear: parseInt(e.target.value)}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
              min="2000"
              max={new Date().getFullYear()}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lớp *</label>
            <input
              type="text"
              value={student.class}
              onChange={(e) => setStudent(s => ({...s, class: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 5A, 6B"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
            <select
              value={student.gender}
              onChange={(e) => setStudent(s => ({...s, gender: e.target.value as 'male' | 'female'}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trường *</label>
          <input
            type="text"
            value={student.school}
            onChange={(e) => setStudent(s => ({...s, school: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="VD: Trường THCS Nguyễn Huệ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
          <textarea
            value={student.address}
            onChange={(e) => setStudent(s => ({...s, address: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Địa chỉ nhà học sinh..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-4 lg:py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium text-base lg:text-sm"
        >
          👥 Thêm học sinh
        </button>
      </form>
    </div>
  );
}