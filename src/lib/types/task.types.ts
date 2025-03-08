// 공통 필드 재사용 (공유 속성)
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  state: number; // 1: enable, 2: hide, 0: disable
}

// 태스크 인터페이스
export interface Task extends BaseEntity {
  user_id: string;
  task_name: string;
  description: string | null;
  due_date: string | null;
  receipts: Record<string, unknown>[] | null;
}

// 태스크 생성 시 필요한 데이터 타입
export interface CreateTaskDto {
  taskName: string;
  description?: string;
}

// 태스크 업데이트 시 필요한 데이터 타입
export interface UpdateTaskDto {
  task_name?: string;
  description?: string;
  due_date?: string;
  state?: number;
} 