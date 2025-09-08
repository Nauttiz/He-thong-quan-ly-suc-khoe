import React, { useState } from 'react';
import { Student } from '../../types/interfaces';
import EditStudent from './EditStudent'; // ← Thêm import

interface StudentListProps {
  students: Student[];
  onStudentSelect?: (student: Student) => void;
  onStudentEdit?: (student: Student) => void;
  onStudentDelete?: (studentId: string) => void;
  onStudentUpdate?: (student: Student) => void; // ← Thêm prop update
  selectedStudentId?: string;
}

export default function StudentList({ 
  students, 
  onStudentSelect, 
  onStudentEdit, 
  onStudentDelete,
  onStudentUpdate, // ← Thêm param
  selectedStudentId 
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null); // ← Thêm state

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || student.class === filterClass;
    const matchesGender = !filterGender || student.gender === filterGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  // Get unique classes and genders for filters
  const classes = Array.from(new Set(students.map(s => s.class))).sort();
  const currentYear = new Date().getFullYear();

  // ← Thêm handlers cho edit
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    onStudentEdit?.(student); // Call parent handler if exists
  };

  const handleCloseEdit = () => {
    setEditingStudent(null);
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) { // ← window.confirm
      onStudentDelete?.(studentId);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-2 sm:mb-0">Danh sách học sinh</h2>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Tổng: {filteredStudents.length} học sinh
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo lớp</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả lớp</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo giới tính</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">
              {students.length === 0 ? 'Chưa có học sinh nào' : 'Không tìm thấy học sinh phù hợp'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="block lg:hidden space-y-4">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    selectedStudentId === student.id 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        Lớp {student.class} • {student.gender === 'male' ? 'Nam' : 'Nữ'} • 
                        {currentYear - student.birthYear} tuổi
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {student.birthYear}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🏫</span>
                      <span>{student.school}</span>
                    </div>
                    {student.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        <span className="truncate">{student.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onStudentSelect?.(student)}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedStudentId === student.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {selectedStudentId === student.id ? '✓ Đã chọn' : 'Chọn HS'}
                    </button>
                    <div className="flex gap-1">
                      {/* ← Sửa handler */}
                      <button
                        onClick={() => handleEdit(student)}
                        className="flex-1 py-3 px-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors text-center"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="flex-1 py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-center"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Họ tên</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Lớp</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Giới tính</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Tuổi</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trường</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <tr
                      key={student.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedStudentId === student.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.gender === 'male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.gender === 'male' ? 'Nam' : 'Nữ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {currentYear - student.birthYear}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.school}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onStudentSelect?.(student)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Chọn
                          </button>
                          {/* ← Sửa handlers */}
                          <button
                            onClick={() => handleEdit(student)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
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
          </>
        )}
      </div>

      {/* ← Edit Student Modal */}
      {editingStudent && onStudentUpdate && (
        <EditStudent
          student={editingStudent}
          onStudentUpdate={onStudentUpdate}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
}