import { useState, useEffect } from 'react';
import { studentsService, healthRecordsService, sessionsService } from '../services/firestoreService';
import { Student, HealthRecord, Session } from '../types/interfaces';

export const useFirestoreData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionsData, studentsData, recordsData] = await Promise.all([
          sessionsService.getAll(),
          studentsService.getAll(),
          healthRecordsService.getAll()
        ]);

        setSessions(sessionsData);
        setStudents(studentsData);
        setHealthRecords(recordsData);

        console.log('✅ Firestore data loaded successfully');
      } catch (err) {
        console.error('❌ Error loading Firestore data:', err);
        setError('Failed to load data from Firestore');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    sessions,
    students, 
    healthRecords,
    setSessions,
    setStudents,
    setHealthRecords,
    loading,
    error
  };
};