/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Etapa1 from './pages/Etapa1';
import Etapa2 from './pages/Etapa2';
import Etapa3 from './pages/Etapa3';
import Etapa4 from './pages/Etapa4';
import Escala from './pages/Escala';
import Resumo from './pages/Resumo';
import Confirmation from './pages/Confirmation';
import Admin from './pages/Admin';
import { signInWithGoogle, signInWithoutGoogle, logout } from './firebase';
import { motion } from 'framer-motion';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [loginError, setLoginError] = React.useState('');

  const handleAnonymousLogin = async () => {
    try {
      setLoginError('');
      await signInWithoutGoogle();
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        setLoginError('O login anônimo não está ativado no Firebase. Ative-o no console do Firebase (Authentication > Sign-in method).');
      } else {
        setLoginError('Erro ao fazer login: ' + error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError('');
      await signInWithGoogle();
    } catch (error: any) {
      setLoginError('Erro ao fazer login com Google: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0EFEA] p-6 font-sans text-[#1A1A1A]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1A1A1A] mb-4 leading-none">
              Mega Bazar<br />Solidário
            </h1>
            <p className="text-lg font-mono text-[#1A1A1A]/70">
              Acesso ao sistema
            </p>
          </div>
          
          {loginError && (
            <div className="mb-6 p-4 bg-[#E85D22]/10 text-[#E85D22] text-sm font-mono border border-[#E85D22]/20 text-left">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold py-4 px-6 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#1A1A1A]/10"></div>
              </div>
              <div className="relative flex justify-center text-sm font-mono">
                <span className="px-4 bg-[#F0EFEA] text-[#1A1A1A]/50">ou</span>
              </div>
            </div>

            <button 
              onClick={handleAnonymousLogin}
              className="w-full bg-[#E85D22] hover:bg-[#d14e18] text-white font-bold py-4 px-6 transition-all"
            >
              Continuar sem Google
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;
  
  const isAdmin = userData?.role === 'admin' || user?.email === 'feh.lucena@gmail.com' || user?.email === 'ceorganizabazar@gmail.com';
  
  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/etapa1" element={<PrivateRoute><Etapa1 /></PrivateRoute>} />
          <Route path="/etapa2" element={<PrivateRoute><Etapa2 /></PrivateRoute>} />
          <Route path="/etapa3" element={<PrivateRoute><Etapa3 /></PrivateRoute>} />
          <Route path="/etapa4" element={<PrivateRoute><Etapa4 /></PrivateRoute>} />
          <Route path="/escala" element={<PrivateRoute><Escala /></PrivateRoute>} />
          <Route path="/resumo" element={<PrivateRoute><Resumo /></PrivateRoute>} />
          <Route path="/confirmacao" element={<PrivateRoute><Confirmation /></PrivateRoute>} />
          <Route path="/painelmegabazar" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
