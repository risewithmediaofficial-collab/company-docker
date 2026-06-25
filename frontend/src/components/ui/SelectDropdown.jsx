import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = (options || []).map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    if (value === optValue) {
      onChange('');
    } else {
      onChange(optValue);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-colors hover:border-muted-foreground/30 focus:outline-none"
      >
        <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-md">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-secondary/60 focus:outline-none',
                  isSelected ? 'bg-primary/10 font-semibold text-primary hover:bg-primary/15' : 'text-foreground'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
