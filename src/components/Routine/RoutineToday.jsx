import React from 'react';

const RoutineToday = ({ routines, routineLogs, toggleRoutine }) => {
   const today = new Date().toISOString().split('T')[0];
   const completedIds = routineLogs[today] || [];
   const progress = routines.length === 0 ? 0 : Math.round((completedIds.length / routines.length) * 100);

   const sortedRoutines = [...routines].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

   return (
      <div id="routineToday" className="routine-tab-content active">
         <div className="routine-list-header">
            <h2 id="routineDate">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <div className="daily-progress">
               <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="progress-text">{progress}%</span>
            </div>
         </div>

         <div className="routine-checklist">
            {sortedRoutines.length === 0 ? (
               <div className="empty-routine">등록된 루틴이 없습니다.</div>
            ) : (
               sortedRoutines.map((routine) => (
                  <div key={routine.id} className={`routine-check-item ${completedIds.includes(routine.id) ? 'completed' : ''}`} onClick={() => toggleRoutine(routine.id)}>
                     <div className="check-box">{completedIds.includes(routine.id) ? '✓' : ''}</div>
                     <div className="info">
                        <div className="time">
                           {routine.startTime} - {routine.endTime}
                        </div>
                        <div className="activity">{routine.activity}</div>
                        <div className="strategy">{routine.strategy}</div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default RoutineToday;
