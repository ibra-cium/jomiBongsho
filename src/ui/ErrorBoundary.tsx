import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { Watermark } from './Watermark';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Console log for local debugging without leaking to external analytics
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isBangla =
        typeof document !== 'undefined' ? document.documentElement.lang !== 'en' : true;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen w-full bg-paper flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
        >
          <div className="w-full max-w-md bg-paper-2 border border-line rounded-2xl shadow-paper p-6 sm:p-8 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-bad-wash border border-bad/30 text-bad flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                {isBangla ? 'কিছু ভুল হয়েছে' : 'Something went wrong'}
              </h1>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                {isBangla
                  ? 'অ্যাপটিতে একটি সাময়িক সমস্যা দেখা দিয়েছে। অনুগ্রহ করে নিচের বোতাম চেপে পুনরায় চেষ্টা করুন।'
                  : 'An unexpected issue occurred. Please tap below to reload or reset the view.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center pt-2">
              <Button variant="primary" onClick={this.handleReset} className="w-full sm:w-auto">
                <RotateCcw className="w-4 h-4 mr-1.5" />
                {isBangla ? 'আবার চেষ্টা করুন' : 'Try Again'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-1.5" />
                {isBangla ? 'মূল পাতায় যান' : 'Go to Map'}
              </Button>
            </div>

            {/* Collapsible Error Detail for Debugging */}
            {this.state.error.message && (
              <div className="pt-2 border-t border-line text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-[11px] font-medium text-ink-3 hover:text-ink cursor-pointer py-1"
                >
                  <span>{isBangla ? 'কারিগরি তথ্য' : 'Technical Details'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      this.state.showDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 bg-paper-3/60 border border-line rounded-lg text-[10px] font-mono text-ink-2 whitespace-pre-wrap break-all overflow-x-auto max-h-36">
                    {this.state.error.message}
                  </pre>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <Watermark />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
