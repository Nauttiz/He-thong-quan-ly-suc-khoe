import React, { useState } from 'react';
import { Session } from '../../types/interfaces';

interface CreateSessionProps {
  onSessionCreated?: (session: Session) => void;
}

export default function CreateSession({ onSessionCreated }: CreateSessionProps) {
  const [session, setSession] = useState({
    code: '',
    name: '',
    school: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSession: Session = {
      id: crypto.randomUUID(),
      code: session.code,
      name: session.name,
      school: session.school,
      date: new Date(session.date).toISOString(),
      createdAt: new Date().toISOString()
    };

    onSessionCreated?.(newSession);

    setSession({
      code: '',
      name: '',
      school: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Tạo phiên nhập liệu mới</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Mã phiên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mã phiên *</label>
          <input
            type="text"
            value={session.code}
            onChange={(e) => setSession(s => ({...s, code: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: P001, BMI2025_Q1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Mã định danh duy nhất cho phiên đo</p>
        </div>

        {/* Tên phiên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên phiên *</label>
          <input
            type="text"
            value={session.name}
            onChange={(e) => setSession(s => ({...s, name: e.target.value}))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Đo BMI Học kỳ 1 năm 2025"
            required
          />
        </div>

        {/* Grid cho desktop, stack cho mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Trường */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trường *</label>
            <input
              type="text"
              value={session.school}
              onChange={(e) => setSession(s => ({...s, school: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Trường THCS Nguyễn Huệ"
              required
            />
          </div>

          {/* Ngày đo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày đo *</label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => setSession(s => ({...s, date: e.target.value}))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Submit button - Lớn hơn trên mobile */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 lg:py-3 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-base lg:text-sm shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center">
            <span className="mr-2">🆕</span>
            Tạo phiên nhập liệu
          </span>
        </button>
      </form>
    </div>
  );
}