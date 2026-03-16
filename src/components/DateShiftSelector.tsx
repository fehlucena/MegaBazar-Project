import React from 'react';
import { motion } from 'framer-motion';

export interface DayShiftSelection {
  date: string;
  shift: string;
}

interface Props {
  dates: string[];
  shifts: string[];
  selections: DayShiftSelection[];
  onChange: (selections: DayShiftSelection[]) => void;
}

export default function DateShiftSelector({ dates, shifts, selections, onChange }: Props) {
  const toggleDate = (date: string) => {
    const existing = selections.find(s => s.date === date);
    if (existing) {
      onChange(selections.filter(s => s.date !== date));
    } else {
      onChange([...selections, { date, shift: shifts[0] }]);
    }
  };

  const changeShift = (date: string, shift: string) => {
    onChange(selections.map(s => s.date === date ? { ...s, shift } : s));
  };

  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const selection = selections.find(s => s.date === date);
        const isSelected = !!selection;

        return (
          <div 
            key={date} 
            className={`border-2 p-4 md:p-5 transition-all ${
              isSelected ? 'border-[#E85D22] bg-[#E85D22]/10 shadow-[2px_2px_0px_0px_#E85D22] md:shadow-[4px_4px_0px_0px_#E85D22]' : 'border-[#1A1A1A] bg-white hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
            }`}
          >
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleDate(date)}
                className="w-5 h-5 md:w-6 md:h-6 text-[#E85D22] border-2 border-[#1A1A1A] rounded-none focus:ring-[#E85D22] focus:ring-offset-0"
              />
              <span className="ml-3 md:ml-4 font-bold text-base md:text-lg text-[#1A1A1A]">{date}</span>
            </label>

            {isSelected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 md:mt-6 pl-8 md:pl-10 space-y-2"
              >
                <p className="text-xs md:text-sm font-black text-[#1A1A1A] uppercase tracking-widest mb-2 md:mb-3">Qual horário?</p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {shifts.map(shift => (
                    <button
                      key={shift}
                      onClick={() => changeShift(date, shift)}
                      className={`px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-2 ${
                        selection.shift === shift
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[2px_2px_0px_0px_#E85D22]'
                          : 'bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F0EFEA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
                      }`}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
