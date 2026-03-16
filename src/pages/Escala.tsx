import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface Slot {
  date: string;
  shift: string;
  sector: string;
}

const WEEKEND_DAYS = ['11/04 - sábado', '12/04 - domingo', '18/04 - sábado', '19/04 - domingo'];
const WEEKDAY_DAYS = ['13/04 - segunda', '14/04 - terça', '15/04 - quarta', '16/04 - quinta', '17/04 - sexta'];

const SHIFTS = ['Manhã (9h às 14h)', 'Tarde (14h às 20h)'];
const WEEKDAY_SHIFT = 'Integral (9h às 18h)';

export default function Escala() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notParticipating, setNotParticipating] = useState<string[]>([]);
  
  const [limits, setLimits] = useState<Record<string, number>>({
    'Feminino': 5,
    'Masculino': 2,
    'Calçados': 2,
    'Infantil': 2,
    'Cama, Mesa, Banho e Utilidades': 2
  });

  const SECTORS = Object.keys(limits);

  useEffect(() => {
    // Real-time listener for settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().limits) {
        setLimits(docSnap.data().limits);
      }
    });

    // Real-time listener for registrations
    const unsubRegs = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      const regs: any[] = [];
      snapshot.forEach((doc) => {
        regs.push({ id: doc.id, ...doc.data() });
      });
      setAllRegistrations(regs);
    });

    const loadUserData = async () => {
      if (user) {
        const docRef = doc(db, 'registrations', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().escala) {
          setSelectedSlots(docSnap.data().escala || []);
        }
        if (docSnap.exists() && docSnap.data().escalaNotParticipating) {
          setNotParticipating(docSnap.data().escalaNotParticipating || []);
        }
      }
      setLoading(false);
    };
    loadUserData();

    return () => {
      unsubSettings();
      unsubRegs();
    };
  }, [user]);

  const handleNext = async () => {
    if (user) {
      await setDoc(doc(db, 'registrations', user.uid), {
        escala: selectedSlots,
        escalaNotParticipating: notParticipating,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    navigate('/resumo');
  };

  const getSlotCount = (date: string, shift: string, sector: string) => {
    let count = 0;
    allRegistrations.forEach(reg => {
      if (reg.id !== user?.uid && reg.escala) {
        reg.escala.forEach((slot: Slot) => {
          if (slot.date === date && slot.shift === shift && slot.sector === sector) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const isSlotFull = (date: string, shift: string, sector: string) => {
    const limit = limits[sector] || 2;
    return getSlotCount(date, shift, sector) >= limit;
  };

  const isSelected = (date: string, shift: string, sector: string) => {
    return selectedSlots.some(s => s.date === date && s.shift === shift && s.sector === sector);
  };

  const toggleSlot = (date: string, shift: string, sector: string) => {
    if (isSlotFull(date, shift, sector) && !isSelected(date, shift, sector)) return;

    setSelectedSlots(prev => {
      if (isSelected(date, shift, sector)) {
        return prev.filter(s => !(s.date === date && s.shift === shift && s.sector === sector));
      } else {
        return [...prev, { date, shift, sector }];
      }
    });
    
    // Remove from notParticipating if they select a slot
    setNotParticipating(prev => prev.filter(d => d !== date));
  };

  const toggleNotParticipating = (date: string) => {
    setNotParticipating(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        // Remove any selected slots for this date
        setSelectedSlots(slots => slots.filter(s => s.date !== date));
        return [...prev, date];
      }
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;

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
            Escala
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-[#1A1A1A] leading-none">
            Escala Mega Bazar
          </h1>
          <div className="space-y-4 text-base md:text-lg font-medium text-[#1A1A1A]/80 leading-relaxed mt-6">
            <p>
              Este tópico é específico para os dias de evento. Aqui, formamos o nosso "time" que atuará no momento em que tudo estiver acontecendo.
            </p>
            <p>
              Para facilitar esse processo, nossa escala é construída por meio de <strong className="text-[#1A1A1A]">SETORES</strong>. Além disso, separamos os horários em 2 turnos, garantindo que não haja sobrecarga para nenhum voluntário.
            </p>
          </div>
        </div>

        {/* Weekends */}
        {WEEKEND_DAYS.map(date => (
          <motion.div 
            key={date} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-[#1A1A1A] uppercase tracking-wide">{date}</h2>
            <p className="text-[#E85D22] font-mono text-xs md:text-sm mb-6 md:mb-8">
              Chegada voluntários: {date.includes('domingo') ? '8h' : '9h'} | Início do evento: {date.includes('domingo') ? '9h' : '10h'}
            </p>

            <label className={`flex items-center mb-6 md:mb-8 p-4 md:p-5 cursor-pointer transition-all border-2 ${
              notParticipating.includes(date) ? 'border-[#E85D22] bg-[#E85D22]/10 shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
            }`}>
              <input
                type="checkbox"
                checked={notParticipating.includes(date)}
                onChange={() => toggleNotParticipating(date)}
                className="w-5 h-5 md:w-6 md:h-6 text-[#E85D22] border-2 border-[#1A1A1A] rounded-none focus:ring-[#E85D22] focus:ring-offset-0"
              />
              <span className="ml-3 md:ml-4 font-bold text-base md:text-lg text-[#1A1A1A]">Não poderei comparecer neste dia</span>
            </label>

            <AnimatePresence>
              {!notParticipating.includes(date) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-8 md:space-y-10 overflow-hidden"
                >
                  {SHIFTS.map(shift => (
                    <div key={shift}>
                      <h3 className="text-xs md:text-sm font-black mb-3 md:mb-4 text-[#1A1A1A] bg-[#F0EFEA] inline-block px-3 py-1 md:px-4 md:py-2 uppercase tracking-widest border-2 border-[#1A1A1A]">{shift}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {SECTORS.map(sector => {
                          const full = isSlotFull(date, shift, sector);
                          const selected = isSelected(date, shift, sector);
                          const count = getSlotCount(date, shift, sector);
                          
                          return (
                            <button
                              key={sector}
                              onClick={() => toggleSlot(date, shift, sector)}
                              disabled={full && !selected}
                              className={`flex justify-between items-center p-3 md:p-4 border-2 text-left transition-all ${
                                selected 
                                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' 
                                  : full 
                                    ? 'border-[#1A1A1A]/20 bg-[#F0EFEA] opacity-60 cursor-not-allowed text-[#1A1A1A]/50'
                                    : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-[#1A1A1A]'
                              }`}
                            >
                              <span className="font-bold text-sm md:text-base">{sector}</span>
                              <span className={`text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1 font-mono font-bold border-2 ${
                                selected ? 'bg-white text-[#1A1A1A] border-[#1A1A1A]' : full ? 'bg-transparent border-[#1A1A1A]/20' : 'bg-[#F0EFEA] border-[#1A1A1A]'
                              }`}>
                                {full && !selected ? 'ESGOTADO' : `${count + (selected ? 1 : 0)}/${limits[sector] || 2}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Weekdays */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"
        >
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-[#1A1A1A] uppercase tracking-wide">Dias de Semana (13 a 17/04)</h2>
          <p className="text-[#E85D22] font-mono text-xs md:text-sm mb-6 md:mb-8">Precisamos de, no mínimo, 2 voluntários por dia. Não há restrição de vagas.</p>
          
          <div className="space-y-6 md:space-y-8">
            {WEEKDAY_DAYS.map(date => (
              <div key={date} className="bg-[#F0EFEA] p-4 md:p-6 border-2 border-[#1A1A1A]">
                <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 text-[#1A1A1A] uppercase tracking-wide">{date}</h3>
                
                <label className={`flex items-center mb-4 md:mb-6 p-4 md:p-5 cursor-pointer transition-all border-2 ${
                  notParticipating.includes(date) ? 'border-[#E85D22] bg-[#E85D22]/10 shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
                }`}>
                  <input
                    type="checkbox"
                    checked={notParticipating.includes(date)}
                    onChange={() => toggleNotParticipating(date)}
                    className="w-5 h-5 md:w-6 md:h-6 text-[#E85D22] border-2 border-[#1A1A1A] rounded-none focus:ring-[#E85D22] focus:ring-offset-0"
                  />
                  <span className="ml-3 md:ml-4 font-bold text-base md:text-lg text-[#1A1A1A]">Não poderei comparecer</span>
                </label>

                <AnimatePresence>
                  {!notParticipating.includes(date) && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => toggleSlot(date, WEEKDAY_SHIFT, 'Geral')}
                      className={`w-full flex justify-between items-center p-4 md:p-5 border-2 text-left transition-all overflow-hidden ${
                        isSelected(date, WEEKDAY_SHIFT, 'Geral')
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' 
                          : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-[#1A1A1A]'
                      }`}
                    >
                      <span className="font-bold text-base md:text-lg">{WEEKDAY_SHIFT}</span>
                      <span className={`text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1 font-mono font-bold border-2 uppercase ${
                        isSelected(date, WEEKDAY_SHIFT, 'Geral') ? 'bg-white text-[#1A1A1A] border-[#1A1A1A]' : 'bg-[#F0EFEA] border-[#1A1A1A]'
                      }`}>
                        {isSelected(date, WEEKDAY_SHIFT, 'Geral') ? 'Selecionado' : 'Selecionar'}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-row gap-3 md:gap-4 pt-4">
          <button
            onClick={() => navigate('/etapa4')}
            className="flex-1 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base text-center"
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] bg-[#E85D22] hover:bg-[#d14e18] text-white font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center"
          >
            Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
