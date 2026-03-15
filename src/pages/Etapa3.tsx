import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateShiftSelector, { DayShiftSelection } from '../components/DateShiftSelector';

const DATES = ['02/04 - quinta-feira'];
const SHIFTS = ['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'];

export default function Etapa3() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selections, setSelections] = useState<DayShiftSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const docRef = doc(db, 'registrations', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().etapa3) {
          setSelectedOption(docSnap.data().etapa3.option || '');
          setSelections(docSnap.data().etapa3.selections || []);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleNext = async () => {
    if (!selectedOption) return;
    
    if (user) {
      await setDoc(doc(db, 'registrations', user.uid), {
        etapa3: { 
          option: selectedOption,
          selections: selections
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    navigate('/etapa4');
  };

  const options = [
    'Estarei presente!',
    'Não conseguirei participar'
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center justify-center font-sans text-zinc-900">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-zinc-100 max-w-2xl w-full"
      >
        <div className="mb-8">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            Etapa 3
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">
            Ajustes gerais e finalização
          </h1>
        </div>

        <div className="space-y-6 text-zinc-600 leading-relaxed mb-10 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
          <p>
            Esta etapa acontecerá no dia <strong>02/04 das 8h30 às 14h30</strong>, no prédio da Por Amor.
          </p>
          <p>
            É o momento de ajustes gerais e finalização antes da montagem oficial.
          </p>
        </div>

        <div className="space-y-6">
          <p className="font-medium text-lg text-zinc-800">Caso tenha disponibilidade para a etapa 3, confirme sua presença:</p>
          
          <div className="space-y-3">
            {options.map((option) => (
              <label 
                key={option} 
                className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedOption === option 
                    ? 'border-indigo-500 bg-indigo-50/30' 
                    : 'border-transparent bg-zinc-50 hover:bg-zinc-100'
                }`}
              >
                <input
                  type="radio"
                  name="etapa3"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    if (e.target.value === 'Não conseguirei participar') {
                      setSelections([]);
                    }
                  }}
                  className="w-5 h-5 text-indigo-600 border-zinc-300 focus:ring-indigo-500"
                />
                <span className="ml-4 font-medium text-zinc-800">{option}</span>
              </label>
            ))}
          </div>

          {selectedOption === 'Estarei presente!' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8"
            >
              <h3 className="text-lg font-medium text-zinc-800 mb-4">
                Qual horário você pode participar?
              </h3>
              <DateShiftSelector 
                dates={DATES} 
                shifts={SHIFTS} 
                selections={selections} 
                onChange={setSelections} 
              />
            </motion.div>
          )}

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => navigate('/etapa2')}
              className="w-1/3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium py-4 px-6 rounded-2xl transition-all text-lg"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedOption || (selectedOption === 'Estarei presente!' && selections.length === 0)}
              className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg"
            >
              Próxima Etapa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
