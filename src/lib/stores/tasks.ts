import { writable } from 'svelte/store';
import { taskAPI } from '$lib/api/task';
import type { Task, CreateTaskDto, UpdateTaskDto } from '$lib/types/task.types';

// 태스크 상태 타입 정의
interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
}

// API 응답에서 받을 수 있는 태스크 데이터 타입
interface ApiTaskData {
  id?: string;
  userId?: string;
  taskName?: string;
  description?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  state?: number;
  images?: Record<string, unknown>[] | null;
  [key: string]: unknown;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null
};

const { subscribe, update } = writable(initialState);

// API 응답 데이터를 Task 인터페이스에 맞게 변환하는 함수
function mapApiTaskToTask(apiTask: ApiTaskData): Task {
  return {
    id: apiTask.id || '',
    taskName: typeof apiTask.task_name === 'string' ? apiTask.task_name : (typeof apiTask.taskName === 'string' ? apiTask.taskName : ''),
    description: typeof apiTask.description === 'string' ? apiTask.description : null,
    dueDate: typeof apiTask.due_date === 'string' ? apiTask.due_date : (typeof apiTask.dueDate === 'string' ? apiTask.dueDate : null),
    createdAt: typeof apiTask.created_at === 'string' ? apiTask.created_at : (typeof apiTask.createdAt === 'string' ? apiTask.createdAt : new Date().toISOString()),
    updatedAt: typeof apiTask.updated_at === 'string' ? apiTask.updated_at : (typeof apiTask.updatedAt === 'string' ? apiTask.updatedAt : new Date().toISOString()),
    state: typeof apiTask.state === 'number' ? apiTask.state : 1,
    images: Array.isArray(apiTask.images) ? apiTask.images : null
  };
}

export const taskStore = {
  subscribe,
  loadTasks: async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const tasks = await taskAPI.getTasks();
      
      // API 응답 데이터를 Task 인터페이스에 맞게 변환
      const mappedTasks = Array.isArray(tasks) 
        ? tasks.map(task => mapApiTaskToTask(task as ApiTaskData))
        : [];
      
      
      update(state => ({ 
        ...state, 
        tasks: mappedTasks, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error in loadTasks:', error);
      const errorMsg = error instanceof Error ? error.message : '태스크를 불러오는데 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
    }
  },
  getTaskById: async (id: string): Promise<Task> => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const task = await taskAPI.getTaskById(id);
      
      if (!task) {
        throw new Error('태스크를 찾을 수 없습니다.');
      }
      
      const mappedTask = mapApiTaskToTask(task as ApiTaskData);
      
      update(state => ({
        ...state,
        currentTask: mappedTask,
        loading: false
      }));
      
      return mappedTask;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      const errorMsg = error instanceof Error ? error.message : '태스크를 불러오는데 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      throw error;
    }
  },
  setCurrentTask: (task: Task) => {
    update(state => ({ ...state, currentTask: task }));
  },
  createTask: async (taskData: CreateTaskDto) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const task = await taskAPI.createTask(taskData);
      
      if (!task) {
        throw new Error('태스크 생성에 실패했습니다.');
      }
      
      const newTask = mapApiTaskToTask(task as ApiTaskData);
      
      update(state => ({ 
        ...state, 
        tasks: [...state.tasks, newTask], 
        loading: false 
      }));
      
      return newTask;
    } catch (error) {
      console.error('Error in createTask:', error);
      const errorMsg = error instanceof Error ? error.message : '태스크 생성에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      throw error;
    }
  },
  updateTask: async (id: string, taskData: UpdateTaskDto) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const task = await taskAPI.updateTask(id, taskData);
      
      if (!task) {
        throw new Error('태스크 업데이트에 실패했습니다.');
      }
      
      const updatedTask = mapApiTaskToTask(task as ApiTaskData);
      
      update(state => ({
        ...state,
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        loading: false
      }));
      
      return updatedTask;
    } catch (error) {
      console.error('Error in updateTask:', error);
      const errorMsg = error instanceof Error ? error.message : '태스크 업데이트에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      throw error;
    }
  },
  deleteTask: async (id: string) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await taskAPI.deleteTask(id);
      
      if (!response) {
        throw new Error('태스크 삭제에 실패했습니다.');
      }
      
      update(state => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      const errorMsg = error instanceof Error ? error.message : '태스크 삭제에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return false;
    }
  },
  clearError: () => {
    update(state => ({ ...state, error: null }));
  }
}; 