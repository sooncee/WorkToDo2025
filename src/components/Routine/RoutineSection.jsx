import React, { useState, useEffect } from 'react';
import RoutineToday from './RoutineToday';
import RoutineSettings from './RoutineSettings';
import RoutineTracker from './RoutineTracker';
import RoutineAIChat from './RoutineAIChat';

const RoutineSection = () => {
   const [routines, setRoutines] = useState(() => {
      const saved = localStorage.getItem('routines');
      return saved ? JSON.parse(saved) : [];
   });

   const [routineLogs, setRoutineLogs] = useState(() => {
      const saved = localStorage.getItem('routineLogs');
      return saved ? JSON.parse(saved) : {};
   });

   const [activeTab, setActiveTab] = useState('today');

   // Save Data whenever state changes
   useEffect(() => {
      localStorage.setItem('routines', JSON.stringify(routines));
      localStorage.setItem('routineLogs', JSON.stringify(routineLogs));
   }, [routines, routineLogs]);

   const toggleRoutine = (id) => {
      const today = new Date().toISOString().split('T')[0];
      const newLogs = { ...routineLogs };
      if (!newLogs[today]) newLogs[today] = [];

      const index = newLogs[today].indexOf(id);
      if (index === -1) {
         newLogs[today].push(id);
      } else {
         newLogs[today].splice(index, 1);
      }
      setRoutineLogs(newLogs);
   };

   const deleteRoutine = (id) => {
      if (window.confirm('이 루틴을 삭제하시겠습니까?')) {
         setRoutines(routines.filter((r) => r.id !== id));
      }
   };

   const saveRoutine = (newRoutine) => {
      if (newRoutine.id) {
         setRoutines(routines.map((r) => (r.id === newRoutine.id ? newRoutine : r)));
      } else {
         setRoutines([...routines, { ...newRoutine, id: Date.now() }]);
      }
   };

   return (
      <section className="section routine-section">
         <div className="section-header">
            <h1>데일리 루틴</h1>
            <p>전문가들이 설계한 효율적인 하루 시스템</p>
         </div>

         <div className="routine-layout">
            <div className="routine-main-col">
               <div className="routine-tabs">
                  <button className={`routine-tab-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
                     오늘의 수행
                  </button>
                  <button className={`routine-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                     루틴 설정
                  </button>
               </div>

               {activeTab === 'today' ? (
                  <RoutineToday routines={routines} routineLogs={routineLogs} toggleRoutine={toggleRoutine} />
               ) : (
                  <RoutineSettings routines={routines} saveRoutine={saveRoutine} deleteRoutine={deleteRoutine} />
               )}
            </div>

            <div className="routine-side-col">
               <RoutineTracker routines={routines} routineLogs={routineLogs} />
               <RoutineAIChat routines={routines} setRoutines={setRoutines} />
            </div>
         </div>
      </section>
   );
};

export default RoutineSection;
