import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  variant?: 'filter' | 'form';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
  icon: Icon,
  variant = 'form'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const isFilter = variant === 'filter';

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-all duration-200 cursor-pointer text-left select-none ${
          isFilter
            ? `pl-3.5 pr-2.5 py-1.5 rounded-full text-xs font-semibold border ${
                isOpen
                  ? 'border-[#e45809] ring-2 ring-orange-500/20 bg-white shadow-sm text-[#0c233c]'
                  : 'border-slate-300 hover:border-orange-400 bg-white text-slate-700 shadow-2xs hover:bg-slate-50/80'
              }`
            : `pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium border ${
                isOpen
                  ? 'border-[#e45809] ring-3 ring-orange-500/15 bg-white text-slate-800'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-800 shadow-2xs hover:border-slate-300'
              }`
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && (
            <div className={`${isFilter ? 'text-[#e45809]' : 'text-slate-400'} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className={`truncate ${!selectedOption && !isFilter ? 'text-slate-400' : 'text-slate-800 font-semibold'}`}>
            {displayLabel}
          </span>
        </div>

        <div className="shrink-0 ml-1.5 text-slate-400">
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5] text-[#e45809] transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.2] text-slate-400 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Dropdown Menu (Matches Reference Model exactly with website branding) */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full min-w-[170px] bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-52 overflow-y-auto overflow-x-hidden py-1 divide-y divide-slate-50 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isFirst = idx === 0;

              return (
                <button
                  key={option.value || idx}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50 text-[#e45809] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  } ${isFirst && isSelected ? 'bg-orange-50/90' : ''}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e45809] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
