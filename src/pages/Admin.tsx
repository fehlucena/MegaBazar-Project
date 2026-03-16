import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

export default function Admin() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('etapas');
  const [limits, setLimits] = useState<Record<string, number>>({
    'Feminino': 5,
    'Masculino': 2,
    'Calçados': 2,
    'Infantil': 2,
    'Cama, Mesa, Banho e Utilidades': 2
  });
  const [savingLimits, setSavingLimits] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const querySnapshot = await getDocs(collection(db, 'registrations'));
      const regs: any[] = [];
      querySnapshot.forEach((doc) => {
        regs.push({ id: doc.id, ...doc.data() });
      });
      setRegistrations(regs);

      const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
      if (settingsSnap.exists() && settingsSnap.data().limits) {
        setLimits(settingsSnap.data().limits);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const handleSaveLimits = async () => {
    setSavingLimits(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), { limits }, { merge: true });
      alert('Limites atualizados com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar limites.');
    }
    setSavingLimits(false);
  };

  const handleLimitChange = (sector: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setLimits(prev => ({ ...prev, [sector]: num }));
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const headers = ['Nome', 'Email', 'Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4', 'Escala'];
    const rows = registrations.map(reg => {
      const e1 = reg.etapa1?.selections?.map((s: any) => `${s.date} (${s.shift})`).join('; ') || '-';
      const e2 = reg.etapa2?.selections?.map((s: any) => `${s.date} (${s.shift})`).join('; ') || '-';
      const e3 = reg.etapa3?.selections?.map((s: any) => `${s.date} (${s.shift})`).join('; ') || '-';
      const e4 = reg.etapa4?.selections?.map((s: any) => `${s.date} (${s.shift})`).join('; ') || '-';
      const esc = reg.escala?.map((s: any) => `${s.date} - ${s.sector} (${s.shift})`).join('; ') || '-';

      return [
        `"${reg.name || ''}"`,
        `"${reg.email || ''}"`,
        `"${e1}"`,
        `"${e2}"`,
        `"${e3}"`,
        `"${e4}"`,
        `"${esc}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_voluntarios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0EFEA] text-[#1A1A1A] font-black uppercase tracking-widest">Carregando dados...</div>;

  return (
    <div className="min-h-screen bg-[#F0EFEA] p-3 md:p-6 font-sans text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 my-4 md:my-8">
        <div className="bg-white p-6 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-t-8 border-t-[#E85D22]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase">Painel Administrativo</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
              <button
                onClick={exportToCSV}
                className="px-4 md:px-6 py-2 md:py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest transition-all border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-1 flex overflow-x-auto whitespace-nowrap gap-1">
          <button 
            onClick={() => setActiveTab('etapas')}
            className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 flex-1 ${activeTab === 'etapas' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F0EFEA]'}`}
          >
            Etapas
          </button>
          <button 
            onClick={() => setActiveTab('escala')}
            className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 flex-1 ${activeTab === 'escala' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F0EFEA]'}`}
          >
            Escala
          </button>
          <button 
            onClick={() => setActiveTab('setores')}
            className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 flex-1 ${activeTab === 'setores' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F0EFEA]'}`}
          >
            Setores
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 flex-1 ${activeTab === 'config' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F0EFEA]'}`}
          >
            Config
          </button>
        </div>

        {activeTab === 'etapas' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12">
            {/* Etapa 1 */}
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-[#1A1A1A] uppercase tracking-wide flex items-center border-b-4 border-[#1A1A1A] pb-3 md:pb-4">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-[#E85D22] mr-2 md:mr-3 inline-block flex-shrink-0"></span>
                Etapa 1: Etiquetar as peças
              </h2>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-[#1A1A1A]">
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Nome</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Opção</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.etapa1).map(reg => (
                        <tr key={reg.id} className="border-b-2 border-[#1A1A1A]/10 hover:bg-[#F0EFEA] transition-colors">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-bold text-sm md:text-base whitespace-nowrap">{reg.name}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base whitespace-nowrap">{reg.etapa1.option}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base min-w-[200px]">
                            {reg.etapa1.selections && reg.etapa1.selections.length > 0 
                              ? reg.etapa1.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Etapa 2 */}
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-[#1A1A1A] uppercase tracking-wide flex items-center border-b-4 border-[#1A1A1A] pb-3 md:pb-4">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-[#E85D22] mr-2 md:mr-3 inline-block flex-shrink-0"></span>
                Etapa 2: Separar e pendurar peças
              </h2>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-[#1A1A1A]">
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Nome</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Dias Selecionados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.etapa2 && r.etapa2.selections && r.etapa2.selections.length > 0).map(reg => (
                        <tr key={reg.id} className="border-b-2 border-[#1A1A1A]/10 hover:bg-[#F0EFEA] transition-colors">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-bold text-sm md:text-base whitespace-nowrap">{reg.name}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base min-w-[200px]">
                            {reg.etapa2.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-[#1A1A1A] uppercase tracking-wide flex items-center border-b-4 border-[#1A1A1A] pb-3 md:pb-4">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-[#E85D22] mr-2 md:mr-3 inline-block flex-shrink-0"></span>
                Etapa 3: Ajustes gerais
              </h2>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-[#1A1A1A]">
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Nome</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Presença</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Dias Selecionados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.etapa3).map(reg => (
                        <tr key={reg.id} className="border-b-2 border-[#1A1A1A]/10 hover:bg-[#F0EFEA] transition-colors">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-bold text-sm md:text-base whitespace-nowrap">{reg.name}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base whitespace-nowrap">{reg.etapa3.option}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base min-w-[200px]">
                            {reg.etapa3.selections && reg.etapa3.selections.length > 0 
                              ? reg.etapa3.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Etapa 4 */}
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-[#1A1A1A] uppercase tracking-wide flex items-center border-b-4 border-[#1A1A1A] pb-3 md:pb-4">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-[#E85D22] mr-2 md:mr-3 inline-block flex-shrink-0"></span>
                Etapa 4: Montagem oficial
              </h2>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-[#1A1A1A]">
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Nome</th>
                        <th className="py-3 md:py-4 px-2 md:px-4 font-black text-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">Dias Selecionados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.etapa4 && r.etapa4.selections && r.etapa4.selections.length > 0).map(reg => (
                        <tr key={reg.id} className="border-b-2 border-[#1A1A1A]/10 hover:bg-[#F0EFEA] transition-colors">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-bold text-sm md:text-base whitespace-nowrap">{reg.name}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-[#1A1A1A] font-medium text-xs md:text-base min-w-[200px]">
                            {reg.etapa4.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'escala' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12">
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 text-[#1A1A1A] uppercase tracking-tighter border-b-4 border-[#1A1A1A] pb-3 md:pb-4">Escala Mega Bazar</h2>
              
              {/* Group by Date, then Shift, then Sector */}
              {['11/04 - sábado', '12/04 - domingo', '13/04 - segunda', '14/04 - terça', '15/04 - quarta', '16/04 - quinta', '17/04 - sexta', '18/04 - sábado', '19/04 - domingo'].map(date => {
                
                // Find all slots for this date
                const slotsForDate: any[] = [];
                registrations.forEach(reg => {
                  if (reg.escala) {
                    reg.escala.forEach((slot: any) => {
                      if (slot.date === date) {
                        slotsForDate.push({ ...slot, userName: reg.name });
                      }
                    });
                  }
                });

                if (slotsForDate.length === 0) return null;

                // Group by shift
                const shifts = [...new Set(slotsForDate.map(s => s.shift))];

                return (
                  <div key={date} className="mb-10 md:mb-16">
                    <h3 className="text-lg md:text-2xl font-black text-white bg-[#1A1A1A] inline-block px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-widest mb-6 md:mb-8 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(232,93,34,1)] md:shadow-[4px_4px_0px_0px_rgba(232,93,34,1)]">{date}</h3>
                    
                    {shifts.map(shift => {
                      const slotsForShift = slotsForDate.filter(s => s.shift === shift);
                      // Group by sector
                      const sectors = [...new Set(slotsForShift.map(s => s.sector))];
                      
                      return (
                        <div key={shift} className="mb-8 md:mb-12 ml-2 md:ml-8 border-l-4 border-[#1A1A1A] pl-4 md:pl-6">
                          <h4 className="font-black text-[#1A1A1A] mb-4 md:mb-6 bg-[#F0EFEA] inline-block px-2 py-1 md:px-3 md:py-1 border-2 border-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest">{shift}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {sectors.map(sector => {
                              const usersInSector = slotsForShift.filter(s => s.sector === sector).map(s => s.userName);
                              return (
                                <div key={sector} className="bg-white p-4 md:p-6 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                                  <h5 className="font-black text-[#1A1A1A] mb-3 md:mb-4 uppercase tracking-wide border-b-2 border-[#1A1A1A]/10 pb-2 text-sm md:text-base">{sector}</h5>
                                  <ul className="space-y-2">
                                    {usersInSector.map((name, i) => (
                                      <li key={i} className="text-xs md:text-sm font-bold text-[#1A1A1A] flex items-center">
                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#E85D22] mr-2 md:mr-3 flex-shrink-0"></span>
                                        {name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        {activeTab === 'setores' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12">
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 text-[#1A1A1A] uppercase tracking-tighter border-b-4 border-[#1A1A1A] pb-3 md:pb-4">Relatório por Setor</h2>
              
              {Object.keys(limits).map(sector => {
                const slotsForSector: any[] = [];
                registrations.forEach(reg => {
                  if (reg.escala) {
                    reg.escala.forEach((slot: any) => {
                      if (slot.sector === sector) {
                        slotsForSector.push({ ...slot, userName: reg.name });
                      }
                    });
                  }
                });

                if (slotsForSector.length === 0) return null;

                // Group by date
                const dates = [...new Set(slotsForSector.map(s => s.date))];

                return (
                  <div key={sector} className="mb-10 md:mb-16">
                    <h3 className="text-lg md:text-2xl font-black text-white bg-[#1A1A1A] inline-block px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-widest mb-6 md:mb-8 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(232,93,34,1)] md:shadow-[4px_4px_0px_0px_rgba(232,93,34,1)]">{sector}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {dates.map(date => {
                        const slotsForDate = slotsForSector.filter(s => s.date === date);
                        return (
                          <div key={date} className="bg-[#F0EFEA] p-4 md:p-6 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                            <h4 className="font-black text-[#1A1A1A] mb-3 md:mb-4 bg-white inline-block px-2 py-1 md:px-3 md:py-1 border-2 border-[#1A1A1A] text-xs md:text-sm uppercase tracking-widest">{date}</h4>
                            {['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'].map(shift => {
                              const usersInShift = slotsForDate.filter(s => s.shift === shift).map(s => s.userName);
                              if (usersInShift.length === 0) return null;
                              return (
                                <div key={shift} className="mb-3 md:mb-4 last:mb-0 bg-white p-2 md:p-3 border-2 border-[#1A1A1A]">
                                  <h5 className="text-[10px] md:text-xs font-black text-[#E85D22] uppercase tracking-widest mb-1.5 md:mb-2">{shift}</h5>
                                  <ul className="space-y-1">
                                    {usersInShift.map((name, i) => (
                                      <li key={i} className="text-xs md:text-sm font-bold text-[#1A1A1A] flex items-center">
                                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#1A1A1A] mr-2 flex-shrink-0"></span>
                                        {name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12">
            <div className="bg-white p-4 md:p-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 text-[#1A1A1A] uppercase tracking-tighter border-b-4 border-[#1A1A1A] pb-3 md:pb-4">Configurações do Sistema</h2>
              <p className="text-[#1A1A1A]/70 font-medium mb-6 md:mb-10 text-sm md:text-lg">
                Ajuste os limites de vagas para cada setor nos finais de semana. As alterações refletirão imediatamente para os novos voluntários.
              </p>
              
              <div className="p-4 md:p-8 bg-[#F0EFEA] border-2 border-[#1A1A1A] max-w-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h3 className="font-black text-[#1A1A1A] mb-4 md:mb-6 uppercase tracking-widest text-base md:text-lg">Limites de Vagas <span className="text-xs md:text-sm font-mono text-[#E85D22] block sm:inline mt-1 sm:mt-0">(por turno)</span></h3>
                
                <div className="space-y-3 md:space-y-4">
                  {Object.entries(limits).map(([sector, limit]) => (
                    <div key={sector} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 md:p-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] gap-2 sm:gap-0">
                      <label className="text-[#1A1A1A] font-black uppercase tracking-wide text-xs md:text-sm">{sector}</label>
                      <input 
                        type="number" 
                        min="0"
                        value={limit} 
                        onChange={(e) => handleLimitChange(sector, e.target.value)}
                        className="w-full sm:w-24 px-2 md:px-3 py-1.5 md:py-2 bg-[#F0EFEA] border-2 border-[#1A1A1A] focus:ring-0 focus:outline-none focus:border-[#E85D22] text-center font-black text-[#1A1A1A] text-base md:text-lg"
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSaveLimits}
                  disabled={savingLimits}
                  className="mt-6 md:mt-10 w-full bg-[#E85D22] hover:bg-[#d14e18] disabled:bg-[#E85D22]/50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 md:py-4 px-4 md:px-6 transition-all border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] disabled:shadow-none disabled:translate-y-1 text-sm md:text-lg"
                >
                  {savingLimits ? 'Salvando...' : 'Salvar Limites'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
