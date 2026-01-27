import React, { useState } from 'react';

const RoutineSettings = ({ routines, saveRoutine, deleteRoutine }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingRoutine, setEditingRoutine] = useState(null);

   const [form, setForm] = useState({
      activity: '',
      startTime: '09:00',
      endTime: '10:00',
      strategy: '',
   });

   const handleOpenModal = (routine = null) => {
      if (routine) {
         setEditingRoutine(routine);
         setForm({ ...routine });
      } else {
         setEditingRoutine(null);
         setForm({ activity: '', startTime: '09:00', endTime: '10:00', strategy: '' });
      }
      setIsModalOpen(true);
   };

   const handleSubmit = () => {
      if (!form.activity) return alert('활동 내용을 입력해주세요.');
      saveRoutine({ ...form, id: editingRoutine?.id });
      setIsModalOpen(false);
   };

   return (
      <div id="routineSettings" className="routine-tab-content active">
         <div className="settings-header">
            <h2>루틴 관리</h2>
            <button className="add-btn-sm" onClick={() => handleOpenModal()}>
               + 루틴 추가
            </button>
         </div>

         <div className="manage-list">
            {routines.length === 0 ? (
               <div className="empty-routine">관리할 루틴이 없습니다.</div>
            ) : (
               routines.map((routine) => (
                  <div key={routine.id} className="manage-item">
                     <div className="info">
                        <strong>
                           {routine.startTime} - {routine.endTime}
                        </strong>
                        <span>{routine.activity}</span>
                     </div>
                     <div className="actions">
                        <button className="add-btn-sm" style={{ background: '#eee', color: '#000', marginRight: '8px' }} onClick={() => handleOpenModal(routine)}>
                           수정
                        </button>
                        <button className="delete-btn-sm" onClick={() => deleteRoutine(routine.id)}>
                           삭제
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* Routine Modal */}
         {isModalOpen && (
            <div className="modal" style={{ display: 'flex' }}>
               <div className="modal-content">
                  <div className="modal-header">
                     <h2>{editingRoutine ? '루틴 수정' : '루틴 추가'}</h2>
                     <span className="close-routine-modal" onClick={() => setIsModalOpen(false)}>
                        &times;
                     </span>
                  </div>
                  <div className="modal-body">
                     <div className="form-group">
                        <label>활동 내용</label>
                        <input type="text" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="활동 내용을 입력하세요" />
                     </div>
                     <div className="form-row">
                        <div className="form-group">
                           <label>시작 시간</label>
                           <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                        </div>
                        <div className="form-group">
                           <label>종료 시간</label>
                           <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                        </div>
                     </div>
                     <div className="form-group">
                        <label>전문가의 전략 (Focus)</label>
                        <textarea value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="수행 가이드를 간단히 적어보세요"></textarea>
                     </div>
                  </div>
                  <div className="modal-buttons">
                     <button className="save-btn" onClick={handleSubmit}>
                        저장
                     </button>
                     <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                        취소
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default RoutineSettings;
