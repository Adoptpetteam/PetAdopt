import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to log this to an error reporting service
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Result
            status="500"
            title="Oops! Có lỗi xảy ra"
            subTitle="Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau."
            extra={
              <div className="space-x-4">
                <Button type="primary" onClick={this.handleReload}>
                  Tải lại trang
                </Button>
                <Button onClick={this.handleGoHome}>
                  Về trang chủ
                </Button>
              </div>
            }
          />
          
          {/* Error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-8 p-4 bg-red-50 border border-red-200 rounded max-w-2xl">
              <summary className="cursor-pointer font-semibold text-red-800">
                Chi tiết lỗi (Development)
              </summary>
              <div className="mt-2 text-sm text-red-700">
                <p><strong>Error:</strong> {this.state.error.message}</p>
                <p><strong>Stack:</strong></p>
                <pre className="whitespace-pre-wrap text-xs bg-red-100 p-2 rounded mt-1">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <p><strong>Component Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs bg-red-100 p-2 rounded mt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;