import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 알림 타입 정의
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timeout?: number;
}

// 앱 상태 타입 정의
interface AppState {
  darkMode: boolean;
  sidebarOpen: boolean;
  notifications: Notification[];
}

// 로컬 스토리지에서 다크 모드 설정 가져오기
const getInitialDarkMode = (): boolean => {
  if (!browser) return false;
  
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode !== null) {
    return savedMode === 'true';
  }
  
  // 시스템 설정 확인
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// 초기 상태
const initialState: AppState = {
  darkMode: getInitialDarkMode(),
  sidebarOpen: true,
  notifications: []
};

// 앱 스토어 생성
const createAppStore = () => {
  const { subscribe, update } = writable<AppState>(initialState);
  
  // 다크 모드 설정 적용
  if (browser) {
    const applyDarkMode = (darkMode: boolean) => {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // 초기 다크 모드 적용
    applyDarkMode(initialState.darkMode);
    
    // 스토어 구독하여 다크 모드 변경 감지
    subscribe(state => {
      applyDarkMode(state.darkMode);
      localStorage.setItem('darkMode', state.darkMode.toString());
    });
  }
  
  return {
    subscribe,
    
    // 다크 모드 토글
    toggleDarkMode: () => {
      update(state => ({ ...state, darkMode: !state.darkMode }));
    },
    
    // 사이드바 토글
    toggleSidebar: () => {
      update(state => ({ ...state, sidebarOpen: !state.sidebarOpen }));
    },
    
    // 알림 추가
    addNotification: (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString();
      const newNotification = { ...notification, id };
      
      update(state => ({
        ...state,
        notifications: [...state.notifications, newNotification]
      }));
      
      // 타임아웃 설정
      if (notification.timeout !== 0) {
        const timeout = notification.timeout || 5000;
        setTimeout(() => {
          update(state => ({
            ...state,
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, timeout);
      }
      
      return id;
    },
    
    // 알림 제거
    removeNotification: (id: string) => {
      update(state => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },
    
    // 모든 알림 제거
    clearNotifications: () => {
      update(state => ({ ...state, notifications: [] }));
    }
  };
};

// 앱 스토어 인스턴스 생성
export const appStore = createAppStore(); 