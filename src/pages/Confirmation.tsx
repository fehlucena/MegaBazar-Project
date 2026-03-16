import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CalendarEvent, getGoogleCalendarUrl } from '../services/calendar';

export default function Confirmation() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const docRef = doc(db, 'registrations', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const regData = docSnap.data();
          
          const evts: CalendarEvent[] = [];

          // Add Etapa 1
          if (regData.etapa1?.selections) {
            for (const slot of regData.etapa1.selections) {
              evts.push({
                title: 'Mega Bazar - Etapa 1',
                description: `Etapa 1: Etiquetar as peças\nTurno: ${slot.shift}\nObrigado por ser voluntário!`,
                dateStr: slot.date,
                shiftStr: slot.shift
              });
            }
          }
          // Add Etapa 2
          if (regData.etapa2?.selections) {
            for (const slot of regData.etapa2.selections) {
              evts.push({
                title: 'Mega Bazar - Etapa 2',
                description: `Etapa 2: Separar e pendurar peças\nTurno: ${slot.shift}\nObrigado por ser voluntário!`,
                dateStr: slot.date,
                shiftStr: slot.shift
              });
            }
          }
          // Add Etapa 3
          if (regData.etapa3?.selections) {
            for (const slot of regData.etapa3.selections) {
              evts.push({
                title: 'Mega Bazar - Etapa 3',
                description: `Etapa 3: Ajustes gerais\nTurno: ${slot.shift}\nObrigado por ser voluntário!`,
                dateStr: slot.date,
                shiftStr: slot.shift
              });
            }
          }
          // Add Etapa 4
          if (regData.etapa4?.selections) {
            for (const slot of regData.etapa4.selections) {
              evts.push({
                title: 'Mega Bazar - Etapa 4',
                description: `Etapa 4: Montagem oficial\nTurno: ${slot.shift}\nObrigado por ser voluntário!`,
                dateStr: slot.date,
                shiftStr: slot.shift
              });
            }
          }
          // Add Escala
          if (regData.escala) {
            for (const slot of regData.escala) {
              evts.push({
                title: `Mega Bazar - ${slot.sector}`,
                description: `Escala Mega Bazar\nSetor: ${slot.sector}\nTurno: ${slot.shift}\nObrigado por ser voluntário!`,
                dateStr: slot.date,
                shiftStr: slot.shift
              });
            }
          }

          if (evts.length > 0) {
            // Sort chronologically
            evts.sort((a, b) => {
              const [dayA, monthA] = a.dateStr.split(' - ')[0].split('/');
              const [dayB, monthB] = b.dateStr.split(' - ')[0].split('/');
              const dateA = new Date(2026, parseInt(monthA) - 1, parseInt(dayA));
              const dateB = new Date(2026, parseInt(monthB) - 1, parseInt(dayB));
              return dateA.getTime() - dateB.getTime();
            });
            setEvents(evts);
          }
        }
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleAddNextEvent = () => {
    if (currentEventIndex < events.length) {
      const ev = events[currentEventIndex];
      const url = getGoogleCalendarUrl(ev);
      window.open(url, '_blank');
      setCurrentEventIndex(prev => prev + 1);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F0EFEA] p-3 md:p-6 flex flex-col items-center font-sans text-[#1A1A1A]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl text-center space-y-4 md:space-y-6 my-4 md:my-8"
      >
        {/* Header Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-t-8 border-t-[#E85D22]">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#E85D22] text-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6 text-[#1A1A1A] leading-none uppercase">
            Inscrição Confirmada!
          </h1>

          <div className="space-y-4 md:space-y-6 text-base md:text-lg text-[#1A1A1A] font-medium leading-relaxed max-w-2xl mx-auto">
            <p>
              Desde já agradecemos a sua disponibilidade em servir com a gente!
            </p>
            <p>
              Para facilitar a nossa comunicação nessa jornada, preparamos um grupo exclusivo — que será encerrado ao final do evento.
            </p>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex flex-col items-center justify-center">
            <a
              href="https://chat.whatsapp.com/LrAfgf6VXDF0quwDeo76vS?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest py-3 md:py-4 px-4 md:px-8 transition-all text-sm md:text-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Entrar no Grupo Exclusivo
            </a>
          </div>
        </div>

        {events.length > 0 && (
          <div className="w-full max-w-2xl mx-auto text-left bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] mb-3 md:mb-4 flex items-center uppercase tracking-wide">
              <svg className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-[#E85D22]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Adicionar à Agenda
            </h2>
            <p className="text-[#1A1A1A]/70 mb-6 md:mb-8 font-medium text-sm md:text-base">
              Adicione seus turnos à agenda para não esquecer. Clique no botão abaixo para adicionar cada turno.
            </p>
            
            <div className="mb-6 md:mb-8">
              <h3 className="font-black text-[#1A1A1A] mb-3 md:mb-4 uppercase tracking-widest text-xs md:text-sm bg-[#F0EFEA] inline-block px-2 py-1 md:px-3 md:py-1 border border-[#1A1A1A]">Seus turnos confirmados:</h3>
              <ul className="space-y-3 md:space-y-4">
                {events.map((ev, i) => (
                  <li key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#1A1A1A]/10 pb-3 md:pb-4 last:border-0 last:pb-0 ${i < currentEventIndex ? 'opacity-50 grayscale' : ''}`}>
                    <div>
                      <p className="font-black text-base md:text-lg text-[#1A1A1A] flex flex-wrap items-center gap-2">
                        {ev.title.replace('Mega Bazar - ', '')}
                        {i < currentEventIndex && <span className="text-[10px] md:text-xs bg-[#1A1A1A] text-white px-2 py-0.5 md:py-1 font-mono uppercase tracking-widest">Adicionado</span>}
                      </p>
                      <p className="text-xs md:text-sm font-medium text-[#1A1A1A]/70 mt-1">{ev.dateStr} • {ev.shiftStr}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleAddNextEvent}
              disabled={currentEventIndex >= events.length}
              className="flex items-center justify-center w-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-black uppercase tracking-widest py-3 md:py-4 px-4 md:px-8 transition-all text-sm md:text-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-1"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentEventIndex >= events.length 
                ? 'Todos os turnos adicionados!' 
                : `Adicionar Turno ${currentEventIndex + 1} de ${events.length}`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
