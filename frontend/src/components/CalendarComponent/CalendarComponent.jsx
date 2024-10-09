// CalendarComponent.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import './CalendarComponent.css'; // Import custom styles (if needed)
import { useCycleContext } from '../CycleSetup/CycleContext';

const CalendarComponent = ({ setSelectedDate, isLogPeriodOnset=false }) => {
  const { lastPeriod, setLastPeriod } = useCycleContext()
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (isLogPeriodOnset) {
      setLastPeriod(newDate)
    } else {
      setSelectedDate(newDate);
    }
  };

  // Highlight today's date
  const tileClassName = ({ date, view }) => {
    if (date.toDateString() === new Date().toDateString()) {
      return 'bg-violet-400 rounded-3xl active:bg-violet-600 active:rounded-3xl text-white'; // Subtle highlight for today's date
    }
    return '';
  };

  // Disable future dates
  const tileDisabled = ({ date, view }) => {
    let disableDate = false
    // disable all tiles that are greater than todays date
    // disable all tiles that are less than last period
    if (date > new Date()) {
      disableDate = true
    }
    if (!isLogPeriodOnset && date < lastPeriod) {
      disableDate = true
    }
    return disableDate; // Disable all dates after today
  };



  return (
    <div className="flex flex-col items-center gap-2 rounded-lg">
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileClassName={tileClassName} // Custom tile classes
        tileDisabled={tileDisabled}   // Disable future dates
        className="rounded-md border-none shadow-lg p-2"
      />
    </div>
  );
};

export default CalendarComponent;