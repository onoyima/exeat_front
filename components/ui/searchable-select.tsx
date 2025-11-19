'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchLower) ||
      option.description?.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  // Get selected option
  const selectedOption = options.find((option) => option.value === value);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearch('');
  };

  // Handle close
  const handleClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setSearch('');
    }
  };

  // Clear search when closed
  React.useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Render option list
  const OptionList = () => (
    <div className="flex flex-col h-full min-h-0">
      {/* Search Input */}
      <div className="p-3 border-b flex-shrink-0 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              // Prevent form submission when Enter is pressed in search input
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                // If there's only one filtered option, select it
                if (filteredOptions.length === 1) {
                  handleSelect(filteredOptions[0].value);
                }
              }
            }}
            className="pl-9 pr-9 h-10"
            autoFocus
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md hover:bg-accent transition-colors text-left',
                  value === option.value && 'bg-accent'
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium leading-tight">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Mobile: Use Dialog (Full screen)
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent
            className="max-w-[95vw] w-full p-0 gap-0 flex flex-col !top-4 !translate-y-0 !bottom-auto data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4 rounded-b-lg rounded-t-lg"
            style={{
              maxHeight: '55vh',
              minHeight: '300px',
            }}
            onInteractOutside={(e) => {
              // Allow closing by clicking outside
              setOpen(false);
              setSearch('');
            }}
            onEscapeKeyDown={(e) => {
              // Allow closing with Escape key
              setOpen(false);
              setSearch('');
            }}
          >
            <DialogHeader className="px-4 py-3 border-b flex-shrink-0 bg-white rounded-t-lg">
              <DialogTitle className="text-base">{placeholder}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <OptionList />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[400px] flex flex-col" align="start">
        <OptionList />
      </PopoverContent>
    </Popover>
  );
}

