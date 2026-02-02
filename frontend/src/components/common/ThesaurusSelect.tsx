import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { thesaurusApi, DropdownOption } from '../../api/thesaurus';
import { ChevronDown, X } from 'lucide-react';

interface ThesaurusSelectProps {
  category: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

export function ThesaurusSelect({
  category,
  name,
  value,
  onChange,
  label,
  placeholder = 'Select or type...',
  className = '',
  allowCustom = true,
}: ThesaurusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: options = [], isLoading } = useQuery({
    queryKey: ['thesaurus', category],
    queryFn: () => thesaurusApi.getDropdownOptions(category),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Sync input with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions(options);
    } else {
      const searchTerm = inputValue.toLowerCase();
      setFilteredOptions(
        options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(searchTerm) ||
            opt.value.toLowerCase().includes(searchTerm)
        )
      );
    }
  }, [inputValue, options]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);

    if (allowCustom) {
      // Create a synthetic event to update the parent form
      const syntheticEvent = {
        target: {
          name,
          value: e.target.value,
          type: 'text',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleSelectOption = (option: DropdownOption) => {
    setInputValue(option.value);
    setIsOpen(false);

    // Create a synthetic event to update the parent form
    const syntheticEvent = {
      target: {
        name,
        value: option.value,
        type: 'text',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleClear = () => {
    setInputValue('');
    const syntheticEvent = {
      target: {
        name,
        value: '',
        type: 'text',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={isLoading ? 'Loading...' : placeholder}
            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {isLoading ? 'Loading options...' : 'No matching options'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none ${
                    option.value === value ? 'bg-primary-100 text-primary-700' : ''
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {options.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {options.length} options available
        </div>
      )}
    </div>
  );
}
