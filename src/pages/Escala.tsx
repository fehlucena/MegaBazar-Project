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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center py-12 font-sans text-zinc-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-zinc-100 max-w-4xl w-full"
      >
        <div className="mb-8">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            Escala
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">
            Escala Mega Bazar
          </h1>
        </div>

        <div className="space-y-6 text-zinc-600 leading-relaxed mb-10 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
          <p>
            Este tópico é específico para os dias de evento. Aqui, formamos o nosso "time" que atuará no momento em que tudo estiver acontecendo.
          </p>
          <p>
            Para facilitar esse processo, nossa escala é construída por meio de <strong>SETORES</strong>. Além disso, separamos os horários em 2 turnos, garantindo que não haja sobrecarga para nenhum voluntário.
          </p>
        </div>

        <div className="space-y-12">
          {/* Weekends */}
          {WEEKEND_DAYS.map(date => (
            <motion.div 
              key={date} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-zinc-200 rounded-3xl p-6 md:p-8 bg-white shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-2 text-zinc-800">{date}</h2>
              <p className="text-zinc-500 mb-6 text-sm">
                Chegada voluntários: {date.includes('domingo') ? '8h' : '9h'} | Início do evento: {date.includes('domingo') ? '9h' : '10h'}
              </p>

              <label className={`flex items-center mb-6 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                notParticipating.includes(date) ? 'border-indigo-500 bg-indigo-50/30' : 'border-zinc-200 bg-zinc-50 hover:border-indigo-200'
              }`}>
                <input
                  type="checkbox"
                  checked={notParticipating.includes(date)}
                  onChange={() => toggleNotParticipating(date)}
                  className="w-5 h-5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-4 font-medium text-zinc-800">Não poderei comparecer neste dia</span>
              </label>

              <AnimatePresence>
                {!notParticipating.includes(date) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-8 overflow-hidden"
                  >
                    {SHIFTS.map(shift => (
                      <div key={shift}>
                        <h3 className="text-sm font-semibold mb-4 text-indigo-700 bg-indigo-50 inline-block px-4 py-1.5 rounded-full uppercase tracking-wide">{shift}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {SECTORS.map(sector => {
                            const full = isSlotFull(date, shift, sector);
                            const selected = isSelected(date, shift, sector);
                            const count = getSlotCount(date, shift, sector);
                            
                            return (
                              <button
                                key={sector}
                                onClick={() => toggleSlot(date, shift, sector)}
                                disabled={full && !selected}
                                className={`flex justify-between items-center p-4 rounded-2xl border-2 text-left transition-all ${
                                  selected 
                                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                                    : full 
                                      ? 'border-zinc-200 bg-zinc-100 opacity-60 cursor-not-allowed'
                                      : 'border-zinc-200 hover:border-indigo-300 bg-white'
                                }`}
                              >
                                <span className={`font-medium ${selected ? 'text-indigo-900' : 'text-zinc-700'}`}>{sector}</span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  selected ? 'bg-indigo-100 text-indigo-700' : full ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {full && !selected ? 'Esgotado' : `${count + (selected ? 1 : 0)}/${limits[sector] || 2}`}
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
            className="border border-zinc-200 rounded-3xl p-6 md:p-8 bg-white shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-2 text-zinc-800">Dias de Semana (13 a 17/04)</h2>
            <p className="text-zinc-500 mb-8 text-sm">Precisamos de, no mínimo, 2 voluntários por dia. Não há restrição de vagas.</p>
            
            <div className="space-y-6">
              {WEEKDAY_DAYS.map(date => (
                <div key={date} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <h3 className="text-lg font-semibold mb-4 text-zinc-800">{date}</h3>
                  
                  <label className={`flex items-center mb-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    notParticipating.includes(date) ? 'border-indigo-500 bg-indigo-50/30' : 'border-zinc-200 bg-white hover:border-indigo-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={notParticipating.includes(date)}
                      onChange={() => toggleNotParticipating(date)}
                      className="w-5 h-5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-4 font-medium text-zinc-800">Não poderei comparecer</span>
                  </label>

                  <AnimatePresence>
                    {!notParticipating.includes(date) && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => toggleSlot(date, WEEKDAY_SHIFT, 'Geral')}
                        className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                          isSelected(date, WEEKDAY_SHIFT, 'Geral')
                            ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                            : 'border-zinc-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <span className={`font-medium ${isSelected(date, WEEKDAY_SHIFT, 'Geral') ? 'text-indigo-900' : 'text-zinc-700'}`}>{WEEKDAY_SHIFT}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSelected(date, WEEKDAY_SHIFT, 'Geral') ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-600'
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
        </div>

        <div className="flex gap-4 mt-12">
          <button
            onClick={() => navigate('/etapa4')}
            className="w-1/3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium py-4 px-6 rounded-2xl transition-all text-lg"
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg"
          >
            Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
