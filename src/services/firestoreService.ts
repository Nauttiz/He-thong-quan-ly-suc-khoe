import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  writeBatch // Import writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Session, Student, HealthRecord } from '../types/interfaces';

// Helper function to clean undefined values
const cleanFirestoreData = (data: any) => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanFirestoreData(value);
        // Only add if nested object has properties
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

// Health Records Service
export const healthRecordsService = {
  async getAll(): Promise<HealthRecord[]> {
    try {
      console.log('🔥 Fetching health records from Firestore...');
      const recordsRef = collection(db, 'healthRecords');
      const q = query(recordsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const records = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as HealthRecord[];
      
      console.log(`✅ Fetched ${records.length} health records`);
      return records;
    } catch (error) {
      console.error('❌ Error fetching health records:', error);
      throw error;
    }
  },

  async add(record: Omit<HealthRecord, 'id'>): Promise<string> {
    try {
      console.log('🔥 Adding health record to Firestore...', record);
      
      // Clean undefined values before saving
      const cleanedRecord = cleanFirestoreData({
        ...record,
        createdAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned record data:', cleanedRecord);
      
      const recordsRef = collection(db, 'healthRecords');
      const docRef = await addDoc(recordsRef, cleanedRecord);
      
      console.log('✅ Health record added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding health record:', error);
      console.error('❌ Original record data:', record);
      throw error;
    }
  },

  async update(id: string, record: Partial<HealthRecord>): Promise<void> {
    try {
      console.log('🔥 Updating health record:', id, record);
      
      // Clean undefined values before updating
      const cleanedRecord = cleanFirestoreData({
        ...record,
        updatedAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned update data:', cleanedRecord);
      
      const recordRef = doc(db, 'healthRecords', id);
      await updateDoc(recordRef, cleanedRecord);
      
      console.log('✅ Health record updated successfully');
    } catch (error) {
      console.error('❌ Error updating health record:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid document ID provided');
      }
      
      console.log('🔥 Deleting health record:', id);
      const recordRef = doc(db, 'healthRecords', id);
      await deleteDoc(recordRef);
      
      console.log('✅ Health record deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting health record:', error);
      console.error('❌ Document ID was:', id);
      throw error;
    }
  }
};

// Sessions Service  
export const sessionsService = {
  async getAll(): Promise<Session[]> {
    try {
      console.log('🔥 Fetching sessions from Firestore...');
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const sessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Session[];
      
      console.log(`✅ Fetched ${sessions.length} sessions`);
      return sessions;
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      throw error;
    }
  },

  async add(session: Omit<Session, 'id'>): Promise<string> {
    try {
      console.log('🔥 Adding session to Firestore...', session);
      
      const cleanedSession = cleanFirestoreData({
        ...session,
        createdAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned session data:', cleanedSession);
      
      const sessionsRef = collection(db, 'sessions');
      const docRef = await addDoc(sessionsRef, cleanedSession);
      
      console.log('✅ Session added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding session:', error);
      throw error;
    }
  },

  async update(id: string, session: Partial<Session>): Promise<void> {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid session ID provided');
      }
      
      console.log('🔥 Updating session:', id, session);
      
      const cleanedSession = cleanFirestoreData({
        ...session,
        updatedAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned session update data:', cleanedSession);
      
      const sessionRef = doc(db, 'sessions', id);
      await updateDoc(sessionRef, cleanedSession);
      
      console.log('✅ Session updated successfully');
    } catch (error) {
      console.error('❌ Error updating session:', error);
      console.error('❌ Session ID was:', id);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid session ID provided');
      }
      
      console.log('🔥 Deleting session:', id);
      const sessionRef = doc(db, 'sessions', id);
      await deleteDoc(sessionRef);
      
      console.log('✅ Session deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      console.error('❌ Session ID was:', id);
      throw error;
    }
  }
};

// Students Service
export const studentsService = {
  async getAll(): Promise<Student[]> {
    try {
      console.log('🔥 Fetching students from Firestore...');
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const students = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Student[];
      
      console.log(`✅ Fetched ${students.length} students`);
      return students;
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      throw error;
    }
  },

  async add(student: Omit<Student, 'id'>): Promise<string> {
    try {
      console.log('🔥 Adding student to Firestore...', student);
      
      const cleanedStudent = cleanFirestoreData({
        ...student,
        createdAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned student data:', cleanedStudent);
      
      const studentsRef = collection(db, 'students');
      const docRef = await addDoc(studentsRef, cleanedStudent);
      
      console.log('✅ Student added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding student:', error);
      throw error;
    }
  },

  async update(id: string, student: Partial<Student>): Promise<void> {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid student ID provided');
      }
      
      console.log('🔥 Updating student:', id, student);
      
      const cleanedStudent = cleanFirestoreData({
        ...student,
        updatedAt: new Date().toISOString()
      });
      
      console.log('🧹 Cleaned student update data:', cleanedStudent);
      
      const studentRef = doc(db, 'students', id);
      await updateDoc(studentRef, cleanedStudent);
      
      console.log('✅ Student updated successfully');
    } catch (error) {
      console.error('❌ Error updating student:', error);
      console.error('❌ Student ID was:', id);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid student ID provided');
      }
      
      console.log('🔥 Deleting student:', id);
      const studentRef = doc(db, 'students', id);
      await deleteDoc(studentRef);
      
      console.log('✅ Student deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      console.error('❌ Student ID was:', id);
      throw error;
    }
  },

  // Bulk delete function
  async deleteAll(studentIds: string[]): Promise<void> {
    try {
      console.log('🔥 Starting bulk delete of students:', studentIds.length);
      
      // Filter valid IDs
      const validIds = studentIds.filter(id => id && typeof id === 'string' && id.trim() !== '');
      console.log('🔥 Valid IDs to delete:', validIds.length);
      
      if (validIds.length === 0) {
        console.log('⚠️ No valid student IDs to delete');
        return;
      }

      // Use batch for better performance and atomicity
      const batch = writeBatch(db);
      
      validIds.forEach(studentId => {
        const studentRef = doc(db, 'students', studentId);
        batch.delete(studentRef);
      });
      
      await batch.commit();
      console.log('✅ All students deleted successfully');
    } catch (error) {
      console.error('❌ Error in bulk delete:', error);
      throw error;
    }
  }
};

// Legacy export for backward compatibility
export const firestoreService = {
  // Students methods
  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    const id = await studentsService.add(studentData);
    return { id, ...studentData };
  },

  async getStudents(): Promise<Student[]> {
    return studentsService.getAll();
  },

  async updateStudent(student: Student): Promise<void> {
    const { id, ...updateData } = student;
    return studentsService.update(id, updateData);
  },

  async delete(studentId: string): Promise<void> {
    return studentsService.delete(studentId);
  },

  async deleteAllStudents(studentIds: string[]): Promise<void> {
    return studentsService.deleteAll(studentIds);
  }
};