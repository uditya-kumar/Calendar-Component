import { useReducer, useCallback } from 'react';
import type { CalendarState, CalendarAction, DateRange } from '../types/calendar.types';
import { getNextMonth, getPreviousMonth, isSameDay, isBefore } from '../utils/dateUtils';

const initialState: CalendarState = {
  currentMonth: new Date(),
  selectedRange: { start: null, end: null },
  selectionMode: 'idle',
  hoveredDate: null,
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'NAVIGATE_MONTH': {
      const newMonth = action.direction === 'next'
        ? getNextMonth(state.currentMonth)
        : getPreviousMonth(state.currentMonth);
      return { ...state, currentMonth: newMonth };
    }

    case 'SET_MONTH':
      return { ...state, currentMonth: action.date };

    case 'SELECT_DATE': {
      const { date, ctrlKey } = action;
      const { selectedRange } = state;

      // Without Ctrl: always select single day
      if (!ctrlKey) {
        return {
          ...state,
          selectedRange: { start: date, end: date },
          selectionMode: 'complete',
        };
      }

      // With Ctrl: extend to range from current selection
      if (ctrlKey && selectedRange.start) {
        // If same date clicked, keep as single day
        if (isSameDay(date, selectedRange.start)) {
          return state;
        }

        // Ensure proper order (start before end)
        const isClickedBeforeStart = isBefore(date, selectedRange.start);
        return {
          ...state,
          selectedRange: {
            start: isClickedBeforeStart ? date : selectedRange.start,
            end: isClickedBeforeStart ? selectedRange.start : date,
          },
          selectionMode: 'complete',
        };
      }

      // Ctrl pressed but no selection yet - select single day
      return {
        ...state,
        selectedRange: { start: date, end: date },
        selectionMode: 'complete',
      };
    }

    case 'HOVER_DATE':
      return { ...state, hoveredDate: action.date };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedRange: { start: null, end: null },
        selectionMode: 'idle',
        hoveredDate: null,
      };

    default:
      return state;
  }
}

export function useCalendarState(initialMonth?: Date) {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    currentMonth: initialMonth || new Date(),
  });

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    dispatch({ type: 'NAVIGATE_MONTH', direction });
  }, []);

  const setMonth = useCallback((date: Date) => {
    dispatch({ type: 'SET_MONTH', date });
  }, []);

  const selectDate = useCallback((date: Date, ctrlKey?: boolean) => {
    dispatch({ type: 'SELECT_DATE', date, ctrlKey });
  }, []);

  const hoverDate = useCallback((date: Date | null) => {
    dispatch({ type: 'HOVER_DATE', date });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  // Calculate preview range for hover state
  const getPreviewRange = useCallback((): DateRange => {
    const { selectedRange, selectionMode, hoveredDate } = state;

    if (selectionMode === 'selecting-end' && selectedRange.start && hoveredDate) {
      const isHoveredBeforeStart = isBefore(hoveredDate, selectedRange.start);
      return {
        start: isHoveredBeforeStart ? hoveredDate : selectedRange.start,
        end: isHoveredBeforeStart ? selectedRange.start : hoveredDate,
      };
    }

    return selectedRange;
  }, [state]);

  return {
    currentMonth: state.currentMonth,
    selectedRange: state.selectedRange,
    selectionMode: state.selectionMode,
    hoveredDate: state.hoveredDate,
    previewRange: getPreviewRange(),
    navigateMonth,
    setMonth,
    selectDate,
    hoverDate,
    clearSelection,
  };
}
