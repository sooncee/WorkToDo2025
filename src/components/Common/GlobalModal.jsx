import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../../store/modalStore';

const GlobalModal = () => {
	const { isOpen, editingTodo, modalType, onSave, closeModal } = useModalStore();
	const [form, setForm] = useState({ title: '', content: '', color: '#a8a8a8' });
	const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b', '#a8a8a8'];

	useEffect(() => {
		if (isOpen) {
			if (editingTodo) {
				setForm({
					title: editingTodo.title || '',
					content: editingTodo.content || '',
					color: editingTodo.color || '#a8a8a8',
				});
			} else {
				setForm({ title: '', content: '', color: '#a8a8a8' });
			}
		}
	}, [editingTodo, isOpen]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.title) return alert('제목을 입력해주세요.');
		if (onSave) onSave(form);
		closeModal();
	};

	// React Portal을 사용하여 body 바로 아래에 렌더링 (최상위 루트 강제)
	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="modal"
					onClick={closeModal}
				>
					<motion.div
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						className="modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<span className="close-add" onClick={closeModal}>
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
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
};

export default GlobalModal;
