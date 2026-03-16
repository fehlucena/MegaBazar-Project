import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateShiftSelector, { DayShiftSelection } from '../components/DateShiftSelector';

const DATES = ['16/03 - segunda', '17/03 - terça', '18/03 - quarta', '19/03 - quinta', '20/03 - sexta'];
const SHIFTS = ['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'];

export default function Etapa1() {
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
        if (docSnap.exists() && docSnap.data().etapa1) {
          setSelectedOption(docSnap.data().etapa1.option || '');
          setSelections(docSnap.data().etapa1.selections || []);
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
        etapa1: {
          option: selectedOption,
          selections: selections
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    navigate('/etapa2');
  };

  const options = [
    'Presencial',
    'Retirar',
    'Não poderei participar'
  ];

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
            Etapa 1
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-[#1A1A1A] leading-none">
            Etiquetar as peças
          </h1>
          <div className="space-y-4 text-base md:text-lg font-medium text-[#1A1A1A]/80 leading-relaxed mt-6">
            <p>Essa etapa pode ser feita de duas formas:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong className="text-[#1A1A1A]">Estar presente</strong> no prédio da Por Amor nos dias e horários propostos para fazer essa tarefa - de <strong className="text-[#1A1A1A]">16 a 20/03, das 10h às 18h</strong>
              </li>
              <li>
                Na semana dos dias <strong className="text-[#1A1A1A]">16 a 20/03</strong>, você poderá passar no prédio da Por Amor, procurar um responsável pelo Bazar, e <strong className="text-[#1A1A1A]">retirar os sacos para etiquetar em casa</strong>. Ao finalizar, eles devem ser devolvidos na Igreja. <em className="text-[#E85D22] font-mono text-sm block mt-2">*Prazo de devolução: 22/03 (domingo)</em>
              </li>
            </ol>
          </div>
        </div>

        {/* Question 1 Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <p className="font-black text-lg md:text-xl text-[#1A1A1A] mb-6 uppercase tracking-wide">Preencha a melhor opção para você:</p>
          
          <div className="space-y-3">
            {options.map((option) => (
              <label 
                key={option} 
                className={`flex items-center p-4 md:p-5 cursor-pointer transition-all border-2 ${
                  selectedOption === option 
                    ? 'border-[#E85D22] bg-[#E85D22]/10 shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' 
                    : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
                }`}
              >
                <input
                  type="radio"
                  name="etapa1"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    if (e.target.value === 'Não poderei participar') {
                      setSelections([]);
                    }
                  }}
                  className="w-5 h-5 md:w-6 md:h-6 text-[#E85D22] border-2 border-[#1A1A1A] focus:ring-[#E85D22] focus:ring-offset-0"
                />
                <span className="ml-3 md:ml-4 font-bold text-base md:text-lg text-[#1A1A1A]">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 2 Card (Conditional) */}
        {selectedOption && selectedOption !== 'Não poderei participar' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"
          >
            <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] mb-6 uppercase tracking-wide">
              Quais dias e horários você pode participar?
            </h3>
            <DateShiftSelector 
              dates={DATES} 
              shifts={SHIFTS} 
              selections={selections} 
              onChange={setSelections} 
            />
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex flex-row gap-3 md:gap-4 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base text-center"
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedOption || (selectedOption !== 'Não poderei participar' && selections.length === 0)}
            className="flex-[2] bg-[#E85D22] hover:bg-[#d14e18] disabled:bg-[#1A1A1A]/10 disabled:text-[#1A1A1A]/40 disabled:border-transparent disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:shadow-none text-center"
          >
            Próxima Etapa
          </button>
        </div>
      </motion.div>
    </div>
  );
}
