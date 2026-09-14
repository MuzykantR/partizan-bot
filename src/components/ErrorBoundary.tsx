import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Partizan TWA Component Tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121212] text-[#F4F0EA] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-sm w-full bg-[#1A1A1C] border border-[#3A3A3D] rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#C8372D]/15 border-2 border-[#C8372D]/40 flex items-center justify-center text-[#C8372D] shadow-lg shadow-[#C8372D]/20">
              <AlertOctagon className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-wide uppercase font-mono text-[#F4F0EA]">
                Временный сбой
              </h2>
              <p className="text-xs text-[#9E9B97] leading-relaxed">
                Произошла ошибка при загрузке интерфейса. Нажмите кнопку ниже для повторной инициализации сессии.
              </p>
              {this.state.error && (
                <p className="text-[10px] font-mono text-gray-500 truncate max-w-xs mx-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full pv-button-primary py-4 text-xs font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              <span>Перезагрузить приложение</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
