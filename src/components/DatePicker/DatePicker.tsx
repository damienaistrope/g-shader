import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './DatePicker.css';

interface DatePickerProps {
  onDateSelect?: (date: Date | { start: Date; end: Date | null }) => void;
  onCancel?: () => void;
  onConfirm?: (date: Date | { start: Date; end: Date | null }) => void;
  initialDate?: Date;
  mode?: 'single' | 'range';
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  onDateSelect, 
  onCancel, 
  onConfirm,
  initialDate = new Date(),
  mode = 'single'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [rangeStart, setRangeStart] = useState<Date | null>(mode === 'range' ? initialDate : null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  
  const [viewDate, setViewDate] = useState<Date>(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  
  const formatDateMMDDYYYY = (date: Date | null) => {
    if (!date) return '';
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'input'>('calendar');
  const [inputText, setInputText] = useState(formatDateMMDDYYYY(selectedDate));
  const [inputRangeText, setInputRangeText] = useState(`${formatDateMMDDYYYY(rangeStart)} - ${formatDateMMDDYYYY(rangeEnd)}`);

  const handleEditClick = () => {
    setViewMode(viewMode === 'input' ? 'calendar' : 'input');
    if (mode === 'single') {
      setInputText(formatDateMMDDYYYY(selectedDate));
    } else {
      setInputRangeText(`${formatDateMMDDYYYY(rangeStart)}${rangeEnd ? ' - ' + formatDateMMDDYYYY(rangeEnd) : ''}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (mode === 'single') {
      setInputText(val);
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        setViewDate(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
      }
    } else {
      setInputRangeText(val);
      const parts = val.split('-').map(p => p.trim());
      if (parts[0]) {
        const start = new Date(parts[0]);
        if (!isNaN(start.getTime())) {
          setRangeStart(start);
          setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
        }
      }
      if (parts[1]) {
        const end = new Date(parts[1]);
        if (!isNaN(end.getTime())) {
          setRangeEnd(end);
        }
      }
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDate - i, currentMonth: false, monthOffset: -1 });
    }
    // Current month
    for (let i = 1; i <= lastDate; i++) {
      days.push({ day: i, currentMonth: true, monthOffset: 0 });
    }
    // Next month padding
    const totalSlots = 42; // 6 rows of 7
    while (days.length < totalSlots) {
      days.push({ day: days.length - (firstDay + lastDate) + 1, currentMonth: false, monthOffset: 1 });
    }
    return days;
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    
    if (mode === 'single') {
      setSelectedDate(newDate);
      if (onDateSelect) onDateSelect(newDate);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(newDate);
        setRangeEnd(null);
        if (onDateSelect) onDateSelect({ start: newDate, end: null });
      } else {
        if (newDate < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(newDate);
          if (onDateSelect) onDateSelect({ start: newDate, end: rangeStart });
        } else {
          setRangeEnd(newDate);
          if (onDateSelect) onDateSelect({ start: rangeStart, end: newDate });
        }
      }
    }
  };

  const handleYearClick = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    setViewDate(newDate);
    setViewMode('calendar');
  };

  const isToday = (day: number, monthOffset: number = 0) => {
    const today = new Date();
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    return today.getDate() === date.getDate() && 
           today.getMonth() === date.getMonth() && 
           today.getFullYear() === date.getFullYear();
  };

  const isSelected = (day: number, monthOffset: number = 0) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    date.setHours(0,0,0,0);
    
    if (mode === 'single') {
      const s = new Date(selectedDate);
      s.setHours(0,0,0,0);
      return date.getTime() === s.getTime();
    } else {
      const start = rangeStart ? new Date(rangeStart).setHours(0,0,0,0) : null;
      const end = rangeEnd ? new Date(rangeEnd).setHours(0,0,0,0) : null;
      return (start !== null && date.getTime() === start) || 
             (end !== null && date.getTime() === end);
    }
  };

  const isRangeStart = (day: number, monthOffset: number = 0) => {
    if (mode === 'single' || !rangeStart) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day).setHours(0,0,0,0);
    const start = new Date(rangeStart).setHours(0,0,0,0);
    return date === start;
  };

  const isRangeEnd = (day: number, monthOffset: number = 0) => {
    if (mode === 'single' || !rangeEnd) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day).setHours(0,0,0,0);
    const end = new Date(rangeEnd).setHours(0,0,0,0);
    return date === end;
  };

  const isInRange = (day: number, monthOffset: number = 0) => {
    if (mode === 'single' || !rangeStart || !rangeEnd) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day).setHours(0,0,0,0);
    const start = new Date(rangeStart).setHours(0,0,0,0);
    const end = new Date(rangeEnd).setHours(0,0,0,0);
    return date > start && date < end;
  };

  const formattedDate = useMemo(() => {
    if (mode === 'single') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      if (!rangeStart) return 'Select range';
      const start = rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!rangeEnd) return `${start} - `;
      const end = rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
  }, [selectedDate, rangeStart, rangeEnd, mode]);

  const handleConfirm = () => {
    if (viewMode === 'input') {
      if (mode === 'single') {
        const parsedDate = new Date(inputText);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          if (onConfirm) onConfirm(parsedDate);
          return;
        }
      } else {
        const parts = inputRangeText.split('-').map(p => p.trim());
        let start = rangeStart;
        let end = rangeEnd;
        if (parts[0]) {
          const s = new Date(parts[0]);
          if (!isNaN(s.getTime())) start = s;
        }
        if (parts[1]) {
          const e = new Date(parts[1]);
          if (!isNaN(e.getTime())) end = e;
        }
        if (start && onConfirm) {
          onConfirm({ start, end });
          return;
        }
      }
    }

    if (onConfirm) {
      if (mode === 'single') {
        onConfirm(selectedDate);
      } else {
        if (rangeStart) {
          onConfirm({ start: rangeStart, end: rangeEnd });
        }
      }
    }
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className={`md-datepicker ${mode === 'range' && rangeStart && rangeEnd ? 'has-full-range' : ''}`}>
      <div className="md-datepicker__header">
        <div className="md-datepicker__header-text">
          <span className="md-datepicker__label">
            {viewMode === 'input' ? 'Enter date' : mode === 'range' ? 'Depart - Return dates' : 'Select date'}
          </span>
          <h2 className="md-datepicker__selected-date">{formattedDate}</h2>
        </div>
        <button 
          className="md-datepicker__edit-btn"
          onClick={handleEditClick}
          aria-label={viewMode === 'input' ? 'Switch to calendar view' : 'Switch to input view'}
        >
           <span className="material-symbols-outlined">
             {viewMode === 'input' ? 'calendar_today' : 'edit'}
           </span>
        </button>
      </div>

      <div className="md-datepicker__content">
        {viewMode !== 'input' && (
          <div className="md-datepicker__controls">
            <button 
              className="md-datepicker__month-selector"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'year' : 'calendar')}
            >
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
              <span className="material-symbols-outlined">
                {viewMode === 'year' ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
            </button>
            
            <div className="md-datepicker__nav">
              <button className="md-datepicker__nav-btn" onClick={handlePrevMonth}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="md-datepicker__nav-btn" onClick={handleNextMonth}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        <div className="md-datepicker__body relative min-h-[240px]">
          <AnimatePresence mode="wait">
            {viewMode === 'calendar' ? (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="md-datepicker__calendar"
              >
                <div className="md-datepicker__weekdays">
                  {weekDays.map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="md-datepicker__days">
                  {daysInMonth.map((d, i) => {
                    const selected = d.currentMonth && isSelected(d.day, d.monthOffset);
                    const isStart = d.currentMonth && isRangeStart(d.day, d.monthOffset);
                    const isEnd = d.currentMonth && isRangeEnd(d.day, d.monthOffset);
                    const inRange = d.currentMonth && isInRange(d.day, d.monthOffset);
                    
                    return (
                      <button
                        key={i}
                        className={`md-datepicker__day relative ${!d.currentMonth ? 'is-outside' : ''} ${isToday(d.day, d.monthOffset) ? 'is-today' : ''} ${selected ? 'is-selected' : ''} ${inRange ? 'is-in-range' : ''} ${isStart ? 'is-range-start' : ''} ${isEnd ? 'is-range-end' : ''}`}
                        onClick={() => handleDateClick(d.day, d.monthOffset)}
                        disabled={mode === 'single' && !d.currentMonth}
                      >
                        <Ripple />
                        <span className="md-datepicker__day-label">{d.day}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : viewMode === 'year' ? (
              <motion.div 
                key="year"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="md-datepicker__year-selector h-[240px] overflow-y-auto grid grid-cols-3 gap-2 p-2"
              >
                {Array.from({ length: 151 }, (_, i) => 1900 + i).map(year => (
                  <button 
                    key={year}
                    className={`md-datepicker__year-item relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-[var(--md-sys-color-surface-variant)] ${year === viewDate.getFullYear() ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface)]'}`}
                    onClick={() => handleYearClick(year)}
                  >
                    <Ripple />
                    <span className="relative z-1">{year}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="md-datepicker__input-container p-4"
              >
                 <div className="md-datepicker__input-field">
                   <label className="md-datepicker__input-label">Date{mode === 'range' ? ' Range' : ''}</label>
                   <input 
                     type="text" 
                     className="md-datepicker__date-input"
                     value={mode === 'range' ? inputRangeText : inputText}
                     onChange={handleInputChange}
                     placeholder={mode === 'range' ? "MM/DD/YYYY - MM/DD/YYYY" : "MM/DD/YYYY"}
                     autoFocus
                   />
                   <span className="md-datepicker__input-helper">{mode === 'range' ? "MM/DD/YYYY - MM/DD/YYYY" : "MM/DD/YYYY"}</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="md-datepicker__actions">
        <button className="md-datepicker__action-btn" onClick={handleCancelClick}>Cancel</button>
        <button className="md-datepicker__action-btn" onClick={handleConfirm}>OK</button>
      </div>
    </div>
  );
};
