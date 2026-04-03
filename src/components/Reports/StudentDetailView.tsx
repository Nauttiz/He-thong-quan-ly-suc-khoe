import React, { useState } from 'react';
import { Student, HealthRecord } from '../../types/interfaces';
import { calculateWHOZScore, getZScoreSimpleName } from '../../utils/whoZScoreData';

interface StudentDetailViewProps {
  students: Student[];
  healthRecords: HealthRecord[];
  sessions: any[];
  selectedSessionId?: string;
}

export default function StudentDetailView({
  students,
  healthRecords,
  sessions,
  selectedSessionId
}: StudentDetailViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sử dụng WHO Z-Score classification thay vì BMI classification
  const getWHOClassification = (bmi: number, age: number, gender: 'male' | 'female'): string => {
    const zScore = calculateWHOZScore(bmi, age, gender);
    return getZScoreSimpleName(zScore);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const studentRecords = healthRecords.filter(record => {
    const matchStudent = record.studentId === selectedStudentId;
    const matchSession = !selectedSessionId || record.sessionId === selectedSessionId;
    return matchStudent && matchSession;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getBMITrend = () => {
    if (studentRecords.length < 2) return null;
    const latest = studentRecords[0].bmi;
    const previous = studentRecords[1].bmi;
    const diff = latest - previous;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      value: Math.abs(diff).toFixed(1)
    };
  };

  const bmiTrend = getBMITrend();

  // WHO Z-Score color mapping
  const getWHOColor = (classification: string) => {
    switch (classification) {
      case '-3SD': return 'text-red-700 bg-red-100 border-red-200';
      case '-2SD': return 'text-orange-700 bg-orange-100 border-orange-200';
      case '-1SD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Trung bình': return 'text-green-700 bg-green-100 border-green-200';
      case '+1SD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case '+2SD': return 'text-orange-700 bg-orange-100 border-orange-200';
      case '+3SD': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">👤 Chọn học sinh để xem chi tiết</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc lớp..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📋 Chọn học sinh</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn học sinh --</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - Lớp {student.class}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filteredStudents.slice(0, 8).map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedStudentId === student.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {student.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Detail */}
      {selectedStudent ? (
        <div className="space-y-6">
          {/* Student Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-gray-600">Lớp {selectedStudent.class} • {selectedStudent.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                {selectedStudent.school && (
                  <p className="text-sm text-gray-500">🏫 {selectedStudent.school}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tuổi</p>
                <p className="text-xl font-semibold">{new Date().getFullYear() - selectedStudent.birthYear}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-500">Năm sinh</p>
                <p className="text-lg font-semibold">{selectedStudent.birthYear}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="text-lg font-semibold">{selectedStudent.address || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-500">Số lần đo</p>
                <p className="text-lg font-semibold text-blue-600">{studentRecords.length}</p>
              </div>
            </div>
          </div>

          {/* Latest Health Status */}
          {studentRecords.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📊 Tình trạng sức khỏe hiện tại (WHO 2007)</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <p className="text-sm text-blue-600">Chiều cao</p>
                  <p className="text-2xl font-bold text-blue-800">{studentRecords[0].height}</p>
                  <p className="text-sm text-blue-600">cm</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <p className="text-sm text-green-600">Cân nặng</p>
                  <p className="text-2xl font-bold text-green-800">{studentRecords[0].weight}</p>
                  <p className="text-sm text-green-600">kg</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <p className="text-sm text-purple-600">BMI</p>
                  <p className="text-2xl font-bold text-purple-800">{studentRecords[0].bmi}</p>
                  <div className="flex items-center justify-center mt-1">
                    {bmiTrend && (
                      <span className={`text-xs px-2 py-1 rounded-full ${bmiTrend.direction === 'up' ? 'bg-red-100 text-red-600' :
                          bmiTrend.direction === 'down' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {bmiTrend.direction === 'up' ? '↗' : bmiTrend.direction === 'down' ? '↘' : '→'} {bmiTrend.value}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                  <p className="text-sm text-orange-600">Phân loại</p>
                  {(() => {
                    const age = new Date().getFullYear() - selectedStudent.birthYear;
                    const whoClassification = getWHOClassification(studentRecords[0].bmi, age, selectedStudent.gender);
                    return (
                      <div>
                        <p className={`text-sm font-bold px-2 py-1 rounded-full border ${getWHOColor(whoClassification)}`}>
                          {whoClassification}
                        </p>
                        {studentRecords[0].zScore && (
                          <p className="text-xs text-gray-500 mt-1">Z-Score: {studentRecords[0].zScore}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Additional metrics */}
              {(studentRecords[0].waist || studentRecords[0].bloodPressure) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentRecords[0].waist && (
                    <div className="bg-pink-50 rounded-lg p-4 text-center border border-pink-200">
                      <p className="text-sm text-pink-600">Vòng eo</p>
                      <p className="text-xl font-bold text-pink-800">{studentRecords[0].waist} cm</p>
                    </div>
                  )}
                  {studentRecords[0].bloodPressure && (
                    <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                      <p className="text-sm text-red-600">Huyết áp</p>
                      <p className="text-xl font-bold text-red-800">
                        {studentRecords[0].bloodPressure.systolic}/{studentRecords[0].bloodPressure.diastolic}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Health Records History */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              📈 Lịch sử đo chỉ số ({studentRecords.length} lần đo)
            </h3>

            {studentRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500">Chưa có kết quả đo nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ngày đo</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Chiều cao</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Cân nặng</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">BMI</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Z-Score</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Phân loại</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">🔄 Vòng eo</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">🩸 Huyết áp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentRecords.map((record, index) => {
                      const age = new Date().getFullYear() - selectedStudent.birthYear;
                      const whoClassification = getWHOClassification(record.bmi, age, selectedStudent.gender);

                      return (
                        <tr key={record.id} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-gray-500 text-xs">{new Date(record.createdAt).toLocaleTimeString('vi-VN')}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">{record.height} cm</td>
                          <td className="px-4 py-3 text-center text-sm font-medium">{record.weight} kg</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{record.bmi}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">
                            {record.zScore || calculateWHOZScore(record.bmi, age, selectedStudent.gender).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getWHOColor(whoClassification)}`}>
                              {whoClassification}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">
                            {record.waist ? (
                              <span className="text-pink-600 font-bold">{record.waist} cm</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">
                            {record.bloodPressure ? (
                              <span className="text-red-600 font-bold">
                                {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-2">👤</div>
          <p className="text-gray-500">Vui lòng chọn học sinh để xem chi tiết</p>
        </div>
      )}
    </div>
  );
}