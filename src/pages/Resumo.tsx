import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Resumo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const docRef = doc(db, 'registrations', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleConfirm = () => {
    navigate('/confirmacao');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F0EFEA] p-3 md:p-6 flex flex-col items-center font-sans text-[#1A1A1A]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl space-y-4 md:space-y-6 my-4 md:my-8"
      >
        {/* Header Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-t-8 border-t-[#E85D22] text-center">
          <span className="inline-block bg-[#1A1A1A] text-white px-3 py-1 text-xs md:text-sm font-mono tracking-widest uppercase mb-4 md:mb-6">
            Revisão
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-[#1A1A1A] leading-none">
            Resumo das suas escolhas
          </h1>
          <p className="text-[#1A1A1A]/80 text-base md:text-lg font-medium mt-6">
            Por favor, confira se os horários e turnos selecionados estão corretos antes de finalizar.
          </p>
        </div>

        {data && (
          <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <div className="space-y-6 md:space-y-8">
              {/* Etapa 1 */}
              {data.etapa1 && data.etapa1.option !== 'Não poderei participar' && (
                <div className="border-b-2 border-[#1A1A1A]/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] uppercase tracking-wide mb-3 md:mb-4">Etapa 1: Etiquetar as peças <span className="text-[#E85D22] text-xs md:text-sm font-mono block mt-1">({data.etapa1.option})</span></h3>
                  {data.etapa1.selections && data.etapa1.selections.length > 0 ? (
                    <ul className="space-y-2 ml-2">
                      {data.etapa1.selections.map((s: any, i: number) => (
                        <li key={i} className="text-[#1A1A1A] font-medium flex items-center text-sm md:text-base">
                          <span className="w-2 h-2 bg-[#E85D22] mr-3 flex-shrink-0"></span>
                          {s.date} - {s.shift}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#1A1A1A]/50 font-medium italic ml-2 text-sm md:text-base">Nenhum horário selecionado.</p>
                  )}
                </div>
              )}

              {/* Etapa 2 */}
              {data.etapa2 && !data.etapa2.notParticipating && data.etapa2.selections && data.etapa2.selections.length > 0 && (
                <div className="border-b-2 border-[#1A1A1A]/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] uppercase tracking-wide mb-3 md:mb-4">Etapa 2: Separar e pendurar peças</h3>
                  <ul className="space-y-2 ml-2">
                    {data.etapa2.selections.map((s: any, i: number) => (
                      <li key={i} className="text-[#1A1A1A] font-medium flex items-center text-sm md:text-base">
                        <span className="w-2 h-2 bg-[#E85D22] mr-3 flex-shrink-0"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Etapa 3 */}
              {data.etapa3 && data.etapa3.option === 'Estarei presente!' && data.etapa3.selections && data.etapa3.selections.length > 0 && (
                <div className="border-b-2 border-[#1A1A1A]/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] uppercase tracking-wide mb-3 md:mb-4">Etapa 3: Ajustes gerais</h3>
                  <ul className="space-y-2 ml-2">
                    {data.etapa3.selections.map((s: any, i: number) => (
                      <li key={i} className="text-[#1A1A1A] font-medium flex items-center text-sm md:text-base">
                        <span className="w-2 h-2 bg-[#E85D22] mr-3 flex-shrink-0"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Etapa 4 */}
              {data.etapa4 && !data.etapa4.notParticipating && data.etapa4.selections && data.etapa4.selections.length > 0 && (
                <div className="border-b-2 border-[#1A1A1A]/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] uppercase tracking-wide mb-3 md:mb-4">Etapa 4: Montagem oficial</h3>
                  <ul className="space-y-2 ml-2">
                    {data.etapa4.selections.map((s: any, i: number) => (
                      <li key={i} className="text-[#1A1A1A] font-medium flex items-center text-sm md:text-base">
                        <span className="w-2 h-2 bg-[#E85D22] mr-3 flex-shrink-0"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Escala */}
              {data.escala && data.escala.length > 0 && (
                <div className="border-b-2 border-[#1A1A1A]/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-black text-lg md:text-xl text-[#1A1A1A] uppercase tracking-wide mb-3 md:mb-4">Escala Mega Bazar</h3>
                  <ul className="space-y-2 ml-2">
                    {data.escala.map((s: any, i: number) => (
                      <li key={i} className="text-[#1A1A1A] font-medium flex flex-wrap items-center text-sm md:text-base gap-2">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-[#E85D22] mr-3 flex-shrink-0"></span>
                          {s.date} - {s.shift}
                        </div>
                        <strong className="bg-[#F0EFEA] px-2 py-0.5 border border-[#1A1A1A] text-[10px] md:text-xs uppercase tracking-wider">{s.sector}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-row gap-3 md:gap-4 pt-4">
          <button
            onClick={() => navigate('/escala')}
            className="flex-1 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base text-center"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-[2] bg-[#E85D22] hover:bg-[#d14e18] text-white font-black uppercase tracking-widest py-3 md:py-4 px-2 md:px-6 transition-all text-xs md:text-base border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center"
          >
            Confirmar Inscrição
          </button>
        </div>
      </motion.div>
    </div>
  );
}
