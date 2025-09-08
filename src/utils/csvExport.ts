import { HealthRecord, Student, Session } from '../types/interfaces';
import { getZScoreSimpleName } from './whoZScoreData';

interface ExportData {
  records: HealthRecord[];
  students: Student[];
  sessions: Session[];
}

export function exportToCsv(data: ExportData, sessionId?: string) {
  const { records, students, sessions } = data;
  
  // Filter records by session if specified
  const filteredRecords = sessionId 
    ? records.filter(record => record.sessionId === sessionId)
    : records;

  // Get session info
  const session = sessionId 
    ? sessions.find(s => s.id === sessionId)
    : null;

  // Prepare CSV headers
  const headers = [
    'STT',
    'Họ và tên',
    'Lớp',
    'Giới tính',
    'Năm sinh',
    'Tuổi',
    'Chiều cao (cm)',
    'Cân nặng (kg)',
    'BMI',
    'Z-Score',
    'Phân loại WHO',
    'Vòng eo (cm)',
    'Huyết áp tâm thu',
    'Huyết áp tâm trương',
    'BMR (cal/ngày)',
    'Ghi chú',
    'Ngày đo',
    'Thời gian tạo'
  ];

  // Prepare CSV data
  const csvRows = filteredRecords.map((record, index) => {
    const student = students.find(s => s.id === record.studentId);
    const currentYear = new Date().getFullYear();
    const age = student ? currentYear - student.birthYear : 0;
    
    return [
      index + 1,
      `"${record.studentName || ''}"`,
      `"${record.studentClass || student?.class || ''}"`,
      student?.gender === 'male' ? 'Nam' : 'Nữ',
      student?.birthYear || '',
      age,
      record.height,
      record.weight,
      record.bmi,
      record.zScore || '',
      `"${record.zScore ? getZScoreSimpleName(record.zScore) : ''}"`,
      record.waist || '',
      record.bloodPressure?.systolic || '',
      record.bloodPressure?.diastolic || '',
      record.bmr || '',
      `"${record.notes || ''}"`,
      record.date,
      `"${new Date(record.createdAt).toLocaleString('vi-VN')}"`
    ];
  });

  // Combine headers and data
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for proper Vietnamese display in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  // Create and download file
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = session 
      ? `${session.name}_${currentDate}.csv`
      : `KetQuaDo_${currentDate}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      filename,
      recordCount: filteredRecords.length
    };
  }
  
  return {
    success: false,
    filename: '',
    recordCount: 0
  };
}

// Create summary data as separate CSV
export function exportSummaryToCsv(data: ExportData, sessionId?: string) {
  const { records, students } = data;
  
  const filteredRecords = sessionId 
    ? records.filter(record => record.sessionId === sessionId)
    : records;

  const total = filteredRecords.length;
  
  // Count by Z-Score categories
  const zScoreCounts: { [key: string]: number } = {
    '-3SD': 0,
    '-2SD': 0, 
    '-1SD': 0,
    'Trung bình': 0,
    '+1SD': 0,
    '+2SD': 0,
    '+3SD': 0
  };

  filteredRecords.forEach(record => {
    if (record.zScore !== undefined && record.zScore !== null) {
      const category = getZScoreSimpleName(record.zScore);
      if (category in zScoreCounts) {
        zScoreCounts[category]++;
      }
    }
  });

  // Count by gender
  const genderCounts = { male: 0, female: 0 };
  filteredRecords.forEach(record => {
    const student = students.find(s => s.id === record.studentId);
    if (student) {
      genderCounts[student.gender]++;
    }
  });

  const summaryRows = [
    ['Chỉ số', 'Giá trị', 'Tỷ lệ (%)'],
    [`"Tổng số lần đo"`, total, '100%'],
    ['', '', ''],
    [`"PHÂN LOẠI THEO WHO Z-SCORE"`, '', ''],
    ...Object.entries(zScoreCounts).map(([category, count]) => [
      `"${category}"`,
      count,
      total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%'
    ]),
    ['', '', ''],
    [`"PHÂN LOẠI THEO GIỚI TÍNH"`, '', ''],
    [`"Nam"`, genderCounts.male, total > 0 ? `${((genderCounts.male / total) * 100).toFixed(1)}%` : '0%'],
    [`"Nữ"`, genderCounts.female, total > 0 ? `${((genderCounts.female / total) * 100).toFixed(1)}%` : '0%']
  ];

  const csvContent = summaryRows.map(row => row.join(',')).join('\n');
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `ThongKe_${currentDate}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      filename,
      recordCount: total
    };
  }
  
  return {
    success: false,
    filename: '',
    recordCount: 0
  };
}