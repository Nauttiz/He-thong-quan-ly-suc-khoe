import React, { useState } from 'react';
import { Session } from '../../types/interfaces';

interface SessionSelectorProps {
  sessions: Session[];
  selectedSession: Session | null;
  onSessionSelect: (session: Session | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SessionSelector({ 
  sessions, 
  selectedSession, 
  onSessionSelect, 
  placeholder = "Chọn phiên đo...",
  disabled = false 
}: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (session: Session) => {
    onSessionSelect(session);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSessionSelect(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 lg:py-2 text-left bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
          disabled 
            ? 'bg-gray-50 cursor-not-allowed border-gray-200' 
            : 'hover:border-gray-400 cursor-pointer active:bg-gray-50'
        } ${selectedSession ? 'border-blue-300 shadow-sm' : 'border-gray-300'}`}
      >
        <div className="flex-1 min-w-0">
          {selectedSession ? (
            <div>
              <div className="font-medium text-base lg:text-sm truncate text-gray-900">
                {selectedSession.name}
              </div>
              <div className="text-sm lg:text-xs text-gray-500 truncate">
                #{selectedSession.code} • {selectedSession.school}
              </div>
            </div>
          ) : (
            <span className="text-gray-500 text-base lg:text-sm">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          {selectedSession && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm phiên..."
              className="w-full px-4 py-3 lg:py-2 text-base lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>{searchTerm ? 'Không tìm thấy phiên phù hợp' : 'Chưa có phiên đo nào'}</p>
              </div>
            ) : (
              filteredSessions.map(session => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelect(session)}
                  className={`w-full px-4 py-4 lg:py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedSession?.id === session.id ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <div className="font-medium text-base lg:text-sm">{session.name}</div>
                  <div className="text-sm lg:text-xs text-gray-500 mt-1">
                    #{session.code} • {session.school} • {new Date(session.date).toLocaleDateString('vi-VN')}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}