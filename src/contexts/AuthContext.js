// src/contexts/AuthContext.js
// --- VERSIÓN SIMPLE Y ESTABLE ---
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Inicia cargando

  useEffect(() => {
    // 1. Obtener la sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // <-- Importante: siempre termina de cargar
    });

    // 2. Escuchar cambios (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false); // <-- Importante: termina de cargar si hay cambio
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 3. Funciones expuestas
  const value = {
    session, // <-- Solo exponemos la sesión
    signIn: (email, password) => 
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  // Solo muestra la app cuando 'loading' es false
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}