import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateShiftSelector, { DayShiftSelection } from '../components/DateShiftSelector';

const DATES = [
  '23/03 - segunda',
  '24/03 - terça',
  '25/03 - quarta',
  '26/03 - quinta',
  '27/03 - sexta'
];
const SHIFTS = ['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'];

export default function Etapa2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selections, setSelections] = useState<DayShiftSelection[]>([]);
  const [notParticipating, setNotParticipating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const docRef = doc(db, 'registrations', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().etapa2) {
          const data = docSnap.data().etapa2;
          if (data.notParticipating) {
            setNotParticipating(true);
          } else {
            setSelections(data.selections || []);
          }
        }
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleNext = async () => {
    if (user) {
      await setDoc(doc(db, 'registrations', user.uid), {
        etapa2: {
          notParticipating,
          selections: notParticipating ? [] : selections
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    navigate('/etapa3');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F0EFEA] p-3 md:p-6 flex flex-col items-center font-sans text-[#1A1A1A]">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-3xl space-y-4 md:space-y-6 my-4 md:my-8"
      >
        {/* Header Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-t-8 border-t-[#E85D22]">
          <span className="inline-block bg-[#1A1A1A] text-white px-3 py-1 text-xs md:text-sm font-mono tracking-widest uppercase mb-4 md:mb-6">
            Etapa 2
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-[#1A1A1A] leading-none">
            Separar e pendurar peças
          </h1>
          <div className="space-y-4 text-base md:text-lg font-medium text-[#1A1A1A]/80 leading-relaxed mt-6">
            <p>
              Essa etapa será feita de maneira <strong className="text-[#1A1A1A]">presencial</strong>, no prédio da Por Amor, na semana dos dias <strong className="text-[#1A1A1A]">23 a 27/03</strong>.
            </p>
            <p>
              <strong className="text-[#1A1A1A]">Horário:</strong> das 10h às 18h <em className="text-[#E85D22] font-mono text-sm block mt-2">*sujeito a estender. Não é necessário ficar o período completo.</em>
            </p>
          </div>
        </div>

        {/* Question 1 Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <p className="font-black text-lg md:text-xl text-[#1A1A1A] mb-6 uppercase tracking-wide">Caso tenha disponibilidade para a etapa 2, preencha os melhores dias e horários para você:</p>
          
          <label className={`flex items-center p-4 md:p-5 cursor-pointer transition-all border-2 mb-6 md:mb-8 ${
            notParticipating ? 'border-[#E85D22] bg-[#E85D22]/10 shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
          }`}>
            <input
              type="checkbox"
              checked={notParticipating}
              onChange={(e) => {
                setNotParticipating(e.target.checked);
                if (e.target.checked) setSelections([]);
              }}
              className="w-5 h-5 md:w-6 md:h-6 text-[#E85D22] border-2 border-[#1A1A1A] rounded-none focus:ring-[#E85D22] focus:ring-offset-0"
            />
            <span className="ml-3 md:ml-4 font-bold text-base md:text-lg text-[#1A1A1A]">Não poderei participar desta etapa</span>
          </label>

          {!notParticipating && (
            <DateShiftSelector 
              dates={DATES} 
              shifts={SHIFTS} 
              selections={selections} 
              onChange={setSelections} 
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-row gap-3 md:gap-4 pt-4">
          <button
            onClick={() => navigate('/etapa1')}
            className="flex-1 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base text-center"
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            disabled={!notParticipating && selections.length === 0}
            className="flex-[2] bg-[#E85D22] hover:bg-[#d14e18] disabled:bg-[#1A1A1A]/10 disabled:text-[#1A1A1A]/40 disabled:border-transparent disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:shadow-none text-center"
          >
            Próxima Etapa
          </button>
        </div>
      </motion.div>
    </div>
  );
}
