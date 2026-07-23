"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type DatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent ${
          disabled
            ? "bg-surface-muted text-text-secondary cursor-not-allowed opacity-75"
            : "text-text-primary hover:bg-surface-secondary cursor-pointer"
        }`}
      >
        <span className={!selectedDate ? "text-text-muted" : ""}>
          {selectedDate ? format(selectedDate, "PPP") : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-surface border border-border rounded-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 right-0 md:left-0 md:right-auto">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="border-0 p-0 m-0"
            captionLayout="dropdown"
            hideNavigation
            classNames={{
              day: "h-9 w-9 p-0 font-normal hover:bg-accent-light hover:text-accent rounded-lg text-sm flex items-center justify-center transition-colors cursor-pointer text-text-primary",
              selected: "bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground",
              today: "text-accent border border-accent/30 font-semibold rounded-lg",
              disabled: "text-text-muted opacity-50 cursor-not-allowed",
              outside: "text-text-muted/40 opacity-40",
              chevron: "fill-text-secondary h-4 w-4",
              caption_label: "z-[1] relative inline-flex items-center whitespace-nowrap border-0 text-sm text-text-primary font-medium px-1",
              month_caption: "flex justify-center items-center h-8 text-sm font-semibold text-text-primary mb-2",
              month_grid: "w-full border-collapse space-y-1",
              weekdays: "flex justify-between text-text-muted text-xs font-medium py-1",
              weekday: "w-9 text-center",
              week: "flex justify-between mt-1",
              nav: "flex items-center gap-1 absolute right-3 top-3",
              button_previous: "h-7 w-7 bg-surface border border-border rounded-md hover:bg-surface-secondary flex items-center justify-center transition-colors cursor-pointer text-text-secondary hover:text-accent",
              button_next: "h-7 w-7 bg-surface border border-border rounded-md hover:bg-surface-secondary flex items-center justify-center transition-colors cursor-pointer text-text-secondary hover:text-accent",
              dropdown_root: "relative inline-flex items-center bg-surface border border-border rounded-lg px-2 py-1",
              dropdown: "z-[2] opacity-0 appearance-none absolute inset-0 w-full m-0 p-0 cursor-pointer border-none leading-inherit",
              months_dropdown: "",
              years_dropdown: "",
            }}
          />
        </div>
      )}
    </div>
  );
}