'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoundCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function RoundCheckbox({ checked, onChange, className }: RoundCheckboxProps) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0",
        checked
          ? "bg-[#3D7CFF] border-2 border-[#3D7CFF] scale-100"
          : "bg-white border-2 border-slate-300 hover:border-slate-400",
        className
      )}
      aria-checked={checked}
      role="checkbox"
      type="button"
    >
      {checked && (
        <Check
          className="w-3.5 h-3.5 text-white stroke-[3]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </button>
  );
}
