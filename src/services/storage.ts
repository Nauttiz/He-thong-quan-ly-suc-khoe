import { Session, Student, HealthRecord } from '../types/interfaces';

const SESSIONS_KEY = 'bmi-tracker-sessions';
const STUDENTS_KEY = 'bmi-tracker-students';
const HEALTH_RECORDS_KEY = 'bmi-tracker-health-records';

export const storage = {
  getSessions: (): Session[] => {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSessions: (sessions: Session[]): void => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  },

  getStudents: (): Student[] => {
    try {
      const data = localStorage.getItem(STUDENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudents: (students: Student[]): void => {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (error) {
      console.error('Error saving students:', error);
    }
  },

  getHealthRecords: (): HealthRecord[] => {
    try {
      const data = localStorage.getItem(HEALTH_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHealthRecords: (records: HealthRecord[]): void => {
    try {
      localStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving health records:', error);
    }
  }
};