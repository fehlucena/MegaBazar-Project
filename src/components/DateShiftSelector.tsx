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
            className={`border-2 rounded-2xl p-4 transition-all ${
              isSelected ? 'border-indigo-500 bg-indigo-50/30' : 'border-zinc-200 bg-white hover:border-indigo-200'
            }`}
          >
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleDate(date)}
                className="w-5 h-5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-3 font-medium text-zinc-800">{date}</span>
            </label>

            {isSelected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pl-8 space-y-2"
              >
                <p className="text-sm font-medium text-zinc-500 mb-2">Qual horário?</p>
                <div className="flex flex-wrap gap-2">
                  {shifts.map(shift => (
                    <button
                      key={shift}
                      onClick={() => changeShift(date, shift)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selection.shift === shift
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
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
