import { create } from 'zustand';

export const useDragStore = create((set) => ({
	draggingTodoId: null,
	setDraggingTodoId: (id) => set({ draggingTodoId: id }),
}));
