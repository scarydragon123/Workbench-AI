import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth } from './firebase';
// FIX: Use Firebase v8 compatible API. `User` is now a type on the `firebase` namespace, and `onAuthStateChanged` is a method on the `auth` object.
import firebase from 'firebase/app';

interface AuthContextType {
  // FIX: Use the User type from the firebase namespace.
  currentUser: firebase.User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIX: Use the User type from the firebase namespace.
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use the onAuthStateChanged method from the auth object.
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
