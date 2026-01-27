import React from 'react';

const RoutineTracker = ({ routines, routineLogs }) => {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth();
   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   // Calculate days for the current month
   const firstDay = new Date(year, month, 1).getDay();
   const lastDate = new Date(year, month + 1, 0).getDate();

   const cells = [];
   // Empty cells for first week padding
   for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="tracker-cell empty"></div>);
   }

   // Actual days
   for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const completedIds = routineLogs[dateStr] || [];
      const isPerfect = routines.length > 0 && completedIds.length === routines.length;
      const isToday = d === now.getDate();

      cells.push(
         <div key={d} className={`tracker-cell ${isPerfect ? 'perfect' : ''} ${isToday ? 'today' : ''}`}>
            <span className="date-num">{d}</span>
            <div className="mark">X</div>
         </div>,
      );
   }

   return (
      <div className="tracker-card">
         <div className="tracker-header">
            <h3>Don't Break the Chain</h3>
            <p>루틴 완수 시 'X'가 각인됩니다.</p>
         </div>
         <div className="routine-calendar-grid">
            {dayNames.map((d) => (
               <div key={d} className="day-header">
                  {d}
               </div>
            ))}
            {cells}
         </div>
      </div>
   );
};

export default RoutineTracker;
