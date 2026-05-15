import { message, notification } from 'antd';
import { AxiosError } from 'axios';

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  statusCode?: number;
}

export class ErrorHandler {
  static handleApiError(error: AxiosError<ApiError>, showNotification = true): string {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Dữ liệu không hợp lệ';
          if (data?.errors && data.errors.length > 0) {
            errorMessage = data.errors.map(err => err.message).join(', ');
          }
          break;
        
        case 401:
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          // Auto redirect to login handled by axios interceptor
          break;
        
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
          break;
        
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
          break;
        
        case 409:
          errorMessage = data?.message || 'Dữ liệu đã tồn tại.';
          break;
        
        case 429:
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
          break;
        
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
        
        default:
          errorMessage = data?.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }

    if (showNotification) {
      if (error.response?.status === 401) {
        notification.warning({
          message: 'Phiên đăng nhập hết hạn',
          description: errorMessage,
          placement: 'topRight',
        });
      } else {
        message.error(errorMessage);
      }
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }

    return errorMessage;
  }

  static handleValidationErrors(errors: Array<{ field: string; message: string }>) {
    const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
    
    notification.error({
      message: 'Dữ liệu không hợp lệ',
      description: errorMessages,
      placement: 'topRight',
    });
  }

  static showSuccess(message: string, description?: string) {
    notification.success({
      message,
      description,
      placement: 'topRight',
    });
  }

  static showWarning(message: string, description?: string) {
    notification.warning({
      message,
      description,
      placement: 'topRight',
    });
  }

  static showInfo(message: string, description?: string) {
    notification.info({
      message,
      description,
      placement: 'topRight',
    });
  }
}

// Utility functions for common error scenarios
export const handleNetworkError = () => {
  message.error('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
};

export const handleUnauthorized = () => {
  message.warning('Bạn cần đăng nhập để thực hiện hành động này.');
  // Redirect to login page
  window.location.href = '/login';
};

export const handleForbidden = () => {
  message.error('Bạn không có quyền truy cập tính năng này.');
};

export const handleNotFound = (resource = 'tài nguyên') => {
  message.error(`Không tìm thấy ${resource} yêu cầu.`);
};

export const handleServerError = () => {
  message.error('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: AxiosError<ApiError>, showNotification = true) => {
    return ErrorHandler.handleApiError(error, showNotification);
  };

  return {
    handleError,
    showSuccess: ErrorHandler.showSuccess,
    showWarning: ErrorHandler.showWarning,
    showInfo: ErrorHandler.showInfo,
  };
};