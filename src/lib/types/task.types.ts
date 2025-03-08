// 공통 필드 재사용 (공유 속성)
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  state: number; // 1: enable, 2: hide, 0: disable
}

// 태스크 인터페이스
export interface Task extends BaseEntity {
  id: string;
  taskName: string;
  description: string | null;
  dueDate: string | null;
  receipts: Record<string, unknown>[] | null;
}

// 태스크 생성 시 필요한 데이터 타입
export interface CreateTaskDto {
  taskName: string;
  description?: string;
  dueDate?: string;
}

// 태스크 업데이트 시 필요한 데이터 타입
export interface UpdateTaskDto {
  task_name?: string;
  description?: string;
  due_date?: string;
  state?: number;
} 