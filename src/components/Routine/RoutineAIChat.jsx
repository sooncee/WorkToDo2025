import React, { useState, useRef, useEffect } from 'react';

const RoutineAIChat = ({ routines, setRoutines }) => {
   const [messages, setMessages] = useState([{ role: 'bot', content: '안녕하세요! 어떤 루틴을 만들어드릴까요? <br/>예: "영어/태국어 공부랑 운동하고, 1시부터 7시는 일하는 루틴 짜줘"' }]);
   const [inputText, setInputText] = useState('');
   const [proposedRoutines, setProposedRoutines] = useState([]);
   const messagesEndRef = useRef(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   const handleSendMessage = () => {
      if (!inputText.trim()) return;

      const userMessage = inputText.trim();
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      setInputText('');

      // AI Processing Simulation
      setTimeout(() => {
         processAIRequest(userMessage);
      }, 600);
   };

   const processAIRequest = (text) => {
      if ((text.includes('생성') || text.includes('추가')) && proposedRoutines.length > 0) {
         setRoutines([...routines, ...proposedRoutines]);
         setMessages((prev) => [...prev, { role: 'bot', content: '✅ 요청하신 루틴들을 [오늘의 수행]과 [설정]에 모두 추가했습니다! 🔥' }]);
         setProposedRoutines([]);
         return;
      }

      if (text.includes('영어') || text.includes('태국어') || text.includes('루틴') || text.includes('만들어')) {
         const newProposed = [
            { id: Date.now() + 1, startTime: '08:00', endTime: '09:00', activity: '영어 공부', strategy: '쉐도잉 30분' },
            { id: Date.now() + 2, startTime: '10:00', endTime: '11:00', activity: '태국어 공부', strategy: '단어장 복습' },
            { id: Date.now() + 3, startTime: '13:00', endTime: '19:00', activity: '본업무 (Focus Work)', strategy: '집중 모드' },
            { id: Date.now() + 4, startTime: '20:00', endTime: '21:30', activity: '운동 & 개인공부', strategy: '가벼운 스트레칭 후 독서' },
         ];
         setProposedRoutines(newProposed);

         const response = `추천 루틴입니다:<br>
        <div class="temp-routine-card">
          <b>📋 제안 목록</b><br>
          ${newProposed.map((r) => `• ${r.startTime}: ${r.activity}`).join('<br>')}
        </div>
        마음에 드시면 <b>"생성해줘"</b>라고 입력하세요!`;

         setMessages((prev) => [...prev, { role: 'bot', content: response }]);
      } else {
         setMessages((prev) => [...prev, { role: 'bot', content: '구체적인 활동을 말씀해 주시면 루틴을 짜 드릴게요! (예: 영어공부 포함해서 루틴 짜줘)' }]);
      }
   };

   return (
      <div className="ai-routine-panel">
         <div className="ai-header">
            <div className="ai-status"></div>
            <h3>AI 루틴 매니저</h3>
         </div>
         <div className="ai-messages">
            {messages.map((msg, idx) => (
               <div key={idx} className={msg.role === 'bot' ? 'bot-msg' : 'user-msg'} dangerouslySetInnerHTML={{ __html: msg.content }}></div>
            ))}
            <div ref={messagesEndRef} />
         </div>
         <div className="ai-input-area">
            <input type="text" placeholder="AI에게 루틴 요청하기..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
            <button onClick={handleSendMessage}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
               </svg>
            </button>
         </div>
      </div>
   );
};

export default RoutineAIChat;
