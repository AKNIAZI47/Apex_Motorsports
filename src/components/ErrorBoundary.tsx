import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center glass-panel-elevated border border-white/10 rounded-2xl m-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono">
            Telemetry Feed Interrupted
          </h2>
          <p className="text-sm text-slate-400 max-w-md mt-2 font-mono">
            {this.state.error?.message || 'A telemetry rendering component encountered an unexpected error.'}
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white font-bold text-xs font-mono shadow-lg shadow-[#ff1744]/20 hover:scale-105 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Telemetry Stream</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
