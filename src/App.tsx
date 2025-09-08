import React, { useState, useEffect } from 'react';
import { Session, Student, HealthRecord } from './types/interfaces';

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
  // State management
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedSessions = localStorage.getItem('bmi-sessions');
    const savedStudents = localStorage.getItem('bmi-students');
    const savedRecords = localStorage.getItem('bmi-records');

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedRecords) setHealthRecords(JSON.parse(savedRecords));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('bmi-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('bmi-students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bmi-records', JSON.stringify(healthRecords));
  }, [healthRecords]);

  // Session handlers
  const handleSessionCreated = (session: Session) => {
    setSessions(prev => [...prev, session]);
    setSelectedSession(session);
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setActiveTab('students');
  };

  const handleSessionDelete = (sessionId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa phiên này?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      // Xóa các records liên quan
      setHealthRecords(prev => prev.filter(r => r.sessionId !== sessionId));
    }
  };

  // ← THÊM HANDLER UPDATE SESSION
  const handleSessionUpdate = (updatedSession: Session) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );

    // Cập nhật selectedSession nếu đang chọn session này
    if (selectedSession?.id === updatedSession.id) {
      setSelectedSession(updatedSession);
    }
  };

  // Student handlers
  const handleStudentCreated = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleStudentsImported = (importedStudents: Student[]) => {
    setStudents(prev => [...prev, ...importedStudents]);
    alert(`Đã import thành công ${importedStudents.length} học sinh!`);
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('measurement');
  };

  const handleStudentDelete = (studentId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      // Xóa các records liên quan
      setHealthRecords(prev => prev.filter(r => r.studentId !== studentId));
    }
  };

  // ← THÊM HANDLER UPDATE STUDENT
  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );

    // Cập nhật selectedStudent nếu đang chọn student này
    if (selectedStudent?.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
  };

  // Health record handlers
  const handleHealthRecordCreated = (record: HealthRecord) => {
    if (editingRecord) {
      // Nếu đang edit, update record
      setHealthRecords(prev => prev.map(r => r.id === editingRecord.id ? record : r));
      setEditingRecord(null);
      alert('Đã cập nhật kết quả đo thành công!');
    } else {
      // Nếu tạo mới
      setHealthRecords(prev => [...prev, record]);
      alert('Đã lưu kết quả đo thành công!');
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

  const handleRecordDelete = (recordId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa kết quả đo này?')) {
      setHealthRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

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
                📊 Hệ Thống Quản Lý Sức Khỏe
              </h1>
              <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                v1.0
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
              {/* ← SỬA SESSIONLIST PROPS */}
              <SessionList
                sessions={sessions}
                onSessionSelect={handleSessionSelect}
                onSessionDelete={handleSessionDelete}
                onSessionUpdate={handleSessionUpdate} // 
                selectedSession={selectedSession} // 
              />
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Chào mừng đến với hệ thống!</h3>
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
                    {/* ← SỬA STUDENTLIST PROPS */}
                    <StudentList
                      students={students}
                      onStudentSelect={handleStudentSelect} 
                      onStudentDelete={handleStudentDelete}
                      onStudentUpdate={handleStudentUpdate}
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
            <p>© 2025 Hệ thống quản lý sức khỏe - Ứng dụng theo dõi sức khỏe học sinh</p>
            <p className="text-sm mt-1">Phiên bản 1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}