import React, { useState, useEffect } from 'react';
import { Session, Student, HealthRecord } from './types/interfaces';
import { useFirestoreData } from './hooks/useFirestoreData';
import { studentsService, healthRecordsService, sessionsService } from './services/firestoreService';

import { db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';

// Session Management
import CreateSession from './components/SessionManagement/CreateSession';
import SessionList from './components/SessionManagement/SessionList';
import SessionSelector from './components/SessionManagement/SessionSelector';

// Student Management
import StudentForm from './components/StudentManagement/StudentForm';
import StudentList from './components/StudentManagement/StudentList';
import ExcelImport from './components/StudentManagement/ExcelImport';

// BMI Calculation
import BMIForm from './components/BMICalculation/BMIForm';
import HealthRecordsList from './components/BMICalculation/HealthRecordsList';

import './App.css';

type ActiveTab = 'sessions' | 'students' | 'measurement' | 'records';

export default function App() {
  // Use Firestore data instead of localStorage
  const { 
    sessions, 
    students, 
    healthRecords, 
    setSessions, 
    setStudents, 
    setHealthRecords, 
    loading, 
    error 
  } = useFirestoreData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  // Test Firebase connection
  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('🔥 Testing Firebase connection...');
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        console.log('✅ Firebase Firestore connected successfully!');
      } catch (error) {
        console.error('❌ Firebase connection failed:', error);
      }
    };
    
    testFirebase();
  }, []);

  // Session handlers - updated to use Firestore
  const handleSessionCreated = async (sessionData: Omit<Session, 'id'>) => {
  try {
    console.log('📝 App: Creating session with data:', sessionData);
    
    const newId = await sessionsService.add(sessionData);
    const newSession: Session = { ...sessionData, id: newId };
    
    setSessions(prev => [...prev, newSession]);
    setSelectedSession(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    alert('Có lỗi khi tạo phiên đo!');
  }
};

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setActiveTab('students');
  };

  const handleSessionUpdate = async (updatedSession: Session) => {
    try {
      await sessionsService.update(updatedSession.id, updatedSession);
      setSessions(prev =>
        prev.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      if (selectedSession?.id === updatedSession.id) {
        setSelectedSession(updatedSession);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Có lỗi khi cập nhật phiên đo!');
    }
  };

  const handleSessionDelete = async (sessionId: string): Promise<void> => {
  try {
    console.log('🗑️ App: Starting session deletion:', sessionId);
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // Find related data
    const relatedStudents = students.filter(s => 
      s.sessionId === sessionId || // if students have sessionId
      !s.sessionId // or if no sessionId field, delete all students
    );
    
    const relatedRecords = healthRecords.filter(r => r.sessionId === sessionId);
    
    console.log(`Found ${relatedStudents.length} students and ${relatedRecords.length} records to delete`);
    
    // Delete related health records first
    if (relatedRecords.length > 0) {
      console.log('🗑️ Deleting health records...');
      for (const record of relatedRecords) {
        if (record.id) { // ← FIX: Check if record.id exists
          try {
            await healthRecordsService.delete(record.id);
            console.log(`✅ Deleted health record: ${record.id}`);
          } catch (error) {
            console.error(`❌ Failed to delete health record ${record.id}:`, error);
          }
        } else {
          console.warn('⚠️ Skipping record without ID:', record);
        }
      }
    }
    
    // Delete related students
    if (relatedStudents.length > 0) {
      console.log('🗑️ Deleting students...');
      for (const student of relatedStudents) {
        if (student.id) { // ← FIX: Check if student.id exists
          try {
            await studentsService.delete(student.id);
            console.log(`✅ Deleted student: ${student.id}`);
          } catch (error) {
            console.error(`❌ Failed to delete student ${student.id}:`, error);
          }
        } else {
          console.warn('⚠️ Skipping student without ID:', student);
        }
      }
    }
    
    // Delete session
    console.log('🗑️ Deleting session...');
    await sessionsService.delete(sessionId);
    console.log('✅ Deleted session');
    
    // Update local state
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setStudents(prev => prev.filter(s => 
      s.sessionId !== sessionId && s.sessionId !== undefined
    ));
    setHealthRecords(prev => prev.filter(r => r.sessionId !== sessionId));
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
    
    alert(`✅ Đã xóa phiên đo và ${relatedStudents.length + relatedRecords.length} bản ghi liên quan!`);
    
  } catch (error) {
    console.error('❌ Error deleting session:', error);
    throw error; // ← ADD: Re-throw for SessionList error handling
  }
};

  // Student handlers - updated to use Firestore
const handleStudentCreated = async (studentData: Omit<Student, 'id'>) => {
  try {
    console.log('📝 App: Creating student with data:', studentData);
    
    const newId = await studentsService.add(studentData);
    console.log('✅ App: Student created with ID:', newId);
    
    const newStudent: Student = { 
      ...studentData, 
      id: newId 
    };
    
    setStudents(prev => [...prev, newStudent]);
    console.log('✅ App: Student added to state:', newStudent);
    
  } catch (error) {
    console.error('❌ App: Error creating student:', error);
    alert('Có lỗi khi tạo học sinh!');
  }
};

  const handleStudentsImported = async (importedStudents: Omit<Student, 'id'>[]) => {
  try {
    console.log('📝 App: Importing students:', importedStudents.length);
    
    // Use Promise.all for better performance
    const addPromises = importedStudents.map(studentData => 
      studentsService.add(studentData).then(newId => ({ 
        ...studentData, 
        id: newId 
      }))
    );
    const newStudents = await Promise.all(addPromises);
    
    setStudents(prev => [...prev, ...newStudents]);
    alert(`Đã import thành công ${importedStudents.length} học sinh!`);
  } catch (error) {
    console.error('Error importing students:', error);
    alert('Có lỗi khi import học sinh!');
  }
};

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('measurement');
  };

  const handleStudentUpdate = async (updatedStudent: Student) => {
    try {
      await studentsService.update(updatedStudent.id, updatedStudent);
      setStudents(prev =>
        prev.map(student =>
          student.id === updatedStudent.id ? updatedStudent : student
        )
      );
      if (selectedStudent?.id === updatedStudent.id) {
        setSelectedStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Có lỗi khi cập nhật học sinh!');
    }
  };

  const handleStudentDelete = async (studentId: string): Promise<void> => { // ← ADD: Promise<void>
  try {
    console.log('🗑️ App: Deleting student and related records:', studentId);
    
    // Delete related health records first
    const relatedRecords = healthRecords.filter(r => r.studentId === studentId);
    
    if (relatedRecords.length > 0) {
      const deleteRecordPromises = relatedRecords.map(record => 
        healthRecordsService.delete(record.id)
      );
      await Promise.all(deleteRecordPromises);
      console.log(`✅ Deleted ${relatedRecords.length} related health records`);
    }
    
    // Delete student
    await studentsService.delete(studentId);
    console.log('✅ Deleted student');
    
    // Update local state
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setHealthRecords(prev => prev.filter(r => r.studentId !== studentId));
    
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
    
  } catch (error) {
    console.error('❌ App: Error deleting student:', error);
    throw error; // ← ADD: throw for proper error handling
  }
};

  // Tìm function handleDeleteAllStudents và sửa như sau:

const handleDeleteAllStudents = async (): Promise<void> => {
  try {
    console.log('🗑️ Starting bulk delete of students...');
    
    const validStudentIds = students
      .filter(student => student.id && student.id.trim() !== '')
      .map(student => student.id);
    
    console.log('🗑️ Valid student IDs to delete:', validStudentIds.length);
    
    if (validStudentIds.length === 0) {
      console.log('⚠️ No valid students to delete');
      return;
    }

    // Delete from Firestore
    await studentsService.deleteAll(validStudentIds);
    
    // ← FIX: Update local state directly instead of calling non-existent function
    setStudents([]); // Clear all students from local state
    
    // Also clear related health records
    setHealthRecords(prev => prev.filter(record => 
      !validStudentIds.includes(record.studentId)
    ));
    
    // Clear selected student if it was deleted
    if (selectedStudent && validStudentIds.includes(selectedStudent.id)) {
      setSelectedStudent(null);
    }
    
    console.log('✅ All students deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting all students:', error);
    throw error;
  }
};

  // Health record handlers - updated to use Firestore
  const handleHealthRecordCreated = async (recordData: Omit<HealthRecord, 'id'>) => {
  try {
    if (editingRecord) {
      // Update existing record
      await healthRecordsService.update(editingRecord.id, recordData);
      const updatedRecord = { ...recordData, id: editingRecord.id };
      setHealthRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
      setEditingRecord(null);
      alert('Đã cập nhật kết quả đo thành công!');
    } else {
      // Create new record
      const newId = await healthRecordsService.add(recordData);
      const newRecord = { ...recordData, id: newId };
      setHealthRecords(prev => [...prev, newRecord]);
      alert('Đã lưu kết quả đo thành công!');
    }
  } catch (error) {
    console.error('Error saving health record:', error);
    alert('Có lỗi khi lưu kết quả đo!');
  }
};

  const handleEditRecord = (record: HealthRecord) => {
    setEditingRecord(record);

    // Tìm student tương ứng và set selected
    const student = students.find(s => s.id === record.studentId);
    if (student) {
      setSelectedStudent(student);
    }

    // Tìm session tương ứng và set selected
    const session = sessions.find(s => s.id === record.sessionId);
    if (session) {
      setSelectedSession(session);
    }

    // Chuyển về tab measurement để edit
    setActiveTab('measurement');
  };

  const handleRecordDelete = async (recordId: string): Promise<void> => { // ← ADD: Promise<void>
  try {
    console.log('🗑️ App: Deleting health record:', recordId);
    
    await healthRecordsService.delete(recordId); // ← ADD: await
    setHealthRecords(prev => prev.filter(r => r.id !== recordId));
    
    console.log('✅ App: Health record deleted successfully');
  } catch (error) {
    console.error('❌ App: Error deleting health record:', error);
    throw error; // ← ADD: throw for proper error handling
  }
};

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải dữ liệu...</h2>
          <p className="text-gray-500">Kết nối với Firebase...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Navigation tabs
  const tabs = [
    { id: 'sessions' as ActiveTab, name: 'Quản lý phiên', icon: '📋', count: sessions.length },
    { id: 'students' as ActiveTab, name: 'Quản lý học sinh', icon: '👥', count: students.length },
    { id: 'measurement' as ActiveTab, name: 'Đo chỉ số', icon: '📏', disabled: !selectedSession || !selectedStudent },
    { id: 'records' as ActiveTab, name: 'Kết quả đo', icon: '📊', count: healthRecords.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                🔥 Hệ Thống Quản Lý Sức Khỏe (Firebase)
              </h1>
              <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                v2.0
              </span>
            </div>

            {/* Quick Info */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              {selectedSession && (
                <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700">
                  📋 {selectedSession.name}
                </div>
              )}
              {selectedStudent && (
                <div className="bg-green-50 px-3 py-1 rounded-full text-green-700">
                  👤 {selectedStudent.name}
                </div>
              )}
              {editingRecord && (
                <div className="bg-yellow-50 px-3 py-1 rounded-full text-yellow-700">
                  ✏️ Đang chỉnh sửa
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (!tab.disabled) {
                    // Reset editing khi chuyển tab
                    if (tab.id !== 'measurement') {
                      setEditingRecord(null);
                    }
                    setActiveTab(tab.id);
                  }
                }}
                disabled={tab.disabled}
                className={`flex items-center px-4 lg:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Session Management Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateSession onSessionCreated={handleSessionCreated} />
              <SessionList
                sessions={sessions}
                onSessionSelect={handleSessionSelect}
                onSessionDelete={handleSessionDelete}
                onSessionUpdate={handleSessionUpdate}
                selectedSession={selectedSession}
              />
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Chào mừng đến với hệ thống Firebase!</h3>
                <p className="text-gray-500">Bắt đầu bằng cách tạo phiên nhập liệu đầu tiên của bạn.</p>
              </div>
            )}
          </div>
        )}

        {/* Student Management Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {!selectedSession ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa chọn phiên đo</h3>
                <p className="text-gray-500 mb-4">Vui lòng chọn hoặc tạo phiên đo trước khi quản lý học sinh.</p>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Quay về quản lý phiên
                </button>
              </div>
            ) : (
              <>
                {/* Session Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-medium text-blue-900 mb-1">Phiên hiện tại:</h3>
                  <p className="text-blue-700">{selectedSession.name} - {selectedSession.school}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-1 space-y-6">
                    <StudentForm onStudentCreated={handleStudentCreated} />
                    <ExcelImport onStudentsImported={handleStudentsImported} />
                  </div>
                  <div className="xl:col-span-2">
                    <StudentList
                      students={students}
                      onStudentSelect={handleStudentSelect} 
                      onStudentDelete={handleStudentDelete}
                      onStudentUpdate={handleStudentUpdate}
                      onDeleteAllStudents={handleDeleteAllStudents}
                      selectedStudentId={selectedStudent?.id}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* BMI Measurement Tab */}
        {activeTab === 'measurement' && (
          <div className="space-y-6">
            {!selectedSession || !selectedStudent ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📏</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa đủ thông tin để đo</h3>
                <div className="text-gray-500 space-y-2">
                  {!selectedSession && <p>❌ Chưa chọn phiên đo</p>}
                  {!selectedStudent && <p>❌ Chưa chọn học sinh</p>}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  {!selectedSession && (
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Chọn phiên đo
                    </button>
                  )}
                  {!selectedStudent && selectedSession && (
                    <button
                      onClick={() => setActiveTab('students')}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Chọn học sinh
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Current Selection Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-medium text-blue-900 mb-1">Phiên đo:</h3>
                    <p className="text-blue-700">{selectedSession.name}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-medium text-green-900 mb-1">Học sinh:</h3>
                    <p className="text-green-700">
                      {selectedStudent.name} - Lớp {selectedStudent.class} -
                      {selectedStudent.gender === 'male' ? ' Nam' : ' Nữ'}
                    </p>
                  </div>
                </div>

                {editingRecord && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="font-medium text-yellow-900 mb-1">✏️ Đang chỉnh sửa kết quả đo:</h3>
                    <p className="text-yellow-700">
                      BMI: {editingRecord.bmi} - Ngày đo: {new Date(editingRecord.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="mt-2 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-lg transition-colors"
                    >
                      Hủy chỉnh sửa
                    </button>
                  </div>
                )}

                {/* BMI Form */}
                <BMIForm
                  selectedSession={selectedSession}
                  selectedStudent={selectedStudent}
                  onHealthRecordCreated={handleHealthRecordCreated}
                  editingRecord={editingRecord}
                />
              </>
            )}
          </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Session Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-medium">Lọc theo phiên đo:</h3>
                <div className="sm:w-80">
                  <SessionSelector
                    sessions={sessions}
                    selectedSession={selectedSession}
                    onSessionSelect={setSelectedSession}
                    placeholder="Chọn phiên để lọc kết quả..."
                  />
                </div>
              </div>
            </div>

            {/* Health Records List */}
            <HealthRecordsList
              records={healthRecords}
              students={students}
              sessions={sessions}
              onRecordEdit={handleEditRecord}
              onRecordDelete={handleRecordDelete}
              selectedSessionId={selectedSession?.id}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>© 2025 Hệ thống quản lý sức khỏe - Ứng dụng theo dõi sức khỏe học sinh (Firebase Version)</p>
            <p className="text-sm mt-1">Phiên bản 2.0 - Powered by Firebase Firestore</p>
          </div>
        </div>
      </footer>
    </div>
  );
}