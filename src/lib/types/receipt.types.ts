import type { BaseEntity } from './task.types';

// 영수증 인터페이스
export interface Receipt extends BaseEntity {
  title: string;
  store_name: string;
  purchase_date: string;
  total_amount: number;
  image_url: string;
  image_id?: string;
  items?: ReceiptItem[];
}

// 영수증 항목 인터페이스
export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// 영수증 생성 DTO
export interface CreateReceiptDto {
  title: string;
  store_name: string;
  purchase_date: string;
  total_amount: number;
  image_id?: string;
  items?: Omit<ReceiptItem, 'id' | 'receipt_id'>[];
}

// 영수증 업데이트 DTO
export interface UpdateReceiptDto {
  title?: string;
  store_name?: string;
  purchase_date?: string;
  total_amount?: number;
  state?: number;
  items?: Omit<ReceiptItem, 'id' | 'receipt_id'>[];
} 