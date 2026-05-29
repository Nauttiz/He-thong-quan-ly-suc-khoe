import { render } from '@testing-library/react';
import App from './App';

// Mock Firebase so tests don't need a real Firebase project
jest.mock('./firebase/config', () => ({ auth: {}, db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock AuthContext so App can render without a real AuthProvider
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock Firestore hook so App doesn't trigger real Firestore calls
jest.mock('./hooks/useFirestoreData', () => ({
  useFirestoreData: () => ({
    sessions: [],
    students: [],
    healthRecords: [],
    setSessions: jest.fn(),
    setStudents: jest.fn(),
    setHealthRecords: jest.fn(),
    loading: false,
    error: null,
  }),
}));

test('renders without crashing', () => {
  render(<App />);
  expect(document.body).toBeTruthy();
});
