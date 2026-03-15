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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500">Carregando dados...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Painel Administrativo</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-1 flex flex-wrap gap-1">
            <button 
              onClick={() => setActiveTab('etapas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'etapas' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Relatório Etapas
            </button>
            <button 
              onClick={() => setActiveTab('escala')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'escala' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Relatório Escala
            </button>
            <button 
              onClick={() => setActiveTab('setores')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'setores' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Relatório por Setor
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Configurações
            </button>
            </div>
          </div>
        </div>

        {activeTab === 'etapas' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Etapa 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-4 text-zinc-800">Etapa 1: Etiquetar as peças</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Nome</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Opção</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.filter(r => r.etapa1).map(reg => (
                      <tr key={reg.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 text-zinc-800">{reg.name}</td>
                        <td className="py-3 px-4 text-zinc-600">{reg.etapa1.option}</td>
                        <td className="py-3 px-4 text-zinc-600">
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

            {/* Etapa 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-4 text-zinc-800">Etapa 2: Separar e pendurar peças</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Nome</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Dias Selecionados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.filter(r => r.etapa2 && r.etapa2.selections && r.etapa2.selections.length > 0).map(reg => (
                      <tr key={reg.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 text-zinc-800">{reg.name}</td>
                        <td className="py-3 px-4 text-zinc-600">
                          {reg.etapa2.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-4 text-zinc-800">Etapa 3: Ajustes gerais</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Nome</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Presença</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Dias Selecionados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.filter(r => r.etapa3).map(reg => (
                      <tr key={reg.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 text-zinc-800">{reg.name}</td>
                        <td className="py-3 px-4 text-zinc-600">{reg.etapa3.option}</td>
                        <td className="py-3 px-4 text-zinc-600">
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

            {/* Etapa 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-4 text-zinc-800">Etapa 4: Montagem oficial</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Nome</th>
                      <th className="py-3 px-4 font-semibold text-zinc-500 text-sm uppercase tracking-wider">Dias Selecionados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.filter(r => r.etapa4 && r.etapa4.selections && r.etapa4.selections.length > 0).map(reg => (
                      <tr key={reg.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 text-zinc-800">{reg.name}</td>
                        <td className="py-3 px-4 text-zinc-600">
                          {reg.etapa4.selections.map((s: any) => `${s.date} (${s.shift})`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'escala' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-8 text-zinc-800">Escala Mega Bazar</h2>
              
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
                  <div key={date} className="mb-10 border-l-4 border-indigo-500 pl-6">
                    <h3 className="text-xl font-bold text-zinc-800 mb-6">{date}</h3>
                    
                    {shifts.map(shift => {
                      const slotsForShift = slotsForDate.filter(s => s.shift === shift);
                      // Group by sector
                      const sectors = [...new Set(slotsForShift.map(s => s.sector))];
                      
                      return (
                        <div key={shift} className="mb-8 ml-2">
                          <h4 className="font-semibold text-indigo-700 mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-lg text-sm uppercase tracking-wide">{shift}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sectors.map(sector => {
                              const usersInSector = slotsForShift.filter(s => s.sector === sector).map(s => s.userName);
                              return (
                                <div key={sector} className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 shadow-sm">
                                  <h5 className="font-semibold text-zinc-800 mb-3">{sector}</h5>
                                  <ul className="space-y-1">
                                    {usersInSector.map((name, i) => (
                                      <li key={i} className="text-sm text-zinc-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-8 text-zinc-800">Relatório por Setor</h2>
              
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
                  <div key={sector} className="mb-10 border-l-4 border-emerald-500 pl-6">
                    <h3 className="text-xl font-bold text-zinc-800 mb-6">{sector}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dates.map(date => {
                        const slotsForDate = slotsForSector.filter(s => s.date === date);
                        return (
                          <div key={date} className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 shadow-sm">
                            <h4 className="font-semibold text-emerald-700 mb-3 bg-emerald-50 inline-block px-2 py-1 rounded-md text-sm">{date}</h4>
                            {['Manhã (9h às 14h)', 'Tarde (14h às 20h)', 'Integral (9h às 18h)'].map(shift => {
                              const usersInShift = slotsForDate.filter(s => s.shift === shift).map(s => s.userName);
                              if (usersInShift.length === 0) return null;
                              return (
                                <div key={shift} className="mb-3 last:mb-0">
                                  <h5 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{shift}</h5>
                                  <ul className="space-y-1">
                                    {usersInShift.map((name, i) => (
                                      <li key={i} className="text-sm text-zinc-700 flex items-center">
                                        <span className="w-1 h-1 bg-zinc-400 rounded-full mr-2"></span>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h2 className="text-xl font-bold mb-4 text-zinc-800">Configurações do Sistema</h2>
              <p className="text-zinc-600 mb-8">
                Ajuste os limites de vagas para cada setor nos finais de semana. As alterações refletirão imediatamente para os novos voluntários.
              </p>
              
              <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200 max-w-md">
                <h3 className="font-semibold text-zinc-800 mb-6">Limites de Vagas (por turno)</h3>
                
                <div className="space-y-4">
                  {Object.entries(limits).map(([sector, limit]) => (
                    <div key={sector} className="flex items-center justify-between bg-white p-3 rounded-lg border border-zinc-100 shadow-sm">
                      <label className="text-zinc-700 font-medium">{sector}</label>
                      <input 
                        type="number" 
                        min="0"
                        value={limit} 
                        onChange={(e) => handleLimitChange(sector, e.target.value)}
                        className="w-20 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-medium text-zinc-900"
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSaveLimits}
                  disabled={savingLimits}
                  className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm"
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
