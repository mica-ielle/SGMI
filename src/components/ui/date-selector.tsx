// Sélecteur de date sans popover - remplace les popovers par un dialog
import { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from './button';
import { Calendar } from './calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';

interface DateSelectorProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const DateSelector = ({ 
  selected, 
  onSelect, 
  disabled = false, 
  placeholder = "Sélectionner une date",
  className = ""
}: DateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(
    selected ? selected.toISOString().split('T')[0] : ''
  );

  const handleDateSelect = (date: Date | undefined) => {
    onSelect?.(date);
    if (date) {
      setInputValue(date.toISOString().split('T')[0]);
    }
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        onSelect?.(date);
      }
    }
  };

  const toggleInputMode = () => {
    setInputMode(!inputMode);
  };

  if (inputMode) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          type="date"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleInputMode}
        >
          <CalendarIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={`justify-start ${className}`}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selected 
          ? selected.toLocaleDateString('fr-FR')
          : placeholder
        }
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Sélectionner une date
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleInputMode}
                >
                  <CalendarIcon className="w-4 h-4" />
                  Saisie manuelle
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};