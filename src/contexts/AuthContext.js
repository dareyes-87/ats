// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor (Provider)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en la autenticación (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup: Dejar de escuchar al desmontar el componente
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 3. Funciones para interactuar (login, logout)
  // Pasamos un objeto con las funciones que queremos exponer
  const value = {
    session,
    signIn: (email, password) => 
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  // Exponemos 'value' a todos los 'children' (hijos)
  // No mostramos nada hasta que sepamos si hay sesión o no
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Crear un "Hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}