
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth } from './firebase';
// Fix: Use v8 syntax for auth types and methods by importing the firebase app object.
import firebase from 'firebase/app';
import 'firebase/auth'; // Import for side effects to augment firebase.User type

interface AuthContextType {
  // Fix: Use firebase.User type from v8 SDK
  currentUser: firebase.User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fix: Use firebase.User type from v8 SDK
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
