export interface Session {
  id: string;
  code: string; // Mã phiên
  name: string;
  date: string;
  school: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  birthYear: number;
  class: string;
  school: string;
  address: string;
  gender: 'male' | 'female';
  createdAt: string;
  updatedAt?: string;
}

export interface HealthRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentClass?: string; 
  
  weight: number;
  height: number;
  waist?: number;
  heartRate?: number; // Nhịp tim
  bloodPressure?: {
    systolic: number; // Huyết áp tâm thu
    diastolic: number; // Huyết áp tâm trương
  };
  bmi: number;
  zScore?: number;
  bmr?: number;
  photoUrl?: string; // URL ảnh chụp
  notes?: string;
  date?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExcelStudentData {
  name: string;
  birthYear: number;
  class: string;
  school: string;
  address: string;
  gender: 'male' | 'female';
}

export interface ReportFilter {
  sessionId?: string;
  school?: string;
  class?: string;
  studentId?: string;
}