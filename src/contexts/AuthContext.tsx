import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'pending' | 'customer' | 'admin';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // New accounts start as 'pending' — an admin must approve them
    // (change role to 'customer') before they can access any data.
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      role: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (unsubscribeRole) {
        unsubscribeRole();
        unsubscribeRole = undefined;
      }

      if (user) {
        // Watch the user's role document so approval by an admin
        // takes effect without needing to sign out and back in.
        unsubscribeRole = onSnapshot(
          doc(db, 'users', user.uid),
          (snap) => {
            setRole(snap.exists() ? ((snap.data().role as UserRole) || 'pending') : 'pending');
            setLoading(false);
          },
          (error) => {
            console.error('❌ Error loading user role:', error);
            setRole('pending');
            setLoading(false);
          }
        );
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    role,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
