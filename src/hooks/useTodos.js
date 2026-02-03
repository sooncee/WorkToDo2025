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
	const mapToDB = (todo) => {
		// 1. 원본 객체의 모든 필드를 유지 (user_id 등 숨겨진 컬럼 보존)
		const { createdAt: _ca, completedAt, scheduledDate, ...rest } = todo;
		const mapped = {
			...rest,
			completed_at: completedAt,
			scheduled_date: normalizeDate(scheduledDate),
		};

		// 2. DB 시스템 컬럼 제거 (Identity/Generated 필드 에러 방지)
		// 수정 시에는 update().eq('id', id)에서 id를 사용하므로 payload에서는 제외합니다.
		delete mapped.id;
		delete mapped.created_at;

		// 3. undefined 필드 제거
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
			const { error } = await supabase.from('todos').update(dbTodo).eq('id', updatedTodo.id);
			if (error) {
				console.error('Update Error:', error);
				throw error;
			}
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	// 3. Add
	const addMutation = useMutation({
		mutationFn: async (newTodo) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('로그인이 필요합니다.');
			}

			const dbTodo = {
				...mapToDB(newTodo),
				user_id: user.id, // RLS 정책 준수를 위해 user_id 추가
			};

			const { error } = await supabase.from('todos').insert(dbTodo);
			if (error) {
				console.error('Add Error:', error);
				throw error;
			}
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
	});

	// 4. Delete
	const deleteMutation = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from('todos').delete().eq('id', id);
			if (error) {
				console.error('Delete Error:', error);
				throw error;
			}
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
