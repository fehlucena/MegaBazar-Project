import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateShiftSelector, { DayShiftSelection } from '../components/DateShiftSelector';

const DATES = [
  '07/04 - terça-feira',
  '08/04 - quarta-feira',
  '09/04 - quinta-feira'
];
const SHIFTS = ['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'];

export default function Etapa4() {
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
        if (docSnap.exists() && docSnap.data().etapa4) {
          const data = docSnap.data().etapa4;
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
        etapa4: {
          notParticipating,
          selections: notParticipating ? [] : selections
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    navigate('/escala');
  };

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
            Etapa 4
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">
            Montagem oficial
          </h1>
        </div>

        <div className="space-y-6 text-zinc-600 leading-relaxed mb-10 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
          <p>
            Este é o momento em que, de fato, tudo ganha forma. A estrutura do evento é montada e as peças são colocadas nos lugares pré estabelecidos.
          </p>
          <p>
            Nesta etapa, você poderá colaborar com a organização dos espaços para o momento do Mega Bazar. Ela será realizada no Prédio da Por Amor, nos <strong>dias 7, 8 e 9/04</strong>.
          </p>
          <p>
            <strong>Horário:</strong> das 10h às 18h <em>*sujeito a estender. Não é necessário ficar o período completo.</em>
          </p>
        </div>

        <div className="space-y-6">
          <p className="font-medium text-lg text-zinc-800">Caso tenha disponibilidade para a etapa 4, preencha os melhores dias e horários para você:</p>
          
          <label className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 mb-6 ${
            notParticipating ? 'border-indigo-500 bg-indigo-50/30' : 'border-zinc-200 bg-white hover:border-indigo-200'
          }`}>
            <input
              type="checkbox"
              checked={notParticipating}
              onChange={(e) => {
                setNotParticipating(e.target.checked);
                if (e.target.checked) setSelections([]);
              }}
              className="w-5 h-5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-4 font-medium text-zinc-800">Não poderei participar desta etapa</span>
          </label>

          {!notParticipating && (
            <DateShiftSelector 
              dates={DATES} 
              shifts={SHIFTS} 
              selections={selections} 
              onChange={setSelections} 
            />
          )}

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => navigate('/etapa3')}
              className="w-1/3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium py-4 px-6 rounded-2xl transition-all text-lg"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!notParticipating && selections.length === 0}
              className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-sm text-lg"
            >
              Ir para Escala
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
