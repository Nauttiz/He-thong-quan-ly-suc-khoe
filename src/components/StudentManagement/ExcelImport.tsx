import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../../types/interfaces';

interface ExcelImportProps {
  onStudentsImported: (students: Student[]) => void;
}

interface ExcelRow {
  [key: string]: any;
}

export default function ExcelImport({ onStudentsImported }: ExcelImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Thêm success message
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download template function
  const downloadTemplate = () => {
    const template = [
      {
        'STT': 1,
        'Họ và tên': 'Nguyễn Văn An',
        'Lớp': '1A',
        'Giới tính': 'Nam',
        'Năm sinh': 2018,
        'Địa chỉ': 'Thôn 1, Vĩnh Trường, Vĩnh Linh, Quảng Trị'
      },
      {
        'STT': 2,
        'Họ và tên': 'Trần Thị Bích',
        'Lớp': '1A',
        'Giới tính': 'Nữ',
        'Năm sinh': 2018,
        'Địa chỉ': 'Thôn 2, Vĩnh Trường, Vĩnh Linh, Quảng Trị'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    
    worksheet['!cols'] = [
      { wch: 5 },   // STT
      { wch: 25 },  // Họ và tên
      { wch: 10 },  // Lớp
      { wch: 10 },  // Giới tính
      { wch: 12 },  // Năm sinh
      { wch: 40 }   // Địa chỉ
    ];

    XLSX.writeFile(workbook, 'Mau_DanhSach_HocSinh.xlsx');
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('File Excel phải có ít nhất 2 dòng (header + data)'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const parsedData = rows
            .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
            .map((row, index) => {
              const obj: ExcelRow = {};
              headers.forEach((header, colIndex) => {
                obj[header] = row[colIndex] || '';
              });
              return obj;
            });

          resolve(parsedData);
        } catch (error) {
          reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
        }
      };

      reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateAndNormalizeData = (rawData: ExcelRow[]): any[] => {
    const validatedData = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2;

      // Flexible column detection
      const nameField = Object.keys(row).find(key => 
        key.toLowerCase().includes('tên') || 
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('họ')
      );

      const classField = Object.keys(row).find(key => 
        key.toLowerCase().includes('lớp') || 
        key.toLowerCase().includes('class')
      );

      const genderField = Object.keys(row).find(key => 
        key.toLowerCase().includes('giới') || 
        key.toLowerCase().includes('gender') ||
        key.toLowerCase().includes('sex')
      );

      const birthYearField = Object.keys(row).find(key => 
        key.toLowerCase().includes('năm') || 
        key.toLowerCase().includes('birth') ||
        key.toLowerCase().includes('sinh')
      );

      const addressField = Object.keys(row).find(key => 
        key.toLowerCase().includes('địa chỉ') || 
        key.toLowerCase().includes('address') ||
        key.toLowerCase().includes('chỉ')
      );

      const name = nameField ? String(row[nameField]).trim() : '';
      const className = classField ? String(row[classField]).trim() : '';
      const genderStr = genderField ? String(row[genderField]).trim().toLowerCase() : '';
      const birthYear = birthYearField ? parseInt(String(row[birthYearField])) : 0;
      const address = addressField ? String(row[addressField]).trim() : '';

      // Validation
      if (!name) {
        errors.push(`Dòng ${rowNum}: Thiếu họ tên`);
        continue;
      }

      if (!className) {
        errors.push(`Dòng ${rowNum}: Thiếu lớp`);
        continue;
      }

      if (!genderStr || (!genderStr.includes('nam') && !genderStr.includes('nữ') && !genderStr.includes('male') && !genderStr.includes('female'))) {
        errors.push(`Dòng ${rowNum}: Giới tính phải là "Nam" hoặc "Nữ"`);
        continue;
      }

      if (!birthYear || birthYear < 2010 || birthYear > 2020) {
        errors.push(`Dòng ${rowNum}: Năm sinh không hợp lệ (2010-2020)`);
        continue;
      }

      const gender = genderStr.includes('nam') || genderStr.includes('male') ? 'Nam' : 'Nữ';

      validatedData.push({
        name,
        class: className,
        gender,
        birthYear,
        address: address || 'Chưa cập nhật'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Có ${errors.length} lỗi:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
    }

    return validatedData;
  };

  // Funct import trực tiếp không cần preview
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc CSV');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Parse Excel file
      const rawData = await parseExcelFile(file);
      
      if (rawData.length === 0) {
        throw new Error('File Excel không có dữ liệu');
      }

      // Validate and normalize
      const validatedData = validateAndNormalizeData(rawData);
      
      if (validatedData.length === 0) {
        throw new Error('Không có dữ liệu hợp lệ trong file');
      }

      // ← Import trực tiếp luôn
      const students: Student[] = validatedData.map(row => ({
        id: crypto.randomUUID(),
        name: row.name,
        class: row.class,
        gender: row.gender === 'Nam' ? 'male' : 'female',
        birthYear: row.birthYear,
        school: 'TH Vĩnh Trường',
        address: row.address,
        createdAt: new Date().toISOString()
      }));

      // Call parent function to import
      onStudentsImported(students);
      
      // Show success message
      setSuccessMessage(`✅ Import thành công ${students.length} học sinh!`);
      setIsProcessing(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Parse error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý file');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Import học sinh từ Excel</h2>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
        
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-lg">Đang import học sinh...</span>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">Kéo thả file Excel vào đây</p>
            <p className="text-gray-500 mb-4">hoặc</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Chọn file từ máy tính
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Hỗ trợ: .xlsx, .xls, .csv (tối đa 10MB)
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 whitespace-pre-line">❌ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-600 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Template Download */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h3 className="font-medium mb-2">📋 Mẫu file Excel:</h3>
        <p className="text-sm text-gray-600 mb-3">
          File Excel cần có các cột: <strong>Họ và tên, Lớp, Giới tính, Năm sinh, Địa chỉ</strong>
        </p>
        <button 
          onClick={downloadTemplate}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          📥 Tải mẫu Excel
        </button>
      </div>
    </div>
  );
}