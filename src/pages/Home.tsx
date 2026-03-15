import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const { user, userData } = useAuth();
  const [name, setName] = useState(userData?.name || '');
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!name.trim()) return;
    
    // Initialize registration doc
    if (user) {
      const regRef = doc(db, 'registrations', user.uid);
      const regSnap = await getDoc(regRef);
      
      if (!regSnap.exists()) {
        await setDoc(regRef, {
          userId: user.uid,
          name: name,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(regRef, {
          name: name,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      // Update user name if changed
      if (name !== userData?.name) {
        await setDoc(doc(db, 'users', user.uid), {
          name: name
        }, { merge: true });
      }
    }
    
    navigate('/etapa1');
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center justify-center font-sans text-zinc-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-zinc-100 max-w-2xl w-full"
      >
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            Mega Bazar - Abril
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900">
            De 11 a 19/04
          </h1>
        </div>

        <div className="space-y-6 text-lg text-zinc-600 leading-relaxed mb-10">
          <p>
            Olá, voluntários. O 1º Mega Bazar de 2026 está chegando e, para que este evento aconteça da melhor forma, temos um processo de organização que antecede esse momento e dividimos ele por etapas.
          </p>
          <p>
            Se você tem o desejo de colaborar neste processo, pedimos que leia atentamente cada tópico a seguir e responda de acordo com sua disponibilidade.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
              Nome e sobrenome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-900 placeholder:text-zinc-400"
            />
          </div>
          
          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg mt-4"
          >
            Começar
          </button>
          
          {(userData?.role === 'admin' || user?.email === 'feh.lucena@gmail.com') && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg mt-4"
            >
              Painel Administrativo
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
