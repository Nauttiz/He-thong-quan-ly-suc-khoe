import React, { useState } from 'react';
import { Student } from '../../types/interfaces';
import EditStudent from './EditStudent';

interface StudentListProps {
  students: Student[];
  onStudentSelect?: (student: Student) => void;
  onStudentEdit?: (student: Student) => void;
  onStudentDelete?: (studentId: string) => Promise<void>;
  onStudentUpdate?: (student: Student) => Promise<void>;
  onDeleteAllStudents: () => Promise<void>;
  selectedStudentId?: string;
}

export default function StudentList({ 
  students, 
  onStudentSelect, 
  onStudentEdit, 
  onStudentDelete,
  onStudentUpdate, 
  onDeleteAllStudents,
  selectedStudentId 
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    onStudentEdit?.(student);
  };

  const handleCloseEdit = () => {
    setEditingStudent(null);
  };

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      return;
    }

    try {
      setIsDeleting(studentId);
      console.log('🗑️ StudentList: Deleting student:', studentId);
      
      if (onStudentDelete) {
        await onStudentDelete(studentId);
      }
      
      console.log('✅ StudentList: Student deleted successfully');
    } catch (error) {
      console.error('❌ StudentList: Error deleting student:', error);
      alert('Có lỗi khi xóa học sinh: ' + (error as Error).message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(
      `🚨 CẢNH BÁO!\n\nBạn sắp xóa TẤT CẢ ${students.length} học sinh!\n\nThao tác này KHÔNG THỂ HOÀN TÁC!\n\nBạn có chắc chắn?`
    )) {
      return;
    }

    try {
      console.log('🗑️ StudentList: Calling delete all students...');
      await onDeleteAllStudents();
      console.log('✅ StudentList: All students deleted successfully');
    } catch (error) {
      console.error('❌ StudentList: Error deleting all students:', error);
      alert('Có lỗi khi xóa tất cả học sinh: ' + (error as Error).message);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">
            👥 Danh sách học sinh ({students.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>

            {/* Delete All Button */}
            {students.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                title="Xóa tất cả học sinh"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🏫 Lọc theo lớp</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">👫 Lọc theo giới tính</label>
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
            {students.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">
                Hãy thêm học sinh mới để bắt đầu
              </p>
            )}
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
                        🏫 Lớp {student.class} • {student.gender === 'male' ? '👦 Nam' : '👧 Nữ'} • 
                        🎂 {currentYear - student.birthYear} tuổi
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {student.birthYear}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* ← UPDATED: Handle optional school field */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🏫</span>
                      <span>{student.school || <em className="text-gray-400">Chưa có thông tin trường</em>}</span>
                    </div>
                    
                    {/* ← UPDATED: Only show address if it exists */}
                    {student.address && student.address.trim() && (
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
                      {selectedStudentId === student.id ? '✓ Đã chọn' : '📋 Chọn HS'}
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(student)}
                        disabled={isDeleting === student.id}
                        className={`flex-1 py-3 px-2 rounded-lg transition-colors text-center ${
                          isDeleting === student.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        disabled={isDeleting === student.id}
                        className={`flex-1 py-3 px-2 rounded-lg transition-colors text-center ${
                          isDeleting === student.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {isDeleting === student.id ? '⏳' : '🗑️'}
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
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Địa chỉ</th>
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
                      <td className="px-6 py-4 text-center text-sm font-medium text-blue-600">
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
                      {/* ← UPDATED: Handle optional school field */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.school || <span className="text-gray-400 italic">Chưa có</span>}
                      </td>
                      {/* ← UPDATED: Handle optional address field */}
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {student.address && student.address.trim() 
                          ? <span title={student.address}>{student.address}</span>
                          : <span className="text-gray-400 italic">Chưa có</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onStudentSelect?.(student)}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                              selectedStudentId === student.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {selectedStudentId === student.id ? '✓' : 'Chọn'}
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            disabled={isDeleting === student.id}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                              isDeleting === student.id
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            {isDeleting === student.id ? '⏳' : 'Sửa'}
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            disabled={isDeleting === student.id}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                              isDeleting === student.id
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {isDeleting === student.id ? '⏳' : 'Xóa'}
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

      {/* Edit Student Modal */}
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