import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EduMesh Runtime Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-page flex items-center justify-center p-6 text-center">
          <div className="glass-base max-w-md w-full p-12 space-y-8">
            <div className="w-20 h-20 bg-[rgba(255,176,176,0.20)] rounded-full flex items-center justify-center mx-auto text-rose">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold font-display tracking-tight text-primary">System Interruption</h1>
              <p className="text-secondary font-body text-sm leading-relaxed">
                EduMesh encountered an unexpected runtime exception. This is likely due to a connection drop or a malformed data payload.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="w-full py-4 rounded-pill bg-gradient-to-br from-periwinkle to-lavender text-primary font-body font-semibold shadow-[0_4px_16px_rgba(178,204,255,0.45)] hover:shadow-[0_8px_24px_rgba(178,204,255,0.60)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <RotateCcw size={18} /> Restore Platform
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs font-bold font-body uppercase tracking-widest text-muted hover:text-lavender transition-colors py-2 flex items-center justify-center gap-2"
              >
                <Home size={14} /> Back to Gateway
              </button>
            </div>

            <div className="pt-6 border-t border-[rgba(204,204,204,0.30)]">
               <p className="text-[10px] font-mono text-muted uppercase tracking-tighter">
                 Error Stack: {this.state.error?.message || 'Unknown Exception'}
               </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
