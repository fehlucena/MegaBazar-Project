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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center py-12 font-sans text-zinc-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-zinc-100 max-w-3xl w-full"
      >
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            Revisão
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">
            Resumo das suas escolhas
          </h1>
          <p className="text-zinc-600 text-lg">
            Por favor, confira se os horários e turnos selecionados estão corretos antes de finalizar.
          </p>
        </div>

        {data && (
          <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200 mb-10">
            <div className="space-y-6">
              {/* Etapa 1 */}
              {data.etapa1 && data.etapa1.option !== 'Não poderei participar' && (
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">Etapa 1: Etiquetar as peças ({data.etapa1.option})</h3>
                  {data.etapa1.selections && data.etapa1.selections.length > 0 ? (
                    <ul className="space-y-1 ml-4">
                      {data.etapa1.selections.map((s: any, i: number) => (
                        <li key={i} className="text-zinc-600 text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                          {s.date} - {s.shift}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-500 text-sm ml-4">Nenhum horário selecionado.</p>
                  )}
                </div>
              )}

              {/* Etapa 2 */}
              {data.etapa2 && !data.etapa2.notParticipating && data.etapa2.selections && data.etapa2.selections.length > 0 && (
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">Etapa 2: Separar e pendurar peças</h3>
                  <ul className="space-y-1 ml-4">
                    {data.etapa2.selections.map((s: any, i: number) => (
                      <li key={i} className="text-zinc-600 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Etapa 3 */}
              {data.etapa3 && data.etapa3.option === 'Estarei presente!' && data.etapa3.selections && data.etapa3.selections.length > 0 && (
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">Etapa 3: Ajustes gerais</h3>
                  <ul className="space-y-1 ml-4">
                    {data.etapa3.selections.map((s: any, i: number) => (
                      <li key={i} className="text-zinc-600 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Etapa 4 */}
              {data.etapa4 && !data.etapa4.notParticipating && data.etapa4.selections && data.etapa4.selections.length > 0 && (
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">Etapa 4: Montagem oficial</h3>
                  <ul className="space-y-1 ml-4">
                    {data.etapa4.selections.map((s: any, i: number) => (
                      <li key={i} className="text-zinc-600 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        {s.date} - {s.shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Escala */}
              {data.escala && data.escala.length > 0 && (
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">Escala Mega Bazar</h3>
                  <ul className="space-y-1 ml-4">
                    {data.escala.map((s: any, i: number) => (
                      <li key={i} className="text-zinc-600 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        {s.date} - {s.shift} ({s.sector})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/escala')}
            className="w-1/3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium py-4 px-6 rounded-2xl transition-all text-lg"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirm}
            className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg"
          >
            Confirmar Inscrição
          </button>
        </div>
      </motion.div>
    </div>
  );
}
