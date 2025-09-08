import React, { useState } from 'react';
import { HealthRecord, Student } from '../../types/interfaces';
import { getZScoreSimpleName } from '../../utils/whoZScoreData';
import { exportToCsv, exportSummaryToCsv } from '../../utils/csvExport';

interface HealthRecordsListProps {
  records: HealthRecord[];
  students: Student[];
  sessions?: any[]; // Thêm sessions prop (có thể optional)
  onRecordEdit?: (record: HealthRecord) => void;
  onRecordDelete?: (recordId: string) => void;
  selectedSessionId?: string;
}

export default function HealthRecordsList({ 
  records, 
  students,
  sessions = [], // Default empty array
  onRecordEdit, 
  onRecordDelete, 
  selectedSessionId 
}: HealthRecordsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZScore, setFilterZScore] = useState('');
  const [isExporting, setIsExporting] = useState(false); // Thêm state cho export

  function getStudentInfo(record: HealthRecord): { class: string; birthYear: number; gender: 'male' | 'female' } {
    const student = students.find(s => s.id === record.studentId);
    return {
      class: record.studentClass || student?.class || 'N/A',
      birthYear: student?.birthYear || 0,
      gender: student?.gender || 'male'
    };
  }

  function calculateAge(birthYear: number): number {
    return new Date().getFullYear() - birthYear;
  }

  const filteredRecords = records.filter(record => {
    if (selectedSessionId && record.sessionId !== selectedSessionId) return false;
    const matchesSearch = record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    const matchesZScore = !filterZScore || (
      record.zScore !== undefined && 
      record.zScore !== null && 
      getZScoreSimpleName(record.zScore) === filterZScore
    );
    
    return matchesSearch && matchesZScore;
  });

  // ← Thêm function xử lý export CSV
  const handleExportToCsv = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        records: filteredRecords, // Export filtered data
        students,
        sessions
      };

      const result = exportToCsv(exportData, selectedSessionId);
      
      if (result.success) {
        alert(`✅ Xuất CSV thành công!\n📁 File: ${result.filename}\n📊 Số bản ghi: ${result.recordCount}`);
      } else {
        alert('❌ Có lỗi xảy ra khi xuất CSV!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Có lỗi xảy ra khi xuất CSV!');
    } finally {
      setIsExporting(false);
    }
  };

  // ← Thêm function xử lý export thống kê
  const handleExportSummary = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        records: filteredRecords,
        students,
        sessions
      };

      const result = exportSummaryToCsv(exportData, selectedSessionId);
      
      if (result.success) {
        alert(`✅ Xuất thống kê thành công!\n📁 File: ${result.filename}`);
      } else {
        alert('❌ Có lỗi xảy ra khi xuất thống kê!');
      }
    } catch (error) {
      console.error('Export summary error:', error);
      alert('❌ Có lỗi xảy ra khi xuất thống kê!');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueZScoreShortNames = Array.from(new Set(
    records
      .filter(record => record.zScore !== undefined && record.zScore !== null)
      .map(record => getZScoreSimpleName(record.zScore!))
  )).sort((a, b) => {
    const order = ['-3SD', '-2SD', '-1SD', 'Trung bình', '+1SD', '+2SD', '+3SD'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      {/* Header với nút Export */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold mb-2 sm:mb-0">📊 Kết quả đo chỉ số</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Tổng: {filteredRecords.length} lần đo
          </div>
          
          {/* ← Nút Export CSV Data */}
          <button
            onClick={handleExportToCsv}
            disabled={isExporting || filteredRecords.length === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isExporting || filteredRecords.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isExporting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden sm:inline">Đang xuất...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span className="hidden sm:inline">Xuất CSV</span>
              </>
            )}
          </button>

          {/* ← Nút Export Thống kê */}
          <button
            onClick={handleExportSummary}
            disabled={isExporting || filteredRecords.length === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isExporting || filteredRecords.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            <span>📊</span>
            <span className="hidden sm:inline">Thống kê</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Tìm kiếm học sinh</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📈 Lọc theo Z-Score</label>
          <select
            value={filterZScore}
            onChange={(e) => setFilterZScore(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả Z-Score</option>
            {uniqueZScoreShortNames.map(shortName => (
              <option key={shortName} value={shortName}>{shortName}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">
            {records.length === 0 ? 'Chưa có kết quả đo nào' : 'Không tìm thấy kết quả phù hợp'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-4">
            {filteredRecords.map((record, index) => {
              const studentInfo = getStudentInfo(record);
              return (
                <div key={record.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">#{index + 1}</span>
                        <h3 className="font-bold text-lg text-gray-900">{record.studentName}</h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>🏫 Lớp: {studentInfo.class}</p>
                        <p>👤 Tuổi: {calculateAge(studentInfo.birthYear)} ({studentInfo.gender === 'male' ? 'Nam' : 'Nữ'})</p>
                      </div>
                    </div>
                    {record.zScore && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getZScoreSimpleName(record.zScore)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 mb-1">📏 Chiều cao</div>
                      <div className="text-lg font-bold text-blue-700">{record.height} cm</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 mb-1">⚖️ Cân nặng</div>
                      <div className="text-lg font-bold text-orange-700">{record.weight} kg</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 mb-1">📊 BMI</div>
                      <div className="text-lg font-bold text-green-700">{record.bmi}</div>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <div className="text-xs text-pink-600 mb-1">🔄 Vòng eo</div>
                      <div className="text-lg font-bold text-pink-700">
                        {record.waist ? `${record.waist} cm` : 'Chưa đo'}
                      </div>
                    </div>
                  </div>

                  {(record.bloodPressure || record.zScore) && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {record.bloodPressure && (
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-indigo-600 mb-1">🩸 Huyết áp</div>
                          <div className="text-lg font-bold text-indigo-700">
                            {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                          </div>
                        </div>
                      )}
                      {record.zScore && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-600 mb-1">📈 Z-Score</div>
                          <div className="text-lg font-bold text-purple-700">{record.zScore}</div>
                          <div className="text-xs text-gray-500 mt-1">{getZScoreSimpleName(record.zScore)}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {record.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">📝 Ghi chú:</div>
                      <div className="text-sm">{record.notes}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onRecordEdit?.(record)}
                      className="flex-1 py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-center"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => onRecordDelete?.(record.id)}
                      className="flex-1 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-center"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Table với tất cả cột */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">STT</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">👤 Họ và tên</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">🏫 Lớp</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">📏 Chiều cao (cm)</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">⚖️ Cân nặng (kg)</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">📊 BMI</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">🔄 Vòng eo (cm)</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">🩸 Huyết áp (mmHg)</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500">📈 Z-Score, Ghi chú - Tư vấn</th>
                  <th className="px-3 py-4 text-center text-sm font-medium text-gray-500">⚙️ Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record, index) => {
                  const studentInfo = getStudentInfo(record);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 text-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        <div>
                          <div className="font-bold">{record.studentName}</div>
                          <div className="text-xs text-gray-500">
                            {calculateAge(studentInfo.birthYear)} tuổi ({studentInfo.gender === 'male' ? 'Nam' : 'Nữ'})
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-medium text-blue-600">
                        {studentInfo.class}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-medium">
                        {record.height}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-medium">
                        {record.weight}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-bold text-green-600">
                        {record.bmi}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-medium">
                        {record.waist ? (
                          <span className="text-pink-600 font-bold">{record.waist}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-medium">
                        {record.bloodPressure ? (
                          <span className="text-red-600 font-bold">
                            {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <div className="space-y-1">
                          {record.zScore && (
                            <div>
                              <span className="font-bold text-purple-600">{record.zScore}</span>
                              <div className="text-xs text-blue-600">{getZScoreSimpleName(record.zScore)}</div>
                            </div>
                          )}
                          {record.notes && (
                            <div className="text-xs text-gray-600 max-w-xs truncate" title={record.notes}>
                              📝 {record.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onRecordEdit?.(record)}
                            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => onRecordDelete?.(record.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}