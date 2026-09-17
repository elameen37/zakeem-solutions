import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductOption {
  value: string;
  label: string;
}

interface ProductFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ProductOption[];
  placeholder?: string;
  className?: string;
}

export const ProductFilterSelect: React.FC<ProductFilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select product...",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white flex items-center justify-between gap-2 text-left focus:outline-none focus:border-[#e57804] transition-colors"
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu with Constrained Height and Side Scrollbar */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-xl bg-[#06152b] border border-white/15 shadow-2xl overflow-hidden animate-fadeIn"
        >
          <div className="max-h-56 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-500 hover:scrollbar-thumb-slate-400 scrollbar-track-white/5 [scrollbar-width:thin]">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2",
                    isSelected
                      ? "bg-[#e57804]/20 text-[#e57804] font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#e57804] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
