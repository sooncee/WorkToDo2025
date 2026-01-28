import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useTodos = () => {
	const queryClient = useQueryClient();

	// 날짜 형식 표준화 (YYYY-MM-DD)
	const normalizeDate = (dateStr) => {
		if (!dateStr) return null;
		const [y, m, d] = dateStr.split('-').map(Number);
		if (!y || !m || !d) return dateStr;
		const mm = String(m).padStart(2, '0');
		const dd = String(d).padStart(2, '0');
		return `${y}-${mm}-${dd}`;
	};

	// DB -> 리액트 (camelCase + 날짜 정규화)
	const mapTodo = (t) => ({
		...t,
		createdAt: t.created_at,
		completedAt: t.completed_at,
		scheduledDate: normalizeDate(t.scheduled_date),
	});

	// 리액트 -> DB (필터링 및 snake_case 변환)
	const mapToDB = (t) => {
		const mapped = {
			title: t.title,
			content: t.content,
			completed: t.completed,
			order: t.order,
			color: t.color,
			completed_at: t.completedAt,
			scheduled_date: normalizeDate(t.scheduledDate),
		};

		// undefined 필드 제거
		Object.keys(mapped).forEach((key) => {
			if (mapped[key] === undefined) delete mapped[key];
		});
		return mapped;
	};

	// 1. Fetch
	const { data: todos = [], isLoading } = useQuery({
		queryKey: ['todos'],
		queryFn: async () => {
			const { data, error } = await supabase.from('todos').select('*').order('order', { ascending: true });
			if (error) throw error;
			return data.map(mapTodo);
		},
	});

	// 2. Update
	const updateMutation = useMutation({
		mutationFn: async (updatedTodo) => {
			const dbTodo = mapToDB(updatedTodo);
			// id와 created_at은 DB가 자동 관리하므로 업데이트 페이로드에서 제외하고 조건절에만 사용
			const { error } = await supabase.from('todos').update(dbTodo).eq('id', updatedTodo.id);
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	// 3. Add
	const addMutation = useMutation({
		mutationFn: async (newTodo) => {
			const dbTodo = mapToDB(newTodo);
			const { data, error } = await supabase.from('todos').insert(dbTodo).select();
			if (error) throw error;
			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	// 4. Delete
	const deleteMutation = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from('todos').delete().eq('id', id);
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	return {
		todos,
		isLoading,
		addTodo: addMutation.mutate,
		updateTodo: updateMutation.mutate,
		deleteTodo: deleteMutation.mutate,
	};
};
