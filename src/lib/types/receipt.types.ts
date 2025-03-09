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


export type ProcessingStatusType = 'pending' | 'uploading' | 'processing' | 'success' | 'error' | 'cancelled';


export interface ReceiptProcessingStatus {
  status: ProcessingStatusType;
  message: string;
  data?: ProcessedReceipt;
}

// 처리된 영수증 데이터
export interface ProcessedReceipt {
  id: string;
  imageId: string;
  storeName: string;
  date: string;
  totalAmount: number;
  items: ReceiptItem[];
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  // 추가 필드들...
}

// 영수증 항목
export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}