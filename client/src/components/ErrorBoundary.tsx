import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { hasError: boolean; error: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: string },
  State
> {
  state: State = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-haven-red" />
          </div>
          <p className="text-base font-semibold text-haven-text mb-1.5">
            {this.props.fallback ?? 'Something went wrong'}
          </p>
          <p className="text-xs text-haven-secondary mb-5 max-w-sm font-mono bg-haven-bg px-3 py-2 rounded border border-haven-border">
            {this.state.error}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-haven-primary text-white text-xs font-medium hover:bg-haven-primary-dark transition-colors"
          >
            <RefreshCw size={12} /> Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
