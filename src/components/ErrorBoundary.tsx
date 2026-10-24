import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Moneboard crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-800 dark:text-neutral-100 p-6">
          <div className="max-w-sm text-center space-y-3">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Moneboard hit an unexpected error. Reload the app to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
