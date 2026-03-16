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
    <div className="min-h-screen bg-[#F0EFEA] p-3 md:p-6 flex flex-col items-center font-sans text-[#1A1A1A]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-4 md:space-y-6 my-4 md:my-8"
      >
        {/* Header Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-t-8 border-t-[#E85D22]">
          <span className="inline-block bg-[#1A1A1A] text-white px-3 py-1 text-xs md:text-sm font-mono tracking-widest uppercase mb-4 md:mb-6">
            Mega Bazar Solidário
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6 text-[#1A1A1A] leading-none">
            De 11 a 19/04
          </h1>
          <div className="space-y-4 text-base md:text-lg font-medium text-[#1A1A1A]/80 leading-relaxed">
            <p>
              Olá, voluntários. O 1º Mega Bazar de 2026 está chegando e, para que este evento aconteça da melhor forma, temos um processo de organização que antecede esse momento e dividimos ele por etapas.
            </p>
            <p>
              Se você tem o desejo de colaborar neste processo, pedimos que leia atentamente cada tópico a seguir e responda de acordo com sua disponibilidade.
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <label htmlFor="name" className="block text-base md:text-lg font-black text-[#1A1A1A] mb-4 uppercase tracking-wide">
            Nome e sobrenome
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-[#F0EFEA] border-2 border-[#1A1A1A] focus:ring-0 focus:border-[#E85D22] focus:bg-white outline-none transition-all text-[#1A1A1A] font-bold placeholder:text-[#1A1A1A]/40 placeholder:font-normal text-base md:text-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="flex-1 bg-[#E85D22] hover:bg-[#d14e18] disabled:bg-[#1A1A1A]/10 disabled:text-[#1A1A1A]/40 disabled:border-transparent disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 md:py-5 px-6 transition-all text-sm md:text-lg border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:shadow-none"
          >
            Começar
          </button>
          
          {(userData?.role === 'admin' || user?.email === 'feh.lucena@gmail.com' || user?.email === 'ceorganizabazar@gmail.com') && (
            <button
              onClick={() => navigate('/painelmegabazar')}
              className="flex-1 bg-[#1A1A1A] hover:bg-black text-white font-black uppercase tracking-widest py-4 md:py-5 px-6 transition-all text-sm md:text-lg border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              Painel Admin
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
