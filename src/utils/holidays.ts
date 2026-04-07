// Indian National and Major Holidays
// Format: MM-DD -> Holiday name

export interface Holiday {
  name: string;
  type: 'national' | 'religious' | 'regional';
}

// Fixed date holidays (same every year)
const FIXED_HOLIDAYS: Record<string, Holiday> = {
  '01-01': { name: 'New Year\'s Day', type: 'national' },
  '01-26': { name: 'Republic Day', type: 'national' },
  '03-08': { name: 'Maha Shivaratri', type: 'religious' },
  '03-25': { name: 'Holi', type: 'religious' },
  '04-14': { name: 'Ambedkar Jayanti', type: 'national' },
  '04-21': { name: 'Ram Navami', type: 'religious' },
  '05-01': { name: 'May Day', type: 'national' },
  '05-23': { name: 'Buddha Purnima', type: 'religious' },
  '06-17': { name: 'Eid ul-Fitr', type: 'religious' },
  '07-17': { name: 'Muharram', type: 'religious' },
  '08-15': { name: 'Independence Day', type: 'national' },
  '08-26': { name: 'Janmashtami', type: 'religious' },
  '09-16': { name: 'Milad un-Nabi', type: 'religious' },
  '10-02': { name: 'Gandhi Jayanti', type: 'national' },
  '10-12': { name: 'Dussehra', type: 'religious' },
  '10-20': { name: 'Eid ul-Adha', type: 'religious' },
  '10-31': { name: 'Sardar Patel Jayanti', type: 'national' },
  '11-01': { name: 'Diwali', type: 'religious' },
  '11-02': { name: 'Govardhan Puja', type: 'religious' },
  '11-03': { name: 'Bhai Dooj', type: 'religious' },
  '11-15': { name: 'Guru Nanak Jayanti', type: 'religious' },
  '12-25': { name: 'Christmas', type: 'religious' },
};

// 2026 specific dates (for variable holidays)
const HOLIDAYS_2026: Record<string, Holiday> = {
  '03-10': { name: 'Holi', type: 'religious' },
  '03-30': { name: 'Ram Navami', type: 'religious' },
  '04-14': { name: 'Ambedkar Jayanti', type: 'national' },
  '05-12': { name: 'Buddha Purnima', type: 'religious' },
  '08-14': { name: 'Janmashtami', type: 'religious' },
  '10-02': { name: 'Gandhi Jayanti / Dussehra', type: 'national' },
  '10-20': { name: 'Diwali', type: 'religious' },
  '11-04': { name: 'Guru Nanak Jayanti', type: 'religious' },
};

// 2025 specific dates
const HOLIDAYS_2025: Record<string, Holiday> = {
  '03-14': { name: 'Holi', type: 'religious' },
  '04-06': { name: 'Ram Navami', type: 'religious' },
  '05-12': { name: 'Buddha Purnima', type: 'religious' },
  '08-16': { name: 'Janmashtami', type: 'religious' },
  '10-02': { name: 'Dussehra', type: 'religious' },
  '10-20': { name: 'Diwali', type: 'religious' },
  '11-05': { name: 'Guru Nanak Jayanti', type: 'religious' },
};

/**
 * Get holiday for a specific date
 */
export function getHoliday(date: Date): Holiday | undefined {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  const year = date.getFullYear();

  // Check year-specific holidays first
  if (year === 2026 && HOLIDAYS_2026[key]) {
    return HOLIDAYS_2026[key];
  }
  if (year === 2025 && HOLIDAYS_2025[key]) {
    return HOLIDAYS_2025[key];
  }

  // Fall back to fixed holidays
  return FIXED_HOLIDAYS[key];
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date): boolean {
  return getHoliday(date) !== undefined;
}

/**
 * Get all holidays for a given month
 */
export function getHolidaysInMonth(year: number, month: number): Map<number, Holiday> {
  const holidays = new Map<number, Holiday>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const holiday = getHoliday(date);
    if (holiday) {
      holidays.set(day, holiday);
    }
  }

  return holidays;
}
