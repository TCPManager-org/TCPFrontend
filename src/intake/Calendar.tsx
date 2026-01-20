import React, { useMemo } from 'react';
import '../calendar.css';

interface LastDaysCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export const LastDaysCalendar: React.FC<LastDaysCalendarProps> = ({
                                                                      selectedDate,
                                                                      onDateSelect,
                                                                  }) => {
    // Last 7 days
    const days = useMemo(() => {
        const tempDays: Date[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            tempDays.push(d);
        }
        return tempDays;
    }, []);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.toDateString() === d2.toDateString();

    const getDayName = (d: Date) =>
        new Intl.DateTimeFormat('pl-PL', { weekday: 'short' }).format(d);

    const getDayNumber = (d: Date) =>
        new Intl.DateTimeFormat('pl-PL', { day: 'numeric' }).format(d);

    return (
        <div className="calendar-container">
            {days.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                let className = 'calendar-day';
                if (isSelected) className += ' calendar-day--selected';
                else if (isToday) className += ' calendar-day--today';

                return (
                    <button
                        key={date.toISOString()}
                        onClick={() => onDateSelect(date)}
                        className={className}
                        type="button"
                    >
                        <span className="day-name">{getDayName(date)}</span>
                        <span className="day-number">{getDayNumber(date)}</span>
                    </button>
                );
            })}
        </div>
    );
};