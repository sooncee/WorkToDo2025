import { create } from 'zustand';

export const useModalStore = create((set) => ({
	isOpen: false,
	editingTodo: null,
	// Types: 'task-edit', 'task-add', etc.
	modalType: null,
	onSave: null,

	openTaskModal: (todo = null, onSave) =>
		set({
			isOpen: true,
			editingTodo: todo,
			modalType: todo ? 'task-edit' : 'task-add',
			onSave: onSave,
		}),

	closeModal: () =>
		set({
			isOpen: false,
			editingTodo: null,
			modalType: null,
			onSave: null,
		}),
}));
