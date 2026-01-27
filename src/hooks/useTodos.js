import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useTodos = () => {
	const queryClient = useQueryClient();

	// Helper to map DB fields to JS fields
	const mapTodo = (t) => ({
		...t,
		createdAt: t.createdAt || t.created_at,
		completedAt: t.completedAt || t.completed_at,
		scheduledDate: t.scheduledDate || t.scheduled_date,
	});

	// 1. Fetch Todos (GET)
	const { data: todos = [], isLoading } = useQuery({
		queryKey: ['todos'],
		queryFn: async () => {
			const { data, error } = await supabase.from('todos').select('*').order('order', { ascending: true });
			if (error) throw error;
			return data.map(mapTodo);
		},
	});

	// 2. Add Todo (POST)
	const addMutation = useMutation({
		mutationFn: async (newTodo) => {
			const { data, error } = await supabase.from('todos').insert(newTodo).select();
			if (error) throw error;
			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }), // 데이터 새로고침 지시
	});

	// 3. Update Todo (PUT/PATCH)
	const updateMutation = useMutation({
		mutationFn: async (updatedTodo) => {
			const { error } = await supabase.from('todos').upsert(updatedTodo);
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	// 4. Delete Todo (DELETE)
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
