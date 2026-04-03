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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('📝 Creating session with data:', session);
      
      const newSession: Session = {
        id: '', // Will be set by Firestore
        code: session.code,
        name: session.name,
        school: session.school,
        date: session.date, // Keep as YYYY-MM-DD format
        createdAt: new Date().toISOString()
      };

      console.log('🚀 Calling onSessionCreated with:', newSession);
      await onSessionCreated?.(newSession);
      
      console.log('✅ Session created successfully');

      // Reset form
      setSession({
        code: '',
        name: '',
        school: '',
        date: new Date().toISOString().split('T')[0]
      });
      
    } catch (error) {
      console.error('❌ Error in CreateSession:', error);
      alert('Có lỗi khi tạo phiên: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit button - Lớn hơn trên mobile */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 lg:py-3 px-6 rounded-xl transition-colors font-medium text-base lg:text-sm shadow-lg hover:shadow-xl ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
          }`}
        >
          <span className="flex items-center justify-center">
            <span className="mr-2">{isSubmitting ? '⏳' : '🆕'}</span>
            {isSubmitting ? 'Đang tạo...' : 'Tạo phiên nhập liệu'}
          </span>
        </button>
      </form>
    </div>
  );
}