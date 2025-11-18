import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth } from './firebase.js';
// Fix: Use a type-only import for Firebase types to avoid runtime module issues.
import type firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Import for side effects to augment firebase.User type

interface AuthContextType {
  // Use the imported firebase type for the User object.
  currentUser: firebase.User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the imported firebase type for the User object.
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Use onAuthStateChanged as a method on the auth object (v8 syntax)
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};