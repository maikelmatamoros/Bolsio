import { useState, useCallback } from 'react';
import { ToastType, ToastPosition } from '../components/common/Toast';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  actionButtonText?: string;
  onAction?: () => void;
  autoHide?: boolean;
  position?: ToastPosition;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: ToastType = 'success', actionButtonText?: string, onAction?: () => void, autoHide: boolean = true, position: ToastPosition = 'top') => {
    setToast({
      visible: true,
      message,
      type,
      actionButtonText,
      onAction,
      autoHide,
      position,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};
