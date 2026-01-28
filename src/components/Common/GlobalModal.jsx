import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from '../../store/modalStore';

const GlobalModal = () => {
	const { isOpen, editingTodo, modalType, onSave, closeModal } = useModalStore();
	const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b', '#a8a8a8'];

	// 모달이 닫혀있으면 아무것도 렌더링하지 않음
	if (!isOpen) return null;

	return createPortal(
		<ModalContent
			key={editingTodo?.id || 'new'}
			editingTodo={editingTodo}
			modalType={modalType}
			onSave={onSave}
			closeModal={closeModal}
			colors={colors}
		/>,
		document.body,
	);
};

// 내부 컴포넌트로 분리하여 key를 통한 상태 초기화 및 린트 에러 해결
const ModalContent = ({ editingTodo, modalType, onSave, closeModal, colors }) => {
	const [form, setForm] = useState({
		title: editingTodo?.title || '',
		content: editingTodo?.content || '',
		color: editingTodo?.color || '#a8a8a8',
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.title.trim()) return alert('제목을 입력해주세요.');
		if (onSave) onSave(form);
		closeModal();
	};

	return (
		<div className="modal" onClick={closeModal}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<span
					className="close-add"
					style={{ cursor: 'pointer', float: 'right', fontSize: '24px' }}
					onClick={closeModal}
				>
					&times;
				</span>
				<h2 style={{ marginBottom: '25px', fontWeight: 800 }}>
					{modalType === 'task-edit' ? '할일 수정' : '새 할일 추가'}
				</h2>
				<form className="modal-form" onSubmit={handleSubmit}>
					<label>제목</label>
					<input
						type="text"
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
						placeholder="제목을 입력하세요"
						autoFocus
					/>
					<label>내용</label>
					<textarea
						value={form.content}
						onChange={(e) => setForm({ ...form, content: e.target.value })}
						placeholder="내용을 입력하세요"
						rows="5"
					/>
					<div className="modal-color-picker">
						<label>색상</label>
						<div className="color-options">
							{colors.map((c) => (
								<div
									key={c}
									className={`color-option ${form.color === c ? 'active' : ''}`}
									style={{ background: c }}
									onClick={() => setForm({ ...form, color: c })}
								></div>
							))}
						</div>
					</div>
					<div className="modal-buttons">
						<button type="submit" className="save-btn">
							{modalType === 'task-edit' ? '저장' : '추가'}
						</button>
						<button type="button" className="cancel-btn" onClick={closeModal}>
							취소
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default GlobalModal;
