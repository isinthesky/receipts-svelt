import { writable } from 'svelte/store';
import { taskAPI } from '$lib/api/task';
import type { Task, CreateTaskDto, UpdateTaskDto } from '$lib/types/task.types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null
};

const { subscribe, update } = writable(initialState);

export const taskStore = {
  subscribe,
  loadTasks: async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await taskAPI.getTasks();
      
      if (!response.success) {
        throw new Error(response.message || '태스크를 불러오는데 실패했습니다.');
      }
      
      update(state => ({ 
        ...state, 
        tasks: response.data || [], 
        loading: false 
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '태스크를 불러오는데 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
    }
  },
  setCurrentTask: (task: Task) => {
    update(state => ({ ...state, currentTask: task }));
  },
  createTask: async (taskData: CreateTaskDto) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await taskAPI.createTask(taskData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || '태스크 생성에 실패했습니다.');
      }
      
      const newTask = response.data;
      
      update(state => ({ 
        ...state, 
        tasks: [...state.tasks, newTask], 
        loading: false 
      }));
      
      return newTask;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '태스크 생성에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      throw error;
    }
  },
  updateTask: async (id: string, taskData: UpdateTaskDto) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await taskAPI.updateTask(id, taskData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || '태스크 업데이트에 실패했습니다.');
      }
      
      const updatedTask = response.data;
      
      update(state => ({
        ...state,
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        loading: false
      }));
      
      return updatedTask;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '태스크 업데이트에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      throw error;
    }
  },
  deleteTask: async (id: string) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await taskAPI.deleteTask(id);
      
      if (!response.success) {
        throw new Error(response.message || '태스크 삭제에 실패했습니다.');
      }
      
      update(state => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '태스크 삭제에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return false;
    }
  },
  clearError: () => {
    update(state => ({ ...state, error: null }));
  }
}; 